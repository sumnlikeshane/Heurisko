import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sha256, decodeReportBytes, EvidenceStore } from '../../../packages/core/dist/index.js';
import { ReportReader } from '../../../integration/part4/dist/report-reader.js';
import { openObservation } from '../../../apps/web/dist/observation.js';

const root = resolve(import.meta.dirname, '../../..');
const relativeReport = process.argv[2] ?? 'after/default.report.json';
const relativeStore = process.argv[3] ?? 'after/store';
const expectedSource = process.argv[4] ?? 'user_supplied';
const reportPath = resolve(import.meta.dirname, relativeReport);
const storeRoot = resolve(import.meta.dirname, relativeStore);
const raw = await readFile(reportPath);
const report = await decodeReportBytes(raw);
const store = new EvidenceStore(storeRoot);
await store.verifyEvidence(report);

const reader = await ReportReader.openFile(reportPath, storeRoot);
const web = await openObservation(reportPath, storeRoot);
const cli = spawnSync(process.execPath, [resolve(root, 'packages/cli/dist/index.js'), 'inspect', reportPath, '--store', storeRoot, '--json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
assert.equal(cli.status, 0, cli.stderr);
assert.deepEqual(JSON.parse(cli.stdout), report);
assert.deepEqual(reader.report, report);
assert.deepEqual(web.reader.report, report);
assert.deepEqual(web.raw, raw);
assert.equal(reader.reportContentRef, sha256(raw));
assert.equal(web.reader.reportContentRef, sha256(raw));

const cited = new Set(report.analysis.findings.flatMap(finding => finding.evidenceIds));
const evidence = report.bundle.evidence.find(item => cited.has(item.evidenceId) && item.kind === 'source_member' && item.contentState === 'retained' && item.contentRef);
assert.ok(evidence, 'A retained source member must be cited by a finding');
const [terminal, browser] = await Promise.all([reader.readEvidence(evidence.evidenceId), web.reader.readEvidence(evidence.evidenceId)]);
assert.equal(terminal.kind, 'content');
assert.deepEqual(browser, terminal);
const inspected = spawnSync(process.execPath, [resolve(root, 'packages/cli/dist/index.js'), 'inspect', reportPath, '--store', storeRoot, '--evidence', evidence.evidenceId, '--json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
assert.equal(inspected.status, 0, inspected.stderr);
const cliEvidence = JSON.parse(inspected.stdout);
assert.equal(cliEvidence.evidence.evidenceId, evidence.evidenceId);
assert.equal(cliEvidence.content.totalBytes, terminal.totalBytes);
assert.equal(cliEvidence.content.bytesBase64, terminal.bytesBase64);
assert.equal(sha256(Buffer.from(terminal.bytesBase64, 'base64')), evidence.contentSha256);

assert.equal(report.outcomes.sourceAssociation, expectedSource);
assert.equal(report.outcomes.provenancePolicy, 'not_checked');
assert.equal(report.outcomes.correspondence, 'unresolved');
assert.equal(report.bundle.coverage.complete, true);
const result = {
  reportPath: relativeReport,
  storePath: relativeStore,
  reportSha256: sha256(raw),
  reportBytes: raw.length,
  reportId: report.reportId,
  outcomes: report.outcomes,
  coverage: { complete: report.bundle.coverage.complete, omissions: report.bundle.coverage.omissions.length },
  findings: report.analysis.findings.length,
  citedEvidenceId: evidence.evidenceId,
  citedContentRef: evidence.contentRef,
  citedBytes: terminal.totalBytes,
  cliTuiWebReportAndEvidenceAgree: true,
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');
