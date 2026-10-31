# HEURISKO — Two-Person Development Plan

**Team:** Shane Joseph + Malhar Mahanor  
**Entry:** Problem 04 — Published Package vs Source Code Integrity Analyzer  
**Status:** Proposed responsibility split and integration plan; not approval of implementation decisions.

This note organizes possible work between two contributors. It does not approve a stack, dependency, license, model, hosting choice, or engineering scope. Before implementation, check the current founder decision register and repository instructions. User authorization for a specific task and the repository's PR/CI rules still apply.

## Product framing

Heurisko is a source-to-package verification engine enhanced by evidence retrieval and AI. Its difficult task is to relate one exact published artifact to evidence for its corresponding immutable source revision, compare their contents, and explain what remains unresolved. AI can help interpret evidence; it does not establish identity, certify safety, or replace deterministic observations.

The intended architecture is one investigation engine and one versioned report contract, with CLI, browser, optional TUI, CI, and monitoring as consumers. Interfaces must not independently calculate a package verdict. Keep artifact identity, source identity, provenance, comparison, completeness, and AI interpretation as separate report dimensions. Never collapse these into a safe/unsafe score.

RAG here means retrieving relevant evidence for an existing open-weight model; it does not imply model training. Fine-tuning is optional. Meaningful inference with an actual open model is an event requirement, but no model has yet been integrated or selected. See the [founder decision register](../Heurisko_Research/HEURISKO_FOUNDER_DECISIONS.md) and [product definition](../Heurisko_Research/HEURISKO_PRODUCT_DEFINITION.md).

## Proposed responsibility split

These are suggested ownership areas, not confirmed assignments. Shared contracts and interfaces should be agreed before parallel implementation. Either contributor may review the other's work, and both should understand the full submitted system.

### Shane — verification foundation, core engine, and CLI

**Focus:** produce reproducible evidence about exact package bytes and candidate source revisions, and expose it through a scriptable local workflow.

- **Architecture and contracts:** work with Malhar on typed inputs, report schema, evidence IDs, and package boundaries. The proposed TypeScript/Node monorepo is unapproved; check D-02 and related decisions before choosing a stack.
- **Acquisition and source resolution:** retrieve registry bytes without installing packages; bind results to ecosystem, name, version, exact filename, digest, and capture time. Resolve immutable source candidates, including package subdirectory/build context. Preserve conflicts and missing evidence rather than guessing. Local or modified archives must be marked `local-input`.
- **Deterministic evidence:** inventory files and hashes; retain raw archive and extracted-content evidence; identify exact matches, additions, removals, and modifications; preserve raw differences before scoped normalization. Keep unsupported files, parser failures, skipped stages, and residual changes visible.
- **CLI and orchestration:** provide a noninteractive interface over the shared engine and report. Keep machine-readable output separate from diagnostics. Freeze command syntax and numeric exit codes only through an approved contract.
- **Monitoring:** invoke the same engine for newly observed exact artifacts; persist observations and pending jobs; handle retries/restarts without losing or duplicating work; report freshness and failures. Monitoring is part of complete P04 scope.
- **Reliability and integration:** maintain fixtures and tests for acquisition, inventory, comparison, report replay, and monitoring as those capabilities are authorized and implemented.

**Expected handoff to Malhar:** a structured evidence bundle containing exact artifact and source identities, file inventories, hashes, raw differences, provenance/build evidence where available, coverage limitations, and stable evidence references.

### Malhar — deterministic analysis, retrieval, and AI explanations

**Focus:** identify consequential differences and explain what the available evidence supports, with explicit limits.

- **Analysis contract:** agree with Shane on evidence references and the structured finding/interpretation schema. Build independent fixtures for benign transformations, suspicious changes, and unresolved cases.
- **Deterministic heuristics:** flag evidence-backed changes to lifecycle scripts, executable entry points, manifest configuration, unexpected executable content, and scoped obfuscation indicators. Keep rules and their limitations explicit. Do not mark generated-looking paths as automatically harmless.
- **Build awareness:** investigate source maps, build configuration, and plausible transpilation/bundling relationships with bounded confidence. Preserve unexplained residuals. Rebuild evidence requires a separately approved, restricted execution boundary; never run hostile package or build code on the host.
- **Retrieval and model evaluation:** if authorized, benchmark actual open-weight models and a smaller alternative on representative, held-out evidence. Retrieve targeted source files, diff spans, provenance records, and build evidence while preserving hashes, paths, line ranges, and evidence IDs. Do not send an entire repository by default.
- **Explanation validation:** require evidence IDs, alternative explanations, missing evidence, and abstention. Reject invalid references and unsupported claims. Keep model output separate from hashes, source choice, provenance, comparison, severity, and coverage; it must never trigger commands, network access, builds, or publication.
- **Robustness and measurement:** evaluate citation support, explanation quality, abstention, prompt-injection resistance, runtime, memory, and failure behavior. Record untested or unsupported cases instead of reassuring guesses.

**Expected handoff to Shane:** an analysis module that consumes deterministic evidence and returns validated findings and optional interpretations without changing verified facts. On model failure, the deterministic report remains usable.

### Both — contracts, web experience, integration, and delivery

- Agree on shared contracts before freezing interfaces or splitting dependent work.
- Review the complete investigation flow and usability together.
- Build the browser experience over the same engine/report: evidence navigation, source-versus-artifact files, side-by-side diffs, findings, provenance/build evidence, AI citations, missing evidence, and uncertainty.
- Treat extracted source, HTML, SVG, Markdown, logs, and model text as untrusted inert content in the browser and terminal.
- Coordinate end-to-end validation, documentation, demo preparation, and understanding of all critical system parts.

The suggested web ownership (Shane: application shell, loading/import/export, job and report state; Malhar: investigation views, diffs, explanations, and evidence panels) is only a coordination aid, not a fixed assignment.

## Proposed interface sketch

This is a discussion aid, not a finalized API or schema. Freeze actual field definitions only after the relevant decisions are approved and both contributors agree.

```ts
type ArtifactInput = {
  ecosystem: "npm" | "pypi" | "local";
  packageName?: string;
  version?: string;
  artifactPath?: string;
  sourceOverride?: {
    repo: string;
    commit: string; // full immutable commit
    subdirectory?: string;
  };
};

// Shane's proposed boundary
async function collectEvidence(input: ArtifactInput): Promise<EvidenceBundle>;

// Malhar's proposed boundary
async function analyzeEvidence(evidence: EvidenceBundle): Promise<AnalysisResults>;

// Shared orchestration boundary
async function investigate(input: ArtifactInput): Promise<InvestigationReport>;
```

The report should keep artifact identity, source identity, provenance, file differences, security-relevant observations, build evidence, interpretations, and analysis limitations distinct. A sketch is not proof that any of these types or functions currently exists.

## Suggested repository shape

The structure below is a planning sketch only. The repository currently has no product implementation; do not scaffold it as a side effect of maintaining this note.

```text
apps/web/                 # shared browser application, if approved
packages/contracts/       # shared report and evidence contracts
packages/core/             # acquisition, source resolution, provenance,
                           # inventory, comparison, monitoring
packages/intelligence/     # heuristics, retrieval, inference, validation
packages/cli/              # local scriptable interface
tests/fixtures/            # labeled harmless evidence fixtures
tests/integration/
examples/                  # only real generated outputs once implemented
.github/workflows/         # CI, after project setup is authorized
```

## Integration milestones

Milestones are proposed gates, not commitments that work is approved or complete.

| Milestone | Shane's candidate deliverable | Malhar's candidate deliverable | Gate |
|---|---|---|---|
| M0 — Contracts | Input/engine boundary proposal | Evidence and interpretation schema proposal | Both agree on typed inputs and outputs; record required approvals |
| M1 — Real evidence | Exact artifact/source retrieval and raw differences | Evidence-linked deterministic findings | One permitted real investigation produces a reviewable report with honest coverage |
| M2 — Intelligence | CLI renders report and evidence | Live open-model retrieval and explanation, if approved | Same deterministic findings; grounded explanations can abstain |
| M3 — Build awareness | Integration for approved rebuild evidence | Scoped transformation classification | Generated files are investigated, never ignored by path alone; execution stays contained |
| M4 — Monitoring | Durable selected-release monitor | Analysis triggered for newly observed artifacts | New artifact is analyzed once; failure/restart recovery does not lose work |
| M5 — Web | Shared application integration | Shared application integration | Browser and CLI expose the same report and evidence references |
| M6 — Validation | CLI, packaging, and reliability checks | AI quality and adversarial checks | Reproducible end-to-end demonstration with actual outputs and stated limitations |

Web design may use clearly labeled schema fixtures while earlier milestones proceed. Fixture data must never be presented as a real completed investigation.

## Acceptance scenarios to develop into tests

These describe desired behavior; they are not claims that tests or capabilities exist today.

1. **Legitimate build transformation:** a package contains generated JavaScript absent from raw source layout. Show the output and available build evidence without calling byte differences malicious by themselves.
2. **Local tampering fixture:** a clearly labeled local copy contains an inert, reserved test marker or a synthetic script change. Identify the exact change, retain it as evidence, and avoid claiming malicious intent. Keep mutation labels/oracles outside analyzer inputs; never upload fixtures to a registry.
3. **Incomplete or conflicting evidence:** missing provenance, multiple plausible source revisions, or unsupported build steps remain unresolved in the report.
4. **Model robustness:** fabricated references and prompt-injection text do not alter deterministic facts; invalid citations are rejected; uncertainty is shown; inference failure leaves the deterministic report usable.
5. **Release monitoring:** a controlled registry replay introduces an artifact. The monitor discovers it once, starts analysis, persists state, and recovers after restart without duplicate accounting.

For rebuild-related tests, first establish and validate the approved isolated worker. Do not execute analyzed packages, lifecycle hooks, or build instructions on a developer host. Keep real releases, controlled benign builds, synthetic local tampering, and failure cases clearly separated.

## Working rules and delivery constraints

- This plan does not authorize scaffolding, dependency/model installation, hosting, licensing, or unrelated engineering. Follow current approvals in `AGENTS.md` and the [founder decision register](../Heurisko_Research/HEURISKO_FOUNDER_DECISIONS.md).
- Keep public-data and licensing obligations in view. No project license has been selected yet.
- Preserve the declaration-only initial commit. All subsequent changes must go through a feature branch and pull request with passing CI; do not commit or push without explicit user approval covering the reviewed change set.
- Required PR sections are `What this PR does`, `Models the product uses in this PR`, `AI coding assistants that helped write it`, and `How we tested it`. State actual models/assistants and actual checks; never claim a proposed test passed.
- Event requirements also include an MIT or Apache-2.0 license, tested README instructions once runnable, PR template, CI workflow, real generated examples, meaningful open-model work, and both members understanding the implementation. These remain outstanding until completed and approved in scope.
- Event times use Asia/Kolkata: repository link and initial commit deadline was 31 Oct 2026, 20:30; final merge/push and submission deadline is 1 Nov 2026, 06:30. Deadlines do not authorize publication or Git actions.

## Responsibility summary

| Contributor | Primary accountability |
|---|---|
| Shane | Correct artifact inputs, source identity evidence, hashes, raw differences, CLI, monitoring, and infrastructure reliability |
| Malhar | Evidence-linked heuristics, build-aware analysis, retrieval, open-model inference if approved, citation validation, and explanation quality |
| Both | Contracts, integration, browser experience, validation, documentation, and demonstration |

Guiding principle: Shane establishes what bytes and evidence were observed. Malhar helps explain what that evidence supports. Together, they give developers a clear way to inspect the findings and their limits.
