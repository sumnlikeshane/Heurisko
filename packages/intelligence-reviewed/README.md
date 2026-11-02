# Reviewed deterministic intelligence

The current local revision is `@heurisko/intelligence-reviewed 0.2.0-p2-static-v1`, selected by default or `HEURISKO_ANALYSIS_MODULE=p2-static-v1`. It derives from Malhar's deterministic implementation at **55240e99409ad44cbd6a978f40873ef410cb1861**, with explicit Phase 2 rule changes. It is not an unchanged copy of that commit. [Current admission/hash ledger](admission.json) binds the revised source, compiled runtime and declarations to the [preserved parent admission](provenance/admission-55240e9.json) and [original derived source](provenance/reviewed-55240e9.ts). [Original upstream source](provenance/upstream-index.ts) remains unchanged.

The explicit legacy selector `55240e9` loads the preserved rule body from `src/legacy-55240e9.ts` under version `0.1.0-55240e9`, with the current, separately fingerprinted loader/content boundary. It preserves the old removal-priority and entrypoint-wording defects for reproduction; it is not the current default and does not recreate an entire historical environment. `off` keeps raw-only/incomplete analysis. Unknown selectors reject before acquisition. Target metadata and HTTP requests select no executable code. Existing trusted module injection still takes precedence.

```ts
analyzeEvidence(bundle, options, resolvedContent?)
// resolvedContent: readonly { evidenceId, contentRef, text }[]
```

G0's two-argument `AnalyzeEvidence` interface and `0.1.0` reports remain unchanged. Core wraps the optional third argument in its [trusted content adapter](../core/src/intelligence-boundary.ts). Reopening an old report preserves its bytes, findings, configuration and outcomes; new analysis creates a new observation and identity.

## Current rule scope

- **Q1:** verified additions/command changes for `preinstall`, `install`, `postinstall` and `prepare` are medium/medium; field removals are informational/low. Ordinary script metadata is informational/low. Empty/nonstring commands, invalid parent shapes and missing/unbound content remain undetermined/low and incomplete. `prepare` invocation context differs from installation hooks; no command behavior or intent is inferred. Other npm lifecycle hooks are not claimed as analyzed lifecycle surfaces.
- **Q2:** `main`, `module`, `types`, `typings`, `exports`, `bin` and `browser` use exact source/artifact values and direction only after pointer, member, value-span, hash and absence checks. RFC 6901 keys preserve punctuation, arrays and conditions. One outermost changed entrypoint value avoids duplicate parent/leaf events. Summaries cap each displayed value at 240 characters and explicitly identify truncation; inspect full value spans through the shared reader. JSON null/false/empty strings remain distinct from absence. No Node resolver or target-member existence claim is made.
- **Q3:** candidate findings identify repository/commit/subtree, acquired archive/build-context digests, alternative claims and conflicts. Missing optional snapshot metadata is qualified as unrecorded, never treated as proof that acquisition did not occur. Static relationship notes cover CRLF/LF byte sequences, strict JSON formatting with parsed property order preserved and a final local source-map reference with exact retained cross-side source-content matches. The host adapter recomputes these relationships. Source-map mappings, emitted behavior, build recipes and generation remain unverified. No new `reproduced` or favorable correspondence outcome is assigned.

Every changed file keeps a raw residual finding even beside a recognized manifest event or supported static relationship. Original member bytes, raw enclosing changed spans, unclassified metadata and unmatched source-map entries remain visible. A filename, `dist/`, build file or generated comment is never an exemption.

## Boundary, identity and limits

The v3 adapter preserves parsed property order in value binding and change detection. Reordered conditional exports are observed changes, not formatting explanations; forged delta ordering cannot replace the cited value. [Node 22.23.4 conditional-export semantics](https://raw.githubusercontent.com/nodejs/node/v22.23.4/doc/api/packages.md) explains why order must remain visible; this is still no resolver emulation.

The adapter admits at most 128 records, 16 KiB per delta/note, 256 KiB per linked member and 1 MiB aggregate reads. Manifest values and static relationships share those budgets. Missing, corrupt, not-exported, unsupported or over-budget content cannot supply exact claims; cancellation/deadline does not become empty successful content. Whole-manifest addition/removal currently lacks an admitted absent-member proof and therefore abstains. Unsupported script commands make heuristics incomplete. These limits are not general hostile-JavaScript containment.

Producer source-map discovery separately caps 128 artifact candidates, 1 MiB candidate reads and 32 relationships. It admits only a final local map basename and retained map/source content. It fetches no map path, evaluates no configuration and executes no target or build code. Byte inventory coverage is separate from explanation coverage.

The [loader](../core/src/reviewed-module.ts) fingerprints source/compiled/declaration/admission/parent bytes, loader, adapter, relationship/comparison implementation, store, validator, lock and contract semantics. Cached code cannot be relabeled after changes; rebuild deliberately and restart. Source/configuration changes create new evaluation identities. No external production dependency was added.

The runtime exports no provider, retrieval, prompt or CodeAstra path. Model inference, cryptographic verifier/policy integration, monitoring and rebuild execution remain unavailable. AI stays disabled in ordinary investigations. Exit 0 is configured completion, not safety, provenance success or explained-build acceptance.

## Validation and acceptance limits

[Phase 2 local evidence](../../examples/production-phase2/2026-11-02-local-01/) retains the actual-loader failing-before observation, focused/adversarial checks, compatibility journeys and tool evaluation. These are development implementation/conformance results. Independent human labels, family-separated held-out grading, consequential claim/trust review and owner phase acceptance remain open in [the roadmap](../../PRODUCTION_MASTER_ROADMAP.md#2-trustworthy-npm-investigation). No population-quality or safety result is claimed.

[Original integration example](../../examples/final-hour/20261101-053912/integrated-55240e9/README.md) and [earlier module-intake receipt](../../examples/final-hour/20261101-053912/module-intake.json) remain dated evidence for their own source, not results from this revision. Inactive development/provider intake and its rights/tests remain in [AI intake](../../docs/production-phase1/AI%20Source%20Intake.md).
