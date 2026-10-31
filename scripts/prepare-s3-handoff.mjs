// Local index of already-generated evidence and already-executed model-off
// consumer receipts. No messaging, model calls or module adoption.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {sha256,writeImmutable} from '../packages/core/dist/index.js';
const base=resolve(process.argv[2]??'examples/s3/current');
const prior=JSON.parse(await fs.readFile('examples/s2/current/verification.json','utf8'));
const cases=[];
for(const id of ['B1','B2']){
 const manifest=JSON.parse(await fs.readFile(join(base,`${id}.manifest.json`),'utf8'));
 const bundle=await fs.readFile(join(base,manifest.bundleFile));const checks=[];
 for(const revision of ['m0','m1']){
  const file=`${revision}-${id}-handshake.json`;const r=JSON.parse(await fs.readFile(join(base,file),'utf8'));
  assert.equal(r.bundleContentRef,sha256(bundle));assert.equal(r.inputUnchanged,true);assert.equal(r.enableAI,false);assert.equal(r.consumerCalled,true);assert.equal(r.producerValidation,'passed');
  const known=prior.earlyConsumerChecks.find(x=>x.file===`${revision}-release-handshake.json`);assert.equal(r.sourceSha256,known.sourceSha256);assert.equal(r.compiledSha256,known.compiledSha256);
  checks.push({revision:revision==='m0'?'received M0 archive':'received M0 plus separate uncommitted M1 patch',file,status:r.status,actualModuleVersion:r.actualModuleVersion,moduleIdentity:r.moduleIdentity??null,sourceSha256:r.sourceSha256,compiledSha256:r.compiledSha256,retainedEvidenceVerified:r.retainedEvidenceVerified,findings:r.actualConsumerOutput.findings.length,heuristics:r.actualConsumerOutput.stages.find(s=>s.stage==='heuristics')?.status,modelExecution:r.modelExecution,inputUnchanged:r.inputUnchanged});
 }
 cases.push({caseId:id,reportId:manifest.reportId,bundleFile:manifest.bundleFile,bundleContentRef:sha256(bundle),metadataRef:manifest.metadataRef,sourceCandidates:manifest.sourceCandidates,buildContextEvidence:manifest.malharHandoff.buildContextEvidence,artifactSourceMaps:manifest.malharHandoff.artifactSourceMaps,consumerChecks:checks});
}
const result={version:'heurisko-s3-local-handoff-v1',preparedAt:new Date().toISOString(),store:'store',resolver:'EvidenceStore.get(sha256:<64 lower hex>) checks raw bytes; no arbitrary paths. Received M0/M1 currently uses no resolver.',cases,ownership:'Malhar retains deterministic security/build interpretation, retrieval/model, claim-support/citation evaluation and independent labels. No source rewritten or adopted into product workspace.',limitations:['Boundary/schema/reference/immutability handshakes are not rule-quality or explanation-entailment acceptance.','M0 and the distinct uncommitted M1 patch are not a selected product model or final integrated module.','Default production reports remain uninjected with ANALYSIS_MODULE_UNAVAILABLE.','Broader held-out corpus and meaningful actual model work remain open.'],delivery:'Prepared locally only; no external message, upload or publication.'};
await writeImmutable(join(base,'handoff.json'),Buffer.from(JSON.stringify(result,null,2)+'\n'));console.log(JSON.stringify(cases.map(c=>({id:c.caseId,checks:c.consumerChecks}))));
