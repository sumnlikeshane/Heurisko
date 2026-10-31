# Heurisko — Founder Decisions

Research date: 31 October 2026. Every recommendation below is **PROPOSED — NOT YET APPROVED**. This register records choices for review; it neither accepts the founder hypotheses nor authorizes implementation. Confidence describes the recommendation's support, not measured product accuracy.

## FH-01 — Terminal-native Heurisko

**Founder hypothesis:** developers should install Heurisko and investigate dependencies in their terminal, potentially with a Lazygit-inspired interface.

**Recommended verdict: ACCEPT WITH MODIFICATION.** Establish a scriptable local CLI and stable evidence report first. Add an optional TUI that explores those reports when a usability check demonstrates value. Keep the analysis engine independent from every interface.

| Decision dimension | Assessment |
|---|---|
| Supporting evidence | Existing terminal investigation tools demonstrate a practical interactive pattern; CI and dependency-review workflows require noninteractive operation. Lazygit, Bubble Tea, Ink, Ratatui and Textual are real projects, examined in the product/tooling documents. A local engine avoids making every investigation depend on an account or hosted availability. |
| Evidence against / costs | Terminal panes constrain complex generated-code mappings. A TUI adds keybindings, focus/accessibility, terminal-compatibility testing and maintenance without strengthening the underlying analysis. Installing a Node CLI adds a runtime requirement; a Go/Rust binary is a credible alternative. |
| Alternatives | CLI only; CLI plus optional report TUI; mandatory TUI; web-only client calling a server. |
| Rationale | Noninteractive analysis and machine output have clear automation value. Interactive navigation is useful for investigation but should not become a second analyzer or a prerequisite for CI. |
| Proposed responsibilities | CLI resolves requests, invokes the core, returns human/JSON output and CI outcomes. TUI reads/drills into evidence and may launch explicit core actions. Web handles larger visual comparisons and shareable reports. |
| Proposed commands | `analyze`, `inspect`, `compare`, `project --lockfile`, `watch add/run/status/remove`, `report export`, `serve --local`; syntax remains provisional. |
| Confidence | High on CLI value and one shared core; medium on TUI adoption; medium on TS versus Go distribution. |
| Dependencies | Stable report schema, reliable single-artifact analysis, safe artifact retrieval, explicit CI policy and installation/distribution tests. |
| Unresolved questions | Supported OS/runtime floor; binary versus npm distribution priority; which lockfiles first; TUI user-testing result; final exit-code contract. |
| Approval status | **PROPOSED — NOT YET APPROVED** |

**Evidence and alternatives:** [Lazygit](https://github.com/jesseduffield/lazygit), [Ink](https://github.com/vadimdemedes/ink), [Bubble Tea](https://github.com/charmbracelet/bubbletea), [Ratatui](https://github.com/ratatui/ratatui), [Textual](https://github.com/Textualize/textual). These support implementation options, not a claim that developers have validated Heurisko's proposed TUI. See [product definition](HEURISKO_PRODUCT_DEFINITION.md).

## FH-02 — A purposeful web platform

**Founder hypothesis:** the website should explain installation/usage and offer browser package search and investigation, even if the main product is terminal-native.

**Recommended verdict: ACCEPT WITH A SHARED-ENGINE BOUNDARY.** Build documentation and a browser evidence investigation interface. Let it open reports without an account. Use an optional local or hosted API for live analysis; do not require a public service for core CLI use.

| Decision dimension | Assessment |
|---|---|
| Supporting evidence | Browsers offer space for source/artifact trees, side-by-side diffs, provenance context and stable evidence links. Existing artifact-diff products demonstrate that such interfaces already have a defined purpose; consequently visual polish alone is insufficient differentiation. |
| Evidence against / costs | A hosted analyzer introduces queueing, abuse controls, retention, isolation and operating costs. Search indexing and accounts can consume effort without improving the package/source answer. An attractive risk dashboard can conceal uncertainty. |
| Alternatives | Documentation-only website; full independent browser analyzer; shared engine plus local/exported viewer; mandatory hosted platform. |
| Rationale | Documentation supports adoption; visual evidence inspection supports investigation. The same report and policy semantics prevent CLI/web disagreement. Hosted execution should remain a deployment choice rather than a prerequisite. |
| Proposed responsibilities | Documentation/install/reference, explicit package/version/distribution selection, source relationship view, file correspondence/diffs, provenance, unresolved findings, report export/share. Release monitoring uses the common engine; accounts/watchlist dashboards are optional supporting capabilities. |
| Confidence | High on evidence viewer and shared engine; medium on public hosted analysis; low on operating cost until measured. |
| Dependencies | Versioned report schema, escaped source rendering, bounded diff navigation, API job controls if enabled, public-data policy and deployment budget. |
| Unresolved questions | Initial live-browser execution mode; retention/deletion; public sharing default; abuse quotas; operator responsibility; whether authentication is needed for hosted execution. |
| Approval status | **PROPOSED — NOT YET APPROVED** |

**Competitive evidence:** [Drydock diff](https://drydock.org/diff), [Drydock repository](https://github.com/JoviDeCroock/drydock), [OSS Rebuild](https://github.com/google/oss-rebuild). The meaningful proposed distinction is source-to-artifact evidence accounting, residual explanation and explicit uncertainty; novelty and adoption remain unproven. See [tooling analysis](HEURISKO_TOOLING_AND_REUSE.md).

## Proposed architecture and policy decisions

Each row records its rationale and opposing evidence. Approval is separate for each decision; accepting sequencing does not automatically accept every architecture or operational default.

| ID / decision | Evidence for; evidence against | Alternatives and recommendation | Confidence / dependencies / open questions | Approval |
|---|---|---|---|---|
| D-01 — Product claim | Correct source/artifact relationship and explaining residuals directly address P04. Source correspondence does not establish harmlessness. | Adopt evidence-backed investigation; reject universal safe/unsafe certification and arbitrary safety percentages. | High. Requires five status dimensions, evidence IDs, scope/abstention and clear wording. | **PROPOSED — NOT YET APPROVED** |
| D-02 — Engine and repository | Shared TS contracts fit React/Node team skills; Go offers simpler binary distribution. Cross-language verifier adapters add maintenance. | TS monorepo shared core/CLI + React viewer, optional Ink. Go/Bubble Tea is the strongest alternative if executable distribution dominates. | Medium-high. Requires released dependency/runtime compatibility and packaging spike. | **PROPOSED — NOT YET APPROVED** |
| D-03 — Ecosystem sequence | Organizer accepts npm or PyPI. npm exposes JS build transformations prominently; PyPI validates per-distribution design and native-binary limits. | npm implementation first; validate adapter contract against PyPI immediately; support PyPI next without changing core identity model. | Medium. Target releases, filenames, languages and native scope still require selection. | **PROPOSED — NOT YET APPROVED** |
| D-04 — Source/trust policy | npm/PyPI/SLSA distinguish authenticated assertions from build equivalence. Metadata/tag equality can mislead. | Expected repository/builder policy plus immutable commits; preserve candidate/ambiguous states. Do not infer trust solely from the same metadata being assessed. | High principle, medium policy specifics. Requires expected-identity configuration and conflict fixtures. | **PROPOSED — NOT YET APPROVED** |
| D-05 — Difference explanation | Builds legitimately generate files; name-based exemptions can conceal tampering. General semantic equivalence is not established by AST similarity. | Raw-first layered comparisons, versioned narrow transforms, structural mapping, optional rebuild, visible executable residuals. | High architecture, unmeasured detection quality. Requires paired benign/tampered ground truth. | **PROPOSED — NOT YET APPROVED** |
| D-06 — Reuse | OSS Rebuild, diffoscope, Sigstore and PyPI tools solve substantial subproblems. Some tools have authentication/runtime/license constraints and incomplete coverage. | Integrate selected mature tools through explicit evidence adapters; own orchestration/report/policy logic. Avoid copying entire platforms or blanket novelty claims. | High on reuse, medium on specific versions. Requires pinned releases, licenses/notices and adapter conformance. | **PROPOSED — NOT YET APPROVED** |
| D-07 — AI task and model | Organizer requires meaningful open-source/open-weight work. Structured output can constrain syntax, not truth. Official Qwen cards/runtime documentation are available. | Grounded explanation and uncertain-case triage. Benchmark Qwen3-8B against a smaller Qwen candidate; local runtime or confirmed organizer open-model server; no closed inference fallback. | Medium. Exact weights, quantization, hardware, context and runtime remain unfrozen until actual inference and ablation. | **PROPOSED — NOT YET APPROVED** |
| D-08 — Execution isolation | Package lifecycle/build scripts are executable untrusted inputs. Parser filters alone do not handle all resource/escape threats. | Static analysis default; separate disposable restricted Linux sandbox/microVM for rebuilds; no host-execution fallback. | High principle, medium deployment. Requires containment tests, network policy and supported Mac/Linux setup. | **PROPOSED — NOT YET APPROVED** |
| D-09 — Monitoring | P04 explicitly requires monitoring selected new releases. Always-on hosting/account systems are not explicitly required. | Persisted local/CI poller with idempotent jobs and visible stopped/stale state. Optional hosted scheduler/dashboard later. | High. Poll interval, artifacts per release, retry/resource budgets and notification channel need policy. | **PROPOSED — NOT YET APPROVED** |
| D-10 — CI/policy outcomes | Incomplete evidence differs from a confirmed policy violation. A clean diff can still contain malicious source. | Freeze separate analysis, coverage and policy outcomes; JSON full report; SARIF for actionable finding projection. | High principle, medium API details. Exact numeric exit codes and blocking thresholds require approval/tests. | **PROPOSED — NOT YET APPROVED** |
| D-11 — Hosting/data | Account-free local use limits operational burden. Hosted evidence helps sharing/monitoring but adds cost, retention and abuse issues. | Local SQLite/content-addressed store; optional hosted API/isolated workers. Event analysis uses public data only. | Medium-high. Budget, retention/deletion, report sharing, quotas and incident ownership are open; no production defaults adopted. | **PROPOSED — NOT YET APPROVED** |
| D-12 — Project licensing | Organizer requires MIT or Apache-2.0. Dependencies/models/assets have their own licenses. | Prefer Apache-2.0 for project code; MIT is acceptable if founder prefers. Isolate external GPL tools as separately installed executables and review distribution obligations. | Medium. Verify exact SPDX licenses/notices for pinned dependencies and bundled materials before distribution. | **PROPOSED — NOT YET APPROVED** |
| D-13 — Evaluation and launch claims | Organizer tests legitimate releases and seeded tampering. No product experiments were run in research. | Pin artifacts/source and mutations, held-out cases, explanation/source/coverage metrics, model-off ablation, containment suite. Publish only actually measured results. | High method, unknown outcomes. Corpus intake and acceptable quality thresholds remain approval/experiment gates. | **PROPOSED — NOT YET APPROVED** |

The recommendations draw on the baseline's standards/incident evidence, tooling's repository/license checks, product's model/interface evaluation, architecture's contracts and verification's test design. They are integrated here rather than relabeled as confirmed decisions.

## Decisions needed first

The smallest coherent approval set is FH-01, FH-02 and D-01–D-05, followed by model/runtime and isolation boundaries (D-07/D-08). It fixes the problem definition, shared engine, ecosystem order, trust semantics and evidence rules before interface work creates incompatible assumptions. D-09 monitoring is an official obligation; approval selects its operational design, not whether to omit it.

D-06 requires specific integration selection before dependency installation/distribution. D-10 requires contract approval before CI adoption. D-11 needs operational choices before public execution hosting. D-12 must be settled before the repository's license PR. D-13 needs corpus/quality gates before security claims or a public release. The roadmap is dependency-based and does not impose a 12-hour feature cut.

## External clarifications and experiments

| Question | Who/what can answer it | Current handling |
|---|---|---|
| Full scoring weights | Organizer, corrected slide/rubric | Literal `00` placeholders confirmed; do not invent values |
| Organizer open-model server list and invocation contract | Organizer | Candidate runtime adapter; local benchmark path retained |
| Hidden-test API/input contract, network/model availability and supported platforms | Organizer | Design explicit local archive and JSON interfaces; mark unknown environment |
| Representative source-matching/explanation quality | Pinned corpus experiment | Unmeasured; no accuracy claim |
| Qwen candidate feasibility on actual laptop/test machine | Actual inference benchmark | No memory/latency success presumed |
| Exact rebuild isolation and worker costs | Containment and operational benchmark | No host builds; hosted operation remains gated |
| Whether a TUI materially helps | Developer workflow usability test | Optional enhancement, not necessary for correctness |
| Long-term differentiation against OSS Rebuild/reproduce/Drydock | Comparative workflow evaluation and maintainer feedback | Evidence-oriented hypothesis, not established market gap |

## Decision history rules

Record explicit founder acceptance, date, approved scope, rationale, dependencies and deferred items before changing any row to approved. Partial approval changes only the named decisions. Preserve earlier alternatives and unresolved evidence. A model/hosting experiment is not approval for production deployment. Any later architecture change must update the product, contracts, verification and roadmap consistently.
