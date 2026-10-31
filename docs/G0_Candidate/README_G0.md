# HEURISKO — G0 Shared Contract Drop-in

**Status:** Revised candidate after the 31 October repository audit. Its contract package was copied into the root workspace at [packages/contracts](../../packages/contracts/package.json) for G0 closure work. **NOT YET jointly frozen, committed through a PR, or verified in GitHub Actions.** The original local validation log predates this revision. All contents in `tests/fixtures/` are **synthetic contract examples**, not actual package analysis, model inference, provenance validation, or security test results.

The audit revision adds conditional integrity/provenance success requirements, source-context report/evidence IDs, per-file coverage omissions, and five additional negative fixtures. These are candidate contract details within the approved trust rules, not a new team sign-off. The full current JSON Schema test passed locally in a temporary Python environment with pinned `jsonschema==4.26.0`; a remote repository CI run remains pending.

## Root integration and remaining acceptance

1. Read the revised split agreement at `../Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md`.
2. Review the root `packages/contracts`, `package.json`, `pnpm-lock.yaml`, `requirements-contracts.txt`, and CI job. The root copy is the implementation target; this folder preserves the handoff candidate.
3. Run the root commands below; both people inspect the report and validate actual fields/semantics before signing the G0 contract revision.
4. Commit through an organizer-compliant PR, record actual CI run and commit SHA, obtain both reviewers' sign-off. Only then mark **G0 PASSED** in the document.

## Files

- `packages/contracts/schema/contracts.schema.json` — JSON Schema draft 2020-12, candidate `0.1.0`. Definitions for `ArtifactInput`, `ArtifactIdentity`, `SourceCandidate`, `EvidenceRecord`, `EvidenceBundle`, `FileChange`, `StageRecord`, `CoverageOmission`, `Finding`, `AIInterpretation`, `AnalysisResults`, `InvestigationReport`, `WatchState`, `Job` and outcomes.
- `packages/contracts/src/types.ts` — matching TypeScript interfaces and type-level API signatures.
- `packages/contracts/tests/fixtures/F0` to `F6` — each contains `bundle.json`, `analysis.json` and `report.json` with synthetic IDs, not actual file byte analysis.
- `packages/contracts/tests/fixtures/F7` — watch/job *schema* examples only, no functioning monitor.
- `packages/contracts/tests/negative` — 10 intentionally invalid reports covering invented IDs, unsupported verified rebuilds, false integrity/provenance success, missing omission records, source-context ID changes and schema errors.
- `packages/contracts/tests/validate_contracts.py` — JSON Schema and independent semantic invariants; Python `jsonschema` pinned in `requirements-contracts.txt`.
- `packages/contracts/tests/smoke-handshake.mjs` — simulated API handshake using **stubbed** producers and fixture outputs, not real package retrieval or heuristic execution.
- `contracts-example.yml` — historical pnpm workflow **example**; the active contract job is now in the root `.github/workflows/ci.yml`. No remote GitHub run is verified.

## Candidate test commands

Run these from the repository root in an isolated Python environment; they do not test a real analyzer:

```bash
pnpm install --frozen-lockfile --ignore-scripts
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install -r requirements-contracts.txt
pnpm run typecheck
pnpm run test:contracts
```

In the original handoff environment, the direct checks were reported successful using Python 3.13 + `jsonschema` 4.26.0, Node 22.16.0 and `tsc` 5.8.3 (command-line compiler). That historical result is not a current repository CI result. This folder is parked under `docs/` and is not an installed product workspace.

The root copy passed the full JSON Schema and semantic check for seven positive fixtures and ten negative fixtures, plus the stubbed Node handshake and TypeScript 5.8.3 typecheck locally on 31 October 2026. Dependencies were installed only for this explicitly requested G0 closure work; no analyzed package was installed or executed.

## Approved split boundaries this does not change

- Shane's output is a deterministic evidence bundle, never inferred malicious intent.
- Malhar returns deterministic findings and optional AI interpretations, never rewriting verified artifact/source/provenance facts.
- Both must keep `artifactIntegrity`, `sourceAssociation`, `provenancePolicy`, `correspondence`, `analysisCompleteness` and `policyResult` distinct.
- A synthetic schema fixture cannot prove safe code, exact provenance, real-world parser correctness or AI quality.

## Important G1 follow-ups, not falsely claimed by G0

- Wire actual `collectEvidence`, `analyzeEvidence` and `investigate` implementations; stubs here exercise only the exact shape/data exchange.
- Add a production Node/TypeScript JSON Schema validator at actual module boundaries (e.g. pinned Ajv after package-install compatibility verification). This deliverable currently tests the canonical JSON Schema with Python.
- Decide whether to derive the entire report ID from a standardized canonicalization algorithm; fixtures use deterministic SHA-256 test IDs and should never be copied as authoritative report outputs.
- Verify that production artifact-integrity and provenance-success claims come from actual digest/signature/policy checks. The revised schema and fixture invariants can reject impossible shapes but cannot perform those verifications.
- Reconcile every skipped or unsupported file with a structured coverage omission and retained evidence reference. The added omission shape covers file-level gaps; acquisition failures remain in stage errors.
- Implement real content retention, line/byte locator validation against captured files, source identity resolution, native parser limits, model output entailment checks and filesystem/network isolation.
- Integrate CLI exit-code policy precedence testing and real release-monitor persistence/restart tests.

## Exit-code direction (already approved, but precedence tests pending)

- 0: requested checks complete + no configured policy violation; never universal safety.
- 1: explicitly configured policy violation.
- 2: materially incomplete analysis or inconclusive requested policy.
- 3: unusable invocation/internal failure.

The precedence when *multiple* outcomes occur in a single run is not selected by this G0 artifact. Do not let this omission change the policy silently.

## Validation after migration

On 31 October 2026, before the audit revision, `node packages/contracts/tests/smoke-handshake.mjs` passed its seven stubbed fixture joins, and a global `tsc --noEmit -p packages/contracts/tsconfig.json` check passed. The Python schema validator could not start because `jsonschema` was not installed in that original environment. After the revision, the root copy passed the full pinned contract suite and typecheck locally. These checks cannot replace both developers' sign-off, a passing remote CI run, or actual package-analysis validation.
