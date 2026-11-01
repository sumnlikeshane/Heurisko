# Current workspace handoff for Malhar

Updated 1 November 2026, Asia/Kolkata. Shane authorized finishing the current Malhar integration, committing the reviewed assembled workspace and pushing feature branch `handoff/s1-s3-audit-fixes` through existing [PR #3](https://github.com/sumnlikeshane/Heurisko/pull/3). Preparation and validation are in progress; this document does not claim the new commit has already been published or passed remote CI. Render deployment preparation is part of the current server-readiness work; no deployed service or hosted-analysis acceptance is claimed. No main merge, submission or external teammate message is included. Earlier no-publication statements in historical receipts describe those earlier tasks.

**Current deterministic default:** new CLI, TUI and browser investigations use the [reviewed module](../packages/intelligence-reviewed/README.md) from full commit `55240e99409ad44cbd6a978f40873ef410cb1861`, through one shared-engine loader and bounded, hash-checked retained-content adapter. [Intake/integration details](Final%20Module%20Intake.md) and [actual integrated output](../examples/final-hour/20261101-053912/integrated-55240e9/README.md) distinguish this adoption from earlier isolated M0/M1 handshakes. `HEURISKO_ANALYSIS_MODULE=off` retains explicit raw-only reproduction. Model/provider execution, monitoring, provenance verification, policy evaluation and rebuild remain unavailable; final finding-quality, human and joint G3 acceptance remain open.

**Historical Linux CI follow-up:** the first complete checkpoint `af78823` passed web/docs CI but producer cleanup confirmation failed on Linux. The corrective follow-up `c08a701` uses a successful all-container query filtered by the acknowledged full ID, shared by normal cleanup and explicit recovery. Any query error, remaining output or non-full ID stays unconfirmed; resource limits and uncertain-job retention are unchanged. [Corrective validation](../examples/current-handoff-linux/README.md) supersedes current-code claims for that first checkpoint; its original receipts remain historical.

[Final assembled validation](../examples/final-integration/2026-11-01/README.md) binds the reviewed publication copy, source hashes and metadata redactions; exact-head remote CI is recorded separately.

The [Render Docker deployment](Render%20Deployment.md) serves a public captured-report explorer; full live investigations continue locally. [Hosted preparation validation](../examples/render-preparation/2026-11-01/README.md) records the exact tested scope. The [runtime follow-up](../examples/final-integration/2026-11-01/runtime-followup.json) records the completed serial cleanup recheck separately from the original retained attempt.

## Get the complete checkpoint

From an existing clone, first preserve your own uncommitted work and inspect status. Fetch the handoff branch and create your own continuation branch:

```sh
git fetch origin handoff/s1-s3-audit-fixes
git switch -c malhar/webapp-continuation origin/handoff/s1-s3-audit-fixes
```

A merge into main is not needed to work from this checkpoint. Do not force-push or overwrite another contributor's branch. PR #3 is the shared review/CI entry point; verify its actual published head before attributing the current integration to it. [Earlier handoff validation](../examples/current-handoff/validation.json) describes the pre-integration assembly. [Final-hour receipts](../examples/final-hour/20261101-053912/README.md) identify the later local integration checks; neither substitutes for the new exact-commit remote CI result.

## Set up and run

Use Node **22.23.4** (`.nvmrc`), pnpm **10.14.0**, Python **3.13**, and the pinned validator dependencies. Run from the repository root:

```sh
pnpm install --frozen-lockfile --ignore-scripts
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-contracts.txt
pnpm run typecheck
PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts
pnpm web --report examples/final-hour/20261101-053912/integrated-55240e9/report.json --store examples/final-hour/20261101-053912/integrated-55240e9/store
```

Open the private loopback URL printed by the launcher. Each process has its own in-memory capability; do not commit or share that URL publicly. Home and documentation work without analysis. Reports can be opened from startup pairs, selected report/portable files or the fixed workspace content reference. Missing report-only evidence stays explicit.

Actual npm/local investigations also need the existing Docker static parser. Follow [root installation](../README.md#installation-and-execution) for the admitted image and controls; never install or run target packages on the host. `pnpm web` opens the empty workspace. `node packages/cli/dist/index.js` opens the TUI in a TTY; redirected execution uses explicit analyze/inspect commands. Useful incomplete reports deliberately exit **2**.

New investigations retain deterministic analysis with `--no-ai`; this checkpoint makes no product model requests. For an explicit reproduction of earlier unavailable-module behavior:

```sh
HEURISKO_ANALYSIS_MODULE=off node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 --no-ai
```

The retained integrated local-mutation output exits **0** with 16 findings while source correspondence stays unresolved, source is user-supplied, provenance is not checked and policy is not evaluated. Exit 0 is completion of its declared static checks, not a package-safety or complete-P04 claim. Historical reports retain their original bytes and outcomes.

## What is included

- `apps/web/`: Home, 16-page searchable sidebar documentation, exact npm/local investigation review/start, actual progress/cancel requests, Jobs/Reports context, immutable evidence exploration, original report/bundle downloads and portable export/reopen. The current near-black overhaul, navigation repairs and immutable observation/upload-byte fixes are included.
- Shared core/CLI/contracts and the integrated product TUI, including parser-removal absence confirmation, retained review snapshots, stricter uncertain-job teardown, Findings/Files/Source repairs and strict report/citation intake. The earlier Linux cross-UID readability fix and byte-preserving Git attributes remain included.
- `packages/intelligence-reviewed/`: the reviewed `55240e9` deterministic rule body, original upstream source and admission ledger. Only terminal reexports were removed; provider/model/runtime modules are excluded from the product import graph. The trusted shared loader and retained-content boundary are included without changing G0's two-argument interface.
- Approved scope/plans, design candidate, CLI documentation, actual public captures, labeled inert mutations, retained local/model-off handshakes, historical validation and current receipts. Original M0/M1 attachments are not product source or newly adopted modules.
- Exact lockfile/workspace wiring, notices and CI. The separate experimental TUI worktree, installed dependencies, build output, private stores, tools and scratch are excluded. Authored product TUI source is included, with the [completed visual rework](Part%204%20TUI%20Visual%20Audit.md), [historical visual receipt](../integration/part4/receipts/visual-rework/validation.json) and [later user-failure repairs](../integration/part4/receipts/user-failures/validation.json). Human visual acceptance remains open.

Prior delivery copies of historical metadata/log files remove machine-specific paths; the [redaction ledger](../examples/current-handoff/publication-redactions.json) records original and delivered digests. Preserve those delivery copies when assembling the new checkpoint and record any new publication redactions separately. Original local files remain preserved. No raw report, bundle, archive or content-addressed blob is rewritten. Retained evidence remains subject to upstream rights and its recorded capture time.

## Continue the webapp

Read [AGENTS.md](../AGENTS.md), [current web continuation](WEB_CONTINUATION.md), [single gap plan](Web%20Application%20Gap%20Plan.md), [product scope/parity map](Web%20Application%20Product%20Scope.md), [CLI reference](CLI%20Reference.md) and [web README](../apps/web/README.md). Source is `apps/web/`, not `webapp/`. W2–W4 implementation already exists; start from acceptance and dependency intake rather than repeating the first slice.

1. Complete the actual browser matrix: viewport/reflow/200% zoom, keyboard and nested evidence focus/Back, clipboard, GUI file/download/import, screen reader and external-offline reopening. [Current native observations](../examples/web-overhaul/current/README.md#actual-browser-observations-and-remaining-acceptance) and Shane's specific Arc navigation acceptance remain limited to their observed builds/journeys. Earlier blocked Chrome automation remains historical. Do not weaken browser protections or label API tests as browser acceptance.
2. Continue finding-quality and actual model/verifier/policy/monitor work only through the shared engine and reviewed contracts, with exact code/config/model identity and actual evidence. The current deterministic default is admitted; actual product model/provider work and the other listed capabilities remain open. Existing isolated handshakes and saved v12 model answers do not establish product inference or general quality acceptance.
3. Preserve original report bytes, six independent outcomes, immutable source/capture identity, coverage/omissions, inert content, in-memory authority, fixed server-owned storage and uncertain-job records. The browser renders shared facts; it must not invent verdicts or clean up unknown parser jobs.
4. Keep subsequent changes on your feature branch, validate meaningful changed behavior, and use reviewed PRs with passing CI. This checkpoint approval does not authorize unrelated future pushes or main merge. Record server preparation separately from actual deployment and observed hosted behavior.

## Validation commands

```sh
pnpm run typecheck
PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts
node --test --test-concurrency=1 packages/core/tests/*.test.mjs
node --test integration/part4/tests/readiness.test.mjs packages/tui/tests/*.test.mjs
pnpm --filter @heurisko/web test
node apps/web/tooling/verify-corpus.mjs .heurisko/NEW_HANDOFF_TRANSPORT
# Requires Docker and public npm/GitHub access; fresh destination only:
node apps/web/tooling/verify-investigation.mjs .heurisko/NEW_HANDOFF_INVESTIGATION
```

[Earlier handoff validation](../examples/current-handoff/README.md) and [final-hour integration receipts](../examples/final-hour/20261101-053912/README.md) separate their own executed checks, immutable historical evidence, browser limits and remote CI. The [Parts 4–6 audit results](../examples/shane-parts456-audit/2026-11-01/validation.json) record the isolated baseline-plus-audit assembly, including shared-reader/TUI **40/40** and web **71/71**. Its retained active-integration build and source-change-guard failures remain failures; those isolated counts do not certify the later integrated workspace. Source changes require new receipts/destinations. Product models used by this checkpoint: **none**. Coding assistance: **Codex**.
