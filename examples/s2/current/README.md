# S2 final retained local evidence

These are actual generated outputs from Shane's Part 2 implementation, captured on 31 October 2026. They demonstrate raw local archive/source comparison. They do not establish complete P04, verified release correspondence, benignness, model inference or monitoring.

[Capture manifest](capture-manifest.json) retains exact public URLs, capture times, full digests, the explicit source commit and a separate mutation oracle. [Verification](verification.json) records hash/replay/span checks and the later real consumer handshakes. The manifest's adapter entry describes the CLI's uninjected adapter; the separate handshake receipts record the subsequently tested team code.

| Case | Actual report | Bundle for the consumer |
|---|---|---|
| Captured `picocolors@1.1.1`, supplied as local bytes | [Release report](outputs/release-local-input.report.json) | [Release bundle](outputs/release-local-input.bundle.json) |
| Clearly synthetic local copy with an inert manifest literal and comment-only file | [Mutation report](outputs/synthetic-local-mutation.report.json) | [Mutation bundle](outputs/synthetic-local-mutation.bundle.json) |

Both reports return **2**: raw comparison is complete, but Malhar analysis was not injected into these CLI runs and the requested policy is indeterminate. Local bytes have `origin: local`, integrity `not_checked`, source `user_supplied`, provenance `not_checked`; matching filenames/metadata do not upgrade trust. The source comparison target is `https://github.com/alexeyraspopov/picocolors` at `6f0a4638348ed20633d623ee973f9c9a96f65104`, with the repository root selected.

The baseline has 7 artifact files and 19 source files: 5 equal, 2 modified and 12 source-only members. The mutation has one additional comment-only member and a changed `scripts.postinstall` literal. Existing release/source differences remain unexplained; no accusation about an upstream maintainer is implied. The literal `HEURISKO_INERT_TEST_ONLY` is test data and was never executed.

With the tested setup in the root README, run from the repository root. `node scripts/verify-s2-capture.mjs examples/s2/current --historical` rechecks historical code receipts, hashes, spans and real consumer receipts (the current S3 code is separately bound by its own capture) without replacing its saved verification; an optional third argument saves a new immutable check receipt.

The CLI commands are:

```sh
node packages/cli/dist/index.js inspect examples/s2/current/outputs/release-local-input.report.json --store examples/s2/current/store --json
node packages/cli/dist/index.js analyze --artifact examples/s2/current/inputs/picocolors-1.1.1.tgz --source https://github.com/alexeyraspopov/picocolors --commit 6f0a4638348ed20633d623ee973f9c9a96f65104 --source-archive examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz --name picocolors --version 1.1.1 --store .heurisko/s2-replay --no-ai --policy s2-requested-analysis --json
```

Exit 2 is expected. `inspect ... --evidence ev_ID` resolves and hash-checks the stored bytes, presenting an inert bounded excerpt; `--json` returns base64 for that content. Replay uses retained observations and does not perform a fresh registry or revocation check. To capture the explicit URLs again, `node scripts/capture-s2.mjs .heurisko/NEW_CAPTURE_DIRECTORY` requires network and the pinned parser image. Use a new directory because retained outputs are immutable.

`contentRef` is exactly `sha256:<64 lowercase hexadecimal characters>`. Resolve it through `EvidenceStore.get(ref)` against this example's `store`; the resolver verifies the complete digest and accepts no arbitrary filesystem path. All report evidence, raw archives, member contents, inventories, deltas and configuration are retained in `store/blobs/`. Manifest locators use G0 dotted simple keys such as `scripts.postinstall`; the retained delta always includes an exact JSON pointer and half-open byte spans. Raw differences contain an enclosing changed byte span and bounded base64 excerpts; full member bytes remain available. The store separates immutable reports/run references from the reserved mutable `state/` area. [Actual inspect/offline/live-source checks](replay-check.json) also retain a [later direct-source observation](outputs/live-pinned-source.report.json) under the same deterministic report ID and a different full report digest; the original bytes remain intact.

Malhar's original M0 archive and distinct uncommitted M1 patch were reviewed and built in separate ignored copies. No received heuristic source was rewritten or promoted into the product workspace. These model-off receipts used the actual bundles, frozen input snapshots and the shared runtime validator:

- [M0 release](m0-release-handshake.json) and [M0 mutation](m0-mutation-handshake.json): boundary only, zero findings and heuristics skipped.
- [M0+M1 release](m1-release-handshake.json) and [M0+M1 mutation](m1-mutation-handshake.json): 14 and 16 initial-rule findings; the mutation cites the real `scripts.postinstall` delta. Schema, references and input immutability pass. Rule accuracy and value-availability wording still need Malhar review; these receipts do not close joint G1 or final Part 7 integration.

[Parser control probes](parser-boundary-results.json) and [validation log](validation.txt) record executed local checks. The log replaces the private absolute workspace prefix with `<workspace>`. No product model, target package script or rebuild ran. The package and source retain their ISC rights; [original LICENSE](PICOCOLORS-LICENSE.txt) is included. Nothing here was uploaded to a registry or published by this session.
