# Browser investigation continuation receipts — 1 November 2026

These records are separate from the immutable [first-slice viewer receipts](../web/current/README.md), S1–S3/audit/handoff captures and the separate TUI worktree. They contain public package/source evidence only. Original upstream bytes retain their licenses; portable manifests include rights notices. No analyzed package is installed or executed, and no product model is used.

## Final source-bound check

[Final verification](2026-11-01-final/verification.json) binds source and compiled application hashes before/after actual HTTP/engine execution. [Validation](validation.json) records commands, results and browser limits. Use the app [README](../../apps/web/README.md) and [continuation prompt](../../docs/WEB_CONTINUATION.md) for setup and next work.

Two real static-engine cases are retained:

- [Local replay](2026-11-01-final/local-replay.report.json): selected original `picocolors@1.1.1` archive and selected source snapshot with user-asserted full commit; local identity, 19 raw changes, no findings, requested policy indeterminate and exit 2. An [independently produced CLI report](2026-11-01-final/local-cli.report.json) has the same deterministic report digest. Replay is a new current-engine parse, not fresh registry acquisition or verified commit binding.
- [Exact npm](2026-11-01-final/npm-exact.report.json): real public registry/source acquisition for `npm:picocolors@1.1.1`, with new observation times, matched registry digest, retained source conflicts, 19 raw changes, no findings and exit 2. Advertised material remains unverified; provenance is `not_checked`.

For each case, the receipt checks browser API report bytes against the returned content digest, shared outcomes and real bundle download, CLI `inspect` report parity, overlapping exact evidence bytes against CLI `--evidence`, portable download/upload/reopen, and workspace content-digest reopen. Portable manifests have zero omissions in these cases. Directory transport regression independently rechecks the four historical B1/B2/B3R/local-mutation reports in a fresh ignored destination. No browser GUI or complete P04 acceptance follows from an API/CLI receipt.

The [preliminary run](2026-11-01/verification.json) is retained unchanged. Its actual local/npm API/CLI checks passed, but web source was refined while that exploratory run was active and its source inventory was collected only at completion. It is **not** the final source-bound acceptance receipt. The final run rejects source/build changes during execution and uses the rebuilt final application.

## Browser acceptance and broader limits

Chrome's existing Heurisko tab was selected and navigation attempted to the private loopback URL. Chrome displayed **`ERR_BLOCKED_BY_CLIENT` before rendering**. Browser security settings were not weakened. Therefore exact viewport widths, 200% zoom, keyboard/focus/back-state, browser-offline reopening, real form/file-chooser/download interaction and observed browser request/execution containment remain unverified. The live service is independently reachable over local HTTP. This is a concrete browser-access limitation, not a renderer or pipeline pass.

Web automated tests cover original reader/security/transport behavior plus full built CLI documentation coverage, strict mutation admission, exact/scoped options, missing/invalid inputs, truthful progress/settlement/cancel/no-report errors, opaque uploads, report/bundle export, dynamic reopening, corruption/traversal rejection and genuine scoped-monorepo browser transport. Synthetic injected-engine tests are labeled by their test setup; they do not stand in for the two real engine cases above. Cleanup is reported as `not_observable`; no fixture or settled response proves removal of all parser jobs.

The continuation adds Home, full sidebar docs and supported browser input/output flows. Genuine heuristics/build/AI, verifier/policy/monitor integration, mandatory TUI parity, durable browser job resume/retry, shared review and remote web CI remain open. Standalone bundle-to-report import and arbitrary host-store selection are unsupported. Optional search/discovery and later PyPI/lockfile/compare/SARIF/hosted features remain backlog. Product models: none. Coding assistance: Codex. No Git/publication/deployment/submission was performed.
