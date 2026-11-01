// Headless integration checks. Synthetic cases are explicit and never exported
// as actual analyzer output; public captures keep their original report bytes.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {ReportReader,reportFacts,inertText,readerLimits} from '../dist/report-reader.js';
import {startInvestigation} from '../dist/investigation-task.js';
import {sha256,evidenceId,validateConsumedAnalysis,validateInput,npmCoordinates,pinnedSourceURL,safeSubdirectory} from '../../../packages/core/dist/index.js';

const root=resolve(import.meta.dirname,'../../..');
const load=path=>JSON.parse(readFileSync(join(root,path),'utf8'));
const real=path=>join(root,'examples/s3/current',path);
const realStore=real('store');
const f0=()=>load('packages/contracts/tests/fixtures/F0/report.json');
async function sandbox(t) {
  const path=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-part4-readiness-'));
  t.after(()=>fs.rm(path,{recursive:true,force:true}));return path;
}
function synthetic() {
  const r=f0();r.fixtureKind=r.bundle.fixtureKind='synthetic_contract';
  r.bundle.evidence=[];r.bundle.changes=[];r.bundle.sourceCandidates.forEach(c=>c.evidenceIds=[]);
  delete r.bundle.artifact.metadataEvidenceId;r.bundle.provenance.evidenceIds=[];
  r.bundle.coverage={sourceFiles:0,artifactFiles:0,comparedFiles:0,analyzedBytes:0,skippedBytes:0,unsupportedBytes:0,omissions:[],complete:false,limitations:['Synthetic adapter fixture; total unobserved scope unknown.']};
  r.outcomes.correspondence='not_assessed';r.outcomes.analysisCompleteness='incomplete';
  r.analysis.findings=[];r.analysis.interpretations=[];r.analysis.aiState={status:'disabled',validation:'not_run'};
  r.analysis.stages=[{stage:'heuristics',status:'incomplete',errors:[]}];return r;
}
async function record(r,store,bytes,{kind='artifact_member',side='artifact',locator={path:'package/inert.txt',startByte:0,endByte:bytes.length},observationMethod='raw-member-sha256-v1',contentState='retained',limitations=[]}={}) {
  const ref=sha256(bytes);await fs.mkdir(join(store,'blobs'),{recursive:true});await fs.writeFile(join(store,'blobs',ref.slice(7)),bytes);
  const e={kind,side,locator,observationMethod,contentState,contentRef:ref,contentSha256:ref,limitations,evidenceId:''};
  e.evidenceId=evidenceId(r.bundle,e);r.bundle.evidence.push(e);return e;
}
function link(r,evidence) {
  r.bundle.changes.push({changeId:'chg_synthetic-'+r.bundle.changes.length,status:'modified',rawEquality:'different',explanationStrength:'unexplained',evidenceIds:evidence.map(e=>e.evidenceId),notes:['Synthetic integration fixture.']});
}
const open=(r,store)=>ReportReader.fromReport(r,store);
const raw=result=>Buffer.from(result.bytesBase64,'base64');

test('S01 input validation is available; it is not resolved preflight or permission to Start',async()=>{
  for(const input of [load('examples/s3/current/B3R.report.json').bundle.input,load('examples/s3/current/local-mutation-replay.report.json').bundle.input]) {
    assert.deepEqual(await validateInput(input),input);
    if(input.ecosystem==='npm') assert.ok(npmCoordinates(input.packageName,input.version).includes('%40vue%2Fshared'));
    else assert.match(input.artifactPath,/^retained:/,'Historical local path is not an executable replay path');
    if(input.sourceOverride) {pinnedSourceURL(input.sourceOverride.repo,input.sourceOverride.commit);safeSubdirectory(input.sourceOverride.subdirectory??'');}
  }
  for(const version of ['latest','^1.2.3','v1.2.3'])assert.throws(()=>npmCoordinates('@scope/name',version));
  assert.throws(()=>pinnedSourceURL('https://github.com/owner/repo','main'));
});

test('S02 actual conflicting source, all six outcomes and source context survive immutable inspection',async()=>{
  const before=await fs.readFile(real('B1.report.json'));const r=await ReportReader.openFile(real('B1.report.json'),realStore);const facts=reportFacts(r);
  assert.equal(facts.outcomes.sourceAssociation,'ambiguous');assert.equal(facts.hasRecordedSourceConflicts,true);
  assert.equal(Object.keys(facts.outcomes).length,6);assert.deepEqual(facts.outcomes,JSON.parse(before).outcomes);
  assert.equal(facts.outcomes.artifactIntegrity,'matched');assert.equal(facts.outcomes.provenancePolicy,'not_checked');
  assert.equal(facts.outcomes.correspondence,'unresolved');assert.equal(facts.outcomes.analysisCompleteness,'incomplete');
  assert.throws(()=>{r.report.outcomes.sourceAssociation='corroborated';},TypeError);
  assert.throws(()=>{r.report={};},TypeError);
  assert.throws(()=>{r.report.bundle.sourceCandidates[0].commit='b'.repeat(40);},TypeError);
  assert.deepEqual(await fs.readFile(real('B1.report.json')),before);assert.equal(r.reportContentRef,sha256(before));
});

test('S03 actual S3 manifest delta resolves to exact member value bytes, not the JSON delta record',async()=>{
  const r=await ReportReader.openFile(real('local-mutation-replay.report.json'),realStore);
  const e=r.report.bundle.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='scripts.postinstall');assert.ok(e);
  const recordView=await r.readEvidence(e.evidenceId);assert.equal(recordView.address,'record_content');
  const delta=JSON.parse(raw(recordView));assert.equal(delta.version,'heurisko-manifest-delta-v1');
  const span=await r.readCitation(e.evidenceId,'artifact');assert.equal(span.kind,'content');assert.equal(span.address,'recorded_byte_range');
  assert.equal(span.member.locator.path,'package/package.json');assert.deepEqual(span.recordedRange,{startByte:delta.artifact.startByte,endByte:delta.artifact.endByte});
  assert.equal(JSON.parse(raw(span).toString('utf8')),delta.artifact.value);assert.notEqual(span.contentRef,e.contentRef);
  assert.equal((await r.readCitation(e.evidenceId,'source')).reason,'SIDE_NOT_RECORDED');
});

test('S03 received M1 lifecycle finding cites actual retained S2 evidence; review output stays separate',async()=>{
  const base=join(root,'examples/s2/current');const receipt=load('examples/s2/current/m1-mutation-handshake.json');
  const reportFile=join(base,'outputs/synthetic-local-mutation.report.json');const r=await ReportReader.openFile(reportFile,join(base,'store'));
  await validateConsumedAnalysis(receipt.actualConsumerOutput,r.report.bundle);
  const finding=receipt.actualConsumerOutput.findings.find(f=>f.ruleId==='heurisko.manifest.lifecycle-script-change');assert.ok(finding);
  const span=await r.readCitation(finding.evidenceIds[0],'artifact');assert.equal(span.kind,'content');
  assert.match(raw(span).toString('utf8'),/HEURISKO_INERT|heurisko\.invalid|inert/i);
  assert.equal(r.report.analysis.findings.length,0,'Do not overlay analysis while keeping an old report/config identity');
  assert.equal(receipt.enableAI,false);assert.match(receipt.modelExecution,/none/);
});

test('S03 raw byte difference sides bind exact original member paths and changed spans',async()=>{
  const r=await ReportReader.openFile(real('B1.report.json'),realStore);
  const e=r.report.bundle.evidence.find(e=>e.kind==='raw_diff'&&e.locator.metadataKey==='raw-byte-delta'&&r.report.bundle.changes.some(c=>c.evidenceIds.includes(e.evidenceId)&&c.sourcePath&&c.artifactPath));assert.ok(e);
  const data=JSON.parse(raw(await r.readEvidence(e.evidenceId)));
  for(const side of ['source','artifact']) {
    const span=await r.readCitation(e.evidenceId,side);assert.equal(span.kind,'content');assert.equal(span.member.locator.path,data[side].path);
    assert.deepEqual(span.recordedRange,data[side].changedSpan);assert.equal(raw(span).subarray(0,2048).toString('base64'),data[side].excerptBase64);
  }
  assert.equal((await r.readCitation(e.evidenceId)).reason,'SIDE_REQUIRED');
});

test('S04 unavailable or failed heuristics never produces a displayed examined-scope zero',async()=>{
  const realReader=await ReportReader.openFile(real('B3.report.json'),realStore);const facts=reportFacts(realReader);
  assert.equal(facts.recordedFindingCount,0);assert.equal(facts.examinedScopeFindingCount,null);assert.equal(facts.coverageFraction,null);
  assert.equal(facts.coverage.complete,false);assert.ok(facts.coverage.limitations.some(x=>/unknown/i.test(x)));
  for(const status of ['not_started','running','incomplete','skipped','failed']) {
    const r=synthetic();r.analysis.stages[0].status=status;
    assert.equal(reportFacts(await open(r,realStore)).examinedScopeFindingCount,null,status);
  }
  const r=synthetic();r.analysis.stages[0].status='complete';const known=reportFacts(await open(r,realStore));
  assert.equal(known.examinedScopeFindingCount,0);assert.equal(known.findingsEvaluation,'recorded_for_examined_scope');
  assert.equal(known.outcomes.analysisCompleteness,'incomplete','Observed empty subset does not complete other work');
});

test('S04 broader monorepo and omission accounting are preserved without incompatible fractions',async()=>{
  const reader=await ReportReader.openFile(real('B3R.report.json'),realStore),facts=reportFacts(reader);
  assert.equal(facts.coverage.sourceFiles,700);assert.ok(facts.coverage.skippedBytes>0);assert.ok(facts.coverage.omissions.length);
  assert.equal(facts.coverageFraction,null);assert.equal(facts.sourceCandidates[0].subdirectory,'packages/shared');
  assert.deepEqual(facts.coverage,load('examples/s3/current/B3R.report.json').bundle.coverage);
});

test('S05 byte paging stays inside recorded range and distinguishes window truncation from analysis',async t=>{
  const store=await sandbox(t),r=synthetic(),bytes=Buffer.alloc(512*1024,97);bytes.write('EXACT',100);
  const e=await record(r,store,bytes,{locator:{path:'package/large.min.js',startByte:100,endByte:bytes.length-20}});const reader=await open(r,store);
  const first=await reader.readEvidence(e.evidenceId,{length:5});assert.equal(raw(first).toString(),'EXACT');
  assert.deepEqual(first.recordedRange,{startByte:100,endByte:bytes.length-20});assert.deepEqual(first.displayedRange,{startByte:100,endByte:105});assert.equal(first.truncated,true);
  const next=await reader.readEvidence(e.evidenceId,{offset:5,length:4});assert.equal(raw(next).toString(),'aaaa');
  assert.equal((await reader.readEvidence(e.evidenceId,{length:readerLimits.pageBytes+1})).reason,'INVALID_RANGE');
  assert.equal((await reader.readEvidence(e.evidenceId,{offset:bytes.length})).reason,'INVALID_RANGE');
  assert.deepEqual(reader.report.bundle.coverage,r.bundle.coverage);
});

test('S05 binary and split UTF-8 byte windows use base64 without forged replacement text',async t=>{
  const store=await sandbox(t),r=synthetic();const binary=await record(r,store,Buffer.from([0,255,27,7]));
  const unicode=await record(r,store,Buffer.from('🙂'),{locator:{path:'package/unicode',startByte:0,endByte:4}});const reader=await open(r,store);
  const b=await reader.readEvidence(binary.evidenceId);assert.equal(b.encoding,'base64');assert.equal(b.inertText,undefined);assert.deepEqual(raw(b),Buffer.from([0,255,27,7]));
  const fragment=await reader.readEvidence(unicode.evidenceId,{offset:1,length:1});assert.equal(fragment.encoding,'base64');assert.equal(fragment.inertText,undefined);
});

test('S05 text safety covers ANSI, OSC, C1, bidi, line boundaries, Unicode and full recorded paths',async t=>{
  const hostile='x\u001b]52;c;INERT\u0007\u001b[2J\u009b31m\r\n\t\u202e\u2066🙂\ud800';
  const rendered=inertText(hostile);assert.ok(!/[\u0000-\u001f\u007f-\u009f\u202e\u2066]/.test(rendered));
  assert.match(rendered,/\\u001b/);assert.match(rendered,/\\n/);assert.match(rendered,/\\t/);assert.match(rendered,/🙂/);assert.match(rendered,/\\ud800/);
  assert.equal(inertText('one\ntwo',true),'one\ntwo');
  const store=await sandbox(t),r=synthetic(),path=hostile+'z'.repeat(10000);const e=await record(r,store,Buffer.from(hostile.replace('\ud800','')),{locator:{path,startByte:0,endByte:Buffer.byteLength(hostile.replace('\ud800',''))}});
  const reader=await open(r,store);assert.equal(reader.evidence(e.evidenceId).locator.path,path);
  const data=await reader.readEvidence(e.evidenceId);assert.equal(data.kind,'content');assert.ok(!/[\u001b\u0007\u009b\u202e\u2066]/.test(data.inertText));
  assert.ok(inertText(reader.evidence(e.evidenceId).locator.path).endsWith('z'.repeat(10000)));
});

test('S05 full blob hash is checked before exposing even a small valid-looking prefix',async t=>{
  const store=await sandbox(t),r=synthetic(),bytes=Buffer.from('prefix untouched; original suffix');const e=await record(r,store,bytes);const reader=await open(r,store);
  await fs.writeFile(join(store,'blobs',e.contentRef.slice(7)),Buffer.from('prefix untouched; changed! suffix'));
  assert.equal((await reader.readEvidence(e.evidenceId,{length:6})).reason,'HASH_MISMATCH');
});

test('S05 oversized/nonregular/symlink storage cannot turn evidence paths into filesystem reads',async t=>{
  const store=await sandbox(t),r=synthetic(),e=await record(r,store,Buffer.from('inert'));
  const path=join(store,'blobs',e.contentRef.slice(7));await fs.unlink(path);await fs.symlink('/etc/passwd',path);
  assert.equal((await (await open(r,store)).readEvidence(e.evidenceId)).reason,'READ_FAILED');
  await fs.unlink(path);const file=await fs.open(path,'w');await file.truncate(readerLimits.blobBytes+1);await file.close();
  assert.equal((await (await open(r,store)).readEvidence(e.evidenceId)).reason,'READ_LIMIT');
  await fs.unlink(path);await fs.mkdir(path);assert.equal((await (await open(r,store)).readEvidence(e.evidenceId)).reason,'READ_LIMIT');
});

test('S06 metadata remains openable with a nonexistent store; replay creates no store and refreshes nothing',async t=>{
  const dir=await sandbox(t),store=join(dir,'never-created');const reader=await ReportReader.openFile(real('B1.report.json'),store);
  assert.equal(reader.historical,true);assert.equal(reportFacts(reader).captureTime,load('examples/s3/current/B1.report.json').bundle.artifact.captureTime);
  const e=reader.report.bundle.evidence.find(e=>e.contentState==='retained');assert.equal((await reader.readEvidence(e.evidenceId)).reason,'MISSING_BLOB');
  await assert.rejects(fs.stat(store),{code:'ENOENT'});
});

test('S06 not_exported, unavailable, unknown IDs, line-only and invalid byte ranges stay distinct',async t=>{
  const store=await sandbox(t),r=synthetic();
  const exported=await record(r,store,Buffer.from('omitted'),{contentState:'not_exported',locator:{path:'omitted'}});
  const absent=await record(r,store,Buffer.from('unavailable'),{contentState:'unavailable',locator:{path:'absent'}});
  const lines=await record(r,store,Buffer.from('one\ntwo'),{locator:{path:'lines',startLine:1,endLine:2}});
  const badRange=await record(r,store,Buffer.from('short'),{locator:{path:'range',startByte:0,endByte:999}});
  const reader=await open(r,store);
  assert.equal((await reader.readEvidence(exported.evidenceId)).reason,'NOT_EXPORTED');assert.equal((await reader.readEvidence(absent.evidenceId)).reason,'UNAVAILABLE');
  assert.equal((await reader.readEvidence('ev_missing')).reason,'UNKNOWN_EVIDENCE');assert.equal((await reader.readEvidence(lines.evidenceId)).reason,'LINE_RANGE_UNSUPPORTED');
  assert.equal((await reader.readEvidence(badRange.evidenceId)).reason,'INVALID_RANGE');
  assert.equal((await reader.readEvidence(lines.evidenceId,{signal:AbortSignal.abort()})).reason,'CANCELLED');
});

test('S06 unsupported/corrupt imports fail validation, with no schema coercion or bytes availability claims',async()=>{
  const raw=await fs.readFile(real('B1.report.json'),'utf8');
  for(const candidate of ['{',raw.replace('"schemaVersion":"0.1.0"','"schemaVersion":"99.0.0"'),' {"x":1,"x":2} '])await assert.rejects(ReportReader.openJSON(candidate,realStore));
  await assert.rejects(ReportReader.openJSON(raw,realStore,{signal:AbortSignal.abort()}),{code:'CANCELLED'});
});

test('S06 file-open errors disclose fixed codes, preserve exact encoding identity and respect pre-cancel',async t=>{
  const dir=await sandbox(t),path=join(dir,'private-local-report.json');
  await assert.rejects(ReportReader.openFile(path,realStore),error=>error.code==='REPORT_READ_FAILED'&&!error.message.includes(dir));
  await fs.writeFile(path,Buffer.from([255]));await assert.rejects(ReportReader.openFile(path,realStore),{code:'REPORT_ENCODING_INVALID'});
  await fs.writeFile(path,Buffer.concat([Buffer.from([239,187,191]),await fs.readFile(real('B1.report.json'))]));
  await assert.rejects(ReportReader.openFile(path,realStore),{code:'CONTRACT_INVALID'},'Do not silently strip BOM and change raw report content identity');
  await assert.rejects(ReportReader.openFile(path,realStore,{signal:AbortSignal.abort()}),{code:'CANCELLED'});
});

test('S03/S06 delta readers refuse unbound refs, unknown transforms, duplicate JSON keys and unrecorded sides',async t=>{
  const store=await sandbox(t),r=synthetic();const member=await record(r,store,Buffer.from('inert member'));
  const descriptor={version:'heurisko-manifest-delta-v1',pointer:'/scripts/postinstall',artifact:{startByte:0,endByte:5,value:'inert'},artifactContentRef:member.contentRef,source:null,sourceContentRef:null};
  const unbound=await record(r,store,Buffer.from(JSON.stringify(descriptor)),{kind:'manifest_delta',side:'both',locator:{metadataKey:'scripts.postinstall'},observationMethod:'strict-json-value-byte-spans-v1'});
  const unsupported=await record(r,store,Buffer.from('{"version":"not-admitted"}'),{kind:'raw_diff',side:'both',locator:{metadataKey:'unknown'},observationMethod:'unknown-transform'});
  const duplicate=await record(r,store,Buffer.from('{"version":"heurisko-manifest-delta-v1","version":"other"}'),{kind:'manifest_delta',side:'both',locator:{metadataKey:'duplicate'},observationMethod:'strict-json-value-byte-spans-v1'});
  const reader=await open(r,store);
  assert.equal((await reader.readCitation(unbound.evidenceId,'artifact')).reason,'UNBOUND_MEMBER');
  assert.equal((await reader.readCitation(unsupported.evidenceId,'artifact')).reason,'UNSUPPORTED_RECORD');
  assert.equal((await reader.readCitation(duplicate.evidenceId,'artifact')).reason,'INVALID_RECORD');
  link(r,[member,unbound]);const linked=await open(r,store);assert.equal((await linked.readCitation(unbound.evidenceId,'artifact')).kind,'content');
  assert.equal((await linked.readCitation(unbound.evidenceId,'source')).reason,'SIDE_NOT_RECORDED');
});

test('S06 symlinked store directories are refused without following them or changing retained data',async t=>{
  const dir=await sandbox(t),actual=join(dir,'actual'),alias=join(dir,'alias'),r=synthetic();const e=await record(r,actual,Buffer.from('inert'));
  await fs.symlink(actual,alias);const result=await (await open(r,alias)).readEvidence(e.evidenceId);assert.equal(result.reason,'READ_FAILED');
  assert.equal((await fs.readFile(join(actual,'blobs',e.contentRef.slice(7)))).toString(),'inert');
});

test('S03/S06 a delta citation cannot widen its linked member byte or unsupported line scope',async()=>{
  const original=load('examples/s3/current/local-mutation-replay.report.json');
  const delta=original.bundle.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='scripts.postinstall');
  const data=JSON.parse(await fs.readFile(join(realStore,'blobs',delta.contentRef.slice(7)),'utf8'));
  const change=original.bundle.changes.find(c=>c.evidenceIds.includes(delta.evidenceId));
  const member=original.bundle.evidence.find(e=>e.kind==='artifact_member'&&e.contentSha256===data.artifactContentRef&&change.evidenceIds.includes(e.evidenceId));
  const path=member.locator.path;
  for(const [locator,reason]of [
    [{path,startByte:0,endByte:0},'INVALID_RANGE'],
    [{path,startLine:1,endLine:1},'LINE_RANGE_UNSUPPORTED'],
    [{path,startByte:0},'LINE_RANGE_UNSUPPORTED'],
    [{path,startByte:data.artifact.startByte,endByte:data.artifact.endByte},undefined],
    [{path},undefined],
  ]) {
    const report=structuredClone(original),updated=report.bundle.evidence.find(e=>e.evidenceId===member.evidenceId);
    updated.locator=locator;updated.evidenceId=evidenceId(report.bundle,updated);
    // Locator changes get their actual new ID throughout this valid report.
    const reader=await ReportReader.openJSON(JSON.stringify(report).replaceAll(member.evidenceId,updated.evidenceId),realStore);
    const result=await reader.readCitation(delta.evidenceId,'artifact');
    if(reason) {assert.equal(result.kind,'metadata_only');assert.equal(result.reason,reason);}
    else {assert.equal(result.kind,'content');assert.deepEqual(result.recordedRange,{startByte:data.artifact.startByte,endByte:data.artifact.endByte});}
  }
});

test('S08 cancellation remains a request until an injected engine settles; no cleanup acknowledgment is invented',async()=>{
  let finish,seenSignal;const r=f0();const gate=new Promise(resolve=>{finish=resolve;});
  const task=startInvestigation(r.bundle.input,r.bundle.input.analysisOptions,{engine:async(_input,_options,context)=>{seenSignal=context.signal;context.onProgress({stage:'acquire',status:'running'});return gate;}});
  assert.equal(task.snapshot().phase,'running');assert.equal(task.snapshot().events[0].status,'running');
  assert.equal(task.capabilities.detach,false);assert.equal(task.capabilities.cancellationAcknowledgment,false);
  assert.equal(task.cancel(),true);assert.equal(seenSignal.aborted,true);assert.equal(task.snapshot().phase,'cancel_requested');assert.equal(task.cancel(),false);
  await new Promise(resolve=>setImmediate(resolve));assert.equal(task.snapshot().phase,'cancel_requested');
  finish(r);const result=await task.result;assert.equal(result.kind,'report');assert.equal(result.cancellationRequested,true);assert.equal(result.cleanup,'not_observable');
  assert.equal(task.snapshot().phase,'settled_report');assert.equal(task.cancel(),false);assert.deepEqual(result.report,r);
});

test('S08 progress forwarding is bounded, preserves real states, and observer errors cannot destroy results',async()=>{
  let release;const r=f0(),gate=new Promise(resolve=>{release=resolve;});const event={stage:'inventory',status:'running',completedUnits:3,totalUnits:10};
  const task=startInvestigation(r.bundle.input,r.bundle.input.analysisOptions,{engine:async(_i,_o,context)=>{await gate;for(let i=0;i<140;i++)context.onProgress(event);event.status='failed';return r;}});
  const unsubscribe=task.subscribe(()=>{throw new Error('local observer failure');});release();const result=await task.result;unsubscribe();
  assert.equal(result.kind,'report');assert.equal(task.snapshot().events.length,128);assert.equal(task.snapshot().omittedEvents,12);
  assert.equal(task.snapshot().events[0].sequence,13);assert.equal(task.snapshot().events.at(-1).status,'running');
  assert.equal(task.snapshot().events[0].completedUnits,3);assert.throws(()=>{task.snapshot().events.push({});},TypeError);
});

test('S08 inputs are snapshotted and malformed/failed engines return no forged report or private error text',async()=>{
  const r=f0(),input=structuredClone(r.bundle.input),options=structuredClone(input.analysisOptions),originalOptions=structuredClone(options);let release;const gate=new Promise(resolve=>{release=resolve;});
  const task=startInvestigation(input,options,{engine:async(i,o)=>{await gate;assert.notEqual(i.artifactPath,'changed');assert.deepEqual(o,originalOptions);return r;}});
  input.artifactPath='changed';options.enableAI=!options.enableAI;release();assert.equal((await task.result).kind,'report');
  for(const engine of [async()=>{throw new Error('/private/path/\u001b]52;c;INERT');},async()=>({schemaVersion:'99.0.0'})]) {
    const result=await startInvestigation(r.bundle.input,r.bundle.input.analysisOptions,{engine}).result;
    assert.equal(result.kind,'error');assert.equal(result.exitCode,3);assert.equal(result.report,undefined);assert.match(result.code,/^[A-Z_]+$/);assert.ok(!JSON.stringify(result).includes('/private/path'));
  }
});

test('S08 real core pre-cancel validation is observable as no usable report, independently of mocked lifecycle',async()=>{
  const r=f0();const task=startInvestigation(r.bundle.input,r.bundle.input.analysisOptions);task.cancel();const result=await task.result;
  assert.equal(result.kind,'error');assert.equal(result.code,'CANCELLED');assert.equal(result.cancellationRequested,true);
});

test('S09 all AI states preserve deterministic fields; synthetic statuses are not live model evidence',async()=>{
  for(const status of ['disabled','available','unavailable','failed','rejected','abstained']) {
    const r=synthetic();r.analysis.aiState={status,validation:status==='rejected'?'rejected':status==='available'?'passed':'not_run',reason:'Synthetic AI-state coverage; no inference.'};
    const facts=reportFacts(await open(r,realStore));assert.equal(facts.aiState.status,status);assert.deepEqual(facts.outcomes,r.outcomes);assert.deepEqual(facts.coverage,r.bundle.coverage);
    assert.equal(facts.interpretations.length,0);assert.equal(facts.examinedScopeFindingCount,null);
  }
});

test('non-TTY baseline CLI preserves one JSON report, exact IDs and no interactive dependency',()=>{
  const cli=join(root,'packages/cli/dist/index.js');const run=args=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8',maxBuffer:8*1024*1024});
  const help=run([]);assert.equal(help.status,0);assert.match(help.stdout,/Usage:/);assert.ok(!help.stdout.includes('\u001b'));
  const inspected=run(['inspect',real('B1.report.json'),'--store',realStore,'--json','--no-color']);assert.equal(inspected.status,2);assert.equal(inspected.stderr,'');
  assert.deepEqual(JSON.parse(inspected.stdout),load('examples/s3/current/B1.report.json'));
  const bad=run(['analyze','npm:name@latest','--json']);assert.equal(bad.status,3);assert.equal(bad.stdout,'');
  const linearTui=run(['tui',real('B1.report.json')]);assert.equal(linearTui.status,2);assert.match(linearTui.stdout,/retained observation; no fresh registry/);assert.ok(!linearTui.stdout.includes('\u001b'));
});
