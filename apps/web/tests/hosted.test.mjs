import test from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { readFile, mkdtemp, mkdir, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { startViewer, publicHostedOrigin } from '../dist/service.js';
import { hostedSettings, openPublicSamples, publicSamples } from '../dist/hosted.js';
import { App, Home, ExportActions } from '../dist/render-check.js';
const origin = 'https://heurisko-check.onrender.com';
const root = new URL('../../../', import.meta.url);
function http(viewer, path, { method = 'GET', headers = {}, body, unfinished = false } = {}) {
    return new Promise((accept, reject) => {
        const req = request(viewer.listenOrigin + path, { method, headers: { Host: new URL(origin).host, ...headers } }, res => {
            const parts = []; res.on('data', part => parts.push(part)); res.on('end', () => {
                req.destroy(); const bytes = Buffer.concat(parts); let data; try { data = JSON.parse(bytes); } catch {}
                accept({ status: res.statusCode, bytes, data });
            });
        });
        req.setTimeout(3000, () => req.destroy(Error('TEST_RESPONSE_TIMEOUT')));
        req.on('error', reject);
        if (unfinished) req.flushHeaders(); else req.end(body);
    });
}
test('hosted mode requires an explicit Render HTTPS origin and port; ambient render variables cannot change local mode', () => {
    assert.equal(hostedSettings({ RENDER_EXTERNAL_URL: origin, PORT: '10000' }), undefined);
    assert.deepEqual(hostedSettings({ HEURISKO_WEB_MODE: 'public-readonly', RENDER_EXTERNAL_URL: origin, PORT: '10000' }), { origin, port: 10000 });
    for (const value of ['', 'http://heurisko-check.onrender.com', 'https://evil.invalid', origin + '/api', origin + '?x=1', 'https://user@heurisko-check.onrender.com', origin + ':444']) assert.throws(() => publicHostedOrigin(value), /HOSTED_ORIGIN_INVALID/);
    for (const port of ['', '0', '-1', '65536', '1x']) assert.throws(() => hostedSettings({ HEURISKO_WEB_MODE: 'public-readonly', RENDER_EXTERNAL_URL: origin, PORT: port }), /HOSTED_PORT_INVALID/);
    assert.throws(() => hostedSettings({ HEURISKO_WEB_MODE: 'public' }), /WEB_MODE_INVALID/);
});
test('public startup admits three hash-pinned committed captures and rejects changed sample bytes', async t => {
    const samples = await openPublicSamples(); assert.equal(samples.length, 3);
    assert.equal(samples[0].reader.report.analysis.findings.length, 16);
    assert.equal(samples[0].reader.report.bundle.artifact.origin, 'local');
    assert.equal(samples[1].reader.report.bundle.artifact.packageName, 'ts-pattern');
    assert.equal(samples[2].reader.report.bundle.artifact.packageName, 'zod');
    const temp = await realpath(await mkdtemp(join(tmpdir(), 'heurisko-hosted-hash-'))); t.after(() => rm(temp, { recursive: true, force: true }));
    const path = join(temp, publicSamples[0].report); await mkdir(join(path, '..'), { recursive: true }); await writeFile(path, '{}');
    await assert.rejects(openPublicSamples(temp), /PUBLIC_SAMPLE_HASH_MISMATCH/);
});
test('public hosted reads expose only admitted sample facts, original downloads and explicit read-only bootstrap', async t => {
    const samples = await openPublicSamples(), viewer = await startViewer(samples, 0, { publicReadOnlyOrigin: origin }); t.after(() => viewer.close());
    assert.equal(viewer.capability, ''); assert.equal(viewer.url, origin);
    const health = await http(viewer, '/healthz'); assert.deepEqual(health.data, { status: 'ok', mode: 'public-readonly' });
    const html = await http(viewer, '/workspace/reports'); assert.equal(html.status, 200); assert.match(html.bytes.toString(), /name="heurisko-mode" content="public-readonly"/); assert.doesNotMatch(html.bytes.toString(), /#session=/);
    const catalog = await http(viewer, '/api/observations'); assert.equal(catalog.status, 200); assert.equal(catalog.data.length, 3);
    assert.deepEqual((await http(viewer, '/api/investigations')).data, []);
    for (let index = 0; index < samples.length; index++) {
        const handle = catalog.data[index].handle;
        assert.deepEqual((await http(viewer, `/api/observations/${handle}/report`)).bytes, await readFile(new URL(publicSamples[index].report, root)));
        assert.deepEqual((await http(viewer, `/api/observations/${handle}/bundle`)).data, samples[index].reader.report.bundle);
    }
    const record = samples[0].reader.report.bundle.evidence.find(e => e.kind === 'artifact_member' && e.contentState === 'retained');
    const bytes = await http(viewer, `/api/observations/${catalog.data[0].handle}/evidence/${record.evidenceId}`);
    assert.equal(bytes.status, 200); assert.equal(bytes.data.kind, 'content');
});
test('hosted Host, Origin and fetch-site checks reject proxy/header spoofing without trusting forwarded authority', async t => {
    const viewer = await startViewer([], 0, { publicReadOnlyOrigin: origin }); t.after(() => viewer.close());
    for (const headers of [{ Host: 'evil.invalid', 'X-Forwarded-Host': new URL(origin).host }, { Host: '127.0.0.1', 'X-Forwarded-Proto': 'https', 'X-Forwarded-Host': new URL(origin).host }, { Origin: 'https://evil.invalid' }, { Origin: origin + ':444' }, { 'Sec-Fetch-Site': 'cross-site' }]) assert.equal((await http(viewer, '/api/observations', { headers })).status, 403);
    assert.equal((await http(viewer, '/api/observations', { headers: { Origin: origin, 'X-Forwarded-Host': 'evil.invalid', 'X-Forwarded-Proto': 'http' } })).status, 200);
    assert.equal((await http(viewer, '/healthz?path=/etc/passwd')).status, 400);
});
test('every hosted mutation fails before receiving or parsing its body and never calls the engine', async t => {
    let calls = 0; const viewer = await startViewer([], 0, { publicReadOnlyOrigin: origin, engine: async () => { calls++; throw Error('UNEXPECTED_ENGINE'); } }); t.after(() => viewer.close());
    for (const path of ['/api/uploads/artifact', '/api/uploads/source', '/api/uploads/report', '/api/uploads/portable', '/api/investigations', '/api/reopen', '/api/investigations/' + 'a'.repeat(32) + '/cancel', '/api/observations/' + 'b'.repeat(32) + '/export']) {
        const response = await http(viewer, path, { method: 'POST', headers: { Origin: origin, 'Content-Length': '900000000', 'Content-Type': 'not-a-media-type' }, unfinished: true });
        assert.equal(response.status, 405, path); assert.equal(response.data.error, 'HOSTED_READ_ONLY');
    }
    assert.equal(calls, 0); assert.deepEqual((await http(viewer, '/api/observations')).data, []);
});
test('public UI presents captured reports and local setup without mounted upload/start/reconnect forms or portable writes', async () => {
    const app = renderToStaticMarkup(React.createElement(App, { publicReadOnly: true }));
    assert.match(app, /Public captured-report explorer/); assert.doesNotMatch(app, /type="file"|Private launch URL|Review exact input|Confirm and start investigation/);
    const home = renderToStaticMarkup(React.createElement(Home, { publicReadOnly: true }));
    assert.match(home, /Explore captured reports/); assert.doesNotMatch(home, /href="\/workspace\/(?:new|open)"/);
    const sample = (await openPublicSamples())[0], loaded = { report: sample.reader.report, reportContentRef: sample.reader.reportContentRef, transport: null };
    const save = renderToStaticMarkup(React.createElement(ExportActions, { handle: sample.handle, loaded, publicReadOnly: true }));
    assert.doesNotMatch(save, /option value="export"|href="\/workspace\/open"/); assert.match(save, /option value="report"/); assert.match(save, /Portable export and reopening require the local workspace/);
});
