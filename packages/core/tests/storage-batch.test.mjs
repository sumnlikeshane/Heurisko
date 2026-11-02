import {removeSettledTestStore} from './helpers/recovery.mjs';
import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import {join} from 'node:path';import {tmpdir} from 'node:os';
import {EvidenceStore,sha256} from '../dist/index.js';
async function setup(t){const p=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-batch-'));t.after(()=>removeSettledTestStore(p));const store=new EvidenceStore(join(p,'store'),{capBytes:1024*1024,reserveBytes:0});await store.initialize();return store;}
test('bounded batch preserves immutable prefix and releases only its own writer lock on overrun',async t=>{const s=await setup(t);await assert.rejects(s.putBatch(3,async put=>{await put(Buffer.from('abc'));await put(Buffer.from('x'));}),/STORE_BATCH_LIMIT/);assert.equal((await s.get(sha256('abc'))).toString(),'abc');await assert.rejects(fs.access(join(s.root,'.write-lock')),e=>e.code==='ENOENT');await s.put(Buffer.from('later'));});
test('batch reservation enforces store cap before writes and cannot interleave a competing writer',async t=>{const s=await setup(t);await s.put(Buffer.alloc(800000));let called=false;await assert.rejects(s.putBatch(300000,async()=>{called=true;}),/STORE_CAP/);assert.equal(called,false);await s.putBatch(10,async put=>{await assert.rejects(s.put(Buffer.from('competing')),/STORE_BUSY_RECOVERY_REQUIRED/);await put(Buffer.from('owned'));});});
test('batch checks prior digest bytes rather than silently replacing a corrupted CAS object',async t=>{const s=await setup(t);await s.put(Buffer.from('abc'));await fs.writeFile(s.blobPath(sha256('abc')),'bad');await assert.rejects(s.putBatch(3,put=>put(Buffer.from('abc'))),/BLOB_HASH_MISMATCH/);assert.equal(await fs.readFile(s.blobPath(sha256('abc')),'utf8'),'bad');});
test('real parser import cancellation retains its admitted prefix and settles both locks',async t=>{
 const {inventoryArchive}=await import('../dist/index.js'),{execFileSync}=await import('node:child_process');
 const s=await setup(t);s.limits.capBytes=1024*1024*1024;
 const controller=new AbortController(),original=s.putBatch.bind(s);
 s.putBatch=(budget,work)=>original(budget,put=>work(async bytes=>{const ref=await put(bytes);controller.abort();return ref;}));
 const archive=execFileSync('.venv/bin/python',['-I','packages/core/tests/helpers/make_archive.py'],{input:JSON.stringify({entries:Array.from({length:5},(_,i)=>({path:'package/'+i+'.txt',text:'inert '+i}))})});
 const result=await inventoryArchive(s,await s.put(archive),{signal:controller.signal});assert.equal(result.complete,false);assert.equal(result.code,'CANCELLED');assert.equal(result.knownFiles,1);assert.equal((await s.get(result.members[0].contentRef)).toString(),'inert 0');
 for(const lock of ['.write-lock','.parser-lock'])await assert.rejects(fs.access(join(s.root,lock)),e=>e.code==='ENOENT');
});
test('actual investigation cancellation before comparison never earns complete coverage or invents assessed paths',async t=>{
 const {investigate,exitCode}=await import('../dist/index.js'),{execFileSync}=await import('node:child_process');const s=await setup(t);s.limits.capBytes=1024*1024*1024;
 const make=entries=>execFileSync('.venv/bin/python',['-I','packages/core/tests/helpers/make_archive.py'],{input:JSON.stringify({entries})}),artifact=join(s.root,'artifact.tgz'),source=join(s.root,'source.tgz');
 await fs.writeFile(artifact,make([{path:'package/index.js',text:'changed\n'}]));await fs.writeFile(source,make([{path:'repo/index.js',text:'original\n'}]));
 const controller=new AbortController(),options={enableAI:false,analysisProfile:'raw-static-s3-v1'};
 const r=await investigate({ecosystem:'local',artifactPath:artifact,sourceOverride:{repo:'https://github.com/alexeyraspopov/picocolors',commit:'6f0a4638348ed20633d623ee973f9c9a96f65104'},analysisOptions:options},options,{store:s,sourceArchivePath:source,signal:controller.signal,onProgress:p=>{if(p.stage==='compare'&&p.status==='running')controller.abort();}});
 assert.equal(r.bundle.changes.length,0);assert.equal(r.bundle.coverage.complete,false);assert.equal(r.bundle.coverage.comparedFiles,0);assert.equal(r.bundle.stages.find(s=>s.stage==='compare').status,'incomplete');assert.equal(exitCode(r),2);
});
test('unconfirmed parser settlement surfaces its original error and preserves recovery evidence',async t=>{
 const {investigate}=await import('../dist/index.js'),{execFileSync}=await import('node:child_process');
 const root=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-unsettled-parser-')),store=new EvidenceStore(join(root,'store'));
 const artifact=join(root,'artifact.tgz');await fs.writeFile(artifact,execFileSync('.venv/bin/python',['-I','packages/core/tests/helpers/make_archive.py'],{input:JSON.stringify({entries:[{path:'package/index.js',text:'inert'}]})}));
 const options={enableAI:false,analysisProfile:'raw-static-s3-v1'};let removals=0;
 const parserJobDriver={create:async()=> 'a'.repeat(64),start:()=>({done:Promise.resolve(1),close(){}}),kill:async()=>{},remove:async()=>{removals++;return false;}};
 await assert.rejects(investigate({ecosystem:'local',artifactPath:artifact,analysisOptions:options},options,{store,parserJobDriver}),/PARSER_CLEANUP_UNCONFIRMED/);
 assert.equal(removals,1);for(const lock of ['.write-lock','.parser-lock'])assert.equal((await fs.stat(join(store.root,lock))).isDirectory(),true);
 const scratch=await fs.readdir(join(store.root,'scratch'));assert.equal(scratch.length,1);const receipt=JSON.parse(await fs.readFile(join(store.root,'scratch',scratch[0],'outcome.json')));assert.equal(receipt.cleanupConfirmed,false);
 t.diagnostic('Intentionally retained simulated unsettled job, spool and locks: '+root);
});
