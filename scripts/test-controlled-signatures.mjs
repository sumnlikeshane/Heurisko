import {CURRENT_TRUST_PROFILE,LEGACY_TRUST_PROFILE} from '../packages/core/dist/trust-profiles.js';
import fs from 'node:fs/promises';import {resolve,join} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
const [fixtureArg,runtimeArg,outArg]=process.argv.slice(2);if(!outArg)throw Error('fixture, isolated runtime and NEW output required');
const fixture=resolve(fixtureArg),runtime=resolve(runtimeArg),out=resolve(outArg);await fs.mkdir(out,{recursive:false});await fs.writeFile(join(out,'harness-source.mjs'),await fs.readFile(new URL(import.meta.url)),{flag:'wx'});
const {runVerificationWorker,VERIFIER_PLATFORM,VERIFIER_IMAGE}=await import(pathToFileURL(join(runtime,'packages/core/dist/trust.js')));
const read=async n=>JSON.parse(await fs.readFile(join(fixture,n))),snapshot=await read('snapshot.json'),policy=await read('policy.json'),digests=await read('digests.json'),cases=await read('cases.json'),identity=JSON.parse(await fs.readFile(join(runtime,'CONTROLLED-TEST-ONLY.json')));
const rows=[];async function check(id,req,expected,cryptoRequired=false,signal,expectedAssertionReason,expectedProfile){const start=performance.now(),result=await runVerificationWorker(req,signal),pass=Boolean(Object.entries(expected).every(([k,v])=>result.result[k]===v)&&(!cryptoRequired||(Array.isArray(result.result.results)&&result.result.results.length>0&&result.result.results.every(r=>r.crypto===true)))&&(!expectedAssertionReason||(Array.isArray(result.result.results)&&result.result.results.length>0&&result.result.results.every(r=>r.reason===expectedAssertionReason)))&&(!expectedProfile||result.result.profile===expectedProfile)&&result.identity.cleanup===(expected.reason==='VERIFIER_INPUT_LIMIT'?'not_started':'confirmed_absent'));const row={id,expected,expectedProfile:expectedProfile??null,expectedAssertionReason:expectedAssertionReason??null,cryptoRequired,...result,pass,durationMs:Math.round(performance.now()-start)};rows.push(row);await fs.writeFile(join(out,id+'.json'),JSON.stringify(row,null,2)+'\n',{flag:'wx'});console.log(id,pass?'PASS':'FAIL',JSON.stringify(result.result));}
const req=c=>({operation:'verify',snapshot,package:policy.expect.package,version:policy.expect.version,digests,policy:c.policyFree?null:c.profile?{...policy,profile:c.profile}:policy,material:Buffer.from(JSON.stringify(c.material)).toString('base64'),sourceConflicts:false});
const profileFor=c=>c.policyFree?CURRENT_TRUST_PROFILE:c.profile??policy.profile;
for(const c of cases){
 await check(c.id,req(c),c.expected,c.cryptoRequired,undefined,c.expectedAssertionReason,profileFor(c));
 if(!c.id.startsWith('positive')){
  const positive=c.profile===LEGACY_TRUST_PROFILE?cases.find(p=>p.id==='legacy-positive-0-0-2'):cases.find(p=>p.id==='positive-'+c.id.slice(-5))??cases.find(p=>p.id==='positive-0-0-1');
  await check(c.id+'-positive-after',req(positive),positive.expected,positive.cryptoRequired,undefined,undefined,profileFor(positive));
 }
}
const base=req(cases[0]);
if(!process.argv.includes('--matrix-only')){
for(const [id,mutation,expectation] of [
 ['expired',r=>{r.snapshot=null;},{status:'unresolved',policyResult:'indeterminate'}],
 ['rollback',r=>{r.snapshot.minimumVersions.timestamp=2;},{status:'unresolved',policyResult:'indeterminate',reason:'ROOT_ROLLBACK'}],
 ['stale',r=>{r.snapshot.capturedAt='2020-01-01T00:00:00Z';},{status:'unresolved',policyResult:'indeterminate',reason:'ROOT_SNAPSHOT_STALE'}],
 ['unknown-policy',r=>{r.policy.profile='unknown';},{status:'unresolved',policyResult:'indeterminate',reason:'POLICY_UNSUPPORTED'}],
 ['crypto-only',r=>{r.policy=null;},{status:'verified_cryptographic_only',policyResult:'not_evaluated'}],
 ['required-absence',r=>{r.material=null;},{status:'absent',policyResult:'violation'}],
 ['optional-absence',r=>{r.material=null;r.policy.provenance='optional';},{status:'absent',policyResult:'pass'}],
 ['source-conflict',r=>{r.sourceConflicts=true;},{status:'unresolved',policyResult:'indeterminate'}],
 ['record-limit',r=>{r.material=Buffer.from(JSON.stringify({attestations:Array.from({length:129},()=>({predicateType:'unknown',bundle:{}}))})).toString('base64');},{status:'unresolved',policyResult:'indeterminate',reason:'ATTESTATIONS_LIMIT'}],
 ['input-limit',r=>{r.material='A'.repeat(262144);},{status:'unresolved',policyResult:'indeterminate',reason:'VERIFIER_INPUT_LIMIT'}],
 ]){const r=structuredClone(base);mutation(r);if(id==='expired')r.snapshot=await read('expired-snapshot.json');await check(id,r,expectation);await check(id+'-positive-after',base,cases[0].expected);}
await check('permissions',{operation:'probe',snapshot},{fileDenied:true,childDenied:true,networkDenied:true,uid:65534,nodeVersion:'v22.23.4',architecture:VERIFIER_PLATFORM==='linux/arm64'?'arm64':'x64'});
await check('deadline',{operation:'busy',snapshot},{status:'unresolved',reason:'VERIFIER_DEADLINE'});
const ctrl=new AbortController();setTimeout(()=>ctrl.abort(),1200);await check('cancellation',{operation:'busy',snapshot},{status:'unresolved',reason:'VERIFIER_CANCELLED'},false,ctrl.signal);
await check('allocation-cap',{operation:'memory',snapshot},{status:'unresolved',reason:'VERIFIER_WORKER_FAILED'});
await check('final-positive',base,cases[0].expected);
}
const production=await import('../packages/core/dist/trust.js');const rejected=await production.runVerificationWorker(base);const crossAnchorPass=rejected.result.status==='unresolved'&&rejected.result.reason==='ROOT_OR_INPUT_REJECTED'&&rejected.identity.cleanup==='confirmed_absent';await fs.writeFile(join(out,'production-rejects-controlled.json'),JSON.stringify({pass:crossAnchorPass,...rejected},null,2)+'\n',{flag:'wx'});
const summary={matrixOnly:process.argv.includes('--matrix-only'),productionRejectsControlled:crossAnchorPass,version:'heurisko-controlled-evaluation-v1',identity,fixtureManifestSha256:createHash('sha256').update(await fs.readFile(join(fixture,'manifest.json'))).digest('hex'),host:{platform:process.platform,arch:process.arch,node:process.version},worker:{platform:VERIFIER_PLATFORM,image:VERIFIER_IMAGE},checks:rows.length,passed:rows.every(r=>r.pass)&&crossAnchorPass,failures:rows.filter(r=>!r.pass).map(r=>r.id),limitation:'Controlled fixture acceptance only; no real npm publisher or native Linux host claim.'};await fs.writeFile(join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});if(!summary.passed)process.exitCode=1;
