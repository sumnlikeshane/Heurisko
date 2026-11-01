# Part 4 Integration Readiness Report

**Current, 1 November 2026: S4 minimum PASSED locally; joint G3 OPEN.** See [resumed product integration](#resumed-product-integration--1-november-2026) for the superseding B01–B13/S01–S09 statuses and evidence. Full candidate-design acceptance remains open.

**Historical nonvisual integration checkpoint:** Shane authorized this track while a separate React/Ink visual spike owns appearance, components, keyboard/focus behavior, layouts, theming and responsive behavior. This report records an integration audit and isolated candidate adapters, not a completed TUI or a competing implementation plan. The canonical [TUI Design Contract](Design/TUI%20Design%20Contract%20v1.0.0.md) remains **v1.0.0-rc.1, unapproved and unfrozen**; its 59 confirmed directions are preserved.

**Later authorized repair follow-up:** Shane subsequently requested fixing the audit issues. See [audit repairs and Malhar handoff](Audit%20Repairs%20and%20Malhar%20Handoff.md) for executable/config identity, complete terminal progress, conservative create-acknowledgment recovery and final serial validation. The checkpoint below remains historical. The specific lost-acknowledgment cleanup path is repaired; the historical assertion/orphan causal link remains unproven. B02 also includes unavailable partial feeds, inference cancellation acknowledgment and detach/retry, so this does not sign off S4/G3.

## Verified S3 baseline

- Branch `docs/share-research-with-team`, HEAD `0e2be5a105548b237328879f29c969640d767ec5`; the existing dirty S1–S3 work and received inputs were preserved. The separate `experiment/tui-visual-spike-v0.1.0` worktree was inspected through Git status only; its untracked `experiments/` work was not changed, imported, merged or cherry-picked.
- Node **22.23.4**, pnpm **10.14.0**, host validator Python **3.13.2**, existing digest-pinned Linux parser Python **3.13.18**, macOS arm64. Current typecheck and full G0 validation pass; **17/17 foundation, 48/48 S2, 36/36 S3** pass locally. No dependency, verifier, React/Ink version, model or shared contract was admitted or changed here; no new remote CI result is claimed.
- [Independent current-code/corpus verification](../integration/part4/receipts/baseline-verification.json) rechecks **2,988 evidence references, 1,028 raw-difference side spans and 146 manifest-value spans**. B1/B2/B3/B3R retain their original report IDs, artifact digests and configuration fingerprints. All four remain exit **2**, with unavailable analysis/requested policy indeterminate and provenance `not_checked`. B1 is ambiguous; B3 retains unsupported source scope; B3R retains explicit `packages/shared` context and omissions. These are source candidates, not verified release-source bindings.
- Validation caveat: the sandbox-denied S3 attempt failed closed. The first socket-enabled run passed **35/36**, failing the scoped fixture's `publisher_asserted` expectation with actual `ambiguous`. Its isolated rerun passed **1/1** and an unchanged full rerun passed **36/36**. A later audit found one never-started parser container from that first socket-enabled run after its temporary store had disappeared. Its exact stopped state was verified before removing that one job. **The cleanup/lifecycle anomaly remains a foundation integration blocker**; passing retries do not resolve it or establish its root cause. See [the operational receipt](../integration/part4/receipts/readiness-validation.json) and B02.

## Real report-to-screen mapping

These paths refer to the actual [G0 types](../packages/contracts/src/types.ts), [approved Phase 02](Approved/phases/HEURISKO_PHASE_02_CLI_TUI_INVESTIGATION_APPROVED_v0.2.0.md), and current engine. Additional adapter facts are outside the immutable G0 report; none is a schema extension.

| Surface | Actual fields/seams | Availability and exact limit |
|---|---|---|
| Home/recent/open | `reportId`, `createdAt`, `outcomes.analysisCompleteness`; CAS `runs/<reportId>/<full-report-digest>.json` | Validated file opening works. Core has no public recent-report enumeration, durable investigation-job history, or failed-job list API. A report ID can have several immutable observations; retain its full content reference too. |
| Setup/review | `ArtifactInput`, `AnalysisOptions`, `SourceOverride`; `validateInput`, `npmCoordinates`, `pinnedSourceURL`, `safeSubdirectory` | Exact npm/scoped/prerelease syntax and full-commit/subtree checks exist. Validation does not resolve bytes. No reusable resolved-target/preflight-to-investigate handoff binds reviewed bytes/configuration to Start. Digests/association/config fingerprint can be unknown before collection and must say so. Historical local `artifactPath: retained:sha256:…` is not an executable filesystem replay path. |
| Identity/overview | `bundle.artifact.{origin,packageName,version,artifactFilename,observedSha256,captureTime,integrity,metadataEvidenceId}`, `reportId`, `createdAt`, `analysisConfigFingerprint`, `fixtureKind` | Expose local input separately. Saved/historical/incomplete are independent attributes; opening a file proves neither a fresh check nor a successful prior engine persistence operation. |
| Six independent outcomes | `outcomes.{artifactIntegrity,sourceAssociation,provenancePolicy,correspondence,analysisCompleteness,policyResult}` | Pass through exact stored enums; preserve combinations such as integrity matched + ambiguous source + unresolved correspondence + incomplete analysis. AI is separate. No overall score/verdict. |
| Findings/detail | `analysis.findings[]`: `findingId`, `title`, `observation`, `whyItMatters`, `evidenceIds`, `severity`, `reviewPriority`, `evidenceConfidence`, `explanationStrength`, `limitations`, `nextActions`, `ruleId`, `ruleVersion` | All six required explanation sections have fields. Default product reports have no analysis module. Retained M1 results exist separately. A finding “type” taxonomy is absent; `ruleId` is available without inventing one. Final sort tie-breaks remain provisional. |
| Files/diffs | `bundle.changes[]`: `changeId`, source/artifact paths, `status`, `rawEquality`, `explanationStrength`, evidence links/notes; member records in `bundle.evidence` | Stable change/evidence IDs exist. Raw delta records retain enclosing byte spans and member references. No hunk synchronization, renamed-file proof, normalized transform implementation, or generic line-range resolver exists. Binary bytes remain inspectable as encoded bytes. |
| Evidence | `evidenceId`, `kind`, `side`, `locator.{path,metadataKey,startLine,endLine,startByte,endByte}`, digest/ref, method, `verification`, `contentState`, limitations | Candidate reader returns exact byte windows or explicit metadata-only reasons. Retained, not exported, unavailable, missing blob, corrupt blob, unsupported record, invalid range and line-only range remain distinct. JSON delta-record offsets are not source-code offsets. |
| Source candidates | `sourceCandidates[]`: repository/full commit/subdirectory, snapshot/build-context digests, association, conflicts, evidence IDs | Selected source is recorded in retained versioned `source-selection`/claim evidence, not a candidate `selected` field. No candidate ID field; do not assume array index 0 is the chosen target. Alternative-target action must start a new review/investigation; it cannot edit a report. |
| Provenance/build | `bundle.provenance.{status,artifactBinding,policyRef,evidenceIds,limitations}`; provenance/build records; build stage and raw source config evidence | `verified_cryptographic_only` and `verified_policy` differ; current provenance remains `not_checked`. No admitted verifier, reproduced build or typed signer/issuer/builder summary is operational. Config/source-map clues are not reproduction results. |
| Live stages/errors | `StageProgress {stage,status,completedUnits?,totalUnits?}` via `context.onProgress`; final `bundle.stages` and `analysis.stages`, with structured errors | All ten stage names/six statuses exist. Actual callbacks emit only a subset of transitions, no unit counts, diagnostic events, live evidence IDs or partial-report feed. Final records supply additional facts; absent live events are not invented completed/skipped stages. No ETA or percentage. |
| Coverage | `coverage.{artifactFiles,sourceFiles,comparedFiles,analyzedBytes,skippedBytes,unsupportedBytes,omissions,complete,limitations}` | Known observations, not necessarily whole-archive totals or a security-analysis denominator. `comparedFiles` counts change records, including one-sided paths; source totals can include broader context. No universal fraction is justified. Unavailable heuristics gives an unknown examined-scope finding count, while preserving any recorded findings. |
| AI | `analysis.aiState.{status,modelId?,reason?,validation}`, `interpretations[]` with hypotheses, citations, alternatives, missing evidence, actions, abstention, model/runtime/prompt identity | Six AI states are representable; schema validation is not entailment. Exact weight/quantization/runtime/consent metadata would require actual retained configuration evidence. No live product model or processor is configured here. |
| Monitoring | G0 `WatchState`/`Job` types only | No store/runner. Schedule, baseline, last completed analysis and job-to-report reference are not present in these types. Do not compute staleness or advertise background work. Part 5 remains unauthorized. |
| Historical/export | `decodeReport`/`encodeReport`, CAS and immutable CLI report writes | Offline replay can preserve metadata without all bytes. Existing CLI `inspect` eagerly verifies all retained evidence and can fail on one missing blob; candidate reader permits metadata inspection. Canonical report+evidence export manifest/preflight/import packaging is absent; Part 6 has not begun. |

## Completed nonvisual work and tests

The isolated [report reader](../integration/part4/src/report-reader.ts) validates through existing G0 boundaries, freezes the report, preserves original input content identity, and reads only SHA-256-named blobs from an explicitly selected local store. It performs no store initialization or writes, path-based member access, fetching, target execution or analysis. Raw reads stream/hash the complete bounded blob before releasing a window: **32 MiB blob cap, 64 KiB page cap, 256 KiB strict versioned-record parsing, 8 MiB report cap**. These are local adapter limits, not changes to foundation limits. Byte offsets are zero-based and half-open, as used by S2/S3; paging offsets are relative to the recorded range. Split UTF-8 windows fall back to base64 instead of fabricated replacement text. Line-only citations remain metadata-only.

The [lifecycle candidate](../integration/part4/src/investigation-task.ts) calls the same `investigate`, snapshots inputs, forwards bounded progress (128 retained events with omission count), isolates observer exceptions and validates the final result. `cancel()` requests `AbortSignal` cancellation; `result` waits for core settlement. It never claims cancellation acknowledgment, confirmed whole-job cleanup, detach, retry or live partial reports. Even core settlement cannot prove an in-process analysis module's background work stopped.

**24/24 [headless checks](../integration/part4/tests/readiness.test.mjs) pass**, with an isolated TypeScript 5.8.3 compile. Coverage includes actual B1 conflicts, B3 partial source scope, B3R omissions, S3 inert-mutation manifest byte spans, raw-diff sides, retained M1 lifecycle citations, missing/not-exported/unavailable bytes, corruption and symlink/size limits, large/binary/Unicode/ANSI/OSC/bidi data, immutable historical reports, false-zero prevention, six synthetic AI states, lifecycle cancellation/error/progress boundaries, and current redirected CLI parity. Lifecycle mocks and AI-state fixtures are explicitly synthetic; the actual core cancellation check is pre-cancel validation, while existing S2 tests exercise real parser cancellation. No live Ink/copy/focus/resize or model test ran.

Reproduce after the existing S3 setup/build, from the repository root:

```sh
export PATH="$PWD/.tooling/node-v22.23.4/node-v22.23.4-darwin-arm64/bin:$PWD/.venv/bin:$PATH"
node_modules/.bin/tsc -p integration/part4/tsconfig.json
node --test integration/part4/tests/readiness.test.mjs
```

These checks are deliberately outside root workspace scripts/CI until integration; they are **not `test:s4`**. No frozen install was repeated or needed: existing pinned tooling was reused. [Validation receipt](../integration/part4/receipts/readiness-validation.json) records actual checks and the operational caveat.

## B01–B13 gap status

| Gap | Status at this checkpoint | Remaining evidence/action |
|---|---|---|
| B01 — actual governing sources | **Audit closed** | Actual Phase 02/types/engine read and mapped above; this is not design approval. |
| B02 — progress/cancellation/partial lifecycle | **P0 open** | Candidate forwarding/cancel-request checks pass. Core lacks live evidence/diagnostic references, reliable complete stage feed, cancel acknowledgment and detach/retry. Investigate the observed late-created orphan/removed-store anomaly in an explicitly authorized foundation repair; prove whole-job cleanup before live acceptance. |
| B03 — stable IDs/raw ranges | **Partially ready** | Actual IDs and S2/S3 byte spans pass candidate-reader tests. Line-only/unknown transform or unbound references return metadata; real Ink citation navigation and joint finding report integration remain untested. |
| B04 — independent semantics/denominators | **Nonvisual mapping ready; acceptance open** | Conflicting outcomes, failed heuristics, known empty subset and broader-source omissions tested. Renderer must use null/unknown counts and no unsupported bars; type filters and sorting need explicit semantics. |
| B05 — terminal safety/copy | **Partially ready** | Inert string helper and hostile byte/path tests pass without changing recorded values. Every widget/log/model-text path still needs end-to-end validation; clipboard policy and width handling are not implemented here. |
| B06 — exact keys/quit/input precedence | **Visual spike / later integration** | No keyboard/focus code touched. Context transition table and actual terminal tests remain pending. |
| B07 — preflight/new target/immutable history | **Partially ready** | Input/identity/replay validation and report immutability tested. Resolved-target handoff, reviewed-bytes revalidation, real local replay path and new-target action are missing; no Start flow built. |
| B08 — evidence return/reflow/availability | **Partially ready** | Availability/range/binary fallbacks tested. Back-stack, search/filter/focus/scroll restoration through resize belongs to the spike and integration. |
| B09 — monitoring | **Unavailable; Part 5 dependency** | No schedule/baseline/freshness/restart runner contract or tests. Only an honest unavailable/unconfigured surface is currently supportable. |
| B10 — export | **Unavailable; later viewer/export work** | Existing immutable JSON writes do not establish an evidence bundle/manifest exporter. Preflight, collision/atomic-write/error handling and included-byte semantics remain open. |
| B11 — AI | **State mapping ready; product dependency open** | Six synthetic state projections and real model-off evidence tested. Consent/configuration, runtime/weight metadata, live inference and claim-quality acceptance remain Malhar/joint dependencies. |
| B12 — responsive implementation/UI state | **Visual spike pending** | No panes, hunk alignment, size limits, UI-state storage or migration implemented/reviewed here. |
| B13 — visual accessibility | **Visual spike pending** | No theme, contrast, palette, glyph, focus or no-color terminal captures claimed. |

## S01–S09 acceptance readiness

| Scenario | Available evidence now | Remaining acceptance |
|---|---|---|
| S01 exact npm/local preflight | Exact input checks, real npm/local identities and honest AI/source unknowns mapped | Separate review/Start flow and resolved-target binding; no unreviewed Start. |
| S02 source conflicts | Real ambiguous B1/outcomes/context/immutable report tested | Three Source subtabs and new-target review producing a new report; no historical mutation. |
| S03 lifecycle citation | Real S3 mutation value span and separate real M1-on-S2 lifecycle citation resolve | Actual adopted analysis revision/report, Ink finding→evidence→Esc round trip and precise restored context. |
| S04 failed heuristics/scope | Null examined-scope counts vs known subset zero; actual omissions/partial scope | Verify all rendered empty/count/coverage states; no fake full bar. |
| S05 large/binary/unsafe path | Bounded hash-checked paging, base64 fallback and inert full-value rendering | Tree/flat/diff/reflow/scroll interactions and safe copy policy in actual terminals. |
| S06 historical incomplete/export | Historical metadata opens with absent bytes; invalid schemas/corruption fail explicitly | Persistent rendered notice and real supported export preflight/outcome; exporter absent. |
| S07 monitoring stale/restart | Missing runner/schedule identified; no stale assertion manufactured | Deferred to authorized Part 5; no monitoring acceptance claimed. |
| S08 quit/back/interrupt/resize | Candidate cancel-request/settlement, observer failures and real core pre-cancel validation tested; S2 real parser cancellation tests pass | Resolve B02 operational anomaly, then real hot cancellation, keyboard precedence, exit and 3→2→1 state preservation. |
| S09 AI states | Deterministic report preserved through six labeled synthetic AI states and real model-off replay | Visible setup choice, actual runtime diagnostics and rendered failed/rejected/abstained behavior; genuine inference remains separate. |

**No S01–S09 screen scenario is signed off end to end by this headless track.** Non-TTY baseline checks confirm default help, one JSON `inspect` result with exact report identity, exit 2 for incomplete reports and exit 3/empty stdout for invalid targets. The product `tui` route is still absent and returns 3; interactive launch has not been tested.

## Missing dependencies and proposed integration points

1. **Visual spike handoff:** exact reviewed React/Ink versions/digests/admission, source boundaries, terminal captures and supported platform. Only a later authorized integration should consume it. This session did not read its implementation or change its files.
2. **Foundation repair/interface work:** B02 anomaly and observable whole-job lifecycle; complete/diagnostic progress and partial-evidence references; resolved-target review handoff; recent-report indexing and local retained-archive replay. These are recorded needs, not invented APIs or changes made to core/G0.
3. **Malhar:** received M0 archive and separate M1 patch remain available in isolated reviewed copies. Their current source/compiled digests match the S3 receipts. Existing B1/B2 M1 results record **14/140** findings; the retained S2 mutation result records **16**, including lifecycle findings. This session revalidated the latter output's G0/reference boundary and raw citation, without invoking or adopting the module. Both revisions identify as `@heurisko/intelligence 0.1.0`; final adoption must distinguish the exact revision/digest/configuration. Do not overlay saved analysis on an old report while keeping its ID/configuration. Explanation quality, build interpretation, labels, genuine model/runtime/evaluation and joint G1/G3/G4 remain open. No intelligence resolver was added or supplied to Malhar.

Proposed consumption boundary, pending integration review:

```ts
const reader = await ReportReader.openFile(reportPath, storeRoot);
const facts = reportFacts(reader); // raw stored outcomes and scoped counts
const detail = reader.evidence(evidenceId); // frozen original metadata
const page = await reader.readEvidence(evidenceId, {offset: 0, length: 4096, signal});
const span = await reader.readCitation(evidenceId, 'artifact', {signal});
// span.member identifies the raw file; span.evidence identifies its delta record.

const task = startInvestigation(input, options, {context: trustedCoreContext});
const unsubscribe = task.subscribe(observedState => {/* renderer owns display */});
task.cancel(); // request only; keep awaiting task.result
const result = await task.result; // original validated report or fixed error
```

Use these as candidate APIs outside `packages/contracts`, not approved shared-contract changes. Renderer code owns navigation, focus, keyboard, layouts, sorting/filter presentation, width measurement and UI state. Render every untrusted string through inert handling; never render a retained delta JSON record as a guessed source snippet. Preserve report ID **and full report content reference** when resolving an observation. Do not advertise unavailable monitor/export/AI/build actions as functional. Live investigation wiring remains held at B02.

## Exact files changed and remaining Part 4 work

New files: this report; `integration/part4/tsconfig.json`; `integration/part4/src/report-reader.ts`; `integration/part4/src/investigation-task.ts`; `integration/part4/tests/readiness.test.mjs`; `integration/part4/receipts/baseline-verification.json`; `integration/part4/receipts/readiness-validation.json`. Updated: `AGENTS.md`, `README.md`, `docs/README.md` and section 12 of `docs/Shane Implementation Plan.md`. No product/core/CLI/contracts, lockfile, CI, research, fixture, original capture, Malhar source or visual-spike file was changed by this track.

After the spike finishes: review its concrete deliverable without assuming design approval; resolve the foundation blocker under explicit authority; agree/adopt the candidate data boundary; wire default TTY/explicit `tui` and useful non-TTY behavior while preserving automation; complete setup/history/evidence/error states and actual analysis integration; run real keyboard/citation/hot-cancel/resize/accessibility tests in all three width bands and short terminals; record unsupported monitoring/export/model dependencies honestly. Only then reassess S4 and joint G3. Final contract approval still requires the user's explicit acceptance of a named version.

**Stopped at the nonvisual integration checkpoint.** No Part 5, intelligence implementation, commit, push, merge, PR publication, deployment, submission or external message. Clock and remaining Part 4 allowance are recorded in the [single execution checkpoint](Shane%20Implementation%20Plan.md#part-4-nonvisual-integration-checkpoint--1-november-2026).

## Resumed product integration — 1 November 2026

This section supersedes the nonvisual statuses above. Shane authorized local Part 4 integration, narrow F21/B02 repairs and actual terminal validation after visual revision 7. The sibling worktree is preserved; there was no merge, cherry-pick or overlay. [Adoption inventory](../packages/tui/adoption.json) identifies the seven reviewed data-independent files copied/adapted. Fixture screens, fixture contracts, fabricated report/monitor projections and experimental runtime entry were excluded. The design remains **v1.0.0-rc.1, unapproved/unfrozen**, with all 59 directions carried forward and remaining gaps explicit.

**Gate: S4 minimum PASSED locally; joint G3 OPEN.** The local S4 minimum and joint G3 are assessed separately below. No Part 5 work is authorized by this checkpoint. [Final receipt](../integration/part4/receipts/resumed/validation.json), [CLI/span parity](../integration/part4/receipts/resumed/parity.json), [real exact-job hot-cancel proof](../integration/part4/receipts/resumed/hot-cleanup.json) and the terminal attempt inventory preserve the actual boundary. Earlier failed attempts remain historical rather than being edited into passes.

Implemented entry points: no-argument `heurisko` opens the Ink Home when both streams are terminals; root `--store/--no-color/--ascii/--palette` configure it. `tui REPORT` opens a validated immutable observation; redirected `tui` emits an inert historical summary with the shared exit status. Default redirected invocation remains help; `analyze/inspect --json` retain their automation. [Usage and controls](../packages/tui/README.md) document the exact routes, limits and persistence.

The product consumes the reviewed reader/task adapters directly. It has real report indexing/open/error states, separate exact-target review, core stage/error progress and cancellation that waits for settlement. Local artifact and explicit source-archive bytes are retained through the existing bounded immutable store before Review; the original filename is preserved and Start rechecks/uses those snapshots. The live keyboard test changes its own original archive after Review and proves the report used the reviewed digest. npm review validates exact coordinates and source overrides but explicitly leaves unresolved digest/source identity unknown until acquisition; it is not a frozen resolved-registry handoff. An alternative source action prepares a new review, preserving the old report.

Files use a data-only expandable tree/flat list and bounded raw source/artifact changed-byte windows, with paired wide/sequential narrow display, pan and explicit truncation. These are independently addressed byte windows, **not a claim of line/hunk alignment or normalization**. Citation detail uses exact retained ranges or named metadata-only reasons. All untrusted data uses inert grapheme-aware rendering. Copy is manual inert text; the UI issues no clipboard/hyperlink controls. UI state v1 is keyed by report ID **and observation digest**, outside immutable reports; current location/filter/focus/scroll/pan persist and corrupt state resets visibly. Full preference persistence/migration remains open. Loading stored UI state cannot overwrite a newer keyboard action.

### F21/B02 diagnosis and repair proof

The original assertion/orphan causal link remains unproven. The identified failure class is a Docker client losing create acknowledgment while the daemon completes later; a momentary name-not-found response cannot establish cleanup. The previously adopted audit repair already retains durable job/spool/locks on that path. This session adds post-removal absence confirmation for the acknowledged immutable container ID and strengthens test teardown to retain either lock or any parser scratch record. No parser resource/mount/network/user restriction or host-fallback rule is weakened. Each Docker control command remains bounded to 10 seconds; kill, removal and absence inspection can together extend cleanup through three such windows after the 30-second create/parser windows.

Two targeted regressions prove that a delayed removal holds spool and both locks and blocks reuse, and a late acknowledgment after timeout never starts the job and awaits exact removal. Existing lost-acknowledgment/recovery cases remain. The actual restricted authored-worker probe observed a running PID, canceled it, and confirmed ID `e60a192cc58f25ba4c046d6cee0cbbb0f50f32a362908158989a628e898dd7a8` absent before reuse/removal. The actual product Ctrl+C test independently checks its exact store label has no jobs, both locks are absent and scratch is empty after engine settlement; it retains its store. Core settlement still does not expose a typed whole-job acknowledgment to the TUI, and the UI says so.

Final inventory additionally discovered two **pre-existing** never-started jobs created at **01:10:18/01:10:41 IST**, before this resumed session. Their historical temporary roots were already absent. Their exact names/IDs, matching store labels, non-root/read-only/no-network configuration, `created` state, PID 0 and zero start times were checked before non-forced exact-ID removal; absence was confirmed independently. No store was recreated, reused or deleted by that recovery. [Sanitized recovery/inventory](../integration/part4/receipts/resumed/final-jobs.json) records both; raw host-path details stay in ignored private tooling output. Final inventory is empty. These newly observed older objects were not covered by earlier cleanup claims; their original causal chain remains unproven. The current regression/probe evidence is distinct from that historical gap.

The first full core run passed 116/117: stricter teardown retained the lock deliberately authored by the interrupted-publication fixture without any parser job. The fixture now explicitly releases only its own known lock after checking empty scratch; the final serial run passes **117/117**. That initial failure and the earlier preflight/keyboard/render-test failures are recorded in the final receipt. They do not justify releasing a real unresolved store.

### Current B01–B13 status

| Gap | Observed status | Remaining boundary |
|---|---|---|
| B01 governing sources | **Closed for implementation audit**: actual Phase 02, G0 types, engine and design read; original field mapping retained. | No final design approval. |
| B02 lifecycle | **F21 class locally repaired/proven; interface partial**: 15 repair checks, delayed locks/ack tests, actual running-job cleanup and actual keyboard cancellation settlement. Ten stages/errors render without percentages. | No live evidence feed, detach/retry or typed cleanup acknowledgment; uncertain jobs remain closed for explicit recovery. |
| B03 identity/raw spans | **Local acceptance passed**: real M1 lifecycle finding and exact `[585,611)` artifact value, shared CLI/report identity and bounded reader. | Unsupported/line-only/unbound content stays metadata-only; no guessed ranges. |
| B04 independent semantics | **Local checks passed**: six outcomes, unknown examined counts, recorded findings, separate priority/severity/confidence/rule filters and scoped coverage. | No universal coverage bar/denominator or safety score. |
| B05 terminal safety/copy | **Local inert-render checks passed**: ANSI/OSC/bidi/long paths and bytes; binary base64; manual full-value inspection. | Automated clipboard/copy unavailable; no native screenshot or universal Unicode/platform guarantee. |
| B06 keys/input | **Local keyboard checks passed**: q exits app; Esc returns; text owns ordinary shortcuts; palette/help/focus and cancel/wait observed. | Bindings are tested implementation choices, not a frozen design version. |
| B07 review/history | **Local snapshot/review passed; registry handoff partial**: immutable local bytes, mutation-after-review proof, exact npm/scoped/prerelease validation, new-target review, old bytes unchanged. | npm identity is unresolved until Start; alternative-target Start was not separately exercised online. |
| B08 evidence return | **Local acceptance passed**: citation → exact content/metadata → semantic origin with selection/filter/focus/scroll, across 3→2→1 panes and recovery. | Raw byte windows are not line-aligned hunks; whitespace-only redraw differences are not pixel-identical screen restoration. |
| B09 monitor | **Truthfully unavailable**. No freshness/stale assertion or watch simulation adopted. | Part 5 runner/schedule/baseline/restart remains open. |
| B10 export | **Truthfully unavailable in TUI**. No output-success or included-byte claim. | Separate browser exporter was not adopted or extended; full export scenario remains open. |
| B11 AI | **Presentation checks passed; product dependency open**: disabled/unavailable plus labeled failed/rejected/abstained synthetic states, deterministic evidence preserved. | No model selected/invoked, consent/runtime/weight evidence or interpretation-quality acceptance. |
| B12 responsive/state | **3/2/1 pane checks passed locally**, recovery below tested 60×20, tree/flat and raw pan, corrupt/reset state. | Full per-section/filter/tree preference durability, migrations and line/hunk alignment are not complete. |
| B13 accessibility | **Partial local evidence**: text focus/selection, ASCII/no-color and palette terminal checks. | Human visual/native screenshot review, complete contrast/glyph/accessibility certification and design freeze remain open. |

### Current S01–S09 status and gates

| Scenario | Observed evidence | Status/remaining dependency |
|---|---|---|
| S01 exact npm/local review | Actual local review → Start → cancellation; snapshot survives original change. Exact scoped prerelease review is keyboard tested with AI limits. | **Local flow passed; resolved npm preflight partial**. Unknown remote digest is explicit until Start. |
| S02 competing source claims | Actual historical B1 conflict, Source subtabs and new-target review; original report hash preserved. | **Review/navigation passed; full alternate-target online Start not exercised**. |
| S03 lifecycle citation | New current-engine M1 mutation report, 16 actual findings, lifecycle detail → exact inert bytes → Esc origin in all three bands. | **Passed locally**. M1 is a reviewed validation injection, not automatic product adoption. |
| S04 failed heuristics/scope | Actual producer-unavailable report facts and labeled failed-stage render cases retain Unknown/Not evaluated; headless known-subset-zero cases pass. | **Unknown/error presentation passed**; no clean-result inference. |
| S05 large/binary/unsafe content | Bounded reader plus actual synthetic control/binary PTYs, tree/flat/raw span/pan and large real historical report inspection. | **Local presentation checks passed**; automated clipboard and semantic diff remain unavailable. |
| S06 historical incomplete/export | Persistent historical notice, missing store/bytes metadata and invalid/open errors. | **Historical/error passed; export unavailable**, full export scenario open. |
| S07 monitoring stale/restart | Honest unconfigured runner/freshness unknown surface. | **Unavailable/Part 5 dependency**, no monitoring acceptance claimed. |
| S08 keys/interrupt/resize | Actual q/Esc/text/palette/Tab; live cancel waits, exact-job probe; 160→120→84→55×14→160 preserves inspection. | **Passed locally for available lifecycle**; typed cleanup acknowledgment/detach unavailable. |
| S09 AI states | Actual model-off report and explicitly synthetic failed/rejected/abstained/unavailable/disabled render cases retain deterministic evidence. | **Unavailable-state presentation passed**; genuine inference/evaluation remains separate. |

**S4 minimum PASSED from the final local terminal receipt:** genuine keyboard operation, real report/raw evidence, errors and unknowns without AI. Passing that gate does not close every candidate design scenario. **Joint G3 remains OPEN:** newly started product investigations still have no adopted intelligence module; final M1 quality/module acceptance and joint finding review remain dependencies. In particular, M1's lifecycle limitation says values were not retained although the reader resolves the exact value; the TUI preserves the stored statement instead of rewriting it. No model work, full P04 completion, final design approval or remote CI pass is inferred.

Exact new/modified file inventory and reconciled time are in the final receipt and plan section 12. All original public reports/receipts remain historical and unchanged. A [new current-engine local M1 report](../examples/part4/current/README.md) supplies fresh code binding after the narrow parser change; no old report was mutated. No staging, commit, push, merge, PR publication, deployment, submission or external message; no Part 5 implementation.

**Final reconciled Part 4 clock:** validation/review checkpoint **1 November 03:39:36 IST**, resumed start **03:12:18 IST**: **27m18s** this resume. Earlier measured nonvisual work **16m26s**, so known measured nonvisual + resume is **43m44s**, plus **unmeasured visual work**. Visual receipts run **00:55:51.830634–03:03:39.175851 IST** (2h07m47s of receipt chronology, not a measured active-work timer), overlapping the earlier nonvisual session. Do not double-count that overlap or infer an exact combined active-effort total. Original Part 4 **00:45:54–03:39:36** calendar envelope is **2h53m42s**, **1h43m42s beyond** its unchanged 70-minute cutoff of **01:55:54**. On that session timeline the allowance is exhausted; the historical **53m34s is not a fresh remainder**. No new timebox/allowance was granted. Event time to 06:30 remains 2h50m24s at this checkpoint, not authorization for Part 5 or publication. Final packaging and review are included through this recorded checkpoint; no product work remains active.


## Visual fidelity correction — 1 November 2026

Shane rejected the visual mismatch and authorized a whole-TUI audit/rework with progress bars. This supersedes the preceding **current** visual/persistence descriptions; earlier receipts and clock entries remain historical. The [audit](Part%204%20TUI%20Visual%20Audit.md) explains the integration error, reference-screen adoption and every retained design direction. The original candidate remains unapproved/unfrozen. [Final rework receipt](../integration/part4/receipts/visual-rework/validation.json) records exact files, hashes, actual checks and elapsed time.

| Gap | Latest observed status | Remaining boundary |
|---|---|---|
| B01 | **Reference audit complete**: revision-7 screen source reviewed; actual Phase 02/G0/engine mappings retained. | No final design approval. |
| B02 | **Real progress/cancel checks pass**: animated bar, ten-stage facts, elapsed time, wide→medium→narrow→short recovery, cancellation/settlement and independent exact-job absence. | No live evidence stream/detach/retry/typed cleanup acknowledgment. Original lifecycle repair and limits unchanged. |
| B03 | **Pass**: actual raw lifecycle bytes and stable references; original report remains byte-identical. | Missing/unsupported content stays metadata-only. |
| B04 | **Pass**: reference dashboard over actual independent outcomes; counts are change records, analysis-unavailable differs from zero findings. | No universal safety/coverage percentage. |
| B05 | **Pass locally**: unsafe/bidi/OSC and binary PTYs, bounded inert raw alignment; full identity accessible. | Manual copy only; human/native display acceptance open. |
| B06 | **Pass locally**: restored input selector/editing, contextual footer, palette ownership, global/section/pane focus, Overview anchors, q/Esc and cancel behavior. | Named finding-document PageUp/PageDown anchors are keyboard checked in wide/narrow views. |
| B07 | **Local pass / npm partial**: centered review, retained-example loader, immutable reviewed snapshot proved live, historical Source new-review/return. | Resolved npm preflight and alternate-target online Start remain open. |
| B08 | **Pass**: exact raw citation/related-file Back retains filter/selection/pane/scroll; resize and recent-list report origin verified. | Cross-process nested back stacks are not persisted. |
| B09 | **Truthfully unavailable**: no simulated monitor state. | Part 5 runner/schedules/baselines/restart. |
| B10 | **Truthfully unavailable**: no TUI export success claim. | TUI export preflight/write implementation. |
| B11 | **Unavailable-state presentation passes**: actual model-off plus labeled synthetic failure/rejection/abstention cases. | No product model or quality acceptance. |
| B12 | **Reference geometry/state pass**: context-dependent 3/2/1 panes, Files wide two-pane, tree/flat, bounded viewer alignment, per-section/subtab/filter/pane/tree state v2 and v1 migration, corrupt/reset. | Raw window-relative alignment is not normalized/semantic/whole-file comparison. |
| B13 | **Partial local evidence**: reference tokens, distinct focus/selection, truecolor/palette/monochrome/ASCII PTYs. | Native Terminal tool access denied; human visual/contrast/glyph acceptance remains open. |

| Scenario | Latest actual evidence/status | Retained dependency |
|---|---|---|
| S01 | **Local review/Start passes** with visible selector, example loader, immutable snapshot, real progress and cancellation. | Resolved npm digest/source preflight remains partial. |
| S02 | **Historical conflict/subtabs/new-review/Back pass**; original report unchanged. | Full alternative-source online Start not exercised. |
| S03 | **Pass**: real M1 lifecycle finding → exact inert bytes → precise origin across 160/140/120/100/84/60 columns. | M1 remains isolated reviewed validation injection. |
| S04 | **Pass for presentation**: unavailable/unknown/error states and actual coverage stage facts retained. | No unsupported clean conclusion. |
| S05 | **Pass locally**: large actual report, bounded binary/unsafe text, tree/flat, paired/unified viewer alignment and pan. | Semantic/normalized comparison and automated clipboard unavailable. |
| S06 | **Historical/missing-evidence/error pass** including non-TTY parity and exact recent-list origin. | TUI export unavailable; full export scenario open. |
| S07 | **Unavailable state passes**: Not configured/Unknown, no invented stale state. | Monitoring runtime/restart acceptance remains open. |
| S08 | **Pass locally**: keyboard/focus/text ownership, report and live resize recovery, real cancellation and independent exact-job cleanup. | No typed cleanup acknowledgment/detach. |
| S09 | **Model-off and synthetic failure-state presentation pass**; deterministic bytes remain accessible. | Genuine inference/evaluation separate. |

**S4 minimum passes locally from actual keyboard/evidence/error/unknown checks. Visual fidelity has been reworked against the completed spike; Shane's human acceptance is still pending. Joint G3 remains OPEN**, with final intelligence/module and finding-quality dependencies retained. No Part 5 work or Git/publication action occurred. The original 70-minute budget is exhausted and has not been reset; see plan section 12 for added rework time.

**Final visual-rework clock:** checkpoint **1 November 04:26:48 IST** (2026-10-31 22:56:48 UTC); rework **0h27m18s**, added to the same Part 4 record. Known measured work is now **1h11m02s plus unmeasured earlier visual effort**. Original Part 4 calendar envelope **3h40m54s**, **2h30m54s beyond** the unchanged 70-minute cutoff. Overlapping visual receipt chronology is not double-counted. No allowance was reset; the old 53m34s remainder remains historical.

## Malhar analyzer integration candidate — 1 November 2026

The preceding S01–S09 and G3 tables describe the earlier PR #3 checkpoint. The current local candidate is on `codex/malhar-pr3-integration`, based on PR #3 head `c08a701` and still uncommitted. It injects `@heurisko/intelligence` through shared core for CLI/TUI, preserves the two-argument `analyzeEvidence(bundle, options)` interface and G0 schema, resolves at most 128 retained manifest-delta records (16 KiB each, 1 MiB total) through the hash-verifying store, checks cancellation between reads, and marks unresolved content incomplete. Module version is read from package metadata; implementation/configuration digests are recorded. The copied package is feature checkout `9fd488e` plus its uncommitted M1 source edit, not exact PR #4 head `e8b8116`; no remote CI covers these local changes.

Node **22.23.4** was downloaded to `/private/tmp` from the official macOS arm64 release and matched the official SHA-256 checksum. Frozen pnpm 10.14.0 installation completed with lifecycle scripts disabled; `pnpm run build` passed across contracts, intelligence, core, Part 4 integration, TUI, CLI, and web. Contract validation passed all positive/negative fixtures and seven synthetic handshakes. The complete core test suite passed **129/129**, and Part 4 readiness plus TUI tests passed **32/32**. A fresh model-off Part 2 run on a synthetic local inert mutation of Picocolors used the default `@heurisko/intelligence@0.1.0` module, produced 16 findings including a cited lifecycle-script delta, and passed report-schema, retained-evidence/hash, complete-heuristics/coverage, disabled-AI, and input-immutability checks. Both retained S2 consumer bundles also passed at 14/16 findings with verified blobs and references. Finding review remains cautious: baseline differences are unresolved/limited/undetermined and low-actionability; the lifecycle finding points to manifest evidence without inferring command behavior.

Seven older private test stores retain `PARSER_CREATE_UNCONFIRMED` records from attempts before the pinned parser image/runtime setup. Docker has no object for any exact recorded name; the repository's explicit recovery script therefore will not unlock those stores. They were left untouched. Fresh test runs used new isolated `/private/tmp` roots and confirmed cleanup. PR #3 remote CI still covers only its existing head.

**Joint G3 remains OPEN.** Shane's independent module/finding-quality review, human visual acceptance, and team end-to-end acceptance remain due. Policy evaluator/configuration, TUI export, complete P04 release monitoring, product model/inference evaluation, and organizer confirmation for hosted OpenRouter demo use also remain open. See [the integration candidate note](Malhar%20Product%20Integration%20Candidate.md). No commit, push, merge, organizer contact, product-model call, or submission occurred.
