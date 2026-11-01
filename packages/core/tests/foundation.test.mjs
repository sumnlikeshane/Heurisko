import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { canonicalJSON, canonicalId, reportId, evidenceId, sha256, sourceIdentity, orderCandidates, configurationFingerprint, deterministicReportDigest, validateProducedBundle, validateConsumedAnalysis, validateReport, encodeReport, decodeReport, runAnalysis, safetyProfile } from '../dist/index.js';

const root = resolve(import.meta.dirname, '../../..');
const fixture = (id, kind) => JSON.parse(readFileSync(resolve(root, 'packages/contracts/tests/fixtures', id, kind + '.json'), 'utf8'));
const f0 = () => fixture('F0', 'bundle');
const a0 = () => fixture('F0', 'analysis');
const r0 = () => fixture('F0', 'report');
const python = resolve(root, '.venv/bin/python');

test('known-answer ASCII/Unicode/integer vectors match the accepted Python algorithm', () => {
  const vectors = JSON.parse(readFileSync(new URL('./id-vectors.json', import.meta.url), 'utf8'));
  for (const v of vectors) {
    assert.equal(canonicalJSON(v.value), v.canonical);
    assert.equal(canonicalId('ev_', v.value), v.id);
  }
  const script = "import sys,json; sys.path.insert(0,'packages/contracts/runtime'); from semantics import canonical_id; print(json.dumps([canonical_id('ev_',v['value']) for v in json.load(sys.stdin)]))";
  const ids = JSON.parse(execFileSync(python, ['-I', '-c', script], {cwd:root, input:JSON.stringify(vectors), encoding:'utf8'}));
  assert.deepEqual(ids, vectors.map(v=>v.id));
  for (const v of [NaN, Infinity, -0, 0.1, 9007199254740992, undefined, new Date(), [undefined]]) assert.throws(()=>canonicalJSON(v));
});

test('all G0 evidence/report IDs are reproduced without changing accepted fixture order', () => {
  for (let i=0;i<7;i++) {
    const r = fixture(`F${i}`, 'report');
    assert.equal(reportId(r.bundle,r.analysisConfigFingerprint), r.reportId);
    for (const e of r.bundle.evidence) assert.equal(evidenceId(r.bundle,e), e.evidenceId);
  }
});

test('source order is deterministic; subtree/snapshot/build/config changes alter identity', () => {
  const b = fixture('F3','bundle');
  assert.deepEqual(orderCandidates(b.sourceCandidates),orderCandidates([...b.sourceCandidates].reverse()));
  const baseline = reportId(b,'config');
  for (const field of ['subdirectory','sourceSnapshotSha256','buildContextSha256','commit','repositoryUrl']) {
    const changed=structuredClone(b); changed.sourceCandidates[0][field] = field.includes('Sha256') ? sha256('changed') : field==='commit' ? 'b'.repeat(40) : 'changed';
    assert.notEqual(reportId(changed,'config'),baseline);
  }
  assert.notEqual(reportId(b,'config-v2'), baseline);
  const config = {version:'heurisko-config-v1',subject:{ecosystem:'local',origin:'local',packageName:null,version:null,artifactFilename:'sample.tgz',registryUrl:null},artifactSha256:b.artifact.observedSha256,sources:b.sourceCandidates.map(sourceIdentity),versions:{engine:'0.1.0',rules:'unavailable',tools:'ledger-v1',policy:'none',normalizers:'none',verifier:'unavailable',trustRoot:'none'},options:b.input.analysisOptions,safetyProfileSha256:sha256(canonicalJSON(safetyProfile)),interpretationConfigSha256:null};
  const fingerprint=configurationFingerprint(config);
  assert.equal(configurationFingerprint({...config,sources:[...config.sources].reverse()}),fingerprint);
  for (const key of Object.keys(config.versions)) assert.notEqual(configurationFingerprint({...config,versions:{...config.versions,[key]:'changed'}}),fingerprint);
  assert.notEqual(configurationFingerprint({...config,options:{...config.options,enableAI:true}}), fingerprint);
  assert.notEqual(configurationFingerprint({...config,subject:{...config.subject,artifactFilename:'other.tgz'}}), fingerprint);
  assert.throws(()=>configurationFingerprint({}));
  const expected = execFileSync(python,['-I','-c',"import sys,json,hashlib; v=json.load(sys.stdin); v['sources']=sorted(v['sources'],key=lambda s:json.dumps(s,sort_keys=True,separators=(',',':'))); print('sha256:'+hashlib.sha256(json.dumps(v,sort_keys=True,separators=(',',':')).encode()).hexdigest())"],{input:JSON.stringify(config),encoding:'utf8'}).trim();
  assert.equal(fingerprint,expected);
});

test('producer/consumer/persistence/import boundaries accept all positive G0 records', async () => {
  for (let i=0;i<7;i++) {
    const b=fixture(`F${i}`,'bundle'), a=fixture(`F${i}`,'analysis'), r=fixture(`F${i}`,'report');
    await validateProducedBundle(b); await validateConsumedAnalysis(a,b); await validateReport(r);
    assert.deepEqual(await decodeReport(await encodeReport(r)),r);
  }
});

test('every accepted negative G0 counterexample is rejected at runtime', async () => {
  const dir=resolve(root,'packages/contracts/tests/negative');
  for (const file of readdirSync(dir).filter(f=>f.endsWith('.json'))) {
    const value=JSON.parse(readFileSync(resolve(dir,file),'utf8'));
    await assert.rejects(validateReport(value),{code:'CONTRACT_INVALID'},file);
  }
});

test('producer rejects unknown fields, forged IDs and unaccounted omissions', async () => {
  const unknown=f0(); unknown.safe=true;
  await assert.rejects(validateProducedBundle(unknown),{code:'CONTRACT_INVALID'});
  const id=f0(); id.evidence[0].evidenceId='ev_'+'0'.repeat(24);
  await assert.rejects(validateProducedBundle(id),{code:'CONTRACT_INVALID'});
  const missing=fixture('F4','bundle'); missing.coverage.omissions=[];
  await assert.rejects(validateProducedBundle(missing),{code:'CONTRACT_INVALID'});
});

test('consumer references are checked against the original evidence', async () => {
  const b=fixture('F1','bundle'), a=fixture('F1','analysis');
  a.findings[0].evidenceIds=['ev_'+'0'.repeat(24)];
  await assert.rejects(validateConsumedAnalysis(a,b),{code:'CONTRACT_INVALID'});
});

test('import rejects duplicate keys, unsafe numeric values, malformed JSON and size overflow', async () => {
  const r=JSON.stringify(r0());
  await assert.rejects(decodeReport(r.replace('"schemaVersion":"0.1.0"','"schemaVersion":"bad","schemaVersion":"0.1.0"')),{code:'CONTRACT_INVALID'});
  await assert.rejects(decodeReport(r.replace('"analyzedBytes":', '"analyzedBytes":9007199254740992,"unused":')),{code:'CONTRACT_INVALID'});
  await assert.rejects(decodeReport('{'),{code:'CONTRACT_INVALID'});
  await assert.rejects(decodeReport(' '.repeat(8*1024*1024+1)),{code:'VALIDATION_LIMIT'});
});

test('missing validator fails closed; pre-cancelled validation never runs', async () => {
  await assert.rejects(validateReport(r0(),{pythonExecutable:'/nonexistent/heurisko-python'}),{code:'VALIDATOR_UNAVAILABLE'});
  await assert.rejects(validateReport(r0(),{signal:AbortSignal.abort()}),{code:'CANCELLED'});
  const abort=new AbortController();
  const active=validateReport(r0(),{signal:abort.signal});
  abort.abort();
  await assert.rejects(active,{code:'CANCELLED'});
});

test('boundary results and persistence encoding cannot change while validation awaits', async () => {
  const bundle=f0(); const before=structuredClone(bundle);
  const pending=validateProducedBundle(bundle);
  bundle.artifact.observedSha256='sha256:'+'0'.repeat(64);
  assert.deepEqual(await pending,before);
  const report=r0(); const encoded=encodeReport(report);
  report.outcomes.policyResult='violation';
  assert.equal(JSON.parse(await encoded).outcomes.policyResult,'not_evaluated');
});

test('missing analysis is explicitly incomplete with no invented findings', async () => {
  const b=f0(), before=JSON.stringify(b), progress=[];
  const a=await runAnalysis(b,b.input.analysisOptions,undefined,{onProgress:e=>progress.push(e)});
  assert.equal(a.stages[0].errors[0].code,'ANALYSIS_MODULE_UNAVAILABLE');
  assert.equal(a.stages[0].status,'incomplete'); assert.deepEqual(a.findings,[]);
  assert.equal(a.aiState.status,'disabled'); assert.equal(JSON.stringify(b),before);
  assert.deepEqual(progress.filter(e=>e.stage==='heuristics').map(e=>e.status),['running','incomplete']);
  const r=r0(); r.analysis=a;
  await assert.rejects(validateReport(r),{code:'CONTRACT_INVALID'});
  r.outcomes.analysisCompleteness='incomplete'; r.outcomes.policyResult='indeterminate';
  await validateReport(r);
});

test('injected team module receives deeply frozen copies and validated options', async () => {
  const b=f0(); const before=JSON.stringify(b);
  const module={moduleId:'test-only',moduleVersion:'1',implementationSha256:sha256('authored-test-module'),configurationSha256:sha256('{}'),analyzeEvidence:async(input,options)=>{
    assert(Object.isFrozen(input.evidence[0].locator)); assert(Object.isFrozen(options));
    assert.throws(()=>input.artifact.observedSha256='changed'); return a0();
  }};
  assert.deepEqual(await runAnalysis(b,b.input.analysisOptions,module),a0());
  assert.equal(JSON.stringify(b),before);
  await assert.rejects(runAnalysis(b,{...b.input.analysisOptions,unknown:true},module),{code:'CONTRACT_INVALID'});
});

test('module exceptions are bounded errors; invalid output is rejected', async () => {
  const b=f0();
  await assert.rejects(runAnalysis(b,b.input.analysisOptions,{moduleId:'test',moduleVersion:'1',implementationSha256:sha256('authored-test-module'),configurationSha256:sha256('{}'),analyzeEvidence:async()=>{throw Error('untrusted\u001b[31m');}}),{code:'ANALYSIS_MODULE_FAILED',message:'ANALYSIS_MODULE_FAILED'});
  await assert.rejects(runAnalysis(b,b.input.analysisOptions,{moduleId:'test',moduleVersion:'1',implementationSha256:sha256('authored-test-module'),configurationSha256:sha256('{}'),analyzeEvidence:async()=>({})}),{code:'CONTRACT_INVALID'});
});

test('cancellation stops waiting for an asynchronous team module', async () => {
  const b=f0(), abort=new AbortController();
  const module={moduleId:'test',moduleVersion:'1',implementationSha256:sha256('authored-test-module'),configurationSha256:sha256('{}'),analyzeEvidence:async()=>{abort.abort();return new Promise(()=>{});}};
  await assert.rejects(runAnalysis(b,b.input.analysisOptions,module,{signal:abort.signal}),{code:'CANCELLED'});
});

test('deterministic equivalence excludes timestamps/model prose; storage bytes differ', () => {
  const r=r0(), changed=structuredClone(r);
  changed.createdAt='2026-11-01T00:00:00Z'; changed.bundle.artifact.captureTime=changed.createdAt;
  changed.analysis.aiState={status:'unavailable',reason:'new runtime observation',validation:'not_run'};
  changed.analysis.interpretations=[{hypothesis:'different model prose'}];
  assert.equal(deterministicReportDigest(changed),deterministicReportDigest(r));
  assert.notEqual(sha256(JSON.stringify(changed)),sha256(JSON.stringify(r)));
  changed.bundle.coverage.complete=false;
  assert.notEqual(deterministicReportDigest(changed),deterministicReportDigest(r));
});

test('unavailable AI can coexist with completed deterministic processing', async () => {
  const r=r0();
  r.analysis.aiState={status:'unavailable',validation:'not_run',reason:'No runtime supplied'};
  r.analysis.stages.find(s=>s.stage==='ai').status='failed';
  await validateReport(r);
  assert.equal(r.outcomes.analysisCompleteness,'complete');
});

test('CLI help is noninteractive; malformed analyze returns 3', () => {
  const cli=resolve(root,'packages/cli/dist/index.js');
  const help=spawnSync(process.execPath,[cli,'--help'],{encoding:'utf8'});
  assert.equal(help.status,0); assert.equal(help.stderr,''); assert.match(help.stdout,/local evidence/);
  const bad=spawnSync(process.execPath,[cli,'analyze'],{encoding:'utf8'});
  assert.equal(bad.status,3); assert.equal(bad.stdout,'');
});
