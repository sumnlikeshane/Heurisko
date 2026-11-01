# Repaired-engine offline public-evidence replay

**Historical after the Linux handoff follow-up:** this capture predates the cross-UID output-permission fix. Use `node scripts/verify-s3-capture.mjs examples/audit-fixes/current --historical`. The latest [handoff replay](../../handoff/current/README.md) binds the host-readable worker. Earlier code-bound claims below describe the original audit repair.

**1 November 2026 · all four cases generated and verified locally.** These are new actual producer runs over the original retained S3 public bytes and transport observations. They are not fresh registry/source/revocation checks. Original S2/S3 files remain unchanged; new configuration/report identities bind the repaired engine and `heurisko-config-v3`. No target package, lifecycle script, build, model or cryptographic verifier runs.

| Case | Report | Bundle | Manifest | Evidence boundary |
|---|---|---|---|---|
| B1 picocolors@1.1.1 | [report](B1.report.json) | [bundle](B1.bundle.json) | [manifest](B1.manifest.json) | Original source version-label conflict remains ambiguous. |
| B2 ts-pattern@5.9.0 | [report](B2.report.json) | [bundle](B2.bundle.json) | [manifest](B2.manifest.json) | Publisher-asserted candidate; no generated equivalence asserted. |
| B3 zod@4.6.7 | [report](B3.report.json) | [bundle](B3.bundle.json) | [manifest](B3.manifest.json) | Unsupported source symlink remains partial/unknown scope. |
| B3R @vue/shared@3.5.22 | [report](B3R.report.json) | [bundle](B3R.bundle.json) | [manifest](B3R.manifest.json) | Explicit user-selected subtree; outside-subtree bytes remain accounted for. |

Every original observed outcome, coverage record and raw change is compared against the old report before a replay output is written. Capture times remain the original public observation times; report creation records the later repair replay. Default reports retain unavailable intelligence and indeterminate requested policy, with exit **2**.

[Corpus manifest](corpus-manifest.json) and [current-code verification](verification.json) bind all report bytes, raw references, licenses and spans. Complete report evidence resolves through SHA-256 in this directory's `store/`. Its recovery receipt records one exact never-started job from an initial failed validation attempt; non-forced removal and confirmed absence preceded releasing only that job's scratch/locks. That failed attempt produced no successful corpus report and was not relabeled as a success.

With the existing pinned Node/Python/Docker setup, from the repository root:

```sh
node scripts/verify-s3-capture.mjs examples/audit-fixes/current --historical
node packages/cli/dist/index.js inspect examples/audit-fixes/current/B2.report.json --store examples/audit-fixes/current/store --json
node scripts/capture-s3.mjs .heurisko/NEW_REPLAY --replay examples/s3/current
```

Choose a new replay destination. The replay fetch adapter refuses URLs whose response/failure was not retained; it never falls back to the network. Source candidates, provenance and raw comparison remain independent. In particular, matching registry integrity does not establish source correspondence or package safety.

The original ISC/MIT artifact license bytes are retained alongside each manifest. Broader source snapshots retain their own rights and notices; no publication or relicensing is implied. See [audit repairs and Malhar handoff](../../../docs/Audit%20Repairs%20and%20Malhar%20Handoff.md). [Refreshed handoff](handoff.json) indexes four actual model-off consumer receipts against unchanged isolated M0/M1 copies, with executable/configuration digests. M0 returns zero findings with heuristics skipped; M1 returns 14/140 on B1/B2. These are boundary checks, not graded explanations. This README does not close S4/G3 or intelligence/model quality acceptance.

[Final validation receipt](validation.json): typecheck/full G0 pass; 114 serial core tests (17 foundation, 48 S2, 36 S3, 13 repair) and 24 separate headless readiness checks pass. Current replay verifies 2,988 evidence references, 1,028 diff-side spans and 146 manifest spans. Original S2/S3 historical verification and actual B2 CLI inspect pass. Earlier concurrent control-window failures and exact recovery/retained-root limits are disclosed in the receipt; no remote CI or full product acceptance is claimed.
