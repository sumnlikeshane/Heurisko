# Part 4 local terminal integration

Uses the same core engine and validated immutable reports. React 19.1.8, Ink 6.3.1, string-width 7.2.0 and React types 19.1.5 reuse the reviewed spike's released pins and MIT licenses; exact resolution/integrity is in the root pnpm lock. [Original admission metadata](references/spike-npm-dependencies.json) is dated historical evidence, not a fresh vulnerability audit. Fresh [registry admission](references/registry-admission.json) checks exact peers/engines/license/integrity; the [dated advisory result](references/npm-audit.json) lists zero vulnerabilities and is not proof of absence. Node 22.23.4 and pnpm 10.14.0 remain the tested setup. Install with scripts disabled. No package under investigation is installed or executed.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm run build
node packages/cli/dist/index.js
node packages/cli/dist/index.js --store .heurisko/my-store --no-color
node packages/cli/dist/index.js tui examples/part4/current/local-m1.report.json --store examples/part4/current/store
pnpm run test:s4
```

No arguments opens Home only when stdin and stdout are TTYs. Redirected default output is help; redirected `tui REPORT` is an inert historical summary with the report's exit status. `analyze`/`inspect` retain JSON automation. Explicit report files can open with missing evidence; bytes are read only on demand and every window is bounded and hash-checked through the reviewed integration reader.

## Connected deterministic investigations

New TUI investigations use the supplied `55240e99409ad44cbd6a978f40873ef410cb1861` reviewed deterministic entry through the shared engine by default:

```sh
node packages/cli/dist/index.js \
  --store .heurisko/CONFIGURED_TUI_NEW --no-color
```

Choose a local/npm target, review it and explicitly Start. An absent/empty selector uses the reviewed default; `HEURISKO_ANALYSIS_MODULE=55240e9` explicitly pins the same selection, while `HEURISKO_ANALYSIS_MODULE=off` preserves raw-only/unavailable analysis for reproduction. The setting is trusted host-process configuration, not package metadata or a TUI module-path control; unknown nonempty selectors are rejected before acquisition. Opening `tui REPORT` only renders the report's recorded configuration and never reruns it. Exact intake/validation limits are in the [module record](../../docs/Final%20Module%20Intake.md).

This path uses reviewed deterministic code with bounded hash-checked retained evidence. Missing, corrupt or over-limit deltas/members remain limited/unexplained with incomplete heuristics. Product models/providers/CodeAstra are not admitted; new TUI work stays model-off. Findings are scoped observations and do not establish safety, verified generated/build equivalence, provenance-policy success, monitoring or human design acceptance. Historical e8b8116 and raw receipts below retain their original meaning.

The adopted [component inventory](adoption.json) now includes the revision-7 Home, Overview, centered target form/review, Shell and Workspace composition, with actual engine projections. The [visual audit](../../docs/Part%204%20TUI%20Visual%20Audit.md) records the earlier mismatch, source hashes, corrections and remaining boundaries. Fixture data and simulated capabilities are excluded. Panel rows and the input listener were adapted after production PTY defects. Official [Ink 6.3.1 APIs](https://github.com/vadimdemedes/ink/blob/v6.3.1/readme.md) were consulted; Firecrawl was unavailable, official raw documentation was read through the web fallback. No screenshot or human visual approval is claimed. The design remains v1.0.0-rc.1, unapproved/unfrozen.

Keys: `H/I/M` Home/reports/monitoring, `1–6` sections, `[`/`]` previous/next. Arrows/j/k move; Tab/Shift+Tab focus; Enter inspect; `e` evidence; Esc exact Back; q quits the app. Text fields own ordinary shortcuts; Ctrl+P palette and Ctrl+C interruption remain global. `/` filters; Ctrl+U clears input. Finding detail uses PageUp/PageDown to jump named sections. Findings cycle independent priority/severity/confidence/rule filters with `a/z/c/t`. Source `v` changes Candidates/Provenance/Build; `n` prepares a new target review. Files `m` jumps to the next modified record, `v` switches tree/flat, Enter expands directories, `d` switches raw span presentation, Left/Right pans. Search shows matching file records directly; clearing it restores the tree preference. Evidence Tab selects the next recorded citation, `s` changes side, `r` opens the raw delta record, `p/b` pages. `?` help; `x` resets report UI state.

Local archive review snapshots entered bytes through the existing bounded immutable store, preserves the original filename and rechecks the retained digest before Start. An explicit local source archive is retained and rechecked the same way; Start consumes those snapshots. Uncertain parser locks block this store write too. npm review validates exact coordinates and source overrides but explicitly leaves unresolved digest/source identity unknown until acquisition; it is not a frozen resolved-registry handoff. User source selection is not provenance. Local source replay uses an explicit archive path; historical retained references are never treated as executable filesystem paths. New investigations have AI disabled and no product inference runtime, while deterministic checks use the reviewed default unless the host selects `off`. Historical reports containing reviewed findings are rendered faithfully.

Live cancellation requests wait for engine settlement; no detach, retry, live evidence feed, cleanup acknowledgment or continuous monitor is invented. Uncertain parser creation/removal retains private spool and store locks for explicit recovery. Report UI state is version 2, keyed by report ID plus full observation digest in ignored `.heurisko-tui-state/`, outside immutable reports. It migrates v1 and retains per-section/source-subtab selection, independent pane scrolls, finding filters, queries, tree expansion, diff mode and Overview selection. Invalid state resets visibly; `x` resets it. Cross-process nested back stacks are not persisted. Copying is manual inert text; there are no terminal hyperlink/clipboard writes. Export/monitor/model actions explain unavailability.

Raw source/artifact changed byte windows are independently labeled and bounded to 4 KiB per side. Viewer-only line alignment is capped at 200 rows per side, with window-relative row numbers and exact byte-window labels; it makes no source-line, semantic or whole-file equivalence claim. Normalized/reproduced views are unavailable. Findings use context-dependent 3/2/1 panes; Files preserve the spike’s wider two-pane layout; short terminals show recovery text and retain context. Exact terminal acceptance, scenario limits and S4/G3 decisions belong to the [readiness report](../../docs/Part%204%20Integration%20Readiness%20Report.md).

PTY tests require test-only pyte 0.8.2 (LGPL-3.0) and wcwidth 0.2.13 (MIT), with [hash-locked requirements](requirements-terminal.txt). Keep those licenses if redistributing test tooling; no Python bundle is distributed. The current validation reuses the sibling spike's interpreter read-only; a portable test command may use any environment containing those exact test dependencies. `tests/prepare.mjs` creates explicitly synthetic render cases under ignored scratch. `tests/terminal.py` and `tests/terminal-live.py` run the product CLI in private PTYs and retain raw ANSI/decoded cells; their artifacts are observations, not generated screenshots. Live tests preserve stores until exact job absence is checked.

Opening/validating targets or reports, evidence reads and live investigation show progress. The engine currently supplies no unit totals, so live progress is animated and indeterminate with actual stage states and elapsed time. Measured percentages appear only with real valid counts (for example the retained-report catalog). Cancellation is a request until settlement, with no fabricated cleanup acknowledgment. New investigation includes a visible npm/Local archive selector and a focusable **Load retained example** action; loading a target does not Start it.

For the exact user-failure reproduction and current fresh npm/local walkthrough, use [the new fixture guide](../../examples/part4/user-failures/README.md). The original report is unchanged. Findings identifies the missing deterministic module and successful stages; Files has readable expanded roots, direct modified-file navigation and bounded content differences; Source resolves the actual version labels/claim basis from hash-checked evidence and labels new-target drafts. Old incomplete-inventory wording is explained alongside the retained original note. Async report/change/citation identity guards prevent stale bytes from being relabeled, and document wrapping is cached during navigation.

```sh
node packages/cli/dist/index.js tui examples/part4/user-failures/reproduction.report.json \
  --store examples/part4/user-failures/reproduction-store
# x resets only UI preferences; 2 Findings; 3 Files then m/Enter/e; 4 Source/Enter.
node packages/cli/dist/index.js tui examples/part4/user-failures/fresh-npm.report.json \
  --store examples/part4/user-failures/store
```

New product investigations remain model-off and use reviewed deterministic analysis by default. `HEURISKO_ANALYSIS_MODULE=off` reproduces raw/unavailable analysis. The separate e8b8116 validation report and exact lifecycle bytes stay explicitly labeled historical validation. Local archive Review/Start consumes immutable reviewed bytes. Ctrl+C requests cancellation and waits for settlement. Monitoring/export/model destinations explain their unavailable state. Functional S4, human usability/visual acceptance and joint G3 are separate; passing local tests does not approve the candidate design.

New user-task PTY suites are `tests/user-workflows.py` and `tests/user-states.py`; they use the same test-only interpreter/dependencies described above. `HEURISKO_WORKFLOW_MODE=live` runs real npm/local review/Start/history paths; `screens` runs the original-report width matrix and missing-evidence/non-TTY paths. Live acquisition requires public registry/source access and the local Docker socket. `HEURISKO_TUI_RECEIPTS` can redirect `tests/terminal-live.py` output to a new receipt root, preserving historical captures. Tests create fresh stores and preserve failed attempts. [Current receipts](../../integration/part4/receipts/user-failures/validation.json) give actual commands, counts, failures and runtime limits.

The Parts 4–6 audit separates cited-member bytes from retained evidence-record bytes: `r` names the record mode explicitly, and a new `e` entry resolves the citation again. Evidence-record digest and displayed content reference have separate labels. Source summaries retain full commit identity, selection/claim basis, conflict and read-failure reasons. An absent optional source-snapshot digest does not establish missing acquisition. Version labels require readable strict UTF-8 values; an unavailable explicit version citation stays unavailable. Opening or completing another investigation clears observation-specific navigation before restoring that observation's own saved UI profile.

Focused regressions `tests/evidence-mode.py` and `tests/report-adoption.py` use fresh receipt subdirectories and isolated UI profiles. The latter executes a complete local engine investigation over retained inert archives and requires the existing restricted Docker parser; it exercises old/new report preferences and explicit Open without registry acquisition or a product model. Use the same installed test-only Python interpreter described above, after the workspace build:

```sh
HEURISKO_TUI_RECEIPTS="$PWD/.heurisko/tui-audit" "$HEURISKO_TEST_PYTHON" packages/tui/tests/evidence-mode.py
HEURISKO_TUI_RECEIPTS="$PWD/.heurisko/tui-audit" "$HEURISKO_TEST_PYTHON" packages/tui/tests/report-adoption.py
```

Set `HEURISKO_TEST_PYTHON` to an existing interpreter containing the pinned terminal-test dependencies. Historical receipts above remain unchanged; current audit results and unverified human/accessibility gates are recorded separately.

## Current audit repairs

[The Shane-owned Parts 4–6 audit](../../docs/Shane%20Parts%204%E2%80%936%20Audit.md) records strict report-byte intake and member-bound citation ranges, distinct raw-record/citation labels and digests, complete Source claim/read-failure details and strict version values. A new citation resets record mode; a newly adopted observation resets report-specific navigation/filter state before its own saved profile is loaded. The previous observation/profile is preserved.

New regression commands use the existing test-only Python/pyte environment: `tests/evidence-mode.py` and `tests/report-adoption.py`. Set `HEURISKO_TUI_RECEIPTS` to a fresh receipt directory; the latter performs a real retained-local engine run and requires the admitted parser. [Fresh validation](../../examples/shane-parts456-audit/2026-11-01/README.md) distinguishes full unit/PTY checks, failed harness attempts, real local runs, and human/joint gates. Existing root labels are readable and expanded by default, with explicit collapse/re-expand coverage. No monitor, TUI exporter, intelligence loader, model or design approval is added.
