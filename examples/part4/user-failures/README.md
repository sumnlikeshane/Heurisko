# Part 4 user-failure reproduction and workflow evidence

The exact reported observation is preserved in [reproduction.report.json](reproduction.report.json), with a portable [evidence mirror](reproduction-store/blobs). Its ID is `report_67c88c791c269dab8cab5aff`, content reference `sha256:dd4fb19136fa91ca1581336c6fbc22b864b86e413eaa9978ece3ee0f08c52a3b`, capture `2026-10-31T22:59:33Z`. The original `.heurisko/manual-part4-test` report/store is unchanged. [Before/after terminal receipts](../../../integration/part4/receipts/user-failures/validation.json) distinguish actual output, failed test attempts and final checks.

Use the existing pinned setup, local Docker engine and static-parser image from the root README. No analyzed package is installed, imported, built or executed. Product models: none; coding assistance: Codex. These local artifacts are not a publication or final design/module acceptance.

```sh
export PATH="$PWD/.tooling/node-v22.23.4/node-v22.23.4-darwin-arm64/bin:$PWD/.venv/bin:$PATH"
node packages/cli/dist/index.js tui examples/part4/user-failures/reproduction.report.json \
  --store examples/part4/user-failures/reproduction-store
```

Press `x` to reset only UI preferences, then:

- `2`: Findings identifies `ANALYSIS_MODULE_UNAVAILABLE` / “Malhar analysis module not supplied,” completed acquisition and matched integrity, complete raw inventory/comparison, and **2 modified / 5 identical / 12 unresolved**. AI disabled is separate from the missing deterministic module.
- `3`: readable expanded Artifact/Source roots; directory panels say navigation. `m` jumps to modified files; Enter inspects a bounded raw difference. `/`, `package.json`, Enter selects the file directly. `d` toggles paired/unified display; `e` opens exact recorded bytes; `s` changes the requested side of a two-sided delta. Esc restores context. Full paths, original notes and evidence remain below the difference; missing sides/binary/truncated bytes remain explicit.
- `4`, Enter: association is ambiguous; the selected target is `6f0a4638348ed20633d623ee973f9c9a96f65104`, repository root. Exact retained values show artifact **1.1.1** versus source **1.1.0**, with evidence `ev_3ca16ad46cd957d737ef0c18`, source/artifact bytes `[39,46)`. Rate-limited tag discovery is a limitation, not tag absence. `v` cycles independent Candidates/Provenance/Build. `n` opens a new target draft; Review/Start creates another report.

Raw processing completion does not prove release-relative absence. The original producer used one generic incomplete-inventory note when either inventory was incomplete **or** source ambiguity suppressed absence inference. New producer notes distinguish the actual reason without changing unresolved/unknown status. The historical report retains its original wording with an explicit explanatory caveat.

## Genuine artifact and separate inert mutation

Primary upstream [release](https://github.com/alexeyraspopov/picocolors/releases/tag/v1.1.1) and [commit](https://github.com/alexeyraspopov/picocolors/commit/7249f8c5d4825550f70bc1ea98652639933d3bbd) identify **7249f8c5d4825550f70bc1ea98652639933d3bbd** as a separate 1.1.1 candidate, with the old 1.1.0-labeled target as its parent. The genuine published artifact is a useful control; neither candidate is called a verified release baseline. [Research observations](../../../integration/part4/receipts/user-failures/research.json) retain retrieval limits.

[Fresh npm report](fresh-npm.report.json) comes from an actual Source-action → edit commit → Review → Start keyboard investigation. Artifact integrity matched; the selected source's version label is 1.1.1, while registry `gitHead` still points to `6f0a463…`. That conflict remains ambiguous. Provenance is `not_checked`, build is skipped and deterministic analysis is unavailable. Expected noninteractive exit: **2**.

[Fresh local report](fresh-local.report.json) comes from a separate retained local Review/Start against the acquired new-candidate source snapshot. Its unchanged, explicitly **synthetic local-input** archive adds only the inert `HEURISKO_INERT_TEST_ONLY` lifecycle value and comment marker. It inherits no registry integrity/provenance result. Local replay is user asserted and does not repeat npm discovery. Its added/removed records describe the explicitly selected local pair, not verified release history. Expected exit: **2**.

[Output identities, acquisition observations and input hashes](workflow-outputs.json) and the [portable final-workflow store](store/blobs) preserve exact report bytes. Original attempt-specific stores/reports remain retained; aliases above are byte-for-byte copies of the final complete keyboard workflow. Original baseline archive SHA-256 is `d3aedb2807967b7eb37fd11b03b7e3701e725af79c650d0812ff7213f8f882d9`; inert mutation is `bcdd003ee749b70575fb2793d3892a393d1224457ecb8ca9c37ff4cfd55e098d`. New source archive SHA-256 is `c1053a4131e05d3e62088b3988f4cefe16e05b1a90db59115bf7706f7350e7de`.

```sh
node packages/cli/dist/index.js tui examples/part4/user-failures/fresh-npm.report.json \
  --store examples/part4/user-failures/store
node packages/cli/dist/index.js tui examples/part4/user-failures/fresh-local.report.json \
  --store examples/part4/user-failures/store
```

For another fresh real run, use a new report filename because writes are immutable:

```sh
node packages/cli/dist/index.js analyze npm:picocolors@1.1.1 \
  --source https://github.com/alexeyraspopov/picocolors \
  --commit 7249f8c5d4825550f70bc1ea98652639933d3bbd --no-ai \
  --store .heurisko/part4-next-npm --report .heurisko/part4-next-npm.report.json

node packages/cli/dist/index.js analyze \
  --artifact examples/part4/user-failures/inputs/picocolors-1.1.1.local-inert-mutation.tgz \
  --name picocolors --version 1.1.1 \
  --source https://github.com/alexeyraspopov/picocolors \
  --commit 7249f8c5d4825550f70bc1ea98652639933d3bbd \
  --source-archive examples/part4/user-failures/inputs/picocolors-source-7249f8c5d4825550f70bc1ea98652639933d3bbd.tar.gz \
  --no-ai --store .heurisko/part4-next-local --report .heurisko/part4-next-local.report.json
```

Expected: usable incomplete reports / exit **2**, explicit unavailable deterministic module, AI disabled and no target execution. Acquisition failures remain failures; future tag/metadata observations may differ. No source/provenance success is inferred from an equal version label.

## Explicit module validation, not product adoption

The latest available reviewed team checkout is **e8b8116f9960527d0a82e066059d7792c405defe**, `@heurisko/intelligence 0.1.0`. [Module receipt](module-validation.json) hashes its source/executable closure/configuration and binds a [new explicit-validation report](local-e8b8116-validation.report.json) to the current engine. The unchanged module consumes both fresh bundles with AI disabled: **14/16 findings**, lifecycle **0/1**, original inputs unchanged. The [development probe](../../../scripts/check-part4-module-boundary.mjs) supplies the existing trusted injection seam explicitly; the product CLI/TUI continue to supply no accepted module.

```sh
node packages/cli/dist/index.js tui examples/part4/user-failures/local-e8b8116-validation.report.json \
  --store examples/part4/user-failures/module-validation-store
```

Press `2`, `/`, type `lifecycle`, Enter, Enter, then `e`: exact retained inert bytes are available. Esc restores selection/filter/focus/scroll. This report may be complete for its declared static scope; that is neither package safety nor general module acceptance. Its M1 limitation incorrectly says values are not retained; the producer and reader prove otherwise. That quality correction, module/configuration adoption and joint G3 remain coordinated dependencies. No new heuristics, automatic loader, model or provider call is implemented.

S4 functional evidence, human usability/visual acceptance and joint G3 are assessed separately in the [readiness report](../../../docs/Part%204%20Integration%20Readiness%20Report.md#user-failure-repair-and-workflow-proof--1-november-2026). Design v1.0.0-rc.1 stays unapproved/unfrozen; all 59 directions are preserved. No Part 5, staging, commit, push, merge, publication, deployment, submission or external message.
