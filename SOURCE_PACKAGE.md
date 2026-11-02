# Supported source package

This local source artifact includes the complete workspace source, tests, authored documentation, matching notices and the immutable fixtures needed by the checks below. It preserves contributor attribution. `SOURCE_SELECTION.json` records every included hash and every omitted Git candidate's hash/reason; `SOURCE_FIXTURE_NOTICES.txt` and `docs/production-phase1/source-fixture-rights.json` map fixture material to exact notices. Original files and Git history remain in the working repository.

External event attachments, images, installed dependencies, venvs, native/WASM binaries, container images and unrelated historical evidence are excluded. Links into omitted historical evidence remain documented omissions, with no fabricated replacement receipts. This is a source/test artifact; feature-branch source publication and native CI are now owner-authorized for the reviewed Phase 2 selection. Merge, deployment and binary/image releases remain outside that authorization.

Use Node 22.23.4, pnpm 10.14.0 and Python 3.13. After extracting, run:

```sh
pnpm install --frozen-lockfile --ignore-scripts
python3 -m venv .venv
.venv/bin/python -m pip install --require-hashes -r requirements-contracts.txt
pnpm run typecheck
PATH="$PWD/.venv/bin:$PATH" pnpm run test:contracts
node --test scripts/tests/credential-scan.test.mjs scripts/tests/phase1-npm-parity.test.mjs
node --test --test-concurrency=1 packages/core/tests/*.test.mjs
node --test integration/part4/tests/readiness.test.mjs packages/tui/tests/*.test.mjs
pnpm --filter @heurisko/web test
.venv/bin/python scripts/verify-source-package.py SOURCE_SELECTION.json
```

The real parser and provenance suites require a local Docker engine with the fixed images already pulled. The parser uses `python:3.13.18-slim-bookworm@sha256:281d39ff02e3b389401586134ff9e6572954687822a58055ec07a60ded4e0b7f`. The verifier's host-architecture-specific Node 22.23.4 image digests are fixed in `packages/core/src/trust.ts`. Acquire these exact upstream images explicitly; the source archive does not contain or redistribute them. Keep restrictions and caps unchanged. Contract validation uses the pinned isolated `.venv` interpreter.

For full source-bound native Linux amd64 validation, with pinned tools and images ready:

```sh
.venv/bin/python scripts/run-closure-validation.py /tmp/heurisko-native-new-run --manifest SOURCE_SELECTION.json
```

The runner records host/Node/Docker architecture and tool identity before executing, then exact commands, output/errors/exits, durations/resources, cancellation and cleanup receipts, source identity before/after, actual controlled/real worker and producer/report/interface parity. It probes the same fixed local Unix socket as the parser/verifier, ignoring ambient remote Docker contexts, and requires successful tool observations. It refuses native admission on this ARM Mac or an ARM Docker engine. `--local` explicitly labels a preparation rehearsal and cannot produce native acceptance. The runner does not provision infrastructure or publish anything. The prepared manual CI workflow retains the controlled runtime identity, bootstrap and exact compiled worker/host evaluator alongside fixture, command and report evidence; publication and native CI are authorized by the 2 November profile/publication amendment.

Controlled fixture replay is separate from genuine npm production-root evidence:

```sh
node scripts/generate-controlled-signatures.mjs /tmp/heurisko-fixtures-new
node scripts/prepare-controlled-runtime.mjs /tmp/heurisko-fixtures-new /tmp/heurisko-runtime-new
node scripts/test-controlled-signatures.mjs /tmp/heurisko-fixtures-new /tmp/heurisko-runtime-new /tmp/heurisko-worker-new
node scripts/verify-controlled-integration.mjs /tmp/heurisko-fixtures-new /tmp/heurisko-runtime-new /tmp/heurisko-app-new
```

The factory uses only pinned Node crypto and creates ephemeral private keys in memory. It retains public anchors, certificates, SCTs, signed DSSE/log/checkpoint/SET/TUF bytes and input/tool hashes. The isolated runtime fixes the controlled anchor at build time with the identical evaluator and restricted launcher; it links the already prepared exact dependency/validator tooling. Production roots are unchanged. Controlled reports are produced by the real engine from explicitly synthetic capture bodies and labeled in their validation receipts. They are not genuine npm publisher observations. Original producer `fixtureKind: real_generated` denotes actual execution rather than a handwritten report; the test receipt retains the controlled origin explicitly.

Supported historical tests use the included s2/s3/handoff/audit/p04 and reader fixtures plus the exact integrated-55240e9 sample required by the fixed read-only hosted catalog. `scripts/verify-source-package.py` verifies all selected bytes, fixture notices, research hashes and documentation links, reporting omitted historical destinations separately. The ordinary full-repository `pnpm run check:docs` continues checking every original destination. Original development intelligence remains inactive; the included intake fixtures support `node scripts/verify-intelligence-intake.mjs` and its offline tests. No provider credentials or calls are needed.

Source packaging alone establishes neither native validation, population accuracy nor complete real npm format coverage. No hash, signature, policy pass or exit 0 means safe. Full Git-history and any later binary/image distribution retain their own specific obligations.


The current factory revision 4 defaults to draft.2 and makes contradictory same-subject builder/source claims for supported dsse/0.0.1. It adds excluded-format rejection and explicit legacy draft.1 controls. Use `--legacy-profile` to construct the full original draft.1 matrix; old fixture captures and their exact generators remain preserved. For a focused construction run, add `--conflict-only` to the factory and `--matrix-only` to both test harnesses; receipts explicitly record that coverage subset. Default commands retain the full matrix. The package preserves the complete revision-2 fixture lane and its exact generator source separately from revision-3 contradictory claims. Their signed inputs, anchors and results are never relabeled as one capture or as genuine publishers.


[Native source-bound proof at implementation commit 60e9f40](examples/production-phase2/2026-11-03-exact-head-closure-01/REPORT.md) records actual admission, all 18 commands, original artifacts and source/worker/fixture/report hashes. Final acceptance also requires existing CI and native validation on the final repaired PR head. The npm default/no-AI checker validates each original report/store independently, then compares all finding facts and cited evidence. Only numeric GitHub rate-limit header values within tag-capture claims are projected for cross-observation comparison; original bytes, IDs, hashes, statuses, body/source identities and limits remain preserved.
