# HEURISKO — Phase 03: Evaluation Packages & Test Corpus

**Version:** 0.1.0  
**Date:** 31 October 2026  
**Status:** APPROVED — Shane explicitly confirmed P3-01 through P3-08 on 31 October 2026  
**Depends on:** Approved Phase 01 v0.2.0 and Phase 02 v0.2.0.  
**Owner:** Shane (artifact/source corpus), Malhar (analysis labels/model evaluation), joint review.

## Objective

Establish a reproducible set of exact npm artifact/source investigations that tests benign package differences, real generated output, source resolution complexity, locally modified test copies, and incomplete evidence. The corpus supports engine tests, RAG evaluation, CLI/TUI/web demonstration, and unexpected-input generalization. A package's reputation does not establish its source/artifact equivalence.

## P3-01 — Initial real-package candidates

1. **picocolors@1.1.1** — small JavaScript package, simple inventory/packaging baseline; upstream https://github.com/alexeyraspopov/picocolors . Confirm actual archive and source identity before declaring any expected matches.
2. **ts-pattern@5.9.0** — TypeScript source with published `dist/` entrypoints, good candidate for transformations, file mapping and declaration/bundle explanation; upstream https://github.com/gvergnaud/ts-pattern . Confirm exact release commit, tarball contents, and actual build evidence; `dist/` names alone prove nothing.
3. **zod@4.6.7** — complex TypeScript package from a monorepo at `packages/zod`, with multiple conditional exports/build forms; upstream https://github.com/colinhacks/zod . Confirm exact source subdirectory, full commit, release tarball and toolchain requirements.

These package names/versions are source-researched **candidates**, not downloaded or empirically validated benchmark cases. Replacement is allowed when a candidate fails corpus criteria, with rationale recorded.

## P3-02 — Immutable fixture manifest

Every actual benchmark case records: case ID, package and exact version, registry response + retrieval timestamp, canonical tarball URL/filename, expected integrity and observed SHA-256/SHA-512, archive inventory, public repository URL, source candidate(s), full commit SHA, monorepo subdirectory, source evidence and conflicts, provenance evidence and trust conditions, artifacts stored by digest, comparison configuration/tool versions, actual observed outcomes, and independent labels. Unknown values remain `unverified` until measured; never insert guessed hashes or full SHAs.

## P3-03 — Test-case families

- **B1 — straightforward legitimate release:** ordinary packaging differences vs exact content matches.
- **B2 — legitimate generated output:** TS/JS, declarations, bundle or metadata changes; determine which correspondences are verified, merely supported, or unexplained.
- **B3 — complex/monorepo release:** correct subdirectory/commit resolution, multiple exports and coverage reporting.
- **M1 — local manifest mutation:** clearly labeled copy of a real original tarball with an added/modified `postinstall` script; preserve original and mutated hashes; do not execute it.
- **M2 — release-only executable addition:** clearly labeled copied archive with introduced JS executable content absent from the pinned source.
- **M3 — non-security-relevant normalization case:** controlled archive metadata/order/timestamp changes, if achievable without changing file content; distinguish archive bytes from member contents.
- **U1 — incorrect or ambiguous source selection:** intentionally supplied wrong candidate/tag or conflicting metadata; show unresolved source relationship, not malware claim.
- **U2 — missing evidence/unsupported format:** absent provenance, unavailable source, unsupported build, parser failure or incomplete data; preserve skipped scope.
- **R1 — monitored-release event:** deterministic fake-registry replay introducing an unseen version, deduplicated and persisted through restart.
- **A1 — AI limitations:** injection-like text, invented evidence IDs, insufficient context or model-unavailable path; validate and retain deterministic output.

Controlled mutations are labeled as authored local test fixtures. No changes are uploaded to npm or represented as genuine incidents.

## P3-04 — Independent expected-result labels

Each case has a structured expected-observations sheet drafted independently from Heurisko execution: what changed, exact evidence location, whether identity is established, explanation strength, potentially security-relevant capability, limitations, and acceptable next-action guidance. Use verified evidence to label ground truth; a test expectation is not proof of real published behavior.

Separate **detection of a change** from **correct interpretation** and **malicious-intent attribution**. Label cases as benign, controlled-modified or unknown at the **fixture provenance level**, not as an automatic tool verdict.

## P3-05 — Evaluation dimensions

Evaluate (with denominators and unsupported cases included): artifact/source identity accuracy, observed difference recall, false alarms on legitimate builds, transformation-explanation correctness, citation/reference validity, unresolved/abstention appropriateness, analyzed-vs-skipped file/byte coverage, deterministic vs model-assisted explanation benefit, runtime/failures, and monitoring deduplication/restart behavior.

Do not report a measured benchmark, percentage improvement, safety guarantee or success rate until cases have been executed and graded.

## P3-06 — Split and generalization

Use a transparent demo corpus for explanation and reproducibility, plus a small held-out variant/family for real evaluation. Avoid evaluating only the same mutation pattern or same project used for tuning. Include at least one unseen input and a non-hardcoded path/file case. Curated examples are useful but do not establish broad detection accuracy.

## P3-07 — Safe handling and evidence provenance

Only use permitted public npm/source data. Do not install/run analyzed packages or lifecycle scripts on the host; static analysis by default. Isolated rebuilds must use the approved security boundary. Limit archive sizes and files. Preserve original and mutated artifacts under separate digests. Do not automatically create public issues/comments on real projects. Show timestamps and explicitly distinguish controlled simulations from live releases and archived replay.

## P3-08 — Division of work and readiness gates

**Shane**: select exact artifact candidates, record registry/source evidence, preserve digests and source candidates, create safe deterministic mutations, maintain manifest and non-AI evaluation cases, monitor replay.  
**Malhar**: independently label semantic/build-explanation expectations, design evidence-citation and hallucination tests, build and grade model-on/model-off comparison.  
**Both**: review fixture truth labels, audit ambiguity and safe behavior, agree pass/fail criteria, prepare genuine live demo and archival replay.

Phase 03 design is complete when both developers agree on candidate case families, fixture manifest, validation gates, evaluation metrics, demonstration separation, and responsibilities. Actual package acquisition/benchmark runs remain implementation work and must not be represented as already complete.

## Approval state

**P3-01 through P3-08: APPROVED by Shane, 31 October 2026.** This approves the proposed corpus design, provisional candidates and validation gates only; no acquisition, identity verification, model benchmark or security test has thereby been completed.
