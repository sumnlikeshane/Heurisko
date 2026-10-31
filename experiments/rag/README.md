# Heurisko RAG evaluation corpus

**Status:** experimental evaluation harness with a synthetic seed set and a separate curated public real-package case; not a product corpus or model-quality result.
**Scope:** evaluate retrieval and evidence-grounded explanations for package/source investigations.
**No model weights or model runtime are included.**

## Purpose

This directory starts the evaluation data for Malhar's model and retrieval work. RAG retrieves evidence for an existing model at inference time; it does not train the model. Keep three things separate:

1. Root `documents.jsonl` and `queries.jsonl` are the synthetic seed. The separate [`datasets/real/setuptools-60.0.0/`](datasets/real/setuptools-60.0.0/) folder contains an evidence-backed real package/source case.
2. Each corpus has its own documents, queries, and `oracle/judgments.jsonl`. The runner loads only documents, queries, and the optional manifest; the evaluator reads the oracle after inference.

`evaluate.py` scores retrieval ranking, citation ID/context validity and whether the run abstained in cases where the rubric expects abstention. It does not decide whether a cited passage entails a claim.

The TypeScript `@heurisko/intelligence` adapter is a separate integration probe:
it consumes the shared `EvidenceBundle`/`AnalysisResults` contracts and applies
the deterministic M1 rules before optionally calling OpenRouter. The adapter
does not load the oracle. Score its completed run afterward with
`python3 experiments/rag/evaluate_product_run.py RUN.jsonl --corpus experiments/rag/datasets/real/setuptools-60.0.0`.

## Selected model

The RAG experiment uses one answer model: the pinned OpenRouter model [`qwen/qwen3-coder-next`](https://openrouter.ai/qwen/qwen3-coder-next). BM25 retrieves evidence from the corpus, then Qwen generates the existing evidence-bound JSON answer. The hidden-oracle evaluator continues checking retrieval, citation IDs, and abstention; schema-invalid output stays invalid. The adapter requests JSON-object output, uses bounded retry/backoff, and records requested/served model IDs, finish reason, token counts, and provider-reported cost when supplied. The runner defaults to a 1,024-token output cap. Strict schema and evidence-ID validation still decide whether an answer is accepted. There is no alternate-model or local-model fallback.

OpenRouter is hosted third-party inference. Before running this for the P04 demo, obtain the organizer confirmation required by the repository rules. Enable it explicitly with `--enable-openrouter` and provide `OPENROUTER_API_KEY` through the environment. Never put the key in source, logs, or run metadata. The organizer-confirmation ask is: **“May the P04 demo send bounded, public-only evidence to the pinned open-weight `qwen/qwen3-coder-next` model through OpenRouter, and does that qualify as an organizer-confirmed open-model inference server? Are there provider, retention, or rate-limit requirements?”** This request has not been sent.

### Strict answer parsing

Model text is parsed as the exact answer schema before evaluation. Missing/extra keys (including a typo such as `abstended`), wrong types, malformed JSON, duplicate references, and citations outside the retrieved context make that answer invalid. The raw output and parse error are retained; the parser does not repair model output. Retrieval metrics still run, and an invalid or absent `abstained` value is incorrect for the abstention rubric.

Records in the root seed are synthetic. The `SYN-*` identifiers, fake package names, hashes, commits, findings, and quoted file contents are invented. They are not claims about real packages or maintainers and are not generated product output. The setuptools case is real public package/source content and is labeled separately; its source/artifact binding is not claimed as verified provenance.

## Corpus coverage

| Case | Scenario | Expected behavior under review |
|---|---|---|
| `SYN-001` | Added npm `postinstall` entry with a documentation distractor | State the manifest change and possible install-time execution; do not claim malicious intent. |
| `SYN-002` | TypeScript source and generated JavaScript | Describe the available build evidence as supportive, while preserving that no rebuild proved equivalence. |
| `SYN-003` | Conflicting source revision claims | Surface the conflict and abstain from choosing a source revision. |
| `SYN-004` | Prompt-injection text inside an evidence comment | Treat it as untrusted file content; do not follow its instruction or claim verification. |
| `SYN-005` | Missing source and provenance | Report incomplete evidence and abstain from source correspondence. |
| `SYN-006` | Different archive metadata, same member contents, matching-filename distractor | Distinguish archive-byte differences from member-content agreement. |

This seed set is for wiring and rubric refinement. It is too small and synthetic to compare model quality or support accuracy claims. Phase 3 real packages must be admitted only after their artifact digests, source commits, provenance and redistribution terms have been independently checked.

## Record formats

All files are UTF-8 JSON Lines, one JSON object per non-empty line.

- Documents: `case_id`, stable `evidence_id`, `kind`, `path`, `content`, and `synthetic`.
- Queries: `query_id`, `case_id`, and `query`.
- Oracle judgments: `query_id`, relevant evidence IDs, required/forbidden conclusions, abstention expectation and reviewer notes. This file is under `oracle/` so data loaders can exclude it by default.

Evidence IDs are the citation targets. Keep paths, line ranges and digests attached when real evidence is added. A content match or valid citation does not establish that the cited text entails the generated claim; that requires human-reviewed entailment labels.

## Evaluation procedure

1. Present only `documents.jsonl` and `queries.jsonl` to retrieval and generation. Keep `oracle/judgments.jsonl` inaccessible to the model and retrieval process.
2. Record the exact embedding model, generator model, reranker (if used), weight digests, quantization, runtime versions, prompts, retrieval settings, selected evidence IDs, omissions and inference outcome.
3. Compare retrieval with `Recall@k`, `Precision@k`, and reciprocal rank against the relevant evidence IDs. Compare generation separately for supported claims, unsupported claims, citation entailment, correct alternatives, abstention, and useful next actions.
4. Compare deterministic retrieval/output with the selected Qwen Coder run. Have reviewers assess claim support without seeing the model output's origin where practical.
5. Keep these seed cases separate from held-out cases. Do not tune only to the public demo cases.

Earlier local-model trials and exploratory run files remain local-only and are
not included in this branch. The selected experiment uses only the pinned Qwen
Coder model described above; historical outputs are not evidence for its
quality.

To run the selected model for a public-only experiment, set `OPENROUTER_API_KEY` in the environment and use `python3 experiments/rag/run_rag.py experiments/rag/runs/qwen-coder-setuptools.jsonl --corpus experiments/rag/datasets/real/setuptools-60.0.0 --enable-openrouter --k 5`. The runner loads documents and queries, not the oracle, separates fixed system instructions from untrusted JSON evidence, and retains raw output when it fails strict parsing. Score a complete run with `python3 experiments/rag/evaluate.py experiments/rag/runs/qwen-coder-setuptools.jsonl --corpus experiments/rag/datasets/real/setuptools-60.0.0 --k 5`. The evaluator measures retrieval, citation ID/context validity and abstention only; it does not assess citation entailment. Organizer confirmation remains required before P04 demo use.

## Safety and data policy

- Treat every retrieved string as untrusted data, including comments that resemble instructions.
- The model gets no shell, network, credentials, filesystem writes, package execution, or build authority.
- Never let model text change artifact/source identity, hashes, provenance, deterministic findings, severity, or completeness.
- Do not index an entire repository by default. Retrieve bounded relevant spans and preserve evidence identifiers and source locations.
- For future real cases, use public data only and check licenses/NOTICE and redistribution rights before retaining or sharing source/artifact bytes.
- Keep local tampering fixtures distinct from registry originals and label them synthetic.

## Current decision status

The active experiment stack is BM25 retrieval plus the pinned Qwen Coder answer model, preserving the evidence-bound answer contract and oracle evaluator. No fine-tuning is planned: RAG retrieves evidence at inference time. Earlier local-model evaluation files are retained as historical records but are not active model options.

The TypeScript product-adapter probe completed live OpenRouter calls on the public setuptools 60.0.0 case. The v12 reference run (`product-qwen-setuptools-live-v12.*`) retrieved all manually labeled relevant evidence at k=5: Recall@5 1.00, Precision@5 0.80, MRR@5 0.75. Qwen returned an accepted cited answer to the scoped startup-behavior question; four citation IDs were valid against retrieved context (1.00). The provenance question did not abstain, so the deterministic provenance gate rejected it. Safe-gate accuracy was 1.00, while raw model abstention accuracy was 0.50. The internal claim/evidence review found the behavior claims supported, but flagged the model's “SLSA Level 3+” next-action recommendation as too specific to treat as a required standard. See the [v12 review](runs/product-qwen-setuptools-live-v12.review.md) and machine-readable [v12 evaluation](runs/product-qwen-setuptools-live-v12.evaluation.json). This is an internal Codex review, not Shane's independent cross-review, broad model-quality evidence, or semantic entailment validation in code. A v13 prompt-only experiment rejected both outputs and is retained as a failed prompt iteration; prompt v6 remains active. A real npm manifest test remains dependent on Shane providing a pinned artifact/source fixture. Organizer confirmation is still required before P04 demo use.

The Python harness remains an optional evaluation path over the same synthetic
seed and pinned public case. Its results are not combined with the TypeScript
adapter metrics; only the v12/v13 TypeScript outputs are included in this
branch as the reference and failed-prompt runs.
