import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { uiPath } from '../src/navigation.js';
import { WebWorkspace, errorCode, requestJSON } from './workspace.js';
import type { investigate } from '@heurisko/core';
import { reportFacts, type Observation } from './observation.js';
const assets = new Map([['/assets/app.js', ['assets/app.js', 'text/javascript; charset=utf-8']], ['/assets/app.css', ['assets/app.css', 'text/css; charset=utf-8']], ['/assets/docs.json', ['cli-docs.json', 'application/json; charset=utf-8']], ['/', ['index.html', 'text/html; charset=utf-8']]]);
const security = {
    'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src data:; font-src 'none'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store', 'Cross-Origin-Resource-Policy': 'same-origin', 'Cross-Origin-Opener-Policy': 'same-origin', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
function tokenEqual(a: string, b: string) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
export async function startViewer(initial: Observation[], port = 0, settings: { workspaceRoot?: string; engine?: typeof investigate } = {}) {
    const observations = [...initial];
    if (observations.length > 16)
        throw Error('CATALOG_LIMIT');
    const workspace = new WebWorkspace(settings.workspaceRoot, settings.engine);
    const docs = await readFile(fileURLToPath(new URL('cli-docs.json', import.meta.url)));
    const capability = randomBytes(32).toString('hex'), catalog = new Map(observations.map(o => [o.handle, o]));
    const compiled = new Map<string, {
        bytes: Buffer;
        type: string;
    }>();
    for (const [route, [path, type]] of assets)
        compiled.set(route, { bytes: await readFile(fileURLToPath(new URL(path!, import.meta.url))), type: type! });
    let origin = '', host = '', active = 0;
    function respond(res: ServerResponse, status: number, value: unknown) { const body = Buffer.from(JSON.stringify(value)); res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...security }); res.end(body); }
    const server = createServer(async (req, res) => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const controller = new AbortController();
        res.once('close', () => controller.abort());
        try {
            if (req.headers.host !== host)
                return respond(res, 403, { error: 'HOST_DENIED' });
            if (req.headers.origin !== undefined && req.headers.origin !== origin)
                return respond(res, 403, { error: 'ORIGIN_DENIED' });
            if (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(String(req.headers['sec-fetch-site'])))
                return respond(res, 403, { error: 'ORIGIN_DENIED' });
            if (req.method !== 'GET' && req.method !== 'POST')
                return respond(res, 405, { error: 'METHOD_DENIED' });
            if (req.method === 'GET' && (req.headers['transfer-encoding'] || req.headers['content-length'] && req.headers['content-length'] !== '0'))
                return respond(res, 400, { error: 'BODY_DENIED' });
            if (!req.url || req.url.length > 2048)
                return respond(res, 400, { error: 'INVALID_REQUEST' });
            if (/%|\\|\.\./.test(req.url.split('?')[0]!))
                return respond(res, 400, { error: 'INVALID_ROUTE' });
            const url = new URL(req.url, origin);
            if (url.origin !== origin || /%|\\|\.\./.test(url.pathname))
                return respond(res, 400, { error: 'INVALID_ROUTE' });
            const asset = compiled.get(url.pathname) ?? (uiPath(url.pathname) ? compiled.get('/') : undefined);
            if (asset) {
                if (req.method !== 'GET') return respond(res, 405, { error: 'METHOD_DENIED' });
                if (url.search)
                    return respond(res, 400, { error: 'INVALID_QUERY' });
                res.writeHead(200, { 'Content-Type': asset.type, ...security });
                res.end(asset.bytes);
                return;
            }
            if (!url.pathname.startsWith('/api/'))
                return respond(res, 404, { error: 'NOT_FOUND' });
            if (!tokenEqual(String(req.headers['x-heurisko-session'] ?? ''), capability))
                return respond(res, 403, { error: 'SESSION_DENIED' });
            const admit = (observation: Observation) => { if (observations.length >= 16) throw Error('CATALOG_LIMIT'); observations.push(observation); catalog.set(observation.handle, observation); };
            if (req.method === 'POST') {
                const mutation = /^\/api\/(uploads\/(artifact|source|report|portable)|investigations|investigations\/([a-f0-9]{32})\/cancel|reopen|observations\/([a-f0-9]{32})\/export)$/.exec(url.pathname);
                if (!mutation) return respond(res, 405, { error: 'METHOD_DENIED' });
                if (req.headers.origin !== origin) return respond(res, 403, { error: 'ORIGIN_REQUIRED' });
                if (url.search) return respond(res, 400, { error: 'INVALID_QUERY' });
                // Cancellation must remain available while a portable export holds the I/O slot.
                if (mutation[3]) {
                    if (req.headers['content-type'] !== 'application/json') return respond(res, 415, { error: 'CONTENT_TYPE_DENIED' });
                    const value = requestJSON(await body(req, 16384));
                    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length) throw Error('INVALID_INPUT');
                    return respond(res, 200, workspace.cancel(mutation[3]));
                }
                return await workspace.exclusive(async () => {
                    const kind = mutation[2];
                    if (kind) {
                        if (req.headers['content-type'] !== 'application/octet-stream') return respond(res, 415, { error: 'CONTENT_TYPE_DENIED' });
                        let filename: string;
                        try { filename = decodeURIComponent(String(req.headers['x-heurisko-filename'] ?? '')); } catch { throw Error('UPLOAD_NAME_INVALID'); }
                        const bytes = await body(req, workspace.uploadLimit(kind));
                        return respond(res, 201, await workspace.upload(kind, filename, bytes));
                    }
                    if (req.headers['content-type'] !== 'application/json') return respond(res, 415, { error: 'CONTENT_TYPE_DENIED' });
                    const value = requestJSON(await body(req, 16384));
                    if (mutation[1] === 'investigations') {
                        if (observations.length >= 16) throw Error('CATALOG_LIMIT');
                        return respond(res, 202, workspace.start(value, admit));
                    }
                    if (mutation[1] === 'reopen') {
                        if (workspace.listJobs().some(j => !j.phase.startsWith('settled'))) throw Error('INVESTIGATION_BUSY');
                        if (observations.length >= 16) throw Error('CATALOG_LIMIT');
                        const observation = await workspace.reopen(value); admit(observation);
                        return respond(res, 201, { handle: observation.handle });
                    }
                    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length) throw Error('INVALID_INPUT');
                    const observation = catalog.get(mutation[4]!);
                    if (!observation) return respond(res, 404, { error: 'OBSERVATION_NOT_FOUND' });
                    const bytes = await workspace.portable(observation);
                    res.writeHead(200, { ...security, 'Content-Type': 'application/json', 'Content-Disposition': 'attachment; filename="investigation.heurisko.json"' }); res.end(bytes);
                });
            }
            if (url.pathname === '/api/docs') {
                if (url.search) return respond(res, 400, { error: 'INVALID_QUERY' });
                res.writeHead(200, { ...security, 'Content-Type': 'application/json; charset=utf-8' }); res.end(docs); return;
            }
            const jobRoute = /^\/api\/investigations(?:\/([a-f0-9]{32}))?$/.exec(url.pathname);
            if (jobRoute) {
                if (url.search) return respond(res, 400, { error: 'INVALID_QUERY' });
                return respond(res, 200, jobRoute[1] ? workspace.job(jobRoute[1]) : workspace.listJobs());
            }
            const download = /^\/api\/observations\/([a-f0-9]{32})\/(report|bundle)$/.exec(url.pathname);
            if (download) {
                if (url.search) return respond(res, 400, { error: 'INVALID_QUERY' });
                const observation = catalog.get(download[1]!);
                if (!observation) return respond(res, 404, { error: 'OBSERVATION_NOT_FOUND' });
                res.writeHead(200, { ...security, 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="${download[2]}.json"` });
                res.end(download[2] === 'report' ? observation.raw : JSON.stringify(observation.reader.report.bundle)); return;
            }
            if (url.pathname === '/api/observations') {
                if (url.search)
                    return respond(res, 400, { error: 'INVALID_QUERY' });
                return respond(res, 200, observations.map(o => ({ handle: o.handle, reportId: o.reader.report.reportId, reportContentRef: o.reader.reportContentRef, artifact: o.reader.report.bundle.artifact, fixtureKind: o.reader.report.fixtureKind })));
            }
            const match = /^\/api\/observations\/([a-f0-9]{32})(\/evidence\/([a-zA-Z0-9_]+))?$/.exec(url.pathname);
            if (!match)
                return respond(res, 404, { error: 'NOT_FOUND' });
            const observation = catalog.get(match[1]!);
            if (!observation)
                return respond(res, 404, { error: 'OBSERVATION_NOT_FOUND' });
            if (!match[2]) {
                if (url.search)
                    return respond(res, 400, { error: 'INVALID_QUERY' });
                return respond(res, 200, { report: observation.reader.report, reportContentRef: observation.reader.reportContentRef, facts: reportFacts(observation.reader), transport: observation.transport ?? null });
            }
            const params = url.searchParams, allowed = ['mode', 'side', 'offset', 'length'];
            if ([...params.keys()].some(k => !allowed.includes(k) || params.getAll(k).length !== 1))
                return respond(res, 400, { error: 'INVALID_QUERY' });
            const mode = params.get('mode') ?? 'record', side = params.get('side');
            if (!['record', 'citation'].includes(mode) || side !== null && !['source', 'artifact'].includes(side) || mode === 'record' && side !== null)
                return respond(res, 400, { error: 'INVALID_QUERY' });
            const number = (key: string, fallback: number) => { const v = params.get(key); return v === null ? fallback : /^(0|[1-9][0-9]{0,9})$/.test(v) ? Number(v) : NaN; };
            const offset = number('offset', 0), length = number('length', 4096);
            if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(length) || length < 1 || length > 65536)
                return respond(res, 400, { error: 'INVALID_RANGE' });
            if (!observation.reader.evidence(match[3]!))
                return respond(res, 404, { error: 'UNKNOWN_EVIDENCE' });
            if (active >= 2)
                return respond(res, 429, { error: 'READ_BUSY' });
            active++;
            timer = setTimeout(() => controller.abort(), 10000);
            try {
                const window = { offset, length, signal: controller.signal };
                const value = mode === 'citation' ? await observation.reader.readCitation(match[3]!, side as 'source' | 'artifact' | undefined, window) : await observation.reader.readEvidence(match[3]!, window);
                if (!res.destroyed)
                    respond(res, 200, value);
            }
            finally {
                active--;
            }
        }
        catch (error) {
            if (!res.headersSent && !res.destroyed)
                respond(res, /BUSY|LIMIT/.test(errorCode(error)) ? 429 : /NOT_FOUND/.test(errorCode(error)) ? 404 : 400, { error: errorCode(error) });
        }
        finally {
            if (timer)
                clearTimeout(timer);
        }
    });
    server.requestTimeout = 10000;
    server.headersTimeout = 10000;
    server.keepAliveTimeout = 2000;
    server.maxRequestsPerSocket = 100;
    server.maxConnections = 32;
    await new Promise<void>((accept, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', () => accept()); });
    const address = server.address();
    if (!address || typeof address === 'string')
        throw Error('LISTEN_FAILED');
    host = `127.0.0.1:${address.port}`;
    origin = `http://${host}`;
    return { origin, capability, url: `${origin}/#session=${capability}`, async close() { await workspace.close(); server.closeAllConnections(); await new Promise<void>((accept, reject) => server.close(e => e ? reject(e) : accept())); } };
}

async function body(req: IncomingMessage, limit: number): Promise<Buffer> {
    const declared = req.headers['content-length'];
    if (declared && (!/^[0-9]+$/.test(declared) || Number(declared) > limit)) throw Error('BODY_LIMIT');
    const chunks: Buffer[] = []; let total = 0;
    const timer = setTimeout(() => req.destroy(), 10000);
    try { for await (const chunk of req) { total += chunk.length; if (total > limit) throw Error('BODY_LIMIT'); chunks.push(Buffer.from(chunk)); } return Buffer.concat(chunks, total); }
    finally { clearTimeout(timer); }
}
