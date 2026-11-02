// Actual offline evaluator execution; no constructed report can satisfy this matrix.
import fs from 'node:fs/promises';import {resolve,join} from 'node:path';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';
import {runVerificationWorker,VERIFIER_IMAGE,VERIFIER_PLATFORM} from '../packages/core/dist/trust.js';
const [outArg,snapshotArg='examples/production-phase2/2026-11-02-implementation-02/authenticated-snapshot.json']=process.argv.slice(2);if(!outArg)throw Error('NEW output directory required');const out=resolve(outArg);await fs.mkdir(out,{recursive:false});
const source='examples/production-phase2/2026-11-02-local-01/q4-review02',snapshot=JSON.parse(await fs.readFile(snapshotArg));
const reqFor=async(folder,name,version,archive,commit)=>({operation:'verify',snapshot,package:name,version,digests:Object.fromEntries(['sha256','sha512'].map(k=>[k,createHash(k).update(archive).digest('hex')])),material:(await fs.readFile(source+'/real-npm/'+folder+'/attestations.json')).toString('base64'),sourceConflicts:false,policy:{profile:'npm-gha-slsa-v1-draft.2',provenance:'required',expect:{package:name,version,repositoryUrl:'https://github.com/sigstore/sigstore-js',fullSourceCommit:commit,packageSubdirectory:'',workflowPath:'.github/workflows/release.yml',workflowRef:'refs/heads/main',signerSAN:'https://github.com/sigstore/sigstore-js/.github/workflows/release.yml@refs/heads/main',builderId:'https://github.com/actions/runner/github-hosted',buildType:'https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1'}}});
const results=[];
async function check(id,req,expected,signal){const start=Date.now(),value=await runVerificationWorker(req,signal);const pass=Object.entries(expected).every(([key,v])=>value.result[key]===v)&&value.identity.cleanup===(expected.reason==='VERIFIER_INPUT_LIMIT'?'not_started':'confirmed_absent')&&(expected.reason!==undefined||!String(value.result.reason??'').startsWith('VERIFIER_'));const row={id,expected,...value,ms:Date.now()-start,pass};results.push(row);await fs.writeFile(join(out,id+'.json'),JSON.stringify(row,null,2)+'\n',{flag:'wx'});console.log(id,pass?'PASS':'FAIL',value.result.status,value.result.reason??'');}
const flip=s=>{const b=Buffer.from(s,'base64');b[0]^=1;return b.toString('base64');};
for(const [folder,name,version,filename]of [['verify','@sigstore/verify','4.1.2','verify-4.1.2.tgz'],['core','@sigstore/core','4.0.1','core-4.0.1.tgz']]) {
 const meta=JSON.parse(await fs.readFile(source+'/real-npm/'+folder+'/metadata.json')),bytes=await fs.readFile(source+'/'+filename),base=await reqFor(folder,name,version,bytes,meta.gitHead),material=JSON.parse(Buffer.from(base.material,'base64')),bundle=material.attestations.find(a=>a.predicateType==='https://slsa.dev/provenance/v1').bundle;
 await check(folder+'-positive',base,{status:'verified_policy',policyResult:'pass',artifactBinding:'matched'});
 await check(folder+'-crypto-only',{...base,policy:null},{status:'verified_cryptographic_only',policyResult:'not_evaluated',artifactBinding:'matched'});
 for(const field of ['signerSAN','repositoryUrl','fullSourceCommit','workflowPath','workflowRef','builderId','buildType']) {const req=structuredClone(base);req.policy.expect[field]=field==='fullSourceCommit'?'0'.repeat(40):'https://unexpected.invalid';await check(folder+'-wrong-'+field,req,{status:'verified_cryptographic_only',policyResult:'violation'});}
 for(const field of ['packageSubdirectory']){const req=structuredClone(base);req.policy.expect[field]='packages/verify';await check(folder+'-unsupported-'+field,req,{status:'unresolved',policyResult:'indeterminate'});}
 for(const kind of ['package','version','digest']){const req=structuredClone(base);if(kind==='digest')req.digests.sha512='0'.repeat(128);else {req[kind]='wrong';req.policy.expect[kind]='wrong';}await check(folder+'-wrong-subject-'+kind,req,{status:'invalid',policyResult:'violation',artifactBinding:'mismatched'});}
 for(const mutation of ['payload','signature','payload-type','bundle-version','log-version','duplicate-log','missing-log','certificate','checkpoint','checkpoint-suffix','time','log-body','unknown-predicate','publish-only','unknown-attestation']) {
  const m=structuredClone(material),b=m.attestations.find(a=>a.predicateType==='https://slsa.dev/provenance/v1').bundle;let expected={status:'invalid',policyResult:'violation'};
  if(mutation==='payload')b.dsseEnvelope.payload=flip(b.dsseEnvelope.payload);
  if(mutation==='signature')b.dsseEnvelope.signatures[0].sig=flip(b.dsseEnvelope.signatures[0].sig);
  if(mutation==='payload-type'){b.dsseEnvelope.payloadType='unsupported';expected={status:'unresolved',policyResult:'indeterminate'};}
  if(mutation==='bundle-version'){b.mediaType='unknown';expected={status:'unresolved',policyResult:'indeterminate'};}
  if(mutation==='log-version'){b.verificationMaterial.tlogEntries[0].kindVersion.version='999';expected={status:'unresolved',policyResult:'indeterminate'};}
  if(mutation==='duplicate-log')b.verificationMaterial.tlogEntries.push(structuredClone(b.verificationMaterial.tlogEntries[0]));
  if(mutation==='missing-log')b.verificationMaterial.tlogEntries=[];
  if(mutation==='certificate')b.verificationMaterial.certificate.rawBytes='broken';
  if(mutation==='checkpoint')b.verificationMaterial.tlogEntries[0].inclusionProof.checkpoint.envelope='forged';
  if(mutation==='checkpoint-suffix')b.verificationMaterial.tlogEntries[0].inclusionProof.checkpoint.envelope+='unsigned';
  if(mutation==='time')b.verificationMaterial.tlogEntries[0].integratedTime='1';
  if(mutation==='log-body')b.verificationMaterial.tlogEntries[0].canonicalizedBody=flip(b.verificationMaterial.tlogEntries[0].canonicalizedBody);
  if(mutation==='unknown-predicate'){m.attestations[0].predicateType='unknown';expected={status:'unresolved',policyResult:'indeterminate'};}
  if(mutation==='publish-only'){m.attestations=m.attestations.filter(a=>a.predicateType!=='https://slsa.dev/provenance/v1');expected={status:'absent',policyResult:'violation'};}
  if(mutation==='unknown-attestation'){m.attestations.push({predicateType:'unknown',bundle:{}});expected={status:'unresolved',policyResult:'indeterminate'};}
  await check(folder+'-'+mutation,{...base,material:Buffer.from(JSON.stringify(m)).toString('base64')},expected);
 }
 await check(folder+'-required-absence',{...base,material:null},{status:'absent',policyResult:'violation'});
 await check(folder+'-optional-absence',{...base,material:null,policy:{...base.policy,provenance:'optional'}},{status:'absent',policyResult:'pass'});
 await check(folder+'-conflicting-source',{...base,sourceConflicts:true},{status:'unresolved',policyResult:'indeterminate'});
 await check(folder+'-compared-subtree',{...base,comparedSources:[{repositoryUrl:base.policy.expect.repositoryUrl,fullSourceCommit:meta.gitHead,packageSubdirectory:'packages/verify'}]},{status:'unresolved',policyResult:'indeterminate'});
 await check(folder+'-positive-after',base,{status:'verified_policy',policyResult:'pass'});
}
for(const kind of ['stale','future','rollback','signature','target-hash','rotation-gap','duplicate-keys','depth','rotation-omitted','signed-expired-timestamp']) {
 const s=structuredClone(snapshot);if(kind==='signed-expired-timestamp')s.timestamp=(await fs.readFile('examples/production-phase2/2026-11-02-implementation-02/trust-bootstrap/historical-timestamp.json')).toString('base64');if(kind==='rotation-omitted')s.rotations=[];if(kind==='stale')s.capturedAt='2020-01-01T00:00:00Z';if(kind==='future')s.capturedAt='2099-01-01T00:00:00Z';if(kind==='rollback')s.minimumVersions.timestamp++;
 if(kind==='signature'){const r=JSON.parse(Buffer.from(s.timestamp,'base64'));r.signatures[0].sig='00';s.timestamp=Buffer.from(JSON.stringify(r)).toString('base64');}
 if(kind==='target-hash')s.trustedRoot=Buffer.from('{}').toString('base64');if(kind==='rotation-gap')s.rotations.push(s.rotations[0]);
 if(kind==='duplicate-keys')s.timestamp=Buffer.from('{"signed":{},"signed":{}}').toString('base64');if(kind==='depth')s.timestamp=Buffer.from('{"x":'.repeat(34)+'0'+'}'.repeat(34)).toString('base64');
 await check('roots-'+kind,{operation:'roots',snapshot:s},{status:'unresolved',policyResult:'indeterminate'});
}
await check('input-size',{operation:'verify',snapshot,material:'A'.repeat(262144)},{status:'unresolved',policyResult:'indeterminate',reason:'VERIFIER_INPUT_LIMIT'});
await check('record-limit',{operation:'verify',snapshot,material:Buffer.from(JSON.stringify({attestations:Array.from({length:129},()=>({predicateType:'unknown',bundle:{}}))})).toString('base64')},{status:'unresolved',policyResult:'indeterminate',reason:'ATTESTATIONS_LIMIT'});
await check('permissions',{operation:'probe',snapshot},{fileDenied:true,childDenied:true,networkDenied:true,uid:65534,nodeVersion:'v22.23.4',architecture:VERIFIER_PLATFORM==='linux/arm64'?'arm64':'x64'});
await check('deadline',{operation:'busy',snapshot},{status:'unresolved',reason:'VERIFIER_DEADLINE'});
const controller=new AbortController();setTimeout(()=>controller.abort(),1200);await check('cancellation',{operation:'busy',snapshot},{status:'unresolved',reason:'VERIFIER_CANCELLED'},controller.signal);
await check('native-allocation-cap',{operation:'memory',snapshot},{status:'unresolved',reason:'VERIFIER_WORKER_FAILED'});
const summary={passed:results.every(r=>r.pass),checks:results.length,failures:results.filter(r=>!r.pass).map(r=>r.id),node:process.version,platform:process.platform,arch:process.arch,runtime:{image:VERIFIER_IMAGE,platform:VERIFIER_PLATFORM},limitations:[process.platform==='linux'&&process.arch==='x64'?'Linux x64 host; native admission additionally requires runner/engine guard receipt.':'Host '+process.platform+'/'+process.arch+' with architecture-matched Linux worker; not native Linux amd64 host validation.','Two signed npm pairs from one upstream project; not population or held-out accuracy.','Fixture policy expectations are explicit test constants cross-checked against separate captured release metadata; no target-selected production policy.']};await fs.writeFile(join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});if(!summary.passed)process.exitCode=1;
