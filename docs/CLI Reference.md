# Heurisko CLI reference

**Source-inspected:** 1 November 2026, Asia/Kolkata, [current CLI parser](../packages/cli/src/index.ts). This documents the local shared engine, static evidence producer and default reviewed deterministic integration; no new command is implemented by this document. [The capability map](../HEURISKO_COMPLETE_GUIDE.md#2-capability-map) defines current interface differences; [web usage](../apps/web/README.md) documents the separate reader/export tools.

## Setup and command availability

Use the pinned [installation and execution instructions](../README.md#installation-and-execution): Node **22.23.4**, pnpm **10.14.0**, Python validator environment and the configured restricted Docker static parser for new archive analysis. `pnpm run build` builds the workspace. Saved-report inspection/viewing needs retained evidence and validation, not fresh registry acquisition or target execution. There is no published installer/distribution claim here.

Examples use `node packages/cli/dist/index.js`, the built repository executable. `heurisko` below names the same CLI contract where a local command binding exists. The product CLI opens the TUI with **no arguments when stdin/stdout are terminals**; without a terminal it prints help. Root `--help` prints help. The TUI supports local/npm review, actual engine progress/cancel and retained evidence reading; human visual/design acceptance remains separate from the local functional checks. Root `--store DIR`, `--no-color`, `--ascii` and `--palette` configure the interactive entry. `analyze --help` and `inspect --help` are not supported subcommand help syntax.

| Available now | Description |
|---|---|
| `analyze npm:NAME@EXACT_VERSION [options]` | Public npm artifact acquisition, integrity/source evidence and raw comparison |
| `analyze --artifact FILE [options]` | Local tar/tar.gz evidence; optional explicit source comparison |
| `inspect REPORT_FILE_OR_SHA256 [options]` | Validate/reopen retained report or inspect one evidence object |
| `tui REPORT [--store DIR] [--no-color] [--ascii] [--palette]` | Retained-report TUI; nonterminal use emits the shared report summary and report exit outcome; human visual acceptance remains separate |

The static producer never installs/imports the analyzed package or runs its hooks/build. New investigations use the reviewed `55240e9` deterministic entry through the shared engine by default. `HEURISKO_ANALYSIS_MODULE=off` explicitly retains raw evidence with unavailable deterministic analysis. No product model, monitor, provenance verifier or rebuild worker is enabled. Zero findings with unavailable or incomplete analysis is not a clean assessment.

## Deterministic analysis and raw-only replay

The default is `@heurisko/intelligence-reviewed` version `0.1.0-55240e9`, derived from the supplied commit `55240e99409ad44cbd6a978f40873ef410cb1861`. The allowlisted host setting `HEURISKO_ANALYSIS_MODULE=55240e9` explicitly selects the same entry. Only reviewed deterministic code is admitted; provider/CodeAstra/model paths are excluded. Integration validation and remaining limits belong to the [module admission reference](../packages/intelligence-reviewed/README.md); older receipts and saved reports retain their original configuration.

This is trusted **host-process configuration**, not an artifact option, CLI module-path flag, browser form field or HTTP module API. The shared engine reads it for a new investigation. An absent/empty value uses the reviewed default; `off` selects raw-only/unavailable analysis. An unknown nonempty selector is rejected before acquisition unless trusted caller code supplies its own explicit module. An explicit trusted `InvestigationContext.module` takes precedence. Opening a saved report never reruns analysis or changes its module identity.

Generate a separate report through the connected default from the compact retained local inputs, using a new destination:

```sh
node packages/cli/dist/index.js analyze \
  --artifact examples/p04/local-mutation/inputs/picocolors-1.1.1.local-inert-mutation.tgz \
  --name picocolors --version 1.1.1 \
  --source https://github.com/alexeyraspopov/picocolors \
  --commit 7249f8c5d4825550f70bc1ea98652639933d3bbd \
  --source-archive examples/p04/local-mutation/inputs/picocolors-source-7249f8c5d4825550f70bc1ea98652639933d3bbd.tar.gz \
  --no-ai --store .heurisko/CONFIGURED_DETERMINISTIC_NEW/store \
  --report .heurisko/CONFIGURED_DETERMINISTIC_NEW/report.json \
  --bundle .heurisko/CONFIGURED_DETERMINISTIC_NEW/bundle.json --json
```

AI is disabled by default; `--no-ai` remains accepted for existing commands and has the same deterministic behavior. No model/provider is invoked by this path. Inspect actual findings, evidence, coverage and exit status; configuring a module cannot supply missing source bytes, provenance, policy evaluation or whole-file equivalence. Bounded retained manifest deltas are resolved only after hash, exact pointer, member-span and value/absence checks. Missing/corrupt/over-limit evidence remains limited or unexplained with incomplete heuristics. This supports scoped observations, not a package safety verdict or full P04 acceptance.

The retained-content boundary permits at most **128 candidate records**, **16 KiB per delta**, **256 KiB per member** and **1 MiB aggregate read budget**. Unique uncached successful reads count toward the aggregate; a failed read conservatively charges its allowed budget, and cached references are not charged twice. Invalid/missing/corrupt/oversize bindings leave raw bundle bytes unchanged and make heuristics incomplete with unresolved values/direction. Cancellation or deadline aborts analysis rather than returning a successful empty result.

The older raw/default reports cited below retain their pre-integration configuration. Use `HEURISKO_ANALYSIS_MODULE=off` when reproducing unavailable deterministic analysis; an unset selector now runs the reviewed default. A new ordinary `analyze` command may therefore produce findings and a different completeness/exit outcome.

## Analyze inputs and constraints

```text
heurisko analyze npm:NAME@EXACT_VERSION [options]
heurisko analyze --artifact FILE [--source https://github.com/OWNER/REPO --commit FULL_SHA] [options]
```

The local form without source is accepted by the parser; it leaves missing-source limitations rather than establishing correspondence. The help's source-pinned local example describes the useful comparison path.

- npm requires one canonical exact version, including an exact prerelease where supported. `npm:@scope/name@1.2.3` is supported. Ranges, dist-tags such as `latest`, aliases and alternate/private registries are unsupported. There is no floating version resolver in the current CLI.
- npm input cannot be combined with `--artifact`, `--name`, `--version` or `--source-archive`. It can use the explicit `--source`/`--commit` override and `--subdirectory`.
- `--source` and `--commit` must appear together. Source is an allowed GitHub repository URL and commit is a full immutable commit, not a tag/branch. Supported source URL/network rules are enforced by core.
- `--subdirectory` and `--source-archive` require the source/commit pair. The source archive replay option is available through the **local artifact** CLI form. Its commit association remains user asserted.
- Local archive input gets its own digest and local identity. Explicit labels and filenames never confer registry integrity or provenance.
- Source overrides remain user-supplied targets. Registry/manifest/tag candidates, conflicts, subtree/build context and excluded coverage remain evidence; none is source proof by itself.

## All current options

Options use separate values (`--store DIR`), not `--store=DIR`. Duplicate options, unknown options and missing values fail. Boolean switches take no value; no short-option or end-of-options convention is documented. Do not start an option value with `--`. The parser has no general `--format`, `--ai`, `--offline` or `--version` command switch.

| Option | Applies to | Meaning / default |
|---|---|---|
| `--artifact FILE` | analyze local | Local tar/tar.gz input; resolved relative to working directory |
| `--source URL` | analyze | Explicit GitHub comparison repository, paired with commit; npm otherwise uses source resolution |
| `--commit FULL_SHA` | analyze | Full immutable source commit; paired with source |
| `--subdirectory PATH` | analyze | Explicit package subtree in pinned source; requires source override |
| `--source-archive FILE` | analyze local | Replay local source snapshot; requires source/commit; no cryptographic artifact-to-source proof |
| `--name NAME` | analyze local | Optional explicit local subject label |
| `--version V` | analyze local | Optional explicit local subject version label; not CLI version output |
| `--store DIR` | analyze, inspect, tui / interactive entry | Evidence store; default `.heurisko`; explicit path resolved from working directory |
| `--report FILE` | analyze | Save immutable validated full report JSON; do not overwrite a changed existing output |
| `--bundle FILE` | analyze | Save EvidenceBundle JSON; not a self-contained portable evidence directory |
| `--policy REF` | analyze | Record requested trust policy; remains indeterminate until a concrete evaluator exists |
| `--evidence ev_ID` | inspect | Read a retained evidence object's first 8,192 bytes after report/evidence verification |
| `--json` | analyze, inspect | One canonical JSON result on stdout; diagnostics/progress on stderr |
| `--no-ai` | analyze | Explicitly keep AI disabled; configured deterministic checks remain active. The default also disables AI; no product model is admitted. |
| `--no-color` | analyze, inspect, tui / interactive entry | Inert uncolored output |
| `--ascii` | tui / interactive entry | ASCII presentation request; rejected for analyze/inspect |
| `--palette` | tui / interactive entry | Palette request; rejected for analyze/inspect |

The parser also accepts `--no-ai` on `inspect` without changing stored AI state: inspection never reruns inference. Neither accepted presentation flag rewrites a report. The fixed analysis profile is `raw-static-s3-v1`; there is no CLI flag to load arbitrary rule code, choose a model or change resource policy. The allowlisted host setting above is separate from command parsing and untrusted target data.

## Exact npm and source override examples

These commands are previously documented/exercised paths; they were **not rerun** during this documentation reconciliation. New network observations may differ in capture time or availability. Inspect the resulting report and status rather than assuming a clean exit.

```sh
node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --store .heurisko/npm-run --no-ai --json
node packages/cli/dist/index.js analyze npm:@vue/shared@3.5.22 --source https://github.com/vuejs/core --commit 5a8aa0b2ba575e098cbb63b396e9bcb751eb3a0f --subdirectory packages/shared --store .heurisko/scoped-run --no-ai --json
```

Fresh analysis needs permitted public network access, full validation and the restricted parser. Public npm integrity supports strict SHA-512/SHA-256 SRI; missing/unsupported SRI remains incomplete. Retrieved advertised attestations remain unverified and provenance `not_checked`. The Vue override is a user-selected corpus comparison candidate, not a verified source binding.

## Local archive and source replay

```sh
node packages/cli/dist/index.js analyze --artifact examples/s2/current/inputs/picocolors-1.1.1.tgz --source https://github.com/alexeyraspopov/picocolors --commit 6f0a4638348ed20633d623ee973f9c9a96f65104 --source-archive examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz --name picocolors --version 1.1.1 --store .heurisko/s2-replay --no-ai --policy s2-requested-analysis --json
```

This retained-input workflow still performs parsing/comparison under current tools. It is distinct from reopening an already generated report. Omitting `--source-archive` fetches the explicitly pinned source. To save separate output files, add `--report NEW_REPORT.json --bundle NEW_BUNDLE.json` using fresh destinations under an existing directory; these options are source-inspected, not a new executed example here. Raw report JSON/bundle alone does not copy all referenced bytes.

## Inspect reports and evidence

```sh
node packages/cli/dist/index.js inspect examples/handoff/current/B1.report.json --store examples/handoff/current/store --json
node packages/cli/dist/index.js inspect examples/s2/current/outputs/synthetic-local-mutation.report.json --store examples/s2/current/store --evidence ev_8e5679afc3b6d3667eb09413 --json
```

The first follows the retained B1 report. The second inspects an inert synthetic local mutation's **raw evidence object**, which may be a delta JSON record rather than resolved source/artifact bytes. The browser reader separately resolves that record's artifact span `[585,611)`; its source side is `SIDE_NOT_RECORDED`. Do not interpret offsets inside a delta record as source-code offsets.

`inspect sha256:HEX --store DIR` instead loads a report from its store by exact report-content digest; substitute a retained content reference, not the artifact digest or `report_…` identifier. Inspection validates the report and verifies evidence before returning output; unavailable validation/corruption is not bypassed. It performs no fresh registry, source or revocation check.

`tui` accepts the same report file or exact report-content digest. Its nonterminal summary uses the recorded report outcome and exits with the same code; interactive report opening keeps missing evidence visible when a selected read cannot resolve its bytes.

File and content-digest report imports require exact UTF-8; invalid encoding fails with `REPORT_ENCODING_INVALID`. A UTF-8 BOM is not silently removed, and unsupported report encoding cannot acquire a replacement content identity. Local reads reject nonregular inputs, including named pipes, before waiting for content.

With `--evidence`, JSON contains `reportId`, the evidence record, base64 `content` with total length/truncation, and a retained-observation freshness notice. Without `--json`, bytes are rendered as inert escaped text with a truncation notice. This is an **8 KiB excerpt**, not a full-file export. Missing/unknown evidence, absent `contentRef`, and `not_exported`/`unavailable` states fail with `EVIDENCE_NOT_RETAINED`; a coincidentally present blob cannot override the recorded availability state.

## Output, exits and CI

Analyze and report inspection emit a readable uncolored summary by default; `--json` emits one report document with a newline. Evidence inspection emits the evidence wrapper described above instead of the full report. Diagnostics/errors and analysis stage progress go to stderr. No TTY is required. Raw report files preserve immutable encoded reports; canonical stdout formatting need not be byte-identical to the original saved report file.

| Exit | Meaning and precedence |
|---|---|
| `3` | Invocation/internal failure without a usable result, or command failure; no fabricated successful report. An output-file write failure can also fail the command after engine persistence. |
| `1` | For a usable report, configured policy violation takes precedence over incomplete status |
| `2` | Otherwise materially incomplete/failed analysis or indeterminate requested policy |
| `0` | Otherwise completed configured checks without violation; never universal harmlessness |

The mapping is preserved in [current decisions](Approved%20Decision%20Register.md), with precedence implemented in `engine.ts` and covered by core tests; concrete policy evaluation remains unavailable. The retained raw/default examples intentionally exit **2**, including successful historical JSON inspection. A newly configured report uses its own recorded outcomes and may have a different exit. Treat valid useful JSON plus exit 2 as incomplete evidence, not a process transport failure or a safe result. CI must capture both the exit and report; do not discard JSON just because a shell's fail-fast setting sees nonzero. No tested generic policy-evaluation recipe is claimed.

SIGINT/SIGTERM request cancellation via the shared abort signal. A request is not proof of cleanup acknowledgment; use actual outcome/recovery records. The parser retains durable records/locks/spool if creation/removal is uncertain. There is no CLI `resume`, `detach`, automatic lock deletion or general job recovery command; the existing explicit [parser recovery script](../scripts/recover-parser-job.mjs) is developer tooling and requires exact-job inspection, not a browser retry API.

## Common errors and troubleshooting

| Symptom / code | Meaning / next action |
|---|---|
| `INVOCATION_INVALID`, `UNKNOWN_OPTION`, `DUPLICATE_OPTION`, `OPTION_VALUE_REQUIRED`, `OPTION_NOT_APPLICABLE` | Check this reference and root `--help`; use one target, paired source/commit, separate values and applicable flags. |
| `NPM_NAME_REJECTED`, `NPM_EXACT_VERSION_REQUIRED` | Use a valid public npm name and canonical exact version; no range/tag/alias. |
| Failure before artifact exists | stdout may be empty, exit 3. stderr may contain a safe `Retained acquisition failure: sha256:…` reference; core `EvidenceStore.get(ref)` can reopen the diagnostic record. It is not an InvestigationReport to pass to `inspect`. |
| `EVIDENCE_NOT_RETAINED` or evidence corruption/read failure | Check matching report/store, evidence ID and transport omissions. Do not manufacture missing bytes or edit historical content states. |
| Validator unavailable / invalid report | Use the pinned Python environment/schema and correct input; do not replace full validation with `JSON.parse`. |
| Parser unavailable / isolation failure | Verify the configured Docker engine and digest-pinned image/controls in setup; retain incomplete results, never run analyzed content on the host. |
| `ANALYSIS_MODULE_UNAVAILABLE`, zero findings, exit 2 | Retained historical raw reports or an explicit host setting `HEURISKO_ANALYSIS_MODULE=off`. Ordinary new investigations use the reviewed deterministic default. No clean assessment or working AI is implied. |
| Changed existing report/bundle destination | Use a new output path. Historical bytes must remain immutable. |

Errors are sanitized: top-level stderr uses `Heurisko: CODE. Run --help for supported syntax.` and may collapse non-code exceptions to `INVOCATION_OR_INTERNAL_ERROR`. Reports retain stage-specific failures where available. A new browser flow must preserve those distinctions without leaking paths/tokens or converting all errors to “no issues.”

## Separate local browser and portable tooling

```sh
pnpm web --report examples/handoff/current/B1.report.json --store examples/handoff/current/store
node apps/web/dist/export.js --report examples/handoff/current/B1.report.json --store examples/handoff/current/store --out .heurisko/NEW_WEB_EXPORT
pnpm web --import .heurisko/NEW_WEB_EXPORT
```

The export example requires a fresh destination under an existing real parent. These are separate **web tools**, not `heurisko serve` or `heurisko report export`. The browser now provides landing, sidebar documentation and an explicit shared-engine investigation workflow; see [current browser usage and boundaries](../apps/web/README.md). Launch without arguments using `pnpm web` to start empty. Browser-selected files, a fixed workspace store and local downloads replace arbitrary host-path options. Reopen report JSON, workspace report digest or a portable `.heurisko.json` file; bundle-only import is unsupported in both current interfaces.

Reader launch accepts repeated `--report REPORT --store STORE` pairs and/or `--import DIRECTORY` up to 16 observations, plus `--port PORT` (default free port). Export requires ordered `--report`, `--store`, `--out` arguments. Reader/export failure uses exit **1**, a tooling failure, not the analyzer's policy-violation exit meaning. The private startup URL contains an in-memory session capability; reopen it after a bare reload, keep it local, stop the reader with Ctrl+C. See [full transport/setup/limits](../apps/web/README.md#portable-directory-export-and-import) and [historical four-case receipts](../examples/web/current/README.md).

## Approved but unavailable, and later scope

Default terminal Home and `tui REPORT` are available as described above; their human design acceptance remains separate. The following capabilities are not implemented by the current parser/integrations.

| Direction | Availability |
|---|---|
| `watch add/run --once/status/remove`, configured recurring runner | Approved monitor design; not implemented; exact complete syntax must follow actual implementation |
| Provenance verification, concrete policy evaluator, verified generated/build equivalence, genuine open-model interpretation | Required/planned integrations; default deterministic findings do not establish these capabilities |
| PyPI, `compare`, `project --lockfile`, SARIF, `report export`, `serve --local` | Later directions/provisional syntax; current parser rejects these commands |
| Hosted analysis, accounts, notifications, public sharing | Separate future scope/approval; not prerequisites for local use |

The browser uses this engine contract with [explicit interface differences](../HEURISKO_COMPLETE_GUIDE.md#2-capability-map). Update this canonical command reference and affected browser/TUI guides with each parser change. [Current work](Production%20Phase%201%20Implementation%20Plan.md) and [future priorities](../PRODUCTION_MASTER_ROADMAP.md) track remaining validation and features. This reference is source-inspected; historical examples are not fresh acquisition or inference claims.


### Missing-evidence compatibility

`inspect REPORT --store STORE --json` validates the report and verifies its retained blobs before emitting JSON. A missing/corrupt required blob yields exit 3 and no JSON. This strict check is different from metadata viewing: `tui REPORT --store STORE` accepts a valid historical report even with missing blobs; redirected output is an inert summary with the recorded report exit. Interactive TUI and browser show `MISSING_BLOB` when cited bytes are requested. Neither path fabricates bytes or upgrades outcomes. A standalone report JSON is not a portable evidence bundle. The Phase 1 compatibility receipt preserves this distinction and the original bytes; use portable export or retain the matching store for full evidence.
