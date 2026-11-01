// Explicit retained-only launch. No acquisition is triggered by launching this viewer.
import * as fs from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { openObservation } from '../apps/web/dist/observation.js';
import { startViewer } from '../apps/web/dist/service.js';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(await fs.readFile(join(root,'examples/final-hour/20261101-053912/demo-manifest.json'),'utf8'));
const observations=[];
for(const c of manifest.cases){
 const bytes=await fs.readFile(join(root,c.report));
 if('sha256:'+createHash('sha256').update(bytes).digest('hex')!==c.reportContentRef)throw Error('PINNED_DEMO_REPORT_CHANGED');
 observations.push(await openObservation(join(root,c.report),join(root,c.store)));
}
await fs.mkdir(join(root,'.heurisko'),{recursive:true,mode:0o700});
const workspaceRoot=await fs.mkdtemp(join(root,'.heurisko/final-demo-session-'));
const viewer=await startViewer(observations,0,{workspaceRoot});
process.stdout.write(`Heurisko retained demonstration · three pinned historical cases\nOpen this private URL locally; do not save or share it:\n${viewer.url}\nNo analysis started. Ctrl+C stops this task-owned viewer.\n`);
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{void viewer.close().then(()=>{process.exitCode=0;}).catch(()=>{process.stderr.write('DEMO_CLOSE_FAILED\n');process.exitCode=1;});});
