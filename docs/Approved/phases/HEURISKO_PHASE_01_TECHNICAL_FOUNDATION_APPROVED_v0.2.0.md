# HEURISKO — Phase 01: Technical Foundation

**Version:** 0.2.0  
**Date:** 31 October 2026  
**Status:** APPROVED — Shane explicitly confirmed D01–D06  
**Team:** Shane and Malhar  
**Scope:** Architecture, ownership, initial ecosystem, mandatory terminal experience, AI execution and uncertainty.

> **Archive provenance:** This standalone document was reconstructed from the complete Phase 01 v0.2.0 text expressly approved in the conversation. A separate original Phase 01 Markdown attachment was not available. The corresponding approved decision register is also included. This is an approved design, not an implementation claim.

## D01 — Initial package ecosystem

**Approved: npm first.**

- Implement complete source-to-published-artifact investigation for supported npm packages.
- Support exact package versions, exact published archive identities and explicit local archive analysis.
- Use an extensible ecosystem adapter contract so PyPI can be supported later without a redesign.
- Do not imply every npm package or arbitrary package type has been verified.
- Source revision selection requires supporting evidence, not tag-name matching alone.

**Rationale:** npm provides compelling TypeScript compilation, generated artifacts, packaging rules and lifecycle-script examples. The organizer's original Problem 04 accepts npm **or** PyPI.

## D02 — Language and architecture

**Approved: TypeScript across the main application.**

| Component | Approved technology | Obligation |
|---|---|---|
| Analysis engine | TypeScript + Node.js | Mandatory |
| CLI commands | TypeScript + Node.js | Mandatory |
| Interactive TUI | TypeScript/TSX + React + Ink | **Mandatory** |
| Web application | React + TypeScript | Mandatory |
| Shared contracts | TypeScript + versioned JSON Schema | Mandatory |
| AI adapter | TypeScript interface to a real open-weight runtime | Mandatory |

All interfaces consume one shared engine and one report contract. The browser or TUI must not implement independent verification/verdict rules. A specific pinned Ink/React/Node combination must be validated against published releases and the target terminal environment.

## D03 — Team responsibility

**Shane owns:** npm artifact acquisition, hashes/integrity, repository and source candidate resolution, provenance acquisition/verification adapter, source and artifact file inventories, raw differences, investigation orchestration, scriptable CLI, mandatory Ink TUI, local monitoring and corresponding operating infrastructure.

**Malhar owns:** security-relevant difference heuristics, build transformation interpretation, contextual evidence selection, RAG retrieval, open-weight model inference, structured evidence-cited AI explanations, model output validation, hallucination/abstention and model evaluation.

**Both own:** shared report/schema decisions, integration, end-to-end testing, React web app, documentation, demonstration, explanation of critical system behavior.

Neither developer's module can silently replace verified facts supplied by the other.

## D04 — Mandatory terminal experience

**Approved: TypeScript/TSX + React + Ink interactive TUI is first-class and required.**

Minimum capabilities:

1. Investigation selection: choose package/version or open prior report.
2. Overview: artifact and source identity, stage completeness, findings, unknowns.
3. File explorer: navigate source and published archive trees.
4. Difference viewer: exact changes and supporting file spans.
5. Findings navigation: explained, unexplained, security-relevant and unsupported observations.
6. AI explanations: inspect interpretations, cited evidence, alternatives, uncertainties.
7. Keyboard-first interaction: navigate panels, open evidence, search and exit.
8. Adaptive layout: narrow terminals and large output are usable.

Proposed entry points (exact syntax closed by Phase 02): `heurisko` for TUI, `heurisko analyze ...` for scriptable analysis, `heurisko inspect ...`, `heurisko tui ...`, `heurisko watch ...`.

The TUI uses the shared engine, never runs untrusted file contents, and remains useful when the AI cannot run. An optional CLI-only interface is not a replacement for this mandatory TUI.

## D05 — Execution and deployment

**Approved: local-first.**

- The shared engine, CLI and TUI operate locally; the browser consumes shared reports.
- Run genuine open-source/open-weight inference locally or via a **verified organizer-compatible open-model service**; no closed API dependency or silent closed-model fallback.
- Qwen candidates are proposals for genuine benchmarking, not selected measured winners.
- Core use requires no account or hosted backend.
- Static inspection never executes untrusted scripts/packages.
- Any supported rebuild using untrusted code requires an approved isolated worker; no unsafe host fallback.
- Hosting, quotas and cloud operation require separate future approval.

## D06 — Verification and uncertainty

**Approved: evidence-first reporting.**

- Each investigation binds to exact archive bytes, source candidates, and relevant analysis configuration.
- Keep artifact identity, source association, provenance, file-level correspondence, security-relevant observations, analysis completeness and AI interpretations distinct.
- Preserve raw differences and unexplained residuals even when a transformation appears plausible.
- Missing/conflicting information yields visible unresolved or incomplete states.
- A difference is not proof of malicious intent; matching or valid provenance is not proof of universally harmless software.
- AI supplies labeled, referenced hypotheses and cannot overwrite hashes, signature verification, source association or deterministic results.

## Phase 01 acceptance and confirmation

Shane explicitly approved Phase 01 v0.2.0, D01–D06. The mandatory TUI requirement superseded the earlier optional-TUI wording in v0.1.0. This is an approved **product/architecture decision**, not evidence of completed code, actual npm analyses, deployed monitoring or verified build sandboxing.

**Next dependencies:** Phase 02 closes user experience details; joint engineering agreement A01–A14 and G0 contract package close the concrete integration interfaces (now under `docs/Approved/` and `docs/G0_Candidate/` in this repository).
