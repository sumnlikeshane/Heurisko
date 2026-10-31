# HEURISKO — Phase 05: Security, Isolation & Release Monitoring

**Version:** 0.1.0
**Approval record:** Explicitly confirmed by Shane, 31 October 2026. Unmeasured values remain open.  
**Date:** 31 October 2026  
**Status:** APPROVED — design/policy only, not implementation  
**Depends on:** Approved Phase 01 v0.2.0, Phase 02 v0.2.0, Phase 03 v0.1.0 and Phase 04 v0.1.0  
**Primary owner:** Shane (acquisition/runtime boundaries, local store, monitoring); **co-owner:** Malhar (untrusted model inputs, rebuild explanations and adversarial testing)  
**Scope note:** This is *decision-review Phase 05*, not the engineering roadmap's P5 milestone. It defines required operating/security behavior, not evidence that a sandbox, scheduler or monitoring deployment has been created.

## Objective

Set explicit rules for safely investigating potentially hostile published archives, limiting any execution to a verified isolation boundary, maintaining useful local evidence, and detecting newly published versions of selected packages without silent loss or duplicate work. **Monitoring is required for complete Problem 04; continuous cloud hosting is not.** Normal static investigations must remain useful when rebuild execution or AI is unavailable.

## Proposed operating model

```text
User or scheduled poll -> bounded, registry-qualified acquisition -> immutable local artifact
                           |                                  |
                           |                                  v
                           |                         non-executing static analyzer
                           |                                  |
                           v                                  v
                     durable watch store -> idempotent analysis queue -> versioned report
                                                                         |
                                               optional isolated Linux rebuild (explicit)
                                                                         |
                                              evidence-linked report: CLI / TUI / web
```

The optional rebuild is never a hidden stage of simple file inspection. Model interpretation is similarly bounded and cannot execute downloaded code.

## P5-01 — Trust boundaries and threat model

**Recommendation: Treat downloaded packages, archives, repository files, metadata and model-readable text as untrusted.**

- Separate registry/HTTP input, local archives, source tree acquisition, archive decoding, parsing, external verification wrappers, optional build execution, AI inference and UI rendering into explicit trust boundaries.
- Assume hostile archive names/links, decompression bombs, malformed parsers, executable lifecycle scripts, misleading Git/source metadata, prompt-injection text and resource-exhaustion attempts are possible.
- The normal analyzer must not run software being investigated, require privileged host access, or expose local secrets to packages/model inputs.
- All findings retain the user-visible analysis coverage/limitations required by approved Phase 04.

**Evidence for acceptance:** threat matrix maps every boundary to attack, preventive control, test and failure/reporting state.

## P5-02 — Static acquisition must never execute package code

**Recommendation: Download the exact registry tarball or user-selected local archive as data.**

- Use registry-qualified npm metadata, verify actual downloaded bytes and inspect tarballs without running `npm install`, `npm ci`, package lifecycle scripts, repository hooks, `npm pack` on an untrusted checkout, or arbitrary local scripts in the static path.
- Source checkout/download must not trigger hooks, install dependencies, invoke package scripts or run arbitrary Git helpers from untrusted metadata.
- If a package cannot be investigated statically, record the unsupported portion; do **not** change the trust boundary silently.
- An explicit isolated rebuild is a different operation and must be logged as such.

**Why:** npm documents `prepack` and `prepare` lifecycle scripts for packing, and install scripts for installation. `npm pack` is not a generic safe substitute for fetching an existing registry archive. [npm scripts](https://docs.npmjs.com/using-npm/scripts.html)

**Evidence for acceptance:** a fixture with lifecycle scripts is statically analyzed without those scripts being invoked.

## P5-03 — URL, archive and resource containment

**Recommendation: Bounded parsing with no filesystem escape.**

- Registry acquisition uses explicitly allowed HTTPS endpoints and validated redirects; any user-supplied source/artifact URLs are not arbitrary privileged network fetches. Define and test allowed hosts and URL forms rather than trusting metadata-supplied targets.
- Bound compressed download bytes, extracted bytes, member count, per-member size, nesting/path lengths, parsing time and concurrent work. Threshold values must be configuration-defined, tested and published with the supported environment before release; do not invent them in this decision document.
- Reject or safely represent `../`, absolute paths, symlinks/hardlinks that escape a workspace, duplicate/conflicting paths and special filesystem entries. Prefer archive inventory without extraction when feasible.
- Treat path collisions, decompression attacks and malformed metadata as an acquisition or analysis limitation with preserved error details, not an empty clean comparison.
- Prevent binary/text parsers, source maps and model-input assembly from consuming unbounded CPU, RAM or context.

**Evidence for acceptance:** traversal/link, decompression, duplicate-path, oversized-member, timeout and parser failure tests; no host-file writes outside the controlled workspace.

## P5-04 — Strictly isolated, opt-in rebuilds

**Recommendation: Rebuilds are optional evidence-gathering jobs inside a disposable restricted Linux worker.**

- Never run build/install/prepare scripts on Shane's macOS host or the evaluator's host as a silent fallback.
- Require an independently configured disposable Linux sandbox/microVM or evaluated equivalent; merely running a Docker container does not establish adequate isolation.
- An approved worker must use non-root execution where possible, minimal capabilities, restricted syscalls, dedicated writable scratch, no host home/project mounts, no Docker daemon socket, no SSH/cloud credentials, and no unrestricted host filesystem or devices.
- Separate dependency acquisition from build execution. Execution uses an explicitly recorded network policy, preferably no egress; a build needing extra network privileges becomes unsupported unless deliberately authorized under a reviewed recipe.
- Bind each rebuild to an explicit source snapshot, toolchain, environment, dependency inputs, recipe and output comparison criteria. Use time/memory/CPU/process/storage limits, kill the entire job on timeout and remove scratch state.
- A failed or missing isolation mechanism means **skip rebuild / mark incomplete**, not run locally without restrictions.

**Evidence for acceptance:** attempted filesystem escape, network access, privilege escalation, timeout and cleanup tests pass before any hostile test-case execution. Docker's documentation describes daemon, host-mount and privilege risks; rootless mode mitigates some risks but is not by itself a universal security proof. [Docker Engine security](https://docs.docker.com/engine/security/) [Rootless mode](https://docs.docker.com/engine/security/rootless/)

**Open implementation choice:** exact Linux VM/microVM/container runtime and its compatibility on the available macOS/Linux evaluation machines; no unsupported sandbox is deemed approved.

## P5-05 — Model and UI containment

**Recommendation: Untrusted package text must remain data, never instructions or active UI content.**

- Malhar's RAG/model adapter receives bounded evidence snippets, clearly distinguished from system instructions. It cannot invoke shell, network, filesystem-write, package install or rebuild tools.
- Validate model responses against Phase 04 evidence records, including references, real source spans and unsupported verification claims.
- The terminal escapes control sequences, filenames and content; the browser escapes source code and never renders extracted SVG/HTML/Markdown as active trusted content.
- Do not transmit private host files, local secrets or unapproved input contents to inference services; the selected open-weight/organizer runtime must match approved Phase 01 constraints.
- Malicious comments, prompt injection, model timeout and model OOM must leave deterministic evidence intact.

**Evidence for acceptance:** prompt-injection, fabricated-reference, terminal escape and active-content rendering fixtures produce no command execution or trusted-content execution.

## P5-06 — Local persistence and evidence lifecycle

**Recommendation: Local-first durable store; no implicit public reporting.**

- Use a local metadata/job database (SQLite is the preferred candidate) with content-addressed artifacts and report/evidence manifests; keep temporary job workspace separate from retained evidence.
- Treat saved reports as immutable evaluations. Preserve actual artifact/source/report identities, schema/policy versions, evidence references and capture times; do not silently refresh a historical report.
- User-requested export is explicit; sharing/public hosting is **off by default**. Local imported archives and their evidence are not automatically uploaded.
- Support listing and deliberate deletion of reports/watches, including referenced evidence with clearly explained effects. Handle cache eviction without leaving dangling links disguised as preserved proof.
- Clean temporary extraction and failed/rebuild scratch workspaces, subject to clearly identified diagnostic retention rules. Failures must not leave uncontrolled large files.
- Exact retention duration, storage cap, backup/recovery objectives and deletion SLA are **still open operational parameters**; propose and validate them against actual disk use and target deployment rather than silently adopting a production promise.

**Evidence for acceptance:** reopen persisted report offline, preserve its source/digest context, delete intended local data, and distinguish retained/cached/missing evidence.

## P5-07 — Monitoring selection and release identity

**Recommendation: Selected-package monitoring is a real analyzer workflow, not an activity-feed mockup.**

- Users explicitly add a registry-qualified package to a local watchlist. The watch stores package identity, release-selection policy (including whether prereleases are in scope), most recent successful check and per-artifact processing state.
- Poll npm metadata through the registry adapter. Detect exact new versions/releases, resolve each selected artifact and apply the shared engine to its immutable artifact bytes.
- Deduplicate by immutable artifact identity, not merely package `latest` tag, timestamps, or mutable dist-tags. If a previously seen release appears with inconsistent digest/metadata, record the anomaly rather than silently treating it as another normal new release.
- Monitor only explicit selected packages; no uncontrolled whole-registry scanning, automated posting to maintainers or speculative project comments.
- The first baseline scan should be clearly distinguished from release changes discovered after monitoring was enabled.

**Evidence for acceptance:** a watch discovers and analyzes a newly introduced artifact while preserving the initial/baseline distinction.

## P5-08 — Scheduler and truthful uptime semantics

**Recommendation: Provide both on-demand polling and an explicitly configured recurring runner.**

- `heurisko watch run --once` performs exactly one bounded check cycle and exits with a useful outcome.
- Automatic monitoring uses the **same** command through an explicit scheduler such as cron, CI scheduled workflow, or a controlled long-running local process. Do not require a hosted account or cloud service to satisfy the basic monitoring design.
- A CLI/TUI watch running only during a foreground process is **not** advertised as continuously monitored once that process ends.
- Show scheduler mode, last attempt, last successful check, last discovered release, next expected check (only when actually configured/knowable), and stopped/stale/unconfigured state.
- Poll cadence, timezone, scheduler host and whether prereleases are included are explicit watch/host settings. **Proposed default:** do not claim any automatic checks until a recurring runner is configured; offer a documented scheduler example. Exact cadence remains a user/host choice.

**Evidence for acceptance:** in a deterministic scheduler/clock replay, new releases are discovered on a recurring schedule; stopping the scheduler produces an honest stale state.

## P5-09 — Durable queue, retries and recovery

**Recommendation: At-least-once discovery with idempotent processing and visible failure.**

- Persist a discovery/checkpoint and a deduplicated investigation job **before** reporting successful scheduling. Use stable idempotency keys tied to exact ecosystem/package/version/artifact identity.
- Record separate states for polling (`never checked`, `checking`, `successful`, `failed`), discovery (`seen`, `new`, `changed metadata`) and analysis (`queued`, `running`, `complete`, `incomplete`, `failed`). Final enum names remain schema work.
- Use bounded retry and backoff for transient registry/network failures and report persistent errors. Do not retry parsing failures indefinitely or silently lose failed analyses.
- Survive process termination before/after artifact discovery and job commit. Resume or reconcile interrupted jobs without duplicating completed reports.
- Respect registry rate limits and bounded concurrency. A failed check is not shown as an up-to-date successful poll.

**Evidence for acceptance:** replay duplicated registry responses, rate limiting, lost network, restart at multiple persistence points and a failed analysis. A new artifact ends with one durable investigation result and visible retry/failure history.

## P5-10 — Failure behavior and operational visibility

**Recommendation: Honest partial results, no reassuring failure states.**

- Treat artifact digest failure, source unavailable, provenance missing, unsafe archive, parser failure, unavailable sandbox, model failure and monitor outage as different events.
- Preserve evidence that was successfully produced; display the failed/incomplete stage and precisely scoped coverage.
- Emit structured errors for CLI/CI, readable explanations for TUI/web and useful local diagnostics without leaking private paths, tokens or unrelated user data.
- Support safe cancellation that preserves a resumable checkpoint or explicit canceled/incomplete state.
- Monitor health reflects scheduler and registry checks, not just whether a watchlist entry exists.

**Evidence for acceptance:** end-to-end partial investigations and monitor failures are displayed as such in all interfaces; no failure results in an unsupported favorable verdict.

## P5-11 — Deployment, hosting and operational limits

**Recommendation: Local-first and bounded; hosted execution is a separate later approval.**

- Core CLI/TUI, static investigation and local watch storage do not require accounts, remote job submission or browser hosting.
- Users may schedule their own checks locally or via an explicit CI runner. An organizer model server may provide AI inference only if its actual model/data policy is confirmed and satisfies Phase 01.
- Do not operate an anonymous public endpoint accepting arbitrary package URLs or rebuild jobs without explicit abuse limits, isolation, quotas, data retention, incident ownership and budget approval.
- Measure actual CPU, memory, disk, duration, inference and registry usage before setting public resource/SLA claims.
- Numerical storage caps, concurrency, poll intervals, recovery point/time objectives, deletion deadlines and incident responsibilities remain **open** for specific deployment profiles; record their absence honestly rather than inventing production defaults.

**Evidence for acceptance:** documented local operation and unsupported hosted scope; no hidden keys, network-dependent mandatory login or unbounded job submission.

## P5-12 — Verification plan, ownership and phase completion

**Shane owns:** downloader/safe-archive boundaries, source acquisition without execution, optional isolated-worker integration, local durable store, watch selection, polling, idempotency, retries, CLI/TUI status and failure visibility.

**Malhar owns:** bounded evidence selection, model-instruction separation, explanation/citation validation, build-evidence interpretation, AI/failure simulations, participation in isolation and adversarial review.

**Joint acceptance scenarios:**

1. `postinstall`/`prepack` fixture inspected statically with zero lifecycle execution.
2. Traversal/symlink/zip-bomb-like archive fails safely; no workspace escape.
3. Optional rebuild without a verified sandbox is skipped and accurately labeled.
4. Contained rebuild tries network and filesystem escape; policy blocks and logs attempts (before testing truly hostile real code).
5. Malicious source comment tries prompt injection; AI cannot execute instructions or override verified observations.
6. Original registry tarball and local tampered copy retain different artifact identities and provenance outcomes.
7. Watch discovers a newly published version exactly once under repeated metadata responses.
8. Persisted watch survives restart before/after queue commit and retains failure/retry history.
9. Missing poll, stopped runner and registry outage appear stale/failed rather than “monitored now.”
10. Offline report is readable with capture timestamp and explicit absent cache material.
11. Existing report, TUI, CLI and web show identical findings/limitations after an AI or rebuild failure.
12. Real scheduled monitoring scope is demonstrated; a fake registry/clock fixture is clearly identified as simulated while resulting analysis is real.

### Phase 05 approval conditions

The accepted P5-01–P5-12 operating model requires:

- Static operations never execute package/repository code.
- Untrusted builds use an isolated worker or are explicitly unsupported.
- Archive/URL/input/resource limits are enforced, with precise values to be frozen before shipping.
- Reports/watches have durable local persistence with no default public upload.
- Monitoring has an explicit scheduler contract, stable artifact identity, deduplicated jobs and visible stale/failed status.
- Failures/partial coverage do not become favorable security conclusions.
- The team owns the listed verification evidence and does not claim completion before tests have run.

### Open implementation parameters (not silently approved)

- Exact download/expanded-size/member/time/CPU/RAM/concurrency limits for each supported execution profile.
- Verified Linux sandbox technology and resource policy; Mac compatibility and host isolation test result.
- Trust-policy verifier/runtime versions and platform support (already left open in Phase 04).
- Storage/retention/backup/deletion values and incident owner for any future hosted product.
- Schedule cadence, default release channel/prerelease policy and scheduler deployment host.
- Supported reporting/notification channel beyond local CLI/TUI/web.

**Approval state:** P5-01 through P5-12 are explicitly APPROVED by Shane on 31 October 2026. This closes the design phase, not implementation or security certification.

## Source basis and cross-checks

- `HEURISKO_RESEARCH_BASELINE.md`: static package safety boundary, threat model, registry/source semantics, reporting limits, mandatory release monitoring and organizer constraints.
- `HEURISKO_PRODUCT_DEFINITION.md`: account-free CLI/TUI/web, explicit watch workflow, local evidence, no hostile host execution, bounded AI.
- `HEURISKO_IMPLEMENTATION_ROADMAP.md`: P1 archive safety, P3 isolated rebuild gate, P5 monitoring/restart/duplicate tests, P6 evaluation.
- `HEURISKO_FOUNDER_DECISIONS.md`: proposed isolation/monitoring/hosting alternatives, now constrained by approved Phase 01–04 principles.
- External primary documentation consulted for technical feasibility: [npm lifecycle scripts](https://docs.npmjs.com/using-npm/scripts.html), [Docker Engine security](https://docs.docker.com/engine/security/), [Docker rootless](https://docs.docker.com/engine/security/rootless/), [npm registry metadata](https://github.com/npm/registry/blob/main/docs/responses/package-metadata.md). These are references, not claims that Heurisko's runtime or security controls have been tested.
