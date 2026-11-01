# Heurisko contributor and agent instructions

These instructions apply to the whole repository. Heurisko is an actively maintained product owned by Shane Joseph. Preserve historical contributor attribution. Start with [the documentation index](docs/README.md); source and executed checks establish behavior.

## Authority and current scope

- The current user request defines authorized work, including necessary local investigation, implementation, tests, documentation and review. Finish that scope without asking again at each step or session boundary.
- [The roadmap](PRODUCTION_MASTER_ROADMAP.md) owns priorities and phase outcomes. [The Phase 1 plan](docs/Production%20Phase%201%20Implementation%20Plan.md) owns current work and blockers. **Phase 1 remains open.** Workflow repair does not authorize completing it or implementing future features.
- [Decisions](docs/Approved%20Decision%20Register.md) own durable requirements/amendments; [the foundation contract](docs/production-phase1/Foundation%20Contract.md) owns architecture and trust boundaries. Schema/types/semantic validators in `packages/contracts` are the executable report contract.
- Historical plans, prompts, ownership splits, deadlines, audits and past publication approvals are context, not active instructions or reusable authorization. [Historical index](docs/HISTORY_INDEX.md).

## Git, publication and preservation

**Do not commit or push without explicit user approval covering the concrete change set and action.** Commit approval does not imply push approval. PR publication, merge, release, deployment, submission and external messages also need explicit authorization. Use approval already given for that exact scope without asking again.

- Prepare the complete local result and validation before seeking outstanding publication approval. Present intended feature branch, scope, checks, limitations and proposed commit message. Local completion and publication are separate statuses.
- Use feature branch → PR → passing CI on the exact final head → approved merge. Retain this engineering rule beyond the hackathon. Do not commit/push directly to `main`; preserve the declaration commit and existing history.
- Inspect `git status --short --branch` and relevant diffs before editing and delivery. Preserve unrelated changes, index, worktrees and untracked inputs. Isolate checks when needed to avoid mixed source identities; never discard work for a clean tree.
- Never force-push, rewrite history, blanket-stage, bulk-delete untracked files, or erase stores/locks as cleanup.
- Preserve original reports, bundles, blobs, logs, machine-readable receipts, fixture licenses/notices and hash-pinned imports. New runs use fresh destinations. Narrative navigation may be reconciled without changing recorded results or implying a rerun; preserve checksum-bound narrative snapshots too.

## One development workflow

1. **Identify and scope:** inspect source, the owning backlog item and relevant evidence. State outcome, exclusions, dependencies and observable acceptance in the existing phase plan or roadmap section. Small fixes need a short item, not another plan.
2. **Implement:** finish authorized scope, including necessary local repairs and documentation. Routine choices, reversible edits and relevant tests need no extra approval. A blocked check does not stop independent work.
3. **Validate:** use the matrix below and capability-specific acceptance. Record source identity, environment, commands, results and limitations. Reproduce meaningful defects where feasible. Preserve failures; a retry alone does not resolve an unexplained failure.
4. **Review and accept:** inspect the assembled diff and documented journey. Implementation, tests, documentation and required human review belong to the same work item. Owner acceptance closes a phase; passing tests alone do not. Required work remaining means the phase stays open.
5. **Release when authorized:** prepare the concrete feature PR and exact-head CI evidence. Release/deployment has separate authorization, identity, rollback and operating evidence. A local task can finish while publication remains pending.

Ask when required information cannot be found, scope materially changes, a product/trust/compatibility rule changes, new paid/external operation or sensitive data use is needed, or unauthorized publication is next. Explain the specific decision and continue independent work. Do not add blanket phase-start approval, repeat-research or one-part-per-session gates. Respect explicit pauses/stops.

For a blocker record the exact capability/check, evidence, resolution condition, owner/access needed and independent work still possible in the owning item. Distinguish environment restriction, product defect and authorization boundary. Never invent a pass, lower acceptance or close the phase around a blocker.

## Product and safety invariants

- One exact artifact, immutable source candidates, shared engine/report across CLI/TUI/web and future integrations. Keep six outcomes and AI state independent. Hash match, signature, reproduced bytes, zero findings and exit 0 do not mean safe.
- Preserve original bytes, full digests, source commit/subtree/build context, cited member/range, capture time, code/configuration identity, conflicts, residuals and omitted scope. Reopen is historical; reanalysis creates a new observation. Modified local input inherits no registry/provenance success.
- Static analysis never installs/imports/executes target packages, hooks, build metadata or scripts. Bound network destinations, redirects, archives and parsing; render content inertly. Preserve admitted parser limits and fail-closed recovery. No host parser fallback, broader mounts, secret access or guessed lock release.
- Rebuilds require a separately reviewed restricted execution boundary. Hosted writes require an admitted worker/privacy/abuse design. Current hosting is a fixed read-only catalog; loopback authority is not public authentication.
- `packages/intelligence-reviewed` is the deterministic runtime; `packages/intelligence` is inactive development source. No model/provider activation or content-selected executable code. Models have no execution, source-selection, verification or verdict authority. [AI intake](docs/production-phase1/AI%20Source%20Intake.md).
- Use public lawfully retained evaluation data and inert local mutations. Preserve third-party rights; Apache-2.0 covers original material. Dependency/tool/model admission needs exact released identity, compatibility, security, rights and meaningful fixture checks.
- Before TUI design work read [the design reference](docs/Design/TUI%20Design%20Contract%20v1.0.0.md). Preserve 59 confirmed directions; final design freeze requires explicit acceptance of a named version.

## Setup and validation

Use Node **22.23.4**, pnpm **10.14.0**, Python **3.13** and hash-locked requirements. [Setup and operation](HEURISKO_COMPLETE_GUIDE.md#5-install-and-build-locally) covers parser prerequisites, retained viewing and recovery. The ambient shell is not evidence of compatibility.

| Change | Checks after setup |
|---|---|
| Documentation/workflow | `pnpm run check:docs`; web build/tests for compiled docs or navigation; `git diff --check` |
| Contracts/core/CLI | `pnpm run typecheck`; `PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts`; affected core tests; serial full core and real parser proof for isolation/lifecycle changes |
| Reader/TUI | Build, `pnpm run test:s4`; relevant real PTY journeys for keyboard/render changes; historical report parity |
| Web | Build/typecheck, `pnpm --filter @heurisko/web test`; real browser journeys for UI changes; API/SSR is not GUI/AT acceptance |
| Development intelligence | Build/offline tests and `node scripts/verify-intelligence-intake.mjs`; no credentials/model calls |

Core parser suites run serially: `node --test --test-concurrency=1 packages/core/tests/*.test.mjs`. Match checks to behavior; do not repeatedly run acquisition suites for prose. Test counts are not permanent acceptance definitions. [CI](.github/workflows/ci.yml) defines actual jobs. Exact proposed-head CI awaits authorized publication.

## Maintain documentation

Update the owning reference, affected usage guides and item status/acceptance in the same change. Keep AGENTS.md for durable instructions, not chronology. Do not create a handoff, continuation note or audit plan at every stop. Record durable choice changes in the decision register.

Extract active instructions and unresolved findings before retiring superseded prose; reconcile links, then remove it. Archive only evidence with a specific retention need; use exact Git history for obsolete plans. Record completed dispositions in [the existing ledger](docs/production-phase1/Document%20Disposition.md). Verify research hashes without rewriting the snapshot. Finish with changes, actual checks, limits and local/publication status.
