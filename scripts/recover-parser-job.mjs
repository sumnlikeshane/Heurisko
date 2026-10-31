// Explicit operator recovery only; no stale-lock guessing, bulk deletion or force.
import * as fs from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {execFile} from 'node:child_process';
import {EvidenceStore,boundedFile,sha256,writeImmutable,localDockerArgs} from '../packages/core/dist/index.js';
const [rootArg,name]=process.argv.slice(2);
if(!rootArg||!/^heurisko-parser-[a-f0-9-]{36}$/.test(name??''))throw Error('EXPLICIT_STORE_AND_JOB_REQUIRED');
const store=new EvidenceStore(resolve(rootArg));
// initialize verifies directory chains reject links, but cannot unlock anything.
await store.initialize();
const jobs=[];
for(const entry of await fs.readdir(join(store.root,'scratch'),{withFileTypes:true})) {
  if(!entry.isDirectory()||!/^parser-[A-Za-z0-9]+$/.test(entry.name))continue;
  const scratch=join(store.root,'scratch',entry.name);
  try {const job=JSON.parse(await boundedFile(join(scratch,'job.json'),4096));if(job.name===name)jobs.push({scratch,job});}
  catch(error){if(error.code!=='ENOENT')throw error;}
}
if(jobs.length!==1||jobs[0].job.storeLabel!==sha256(store.root).slice(7))throw Error('RECOVERY_JOB_NOT_BOUND');
const call=args=>new Promise((accept,reject)=>execFile('docker',localDockerArgs(args),{timeout:15000,maxBuffer:128*1024},(error,stdout,stderr)=>error?reject(Object.assign(error,{stderr})):accept(stdout)));
// A not-found response here cannot exclude a pending create. Require an actual
// acknowledged stopped object, then remove that immutable ID without force.
const [job]=JSON.parse(await call(['inspect',name]));
if(job.Name!=='/'+name||job.Config.Labels?.['heurisko.store']!==jobs[0].job.storeLabel||!/^[a-f0-9]{64}$/.test(job.Id)||job.State.Running||job.State.Pid!==0||!['created','exited','dead'].includes(job.State.Status))throw Error('RECOVERY_STOPPED_STATE_REQUIRED');
await call(['rm',job.Id]);
let absent=false;
try {await call(['inspect',job.Id]);}catch(error){absent=String(error.stderr).includes('No such object: '+job.Id);}
if(!absent)throw Error('RECOVERY_REMOVAL_UNCONFIRMED');
const receipt={version:'heurisko-parser-recovery-v1',name,containerId:job.Id,storeLabel:jobs[0].job.storeLabel,observedState:{status:job.State.Status,running:job.State.Running,pid:job.State.Pid,startedAt:job.State.StartedAt},removedWithoutForce:true,exactRemovalConfirmed:true,recoveredAt:new Date().toISOString()};
await writeImmutable(join(store.root,'state','parser-recoveries',name+'.json'),Buffer.from(JSON.stringify(receipt,null,2)+'\n'));
await fs.rm(jobs[0].scratch,{recursive:true});
await fs.rmdir(join(store.root,'.parser-lock'));
await fs.rmdir(join(store.root,'.write-lock'));
console.log(JSON.stringify(receipt));
