# Current handoff: Linux exact-job cleanup confirmation

PR #3 first published the complete webapp/S4 checkpoint as `af78823`. [That CI run](https://github.com/sumnlikeshane/Heurisko/actions/runs/41250648942) passed web and documentation checks but failed S2 with unconfirmed cleanup on Linux. The original job log and receipts are retained; no earlier pass is relabeled.

The corrective follow-up uses a successful full-ID-filtered all-container listing for absence, shared by normal cleanup and explicit recovery. Query errors, any returned content, partial IDs and names remain unconfirmed. Limits/isolation and retained recovery records are unchanged. `validation.json` records new regressions and fresh local/npm report/CLI handshakes. Earlier complete-workspace evidence remains historical under `../current-handoff/`. No analyzed target/model/build executes. No main merge or deployment is included.
