import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';

// Authored control-plane fixtures only. These tests never contact Docker or
// claim cryptographic verification; the real restricted worker suite does that.
const id='a'.repeat(64);
async function scenario(t,mode) {
 const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-verifier-lifecycle-'));
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const calls=join(dir,'calls.jsonl'),abortRequested=join(dir,'abort-requested');
 const script=`#!${process.execPath}
const fs=require('node:fs'),a=process.argv.slice(4),mode=${JSON.stringify(mode)},id=${JSON.stringify(id)};
const calls=${JSON.stringify(calls)},previous=fs.existsSync(calls)?fs.readFileSync(calls,'utf8').trim().split('\\n').map(JSON.parse):[];
fs.appendFileSync(calls,JSON.stringify(a)+'\\n');
const created=previous.find(x=>x[0]==='create'),name=created?.[created.indexOf('--name')+1];
const missing=()=>{process.stderr.write(mode==='alternate-missing'?'Error response from daemon: No such container: '+id:'Error: No such object: '+id);process.exit(1);};
if(a[0]==='create'){if(mode==='lost-ack'){process.stderr.write('authored lost acknowledgement');process.exit(1);}if(mode==='cancel-create'){const timer=setInterval(()=>{if(fs.existsSync(${JSON.stringify(abortRequested)})){clearInterval(timer);setTimeout(()=>process.stdout.write(id+'\\n'),20);}},5);}else process.stdout.write(id+'\\n');}
else if(a[0]==='start'){process.stdout.write(JSON.stringify({status:'not_checked',artifactBinding:'not_checked',policyResult:'not_evaluated',reason:'AUTHORED_CONTROL_FIXTURE'}));}
else if(a[0]==='inspect'){
 if(mode==='inspect-error'){process.stderr.write('authored inspection denied');process.exit(1);}
 if(mode==='lost-ack'||previous.some(x=>x[0]==='rm'))missing();
 const state={Running:false,Pid:0,Status:'exited',StartedAt:'2026-11-02T00:00:00Z',FinishedAt:'2026-11-02T00:00:00.100Z',OOMKilled:false,ExitCode:0};
 const object={Id:mode==='wrong-id'?'b'.repeat(64):id,Name:mode==='wrong-name'?'/heurisko-verifier-unrelated':'/'+name,State:state};
 if(a[1]==='--format')process.stdout.write(a[2]==='{{.State.Running}}'?'false':a[2]==='{{json .State}}'?JSON.stringify(state):JSON.stringify(object));
 else process.stdout.write(JSON.stringify([object]));
}
else if(a[0]==='rm'){if(mode==='remove-error'){process.stderr.write('authored remove response lost');process.exit(1);}process.stdout.write(id);}
else if(a[0]==='container'&&a[1]==='ls'){
 if(mode==='query-error'){process.stderr.write('authored query denied');process.exit(1);}
 if(mode==='still-present')process.stdout.write(id+'\\n');
 if(mode==='unexpected-query')process.stdout.write('authored unexpected output');
}
else if(a[0]!=='kill')process.exit(2);
`;
 await fs.writeFile(join(dir,'docker'),script,{mode:0o700});
 const target=new URL('../dist/trust.js',import.meta.url).href;
 const cancellation=mode==='cancel-create'?`const controller=new AbortController();const pending=runVerificationWorker({operation:'authored-control-fixture'},controller.signal);const timer=setInterval(()=>{if(fs.existsSync(${JSON.stringify(calls)})){fs.writeFileSync(${JSON.stringify(abortRequested)},'authored cancel');controller.abort();clearInterval(timer);}},5);console.log(JSON.stringify(await pending));clearInterval(timer);`:`console.log(JSON.stringify(await runVerificationWorker({operation:'authored-control-fixture'})));`;
 const child=spawnSync(process.execPath,['--input-type=module','-e',`import fs from 'node:fs';import {runVerificationWorker} from ${JSON.stringify(target)};${cancellation}`],{env:{...process.env,PATH:dir+':'+process.env.PATH},encoding:'utf8',timeout:10000});
 assert.equal(child.status,0,child.stderr);
 return {result:JSON.parse(child.stdout),calls:(await fs.readFile(calls,'utf8')).trim().split('\n').map(JSON.parse)};
}
test('verifier binds acknowledged creation to immutable ID for every subsequent control',async t=>{
 const r=await scenario(t,'exact-id');
 assert.equal(r.result.identity.cleanup,'confirmed_absent');
 for(const call of r.calls.filter(c=>['start','inspect','kill','rm'].includes(c[0])))assert.equal(call.at(-1),id,JSON.stringify(call));
 assert.ok(r.calls.some(c=>c[0]==='container'&&c.includes('id='+id)),'successful exact-ID query required');
});
test('verifier confirms exact absence without depending on missing-object wording',async t=>{
 const r=await scenario(t,'alternate-missing');
 assert.equal(r.result.result.reason,'AUTHORED_CONTROL_FIXTURE');
 assert.equal(r.result.identity.cleanup,'confirmed_absent');
});
for(const mode of ['query-error','still-present','unexpected-query'])test('verifier absence remains uncertain after '+mode,async t=>{
 const r=await scenario(t,mode);
 assert.equal(r.result.result.status,'unresolved');
 assert.equal(r.result.identity.cleanup,'unknown');
 assert.equal(r.result.result.reason,'VERIFIER_CLEANUP_UNCONFIRMED');
});
test('verifier lost create acknowledgement plus absent lookup never proves cleanup',async t=>{
 const r=await scenario(t,'lost-ack');
 assert.equal(r.result.result.status,'unresolved');
 assert.equal(r.result.result.reason,'VERIFIER_CREATION_UNCERTAIN');
 assert.equal(r.result.identity.cleanup,'unknown');
 assert.ok(!r.calls.some(c=>c[0]==='start'),'unacknowledged job must not start');
});
test('verifier cancellation during create awaits bounded acknowledgement and never starts',async t=>{
 const r=await scenario(t,'cancel-create');
 assert.equal(r.result.result.reason,'VERIFIER_CANCELLED');
 assert.equal(r.result.identity.creationAcknowledged,true);
 assert.equal(r.result.identity.cleanup,'confirmed_absent');
 assert.ok(!r.calls.some(c=>c[0]==='start'),'cancelled job must never start');
});
test('verifier retains failed removal even when exact final absence settles cleanup',async t=>{
 const r=await scenario(t,'remove-error');
 assert.equal(r.result.identity.cleanup,'confirmed_absent');
 assert.equal(r.result.result.status,'unresolved');
 assert.equal(r.result.result.policyResult,'indeterminate');
 assert.ok(r.result.identity.primaryFailure,'the failed removal must remain recorded');
 assert.ok(r.calls.some(c=>c[0]==='container'&&c.includes('id='+id)));
});
test('verifier retains failed inspection even when exact final absence settles cleanup',async t=>{
 const r=await scenario(t,'inspect-error');
 assert.equal(r.result.identity.cleanup,'confirmed_absent');
 assert.equal(r.result.result.status,'unresolved');
 assert.equal(r.result.result.policyResult,'indeterminate');
 assert.ok(r.result.identity.primaryFailure,'the failed inspection must remain recorded');
});
for(const mode of ['wrong-id','wrong-name'])test('verifier rejects inspected object identity mismatch: '+mode,async t=>{
 const r=await scenario(t,mode);
 assert.equal(r.result.result.status,'unresolved');
 assert.equal(r.result.identity.cleanup,'unknown');
 assert.ok(!r.calls.some(c=>['kill','rm'].includes(c[0])),'unbound object must not be mutated');
});
