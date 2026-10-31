// Static render harness for synthetic containment and field-parity tests. Not a server route.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Overview, Findings, AI, Sources, Coverage, ReportContext, Files, EvidenceDetail } from './app.js';
import type { Loaded } from './api.js';
export { safe } from './api.js';
export function renderReport(loaded: Loaded) { const r = loaded.report; const onOpen = () => { }; return renderToStaticMarkup(<><Overview loaded={loaded} onOpen={onOpen} onSection={() => { }}/><Findings r={r} onOpen={onOpen}/><AI r={r} onOpen={onOpen}/><Sources r={r} onOpen={onOpen}/><Coverage r={r} onOpen={onOpen}/></>); }

export function renderContext(loaded: Loaded) { return renderToStaticMarkup(<ReportContext loaded={loaded}/>); }
export { App } from './app.js';
export { Investigation, OpenEvidence, JobDetail } from './investigate.js';

export { Markdown, CodeBlock } from './docs.js';
export { Home } from './home.js';
export { Files, EvidenceDetail };
export { RequestReview, ExportActions } from './investigate.js';
