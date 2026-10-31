import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { request } from 'node:http';
import { startViewer } from '../dist/service.js';
import { openObservation } from '../dist/observation.js';
import { WebWorkspace, webLimits } from '../dist/workspace.js';
import { exportPortable, importPortable } from '../dist/portable.js';
import { decodeBundle } from '@heurisko/core';
const repo = fileURLToPath(new URL('../../../', import.meta.url));
const corpus = process.env.HEURISKO_WEB_TEST_CORPUS ?? repo;
const reportPath = join(corpus, 'examples/handoff/current/B1.report.json'), store = join(corpus, 'examples/handoff/current/store');
async function temp(t) { const root = await fs.realpath(await fs.mkdtemp(join(tmpdir(), 'heurisko-web-workflow-'))); t.after(() => fs.rm(root, { recursive: true, force: true })); return root; }
async function service(t, engine) { const root = await temp(t), v = await startViewer([], 0, { workspaceRoot: root, engine }); t.after(() => v.close()); return v; }
function http(v, route, { method = 'GET', headers = {}, body } = {}) { return new Promise((accept, reject) => { const req = request(v.origin + route, { method, headers: { 'X-Heurisko-Session': v.capability, Origin: v.origin, ...(body !== undefined ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {}), ...headers } }, res => { const parts = []; res.on('data', b => parts.push(b)); res.on('end', () => { const bytes = Buffer.concat(parts); let data; try { data = JSON.parse(bytes); } catch {} accept({ status: res.statusCode, bytes, data }); }); }); req.on('error', reject); req.end(body); }); }
const post = (v, path, value, headers) => http(v, path, { method: 'POST', body: JSON.stringify(value), headers });
async function settled(v, id) { for (let i = 0; i < 100; i++) { const r = await http(v, '/api/investigations/' + id); if (r.data.phase.startsWith('settled')) return r.data; await new Promise(r => setTimeout(r, 10)); } throw Error('TEST_TIMEOUT'); }
const npm = { kind: 'npm', target: 'npm:picocolors@1.1.1', enableAI: false, policy: 'requested-policy' };
test('complete built CLI docs and setup include every actual parser flag and workflow', async t => {
 const v = await service(t), result = await http(v, '/api/docs'); assert.equal(result.status, 200);
 const cli = result.data.find(d => d.id === 'cli'); assert.equal(cli.markdown, await fs.readFile(join(repo, 'docs/CLI Reference.md'), 'utf8'));
 const parser = await fs.readFile(join(repo, 'packages/cli/src/index.ts'), 'utf8');
 for (const match of parser.matchAll(/const (?:valueFlags|booleanFlags)=new Set\(\[([^\]]+)\]/g)) for (const flag of match[1].matchAll(/'([^']+)'/g)) assert.ok(cli.markdown.includes('--' + flag[1]), flag[1]);
 const setup = result.data.find(d => d.id === 'setup').markdown; for (const text of ['22.23.4', 'pnpm', 'requirements-contracts.txt', 'docker']) assert.ok(setup.toLowerCase().includes(text.toLowerCase()), text);
});
test('privileged requests require exact origin, session, media type, bounds and strict input keys', async t => {
 let called = 0; const v = await service(t, async () => { called++; throw Error('TEST_UNEXPECTED_ENGINE'); });
 for (const [options, status] of [[{ Origin: '' }, 403], [{ Origin: 'https://evil.invalid' }, 403], [{ 'X-Heurisko-Session': '' }, 403], [{ 'Content-Type': 'text/plain' }, 415], [{ 'sec-fetch-site': 'cross-site' }, 403]]) assert.equal((await post(v, '/api/investigations', npm, options)).status, status);
 for (const value of [{ ...npm, target: 'npm:picocolors@latest' }, { ...npm, target: 'npm:picocolors@^1.1.1' }, { ...npm, artifactPath: '/etc/passwd' }, { ...npm, source: 'https://github.com/a/b', commit: 'main' }, { ...npm, source: 'http://127.0.0.1/x', commit: 'a'.repeat(40) }, { ...npm, sourceArchive: 'a'.repeat(32) }, { ...npm, subdirectory: '../x' }, { ...npm, store: '/etc' }, { ...npm, enableAI: 'true' }]) assert.equal((await post(v, '/api/investigations', value)).status, 400);
 assert.equal((await http(v, '/api/investigations', { method: 'POST', body: '{"kind":"npm","kind":"local"}' })).status, 400);
 assert.equal((await post(v, '/api/investigations', { ...npm, policy: 'x'.repeat(17000) })).status, 429);
 assert.equal((await post(v, '/api/investigations?path=/etc/passwd', npm)).status, 400);
 assert.equal(called, 0); assert.deepEqual((await http(v, '/api/investigations')).data, []);
});
test('options reach one shared-engine call; terminal report, downloads and bundle keep exact facts', async t => {
 const observation = await openObservation(reportPath, store); let received;
 const v = await service(t, async (input, options, context) => { received = { input, options }; context.onProgress({ stage: 'acquire', status: 'running' }); context.onProgress({ stage: 'acquire', status: 'complete' }); return observation.reader.report; });
 const result = await post(v, '/api/investigations', { ...npm, target: 'npm:@vue/shared@3.5.22', source: 'https://github.com/vuejs/core', commit: '5a8aa0b2ba575e098cbb63b396e9bcb751eb3a0f', subdirectory: 'packages/shared' }); assert.equal(result.status, 202);
 const job = await settled(v, result.data.id); assert.equal(job.phase, 'settled_report'); assert.equal(job.exitCode, 2); assert.equal(job.cleanup, 'not_observable');
 assert.deepEqual(job.events.map(e => [e.stage, e.status]), [['acquire', 'running'], ['acquire', 'complete']]); assert.equal(received.input.packageName, '@vue/shared'); assert.equal(received.input.sourceOverride.subdirectory, 'packages/shared'); assert.deepEqual(received.options, { enableAI: false, analysisProfile: 'raw-static-s3-v1', trustPolicyRef: 'requested-policy' });
 const loaded = await http(v, '/api/observations/' + job.observation); assert.deepEqual(loaded.data.report, observation.reader.report);
 const raw = await http(v, '/api/observations/' + job.observation + '/report'); assert.deepEqual(JSON.parse(raw.bytes), observation.reader.report);
 const bundle = await http(v, '/api/observations/' + job.observation + '/bundle'); assert.deepEqual(await decodeBundle(bundle.bytes.toString()), observation.reader.report.bundle);
});
test('cancel and no-report failures never claim acknowledgment, cleanup, or a verdict', async t => {
 let entered, release; const began = new Promise(r => entered = r), gate = new Promise(r => release = r);
 const v = await service(t, async (_i, _o, context) => { entered(); await gate; assert.equal(context.signal.aborted, true); throw Error('CANCELLED'); });
 const result = await post(v, '/api/investigations', npm); await began;
 assert.equal((await post(v, '/api/investigations', npm)).status, 429);
 const cancel = await post(v, `/api/investigations/${result.data.id}/cancel`, {}); assert.equal(cancel.data.phase, 'cancel_requested'); assert.equal(cancel.data.cleanup, 'not_observable');
 assert.equal((await post(v, '/api/investigations', npm)).status, 429); release();
 const job = await settled(v, result.data.id); assert.equal(job.phase, 'settled_error'); assert.equal(job.error, 'CANCELLED'); assert.equal(job.observation, undefined); assert.equal(job.exitCode, 3); assert.deepEqual((await http(v, '/api/observations')).data, []);
});
test('uploads have opaque IDs, original filenames, kind checks, local labels and bounded admission', async t => {
 const root = await temp(t), w = new WebWorkspace(root), data = Buffer.from('inert archive bytes, never executed');
 for (const name of ['../secret', '/etc/passwd', 'C:\\secret', 'bad\u001b.tgz']) await assert.rejects(w.upload('artifact', name, data));
 const a = await w.upload('artifact', 'local.tgz', data), source = await w.upload('source', 'source.tar.gz', data);
 assert.match(a.upload, /^[a-f0-9]{32}$/); const prepared = w.prepare({ kind: 'local', artifact: a.upload, sourceArchive: source.upload, source: 'https://github.com/test/repo', commit: 'a'.repeat(40), name: 'local-label', version: 'test', enableAI: false });
 assert.equal(prepared.input.artifactFilename, 'local.tgz'); assert.equal(prepared.input.packageName, 'local-label'); assert.equal(prepared.input.artifactPath, join(root, 'uploads', a.upload)); assert.equal(prepared.sourceArchivePath, join(root, 'uploads', source.upload));
 assert.throws(() => w.prepare({ kind: 'local', artifact: source.upload, enableAI: false }), /UPLOAD_NOT_FOUND/);
 const v = await service(t); assert.equal((await http(v, '/api/uploads/artifact', { method: 'POST', body: data, headers: { 'Content-Type': 'application/octet-stream', 'X-Heurisko-Filename': 'archive.tgz' } })).status, 201);
 assert.equal((await http(v, '/api/uploads/report', { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/octet-stream', 'X-Heurisko-Filename': '../x' } })).status, 400);
 assert.equal(webLimits.archiveBytes, 32 * 1024 * 1024);
});
test('browser portable download/upload reopens original bytes and enforces corruption/omission semantics', async t => {
 const root = await temp(t), observation = await openObservation(reportPath, store), bytes = await exportPortable(observation, root), imported = await importPortable(bytes, root, 128 * 1024 * 1024);
 assert.deepEqual(imported.observation.raw, observation.raw); assert.equal(imported.observation.transport.omitted, 0);
 const v = await service(t), uploaded = await http(v, '/api/uploads/portable', { method: 'POST', body: bytes, headers: { 'Content-Type': 'application/octet-stream', 'X-Heurisko-Filename': 'observation.heurisko.json' } }); assert.equal(uploaded.status, 201);
 const opened = await post(v, '/api/reopen', { upload: uploaded.data.upload }); assert.equal(opened.status, 201); const raw = await http(v, `/api/observations/${opened.data.handle}/report`); assert.deepEqual(raw.bytes, observation.raw);
 const exported = await post(v, `/api/observations/${opened.data.handle}/export`, {}); assert.equal(exported.status, 200); assert.equal(exported.data.manifest.reportContentRef, observation.reader.reportContentRef);
 const blob = observation.reader.report.bundle.evidence.find(e => e.contentRef && e.contentState === 'retained');
 const page = await http(v, `/api/observations/${opened.data.handle}/evidence/${blob.evidenceId}`); assert.equal(page.data.kind, 'content');
 const bad = JSON.parse(bytes); bad.blobs[0].bytesBase64 = Buffer.from('corrupt').toString('base64'); await assert.rejects(importPortable(Buffer.from(JSON.stringify(bad)), root, 128 * 1024 * 1024), /BLOB_HASH_MISMATCH/);
 const traversal = JSON.parse(bytes); traversal.blobs[0].contentRef = '../../etc/passwd'; await assert.rejects(importPortable(Buffer.from(JSON.stringify(traversal)), root, 128 * 1024 * 1024), /PORTABLE_INVALID/);
 await assert.rejects(importPortable(bytes, root, 1), /SESSION_UPLOAD_LIMIT/);
});
test('dynamic report-only and workspace digest reopen validate without fresh acquisition or host paths', async t => {
 const root = await temp(t), w = new WebWorkspace(root), raw = await fs.readFile(reportPath), uploaded = await w.upload('report', 'report.json', raw);
 const reportOnly = await w.reopen({ upload: uploaded.upload }); assert.deepEqual(reportOnly.raw, raw);
 const member = reportOnly.reader.report.bundle.evidence.find(e => e.kind === 'artifact_member'); assert.equal((await reportOnly.reader.readEvidence(member.evidenceId)).reason, 'MISSING_BLOB');
 const ref = await w.store.put(raw), digest = await w.reopen({ digest: ref }); assert.equal(digest.reader.reportContentRef, ref);
 await assert.rejects(w.reopen({ digest: '/etc/passwd' }), /INVALID_CONTENT_REF/); await assert.rejects(w.reopen({ path: '/etc/passwd' }), /INVALID_INPUT/);
 const invalidUTF8 = await w.upload('report', 'bad-encoding.json', Buffer.concat([raw.subarray(0, raw.indexOf('picocolors')), Buffer.from([255]), raw.subarray(raw.indexOf('picocolors'))])); await assert.rejects(w.reopen({ upload: invalidUTF8.upload }), /REPORT_ENCODING_INVALID/);
 const invalid = await w.upload('report', 'bad.json', Buffer.from('{"schemaVersion":"999"}')); await assert.rejects(w.reopen({ upload: invalid.upload }));
});
test('portable wrapper preserves the genuine scoped monorepo beyond the small metadata decoder size', async t => {
 const root = await temp(t), o = await openObservation(join(corpus, 'examples/handoff/current/B3R.report.json'), store);
 const bytes = await exportPortable(o, root), reopened = await importPortable(bytes, root, 256 * 1024 * 1024);
 assert.deepEqual(reopened.observation.raw, o.raw); assert.equal(reopened.observation.transport.omitted, 0); assert.ok(reopened.observation.transport.included > 512);
});
