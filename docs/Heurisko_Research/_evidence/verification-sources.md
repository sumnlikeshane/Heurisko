# Verification and containment source ledger

Retrieved: 31 October 2026. Local organizer documents were read as supplied. External sources below are primary project/standards/security guidance. Supported claims are paraphrased, not experimental verification of Heurisko.

| ID | Source and access | Supported claim | Limit |
|---|---|---|---|
| V01 | Supplied DOCX, Problem 04; supplied PDF slide 28 | Real mostly legitimate release differences and prepared tampered copies; source comparison, explanations, risk evidence and selected-package monitoring | No organizer fixtures supplied; slide examples are illustrative |
| V02 | [Python tarfile](https://docs.python.org/3.14/library/tarfile.html#extraction-filters), Firecrawl search then fresh targeted scrape | Extraction filters do not eliminate all archive danger; fresh destinations, external resource limits, path/link handling, duplicates and collisions need attention | Does not prove a proposed TS or Python extraction implementation safe; no exact patch-version recommendation made |
| V03 | [gVisor security architecture](https://gvisor.dev/docs/architecture_guide/intro/), Firecrawl search then fresh targeted scrape | Application-kernel Linux isolation, separate workloads, permitted resources still reachable, documented limits including side channels | No Heurisko worker benchmark, escape testing or macOS-native compatibility established |
| V04 | [OWASP SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html), Firecrawl search then fresh targeted scrape | Redirect controls, validated IP destinations and protection against unchecked second DNS lookup/rebinding | Guidance must be implemented and tested; regex/domain checks alone are insufficient |
| V05 | [OWASP prompt injection](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html), Firecrawl search then fresh targeted scrape | Prompt formatting is not an enforcement boundary; tool permissions/validation and output treatment matter | No defense demonstrated perfect; Heurisko should remove model action authority |
| V06 | [npm config](https://docs.npmjs.com/cli/v11/using-npm/config/#ignore-scripts), Firecrawl search then fresh targeted scrape | `ignore-scripts` does not block an explicitly requested npm script command | Static acquisition should not run unknown package scripts at all |
| V07 | [pip security policy](https://github.com/pypa/pip/security), web search/open | Source builds invoke package-chosen tools; downloading/installing wheels has different intended behavior from building source | Does not make all package-manager invocation harmless; no arbitrary install in research |
| V08 | [Git hooks](https://git-scm.com/docs/githooks), web search/open | Hooks are programs; configurable hooks path, template behavior, post-checkout after clone | Does not say tracked remote hooks automatically execute on every clone |
| V09 | [Reproducible Builds definition](https://reproducible-builds.org/docs/definition/), web search/open | Reproducibility is relative to source, build environment/instructions and specified bitwise outputs | Does not prove code benign or rebuild feasible for all packages |
| V10 | [packaging on PyPI](https://pypi.org/project/packaging/), web open | Page lists packaging 26.3, source + universal wheel and publishing/provenance metadata, useful corpus candidate | Metadata reviewed only; no artifact download, cryptographic verification, build or benignness label |
| V11 | [MarkupSafe on PyPI](https://pypi.org/project/MarkupSafe/), web open | Page lists MarkupSafe 3.0.4 (2026-10-02), sdist and multiple native/platform wheel candidates | No per-wheel source matching, build or coverage claim established |

## Access gaps

- Firecrawl follow-up searches for Git/pip/reproducibility returned insufficient-credit errors. No retry with changed parameters or paid autonomous job was attempted. Used available public web search/open for those sources.
- `https://www.npmjs.com/package/zod` and `https://www.npmjs.com/package/typescript` returned HTTP 403 through the public web opener. Package names remain candidate intake targets, not verified release fixtures.
- No organizer tampered fixtures, labeled real-release corpus, actual model inference, rebuild recipes or empirical accuracy/performance results were available or executed in this research-only assignment.

## Design inferences

All proposed status enums, threat controls, corpus splits, metrics, gates and demo timings are Heurisko recommendations derived from the official task and the sources above. They are not requirements imposed by those external projects, approval decisions, completed tests or guarantees of detection.
