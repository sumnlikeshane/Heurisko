# HEURISKO — Phase 06: Presentation, Documentation & Handoff

**Version:** 0.1.0  
**Date:** 31 October 2026  
**Status:** APPROVED — design/presentation plan only; implementation not attested  
**Depends on:** Confirmed Phase 01 v0.2.0, Phase 02 v0.2.0, Phase 03 v0.1.0, Phase 04 v0.1.0 and Phase 05 v0.1.0  
**Owners:** Shane and Malhar (joint); approved by Shane on 31 October 2026; actual presentation claims still require supporting evidence and both owners’ review.

## Objective

Prepare a credible, reproducible account of Heurisko for judges, first-time developers and maintainers. The core narrative is **“Does this exact published package correspond to its claimed source, what explains the differences, which changes deserve review, and what remains unknown?”** Show a functioning shared engine through the mandatory CLI/TUI and browser evidence viewer, real evidence references, meaningful open-weight inference, and release monitoring. Do not imply that this document approves or delivers any unimplemented feature.

The supplied research baseline reports an **eight-minute pitch, four-minute Q&A and two-minute buffer**. Use these as the presentation plan; do not invent the missing full judging weights. The organizer requirements documented in the research include the repository's `HACKATHON.md`-only first commit, later PRs with passing CI, MIT or Apache-2.0 license, README, PR template, workflow, and examples of actual outputs.

## P6-01 — Narrative and core claim

**Recommendation:** Lead with the supply-chain *source-to-artifact* gap, not a generic vulnerability scanner or “AI malware detector.” Explain that registry digests, provenance, build correspondence, behavior/risk and analysis coverage are distinct. Heurisko helps users understand exact packages and review evidence, **not certify harmlessness**. Differentiate from existing tools by showing the integrated investigation and residual evidence; do not assert novelty solely because it diffs a package against Git.

**Acceptance:** An opening paragraph and closing statement that make these limits understandable without technical jargon.

## P6-02 — Demonstration case selection and truth labeling

**Recommendation:** Use four connected demonstrations:

1. **Real benign release** showing ordinary packaging/generated differences, with its actual source commit and any demonstrated build evidence. A hypothesized transformation must not be presented as a reproduced one.
2. **Reproducibly tampered *local copy***, showing a real introduced executable/manifest change, distinct digest, exact diff and justified potential impact. Never represent it as an authentic published attack.
3. **Uncertain/incomplete release or fixture** where missing/conflicting provenance, source ambiguity or unsupported build causes an honest unresolved result. Clearly label a fixture if simulated.
4. **Selected-release monitor replay** where a genuinely executed analysis processes a newly discovered controlled release once, with durable state and visible scheduler/replay status.

Use Phase 03 provisional candidates (`picocolors@1.1.1`, `ts-pattern@5.9.0`, `zod@4.6.7`) only after validating their exact artifact and source identities; replace a candidate if ground truth fails. Keep at least one unseen/judge-selected input route that runs the real analyzer, not a hardcoded screen.

**Acceptance:** Each demo has a manifest, inputs, source assertion, expected evidence, actual output, capture time and limitations.

## P6-03 — Eight-minute presentation run-of-show

**Recommendation:** Prepare the following *proposed* timed narrative, then rehearse with actual performance measurements:

| Time | Segment | Evidence shown |
|---|---|---|
| 0:00–0:45 | Why this matters | Exact-package/source problem and Heurisko's bounded claim |
| 0:45–1:35 | Start an investigation | `heurisko` TUI plus CLI, pinned target, artifact digest and source candidate |
| 1:35–2:40 | Genuine benign difference | File navigation, TypeScript/generated/packaging difference and evidence strength |
| 2:40–4:20 | Tampered local copy | Original vs modified digest, manifest/executable change, finding significance and direct evidence |
| 4:20–5:10 | Honest uncertainty | Provenance/source/build gap displayed without a safe/unsafe verdict |
| 5:10–6:05 | Meaningful model work | Live open-weight inference, bounded evidence, cited hypothesis and AI-off comparison/limits |
| 6:05–6:50 | Release monitor | Controlled new-release discovery, durable deduped job, explicit replay/scheduler status |
| 6:50–7:40 | Shared evidence explorer | Browser opens the *same report*, follows the exact file/evidence ID; show consistent CLI/TUI/web meaning |
| 7:40–8:00 | Close | What is proven, what is not, next developer action |

Allow a live judge-chosen artifact substitution where feasible; if inference or retrieval is slow, rehearse a modular sequence and disclose which steps are being replayed from previously generated *real* results. Never present a recording or static mock as a live run.

**Acceptance:** Complete a timed rehearsal on the submission revision, checking the script against actual observed results.

## P6-04 — Mandatory TUI and browser demonstration

**Recommendation:** Demonstrate the mandatory TypeScript/React/Ink TUI as a real first-class workflow: keyboard-driven selection, overview, finding, source/published file diff, evidence jump, AI interpretation/abstention, monitoring, and error/incomplete states. The web viewer must open the same versioned report and reference identical findings, source identities and limitations. Avoid building a separate browser-only “analyzer.”

**Acceptance:** A judge can pick a finding in either UI and inspect the same immutable evidence ID and associated bytes/spans.

## P6-05 — Explain findings, risk and AI without overclaiming

**Recommendation:** For each demonstrated finding, speak and display **observation → security significance → evidence → explanation strength → unknowns → next action**. Keep severity, evidence strength, review priority and completeness separate. Show the AI's actual model-generated hypothesis with evidence references, alternatives, missing evidence and abstention; explicitly state it cannot verify hashes, provenance, reproducibility or malicious intent. Avoid percentages suggesting package safety or model confidence.

**Acceptance:** Both team members can explain why a verified digest, valid signature, reproduced build and AI hypothesis support different kinds of statements.

## P6-06 — Submission documentation and examples

**Recommendation:** Verify, but do not claim until observed, all event-required repository evidence:

- First commit contained **only `HACKATHON.md`**, accurately naming team/problem/model choices and rationale; preserve commit history.
- Subsequent work used PRs with descriptions, tests and product-model / coding-assistant disclosure as required by the organizer; CI green on the final scored commit.
- `LICENSE` (MIT or Apache-2.0), `README.md`, `.github/pull_request_template.md`, `.github/workflows/ci.yml`, and `examples/` of **actual inputs and actual generated outputs**.
- README provides requirements, clean installation, CLI/TUI launch, report viewing, watch scheduler setup, real example reproduction, supported input scope, safety boundary and troubleshooting.
- Examples distinguish verified real artifacts, modified local fixtures and simulated watch metadata; note observed artifact/source IDs, runtime/model configuration and captures.
- No secrets, prohibited private data or automated comments/issues on real projects.

**Acceptance:** A different machine or fresh environment can follow README steps and produce a genuine useful report, subject to declared runtime/network requirements.

## P6-07 — Reproducibility and fallback plan

**Recommendation:** Prepare a primary live path and an honest fallback path:

- Retain lawful/public original artifacts, test-modified local copies, source snapshots and versioned JSON/evidence bundles as allowed by storage/license rules.
- Verify clean install, pinned runtime/model and dependency versions, real inference feasibility, time/memory use and expected file links.
- Keep offline-compatible **previously generated real reports** for viewing if registry/network/model access fails, with timestamps and “replay, not fresh analysis” labels.
- Distinguish an actual locally running monitor from controlled registry/clock replay.
- Avoid demonstrations dependent on secret API keys or closed-model services.

**Acceptance:** Offline report viewing survives network failure without inventing a fresh verification outcome.

## P6-08 — Evaluation evidence and limitations

**Recommendation:** Report a support matrix against all organizer Problem 04 capabilities: registry artifact retrieval; claimed source retrieval; source/artifact comparison; generated/build recognition; suspicious changes; evidence-grounded explanation; risk review; and selected-release monitoring. Include model usage and interface evidence separately. Show Phase 03 scenario results, counts and denominators, actual false alarms/abstentions, and where evidence is insufficient. No unmeasured detection rate, reproduced transformation or security-certification claim.

**Acceptance:** Every public feature/security claim can be traced to an actual test/report/artifact, or is explicitly marked unimplemented/unsupported.

## P6-09 — Live demonstration governance

**Recommendation:** Clearly distinguish **live engine**, **captured report replay**, **controlled simulated registry/clock** and **interface mock/fixture** during the presentation. No hidden hardcoded package-specific conditions, no synthetic output labeled real, no silently altered source inputs. Preserve a judge-chosen mutation/test route when safe and supported. State source association and original-versus-local-copy differences explicitly.

**Acceptance:** A technical reviewer can reproduce the demonstrated observation from recorded inputs, or understand precisely why it cannot be reproduced in the test environment.

## P6-10 — Team roles and cross-examination

**Recommendation:** Shane leads the deterministic core, provenance, CLI/TUI and monitoring explanation. Malhar leads build/suspicious-change heuristics, bounded RAG, live model inference and citation validation. **Both** must be able to explain the entire source-to-artifact pipeline, report trust model, failure paths and technical tradeoffs; no knowledge silo. Conduct a paired code walkthrough and swap the speaker for one rehearsal.

**Acceptance:** Each can independently answer why a package may differ legitimately, why the chosen source may be wrong, what provenance can/cannot show, why models cannot certify, why rebuilds require isolation, and what “monitoring running” really means.

## P6-11 — Q&A and objections

**Recommendation:** Prepare concrete evidence-backed responses to foreseeable questions: how you choose source revision; how you handle monorepos and generated content without filename exceptions; how you verify attestation; why a postinstall script isn't automatically malware; false-positive/false-negative limits; what the model contributes versus fixed templates; why a verified rebuild is not a safety guarantee; how you monitor reliably; how an unseen package behaves; what differentiates Heurisko from OSS Rebuild/reproduce/Drydock; and how sandbox escape is prevented. Unknown implementation details must be admitted as open rather than improvised.

**Acceptance:** Rehearse the four-minute Q&A with both contributors responding using actual artifacts and acknowledged limitations.

## P6-12 — Final handoff, claims audit and approval gate

**Recommendation:** Maintain a single launch/runbook document covering: exact scored commit, release/runtime pins, supported cases, demo order, fallback artifacts, test results, known limitations, team responsibilities, talk track and setup commands. Before submission: verify required files, PR/CI history, no secrets, genuine generated examples, final working tree/commit, TUI/web/report parity and selected-watch demonstration. Freeze slides and demo outputs only after generating them from the final scored revision.

**Acceptance:** Both contributors attest that every statement in slides, README, examples and live spoken narrative is supported or clearly labeled future work. The final submitted revision passes CI and can be installed as documented; check event submission deadline independently rather than infer that committing equals submission.

## Open specifics — not silently approved

- Final selected packages/digests/source commits (Phase 03 candidates still require actual verification).
- Exact presentation screenshots, build reproduction evidence and any measured latency/accuracy.
- Final model/runtime selection and availability on demonstration hardware.
- Final recorded artifact/report paths and demonstration deployment mode.
- Final exact platform support and any organizer updates to hidden tests/rubric.

## Phase 06 confirmation boundary

Shane explicitly confirmed P6-01–P6-12 on 31 October 2026. This **accepts the presentation/documentation/handoff plan**; it does not assert that a live TUI, isolation worker, registry monitor, browser, AI demonstration, CI or benchmark has already succeeded. If any proposed demonstration feature remains unsupported, the runbook must identify it accurately; the team cannot claim full Problem 04 completion without demonstrating its required capabilities.

**Approval state:** P6-01 through P6-12 — **APPROVED** by Shane on 31 October 2026; implementation, testing and evidence remain separately required.

## Source basis

`HEURISKO_EXECUTIVE_BRIEF.md`; `HEURISKO_PRODUCT_DEFINITION.md`; `HEURISKO_RESEARCH_BASELINE.md`; `HEURISKO_IMPLEMENTATION_ROADMAP.md`; approved Phases 01–05; and the organizer requirements summarized in the research baseline. The original referenced verification/technical-architecture annexes were not in the five initial source files and therefore no unverified annex claims are added.


**Consolidated engineering handoff:** [`Team Development Checklist.md`](../../Team%20Development%20Checklist.md).
