// Review-only bridge for an explicitly selected trusted team module. No product loader.
import * as fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {EvidenceStore,boundedFile,canonicalJSON,decodeReportBytes,metadataJSON,runAnalysis,sha256,writeImmutable} from '../packages/core/dist/index.js';
import {reviewedIdentity,checkModelOffAnalysis} from './check-final-module-intake.mjs';

export const manifestIntakeLimits=Object.freeze({records:64,recordBytes:16384,memberBytes:256*1024,totalBytes:1024*1024});
const cancelled=signal=>{if(signal?.aborted)throw Error('CANCELLED');};
const validRef=value=>typeof value==='string'&&/^sha256:[a-f0-9]{64}$/.test(value);
const same=(a,b)=>canonicalJSON(a)===canonicalJSON(b);
function property(document,key) {
  if(!document||typeof document!=='object'||Array.isArray(document)||!Object.hasOwn(document,'scripts'))return {present:false};
  const scripts=document.scripts;
  return scripts&&typeof scripts==='object'&&!Array.isArray(scripts)&&Object.hasOwn(scripts,key)?{present:true,value:scripts[key]}:{present:false};
}

// Only known admitted delta/member refs are read. Null is accepted as absence
// only after the retained corresponding member independently confirms it.
export async function resolveScriptDeltas(bundle,store,{signal,limits=manifestIntakeLimits}={}) {
  cancelled(signal);const resolved=[],omissions=[],cache=new Map();let totalBytes=0,selected=0;
  const read=async(ref,limit)=>{
    cancelled(signal);if(!validRef(ref))throw Error('INVALID_CONTENT_REF');
    let bytes=cache.get(ref);
    if(!bytes){bytes=await store.get(ref,limit);cancelled(signal);if(bytes.length>limit)throw Error('CONTENT_BYTE_LIMIT');if(sha256(bytes)!==ref)throw Error('CONTENT_HASH_MISMATCH');totalBytes+=bytes.length;if(totalBytes>limits.totalBytes)throw Error('TOTAL_CONTENT_BYTE_LIMIT');cache.set(ref,bytes);}
    if(bytes.length>limit)throw Error('CONTENT_BYTE_LIMIT');return bytes;
  };
  const decode=bytes=>new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);
  for(const delta of bundle.evidence) {
    cancelled(signal);
    if(delta.kind!=='manifest_delta'||!/^scripts\.[A-Za-z0-9_-]+$/.test(delta.locator.metadataKey??''))continue;
    const changes=bundle.changes.filter(c=>c.status!=='identical'&&c.rawEquality!=='equal'&&c.evidenceIds.includes(delta.evidenceId));
    if(!changes.length)continue;
    try {
      if(selected++>=limits.records)throw Error('MANIFEST_RECORD_COUNT_LIMIT');
      if(delta.contentState!=='retained'||delta.contentRef!==delta.contentSha256||!validRef(delta.contentRef)||delta.observationMethod!=='strict-json-value-byte-spans-v1')throw Error('MANIFEST_DELTA_NOT_RETAINED_OR_SUPPORTED');
      const bytes=await read(delta.contentRef,limits.recordBytes),text=decode(bytes),data=metadataJSON(bytes),key=delta.locator.metadataKey.slice('scripts.'.length);
      if(data.version!=='heurisko-manifest-delta-v1'||data.pointer!=='/scripts/'+key)throw Error('MANIFEST_DELTA_IDENTITY_MISMATCH');
      const linked=new Set(changes.flatMap(c=>c.evidenceIds));
      for(const side of ['source','artifact']) {
        const ref=data[side+'ContentRef'];
        const members=bundle.evidence.filter(e=>linked.has(e.evidenceId)&&e.kind===side+'_member'&&e.side===side&&e.contentState==='retained'&&e.contentRef===ref&&e.contentSha256===ref);
        if(members.length!==1)throw Error('MANIFEST_MEMBER_NOT_ADMITTED');
        const member=members[0],memberBytes=await read(ref,limits.memberBytes),manifest=metadataJSON(memberBytes),actual=property(manifest,key),value=data[side];
        if(value===null){if(actual.present)throw Error('MANIFEST_ABSENCE_MISMATCH');continue;}
        if(!value||typeof value!=='object'||!Object.hasOwn(value,'value')||!actual.present||!same(actual.value,value.value))throw Error('MANIFEST_VALUE_MISMATCH');
        const {startByte,endByte}=value,loc=member.locator;
        if(!Number.isSafeInteger(startByte)||!Number.isSafeInteger(endByte)||startByte<0||endByte<startByte||endByte>memberBytes.length||(loc.startByte!==undefined&&startByte<loc.startByte)||(loc.endByte!==undefined&&endByte>loc.endByte))throw Error('MANIFEST_RANGE_INVALID');
        const literal=metadataJSON(Buffer.from('{"value":'+decode(memberBytes.subarray(startByte,endByte))+'}'));
        if(!same(literal.value,value.value))throw Error('MANIFEST_SPAN_VALUE_MISMATCH');
      }
      if(data.source===null&&data.artifact===null||data.source!==null&&data.artifact!==null&&same(data.source.value,data.artifact.value))throw Error('MANIFEST_DELTA_HAS_NO_CHANGE');
      resolved.push({evidenceId:delta.evidenceId,contentRef:delta.contentRef,text});
    }catch(error){cancelled(signal);omissions.push({evidenceId:delta.evidenceId,code:error instanceof Error&&/^[A-Z_]+$/.test(error.message)?error.message:'MANIFEST_CONTENT_UNAVAILABLE'});}
  }
  cancelled(signal);return {resolved,omissions,totalBytes,limits};
}

export async function checkManifestIntake({packageRoot,expectedCommit,reportFile,storeRoot}) {
  const options={enableAI:false,analysisProfile:'55240-reviewed-retained-manifest-intake-v1'};
  const module=await reviewedIdentity(resolve(packageRoot),expectedCommit,options);
  const original=await boundedFile(resolve(reportFile),8*1024*1024),report=await decodeReportBytes(original),store=new EvidenceStore(resolve(storeRoot));await store.verifyEvidence(report);
  const before=canonicalJSON(report.bundle),script=await boundedFile(fileURLToPath(import.meta.url),128*1024),helper=await boundedFile(fileURLToPath(new URL('./check-final-module-intake.mjs',import.meta.url)),128*1024);
  const identity={...module.identity,implementationSha256:sha256(canonicalJSON({upstream:module.identity.implementationSha256,wrapper:sha256(script),identityHelper:sha256(helper)})),configurationSha256:sha256(canonicalJSON({options,resolver:'admitted-script-delta-members-v1',limits:manifestIntakeLimits}))};
  let attempts=0;const prior=globalThis.fetch;globalThis.fetch=async()=>{attempts++;throw Error('NETWORK_PROHIBITED');};
  let result,access;
  try {
    const imported=await import(pathToFileURL(resolve(packageRoot,'dist/index.js')).href);
    const supplied={...identity,analyzeEvidence:async(bundle,settings)=>{access=await resolveScriptDeltas(bundle,store);const out=await imported.analyzeEvidence(bundle,settings,access.resolved);if(access.omissions.length){out.limitations.push('Some retained script delta values were unavailable to the intake resolver.');const stage=out.stages.find(s=>s.stage==='heuristics');stage.status='incomplete';stage.errors.push({stage:'heuristics',code:'MANIFEST_CONTENT_UNAVAILABLE',message:'One or more script deltas could not be resolved',affectedScope:'retained script delta values',retryable:false});}return out;}};
    result=await runAnalysis(report.bundle,options,supplied);await checkModelOffAnalysis(report.bundle,result);
    const second=await runAnalysis(report.bundle,options,supplied);if(!same(result,second))throw Error('NONDETERMINISTIC_OUTPUT');
  }finally{globalThis.fetch=prior;}
  if(attempts||canonicalJSON(report.bundle)!==before||sha256(await boundedFile(resolve(reportFile),8*1024*1024))!==sha256(original))throw Error('INPUT_OR_NETWORK_INVARIANT_FAILED');
  await store.verifyEvidence(report);
  const after=await reviewedIdentity(resolve(packageRoot),expectedCommit,options);if(!same(module,after))throw Error('MODULE_CHANGED_DURING_INTAKE');
  return {receipt:{version:'heurisko-malhar-retained-manifest-intake-v1',checkedAt:new Date().toISOString(),module,identity,input:{reportId:report.reportId,reportContentRef:sha256(original),captureTime:report.bundle.artifact.captureTime,inputUnchanged:true,evidenceReverified:true},output:{sha256:sha256(canonicalJSON(result)),...(await checkModelOffAnalysis(report.bundle,result)),aiState:result.aiState,deterministicRepeat:true},access:{resolved:access.resolved.map(e=>({evidenceId:e.evidenceId,contentRef:e.contentRef})),omissions:access.omissions,totalBytes:access.totalBytes,limits:access.limits},lifecycle:result.findings.filter(f=>f.ruleId==='heurisko.manifest.lifecycle-script-change'),networkAttempts:attempts,modelInvocation:false,productAdoption:false,limitations:['M1 lifecycle removal priority still derives from whole-file status, not resolved key direction.','Entrypoint value-unavailable wording remains in this module.','Trusted team code only; no hostile-code isolation claim.']},analysis:result};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [packageRoot,expectedCommit,reportFile,storeRoot,receiptFile]=process.argv.slice(2);if(!packageRoot||!expectedCommit||!reportFile||!storeRoot||!receiptFile||process.argv.length!==7)throw Error('EXPECTED_EXPLICIT_MODULE_COMMIT_REPORT_STORE_RECEIPT');
  const {receipt,analysis}=await checkManifestIntake({packageRoot,expectedCommit,reportFile,storeRoot});await writeImmutable(resolve(receiptFile)+'.analysis.json',Buffer.from(JSON.stringify(analysis,null,2)+'\n'));await writeImmutable(resolve(receiptFile),Buffer.from(JSON.stringify(receipt,null,2)+'\n'));console.log(JSON.stringify({status:'passed',head:receipt.module.head,input:receipt.input,output:receipt.output,access:receipt.access}));
}
