import { AppLink } from './link.js';
import React from 'react';
import type { CatalogEntry } from './api.js';
import { safe } from './api.js';
import { retainedExample as example } from './retained-example.js';
import { reportPath } from './navigation.js';

export function Home({ catalog = [] }: { catalog?: CatalogEntry[] }) {
 const admitted = catalog.find(c => c.reportContentRef === example.reportContentRef);
 return <div className="home">
  <section className="hero home-intro">
   <p className="eyebrow">PACKAGE INTEGRITY, WITH THE EVIDENCE IN VIEW</p>
   <h1>See what shipped.<br/><span className="accent">Understand the differences.</span></h1>
   <p className="hero-description">Compare one exact package release with its source evidence. Follow the changes, inspect the original bytes and keep the limits of the conclusion in view.</p>
   <div className="actions home-actions"><AppLink className="primary" href="/workspace/new">Start an investigation <span aria-hidden="true">→</span></AppLink><AppLink href="/workspace/open">Open saved evidence</AppLink></div>
   <p className="home-setup">New here? <AppLink href="/docs/start/quickstart">Set up your first investigation</AppLink>. Runs locally, using public npm releases or public local archives.</p>
  </section>

  <section className="home-flow" aria-labelledby="home-flow-title">
   <h2 id="home-flow-title">From an exact target to inspectable evidence</h2>
   <ol>{[
    ['Choose the package', 'Use an exact npm version or select an archive. Add a pinned source revision when you have one.'],
    ['Review, then run', 'Check the target and options before one explicit start. Follow the engine’s recorded activity.'],
    ['Investigate the result', 'Read what was established, inspect differences and omissions, then save the evidence you need.']
   ].map(([title, description], index) => <li key={title}><span className="step-index" aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
  </section>

  <section className="home-example" aria-labelledby="example-title">
   <div><p className="eyebrow">READ AN EXISTING OBSERVATION</p><h2 id="example-title">Explore picocolors 1.1.1</h2><p>A public retained example with a source conflict and incomplete analysis. See how a matching archive digest can coexist with unresolved source correspondence.</p><p className="muted">Captured <time dateTime={example.artifact.captureTime}>31 October 2026, 19:00:21 UTC</time>. Reading it does not start a scan or refresh the release.</p>{admitted ? <AppLink className="button" href={reportPath(admitted.handle)}>Open retained example <span aria-hidden="true">→</span></AppLink> : <><AppLink className="button" href="/docs/browser#retained-example">Open the retained example setup <span aria-hidden="true">→</span></AppLink><p className="muted">This reader has not admitted that example. The setup guide gives its exact local report and evidence-store pair.</p></>}</div>
   <dl className="example-summary"><div><dt>Artifact integrity</dt><dd>Matched</dd></div><div><dt>Source association</dt><dd>Ambiguous</dd></div><div><dt>Correspondence</dt><dd>Unresolved</dd></div><div><dt>Analysis</dt><dd>Incomplete</dd></div></dl>
   <details className="example-identity"><summary>Exact retained observation identity</summary><p>Package: {safe(example.artifact.packageName)}@{safe(example.artifact.version)}</p><p>Original report content reference</p><code>{example.reportContentRef}</code></details>
  </section>

  <section className="home-reference" aria-label="Use Heurisko with context"><div><h2>One investigation, across interfaces</h2><p>The browser and CLI use the same engine and immutable report. Start with a guided task or go straight to the exact command reference.</p><div className="actions"><AppLink href="/docs/browser">Browser workspace guide</AppLink><AppLink href="/docs/cli">Complete CLI reference</AppLink></div></div><div><h2>Know what the evidence can establish</h2><p>Source correspondence does not establish harmlessness. Current static evidence and raw comparisons retain conflicts, missing bytes and incomplete stages.</p><p>Analysis, model interpretation, provenance verification, rebuild and monitoring still require shared integrations. <AppLink href="/docs/availability">See current capabilities</AppLink>.</p></div></section>
 </div>;
}
