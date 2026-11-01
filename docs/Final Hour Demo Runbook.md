# Final-hour demonstration runbook

Prepared locally on 1 November 2026 (Asia/Kolkata), under Shane's instruction to execute the one-hour readiness plan. This is a runbook for the implemented product and retained evidence. It grants no commit, push, merge, deployment or submission authority. Product-model execution and general intelligence-module acceptance remain separate.

The latest connected default uses the reviewed `55240e9` deterministic entry for new investigations. The original three-case replay below remains pre-integration evidence; the integration appendix identifies how to demonstrate a separate new report without rewriting those captures.

The [pinned three-case manifest](../examples/final-hour/20261101-053912/demo-manifest.json) and [verification receipt](../examples/final-hour/20261101-053912/demo-verification.json) identify original report bytes, capture times and evidence stores. The manifest contains public release evidence, one synthetic local mutation, and an incomplete-source case. These are historical observations, not fresh scans. No captured package is installed or executed.

## Start from the repository root

Use the existing pinned setup. Do not install dependencies or rebuild during the presentation. The final-hour validation receipt records which source/build actually passed.

```sh
export PATH="$PWD/.tooling/node-v22.23.4/node-v22.23.4-darwin-arm64/bin:$PWD/.venv/bin:$PATH"
pnpm web \
  --report examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store \
  --report examples/handoff/current/B2.report.json --store examples/handoff/current/store \
  --report examples/part4/user-failures/fresh-local.report.json --store examples/part4/user-failures/store \
  --report examples/handoff/current/B3.report.json --store examples/handoff/current/store
```

Open the exact private loopback URL printed by this process. Its capability belongs only to the running local session; keep it out of slides, chat, screenshots, queries and committed files. Home/Docs work without authority; protected evidence requires the launch capability. Ctrl+C stops this task-owned viewer. A restarted process gets new handles and requires explicit reopening.

This launch opens the new integrated report plus the three retained pre-integration cases. Select **Workspace → Reports**. Identify each by package, origin, capture time, report ID and complete report content reference. Jobs and reports have distinct identities. Opening a report performs no registry or revocation refresh. The historical `node scripts/launch-final-demo.mjs` helper still checks and opens only its original three pinned cases.

To independently verify and make fresh portable copies before rehearsal, choose an unused destination:

```sh
node scripts/verify-final-demo.mjs .heurisko/DEMO_REHEARSAL_NEW
```

The verifier checks every retained evidence blob, validates reports through the shared reader, exports/reopens original report bytes, and compares CLI JSON plus CLI/non-TTY TUI summaries. It executes no target code and performs no network acquisition. The destination includes one directory per case, each with `manifest.json`, `report.json` and `blobs/`. An existing destination is rejected. Keep the output for offline rehearsal.

## Eight-minute narration

| Time | Show | Say and establish |
|---|---|---|
| 0:00–0:45 | Home, then Reports | “Heurisko investigates one exact published artifact against an immutable source candidate. It retains evidence and uncertainty so a reviewer can inspect the reason for a difference.” |
| 0:45–2:15 | **ts-pattern 5.9.0**, Overview → Source → Files | “This is a genuine retained npm release. Registry integrity matched, but its source is publisher asserted and provenance was not checked. Distribution/build-context differences remain raw observations; generated-looking files do not establish benignness or reproduced equivalence.” Show the original capture time and full artifact/report content digests. |
| 2:15–4:15 | **Integrated picocolors local mutation**, report `report_1366f57f990327d57dd6ad73` → Findings → lifecycle finding → evidence | “The connected deterministic default identifies a lifecycle entry added to this inert local-input artifact. It inherits no registry-integrity or provenance success, and no lifecycle command executes.” Show the exact `scripts.postinstall` literal `"HEURISKO_INERT_TEST_ONLY"`, evidence `ev_e7075cb69f91c7e1b4c4223f`, and return to the same finding. Its 16 findings/one lifecycle finding and exit 0 are scoped to completed static checks; correspondence remains unresolved. |
| 4:15–5:30 | **zod 4.6.7**, Coverage/Source | “The source archive contains an unsupported entry. Source/inventory/comparison remain incomplete, with 843 unresolved records in this capture. Missing evidence cannot produce a clean result.” Show the unsupported source entry and source-manifest/inventory/comparison diagnostics. |
| 5:30–6:30 | Open the same local report in TUI or CLI | “The interfaces consume one immutable report and the same evidence IDs and bytes.” Open the TUI command below, inspect Files and exact evidence, then Escape back. |
| 6:30–7:15 | Save/Open explanation or previously verified portable directory | “A portable export preserves original report bytes and declared evidence coverage. Reopening is historical viewing. A report-only file may need its separate evidence store.” Use GUI download/reopen only after its actual rehearsal passes. |
| 7:15–8:00 | Limitations and next steps | “These unconfigured historical reports retain unavailable deterministic analysis. New investigations use the reviewed deterministic default described below. Real model integration, selected-release monitoring and provenance-policy verification remain open.” |

All three primary reports intentionally exit **2**. Zero findings in these pre-integration raw reports means analysis is unavailable; it does not establish that zero suspicious changes were found. New investigations now use the reviewed deterministic default unless the host explicitly selects `off`.

## Terminal fallback and cross-interface rehearsal

Open the retained mutation in an actual TTY:

```sh
node packages/cli/dist/index.js tui examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store --no-color
```

`2` opens Findings; `/` then `lifecycle` filters; Enter selects/inspects; `e` opens evidence; Escape returns. `3` opens Files; `/` then `package.json` filters. `4` opens Source; `v` cycles Candidates/Provenance/Build. `?` shows help and `q` quits. `x` resets only UI preferences if an old filter obscures the intended case. Evidence windows are bounded byte ranges, not whole-file semantic alignment. This integrated report's recorded exit is 0; the historical CLI fallback commands below retain exit 2.

For a concise offline CLI narration:

```sh
node packages/cli/dist/index.js inspect examples/handoff/current/B2.report.json \
  --store examples/handoff/current/store
node packages/cli/dist/index.js inspect examples/part4/user-failures/fresh-local.report.json \
  --store examples/part4/user-failures/store
node packages/cli/dist/index.js inspect examples/handoff/current/B3.report.json \
  --store examples/handoff/current/store
```

Each command exits 2 while returning a usable historical report. Do not join these with `&&`, which stops at the first intentional exit 2. A redirected `tui` command emits the same summary without opening the interactive UI.

## Historical e8b8116 finding demonstration

This pre-integration finding report remains available only with its explicit label. Prefer the separately validated connected `55240e9` output below for a new integration demonstration once its receipt is supplied:

```sh
node packages/cli/dist/index.js tui examples/part4/user-failures/local-e8b8116-validation.report.json \
  --store examples/part4/user-failures/module-validation-store --no-color
```

It is a retained, explicitly injected **model-off validation of e8b8116**, with 16 findings and one lifecycle finding. It is not the default product configuration, accepted general rule quality, new live inference or package safety. Its retained-value wording limitation is documented in the [review](Malhar%20M1%20M2%20Handoff%20Review.md). Do not silently substitute it for a newly integrated report.

## Malhar intake and final reserve

The supplied deterministic delivery is `55240e99409ad44cbd6a978f40873ef410cb1861`; exact integration scope belongs to the [module intake record](Final%20Module%20Intake.md). The existing `AnalysisModule` seam requires module ID/version plus executable/configuration digests; preserve the G0 signature and immutable inputs. Validate evidence references, spans/quotes, model-disabled/unavailable behavior and the same report across interfaces. Any later model delivery additionally needs exact runtime/model configuration and a genuine inference record. A module import or saved answer alone does not establish live model integration.

Keep the final reserve for the connected path's bounded smoke check and actual generated report. Preserve the verified retained workflow if a new run fails; an explicit `HEURISKO_ANALYSIS_MODULE=off` reproduces raw/unavailable analysis. Saved model output is labeled replay. Hosted OpenRouter P04 eligibility remains unconfirmed; do not imply organizer acceptance. No new alternate model or arbitrary module loader is part of this runbook.

## Local readiness and delivery checklist

- Current-source build/contracts/reader/core/web results are in the [final-hour validation receipt](../examples/final-hour/20261101-053912/validation.json); read its failures and source boundaries as well as passes.
- Rehearse exact target → Review → Start → usable report → retained evidence; record native observations separately from API tests. Confirm no running task before stopping its viewer.
- Rehearse the three retained cases, evidence Back, keyboard focus, Files search, Source limitations, and Save/Open before relying on a GUI transition. The [web acceptance backlog](Web%20Application%20Gap%20Plan.md#overhaul-execution--1-november-2026) remains open where unobserved.
- Verify the presentation labels: live acquisition versus historical report, synthetic local mutation, explicit module validation, saved inference replay and unsupported scope.
- Prepare exact feature-branch change list and local PR description; inspect the final diff and retain passing CI for any eventually approved revision. Commit/push/PR publication/merge/submission require their own applicable authorization.
- Confirm submission identity, final scored SHA, repository URL, team/category and OrganizerHQ receipt only if the user authorizes those external actions. A local runbook is not submission.

This runbook does not close full P04, meaningful actual open-model work, monitoring, joint G3, human design acceptance or WCAG conformance.

## Limitations slide text

**What this demo proves:** exact retained artifact identity, inspectable raw source/artifact differences, preserved incomplete coverage, and shared immutable evidence across CLI/TUI/browser.

**Configuration and limits:** retained pre-integration raw reports keep unavailable deterministic analysis. The reviewed `55240e9` default supplies scoped deterministic findings for new runs; its own receipt establishes what was actually exercised. Integrated real open-model inference/evaluation, selected-release monitoring, provenance/concrete policy, complete human/GUI/accessibility acceptance and general finding-quality acceptance remain open. Generated/build equivalence is unresolved. No package safety certification is claimed.

**Evidence labels:** the three primary cases are historical captures; the local mutation is synthetic and inert; the optional e8b8116 finding report is isolated model-off validation; saved inference is replay.

## Local PR-description draft for this demo package

This text is prepared locally for review. It is limited to the new demo scripts, manifest, verification and runbook; expand/rewrite it around the complete reviewed change set before any authorized publication.

### What this PR does

Adds a pinned three-case retained-evidence demonstration: a genuine ts-pattern release, an inert local picocolors mutation and a zod incomplete-source capture. A launcher checks original report hashes and creates a private loopback workspace in a fresh session directory. The verifier checks all retained blob hashes, original report bytes, portable reopening and CLI/non-TTY parity. The runbook supplies an eight-minute narration, offline fallback and explicit capability limits.

### Models the product uses in this PR

None. Existing saved inference and isolated model-off validation are labeled separately; no module or product model is adopted by this package.

### AI coding assistants that helped write it

Codex.

### How we tested it

`node --check scripts/verify-final-demo.mjs` and `node --check scripts/launch-final-demo.mjs` pass. The actual pinned-tool `verify-final-demo.mjs` run passes three original-byte/portable/CLI/non-TTY cases, verifies 2,218 retained evidence records over 2,031 case-level unique blobs, and exports every referenced blob with zero transport omissions. The actual launcher smoke loads three catalog entries, rejects catalog access without its capability, observes zero jobs and stops its own viewer with exit 0. Initial verification-harness and sandbox-listener failures remain documented in the receipt. Native GUI acceptance and broader engine tests are separately recorded in the final-hour receipts.

## Integration appendix: connected deterministic findings

The supplied commit is `55240e99409ad44cbd6a978f40873ef410cb1861`. Only its reviewed deterministic entry is admitted as the shared engine default; provider, CodeAstra and model paths remain excluded. [Final module intake](Final%20Module%20Intake.md) owns implementation identity, actual validation and the newly generated report location. Existing demo manifests, canonical raw outputs and earlier receipts are pre-integration evidence and remain unchanged.

For a new connected local replay, use the complete [CLI command](CLI%20Reference.md#deterministic-analysis-and-raw-only-replay), which writes to a fresh destination. To start the corresponding interfaces:

```sh
node packages/cli/dist/index.js --store .heurisko/CONFIGURED_DEMO_TUI_NEW --no-color
pnpm web
```

Each launch is a separate process; starting it does not run an investigation. Explicitly Review/Start a new target. The allowlisted setting is trusted host configuration, never target metadata or an HTTP/browser module selector. An unset/empty value uses the reviewed default, explicit `55240e9` pins the same entry, and `off` reproduces raw/unavailable analysis. `--no-ai` or the browser's AI-off request preserves deterministic checks while making no model call. Opening an old report renders its original module state.

The connected findings step replaces part of the old mutation narration. The separate [actual default report](../examples/final-hour/20261101-053912/integrated-55240e9/report.json), [matching store](../examples/final-hour/20261101-053912/integrated-55240e9/store) and [module validation record](Final%20Module%20Intake.md) identify report `report_1366f57f990327d57dd6ad73`, with **16 deterministic findings and one lifecycle finding**. That finding records `scripts.postinstall` added to the artifact, high evidence confidence and exact supporting bytes. Open the same saved report in either interface:

```sh
node packages/cli/dist/index.js tui examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store --no-color
pnpm web --report examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store
```

Inspect the lifecycle finding, follow its cited member bytes, and return to the same finding; native journey acceptance belongs to its own actual observations. This report exits **0** for completed declared static checks. Correspondence remains `unresolved`, source `user_supplied`, provenance `not_checked` and policy `not_evaluated`. AI is disabled. Missing/corrupt/over-limit evidence still makes later runs limited/unexplained with incomplete heuristics. Exit 0 does not establish package safety, source correspondence or full P04. This is deterministic analysis, not live AI.
