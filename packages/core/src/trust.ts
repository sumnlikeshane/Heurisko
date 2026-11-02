import {isTrustProfile,type TrustProfile} from './trust-profiles.js';
import { spawn } from 'node:child_process';
import { randomUUID,createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import type { EvidenceBundle, Outcomes, ProvenanceState } from '@heurisko/contracts';
import { boundedFile, EvidenceStore } from './storage.js';
import { manifestFields,retainJSONEvidence } from './comparison.js';
import { canonicalJSON,sha256 } from './identity.js';
import { localDockerArgs } from './parser-runtime.js';
// Fixed host-architecture selection; target material cannot choose a runtime.
export const VERIFIER_PLATFORM=process.arch==='arm64'?'linux/arm64':'linux/amd64';
export const VERIFIER_IMAGE='node:22.23.4-bookworm-slim@sha256:'+(process.arch==='arm64'?'9a422d62743ffb1e6eb282549f4eae7ab89f7b926db1f136f4cba8be60e4ecbc':'9f0dde62d10e7ff7a310ecaebd66225f6b46c17e6cb778449a77b05d3541bea2');
export const VERIFIER_VERSION='@sigstore/verify@4.1.2;bundle@5.0.0;core@4.0.1;protobuf@0.5.2;tuf-js@6.0.1;models@5.0.1;minimatch@11.0.1';
export interface TrustCatalog {version:'heurisko-trust-catalog-v1';snapshot:unknown;policies:Record<string,{profile:TrustProfile;provenance:'required'|'optional';expect:Record<string,string>}>}
export async function loadTrustCatalog(path=process.env.HEURISKO_TRUST_CONFIG):Promise<TrustCatalog|undefined> {
 if(!path)return undefined;
 const value=manifestFields(await boundedFile(path,256*1024)).get('')!.value as TrustCatalog;
 if(value.version!=='heurisko-trust-catalog-v1'||!value.snapshot||!value.policies||Object.keys(value.policies).length>128)throw Error('TRUST_CATALOG_INVALID');
 for(const [id,p]of Object.entries(value.policies)) {
  if(Object.keys(p).sort().join(',')!=='expect,profile,provenance'||!/^[A-Za-z0-9_.:-]{1,128}$/.test(id)||!isTrustProfile(p.profile)||!['required','optional'].includes(p.provenance))throw Error('TRUST_POLICY_INVALID');
  const keys=['package','version','repositoryUrl','fullSourceCommit','packageSubdirectory','workflowPath','workflowRef','signerSAN','builderId','buildType'];
  if(Object.keys(p.expect).length!==keys.length||keys.some(k=>typeof p.expect[k]!=='string'||p.expect[k]!.length>2048)||!/^[a-f0-9]{40}$/.test(p.expect.fullSourceCommit!))throw Error('TRUST_EXPECTATIONS_INVALID');
 }
 return value;
}
interface CommandResult {code:number|null;signal:NodeJS.Signals|null;stdout:string;stderr:string}
async function docker(args:string[],input?:string,signal?:AbortSignal,wallMs=5000):Promise<CommandResult> {
 return new Promise((resolve,reject)=>{
  const child=spawn('docker',localDockerArgs(args),{env:{PATH:process.env.PATH??'',HOME:process.env.HOME??'',LANG:'C'},stdio:['pipe','pipe','pipe']});let stdout='',stderr='',failure:string|undefined,force:ReturnType<typeof setTimeout>|undefined;
  const stop=(why:string)=>{failure??=why;child.kill('SIGTERM');force??=setTimeout(()=>child.kill('SIGKILL'),1000);};
  const abort=()=>stop('VERIFIER_CANCELLED'),timer=setTimeout(()=>stop('VERIFIER_DEADLINE'),wallMs);signal?.addEventListener('abort',abort,{once:true});
  child.stdout.on('data',c=>{if(stdout.length+c.length>64*1024)stop('VERIFIER_OUTPUT_LIMIT');else stdout+=c;});child.stderr.on('data',c=>{if(stderr.length+c.length>32*1024)stop('VERIFIER_OUTPUT_LIMIT');else stderr+=c;});
  const clean=()=>{clearTimeout(timer);clearTimeout(force);signal?.removeEventListener('abort',abort);};
  child.once('error',e=>{clean();reject(e);});child.once('close',(code,sign)=>{clean();if(failure)reject(Error(failure));else resolve({code,signal:sign,stdout,stderr});});
  child.stdin.on('error',()=>{});child.stdin.end(input);if(signal?.aborted)abort();
 });
}
let verifierActive=false;
export async function runVerificationWorker(request:unknown,signal?:AbortSignal) {
 if(verifierActive)return {result:{status:'unresolved',artifactBinding:'not_available',policyResult:'indeterminate',reason:'VERIFIER_BUSY'},identity:{verifier:VERIFIER_VERSION,cleanup:'not_started'}};
 verifierActive=true;try{return await executeVerificationWorker(request,signal);}
 catch(error){const message=error instanceof Error?error.message:'';return {result:{status:'unresolved',artifactBinding:'not_available',policyResult:'indeterminate',reason:/^[A-Z][A-Z0-9_]{0,80}$/.test(message)?message:'VERIFIER_INPUT_REJECTED'},identity:{verifier:VERIFIER_VERSION,cleanup:'not_started'}};}
 finally{verifierActive=false;}
}
async function executeVerificationWorker(request:unknown,signal?:AbortSignal) {
 const worker=fileURLToPath(new URL('./verifier-worker.cjs',import.meta.url));
 if(/[\x00,\r\n]/.test(worker))throw Error('VERIFIER_MOUNT_PATH_REJECTED');
 const workerSha256=sha256(await boundedFile(worker,4*1024*1024));
 const name='heurisko-verifier-'+randomUUID();const payload=canonicalJSON(request);if(Buffer.byteLength(payload)>256*1024)throw Error('VERIFIER_INPUT_LIMIT');
 let result:CommandResult|undefined,error:string|undefined,cleanup='not_started',creationRequested=false,creationAcknowledged=false,containerId:string|undefined;let workerState:Record<string,unknown>|undefined;let cleanupStep='not_started';let cleanupFailure:{step:string;reason:string}|undefined;
 const controls:Record<string,unknown>[]=[];
 const control=async(args:string[],input?:string,abort?:AbortSignal,wallMs=5000)=>{
  const startedAt=new Date().toISOString(),start=performance.now();
  try {const value=await docker(args,input,abort,wallMs);controls.push({operation:args[0],startedAt,durationMs:Math.round(performance.now()-start),limitMs:wallMs,exitCode:value.code,signal:value.signal});return value;}
  catch(e){controls.push({operation:args[0],startedAt,durationMs:Math.round(performance.now()-start),limitMs:wallMs,error:e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'CONTROL_OPERATION_FAILED'});throw e;}
 };
 const absent=async(id:string)=>{const observed=await control(['container','ls','--all','--quiet','--no-trunc','--filter',`id=${id}`]);return observed.code===0&&observed.stdout.trim()==='';};
 const inspect=async(id:string)=>{
  const observed=await control(['inspect','--format','{{json .}}',id]);
  if(observed.code!==0)return undefined;
  const object=JSON.parse(observed.stdout);
  if(object.Id!==id||object.Name!=='/'+name||!object.State||typeof object.State.Running!=='boolean')throw Error('CONTAINER_IDENTITY_UNCONFIRMED');
  return object.State;
 };
 let primaryFailure:string|undefined;
 try {
  if(signal?.aborted)throw Error('VERIFIER_CANCELLED');
  creationRequested=true;
  const created=await control(['create','--pull=never','--platform='+VERIFIER_PLATFORM,'--name',name,'--network=none','--read-only','--memory=134217728','--memory-swap=134217728','--cpus=1','--pids-limit=16','--cap-drop=ALL','--security-opt=no-new-privileges','--user=65534:65534','--log-driver=none','--interactive','--mount',`type=bind,src=${worker},dst=/worker.cjs,readonly`,'--entrypoint=/usr/bin/timeout',VERIFIER_IMAGE,'--signal=KILL','5s','/usr/local/bin/node','--max-old-space-size=96','--stack-size=512','--experimental-permission','--allow-fs-read=/worker.cjs','/worker.cjs'],undefined,undefined,10000);
  if(created.code!==0||! /^[a-f0-9]{64}\s*$/.test(created.stdout))throw Error('VERIFIER_CREATE_FAILED');
  creationAcknowledged=true;containerId=created.stdout.trim();
  // Cancellation does not cancel a daemon create request. Await its bounded
  // acknowledgment, then clean the exact ID without ever starting the worker.
  if(signal?.aborted)throw Error('VERIFIER_CANCELLED');
  result=await control(['start','--attach','--interactive',containerId],payload,signal,10000);
  if(result.code!==0)throw Error('VERIFIER_WORKER_FAILED');
 }catch(e){error=e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'VERIFIER_RUNTIME_UNAVAILABLE';}
 finally {
  primaryFailure=error;
  // A failed create client may leave a daemon request in flight. A missing
  // UUID name cannot establish settlement; retain that uncertainty verbatim.
  if(creationRequested&&!creationAcknowledged){cleanup='unknown';error='VERIFIER_CREATION_UNCERTAIN';}
  if(containerId)try {
   cleanupStep='inspect_running';const initial=await inspect(containerId);
   if(!initial){error??='INSPECTION_UNAVAILABLE';primaryFailure??='INSPECTION_UNAVAILABLE';}
   if(initial){
    if(initial.Running){cleanupStep='kill';await control(['kill',containerId]);}
    // Cancellation can race natural exit. Only observed state proves stopped.
    cleanupStep='inspect_stopped';const observed=await inspect(containerId);if(!observed||observed.Running!==false)throw Error('STOP_UNCONFIRMED');
    const duration=Date.parse(observed.FinishedAt)-Date.parse(observed.StartedAt);workerState={startedAt:observed.StartedAt,finishedAt:observed.FinishedAt,oomKilled:observed.OOMKilled,exitCode:observed.ExitCode,wallMs:Number.isFinite(duration)?Math.max(0,duration):null};
    if(error==='VERIFIER_WORKER_FAILED'&&result?.code===137&&!observed.OOMKilled&&duration>=4500)error='VERIFIER_DEADLINE';
    cleanupStep='remove';
    // A failed removal client and actual daemon absence are independent facts.
    // Query the immutable ID even after a control failure; retain that failure
    // and keep the decision indeterminate rather than upgrading a timed-out run.
    try {const removed=await control(['rm',containerId]);if(removed.code!==0)throw Error('REMOVE_UNCONFIRMED');}
    catch(e){const reason=e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'CONTROL_OPERATION_FAILED';cleanupFailure={step:'remove',reason};error??=reason;primaryFailure??=reason;}
   }
   cleanupStep='confirm_absence';if(!await absent(containerId))throw Error('ABSENCE_UNCONFIRMED');cleanup='confirmed_absent';
  }catch(e){cleanupFailure={step:cleanupStep,reason:e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'CONTROL_OPERATION_FAILED'};cleanup='unknown';error='VERIFIER_CLEANUP_UNCONFIRMED';}

 }
 const identity={...(result?{exitCode:result.code,stderr:result.stderr}:{}),verifier:VERIFIER_VERSION,workerSha256,image:VERIFIER_IMAGE,workerPlatform:VERIFIER_PLATFORM,platform:`${process.platform}-${process.arch}`,containerName:name,containerId:containerId??null,controls,primaryFailure:primaryFailure??null,creationRequested,creationAcknowledged,workerState:workerState??null,supervisor:'GNU timeout 9.1, configured KILL at 5s; Docker create/start controls 10s',cleanup,...(cleanupFailure?{cleanupFailure}:{})};
 if(error)return {result:{status:'unresolved',artifactBinding:'not_available',policyResult:'indeterminate',reason:error},identity};
 try{return {result:JSON.parse(result!.stdout),identity};}catch{return {result:{status:'unresolved',artifactBinding:'not_available',policyResult:'indeterminate',reason:'VERIFIER_PROTOCOL_INVALID'},identity};}
}
export async function applyTrust(bundle:EvidenceBundle,store:EvidenceStore,catalog:TrustCatalog|undefined,signal?:AbortSignal):Promise<{policyResult:Outcomes['policyResult'];identity:Record<string,unknown>}> {
 const attemptedAt=new Date().toISOString();
 const ref=bundle.input.analysisOptions.trustPolicyRef,policy=ref&&catalog&&Object.hasOwn(catalog.policies,ref)?catalog.policies[ref]:undefined;
 const unknown={policyResult:(ref?'indeterminate':'not_evaluated') as Outcomes['policyResult'],identity:{verifier:'none',trustRoot:'none',policy:ref??'none'}};
 if(!catalog)return unknown;
 const descriptor=bundle.evidence.find(e=>e.locator.metadataKey==='provenance-boundary');
 let discovery:any;try{if(descriptor?.contentRef)discovery=JSON.parse((await store.get(descriptor.contentRef)).toString('utf8'));}catch{}
 const raw=bundle.evidence.find(e=>e.locator.metadataKey==='raw-unverified-attestation');
 const artifact=await store.get(bundle.artifact.observedSha256);
 const request={comparedSources:bundle.sourceCandidates.map(c=>({repositoryUrl:c.repositoryUrl,fullSourceCommit:c.commit??'',packageSubdirectory:c.subdirectory??''})),operation:'verify',snapshot:catalog.snapshot,policy:policy??null,package:bundle.artifact.packageName??'',version:bundle.artifact.version??'',digests:{sha256:createHash('sha256').update(artifact).digest('hex'),sha512:createHash('sha512').update(artifact).digest('hex')},material:raw?.contentRef?(await store.get(raw.contentRef)).toString('base64'):null,sourceConflicts:bundle.sourceCandidates.some(c=>c.association==='ambiguous'||c.conflicts.length>0)};
 let executed;
 if(ref&&!policy)executed={result:{status:'unresolved',artifactBinding:'not_available',policyResult:'indeterminate',reason:'POLICY_UNKNOWN'},identity:{verifier:VERIFIER_VERSION}};
 else if(bundle.artifact.origin!=='registry')executed={result:{status:'not_checked',artifactBinding:'not_checked',policyResult:ref?'indeterminate':'not_evaluated',reason:'LOCAL_INPUT_NO_REGISTRY_PROVENANCE'},identity:{verifier:VERIFIER_VERSION}};
 else if(!raw&&!['NO_ATTESTATION_ADVERTISED_VERIFIER_UNAVAILABLE','NO_ATTESTATION_ADVERTISED'].includes(discovery?.reason))executed={result:{status:'unresolved',artifactBinding:'not_available',policyResult:ref?'indeterminate':'not_evaluated',reason:'DISCOVERY_INCOMPLETE'},identity:{verifier:VERIFIER_VERSION}};
 else executed=await runVerificationWorker(request,signal);
 if(!ref)executed.result.policyResult='not_evaluated';
 const bootstrapBytes=await boundedFile(fileURLToPath(new URL('../runtime/trust-bootstrap.json',import.meta.url)),256*1024);
 const bootstrap={rawBytesBase64:bootstrapBytes.toString('base64'),sha256:sha256(bootstrapBytes),version:15};
 if(['verified_policy','verified_cryptographic_only'].includes(executed.result.status)&&createHash('sha256').update(JSON.stringify(JSON.parse(bootstrapBytes.toString('utf8')))).digest('hex')!==executed.result.trust?.bootstrapSha256)executed.result={status:'unresolved',artifactBinding:'matched',policyResult:ref?'indeterminate':'not_evaluated',reason:'BOOTSTRAP_RECORD_MISMATCH'};
 const verified=['verified_policy','verified_cryptographic_only'].includes(executed.result.status);
 const record={attemptedAt,settledAt:new Date().toISOString(),bootstrap,...executed.result,identity:executed.identity,policyRef:ref??null,policy:policy??null,snapshot:catalog.snapshot,policySha256:policy?sha256(canonicalJSON(policy)):null,snapshotSha256:sha256(canonicalJSON(catalog.snapshot))};
 const e=await retainJSONEvidence(bundle,store,{kind:'provenance',side:'external',locator:{metadataKey:'offline-verification-decision'},observationMethod:'heurisko-offline-provenance-v1',verification:verified?'verified':'not_checked',limitations:executed.result.limitations??[executed.result.reason]},record);
 bundle.provenance={status:executed.result.status,artifactBinding:executed.result.artifactBinding,...(ref?{policyRef:ref}:{}),evidenceIds:[...bundle.provenance.evidenceIds,e.evidenceId],limitations:executed.result.limitations??[executed.result.reason]} as ProvenanceState;
 const stage=bundle.stages.find(s=>s.stage==='provenance')!;stage.status=['unresolved','invalid'].includes(bundle.provenance.status)?'incomplete':bundle.provenance.status==='not_checked'?'skipped':'complete';stage.errors=stage.status==='incomplete'?[{stage:'provenance',code:executed.result.reason,message:executed.result.reason,affectedScope:'provenance',retryable:false}]:[];
 return {policyResult:executed.result.policyResult,identity:{verifier:VERIFIER_VERSION,workerSha256:'workerSha256' in executed.identity?executed.identity.workerSha256:null,image:VERIFIER_IMAGE,workerPlatform:VERIFIER_PLATFORM,policy:record.policySha256,trustRoot:record.snapshotSha256,bootstrapSha256:bootstrap.sha256,verificationTime:executed.result.verificationTime??attemptedAt}};
}
