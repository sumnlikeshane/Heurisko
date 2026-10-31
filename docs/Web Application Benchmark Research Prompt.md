# Heurisko production benchmark research prompt

Prepared 1 November 2026, Asia/Kolkata. Use this prompt to extend the evidence-backed research in the [single web gap plan](Web%20Application%20Gap%20Plan.md). This is a research instruction, not authorization to implement, install, publish or change trust semantics. Extend the existing plan rather than creating competing plans.

## Copy-ready prompt

~~~text
Act as a senior product researcher, information architect, documentation lead and developer-tool UX reviewer for Heurisko. Inspect the actual application, benchmark each part against appropriate production counterparts, and produce ONE prioritized implementation gap plan. Research the entire user journey and the connections between surfaces, not only screenshots or individual components.

PRODUCT AND AUTHORITY

Heurisko investigates one exact published package against an immutable source candidate, preserving raw differences, evidence and uncertainty. It is a local-first, account-free TypeScript/Node/React application in apps/web, using the same engine and report as its CLI. The intended structure is a landing page, production-quality sidebar documentation for CLI AND browser use, and a workspace that runs and investigates every currently supported pipeline capability. Preserve the existing terminal-like near-black/monospace/cyan direction.

Read AGENTS.md, docs/WEB_CONTINUATION.md, docs/Web Application Product Scope.md, docs/CLI Reference.md, apps/web/README.md, docs/Web Application Gap Plan.md and current examples/web-investigation receipts. Inspect Git status/diffs and actual apps/web source, CLI parser, core interfaces and report contracts. Preserve unrelated dirty/index work, all historical receipts and the separate TUI worktree. Recheck source hashes and actual adoption status; roadmaps are not evidence of implementation.

The app already has landing/sidebar docs, exact npm/local/archive/source options, shared-engine execution, progress/cancel requests, report/evidence navigation, report/bundle/portable downloads and report/digest/portable reopening. Audit these foundations; do not rebuild them as if absent. The analysis module, genuine inference, provenance verifier, concrete policy evaluator, rebuild and monitor are not integrated. TUI acceptance is separate. Do not manufacture findings or interface-generated engine results.

RESEARCH EACH SURFACE

1. LANDING AND GETTING STARTED
Can a first-time developer understand the problem, actual capabilities, limits and CLI/browser choices? Assess primary action, installation route, honest example/walkthrough, product explanation, credibility, hierarchy, legibility and responsive layout. Does it demonstrate real evidence rather than relying only on prose? Do not require fictional customers, metrics, pricing, accounts or testimonials.

2. DOCUMENTATION
Compare against production command references and task-based documentation, including GitHub CLI and Stripe CLI. Use a framework such as Diataxis to distinguish tutorial, how-to, reference and explanation.
Audit sidebar hierarchy, stable page URLs, breadcrumbs, on-page contents, active location, search across ALL documents, result snippets, anchors, cross-links, previous/next navigation, copyable commands, heading/list/table semantics, mobile navigation and keyboard access.
Verify prerequisites, exact/scoped npm, local source replay/subtrees, inspect/evidence, exit precedence, AI-off/policy limits, imports/exports, sessions/freshness, errors and CI. Separate complete reference CONTENT from a production-quality reading/navigation EXPERIENCE. Inspect whether links navigate and survive refresh/back. Do not propose a published installer that does not exist.

3. WORKSPACE AND PIPELINE
Compare GitHub Actions run/job/log navigation, Socket package/file exploration and Sentry issue/event detail workflows. Official guides establish documented interactions, not personal use of a live console.
Review exact-target entry, explicit file admission, progressive source/options disclosure, validation before upload, input review, scope, AI/policy availability, submission feedback, current job identity, truthful progress/errors, cancel, disconnect, result handoff and repeat investigations.
Can users find earlier jobs from THIS process and distinguish them from saved reports? Does starting a new investigation show an old report's title/export actions? Does navigation hide ongoing work? Does each terminal state have a useful next action?

4. REPORTS, FILES AND EVIDENCE
Review first-result comprehension, independent outcomes, capture/configuration identity, source conflicts, raw changes versus findings, coverage/omissions, next investigative actions, path search, file browsing, selection/pagination, both-side evidence, member navigation, byte ranges, binary/truncated/missing states and nested evidence back behavior.
Can users reach retained records without losing context? Keep facts, hypotheses and unavailable interpretation separate. Never infer line mappings, multi-hunk diffs, normalized equivalence, source proof or conclusions the engine does not supply.

5. SAVE, REOPEN AND PORTABILITY
Can users knowingly choose report JSON, bundle or portable evidence; understand which carries bytes; inspect omissions/notices; reopen; diagnose report-only missing bytes; and distinguish report-content digest, report ID and artifact digest?
Assess filenames/context, preparation feedback, failures, partial transport and native downloads. A prepared download is not proof of saving a file. Do not introduce arbitrary host paths, automatic publication, cloud storage or a fabricated bundle-to-report conversion.

6. WHOLE-APP FLOW AND INFORMATION ARCHITECTURE
Draw the CURRENT journey from code/observation, then recommend ONE target flow.
Separate global Home/Docs/Workspace navigation from workspace New/Open/Jobs/Reports and contextual report Files/Findings/Source/AI/Coverage navigation.
Assess duplicated Help/New/Open entry points, naming, breadcrumbs, context headers, active location, deep links, browser back/forward, reload, new-tab behavior, filter/page/selection/scroll retention and returning from docs without losing work.
Compare the current shell, a workspace-specific sidebar with report context navigation, and a linear wizard. Explain tradeoffs and choose one direction suited to evidence exploration; do not deliver several execution plans.
Landing/docs remain readable without execution authority. Protected workspace routes require the private capability. A URL is not authorization. Do not store capabilities in localStorage, queries, logs, exports or analytics. Reauthorization and service restart need honest recovery states; process-scoped report links are not permanent public sharing links.

7. CROSS-CUTTING QUALITY
Audit empty/loading/partial/failed/invalid/unavailable states and error recovery; accessible names, headings, native links/actions, status announcements, dialog focus, keyboard use, contrast, text size, long paths, data tables, narrow viewport/zoom and reduced motion.
Use W3C guidance with actual checks, not a generic compliance claim. Include 1440/1024/390 widths, 200% zoom and relevant 320-CSS-pixel reflow checks; explicitly handle regions requiring two dimensions.
Review large reports, bounded rendering/search/download memory, races/cancellation, stale selection, identical report IDs with different content/transport context, dependency weight and measurement. Define task-based measurements, not invented scores or unmeasured speed claims. Research does not authorize external analytics, frameworks or dependencies.

EVIDENCE METHOD

Use current primary sources and actual public production pages where accessible. Select counterparts for the task they solve, not brand prestige. Start with references in the current gap plan, verify them, and expand where evidence could change a decision. Record both useful and unsuitable patterns. Do not copy branding or proprietary assets.

For every important claim record exact URL or repo file/symbol/line, date, what was examined and what it supports. Distinguish local source-confirmed behavior; local browser observation; historical executed receipt; retrieved production page content; vendor-documented interaction; researcher inference/proposal; and blocked/untested checks.

Scraped text is not a screenshot; screenshots are not interaction tests; API passes are not GUI acceptance. If a console needs login or local Chrome returns ERR_BLOCKED_BY_CLIENT, record the limit and continue independent research. Do not bypass controls or invent observations. Never submit local capability URLs, private files or confidential paths to external research tools.

Where access/authorization permits, examine: first visit -> CLI setup; first visit -> browser npm investigation; local source replay; incomplete report -> evidence -> back; run A -> docs -> run B -> return to A; invalid target/source; no-report acquisition failure; cancel; disconnect/reconnect to the same process; portable export/import -> same bytes; expired capability/service restart; keyboard-only and narrow-screen versions.
Real engine execution stays within existing authorization and parser/network limits. Never execute target-package code. Retained examples are historical observations, not fresh acquisitions.

DELIVER ONE EXECUTABLE GAP PLAN

Update docs/Web Application Gap Plan.md as the SINGLE execution backlog, including:

A. Findings, current-versus-target journey and proposed sitemap.
B. Counterpart matrix for EVERY surface with cited useful patterns and explicitly rejected unsuitable patterns.
C. Evidence ledger and research/access limits; no made-up overall production-readiness score.
D. Stable gap IDs. Each needs: user problem, current evidence, benchmark/standard, concrete proposed behavior, priority, evidence confidence, affected files/seam, dependencies, risk, qualitative effort, testable acceptance and verification method. Separate confirmed defects, usability hypotheses, blocked browser checks and engine dependencies.
E. ONE dependency-ordered sequence: navigation/session/context, docs/landing, workspace lifecycle, report/evidence/output, final assembled acceptance. Accessibility/security/parity apply to EVERY package, not a late cleanup. Retain lower-priority and engine-dependent scope.
F. Acceptance matrix connecting gap IDs to user journeys, automated checks and actual browser receipts. Preserve CLI/report byte/semantic parity and source/coverage/AI/cancellation limits. Define pass conditions without inventing test results or performance targets.
G. Boundaries for web-only work, reviewed shared-engine/contracts work, and unperformed technology/model/hosting/Git/publication decisions. Research creates the plan; it does not execute it.
H. A concise next implementation prompt executing the FIRST package and then following the SAME backlog. No duplicate roadmap or redesign restart.

Reuse admitted React/TypeScript/engine/reader/components. Do not silently select technology, dependencies, models or hosting. Where a requested view needs missing engine data, name the dependency and honest unavailable state. Monitoring and meaningful model work remain product obligations, never simulations in web.

Update entry-point/handoff documentation to link the one plan and preserve original receipts. Do not commit, push, publish a PR, merge, deploy, submit or send external messages. Finish with key findings, artifact locations, evidence/validation limits and the exact next package.
~~~
