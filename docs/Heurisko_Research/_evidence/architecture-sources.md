# Architecture evidence ledger

Research date: 31 October 2026. Architecture choices are proposals; no product experiment was executed.

| Source | Retrieval / supported claim | Limitation |
|---|---|---|
| https://docs.npmjs.com/generating-provenance-statements/ | Official source located/read through search-service primary passages; npm distinguishes provenance/publish attestations and explicitly excludes a no-malicious-code guarantee. Also fully read by domain researcher. | Does not establish any selected package's actual validity. |
| https://github.com/google/oss-rebuild | Official README search passages read by root; full repository page read by tooling researcher. Existing npm/PyPI/crates rebuild and attestation work substantially overlaps. | Popular-package coverage only; no Heurisko integration executed. |
| https://pkg.go.dev/github.com/google/oss-rebuild | Official project module README read through primary search passages; documents Cloud KMS ADC verification requirement and --verify=false bypass. | Retrieval is documentation; availability/authentication not tested. |
| https://packaging.python.org/en/latest/specifications/simple-repository-api/ | Opened/read official specification. Project files, normalization, JSON representation/versioning, per-file hashes/provenance support artifact-specific adapter and monitoring design. | No live registry monitoring tested; source content may evolve. |
| https://docs.npmjs.com/cli/commands/npm-view/ | Open attempted, returned no readable lines. | Not used as substantive sole support; npm metadata evidence supplied by domain researcher. |
| https://gvisor.dev/docs/architecture_guide/security/ | Full source read by verification researcher; sandbox choice and limitation evidence. | Candidate isolation architecture, not demonstrated containment or Mac compatibility. |
| Organizer attachments | Both fully extracted/read; official requirements ledger and rendered scoring-slide inspection. | Main score slide contains literal placeholders; hidden tests/server list unavailable. |

Root used focused primary-source search and page opening to cross-check consequential architecture claims. Detailed source reads/licenses are owned by linked domain/tooling/product/verification ledgers. Root's first Firecrawl query succeeded; subsequent collection stopped after the shared account reached its credit limit. No autonomous paid research job was started.
