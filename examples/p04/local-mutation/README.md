# Compact local-input example

This example contains two byte-identical copies of retained inputs, an **actual pre-integration generated report/bundle**, the matching content-addressed evidence store, and the retained upstream ISC license. It is a static local replay of an explicitly synthetic inert mutation; no package is installed or executed, no model runs, and no fresh public registry/source observation is claimed. The [separate connected default output](../../README.md#current-connected-deterministic-output) adds reviewed deterministic findings without altering this capture.

| Item | File |
|---|---|
| Synthetic inert artifact | [picocolors-1.1.1.local-inert-mutation.tgz](inputs/picocolors-1.1.1.local-inert-mutation.tgz) |
| Selected immutable source snapshot | [picocolors source at 7249f8c5d4825550f70bc1ea98652639933d3bbd](inputs/picocolors-source-7249f8c5d4825550f70bc1ea98652639933d3bbd.tar.gz) |
| Actual generated output | [report.json](report.json), [bundle.json](bundle.json) |
| Matching supporting bytes | [store/blobs](store/blobs), [generation and validation receipt](reproduction.json) |
| Upstream rights | [ISC license](LICENSE.upstream.txt) |
| Exact hashes and original-input mapping | [examples manifest](../manifest.json) |

The source target is `https://github.com/alexeyraspopov/picocolors`, full commit `7249f8c5d4825550f70bc1ea98652639933d3bbd`, repository root. The source archive is retained input, not cryptographic proof that these bytes correspond to the npm release. The local artifact adds only the inert `HEURISKO_INERT_TEST_ONLY` lifecycle literal and a comment-only marker file; its local identity inherits no registry-integrity or provenance success.

From the repository root with the [pinned setup](../../../README.md#installation-and-execution), inspect the saved output without Docker or network:

```sh
node packages/cli/dist/index.js inspect examples/p04/local-mutation/report.json \
  --store examples/p04/local-mutation/store --json
```

Expected exit: **2**, with a usable incomplete report. This pre-integration capture records unavailable deterministic analysis and disabled AI. Exact manifest delta bytes remain inspectable despite this limitation. Provenance is `not_checked`; source is `user_supplied`; policy is `not_evaluated`.

To reproduce through the real engine and existing restricted Docker parser, choose a **new** destination. No network is needed for these two selected local archives:

```sh
HEURISKO_ANALYSIS_MODULE=off node packages/cli/dist/index.js analyze \
  --artifact examples/p04/local-mutation/inputs/picocolors-1.1.1.local-inert-mutation.tgz \
  --name picocolors --version 1.1.1 \
  --source https://github.com/alexeyraspopov/picocolors \
  --commit 7249f8c5d4825550f70bc1ea98652639933d3bbd \
  --source-archive examples/p04/local-mutation/inputs/picocolors-source-7249f8c5d4825550f70bc1ea98652639933d3bbd.tar.gz \
  --no-ai --store .heurisko/P04_LOCAL_REPRO_NEW/store \
  --report .heurisko/P04_LOCAL_REPRO_NEW/report.json \
  --bundle .heurisko/P04_LOCAL_REPRO_NEW/bundle.json --json
```

The shipped report was generated with the same command shape into this directory's own new store before the connected default integration. Explicitly setting `HEURISKO_ANALYSIS_MODULE=off` preserves its raw/unavailable-analysis semantics. The receipt records the original exact command, engine identity, output hashes, expected exit and exact lifecycle evidence span. A rerun has a new observation time and may have new code/configuration/report identities; never overwrite the shipped observation. For the separate reviewed deterministic path, use the [connected deterministic replay](../../README.md#connected-deterministic-replay) with a fresh destination. Failure to acquire the Docker/validator boundary remains a failure without host execution.

This local example and index remain uncommitted at preparation time. They do not prove remote publication, final scored-revision CI, meaningful actual model work, monitoring, general finding quality or complete P04 acceptance. Original historical inputs and reports remain unchanged.
