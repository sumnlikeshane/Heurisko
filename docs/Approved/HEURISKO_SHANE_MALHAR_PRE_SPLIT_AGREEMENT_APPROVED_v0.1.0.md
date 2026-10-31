# HEURISKO — Shane–Malhar Pre-Split Engineering Agreement

**Version:** 0.1.0 · **Date:** 31 October 2026 (IST)  
**Status:** **APPROVED — JOINT AGREEMENT RECORDED; G0 TECHNICAL VALIDATION OPEN**  
**G0 implementation addendum:** Candidate schema/types, fixtures and historical local validation were created in the original delivery. See Annex E and its post-audit revision note; **current full validation, actual repository CI and both developers' technical review remain pending.**  
**Purpose:** Freeze the minimum shared implementation contracts before independent development. This agreement operationalizes, but does not supersede, the **approved Phase 01–06 decisions** and the **Consolidated Implementation Handoff v1.0.0**. Nothing in this file attests that a product, test, model run, security control, or monitor has already been implemented.

> **Decision rule:** The approved six-phase product rules are already locked. Items formerly labeled **proposed freeze** are now **jointly approved implementation directions**, based on Shane's confirmation that both developers agree. The exact runnable schemas and conformance fixtures still need to be created and tested. If a proposal conflicts with an approved trust or product requirement, the approved requirement wins. Each developer may change an owned implementation detail after notifying the other if it does not affect a shared contract; changing a shared contract requires joint review.

---

## A. Joint decisions that must be frozen before independent coding

### A01 — One application, one engine, one report — APPROVED JOINT DECISION

**Recommendation:** TypeScript on Node.js in one pnpm workspace; React + Ink for the **mandatory** TUI; React + TypeScript for the browser. The web and TUI are *report consumers*, not independent analyzers.

```text
apps/web                  Both: report viewer and investigation UX
packages/contracts       Both: schemas, enums, example fixtures, validation
packages/core            Shane: acquisition, identity, provenance adapter, raw comparison, orchestration
packages/cli             Shane: commands, human/JSON renderer, Ink TUI
packages/intelligence    Malhar: deterministic heuristics, build interpretation, retrieval, open-model explanations
packages/monitor         Shane: watch state, poller, jobs (may initially live in core)
tests/fixtures           Joint: synthetic schema cases and labeled real cases
examples                 Joint: actual generated outputs only, once engine runs
```

**Rule:** Structure is a proposed folder layout, not permission to create a second engine or to violate the already-approved repository/PR workflow. Pin *released, compatible* Node/React/Ink versions after testing, not by guessing versions.

### A02 — Who owns which interface — APPROVED JOINT DECISION

| Producer / owner | Provides | Consumer / reviewer | Must not do |
|---|---|---|---|
| Shane / `collectEvidence(input)` | Validated `EvidenceBundle`, immutable archive/source identities, raw differences, exact evidence references, coverage | Malhar; review by both | Invent malicious intent, infer source identity from a tag alone, erase unsupported files |
| Malhar / `analyzeEvidence(bundle, options)` | `AnalysisResults` containing deterministic findings and separately validated AI interpretations | Shane's orchestrator; review by both | Redownload/replace artifact bytes, assign cryptographic verification status, overwrite raw evidence |
| Shane / `investigate(input, options)` | Complete versioned `InvestigationReport`, including failures and partial stages | CLI/TUI/web/monitor | Make the web/TUI recompute conclusions |
| Shane / monitor | Durable watch/job state, exact new artifact identities, actual analysis jobs | CLI/TUI/web | Claim 24/7 monitoring while runner is stopped |

**Integration rule:** Shane can pass a minimal valid `EvidenceBundle` even when source/provenance is absent. Malhar must return a useful result (possibly empty findings + explicit limitations) or a typed stage failure; AI must never be essential for the deterministic path.

### A03 — Freeze the minimum shared data fields — APPROVED JOINT DECISION

Freeze a **JSON Schema v0.1.0** and corresponding TypeScript types in `packages/contracts`. This is the *minimum common vocabulary*; optional details can be added without inventing trust.

**`ArtifactInput`**
- `ecosystem`: `npm` or `local` for first delivery (future adapter may add `pypi`).
- For npm: exact `packageName` and `version`, optionally exact `artifactFilename`; no implicit floating `latest` during reproducible analysis.
- For local: `artifactPath` and explicit `sourceOverride` when the caller wants source comparison. If no source is provided, identity is unresolved and comparison scope must be honest.
- Optional `analysisOptions`: model enable/disable, output controls, explicit trust policy reference, resource policy reference.

**`ArtifactIdentity`**
- Exact package coordinates, artifact filename, origin (`registry`/`local`), capture time and original metadata reference.
- `observedSha256` (content-addressed identity) and **separate** registry-expected integrity value/algorithm and check outcome.
- Local modified copies have their own digests and cannot inherit the original release's provenance.

**`SourceCandidate[]`**
- Repository URL, **full commit hash**, optional `subdirectory`, evidence references, association state and conflicts.
- Distinguish `publisher_asserted`, `corroborated`, `user_supplied`, `ambiguous`, `unavailable` (these labels are proposals for the schema, not verified trust classifications).

**`EvidenceRecord[]` / `EvidenceBundle`**
- Immutable/stable `evidenceId`, kind, artifact/source side, file/member path and/or metadata locator, source digest, optional line/byte range, observation method and actual retained content reference.
- Raw member inventory/diff records, file correspondences, stage errors, analyzed/skipped counts and unsupported bytes.
- References must resolve to original retained inputs or documented unavailable-content states; no invented line numbers.

**`Finding[]` (deterministic, Malhar-owned interpretation of Shane's evidence)**
- `findingId`, `title`, `observation`, `whyItMatters`, `evidenceIds[]`, `severity`, `reviewPriority`, `evidenceConfidence`, `explanationStrength`, `limitations[]`, `nextActions[]`, rule identity/version.
- Clearly separate an *observed change* from a *possible security consequence*. Severity is not a probability of maliciousness.

**`AIInterpretation[]` (model hypotheses, not findings by fiat)**
- Linked `findingIds[]` and `evidenceIds[]`, `hypothesis`, `reasoningSummary`, `alternatives[]`, `missingEvidence[]`, `nextActions[]`, `abstentionReason`, model/runtime/prompt identity, validation result.
- It is legal for AI to be `disabled`, `unavailable`, `failed`, `rejected`, or `abstained`, while deterministic findings remain valid.

**`InvestigationReport`**
- `schemaVersion`, immutable `reportId`, creation/capture times, `input`, artifact/source/provenance evidence, file comparisons, deterministic findings, optional AI interpretations, stage statuses, error/coverage ledger, separate outcome dimensions, and analysis/tool/policy versions.

**`WatchState` / `Job`**
- Watched npm identity and selected release policy, cursor/checkpoint, exact artifact dedupe key, scheduler status, last attempted/successful check, queued/running/failed/completed jobs and retry metadata.

**Compatibility:** All callers validate schemas at module boundaries. Additive backwards-compatible fields → minor version; breaking field or semantic changes → major version; bug fixes that preserve semantics → patch. Unknown enum value → show unsupported/incomplete, not silently recast as safe.

### A04 — Identity, evidence IDs and reproducibility — APPROVED JOINT DECISION

- Internally address original artifacts by `sha256:<hex>` over the exact downloaded bytes. Record any expected npm SRI separately and verify it against **those same bytes**.
- Make **evidence IDs deterministic within an investigation** from a canonicalized record locator (artifact/source digest, side, original path, span/metadata key, observation type), rather than array positions. Collisions are errors, never overwritten.
- The `reportId` identifies the immutable artifact input(s), selected source comparison target(s), and analysis configuration/version. Any changed input or analysis configuration produces a new report ID or immutable revision.
- Retained content is subject to documented resource/retention policies; if bytes are omitted from export, references declare the omission.
- Every significant claim can be navigated to an evidence record; a valid ID alone does **not** establish that an AI claim is entailed by it.

### A05 — Outcomes, statuses and exit behavior — APPROVED JOINT DECISION

Separate independent report dimensions: **artifact integrity**, **source association**, **provenance policy**, **raw/build correspondence**, **review-worthy findings**, **analysis completeness**, and **AI state**. Never collapse these into one `safe=true` flag.

**Stage status proposal:** `not_started | running | complete | incomplete | skipped | failed` plus structured `{ stage, code, message, affectedScope, retryable }` errors. A missing attestation is `absent`, not an invalid signature; a verifier not run is `not_checked`, not verified.

**Agreed initial CLI exit-code mapping (policy-precedence tests remain outstanding):**
- `0`: requested checks completed and no configured policy violation (does **not** mean package harmless).
- `1`: a **configured** policy condition was violated (high-priority observation alone does not silently imply this).
- `2`: analysis result is materially incomplete / unable to reach requested policy conclusion.
- `3`: invalid invocation or internal execution failure where a usable result cannot be produced.

On invocation failure, avoid outputting a forged success JSON. In JSON mode, full result goes to stdout; human progress/errors go to stderr. Exact policy configuration and precedence for multiple simultaneous conditions need small contract tests before freezing the exit codes.

### A06 — What Malhar receives, and when — APPROVED JOINT DECISION

`collectEvidence` should supply **structured observations**, not free-form verdicts. At minimum: artifact hash; optional trusted/unresolved source candidates; file inventories; file change categories; raw snippets or retained content locators; provenance verification state; explicit skipped/unknown scope.

Malhar can run three substeps: (1) deterministic change/security/build heuristics; (2) bounded relevant evidence retrieval; (3) optional open-weight model interpretation. A model may suggest an analysis step but cannot mark it verified; it can never mutate Shane's `EvidenceBundle`.

**RAG clarification:** retrieval over the *current investigation's actual source/diffs/build records* is sufficient; model training/fine-tuning and a vector database are **not** required by the approved plan. Benchmark open-weight options such as Qwen candidates on actual machine before freezing one. Record genuine inference and `--no-ai` behavior separately.

### A07 — Responsibility for risk and findings — APPROVED JOINT DECISION

- **Shane establishes** exact observable changes, identity/provenance checks, coverage and raw evidence.
- **Malhar produces** evidence-cited deterministic heuristics, potentially consequential behavior observations, hypotheses about build/packaging mechanisms and AI explanations.
- A finding displays **what happened → why it matters → evidence → degree of explanation → unknowns → suggested next action**.
- `severity`, `reviewPriority`, `evidenceConfidence`, `explanationStrength`, and `completeness` are **separate**. Use explicit `undetermined` rather than assigning confident labels without basis.
- No overall safety score; no unsupported claims that a package is malware or safe. If source identity is ambiguous, AI cannot cure it.
- Initial numerical severity thresholds can remain owner-proposed until tested on real+held-out fixtures; changing their semantics requires both reviewers.

### A08 — What the CLI, TUI and web are allowed to do — APPROVED JOINT DECISION

- The `heurisko` command starts the mandatory keyboard-driven **React/Ink TUI**; `heurisko analyze ...` works headlessly with useful AI-off results.
- TUI/web display the same saved `InvestigationReport` and evidence IDs; they may filter, search, navigate, compare views and request an explicit new analysis but **must not** create their own trust or finding logic.
- The web **initially opens local/exported reports**. Hosted anonymous analysis, accounts and public upload are **not** part of the starting interface unless separately approved and secured.
- Escape untrusted filenames, ANSI sequences, HTML/SVG/Markdown/code; no executing untrusted content inside a viewer.
- If source content is absent from a portable report, show `content unavailable` rather than rendering made-up diff text.

### A09 — Security & execution boundary — APPROVED JOINT DECISION

- The normal acquisition/inventory/AST/text-diff path **never** runs `npm install`, `npm pack` on untrusted source, repository hooks, shell scripts or package lifecycle commands.
- Validate/cap URLs, redirects, archive count/bytes/decompression, paths, symlinks and parser resources. Block unsafe extraction/host escapes. No unsupported file is silently discarded from coverage.
- A rebuild is a *separate* optional operation gated on a reviewed, disposable, restricted Linux worker with measured containment, pinned recipe/dependencies, egress restrictions and quotas. If unavailable, mark rebuild `skipped/unsupported` and retain the static report; no Mac host execution fallback.
- The model receives bounded untrusted data but no shell/network/filesystem-write/verification tools; an evidence citation validator must reject invented IDs/paths and forbidden authoritative claims.

### A10 — Monitoring handoff — APPROVED JOINT DECISION

- Shane owns the selected-package watchlist and job store. Initially monitor exact npm package streams; release selection policy is saved with each watch.
- Default proposal: treat the first observed set of releases as the **baseline**, not a fabricated "new release" event; choose stable releases by default, prereleases via explicit opt-in.
- Persist the watch, checkpoints, discovered immutable artifacts, retry/error state and deduplication key before acknowledging the event. Repeated polls or restarts must not duplicate completed analysis of identical artifact bytes/config.
- Implement `watch run --once`; schedule automatic polling using an **explicitly configured actual runner** (cron/CI/local process), with `running`, `stopped`, `unconfigured`, `stale`, `failed` as appropriate. Do not imply background monitoring otherwise.
- Actual polling cadence, host, retry resource budget and SQLite/tool selection remain **owner choices to document and review**, not reasons to block unrelated module development.

### A11 — Fixtures, G0 handshake and what counts as compatible — APPROVED JOINT DECISION

Before full interface-dependent parallel coding, both developers must review and locally validate these **schema fixtures** (design-only until implemented; not passed off as generated reports):

| Fixture | Scenario | Must be preserved by both modules |
|---|---|---|
| F0 | Matching local artifact/source members | Correct identities, no invented risk, complete coverage accounting |
| F1 | Added local `postinstall` | New manifest script observed; Malhar returns evidence-linked finding, possible impact, non-assertion of intent |
| F2 | Generated TS→JS output, unverified build | Raw diff kept; suggested explanation is *plausible*, not a confirmed rebuild |
| F3 | Two conflicting source candidates | Ambiguity survives comparator, heuristic and UI; no chosen source quietly called verified |
| F4 | Missing provenance and unsupported binary | Missing/not-checked explicit; unsupported bytes counted; no blanket "clean" label |
| F5 | AI unavailable, invalid citation, or prompt injection | Deterministic report unchanged; model output rejected/unavailable; correct error state |
| F6 | Registry integrity mismatch / tampered local copy | Distinguish registry download failure from locally modified archive; do not reuse original provenance |
| F7 | Watch replay + restart | One newly discovered artifact → one retained analysis; duplicate response and stale state handled |

**G0 handoff test:** Shane provides schema-valid fixture `EvidenceBundle`; Malhar runs `analyzeEvidence` over it with model off and returns schema-valid `AnalysisResults`; Shane merges to `InvestigationReport`; a simple CLI renderer can read it. Both sign off on fields/enums and failure cases. Real evidence replaces synthetic fixtures at G1 onward.

### A12 — Git/PR ownership and no-overwrite rules — APPROVED JOINT DECISION

- Both use the existing public repository and organizer-required **PR → CI → merge** workflow. Check first commit history; do not claim the first-commit rule is met merely because the repo exists.
- `main` is integration-only; build separate narrowly scoped branches/PRs (e.g. `shane/core-acquisition`, `malhar/intelligence-heuristics`); no force-push to the other's work.
- **Contracts changes:** both review. **Core and CLI/TUI:** Shane writes, Malhar reviews boundary and findings. **Intelligence:** Malhar writes, Shane reviews evidence claims. **Web:** jointly assigned by screen/API after G1.
- Both PR descriptions state what was changed, how tested, dependencies, known limits, and whether a product model or coding assistant was used. Never store API keys or downloaded untrusted package artifacts accidentally in Git.
- Do not merge known red CI; an interface is not "done" just because it renders a mock fixture.
- Agree one mechanism for contract alterations: change request → schema+fixture update → both approve → update owners → merge (no surprise cross-module breaking changes).

### A13 — Integration checkpoints and daily communication — APPROVED JOINT DECISION

1. **G0 / before separate implementation:** freeze contracts, enums, API shape, F0–F6 fixtures, branch ownership and demo target list; joint sign-off.
2. **G1 / earliest real integration:** Shane's local archive+source produces real diffs; Malhar's no-model heuristic consumes them; one actual JSON report works headlessly.
3. **G2 / npm source:** canonical registry package and a resolved/ambiguous source report; record errors and digests accurately.
4. **G3 / terminal:** mandatory TUI opens the *same* real findings/evidence as JSON CLI, including unknowns.
5. **G4 / AI/build:** real open-weight inference, citation checks, model-off comparison, and scoped build evidence or explicit unsupported state.
6. **G5 / monitor + web:** deduped saved release and shared web report explorer; same exact IDs/limitations in all interfaces.
7. **G6 / evaluation:** genuine benign, clearly labeled tampered, unknown, monitor replay and held-out tests; final reproducible examples, CI and documented limitations.

**Communication rule:** Each person reports at a checkpoint: (a) what's merged, (b) which fixture/real test passes, (c) blocked inputs needed from the other, (d) next contract change if any. Integrate a small real vertical slice before implementing large isolated UIs/models.

### A14 — Team-level definition of done — APPROVED JOINT DECISION

No feature is complete until: it has the declared input/output schema; tests for success, unknown and error; real-generated evidence for any functionality claim; reviewer approval; no trust boundary regression; consistent CLI/TUI/web behavior where applicable; and passing CI. For build isolation, don't claim secure execution before containment tests. For AI, don't claim meaningful work before a genuine model run. For monitoring, don't claim automatic operation before an actual runner/checkpoint/restart test.

---

## B. Decisions that **do not have to be frozen before parallel work**

These should be owned, recorded and peer-reviewed at the relevant milestone, not guessed now:

| Deferred implementation detail | Driver | Deadline / dependency |
|---|---|---|
| Exact compatible released Node/Ink/React versions and terminal support matrix | Shane | Before declaring mandatory TUI working |
| Selected npm/Sigstore/provenance verification tools and expected signer/issuer/builder policy | Shane + review | Before any positive provenance-policy conclusion |
| Resource limits for archives, jobs, parser time, network and storage | Shane + review | Before processing arbitrary untrusted inputs beyond controlled tests |
| Isolated rebuild worker and containment evidence | Shane + review | **Before executing** a single untrusted rebuild |
| Model weights, model runtime, quantization, prompt parameters, evidence budget | Malhar + review | Before asserting actual AI functionality |
| RAG retrieval mechanism (keyword/hybrid/vector), caching and chunk sizes | Malhar + review | Before model evaluation; must preserve evidence IDs |
| Final severity/priority qualifications based on ground-truth corpus | Malhar + Shane | Before strong public risk claims |
| Real release hashes, full source commits and fixture ground truth for three provisional packages | Shane + Malhar | Before claiming evaluation/demo success |
| Local persistence implementation, retention/delete limits, monitor runner/cadence and retries | Shane + review | Before monitoring completion claim |
| Browser hosting and public compute | Joint new decision | Outside the local-first initial implementation unless explicitly approved |

No decision in this table authorizes a shortcut around the approved security/trust requirements.

---

## C. The shortest possible joint kickoff (complete before separating)

- [x] **Agree on A01–A14** and note any amendments (both developers, not only Shane). Shane approved, and reported that Malhar approved. No amendments.
- [ ] **Freeze `contracts` v0.1.0**: type names, required fields, enums, JSON Schema validator and stable IDs.
- [ ] **Freeze one actual interface call each:** `collectEvidence(input)` → `EvidenceBundle`; `analyzeEvidence(bundle, options)` → `AnalysisResults`; `investigate(...)` → `InvestigationReport`.
- [ ] **Review the 7 core G0 fixtures** (F0–F6); make sure the missing/ambiguous/AI-off cases can be represented.
- [x] **Agree on output modes and exit semantics**, particularly that high review priority alone is not automatically a configured-policy violation. Exact precedence tests remain open.
- [x] **Agree on source/provenance ownership** and ensure no one assumes registry digest proves source derivation.
- [x] **Agree on RAG scope and model limitations**: current investigation evidence, real open-weight inference, citation validator, no model authority over verification.
- [ ] **Agree on branch ownership and PR review rules**; verify repo/CI baseline without rewriting or bypassing history requirements.
- [ ] **Assign first real vertical slice**: Shane supplies a local-archive raw diff; Malhar supplies a model-off finding; both read a complete report.
- [x] **Record both sign-offs below**. Approval is complete; the separate G0 executable contract/fixture validation gate remains open.

### Sign-offs — approvals recorded on 31 October 2026

- **Shane:** `[x] Agreed` · **No amendments** · reported directly by Shane in this conversation · **31 October 2026 (IST)**.
- **Malhar:** `[x] Agreed (as reported by Shane)` · **No amendments** · **31 October 2026 (IST)**. This is Shane's explicit report of Malhar's decision, **not a separately authenticated message from Malhar**.
- **Joint decision revision:** `pre-split agreement v0.1.0 APPROVED` (A01–A14).
- **Actual JSON Schema/contracts revision in repository:** `not yet verified as created, frozen, or validated`.
- **G0 validation:** `OPEN` until both developers validate the identical schema and F0–F6 fixtures end-to-end.

### Split-readiness ruling

**Ownership and architecture alignment: APPROVED.** Shane and Malhar can start *independent work that does not require unfrozen interface details* now. **Unrestricted interface-dependent parallel coding: NOT YET CLEARED** by this document, because the G0 acceptance evidence (concrete JSON Schema/types, validated fixtures, working contract handshake, CI) has not been supplied.

Minimum outstanding checks before claiming G0 complete:

- [ ] Commit and jointly approve the versioned JSON Schema, TS types, enums, ID semantics and stage/error states.
- [ ] Materialize the F0–F6 fixture inputs and expected outputs; validate both producers/consumers against the same schema.
- [ ] Exercise `collectEvidence → analyzeEvidence (model disabled) → investigate/report` with one schema-valid fixture.
- [ ] Verify source/provenance and unknown/AI-off behavior is preserved throughout the pipeline.
- [ ] Verify repo/PR/CI baseline and the interface smoke test pass.

After these pass, mark **G0 PASSED** with commit SHA, test command/output, and both reviewers; no silent assumption of completion.

### First independent assignments once both sign

**Shane:** implement `ArtifactInput` handling + safe local archive/source inventory/diff + source/artifact IDs + JSON CLI rendering and G1 fixtures. Then real npm/source/provenance, mandatory Ink TUI and monitoring according to gates. Avoid implementing AI heuristics privately.

**Malhar:** implement `analyzeEvidence` against *the identical G0 fixture bundles*, first deterministic rules for added install hooks/unexplained executables and build-context dispositions, then per-investigation retrieval, open-weight inference and evidence validation. Avoid assuming inputs from an AI-generated free-text summary.

**Both:** review each other's first real report and test results. Build the web explorer once schema and the real report flow are stable; static UI fixture work may happen in parallel if always labeled as such.

---

## D. References and precedence

1. `docs/Team Development Checklist.md` (approved planning baseline v1.0.0).
2. `docs/Approved Decision Register.md` (all Phase 01–06 confirmations).
3. Approved Phase 04, 05, 06 records and Phase 03 corpus decision as recorded in the register.
4. `HEURISKO_PRODUCT_DEFINITION.md`, `HEURISKO_RESEARCH_BASELINE.md`, `HEURISKO_IMPLEMENTATION_ROADMAP.md` for research and originally proposed architecture; newer approved decisions override earlier *proposed* alternatives.
5. Organizer requirements for mandatory repo, PR/CI, licensing, open-weight model work, and selected-release monitoring.

**Status reminder:** Agreement **APPROVED** based on Shane's direct agreement and his report of Malhar's agreement, without amendments. This records *decision approval*, not independent verification of Malhar's identity or completion of G0, implementation, CI, safe rebuilds, model inference, or monitoring. The six approved phases are unchanged.


---

## E. G0 contract implementation — runnable local candidate (added 31 October 2026)

**Amendment type:** Technical implementation annex to the **already approved A01–A14 agreement**, not a new unilateral team approval and not a change to the agreed product. The six phases and A01–A14 remain approved; this exact G0 schema/code/fixtures revision still needs both developers to inspect and sign off. **Do not interpret the seven synthetic fixtures as real package-analysis output.**

### E01. Concrete files delivered

Use the candidate in `docs/G0_Candidate/` to add the following into the existing repository (merge root files and CI; do not replace existing repository history):

| Path | Content / owner |
|---|---|
| `packages/contracts/schema/contracts.schema.json` | Canonical **JSON Schema draft 2020-12**, version `0.1.0`, created and locally validated; shared ownership |
| `packages/contracts/src/types.ts` | Matching TypeScript types and async port signatures; shared ownership |
| `packages/contracts/src/index.ts` | Type-export entry point |
| `packages/contracts/tests/fixtures/F0`–`F6` | **Seven synthetic** contract cases: each contains `bundle.json`, `analysis.json`, `report.json` |
| `packages/contracts/tests/fixtures/F7` | Optional monitoring `WatchState` and `Job` schema examples; **no running monitor** |
| `packages/contracts/tests/negative/` | Ten intentionally invalid reports after the five post-audit additions; the original five-check log is historical |
| `packages/contracts/tests/validate_contracts.py` | Draft-2020-12 validation and critical cross-field safety invariants |
| `packages/contracts/tests/smoke-handshake.mjs` | **Stubbed** `collectEvidence → analyzeEvidence → InvestigationReport` data exchange test |
| `.github/workflows/contracts-example.yml` | **Example** contract job to integrate into existing CI, **not a verified GitHub CI run** |
| `README_G0.md` and `docs/G0_RESULTS.md` | Install/merge instructions, precise local results and remaining work |

### E02. Frozen-candidate contract vocabulary

The revised candidate schema defines `ArtifactInput`, `AnalysisOptions`, `ArtifactIdentity`, `IntegrityCheck`, `SourceOverride`, `SourceCandidate`, `EvidenceRecord`, `Locator`, `FileChange`, `EvidenceBundle`, `StageError`, `StageRecord`, `CoverageOmission`, `Coverage`, `ProvenanceState`, `Finding`, `AIState`, `AIInterpretation`, `AnalysisResults`, `Outcomes`, `InvestigationReport`, `WatchState`, and `Job`.

Use the actual JSON Schema and `types.ts` as the detailed field-level reference. Both modules must validate types at the boundary; the local tests currently use Python's complete JSON Schema validator, while a production TypeScript JSON Schema adapter remains a G1 integration task.

**Required module shapes:**

```ts
collectEvidence(input: ArtifactInput): Promise<EvidenceBundle>
analyzeEvidence(bundle: Readonly<EvidenceBundle>, options: AnalysisOptions): Promise<AnalysisResults>
investigate(input: ArtifactInput, options: AnalysisOptions): Promise<InvestigationReport>
```

The aggregator preserves Shane's immutable artifact/source/provenance/coverage records and adds Malhar's evidence-linked deterministic findings plus explicitly nonauthoritative AI results. It must never silently change the original evidence, and the report's independent outcome dimensions must be preserved.

**Current candidate identity test rule (revised after audit):** The synthetic fixtures use `sha256:<64 lowercase hex>` for artifact/snapshot identities. `evidenceId` is `ev_` plus 24 hex characters from SHA-256 of canonical UTF-8 JSON with sorted keys and no extra spacing containing the artifact digest, ordered source-candidate identities, `kind`, `side`, original `path`, `metadataKey`, any defined line/byte span, and the content digest. Each source identity includes repository URL, full commit, subdirectory, source snapshot digest and build-context digest when present. `reportId` is `report_` plus 24 hex characters from canonical JSON over the artifact digest, those ordered source identities and the analysis-configuration fingerprint. The candidate validator rejects mismatched IDs. The final production canonicalization, fingerprint contents and collision/retention semantics must be reviewed by both developers before accepting this convention as a cross-module public contract. The E04 results below were generated with the older, narrower ID formula.

**Important distinctions protected by the contract:** `artifactIntegrity`, `sourceAssociation`, `provenancePolicy`, `correspondence`, `analysisCompleteness` and `policyResult` are separate; severity, review priority, confidence and explanation strength are separate; missing provenance is not an invalid signature; AI can be unavailable or rejected without erasing deterministic results; local modified bytes never inherit published artifact provenance.

### E03. F0–F7 fixtures and expected behavior

| Fixture | Synthetic scenario | Acceptance evidence |
|---|---|---|
| F0 | Exact member match | Equal content digest, no invented security findings |
| F1 | Local introduced `postinstall` | Raw change + linked deterministic finding; possible installation impact without asserting malicious intent |
| F2 | TypeScript-to-JavaScript candidate | Generated relationship is a **hypothesis**, never marked reproduced without verified build evidence |
| F3 | Two source candidates conflict | Source ambiguity remains in report; no source falsely verified |
| F4 | Missing provenance and opaque binary | `absent`/unsupported bytes explicit, coverage incomplete |
| F5 | AI produced invalid evidence citation | AI state `rejected`, deterministic report preserved |
| F6 | Registry expected integrity mismatches acquired bytes | Explicit integrity failure; source comparison not assessed and no inherited trust |
| F7 | Watch state and deduplication job shape | **Schema-only** valid representations; actual scheduler/restart correctness must be tested at G5 |

All cases contain invented fixture artifacts, not real npm packages or live model output. They are appropriate for **contract conformance only**, not security accuracy statistics.

### E04. Historical tests executed on the original candidate

**Environment:** Node 22.16.0, TypeScript CLI `tsc` 5.8.3, Python with `jsonschema` 4.26.0.

```bash
python3 packages/contracts/tests/validate_contracts.py
node packages/contracts/tests/smoke-handshake.mjs
tsc --noEmit -p packages/contracts/tsconfig.json
```

**Observed local results:** 7 positive F0–F6 cases validate as `EvidenceBundle`, `AnalysisResults` and `InvestigationReport` (21 schema validations); 5 deliberately invalid reports rejected; F7 watch/job shapes validate; 7 stubbed producer→consumer→report handshakes pass; TypeScript compiler type-check exits successfully.

This establishes the **shape and synthetic-data compatibility only**. The tests do not establish that npm artifacts were downloaded, source commits correctly resolved, dangerous packages isolated, a real Malhar heuristic or model run, a real CLI rendered, or a hosted/actual repository CI completed.

### E05. Original G0 checklist (historical validation scope)

- [x] **Created locally:** JSON Schema v0.1.0 definitions, TypeScript types, stage/error enums and a proposed deterministic ID convention.
- [x] **Created and locally validated:** F0–F6 fixtures with positive and negative contract tests, plus F7 monitoring schema examples.
- [x] **Synthetic handshake tested:** fixture `EvidenceBundle → AnalysisResults → InvestigationReport` remains structurally consistent through a stubbed exchange; the actual production functions are not implemented.
- [x] **Local TypeScript typecheck passed** (`tsc` 5.8.3) and the local Python JSON Schema tests passed.
- [ ] **Merge this candidate into the team's actual repository via PR;** inspect history and ensure the event's mandatory first-commit and PR requirements remain satisfied.
- [ ] **Confirm the full contract checks pass in the actual repository CI**, with a recorded CI run URL and commit SHA.
- [ ] **Shane and Malhar both examine and explicitly approve these exact schema, types, fixtures and identity rules.** Previous A01–A14 sign-off covers directions, not this newly materialized revision.
- [ ] **Exercise a real producer/consumer using this contract** as the G1 vertical slice; the synthetic smoke test does not count as production integration.

**Historical status at original handoff: `G0 LOCAL CONTRACT CHECKS PASS — TEAM FREEZE / REPO CI PENDING`.** The later audit revision in E07 needs fresh validation. Independent work not depending on unreviewed semantics may proceed. Do not record **`G0 PASSED`** until the actual repo CI and both technical approvals are documented. The real-engine handshake is the first G1 implementation milestone.

### E06. What the two developers do next

**Shane:** review artifact/input/source identities, deterministic evidence and report aggregation; merge the contract package through a PR; add the CI test job; implement a real local archive+source `collectEvidence` and JSON report with this schema.

**Malhar:** review evidence/finding/AI fields, explicit abstention/citation states and G0 fixtures; implement model-off `analyzeEvidence` over the fixture bundles; move to evidence retrieval and genuine open-weight inference only after the deterministic flow works.

**Together:** review F0–F6 results, inspect the semantic invariants (not only JSON shape), verify one actual report after G1 integration, attach CI and commit IDs to the agreement, then jointly mark the contract freeze.

**G0 technical sign-off fields (not filled in by this artifact):**

- Shane review of exact schema/fixtures: **PENDING** · Review/PR: ______
- Malhar review of exact schema/fixtures: **PENDING** · Review/PR: ______
- Actual repository commit SHA: **PENDING** · ______
- GitHub CI run/status: **PENDING** · ______
- G0 gate: **OPEN** until those checks pass.

### E07. Post-audit candidate revision — 31 October 2026

A repository audit found that the original candidate permitted a `matched` integrity result without an expected digest, `verified_policy` provenance without checked artifact binding or evidence, and identical report IDs after changing a source subdirectory. It also had no structured record for each skipped or unsupported file. These were defects in the **candidate contract**, not evidence of a running product vulnerability.

The parked files in `docs/G0_Candidate/` were locally revised to require supported integrity inputs, provenance binding/policy/evidence, source-context-sensitive report and evidence IDs, and file-level omission records. Five negative fixtures were added; the pnpm CI example was corrected. The revised semantic-only fixture check, Node stubbed handshake and global TypeScript typecheck passed locally. The semantic-only mode skips JSON Schema validation, and the global compiler is not the declared pinned dependency. The original E04 results and `G0_VALIDATION_LOG.txt` apply only to the pre-audit candidate. The current revision must pass the full Python JSON Schema suite, both developers' field/identity review, and repository CI before any G0 freeze. Product implementation and empirical verification remain open.

### E08. Root integration and local G0 validation — 31 October 2026

After Shane requested G0 closure, the revised contract package was copied from `docs/G0_Candidate/packages/contracts/` into root `packages/contracts/`, with a pinned pnpm workspace/lockfile, root scripts and a contract job in the existing CI workflow. The root copy passed `pnpm run typecheck` using TypeScript 5.8.3 and `pnpm run test:contracts` with Python `jsonschema==4.26.0`: seven positive fixtures passed full JSON Schema plus semantic invariants, ten negative fixtures were rejected, F7 watch/job shapes validated, and seven stubbed producer→consumer handshakes passed. Python was installed in a temporary isolated environment; no analyzed package was installed or run.

This is local synthetic contract validation, not a remote CI result or real engine test. The sign-off fields above remain pending. Record the actual commit SHA, green CI run URL/status and Shane and Malhar technical reviews before marking G0 passed; preserve the E04/E07 chronology.
