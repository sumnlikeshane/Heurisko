# Heurisko — Hacktoberfest 2026 Hack Day Sonipat

## Team

**Team name:** InBuildingPhase

**Team members:**
- Shane Joseph
- Malhar Mahanor

## Selected Problem Statement

**Problem 04 — Published Package vs Source Code Integrity Analyzer**

Heurisko is an open-source software supply-chain integrity project. Its objective is to compare published software packages (starting with npm, with PyPI as a possible extension) against their associated source repositories, explain legitimate build-related differences, flag suspicious or unexplained modifications, and present evidence-backed findings without overstating certainty.

## AI Models and Justification

### Proposed product model: Qwen2.5-Coder-7B-Instruct

- **Runtime (proposed):** `qwen2.5-coder:7b` through Ollama, running locally; an organizer-provided open-model server may be considered if the model is available there.
- **Why this model:** It is an open-weight, code-specialized model suited to interpreting source-code and package differences. We intend to evaluate it for explaining detected modifications, describing possible implications, and helping developers understand evidence collected by the analysis engine.
- **Intended boundaries:** File comparison, artifact inspection, and provenance checks should produce deterministic evidence. Model output must be grounded in that evidence and must not be treated as proof that a package is safe or malicious.
- **Status:** **Planned / recommended; not integrated or tested as of this initial commit.** Model choice and actual integration will be validated during development and recorded accurately in subsequent pull requests.

**Models currently integrated:** None. This initial commit is the required project-declaration commit; implementation has not begun.

## Project Direction (Subject to Research and Validation)

We are investigating a reusable package-analysis core with a terminal-native CLI/TUI workflow and a complementary web experience for searching packages, exploring reports, and reading documentation. These are proposed directions, not completed features or fixed architectural commitments.

## Transparency

We will document actual model usage, development assistance, implementation decisions, and testing in subsequent pull requests. No security analysis or package verification functionality is claimed as implemented by this initial commit.
