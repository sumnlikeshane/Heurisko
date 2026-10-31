// Authored spinning development worker; never package code. Same restricted mounts/limits.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {runParserJob,dockerParserDriver,parserContainerArguments,localDockerArgs,safetyProfile,sha256,writeImmutable,EvidenceStore} from '../packages/core/dist/index.js';
const root=resolve('.heurisko/part4-hot-cleanup-'+randomUUID());await fs.mkdir(root,{recursive:true,mode:0o700});
const worker=join(root,'worker.py'),input=join(root,'input.tar'),output=join(root,'output');
await fs.writeFile(worker,'import resource\nresource.setrlimit(resource.RLIMIT_CPU,(10,10))\nwhile True: pass\n',{mode:0o444});await fs.writeFile(input,'authored inert control probe',{mode:0o444});await fs.mkdir(output,{mode:0o777});await fs.chmod(output,0o777);
const name='heurisko-parser-'+randomUUID(),controller=new AbortController();let id,observedRunning=false,confirmed=false,pollDone;
const call=args=>new Promise((res,rej)=>execFile('docker',localDockerArgs(args),{timeout:10000,maxBuffer:16384},(error,stdout,stderr)=>error?rej(Object.assign(error,{stderr})):res(stdout)));
const driver={...dockerParserDriver,async create(args){id=await dockerParserDriver.create(args);await fs.writeFile(join(root,'exact-job.json'),JSON.stringify({name,id}));return id;},start(key,onStderr){const handle=dockerParserDriver.start(key,onStderr);pollDone=(async()=>{for(let i=0;i<80;i++){const [state]=JSON.parse(await call(['inspect',key]));if(state.State.Running&&state.State.Pid>0){observedRunning=true;controller.abort();return;}await new Promise(r=>setTimeout(r,25));}throw Error('HOT_JOB_NOT_OBSERVED');})();return handle;}};
const result=await runParserJob(parserContainerArguments({worker,input,output},{...safetyProfile.archive,...safetyProfile.parser},name,sha256(root).slice(7)),name,30000,controller.signal,driver);
await pollDone;
if(!observedRunning||result.code!=='CANCELLED'||!result.cleanupConfirmed)throw Error('HOT_CANCEL_NOT_CONFIRMED');
try{await call(['inspect',id]);throw Error('EXACT_JOB_STILL_PRESENT');}catch(e){if(!String(e.stderr).includes('No such object: '+id))throw e;}
confirmed=true;
const store=new EvidenceStore(join(root,'store'));await store.put(Buffer.from('reuse after exact absence acknowledgment'));
const receipt={version:1,observedAt:new Date().toISOString(),scope:'authored trusted development worker, no analyzed package execution',name,containerId:id,observedRunning,hotCancellation:true,result,exactIdAbsentBeforeStoreReuse:true,storeReusePassed:true,spoolRemovalAfterExactAbsence:true,limits:safetyProfile.parser};
await writeImmutable(resolve('integration/part4/receipts/resumed/hot-cleanup.json'),Buffer.from(JSON.stringify(receipt,null,2)+'\n'));
if(confirmed)await fs.rm(root,{recursive:true});
console.log(JSON.stringify(receipt));
