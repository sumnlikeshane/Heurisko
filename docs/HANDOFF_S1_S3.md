# S1–S3 integration checkpoint for Malhar

**Branch:** `handoff/s1-s3-audit-fixes`

**Date:** 1 November 2026, Asia/Kolkata

**Purpose:** a fixed, tested evidence-engine baseline while S4 continues separately. Use the exact commit SHA sent with the draft PR. Main remains unchanged until separately approved integration and merge.

## What is included

- `packages/core`: safe local/exact-public-npm acquisition, strict SHA-512/SHA-256 integrity, immutable GitHub source candidates/subtrees, raw inventories/deltas/spans, content-addressed evidence, report persistence, runtime validation and orchestration.
- `packages/cli`: actual `analyze` and retained-report `inspect`, machine JSON/stdout separation, cancellation requests and tested 0/1/2/3 exit precedence.
- Existing canonical G0 contracts, the shared Python runtime validation bridge, pinned workspace/tooling and CI.
- Audit fixes: exact executable/rule-configuration identity, terminal progress events, observer isolation, conservative Docker create/cleanup handling, explicit stopped-job recovery and regressions.
- `examples/s2`, `examples/s3` and `examples/audit-fixes/current`: actual retained public inputs, immutable reports, complete blob stores, licenses, verification and model-off consumer receipts. Historical and repaired-engine replay are explicitly distinguished.
- `integration/part4`: a **nonvisual candidate** report/span reader and cancel-request/progress wrapper, with 24 headless checks. This is not an agreed intelligence resolver or completed production TUI.
- `integration/malhar/m1-retained-value-wording.patch`: a checked wording-only proposal against the received M0+M1 source. It has not been applied to your source.

The separate visual spike, generated dependencies/builds/private tooling, local parser scratch and original incoming M0 archive/M1 patch are excluded. The latter remain available to Shane locally; their hashes/provenance and actual test receipts are retained. No intelligence source was rewritten, adopted or substituted. Existing organizer documents are inherited from the already merged baseline, not newly added by this handoff.

## What this checkpoint does not establish

No actual product model, admitted provenance verifier, concrete policy evaluator, generated-output explanation, browser, release monitor or finished TUI is integrated. Current default CLI reports remain `ANALYSIS_MODULE_UNAVAILABLE`, materially incomplete, and exit **2**. Requested policy is indeterminate. The static parser is not an admitted hostile rebuild worker. No target installation, lifecycle script, build or model inference ran in these examples.

G0 is unchanged. Source candidates are assertions/comparison targets, not verified release correspondence. New report IDs bind the repaired engine; original captures retain their original bytes/IDs/times. Offline replay is not a fresh registry/source/revocation check. Earlier receipts saying no commit/push/publication describe the sessions that generated them, before this handoff publication.

## Start here

1. Fetch this branch and inspect the supplied commit SHA in a clean worktree or your own integration branch. Preserve your current intelligence work. Coordinate before changing shared contracts or core integration APIs.
2. Read [audit repairs and the detailed Malhar handoff](Audit%20Repairs%20and%20Malhar%20Handoff.md), [repaired replay](../examples/audit-fixes/current/README.md), and its [handoff index](../examples/audit-fixes/current/handoff.json).
3. Follow [tested setup/run instructions](../README.md#installation-and-execution): Node 22.23.4, pnpm 10.14.0, Python 3.13/hash-locked requirements and the digest-pinned local Docker parser. Fetching/installing analyzed packages or running their scripts is not part of setup.

After that setup, from this checkout:

```sh
pnpm run typecheck
pnpm run test:contracts
pnpm run test:foundation
pnpm run test:s2
pnpm run test:s3
pnpm run test:audit
node scripts/verify-s3-capture.mjs examples/audit-fixes/current
node packages/cli/dist/index.js inspect examples/audit-fixes/current/B2.report.json --store examples/audit-fixes/current/store --json
```

The final inspect command intentionally exits 2. Run Docker suites serially. Local parser cleanup uncertainty preserves job records/locks; do not erase them to make a run appear clean. [Recovery procedure](Audit%20Repairs%20and%20Malhar%20Handoff.md#repaired-foundation) requires the exact stopped job and store identity.

## Exact evidence to consume

| Input | Bundle/report | Required byte store | Important limit |
|---|---|---|---|
| B1 `picocolors@1.1.1` | `examples/audit-fixes/current/B1.bundle.json` and `B1.report.json` | `examples/audit-fixes/current/store/` | Artifact integrity matched; source manifest is 1.1.0, so association remains ambiguous. |
| B2 `ts-pattern@5.9.0` | `examples/audit-fixes/current/B2.bundle.json` and `B2.report.json` | Same store | Publisher-asserted source candidate; nine build-context records and three maps indexed in the handoff. No generated equivalence claimed. |
| Inert local mutation | `examples/s2/current/outputs/synthetic-local-mutation.bundle.json` and matching report | `examples/s2/current/store/` | Explicit local input. The postinstall value is retained and was never executed. |
| Unsupported/monorepo cases | B3/B3R in the repaired replay directory | Repaired replay store | Zod has partial unsupported source scope; Vue is a user-selected immutable subtree with exclusions. |

Copying bundle JSON alone is insufficient. `contentRef` resolves only through SHA-256 in the corresponding store, with byte-hash verification. Use only bounded read-only access; no arbitrary path/URL reads, redownloads, code execution or fact/status mutation.

## What Malhar needs to do

1. **Supply the current exact revision:** commit SHA and any separate uncommitted patch/digest, package version, named export, build/run commands, dependency/license ledger and reviewed executable closure. The received M0/M1 both say `0.1.0`; version alone does not identify them.
2. **Integrate the unchanged G0 consumer:** `analyzeEvidence(bundle, options)`. Core's trusted `AnalysisModule` wrapper now also requires `implementationSha256` and `configurationSha256`, and optionally the digest of actual retained inference configuration. [Adapter example](Audit%20Repairs%20and%20Malhar%20Handoff.md#adapter-identity-example). Do not infer these from a package-supplied claim or change G0 merely to add wrapper metadata.
3. **Agree evidence access:** the received consumer currently uses no resolver. Agree bounds, missing/corrupt/not-exported behavior and cancellation before adding one. Inspect the nonvisual candidate reader and the exact JSON delta-to-member/span mapping.
4. **Correct the wording and evaluate the rules:** retained values are currently unread by the consumer, not missing from the producer. Review the proposed patch against your latest revision. Test ordinary omissions, lifecycle/entrypoint changes, executable additions and metadata-only permission changes with independent labels. Current received M1 yields 14 B1 findings and 140 B2 findings; all B2 findings are unexplained. Those counts are boundary observations, not accuracy or explanation-quality acceptance.
5. **Deliver build/packaging explanations:** use actual B2 source/maps/configuration to support the claimed strength and preserve residuals. Generated-looking paths alone are insufficient. Rebuild execution remains unavailable unless a separately approved containment boundary exists.
6. **Deliver meaningful open-model work:** exact model/weight/quantization/runtime/prompt/schema/decoding/evidence-selection identities, grounded actual inference and alternatives/abstention, citation support and injection/invalid-reference/timeout/unavailability tests, plus held-out and model-off/on evaluation. No model was selected or installed by this handoff.
7. **Confirm runtime cancellation and policy behavior:** core's in-process timeout stops waiting; it does not prove inference stopped. Agree concrete evaluator semantics and retain exit precedence: no usable report 3; otherwise configured violation 1; otherwise incomplete/indeterminate 2; otherwise 0. No new severity threshold or policy pass is implied.
8. Return your tested revision, output reports/receipts and known limitations for joint G1/G3/G4 review. Do not overwrite old immutable reports with new findings or claim complete P04 from a successful handshake.

You can call `scripts/check-malhar-handshake.mjs BUNDLE STORE NEW_RECEIPT YOUR_REVIEWED_INTELLIGENCE_PACKAGE` after building your module; it disables AI, checks references/input immutability and records the reviewed dist/package/workspace-lock identity. It does not grade claims. Run actual inference only under the separately agreed model setup.

## Validation and publication boundary

The repair baseline passes typecheck/full unchanged G0, **114 serial core tests** (17 foundation, 48 S2, 36 S3, 13 repair), **24** separate headless readiness checks, four current-code replay cases and four actual model-off consumer calls. Replay verifies 2,988 evidence references, 1,028 diff spans and 146 manifest spans. [Immutable receipt](../examples/audit-fixes/current/validation.json) also discloses earlier concurrent failures and conservative recovery. Source/compiled M0/M1 hashes match their original receipts; the wording patch passes applicability check but is not applied.

The [assembled-checkpoint validation](HANDOFF_VALIDATION.json) passes the same 114 core/24 nonvisual checks, actual parser-boundary probes, corpus checks, 40 Markdown link/anchor checks and 15 research checksums. The frozen pnpm install reused pinned cached packages; local Python validation reused the existing hash-locked environment. Draft-PR CI performs its own setup. Check the draft PR for its exact current remote result; local/historical receipts are not a remote pass. Do not merge this branch to main, publish a release, submit the project or send external messages without the relevant approval. S4 remains in progress separately. Git attributes preserve exact retained-example bytes across checkout newline settings. Original project material is Apache-2.0; upstream ISC/MIT source/artifacts and other inherited third-party material retain their own rights/notices.

Product models used in this checkpoint: **none**. Coding assistance: **Codex**.
