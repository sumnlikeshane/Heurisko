# S3 exact npm evidence and local Malhar handoff

**Historical after the 1 November audit repair:** these original outputs remain immutable. Reverify with `node scripts/verify-s3-capture.mjs examples/s3/current --historical`. The [repaired-engine offline replay](../../audit-fixes/current/README.md) has new configuration/report identities and preserves these original observation times; it is not a fresh network check. Original code-bound claims below describe the S3 checkpoint.

These are actual generated static reports, captured on 1 November 2026 with the S3 producer. The earlier [first capture](../README.md) remains historical. All artifacts have matching advertised SHA-512 integrity. Source association and provenance remain separate. Every CLI report exits **2**: Malhar analysis is uninjected, the requested policy is indeterminate, and case-specific uncertainty remains visible. No target installation/script/build, product model or cryptographic verifier ran.

[Corpus manifest](corpus-manifest.json), [verification](verification.json) and [validation summary](validation.json) retain exact URLs, filenames, capture times, advertised/observed digests, full source commits/subtrees, source snapshots/build-context identities, report/configuration IDs, licenses and handoff evidence. Raw archives, original metadata/attestations, member bytes, inventories and deltas resolve by complete SHA-256 through `store/blobs`; immutable run references live separately in `store/runs`. Importable bundles are the actual producer output, without independent labels injected into analyzer input.

| Case | Exact subject and retained outputs | Evidence boundary |
|---|---|---|
| B1 | `picocolors@1.1.1`: [manifest](B1.manifest.json), [report](B1.report.json), [bundle](B1.bundle.json), [ISC license](B1-LICENSE.txt) | Registry `gitHead` candidate; source manifest version differs, so association is ambiguous. Raw inventory/comparison remains usable. |
| B2 | `ts-pattern@5.9.0`: [manifest](B2.manifest.json), [report](B2.report.json), [bundle](B2.bundle.json), [MIT license](B2-LICENSE.txt) | Publisher-asserted immutable candidate; generated distributions and source maps retained without a reproduction/equivalence claim. |
| B3 / U2 | Provisional `zod@4.6.7`: [manifest](B3.manifest.json), [report](B3.report.json), [bundle](B3.bundle.json), [MIT license](B3-LICENSE.txt) | Source archive rejected for `.codex/skills → ../.claude/skills`, a symlink outside the supported entry policy. Known processed scope, bounded inert rejected-entry diagnostics, original bytes and unknown remaining scope are retained. It is replaced for the monorepo demonstration, not relabeled successful. |
| B3R | `@vue/shared@3.5.22`: [manifest](B3R.manifest.json), [report](B3R.report.json), [bundle](B3R.bundle.json), [MIT license](B3R-LICENSE.txt) | Explicit full-commit candidate, `packages/shared` subtree. Broader source bytes remain retained and excluded comparison bytes are counted. Association stays `user_supplied`. |

GitHub API ref requests were rate limited/access denied during capture; these failures are evidence, not missing clean results. B1/B2 retain their registry `gitHead` candidates without claiming current tags were confirmed. The replacement Vue package has no registry `gitHead`; its explicit candidate comes from the full commit link on the [official release page](https://github.com/vuejs/core/releases/tag/v3.5.22). That web retrieval was cached two days at observation and direct commit-page retrieval failed. The archive is fetched at the full immutable commit; no fresh tag, Git-object, signed-tag or provenance verification is implied.

No verifier was admitted. B3/B3R retain any advertised attestation response bytes as **unverified**. All provenance and artifact-binding states remain `not_checked`. A registry signature, decoded statement, publish-only predicate or same-source string is never promoted into authenticated build evidence. Synthetic invalid/publish-only/wrong-subject/signer/policy tests exercise this unavailable adapter boundary; they are not real cryptographic rejection tests. The [S3 ledger](../../../packages/core/npm-source-dependencies.v1.json) records the remaining admission gate and reused pinned tooling.

With the tested setup in the root README, from the repository root:

```sh
node scripts/verify-s3-capture.mjs examples/s3 --historical
node packages/cli/dist/index.js inspect examples/s3/current/B2.report.json --store examples/s3/current/store --json
node packages/cli/dist/index.js inspect examples/s3/current/B3R.report.json --store examples/s3/current/store --json
node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --store .heurisko/NEW_NPM_RUN --no-ai --json
node packages/cli/dist/index.js analyze npm:@vue/shared@3.5.22 --source https://github.com/vuejs/core --commit 5a8aa0b2ba575e098cbb63b396e9bcb751eb3a0f --subdirectory packages/shared --store .heurisko/NEW_SCOPED_RUN --no-ai --json
```

`inspect` is offline historical viewing, retaining the original capture time. It never refreshes registry, source, revocation or freshness state. `inspect ... --evidence ev_ID` returns bounded inert text, or base64 with `--json`, after hash verification. Fresh `analyze` commands perform new bounded acquisition and produce new immutable observations. Exact public canonical versions only; no ranges, aliases, private registries or default-branch fallback. Local archives remain `origin: local` even when their manifests claim one of these releases.

`node scripts/capture-s3.mjs .heurisko/NEW_CAPTURE` reproduces all four genuine captures through the same engine. Choose a new path: saved output is immutable. Each capture manifest includes an independently recomputed SHA-512 check, source-claim IDs, retained build configuration/lockfile/license references and artifact source-map IDs. The verifier independently reopens every report/bundle/blob and checks raw diff spans, exact manifest spans, code fingerprints and local handoff references. A small public case study establishes no general accuracy or performance result.

[Actual CLI/replay checks](cli-replay-check.json) also retain a [fresh B1 CLI observation](live-cli-B1.report.json), the [current-code inert local mutation replay](local-mutation-replay.report.json) and an unavailable-version acquisition receipt. The fresh CLI run preserves B1's report/configuration IDs while saving new full observation bytes. Local mutated bytes retain local identity and unchecked integrity/provenance. `node scripts/check-s3-cli.mjs examples/s3/current .heurisko/NEW_CLI_CHECK/receipt.json` creates separate new receipts/reports using the same retained store and public data; choose a new output path.

Malhar's local handoff is [indexed here](handoff.json). B1/B2 bundles and B2 build/source-map references are ready for his consumer; separate model-off receipts, when listed, exercise the reviewed isolated M0/M1 code. No module source was promoted or changed. No message was sent externally. Generated-output explanation, independent semantic labels, citation entailment, real inference and final workspace integration remain Malhar/joint acceptance work.

Original upstream license bytes are retained. Broader source snapshots may contain additional third-party notices; review their redistribution terms before any authorized publication. Root Apache-2.0 does not relicense upstream material. No commit, push, publication, upload, deployment, submission or external message occurred.
