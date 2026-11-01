import { AppLink } from './link.js';
import React, { useEffect, useRef, useState } from 'react';
import { post, upload, download, safe, type Loaded } from './api.js';
import { reportPath, operationCode } from './navigation.js';
import { validateDraft, draftRequest, errorHelp, type DraftRequest, type InputIssue, type InvestigationFields } from './input-review.js';
import type { JobSnapshot } from '../server/workspace.js';

type ExportKind = 'report' | 'bundle' | 'export';
export function ExportActions({ handle, loaded }: { handle: string; loaded: Loaded }) {
  const [kind, setKind] = useState<ExportKind>('export'), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const artifact = loaded.report.bundle.artifact;
  const choices = {
    report: 'Original report JSON: exact encoded report bytes and evidence references. Reopen with Report JSON. Referenced evidence bytes are not embedded.',
    bundle: 'EvidenceBundle JSON: acquisition and comparison records, without the analysis report or referenced bytes. A standalone bundle cannot be reopened as a report.',
    export: 'Portable evidence: original report, retained bytes within the export limits, and manifest omissions. Reopen with Portable evidence (.heurisko.json).'
  };
  async function save() {
    if (busy) return;
    setBusy(true); setError(''); setMessage('Preparing the selected format…');
    try {
      const name = [artifact.packageName ?? artifact.artifactFilename, artifact.version, artifact.captureTime.slice(0, 10)].filter(Boolean).join('-').replace(/[^A-Za-z0-9._-]+/g, '-').slice(0, 110) || 'investigation';
      await download(handle, kind, name + (kind === 'export' ? '.heurisko.json' : kind === 'report' ? '.report.json' : '.bundle.json'));
      setMessage('Download prepared and requested. Check browser downloads; a filesystem save cannot be confirmed here.');
    } catch (e) { setMessage(''); setError(operationCode(e)); } finally { setBusy(false); }
  }
  return <details className="export-choice"><summary>Save this observation</summary>
    <p>Captured {safe(artifact.captureTime)}. Original report: <code>{safe(loaded.reportContentRef)}</code></p>
    <label className="search" htmlFor={'export-' + handle}>Choose what to save</label>
    <select id={'export-' + handle} value={kind} disabled={busy} onChange={e => { setKind(e.target.value as ExportKind); setMessage(''); setError(''); }}>
      <option value="export">Portable evidence · report and retained bytes</option><option value="report">Original report JSON · references only</option><option value="bundle">EvidenceBundle JSON · comparison records only</option>
    </select><p>{choices[kind]}</p>
    {kind === 'export' && <p className="field-help">100 MiB envelope, at most 64 MiB included blobs. Missing, oversized or unavailable bytes stay explicit omissions. {loaded.transport ? `${loaded.transport.included} included / ${loaded.transport.omitted} omitted in the opened transport; this export checks availability again.` : 'Byte availability is checked while preparing the export.'}</p>}
    <p className="field-help">Capture time, original bytes, digests, omission reasons and rights notices are preserved. Upstream redistribution rights still apply.</p>
    <div className="actions"><button className="primary" disabled={busy} onClick={() => void save()}>{busy ? 'Preparing download…' : 'Prepare download'}</button><AppLink href="/workspace/open">Open a saved export</AppLink><AppLink href="/docs/workflows/portable">Format and reopen guide</AppLink></div>
    <p role="status">{message}</p>{error && <div role="alert" className="notice danger"><p>Download could not be prepared. {errorHelp(error)}</p><details><summary>Diagnostic code</summary><code>{safe(error)}</code></details><p>Choose a format and explicitly prepare it again when ready.</p></div>}
  </details>;
}

export function RequestReview({ draft }: { draft: DraftRequest }) {
  const source = draft.source ? <>{safe(draft.source)}<br/><code>{safe(draft.commit ?? '')}</code></> : draft.kind === 'npm' ? 'Use retained release metadata to look for source candidates.' : 'No source selected. Source correspondence will remain limited.';
  const file = (value: File | undefined) => value ? <>{safe(value.name)} · {value.size.toLocaleString()} bytes</> : 'None selected';
  return <><dl className="request-review review-grid">
    <div className="value"><dt>{draft.kind === 'npm' ? 'Exact release' : 'Artifact archive'}</dt><dd>{draft.kind === 'npm' ? <code>{safe(draft.target ?? '')}</code> : file(draft.artifact)}</dd></div>
    {draft.kind === 'local' && <><div className="value"><dt>Local name / version labels</dt><dd>{safe(draft.name ?? 'Not set')} / {safe(draft.version ?? 'Not set')}</dd></div><div className="value"><dt>Source replay archive</dt><dd>{file(draft.sourceArchive)}</dd></div></>}
    <div className="value"><dt>Source evidence</dt><dd>{source}</dd></div><div className="value"><dt>Package subtree</dt><dd>{safe(draft.subdirectory ?? 'Repository root / resolved context')}</dd></div>
    <div className="value"><dt>Inspection profile</dt><dd>Static retrieval and raw comparison <code>raw-static-s3-v1</code></dd></div>
    <div className="value"><dt>AI request</dt><dd>{draft.enableAI ? 'Requested; product model unavailable.' : 'Off — equivalent to --no-ai.'}</dd></div>
    <div className="value"><dt>Requested policy</dt><dd>{draft.policy ? <>{safe(draft.policy)} · evaluator unavailable; result remains indeterminate.</> : 'None requested.'}</dd></div>
  </dl><p className="field-help">Source overrides and replay remain user asserted, not proof of origin. Local archives retain local-input identity.</p>
    <details className="compact-details"><summary>Technical request details</summary><pre className="raw" tabIndex={0}>{safe(JSON.stringify(draft, (key, value) => key === 'artifact' || key === 'sourceArchive' ? value ? { filename: value.name, bytes: value.size } : value : value, 2), true)}</pre></details>
  </>;
}

type DraftFields = InvestigationFields;
const freshFields = (): DraftFields => ({ target: '', name: '', version: '', source: '', commit: '', subdirectory: '', policy: '', enableAI: true });
const labels: Record<string, string> = { target: 'Exact npm release', artifact: 'Artifact archive', name: 'Local name label', version: 'Local version label', source: 'GitHub source repository', commit: 'Full source commit', subdirectory: 'Package subtree', sourceArchive: 'Source replay archive', policy: 'Requested policy' };

export function Investigation({ onStart, active = false }: { onStart: (id: string) => void; active?: boolean }) {
  const [kind, setKind] = useState<'npm' | 'local'>('npm'), [drafts, setDrafts] = useState({ npm: freshFields(), local: freshFields() });
  const [artifact, setArtifact] = useState<File>(), [sourceArchive, setSourceArchive] = useState<File>();
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [issues, setIssues] = useState<InputIssue[]>([]), [review, setReview] = useState<DraftRequest | null>(null), [uncertain, setUncertain] = useState(false), [activity, setActivity] = useState('');
  const [failedOperation, setFailedOperation] = useState<'admission' | 'start'>('start');
  const [validationAttempt, setValidationAttempt] = useState(0);
  const summary = useRef<HTMLDivElement>(null), reviewHeading = useRef<HTMLHeadingElement>(null), form = useRef<HTMLFormElement>(null), fields = drafts[kind];
  const set = (key: keyof DraftFields, value: string | boolean) => { setDrafts(d => ({ ...d, [kind]: { ...d[kind], [key]: value } })); setIssues(found => found.filter(i => i.field !== key)); };
  useEffect(() => { if (validationAttempt) summary.current?.focus(); }, [validationAttempt]);
  useEffect(() => { if (review) reviewHeading.current?.focus(); }, [review]);
  const issue = (key: string) => issues.filter(i => i.field === key);
  const attrs = (key: string) => ({ id: 'investigate-' + key, 'aria-invalid': issue(key).length > 0 || undefined, 'aria-describedby': 'help-' + key + (issue(key).length ? ' error-' + key : '') });
  const feedback = (key: string, help: string) => <><p className="field-help" id={'help-' + key}>{help}</p>{issue(key).length > 0 && <p className="field-error" id={'error-' + key}>{issue(key).map(i => i.message).join(' ')}</p>}</>;
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || active || uncertain) return;
    setError(''); const draft = draftRequest(kind, drafts[kind], { artifact, sourceArchive });
    const found = validateDraft(draft); setIssues(found); if (found.length) setValidationAttempt(n => n + 1); else setReview(draft);
  }
  function edit() { setReview(null); requestAnimationFrame(() => (form.current?.querySelector(kind === 'npm' ? '#investigate-target' : '#investigate-artifact') as HTMLElement | null)?.focus()); }
  async function confirm() {
    if (!review || active || busy || uncertain) return;
    setBusy(true); setError(''); let starting = false;
    try {
      const { artifact: selectedArtifact, sourceArchive: selectedSource, ...payload } = review, request: Record<string, unknown> = { ...payload };
      if (selectedArtifact) { setActivity('Admitting selected artifact bytes…'); request.artifact = await upload('artifact', selectedArtifact); }
      if (selectedSource) { setActivity('Admitting selected source replay bytes…'); request.sourceArchive = await upload('source', selectedSource); }
      setActivity('Requesting one investigation…'); starting = true;
      const job = await post<JobSnapshot>('investigations', request); setReview(null); setActivity('Investigation accepted.'); onStart(job.id);
    } catch (e) { const code = operationCode(e); setFailedOperation(starting ? 'start' : 'admission'); setError(code); setActivity(''); if (starting && /SERVICE_UNAVAILABLE|TIMEOUT|ABORT/.test(code)) setUncertain(true); }
    finally { setBusy(false); }
  }
  return <><div className="section-intro workflow-intro"><p className="eyebrow">NEW INVESTIGATION</p><h1>{review ? 'Review your investigation' : 'What do you want to investigate?'}</h1><p>Compare one exact artifact with immutable source evidence. Review the request before anything starts.</p></div>
    <ol className="flow-steps" aria-label="Investigation steps"><li aria-current={!review ? 'step' : undefined}>1 · Target</li><li aria-current={review ? 'step' : undefined}>2 · Review</li><li>3 · Run</li></ol>
    {issues.length > 0 && <div ref={summary} tabIndex={-1} role="alert" className="error-summary notice danger"><h2>Check {issues.length === 1 ? 'this field' : 'these fields'}</h2><ul>{issues.map((item, i) => <li key={i}><a href={'#investigate-' + item.field} onClick={e => { e.preventDefault(); const field = document.getElementById('investigate-' + item.field); const details = field?.closest('details'); if (details) details.open = true; field?.focus(); }}>{labels[item.field] ?? item.field}: {item.message}</a></li>)}</ul></div>}
    <form ref={form} onSubmit={submit} noValidate className="panel input-form" hidden={!!review}><h2>Choose your artifact</h2><fieldset disabled={busy || active || uncertain} className="panel-body">
      <label className="search" htmlFor="investigate-kind">Input type</label><select id="investigate-kind" value={kind} onChange={e => { setKind(e.target.value as 'npm' | 'local'); setIssues([]); setError(''); }}><option value="npm">Exact public npm release</option><option value="local">Local tar / tar.gz archive</option></select>
      <div hidden={kind !== 'npm'}><label className="search" htmlFor="investigate-target">Exact npm release</label><input {...attrs('target')} value={drafts.npm.target} onChange={e => set('target', e.target.value)} placeholder="npm:package@1.2.3" maxLength={1024}/>{feedback('target', 'Use npm:name@version or npm:@scope/name@version. Exact versions only; no latest, ranges or private registries.')}<button type="button" className="link" onClick={() => { set('target', 'npm:picocolors@1.1.1'); document.getElementById('investigate-target')?.focus(); }}>Use public example: picocolors@1.1.1</button></div>
      <div hidden={kind !== 'local'}><label className="search" htmlFor="investigate-artifact">Artifact archive</label><input {...attrs('artifact')} type="file" name="artifact" accept=".tar,.tgz,.gz" onChange={e => { setArtifact(e.target.files?.[0]); setIssues(found => found.filter(i => i.field !== 'artifact')); }}/>{feedback('artifact', 'A nonempty tar or tar.gz file, at most 32 MiB. Selection alone sends no bytes. Use public, non-confidential data.')}{artifact && <p className="file-selection">Selected: <strong>{safe(artifact.name)}</strong> · {artifact.size.toLocaleString()} bytes. Kept when switching input type.</p>}
        <div className="grid two"><div><label className="search" htmlFor="investigate-name">Local name label <span className="muted">(optional)</span></label><input {...attrs('name')} value={drafts.local.name} onChange={e => set('name', e.target.value)} maxLength={1024}/>{feedback('name', 'A label for these local bytes, not a registry identity.')}</div><div><label className="search" htmlFor="investigate-version">Local version label <span className="muted">(optional)</span></label><input {...attrs('version')} value={drafts.local.version} onChange={e => set('version', e.target.value)} maxLength={1024}/>{feedback('version', 'Does not establish the origin or version of an official release.')}</div></div>
      </div>
      <details className="compact-details"><summary>Add pinned source evidence <span className="muted">(optional)</span></summary><p>Compare against a specific GitHub commit. A source override helps define the comparison; it does not prove that source produced the artifact.</p>
        <label className="search" htmlFor="investigate-source">GitHub source repository</label><input {...attrs('source')} value={fields.source} onChange={e => set('source', e.target.value)} placeholder="https://github.com/OWNER/REPO" maxLength={1024}/>{feedback('source', 'Pair this URL with a full immutable commit. Leave both blank to use source resolution for npm.')}
        <label className="search" htmlFor="investigate-commit">Full source commit</label><input {...attrs('commit')} value={fields.commit} onChange={e => set('commit', e.target.value)} placeholder="40 lowercase hexadecimal characters" maxLength={40}/>{feedback('commit', 'A full 40-character commit, not a branch or tag.')}
        <label className="search" htmlFor="investigate-subdirectory">Package subtree <span className="muted">(optional)</span></label><input {...attrs('subdirectory')} value={fields.subdirectory} onChange={e => set('subdirectory', e.target.value)} placeholder="packages/shared" maxLength={1024}/>{feedback('subdirectory', 'Relative slash-separated path within the pinned repository. Requires the source URL and commit.')}
        <div hidden={kind !== 'local'}><label className="search" htmlFor="investigate-sourceArchive">Source replay archive <span className="muted">(optional)</span></label><input {...attrs('sourceArchive')} type="file" name="sourceArchive" accept=".tar,.tgz,.gz" onChange={e => { setSourceArchive(e.target.files?.[0]); setIssues(found => found.filter(i => i.field !== 'sourceArchive')); }}/>{feedback('sourceArchive', 'At most 32 MiB. Requires the source URL and full commit; association remains user asserted.')}{sourceArchive && <p className="file-selection">Selected: <strong>{safe(sourceArchive.name)}</strong> · {sourceArchive.size.toLocaleString()} bytes.</p>}</div>
      </details>
      <details className="compact-details"><summary>Requested options and available checks</summary><p>Static acquisition, inventory and raw comparison are available. Deterministic findings depend on this reader's configured analysis module; the report records the module and any unavailable checks. The product model, provenance verifier, policy evaluator, rebuild and monitoring remain unavailable.</p>
        <label className="search" htmlFor="investigate-enableAI">AI request semantics</label><select id="investigate-enableAI" value={fields.enableAI ? 'requested' : 'off'} onChange={e => set('enableAI', e.target.value === 'requested')}><option value="requested">Record an AI request · unavailable</option><option value="off">Do not request AI · --no-ai</option></select><p className="field-help">Default matches the CLI request. Neither choice runs a model here; changing it changes the submitted request only.</p>
        <label className="search" htmlFor="investigate-policy">Requested policy reference <span className="muted">(optional)</span></label><input {...attrs('policy')} value={fields.policy} onChange={e => set('policy', e.target.value)} maxLength={1024}/>{feedback('policy', 'Records a request. Without an evaluator, the policy result remains indeterminate.')}
      </details>
      <p className="field-help">Only confirmation admits selected files to private local workspace storage and starts static inspection. Target scripts and builds do not run. Retained data is not automatically deleted. <AppLink href="/docs/workflows/local">Input and retention details</AppLink></p>
      <div className="actions"><button className="primary" type="submit">Review investigation →</button><AppLink href="/workspace/open">Open existing evidence instead</AppLink></div>
    </fieldset></form>
    {review && <section className="panel" aria-label="Exact input review"><div className="detail-heading"><h2 ref={reviewHeading} tabIndex={-1}>Review exact request</h2><button disabled={busy || uncertain} onClick={edit}>Edit target and options</button></div><div className="panel-body"><RequestReview draft={review}/><p>Confirming admits the selected bytes and starts one shared-engine job. No automatic retries.</p><div className="actions"><button className="primary" disabled={busy || active || uncertain} onClick={() => void confirm()}>{busy ? 'Admitting request…' : 'Confirm and start investigation'}</button><button disabled={busy || uncertain} onClick={edit}>Edit draft</button></div></div></section>}
    {active && <p className="notice">An investigation is active. Your draft is preserved. <AppLink href="/workspace/jobs">Open Jobs</AppLink> to follow it before starting another.</p>}
    <p role="status">{activity}</p>{error && <div role="alert" className="notice danger"><h2>{uncertain ? 'Start acknowledgment was lost' : failedOperation === 'admission' ? 'File admission was not confirmed' : 'Investigation request was not accepted'}</h2><p>{errorHelp(error)}</p>{failedOperation === 'admission' && <p>No investigation start was requested. An unacknowledged upload may already be retained. Your selected files are preserved; confirming again explicitly admits them again.</p>}<details><summary>Diagnostic code</summary><code>{safe(error)}</code></details><AppLink href="/docs/troubleshooting/errors">Troubleshooting</AppLink></div>}
    {uncertain && <div className="notice"><p>The reader may have accepted this request. Check <AppLink href="/workspace/jobs">Jobs in this session</AppLink> and use read-only refresh. Do not send this request again until you have checked the existing jobs.</p><button onClick={() => { setUncertain(false); setError(''); edit(); }}>I checked Jobs — return to draft</button></div>}
  </>;
}

const stageNames: Record<string, string> = { acquire: 'Acquire artifact', source: 'Resolve source', inventory: 'Read archive contents', compare: 'Compare retained bytes', provenance: 'Inspect provenance', heuristics: 'Analyze differences', ai: 'AI interpretation', build: 'Rebuild', policy: 'Evaluate policy' };
export function JobDetail({ job, onCancel, error }: { job: JobSnapshot; onCancel: () => void; error: string }) {
  const active = job.phase === 'running' || job.phase === 'cancel_requested';
  const stages = [...new Map(job.events.map(e => [e.stage, e])).values()], latest = job.events.at(-1);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!active) return; const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, [active]);
  const elapsed = Math.max(0, Math.floor(((job.settledAt ? Date.parse(job.settledAt) : now) - Date.parse(job.startedAt)) / 1000));
  const duration = Number.isFinite(elapsed) ? elapsed >= 60 ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s` : `${elapsed}s` : 'Unavailable';
  const title = job.request?.target ?? (job.request?.name ? `${job.request.name}${job.request.version ? '@' + job.request.version : ''}` : job.request?.artifact?.filename) ?? 'Investigation job';
  const phaseText = { running: 'Running', cancel_requested: 'Cancellation requested', settled_report: 'Report ready', settled_error: 'Stopped without a report' }[job.phase];
  const currentText = job.phase === 'cancel_requested' ? 'Waiting for the engine to settle after the cancellation request.' : job.phase === 'settled_report' ? 'The engine returned a usable report. Read its outcomes and coverage limits.' : job.phase === 'settled_error' ? 'No usable report was returned. Review the diagnostic before another explicit investigation.' : latest ? `${stageNames[latest.stage] ?? latest.stage}: ${latest.status}.` : 'Request accepted; waiting for the first recorded stage fact.';
  return <><div className="section-intro job-heading"><p className="eyebrow">INVESTIGATION JOB</p><h1>{safe(title)}</h1><p className="job-state" role="status">{phaseText}{error ? ' · last observed; current status uncertain' : ''}</p><p>{currentText}</p><p className="field-help">Started {safe(job.startedAt)} · {job.settledAt ? 'Duration' : 'Elapsed'} {duration}{job.settledAt ? ` · settled ${safe(job.settledAt)}` : ''}</p>
    <div className="actions">{job.observation && <AppLink className="primary" href={reportPath(job.observation)}>Open report and evidence →</AppLink>}{active && <button disabled={job.cancellationRequested} onClick={onCancel}>{job.cancellationRequested ? 'Cancellation requested' : 'Request cancellation'}</button>}{job.phase === 'settled_error' && <AppLink className="primary" href="/workspace/new">Review preserved draft</AppLink>}</div></div>
    {job.error && <div role="alert" className="notice danger"><p>No usable report returned. {errorHelp(job.error)}</p><details><summary>Diagnostic code</summary><code>{safe(job.error)}</code>{job.retainedFailureRef && <p>Retained acquisition diagnostic (not a report): <code>{job.retainedFailureRef}</code></p>}</details></div>}
    {error && <div role="alert" className="notice danger"><p>Status uncertain: {safe(error)}. Use the Workspace connection refresh to read status again. This never retries analysis.</p></div>}
    <section className="panel"><h2>Latest observed stage facts</h2><div className="panel-body"><p className="field-help">Stages may overlap. The order below follows first observation; it does not establish a serial execution plan.</p><ol className="job-timeline">{stages.map(event => <li className="job-stage" key={event.stage}><strong>{stageNames[event.stage] ?? safe(event.stage)}</strong><span>{safe(event.status)}</span>{typeof event.totalUnits === 'number' && event.totalUnits > 0 && typeof event.completedUnits === 'number' ? <><progress max={event.totalUnits} value={event.completedUnits} aria-label={stageNames[event.stage] ?? event.stage}/><span>{event.completedUnits} / {event.totalUnits} recorded units</span></> : event.status === 'running' && active ? <><progress aria-label={(stageNames[event.stage] ?? event.stage) + ' in progress'}/><span className="field-help">In progress · no recorded denominator</span></> : null}</li>)}</ol>{!stages.length && <p>No stage event received yet.</p>}
      <p>{job.exitCode === undefined ? 'No final report outcome yet.' : `CLI outcome ${job.exitCode}. ${job.exitCode === 2 ? 'The returned evidence is incomplete or a requested policy is indeterminate.' : job.exitCode === 3 ? 'No usable report was returned.' : 'Read the report for the exact configured result; this is not a harmlessness claim.'}`}</p>
    </div></section>
    <details className="compact-details"><summary>Accepted request and execution details</summary>{job.request && <><h3>Accepted request</h3><pre className="raw" tabIndex={0}>{safe(JSON.stringify(job.request, null, 2), true)}</pre></>}<dl className="review-grid"><div className="value"><dt>Process-local job ID</dt><dd><code>{job.id}</code></dd></div><div className="value"><dt>Recorded state</dt><dd>{job.phase}</dd></div><div className="value"><dt>Cleanup acknowledgment</dt><dd>{job.cleanup}</dd></div><div className="value"><dt>Cancellation requested</dt><dd>{String(job.cancellationRequested)}</dd></div></dl><details><summary>Retained event history ({job.events.length})</summary><ol className="progress-events">{job.events.map(event => <li key={event.sequence}>Event {event.sequence} · {safe(event.stage)}: {safe(event.status)}</li>)}</ol></details>{job.omittedEvents > 0 && <p>{job.omittedEvents} older events omitted.</p>}</details>
    <p className="field-help">Cancellation is a request, not a cleanup guarantee. Closing a tab or navigating away does not cancel. Job handles belong to this process; durable resume is unavailable. <AppLink href="/docs/troubleshooting/session">Job and session help</AppLink></p>
  </>;
}

type OpenKind = 'portable' | 'report' | 'digest';
export function OpenEvidence({ onOpen, active = false }: { onOpen: (handle: string) => void; active?: boolean }) {
  const [reopenKind, setReopenKind] = useState<OpenKind>('portable'), [files, setFiles] = useState<{ portable?: File; report?: File }>({}), [digest, setDigest] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [fieldError, setFieldError] = useState(''), [activity, setActivity] = useState('');
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => { if (fieldError || error) summary.current?.focus(); }, [fieldError, error]);
  async function reopen(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy || active) return;
    setError(''); setFieldError(''); setActivity('');
    const selected = reopenKind === 'digest' ? undefined : files[reopenKind];
    if (reopenKind === 'digest' ? !/^sha256:[a-f0-9]{64}$/.test(digest.trim()) : !selected?.size) { setFieldError(reopenKind === 'digest' ? 'Use a report-content reference: sha256: followed by 64 lowercase hex characters.' : 'Select a nonempty file in the chosen format.'); return; }
    if (selected && selected.size > (reopenKind === 'portable' ? 100 : 8) * 1024 * 1024) { setFieldError(`The selected ${reopenKind === 'portable' ? 'portable file exceeds 100' : 'report exceeds 8'} MiB.`); return; }
    setBusy(true); setActivity('Validating saved observation…');
    try {
      const value = reopenKind === 'digest' ? { digest: digest.trim() } : { upload: await upload(reopenKind, selected!) };
      const result = await post<{ handle: string }>('reopen', value); setActivity('Observation validated. Opening retained evidence.'); onOpen(result.handle);
    } catch (e) { setError(operationCode(e)); setActivity(''); } finally { setBusy(false); }
  }
  const destination = reopenKind === 'digest' ? 'open-digest' : 'open-' + reopenKind;
  return <><div className="section-intro workflow-intro"><p className="eyebrow">OPEN EVIDENCE</p><h1>Continue from retained evidence</h1><p>Open an existing observation without starting an investigation or refreshing registry and provenance checks.</p></div>
    {(error || fieldError) && <div ref={summary} tabIndex={-1} role="alert" className="error-summary notice danger"><h2>{fieldError ? 'Check the selected input' : 'Evidence could not be opened'}</h2>{fieldError ? <a href={'#' + destination} onClick={e => { e.preventDefault(); document.getElementById(destination)?.focus(); }}>{fieldError}</a> : <><p>{errorHelp(error)}</p><details><summary>Diagnostic code</summary><code>{safe(error)}</code></details><p>Your selection is preserved. Check the format and explicitly open the original file again. <AppLink href="/docs/troubleshooting/errors">Error help</AppLink></p></>}</div>}
    <form onSubmit={reopen} noValidate className="panel input-form"><h2>Choose your saved format</h2><fieldset className="panel-body" disabled={busy || active}><label className="search" htmlFor="open-kind">Open method</label><select id="open-kind" value={reopenKind} onChange={e => { setReopenKind(e.target.value as OpenKind); setError(''); setFieldError(''); setActivity(''); }}><option value="portable">Portable evidence file (.heurisko.json)</option><option value="report">Original report JSON</option><option value="digest">Report-content reference in this workspace</option></select>
      {(['portable', 'report'] as const).map(kind => <div key={kind} hidden={kind !== reopenKind}><label className="search" htmlFor={'open-' + kind}>{kind === 'portable' ? 'Portable evidence file' : 'Original report file'}</label><input id={'open-' + kind} aria-invalid={!!fieldError && kind === reopenKind || undefined} aria-describedby={'open-help-' + kind + (fieldError && kind === reopenKind ? ' open-field-error' : '')} type="file" accept=".json" onChange={e => { setFiles(previous => ({ ...previous, [kind]: e.target.files?.[0] })); setFieldError(''); }}/><p className="field-help" id={'open-help-' + kind}>{kind === 'portable' ? 'At most 100 MiB. Carries original report bytes, available retained blobs and explicit omissions.' : 'At most 8 MiB. References bytes in the fixed workspace store; missing blobs remain unavailable. EvidenceBundle JSON is not a report.'}</p>{files[kind] && <p className="file-selection">Selected: <strong>{safe(files[kind]!.name)}</strong> · {files[kind]!.size.toLocaleString()} bytes.</p>}</div>)}
      <div hidden={reopenKind !== 'digest'}><label className="search" htmlFor="open-digest">Report-content reference</label><input id="open-digest" value={digest} onChange={e => { setDigest(e.target.value); setFieldError(''); }} aria-invalid={!!fieldError && reopenKind === 'digest' || undefined} aria-describedby={'open-help-digest' + (fieldError && reopenKind === 'digest' ? ' open-field-error' : '')} placeholder="sha256:…" maxLength={71}/><p className="field-help" id="open-help-digest">Use the original report-content reference, not its report ID or artifact digest. It must already exist in this reader's fixed workspace store.</p></div>
      {fieldError && <p id="open-field-error" className="field-error">{fieldError}</p>}
      <p className="field-help">Use public data. Opening a file admits its bytes to local workspace storage; retention is not automatic deletion. A process restart loses old handles. Reopen the file/reference, or start the reader with an explicit matching report/store pair. <AppLink href="/docs/workflows/portable">Format and reopening details</AppLink></p><div className="actions"><button className="primary" type="submit">{busy ? 'Validating observation…' : 'Open validated observation'}</button><AppLink href="/workspace/reports">See admitted reports</AppLink></div></fieldset></form>
    {active && <p className="notice">Wait for the active investigation to settle before admitting another observation. Your file selections stay here. <AppLink href="/workspace/jobs">Open Jobs</AppLink></p>}<p role="status">{activity}</p>
  </>;
}
