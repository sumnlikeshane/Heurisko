# HEURISKO — TUI DESIGN CONTRACT

**Consolidated approval candidate:** `v1.0.0-rc.1`  
**Prepared:** 2026-10-31  
**Artifact type:** Self-contained Markdown contract and implementation handoff  
**Decision authority:** 59 user-confirmed design preferences (Rounds 1–4) and the supplied approved-Phase-02 experience brief  
**Approval status:** **CANDIDATE FOR REVIEW — NOT APPROVED, NOT FROZEN**  
**Implementation verification:** Not yet performed against the actual repository or in a running React/Ink prototype  
**Relationship to prior artifacts:** Consolidates the decision register v0.4.0, screen wireframe/state draft v0.3.0, and Round 4 blocker audit v0.2.0 without changing their decision status.

> **Important for the implementing agent:** This document is a *complete consolidation of the design work to date*, not evidence that the final contract has been accepted. Do not mark the TUI design approved, freeze unresolved details, invent runtime support, or modify governing repository contracts without the required review. A preference marked `CONFIRMED` is binding as a user-selected direction; example wireframes, exact colors/copy, internal API proposals and remaining open mechanics are not independently approved.

## Document map

1. [Authority, scope and status](#1-authority-scope-and-status)
2. [Core user experience](#2-core-user-experience)
3. [Information architecture and layout contract](#3-information-architecture-and-layout-contract)
4. [Screen requirements](#4-screen-requirements)
5. [Keyboard and navigation contract](#5-keyboard-and-navigation-contract)
6. [Semantics and truthful reporting](#6-semantics-and-truthful-reporting)
7. [Evidence, diff and safety contract](#7-evidence-diff-and-safety-contract)
8. [Visual system](#8-visual-system)
9. [Screen states and failure recovery](#9-screen-states-and-failure-recovery)
10. [Foundation interfaces and implementation prerequisites](#10-foundation-interfaces-and-implementation-prerequisites)
11. [Verification, acceptance and approval](#11-verification-acceptance-and-approval)
12. [Open decisions and honest limitations](#12-open-decisions-and-honest-limitations)
13. [Appendix A — 59 confirmed decisions](#appendix-a--59-confirmed-decisions)
14. [Appendix B — full wireframes and state proposals](#appendix-b--full-wireframes-and-state-proposals)
15. [Appendix C — complete blocker and scenario audit](#appendix-c--complete-blocker-and-scenario-audit)

---

## 1. Authority, scope and status

### 1.1 Source and precedence

The design is based on the attached Heurisko TUI brief and the user's explicit selections D01–D59. The brief describes the approved Phase 02 `v0.2.0` experience and existing G0 contract semantics. The real files at `docs/Approved/phases/HEURISKO_PHASE_02_CLI_TUI_INVESTIGATION_APPROVED_v0.2.0.md` and `packages/contracts/src/types.ts` were **referenced but not supplied** for this review; their exact fields, enums and API availability must be checked in the repository before implementation.

Precedence: **approved Phase 02 + governing G0 types** > **confirmed user design preferences** > **proposed wireframe/copy/component details**. Where a design collides with verified governing contracts, record the conflict and request an explicit revision; do not quietly rewrite established semantics.

### 1.2 Confirmed vs provisional

| Label | Meaning | Can an agent implement without further approval? |
|---|---|---|
| Governing requirement | Approved Phase 02 or G0 behavior as described in the brief; verify exact repository contract | Only after verifying source and feasibility |
| Confirmed preference | User selected R1-01–R4-59, with no amendments | Use as design direction; exact mechanics may still require acceptance |
| Proposed detail | Wireframe shapes, labels, UI component choices, sample keys, token values, example copy | Prototype and test, but do not claim user approval |
| Open / blocked | Contract field, runtime capability, behavioral detail or acceptance test not established | Investigate; record an explicit gap; never invent support |

The current count is **59 confirmed preferences**, **0 explicit approvals of the final TUI Design Contract**. This document is the version to review and potentially approve after verification.

### 1.3 Product boundary

Heurisko is a **keyboard-first investigation workspace** for comparing one exact published package artifact against evidence for a corresponding immutable source revision. A local archive comparison is supported with an explicitly selected source, but a chosen source target is not release provenance.

In-scope: exact npm package/version, local archive with explicit source target, investigation and progress, immutable saved reports, overview, files/diffs, findings/evidence, source/provenance/build, AI interpretation, coverage, selected-package monitoring, non-TTY output and terminal recovery. Do not present PyPI, lockfile audits, upgrade comparisons, hosted execution, SARIF, notifications or accounts as working features merely because a navigation slot could support them later.

## 2. Core user experience

**Primary user journey:** `Select exact artifact → Validate target → Review exact target and uncertainties → Investigate → Understand overview → Inspect finding → Inspect raw difference → Follow cited evidence → Return to the same position → Decide next action`.

The user must be able to answer: which bytes were examined; which source revision was chosen and on what basis; what changed; what is explained versus unresolved; which observations need review; what coverage is missing; and which raw evidence should be inspected next.

**Design principles:**

1. Evidence first; never reduce multi-dimensional facts into a single safety verdict.
2. Clean and minimal without hiding essential identity, uncertainty or limitations.
3. Visible selection is distinct from keyboard focus; keyboard control is predictable.
4. Progressive disclosure: concise overview → previews → deep evidence.
5. Stable navigation: return preserves IDs, filters, focus and scroll even after reflow.
6. Measured progress and coverage only; no manufactured ETA or percent.
7. Historical, partial and failure states are first-class experiences.
8. Untrusted package bytes, file paths, logs and AI text must render inertly in terminals.

## 3. Information architecture and layout contract

### 3.1 Global IA

`Home | Investigations | Monitoring` in a compact top navigation. Within an investigation, six compact tabs: `Overview | Findings | Files | Source | AI | Coverage`. Within Source, three compact subtabs: `Candidates | Provenance | Build`, each with an independent status summary. There are not nine top-level tabs.

Home features a prominent New Investigation action; below it are Recent Reports and Monitoring panels, while incomplete/failed work is surfaced rather than buried. New Investigation opens input-type selection with **npm preselected**; exact-target review is a **separate screen** before Start.

### 3.2 Responsive bands (confirmed choices, not tested layout constraints)

| Terminal width | Intended behavior |
|---|---|
| 140 columns and wider | Up to three context-dependent panes: selection/list, primary content, supporting evidence |
| 100–139 columns | Two panes: list and detail; supporting evidence opens separately |
| Below 100 columns | One focused view, breadcrumbs and exact Back behavior |
| Below tested usable height/width | Readable recovery/help text, not an inaccessible clipped application |
| Non-TTY | Linear scriptable/help output, with no dependence on interactive panes |

The **minimum usable terminal dimensions are not predeclared**: establish them by live tests. Pane ratios are contextual: diff content is wider in Files; structured detail has more space in Findings. The evidence pane is mainly for inspection-heavy screens; setup and Overview can use the full width.

### 3.3 Persistent context

During report inspection, a compact header must expose package/version, npm versus **LOCAL INPUT**, report identity and applicable report attributes. Expanded identity exposes artifact digest where recorded, source repository/full immutable commit/subdirectory, association basis, configuration and capture details. `Saved`, `Historical` and `Incomplete` can coexist. Historical notice persists and never suggests checks have refreshed merely from reopening.

## 4. Screen requirements

| Surface | Required user-visible content | Required transitions/behavior |
|---|---|---|
| Home | New investigation, recent reports, unfinished/failed jobs, monitoring status | Enter setup, reopen saved report, inspect job, navigate monitoring |
| New investigation | npm/scoped name/exact version/prerelease, or local path+repo+full commit+subdir; AI choice/state/limits | Validate fields; disclose registry/read failures; do not start directly from entry form |
| Exact-target review | Exact resolved artifact and source target; association basis; configuration; known uncertainties; AI status | Edit or Start; unknown identity shown as unknown; local target is not provenance |
| Live investigation | All ten stages and exact statuses; diagnostics; available partial outputs | Inspect live evidence; cancel safely; failures inline plus concise notice |
| Overview | Main established takeaway, exact artifact/source context, six independent outcomes, priority findings, coverage/unknowns, optional AI and next action | Direct links to findings, Source conflicts, files, omissions and limitations |
| Findings | Priority sorted list, separate severity/confidence/type filters, preview and stable ID | Enter structured full-width detail; follow evidence span; Esc returns exact context |
| Finding detail | Observation, significance, evidence, explanation strength, limitations, next action; independently severity/priority/confidence | Scrollable document and jump anchors; contextual AI distinct from established observation |
| Files/diffs | Expandable tree/flat list, statuses, paths, raw equality, explanation strength, transforms/residuals, related evidence | Preview on selection; full raw diff; synchronized wide side-by-side or narrower unified; manual toggle |
| Evidence detail | Stable ID, side, path/location, range, digest, method/verification, bytes state, limitations | Open exact raw range if readable, otherwise metadata-only explanation; no invented code |
| Source | Candidates, Provenance, Build as independent subtabs; conflicts/claims/verification/policy/results | Alternative candidate action starts **new investigation**; never mutates original report |
| AI | Explicit disabled/available/unavailable/failed/rejected/abstained; cited hypotheses/alternatives/uncertainty | AI failure does not hide deterministic analysis; cite source and model metadata if recorded |
| Coverage | Examined and omitted scope (files/bytes) with known denominators, stage limitations | Drill into skips/unsupported/failure; unknown not shown as 0 |
| Monitoring | Watches, runner state, release policy and baseline, pending/failed/completed work, fetch times | Guided add-watch; distinguish runner state, freshness, execution and result completeness |
| Saved/export | Identity, creation/capture timestamps, historical notice, absent bytes, schema failures | Preflight included/excluded content; canonical report + optional evidence/manifest only if supported; explicit write outcome |

### 4.1 Stage vocabulary

Stages: `resolve_artifact`, `acquire`, `source`, `provenance`, `inventory`, `compare`, `build`, `heuristics`, `ai`, `persist`. States: `not_started`, `running`, `complete`, `incomplete`, `skipped`, `failed`. These describe *stage execution*, not package trust. Do not invent global progress percentages or finish times. Cancellation request, acknowledgment and terminal outcome are separate when the engine supports them.

### 4.2 Six independent report outcomes

Display **artifact integrity**, **source association**, **provenance policy**, **correspondence**, **analysis completeness**, and **policy result** independently. Signature verification, policy acceptance, presence of changed files, severity and completeness are not interchangeable. Source conflicts receive concise notices in Overview and Source.

## 5. Keyboard and navigation contract

### 5.1 Confirmed behavior

| Input | Meaning |
|---|---|
| Arrow keys / `j`, `k` | Move within selected navigable list when focus is not in text entry |
| `Tab` / `Shift+Tab` | Move focus across panes/controls predictably |
| `Enter` | Inspect focused selection; detail is full-width and preserves return state |
| `Esc` | **Back** one navigation layer, or close the currently active detail/dialog according to focus rules; never acts as generic Quit |
| `q` | **Quit** the current workspace/application; never interpreted as Back. Exact scope-by-context still requires acceptance |
| `/` | Filter current focused list; query persists until explicitly cleared |
| `Ctrl+P` | Search *supported* actions/destinations; temporarily unavailable actions explain why |
| `?` | Context-specific keyboard help |
| Numeric jumps + next/previous chords | Both mechanisms required; final chord assignments remain open |
| `Ctrl+C` | Safely interrupt foreground activity per actual engine lifecycle; never assume cancellation success |

Text-input controls take precedence over global shortcuts. Any action must respect current focus, disabled state, job safety and platform terminal interception. `q`/`Esc`/`Ctrl+C` must be tested at Home, report root, nested evidence, dialogs, text inputs and live analysis before exact exit table is frozen.

### 5.2 Navigation-state restoration

At minimum preserve report ID, route, selected stable ID, focused pane, active filter, list/visible anchor and scroll offsets across detail → cited evidence → `Esc` → same finding. Preserve selection through terminal resizing and pane-count changes. Per-report UI state is versioned, stored locally and resettable **outside** the immutable investigation report. Schema, path and migrations remain to verify.

## 6. Semantics and truthful reporting

- Show **observation**, **significance**, **evidence**, **explanation strength**, **limitations** and **next action** for each important finding.
- Keep **severity**, **review priority**, **evidence confidence**, **explanation strength** and **analysis completeness** visibly separate.
- An added lifecycle script may be directly observed without its actor, motivation or origin being established.
- Generated-looking files are *candidates*, not necessarily explained transformations; raw residuals remain inspectable.
- A stage `complete` is not package `safe`; digest `matched` does not explain a source/distribution difference.
- Cryptographically valid provenance does not mean that the configured identity/trust policy accepts it.
- Known `0` within a proved examined subset is valid; unavailable analysis instead shows `Not evaluated` or `Unknown`, with no zero or fully filled bar.
- `No findings recorded within examined scope` is not the same as `Findings unavailable — stage not run`.
- Monitoring `Stale` requires actual schedule and timestamp evidence; stopped or failed runner alone is insufficient.
- AI output is **interpretation/hypothesis**, always clearly labeled, evidence-cited and able to abstain. Validation is not proof of correctness.
- `Historical` describes an offline/captured view, not a live registry or provenance refresh.
- Do not silently equate absent raw bytes, unsupported content, unretained content and omitted-from-export content.

## 7. Evidence, diff and safety contract

### 7.1 Evidence linking

Every displayed citation must resolve by a stable evidence ID to the recorded side (`artifact`, `source`, `external` as applicable), location and available line/byte range, with digest/method/verification where recorded. If readable raw content exists, open the **exact recorded raw range** via bounded reads. If not, show the remaining metadata and the exact documented unavailability reason. Do not fabricate a line snippet based on a hash, model output or nearby text. Broken/invalid IDs display an actionable error while preserving the origin context.

### 7.2 Diff semantics

Raw diffs are always reachable. Wide terminals default to synchronized side-by-side source/artifact display; narrower view defaults to unified diff, both user-toggleable when legible. Long lines scroll horizontally; large/binary/minified data uses bounded reads, safe fallbacks and explicit truncation labels. Any normalized/transformed view names the method, scope and unexplained residuals and never replaces the raw comparison. Artifact-only, source-only, missing-source, relocated and unsupported cases remain distinct where supported.

### 7.3 Terminal safety

Treat all external/package paths, file contents, registry strings, logs and model text as **untrusted**. Escape/sanitize ANSI/OSC/control sequences and bidirectional display hazards; prevent them from changing the cursor, terminal title, hyperlink state or output boundaries. Visually shorten long paths but expose the safely rendered complete value and an explicit copy action; copying exact recorded data must follow a defined safe policy and never execute content. Test pathological Unicode widths, huge unbroken tokens, terminal resizes, no-color and ASCII fallback. Avoid uncontrolled memory use for large file rendering.

## 8. Visual system

**Confirmed direction:** btop's organized terminal layout and restrained status accents; Lazygit's effective navigation; Yazi's context preview; Posting's minimal readability. Dark-first near-black theme, muted cyan/teal primary interaction accent, balanced information density, square outlines on major panels and uncomplicated inner separators. Selected row uses a subtle fill; focused pane also has a separate text/symbol cue so selection and focus are not conflated. Standard Unicode glyphs with ASCII fallback; **no Nerd Font dependency**.

Color semantics must be designed and tested before theme tokens are frozen; a green success icon never means universal security assurance. Provide usable terminal-adaptive/palette/monochrome fallback and acceptable contrast, including high-uncertainty and error states. Compact progress/coverage bars and microcharts are allowed **only** for actual measured values, not decorative invented metrics. Prefer stable layouts and restrained animation.

Exact hex colors, spacing dimensions, border glyphs, focus markers and contrast thresholds are **proposed details**, not user-approved tokens.

## 9. Screen states and failure recovery

Every required surface needs **loading, empty, populated, partial and error** cases. Show where errors occurred, which evidence remains available, and how to inspect or retry only if retry exists. Must cover invalid scoped package/version, missing npm release, offline registry, unreadable local archive, unsupported schema, competing source candidates, missing provenance, failed build reproduction, canceled/incomplete stages, skipped bytes, absent retained content, AI failures/rejections/abstentions, monitoring restart/staleness and write/export failures.

No visually successful empty state may disguise analysis not performed. Reopening a report is replay, not refresh. A job may be `complete` while the report remains `incomplete`—present both dimensions.

## 10. Foundation interfaces and implementation prerequisites

The UI depends on the verified availability or explicit definition of:

1. A validated immutable G0 report with exact artifact/source identity, independent outcomes and scope accounting.
2. Typed ordered progress events, stage-level counts/diagnostics, partial result IDs, cancellation handshake and actual job lifecycle.
3. Stable report, finding, change and evidence IDs with cross-links.
4. Bounded raw-span evidence and diff reads, including distinct retained/unavailable/not-exported/unsupported states.
5. Source candidate and verification records that separate publisher assertions, corroboration, cryptography and policy.
6. Monitoring watch policies, runner/retry/job state, baseline and attempt/success/analysis timestamps.
7. Explicit AI provider/runtime availability, consent/config, states, citeable interpretations and limitations.
8. Saved report schema validation/migration behavior and canonical export/preflight manifest semantics.
9. A local, versioned and resettable report-scoped UI-state store independent of the report.
10. Safe terminal text rendering, fallback glyphs, measured widths and guarded copy operations.

**Do not assume interfaces or endpoints are implemented.** First inspect the real repository. Where the G0 contract lacks a field or runtime seam, record the exact missing need, propose a shared contract change, and obtain the normal engineering approval before writing UI logic that depends on it.

## 11. Verification, acceptance and approval

The acceptance gate must include a real React + TypeScript + Ink prototype in at least the wide (>=140), medium (100–139) and narrow (<100) bands, plus short-height and non-TTY behavior. Use clearly labeled synthetic fixtures for evidence scenarios, then verify with actual analyzer fixtures once they exist.

Minimum acceptance scenarios:

| ID | Scenario | Pass condition |
|---|---|---|
| S01 | Exact npm/local setup and preflight | Separate review, exact identity/AI/uncertainty; no unreviewed Start |
| S02 | Conflicting source candidates | Conflict notice, three Source subtabs; alternative target creates a **new** investigation |
| S03 | Lifecycle command citation | Finding → stable evidence ID → exact raw span or metadata-only; `Esc` restores precise origin |
| S04 | Failed heuristics / missing scope | `Unknown`/`Not evaluated`, never misleading zero or full bar |
| S05 | Large/binary/unsafe file/path | Bounded reads, safe display/copy, tree↔flat, responsive diff |
| S06 | Historical incomplete report/export | Persistent historical notice, bytes availability, export contents preflight and observed outcome |
| S07 | Monitor freshness/restart | Stale only with schedule and timestamps; separate job/report outcomes |
| S08 | `q`/`Esc`/`Ctrl+C` and reflow | Accurate quit/back/interrupt, no lost work, selection preserved from 3→2→1 panes |
| S09 | AI disabled/abstained/failed | Deterministic evidence remains accessible; no AI claim masquerades as verified fact |

Also test six outcomes with conflicting combinations, Unicode/ANSI injection, no-color, focus visibility, keyboard-only navigation, failed/corrupt UI state store and malformed/unsupported report versions.

Approval may occur **only when the user explicitly approves a named contract version**. Until then, this document stays an approval candidate. Any failed required test or unsatisfied P0 blocker must be logged rather than marked complete.

## 12. Open decisions and honest limitations

**Unverified blockers (P0):** actual Phase 02 and G0 types; progress/cancel contract; stable evidence-range resolver; outcome/coverage-denominator mapping; terminal injection safety. **Further blockers (P1):** precise quit target, numeric and section-navigation chords, input/short-terminal precedence, versioned UI store, monitoring baseline/time policy, AI and export semantics, real Ink responsive/focus testing. See Appendix C for 13 individually numbered blockers and proofs required.

**Remaining user-facing acceptance choices:** (1) from a report root, whether `q` returns to Home or quits the process; (2) exact number-key and next/previous shortcuts; (3) tested unusably-small-terminal fallback; (4) copy/write/destructive confirmation behavior. These should be decided using example interactions after implementation feasibility is known, not silently guessed.

**Approval statement:** 59 Rounds 1–4 preference selections are confirmed. No final TUI design contract has been approved. Use this file as the **single consolidated candidate** for agent handoff and subsequent formal approval.

---

## Appendix A — 59 confirmed decisions

The following is the exact v0.4.0 decision record incorporated for completeness. Its approval caveats still apply.

# Heurisko — TUI Design Decision Register

**Version:** 0.4.0  
**Date:** 2026-10-31  
**Status:** Working design register — Round 1 (14), Round 2 (19), Round 3 (14) and Round 4 (12) preferences explicitly confirmed; complete TUI Design Contract NOT yet approved  
**Source:** User's Round 1–4 selections and supplied Heurisko TUI brief; the actual repository governing and type files were not available in the source bundle.
**Supersedes:** `HEURISKO_TUI_DESIGN_DECISION_REGISTER_v0.3.0.md` (preserved separately).
**Decision count:** 59 user-confirmed design preferences; **0** full-TUI-contract approvals.
**Companion draft:** `HEURISKO_TUI_SCREEN_WIREFRAMES_AND_STATES_DRAFT_v0.3.0.md` (reconciled proposal; not approved).

## Governance and interpretation

- The 59 entries in **Rounds 1–4** are **user-confirmed design preferences**. They guide design choices, but do not themselves freeze exact layouts, key bindings, field labels, responsive breakpoints, component APIs, or implementation.
- The approved Phase 02 v0.2.0 requirements and existing report/contract semantics remain governing constraints. Do not reinterpret a design preference as permission to collapse severity, review priority, confidence, explanation strength, completeness, provenance verification, and policy acceptance into a single verdict.
- Round 5 and later specifics are **open** until explicitly selected. Any suggested defaults, illustrative screen wireframes, state copy, or interaction mechanics are proposals, not approvals.
- Maintain a clear distinction between tested behavior, planned behavior, and illustrative wireframes.

## Design references and role

- **btop:** structured terminal-native dashboards, restrained accents, thin borders, high-information density.
- **Lazygit:** efficient keyboard navigation, contextual actions, file/diff inspection.
- **Yazi:** file exploration and contextual preview model.
- **Posting:** readable, modern, approachable visual polish.

## Round 1 — Confirmed preferences

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

**Additional Round 1 notes:** None.

## Existing non-negotiable product boundaries (from brief)

- Exact published artifact and immutable source comparison target remain visible and distinguishable; local archive comparison is not proof of release provenance.
- The core journey is artifact selection → investigation → overview → finding → diff → evidence → next action.
- Evidence ID, range, method, content availability, provenance, and limitations must remain inspectable where supported.
- Outcome categories and states remain separate; `complete` never means `safe`.
- Findings separate observation, significance, evidence, explanation strength, limitations, and next action.
- AI hypotheses are visibly non-authoritative and evidence-cited; abstention/failure cannot suppress deterministic evidence.
- Partial, failed, historical, skipped, unsupported, missing-content, and non-TTY experiences must be designed deliberately.
- The interface is keyboard-only operable, with text entry precedence and focus/selection/return consistency.
- Npm exact-version investigations, explicit local archive source targets, saved reports, monitoring, and truthful progress are in approved scope.

## Round 2 — Confirmed preferences (2026-10-31)

The user explicitly selected all options R2-15 through R2-33, with **no amendments**. These are confirmed directions; verification in real terminal layouts and further interface-state decisions remain pending.

| ID | Area | Selection | Confirmed direction |
|---|---|---|---|
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

**Round 2 amendments:** None. **Status:** Confirmed user selections; no final contract freeze.

## Round 3 — Confirmed preferences (2026-10-31)

The user explicitly selected **A** for each R3-34 through R3-47, with **no amendments**, and instructed that the final TUI contract must **not** be frozen. These are design preferences, not results of accessibility tests or permission to invent engineering APIs.

| ID | Area | Selection | Confirmed direction |
|---|---|---|---|
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

**Round 3 amendments:** None. **Confirmation total:** 14 + 19 + 14 = **47** design preferences; **0** full-contract approvals.

## Consequences for the proposed screen designs

- **Home/New Investigation:** New opens the input-type selector with npm preselected, then proceeds to validation and explicit exact-target review.
- **Findings/Evidence:** Full-width scrollable finding details need jump anchors, and nested evidence links need an exact-position back stack. The original finding/filter/focus/scroll may not be reset on return.
- **Files:** Wide raw diffs default side-by-side; scroll in synchronized positions, handle long lines horizontally, and request bounded ranges rather than unbounded file loads. Narrow layout defaults unified (R1-09).
- **Focus and commands:** `/` retains its focused-list filter until cleared; Ctrl+P lists supported actions, explaining temporary unavailability; textual inputs suspend shortcut interpretation.
- **Live progress:** Exiting must reflect actual job lifecycle support. `keep running` is permitted only if detached/persistent execution is real, and cancellation requested/acknowledged/completed are not conflated.
- **Saved/history/export:** Historical state remains persistently visible and export requires an accurate included/omitted-content preview.
- **Monitoring:** Watch setup must explicitly choose a release policy and establish the baseline; runner state and freshness timestamps remain distinct.
- **Visuals/accessibility:** Use precise textual status labels with optional restrained symbols; test contrast, terminal palette and monochrome fallbacks before freezing exact tokens.

## Round 4 — Confirmed preferences (2026-10-31)

The user explicitly selected R4-48–R4-59, with **no amendments**, and explicitly prohibited final-contract approval without a later named-version acceptance. R4-55 selects **B**; all other Round 4 selections are **A**. The choices below are confirmed preferences, **not validated implementation behavior**.

| ID | Area | Selection | Confirmed direction |
|---|---|---|---|
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

**Round 4 amendments:** None. **Confirmation total:** 14 + 19 + 14 + 12 = **59** design preferences; **0** full-contract approvals.

## Consequences for screen design — Round 4 reconciliation

1. **Source tab:** present three distinct compact subtabs—source candidates, provenance verification/policy, and build evidence—with separate statuses (R4-48). Independently label cryptographic verification, expected identity/trust-policy acceptance, source association and reproduced-build result; never merge them into one green "verified" judgment.
2. **Conflicts / source target:** show a concise nonblocking source conflict on Overview and Source, with underlying candidate evidence in Source (R4-49). A candidate has an explicitly labeled **New investigation with this target** action (R4-50) that goes through exact-target review and creates a distinct report; selecting a candidate never updates an existing immutable report.
3. **Setup preflight:** after input validation/resolution, navigate to a **dedicated target-review screen** (R4-51). Show package/archive identity, exact version/digest when recorded, source repository/immutable commit/subdir and basis, AI choice/config, uncertainty and limitations. The Start action must not imply source provenance is established from user selection.
4. **Evidence:** activating a cited evidence ID opens the exact retained raw range when possible; otherwise a metadata-only detail clearly states why raw bytes cannot be shown (R4-52). Back-stack fidelity from R3-37 remains required.
5. **Counts and empty states:** `Unknown`/`Not evaluated` replace numerically false zeros for unavailable scope, while genuinely observed numeric counts for a known processed subset remain displayable with their denominators (R4-53). An empty Findings view must distinguish no recorded findings **within examined scope** from findings evaluation being unavailable (R4-54). Do not equate zero findings with safety.
6. **Keyboard:** `Esc` means Back/close detail; outside text input `q` means quit/leave the active workspace or app, never navigate one level of detail (R4-55). The precise Home/report/workspace quit target remains an interaction detail to specify and test, especially with active jobs.
7. **AI:** AI selection/state and relevant limitations must be visible before analysis begins (R4-56); AI output remains labeled interpretation, never proof.
8. **Monitoring:** `Stale` requires actual configured schedule plus timestamps supporting that assessment; runner `Stopped` is distinct from freshness (R4-57).
9. **Export:** where implemented, prefer canonical report plus optional retained evidence/manifest, with explicit included/omitted-content preflight before any write (R4-58). Concrete format and error/collision handling are unverified.
10. **Long paths:** truncate/elide the **display**, not the underlying recorded value; expose full safe inspection/copy, with untrusted control sequences escaped (R4-59).

## Remaining contract and implementation blockers — NOT answered by preferences

| Priority | Blocker | Evidence / resolution required | Status |
|---|---|---|---|
| P0 | Governing Phase 02 and shared types unavailable in supplied bundle | Read actual approved Phase 02 file and `packages/contracts/src/types.ts`; build type-to-screen/status/value traceability. | Unverified external source |
| P0 | Stage progress and cancellation lifecycle | Typed 10-stage event stream with six stage states, reliable partial-output references, cancel request/acknowledge/finish states; verify if detach/retry exists. | Foundation contract open |
| P0 | Stable evidence/finding/file identity and bounded raw reads | Evidence IDs, side/path/range/digest/method, retained/missing/not-exported semantics, paging/range errors, source/archive context. | Foundation contract open |
| P0 | Independent outcome and coverage semantics | Six report outcomes, how status types map, proper denominators, partial examination, overlaps, failed stage count policy, findings vs file-count distinctions. | Contract audit open |
| P0 | Safe untrusted terminal rendering and copying | Escape ANSI/OSC/control characters in paths, file excerpts, logs and AI text; test exact full-path copy without unintended terminal execution. | Security implementation/test open |
| P1 | Precise keyboard chords and quit targets | Resolve key precedence for `q` vs input, Esc vs editing modal, Ctrl+C, number shortcuts, next/previous tabs, Tab/focus and search; active-job confirmation. | Interaction detail open |
| P1 | Source candidate and provenance/build verification records | Evidence linking/corroboration, full commit/subdir, conflict provenance, independent crypto/policy/build result labels. | Field mapping + screen validation open |
| P1 | Export format/manifest/path behavior | Check canonical serialization support, optional content availability, collision/permission/atomic-write behavior; no exported-byte claims before success. | Feature contract open |
| P1 | Monitoring policy, schedule and timestamp model | Verify release-policy choices, last attempt/success/completed-analysis, baseline/retry/restart and defensible staleness computation. | Feature contract open |
| P1 | AI state and runtime semantics | Verify six AI states, opt-in/default/config terms, metadata, validation vs truth, abstention and optional reanalysis. | Feature contract open |
| P1 | UI-state durability/privacy | Versioned report-scoped schema/path, migrated/corrupt/unwritable state behavior, reset, no mutation of immutable report. | Local design/implementation open |
| P1 | Terminal acceptance and accessibility | Render/test at selected width bands and short heights, measure usable minimum, theme contrast/palette/no-color/ASCII, truncation/resize/back-stack. | Prototype evidence missing |

**Priority meanings:** P0 blocks a truthful/secure or source-conformant contract; P1 blocks full design freeze or robust acceptance, but does not undo a user's selected preference. These priority labels are for design work, not package finding severity.

## Version history and approval gate

- **v0.1.0:** R1-01–R1-14 confirmed (14).
- **v0.2.0:** R2-15–R2-33 confirmed (+19 = 33).
- **v0.3.0:** R3-34–R3-47 confirmed (+14 = 47).
- **v0.4.0:** R4-48–R4-59 confirmed (+12 = **59**); wireframe reconciliation and current dependency register; **NO final TUI contract approval**.
- Source versions remain separate for historical decision traceability. Exact colors, labels derived from uninspected enums, minimum terminal dimensions, and runtime capabilities remain unfrozen.
- **Freeze requires:** review actual governing/type contracts; test screen states and terminal widths; prove link-to-range-to-exact-return behavior; test command precedence, cancellation and unsafe input handling; review export/monitor/AI semantics; obtain user **explicit approval** for a named final design-contract version.

## Next review

Use the companion **Screen Wireframes & States Draft v0.3.0** and **Round 4 Reconciliation & Remaining Blockers v0.2.0** for scenario-based acceptance. Do not ask users to decide what unverified backend APIs happen to support: those are engineering checks, not design preferences. Unresolved copy, shortcuts, panel measurements and implementation behavior should be labeled `PROPOSED`/`BLOCKED`, never silently promoted to `CONFIRMED`.


---

## Appendix B — Full wireframes and state proposals

# Heurisko — TUI Screen Wireframes, States & Interaction Questions

**Draft:** v0.3.0  
**Date:** 2026-10-31  
**Status:** PROPOSED DESIGN EXPLORATION — **NOT APPROVED OR IMPLEMENTATION-READY**  
**Basis:** Heurisko TUI brief plus 59 confirmed Round 1–4 preferences in `HEURISKO_TUI_DESIGN_DECISION_REGISTER_v0.4.0.md`.  
**Authority:** The approved Phase 02 v0.2.0 experience and existing shared report contracts take precedence. If this draft contradicts either, the draft must change.  
**Important limitation:** `packages/contracts/src/types.ts` and the approved Phase 02 file were referenced by a local absolute path in the brief but not provided as repository artifacts. This pack **does not invent exact G0 property names or implementation APIs**.

## Revision notes — Round 3 and Round 4 reconciliation (CONFIRMED PREFERENCES)

This v0.3.0 draft carries forward previous screens and reconciles them with R3-34–R3-47 and R4-48–R4-59. It remains **unapproved**, including illustrative data, status copy, exact key chords, component APIs, layouts and reported engineering capabilities.

- **R3-34:** Minimum terminal width/height is *not* 80×24 by fiat. Find the usable limit in terminal tests; show recoverable text below it.
- **R3-35:** Home → New Investigation opens npm-preselected input selection.
- **R3-36–37:** Finding detail becomes a scrollable document with jump anchors; nested evidence links push a back-stack location that restores selected ID, focus, filter and scroll.
- **R3-38:** Wide side-by-side raw diffs scroll synchronously; long lines scroll horizontally; all reads are bounded.
- **R3-39–41:** Finding ties resolve deterministically using stable IDs; local `/` filters persist until cleared; Ctrl+P offers supported actions, labeling temporarily unavailable ones.
- **R3-42:** Exiting active analysis does not imply detached execution or successful cancellation. Show only actually supported options and their outcomes.
- **R3-43–44:** Truthful textual uncertainty states; persistent historical replay notice and export-content preflight.
- **R3-45–47:** Monitoring watch wizard explicitly selects policy and baseline; report UI state is versioned, local, report-scoped, resettable; theme requires contrast/palette/monochrome tests.

**Round 4 confirmed changes:** R4-48 adds three Source subtabs; R4-49 displays source conflict on Overview and Source; R4-50 adds new-investigation-from-candidate; R4-51 makes exact-target review its own screen; R4-52 resolves citation to raw span if readable, otherwise metadata-only detail; R4-53–54 prohibit misleading zero counts and empty findings; R4-55 selects `q` quit and `Esc` back; R4-56 requires visible AI choice/limits in setup; R4-57 gates `Stale` on schedule/timestamps; R4-58 prefers canonical report + optional evidence/manifest export; R4-59 requires safe long-path inspection/copy.

**Important:** Round 4 confirms directions, not exact typography, runtime APIs, source field names, colors, source-list ordering or backend features. Descriptive wireframe labels remain illustrative until traced to the governing contracts.

**Semantic guardrail:** These selections do not supply missing evidence-read, cancellation, retry, persistence or monitoring APIs. All such behaviors are contingent on verified foundation capability.

## Reading this draft

- **CONFIRMED** means one of the user's Round 1–4 selections, or a stated existing brief/Phase 02 requirement. A confirmed *preference* is not a fully frozen component contract.
- **PROPOSED** means a screen arrangement, sample copy, behavior, default, token, or state treatment offered for review.
- **OPEN** means an explicit design choice remains to be made. Any `?` in a wireframe marks a proposed or unavailable value.
- All package names, findings, timestamps, counts, IDs, paths, snippets and source examples below are **synthetic illustrative data**, not real investigations or guarantees about the analyzer.
- The ASCII wireframes show hierarchy, not exact terminal-width fidelity. The real Ink implementation must be tested against truncation, resizing, assistive/color modes, and key precedence.

## 1. Confirmed IA and global screen map

```text
LAUNCH HEURISKO
  ├── Home
  │    ├── New Investigation (npm | local archive)
  │    │     ├── Resolve & validate target
  │    │     ├── Review exact target & config
  │    │     └── Live Investigation
  │    ├── Recent / Incomplete reports ──> Saved report / Overview
  │    └── Monitoring summary ─────────> Monitoring
  ├── Investigations ──────────────────> Report list ─> Investigation
  │                                            ├── Overview
  │                                            ├── Findings ─> Finding detail ─> Cited evidence
  │                                            ├── Files ────> File/diff detail ─> Cited evidence
  │                                            ├── Source ───> Candidates / Provenance / Build
  │                                            ├── AI ───────> Interpretation / Citations
  │                                            └── Coverage ─> Omission / Stage detail
  └── Monitoring ──────────────────────> Watch list ─> Job / Report

GLOBAL: ? help | Ctrl+P actions/destinations | quit/interrupt semantics TBD
```

**CONFIRMED:** compact global top navigation; six investigation tabs `Overview / Findings / Files / Source / AI / Coverage`; no unapproved future features shown as working. The `Source` tab must retain source identity, provenance policy and build evidence rather than hiding or merging these concepts.

### Proposed persistent shell

```text
┌ HEURISKO ─ Home  Investigations  Monitoring ──────────────────────────────────────┐
│ npm: @sample/lib@2.4.1   Report: rpt-...  SAVED · HISTORICAL · INCOMPLETE    │
│ Overview  Findings  Files  Source  AI  Coverage                                │
├───────────────────────────────────────────────────────────────────────────────┤
│ SECTION CONTENT — single, dual, or triple pane based on view and width         │
├───────────────────────────────────────────────────────────────────────────────┤
│ Focus: files  Tab pane  / filter  Enter inspect  Ctrl+P actions  ? help        │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **PROPOSED:** second header row is replaced/suppressed on Home, New Investigation and Monitoring; report identity may take a single compact row if line pressure demands.
- **CONFIRMED:** compact artifact/version, input type, report state and expandable identity detail. Any locally supplied archive must stay distinctly labeled `LOCAL INPUT`; it must not inherit an npm-provenance claim.
- **PROPOSED:** history and incomplete notices occupy a compact persistent banner immediately below tab row; neither can be dismissed in a way that makes a saved report look live. `SAVED`, `HISTORICAL`, `INCOMPLETE` may be **simultaneous attributes**, not a mutually exclusive one-value status enum. Exact fields await G0 mapping.
- **OPEN:** which parts of the header survive very narrow terminals; minimum usable height/width to be established through terminal tests (R3-34).

### Width behavior

| Band | User-selected preference | Draft behavior | Not yet settled |
|---|---|---|---|
| `>=140` columns | Three panes | Navigation/list, content, related evidence when appropriate; overview/setup may stay full-width | Exact ratios/minimum pane widths, horizontal scroll policy |
| `100–139` columns | Two panes | List and content; evidence opened as focused detail | Whether toggleable side-by-side diff can fit in some medium configurations |
| `<100` columns | One pane | Content-focused flow, breadcrumbs and back stack | Minimum usable width/height must be tested; provide clear recovery message below the measured usable minimum (R3-34); truncation policy still open |
| Non-TTY | Useful linear/help behavior required by brief | Structured textual summary, no interactive animation, actionable CLI path | Precise options and parity with CLI commands |

**CONFIRMED:** side-by-side raw diff defaults on wide terminals, unified raw diff on narrower terminals, with a user toggle. A manual mode that cannot render legibly must explain the limitation, not silently corrupt the view.

## 2. Wireframe — Home (proposed)

```text
┌ HEURISKO ─ [Home]  Investigations  Monitoring ─────────────────────────────────┐
│ Investigate what was published, and see the evidence behind every claim.       │
├───────────────────────────────────────────────────────────────────────────────┤
│ > NEW INVESTIGATION                                                           │
│   npm package / exact version        Local archive / explicit source target    │
├──────────────────────────────────────────┬────────────────────────────────────┤
│ RECENT INVESTIGATIONS                    │ MONITORING                         │
│ > @sample/lib@2.4.1 [Incomplete]         │ Runner: stopped                    │
│   other@0.9.8     [Historical]           │ Watches: 3   Pending: 2           │
│   …                                      │ Last successful fetch: (recorded)  │
├──────────────────────────────────────────┴────────────────────────────────────┤
│ UNFINISHED WORK: 1 job   [Inspect failure]                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│ ↑↓ Select  Enter Open  / Filter recent  Ctrl+P Actions  ? Help                │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED:** new investigation prominent, recent and monitoring two lower panels, incomplete/failed jobs visible.
- **PROPOSED:** startup selection rests on New Investigation; recent-report row shows `LIVE`, `SAVED`, `HISTORICAL`, `INCOMPLETE` as independent applicable annotations instead of one universal health badge.
- **PROPOSED:** monitor summary displays last attempt/success separately when appropriate, no ambiguous `up to date` assertion.
- **CONFIRMED R3-35:** selecting New Investigation opens input-type selection with npm preselected. **OPEN:** recent list length, resume-last placement, and exact form action sequencing.

## 3. Wireframe — New Investigation and dedicated exact-target review (proposed screens; preflight required by R4-51)

**Step 1 — npm-preselected input selector and explicit AI state**

```text
┌ HEURISKO · New Investigation · STEP 1 INPUT ────────────────────────────────────┐
│ Type: [npm]  Local archive                                                     │
│ Package: [@sample/lib                           ]  Version: [2.4.1      ]     │
│ Pre-releases: show/hide    Source override: none / specified                  │
│ AI: [disabled / enabled if configured]  Limitations: [inspect]                │
│ Validation: npm target exists; publication/source binding not yet established │
│ [Resolve target]     Esc Back     ? Help                                      │
└───────────────────────────────────────────────────────────────────────────────┘

LOCAL ARCHIVE INPUT VARIANT:
│ Archive path: [path/to/archive.tgz]                                           │
│ Source repository: [url]   Full immutable commit: [sha]                       │
│ Package subdirectory: [path]                                                  │
│ LOCAL INPUT — chosen source is a comparison target, NOT verified provenance.  │
```

**Step 2 — dedicated exact-target preflight. There is no Start button on the entry form.**

```text
┌ HEURISKO · New Investigation · STEP 2 REVIEW EXACT TARGET ──────────────────────┐
│ INPUT             npm  @sample/lib  2.4.1 (resolved exact version)             │
│ ARTIFACT          recorded artifact identity / digest if known               │
│ SOURCE TARGET     repository, full immutable commit, subdirectory            │
│ ASSOCIATION BASIS recorded assertion / corroboration / user-supplied target │
│ UNCERTAINTIES     publication link unknown, missing records, etc.             │
│ CONFIG            selected analysis policy and resolved parameters            │
│ AI                explicitly Enabled/Disabled/Unavailable + stated limits     │
│ NOTE              source selection is not proof of published origin           │
├───────────────────────────────────────────────────────────────────────────────┤
│ [Back to edit]                 [Start investigation]                           │
│ No unverified artifact/source claim may be presented as established.          │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED R3-35/R4-51/R4-56:** npm preselected; dedicated target-review screen before starting; AI selection/state and limitations visible. Exact artifact/source/config details and unresolved questions disclosed. Any field not yet resolved is marked *Unknown* instead of guessed.
- **CONFIRMED requirement:** npm scoped names, exact version resolution and prereleases; local path, repo, full immutable commit and subdirectory; local comparison does not establish provenance.
- **PROPOSED:** a two-step form with explicit Edit/Start actions; the field order, per-field validation and how config choices are sourced still need contract/testing decisions.
- **States:** blank, validating, invalid/npm registry unavailable, unresolved source with transparent limitation, preflight review with recorded uncertainties, start failure. No partial report assumed when input validation fails.
- **BLOCKED:** exact resolution metadata fields, source override semantics, AI consent/config/runtimes from governing contracts.

## 4. Wireframe — Live Investigation (proposed)

```text
┌ HEURISKO · npm @sample/lib@2.4.1 · LIVE ───────────────────────────────────────┐
│ Stage execution is not a security verdict. Partial evidence may be usable.    │
├─────────────────────────┬─────────────────────────────────────────────────────┤
│ STAGES                  │ LIVE DETAILS / AVAILABLE EVIDENCE                   │
│  ✓ resolve_artifact     │ Selected: compare                                   │
│  ✓ acquire              │ Comparing captured artifact to chosen source       │
│  ✓ source               │ Files examined: [observed count, if available]     │
│  ! provenance incomplete│                                                         │
│  ✓ inventory            │ AVAILABLE NOW                                      │
│ >… compare running      │ - Observed file inventory                           │
│  · build not_started    │ - [Finding placeholder if actually emitted]        │
│  · heuristics           │                                                     │
│  · ai                   │ PROVENANCE NOTE: identity cannot yet be established│
│  · persist              │ [Inspect stage limitations]                        │
├─────────────────────────┴─────────────────────────────────────────────────────┤
│ Stage 4 incomplete · recorded reason available · not equivalent to failure.  │
│ Enter stage  D Diagnostics  Esc leave?  Ctrl+C Interrupt  ? Help               │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Exact stage set required by brief:** `resolve_artifact`, `acquire`, `source`, `provenance`, `inventory`, `compare`, `build`, `heuristics`, `ai`, `persist`.

**Stage-state semantics:** `not_started`, `running`, `complete`, `incomplete`, `skipped`, `failed`. These are operation states; never assign a generic `safe/unsafe` implication. Example glyphs here are proposals with textual labels mandatory when accessibility requires it.

- **CONFIRMED:** stage list left, diagnostics/partial findings right when space permits; measured counts only, no invented percent/ETA; persistent inline stage failure plus concise summary notice.
- **PROPOSED:** stage row selected through j/k, Enter displays details; partial outputs are navigable if contract supplies stable references; cancellation requested/acknowledged/completed are distinct informational states.
- **CONFIRMED R3-42:** active-job exit explicitly offers keep-running only if supported, or cancellation, with observed outcome; do not imply detach. **OPEN FOUNDATION:** progress events, job persistence, retry support and cancellation handshake.

## 5. Wireframe — Investigation Overview (proposed)

```text
┌ HEURISKO · npm @sample/lib@2.4.1 · SAVED · rpt-… ─────────────────────────────┐
│ [Overview] Findings Files Source AI Coverage                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│ MAIN ESTABLISHED TAKEAWAY                                                     │
│ Differences were observed. A lifecycle-command change needs manual review.
│ SOURCE CONFLICT (if recorded): candidates disagree. [Inspect Source]          │   │
│ Source comparison: commit abcdef… (full SHA in Identity). Basis: recorded.    │
├───────────────────────────────────────────────────────────────────────────────┤
│ INDEPENDENT OUTCOMES (six; NOT one combined risk score)                       │
│ Artifact integrity:     Matched recorded expected digest                      │
│ Source association:     Candidate supported; release link not established    │
│ Provenance policy:      Cryptographic result ≠ policy acceptance             │
│ Correspondence:         Residual change remains unexplained                  │
│ Analysis completeness:  Partial — bytes skipped                              │
│ Policy result:          Not evaluated / according to stored policy           │
├─────────────────────────────────────────────┬─────────────────────────────────┤
│ PRIORITY FINDINGS                           │ COVERAGE & UNKNOWNS             │
│ > Lifecycle script added   [High review]    │ Analyzed: observed files/bytes │
│   Generated output candidate                │ Skipped: recorded omissions    │
│   …                                         │ Unknown source contents …      │
├─────────────────────────────────────────────┴─────────────────────────────────┤
│ AI: hypothesis available / disabled / failed (clearly labeled)                │
│ NEXT: Inspect lifecycle change  | View raw diff  | Open omissions             │
├───────────────────────────────────────────────────────────────────────────────┤
│ Enter Inspect  / Filter focus area  ? Help                                    │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED:** established takeaway first, exact identity context, all six outcome dimensions independently, then priority findings, coverage/unknowns, AI availability and evidence-backed next actions.
- **PROPOSED:** outcomes are two-line compact descriptions, not six traffic-light chips; no green `secure` banner.
- **CONFIRMED R4-49/R4-53/R4-54:** show a concise source-conflict notice when recorded; only observed counts with known scope/denominators may be numeric. A failed or unavailable finding stage reports `Not evaluated`/`Unknown`; Findings cannot claim `0` for unexamined work. `No findings recorded within [examined scope]` is distinct from `Findings unavailable — stage did not run`. Exact copy remains proposed.

## 6. Wireframe — Findings browser and full inspection (proposed)

```text
WIDE BROWSER (>=140 columns)
┌ HEURISKO · report identity · SAVED ─ Findings ─────────────────────────────────┐
│ Priority: All ▼  Severity: All ▼  Confidence: All ▼  Type: All ▼  / filter     │
├─────────────────────┬────────────────────────────────┬────────────────────────┤
│ FINDINGS            │ SELECTED OBSERVATION           │ RELATED EVIDENCE       │
│ > Lifecycle command │ Added package lifecycle script │ EV-001 artifact …      │
│   Generated bundle  │ Review priority: High          │ EV-002 source …        │
│   Metadata conflict │ Severity: Medium               │ Location: package.json │
│                     │ Evidence confidence: Strong    │ Raw span: lines …      │
│                     │ Explanation: Unresolved        │ Content: retained      │
│                     │                                │ Verification: n/a      │
│                     │ Significance: execution path   │ Limitations: …         │
│                     │ changed during installation.   │                        │
│                     │ [Enter full inspection]        │ [Enter inspect span]   │
├─────────────────────┴────────────────────────────────┴────────────────────────┤
│ Focus: finding list  Tab pane  Enter inspect  / filter  Esc back  ? help      │
└───────────────────────────────────────────────────────────────────────────────┘

FULL-WIDTH FINDING DETAIL
┌ HEURISKO · Findings > finding-123 ──────────────────────────────────────────────┐
│ OBSERVATION       Added lifecycle command to artifact metadata               │
│ SIGNIFICANCE      Installation may invoke this command                       │
│ SEVERITY          Medium   | REVIEW PRIORITY High                              │
│ EVIDENCE          Confidence Strong  | Explanation Unresolved                 │
│ JUMP ANCHORS      Obs  Significance  Evidence  Limits  Next  AI            │
│ EVIDENCE LINKS    EV-001 [artifact range]   EV-002 [source range]             │
│ LIMITATIONS       Intent/actor/cause not established                          │
│ NEXT ACTION       Inspect precise raw diff and source revision              │
│ AI INTERPRETATION [separate labeled section, not verified finding]            │
├───────────────────────────────────────────────────────────────────────────────┤
│ Esc Back to exact state   Enter open cited evidence   q Quit   ? Help       │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED:** default sort by review priority, independent controls for severity/confidence/type; highlighted selection is distinguishable from focused pane; Enter enters full-width inspection; return preserves exact list position.
- **PROPOSED:** the finding detail visibly separates severity, review priority, evidence confidence, explanation strength and any completeness limitation. These are not substitutable values.
- **CONFIRMED R3-36/R3-39/R4-52:** structured scrollable finding detail with jump anchors; deterministic tie-breakers using stable finding IDs; an evidence citation activates its recorded raw span when readable, else metadata-only detail. **OPEN:** precise tie-break field order, in-content anchor shortcut, link numbering and evidence-resolver contract.

## 7. Wireframe — Files, raw diff and evidence (proposed)

```text
WIDE EXPLORER
┌ HEURISKO · report identity ─ Files ─────────────────────────────────────────────┐
│ [Tree] Flat   Status: all  / filter path  Mode: [Raw] Transform? (if valid)   │
├────────────────────┬─────────────────────────────────┬────────────────────────┤
│ FILES              │ RAW DIFF                        │ FILE + EVIDENCE        │
│ ▾ package/         │ SOURCE            ARTIFACT      │ Source path: …         │
│   > package.json   │ 12: "scripts":{    12: …       │ Artifact path: …       │
│     dist/          │ 13:   "test":…   + 13: post…    │ Raw equality: different│
│       index.js     │ 14: }              14: …        │ Explanation: unresolved│
│   …                │                                 │ Findings: #123         │
│                    │ [Toggle unified]                │ Evidence: EV-001       │
│                    │                                 │ Limitations: …         │
├────────────────────┴─────────────────────────────────┴────────────────────────┤
│ Enter full diff  / filter  Tab focus  ? help                                   │
└───────────────────────────────────────────────────────────────────────────────┘

MEDIUM / NARROW
┌ HEURISKO · Files > package.json ────────────────────────────────────────────────┐
│ RAW UNIFIED DIFF   source vs artifact                                         │
│ - source-only line (if any)                                                   │
│ + artifact-only line (if any)                                                 │
│ [Evidence]  [Metadata]  [Limitations]  [Toggle diff if display permits]       │
│ Esc restore prior file selection/scroll                                       │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED:** tree with toggle to flat list; selection updates preview; diff side-by-side at wide, unified when narrow, user-toggleable; relevant evidence accessible.
- **PROPOSED:** raw view selected first and remains recoverable from any normalized/transformed view; transformed view requires clear method/scope/residuals.
- **Content cases that must be distinct:** source-only; artifact-only; modified; identical; plausible generated candidate not proven; renamed/moved only if supported; missing source; binary; unsupported; minified/large; extremely long or control-character paths; retained bytes unavailable; source text not exported; truncated viewport (not truncated analysis). **CONFIRMED R4-59:** elide long *displayed* paths with a safe inspect/copy-full-value action; never silently mutate evidence path or let control sequences execute.
- **CONFIRMED R3-38/R4-59:** side-by-side synchronized scrolling, horizontal long-line scrolling, bounded reads; visually shortened paths with safe full inspect/copy. **OPEN:** unequal-hunk scroll-anchor alignment, transform permissions, virtualization, control-character copy policy.

## 8. Wireframe — Evidence activation, missing bytes and exact return (proposed details)

```text
READABLE EVIDENCE: cited EV-001 activated from finding-123
┌ HEURISKO · Findings > finding-123 > EV-001 · RAW RANGE ─────────────────────────┐
│ Side: ARTIFACT    ID: EV-001      Path: package.json (full safely inspectable)│
│ Digest: sha256:…  Method: recorded method   Range: lines 12–16                │
│ Content: READABLE RAW BYTES      Verification: recorded/not applicable        │
├───────────────────────────────────────────────────────────────────────────────┤
│ 12 {                                                                          │
│ 13   "scripts": {                                                             │
│ 14     "postinstall": "node ..."                                              │
│ 15   }                                                                        │
│ 16 }                                                                          │
├───────────────────────────────────────────────────────────────────────────────┤
│ Limitations: observation does not prove intent. Esc: return to exact position│
└───────────────────────────────────────────────────────────────────────────────┘

METADATA-ONLY ALTERNATIVE, IF SPAN NOT READABLE:
│ EV-001 · artifact · package.json · recorded line range and digest             │
│ Raw bytes unavailable: [recorded cause, if any]                               │
│ Metadata/digest retained; cannot display source text from this report.       │
│ [Inspect limitation] [New investigation only if actual action supported]      │
```

- **CONFIRMED R4-52:** activate evidence ID → exact *raw span* if bytes are readable; otherwise open honest metadata-only explanation, not a blank/forged snippet. Missing retained bytes, not-exported content, unsupported type, failed range read, and unknown availability must not be conflated if shared contract distinguishes them.
- **CONFIRMED R3-37/R4-55:** Esc pops one navigation frame and restores selected stable ID, filter, scroll and focused pane; `q` is Quit, *not* Back.
- **CONFIRMED requirement:** stable evidence ID, side, location, digest, recorded method/verification/range where present, availability and limitations. Contextual reference to full artifact/source identity remains available.
- **PROPOSED:** navigation location contains report ID, route, selected ID, focused pane, filter, visible anchor and scroll offsets; concrete key activation, range service and missing-content codes need engineering verification.

## 9. Wireframe — Source / Provenance / Build subtabs (proposed presentation; R4-48–50 confirmed)

```text
┌ HEURISKO · npm @sample/lib@2.4.1 · Source ──────────────────────────────────────┐
│ [Source candidates]   Provenance    Build                                     │
│ SOURCE STATUS: Conflict — competing source assertions recorded [Inspect]      │
├──────────────────────────────────┬────────────────────────────────────────────┤
│ CANDIDATES                       │ SELECTED COMPARISON TARGET                 │
│ > candidate A · selected         │ Repo: recorded URL, full commit, subdir    │
│   candidate B · conflicting      │ Association: claimed/corroborated/unknown  │
│   candidate C · unavailable      │ Evidence basis and limitations: [open]     │
│                                  │ [New investigation with this target]       │
├──────────────────────────────────┴────────────────────────────────────────────┤
│ Provenance subtab summary: artifact binding / signature / identity policy     │
│ Build subtab summary: recipe clues / reproduced result / limitations          │
└───────────────────────────────────────────────────────────────────────────────┘

PROVENANCE SUBTAB:
│ Artifact binding: [recorded]   Crypto verification: [recorded]               │
│ Expected identity/trust policy: [recorded]   Policy acceptance: [recorded]    │
│ Evidence and verification limits: [open]                                     │

BUILD SUBTAB:
│ Recipe or transformation clue: [recorded or unavailable]                      │
│ Actual independent reproduction: [recorded outcome or not performed]          │
│ Residual unexplained differences: [open if present]                           │
```

- **CONFIRMED R4-48:** compact Source candidates / Provenance / Build subtabs with independent summaries under one top-level Source tab. No single "trusted source" status merges cryptographic, identity policy, association and build reproduction dimensions.
- **CONFIRMED R4-49:** concise nonblocking source-conflict notice appears on both Overview and Source whenever conflict is recorded; inspect recorded candidate evidence within Source.
- **CONFIRMED R4-50/R4-51:** place **New investigation with this target** beside each applicable candidate. Selection opens dedicated exact-target preflight and creates a *new* report on Start, not a silent in-place change. If unavailable, the action must explain the actual limitation.
- **PROPOSED:** split candidate list/details on wide screens; stacked navigation on narrow screens. Precise candidate fields, attestation and policy enum mapping are **BLOCKED** on shared contract verification.

## 10. Wireframe — AI interpretations (proposed)

```text
┌ HEURISKO · report identity ─ AI ────────────────────────────────────────────────┐
│ INTERPRETATION ONLY — hypotheses are not verified observations                │
├─────────────────────────────┬─────────────────────────────────────────────────┤
│ INTERPRETATIONS             │ SELECTED HYPOTHESIS                            │
│ > finding-123               │ Hypothesis: release build introduced script    │
│   finding-456               │ Supporting cited evidence: EV-001, EV-002     │
│                             │ Alternatives: manual edit / build step / …    │
│                             │ Missing discriminator: build provenance       │
│                             │ Next: inspect recorded build evidence         │
│                             │ Runtime/model metadata: if recorded           │
├─────────────────────────────┴─────────────────────────────────────────────────┤
│ AI STATE: available | disabled | unavailable | failed | rejected | abstained  │
│ Validation passing is not proof of factual correctness.                       │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED:** contextual interpretation also appears near the relevant finding, clearly labeled as AI; deterministic evidence remains available during AI failure.
- **PROPOSED:** display AI hypotheses beneath evidence-backed observation; never substitute AI for a finding's source/citation.
- **CONFIRMED R4-56:** new-investigation entry and dedicated preflight explicitly display AI Enabled/Disabled/Unavailable selection, relevant limitations and configured parameters when known. **OPEN:** exact opt-in consent/cost/runtime semantics, interpretation refresh/re-run behavior, and source model fields; unavailable/failed states must offer diagnostics only when recorded.

## 11. Wireframe — Coverage and limitations (proposed)

```text
┌ HEURISKO · report identity ─ Coverage ──────────────────────────────────────────┐
│ COVERAGE IS NOT A SECURITY SCORE                                               │
│ Files: examined [measured] / total [measured]    Bytes: examined / total       │
│ Small bar permitted only where numerator and denominator share exact scope.  │
├────────────────────────────────┬──────────────────────────────────────────────┤
│ OMISSIONS / REASONS            │ SELECTED OMISSION                            │
│ > binary file not interpreted  │ Path: …                                      │
│   file exceeds read limit      │ Reason: binary content                      │
│   source unavailable           │ Affected stage: compare                     │
│   stage failed                 │ What remains inspectable: hash, metadata    │
│                                │ Follow-up: review/explicit reanalysis       │
├────────────────────────────────┴──────────────────────────────────────────────┤
│ Examined with no finding ≠ Not examined; reports with failures disclose scope. │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED requirement:** accounting files/bytes, skipped/unsupported, failure scopes; totals have meaningful denominators and avoid misleading completeness percentages.
- **PROPOSED:** omissions are navigable records with affected stage and why; progress bars are opt-in per measurable dimension, never a guessed `analysis %`.
- **OPEN:** large omission pagination, the exact categories of omitted vs unavailable content, coverage bars when some stage scopes overlap.

## 12. Wireframe — Monitoring (proposed)

```text
┌ HEURISKO ─ Home  Investigations  [Monitoring] ─────────────────────────────────┐
│ Runner: STOPPED       Last attempted fetch: recorded timestamp                │
│ Last successful fetch: recorded timestamp    Last completed analysis: time    │
├────────────────────────────────┬──────────────────────────────────────────────┤
│ WATCHES                        │ SELECTED WATCH / JOBS                        │
│ > @sample/lib  (policy: stable)│ Baseline: recorded release/report            │
│   other (policy: configured)   │ Discovered release: (if any)                 │
│                                │ Queued: 1     Failed: 1                      │
│ [Add watch]  [Remove watch]    │ [Run check]  [Inspect job] [Report]          │
├────────────────────────────────┴──────────────────────────────────────────────┤
│ A completed job may hold an incomplete investigation report.                  │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED requirement:** explicit runner states `running`, `stopped`, `unconfigured`, `stale`, `failed`; separate last attempted fetch, last successful fetch, last completed analysis; pending/failed jobs, baseline/new discovery, configurable release policy.
- **PROPOSED:** watch list left and job detail right, with missing timestamps displayed as `never` or `not recorded` only if semantically valid; no `live` badge for a stopped runner.
- **CONFIRMED R3-45/R4-57:** guided Add Watch selects release policy and establishes baseline; `Stale` is displayed only if an actually configured schedule plus recorded timestamps support it. `Stopped`, `Failed`, `Unknown`, and `Not configured` have distinct meanings. **OPEN:** supported policy choices, explicit staleness formula and timestamp timezone, retries/restarts and background runner contract.

## 13. Wireframe — Saved report, export and historical replay (proposed)

```text
┌ HEURISKO · @sample/lib@2.4.1 · HISTORICAL REPORT ───────────────────────────────┐
│ Saved report: rpt-...   Captured: recorded timestamp   Created: timestamp      │
│ OFFLINE REPLAY — online source/registry/provenance checks have NOT refreshed.  │
│ This report may omit some retained content. [Inspect availability]            │
├───────────────────────────────────────────────────────────────────────────────┤
│ Overview / findings / raw evidence remain inspectable where preserved.         │
│ [Export] Canonical report + optional retained evidence + manifest preview      │
│ [Preflight] destination, included, omitted, unavailable and format support                    │
│ [Reanalyze] Confirm NEW report and exact input/config; old record unchanged    │
└───────────────────────────────────────────────────────────────────────────────┘
```

- **CONFIRMED requirement:** capture/creation time, no false freshness, missing evidence states, unsupported schema/invalid report errors, explicit reanalysis, export contents/path.
- **PROPOSED:** one persistent replay notice, plus contextual missing-evidence notices; export preflight distinguishes `included`, `excluded by policy`, `not retained`, `unsupported`.
- **CONFIRMED R3-44/R3-46/R4-58:** historical notice persists on replay screens; export preview shows destination and included/omitted evidence; canonical report + optional retained evidence/manifest is preferred *only where implemented*; UI state is versioned, local per-report and resettable. **OPEN:** exact serialization, manifest schema, format/path/collision/atomic-write handling, UI-state privacy/corruption and reanalysis boundary.

## 14. Focus, navigation and command semantics — preliminary proposal

| Situation | Confirmed rule | Draft refinement needing approval |
|---|---|---|
| In a list | `↑/↓` and `j/k` navigate | Selection preview updates without moving keyboard focus to preview |
| Change pane | Tab / Shift+Tab | Focus order cycles list → content → evidence (only rendered panes) |
| Inspect | Enter opens full-width detail | Push complete return-location record; nested citations push another frame |
| Back | Esc exclusively handles back/close detail outside text input (R4-55) | Pop one detail frame; restore source tab/list/focus/filter/scroll precisely; text-entry Esc precedence requires test |
| Tab jump | Direct numeric + next/previous | Direct numeric and next/previous section navigation required; candidate mapping `1`–`6`, `[`/`]` is NOT approved and needs collision/accessibility review |
| Local search | `/` filters current view | Input focus suspends navigation shortcuts; query persists until explicitly cleared (R3-40). Esc behavior while editing still needs exact keyboard precedence |
| Command palette | Ctrl+P for actions + destinations | Only supported actions; temporarily unavailable commands have stated reasons (R3-41) |
| Help | `?` | Contextual first, expandable global list |
| Quit | `q` quits workspace/app; `Esc` reserved for Back (R4-55) | Exact quit target per context still requires a decision/test; active job only offers supported keep-running or cancellation with observable outcome (R3-42) |
| Interrupt | Ctrl+C | Request cancellation when applicable; show requested/acknowledged/completed distinctly, never assume success (R3-42) |
| Resize | Preserve context | Reflow while retaining selected ID, focus if possible, content anchor and filter |

**Security/accessibility invariant:** ANSI terminal escape/control sequences in untrusted package paths, file contents, logs, citations or model text must render inertly. Color is never the only status indicator. Unicode must have ASCII fallback. Full-width content viewers must avoid swallowing expected keyboard shortcuts when text selection/search has focus.

## 15. Reusable component inventory — proposed

| Component | Role | Notes / invariant |
|---|---|---|
| `AppShell` | Global nav, report context, footer | Never conceal report identity or historical state |
| `ContextHeader` | Input type/version/report identity | Optional expanded identity view |
| `TabStrip` | Six investigation sections | No phantom future action |
| `PaneFrame` | btop-inspired major border | Focused-pane label distinct from selected row |
| `SelectableList` | Findings, reports, watches, candidates | Stable ID, filter/sort, resume location |
| `FileTree` | Hierarchical files, flat toggle | Long/untrusted safe path handling |
| `DiffViewer` | Raw side-by-side/unified; transformed if valid | Raw always accessible; bounded reads |
| `EvidenceViewer` | Citation → readable raw span OR honest metadata-only detail | Stable ID; availability labels/digest/range/method; exact return |
| `FindingDetail` | Six approved meaning fields | Prevent label conflation |
| `OutcomeMatrix` | Six independent results | Never synthesize universal safety status |
| `CoverageMeter` | Precisely scoped measured fraction | No guessed ETA/percentage |
| `StageList` | Ten stages, six operational states | Separate stage completion from security outcomes |
| `NoticeBar` | Historical, partial, source conflict, missing data | Nonblocking and persistently discoverable where applicable |
| `CommandPalette` | Searchable supported actions/destinations | No inert fake controls |
| `HelpOverlay` | Contextual keyboard reference | Modality/inherited keyboard precedence |
| `ReportExportReview` | Canonical report and optional evidence/manifest, included/omitted, destination | Inspect before actual write; never imply unsupported export capability |

**Names are design placeholders, not declared implementation interfaces.**

## 16. Screen-state coverage matrix — proposed behavior, pending review

Every screen must have meaningful `loading`, `empty`, `partial`, `error`, and `populated` behavior; some are not normally reachable, in which case articulate why and use a neutral not-applicable placeholder rather than a fake error.

| Screen | Loading | Empty | Partial | Error | Populated |
|---|---|---|---|---|---|
| Home | Loading saved index | No recent reports: show start | Some report metadata unreadable, still show valid items | Index failure: recovery/retry action | New + recent + monitoring |
| New (npm/local) | Validating input/target | Blank form + scoped npm/path hints | Npm registry resolves but source unresolved | Field-specific invalid/registry/filesystem | Validated input → dedicated target review with visible AI selection |
| Exact-target review | Loading resolved identity | Missing required exact target: no Start | Some metadata unknown, uncertainty displayed | Resolution invalid/unreadable; back to edit | Exact artifact/source/config/limitations, then Start |
| Live | Waiting for stage events | No emitted evidence yet | Available stage results + incomplete warnings | Stage failure inline + diagnostics | Stage outcomes and resulting report |
| Overview | Reading saved report | No findings recorded within known examined scope; otherwise Not evaluated | Some outcomes unavailable/coverage omitted | Corrupt/unsupported report with return path | Takeaway + six outcomes, source conflict notice if recorded, next actions |
| Findings | Loading index | Distinguish examined-scope empty vs stage unavailable | Certain findings not generated due to failed stage | Finding index/read error | Priority sorted list + evidence |
| Finding detail | Fetching linked records | Missing optional interpretation | Some evidence content missing | Invalid evidence ref; return to finding | Six meanings + citations + next actions |
| Files / diff | Loading inventory/bytes | No comparable files or missing source | Unsupported/binary/minified/limited ranges | Range read failure with metadata intact | Tree/flat list + diff + evidence |
| Source (3 subtabs) | Loading candidates/checks | No source candidates or provenance/build evidence | Conflicts and partial verification shown separately | Resolution or verification failure | Candidate details + provenance policy + build evidence; new-target action creates new report |
| AI | Pending optional model status | Disabled/no interpretations | Abstained/rejected/uncertain result | Failed/unavailable model; deterministic data unaffected | Labeled cited hypotheses |
| Coverage | Loading accounting | No meaningful denominator → no bar | Skips and unsupported ranges | Missing inventory/accounting | Measured counts and omissions |
| Monitoring | Fetching saved watches/jobs | No watches / unconfigured runner | Stale only if schedule/time data actually supports it | Fetch/retry failure with timestamp | Watches, policies, distinct runner/freshness, jobs |
| Saved/replay | Opening report | Report file not found | Missing retained bytes/unsupported export subset | Unsupported schema/corrupt bytes | Historical notice + intact content |
| Export | Preflight contents/path | Nothing exportable (explain) | Some evidence excluded/not retained | Path/permission/serialization failure | Canonical report + optional retained evidence/manifest if supported; explicit result |

### Proposed state copy and safety semantics

| Situation | Suggested short display | Incorrect inference to avoid |
|---|---|---|
| Stage complete | `Complete — step finished` | `Package safe` |
| Stage incomplete | `Incomplete — [reason]; results may remain` | `Failed/clean` |
| Stage skipped | `Skipped — [reason]` | `Nothing to inspect` |
| Provenance crypto verified, policy rejected | `Signature verified; identity policy not accepted` | `Trusted release` |
| Digest matches recorded expectation, diff unexplained | `Integrity matched; unexplained difference remains` | `No concern` |
| No findings after unavailable analyzer | `Findings not evaluated — analysis stage unavailable` | `0 issues` |
| Evaluated subset with zero findings | `No findings recorded in the examined [scope]; remaining scope: Unknown/Skipped` | `All clear` |
| AI abstained | `AI abstained; cited deterministic evidence remains available` | `AI confirms safety` |
| Saved report | `Historical — online checks not refreshed` | `Live status` |
| Monitoring unable to determine freshness | `Freshness unknown — schedule or timestamps unavailable` | `Stale` asserted from stopped runner alone |
| Candidate conflict | `Source conflict — inspect candidate claims and evidence` | `Publisher/source verified` |
| Content not retained | `Metadata/hash available; bytes not retained` | Blank content interpreted as unchanged |
| Content not exported | `Bytes not included in this export` | `Bytes never existed` |

**These copy strings are unapproved suggestions, not contract-enumeration mappings.**

## 17. Critical experience walkthroughs — proposed test scenarios

1. **Straightforward correspondence:** npm artifact + supported exact source; diff viewer identifies matching raw bytes; provenance policy stays separate; no security verdict implied.
2. **Generated-looking output:** bundle candidate with transformation clues but unestablished cause; evidence confidence and explanation strength differ visibly; raw residual remains reachable.
3. **Added lifecycle command:** top-priority finding → full finding detail → evidence ID → exact readable raw `package.json` span (or explicit metadata-only screen when bytes unavailable) → Esc returns to same selected finding, filter, focus and scroll. `q` does not navigate Back.
4. **Conflicting source candidates:** Overview and Source show a concise conflict. Source > Candidates shows full commit/subdir and evidence. A candidate action opens the **dedicated exact-target preflight** and a new report; original remains immutable.
5. **Missing provenance:** cryptographic result unavailable; no fake verified label; exact artifact and source may still be inspectable.
6. **Integrity mismatch:** strong visual attention but policy, completeness and findings remain separate outcomes; clickable recorded digest detail.
7. **Unsupported/skipped content:** coverage shows omitted files/bytes and affected stages; available examined-scope counts stay properly scoped; unexamined or unavailable counts show Unknown/Not evaluated, not 0.
8. **AI failed/rejected/abstained:** failure remains visible; deterministic findings and file evidence stay fully navigable.
9. **Historical report missing bytes:** opening saved report shows historical notice; evidence detail shows stable ID/hash but not pretend content is readable; explicit new-run path.
10. **Monitoring restart/failure:** runner state and three separate timestamps unambiguous; Stale requires actual schedule+times; completed job with incomplete report remains separately marked.
11. **Narrow resize mid-inspection:** focus and current evidence ID survive 3→2→1 pane reflow; Esc returns to prior finding even if panes have changed.
12. **Untrusted terminal content:** control characters render escaped/inert; path displays are safe while copy/export preserves meaningful original metadata when allowed.

## 18. Engineering contract seams to resolve before implementation

Do not encode these as invented `types.ts` property names.

| Need | Why UI depends on it | Status |
|---|---|---|
| Validated immutable report + outcome semantics | Deterministic facts across TUI/CLI/browser | Existing G0 structure described, exact mapping not supplied |
| Stage event feed, ordering, counts, failure reason | Real progress and reliable partial outputs | API needs verification/design |
| Cancellation state + job lifecycle | Safe Ctrl+C and exit behavior | Open |
| Stable IDs for finding/change/evidence | Exact return and deep-link navigation | Required by brief; implementation verification pending |
| Bounded evidence and diff range reads | Binary/minified/very large file responsiveness | API needs verification/design |
| Distinct content-availability enum | Retained vs unavailable vs not-exported correctness | Shared semantics need confirmation |
| Source candidate and verification links | Credible provenance detail and new-target investigation action | Check G0 for conflict/corroboration, verification record and source target fields |
| Monitoring times, policy, retry metadata | Honest freshness, valid Stale predicate and recovery | API needs verification/design |
| Report-scoped UI-state store | Resume focus/filter/scroll without changing report | Schema/versioning/privacy open |
| Sanitized rendering/copy of untrusted bytes and long paths | Terminal safety, full original value and inert presentation | Hard requirement; implement/test |

## 19. Next acceptance review — engineering and scenario checks (NOT approved)

Round 4 decisions R4-48–R4-59 are **confirmed design preferences**. What remains open is implementing and testing their precise mechanics against the actual governing types and runtime capabilities. See `HEURISKO_TUI_ROUND_04_RECONCILIATION_AND_BLOCKERS_v0.2.0.md`. No additional broad preference questionnaire is required before scenario acceptance; implementation contracts and terminal prototypes must be audited first.

## 20. Acceptance checklist for later freeze (not yet met)

- [x] Round 3 consequential behaviors selected by user (14/14, no amendments).
- [x] Round 4 evidence/trust behaviors selected by user (12/12, no amendments; R4-55 = B).
- [ ] Source current `types.ts` and Phase 02 approved file verified; field-to-screen traceability cross-checked.
- [ ] Wide/medium/narrow and minimum usable size visual tests performed.
- [ ] Every required screen has populated/empty/loading/partial/error examples reviewed.
- [ ] Keyboard **exact** chords/precedence tested and settled for `q`, Esc, Ctrl+C, Ctrl+P, text fields, focus cycling, and numeric jumps.
- [ ] Evidence link stack demonstrated round-trip with exact line/range and return position.
- [ ] Independent provenance/completeness/policy semantics reviewed with adversarial scenarios.
- [ ] Partial, unavailable, exported-absent, historical, conflicting and rejected-AI states verified.
- [ ] Safe text/ANSI handling and color/Glyph fallback tested.
- [ ] Implementation dependencies and missing shared contracts assigned/acknowledged.
- [ ] User explicitly approves the final TUI Design Contract version.

---

**This revised v0.3.0 draft is a review artifact. Do not treat any proposed wireframe, status copy, key mapping refinement, or component API as approved without an explicit user selection.**


---

## Appendix C — Complete blocker and scenario audit

# Heurisko — Round 4 Reconciliation, Remaining Blockers & Next Review

**Version:** v0.2.0  
**Date:** 2026-10-31  
**Status:** RECONCILED REVIEW ARTIFACT — NOT A FINAL DESIGN CONTRACT  
**Input:** Heurisko supplied brief; user-confirmed R1-01–R4-59; prior Round 4 audit v0.1.0; revised wireframes v0.3.0.  
**No source claim:** Repository's actual Phase 02 approval file and `packages/contracts/src/types.ts` were referenced but **not supplied** in this review bundle; no live React/Ink execution or engineering verification was performed.

## 1. Decision closure / changed behavior

**All 12 Round 4 choices confirmed; no amendments. Total 59 confirmed preferences; complete TUI contract unapproved.** R4-55 is **B**, all other Round 4 choices **A**.

| IDs | Confirmed impact | Wireframe location | Verification needed |
|---|---|---|---|
| R4-48–50 | Source 3 subtabs; conflict on Overview/Source; new report from alternative target | §5 / §9 | Source candidate IDs, claims, verification vs policy, immutable report creation |
| R4-51, R4-56 | Dedicated exact-target preflight; AI choice/state/limitations visible | §3 / §10 | Valid input/target fields, AI opt-in/config support |
| R4-52 | Cite → raw span if readable else metadata-only explanation | §6 / §8 | Evidence ID resolver, bounded reads, availability enum, return-state fidelity |
| R4-53–54 | Unknown/Not evaluated instead of misleading zeros; two distinct Findings empty states | §5 / §6 / §11 / §16 | Counts and denominators, stage failure/scope model |
| R4-55 | `q` quit; `Esc` back, not synonyms | §8 / §14 | Quit target precedence at Home/report/active work, text-entry focus |
| R4-57 | `Stale` requires schedule + timestamp basis | §12 / §16 | Monitoring policy schedule, timezone, runner state and timestamps |
| R4-58 | Canonical report + optional evidence/manifest; preflight before write | §13 / §16 | Export serialization, availability, collisions and write results |
| R4-59 | Elided path, safe full inspect/copy | §7 / §8 / §15 | Terminal sanitization, original-value copy semantics, Unicode widths |

## 2. Audit outcome

**No conflict with a prior user-selected preference identified.** Clarifications made:

- **Quit vs Back:** `q` is no longer considered a contextual Back action. `Esc` navigates back. “Quit workspace/application” does **not** yet resolve whether quitting an open report returns to Home or exits the process; lock that only after a tested context table. An active job needs the R3-42 lifecycle safeguard regardless.
- **Exact-target review:** a summary embedded at the bottom of an input form is no longer sufficient. It is a separately navigable screen before Start. It can show unknown source association without inventing provenance.
- **Subtabs:** Source, Provenance and Build are in-tab subsections of **one** of the six approved investigation tabs, not three more global tabs.
- **Counts:** “Not evaluated” applies to unexamined measurements, not to known observed zeros in a bounded subset. A mixed result can accurately show `0 observed in 12 examined files; 3 not analyzed`, if the contract proves those denominators (numbers illustrative, not analyzer results).
- **Evidence:** “Metadata-only” is not equivalent to unsupported content, excluded export, read failure or never-retained bytes; display exact recorded reason when available.
- **Freshness:** runner `Stopped` or `Failed` cannot alone imply `Stale` without the actual freshness policy and timestamp evidence.
- **Export:** preferred package is conditional on real support; no fabricated output buttons, false success notices or invented manifest fields.
- **Historical notice:** `saved`, `historical`, `incomplete` are independent applicable attributes; historical online checks are never shown as refreshed merely by reopening a report.

## 3. Blockers, ranked

| Ref | Priority | Type | Unresolved contract / implementation issue | Proof required to close |
|---|---|---|---|---|
| B01 | P0 | Source verification | Actual approved Phase 02 file and G0 types are missing from this review | Read files; trace every screen field, enum and evidence status to types; log missing fields |
| B02 | P0 | Foundation interface | Typed stage progress, partial artifacts, cancellation acknowledgment and final state, detach/retry | Runnable mocked event contract + cancellation tests; no unsupported keep-running offer |
| B03 | P0 | Foundation interface | Stable finding/file/evidence IDs and bounded raw span resolution | API contract + tests: ID → recorded exact span or metadata-only reason |
| B04 | P0 | Semantic mapping | Six independent outcome enums; severity vs priority vs confidence vs explanation strength; count/coverage denominators | Field-to-copy mapping; false-zero and conflicting-status test cases |
| B05 | P0 | Security | Safe terminal rendering for untrusted file contents, paths, logs, AI text; safe full-path inspection/copy | ANSI/OSC/control-character, bidi, long Unicode and malicious input test suite |
| B06 | P1 | Interaction | Exact Home/report/app `q` target; modal/input precedence; Ctrl+C vs q active-job flow | Keyboard-state transition table and interaction tests |
| B07 | P1 | Report lifecycle | Dedicated preflight fields/unknown/blocked conditions; report identity, local archive source, new-source-target action | Resolved-target fixtures and old/new report immutability checks |
| B08 | P1 | Evidence UX | Back-stack after resize/search/filter, bytes unavailable/not exported, line vs byte address, binary/minified | State round-trip tests in wide/medium/narrow and metadata-only scenarios |
| B09 | P1 | Monitoring | Watch policy choices, baseline, schedule-based staleness, restart/retry, recorded timestamps | Contract + stale/unknown fixture matrix; real runner lifecycle |
| B10 | P1 | Export | Canonical format, manifest fields, optional evidence support, destination conflicts, atomic-write/error handling | Export dry-run schema + path/collision/failure tests |
| B11 | P1 | AI | Consent and processor/runtime state, six AI statuses, model metadata, failed/rejected/abstained copy | Configuration/state fixtures and no-model availability tests |
| B12 | P1 | TUI implementation | Responsive panes and minimum usable height/width, diff hunk synchronization, narrow navigation, report-scoped state migration | React/Ink prototype in terminals at >=140, 100–139, <100 cols; height stress; corruption/reset tests |
| B13 | P1 | Accessible visual system | Theme contrast, palette/monochrome, ASCII/Unicode and color-only risk, long paths | Real terminal visual captures, focus/selection comparisons, no-color screenshots |

**P0/P1 here describe design readiness, not vulnerabilities in user packages.** None of B01–B13 is falsely marked implemented or tested.

## 4. Screen acceptance scenarios for the next review

| Scenario | User journey / test oracle | Key failure to catch |
|---|---|---|
| S01 — Exact npm and local preflight | Input → validate → separate Review screen → Start; inspect AI state and unknown provenance | Source chosen by user appears "verified"; unreviewed target starts |
| S02 — Competing source claims | Overview conflict → Source Candidates/Provenance/Build → candidate action → new review + new report | Candidate switch edits historical report; crypto/policy conflation |
| S03 — Lifecycle script citation | Findings → detail → EV-ID → raw range; Esc returns exact filter/focus/scroll | Raw span guessed, missing bytes rendered as code, `q` treated as Back |
| S04 — Failed finding stage | Stage failed; Overview/Findings/Coverage distinguish unexamined from examined scope | Unknown displayed as 0 or a fully green bar |
| S05 — Large/binary/unsafe path | Tree→flat, preview, full path inspect/copy, raw diff/binary fallback | ANSI injection, paths silently modified, unbounded load or broken resize |
| S06 — Historical incomplete export | Open saved report → persistent offline notice → metadata-only evidence → preflight export → actual file result | Reopening implies refresh; export misstates retained bytes |
| S07 — Monitoring stale/restart | Watch setup→baseline→attempt/success/completed timestamps→restart | "Stale" invented from stopped state; failed job shown as complete report |
| S08 — q/Esc/Ctrl+C + resize | Nested finding, open report, Home, modal, text input, active stage; reflow 3→2→1 panes | Quit loses running work; Back exits; focus/return position corrupted |
| S09 — AI disabled/abstained/failed | Setup explicitly communicates AI choice; report renders deterministic findings independent of AI | AI implies verified intent or hides deterministic evidence |

Use **synthetic labeled report fixtures** until genuine test fixtures become available. Passing a static wireframe review is not proof that a terminal implementation satisfies the contract.

## 5. Engineering-first next review and exit criteria

1. **Evidence collection:** obtain Phase 02 approval and shared `types.ts`; construct field/status-to-screen traceability, explicitly mark missing API fields.
2. **Foundation contract proposals:** typed progress and cancel lifecycle; evidence identity/range/availability; monitoring schedule/times; export contents/manifest; UI state schema. Do not invent runtime support.
3. **Prototype:** render Home, Preflight, Findings/Evidence, Source and Monitoring in React/Ink; test wide/medium/narrow and varying heights using synthetic fixtures.
4. **Acceptance test:** run S01–S09, record expected versus observed behavior; preserve failed scenarios as blockers rather than approving around them.
5. **Final review:** propose one named final TUI Design Contract version with unresolved blockers transparently listed; freeze only after the user's explicit approval.

### Questions that remain actual user design choices

The 12 Round 4 preference choices are closed. Only a few concrete UX decisions need user acceptance after prototypes: (a) report-workspace `q` target versus app exit, (b) numeric and next/previous tab chord assignment, (c) exact small-terminal fallback, and (d) copy/write confirmations on unsupported or destructive operations. All should be shown with behavioral examples rather than another broad styling questionnaire.

## 6. Approval status

- **Approved direction:** R1-01–R4-59 (59 preferences), no Round 4 amendments.
- **Draft only:** precise wireframe layouts, wording, proposed components, exact theme tokens, action bindings, and engine APIs.
- **Unverified:** underlying governing/type files, executable React/Ink TUI, security and terminal tests.
- **Not approved:** complete final TUI Design Contract. No implicit freeze or implementation readiness claim.
