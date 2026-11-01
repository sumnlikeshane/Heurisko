# Representative inputs and actual generated outputs

Start here to review Heurisko's examples. The cases below connect **real input bytes → actual generated report → supporting evidence and reproduction commands**. The public-release cases retain historical capture times and unresolved states. The compact synthetic inert local mutation preserves its actual pre-integration report; the connected default has a separate newly generated output below. Opening any saved report performs no fresh registry, source or revocation check.

The [machine-readable input/output manifest](p04/manifest.json) pins archive/source/report/bundle/license hashes and stores. The [fresh local examples-requirement receipt](final-hour/20261101-053912/examples-requirement.json) records actual path/hash/reproduction checks. These additions are local and uncommitted; they do not establish publication, final scored-revision CI, event submission or full P04 completion. No original report, store or historical receipt is replaced.

## Current connected deterministic output

The reviewed `55240e9` default produced a separate [actual report](final-hour/20261101-053912/integrated-55240e9/report.json) and [matching store](final-hour/20261101-053912/integrated-55240e9/store) from the compact retained local inputs. [The module validation record](../docs/Final%20Module%20Intake.md) records the actual run. Report `report_1366f57f990327d57dd6ad73` contains **16 deterministic findings, including one lifecycle finding** identifying `scripts.postinstall` as added to the artifact, with high evidence confidence and exact retained bytes. AI is disabled; no model/provider runs.

This new report exits **0** for its completed declared static checks. Source remains `user_supplied`, provenance `not_checked`, correspondence `unresolved`, and policy `not_evaluated`. Exit 0 is not package safety, verified source correspondence or full P04 completion. The three older/raw reports below keep their original unavailable-analysis state and exit 2. Use the [connected replay instructions](#connected-deterministic-replay) to create another report with a fresh destination.

## Three representative cases

| Case | Input archive and immutable source bytes | Actual generated output and supporting files | What to inspect |
|---|---|---|---|
| **Genuine public release: ts-pattern 5.9.0** | [Published tarball bytes](handoff/current/store/blobs/ecea9dd2a1460293929c97fb5118fa3f93a2fb37a59a0a79384203d3ff64f368); [source snapshot](handoff/current/store/blobs/e0cbf670c4c3635a48e17cd76eaee09a6d10cd5110f411845ad0b02da9233ab7), commit `0e15315eafbbb813a91bad34496418846981c1b1`, repository root. | [Report](handoff/current/B2.report.json), [generated bundle](handoff/current/B2.bundle.json), [capture manifest](handoff/current/B2.manifest.json), [matching content-addressed store](handoff/current/store), [MIT license](handoff/current/B2-LICENSE.txt). | Matched registry digest and publisher-asserted source candidate; 143 raw change records plus retained build context/source maps. Generated-looking paths are not equivalence or harmlessness proof. |
| **Synthetic local mutation: picocolors 1.1.1** | [Compact inert artifact](p04/local-mutation/inputs/picocolors-1.1.1.local-inert-mutation.tgz); [retained source snapshot](p04/local-mutation/inputs/picocolors-source-7249f8c5d4825550f70bc1ea98652639933d3bbd.tar.gz), commit `7249f8c5d4825550f70bc1ea98652639933d3bbd`, repository root. [Unaltered public control](part4/user-failures/inputs/picocolors-1.1.1.tgz) remains separate. | [Actual pre-integration report](p04/local-mutation/report.json), [generated bundle](p04/local-mutation/bundle.json), [matching compact store](p04/local-mutation/store), [exact generation/validation receipt](p04/local-mutation/reproduction.json), [ISC license](p04/local-mutation/LICENSE.upstream.txt), [standalone guide](p04/local-mutation/README.md). | Exact `scripts.postinstall` value `HEURISKO_INERT_TEST_ONLY`, evidence `ev_e7075cb69f91c7e1b4c4223f`. No target code executes. Local bytes inherit no registry-integrity/provenance success; the source is an explicitly selected comparison target. |
| **Incomplete source: zod 4.6.7** | [Published tarball bytes](handoff/current/store/blobs/84efd155bed93270286e793fc951be270b536cbd5b0eeb111f0fa3967201d698); [source snapshot](handoff/current/store/blobs/ac25c3bcd722faabc689bb86e12f94de72ad36e70d496cafbcff09b120f60be4), commit `b500a2ee95134f81d74da7911d7378dd2853d042`, repository root. | [Report](handoff/current/B3.report.json), [generated bundle](handoff/current/B3.bundle.json), [capture manifest](handoff/current/B3.manifest.json), [matching store](handoff/current/store), [MIT license](handoff/current/B3-LICENSE.txt). | Unsupported source symlink, missing source manifest, partial inventory/comparison and 843 unresolved records. Unknown remaining scope is retained. No favorable source-correspondence result is inferred. |

Files in `store/blobs/` deliberately use SHA-256 filenames without extensions. The linked archive/source rows identify which blobs are original input archives. Extracted members, metadata, deltas and analysis configuration resolve through the same store. Copying only a report file omits its evidence bytes. The two public-release cases share one existing store; the local case generates its own compact matching store from 12,338 input bytes. No large historical store is duplicated.

All three primary reports intentionally exit **2** because usable evidence is materially incomplete. Their recorded raw/default configuration has unavailable deterministic analysis. The connected reviewed default creates a separate new report; it does not alter these pre-integration outputs. Zero findings with unavailable analysis does not establish that no suspicious modifications exist. Provenance is `not_checked`; no concrete policy evaluator or monitor is active. Product models used by these cases: **none**. Coding assistance: **Codex**.

## Open and verify offline

From the repository root, use the existing pinned environment described in the [installation instructions](../README.md#installation-and-execution):

```sh
export PATH="$PWD/.tooling/node-v22.23.4/node-v22.23.4-darwin-arm64/bin:$PWD/.venv/bin:$PATH"
node packages/cli/dist/index.js inspect examples/handoff/current/B2.report.json --store examples/handoff/current/store --json
node packages/cli/dist/index.js inspect examples/p04/local-mutation/report.json --store examples/p04/local-mutation/store --json
node packages/cli/dist/index.js inspect examples/handoff/current/B3.report.json --store examples/handoff/current/store --json
```

Each command returns its saved validated observation and exits 2. The local report is a new static replay; the two public-release reports preserve historical captures. Run the commands separately; `&&` stops at the intentional nonzero result. Inspect verifies retained evidence hashes. `tui REPORT --store STORE` opens the same report in an actual TTY; redirected TUI operation prints the corresponding summary.

For full retained-blob/CLI/non-TTY/portable-reopen verification of the original three retained demonstration cases, choose a fresh ignored destination:

```sh
node scripts/verify-final-demo.mjs .heurisko/EXAMPLES_VERIFY_NEW
```

This verification needs the pinned validator, but neither the network nor the Docker parser. It preserves report bytes and exports all retained evidence to new portable directories. The [demo runbook](../docs/Final%20Hour%20Demo%20Runbook.md) provides the browser launch, exact evidence navigation and offline narration.

## Generate another report from retained local inputs

This command invokes the real current engine and the existing restricted Docker static parser on the compact supplied local mutation and source archives. The shipped pre-integration result is [recorded here](p04/local-mutation/reproduction.json); explicit `off` preserves its raw/unavailable-analysis semantics. It makes no registry/source request, runs no lifecycle/build code and calls no model. It generates a new local report rather than rewriting the historical example. Use a new destination for every run:

```sh
HEURISKO_ANALYSIS_MODULE=off node packages/cli/dist/index.js analyze \
  --artifact examples/p04/local-mutation/inputs/picocolors-1.1.1.local-inert-mutation.tgz \
  --name picocolors --version 1.1.1 \
  --source https://github.com/alexeyraspopov/picocolors \
  --commit 7249f8c5d4825550f70bc1ea98652639933d3bbd \
  --source-archive examples/p04/local-mutation/inputs/picocolors-source-7249f8c5d4825550f70bc1ea98652639933d3bbd.tar.gz \
  --no-ai --store .heurisko/EXAMPLE_LOCAL_NEW/store \
  --report .heurisko/EXAMPLE_LOCAL_NEW/report.json \
  --bundle .heurisko/EXAMPLE_LOCAL_NEW/bundle.json --json
```

Expected: exit **2**, origin `local`, integrity/provenance `not_checked`, source `user_supplied`, AI `disabled`, and explicit `ANALYSIS_MODULE_UNAVAILABLE`. Current code/configuration and new observation times may give new report/configuration/content IDs. Confirm the exact inert lifecycle delta and declared coverage in the generated output; do not expect byte-identical timestamps. Docker/validator failures remain failures, with no host-execution fallback.

## Connected deterministic replay

The raw command above explicitly selects `HEURISKO_ANALYSIS_MODULE=off` so it retains the canonical example's unavailable-analysis semantics. Ordinary new investigations now use the reviewed deterministic entry from `55240e99409ad44cbd6a978f40873ef410cb1861`. Generate a **separate** report with the [connected CLI replay](../docs/CLI%20Reference.md#deterministic-analysis-and-raw-only-replay) and fresh output paths; `HEURISKO_ANALYSIS_MODULE=55240e9` explicitly pins the same default. `--no-ai` leaves those deterministic checks active; it performs no model/provider call. [Final module intake](../docs/Final%20Module%20Intake.md) records actual configured outputs and validation separately from these original reports and pre-integration receipts.

The selector is trusted host configuration only. An absent/empty setting uses the reviewed default; `off` retains unavailable analysis. An unknown nonempty selector is rejected before acquisition. No package, uploaded file or HTTP request chooses executable module code. Bounded hash-checked delta/member resolution retains missing/corrupt/over-limit evidence as limited/unexplained with incomplete heuristics. Configured findings do not establish benignness, verified generated/build equivalence, provenance-policy success, monitoring or actual AI use.

## Fresh public acquisition

The exact-version command below performs a **new network acquisition** through the same engine, selecting the explicit immutable comparison target retained above. It needs public npm/GitHub access and the existing Docker parser. Network metadata, availability and observations may change. It does not reproduce historical freshness or turn a selected source target into verified release binding:

```sh
HEURISKO_ANALYSIS_MODULE=off node packages/cli/dist/index.js analyze npm:ts-pattern@5.9.0 \
  --source https://github.com/gvergnaud/ts-pattern \
  --commit 0e15315eafbbb813a91bad34496418846981c1b1 \
  --no-ai --store .heurisko/EXAMPLE_PUBLIC_NEW/store \
  --report .heurisko/EXAMPLE_PUBLIC_NEW/report.json \
  --bundle .heurisko/EXAMPLE_PUBLIC_NEW/bundle.json --json
```

A useful incomplete report normally exits 2; an acquisition/invocation failure with no usable report exits 3. The local examples receipt distinguishes commands actually executed in this session from this documented fresh-network command. No fresh execution is inferred from its presence here.

## Rights and remaining scope

Original package/source bytes keep their upstream rights and notices. The retained package licenses above are MIT/ISC; root Apache-2.0 does not relicense them. Broader source snapshots may contain additional third-party material, and their complete notices have not all been reviewed; the zod source inventory itself is incomplete. This index authorizes no additional upload/publication. Organizer-supplied DOCX/PDF files are not example inputs to the analyzer.

Additional historical material is indexed in [S3 captures](s3/current/README.md), [the handoff corpus](handoff/current/README.md), [the exact TUI workflow/reproduction](part4/user-failures/README.md), and [current web acceptance](web-overhaul/current/README.md). The optional model-off team-module report is validation-only and remains separate from these default-product examples. No live AI, complete monitoring, general accuracy, harmlessness, full P04 or remote compliance claim follows from this index.
