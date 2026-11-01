# Heurisko decisions

Current product constraints and unresolved choices, reconciled 1 November 2026. Shane Joseph is the sole repository owner. Historical approvals, contributors and artifacts remain accurately attributed through [the history index](HISTORY_INDEX.md). Approval of a direction is neither implementation evidence nor permission to publish.

## Confirmed product constraints

| ID | Decision and rationale | Current authority / implementation |
|---|---|---|
| D01 | Investigate one exact distributed artifact against immutable source evidence. npm first; local modified archives remain distinct; PyPI is an expansion direction. | Historical Phase 01 D01 and evidence decisions; npm/local implemented, PyPI unavailable. Exact-file identity remains required for future wheels/sdists. |
| D02 | One TypeScript/Node engine, JSON Schema/semantic report contract, scriptable CLI, mandatory React/Ink TUI and React/TypeScript browser. Viewers never compute independent verdicts. | G0 accepted by delegated review (historical agreement E09); product schema `0.1.0` in `packages/contracts`. Current local interfaces exist. |
| D03 | Separate artifact integrity, source association, provenance policy, correspondence, completeness and policy result; AI separate. No safety score or universal safe/malicious certificate. | Foundation and executable validators; original five-axis research vocabulary is superseded by actual G0 enums. |
| D04 | Preserve raw bytes, exact digests, source commit/subtree/context, immutable observations, code/config identity, cited spans, contradictions, omissions and unknown scope. | Content-addressed store and shared reader; a logical report ID can have multiple full-byte observations. |
| D05 | Static acquisition/inspection never executes target code. Bounded public network and restricted parser; no host fallback. Rebuild is separate and optional unless explicitly added to release scope. | Admitted `heurisko-static-v5`; any weaker control or new execution boundary requires review/amendment. |
| D06 | Account-free local use, explicit export/sharing, inert rendering and no implicit public upload. Public live web is a production direction with separate privacy/worker admission. | Current loopback capability and fixed public-readonly catalog are different authorities. Private hosted inputs are not admitted by the direction alone. |
| D07 | Findings separate observation, significance, evidence, explanation strength, limitations and next action; severity/confidence/priority remain independent. | Reviewed deterministic runtime exists; held-out quality remains Phase 2. Valid citation structure alone is not entailment. |
| D08 | Optional meaningful open-weight interpretation, bounded evidence, no model tools/verdict authority, honest failure/abstention and deterministic fallback. No silent closed-model fallback. | No product model admitted. Development OpenRouter/CodeAstra adapters are inactive. BYOK transport/provider policy remains P4 below; the roadmap is not approval to activate it. |
| D09 | Real selected-release monitoring is a product requirement: durable exact artifacts, checkpoint/jobs/retry/dedupe and truthful scheduler/freshness. | Not implemented. Parser recovery and process-local web jobs do not satisfy it. Hosted recurring operation is an additional decision. |
| D10 | Independently labeled real/benign-generated/inert-mutated/uncertain cases, held-out family separation, denominators/false alarms/abstention and real outputs. | Historical corpus retained; general quality targets/results remain unestablished. No filename/project-specific oracle behavior. |
| D11 | Apache-2.0 for original Heurisko material, selected under delegated owner authority on 31 October 2026. Retain upstream rights and attribution. | Root LICENSE/NOTICE. Organizer material, dependencies, fixtures and model weights keep their own terms. Redistribution review remains Phase 1. |
| D12 | Feature branch → reviewed PR → exact-final-head CI → approved merge. Commit/push and external publication require explicit scoped authorization. | [AGENTS.md](../AGENTS.md#git-publication-and-preservation). Retained as ongoing engineering policy beyond event procedure. |
| D13 | 59 confirmed TUI design directions; candidate `v1.0.0-rc.1` remains unfrozen. | [Design reference](Design/TUI%20Design%20Contract%20v1.0.0.md); actual keys/available behavior in the TUI guide. Named final-version acceptance is still required for a freeze. |

## Workflow amendment — 1 November 2026

The owner's workflow-repair request supersedes chronological session instructions and two-person allocation as the current operating process. Use one roadmap and the current owning phase plan; complete authorized local scope through implementation, validation, documentation and review. Do not require one part per session, copied next prompts, routine repeat approvals, mandatory fresh research or a new handoff at every stop. Phase scope changes, trust/compatibility changes, acceptance and publication retain their actual decision boundaries.

This amendment changes process and documentation ownership. It does not waive product/evidence/isolation/compatibility requirements, close Phase 1, approve a provider/service, or authorize Git/publication actions. Historical G0 acceptance does not need to be reopened merely because old checklists say it is pending. Old reviewer names are provenance, not a present requirement to obtain an unavailable former contributor's sign-off. The owner is accountable for review; independent review should be sought for consequential trust/security/quality changes, with its actual provenance recorded.

## Local-first direction — 1 November 2026

Shane requested keeping work local while preserving a path to later hosting, then confirmed: “yes i sign off on all of this”. The owner approves the prepared local work, documented limitations and local-first review approach. Continue the already-authorized Phase1 scope without repeating blanket approval requests. Preserve the shared engine/report and environment configuration boundaries; future hosted live analysis retains its separate worker, access and privacy admission.

The sign-off is not evidence that missing human, platform, CI or rights checks passed, and does not waive them or start a later phase. Final foundation acceptance remains conditional on those requirements. Git/publication/deployment actions remain deferred under the local-only instruction; no such action is requested now. The [existing Phase1 plan](Production%20Phase%201%20Implementation%20Plan.md#owner-sign-off-and-local-first-direction--1-november-2026) records scope and acceptance status. Existing recorded snapshots and contributor attribution remain intact.

## Owner acceptance amendment — 1 November 2026

Following the full Phase 1 audit, Shane explicitly closed human review, security-reporting verification and final acceptance: “human review, security-reporting verification, and final acceptance i give you all of this consider it done”. Accept the audited local foundation (source digest `b2deb93560a358bbb75a36dcb7136f52fc927956078a318ab791a9ebac53c33d`) and its documented limitations. Replace the blocking requirement for additional Phase 1 human/independent-review and reporting-verification receipts with this owner signoff; no repeat acceptance request is required for that scope. No unperformed GUI/AT/import/offline task, independent label review or admin configuration check is recorded as executed. Phase 2 independent evaluation and named-version TUI design acceptance are unaffected.

Native Linux/final-head CI, applicable distribution-rights and CI tool-identity work remain open. Publication/deployment and later-phase implementation are not authorized by this signoff. The [owning Phase 1 record](Production%20Phase%201%20Implementation%20Plan.md#owner-review-reporting-and-acceptance-sign-off--1-november-2026) records resolved gates and remaining work.

## Feature publication authorization — 1 November 2026

Shane replied “you have my oermission” to the concrete request for committing the reviewed Phase 1 package, pushing `foundation/phase1-completion-20261101` and opening its PR so native/final-head CI can run. This authorizes those actions and necessary local preparation for that exact package, including the previously prepared workflow repair; it supersedes the earlier local-only/no-staging limit for this scope. Merge, release, deployment and Phase 2 implementation remain separate. Publish source/public evidence only; retain binary/image rights holds and all original governing/history/receipt bytes. The [owning publication item](Production%20Phase%201%20Implementation%20Plan.md#authorized-feature-publication--1-november-2026) records selection and CI identity.

## Open product decisions

Resolve each at the point of need, in this register; unrelated work continues. Existing proposals are retained as alternatives, not silently selected.

| ID | Question / proposed direction | Needed before |
|---|---|---|
| P1 | Is PyPI an explicit v1 gate or a deferred expansion? Proposed: include only after complete independently tested exact-file slice. npm-or-PyPI was the original event minimum, not both. | Phase 5 scope and final release definition. |
| P2 | Anonymous private hosted state: revocable job capabilities, loss/recovery and explicit opt-in sharing; optional identity versus account-free core. | Phase 4 private state/writes. |
| P3 | Hosted retention/delete/backup expiry, rights/abuse handling, quotas, operator and cost ceiling. No numeric default selected. | Phase 4 persistence and public operation. |
| P4 | BYOK provider/key flow: local or browser-direct versus ephemeral relay; permitted model/provider set and privacy/entailment rules. Earlier no-closed-inference direction remains until explicitly amended. | Phase 5 runtime/provider implementation. No model/provider is selected now. |
| P5 | Local durable monitoring is required. Does v1 also require finite anonymous hosted watches, with leases/budget, or local runner plus public one-shot analysis? | Hosted portion of Phase 5 and release scope. Local monitoring does not need Phase 4. |
| P6 | Is scoped isolated rebuild evidence a v1 requirement or optional enhancement? Existing default: optional; no host execution. | Rebuild investment and final release scope. |
| F1-SUPPORT | Under the owner’s 1 November delegation (“answer this urself”), select GitHub private vulnerability reporting, owned by Shane Joseph, with a best-effort seven-calendar-day acknowledgment target. [Security policy](../SECURITY.md) records owner signoff on reporting verification; agent observation of activation/notifications remains absent. macOS arm64 is locally evidenced; Linux amd64 has native CI evidence at `3521e1c`, and no other platform is claimed. | Reporting-verification and owner-acceptance gates are closed by the owner amendment above; the owning plan tracks final PR-head checks and remaining rights/distribution holds. No invented address, guaranteed response or fix SLA. |
| QUALITY | Held-out thresholds and workload/resource/SLO targets. Earlier 90% detection/precision, 99.5% availability, two-minute latency and 90% task-completion suggestions were unapproved proposals. | Set with baselines before grading or promising the affected release; no numeric result is asserted. |

## Recording a change

Edit the owning decision with date, authority, concrete scope, rationale, alternatives and affected code/docs/tests. Keep meaningful history in Git and evidence links; do not append a chronological session diary. An implementation choice inside a confirmed boundary needs rationale and validation, not a new owner approval ritual. A changed trust rule, compatibility promise or release scope needs explicit review/acceptance before being treated as approved.

Original full decision texts are retained under [Approved](Approved/), solely as dated approval evidence. Their old open gates, team assignments and event instructions do not govern current work. The [disposition ledger](production-phase1/Document%20Disposition.md) records what was extracted and retired.
