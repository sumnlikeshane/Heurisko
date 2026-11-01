import {removeSettledTestStore} from './helpers/recovery.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { EvidenceStore, inventoryArchive, dockerParserDriver, sha256, investigate, validateReport, deterministicReportDigest, exitCode, terminalText, manifestFields, safetyProfile, publicAddress, allowedURL, pinnedSourceURL, writeImmutable, decodeReport } from '../dist/index.js';

const root=resolve(import.meta.dirname,'../../..');
const python=join(root,'.venv/bin/python');
// Real public commit observed in exact-release metadata; local authored unit
// snapshots remain explicitly user asserted, not fabricated upstream evidence.
const commit='6f0a4638348ed20633d623ee973f9c9a96f65104';
const repo='https://github.com/alexeyraspopov/picocolors';
const options={enableAI:false,analysisProfile:'authored-s2-boundary-tests'};
const limits={...safetyProfile.archive,...safetyProfile.parser};
const archive=(entries,extra={})=>execFileSync(python,['-I',join(root,'packages/core/tests/helpers/make_archive.py')],{input:JSON.stringify({entries,...extra}),maxBuffer:32*1024*1024});
async function setup(t) {const path=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-s2-test-'));t.after(()=>removeSettledTestStore(path));return {path,store:new EvidenceStore(join(path,'store'))};}
const parse=async(store,entries,custom={},extra={})=>inventoryArchive(store,await store.put(archive(entries,extra)),{}, {...limits,...custom});
async function localCase(t,artifactEntries,sourceEntries,extra={}){
 const x=await setup(t);const artifact=join(x.path,'authored.tgz'),source=join(x.path,'authored-source.tgz');
 await fs.writeFile(artifact,archive(artifactEntries));await fs.writeFile(source,archive(sourceEntries));
 const input={ecosystem:'local',artifactPath:artifact,sourceOverride:{repo,commit},analysisOptions:options};
 const report=await investigate(input,options,{store:x.store,sourceArchivePath:source,...extra});return {...x,report,input,source};
}

test('known-answer member hashes, original names, binary bytes and modes are retained',async t=>{
 const {store}=await setup(t);const inv=await parse(store,[{path:'package/a.txt',text:'abc',mode:0o755},{path:'package/bin',hex:'0001ff1b'}]);
 assert.equal(inv.complete,true);assert.equal(inv.knownFiles,2);assert.equal(inv.knownBytes,7);
 assert.equal(inv.members[0].sha256,'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
 assert.equal(inv.members[0].mode,0o755);assert.equal(inv.members[0].originalName,'package/a.txt');
 assert.deepEqual(await store.get(inv.members[1].contentRef),Buffer.from('0001ff1b','hex'));
 assert.equal(inv.runtime.python,'3.13.18');assert.equal(inv.runtime.memoryBytes,256*1024*1024);assert.equal(inv.runtime.addressSpaceBytes,256*1024*1024);assert.equal(inv.runtime.cpuSeconds,10);assert.equal(inv.runtime.swapBytes,0);assert.equal(inv.runtime.rootReadOnly,true);assert.equal(inv.runtime.inputReadOnly,true);assert.equal(inv.runtime.workerReadOnly,true);assert.equal(inv.runtime.noNewPrivileges,'1');assert.deepEqual(inv.runtime.networkUpDevices,['lo']);assert.equal(inv.runtime.dockerSocketPresent,false);
});

for(const [name,entries] of [
 ['traversal',[{path:'../escape',text:'x'}]],['absolute',[{path:'/escape',text:'x'}]],['windows drive',[{path:'C:/escape',text:'x'}]],['backslash',[{path:'package\\escape',text:'x'}]],['empty component',[{path:'package//escape',text:'x'}]],['dot component',[{path:'package/./escape',text:'x'}]],['terminal name',[{path:'package/\u001bescape',text:'x'}]],['windows ambiguous',[{path:'package/NUL.txt',text:'x'}]],['trailing dot',[{path:'package/a.',text:'x'}]],
 ['duplicate',[{path:'package/a',text:'x'},{path:'package/a',text:'y'}]],['case collision',[{path:'package/A',text:'x'},{path:'package/a',text:'y'}]],['unicode collision',[{path:'package/é',text:'x'},{path:'package/e\u0301',text:'y'}]],['file parent',[{path:'package/a',text:'x'},{path:'package/a/b',text:'y'}]],['directory parent case',[{path:'package/A',text:'x'},{path:'package/a/b',text:'y'}]],
 ['implicit directory case',[{path:'package/A/a',text:'x'},{path:'package/a/b',text:'y'}]],
 ...['symlink','hardlink','fifo','device'].map(type=>[type,[{path:'package/bad',type,target:'../../escape'}]])
])test(`refuses ${name} without materializing archive-controlled paths`,async t=>{
 const {path,store}=await setup(t);const inv=await parse(store,entries);assert.equal(inv.complete,false);assert.equal(inv.remainingScope,'unknown');assert.match(inv.code,/^ARCHIVE_/);
 assert.deepEqual(await fs.readdir(join(store.root,'scratch')),[]);await assert.rejects(fs.stat(join(path,'escape')),{code:'ENOENT'});
});

test('cross-UID parser output stays host-readable inside a private job root',async t=>{
 const {store}=await setup(t);let outputPath,checked=false;
 const driver={...dockerParserDriver,async create(args){
  const mount=args.find(x=>x.startsWith('type=bind,src=')&&x.endsWith(',dst=/out'));
  outputPath=mount.slice('type=bind,src='.length,-',dst=/out'.length);return dockerParserDriver.create(args);
 },async remove(id){
  if(outputPath){
   const names=await fs.readdir(outputPath);const files=names.filter(n=>n==='journal.jsonl'||/^\d+\.member$/.test(n));
   assert.ok(files.includes('journal.jsonl'));assert.ok(files.some(n=>n.endsWith('.member')));
   for(const name of files)assert.equal((await fs.stat(join(outputPath,name))).mode&0o777,0o644,'transport output must be non-executable and readable across UIDs');
   assert.equal((await fs.stat(resolve(outputPath,'..'))).mode&0o777,0o700,'host private job parent must remain inaccessible to other users');checked=true;
  }
  return dockerParserDriver.remove(id);
 }};
 const ref=await store.put(archive([{path:'package/a',text:'authored inert permission probe'}]));
 const result=await inventoryArchive(store,ref,{parserJobDriver:driver});
 assert.equal(result.complete,true);assert.equal(result.runtime.uid,65534);assert.equal(result.runtime.journalMode,0o644);assert.equal(checked,true);
});

test('actual expansion, member, path/depth and entry limits preserve known/unknown coverage',async t=>{
 const {store}=await setup(t);
 for(const [entries,custom] of [
 [[{path:'package/huge',text:'a'.repeat(10000)}],{expandedBytes:4096}],
 [[{path:'package/a',text:'a'.repeat(1000)}],{memberBytes:128}],
 [[{path:'package/a',text:'a'},{path:'package/b',text:'b'}],{entries:1}],
 [[{path:'package/deep/a',text:'a'}],{pathDepth:2}],
 [[{path:'package/long',text:'a'}],{pathBytes:8}]
 ]){const inv=await parse(store,entries,custom);assert.equal(inv.complete,false);assert.equal(inv.remainingScope,'unknown');assert.match(inv.code,/LIMIT/);}
 const known=await parse(store,[{path:'package/a',text:'abc'},{path:'package/b',type:'symlink'}]);
 assert.equal(known.knownFiles,1);assert.equal(known.knownBytes,3);assert.equal((await store.get(known.members[0].contentRef)).toString(),'abc');
});

test('truncated/corrupt archives and hidden trailing archives fail rather than clean-empty',async t=>{
 const {store}=await setup(t);const good=archive([{path:'package/a',text:'abc'}]);
 const plain=archive([{path:'package/a',text:'abc'}],{gzip:false});const badCRC=Buffer.from(good);badCRC[badCRC.length-5]^=1;
 for(const b of [good.subarray(0,good.length-5),badCRC,plain.subarray(0,1024),Buffer.concat([plain,plain]),Buffer.from('not a tar')]){
  const inv=await inventoryArchive(store,await store.put(b));assert.equal(inv.complete,false);assert.equal(inv.remainingScope,'unknown');
 }
});

test('archive-byte variation changes identities while all raw members stay equal',async t=>{
 const {store}=await setup(t);const entries=[{path:'package/a',text:'abc'}];
 const a=archive(entries,{gzipMtime:1}),b=archive(entries,{gzipMtime:2});assert.notEqual(sha256(a),sha256(b));
 const ai=await inventoryArchive(store,await store.put(a)),bi=await inventoryArchive(store,await store.put(b));
 assert.equal(ai.complete,true);assert.equal(bi.complete,true);assert.equal(ai.members[0].sha256,bi.members[0].sha256);
});

test('explicit raw producer mode computes additions/removals/modifications and exact manifest spans with unavailable analysis',async t=>{
 const source=[{path:'source-root/a.txt',text:'old\n'},{path:'source-root/removed',text:'remove'},{path:'source-root/package.json',text:'{"name":"authored","scripts":{},"main":"a.txt"}'}];
 const artifact=[{path:'package/a.txt',text:'new\n'},{path:'package/added.js',text:'// HEURISKO_INERT_TEST_MARKER\n'},{path:'package/package.json',text:'{"name":"authored","scripts":{"postinstall":"HEURISKO_INERT_TEST_ONLY"},"main":"added.js"}'}];
 const {report,store}=await localCase(t,artifact,source,{analysisModuleSelector:'off'});
 await validateReport(report);await store.verifyEvidence(report);
 assert.deepEqual(report.bundle.changes.map(c=>c.status).sort(),['added','modified','modified','removed']);
 const delta=report.bundle.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='scripts.postinstall');assert.ok(delta);
 const d=JSON.parse((await store.get(delta.contentRef)).toString());const bytes=await store.get(d.artifactContentRef);
 assert.equal(bytes.subarray(d.artifact.startByte,d.artifact.endByte).toString(),'"HEURISKO_INERT_TEST_ONLY"');
 assert.equal(report.outcomes.artifactIntegrity,'not_checked');assert.equal(report.outcomes.analysisCompleteness,'incomplete');assert.equal(report.analysis.findings.length,0);assert.equal(exitCode(report),2);
 assert.equal(report.analysis.stages.find(s=>s.stage==='heuristics').errors[0].code,'ANALYSIS_MODULE_UNAVAILABLE');assert.equal(report.analysis.aiState.status,'disabled');
 assert.equal(report.bundle.coverage.complete,true);assert.ok(!JSON.stringify(report).includes(root));
});

test('replay preserves deterministic IDs; full run bytes and observation references remain distinct',async t=>{
 const entries=[{path:'package/a',text:'abc'}],source=[{path:'root/a',text:'abc'}];const {report,store,input,source:sourcePath}=await localCase(t,entries,source);
 const again=await investigate(input,options,{store,sourceArchivePath:sourcePath});assert.equal(report.reportId,again.reportId);assert.equal(deterministicReportDigest(report),deterministicReportDigest(again));
 const r1=await store.saveReport(report),r2=await store.saveReport(again);assert.notEqual(r1,r2);assert.deepEqual(await store.loadReport(r1),report);
 assert.equal((await fs.readdir(join(store.root,'runs',report.reportId))).length,2);
 const mutated=structuredClone(report);mutated.analysisConfigFingerprint='other';await assert.rejects(store.saveReport(mutated));
});

test('missing/wrong subtree, partial inventory and binary differences remain visible',async t=>{
 const x=await localCase(t,[{path:'package/a',hex:'0001ff'},{path:'package/bad',type:'symlink'}],[{path:'root/a',hex:'0002ff'}]);
 assert.equal(x.report.bundle.coverage.complete,false);assert.equal(x.report.outcomes.analysisCompleteness,'incomplete');assert.equal(x.report.bundle.changes.find(c=>c.artifactPath==='package/a').status,'modified');
 assert.ok(x.report.bundle.coverage.limitations.some(s=>s.includes('unknown')));
 const y=await investigate({...x.input,sourceOverride:{repo,commit,subdirectory:'missing'}},options,{store:x.store,sourceArchivePath:x.source});
 assert.equal(y.bundle.stages.find(s=>s.stage==='source').errors[0].code,'SOURCE_SUBTREE_MISSING');assert.notEqual(y.reportId,x.report.reportId);assert.equal(y.bundle.coverage.omissions.length,1);
 const missing=await investigate({...x.input,sourceOverride:undefined},options,{store:x.store});assert.equal(missing.outcomes.sourceAssociation,'unavailable');assert.ok(missing.bundle.changes.every(c=>c.status==='unresolved'));
});

test('requested policy remains indeterminate; exit precedence retains simultaneous conditions',async t=>{
 const {report,input,store,source}=await localCase(t,[{path:'package/a',text:'abc'}],[{path:'root/a',text:'abc'}]);
 const policy=await investigate(input,{...options,trustPolicyRef:'test-policy-not-implemented'},{store,sourceArchivePath:source});assert.equal(policy.outcomes.policyResult,'indeterminate');assert.equal(exitCode(policy),2);
 assert.equal(exitCode(),3);assert.equal(exitCode({outcomes:{analysisCompleteness:'incomplete',policyResult:'violation'}}),1);assert.equal(exitCode({outcomes:{analysisCompleteness:'complete',policyResult:'pass'}}),0);assert.equal(exitCode({outcomes:{analysisCompleteness:'failed',policyResult:'not_evaluated'}}),2);
});

test('strict manifest scanner rejects duplicate/deep malformed JSON, preserves unicode byte spans',()=>{
 for(const b of ['{"x":1,"x":2}','{"x":}','{"x":NaN}','[1,2]',JSON.stringify({x:'a'.repeat(300000)})])assert.throws(()=>manifestFields(Buffer.from(b)));
 const b=Buffer.from('{"é":"日本","scripts":{"postinstall":"INERT"}}');const field=manifestFields(b).get('/scripts/postinstall');assert.equal(b.subarray(field.startByte,field.endByte).toString(),'"INERT"');
});

test('CAS rejects escaping refs, corrupt data, symlinks, cap/reserve and conflicting immutable writes',async t=>{
 const {path,store}=await setup(t);const ref=await store.put(Buffer.from('abc'));
 for(const value of ['../../escape','file:///tmp/a','sha256:../escape','sha256:'+('A'.repeat(64))])await assert.rejects(store.get(value),/INVALID_CONTENT_REF/);
 await fs.writeFile(store.blobPath(ref),'bad');await assert.rejects(store.get(ref),/BLOB_HASH_MISMATCH/);
 const tiny=new EvidenceStore(join(path,'tiny'),{capBytes:1,reserveBytes:0});await assert.rejects(tiny.put(Buffer.from('ab')),/STORE_CAP/);
 const reserve=new EvidenceStore(join(path,'reserve'),{capBytes:1024,reserveBytes:Number.MAX_SAFE_INTEGER});await assert.rejects(reserve.put(Buffer.from('a')),/STORE_DISK_RESERVE/);
 const out=join(path,'out');await writeImmutable(out,Buffer.from('one'));await assert.rejects(writeImmutable(out,Buffer.from('two')),/IMMUTABLE_COLLISION/);assert.equal((await fs.readFile(out)).toString(),'one');
 await fs.symlink(out,join(path,'link'));await assert.rejects(writeImmutable(join(path,'link'),Buffer.from('two')));
 await fs.symlink(join(path,'tiny'),join(path,'linked-store'));await assert.rejects(new EvidenceStore(join(path,'linked-store')).initialize(),/UNSAFE_STORAGE_DIRECTORY/);
});

test('interrupted publication leaves old blobs readable and incomplete new records unreferenced',async t=>{
 const {store}=await setup(t);const ref=await store.put(Buffer.from('prior'));
 await fs.writeFile(join(store.root,'blobs','.pending-authored-interruption'),'partial');assert.equal((await store.get(ref)).toString(),'prior');
 await fs.mkdir(join(store.root,'.write-lock'));await assert.rejects(store.put(Buffer.from('next')),/STORE_BUSY_RECOVERY_REQUIRED/);assert.equal((await store.get(ref)).toString(),'prior');
 // This test authored the publication lock without creating any parser job.
 // Release only that known fixture lock; real unresolved parser roots stay closed.
 assert.deepEqual(await fs.readdir(join(store.root,'scratch')),[]);await fs.rmdir(join(store.root,'.write-lock'));
});

test('cancellation/timeout kills the whole parser job and cleans only its private scratch',async t=>{
 const {store}=await setup(t);const ref=await store.put(archive([{path:'package/a',text:'abc'}]));
 const c=new AbortController();c.abort();await assert.rejects(inventoryArchive(store,ref,{signal:c.signal}),/CANCELLED/);
 const timed=await inventoryArchive(store,ref,{}, {...limits,wallMs:1});assert.equal(timed.complete,false);assert.equal(timed.code,'PARSER_TIMEOUT');assert.deepEqual(await fs.readdir(join(store.root,'scratch')),[]);
 const c2=new AbortController();const running=inventoryArchive(store,ref,{signal:c2.signal});setTimeout(()=>c2.abort(),100);const cancelled=await running;assert.equal(cancelled.complete,false);assert.equal(cancelled.code,'CANCELLED');
 assert.equal(execFileSync('docker',['ps','-aq','--filter',`label=heurisko.store=${sha256(store.root).slice(7)}`],{encoding:'utf8'}).trim(),'');
});

test('network rejects private/reserved/mapped addresses, credentials, redirects outside allowlist and mutable commits',()=>{
 for(const a of ['127.0.0.1','10.0.0.1','169.254.169.254','192.168.1.1','172.31.0.1','100.64.1.1','198.18.0.1','203.0.113.1','224.1.2.3','0.0.0.0','::','::1','fe80::1','fc00::1','::ffff:8.8.8.8','2001:db8::1','2002:0808:0808::','3fff::1','fe80::1%en0'])assert.equal(publicAddress(a),false,a);
 for(const a of ['8.8.8.8','1.1.1.1','2606:4700:4700::1111'])assert.equal(publicAddress(a),true,a);
 for(const u of ['http://registry.npmjs.org/a','https://user:pass@registry.npmjs.org/a','https://127.0.0.1/a','https://registry.npmjs.org:444/a','https://example.com/a','https://registry.npmjs.org.evil.test/a'])assert.throws(()=>allowedURL(u));
 for(const c of ['main','v1.1.1','6f0a463'])assert.throws(()=>pinnedSourceURL(repo,c));assert.match(pinnedSourceURL(repo,commit),new RegExp(commit+'$'));
});

test('CLI is redirected/JSON-safe, inspect resolves exact retained evidence; terminal controls remain inert',async t=>{
 const {report,store,path,input,source}=await localCase(t,[{path:'package/a',text:'\u001b]52;c;INERT\u0007\n'}],[{path:'root/a',text:'abc'}]);
 const reportFile=join(path,'report.json');await fs.writeFile(reportFile,JSON.stringify(report));const cli=join(root,'packages/cli/dist/index.js');
 const run=(args)=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8',maxBuffer:8*1024*1024});
 const inspect=run(['inspect',reportFile,'--store',store.root,'--json']);assert.equal(inspect.status,exitCode(report));assert.deepEqual(JSON.parse(inspect.stdout),report);assert.equal(inspect.stderr,'');
 const e=report.bundle.evidence.find(e=>e.kind==='artifact_member');const human=run(['inspect',reportFile,'--store',store.root,'--evidence',e.evidenceId,'--no-color']);assert.equal(human.status,exitCode(report));assert.ok(!human.stdout.includes('\u001b'));assert.ok(!human.stdout.includes('\u0007'));
 const analyzed=run(['analyze','--artifact',input.artifactPath,'--source',repo,'--commit',commit,'--source-archive',source,'--store',store.root,'--name','\u009bLABEL\u202e','--no-ai','--json']);const cliReport=JSON.parse(analyzed.stdout);assert.equal(analyzed.status,exitCode(cliReport));assert.ok(!/[\u009b\u202e]/.test(analyzed.stdout));assert.equal(cliReport.bundle.artifact.packageName,'\u009bLABEL\u202e');assert.equal(cliReport.bundle.artifact.observedSha256,report.bundle.artifact.observedSha256);assert.notEqual(cliReport.reportId,report.reportId,'Different CLI analysis profile must change identity');assert.match(analyzed.stderr,/persist: complete/);
 const defaultRun=run(['analyze','--artifact',input.artifactPath,'--source',repo,'--commit',commit,'--source-archive',source,'--store',store.root,'--name','\u009bLABEL\u202e','--json']);
 const defaultReport=JSON.parse(defaultRun.stdout);
 assert.equal(defaultRun.status,analyzed.status);
 assert.equal(defaultReport.analysis.aiState.status,'disabled');
 assert.equal(defaultReport.reportId,cliReport.reportId,'The default and explicit --no-ai paths must have the same evaluation identity');
 assert.deepEqual(defaultReport.analysis.findings,cliReport.analysis.findings);
 const bad=run(['analyze','--artifact',input.artifactPath,'--unknown']);assert.equal(bad.status,3);assert.equal(bad.stdout,'');assert.ok(!bad.stderr.includes(path));
 assert.equal(terminalText('\u001b[31m\u009btest\u202e'),'\\u001b[31m\\u009btest\\u202e');
});

test('manifest parser omissions and metadata-only executable modes stay explicit',async t=>{
 const {report}=await localCase(t,[{path:'package/package.json',text:'{"a":1,"a":2}'},{path:'package/a',text:'same',mode:0o755}],[{path:'root/package.json',text:'{"a":1}'},{path:'root/a',text:'same',mode:0o644}]);
 assert.equal(report.bundle.coverage.complete,false);assert.ok(report.bundle.coverage.unsupportedBytes>0);assert.equal(report.bundle.coverage.omissions.filter(x=>x.kind==='unsupported').length,2);
 const same=report.bundle.changes.find(c=>c.artifactPath==='package/a');assert.equal(same.rawEquality,'equal');assert.ok(same.notes.some(x=>x.includes('metadata')));
 assert.ok(report.bundle.evidence.some(e=>e.kind==='raw_diff'&&e.locator.metadataKey==='archive-member-metadata'));
});

test('report persistence failure returns usable incomplete JSON while retaining raw evidence',async t=>{
 const {path}=await setup(t);
 class FullReportStore extends EvidenceStore{async saveReport(){throw new Error('STORE_DISK_RESERVE');}}
 const store=new FullReportStore(join(path,'store'));const artifact=join(path,'authored.tgz'),source=join(path,'source.tgz');await fs.writeFile(artifact,archive([{path:'package/a',text:'abc'}]));await fs.writeFile(source,archive([{path:'root/a',text:'abc'}]));
 const report=await investigate({ecosystem:'local',artifactPath:artifact,analysisOptions:options,sourceOverride:{repo,commit}},options,{store,sourceArchivePath:source});await validateReport(report);await store.verifyEvidence(report);
 assert.equal(report.outcomes.analysisCompleteness,'incomplete');assert.equal(report.bundle.stages.find(s=>s.stage==='persist').errors[0].code,'STORE_DISK_RESERVE');assert.equal(exitCode(report),2);
});

test('parser backpressure and queued cancellation do not start extra work',async t=>{
 const {store}=await setup(t);const ref=await store.put(archive([{path:'package/a',text:'abc'}]));const controllers=Array.from({length:8},()=>new AbortController());
 const first=inventoryArchive(store,ref);const queued=controllers.map(c=>inventoryArchive(store,ref,{signal:c.signal}).then(()=>({ok:true}),e=>({code:e.message})));
 await assert.rejects(inventoryArchive(store,ref),/PARSER_QUEUE_FULL/);controllers.forEach(c=>c.abort());assert.ok((await Promise.all(queued)).every(r=>r.code==='CANCELLED'));assert.equal((await first).complete,true);
});

test('opaque archive metadata never permits an invalid UTF-8 pathname',async t=>{
 const {store}=await setup(t);const bytes=archive([{path:'package/a',text:'abc'}],{gzip:false});bytes.fill(0,0,100);Buffer.from([112,97,99,107,97,103,101,47,255]).copy(bytes,0);bytes.fill(32,148,156);const checksum=bytes.subarray(0,512).reduce((n,x)=>n+x,0);bytes.write(checksum.toString(8).padStart(6,'0')+'\0 ',148,'ascii');
 const inv=await inventoryArchive(store,await store.put(bytes));assert.equal(inv.complete,false);assert.equal(inv.code,'ARCHIVE_NAME_ENCODING');assert.equal(inv.knownFiles,0);
});

test('a supplied M0-style skipped heuristics stage cannot earn complete analysis',async t=>{
 const {store,input,source}=await localCase(t,[{path:'package/a',text:'abc'}],[{path:'root/a',text:'abc'}]);
 const module={moduleId:'trusted-m0-boundary-test',moduleVersion:'0.1.0',implementationSha256:sha256('authored-m0-test-module'),configurationSha256:sha256('{}'),async analyzeEvidence(){return {schemaVersion:'0.1.0',findings:[],interpretations:[],aiState:{status:'disabled',validation:'not_run'},stages:[{stage:'heuristics',status:'skipped',errors:[]},{stage:'ai',status:'skipped',errors:[]}],limitations:['Authored M0 boundary test; rules unavailable.']};}};
 const report=await investigate(input,options,{store,sourceArchivePath:source,module});assert.equal(report.outcomes.analysisCompleteness,'incomplete');assert.equal(exitCode(report),2);
});

test('CAS and publication snapshot caller-owned bytes before asynchronous filesystem work',async t=>{
 const {path,store}=await setup(t);const bytes=Buffer.from('original');const expected=sha256(bytes);const writing=store.put(bytes);bytes.fill(120);const ref=await writing;assert.equal(ref,expected);assert.equal((await store.get(ref)).toString(),'original');
 const output=join(path,'immutable');const text=Buffer.from('before');const publishing=writeImmutable(output,text);text.fill(120);await publishing;assert.equal((await fs.readFile(output)).toString(),'before');
});

test('report identity and invocation cannot drift while validation/persistence awaits',async t=>{
 const {report,store,input,source,path}=await localCase(t,[{path:'package/a',text:'abc'}],[{path:'root/a',text:'abc'}]);
 const original=structuredClone(report);const saving=store.saveReport(report);report.reportId='../../escape';report.bundle.artifact.artifactFilename='changed';const ref=await saving;assert.deepEqual(await store.loadReport(ref),original);await assert.rejects(fs.stat(join(path,'escape.json')),{code:'ENOENT'});
 const request=structuredClone(input);const investigating=investigate(request,options,{store,sourceArchivePath:source});request.artifactPath='/this-authored-path-must-never-be-read';request.sourceOverride.commit='main';const stable=await investigating;assert.equal(stable.reportId,original.reportId);
});
