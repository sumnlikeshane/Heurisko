# Heurisko — Proposed Product Definition

Research date: 31 October 2026. Status: **PROPOSED — NOT YET APPROVED**. This document recommends product behavior; it does not authorize implementation or claim completed validation.

## 1. Product direction

Heurisko should help a developer answer: **“What evidence connects the package I will install to this source revision, and what remains unexplained?”** Its primary object is an investigation of an exact artifact, source candidate, and analysis configuration. The result is an inspectable evidence report, with separate source-identity, artifact-relationship, suspicious-behavior, and analysis-completeness information.

The central contribution should be build-aware explanation and investigation. A vulnerability database lookup, generic malware scan, repository health score, or fluent LLM summary cannot substitute for comparing the distributed bytes with their corresponding source. Existing rebuilding and provenance tools are foundations to integrate; see the tooling and baseline documents for the competitive limits on novelty.

**Official requirements:** The supplied DOCX Problem 04 requires package retrieval from npm **or** PyPI, corresponding source retrieval, comparison, generated-file/build-artifact identification, unexpected-modification detection, explanations supported by evidence, and monitoring selected packages' new releases. Slide 28 illustrates TypeScript compilation, an added `postinstall` script, and an unexplained obfuscated file. That slide is an illustration, not permission to hardcode those filenames as the detection strategy.

Monitoring is required in the completed Problem 04 scope. A hosted monitoring dashboard, accounts, and email are product choices. npm-first delivery is a proposed sequence; PyPI remains an ecosystem expansion rather than an assertion that both are officially mandatory.

## 2. Founder hypotheses

| Hypothesis | Recommended verdict | Why | Counter-evidence / cost | Confidence and approval |
|---|---|---|---|---|
| FH-01: installable terminal-native product, potentially Lazygit-inspired | **Modify and accept the direction:** first-class local CLI, stable machine output, optional interactive report explorer | Analysis fits dependency installation, upgrade review, CI, and incident investigation; a TUI can preserve context while moving between files, differences, and evidence. [Lazygit](https://github.com/jesseduffield/lazygit) demonstrates a navigable Git terminal workflow; this is a UX precedent, not evidence that Heurisko users need every panel | TUI-only operation impedes automation and accessible output; full-screen rendering introduces terminal, resize, keyboard, and large-diff work. Adoption benefit is untested | High confidence in CLI; medium in TUI. **PROPOSED — NOT YET APPROVED** |
| FH-02: purposeful web platform alongside terminal tooling | **Modify and accept:** shared investigation workspace plus installation/docs, using the same engine and reports | Browser excels at wide side-by-side diffs, evidence links, sharing, and version comparison; one report contract keeps interface results consistent | A browser-only analyzer duplicates work and can require expensive untrusted-job hosting. A public searchable service adds indexing, retention, abuse, and privacy responsibilities | High confidence in report explorer; medium in public hosted analysis. **PROPOSED — NOT YET APPROVED** |

Neither hypothesis validates market demand. Before broadening the product, observe developers completing installation and upgrade investigations, measure where they switch interfaces, and ask maintainers which evidence would change a release decision.

## 3. Personas and complete workflows

All journeys below are proposed. Package code and release scripts remain untrusted; normal investigation does not install or execute them on the developer's host.

| Persona and trigger | Input and sequence | Evidence needed | Output and next action |
|---|---|---|---|
| Individual developer adding a dependency | Exact npm/PyPI identity → resolve version once → fetch artifact → inspect identity/provenance → compare → inspect unexplained changes | Artifact digest; registry metadata capture; exact source commit/subdirectory; relevant changed files; coverage/limitations | Local report. Developer reviews evidence, selects a different version, requests maintainer clarification, or explicitly accepts the remaining uncertainty before a separate installation |
| Maintainer validating a release | Published release plus claimed commit/build recipe → compare packlist/manifest → inspect provenance → optional isolated rebuild → examine residual differences | Source commit, release workflow identity, build environment/lockfile, publication artifact, rebuild outputs | Explainable release report. Correct packaging or publishing workflow, issue a new release if appropriate, or document known unresolved transformations |
| Security engineer auditing a project | Supported resolved lockfile → enumerate exact direct/transitive artifacts → deduplicate → schedule bounded analyses → prioritize suspicious/incomplete entries | Lockfile identity and integrity fields; per-artifact reports; unsupported dependency forms explicitly enumerated | Aggregate report with links to individual findings. Export JSON/SARIF, open an internal review, or define a CI policy; no blanket “project safe” verdict |
| Browser-preferring developer | Registry-qualified search → choose exact version/artifact → start or open an investigation → inspect source mapping → select difference → follow evidence | Same report and digests as CLI; freshness; source confidence; actual file spans and limits | Shareable static report or local report view. Export evidence, copy a CLI reproduction command, or analyze another version |

### Everyday workflow coverage

| Workflow | Proposed user behavior | Boundary and priority |
|---|---|---|
| Install a dependency | Analyze a pinned target before invoking the package manager | Foundation; no automatic installation and no promise to verify every transitive artifact unless resolved and scanned |
| Upgrade a dependency | Compare old/new investigation reports; emphasize newly introduced findings and identity changes | Enhancement after single-release correctness; a release-to-release diff supplements source comparison |
| Investigate a suspicious release | Read exact artifact/source differences and evidence, then request isolated rebuild if useful | Foundation; suspicious does not prove malicious intent |
| Review a dependency PR | Read changed lockfile entries, analyze newly resolved artifacts, attach CI artifacts or SARIF where supported | Enhancement; public issue/comment posting excluded from event scope |
| Audit an existing project | Parse explicitly supported lockfile formats; retain unsupported git, URL, workspace, editable, and platform-specific entries as unknown | Enhancement; a requirements range alone is not an exact dependency resolution |
| Inspect one published version | Artifact-centric analysis with explicit source override supported and labeled user-supplied | Foundation |
| Monitor selected packages | Persist selected identities and last observed releases; poll/run once, analyze unseen exact artifacts, expose failed polls and last successful check | Official completed scope; persistent local process, scheduler, or CI can run the monitor; hosted account/dashboard optional |

Pre-install interception should be deferred until the standalone analyzer is proven. An automatic wrapper can create dependency-resolution differences, time-of-check/time-of-use gaps, and false confidence if installation fetches bytes other than those analyzed. The supported early workflow is “analyze, review, separately install pinned artifact/version”; a future verified installer would have to bind the installed bytes and dependency resolution to the analyzed digest set.

## 4. Capabilities and scope

**Foundational:** exact artifact retrieval and hashing; source-candidate resolution with uncertainty; safe inventories; raw differences; manifest and executable-content checks; conservative transformation explanations; provenance inspection/verification through reusable tooling; evidence report; selected-package release monitoring.

**Demonstration capabilities:** benign generated output explained with supporting evidence; a tampered local copy visibly labeled distinct from the registry original; an ambiguous case producing an explicit limit; an actual open-weight model explaining a bounded difficult difference; identical evidence in CLI and browser; one unseen input chosen by a judge.

**Enhancements:** TUI report browsing, supported lockfiles, upgrade comparison, SARIF mapping, local HTML export, CI policies, reusable build recipes.

**Future platform:** hosted investigations, opt-in public reports, collaborative annotations, watchlist dashboard, notifications, API service, additional registries. Public package search can query registry adapters; building a whole-registry index is not a prerequisite.

**Research-dependent:** universal semantic equivalence, automatic recipe inference across arbitrary build systems, reliable detection in native opaque binaries, AI-only maliciousness judgments. Do not promise these as deterministic capabilities.

Out of scope for the initial product definition: exploitability/reachability analysis, replacing OSV/Socket/Snyk, declaring a package universally safe, automatic dependency repair, private-package hosted analysis, social reputation scoring, or executing arbitrary build scripts on the user's host. These boundaries preserve the Problem 04 objective.

## 5. Division of interface responsibilities

| Component | Responsibility | Must not own |
|---|---|---|
| Shared analysis engine | Acquisition orchestration, analysis stages, findings/evidence contracts, completeness, deterministic classification | Presentation-specific verdict rules |
| CLI | Exact target selection, local execution, configuration, JSON output, policy evaluation, monitor commands | Mandatory remote account or browser dependency |
| Optional TUI | Browse existing/running investigation, filter findings, follow source/diff/evidence links | A second analysis engine, automatic terminal execution of file contents |
| Browser UI | Search/version selection, wide diffs, provenance/relationship inspection, report sharing/export, docs | Loading package code as active application content |
| Optional API/worker | Run the same engine with isolation, quotas, cancellation, and explicit retention | Unbounded arbitrary URL fetching or unrestricted builds |
| Model adapter | Evidence-grounded explanations and hypotheses with provenance | Hashing, signature truth, source identity certification, authoritative risk/completeness changes |

Essential static analysis should work without an account or hosted backend. Network is needed for fresh public evidence unless already cached. Offline replay must say which artifacts, source snapshots, trust material, model, and previous reports are available; it must not imply that registry status or release monitoring was freshly checked. Missing cache material produces a partial result with a concrete acquisition error. A verified bundle can support offline review within its preserved trust-policy assumptions.

A local web viewer may be served on loopback with a random session token, restrictive origins, no arbitrary filesystem access, and explicit imported-report boundaries. Hosted public search and read-only reports can be anonymous. Persistent personal watchlists, private reports, team access, and paid service use would justify optional accounts later; no account mechanism is needed to prove the analysis.

## 6. Proposed terminal experience

Command names are illustrative proposals, not frozen API requirements:

```text
heurisko analyze npm:@scope/name@1.2.3 --format json
heurisko analyze pypi:distribution@1.2.3 --artifact <exact-wheel-or-sdist>
heurisko analyze --artifact <local-archive> --source <repo>@<full-commit>
heurisko inspect <report>
heurisko compare <old-report> <new-report>
heurisko project --lockfile <supported-lockfile>
heurisko watch add npm:package
heurisko watch run --once
heurisko watch status
heurisko watch remove npm:package
heurisko report export <report> --format json|sarif|html
heurisko serve --local <report>
```

Use registry-qualified names to avoid npm/PyPI collisions. An ambiguous “latest” input may resolve once for convenience, but must print and persist the exact selected version and artifact digest. PyPI versions can have several artifacts with different platform/ABI contents; a version-only report cannot silently imply every wheel was checked. `analyze --artifact` is crucial for organizer tampered copies: never attach the original package's provenance success to modified bytes.

Human output should begin with target/digest, source association, relation evidence, suspicious findings, and incomplete stages. Every finding should answer what changed, why it matters, what supports it, and what remains unknown. Machine mode writes one versioned JSON document to stdout; progress and diagnostics go to stderr. JSON and noninteractive modes must never require raw terminal input. `--no-color`, redirected output, narrow terminals, keyboard-only interaction, and screen-reader-friendly linear output are baseline usability requirements.

Specify distinct exit outcomes for completed policy pass, policy violation, incomplete analysis, and invocation/internal error. “Process returned successfully” must not mean “safe.” The implementation must freeze documented numeric exit codes before CI integration; proposed semantics can become 0/1/2/3 only after the shared contract is approved. SARIF should map actionable findings and exact locations; preserve non-findings such as missing provenance and global analysis coverage in the native JSON report rather than forcing every unknown into a security alert.

The TUI should use three areas when space permits: artifact/source inventory, selected difference, and evidence/explanation. Selecting a finding reveals preserved raw bytes/text and its evidence IDs. Use filters for unresolved differences, generated transformations, suspicious behavior, and unsupported analysis. Switch to a stacked/linear display on small terminals. A full-screen TUI is useful for investigations across many files, while the CLI remains the scripting and onboarding path.

## 7. Proposed web experience

| Screen or view | User purpose and action | Stage |
|---|---|---|
| Install and documentation | Install CLI, understand limitations, reproduce one real example, find command reference | Foundation |
| Search and version/artifact selector | Find exact registry identity; choose version and precise wheel/tarball | Browser foundation; direct registry queries suffice |
| Investigation overview | See analyzed digests, source-candidate strength, stage completeness, key findings, freshness | Browser foundation |
| File and difference explorer | Inspect source ↔ generated/published relationships, original and normalized differences, unchanged context | Demonstration foundation; virtualize large lists/diffs |
| Evidence/provenance detail | Inspect signature/trust-policy result, claimed workflow/commit, rebuild evidence, source spans, verification errors | Demonstration foundation |
| Release comparison | Understand changed findings and relation evidence between two analyzed artifacts | Enhancement |
| Reports/export | Download immutable report and evidence manifest; share only after explicit publication | Enhancement |
| Monitoring dashboard | Watch last check, new release, queued/failed analysis, cancellation and selected packages | Future hosted UX; monitor functionality remains required |
| API reference | Integrate the versioned contract and document error/coverage semantics | When a public API exists |

Favor a compact status table over a dramatic risk gauge. Show transformation links only at the strength established: “byte match,” “rebuild match,” “source-map claim,” or “model hypothesis,” with a key explaining each. Keep raw differences accessible when normalization is shown. Escape filenames/control characters in terminal and browser. Never render extracted HTML/SVG/Markdown as trusted active content. Accessible contrast, labeled statuses beyond color, keyboard navigation, diff wrap controls, and “show skipped content” links make uncertainty understandable. No invented activity feed or fabricated percentage is needed.

## 8. Language, TUI, and distribution decision

The following is an engineering comparison, not a benchmark. The core and browser should share contracts and algorithms; sharing does not imply running all acquisition/rebuild code inside the browser.

| Candidate | Strength for Heurisko | Cost / limitation | Recommendation |
|---|---|---|---|
| TypeScript + Node + optional Ink | Shared language/contracts with React web; strong JavaScript package/AST ecosystem; [Ink](https://github.com/vadimdemedes/ink) is an MIT React terminal renderer | Requires runtime/distribution plan; parser and archive libraries need careful boundaries; full-screen TUI needs terminal testing | **Proposed preferred core/interface stack** for this React/TS-oriented team; isolate heavy/security-sensitive work in processes/workers |
| Go + Bubble Tea | Binary distribution and concurrency suit an installable CLI; [Bubble Tea](https://github.com/charmbracelet/bubbletea) is an MIT Go TUI framework with Elm-style state/update/view design | React web still needs separate UI implementation; JS semantic analysis requires bindings/subprocesses or duplicated parser support | Strong alternative if self-contained binaries and a Go-owning team dominate |
| Rust + Ratatui | Native deployment and explicit resource handling; [Ratatui](https://github.com/ratatui/ratatui) supplies MIT TUI components | More implementation/interface binding work for a TS-focused team; memory safety does not make untrusted builds safe | Strong worker/parser option if measured bottlenecks justify it; avoid two full independent engines |
| Python + Textual/Rich | Close to Python packaging/analysis tooling and experimentation; [Textual](https://github.com/Textualize/textual) is MIT and supports terminal/browser delivery | Python environment/distribution responsibility; rich React diff UI still separate if chosen; Python framework serving is not identical to native React components | Viable if PyPI and Python specialists become the priority; useful external verifier bridge |

Repositories were read on 31 October 2026 and expose current activity; this is not a security audit or guarantee of continued maintenance. Ink's README explicitly documents an upcoming version. Its HEAD manifest showed Node >=22 and version 8.0.0; that does **not** establish the registry's selected stable release. Pin a released version, inspect that release's Node/React peers and transitive dependencies, and test on macOS/Linux/Windows before committing to TUI APIs. [Ink README](https://github.com/vadimdemedes/ink), [HEAD manifest](https://github.com/vadimdemedes/ink/blob/master/package.json).

Distribute the proposed TS CLI through npm with a minimal dependency surface and documented runtime; add checksummed signed/reproducible platform artifacts only after release engineering exists. Homebrew can be a later installation route. A PyPI package purely to bootstrap a Node CLI would introduce a second packaging responsibility; a documented CLI invocation or JSON adapter is cleaner. Do not promise a single portable executable before packaging and native dependencies have been validated. Heurisko's own release must be analyzed and accompanied by provenance/evidence where practical.

## 9. Meaningful open-weight model work

**Official boundary:** DOCX guidelines require meaningful open-source/open-weight model work. Slide 12 permits local models or the organizer model server and gives closed model APIs zero AI-use points; test machines have no API keys. Problem 08 has a stricter Gemma-only/local rule that does not apply to Problem 04. The founder research brief independently excludes closed cloud inference from Heurisko. No model should be claimed until it is actually integrated and exercised.

Proposed model responsibility: explain a bounded difficult delta, identify plausible transformation mechanisms, and rank questions a developer should investigate next. For example, an evidence bundle can contain a source export, its generated wrapper, build configuration, and exact diff spans; the model proposes whether the wrapper is consistent with that transformation and cites those observations. It must never convert plausibility into verified equivalence. This work can be measured against expert-labeled explanations and shown through an ablation against deterministic templates.

| Candidate verified to exist | Relevant evidence | Proposed role / unresolved question |
|---|---|---|
| Qwen3-8B | Official card: Apache-2.0, about 8.2B parameters, native 32,768 context, local Ollama/llama.cpp/MLX-LM support; Transformers below 4.51.0 lacks the architecture. [Card](https://huggingface.co/Qwen/Qwen3-8B) | Leading **benchmark candidate**, not empirically selected. Compare non-thinking bounded explanation with thinking mode if needed; domain reliability unknown |
| Qwen3-4B | Official card: Apache-2.0, 4.0B parameters, native 32,768 context. [Card](https://huggingface.co/Qwen/Qwen3-4B) | Lower-memory candidate using identical evidence/task suite; quantify explanation-quality loss |
| Qwen2.5-Coder-7B-Instruct | Official card: Apache-2.0, 7.61B parameters, code-oriented instruction model; Transformers below 4.37.0 lacks its architecture. [Card](https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct) | Code-focused comparator; generation benchmarks do not establish package-integrity reasoning quality |
| Gemma 4 E4B/E2B | Google model card exists, identifies Apache-2.0 and small device-oriented variants. E4B has 4.5B effective / 8B with embeddings; E2B 2.3B effective / 5.1B with embeddings. [Card](https://ai.google.dev/gemma/docs/core/model_card_4) | Event-aligned alternative; do not treat effective size as resident weight size or assume variant availability on organizer server |

Ollama is a practical local adapter; its schema output mode supports a JSON schema and JavaScript/Python validation examples. Schema-conformant output alone does not verify facts. [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs). Use a pinned runtime/model digest, explicitly local endpoint, and disable cloud functionality for local-only execution; the FAQ documents `OLLAMA_NO_CLOUD=1` and loopback binding. [FAQ](https://docs.ollama.com/faq). llama.cpp is an MIT alternative with downloadable binaries/build options, useful when explicit GGUF/runtime packaging control matters. [Repository](https://github.com/ggml-org/llama.cpp).

### Hardware and reproducibility

Ollama's retrieved `qwen3:8b` artifact lists Q4_K_M, approximately 5.2 GB and displayed digest prefix `500a1f067a9f`; record the full installed digest rather than using that prefix as an immutable identity. [Artifact](https://ollama.com/library/qwen3:8b). Disk weight size is not peak RAM: add runtime buffers, tokenizer, context/KV cache, input/output, operating system, and concurrent analysis. Idealized raw weight storage alone is `parameters × bits / 8`; quantization metadata and other components add overhead. Do not infer that an 8 GB machine can run an 8B model comfortably from a 4-bit arithmetic estimate.

Ollama supports Apple M-series CPU/GPU on macOS 14 or newer, but no Heurisko model was run on this user's M3 or event hardware during research. [macOS requirements](https://docs.ollama.com/macos). Begin benchmark with one inference at a time and a bounded evidence context, measure cold/warm latency, peak memory, throughput, and failure modes, then set supported configurations. Organizer server's model list, quota, network reachability, and resource limits remain unknown. Quantization can affect results; benchmark the exact distributed artifact.

Do not blindly set greedy decoding because “deterministic” sounds desirable. Qwen's card advises against greedy decoding in thinking mode. Store template/thinking mode, sampler settings, runtime, model digest, prompt hash, evidence selection, and output; replay saved interpretations exactly while acknowledging that fresh inference can vary across runtimes/hardware. Model confidence is not a calibrated probability of package safety.

### Model contract and failure behavior

1. Core emits immutable observation IDs and preserves the underlying files, hashes, spans, build/provenance results, and limitations. Evidence selection is bounded and its omissions are recorded.
2. Model receives only relevant quoted evidence as untrusted data. No network, shell, filesystem write, package install, or build tools are exposed to it. Code comments and metadata can contain prompt injection.
3. Schema requires explanation, evidence IDs, suggested interpretation, alternative explanations, missing evidence, and abstention reason. “No conclusion” is a valid answer.
4. Deterministic validator rejects unknown IDs, nonexistent paths/spans, invalid enums, excessive length, and unsupported claims of completed verification. Citation existence is necessary but not sufficient; an expert or separate grounded check must judge whether the cited evidence actually entails the explanation.
5. AI interpretation is stored separately and labeled with model identity. It cannot overwrite verified hashes, provenance state, source selection, coverage, or deterministic relation results. New hypotheses can propose an additional analysis task, which requires normal deterministic verification.
6. On timeout, OOM, unavailable model, invalid schema, or unsupported claims, retain the useful deterministic report and mark AI unavailable/rejected. Do not silently fall back to a closed model. Product inference must still be exercised for the official AI-use requirement; offline recorded examples are not live inference.

### Evaluation of actual contribution

Use the same held-out artifact/source cases for: (A) deterministic checks and fixed templates; (B) model reading raw diffs alone; (C) deterministic checks + provenance/build evidence + constrained model interpretation. Blindly grade transformation explanation correctness, citation entailment, invented facts, abstention appropriateness, triage usefulness, and time to a correct human decision. Report suspicious-change detection separately from explanation quality; an AI summary must not inflate deterministic detection claims. Record schema rejection, timeout, memory and latency per model/quantization. Pin test cases before choosing the winner and keep mutation families/package projects out of both training examples and held-out cases where possible. No model accuracy, benchmark superiority, or hardware latency has been established in this research.

## 10. Adoption, open questions, and approval boundaries

Highest-value validation: can a developer distinguish a proven relationship from a plausible explanation, find the cited changed line, and act on an incomplete report without reading a manual? Can the same command/report reproduce the finding elsewhere? Can a maintainer explain a normal generated artifact without creating a package-specific suppression list?

Approval queue: local CLI plus shared report; npm-first sequencing; React browser explorer; optional TUI after demonstrated need; TypeScript core; local open-weight benchmark candidates/runtime; exact CI policy and exit semantics; evidence retention/publication defaults; monitored-package persistence and deployment mode. Every item remains **PROPOSED — NOT YET APPROVED**. The research dossier may be saved, but no repository, product implementation, public analysis service, model installation, or notification should be created from this document alone.

Evidence limitations: Firecrawl credits were exhausted during research; remaining material checks used primary-page retrieval through the available web search service. No package corpus, model inference, user study, distribution compatibility matrix, or live organizer model-server test was run. Repository HEAD observations establish current visible state, not pinned-release compatibility or dependency security.
