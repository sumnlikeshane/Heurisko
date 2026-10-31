// Isolated Part 4 integration candidate. No renderer, network, analyzer or writes.
import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import { join, resolve, parse } from 'node:path';
import { createHash } from 'node:crypto';
import type { InvestigationReport, EvidenceRecord, EvidenceId, Stage } from '../../../packages/contracts/dist/index.js';
import { boundedFile, decodeReport, encodeReport, sha256, terminalText, textOrNull, metadataJSON, BoundaryError, type ValidationContext } from '../../../packages/core/dist/index.js';

export type Immutable<T> = T extends object ? { readonly [K in keyof T]: Immutable<T[K]> } : T;
export function immutable<T>(value:T):Immutable<T> {
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) immutable(item);
    Object.freeze(value);
  }
  return value as Immutable<T>;
}
// Use for every untrusted string at the eventual renderer boundary. Width,
// elision, glyphs and clipboard policy belong to the visual integration.
export function inertText(value:string, multiline=false):string {
  return Array.from(terminalText(value), c => {
    if (c === '\n') return multiline ? c : '\\n';
    if (c === '\t') return '\\t';
    const code=c.charCodeAt(0);
    return c.length===1 && code>=0xd800 && code<=0xdfff ? '\\u'+code.toString(16) : c;
  }).join('');
}
export const readerLimits=Object.freeze({reportBytes:8*1024*1024, blobBytes:32*1024*1024, pageBytes:64*1024, recordBytes:256*1024});
export interface ByteRange { startByte:number; endByte:number }
export interface ReadWindow { offset?:number; length?:number; signal?:AbortSignal }
export type ReadReason = 'UNKNOWN_EVIDENCE'|'NOT_EXPORTED'|'UNAVAILABLE'|'INVALID_REF'|'MISSING_BLOB'|'HASH_MISMATCH'|'READ_LIMIT'|'READ_FAILED'|'CANCELLED'|'INVALID_RANGE'|'LINE_RANGE_UNSUPPORTED'|'SIDE_REQUIRED'|'SIDE_MISMATCH'|'UNSUPPORTED_RECORD'|'INVALID_RECORD'|'UNBOUND_MEMBER'|'SIDE_NOT_RECORDED';
export interface MetadataOnly {
  kind:'metadata_only'; reason:ReadReason;
  evidence?:Immutable<EvidenceRecord>;
}
export interface ContentRead {
  kind:'content'; evidence:Immutable<EvidenceRecord>; member?:Immutable<EvidenceRecord>;
  address:'record_content'|'recorded_byte_range'; contentRef:string;
  recordedRange:ByteRange; displayedRange:ByteRange; totalBytes:number;
  truncated:boolean; encoding:'utf8'|'base64'; bytesBase64:string; inertText?:string;
}
export type EvidenceRead = MetadataOnly|ContentRead;
class ReadError extends Error { constructor(readonly reason:ReadReason) { super(reason); } }
export class ReportOpenError extends Error {
  constructor(readonly code:'REPORT_READ_FAILED'|'REPORT_READ_LIMIT_OR_TYPE'|'REPORT_ENCODING_INVALID') {super(code);}
}
const digestPattern=/^sha256:[a-f0-9]{64}$/;
function cancelled(signal?:AbortSignal) { if(signal?.aborted) throw new ReadError('CANCELLED'); }
function validRange(range:ByteRange):boolean {
  return Number.isSafeInteger(range.startByte) && Number.isSafeInteger(range.endByte) && range.startByte>=0 && range.endByte>=range.startByte;
}
async function directoryChain(path:string) {
  const target=resolve(path);let current=parse(target).root;
  for(const part of target.slice(current.length).split('/').filter(Boolean)) {
    current=join(current,part);const info=await fs.lstat(current);
    if(!info.isDirectory() || info.isSymbolicLink()) throw new ReadError('READ_FAILED');
  }
}
// Hash the whole bounded blob before releasing any display bytes. Memory holds
// only a page plus the stream buffer, including for large/minified/binary files.
// No locator path, URL or package metadata selects an operating-system path.
async function blobWindow(root:string, ref:string, range:ByteRange|undefined, window:ReadWindow, outputLimit:number) {
  cancelled(window.signal);
  if(!digestPattern.test(ref)) throw new ReadError('INVALID_REF');
  const offset=window.offset??0,length=window.length??outputLimit;
  if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(length)||length<1||length>outputLimit) throw new ReadError('INVALID_RANGE');
  const blobs=join(resolve(root),'blobs');await directoryChain(blobs);cancelled(window.signal);
  const handle=await fs.open(join(blobs,ref.slice(7)),constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
  try {
    const stat=await handle.stat();
    if(!stat.isFile() || stat.size>readerLimits.blobBytes) throw new ReadError('READ_LIMIT');
    const span=range??{startByte:0,endByte:stat.size};
    if(!validRange(span)||span.endByte>stat.size||offset>span.endByte-span.startByte) throw new ReadError('INVALID_RANGE');
    const start=span.startByte+offset,end=Math.min(span.endByte,start+length);
    const digest=createHash('sha256'),chunks:Buffer[]=[];let consumed=0;
    for await(const chunk of handle.createReadStream({autoClose:false,highWaterMark:64*1024,signal:window.signal})) {
      cancelled(window.signal);const bytes=Buffer.from(chunk);const next=consumed+bytes.length;
      if(next>readerLimits.blobBytes) throw new ReadError('READ_LIMIT');
      digest.update(bytes);
      if(next>start && consumed<end) chunks.push(Buffer.from(bytes.subarray(Math.max(0,start-consumed),Math.min(bytes.length,end-consumed))));
      consumed=next;
    }
    cancelled(window.signal);
    if(consumed!==stat.size || 'sha256:'+digest.digest('hex')!==ref) throw new ReadError('HASH_MISMATCH');
    return {bytes:Buffer.concat(chunks),recordedRange:span,displayedRange:{startByte:start,endByte:end},totalBytes:consumed,truncated:start>span.startByte||end<span.endByte};
  } finally {await handle.close();}
}
function reasonFor(error:unknown, signal?:AbortSignal):ReadReason {
  if(signal?.aborted) return 'CANCELLED';
  if(error instanceof ReadError) return error.reason;
  return (error as NodeJS.ErrnoException)?.code==='ENOENT' ? 'MISSING_BLOB' : 'READ_FAILED';
}

export class ReportReader {
  readonly report:Immutable<InvestigationReport>;
  readonly reportContentRef:string;
  readonly historical=true; // Opening a captured report never refreshes a check.
  readonly #root:string;
  readonly #evidence:Map<string,Immutable<EvidenceRecord>>;
  private constructor(report:InvestigationReport, raw:string, storeRoot:string) {
    this.report=immutable(report);this.reportContentRef=sha256(raw);this.#root=resolve(storeRoot);
    this.#evidence=new Map(this.report.bundle.evidence.map(e=>[e.evidenceId,e]));
    Object.freeze(this);
  }
  static async openJSON(raw:string,storeRoot:string,context:ValidationContext={}) {
    const report=await decodeReport(raw,context);return new ReportReader(report,raw,storeRoot);
  }
  static async openFile(path:string,storeRoot:string,context:ValidationContext={}) {
    if(context.signal?.aborted) throw new BoundaryError('CANCELLED');
    let bytes:Buffer;
    try {bytes=await boundedFile(resolve(path),readerLimits.reportBytes);}
    catch(error) {throw new ReportOpenError((error as {code?:string})?.code==='FILE_LIMIT_OR_TYPE'?'REPORT_READ_LIMIT_OR_TYPE':'REPORT_READ_FAILED');}
    if(context.signal?.aborted) throw new BoundaryError('CANCELLED');
    let raw:string;
    try {raw=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}
    catch {throw new ReportOpenError('REPORT_ENCODING_INVALID');}
    return this.openJSON(raw,storeRoot,context);
  }
  static async fromReport(report:InvestigationReport,storeRoot:string,context:ValidationContext={}) {
    // encodeReport snapshots before awaiting validation; no caller mutation race.
    return this.openJSON(await encodeReport(report,context),storeRoot,context);
  }
  evidence(id:string) {return this.#evidence.get(id);}
  #metadata(reason:ReadReason,evidence?:Immutable<EvidenceRecord>):MetadataOnly {return {kind:'metadata_only',reason,...(evidence?{evidence}:{})};}
  async #content(evidence:Immutable<EvidenceRecord>, range:ByteRange|undefined, window:ReadWindow, address:ContentRead['address'], member?:Immutable<EvidenceRecord>):Promise<EvidenceRead> {
    const record=member??evidence;
    if(window.signal?.aborted) return this.#metadata('CANCELLED',evidence);
    if(record.contentState==='not_exported') return this.#metadata('NOT_EXPORTED',evidence);
    if(record.contentState==='unavailable') return this.#metadata('UNAVAILABLE',evidence);
    if(!record.contentRef||record.contentRef!==record.contentSha256) return this.#metadata('INVALID_REF',evidence);
    try {
      const {bytes,...page}=await blobWindow(this.#root,record.contentRef,range,window,readerLimits.pageBytes);
      const text=textOrNull(bytes);
      return {kind:'content',evidence,...(member?{member}:{}),address,contentRef:record.contentRef,...page,encoding:text===null?'base64':'utf8',bytesBase64:bytes.toString('base64'),...(text===null?{}:{inertText:inertText(text,true)})};
    } catch(error) {return this.#metadata(reasonFor(error,window.signal),evidence);}
  }
  async readEvidence(id:string,window:ReadWindow={}):Promise<EvidenceRead> {
    const evidence=this.evidence(id);if(!evidence) return this.#metadata('UNKNOWN_EVIDENCE');
    if(window.signal?.aborted) return this.#metadata('CANCELLED',evidence);
    const loc=evidence.locator;
    if(loc.startByte!==undefined&&loc.endByte!==undefined) return this.#content(evidence,{startByte:loc.startByte,endByte:loc.endByte},window,'recorded_byte_range');
    if(loc.startLine!==undefined||loc.endLine!==undefined||loc.startByte!==undefined||loc.endByte!==undefined) return this.#metadata('LINE_RANGE_UNSUPPORTED',evidence);
    return this.#content(evidence,undefined,window,'record_content');
  }
  // S2/S3 retain JSON delta records as evidence content. Their locator addresses
  // that RECORD, not a source-code span. Resolve only known, versioned records
  // and require the target member to be bound into the same report/change.
  async readCitation(id:string,side?:'artifact'|'source',window:ReadWindow={}):Promise<EvidenceRead> {
    const evidence=this.evidence(id);if(!evidence) return this.#metadata('UNKNOWN_EVIDENCE');
    if(window.signal?.aborted) return this.#metadata('CANCELLED',evidence);
    if(!['manifest_delta','raw_diff'].includes(evidence.kind)) {
      if(side&&evidence.side!==side) return this.#metadata('SIDE_MISMATCH',evidence);
      return this.readEvidence(id,window);
    }
    if(!side) return this.#metadata('SIDE_REQUIRED',evidence);
    if(window.signal?.aborted) return this.#metadata('CANCELLED',evidence);
    if(evidence.contentState!=='retained') return this.#metadata(evidence.contentState==='not_exported'?'NOT_EXPORTED':'UNAVAILABLE',evidence);
    if(!evidence.contentRef||evidence.contentRef!==evidence.contentSha256) return this.#metadata('INVALID_REF',evidence);
    try {
      const page=await blobWindow(this.#root,evidence.contentRef,undefined,{signal:window.signal},readerLimits.recordBytes);
      if(page.truncated) return this.#metadata('READ_LIMIT',evidence);
      let data:Record<string,any>;
      try {data=metadataJSON(page.bytes);} catch {return this.#metadata('INVALID_RECORD',evidence);}
      let ref:unknown,range:ByteRange,path:unknown;
      if(evidence.kind==='manifest_delta'&&evidence.observationMethod==='strict-json-value-byte-spans-v1'&&data.version==='heurisko-manifest-delta-v1') {
        if(!data[side]) return this.#metadata('SIDE_NOT_RECORDED',evidence);
        ref=data[side+'ContentRef'];range={startByte:data[side].startByte,endByte:data[side].endByte};
      } else if(evidence.kind==='raw_diff'&&evidence.observationMethod==='common-prefix-suffix-byte-span-v1'&&data.version==='heurisko-raw-diff-v1') {
        if(!data[side]?.contentRef) return this.#metadata('SIDE_NOT_RECORDED',evidence);
        ref=data[side].contentRef;path=data[side].path;range=data[side].changedSpan;
      } else return this.#metadata('UNSUPPORTED_RECORD',evidence);
      if(typeof ref!=='string'||!range||!validRange(range)) return this.#metadata('INVALID_RECORD',evidence);
      const linkedIds=new Set(this.report.bundle.changes.filter(c=>c.evidenceIds.includes(id as EvidenceId)).flatMap(c=>c.evidenceIds));
      const members=[...this.#evidence.values()].filter(e=>e.kind===side+'_member'&&e.side===side&&e.contentSha256===ref&&(e.contentRef===undefined||e.contentRef===ref)&&linkedIds.has(e.evidenceId)&&(path===undefined||e.locator.path===path));
      if(members.length!==1) return this.#metadata('UNBOUND_MEMBER',evidence);
      return this.#content(evidence,range,window,'recorded_byte_range',members[0]);
    } catch(error) {return this.#metadata(reasonFor(error,window.signal),evidence);}
  }
}

export const stages:readonly Stage[]=Object.freeze(['resolve_artifact','acquire','source','provenance','inventory','compare','build','heuristics','ai','persist']);
// Facts outside the G0 object. No outcome, finding, stage or ID is rewritten.
export function reportFacts(reader:ReportReader) {
  const r=reader.report,heuristics=r.analysis.stages.filter(s=>s.stage==='heuristics');
  const evaluated=heuristics.length===1&&heuristics[0]!.status==='complete';
  return immutable({reportId:r.reportId,reportContentRef:reader.reportContentRef,historical:reader.historical,fixtureKind:r.fixtureKind,
    createdAt:r.createdAt,captureTime:r.bundle.artifact.captureTime,artifact:r.bundle.artifact,configuration:r.analysisConfigFingerprint,
    outcomes:r.outcomes,sourceCandidates:r.bundle.sourceCandidates,hasRecordedSourceConflicts:r.bundle.sourceCandidates.some(c=>c.conflicts.length>0),
    findings:r.analysis.findings,findingsEvaluation:evaluated?'recorded_for_examined_scope':'not_evaluated_or_partial',
    examinedScopeFindingCount:evaluated?r.analysis.findings.length:null,recordedFindingCount:r.analysis.findings.length,
    coverage:r.bundle.coverage,coverageFraction:null, // No compatible universal denominator in G0.
    stageRecords:[...r.bundle.stages,...r.analysis.stages],aiState:r.analysis.aiState,interpretations:r.analysis.interpretations});
}
