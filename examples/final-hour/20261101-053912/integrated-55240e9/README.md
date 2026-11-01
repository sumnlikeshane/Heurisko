# Default deterministic integration example

This is an actual new CLI investigation through the default shared engine after admission of Malhar's reviewed `55240e99409ad44cbd6a978f40873ef410cb1861` deterministic rules and the bounded retained-content adapter. It reuses the [inert local artifact and selected source archive](../../../p04/local-mutation/README.md). The original preintegration inputs/report/store remain unchanged; no package code, model, provider or rebuild runs.

The [actual report](report.json), [bundle](bundle.json), matching [evidence store](store) and [validation receipt](validation.json) record **16 findings**, including the exact `scripts.postinstall` **addition**, citing `ev_e7075cb69f91c7e1b4c4223f`. The original retained artifact bytes `[585,611)` contain the inert JSON literal `"HEURISKO_INERT_TEST_ONLY"`. The source manifest independently confirms that this key is absent.

CLI exit: **0**. Declared static processing is complete; source correspondence remains **unresolved**, source association **user_supplied**, provenance **not_checked**, and policy **not_evaluated**. Neither this exit nor the finding is a safety, build-origin or complete-P04 claim. The preintegration canonical report still retains its original incomplete status and exit 2.

From the repository root with the pinned existing setup:

```sh
node packages/cli/dist/index.js inspect \
  examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store --json

node packages/cli/dist/index.js tui \
  examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store

pnpm web --report examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store
```

The browser prints a private local session URL: keep it out of documents and screenshots. Saved viewing does not run another investigation. Actual native TUI/browser acceptance is recorded separately from this CLI/evidence proof.

To generate another default report through the existing restricted Docker parser, choose a new destination:

```sh
env -u HEURISKO_ANALYSIS_MODULE node packages/cli/dist/index.js analyze \
  --artifact examples/p04/local-mutation/inputs/picocolors-1.1.1.local-inert-mutation.tgz \
  --name picocolors --version 1.1.1 \
  --source https://github.com/alexeyraspopov/picocolors \
  --commit 7249f8c5d4825550f70bc1ea98652639933d3bbd \
  --source-archive examples/p04/local-mutation/inputs/picocolors-source-7249f8c5d4825550f70bc1ea98652639933d3bbd.tar.gz \
  --no-ai --store .heurisko/NEW_DEFAULT_REPLAY/store \
  --report .heurisko/NEW_DEFAULT_REPLAY/report.json --json
```

Missing/empty host selection now uses reviewed deterministic `55240e9`; `HEURISKO_ANALYSIS_MODULE=off` preserves raw-only reproduction and its unavailable-module diagnostics. `--no-ai` disables model requests while retaining deterministic analysis. [Module admission, exact boundaries and quality limits](https://github.com/sumnlikeshane/Heurisko/blob/6985d3eeecdbdc33463458e8072a31e62e86109f/docs/Final%20Module%20Intake.md) remain explicit. Upstream example material retains its [ISC license](../../../p04/local-mutation/LICENSE.upstream.txt). These new files remain local until separately authorized Git delivery.
