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

## Authorized handoff checkpoint — 1 November 2026

Shane explicitly approved preparing, committing, pushing `handoff/s1-s3-audit-fixes` and opening its draft PR while S4 continues separately. This approval covers the reviewed S1–S3 engine/CLI/tooling, audited repairs, retained public evidence, handoff/supporting documentation and labelled nonvisual reader candidate. It does not authorize merging to main, adopting the visual spike or intelligence/model, deployment, submission or external messages. See [handoff instructions](docs/HANDOFF_S1_S3.md). Older "no commit/push" receipts describe their original sessions, before this publication. Future changes need their own scoped approval; do not treat this checkpoint as blanket permission.

## Current repository baseline

Baseline recorded on **31 October 2026**, using **Asia/Kolkata** for event times:

- Project: **Heurisko**, team **InBuildingPhase**, members **Shane Joseph** and **Malhar Mahanor**.
- Entry: **Problem 04 — Published Package vs Source Code Integrity Analyzer**, Hacktoberfest 2026 Hack Day Sonipat, Newton School of Technology at Rishihood University.
- The repository exists. Its initial commit, `6e6159bbbb5fc6c8acc21b9a61c9a53df8f8157d`, contains only `HACKATHON.md`. Do not initialize a replacement repository or amend/recreate that commit.
- At the start of the 31 October handoff migration, the branch was `docs/share-research-with-team` tracking its remote; the handoff folder and the two top-level `docs/` decision/checklist files were untracked user material. Recheck live Git state for every task, preserving unrelated work.
- Available material includes the declaration, governing sources, preserved research/evidence snapshot, [approved decision register](docs/Approved%20Decision%20Register.md), [team development checklist](docs/Team%20Development%20Checklist.md), approved phase records/agreement, and the parked G0 candidate. See [docs/README.md](docs/README.md) for the current map.
- **S2's local static evidence producer now exists.** Shane authorized Part 2 only after S1. Core collects a local tar/tar.gz archive and an explicit full-commit GitHub source override, stores raw archives/members/inventories/deltas and immutable reports, and exposes real `analyze`/`inspect` CLI paths. [Actual public captures and outputs](examples/s2/current/README.md) retain `picocolors@1.1.1` and an inert local mutation. Both CLI reports deliberately exit 2: analysis is not injected and requested policy is indeterminate. Malhar's supplied M0 and separate M1 patch were reviewed/built/tested in isolated ignored copies, including real model-off handshakes; they are not promoted into the product workspace. S3 below supersedes npm/source resolution status; no provenance verifier, TUI, browser, monitor, model or rebuild exists. Root `LICENSE`/`NOTICE` and the accepted `packages/contracts` remain carried forward. S1/S2 CI is configured, with no new remote pass claimed.
- **Part 3/S3, 1 November 2026:** the same producer now acquires exact public npm versions (including scopes), retains raw metadata/URLs/times/expected and observed digests, checks strict SHA-512/SHA-256 SRI, and preserves registry/manifest/tag/user source candidates plus immutable GitHub commits/subtrees/build context. [S3 corpus and local Malhar handoff](examples/s3/current/README.md) retain genuine releases, honest conflicts, source failures, and a scoped monorepo replacement. No verifier or dependency was newly admitted; advertised attestations remain unverified and provenance `not_checked`. Canonical G0 is unchanged. Current S3 evidence and test receipts are in plan section 12; no new remote CI result is claimed.
- **Historical Part 4 nonvisual checkpoint before audit repairs, 1 November 2026:** Shane authorized isolated integration/contract validation while the separate visual spike owns all rendering and keyboard/focus work. [Readiness report](docs/Part%204%20Integration%20Readiness%20Report.md) maps actual fields, B01–B13 and S01–S09. `integration/part4` adds candidate read-only report/byte-span access and progress/cancel-request forwarding; 24 headless checks pass. Product/core/CLI/contracts and the spike are unchanged. S3 regressions/corpus reverify locally, but an observed late-created, never-started parser orphan after temporary-store removal remains an **open foundation lifecycle blocker**; inspect/remove of that exact stopped job is recorded. No repair or full cleanup guarantee is claimed. S4/G3 remain open; no visual implementation is adopted, no intelligence/model/monitor is started, and the design remains v1.0.0-rc.1, unapproved/unfrozen.
- **Authorized audit repairs, 1 November 2026:** Shane requested fixing the audit issues. Core now requires executable/rule-config module digests in `heurisko-config-v3`, fingerprints schema/validator semantics, emits terminal stage facts and isolates progress observers. The parser uses acknowledged container IDs and retains durable job records/spool/locks after uncertain creation or removal; test teardown preserves real unresolved jobs. Original captures/receipts are immutable historical evidence. [Repair and Malhar handoff](docs/Audit%20Repairs%20and%20Malhar%20Handoff.md) records the exact boundary and remaining intelligence/policy/inference work; [repaired-engine replay](examples/audit-fixes/current/README.md) uses old public observation times, not fresh acquisition. `pnpm run test:audit` covers identity, progress, delayed-create and explicit recovery regressions. Docker create/control client windows are bounded at 30/10 seconds; parser wall/CPU/memory/mount/network controls remain 30 seconds/10 CPU seconds/256 MiB/restricted. Cleanup can extend through its bounded control window. No intelligence source, visual spike, model or canonical G0 shape is adopted/changed; S4/G3 and remote delivery remain open. Final typecheck/full G0, 114 serial core tests (17/48/36/13), 24 headless readiness checks, four replay cases and four model-off consumer boundaries pass locally; [receipt](examples/audit-fixes/current/validation.json) preserves earlier failures/recovery limits.
- **Linux handoff follow-up, 1 November 2026:** draft PR #3's initial Linux S2 run at `e29a98b` exposed unreadable worker journals/spool: UID 65534 with umask 077 produced 0600 output, while Docker Desktop masked the host ownership difference locally. The narrowly scoped follow-up sets only transport files to non-executable 0644 inside the existing 0700 private job parent, retains non-root/CPU/memory/PID/network/mount restrictions, records/checks UID and journal mode, and adds an actual cross-UID readability/private-parent regression. Journal read failures are distinguished from size limits. Safety profile is static-v5; earlier captures remain immutable historical evidence. Fresh code-bound outputs use `examples/handoff/current`; validation and the final PR head/result are recorded separately, not inferred from the initial local pass. No main merge, model/verifier/policy adoption or new product stage is authorized by this portability fix.
- A later 31 October read-only audit found gaps in the parked G0 candidate's integrity/provenance success conditions, source-context report IDs, and omitted-file accounting. The revised contract passes local full JSON Schema/semantic checks with pinned `jsonschema==4.26.0`, a pinned TypeScript 5.8.3 typecheck, and stubbed handshakes. PR [#2](https://github.com/sumnlikeshane/Heurisko/pull/2) passed both contract and documentation CI jobs on commit `0e6adb9`. Shane then instructed Codex to review the exact contract and treat the team as accepting it on that review; see the E09 acceptance note in the engineering agreement. No independent Malhar review is claimed. The original validation log is historical. Part 1 read-only API inspection found PR #2 merged at 22:40 IST as `f06ac54030486a3bf53c9fadacd4022d6a736195`; both jobs passed on its head `0e2be5a` ([run](https://github.com/sumnlikeshane/Heurisko/actions/runs/41223051102)). This is prior-contract CI, not a pass for uncommitted S1 changes.
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
| Shared G0 schema/types/fixtures | Integrated in [packages/contracts](packages/contracts/package.json); local checks and PR #2 CI passed on `0e6adb9`. Shane's delegated team acceptance after Codex review is recorded in agreement E09. PR #2 merge was confirmed read-only during Part 1; new S1–S3 changes remain local. |
| Exit behavior | Initial 0/1/2/3 mapping approved in A05. S2 tests precedence: no usable report 3; otherwise configured violation 1; otherwise materially incomplete/indeterminate 2; otherwise 0. Final Malhar policy review and concrete evaluators remain open. |
| Concrete dependencies, verifier policy, resource caps, rebuild worker, model choice, watch schedule, retention, hosting | Require implementation decisions and validation within the approved boundaries. |
| Project license | Apache-2.0 selected on 31 October 2026 under Shane’s delegated choice; `LICENSE` and `NOTICE` are tracked in `0e6adb9` (PR #2); new engineering remains local. |

Record any change to an approved product or trust rule as an amendment in the [approved decision register](docs/Approved%20Decision%20Register.md), with date, scope, rationale and affected documents. Preserve the [original founder register](docs/Heurisko_Research/HEURISKO_FOUNDER_DECISIONS.md) as research history. Routine implementation details within an approved rule need an engineering decision record and tests, not a false claim that the original proposal was still unapproved.

## Architecture and evidence invariants

The approved direction is one TypeScript/Node pnpm workspace engine and CLI, mandatory React/Ink TUI, React/TypeScript viewer, and shared JSON Schema/report contracts. Content-addressed evidence and immutable run references now exist; SQLite monitor metadata remains a design direction. The G0 schema/types are in the product workspace, reviewed under Shane's later delegated acceptance instruction, and tested by PR CI; PR #2 merge is confirmed. S1–S3 locally test Node 22.23.4 and Python 3.13.2 validation on macOS arm64, plus a digest-pinned Python 3.13.18 Linux arm64 static-parser image; broader product runtime support, hosting and performance remain open; Go/Bubble Tea remains a historical research alternative.

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

`HACKATHON.md` proposes **Qwen2.5-Coder-7B-Instruct** via Ollama `qwen2.5-coder:7b`; it explicitly says none is integrated. Later research proposes benchmarking **Qwen3-8B** and **Qwen3-4B**, with the coder model as a comparator. This is a historical proposal difference, not evidence that a model was changed, installed, run, or selected. Phase 01 approved genuine open-weight inference but did not select a model.

- Product inference must use a genuine open-source/open-weight model doing meaningful explanatory work. P04 permits local inference or a confirmed organizer open-model server. The project direction excludes closed cloud inference and silent closed-model fallbacks.
- Do not import P08's Gemma-only/laptop-only rules into P04. Do not assume an organizer model list, API, hardware, or model availability not supplied in the governing documents.
- Give the interpreter bounded evidence and no tools, credentials, network, build authority, or filesystem writes. Metadata/comments can contain prompt injection. Model output must not trigger commands, fetching, builds, severity escalation, publication, or changes to deterministic status.
- Require structured explanations with evidence IDs, hypotheses, alternatives, missing evidence, and abstention. Validate IDs, paths, ranges, quotes, output shape, and actual support for the claim. Schema validity and real citations alone do not prove factual correctness.
- Keep interpretations separate from hashes, source selection, provenance, comparison, and coverage. Record exact model/weight digest, quantization, runtime, prompt/schema version, decoding settings, selected evidence, omissions, and outcome.
- On inference failure or rejection, preserve the deterministic report and show the AI limit. A saved interpretation or mocked model test is not live inference and does not satisfy meaningful-model demonstration by itself.
- Never list an aspirational model as used. Update current model declarations through authorized changes when integration is actually established; preserve the original commit.
- Disclose product models separately from coding assistants. For these root documentation changes, **Codex** assisted writing; no product model was invoked or integrated. Do not guess an unavailable underlying assistant model identifier. Add later actual assistance to the relevant PR disclosure.

## TUI design handoff — required before TUI work

Shane requested recording and relocating the supplied [TUI Design Contract](docs/Design/TUI%20Design%20Contract%20v1.0.0.md) on 31 October 2026 and explicitly required future TUI work to reference it. Read it before TUI planning, implementation or review, together with the approved Phase 02 and current `packages/contracts/src/types.ts`. Part 4/S4 of Shane's implementation plan and the team CLI/TUI checklist link to the same canonical file.

The supplied filename says v1.0.0; its internal version is **v1.0.0-rc.1 — CANDIDATE FOR REVIEW, NOT APPROVED OR FROZEN**. Preserve the 59 confirmed preference directions while keeping proposed layouts/copy/APIs and unresolved mechanics provisional. This filing request does not approve the final contract or authorize TUI implementation. Before implementation, map screens/statuses to actual shared types and available engine seams, record gaps against Appendix C B01–B13, and use S01–S09 for acceptance. Approved Phase 02 and shared contract semantics take precedence; do not invent support or mark blockers closed from the historical design bundle alone.

## Monitoring, CLI, and interface rules

The monitor must invoke the shared engine, persist exact artifact observations and pending jobs, and use idempotent artifact-plus-configuration job keys. Discovery checkpoint advancement must not lose failed or queued analyses. Support restart/retry accounting; retain older unprocessed artifacts when newer ones arrive. New wheel uploads on existing versions, yanks/removals, and digest conflicts are distinct events.

Expose last successful fetch, last completed analysis, pending/failure state, and freshness. Respect validators, throttling, retry hints, and resource limits. A stopped local process is not continuous monitoring. Hosted accounts and notification channels are separate capabilities, not conditions for the basic monitor.

Approved Phase 02 calls for `heurisko` to open the TUI by default and a scriptable `analyze` path, with `inspect`, `tui`, and `watch add/run/status/remove` in the initial command direction. The original research also proposed `compare`, `project --lockfile`, `report export`, and `serve --local` as later expansions. S3 implements exact `analyze npm:NAME@VERSION`, local `analyze --artifact`, and retained-report `inspect`; interfaces/monitor remain later parts. Use the approved initial 0/1/2/3 meanings, then test/freeze precedence and exact syntax in the contract. Keep one JSON result on stdout, diagnostics/progress on stderr, and no interactive terminal requirement for CI. Support no-color/redirected and accessible linear output.

Browser/TUI views use the same report/evidence IDs and status meanings. A privileged loopback API requires a per-session token and origin checks. Keep raw differences, transformation strength, model hypotheses, skipped scope, cache state, and capture time visible. Core local analysis and exported-report viewing should remain account-free. A version-only PyPI input must not imply every distribution was checked.

## Dependencies, reuse, and license

Integrate established verification and parsing rather than inventing cryptography or a universal deobfuscator. OSS Rebuild, reproduce, diffoscope, Sigstore, pypi-attestations, and Drydock are substantial existing work; novelty claims need comparison. Optional advisory, behavioral, or hygiene tools must retain their own namespaces and limits.

Before admitting an actual dependency/model/tool, record the selected released version and digest, runtime/platform requirements, API stability, current security information, license/NOTICE and transitive obligations, resource behavior, and meaningful fixture results. Repository HEAD observations are not proof of released-package compatibility. Avoid unbounded “latest” installation or installing packages merely to describe them.

Shane delegated the project license choice on 31 October 2026; **Apache-2.0** was selected for original Heurisko material. The root [LICENSE](LICENSE) contains the official full text and [NOTICE](NOTICE) identifies project attribution and third-party scope. The organizer-supplied governing files and external tools, services, model weights, source excerpts, and third-party fixture assets retain their own rights; a subprocess boundary does not itself settle redistribution rights. Local history records LICENSE/NOTICE in `0e6adb9`; distinguish that prior PR from uncommitted engineering and any new publication.

## Validation and truthful completion

S1–S3 commands are `pnpm run typecheck`, `pnpm run test:contracts`, `pnpm run test:foundation` (**17 tests**) and `pnpm run test:s2` (**49 tests**, including two S3 network additions and the Linux handoff output-permission regression), plus `pnpm run test:s3` and `pnpm run test:audit` (**13 repair tests**). `test:s3` passes **36 tests**; exact receipts are in section 12. Select Node **22.23.4** and pnpm **10.14.0**, run `pnpm install --frozen-lockfile --ignore-scripts`, create/activate Python **3.13** `.venv` and install hash-locked `requirements-contracts.txt`. Local validator Python is **3.13.2**; parser Python is **3.13.18**. Run the installed local Docker engine and explicitly pull `python:3.13.18-slim-bookworm@sha256:281d39ff02e3b389401586134ff9e6572954687822a58055ec07a60ded4e0b7f`. The exact tested CLI replay/inspect commands are in [README](README.md#installation-and-execution) and [S2 examples](examples/s2/current/README.md).

The static parser uses only the local Docker Unix socket and a restricted Linux job, never a host fallback. It checks the cgroup v2 256 MiB/no-swap/16-PID controls, 10-second CPU and 256 MiB address-space limits, read-only root/input/worker, no capabilities, no-new-privileges and loopback-only active networking before parsing. Only private bounded output is writable; no host home, secrets, Docker socket or writable repository mount reaches the job. This is a static parser boundary, **not** an admitted hostile rebuild worker. macOS rejected the native address-space cap. Unavailable controls produce incomplete evidence. Unknown remaining archive scope is explicit. The code attempts exact-job removal and retains private spool/locks on unconfirmed cleanup. Part 4 observed a late-created never-started test orphan after store removal despite later passing regression tests; reliable whole-job lifecycle acceptance remains open pending an authorized repair. Never delete a crash/cleanup lock until the exact job's stopped state is verified. Store capacity/reserve failures preserve prior blobs; there is no automatic eviction or delete command.

Part 4 candidate-only validation after the existing build: `node_modules/.bin/tsc -p integration/part4/tsconfig.json` and `node --test integration/part4/tests/readiness.test.mjs` (**24/24**). These use the same pinned Node/TypeScript/Python and are outside root scripts/CI; they are not S4. Do not wire live investigations through the candidate until the recorded B02 lifecycle issue is resolved. The report reader supports S2/S3 byte-addressed records; line-only/unsupported/unavailable citations remain metadata-only. No future intelligence resolver contract was changed.

The [CI workflow](.github/workflows/ci.yml) includes S1–S3 alongside G0/documentation validation. Prior [PR #2 CI](https://github.com/sumnlikeshane/Heurisko/actions/runs/41223051102) passed on `0e2be5a`; no remote result exists for these local changes. [Plan section 12](docs/Shane%20Implementation%20Plan.md#12-execution-checkpoint--update-after-each-part) holds exact source/module receipts, report/config IDs, safety/rights ledgers and clock accounting. Preserve its later Malhar confirmation and distinct M0/M1 provenance. Real model-off M0/M0+M1 checks used isolated reviewed copies; the default product CLI still emits `ANALYSIS_MODULE_UNAVAILABLE`. S3 invokes its bounded public npm/source resolver; no model or target/rebuild execution was invoked. Canonical G0 schema/types/fixtures are unchanged; runtime and tests share the same semantic implementation. Do not promote a boundary handshake into final rule-quality acceptance or complete P04.

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

Required repository artifacts are an MIT/Apache-2.0 `LICENSE`, `HACKATHON.md`, `README.md` with tested setup/run instructions once runnable, `.github/pull_request_template.md`, `.github/workflows/ci.yml`, and `examples/` with real inputs/outputs. The PR template, contract-and-documentation CI workflow, and local Apache-2.0 license files now exist. S2 local-producer instructions and genuine raw examples now exist; complete analyzer/model/interface/monitor examples and final remote CI remain outstanding. Other outstanding items are not authorization to create them in every task.

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

Shane requested an eight-hour implementation sequence on 31 October 2026, then clarified that only his work should be planned, using `docs/Shared_Notes/work_split.md` as context. [Shane's implementation plan](docs/Shane%20Implementation%20Plan.md) is the single numbered execution sequence for that scope. It includes S1–S8 owner gates, early/final Malhar handoffs, a rolling checkpoint and exact next-session prompts. The approved team requirements/G0–G6 remain authoritative; Malhar's heuristics/build interpretation/RAG/model work is an integration dependency, not an additional Shane assignment. That planning task did not authorize implementation. Shane subsequently authorized Parts 1, 2 and 3 in separate scoped sessions; their actual foundation/producer work is recorded in section 12. Model work, commit/push and publication remain unauthorized.

At the start of a task, read this file, inspect current status/diffs, identify applicable source documents, and determine which existing approvals cover the requested work. Preserve user changes and use the smallest coherent change set. Do not create unrelated scaffolding or spin up sub-agents solely because the research suggests four contributor workstreams; follow the active user and environment delegation instructions.

When meaningful project facts change, update this file's baseline/current guidance and the affected README sections in the same authorized change. Keep detailed decisions in the founder register and technical contracts in their owning documents; link to them here. Record approved scope, implemented entry points, exact validated commands, model/tool versions, important failure modes, and unresolved decisions. Do not store secrets, private payloads, machine-specific temporary output, or a transcript of every shell command.

Before handing work back, inspect the final diff and Git status, report what changed and how it was checked, identify material limitations, and state whether commit/push actions occurred. Keep changes uncommitted and unpushed until the user explicitly approves those actions. This file documents that behavior; enforcement also depends on agents following it and any separately configured repository protections.
