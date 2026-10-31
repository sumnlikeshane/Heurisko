# Heurisko research baseline

Research date: 31 October 2026 (India). Status: research findings and proposed engineering direction; no implementation has begun and no founder hypothesis is approved by this document.

## 1. What problem Heurisko must solve

Heurisko should investigate the relationship between one precisely identified published package artifact and one precisely identified source revision. Its central output is an explanation supported by retrievable evidence: which content is identical, which differences have an established build or packaging explanation, which differences remain unexplained, and which observations merit security review.

This is a stronger responsibility than listing changed files. It is also a narrower claim than proving that software is safe. A package can faithfully reproduce malicious source, and valid provenance does not rule out malicious code. npm explicitly documents this limitation. [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)

### Authoritative organizer requirements

The supplied DOCX, **Problem 04**, requires retrieval of published packages from **npm or PyPI**, identification and retrieval of corresponding source, comparison of source and distributed contents, recognition of generated files and normal build artifacts, identification of suspicious modifications, explanations of individual differences, an evidence-supported risk assessment, and monitoring of selected packages for new releases. The expected deliverable is a working supply-chain verification tool. Supporting both registries is a product proposal, not an explicit requirement to ship both simultaneously.

The official evaluation uses recent genuine releases, where most differences are expected to be legitimate, and organizer-prepared tampered copies. Technical questions expressly include avoiding an ever-growing exception list, verifying provenance, supporting additional ecosystems without redesign, and monitoring automatically.

Slide 28 illustrates three observations: TypeScript source versus generated JavaScript, a newly added `postinstall` script, and an obfuscated file absent from the repository. These are examples of the expected investigation, not permission to classify every `dist/` file as benign or every new executable as malware. The slide requests explanation of every difference; unresolved differences must therefore remain explicitly visible rather than silently ignored.

### Event constraints that influence architecture

The supplied DOCX sections 4–6 and presentation slides 9–19 establish the following:

- A new, empty, public repository; the first commit contains only `HACKATHON.md`, with team, members, problem, product models and reasons.
- Every later change goes through a pull request, with model and coding-assistant disclosure, testing description and passing CI. The final scored revision must pass CI.
- Required artifacts include MIT or Apache-2.0 `LICENSE`, `README.md`, `.github/pull_request_template.md`, `.github/workflows/ci.yml`, and `examples/` with real input and actual generated output.
- Product models must be open-source or open-weight and do meaningful work. Slide 12 allows local execution or an organizer model server for Problems 1–7; its model list remains unannounced in the supplied slide. Closed model APIs receive zero in that scoring category and cannot run on keyless automated test machines. The founder's research brief additionally excludes closed cloud inference from Heurisko's architecture.
- Gemma-only and laptop-only disqualification rules belong to Problem 08. Heurisko is Problem 04; those restrictions must not be imported into its requirements.
- Public data only; no automated comments or issues on real projects; no secrets in the repository; each team member must understand the code.
- Teams have 1–4 members. The event runs 31 October–1 November, with repository link and initial commit due 8:30 PM, final scored repository frozen at 6:30 AM, and presentations beginning 8:30 AM. The pitch is eight minutes followed by four minutes of Q&A and two minutes of buffer. Times are stated by the event documents in their Sonipat context.

These event facts are preserved without using the 12-hour limit to reduce the intended product vision. Visual inspection confirmed that slide 19 itself contains literal `00` placeholders for weights and total. The full rubric therefore remains unknown. Separately supported values are open-model use up to 15 points (slide 12), PR workflow 10 points (slide 14), and a 100-point total with functional correctness 30 referenced by slide 33. The latter appears in the P08 section and should be confirmed for P04 before treating it as a recovered rubric. See the official-requirements ledger; do not infer the missing weights.

## 2. The source-to-package pipeline

### npm

An npm release is a packed artifact, not a repository checkout. `package.json` inclusion rules, `files`, `.npmignore`, automatic inclusions and exclusions, and workspace/package subdirectories determine which repository files enter the tarball. A repository can contain tests and TypeScript sources while distributing only generated JavaScript, declarations, metadata and licenses. [npm package manifest](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/)

Publication and packing can run lifecycle scripts. `prepack` runs before packing; `prepare` participates in preparation and can run when installing Git dependencies. Consequently, running `npm pack` on an untrusted repository is an execution decision, not a harmless download operation. Inspect registry archives directly for the static path; reserve package building for an isolated worker. [npm lifecycle scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/)

Registry version metadata supplies an artifact URL and integrity information. npm documents SHA-512 integrity over the tarball and verification on download. This establishes agreement with the registry-provided expected bytes; it does not establish that those bytes were derived from a reviewed source commit. Preserve both claims separately. [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) [npm registry metadata](https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md)

### PyPI

Treat **project + version + distribution filename + digest** as the artifact identity. A release can contain an sdist and multiple wheels, including platform-specific wheels. A wheel is a ZIP-based distribution with installable content and a `.dist-info` directory; `RECORD` lists files and their hashes, with specified exceptions. Native libraries can be legitimate wheel contents. A wheel is not generally expected to have the same layout as the Git tree or sdist. [wheel specification](https://packaging.python.org/en/latest/specifications/binary-distribution-format/)

A modern sdist is normally a `{name}-{version}.tar.gz` archive containing a top-level project directory, `pyproject.toml` and `PKG-INFO`. Other contents are not comprehensively prescribed by the format. Generated metadata, selected source files and build support files can therefore differ from a checkout. The standard also explicitly addresses dangerous tar extraction and escaping paths or links. [sdist specification](https://packaging.python.org/en/latest/specifications/source-distribution-format/)

PyPI's JSON API exposes distribution URLs and digests, but warns that upload-time metadata does not necessarily match the uploaded files and that later uploads do not replace the first release metadata. Heurisko must inspect the chosen distribution's own metadata instead of treating the project-level response as unquestionable source identity. The API documentation's example `sampleproject` release contains both wheel and sdist entries; this is a documented example, not a package independently tested in this research. [PyPI JSON API](https://docs.pypi.org/api/json/)

### Legitimate differences and the evidence needed

| Difference | Plausible explanation | Evidence that supports the explanation | Residual uncertainty |
|---|---|---|---|
| Repository tests, docs or configs absent | Packaging selection | Manifest/ignore rules and a computed file-selection comparison | A selection rule can also omit important security material |
| `src/*.ts` replaced by `dist/*.js` | Transpilation or bundling | Pinned build recipe/toolchain; source maps as supporting data; strongest support is a controlled rebuild | Directory names and source maps alone do not establish correspondence |
| Minified bundle differs substantially | Minifier/bundler transformation | Relevant source, tool/config/version, structural mapping and rebuilt output | Similarity is not semantic equivalence; hidden additions can survive |
| `PKG-INFO`, `.dist-info`, declarations or version file added | Build-generated metadata | Applicable package-format rules plus exact originating config/build step | Values can be changed independently or contain executable implications elsewhere |
| `.so`, `.pyd`, `.dll` or bundled shared library added | Native compilation/repair | Platform-specific recipe and controlled binary comparison | Compiler/toolchain and environment differences can prevent reproduction |
| Archive bytes differ but members match | Timestamp, ordering or compression variation | Raw archive hashes plus separate member-by-member hashes and metadata diff | The result is content agreement, not a byte-identical archive |
| Install script added or manifest entry changed | Release-time modification, legitimate or hostile | Exact before/after manifest and script body; traced build step if present | Execution permission is consequential; intent cannot be established from novelty alone |
| Binary/test asset exists only in release | Generated or packaged resource | Recipe, provenance and reproduction where feasible | Absence from Git is an investigative lead, not a malware verdict |

The table is an engineering interpretation of the package specifications and lifecycle documentation above. These categories are not blanket exceptions. Every file remains inventoried, and transformation evidence has a scope and confidence.

## 3. Establishing the correct source revision

Source selection is an evidence-resolution problem. Comparing a tarball against the current default branch can create entirely artificial discrepancies. Version names and Git tag names can coincide while referring to different content.

| Candidate signal | Proposed treatment | What it cannot establish alone |
|---|---|---|
| Valid artifact-bound provenance with source revision, accepted signer/builder and policy | Strong evidence of the stated relationship; preserve exact fields and verification material | Independent reproduction, review approval, or benign behavior |
| Trusted-publisher identity and certificate claims | Verify publication identity; inspect any revision claims in their actual semantics | A publish predicate is not automatically a full build recipe or build-equivalence statement |
| npm `gitHead` or release metadata naming a commit | Candidate revision; require commit retrieval and corroboration | Honest metadata or package/source equivalence |
| Signed Git tag/release pointing to a commit | Evidence of that tag's authenticated assertion; pin resolved commit | Binding of registry bytes to the tag |
| Version-shaped tag and manifest version | Search hint; retain all conflicting candidates | Unique identity, correct monorepo path, or unchanged tag |
| Declared repository URL / PyPI project URL | Candidate repository; canonicalize and cross-check | Ownership, correct fork, or the exact revision |
| File hashes, source maps or AST similarity | Content corroboration and mapping hints | Authentic authorship or a unique causal build origin |
| User-supplied repository + full commit | Explicit comparison target, with its source recorded | That the registry publisher claimed or used that target |

The strength assigned to each signal is a proposed policy, grounded in the distinction between artifact authentication and expected source/builder policy in SLSA. A cryptographically valid statement is insufficient when it comes from an unexpected fork or builder. [SLSA artifact verification](https://slsa.dev/spec/v1.2/verifying-artifacts)

Proposed resolution procedure: identify immutable artifact bytes; collect all source assertions; verify attestations against the actual digest and explicit trust policy; resolve a full commit and package subdirectory; inspect artifact and source manifests; record conflicts; use content corroboration without allowing it to override contradictory identity evidence. If a required commit is unavailable, or two credible signals disagree, return unresolved identity and still report the limited comparisons that were possible.

Monorepo subdirectories, submodules, Git LFS objects, generated release assets, missing commits, deleted/private repositories and retargeted tags must be visible completeness conditions. Do not quietly substitute another source revision. A maintainer-uploaded release archive and Git hosting's autogenerated source archive are distinct inputs, even when displayed together on a release page.

### Relevant prior research: PyRadar

PyRadar combines metadata retrieval, classification of potentially incorrect repository links, and Python-file hash queries against World of Code. Its methods and limitations sections were read in arXiv v1 (25 April 2024; the page identifies its FSE publication). The authors note dependency on index coverage/update delay and dataset representativeness. Its scope is repository discovery/validation, not proof of an exact artifact-producing revision. Heurisko can investigate these techniques as candidate generation while retaining its stricter evidence boundary; published metrics must not become Heurisko accuracy claims. Reuse remains conditional on code/license and infrastructure validation. [PyRadar methods and limitations](https://arxiv.org/html/2404.16565v1)

## 4. What standards prove

| Mechanism | Supported conclusion when correctly verified | Unsupported conclusion |
|---|---|---|
| Registry digest | Downloaded bytes match that registry/lockfile expectation | Reviewed source produced them |
| npm provenance | Authenticated statement linking an artifact to source/build context, plus publish attestation semantics | No malicious code, complete build hermeticity, or reproduction |
| PyPI Publish attestation | Exact distribution was published using a specified Trusted Publisher identity | Full source-to-binary equivalence |
| PyPI SLSA provenance | The predicate's authenticated source/build assertions, subject to policy | Universal coverage across all files/versions or benign behavior |
| Sigstore verification | Signature, signing identity and associated verification material satisfy the verifier's checks | The signed assertion is a complete or correct security analysis |
| in-toto Statement | A typed predicate is bound to identified subject digests | That every predicate has the same meaning or assurance level |
| SLSA verification | Artifact/provenance satisfies configured builder and source expectations at the evaluated assurance | Protection against every compromised trusted platform or malicious source |
| SBOM | Inventory/dependency information within the producer's declared scope | Source correspondence, absence of undisclosed code, or malware freedom |
| Reproducible rebuild | A specified recipe/environment reproduces the artifact, or a precisely declared content equivalence | Benign source, trustworthy compiler, or independence if evidence was merely replayed |

npm describes separate provenance and publish attestations and expressly disclaims a malicious-code guarantee. [npm provenance](https://docs.npmjs.com/generating-provenance-statements/) PyPI describes per-file signed digests and supports distinct publish and SLSA predicates. Its minimal publish predicate asserts publishing intent/identity and has an empty/null body. [PyPI attestations](https://docs.pypi.org/attestations/) [PyPI Publish v1](https://docs.pypi.org/attestations/publish/v1/) Its Integrity API returns provenance objects that bundle attestations and publisher identity for a specific filename; consumers must verify the individual attestations. [Integrity API](https://docs.pypi.org/api/integrity/)

Sigstore's verification examples require expected certificate identity and OIDC issuer. in-toto subjects match by digest. SLSA additionally requires comparison with expected canonical source, builder, `buildType` and external parameters; its documentation explicitly notes limitations concerning trusted build-platform compromise and incomplete dependencies. [Sigstore verification](https://docs.sigstore.dev/cosign/verifying/verify/) [in-toto Statement](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md) [SLSA artifact verification](https://slsa.dev/spec/v1.2/verifying-artifacts)

SBOM, repository posture, advisory scanning and update automation are complementary categories. They must not be used as proxies for the source/artifact relationship. Detailed tool comparisons and reuse decisions are in `HEURISKO_TOOLING_AND_REUSE.md`.

## 5. Real incidents and the engineering lessons

**XZ, March 2024.** Andres Freund's original disclosure states that one part of the backdoor occurred only in release tarballs, including a modified `build-to-host.m4` trigger, while maliciously used test assets were also present in the repository. This is not an npm or PyPI incident and does not imply that adding an XZ adapter is necessary for Problem 04. It demonstrates why a release archive must be compared with the correct source and why an apparently ordinary generated build file can be important. It also demonstrates why “all malicious code was absent from Git” would be inaccurate. [original disclosure](https://www.openwall.com/lists/oss-security/2024/03/29/4)

**color-string, September 2025.** The maintainer's advisory records an npm publishing-account takeover after phishing on 8 September 2025. Version `2.1.1` retained prior functionality while adding a browser-oriented cryptocurrency-redirection payload. This supports a threat model where a release passes ordinary functionality checks while carrying an unauthorized addition. It does not establish that a hypothetical Heurisko implementation would detect this incident; that requires a pinned historical artifact/source test. [maintainer advisory](https://github.com/Qix-/color-string/security/advisories/GHSA-286p-vc9p-p5qv)

The linked `debug` incident tracking page did not yield substantive issue content during retrieval, so its details are not used as independent evidence. No malicious package was downloaded or executed for this assignment.

## 6. Threat model and detection boundaries

The following is a proposed analytical threat model, not measured detection coverage.

| Threat / adversary capability | Observable lead and detection approach | Main limitation or plausible false alarm |
|---|---|---|
| Stolen publishing credentials; source unchanged | New release-only code/scripts; publisher/provenance discontinuity; source mismatch | Legitimate emergency manual release or changed release workflow |
| Manipulated release artifact after preparation | Raw digest mismatch, invalid attestation binding, unexpected file/manifest change | Comparison against wrong source/environment |
| Compromised CI with valid publisher identity | Unexplained generated output; independent rebuilding; unexpected builder/parameters | Correctly signed malicious build can defeat provenance-only checks |
| Malicious source maintainer | Dangerous changes visible in both source and artifact | Faithful reproduction will not expose a mismatch; complementary review needed |
| Misleading repo metadata / fork substitution | Conflicting identity claims; compare expected canonical repo policy | Projects can legitimately move or change forks |
| Moved/missing tag or unpublished commit | Resolved commit conflict, failed immutable-source retrieval | Incomplete evidence; do not label malicious by default |
| New install hook / executable | Exact manifest delta and script/static behavior evidence | Native packages and installers may legitimately use hooks |
| Obfuscated or bundled payload | Unexpected capabilities, new executable content, structural residuals | Minification, generated runtime shims and vendoring are common |
| Build dependency/toolchain compromise | Rebuild inconsistency or captured dependency evidence | Both builds may use the same compromised toolchain |
| Registry/channel compromise | Consumer-side expected hash/signature/policy verification | A compromised registry can supply fresh metadata; independent expectations matter |
| Dependency confusion / typosquatting | Package/source identity inconsistency and known policy | Name/repository legitimacy is not fully inferable from source equality |
| Untrusted archive/repo attacks on Heurisko | Reject traversal/escaping links; resource limits; no hooks/scripts in static stage | A parser vulnerability remains possible; static analysis still needs isolation |
| Model prompt injection in package text | Treat source/metadata as untrusted data; no tools/secrets/network for explanation | Schema-valid output can still be wrong; evidence checks and human review remain |

## 7. Evidence-driven comparison strategy

Recommended layers, in order of evidentiary strength and cost:

1. Preserve exact archive digests and inventory every entry, size, mode and content hash before any normalization.
2. Compare identical members and explicitly map packaging roots/subdirectories. Separate archive metadata differences from member-content differences.
3. Parse manifests, source maps and relevant language structures without running target code. Compute semantic-sensitive fields such as lifecycle scripts, entry points and dependencies as explicit deltas.
4. Explain transformations using actual configuration and observed evidence. Source maps, parser similarity and model suggestions generate hypotheses; neither is a blanket proof of generated-file legitimacy.
5. Where worthwhile and supported, obtain an existing independently verifiable rebuild result or perform a resource-constrained isolated rebuild with a pinned recipe and inputs. Record exact equality, member-content agreement and normalization-assisted agreement as different outcomes.
6. Retain unresolved residuals, unsupported file types, parser failures, timeouts and incomplete source retrieval. A skipped file must not disappear from the denominator.

Do not delete comments, normalize arbitrary strings or strip execution-relevant metadata before security comparison. A normalization rule can hide an attack; keep the raw view and record exactly what the rule removed. Do not make AST similarity a “semantic equivalence” guarantee. These are engineering safeguards derived from the attack model, not claims of a proven algorithm.

Avoid a single safety percentage. Independently report source identity, attestation validation/policy, comparison coverage, reproducibility status and findings. Confidence describes evidence quality; severity describes potential impact. A deterministic finding can establish that an install hook was added, while malicious intent remains unproven. AI explanations should cite evidence identifiers and never upgrade the underlying verification status.

## 8. Research conclusions, uncertainty and handoff

**Supported direction:** an evidence-centered shared engine with static analysis as the default, stronger optional rebuild evidence, multiple interfaces over the same report, explicit abstention, and a monitoring loop that reuses the same immutable-artifact analysis.

**Meaningful contribution to validate:** combine artifact/source identity resolution, scoped build explanations, residual-difference investigation and a usable evidence explorer. The existence of tools such as OSS Rebuild makes “we compare a package to Git” insufficient as a novelty claim. Distinctiveness must be demonstrated through measured investigative usefulness; see the tooling and verification documents.

**Still unproven:** source-matching accuracy on representative packages; false-positive behavior on legitimate generated output; coverage of native binaries and complex bundles; benefit of model explanations over deterministic explanations; performance and operating cost; organizer hidden-test compatibility. These require experiments after approval, not additional confident wording.

**Documentation-only limitations:** primary documentation, two primary incident records and relevant PyRadar paper methods/limitations were read. No package corpus was downloaded, rebuilt or executed; no benchmark, malware detection, version-specific attestation verification or model inference was performed. GitHub's `debug` tracking issue retrieval was incomplete. Firecrawl credits were exhausted after the primary documentation was collected; the optional PyRadar paper was read through the available web-search service. Registry-specific verification library compatibility, model selection, infrastructure and operational limits remain proposed decisions elsewhere in the dossier.

See `HEURISKO_TECHNICAL_ARCHITECTURE.md` for contracts, `HEURISKO_VERIFICATION_STRATEGY.md` for falsifiable tests, and `HEURISKO_FOUNDER_DECISIONS.md` for the approval queue.
