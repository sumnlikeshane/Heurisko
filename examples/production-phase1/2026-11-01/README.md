# Phase 1 initial baseline and first repair — 1 November 2026

This is a new local receipt, not a claim of Phase 1 acceptance or remote CI. The baseline source was exported from `main` at `6985d3eeecdbdc33463458e8072a31e62e86109f` to a disposable directory. The active checkout's pre-existing `AGENTS.md`, `README.md`, complete guide, roadmap and Phase 1 plan edits were preserved. The baseline copy received the selected AI development source **after** its product baseline tests; that import did not change its core loader or CLI.

## Environment and reproducibility

- Host: macOS Darwin 25.6.0 arm64; pinned Node 22.23.4 from local `.tooling`, pnpm 10.14.0, Python 3.13.2, Docker Desktop 4.46.0 / Engine 28.4.0 linux/arm64.
- Original dependency inputs: `pnpm-lock.yaml` SHA-256 `ec3bda3dd8f896a451a88902dbb797fbc20c8c238ddb03aacbf0107353f4c105`; `requirements-contracts.txt` SHA-256 `f589c32497553a4b8c4456450870c523d892b7df25feaf4c2805a98859034e2b`.
- Exact parser image: `python:3.13.18-slim-bookworm@sha256:281d39ff02e3b389401586134ff9e6572954687822a58055ec07a60ded4e0b7f`. It was pulled and the actual parser tests used Docker; no host parser fallback was admitted.
- `pnpm install --offline --frozen-lockfile --ignore-scripts --store-dir <existing local store>` passed in 1.29 s after the default store path failed for one missing tarball. A fresh Python `pip install -r requirements-contracts.txt` could not resolve packages because DNS was unavailable; the isolated venv reused the existing local Python 3.13 site-packages and `pip check` passed. **This is not a clean Python installation proof.** The initial in-sandbox Docker and socket failures were access restrictions: 51/146 core tests and 16/78 web tests failed there. The same clean source passed those suites when Docker/socket access was granted for local validation; see the separate raw logs.

## Clean source results

| Check | Result | Raw output |
|---|---:|---|
| `pnpm run typecheck` | 0, 8.2 s | [typecheck](baseline/logs/typecheck.log) |
| `pnpm run test:contracts` | 0, 0.5 s; full schema and semantic checks | [contracts](baseline/logs/contracts.log) |
| `node --test --test-concurrency=1 packages/core/tests/*.test.mjs` with Docker | 146/146, 120.0 s | [core](baseline/logs/core-docker.log) |
| Reader/TUI Node tests | 40/40, 5.4 s | [readers](baseline/logs/readers.log) |
| `pnpm --filter @heurisko/web test` with local sockets | 78/78 | [web](baseline/logs/web-network.log) |
| Retained S3 historical replay | 0, 8.3 s | [replay](baseline/logs/s3_replay.log) |

The [sandboxed core](baseline/logs/core.log) and [sandboxed web](baseline/logs/web.log) logs document the access failure, not a product defect. The clean source did not test Linux amd64, a genuinely fresh Python dependency install, a live npm fetch, browser visual acceptance, or exact-head CI.

The public GitHub Actions API reported [run 41259146948](https://github.com/sumnlikeshane/Heurisko/actions/runs/41259146948) completed successfully on the **starting** main head `6985d3eeecdbdc33463458e8072a31e62e86109f`. It is not CI for these uncommitted Phase 1 edits. A fresh `/healthz` request returned HTTP 200 and `{"status":"ok","mode":"public-readonly"}` at 14:20:05 IST after an earlier 20-second timeout. This observes current endpoint health, not the exact deployed commit or parser availability on Render. Deployment identity remains unverified.

## CL1 — CLI default requested unavailable AI

Both CLI-default commands used the same inert local mutation and pinned source archive from [`examples/s2/current/inputs`](../../s2/current/README.md). The only option difference was `--no-ai`. A separate untouched-HEAD source export supplied the AI-off pre-intake comparison. No target lifecycle script ran. Exact commands can be reproduced by substituting a fresh destination for each store and report:

```sh
node packages/cli/dist/index.js analyze \
  --artifact examples/s2/current/inputs/picocolors-1.1.1.local-inert-mutation.tgz \
  --source https://github.com/alexeyraspopov/picocolors \
  --commit 6f0a4638348ed20633d623ee973f9c9a96f65104 \
  --source-archive examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz \
  --name picocolors --version 1.1.1 --store DEST/store --report DEST/report.json --json
```

| Result | Exit | AI state | Analysis | Findings | Report ID |
|---|---:|---|---|---:|---|
| [Pre-intake `--no-ai`](pre-intake/report.json), [store](pre-intake/store/) | 0 | disabled | complete | 16 | `report_950f06345e552ef6bc084537` |
| [Old default](baseline/default.report.json), [store](baseline/default-store/) | 2 | unavailable | incomplete | 16 | `report_8626d829de7e62fd816854d3` |
| [Old `--no-ai`](baseline/no-ai.report.json), [store](baseline/no-ai-store/) | 0 | disabled | complete | 16 | `report_a12f5af652e46146f353602a` |
| [Repaired default](after/default.report.json), [store](after/store/) | 0 | disabled | complete | 16 | `report_a12f5af652e46146f353602a` |

The fixed default still leaves source association `user_supplied`, provenance `not_checked`, correspondence `unresolved` and policy `not_evaluated`. The pre/post-intake AI-off reports have exactly equal outcomes, 16 finding objects and change status/equality sequences. Their report IDs differ because the added workspace importer changes the lockfile digest bound into module identity. The identical evaluation ID for the post-intake explicit `--no-ai` and new default establishes the intended CLI option equivalence; complete report bytes differ because each capture has its own observation time. Original report bytes and stores above are retained. The new focused real-parser CLI regression passed. `--no-ai` remains accepted, and no model runtime is connected.

The [local report audit](report-audit.json), reproducible with [`verify-report.mjs`](verify-report.mjs), validated the repaired report's original 64,178 bytes, store references and cited 273-byte source member across CLI inspect, the shared TUI report reader and the web observation reader. All three retained the six outcomes, `user_supplied` source association, `not_checked` provenance, unresolved correspondence and zero recorded omissions. This is one exercised case, not a general quality or browser visual result.

## Actual npm and parser boundary

A fresh `analyze npm:picocolors@1.1.1 --source https://github.com/alexeyraspopov/picocolors --commit 6f0a4638348ed20633d623ee973f9c9a96f65104` ran with the repaired default, a fresh store, the exact parser image and no target install/lifecycle execution. It exited 0 in 5.34 s with [original report](npm/report.json), [store](npm/store/) and [progress log](npm/stderr.log). Registry artifact integrity was `matched`; source association remained `ambiguous`, correspondence `unresolved`, provenance `not_checked`, policy `not_evaluated`; AI was disabled and deterministic analysis produced 14 findings. Exit 0 here describes completed checks, **not** package safety or verified source origin. The [npm report audit](npm/report-audit.json) independently reopened the original 71,724 bytes and one cited source member through CLI, TUI reader and web reader.

The fresh [parser boundary probe](parser-boundary.json) observed blocked egress, host sentinel, Docker socket and writes, a 256 MiB memory cap, a blocked oversize allocation and a bounded CPU termination in the trusted development probe. It is a macOS Docker Desktop observation, not Linux amd64 proof or target execution.

The first macOS arm64 `/usr/bin/time -l` measurements used new stores and the same pinned runtime: [local](performance/local.log) finished in 2.82 s with 68,796,416 bytes peak CLI host RSS and about 404 KiB store disk use; [npm](performance/npm.log) finished in 4.75 s with 71,942,144 bytes peak CLI host RSS and about 460 KiB store disk use. The container's **configured** 256 MiB cap is separate from CLI RSS; its actual peak was not measured. Built `dist` directory disk use after the current typecheck was contracts 20 KiB, core 232 KiB, CLI 16 KiB, TUI 304 KiB, reviewed rules 24 KiB, development AI 104 KiB and web 820 KiB (`du -sk`). These are one-machine observations, not SLOs or distributable package sizes.

## AI development source intake

The selected 33 upstream files match commit `55240e99409ad44cbd6a978f40873ef410cb1861` byte for byte; see the [intake manifest](../../../docs/production-phase1/intelligence-intake-manifest.json) and [review](../../../docs/production-phase1/AI%20Source%20Intake.md). The imported package built, all seven offline JS programs passed, and six Python schema validators passed with a fake provider fetch and no credential. [Build](baseline/logs/intelligence_build.log), [JS](baseline/logs/intelligence_tests.log), and individual `validate_*.log` files are retained. This does not admit the provider or model into the product runtime.

## Remaining Phase 1 gates

The fresh macOS arm64 source copy in `/private/tmp/heurisko-phase1-clean-macos-Gq6A1l` was exported from the starting commit and overlaid with the Phase 1 source edits. Its `node_modules` and Python virtual environment were created from scratch: offline frozen pnpm installation used the existing package cache, while `pip --require-hashes --no-cache-dir` downloaded all five pinned validator wheels into a new Python 3.13 environment. `pip check`, typecheck, contracts, the imported AI build/offline tests/validators, 146/146 Docker-backed core tests, 78/78 web tests, and 40/40 reader/TUI tests passed. The final web AI-default source and test were copied into this clean source before the full web and reader suites. [Raw environment logs](environment/) retain exact outputs and hashes are listed in [the environment manifest](environment/validation.json).

From that copy, the same inert local and exact-version npm cases each exited 0 with the static parser. [Local report and store](environment/clean-macos/local/) and [npm report and store](environment/clean-macos/npm/) were reopened across CLI, TUI and web with exact original bytes, retained evidence and the declared unknown states. The fresh [parser boundary result](environment/clean-macos/parser-boundary.json) passed. These are macOS arm64 plus Linux arm64 Docker Desktop worker observations, not native Linux amd64 parser proof.

The current reader also reopened six unchanged historical reports: B1/B2, incomplete B3, B3R with 673 recorded omissions, the pre-integration local mutation and the prior deterministic M1 report. [The audit](historical-reader-audit.json) records each original hash, byte size, CLI inspect exit, six outcomes, coverage and finding count; CLI, TUI and web all returned the same report object and original content reference. [`verify-historical.mjs`](verify-historical.mjs) reproduces the check. A cited source member from the prior M1 report was also reopened against an intentionally absent store; TUI and web both returned `metadata_only/MISSING_BLOB` without inventing bytes. This covers selected old observations, not every historical report or browser GUI path.

A fresh `linux/amd64` image build from current product source passed under Docker emulation. Image `sha256:41a8e831f3acb9a929da44e14cb330d357b09f1781c17987c59eeb7aea98122d` is 167,920,457 bytes; its [build log](environment/linux-final-build.log) includes fresh pinned Node/pnpm/Python install and build. A temporary local container served `/healthz` with HTTP 200 and `public-readonly`; `POST /api/investigations` returned HTTP 405 with `HOSTED_READ_ONLY`. The container was stopped. This proves the hosted image route under emulation, not a Linux amd64 host parser, local investigation or exact deployed Render identity.

The [Linux image license inventory](../../../docs/production-phase1/linux-amd64-npm-licenses.json) has 48 installed package versions and no missing `license` field. It differs from the macOS list only in the expected esbuild platform package: `@esbuild/linux-x64@0.25.12` replaces `@esbuild/darwin-arm64@0.25.12`; both declare MIT. This is package metadata, not a legal audit of every notice or transitive source file.

Remaining gates are native Linux amd64 parser/cleanup and representative local/npm runs, two-host resource measurements, notice/rights review beyond package metadata, exact proposed-head CI, human browser/TUI review and owner acceptance. Historical documents with inbound links remain labeled outside the current index under the [disposition ledger](../../../docs/production-phase1/Document%20Disposition.md). Existing safety caps, G0 schema and historical report bytes were not changed.
