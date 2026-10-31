# Part 4 Integration Readiness Report

**1 November 2026 · nonvisual integration checkpoint · S4/G3 remain OPEN.** Shane authorized this track while a separate React/Ink visual spike owns appearance, components, keyboard/focus behavior, layouts, theming and responsive behavior. This report records an integration audit and isolated candidate adapters, not a completed TUI or a competing implementation plan. The canonical [TUI Design Contract](Design/TUI%20Design%20Contract%20v1.0.0.md) remains **v1.0.0-rc.1, unapproved and unfrozen**; its 59 confirmed directions are preserved.

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
