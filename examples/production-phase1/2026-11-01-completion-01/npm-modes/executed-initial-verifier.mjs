// Compare three already-retained npm observations without network or reanalysis.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {decodeReportBytes,sha256,exitCode,EvidenceStore} from '../packages/core/dist/index.js';
import {ReportReader} from '../integration/part4/dist/report-reader.js';
import {openObservation} from '../apps/web/dist/observation.js';
const args=process.argv.slice(2);if(args.length!==3)throw Error('Expected default, no-AI and raw report paths');
const cases=[];
for(const path of args) {
 const store=resolve(path.replace(/\.report\.json$/, '-store'));
 const raw=await readFile(resolve(path)),report=await decodeReportBytes(raw),reader=await ReportReader.openFile(resolve(path),store),web=await openObservation(resolve(path),store);
 await new EvidenceStore(store).verifyEvidence(report);
 for(const id of new Set(report.analysis.findings.flatMap(f=>f.evidenceIds)))assert.deepEqual(await reader.readEvidence(id),await web.reader.readEvidence(id));
 assert.deepEqual(reader.report,report);assert.deepEqual(web.raw,raw);
 assert.equal(reader.reportContentRef,sha256(raw));assert.equal(report.analysis.aiState.status,'disabled');assert.equal(report.outcomes.artifactIntegrity,'matched');
 cases.push({path,report,sha256:sha256(raw),bytes:raw.length});
}
const [normal,noAI,raw]=cases;
assert.equal(normal.report.reportId,noAI.report.reportId);assert.deepEqual(normal.report.outcomes,noAI.report.outcomes);assert.deepEqual(normal.report.analysis.findings,noAI.report.analysis.findings);
assert.equal(raw.report.bundle.artifact.observedSha256,normal.report.bundle.artifact.observedSha256);assert.equal(raw.report.analysis.findings.length,0);assert.equal(raw.report.outcomes.analysisCompleteness,'incomplete');assert.equal(exitCode(raw.report),2);assert.notEqual(raw.report.reportId,normal.report.reportId);
console.log(JSON.stringify({defaultNoAIIdentityOutcomesFindingsEqual:true,rawRemainsIncomplete:true,cases:cases.map(({report,...rest})=>({...rest,reportId:report.reportId,artifactSha256:report.bundle.artifact.observedSha256,outcomes:report.outcomes,findings:report.analysis.findings.length,exit:exitCode(report)}))},null,2));
