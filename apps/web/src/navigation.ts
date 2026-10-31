// UI locations name destinations only. They never grant API authority or start work.
export const reportSections = ['Overview', 'Files', 'Findings', 'Source', 'AI', 'Coverage'] as const;
export type ReportSection = typeof reportSections[number];
import { docPages, type DocId } from './doc-model.js';
export type { DocId } from './doc-model.js';
export const docIds = docPages.map(([id]) => id);
export type Destination = { kind: 'home' } | { kind: 'docs'; doc: DocId } | { kind: 'new' | 'open' | 'jobs' | 'reports' } | { kind: 'job'; id: string } | { kind: 'report'; handle: string; section: ReportSection } | { kind: 'missing' };
const opaque = '[a-f0-9]{32}';
export function destination(path: string): Destination {
    if (path === '/') return { kind: 'home' };
    if (path === '/docs') return { kind: 'docs', doc: 'start/quickstart' };
    const doc = docIds.find(id => path === '/docs/' + id);
    if (doc) return { kind: 'docs', doc };
    const task = /^\/workspace\/(new|open|jobs|reports)$/.exec(path);
    if (task) return { kind: task[1] as 'new' | 'open' | 'jobs' | 'reports' };
    const job = new RegExp(`^/workspace/jobs/(${opaque})$`).exec(path);
    if (job) return { kind: 'job', id: job[1]! };
    const report = new RegExp(`^/workspace/observations/(${opaque})/(overview|files|findings|source|ai|coverage)$`).exec(path);
    if (report) return { kind: 'report', handle: report[1]!, section: reportSections.find(s => s.toLowerCase() === report[2])! };
    return { kind: 'missing' };
}
export function uiPath(path: string) { return destination(path).kind !== 'missing'; }
export const reportPath = (handle: string, section: ReportSection = 'Overview') => `/workspace/observations/${handle}/${section.toLowerCase()}`;
export type Connection = 'unknown' | 'connected' | 'unauthorized' | 'disconnected';
export function connectionAfter(error?: unknown): Connection {
    if (!error) return 'connected';
    return error instanceof Error && error.message === 'SESSION_DENIED' ? 'unauthorized' : 'disconnected';
}
export function operationCode(error: unknown) {
    return error instanceof Error && /^[A-Z][A-Z0-9_]{0,80}$/.test(error.message) ? error.message : 'LOCAL_OPERATION_FAILED';
}
// An article anchor must scroll the article, not every ancestor up to the window.
export function scrollDocAnchor(doc: Document, hash: string): boolean {
    const pane=doc.getElementById('doc-page-scroll');
    let id=hash.replace(/^#/, '');try{id=decodeURIComponent(id);}catch{}
    const heading=id?doc.getElementById(id):null;
    if(!pane || !heading || !pane.contains(heading))return false;
    pane.scrollTop += heading.getBoundingClientRect().top-pane.getBoundingClientRect().top;
    heading.focus({preventScroll:true});return true;
}
// In-memory navigation ledger. No capabilities, request payloads or report facts enter history.
export function createNavigator(win: Window, changed: (path: string) => void) {
    const restoration = win.history.scrollRestoration;
    win.history.scrollRestoration = 'manual';
    const views = new Map<string, { x: number; y: number; focus?: HTMLElement }>();
    let current = win.location.pathname + win.location.hash, revision=0;
    const remember = () => views.set(current, { x: win.scrollX, y: win.scrollY, focus: win.document.activeElement instanceof HTMLElement ? win.document.activeElement : undefined });
    function show(next: string, restoring = false) {
        const withinDocs=destination(current.split('#')[0]!).kind==='docs' && destination(next.split('#')[0]!).kind==='docs';
        const activeRevision=++revision;
        current = next; changed(win.location.pathname);
        win.requestAnimationFrame(() => {
            if(activeRevision!==revision)return;
            // Documentation owns its article/aside scrollers. A new doc must never
            // reset the window or refocus the entire main/shell.
            if(withinDocs) {
                if(win.location.hash)scrollDocAnchor(win.document,win.location.hash);
                else win.document.getElementById('doc-page-scroll')?.querySelector<HTMLElement>('h1')?.focus({preventScroll:true});
                return;
            }
            const view = views.get(next);
            if (restoring && view) { win.scrollTo(view.x, view.y); if (view.focus?.isConnected) view.focus.focus({ preventScroll: true }); }
            else if (win.location.hash) {
                let id=win.location.hash.slice(1);try{id=decodeURIComponent(id);}catch{}
                if(!scrollDocAnchor(win.document,win.location.hash)){const heading=win.document.getElementById(id);heading?.scrollIntoView();heading?.focus({preventScroll:true});}
            }
            else if (view) { win.scrollTo(view.x, view.y); if(view.focus?.isConnected)view.focus.focus({preventScroll:true}); }
            else { win.scrollTo(0, 0); win.document.querySelector<HTMLElement>('main:not([hidden])')?.focus({ preventScroll: true }); }
        });
    }
    const pop = () => { remember(); show(win.location.pathname + win.location.hash, true); };
    const session = () => show(win.location.pathname);
    win.addEventListener('popstate', pop);
    win.addEventListener('heurisko-session', session);
    return {
        go(next: string) {
            if (!uiPath(next.split('#')[0]!) || new URLSearchParams(next.split('#')[1] ?? '').has('session')) return;
            if(next===current){if(win.location.hash)show(next);return;}
            remember(); win.history.pushState(null, '', next); show(next);
        },
        dispose() { revision++; win.removeEventListener('popstate', pop); win.removeEventListener('heurisko-session', session); win.history.scrollRestoration = restoration; }
    };
}
