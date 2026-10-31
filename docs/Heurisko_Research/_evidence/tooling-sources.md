# Tooling source ledger

Retrieved 31 October 2026. Entries describe primary-source evidence, not independent security audits. Report recommendations are proposed. Search extracts were used to discover pages; relied-on facts were checked in retrieved official content unless explicitly marked partial.

| ID | Source | Supported claims / freshness and limit |
|---|---|---|
| T01 | https://github.com/google/oss-rebuild | README supports npm/PyPI/crates, metadata/artifact-derived rebuilds, published attestations, CLI payload/bundle/Dockerfile, popular-package coverage limits, current Cloud KMS/ADC requirement. Apache-2.0 badge; visible latest commit 75a6e12 dated 30 Oct 2026. |
| T02 | https://diffoscope.org/ | Recursive archive/binary comparisons, formats/platform packaging, GPL-3.0-or-later; listed latest release 336 dated 30 Oct 2026. Canonical repo is Salsa, not an arbitrary GitHub mirror. |
| T03 | https://github.com/DataDog/guarddog | Current v3 README supports YARA, capability/threat correlation, local archive/directory/JSON, expanded ecosystems, Windows Docker-only and documented sandbox. Apache-2.0 badge; visible commit a46949d dated 26 Oct 2026. No Heurisko integration executed. |
| T04 | https://github.com/ossillate-inc/packj | Metadata/static/dynamic/trace modes; npm/PyPI; AGPL-3.0 badge; latest visible commit dfd2c70 dated 17 Sep 2026. README table/prose ecosystem mismatch prevents accepting broad compatibility claims. |
| T05 | https://github.com/google/osv-scanner | OSV advisory-based scanning with OSV-Scalibr, many package ecosystems and containers. Apache-2.0 badge; visible commit f3b468c dated 30 Oct 2026. Commit status was failure in page; no claim CI passes. |
| T06 | https://github.com/ossf/scorecard | Repository security checks and weighted aggregate; Apache-2.0; visible commit 2ef237f dated 28 Oct 2026. Repo hygiene does not prove artifact identity (engineering inference). |
| T07 | https://docs.npmjs.com/cli/v11/commands/npm-audit | npm audit signatures verifies registry signatures and provenance; lockfile/dependency-tree audit behavior. CLI v11 docs were version-specific, not claimed latest npm. |
| T08 | https://docs.npmjs.com/cli/v11/commands/npm-diff/ | npm diff registry/local specs and package comparison. It is a baseline comparator, not an equivalent source-identity verifier. |
| T09 | https://github.com/sigstore/sigstore-js | Client/bundle/trust-root libraries; Apache-2.0; https://github.com/sigstore/sigstore-js/releases confirms published releases. General docs engine minimum differs from current verifier package; exact compatibility gate retained. |
| T10 | https://www.npmjs.com/package/%40sigstore/verify | Search surfaced 4.1.2 / engine range ^22.22.2 OR ^24.15.0 OR >=26.0.0. Used only to flag compatibility inconsistency, not prescribe a tested version. |
| T11 | https://github.com/pypi/pypi-attestations | Apache-2.0, public Python API, PEP740 models, identity/artifact verification; CLI explicitly experimental/not stable, inspection explicitly not verification. Latest release date not established. |
| T12 | https://github.com/SocketDev/socket-cli | MIT for CLI, current 2.x prerelease description, npm/pnpm/yarn firewall workflow. Latest dated release not established. |
| T13 | https://docs.socket.dev/docs/socket-cli-faq | Some commands contact API/upload manifests and lockfiles; CLI local does not imply analysis fully local. Service implementation/license not established. |
| T14 | https://github.com/snyk/cli | Cloud-oriented scanning, multiple content types, CLI/CI, authentication requirement. Exact latest release not established. |
| T15 | https://github.com/snyk/cli/blob/main/LICENSE | Apache-2.0 for CLI; not a license grant for hosted service internals. |
| T16 | https://github.com/dependabot/dependabot-core | MIT; multi-ecosystem dependency update core. Release stream inspected, latest precise date not established. |
| T17 | https://github.com/renovatebot/renovate | AGPL-3.0 badge, automated dependency PRs, platforms/ecosystems. https://github.com/renovatebot/renovate/releases visibly lists 44.198.3 dated 30 Oct 2026. |
| T18 | https://github.com/ossf/package-analysis | Apache-2.0, package feed/scheduler/worker pattern, gVisor dynamic analysis and JSON/log outputs. https://github.com/ossf/package-feeds is distinct feed project. Latest precise release date not established. |
| T19 | https://github.com/vltpkg/reproduce | MIT, gitHead/repository.directory, metadata checks, caching, JSON, npm-only strategy installs dependencies/packs; excludes bespoke complex configs. Release-page fetch failed; maintenance confidence limited. Historical README experiment not used as current coverage metric. |
| T20 | https://github.com/JoviDeCroock/drydock | Apache-2.0; pre-publish artifact review, deterministic line-linked checks, optional Workers AI, hosted/self-hosted; prior published artifact baseline. Latest dated release not established. |
| T21 | https://drydock.org/diff | Public npm/PyPI artifact-version diffs with deterministic rules, no account, no package execution on this surface, Renovate/Dependabot diff links. These are project claims, not independently tested. |
| T22 | https://github.com/mafintosh/tar-stream | Streaming tar parser/generator without filesystem requirement; header types/PAX support. https://github.com/mafintosh/tar-stream/blob/master/package.json declares MIT. Last release date not established. |
| T23 | https://github.com/thejoshwolfe/yauzl | Lazy entries, size validation, filename policy, error handling, no automatic CRC checking, limited compression methods. https://github.com/thejoshwolfe/yauzl/blob/master/package.json declares MIT/version 3.4.0/Node>=12. Last release date not established. |
| T24 | https://github.com/npm/ssri | SRI parsing/checking; https://github.com/npm/ssri/blob/main/package.json declares ISC. Last release date not established. |
| T25 | https://babeljs.io/docs/babel-parser | JS/TS/JSX parser, parse API/options. https://github.com/babel/babel declares MIT. Last release date not established; no broad semantic-equivalence claim. |
| T26 | https://github.com/jridgewell/trace-mapping | Old standalone repo archived 28 Jun 2025 and explicitly moved to https://github.com/jridgewell/sourcemaps ; old license MIT, source-map location tracing. New package deep manifest retrieval blocked; exact current package/license compatibility remains an admission gate. |
| T27 | https://gvisor.dev/docs/ | Userspace application kernel, Linux-like interface, OCI runsc runtime, Docker/Kubernetes integration. Exact release/license/runner security audit incomplete; not claimed native macOS or a perfect boundary. |
| T28 | https://arxiv.org/html/2404.16565v1 | Source-matching workstream read PyRadar; not independently reproduced or admitted as reusable code here. See baseline for qualified methodological summary. |

## Excluded / insufficient evidence

- GrepCode homepage source/build/package comparison discovery: direct retrieval failed with HTTP 530; no qualified capability/license/integration conclusion.
- npm reproduce package page direct open returned 403; official GitHub README supplied needed evidence instead.
- OSS Rebuild trust.md and some GitHub deep paths were blocked; stronger trust claims were not based on inaccessible text.
- Initial Firecrawl searches and six project-page scrapes succeeded. In the next batch, npm audit docs succeeded while the other requests returned insufficient credits without running. No retry or parameter change was used to evade the restriction. Web retrieval then provided remaining primary-source coverage.
- GitHub source/README retrieval validates existence and documented intent. It does not establish code safety, last release dates when absent, future support, dependency compatibility, or tested performance.

## Research-only status

No repository creation, clone, dependency installation, untrusted code execution, rebuild, malware simulation, or production integration occurred. Any compatibility/security/licensing admission work is future engineering with explicit acceptance evidence.

