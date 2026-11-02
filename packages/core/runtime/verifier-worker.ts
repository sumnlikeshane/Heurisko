// Host-selected offline tool. Target material is data only; no dynamic imports.
import { Verifier, toTrustMaterial, toSignedEntity } from '@sigstore/verify';
import { bundleFromJSON } from '@sigstore/bundle';
import { TrustedRoot } from '@sigstore/protobuf-specs';
import { TrustedMetadataStore } from 'tuf-js/dist/store.js';
import { createHash } from 'node:crypto';
import { manifestFields } from '../src/json-values.js';
import bootstrap from './trust-bootstrap.json';
import {CURRENT_TRUST_PROFILE,isTrustProfile,trustProfileLogVersions} from '../src/trust-profiles.js';
const parse=(b:Buffer)=>manifestFields(b).get('')!.value as any;
const decode=(s:string)=>{if(typeof s!=='string'||s.length>350000||! /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw Error('ENCODING_UNSUPPORTED');return Buffer.from(s,'base64');};
const digest=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const same=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b);
async function roots(s:any) {
 if(!s||s.version!=='heurisko-tuf-snapshot-v1'||!Array.isArray(s.rotations)||s.rotations.length>32)throw Error('ROOT_SNAPSHOT_UNSUPPORTED');
 const now=Date.now(),captured=Date.parse(s.capturedAt);
 if(!Number.isFinite(captured)||captured>now||now-captured>30*86400000)throw Error('ROOT_SNAPSHOT_STALE');
 const tuf=new TrustedMetadataStore(Buffer.from(JSON.stringify(bootstrap)));
 for(const raw of s.rotations){parse(decode(raw));tuf.updateRoot(decode(raw));}
 for(const key of ['timestamp','snapshot','targets','trustedRoot'])parse(decode(s[key]));
 tuf.updateTimestamp(decode(s.timestamp));tuf.updateSnapshot(decode(s.snapshot));tuf.updateDelegatedTargets(decode(s.targets),'targets','root');
 const target=tuf.targets!.signed.targets['trusted_root.json'];if(!target)throw Error('ROOT_TARGET_MISSING');await target.verify((async function*(){yield decode(s.trustedRoot);})());
 const versions={root:tuf.root.signed.version,timestamp:tuf.timestamp!.signed.version,snapshot:tuf.snapshot!.signed.version,targets:tuf.targets!.signed.version};
 // Mandatory host high-water values prevent replay to any older metadata role.
 for(const key of Object.keys(versions))if(!Number.isSafeInteger(s.minimumVersions?.[key])||versions[key]<s.minimumVersions[key])throw Error('ROOT_ROLLBACK');
 return {root:TrustedRoot.fromJSON(parse(decode(s.trustedRoot))),versions,rootSha256:digest(decode(s.trustedRoot)),bootstrapVersion:bootstrap.signed.version,bootstrapSha256:digest(Buffer.from(JSON.stringify(bootstrap)))};
}
function oidText(value:Uint8Array) {
 const b=Buffer.from(value);if(b[0]!==12)throw Error('OID_ENCODING_UNSUPPORTED');let n=b[1],off=2;
 if(n===0x81){n=b[2];off=3;}else if(n===0x82){n=b.readUInt16BE(2);off=4;}else if(n>=128)throw Error('OID_ENCODING_UNSUPPORTED');
 if(off+n!==b.length)throw Error('OID_ENCODING_UNSUPPORTED');return new TextDecoder('utf-8',{fatal:true}).decode(b.subarray(off));
}
function verifyOne(raw:any,verifier:any,req:any) {
 const unknown=(reason:string,crypto=false)=>({status:'unresolved',binding:crypto?'matched':'not_available',reason,crypto});
 if(raw.mediaType!=='application/vnd.dev.sigstore.bundle.v0.3+json')return unknown('BUNDLE_UNSUPPORTED');
 if(raw.dsseEnvelope?.payloadType!=='application/vnd.in-toto+json')return unknown('PAYLOAD_TYPE_UNSUPPORTED');
 const logs=raw.verificationMaterial?.tlogEntries;
 if(!Array.isArray(logs)||logs.length>128)return unknown('LOG_SCOPE_UNSUPPORTED');
 for(const log of logs){
  if(log.kindVersion?.kind!=='dsse'||!trustProfileLogVersions(req.policy?.profile??CURRENT_TRUST_PROFILE).includes(log.kindVersion?.version))return unknown('LOG_VERSION_UNSUPPORTED');
  if(!/^([^\r\n]+)\n[0-9]+\n[A-Za-z0-9+/]+={0,2}\n\n(?:— [^\s]+ [A-Za-z0-9+/]+={0,2}\n)+$/.test(log.inclusionProof?.checkpoint?.envelope??''))return {status:'invalid',binding:'not_available',reason:'CHECKPOINT_INVALID',crypto:false};
 }
 let signer,entity;
 try{entity=toSignedEntity(bundleFromJSON(raw));signer=verifier.verify(entity);}catch(e){return {status:'invalid',binding:'not_available',reason:'CRYPTO_INVALID',crypto:false};}
 let statement;try{statement=parse(decode(raw.dsseEnvelope.payload));}catch{return unknown('STATEMENT_UNSUPPORTED');}
 if(statement._type!=='https://in-toto.io/Statement/v1'||statement.predicateType!=='https://slsa.dev/provenance/v1')return unknown('PREDICATE_UNSUPPORTED');
 const names=statement.subject;if(!Array.isArray(names)||names.length!==1)return unknown('SUBJECT_SCOPE_UNSUPPORTED');
 const subject=names[0],purl='pkg:npm/'+req.package.replace('@','%40')+'@'+req.version;
 if(subject.name!==purl)return {status:'invalid',binding:'mismatched',reason:'SUBJECT_NAME_MISMATCH',crypto:true};
 const digests=subject.digest;if(!digests||!Object.keys(digests).length||Object.keys(digests).some(k=>!['sha256','sha512'].includes(k)))return unknown('DIGEST_UNSUPPORTED');
 for(const key of Object.keys(digests))if(digests[key]!==req.digests[key])return {status:'invalid',binding:'mismatched',reason:'SUBJECT_DIGEST_MISMATCH',crypto:true};
 const assertionSha256=digest(decode(raw.dsseEnvelope.payload));
 const p=req.policy;
 if(!p)return {status:'verified_cryptographic_only',binding:'matched',reason:'EXACT_SUBJECT_CRYPTO_VERIFIED',crypto:true,assertionSha256};
 const expectations=p.expect;
 const mismatches:string[]=[],missing:string[]=[];
 const check=(label:string,actual:any,expected:any)=>{if(actual===undefined)missing.push(label);else if(!same(actual,expected))mismatches.push(label);};
 check('package',req.package,expectations.package);check('version',req.version,expectations.version);
 check('signerSAN',signer.identity?.subjectAlternativeName,expectations.signerSAN);
 // Use raw generic Fulcio OIDs as DER UTF8String; no deprecated fallback.
 const oids=new Map((signer.identity?.oids??[]).map((x:any)=>[x.oid.id.join('.'),x.value]));
 for(const [suffix,expected]of [['8','https://token.actions.githubusercontent.com'],['11','github-hosted'],['12',expectations.repositoryUrl],['13',expectations.fullSourceCommit],['14',expectations.workflowRef]]) {
  const value=oids.get('1.3.6.1.4.1.57264.1.'+suffix);if(value===undefined)missing.push('OID.'+suffix);else try{check('OID.'+suffix,oidText(value as Uint8Array),expected);}catch{missing.push('OID.encoding.'+suffix);}
 }
 const pred=statement.predicate,def=pred?.buildDefinition,workflow=def?.externalParameters?.workflow;
 check('builderId',pred?.runDetails?.builder?.id,expectations.builderId);check('buildType',def?.buildType,expectations.buildType);
 check('repositoryUrl',workflow?.repository,expectations.repositoryUrl);check('workflowPath',workflow?.path,expectations.workflowPath);check('workflowRef',workflow?.ref,expectations.workflowRef);
 if(!same(Object.keys(def?.externalParameters??{}).sort(),['workflow'])||!same(Object.keys(workflow??{}).sort(),['path','ref','repository']))missing.push('externalParameters.unsupported');
 const deps=def?.resolvedDependencies;
 if(!Array.isArray(deps)||deps.length!==1)missing.push('resolvedDependencies.unsupported');
 else {check('sourceURI',deps[0].uri,'git+'+expectations.repositoryUrl+'@'+expectations.workflowRef);check('fullSourceCommit',deps[0].digest?.gitCommit,expectations.fullSourceCommit);if(!same(Object.keys(deps[0].digest??{}),['gitCommit']))missing.push('sourceDigest.unsupported');}
 // This profile supports repository-root packages only. Subtree/build-context
 // assertions have no admitted GHA mapping; never infer them from archive paths.
 if(expectations.packageSubdirectory!=='')missing.push('packageSubdirectory.unsupported');
 if(req.comparedSources?.some(c=>c.repositoryUrl!==expectations.repositoryUrl||c.fullSourceCommit!==expectations.fullSourceCommit||c.packageSubdirectory!==expectations.packageSubdirectory))missing.push('comparedSource.scope');
 if(req.sourceConflicts)missing.push('sourceCandidates.conflicting');
 // Missing/unknown semantics take precedence over a definite expectation failure.
 if(missing.length)return {...unknown('EXPECTATION_UNAVAILABLE',true),missing,mismatches};
 if(mismatches.length)return {status:'verified_cryptographic_only',binding:'matched',reason:'EXPECTATION_MISMATCH',crypto:true,mismatches,assertionSha256};
 return {status:'verified_policy',binding:'matched',reason:'EXPECTATIONS_MET',crypto:true,assertionSha256:digest(decode(raw.dsseEnvelope.payload))};
}
export async function evaluate(req:any) {
 const trust=await roots(req.snapshot);
 if(req.policy&&(Object.keys(req.policy).sort().join(',')!=='expect,profile,provenance'||Object.keys(req.policy.expect??{}).sort().join(',')!=='buildType,builderId,fullSourceCommit,package,packageSubdirectory,repositoryUrl,signerSAN,version,workflowPath,workflowRef'))throw Error('POLICY_UNSUPPORTED');
 if(req.policy&&(!isTrustProfile(req.policy.profile)||!['required','optional'].includes(req.policy.provenance)))throw Error('POLICY_UNSUPPORTED');
 if(req.operation==='roots')return {status:'authenticated',...trust,root:undefined};
 if(req.operation==='probe') { // Host-authored boundary diagnostics; never target selected.
  const fs=require('node:fs');let fileDenied=false,childDenied=false;try{fs.readFileSync('/etc/passwd');}catch(e){fileDenied=e.code==='ERR_ACCESS_DENIED';}try{require('node:child_process').execFileSync('/bin/true');}catch(e){childDenied=e.code==='ERR_ACCESS_DENIED';}const networkError=await new Promise<string>(resolve=>{const socket=require('node:net').connect({host:'203.0.113.1',port:9});socket.setTimeout(250,()=>{socket.destroy();resolve('TIMEOUT');});socket.once('connect',()=>{socket.destroy();resolve('CONNECTED');});socket.once('error',e=>resolve(e.code??'UNKNOWN'));});return {fileDenied,childDenied,networkDenied:['ENETUNREACH','EHOSTUNREACH','EPERM','EACCES','ENETDOWN'].includes(networkError),networkError,uid:process.getuid(),nodeVersion:process.version,architecture:process.arch,heapMiB:96};
 }
 if(req.operation==='memory') {const keep=[];for(;;)keep.push(Buffer.alloc(4*1024*1024,1));}
 if(req.operation==='busy')for(;;)new Verifier(toTrustMaterial(trust.root));
 if(req.operation!=='verify')throw Error('OPERATION_UNSUPPORTED');
 if(req.policy&&(req.policy.expect.package!==req.package||req.policy.expect.version!==req.version))return {status:'unresolved',artifactBinding:'not_available',policyResult:'indeterminate',reason:'POLICY_TARGET_SCOPE_MISMATCH'};
 const verifier=new Verifier(toTrustMaterial(trust.root),{ctlogThreshold:1,tlogThreshold:1,timestampThreshold:1});
 const material=req.material===null?null:parse(decode(req.material));
 if(material!==null&&!Array.isArray(material.attestations))throw Error('ATTESTATIONS_UNSUPPORTED');
 const attestations=material?.attestations??[];if(attestations.length>128)throw Error('ATTESTATIONS_LIMIT');
 const builds=attestations.filter(a=>a.predicateType==='https://slsa.dev/provenance/v1');
 const unknownKinds=attestations.some(a=>!['https://slsa.dev/provenance/v1','https://github.com/npm/attestation/tree/main/specs/publish/v0.1'].includes(a.predicateType));
 const results=builds.map(a=>verifyOne(a.bundle,verifier,req));
 let status,binding='not_available',reason;
 if(unknownKinds){status='unresolved';reason='ATTESTATION_KIND_UNSUPPORTED';}
 else if(!builds.length){status='absent';reason='NO_BUILD_ASSERTION_IN_CAPTURED_DISCOVERY';}
 else if(results.some(r=>r.status==='unresolved')){status='unresolved';reason='ASSERTIONS_UNRESOLVED';}
 else if(new Set(results.filter(r=>r.assertionSha256).map(r=>r.assertionSha256)).size>1){status='unresolved';reason='ASSERTIONS_CONFLICT';}
 else if(results.some(r=>r.status==='invalid')){status='invalid';reason='ASSERTION_INVALID';binding=results.some(r=>r.binding==='mismatched')?'mismatched':'not_available';}
 else {status=results.every(r=>r.status==='verified_policy')?'verified_policy':'verified_cryptographic_only';binding='matched';reason=results.some(r=>r.reason==='EXPECTATION_MISMATCH')?'EXPECTATION_MISMATCH':'ASSERTIONS_VERIFIED';}
 const policyResult=!req.policy?'not_evaluated':status==='verified_policy'?'pass':status==='absent'?(req.policy.provenance==='required'?'violation':'pass'):status==='invalid'||reason==='EXPECTATION_MISMATCH'?'violation':'indeterminate';
 return {version:'heurisko-offline-provenance-v1',profile:req.policy?.profile??CURRENT_TRUST_PROFILE,status,artifactBinding:binding,policyResult,reason,results,trust:{versions:trust.versions,rootSha256:trust.rootSha256,bootstrapVersion:trust.bootstrapVersion,bootstrapSha256:trust.bootstrapSha256},verificationTime:new Date().toISOString(),limits:{memoryMiB:128,heapMiB:96,wallSeconds:5,attestations:128},limitations:['Cryptographic and explicit policy checks only; no safety, reproduction or universal source-correspondence claim.','Absence means only completed captured registry discovery.','Root high-water marks and policy values are trusted host configuration.']};
}
if(require.main===module) {
 let bytes=0,chunks:Buffer[]=[];process.stdin.on('data',c=>{bytes+=c.length;if(bytes>2*1024*1024)process.exit(2);chunks.push(c);});
 process.stdin.on('end',async()=>{try{const result=await evaluate(parse(Buffer.concat(chunks)));process.stdout.write(JSON.stringify(result));}catch(e){process.stdout.write(JSON.stringify({status:'unresolved',artifactBinding:'not_available',policyResult:'indeterminate',reason:/^[A-Z][A-Z0-9_]{0,80}$/.test(e.code??e.message??'')?(e.code??e.message):'ROOT_OR_INPUT_REJECTED',detail:String(e.message??'WORKER_FAILED').slice(0,512)}));}});
}
