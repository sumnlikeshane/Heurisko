# Heurisko local web application

The application lives in `apps/web/`. It now has a product landing page, searchable CLI/browser documentation with a vertical contents sidebar, and an investigation workspace using the existing shared engine. The terminal visual direction is preserved; no TUI design is adopted or frozen.

Current [overhaul receipts](../../examples/web-overhaul/current/README.md) record partial native Chrome/Safari observations alongside source/API/CLI checks. The complete final viewport, zoom, keyboard, nested-evidence, native import/download, external-offline and assistive-technology matrix remains open. Earlier blocked-browser checkpoints below are historical. Durable selected-package monitoring (Part 5) is not authorized or started; process-local investigation jobs do not provide a monitor or restart recovery.

## Setup and open

Use the repository's pinned Node **22.23.4**, pnpm **10.14.0**, Python validator environment and admitted Docker static parser. Follow [installation and execution](../../README.md#installation-and-execution) and the [complete CLI reference](../../docs/CLI%20Reference.md). Build and launch from the repository root:

```sh
pnpm run build
pnpm web
```

The launcher prints a private loopback URL. Open it to see **Home → Documentation → Workspace**. Workspace separates **New investigation**, **Open evidence**, **Jobs in this session** and **Reports in this session**. A job has its own execution page; an observation has its own report sections and export actions. It binds `127.0.0.1` and selects a free port; `--port PORT` chooses one explicitly. Its per-process session capability stays in the URL fragment until the app consumes it into memory. Reopening the printed URL restores access after a bare reload; no capability is stored in browser storage. Home and the built documentation are readable without a capability. Investigation and evidence APIs require it.

Saved reports can still be admitted at startup:

```sh
pnpm web --report examples/handoff/current/B1.report.json --store examples/handoff/current/store --report examples/handoff/current/B2.report.json --store examples/handoff/current/store
pnpm web --import examples/web/current/local-mutation
```

Up to 16 observations can be open per process, including startup and newly generated/imported reports. Observations sharing a report ID keep separate content digests and opaque handles. Historical observations are never refreshed merely by opening them.

### Connected deterministic investigations

Ordinary new browser investigations use the reviewed `55240e9` deterministic entry through the shared engine. Launch normally:

```sh
pnpm web
```

An absent/empty host setting uses this reviewed default; `HEURISKO_ANALYSIS_MODULE=55240e9 pnpm web` explicitly pins the same selection. `HEURISKO_ANALYSIS_MODULE=off pnpm web` provides raw-only investigations with unavailable deterministic analysis. The allowlisted selector is trusted server-process configuration; neither a browser field, HTTP request nor analyzed package can select module code. Unknown nonempty selectors fail before acquisition. Module identity/configuration belongs to each new report. Opening retained reports does not recalculate their findings or alter earlier evidence. [Module intake and validation](../../docs/Final%20Module%20Intake.md) records exact scope and results separately from historical web receipts.

This path admits only reviewed deterministic code. Product model/provider/CodeAstra paths remain unavailable. The AI request control cannot enable inference. Missing/corrupt/over-limit retained delta or member bytes leave limited/unexplained evidence and incomplete heuristics; configured findings do not establish source binding, verified build equivalence, provenance, concrete policy evaluation or monitoring.

## Navigation and session context (W1)

Native links and browser Back/Forward address `/`, `/docs/cli`, `/docs/setup`, `/docs/browser`, `/workspace/new`, `/workspace/open`, `/workspace/jobs`, `/workspace/reports`, `/workspace/jobs/OPAQUE_ID` and `/workspace/observations/OPAQUE_HANDLE/SECTION`. Report sections are overview/files/findings/source/ai/coverage. Only these UI paths get the HTML fallback; paths do not map to host files or grant protected API access. Opening a destination never submits analysis. Documentation now uses a deterministic 16-page manifest with stable semantic anchors under `/docs/start/quickstart`, `/docs/cli/analyze`, `/docs/cli/inspect`, `/docs/workflows/...`, `/docs/concepts/identity`, `/docs/troubleshooting/...` and `/docs/availability`. The complete canonical CLI and browser references remain available at `/docs/cli` and `/docs/reference/browser`; `/docs/browser` provides the browser workflow guide.

Same-tab navigation keeps the investigation/open forms mounted, retains a cross-document search query, and keeps file filter/page/selection and evidence stacks/byte offsets per observation. A memory-only navigation ledger restores scroll and connected focus targets; browser/keyboard proof remains open. Reload/new-tab/process restart does not restore transient drafts or authority. A selected report shows its full content reference, report ID and capture time, while draft/job pages have their own context and no old report exports.

The shell distinguishes checking/connected/unauthorized/disconnected session states. Restore authority only with this reader's private launch URL; the masked connection field accepts only the exact current origin/root launch URL, clears immediately and retains the destination/draft; fragment navigation consumes the capability into memory without reloading or clearing the draft. Refresh reads existing jobs/catalog/report state only. Job and observation handles expire with the process; explicitly reopen saved evidence after restart. Scoped input/import/job/report errors remain separate from the connection indicator. Cancellation remains a request with unobservable cleanup.

## Browser investigation and outputs

1. Open **Workspace → New investigation**. Enter an exact public npm target such as `npm:picocolors@1.1.1` or `npm:@vue/shared@3.5.22`, or select a local tar/tar.gz file. Ranges, tags, aliases and alternate registries are rejected.
2. Optionally provide the paired GitHub source URL/full 40-hex commit and package subdirectory. Local input also accepts explicit name/version labels and a selected source archive for replay. npm cannot use local source replay, matching the CLI. An override remains user asserted; it never proves release correspondence.
3. Choose the AI request flag (uncheck for `--no-ai`) and optional requested policy reference. The fixed profile is `raw-static-s3-v1`. Deterministic analysis uses the reviewed default unless the trusted host explicitly selects `off`. AI-off preserves deterministic checks. Model, verifier, rebuild and concrete policy evaluator remain unavailable. Request options cannot manufacture those capabilities.
4. Choose **Review exact input**. Convenience checks catch exact-target/source-pair/subtree/file restrictions before upload; server/core remain authoritative. The review lists selected filenames/sizes, source, labels and options. **Confirm and start investigation** admits bytes and calls core `investigate`, retains evidence and displays actual stage events. There is one active investigation; no implicit queued/retried work. A usable incomplete report displays the shared CLI exit outcome, usually **2**. Acquisition failure without a usable report displays an error and exit **3**, plus an opaque retained diagnostic reference when supplied by core.
5. Open the report, follow file changes into evidence, and save **report JSON**, **EvidenceBundle JSON**, or **portable evidence**. Report JSON retains original encoded bytes; bundle JSON contains the validated shared bundle but does not contain every referenced blob. Neither download alone is self-contained evidence portability.

**Request cancellation** forwards an abort request to core. `cancel_requested`, settled report/error and `cleanup: not_observable` stay distinct. The five-minute web deadline also requests cancellation; the admission slot stays occupied until core settles, including its bounded control/validation windows. The UI does not claim cleanup acknowledgment, durable resume, detach, retry or parser recovery. Closing a tab does not cancel a job. The Jobs destination lists every job in this process, with explicit selection and a return link for the active job. Job detail shows the sanitized accepted request (including upload digest/size without host paths), latest recorded state per stage and expandable bounded repeated-event history. A lost start acknowledgment directs the user to Jobs/read-only refresh before any explicit new submission. Read-only **Refresh session status** reconnects without retrying analysis. The job list survives tab reload within the same process, accessible after reopening the private URL; process restart loses that in-memory execution history. Ctrl+C requests cancellation, waits for active engine settlement and stops the service. Reports/blobs remain on disk. Unknown parser jobs/locks are never deleted by web tooling.

The engine persists in fixed `.heurisko/web-workspace/store`. To reopen after process restart, use the report's full `sha256:…` **content reference** in the reopen form. This is not an artifact digest or `report_…` label. The browser cannot choose an arbitrary `--store`, report destination or host path; save dialogs/downloads and terminal-admitted startup report/store pairs provide the scoped alternatives.

## Saved report and portable browser import

**Workspace → Open evidence** accepts a selected report JSON, a portable `.heurisko.json` file, or a report content reference in the fixed workspace store. Report-only reopening validates metadata and uses available workspace evidence; missing bytes remain explicit. It does not guess an external store. Use startup `--report/--store` or a portable export for reports whose bytes live elsewhere. A standalone bundle is not an InvestigationReport and is not accepted as one; no CLI bundle-to-report command exists either.

Portable browser downloads use `heurisko-web-portable-v1`, a single JSON envelope containing the existing directory manifest, original report base64 and digest-named blob base64. Imports reconstruct only fixed digest filenames in a private server-owned directory, then use the existing manifest/report/blob validator. Report bytes, observation time and transport omissions remain unchanged. Duplicate/unsafe references, bad encoding, included-blob corruption, false omissions and report-binding mismatches fail closed. Explicit exports carry upstream-rights notices. A partial export preserves omission reasons; its manifest is not a signature. Downloads are local and never automatically published.

## Portable directory export and import

The original terminal transport remains supported:

```sh
node apps/web/dist/export.js --report examples/handoff/current/B1.report.json --store examples/handoff/current/store --out .heurisko/NEW_DIRECTORY
pnpm web --import .heurisko/NEW_DIRECTORY
```

Choose a **fresh destination** under an existing real directory; changed outputs and symbolic-link directory chains are refused. macOS `/tmp` and `/var` are aliases; use their real `/private/tmp` or `/private/var` paths when applicable. `heurisko-web-export-v1` contains `manifest.json`, original `report.json` and `blobs/<sha256 hex>`. Directory exports and browser envelopes use the same report/blob inclusion and omission semantics. No archive extraction or target-package execution occurs during transport.

## Local privilege and resource boundary

Browser operations require the in-memory capability, exact Host, exact same Origin for POST, allowed fetch-site, exact route/query/method and bounded media-typed bodies. There is no shell-string, URL-fetch, host-path, directory-enumeration, engine-module or parser-recipe API. Filename labels cannot contain separators or terminal controls; upload storage uses random opaque names. Core owns target validation, public-DNS/redirect controls, integrity, parsing, validation and evidence semantics. Target packages are never installed, imported or executed. No failed-isolation host fallback is added. Use public data only.

Uploads/imports remain in private `.heurisko/web-workspace` directories, with immutable core evidence separate from mutable jobs. Up to **32 uploads**, **16 job starts**, **256 MiB admitted upload/import bytes** per process; **32 MiB per archive**, **8 MiB per report**, **100 MiB per portable envelope**, **16 KiB per structured mutation**; one I/O mutation/export at a time. Cancellation bypasses that I/O slot. Core's existing store cap/reserve controls remain; web admission also checks existing workspace usage and disk reserve. No automatic eviction, deletion or crash-lock recovery exists. Repeated launches do not bypass on-disk capacity checks. Selecting a file copies its bytes to the local service; quitting does not promise deletion.

Reader/transport limits remain **32 MiB per blob**, **64 KiB max API page** (UI 4 KiB), **256 KiB delta record**, **64 MiB included portable blobs**, **2 MiB manifest**, **16-level strict transport JSON depth**, **100,000 JSON values**, **20,000 entries**, one transport operation and a 120-second transport deadline, two active evidence reads, 10-second body/read deadlines and 32 service connections. The portable wrapper has a separately bounded 100 MiB decoder, retaining the same strict key/number rules. Rejection never fabricates evidence or rewrites a report to hide an omission.

## Evidence workspace and documentation

- **Overview:** a reading guide tied to recorded source/completeness/correspondence/AI/policy facts, actual stage records and next destinations; artifact/report digests, six separate outcomes, capture/creation times, scope and limitations.
- **Files:** raw relationship search plus a path-prefix/side browser over actual artifact/source member and coverage-omission records, 40-row pages, retained per-observation mode/prefix/side/page/selection and exact evidence links. Selection stays within filtered changes. Changed byte spans are not multi-hunk diffs or semantic equivalence proofs.
- **Evidence:** source/artifact spans, related full members, bounded hash-checked bytes, inert control/bidi escaping, binary base64 and explicit absence states. No line numbers are invented.
- **Findings / AI:** recorded records only, separate severity/priority/confidence, alternatives and missing evidence. Zero findings with unavailable analysis is not a clean assessment. Findings paginate all matching records in 30-record pages; filtering does not impose a first-100 ceiling.
- **Source / Coverage:** all candidates/conflicts, provenance/build facts, stage errors and omissions. List order does not prove source identity. Monitoring is unavailable.
- **Documentation:** 16 admitted build-time pages across Start, CLI reference, Browser workflows, Concepts, Troubleshooting and Availability, including the browser technical reference. Focused analyze/inspect pages derive from the complete canonical CLI reference. Guides link setup → task → evidence/export → troubleshooting. Search spans all pages with section snippets; queries remain in tab memory. Semantic headings/lists/tables, stable on-page contents, previous/next links, selectable code and exact-copy actions retain inert rendering and honest clipboard failure. Unadmitted repository references are visibly labeled inert text. HTML/embeds remain inert. External source links require explicit navigation. There is no external font/script/asset load.

Use Tab/Shift+Tab and Enter/Space. Escape returns through evidence history; file filter/selection remain mounted while opening evidence. The underlying shell becomes inert; the modal tab ring excludes hidden/disabled/closed-details controls. Nested evidence keeps per-observation byte windows, disclosure state, overlay scroll and visible focus targets in memory. Source/artifact citation pages remain distinct. These source/test checks do not certify browser focus behavior. Responsive panels stack on narrow screens. Final keyboard, viewport/zoom and browser-offline acceptance remain separate from API tests; the [current browser observations and remaining matrix](../../examples/web-overhaul/current/README.md#actual-browser-observations-and-remaining-acceptance) distinguish observed journeys from open checks. The [web gap receipts](../../examples/web-gap/README.md) retain the earlier W5 Chrome ERR_BLOCKED_BY_CLIENT result.

## Validation and remaining scope

```sh
pnpm run typecheck
PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts
pnpm run test:web
node --test integration/part4/tests/readiness.test.mjs
# Requires admitted parser + public npm/GitHub access; NEW destination only:
node apps/web/tooling/verify-investigation.mjs examples/web-investigation/NEW_RUN
# Saved four-case directory transport regression; NEW destination only:
node apps/web/tooling/verify-corpus.mjs .heurisko/NEW_TRANSPORT_CHECK
```

[New investigation receipts](../../examples/web-investigation/README.md) distinguish actual engine/API/CLI checks from browser observation and preliminary attempts. [Original first-slice receipts](../../examples/web/current/README.md) are immutable historical evidence. The [scope/parity map](../../docs/Web%20Application%20Product%20Scope.md) and [continuation prompt](../../docs/WEB_CONTINUATION.md) retain browser acceptance, genuine integrated findings/AI, TUI parity, monitor and remote CI gaps. No new technology, dependency or model is introduced. Product models: none. Coding assistance: Codex. No commit, push, PR, merge, deployment or submission is authorized by local implementation.


## W2–W5 local batch checkpoint — 1 November 2026

Shane authorized the remaining web batch together. W2–W4 implementation and W5 non-GUI validation now live in this same app/backlog; [fresh receipts](../../examples/web-gap/w2-w5/validation.json) distinguish current active-workspace checks, earlier isolated W1 checks, real engine/API/CLI observations and blocked browser acceptance. No new dependency is added. The owning `repaired-foundation` handoff heading is repaired without changing historical receipts.

Export is now a contextual choice: original report JSON, bundle JSON or portable evidence, with original content reference/capture time, inclusion/omission/rights/size explanations and explicit Open evidence links. Download feedback confirms preparation/request only, never a filesystem save. Wrong-format/corrupt inputs remain scoped failures; report-only missing blobs direct users to matching startup report/store admission or portable evidence.

The current concurrent S4/CLI source is preserved. Its parser has conditional terminal TUI entry plus `tui REPORT`, `--ascii` and `--palette`; CLI docs record that observed boundary. Active-workspace build/typecheck includes its compile dependencies; this web batch does not adopt or certify visual TUI behavior. Final receipts bind the tested source/build and record any concurrent changes/revalidation. W1's isolated baseline-CLI pass remains historical.

Relevant validation additionally includes:

```sh
# New destination/file required; records Node/loopback timings, not browser performance:
node apps/web/tooling/measure-workspace.mjs examples/web-gap/NEW_MEASUREMENTS.json
```

W5's 1440/1024/390 widths, 320-CSS-pixel reflow, 200% zoom, keyboard/nested focus/back, clipboard, GUI import/download, screen-reader and external-offline tasks remain open because Chrome blocks loopback before rendering. No passing visual or browser-offline result is inferred from HTTP/SSR. Shared engine/model/verifier/policy/monitor work, TUI visual acceptance, shared review and remote web CI remain separate next work. No commit/push/publication/deployment/submission/external message occurred. Product models: none; coding assistance: Codex.


## Link navigation repair — 1 November 2026

Internal destinations and documentation links now use direct `AppLink` handlers sharing the memory-only navigation controller. The handler reads the clicked anchor via `currentTarget`, cancels native document navigation even for the current route, and preserves external links, downloads and modified/new-tab clicks. It no longer depends on a shell-level bubbling handler finding an element from the clicked text/icon. The controller is attached before paint. Documentation anchor clicks focus/scroll to the actual heading, including repeated clicks without extra history entries; Back/Forward retain remembered views.

[Fresh scoped validation](../../examples/web-gap/link-navigation/validation.json) records 45 passing web checks and web build/typecheck. Existing authority, report and investigation boundaries are unchanged. This is regression/source validation, not a claim of a new browser GUI acceptance pass. A running preview needs one explicit refresh/new launch after the asset update; subsequent ordinary internal links stay within the document.


## Scrolled documentation follow-up — 1 November 2026

The earlier link-handler repair did not address documentation's page-wide scroll reset. Documentation now keeps a stable-height layout with independent sidebar and article scroll regions, remembers article position per document in memory, and bounds search results. Switching between docs never resets/focuses the whole window or main shell. Anchors scroll only the article and focus with `preventScroll`; stale navigation animation frames cannot apply an earlier page reset. Narrow layouts stack the two bounded regions. [Scoped results](../../examples/web-gap/docs-scroll/validation.json) distinguish code/regression checks from actual Arc observations; prior receipts remain historical. No authority persistence, implicit analysis or engine change is introduced.
