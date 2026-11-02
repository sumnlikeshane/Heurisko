# Independent genuine npm dsse/0.0.2 search

Executed 2 November 2026. **The genuine npm `dsse/0.0.2` acceptance blocker remains open.** No production profile, trust root, dependency, acceptance criterion or target package was changed. Controlled signatures remain test construction, not publisher evidence.

## Baseline and execution

The prior bounded search, `../2026-11-02-closure-implementation-01/real-format-sample-02/capture.json`, inspected eight latest releases and captured six sets, all reported as `dsse/0.0.1`. That receipt remains unchanged. Before this search, the sandbox's direct HTTPS probe of `https://registry.npmjs.org/sigstore/latest` failed with `URLError` / `socket.gaierror: [Errno 8] nodename nor servname provided, or not known`. The subsequent read-only registry and GitHub requests used the approved network-capable execution surface. The denied probe is an environment restriction, not package absence.

`/opt/homebrew/bin/python3.13 search.py` completed under Python 3.13.2. The [capture](capture.json) retains the selection, capture time, script SHA-256, exact URLs, metadata/envelope hashes and decoded log metadata. `registry/` retains the exact raw response bodies. Requests use fixed HTTPS hosts with redirects rejected, 20-second request deadlines, 1 MiB metadata and 256 KiB attestation limits, four concurrent requests and a fixed 48-release-request selection. Only a matching `dsse/0.0.2` discovery could trigger an artifact download; none did. No package was installed, imported or executed.

The purposive sample spans twelve npm tooling/build/framework families with explicitly selected historical versions across late 2024–2026 and current `latest`: `@sigstore/verify`, `@sigstore/sign`, `sigstore`, `npm`, `rollup`, `vite`, `@npmcli/arborist`, `@actions/core`, `typescript`, `esbuild`, `vitest` and `@sveltejs/kit`. It is neither random nor exhaustive.

| Observation | Actual result |
| --- | --- |
| Release requests / distinct resolved releases | 48 / 47; one `latest` duplicates a selected version |
| Captured sets / no advertised attestation / unavailable | 31 / 17 / 0 |
| Decoded log entries | 62 |
| `dsse/0.0.1` | 27 |
| `intoto/0.0.2` | 35 |
| `dsse/0.0.2` | 0 |
| Metadata/envelope/upstream hash verification | All captured receipt hashes matched |
| Bundle `kindVersion` versus decoded canonicalized body | All 62 matched |
| Genuine `dsse/0.0.2` crypto/evaluator positives | None discovered; zero executed |

[Integrity review](integrity-review.json) records the offline checks, current base commit `7eee564818c63b0edbe47e58d7c044136a4470c0` and exact relevant dirty-source file hashes. These observations are structural classifications, not cryptographic acceptance of the sampled alternative formats. `intoto/0.0.2`, bundle `version=0.2` and `dsse/0.0.2` are distinct. In particular the fresh `rollup@4.52.4` capture has `intoto/0.0.2` entries; it does not replace or relabel the older retained Rollup fixture.

## Primary-source investigation

Independent web searches included `site:github.com/npm "dsse/0.0.2"`, `site:github.com/sigstore "npm" "dsseV002"` and `site:github.com "npm" "kindVersion" "0.0.2" "dsse"`. They yielded no validated genuine npm match. An example using `intoto/0.0.2` and generic hand-assembled `dsse/0.0.2` snippets are not eligible substitutes.

[Pinned upstream capture manifest](upstream/manifest.json) retains raw primary-source API records, commit identities, hashes and fixed-commit documentation:

- [Architecture PR 63](https://github.com/sigstore/architecture-docs/pull/63) merged on 19 May 2026 at `d4da33eb688bdfbfe614625454ba21d8ea5d0868`, removing the Rekor-v2 DSSE entry requirement and specifying DSSE PAE/signature handling through hashedrekord.
- [Conformance v0.0.28](https://github.com/sigstore/sigstore-conformance/releases/tag/v0.0.28), published 25 May 2026, removed the old `dsse/0.0.2` tests because that entry type was discontinued.
- [Rekor tiles v2.3.0](https://github.com/sigstore/rekor-tiles/releases/tag/v2.3.0), published 10 June 2026, dropped DSSE entries. [Its exact client reference](https://github.com/sigstore/rekor-tiles/blob/fa390b1c17f9685f7a164da2c06e82dc295cfdca/CLIENTS.md) specifies `hashedrekord/0.0.2` for the DSSE PAE hash and signature. The captured Apache-2.0 license accompanies that reference.

This explains why waiting for new npm `dsse/0.0.2` evidence is unlikely to resolve the gate, but does not prove universal absence of historical entries. No package or public log was written, and no workflow was dispatched.

## Owner decision options

1. **Keep the existing requirement:** retain this blocker until an actual historical npm package/version, unchanged archive, publisher bundle and production-root cryptographic/policy proof for `dsse/0.0.2` are found. A nominated candidate can be investigated without changing the profile. Searching more samples alone cannot prove absence.
2. **Explicitly amend the obsolete-format requirement:** accept the documented upstream removal, remove genuine `dsse/0.0.2` coverage from the production acceptance claim and keep that format unsupported/indeterminate pending separate admission. This needs an owner requirement/compatibility decision and coordinated code, policy, docs and adverse tests; this search makes no such change. This is the recommended decision to consider given upstream's published direction.
3. **Authorize separate hashedrekord admission:** review and implement the current DSSE-PAE `hashedrekord/0.0.2` profile with released dependency identity, exact subject/signature binding, log/checkpoint/timestamp semantics, production-root genuine npm fixtures, full adverse matrix and cross-interface evidence. This is additional trust-boundary scope, not a rename or automatic substitute for option 1.

No option is approved by this report. The current required format and phase-open status remain in force. Native-host and application-lifecycle verification are independent and can continue while this decision is outstanding.
