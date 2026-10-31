# Heurisko documentation map

**Current state, 31 October 2026:** Phases 01–06 and the Shane–Malhar A01–A14 engineering agreement are approved planning decisions. The G0 contract is integrated in [packages/contracts](../packages/contracts/package.json); local checks and PR #2 CI passed. Shane instructed Codex to review it and treat the team as accepting it on that review, recorded in agreement E09. PR merge remains pending. No product analyzer, model integration, monitor, TUI, or browser is implemented.

## Read in this order

1. [Approved decision register](Approved%20Decision%20Register.md) — confirmed decisions and their limits.
2. [Team development checklist](Team%20Development%20Checklist.md) — consolidated implementation handoff, ownership, G0–G6 gates, and final delivery checks.
3. [Engineering agreement](Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md) — A01–A14 shared boundaries and the G0 annex.
4. [Approved phase records](Approved/phases/) — full Phase 01–06 decisions; Phase 01/02 were reconstructed from approved in-chat drafts, as stated in the original bundle.
5. [G0 candidate README](G0_Candidate/README_G0.md) and [root contract package](../packages/contracts/package.json) — preserved handoff and integrated synthetic contract. Review before interface-dependent work.
6. [Original research](Heurisko_Research/) and [organizer files](Governing/) — evidence, alternatives, and event obligations. The research founder register predates the approvals and retains its historical “proposed” labels.

Current user instructions and organizer rules control the work and submission process. Later approved decisions supersede earlier research proposals where they conflict. The full approved phase records govern the shortened register and checklist. Shane's later G0 acceptance instruction delegated technical review to Codex on behalf of the team, and PR #2 CI passed on `0e6adb9`; this does not claim an independent Malhar review. The [early work split](Shared_Notes/work_split.md) remains only as provenance.

## Migration record

The supplied `HEURISKO_COMPLETE_HANDOFF/` bundle verified against all entries in its original SHA-256 manifest before migration. Its five research files matched the copies already in `Heurisko_Research/` byte-for-byte. The bundled consolidated handoff matched `Team Development Checklist.md` byte-for-byte, so the latter is the single working copy. The newer decision register, which adds A01–A14, replaced the older top-level register. The duplicate engineering agreement was kept once under `Approved/`. The six phase records moved to `Approved/phases/`. The G0 drop-in moved to `G0_Candidate/` as a non-installed starter. The original top-level handoff folder was removed after these checks.

[Original handoff checksum list](Approved/ORIGINAL_HANDOFF_SHA256SUMS.txt) records the pre-migration bundle layout and bytes. It is a historical receipt, **not** a manifest for current paths or edited files. The preserved research snapshot retains its active [checksum manifest](Heurisko_Research/SHA256SUMS.txt).

## Still open before product claims

- A 31 October audit found gaps in integrity/provenance success conditions, report IDs, and omission accounting; the candidate was revised and copied into the root workspace. The original G0 log describes the pre-audit candidate. The revised full JSON Schema/semantic suite passed in a temporary Python environment with `jsonschema==4.26.0`; pinned TypeScript typecheck and seven stubbed handshakes passed locally. [PR #2 CI](https://github.com/sumnlikeshane/Heurisko/actions/runs/41222794704) passed both jobs on `0e6adb9`. Shane's delegated acceptance is recorded in E09. PR merge is still required for the shared `main` baseline; these synthetic checks do not validate product behavior.
- The product root still needs an analyzer implementation, actual model inference, monitored releases, generated examples, tested analyzer installation instructions, and analyzer CI.
- Apache-2.0 was selected under Shane’s delegated choice on 31 October 2026; the local [LICENSE](../LICENSE) and [NOTICE](../NOTICE) await an approved commit/PR. Exact dependency/model versions, verifier policy, resource limits, sandbox, watch schedule, retention, and exit-code precedence require recorded implementation decisions and validation.
- Commits, pushes, pull-request publication, merges, and external submission require their own authorization under [AGENTS.md](../AGENTS.md).
- Before publishing the bundled organizer DOCX/PDF, confirm their redistribution terms. The root Apache-2.0 license applies to original Heurisko material and does not grant rights in those files.
