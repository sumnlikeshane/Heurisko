# Heurisko webapp overhaul — research, review and singular fixing prompt

Prepared **1 November 2026, Asia/Kolkata**, at Shane's request. Malhar is unavailable; Shane and Codex will take the webapp forward. This task authorizes research, hands-on review, brainstorming and prompt preparation. **It does not implement or approve a frozen redesign, adopt missing engine capabilities, or authorize Git/publication actions.**

The copy-ready prompt below is the single implementation brief. Keep [Web Application Gap Plan](Web%20Application%20Gap%20Plan.md) as the execution backlog; this document does not restart W0–W5 or replace its historical receipts. Current local W2–W4 behavior exists. The new problem is the clarity and quality of the assembled experience.

## What was examined

- Read-only requirements review covered the original governing DOCX Problem 04 requirements and §§4–6, PDF slides 12–14 and 28, approved decisions/agreement, research product/architecture/verification, current web scope/gap plan/continuation, CLI reference, app source and tests. Relevant authorities are linked below.
- Three independent review lanes examined requirements, current code and online UX patterns, followed by a critique of the proposed direction for novices, expert investigation, narrow layouts and uncertainty.
- Built current `apps/web` with the repository's **Node 22.23.4**, using its existing admitted dependencies. The web build passed. No dependencies were installed and no app source was changed.
- Used native Chrome on a newly launched current-build loopback service, with genuine retained `examples/handoff/current/B1.report.json` and `B2.report.json` and their matching store. Visited Home, New investigation, validation/review, a real public `npm:picocolors@1.1.1` job, Reports, retained B1 Overview/Files, the modified manifest and its artifact evidence bytes, and Documentation. Historical evidence was explicitly kept distinct from the new acquisition.
- The new public job settled with a usable report and **CLI outcome 2** (04:47:24–04:48:02 IST), with heuristics incomplete and AI/provenance/build skipped. This is an actual execution observation, not an assessment pass. Nested source-manifest evidence showed version 1.1.0 against artifact version 1.1.1; Back returned through artifact evidence to the selected manifest. This checks those narrow transitions, not full keyboard/focus/scroll acceptance. The task-created preview was stopped after job settlement; existing previews and retained bytes were preserved. Web cleanup remained `not_observable`.
- An initially reached older preview was excluded from current-defect claims. Native browser control had delayed snapshots and intermittent failures. Inherited 50-CSS-pixel device emulation was turned off before ordinary form review; it is not evidence of 320-pixel reflow failure. No browser protection was bypassed. Do not interpret this review as a full viewport, keyboard, screen-reader, cancellation, export or import acceptance pass.
- Firecrawl's searches failed for insufficient credits. Online research continued with built-in web search and primary-source documentation. Competitor patterns below are documented interactions, not claimed hands-on use of their authenticated products. No local capability URLs or private material were sent to research services.

Source/build identity at review: SHA-256 of `apps/web/src/app.tsx` = `c8a5fbbc06d59ef22547ec7ce8bc35df5806972f000aa1ef6a71b4c563750e9f`; `src/investigate.tsx` = `0c49eb091a458d7cbbc4d8cdd0796806aa11909faed1beb59c8ee123891e8622`; `src/style.css` = `3db0731ec84cae33e3b3037a3d4fba9658de374de9856544a50738341a2baf59`; built `dist/assets/app.js` = `d198af1a94cd21b2c89794bab7464140a4c0526f6335eccd1111b21f35a9092d`. Recheck these before using observations against a later build. Private launch credentials are deliberately absent.

Document checks: the new prompt has one copy-ready block, all its relative link targets exist, and no launch capability is embedded. The repository-wide CI-equivalent Markdown link check currently fails on the separate missing `integration/part4/receipts/user-failures/validation.json` referenced by seven existing documentation files. That concurrent TUI receipt was not created or certified by this review; the failure remains separate from the new prompt's link check. No full test suite, remote CI or complete GUI acceptance is claimed for this documentation task.

## Findings that drive the prompt

Evidence labels: **B** = current browser accessibility-tree/action observation; **S** = current source inspection; **H** = historical receipt/user acceptance; **R** = research-informed design recommendation. A code defect is not automatically an observed browser failure.

| ID | Finding and evidence | Required response |
|---|---|---|
| U01 | **B/S:** Home and Docs carry the full connection strip; Workspace adds task navigation, return banners, identity and report navigation. `src/app.tsx` shell, approximately lines 182–200. | Distinct surface layouts, one clear hierarchy and compact contextual session controls. |
| U02 | **S:** `.actions>a` overrides `.primary` text; hover also conflicts. `src/style.css` primary/link rules. Source-implied light-on-aqua contrast is about 1.55:1 normal, 1.24:1 hover. Computed styles remain to verify. | Deliberate button/link variants and measured contrast in every state. |
| U03 | **B/S:** Technical vocabulary and repeated cautions dominate the first task; defaults include a real demo target without an explicit example selection. | Short plain-language entry, explicit example action and progressive options. |
| U04 | **B:** Opening advanced options exposes checked “Request AI — model unavailable.” Review displays `kind`, `enableAI`, `target`, `true`. `src/investigate.tsx` review/form. | Human-readable review, explicit capability/request distinction; preserve documented CLI parity. |
| U05 | **B/S:** `npm:picocolors@latest` correctly fails validation, but feedback uses `target`, lacks field links/association and leaves focus on Review. | Linked error summary, inline errors and predictable focus; retain valid entries. |
| U06 | **S:** npm/local controls unmount on mode switch; per-mode draft/file continuity needs verification. | Explicitly preserve drafts; no silent loss, upload or replacement. |
| U07 | **B:** Accepted job leads with request JSON and raw stage/status names; current observed stage is buried. | Target/current activity/elapsed time/next action first; exact request and event history in disclosure. |
| U08 | **B/S:** Loading a retained report is titled “Report unavailable” while saying “Reading selected observation…”. Read requests have no individual client deadline; polling couples jobs/catalog with `Promise.all`. | Separate loading, stale, absent, invalid and failed states; bounded read-only retry/reconnect. Do not infer a server deadlock from delayed browser snapshots. |
| U09 | **B:** B1 has useful reading guidance but repeats outcomes, warnings, IDs, digests and navigation. Overview includes internal `fixture kind: real_generated`. | One actionable recorded-fact summary, compact independent outcomes, relevant next actions; expert identity details secondarily. |
| U10 | **S:** All observations are labeled `SAVED / HISTORICAL`, including newly produced ones. | Neutral retained-observation wording plus exact capture/origin and known open/import context. |
| U11 | **B/S:** Manifest evidence begins with raw record JSON. Selecting the modified manifest exposes many similar evidence-ID links; related-evidence buttons are IDs without descriptive context. Source/provenance/AI/coverage also lean heavily on JSON (**S**). | Human-structured reading and descriptive evidence links first; exact bytes and raw records always reachable. |
| U12 | **S:** Findings stop after the first 100 matches; “path browser” is a flat record feed/manual prefix. | Bounded pagination/counts and navigable paths; every retained finding remains reachable. |
| U13 | **S:** Small global monospace text, repeated border boxes, weak semantic severity mapping and cascade accretion. | Consistent accessible typography, spacing, tokens, components and descriptive states. |
| U14 | **B/S/H:** Docs pages and search exist. Their task guide still exposes contributor/build vocabulary. Pane height is `100dvh - 32px` in addition to preceding chrome. The earlier Arc scroll→Analyze case was accepted by Shane. | Improve reading/navigation without regressing that specific repair; verify scroll ownership instead of assuming failure. |
| U15 | **B/S:** Reports use repeated full hashes/raw metadata; Home's retained example depends on startup admission. | Comparable report rows and an honest usable historical-example path, without implicit scanning or authority grants. |
| U16 | **S:** Export formats and nested evidence/state preservation already exist but require substantial explanation. | Contextual Save/Open guidance with exact format/byte/omission semantics and visible return context. |
| U17 | **S:** Hidden Files can recompute/filter/sort on job polls; serialization/comparison are bounded but synchronous. | Profile actual responsiveness and avoid redundant hidden work; never skip integrity checks as an optimization. |
| U18 | **S/H:** Model/analysis/verifier/policy/rebuild/monitor are not integrated. P04 monitoring and meaningful model work remain obligations. | Separate web delivery from shared dependencies; never simulate acceptance or erase product obligations. |

## Governing and research comparison

[Original governing DOCX](Governing/Hacktoberfest%202026%20%281%29.docx), Problem 04's “The system should” requirements, requires npm **or** PyPI retrieval, corresponding source, comparison, generated/build-artifact identification, suspicious modifications, individual explanations, evidence-backed risk assessment and selected-release monitoring. §§4–6 and [event slides](Governing/Hacktoberfest%20HackDay%20Sonipat.pdf) 12–14 require meaningful actual open-model work, public data only, examples, PR discipline and final green CI. They do not mandate a screen layout or visual style; slide 28's filenames are illustrative.

[Approved decisions](Approved%20Decision%20Register.md), especially P2-07–10 and the approved P4/P5 directions, require actionable evidence, independent outcomes and honest interpretation. Research [Product Definition](Heurisko_Research/HEURISKO_PRODUCT_DEFINITION.md) §§3–7 and [Technical Architecture](Heurisko_Research/HEURISKO_TECHNICAL_ARCHITECTURE.md) §§3–10 support compact status presentation, evidence depth, one engine and explicit uncertainty. The present app exposes much of the right information, but frequently makes users read its internal representation to understand it.

Use current CLI source/README over the stale “No default TUI/tui” row in [Web Product Scope](Web%20Application%20Product%20Scope.md). Preserve later conditional TTY default and `tui REPORT`. Existing [web continuation](WEB_CONTINUATION.md) and [gap plan](Web%20Application%20Gap%20Plan.md) establish implemented foundations; source/API tests and the accepted Arc case do not close the remaining GUI matrix.

## Online patterns and brainstorming decision

All sources below were examined on 1 November 2026. Takeaways are recommendations for Heurisko, not extra organizer requirements.

| Primary source | Pattern to apply | Boundary |
|---|---|---|
| [GitHub review workflow](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request) | Establish context, then navigate/filter files and inspect changes. | Do not invent line mappings, unified/split semantic diffs or reviewed verdicts absent engine data. |
| [Socket package search](https://docs.socket.dev/docs/package-search) | Persistent package identity with overview, alerts and file exploration. | Do not import an aggregate safety score or imply equivalent detection coverage. |
| [Diátaxis](https://diataxis.fr/) | Separate first-use tutorial, task guides, reference and explanation. | Use current real commands and available capabilities. |
| [Sigstore verification](https://docs.sigstore.dev/cosign/verifying/verify/) | Explain subject and expected identity/issuer checks precisely. | Research is not verifier adoption or trust-policy approval. |
| [GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/) | Focused summary linked to inline field corrections. | Apply the interaction, not the branding. |
| [W3C status messages](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) | Announce meaningful state changes without stealing focus. | Do not announce every poll or repeat event. |
| [W3C reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Reflow controls/prose at 320 CSS pixels; scope necessary two-dimensional scrolling. | Code/table exceptions do not exempt the entire app. |
| [WAI tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) and [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Consistent navigation semantics; complete focus behavior; objective accessibility criteria. | Route links need not become ARIA tabs; APG or automated checks are not conformance certificates. |

Three alternatives were challenged: an IDE from entry is fast for experts but poor when no evidence exists; a narrative case file reads well but makes repeated file investigation slow; a wizard throughout constrains exploration. **Chosen direction: guided start → concise report overview → freely navigable evidence workbench.** Use the narrative's clarity in Overview and the IDE's list/detail interaction inside reports. Keep Home → Docs → Workspace, with a purposeful layout for each. Preserve restrained near-black/cyan identity while improving browser typography and spacing. This is the proposed implementation direction, not a frozen/accepted design.

## Copy-ready singular fixing prompt

~~~text
Act as the product designer, UX writer and senior frontend engineer responsible for the complete Heurisko webapp overhaul. Shane and Codex now own this work; do not wait for Malhar to deliver the frontend. Implement the coherent overhaul below through the existing app. Finish the authorized local work, validate real journeys and deliver a reviewable result. Do not stop at a design proposal, a new plan, a reskin or a polished Home page while the workspace remains difficult to use.

AUTHORITY AND STARTING POINT

Read AGENTS.md, docs/README.md, docs/Web Application Overhaul Prompt.md, the current Web Application Gap Plan/WEB_CONTINUATION/Product Scope, CLI Reference, approved decisions/agreement, relevant governing P04/§§4–6 and research product/architecture/verification sections. Inspect live Git status, relevant diffs, actual routes/components/core contracts and current receipts. Preserve unrelated dirty/index work, all historical evidence and the separate TUI worktree. Use apps/web, not a replacement project.

This is a local web UI/UX implementation brief when Shane requests execution. It does not authorize commit, push, PR publication, merge, deployment, submission or external messages. Do not carry a previous checkpoint's Git approval forward. Reuse admitted React/TypeScript/esbuild and existing engine/reader. Do not add a router, state library, component platform, font CDN, analytics, service, model or dependency merely to redesign the interface. Resolve ordinary implementation choices autonomously; report any genuinely missing authority or dependency precisely after completing independent work.

Reproduce the current experience from a build matching the inspected sources; distinguish stale previews. Use the app yourself. Update the existing single gap backlog with U01–U18 cross-references and current evidence; preserve its implemented W2–W4 history. Do not restart those packages as if absent or create another competing roadmap. Correct the known stale TUI capability wording against current source without rewriting history.

PRODUCT AND DESIGN OUTCOME

Heurisko investigates one exact artifact against immutable source evidence. Make these questions easy to answer on every relevant screen: What am I investigating? What happened? What was established? What limits the conclusion? Where is the evidence? What can I do next?

Build one coherent experience: Home → Documentation → Workspace; inside Workspace, Target → Review → Run → Overview → focused evidence exploration. The short guided start must not become a wizard for reading reports. Experts can open saved evidence and jump directly to files/findings. A plain-language overview precedes technical depth.

Preserve recognizable restrained near-black/cyan styling, but overhaul density, hierarchy, typography and composition. Use readable locally available system typography for prose/UI and monospace for code/paths/digests; keep terminal character in restrained accents. Establish a small token/component system for spacing, type, color, borders, states, buttons, forms, lists, navigation and panels. Remove conflicting legacy CSS, small metadata walls, repeated warning blocks and unnecessary boxed regions. Ensure primary actions retain measured contrast in default/hover/focus/disabled states, specifically fixing the .primary/.actions>a specificity conflict. Maintain focus visibility and labels beyond color. No gratuitous gradients, dashboard metrics, animation or fictional social proof.

INFORMATION ARCHITECTURE AND SHELL

Use a lean global header. Home has purpose and entry actions. Docs has grouped page navigation, a readable article and restrained on-page contents. Workspace has stable task navigation for New investigation, Open evidence, Jobs and Reports; then one local breadcrumb/target header and report section navigation. Avoid today's stacked full-width navigation/context bands.

Keep connection state compact and scoped to Workspace. Public Home/Docs remain readable without authority. During active work, a conspicuous compact job indicator links back and labels stale information as last observed. Show actionable connection detail on failure/recovery. Do not bury the current job, steal space with permanent operational prose or make users lose a draft to reach help.

Keep admitted native routes/deep links, browser Back/Forward, modified/new-tab links and same-route anchors. Report links identify process-local destinations, not permanent sharing. Context labels/exports must always belong to the actual selected report, never an old report while editing a new request. Preserve per-observation state and safe draft navigation.

HOME AND DOCUMENTATION

Home explains exact package/source comparison in ordinary language, shows one dominant start action, a useful setup path and an explicit working retained-example path. Clearly label historical evidence/capture time; neither example navigation nor visiting Home starts a scan or grants authority. If an example is not admitted, offer a clear supported admission/setup path or implement narrowly scoped validated sample admission without arbitrary paths/public authority. Do not add a download-dependent fake demo.

Separate first investigation tutorial, task guides, command reference, concepts and troubleshooting. Cover CLI AND browser supported workflows. Keep canonical command details exact, complete and copyable. Rewrite primary guidance for users; contributor handoff history, receipt names, ownership and rebuild mechanics belong in secondary reference, not the main task instructions. Keep full references accessible.

Retain all-page search/snippets, stable URLs/anchors, active location, previous/next links and honest copy success/failure. Search results need accessible empty/loading/error behavior. Use a viewport-aware docs layout accounting for its actual chrome. Deliberately assign sidebar/article/window scroll ownership. Preserve remembered article/sidebar positions, repeated anchors and the accepted scrolled article→Analyze behavior. On narrow screens use accessible navigation/contents disclosures, not two cramped permanent scrollers. Returning from Docs must preserve investigation context.

NEW INVESTIGATION, REVIEW AND EXECUTION

Start with an empty exact target plus explicit example action, or unmistakably label an intentionally prefilled example. Offer exact npm/local archive choices with short syntax help and the relevant constraints. Do not invent registry search or unsupported PyPI controls. Preserve scoped npm, local labels, optional pinned GitHub full-commit/subtree and permitted local replay. Explain what source evidence helps establish without treating an override as proof. Keep advanced options secondary.

Preserve each mode's draft and selected-file context; never silently upload, clear, replace or reinterpret a file. Make file name, size, admission timing and public-data/retention implications clear where the user decides. Review must show human labels for exact target/artifact, source/subtree, selected bytes, profile and requested options, with obvious Edit actions. Hide raw request keys in technical details. Only explicit Confirm and start may admit bytes/start one real job. Do not weaken server validation or turn client validation into authority.

Use linked error summaries plus inline associations (aria-invalid/describedby), focus the appropriate error destination and preserve valid values. Distinguish field errors from session, admission, engine and import errors. Supply specific supported recovery; retain exact diagnostic codes in details.

AI/policy controls must distinguish recorded/requested/available capability. The model, analysis module, verifier, concrete policy evaluator, rebuild and monitor remain unavailable unless actually integrated under separately reviewed scope. Avoid an apparently working AI switch. Preserve supported explicit request/--no-ai behavior and document any UI-default decision relative to CLI parity; disabling presentation must not silently change submitted semantics. No fabricated analysis.

Job detail leads with exact target, current recorded activity, started/elapsed information, state and available next action. Use ordered real stage facts and a restrained timeline. Put accepted request JSON/IDs/repeated events in details. Show determinate progress only for real denominators; otherwise show an indeterminate state without invented completion percentages or ETA. Do not label stage order as necessarily serial.

Treat running, cancel_requested, settled_report and settled_error separately. Cancellation is a request, cleanup remains not_observable, and navigation/tab closure does not cancel. Keep cancellation available while the service permits it. A usable partial report and no-report failure require different next actions. Lost start acknowledgment directs users to existing Jobs/read-only refresh, never automatic resubmission. Do not add queued work, implicit retries, durable resume or cleanup guarantees.

READ RELIABILITY, JOBS AND REPORTS

Separate loading from unavailable, absent, invalid, stale, disconnected and failed states. A pending report must not be titled Report unavailable. Bound read-only waits, offer explicit retry/refresh and show last successful observation where appropriate. Catalog/jobs/report failures must not erase a valid unrelated view. Reproduce and measure coupled polling/hidden rendering costs; improve them within existing bounds instead of assuming a core deadlock or rewriting the engine. Read-only retry must never retry a start, upload or export mutation.

Jobs and Reports need compact comparable rows with package/version, origin, start/capture time, observed state and Open action. Distinguish process job history from retained report storage. Keep independent observations with equal report IDs distinguishable through content/transport identity. Explain expired handles and supported reopen after restart without pretending all stored reports are automatically catalogued.

REPORT OVERVIEW AND EVIDENCE

Lead with exact target and a concise factual account of what is established, what remains unresolved and the most useful next inspections. Derive this only from recorded fields. It is presentation of facts, not a new verdict engine. Preserve independent artifact integrity, source association, provenance policy, correspondence, analysis completeness and policy result, with AI separately labeled. Do not make a single safety score/gauge or treat matched/complete/zero findings/exit zero as safe.

Show relevant real changes/findings, source conflicts and coverage limits without repeating the same warning in every panel. Distinguish analysis unavailable, zero recorded findings and zero filter matches. Preserve severity, confidence and priority independently. Link each actionable item to its actual supporting record/evidence. Replace blanket SAVED/HISTORICAL with neutral retained-observation context and exact capture/origin; only show import/reopen/freshness claims supported by facts.

Keep full artifact/source/report identity, digests/configuration and exact enums accessible through readable details/copy controls. Clearly distinguish artifact digest, report ID and report-content reference. Do not expose fixture/internal contributor vocabulary as the user's primary explanation.

Use a bounded list/detail evidence workbench on wide screens and single-column drill-in on narrow screens. Provide navigable real paths, side/status/omission filters, clear result counts, pagination and selection. Every retained finding/member/omission must remain reachable; fix the first-100-findings ceiling. Build tree groups from retained paths; virtual directory groups are presentation, not evidence of extra entries. Do not invent mappings or diff semantics unsupported by records.

Finding → file/change → exact evidence → related/full member must preserve the originating context. Label evidence links with available side/path/kind/range or manifest field, then a secondary exact ID; related evidence must be distinguishable without opening every ID. Lead evidence with path, artifact/source side, content state, actual recorded half-open byte range and usable bytes. Move raw EvidenceRecord JSON to details. Retain bounded paging/offsets, hash verification, binary/base64, truncated/absent/unsupported/error states. Do not invent line numbers, multi-hunk diffs, normalized equivalence, generated-build explanations or semantic correspondence. Clearly label both sides; do not imply missing evidence is an empty file.

Prefer in-workspace reading for sustained evidence exploration. If overlays remain, give them visible title/history/Back and complete inert-background/focus containment/Escape/restoration. Preserve each observation's filters, page, selected record, evidence stack/byte offset, disclosure/scroll/focus state across report navigation and Docs. Restore selections only while valid; if a record/handle is unavailable, explain why and focus a useful parent without substituting another report. Do not mount expensive hidden views merely to retain state when state can be retained explicitly.

Structure Source, Provenance, Coverage and AI as readable summaries/tables/lists over original records. Retain every candidate/conflict, stage failure, exclusion and unsupported/truncated region. List order is not source proof; generated-looking filenames are not exemptions. Show exact subject/identity/issuer/predicate/source/builder policy checks only when recorded; not_checked remains not checked. Never replace missing integrations with fixtures that look like actual runs.

SAVE, REOPEN AND SESSIONS

Make Save a contextual choice: original report JSON, EvidenceBundle JSON, portable evidence. Explain which contains referenced bytes, what is omitted and how it can be reopened; report/bundle alone are not self-contained evidence. Preserve original bytes/digests/capture time/omission reasons/rights notices. Confirm preparation/request rather than claiming the browser saved a file. Provide useful failure feedback, meaningful filenames and a direct Open evidence path.

Open evidence offers supported file/report-content-reference/portable methods with format-specific help. Handle wrong format, corruption, missing blobs, invalid binding, expired handles and report-only evidence availability explicitly. Keep the fixed store and explicit startup report/store alternative; never add arbitrary host paths, bundle-to-report fiction or automatic publication.

Session authority remains memory-only, consumed from the exact-origin launch fragment; never put it in localStorage/sessionStorage, queries, logs, exports, analytics or persistent history. Preserve exact Host/Origin/fetch-site/method/media/query checks, opaque server-owned uploads and all size/concurrency/disk/time bounds. Reauthorization must preserve destination/draft and never start work. Restart loses process handles; reopening retained evidence does not refresh registry or provenance. External-offline use still requires the local reader and retained bytes.

UNTRUSTED CONTENT AND BACKEND BOUNDARY

Use public package/source evidence and public inert fixtures only; do not admit private/confidential data during validation. Render archive paths, Markdown/HTML/SVG/source/model text as inert escaped content. Never execute target packages/scripts/config/build metadata or weaken parser/network/isolation/cleanup controls. Keep one engine, shared report contract and immutable evidence; no browser-generated verdicts. Do not modify G0/core trust semantics to simplify a screen. Any necessary shared change needs its own reviewed scope and appropriate tests.

Monitoring and meaningful actual model work remain complete-product/event obligations. Track them and all missing shared integrations explicitly as dependencies. This web overhaul cannot close them through copy, screenshots, mocked results or an unavailable badge. Do not expand frontend work into model/verifier/monitor adoption or present web UX completion as P04 completion.

ACCESSIBILITY, PERFORMANCE AND COMPLETION

Build keyboard/visible-focus/native link/form/heading/table semantics into every surface. Apply relevant WCAG 2.2 AA contrast, focus-not-obscured, reflow and target-size criteria, including their defined exceptions. Identify the browser/screen reader actually tested and leave untested criteria open; no conformance claim from screenshots or automated checks alone. Route links remain links; actual tabs/dialogs follow the appropriate WAI pattern. Announce meaningful upload/job/cancel/error/export transitions without focus theft or polling noise. Respect reduced motion/forced colors; check long paths, Unicode/control/bidi escaping and binary content. At 1440/1024/390 widths, 320 CSS pixels and 200% zoom, collapse navigation and evidence panes around the current task; scope unavoidable horizontal scrolling to code/table regions. Do not exempt surrounding controls from reflow.

Profile representative large/partial reports: main-thread rendering, repeated polls, search/filter, bounded evidence reads and export memory. Keep rendering/search/pages bounded without dropping access to records. Preserve digest verification and existing resource caps. Measure before claiming performance gains; no external analytics or arbitrary speed score.

Implement in dependency order within the same backlog: shell/tokens/state → Home/Docs → input/review/job reliability → Overview/evidence/save/open → assembled acceptance. Carry accessibility, security, state retention and shared-engine parity through every step. Use independent agents for non-overlapping review/implementation where useful; reconcile the assembled result.

Run appropriate existing build/typecheck/web/contracts/shared-reader checks using pinned tooling; add meaningful regression checks for changed behavior, not tests that simply mirror markup. Use pnpm run typecheck, pnpm run test:web, PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts and relevant reader regressions as the documented starting commands; inspect current scripts first. Do not install dependencies or run the full core corpus reflexively for cosmetic edits. Source/API/SSR passes never substitute for observed browser journeys.

Actually verify: first visit→setup/CLI command; explicit retained example; exact/scoped npm and local replay→invalid correction→review/edit→one real job; partial/no-report outcomes; active job→Docs→report A→job B context; lost acknowledgment; cancel request→settlement; disconnect/reconnect/restart with no implicit start; report→finding/file→both-side/nested evidence→Back with state; omissions/unsupported/binary/missing bytes; all export choices→native download→supported reopen with identical original bytes; wrong/corrupt format; same report ID/different content; Docs search/copy/anchors/Back and scrolled Analyze regression; keyboard/focus/AT; viewport/zoom; external-offline with reader running. Use genuine evidence plus explicitly labeled synthetic boundary cases. If an environment blocks a check, record the exact blocker and leave it open; do not disable protections or invent a pass.

Completion requires a cohesive overhaul across all these surfaces, a U01–U18 disposition/acceptance matrix, source/build-bound screenshots and browser observations, automated results and remaining shared dependencies. Update current entry/handoff documentation and preserve historical receipts. Finish with concise changed behavior, validation, limitations and local review instructions. Keep all work reviewable and uncommitted until separately approved. Do not call the design human-approved/frozen or the entire product complete.
~~~
