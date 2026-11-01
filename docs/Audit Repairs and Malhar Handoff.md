# Audit repairs and Malhar handoff

**1 November 2026.** Shane authorized fixing the preceding S1–S3 audit findings and preparing this handoff. This is a foundation repair, not completion of S4, intelligence adoption, model selection, monitoring, policy design or publication. The visual spike and original M0 archive/M1 patch are preserved.

## Repaired foundation

- **Analysis identity:** `AnalysisModule` now requires `implementationSha256` and `configurationSha256` alongside name/version/export. Optional `interpretationConfigSha256` identifies actual inference settings when supplied. Missing/malformed identity is rejected before acquisition/module execution. Internal `heurisko-config-v3` retains these identities; changed executable bytes or rule settings create different configuration/report IDs even when both packages say `0.1.0`. The accepted G0 schema/types/fixtures are unchanged. The engine fingerprint also includes the canonical schema and Python validator/semantic implementation.
- **Progress:** all ten stages have observed terminal callbacks on a returned report, with structured terminal errors where available. Events are immutable snapshots; throwing observers cannot abort collection/persistence. Counts, percentages, live evidence feeds and detach are not fabricated. An async analysis failure/cancellation returns explicit incomplete analysis when a usable report exists.
- **Parser lifecycle:** acknowledged creation uses the full container ID for start/kill/removal. A lost/invalid create acknowledgment cannot become confirmed cleanup through an immediate not-found response. Private `job.json`, outcome, spool and locks remain for exact-job recovery; reuse is rejected. Test teardown also retains real unresolved parser stores. Cancel during acknowledged creation waits for its outcome and never starts the job; attach failure still attempts exact cleanup. Docker create has a 30-second client bound; kill/removal has a 10-second bound. The parser wall deadline remains 30 seconds, forbids starting after expiration, and may be followed by bounded control/cleanup time. CPU, memory, networking and mount controls are unchanged. Targeted delayed-create/timeout/removal tests cover this failure mode. The historical orphan's causal relationship to its source-association assertion is not proven by this repair.
- **History:** original S2/S3 reports, blobs and receipts are unchanged. The repaired-engine [corpus](../examples/audit-fixes/current/README.md) replays retained public observations offline, with new report identities and original capture times. It is not a fresh registry/source/revocation check. CI separates historical verification from current-code replay.
- **Documentation:** root LICENSE/NOTICE are already tracked in `0e6adb9`; earlier pending-commit wording is corrected. No new Git/publication operation is implied.

Explicit recovery, only after reviewing the selected job/store:

```sh
node scripts/recover-parser-job.mjs STORE_ROOT heurisko-parser-EXACT_UUID
```

The command refuses missing, running or wrong-label objects and does not force removal. It records recovery before releasing the selected spool/locks. An absent object after an unacknowledged create remains unresolved; its private root stays preserved.

## What Shane can give Malhar

1. [Original S3 handoff index](../examples/s3/current/handoff.json), B1/B2 bundles/reports and the complete corresponding `examples/s3/current/store/`. JSON alone does not include the retained bytes.
2. B2's nine indexed build-context records and three source maps; exact immutable identities and source limitations are in the manifests.
3. [S2 inert mutation bundle](../examples/s2/current/outputs/synthetic-local-mutation.bundle.json), report and `examples/s2/current/store/`. The `scripts.postinstall` delta is evidence `ev_8e5679afc3b6d3667eb09413`; it records source absence, artifact value `HEURISKO_INERT_TEST_ONLY` and exact half-open artifact byte span `[585,611)`. It was never executed.
4. The repaired-engine corpus for new integration work. Old evidence remains useful; never insert new findings into an old immutable report while retaining its prior configuration/ID.
5. Candidate `integration/part4` report/span reader and its tests. It resolves versioned delta records to linked raw members, preserving unavailable/not-exported/missing/corrupt distinctions. This is not yet an agreed intelligence resolver contract.

## What Malhar needs to return

- Exact current commit and any separate patch digest, package version, build/run commands, dependency/license ledger and the complete reviewed executable file set. Both received revisions say `0.1.0`; name/version alone is insufficient.
- Corrected evidence wording: a [wording-only patch proposal](../integration/malhar/m1-retained-value-wording.patch) is prepared against the received M0+M1 source and has not been applied. Producer values are **retained but unread by the received consumer**, not absent. Distinguish actual source-side absence from unavailable content. Preserve raw pointers/spans and support significant claims with the bytes.
- A bounded read-only content interface agreed with Shane before changing the consumer signature. Existing `analyzeEvidence(bundle, options)` remains the G0 signature; no third argument or resolver was silently added. No content-directed fetches, commands, writes or source/verifier authority.
- Actual B2 packaging/generated-output explanations with supported strength and remaining residuals. Received M1 has 140 B2 findings, all generic unexplained differences; this is compatibility evidence, not build-explanation acceptance. Independently test ordinary omissions, executable additions and metadata-only permission changes, not just filename labels.
- Independent labels and rule/citation-support results, held-out examples and model-off/on comparison. Schema/reference validity alone is not entailment.
- Actual model/weight digest, quantization, runtime, prompt/schema version, decoding and evidence-selection configuration, genuine inference output and failure/injection/invalid-reference tests. No model is selected or integrated by this repair.
- Cancellation behavior for the real inference runtime. Core's in-process timeout stops waiting; it does not prove background inference stopped. Do not claim acknowledged cancellation until the runtime can provide it.
- Agreement on concrete policy semantics and exit precedence. `3` no usable report; otherwise `1` explicit configured violation; otherwise `2` incomplete/indeterminate; otherwise `0`. No policy evaluator or new severity threshold was invented here.

## Adapter identity example

Trusted integration hashes the complete reviewed compiled module and its runtime dependency lock/closure, then canonicalizes the rule configuration. `scripts/check-malhar-handshake.mjs` now records a digest of all reviewed dist files, package metadata and the workspace lock, plus its exact no-model options. Its limits are 128 compiled files and 2 MiB per file; larger real modules need reviewed limits/packaging rather than a bypass. The current received modules have no new runtime dependency. Later native/runtime/model assets need their own exact identities and admission.

```ts
const module = {
  moduleId: '@heurisko/intelligence',
  moduleVersion: packageVersion,
  implementationSha256: reviewedExecutableClosureDigest,
  configurationSha256: canonicalRuleConfigurationDigest,
  // Supply only when actual retained inference configuration exists:
  // interpretationConfigSha256: actualInferenceConfigurationDigest,
  analyzeEvidence,
};
await investigate(input, options, {store, module});
```

No automatic module import is driven by analyzed content. This metadata is a trusted integration responsibility; a self-asserted digest is not signature verification.

## Message to send Malhar

> S1–S3 evidence is ready, and the audit repairs bind analysis reports to executable and rule-config digests rather than package version alone. Please use the handoff index, B1/B2 bundles plus their blob store, and the inert mutation. The postinstall value is retained with an exact byte span; current M1's missing-value wording needs correction. B2 currently produces 140 unexplained findings, so we still need evidence-backed packaging/generated-output explanations and independent labels. Please send your exact latest revision/patch, build commands and dependency ledger, agree bounded read-only evidence access, and supply real model/runtime/weight/config identities, grounded inference and citation/failure tests. Also confirm cancellation behavior and policy semantics. I have preserved your original transfer and have not adopted or rewritten your intelligence source.

The wording proposal is for Malhar to review/apply to his current revision; the original transfer and isolated reviewed source remain unchanged. Development assistance for this repair: Codex; product models used: none.

This message is prepared locally; it has not been sent. Final validation receipts and remaining limits are recorded in plan section 12 and the repaired corpus README. No commit, push, PR, merge, deployment, model inference or submission is claimed.

## Executed validation

[Final receipt](../examples/audit-fixes/current/validation.json): typecheck/full unchanged G0; **114/114** serial core tests (17 foundation, 48 S2, 36 S3, 13 repair); **24/24** nonvisual readiness; four code-bound replay cases; four unchanged actual model-off consumer calls; historical S2/S3 verification; actual new B2 CLI inspect, expected exit 2. Replay retains 2,988 hash-checked references, 1,028 diff spans and 146 manifest spans. Earlier parallel failures, exact stopped-job recovery and a deliberately retained missing-object test root are disclosed. No new remote CI or full S4/G3/model/policy claim is made.

## Linux handoff follow-up

The first draft PR #3 run at `e29a98b` passed documentation, setup, typecheck/contracts, foundation and parser resource probes but failed Linux S2 because UID-65534 output created with umask 077 was not host-readable. The follow-up sets only journal/member transport files to 0644 inside the existing 0700 private host job parent and records/checks worker UID/journal mode. No worker privilege, mount, network or resource restriction is broadened. The cross-UID/private-parent regression increases S2 to 49 tests; the full current core suite is 115. New immutable code-bound replay is under `examples/handoff/current`; all earlier receipts remain historical. Consult PR #3 for its final head and actual remote result.
