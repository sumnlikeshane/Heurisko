# HEURISKO — Phase 02: CLI, TUI & Investigation Experience

**Version:** 0.2.0  
**Date:** 31 October 2026  
**Status:** APPROVED — Shane explicitly confirmed P2-01–P2-12  
**Depends on:** Approved Phase 01 v0.2.0  
**Primary owner:** Shane; Malhar supplies interpretation/analysis integrations.

> **Archive provenance:** This standalone document was reconstructed from the complete Phase 02 v0.2.0 text expressly approved in the conversation, including the risk/AI explanation amendment. A separate original Phase 02 Markdown file was not available. See the included approved decision register. It describes approved behavior, not implemented features.

## Objective

Help a developer understand which **exact published artifact** and **claimed source** were examined; what changed; which differences are verified, explained, hypothesized or unresolved; what security-relevant behavior may follow; what evidence supports those findings; how the AI adds interpretation; and what the user should examine next.

Do not produce a generic malware detector, safety percentage, or unsupported binary safe/malicious decision. Every interface—CLI, mandatory TUI, browser, report—preserves the same meaning.

## P2-01 — Entry and interaction modes

- `heurisko` opens the interactive Ink TUI by default.
- `heurisko analyze <target>` performs a scriptable noninteractive investigation.
- The TUI can initiate new investigations and open saved ones.
- All invocation modes call the same analysis engine and render the same versioned report.
- Shell/CI usage must not require terminal interaction or a hosted account.

## P2-02 — Command structure

The approved **proposed** command set (exact option flags remain an implementation contract):

| Command | Function |
|---|---|
| `heurisko` | Interactive investigation home |
| `heurisko analyze npm:package@version` | Analyze exact npm release |
| `heurisko analyze --artifact <path> --source <repo>@<commit>` | Compare explicit local archive/source |
| `heurisko inspect <report>` | Show existing report in readable terminal format |
| `heurisko tui <report>` | Open report interactively |
| `heurisko watch add <package>` | Add a monitored package |
| `heurisko watch run --once` | Check for releases once |
| `heurisko watch status` | Inspect monitor state |
| `heurisko watch remove <package>` | Remove a watch |

Support JSON output, report output paths, no-color, and AI-disabled investigation. Project-wide lockfile/project scans and advanced version-to-version comparison are enhancements, not this phase's minimum contract.

## P2-03 — Interactive TUI architecture

1. **Home:** start an npm or local-archive investigation, reopen reports, view recent failed/incomplete jobs and monitored packages.
2. **Overview:** exact artifact version/digest, source repo/commit and association strength, provenance, relationship status, major security observations, counts of explained/unexplained/unassessed differences, coverage, unknowns and next actions.
3. **Files and diffs:** source and artifact trees, correspondence, raw and normalized views, added/removed/modified/generated/unchanged content, evidence-linked paths/spans, search and filters.
4. **Findings:** security-relevant, established, supported transformation, unresolved and incomplete results; filtering by review priority and evidentiary strength.
5. **Provenance/build:** registry digest and integrity status, source claims/conflicts, verified attestation identity/policy state, build configs and isolated reproduction results when available, plus limits.
6. **AI interpretations:** separately labeled explanation hypotheses, cited records, alternatives, missing evidence, recommended steps, model status and limits.
7. **Monitoring:** watchlist, discoveries, last check, failures, job history, running/stale/stopped state.

A three-pane navigation/difference/evidence layout is preferred when space permits; narrow terminals use stacked views. Escaped untrusted data is never executed or interpreted as terminal commands.

## P2-04 — Keyboard controls

- Arrows / `j` / `k`: move through items.
- `Enter`: open a report, finding, file or evidence record.
- `Esc`: navigate back or close a detail.
- `Tab` / `Shift+Tab`: switch focus.
- `/`: search/filter.
- `?`: contextual help.
- `q`: quit or exit the current view, accounting for active jobs.
- `Ctrl+C`: safely interrupt foreground work.

Support scrolling, wrapping, narrow widths, predictable focus and large report navigation without mouse use.

## P2-05 — Investigation lifecycle

Show truthful stage states for:

1. Exact artifact resolution.
2. Acquisition and digest verification.
3. Candidate source resolution.
4. Provenance collection/verification where available.
5. File inventory and raw comparison.
6. Build-aware and suspicious-change investigation.
7. Optional AI interpretation.
8. Local persistence and report display.

Every stage distinguishes completed, incomplete, skipped and failed conditions as appropriate. AI unavailability does not destroy the deterministic report; uncertain source identity cannot be silently repaired by speculation.

## P2-06 — Reports, persistence and exit outcomes

- Keep a local immutable, versioned report linked to artifact identity, selected source and configuration.
- Saved report replay must not imply fresh online checks.
- Report, CLI, TUI and web agree on the same findings and IDs.
- JSON mode sends one structured document to stdout, diagnostics to stderr.
- Distinct outcomes: completed/configured-policy pass, policy violation, materially incomplete investigation and invocation/internal failure.
- A process exit of zero must not imply universal package safety.
- Exact numeric statuses/precedence require concrete shared contract tests, not UI invention.

## P2-07 — Finding explanation contract

Every important finding explicitly explains:

1. **Observation: what happened?** Precisely established delta, not motive. Example: a published manifest has a `postinstall` script absent from selected source.
2. **Significance: why does it matter?** Potential consequences/behavior (install-time command execution); do not assert maliciousness merely from capability.
3. **Evidence: how do we know?** Exact source/published path, hash, diff spans, original and altered bytes, stable evidence IDs, provenance/build records and verification status.
4. **Explanation: what caused it?** Distinguish exact match, independently reproduced output, supported-but-unreproduced transformation, plausible hypothesis, unexplained change and unsupported analysis. Similarity alone is not proof.
5. **Limitations: what remains unknown?** Unverified source, missing provenance, unsupported binary, missing build recipe, conflicting metadata, or AI-only hypothesis.
6. **Next action:** inspect exact script/file, verify source/release workflow, ask maintainer, attempt a safe isolated rebuild, or reconsider use pending review.

Recommended actions are human investigative guidance, never automatic installation or security certification.

## P2-08 — Risk assessment and review priority

**Four independent dimensions:**

- **Severity:** high/medium/low/informational/undetermined as a proposed display vocabulary; potential impact and execution surface—not maliciousness proof.
- **Evidence confidence:** strength of support for **the particular claim**; strong byte-level observation may coexist with weak source identity or explanatory uncertainty. Model confidence is not calibrated safety probability.
- **Review priority:** order for human investigation based on consequence, evidence, corroboration and unresolved questions; not a package safety score.
- **Completeness:** explicit analyzed/skipped/unsupported stages, files and bytes. Incomplete work never becomes a clean verdict.

Every relevant finding should communicate observed behavior, possible risk, evidence strength, benign alternatives, and next step. No fabricated all-in-one risk percentage.

## P2-09 — AI interpretation and presentation

AI is a **separately identified, non-authoritative hypothesis layer**. It may explain deltas, propose build mechanisms, cite evidence, give alternatives/missing evidence, suggest next investigative steps, and abstain.

Each accepted interpretation includes:

1. Suggested interpretation.
2. Reasoning summary tied to actual supplied evidence.
3. Existing evidence IDs supporting individual claims.
4. Plausible alternatives.
5. Missing distinguishing evidence.
6. Proposed next action.
7. Abstention reason where no supported conclusion exists.

Validate schemas, citations, paths and spans; track whether interpretation is accepted, rejected or unavailable and record model identity/inference metadata. Schema-conformance is **not** proof of entailment or truth. Model cannot certify provenance, source identity, build equality, malicious intent or package safety; it cannot overwrite deterministic facts. On timeout/OOM/invalid output/unsupported claims, preserve the deterministic report, record failure and do not silently use a closed model.

## P2-10 — Plain-language summary and decision support

The first screen explains:

1. Main established takeaway and reason for review.
2. Exact published bytes and source candidate investigated.
3. Established/supported/hypothesized/unresolved artifact relationships.
4. Highest review-priority observations with justification.
5. Available AI interpretations (labeled).
6. Important unknowns and coverage boundaries.
7. Next evidence-grounded human action.

Narrative is derived from structured findings and cannot introduce unsupported new conclusions. A user should understand the result before navigating raw diffs and then independently verify by following its evidence.

## P2-11 — Findings groupings

Findings are grouped by meaning, and groups may overlap:

- Established correspondence.
- Explained transformations with specific evidence strength.
- Security-relevant observations.
- Unexplained residual differences.
- Incomplete or conflicting evidence.

Opening a finding reveals the source/artifact content, exact evidence IDs, deterministic observation, transformation evidence, optional AI hypothesis, limitations and suggested investigative actions. Interface grouping never changes verification status.

## P2-12 — Approval and acceptance scope

Approved behavior requires:

- First-class keyboard-operated TUI and independent scriptable CLI.
- Exact npm/local archive investigations.
- Artifact/source/context and stage statuses.
- Drill-down to raw file-level evidence.
- Clear observation/significance/evidence/explanation/unknowns/next action per important finding.
- Distinct severity, confidence, priority and completeness.
- Visibly labeled evidence-cited AI interpretations and graceful abstention/failure.
- Honest missing/contradictory evidence handling.
- Same report semantics in CLI/TUI/web.
- Reachable release monitoring.

**Explicitly deferred:** exact JSON Schema field names, measured severity thresholds, algorithm-specific verification and transformation rules, model performance requirements and pinned tool integration. The later approved G0 package supplies **proposed concrete types and synthetic validation**, but must still pass actual repo CI and joint review.

## Confirmation

Shane explicitly approved Phase 02 v0.2.0, P2-01–P2-12, replacing the previous Phase 02 v0.1.0 draft. This is approved design, not a claim that the TUI, model, engine or monitoring already works.
