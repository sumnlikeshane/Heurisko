# G0 Results — historical generated contract fixture checks

**Scope:** The results below describe the original handoff candidate, before the 31 October repository-audit revision. They are retained as a historical record and do not validate the current schema, types, fixtures or semantic checks. See [README_G0.md](../README_G0.md) for the current candidate status.

**Run date:** 31 October 2026 (tool environment, not the user's repository)

| Check | Result | What it means |
|---|---|---|
| JSON Schema definitions | Created | Draft 2020-12 with typed artifact/source/evidence/findings/AI/report/watch structures |
| TypeScript interfaces | Created and compiler-check passed | `tsc --noEmit -p packages/contracts/tsconfig.json` using global TypeScript 5.8.3 |
| Positive F0–F6 fixtures | PASS (7) | Every synthetic bundle, analysis result and report validates |
| Negative tests | PASS (5 rejected) | Invalid schema, invented references, unsupported rebuild proof, fake integrity success rejected |
| F7 monitoring types | PASS (schema only) | WatchState/Job have valid representation; no scheduler/restart behavior tested |
| Handshake | PASS (7, stubbed) | Fixture `EvidenceBundle → AnalysisResults → InvestigationReport` objects join without differing fields |
| Actual npm/source analysis | NOT RUN | No genuine package acquired or compared |
| Production TypeScript schema validator | NOT IMPLEMENTED | Python JSON Schema tests are available; add runtime adapter during code integration |
| Project GitHub CI | NOT VERIFIED | The user's repository and run logs were not connected |
| Both developers' review of exact G0 files | PENDING | Prior A01–A14 approval does not imply reviewing these generated files |

**G0 ruling:** G0 locally prepared and synthetic fixtures validated; official team G0 sign-off remains OPEN.
