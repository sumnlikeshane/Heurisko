# M1/M2 pinned lifecycle handoff — 1 November 2026

[PR #4](https://github.com/sumnlikeshane/Heurisko/pull/4) publishes the exact fixture pins, locators and independent v12 review for `e8b8116f9960527d0a82e066059d7792c405defe`. [Review and limits](https://github.com/sumnlikeshane/Heurisko/blob/6985d3eeecdbdc33463458e8072a31e62e86109f/docs/Malhar%20M1%20M2%20Handoff%20Review.md) distinguish a genuine unchanged lifecycle control, labeled local mutation and source/build uncertainty. New files in this directory are local handoff material, not branch contents at that SHA.

- [Machine-readable fixture](fixture.json) pins esbuild 0.25.12, archive digests/URLs, immutable source/subdirectory, unchanged original evidence IDs and exact manifest/value locators. `inputs/` retains original archives and the separately hashed historical picocolors local mutation. Manifest copies are inert bytes, never package installations.
- [Original producer report](esbuild.report.json), [bundle](esbuild.bundle.json) and `store/` retain the actual static acquisition and source omissions, using unchanged producer `81346271f5a3789b4b43fd8f379014656011823d`. The source parser reports `ARCHIVE_UNSUPPORTED_ENTRY`; the report remains incomplete and CLI exit 2. Both esbuild manifests are fully retained and byte-identical; this does not prove package safety or artifact-to-source provenance.
- [Model-off handoff checks](model-off-handoff.json) and three `*.analysis.json` files are actual unchanged-module outputs: zero lifecycle findings for esbuild and genuine picocolors; one for the synthetic local picocolors mutation, citing its existing delta ID. No input mutation or inference. Picocolors source's 1.1.0/1.1.1 version conflict remains visible.
- [Independent v12 archive/excerpt receipt](v12-independent-review.json) records direct static verification against the retained wheel/sdist. [Validation/publication receipt](validation.json) separates local tests, remote CI and local-only artifacts.

Byte offsets are zero-based half-open UTF-8 spans; line ranges are one-based inclusive. The genuine esbuild `postinstall` is present unchanged on both sides. The positive delta is explicitly synthetic, not a genuine upstream compromise. No lifecycle command, analyzed package, rebuild or model was executed during this handoff. Esbuild retains its MIT license inside the original artifact/source and store; picocolors retains its ISC license in the original archives. Public upstream assets keep those licenses.

Replay inspection with the existing pinned foundation checkout:

```sh
node packages/cli/dist/index.js inspect /path/to/examples/malhar-handoff/current/esbuild.report.json --store /path/to/examples/malhar-handoff/current/store --json
```

The handoff consumer was built in the isolated `codex/malhar-rag-evaluation` checkout using `pnpm run test:contracts`; it was called explicitly with AI disabled. No CLI loader, product model, policy or G0 change is adopted. Hosted OpenRouter demonstration remains subject to organizer confirmation.
