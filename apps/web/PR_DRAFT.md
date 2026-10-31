# Local PR draft — not published

**Historical first-slice draft:** retained for context. The current authorized complete-workspace handoff is [HANDOFF_CURRENT.md](../../docs/HANDOFF_CURRENT.md); PR #3 will carry the current scope and validation.

Intended feature branch: `web/local-evidence-explorer`, assembled from reviewed foundation `81346271f5a3789b4b43fd8f379014656011823d`. The active checkout remains on `docs/share-research-with-team`; no branch switch, staging, commit or push was performed. Preserve the other dirty S4 material and the visual worktree. Copy only the reviewed web additions and incremental shared-file edits into a future isolated feature assembly; retain the handoff's byte-preserving Git attributes.

Proposed commit message: `feat(web): add local terminal-style evidence explorer`

## What this PR does

Adds `apps/web`, a local React/TypeScript viewer that opens explicitly supplied original reports, presents six stored outcomes and historical identities, and navigates raw changes, source/provenance, coverage and exact hash-checked evidence. Its near-black monospace panes and cyan interaction accents follow the terminal preference direction. Stored findings/AI records render without recomputing conclusions. A loopback-only read service uses per-session capability, exact Host/Origin/fetch-site and route/query controls, fixed static assets, inert rendering and bounded reads. Explicit directory export/import preserves original bytes and distinguishes transport omissions.

Registers the app in the pnpm workspace, exactly locks React/ReactDOM 19.1.8 plus types/esbuild, retains third-party notices, adds `web`/`test:web` and a web CI job, and documents actual portable examples and limitations. Core/contracts/CLI/candidate-reader/TUI source is unchanged. No new acquisition, analysis, model, monitor, verifier, rebuild or hosting is introduced.

## Models the product uses in this PR

none

## AI coding assistants that helped write it

Codex

## How we tested it

- Workspace `pnpm run typecheck` (includes all builds): pass.
- `PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts`: full schema/semantic fixtures, negative cases and synthetic handshakes pass.
- `pnpm --filter @heurisko/web build` and `typecheck`: pass after the web-only manifest decoder fix.
- `pnpm --filter @heurisko/web test`: 15 pass, including local service/transport boundaries, original report identity, exact mutation spans, accepted synthetic states, inert rendering and the actual 740-blob monorepo regression.
- `node --test integration/part4/tests/readiness.test.mjs`: all 24 pass.
- `node apps/web/tooling/verify-corpus.mjs examples/web/current`: four real historical reports export/reopen byte-for-byte and match CLI JSON; all exported references included, no omissions. CLI exit 2 remains intentional.
- `git diff --check` and scoped docs/links: checked in the validation receipt. A pre-existing repository documentation anchor failure is recorded separately.

Browser QA is partial: initial wide Chrome overview/file navigation observed; later native automation became unreliable. Exact viewport/200%-zoom/full keyboard/evidence/offline checks remain unverified. TUI parity and newly integrated finding/AI navigation depend on the other lanes. No remote web CI pass, W/G3/G5 acceptance, final UI design approval or delivery is claimed. Existing acquisition/Docker suites were not rerun for this reader-only slice. Product/model/monitor completeness is unchanged.

Commit, push and PR publication require new concrete user approval. Merge, deployment and external submission have not been authorized.
