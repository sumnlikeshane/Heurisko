import { AppLink, NavigationProvider } from './link.js';
import React, { useState, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import type { InvestigationReport, FileChange, EvidenceRecord } from '@heurisko/contracts';
import { api, post, restoreSession, safe, json, type CatalogEntry, type Loaded, type Read } from './api.js';
import { Home } from './home.js';
import { Documentation } from './docs.js';
import type { JobSnapshot } from '../server/workspace.js';
import { destination, createNavigator, reportSections, reportPath, connectionAfter, operationCode, type Connection, type ReportSection } from './navigation.js';
import { Investigation, OpenEvidence, JobDetail, ExportActions } from './investigate.js';
import { emptyFileView, browseFiles, readingGuide, modalFocusables, type FileView } from './report-view.js';
type Section = ReportSection;
function Panel({ title, children, className = '' }: {
    title: string;
    children: ReactNode;
    className?: string;
}) { return <section className={'panel ' + className}><h2><span className="bracket">┌</span> {title}</h2><div className="panel-body">{children}</div></section>; }
function Value({ label, children }: {
    label: string;
    children: ReactNode;
}) { return <div className="value"><dt>{label}</dt><dd>{children}</dd></div>; }
function Code({ value }: {
    value: unknown;
}) { const text = json(value), [page, setPage] = useState(0); return <><pre className="raw" tabIndex={0}>{text.slice(page * 8192, (page + 1) * 8192)}</pre>{text.length > 8192 && <div className="pagination"><button disabled={!page} onClick={() => setPage(page - 1)}>← Previous text</button><span>{page + 1} / {Math.ceil(text.length / 8192)} display pages</span><button disabled={(page + 1) * 8192 >= text.length} onClick={() => setPage(page + 1)}>Next text →</button></div>}</>; }
function Lines({ values }: {
    values: readonly string[];
}) { const [count, setCount] = useState(20); return values.length ? <><ul className="lines">{values.slice(0, count).map((x, i) => <li key={i}>{safe(x)}</li>)}</ul>{count < values.length && <button onClick={() => setCount(count + 20)}>Show next 20 / {values.length} records</button>}</> : <p className="muted">None recorded.</p>; }
function Badge({ children }: {
    children: string;
}) { return <span className={'badge ' + (['mismatched', 'failed', 'invalid', 'violation'].includes(children) ? 'danger' : ['ambiguous', 'incomplete', 'unresolved', 'indeterminate', 'not_assessed', 'not_checked', 'not_evaluated', 'unavailable'].includes(children) ? 'warning' : '')}>{safe(children)}</span>; }
function EvidenceLinks({ ids, onOpen }: {
    ids: readonly string[];
    onOpen: (id: string) => void;
}) { return <div className="evidence-links">{ids.map(id => <button className="link" key={id} onClick={() => onOpen(id)}>{safe(id)} ↗</button>)}</div>; }
export function Overview({ loaded, onOpen, onSection }: {
    loaded: Loaded;
    onOpen: (id: string) => void;
    onSection: (section: Section) => void;
}) {
    const r = loaded.report, a = r.bundle.artifact, c = r.bundle.coverage;
    return <><Panel title="Read this observation"><p>{a.origin === 'local' ? 'Local-input bytes; registry provenance is not inherited.' : 'Exact retained registry artifact; integrity is separate from source correspondence.'} Captured {safe(a.captureTime)}. Reopening makes no fresh registry or revocation check.</p><ul>{readingGuide(r).map(g=><li key={g.section}><p>{g.text} <button onClick={()=>onSection(g.section)}>Inspect {g.section}</button></p></li>)}</ul><p className="notice">{r.analysis.findings.length} recorded findings. Zero findings with incomplete or unavailable analysis never establishes a clean assessment.</p><details><summary>Which checks ran?</summary>{[...r.bundle.stages,...r.analysis.stages].map((stage,i)=><p key={i}>{stage.stage}: {stage.status} · {stage.errors.length} recorded errors</p>)}</details></Panel><div className="outcomes">{Object.entries(r.outcomes).map(([label, value]) => <div className="outcome" key={label}><span>{label.replace(/([A-Z])/g, ' $1').toLowerCase()}</span><Badge>{value}</Badge></div>)}</div>
 <div className="grid two"><Panel title="Artifact identity"><dl><Value label="origin">{a.origin === 'local' ? 'local-input' : a.origin}</Value><Value label="filename">{safe(a.artifactFilename)}</Value><Value label="observed SHA-256">{safe(a.observedSha256)}</Value><Value label="integrity">{a.integrity.status} / {a.integrity.algorithm}</Value><Value label="expected value">{safe(a.integrity.expectedValue ?? 'not available')}</Value><Value label="captured UTC">{safe(a.captureTime)}</Value><Value label="report created UTC">{safe(r.createdAt)}</Value></dl>{a.metadataEvidenceId && <EvidenceLinks ids={[a.metadataEvidenceId]} onOpen={onOpen}/>}</Panel>
 <Panel title="Assessment & scope"><div className="scope-counts"><div><strong>{r.bundle.changes.length}</strong><span>raw changes</span></div><div><strong>{r.analysis.findings.length}</strong><span>recorded findings</span></div><div><strong>{c.omissions.length}</strong><span>omissions</span></div></div><p className="notice">{loaded.facts.findingsEvaluation === 'recorded_for_examined_scope' ? 'Findings are recorded for the examined scope.' : 'Assessment unavailable or partial. Empty findings do not mean no issues.'}</p><dl><Value label="compared files">{c.comparedFiles}</Value><Value label="analyzed bytes">{c.analyzedBytes.toLocaleString()}</Value><Value label="skipped / unsupported bytes">{c.skippedBytes.toLocaleString()} / {c.unsupportedBytes.toLocaleString()}</Value><Value label="AI">{r.analysis.aiState.status}</Value></dl><div className="actions"><button onClick={() => onSection('Files')}>Explore changes →</button><button onClick={() => onSection('Coverage')}>Inspect coverage →</button></div></Panel></div>
 <div className="grid two"><Panel title="Report identity"><dl><Value label="report ID">{r.reportId}</Value><Value label="original report digest">{loaded.reportContentRef}</Value><Value label="schema">{r.schemaVersion}</Value><Value label="configuration fingerprint">{r.analysisConfigFingerprint}</Value><Value label="fixture kind">{r.fixtureKind}</Value></dl></Panel><Panel title="Recorded limitations"><Lines values={[...r.bundle.limitations, ...r.analysis.limitations]}/></Panel></div>
 {loaded.transport && <Panel title="Portable export"><p>Exported UTC {safe(loaded.transport.exportedAt)} · {loaded.transport.included} included blobs · {loaded.transport.omitted} omitted blobs</p><p className="muted">Export time is separate from capture time. This manifest is not an authenticated source assertion.</p><Lines values={loaded.transport.notices}/><Code value={loaded.transport.omissions}/></Panel>}</>;
}
export function Sources({ r, onOpen }: {
    r: InvestigationReport;
    onOpen: (id: string) => void;
}) { return <><div className="section-intro"><h1>Source context</h1><p>All retained candidates. Ordering does not select an authoritative source.</p></div>{r.bundle.sourceCandidates.map((c, i) => <Panel key={i} title={'Candidate ' + String(i + 1).padStart(2, '0')}><dl><Value label="repository">{safe(c.repositoryUrl)}</Value><Value label="full commit">{safe(c.commit ?? 'not recorded')}</Value><Value label="package subdirectory">{safe(c.subdirectory ?? 'not recorded')}</Value><Value label="association"><Badge>{c.association}</Badge></Value><Value label="snapshot SHA-256">{safe(c.sourceSnapshotSha256 ?? 'not recorded')}</Value><Value label="build context SHA-256">{safe(c.buildContextSha256 ?? 'not recorded')}</Value></dl>{c.conflicts.length > 0 && <div className="notice warning">Recorded conflicts<Lines values={c.conflicts}/></div>}<EvidenceLinks ids={c.evidenceIds} onOpen={onOpen}/></Panel>)}<Panel title="Provenance"><Code value={r.bundle.provenance}/><EvidenceLinks ids={r.bundle.provenance.evidenceIds} onOpen={onOpen}/></Panel><Panel title="Build records"><p className="muted">Build configuration is context, not evidence of a reproduced build.</p><Code value={[...r.bundle.stages, ...r.analysis.stages].filter(s => s.stage === 'build')}/><EvidenceLinks ids={r.bundle.evidence.filter(e => e.kind === 'build_record').map(e => e.evidenceId)} onOpen={onOpen}/></Panel></>; }
export function Findings({ r, onOpen }: {
    r: InvestigationReport;
    onOpen: (id: string) => void;
}) { const [filter, setFilter] = useState(''); const findings = r.analysis.findings.filter(f => safe([f.findingId, f.title, f.ruleId, f.severity, f.reviewPriority, f.evidenceConfidence].join(' ')).toLowerCase().includes(filter.toLowerCase())); return <><div className="section-intro"><h1>Recorded findings <span className="muted">/ {r.analysis.findings.length}</span></h1><p>Severity, review priority and evidence confidence remain separate.</p></div><label className="search">Filter findings <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Title, rule, severity, priority or confidence"/></label>{r.analysis.findings.length === 0 ? <Panel title="No findings recorded"><p className="notice">Heuristic analysis may be unavailable, skipped or incomplete. This is not a clean assessment.</p><Code value={r.analysis.stages.filter(s => s.stage === 'heuristics')}/></Panel> : findings.slice(0, 100).map(f => <Panel key={f.findingId} title={safe(f.title)}><dl><Value label="finding ID">{f.findingId}</Value><Value label="rule">{f.ruleId} @ {f.ruleVersion}</Value><Value label="severity"><Badge>{f.severity}</Badge></Value><Value label="review priority">{f.reviewPriority}</Value><Value label="evidence confidence">{f.evidenceConfidence}</Value><Value label="explanation strength">{f.explanationStrength}</Value></dl><h3>Observation</h3><p>{safe(f.observation)}</p><h3>Why it matters</h3><p>{safe(f.whyItMatters)}</p><EvidenceLinks ids={f.evidenceIds} onOpen={onOpen}/><h3>Limitations</h3><Lines values={f.limitations}/><h3>Next actions</h3><Lines values={f.nextActions}/></Panel>)}{findings.length > 100 && <p className="notice">First 100 matching findings shown. Narrow the filter to inspect more.</p>}</>; }
export function AI({ r, onOpen }: {
    r: InvestigationReport;
    onOpen: (id: string) => void;
}) { return <><div className="section-intro"><h1>AI interpretation</h1><p>Stored hypotheses remain separate from deterministic evidence and outcomes.</p></div><Panel title="Recorded AI state"><Code value={r.analysis.aiState}/><p className="muted">No inference runs in this viewer. Weight digest and decoding settings are not fields in G0; they remain unknown unless retained in evidence.</p></Panel>{r.analysis.interpretations.length === 0 && <p className="notice">No interpretations recorded. No fallback explanation has been synthesized.</p>}{r.analysis.interpretations.map(a => <Panel title={safe(a.interpretationId)} key={a.interpretationId}><h3>Hypothesis</h3><p>{safe(a.hypothesis)}</p><p>{safe(a.reasoningSummary)}</p><EvidenceLinks ids={a.evidenceIds} onOpen={onOpen}/><h3>Alternatives</h3><Lines values={a.alternatives}/><h3>Missing evidence</h3><Lines values={a.missingEvidence}/><h3>Next actions</h3><Lines values={a.nextActions}/><dl><Value label="abstention">{safe(a.abstentionReason)}</Value><Value label="model">{safe(a.modelId)}</Value><Value label="runtime">{safe(a.runtimeId)}</Value><Value label="prompt version">{safe(a.promptVersion)}</Value><Value label="validation">{a.validation}</Value><Value label="finding IDs">{a.findingIds.map(x => safe(x)).join(', ')}</Value></dl></Panel>)}</>; }
export function Coverage({ r, onOpen }: {
    r: InvestigationReport;
    onOpen: (id: string) => void;
}) { return <><div className="section-intro"><h1>Coverage & errors</h1><p>Counts describe declared scope. Missing evidence remains visible.</p></div><Panel title="Coverage"><Code value={r.bundle.coverage}/></Panel><Panel title="Stage records"><div className="stage-table">{[...r.bundle.stages, ...r.analysis.stages].map((s, i) => <div key={i}><div className="stage-heading"><span>{s.stage}</span><Badge>{s.status}</Badge></div>{s.errors.map((e, j) => <Code key={j} value={e}/>)}</div>)}</div></Panel><Panel title="Omissions">{r.bundle.coverage.omissions.map((o, i) => <div className="omission" key={i}><Code value={o}/><EvidenceLinks ids={o.evidenceIds} onOpen={onOpen}/></div>)}{!r.bundle.coverage.omissions.length && <p className="muted">No omissions recorded in the coverage record.</p>}</Panel><Panel title="Monitoring"><p className="notice">Unavailable. No versioned monitor snapshot was supplied. Saved reports are not a live feed.</p></Panel></>; }
type ByteWindows = { offsets: Record<string, number>; move: (key: string, offset: number) => void };
function EvidencePage({ handle, id, mode, side, windows }: {
    handle: string;
    id: string;
    mode: 'record' | 'citation';
    side?: 'source' | 'artifact';
    windows: ByteWindows;
}) {
    const windowKey = `${handle}:${id}:${mode}:${side ?? 'record'}`, offset = windows.offsets[windowKey] ?? 0;
    const setOffset = (next: number) => windows.move(windowKey, next);
    const [page, setPage] = useState<Read | null>(null), [error, setError] = useState(''), [retry,setRetry]=useState(0);
    useEffect(() => { const controller = new AbortController(); setPage(null); setError(''); const q = new URLSearchParams({ mode, offset: String(offset), length: '4096', ...(side ? { side } : {}) }); api<Read>(`observations/${handle}/evidence/${id}?${q}`, controller.signal).then(value => { if (!controller.signal.aborted) setPage(value); }).catch(e => { if (!controller.signal.aborted)
        setError(operationCode(e)); }); return () => controller.abort(); }, [handle, id, mode, side, offset, retry]);
    return <div className="evidence-page">{error ? <p role="alert" className="danger">{safe(error)} <button onClick={()=>setRetry(n=>n+1)}>Read this byte page again</button></p> : !page ? <p className="muted" role="status">Reading hash-checked bytes…</p> : page.kind === 'metadata_only' ? <p className="notice warning">Content unavailable: {page.reason}</p> : <><dl><Value label="content reference">{page.contentRef}</Value>{page.member && <Value label="resolved member">{page.member.evidenceId} / {safe(page.member.locator.path ?? '')}</Value>}<Value label="address">{page.address}</Value><Value label="recorded byte range">[{page.recordedRange.startByte}, {page.recordedRange.endByte})</Value><Value label="displayed byte range">[{page.displayedRange.startByte}, {page.displayedRange.endByte}) / {page.totalBytes} file bytes</Value><Value label="encoding">{page.encoding}{page.encoding === 'base64' ? ' · binary or split UTF-8 page' : ''}</Value></dl><pre className="byte-content" tabIndex={0}>{page.encoding === 'utf8' ? safe(page.inertText ?? '', true) : page.bytesBase64}</pre><div className="actions"><button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 4096))}>← Previous bytes</button><button disabled={page.displayedRange.endByte >= page.recordedRange.endByte} onClick={() => setOffset(offset + 4096)}>Next bytes →</button></div><details><summary>Exact page bytes · base64</summary><pre className="byte-content" tabIndex={0}>{page.bytesBase64}</pre></details></>}</div>;
}
type EvidenceView = { scroll:number; focus:number; details:boolean[] };
export function EvidenceDetail({ handle, evidence, r, onOpen, onClose, windows, views }: {
    handle: string;
    evidence: EvidenceRecord;
    r: InvestigationReport;
    onOpen: (id: string) => void;
    onClose: () => void;
    windows: ByteWindows;
    views: Map<string,EvidenceView>;
}) { const [rawOpen,setRawOpen]=useState(false); const title = useRef<HTMLHeadingElement>(null); const dialogRef = useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{ const root=dialogRef.current!, overlay=root.parentElement!, key=handle+':'+evidence.evidenceId, previous=views.get(key);
  const restore=()=>{if(previous){root.querySelectorAll('details').forEach((d,i)=>{d.open=previous.details[i]??false;});overlay.scrollTop=previous.scroll;(modalFocusables(root)[previous.focus]??title.current)?.focus({preventScroll:true});}else title.current?.focus();};
  restore();const frame=requestAnimationFrame(restore);
  return()=>{cancelAnimationFrame(frame);views.set(key,{scroll:overlay.scrollTop,focus:modalFocusables(root).indexOf(document.activeElement as HTMLElement),details:Array.from(root.querySelectorAll('details')).map(d=>d.open)});};
 },[handle,evidence.evidenceId]); const delta = ['raw_diff', 'manifest_delta'].includes(evidence.kind); const related = [...new Set(r.bundle.changes.filter(c => c.evidenceIds.includes(evidence.evidenceId)).flatMap(c => c.evidenceIds))].filter(id => id !== evidence.evidenceId); return <div className="evidence-overlay" role="dialog" aria-modal="true" aria-labelledby="evidence-title" onKeyDown={e => { if (e.key === 'Escape') {
    e.stopPropagation();
    onClose();
} }}><div className="evidence-dialog" ref={dialogRef}><div className="detail-heading"><h1 id="evidence-title" tabIndex={-1} ref={title}>Evidence / {safe(evidence.kind)}</h1><button onClick={onClose}>Esc · Back</button></div><p className="mono accent">{evidence.evidenceId}</p><Code value={evidence}/>{delta ? <><p className="notice">Recorded enclosing byte spans. These are not a multi-hunk diff or semantic equivalence proof.</p><div className="grid two"><Panel title="Source · recorded span"><EvidencePage key={evidence.evidenceId + 's'} windows={windows} handle={handle} id={evidence.evidenceId} mode="citation" side="source"/></Panel><Panel title="Artifact · recorded span"><EvidencePage key={evidence.evidenceId + 'a'} windows={windows} handle={handle} id={evidence.evidenceId} mode="citation" side="artifact"/></Panel></div><details onToggle={event=>setRawOpen(event.currentTarget.open)}><summary>Raw delta record</summary>{rawOpen&&<EvidencePage key={evidence.evidenceId + 'raw'} windows={windows} handle={handle} id={evidence.evidenceId} mode="record"/>}</details></> : <EvidencePage key={evidence.evidenceId} windows={windows} handle={handle} id={evidence.evidenceId} mode="record"/>}{related.length > 0 && <Panel title="Related evidence / full members"><EvidenceLinks ids={related} onOpen={onOpen}/></Panel>}</div></div>; }
export function Files({ r, onOpen, view, setView, filter, setFilter, status, setStatus, selected, setSelected, page, setPage }: {
    r: InvestigationReport;
    onOpen: (id: string) => void;
    view:FileView;
    setView:(patch:Partial<FileView>)=>void;
    filter: string;
    setFilter: (v: string) => void;
    status: string;
    setStatus: (v: string) => void;
    selected: string;
    setSelected: (v: string) => void;
    page: number;
    setPage: (v: number) => void;
}) { const changes = r.bundle.changes.filter(c => (status === 'all' || c.status === status) && safe([c.artifactPath, c.sourcePath, c.changeId, ...c.notes].join(' ')).toLowerCase().includes(filter.toLowerCase())); const visiblePage=Math.min(page,Math.max(0,Math.ceil(changes.length/40)-1)); const active = changes.find(c => c.changeId === selected) ?? changes[visiblePage*40]; const records=browseFiles(r,view), memberPage=Math.min(view.memberPage,Math.max(0,Math.ceil(records.length/40)-1)); const statuses = [...new Set(r.bundle.changes.map(c => c.status))]; return <><div className="section-intro"><h1>Files & changes <span className="muted">/ {r.bundle.changes.length}</span></h1><p>Browse recorded relationships, artifact/source members and coverage omissions. Generated candidates remain candidates.</p></div><div className="file-controls"><label className="search">Filter changes <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Path, change ID or recorded note"/></label><label hidden={view.mode!=='changes'}>Relationship status <select value={status} onChange={e => setStatus(e.target.value)}><option value="all">all statuses</option>{statuses.map(s => <option key={s}>{s}</option>)}</select></label></div><div className="actions"><button aria-pressed={view.mode==='changes'} onClick={()=>setView({mode:'changes'})}>Change relationships</button><button aria-pressed={view.mode==='members'} onClick={()=>setView({mode:'members'})}>Members and omissions by path</button></div>{view.mode==='members'?<Panel title="Recorded members and coverage omissions"><div className="grid two"><label className="search">Evidence side <select value={view.side} onChange={e=>setView({side:e.target.value,memberPage:0})}><option value="all">All sides</option><option value="artifact">Artifact</option><option value="source">Source</option></select></label><label className="search">Path prefix <input value={view.prefix} onChange={e=>setView({prefix:e.target.value,memberPage:0})} placeholder="packages/shared/"/></label></div><p>{records.length} matching records. An omission can also have retained context bytes; that does not include it in comparison scope.</p>{records.slice(memberPage*40,(memberPage+1)*40).map(record=><article key={record.key} className="member-record"><p><strong>{safe(record.path)}</strong></p><p>{record.side} · {record.kind} · {record.state}</p><p>{safe(record.reason)}</p><EvidenceLinks ids={record.evidenceIds} onOpen={onOpen}/></article>)}{!records.length&&<p>No matching recorded members or omissions. This does not prove complete coverage; inspect Coverage.</p>}<div className="pagination"><button disabled={!memberPage} onClick={()=>setView({memberPage:memberPage-1})}>Previous member page</button><span>{memberPage+1} / {Math.max(1,Math.ceil(records.length/40))}</span><button disabled={(memberPage+1)*40>=records.length} onClick={()=>setView({memberPage:memberPage+1})}>Next member page</button></div></Panel>:<div className="file-workspace"><Panel title={`Changes / ${changes.length} matching`} className="change-list"><div className="change-rows">{changes.slice(visiblePage * 40, (visiblePage + 1) * 40).map(c => <button key={c.changeId} className={'change-row ' + (active?.changeId === c.changeId ? 'selected' : '')} aria-pressed={active?.changeId === c.changeId} onClick={() => setSelected(c.changeId)}><span className="change-status">{c.status}</span><span>{safe(c.artifactPath ?? c.sourcePath ?? c.changeId)}</span><span className="muted">{c.sourcePath && c.artifactPath && c.sourcePath !== c.artifactPath ? safe(c.sourcePath) : c.rawEquality}</span></button>)}</div>{!changes.length && <p className="notice">No matching records.</p>}<div className="pagination"><button aria-label="Previous changes page" disabled={!visiblePage} onClick={() => setPage(visiblePage - 1)}>←</button><span>{changes.length ? `${visiblePage * 40 + 1}–${Math.min((visiblePage + 1) * 40, changes.length)}` : '0'} / {changes.length}</span><button aria-label="Next changes page" disabled={(visiblePage + 1) * 40 >= changes.length} onClick={() => setPage(visiblePage + 1)}>→</button></div></Panel><Panel title="Selected change" className="change-detail">{active ? <><dl><Value label="change ID">{active.changeId}</Value><Value label="status"><Badge>{active.status}</Badge></Value><Value label="source path">{safe(active.sourcePath ?? 'not recorded')}</Value><Value label="artifact path">{safe(active.artifactPath ?? 'not recorded')}</Value><Value label="raw equality">{active.rawEquality}</Value><Value label="explanation strength">{active.explanationStrength}</Value></dl><h3>Recorded notes</h3><Lines values={active.notes}/><h3>Evidence / open exact bytes</h3>{active.evidenceIds.map(id => { const e = r.bundle.evidence.find(e => e.evidenceId === id); return <button key={id} className="evidence-card" onClick={() => onOpen(id)}><span>{safe(e?.kind ?? 'unknown')} <span className="muted">/ {e?.side} / {e?.contentState}</span></span><small>{id} ↗</small></button>; })}</> : <p className="muted">Select a change.</p>}</Panel></div>}</>; }
export function ReportContext({ loaded }: { loaded: Loaded }) {
    const r = loaded.report, a = r.bundle.artifact;
    return <div className="report-strip"><div><span className="eyebrow">SELECTED REPORT</span><h1>{safe(a.packageName ?? a.artifactFilename)}{a.version && <span className="muted">@{safe(a.version)}</span>}</h1><p className="context-digest">{safe(loaded.reportContentRef)}</p></div><div className="replay"><span>SAVED / HISTORICAL</span><small>Captured {safe(a.captureTime)}</small><small>Report {safe(r.reportId)}</small></div></div>;
}
export function App() {
    const [path, setPath] = useState(typeof location === 'undefined' ? '/' : location.pathname);
    const route = destination(path), surface = route.kind === 'home' ? 'home' : route.kind === 'docs' ? 'docs' : 'workspace';
    const navigator = useRef<ReturnType<typeof createNavigator> | null>(null);
    useLayoutEffect(() => { navigator.current = createNavigator(window, setPath); return () => navigator.current?.dispose(); }, []);
    const go = (next: string) => navigator.current?.go(next);
    const [catalog, setCatalog] = useState<CatalogEntry[]>([]), [jobs, setJobs] = useState<JobSnapshot[]>([]);
    const [connection, setConnection] = useState<Connection>('unknown'), [refresh, setRefresh] = useState(0);
    const [handle, setHandle] = useState(''), [loaded, setLoaded] = useState<Loaded | null>(null), [loadedHandle, setLoadedHandle] = useState(''), [error, setError] = useState('');
    const [lastSection, setSection] = useState<Section>('Overview'), [evidenceViews, setEvidenceViews] = useState<Record<string, string[]>>({});
    const evidenceStack = evidenceViews[handle] ?? [];
    const setEvidenceStack = (update: (stack: string[]) => string[]) => setEvidenceViews(views => ({ ...views, [handle]: update(views[handle] ?? []) }));
    const [offsets, setOffsets] = useState<Record<string, number>>({});
    const windows: ByteWindows = { offsets, move: (key, offset) => setOffsets(values => ({ ...values, [key]: offset })) };
    const section = route.kind === 'report' ? route.section : lastSection;
    const [fileViews, setFileViews] = useState<Record<string, FileView>>({});
    const fileView = fileViews[handle] ?? emptyFileView;
    const updateFiles = (patch: Partial<typeof fileView>) => setFileViews(views => ({ ...views, [handle]: { ...fileView, ...patch } }));
    const [jobError, setJobError] = useState(''), [sessionError, setSessionError] = useState('');
    const previousFocus = useRef<HTMLElement | null>(null);
    const evidenceDetails = useRef(new Map<string,EvidenceView>());
    useEffect(() => {
        const changed = (event: Event) => setConnection((event as CustomEvent<Connection>).detail);
        const session = () => { setPath(location.pathname); setRefresh(n => n + 1); };
        window.addEventListener('heurisko-connection', changed); window.addEventListener('heurisko-session', session);
        return () => { window.removeEventListener('heurisko-connection', changed); window.removeEventListener('heurisko-session', session); };
    }, []);
    useEffect(() => {
        const controller = new AbortController(); let timer: ReturnType<typeof setTimeout>;
        async function read() {
            try {
                const [items, executions] = await Promise.all([api<CatalogEntry[]>('observations', controller.signal), api<JobSnapshot[]>('investigations', controller.signal)]);
                if (controller.signal.aborted) return;
                setCatalog(items); setJobs(executions); setConnection('connected'); setJobError('');
                if (executions.some(j => !j.phase.startsWith('settled'))) timer = setTimeout(read, 700);
            } catch (e) { if (!controller.signal.aborted) { setConnection(connectionAfter(e)); setJobError(operationCode(e)); } }
        }
        void read(); return () => { controller.abort(); clearTimeout(timer); };
    }, [refresh]);
    useEffect(() => {
        if (route.kind === 'report') { setHandle(route.handle); setSection(route.section); }
    }, [path]);
    useEffect(() => {
        if (!handle) return;
        const controller = new AbortController(); setError('');
        api<Loaded>('observations/' + handle, controller.signal).then(value => { if (!controller.signal.aborted) { setLoaded(value); setLoadedHandle(handle); } }).catch(e => { if (!controller.signal.aborted) setError(operationCode(e)); });
        return () => controller.abort();
    }, [handle, refresh]);
    const openEvidence = (id: string) => { if (!evidenceStack.length)
        previousFocus.current = document.activeElement as HTMLElement; setEvidenceStack(stack => [...stack, id]); };
    const closeEvidence = () => { setEvidenceStack(stack => stack.slice(0, -1)); if (evidenceStack.length === 1)
        requestAnimationFrame(() => previousFocus.current?.focus()); };
    const evidence = route.kind === 'report' && route.handle === loadedHandle ? loaded?.report.bundle.evidence.find(e => e.evidenceId === evidenceStack.at(-1)) : undefined;
    useEffect(() => { if (!evidence)
        return; const listener = (e: KeyboardEvent) => { if (e.key !== 'Tab')
        return; const dialog = document.querySelector('.evidence-dialog'); const focusable = dialog ? modalFocusables(dialog as HTMLElement) : []; const first = focusable[0], last = focusable.at(-1); if (!focusable.length) { e.preventDefault(); return; } if (e.shiftKey && (document.activeElement === first || document.activeElement?.id === 'evidence-title')) {
        e.preventDefault();
        last?.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
    } }; document.addEventListener('keydown', listener); return () => document.removeEventListener('keydown', listener); }, [evidence?.evidenceId, evidenceStack.length]);
    const openObservation = (next: string) => { setRefresh(n => n + 1); go(reportPath(next)); };
    const onStart = (id: string) => { setRefresh(n => n + 1); go('/workspace/jobs/' + id); };
    const job = route.kind === 'job' ? jobs.find(j => j.id === route.id) : undefined;
    const activeJob = jobs.find(j => !j.phase.startsWith('settled'));
    const reportVisible = route.kind === 'report';
    const selectedReady = reportVisible && route.handle === loadedHandle && route.handle === handle && loaded && !error;
    return <NavigationProvider navigate={go}><AppLink className="skip" href={surface === 'home' ? '#home-content' : surface === 'docs' ? '#docs-content' : '#workspace'}>Skip to content</AppLink><div className="shell" {...(evidence ? { inert: true } : {})}>
    <header className="topbar"><div className="brand"><span className="brand-symbol">[h]</span> HEURISKO <span className="muted version">/ evidence workspace</span></div><div className="local">LOCAL · SHARED ENGINE</div></header>
    <nav className="global-nav" aria-label="Main navigation"><AppLink href="/" aria-current={surface === 'home' ? 'page' : undefined}>Home</AppLink><AppLink href="/docs/start/quickstart" aria-current={surface === 'docs' ? 'page' : undefined}>Documentation</AppLink><AppLink href="/workspace/new" aria-current={surface === 'workspace' ? 'page' : undefined}>Workspace</AppLink></nav>
    <section className="session-status" aria-label="Local workspace connection"><p role="status">Workspace: {connection === 'unknown' ? 'checking connection' : connection} · Jobs and observation handles belong to this process.</p><button onClick={() => { setConnection('unknown'); setRefresh(n => n + 1); }}>Refresh session status</button>{connection === 'unauthorized' && <p>Use the private launch URL printed by this reader to restore access below. A destination URL grants no authority. The capability stays in memory and is lost on reload.</p>}{connection === 'disconnected' && <p>Local reader unavailable or status uncertain. Check that it is still running, then refresh. Reconnect only reads status; it never starts or retries analysis.</p>}{connection !== 'connected' && <><form autoComplete="off" onSubmit={event => { event.preventDefault(); const form = event.currentTarget, launchURL = String(new FormData(form).get('launchURL') ?? ''); form.reset(); try { restoreSession(launchURL); setSessionError(''); } catch { setSessionError('Use the private launch URL for this exact reader address. It is never saved.'); } }}><label>Private launch URL <input name="launchURL" type="password" autoComplete="off" maxLength={2048} required/></label><button type="submit">Connect without leaving this destination</button></form>{sessionError && <p role="alert">{sessionError}</p>}<AppLink href="/docs/troubleshooting/session">Session and reopening help</AppLink></>}</section>
    {activeJob && <p className="notice"><AppLink href={'/workspace/jobs/' + activeJob.id}>Return to job {activeJob.id}</AppLink> · {connection === 'connected' ? activeJob.phase : 'last observed ' + activeJob.phase + '; current status unknown'}</p>}
    {handle && <p className="context-return"><AppLink href={reportPath(handle, section)}>Return to selected report</AppLink></p>}
    <main id="home-content" hidden={surface !== 'home'} tabIndex={-1}><Home catalog={catalog}/></main>
    <main id="docs-content" hidden={surface !== 'docs'} tabIndex={-1}><Documentation doc={route.kind === 'docs' ? route.doc : undefined}/></main>
    <div hidden={surface !== 'workspace'}><nav aria-label="Workspace tasks">{[['new', 'New investigation'], ['open', 'Open evidence'], ['jobs', 'Jobs in this session'], ['reports', 'Reports in this session']].map(([key, label]) => <AppLink key={key} href={'/workspace/' + key} aria-current={route.kind === key || key === 'jobs' && route.kind === 'job' || key === 'reports' && reportVisible ? 'page' : undefined}>{label}</AppLink>)}</nav></div>
    <main id="workspace" hidden={surface !== 'workspace'} tabIndex={-1}>
    <div hidden={route.kind !== 'new'}><Investigation onStart={onStart} active={!!activeJob}/></div>
    <div hidden={route.kind !== 'open'}><OpenEvidence onOpen={openObservation} active={!!activeJob}/></div>
    {route.kind === 'jobs' && <><h1>Jobs in this session</h1><p>No durable history: process restart loses these execution handles. Refreshing reads status only.</p>{jobs.map(j => <p key={j.id}><AppLink href={'/workspace/jobs/' + j.id}>{safe(j.request?.target ?? j.request?.artifact?.filename ?? j.id)}</AppLink> · job {j.id} · {connection === 'connected' ? j.phase : 'last observed ' + j.phase} · started {safe(j.startedAt)}</p>)}{!jobs.length && <p>{connection === 'connected' ? 'No jobs in this process.' : 'Jobs unavailable until the session connects.'}</p>}</>}
    {route.kind === 'job' && (job ? <JobDetail job={job} error={jobError} onCancel={() => { void post<JobSnapshot>(`investigations/${job.id}/cancel`, {}).then(() => setRefresh(n => n + 1)).catch(e => setJobError(operationCode(e))); }}/> : <Panel title="Job unavailable"><p role="status">{connection !== 'connected' ? 'Connect to this reader to read job status.' : 'This job handle does not exist in this process. It may belong to an earlier process; navigation never restarts it.'}</p><AppLink href="/workspace/open">Open saved evidence instead</AppLink></Panel>)}
    {route.kind === 'reports' && <><h1>Reports in this session</h1><p>Admitted observations; opening one makes no fresh registry or provenance check. Content references distinguish captures with the same report ID.</p>{catalog.map(c => <article className="panel" key={c.handle}><div className="panel-body"><AppLink href={reportPath(c.handle)}>{safe(c.artifact.packageName ?? c.artifact.artifactFilename)}@{safe(c.artifact.version ?? '?')}</AppLink><p>{safe(c.reportId)}</p><p>{safe(c.reportContentRef)}</p><p>Captured {safe(c.artifact.captureTime)} · {safe(c.artifact.origin)}</p></div></article>)}{!catalog.length && <p>{connection === 'connected' ? 'No admitted reports. Open saved evidence or start an investigation.' : 'Reports unavailable until the session connects.'}</p>}</>}
    <div hidden={!reportVisible}>
    {selectedReady ? <><ReportContext loaded={loaded}/><ExportActions key={handle} handle={handle} loaded={loaded}/><nav aria-label="Report sections">{reportSections.map(s => <AppLink key={s} href={reportPath(handle, s)} aria-current={section === s ? 'page' : undefined}>{s}</AppLink>)}</nav></> : reportVisible && <Panel title="Report unavailable"><p role="status">{error ? safe(error) : 'Reading selected observation…'}</p><p>Handles expire when the reader restarts. Restore authority with the private launch URL, or explicitly reopen retained report/portable bytes. Validation failures never fall back to an unvalidated report.</p><AppLink href="/workspace/open">Open saved evidence</AppLink></Panel>}
    {loaded && (!reportVisible || selectedReady) && <>{section === 'Overview' && <Overview loaded={loaded} onOpen={openEvidence} onSection={s => go(reportPath(handle, s))}/>}
    <div hidden={section !== 'Files'}><Files r={loaded.report} view={fileView} setView={updateFiles} onOpen={openEvidence} filter={fileView.filter} setFilter={filter => updateFiles({ filter, page: 0, memberPage:0 })} status={fileView.status} setStatus={status => updateFiles({ status, page: 0 })} selected={fileView.selected} setSelected={selected => updateFiles({ selected })} page={fileView.page} setPage={page => updateFiles({ page })}/></div>
    {section === 'Findings' && <Findings r={loaded.report} onOpen={openEvidence}/>} {section === 'Source' && <Sources r={loaded.report} onOpen={openEvidence}/>} {section === 'AI' && <AI r={loaded.report} onOpen={openEvidence}/>} {section === 'Coverage' && <Coverage r={loaded.report} onOpen={openEvidence}/>}</>}
    </div>
    {route.kind === 'missing' && <Panel title="Unknown destination"><p>This location is not a supported application route.</p><AppLink href="/">Go home</AppLink></Panel>}
    </main><footer><span><span className="accent">Tab</span> focus <span className="accent">Enter</span> open <span className="accent">Esc</span> back</span><span>same report · exact bytes · visible unknowns</span></footer></div>{evidence && loaded && <EvidenceDetail key={handle+evidence.evidenceId} handle={handle} evidence={evidence} r={loaded.report} onOpen={openEvidence} onClose={closeEvidence} windows={windows} views={evidenceDetails.current}/>}</NavigationProvider>;
}
