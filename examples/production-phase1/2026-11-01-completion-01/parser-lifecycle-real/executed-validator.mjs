// Real Docker lifecycle drills over inert archive bytes. New destination only.
// Never guesses lock ownership; failed recovery retains its store/container.
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { execFileSync,spawnSync } from 'node:child_process';
import http from 'node:http';
import { homedir,platform } from 'node:os';
import { EvidenceStore, inventoryArchive, dockerParserDriver } from '../packages/core/dist/index.js';
assert.equal(process.version,'v22.23.4');
if(!process.argv[2])throw Error('Fresh destination required');
const out=resolve(process.argv[2]);await fs.mkdir(out);
const archive=execFileSync(resolve('.venv/bin/python'),['-I','packages/core/tests/helpers/make_archive.py'],{input:JSON.stringify({entries:[{path:'package/inert.txt',text:'original Phase 1 lifecycle probe\n'}]})});
const results=[];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(const scenario of ['delayed-create-cancel','delayed-remove','unacknowledged-create','unacknowledged-remove']) {
 const directory=join(out,scenario);await fs.mkdir(directory);const store=new EvidenceStore(join(directory,'store')),ref=await store.put(archive);
 const controller=new AbortController();let id,resolveRemoval,enteredRemoval,statsRequest;const removalEntered=new Promise(r=>enteredRemoval=r);const samples=[];
 const driver={...dockerParserDriver,
  async create(args) {id=await dockerParserDriver.create(args);if(scenario==='delayed-create-cancel'){controller.abort();await sleep(75);}if(scenario==='unacknowledged-create')throw Error('authored lost acknowledgment after actual Docker create');return id;},
  start(key) {
   const socketPath=platform()==='darwin'?join(homedir(),'.docker/run/docker.sock'):'/var/run/docker.sock';
   statsRequest=http.get({socketPath,path:'/containers/'+key+'/stats?stream=1&one-shot=false'},response=>{
    let pending='';response.on('data',chunk=>{pending+=chunk;let n;while((n=pending.indexOf('\n'))>=0){const line=pending.slice(0,n);pending=pending.slice(n+1);try{const s=JSON.parse(line);samples.push({read:s.read,memory:s.memory_stats,cpu:s.cpu_stats});}catch{}}});response.on('error',()=>{});
   });statsRequest.on('error',()=>{});
   return dockerParserDriver.start(key);
  },
  async remove(key) {
   if(scenario==='unacknowledged-create'||scenario==='unacknowledged-remove')return false;
   if(scenario==='delayed-remove') {enteredRemoval();await new Promise(r=>resolveRemoval=r);}
   return dockerParserDriver.remove(key);
  }
 };
 const pending=inventoryArchive(store,ref,{parserJobDriver:driver,signal:controller.signal});
 if(scenario==='delayed-remove'){
  await removalEntered;assert.ok((await fs.stat(join(store.root,'.parser-lock'))).isDirectory());assert.ok((await fs.stat(join(store.root,'.write-lock'))).isDirectory());
  await assert.rejects(store.put(Buffer.from('cannot reuse')),/STORE_BUSY_RECOVERY_REQUIRED/);resolveRemoval();
 }
 const inventory=await pending;statsRequest?.destroy();
 let recovery;
 if(scenario.startsWith('unacknowledged')) {
  await assert.rejects(store.put(Buffer.from('must remain locked')),/STORE_BUSY_RECOVERY_REQUIRED/);
  const scratch=await fs.readdir(join(store.root,'scratch'));assert.equal(scratch.length,1);
  const job=JSON.parse(await fs.readFile(join(store.root,'scratch',scratch[0],'job.json'),'utf8'));
  const recovered=spawnSync(process.execPath,['scripts/recover-parser-job.mjs',store.root,job.name],{encoding:'utf8',maxBuffer:1024*1024});
  await fs.writeFile(join(directory,'recovery.stdout.json'),recovered.stdout);await fs.writeFile(join(directory,'recovery.stderr.log'),recovered.stderr);
  assert.equal(recovered.status,0,recovered.stderr);recovery=JSON.parse(recovered.stdout);assert.equal(recovery.exactRemovalConfirmed,true);
 }
 await store.put(Buffer.from('usable only after confirmed exact removal'));
 assert.deepEqual(await fs.readdir(join(store.root,'scratch')),[]);
 results.push({scenario,exactContainerId:id,inventoryCode:inventory.code,complete:inventory.complete,recovery,samples,resourceLimit:'Docker stream samples may miss short-lived peaks; zero samples is unmeasured, not zero use.'});
 await fs.writeFile(join(out,'validation.json'),JSON.stringify({host:platform(),scenarios:results},null,2)+'\n');
}
console.log(JSON.stringify({passed:results.length,receipt:out}));
