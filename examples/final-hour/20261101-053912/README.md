# Final-hour local readiness — 1 November 2026

Shane authorized the one-hour readiness work, then supplied `55240e99409ad44cbd6a978f40873ef410cb1861` and requested connecting the reviewed deterministic path. New CLI/TUI/browser investigations now use that reviewed entry by default. This directory keeps the earlier raw receipts alongside the new integrated output; historical reports, blobs and receipts stay unchanged. No target code or product model runs.

**Current demo:** [actual integrated report](integrated-55240e9/report.json), [matching store](integrated-55240e9/store), and [module intake/validation](https://github.com/sumnlikeshane/Heurisko/blob/6985d3eeecdbdc33463458e8072a31e62e86109f/docs/Final%20Module%20Intake.md). Report `report_1366f57f990327d57dd6ad73` contains **16 deterministic findings and one lifecycle finding**, with exact evidence `ev_e7075cb69f91c7e1b4c4223f` identifying `scripts.postinstall` added to the artifact. Its recorded exit is **0** for completed declared static checks. Source remains user supplied, provenance unchecked, correspondence unresolved and policy not evaluated; exit 0 is not package safety or complete P04.

Use the [eight-minute runbook](https://github.com/sumnlikeshane/Heurisko/blob/6985d3eeecdbdc33463458e8072a31e62e86109f/docs/Final%20Hour%20Demo%20Runbook.md), [pinned three-case manifest](demo-manifest.json), [demo parity verification](demo-verification.json), and [current-source validation](validation.json). Native GUI observations are separate from the source/API/transport results. All three primary cases are historical and intentionally incomplete, with CLI exit 2.

| Case | Existing immutable inputs | Demonstrated boundary |
|---|---|---|
| Genuine public release | [ts-pattern 5.9.0 report](../../handoff/current/B2.report.json) and [retained store](../../handoff/current/store) | Matched registry integrity; publisher-asserted source; raw distribution/build context, with no generated-equivalence or harmlessness claim. |
| Inert local mutation | [picocolors local-input report](../../part4/user-failures/fresh-local.report.json) and [retained store](../../part4/user-failures/store) | Exact inert `scripts.postinstall` value and original byte ranges; no inherited registry/provenance success or target execution. |
| Incomplete source | [zod 4.6.7 report](../../handoff/current/B3.report.json) and [retained store](../../handoff/current/store) | Unsupported source entry, incomplete inventories/comparison and unresolved coverage remain visible. |

From the repository root with the pinned existing Node/Python setup:

```sh
pnpm web --report examples/final-hour/20261101-053912/integrated-55240e9/report.json \
  --store examples/final-hour/20261101-053912/integrated-55240e9/store
node scripts/verify-final-demo.mjs .heurisko/DEMO_REHEARSAL_NEW
```

The first command starts a loopback viewer and prints a private memory-only launch capability; never save it in documents or screenshots. The second requires a fresh destination and verifies every retained blob, original report bytes, portable reopen and CLI/non-TTY parity without network acquisition. It also produces portable copies in the ignored destination for offline rehearsal. Original upstream material retains its own rights; no upload/publication is authorized by preparing it.

The second command verifies the original three retained cases, not the new integrated output. The older `launch-final-demo.mjs` helper likewise remains a three-case historical launcher. An absent/empty `HEURISKO_ANALYSIS_MODULE` uses the reviewed deterministic default; explicit `55240e9` selects the same entry and `off` reproduces unavailable raw analysis. `--no-ai` disables only the model request. Product model/provider/CodeAstra paths, provenance-policy verification and selected-release monitoring remain open. Saved inference is replay; the e8b8116 report remains isolated historical validation. No Git/publication/submission/external-message action follows from these local files.

## Local PR draft

### What this PR does

Connects the supplied reviewed deterministic entry to normal shared-engine investigations, which previously returned unavailable analysis. Bounded hash-checked manifest/member resolution preserves raw evidence and unresolved states; the actual local mutation run now records 16 findings and the exact added lifecycle value. Existing raw examples remain immutable and can be reproduced with explicit `off`.

### Models the product uses in this PR

None. Provider, CodeAstra and model execution are excluded from this integration.

### AI coding assistants that helped write it

Codex.

### How we tested it

The actual default local run, saved report/store and exact cited lifecycle bytes are recorded in the module intake evidence. Earlier raw-demo and final-hour validation receipts retain their own source/build scope. Consult final integration validation for the final assembled checks; no remote CI, full GUI acceptance or publication is claimed here.
