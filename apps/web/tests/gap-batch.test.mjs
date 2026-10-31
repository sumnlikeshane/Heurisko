import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,realpath,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {docPages,headings,searchDocs,docLink} from '../dist/doc-model.js';
import {destination} from '../dist/navigation.js';
import {validateDraft} from '../dist/input-review.js';
import {browseFiles,emptyFileView,readingGuide,modalFocusables} from '../dist/report-view.js';
import {Markdown,Files,EvidenceDetail,RequestReview,JobDetail,ExportActions,Home} from '../dist/render-check.js';
import {WebWorkspace} from '../dist/workspace.js';
import {npmCoordinates,pinnedSourceURL,safeSubdirectory} from '@heurisko/core';
const repo=new URL('../../../',import.meta.url),docs=JSON.parse(await readFile(new URL('../dist/cli-docs.json',import.meta.url)));
const render=(C,props)=>renderToStaticMarkup(React.createElement(C,props));
const report=JSON.parse(await readFile(new URL('examples/handoff/current/B2.report.json',repo)));
test('every documentation page, declared navigation link and anchor resolves from a deterministic manifest',()=>{
 assert.equal(docs.length,docPages.length);assert.equal(new Set(docs.map(d=>d.id)).size,docs.length);
 for(const d of docs){assert.equal(destination('/docs/'+d.id).kind,'docs');const hs=headings(d.markdown);assert.equal(hs.length,new Set(hs.map(h=>h.id)).size);
  for(const m of d.markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){const href=docLink(m[1],d.id);if(href?.startsWith('/docs/')){const [path,anchor]=href.split('#'),target=docs.find(d=>'/docs/'+d.id===path);assert.ok(target,href);if(anchor)assert.ok(headings(target.markdown).some(h=>h.id===anchor),href);}}
 }
});
test('docs search spans workflows/reference/errors with section snippets and exact targets',()=>{
 for(const [q,id] of [['--source-archive','cli/analyze'],['exit 2','workflows/ci'],['SESSION_DENIED','troubleshooting/session'],['source replay','workflows/local']]) {const found=searchDocs(docs,q);assert.ok(found.some(r=>r.page===id),q);assert.ok(found.every(r=>r.snippet.toLowerCase().includes(q.toLowerCase())));}
 assert.deepEqual(searchDocs(docs,'   '),[]);assert.deepEqual(searchDocs(docs,'unfindable_9134'),[]);
});
test('inert markdown keeps semantic headings, ordered/bullet lists, table headings, exact selectable code and safe links',()=>{
 const text='# Title\n\n## Repeated\n\n## Repeated\n\n1. one\n2. two\n\n- three\n- four\n\n| a | b |\n|---|---|\n| c | d |\n\n```sh\nprintf "$HOME\\n"\n```\n\n<img src="https://evil.invalid"> [bad](javascript:run) ![embed](https://evil.invalid) [good](/docs/cli/analyze)';
 const html=render(Markdown,{text,page:'cli'});for(const tag of ['h1','h2','ol','ul','thead','tbody','th','code'])assert.ok(html.includes('<'+tag),tag);
 assert.match(html,/id="repeated-1"/);assert.match(html,/Copy code/);assert.match(html,/href="\/docs\/cli\/analyze"/);assert.ok(!/<(?:img|iframe|script|svg)\b/.test(html));assert.ok(!html.includes('href="javascript:'));assert.ok(!html.includes('href="https://evil.invalid"'));
 assert.equal(docLink('javascript:alert(1)','cli'),null);assert.equal(docLink('%ZZ','cli'),null);
});
test('draft validation catches invalid combinations before admission, and canonical targets match core',()=>{
 for(const target of ['npm:picocolors@1.1.1','npm:@vue/shared@3.5.22','npm:x@1.2.3-beta.1+foo']){const draft={kind:'npm',target,enableAI:false};assert.deepEqual(validateDraft(draft),[]);const [,n,v]=/^npm:(.+)@([^@]+)$/.exec(target);assert.doesNotThrow(()=>npmCoordinates(n,v));}
 for(const target of ['npm:a@latest','npm:a@^1.0.0','npm:a@1.0.0-01','npm:UPPER@1.0.0','npm:a@01.0.0','https://evil.invalid'])assert.ok(validateDraft({kind:'npm',target,enableAI:true}).length,target);
 const base={kind:'local',artifact:{name:'public.tgz',size:12},enableAI:false,source:'https://github.com/a/b',commit:'a'.repeat(40),subdirectory:'packages/shared'};assert.deepEqual(validateDraft(base),[]);assert.doesNotThrow(()=>pinnedSourceURL(base.source,base.commit));assert.doesNotThrow(()=>safeSubdirectory(base.subdirectory));
 for(const patch of [{source:undefined},{commit:'main'},{subdirectory:'../escape'},{artifact:{name:'../x',size:1}},{artifact:{name:'x',size:33554433}},{sourceArchive:{name:'x',size:1},commit:undefined,source:undefined},{source:'https://github.com/a/b?secret=x'}])assert.ok(validateDraft({...base,...patch}).length);
 const html=render(RequestReview,{draft:base});assert.match(html,/public.tgz/);assert.match(html,/12 bytes/);assert.match(html,/user asserted/);assert.ok(!html.includes('artifactPath'));
});
test('accepted job summaries bind actual core options and archive bytes without host paths',async t=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'heurisko-w3-')));let release;const gate=new Promise(r=>release=r),received=[];
 const w=new WebWorkspace(root,async(input,options,context)=>{received.push({input,options});context.onProgress({stage:'inventory',status:'running'});await gate;throw Error('CONTROLLED_NO_REPORT');});t.after(async()=>{release();await w.close();await rm(root,{recursive:true,force:true});});
 const bytes=Buffer.from('inert test bytes'),a=await w.upload('artifact','public.tgz',bytes);
 const start=w.start({kind:'local',artifact:a.upload,enableAI:false,policy:'test-policy',source:'https://github.com/a/b',commit:'a'.repeat(40)},()=>{});
 assert.equal(start.request.artifact.bytes,bytes.length);assert.equal(start.request.artifact.sha256,a.sha256);assert.equal(start.request.artifact.filename,'public.tgz');assert.ok(!JSON.stringify(start).includes(root));
 for(let i=0;i<5;i++)w.listJobs();assert.equal(w.listJobs().length,1);await new Promise(r=>setImmediate(r));assert.equal(received.length,1);assert.equal(received[0].options.trustPolicyRef,'test-policy');
 w.cancel(start.id);assert.equal(w.job(start.id).cleanup,'not_observable');release();await w.close();assert.equal(w.job(start.id).phase,'settled_error');
});
test('latest stage facts retain repeated events and truthful cancel/error actions',()=>{
 const job={id:'a'.repeat(32),phase:'cancel_requested',startedAt:'2026-11-01T01:00:00Z',cleanup:'not_observable',cancellationRequested:true,omittedEvents:2,request:{kind:'npm',target:'npm:picocolors@1.1.1',enableAI:false,analysisProfile:'raw-static-s3-v1'},events:[{stage:'source',status:'running',sequence:3},{stage:'source',status:'incomplete',sequence:4}]};
 const html=render(JobDetail,{job,onCancel(){},error:'LOCAL_SERVICE_UNAVAILABLE'});for(const s of ['Accepted request','npm:picocolors@1.1.1','Latest observed stage facts','Retained event history','not_observable','cancel_requested','Status uncertain'])assert.ok(html.includes(s),s);assert.ok(!html.includes('100%'));assert.ok(!html.includes('Open report and evidence'));
});
test('later-page file selection, path member records, explicit omissions and filtered selection stay grounded',()=>{
 const view={...emptyFileView,page:2,selected:report.bundle.changes[85].changeId};const props={r:report,view,setView(){},onOpen(){},filter:'',setFilter(){},status:'all',setStatus(){},selected:view.selected,setSelected(){},page:2,setPage(){}};
 const html=render(Files,props);assert.ok(html.includes('81–120'));assert.ok(html.includes(view.selected));
 const path=report.bundle.changes[0].artifactPath??report.bundle.changes[0].sourcePath;
 const filtered=render(Files,{...props,filter:path,page:0});assert.ok(!filtered.includes('<dd>'+view.selected+'</dd>'));
 const members=browseFiles(report,{...view,mode:'members',side:'source'});assert.ok(members.every(m=>m.side==='source'));for(const o of report.bundle.coverage.omissions)assert.ok(browseFiles(report,emptyFileView).some(m=>m.kind==='coverage omission'&&m.path===o.path&&m.reason===o.reason));
 const m=browseFiles(report,emptyFileView).find(m=>m.kind==='member');assert.ok(report.bundle.evidence.some(e=>e.evidenceId===m.evidenceIds[0]));
});
test('reading guide/export/landing preserve independent outcomes, original identity and honest next actions',()=>{
 const loaded={report,reportContentRef:'sha256:'+'a'.repeat(64),facts:{findingsEvaluation:'not_evaluated_or_partial'},transport:{included:3,omitted:2}};
 const guide=readingGuide(report);for(const key of ['sourceAssociation','analysisCompleteness','correspondence','policyResult','provenancePolicy'])assert.ok(guide.some(g=>g.text.includes(report.outcomes[key])));
 const html=render(ExportActions,{handle:'a'.repeat(32),loaded});for(const s of ['Original report','64 MiB','2 omitted','Open a saved export','manifest omissions'])assert.ok(html.includes(s),s);
 assert.match(render(Home,{}),/retained observation/);assert.ok(!render(Home,{}).includes('Open this admitted retained example'));
});
test('modal focus ring excludes disabled, hidden, inert and closed-details controls',()=>{
 const summary={tagName:'SUMMARY'},closed={tagName:'DETAILS',hasAttribute:()=>false,querySelector:()=>summary,parentElement:null};
 const item=(patch={})=>({closest:()=>null,getClientRects:()=>[{}],parentElement:null,...patch});
 const button=item(),hidden=item({getClientRects:()=>[]}),inert=item({closest:()=>({})}),inside=item({parentElement:closed});Object.assign(summary,item({parentElement:closed}));
 const root={querySelectorAll:()=>[button,hidden,inert,inside,summary]};assert.deepEqual(modalFocusables(root),[button,summary]);
});

test('closed raw-delta disclosure defers its third byte reader; initial source/artifact slots stay distinct',()=>{
 const evidence=report.bundle.evidence.find(e=>['raw_diff','manifest_delta'].includes(e.kind));assert.ok(evidence);
 const html=render(EvidenceDetail,{handle:'a'.repeat(32),evidence,r:report,onOpen(){},onClose(){},windows:{offsets:{},move(){}},views:new Map()});
 assert.equal((html.match(/Reading hash-checked bytes/g)??[]).length,2);
 assert.match(html,/Raw delta record/);assert.match(html,/Source · recorded span/);assert.match(html,/Artifact · recorded span/);
});

test('older failed jobs remain selectable after a later explicit start, and status reads never retry',async t=>{
 const root=await realpath(await mkdtemp(join(tmpdir(),'heurisko-job-list-')));let calls=0;
 const w=new WebWorkspace(root,async()=>{calls++;throw Error('EXPECTED_NO_REPORT');});t.after(async()=>{await w.close();await rm(root,{recursive:true,force:true});});
 const input={kind:'npm',target:'npm:picocolors@1.1.1',enableAI:false};
 const first=w.start(input,()=>{});await new Promise(r=>setImmediate(r));assert.equal(w.job(first.id).phase,'settled_error');
 const second=w.start({...input,target:'npm:@vue/shared@3.5.22'},()=>{});await new Promise(r=>setImmediate(r));
 for(let i=0;i<10;i++){const jobs=w.listJobs();assert.equal(jobs.length,2);assert.equal(jobs[0].id,first.id);assert.equal(w.job(second.id).request.target,'npm:@vue/shared@3.5.22');}
 assert.equal(calls,2);assert.equal(w.job(first.id).error,'EXPECTED_NO_REPORT');
});
