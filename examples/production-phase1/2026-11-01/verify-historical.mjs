import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { decodeReportBytes, sha256 } from '../../../packages/core/dist/index.js';
import { ReportReader } from '../../../integration/part4/dist/report-reader.js';
import { openObservation } from '../../../apps/web/dist/observation.js';

const root = resolve(import.meta.dirname, '../../..');
const cases = [
  ['examples/handoff/current/B1.report.json', 'examples/handoff/current/store'],
  ['examples/handoff/current/B2.report.json', 'examples/handoff/current/store'],
  ['examples/handoff/current/B3.report.json', 'examples/handoff/current/store'],
  ['examples/handoff/current/B3R.report.json', 'examples/handoff/current/store'],
  ['examples/p04/local-mutation/report.json', 'examples/p04/local-mutation/store'],
  ['examples/part4/current/local-m1.report.json', 'examples/part4/current/store'],
];

const results = [];
for (const [reportFile, storeRoot] of cases) {
  const reportPath = resolve(root, reportFile);
  const storePath = resolve(root, storeRoot);
  const raw = await readFile(reportPath);
  const report = await decodeReportBytes(raw);
  const tui = await ReportReader.openFile(reportPath, storePath);
  const web = await openObservation(reportPath, storePath);
  const cli = spawnSync(process.execPath, [resolve(root, 'packages/cli/dist/index.js'), 'inspect', reportPath, '--store', storePath, '--json'], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  assert.ok([0, 2].includes(cli.status), `${reportFile}: CLI exit ${cli.status}: ${cli.stderr}`);
  assert.deepEqual(JSON.parse(cli.stdout), report);
  assert.deepEqual(tui.report, report);
  assert.deepEqual(web.reader.report, report);
  assert.deepEqual(web.raw, raw);
  assert.equal(tui.reportContentRef, sha256(raw));
  assert.equal(web.reader.reportContentRef, sha256(raw));
  results.push({ reportFile, storeRoot, sha256: sha256(raw), bytes: raw.length, reportId: report.reportId, cliExit: cli.status, outcomes: report.outcomes, coverage: { complete: report.bundle.coverage.complete, omissions: report.bundle.coverage.omissions.length }, findings: report.analysis.findings.length });
}
const missingReport = resolve(root, 'examples/part4/current/local-m1.report.json');
const absentStore = resolve(root, '.heurisko/phase1-intentionally-absent-store');
const missingTui = await ReportReader.openFile(missingReport, absentStore);
const missingWeb = await openObservation(missingReport, absentStore);
const evidenceId = missingTui.report.analysis.findings.flatMap(finding => finding.evidenceIds)[0];
const missingEvidence = await missingTui.readEvidence(evidenceId);
assert.equal(missingEvidence.kind, 'metadata_only');
assert.equal(missingEvidence.reason, 'MISSING_BLOB');
assert.deepEqual(await missingWeb.reader.readEvidence(evidenceId), missingEvidence);
process.stdout.write(JSON.stringify({ checked: results.length, byteAndReportParity: true, missingEvidence: { evidenceId, reason: missingEvidence.reason, tuiWebAgree: true }, cases: results }, null, 2) + '\n');
