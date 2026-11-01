# Heurisko development roadmap

**Current phase: 1 — technical gates open; owner acceptance granted.** Updated 1 November 2026 (Asia/Kolkata). This roadmap orders product development; the [Phase 1 plan](docs/Production%20Phase%201%20Implementation%20Plan.md) holds current work and evidence. Remaining local Phase 1 execution is authorized by the current owner request. Future implementation, publication and deployment retain separate scope and authorization.

## Product direction and baseline

Heurisko investigates exact distributed bytes against immutable source evidence, explains supported differences and preserves uncertainty. Keep one engine/report for scriptable CLI, mandatory keyboard TUI and browser. Local core use remains account-free; the intended public web product can eventually run bounded investigations without registration. AI is optional and evidence-limited; deterministic work remains useful without it. Original material is Apache-2.0. [Decisions and unresolved choices](docs/Approved%20Decision%20Register.md) distinguish confirmed direction from proposed technology and v1 scope.

Source at starting `main` `6985d3eeecdbdc33463458e8072a31e62e86109f`, plus existing local Phase 1 changes, implements exact public npm/local tar investigations, GitHub commit/subtree candidates, raw evidence/comparison, reviewed deterministic rules, immutable reports and three local interfaces. The public service is configured for three captured reports only. Development AI source is present but inactive. Provenance verification, concrete policy, rebuild, model inference, monitoring, PyPI, lockfiles/upgrades and hosted live analysis remain absent. [Operating guide](HEURISKO_COMPLETE_GUIDE.md) owns the detailed capability map; old receipts prove only their named snapshots.

## Priorities and known issues

This is the cross-phase backlog. Phase 1's remaining obligations are tracked only in its plan. Fix a newly discovered security/correctness regression in the current foundation promptly; phase labels never justify leaving an active exposure unresolved. Missing future features are not automatically current defects.

| ID | Priority and work | Owner / phase | Observable resolution |
|---|---|---|---|
| Q1 | P1: lifecycle removal priority uses whole-file change status, despite correct key-removal direction | Owner / 2 | Independently labeled addition/change/removal cases receive justified severity/priority without intent claims; retained reports unchanged. |
| Q2 | P1: entrypoint finding says old/new values unavailable although producer retains them | Owner / 2 | Wording uses resolved values or accurately says the consumer did not resolve them; correct citations and missing-content cases. |
| Q3 | P1: general deterministic/build-explanation quality unmeasured | Owner / 2 | Independent labels, held-out benign/generated/mutated/ambiguous cases; per-class precision/recall, false alarms, abstention and coverage. |
| Q4 | P1: provenance and requested policy remain unchecked/indeterminate | Owner / 2 | Reviewed exact-subject verifier and explicit expected identity/source/builder policy, including wrong/absent/unsupported cases. No generic SLSA-level pass rule. |
| UX1 | P1: baseline human review closed by owner signoff; task observations limited | Owner / 1 baseline; 3 complete interface acceptance | Phase 1 owner signoff accepts the documented baseline/task limitations without inventing observations. Phase 3 covers its changed/distributed journeys and their actual keyboard/focus/Back, viewport/zoom/reflow, native file/download/import, offline and assistive-technology checks. Never repeat accepted cases solely to open a new batch. |
| UX2 | P2: npm Review shows exact coordinates but remote digest/source remains unknown until Start | Owner / 3 | Decide whether resolved preflight adds value; if implemented, bind reviewed bytes/config to Start and test changed remote context. Current honest unknown is allowed. |
| UX3 | P2: TUI export, broader diff/hunk behavior, clipboard and cross-process nested navigation are absent | Owner / 3 | Choose supported scope explicitly; implement and validate only promised behavior; retain bounded raw windows and inert text. |
| OPS1 | P1 before hosted writes: no durable worker/jobs, anonymous isolation, retention or restore | Owner / 4 | Hosted security/privacy/recovery/load and actual staging journeys pass before public-write admission. |
| AI1 | P1 product direction: no admitted model runtime; experimental claims/citations need entailment review | Owner / 5 | Genuine measured opt-in inference, no-tools boundary, claim support/abstention/injection tests and AI-off parity. |
| MON1 | P1 product direction: watch discovery/store/retries/runner absent | Owner / 5 | Durable selected-release discovery invokes shared engine, survives duplicates/restart, retains older failures and reports truthful freshness. |
| ECO1 | Scope decision: PyPI exact-file adapter; no operational support today | Owner / 5 | Decide v1 inclusion, then independent wheel/sdist identity/source/corpus gates before any support claim. |
| REL1 | P1: release scope, operating budgets and quantitative quality thresholds unresolved | Owner / owning phases and 6 | Decide before affected work/held-out grading; publish exact support, limits and go/no-go evidence. |

Closed historical audit repairs remain protected by existing regressions: nonblocking regular-file intake, strict UTF-8/report identity, declared content availability, member-bound citation spans, immutable web input/download bytes, observation-scoped UI state, Source claim/read-failure handling and bounded docs search. Source references are in the [foundation](docs/production-phase1/Foundation%20Contract.md); [history](docs/HISTORY_INDEX.md) locates original evidence. They are not standing instructions to rerun whole-component audits every session.

## Phase rules

Every phase includes implementation, relevant testing/security/compatibility checks, user documentation, assembled review and owner acceptance of its outcome. Required work stays in the same phase until resolved. A failed gate reopens its owning item; do not create continuation phases to move unfinished obligations out of sight. Component audits happen when the owning capability changes or evidence identifies a problem. Phase 6 assembles earlier proof; it is not the first component review.

At phase entry, inspect changed source and evidence and refine the **existing owning plan/roadmap section** with concrete acceptance. Research only unresolved choices that can affect the work. Do not require a new audit document, a new implementation plan, another approval or a handoff solely because a phase/session began. Implementation still needs user scope; routine work within that scope proceeds. [AGENTS.md](AGENTS.md#one-development-workflow) defines the identify → scope → implement → validate → review/accept → release path and real approval boundaries.

Local readiness, owner acceptance and publication are separate. Exact-head CI is checked after authorized publication; inability to push does not block local repairs or documentation. All blocked items identify evidence, what resolves them and independent work remaining.

## 1. Reproducible foundation

**Outcome:** the existing npm/local system is reproducible, accurately documented and safe within its declared boundary. **Status:** open; [one execution plan and acceptance matrix](docs/Production%20Phase%201%20Implementation%20Plan.md).

**Prerequisites:** existing source, pinned tools, retained evidence; platform/operations access for their specific checks.

**Scope:** clean macOS arm64 and native Linux amd64 proof; current parser/recovery and cross-interface historical compatibility; observed foundation defects; inactive AI source intake and rights; dependency/notice/security/configuration baseline; measured resource/package-size baseline; contribution/release conventions and current documentation. The completed workflow cleanup is preserved while the current request authorizes remaining local foundation work.

**Exclusions:** new ecosystem, verifier/policy, model activation, monitoring, rebuild, hosted writes and speculative rewrite.

**Acceptance:** all gates in the plan have actual evidence or a separately approved scope amendment; no unresolved P0 foundation defect; current reports retain exact bytes/meaning; supported hosts reproduce representative npm/local/reopen behavior; rights/config/recovery/support documentation is reviewable; exact proposed-head CI and human/owner review recorded. Emulation does not prove native-host parsing; passing tests alone do not close the phase.

**Validation:** pinned install/build/contracts, serial core and actual parser/recovery, shared reader/TUI/web, representative cases and historical reopen, platform/resources/rights review. **Next:** finish remaining native/final-head CI, rights/distribution and CI tool-identity gates; retain the owner acceptance already granted, then scope Phase 2 against Q1–Q4. Until technical closure Phase 1 stays current.

## 2. Trustworthy npm investigation

**Outcome:** npm source/artifact investigation produces measured, evidence-supported findings and explicit provenance/policy meaning.

**Prerequisites:** accepted Phase 1 contract/reproduction baseline; reviewed verifier and expected-identity design before positive verification claims.

**Scope:** Q1–Q4; source candidate/conflict and raw/generated comparison quality; precise coverage/citations; independent labeled and held-out corpus; vetted provenance verifier with subject/signature/identity/issuer/predicate/source/builder checks; concrete versioned policy and exits. Audit acquisition, comparisons, module/content boundary and verifier together when this scope is implemented. Keep raw residuals visible.

**Exclusions:** universal malware/safety verdict, blanket filename exceptions, model-authoritative trust, new hosted execution. Optional rebuild evidence requires its own restricted-worker admission and does not silently become mandatory.

**Acceptance:** citations resolve and support each evaluated observation; wrong digest/source/subject/signer/policy and unsupported scope cannot become favorable results; thresholds are set before held-out grading and results include category denominators, false alarms, abstention and limitations; prior report fixtures retain meaning. All relevant findings reviewed and docs/examples updated.

**Validation:** adversarial acquisition/archive/source/attestation fixtures, real exact-subject positives and negatives, deterministic repeatability, held-out evaluation, old-report and CLI/TUI/web parity. **Next:** accept the core, then local workflow/distribution work in 3; hosted design in 4 may use the same accepted core.

## 3. Usable local distribution and developer workflows

**Outcome:** a developer can install, investigate, retain/reopen and automate supported local work from tested instructions.

**Prerequisites:** Phase 2 semantics and compatibility policy; released distribution/runtime choice. Existing UI correctness fixes may proceed earlier within approved current scope.

**Scope:** distribution/install/update/uninstall; CLI/JSON/errors/exits; TUI and local browser task acceptance, accessibility and large-report behavior; explicit report/evidence export; exact old/new release comparison, declared lockfile selectors and faithful CI/SARIF projection. Select supported formats and interface promises at entry, without silently deleting the existing expansion directions. Complete component audits and user documentation with these changes.

**Exclusions:** installing analyzed dependencies, unscanned-transitive safety claims, every OS/lockfile, independent viewer verdicts, mandatory hosted account. Advisory enrichment is optional and separately labeled.

**Acceptance:** declared clean platforms complete install and core journeys; original bytes/unknown states survive export/reopen; keyboard/AT/reflow/native-file tasks for claimed interfaces are observed; unsupported lockfile entries remain explicit; upgrade/CI findings reference the correct artifact/evidence; packaging/notices and update rollback are reviewed. Human review is part of this phase, not deferred to 6.

**Validation:** clean installation and distribution contents, contract/reader/regression suites, lockfile/upgrade fixtures, actual terminal/browser journeys and usable CI examples. **Next:** accept local use; contribute its client contracts to 4 and 5.

## 4. Safe public investigation service

**Outcome:** bounded account-free one-shot public investigations with durable private results and a maintainable operating model.

**Prerequisites:** accepted foundation/core; approved worker isolation, anonymous access, retention/sharing and operating budget. Local distribution/upgrade features do not block worker design.

**Scope:** separate isolated worker and durable job leases/idempotency/recovery; persistent evidence; private capability possession/revocation and explicit sharing; quota/abuse/cost controls; expiration/deletion/backup reconciliation; web review/progress/cancel/reopen/export; self-host setup, nonsecret telemetry, incident/restore/rollback runbook. Audit the hosted boundary before enabling writes.

**Exclusions:** exposing a Docker socket from the public API, host parsing fallback, anonymous unbounded jobs, automatic publication, assuming a Docker web image is an isolated job worker. Hosted recurring watches are a separate decision in 5.

**Acceptance:** actual staging jobs use the reviewed image/source; cross-user read/cancel guesses and revoked credentials fail; SSRF/upload/resource/crash/restore/delete/backup cases pass; no unrestricted host/secret access; cost ceilings and operator responsibility are established; real browser and self-host journeys work. Public-write rollout and deployment require separate explicit authorization after local/staging preparation.

**Validation:** adversarial isolation/access/retention tests, forced API/worker restarts, load/cost measurements, restore/rollback and browser evidence journey. **Next:** accept hosted operation, then integrate hosted aspects of 5; local 5 work does not depend on this service.

## 5. Continuous investigation and optional intelligence

**Outcome:** selected-release streams produce durable shared reports; optional AI helps interpret evidence without changing deterministic truth. Additional ecosystems retain exact-file semantics.

**Prerequisites:** accepted Phase 2 core and compatible local interfaces. Hosted extensions additionally require 4; local monitoring and model evaluation do not.

**Scope:** durable local watch `--once` and explicit recurring runner; transactionally retained discoveries/checkpoints/attempts, artifact+configuration dedupe, bounded retry, late artifacts/removals/conflicts and freshness; opt-in bounded retrieval and genuine inference with model/config identity, citations/entailment, abstention, failures and key lifecycle. Resolve PyPI v1 scope, then implement its complete independently tested exact-file slice if included. Design/admit each provider or ecosystem at its boundary, with tests/docs/review inside this phase.

**Exclusions:** silent closed-model fallback, model tools/verdict authority, accidental key persistence, unowned indefinite hosted watches, PyPI claims from a saved setuptools experiment. Broader ecosystems/rebuild/advisory services remain optional scoped enhancements.

**Acceptance:** duplicate/restart/crash tests retain older pending releases and one logical durable result; stopped/stale/success states reflect real runner facts; actual model-on/off held-out evaluation demonstrates useful supported interpretations and honest failure without deterministic changes or secret leakage; every included ecosystem passes its own artifact/source/coverage suite. If v1 scope changes, approve and document it explicitly before release.

**Validation:** controlled discovery with real engine output, restart/lease/retry drills, genuine inference plus injection/invalid-reference/provider failure tests, independent ecosystem corpus, interface parity and human review of new journeys. **Next:** accept these capabilities, then assemble the release gate in 6.

## 6. Integrated release and operation

**Outcome:** an evidence-backed v1 go/no-go and an authorized, supportable release.

**Prerequisites:** accepted required outcomes of 1–5 and resolved v1 scope; optional features explicitly listed. No numeric accuracy, availability, latency or usability target is currently approved or measured as a production gate.

**Scope:** exact candidate clean-install/cross-interface/old-report regression; independent security and quality review; load/soak/recovery/restore/monitor-freshness drills for claimed operating modes; license/SBOM/secrets/distribution review; final support/retention/security/release notes; deploy identity and rollback. Reuse prior component evidence and retest changed seams; do not postpone known defects here.

**Exclusions:** late feature expansion or waiving a failed prior-phase obligation because umbrella tests are green.

**Acceptance:** every required capability meets its predeclared qualitative/quantitative gates; no open critical security/privacy defect or unknown supported isolation boundary; artifacts/images match reviewed source; supported human journeys accepted; residual risk/support/incident ownership documented; owner makes explicit go/no-go. Publication/release is separately authorized and observed.

**Validation:** exact final-head CI plus real platform/security/human/quality/operations evidence and restore/rollback. **Next:** maintain versioned releases and the next prioritized backlog; do not restart the project from a new master plan.

## Dependencies and decisions at the point of need

`1 → 2 → 3`; `1 + 2 → 4`; `2 + local interface contracts → 5`; hosted parts of `5` also need `4`; accepted required outcomes `1–5 → 6`.

The graph expresses capability prerequisites, not automatic authorization or mandatory serial sessions. Documentation, corpus labeling and design investigations can proceed independently within approved scope. P1–P6 in [the decision register](docs/Approved%20Decision%20Register.md#open-product-decisions) retain v1 ecosystem, anonymous private state, retention, BYOK, monitoring and rebuild questions. Resolve each before its dependent implementation; none blocks unrelated authorized foundation work.
