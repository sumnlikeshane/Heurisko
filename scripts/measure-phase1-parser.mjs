// Trusted measurement copy of the existing worker, with final resource output.
// No production source, mount, parser limit, report or target execution changes.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {localDockerArgs,parserContainerArguments,safetyProfile,sha256,dockerParserDriver} from '../packages/core/dist/index.js';
if(process.version!=='v22.23.4'||!process.argv[2])throw Error('Pinned Node and fresh destination required');
const out=resolve(process.argv[2]);await fs.mkdir(out,{mode:0o700});
const original=await fs.readFile('packages/core/runtime/archive_worker.py','utf8');
const appended=`journal.close()\n    usage=resource.getrusage(resource.RUSAGE_SELF)\n    print(json.dumps(dict(measurement='phase1-trusted-worker-copy',userSeconds=usage.ru_utime,systemSeconds=usage.ru_stime,maxRssKiB=usage.ru_maxrss,cgroupMemoryPeakBytes=int(cgroup('memory.peak')),cgroupCpuStat=cgroup('cpu.stat'))),flush=True)`;
const modified=original.replace('journal.close()',appended);
const results=[];
for(const [name,path] of [
 ['local-mutation','examples/s2/current/inputs/picocolors-1.1.1.local-inert-mutation.tgz'],
 ['source','examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz'],
 ['npm-retained','examples/production-phase1/2026-11-01/npm/store/blobs/d3aedb2807967b7eb37fd11b03b7e3701e725af79c650d0812ff7213f8f882d9']
]) {
 const directory=join(out,name);await fs.mkdir(directory,{mode:0o700});const output=join(directory,'output');await fs.mkdir(output,{mode:0o777});await fs.chmod(output,0o777);
 const worker=join(directory,'worker.py');await fs.writeFile(worker,modified,{mode:0o444});const bytes=await fs.readFile(path);const input=join(directory,'input.tar');await fs.writeFile(input,bytes,{mode:0o444});
 const job='heurisko-parser-'+randomUUID(),limits={...safetyProfile.archive,...safetyProfile.parser};
 const id=await dockerParserDriver.create(parserContainerArguments({worker,input,output},limits,job,sha256(out).slice(7)));
 await fs.writeFile(join(directory,'job.json'),JSON.stringify({job,id,sourceSha256:sha256(original),measurementSha256:sha256(modified),inputSha256:sha256(bytes)},null,2)+'\n');
 const started=performance.now();const p=spawnSync('docker',localDockerArgs(['start','--attach',id]),{encoding:'utf8',timeout:45000,maxBuffer:1024*1024});
 await fs.writeFile(join(directory,'stdout.json'),p.stdout??'');await fs.writeFile(join(directory,'stderr.log'),p.stderr??'');
 if(p.status!==0)throw Error('Measurement failed; exact job and scratch retained: '+job);
 const measurement=JSON.parse(p.stdout);const journal=(await fs.readFile(join(output,'journal.jsonl'),'utf8')).trim().split('\n').map(JSON.parse);const result=journal.findLast(r=>r.kind==='result');
 if(!result.complete)throw Error('Incomplete worker measurement; preserve job: '+job);
 if(!await dockerParserDriver.remove(id))throw Error('Unconfirmed cleanup; preserve job: '+job);
 results.push({name,inputPath:path,inputSha256:sha256(bytes),compressedBytes:bytes.length,...result,...measurement,seconds:(performance.now()-started)/1000,exactRemovalConfirmed:true});
 await fs.writeFile(join(out,'validation.json'),JSON.stringify({scope:'Trusted measurement worker derived from current parser; cgroup peak includes worker/container overhead, not whole host Docker VM. Retained npm bytes, no fresh registry claim.',originalWorkerSha256:sha256(original),measurementWorkerSha256:sha256(modified),results},null,2)+'\n');
}
console.log(JSON.stringify(results.map(({name,cgroupMemoryPeakBytes,userSeconds,systemSeconds})=>({name,cgroupMemoryPeakBytes,userSeconds,systemSeconds}))));
