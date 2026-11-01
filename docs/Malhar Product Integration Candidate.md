# Malhar product integration candidate — 1 November 2026

This is an uncommitted local candidate based on PR #3 head `c08a701960b5a539c589ed1ff738f2b5b19a2b38`. It brings `packages/intelligence` from the separate feature checkout at `9fd488e` into this isolated review checkout and wires it through the shared core. The copied package includes the already-present, uncommitted `packages/intelligence/src/index.ts` M1 resolver/direction edit from that checkout. Therefore this source is **not exactly PR #4 head `e8b8116`**, and PR #4's CI does not cover the copied working-tree edit or this product integration. The candidate does not modify the original Malhar checkout, PR #3's remote branch, or PR #4.

## Implemented in this local candidate

- `@heurisko/core` depends on `@heurisko/intelligence`; the engine injects the same module into CLI and TUI investigations.
- The core wrapper preserves the two-argument `analyzeEvidence(bundle, options)` interface. It closes over the shared evidence store and resolves only retained manifest-delta records through `EvidenceStore.get`, which checks the content hash.
- Resolution is bounded to 128 records, 16 KiB per record, and 1 MiB total. Missing, corrupt, or over-limit retained content marks the heuristics stage incomplete and records a limitation.
- Cancellation is checked between retained delta reads; the in-process adapter remains trusted team code and core cancellation still stops waiting rather than forcibly terminating synchronous code.
- Generic difference findings now describe source-only members as having no artifact counterpart, artifact-only members as having no source counterpart, and paired modifications as differing; unresolved scope remains explicitly unresolved.
- Module ID is `@heurisko/intelligence`; version comes from `packages/intelligence/package.json`. The implementation digest covers built module JavaScript plus the core wrapper; configuration digest binds the M1 rules and resolver bounds. The shared G0 report schema is unchanged.
- No product model or policy evaluator is included. With AI requested, the package still reports its adapter unavailable; deterministic findings do not set violation status.

## Validation and limits

- Node **22.23.4** was downloaded to `/private/tmp` from the official macOS arm64 release and matched the official SHA-256 checksum. The exact pnpm 10.14.0 frozen install completed with lifecycle scripts disabled. `pnpm run build` passed for contracts, intelligence, core, Part 4 integration, TUI, CLI, and web.
- Full core tests passed **129/129** under Node 22.23.4. The Part 4 readiness and TUI tests passed **32/32** under the same runtime. Contract/schema validation passed all valid and negative fixtures; the seven F0–F6 shared handshake fixtures passed.
- A fresh end-to-end model-off run on the retained Part 2 Picocolors source plus its **synthetic local inert-mutation archive** used the default `@heurisko/intelligence@0.1.0` module and produced report `report_eb421eb087c8b5aebde0bf1f`. It had 16 findings, including a cited lifecycle-script delta; heuristics and declared coverage were complete; AI was disabled; artifact integrity remained `not_checked` for the local input. The report validated against the shared schema, all evidence references/hash checks passed, and the caller's input object remained unchanged. The equivalent regression is now in `packages/core/tests/s2.test.mjs`. This verifies a fresh generated report from a controlled mutation case; the separate retained-bundle consumer test covers the unmodified release case.
- The consumer checks against the two retained S2 bundles also pass: release/mutation produced 14/16 findings, all retained blobs and finding references validated, heuristic stages completed, and input bundles were unchanged. Finding-quality review remains cautious: baseline differences stay unresolved/limited/undetermined and have low prioritization value; the lifecycle finding is scoped to the manifest evidence and does not infer behavior or intent. Shane's independent quality review is still due.
- The approved exit mapping is covered in the passing core suite: no report→3; violation→1 even when incomplete; incomplete or indeterminate→2; complete pass or not-evaluated policy→0. No policy evaluator is implemented, so configured but unevaluated policies remain indeterminate.
- Seven older private test stores retain `PARSER_CREATE_UNCONFIRMED` recovery records from attempts before the pinned image/runtime setup. Docker currently has no containers for the recorded exact names; the repository recovery script intentionally refuses to unlock a job with an unacknowledged create and no exact container ID. Those stores were left untouched. New test runs used fresh `/private/tmp` roots and the digest-pinned parser; their cleanup passed.
- The candidate is on local branch `codex/malhar-pr3-integration`, based on PR #3 head `c08a701960b5a539c589ed1ff738f2b5b19a2b38`. It remains uncommitted and unpublished. PR #3's remote head and CI therefore do not include these changes. The original Malhar feature checkout remains unchanged. Copied ignored `packages/intelligence/dist` and `packages/intelligence/node_modules` remain in the isolated candidate; automatic review previously rejected their deletion, so they were preserved.

## Still open

- Shane's independent M1 finding-quality/module review and joint G3 acceptance.
- Concrete policy evaluator/configuration and cross-condition policy review.
- TUI export; complete P04 release monitoring; product model integration and inference evaluation.
- Organizer confirmation for hosted OpenRouter P04 demo use.
- Shane's human visual TUI acceptance and team end-to-end acceptance.
- CI on this exact integration revision, which requires the separate commit/push approval gate. The current local build and tests do not stand in for remote CI.

The deterministic analyzer integration is locally wired and accepted by the available automated checks independently of AI. Joint/team acceptance and the remaining P04 gates are still open; hosted-demo permission, commit/push, merge, and submission remain explicit approval gates.
