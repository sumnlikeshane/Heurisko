import { AppLink, NavigationProvider } from './link.js';
import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, type ReactNode } from 'react';
import { api, post, restoreSession, safe, publicReadOnlyMode, type CatalogEntry, type Loaded } from './api.js';
import { Home } from './home.js';
import { Documentation } from './docs.js';
import type { JobSnapshot } from '../server/workspace.js';
import { destination, createNavigator, reportSections, reportPath, operationCode, type Connection } from './navigation.js';
import { Investigation, OpenEvidence, JobDetail, ExportActions } from './investigate.js';
import { emptyFileView, emptyFindingsView, emptyCoverageView, modalFocusables, type FileView, type FindingsView, type CoverageView } from './report-view.js';
import { Panel, Overview, Files, Findings, Sources, AI, Coverage, ReportContext, EvidenceDetail, ReportMemoryProvider, type ByteWindows, type EvidenceView } from './report-components.js';
export { Overview, Files, Findings, Sources, AI, Coverage, ReportContext, EvidenceDetail } from './report-components.js';

type SectionMemory = { details: boolean[]; scroll: number[]; focus: number };
// The report's UI ledger is memory only. Large inactive sections are unmounted.
function ReportSectionMemory({ identity, ledger, children }: { identity: string; ledger: Map<string, SectionMemory>; children: ReactNode }) {
    const root = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const node = root.current!, previous = ledger.get(identity);
        const scrollables = () => Array.from(node.querySelectorAll<HTMLElement>('.change-rows,.finding-rows,.raw,.byte-content,[data-scroll]'));
        const restore = () => {
            if (!previous) return;
            node.querySelectorAll('details').forEach((d, i) => { d.open = previous.details[i] ?? false; });
            scrollables().forEach((el, i) => { el.scrollTop = previous.scroll[i] ?? 0; });
            if (previous.focus >= 0) modalFocusables(node)[previous.focus]?.focus({ preventScroll: true });
        };
        restore(); const frame = requestAnimationFrame(restore);
        return () => { cancelAnimationFrame(frame); ledger.set(identity, { details: Array.from(node.querySelectorAll('details')).map(d => d.open), scroll: scrollables().map(el => el.scrollTop), focus: modalFocusables(node).indexOf(document.activeElement as HTMLElement) }); };
    }, [identity, ledger]);
    return <div ref={root} className="report-reader">{children}</div>;
}
const targetLabel = (job: JobSnapshot) => safe(job.request?.target ?? job.request?.artifact?.filename ?? 'Investigation');
function ReadFailure({ code, retry, children }: { code: string; retry: () => void; children?: ReactNode }) {
    return <div className="read-failure" role="alert"><p>{code === 'READ_TIMEOUT' ? 'The reader did not respond within 12 seconds.' : code === 'SESSION_DENIED' ? 'Connect to this reader to continue.' : code === 'LOCAL_SERVICE_UNAVAILABLE' ? 'The local reader is disconnected.' : 'This read could not be completed.'} {children}</p><details><summary>Diagnostic code</summary><code>{safe(code)}</code></details><button onClick={retry}>Retry this read</button></div>;
}
export function App({ publicReadOnly = publicReadOnlyMode }: { publicReadOnly?: boolean } = {}) {
    const [path, setPath] = useState(typeof location === 'undefined' ? '/' : location.pathname);
    const route = destination(path), surface = route.kind === 'home' ? 'home' : route.kind === 'docs' ? 'docs' : 'workspace';
    const navigator = useRef<ReturnType<typeof createNavigator> | null>(null);
    useLayoutEffect(() => { navigator.current = createNavigator(window, setPath); return () => navigator.current?.dispose(); }, []);
    const go = (next: string) => navigator.current?.go(next);
    const lastDoc = useRef<React.ComponentProps<typeof Documentation>['doc']>('start/quickstart');
    if (route.kind === 'docs') lastDoc.current = route.doc;
    const workspaceReturn = useRef({ path: publicReadOnly ? '/workspace/reports' : '/workspace/new', label: publicReadOnly ? 'Explore captured reports' : 'Return to investigation draft' });
    if (surface === 'workspace' && route.kind !== 'missing') workspaceReturn.current = { path, label: route.kind === 'new' ? 'Return to investigation draft' : route.kind === 'job' ? 'Return to job' : route.kind === 'report' ? 'Return to selected report' : route.kind === 'open' ? 'Return to Open evidence' : 'Return to ' + route.kind };
    const [catalog, setCatalog] = useState<CatalogEntry[]>([]), [jobs, setJobs] = useState<JobSnapshot[]>([]);
    const [catalogError, setCatalogError] = useState(''), [jobError, setJobError] = useState('');
    const [catalogRead, setCatalogRead] = useState(''), [jobsRead, setJobsRead] = useState('');
    const [catalogPending, setCatalogPending] = useState(true), [jobsPending, setJobsPending] = useState(true);
    const [connection, setConnection] = useState<Connection>('unknown'), [refresh, setRefresh] = useState(0), [catalogRefresh, setCatalogRefresh] = useState(0), [reportRefresh, setReportRefresh] = useState(0);
    const [handle, setHandle] = useState(''), [loaded, setLoaded] = useState<Loaded | null>(null), [loadedHandle, setLoadedHandle] = useState(''), [error, setError] = useState(''), [reportPending, setReportPending] = useState(false), [reportRead, setReportRead] = useState('');
    const [lastSection, setSection] = useState<typeof reportSections[number]>('Overview');
    const section = route.kind === 'report' ? route.section : lastSection;
    const [evidenceViews, setEvidenceViews] = useState<Record<string, string[]>>({});
    const evidenceStack = evidenceViews[handle] ?? [];
    const setEvidenceStack = (update: (stack: string[]) => string[]) => setEvidenceViews(views => ({ ...views, [handle]: update(views[handle] ?? []) }));
    const [offsets, setOffsets] = useState<Record<string, number>>({});
    const windows: ByteWindows = { offsets, move: (key, offset) => setOffsets(values => ({ ...values, [key]: offset })) };
    const [fileViews, setFileViews] = useState<Record<string, FileView>>({}), [findingViews, setFindingViews] = useState<Record<string, FindingsView>>({}), [coverageViews, setCoverageViews] = useState<Record<string, CoverageView>>({});
    const fileView = fileViews[handle] ?? emptyFileView, findingsView = findingViews[handle] ?? emptyFindingsView, coverageView = coverageViews[handle] ?? emptyCoverageView;
    const updateFiles = (patch: Partial<FileView>) => setFileViews(views => ({ ...views, [handle]: { ...(views[handle] ?? emptyFileView), ...patch } }));
    const [sessionError, setSessionError] = useState('');
    const previousFocus = useRef<HTMLElement | null>(null), evidenceDetails = useRef(new Map<string, EvidenceView>()), sectionMemory = useRef(new Map<string, SectionMemory>()), auxiliaryPages = useRef(new Map<string, number>()), settledCount = useRef(-1);
    useEffect(() => {
        const changed = (event: Event) => setConnection((event as CustomEvent<Connection>).detail);
        const session = () => { setPath(location.pathname); setRefresh(n => n + 1); };
        window.addEventListener('heurisko-connection', changed); window.addEventListener('heurisko-session', session);
        return () => { window.removeEventListener('heurisko-connection', changed); window.removeEventListener('heurisko-session', session); };
    }, []);
    // Jobs and catalog are independent observations. A failed catalog cannot erase a job/report.
    useEffect(() => {
        if (publicReadOnly) { setJobs([]); setJobsPending(false); setJobError(''); return; }
        const controller = new AbortController(); let timer: ReturnType<typeof setTimeout>;
        async function read() {
            try {
                const executions = await api<JobSnapshot[]>('investigations', controller.signal);
                if (controller.signal.aborted) return;
                setJobs(executions); setConnection('connected'); setJobError(''); setJobsRead(new Date().toISOString()); setJobsPending(false);
                const count = executions.filter(j => j.phase.startsWith('settled')).length;
                if (settledCount.current >= 0 && count !== settledCount.current) setCatalogRefresh(n => n + 1);
                settledCount.current = count;
                if (executions.some(j => !j.phase.startsWith('settled'))) timer = setTimeout(read, 1500);
            } catch (e) { if (!controller.signal.aborted) { setJobError(operationCode(e)); setJobsPending(false); } }
        }
        void read(); return () => { controller.abort(); clearTimeout(timer); };
    }, [refresh, publicReadOnly]);
    useEffect(() => {
        const controller = new AbortController(); setCatalogPending(true);
        api<CatalogEntry[]>('observations', controller.signal).then(items => { if (!controller.signal.aborted) { setCatalog(items); setCatalogError(''); setCatalogRead(new Date().toISOString()); setCatalogPending(false); setConnection('connected'); } }).catch(e => { if (!controller.signal.aborted) { setCatalogError(operationCode(e)); setCatalogPending(false); } });
        return () => controller.abort();
    }, [refresh, catalogRefresh]);
    useEffect(() => { if (route.kind === 'report') { setHandle(route.handle); setSection(route.section); } }, [path]);
    useEffect(() => {
        if (!handle) return;
        const controller = new AbortController(); setError(''); setReportPending(true);
        api<Loaded>('observations/' + handle, controller.signal).then(value => { if (!controller.signal.aborted) { setLoaded(value); setLoadedHandle(handle); setReportPending(false); setReportRead(new Date().toISOString()); } }).catch(e => { if (!controller.signal.aborted) { setError(operationCode(e)); setReportPending(false); } });
        return () => controller.abort();
    }, [handle, refresh, reportRefresh]);
    const openEvidence = (id: string) => { if (!evidenceStack.length) previousFocus.current = document.activeElement as HTMLElement; setEvidenceStack(stack => [...stack, id]); };
    const closeEvidence = () => { setEvidenceStack(stack => stack.slice(0, -1)); if (evidenceStack.length === 1) requestAnimationFrame(() => { if (previousFocus.current?.isConnected) previousFocus.current.focus(); else document.querySelector<HTMLElement>('.report-reader h1,.report-strip h1')?.focus(); }); };
    const reportVisible = route.kind === 'report';
    const retainedReady = reportVisible && route.handle === loadedHandle && route.handle === handle && loaded;
    const staleReadable = error === 'READ_TIMEOUT' || error === 'LOCAL_SERVICE_UNAVAILABLE' || error === 'SESSION_DENIED';
    const selectedReady = retainedReady && (!error || staleReadable);
    const evidence = selectedReady ? loaded?.report.bundle.evidence.find(e => e.evidenceId === evidenceStack.at(-1)) : undefined;
    useEffect(() => {
        if (!evidence) return;
        const listener = (e: KeyboardEvent) => { if (e.key !== 'Tab') return; const dialog = document.querySelector('.evidence-dialog'); const focusable = dialog ? modalFocusables(dialog as HTMLElement) : [], first = focusable[0], last = focusable.at(-1); if (!focusable.length) { e.preventDefault(); return; } if (e.shiftKey && (document.activeElement === first || document.activeElement?.id === 'evidence-title')) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } };
        document.addEventListener('keydown', listener); return () => document.removeEventListener('keydown', listener);
    }, [evidence?.evidenceId, evidenceStack.length]);
    const openObservation = (next: string) => { setCatalogRefresh(n => n + 1); go(reportPath(next)); };
    const onStart = (id: string) => { setJobsPending(true); setRefresh(n => n + 1); go('/workspace/jobs/' + id); };
    const job = route.kind === 'job' ? jobs.find(j => j.id === route.id) : undefined, activeJob = jobs.find(j => !j.phase.startsWith('settled'));
    // Memoizing the active section avoids report filtering/serialization on each job poll.
    const reportContent = useMemo(() => {
        if (!selectedReady || !loaded) return null;
        const props = { r: loaded.report, onOpen: openEvidence };
        const content = section === 'Overview' ? <Overview loaded={loaded} onOpen={openEvidence} onSection={s => go(reportPath(handle, s))}/> : section === 'Files' ? <Files {...props} view={fileView} setView={updateFiles} filter={fileView.filter} setFilter={filter => updateFiles({ filter, page: 0, memberPage: 0 })} status={fileView.status} setStatus={status => updateFiles({ status, page: 0 })} selected={fileView.selected} setSelected={selected => updateFiles({ selected })} page={fileView.page} setPage={page => updateFiles({ page })}/> : section === 'Findings' ? <Findings {...props} view={findingsView} setView={patch => setFindingViews(views => ({ ...views, [handle]: { ...(views[handle] ?? emptyFindingsView), ...patch } }))} onChange={id => { updateFiles({ selected: id, mode: 'changes', filter: '', status: 'all', prefix: '', side: 'all', page: Math.floor(loaded.report.bundle.changes.findIndex(c => c.changeId === id) / 40) }); go(reportPath(handle, 'Files')); }}/> : section === 'Source' ? <Sources {...props}/> : section === 'Coverage' ? <Coverage {...props} view={coverageView} setView={patch => setCoverageViews(views => ({ ...views, [handle]: { ...(views[handle] ?? emptyCoverageView), ...patch } }))}/> : <AI {...props}/>;
        return <ReportMemoryProvider identity={handle + ':' + section} pages={auxiliaryPages.current}><ReportSectionMemory key={handle + section} identity={handle + section} ledger={sectionMemory.current}>{content}</ReportSectionMemory></ReportMemoryProvider>;
    }, [selectedReady, loaded, handle, section, fileView, findingsView, coverageView, evidenceStack.length]);
    const retryAll = () => { setJobsPending(true); setConnection('unknown'); setRefresh(n => n + 1); };
    return <NavigationProvider navigate={go}><AppLink className="skip" tabIndex={evidence ? -1 : undefined} aria-hidden={evidence ? true : undefined} href={surface === 'home' ? '#home-content' : surface === 'docs' ? '#docs-content' : '#workspace'}>Skip to content</AppLink><div className={'shell surface-' + surface} {...(evidence ? { inert: true } : {})}>
        <header className="topbar"><AppLink href="/" className="brand" aria-label="Heurisko home"><span className="brand-symbol">[h]</span> Heurisko</AppLink><nav className="global-nav" aria-label="Main navigation"><AppLink href="/" aria-current={surface === 'home' ? 'page' : undefined}>Home</AppLink><AppLink href="/docs/start/quickstart" aria-current={surface === 'docs' ? 'page' : undefined}>Documentation</AppLink><AppLink href={publicReadOnly ? "/workspace/reports" : "/workspace/new"} aria-current={surface === 'workspace' ? 'page' : undefined}>{publicReadOnly ? "Captured reports" : "Workspace"}</AppLink></nav>{activeJob && <AppLink className="active-job" href={'/workspace/jobs/' + activeJob.id}><span aria-hidden="true">◉</span> {targetLabel(activeJob)} · {jobError || connection !== 'connected' ? 'last observed ' : ''}{activeJob.phase}</AppLink>}</header>
        {surface === 'docs' && <div className="return-context"><AppLink href={workspaceReturn.current.path}>← {workspaceReturn.current.label}</AppLink></div>}
        {publicReadOnly && <div className="hosted-notice" role="note"><strong>Public captured-report explorer</strong><span>Historical evidence only. Live investigations, uploads and portable exports run in the local workspace.</span><AppLink href="/docs/start/quickstart">Local setup →</AppLink></div>}
        <main id="home-content" hidden={surface !== 'home'} tabIndex={-1}><Home catalog={catalog} publicReadOnly={publicReadOnly}/></main>
        <main id="docs-content" hidden={surface !== 'docs'} tabIndex={-1}><Documentation doc={lastDoc.current}/></main>
        <div className="workspace-layout" hidden={surface !== 'workspace'}><aside className="workspace-sidebar">{publicReadOnly ? <><p className="eyebrow">PUBLIC SAMPLES</p><nav aria-label="Workspace tasks"><AppLink href="/workspace/reports" aria-current={route.kind === "reports" || reportVisible ? "page" : undefined}>Captured reports</AppLink><AppLink href="/docs/start/quickstart">Run locally</AppLink></nav><p className="field-help">Read only. These reports and retained package bytes are public committed examples. Opening them does not run analysis.</p><button onClick={() => setCatalogRefresh(n => n + 1)}>Refresh sample catalog</button></> : <><p className="eyebrow">WORKSPACE</p><nav aria-label="Workspace tasks">{[['new', 'New investigation'], ['open', 'Open evidence'], ['jobs', 'Jobs'], ['reports', 'Reports']].map(([key, label]) => <AppLink key={key} href={'/workspace/' + key} aria-current={route.kind === key || key === 'jobs' && route.kind === 'job' || key === 'reports' && reportVisible ? 'page' : undefined}>{label}</AppLink>)}</nav><details className="session-status" open={connection !== 'connected'}><summary>Reader · {connection === 'unknown' ? 'checking' : connection}</summary><p>Access stays in this tab’s memory. Reconnecting never starts work.</p><button onClick={retryAll}>Refresh connection</button>{connection !== 'connected' && <><p>{connection === 'unauthorized' ? 'Use the private launch URL printed by this reader.' : 'Check that the local reader is running, then refresh or reconnect.'}</p><form autoComplete="off" onSubmit={event => { event.preventDefault(); const form = event.currentTarget, url = String(new FormData(form).get('launchURL') ?? ''); form.reset(); try { restoreSession(url); setSessionError(''); } catch { setSessionError('Use the private launch URL for this exact reader address. It is never saved.'); } }}><label>Private launch URL<input name="launchURL" type="password" autoComplete="off" maxLength={2048} required/></label><button type="submit">Reconnect here</button></form>{sessionError && <p role="alert">{sessionError}</p>}</>}<AppLink href="/docs/troubleshooting/session">Connection help</AppLink></details></>}</aside>
        <main id="workspace" tabIndex={-1}>{!publicReadOnly && <><div hidden={route.kind !== 'new'}><Investigation onStart={onStart} active={!!activeJob}/></div><div hidden={route.kind !== 'open'}><OpenEvidence onOpen={openObservation} active={!!activeJob}/></div></>}{publicReadOnly && ["new", "open", "jobs", "job"].includes(route.kind) && <Panel title="Run new investigations locally"><p>This public host serves captured reports. It does not accept uploads, start investigations, reopen private files or maintain jobs.</p><p>The local CLI and workspace retain the full shared-engine workflow and restricted Docker parser.</p><pre className="raw">pnpm run build<br/>pnpm web<br/>node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --no-ai</pre><AppLink href="/workspace/reports">Explore captured reports</AppLink> · <AppLink href="/docs/start/quickstart">Installation and local setup</AppLink></Panel>}
        {!publicReadOnly && route.kind === 'jobs' && <><div className="page-heading"><div><p className="eyebrow">THIS READER PROCESS</p><h1>Jobs</h1><p>Execution history lasts until the reader restarts. Navigation and closing a tab do not cancel work.</p></div><button onClick={retryAll}>Refresh jobs</button></div>{jobError && <ReadFailure code={jobError} retry={retryAll}/>}<p className="observation-time">{jobsRead ? 'Last successful observation: ' + jobsRead : jobsPending ? 'Reading jobs…' : 'No successful observation yet.'}</p><div className="catalog-list">{jobs.map(j => <article className="catalog-row" key={j.id}><div><h2><AppLink href={'/workspace/jobs/' + j.id}>{targetLabel(j)}</AppLink></h2><p>{j.request?.kind === 'local' ? 'Local archive' : 'Public npm'} · started {safe(j.startedAt)}</p><details><summary>Job identity</summary><code>{j.id}</code></details></div><span className="state-label">{jobError ? 'Last observed: ' : ''}{j.phase}</span><AppLink href={'/workspace/jobs/' + j.id}>Open job →</AppLink></article>)}</div>{!jobs.length && !jobsPending && !jobError && <div className="empty-state"><h2>No jobs yet</h2><p>Start one exact investigation or open retained evidence.</p><AppLink href="/workspace/new">New investigation →</AppLink></div>}</>}
        {!publicReadOnly && route.kind === 'job' && (job ? <JobDetail job={job} error={jobError} onCancel={() => { void post<JobSnapshot>(`investigations/${job.id}/cancel`, {}).then(() => setRefresh(n => n + 1)).catch(e => setJobError(operationCode(e))); }}/> : <Panel title={jobsPending ? 'Reading job' : 'Job unavailable'}>{jobError ? <ReadFailure code={jobError} retry={retryAll}/> : <p role="status">{jobsPending ? 'Reading this process’s recorded job state…' : 'This handle is absent from this reader process. A restart expires execution handles; it never restarts work.'}</p>}<AppLink href="/workspace/jobs">View current jobs</AppLink> · <AppLink href="/workspace/open">Open retained evidence</AppLink></Panel>)}
        {route.kind === 'reports' && <><div className="page-heading"><div><p className="eyebrow">ADMITTED OBSERVATIONS</p><h1>Reports</h1><p>{publicReadOnly ? "Committed public captures: one inert local mutation with deterministic findings, one genuine release and one incomplete-source example. Capture times and original report facts stay unchanged." : "Retained evidence opened in this process. The evidence store can contain other reports; reopen those explicitly."}</p></div><button onClick={() => setCatalogRefresh(n => n + 1)}>Refresh reports</button></div>{catalogError && <ReadFailure code={catalogError} retry={() => setCatalogRefresh(n => n + 1)}/>}<p className="observation-time">{catalogRead ? 'Last successful observation: ' + catalogRead : catalogPending ? 'Reading reports…' : 'No successful observation yet.'}</p><div className="catalog-list">{catalog.map(c => <article className="catalog-row" key={c.handle}><div><h2><AppLink href={reportPath(c.handle)}>{safe(c.artifact.packageName ?? c.artifact.artifactFilename)}{c.artifact.version ? '@' + safe(c.artifact.version) : ''}</AppLink></h2><p>{safe(c.artifact.origin)} · captured {safe(c.artifact.captureTime)}</p><details><summary>Observation identity</summary><dl><dt>Report ID</dt><dd>{safe(c.reportId)}</dd><dt>Original report content reference</dt><dd>{safe(c.reportContentRef)}</dd><dt>Process-local handle</dt><dd>{c.handle}</dd></dl></details></div><span className="state-label">Retained observation{catalogError ? ' · last observed' : ''}</span><AppLink href={reportPath(c.handle)}>Open report →</AppLink></article>)}</div>{!catalog.length && !catalogPending && !catalogError && <div className="empty-state"><h2>No admitted reports</h2><p>Open a report or portable evidence, or start an investigation.</p><AppLink href="/workspace/open">Open evidence →</AppLink></div>}</>}
        {reportVisible && <>{error && <ReadFailure code={error} retry={() => setReportRefresh(n => n + 1)}>{selectedReady ? 'Showing retained facts from the last successful read at ' + reportRead + '.' : 'An expired handle can be reopened from retained bytes.'}</ReadFailure>}{selectedReady && loaded ? <><div className="report-header"><ReportContext loaded={loaded}/><ExportActions key={handle} handle={handle} loaded={loaded} publicReadOnly={publicReadOnly}/></div><nav className="report-nav" aria-label="Report sections">{reportSections.map(s => <AppLink key={s} href={reportPath(handle, s)} aria-current={section === s ? 'page' : undefined}>{s}</AppLink>)}</nav>{evidenceStack.length > 0 && !evidence && <div className="read-failure"><p>The selected evidence record is no longer available in this observation.</p><button onClick={() => setEvidenceStack(() => [])}>Return to report records</button></div>}{reportContent}</> : !error && <Panel title="Loading report"><p role="status">{reportPending || route.handle !== handle ? 'Reading and validating the selected observation…' : 'Waiting for the selected observation…'}</p></Panel>}</>}
        {route.kind === 'missing' && <Panel title="Unknown destination"><p>This location is not a supported application route.</p><AppLink href={publicReadOnly ? "/workspace/reports" : "/workspace/new"}>{publicReadOnly ? "Explore captured reports" : "Start an investigation"}</AppLink></Panel>}
        </main></div><footer><span>Exact bytes. Inspectable evidence. Visible limits.</span><span>{publicReadOnly ? "Public captured reports · read only" : "Local reader · one shared engine"}</span></footer></div>{evidence && loaded && <ReportMemoryProvider identity={handle + ':evidence:' + evidence.evidenceId} pages={auxiliaryPages.current}><EvidenceDetail key={handle + evidence.evidenceId} handle={handle} evidence={evidence} r={loaded.report} onOpen={openEvidence} onClose={closeEvidence} windows={windows} views={evidenceDetails.current} depth={evidenceStack.length}/></ReportMemoryProvider>}</NavigationProvider>;
}
