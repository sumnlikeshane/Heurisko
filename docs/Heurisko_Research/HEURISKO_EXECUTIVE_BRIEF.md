# Heurisko — Executive Brief

31 October 2026. **Research complete at the documentation/design level. All decisions are PROPOSED — NOT YET APPROVED. No product implementation has begun.**

## What Heurisko should become

Heurisko should be an open-source investigation tool that answers: **“Does this exact published package correspond to its claimed source, and what explains the differences?”** It should give developers an inspectable evidence trail, preserve unresolved differences and identify modifications that deserve security review.

The strongest proposed product combines a local CLI, one shared analysis engine, a browser evidence explorer and selected-release monitoring. An optional TUI can improve terminal investigation after the CLI works. The browser's purpose is to make source relationships, generated files, residual changes and provenance easy to inspect; documentation and installation support adoption. Core analysis and report viewing should not require accounts.

## Why the problem is difficult

Published packages legitimately omit repository files and add transpiled JavaScript, bundles, generated metadata or native binaries. A correct comparison first needs the right immutable source revision, package subdirectory and exact registry artifact. Version names, tags and repository metadata are clues rather than proof.

Provenance authenticates specific assertions under a trust policy. It does not guarantee harmless code or independent build reproduction; PyPI publish attestations differ from full build provenance. A rebuild can reproduce malicious source, while a mismatch can reflect nondeterminism or a different environment. Consequently Heurisko must never equate “different,” “unsigned,” or “unexplained” with “malicious,” or “matched” with “safe.” [npm provenance](https://docs.npmjs.com/generating-provenance-statements/) [PyPI attestations](https://docs.pypi.org/attestations/)

## Proposed system

1. Resolve an exact npm release or PyPI distribution and retain its expected/observed digests.
2. Acquire archives and source without installing the package or executing its scripts.
3. Verify available provenance, resolve candidate source commits and retain ambiguity/conflicts.
4. Compare raw contents first, then narrowly declared packaging/build transformations and structural evidence.
5. Reuse existing rebuild evidence or run explicitly isolated rebuilds when needed; preserve residual differences and failure scope.
6. Ask an open-weight model to explain selected evidence, validate its references and keep its hypotheses separate from deterministic observations.
7. Publish one versioned report consumed by CLI, browser, TUI and CI; monitor selected packages for new artifacts through the same engine.

Reports separate artifact identity, source identity, provenance, comparison results and analysis completeness. Findings have evidence, severity, confidence and limitations. There is no arbitrary safety score.

## Proposed stack and reuse

Prefer TypeScript for the shared Node engine/CLI and React for the evidence viewer, with optional Ink TUI, SQLite/content-addressed local evidence and JSON Schema contracts. Go plus Bubble Tea is the strongest alternative if standalone binary distribution takes priority. Exact released versions, OS support and runtime compatibility remain implementation gates.

Integrate rather than recreate signature/attestation verification, deep binary diffs and rebuild infrastructure. OSS Rebuild already covers substantial npm/PyPI rebuilding; reproduce also targets npm reproducibility, and Drydock offers artifact diffs. Heurisko's proposed contribution is an integrated source/artifact investigation with evidence accounting, explicit source ambiguity and useful residual explanations. That differentiation still needs comparative validation. [OSS Rebuild](https://github.com/google/oss-rebuild) [reproduce](https://github.com/vltpkg/reproduce) [Drydock](https://github.com/JoviDeCroock/drydock)

Benchmark Qwen3-8B and a smaller Qwen alternative through a local runtime or a confirmed organizer open-model server. The actual model, quantization and hardware choice remain conditional on genuine inference, latency and grounded-explanation tests. JSON-constrained generation does not prove factual correctness. Closed model inference is excluded by the founder brief. Product AI and AI coding assistants have separate disclosure requirements.

## Founder hypothesis verdicts

| Hypothesis | Recommendation | Reason |
|---|---|---|
| FH-01 — Terminal-native / Lazygit-inspired | Accept with modification: scriptable local CLI first, optional TUI over the same reports | Clear CI/developer workflow value; a TUI should not create another analyzer or block automation |
| FH-02 — Purposeful web platform | Accept as documentation plus shared-engine evidence investigation | Browser comparisons and report links have value; a mandatory hosted service/account is unnecessary |

Both remain **PROPOSED — NOT YET APPROVED**.

## Strongest demonstration

An eight-minute presentation should show a genuine package's legitimate build difference, a clearly labeled tampered local copy with an added executable change, and a case where missing/conflicting evidence forces an unresolved result. Use the CLI to invoke the real engine and the browser to inspect exact file/evidence locations. Change an input selected by the judges, rerun it, show digests and explain how the result changed. Show actual model input/output and its limits. Demonstrate one persisted release-monitor event. The detailed timing and Q&A are in the verification strategy.

The examples and expected mutations are a proposed evaluation plan. No package was rebuilt, model run, benchmark measured or attack detected during this research.

## Roadmap and gates

The roadmap moves from approved contracts and safe acquisition to source resolution/comparison, build-aware evidence, AI/interfaces, release monitoring, and integrated adversarial validation. Four contributors can split acquisition/source identity, analysis/provenance, developer interfaces/AI, and verification/containment/monitoring after shared contracts are fixed. Each phase has testable acceptance criteria; the complete P04 core includes monitoring and meaningful real open-model work.

Before any product repository is created, approve the architecture/product decisions. The organizer requires a new empty public repository whose first commit contains **only `HACKATHON.md`**; later files, license and code arrive through PRs with passing CI. Public data, actual generated examples, MIT or Apache-2.0 licensing and no automated issues/comments on real projects are official constraints.

## Completion, limitations and approval queue

Completed: complete reading of both organizer documents; standards/registry/incident research; existing-tool and model/interface investigation; proposed product/architecture/contracts; verification, containment, demonstration, roadmap and decision register.

Unmeasured: source-matching accuracy, legitimate-build explanation quality, false positives/negatives, rebuild coverage, AI benefit, hardware feasibility, performance and operating cost. Unconfirmed: exact pinned tool compatibility, hidden test environment, organizer model-server contract and full judging weights. The main scoring slide visibly contains `00` placeholders. Firecrawl reached its account credit limit; remaining material documentation checks used available web retrieval.

The first approval queue is FH-01/FH-02, shared engine/language, npm-first adapter sequence, trust/verdict semantics, model/runtime benchmark plan and sandbox boundary. Next settle integrations, CI outcomes, operating limits/hosting, license and evaluation quality thresholds. These are recorded separately in the decision register. Research stops here; engineering begins only after explicit approval.

## Dossier

- [Research baseline](HEURISKO_RESEARCH_BASELINE.md): domain, standards, incidents and constraints.
- [Product definition](HEURISKO_PRODUCT_DEFINITION.md): personas, workflows, interfaces and model role.
- [Technical architecture](HEURISKO_TECHNICAL_ARCHITECTURE.md): boundaries, data flow, contracts and state.
- [Tooling and reuse](HEURISKO_TOOLING_AND_REUSE.md): competitors, licenses, maintenance and integration ranking.
- [Verification strategy](HEURISKO_VERIFICATION_STRATEGY.md): ground truth, metrics, containment and demo.
- [Implementation roadmap](HEURISKO_IMPLEMENTATION_ROADMAP.md): dependencies, phases, workstreams and gates.
- [Founder decisions](HEURISKO_FOUNDER_DECISIONS.md): hypotheses, alternatives, recommendations and approval state.

Supporting ledgers in `_evidence/` identify primary sources, organizer requirements and final quality review.
