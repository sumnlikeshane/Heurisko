import type { ArtifactIdentity, InvestigationReport } from '@heurisko/contracts';
// Server-rendered deployment metadata grants no mutation authority. The server
// independently rejects every mutation in public sample mode.
export const publicReadOnlyMode = typeof document !== 'undefined' && document.querySelector('meta[name="heurisko-mode"]')?.getAttribute('content') === 'public-readonly';
export type CatalogEntry = {
    handle: string;
    reportId: string;
    reportContentRef: string;
    artifact: ArtifactIdentity;
    fixtureKind: string;
};
export type Loaded = {
    report: InvestigationReport;
    reportContentRef: string;
    facts: {
        findingsEvaluation: string;
    };
    transport: null | {
        exportedAt: string;
        included: number;
        omitted: number;
        notices: string[];
        omissions: {
            contentRef: string;
            reason: string;
        }[];
    };
};
export type Read = {
    kind: 'metadata_only';
    reason: string;
} | {
    kind: 'content';
    contentRef: string;
    address: string;
    recordedRange: {
        startByte: number;
        endByte: number;
    };
    displayedRange: {
        startByte: number;
        endByte: number;
    };
    totalBytes: number;
    truncated: boolean;
    encoding: 'utf8' | 'base64';
    bytesBase64: string;
    inertText?: string;
    member?: {
        evidenceId: string;
        locator: {
            path?: string;
        };
    };
};
// Session authority lives only in this module, never history/storage/diagnostics.
import { operationCode } from './navigation.js';
let capability = '';
export function consumeSession() {
    if (typeof location === 'undefined') return;
    const fragment = new URLSearchParams(location.hash.slice(1));
    if (!fragment.has('session')) return;
    capability = fragment.get('session') ?? '';
    history.replaceState(null, '', location.pathname);
}
export function restoreSession(launchURL: string) {
    let url: URL;
    try { url = new URL(launchURL); } catch { throw Error('SESSION_URL_INVALID'); }
    if (url.origin !== location.origin || url.pathname !== '/' || url.search || !/^#session=[a-f0-9]{64}$/.test(url.hash)) throw Error('SESSION_URL_INVALID');
    capability = url.hash.slice('#session='.length);
    window.dispatchEvent(new Event('heurisko-session'));
}
consumeSession();
if (typeof window !== 'undefined') window.addEventListener('hashchange', () => {
    if (new URLSearchParams(location.hash.slice(1)).has('session')) { consumeSession(); window.dispatchEvent(new Event('heurisko-session')); }
});
// Only reads receive a client deadline. Mutations are never retried or resubmitted.
export async function api<T>(route: string, signal?: AbortSignal, timeoutMs = 12000): Promise<T> {
    const controller = new AbortController(); let timedOut = false;
    const abort = () => controller.abort(signal?.reason);
    if (signal?.aborted) abort(); else signal?.addEventListener('abort', abort, { once: true });
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
    try { return await (await response(route, { signal: controller.signal })).json(); }
    catch (error) { if (timedOut && !signal?.aborted) throw Error('READ_TIMEOUT'); throw error; }
    finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
}
export function safe(value: unknown, multiline = false): string {
    const text = typeof value === 'string' ? value : String(value);
    return text.replace(/[\n\t\r]/g, c => multiline && c === '\n' ? c : c === '\n' ? '\\n' : c === '\t' ? '\\t' : '\\r').replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
}
export const json = (value: unknown) => safe(JSON.stringify(value, null, 2), true);

async function response(route: string, init: RequestInit = {}) {
    let result: Response;
    try { result = await fetch('/api/' + route, { ...init, headers: { 'X-Heurisko-Session': capability, ...init.headers }, credentials: 'omit', cache: 'no-store' }); }
    catch (error) {
        if (init.signal?.aborted) throw error;
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('heurisko-connection', { detail: 'disconnected' }));
        throw Error('LOCAL_SERVICE_UNAVAILABLE');
    }
    if (!result.ok) {
        const data = await result.json().catch(() => ({ error: 'LOCAL_OPERATION_FAILED' }));
        const code = operationCode(Error(data && typeof data.error === 'string' ? data.error : 'LOCAL_OPERATION_FAILED'));
        if (result.status === 403 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('heurisko-connection', { detail: code === 'SESSION_DENIED' ? 'unauthorized' : 'disconnected' }));
        throw Error(code);
    }
    return result;
}
// A mutation may be accepted before its response body is lost. Normalize that
// missing acknowledgment separately from known HTTP rejection codes; never retry.
async function mutationJSON<T>(result: Response): Promise<T> {
    try { return await result.json(); }
    catch {
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('heurisko-connection', { detail: 'disconnected' }));
        throw Error('LOCAL_SERVICE_UNAVAILABLE');
    }
}
export async function post<T>(route: string, value: unknown): Promise<T> {
    const result = await response(route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
    return mutationJSON<T>(result);
}
export async function upload(kind: string, file: File): Promise<string> {
    const max = kind === 'portable' ? 100 : kind === 'report' ? 8 : 32;
    if (!file.size || file.size > max * 1024 * 1024) throw Error('UPLOAD_LIMIT');
    const result = await response('uploads/' + kind, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'X-Heurisko-Filename': encodeURIComponent(file.name) }, body: file });
    return (await mutationJSON<{ upload: string }>(result)).upload;
}
export async function download(handle: string, kind: 'report' | 'bundle' | 'export', filename?: string) {
    const result = await response(`observations/${handle}/${kind}`, kind === 'export' ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' } : {});
    const url = URL.createObjectURL(await result.blob()), link = document.createElement('a');
    link.href = url; link.download = filename ?? (kind === 'export' ? 'investigation.heurisko.json' : kind + '.json');
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
