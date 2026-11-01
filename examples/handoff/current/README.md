# S1–S3 handoff: host-readable restricted-parser checkpoint

**1 November 2026.** Four actual producer runs replay the original retained public S3 bytes and transport observations against the static-v5 worker. This is an offline replay, not a fresh registry/source/revocation check. No target installation, script, build, model or provenance verifier ran.

The Linux correction keeps worker UID 65534 and the existing CPU/memory/PID/network/read-only mount controls. Journal/member transport files are non-executable 0644 inside the fresh 0700 private host job parent; private content-addressed storage is unchanged. An actual parser regression checks these properties. Earlier captures remain immutable historical evidence.

| Case | Report | Bundle | Manifest | Retained limitation |
|---|---|---|---|---|
| B1 picocolors@1.1.1 | [report](B1.report.json) | [bundle](B1.bundle.json) | [manifest](B1.manifest.json) | Source version-label conflict remains ambiguous. |
| B2 ts-pattern@5.9.0 | [report](B2.report.json) | [bundle](B2.bundle.json) | [manifest](B2.manifest.json) | Publisher-asserted candidate; no generated equivalence asserted. |
| B3 zod@4.6.7 | [report](B3.report.json) | [bundle](B3.bundle.json) | [manifest](B3.manifest.json) | Unsupported source symlink remains partial/unknown scope. |
| B3R @vue/shared@3.5.22 | [report](B3R.report.json) | [bundle](B3R.bundle.json) | [manifest](B3R.manifest.json) | User-selected immutable subtree; excluded bytes remain accounted for. |

Original outcomes, coverage and raw changes are compared before writing each replay. Capture times remain the original observation times; report creation records this later run. Reports remain analysis-unavailable, policy-indeterminate and exit **2**.

[Verification](verification.json) binds the corrected code, all report bytes, 2,988 evidence references, 1,028 diff-side spans and 146 manifest spans. [Corpus manifest](corpus-manifest.json) identifies each case. Complete bytes resolve by SHA-256 through this directory's `store/`; copying JSON alone is insufficient.

[Handoff index](handoff.json) includes four actual model-off checks of unchanged reviewed M0/M1 consumer copies. M0 returns zero findings/skipped heuristics; M1 returns 14 B1 and 140 B2 findings, all B2 unexplained. These are interface/reference/immutability observations, not rule-quality or explanation-support acceptance. Earlier local-only wording in generated receipts describes the generation step; the authorized draft branch now publishes this checkpoint.

With the pinned setup, from the repository root:

```sh
node scripts/verify-s3-capture.mjs examples/handoff/current
node packages/cli/dist/index.js inspect examples/handoff/current/B2.report.json --store examples/handoff/current/store --json
```

Inspect intentionally exits 2. Replay to a new destination using `scripts/capture-s3.mjs NEW_DEST --replay examples/s3/current`; the fetch adapter refuses unretained URLs and has no network fallback. Do not overwrite immutable captures.

See [Malhar's instructions](../../../docs/HANDOFF_S1_S3.md) and [follow-up validation](../../../docs/HANDOFF_LINUX_VALIDATION.json). Original ISC/MIT license bytes are retained with each manifest; upstream source and other third-party material retain their rights/notices. This checkpoint does not close S4, G1/G3/G4, model integration or complete P04.
