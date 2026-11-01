# Final module intake — 1 November 2026

Shane supplied Malhar's final delivery and authorized local integration across the current application. **Default investigations now use the reviewed deterministic implementation from `55240e99409ad44cbd6a978f40873ef410cb1861`**, through one bounded shared-engine adapter. The current TUI/browser were preserved. No model/provider, verifier, policy evaluator, rebuild or monitor is adopted, and no Git/publication action is authorized by this integration.

## Current default integration

The [derived local package](../packages/intelligence-reviewed/README.md) contains the complete upstream deterministic `analyzeEvidence` body without rule edits. Only its terminal re-export block is removed so OpenRouter, CodeAstra and other experimental/runtime modules never enter the product import graph. The [original source](../packages/intelligence-reviewed/provenance/upstream-index.ts) and [admission ledger](../packages/intelligence-reviewed/admission.json) retain the exact full commit, original/derived/compiled hashes, transformation and upstream quality caveats. Package version: `@heurisko/intelligence-reviewed 0.1.0-55240e9`. No external dependency or resolution changed; only local workspace links were added.

The [shared engine](../packages/core/src/engine.ts) supplies that module to CLI, TUI and browser calls. The [host loader](../packages/core/src/reviewed-module.ts) reads `HEURISKO_ANALYSIS_MODULE` from trusted process configuration: absent/empty selects `55240e9`; `off` explicitly retains raw-only/unavailable-module reproduction; unknown nonempty selectors fail before acquisition. An explicitly injected trusted `InvestigationContext.module` takes precedence. Trusted internal callers can use `InvestigationContext.analysisModuleSelector`; no G0, target-file, report, model or HTTP field selects executable code. `--no-ai` disables model requests while retaining deterministic findings.

```sh
# Current default deterministic investigation; no model request.
node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --no-ai

# Pin the same reviewed implementation explicitly.
HEURISKO_ANALYSIS_MODULE=55240e9 node packages/cli/dist/index.js
HEURISKO_ANALYSIS_MODULE=55240e9 pnpm web

# Reproduce the earlier raw-only/unavailable-module behavior explicitly.
HEURISKO_ANALYSIS_MODULE=off node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --no-ai
```

The optional third upstream argument is `readonly { evidenceId, contentRef, text }[]`. The [trusted boundary](../packages/core/src/intelligence-boundary.ts) supplies **entire retained delta JSON records**, after strict UTF-8/JSON and digest checks, exact pointer/value/byte-span verification against their uniquely linked original manifest members, and independently confirmed absence. Limits are 16 KiB per delta, 128 candidate records, 256 KiB per manifest member and a 1 MiB read budget; successful cached references are not charged twice, and failed reads conservatively consume their permitted budget. Missing/corrupt/unsupported content produces explicit incomplete diagnostics and qualified unresolved findings. Cancellation/deadline does not become a successful empty result. G0's two-argument contract stays unchanged because the wrapper captures this bounded resolver.

Module identity binds the derived executable/source/admission files, loader and boundary executable bytes, relevant adapter/storage/validator code, root lock and contract semantics. Configuration identity binds the full upstream commit, default/off selection, boundary version, limits and selection rule. Admission bytes and identities are rechecked after asynchronous import; a running process rejects changed executable/configuration bytes instead of relabeling cached code.

The **actual default CLI replay** is in [integrated-55240e9/report.json](../examples/final-hour/20261101-053912/integrated-55240e9/report.json), with its [bundle](../examples/final-hour/20261101-053912/integrated-55240e9/bundle.json) and matching [retained store](../examples/final-hour/20261101-053912/integrated-55240e9/store). It generated 16 findings, including the exact `scripts.postinstall` **addition** citing `ev_e7075cb69f91c7e1b4c4223f`. CLI exit is **0**: the declared static checks completed, while source correspondence remains **unresolved**, source **user_supplied**, provenance **not_checked** and policy **not_evaluated**. This is neither package safety nor complete P04 acceptance. The original [preintegration canonical example](../examples/p04/local-mutation/report.json) remains unchanged and still reopens with its original exit 2.

Remaining quality/dependency limits: lifecycle removal priority still follows whole-file status, and entrypoint findings still contain old/new-value-unavailable wording. Actual model/runtime/provider adoption, semantic claim quality, provenance-policy verification, monitoring, complete human/joint acceptance and final scored-revision delivery remain separate.

Shane also referenced local integration candidate `4096880` based on `c08a701` plus `9fd488e` and an uncommitted M1 patch. That short object was unavailable in the active, handoff and isolated review Git stores; no unpublished-object fetch was guessed. The exact fetched and reviewed `55240e99409ad44cbd6a978f40873ef410cb1861` source is authoritative for this narrow adoption. The older candidate's UI is not overlaid on the current web/TUI.

## Historical e8b8116 preparation

The remainder records the earlier model-off intake before final delivery. Its statements about missing default integration and pending source adoption are historical; the current implementation and boundary are described above. Original receipts remain unchanged.

At that checkpoint, the latest locally reviewed intelligence checkout was `e8b8116f9960527d0a82e066059d7792c405defe`, package `@heurisko/intelligence 0.1.0`; no newer delivery had yet been fetched and default investigations supplied no accepted module.

The [intake verifier](../scripts/check-final-module-intake.mjs), [eight boundary tests](../scripts/tests/final-module-intake.test.mjs) and [sanitized actual receipt](../examples/final-hour/20261101-053912/module-intake.json) make the next handoff review executable. They supplement the [existing M1/M2 quality review](Malhar%20M1%20M2%20Handoff%20Review.md) and [latest Part 4 assessment](Part%204%20Integration%20Readiness%20Report.md#user-failure-repair-and-workflow-proof--1-november-2026).

### Earlier model-off checks

Actual retained reports and their matching stores were opened with the existing contract validator and shared evidence reader. The unchanged reviewed `analyzeEvidence(bundle, options)` ran twice on each bundle with `enableAI:false` and an explicit `analysisProfile:'final-hour-explicit-team-intake-v1'`. No resolved-content third argument was supplied.

| Retained input | Findings | Lifecycle findings | Retained evidence blobs | Result |
|---|---:|---:|---:|---|
| Genuine unchanged esbuild 0.25.12 control | 4 | 0 | 340 | Model-off intake passes |
| Fresh-capture picocolors 1.1.1 report | 14 | 0 | 88 | Model-off intake passes |
| Separately labeled inert local picocolors mutation | 16 | 1 | 76 | Model-off intake passes |

These are replays of retained captures, not fresh acquisition or new product reports. Their original incomplete/ambiguous/unverified outcomes remain unchanged. An earlier attempt paired an older npm report with the newer store and correctly failed on a missing retained blob; the failed local log remains preserved. The current fresh-npm report/store pair passes.

The verifier checks the operator-selected full Git commit and every source/config byte against that commit; recursively hashes all 17 source/dist/config files; records both lockfile digests; parses every emitted JavaScript file with the existing TypeScript parser; and requires every static or literal dynamic import to resolve inside the hashed compiled directory. It rejects external/computed/escaping imports, missing imported files, symlinks and obvious indirect code loading. These conservative restrictions fit the current reviewed module. A later delivery with new runtime dependencies requires review and a deliberate intake update.

Every original retained evidence blob is hash-verified before and after both calls. Original report bytes, the input bundle and module/config bytes must remain unchanged. Returned outputs pass existing G0 schema/semantic/reference validation, remain AI-disabled with no interpretations, and are identical across repeated calls. Finding citations are resolved through the shared reader; recorded ranges must remain bound to the correct retained member. Absent sides and unsupported archive-metadata citation formats remain explicitly unresolved: no guessed source snippets are created.

A separate TypeScript 5.8.3 build of the reviewed team module, emitted only into ignored intake scratch, produced all **10** delivered compiled/declaration files byte-identically. This compiles trusted team source; it executes no analyzed package, lifecycle script or rebuild. The verifier itself records compiled-byte identity and does not rerun that compiler step automatically.

All **8** intake tests pass on Node 22.23.4. Negative cases cover hidden/missing/escaping imports and symlinks, invented citations, AI-enabled output, module failure, attempted input mutation, malformed output, detached returned snapshots and pre-cancellation. These are authored boundary tests, not genuine model-failure/inference experiments. The actual runs made zero global-fetch attempts; the separate `analyzeEvidenceWithOpenRouter` export was never invoked. The process runs reviewed trusted team code and is not a hostile-code isolation boundary.

### Earlier explicit-intake commands

Use the existing project tools. Run from the repository root after the normal current-source build; the verifier installs nothing. Choose a **fresh** receipt filename on each run because output is immutable. The module path is supplied by the operator, never by a package, report, source file, browser request or model output.

```sh
export PATH="$PWD/.tooling/node-v22.23.4/node-v22.23.4-darwin-arm64/bin:$PATH"
node --test --test-concurrency=1 scripts/tests/final-module-intake.test.mjs

team_intelligence_root=/private/tmp/heurisko-malhar-review/packages/intelligence
reviewed_team_commit=e8b8116f9960527d0a82e066059d7792c405defe

node scripts/check-final-module-intake.mjs \
  "$team_intelligence_root" "$reviewed_team_commit" \
  examples/part4/user-failures/fresh-npm.report.json \
  examples/part4/user-failures/store \
  .heurisko/FRESH_INTAKE/npm.json

node scripts/check-final-module-intake.mjs \
  "$team_intelligence_root" "$reviewed_team_commit" \
  examples/part4/user-failures/local-inert-mutation.report.json \
  examples/part4/user-failures/store \
  .heurisko/FRESH_INTAKE/local.json

node scripts/check-final-module-intake.mjs \
  "$team_intelligence_root" "$reviewed_team_commit" \
  examples/malhar-handoff/current/esbuild.report.json \
  examples/malhar-handoff/current/store \
  .heurisko/FRESH_INTAKE/esbuild.json
```

Each receipt gets a sibling `.analysis.json` containing the validated returned analysis. The final-hour run's detailed logs, original case receipts, outputs and compile output are retained under ignored `.heurisko/final-hour-20261101-053912/intake/`. The public receipt contains hashes and sanitized evidence identities/ranges, with no private machine or session URLs.

The existing module exports `analyzeEvidence` from `packages/intelligence/dist/index.js`. Its reviewed build command is `pnpm --filter @heurisko/intelligence build` in the team checkout. For the final-hour compile comparison, the repository's existing TypeScript compiler was used directly with the team's reviewed `packages/intelligence/tsconfig.json` and an ignored output directory; no install or team source change was needed.

### Earlier handoff request and remaining model work

1. The final full commit, exact source/module export and setup/build/test commands, including dependency and executable/configuration identity. Send an actual reviewed deliverable rather than only saved model answers.
2. Resolution of the current M1 wording that says old/new command values are unavailable even though this producer retains them. General finding-quality/build-interpretation acceptance remains open; passing references does not prove a claim is supported.
3. The intended deterministic adapter signature and exact settings, including whether/how bounded, hash-verified retained content should be supplied as the optional third argument. This intake currently supplies none.
4. The actual product model/runtime/provider integration and metadata, supported model-off/on behavior, timeouts/failures/rejections/abstention, independent labels and evaluation results. Saved two-question v12 results are not a fresh general accuracy result. Hosted OpenRouter P04 demo eligibility still needs organizer confirmation.
5. A supported end-to-end run over the current engine evidence, with citation/claim review and independent unknown states intact. No model output may change source identity, policy, provenance, severity or deterministic correspondence.

### Earlier product integration plan

The [existing core adapter](../packages/core/src/adapter.ts) already accepts `AnalysisModule` with `moduleId`, `moduleVersion`, `implementationSha256`, `configurationSha256`, optional `interpretationConfigSha256`, and `analyzeEvidence`. The [engine](../packages/core/src/engine.ts) already accepts it through trusted `InvestigationContext.module` and binds those identities into the report configuration. A passing standalone intake does not populate that context.

The concrete integration points are:

- Admit the reviewed team source and its existing dependency/build wiring under `packages/intelligence`; update the exact workspace lock/build order and notices only if the delivered dependency set requires it.
- Supply one trusted reviewed module configuration to the [CLI investigation call](../packages/cli/src/index.ts), the [TUI Start context](../packages/tui/src/App.tsx), and the [server-owned browser engine call](../apps/web/server/workspace.ts). Keep these inputs owned by trusted application setup. The browser must never accept module paths or executable configuration from HTTP data.
- Reuse the [shared task adapter](../integration/part4/src/investigation-task.ts), which already forwards `InvestigationContext`; preserve cancellation/settlement and unavailable-module behavior. A common bootstrap/factory can avoid three competing loaders.
- Generate **new** code/config-bound reports through the actual engine, preserve all historical report bytes, and verify CLI/TUI/browser finding/citation/exit parity plus graceful unavailable/failure behavior. Final joint G3/module quality and actual model acceptance are separate checks.

No product/core/CLI/TUI/web/contract source was changed by this intake preparation. No dependency, model/provider, verifier, policy evaluator, rebuild or monitor was adopted. Git publication, merge, deployment, submission and external teammate messages remain outside this work.
