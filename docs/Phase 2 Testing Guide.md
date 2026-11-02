# Phase 2 testing and reviewer guide

Current owner amendment: `npm-gha-slsa-v1-draft.2` supports dsse/0.0.1 only; dsse/0.0.2, intoto and hashedrekord abstain. Genuine dsse/0.0.2 is no longer a draft.2 closure gate. Explicit legacy draft.1 and the original proposal/reviewer forms below retain their historical context. Existing reviewer/browser acceptance is closed; those forms do not introduce another signoff gate. The [decision register](Approved%20Decision%20Register.md#phase-2-profile-and-native-publication-authorization--2-november-2026) also authorizes reviewed feature-branch publication and native CI; actual exact-head results still determine technical completion.


Use this guide to test locally implemented Q1–Q4 behavior and record actual evaluation. Optional independent/held-out procedures require the corresponding blind evidence. It contains the application field values, expected development results and records to fill in. It is an operating guide for the existing [roadmap work items](../PRODUCTION_MASTER_ROADMAP.md#2-trustworthy-npm-investigation), not a replacement plan or an acceptance record.

Baseline prepared 2 November 2026: HEAD `7eee564818c63b0edbe47e58d7c044136a4470c0` plus uncommitted implementation; reviewed module `0.2.0-p2-static-v1`, selector `p2-static-v1`. The [implementation evidence index](../examples/production-phase2/2026-11-02-local-01/README.md), [delivery checks](../examples/production-phase2/2026-11-02-local-01/validation-delivery.json) and [runtime identity](../examples/production-phase2/2026-11-02-local-01/runtime-identity-delivery.json) name the exact tested source. Subsequent documentation changes are not part of that earlier source snapshot. Record the current source again for any new run.

Navigation: [who does what](#1-what-you-need-to-do), [setup and test record](#2-set-up-once-and-create-a-fresh-result-directory), [browser and field values](#3-track-a-browser-journeys-and-exact-form-values), [CLI/TUI](#4-track-a-cli-and-actual-terminal-checks), [automated checks](#5-automated-implementation-checks-and-repeatable-development-runs), [independent evaluation and forms](#6-track-b-blind-labels-family-separation-and-held-out-grading), [Q4 admission](#7-track-c-q4-verifier-and-trust-policy-review), [final decision record](#8-form-f-assembled-review-and-owner-decision).

The [current owner amendment](Approved%20Decision%20Register.md#local-completion-and-acceptance-amendment--2-november-2026) accepts the prepared review/limitations and Q4 direction for local implementation and waives further reviewer signoff/recruitment. Forms for independent/held-out work below remain available only for such actual evidence; they are not staffing gates. Current Q4 implementation, authenticated roots, exact notices, 82 standalone worker/evaluator checks and retained failures are in [the current receipt](../examples/production-phase2/2026-11-02-implementation-02/README.md). [Operational setup](CLI%20Reference.md#offline-provenance-and-expected-policy) supersedes proposal-only status below. The [subsequent closure amendment](Approved%20Decision%20Register.md#remaining-closure-ownership-and-acceptance-amendment--2-november-2026) closes current browser/accessibility acceptance by owner signoff; it does not claim that unperformed GUI/AT tests ran. Linux, controlled signed fixtures, source-selection/notices and scanner work are agent-owned in the [remaining closure implementation plan](../PRODUCTION_MASTER_ROADMAP.md#remaining-closure-implementation-plan). Phase acceptance remains open for the applicable unfinished technical work.

## 1. What you need to do

| Track | Who does it | What to return | Current status |
|---|---|---|---|
| A. Practical CLI/TUI/browser checks | Agent for executable checks; owner acceptance already recorded | Preserve actual terminal/browser records and observation limits | CLI/TUI checks passed; current browser/accessibility acceptance is closed by owner. Unperformed observations remain unperformed; no repeat tester/signoff gate. |
| B. Independent quality evaluation | A human who did not author the detection rules; a second independent human for consequential trust/build judgments and disagreements | Blind labels, rights/family review, freeze receipt, output reviews and one held-out grading result | Development review completed within authored-label/sample/leakage limits; no independent/held-out result claimed; further reviewer signoff waived |
| C. Q4 trust/security/rights admission | Agent implementation and actual technical checks; owner direction already accepted | Exact tool/fixture/root/policy identities and actual Linux/application results | Local verifier/policy/root integration implemented; remaining native/fixture work follows the closure plan. Further reviewer signoff is waived. |
| D. Acceptance | Shane | A decision naming source, scope, evidence, limitations and remaining gates | Phase 1 and Phase 2 remain open; existing Phase 1 owner acceptance stands |

You do not need an external website, account, Google Form or hosted submission. The forms below are local records: copy them into a **new** review directory and fill them in. Use `PASS`, `FAIL`, `BLOCKED` or `NOT_RUN`. A blocked browser or missing reviewer is not a pass. Keep failed attempts and record what fixed them.

An independent reviewer checks the original evidence before seeing the detector's answer. Shane can serve in that role only if he did not author the rules under evaluation and can truthfully meet the blind-review conditions. Ownership alone neither establishes nor prevents independence. Record actual roles; never label the existing construction labels as independent human work.

**Start with Track A, sections 2–5.** Track B is a larger evaluation exercise, not a form that can be completed from the already visible examples. Track C needs the remaining technical operating proof; further specialist signoff is waived. P2-SEVERITY/P2-EVAL are already approved and need no repeat approval.

## 2. Set up once and create a fresh result directory

Run commands in a terminal from the repository root:

```sh
cd /Users/sumnlikehsane/Desktop/Shane/Projects/Heurisko
git status --short --branch
git diff --stat
git diff --cached --stat
```

Preserve existing edits, staged contents, worktrees and inputs. Do not reset, clean, stage or commit to prepare tests. Use Node **22.23.4**, pnpm **10.14.0**, Python **3.13** and the hash-locked validator requirements. Follow the [installation guide](../HEURISKO_COMPLETE_GUIDE.md#5-install-and-build-locally) if setup is missing; do not relax pins or install an investigated package.

On the machine used for the retained local run, the exact Node and Python environments were already prepared. This selects them for the current terminal, provided the temporary Node directory still exists:

```sh
test -x /private/tmp/heurisko-p2-tools-20261102/node-v22.23.4-darwin-arm64/bin/node
export PATH="/private/tmp/heurisko-p2-tools-20261102/node-v22.23.4-darwin-arm64/bin:$PWD/.venv/bin:$PATH"
node --version
pnpm --version
python3 --version
python3 -m pip check
```

Expected: `v22.23.4`, `10.14.0`, Python `3.13.x`, and no broken requirements. A failed `test -x` means use the installation guide; do not continue with whatever Node happens to be on PATH. The retained run used Python **3.13.2**. The exact temporary paths are local conveniences, not distribution prerequisites. Docker and the admitted restricted parser are needed for fresh analysis/core parser suites; reopening existing reports does not execute the target or rebuild it.

Create new output locations and reusable shell variables:

```sh
mkdir -p .heurisko/phase2-review
P2_RUN="$(mktemp -d "$PWD/.heurisko/phase2-review/run-XXXXXXXX")"
P2_EVIDENCE="$PWD/examples/production-phase2/2026-11-02-local-01"
P2_CASES="$P2_EVIDENCE/inert-conformance-delivery"
printf '%s\n' "$P2_RUN"
git rev-parse HEAD > "$P2_RUN/git-head.txt"
git status --short --branch > "$P2_RUN/git-status.txt"
git diff --binary > "$P2_RUN/working-tree.patch"
git diff --cached --binary > "$P2_RUN/index.patch"
python3 - "$P2_RUN/source.json" <<'PY'
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('checks', 'scripts/phase1-checks.py')
checks = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checks)
with open(sys.argv[1], 'x') as output:
    json.dump(checks.snapshot(), output, indent=2)
    output.write('\n')
PY
```

Keep these variables in the terminal where you run the following commands. In another terminal, set them again using the **printed existing run directory**, not a second accidental run. `source.json` records present tracked/candidate source-file hashes, excluding ignored builds/dependencies and `examples`/`experiments`; evaluation inputs/labels/evidence need their own separate manifests. Keep labels and held-out outputs in custodian-controlled storage; an ignored `.heurisko` directory alone provides no reviewer independence or access control. Do not record private reader URLs, session capabilities, credentials or confidential inputs in shared receipts.

### Form A — run identity and individual test result

Copy this for the run header, then repeat the test portion for each test ID below. Angle-bracket values require actual observations.

```text
Run ID: <basename of P2_RUN>
Tester name / role: <actual person and role>
Started at / timezone: <actual date/time and timezone>
Git HEAD: <git-head.txt, full SHA>
Working changes: <git-status.txt and working-tree.patch>
Index: <index.patch; preserve pre-existing contents>
Node / pnpm / Python: <observed versions>
OS / architecture: <observed host>
Browser / version or terminal / dimensions: <observed tool>
Module for NEW analysis: p2-static-v1
Reference evidence: examples/production-phase2/2026-11-02-local-01

Test ID: <for example A-WEB-02>
Report path / report-content digest: <actual report and full digest>
Input / steps: <values used and actions taken>
Expected: <copy the relevant expectation below>
Observed: <what actually happened>
Result: NOT_RUN
Evidence files: <log, screenshot, transcript or recording paths>
Defect or blocker: <exact message and affected capability, or none>
Resolution / owner: <what would resolve it and who can act>
Retest: <new attempt/evidence path; preserve the original failure>
```

Only replace `NOT_RUN` after performing the test. Prefer screenshots showing the relevant values, source/artifact selector and error rather than the private address bar. Record screen-reader speech/focus observations separately from visual screenshots.

## 3. Track A: browser journeys and exact form values

### A-WEB-01 — open the retained reports without reanalysis

Build if the checkout has not been built for the current source, then launch the local reader:

```sh
pnpm run build
pnpm web --report "$P2_CASES/mutation-lifecycle-remove/report.json" --store "$P2_CASES/mutation-lifecycle-remove/store" --report "$P2_CASES/mutation-entrypoint/report.json" --store "$P2_CASES/mutation-entrypoint/store" --report "$P2_CASES/uncertain-manifest/report.json" --store "$P2_CASES/uncertain-manifest/store"
```

Leave the process running. Open the **complete private loopback URL printed by this process** in Chrome or Safari. There is no fixed port, username or password to invent. Go to **Workspace → Reports**, expand each report's **Observation identity** if needed, and use **Open report →**. The two mutation reports have the same package/version label; identify the desired report using its report ID/content digest, not list order. Print the mapping in a second prepared terminal:

```sh
python3 - <<'PY'
import hashlib, json
from pathlib import Path
root = Path('examples/production-phase2/2026-11-02-local-01/inert-conformance-delivery')
for case in ('mutation-lifecycle-remove', 'mutation-entrypoint', 'uncertain-manifest'):
    raw = (root / case / 'report.json').read_bytes()
    print(case, json.loads(raw)['reportId'], 'sha256:' + hashlib.sha256(raw).hexdigest())
PY
```

Expected: three retained observations with their original capture times, IDs, outcomes and evidence. Opening a report performs no new source/provenance check. Do not click a new investigation to simulate reopening.

If connection authority is lost, expand **Reader**, paste this process's complete launch URL into **Private launch URL**, and choose **Reconnect here**. Do not put an artifact digest, report ID or another reader's URL there. If Chrome shows `ERR_BLOCKED_BY_CLIENT` or Safari times out, record `BLOCKED` with browser/version/error. Ordinary supported-browser access must be restored before marking the journey passed; disabling security controls, binding a public address or tunneling the reader is not part of this procedure. Stop the process with **Ctrl+C** when finished.

### A-WEB-02 — lifecycle removal, direction and both citations

Open the report mapped to `mutation-lifecycle-remove`, then **findings**. Locate the lifecycle-script finding and expand its details/evidence.

| Check | Expected development result |
|---|---|
| Field and direction | `/scripts/postinstall` is **removed**, source → artifact |
| Old command | `HEURISKO_INERT_TEST_ONLY` on the source side |
| Artifact value | The key is absent; do not display an added command or pretend absence is a literal JSON null |
| Severity / review priority | `informational` / `low`, even though the containing manifest is modified |
| Citation | Open the finding's manifest-delta citation, select source/artifact sides, and inspect the original member/range. The source contains the command; the artifact manifest has no `postinstall` key |
| Interpretation | No claim that the command ran, is malicious, or that removal proves safety |
| Residuals | Other raw changes remain accessible in **files** and **coverage** |

Record the evidence ID, member path, byte range and displayed values in Form A. A citation that opens but does not support the stated direction/value is a failure.

### A-WEB-03 — changed entrypoint and exact values

Open `mutation-entrypoint` → **findings**, locate the entrypoint finding, and open its citation.

| Check | Expected development result |
|---|---|
| Field / direction | `/main`, source → artifact **change** |
| Source | `"index.js"` |
| Artifact | `"alternate.js"` |
| Severity / priority | `low` / `low` |
| Evidence | Both values come from their own retained `package.json` member spans, not offsets into the delta-record JSON |
| Interpretation | The value change does not prove that the destination exists, resolves, executes or has equivalent behavior |

Switch between source and artifact; open a related full member if offered. Confirm long content scrolls without switching observations. In automated coverage, the other roots are `module`, `types`, `typings`, `exports`, `bin`, `browser`; `null`, `false`, `""`, arrays and nested values are distinct from absent fields. Conditional export property reordering is a retained change, not a formatting-only explanation. These cases are in the focused suite in section 5; the simple `/main` report alone does not cover them all.

### A-WEB-04 — keyboard, Back, focus, viewport and assistive technology

Repeat A-WEB-02/03 using **Tab**, **Shift+Tab**, **Enter** and the reader's displayed controls. Record the browser, viewport and actual zoom; sample a desktop viewport, approximately 390 CSS-pixel width and native **200% zoom**. Check each condition separately:

1. Every needed control is reachable with visible focus and an understandable accessible name.
2. Opening a citation and a related member does not trap keyboard focus or lose the selected report.
3. Use the evidence view's return/close control and browser Back/Forward where navigation occurs. Check the prior finding/filter/position and a connected focus target are restored rather than jumping to another report. Record actual route/modal behavior; do not assume every evidence action adds browser history.
4. Long values, uncertainty and severity/priority remain readable without hidden controls or content overlap. Record any necessary scrolling.
5. With a named screen reader enabled (for example VoiceOver on macOS), read the finding, each citation side, uncertainty/error and return controls. Record announced labels, order, focus and any missing speech. A visual or API pass cannot fill in this result.

Use one Form A row for each browser/viewport/input combination. Baseline Phase 1 owner-accepted limitations remain accepted for their named scope; this is review of the changed Phase 2 journey, not repetition of every historical task.

### A-WEB-05 — missing evidence and corrupt/unsupported content

For a report whose bytes are intentionally unavailable, start a **separate** reader from a second terminal. Reuse the existing valid report with a new empty store; never delete a real blob to manufacture the test:

```sh
mkdir "$P2_RUN/empty-store"
pnpm web --report "$P2_CASES/mutation-entrypoint/report.json" --store "$P2_RUN/empty-store"
```

Open its printed URL → report → finding citation. Expected: original report metadata stays available; the content read explicitly reports missing/unavailable bytes (for example `MISSING_BLOB`), without invented member text or upgraded outcomes. Return to the report and verify focus/navigation. The same report is not reanalyzed or repaired by viewing it.

Open the retained `uncertain-manifest` report from A-WEB-01. Its duplicate manifest key prevents reliable metadata interpretation; completeness/coverage must expose the limitation. Do not require a clean field direction or a maliciousness verdict. Actual corrupted/digest-mismatched/not-exported evidence and unsupported whole-manifest absence are exercised by the focused suite; do not edit historical reports/stores to create them. Attach those test logs alongside this manual result, without calling the automated checks GUI observations.

### A-WEB-06 — optional fresh investigation: exact application fields

Use this when testing the **New investigation** form itself. It is development replay, not blind held-out evaluation. The public release below has retained local bytes, so there is no need to fetch a release again or execute it.

Set **Input type** to **Local tar / tar.gz archive** and fill the fields exactly:

| Field on screen | Value to select/type |
|---|---|
| Artifact archive | `examples/production-phase2/2026-11-02-local-01/development-data/picocolors/artifact.tgz` |
| Local name label | `picocolors` |
| Local version label | `1.1.1` |
| GitHub source repository | `https://github.com/alexeyraspopov/picocolors` |
| Full source commit | `6f0a4638348ed20633d623ee973f9c9a96f65104` |
| Package subtree | Leave empty (repository root) |
| Source replay archive | `examples/production-phase2/2026-11-02-local-01/development-data/source-captures/picocolors-1.1.1.source.tgz` |
| AI request semantics | **Do not request AI · --no-ai** |
| Requested policy reference | Leave empty for the baseline |

The file chooser needs an actual selected file, not text pasted into a path field. Paths above are relative to the repository root; use the full repository path if navigating in the system chooser. Expand **Add pinned source evidence** and **Requested options and available checks** to find those fields. Choose **Review investigation →**, check **Review exact request**, then **Confirm and start investigation** once. Follow **Jobs** → **Open report and evidence →**. Selection/review alone must not start work. If start acknowledgment is lost, check Jobs/read-only refresh before any explicit resubmission.

Expected: local-origin static comparison with the chosen source; local labels/identical downloaded bytes do not inherit registry integrity or positive provenance. Source override remains user asserted. AI stays disabled, provenance remains `not_checked`; no concrete policy was requested, so `policyResult` stays `not_evaluated`. Read actual completeness and exit rather than requiring zero. A changed capture/configuration may have a different report identity from retained examples.

For the unsupported-policy check, repeat in a new observation with **Requested policy reference** = `phase2-review-unimplemented`. Expected current behavior: policy `indeterminate`, usable report exit **2** unless a higher-precedence failure occurs; never policy pass or `verified_policy`. Do not enter the Q4 proposal's ID expecting to activate it: no production policy evaluator exists. A new npm-network smoke test, if needed, uses **Exact public npm release** = `npm:picocolors@1.1.1`, leaves both local file controls unused, and leaves source URL/commit empty for ordinary resolution. Network availability/capture results are separate observations, not assumed matches to retained data.

## 4. Track A: CLI and actual terminal checks

### A-CLI-01 — inspect the same report

Run in the prepared terminal. Execute the commands separately in a shell that does not discard nonzero results:

```sh
node packages/cli/dist/index.js inspect "$P2_CASES/mutation-entrypoint/report.json" --store "$P2_CASES/mutation-entrypoint/store" --json > "$P2_RUN/inspect.json" 2> "$P2_RUN/inspect.stderr.log"
printf '%s\n' "$?" > "$P2_RUN/inspect.exit.txt"
```

Compare report ID, six outcomes, AI state, finding values, evidence IDs and ranges with the browser, not just the finding count. Exit **2** may accompany valid useful incomplete evidence. Exit meanings: **3** no usable result/command failure; **1** usable policy violation; **2** otherwise incomplete/failed analysis or indeterminate policy; **0** otherwise complete under recorded checks. Severity alone does not select exit 1. The current production engine cannot demonstrate a genuine concrete-policy violation because its evaluator is unavailable.

`inspect --evidence ev_ID` shows the evidence **record** (possibly delta JSON), not necessarily the resolved member bytes. Copy the actual evidence ID from the report; there is no fixed `ev_ID` to invent. Strict CLI inspect with the empty store from A-WEB-05 should fail with exit **3** and no report JSON. This differs intentionally from metadata viewing in the reader/TUI.

### A-TUI-01 — open and navigate both findings

```sh
node packages/cli/dist/index.js tui "$P2_CASES/mutation-lifecycle-remove/report.json" --store "$P2_CASES/mutation-lifecycle-remove/store"
```

Use a real terminal, preferably **160 columns × 44 rows** for the retained changed journey. In the existing report reader: `2` opens findings; `/` searches; type `lifecycle` and Enter; Enter opens the selected finding; `e` opens its citation; `s` changes side; Esc returns. Follow displayed key help if context differs. Check informational/low, source command and artifact absence as in A-WEB-02. Quit with the displayed quit control, then repeat the command with `mutation-entrypoint` in both paths and search `entrypoint`; check both exact values. **`b` is not the side selector.** Record the actual terminal dimensions, captures, navigation and missing-content result. Never execute the displayed lifecycle string.

## 5. Automated implementation checks and repeatable development runs

These checks have already passed for the retained implementation. Run relevant checks for a changed candidate or to reproduce evidence; there is no need to rerun all acquisition suites merely to fill in a form or edit prose. Commands below assume section 2's environment and compiled workspace. Keep independent commands' logs and exit codes. Core/parser suites must run serially; do not start overlapping acquisition suites.

| Check | Command | What it establishes |
|---|---|---|
| Build/types | `pnpm run typecheck` | Builds shared packages/interfaces and checks TypeScript |
| Report contract | `pnpm run test:contracts` | Pinned Python schema/semantic checks and handshake |
| Q1–Q3/loader/boundary | `node --test --test-concurrency=1 packages/core/tests/phase2.test.mjs packages/core/tests/intelligence-boundary.test.mjs packages/core/tests/reviewed-module.test.mjs` | Actual loader directions/values, bound original evidence, legacy identity and fail-closed cases |
| Full core/parser | `node --test --test-concurrency=1 packages/core/tests/*.test.mjs` | Broader engine/static-parser/comparison/acquisition regressions; needs Docker and some permitted public reads |
| Shared reader/TUI | `pnpm run test:s4` | Reader facts, historical reports and terminal component behavior |
| Web | `pnpm --filter @heurisko/web test` | Web behavior/API/render contracts; not human GUI/AT acceptance |
| Grading tools | `python3 scripts/test-grade-phase2.py` | Misses, duplicates/leakage, separate severity, citation support and grading boundaries |
| Inactive AI preservation | `node scripts/verify-intelligence-intake.mjs` | Pinned intake preservation; no model call |
| Documentation | `pnpm run check:docs` and `git diff --check` | Links/research hashes and whitespace |

Example capture pattern, repeated separately for each applicable command:

```sh
pnpm run test:contracts > "$P2_RUN/contracts.log" 2>&1
printf '%s\n' "$?" > "$P2_RUN/contracts.exit.txt"
```

The focused suite covers: four hooks (`preinstall`, `install`, `postinstall`, `prepare`) with add/change/remove; ordinary scripts; parent/container/mixed/unchanged/invalid/empty cases; all seven entrypoint roots; nested/punctuated RFC 6901 pointers; absent versus null/false/empty; property-order and forged-value binding; missing/corrupt/not-exported bytes; bounded values; JSON-format/CRLF and retained sourcemap-source relationships; misleading generated names/build clues; source conflicts and unknown optional acquisition metadata. `prepare` is qualified separately from install hooks. Whole-manifest absent-member proof remains unsupported and must abstain. Lifecycle additions/changes are medium/medium; removals and ordinary-script changes informational/low; unsupported content undetermined/low/incomplete. Q2 supported changes are low/low. Raw residuals must remain visible regardless of an explanation.

For Q3 manually inspect **source**, **files**, **coverage**, and the raw evidence. Check full repository/commit/subtree/build context, candidate conflicts and omitted scope. Missing optional snapshot digest means **digest not recorded**, not proof that acquisition never happened. A formatting/CRLF or sourcemap-text relationship explains only its explicitly stated byte scope; filenames, `dist/`, comments or build scripts cannot establish generation, equivalence, reproduction or safety. The six outcomes and AI state stay separate.

Optional fresh development replays use new output directories:

```sh
node scripts/run-phase2-development.mjs "$P2_EVIDENCE/development-data" "$P2_RUN/public-development" > "$P2_RUN/public-development.log" 2>&1
printf '%s\n' "$?" > "$P2_RUN/public-development.exit.txt"
node scripts/validate-phase1-foundation.mjs "$P2_RUN/inert-conformance" > "$P2_RUN/inert-conformance.log" 2>&1
printf '%s\n' "$?" > "$P2_RUN/inert-conformance.exit.txt"
```

The public runner uses the 12 captured releases (11 retained full-commit sources; concat-map lacks a supported commit). The inert runner constructs eight original static fixtures and checks CLI/default/no-AI/raw/policy/errors and historical reopens. Neither runner installs or executes target code. Public cases are unlabeled; original construction labels are development labels with recorded authorship. Do not count eight mutations or 12 projects as a held-out quality pass. Runners preserve actual coverage/conflicts/limits; an incomplete case is not necessarily a runner failure.

The optional real-PTY driver requires the separate hash-locked Python terminal-test environment described in [the TUI guide](../packages/tui/README.md). On the retained local setup:

```sh
mkdir "$P2_RUN/pty"
HEURISKO_TUI_RECEIPTS="$P2_RUN/pty" /private/tmp/heurisko-p2-terminal-venv/bin/python packages/tui/tests/phase2-findings.py "$P2_CASES" > "$P2_RUN/pty.log" 2>&1
printf '%s\n' "$?" > "$P2_RUN/pty.exit.txt"
```

Verify that interpreter is Python 3.13 with locked dependencies before use; if absent, follow the TUI setup rather than substituting ambient packages. This checks retained final-runtime reports. To exercise fresh replay outputs, pass the successful new `"$P2_RUN/inert-conformance"` directory instead. No TUI design change/freeze is part of this task.

## 6. Track B: blind labels, family separation and held-out grading

### What “held out” means and what to prepare

Reserve examples the rule author has not used to tune the detector. The custodian keeps expected answers and outputs from the detector author until code/configuration and labels are frozen. The reviewer first reads original artifact/source evidence and writes expected events/limitations. Only **after** freeze and analysis do they compare outputs and review claims. Section 3's visible answers and all existing Phase 1/2 examples stay **development only**.

Approved minima, unchanged from P2-EVAL:

| Requirement | Minimum |
|---|---|
| Development families | 12 reviewed families |
| Held-out families/reports | 24 wholly separate families; at least 120 reports |
| Exclusive primary categories | `benign-authored`, `benign-generated`, `inert-mutated`, `ambiguous-incomplete`; at least 30 reports and six families per category |
| Supported field events in held-out | For each of `Q1.lifecycle`, `Q1.script`, `Q2.entrypoint`: at least 10 additions, 10 changes and 10 removals |
| Consequential trust/build judgments | Two independent human reviewers; retain disagreement and adjudication |

Group versions, monorepos, forks, common templates/build recipes and all derivative mutations together. A shared relation joins the entire connected group; no relative or derivative may cross development/held-out. The current 12 provisional project groups need human family/rights review and cannot be relabeled as the 24 held-out families. Keep the split method/seed, family rationale and exclusions. Do not multiply duplicated events or parent/child findings to reach minima.

Use lawfully retainable public licensed data and original inert mutations only. Record full archive/member/source digests, origin/capture, exact release/commit/subtree and notices/permissions. “Public URL” is not rights clearance. Retain existing generated bytes or write inert text; do not run a target build, fetch live malware, use confidential data or remove notices.

### Form B — reviewer and per-case blind label

This is a **format illustration**, not independent labels or a ready-to-grade dataset. Save a new `labels.json` under custodian control. Replace every `<...>` with evidence/person-specific values and add every development/held-out case. Leave the booleans false until their statements are actually true. `kind: "human"` applies only to a real named human. Extra rationale/citation/rights fields below are retained review evidence; the grader consumes the event and gate fields described in [the format reference](../examples/production-phase2/2026-11-02-local-01/grading-format.json).

```json
{
  "version": "heurisko-p2-labels-v1",
  "reviewers": [
    {
      "id": "reviewer-1",
      "name": "<actual human name>",
      "kind": "human",
      "role": "<custodian/labeler/output reviewer>",
      "independentOfDetectorAuthorship": false,
      "independenceRationale": "<actual authorship and prior-output exposure>"
    }
  ],
  "splitMethod": "<method, seed, family/related-group review and date>",
  "cases": [
    {
      "id": "<unique case ID>",
      "family": "<reviewed upstream/connected family ID>",
      "relatedGroups": ["<fork/template/build-recipe group, if any>"],
      "split": "held-out",
      "primaryCategory": "inert-mutated",
      "secondaryTags": ["lifecycle-removal"],
      "reviewerIds": ["reviewer-1"],
      "labeledBeforeOutputs": false,
      "labelTime": "<actual timestamp>",
      "consequentialTrustOrBuild": false,
      "rightsAccepted": false,
      "rightsEvidence": "<license/notice/permission paths and allowed scope>",
      "immutableEvidenceHashes": {
        "artifact": "sha256:<full observed archive SHA-256>",
        "source": "sha256:<full observed source archive SHA-256>"
      },
      "events": [
        {
          "artifactSha256": "sha256:<same exact artifact digest>",
          "sourceSha256": "sha256:<independently established selected source archive digest>",
          "pointer": "/scripts/postinstall",
          "ruleClass": "Q1.lifecycle",
          "direction": "remove",
          "severity": "informational",
          "priority": "low",
          "rationale": "<proof the key exists in source and is absent in the intact artifact manifest>",
          "citations": ["<member, side, full digest and byte range for each premise>"]
        }
      ],
      "explanations": [],
      "policyDecisions": [],
      "mustRemainUnresolved": false,
      "independentlyExplainableGenerated": false,
      "excluded": false,
      "adjudication": "<agreement, unresolved dispute, or second reviewer record>"
    }
  ]
}
```

The illustrated removal's pointer/direction/rubric values are valid **only if the reserved bytes independently establish that event**; they are not defaults for other cases. For no supported field event use `events: []`; for missing/ambiguous scope record its reason and `mustRemainUnresolved: true` where required. Do not invent a source digest: the event `sourceSha256` must match the unit convention (a single acquired source archive, otherwise JSON `null`); retain all actual candidate digests and ambiguity separately. Missing content is not proven field absence. Supported rule classes are exactly the three shown in the minimum table; directions are `add`, `change`, `remove`. Family/case IDs are reviewer-owned stable IDs, not package names guessed from outputs.

For explainable file/transform units, freeze stable IDs in `explanations` such as `{"id":"case-17:source/package.json->artifact/package.json:json-format-v1"}` with evidence/rationale. Mark `independentlyExplainableGenerated` true only from independent source/artifact/build-context evidence, not because the detector explains it. For policy units use actual `artifactSha256`, exact `policyId` and expected `result`; existing production observations use `none` / `not_evaluated` when no policy is requested, and a requested unsupported policy is `indeterminate`. Do not invent positive Q4 production truth. Record unsupported operational Q4 scope as an open gate.

For exclusions set `excluded: true` and add `exclusionReason`; retain the case/evidence and family links, report it in counts, and ensure remaining minima still hold. Consequential cases need two distinct IDs in `reviewerIds`, both declared independent humans. Never resolve a substantive disagreement by silently choosing the detector's answer.

### Form C — freeze before outputs

Save `freeze.json` only after the independent labels and candidate are fixed. These are **bare 64-hex SHA-256 strings** (no `sha256:` prefix), unlike report/event content references. This record cannot prove its own timing; retain dated custody/review evidence too.

```json
{
  "labelsSha256": "<SHA-256 of the final labels.json bytes>",
  "independentCustodian": "<actual human name and reviewer ID>",
  "codeSha256": "<aggregate codeSha256 from a development normalization of this exact candidate>",
  "configurationSha256": "<aggregate configurationSha256 from that same normalization>",
  "frozenBeforeOutputs": false,
  "frozenAt": "<actual timestamp/timezone>",
  "sourceManifest": "<full file/hash manifest plus HEAD and working/index patches>",
  "graderSha256": "<SHA-256 of scripts/grade-phase2.py>",
  "normalizerSha256": "<SHA-256 of scripts/normalize-phase2-observations.mjs>",
  "splitAndEvidenceManifestSha256": "<full digest of the immutable reviewed input/split manifest>",
  "custodyEvidence": "<dated blind-label/review records; access and disclosure history>"
}
```

Compute file hashes, rather than typing known-looking values:

```sh
shasum -a 256 scripts/grade-phase2.py scripts/normalize-phase2-observations.mjs
shasum -a 256 "$P2_RUN/labels.json"
```

Use the custodian's actual path if labels are elsewhere. The aggregate normalizer `codeSha256` is **not** the module implementation digest or Git HEAD. Derive it from a development report of the same candidate/options via the normalizer, before held-out runs. For the unchanged implemented runtime, this command normalizes the eight retained development reports and prints their aggregate identity:

```sh
node scripts/normalize-phase2-observations.mjs "$P2_EVIDENCE/development-report-manifest-delivery.json" "$P2_RUN/development-identity.json"
```

Read the top-level `codeSha256` and `configurationSha256` in that output. For a changed runtime or different options, generate fresh development reports and a matching development report manifest first; the retained reports cannot establish the new candidate's identity. All normalized reports in one run must share code/configuration identity; different options/profiles require a separately declared evaluation, not edited hash fields. Freeze tool versions, thresholds, input/split/labels and grader/normalizer bytes too. The scripts check some of these fields; humans must verify timing, custody, rights and source identity.

### Run the frozen candidate, normalize once, then review outputs

After freeze, an operator/custodian runs the shared engine on the reserved immutable inputs into **new** reports/stores, with frozen options and no target execution. The existing public development runner is a fixed development-corpus runner, not a general held-out acquisition tool. Assemble host-owned CLI local-replay commands using [the exact CLI syntax](CLI%20Reference.md#local-archive-and-source-replay) and each reviewed input manifest; do not guess a source commit/URL or silently fetch a replacement. Record every command, exit, input/output digest and failure. An absent report remains an evaluation miss/coverage limitation; do not omit the label.

For a case with a retained artifact **and** retained pinned source, fill these shell variables from the custodian's reviewed manifest:

| Variable | Value to use |
|---|---|
| `P2_CASE_ID` | Its unique case ID, restricted here to letters/digits/hyphen/underscore for the output directory |
| `P2_ARTIFACT` | Absolute path to that exact retained artifact archive |
| `P2_SOURCE_ARCHIVE` | Absolute path to that exact retained source archive |
| `P2_REPOSITORY` | Reviewed allowed GitHub repository URL |
| `P2_COMMIT` | Reviewed full 40-hex source commit |

After setting all five variables, execute this template for a repository-root package. If the reviewed package has a nonempty subtree, add `--subdirectory` followed by that exact reviewed value before running; record this in the frozen input manifest. The source URL/commit remain comparison claims, not a verified release binding.

```sh
test -n "$P2_CASE_ID" && test -n "$P2_REPOSITORY" && test -n "$P2_COMMIT" && test -f "$P2_ARTIFACT" && test -f "$P2_SOURCE_ARCHIVE"
mkdir -p "$P2_RUN/runs"
mkdir "$P2_RUN/runs/$P2_CASE_ID"
HEURISKO_ANALYSIS_MODULE=p2-static-v1 node packages/cli/dist/index.js analyze --artifact "$P2_ARTIFACT" --source "$P2_REPOSITORY" --commit "$P2_COMMIT" --source-archive "$P2_SOURCE_ARCHIVE" --store "$P2_RUN/runs/$P2_CASE_ID/store" --report "$P2_RUN/runs/$P2_CASE_ID/report.json" --no-ai --json > "$P2_RUN/runs/$P2_CASE_ID/stdout.json" 2> "$P2_RUN/runs/$P2_CASE_ID/stderr.log"
printf '%s\n' "$?" > "$P2_RUN/runs/$P2_CASE_ID/exit.txt"
```

Stop if the prerequisite test or new case-directory creation fails; do not overwrite a prior attempt. Match every option to the frozen profile. This template is not suitable for an absent/unsupported source case or an alternate policy profile. Have the operator record that case's explicit intended invocation and uncertainty before running; do not invent a commit/archive to make this template fit. Missing/corrupt-source tests use intentionally isolated copies and retained failure evidence, never changes to original archives/stores.

Create `reports.json` beside `labels.json`/`freeze.json`. Paths inside it are relative to **this manifest file**, not the terminal:

```json
{
  "freeze": "freeze.json",
  "labels": "labels.json",
  "cases": [
    {
      "id": "<same unique case ID as its blind label>",
      "split": "held-out",
      "report": "runs/<case ID>/report.json",
      "store": "runs/<case ID>/store"
    }
  ]
}
```

List successful saved observations only; retain missing-report attempts separately and leave their label cases in the dataset. The normalizer requires at least one report and identical identities. It opens immutable report/store bytes, extracts events and emits **provisional** claim candidates. Run:

```sh
node scripts/normalize-phase2-observations.mjs "$P2_RUN/reports.json" "$P2_RUN/observations.raw.json"
```

Use actual custodian paths as needed. Do not alter `observations.raw.json`, original reports, or frozen labels. Make a separate `observations.reviewed.json` containing the same facts plus the independent reviews below. Record hashes for both and a review trail. `HELD_OUT_CUSTODY_AND_FREEZE_REQUIRED`, `INDEPENDENT_LABEL_FREEZE_REQUIRED`, `FROZEN_CODE_CONFIGURATION_MISMATCH` or `MIXED_DETECTOR_IDENTITIES` means stop that grading step and resolve the stated gate, not change recorded identity to match.

### Form D — independent output, claim and explanation review

For **each report**, the human reviewer checks every factual claim, including source/context, values/direction, coverage, limitations and outcome statements. Split compound statements into atomic claims; one finding may need several claim records. Do not just count findings. Add these fields to its normalized case in the separate reviewed file; retain actual `events`, `policyDecisions`, report digests and other generated facts unchanged:

```json
{
  "reviewerId": "reviewer-1",
  "humanReviewComplete": false,
  "claimUnitsAreProvisional": true,
  "factualClaimCount": 1,
  "humanReviewedFalseEscalation": false,
  "claimReviews": [
    {
      "id": "<case ID>:claim-001",
      "reviewerId": "reviewer-1",
      "claim": "<one exact factual proposition>",
      "citationLocations": ["<evidence ID, side, member, full digest, byte range>"],
      "citationResolved": false,
      "supported": false,
      "rationale": "<does the cited evidence establish every premise?>"
    }
  ],
  "explanationReviews": [],
  "supportedExplanation": false,
  "criticalFailures": [],
  "reviewEvidence": "<dated notes/adjudication and checked coverage>"
}
```

This fragment is an uncompleted form, **not** an extra case to append. Set `factualClaimCount` to the actual enumerated total. Set `claimUnitsAreProvisional: false` and `humanReviewComplete: true` only after complete atomic review. `citationResolved` asks whether the exact retained bytes/location can be read; `supported` asks whether those bytes actually establish this claim. A readable citation can still be unsupported. False escalation includes unjustified priority/severity or behavior/intent assertions; a visible raw difference alone is not automatically a false alarm. Mark false escalation true when found; false is a judgment after review, not a convenient default.

Map each output explanation to a **pre-frozen file/transform unit** by independently checking its members/ranges/scope, then add `{"id":"<frozen unit ID>","reviewerId":"reviewer-1","supported":true,"rationale":"<evidence>"}`. Unsupported extra explanations must also be recorded as reviewed units with `supported: false` and their own stable IDs; never drop them to improve precision. Missing expected units remain misses. Set report-level `supportedExplanation` true only when its independently explainable generated relationship is actually supported. Keep the frozen labels unchanged. Record critical boundary failures with descriptive stable codes in `criticalFailures`, for example `WRONG_SUBJECT_VERIFIED`, `HIDDEN_SOURCE_CONFLICT`, `INVENTED_REPRODUCTION`, `HISTORICAL_BYTES_CHANGED`. An empty array is justified only after checking those boundaries.

At the reviewed observations' **top level**, `mandatoryConformanceComplete` remains **false** until every required fixture/compatibility/exit receipt is checked and actual authorship is recorded for the admitted scope, including the remaining Q4 application matrix where applicable. Attach the receipt manifest and rationale when changing it. Current isolated Q4 experiments alone do not justify true; owner-accepted browser scope is recorded separately and does not fabricate executed fixture checks. The grader trusts this recorded attestation; it does not run or authenticate that matrix itself.

### Grade exactly once after all entry checks

For practice only, the existing development labels/normalization can be graded into a new file:

```sh
python3 scripts/grade-phase2.py "$P2_EVIDENCE/development-labels-delivery.json" "$P2_EVIDENCE/development-normalized-delivery.json" "$P2_RUN/development-grading.json"
```

Expected development `acceptance` is JSON **`null`**, not true. This is not independent evaluation. When actual held-out inputs, blind labels, freeze, independent output reviews and mandatory conformance are ready:

```sh
python3 scripts/grade-phase2.py "$P2_RUN/labels.json" "$P2_RUN/observations.reviewed.json" "$P2_RUN/held-out-grading.json" --held-out --freeze "$P2_RUN/freeze.json" > "$P2_RUN/held-out-grading.log" 2>&1
printf '%s\n' "$?" > "$P2_RUN/held-out-grading.exit.txt"
```

Entry-gate rejection is **BLOCKED**, not a detector score. Once eligible, the grader exclusively creates `freeze.grading-attempt.json` and preserves the attempt even if scores fail. Do not delete/rename that receipt to grade the same reserve again. Tuning after disclosure needs a new wholly separate family reserve and prospective evaluation declaration. A process exit 0 means the grader completed; inspect JSON `acceptance`, which may be **false**. Keep failure metrics, exclusions and all raw outputs.

| Acceptance check | Required result |
|---|---|
| Q1 lifecycle, Q1 ordinary script, Q2 entrypoint, each separately | Precision and unconditional recall ≥95%; direction 100%; severity and priority each ≥95%; event minima satisfied |
| Q3 | Supported explanation precision ≥95%; ≥70% of independently explainable generated reports explained; raw residuals visible |
| False escalation | ≤5% separately in benign-authored and benign-generated reports (at 30 reports, at most one each) |
| Ambiguity/resolution | Preserve unresolved status for 100% of mandatory ambiguous cases; resolve ≥95% of supported intact in-budget Q1/Q2 events |
| Claims/citations and critical boundaries | Every factual claim independently enumerated, cited, readable and supported; zero hidden conflict/omission, invented absence/execution/safety/reproduction, wrong-subject success or unsupported policy pass |
| Provenance/policy/compatibility | Every mandatory positive/negative/application exit fixture passes for supported scope, including at least two real npm positives per admitted provider/format; explicit independent receipt |

Keep category/family/event/claim denominators, misses, abstention/reasons, exclusions, raw coverage and family-cluster uncertainty. Missing or abstained supported events count as misses; zero denominator is N/A. The script implements explicit gates, but cannot discover an omitted human claim, fake rights decision or incomplete fixture attestation. Review the full roadmap criteria alongside its output; `acceptance: true` alone is not owner phase acceptance, a safety verdict or Q4 admission.

## 7. Track C: Q4 verifier and trust-policy review

### Review concrete retained evidence first

The current local interfaces select an exact key in the trusted host catalog; setup and policy fields are described in the [CLI reference](CLI%20Reference.md#offline-provenance-and-expected-policy). The following proposal/prototype records are historical inputs to that implementation. Review the [versioned proposal](../examples/production-phase2/2026-11-02-local-01/trust-policy-proposal.v1.json), [76-check isolated result](../examples/production-phase2/2026-11-02-local-01/q4-review02/evaluation-final.json), [four worker probes](../examples/production-phase2/2026-11-02-local-01/q4-worker-final/validation.json) and [alternative package review](../examples/production-phase2/2026-11-02-local-01/q4-alternative/review.json). These are implementation experiments, not independent trust admission.

| Form E field | Known value to copy | Reviewer action |
|---|---|---|
| Candidate | `@sigstore/verify@4.1.2` | Compare released tar/SRI/full SHA-256/file manifest and source; review exact security/rights/compatibility evidence |
| Evaluated closure | `@sigstore/bundle@5.0.0`, `@sigstore/core@4.0.1`, `@sigstore/protobuf-specs@0.5.2`, plus the verifier | Check every released byte/notices; package metadata alone is insufficient |
| Upstream source commit | `769a53d8713248a8bf49edfc2a5d1955b0dcc24d` | Check retained source/fixture/notice hashes and candidate mapping |
| Alternative | `sigstore@5.0.0`, exact 52-package closure; statically reviewed, not executed | Do not treat it as admitted or equivalent to the small evaluated closure |
| Proposed policy ID / state | `npm-gha-slsa-v1-draft.1` / `PROPOSED_NOT_ADMITTED_NOT_INTEGRATED` | Review this exact version and compute its full content hash |
| Intended initial scope | Exact public npm; GitHub Actions hosted; SLSA v1; Sigstore bundle `application/vnd.dev.sigstore.bundle.v0.3+json`; log `dsse/0.0.1` and `dsse/0.0.2` | Approve/reject with exact supported limits; unknown formats stay indeterminate |
| Expected issuer | `https://token.actions.githubusercontent.com` | Obtain other identity values independently of the assertion being checked |
| Builder / build type | `https://github.com/actions/runner/github-hosted` / `https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1` | Check exact supported mapping and signed claims |
| Evaluation root SHA-256 | `6494e21ea73fa7ee769f85f57d5a3e6a08725eae1e38c755fc3517c9e6bc0b66` | Research snapshot only; **not** an authenticated production bootstrap |
| Evaluation root source commit | `c9bda74ad2221f938f7d2e0295ca3aad2da710a8` | Preserve source/rights; do not turn a downloaded snapshot into an approved trust anchor |
| Admission decision | `PENDING` | Change only on actual reviewed evidence and owner decision |

### Form E — trust/admission record

```text
Reviewer name / independence / specialty: <actual human and relevant scope>
Review time / source candidate: <actual timestamp, HEAD+patch/hash identity>
Verifier and full closure hashes: <released bytes/notice/security ledger>
Policy: npm-gha-slsa-v1-draft.1
Policy file SHA-256: <compute from exact reviewed bytes>
Scope: <exact supported issuer/provider/predicate/bundle/log versions>
Rights decision / missing notices: <evidence and disposition, not metadata alone>
Security advisory review: <date, exact closure, findings and regression evidence>
Authenticated production TUF bootstrap/version/digest: NOT ESTABLISHED
Snapshot rotation/expiry/rollback/freshness evidence: PENDING
Native Linux/tool/resource/cancellation evidence: PENDING
Production OS execution boundary / network denial evidence: PENDING
Full mandatory application/exit fixture matrix: PENDING
Independent subject/source/workflow/builder expectations: <per-fixture source>
Second consequential reviewer / adjudication: <actual records>
Proposed default/required/optional handling: <exact accepted version or objections>
Decision: PENDING
Unresolved issue / owner / resolution condition: <one row per gap>
Owner admission, if later granted: <explicit scope/version/hash/date; otherwise pending>
```

Do not fill unknown per-package expectations with values copied from its envelope. For **each real positive**, independently record package/version, canonical npm purl, exact archive SHA-256/SHA-512, repository URL, full commit, subtree, workflow path/ref, exact signer SAN, issuer, builder/build type and accepted parameters. Verify every supported declared subject digest. SAN patterns must be escaped and anchored exact matches; the library treats strings as regexes. Missing or unsupported required source/subtree/OID information is indeterminate, not a reason to guess.

### Required test matrix and remaining admission work

Maintain one Form A/E fixture row per condition, with immutable inputs/expected result/actual crypto result/actual policy result/evidence/exit. Keep an unchanged positive beside each mutation. The 76 existing checks cover a meaningful subset; they do not replace the following full application admission work:

| Fixture group | Required checks / expected boundary |
|---|---|
| Real positives | At least two lawfully retained exact npm artifact/envelope pairs per admitted provider/format; valid crypto **and independently supplied matching expectations**; known-answer upstream fixtures retain their own notices |
| Tampered bytes | One-byte artifact, payload, payload-type and signature mutations reject; wrong digest/package/version never gets target provenance success |
| Disallowed identity | Valid signature with wrong signer, issuer, OID, repository, commit, subtree, workflow path/ref, builder, build type or parameters cannot pass policy; crypto success and policy violation stay separate |
| Unsupported/absent | Publish-only cannot satisfy build policy; absent assertions, unknown formats/algorithms/parameters and missing required fields retain their distinct absent/unsupported/indeterminate meanings |
| Roots and time | Authenticated bootstrap/TUF chain, expiry/rotation/rollback/freshness; malformed/untrusted/expired roots; authenticated signing time versus unsigned integrated time; historical reopening does not silently refresh |
| Transparency | Missing/forged timestamp, inclusion proof/checkpoint; unknown log versions, duplicate logs and unsigned trailing checkpoint text fail the admitted profile |
| Conflicts | Multiple contradictory assertions, duplicate/conflicting subjects/digests and existing source candidates remain visible; no favorable assertion silently wins |
| Containment | Oversize/deep/duplicate JSON, malformed certificates, CPU/memory/output caps, deadline and cancellation with confirmed worker settlement; native Linux and macOS; rejected hosts/redirects and actual offline network boundary |
| Application and compatibility | Actual shared-engine reports, policy outcomes and CLI exits; identical saved-report facts across CLI/TUI/web; old reports unchanged; six independent outcomes and AI state; no target install/build/execute |

The draft proposes at most **256 KiB** input, JSON depth **32**, **128** records, a **128 MiB** worker-memory budget and **5 seconds** wall time, at least one distinct log/authenticated signing timestamp/SCT, and a **30-day** authenticated snapshot freshness budget. These draft values are now enforced by the admitted restricted worker. The earlier prototype Node heap flag/JavaScript network monkey-patches were **not** OS containment proof, and its 500 ms probe was not the production budget. Current fixed-container/resource/network/TUF evidence is in the execution receipt; new-worker native Linux, real-format and full application reliability acceptance remain open.

When an application integration is separately admitted/implemented, check the following intended outcomes through the actual evaluator, not a manually constructed report:

| Case, with otherwise complete analysis | Intended provenance/policy/exit |
|---|---|
| Valid exact subject + all required expectations | `verified_policy`; policy `pass`; exit 0 |
| Valid exact subject, no policy | `verified_cryptographic_only`; `not_evaluated`; exit 0 |
| Valid crypto, supported required expectation mismatch | `verified_cryptographic_only`; `violation`; exit 1 |
| Definite invalid signature/subject under required draft policy | `invalid`; `violation`; exit 1 |
| Bounded discovery with no required build assertion | `absent`; `violation`; exit 1 |
| Explicitly optional permitted absence | Provenance stays `absent`; policy may pass; exit 0 |
| Unknown/unsupported/stale/conflicting/cancelled | Unresolved/not checked as actually observed; `indeterminate`; exit 2 |
| No usable report | No fabricated outcome; exit 3 |

Policy violation precedes incomplete status. Hash/signature success never upgrades correspondence or proves safety. Without a host catalog, capture-only behavior still records unchecked provenance and indeterminate requested policy. With the accepted host catalog/worker, the current receipt records actual positive/adverse policy execution; the original isolated evaluation is historical. An evaluation root is never a production form value.

### Optional isolated prototype rerun

The original isolated evaluation used operator-selected tools outside product dependencies. Current production source uses the exact admitted lockfile closure and scoped minimatch remediation; follow the current receipt and operational setup for new checks. Never install a target package, run upstream hooks or activate the larger alternative. If the isolated tool directory is gone, record that rerun prerequisite as blocked and review retained evidence; reconstruction needs the exact released-byte/notice ledger and inspected fixture preparation, not an improvised latest install.

```sh
test -f /private/tmp/heurisko-p2-verifier-eval-20261102/package.json
node --max-old-space-size=128 --stack-size=512 scripts/evaluate-phase2-verifier.mjs /private/tmp/heurisko-p2-verifier-eval-20261102 "$P2_EVIDENCE/q4-review02" "$P2_RUN/q4-evaluation.json" > "$P2_RUN/q4-evaluation.log" 2>&1
printf '%s\n' "$?" > "$P2_RUN/q4-evaluation.exit.txt"
node scripts/check-phase2-verifier-worker.mjs /private/tmp/heurisko-p2-verifier-eval-20261102 "$P2_EVIDENCE/q4-review02" "$P2_RUN/q4-worker" > "$P2_RUN/q4-worker.log" 2>&1
printf '%s\n' "$?" > "$P2_RUN/q4-worker.exit.txt"
```

Stop on a missing prerequisite; do not run later commands on an unverified replacement. Expected retained prototype scope is 76 fixture checks and four worker probes, zero candidate network attempts. Compare failure modes and actual scope, not a permanent magic count. Passing them again does not admit the tool, roots, trust policy or production integration.

## 8. Form F: assembled review and owner decision

Collect the local records instead of creating another master plan or rewriting historical receipts. Link results and unresolved gates from the owning roadmap items P2-01 through P2-08. Do not overwrite the 2 November evidence or earlier source/admission snapshots. For any new source, retain a fresh full file/hash manifest, not just HEAD when the tree is dirty.

```text
Reviewed source: <HEAD + working/index patch + full source-manifest digest>
Engine/module/configuration identity: <full digests from the actual candidate>
Implementation checks: <commands, exits, logs; failures and dispositions>
Manual browser/TUI results: <Form A IDs, browser/AT/viewport coverage and limits>
Independent evaluation: <custodian/reviewers, frozen manifests and one-pass result>
Held-out misses / false escalations / abstention / citation issues: <actual metrics>
Q4 verifier/roots/policy admission: <Form E decision or still pending>
Mandatory critical-negative/compatibility matrix: <receipt and remaining gaps>
Historical evidence/index/worktree preservation: <checked hashes and records>
Unresolved gate / owner / resolution: <each exact remaining condition>
Local completion: <scope actually completed, with limitations>
Phase 1: open unless its own remaining technical criteria are explicitly resolved
Existing Phase 1 owner acceptance: preserved
Phase 2 owner decision: PENDING
Publication: NOT AUTHORIZED
```

Shane records acceptance only for a named source and scope after the required evidence exists. Passing implementation checks, a grader result, or acceptance of limitations does not invent an independent observation. Concrete Q4 admission remains separate from broader phase acceptance. Publication/PR/commit/push/merge/release/deployment and external messages are not steps in this local guide.

Phase 1's final published-head CI at `7eee564` is now [confirmed](../examples/production-phase2/2026-11-02-blockers-01/ci-observation.json). Its applicable rights/distribution dispositions stay in [its existing plan](Production%20Phase%201%20Implementation%20Plan.md). Do not repeat owner-closed human gates or treat binary/image release holds as universal blockers to local review. Keep technical completion, independent evaluation, phase acceptance and publication as distinct recorded statuses.

Current local validation also executes the real producer/evaluator/persisted-report path with signed Rollup fixtures and explicit source unavailability, and live CLI `analyze` cases for exits 0/1/2/3. See the current receipt. The final TUF closure uses scoped minimatch 11.0.1 remediation, with exact 14-release byte/notice and compatibility evidence. Rerunning dated crypto fixtures requires an unexpired authenticated snapshot: `node scripts/test-phase2-trust.mjs NEW_OUTPUT AUTHENTICATED_SNAPSHOT.json`. Original reports remain historical; expired trust metadata is not repaired by reopening.


## 9. Closure tooling and controlled signatures

The [supported source package instructions](../SOURCE_PACKAGE.md) give the pinned setup, complete test inventory and portable native runner. The [fixture rights map](production-phase1/source-fixture-rights.json) binds exact public fixture notices; source selection excludes event documents and unselected binary/image material while preserving originals/history. All selected files and exclusions are hashed. The source package checker reports historical links into omitted evidence as explicit omissions; the full repository documentation checker still validates original destinations.

Run `node --test scripts/tests/credential-scan.test.mjs` for the bounded credential scanner. `node scripts/check-phase1-secrets.mjs` scans present nonignored Git candidate text. `node scripts/check-phase1-secrets.mjs --manifest PATH_TO_SELECTION_MANIFEST` restricts coverage to the exact current candidate selection and verifies scanned file hashes. The 64 KiB buffer and 64-byte overlap recognize every minimum accepting pattern across chunks, including arbitrarily long matching tails. Findings contain path/format only. Unsupported types, ignored/private files and unknown secret formats remain outside coverage; required text read/mutation/budget failures exit 2, recognized findings exit 1 and a completed covered scan exits 0. Parser limits are unchanged.

Version-1 controlled fixtures use ephemeral keys, original inert archives, signed DSSE/log/checkpoint/SET/SCT/certificates and TUF roles. The isolated fixed-anchor build uses the actual evaluator and restrictions. See [verifier admission](../packages/core/VERIFIER_ADMISSION.md) for exact boundaries and [actual receipts](../examples/production-phase2/2026-11-02-closure-implementation-01/RESULTS.md) for passes, failures and missing capabilities. A correctly signed wrong identity/subject is signed afresh; it is not a modified JSON envelope with an invalid old signature. Contradictory statements share one subject and have distinct valid signed payloads. Controlled production-shaped reports remain explicitly controlled in their receipts, with no real npm publisher claims.

The portable runner requires host Linux x86_64, host Node x64 and a native x86_64 Docker engine together. This ARM Mac is rejected before native checks. No owner test execution or repeated signoff is required; an accessible existing native host or separately authorized future CI publication supplies the missing capability. Current browser/accessibility acceptance stays owner-closed, with original unperformed observations unchanged.


For the focused revision-3 contradictory builder/source lane, use the factory's `--conflict-only` option and both harnesses' `--matrix-only` option. Default runs retain the full matrix. Actual focused results are [8 restricted checks plus production-root rejection](../examples/production-phase2/2026-11-02-closure-implementation-01/controlled-evaluation-03-strict-conflict/summary.json) and [7 producer/report/exit/parity checks](../examples/production-phase2/2026-11-02-closure-implementation-01/controlled-integration-06-strict-conflict/summary.json), all passing. They do not erase earlier failures or substitute for native/real-format acceptance.
