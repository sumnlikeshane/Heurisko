# `@heurisko/intelligence` — M0 boundary

## Shared contract review

Malhar reviewed the shared `EvidenceBundle`, `Finding`, `AIInterpretation`, and
`AnalysisResults` definitions in `packages/contracts` against the approved
Shane–Malhar agreement. The boundary is usable as written; this review proposes
no shared-schema changes. Shane's delegated G0 acceptance is recorded in
`docs/Approved/HEURISKO_SHANE_MALHAR_PRE_SPLIT_AGREEMENT_APPROVED_v0.1.0.md`
(E09). This package does not introduce a model-specific result format.

Deterministic observations belong in `AnalysisResults.findings`. Model
hypotheses belong in `AnalysisResults.interpretations` and must reference
existing finding/evidence IDs. An unavailable or disabled model leaves the
deterministic result intact. M0 currently emits no findings because no rules
are implemented.

## M0 evidence and retrieval boundary

M0 reads the supplied bundle's declared limitations and does not open content
references, acquire files, or create chunks. The immutable evidence IDs and
locators in the input remain authoritative. Evidence collection, provenance
status, and trust decisions belong to the caller/collector, not this package.

For later bounded retrieval, only content explicitly retained and addressable
through an evidence record may be considered. Every derived excerpt must carry
its parent evidence ID and the exact line or byte locator from that record. A
combined excerpt must retain every contributing evidence ID. The system must
not mint replacement IDs, infer locations, merge records that lose their
origin, or turn omitted/unavailable content into a clean result. Any selection
or omission policy must be visible in the analysis limitations. M0 creates no
such excerpts, so no evidence ID is transformed or lost here.

## Labeled M0 cases

The contract cases in `packages/contracts/tests/fixtures/` are clearly marked
`synthetic_contract`; they are interface fixtures, not training data, public
package examples, or measured analyzer results. The case map in
`tests/fixtures/m0-case-labels.json` links each responsibility to its fixture
and states the fixture's limit. In particular, F4 represents an opaque native
artifact omission; its filename does not prove executable behavior. The
hostile-comment case is inert text for a future prompt-injection test, never an
instruction to execute.

## M1 deterministic baseline

The analyzer now reports evidence-backed changes to `scripts.*` manifest keys,
package entrypoint metadata (`main`, `module`, `types`, `exports`, `bin`, and
related keys), generated-output candidates, and other unresolved file changes.
It cites only IDs present in the bundle and generates stable finding IDs from
the rule, change ID, and evidence reference. A changed key without retained
old/new values is described as a key change; the analyzer does not invent the
command contents or call a modification an addition. Installation lifecycle
entries receive review priority without an intent or safety verdict.

Generated candidates remain hypotheses unless the change and linked build
record explicitly say `reproduced` and the build record is marked verified.
Even then, reproduction is correspondence evidence and does not establish
benignness. Opaque or omitted members remain unresolved; filename suffixes do
not establish that a file is executable. Changes without evidence IDs generate
no finding and add an analysis limitation.

These rules use the contract's supplied evidence only. The local M1 regression
suite uses labeled synthetic contract cases to check lifecycle and script
changes, entrypoint changes, generated candidates, omissions, uncited changes,
and contradictory equality records. It checks schema validity and evidence
references, not real package accuracy or generalization.

## Current behavior

`analyzeEvidence(bundle, options)` returns the shared `AnalysisResults` shape.
With AI disabled it records that state and skips AI. If AI is requested, it
returns `unavailable` and an `AI_ADAPTER_NOT_IMPLEMENTED` stage error. The
deterministic stage runs the bounded rules described above. This is an initial
static baseline, not a complete analyzer, real-data evaluation, or product
model integration.
