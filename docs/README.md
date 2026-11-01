# Heurisko documentation

Start at [the product README](../README.md). Heurisko currently investigates exact public npm/local archives through one static engine, CLI, TUI and local browser. Public hosting browses captured reports only. **Phase 1 remains open.**

| Need | Canonical location |
|---|---|
| Understand, set up and run the system | [Operating guide](../HEURISKO_COMPLETE_GUIDE.md) |
| Look up exact commands/options/exits | [CLI reference](CLI%20Reference.md) |
| Use/test a particular interface | [TUI guide](../packages/tui/README.md), [web guide](../apps/web/README.md), authored browser task guides under `apps/web/content/` |
| Contribute, validate, review and release | [Contributor instructions](../AGENTS.md#one-development-workflow); actual scripts and CI define commands |
| Find current work, blockers and next action | [Phase 1 plan](Production%20Phase%201%20Implementation%20Plan.md) |
| Follow all phase outcomes and future priorities | [Development roadmap](../PRODUCTION_MASTER_ROADMAP.md) |
| Understand architecture, evidence and safety rules | [Foundation contract](production-phase1/Foundation%20Contract.md); executable schema/types/semantics in `packages/contracts` |
| Find durable choices and unresolved owner decisions | [Decision register](Approved%20Decision%20Register.md) |
| Understand deterministic runtime/development AI split | [Reviewed module](../packages/intelligence-reviewed/README.md), [development intake](production-phase1/AI%20Source%20Intake.md) |
| Work on terminal design | [Confirmed directions and unfrozen candidate](Design/TUI%20Design%20Contract%20v1.0.0.md) |
| Report a security issue / check support claims | [Security policy](../SECURITY.md) |
| Understand current hosted operation | [Render mode and deployment reference](Render%20Deployment.md) |
| Inspect real inputs, outputs and evidence | [Examples index](../examples/README.md); each receipt is dated evidence for its own source |

Current references describe implemented behavior and explicitly named limits; plans describe intended work. A local pass is not exact-head CI, human acceptance or proof of a live deployment. Update the owning reference and work item with the implementation; retire superseded prose after extracting its remaining value.

Historical material is deliberately separate: [history, original approvals, research and event evidence](HISTORY_INDEX.md). The [completed disposition ledger](production-phase1/Document%20Disposition.md) explains each retained or removed page and the workflow diagnosis. Historical documents do not issue instructions for future phases.
