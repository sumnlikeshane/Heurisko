# Security and support

Heurisko is a Phase 1 foundation with owner acceptance granted and remaining technical gates open. The source-checkout workflow pins Node 22.23.4, pnpm 10.14.0 and CPython 3.13. macOS arm64 has local evidence and Linux amd64 now has [native CI evidence](examples/production-phase1/2026-11-01-native-linux-3521e1c/review.json) at `3521e1c`. The [Phase 1 plan](docs/Production%20Phase%201%20Implementation%20Plan.md) tracks current PR-head checks and remaining rights holds. Windows and other runtime/architecture combinations have no support claim. There is no maintained published release line or guaranteed fix window yet.

## Report a vulnerability privately

The selected disclosure route is [GitHub private vulnerability reporting](https://github.com/sumnlikeshane/Heurisko/security/advisories/new). Repository owner Shane Joseph handles triage. Aim to acknowledge a report within **seven calendar days**, best effort; this is not a contractual SLA or a promise of a fix by a deadline. Coordinate the disclosure date privately after assessing impact and affected versions. Ordinary product questions can use repository issues; do not put exploit details, credentials or private archives there.

**Reporting-verification gate closed by owner signoff on 1 November 2026.** The owner explicitly accepted security-reporting verification with the audited foundation. The agent has no independent observation of route activation or notifications; the earlier anonymous lookup returned HTTP 403, and no repository setting was changed by the agent. This signoff is an owner disposition of the gate, not a new administrative test result. Follow [GitHub's configuration instructions](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository). No repository setting was changed locally. If the private form is unavailable, do not post sensitive details publicly; this project has no verified alternate contact route yet.

Include the affected source commit/version, OS/architecture, exact tool versions, diagnostic code and a minimal inert reproduction. Include report/evidence digests and relevant member/ranges where useful. Redact session capabilities, API keys, home paths and private package/source content. Do not send private material through a public example or portable export.

## Boundary and response

Static investigation never installs/imports/executes target code. Docker is trusted local infrastructure; archive parsing has the admitted restricted worker and no host fallback. Model/providers, rebuilds and hosted writes remain unavailable. [The foundation contract](docs/production-phase1/Foundation%20Contract.md) describes actual controls and limitations; a matching digest, exit 0 or zero findings never means safe.

Preserve original reports, blobs and failure receipts. Stop new investigations affected by a suspected isolation/integrity issue; inspect the exact job and store before recovery. Use the documented stopped-job recovery tool, never guessed lock deletion. A fix requires a scoped regression, compatibility review and exact-source validation. Disclosure/publication and release remain explicit owner actions. No security monitoring or external alerting service is activated.
