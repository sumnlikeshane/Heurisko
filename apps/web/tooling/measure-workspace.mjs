// Node-side presentation and loopback timings, not browser rendering/interaction proof.
// Uses public retained evidence and a private temporary workspace; no engine/network acquisition.
import {performance} from 'node:perf_hooks';
import {readFile,writeFile,mkdtemp,realpath,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {searchDocs} from '../dist/doc-model.js';
import {browseFiles,emptyFileView} from '../dist/report-view.js';
import {renderReport} from '../dist/render-check.js';
import {startViewer} from '../dist/service.js';
import {openObservation} from '../dist/observation.js';
import {WebWorkspace,webLimits} from '../dist/workspace.js';
const root=resolve(import.meta.dirname,'../../..'),out=process.argv[2];if(!out)throw Error('FRESH_RECEIPT_REQUIRED');
const sha=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
async function snapshot(){const data={};for(const path of ['apps/web/dist/assets/app.js','apps/web/dist/assets/app.css','apps/web/dist/service.js','apps/web/dist/workspace.js','apps/web/dist/report-view.js','apps/web/dist/doc-model.js','apps/web/dist/cli-docs.json','apps/web/tooling/measure-workspace.mjs'])data[path]=sha(await readFile(join(root,path)));return data;}
const before=await snapshot(),measurements=[];
function measure(name,fn,n=30){const samples=[];for(let i=0;i<n;i++){const t=performance.now();fn();samples.push(performance.now()-t);}samples.sort((a,b)=>a-b);measurements.push({name,iterations:n,medianMs:samples[Math.floor(n/2)],p95Ms:samples[Math.floor(n*.95)],maxMs:samples.at(-1)});}
const docsBytes=await readFile(join(root,'apps/web/dist/cli-docs.json')),docs=JSON.parse(docsBytes);
measure('cross-document search source-archive',()=>searchDocs(docs,'source-archive'),100);
const corpus=[];for(const name of ['B1','B2','B3R']){const raw=await readFile(join(root,`examples/handoff/current/${name}.report.json`)),report=JSON.parse(raw);const loaded={report,reportContentRef:sha(raw),facts:{findingsEvaluation:'not_evaluated_or_partial'},transport:null};measure(name+' path browser all records',()=>browseFiles(report,emptyFileView));measure(name+' overview/source/coverage/findings/AI SSR',()=>renderReport(loaded),5);corpus.push({name,reportBytes:raw.length,evidence:report.bundle.evidence.length,changes:report.bundle.changes.length,omissions:report.bundle.coverage.omissions.length});}
const r=JSON.parse(await readFile(join(root,'examples/handoff/current/B3R.report.json'))),member=r.bundle.evidence.find(e=>e.kind==='source_member');r.bundle.evidence=Array.from({length:19000},(_,i)=>({...member,evidenceId:'ev_inert_measure_'+i,locator:{path:'packages/inert/'+String(i).padStart(6,'0')+'.txt'}}));measure('synthetic 19000-record path filter/sort (presentation only)',()=>browseFiles(r,{...emptyFileView,prefix:'packages/inert/01'}));
const temporary=await realpath(await mkdtemp(join(tmpdir(),'heurisko-web-measure-'))),operations=[],rssStart=process.memoryUsage().rss;
let viewer;
try{
 const w=new WebWorkspace(join(temporary,'admission'));const bytes=Buffer.alloc(webLimits.archiveBytes,32);let t=performance.now();await w.upload('artifact','inert-not-parsed.tar',bytes);operations.push({name:'exact 32 MiB inert archive admission, never parsed/executed',ms:performance.now()-t,bytes:bytes.length});await assert.rejects(w.upload('artifact','oversize.tar',Buffer.alloc(webLimits.archiveBytes+1)),/UPLOAD_LIMIT/);await w.close();
 const o=await openObservation(join(root,'examples/handoff/current/B3R.report.json'),join(root,'examples/handoff/current/store'));viewer=await startViewer([o],0,{workspaceRoot:join(temporary,'workspace')});
 async function call(route,{value,bytes,filename}={}){const start=performance.now();const res=await fetch(viewer.origin+'/api/'+route,{method:value!==undefined||bytes?'POST':'GET',headers:{Origin:viewer.origin,'X-Heurisko-Session':viewer.capability,...(bytes?{'Content-Type':'application/octet-stream','X-Heurisko-Filename':filename}:value!==undefined?{'Content-Type':'application/json'}:{})},body:bytes??(value!==undefined?JSON.stringify(value):undefined)});const raw=Buffer.from(await res.arrayBuffer());assert.ok(res.ok,route);operations.push({name:route.replace(o.handle,'OBSERVATION'),ms:performance.now()-start,bytes:raw.length,status:res.status});return raw;}
 await call('observations/'+o.handle);await call('observations/'+o.handle+'/report');const portable=await call('observations/'+o.handle+'/export',{value:{}});
 const upload=JSON.parse(await call('uploads/portable',{bytes:portable,filename:'measurement.heurisko.json'}));const reopened=JSON.parse(await call('reopen',{value:{upload:upload.upload}}));assert.deepEqual(await call('observations/'+reopened.handle+'/report'),o.raw);
}finally{if(viewer)await viewer.close();await rm(temporary,{recursive:true,force:true});}
assert.deepEqual(await snapshot(),before,'Build changed during measurement');
await writeFile(out,JSON.stringify({kind:'node-presentation-and-loopback-measurements-not-browser',recordedAt:new Date().toISOString(),node:process.version,platform:process.platform,arch:process.arch,docsBytes:docsBytes.length,docPages:docs.length,corpus,synthetic:{records:19000,scope:'presentation projection only; not validated engine report or product adoption'},measurements,operations,rss:{startBytes:rssStart,endBytes:process.memoryUsage().rss,processMaxRSSKiB:process.resourceUsage().maxRSS,scope:'one Node process, mixed parser/SSR/transport allocations; not isolated per-operation peak'},sourceBuild:before,targets:'No agreed latency target; observed timings only. Browser rendering/reflow/input latency and offline behavior remain unobserved.'},null,2)+'\n',{flag:'wx'});
