# Shane-owned Parts 4–6 audit and repairs — 1 November 2026

Shane authorized auditing and repairing the existing TUI, CLI/shared-reader boundaries and local web application before any new Malhar integration. This audit does not authorize starting Part 5, adopting an intelligence module, changing G0/trust/isolation rules, installing dependencies or publishing work. The checkout already contained extensive tracked modifications and untracked implementation, documentation, examples and incoming materials. Those are the baseline, not changes attributable to this audit. The initial branch was `docs/share-research-with-team`; the initial index was empty. Concurrent final-hour documents/tooling, two web review-copy files and incoming core module/loader integration arrived during the audit. They are preserved separately and are not this audit’s authored fixes or module adoption. One acceptance attempt correctly failed its source-change guard during that work.

**Validation assembly:** concurrent incoming integration changed the active engine/index/package/lock graph and caused the later active full build to fail. This audit preserves it and validates a separate fixed assembly of the starting Shane scope plus these repairs. Engine/index/package/lock bytes recovered from the existing handoff worktree match starting hashes; the two altered web-copy files are restored only inside the copy after exact baseline hash verification. No original checkout file is reverted. Cached admitted dependencies are reused; incoming packages/loaders are absent from the isolated graph.

Concrete findings were communicated before their repairs. This record describes those defects and their regression cases. [Fresh audit receipts](../examples/shane-parts456-audit/2026-11-01/README.md) and [validation results](../examples/shane-parts456-audit/2026-11-01/validation.json) record exact commands, exit codes, counts, runtime and limitations. Earlier receipts remain historical and unchanged. Later integrated-engine checks belong to their separately identified receipts and do not certify this audit assembly.

## Findings and repairs

| ID | Severity | Confirmed defect | Affected boundary |
|---|---|---|---|
| A01 | High | A local FIFO blocked at file open before the bounded reader could reject its type. | CLI/TUI local report intake and shared bounded file reads |
| A02 | High | Replacement UTF-8 decoding could validate changed text instead of the original report bytes. | CLI file/digest report intake and stored report loading |
| A03 | Medium | CLI evidence inspection could return a matching CAS blob despite a report marking it unavailable or not exported. | CLI/reader parity and declared evidence availability |
| A04 | Medium | TUI raw-record mode could leak into a new citation while the title still described citation bytes. | Evidence navigation, byte labels and Back/re-entry |
| A05 | Medium | The Source summary omitted selection identity/claim and failure details and hid individual missing-byte reasons. | Source investigation and explicit unavailable states |
| A06 | Medium | Missing optional snapshot-digest metadata was presented as no source acquisition or comparison. | Source scope and truthful status |
| A07 | Medium | Mutable caller/exposed buffers could change downloadable observation bytes after a different report was validated. | Web admission, report-content identity and export |
| A08 | Low | An explicit empty package subtree rendered blank instead of repository root. | Browser source identity presentation |
| A09 | Medium | A retained delta citation could expose a range beyond the scope declared by its linked member record. | Shared-reader citation/member span binding |
| A10 | Low | Current documentation retained stale page counts, findings limits and incomplete Parts 4–6 status. | Usage documentation and implementation handoff |
| A11 | Medium | Distant documentation-search terms expanded excerpts into most of a section; an older test incorrectly assumed phrase-only matching. | Bounded multiword/quoted-phrase documentation search |
| A12 | Medium | A newly generated observation inherited the previous report’s filters and navigation state. | TUI observation-specific UI state |
| A13 | Medium | Source version presentation replacement-decoded base64/malformed UTF-8 citation bytes into a claimed version string. | TUI Source value decoding |

### A01 — reject nonregular local files before blocking

**Reproduction:** create an authored FIFO with `mkfifo` in a private temporary directory, without opening a writer. Reading it with `boundedFile`, `inspect FIFO` or redirected `tui FIFO` previously waited at `open`; the later `fstat` rejection never ran. This is a controlled filesystem failure case, not a package archive or real report.

**Repair:** [storage.ts](../packages/core/src/storage.ts) opens with the existing read-only/no-follow controls plus `O_NONBLOCK`, then requires a regular bounded file. It does not consume FIFO content or change archive/parser isolation. [CLI boundary regressions](../packages/core/tests/cli-boundary.test.mjs) exercise the direct reader with a child deadline and both actual CLI entry paths, requiring rejection without stdout.

**Validation:** CLI boundary regressions **5/5**, included in the completed **130/130** active pre-integration core suite; final isolated full-suite result is listed in the fresh receipt.

### A02 — preserve original report bytes during decoding

**Reproduction:** take an in-memory copy of the retained [B1 report](../examples/handoff/current/B1.report.json), add an audit sentinel, and replace one sentinel byte with `0xff`. Replacement decoding changes its bytes to a UTF-8 replacement character; the resulting valid JSON can otherwise pass report validation with a different content digest. File and digest routes must reject the original malformed byte stream. The retained report is never modified.

**Repair:** [validation.ts](../packages/core/src/validation.ts) adds strict byte decoding before the existing schema/semantic validator. [Stored report loading](../packages/core/src/storage.ts), [CLI intake](../packages/cli/src/index.ts), [TUI intake](../packages/tui/src/index.tsx) and [ReportReader byte/file intake](../integration/part4/src/report-reader.ts) use strict byte handling. BOM rejection is preserved; invalid UTF-8 is not silently repaired. [CLI boundary tests](../packages/core/tests/cli-boundary.test.mjs) cover malformed file/digest imports, unchanged valid report parity and BOM behavior.

**Validation:** CLI boundary regressions **5/5** and final isolated shared-reader/TUI suite **40/40** pass; valid report bytes and expected exit outcomes remain unchanged.

### A03 — honor the report's declared evidence availability

**Reproduction:** in an authored copy of retained B1, mark one originally retained member `not_exported` or `unavailable` while leaving its original hash-matching CAS bytes available. The shared reader returns metadata-only, but CLI `inspect --evidence` previously read and returned the blob. This tests viewer behavior on a deliberately altered report; it is not a new observation about the original package.

**Repair:** [CLI evidence inspection](../packages/cli/src/index.ts) requires `contentState: retained` before accessing the content reference. [State-parity regressions](../packages/core/tests/cli-boundary.test.mjs) check both declarations against the reader and require CLI exit 3 with no content output. No report state is rewritten because bytes happen to exist.

**Validation:** CLI boundary regressions **5/5** and final isolated shared-reader/TUI suite **40/40** pass.

### A04 — separate raw records from resolved citations

**Reproduction:** open the unchanged [user reproduction report](../examples/part4/user-failures/reproduction.report.json) with its retained store. In the actual TUI, use `3 → m → e` to inspect a modified file's artifact citation, then `r` to inspect the raw delta record. Previously raw-diff JSON appeared under a citation label, and `Esc → e` could remain in raw-record mode instead of reopening the canonical citation. The initial observed ranges were member bytes `[532,621)` versus raw-record bytes `[0,3426)`.

**Repair:** [App.tsx](../packages/tui/src/App.tsx) resets mode/side at citation entry and explicitly requests the canonical citation, avoiding stale state captured by an asynchronous read. Raw-record mode has its own title and record-byte label, with a visible toggle hint. [Evidence-mode PTY regression](../packages/tui/tests/evidence-mode.py) exercises the real wide/narrow keyboard flow and checks original raw/citation bytes and Back/re-entry. This uses retained report evidence, not simulated findings or a new analyzer result.

**Validation:** Final-source actual PTY regression **22/22** checks passes at wide/narrow widths. Raw/member digests, Back/re-entry and unchanged historical bytes are checked.

### A05 — retain source identity and individual read failures

**Reproduction:** open the unchanged user reproduction report and inspect Source. Its selected full commit, retained claim kinds, conflict codes and tag-lookup failure/limitations were available in retained evidence but absent from the summary. Repeat with an empty store, or an authored partial store containing the other unchanged claim blobs: each missing read must remain explicit alongside any successfully read selection. A missing record cannot supply version values or prove that a source tag is absent.

**Repair:** [investigation-summary.ts](../packages/tui/src/investigation-summary.ts) renders the recorded selection/full immutable identity, claim basis, conflicts, bounded read failures and lookup limits from hash-checked records. Individual unavailable records retain their evidence IDs and reasons. Summary truncation discloses further unread records. [User-failure regressions](../packages/tui/tests/user-failures.test.mjs) cover the original report, missing store and partial missing-claim case without changing historical evidence.

**Validation:** Final isolated shared-reader/TUI suite **40/40** and final-source original-report six-width screen matrix **159/159** explicit checks pass (six additional diagnostic rows are not counted as assertions). Earlier failing assertions/setup attempts remain recorded.

### A06 — missing optional metadata is not evidence of absent acquisition

**Reproduction:** the explicitly synthetic accepted [F0 report](../packages/contracts/tests/fixtures/F0/report.json) has source-member evidence and paired source/artifact changes while its candidate omits optional `sourceSnapshotSha256`. The Source summary previously inferred that source files were not acquired and no comparison was possible.

**Repair:** [investigation-summary.ts](../packages/tui/src/investigation-summary.ts) says the snapshot digest is unrecorded and directs readers to member records and stage coverage for actual acquired/comparable scope. The added [F0 regression](../packages/tui/tests/user-failures.test.mjs) protects this distinction. F0 establishes shape/presentation behavior only; it is not real acquisition, package analysis or joint-G3 evidence.

**Validation:** Final isolated shared-reader/TUI suite **40/40** passes, including the synthetic F0 scope assertion.

### A07 — bind admitted web bytes to the validated observation

**Reproduction:** copy the retained B1 bytes into a Buffer, call `observationFromBytes`, and mutate the caller Buffer before its promise settles. Before repair, changing the first `picocolors` byte to `x` left the validated reader at `sha256:2ddd237e2aba592d6901317a935d38495e0d58f7b207200f369a85a8855ba4da`, while downloadable bytes hashed to `sha256:c3777158de0d408814a5adf352940c4bb770c6d3c74c810df440d6640973074f`. Mutating an exposed `observation.raw` buffer also changed future downloads. This is an exported-helper/admission contract defect; the probe did not demonstrate a remote HTTP exploit. The original retained input remained unchanged.

**Repair:** [observation.ts](../apps/web/server/observation.ts) snapshots bytes synchronously before validation and exposes defensive copies through a readonly `raw` getter. Transport metadata assignment remains supported. [Observation identity regressions](../apps/web/tests/observation-identity.test.mjs) mutate input during validation and both input/exposed bytes afterward, requiring original-byte, report and full-digest equality.

The same A07 snapshot rule now applies to [opaque upload admission](../apps/web/server/workspace.ts). A controlled initialization gate showed that caller mutation changed the accepted selection; a child-isolated write-boundary probe showed original disk bytes hashing to `sha256:1d4e261b993c0be12a1e500c14accaf52949c9afbdde3daf48cd253d0ec4a19f` while returned metadata hashed to `sha256:1240877620ee134d317bbad0614effcb188d88de518e6e16c95acf02346bd58a`. Uploads now snapshot after synchronous limits checks and use one private byte sequence/digest for capacity, disk, metadata and response. [Upload identity regressions](../apps/web/tests/upload-identity.test.mjs) cover both timings. These are exported-helper/async-boundary tests, not demonstrated remote HTTP exploits.

**Validation:** Both pre-repair mismatches were reproduced with pinned Node **22.23.4**. Final isolated web suite **71/71** passes, including two observation and two upload identity regressions.

### A08 — distinguish repository root from unrecorded subtree

**Reproduction:** render Source using unchanged retained B1, whose candidates include explicit `subdirectory: ""`. The empty string previously produced a blank field, losing the distinction from undefined metadata.

**Repair:** [report-components.tsx](../apps/web/src/report-components.tsx) displays `(repository root)` for the explicit empty string and `not recorded` for undefined. [Source-subtree rendering regression](../apps/web/tests/report-overhaul.test.mjs) checks retained B1 and an authored copy with that optional field removed. No source candidate is selected or rewritten by the renderer.

**Validation:** Final isolated web suite **71/71** passes, including explicit-root/unrecorded rendering.

### A09 — enforce the linked member's citation scope

**Reproduction:** derive an authored valid report from the retained local-mutation report, restrict the linked member locator to `[0,0)` or a line-only/partial-byte locator, and recompute/replace its actual evidence ID. The retained manifest delta still requests its original artifact value range. Previously the reader followed the delta across the linked member's narrower/unsupported scope. Original report/blob bytes remain unchanged.

**Repair:** [readCitation](../integration/part4/src/report-reader.ts) refuses delta spans outside a recorded member byte range and refuses unsupported line-only/partial-byte scope. Whole-content members and compatible byte spans remain readable. [Shared-reader regressions](../integration/part4/tests/readiness.test.mjs) cover rejected and accepted ranges. This validates structural byte/reference scope; it does not replace Malhar's citation entailment or interpretation-quality work.

**Validation:** Final isolated shared-reader/TUI suite **40/40** passes, including narrower, line-only, partial-byte and contained-scope cases.

### A10 — reconcile current usage and status with source

**Reproduction:** compare [web usage](../apps/web/README.md) with the [16-page manifest](../apps/web/src/doc-model.ts) and actual findings pagination: it claimed 15 pages and a first-100 findings ceiling. The rolling plan's current Part 4 status also omitted separately authorized existing Part 6 workflows and could make unavailable TUI export sound like absent browser export. Current browser guidance retained an old globally blocked status despite later partial native observations.

**Repair:** current documentation distinguishes 16 pages, all matching findings in 30-record pages, workflow versus technical browser reference routes, implemented browser export versus unavailable TUI export, historical versus current observations, and separate Parts 4/5/6 gates. Current status updates belong in [plan section 12](Shane%20Implementation%20Plan.md#12-execution-checkpoint--update-after-each-part) and the normal continuation/entry documents. Historical receipt/checkpoint sections remain unchanged. [Current browser observations](../examples/web-overhaul/current/README.md#actual-browser-observations-and-remaining-acceptance) remain limited to their actual builds and journeys.

**Validation:** Current links, research checksums and exact command results are recorded in the fresh receipt; historical counts and acceptance limits remain labeled.

### A11 — bound multiword documentation search excerpts

**Reproduction:** run the full web suite against rebuilt documentation: 67/68 passed, with the old phrase-only assertion failing. The UI explicitly supports multiple words. Searching `exit 2` produced excerpts up to 1,763 characters, and `source replay` up to 1,253; a synthetic section with distant terms could return almost the whole section. This affects documentation presentation, not report evidence or analysis.

**Repair:** [doc-model.ts](../apps/web/src/doc-model.ts) emits merged match windows with every term and bounded context, at most 640 characters for the supported 256-character query. Quoted phrases remain exact. [Search regressions](../apps/web/tests/gap-batch.test.mjs) retain destination coverage, require all terms in bounded snippets, and test distant matches and quoted phrases. The earlier failure is preserved; the phrase-only assertion was reconciled with the existing multiword UI contract.

**Validation:** Earlier web run **67/68** failed and is retained. Final isolated web run **71/71** passes, including bounded distant-term and quoted-phrase search.

### A12 — isolate state when adopting a new report

**Reproduction:** set the original report’s confidence filter to `high`, then use Home → new retained-local target → Review → Start. The new observation’s UI profile inherited `filters.confidence: high` despite having no saved profile. The same adoption path carried section maps, related origin and citation/diff/tree state. The reproduced report still correctly showed unavailable analysis; this was a view-state contamination, not a fabricated verdict.

**Repair:** the TUI resets observation-specific state when adopting a report, then loads only that observation’s own saved preferences. The old observation/profile and immutable report are preserved. [App.tsx](../packages/tui/src/App.tsx) centralizes observation adoption for Start and Open; [the real local regression](../packages/tui/tests/report-adoption.py) verifies isolation, old-profile preservation and explicit old-observation restoration.

**Validation:** Final-source real retained-local engine/PTY regression **17/17** passes: fresh profile defaults, byte-preserved old profile and explicit old-observation reopening. Final primary TUI matrix **223/223** also passes.

### A13 — keep malformed version citation bytes unavailable

**Reproduction:** a controlled read-boundary wrapper over the unchanged reproduction reader returns a version citation with `encoding: base64` and the quoted invalid UTF-8 bytes `22 c3 22`. The existing summary replacement-decoded them and displayed a replacement character as the selected source version. This is a synthetic reader-boundary regression; the current producer rejects malformed manifests, and this probe is not a claim of accepted live acquisition.

**Repair:** Source version values require UTF-8 content and strict decoding before JSON value parsing. An unavailable or malformed recorded version citation cannot be replaced with an inferred first-manifest version. The no-version-delta fallback remains scoped to actual readable manifest records. [The Source helper](../packages/tui/src/investigation-summary.ts) and [negative read-boundary regression](../packages/tui/tests/user-failures.test.mjs) retain explicit failure reasons and original report bytes. The original evidence bytes and unavailable states are preserved.

**Validation:** Final isolated shared-reader/TUI suite **40/40**, final-source original-report screens **159/159**, and primary PTY matrix **223/223** pass. Negative read responses remain synthetic; no malformed live acquisition is claimed.

## Part 5 and remaining acceptance gates

Read-only source inspection found no selected-package watch commands, discovery/checkpoint store, durable monitor jobs, retry scheduler or recurring runner. G0 WatchState/Job fixtures are synthetic contracts. Durable parser cleanup/recovery records belong to static parsing; process-local web investigation jobs are not durable monitoring. Existing TUI/browser monitoring surfaces remain explicitly unavailable/unconfigured. **Part 5 is not authorized or started by this audit**, and no monitoring completion or automatic freshness claim follows from these repairs.

The isolated pre-integration audit assembly does not inject an analysis module by default. Concurrent active-checkout module integration is preserved and is outside this audit’s certification. Existing Malhar handoff archives, patches, isolated code and sample results are immutable external inputs; this audit does not edit, regenerate, relabel, install or adopt them. Rendering existing retained findings or using synthetic report fixtures does not establish intelligence/build interpretation, retrieval/model/citation-validation quality or Malhar sign-off.

Human TUI visual/usability acceptance, final browser viewport/zoom/keyboard/nested-focus/native import-download/external-offline journeys, actual assistive-technology review, joint G3 and shared finding-quality/module acceptance remain separate gates. No automated result implies WCAG conformance, final design approval, general cross-platform support, meaningful live open-model work, verifier/policy acceptance, rebuild capability or complete P04.

## Validation and review handoff

The linked receipt records exact commands, exits, counts, runtime, failures and source/build identity. Final isolated workspace build/typecheck, full unchanged G0 checks, shared-reader/TUI **40/40**, web **71/71** and four retained transport cases pass. Actual final-source PTYs pass the primary **223** checks, original-report screens **159** explicit checks, evidence-mode **22** checks, observation adoption **17** checks and the named live snapshot/cancel scenario. Earlier extra/navigation/state matrices and all failed setup/assertion attempts retain their own source phase and counts. Core and real-engine acceptance results are recorded separately below and in the receipt. A later active build failed in incoming `intelligence-reviewed`; one active API acceptance failed its source-change guard. These failures do not become passes through the isolated results. Browser automation was blocked or lacked observable content; no new GUI/AT acceptance is inferred.

No target package/lifecycle/build/model execution, dependency installation, Part 5 implementation or Git/publication action was performed by this audit. The documented exact parser image was restored for the approved local validation workflow. The receipt includes audit-file identities, starting/final status and preservation checks; its file list distinguishes these repairs from unrelated baseline/concurrent work. All changes remain unstaged for Shane’s review.
