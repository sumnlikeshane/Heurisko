# Heurisko webapp — parallel implementation plan

> **Historical first-slice plan; scope reconciled 1 November 2026.** Sections 1–10 below preserve the original schedule, cuts, prompt and execution checkpoint. For the complete intended application, use [Web Application Product Scope](Web%20Application%20Product%20Scope.md): complete CLI documentation and end-to-end browser investigation with parity for supported CLI capabilities. Use [WEB_CONTINUATION](WEB_CONTINUATION.md) for the fresh handoff/exact next-run prompt and [CLI Reference](CLI%20Reference.md) for current commands. The old saved-report-only restrictions and four-hour clock are not the current full-product scope. Historical receipts remain unchanged. This reconciliation authorizes documentation only; the later request to start the existing viewer does not authorize feature implementation.

**Prepared:** 1 November 2026, Asia/Kolkata. **Planning authority:** Shane requested a separate webapp plan while S4 continues, with four hours remaining. **Status:** implementation proposal; no browser code, dependency admission, product-model integration or delivery is claimed by this document. Web ownership remains shared under Phase 01 D03 and agreement A12.

**Outcome:** a local React/TypeScript evidence explorer that opens an actual saved investigation, shows its exact identities and limitations, and follows changes/findings to retained evidence. It must be useful with today's analysis-unavailable reports and accept later genuine integrated reports without UI changes to their conclusions.

This schedules the browser portion of S6/G5 alongside S4. It does **not** mark S4/S5 passed or start monitoring, intelligence or deployment. The later request supersedes the old plan's sequential S4 → S5 → S6 prerequisite **for independent browser work only**. [Shane's plan](Shane%20Implementation%20Plan.md) continues to govern his other parts; [approved decisions](Approved%20Decision%20Register.md), [team checklist](Team%20Development%20Checklist.md) and the [engineering agreement](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md) retain their product/trust authority.

## 1. Governing-document reread and consequences

The planning session reread both supplied organizer documents in full by text extraction, all six approved phase records, the agreement and current decision/checklist records. It also inspected the actual G0 types, validator, candidate report reader, current handoff and relevant implementation/research sections. This was a content review, not a new visual audit of the source PDF or acceptance of the TUI design.

| Source | Requirement carried into this plan |
|---|---|
| [Official guidelines](Governing/Hacktoberfest%202026%20%281%29.docx), P04 and §§4–6 | Exact artifact/source analysis; generated differences, suspicious changes, explanations, evidence-backed assessment and release monitoring. Public data, genuine meaningful open-model work, actual generated examples, PRs and passing CI remain required. |
| [Event slides](Governing/Hacktoberfest%20HackDay%20Sonipat.pdf), pp10–16,18–21,28 | Final merge/push and submission by **06:30 IST, 1 November**; presentation at 08:30, eight-minute demo/four-minute Q&A. Same package/source evidence must be inspectable. Scoring slide placeholders do not establish a full numerical rubric. |
| [Phase 01](Approved/phases/HEURISKO_PHASE_01_TECHNICAL_FOUNDATION_APPROVED_v0.2.0.md), D02–D06 | React/TypeScript web, shared engine/report, mandatory Ink TUI, local-first/account-free use and independent trust dimensions. Browser work cannot replace TUI completion. |
| [Phase 02](Approved/phases/HEURISKO_PHASE_02_CLI_TUI_INVESTIGATION_APPROVED_v0.2.0.md), P2-06–P2-12 | Same report semantics, actionable finding detail, separate severity/confidence/priority/completeness, AI hypotheses and visible unknowns. |
| [Phase 03](Approved/phases/HEURISKO_PHASE_03_EVALUATION_PACKAGES_APPROVED_v0.1.0.md) | Genuine releases, clearly labeled inert local mutations, uncertainty and independent labels; no fixture screen presented as live analysis. |
| [Phase 04](Approved/phases/HEURISKO_PHASE_04_EVIDENCE_TRUST_RULES_APPROVED_v0.1.0.md) | Immutable exact bytes, competing sources, provenance/policy distinction, raw differences, omitted scope, supported citations and historical times. |
| [Phase 05](Approved/phases/HEURISKO_PHASE_05_SECURITY_ISOLATION_MONITORING_APPROVED_v0.1.0.md), P5-05/06/10/11 | Inert content, local persistence, explicit export, failure visibility; no anonymous hosted analyzer or implicit upload. |
| [Phase 06](Approved/phases/HEURISKO_PHASE_06_PRESENTATION_DOCUMENTATION_HANDOFF_APPROVED_v0.1.0.md), P6-04/06/07/12 | Browser opens the same actual report/evidence as terminal; reproducible setup, honest replay fallback, final revision CI and separately verified submission. |
| Agreement A01/A04/A08/A12–A14 and E09 | Web initially opens local/exported reports. G0 is accepted; new contract changes still require review. Cross-review, CI and concrete evidence precede completion claims. |
| [Current handoff](HANDOFF_S1_S3.md), [readiness mapping](Part%204%20Integration%20Readiness%20Report.md), [audit repairs](Audit%20Repairs%20and%20Malhar%20Handoff.md) | Use real fields and bounded evidence reads; respect repaired foundation and distinguish historical blockers from unresolved UI integration. Do not adopt saved M1 output as product analysis. |

Earlier research calls TUI optional and describes an uncreated repository; later approvals and the live checkout supersede those historical statements. The organizer's P08 Gemma-only/laptop-only restrictions do not apply to P04. A polished browser cannot satisfy missing monitoring or actual model work.

## 2. Starting state and parallel-work boundary

- Active checkout: `docs/share-research-with-team`, HEAD `0e2be5a`, with existing dirty S1–S4 material. The separate visual worktree also exists. Preserve both; do not reset, stage broadly, or switch their branches.
- Published foundation recorded in the handoff: `81346271f5a3789b4b43fd8f379014656011823d`, draft PR #3. Its recorded CI pass is historical evidence for that head, **not** a webapp pass or a fresh remote-status check.
- No `apps/web` exists in this checkout. `pnpm-workspace.yaml` currently includes only `packages/*`; workspace registration is real integration work, not already configured.
- `packages/core/src/validation.ts` uses the pinned Python bridge for full schema/semantic/raw-JSON validation. It cannot be imported into a browser bundle. A TypeScript assertion or successful `JSON.parse` is insufficient replacement validation.
- `integration/part4/src/report-reader.ts` is a Node-only **candidate**, with hash-checked bounded reads and delta-to-member span resolution. Reuse it read-only after reviewing its current bytes; do not relocate or refactor it while S4 uses it.
- Current handoff reports contain raw changes but **zero recorded findings with analysis unavailable**. Render that combination explicitly. There is no integrated product model, monitor, verifier, rebuild or concrete policy evaluator to invent behind a web control.

| Lane | Owns | Shared handoff / prohibited collision |
|---|---|---|
| S4 owner | CLI/TUI, visual spike adoption, keyboard/focus/resize, live lifecycle wiring and S4 records | Supplies terminal parity evidence when ready. Web owner does not edit CLI/TUI/spike or declare G3 closed. |
| Web owner, assigned for execution | `apps/web/**`, its local reader/export tooling, web tests and web receipts | Consumes G0/core/reader without changing them. Owns web navigation, responsive layout and inert browser rendering. |
| Malhar | Actual findings/build explanations, retrieval/model, citation quality and evaluation | Supplies an exact integrated report revision. Generic rendering of stored findings/AI is web work; producing new findings or explanations is not. |
| Integration owner, Shane by default | Root workspace/scripts/lockfile/CI, combined docs and final assembly | One writer for shared files. Other lane supplies a small patch/change list; no simultaneous package installs or lockfile regeneration. |

Begin from the latest checked foundation in an isolated working directory/worktree when implementation is authorized; propose branch `web/local-evidence-explorer`. Do not create commits to obtain isolation. Record exact source/reader identity and copy only reviewed incremental web changes into the combined S4 assembly. A worktree from the old active HEAD alone lacks the dirty foundation. Do not infer its contents from the branch name or import the visual spike wholesale.

## 3. Deliverable and scope order

**Required browser slice:** open a local report; overview; source/provenance/build context; file/change navigation; exact evidence details; findings and AI records when present; coverage/errors; explicit portable export/import through local tooling; install/use help. No account, remote backend or product inference call is required for viewing.

The initial Open flow selects among reports explicitly supplied when the local viewer starts. To open another report/store or an exported directory, the user runs the documented local opener. A browser-native filesystem picker/upload is an enhancement. This keeps the minimum usable without introducing a privileged arbitrary-path HTTP API.

**Cut first:** marketing animation, illustrations, theme switcher, accounts, global package search, registry/version browsing, live analysis forms, job controls, notifications, release comparison, normalized views, syntax-highlighter/editor suites and hosted deployment. Keep compact installation/help content within the app. Broader browser search/investigation remains a later product direction, not erased scope.

**Do not cut to meet the clock:** real raw evidence access, original identities/times, source conflicts, content-availability reasons, bounded rendering, inert content or validation. If those fail, report a partial viewer rather than a finished evidence explorer.

## 4. Technical implementation boundary

### Local reader and browser

Use React/TypeScript for presentation and a minimal Node local reader using existing validation. The reader is a narrowly scoped read-only service, **not an analysis/job API**. It receives explicit report/store pairs from trusted startup arguments and exposes opaque observation handles. Browser requests never supply OS paths, store roots, URLs, shell text or module names.

1. Validate original report bytes with `decodeReport`/`ReportReader.openFile`; preserve their exact SHA-256 content reference separately from `reportId`. Freeze the report. Preserve duplicate-key/unsafe-number rejection and validator-unavailable failures.
2. Catalog only explicitly opened observations. Pin a handle to `(reportId, reportContentRef)`; a report ID alone can identify several immutable observations. Do not enumerate the user's filesystem, CAS runs, home or other worktrees.
3. Serve the report and bounded evidence pages by observation handle + existing evidence ID + explicit side/offset/length. Delegate citation resolution to the reader; a raw-diff JSON locator is not a source-code location. No package-driven fetch, analysis, parser, Docker, model or write operation is reachable.
4. Bind **127.0.0.1** only. Require a random per-process session capability for data requests, exact Host/Origin checks, no permissive CORS, strict method/routes/query validation, bounded concurrency/time/response sizes and sanitized fixed error codes. Bootstrap the capability without query-string/log leakage; do not persist it in reports or browser storage. Test foreign-origin requests and DNS-rebinding Host values before calling this safe local access.
5. Serve compiled app assets from a fixed allowlist. Never serve arbitrary retained files as static assets. Evidence reaches React only through encoded JSON text/base64; no retained HTML/SVG/JS, source maps, remote images or model Markdown become active resources. Use restrictive CSP and no external fonts/analytics/CDN assets. Do not log tokens, private absolute paths or evidence bodies.
6. Keep node/fs/Python/core imports in the local-reader side; browser code uses shared **type-only** imports and explicit presentation DTOs. DTOs are transport/view records outside G0, not new verdicts. Unknown schemas/enums produce an unsupported state, never guessed trust labels.

Reuse admitted Node 22.23.4, pnpm 10.14.0, TypeScript 5.8.3 and the existing Python setup. At W0 verify an exact released React/ReactDOM/build-tool combination against official documentation, peer/runtime requirements, licenses and lock integrity; coordinate React compatibility with S4. No new version or bundler is admitted by this plan. Avoid a framework/server/database migration. Do not bundle core or Python into React to bypass the boundary.

### Import/export without changing historical reports

Add a small versioned **transport manifest outside G0**, e.g. `heurisko-web-export-v1`, containing exact original report byte digest, report ID, schema version, export time, per-digest included/omitted status and reasons, byte lengths and applicable third-party notices. Export time is distinct from capture/creation time. Keep the original report byte-for-byte, including its content states and old analysis fingerprint.

Use a fresh explicit destination directory and fixed names (`manifest.json`, `report.json`, digest-named blobs). No ZIP/archive extraction, arbitrary manifest paths, symlinks or overwrites. Read source bytes only through the reviewed digest-scoped reader. Include only referenced, hash-verified blobs; bound aggregate export size and list deliberate omissions. Record whether exported bytes support full files or only metadata; never invent source text.

Import via local startup tooling: validate manifest shape/version, report raw bytes/semantics, exact digests, sizes, fixed paths and declared content availability. Reject corruption/unsafe references; expose missing/omitted content with precise reasons. An export manifest is not a signature or authenticated source assertion. Never trust a supplied `validated: true` marker. Do not rewrite report `contentState` or save a changed report under its old identity to describe transport omissions.

**Proposed initial reader/import limits:** retain candidate limits of 8 MiB report, 32 MiB blob, 64 KiB returned page and 256 KiB versioned delta record; add a 64 MiB total included-blob export cap, one export/import at a time and at most two active evidence reads. These are implementation budgets to test/record, not throughput claims or changes to core limits. Use streaming hash checks, bounded I/O and explicit cancellation. Oversize reports fail visibly; oversize/omitted evidence leaves metadata readable. If export exceeds the cap, return an explicit partial manifest requiring the user to choose scope; never silently truncate.

## 5. Screens, fields and interaction

Use a compact report workspace: report selector/header; `Overview`, `Files`, `Findings`, `Source`, `AI`, `Coverage` navigation; evidence detail panel. This is a proposed **web** layout, not adoption/freeze of the candidate TUI contract. On wide screens show file list, source/artifact panes and evidence detail; on narrow screens use one stacked view with a clear back path. Prefer native controls, readable typography, visible focus and text status labels.

| Surface | Exact data / required behavior |
|---|---|
| Open/help | Actual locally opened reports only. Show load/validation errors and tested commands. No fabricated recent jobs or Analyze button. |
| Header/overview | `reportId`, full report content digest, schema/config fingerprint, `fixtureKind`, artifact origin/name/version/filename/observed digest, expected integrity, `captureTime` and `createdAt`. Persistent saved/replay notice. |
| Independent outcomes | Pass through all six stored `outcomes` fields; AI state separately. Do not collapse matched integrity + ambiguous source + incomplete analysis into green success. |
| Files | `bundle.changes` plus member evidence: identical/added/removed/modified/generated_candidate/unresolved. Search/filter and stable selection by IDs; paginate long lists and long lines. Generated candidate remains a candidate. |
| Difference/evidence | Exact available source/artifact text or base64, recorded half-open byte ranges, evidence/member IDs, digest, method, content state and limitations. Show each side's absence/unavailability separately. Current prefix/suffix spans are not a multi-hunk diff; label them as recorded changed spans. Preserve raw record view and broader file access. |
| Findings | Stored finding fields: observation, why it matters, evidence, explanation strength, limitations and next actions. Severity, priority and evidence confidence separately. Filter using actual enums/rule IDs; no invented type taxonomy or web severity evaluator. |
| Source | All candidate repos/full commits/subdirectories/snapshot/build-context digests, association/conflicts/evidence. Do not select candidate zero by position. Show selected target only where retained selection evidence establishes it. |
| Provenance/build | Actual provenance status/binding/policy/evidence and build-stage/record facts. `not_checked` is explicit. Configuration/maps are clues, not reproduced builds. No decorative verified badge. |
| AI | Actual `aiState` plus separately labeled interpretations/citations/alternatives/missing evidence/abstention/model/runtime/prompt identities. No browser inference or synthesized fallback prose. Unknown weight/runtime metadata stays unknown. |
| Coverage/errors | Original counts, omissions, unsupported/skipped bytes, stage records/errors and limitations. No universal percentage from incompatible denominators. Failed/skipped heuristics + empty findings means assessment unavailable/partial, not “no issues.” |
| Export | Explicit action using the tested local exporter; explain included/omitted bytes and reopen command. No implicit upload or Share publication action. |

Evidence links must restore the previous report/tab/filter/selection/scroll on return. Key navigation supports Tab/Shift+Tab, Enter and Esc with visible focus; do not steal browser shortcuts. Search covers displayed report records, not unbounded file contents. Render controls/bidi characters visibly where needed while preserving original bytes for digest/export. Missing, not-exported, unavailable, corrupt, invalid-range, unsupported-record and read-limit states remain distinguishable. No hunk synchronization or line numbers guessed from byte offsets.

Monitoring is a small explicit unavailable notice until the actual monitor supplies a versioned read-only snapshot with its own observation time. A stale export never becomes a live monitoring feed. Its absence does not block the independent browser slice or close complete G5.

## 6. Four-hour execution schedule

**Clock check during planning:** 02:15 IST on 1 November; official freeze is 06:30 IST. This does not prove a full four hours remain when implementation starts. W0 must record actual start and use `min(240 minutes, minutes until 06:30)`, keeping the final **40 minutes** for combined validation/delivery. Planning time counts against the real deadline; never restart an artificial four-hour clock after 02:30.

These are **one web execution lane's wall-clock allocations**, not additional time awarded to S4/Malhar or a guarantee of completion. S4 and model/monitor work continue under their existing ownership/authorization; this document does not assign an extra person or authorize spawning agents. Implementation can proceed through the web stages in one authorized session, with a checkpoint after each.

| Stage | Minutes / cumulative | Concrete output and gate |
|---|---|---|
| W0 — pin baseline and ownership | 15 / 00:15 | Preserve dirty work; select actual foundation; record available minutes, source identities, shared-file writer and dependency pins. Confirm reader imports/build path without changing S4 files. |
| W1 — validated local access | 35 / 00:50 | Minimal app build plus loopback reader opens B1/B2 and reads one exact citation. Bad report/ID/origin/Host/path/capability requests fail closed. No arbitrary fs or job routes. A real report is visible by this checkpoint. |
| W2 — report workspace | 35 / 01:25 | Header, six outcomes, source/provenance, coverage/errors and honest empty findings/AI state. Report selection and keyboard navigation work at wide/narrow widths. |
| W3 — evidence explorer | 45 / 02:10 | File/change search, raw changed spans, both sides, evidence links, bounded paging/base64 and back-state restoration. Exact inert mutation span opens without executing it. |
| W4 — findings/AI and portability | 30 / 02:40 | Render stored finding/AI detail; finish minimal bounded directory export/import and offline reopen. Use genuine newly integrated reports if supplied, labeled contract fixtures only for missing-state tests. No new model/heuristics. |
| W5 — adversarial and parity checks | 40 / 03:20 | Web typecheck/build/tests, reader/import boundary tests, real browser keyboard/narrow/offline review and CLI parity. TUI parity when S4 is available; otherwise record the dependency. Fix failures before optional polish. |
| W6 — combined assembly and delivery reserve | 40 / 04:00 | Integration owner assembles incremental web + S4 changes against the foundation; checks final shared files/setup, prepares actual examples/runbook/PR description and obtains outstanding scoped delivery approval. Exact final-head CI and any authorized merge/submission need completion before freeze. |

At T+50, if evidence cannot be opened, stop adding UI and repair the local reader. At T+130, freeze layout expansion. At T+160, freeze features; unfinished required export/import stays explicitly partial. Drop optional features before using W5/W6 time. If real time is shorter, reduce feature scope and report unmet gates; do not remove validation or borrow unbounded delivery time.

For the whole team, missing meaningful model inference, monitoring, mandatory TUI, findings/build explanations or final CI remain independent deadline risks. Protect time for those existing obligations; finishing this web lane does not claim complete P04.

## 7. Validation and acceptance evidence

Use the existing setup; no target-package installation or fresh network acquisition is needed for viewer tests. Real inputs already retained:

| Input | What to prove |
|---|---|
| [B1](../examples/handoff/current/B1.report.json) + matching store | Matched registry integrity and source ambiguity coexist; capture time remains historical. |
| [B2](../examples/handoff/current/B2.report.json) + matching store | 143 raw change records are navigable; no generated equivalence or zero-finding safety conclusion is manufactured. |
| [B3R](../examples/handoff/current/B3R.report.json) + matching store | Monorepo subtree/build context and excluded bytes remain visible. |
| [Inert local mutation](../examples/s2/current/outputs/synthetic-local-mutation.report.json) + its store | Local identity remains separate. Evidence `ev_8e5679afc3b6d3667eb09413` resolves artifact bytes `[585,611)` to `HEURISKO_INERT_TEST_ONLY`; absent source value is distinct from missing bytes. |
| Newly adopted Malhar report, if delivered | Finding → evidence → exact bytes and AI interpretation links, all from one new immutable report/configuration. Otherwise joint finding/AI acceptance remains open. |
| F0–F6 and dedicated hostile viewer inputs | Explicitly synthetic tests for invalid report/AI states, corruption, missing bytes, control characters, active markup and unsupported cases. Never list them as actual analysis outputs. |

Required checks:

1. **Import/reader security:** duplicate keys, unsafe integers, wrong schema/ID/fingerprint, tampered/missing/oversized blobs, invalid ranges, traversal/symlinks and digest/path confusion. Original report bytes survive export/reopen unchanged; all manifest omissions are visible. Validator failure is an error, not permission to skip validation.
2. **Local service boundary:** capability/Host/Origin/method allowlist, no CORS wildcard, no arbitrary paths/URLs or mutable routes, bounded work and shutdown. A blocked foreign page cannot read an open report. No writes outside the explicit export destination.
3. **Browser containment:** HTML/SVG/Markdown, script-like filenames, OSC/ANSI/bidi, model injection text and source-map URLs remain inert text. Observe no automatic external resource requests or execution. Keep binary and split-UTF-8 fallback honest.
4. **Meaning/parity:** compare original report content digest, artifact digest, source candidates/conflicts, six outcomes, finding/evidence IDs, exact citation bytes and omissions against CLI. Source-selection/AI/view filtering never changes report data. Test two observations sharing a report ID without aliasing their bytes.
5. **Usability:** actual browser at approximately 1440/1024/390 px and 200% zoom; keyboard-only opening, tabs/filter, evidence and back; visible focus, readable long lines, both-side absence, bounded large lists and errors. Record tested browser/platform, not universal support.
6. **Offline:** after local startup, disconnect external network and open/reopen exported B1/B2/mutation content. Missing evidence remains a limitation; saved report viewing never claims fresh registry/source/provenance checks. Closing the local reader honestly ends access.

Add proposed scripts `build`, `typecheck`, `test` in `apps/web` and a root `test:web` only when implemented. Proposed workspace commands are `pnpm --filter @heurisko/web build`, `pnpm --filter @heurisko/web typecheck`, `pnpm --filter @heurisko/web test`; they do **not** exist or pass today. Workspace registration, pinned install and exact launch/export commands must be recorded after implementation. Add a web CI step/job on every PR without removing existing checks; run the relevant full G0/typecheck and existing 24 headless reader checks for integration. Reader-only web changes need not repeatedly invoke Docker acquisition suites; changed foundation/shared behavior requires its appropriate serial regressions.

**Web gate W passes locally** only after real report/evidence access, truthful states, bounded import/export, offline reopen, inert rendering, keyboard/responsive checks and CLI parity have evidence. **S6/browser portion of G5** additionally needs shared review and actual integrated finding navigation where promised. **Full G5** also needs real monitor deduplication/restart; **full G3** needs mandatory TUI. CI/publication/demo are separate statuses. Do not mark all gates passed from screenshots or fixtures.

Store new actual outputs/manifest/verification/sanitized screenshots under a new `examples/web/current/` when generated; do not overwrite any S2/S3/handoff captures. Record report content digests, source revision, web/reader versions, supported commands, actual checks, missing dependencies and timestamp in a web receipt. Product models for viewer-only work: none; coding assistance: Codex. Preserve upstream notices for copied evidence.

## 8. Implementation handoff and next-session prompt

Expected new files: `apps/web/package.json`, build/typecheck configuration, `src/` components/styles/state, `server/` local reader, `tooling/` manifest exporter/importer, `tests/`, and usage README. These are planned paths, not existing deliverables. Root workspace/lock/scripts/CI changes go through the single integration owner. Keep a checkpoint here with W stage, actual time, files, validation, dependency status and next step after execution.

Before delivery, review the incremental change set on the intended feature branch, passing local checks, actual example, limitations and a local PR description using the four organizer headings. Obtain only the outstanding approval for concrete commit/push/PR/merge/submission actions under [AGENTS.md](../AGENTS.md). Earlier S1–S3 handoff approval does not cover web changes. No direct main push, deployment, external message or OrganizerHQ submission follows from this plan.

```text
Implement the local webapp track in docs/Webapp Parallel Implementation Plan.md while S4 continues separately. Read AGENTS.md, this plan, approved Phase 01/02/04/05/06, the engineering agreement, current shared types and HANDOFF_S1_S3.md; inspect live status/diffs and the actual remaining time before 06:30 IST. Preserve the active S4 checkout and visual worktree. Use the checked foundation and an isolated web working directory, with one writer for root workspace/lock/CI files. Build apps/web as a React/TypeScript report consumer with the bounded validated local reader, exact evidence navigation, source/provenance/coverage, stored finding/AI views and explicit portable import/export. Keep core/contracts/candidate reader read-only unless a concrete shared change is reviewed. Do not implement intelligence, model inference, monitoring or live browser analysis. Follow W0–W6 with actual checkpoints, keep 40 minutes for combined validation/delivery, and record partial gates honestly. Test real historical reports, inert mutation spans, malformed inputs, service/origin boundaries, inert content, keyboard/narrow/offline behavior and CLI/TUI parity when S4 is ready. Record exact implemented commands and actual generated evidence. Do not commit, push, publish a PR, merge, deploy, submit or send messages without explicit scoped approval.
```

## 9. Planning-session receipt

- Created this separate schedule and linked it from contributor/documentation entry points and Shane's plan; existing S4 work and historical research/evidence preserved.
- Read-only report inspection confirmed B1/B2/B3R/mutation have 19/143/31/20 change records respectively and zero stored findings. No analyzer/model was run to produce this plan.
- Documentation validation: all 15 preserved research checksums and `git diff --check` pass. Links/anchors in this plan and its updated entry points pass. The repository-wide scan finds one existing unrelated failure: `HANDOFF_S1_S3.md` links to `#repaired-foundation`, but the target heading in `Audit Repairs and Malhar Handoff.md` has stray text before its Markdown heading marker. That file was left unchanged.
- Implementation, browser QA, dependency admission and web CI are **not performed**; no product test pass is inferred.


## 10. Authorized execution checkpoint — 1 November 2026

**Authority:** Shane requested “Please begin keep the ui like the terminal cli.” W0 began at approximately **02:19 IST**, leaving approximately 251 minutes until 06:30; the plan's `min(240, remaining)` ceiling and final 40-minute reserve still apply. The deadline is not restarted by this checkpoint.

| Stage | Actual state |
|---|---|
| W0 | Isolated ignored copy `.heurisko/web-work` from published foundation `8134627`; reader/validation source hashes match the active checkout. Single root-file writer. No worktree/branch switch or commit for isolation. React/ReactDOM 19.1.8 match the terminal spike; exact types/build pins, licenses and official references are recorded in the web README. |
| W1 | Local validated service, explicit observation handles and original report digests; loopback/capability/Host/Origin/method/query controls; allowlisted compiled assets and CSP. Real B1/B2/mutation reports opened. |
| W2 | Terminal-style React workspace, six independent outcomes, historical notice, original identity/configuration, source/provenance/build facts, coverage/stage errors and unavailable findings/AI states. |
| W3 | Search/filter and 40-row change pages; raw record/full-member links; separate recorded byte spans, bounded pages/base64 and distinct absence/errors. Exact mutation span passes API/reopen tests. |
| W4 | Stored finding/AI rendering and explicit fresh-directory export/import implemented. Four actual cases export/reopen unchanged and match CLI JSON. Larger monorepo manifests use the web-only bounded duplicate-key/unsafe-number decoder after the reused metadata parser rejected B3R. No core/contract change. |
| W5 | Workspace typecheck/build/full G0, 15 web and 24 headless checks pass. Browser QA **partial**: initial wide Chrome overview and file navigation observed; later native automation was unreliable. Exact width/zoom/full keyboard/evidence round-trip/browser-offline checks remain unverified. Synthetic rendering tests cover unsupported/AI/inert-content states; they are not real analysis/model demonstrations. |
| W6 | Reviewed web-only additions copied into the active assembly, root workspace/lock/scripts/CI and docs updated. Usage, actual examples, source-bound receipt and local PR draft prepared. Commit/push/PR publication, exact-head remote CI, merge and submission remain unauthorised/unperformed. |

**Current files/commands:** [web README](../apps/web/README.md), [examples and receipts](../examples/web/current/README.md). `pnpm run build`, `pnpm --filter @heurisko/web typecheck`, `pnpm run test:web`, `pnpm web --report REPORT --store STORE`, `node apps/web/dist/export.js --report REPORT --store STORE --out NEW_DIRECTORY`, and `pnpm web --import EXPORT_DIRECTORY` now exist. New web CI job is configured, without a remote pass claim. The active branch remains `docs/share-research-with-team`; intended future feature branch is `web/local-evidence-explorer` after concrete delivery approval. The pre-existing dirty tree and separate visual worktree remain preserved.

**Unclosed gates:** W browser acceptance, shared review and genuine integrated finding/AI navigation; TUI parity when S4 is ready; full G3/G5/model/monitor obligations; remote delivery. No new model, inference, monitor, verifier, rebuild, hosting or final TUI design adoption. Product models: none. Coding assistance: Codex.
