# Provenance and domain source ledger

Retrieved during the Heurisko research assignment on 31 October 2026 (India). Retrieval date is not a publication date. These are documentation findings, not empirical verification of a particular package. Sources were discovered/read with Firecrawl; links identify the primary material used.

| ID | Source | Directly supported finding | Qualification |
|---|---|---|---|
| P01 | [npm provenance](https://docs.npmjs.com/generating-provenance-statements/) | Separate provenance and publish attestations; Sigstore use; source/build linkage; provenance does not guarantee absence of malicious code; `npm audit signatures` verifies registry signatures and attestations | Documentation procedure, not a completed audit; provider/version prerequisites may change |
| P02 | [npm package.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) | `files`, `.npmignore`, automatic inclusions/exclusions, repository URL and monorepo `directory` metadata shape | Versioned v11 documentation; no claim that the current latest npm is v11 |
| P03 | [npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts/) | `prepare` and `prepack` lifecycle behavior; Git dependency preparation can install build dependencies and execute scripts | Supports avoiding target-code execution during static acquisition |
| P04 | [npm publish](https://docs.npmjs.com/cli/v11/commands/npm-publish/) | Publishing packs tarballs; SHA-512 integrity of tarball; file selection | Registry hash agreement is distinct from source correspondence |
| P05 | [npm registry metadata](https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md) | Full vs abbreviated metadata; version-level tarball and `dist.integrity` fields; metadata includes repository and version descriptions | Page contains historical fields; no adoption of old signature mechanism as current recommendation |
| P06 | [PyPI JSON API](https://docs.pypi.org/api/json/) | Per-file URLs/digests, release inventory, metadata may differ from uploaded content, first release metadata retained | Documentation example is not a newly executed `sampleproject` investigation |
| P07 | [wheel specification](https://packaging.python.org/en/latest/specifications/binary-distribution-format/) | ZIP-based wheel, platform/ABI filename identity, `.dist-info`, RECORD file hashes and installation layout | Binary contents may be legitimate; no universal Git equivalence claim |
| P08 | [sdist specification](https://packaging.python.org/en/latest/specifications/source-distribution-format/) | Modern sdist layout and metadata, tar format, security constraints on extraction/escaping links | Legacy formats exist; do not assume all historical sdists conform |
| P09 | [PyPI attestations](https://docs.pypi.org/attestations/) | Signed per-file digests, publisher identity, distinct SLSA and PyPI Publish predicate support | Coverage is artifact-specific and optional |
| P10 | [PyPI Publish v1](https://docs.pypi.org/attestations/publish/v1/) | Attests publication via specific Trusted Publisher; minimal empty/null predicate; integrity differs from trustworthiness | Must not label as complete build provenance or rebuild proof |
| P11 | [PyPI Integrity API](https://docs.pypi.org/api/integrity/) | `/integrity/<project>/<version>/<filename>/provenance`; provenance bundles attestations with identity; individual attestations must be verified | API response existence is not verification |
| P12 | [SLSA v1.2 verification](https://slsa.dev/spec/v1.2/verifying-artifacts) | Verify signature/trust roots/subject digest, builder, canonical source, buildType and external parameters; trusted platform and dependency limitations | Policy is necessary; do not conflate mere signature validity with policy acceptance |
| P13 | [Sigstore verification](https://docs.sigstore.dev/cosign/verifying/verify/) | Expected certificate identity/OIDC issuer in keyless verification; signatures bind payload/digest when checks enabled | Generic Sigstore guide, not a recommendation to parse PyPI bundles with arbitrary cosign commands |
| P14 | [in-toto Statement v1](https://github.com/in-toto/attestation/blob/main/spec/v1/statement.md) | Statement binds typed predicates to subject digests; subjects matched by digest | Predicate semantics must still be understood |
| P15 | [Andres Freund's XZ disclosure](https://www.openwall.com/lists/oss-security/2024/03/29/4) | March 29, 2024 disclosure; tarball-only trigger component; repository test data involved; affected 5.6.0/5.6.1 tarballs | Author explicitly describes preliminary analysis; XZ is illustrative, outside initial npm/PyPI target |
| P16 | [color-string maintainer advisory](https://github.com/Qix-/color-string/security/advisories/GHSA-286p-vc9p-p5qv) | September 8, 2025 phishing publishing-account takeover; 2.1.1 malware payload targeted browser cryptocurrency transactions; earlier functionality retained | No historical artifact was acquired or tested in this assignment |
| P17 | [PyRadar, arXiv v1](https://arxiv.org/html/2404.16565v1) | Repository retrieval/validation using metadata, classifier and World of Code file hashes; external-index and dataset limitations | Methods/limitations read via web-search fallback after Firecrawl credit exhaustion; not exact revision proof |

## Partial retrieval and exclusions

- [debug incident issue](https://github.com/debug-js/debug/issues/1005) returned mostly page chrome, so it does not independently support incident details here.
- Third-party search excerpts were used for discovery, then consequential claims were grounded in the sources above.
- No package version's provenance was verified, no target code was executed, and no source/artifact detection claim was measured.
- Claim strength rankings, verdict axes, raw-versus-normalized comparison policy and the threat matrix are explicit engineering recommendations derived from these findings.
