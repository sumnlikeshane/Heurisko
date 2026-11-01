# Heurisko: complete system and operating guide

Updated **1 November 2026, Asia/Kolkata**. This is a single-file map of the implemented system, how to run it, what the public server does, how to read its results, and what remains unfinished.

Source baseline inspected: local `main` at `6985d3eeecdbdc33463458e8072a31e62e86109f` (merge of PR #5), plus the uncommitted Phase 1 CLI/web AI-default repair and development-source intake described where relevant. Its history includes PR #3's integrated engine, CLI, TUI, browser and Render preparation, followed by the public document-entry repair. This guide does not identify the exact deployed commit: the public health response does not expose it. Historical receipts describe earlier uncommitted or raw-only checkpoints; use their recorded source identity, not their tense, as evidence. Retired plans are available through Git history.

**Public service:** [heurisko.onrender.com](https://heurisko.onrender.com/). The existing Chrome page showed the public report catalog and read-only banner. A fresh request to [the health endpoint](https://heurisko.onrender.com/healthz) returned HTTP **200** and `{"status":"ok","mode":"public-readonly"}` at **06:49:26 IST on 1 November 2026**. This confirms the web explorer responded in that mode; it does not establish a working hosted parser or fresh investigation.

Current documentation authority: [index](docs/README.md), [contribution workflow](AGENTS.md), [current work](docs/Production%20Phase%201%20Implementation%20Plan.md), [roadmap](PRODUCTION_MASTER_ROADMAP.md). Phase 1 remains open. Public health observations below are dated; no fresh deployment identity is established by the local Phase 1 validation.

## Contents

1. [What Heurisko is today](#1-what-heurisko-is-today)
2. [Capability map](#2-capability-map)
3. [Architecture and investigation flow](#3-architecture-and-investigation-flow)
4. [Reports, evidence, identities and result meanings](#4-reports-evidence-identities-and-result-meanings)
5. [Install and build locally](#5-install-and-build-locally)
6. [Run the CLI](#6-run-the-cli)
7. [Use the TUI](#7-use-the-tui)
8. [Use the local browser application](#8-use-the-local-browser-application)
9. [How the live Render server works](#9-how-the-live-render-server-works)
10. [Save, export, import and work offline](#10-save-export-import-and-work-offline)
11. [Security boundaries and resource limits](#11-security-boundaries-and-resource-limits)
12. [Repository and tooling map](#12-repository-and-tooling-map)
13. [Validation and examples](#13-validation-and-examples)
14. [Troubleshooting and shutdown](#14-troubleshooting-and-shutdown)
15. [Incomplete work and honest presentation](#15-incomplete-work-and-honest-presentation)
16. [A practical demonstration sequence](#16-a-practical-demonstration-sequence)

## 1. What Heurisko is today

Heurisko investigates **one exact package artifact against evidence for an immutable source revision**. It retains the package bytes, source claims, source snapshot, file inventories, differences and citations, then presents the same report through three interfaces.

- **CLI:** scriptable acquisition, static analysis and retained-report/evidence inspection.
- **TUI:** an interactive terminal workspace for new investigations, retained reports and evidence navigation.
- **Local browser:** Home, searchable documentation, reviewed investigations, process-local jobs, reports, evidence and export/reopen.
- **Public Render site:** the browser explorer over three committed public captures. It cannot start new investigations.

The product currently handles **exact public npm versions** and **local tar/tar.gz archives**, with GitHub full-commit source snapshots and optional monorepo subdirectories. It fetches and parses bytes without installing the target package or executing its scripts.

New local investigations use the reviewed **deterministic** rules from full commit `55240e99409ad44cbd6a978f40873ef410cb1861`. The admitted package is `@heurisko/intelligence-reviewed` version `0.1.0-55240e9`. These rules are ordinary code, not model inference. No product LLM/provider, release monitor, provenance verifier, trust-policy evaluator or rebuild worker is integrated.

The central question is source correspondence and unexplained differences. A package can match unsafe source, and a legitimate package can contain expected build differences. Heurisko does not issue a universal safe/unsafe certificate.

## 2. Capability map

| Capability | CLI | TUI | Local browser | Public Render |
|---|---|---|---|---|
| New exact public npm investigation | Yes | Yes | Yes | No |
| New local tar/tar.gz investigation | Yes | Yes; local form requires source | Yes; browser-selected bytes | No |
| Explicit GitHub full-commit/subtree comparison | Yes | Yes | Yes | Recorded captures only |
| Retained local source-archive replay | Yes; local artifact form | Yes; local form | Yes; local form | No |
| Registry SRI integrity check | New registry inputs | Same engine | Same engine | Recorded outcomes only |
| Raw inventories, differences and coverage | Yes | Interactive views | Interactive views | Captured views |
| Reviewed deterministic findings | Default on new runs | Default on new runs | Default on new runs | Only findings already saved |
| Open retained report | File or report content hash | File or report content hash | Startup pair, file, portable file or workspace hash | Three admitted captures |
| Inspect retained evidence | First 8 KiB of one record | Citation/member windows | Citation/member windows | Retained public windows |
| Real progress/cancel request | Stderr/signals | Live stage screen | Jobs screen | No live jobs |
| Save report/bundle JSON | Analyze output flags | No TUI exporter | Downloads | Downloads |
| Portable evidence export/import | Separate web transport tool | No | Yes | No |
| Model inference | Unavailable | Unavailable | Unavailable | Unavailable |
| Verified provenance, policy or rebuild | Unavailable | Unavailable | Unavailable | Unavailable |
| Release monitoring/watch runner | Unavailable | Unavailable screen | Unavailable | Unavailable |
| PyPI, lockfile/project analysis, upgrade comparison, SARIF | Unavailable | Unavailable | Unavailable | Unavailable |

“Yes” means implemented functionality, not general finding-quality acceptance, an accuracy guarantee, complete accessibility acceptance or production readiness delivery. Public report viewing and new local analysis are different operations.

## 3. Architecture and investigation flow

```text
CLI ───────────┐
Ink/React TUI ─┼──> shared @heurisko/core investigate()
Local web API ┘               │
                             ├─ exact npm acquisition OR local archive bytes
                             ├─ retained artifact identity and integrity evidence
                             ├─ restricted static Docker parser
                             ├─ source claims + selected immutable GitHub snapshot
                             ├─ inventories, member bytes and raw differences
                             ├─ reviewed deterministic analysis + content boundary
                             ├─ schema/semantic validation and six outcomes
                             └─ immutable report + content-addressed evidence store
                                                     │
                                shared report reader ┼─ TUI
                                                     └─ browser/evidence/export

Render public mode ──> three pinned retained reports/stores ──> same explorer
                       (no acquisition or analysis path)
```

### 3.1 Input and acquisition

An npm target must specify a canonical exact version, such as `npm:picocolors@1.1.1` or `npm:@vue/shared@3.5.22`. Ranges, `latest`, aliases and alternate/private registries are unsupported.

Core retrieves public npm metadata and tarball bytes directly. It retains request/response context, capture times, expected integrity and observed hashes. Strict SHA-512/SHA-256 SRI handling checks the artifact against registry metadata. A matching digest establishes that relationship, not package harmlessness. A mismatch remains visible and blocks source-correspondence comparison.

A local archive receives its own SHA-256 identity and `local-input` meaning. Its filename, package manifest or supplied name/version cannot give it a real registry release's integrity or provenance status.

### 3.2 Static archive inventory

A separate digest-pinned Docker container parses archives into virtual inventories and bounded retained member bytes. Original archive bytes remain stored. The parser records paths, hashes, sizes, archive metadata, rejected entries and incomplete scope. It does not import a package, run an install hook or execute a build.

Unsafe or unsupported entries and exhausted limits produce explicit incomplete/unknown scope. Files that could not be observed are not treated as absent.

### 3.3 Source resolution

Core retains separate claims from registry metadata, artifact manifests, version tags and explicit user overrides. It can fetch a GitHub archive at a full immutable 40-hex commit and select a package subtree while retaining broader source/build context.

An explicit override selects the comparison target; otherwise selection can use pinned registry/other claims. Conflicting claims remain inspectable and can leave source association ambiguous. A tag, `gitHead`, matching version or repository URL alone is not proof of the release's source. Only the selected candidate archive is acquired; this is not an exhaustive repository-history search.

Tag discovery is bounded to `vVERSION`/`VERSION`, up to three repositories and four annotated-tag peel requests. There is no silent default-branch fallback, Git checkout, signed-tag verification, submodule recursion or LFS materialization. Local source replay is user-asserted input, not cryptographic proof of commit correspondence.

### 3.4 Raw comparison

Core maps the archive root and selected package subtree while preserving original path evidence. It compares content hashes, records archive-metadata differences separately, and retains file change records. Its byte difference is a common-prefix/common-suffix enclosing changed region with bounded excerpts; it is not a semantic code diff.

Added/removed directions require complete, unambiguous comparison scope. Otherwise one-sided content remains unresolved. Source bytes outside the comparison subtree are accounted for as retained build context/excluded comparison scope.

A strict `package.json` scanner retains exact JSON pointers, values and half-open byte spans. It rejects invalid UTF-8, duplicate keys and unsupported size/structure. Manifest deltas can therefore cite the exact literal changed rather than guessing from filenames.

### 3.5 Deterministic intelligence

The reviewed rule body covers lifecycle scripts (`preinstall`, `install`, `postinstall`, `prepare`), other scripts, entrypoint metadata (`main`, `module`, `types`, `typings`, `exports`, `bin`, `browser`) and unresolved file differences.

A trusted wrapper supplies specifically admitted `scripts.*` manifest-delta content. It verifies hashes, declared availability, unique ownership, exact pointers, linked members, values, spans and presence/absence before supplying text. It is not unrestricted file access for the module. Missing/corrupt/over-limit content retains unresolved direction and makes heuristics incomplete.

The upstream body also contains generated-candidate and Python-hook branches, but current product acquisition and content wiring do not establish operational PyPI hook analysis, generated-code equivalence or build reproduction. Those are not shipped capabilities.

Known preserved rule limitations include removal priority depending on whole-file status and entrypoint wording saying old/new values are unavailable even where producer evidence retains them. A finding is a scoped observation requiring review; its severity is not proof of malicious intent.

### 3.6 Provenance, AI and persistence

Advertised npm attestations may be captured as **unverified bytes**. No admitted verifier, signer/issuer trust roots or source/builder policy exists. Provenance remains `not_checked`.

No product AI runtime/provider is admitted. CLI and TUI investigations disable AI by default and keep deterministic checks. The CLI continues to accept `--no-ai` with the same behavior. Older reports that requested AI retain their recorded unavailable state. Saved interpretations, experiments and separately reviewed model answers are not integrated product inference.

`packages/intelligence` now contains the separately imported AI development source and offline tests. The product still loads `packages/intelligence-reviewed`; the [Phase 1 intake record](docs/production-phase1/AI%20Source%20Intake.md) binds the source commit and records the inactive runtime boundary.

Finally, core validates the report against shared JSON Schema and semantic rules, verifies retained evidence, and publishes immutable report/run references. Changes in inputs, code, configuration or observation produce separately identified results. Viewers render those recorded facts; opening a report never upgrades or reruns its analysis.

## 4. Reports, evidence, identities and result meanings

### 4.1 The six independent outcomes

| Report field | What it tells you | What it does not establish |
|---|---|---|
| `artifactIntegrity` | Observed bytes versus supported registry digest expectation | Safe code or correct source |
| `sourceAssociation` | Evidence/ambiguity for selected source, including publisher assertions or user input | Verified build origin |
| `provenancePolicy` | Recorded provenance verification state | JSON decoding is not verification; current state is unchecked |
| `correspondence` | Recorded comparison result, such as exact/unresolved/not assessed | General harmlessness or arbitrary semantic equivalence |
| `analysisCompleteness` | Whether configured processing completed for declared scope | No suspicious differences |
| `policyResult` | Pass/violation/indeterminate/not evaluated as supported by the contract | A named policy has actually been evaluated |

Current policy behavior is `not_evaluated` when no policy is requested and `indeterminate` when `--policy REF` requests one. There is no concrete evaluator; severity does not create a policy violation.

Raw coverage is also visible: counts, omissions, unknown remaining scope and per-stage errors. Complete raw coverage can coexist with incomplete heuristic analysis. Complete analysis can coexist with unresolved correspondence.

### 4.2 Exit codes

| Code | Meaning |
|---|---|
| `0` | Configured checks completed without a configured policy violation |
| `1` | Configured policy violation; supported by the contract, with no current concrete evaluator |
| `2` | Usable report with incomplete analysis or indeterminate requested policy |
| `3` | No usable report, invalid invocation or relevant CLI/internal/output failure |

Precedence is no report → 3; otherwise violation → 1; otherwise incomplete/indeterminate → 2; otherwise 0. Report inspection reproduces the recorded result's exit meaning. Exit 2 with valid JSON is often an intentionally useful result. Exit 0 does not mean safe, verified source, checked provenance or production readiness.

### 4.3 Three identifiers that must not be confused

- **Artifact SHA-256:** exact package archive bytes.
- **Report ID**, such as `report_1366f57f990327d57dd6ad73`: logical report label bound to artifact/source/configuration identity.
- **Report content reference**, `sha256:` plus 64 hex characters: exact saved report observation bytes. This is what hash-based reopen expects.

Evidence has its own IDs, content hashes and locators. Short IDs are labels; full hashes and identity records guard against collisions. Different captured observations can share a logical report ID while retaining distinct full content hashes and timestamps. Web observation/job handles are random process-local routing identifiers and expire on restart.

### 4.4 Store layout

The default CLI/TUI store is `.heurisko`; `--store DIR` selects another. Local browser investigations use `.heurisko/web-workspace/store`.

```text
STORE/
  blobs/<64-hex-sha256>                 original bytes and JSON evidence
  identities/<report_id>.json           full logical identity guard
  runs/<report_id>/<report-digest>.json  immutable observation references
  scratch/                             bounded parser work and uncertain jobs
  state/                               operational/recovery records
  .write-lock / .parser-lock            fail-closed locks when applicable
```

Writes use immutable publication with synchronization; changed bytes cannot replace an existing immutable destination. Reads recheck hashes. There is a 1 GiB store cap and 64 MiB free-disk reserve, with no automatic eviction. Uncertain parser cleanup can retain locks and scratch deliberately.

A report JSON references evidence; it does not embed all blobs. Keep its matching store or export portable evidence. Opening old reports performs no fresh npm/source/revocation check. Capture time is evidence age, not the current time.

### 4.5 Exact evidence reading

A citation can identify a metadata record, delta, complete member or exact member range. An offset within delta JSON is not automatically an offset within source code. Readers resolve declared links and check member/range binding before showing artifact/source content.

`[585,611)` means bytes 585 through 610, with end exclusive. Record digest and displayed member digest may differ because they identify different objects. Missing, unavailable, unsupported or not-exported content remains labeled even if an unrelated blob is present. Content is inert text/base64, never active package HTML or executable code.

## 5. Install and build locally

All commands below run from the repository root. They describe the pinned repository workflow, not a published npm installer.

### 5.1 Requirements

| Component | Pinned/tested setup | Needed for |
|---|---|---|
| Node.js | **22.23.4**, `.nvmrc`; package engine is `>=22.23.4 <23` | Build and all front ends |
| pnpm | **10.14.0** | Frozen workspace dependency setup |
| Python | Host validator tested at **3.13.2**, CPython 3.13 | Schema/semantic validation, including retained viewing |
| Docker | Running local daemon and enforced parser controls | New archive investigation/parsing |
| Parser image | Exact digest below | New archive investigation/parsing |
| Network | Permitted npm/GitHub access | Fresh public acquisition; dependency/image setup |

Saved report viewing with installed tooling and retained bytes needs neither new Docker parsing nor public package access. New replay from local archives still invokes the restricted parser.

The current hashed validator requirements admit relevant CPython 3.13 macOS arm64 and Linux x86_64 wheels; they do not establish support for every architecture. A hash failure on another platform must remain a setup failure. Do not remove hash checks or substitute a host parser to get past it. Local parser support is macOS/Linux, with specific local socket paths described below; Windows is not implemented.

### 5.2 Install the project tools

Select Node 22.23.4 with your installed version manager, for example `nvm use` if nvm is available. Verify the actual versions before proceeding:

```sh
node --version
pnpm --version
python3.13 --version
```

If the pinned pnpm command is not installed, install that exact tool version, then install the repository dependencies:

```sh
npm install --global pnpm@10.14.0 --ignore-scripts
pnpm install --frozen-lockfile --ignore-scripts
python3.13 -m venv .venv
.venv/bin/python -m pip install --require-hashes -r requirements-contracts.txt
pnpm run build
PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts
node packages/cli/dist/index.js --help
```

The runtime defaults to this repository's `.venv/bin/python`; merely activating an unrelated virtual environment does not configure it. The validator requirements include `jsonschema==4.26.0`. `pnpm run typecheck` also builds before checking the workspace.

### 5.3 Prepare new-analysis parsing

Start the local Docker engine and pull the exact admitted image:

```sh
docker pull python:3.13.18-slim-bookworm@sha256:281d39ff02e3b389401586134ff9e6572954687822a58055ec07a60ded4e0b7f
```

Core uses `--pull=never`, so it will not silently download a replacement. It explicitly selects `~/.docker/run/docker.sock` on macOS and `/var/run/docker.sock` on Linux; ambient `DOCKER_HOST` and remote contexts do not redirect jobs. A different Docker installation/socket is not automatically supported.

### 5.4 Update, rollback and uninstall a source checkout

There is no released global installer or supported self-update command. Keep the current checkout, its full source identity and retained stores intact. For an update, use a separate fresh clone at an owner-approved full commit or release tag, select the pinned tools, repeat the frozen/script-disabled install and hash-locked validator setup, then build and validate. Never switch a dirty investigation checkout in place merely to follow these instructions. Reopen a copied report/store or portable export first; reanalysis creates a new observation. Keep the previous checkout/tooling available for rollback, and compare full report/evidence digests rather than filenames or report IDs alone.

To uninstall this source workflow, stop the CLI/TUI/local web process and confirm settlement of any parser jobs. Export or back up wanted reports, blobs, recovery records and UI state before moving the checkout aside. Review its contents before deleting anything. No global `heurisko` installation, background monitor, hosted worker or account was created by these setup commands. Uninstalling a development checkout does not authorize deleting stores, unknown locks, shared pnpm caches, Docker images/containers used by other projects or another worktree. Removing a Docker image and uninstalling Node/pnpm/Python are separate operator choices.

### 5.5 Platform and release conventions

| Environment | Evidence/support status |
|---|---|
| macOS arm64, Node 22.23.4, pnpm 10.14.0, Python 3.13.2, Docker Desktop local socket | Fresh source installation and actual parser/investigation proof retained; current additional checks are in the Phase 1 plan |
| Native Linux amd64, same Node/pnpm and CPython 3.13, local `/var/run/docker.sock` | Candidate; starting-main CI exists, but the final Phase 1 native proof awaits authorized publication and its exact-head CI artifact |
| Linux amd64 hosted image under macOS Docker emulation | Image/build/read-only serving evidence only; cannot substitute for native parser/support proof |
| Windows, other architectures/runtime versions, remote Docker sockets | No supported installation claim from Phase 1 |

Before publishing a release, record the exact source/lockfile/parser-image/build identity, rights/notices, platform evidence, compatibility notes and known limitations. The G0 report schema remains `0.1.0`, separately versioned from a future package release. Choose an owner-approved version/tag on a reviewed feature PR with passing CI for its final head; no release is created by this guide. Deprecations must name the affected interface, supported replacement, migration/reopen proof and removal release/date in release notes before removal. Do not silently reinterpret old report bytes or remove a supported reader to force a migration. There is no approved time-based support/deprecation window yet.

## 6. Run the CLI

The dependable executable from this clone is `node packages/cli/dist/index.js`. The package declares the bin name `heurisko`, but no globally installed distribution is assumed here.

### 6.1 Command inventory

```sh
# Root help; subcommand --help is not implemented.
node packages/cli/dist/index.js --help

# Default TUI when both stdin and stdout are terminals; otherwise help.
node packages/cli/dist/index.js

# Fresh exact public npm investigation.
node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 \
  --no-ai --store .heurisko/NEW_NPM --json

# Reopen the current retained deterministic example without new analysis.
node packages/cli/dist/index.js inspect \
  examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store --json

# Open that report interactively.
node packages/cli/dist/index.js tui \
  examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store
```

Choose fresh destinations for new runs. A genuine npm request may preserve source conflicts or unsupported entries and return exit 2. Do not assume a particular finding count from fresh network acquisition.

### 6.2 Generate a new report from retained local inputs

This performs a new static parse/comparison, requires the Docker boundary and runs no target lifecycle/build/model. The input is explicitly an inert local mutation, not a newly discovered malicious registry package.

```sh
mkdir -p .heurisko/NEW_LOCAL
node packages/cli/dist/index.js analyze \
  --artifact examples/p04/local-mutation/inputs/picocolors-1.1.1.local-inert-mutation.tgz \
  --name picocolors --version 1.1.1 \
  --source https://github.com/alexeyraspopov/picocolors \
  --commit 7249f8c5d4825550f70bc1ea98652639933d3bbd \
  --source-archive examples/p04/local-mutation/inputs/picocolors-source-7249f8c5d4825550f70bc1ea98652639933d3bbd.tar.gz \
  --no-ai --store .heurisko/NEW_LOCAL/store \
  --report .heurisko/NEW_LOCAL/report.json \
  --bundle .heurisko/NEW_LOCAL/bundle.json --json
```

Omit `--source-archive` to fetch the explicitly pinned GitHub source. CLI local input without a source pair is accepted but preserves missing-source limitations. Source replay association remains user asserted.

A scoped npm/monorepo comparison can use:

```sh
node packages/cli/dist/index.js analyze npm:@vue/shared@3.5.22 \
  --source https://github.com/vuejs/core \
  --commit 5a8aa0b2ba575e098cbb63b396e9bcb751eb3a0f \
  --subdirectory packages/shared --no-ai --store .heurisko/NEW_SCOPED --json
```

This source override is a comparison candidate, not verified release binding.

### 6.3 All current CLI options

| Option | Where | Meaning |
|---|---|---|
| `--artifact FILE` | Analyze local | Local tar/tar.gz |
| `--source URL --commit FULL_SHA` | Analyze | Paired GitHub repository and immutable commit |
| `--subdirectory PATH` | Analyze with source pair | Select package subtree |
| `--source-archive FILE` | Analyze local with source pair | Retained source replay archive |
| `--name NAME --version V` | Analyze local | Optional subject labels, not registry proof |
| `--store DIR` | Analyze/inspect/tui/root interactive | Store, default `.heurisko` |
| `--report FILE --bundle FILE` | Analyze | Immutable output files; bundle alone is not full portable evidence |
| `--policy REF` | Analyze | Requested policy; evaluator unavailable, result indeterminate |
| `--evidence ev_ID` | Inspect | Verify/read first 8,192 bytes of retained evidence record |
| `--json` | Analyze/inspect | One canonical JSON result on stdout |
| `--no-ai` | Analyze | Explicitly keep AI disabled; equivalent to the default, preserving deterministic analysis |
| `--no-color` | All relevant entries | Uncolored inert presentation |
| `--ascii --palette` | TUI/root interactive | Presentation requests, no report changes |

Use separate option values (`--store DIR`), not `--store=DIR`. Duplicate/unknown flags and missing values fail. There is no general `--format`, `--offline`, CLI-version switch, arbitrary module-path flag or model-selection flag. `--version V` labels a local artifact. `analyze --help` and `inspect --help` are unsupported; use root `--help`.

npm targets cannot combine with `--artifact`, `--name`, `--version` or `--source-archive`. Source/commit must be paired. Subdirectory/source replay require that pair. `--no-ai` on inspect is accepted but does not change saved AI state.

### 6.4 Inspect exact content and evidence

```sh
# Hash identifies the saved report, not the archive or report_ label.
node packages/cli/dist/index.js inspect \
  sha256:c06db35768713d8c3b8dc4fc205a02c96e16af39d62dbe607f2c453373cc7f71 \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store --json

# This is the retained lifecycle delta record, not automatic full-member export.
node packages/cli/dist/index.js inspect \
  examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store \
  --evidence ev_e7075cb69f91c7e1b4c4223f --json
```

Evidence JSON includes metadata, base64 bytes, total length/truncation and a retained-observation notice. Human output escapes terminal controls. JSON stdout is canonicalized and need not preserve the original report file's whitespace. Original-byte download is a separate browser operation. Diagnostics/progress use stderr, so stdout remains usable in automation.

### 6.5 Select deterministic or raw-only mode

```sh
# Unset/empty selector already uses this reviewed default.
HEURISKO_ANALYSIS_MODULE=55240e9 node packages/cli/dist/index.js analyze \
  npm:picocolors@1.1.1 --no-ai --store .heurisko/NEW_DEFAULT --json

# Explicit historical raw-only behavior, retaining unavailable-analysis limits.
HEURISKO_ANALYSIS_MODULE=off node packages/cli/dist/index.js analyze \
  npm:picocolors@1.1.1 --no-ai --store .heurisko/NEW_RAW --json
```

This is trusted host-process configuration, not package metadata or a browser field. Unknown nonempty selectors fail before acquisition. Trusted code can explicitly inject a module, but untrusted inputs cannot choose executable code. Restart a process after a reviewed rebuild; the loader rejects changed/cached identity mismatches.

## 7. Use the TUI

The product TUI uses React/Ink over the shared engine and reader. Start it in a real terminal:

```sh
node packages/cli/dist/index.js
node packages/cli/dist/index.js --store .heurisko/MY_WORKSPACE --no-color
```

`tui REPORT --store STORE` opens a saved observation. In nonterminal use it emits a linear report summary and recorded exit outcome instead of requiring a screen. The minimum interactive size is **60 columns × 20 rows**; medium/wide layouts adapt around 100/140 columns and available height.

### 7.1 Home, target review and live work

Home provides new investigation, recent observations, needs-attention and monitoring destinations. The recent catalog validates up to 100 stored observations; an explicit report path/hash can also be opened.

New investigation supports npm/local selection, package/version, archive path, repository/full commit/subdirectory and optional local source archive. Unlike the CLI, the TUI local form requires explicit source. It does not expose local name/version label fields. Retained-example actions only fill fields; they do not start analysis. Some bundled form presets use an older historical comparison commit and retain that conflict caveat.

**Review** validates the target. For local files it snapshots archive/source bytes into the bounded store and rechecks those hashes at Start, preventing later filename mutation from changing reviewed input. npm review validates coordinates/override; downloaded digest/source facts become known during acquisition. **Start** is explicit.

The running screen shows actual stages, status/errors and elapsed time. Animation is indeterminate when core has no denominator. Cancel requests wait for engine settlement; they do not mean Docker cleanup is acknowledged. No detach, resume, retry or live evidence stream is implemented.

### 7.2 Report sections

| Section | Contents |
|---|---|
| Overview | Identity, six outcomes, priority findings, coverage/unknowns, actions |
| Findings | Deterministic finding, rule/version, severity, priority, confidence, evidence, limitations and review actions |
| Files | Real change records, artifact/source tree or flat list, modified navigation, bounded raw differences and unresolved sides |
| Source | Candidates, selected comparison basis, commit/subtree, hash-checked manifest values/conflicts, provenance and static build clues |
| AI | Saved status/reason/model/interpretations if present; current inference unavailable |
| Coverage | Counts, omissions, unknown scope, stages and scoped diagnostics |

Evidence views distinguish record bytes from cited member ranges, show exact offsets and missing/absent states, and support artifact/source sides and 4 KiB pages. Visual alignment is bounded to 200 rows per side and does not prove line mapping or semantic equivalence.

### 7.3 Keyboard map

| Keys | Context/action |
|---|---|
| `n`, `o`, `H/I/M` | Home new/open; Home/reports/monitoring destinations |
| `Ctrl+T` | Change npm/local target kind in form |
| Arrows, `j/k` | Select/scroll |
| `Tab`, `Shift+Tab` | Move pane/navigation focus |
| `Enter` | Review/start as labeled, expand directory or inspect selected item |
| `Esc` | Return with prior selection/filter/focus/scroll where supported |
| `1–6`, `[` / `]` | Report sections |
| `/`, `Ctrl+U` | Filter; clear text input |
| `a/z/c/t` | Findings priority/severity/confidence/rule filters |
| `PgUp/PgDn` | Finding-detail named sections |
| Files `m/v/d`, Left/Right | Next modified, tree/flat, raw difference mode, pan |
| `g`, `e` | Related file; exact recorded citation |
| Evidence `Tab/s/r/p/b` | Citation, side, record/citation mode, next/previous byte window |
| Source `v/n` | Subtab; prepare a separate new comparison target |
| `i`, `?`, `Ctrl+P` | Identity, help, searchable actions |
| `x` | Reset current observation's UI preferences |
| `q`, live `Ctrl+C` | Quit, or request cancellation and await settlement |

Text entry owns ordinary shortcut keys. The TUI does not write clipboard contents using OSC52 or execute links. Use its contextual help for current focus.

UI state v2 is separate from evidence in ignored `.heurisko-tui-state/`, keyed by logical report ID **and full observation digest**. It preserves sections/subtabs, selections, per-pane scroll, filters, trees and diff preferences, migrates v1 and visibly resets corrupt state. Cross-process Back history is not persisted. Reports are untouched.

The Monitoring destination describes unavailable capability. There is no TUI exporter; browser export is a separate feature. Human visual/usability/accessibility approval and joint acceptance remain separate from functional/PTY receipts.

## 8. Use the local browser application

### 8.1 Start and reconnect

```sh
pnpm run build
pnpm web

# Or select a fixed loopback port:
pnpm web --port 4317

# Or admit the retained deterministic report with its matching store:
pnpm web \
  --report examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store
```

The launcher binds **127.0.0.1** and prints a private URL containing `#session=...`. Open that exact URL locally and keep it private; substituting `localhost` fails the exact Host boundary. The browser consumes the capability into memory and removes the fragment from the address bar. Protected requests use `X-Heurisko-Session`; no account, cookie login or persistent browser token is required.

Reload loses in-memory authority. Reopen the exact launch URL or use the masked reconnect control. Reconnect restores access without starting analysis. Restarting the server creates new session/job/observation handles. Home and built documentation do not require investigation authority.

Multiple `--report REPORT --store STORE` pairs and `--import DIRECTORY` arguments can be supplied. The catalog is limited to 16 observations, and is not automatic enumeration of every disk report.

### 8.2 Screen and workflow map

| Screen | What to do/expect |
|---|---|
| Home | Product explanation, setup, New/Open locally or captured reports publicly |
| Documentation | 16 admitted build-time pages, grouped sidebar, section links, cross-page search/snippets, code copying and previous/next navigation |
| New investigation | Exact npm or selected local archive; source override/subtree; local labels/source replay; AI intent and requested policy |
| Review | Check exact coordinates, source/options, filenames and sizes before explicit confirmation/start |
| Jobs | Current/older process-local jobs, accepted upload hashes/sizes, actual stage history, cancel request and settled outcome |
| Reports | Admitted immutable observations, content identity, origin and capture time |
| Overview | Six outcomes, scope/limitations, stages and report-reading guide |
| Files | Search, relationship/member/omission browsing, side/path filters, 40-row pages and evidence links |
| Findings | Saved finding details, evidence, confidence/priority/severity, alternatives/missing evidence, 30-record pages |
| Source | Candidates, basis, conflicts, revision/subtree and provenance/build limits |
| AI | Recorded AI state/interpretations, not a chat or working model interface |
| Coverage | Omissions, failed/incomplete stages and unknown remaining scope |
| Evidence modal | Cited spans/full members, hashes, offsets, UTF-8/base64, nested evidence history and missing-state explanations |
| Save/Open | Original report, bundle, portable evidence and explicit retained reopening |

Internal links use client navigation. Docs article/sidebar scroll independently; tab memory retains document positions/search and observation-specific filters, pages, evidence windows, disclosures and navigation state. This is not durable recovery after reload or process restart. Links never start analysis by themselves.

### 8.3 Browser investigations and storage

The browser submits to the same `investigate()` used by CLI/TUI. It renders shared facts and does not compute a separate verdict. Local archive uploads are selected bytes, not arbitrary server filesystem paths. The fixed server workspace is:

```text
.heurisko/web-workspace/
  store/
  uploads/
  imports/
  exports/
```

Only one investigation runs at a time. Job phases distinguish running, cancellation requested, settled with report and settled with error. A five-minute web deadline requests abort; admission stays occupied until core settles. Closing a tab does not cancel a job. Jobs are in memory; the evidence store persists on local disk. They are not a durable queue, scheduler or release monitor.

The web layer reports parser cleanup as **not observable**. A settled job or accepted cancellation request is not its own independent cleanup proof. Core retains uncertain job records rather than the web layer deleting them.

### 8.4 Internal HTTP map

These routes support the application; they are not a general hosted automation API. Local protected routes need the current capability and exact origin checks.

| Route family | Purpose |
|---|---|
| `GET /healthz` | Minimal responding-mode health |
| `GET /api/docs` | Admitted built documentation |
| `GET /api/observations` | Current admitted catalog |
| `GET /api/observations/HANDLE` | Validated saved report/view metadata |
| `GET /api/observations/HANDLE/report` or `/bundle` | Download saved report or bundle |
| `GET /api/observations/HANDLE/evidence/ID` | Bounded declared record/citation/member bytes |
| `GET /api/investigations` or `/JOB_ID` | Process-local job status |
| `POST /api/uploads/artifact`, `/source`, `/report`, `/portable` | Bounded local-mode upload |
| `POST /api/investigations` or `/JOB_ID/cancel` | Explicit start/cancel request |
| `POST /api/reopen` | Explicit local-mode retained reopen |
| `POST /api/observations/HANDLE/export` | Local-mode portable export |

Evidence query fields are allowlisted (`mode`, `side`, `offset`, `length`) and ranges are validated. Public mode denies mutations before reading bodies. Process-local handles should not be used as permanent report identifiers.

## 9. How the live Render server works

### 9.1 What is actually running

[The public site](https://heurisko.onrender.com/) was observed serving the Node browser service in **`public-readonly`** mode. It serves Home, built documentation, three captured report/store pairs, their retained evidence, and original report/bundle downloads. The public banner states historical evidence only and directs live investigations/uploads/portable exports to the local workspace.

The dated health result recorded above confirms that explorer mode responded at that time. It does not claim that a package was acquired today, a model ran, or a parser is healthy. A Render application-loading/wake-up page was also observed during this check before the successful health request; allow for that startup delay when demonstrating it.

### 9.2 Public catalog and what each example proves

| Example | Captured time in IST | Actual saved result |
|---|---|---|
| picocolors 1.1.1 **inert local mutation** | 1 Nov, 05:57:21 | 16 deterministic findings; 20 change records; complete static analysis; exit 0; source user supplied, correspondence unresolved, provenance unchecked, policy not evaluated |
| ts-pattern 5.9.0 **historical registry release** | 1 Nov, 00:30:35 | Registry digest matched; publisher-asserted source; complete raw coverage, but historical module unavailable and analysis incomplete; zero findings; requested policy indeterminate; exit 2 |
| zod 4.6.7 **historical incomplete-source release** | 1 Nov, 00:31:10 | Registry digest matched; ambiguous source, unsupported source entry/unknown remaining scope; historical module unavailable and analysis incomplete; zero findings; policy indeterminate; exit 2 |

The mutation's lifecycle evidence is `ev_e7075cb69f91c7e1b4c4223f`: retained artifact bytes `[585,611)` contain the inert JSON literal `"HEURISKO_INERT_TEST_ONLY"`, and source evidence establishes the key's absence. No lifecycle script runs. This controlled input demonstrates evidence-backed script-change reporting; it does not accuse picocolors maintainers of publishing malicious code.

Historical zero findings in the other captures reflect unavailable analysis, not a clean security result. Those reports are not silently rerun with the new default module.

The startup allowlist checks these report-content SHA-256 values:

| Report | Full content hash |
|---|---|
| Integrated inert mutation | `c06db35768713d8c3b8dc4fc205a02c96e16af39d62dbe607f2c453373cc7f71` |
| ts-pattern B2 | `1f09dd8942fa3b379d0dc3cf462772e8c3eedd616597c59f3ccc58176b6d6e1e` |
| zod B3 | `66ea87bddf0319c4ccf8cc0d1e7be0f330eb17dc4fe4531775392692d9799757` |

### 9.3 Deployment mechanics

`render.yaml` declares service `heurisko`, Docker runtime, the public GitHub repository, branch `main`, free plan, `Dockerfile.render`, context `.`, health path `/healthz`, `PORT=10000` and `HEURISKO_WEB_MODE=public-readonly`. **Automatic deploys are disabled** in the checked-in Blueprint; pushing code alone is not a promise of a fresh deployment.

`Dockerfile.render` combines digest-pinned Node **22.23.4** and Python **3.13.2**, installs pnpm **10.14.0** and hash-pinned validator requirements, uses frozen dependency installation with scripts ignored, builds the workspace and runs `node apps/web/dist/main.js` as non-root UID/GID **10001**. The Docker context allowlist excludes private workspace state, installed dependencies, scratch and credentials. The image includes the committed public fixtures, not an operator's arbitrary local stores.

At runtime, hosted mode requires a trusted HTTPS `RENDER_EXTERNAL_URL` under `onrender.com` and a valid port, then binds **`0.0.0.0:$PORT`** behind Render's HTTPS proxy. Requests and forwarded headers cannot choose the trusted origin. Exact Host/Origin, fetch-site, route/query and evidence-range checks remain enforced. Public reads need no private session token; hosted startup generates none and refuses arbitrary CLI startup arguments.

### 9.4 Why hosted live analysis is unavailable

The admitted parser needs a local Unix Docker socket plus per-job mounts, a separately restricted container and acknowledged lifecycle controls. Running the web application inside a Docker image does not provide that separate parser boundary. The current public image has no Docker daemon/socket or admitted remote worker.

Therefore hosted mutations are rejected with `HOSTED_READ_ONLY` before body parsing: no fresh npm/local analysis, upload, cancel, reopen, portable import/export or private report admission. New/Open/Jobs destinations explain local operation. The public service is not a live analysis queue.

Enabling hosted analysis would require a separately designed, admitted and validated worker/storage/lifecycle architecture. Installing a Docker client or moving parsing into the web process would not supply equivalent isolation. The present limitation does not prove that every possible Render worker architecture is impossible.

The checked-in service requests no paid disk/database/model service. Its filesystem is treated as ephemeral, and it promises no user-data persistence. This is appropriate to its fixed committed catalog; it is not a hosted account/workspace product.

Source and preparation details: [Render deployment record](docs/Render%20Deployment.md), [hosted launcher](apps/web/server/hosted.ts), [service boundary](apps/web/server/service.ts), [Render Dockerfile](Dockerfile.render), [Blueprint](render.yaml). The preparation receipt is distinct from the live health observation recorded in this guide.

## 10. Save, export, import and work offline

### 10.1 Three different outputs

| Output | Includes | How to use it |
|---|---|---|
| Report JSON | InvestigationReport and evidence references | CLI/TUI file open or browser report open; matching blobs may still be needed |
| EvidenceBundle JSON | Validated evidence bundle and references | Supporting structured output; standalone bundle is not a full report |
| Portable evidence | Original report, included blobs, manifest, omissions and rights notices | Local browser export/reopen or directory transport |

Original admitted report bytes are preserved by browser report downloads. A bundle is serialized from the validated bundle; it is not a complete evidence archive. Downloads are prepared/requested in your browser and do not publish a report; confirm the file in browser downloads, since the app cannot confirm filesystem saving.

Browser Save offers a local portable `.heurisko.json` envelope (`heurisko-web-portable-v1`) with bounded base64 contents. Open accepts a report file, portable file or full report content reference in the **fixed workspace store**. It cannot browse arbitrary server paths. For evidence in another store, launch with the explicit report/store pair.

Report-only open keeps missing evidence explicit. Full portable export may also record omissions; inspect its included/omitted summary rather than assuming every blob is embedded. Hash consistency is integrity checking, not a digital signature or proof that a report author is trustworthy.

### 10.2 Directory transport from the terminal

After the build, use the web export tool with a fresh destination under an existing real directory:

```sh
mkdir -p .heurisko/exports
node apps/web/dist/export.js \
  --report examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store \
  --out .heurisko/exports/NEW_PORTABLE

pnpm web --import .heurisko/exports/NEW_PORTABLE
```

Directory format `heurisko-web-export-v1` contains `manifest.json`, original `report.json` and `blobs/<sha256>`. Symlink chains, corrupt included bytes, unsafe references, duplicates, false omissions and invalid bindings fail closed. On macOS use a real path such as `/private/tmp` if needed; `/tmp` is a symlink and can be rejected.

Once tooling and complete retained bytes exist, report viewing/reopening works without fresh public acquisition. It still needs the local validator/service as applicable and remains a historical observation. Full external-offline GUI/assistive-technology acceptance has not been completed merely because transport tests pass.

## 11. Security boundaries and resource limits

These are implementation controls, not a certification that arbitrary untrusted execution is safe.

### 11.1 Core controls

| Area | Current limits/behavior |
|---|---|
| Public acquisition | HTTPS port 443; npm registry, GitHub API and codeload allowlist; all resolved addresses public and pinned per connection; redirect revalidation; max 3 redirects; 30 s overall/10 s idle; credentials/IP literals/proxy environment rejected |
| Archives | 32 MiB compressed, 128 MiB expanded, 16 MiB/member, 10,000 entries, 1,024-byte paths, depth 32; regular files/directories only; links/special entries/duplicates/case collisions rejected; no nested archive processing |
| Parser | Digest-pinned Linux container; UID 65534; no network; read-only root/input/worker; capabilities dropped; no-new-privileges; 16 PIDs; 256 MiB/no swap; 1 CPU quota and 10 CPU-second worker limit; 30 s job wall time; concurrency 1, queue depth 8 |
| Parser lifecycle | Create client window 30 s, control/cleanup window 10 s; teardown can outlast parse wall deadline; uncertain jobs retain records/spool/locks |
| Validator | Repository `.venv/bin/python -I`; JSON Schema plus shared semantic rules; 8 MiB input, 4 KiB output, 10 s window |
| Deterministic content wrapper | 128 candidate records, 16 KiB/delta, 256 KiB/member, 1 MiB aggregate read budget; hash/pointer/member/value/span/absence checks |
| Store | 1 GiB cap, 64 MiB free-disk reserve, full content SHA-256, immutable writes, no automatic eviction |

No home, secrets, writable project or Docker socket is mounted into parser jobs. Only a bounded private spool is writable. Transport output files are host-readable within a private job parent; broader parser permissions were not opened. Controls are checked and unavailable enforcement yields incomplete evidence. This is a static parser, not an admitted hostile build sandbox.

The deterministic module runs as trusted product code in the host process. Timeout/cancel can stop waiting for asynchronous work but cannot preempt hostile synchronous JavaScript. The loader admits reviewed code and does not expose arbitrary module loading to packages or HTTP clients.

### 11.2 Browser/service controls

Local authority is a per-process capability plus exact Host/Origin and fetch-site checks; mutations require the expected Origin. Public mode uses the fixed origin/catalog and denies writes before reading bodies. Content Security Policy restricts scripts/styles/connections to self and excludes frames, objects and form submissions; target content is escaped inert text, with no external fonts or active package rendering.

Current browser limits include:

- 16 admitted observations, 16 investigation starts and 32 uploads per process; 256 MiB admitted upload/import bytes per process.
- 32 MiB archive upload, 8 MiB report, 100 MiB portable envelope and 16 KiB structured mutation bodies; disk/store reserve checks also apply.
- One I/O mutation/export at a time; cancellation bypasses that slot. One real investigation, with no queue or retry runner.
- Two active evidence reads; API windows at most 64 KiB, usual UI window 4 KiB; blob read cap 32 MiB.
- Body/read deadlines of 10 s, 32 connections, 100 requests per socket and 2 s keepalive.
- Portable transport: 64 MiB included blobs, 2 MiB manifest, 16 JSON nesting levels, 100,000 values, 20,000 entries and 120 s operation deadline.

Restarting does not erase disk usage/capacity checks. There is no automatic evidence deletion, eviction or guessed crash-lock recovery. Uploaded inputs and evidence retain their upstream redistribution rights; the project license does not relicense them.

## 12. Repository and tooling map

| Location | Responsibility |
|---|---|
| `packages/contracts/` | G0 TypeScript types, JSON Schema, Python semantic validation, synthetic positive/negative fixtures and handshake tests; current report schema version `0.1.0` |
| `packages/core/src/engine.ts` | Shared orchestration, identity/configuration, outcomes, validation/persistence and exit mapping |
| `packages/core/src/producer.ts` | Artifact/source evidence production and stage accounting |
| `packages/core/src/npm.ts`, `sources.ts`, `provenance.ts` | Exact npm acquisition, source claims/immutable snapshots, unverified attestation capture |
| `packages/core/src/archive.ts`, `parser-runtime.ts`, `parser-job.ts` | Bounded static parser orchestration, local Docker arguments and acknowledged lifecycle |
| `packages/core/runtime/archive_worker.py` | Restricted archive inventory/member worker |
| `packages/core/src/network.ts`, `safety.ts` | Public destination checks and versioned caps/isolation profile |
| `packages/core/src/comparison.ts` | Raw members/differences and strict manifest pointers/value spans |
| `packages/core/src/storage.ts`, `identity.ts`, `validation.ts` | Content-addressed immutable evidence, identities and report validation |
| `packages/core/src/adapter.ts`, `reviewed-module.ts`, `intelligence-boundary.ts` | Trusted analysis seam, reviewed default loader and admitted content resolution |
| `packages/intelligence-reviewed/` | Reviewed deterministic rules, original upstream body and admission/derivation ledger; excluded provider/model code is not part of this runtime |
| `packages/cli/` | Actual command parser, stdout/stderr formatting, signal handling and executable |
| `packages/tui/` | Integrated React/Ink screens, keyboard/focus/layout, model projections and observation UI state |
| `integration/part4/` | Shared strict report/evidence reader, readiness tests and retained TUI receipts; product dependencies still use this path |
| `apps/web/src/` | React UI, navigation, docs, forms, report surfaces and evidence modal |
| `apps/web/server/` | Node HTTP boundary, local workspace/jobs, observation admission and public hosted allowlist |
| `apps/web/tooling/` | Portable/directory transport, strict JSON, corpus/investigation validation and measurements |
| `apps/web/content/` | Authored browser documentation compiled with admitted references at build time |
| `scripts/` | Developer capture/replay/boundary/handshake/demo verification and exact-job recovery tools |
| `examples/` | Real retained inputs, actual generated reports/bundles/blobs, inert mutations, receipts and licenses; each belongs to its recorded checkpoint |
| `docs/` | Current references and one current phase plan; the historical index separates retained research/approval/governing evidence |
| `.github/workflows/ci.yml` | Contract/core, web/reader/TUI-model, offline development-intelligence and documentation CI jobs |
| `Dockerfile.render`, `render.yaml`, `.dockerignore` | Public captured-report image, Render service configuration and explicit build-context boundary |
| `package.json`, `pnpm-lock.yaml`, `.nvmrc`, `requirements-contracts.txt` | Workspace scripts and pinned tool/dependency inputs |
| `LICENSE`, `NOTICE` | Apache-2.0 original Heurisko material and attribution/third-party scope |
| `HACKATHON.md`, `AGENTS.md` | Original declaration; contributor context, approvals and durable constraints |

This is a TypeScript/Node pnpm workspace with React 19.1.8, Ink 6.3.1, TypeScript 5.8.3 and browser esbuild 0.25.12 among its pinned dependencies. Python supplies validation and the containerized archive worker. There is no operational SQLite/Postgres/Redis service, object-store backend, distributed worker queue or model server in the current product. Types for future jobs/watch states do not implement those systems.

Ignored dependencies/build output, `.heurisko` stores, `.heurisko-tui-state`, `.tooling` and private scratch are local operational material, not an additional published product component.

## 13. Validation and examples

### 13.1 Commands developers can run

Select the pinned runtime first. Some core checks create restricted parser jobs and require Docker; real public investigation verification additionally needs network. Use fresh destinations for capture/export/verifier tools.

```sh
pnpm run typecheck
PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts

# Serial core suite avoids overlapping lifecycle-sensitive checks.
node --test --test-concurrency=1 packages/core/tests/*.test.mjs

# Shared reader and integrated TUI model checks.
node --test integration/part4/tests/readiness.test.mjs packages/tui/tests/*.test.mjs

# Browser/service/export and public-mode boundaries.
pnpm --filter @heurisko/web test

# Offline retained-demo/evidence/transport/CLI verification, unused destination.
node scripts/verify-final-demo.mjs .heurisko/NEW_DEMO_VERIFY

# Further web parity/corpus checks, each with a fresh destination.
node apps/web/tooling/verify-corpus.mjs .heurisko/NEW_CORPUS_VERIFY
node apps/web/tooling/verify-investigation.mjs .heurisko/NEW_LIVE_VERIFY
```

Root scripts also expose `test:foundation`, `test:s2`, `test:s3`, `test:audit`, `test:s4` and `test:web`. These build relevant code before their suites. `test:s4` covers reader/model checks, not the separate real-terminal PTY harness. There is no standalone root monitor/model test command proving an unavailable feature.

Optional terminal-test tooling uses hash-locked **pyte 0.8.2** and **wcwidth 0.2.13**. To prepare an isolated test interpreter and run a focused retained-evidence PTY regression:

```sh
python3.13 -m venv .heurisko/pty-test-venv
.heurisko/pty-test-venv/bin/python -m pip install --require-hashes \
  -r packages/tui/requirements-terminal.txt
export HEURISKO_TEST_PYTHON="$PWD/.heurisko/pty-test-venv/bin/python"
HEURISKO_TUI_RECEIPTS="$PWD/.heurisko/NEW_PTY_RECEIPTS" \
  "$HEURISKO_TEST_PYTHON" packages/tui/tests/evidence-mode.py
```

The broader `terminal.py`, `terminal-live.py`, `user-workflows.py`, `user-states.py` and `report-adoption.py` harnesses are documented in the TUI README and retained receipts. Some run real local/npm investigations and require Docker/network; do not treat them as purely visual unit tests. Keep fresh receipt destinations and preserve failed attempts. The PTY packages are test tooling, with their own licenses; their presence does not add a product model.

CI installs pinned tooling/dependencies, builds/typechecks, validates contracts, checks the parser boundary, exercises acquisition/comparison/recovery and deterministic content boundaries, verifies historical corpora, tests web/export/reader/TUI models, checks research hashes and checks Markdown links. Synthetic contract fixtures and model-off handshakes verify boundaries; they are not genuine product-model execution or general detection-quality evaluation.

Render image verification is a separate operation:

```sh
docker build --platform linux/amd64 -f Dockerfile.render -t heurisko-render-check .
```

It requires registry/dependency network access. Preparation records show a completed Linux amd64 build and scoped hosted regressions; an earlier-image smoke is separately labeled. Neither source tests nor a health response independently prove every final deployed-image control. Current exact-head remote CI and deployment logs should be read from their actual runs before making release claims.

### 13.2 Example map

| Path | Use |
|---|---|
| `examples/README.md` | Main index and connected-default replay pointers |
| `examples/final-hour/20261101-053912/integrated-55240e9/` | Current retained 16-finding deterministic inert-mutation report, bundle and store |
| `examples/p04/local-mutation/` | Compact licensed input copies plus **older pre-integration** raw report/store; zero findings and exit 2 are historical |
| `examples/handoff/current/` | Historical B1/B2/B3/scoped captures with original facts; B2/B3 are public samples |
| `examples/s2/current/`, `examples/s3/current/` | Earlier producer/acquisition corpora and retained limitations |
| `examples/part4/`, `integration/part4/receipts/` | TUI integration, real workflow and PTY/state/lifecycle evidence |
| `examples/web-overhaul/current/`, `examples/web-gap/` | Browser/API/navigation/transport receipts and remaining acceptance limits |
| `examples/final-integration/2026-11-01/` | Assembled checkpoint validation, source identity and publication-redaction ledger |
| `examples/render-preparation/2026-11-01/` | Hosted-mode tests/build preparation, not a live hosted-analysis claim |

Prior receipts retain their own source/configuration/times, failed attempts and scope. They are not a universal current test count. This guide's checks were documentation-oriented: source inspection, pinned CLI help, retained-report/evidence inspection, Markdown checks and the stated public observations; it does not claim a new full regression, model run, GUI acceptance pass or investigation.

## 14. Troubleshooting and shutdown

| Symptom | Meaning and next step |
|---|---|
| Wrong Node version or runtime/build errors | Select 22.23.4; the ambient system Node can differ from `.nvmrc`; rebuild with pinned tools |
| Validator unavailable | Confirm repository `.venv/bin/python`, CPython 3.13 and hashed requirements; do not bypass validation |
| Dependency hash/platform failure | Platform wheel may be unadmitted; preserve the failure rather than removing hashes |
| Parser/image/control unavailable | Confirm exact image and supported local socket/daemon/cgroup controls; no host fallback |
| Exit 2 with JSON | Inspect incompleteness and requested policy; it can be a valid retained result |
| Zero findings with unavailable heuristics | No assessment was completed; do not call the package clean |
| `ANALYSIS_MODULE_UNAVAILABLE` | Historical/raw-only capture or missing module; inspect configuration and `HEURISKO_ANALYSIS_MODULE` |
| Unknown selector/admission mismatch | Use only default/55240e9/off; reviewed code/config changed or build identity is stale; rebuild/restart deliberately |
| AI unavailable in an older report | No product AI adapter exists; new CLI investigations disable AI by default and keep deterministic work |
| Public site refuses New/Open/upload/export | Expected hosted read-only boundary; use local browser/CLI/TUI |
| Render loading screen | Wait for service startup, then check `/healthz`; do not treat the loading page as analysis progress |
| Old public report deep link fails | Observation handles are process-local; reopen from Captured reports |
| Local browser unauthorized after reload | Restore the exact private launch URL via reconnect; capability is in memory only |
| Missing evidence in an opened report | Admit matching report/store or portable evidence; standalone JSON does not include blobs |
| Reopen hash not found | Use full report-content `sha256:...` in the intended store, not artifact digest/report ID |
| `REPORT_ENCODING_INVALID` or nonregular input | Supply supported exact UTF-8 regular report file; no BOM stripping, FIFO or symlink bypass |
| `IMMUTABLE_COLLISION`/export destination exists | Choose a fresh destination; never overwrite an old observation to hide identity changes |
| Store cap/reserve failure | Prior evidence is preserved; inspect disk usage and intentionally manage data; there is no automatic eviction |
| `STORE_BUSY_RECOVERY_REQUIRED`/unconfirmed cleanup | A crash or uncertain parser lifecycle retained safety state; inspect the exact bound job, not bulk-delete locks |

CLI signals and TUI/browser cancellation **request** abort. Wait for settlement. Local web `Ctrl+C`/SIGTERM requests cancellation, awaits active engine settlement and closes service connections; disk evidence remains. Closing a browser tab alone leaves its job running. No detach/retry/resume service exists.

`scripts/recover-parser-job.mjs` is explicit operator tooling, not a normal CLI command:

```sh
node scripts/recover-parser-job.mjs STORE_ROOT heurisko-parser-EXACT_UUID
```

It requires one matching store-bound job record and an actually acknowledged stopped container, verifies its full ID/label/state, removes that exact object without force, confirms absence and writes a recovery receipt before releasing its associated scratch/locks. It refuses uncertain states; it is not a generic stale-lock remover. Never use blanket container deletion or remove recovery records just to make the next run start.

### 14.1 Security reporting

Use the [security policy](SECURITY.md) for the selected private GitHub disclosure route, owner and best-effort acknowledgment target. The owner has closed the reporting-verification gate by signoff; no new agent observation of route activation/notifications or alternate address is claimed.

## 15. Incomplete work and honest presentation

| Area | What exists | What remains absent/unaccepted |
|---|---|---|
| Package acquisition | Exact public npm and local tar/tar.gz | PyPI, ranges/floating selectors, alternate/private registries |
| Source association | GitHub immutable candidates, subtree/context, conflicts and overrides | General correct-source guarantee, verified artifact-to-commit binding |
| Comparison | Raw bytes/hashes/metadata and manifest spans | General semantic equivalence, operational generated-code proof, reproducible builds |
| Deterministic intelligence | Reviewed lifecycle/script/entrypoint/unresolved findings | Broad quality/false-positive/held-out acceptance; preserved wording/priority limitations |
| AI | Contract fields, disabled/unavailable states and separate historical review material | Meaningful integrated open-model inference, runtime/provider, product retrieval and ablation |
| Provenance/policy | Unverified captured attestations, honest statuses | Cryptographic verifier, trust roots, expected signer/issuer/source/builder policy and concrete evaluator |
| Monitoring | Future contracts and visible unavailable destinations | Discovery/polling, durable watch store, scheduler, retries/checkpoints and restart-safe pending jobs |
| Interfaces | Working CLI/TUI/local browser; captured public explorer; owner accepts Phase 1 baseline limitations | TUI export and unperformed human/GUI/import/offline/AT observations; changed/distributed journeys require Phase 3 acceptance |
| Hosted platform | Read-only public captured reports | Hosted live analysis, private workspaces/accounts, persistent user storage and remote parser worker |
| Additional workflows | Single exact-artifact investigations | Project/lockfile audits, upgrade compare, SARIF, notifications and automated repair |

**Complete P04 is not established.** Monitoring and meaningful actual model work remain missing, and interpretation/verification/build/quality acceptance is limited. A working UI, deterministic findings, a public URL or passing boundary tests cannot close those gaps by themselves.

Superseded handoffs/plans/audits have been retired after their remaining findings were placed in the current backlog. The [history index](docs/HISTORY_INDEX.md) identifies original evidence; each saved report retains its own module state and meaning. Do not rewrite historical reports to match current defaults.

Product models used by the current integrated runtime: **none**. Codex assisted implementation/documentation; that is development assistance, not the product's AI feature. Historical Qwen/Ollama proposals and separately reviewed model answers do not change this disclosure. Original Heurisko material is Apache-2.0; fixture/upstream/governing material retains its own rights.

Repository changes use reviewed feature PRs with exact-head CI; deployment and release decisions are separate from this operating guide.

## 16. A practical demonstration sequence

1. Open [Captured reports](https://heurisko.onrender.com/workspace/reports). Explain the public read-only banner and capture times.
2. Open the inert picocolors mutation, show six independent outcomes and the 16 findings. Follow the lifecycle finding into its exact artifact span/source absence. Explain that the marker is inert and never executed.
3. Open ts-pattern and zod. Contrast complete raw coverage with incomplete analysis and unknown source scope. Explain why zero findings is not a safety assessment.
4. With local tools installed, open the same deterministic report in the CLI and TUI using section 6.1. Show that report/evidence identity is shared across interfaces.
5. Start the local browser with the saved report/store pair. Show Files/Source/Coverage and export/reopen with the format/omission distinction.
6. If the parser is ready, run a **new**, explicitly labeled local replay from section 6.2 or a fresh exact npm investigation. Show actual stage progress and the resulting limitations; do not imply the public server ran it.
7. State the unfinished capabilities plainly: product-model inference, monitoring, verified provenance/policy and rebuild are unavailable. Present this as an implemented static investigation foundation with three local interfaces and a public captured-evidence explorer.

For deeper source-backed detail, the canonical entry points are [CLI reference](docs/CLI%20Reference.md), [TUI README](packages/tui/README.md), [web README](apps/web/README.md), [reviewed module admission](packages/intelligence-reviewed/README.md), [examples index](examples/README.md), [Render record](docs/Render%20Deployment.md) and [contributor context](AGENTS.md).
