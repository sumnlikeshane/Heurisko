// Explicit local operation only. Fixed-host capture is separate from verification.
import fs from 'node:fs/promises';import {resolve,join} from 'node:path';
import {runVerificationWorker} from '../packages/core/dist/trust.js';
const [dirArg,outArg,priorArg]=process.argv.slice(2);if(!dirArg||!outArg)throw Error('captured directory, NEW output and optional prior snapshot required');
const dir=resolve(dirArg),read=async name=>{const b=await fs.readFile(join(dir,name));if(b.length>262144)throw Error('INPUT_LIMIT');return b;};
const capture=JSON.parse(await read('capture.json')),b64=async name=>(await read(name)).toString('base64');
const rotations=(await fs.readdir(dir)).filter(n=>/^\d+\.root.json$/.test(n)).sort((a,b)=>parseInt(a)-parseInt(b));
const previous=priorArg?JSON.parse(await fs.readFile(priorArg)):undefined;
const floor=previous?.minimumVersions??{root:15,timestamp:0,snapshot:0,targets:0};
const snapshot={version:'heurisko-tuf-snapshot-v1',capturedAt:capture.capturedAt,rotations:await Promise.all(rotations.map(b64)),timestamp:await b64('timestamp.json'),snapshot:await b64(capture.snapshotVersion+'.snapshot.json'),targets:await b64(capture.targetsVersion+'.targets.json'),trustedRoot:await b64('targets/'+JSON.parse(await read(capture.targetsVersion+'.targets.json')).signed.targets['trusted_root.json'].hashes.sha256+'.trusted_root.json'),minimumVersions:floor};
const check=await runVerificationWorker({operation:'roots',snapshot});if(check.result.status!=='authenticated')throw Error('ROOT_AUTHENTICATION_FAILED:'+check.result.reason);
if(previous)for(const role of ['timestamp','snapshot','targets'])if(check.result.versions[role]===previous.minimumVersions[role]&&snapshot[role]!==previous[role])throw Error('SAME_VERSION_EQUIVOCATION');
snapshot.minimumVersions=check.result.versions;
await fs.writeFile(outArg,JSON.stringify(snapshot,null,2)+'\n',{flag:'wx'});
await fs.writeFile(outArg+'.receipt.json',JSON.stringify(check,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({authenticated:true,versions:check.result.versions,output:outArg}));
