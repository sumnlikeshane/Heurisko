# Current workspace handoff for Malhar

Updated 1 November 2026, Asia/Kolkata. Shane approved one new checkpoint commit, feature-branch push and PR update for the current webapp and integrated workspace. This continues draft PR #3 on `handoff/s1-s3-audit-fixes`; no main merge, deployment, submission or external message is included. Earlier no-publication statements in historical receipts describe those earlier tasks.

## Get the complete checkpoint

From an existing clone, first preserve your own uncommitted work and inspect status. Fetch the handoff branch and create your own continuation branch:

```sh
git fetch origin handoff/s1-s3-audit-fixes
git switch -c malhar/webapp-continuation origin/handoff/s1-s3-audit-fixes
```

A merge into main is not needed to work from this checkpoint. Do not force-push or overwrite another contributor's branch. [PR #3](https://github.com/sumnlikeshane/Heurisko/pull/3) is the shared review/CI entry point. [Validation](../examples/current-handoff/validation.json) describes this assembly; the PR supplies the eventual exact-commit remote result.

## Set up and run

Use Node **22.23.4** (`.nvmrc`), pnpm **10.14.0**, Python **3.13**, and the pinned validator dependencies. Run from the repository root:

```sh
pnpm install --frozen-lockfile --ignore-scripts
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-contracts.txt
pnpm run typecheck
PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts
pnpm web --report examples/handoff/current/B1.report.json --store examples/handoff/current/store --report examples/handoff/current/B2.report.json --store examples/handoff/current/store
```

Open the private loopback URL printed by the launcher. Each process has its own in-memory capability; do not commit or share that URL publicly. Home and documentation work without analysis. Reports can be opened from startup pairs, selected report/portable files or the fixed workspace content reference. Missing report-only evidence stays explicit.

Actual npm/local investigations also need the existing Docker static parser. Follow [root installation](../README.md#installation-and-execution) for the admitted image and controls; never install or run target packages on the host. `pnpm web` opens the empty workspace. `node packages/cli/dist/index.js` opens the TUI in a TTY; redirected execution uses explicit analyze/inspect commands. Useful incomplete reports deliberately exit **2**.

## What is included

- `apps/web/`: Home, 15-page searchable sidebar documentation, exact npm/local investigation review/start, actual progress/cancel requests, Jobs/Reports context, immutable evidence exploration, original report/bundle downloads and portable export/reopen. Internal-link and scrolled-Analyze navigation repairs are included.
- Shared core/CLI/contracts and the integrated product TUI, including parser-removal absence confirmation, retained review snapshots and stricter uncertain-job teardown. The earlier Linux cross-UID readability fix and byte-preserving Git attributes remain included.
- Approved scope/plans, design candidate, CLI documentation, actual public captures, labeled inert mutations, retained local/model-off handshakes, historical validation and current receipts. Original M0/M1 attachments are not product source or newly adopted modules.
- Exact lockfile/workspace wiring, notices and CI. The separate experimental TUI worktree, installed dependencies, build output, private stores, tools and scratch are excluded. Authored product TUI source is included, with the [completed visual rework](Part%204%20TUI%20Visual%20Audit.md) and [249-check PTY receipt](../integration/part4/receipts/visual-rework/validation.json). Human visual acceptance remains open.

Delivery copies of 30 historical metadata/log files remove machine-specific paths; [redaction ledger](../examples/current-handoff/publication-redactions.json) records original and delivered digests. Original local files are preserved. No raw report, bundle, archive or content-addressed blob is rewritten. Retained evidence remains subject to upstream rights and its recorded capture time.

## Continue the webapp

Read [AGENTS.md](../AGENTS.md), [current web continuation](WEB_CONTINUATION.md), [single gap plan](Web%20Application%20Gap%20Plan.md), [product scope/parity map](Web%20Application%20Product%20Scope.md), [CLI reference](CLI%20Reference.md) and [web README](../apps/web/README.md). Source is `apps/web/`, not `webapp/`. W2–W4 implementation already exists; start from acceptance and dependency intake rather than repeating the first slice.

1. Complete the actual browser matrix: viewport/reflow/200% zoom, keyboard and nested evidence focus/Back, clipboard, GUI file/download/import, screen reader and external-offline reopening. Chrome automation was blocked by `ERR_BLOCKED_BY_CLIENT`; Shane confirmed only the specific scrolled-Analyze repair in Arc. Do not weaken browser protections or label API tests as browser acceptance.
2. Integrate genuine heuristics/build/model/verifier/policy/monitor work only through the shared engine and reviewed contracts, with exact code/config/model identity and actual evidence. Current default investigations still have unavailable analysis/model and unresolved policy. Existing M0/M1 handshakes or synthetic fixtures do not adopt that code into the product.
3. Preserve original report bytes, six independent outcomes, immutable source/capture identity, coverage/omissions, inert content, in-memory authority, fixed server-owned storage and uncertain-job records. The browser renders shared facts; it must not invent verdicts or clean up unknown parser jobs.
4. Keep subsequent changes on your feature branch, validate meaningful changed behavior, and use reviewed PRs with passing CI. This checkpoint approval does not authorize future pushes, merges or deployment.

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

[Current validation](../examples/current-handoff/README.md) separates checks run for this handoff, immutable historical receipts, browser limits and remote CI. Source changes require new receipts/destinations. Product models used by this checkpoint: **none**. Coding assistance: **Codex**.
