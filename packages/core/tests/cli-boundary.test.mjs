// Controlled import failures; retained public reports/bytes remain unchanged.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {EvidenceStore,sha256,decodeReportBytes} from '../dist/index.js';
import {ReportReader} from '../../../integration/part4/dist/report-reader.js';

const root=resolve(import.meta.dirname,'../../..');
const cli=join(root,'packages/cli/dist/index.js');
const reportFile=join(root,'examples/handoff/current/B1.report.json');
const retainedStore=join(root,'examples/handoff/current/store');
const run=args=>spawnSync(process.execPath,[cli,...args],{encoding:'utf8',timeout:10_000,maxBuffer:8*1024*1024});
async function sandbox(t) {
  const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-cli-boundary-'));
  t.after(()=>fs.rm(dir,{recursive:true,force:true}));return dir;
}

test('bounded local file open rejects FIFO before waiting for a writer',async t=>{
  const dir=await sandbox(t),fifo=join(dir,'report.pipe');
  const made=spawnSync('mkfifo',[fifo],{encoding:'utf8'});assert.equal(made.status,0,made.stderr);
  const url=new URL('../dist/storage.js',import.meta.url).href;
  const code=`import {boundedFile} from ${JSON.stringify(url)};try{await boundedFile(process.argv[1],1024);process.exitCode=1;}catch(error){console.log(error.code);}`;
  const opened=spawnSync(process.execPath,['--input-type=module','-e',code,fifo],{encoding:'utf8',timeout:3000});
  assert.equal(opened.error,undefined,'A nonregular file must not block before the type check');
  assert.equal(opened.status,0,opened.stderr);assert.equal(opened.stdout.trim(),'FILE_LIMIT_OR_TYPE');
  for(const command of ['inspect','tui']) {
    const rejected=run([command,fifo,'--store',retainedStore]);assert.equal(rejected.error,undefined);
    assert.equal(rejected.status,3);assert.equal(rejected.stdout,'');
  }
});

test('CLI file and digest imports reject invalid UTF-8 instead of changing report identity',async t=>{
  const dir=await sandbox(t),report=JSON.parse(await fs.readFile(reportFile,'utf8'));
  report.bundle.limitations.push('audit-sentinel');
  const encoded=Buffer.from(JSON.stringify(report));
  const bad=Buffer.concat([encoded.subarray(0,encoded.indexOf('audit-sentinel')),Buffer.from([0xff]),encoded.subarray(encoded.indexOf('audit-sentinel')+1)]);
  const path=join(dir,'invalid.report.json');await fs.writeFile(path,bad);
  const store=new EvidenceStore(join(dir,'store'));const ref=await store.put(bad);
  assert.notEqual(ref,sha256(bad.toString('utf8')));
  await assert.rejects(decodeReportBytes(bad),{code:'REPORT_ENCODING_INVALID'});
  await assert.rejects(store.loadReport(ref),{code:'REPORT_ENCODING_INVALID'});
  await assert.rejects(ReportReader.openBytes(bad,store.root),{code:'REPORT_ENCODING_INVALID'});
  for(const command of ['inspect','tui'])for(const target of [path,ref]) {
    const rejected=run([command,target,'--store',store.root,...(command==='inspect'?['--json']:[])]);
    assert.equal(rejected.status,3,rejected.stderr);assert.equal(rejected.stdout,'');
    assert.match(rejected.stderr,/REPORT_ENCODING_INVALID/);
  }
});

test('CLI report byte imports preserve BOM rejection and valid retained identity',async t=>{
  const dir=await sandbox(t),bytes=await fs.readFile(reportFile);
  const bom=Buffer.concat([Buffer.from([0xef,0xbb,0xbf]),bytes]);const path=join(dir,'bom.report.json');await fs.writeFile(path,bom);
  await assert.rejects(decodeReportBytes(bom),{code:'CONTRACT_INVALID'});
  const rejected=run(['inspect',path,'--store',retainedStore,'--json']);assert.equal(rejected.status,3);assert.equal(rejected.stdout,'');assert.match(rejected.stderr,/CONTRACT_INVALID/);
  const reader=await ReportReader.openBytes(bytes,retainedStore);assert.equal(reader.reportContentRef,sha256(bytes));
  const opened=run(['inspect',reportFile,'--store',retainedStore,'--json']);assert.equal(opened.status,2,opened.stderr);assert.equal(opened.stderr,'');assert.deepEqual(JSON.parse(opened.stdout),reader.report);
  const byDigest=run(['inspect',reader.reportContentRef,'--store',retainedStore,'--json']);assert.equal(byDigest.status,2,byDigest.stderr);assert.deepEqual(JSON.parse(byDigest.stdout),reader.report);
  const linear=run(['tui',reportFile,'--store',retainedStore,'--no-color']);assert.equal(linear.status,2,linear.stderr);assert.match(linear.stdout,new RegExp(reader.report.reportId));
  const linearDigest=run(['tui',reader.reportContentRef,'--store',retainedStore,'--no-color']);assert.equal(linearDigest.status,2,linearDigest.stderr);assert.equal(linearDigest.stdout,linear.stdout);
});

for(const state of ['not_exported','unavailable'])test('CLI evidence inspection honors '+state+' even when matching bytes exist',async t=>{
  const dir=await sandbox(t),report=JSON.parse(await fs.readFile(reportFile,'utf8'));
  const e=report.bundle.evidence.find(e=>e.kind==='artifact_member'&&e.contentState==='retained');
  const original=run(['inspect',reportFile,'--store',retainedStore,'--evidence',e.evidenceId,'--json']);
  assert.equal(original.status,2,original.stderr);assert.ok(JSON.parse(original.stdout).content.totalBytes>0);
  e.contentState=state;const path=join(dir,'state.report.json');await fs.writeFile(path,JSON.stringify(report));
  const reader=await ReportReader.openFile(path,retainedStore);const read=await reader.readEvidence(e.evidenceId);
  assert.equal(read.kind,'metadata_only');assert.equal(read.reason,state==='not_exported'?'NOT_EXPORTED':'UNAVAILABLE');
  const rejected=run(['inspect',path,'--store',retainedStore,'--evidence',e.evidenceId,'--json']);
  assert.equal(rejected.status,3);assert.equal(rejected.stdout,'');assert.match(rejected.stderr,/EVIDENCE_NOT_RETAINED/);
});
