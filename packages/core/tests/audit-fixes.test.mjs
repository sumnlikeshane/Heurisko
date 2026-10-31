import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {EvidenceStore,investigate,inventoryArchive,runParserJob,sha256,analysisModuleIdentity,canonicalJSON,deterministicReportDigest} from '../dist/index.js';

const id='a'.repeat(64),name='heurisko-parser-authored-test';
function driver(overrides={}) {
  const calls=[];
  return {calls,create:async()=>{calls.push('create');return id;},start:key=>{calls.push('start:'+key);return {done:Promise.resolve(0),close:()=>calls.push('close')};},kill:async key=>{calls.push('kill:'+key);},remove:async key=>{calls.push('remove:'+key);return true;},...overrides};
}
test('acknowledged parser creation starts/removes only the exact immutable container ID',async()=>{
  const d=driver();assert.deepEqual(await runParserJob([],name,1000,undefined,d),{code:'PARSER_INTERRUPTED',cleanupConfirmed:true});
  assert.deepEqual(d.calls,['create','start:'+id,'remove:'+id]);
});
test('cancel during delayed acknowledged creation waits for the acknowledgment and never starts',async()=>{
  const c=new AbortController();let ready;
  const d=driver({create:()=>new Promise(resolve=>{ready=resolve;})});
  const pending=runParserJob([],name,1000,c.signal,d);c.abort();ready(id);
  assert.deepEqual(await pending,{code:'CANCELLED',cleanupConfirmed:true});assert.deepEqual(d.calls,['remove:'+id]);
});
test('unacknowledged create plus immediate not-found never proves cleanup before late creation',async()=>{
  let lateCreation=false;
  const d=driver({create:async()=>{throw Error('authored lost create acknowledgment');},remove:async()=>false});
  const result=await runParserJob([],name,1000,undefined,d);
  lateCreation=true; // daemon finishes after the client's failed remove
  assert.equal(lateCreation,true);assert.deepEqual(result,{code:'PARSER_CREATE_UNCONFIRMED',cleanupConfirmed:false});assert.ok(!d.calls.some(c=>c.startsWith('start:')));
});
test('failed exact removal remains unconfirmed even after a successful parse',async()=>{
  const d=driver({remove:async()=>false});assert.equal((await runParserJob([],name,1000,undefined,d)).cleanupConfirmed,false);
});
test('attach startup failure still removes the acknowledged exact job',async()=>{
  const d=driver({start:()=>{throw Error('authored spawn failure');}});
  assert.deepEqual(await runParserJob([],name,1000,undefined,d),{code:'PARSER_UNAVAILABLE',cleanupConfirmed:true});
  assert.deepEqual(d.calls,['create','remove:'+id]);
});
test('wall timeout awaits exact daemon cleanup instead of only killing its attach client',async()=>{
  const d=driver({start:key=>{d.calls.push('start:'+key);return {done:new Promise(()=>{}),close:()=>d.calls.push('close')};}});
  assert.deepEqual(await runParserJob([],name,10,undefined,d),{code:'PARSER_TIMEOUT',cleanupConfirmed:true});
  assert.deepEqual(d.calls,['create','start:'+id,'kill:'+id,'close','remove:'+id]);
});
test('unconfirmed creation retains private spool, durable job identity and both store locks',async t=>{
  const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-authored-recovery-'));
  // The injected driver has no real daemon/job; deleting this authored fixture
  // cannot remove the records of an unverified real container.
  t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const store=new EvidenceStore(join(dir,'store')),ref=await store.put(Buffer.from('authored inert nonarchive'));
  const d=driver({create:async()=>{throw Error('lost acknowledgment');},remove:async()=>false});
  await assert.rejects(inventoryArchive(store,ref,{parserJobDriver:d}),/PARSER_CLEANUP_UNCONFIRMED/);
  for(const lock of ['.write-lock','.parser-lock'])assert.equal((await fs.stat(join(store.root,lock))).isDirectory(),true);
  const scratch=join(store.root,'scratch',(await fs.readdir(join(store.root,'scratch')))[0]);
  const job=JSON.parse(await fs.readFile(join(scratch,'job.json')));assert.match(job.name,/^heurisko-parser-/);
  assert.deepEqual(JSON.parse(await fs.readFile(join(scratch,'outcome.json'))),{version:'heurisko-parser-job-outcome-v1',code:'PARSER_CREATE_UNCONFIRMED',cleanupConfirmed:false});
  await assert.rejects(store.put(Buffer.from('must not reuse')),/STORE_BUSY_RECOVERY_REQUIRED/);
});
for(const scenario of ['stopped','running','wrong-label','missing'])test('explicit recovery '+scenario+' verifies identity before releasing only its own records',async t=>{
  const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-authored-recovery-cli-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
  const store=new EvidenceStore(join(dir,'store'));await store.initialize();
  const jobName='heurisko-parser-12345678-1234-1234-1234-123456789abc',scratch=join(store.root,'scratch','parser-authored');
  await fs.mkdir(scratch);await fs.writeFile(join(scratch,'job.json'),JSON.stringify({name:jobName,storeLabel:sha256(store.root).slice(7)}));
  await fs.mkdir(join(store.root,'.parser-lock'));await fs.mkdir(join(store.root,'.write-lock'));
  const prior=join(store.root,'scratch','unrelated');await fs.mkdir(prior);await fs.writeFile(join(prior,'keep'),'authored prior evidence');
  const binary=join(dir,'docker'),removed=join(dir,'removed');
  // Only this authored fake CLI runs. No daemon or target package is contacted.
  const data={Id:id,Name:'/'+jobName,Config:{Labels:{'heurisko.store':scenario==='wrong-label'?'wrong':sha256(store.root).slice(7)}},State:{Status:scenario==='running'?'running':'created',Running:scenario==='running',Pid:scenario==='running'?123:0,StartedAt:'0001-01-01T00:00:00Z'}};
  await fs.writeFile(binary,`#!${process.execPath}\nconst fs=require('node:fs');const cmd=process.argv[4],ref=process.argv[5];const removed=${JSON.stringify(removed)};if(cmd==='inspect'){if(${JSON.stringify(scenario)}==='missing'||fs.existsSync(removed)){process.stderr.write('Error: No such object: '+ref);process.exit(1);}process.stdout.write(JSON.stringify([${JSON.stringify(data)}]));}else if(cmd==='rm'){if(process.argv.length!==6||ref!==${JSON.stringify(id)})process.exit(2);fs.writeFileSync(removed,'exact ID only');process.stdout.write(ref);}else if(cmd==='container'&&ref==='ls'){if(process.argv.slice(6).join(' ')!==${JSON.stringify('--all --quiet --no-trunc --filter id='+id)})process.exit(2);process.stdout.write(fs.existsSync(removed)?'':${JSON.stringify(id)});}else process.exit(2);\n`,{mode:0o700});
  const root=resolve(import.meta.dirname,'../../..');
  const result=spawnSync(process.execPath,[join(root,'scripts/recover-parser-job.mjs'),store.root,jobName],{env:{...process.env,PATH:dir+':'+process.env.PATH},encoding:'utf8'});
  assert.equal((await fs.readFile(join(prior,'keep'),'utf8')),'authored prior evidence');
  if(scenario==='stopped') {
    assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).exactRemovalConfirmed,true);
    await assert.rejects(fs.stat(scratch),{code:'ENOENT'});await assert.rejects(fs.stat(join(store.root,'.parser-lock')),{code:'ENOENT'});
  } else {
    assert.notEqual(result.status,0);assert.equal((await fs.stat(join(store.root,'.parser-lock'))).isDirectory(),true);await assert.rejects(fs.stat(removed),{code:'ENOENT'});
  }
});
const settings={enableAI:false,analysisProfile:'authored-audit-regressions'};
function module(implementation='A',configuration='{}',complete=false) {
  return {moduleId:'authored-reviewed-module',moduleVersion:'0.1.0',implementationSha256:sha256(implementation),configurationSha256:sha256(configuration),async analyzeEvidence(){return {schemaVersion:'0.1.0',findings:[],interpretations:[],aiState:{status:'disabled',validation:'not_run'},stages:[{stage:'heuristics',status:complete?'complete':'skipped',errors:[]},{stage:'ai',status:'skipped',errors:[]}],limitations:['Authored no-model identity regression.']};}};
}
test('missing executable/configuration digest is rejected before an injected module can run',async()=>{
  for(const field of ['implementationSha256','configurationSha256']) {
    const m=module();delete m[field];assert.throws(()=>analysisModuleIdentity(m),/ANALYSIS_MODULE_IDENTITY_REQUIRED/);
    await assert.rejects(investigate({},settings,{module:m}),/ANALYSIS_MODULE_IDENTITY_REQUIRED/);
  }
});
test('same package version with changed implementation or rule settings produces distinct report identities',async t=>{
  const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-audit-real-static-'));
  t.after(async()=>{const locks=await fs.readdir(join(dir,'store')).catch(()=>[]);assert.ok(!locks.includes('.parser-lock')&&!locks.includes('.write-lock'),'retain real unresolved jobs for recovery');await fs.rm(dir,{recursive:true,force:true});});
  const root=resolve(import.meta.dirname,'../../..'),store=new EvidenceStore(join(dir,'store'));
  const input={ecosystem:'local',artifactPath:join(root,'examples/s2/current/inputs/picocolors-1.1.1.local-inert-mutation.tgz'),sourceOverride:{repo:'https://github.com/alexeyraspopov/picocolors',commit:'6f0a4638348ed20633d623ee973f9c9a96f65104'},analysisOptions:settings};
  const context={store,sourceArchivePath:join(root,'examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz')};
  const events=[];const first=await investigate(input,settings,{...context,module:module(),onProgress:e=>{events.push(e);assert.throws(()=>{e.status='failed';});throw Error('authored renderer error');}});
  const next=await investigate(input,settings,{...context,module:module('B','{}',true)});
  const configured=await investigate(input,settings,{...context,module:module('B','{"rule":true}',true)});
  const again=await investigate(input,settings,{...context,module:module()});
  assert.notEqual(first.reportId,next.reportId);assert.notEqual(next.reportId,configured.reportId);assert.equal(again.reportId,first.reportId);assert.equal(deterministicReportDigest(first),deterministicReportDigest(again));
  const config=JSON.parse(await store.get(first.bundle.evidence.find(e=>e.locator.metadataKey==='analysis-configuration').contentRef));
  assert.equal(config.version,'heurisko-config-v3');assert.equal(config.analysisModule.implementationSha256,sha256('A'));
  for(const stage of ['resolve_artifact','acquire','source','provenance','inventory','compare','build','heuristics','ai','persist']) {
    const observed=events.filter(e=>e.stage===stage);assert.ok(observed.length,stage);assert.ok(['complete','incomplete','failed','skipped'].includes(observed.at(-1).status),stage+': terminal state');
  }
  assert.equal(canonicalJSON(first.outcomes),canonicalJSON(again.outcomes));
});

test('spool and both locks remain until delayed exact-job removal is acknowledged',async t=>{
 const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-authored-delayed-removal-'));
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const store=new EvidenceStore(join(dir,'store')),ref=await store.put(Buffer.from('authored inert input'));
 let finishRemoval,entered;const removing=new Promise(r=>{entered=r;});
 const d=driver({remove:key=>{assert.equal(key,id);entered();return new Promise(r=>{finishRemoval=r;});}});
 const pending=inventoryArchive(store,ref,{parserJobDriver:d});await removing;
 assert.equal((await fs.stat(join(store.root,'.parser-lock'))).isDirectory(),true);
 assert.equal((await fs.stat(join(store.root,'.write-lock'))).isDirectory(),true);
 const scratch=join(store.root,'scratch',(await fs.readdir(join(store.root,'scratch')))[0]);
 assert.equal((await fs.stat(join(scratch,'job.json'))).isFile(),true);
 await assert.rejects(store.put(Buffer.from('reuse forbidden during removal')),/STORE_BUSY_RECOVERY_REQUIRED/);
 finishRemoval(true);await pending;
 await assert.rejects(fs.stat(scratch),{code:'ENOENT'});
 await store.put(Buffer.from('reuse only after acknowledged exact removal'));
});
test('late acknowledged creation after wall timeout never starts and awaits exact cleanup',async()=>{
 let acknowledge;const d=driver({create:()=>new Promise(r=>{acknowledge=r;})});
 const pending=runParserJob([],name,10,undefined,d);await new Promise(r=>setTimeout(r,30));acknowledge(id);
 assert.deepEqual(await pending,{code:'PARSER_TIMEOUT',cleanupConfirmed:true});assert.deepEqual(d.calls,['remove:'+id]);
});
