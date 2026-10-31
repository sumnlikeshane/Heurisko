# Heurisko contributor and agent instructions

This file applies to the entire repository. Read it before doing work and keep it current when approved decisions, implemented behavior, validation commands, or operational context change. It is the durable entry point for agents; detailed research stays in the linked documents.

## User authorization and Git rules

**The user explicitly instructed: “do not commit push without my approval.”**

- Do not create a commit or push any branch, tag, or other ref without explicit user approval covering that action and the concrete change set. This applies to Git CLI, APIs, GUI tools, scripts, hooks, and automated agents.
- Commit approval does not imply push approval. If the user explicitly approves both for the reviewed changes, honor that scope without asking again. If the change set materially changes after review, present the new scope before using the earlier approval.
- Full repository access, a request to edit files, an event deadline, a passing test, a roadmap, and a research recommendation are not permission to commit or push.
- Prepare authorized changes and run appropriate validation before asking for commit/push approval. Make the result reviewable: summarize files, behavior, checks, limitations, intended branch, and any proposed commit message. Stop at the approval boundary, not at an unfinished draft.
- Read-only inspection, local edits within the requested scope, and appropriate local validation can proceed without repeated permission requests. Do not create extra approval gates for routine reversible work already authorized.
- Do not merge a PR, publish a release/report/site/package, submit to OrganizerHQ, or send external messages unless the user authorizes that action. Keep proposed PR text local until its publication is authorized.
- Never force-push, rewrite existing history, discard someone else's changes, or remove untracked files as a cleanup shortcut. Do not use destructive Git commands to make the working tree appear clean.
- Inspect `git status --short --branch` and relevant diffs before editing and before proposing a commit. Preserve unrelated user changes. Never stage unrelated files or run a blanket add merely because files are present.

The organizer separately requires **all changes after the initial declaration commit to go through PRs with passing CI**. Do not commit or push directly to `main`. Use a feature branch for approved commits, then an approved branch push and PR workflow. Approval to commit does not waive the PR rule. If a later user instruction conflicts with an event rule, explain the effect on hackathon compliance before presenting the work as compliant.

## Current repository baseline

Baseline recorded on **31 October 2026**, using **Asia/Kolkata** for event times:

- Project: **Heurisko**, team **InBuildingPhase**, members **Shane Joseph** and **Malhar Mahanor**.
- Entry: **Problem 04 — Published Package vs Source Code Integrity Analyzer**, Hacktoberfest 2026 Hack Day Sonipat, Newton School of Technology at Rishihood University.
- The repository exists. Its initial commit, `6e6159bbbb5fc6c8acc21b9a61c9a53df8f8157d`, contains only `HACKATHON.md`. Do not initialize a replacement repository or amend/recreate that commit.
- At the start of the 31 October handoff migration, the branch was `docs/share-research-with-team` tracking its remote; the handoff folder and the two top-level `docs/` decision/checklist files were untracked user material. Recheck live Git state for every task, preserving unrelated work.
- Available material includes the declaration, governing sources, preserved research/evidence snapshot, [approved decision register](docs/Approved%20Decision%20Register.md), [team development checklist](docs/Team%20Development%20Checklist.md), approved phase records/agreement, and the parked G0 candidate. See [docs/README.md](docs/README.md) for the current map.
- Malhar's M0–M2 intelligence implementation is in `packages/intelligence`: evidence-linked deterministic manifest/entrypoint and startup-hook findings; bounded lexical retrieval with an explicit vocabulary bridge; strict interpretation and citation-reference checks; untrusted-data prompt packaging; and an opt-in OpenRouter adapter for pinned `qwen/qwen3-coder-next`. A public setuptools 60.0.0 case validates wheel/source archive digests and excerpt hashes, detects a wheel-only `.pth` startup hook without executing it, and checks top-five retrieval against manually labeled evidence. It does not cover a real npm lifecycle-manifest delta. The adapter does not verify content references or automatically prove citation entailment. It is not integrated with a CLI/TUI or full product investigation workflow. There is still no artifact acquisition, CLI/TUI, browser application, or monitoring.
- Malhar's M0–M2 feature work is on `codex/malhar-rag-evaluation`, pending PR review/CI. The v12 live two-query public setuptools run retrieved all oracle-labeled relevant evidence at k=5 (Recall@5 1.00, Precision@5 0.80, MRR@5 0.75), accepted the scoped behavior answer with 4/4 retrieved citation IDs, and rejected the non-abstaining provenance answer (safe-gate accuracy 1.00; raw abstention accuracy 0.50). Internal claim/evidence review supports the behavior claims but flags the “SLSA Level 3+” suggested action as too specific to treat as policy; Shane's independent cross-review remains due. A v13 prompt-only iteration rejected both responses; prompt v6 and v12 remain the reference. Hosted P04 demo use remains subject to organizer confirmation.
- A later 31 October read-only audit found gaps in the parked G0 candidate's integrity/provenance success conditions, source-context report IDs, and omitted-file accounting. The revised contract passed local full JSON Schema/semantic checks with pinned `jsonschema==4.26.0`, a pinned TypeScript 5.8.3 typecheck, and stubbed handshakes. PR [#2](https://github.com/sumnlikeshane/Heurisko/pull/2) passed both contract and documentation CI jobs on commit `0e6adb9`, then merged to `main` in `f06ac54`. Shane delegated contract acceptance to Codex as recorded in E09; no independent Malhar review is claimed.
- The feature branch includes the RAG evaluation code, synthetic seed, curated MIT-licensed setuptools 60.0.0 case, and v12/v13 TypeScript adapter outputs. Other research downloads and historical model runs remain local-only pending publication review. Malhar selected pinned OpenRouter `qwen/qwen3-coder-next` as the sole answer model; no alternate-model fallback exists. Distinguish the historical Python-harness results from the TypeScript product-adapter run in `experiments/rag/README.md`. The v12 adapter probe has Recall@5 1.00, Precision@5 0.80, MRR@5 0.75, and citation-ID validity 1.00 over four citations; the behavior answer was accepted and the provenance answer rejected. Shane's independent review remains due, and a real npm lifecycle-manifest evidence case depends on Shane's pinned fixture. Organizer confirmation is required before P04 demo use. The adapter is not wired to end-user product flows.
- Original research hypotheses **FH-01/FH-02** and decisions **D-01–D-13** remain a historical proposal record. The later Phase 01–06 decisions and Shane–Malhar A01–A14 agreement are approved planning directions. Approval is not implementation, G0 sign-off, model/dependency selection, hosting, or permission to commit/push. The later delegated Apache-2.0 license choice is recorded below.
- Original governing/research files are preserved. During documentation preparation, all 15 entries in the supplied `SHA256SUMS.txt` verified successfully. That check is research-file integrity, not product validation.

This is a dated baseline, not a substitute for inspecting the current tree. Some research prose says “before a repository is created” because it predates this checkout. Preserve the historical research without treating that wording as an instruction to create another repository.

## Sources, authority, and reading order

Current user instructions define task scope and authorization. Organizer documents define hackathon obligations. Approved scoped decisions define implementation commitments; research recommendations alone do not. `README.md` is the public overview; this file defines contributor behavior and carries durable working context. Observed code and executed validation establish what actually works.

Start with [docs/README.md](docs/README.md), the [approved decision register](docs/Approved%20Decision%20Register.md), the [team development checklist](docs/Team%20Development%20Checklist.md), [HACKATHON.md](HACKATHON.md), the [executive brief](docs/Heurisko_Research/HEURISKO_EXECUTIVE_BRIEF.md), the [founder decision register](docs/Heurisko_Research/HEURISKO_FOUNDER_DECISIONS.md), and the [organizer requirement map](docs/Heurisko_Research/_evidence/official-requirements.md). Read the complete relevant source before changing a contract or making a consequential claim.

| Source | Authority or purpose |
|---|---|
| [Official Problem Statements and Development Guidelines](docs/Governing/Hacktoberfest%202026%20%281%29.docx) | P04 scope; repository, PR, CI, model, licensing, data, and ownership rules. Relevant sections: Problem 04 and §§4–6. |
| [Hack Day Sonipat presentation](docs/Governing/Hacktoberfest%20HackDay%20Sonipat.pdf) | Event format/deadlines; model rules p12; CI/examples p13; PRs p14; presentation p18; scoring defect p19; submission pp20–21; P04 example p28. Page references are one-based. |
| [Research baseline](docs/Heurisko_Research/HEURISKO_RESEARCH_BASELINE.md) | Packaging, provenance semantics, source identity, incidents, and threat context. |
| [Product definition](docs/Heurisko_Research/HEURISKO_PRODUCT_DEFINITION.md) | Personas, scope, workflows, commands, interfaces, AI role, and language/TUI alternatives. |
| [Technical architecture](docs/Heurisko_Research/HEURISKO_TECHNICAL_ARCHITECTURE.md) | Shared engine, data flow, report contracts, state/cache, monitoring, trust and execution boundaries. |
| [Tooling and reuse](docs/Heurisko_Research/HEURISKO_TOOLING_AND_REUSE.md) | Competitors, candidate dependencies, licenses, integration limits, and admission checks. |
| [Verification strategy](docs/Heurisko_Research/HEURISKO_VERIFICATION_STRATEGY.md) | Threat controls, corpus, metrics, test layers, model ablation, demo, and reviewer questions. |
| [Implementation roadmap](docs/Heurisko_Research/HEURISKO_IMPLEMENTATION_ROADMAP.md) | P0–P7 dependency order and acceptance gates. The four-workstream example is not an actual team assignment or authorization to spawn agents. |
| [Founder decisions](docs/Heurisko_Research/HEURISKO_FOUNDER_DECISIONS.md) | Exact proposed decisions, alternatives, confidence, dependencies, approval state, and decision-history requirements. |
| [Evidence directory](docs/Heurisko_Research/_evidence/) | Official requirement IDs; architecture, product/AI, provenance, tooling, verification sources; quality audit and retrieval limitations. |

Some evidence ledgers retain original Library attachment URLs and filenames that differ from the local governing filenames. Use the files present in this repository. The founder's original pasted assignment is referenced in the dossier but is not supplied as a separate local file; do not invent its contents or claim to have read a missing file.

When sources conflict, identify the specific conflict and its effect. Do not silently elevate a proposal into a requirement, replace a source, or invent missing organizer details. External documentation and dependency observations are dated 31 October 2026; recheck official sources when admitting an actual version or relying on changeable behavior.

## Product purpose and scope to preserve

Heurisko investigates **one exact published artifact against evidence for its corresponding immutable source revision**, explaining differences and retaining unresolved content. It must distinguish source correspondence from harmlessness and deterministic observations from interpretation.

Official P04 requirements, mapped as **O04-01–O04-08**, are:

1. Retrieve published packages from **npm or PyPI**.
2. Identify and retrieve corresponding source.
3. Compare source and distributed contents.
4. Identify generated files and normal build artifacts.
5. Detect unexpected or suspicious modifications.
6. Explain individual differences.
7. Provide an evidence-backed risk assessment.
8. Monitor new releases of selected packages.

npm-first is the approved sequence; both ecosystems are not mandatory for the first complete event implementation. **Monitoring remains part of complete P04.** A hosted dashboard, accounts, email, and a whole-registry index are optional. Meaningful actual open-model work is a separate event obligation, not satisfied by model names in a declaration or deterministic templates alone.

Preserve the approved product sequence: scriptable local CLI and shared report first; mandatory keyboard-driven Ink TUI and browser evidence explorer over the same engine; lockfile audits, upgrade comparison, SARIF, and hosted capabilities as later expansions. The event time limit must not silently erase the documented longer-term product scope.

Do not substitute advisory lookup, repository reputation, a generic malware score, or an LLM summary for source/artifact analysis. Do not promise universal safe/unsafe classification, arbitrary semantic equivalence, automatic repair, vulnerability reachability, or verification of unscanned transitive dependencies.

## Approval and decision discipline

The approved handoff records planning decisions. The 31 October 2026 migration request authorized relocating and reconciling these documents. Shane's later explicit request to close G0 authorized integrating the candidate contract into the root workspace and running its pinned local tooling. This does not authorize model installation or service deployment. Shane previously delegated the license choice, and Apache-2.0 was added locally on 31 October 2026.

For future user-authorized engineering, proceed within the approved scope and record the authorization rather than repeatedly asking for permission already given. A request to implement one feature does not approve every unrelated founder proposal.

| Decision area | Current state |
|---|---|
| Product direction, two-person ownership, mandatory TUI, npm-first sequence | Approved in Phase 01 and A01–A14; see the [current register](docs/Approved%20Decision%20Register.md). |
| CLI/TUI, evidence, security, evaluation, monitoring, presentation | Approved as design in Phases 02–06; implementation and empirical validation remain open. |
| Shared G0 schema/types/fixtures | Integrated in [packages/contracts](packages/contracts/package.json); PR #2 merged in `f06ac54`. Shane's delegated team acceptance after Codex review is recorded in agreement E09. |
| Malhar's intelligence | M0 boundary and M1/M2 implementation are present; narrow real setuptools coverage and the v12 live OpenRouter probe are exercised. Shane's independent cross-review and a pinned real npm fixture remain due. Broader real-data coverage, content-reference byte verification, semantic entailment enforcement, and CLI/TUI integration remain open. |
| Exit behavior | Initial mapping 0/1/2/3 approved in A05; multi-condition precedence and exact policy configuration remain open. |
| Concrete dependencies, verifier policy, resource caps, rebuild worker, product model/runtime integration, watch schedule, retention, hosting | Require implementation decisions and validation within the approved boundaries. The RAG experiment has one selected answer model: pinned `qwen/qwen3-coder-next` via OpenRouter, pending organizer confirmation for P04 demo use. This does not establish product integration. |
| Project license | Apache-2.0 selected on 31 October 2026 under Shane’s delegated choice; local `LICENSE` and `NOTICE` added, commit/PR pending. |

Record any change to an approved product or trust rule as an amendment in the [approved decision register](docs/Approved%20Decision%20Register.md), with date, scope, rationale and affected documents. Preserve the [original founder register](docs/Heurisko_Research/HEURISKO_FOUNDER_DECISIONS.md) as research history. Routine implementation details within an approved rule need an engineering decision record and tests, not a false claim that the original proposal was still unapproved.

## Architecture and evidence invariants

The approved direction is one TypeScript/Node pnpm workspace engine and CLI, mandatory React/Ink TUI, React/TypeScript viewer, and shared JSON Schema/report contracts. SQLite metadata and content-addressed evidence are design directions. The G0 schema/types are in the product workspace, reviewed under Shane's later delegated acceptance instruction, and PR #2 merged in `f06ac54`. Exact product runtime support, hosting, and performance targets remain untested/open; Go/Bubble Tea remains a historical research alternative.

Once implementation is authorized, preserve these evidence boundaries unless an explicitly reviewed decision changes them:

- Bind analysis to ecosystem/name/version/origin, exact distribution filename, observed and expected digests, and capture time. PyPI wheels are distinct subjects, including later uploads on an existing version.
- Mark modified/local archives as `local-input`; never carry the registry original's provenance success onto changed bytes.
- Pin source to a full immutable commit plus package subdirectory/build context. Retain competing candidates and conflicts. Tags, repository URLs, `gitHead`, version strings, file similarity, and source maps alone are not proof. Never silently use the current default branch as the authoritative release baseline.
- Keep raw archive and extracted-content evidence before normalization. Every transform needs an identity/version, declared scope, and preserved residuals. Do not strip behavior-bearing literals, lifecycle commands, dynamic code, or executable regions to force a match.
- Treat source maps and AST similarity as scoped correspondence evidence, not general semantic-equivalence proof. Package names, `dist/`, `.min.js`, and generated-looking paths cannot serve as blanket exceptions.
- Verify provenance against the exact subject digest, expected identity/issuer, predicate, trust root, and source/builder policy. JSON decoding, an API response, a badge, or disabled verification is not successful verification.
- A publish-only assertion is not full build provenance. Cryptographic validity and `policyAccepted` are separate. Rebuild success is neither proof of benign source nor automatically independent evidence.
- Retain every excluded/unsupported file, parser error, truncated region, timeout, skipped stage, and failed acquisition in coverage. Missing evidence is not a clean result.
- Keep one engine and one immutable report contract across CLI, browser, TUI, CI, and monitor. Viewers render facts; they do not recompute independent verdicts.
- Record schema, engine, rule, normalizer, verifier, policy/trust-root, and toolchain versions. Deterministic report equivalence excludes volatile timestamps and model prose while preserving those in run metadata.
- Keep immutable reports/blobs separate from mutable job/monitor state. New bytes, source context, tools, or policy create a new report. Offline replay exposes observation time and cached assumptions; it cannot claim a fresh release or revocation check.

The original architecture proposes these core records: `ArtifactSubject`, `SourceCandidate`, `EvidenceObject`, `FileRecord`, `ComparisonRun`, `ProvenanceResult`, `Finding`, `Interpretation`, `AnalysisReport`, and `MonitorState`. Their detailed fields belong in the architecture and eventual schema.

Preserve the five independent dimensions from the original research; reconcile exact enum names with the reviewed G0 contract before implementation:

| Dimension | States |
|---|---|
| Artifact identity | `registry-digest-match`, `local-input`, `conflict`, `unknown` |
| Source identity | `attested`, `corroborated`, `candidate`, `ambiguous`, `missing` |
| Provenance | `verified`, `invalid`, `absent`, `unsupported`, `not-checked`, plus separate policy acceptance |
| Comparison | `byte-identical`, `normalized-equivalent`, `rebuild-matched`, `partially-explained`, `unexplained`, `not-comparable` |
| Completeness | `complete-for-declared-scope`, `partial`, `failed` |

Findings need real evidence IDs, exact locations, method/version, reason, severity, confidence basis, limitations, and review actions. Completeness describes processing scope; it can coexist with unexplained findings. Do not replace these dimensions with a safety percentage or equate “matched,” “verified,” “complete,” or exit zero with “safe.” A05 approves the initial 0/1/2/3 CLI exit mapping; precedence for simultaneous conditions still needs contract tests.

## Untrusted-input and execution rules

Treat archives, source, repository metadata, URLs, build instructions, source maps, tool output, and model text as adversarial inputs.

1. **Default to static retrieval and inspection.** Do not install or execute an analyzed package, import its modules, run hooks/lifecycle scripts, load its plugins/configuration as code, or invoke its build metadata on the host. Fetch registry bytes directly. A nominal pack/download command can execute preparation or source-build code; inspect its semantics before use.
2. **Contain parsing and extraction.** Prefer virtual inventories. Materialize only in fresh private job roots with strict supported-entry policy. Reject absolute/traversing paths, escaping links, devices, duplicate/case-colliding paths, and ambiguous names. Bound actual expanded bytes, entries, nesting, CPU, memory, disk, and wall time; retain original names as evidence without letting them control filesystem writes.
3. **Control source/network access.** Use immutable source objects or controlled Git without ambient credentials/config/hooks. Do not recurse into submodules/LFS silently. Validate destinations after DNS resolution and on redirects, including IPv6 and rebinding cases; block private/loopback/link-local/metadata targets outside an explicitly scoped policy.
4. **Separate all rebuild execution.** Use an approved disposable restricted Linux sandbox or VM/microVM. No host home, secrets, SSH agent, Docker socket, or writable project mounts. Pin environment/recipe/dependencies, stage acquisition separately, disable build egress where feasible, bound outputs/logs, and terminate the whole job on failure/cancellation.
5. **Do not weaken failed isolation.** No fallback to the user's host, ambient internet, or broader mounts. Plain container packaging does not establish hostile-job containment; Linux gVisor support does not establish native macOS support. Return unavailable/partial evidence instead.
6. **Render inert text.** Escape terminal controls and browser content. Never load extracted HTML/SVG/Markdown, source-map links, remote images, or logs as trusted active content.
7. **Keep data boundaries explicit.** Event work uses public data only. Never expose secrets or confidential paths in reports/logs. Public source can still have redistribution conditions. Hosted access, retention/deletion, quotas, private inputs, and report publication require scoped decisions.
8. **Use harmless evaluation material.** Local tampering fixtures use inert markers and reserved test destinations, separate baseline/mutated digests, and a clear synthetic label. Never upload them to a registry or accuse a real maintainer based on a synthetic mutation. Never publish automated issues/comments on real OSS projects.

## Product AI and development-assistant disclosure

`HACKATHON.md` and prior research retain earlier model proposals as history. The current user-selected RAG experiment model is pinned `qwen/qwen3-coder-next` through OpenRouter, as the sole answer model; the BM25 retrieval, strict answer schema, and oracle evaluator remain in place. Organizer confirmation is required before any hosted P04 demo use. Earlier local runs remain historical results, not active model options. This experiment choice is not integrated into product inference.

- Product inference must use a genuine open-source/open-weight model doing meaningful explanatory work. P04 permits local inference or a confirmed organizer open-model server. The project direction excludes closed cloud inference and silent closed-model fallbacks.
- Do not import P08's Gemma-only/laptop-only rules into P04. Do not assume an organizer model list, API, hardware, or model availability not supplied in the governing documents.
- Give the interpreter bounded evidence and no tools, credentials, network, build authority, or filesystem writes. Metadata/comments can contain prompt injection. Model output must not trigger commands, fetching, builds, severity escalation, publication, or changes to deterministic status.
- Require structured explanations with evidence IDs, hypotheses, alternatives, missing evidence, and abstention. Validate IDs, paths, ranges, quotes, output shape, and actual support for the claim. Schema validity and real citations alone do not prove factual correctness.
- Keep interpretations separate from hashes, source selection, provenance, comparison, and coverage. Record exact model/weight digest, quantization, runtime, prompt/schema version, decoding settings, selected evidence, omissions, and outcome.
- On inference failure or rejection, preserve the deterministic report and show the AI limit. A saved interpretation or mocked model test is not live inference and does not satisfy meaningful-model demonstration by itself.
- Never list an aspirational model as used. Update current model declarations through authorized changes when integration is actually established; preserve the original commit.
- Disclose product models separately from coding assistants. **Codex** assisted writing. The product-adapter experiment actually called OpenRouter `qwen/qwen3-coder-next` on public setuptools evidence; v12 accepted the scoped behavior explanation and rejected the provenance draft, while v13 rejected both. Do not guess an unavailable underlying assistant model identifier. Include both the coding assistant and actual product-model outcome in any PR disclosure.

## Monitoring, CLI, and interface rules

The monitor must invoke the shared engine, persist exact artifact observations and pending jobs, and use idempotent artifact-plus-configuration job keys. Discovery checkpoint advancement must not lose failed or queued analyses. Support restart/retry accounting; retain older unprocessed artifacts when newer ones arrive. New wheel uploads on existing versions, yanks/removals, and digest conflicts are distinct events.

Expose last successful fetch, last completed analysis, pending/failure state, and freshness. Respect validators, throttling, retry hints, and resource limits. A stopped local process is not continuous monitoring. Hosted accounts and notification channels are separate capabilities, not conditions for the basic monitor.

Approved Phase 02 calls for `heurisko` to open the TUI by default and a scriptable `analyze` path, with `inspect`, `tui`, and `watch add/run/status/remove` in the initial command direction. The original research also proposed `compare`, `project --lockfile`, `report export`, and `serve --local` as later expansions; no command exists yet. Use the approved initial 0/1/2/3 meanings, then test/freeze precedence and exact syntax in the contract. Keep one JSON result on stdout, diagnostics/progress on stderr, and no interactive terminal requirement for CI. Support no-color/redirected and accessible linear output.

Browser/TUI views use the same report/evidence IDs and status meanings. A privileged loopback API requires a per-session token and origin checks. Keep raw differences, transformation strength, model hypotheses, skipped scope, cache state, and capture time visible. Core local analysis and exported-report viewing should remain account-free. A version-only PyPI input must not imply every distribution was checked.

## Dependencies, reuse, and license

Integrate established verification and parsing rather than inventing cryptography or a universal deobfuscator. OSS Rebuild, reproduce, diffoscope, Sigstore, pypi-attestations, and Drydock are substantial existing work; novelty claims need comparison. Optional advisory, behavioral, or hygiene tools must retain their own namespaces and limits.

Before admitting an actual dependency/model/tool, record the selected released version and digest, runtime/platform requirements, API stability, current security information, license/NOTICE and transitive obligations, resource behavior, and meaningful fixture results. Repository HEAD observations are not proof of released-package compatibility. Avoid unbounded “latest” installation or installing packages merely to describe them.

Shane delegated the project license choice on 31 October 2026; **Apache-2.0** was selected for original Heurisko material. The root [LICENSE](LICENSE) contains the official full text and [NOTICE](NOTICE) identifies project attribution and third-party scope. The organizer-supplied governing files and external tools, services, model weights, source excerpts, and third-party fixture assets retain their own rights; a subprocess boundary does not itself settle redistribution rights. Do not assume the local license files have been committed or published.

## Validation and truthful completion

There is not yet an end-user analyzer. The root workspace typechecks the shared contract and intelligence package; `pnpm run test:contracts` validates contract fixtures and adapter outputs, including synthetic M1/M2 cases plus the public setuptools evidence and retrieval probe, against shared schemas using the pinned Python `jsonschema` dependency. The local `source .venv/bin/activate && pnpm run test:intelligence` command passed on 1 November 2026 before the latest query/prompt documentation edits. A live OpenRouter run v12 accepted the scoped behavior explanation and rejected the provenance draft; v13 rejected both. These narrow experimental results do not establish broad real-package accuracy, byte verification by the intelligence package, prompt-injection resistance, semantic citation entailment, or validate Shane's acquisition. The [CI workflow](.github/workflows/ci.yml) runs package checks, research checksums and local Markdown links; PR #2 CI passed on `0e6adb9` before its merge as `f06ac54`. Local setup commands remain `pnpm install --frozen-lockfile --ignore-scripts`, `python3 -m pip install -r requirements-contracts.txt` in an isolated Python environment, `pnpm run typecheck`, and `source .venv/bin/activate && pnpm run test:contracts`. Inspect the repository before running package-manager commands; do not fabricate a green product result or quickstart.

For documentation work, check relative links and anchors, Markdown structure, source fidelity, proposal/implementation distinctions, and that only intended files changed. Verify the preserved research snapshot when relevant:

```sh
(cd docs/Heurisko_Research && shasum -a 256 -c SHA256SUMS.txt)
```

`SHA256SUMS.txt` covers the eight research documents and seven supporting evidence/audit files, not the governing files or root docs. Preserve originals during unrelated work. If research is intentionally revised, obtain task authorization, record the change, and update affected checksum entries deliberately; never regenerate checksums to conceal unexplained source changes.

When engineering exists, add the **actual tested setup/build/lint/typecheck/test/model/demo commands** here and in the README. Run checks appropriate to the changed behavior. Use meaningful tests for invariants and failure cases rather than tests that merely mirror implementation. Distinguish checks executed locally, unavailable checks, live compatibility checks, and remote CI status.

Required validation families before corresponding capability claims include:

- Known-answer hashes/inventories, immutable raw evidence, manifest changes, exact ranges, and normalization that preserves executable additions.
- Source conflicts, wrong tag/subtree, publish-only predicates, exact-subject mismatch, unexpected signer/builder, absent/invalid/unsupported provenance, and policy rejection.
- Archive traversal/link/collision/decompression attacks; parser/resource limits; inert terminal/browser rendering; SSRF and cancellation.
- Real artifact-to-source integration, exported-report replay, shared CLI/web status conformance, and offline freshness semantics.
- Rebuild containment, blocked egress/host access, bounded exports, whole-job cleanup, and declared recipe reproduction before any hostile build tests.
- Actual open-model inference plus injection, hallucinated references, timeout/OOM/unavailability, abstention, and held-out model-off comparison.
- Monitoring discovery, late artifacts, duplicates, failure/retry, throttling, stale/stopped state, and restart recovery without lost work.
- Public licensed examples with representative inputs and **actual generated outputs** from the implementation being submitted.

Keep real releases, controlled benign builds, local tampering, and uncertainty/failure cases separate. Pin artifact/source identities and keep mutation labels/oracles outside analyzer inputs. Report denominators, false positives/negatives, coverage, skipped/abstained cases, explanation entailment, runtime/resources, and monitoring success separately from outcome accounting. No accuracy, latency, memory, cost, or quality threshold has been measured or approved.

Never claim a proposed test passed, a candidate package was analyzed, a historical attack was detected, or a sandbox/model works based on research alone. Completion of a milestone does not establish complete P04 if monitoring, meaningful model work, or required repository evidence is absent.

## Hackathon delivery requirements

Required repository artifacts are an MIT/Apache-2.0 `LICENSE`, `HACKATHON.md`, `README.md` with tested setup/run instructions once runnable, `.github/pull_request_template.md`, `.github/workflows/ci.yml`, and `examples/` with real inputs/outputs. The PR template, contract-and-documentation CI workflow, and local Apache-2.0 license files now exist. Runnable analyzer instructions and real generated examples remain outstanding; CI must grow into analyzer validation when implementation exists. Other outstanding items are not authorization to create them in every task.

The initial commit must stay declaration-only. All later work goes through PRs. Every PR must use the organizer's four sections:

```markdown
## What this PR does

## Models the product uses in this PR

## AI coding assistants that helped write it

## How we tested it
```

Name actual product models or `none`, actual coding assistants or `none`, concrete changes, and checks/results. Documentation-only work here uses no product model and was assisted by Codex. CI must install the project/dependencies, execute relevant tests, validate on every PR, and pass on the final submitted commit. Do not bypass CI, invent successful checks, or add fabricated examples.

Event-local deadlines, **Asia/Kolkata** (inferred from Sonipat venue):

| Milestone | Time |
|---|---|
| Start | 31 October 2026, 18:30 |
| Repository link and initial commit | 31 October 2026, 20:30 |
| Last merge/push, repository freeze, OrganizerHQ submission | 1 November 2026, 06:30 |
| Presentations begin | 1 November 2026, 08:30 |

P04 selects **Best Open-Source AI Project**. OrganizerHQ has one submission per team with teammates added afterwards. Presentation is eight minutes, four-minute Q&A, two-minute buffer; all members must understand all parts of the implementation. Do not submit or push because a deadline is approaching without user approval.

The main scoring slide p19 visibly contains literal `00` placeholders. Other slides mention individual numerical values, but the complete rubric is unavailable. Do not invent missing weights or an automated/panel split. Organizer hidden-test interface/packages, model-server list/API, supported test platforms, and exact monitoring evaluation remain unresolved.

## Keeping context useful across tasks

At the start of a task, read this file, inspect current status/diffs, identify applicable source documents, and determine which existing approvals cover the requested work. Preserve user changes and use the smallest coherent change set. Do not create unrelated scaffolding or spin up sub-agents solely because the research suggests four contributor workstreams; follow the active user and environment delegation instructions.

When meaningful project facts change, update this file's baseline/current guidance and the affected README sections in the same authorized change. Keep detailed decisions in the founder register and technical contracts in their owning documents; link to them here. Record approved scope, implemented entry points, exact validated commands, model/tool versions, important failure modes, and unresolved decisions. Do not store secrets, private payloads, machine-specific temporary output, or a transcript of every shell command.

Before handing work back, inspect the final diff and Git status, report what changed and how it was checked, identify material limitations, and state whether commit/push actions occurred. Keep changes uncommitted and unpushed until the user explicitly approves those actions. This file documents that behavior; enforcement also depends on agents following it and any separately configured repository protections.
