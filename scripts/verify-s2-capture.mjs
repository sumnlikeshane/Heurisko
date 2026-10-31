// Replay/identity verification of retained public case bytes; no network or code execution.
import * as fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve,join } from 'node:path';
import { EvidenceStore,decodeReport,decodeBundle,sha256,canonicalJSON,writeImmutable } from '../packages/core/dist/index.js';
const historical=process.argv.includes('--historical');
const receiptArgument=process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:undefined;
const base=resolve(process.argv[2]??'examples/s2/current');const manifest=JSON.parse(await fs.readFile(join(base,'capture-manifest.json'),'utf8'));const store=new EvidenceStore(join(base,'store'));
const records=[];const reports=[];let diffSpans=0,manifestSpans=0;
const codeDigests={};for(const name of ['engine','producer','comparison','archive','network','storage','parser-runtime','adapter','identity','validation','safety'])codeDigests[name]=sha256(await fs.readFile(resolve('packages/core/dist',name+'.js')));codeDigests.parserWorker=sha256(await fs.readFile('packages/core/runtime/archive_worker.py'));const currentEngine='shane-s2-v1;'+sha256(canonicalJSON(codeDigests));
const engine=historical?JSON.parse(await fs.readFile(join(base,'verification.json'),'utf8')).engine:currentEngine;
for(const capture of manifest.captures)assert.equal(sha256(await fs.readFile(join(base,'inputs',capture.filename))),capture.sha256);
for(const item of manifest.reports){
 const bytes=await fs.readFile(join(base,item.reportFile));assert.equal(sha256(bytes),item.reportContentRef);const report=await decodeReport(bytes.toString());await store.verifyEvidence(report);assert.deepEqual(await store.loadReport(item.reportContentRef),report);
 const bundle=await decodeBundle(await fs.readFile(join(base,item.bundleFile),'utf8'));assert.deepEqual(bundle,report.bundle);reports.push(report);
 const config=JSON.parse((await store.get(bundle.evidence.find(e=>e.locator.metadataKey==='analysis-configuration').contentRef)).toString());assert.equal(config.versions.engine,engine,'Report must bind to the final reviewed code bytes');
 for(const e of bundle.evidence){
  if(e.kind==='raw_diff'){
   const delta=JSON.parse((await store.get(e.contentRef)).toString());if(delta.version!=='heurisko-raw-diff-v1')continue;
   for(const side of ['source','artifact']){const d=delta[side];if(!d.contentRef)continue;const full=await store.get(d.contentRef);assert.ok(d.changedSpan.startByte<=d.changedSpan.endByte&&d.changedSpan.endByte<=full.length);assert.equal(full.subarray(d.changedSpan.startByte,Math.min(d.changedSpan.endByte,d.changedSpan.startByte+2048)).toString('base64'),d.excerptBase64);diffSpans++;}
  }else if(e.kind==='manifest_delta'){
   const delta=JSON.parse((await store.get(e.contentRef)).toString());for(const side of ['source','artifact']){const value=delta[side];if(value===null)continue;const full=await store.get(delta[side+'ContentRef']);assert.deepEqual(JSON.parse(full.subarray(value.startByte,value.endByte).toString()),value.value);manifestSpans++;}
  }
 }
 records.push({label:item.label,reportId:report.reportId,reportContentRef:item.reportContentRef,configurationFingerprint:report.analysisConfigFingerprint,retainedEvidenceVerified:bundle.evidence.length,rawCoverage:bundle.coverage,exitCode:2});
}
const [baseline,mutated]=reports;const members=r=>new Map(r.bundle.evidence.filter(e=>e.kind==='artifact_member').map(e=>[e.locator.path,e]));const a=members(baseline),b=members(mutated);const added=[...b.keys()].filter(k=>!a.has(k));const removed=[...a.keys()].filter(k=>!b.has(k));const changed=[...a.keys()].filter(k=>b.has(k)&&a.get(k).contentSha256!==b.get(k).contentSha256);
assert.deepEqual(added,['package/heurisko-inert-marker.js']);assert.deepEqual(removed,[]);assert.deepEqual(changed,['package/package.json']);
const oldManifest=JSON.parse((await store.get(a.get('package/package.json').contentRef)).toString()),newManifest=JSON.parse((await store.get(b.get('package/package.json').contentRef)).toString());assert.equal(newManifest.scripts.postinstall,'HEURISKO_INERT_TEST_ONLY');delete newManifest.scripts.postinstall;if(oldManifest.scripts===undefined){assert.deepEqual(newManifest.scripts,{});delete newManifest.scripts;}assert.deepEqual(newManifest,oldManifest);
assert.notEqual(baseline.reportId,mutated.reportId);assert.notEqual(baseline.bundle.artifact.observedSha256,mutated.bundle.artifact.observedSha256);
const handshakes=[];for(const revision of ['m0','m1'])for(const kind of ['release','mutation']){
 const file=`${revision}-${kind}-handshake.json`;const r=JSON.parse(await fs.readFile(join(base,file),'utf8'));assert.equal(r.inputUnchanged,true);assert.equal(r.enableAI,false);assert.equal(r.producerValidation,'passed');handshakes.push({file,status:r.status,findings:r.actualConsumerOutput.findings.length,actualModuleVersion:r.actualModuleVersion,sourceSha256:r.sourceSha256,compiledSha256:r.compiledSha256});
}
const m1=JSON.parse(await fs.readFile(join(base,'m1-mutation-handshake.json'),'utf8'));const hook=m1.actualConsumerOutput.findings.find(f=>f.ruleId==='heurisko.manifest.lifecycle-script-change'&&f.observation.includes('scripts.postinstall'));assert.ok(hook);assert.ok(mutated.bundle.evidence.some(e=>hook.evidenceIds.includes(e.evidenceId)&&e.kind==='manifest_delta'&&e.locator.metadataKey==='scripts.postinstall'));
const result={version:'heurisko-s2-verification-v1',validationScope:historical?'Historical retained evidence/receipts; no claim these reports use current S3 code.':'Current code binding plus retained evidence',verifiedAt:new Date().toISOString(),engine,records,rawDiffSideSpansVerified:diffSpans,manifestValueSpansVerified:manifestSpans,independentMutationOracle:{added,removed,modified:changed,exactStructuredDelta:'scripts.postinstall = HEURISKO_INERT_TEST_ONLY'},defaultCLIAnalysis:'not injected; explicitly incomplete',earlyConsumerChecks:handshakes,rights:'Original picocolors ISC LICENSE retained in PICOCOLORS-LICENSE.txt',limits:['M0 is only a boundary; M1 is a separately supplied uncommitted initial-rule patch, not a selected product model.','Reference/schema/immutability checks passed; no comprehensive rule accuracy or explanation-entailment claim.','M1 currently describes retained value availability conservatively without a byte resolver; this needs Malhar review before final integration.']};
const receipt=receiptArgument?resolve(receiptArgument):join(base,'verification.json');
let prior=false;try{await fs.stat(receipt);prior=true;}catch(error){if(error.code!=='ENOENT')throw error;}
// Rechecking is read-only by default. Supply a new receipt path to retain the
// later check; a previously retained observation is never replaced.
if(receiptArgument||!prior)await writeImmutable(receipt,Buffer.from(JSON.stringify(result,null,2)+'\n'));
await writeImmutable(join(base,'PICOCOLORS-LICENSE.txt'),await store.get(a.get('package/LICENSE').contentRef));
console.log(JSON.stringify({records,rawDiffSideSpansVerified:diffSpans,manifestValueSpansVerified:manifestSpans,handshakes},null,2));
