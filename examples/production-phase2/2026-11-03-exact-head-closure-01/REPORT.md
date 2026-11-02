# Phase 2 exact-head technical closure

The native implementation gate is met on `60e9f40ddb210095637d6689a3422ad8696ffb87`. Final Phase 2 acceptance requires all four existing CI jobs and the native workflow on the repaired final [PR #7 head](https://github.com/sumnlikeshane/Heurisko/pull/7/checks). This report records actual source-bound proof and the discovered CI repair; it does not turn the earlier failed records into passes. Phase 3 has not started. Merge, release, deployment and paid infrastructure remain excluded.

The original approved 334-file selection was rehashed and committed with message `Implement Phase 2 investigation and provenance profiles`, then pushed normally to `foundation/phase2-technical-closure-20261102`. [Preparation verification](precommit-recheck.json) has zero missing/unexpected paths or byte mismatches. [Preservation](preservation.json) confirms the original branch/HEAD, all 334 original selected files, the original index-stage SHA-256 `173199d4e2322b05a073130ef3ee9a45bc75a843457c9fd08180cf4c127180ff`, and the unrelated Phase 1 PTY workspace. The `.venv` symlink is excluded.

## Native execution and artifact review

[Native run 41501497781](https://github.com/sumnlikeshane/Heurisko/actions/runs/41501497781) passed its full 18-command runner. [The artifact inspection](native-review-02.json) verifies every one of the 11,471 selected source blobs against immutable Git source `60e9f40`, the before/after source receipts, command exits, runtime/fixture hashes, all worker result/cleanup rows, original application report hashes/outcomes and source-unavailable omissions. [Member hashes](native-artifact-members.json) retain all 1,957 artifact entries. This is artifact inspection, not independent human or held-out evaluation.

The retained [native artifact ZIP](closure-native-linux-amd64-60e9f40ddb210095637d6689a3422ad8696ffb87.zip) matches GitHub's digest `e6ff30722e47c87a9bd1453273358619feaa3c44b052b5527bed3beb66ca75db`. It includes the original admission, manifest, commands/stdout/stderr/resources, controlled public fixtures and compiled runtime identities, per-case worker receipts, persisted reports and content-addressed evidence. The source manifest SHA-256 is `b6ec344e65b883cd6016604295076f913d3b652a222771b3ecf0232dc4d123ba`; no selected source changed during validation. [The review script](review-native.py) reads the retained ZIP and Git blobs without running targets.

Host/engine admission established Linux kernel `7.0.0-1017-azure`, host x86_64 and Node linux/x64, Docker 29.4.2 on Ubuntu 26.04.1 LTS with an x86_64 native local engine, Node 22.23.4, pnpm 10.14.0 and Python 3.13.17. The worker is `linux/amd64` using the pinned image. Its production SHA-256 is `9e13daace8ae961d9ed60d63dfe3cedc48364d44ac56ccdacec3868a375d00e1`, matching the prior local/isolated builds. The fixed production bootstrap, resource/network limits and G0 contract are unchanged.

| Executed native check | Actual result |
| --- | --- |
| Build/typecheck, contracts, native guard tests | Pass |
| Full serial core | 209/209; zero skips |
| Real parser resource/network/mount/CPU boundary | 2/2; exact cleanup confirmed |
| Production-root signed npm worker | 82/82 |
| Full current/legacy controlled worker | 61/61; production rejects the controlled anchor |
| Controlled application/persistence/interface facts | 24/24; all 23 planned reports attempted; genuine CLI exits 0/1/2/3 |
| Genuine retained npm application | 5/5; source-unavailable reports stay incomplete/non-exact |
| Shared reader/TUI model; web | 40/40; 79/79 |
| Scanner regression tests | 9/9 |
| Historical s3/audit/handoff and selected-source integrity | All pass |

## Discovered CI failure and concrete correction

[Existing CI run 41501497603](https://github.com/sumnlikeshane/Heurisko/actions/runs/41501497603) passed documentation, web and inactive-intelligence jobs. Its contracts job passed build, contracts, full serial core, parser boundary, three historical replays, native architecture, real lifecycle/resource/foundation checks and fresh npm default/no-AI/raw analyses. The final `npm-parity` assertion failed. The [unaltered failed artifact](phase1-native-linux-amd64-60e9f40ddb210095637d6689a3422ad8696ffb87.zip) matches GitHub digest `9ee88a2be798e8c42ff08c9bc76a3d94b098aee71e6136d0847cf927b17e98a3`.

[Diagnosis](ci-failure-diagnosis.json): both runs have the same 17 finding facts and all six outcomes. Only two source-candidate findings' citation IDs differ: sequential GitHub tag captures recorded different numeric rate-limit headers. The old checker already allowed different acquisition-bound report IDs, but still demanded identical finding citation IDs. Phase 2 now exposes those capture-bound citations, making the old assertion inconsistent with its own acquisition model.

The repaired checker first verifies each original report, store and reader/web evidence independently. It then compares every finding fact and every cited descriptor/content, projecting only numeric `x-ratelimit-remaining` and `x-ratelimit-reset` header values inside explicitly identified version-tag claims. Header presence, URL/status/body digest, source commit, failure, trust fields and every other citation remain checked. Finding/report/citation IDs and retained bytes remain observation-specific and unmodified. Four focused positive/adverse tests run in existing CI. [The corrected replay](npm-parity-corrected-02.json) passes against these exact failed reports/stores, without network, reanalysis or byte rewriting. Final exact-head CI is required after this harness repair.

## All three original blocker dispositions

| Original blocker | Evidence-backed disposition |
| --- | --- |
| Docker create/cancellation/identity/cleanup and application reliability | Established launcher/harness defects corrected: await bounded creation, avoid canceled start, use/inspect full immutable ID, query exact absence, preserve primary/cleanup failures and uncertain spools. Native full core, lifecycle, resource, worker and application matrices pass under unchanged limits. The original Desktop delays remain an operating limitation; arbitrary host/VM latency is not proved eliminated. |
| Genuine npm dsse/0.0.2 | Resolved prospectively by the approved versioned draft.2 profile, which supports genuine-validated dsse/0.0.1. No dsse/0.0.2 sample or positive is invented. dsse/0.0.2, intoto and hashedrekord remain unsupported/indeterminate. Explicit legacy draft.1 and original reports preserve their meanings. |
| Native Linux AMD64 execution | Resolved by actual native exact-head execution, source/admission/worker identity and complete artifacts above. ARM/emulation and Phase 1's older results are separate evidence. |

## Limits and final acceptance

[Local diagnosis](local-diagnosis.json) retains the fresh sandboxed core failure: 156/209 passed, all 53 failures were parser cleanup uncertainty after Docker socket access was denied. Two unrestricted Docker info probes subsequently stalled and were terminated; the prerequisite failed before a local core rerun. No daemon restart, cap change, guessed lock release or evidence cleanup occurred. Local build/typecheck, contracts, docs and intake passed. These failures are not relabeled by the native pass.

Original closure reports/CLOSURE records, research snapshots, original reports/blobs and all earlier failures remain unchanged. Controlled signatures are authored test-only material; genuine npm replay uses the already admitted public archives/envelopes under their retained notices. The retained runtime bundle contains its third-party notices. No private signing key is serialized. Common-credential scans are bounded and exclude archive contents, unknown formats, ignored/private files and Git history.

No independent/held-out/population accuracy, new GUI/AT pass, model activation, target execution, safety verdict or deployment is claimed. Existing owner/reviewer/browser acceptance stands within its recorded limits. The three original technical blockers have dispositions; the final remaining check is all five successful checks on the repaired proposed head, recorded by PR #7. Merge/release/deployment still require separate owner authorization. Future feature scope and conditional binary/image/full-history rights decisions remain outside Phase 2 closure.
