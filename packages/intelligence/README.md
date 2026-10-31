# `@heurisko/intelligence` — Malhar's M0–M2 scope

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
deterministic result intact. M0 defines this boundary; M1/M2 behavior is
described below.

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
and contradictory equality records. A separate public setuptools 60.0.0 probe
verifies wheel and source archive digests, checks selected excerpt digests,
detects the wheel-only `.pth` startup hook, and keeps the generated-file
relationship unverified. It does not execute the package or hook. The real
probe does not cover an npm lifecycle-manifest delta; those rules are covered
by synthetic cases only. This does not establish broad package accuracy.

## M2 lexical retrieval baseline

`retrieveEvidence` ranks caller-resolved, bounded excerpts with a deterministic
BM25-style lexical score and a small explicit vocabulary bridge for package
terms such as startup hooks, wheels, provenance, and commits. It accepts an excerpt only when its evidence ID exists in the
bundle, the parent record marks content retained and addressable, the content
reference matches, and the record supplies an exact path and line range. The
returned excerpt keeps the original evidence ID and locator. A missing result
does not imply that relevant evidence does not exist; skipped records and
selection limits remain visible.

The intelligence package does not read `contentRef`, access the filesystem,
verify retrieved bytes against a digest, or create excerpts from raw files.
Those responsibilities remain with the evidence store, which must provide
bounded content verified against its retained record. `validateRetrievedCitations`
checks that cited IDs are known and were retrieved; it does not establish that
a cited excerpt entails a model claim. `validateInterpretationDraft` checks a
strict draft shape, known finding IDs, retrieved evidence IDs, finding/evidence
alignment, and explicit abstention when a draft has no citations. Runtime
metadata comes from the caller. Its `validation: passed` records structural and
reference checks only; it does not mean the hypothesis is supported by the
excerpt. The pinned setuptools questions retrieve every manually labeled
relevant excerpt at k=5 (Recall@5 1.00); average Precision@5 is 0.80 and MRR@5
is 0.75 across two queries. This is a two-question result, not a general
retrieval-quality estimate.

`packageInterpretationPrompt` packages fixed system instructions separately
from a JSON user payload containing bounded findings and retrieved evidence.
The payload labels those values as untrusted data, preserves evidence IDs and
exact path/line locators, exposes no tool channel, and omits whole excerpts that
exceed the configured size bound. This structure does not eliminate prompt
injection or prove that a model follows the instructions. Synthetic probes put
instruction-like and unsupported-claim text inside an evidence excerpt and
verify that it remains in the data field. The tests do not call a model.

## Current behavior

`analyzeEvidence(bundle, options)` returns the shared `AnalysisResults` shape
and runs deterministic rules even when AI is disabled. The explicit
`analyzeEvidenceWithOpenRouter` adapter uses pinned
`qwen/qwen3-coder-next` only when both caller and runtime flags opt in. It sends
bounded public evidence to a no-tools request, retries transient provider
errors, records the served model and usage, strictly validates JSON and
references, rejects mixed abstention, and rejects unverified provenance or
build-origin claims. Failure or rejection preserves deterministic findings.
It does not establish semantic entailment; limitations require human review.
The adapter is not yet connected to a CLI/TUI or end-user investigation flow.

The v12 two-query live run made two real OpenRouter calls. The answerable
startup-behavior question returned an accepted interpretation with four
retrieved citations; internal claim/evidence review found the behavior claims
supported by their cited artifact/source excerpts. The direct provenance
question produced a non-abstaining draft and was rejected by the deterministic
provenance gate. Retrieval scored Recall@5 1.00, Precision@5 0.80, and MRR@5
0.75; citation-ID validity was 1.00 over four IDs. The adapter's narrow live
probe condition is met, but this two-question, one-package result is not
independent cross-review, a general quality estimate, or semantic entailment
validation in code. The accepted draft also recommends “SLSA Level 3+”; that
level is not established or required by the evidence and must not be treated as
project policy. See `experiments/rag/runs/product-qwen-setuptools-live-v12.review.md`.

The immediately following prompt-only v7 experiment rejected both answers;
the active prompt remains v6 and the v12 probe is the reference run. A real
npm lifecycle-manifest case is still pending Shane's pinned artifact/source
fixture, which the intelligence package needs to probe that rule on real npm
evidence. Organizer confirmation remains required before hosted P04 demo use.

## Local CodeAstra paired-code triage

The opt-in `analyzeCodeAstraEvidence` stage adds a local model hypothesis for
changed code when the caller supplies a function-level source/artifact pair.
It scores both sides with the same prompt, compares their vulnerability
probabilities at the model card's `0.3346` threshold, and links any emitted
interpretation to the original evidence IDs and deterministic change finding.
It never changes integrity, provenance, deterministic severity, or exit status.
Use it to ask whether a published code change has a different first-pass
vulnerability signal from the pinned source; it does not answer artifact/source
provenance or explain arbitrary file differences.

The caller must select bounded function excerpts and supply each excerpt with
its exact retained content reference, path, language, line range, and evidence
ID. The adapter checks that each excerpt exactly matches the caller-resolved
retained lines. It skips unpaired changes, unsupported languages, mismatched
references/locators, and prompts over CodeAstra's 2,048-token limit. A score
below threshold is not a safety result. Model-reported CWE/OWASP names are
hypotheses; they need human or independent static-analysis review.

`experiments/codeastra/worker.py` is a CPU-only JSONL worker for a local
CodeAstra installation. It does not download model files or execute source. It
requires caller-pinned model and HobbyLM runtime revisions plus SHA-256 values
for the weights/config before loading them. The TS adapter accepts a local
scorer implementation, so an integrating application can manage the worker
lifecycle without adding Python or model weights to the core package. The
worker needs the pinned local HobbyLM checkout plus the isolated Python
dependencies in `experiments/codeastra/requirements.txt`. Malhar's local
machine has these installed; the weights, checkout, tokenizer cache, and dataset
remain ignored and are not bundled in the repository.

The published model card describes 500M F32 parameters, reports 27.40% success
on vulnerable/patched function pairs, and says its training data is 92% C.
Those are upstream claims, not Heurisko measurements. The pinned 50-pair local
held-out run scored 44 pairs: 13.6% paired correctness, 20.5% patched
specificity, and 68.2% within-pair ranking; 6 calls failed on unsupported
language or context size. Ranking is close to the card, but fixed-threshold
behavior is materially worse and needs investigation. This dataset family
contributed to training, so it is not independent of the training source and
does not establish package-level accuracy. CodeAstra remains supplementary and
does not replace the RAG answer model or oracle evaluator. See the [local setup
and evaluation notes](../../experiments/codeastra/README.md) and [per-pair
results](../../experiments/codeastra/results/paired-test-sample-50.json).
