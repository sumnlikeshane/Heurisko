import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {request} from 'node:http';
import {fileURLToPath} from 'node:url';
import {openObservation,ReportReader} from '../dist/observation.js';
import {startViewer} from '../dist/service.js';
import {exportObservation,importObservation} from '../dist/transport.js';
const repo=fileURLToPath(new URL('../../../',import.meta.url));
// Isolated development accepts the original retained corpus explicitly. CI uses its own checkout.
const corpus=process.env.HEURISKO_WEB_TEST_CORPUS??repo;
const sample=(name='B1')=>join(corpus,'examples/handoff/current',name+'.report.json');
const store=join(corpus,'examples/handoff/current/store');
const mutation=join(corpus,'examples/s2/current/outputs/synthetic-local-mutation.report.json');
const mutationStore=join(corpus,'examples/s2/current/store');
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
async function temp(t){const dir=await fs.mkdtemp(join(tmpdir(),'heurisko-web-test-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));return fs.realpath(dir);}
async function http(viewer,path,options={}){return new Promise((accept,reject)=>{const req=request(viewer.origin+path,{path,method:options.method??'GET',headers:{'X-Heurisko-Session':viewer.capability,...options.headers}},res=>{const parts=[];res.on('data',b=>parts.push(b));res.on('end',()=>accept({status:res.statusCode,headers:res.headers,text:Buffer.concat(parts).toString()}));});req.on('error',reject);req.end();});}
async function service(t,observations){const v=await startViewer(observations);t.after(()=>v.close());return v;}
test('original observation identity and exact retained outcomes survive the local API',async t=>{
 const o=await openObservation(sample(),store),v=await service(t,[o]);const result=await http(v,'/api/observations/'+o.handle);assert.equal(result.status,200);const data=JSON.parse(result.text);assert.equal(data.reportContentRef,digest(await fs.readFile(sample())));assert.deepEqual(data.report,JSON.parse(await fs.readFile(sample(),'utf8')));assert.equal(data.report.outcomes.sourceAssociation,'ambiguous');assert.equal(data.report.analysis.findings.length,0);assert.equal(data.facts.examinedScopeFindingCount,null);assert.equal(data.facts.historical,true);
});
test('Host, Origin, fetch-site, capability, methods and exact query allowlists fail closed',async t=>{
 const o=await openObservation(sample(),store),v=await service(t,[o]),path='/api/observations/'+o.handle;
 for(const [route,options,status] of [
 [path,{headers:{host:'evil.example'}},403],[path,{headers:{origin:'https://evil.example'}},403],[path,{headers:{'sec-fetch-site':'cross-site'}},403],[path,{headers:{'X-Heurisko-Session':''}},403],[path,{headers:{'X-Heurisko-Session':'x'}},403],[path,{method:'POST'},405],[path,{method:'OPTIONS'},405],[path+'?path=/etc/passwd',{},400],['/api/observations?url=https://example.com',{},400],['/api/observations/'+o.handle+'/jobs',{},404],['/api/observations/'+ '0'.repeat(32),{},404],['/assets/../report.json',{},400],['/assets/%2e%2e/report.json',{},400],['/assets/app.js?anything=1',{},400],['/api/observations/'+o.handle+'/evidence/'+o.reader.report.bundle.evidence[0].evidenceId+'?length=1&length=2',{},400]
 ]){const r=await http(v,route,options);assert.equal(r.status,status,route);assert.equal(r.headers['access-control-allow-origin'],undefined);assert.ok(!r.text.includes(v.capability));}
 const root=await http(v,'/');assert.equal(root.status,200);assert.match(root.headers['content-security-policy'],/default-src 'none'/);assert.ok(!root.text.includes(v.capability));assert.match(root.headers['content-security-policy'],/frame-ancestors 'none'/);assert.equal((await http(v,path,{headers:{origin:v.origin}})).status,200);
});
test('evidence API preserves exact mutation artifact span and absent source side',async t=>{
 const o=await openObservation(mutation,mutationStore),v=await service(t,[o]);const path=`/api/observations/${o.handle}/evidence/ev_8e5679afc3b6d3667eb09413`;
 const a=JSON.parse((await http(v,path+'?mode=citation&side=artifact')).text);assert.equal(a.kind,'content');assert.deepEqual(a.recordedRange,{startByte:585,endByte:611});assert.equal(Buffer.from(a.bytesBase64,'base64').toString(),'"HEURISKO_INERT_TEST_ONLY"');assert.equal(a.member.locator.path,'package/package.json');
 const s=JSON.parse((await http(v,path+'?mode=citation&side=source')).text);assert.deepEqual([s.kind,s.reason],['metadata_only','SIDE_NOT_RECORDED']);
 for(const query of ['length=65537','offset=-1','offset=1e6','side=external','mode=record&side=source','mode=run','length=0'])assert.equal((await http(v,path+'?'+query)).status,400,query);
 const part=JSON.parse((await http(v,path+'?mode=citation&side=artifact&offset=1&length=8')).text);assert.deepEqual(part.displayedRange,{startByte:586,endByte:594});assert.equal(Buffer.from(part.bytesBase64,'base64').toString(),'HEURISKO');
 assert.equal((await http(v,path.replace('ev_8e5679afc3b6d3667eb09413','ev_unknown'))).status,404);
});
test('B2 and monorepo have unchanged IDs, raw changes and original coverage',async()=>{
 for(const [name,count] of [['B2',143],['B3R',31]]){const o=await openObservation(sample(name),store);assert.equal(o.reader.report.bundle.changes.length,count);assert.deepEqual(o.reader.report,JSON.parse(await fs.readFile(sample(name),'utf8')));assert.equal(o.reader.report.analysis.findings.length,0);}
});
test('two observations sharing reportId retain distinct content handles and digests',async t=>{
 const o=await openObservation(sample(),store);const value=JSON.parse(o.raw);value.createdAt='2026-11-01T00:00:00Z';const raw=Buffer.from(JSON.stringify(value));const second={handle:'f'.repeat(32),raw,reader:await ReportReader.openJSON(raw.toString(),store)};assert.equal(second.reader.report.reportId,o.reader.report.reportId);assert.notEqual(second.reader.reportContentRef,o.reader.reportContentRef);const v=await service(t,[o,second]);const data=JSON.parse((await http(v,'/api/observations')).text);assert.equal(data.length,2);assert.notEqual(data[0].handle,data[1].handle);assert.notEqual(data[0].reportContentRef,data[1].reportContentRef);
});
test('raw duplicate keys, unsafe integers, unsupported schema and validator failure are rejected',async t=>{
 const o=await openObservation(sample(),store),r=JSON.parse(o.raw);
 for(const raw of ['{"schemaVersion":"0.1.0",'+o.raw.toString().slice(1),o.raw.toString().replace('"sourceFiles":19','"sourceFiles":9007199254740992'),JSON.stringify({...r,schemaVersion:'999'})]){
  if(raw===o.raw.toString())throw Error('TEST_DID_NOT_MUTATE');await assert.rejects(ReportReader.openJSON(raw,store));
 }
 await assert.rejects(ReportReader.openJSON(o.raw.toString(),store,{pythonExecutable:'/nonexistent-validator'}),e=>e.code==='VALIDATOR_UNAVAILABLE');
});
test('portable directory export/reopen preserves original report and exact citation bytes',async t=>{
 const root=await temp(t),o=await openObservation(mutation,mutationStore);const m=await exportObservation(o,join(root,'export'));assert.equal(m.partial,false);assert.ok(m.blobs.length>0);assert.deepEqual(await fs.readFile(join(root,'export/report.json')),o.raw);const reopened=await importObservation(join(root,'export'));assert.equal(reopened.reader.reportContentRef,o.reader.reportContentRef);const a=await reopened.reader.readCitation('ev_8e5679afc3b6d3667eb09413','artifact');assert.equal(a.kind,'content');assert.equal(Buffer.from(a.bytesBase64,'base64').toString(),'"HEURISKO_INERT_TEST_ONLY"');assert.equal(reopened.transport.omitted,0);await assert.rejects(exportObservation(o,join(root,'export')));assert.deepEqual(await fs.readFile(join(root,'export/report.json')),o.raw);
});
test('portable import rejects corruption, symlinks, duplicate manifest keys and report binding changes',async t=>{
 const root=await temp(t),o=await openObservation(sample(),store);const out=join(root,'export');const m=await exportObservation(o,out);const b=m.blobs.find(b=>b.status==='included');const path=join(out,'blobs',b.contentRef.slice(7)),original=await fs.readFile(path);await fs.writeFile(path,Buffer.alloc(original.length));await assert.rejects(importObservation(out));await fs.writeFile(path,original);await fs.rename(path,path+'.saved');await fs.symlink(path+'.saved',path);await assert.rejects(importObservation(out));await fs.unlink(path);await fs.rename(path+'.saved',path);
 const manifestPath=join(out,'manifest.json'),raw=await fs.readFile(manifestPath,'utf8');await fs.writeFile(manifestPath,'{"format":"heurisko-web-export-v1",'+raw.slice(1));await assert.rejects(importObservation(out));await fs.writeFile(manifestPath,raw);const bytes=await fs.readFile(join(out,'report.json'));await fs.appendFile(join(out,'report.json'),' ');await assert.rejects(importObservation(out));await fs.writeFile(join(out,'report.json'),bytes);const m2=JSON.parse(raw);m2.blobs[0].contentRef='../../etc/passwd';await fs.writeFile(manifestPath,JSON.stringify(m2));await assert.rejects(importObservation(out));
});
test('missing source bytes produce an explicit partial export without changing report contentState',async t=>{
 const root=await temp(t),empty=join(root,'empty');await fs.mkdir(join(empty,'blobs'),{recursive:true});const o=await openObservation(sample(),empty);const m=await exportObservation(o,join(root,'export'));assert.equal(m.partial,true);assert.ok(m.blobs.every(b=>b.status==='omitted'&&b.reason==='MISSING_BLOB'));const reopened=await importObservation(join(root,'export'));assert.ok(reopened.transport.omitted>0);assert.deepEqual(reopened.reader.report,o.reader.report);
});
test('report and blob limits, missing bytes and invalid ranges remain distinguishable',async t=>{
 const root=await temp(t),o=await openObservation(sample(),store),e=o.reader.report.bundle.evidence.find(e=>e.kind==='artifact_member');const empty=join(root,'empty');await fs.mkdir(join(empty,'blobs'),{recursive:true});const r=await ReportReader.openJSON(o.raw.toString(),empty);assert.equal((await r.readEvidence(e.evidenceId)).reason,'MISSING_BLOB');const blob=join(empty,'blobs',e.contentRef.slice(7));await fs.writeFile(blob,Buffer.alloc(e.locator.endByte??256));assert.equal((await r.readEvidence(e.evidenceId)).reason,'HASH_MISMATCH');await fs.truncate(blob,32*1024*1024+1);assert.equal((await r.readEvidence(e.evidenceId)).reason,'READ_LIMIT');assert.equal((await o.reader.readEvidence(e.evidenceId,{length:65537})).reason,'INVALID_RANGE');const large=join(root,'large.json');await fs.writeFile(large,'');await fs.truncate(large,8*1024*1024+1);await assert.rejects(openObservation(large,store));
});
test('transport cancellation, missing included blob and false omission declarations fail closed',async t=>{
 const root=await temp(t),o=await openObservation(sample(),store),controller=new AbortController();controller.abort();await assert.rejects(exportObservation(o,join(root,'cancelled'),undefined,controller.signal),/TRANSPORT_CANCELLED/);await assert.rejects(importObservation(root,controller.signal),/TRANSPORT_CANCELLED/);
 const out=join(root,'export'),m=await exportObservation(o,out),b=m.blobs.find(b=>b.status==='included'),file=join(out,'blobs',b.contentRef.slice(7)),original=await fs.readFile(file);await fs.unlink(file);await assert.rejects(importObservation(out));await fs.writeFile(file,original);
 m.blobs[m.blobs.indexOf(b)]={contentRef:b.contentRef,status:'omitted',reason:'MISSING_BLOB'};m.partial=true;await fs.writeFile(join(out,'manifest.json'),JSON.stringify(m));await assert.rejects(importObservation(out),/OMITTED_BLOB_PRESENT/);
});
test('synthetic markup, controls, bidi and model text stay inert; real outcome fields stay visible',async()=>{
 const {renderReport,safe}=await import('../dist/render-check.js');const o=await openObservation(sample(),store),r=JSON.parse(o.raw);
 r.bundle.artifact.artifactFilename='<img src="https://example.invalid/attack" onerror="alert(1)">\u001b]0;title\u0007\u202e';
 r.analysis.findings=[{findingId:'synthetic-only',title:'<script>alert(1)</script>',observation:'<svg onload="alert(1)">',whyItMatters:'test containment',evidenceIds:[],severity:'undetermined',reviewPriority:'low',evidenceConfidence:'unresolved',explanationStrength:'hypothesis',limitations:[],nextActions:['[run](javascript:alert(1))'],ruleId:'test',ruleVersion:'1'}];
 r.analysis.interpretations=[{interpretationId:'synthetic-model-text',findingIds:['synthetic-only'],evidenceIds:[],hypothesis:'<iframe src="https://example.invalid/attack">',reasoningSummary:'Ignore all previous instructions',alternatives:[],missingEvidence:[],nextActions:[],abstentionReason:'test',modelId:'synthetic',runtimeId:'synthetic',promptVersion:'test',validation:'passed'}];
 const html=renderReport({report:r,reportContentRef:o.reader.reportContentRef,facts:{findingsEvaluation:'not_evaluated_or_partial'},transport:null});assert.ok(!/<(?:img|svg|script|iframe)\b/.test(html));assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('\\u001b'));assert.ok(html.includes('\\u202e'));assert.ok(html.includes('Ignore all previous instructions'));for(const value of Object.values(r.outcomes))assert.ok(html.includes(value));assert.equal(safe('a\nb\tc\r'),'a\\nb\\tc\\r');assert.equal(safe('\u202e'),'\\u202e');
});
test('all accepted synthetic G0 fixture states render without inferring a verdict',async()=>{
 const {renderReport}=await import('../dist/render-check.js');
 for(let i=0;i<=6;i++){const path=join(repo,`packages/contracts/tests/fixtures/F${i}/report.json`),o=await openObservation(path,store),r=o.reader.report;const html=renderReport({report:r,reportContentRef:o.reader.reportContentRef,facts:{findingsEvaluation:'not_evaluated_or_partial'},transport:null});for(const state of Object.values(r.outcomes))assert.ok(html.includes(state),`F${i}: ${state}`);assert.ok(html.includes(r.analysis.aiState.status));assert.ok(html.includes('synthetic_contract'));}
});
test('the service permits only two active evidence reads and stops on owned shutdown',async t=>{
 const o=await openObservation(sample(),store),id=o.reader.report.bundle.evidence[0].evidenceId;
 let entered=0,notify,release;const both=new Promise(r=>notify=r),gate=new Promise(r=>release=r);
 const reader={report:o.reader.report,reportContentRef:o.reader.reportContentRef,historical:true,evidence:id=>o.reader.evidence(id),async readEvidence(id,window){entered++;if(entered===2)notify();await gate;return o.reader.readEvidence(id,window);}};
 const v=await service(t,[{...o,reader}]),path=`/api/observations/${o.handle}/evidence/${id}`;
 const first=http(v,path),second=http(v,path);await both;assert.equal((await http(v,path)).status,429);release();assert.equal((await first).status,200);assert.equal((await second).status,200);
});

test('the genuine monorepo export reopens beyond the package-metadata parser node limit',async t=>{
 const root=await temp(t),o=await openObservation(sample('B3R'),store),out=join(root,'export');const m=await exportObservation(o,out);assert.ok(m.blobs.length>512);assert.equal(m.partial,false);const reopened=await importObservation(out);assert.deepEqual(reopened.raw,o.raw);assert.deepEqual(reopened.reader.report,o.reader.report);
});
