# HEURISKO — Consolidated Implementation Handoff

**Version:** 1.0.0  
**Date:** 31 October 2026 (India)  
**Status:** **APPROVED PLANNING BASELINE — IMPLEMENTATION AND VERIFICATION NOT YET ATTESTED**  
**Approval authority:** Shane, through explicit confirmations of six decision phases in the project conversation  
**Team:** Shane (core, CLI/TUI, monitoring) and Malhar (analysis, RAG, AI); shared web, contracts, tests and demonstration  
**Audience:** Both founders, coding agents, reviewers and demo operators  
**Purpose:** One authoritative engineering handoff consolidating the *approved* Phase 01–06 decisions into owner-specific work, cross-module contracts, test gates, integration sequence and submission checks.

**License update, 31 October 2026:** Shane delegated the project license choice; Apache-2.0 was selected and root `LICENSE`/`NOTICE` were added locally. Commit, PR, CI and distribution remain pending. Other checklist boxes remain unchecked until their full conditions are met.

> **How to use this document.** Treat **Approved rule** sections as confirmed. Treat checkboxes as **work to perform and verify**, not completed work. Treat explicitly marked **Open decision** items as unfrozen implementation choices. A sample command or interface is a proposed contract shape unless the document says it is already approved. This repository exists; product implementation and remote CI remain unverified.

## 0. Decision authority and source-of-truth order

All six planning phases are approved:

| Phase | Approved version | IDs | Subject |
|---|---|---|---|
| **01** | **0.2.0** | D01–D06 | Technical foundation, mandatory TUI, ownership, local-first design |
| **02** | **0.2.0** | P2-01–P2-12 | CLI/TUI interaction, findings explanation, severity, AI interpretation |
| **03** | **0.1.0** | P3-01–P3-08 | Evaluation candidates, fixtures, ground truth, measurements |
| **04** | **0.1.0** | P4-01–P4-12 | Exact evidence, source/provenance claims, trust and uncertainty |
| **05** | **0.1.0** | P5-01–P5-12 | Untrusted input containment, isolated rebuilding, durable monitoring |
| **06** | **0.1.0** | P6-01–P6-12 | Demo, repo evidence, documentation, Q&A and final handoff |

For conflicts: (1) explicit later *approved* decisions override earlier *proposed* recommendations; (2) this handoff operationalizes rather than changes those approvals; (3) the full approved phase records control if a shorthand here omits nuance; (4) organizer requirements control submission obligations. In particular, the original research roadmap's **optional TUI** and **four-person workstreams** were superseded by Phase 01's **mandatory TUI** and the confirmed **two-person ownership split**. Likewise, the former roadmap's stage labels P0–P7 are *engineering milestones*, not Phase 01–06 decision approvals.

**Reference documents:** [approved decision register](Approved%20Decision%20Register.md), [approved phase records](Approved/phases/), [engineering agreement](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md), and [original research](Heurisko_Research/). Phase 03's proposal was explicitly confirmed; the register carries its approved status. The original five-document handoff omitted the architecture, tooling and verification research annexes, but those files are available in this repository.

---

## 1. Product contract: what Heurisko actually does

**Core question:** “Does this exact published package correspond to its claimed source, what explains the differences, which changes deserve review, and what remains unknown?”

**Approved core loop:** exact npm release or local archive → fetch and preserve immutable artifact bytes → find source candidates and full commits/subdirectories → inspect available provenance → inventory source and artifact files → raw-first file and metadata comparison → assess build/packaging transformations and security-relevant residuals → add bounded, evidence-cited open-weight model interpretations → save one versioned investigation report → show that **same report** through CLI, mandatory TUI and React browser. Selected-package monitoring reuses the same engine for newly discovered artifacts.

**Non-negotiable distinctions:**

1. **Registry integrity** is not **source correspondence**.
2. **A cryptographically valid attestation** is not automatically **trusted under a configured policy** or a **reproducible build**.
3. **Reproducing bytes** is not proof of **benign behavior**; malicious code may exist in the source.
4. **Observed risk-relevant capability** is not proof of **malicious intent**.
5. **AI explanation/hypothesis** is not a cryptographic, build or safety verdict.
6. **Missing evidence and skipped analysis** never count as clean verification.

**Product boundaries:** npm-first, exact artifact/version, with explicitly supplied local archive support; PyPI belongs to an extensible future adapter. No universal malware/safety score, mandatory account, closed-model inference, automatic install/repair, unbounded arbitrary-code execution or implicit public upload. Hosted multi-user operation, broad lockfile audits, and extra ecosystem coverage are not prerequisites to the approved first implementation. A mandatory keyboard-driven TUI *is* a prerequisite.

### One report, three interfaces

```text
Exact npm release or explicitly supplied local archive
       |
       v
Shane: acquisition → hashes → source candidates/provenance → raw inventories/diffs
       |
       | immutable evidence IDs, locations, source and artifact context
       v
Malhar: deterministic security/build heuristics → bounded retrieval →
        open-weight inference → schema/reference checking → abstention
       |
       v
Shared versioned InvestigationReport
       |                |                  |
       v                v                  v
Scriptable CLI    React/Ink TUI      React web evidence explorer
       ^
       |
Shane's local watchlist + scheduler → newly discovered release → same engine
```

The model does **not** get tools to execute shell commands, install packages, write arbitrary files or verify signatures on its own. Each viewer may navigate or present evidence but cannot define independent verdict logic.

---

## 2. Ownership and collaboration boundaries

| Area | Directly responsible | Reviewer / integrator | Deliverable and handshake |
|---|---|---|---|
| Repo and CI requirements | **Shane** | Malhar | Valid PR/test workflow; actual generated examples |
| Exact npm artifact acquisition, local archive input, digests | **Shane** | Malhar | Immutable artifact identity and acquisition errors |
| Source candidates, full commits, monorepo paths, provenance wrappers | **Shane** | Malhar | Source/provenance evidence with conflicts preserved |
| Safe inventory and raw diff | **Shane** | Malhar | Normalized *views* plus original raw evidence and stable IDs |
| Security-relevant findings and build interpretation | **Malhar** | Shane | Deterministic heuristic findings linked to existing evidence |
| Bounded RAG, open-weight model adapter, citation validator | **Malhar** | Shane | Structured model interpretations and failure/abstention states |
| Shared report schema and trust semantics | **Both** | Both approve | Stable versioned JSON reports; no UI-private conclusion logic |
| Scriptable CLI and mandatory Ink TUI | **Shane** | Malhar | Same report/engine, full keyboard investigation |
| Local store, optional rebuild worker integration, release monitoring | **Shane** | Malhar | Durable identity-bound reports/jobs and explicit isolation |
| React browser evidence explorer | **Both** | Both | Same exact evidence IDs, findings and limitations as terminal |
| Case manifests and seeded local mutations | **Shane** | Malhar | Independently verifiable input/ground-truth fixtures |
| AI evaluation, prompt injection and explanation quality | **Malhar** | Shane | Model-on/off comparisons, citation correctness and abstentions |
| Containment tests and end-to-end generalization | **Both** | Cross-review | Reproducible test evidence, no hidden exceptions |
| Slides, demonstration, README, final audit and Q&A | **Both** | Cross-review | Traceable claims tied to actual final-revision results |

**Review rule:** no module is accepted solely because its owner says it works. Both must be able to describe its input, output, trust boundary and failure state. Avoid two competing report formats, separate UI analyzers, and model-only verdicts.

---

## 3. Integration-first work order and acceptance gates

The order below consolidates the approved requirements into a **recommended engineering sequence**, not a new set of founder-approved product decisions. Parallel work begins only after the shared report and evidence contracts are stable enough.

| Gate | Minimum deliverable | Shane | Malhar | Objective pass condition |
|---|---|---|---|---|
| **G0 — Contracts and repository check** | Support declaration, schema examples, repo compliance, threat boundary | CLI/core shape, repo/CI checks | Findings/model schema and adversarial examples | Both can validate the *same* benign, tampered, incomplete JSON fixtures; CI runs |
| **G1 — Local deterministic vertical slice** | Local archive + pinned source → real raw report | Acquisition, identity, inventories, diffs, CLI JSON | Minimal rules on existing evidence IDs | Real changed files and relevant hashes are reproducible with AI disabled |
| **G2 — Registry and source/provenance** | Real pinned npm artifact and source-candidate evidence | Registry, full commits, subdir, verifier wrapper | Source/build interpretive tests | Wrong/missing/conflicting source remains explicit; registry digest does not imply source proof |
| **G3 — Findings and mandatory TUI** | Usable interactive investigation | Ink navigation, report rendering, evidence jumps | Security/build findings and explanation contract | Same actual finding/evidence opens correctly in scriptable CLI and TUI |
| **G4 — Build and real AI** | Scoped build evidence and meaningful open-model work | Approved rebuild interface or explicitly unsupported state | Retrieval, live inference, citations, alternatives, abstention | Explanation cites real evidence; invalid output rejected; AI-off report still useful |
| **G5 — Monitoring and web** | Durable release monitoring and shared browser explorer | Watch store, polling, retries; web infrastructure | Browser finding/AI views and adversarial UX tests | Controlled new release analyzed once after restart; CLI/TUI/web semantic parity |
| **G6 — Evaluation and submission** | Verified final-revision demonstration and docs | Deterministic/containment/CI evidence, live terminal flow | Model ablation and inference evidence | Real examples, held-out evaluation, green CI, honest 8-minute demo + 4-minute Q&A |

**Work may overlap:** Malhar can develop schema-conformant *clearly labeled fixtures* for heuristics/AI, and both can develop static web shells, before acquisition is ready. Fixture UI must never be presented as a live engine result. G3 must not be skipped merely because a web app is attractive.

---

## 4. Shane — actionable engineering checklist

### S0. Readiness, contracts and repo requirements (before parallel API work)

- [ ] Inspect existing Git history: verify whether the **first commit contained only `HACKATHON.md`**; do not rewrite history or claim compliance without checking.
- [ ] Verify PR template, CI workflow, README, MIT/Apache-2.0 license and approved model/coding-assistant disclosures are in the plan/PR workflow; add via required PRs where missing.
- [ ] Confirm workspace/package boundaries for shared TypeScript/Node engine, CLI, React/Ink TUI, shared schema and React web; do not introduce another analyzer in the UI.
- [x] Accept the G0 `EvidenceBundle`/`AnalysisResults`/`InvestigationReport` schema examples and evidence-reference rules under Shane's later [delegated team acceptance](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md#e09-delegated-g0-contract-acceptance--31-october-2026). The exact G0 fields and enums are accepted for separate interface-dependent work; no independent Malhar review is claimed. Changes to the shared contract still require review through the PR workflow.
- [ ] Define supported environment and explicit feature flags for unfinished verifiers, rebuilds and AI; avoid working stubs masquerading as completed checks.
- [ ] Fix a small real-data corpus intake procedure and traceability from each result to the actual inputs.

**S0 done when:** both contributors can run CI and validate the same schema examples (complete, missing provenance, conflicting source, altered local artifact, model unavailable), and every required project capability has a named owner.

### S1. Immutable acquisition and source identity

- [ ] Implement exact npm package/version/artifact resolution without silently substituting a different release; retain metadata response, retrieval time, filename and expected integrity value.
- [ ] Download canonical tarball bytes *as data*, verify expected versus observed hashes, and record distinct transport/integrity failures.
- [ ] Accept an explicit local archive and its own digest/source override; modified bytes **must not inherit** the original tarball's provenance state.
- [ ] Resolve candidate repository URLs, full immutable Git commits and package subdirectories; preserve conflicting gitHead/tags/source claims and missing objects.
- [ ] Retrieve source without hooks, lifecycle scripts, npm pack, installation or untrusted commands.
- [ ] Integrate an established provenance verifier with actual artifact digest and explicit expected identity/policy (when available); distinguish valid signature, policy mismatch, absent and incomplete from accepted under policy.
- [ ] Enforce allowed network locations, archive traversal/link defenses, expansion/file/time/memory limits and parser input bounds; freeze concrete limits before advertising supported execution profiles.

**S1 done when:** one genuine release and one local modified copy each produce distinct immutable identity records; wrong commit, digest mismatch, absent provenance and malicious archive cases show honest states without host execution.

### S2. Raw comparison and evidence ledger

- [ ] Inventory all archive members and relevant source files (paths, raw content hashes, sizes, types, execution-sensitive metadata), preserving skipped/unsupported scopes.
- [ ] Compute exact file correspondence and added/removed/modified/unchanged members; preserve archive-byte identity separately from member equality.
- [ ] Highlight executable entrypoint and manifest/script differences; preserve original raw evidence even when presenting normalized views.
- [ ] Assign stable evidence IDs to files, original and artifact spans, provenance/source records and observed differences.
- [ ] Mark generated/packaged/opaque files with supported relationship clues rather than automatically assuming `dist` or `.js` is safe.
- [ ] Expose `EvidenceBundle` to Malhar, with source identity strength, limitations, paths and cross-references.
- [ ] Produce a meaningful AI-off JSON report and human-readable CLI summary.

**S2 done when:** each important reported difference resolves to stored input bytes or preserved source/provenance records, and a skipped/unsupported file remains in the coverage accounting.

### S3. Scriptable CLI and mandatory TypeScript/Ink TUI

- [ ] `heurisko` launches a real interactive TUI; `heurisko analyze npm:package@version` is noninteractive; add local `--artifact`/`--source`, `inspect` and `tui <report>` paths per approved Phase 02.
- [ ] Support JSON stdout versus diagnostics stderr, no-color mode, explicit report path, optional AI disabling and documented distinct exit *meanings* (initial 0/1/2/3 mapping approved in A05; policy precedence still to test).
- [ ] Implement interactive Home, Overview, Source/Artifact Files, Diffs, Findings, Provenance/Build, AI and Monitoring views.
- [ ] Implement arrows/j/k, Enter, Esc, Tab/Shift+Tab, `/`, `?`, `q`, Ctrl+C; confirm scrolling, truncation/wrapping, narrow terminals, keyboard focus and safe cancel behavior.
- [ ] Every finding displays **observation → why it matters → evidence → explanation strength → limitations → next action**, with severity, evidence confidence, priority and coverage separate.
- [ ] Show source ambiguity, incomplete verification, invalid provenance or model failure as actual states, never generic “safe” banners.
- [ ] Escape untrusted filenames/content and terminal control sequences; do not execute displayed package content.

**S3 done when:** selecting one actual result in TUI leads to the exact file/diff/evidence record emitted by the CLI, and the screen remains useful without AI.

### S4. Build evidence boundary and durable monitoring

- [ ] Evaluate reuse of actual external rebuilding/provenance tools; bind any result to exact artifact/source/recipe and record verification scope.
- [ ] Allow rebuild execution **only** in a reviewed restricted disposable Linux worker with approved isolation, bounded resources and explicit egress policy; otherwise mark rebuild unsupported and keep static output.
- [ ] Establish local durable metadata/job storage (SQLite preferred candidate, **not frozen**) plus content-addressed retained inputs/reports; separate scratch, retention and explicit deletion behaviors.
- [ ] Implement explicit package watchlist and `watch add/run --once/status/remove`; keep exact artifact identity as deduplication key rather than mutable tags.
- [ ] Make schedule configured/running/stale/stopped states truthful; allow cron/CI/local scheduled runner, but never imply checks continue when the scheduler is not running.
- [ ] Persist before acknowledging queued jobs; test retry/backoff, rate limits, interruption/restart and duplicate discovery responses.
- [ ] Surface failures separately for polling, acquisition, source/provenance, parsing, sandbox and AI in CLI/TUI/web.

**S4 done when:** a controlled new-release replay triggers one actual analysis, creates a durable report, and survives a restart with truthful stale/failure state. Host-escape tests must pass **before** running untrusted rebuilds.

### S5. Evidence, release readiness and presentation

- [ ] Freeze actual target artifacts, expected/observed digests, full source commits, selected subdirectories and limitations in evaluation case manifests.
- [ ] Run independent test cases for exact match, changed scripts, new executable files, archive metadata variation, source conflict and unsupported content.
- [ ] Support Malhar's model-off versus model-on comparison using the identical deterministic evidence inputs.
- [ ] Produce actual generated `examples/` output from the final scored revision; do not stage hand-authored mock JSON as a completed run.
- [ ] Test clean installation and real keyboard terminal functionality on declared supported platforms; record model/runtime environment and failure modes.
- [ ] Verify clean final PR/CI, license/readme/template/history, no secrets, exact submitted SHA and actual OrganizerHQ submission; run the approved demo and answer cross-module questions.

**Shane acceptance statement:** “For each analysis I can identify the exact bytes, the claimed source and its evidence, what was compared, what was skipped, how findings were produced, and whether monitoring/isolated execution actually ran.”

---

## 5. Malhar — actionable engineering checklist

### M0. Agree on bounded intelligence responsibilities

- [x] Review the shared report/evidence schema with Shane before creating a private model-centric output format. Malhar's contract review is recorded in `packages/intelligence/README.md`; Shane's delegated G0 acceptance is in E09. No contract edit was proposed.
- [x] Define deterministic change/finding structure separately from the AI interpretation record: deterministic observations use `AnalysisResults.findings`; model hypotheses use `AnalysisResults.interpretations`.
- [x] Prepare labeled contract cases (benign match/generated candidate, introduced install hook, opaque executable candidate, ambiguous source, missing evidence, hostile package comment) independent of the downloader. The cases are synthetic interface fixtures, not RAG training data or measured analyzer results.
- [x] Define M0 retrieval as none and specify future content selection, omission reporting, and parent evidence ID plus exact locator preservation in `packages/intelligence/README.md`.

**M0 done when:** Malhar's component consumes the agreed evidence bundle and returns report-compatible results without acquiring packages or asserting cryptographic trust on its own.

**M0 status — complete, 31 October 2026:** `@heurisko/intelligence` consumes F0–F6 without mutation and returns `AnalysisResults` that validate both the result schema and a merged `InvestigationReport`. Heuristic findings and product inference remain explicitly unimplemented; this completes the M0 boundary, not M1 analysis or M2 RAG/model work.

### M1. Deterministic rules and build-aware investigation

- [ ] Identify newly introduced lifecycle scripts (`postinstall` etc.), changes to package entrypoints/exports and unexpected executable-content differences from **actual evidence**, without assuming intent.
- [ ] Distinguish packaging omissions, TypeScript output, bundling, generated metadata and native/opaque artifacts by evidence strength, never filename exceptions alone.
- [ ] Rank security-relevant changes for human review using reasoned potential impact, evidence strength and unresolved scope; no universal safety percentage.
- [ ] Keep observed raw change, plausible transformation, independent rebuild confirmation and unexplained residual separate.
- [ ] Provide each significant finding with observation, significance, IDs/locations, explanation strength, limitations and proposed next action.
- [ ] Create a no-model baseline of deterministic explanations to evaluate incremental AI usefulness.

**M1 done when:** a newly introduced test script is detected and justified without AI, while an ordinary generated file is not dismissed without evidence or automatically branded malicious.

**M1 progress — synthetic baseline evaluated:** the model-off baseline detects changed script and entrypoint keys, keeps generated candidates unverified until the bundle carries verified reproduced-build evidence, and surfaces unresolved/omitted changes with evidence IDs. Synthetic probes also confirm that uncited changes and contradictory raw-equality records do not produce findings. Schema-backed checks pass. A one-pass Codex-as-judge review checked evidence support, confidence calibration, non-accusatory wording, and traceability; it found the seven emitted fixture findings supportable and both negative controls correctly withheld. This same-assistant qualitative review is not independent model evaluation or measured accuracy. Each synthetic finding now carries a fixture-only limitation. This work remains fixture-only and does not claim real-package accuracy or collector integration.

### M2. Retrieval and real open-weight inference

- [ ] Benchmark locally runnable **open-weight** candidates (research suggested Qwen3-8B and a smaller Qwen variant) or confirm a compliant organizer open-model server; record installed model identity, quantization/runtime, hardware and actual test outcome.
- [ ] Build per-investigation retrieval over bounded code excerpts, diffs, build configs, source records and provenance; preserve immutable IDs and line spans; a vector database is not a mandatory product claim.
- [ ] Supply evidence as **untrusted quoted data**, distinct from model instructions; no model shell, network, installation, filesystem-write or verifier privileges.
- [ ] Require structured interpretation with suggested explanation, supporting evidence IDs, reasoning summary, alternatives, missing evidence, next action and abstention.
- [ ] Validate schema, ID existence, paths/spans and forbidden assertions of verified source/build/safety claims; note that a valid citation ID alone does **not** establish factual entailment.
- [ ] On timeout, OOM, missing model, invalid output or prompt injection, preserve the deterministic findings and record the actual model state; never silently fall back to closed inference.
- [ ] Ensure AI is **actually called** for at least one meaningful live investigation; recorded text alone cannot establish the organizer's model-use requirement.

**M2 done when:** actual inference explains a difficult *real* difference with inspectable citations, alternatives and limits, and abstains or is rejected when references/claims are unsupported.

**M2 progress — synthetic retrieval baseline:** `retrieveEvidence` ranks caller-resolved bounded excerpts lexically, returns only retained/addressable records with matching content references and exact line locators, and preserves the original evidence IDs. Citation checks reject unknown and non-retrieved IDs. Synthetic probes pass, and a one-pass Codex-as-judge review found the top result relevant to its query and the no-match case appropriately limited. This does not verify blob bytes, establish citation entailment, call a model, or complete M2.

**M2 progress — interpretation validation:** `validateInterpretationDraft` rejects malformed fields, unknown findings, unknown or non-retrieved evidence, findings cited with unrelated evidence, and non-abstaining drafts without evidence. It stamps caller-supplied runtime metadata and emits the shared `AIInterpretation` shape. Synthetic probes pass. Codex-as-judge accepted the bounded lifecycle explanation and explicit abstention, but rejected a credential-exfiltration claim as unsupported even though structural/reference validation accepts it. This confirms that `validation: passed` is only a shape/reference result; claim entailment remains a separate, unimplemented review step. No product model is integrated.

**M2 progress — prompt packaging:** `packageInterpretationPrompt` keeps fixed system instructions separate from bounded JSON containing findings and retrieved excerpts. Synthetic hostile text remains inside the evidence field; IDs and exact locators are preserved, oversized excerpts are omitted whole, and the package exposes no tool channel. The checks cover packaging behavior only: this is not a prompt-injection guarantee, entailment validator, or model-inference test. Codex-as-judge review of the synthetic invented credential-theft claim found it unsupported by the provided marker-only excerpt; the structural validator still accepts its citation, as designed.

### M3. Evaluation, model security and browser collaboration

- [ ] Independently label known explanations and security observations for Phase 03 corpus; keep uncertainty cases and held-out mutation families separate from demo prompts.
- [ ] Evaluate (a) deterministic templates, (b) model with raw diffs alone, (c) model with structured evidence when practical; score correctness, entailment of citations, invented facts, abstention and triage usefulness.
- [ ] Record real inference latency, memory/resource behavior, failures and sample counts; avoid unsupported accuracy percentages or calibrated model-confidence claims.
- [ ] Test source comments/metadata containing prompt injection, invented filenames, unsupported spans, misleading provenance text and hallucinated verification; ensure no tool execution.
- [ ] Build/review React web finding detail, side-by-side diff and AI interpretation views using the same report as CLI/TUI; safely display untrusted HTML/SVG/Markdown as text.
- [ ] Help present an AI-off comparison and meaningful inference without pretending the model proves source correspondence or malicious intent.
- [ ] Review Shane's acquisition/build/watch constraints and take part in Q&A on any subsystem.

**Malhar acceptance statement:** “I can show exactly what the deterministic engine supplied, which evidence the model read, what the model added, why its citations support or fail to support its claims, and where it abstained.”

---

## 6. Joint — shared React browser, evidence semantics and integration

**Browser purpose:** a readable evidence explorer, not a second analyzer. It can open locally saved/exported reports without mandatory account or hosted execution. Optional hosted processing requires later security/operational approval.

- [ ] Agree on and version the shared `InvestigationReport` schema and minimum report reader/writer compatibility rules.
- [ ] Build report import/open, exact target/source summary, provenance/context, file trees, cross-file correspondence, difference viewer, finding detail, AI interpretation/abstention and coverage/error views.
- [ ] Make every clickable finding/evidence reference point to the same real location/hash/span as in the CLI/TUI; mark absent cached bytes honestly.
- [ ] Display severity, confidence, review priority and completeness separately; no independent web-only score or conclusion.
- [ ] Protect against executable HTML/SVG/Markdown and malicious filenames; verify accessibility, keyboard navigation and large diff navigation.
- [ ] Show monitoring status only from actual durable watch/job state, never from invented feed entries.
- [ ] Cross-review source selection, safe acquisition, heuristics, AI hallucination defenses and failure paths.
- [ ] Test import/replay with network unavailable: historical reports show captured time and never claim fresh registry verification.
- [ ] Verify a report generated by a different CLI session retains the same meaning in TUI and browser.

**Joint done when:** the same actual artifact digest, source association, finding IDs, cited file spans and unknowns are consistent across CLI, TUI and web.

---

## 7. Contract boundaries to freeze first

These are **logical contracts**, not final TypeScript interface declarations. Do not assume exact field names/enums have already been approved. Before implementation, record schema version, required/optional fields, identity format and validation rules for:

| Contract | Produced by | Consumed by | Must preserve |
|---|---|---|---|
| `ArtifactInput` | CLI/TUI/web or monitor | Shane's engine | npm-qualified exact target or local archive and explicit source override |
| `ArtifactIdentity` | Acquisition | All stages | actual digest, registry expectation, filename/URL/capture, local vs canonical distinction |
| `SourceCandidate[]` | Source resolver | Comparator and report | repo, full commit/subdirectory, evidence for choice, conflicts, scope |
| `ProvenanceEvidence[]` | Verifier wrapper | Report and interpretation | subject digest, signer/issuer/source/builder assertions, verifier and trust policy, separate outcome |
| `EvidenceBundle` | Acquisition + comparison | Heuristics/retrieval/model | raw member/file records, spans, stable IDs, coverage, analyzed/skipped state |
| `Finding[]` | Deterministic analysis | CLI/TUI/web/model | observation, potential impact, evidence IDs, severity, priority, explanation strength, limitations, next action |
| `AIInterpretation[]` | Model adapter + validator | Shared report/viewers | hypothesis, supporting IDs, alternatives, missing evidence, model info, validation/abstention |
| `InvestigationReport` | Core orchestrator | All interfaces, export and CI | schema version; distinct identity/provenance/comparison/AI/completeness/outcome; immutable history |
| `WatchState` / job record | Monitor/store | CLI/TUI/web | exact artifact keys, scheduler/checkpoint, baseline/new, retries, success/stale/failure and timestamps |

**Stage failure contract:** errors identify their stage and what remains valid. A digest mismatch is not an innocuous build diff. An absent attestation is not a detected attack. A valid signature without accepted expected identity is not policy-approved provenance. An invalid model output cannot change deterministic findings. Incomplete stages remain visible in all output formats.

**Priorities for freezing open schema details:** report/evidence identity and source-association semantics → difference/finding IDs → policy/coverage/outcome names → AI output/ref validation → watch state and exit-code mapping. Approve and test schema fixtures jointly before independent implementations diverge.

---

## 8. Approved Phase 03 evaluation corpus and acceptance matrix

**Candidate releases — provisional, not verified:**

| Role | Proposed npm target | What it tests | Validation still required |
|---|---|---|---|
| Simple genuine package | `picocolors@1.1.1` | basic inventory and packaging/source relationship | actual tarball/digest, source full commit, ground truth |
| TypeScript-generated distribution | `ts-pattern@5.9.0` | generated JS/declarations and transformation explanation | actual distribution contents, source mapping, build evidence |
| Complex monorepo | `zod@4.6.7` | correct package subdirectory, export/build complexity | real artifact/source association and coverage |

For each finalized case, preserve **name/version/artifact filename/registry URL, expected and observed digest, retrieval time, candidate source repo/full commit/subdir, provenance material and trust outcome, original snapshot, mutation manifest where relevant, tool/policy/model versions, independent expected observations, real generated output and limitations**. Replace candidates only with a recorded reason; never invent missing values.

| Case | Ground-truth challenge | Minimum valid system behavior |
|---|---|---|
| **B1** Genuine straightforward release | normal member/file relationships | exact vs packaging differences correctly scoped |
| **B2** Genuine generated output | TypeScript → published JS relationship | plausible vs reproduced transformations distinguished; no `dist/` blanket exception |
| **B3** Monorepo release | correct source root | explicit package subdir and any unresolved source paths |
| **M1** Local added `postinstall` | consequential manifest modification | exact observed delta and possible install-time execution significance, no intent claim |
| **M2** Local unexpected executable | introduced artifact-only code | evidence-linked introduction, unsupported portions visible |
| **M3** Archive metadata-only mutation | byte-level vs member-content distinction | do not conflate archive hash change with modified member content |
| **U1** Conflicting source identities | wrong/multiple commits | preserve candidates and abstain from definitive correspondence |
| **U2** Missing provenance/unsupported build | incomplete context | explicit limitations, not favorable/hostile inference |
| **R1** Controlled new-release replay | duplicate discovery and restart | one durable actual analysis; simulation clearly labeled |
| **A1** Misleading/incomplete model evidence | fabricated paths/prompt injection | rejected/abstained hypothesis; deterministic findings intact |

**Additional held-out set:** at least one unfamiliar release or mutation family, a benign build case and an incomplete-evidence case, separated from demonstrated fixtures. Assess source match, diff detection, benign false alarms, build explanation correctness, coverage, citation entailment, appropriate abstention, inference cost and monitoring reliability with real denominators. Package-specific hardcoding is forbidden.

---

## 9. Security gates: conditions that block particular actions

| Operation | Allowed starting condition | If unsupported/unsafe |
|---|---|---|
| **Static acquisition and archive inventory** | allowlisted/validated registry or approved source input; bounded parsing and no package execution | reject/mark incomplete with diagnostic evidence; never install or pack source to compensate |
| **Source resolution** | immutable full-commit retrieval and recorded candidate evidence | preserve ambiguity/conflicts; do not silently take default branch/tag |
| **Provenance acceptance** | digest-bound verified attestation plus explicit expected signer/source/builder/issuer policy as applicable | retain valid-but-untrusted, missing, invalid or not-checked state |
| **Build transformation claim** | scoped raw differences plus appropriate actual build/packaging evidence | mark supported/hypothesized/unexplained, not proved identical |
| **Untrusted build/rebuild** | separately reviewed disposable restricted Linux worker, tested containment, recorded dependency/egress/resource policy | **do not execute**; report skipped/unsupported |
| **AI interpretation** | compliant open-weight runtime, bounded untrusted snippets, schema/reference validation | omit/reject/abstain; never invoke closed model as hidden fallback |
| **Scheduled monitoring** | explicit configured runner plus persisted watch/checkpoint and bounded retries | `unconfigured`, `stale`, `stopped` or `failed` as appropriate; do not say always-on |
| **Share/host a report** | explicit user action and approved hosting/privacy controls | local viewing/export only; no implicit upload |

**Required adverse tests:** path traversal and unsafe archive links, duplicate names, decompression/resource limits, malicious lifecycle script fixture (not executed), source conflict, integrity mismatch, wrong signer/policy, host network/filesystem escape attempt for sandbox (only after safe test setup), model prompt injection, ANSI control escape, web active content, monitor crash/retry/duplication and AI failure. Numeric caps, concrete sandbox and retention values are **still open**, and must be fixed and measured for the supported environment before shipping relevant functionality.

---

## 10. Release monitoring implementation contract

1. A watch specifies an explicit npm package identity and release/channel policy (prerelease choice remains to freeze); baseline scan is not presented as a new release.
2. A polling runner discovers exact versions and immutable artifact identities, retaining actual registry metadata and check times.
3. A newly seen artifact gets a durable idempotency key and queued investigation, not just a notification.
4. A re-poll, duplicate registry response or crash/restart cannot silently duplicate completed analyses or lose the durable discovery.
5. Registry outage, missing poll and failed analysis have separate, user-visible states; last successful check is not overwritten with failed-attempt time.
6. `watch run --once` must work; recurring automation must be explicitly configured via a genuine scheduler/CI/local runner, with truthful running/stale semantics.
7. Demonstration may use a **controlled fake registry/clock** for discovery, while the newly triggered analysis is executed by the **real engine**; distinguish simulated event from actual analysis.

**Acceptance evidence:** persisted watched package + checkpoint, deduplicated report, restart/duplicate/failure test transcript, actual generated analysis and user-visible scheduler state.

---

## 11. Documentation and required GitHub evidence

- [ ] Confirm original first commit's file list shows only `HACKATHON.md` (repo already created; verify, don't assume).
- [ ] Ensure initial `HACKATHON.md` accurately states team, members, problem, models and reasons where applicable.
- [ ] Use PRs for subsequent work, with testing detail and product-model versus AI coding-assistant disclosure; keep CI green.
- [ ] Have actual `LICENSE` (MIT or Apache-2.0), `README.md`, `.github/pull_request_template.md`, `.github/workflows/ci.yml`, and `examples/` containing **real input and generated outputs**.
- [ ] Document supported npm input scope, exact CLI/TUI invocation, browser report loading, local storage, watch scheduling, model setup, known unsupported boundaries and troubleshooting.
- [ ] Record actual runtime/dependency/model pins and exact evaluation artifacts rather than copying unverified examples or research candidate sizes.
- [ ] Check license notices, no secrets, public-data-only inputs and no automated comments/issues against real upstream projects.
- [ ] Verify the exact submitted commit is the one tested with CI; confirm repository push and external OrganizerHQ submission independently.

**Event timetable documented in the original organizer research:** repository/first-commit checkpoint **31 October 2026, 20:30 IST**; final scored merge/push and submission **1 November 2026, 06:30 IST**; presentations begin **1 November 2026, 08:30 IST**. These are recorded organizer-document deadlines, not claims of submission completion. The exact judging-weight slide contains placeholders, so do not invent a complete rubric.

---

## 12. Approved Phase 06 presentation and Q&A runbook

**Main story:** real source-to-distribution difference → legitimate transformation → introduced local tampering and risk significance → honest uncertainty → actual open-weight explanation → durable monitoring → same evidence in browser. Do not sell Heurisko as a generic malware oracle.

| Time | Owner lead | Planned demonstration | Mandatory truth label |
|---|---|---|---|
| **0:00–0:45** | Both | Problem: claimed source vs exact published bytes | bounded product claim |
| **0:45–1:35** | Shane | CLI/TUI launch, pinned artifact and source | real artifact/source identity; actual capture |
| **1:35–2:40** | Shane | Benign packaging/generated output, explain evidence strength | hypothesized vs actually reproduced |
| **2:40–4:20** | Shane → Malhar | Modified **local** copy, changed digest, exact install/executable evidence, consequence | fixture, not a genuine publisher compromise |
| **4:20–5:10** | Both | Ambiguous/absent provenance or unsupported build | explicit incomplete/unresolved |
| **5:10–6:05** | Malhar | Live open-weight RAG inference + cited hypothesis; contrast model-off | actual model/run, not canned output |
| **6:05–6:50** | Shane | Durable watch discovers one new controlled release | simulated discovery vs real triggered analysis |
| **6:50–7:40** | Both | React web opens same immutable report and evidence IDs | real report parity, not mock |
| **7:40–8:00** | Both | What is established, unknown and next developer action | no universal safety claim |

**Q&A:** four minutes plus organizer two-minute buffer. Rehearse answers on exact source selection, monorepos, signature vs provenance policy, rebuild evidence vs code safety, false alarms, model added value and hallucinations, sandbox host defenses, monitoring uptime, unseen inputs, and differentiation from OSS Rebuild/reproduce/Drydock. Each teammate swaps speaking roles in one rehearsal.

**Fallback integrity:** retain lawful/public original archives, source snapshots, locally modified fixture archives and generated reports. Offline report replay is labeled **captured at [real timestamp]**, not fresh scanning. A saved recording is not a live model inference. Slides/screenshots and reported results must be generated from the same scored code revision and labeled accurately.

---

## 13. Final release gate: definition of done versus partial delivery

Before anyone says **“Heurisko solves the complete Problem 04”**, check with actual artifacts/tests:

- [ ] Exact published npm artifact retrieval and separate digest/integrity verification.
- [ ] Corresponding source candidate retrieval with full commit/subdirectory or honest unresolved association.
- [ ] Raw source-to-distribution inventory and file-level comparison.
- [ ] Generated/build output identification with actual evidence strength, rather than name-based blanket suppression.
- [ ] Detect introduced suspicious/impactful modifications in genuine evaluated local copies.
- [ ] Explain individual differences with evidence, alternatives, coverage, limitations and action-oriented risk review.
- [ ] Actual meaningful open-weight-model work, schema/evidence validation, AI-off baseline and graceful failure.
- [ ] Durable selected-release monitoring and genuine triggered analysis with tested dedupe/restart.
- [ ] Mandatory usable keyboard-driven TypeScript/Ink TUI, independent noninteractive CLI and same-report browser evidence explorer.
- [ ] Original first-commit/PR/CI/license/README/template/examples requirements verified and final scored commit green.
- [ ] Benign/tampered/uncertain and held-out evaluations measured and documented honestly.
- [ ] Real reproducible demonstration plus explicit unresolved features, unsupported cases and recorded limits.

**If a gate fails:** show the partial capability, exact failure/unsupported scope and valid evidence; do not silently disable the check or relabel it complete. Product reports must similarly refrain from declaring an analyzed package “safe” on insufficient data.

---

## 14. Unresolved implementation choices / next short decisions

The approvals establish the **required behavior**, not all concrete engineering constants. These must be frozen separately with test evidence, ideally in a small `IMPLEMENTATION_DECISIONS.md` or equivalent engineering decision record. They are **not implicitly approved** here.

| Open item | Responsible | Needed before |
|---|---|---|
| G0 candidate schema review, stable IDs/enums, compatibility and exit-code precedence | Both | G1/G3 and CI integration |
| Released Node/React/Ink dependency pins, terminal support matrix and distribution check | Shane | G3 release claim |
| Selected provenance verifier and explicit expected signer/builder/issuer policy | Shane, review Malhar | Provenance acceptance claims |
| Exact download/archive/parser/CPU/RAM/time/concurrency limits | Shane, review Malhar | Safe public or packaged execution |
| Isolated worker technology, containment proof, rebuild recipes and network policy | Shane, review Malhar | Any untrusted rebuild execution |
| Model weight/runtime/digest, quantization, machine feasibility, evidence context and AI thresholds | Malhar, review Shane | Meaningful AI capability claims |
| Fixture release URL, observed digest, full source commit/subdirectory and ground-truth evidence | Shane, review Malhar | Publishing any benchmark/demo accuracy |
| Watch cadence, prerelease/release policy, runner host, retries and persistence schema | Shane | Recurring-monitoring completion claim |
| Local storage retention/deletion semantics and quotas, optional hosted responsibilities | Shane, review Malhar | Distribution/hosting commitments |
| Actual verified model/engine measurements, final-demo artifact paths and submitted SHA | Both | Presentation and final claims audit |

**Approved planning does not override the repository’s commit/push boundary; no new founder decision is required merely to implement within an approved principle**, but document consequential changes. If an implementation choice alters an approved product/trust rule, propose an amendment and get explicit approval before marking it accepted.

---

## 15. Immediate handoff instructions to the two developers / coding agents

1. **Read this file and the approved decision register first.** The Phase 01 mandatory TUI and two-owner allocation supersede the original research roadmap's optional/four-contributor plan.
2. **Do not claim work is complete until there is real evidence.** Distinguish APPROVED DESIGN, IMPLEMENTED, TESTED and DEMONSTRATED as separate states for each feature.
3. **Start with shared schema and G0 fixture review.** Shane and Malhar should agree on observed evidence, model interpretation and failure contracts before building divergent modules.
4. **Build a small honest end-to-end path first:** explicit local package + pinned source → raw diff → versioned report → CLI; add real npm/provenance, mandatory TUI, verified heuristic/AI, monitoring and browser through the stated gates.
5. **Keep original bytes and uncertain states visible.** Never substitute optimistic statuses for unavailable source, verifier, model or rebuild worker.
6. **Require cross-review on every trust boundary.** Shane reviews Malhar's evidence claims; Malhar reviews Shane's untrusted input/source assumptions; both verify UI parity and tests.
7. **Before presenting, re-run final revision tests and reproduce examples.** The audience should be able to inspect every significant claim, and both founders should be capable of explaining the entire pipeline.

**Final approval statement:** The Phase 01–06 planning decisions in this handoff have been explicitly confirmed by Shane. The checklists, validation gates and technical implementation remain to be executed and evidenced. The handoff is not a claim that a real Heurisko release, model run, monitoring deployment or secure rebuild system already exists.
