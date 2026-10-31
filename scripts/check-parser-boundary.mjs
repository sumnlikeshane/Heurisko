// Trusted development probes only. Never supplied by a package or a report.
import * as fs from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { localDockerArgs,parserContainerArguments,safetyProfile,sha256,writeImmutable } from '../packages/core/dist/index.js';
const parent=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-parser-probe-'));
const limits={...safetyProfile.archive,...safetyProfile.parser};
const run=(args)=>spawnSync('docker',localDockerArgs(args),{encoding:'utf8',timeout:10000,maxBuffer:8192,env:{PATH:process.env.PATH,HOME:process.env.HOME}});
const results=[];
try {
 for(const mode of ['memory-network-mounts','cpu']) {
  const directory=join(parent,mode);await fs.mkdir(directory,{mode:0o700});
  const worker=join(directory,'worker.py'),input=join(directory,'input.tar'),output=join(directory,'output');await fs.mkdir(output,{mode:0o777});await fs.chmod(output,0o777);await fs.writeFile(input,'authored control probe');await fs.chmod(input,0o444);
  const sentinel=join(parent,'host-private-sentinel');await fs.writeFile(sentinel,'INERT_PRIVATE_SENTINEL');
  const python=mode==='cpu'?`import resource,json\nresource.setrlimit(resource.RLIMIT_CPU,(1,1))\nprint(json.dumps({'cpuStarted':True}),flush=True)\nwhile True: pass\n`:`import resource,json,socket,os\nresource.setrlimit(resource.RLIMIT_AS,(${limits.memoryBytes},${limits.memoryBytes}))\nr={'memoryLimit':${limits.memoryBytes},'hostSentinelVisible':os.path.exists(${JSON.stringify(sentinel)}),'dockerSocketVisible':os.path.exists('/var/run/docker.sock')}\ntry: bytearray(512*1024*1024);r['oversizeAllocationBlocked']=False\nexcept MemoryError:r['oversizeAllocationBlocked']=True\ns=socket.socket();s.settimeout(0.2)\ntry:s.connect(('203.0.113.1',9));r['egressBlocked']=False\nexcept OSError:r['egressBlocked']=True\nfor key,path in [('rootWriteBlocked','/tmp/heurisko-probe'),('inputWriteBlocked','/input.tar'),('workerWriteBlocked','/worker.py')]:\n try:\n  with open(path,'wb') as f:f.write(b'INERT')\n  r[key]=False\n except OSError:r[key]=True\nprint(json.dumps(r),flush=True)\n`;
  await fs.writeFile(worker,python);await fs.chmod(worker,0o444);
  const name='heurisko-parser-'+randomUUID();
  try {
   const create=run(parserContainerArguments({worker,input,output},limits,name,sha256(parent).slice(7)));if(create.status!==0)throw new Error('PROBE_CREATE_FAILED');
   const started=run(['start','--attach',name]);
   if(mode==='cpu'){if(started.status!==137||!started.stdout.includes('cpuStarted'))throw new Error('CPU_LIMIT_NOT_ENFORCED');results.push({probe:mode,exitCode:started.status,cpuHardLimitSeconds:1,wholeJobTerminated:true});}
   else {if(started.status!==0)throw new Error('PROBE_FAILED');const facts=JSON.parse(started.stdout);if(Object.entries(facts).some(([key,value])=>key.endsWith('Blocked')?!value:key.endsWith('Visible')?value:false))throw new Error('BOUNDARY_NOT_ENFORCED');results.push({probe:mode,...facts});}
  } finally {const removed=run(['rm','-f',name]);if(removed.status!==0)throw new Error('PROBE_CLEANUP_FAILED');}
 }
 const result={version:'heurisko-parser-boundary-check-v1',observedAt:new Date().toISOString(),image:safetyProfile.parser.image,scope:'trusted development resource probes, not target/rebuild execution',results};
 if(process.argv[2])await writeImmutable(resolve(process.argv[2]),Buffer.from(JSON.stringify(result,null,2)+'\n'));console.log(JSON.stringify(result,null,2));
} finally {await fs.rm(parent,{recursive:true,force:true});}
