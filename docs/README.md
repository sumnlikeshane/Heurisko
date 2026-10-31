# Heurisko documentation map

**Current state, 1 November 2026:** Phases 01–06 and the Shane–Malhar A01–A14 engineering agreement are approved planning decisions. The G0 contract is integrated in [packages/contracts](../packages/contracts/package.json); local checks and PR #2 CI passed. Shane instructed Codex to review it and treat the team as accepting it on that review, recorded in agreement E09. PR #2 merge was confirmed during S1. Local S2 adds safe local archive/pinned-source evidence, immutable storage, raw comparisons and actual `analyze`/`inspect` commands. [Real retained examples](../examples/s2/current/README.md) include model-off checks of the separately received M0/M1 consumer code. S3 now adds exact npm/integrity and immutable source-candidate/subtree acquisition through the same producer; [real corpus and local handoff](../examples/s3/current/README.md) preserve unknowns and unsupported scope. Provenance verification, model integration, monitor, TUI and browser remain unimplemented.

## Read in this order

**For Shane's next implementation session:** follow [Shane's eight-hour implementation plan](Shane%20Implementation%20Plan.md). It is the single timeboxed execution sequence for his work, with gates, Malhar integration dependencies and exact next-session prompts. It does not replace the approved requirements below; section 12 records S1–S3 work, checks, exact case IDs and the distinct Malhar handoff.

1. [Approved decision register](Approved%20Decision%20Register.md) — confirmed decisions and their limits.
2. [Team development checklist](Team%20Development%20Checklist.md) — consolidated implementation handoff, ownership, G0–G6 gates, and final delivery checks.
3. [Engineering agreement](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md) — A01–A14 shared boundaries and the G0 annex.
4. [Approved phase records](Approved/phases/) — full Phase 01–06 decisions; Phase 01/02 were reconstructed from approved in-chat drafts, as stated in the original bundle.
5. [G0 candidate README](G0_Candidate/README_G0.md) and [root contract package](../packages/contracts/package.json) — preserved handoff and integrated synthetic contract. Review before interface-dependent work.
6. [Original research](Heurisko_Research/) and [organizer files](Governing/) — evidence, alternatives, and event obligations. The research founder register predates the approvals and retains its historical “proposed” labels.

Current user instructions and organizer rules control the work and submission process. Later approved decisions supersede earlier research proposals where they conflict. The full approved phase records govern the shortened register and checklist. Shane's later G0 acceptance instruction delegated technical review to Codex on behalf of the team, and PR #2 CI passed on `0e6adb9`; this does not claim an independent Malhar review. The [early work split](Shared_Notes/work_split.md) remains only as provenance.

## Audit repair handoff

Shane authorized the [audit repairs and Malhar handoff](Audit%20Repairs%20and%20Malhar%20Handoff.md) on 1 November. The core identity/progress/parser changes and new code-bound offline replay supersede the specific earlier failure modes; historical receipts remain unchanged. Full S4, actual intelligence/model/policy integration and remote delivery remain open.

## TUI design handoff

Before TUI work, read the [TUI Design Contract](Design/TUI%20Design%20Contract%20v1.0.0.md), approved Phase 02 and current shared types. The single consolidated candidate contains 59 confirmed preferences, wireframes, acceptance scenarios S01–S09 and blockers B01–B13. Its filename is v1.0.0, but its internal version is **v1.0.0-rc.1**, explicitly **not approved or frozen**. Verify the actual repository interfaces before depending on them; proposed details remain provisional.

**Filing record, 31 October 2026:** At Shane's request, moved the supplied root file into `docs/Design/` and linked it from agent instructions, the decision register, the team checklist and Part 4/S4 plus its next-session prompt in Shane's plan. This records the handoff; it does not approve the final design or start implementation. The design text and status are preserved; only three pre-existing appendix table-of-contents anchors were corrected for working navigation. Original supplied-file SHA-256: `35d11dcc8cc2bb76cf3aaf2c333fb9fc7e16f9db7f15650314f8825cbd75bdaf`.

**Part 4 nonvisual integration checkpoint, 1 November 2026:** [readiness report](Part%204%20Integration%20Readiness%20Report.md) maps actual report fields, engine seams, B01–B13 and S01–S09, with isolated candidate adapters and 24 passing headless checks. It also records the S3 recheck's unresolved parser lifecycle anomaly. The separate visual spike is untouched; S4/G3, live integration and final design approval remain open. Detailed receipts and clock remain in plan section 12.

## Migration record

The supplied `HEURISKO_COMPLETE_HANDOFF/` bundle verified against all entries in its original SHA-256 manifest before migration. Its five research files matched the copies already in `Heurisko_Research/` byte-for-byte. The bundled consolidated handoff matched `Team Development Checklist.md` byte-for-byte, so the latter is the single working copy. The newer decision register, which adds A01–A14, replaced the older top-level register. The duplicate engineering agreement was kept once under `Approved/`. The six phase records moved to `Approved/phases/`. The G0 drop-in moved to `G0_Candidate/` as a non-installed starter. The original top-level handoff folder was removed after these checks.

[Original handoff checksum list](Approved/ORIGINAL_HANDOFF_SHA256SUMS.txt) records the pre-migration bundle layout and bytes. It is a historical receipt, **not** a manifest for current paths or edited files. The preserved research snapshot retains its active [checksum manifest](Heurisko_Research/SHA256SUMS.txt).

## Still open before product claims

- A 31 October audit found gaps in integrity/provenance success conditions, report IDs, and omission accounting; the candidate was revised and copied into the root workspace. The original G0 log describes the pre-audit candidate. The revised full JSON Schema/semantic suite passed in a temporary Python environment with `jsonschema==4.26.0`; pinned TypeScript typecheck and seven stubbed handshakes passed locally. [PR #2 CI](https://github.com/sumnlikeshane/Heurisko/actions/runs/41222794704) passed both jobs on `0e6adb9`. Shane's delegated acceptance is recorded in E09. A later Part 1 read-only check confirmed PR #2 merged as `f06ac54`, with both jobs passing on `0e2be5a`; these synthetic checks do not validate product behavior.
- The product still needs admitted provenance verification, actual analysis/model integration, monitoring and interfaces. S2 has tested local-producer instructions, raw generated examples and configured producer CI; final shared analysis and remote validation remain open.
- Apache-2.0 was selected under Shane’s delegated choice on 31 October 2026; [LICENSE](../LICENSE) and [NOTICE](../NOTICE) are already tracked in `0e6adb9` through the prior G0 PR; newer engineering remains local. Exact dependency/model versions, verifier policy, resource limits, sandbox, watch schedule, retention, and exit-code precedence require recorded implementation decisions and validation.
- Commits, pushes, pull-request publication, merges, and external submission require their own authorization under [AGENTS.md](../AGENTS.md).
- Before publishing the bundled organizer DOCX/PDF, confirm their redistribution terms. The root Apache-2.0 license applies to original Heurisko material and does not grant rights in those files.
