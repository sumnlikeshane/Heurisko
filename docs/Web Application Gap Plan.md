# Heurisko web application gap plan

**Prepared:** 1 November 2026, Asia/Kolkata. **Status:** W0/W1 retained; W2–W4 implemented locally and W5 non-GUI validation executed against active web/reader checks and a fixed current-source engine/CLI assembly. Actual browser acceptance remains blocked; G19 stays separate. **Authority:** Shane requested production-counterpart research across the landing page, documentation, workspace and whole-app flow, followed by one execution plan. The research request authorized planning only. Shane subsequently instructed “Execute the gap plan, starting with W0 and W1,” authorizing this local implementation/validation. Shane subsequently authorized “W2, W3 and W4, followed by W5 validation” as one substantial local batch. Git/publication/deployment remain unauthorized. Product models: none. Coding assistance: Codex.

This is the **single improvement backlog** for the existing app. The [product scope](Web%20Application%20Product%20Scope.md) continues to own product requirements; this plan orders their UX improvements. The [reusable research prompt](Web%20Application%20Benchmark%20Research%20Prompt.md) extends this same backlog. The [continuation handoff](WEB_CONTINUATION.md) owns operational state. Historical implementation plans/receipts remain unchanged.

## 1. Findings and evidence boundary

The foundation works through the shared engine. The largest confirmed experience gaps concern navigation, documentation structure, job/report context and continuity between tasks. Improve these before changing decorative styling.

The current sidebar makes the reference readable, but the docs are still three large documents with section filtering. The current workspace runs real jobs, but creation, reopening, current-job status and an older selected report share one screen context. These distinctions matter more than whether a production counterpart uses the same colors.

**Research performed:** read actual web components, service/workspace, transport/build tooling, CLI parser and prior receipts; retrieved official production pages/guides and W3C guidance. Public GitHub Actions page content and command/documentation navigation were accessible. The [source/evidence record](_evidence/web-benchmark-2026-11-01.json) pins examined local source and records access limits.

**Research limits:** no new local GUI walkthrough, screenshot audit, user study, engine run or product test was performed in this research session. Earlier [validation](../examples/web-investigation/validation.json) records 23 web, 24 reader, 115 core checks and real API/CLI parity, while local Chrome was blocked before rendering. Those are historical passes, not new passes or proof of production UX. Firecrawl returned insufficient credits; collection continued with standard web retrieval. Direct Sentry retrieval failed; its indexed official documentation supplied descriptive evidence only. Socket's actual picocolors version view was inaccessible; its official package-search guide is the supported interaction reference. No authenticated production console was operated.

Evidence labels used below:

- **C — code-confirmed:** a behavior/absence is established in the pinned source.
- **H — historical receipt:** executed at the earlier source-bound checkpoint.
- **D — documented counterpart:** a vendor describes an interaction; it was not personally exercised.
- **P — retrieved page:** page content/navigation was retrieved, not a visual interaction audit.
- **U — untested:** requires actual browser/assistive-technology/user observation.
- **R — recommendation:** a design inference to validate, not a measured usability result.

No numeric readiness score, user-friction percentage or delivery estimate is claimed.

## 2. Production counterparts and what to adopt

These are task-specific references, not claims that a single competitor is universally best. References were retrieved or inspected through indexed official content on 1 November 2026. No assets, branding, commercial claims or product semantics are adopted.

| Ref | Heurisko surface and production counterpart | Supported pattern and adaptation | Limits and rejected copying |
|---|---|---|---|
| B01 | CLI docs: [GitHub CLI command manual](https://cli.github.com/manual/gh_run_view) | P: command-specific URL, syntax, options, output fields, examples and related-command navigation. Give analyze/inspect focused pages while retaining exact parser coverage. | Its extensive command tree would overwhelm a two-command product. Do not copy its commands, flags or installation model. |
| B02 | Getting started: [Stripe CLI entry](https://docs.stripe.com/stripe-cli) | P: explicit setup/start and complete-reference entry points. Separate learning the tool from looking up a flag. | Retrieved text, not a sidebar/visual audit. Stripe's installer, agents, sandbox and accounts are not Heurisko capabilities. |
| B03 | Documentation architecture: [Diataxis](https://diataxis.fr/application/) | P: distinguish guided learning, task instructions, technical reference and conceptual explanation. Apply to current CLI/browser content. | A documentation framework, not proof that a specific layout is best or a dependency to install. |
| B04 | Workspace navigation: [GitHub Actions run listing](https://github.com/cli/cli/actions) | P: separate workflow/run navigation, searchable run list and status metadata. Use a bounded list of this process's jobs and admitted reports. | No authenticated run-detail interaction; no claim of using its auto-refresh. Do not add a registry monitor, durable queue, cloud accounts or automatic reruns. |
| B05 | Execution inspection: [GitHub run logs](https://docs.github.com/en/actions/how-tos/monitor-workflows/use-workflow-run-logs) | D/P: run -> job -> step/log, failure inspection and location-specific references. Separate job execution from report assessment. | Heurisko has stage facts, not equivalent raw build logs. Add no fake logs, successful cleanup, elapsed-time percent estimate or unsupported retry. |
| B06 | Evidence workspace: [Socket package search guide](https://docs.socket.dev/docs/package-search) | D/P: package/version context, distinct overview/alerts/files and package-file exploration. Keep exact artifact identity visible through exploration. | Actual picocolors page inaccessible. Reject aggregate safety scores, unsupported ecosystem search, whole-dependency coverage and copied malware verdicts. |
| B07 | Landing: [Socket product homepage](https://www.socket.dev/) | P: explicit product entry, documentation/resources and concrete product explanation. Demonstrate Heurisko with lawful real retained evidence and clear next actions. | No visual measurement performed. Do not borrow its marketing promises, logos, scale metrics, customers, live-threat feed or hosted conversion funnel. |
| B08 | Contextual investigation: [Sentry Issue Details guide](https://docs.sentry.io/product/issues/issue-details/) | D: contextual header, selected-event detail, search-scoped data and related evidence support clear investigation context. Bind each Heurisko view to its selected report/job. | Indexed documentation only; direct fetch failed. Do not transplant issue resolution, AI, public sharing, user-impact counts or source line inference. |
| B09 | Navigation semantics: [WAI link pattern](https://www.w3.org/WAI/ARIA/apg/patterns/link/) | P: native anchors provide resource-navigation behavior. Use links for destinations and buttons for actions. | Guidance is not an accessibility certification. Same-page disclosure/actions can remain buttons. |
| B10 | Evidence overlays: [WAI modal dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) | P: contained focus, inert background, Escape and logical focus restoration. Test actual nested evidence navigation. | Existing implementation already attempts these. Verify actual behavior; do not declare a defect or compliance from a selector alone. |
| B11 | Responsive/zoom: [W3C reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | P: examine 320-CSS-pixel equivalent reflow and explicit two-dimensional data regions alongside the existing viewport/zoom matrix. | Informative understanding guidance; a narrow screenshot alone does not establish complete WCAG conformance. |
| B12 | Async feedback: [W3C status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | P: announce relevant progress/results without requiring a focus jump. Make errors and recovery understandable. | Do not announce every polling event or continuously steal focus. Existing role=status/alert behavior needs browser/AT testing. |

## 3. Current flow and recommended target

### Research-baseline flow (historical, superseded by execution checkpoints)

[App](../apps/web/src/app.tsx), [docs](../apps/web/src/docs.tsx), [investigation](../apps/web/src/investigate.tsx) and [API bootstrap](../apps/web/src/api.ts) establish:

1. Home is the default React state. Global buttons change Home/Docs/Workspace state without destination URLs or browser-history entries.
2. Docs have three document buttons, a search over the selected document and positional section anchors. Internal Markdown links become plain text.
3. Workspace defaults to Investigate. A previously loaded report still drives the title, capture notice and export actions around the new-input/progress screen.
4. The Investigate section holds new-analysis form, latest job and reopen form. Report tabs also include Investigate and Help. Global documentation and local Help are separate instances.
5. Successful job -> explicit Open report -> overview -> files -> modal evidence -> nested evidence/back. The file filter/selection live in App; file-list page lives in Files. Changing report resets filters/selection, and unmounting Files loses its page.
6. On reload, the capability is lost and the original launch URL must be reopened. Job UI selects only the latest server job. A failed poll stops that polling loop. None of this is durable job resume.

### Chosen direction

Keep **Home / Documentation / Workspace** as the small global navigation. Within Workspace use a local task navigation for **New investigation / Open evidence / Jobs in this session / Reports in this session**. Show report sections only when an actual report is selected. Give a selected job its own execution context. Documentation has its own sidebar and should not be another report tab.

This is an R recommendation based on source-confirmed context collisions and the references above. It needs actual task validation; no claim of mathematically optimal navigation is made.

| Direction considered | Assessment |
|---|---|
| Keep the current mixed creation/report tabs | Small change, but preserves ambiguous old-report identity, duplicated Help and weak job discoverability. |
| Global shell + contextual workspace navigation | **Selected:** separates product learning, execution and evidence investigation while reusing existing components. Collapse local navigation on narrow screens. |
| One linear input/progress/result wizard | Useful for initial creation, but too restrictive as the entire app: investigators need repeated file/evidence exploration and return to prior reports. Use a short review step within New, not a global wizard. |

Proposed destination grammar is a web implementation detail, not an expanded file/authorization API:

~~~text
/                                      Home
/docs/start/quickstart                  Guided first use
/docs/cli/analyze                       Current analyze reference
/docs/cli/inspect                       Current inspect reference
/docs/workflows/...                     npm/local/reopen/export/CI tasks
/docs/concepts/...                      Identity, evidence, limits
/docs/troubleshooting/...               Actionable errors/setup/session
/workspace/new                         New analysis and review
/workspace/open                        Selected report/portable/digest open
/workspace/jobs                        This-process execution list
/workspace/jobs/:opaqueJobId            Selected execution detail
/workspace/reports                     This-process admitted observations
/workspace/observations/:opaqueHandle/:section
                                       Selected immutable report context
~~~

Use browser history and native links, with a tightly allowlisted HTML fallback for these UI routes. Do not map routes to host files. Consume the launch capability separately from the navigation location, keep it only in memory, and require it on every protected request. A deep link without authority shows a recovery state, never a bypass. Opaque job/observation URLs expire with the process; explain that and offer explicit portable/content-reference reopening. Do not silently rerun analysis on navigation or form prefill.

Target journeys: first visit -> quickstart OR explicit new investigation; New -> review -> selected job -> selected report -> evidence -> original context; Docs -> return to active job/report; Jobs/Reports -> select prior context; Report -> export choice -> native download -> explicit reopen/import -> same original report bytes.

## 4. Evidence-backed gap backlog

Priority: **P0** blocks credible acceptance or risks confusing evidence identity; **P1** is necessary for the production task experience; **P2** is useful after the main flow works. Effort S/M/L describes relative scope, not hours. Risk is change risk, not package severity. All items began open at research baseline. The execution checkpoint below is the current status; acceptance text describes requirements, not an automatic pass.

### G01 — Establish an observable browser baseline

**P0; H/U; effort S unless environment remains blocked; risk low.** Earlier Chrome returned ERR_BLOCKED_BY_CLIENT. API/CLI passes do not cover GUI navigation, visual layout or focus. Evidence: [validation](../examples/web-investigation/validation.json); B10–B12.

**Change:** access the actual locally served app using supported browser tooling, without weakening security. Record browser/platform, viewport, build/source identity and actual task observations. If blocked, retain the blocker and continue independent packages without upgrading GUI acceptance.

**Files/seam:** new, separately named acceptance receipts; no engine change. **Depends:** none. **Accept:** actual Home -> Docs -> Workspace -> retained report -> evidence baseline, or a concrete blocked record; screenshots and keyboard results identify what was really observed. Never overwrite historical receipts.

### G02 — Make navigation addressable and preserve context

**P0; C/R; effort M; risk medium.** App state controls destinations; the bootstrap removes any initial hash and retains no route. Browser back/deep-link behavior is absent from this navigation model. Evidence: App lines 90–115, API lines 53–61; B01/B04/B09.

**Change:** implement the chosen destination model with stable document slugs, browser history, active location, valid/expired routes and state restoration. Retain filter, file page, selection, evidence offset and return context per observation. Never persist a capability to achieve this.

**Files:** app.tsx, api.ts, service.ts allowlisted UI routes, relevant state components/tests. **Depends:** baseline record G01. Specify draft/job/report context during W1 design, then implement G06 on the route foundation. **Accept:** forward/back and direct docs links work; protected direct routes fail closed without a capability; reconnecting explicitly restores a same-process destination; reload/restart never auto-analyzes; filters/selection/byte offset survive the defined return journey.

### G03 — Turn document containers into a documentation information architecture

**P1; C/R; effort M; risk low.** Documentation selects three large Markdown sources and positional H2 chunks; all heading levels render as h3 and local links render as spans. Evidence: docs.tsx lines 4–36, build.mjs lines 15–21; B01–B03/B09.

**Change:** a deterministic build-time page manifest with named groups: Start, CLI reference, Browser workflows, Concepts, Troubleshooting, Availability. Reuse the canonical content without duplicating parser semantics. Resolve approved internal page/anchor links; retain correct heading/list/table structure, on-page contents and contextual next/previous links.

**Files:** docs.tsx, build.mjs, existing docs/content sources, focused documentation tests. **Depends:** G02 route/slug contract. **Accept:** analyze/inspect and every current flag/default/restriction remain covered; setup -> first task -> reference -> troubleshooting is navigable; all declared internal links/anchors resolve; semantic headings/lists are preserved; unsafe HTML/links remain inert.

### G04 — Search and operate documentation by task

**P1; C/R; effort M; risk low.** Search currently filters sections only in the selected document; there are no cross-document result snippets or code-copy controls. Evidence: docs.tsx; B01–B03/B12.

**Change:** search all admitted documentation pages, show page/section title and matched context, navigate to the match, preserve query/back state, and expose selectable/copyable code with honest clipboard success/failure. A small locally built index is sufficient unless measurement shows otherwise.

**Files:** docs.tsx, build/content manifest, style.css and relevant tests. **Depends:** G03. **Accept:** queries for a flag, error code, local replay and exit 2 find the appropriate page across groups; empty/no-result/error cases are useful; keyboard selection reaches the match; copied text is exact and no copied command executes.

### G05 — Make learning and reference content distinct

**P1; C/R; effort M; risk low.** Full option reference exists, but the browser loads repository prose wholesale; a complete flag inventory does not establish successful first use. Evidence: CLI Reference, app README, docs build selection; B01–B03.

**Change:** short guided CLI and browser first investigations, followed by goal-oriented npm/local/replay/evidence/CI/portable guides. Explain expected useful incomplete results, exact bytes, output formats, session lifetime and unavailable model/policy behavior. Keep the current parser as authority. Make browser error/help links open the relevant page.

**Files:** canonical docs, page manifest and contextual links. **Depends:** G03. **Accept:** each guide has prerequisites, concrete supported steps, expected output/state, limits and a next task; command examples are source-checked and any newly executed examples get new receipts. No npx/published-install claim, unknown command or promised inference.

### G06 — Bind the header and actions to the thing being viewed

**P0; C/R; effort M; risk medium.** App derives artifact header and export controls from loaded report even while Investigate displays a different draft/job. Evidence: app.tsx lines 113–115; B06/B08.

**Change:** distinct draft, selected job and selected report contexts. New shows its draft/input; job detail shows its actual accepted target/options; report detail shows original artifact/content/configuration identity and report exports. Global progress can point to the active job without relabeling an old report.

**Files:** app.tsx, investigate.tsx, workspace transport snapshots if accepted-target summary is needed. **Depends:** chosen navigation G02; no G0 change required for mutable UI/job metadata. **Accept:** open report A, start job B, visit docs, return to A/B: every title/action targets the correct object; no export button beside a new draft appears to export that draft; same report ID with different content/transport remains distinguishable.

### G07 — Validate and review input before committing local admissions

**P1; C/R; effort M; risk medium.** submit uploads selected archives before server prepare validates the full source/options combination. Generic exception codes feed one message area. Evidence: investigate.tsx lines 20–36 and workspace.prepare; B02/B05/B12.

**Change:** client-side convenience validation for exact/scoped target, source/commit pairing, subtree/replay applicability, filenames/sizes and labels, followed by a compact review of the actual request. Keep server/core validation authoritative. Group optional source/advanced fields without hiding their meaning. Show AI/policy requests separately from availability.

**Files:** investigate.tsx, reusable pure validation/admission seam and tests. **Depends:** G06. **Accept:** invalid source pairing is detected before upload where determinable; errors identify affected fields and recovery; review matches accepted input/options; local origin remains local; rejected requests start no engine job; no browser-provided path/module/network override reaches core.

### G08 — Show execution as a first-class workspace context

**P1; C/R; effort M; risk medium.** Progress is a growing event list within the input/reopen screen; it is only visible there. Existing snapshots contain actual stage facts. Evidence: investigate.tsx, workspace.ts; B04/B05/B12.

**Change:** selected-job detail with latest known stage states, bounded expandable event history, start/settled times and a concise active-job indicator while using docs/reports. Preserve repeated stage events in details rather than turning them into invented percentages. Distinguish request accepted, running, cancellation requested, settled report and no-report error.

**Files:** investigate.tsx, app shell, job presentation/tests. **Depends:** G06/G07. **Accept:** leaving the job page does not imply cancel/complete; indicator returns to the same job; all terminal results have a valid report or diagnostic/recovery action; request cancellation remains distinct from cleanup acknowledgment; no fake ETA/progress percentage.

### G09 — Expose existing session jobs and controlled reconnection

**P1; C/R; effort M; risk medium.** GET investigations lists this-process jobs, but UI chooses only jobs.at(-1). A poll failure stops polling and directs a full reopen. Evidence: investigate.tsx lines 12–19; service.ts lines 109–112; B04/B05.

**Change:** browse/select existing session jobs and admitted reports using opaque IDs; expose explicit status-refresh/reconnect using read-only GETs. Keep process lifetime visible. Where needed, add bounded sanitized accepted-request summaries to mutable snapshots; do not add target paths or immutable-report fields.

**Files:** investigate.tsx, app.tsx, workspace.ts transport metadata/tests. **Depends:** G02/G06/G08. **Accept:** a failed older job remains discoverable after a later job; re-reading status cannot start/retry analysis; reconnect discovers actual terminal state; process restart explains missing job handles and offers saved-evidence reopening. Durable jobs, leases/recovery and automated retry remain separate dependencies.

### G10 — Give reports an evidence-grounded first screen

**P1; C/R; effort M; risk medium.** Overview already displays independent outcomes and honest limitations; it leads with many raw identifiers/counts and requires users to interpret their significance. Evidence: Overview/reportFacts; B06/B08.

**Change:** a concise deterministic reading guide: exact subject/source context, which checks ran, what remains unresolved and which actual evidence/coverage panel to inspect next. Use only recorded facts and existing engine outcomes. Keep raw IDs and six independent dimensions available.

**Files:** app.tsx Overview or extracted presentation components, unchanged reader facts. **Depends:** G06. **Accept:** historical ambiguous source, local input, incomplete heuristics and requested-policy indeterminate cases each show the correct limit and an actual next evidence destination. Zero findings never becomes clean; no new severity/verdict/model prose is synthesized.

### G11 — Improve file exploration without inventing analysis

**P1; C/R; effort M; risk medium.** Files is a filtered flat change list with 40-row pagination; page state is local to Files. Full inventories/excluded members are not a unified browsing surface. Evidence: Files in app.tsx and report evidence/coverage; B06/B08.

**Change:** path-oriented browsing over actual retained member/relationship records, explicit artifact/source side and inclusion/omission context; retain a flat accessible search result mode. Keep selection within filtered results or explicitly label an out-of-filter selection. Preserve page/scroll when navigating away/back. Offer recorded full members directly.

**Files:** Files presentation/state, existing reader data, tests. **Depends:** G02/G10. **Accept:** a file on a later page survives evidence/docs round-trip; excluded source context remains visible as excluded; full member and delta point to the correct evidence IDs; no generated-file exception, inferred line numbers or semantic diff is introduced.

### G12 — Validate evidence navigation and focus as a complete journey

**P0 for acceptance; C/U; effort M; risk medium.** Evidence already uses an inert shell, focus trap and explicit back stack. Hidden details and nested byte-page return behavior need browser checks; their correctness cannot be inferred from querySelectorAll alone. Evidence: EvidenceDetail/EvidencePage and focus handler; B10/B11.

**Change:** preserve evidence side, record/citation mode, byte page and origin selection across nested navigation; test actual focusable elements including closed details and disabled buttons. Make close/back and displayed-versus-recorded range clear.

**Files:** app.tsx evidence components/state, focused browser/reader tests. **Depends:** G02/G11 and browser access for acceptance. **Accept:** keyboard-only file -> delta -> related full member -> back restores the prior byte window and selection; Escape and focus return are correct; no hidden/outside control receives modal focus; inert/binary/missing/hash-failure states remain exact.

### G13 — Make output choice and reopening understandable

**P1; C/R; effort M; risk medium.** Correct output/import APIs exist, but format choice and result feedback are spread between report actions, notices and a distant reopen form. Download helper cannot attest to a filesystem save. Evidence: ExportActions, upload/download helpers and portable transport; B05/B06.

**Change:** a contextual export choice explaining report vs bundle vs portable bytes, original content reference, partial omissions/rights and size limits; a separate Open evidence task with relevant validation/recovery. Show download preparation success, not an invented save acknowledgment.

**Files:** investigate.tsx/api.ts presentation, existing transport metadata/service seams. **Depends:** G02/G06/G10. **Accept:** users can identify which output carries evidence; portable import retains original report bytes and omissions; report-only missing bytes have a clear next step; corrupt/wrong-format inputs explain failure without fallback; no arbitrary file paths, silent replacement or bundle-to-report fabrication.

### G14 — Separate session, transport and engine errors

**P0; C/R; effort M; risk medium.** Public landing/docs can display while hidden workspace requests fail. Poll errors, form/import failures and capability/service failure share limited presentation. Evidence: App effects, Investigation.error, api helpers; B05/B12.

**Change:** clear connected/unauthorized/disconnected/unknown workspace status, scoped field/job/import errors and action-oriented troubleshooting links. Preserve drafts while showing actual status uncertainty. Restore authority only through the existing private launch URL; never echo a token into an error or exported diagnostic.

**Files:** api.ts, shell, investigation/docs links, tests. **Depends:** G02. **Accept:** denied capability, stopped reader, failed acquisition, invalid upload and incomplete report remain distinguishable; reconnect does not resubmit; public docs still work without authority; no token/path leakage; unknown state never shows completed/clean.

### G15 — Make the landing page demonstrate the product and lead somewhere specific

**P1; C/R; effort S–M; risk low.** Home has purpose/limits/CTAs but no actual retained-report walkthrough and its docs action always enters the generic documentation view. Evidence: home.tsx; B02/B07.

**Change:** concise first-use paths, an annotated lawful retained example with its real capture/limitations, and targeted Quickstart/Start/Open actions. Maintain an obvious primary action and clear CLI/browser choices. Keep technical resource details in docs unless needed for a decision.

**Files:** home.tsx, docs/route links, small retained-example presentation. **Depends:** G02/G05; reuse the existing report view for the example, then incorporate G10 when available. **Accept:** first visit can reach setup or exact-target entry directly; example is explicitly retained/incomplete and opens only admitted evidence when authorized; no fake outcomes, customers, metrics, model use or automatic analysis.

### G16 — Apply accessible responsive structure throughout

**P1; C/U; effort M; risk medium.** Existing responsive CSS/native controls are a foundation; exact viewport, zoom and full keyboard acceptance remain unverified. Docs flatten heading levels and source minified layout makes visual conclusions inappropriate. Evidence: style.css, docs.tsx and prior receipts; B09–B12.

**Change:** consistent heading/action hierarchy, compact responsive navigation, meaningful accessible names for arrow controls, visible focus, long-path/digest handling, status announcements and reduced-motion behavior where animation exists. Preserve the terminal preference without using tiny monospace for every explanatory paragraph.

**Files:** affected components and style.css across every package. **Depends:** begins with G02; final proof after G12. **Accept:** actual 1440/1024/390, 200% zoom and relevant 320-CSS-pixel reflow tasks; no obscured action/focus or unintended whole-page horizontal reading; explicit bounded two-dimensional evidence/table regions; usable keyboard and sampled screen-reader flow. Claim only what was tested.

### G17 — Measure large-report and interrupted-operation behavior

**P2 before broad release; C/U; effort M; risk medium.** Reader/server/transport have explicit limits and corpus tests; no product responsiveness or memory target was measured. Evidence: app README, B2/B3R corpus and current tests.

**Change:** measure search/filter/navigation/render/download/import on actual corpus and near-limit harmless data, recording platform and sizes. Inspect stale response races, repeated selection, unmounted requests and output memory. Optimize only demonstrated bottlenecks within admitted technology.

**Files:** app state/API, existing reader/transport, new bounded checks. **Depends:** the feature being measured is stable. **Accept:** reproducible measurements, bounded inputs, no stale result replacing current selection, no hang from cancellation/disconnect, explicit limit failures, and any agreed responsiveness target tested. No invented speed promises, external analytics or speculative framework migration.

### G18 — Close the assembled quality gate and keep docs synchronized

**P0 final acceptance; H/U; effort M; risk medium.** Existing tests prove important engine/reader/security behavior but not the target flow. One pre-existing handoff anchor is broken. Evidence: current validation/continuation.

**Change:** task-based assembled acceptance, exact CLI/browser parity, internal docs route/link/anchor checks, and new source-bound receipts. Fix the owning documentation heading/anchor without editing historical outputs. Keep parser/CLI documentation coverage and unsafe-content/security regressions.

**Files:** web tests/tooling, new receipts, current docs; tests appropriate to changed seams. **Depends:** all relevant P0/P1 packages and G01 browser access. **Accept:** matrix in section 6 passes or clearly records unresolved blocks; source/build hashes match; no old receipt rewritten; no failing check described as passed; shared/remote review and publication remain separate.

### G19 — Preserve genuine engine and broader-product dependencies

**Dependency track, not a web-only fix; H/C; effort unknown; risk high if bypassed.** No adopted heuristic/build/normalized analysis, genuine inference, verifier/policy evaluator or monitor/runner exists in this path. Mandatory TUI acceptance is separate. Evidence: core module boundaries, CLI reference, approved scope and receipts.

**Change:** define integration acceptance against actual supplied report/evidence and admitted module identities when the responsible lane provides them. Render honest unavailable states until then. Keep optional registry discovery, explicit richer file/store grants, durable history/recovery, later PyPI/lockfile/compare/SARIF and hosted features in scope history, not the immediate UX package.

**Files:** reviewed shared-engine/contracts/adapters only when separately scoped; browser consumes one report. **Depends:** corresponding adopted implementation, policy/license/security review and real fixtures. **Accept:** actual engine-produced evidence/citations across interfaces, real model and monitoring demonstrations where required; no synthetic fixtures counted as adoption, no independent web verdicts. This plan does not authorize those integrations.

## 5. One dependency-ordered execution sequence

Each package includes its own accessibility, security, trust and parity checks. The final package assembles those checks; it is not the first time they should be considered. Do not start simultaneous competing redesigns or introduce dependencies to implement a navigation convention.

| Package | Gap IDs and scope | Completion boundary |
|---|---|---|
| W0 — Record baseline and acceptance access | G01; verify current source/receipts and reproduce actual browser access limits | New observed/blocked baseline, known test/data matrix. Continue independent work if GUI is blocked, with acceptance explicitly open. |
| W1 — Navigation, context and session foundation | G02, G06, G14; initial G16 semantics | One destination/state model; correct draft/job/report headers; safe authorization recovery; browser history/state tests. No capability persistence or arbitrary path serving. |
| W2 — Documentation and first-use entry | G03, G04, G05, G15; G18 owning doc-anchor repair | Real doc pages/sidebar/search/cross-links/code actions and targeted landing paths, all current CLI semantics retained. |
| W3 — Investigation and session continuity | G07, G08, G09; relevant G16/G17 checks | Reviewed exact input -> real accepted job -> visible actual progress/errors -> result; earlier same-process jobs reachable; read-only reconnection. |
| W4 — Evidence investigation and portability | G10, G11, G12, G13; relevant G16/G17 checks | Clear incomplete result -> file/evidence -> nested/back -> export/reopen with exact identity and omissions. |
| W5 — Final assembled acceptance | G16 remaining observations, G17 measurements, G18 full matrix | New source-bound receipts, actual GUI task proof, preserved earlier evidence, explicit remaining blocks. No automatic publication. |
| Shared dependency intake | G19, after corresponding reviewed implementation exists | Add real engine capabilities to this same backlog and extend parity; do not block unrelated web UX fixes or mark full P04 complete early. |

The W2–W5 execution checkpoint below supersedes the W0/W1 “W2 next” instruction. Continue the same backlog with blocked browser acceptance and genuine shared dependencies; do not restart the implementation packages.

### W0/W1 execution checkpoint — 1 November 2026

[Fresh baseline and validation receipts](../examples/web-gap/README.md) preserve source/build identities and earlier failures. W0 reproduced Chrome `ERR_BLOCKED_BY_CLIENT` before app rendering through supported tooling. No browser protections changed. Viewport, zoom, full keyboard/focus and offline acceptance remain unobserved.

W1 implements native Home/Docs/Workspace links, allowlisted HTML UI fallback, browser history/return state, separate New/Open/Jobs/Reports destinations, selected job execution and selected observation sections. Drafts and documentation queries survive same-tab navigation; file filter/page/selection, evidence stack and byte offsets are keyed by observation. Selected-report context exposes the full content reference, report ID and capture time. Draft/job pages cannot inherit old-report headers/exports. The memory-only capability is consumed independently of location; explicit status refresh reads only. Session/authority/service errors, scoped form/import errors, job diagnostics and incomplete report facts remain distinct.

| Gap | Current status and remaining acceptance |
|---|---|
| G01 / W0 | Baseline and concrete blocked-browser record complete; GUI certification open. |
| G02 | Route/history/state foundation implemented; allowlist/no-authority/no-implicit-start and memory-history checks pass. Actual browser Back/Forward, scroll/focus and byte-window journey remain unobserved. |
| G06 | Draft, selected job and report contexts separated; full report content/capture identity and duplicate-report-ID rendering tested. Full assembled browser journey remains open. |
| G14 | Explicit session state, read-only refresh, masked exact-origin private-launch-URL recovery that clears immediately and preserves the current destination and scoped diagnostics implemented/tested. Actual stopped-reader/denied-session GUI walkthrough remains open. |
| G16 | Native destination links, current-location semantics, hidden inactive contexts, named pagination, visible link focus and responsive task links added. No viewport/zoom/assistive-technology pass claimed. |
| G03–G05/G07–G13/G15/G17–G19 | Remain in this same backlog. Initial Jobs/Reports listing and retained page/byte state support W1; they do not close W3/W4/W5 acceptance. |

The active checkout changed concurrently in the S4 lane (new TUI/CLI wiring, dependency links removed). Root typecheck failed on missing TUI dependencies. Validation therefore uses an isolated copy of authored web code, unchanged core/contracts/reader and the source-hashed pre-S4 CLI matching this plan's baseline, with admitted dependencies reused from the earlier local web checkout. Frozen offline setup first failed from the concurrent CLI/lock mismatch, then from an unavailable cached tarball; neither is called a setup pass. Reader/corpus validation uses real copied stores rather than symlinked stores, respecting the reader's existing path protection. See the receipt for exact results/limitations. No TUI or CLI changes were made by W1.

### W2–W5 execution checkpoint — 1 November 2026

Shane authorized W2/W3/W4 plus W5 in one local batch, preserving existing lanes and prohibiting publication. [Fresh source/build-bound receipts](../examples/web-gap/w2-w5/validation.json) and [receipt guide](../examples/web-gap/README.md) distinguish final active-workspace results, preliminary attempts, historical W1 isolation and actual browser observations. No dependency/lockfile, core/reader/G0, TUI, model, verifier, monitor or trust rule is changed by this batch. The existing dirty/index work and separate visual worktree are preserved.

| Gap/package | Implemented behavior and validation boundary |
|---|---|
| G03–G05 / W2 | Deterministic 15-page manifest across six named groups; focused analyze/inspect generated from complete canonical CLI reference; setup/task/concept/error/availability guides, semantic headings/lists/tables, stable anchors, grouped sidebar, on-page contents and previous/next links. Cross-page search returns section snippets and preserves query state in memory. Exact code copy reports success/failure without execution. Repository-valid guide links resolve only to admitted app pages at build time; unsupported repository references are visibly inert. All runtime routes/anchors and current parser flags are checked. Actual keyboard/clipboard usability remains unobserved. |
| G15 / W2 | Home links directly to Quickstart, Setup, New and Open. An annotated real retained public B1 example shows original digest/capture and incomplete/ambiguous outcomes; it links to the exact observation only if that digest is admitted. No automatic acquisition or authority grant. |
| G18 owning repair / W2 | Removed the stray text preceding `## Repaired foundation` in the owning handoff document. Historical receipts unchanged; repository/doc-manifest link checks remain distinct from browser acceptance. |
| G07 / W3 | Convenience exact/scoped target, source/commit, subtree/replay, labels/name/size checks precede uploads. Review shows actual selected input/options; only explicit confirmation admits bytes/starts core. Server/core stay authoritative. Lost start acknowledgment blocks further submission until the user checks Jobs and explicitly returns to the draft. |
| G08–G09 / W3 | Selected jobs show sanitized accepted coordinates/options and selected upload filename/size/digest without host paths, latest actual per-stage facts and expandable bounded repeated-event history. Every process job remains selectable, including earlier failures after later starts. Read-only refresh/reconnect never resubmits. Cancellation is an abort request, settlement remains separate, cleanup is `not_observable`; no durable recovery/retry promise. |
| G10–G11 / W4 | Overview uses recorded source/completeness/correspondence/AI/policy/stage facts for a reading guide and actual next sections, preserving all six independent outcomes/identities/limits. Files supports flat relationships and path-prefix/side browsing over actual members plus coverage omissions, with 40-row pages and per-observation mode/prefix/side/selection/page. Selection cannot silently show an out-of-filter change. No inferred analysis or normalized/build explanation is added. |
| G12 / W4 | Per-observation nested evidence windows remain separate by evidence/mode/side; disclosure, overlay scroll and visible focus targets are retained. Focus ring excludes closed-details/hidden/disabled controls; closed raw deltas defer the third read beside the two citation slots. Explicit reread handles byte transport errors without reanalysis. Source/range/binary/missing/hash/limit facts remain exact. Real browser keyboard/focus/Back/Forward remains blocked, not certified. |
| G13 / W4 | Contextual report/bundle/portable format choice explains original digest/capture, size limits, omissions/rights and explicit reopening. Download feedback claims preparation/request only. Open evidence explains wrong-format/corrupt/report-only missing-blob recovery; no bundle-to-report fabrication or unchecked fallback. |
| G02/G06/G14/G16 | W1 routes, draft preservation, memory-only capability, per-observation state and scoped connection/errors are retained. New source/route/security tests cover the assembled code. Responsive wrapping/stacking and readable docs are implemented; viewport/zoom/AT observations remain blocked. |
| G17 / W5 | Reproducible Node-side doc search, actual corpus projection/SSR, 19,000 harmless presentation-record filtering, exact 32 MiB inert admission/oversize rejection, real B3R download/portable import/reopen timings and process memory observations are retained. These are not browser latency/reflow measures or performance targets. |
| G18 / W5 | Final local build/typecheck, full G0, web/reader checks, four retained-case CLI/transport comparisons and real local/public-npm API/CLI handshakes are in the receipt. Source/build hashes and final-source checks distinguish the active assembly from W1's isolated baseline. No remote CI/publication claim. |
| G01/G12/G16 GUI gate | Chrome again returns `ERR_BLOCKED_BY_CLIENT` at the loopback root before app rendering. No browser protections changed. Widths 1440/1024/390, 320 CSS pixels, 200% zoom, keyboard/nested focus/back, clipboard, GUI file/download, external-offline reopening and screen-reader checks remain blocked. |
| G19 | Genuine shared heuristics/build/normalized evidence, model inference, verifier/policy, monitor/runner, TUI visual acceptance, genuine citation parity, shared review and remote web CI remain separate work. No synthetic fixture counts as adoption. |

**Exact local results:** 42/42 active web checks, 42/42 fixed-assembly web checks, 24/24 active reader checks, full G0 schema/semantics/handshakes, typecheck/build, four retained-case CLI/transport comparisons and two genuine shared-engine cases pass with the source/build boundaries in the receipt. Both genuine reports retain CLI exit 2. Repository-wide docs checking initially failed on a separate missing S4 resumed receipt target (three references). Its owning lane supplied the target; the final local checker passes across 63 files, as do authored web docs/runtime links and the requested owning anchor repair. Earlier failures remain; no remote documentation-CI or S4 acceptance is claimed.

**Integration boundary:** current dependencies are restored and active-workspace compilation passes. Concurrent S4/CLI source continues changing; its observed conditional terminal TUI entry and presentation flags are documented, preserved and source-hashed. Final noninteractive analyze/inspect parity uses a fixed copy of the current CLI source/build plus the unchanged core/reader and authored web source. Two active runs were correctly rejected by source-change assertions (root README, then CLI/build); those failures remain. The fixed assembly uses existing admitted external dependencies and local workspace-module links, with source equality checked at capture and handoff. Compile results do not adopt or certify the visual TUI. Source changes observed during the batch and earlier failed/obsolete attempts are recorded, rather than silently substituted into W1's isolated pass. No fresh frozen-install result is claimed.

**Next remaining work:** complete the blocked GUI acceptance matrix when normal browser access is available, then intake genuinely supplied G19 engine capabilities with new parity/citation evidence. W2–W4 implementation is complete locally; W5 validation has been executed but its GUI gates remain open. No Git/publication/deployment/submission/external messages occurred. Product models: none; coding assistance: Codex.

### Navigation follow-up — 1 November 2026

Shane reported that ordinary links were reloading the document, especially in documentation. G02/G03/G04 now use a shared `AppLink` on each anchor rather than a shell-level bubbling listener. It uses the anchor's `currentTarget`, prevents native loads for admitted same-origin destinations (including current-route and `_self` links), keeps query/authority/API paths outside client routing and preserves modified/new-tab/download/external actions. Documentation anchors focus/scroll in place; repeated anchor clicks create no duplicate history and Back restores remembered views. No authority persistence or implicit analysis is introduced.

[Scoped source/build-bound receipt](../examples/web-gap/link-navigation/validation.json): web build/typecheck and 45 web checks pass, including native-load prevention, nested non-Element click targets, current-page/anchor navigation and external/modified-click boundaries. Browser GUI acceptance remains separately unclaimed. The preview is rebuilt/restarted only after observing no active jobs; its new memory-only private URL is supplied in the live handoff. Earlier W2–W5 receipts are unchanged.

### Scrolled documentation correction — 1 November 2026

Shane repeated the Analyze navigation defect and identified scrolling in Arc as the trigger. The link-handler fix alone did not close this acceptance case. Source inspection confirmed a whole-window scroll-to-top/focus operation on doc changes and an article whose height changed the outer page. Docs now use stable-height independent sidebar/article scrollers, per-document article positions, pane-only anchor scrolling and no window/main reset for docs-to-docs navigation. Superseded queued navigation frames are ignored. Mobile columns stack as bounded rows. The [scoped follow-up receipt](../examples/web-gap/docs-scroll/validation.json) records source/build/tests and actual manual/blocked observations separately; earlier receipts stay unchanged. G02/G03/G12/G16 browser acceptance must track the real scrolled journey, not infer it from click-event unit tests. Final web build/typecheck and 47 web checks pass. Shane manually confirmed the updated Arc scroll → Analyze case keeps the sidebar in place; no broader browser certification is inferred.

## 6. Acceptance matrix

These are proposed pass conditions. Baseline any currently failing behavior before changing it. Use the existing public retained corpus, inert mutation and genuine generated reports; separate new live observation from offline replay.

| Journey | Gaps | Proof needed |
|---|---|---|
| First visit -> setup -> correct CLI example -> error/exit explanation | G03–G05/G15 | Correct routes/cross-links and current parser coverage; actual keyboard/browser walkthrough. |
| Search all docs for source replay, policy or exit 2 -> result -> back | G02–G05 | Exact page/anchor, useful snippet, retained query/location, no inert link pretending to navigate. |
| New npm/scoped target and local source replay -> review -> job -> report | G06–G08 | Input/options equal core request; authoritative rejection; genuine shared-engine result with truthful incomplete states. |
| Open report A -> start B -> docs -> select earlier job/report | G02/G06/G08/G09 | Correct identity/actions everywhere; job continues only as actual process state; no duplicate submission. |
| Invalid target/pairing/oversize archive; denied session; lost reader | G07/G14 | No target execution or unauthorized mutation; correct scoped error and real recovery option; draft retained where safe. |
| Cancel and disconnect/reconnect | G08/G09/G14 | Request distinct from settlement/cleanup; no automatic retry; real same-process status rediscovered; expired process explained. |
| Later-page change -> delta -> member -> back -> docs -> back | G02/G11/G12 | Filter/page/selection/scroll/byte-window retained; exact IDs/ranges; correct visible focus and Escape. |
| Report A and another capture with same report ID | G06/G10–G13 | Full content and transport contexts remain distinguishable; six outcomes/evidence do not change through filtering. |
| Report/bundle/portable download -> explicit reopen/import | G13 | Original report bytes/content digest, bundle semantics, overlapping CLI evidence bytes, omissions/rights preserved; no false filesystem-save claim. |
| Malformed/corrupt/partial/binary/inert data | G11–G14/G18 | Hash/schema/limits fail closed, unavailable states distinct, no automatic external request or active rendering. |
| Viewports/zoom/keyboard/assistive technology | G01/G12/G16 | Actual platform observations at the defined widths/zoom, meaningful status announcements and focus behavior; no unobserved compliance claim. |
| Large corpus and interrupted operations | G17/G18 | Recorded sizes/platform/timings, bounded memory/requests, stale-response checks and explicit limits; no invented threshold/pass. |

Retain the existing workspace build/typecheck, full G0, web security/transport tests, headless reader checks and appropriate core regressions. Add focused history/docs/context/lifecycle tests and real browser checks where capability exists. Run core/parser suites serially if changed or otherwise justified. Passing API tests alone cannot close G01/G12/G16 GUI requirements. Write every new writer receipt to a fresh path.

## 7. Execution boundaries and next-run instruction

Safe web-only proposals reuse the existing components, report reader and protected service. New mutable job summaries and allowlisted UI routes require boundary tests but do not justify changes to immutable G0 facts. Cross-restart durable jobs, store grants/recovery, engine findings/model/verifier/build/monitor and new technologies require their corresponding reviewed scope. No new dependency, hosting, analytics, model or trust rule is selected here.

Before future engineering, verify the current instruction authorizes implementation. Preserve original dirty/index work and the separate visual worktree. Never execute analyzed packages, expose arbitrary host paths, strip meaningful differences, persist capabilities or manufacture cleanup success. Do not commit, push, publish a PR, merge, deploy, submit or send external messages.

Historical W0/W1 implementation instruction (executed locally under the later authorization; continue with W2 next):

~~~text
Execute the Heurisko Web Application Gap Plan in docs/Web Application Gap Plan.md, beginning with W0 and W1 and preserving the rest as the same single backlog. Read AGENTS.md, docs/WEB_CONTINUATION.md, the plan, product scope, CLI reference and apps/web/README.md. Recheck Git/source/receipt state; preserve unrelated dirty/index work, historical captures and the separate TUI worktree. Reuse the existing real engine and admitted dependencies.

Record actual browser access or its blocker without weakening security. Implement one route/history/context model for Home/Docs/Workspace, with draft, job and report identity separated. Give native destination links, safe same-process return state, correct headers/actions and explicit session/disconnection recovery. Preserve the capability only in memory, strict protected APIs and allowlisted UI routes; URLs grant no authority and must never trigger implicit analysis. Do not restart the app from scratch, persist capabilities or add dependencies.

Complete the package with meaningful route/state/security/parity tests and actual browser observations when available; leave blocked GUI checks explicit. Update this same plan's gap status with source-bound evidence, keep remaining packages/dependencies visible, and report the next package. No Git/publication/deployment/external messages or model/verifier/monitor/TUI adoption.
~~~

Research-session validation is recorded separately in the evidence record: product/receipt/index preservation, local document links and structure. No product test or implementation result is claimed by creating this plan.
