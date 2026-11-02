import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join,dirname,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
const id='c'.repeat(64);
for(const mode of ['create-unacknowledged','remove-unconfirmed','remove-error-absent','success'])test('parser boundary harness retains actual cleanup facts: '+mode,async t=>{
 const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-boundary-harness-test-'));
 t.after(()=>fs.rm(dir,{recursive:true,force:true}));
 const calls=join(dir,'calls.jsonl');
 const fake=`#!${process.execPath}
const fs=require('node:fs'),a=process.argv.slice(4),mode=${JSON.stringify(mode)};fs.appendFileSync(${JSON.stringify(calls)},JSON.stringify(a)+'\\n');
if(a[0]==='create'){if(mode==='create-unacknowledged'){process.stderr.write('authored lost acknowledgement');process.exit(1);}process.stdout.write(${JSON.stringify(id)});}
else if(a[0]==='start'){const prev=fs.readFileSync(${JSON.stringify(calls)},'utf8').trim().split('\\n').map(JSON.parse),create=prev.filter(x=>x[0]==='create').at(-1),cpu=create.some(x=>x.includes('/cpu/'));if(cpu){process.stdout.write('{"cpuStarted":true}');process.exit(137);}process.stdout.write(JSON.stringify({memoryLimit:268435456,hostSentinelVisible:false,dockerSocketVisible:false,oversizeAllocationBlocked:true,egressBlocked:true,rootWriteBlocked:true,inputWriteBlocked:true,workerWriteBlocked:true}));}
else if(a[0]==='rm'){if(mode!=='success'){process.stderr.write('authored remove failure');process.exit(1);}}
else if(a[0]==='container'&&a[1]==='ls'){if(mode==='remove-unconfirmed')process.stdout.write(${JSON.stringify(id)});}
else process.exit(2);
`;
 await fs.writeFile(join(dir,'docker'),fake,{mode:0o700});
 const root=resolve(import.meta.dirname,'../../..');
 const child=spawnSync(process.execPath,[join(root,'scripts/check-parser-boundary.mjs')],{env:{...process.env,PATH:dir+':'+process.env.PATH},encoding:'utf8',timeout:10000});
 const observed=(await fs.readFile(calls,'utf8')).trim().split('\n').map(JSON.parse),create=observed.find(c=>c[0]==='create');
 const worker=create.find(c=>c.startsWith('type=bind,src=')&&c.includes('dst=/worker.py'));
 const source=worker.slice('type=bind,src='.length).split(',dst=')[0],parent=dirname(dirname(source));
 // Only authored fake commands ran. Cleaning these fixtures cannot remove
 // records or mounts belonging to any real daemon job.
 t.after(()=>fs.rm(parent,{recursive:true,force:true}));
 if(['create-unacknowledged','remove-unconfirmed'].includes(mode)){
  assert.notEqual(child.status,0);
  assert.equal(await fs.readFile(source,'utf8').then(()=>true,()=>false),true,'uncertain mounted worker must be retained');
 }else{
  assert.equal(child.status,mode==='success'?0:1,child.stderr);
  assert.equal(await fs.stat(parent).then(()=>true,()=>false),false,'confirmed absence permits local fixture cleanup');
 }
 if(mode!=='create-unacknowledged'){
  assert.ok(observed.some(c=>c[0]==='container'&&c.includes('id='+id)),'exact successful query required');
  for(const c of observed.filter(c=>['start','rm'].includes(c[0])))assert.equal(c.at(-1),id,'controls must use acknowledged immutable ID');
 }
});
