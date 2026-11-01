import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {EvidenceStore,investigate,inventoryArchive,runParserJob,sha256,analysisModuleIdentity,canonicalJSON,deterministicReportDigest,createIntelligenceModule,evidenceId,runAnalysis,exitCode} from '../dist/index.js';

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
test('approved exit precedence keeps violation, incomplete, indeterminate and not-evaluated outcomes distinct',()=>{
 assert.equal(exitCode(),3);
 assert.equal(exitCode({outcomes:{analysisCompleteness:'incomplete',policyResult:'violation'}}),1);
 assert.equal(exitCode({outcomes:{analysisCompleteness:'complete',policyResult:'violation'}}),1);
 assert.equal(exitCode({outcomes:{analysisCompleteness:'incomplete',policyResult:'indeterminate'}}),2);
 assert.equal(exitCode({outcomes:{analysisCompleteness:'complete',policyResult:'indeterminate'}}),2);
 assert.equal(exitCode({outcomes:{analysisCompleteness:'complete',policyResult:'pass'}}),0);
 assert.equal(exitCode({outcomes:{analysisCompleteness:'complete',policyResult:'not_evaluated'}}),0);
 assert.equal(exitCode({outcomes:{analysisCompleteness:'failed',policyResult:'not_evaluated'}}),2);
});
test('integrated Malhar module reads only hash-verified retained manifest delta under the shared two-argument interface',async t=>{
 const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-intelligence-handshake-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const root=resolve(import.meta.dirname,'../../..'),store=new EvidenceStore(join(dir,'store'));
 const bundle=JSON.parse(await fs.readFile(join(root,'packages/contracts/tests/fixtures/F1/bundle.json'),'utf8'));
 const record=bundle.evidence.find(e=>e.kind==='manifest_delta'),change=bundle.changes.find(c=>c.evidenceIds.includes(record.evidenceId));
 const delta=Buffer.from(JSON.stringify({version:'heurisko-manifest-delta-v1',pointer:'/scripts/postinstall',source:null,artifact:{value:'node install.js'}}));
 record.contentRef=await store.put(delta);record.contentSha256=record.contentRef;record.contentState='retained';record.evidenceId=evidenceId(bundle,record);change.evidenceIds=[record.evidenceId];
 const before=JSON.stringify(bundle),module=await createIntelligenceModule(store),result=await runAnalysis(bundle,{enableAI:false,analysisProfile:'synthetic-g0'},module,{pythonExecutable:process.env.HEURISKO_PYTHON_EXECUTABLE??join(root,'.venv/bin/python')});
 const finding=result.findings.find(f=>f.ruleId==='heurisko.manifest.lifecycle-script-change');
 assert.equal(module.moduleId,'@heurisko/intelligence');assert.equal(module.moduleVersion,JSON.parse(await fs.readFile(join(root,'packages/intelligence/package.json'),'utf8')).version);
 assert.match(finding.observation,/scripts\.postinstall is reported as added to the artifact/);assert.deepEqual(finding.evidenceIds,[record.evidenceId]);assert.equal(result.stages.find(s=>s.stage==='heuristics').status,'complete');assert.equal(JSON.stringify(bundle),before);
});
test('integrated model-off module accepts the retained real S2 release and inert-mutation bundles',async()=>{
 const root=resolve(import.meta.dirname,'../../..'),store=new EvidenceStore(join(root,'examples/s2/current/store'));
 const module=await createIntelligenceModule(store);
 for(const [name,file,expectedFindings] of [
  ['release','release-local-input.bundle.json',14],
  ['mutation','synthetic-local-mutation.bundle.json',16],
 ]) {
  const bundle=JSON.parse(await fs.readFile(join(root,'examples/s2/current/outputs',file),'utf8'));
  const before=JSON.stringify(bundle);assert.equal(bundle.fixtureKind,'real_generated');
  for(const item of bundle.evidence)if(item.contentState==='retained'&&item.contentRef)await store.get(item.contentRef);
  const result=await runAnalysis(bundle,{...bundle.input.analysisOptions,enableAI:false},module,{pythonExecutable:process.env.HEURISKO_PYTHON_EXECUTABLE??join(root,'.venv/bin/python')});
  const known=new Set(bundle.evidence.map(item=>item.evidenceId));
  assert.equal(result.findings.length,expectedFindings,name);assert.equal(result.aiState.status,'disabled',name);
  assert.equal(result.stages.find(stage=>stage.stage==='heuristics').status,'complete',name);
  assert.ok(result.findings.every(finding=>finding.evidenceIds.length>0&&finding.evidenceIds.every(id=>known.has(id))),`${name}: findings cite bundle evidence`);
  assert.equal(JSON.stringify(bundle),before,`${name}: analysis does not mutate the real bundle`);
  if(name==='release') {
   const sourceOnly=bundle.changes.find(change=>change.status==='removed');
   assert.ok(result.findings.some(f=>f.ruleId==='heurisko.change.unresolved-difference'&&f.evidenceIds.some(id=>sourceOnly.evidenceIds.includes(id))&&f.observation.includes('has no artifact counterpart')));
  }
  if(name==='mutation') {
   assert.ok(result.findings.some(f=>f.ruleId==='heurisko.manifest.lifecycle-script-change'&&f.evidenceIds.some(id=>bundle.evidence.find(e=>e.evidenceId===id)?.locator.metadataKey==='scripts.postinstall')));
   const artifactOnly=bundle.changes.find(change=>change.status==='added');
   assert.ok(result.findings.some(f=>f.ruleId==='heurisko.change.unresolved-difference'&&f.evidenceIds.some(id=>artifactOnly.evidenceIds.includes(id))&&f.observation.includes('has no source counterpart')));
  }
 }
});
test('manifest resolver marks missing, corrupt and oversized retained delta content incomplete',async t=>{
 const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-intelligence-bounds-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const root=resolve(import.meta.dirname,'../../..'),store=new EvidenceStore(join(dir,'store'));
 const template=JSON.parse(await fs.readFile(join(root,'packages/contracts/tests/fixtures/F1/bundle.json'),'utf8'));
 const valid=Buffer.from(JSON.stringify({version:'heurisko-manifest-delta-v1',pointer:'/scripts/postinstall',source:null,artifact:{value:'node install.js'}}));
 const oversized=Buffer.from(JSON.stringify({version:'heurisko-manifest-delta-v1',pointer:'/scripts/postinstall',source:null,artifact:{value:'x'.repeat(16*1024)}}));
 const module=await createIntelligenceModule(store);
 for(const [caseName,stored,corrupt,expectedCode] of [
  ['missing',valid,false,'READ_FAILED'],
  ['corrupt',valid,true,'BLOB_HASH_MISMATCH'],
  ['oversized',oversized,false,'FILE_LIMIT_OR_TYPE'],
 ]) {
  const bundle=structuredClone(template),record=bundle.evidence.find(e=>e.kind==='manifest_delta'),change=bundle.changes.find(c=>c.evidenceIds.includes(record.evidenceId));
  const ref=sha256(stored);if(caseName!=='missing')await store.put(stored);
  record.contentRef=ref;record.contentSha256=ref;record.contentState='retained';record.evidenceId=evidenceId(bundle,record);change.evidenceIds=[record.evidenceId];
  if(corrupt)await fs.writeFile(store.blobPath(ref),Buffer.from('corrupt evidence bytes'));
  const result=await runAnalysis(bundle,{enableAI:false,analysisProfile:'synthetic-g0'},module,{pythonExecutable:process.env.HEURISKO_PYTHON_EXECUTABLE??join(root,'.venv/bin/python')});
  assert.equal(result.stages.find(stage=>stage.stage==='heuristics').status,'incomplete',caseName);
  assert.ok(result.stages.find(stage=>stage.stage==='heuristics').errors.some(error=>error.code==='EVIDENCE_RESOLUTION_INCOMPLETE'),caseName);
  assert.ok(result.limitations.some(text=>text.includes(expectedCode)),caseName);
 }
});
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
  const context={store,sourceArchivePath:join(root,'examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz'),pythonExecutable:process.env.HEURISKO_PYTHON_EXECUTABLE??join(root,'.venv/bin/python')};
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
