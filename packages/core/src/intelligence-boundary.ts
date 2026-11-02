import { TextDecoder } from 'node:util';
import type { AnalysisOptions, AnalysisResults, EvidenceBundle, EvidenceId, EvidenceRecord, FileChange, StageError } from '@heurisko/contracts';
import { AnalysisAdapterError, analysisModuleIdentity, type AnalysisModule } from './adapter.js';
import { manifestFields } from './comparison.js';
import { canonicalJSON, sha256 } from './identity.js';
import type { EvidenceStore } from './storage.js';
import { safetyProfile } from './safety.js';
import { byteRelationship, localMapReference, sourceMapData, RELATIONSHIP_VERSION } from './relationships.js';

export const INTELLIGENCE_BOUNDARY_VERSION = 'heurisko-intelligence-content-v3';
export const INTELLIGENCE_BOUNDARY_LIMITS = Object.freeze({deltaBytes:16*1024,records:128,totalBytes:1024*1024,memberBytes:256*1024});
export interface ResolvedEvidenceContent { evidenceId:EvidenceId; contentRef:string; text:string }
export type ReviewedAnalyzeEvidence = (bundle:Readonly<EvidenceBundle>,options:AnalysisOptions,resolvedContent?:readonly ResolvedEvidenceContent[])=>Promise<AnalysisResults>;
export interface IntelligenceBoundaryOptions {
  identity:Omit<AnalysisModule,'analyzeEvidence'>;
  store:Pick<EvidenceStore,'get'>;
  analyzeEvidence:ReviewedAnalyzeEvidence;
  signal?:AbortSignal;
  /** An operator-supplied absolute epoch-millisecond deadline, never package data. */
  deadlineAt?:number;
}
class ContentError extends Error { constructor(readonly code:string){super(code);} }
const fail=(code:string):never=>{throw new ContentError(code);};
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;
function freeze<T>(v:T):T {if(v&&typeof v==='object'){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
function strictObject(bytes:Buffer):{text:string;value:Record<string,unknown>} {
  let text:string;try{text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}catch{ return fail('CONTENT_ENCODING_INVALID'); }
  if(text.charCodeAt(0)===0xfeff)return fail('CONTENT_BOM_UNSUPPORTED');
  const value=manifestFields(bytes).get('')?.value;
  if(!object(value))return fail('CONTENT_JSON_INVALID');
  return {text,value};
}
const exactKeys=(v:Record<string,unknown>,keys:readonly string[])=>Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));
type Field={value:unknown;startByte:number;endByte:number};
function side(v:unknown):Field|null {
  if(v===null)return null;
  if(!object(v)||!exactKeys(v,['value','startByte','endByte'])||!Number.isSafeInteger(v.startByte)||!Number.isSafeInteger(v.endByte)||Number(v.startByte)<0||Number(v.endByte)<=Number(v.startByte)||Number(v.endByte)>INTELLIGENCE_BOUNDARY_LIMITS.memberBytes)return fail('DELTA_VALUE_SPAN_INVALID');
  return v as unknown as Field;
}
function sameValue(a:unknown,b:unknown):boolean {
  // Validate the shared supported value domain, but retain parsed property
  // order: conditional exports can distinguish import/default ordering.
  try{canonicalJSON(a);canonicalJSON(b);return JSON.stringify(a)===JSON.stringify(b);}catch{return fail('DELTA_VALUE_UNSUPPORTED');}
}
// Dotted keys are only the producer's unambiguous simple-key shorthand. RFC
// 6901 locators retain punctuation, arrays and condition-map keys exactly.
export function manifestPointer(key:string):string|undefined {
  if(key.startsWith('/')) {
    if(/~(?![01])/.test(key))return undefined;
    return key;
  }
  if(!/^[A-Za-z_$][A-Za-z0-9_$-]*(?:\.[A-Za-z_$][A-Za-z0-9_$-]*)*$/.test(key))return undefined;
  return '/'+key.split('.').join('/');
}
const admittedRoots=new Set(['scripts','main','module','types','typings','exports','bin','browser']);
const manifestRecord=(e:EvidenceRecord|undefined)=>{
  if(e?.kind!=='manifest_delta'||typeof e.locator.metadataKey!=='string')return false;
  const pointer=manifestPointer(e.locator.metadataKey);
  return !!pointer&&pointer!=='/scripts'&&admittedRoots.has(pointer.split('/')[1]!);
};

/** Trusted team-code adapter. It only resolves admitted store references; it has no acquisition/provider/path interface. */
export function createIntelligenceBoundary(config:IntelligenceBoundaryOptions):AnalysisModule {
  const identity=Object.freeze({...config.identity});
  const store=config.store,teamAnalyze=config.analyzeEvidence,signal=config.signal,operatorDeadline=config.deadlineAt;
  if(typeof teamAnalyze!=='function'||!store||typeof store.get!=='function'||(operatorDeadline!==undefined&&!Number.isFinite(operatorDeadline)))throw new Error('INTELLIGENCE_BOUNDARY_CONFIGURATION_INVALID');
  const analyzeEvidence:AnalysisModule['analyzeEvidence']=async(bundle,options)=>{
    // Snapshot all caller-owned values before any asynchronous store work.
    const input=freeze(structuredClone(bundle)),settings=freeze(structuredClone(options));
    const deadline=Math.min(operatorDeadline??Infinity,Date.now()+safetyProfile.analysis.timeoutMs);
    const check=()=>{if(signal?.aborted)throw new AnalysisAdapterError('CANCELLED');if(Date.now()>=deadline)throw new AnalysisAdapterError('ANALYSIS_TIMEOUT');};
    check();
    const records=new Map<EvidenceId,EvidenceRecord>(),duplicates=new Set<EvidenceId>();
    for(const e of input.evidence){if(records.has(e.evidenceId))duplicates.add(e.evidenceId);records.set(e.evidenceId,e);}
    const owners=new Map<EvidenceId,number>();
    for(const change of input.changes)for(const id of change.evidenceIds)if(manifestRecord(records.get(id)))owners.set(id,(owners.get(id)??0)+1);
    const resolved:ResolvedEvidenceContent[]=[],resolvedIds=new Set<EvidenceId>(),reasons=new Map<EvidenceId,string>();
    const errors:StageError[]=[],limitations:string[]=[];
    const unresolved=(id:EvidenceId|string,reason:string)=>{
      if(reasons.has(id as EvidenceId))return;
      reasons.set(id as EvidenceId,reason);
      const detail=records.get(id as EvidenceId)?.observationMethod===RELATIONSHIP_VERSION?'Static relationship evidence remains unresolved.':'Exact manifest old/new values and direction remain unresolved.';
      const message=`${INTELLIGENCE_BOUNDARY_VERSION}: ${id} / ${reason}. ${detail}`;
      limitations.push(message);errors.push({stage:'heuristics',code:'INTELLIGENCE_CONTENT_UNRESOLVED',message,affectedScope:id,retryable:false});
    };
    let totalBytes=0;
    const cache=new Map<string,Buffer>();
    const read=async(e:EvidenceRecord,max:number):Promise<Buffer>=>{
      check();
      if(e.contentState!=='retained'||!e.contentRef||e.contentRef!==e.contentSha256||!/^sha256:[a-f0-9]{64}$/.test(e.contentRef))return fail('CONTENT_REFERENCE_UNAVAILABLE');
      const prior=cache.get(e.contentRef);if(prior){if(prior.length>max)return fail('CONTENT_RECORD_LIMIT');check();return prior;}
      const remaining=INTELLIGENCE_BOUNDARY_LIMITS.totalBytes-totalBytes;if(remaining<=0)return fail('CONTENT_TOTAL_LIMIT');
      // Charge the entire allowed read on failure too: a hash failure may occur
      // after the store has already read all bytes. Successful reads refund slack.
      const allowed=Math.min(max,remaining);totalBytes+=allowed;
      const received=await store.get(e.contentRef,allowed);check();
      if(received.length>max)return fail('CONTENT_RECORD_LIMIT');
      if(received.length>allowed)return fail('CONTENT_TOTAL_LIMIT');
      totalBytes-=allowed-received.length;
      const bytes=Buffer.from(received);
      if(sha256(bytes)!==e.contentRef)return fail('BLOB_HASH_MISMATCH');
      cache.set(e.contentRef,bytes);return bytes;
    };
    const linkedMember=async(change:FileChange,which:'source'|'artifact',ref:unknown,pointer:string,expected:Field|null)=>{
      if(ref===null)return fail('MEMBER_ABSENCE_UNPROVEN');
      if(typeof ref!=='string'||!/^sha256:[a-f0-9]{64}$/.test(ref))return fail('MEMBER_REFERENCE_INVALID');
      const path=which==='source'?change.sourcePath:change.artifactPath;
      if(!path||!(path==='package.json'||path.endsWith('/package.json')))return fail('MEMBER_PATH_INVALID');
      const members=change.evidenceIds.map(id=>records.get(id)).filter((e):e is EvidenceRecord=>!!e&&e.kind===`${which}_member`&&e.side===which&&e.locator.path===path&&e.contentRef===ref);
      if(members.length!==1||duplicates.has(members[0]!.evidenceId))return fail('MEMBER_BINDING_MISMATCH');
      const member=members[0]!;
      if(member.observationMethod!=='raw-member-sha256-v1'||member.locator.startByte!==0)return fail('MEMBER_SCOPE_INVALID');
      const bytes=await read(member,INTELLIGENCE_BOUNDARY_LIMITS.memberBytes);
      if(member.locator.endByte!==bytes.length)return fail('MEMBER_SCOPE_INVALID');
      strictObject(bytes);const fields=manifestFields(bytes),actual=fields.get(pointer);
      if(pointer.startsWith('/scripts/')&&expected!==null&&!object(fields.get('/scripts')?.value))return fail('SCRIPT_PARENT_UNSUPPORTED');
      if(expected===null){if(fields.has(pointer))return fail('DELTA_ABSENCE_MISMATCH');}
      else if(!actual||actual.startByte!==expected.startByte||actual.endByte!==expected.endByte||!sameValue(actual.value,expected.value))return fail('DELTA_MEMBER_VALUE_MISMATCH');
    };
    const seen=new Set<EvidenceId>();let admitted=0,limitReached=false;
    outer:for(const change of input.changes){
      if(change.status==='identical'||change.rawEquality==='equal')continue;
      for(const id of change.evidenceIds){
        const e=records.get(id);if(!manifestRecord(e)||seen.has(id))continue;seen.add(id);
        if(admitted++>=INTELLIGENCE_BOUNDARY_LIMITS.records){unresolved('manifest-delta-record-limit','CONTENT_RECORD_COUNT_LIMIT');limitReached=true;break outer;}
        try{
          check();
          if(!e)throw new ContentError('CONTENT_REFERENCE_UNAVAILABLE');
          if(duplicates.has(id))fail('DUPLICATE_EVIDENCE_ID');
          if(owners.get(id)!==1)fail('DELTA_CHANGE_BINDING_AMBIGUOUS');
          const key=e.locator.metadataKey!;
          if(e.side!=='both'||e.locator.path!=='package.json'||e.observationMethod!=='strict-json-value-byte-spans-v1'||key.length>1024)fail('DELTA_SCOPE_INVALID');
          const bytes=await read(e,INTELLIGENCE_BOUNDARY_LIMITS.deltaBytes),parsed=strictObject(bytes),delta=parsed.value;
          const expectedPointer=manifestPointer(key)!;
          if(!exactKeys(delta,['version','pointer','source','artifact','sourceContentRef','artifactContentRef'])||delta.version!=='heurisko-manifest-delta-v1'||delta.pointer!==expectedPointer)fail('DELTA_POINTER_OR_VERSION_MISMATCH');
          const source=side(delta.source),artifact=side(delta.artifact);
          if((source===null&&artifact===null)||(source!==null&&artifact!==null&&sameValue(source.value,artifact.value)))fail('DELTA_VALUES_UNCHANGED');
          await linkedMember(change,'source',delta.sourceContentRef,expectedPointer,source);
          await linkedMember(change,'artifact',delta.artifactContentRef,expectedPointer,artifact);
          check();resolved.push(Object.freeze({evidenceId:id,contentRef:e.contentRef!,text:parsed.text}));resolvedIds.add(id);
        }catch(error){
          if(error instanceof AnalysisAdapterError)throw error;
          const code=error instanceof ContentError?error.code:error instanceof Error&&/^[A-Z_]+$/.test(error.message)?error.message:'CONTENT_READ_FAILED';
          unresolved(id,code);
        }
      }
    }
    // Relationship notes are producer observations. Recompute their narrowly
    // named relationship using only hash-bound members owned by the change.
    // They share the existing read/count/aggregate budgets with manifest data.
    for(const change of input.changes)for(const id of change.evidenceIds) {
      const note=records.get(id);
      if(note?.kind!=='analysis_note'||note.observationMethod!==RELATIONSHIP_VERSION||seen.has(id))continue;
      seen.add(id);
      try {
        if(admitted++>=INTELLIGENCE_BOUNDARY_LIMITS.records)fail('CONTENT_RECORD_COUNT_LIMIT');
        if(duplicates.has(id)||input.changes.filter(c=>c.evidenceIds.includes(id)).length!==1)fail('RELATIONSHIP_OWNER_INVALID');
        const bytes=await read(note,INTELLIGENCE_BOUNDARY_LIMITS.deltaBytes),data=strictObject(bytes).value;
        if(data.version!==RELATIONSHIP_VERSION)fail('RELATIONSHIP_VERSION_INVALID');
        const member=async(memberId:unknown,which:'source'|'artifact',ref:unknown)=>{
          const e=typeof memberId==='string'?records.get(memberId as EvidenceId):undefined;
          if(!e||duplicates.has(e.evidenceId)||!change.evidenceIds.includes(e.evidenceId)||e.kind!==which+'_member'||e.side!==which||e.contentRef!==ref||e.observationMethod!=='raw-member-sha256-v1'||e.locator.startByte!==0) return fail('RELATIONSHIP_MEMBER_UNBOUND');
          const content=await read(e,INTELLIGENCE_BOUNDARY_LIMITS.memberBytes);
          if(e.locator.endByte!==content.length)fail('MEMBER_SCOPE_INVALID');
          return {record:e,content};
        };
        const artifact=await member(data.artifactEvidenceId,'artifact',data.artifactRef);
        if(artifact.record.locator.path!==change.artifactPath)fail('RELATIONSHIP_PATH_MISMATCH');
        if(data.rule==='crlf-only'||data.rule==='strict-json-formatting') {
          if(!exactKeys(data,['version','rule','sourceEvidenceId','artifactEvidenceId','sourceRef','artifactRef']))fail('RELATIONSHIP_SHAPE_INVALID');
          const source=await member(data.sourceEvidenceId,'source',data.sourceRef);
          if(source.record.locator.path!==change.sourcePath||byteRelationship(source.content,artifact.content)!==data.rule)fail('RELATIONSHIP_MISMATCH');
        }else if(data.rule==='sourcemap-retained-source') {
          if(!exactKeys(data,['version','rule','artifactEvidenceId','artifactRef','mapEvidenceId','mapRef','matches','totalSources']))fail('RELATIONSHIP_SHAPE_INVALID');
          const map=await member(data.mapEvidenceId,'artifact',data.mapRef),name=localMapReference(artifact.content);
          const path=artifact.record.locator.path!;
          if(!name||map.record.locator.path!==path.slice(0,path.lastIndexOf('/')+1)+name)fail('RELATIONSHIP_MAP_PATH_INVALID');
          const parsed=sourceMapData(map.content);
          if(!parsed||parsed.sources.length!==data.totalSources||!Array.isArray(data.matches)||!data.matches.length||data.matches.length>128)return fail('RELATIONSHIP_MAP_INVALID');
          const indexes=new Set();
          for(const match of data.matches) {
            if(!object(match)||!exactKeys(match,['index','sourceEvidenceId','sourceRef'])||!Number.isSafeInteger(match.index)||Number(match.index)<0||Number(match.index)>=parsed.sourcesContent.length||indexes.has(match.index))return fail('RELATIONSHIP_MAP_INVALID');
            indexes.add(match.index);
            const source=await member(match.sourceEvidenceId,'source',match.sourceRef);
            if(!source.content.equals(Buffer.from(parsed.sourcesContent[Number(match.index)]!)))fail('RELATIONSHIP_MISMATCH');
          }
        }else fail('RELATIONSHIP_RULE_UNSUPPORTED');
        resolved.push(Object.freeze({evidenceId:id,contentRef:note.contentRef!,text:strictObject(bytes).text}));resolvedIds.add(id);
      }catch(error){
        if(error instanceof AnalysisAdapterError)throw error;
        unresolved(id,error instanceof ContentError?error.code:'RELATIONSHIP_READ_FAILED');
      }
    }
    check();
    const result=structuredClone(await teamAnalyze(input,settings,freeze(resolved)));check();
    if(errors.length){
      result.limitations.push(...limitations);
      const stage=result.stages.find(s=>s.stage==='heuristics');
      if(stage){if(stage.status!=='failed')stage.status='incomplete';stage.errors.push(...errors);}
      else result.stages.push({stage:'heuristics',status:'incomplete',errors});
      for(const finding of result.findings){
        if(!['heurisko.manifest.lifecycle-script-change','heurisko.manifest.script-change','heurisko.manifest.entrypoint-change'].includes(finding.ruleId))continue;
        const id=finding.evidenceIds.find(id=>manifestRecord(records.get(id))&&!resolvedIds.has(id));if(!id)continue;
        const key=records.get(id)!.locator.metadataKey!;
        finding.limitations.push(`Unqualified module wording (not accepted as direction evidence): ${finding.observation}`,`${INTELLIGENCE_BOUNDARY_VERSION}: ${id} / ${reasons.get(id)??(limitReached?'CONTENT_RECORD_COUNT_LIMIT':'CONTENT_NOT_RESOLVED')}.`);
        finding.observation=`Manifest key ${key} has a producer-recorded difference; its exact old/new values and direction remain unresolved.`;
        finding.evidenceConfidence='limited';finding.explanationStrength='unexplained';finding.severity='undetermined';finding.reviewPriority='low';
      }
    }
    return result;
  };
  const module:AnalysisModule={...identity,analyzeEvidence};analysisModuleIdentity(module);return Object.freeze(module);
}
