# Reviewed deterministic intelligence

This local package admits the deterministic `analyzeEvidence` implementation from Malhar's **55240e99409ad44cbd6a978f40873ef410cb1861**, original package `@heurisko/intelligence 0.1.0`. Its complete deterministic body is copied without rule edits; only the terminal export/re-export block is removed. [Original upstream source](provenance/upstream-index.ts) and [admission/hash ledger](admission.json) record the exact derivation. The derived package is `@heurisko/intelligence-reviewed 0.1.0-55240e9`.

The package exports `analyzeEvidence` and the optional `ResolvedEvidenceContent` type. Its compiled runtime has no imports. OpenRouter, CodeAstra, retrieval, interpretation, prompt modules, experiments, model weights and providers are not included or executed.

```ts
analyzeEvidence(bundle, options, resolvedContent?)
// resolvedContent: readonly { evidenceId, contentRef, text }[]
```

The shared G0 two-argument `AnalyzeEvidence` contract is unchanged. Core wraps this optional third argument in its [trusted content boundary](../core/src/intelligence-boundary.ts). Only retained, hash-verified, versioned manifest deltas and the linked manifest members admitted by the bundle may supply text. The boundary checks exact JSON pointers, value bytes/ranges, presence/absence, duplicate ownership and size/count/aggregate limits. Missing, corrupt or unsupported content remains unresolved and makes the heuristics stage incomplete. Cancellation/deadline aborts do not become empty successful content.

## Default integration and host configuration

Default CLI, TUI and browser investigations now use this reviewed deterministic implementation. The same default can be pinned explicitly for a process:

```sh
HEURISKO_ANALYSIS_MODULE=55240e9 node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --no-ai
HEURISKO_ANALYSIS_MODULE=55240e9 node packages/cli/dist/index.js
HEURISKO_ANALYSIS_MODULE=55240e9 pnpm web
```

Run from the repository root using its existing pinned setup. Missing/empty `HEURISKO_ANALYSIS_MODULE` selects `55240e9`; `HEURISKO_ANALYSIS_MODULE=off` explicitly preserves raw-only/unavailable-module reproduction. `--no-ai` disables model requests and does not disable deterministic analysis. This is trusted host-process configuration; package metadata, retained reports, model text and HTTP requests select no executable code. Unknown nonempty selectors fail before acquisition. Existing explicitly injected trusted `InvestigationContext.module` takes precedence; trusted callers may also set `InvestigationContext.analysisModuleSelector` for an isolated raw/default run. The loader rejects admission-byte mismatches, changes during loading and attempts to relabel cached code after executable/configuration changes; restart after a reviewed rebuild.

The [loader](../core/src/reviewed-module.ts) fingerprints the derived compiled/source/admission files, boundary and loader code, relevant adapter/storage/validation code, root lock and contract semantics. The exact boundary version, fixed limits, selection rule and full upstream commit are also configuration-bound. No external package was added: the only new dependency links are local workspace links and the existing contracts types.

## Acceptance limits

These rules report retained evidence-backed script/entrypoint differences and unresolved file/build candidates. They do not establish maliciousness, package safety, provenance verification, general generated-code equivalence or production readiness. Actual model/provider integration and monitoring remain separate.

Two upstream quality limitations are preserved rather than silently changing the reviewed rule implementation:

- Lifecycle removal severity/review priority still derives from the whole-file `FileChange.status`; a removed lifecycle key inside a modified manifest can remain medium priority despite the correct removal direction.
- The entrypoint rule still says old/new values are unavailable. This is a module wording limitation where the producer retains those values.

An exit of 0 means the configured checks completed without a configured policy violation. Source correspondence may remain unresolved and provenance unchecked; it is not a harmlessness result. [The integrated retained example](../../examples/final-hour/20261101-053912/integrated-55240e9/README.md) records an actual default CLI report with 16 findings, including one lifecycle addition, exit 0 with unresolved source correspondence and unchecked provenance. It is dated evidence, not general rule acceptance. [Original module-intake receipt](../../examples/final-hour/20261101-053912/module-intake.json) records the earlier e8b8116 boundary checks separately. Source/compiled/admission hashes, not package version alone, identify the runtime.

The trusted boundary permits 128 candidate deltas, 16 KiB per delta, 256 KiB per manifest member and 1 MiB aggregate reads. Its checks bind exact pointers, values, member spans and absence; missing/corrupt/unsupported content makes analysis incomplete. Core tests `intelligence-boundary.test.mjs` and `reviewed-module.test.mjs` protect this integration. Q1/Q2 in [the roadmap](../../PRODUCTION_MASTER_ROADMAP.md#priorities-and-known-issues) own the preserved removal-priority and entrypoint-wording defects. Future development/provider source and its rights/tests are documented in [AI intake](../../docs/production-phase1/AI%20Source%20Intake.md); it is not this runtime.
