# Heurisko — research quality audit

Audit date: 31 October 2026. Independent review of the founder research assignment, authoritative organizer map, and the research dossier. This checks coherence and claim boundaries; it is not a security test, package benchmark or verification of the proposed implementation.

## Scope and method

The master assignment was read completely. The organizer requirement map and all eight dossier documents were read: baseline, product, architecture, tooling, verification, roadmap, founder decisions and executive brief. No external pages were recollected merely to repeat the research, and no product repository or executable was created.

Checks distinguish three categories:

- **Document defect:** an inconsistency or missing explanation that can be corrected before delivery.
- **Research limitation:** an empirical or source-access gap correctly disclosed, with a proposed investigation.
- **Implementation gate:** a design/API/operational choice that must be decided or tested after founder approval.

## Review findings and disposition

| ID | Finding | Category | Disposition |
|---|---|---|---|
| QA-01 | The baseline initially described slide 19 as still needing visual verification, although the organizer map already confirmed literal `00` values in the rendered slide. | Document defect, minor | **Corrected and rechecked.** Baseline and roadmap preserve the confirmed defect and separately supported weights without reconstructing a full rubric. |
| QA-02 | The architecture initially recommended a monorepo without an explicit multi-repository alternative and did not explicitly compare serverless versus persistent deployment. | Coverage improvement, minor | **Corrected and rechecked.** Section 2 compares repository coordination and execution deployment tradeoffs without introducing unnecessary services. |
| QA-03 | Per-stage concurrency/backpressure and the cost accounting model were less explicit than the master assignment requests. | Coverage improvement, minor | **Corrected and rechecked.** Section 9 separates resource pools, records partial results, specifies backpressure and measurable cost dimensions, and leaves numeric policy to evaluation/approval. |
| QA-04 | Source identity, signature validation, policy acceptance, comparison method and analysis completeness remain separate. PyPI publish-only attestations do not qualify as source/build equivalence. | Passed conceptual check | Architecture specifies exact subject binding and expected identity/policy before `attested`; no further correction needed. |
| QA-05 | Raw archive equality, extracted-content agreement and normalization-assisted comparison remain distinct. | Passed conceptual check | Canonical report retains method/scope/ignored differences and raw evidence; do not collapse these during implementation. |
| QA-06 | Monitoring is an official P04 capability, while hosted dashboards/accounts/notifications are choices. | Passed requirement check | All reviewed product/architecture/roadmap documents preserve a basic durable monitor in complete P04 scope. |
| QA-07 | P04's open-model requirement is separate from P08's Gemma-only laptop rule. | Passed requirement check | Documents correctly preserve local or organizer-server P04 options and the founder's ban on closed inference. |
| QA-08 | The first commit must contain only HACKATHON.md; README/LICENSE/CI follow through PRs. | Passed workflow check | Roadmap and requirement map state exact ordering; research files are not prebuilt product code. |
| QA-09 | Existing OSS Rebuild, reproduce and Drydock materially overlap the proposal. | Passed novelty check | Tooling calls this out, recommends optional integration and makes the remaining differentiation a hypothesis requiring evaluation. |
| QA-10 | No package corpus, rebuild, model inference, detector benchmark or distribution compatibility matrix was executed. | Research limitation | Explicitly disclosed. Proposed tests, candidate packages and architecture are not completed results. |
| QA-11 | Firecrawl credits were exhausted during collection; available primary-source web retrieval was used for remaining material checks. | Source-access limitation | Disclosed in the documents; failed requests are not treated as retrieved evidence. |
| QA-12 | Library/runtime versions, license obligations and compatibility are not frozen; TUI/verification HEAD APIs can differ from released packages. | Implementation gate | Exact release/digest, transitive notices, runtime peers and fixture compatibility must be checked at admission. |

## The fifteen required quality questions

The answers below assess the proposed design, not an implemented Heurisko.

| # | Question | Audit answer and practical limit |
|---|---|---|
| 1 | Does the proposal solve Problem 04? | Yes at the design level: exact package bytes, corresponding source, build-aware difference explanations, suspicious residuals and required release monitoring are central. A generic vulnerability scan is explicitly insufficient. |
| 2 | What could it establish conclusively? | Exact byte/content observations; manifest/script additions; successful signature/digest checks under recorded trust policy; and narrowly scoped rebuild or transformation matches after those checks are actually run. These conclusions retain their assumptions. |
| 3 | What remains uncertain? | Source intent, malware absence, compromised trusted builders/toolchains, arbitrary semantic equivalence, missing build inputs, opaque/native artifacts and incomplete source association. |
| 4 | Are the security claims defensible? | The proposed language is defensible if implementation follows it: suspicious/consistent/unexplained/partial, never a universal safe verdict. The research itself establishes no detection performance. |
| 5 | Do existing tools already solve parts of the problem? | Substantially. OSS Rebuild reconstructs covered packages; reproduce addresses npm reproduction; diffoscope diagnoses artifacts; provenance tools verify attestations; Drydock overlaps artifact review UI. |
| 6 | Is the contribution meaningful? | Potentially: relationship resolution, evidence accounting, scoped explanations, residual triage and one investigation contract. It remains a product/engineering hypothesis until comparative evaluation and developer observation demonstrate value. |
| 7 | Does CLI/TUI improve workflows? | A noninteractive local CLI maps to pinned dependency review and CI. TUI is optional report navigation and needs observed usability benefit; it does not justify a separate engine. |
| 8 | Is the web purposeful? | Yes: source/artifact side-by-side differences, evidence/provenance drill-down, release comparison, report sharing and installation docs. A public hosted execution backend is not required merely to render evidence. |
| 9 | Is the shared architecture coherent? | Yes conceptually: versioned engine/report contracts, UI-only renderers, optional verifier adapters, separately isolated builds and durable monitor invoking the same engine. Compatibility and failure behavior need actual tests. |
| 10 | Are deterministic evidence and AI interpretation separate? | Yes. Model output has its own records, evidence-ID checks and abstention; it cannot overwrite hashes, trust policy, source identity or verification status. Citation existence still does not prove an explanation is correct. |
| 11 | Can ordinary build artifacts be handled without excessive false alarms? | **Not established by research.** The design supplies a comparison ladder and held-out benign evaluation plan. False-positive rate and coverage must be measured before this capability is claimed. |
| 12 | Can expected tampering be detected? | **Not established by research.** Raw deltas and executable/script changes are plausible detectable cases, but organizer-prepared inputs and mutation families must be evaluated after implementation. |
| 13 | What are the largest unresolved questions? | Correct source/monorepo association; generalizable build explanations; safe rebuild environment reconstruction; model explanation fidelity; native/bundled coverage; deployment cost and hidden-test interfaces. |
| 14 | Which features depend on unverified assumptions? | Universal transformation inference, broad native analysis, local model throughput, TUI adoption, anonymous OSS Rebuild verification integration, exact parser/verifier runtime matrix and sustainable hosted analysis. Each is a gate or optional capability. |
| 15 | What would make it credible to security engineers? | Pinned artifact/source evidence, verifiable trust policy, bounded static handling, tested execution isolation, reproducible real examples, held-out benign and tampered cases, honest unknowns, measured denominators and independent report reproduction. UI polish alone is insufficient. |

## Release review checklist

All eight required deliverables exist and were reviewed. Relative Markdown document links were checked locally and resolve. FH-01/FH-02 and D-01–D-13 remain **PROPOSED — NOT YET APPROVED**. The executive brief is independently readable and preserves the unexecuted experiment limitations. QA-01–QA-03 are reconciled. No blocking conceptual or cross-document inconsistency was found.

One minor metric wording refinement was reported to the owner and corrected: the verification strategy now separates monitoring outcome accounting from successful-analysis coverage, with queue delay and failure rates reported independently. A fully accounted failed job cannot count as successful monitoring. The owner checked the revised table after the independent review; no empirical outcome is implied.

This audit supports delivery as a research/design dossier. It does not certify the proposed software, approve founder decisions, establish detection performance or authorize implementation. The final user response must not describe proposed tests as passed.
