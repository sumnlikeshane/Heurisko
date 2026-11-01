# HEURISKO — Approved Decision Register

**As of:** 1 November 2026
**Approval authority:** Shane's explicit confirmations for approved phases; Malhar-specific implementation selections are labeled separately.
**Scope:** Approved Phases 01, 02, 03, 04, 05 and 06.  
**Status:** CONFIRMED. This record does not claim that implementation or verification has been completed.

## Malhar implementation selection — supplemental CodeAstra triage (1 November 2026)

Malhar selected `rootxhacker/codeastra-500M` as a supplemental local model for paired function-level vulnerability triage. The selected question is whether a changed published-artifact function receives a different first-pass vulnerability signal from the corresponding pinned-source function. The model emits a non-authoritative interpretation citing existing source/artifact evidence IDs. It does not replace the RAG answer model, answer provenance questions, alter deterministic findings/severity, or establish exploitability. This is an implementation selection within Malhar's approved heuristics/open-weight inference/evaluation ownership, not a new joint architecture approval or a change to P04 scope. As of 1 November 2026, exact model/runtime/data pins, local CPU inference, and a 50-pair held-out run are recorded. Paired correctness and patched specificity are below the model-card report; exact upstream helper reconciliation, larger evaluation, runtime-source license clarification, Shane review, and report/CLI integration remain open. See [CodeAstra integration notes](../experiments/codeastra/README.md).

## Phase 01 — Technical Foundation v0.2.0 — APPROVED

| ID | Confirmed decision |
|---|---|
| D01 | npm-first source-to-artifact investigation; exact versions and local archives; extensible PyPI adapter, without implying both ecosystems are already supported. |
| D02 | TypeScript/Node shared engine and CLI; React/TypeScript web; mandatory TypeScript/TSX + React + Ink TUI; JSON Schema contracts and common report. |
| D03 | Shane: acquisition, source resolution, artifact hashing and provenance, raw inventories/diffs, core orchestration, CLI, TUI and monitoring. Malhar: security/change heuristics, build interpretation, RAG retrieval, open-weight inference, evidence validation and model evaluation. Both: report contracts, integration, web, demo. |
| D04 | First-class, real keyboard-driven mandatory TUI; artifact selection, overview, file and difference explorer, findings, provenance/build evidence, AI interpretations; same engine and report as CLI/web; support narrow terminals and model unavailable conditions. |
| D05 | Local-first engine and interfaces; local open-weight model or verified organizer open-model server; no mandatory account, closed-model inference or cloud backend; no untrusted code execution in static path; isolated rebuilds only. |
| D06 | Evidence-first trust and uncertainty reporting: separate artifact/source identity, provenance, comparisons, suspicious observations, completeness and AI; never universally certify safe/malicious; AI cannot overwrite verified evidence; explicitly unresolved states. |

## Phase 02 — CLI, TUI & Investigation Experience v0.2.0 — APPROVED

The user explicitly approved **P2-01 through P2-12**, superseding the v0.1.0 Phase 02 draft.

| ID | Confirmed decision |
|---|---|
| P2-01 | `heurisko` interactive by default and `heurisko analyze` scriptable; same core engine. |
| P2-02 | Proposed CLI contract covers `analyze`, local `--artifact`/`--source`, `inspect`, `tui`, and `watch add/run/status/remove`; final spelling/exit numbers subject to contract implementation. |
| P2-03 | TUI views: home, overview, source/artifact files and diffs, findings, provenance/build evidence, AI interpretations, monitoring; adaptive three-pane/stacked layouts. |
| P2-04 | Keyboard-first navigation: arrows/j/k, Enter, Esc, Tab/Shift+Tab, `/`, `?`, `q`, Ctrl+C; accessible large-report behavior. |
| P2-05 | Visible stage progress and statuses: resolve identity, acquire, source, provenance, inventory/compare, build-aware/security findings, optional AI, persist. |
| P2-06 | Local versioned reports, reproducible artifact/source identities, machine JSON stdout and diagnostics stderr, separate completed/policy-failed/incomplete/error outcomes; report consistency across interfaces. |
| P2-07 | Each finding explains observation, security significance, exact evidence, explanation strength, limitations and next investigative actions. |
| P2-08 | Explicit separation of severity, evidence confidence, review priority and completeness; no fabricated all-purpose safety score or model-confidence percentage. |
| P2-09 | AI output is a labeled hypothesis with reasoning summary, evidence IDs, alternatives, missing evidence, next action and abstention; validate citations, preserve model metadata, fail gracefully. |
| P2-10 | Human-readable, actionable overview with main takeaway, artifact/source context, established/unresolved relationships, prioritized findings, AI availability and unknowns. |
| P2-11 | Organize overlapping categories of exact/supportable correspondence, explained transformations, security-relevant observations, unexplained residuals and incomplete/conflicting evidence. |
| P2-12 | Full acceptance requirements: mandatory TUI and scriptable CLI, evidence navigation, explainable findings, explicit uncertainty and AI separation, monitoring and shared report with web. |

## Phase 03 — Evaluation Packages & Test Corpus v0.1.0 — APPROVED

Shane explicitly approved **P3-01 through P3-08** on 31 October 2026. Package selection is **provisional pending validation**; the approval covers the evaluation plan, not unperformed empirical verification.

| ID | Confirmed decision |
|---|---|
| P3-01 | Provisional npm benchmark candidates: `picocolors@1.1.1` (straightforward), `ts-pattern@5.9.0` (generated TypeScript output), `zod@4.6.7` (complex monorepo). Validate exact artifacts/source associations before inclusion; replacements permitted with documented rationale. |
| P3-02 | Immutable case manifest records exact registry artifact and observed/expected hashes, retrieval time, candidate source commits/subdirectory, source/provenance evidence, inventories, tool configuration, outcomes and independent labels. Unknowns remain unverified. |
| P3-03 | Test families: B1 straightforward legitimate, B2 generated output, B3 monorepo; M1 install script mutation, M2 executable addition, M3 archive metadata-only variation; U1 ambiguous source, U2 missing/unsupported evidence; R1 release-monitor replay; A1 AI limitations. Local mutations explicitly labeled as test fixtures. |
| P3-04 | Ground truth independently labels artifact/source identity, exact differences, relevant evidence, explanation strength, potentially consequential capability, limitations and next steps. Distinguish actual modification from malicious-intent inference. |
| P3-05 | Evaluate identity accuracy, difference recall, false alarms, build explanations, citation validity, abstention, coverage, deterministic vs AI benefit, runtime and monitoring correctness; no unmeasured percentages or performance claims. |
| P3-06 | Separate transparent demo fixtures from held-out tests, including unseen package/release or mutation family; avoid filename-specific or case-specific hardcoding. |
| P3-07 | Public data and non-executing static default, isolated rebuilds only, safe archive handling, independent hashes for original and modified copies, no publication of modified packages or automated project comments. |
| P3-08 | Shane owns acquisition/manifest/mutations and deterministic evaluation; Malhar owns independent explanation labels, AI and citation tests; both review evidence, generalization and reproducible demonstration. |

**Acceptance scope:** This is an approved **evaluation design**, not proof that any selected package has been downloaded, source-matched, reproduced, benchmarked or detected.

## Phase 04 — Evidence & Trust Rules v0.1.0 — APPROVED

Shane explicitly approved **P4-01 through P4-12** on 31 October 2026. This approval confirms the **trust/evidence policy and acceptance-design principles**, not completed verification tooling, evaluated severity thresholds, verified release archives, completed rebuild isolation, or empirically measured accuracy.

| ID | Confirmed decision |
|---|---|
| P4-01 | Bind every investigation to exact artifact bytes and their observed digest; keep registry integrity separate from source correspondence; local/user-supplied modified copies never inherit attestation status from the original. |
| P4-02 | Preserve candidate source repositories, full commits, monorepo subdirectories and supporting evidence; distinguish publisher-linked claims, corroborated candidates, user-selected comparison targets and unresolved/conflicting identities. |
| P4-03 | Verify provenance artifact-binding and signer/source/builder/issuer under an explicit expected-identity policy; separate valid signatures, policy acceptance, invalid/missing/incomplete checks and publisher attestations from build provenance. |
| P4-04 | Preserve raw archive/member differences, important metadata and executable modifications; build config/source maps are supporting clues, not guaranteed equivalence; independently reproduced transformations are scoped; leave residuals visible. |
| P4-05 | Report claim-specific evidence strength for digests, provenance, rebuilds, structural/build signals, model hypotheses and missing evidence; no universal trust ladder or safety score. |
| P4-06 | Each finding separates observed change, potential impact, severity/review priority, evidence confidence, explanation/relationship strength, uncertainty and next action; no automatic malware inference. |
| P4-07 | Maintain stable, inspectable finding/evidence IDs with original snapshot, location, digest, method, tool and limitations; citations must actually support claims; same evidence in CLI/TUI/web. |
| P4-08 | Treat RAG/model output as an untrusted-data-fed, separately labeled hypothesis; validate schema/IDs/spans/unsupported claims; record abstention and failures; no model shell, network or verification authority. |
| P4-09 | Stage-level completeness, skipped/unsupported bytes, missing evidence and failures remain visible; negative claims are scoped; incomplete investigations never silently become successful verification. |
| P4-10 | Top-level report independently summarizes artifact integrity, source association, provenance, correspondence/residuals, review-worthy observations and coverage, with justified next action rather than safe/unsafe certification. |
| P4-11 | Version reports, rule/trust policies, input identities, rebuild assumptions, verifier details and AI settings; historic evaluations are immutable and freshness is explicit. |
| P4-12 | Both owners validate tampered-local digests, integrity failures, source conflicts, unexpected signer identities, absent provenance, unsupported builds/binaries, dangerous matching source, invalid AI references and cross-interface consistency. |

**Still open at implementation level:** exact JSON Schema field/enumeration names, expected-signer trust-policy defaults, pinned verification-tool versions, numeric severity/priority qualification, exit-code values, evidence retention/cache limits and concrete rebuild sandbox controls. Approval must not be misrepresented as proof those controls have been implemented.

## Phase 05 — Security, Isolation & Release Monitoring v0.1.0 — APPROVED

Shane explicitly approved **P5-01 through P5-12** on 31 October 2026. This approval adopts the **security and monitoring operating design**, **not** proof of completed isolation tests, running monitors, validated resource limits, or production reliability.

| ID | Confirmed decision |
|---|---|
| P5-01 | Treat downloaded archives, source, metadata and AI-readable content as untrusted; define boundaries, controls and tests. |
| P5-02 | Non-executing static acquisition: never run package install/pack/lifecycle hooks, repository scripts or user-supplied commands while inspecting. |
| P5-03 | Bound URL acquisition, archive extraction/inventory and parsers; reject escape paths, unsafe links, decompression/resource abuse and misleading empty-clean results. |
| P5-04 | Optional rebuild only in a reviewed, disposable restricted Linux execution boundary with recorded recipe and limited network/resources; no unsafe host fallback. |
| P5-05 | RAG/package text is untrusted data, never executable instructions; validate evidence references; safely escape terminal/browser content; preserve deterministic work on AI failure. |
| P5-06 | Durable local-first metadata and content-addressed evidence, immutable historical reports, explicit export/delete; no automatic public upload; numeric retention/limits remain open. |
| P5-07 | Explicit selected-package watchlists, per-artifact immutable identity, deduplicated analysis, distinguish baseline from newly discovered release and treat metadata changes as anomalies. |
| P5-08 | `watch run --once` plus a separately configured recurring scheduler; show scheduler mode, last successful check and stopped/stale/unconfigured states; never imply uptime without a running scheduler. |
| P5-09 | Persist checkpoints/jobs, use idempotent processing, bounded retries/backoff and durable recovery from restarts; retain visible failures. |
| P5-10 | Separate acquisition, integrity, source, provenance, parser, sandbox, AI and scheduler failures; preserve partial results without favorable unsupported conclusions. |
| P5-11 | Local-first execution; hosted untrusted analysis requires later approval for isolation, quotas, retention, abuse safeguards and operating ownership; no invented SLA/limits. |
| P5-12 | Shane owns acquisition/sandbox adapter/store/watch/CLI-TUI failures; Malhar owns model-input security/citation validation/AI adversarial tests; jointly run containment, recovery and evidence-consistency tests. |

**Open implementation parameters (not approved as values):** per-environment CPU/RAM/time/archive/concurrency limits; vetted Linux sandbox and cross-platform compatibility; trust-tool version pins; watch schedule, release-channel/prerelease policy and runner host; local or hosted retention/deletion/backup targets; notifications beyond local interfaces.

**Acceptance scope:** Phase 05 is closed as a decision phase. No monitoring deployment, package detection, sandbox containment or performance result is asserted.

## Phase 06 — Presentation, Documentation & Handoff v0.1.0 — APPROVED

Shane explicitly approved **P6-01 through P6-12** on 31 October 2026. This accepts the demonstration, documentation and final handoff **plan**, not a claim that any feature, benchmark, CI run or submission has been completed.

| ID | Confirmed decision |
|---|---|
| P6-01 | Lead with the exact source-to-published-artifact integrity gap; explain bounded claims and differentiate via integrated evidence, not generic malware-scanner promises. |
| P6-02 | Demonstrate validated genuine benign release, clearly labeled tampered local copy, explicitly unresolved case and selected-release monitor replay; keep a judge/unseen input route. |
| P6-03 | Prepare an eight-minute evidence-first run-of-show and rehearse against actual final-revision behavior; no prerecorded material labeled live. |
| P6-04 | Demonstrate mandatory real keyboard-driven Ink TUI and web opening the **same versioned report and evidence IDs**. |
| P6-05 | For each important finding show observation, significance, exact evidence, explanation strength, unknowns and next action; AI remains separately labeled and non-authoritative. |
| P6-06 | Check initial `HACKATHON.md`-only commit, subsequent PRs/tested CI, product-model/coding-assistant disclosures, license, README, required GitHub files and examples with actual generated output. |
| P6-07 | Preserve lawful original/modified inputs, source snapshots, real reports and pinned setup; offline replays are timestamped and not claimed as fresh verification. |
| P6-08 | Report actual coverage and held-out evaluations with denominators, false alarms, abstentions and limitations; no invented performance/safety claims. |
| P6-09 | Explicitly distinguish live analyzer output, captured report replay, controlled registry simulation and UI fixtures; prohibit case-specific hidden answers. |
| P6-10 | Shane leads deterministic engine, source/provenance, CLI/TUI and monitoring; Malhar leads heuristics/build interpretation/RAG/model evaluation; both can defend the entire pipeline. |
| P6-11 | Rehearse four-minute technical Q&A on source ambiguity, provenance, generated content, risk, AI benefit, rebuild isolation, false positives, monitoring and differentiation. |
| P6-12 | Maintain exact-final-commit runbook, claims audit, clean setup, test results and handoff; verify final PR/CI and external submission separately. |

**Acceptance scope:** This is approval of a presentation/documentation/handoff design. No live demo, model inference, final CI pass, actual submitted SHA, package rebuild, complete Problem 04 coverage or external submission is hereby asserted.

**Artifacts:** [`Phase 06`](Approved/phases/HEURISKO_PHASE_06_PRESENTATION_DOCUMENTATION_HANDOFF_APPROVED_v0.1.0.md), [`Team Development Checklist.md`](Team%20Development%20Checklist.md).

## Shane–Malhar Pre-Split Engineering Agreement v0.1.0 — APPROVED

**Approval recorded:** 31 October 2026 (IST). Shane explicitly stated `Shane=agree, Malhar=agree, Amendments=None`. **Shane's approval is direct; Malhar's agreement is reported by Shane rather than independently received from Malhar.** No amendments were requested. All **A01–A14** have been accepted as *shared implementation directions* and do not change any decisions in approved Phases 01–06.

| Approved agreement | Joint decision summary |
|---|---|
| A01 | Shared pnpm/TypeScript workspace; one Node engine, mandatory React/Ink TUI, React web, shared report. |
| A02 | Shane owns validated evidence/core/CLI/TUI/monitor; Malhar owns heuristics/build interpretation/RAG/AI validation; Shane orchestrates joint output. |
| A03 | Shared JSON Schema v0.1.0 vocabulary covering artifact input/identity, source candidates, evidence, findings, AI interpretation, investigation report and watch jobs. |
| A04 | Exact artifact SHA-256 identities, deterministic evidence IDs and immutable versioned report identifiers. |
| A05 | Separate trust/completeness/AI dimensions and staged errors; initial CLI exit-code mapping 0/1/2/3 with precedence tests pending. |
| A06 | Malhar consumes Shane's bounded structured evidence; AI is optional to verification; per-investigation retrieval without mandatory fine-tuning/vector DB. |
| A07 | Risk severity, evidence confidence, review priority, explanation strength and completeness stay separate; no overall safety certificate. |
| A08 | CLI/TUI/web render the same report without creating independent trust/finding logic; web initially reads local/exported reports. |
| A09 | Non-executing static path; bounded untrusted inputs; restricted verified sandbox for any optional rebuild; no tool authority for model. |
| A10 | Durable exact-release monitoring, deduplication and restart recovery; no implied 24/7 service unless a real runner is configured. |
| A11 | Shared F0–F7 scenario/fixture definitions, including source conflicts, missing provenance, AI failures and watch restart. |
| A12 | Branch ownership, reviewed shared-contract changes and required PR/CI/disclosure workflow. |
| A13 | G0–G6 integration gates, early true vertical slice and checkpoint communication. |
| A14 | Feature completion requires valid contracts, tests, actual evidence, review and green CI. |

**Approval is not G0 passage.** The actual JSON Schema/TS source files, F0–F6 test fixtures, producer→consumer handshake, and repository CI results have not been verified in this record. Both developers **may begin independent, contract-independent preparation**; do not claim unrestricted interface-dependent parallel implementation is integration-ready until **G0 is tested and jointly accepted**. Owner-specific technical choices explicitly deferred in part B remain deferred.

**Post-audit candidate note (31 October 2026):** The parked G0 schema, types, fixtures and semantic checks were revised to address integrity/provenance success conditions, identity context and omitted-file accounting. The [agreement's E07 note](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md#e07-post-audit-candidate-revision--31-october-2026) records the scope. This is a technical candidate revision, not an amendment to A01–A14 or a joint G0 acceptance.

**G0 integration note (31 October 2026, before PR review):** Shane requested closure work. The revised contract was integrated locally in [packages/contracts](../packages/contracts/package.json), with pinned tooling and a CI contract job. The local full JSON Schema/semantic suite, TypeScript 5.8.3 typecheck and stubbed handshake passed. The [agreement's E08 note](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md#e08-root-integration-and-local-g0-validation--31-october-2026) records the checks. At that point technical acceptance and remote CI were pending; the later amendment below supersedes that status.

**G0 acceptance amendment (31 October 2026):** After the integration commit, Shane explicitly instructed Codex to review the exact contract once and treat the team as accepting it on that review. Codex reviewed the schema, types, validator and F0–F6/F7/negative fixture outcomes; no blocker was found for the synthetic G0 interface. [PR #2 CI](https://github.com/sumnlikeshane/Heurisko/actions/runs/41222794704) passed its contract and documentation jobs on `0e6adb9`. This later user instruction replaces the earlier separate-review prerequisite **for G0 only**. It is a delegated team acceptance, not evidence that Malhar independently reviewed the files or that any product capability works. The contract is accepted for separate interface-dependent work; PR merge into `main` is still pending. See [E09](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md#e09-delegated-g0-contract-acceptance--31-october-2026).

**Canonical approved artifact:** [`Engineering agreement`](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md). The [earlier proposed work split](Shared_Notes/work_split.md) remains as an audit record.

## Project license choice — Apache-2.0

**Decision date:** 31 October 2026. **Authority and scope:** Shane delegated the choice between the organizer-permitted MIT and Apache-2.0 licenses for original Heurisko project material. Apache-2.0 was selected and the official full text added as the local root [LICENSE](../LICENSE), with a [NOTICE](../NOTICE). This is a license decision, not a claim that the files have been committed, reviewed by CI, or published.

**Rationale:** Apache-2.0 is permissive and includes an express contributor patent grant. The prior founder research preferred Apache-2.0; the current delegated choice resolves that proposal for the project. The license does not relicense organizer-supplied governing files or third-party dependencies, model weights, sources, and assets. Those require their own admission and attribution checks. [Official license text](https://www.apache.org/licenses/LICENSE-2.0.txt) and [Apache application guidance](https://www.apache.org/legal/apply-license.html) were checked before adding the files.

## Current decision workflow

**Phases 01–06:** ALL APPROVED as design decisions by explicit user confirmation. **Pre-split A01–A14:** APPROVED (Shane directly; Malhar as reported by Shane); G0 implementation/verification OPEN.  
**Implementation, security verification, live AI, monitoring, UI completion, CI and final submission:** NOT ATTESTED by this register.  
**Consolidated handoff:** [`Team Development Checklist.md`](Team%20Development%20Checklist.md). Any future change to the approved rules requires an explicitly recorded amendment.

### Governance

- Explicit founder confirmation is required before any new proposed decision becomes approved.
- Preserve earlier choices and proposal versions; approval of a principle is not implementation or empirical validation.
- Record modified decisions with amended versions and renewed confirmation.
- Do not invent package verification outcomes, rebuild isolation evidence, live monitoring uptime or model-performance measurements.
