# Phase 2 technical closure evidence

Executed 2 November 2026 (Asia/Kolkata). **Phase 2 remains open; Phase 3 cannot begin.** Established verifier and validation-harness defects are corrected locally. Genuine npm `dsse/0.0.2`, native Linux amd64 execution and the remaining Docker Desktop reliability limitation are not converted into passes. No commit, push, PR, CI publication/dispatch, deployment, paid host or external message was performed.

## Source reconciliation and baseline

Base HEAD is `7eee564818c63b0edbe47e58d7c044136a4470c0`, branch `foundation/phase1-completion-20261101`, with substantial pre-existing dirty Phase 2 work. The [initial inventory](baseline/source.json) records candidate-file hashes, Git status and original staged diff; no clean-HEAD claim follows. The actual initial runtime is preserved in `baseline-runtime/`, including its original source, compiled launcher and fixed controlled build identity. The source-bound validation manifest is `ba5fda889734514e04006b202a42c54e48a1e03694347a63ba6bcc37d3248fb2`, prepared at `.heurisko/technical-closure-source-01/manifest.json`; its verified source archive is `b99f6abe9a0072e62aa53647b46038f83c72b104014761ec5df55f6ce749ad6d`. The manifest hashes 11,465 selected source/test/docs/fixture files and records 59,033 exclusions. It is a supported source selection, not an assertion that the dirty tree is a published commit.

All original historical reports, failed receipts, source inputs and contributor attribution remain preserved. The historical 67/69 controlled and 27/29 application results remain unchanged; later focused conflict passes did not close them. The [fresh baseline command receipts](baseline/commands.json) establish:

| Baseline | Actual result |
| --- | --- |
| Pinned build/typecheck | Pass |
| Controlled worker | 68/69 plus production-root rejection; cancellation failed with creation uncertain/cleanup unknown |
| Application/persistence/interfaces | 27/29, two parser-cleanup errors; genuine CLI exits 0/1/2/3 observed |
| Original lifecycle regression subset | 1/9; eight failures retained before rebuilding the correction |
| Original boundary-harness regressions | Four failures retained |

See [diagnosis](diagnosis.json), [lifecycle baseline](regression-baseline-extended.json) and [boundary baseline](boundary-harness-baseline.json). A later green result does not erase any failure.

## Established causes and implemented corrections

- **Create/cancellation:** the real baseline cancellation at 1,200 ms killed the create client before acknowledgment and lost settlement authority. The verifier now waits for the existing bounded create result, checks cancellation after acknowledgment, skips start and cleans the exact ID. A genuinely lost acknowledgment remains uncertain. The handshake-driven regression requests cancellation before the fake daemon releases acknowledgment, preventing a timing-only false positive.
- **Identity/cleanup:** the verifier discarded Docker's full acknowledged ID, used its UUID name for later controls and relied on English missing-object text. Controls now use the immutable ID; full inspection validates ID/name. Only a successful full-ID listing returning no objects establishes absence. Failed/partial/unexpected queries remain unknown; mismatched identities are never removed.
- **Failure versus absence:** timestamps, operation durations, configured limits, exits/errors, primary failure and cleanup failure are retained. A failed inspection/removal stays indeterminate even when the final exact query proves absence. Cleanup status cannot silently upgrade the result.
- **Parser boundary harness:** its hard-coded ten-second window differed from the product's existing settings, controls used names, and its outer cleanup could delete still-mounted files after uncertain creation/removal. The harness now follows the existing create/control/whole-job settings, uses immutable IDs, queries exact absence, retains failed operations and preserves uncertain mounted inputs. It emits an explicit failed receipt instead of deleting uncertainty.
- **Native admission:** ambient `docker info` could inspect a different engine from production's fixed local socket. The runner now probes the same local endpoint with a sanitized environment and requires successful tool observations. The prepared workflow retains the controlled runtime identity, bootstrap and exact built host/worker bytes alongside fixture/report evidence.

Focused corrections pass [11 lifecycle checks](regression-corrected-01.json), [four boundary-harness checks](boundary-harness-corrected-01.json) and [three native-guard tests](../2026-11-02-technical-closure-native-01/runner-guards.json). These authored control fixtures are not Docker or cryptographic acceptance; the full real suites below are separate.

**No product cap, root, trust format, target-execution permission or G0 contract was changed.** Current parser create/control/wall settings were already 30/10/30 seconds; verifier create/start controls remain ten seconds, other controls five seconds, with the existing five-second GNU timeout supervisor. Historical ten-second probe observations retain their original scope. Production bootstrap and worker identities remain unchanged; the revised launcher is separately identified by the source manifest and engine code fingerprint.

## Docker Desktop limitation

The fresh baseline reproduced two real parser cleanup failures. For `wrong-workflow-0-0-2`, the journal completed `OK`, while the original durable outcome remained `cleanupConfirmed: false`. Exact [name](baseline/parser-failure-daemon-name.txt) and [ID](baseline/parser-failure-daemon-id.txt) daemon lines show removal taking **24.443398011 seconds**, beyond the unchanged ten-second cleanup control. The original store, spool and locks remain retained. Source-selection/hash I/O ran concurrently during this segment; this is operating context, not proof of the underlying cause. The corrected full suites run serially after that packaging operation and the baseline have settled. No daemon restart, host-setting change, deadline increase, parser fallback or guessed lock release is claimed as a repair. Native execution remains necessary, and a local pass alone cannot establish that arbitrary host/VM scheduling latency is eliminated.

## Genuine provenance evidence

The [independent search report](../2026-11-02-technical-closure-provenance-01/README.md), [capture](../2026-11-02-technical-closure-provenance-01/capture.json) and [integrity review](../2026-11-02-technical-closure-provenance-01/integrity-review.json) cover 48 requests/47 distinct releases across twelve families, with 31 captured attestation sets and 62 decoded logs: 27 `dsse/0.0.1`, 35 `intoto/0.0.2`, **zero `dsse/0.0.2`**. All captured hashes and log/body classifications match. No genuine required-format example was discovered, so zero genuine `dsse/0.0.2` cryptographic positives were executed. Alternative-format classification is not verification, and the search is not exhaustive.

Pinned primary sources document upstream discontinuation of Rekor-v2 `dsse/0.0.2`. This supports an owner decision, not a silent acceptance change. Options remain: retain the historical npm-sample gate; explicitly amend the obsolete-format requirement and unsupported behavior; or separately scope and admit current hashedrekord support. No option was selected. Controlled signatures, `intoto/0.0.2` and generic/staging DSSE examples cannot substitute for required production-root npm proof.

## Native execution and owner decisions

[Native discovery](../2026-11-02-technical-closure-native-01/README.md) found Darwin ARM64 and an AArch64 Docker Desktop engine, with no configured accessible authorized native runner. [Actual source-bound admission](../2026-11-02-technical-closure-native-01/admission-final/admission.json) confirms pinned tools and zero source mismatches, then exits 2: [NATIVE_LINUX_AMD64_UNAVAILABLE](../2026-11-02-technical-closure-native-01/admission-final/summary.json). **Zero native checks executed; native acceptance is false.** Prior Phase 1 Linux/CI proof at `7eee564` retains only its original scope.

Resolution requires an accessible authorized native Linux x86_64 runner with the pinned tools/images, or separate authorization for the concrete feature-source publication and CI route. The portable source archive, runner and manual workflow are prepared; the owner is not assigned test implementation/execution. No new paid host is assumed. Native admission and the genuine-format requirement are independent blockers. The decision register's P2-REAL-FORMAT row records the prospective profile options; existing owner/reviewer/browser acceptances remain closed and are not requested again.

## Corrected full validation

The [source-bound command receipts](validation/commands.json) and [aggregate result](validation/summary.json) retain actual commands, stdout/stderr, exits, durations/resources, source-before/after verification and limitations. This is explicitly a macOS ARM local rehearsal, not native acceptance, exact-head CI, GUI/AT or population/held-out accuracy. All **17 validation commands passed**, with zero blocked checks and **zero selected-source changes**. Aggregate exit is 0; native acceptance remains false.

| Executed check | Result / evidence |
| --- | --- |
| Pinned build/typecheck | Pass; [command receipts](validation/commands.json) |
| Contracts | Full schema/semantics; seven valid fixtures × three shapes, ten invalid cases rejected; seven bridge smoke cases pass |
| Full serial core | **206/206**, no skips; [log](validation/core.stdout.log) |
| Actual parser boundary | **2/2** resource/network/mount/CPU probes, exact cleanup confirmed; [receipt](validation/parser-boundary.json) |
| Production-root worker | **82/82**; [summary](validation/production-worker/summary.json) |
| Full controlled worker | **69/69**, plus successful production-root rejection; [summary](validation/controlled-worker/summary.json) |
| Full controlled application | **29/29**, all 28 reports plus invalid-input check; genuine exits **0/1/2/3**; [summary](validation/controlled-application/summary.json) |
| Reader/TUI model | **40/40**; [log](validation/readers-tui.stdout.log) |
| Web | **79/79**; [log](validation/web.stdout.log) |
| Historical s3/audit/handoff | All three pass; [commands](validation/commands.json) |
| Scanner tests / native guard tests | **9/9** and **3/3** |
| Source package integrity | Pass, including selected hashes/notices and preserved research hashes; omitted historical destinations remain explicit |

The actual controlled application checks persisted engine-produced reports and compares original CLI/shared-reader/TUI-model/web-loader facts. It does not fabricate reports or claim a new GUI/AT observation. Both baseline parser-failure families pass in the corrected serial application capture under unchanged product settings. This supports the local conformance result, while the earlier 24.44-second daemon removal and its operating context remain recorded limitations.

## Preservation and later settlement

The [preservation audit](preservation.json) rehashed **69,698 original candidate files**: no original file was removed, no historical evidence changed, no unexpected original modification occurred, and the staged diff/inventory is unchanged ([stage proof](index-stage-inventory.json), not a claim about physical index stat-cache bytes). Exact draft narrative bytes captured in the source-exclusion ledger are separately retained in [snapshot receipts](narrative-snapshots.json). Thirteen original files changed only within the stated implementation/documentation scope; the new regression files and evidence are separate additions. All 11,465 selected source hashes still match the validation manifest. Both failed baseline parser stores retain their original outcomes, private spool and both locks. [Delivery status](delivery-status.txt), [tracked diff summary](delivery-diff-stat.txt) and [exact runtime correction identities/diffs](corrections.json) are retained.

A separate [later settlement](baseline-followup.json) inspected the exact stopped verifier object left by the baseline cancellation, admitted its UUID/full ID/fixed image/read-only worker mount, removed that full ID and confirmed exact absence. It also observed later absence of the daemon-bound failed parser ID. This resolves that session's inert verifier orphan; it does not change the baseline's unknown cleanup at its decision time or release/delete any parser store/spool/lock.

The [selected-source credential scan](selected-source-scan.json) completes 1,470 supported text files / 23,555,726 bytes with zero recognized matches or required read/budget failures. The other 9,995 selected files have unsupported types for this scanner and remain outside that scan's coverage; all selected hashes are checked separately. Unknown credential formats, ignored/private files, Git history and archives are not claimed scanned. Final documentation/diff checks are retained in `postchecks.json`.

## Final blocker dispositions

| Blocker | Disposition | Remaining condition / authority |
| --- | --- | --- |
| Docker create, timeout, cleanup and application reliability | Established code/harness defects corrected; full local real-worker/application suites pass. Exact baseline orphan safely settled. Historical/operating latency remains an explicit limit, not an erased failure. | Native execution remains required; the underlying Desktop/host delay is not proved eliminated. No cap or acceptance change is authorized by a retry. |
| Genuine npm `dsse/0.0.2` | **Open:** expanded independent research found no eligible sample. Controlled positives do not close it. | Find and production-root-validate an actual historical npm pair, or obtain an explicit prospective versioned profile/acceptance amendment. Existing draft/report meaning must remain preserved; hashedrekord is separate scope. |
| Native Linux amd64 | **Blocked by execution capability:** exact-source admission ran and rejected this host; zero native checks. Portable runner/workflow and source artifact are ready. | Accessible authorized native Linux x86_64 runner, or separately authorized concrete source publication/CI execution. The owner is not assigned test work; no paid infrastructure is assumed. |

Local implementation and the available full validation are complete. **Actual Phase 2 technical closure is not established.** Current requirements remain in force, owner/reviewer/browser acceptances retain their prior scope, Phase 3 stays blocked, and publication remains unauthorized.

