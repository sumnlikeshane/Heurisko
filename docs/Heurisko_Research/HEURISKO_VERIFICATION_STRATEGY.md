# Heurisko verification strategy

Status: **PROPOSED — NOT YET APPROVED**. Research snapshot: 31 October 2026. This is an evaluation and containment design, not a record of completed implementation or test results.

## 1. What must be established

The official Problem 04 requires retrieving a package and corresponding source, comparing them, explaining legitimate generated artifacts, identifying suspicious modifications, evidence-backed assessment, and monitoring selected packages. Its evaluation uses real releases with mostly legitimate differences and organizer-prepared tampered copies. Presentation slide 28 illustrates TypeScript compiled into JavaScript, an added `postinstall`, and an obfuscated file absent from the repository. These are evaluation directions; neither a new executable file nor minification alone proves malicious intent. Sources: supplied problem document, Problem 04; supplied presentation, slide 28.

The central test is whether Heurisko can separate **observed discrepancy**, **supported explanation**, and **remaining uncertainty**. Passing known-malware lookup or detecting every changed byte would not by itself solve that problem.

No corpus has been downloaded, built, labeled, or evaluated during this research. All accuracy, latency, memory, false-positive, and hardware measurements remain unknown. Proposed acceptance gates below must be run after implementation is approved.

## 2. Claim boundaries and report semantics

An artifact hash can establish that downloaded bytes match a recorded digest. It cannot establish that those bytes are benign. A rebuild can establish a relationship under recorded source, environment, instructions, and artifact scope. The Reproducible Builds definition explicitly includes all those inputs and bitwise artifact comparison. A mismatch is a reason to investigate the inputs and environment as well as possible tampering. [Reproducible Builds definition](https://reproducible-builds.org/docs/definition/)

Use independent status dimensions rather than a single security percentage:

| Dimension | Proposed values | Required interpretation |
|---|---|---|
| Artifact identity | `registry-digest-match`, `local-input`, `conflict`, `unknown` | Bind ecosystem, namespace, package, version, exact filename, registry origin, and digest. A locally modified tarball is `local-input`; its copied package manifest is not proof that it is the official release. |
| Source identity | `attested`, `corroborated`, `candidate`, `ambiguous`, `missing` | `attested` requires a verified, accepted predicate that actually binds the expected repository and commit to the exact artifact digest. A publishing identity alone does not establish this relationship. Preserve competing candidates. |
| Provenance verification | `verified`, `invalid`, `absent`, `unsupported`, `not-checked` | Also preserve `predicateKind`, verifier/version, verification reason, checked subject digest, expected identity, and independent `policyAccepted`. Cryptographic verification and acceptance by the user's policy are different. |
| Comparison summary | `byte-identical`, `normalized-equivalent`, `rebuild-matched`, `partially-explained`, `unexplained`, `not-comparable` | Keep individual comparison method runs. Normalized equivalence is not byte identity. A summary must not hide a failed exact comparison, unchecked files, or retained raw differences. |
| Completeness | `complete-for-declared-scope`, `partial`, `failed` | Declare analyzed files/bytes, excluded paths and reasons, parser failures, unsupported formats, network gaps, and budget truncation. Complete processing can still produce unexplained findings. It never means safe. |

Each finding must identify its category, affected artifact path and digest, source path/commit when available, original byte or line ranges, deterministic rule/method version, evidence IDs, severity, confidence basis, limitations, and suggested next verification. Explanation and policy decision must remain separate fields.

Severity describes potential consequence if the behavior is active; confidence describes support for a specific claim. Neither should be an unexplained model probability. A highly confident observation that a script was added does not imply high confidence that it steals credentials.

### Permitted strength of statements

| Evidence | Defensible statement | Statement to reject |
|---|---|---|
| Exact artifact digest matched registry metadata | These bytes match the registry's recorded artifact digest at the recorded observation | The registry release is safe |
| Added lifecycle command absent from resolved source | The distributed manifest adds this installation command | The publisher account was definitely compromised |
| Compiler output reproduced for a defined target | This generated output was reproduced under the recorded recipe | Every file in this release is verified |
| Similar AST or source-map correspondence | These regions are consistent with this transformation, subject to stated limits | The code is semantically equivalent in all executions |
| Valid publishing attestation | The stated subject and publishing identity passed the declared verification/policy checks | The package is free of malicious code, or its source was independently reviewed |
| No supported source association | Source relationship is unresolved | Absence of provenance proves tampering |
| Hash-equivalent malicious source and package | The compared content agrees | The package is trustworthy because it matches source |

Finding classes should distinguish observed additions/removals, manifest/lifecycle changes, exact-content differences, explained transformations, provenance problems, source ambiguity, unsupported content, and analysis failures. A global summary may prioritize findings, but must retain all dimensions and the underlying evidence.

## 3. Threat model

Assume attackers can control package contents, filenames, metadata, repository URLs, source-map files, build instructions, comments sent to the model, and some publishing or CI identities. Do not assume they control Heurisko's trusted verification policy, executable, or stored evidence. A separate operational threat is exploitation of Heurisko itself.

| Threat and attacker capability | Observable evidence and proposed detection | Limits and likely false positives |
|---|---|---|
| Compromised registry publisher issues a changed artifact | Exact digest capture, manifest/file differences against independently identified source, identity/provenance changes, historical comparison | Legitimate emergency releases may not have a matching tag. Content differences cannot identify who controlled the account. |
| Added npm lifecycle script | Parse manifest without executing it; compare scripts and command text; identify referenced executable files | Legitimate native builds use install scripts. Suspicion depends on unsupported divergence and behavior, not the script key alone. |
| Malicious generated output | Preserve raw hashes; compare/rebuild generated output; identify additions in otherwise mapped regions; inspect executable behavior statically | Minification and generated code are common. Similarity cannot prove complete semantic equivalence. |
| Compromised CI or build-time dependency | Check provenance subject and identity against policy; retain full recipe and build dependency pins; independently rebuild where feasible | Valid provenance can describe a compromised workflow. Rebuilding with the same compromised dependencies may reproduce harmful content. |
| Misleading source URL, wrong tag, moving tag | Corroborate repository ownership/origin, exact commit, package subdirectory and artifact version; snapshot tag resolution | Maintainer metadata and tags can be wrong without malicious intent. Matching version labels is weak evidence. |
| Monorepo or vendored code hides true origin | Inventory package subtree, included vendor files, declared build inputs and third-party licenses; record multiple origins | Vendor code can legitimately be absent from the package's own source subtree. One-repository matching is insufficient. |
| Malicious maintainer publishes harmful source and artifact together | Show agreement and any independently supported suspicious code behavior | Source/artifact agreement does not detect malicious intent. Broader code security review remains complementary. |
| Dependency confusion or lookalike identity | Preserve exact registry, namespace, dependency selector and lockfile resolution; flag unexpected origin changes | Heurisko cannot infer an organization's intended internal package identity without policy. Reputation or popular-name matching is not authorization. |
| Obfuscated extra executable payload | Identify unexplained executable addition, decode only under bounded static analysis, retain actual call sites | Obfuscation can be legitimate IP protection or bundling. No universal malware verdict is justified. |
| Archive path traversal, link escape, overwrite, device entry | Inspect archive entries, reject unsafe extraction, track duplicate/colliding paths, never honor device metadata | Rejecting an archive means analysis is blocked, not that malware was proved. |
| Decompression/parser resource attack | Stream with file-count, expanded-size, per-entry, depth, CPU, memory and wall-clock limits; bound nested parsing | Large legitimate packages can exceed limits. Report the exact coverage gap. |
| Repository or build instructions execute on analyzer host | Static source-object retrieval first; isolated worker for any approved build; disable ambient hooks/configuration | Dependency installation and metadata generation can execute code even when a user thinks they are only fetching a package. |
| Source URLs become SSRF requests | Registry/repository adapters plus destination policy, validated resolved IPs and checked redirects; isolate fetcher | Unusual legitimate hosts require explicit policy support; arbitrary URL acceptance is unsafe. |
| Model prompt injection in source or metadata | Treat all content as data, give model no execution/network/secret permissions, enforce evidence/schema checks after generation | Prompt delimiters and deny lists are not security boundaries. Plausible but unsupported interpretations still require review. |
| Cache/report poisoning or cross-user leakage | Content-address raw inputs; bind tool/policy versions; tenant isolation; authenticated mutations; report integrity checks | Hashing does not authenticate source identity or authorize cross-user access. |

These controls are proposed engineering responses. The relevant archive, network, execution and model limitations are documented in the primary references below; they are not assertions that a future implementation already meets them.

## 4. Static inspection and execution boundary

### 4.1 Default static path

Fetch registry metadata and exact artifact URLs through controlled adapters; verify recorded digests; inspect bytes without installing the package. Read manifests, archive inventories, source blobs, attestations, build configuration and source maps as untrusted data. Do not import Python modules, load JavaScript entrypoints, invoke package lifecycle hooks, run project linters, or resolve package-defined build metadata on this path.

Avoid wrapping an install command and calling it a static scanner. npm's `ignore-scripts` suppresses package scripts generally, but explicitly invoked `npm run`, `npm test`, and similar commands still execute the requested script. [npm config](https://docs.npmjs.com/cli/v11/using-npm/config/#ignore-scripts)

Python source builds invoke a project-chosen build tool. pip's security policy distinguishes downloading/unpacking wheels from building source, and notes that installed package code can later execute in the environment. Therefore use registry file retrieval rather than a source-build-capable package manager as the general acquisition primitive. [pip security policy](https://github.com/pypa/pip/security)

### 4.2 Archive handling requirements

Prefer a virtual inventory over extraction where possible. When materialization is needed, create a fresh private directory, permit only supported regular files/directories, and reject absolute paths, traversal, links, device nodes and ambiguous path collisions. Preserve original names and modes as evidence separately from safe local filenames. Do not silently normalize an unsafe path into an apparently benign one.

Inspection must account for duplicate entries, case-insensitive collisions, mixed separators, control characters, maximum path lengths, declared versus actually emitted size, and nested compression. Stop on actual emitted-byte/file/time limits, not just attacker-controlled header sizes. Do not unpack archives recursively by default. All limit values must be explicit in the policy and benchmarked before release; this research does not invent approved operational defaults.

Python's archive documentation specifically warns that extraction filters do not solve every risk, recommends fresh directories and resource limits, and discusses duplicates and filesystem collisions. The proposed requirements apply regardless of the implementation language. [Python tarfile extraction guidance](https://docs.python.org/3.14/library/tarfile.html#extraction-filters)

### 4.3 Repositories and source retrieval

Prefer immutable provider source archives or Git object reads at a captured commit, with the same archive protections. If Git is required, run a patched, pinned tool in a controlled environment without user/system configuration or credentials, avoid checkout and submodule recursion by default, disable executable hooks, and permit only declared transport schemes. Treat LFS pointers and submodule references as unresolved inputs until independently acquired and pinned.

Git documents that hooks are executable programs, their location is configurable, templates can copy hooks during initialization, and post-checkout can run after clone. This does not mean every repository's tracked hooks automatically run on clone; the control must cover the analyzer's environment and templates as well as repository operations. [Git hooks documentation](https://git-scm.com/docs/githooks)

### 4.4 Rebuild workers

Rebuilds are a privileged capability relative to static inspection, because arbitrary build code runs. Provide them through a disposable isolated worker with a separate job identity and no host credentials, SSH agent, Docker socket, home directory, private source, or shared writable project directory. Pin worker image, architecture, runtime/compiler, lockfiles, dependency bytes, environment, build command, and output selection. Export only bounded outputs and redacted logs after worker termination.

Separate fetching dependencies from executing them. A controlled fetcher may stage pinned dependencies; the build worker should then have egress disabled. If the recipe genuinely requires network, classify it as non-hermetic and use an explicit restricted fetch capability, never ambient internet. Cap CPU, memory, disk, processes, output/log bytes, wall time and concurrency. Kill the entire job and clean its workspace on timeout, cancellation or failure.

gVisor provides an additional Linux application-kernel isolation boundary and documents its limits: it does not protect everything reachable inside the sandbox or all side-channel behavior. Run separate customer jobs in separate sandboxes; mounts and network permissions remain security decisions. A disposable VM/microVM is an alternative where a stronger host boundary or compatibility is required. A plain container alone should not be represented as sufficient justification for hostile multi-tenant execution. [gVisor security architecture](https://gvisor.dev/docs/architecture_guide/intro/)

Platform support must be tested: the shared analysis engine can run on a Mac while an isolated Linux worker runs in a VM or remote service. Do not claim that Linux sandbox tooling runs natively on macOS or that native wheels can be rebuilt for every target on one host.

### 4.5 Network, privacy and model isolation

Server requests must enforce an allowlisted adapter/policy, destination IP checks after DNS resolution, connection to the validated address, TLS hostname checks, and redirect revalidation. Block private, loopback, link-local and cloud metadata destinations unless a deliberately scoped deployment requires them. Include IPv6, DNS rebinding, retries and alternate addresses in the tests. [OWASP SSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

The model receives bounded evidence excerpts with stable IDs, not tool authority. Its output cannot trigger builds, shell commands, fetching, severity escalation, report mutation or external messages. Validate cited IDs/ranges and permitted categories deterministically, but recognize that valid references alone do not establish that a claim follows from the evidence. Render code, filenames and model text as escaped text; strip terminal control effects; do not render package-supplied HTML or remote report images automatically. OWASP cautions that prompt wording alone does not create an instruction/data enforcement boundary. [OWASP prompt injection guidance](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html)

Event evaluation uses public data. Private repositories and confidential package uploads require a separate approved policy before support. Hosted raw artifacts, source excerpts, logs and report sharing must have explicit retention, deletion, access and abuse policies; none is approved here. Content addressing is a deduplication mechanism, not permission to disclose another user's bytes.

## 5. Ground-truth corpus design

Keep four separate strata. Do not mix their labels into an impressive combined accuracy number.

| Stratum | Material | Valid ground truth |
|---|---|---|
| Real release correspondence | Exact public registry artifacts plus captured source candidates and release/build records | Independently reviewed source association and file-level transformation evidence; an ordinary-looking release is not automatically clean |
| Controlled benign transformations | Small public-source fixtures built with recorded compiler/bundler/package recipes | Known source, build inputs and outputs; expected addition or transformation labels |
| Controlled tampering | Local copies mutated after a known baseline build | Exact mutation manifest and affected evidence ranges; demonstrate detection of these modifications, not arbitrary malware detection |
| Uncertainty and failure | Missing source, ambiguous tags, unsupported binaries, invalid/absent attestations, timeouts, offline and malformed inputs | Correct abstention, preserved partial results, no false verification or silent omissions |

### 5.1 Verified candidate inventory, not an executed benchmark

The PyPI project pages inspected during research list `packaging 26.3` with an sdist and a universal wheel, and `MarkupSafe 3.0.4` with an sdist and multiple platform wheels. These are useful intake candidates for pure Python and native-artifact cases respectively. The inspected packaging page also presents a publishing commit and provenance. This is metadata availability evidence only; Heurisko has not fetched the bytes, verified those attestations or reproduced those releases. [packaging on PyPI](https://pypi.org/project/packaging/) [MarkupSafe on PyPI](https://pypi.org/project/MarkupSafe/)

For npm, qualify public projects with TypeScript output, a bundled/minified package, a monorepo package, and an install-script-bearing native package. `zod` and `typescript` are candidate names, not prevalidated examples: their npm website pages returned HTTP 403 during this investigation, and artifact/version qualification remains open. Select exact versions through permitted registry metadata after approval, capture their raw metadata and artifact digest, then review source identity and transformation evidence before assigning expected labels.

For recency, record actual publication dates and include a declared recent-release window chosen at corpus collection; do not call an older pinned fixture recent just because it was downloaded today. Keep historical fixtures for stable regressions alongside separately labeled current releases.

### 5.2 Required case families

1. TypeScript to JavaScript; declaration generation; source maps; CommonJS/ESM variants.
2. Bundling, minification, vendoring, license aggregation and generated version metadata.
3. Packaging exclusions, renamed roots, docs/tests omitted, file modes and archive timestamps.
4. Python source tree to sdist, sdist to pure wheel, wheel metadata/RECORD, native wheel that the current worker cannot rebuild.
5. Added or changed lifecycle script and its referenced local file; new executable; changed command destination; added import/require in a legitimate bundle.
6. Obfuscated addition in an existing file, manifest entrypoint change, dependency addition, deletion of an expected source file.
7. Correct version tag in the wrong repository; mutable or missing tag; multiple plausible commits; monorepo wrong subtree.
8. Missing, invalid, unsupported and valid-but-policy-rejected attestation; subject digest mismatch; valid publishing identity without source-build binding.
9. Intact source and artifact containing the same deliberately harmful test pattern, to ensure agreement is never presented as benignness.
10. Path/link/duplicate/collision/decompression attacks; corrupt formats; parser timeout; poisoned model comment; source-map lie; SSRF metadata URL.
11. Registry/source outage, rate limit, offline cached replay, partially downloaded artifact, stale cache, cancelled job, report export/reimport.
12. Release monitoring: new version, duplicate event, restart after failure, changed artifact identity, yanked/deleted release, backoff and partial analysis. Basic selected-package monitoring is an official requirement; advanced hosted alert channels can follow later.

### 5.3 Fixture manifest and label process

Each fixture needs ecosystem/name/version, exact artifact filename and URL, original digest, captured registry metadata and timestamp, source repository/commit/subdirectory evidence, source archive digest, build recipe/environment/dependency digests, licensing/redistribution decision, expected findings and explanation spans, and known uncertainty. A wheel's platform/ABI tags form part of its identity.

A mutation additionally records parent artifact digest, independent mutated digest, mutation seed/recipe, affected paths/ranges, intended detection class, and a clear synthetic-local label. If a copy retains the original filename/version, the report must still show that it is not the registry artifact. Never upload tampered fixtures to public registries or accuse the original maintainer based on a local mutation. Use inert markers and reserved test destinations, not operational exfiltration payloads.

Separate the oracle from analyzer configuration. Source resolvers must not consult fixture labels, mutation manifests or expected verdicts. Human reviewers should label legitimate transformation explanations and source identity independently of model output; resolve disagreement explicitly. Split evaluation by package family and release chronology, so one package's template or mutation family is not both the tuning set and the purported independent test.

## 6. Measurable evaluation

Report counts and denominators, per ecosystem and transformation family. A small curated demonstration corpus is a case study, not a population estimate.

| Measure | Definition and reporting rule |
|---|---|
| Mutation finding recall | Seeded security-relevant mutations correctly identified and localized / all seeded security-relevant mutations. Count abstained or unprocessed mutations separately and also in the full-denominator missed count. |
| Suspicious-finding precision | Correctly supported suspicious findings / all findings labeled suspicious, on a corpus with reviewed ground truth. A package-level hit cannot validate every finding within it. |
| Benign difference false-positive rate | Reviewed legitimate difference units incorrectly labeled suspicious / all reviewed legitimate difference units. Also report packages with at least one false suspicious alert / reviewed benign packages. |
| False-negative rate | Undetected seeded mutation units / all seeded mutation units; show which were skipped, misexplained as expected, or missed despite processing. |
| Expected transformation explanation precision | Human-validated correct explanations / all explanations asserted as expected; report exact/rebuilt evidence separately from heuristic/model support. |
| Explanation coverage | Correctly explained reviewed legitimate differences / all reviewed legitimate differences; show unexplained and excluded counts. |
| Source matching precision | Correct exact commit/subtree associations / all asserted source associations; report attested, corroborated and candidate tiers separately. |
| Source matching coverage | Releases with a correct established association / all corpus releases. Missing source is a coverage gap rather than a forced guess. |
| Evidence validity | Findings whose cited IDs, paths, hashes and ranges exist / all findings; separately review whether cited evidence supports each claim. Existence is not entailment. |
| Abstention | Cases/difference units classified unresolved or not comparable / all relevant cases/units, with reason distribution. Show selective precision alongside full-denominator coverage/recall. |
| Analysis completeness | Processed files/bytes and applicable methods / declared eligible scope; report parser errors and skips separately. Byte coverage is not semantic security coverage. |
| Runtime and resources | End-to-end and per-stage wall time, peak memory, bytes fetched/expanded, CPU, cache use, model tokens and worker time; cold/warm results separately. |
| Reproducibility | Identical deterministic findings/evidence for repeated pinned input/policy/tool runs; model output stability reported separately. |
| Monitoring outcome accounting | Artifact identities with a completed analysis or explicit failure / all observed selected-package artifact identities. This measures accounted-for outcomes, not success; report pending/unseen-state limitations separately. |
| Monitoring analysis success | Successfully analyzed artifact identities / all observed selected-package artifact identities. Report acquisition/source/analysis failure rates, queue and end-to-end delay, duplicate rate, late artifacts on existing versions, and restart recovery separately. A fully accounted failed job is still a failure. |

Zero observed errors on a finite corpus is not proof of zero future errors. Publish raw case counts, uncertainty intervals where appropriate, held-out split definitions, exclusions and labeling disagreements. Do not mix unknown real-world maliciousness with controlled mutation labels.

### 6.1 AI contribution evaluation

Use a paired ablation on the same held-out evidence: deterministic baseline; baseline plus specialized static checks; baseline plus grounded model explanation; combined pipeline. Freeze input evidence and pin model identifier, weight digest, quantization, runtime, prompt/schema version, decoding parameters, token limit and availability outcome.

Measure correct explanation coverage, unsupported claims, incorrect expected-transformation explanations, cited-evidence entailment, human triage time, and inference cost/latency. Count hallucinated files, false completed-verification claims and prompt-injection compliance as distinct failure categories. Have reviewers judge without seeing the variant where practical. Establish thresholds from validation data before reviewing held-out results; this research supplies no invented accuracy target.

The model may propose a transformation or further check. Only an independent deterministic operation can promote that proposition to an observed verification result. Failure or absence of inference must leave the deterministic report usable and mark explanation coverage accurately; the hackathon's meaningful-model requirement still requires demonstrating real model work in the submitted system.

## 7. Test layers and release gates

| Layer | Required evidence before claiming completion |
|---|---|
| Pure functions and parsers | Known-answer hashing/inventories/manifests, immutable input preservation, range accuracy, deterministic normalization rules; no ignored executable content |
| Resolver/provenance | Exact subject and policy checks, ambiguity preservation, wrong-subtree/tag and unsupported-predicate cases |
| Archive and rendering adversarial tests | No writes outside work area; resource limits enforced; duplicate/collision decisions explicit; terminal/browser output cannot execute supplied content |
| Component integration | A real acquired artifact and captured source pass through acquisition, comparison, evidence and export without fixture-oracle access |
| Build worker | No credentials or forbidden mounts; egress blocked; timeout/cancellation kills whole job; bounded exports; repeatable recipe; hostile test stays contained |
| End-to-end user paths | CLI, web and later TUI display the same stored report ID/evidence/status; offline report viewing does not imply a fresh remote check |
| Monitoring | Persistent cursor, idempotent jobs, all version observations retained, restart/backoff and explicit failure states |
| Model contract | Real open-weight inference demonstrably invoked; grounded IDs checked; malicious source instructions cannot gain tools; uncertain claims stay uncertain |
| Evidence package and CI | Public, licensed fixture material; real generated outputs; CI passes on final submitted commit; integration checks identify network/model assumptions |

Release blocking correctness conditions should include fabricated evidence IDs, wrongly verified digests/source bindings, silent analysis truncation, host execution through the static path, cross-tenant access, and UI disagreement about report facts. Fixture detection/false-positive performance gates need founder-approved thresholds after validation; no such thresholds are approved yet.

Separate hermetic offline CI fixtures from live registry compatibility checks. A network outage should not invalidate deterministic fixture tests; an offline fixture suite must not be described as a completed live-registry test. Similarly, CI should distinguish a model-contract test double from a separately demonstrated real model inference test.

## 8. Reproducible evidence bundle

Bundle the canonical report, raw acquisition metadata, artifact/source digests, immutable source revision, provenance material and verification policy, raw and normalized inventories, retained diffs/method records, engine/rule/parser versions, build recipe/log/output identities, model metadata/explanations, and all exclusions/errors. Preserve raw bytes when licensing/access policy allows; otherwise record retrievable identity and the limitation.

Give deterministic analysis its own identity derived from immutable inputs plus policy/tool versions. Keep observation timestamps and model generation IDs outside the deterministic comparison identity, while retaining them in the report. Replaying cached evidence must show observation time and freshness; it must not impersonate a new registry/provenance lookup. Store a new report when tools, policy, source candidates or input bytes change.

## 9. Proposed eight-minute demonstration

These are planned scenarios. None represents a completed test or fabricated output.

| Time | Action and visible evidence | Claim made |
|---|---|---|
| 0:00–0:45 | Show source versus installed artifact and the exact package/version/digest selected | Reviewing a repository does not alone identify distributed bytes |
| 0:45–2:00 | Analyze a qualified real release in CLI; open the same report in browser | Capture exact identity, source evidence and declared scope; expose any missing evidence immediately |
| 2:00–3:15 | Drill into a legitimate generated difference; show compiler/build mapping or reproduced output and raw remaining differences | Explain an ordinary transformation with the actual strength of evidence |
| 3:15–4:45 | Judge selects an inert mutation or path after baseline; analyze the newly hashed local copy; show added script/import/hunk and supporting evidence | Detect a fresh artifact divergence without hardcoded fixture verdicts |
| 4:45–5:45 | Supply ambiguous source or an unsupported native artifact; show abstention and incomplete stages | The tool refuses to invent a source relationship or verification result |
| 5:45–6:30 | Show grounded open-weight model explanation, evidence links and model/runtime identity; contrast the deterministic observation | AI performs real explanatory work while evidence owns the claim |
| 6:30–7:15 | Show a selected-package monitor ingest a new test-registry release, restart cursor and queue/report state | Basic release monitoring works; distinguish test feed from an actual new public release |
| 7:15–8:00 | Export report/bundle, replay offline and show architecture/limits plus real evaluation counts when available | The investigation is inspectable and repeatable within stated scope |

For anti-hardcoding, use a judge-chosen package from a qualified supported class, a judge-chosen inert mutation seed/path, visible before/after artifact digests, and a clean analyzer process without expected-label access. A live external package may reveal an honest unsupported case; have recorded exact-input replays for network reliability, clearly labeled as replay. UI animations must correspond to actual job events; cached results must show their cache status.

CLI is clearest for exact inputs, job progress, hashes and machine output. Browser is clearest for a file tree, side-by-side diff, transformation evidence and provenance relationships. A TUI is useful if implemented, but adds no evidentiary strength merely by resembling Lazygit. Preserve time for the actual comparison rather than spending it on landing-page navigation.

## 10. Likely judge questions

| Question | Evidence the team should show |
|---|---|
| How do you know this is the right source commit? | Ranked source evidence, expected repository identity, exact digest binding if available, subtree selection and unresolved candidates |
| Why is a generated file expected? | A precise mapping/recipe, supporting source/configuration and output match; otherwise label it inferred or unresolved |
| Why is this difference suspicious? | Exact added behavior or unsupported divergence, severity basis and limits; avoid claiming intent from a filename |
| What does valid provenance prove? | Verified subject/predicate/identity and policy result, plus explicit distinction from benignness or independent rebuild |
| Can it catch malicious code already in source? | Show that matching source is not a safety verdict; describe complementary behavior/static tools and their scope |
| What happens with nondeterministic builds? | Raw mismatch, environment/normalization records, retained unexplained regions and abstention; no universal timestamp suppression |
| Are results hardcoded? | Fresh judge-selected mutation, newly computed digests and runtime evidence; separate hidden oracle from analyzer |
| What exactly does AI add? | Paired explanation examples, model identity and grounded evidence; later ablation data rather than unsupported accuracy claims |
| How do you safely rebuild malware? | Concrete worker configuration, no host secrets/mounts/egress, resource enforcement and adversarial containment test results |
| Does it support all of npm and PyPI? | Declared adapter, artifact, parser and platform coverage matrix, with native/unsupported and partial-result examples |
| What are the false positives? | Reviewed case counts and legitimate-difference alert rate; show abstentions separately |
| How does monitoring recover? | Durable observations/cursor, idempotent job keys, retry outcomes and explicit missed/failed observations |

## 11. Outstanding decisions and research limits

1. Approve the evidence/status contract and policy separation before UI labels or exit-code policy are finalized.
2. Qualify exact npm releases and complete artifact/source/provenance capture for all real corpus candidates.
3. Benchmark supported build recipes and isolation on available hardware; choose a worker boundary and operational limits before executing unknown builds.
4. Approve validation/held-out splits and performance thresholds after baseline measurement; no detection or accuracy target is verified today.
5. Select AI weights/runtime and run entailment, injection and ablation tests; schema-valid output is insufficient.
6. Approve hosted retention/access and deletion policy before adding private uploads or public report sharing.
7. Confirm organizer-tampered artifact input format and supported ecosystem expectations; local-artifact analysis is necessary even when registry lookup is available.

The source investigation read primary archive, execution, network, sandbox and model-security guidance. Shared Firecrawl credits exhausted during follow-up research; remaining targeted public-document reads used the available web search service. No permission or access barrier was bypassed. The npm website's 403 responses and all unexecuted empirical work are recorded as limitations, not successful verification.

Related documents: [technical architecture](HEURISKO_TECHNICAL_ARCHITECTURE.md), [research baseline](HEURISKO_RESEARCH_BASELINE.md), [tooling and reuse](HEURISKO_TOOLING_AND_REUSE.md), [implementation roadmap](HEURISKO_IMPLEMENTATION_ROADMAP.md), and [founder decisions](HEURISKO_FOUNDER_DECISIONS.md).
