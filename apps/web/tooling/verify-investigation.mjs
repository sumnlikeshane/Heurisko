// Explicit real static-engine acceptance. Requires the admitted Docker parser and public npm/GitHub access.
// Writes only a new destination; never run against examples/web/current.
import * as fs from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { startViewer } from '../dist/service.js';
import { deterministicReportDigest, engineCodeIdentity, sha256 } from '@heurisko/core';
const root = resolve(import.meta.dirname, '../../..');
if (!process.argv[2]) throw Error('FRESH_DESTINATION_REQUIRED');
const out = resolve(process.argv[2]); await fs.mkdir(out, { mode: 0o700 });
async function sourceSnapshot() {
 const code = {};
 async function walk(folder){for(const entry of await fs.readdir(join(root,folder),{withFileTypes:true})){const path=folder+'/'+entry.name;if(entry.isDirectory())await walk(path);else code[path]=sha256(await fs.readFile(join(root,path)));}}
 for(const folder of ['apps/web/src','apps/web/server','apps/web/tooling','apps/web/tests','apps/web/content','packages/core/src','packages/tui/src'])await walk(folder);
 for (const file of ['apps/web/build.mjs', 'apps/web/package.json', 'pnpm-lock.yaml', 'docs/CLI Reference.md', 'apps/web/README.md', 'apps/web/dist/workspace.js', 'apps/web/dist/doc-model.js', 'apps/web/dist/input-review.js', 'apps/web/dist/report-view.js', 'apps/web/dist/service.js', 'apps/web/dist/main.js', 'integration/part4/src/report-reader.ts', 'integration/part4/dist/report-reader.js', 'packages/cli/src/index.ts', 'packages/cli/dist/index.js', 'packages/contracts/schema/contracts.schema.json', 'apps/web/dist/assets/app.js', 'apps/web/dist/assets/app.css', 'apps/web/dist/cli-docs.json']) code[file] = sha256(await fs.readFile(join(root, file)));
 // Only this exact root section is compiled into the documentation asset.
 // Concurrent edits elsewhere in README belong to other lanes.
 const readme=await fs.readFile(join(root,'README.md'),'utf8'),begin=readme.indexOf('## Installation and execution'),end=readme.indexOf('\n## ',begin+4);
 if(begin<0)throw Error('SETUP_SECTION_MISSING');
 code['README.md#installation-and-execution']=sha256(Buffer.from(readme.slice(begin,end<0?undefined:end)));
 return code;
}
const initialCode = await sourceSnapshot();
const viewer = await startViewer([], 0, { workspaceRoot: join(out, 'workspace') });
async function call(route, value, bytes, filename) {
 const result = await fetch(viewer.origin + '/api/' + route, { method: value !== undefined || bytes ? 'POST' : 'GET', headers: { 'X-Heurisko-Session': viewer.capability, Origin: viewer.origin, ...(bytes ? { 'Content-Type': 'application/octet-stream', 'X-Heurisko-Filename': encodeURIComponent(filename) } : value !== undefined ? { 'Content-Type': 'application/json' } : {}) }, body: bytes ?? (value !== undefined ? JSON.stringify(value) : undefined) });
 const raw = Buffer.from(await result.arrayBuffer()); let data; try { data = JSON.parse(raw); } catch {}
 assert.ok(result.ok, `${route}: ${result.status} ${data?.error}`); return { data, raw };
}
const cases = [];
try {
 const artifact = 'examples/s2/current/inputs/picocolors-1.1.1.tgz', source = 'examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz';
 const a = await call('uploads/artifact', undefined, await fs.readFile(join(root, artifact)), 'picocolors-1.1.1.tgz');
 const s = await call('uploads/source', undefined, await fs.readFile(join(root, source)), 'picocolors-source.tar.gz');
 const local = { kind: 'local', artifact: a.data.upload, sourceArchive: s.data.upload, source: 'https://github.com/alexeyraspopov/picocolors', commit: '6f0a4638348ed20633d623ee973f9c9a96f65104', name: 'picocolors', version: '1.1.1', enableAI: false, policy: 'web-requested-policy' };
 for (const [name, input] of [['local-replay', local], ['npm-exact', { kind: 'npm', target: 'npm:picocolors@1.1.1', enableAI: true, policy: 'web-requested-policy' }]]) {
  const started = await call('investigations', input); let job;
  for (let n = 0; n < 900; n++) { job = (await call('investigations/' + started.data.id)).data; if (job.phase.startsWith('settled')) break; await new Promise(r => setTimeout(r, 500)); }
  await fs.writeFile(join(out, name + '.job.json'), JSON.stringify(job, null, 2) + '\n', { flag: 'wx' });
  if (job.phase !== 'settled_report') { cases.push({ name, status: 'failed', job }); continue; }
  const loaded = (await call('observations/' + job.observation)).data, report = loaded.report;
  const raw = (await call('observations/' + job.observation + '/report')).raw;
  assert.equal(sha256(raw), loaded.reportContentRef);
  const reportFile = join(out, name + '.report.json'); await fs.writeFile(reportFile, raw, { flag: 'wx' });
  const bundle = (await call('observations/' + job.observation + '/bundle')).raw; assert.deepEqual(JSON.parse(bundle), report.bundle); await fs.writeFile(join(out, name + '.bundle.json'), bundle, { flag: 'wx' });
  const cli = spawnSync(process.execPath, [join(root, 'packages/cli/dist/index.js'), 'inspect', reportFile, '--store', join(out, 'workspace/store'), '--json'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  assert.equal(cli.status, 2, cli.stderr); assert.deepEqual(JSON.parse(cli.stdout), report);
  const member = report.bundle.evidence.find(e => e.kind === 'artifact_member'); assert.ok(member, 'real parser must retain artifact members');
  const page = (await call(`observations/${job.observation}/evidence/${member.evidenceId}?length=8192`)).data; assert.equal(page.kind, 'content');
  const cliEvidence = spawnSync(process.execPath, [join(root, 'packages/cli/dist/index.js'), 'inspect', reportFile, '--store', join(out, 'workspace/store'), '--evidence', member.evidenceId, '--json'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  assert.equal(cliEvidence.status, 2, cliEvidence.stderr); assert.equal(JSON.parse(cliEvidence.stdout).content.bytesBase64, page.bytesBase64);
  const portable = await call(`observations/${job.observation}/export`, {}); await fs.writeFile(join(out, name + '.heurisko.json'), portable.raw, { flag: 'wx' });
  const upload = await call('uploads/portable', undefined, portable.raw, name + '.heurisko.json'), reopened = (await call('reopen', { upload: upload.data.upload })).data;
  assert.deepEqual((await call('observations/' + reopened.handle + '/report')).raw, raw);
  const byDigest = await call('reopen', { digest: loaded.reportContentRef }); assert.deepEqual((await call('observations/' + byDigest.data.handle + '/report')).raw, raw);
  let regenerated;
  if (name === 'local-replay') {
   const cliAnalysis = spawnSync(process.execPath, [join(root, 'packages/cli/dist/index.js'), 'analyze', '--artifact', join(root, artifact), '--source', local.source, '--commit', local.commit, '--source-archive', join(root, source), '--name', local.name, '--version', local.version, '--no-ai', '--policy', local.policy, '--store', join(out, 'cli-store'), '--json'], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
   await fs.writeFile(join(out, 'local-cli.progress.txt'), cliAnalysis.stderr, { flag: 'wx' }); assert.equal(cliAnalysis.status, 2, cliAnalysis.stderr);
   const independentlyProduced = JSON.parse(cliAnalysis.stdout); await fs.writeFile(join(out, 'local-cli.report.json'), cliAnalysis.stdout, { flag: 'wx' });
   assert.equal(deterministicReportDigest(independentlyProduced), deterministicReportDigest(report)); regenerated = { exit: cliAnalysis.status, deterministicDigest: deterministicReportDigest(report), reportId: independentlyProduced.reportId, equivalent: true };
  }
  cases.push({ name, status: 'report', reportId: report.reportId, reportContentRef: loaded.reportContentRef, artifactDigest: report.bundle.artifact.observedSha256, captureTime: report.bundle.artifact.captureTime, sourceCandidates: report.bundle.sourceCandidates, outcomes: report.outcomes, changes: report.bundle.changes.length, findings: report.analysis.findings.length, ai: report.analysis.aiState.status, exitCode: job.exitCode, cleanup: job.cleanup, reportParity: true, bundleParity: true, evidenceExcerptParity: true, portableReopen: true, digestReopen: true, portableOmissions: portable.data.manifest.blobs.filter(b => b.status === 'omitted').length, ...(regenerated ? { independentLocalCLI: regenerated } : {}) });
 }
} finally { await viewer.close(); }
const code = await sourceSnapshot(); assert.deepEqual(code, initialCode, 'Source/build changed during acceptance; retain this attempt and rerun in a new destination');
await fs.writeFile(join(out, 'verification.json'), JSON.stringify({ version: 'heurisko-browser-investigation-v1', generatedAt: new Date().toISOString(), node: process.version, engine: await engineCodeIdentity(), targetExecution: false, productModels: [], realEngineExecution: true, browserGUIAcceptance: 'not_claimed_by_api_receipt', cases, code }, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ cases: cases.map(c => ({ name: c.name, status: c.status, exit: c.exitCode })), realEngine: true }));
assert.ok(cases.length === 2 && cases.every(c => c.status === 'report'));
