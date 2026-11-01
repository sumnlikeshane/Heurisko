import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { destination, createNavigator, reportPath, connectionAfter, operationCode } from '../dist/navigation.js';
import { renderContext, App, Investigation, OpenEvidence, JobDetail } from '../dist/render-check.js';
import { startViewer } from '../dist/service.js';
import { docPages } from '../dist/doc-model.js';
const id = 'a'.repeat(32), other = 'b'.repeat(32);
function http(v, path, options = {}) { return new Promise((resolve, reject) => {
 const req = request(v.origin, { path, method: options.method ?? 'GET', headers: options.headers ?? {} }, res => { const parts = []; res.on('data', b => parts.push(b)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(parts).toString() })); }); req.on('error', reject); req.end();
}); }
test('destination allowlist separates draft/job/observation identity and rejects host-path disguises', () => {
 assert.deepEqual(destination('/workspace/new'), { kind: 'new' });
 assert.deepEqual(destination('/workspace/jobs/' + id), { kind: 'job', id });
 assert.deepEqual(destination(reportPath(other, 'Files')), { kind: 'report', handle: other, section: 'Files' });
 for (const path of ['/workspace', '/workspace/jobs/latest', '/workspace/observations/' + id, '/docs/../../etc/passwd', '/docs/%63li', '//evil.invalid', '/api/observations', '/workspace/new?session=secret', '/workspace/jobs/' + id.toUpperCase()]) assert.equal(destination(path).kind, 'missing', path);
});
test('native history traverses destinations, restores same-process view and never stores authority or submits', t => {
 class Element { isConnected = true; focus(options) { this.focused = options; } }
 const original = globalThis.HTMLElement; globalThis.HTMLElement = Element; t.after(() => { globalThis.HTMLElement = original; });
 const listeners = new Map(), entries = ['/workspace/new']; let at = 0, changes = [], states = [], restored = [];
 const input = new Element(), location = { pathname: entries[0], hash: '' };
 function locate(path) { [location.pathname, location.hash = ''] = path.split(/(?=#)/); }
 const win = { location, scrollX: 0, scrollY: 240, document: { activeElement: input, querySelector: () => null, getElementById: () => null }, history: { pushState(state, _, path) { states.push(state); entries.splice(++at); entries.push(path); locate(path); } }, addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key), requestAnimationFrame: fn => fn(), scrollTo: (x,y) => restored.push([x,y]) };
 const nav = createNavigator(win, path => changes.push(path));
 nav.go('/docs/cli'); nav.go('/workspace/jobs/' + id); nav.go(reportPath(other));
 const back = () => { locate(entries[--at]); listeners.get('popstate')(); };
 back(); back(); back();
 assert.equal(changes.at(-1), '/workspace/new'); assert.deepEqual(restored.at(-1), [0,240]); assert.ok(input.focused.preventScroll);
 locate(entries[++at]); listeners.get('popstate')(); assert.equal(changes.at(-1), '/docs/cli');
 const before = entries.length; nav.go('/api/investigations'); nav.go('/workspace/new#session=private'); nav.go('/workspace/new?path=/etc/passwd'); assert.equal(entries.length, before);
 locate('/workspace/open'); listeners.get('heurisko-session')(); nav.go('/workspace/new'); assert.equal(changes.at(-1), '/workspace/new');
 assert.ok(states.every(s => s === null)); assert.ok(entries.every(p => !p.includes('session')));
 nav.dispose(); assert.equal(listeners.size, 0);
});
test('allowlisted HTML routes stay public and inert; route URLs cannot access API facts or start analysis', async t => {
 const root = await realpath(await mkdtemp(join(tmpdir(), 'heurisko-w1-'))); let calls = 0;
 const v = await startViewer([], 0, { workspaceRoot: root, engine: async () => { calls++; throw Error('UNEXPECTED_ENGINE'); } });
 t.after(async () => { await v.close(); await rm(root, { recursive: true, force: true }); });
 const home = await http(v, '/');
 for (const path of [...docPages.map(([id])=>'/docs/'+id), '/docs', '/docs/cli', '/docs/setup', '/docs/browser', '/workspace/new', '/workspace/open', '/workspace/jobs', '/workspace/reports', '/workspace/jobs/' + id, reportPath(id, 'Coverage')]) {
   const r = await http(v, path); assert.equal(r.status, 200, path); assert.equal(r.text, home.text); assert.match(r.headers['content-type'], /text\/html/); assert.match(r.headers['content-security-policy'], /default-src 'none'/); assert.ok(!r.text.includes(v.capability));
   assert.equal((await http(v, path, { method: 'POST', headers: { Origin: v.origin, 'X-Heurisko-Session': v.capability } })).status, 405);
 }
 for (const path of ['/etc/passwd', '/workspace/jobs/latest', '/workspace/observations/' + id + '/report.json', '/docs/not-a-doc']) assert.equal((await http(v, path)).status, 404, path);
 for (const path of ['/docs/%63li', '/workspace/../open']) assert.equal((await http(v, path)).status, 400, path);
 assert.equal((await http(v, '/workspace/new?target=npm:picocolors@1.1.1')).status, 400);
 assert.equal((await http(v, '/workspace/new', { headers: { Origin: 'https://evil.invalid' } })).status, 403);
 assert.equal((await http(v, '/api/observations')).status, 403);
 assert.equal((await http(v, '/api/investigations/' + id)).status, 403);
 assert.equal((await http(v, '/api/observations', { headers: { 'X-Heurisko-Session': 'expired' } })).status, 403);
 assert.equal(calls, 0);
});
test('reports sharing report ID keep full distinct content/capture context', async () => {
 const report = JSON.parse(await readFile(process.env.HEURISKO_WEB_TEST_CORPUS ? join(process.env.HEURISKO_WEB_TEST_CORPUS, 'examples/handoff/current/B1.report.json') : new URL('../../../examples/handoff/current/B1.report.json', import.meta.url)));
 const first = { report, reportContentRef: 'sha256:' + '1'.repeat(64) };
 const second = { report: structuredClone(report), reportContentRef: 'sha256:' + '2'.repeat(64) };
 second.report.bundle.artifact.captureTime = '2026-11-01T00:00:00.000Z';
 const a = renderContext(first), b = renderContext(second);
 assert.ok(a.includes(first.reportContentRef)); assert.ok(!b.includes(first.reportContentRef)); assert.ok(b.includes(second.reportContentRef)); assert.ok(b.includes('2026-11-01T00:00:00.000Z')); assert.ok(a.includes(report.reportId) && b.includes(report.reportId));
});
test('draft, reopen and selected job render their own contexts without historical report/export actions', () => {
 const draft = renderToStaticMarkup(React.createElement(Investigation, { onStart() {} }));
 const open = renderToStaticMarkup(React.createElement(OpenEvidence, { onOpen() {} }));
 const job = renderToStaticMarkup(React.createElement(JobDetail, { job: { id, phase: 'cancel_requested', events: [], omittedEvents: 0, startedAt: '2026-11-01T00:00:00Z', cancellationRequested: true, cleanup: 'not_observable' }, onCancel() {}, error: 'LOCAL_SERVICE_UNAVAILABLE' }));
 assert.match(draft, /<h1>What do you want to investigate\?<\/h1>/); assert.match(draft, /id="investigate-target"[^>]*value=""/); assert.ok(!draft.includes('Reopen saved evidence')); assert.match(open, /Continue from retained evidence/); assert.ok(!open.includes('name="target"'));
 for (const text of [draft, open, job]) { assert.ok(!text.includes('SELECTED REPORT')); assert.ok(!text.includes('Save report JSON')); assert.ok(!text.includes('SAVED / HISTORICAL')); }
 assert.match(job, /cancel_requested/); assert.match(job, /not_observable/); assert.match(job, /Status uncertain/); assert.ok(!job.includes('Open report and evidence'));
 const shell = renderToStaticMarkup(React.createElement(App)); assert.match(shell, /href="\/docs\/start\/quickstart"/); assert.match(shell, /href="\/workspace\/new"/); assert.ok(!shell.includes('SELECTED REPORT'));
});
test('connection and operation errors separate authority, service failure and scoped input rejection', () => {
 assert.equal(connectionAfter(), 'connected'); assert.equal(connectionAfter(Error('SESSION_DENIED')), 'unauthorized'); assert.equal(connectionAfter(Error('LOCAL_SERVICE_UNAVAILABLE')), 'disconnected');
 assert.equal(operationCode(Error('INVOCATION_INVALID')), 'INVOCATION_INVALID');
 assert.equal(operationCode(Error('/private/secret #session=token')), 'LOCAL_OPERATION_FAILED');
});
test('session capability is consumed into memory, recovery preserves destination, errors never echo raw text', async t => {
 const globals = ['location','history','window','fetch','CustomEvent','Event']; const before = Object.fromEntries(globals.map(k => [k, globalThis[k]]));
 t.after(() => { for (const k of globals) { if (before[k] === undefined) delete globalThis[k]; else globalThis[k] = before[k]; } });
 const listeners = new Map(), events = [], replacements = [], sent = [];
 globalThis.location = { origin: 'http://127.0.0.1:1234', pathname: reportPath(id), hash: '#session=' + 'c'.repeat(64) };
 globalThis.history = { replaceState(state, _, path) { replacements.push({state,path}); globalThis.location.hash = ''; } };
 globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
 globalThis.window = { addEventListener: (key, fn) => listeners.set(key, fn), dispatchEvent: e => events.push(e) };
 globalThis.fetch = async (path, options) => { sent.push({path,options}); return { ok: true, json: async () => [] }; };
 const api = await import('../dist/api.js?session-test');
 assert.deepEqual(replacements, [{state:null, path:reportPath(id)}]);
 await api.api('observations'); assert.equal(sent[0].options.headers['X-Heurisko-Session'], 'c'.repeat(64)); assert.equal(sent[0].options.credentials, 'omit');
 assert.throws(() => api.restoreSession('https://evil.invalid/#session=' + 'e'.repeat(64)), /SESSION_URL_INVALID/);
 assert.throws(() => api.restoreSession('http://127.0.0.1:1234/?session=secret#session=' + 'e'.repeat(64)), /SESSION_URL_INVALID/);
 api.restoreSession('http://127.0.0.1:1234/#session=' + 'e'.repeat(64));
 assert.equal(globalThis.location.pathname, reportPath(id)); assert.equal(replacements.length, 1);
 globalThis.location.hash = '#doc-1'; listeners.get('hashchange')(); assert.equal(replacements.length, 1);
 globalThis.location.hash = '#session=' + 'd'.repeat(64); listeners.get('hashchange')(); await api.api('investigations'); assert.equal(sent[1].options.headers['X-Heurisko-Session'], 'd'.repeat(64)); assert.equal(replacements.at(-1).path, reportPath(id));
 globalThis.fetch = async () => ({ ok: false, status: 403, json: async () => ({ error: 'SESSION_DENIED' }) }); await assert.rejects(api.api('observations'), /SESSION_DENIED/); assert.equal(events.at(-1).detail, 'unauthorized');
 globalThis.fetch = async () => { throw Error('secret host path or token'); }; await assert.rejects(api.api('observations'), /^Error: LOCAL_SERVICE_UNAVAILABLE$/); assert.equal(events.at(-1).detail, 'disconnected');
 globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ error: '/secret/path #session=secret' }) }); await assert.rejects(api.post('reopen', {}), /^Error: LOCAL_OPERATION_FAILED$/);
});

test('aborted reads preserve cancellation and do not falsely announce service loss', async t => {
 const oldFetch = globalThis.fetch, oldWindow = globalThis.window; const events = [];
 t.after(() => { globalThis.fetch = oldFetch; if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow; });
 globalThis.window = { addEventListener() {}, dispatchEvent: e => events.push(e) };
 const cancelled = Error('ABORTED_TEST_READ');
 globalThis.fetch = async () => { throw cancelled; };
 const api = await import('../dist/api.js'); const controller = new AbortController(); controller.abort();
 await assert.rejects(api.api('observations/' + id, controller.signal), e => e === cancelled);
 assert.deepEqual(events, []);
});
