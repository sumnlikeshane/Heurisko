# HEURISKO — Phase 04: Evidence & Trust Rules

**Version:** 0.1.0  
**Date:** 31 October 2026  
**Status:** APPROVED — P4-01 through P4-12 confirmed by Shane on 31 October 2026  
**Depends on:** Approved Phase 01 v0.2.0, Phase 02 v0.2.0, Phase 03 v0.1.0  
**Owners:** Shane (identity, provenance, deterministic evidence, reporting), Malhar (explanation evidence, AI constraints); joint sign-off  
**Scope note:** This is *founder decision-review Phase 04*, not engineering roadmap milestone P4. It specifies trust semantics, not an assertion that verification is already implemented.

## Objective

Define what the analyzer knows, how it knows it, what it is permitted to conclude, and how CLI/TUI/web users inspect the supporting evidence. Keep artifact integrity, claimed source, trusted provenance, build correspondence, suspicious observations, and analysis completeness independent. **Neither a matching digest, a valid attestation, a reproduced build, nor a favorable AI explanation establishes that a package is universally safe.**

## P4-01 — Investigation identity and artifact integrity

**Recommendation: Bind every investigation to the exact analyzed bytes.**

- Registry input is an exact ecosystem, package, version **and specific artifact** (npm tarball today; extensible to multiple distributions for PyPI).
- Preserve original registry metadata, retrieval time, URL/filename, registry expected integrity value where available, and observed cryptographic digest(s).
- Distinguish **download integrity against registry expectation** from **relationship to source**. Passing the former cannot establish the latter.
- A digest mismatch is a transport/integrity failure with recorded observations, not an ordinary source-vs-build difference.
- For a supplied local archive, calculate its own identity and mark it `local/user-supplied`. Never reuse provenance or verified registry integrity from the unmodified package unless the attestation explicitly binds the actual local bytes.
- Record retrieval and comparison scopes; never imply that an entire package version, all dependency artifacts, or all platforms were verified when only one archive was analyzed.

**Display promise:** “These are the precise bytes evaluated; this is how their identity was established or left unresolved.”

## P4-02 — Source candidate resolution and conflict policy

**Recommendation: Source identity is an evidence-weighted association, not a tag guess.**

- Collect candidate repositories, full Git commits and package subdirectories, plus *why* each was selected (provenance source claim, registry `gitHead`, repository link, signed tag, version tag, user override, content corroboration).
- Require an immutable full commit ID before calling a particular source snapshot retrieved. Preserve monorepo subdirectory, missing submodules/LFS and inaccessible source objects as analysis-scope conditions.
- A version-shaped tag, default branch, source-map reference or package metadata field alone is a **candidate signal**, not proof that the publisher used that revision.
- Distinguish `publisher-linked/verified-under-policy`, `corroborated candidate`, `user-selected comparison target`, and `unresolved/contradictory association` as separate **descriptive roles**, not an unqualified “source verified” flag.
- If credible source signals conflict, show the conflicting candidates and reasons. Do not silently select the convenient one or use file similarity to cancel contradictory provenance evidence.

**Display promise:** “This is the source we compared, why we selected it, and whether it is proven to be the publisher's claimed source.”

## P4-03 — Provenance verification and explicit trust policy

**Recommendation: Verify both the cryptographic assertion and its relevance to expected identities.**

- Retrieve attestation/provenance material where available; retain the original statement, subject digest, claimed source, builder/workflow, signing identity/issuer, verifier version and verification time/policy.
- Check that any signature/attestation is bound to the **observed artifact digest**, and assess source/builder/issuer against an **explicit expected-identity policy** where one is available.
- Keep separate outcomes: `accepted under configured policy`, `cryptographically valid but expected identity not established`, `policy mismatch`, `invalid/broken verification`, `absent`, `not checked` and `verification incomplete`. Actual field/enum naming will be frozen in Phase 04 implementation contracts.
- Never derive the entire expected trust identity solely from the same untrusted metadata being verified.
- Record whether a statement is a publish attestation or an assertion of build provenance; their claims are not interchangeable.
- “No provenance found” does not by itself mean malicious. “Valid provenance” does not imply benign code or that independent reproduction succeeded.

**Display promise:** “What the attestation proves, which trust policy was applied, and what it does *not* prove.”

## P4-04 — Raw comparison and build-explanation rules

**Recommendation: Raw differences are authoritative observations; explanations require their own evidence.**

- Inventory archive entries and source files including exact content hashes, paths, sizes, file type and execution-relevant metadata. Keep raw archive identity distinct from per-member content identity.
- Preserve added/removed/modified/unchanged items and meaningful manifest/script/entrypoint changes even when a normalized display is available.
- Never automatically ignore `dist/`, declarations, minified files, generated metadata, native files, or packaging exclusions solely because of their filenames or paths.
- A packaging rule, build config or source map can support an explanation; it does not establish complete source-to-artifact equivalence by itself.
- Independent rebuild evidence may support a precisely scoped transformation claim only with recorded artifact/source, recipe, toolchain, environment and matching criteria; byte-identical, member-identical and normalized-only matches are different claims.
- Do not hide residual differences or permit normalization to erase security-relevant evidence. Unexplained changes stay visible.

**Display promise:** “Here are the raw differences and the exact level of support for any claimed explanation.”

## P4-05 — Evidence types and statement strength

**Recommendation: Assign evidence strength to individual claims; never collapse unrelated types into one universal ladder.**

| Evidence | What it can support | What it does not establish |
|---|---|---|
| Exact digest / file-byte comparison | Exact identity or difference **within its stated scope** | Proven author/source, security harmlessness |
| Verified provenance under expected identity policy | Authenticated artifact-bound statements about a source, publisher or builder | Independent rebuild or lack of malicious behavior |
| Independently verified rebuild result | A particular recipe/toolchain reproduced declared bytes/content | Trustworthy source or universally equivalent behavior |
| Pack rules, build config, source maps, AST/structural relationships | A scoped explanation or correspondence hypothesis | Automatic verified equivalence |
| Model explanation with valid references | A cited hypothesis, alternatives and useful questions | A verified causal explanation, provenance or security verdict |
| Missing/conflicting/skipped evidence | A limitation that must be disclosed | Evidence of maliciousness on its own |

Source identity, artifact integrity, correspondence, provenance and risk are **orthogonal**. Each conclusion carries its own references, method and qualification.

## P4-06 — Observations, risk and confidence

**Recommendation: Deterministic facts and impact assessments remain separable.**

A finding should carry at least:

1. **Observed change:** e.g. a `postinstall` field is newly present in the supplied artifact.
2. **Potential consequence:** the script may run during dependency installation under relevant conditions.
3. **Severity / review priority:** relative human-review importance with a reason, using the Phase 02 vocabulary (High, Medium, Low, Informational, Undetermined) where applicable.
4. **Evidence confidence:** strength supporting that *particular* observation or explanation—not probability that the package is malicious.
5. **Relationship/explanation status:** exact, reproduced, supported but unreproduced, hypothesized, unresolved or unsupported, in precise claim-specific terms.
6. **Limitations and next action:** what would strengthen or refute the concern.

Rules: a missing provenance statement is not itself a high-severity attack; a high-priority finding is not “malware confirmed”; and evidence of an executable addition does not prove that it executed. No composite package safety score or fabricated probability.

**Later detail:** Specific scoring thresholds and priority rules will be evaluated against Phase 03 fixtures before any quantitative claims.

## P4-07 — Evidence ledger, stable references and inspectability

**Recommendation: Every displayed claim has a dereferenceable evidence trail.**

- Report records use stable claim/finding IDs and evidence IDs, e.g. `F-001` and `E-012`, whose target remains stable inside a saved report.
- Evidence records contain type, source/origin, capture time or snapshot, artifact/source identity, digest where applicable, original file/metadata path, bounded span/location, collection/verification method, tool version and relevant limitations.
- Show actual raw bytes or safely escaped text and exact locations when preserved; when evidence is not retained, explicitly mark the reference unavailable rather than creating a dead “proof” link.
- Provenance/verification records, archive-member comparisons, source metadata, rebuild results and generated observations must each be independently inspectable.
- All human/JSON/TUI/web claims resolve to the same record. Evidence IDs alone are not sufficient: the cited content must actually support the claim.
- Separate observed facts from user-provided assertions and generated test-fixture labels.

## P4-08 — AI trust boundary and validation

**Recommendation: RAG is an evidence-interpreter, not an authority over verification.**

- Malhar's adapter receives bounded, explicitly marked untrusted evidence selected from the deterministic report. Package content/comments/metadata are never instructions to the model or application.
- Model output is a *separate interpretation object*: explanation, cited evidence IDs, alternatives, missing evidence, recommended checks and abstention where appropriate.
- Reject unknown IDs, nonexistent paths/spans, schema-invalid values and model claims that verified a signature/build/identity without corresponding deterministic evidence.
- Structural citation validity is not factual entailment: explanations remain labeled as model hypotheses until independent verification supports a stronger specific claim.
- No model-initiated shell, install, network, filesystem-write or build tools; no closed inference fallback.
- On model failure/rejection, keep deterministic findings and record the reason. Record model/runtime, prompt version, generation configuration and referenced evidence scope.

## P4-09 — Completeness, abstention and negative conclusions

**Recommendation: Never silently convert missing evidence into successful verification.**

- Each pipeline stage carries explicit status: completed, skipped/not applicable, unavailable, failed or incomplete (final enum names to be frozen in code contracts).
- Report analyzed, skipped and unsupported file/byte scope; explain parser failures, missing sources, failed attestation checks, unrun rebuilds and missing AI separately.
- Source conflict → unresolved source association; missing provenance → provenance unavailable; unsupported native binary → unsupported content; timeout → limited analysis. These are not interchangeable verdicts.
- “No security-relevant change found **within the analyzed scope**” may be reported only with its coverage and limitations; “package is safe” may not.
- A user can inspect the useful completed work even when the full investigation is incomplete.

## P4-10 — Overall outcome and decision support

**Recommendation: The top-level report is a structured state summary, not a binary security verdict.**

Show independent status dimensions:

1. Artifact identity/integrity.
2. Source-association strength/conflicts.
3. Provenance assertion and trust-policy validation.
4. Source-to-artifact correspondence and unexplained residuals.
5. Security-relevant findings and justified review priority.
6. Coverage, unresolved gaps and model availability.

The plain-language summary names the most consequential established finding, its evidence strength, unknowns and an appropriate next investigation step. A supported review recommendation is possible; autonomous install/block certification and universal malware judgments are not.

## P4-11 — Saved-report reproducibility and policy versioning

**Recommendation: A report preserves the assumptions used to reach its conclusions.**

- Version the report schema, analyzer/rules, trust policy and normalization/rebuild configuration.
- Preserve artifact and source IDs, provenance verifier/policy details, available evidence snapshot, and AI inference metadata.
- Distinguish captured historical facts from current registry/source/monitoring status.
- A changed trust policy, new source revision or regenerated report is a *new evaluation*, not silent retroactive rewriting of old results.
- Test fixtures and real generated output remain visibly distinct and cannot be accidentally relabeled as live verification evidence.

## P4-12 — Acceptance tests, ownership and closeout

**Shane owns:** immutable artifact identity, source-candidate history, provenance verification wrappers, raw comparison, evidence ledger, stage coverage, deterministic reporting and consistent CLI/TUI rendering.

**Malhar owns:** build/semantic explanation evidence, restricted model-input selection, interpretation object, citation and entailment review, prompt-injection tests and model-abstention behavior.

**Both verify the following acceptance fixtures against the shared report contract:**

- Original registry tarball vs locally modified archive: different digests; original attestation does not verify the modified bytes.
- Registry digest mismatch: transport integrity failure, not “unexplained build transformation.”
- Version tag points at the wrong commit or source metadata conflicts: source remains unresolved.
- Valid signature from an unexpected identity: signature outcome and trust-policy outcome remain distinct.
- Missing provenance: recorded as absent, not malicious.
- Generated `dist/` output with source-map claim but no rebuild: supported hypothesis, not byte-equivalence proof.
- Independent rebuild matches one subset of files but leaves executable residual: preserve both the matching scope and unexplained residual.
- Exact build match with potentially dangerous code already in source: no “safe” result.
- Model fabricates an evidence ID or follows instruction text inside package files: reject or constrain interpretation without erasing deterministic findings.
- Parser fails on one binary: display skipped coverage and the remaining useful analysis.
- Same report reopened in CLI, TUI and browser: identical claim statuses, evidence and limitations.

**Acceptance meaning:** Shane explicitly confirmed the Phase 04 decision review (P4-01–P4-12) on 31 October 2026. This does **not** constitute completion of security tests, tooling integration or real provenance verification.

## Open implementation specifics (recorded, not silently decided)

- Exact trust-policy configuration format and allowed signer/build-identity defaults.
- Concrete provenance verifier/tool versions, library licenses and compatibility.
- JSON Schema field names/enums and stable-ID encoding.
- Numeric severity/priority qualification thresholds and policy exit-code mapping.
- Evidence retention, cache limits and optional isolated rebuild operations (Phase 05 safety/operations review).

**Approval state:** P4-01 through P4-12 APPROVED by Shane on 31 October 2026. The open implementation specifics above remain open; no empirical validation or implementation completion is implied.
