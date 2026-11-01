# Heurisko TUI design reference

**Candidate identity: v1.0.0-rc.1; not approved or frozen.** Filename retained for existing references. Reconciled 1 November 2026: preserve 59 confirmed directions without duplicated wireframes, obsolete foundation blockers or session handoff instructions. Final freeze still requires the owner's explicit acceptance of a named version.

## Authority and actual behavior

[Current decisions](../Approved%20Decision%20Register.md), executable report semantics and [foundation](../production-phase1/Foundation%20Contract.md) govern evidence. Confirmed preferences guide design; illustrative copy/colors/layouts/APIs/keys were never independently approved. Candidate status permits authorized local fixes/prototypes but does not establish final acceptance.

The TUI already exists. [Its guide](../../packages/tui/README.md) owns actual keys, setup, limits and tests; [adoption metadata](../../packages/tui/adoption.json) records reference components. Historical PTY/cell captures remain under `integration/part4/receipts/`. Source/API/PTY passes do not establish human visual/contrast/glyph/AT acceptance.

Keyboard, reports/raw evidence, local reviewed snapshots, progress/cancel and state are implemented. Model, monitoring and TUI export are unavailable. Remote npm digest/source remains unknown before acquisition. Paired raw windows are bounded aids, not semantic/line/hunk correspondence. UX1–UX3 in [the roadmap](../../PRODUCTION_MASTER_ROADMAP.md#priorities-and-known-issues) own remaining work; Phase 1 owns implemented-baseline review. Do not reuse the original B01–B13 design matrix as current vulnerabilities or instructions to rebuild working seams.

## Confirmed directions

Original confirmed choices and wording are retained below, including R4-55 = B. Exact mechanics still require source feasibility and observed acceptance.

| ID | Area | Selection | Confirmed direction |
|---|---|---|---|
| R1-01 | Overall visual direction | C | Hybrid: btop structure/color restraint, Posting clarity, Lazygit usability. |
| R1-02 | Information density | B | Balanced: compact but readable, with clear separation. |
| R1-03 | Theme | A | Dark-first, near-black, subtle borders, restrained semantic accents. |
| R1-04 | Panel borders | C | Outlined major panels, borderless internal content. |
| R1-05 | Startup | A | Home dashboard: new investigation, recent reports, monitoring, incomplete work. |
| R1-06 | Investigation organization | C | Overview dashboard, then dedicated multipane exploration screens. |
| R1-07 | Overview hierarchy | C | Prominent established takeaway followed by compact technical summaries, findings, coverage. |
| R1-08 | Exploration | C | Preview follows selection; Enter opens full inspection. |
| R1-09 | Diff format | A | Side-by-side when wide, unified when narrow, user-toggleable. |
| R1-10 | Findings organization | A | Review priority first, filters for severity, confidence, and type. |
| R1-11 | AI placement | B | Clearly labeled contextual interpretations plus dedicated AI section. |
| R1-12 | Keyboard discoverability | A | Contextual shortcut footer and `?` help, btop/Lazygit style. |
| R1-13 | Data visualization | B | Compact progress/coverage bars and small charts only when real measurements justify them. |
| R1-14 | Live progress style | A | Compact precise stage-state/count display, minimal layout movement. |
| R2-15 | Home layout | A | Prominent New Investigation action; recent reports and monitoring in two lower panels. |
| R2-16 | Global navigation | A | Compact top navigation for Home / Investigations / Monitoring. |
| R2-17 | Investigation navigation | A | Compact top tabs: Overview, Findings, Files, Source, AI, Coverage. Source includes provenance/build content rather than dropping it. |
| R2-18 | Persistent identity | A | Compact package/version, input type, report state; expanded identity available. |
| R2-19 | Wide pane allocation | B | Context-sensitive ratios: expand diff content in Files, detailed content in Findings. Exact ratios not approved. |
| R2-20 | Evidence pane | C | Visible in inspection-heavy sections; overview/setup can use full width. |
| R2-21 | Enter behavior | A | Open focused full-width detail with breadcrumbs and exact return position. |
| R2-22 | Responsive bands | A | ≥140 columns: 3 panes; 100–139: 2 panes; <100: 1 pane. Usable minimum/height thresholds remain undecided. |
| R2-23 | Files exploration | B | Expandable directory tree, toggleable flat searchable list. |
| R2-24 | Pane focus | A | Tab / Shift+Tab changes focused pane; arrows and j/k navigate items. |
| R2-25 | Section jumps | C | Both direct numeric jumps and next/previous section navigation. Actual mapping/chords unresolved. |
| R2-26 | Search and commands | A | `/` filters current view; Ctrl+P opens searchable actions/destinations. Exact scopes, command policy unresolved. |
| R2-27 | UI persistence | B | Persist per-report navigation preferences locally, separate from immutable report data. Storage schema/location unresolved. |
| R2-28 | Live investigation layout | A | Stage list left, live diagnostics and partial findings right. Narrow layout still must adapt. |
| R2-29 | Error placement | A | Persistent inline error at affected stage, concise summary notice. No blocking error popup by default. |
| R2-30 | Accent | A | Muted cyan/teal primary interactive accent; exact palette/contrast not approved. |
| R2-31 | Borders | C | Square on major panels; simple dividers and spacing inside. |
| R2-32 | Focus and selection | A | Selected-row subtle fill; focus marker and emphasized pane heading. Selection is not focus. |
| R2-33 | Symbols | A | Standard minimal Unicode, ASCII fallback; no Nerd Font dependency. |
| R3-34 | Minimum terminal size | A | Determine minimum through terminal testing; display a clear recovery message below usable size. No untested fixed minimum. |
| R3-35 | New Investigation first action | A | Open input selection with npm preselected. |
| R3-36 | Full-width finding inspection | A | Use a structured scrollable detail document with jump anchors. |
| R3-37 | Evidence return navigation | A | Breadcrumb/back stack restores exact selection, filter, focus and scroll. |
| R3-38 | Diff scrolling and data access | A | Synchronized side-by-side scrolling; horizontal scrolling for long lines; bounded content/range reads. |
| R3-39 | Finding sort tie-breaks | A | Apply deterministic tie-breakers with stable finding IDs; exact ordering fields remain to specify. |
| R3-40 | Local filtering | A | Filter focused list; retain query until explicitly cleared. |
| R3-41 | Command palette availability | A | Include supported actions only; explain temporarily unavailable actions. |
| R3-42 | Active-job exit | A | Ask about keep-running only when supported, or cancel; display actual action/outcome. No assumed detach. |
| R3-43 | Uncertainty labels | A | Use precise textual state with restrained symbol and explanation available. |
| R3-44 | Historical report and export | A | Persistent historical notice; inspect included/omitted contents before export. |
| R3-45 | Monitoring watch creation | A | Guided setup explicitly selecting release policy and establishing baseline. |
| R3-46 | UI state persistence | A | Use versioned local UI state keyed per report ID; provide a reset option. |
| R3-47 | Theme acceptance | A | Dark-first design tokens, contrast testing, terminal-palette and monochrome fallback. |
| R4-48 | Source tab architecture | A | Three compact subtabs—Source candidates, Provenance, Build—with independent status summaries. |
| R4-49 | Conflicting source claims | A | Concise conflict notice on Overview and Source; evidence details are inspected in Source. |
| R4-50 | Alternative source target | A | Place “New investigation with this target” beside a candidate; create a new investigation/report, never mutate the original. |
| R4-51 | Exact-target preflight | A | Dedicated review screen with exact artifact, source target, configuration and uncertainties before Start. |
| R4-52 | Evidence citation activation | A | Open the exact raw span when readable; otherwise explain the metadata-only state without inventing bytes. |
| R4-53 | Unavailable/failed counts | A | Show “Not evaluated” or “Unknown” when unsupported; do not present fabricated zeros or bars. |
| R4-54 | Empty Findings | A | Differentiate no findings recorded within the examined scope from evaluation unavailable. |
| R4-55 | Quit versus Back | B | `q` quits the current workspace/application; `Esc` is reserved for Back. Precise quit scope still needs a tested context rule. |
| R4-56 | AI controls at setup | A | Show AI choice/state and relevant limitations explicitly during setup. |
| R4-57 | Monitoring stale semantics | A | Use “Stale” only if configured schedule and recorded timestamps justify it; otherwise “Unknown” or “Not configured”. |
| R4-58 | Export packaging | A | Prefer canonical report with optional retained evidence and manifest, previewed before writing, where supported. |
| R4-59 | Long/untrusted paths | A | Elide in constrained views while retaining safely inspectable, copyable full value; render terminal controls inertly. |

## Screen and interaction requirements

Compact Home/Investigations/Monitoring navigation, then Overview/Findings/Files/Source/AI/Coverage within an observation. Source has Candidates/Provenance/Build subtabs. New → dedicated Review → explicit Start. Artifact identity, selected source basis and uncertainties remain visible. Preferred 140+/100–139/below-100 pane bands adapt to actual height/readability, recovery below usable size and useful non-TTY output.

Selection differs from focus; text input owns ordinary shortcuts. Esc returns through detail/evidence; q quits with safe active-job handling. Preserve observation, filter, stable selection, focus and scroll through evidence/navigation/reflow. UI state is separate from immutable reports. Offer only supported actions with explicit unavailable states.

Findings expose observation, significance, evidence, explanation strength, limitations and next action. Keep six outcomes, severity/confidence/priority/completeness and AI independent. Actual stage facts/denominators only; absent assessment is Unknown/Not evaluated, not zero/full bars. Reopen is historical.

Evidence opens exact retained ranges or precise metadata-only reasons. Keep raw records, byte labels, binary/missing/unsupported states and inert ANSI/OSC/bidi/Unicode handling. No guessed snippets, active package content, fake progress or invented cleanup acknowledgment. New source targets create new reports.

Near-black dark theme, restrained cyan/teal, square major panels, readable balanced density and standard glyphs with ASCII/palette/monochrome alternatives remain directions. Measure contrast/focus on real terminals; no Nerd Font requirement. Exact tokens remain provisional.

## Acceptance scenarios

| ID | Observable journey | Owning work |
|---|---|---|
| S01 | Exact npm/local → separate Review → explicit Start; immutable reviewed local bytes, honest unresolved remote identity | Phase 1 baseline; Phase 3 UX2 if resolved preflight is added |
| S02 | Source conflict → separate source/provenance/build facts → new target Review; old observation unchanged | Phase 1 baseline; Phase 3 changed workflow |
| S03 | Real finding → exact bytes/metadata reason → Esc restores selection/filter/focus/scroll | Phase 1 baseline; Phase 2 new rule parity |
| S04 | Failed/unavailable findings and omitted scope differ from examined-subset zero | Every changed renderer; Phase 1 baseline |
| S05 | Large/binary/unsafe data stays bounded/inert; tree/flat and responsive raw reading | Phase 3 interface acceptance |
| S06 | Historical/missing bytes remain honest; export preflight/outcome when implemented | Phase 1 compatibility; Phase 3 TUI export |
| S07 | Actual watch baseline/runner/check/analysis times and restart show truthful freshness | Phase 5; unavailable UI is not runtime acceptance |
| S08 | q/Esc/Ctrl+C, text/modal precedence and 3→2→1 resize preserve context/safe settlement | Phase 1 baseline; Phase 3 human review |
| S09 | Disabled/failed/rejected/abstained AI preserves deterministic facts | Phase 1 presentation; Phase 5 real inference |

Validate relevant changed journeys in actual terminals with source/environment identity and explicit failures/untested cases. Final review includes keyboard, narrow/short readability, evidence round-trip, inert text, contrast/palette/no-color/ASCII, state migration/reset and human accessibility. Fixture renders/screenshots/preference counts alone do not freeze the design.

The former full wireframes/blocker bundle remains in [documented Git history](../production-phase1/Document%20Disposition.md). It is retired guidance, not another active plan.
