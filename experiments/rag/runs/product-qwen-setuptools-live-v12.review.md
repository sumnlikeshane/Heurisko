# Product-adapter live run review — 1 November 2026

**Run:** `product-qwen-setuptools-live-v12.jsonl`
**Model:** `qwen/qwen3-coder-next` via OpenRouter
**Evidence:** public setuptools 60.0.0 wheel/source excerpts; no package code was executed.
**Review type:** internal Codex claim/evidence review, not an independent Shane review.

## Measured results

- Two live provider calls were served by the requested pinned model.
- Retrieval: Recall@5 **1.00**, Precision@5 **0.80**, MRR@5 **0.75** across two questions.
- The answerable startup-behavior question returned an accepted interpretation. Four cited evidence IDs were all present in retrieved context (**citation-ID validity 1.00**, 4/4).
- The direct wheel-to-commit provenance question produced a non-abstaining draft; the deterministic provenance gate rejected it. Raw abstention accuracy was **0.50**; safe-gate accuracy was **1.00** (the answerable case was accepted and the unsupported provenance case rejected).
- Deterministic findings remained present in both outcomes. The hidden oracle is read only by the post-run evaluator.

## Claim-to-evidence review

- The answer ties the `.pth` condition and `__import__('_distutils_hack').add_shim()` action to the artifact member (`ev_0af170efa4b01ea3bcc51c54`).
- It ties the `DISTUTILS_FINDER` insertion into `sys.meta_path` to the immutable `_distutils_hack` source excerpt (`ev_d7853a3156a8d2146e64cd2e`).
- It identifies the source template and release note as explanation of intended package behavior (`ev_538c8c1b965709b1507b36f9`, `ev_2c623c2ce90a481e378d7a27`) and separately states that the wheel's production path and exact wheel-to-commit binding remain unverified.
- No source/artifact origin assertion is accepted by the guard without verified build evidence. The provenance query remains rejected by the deterministic gate.
- One suggested next action names “SLSA Level 3+.” That level is not established or required by this evidence set; treat it as an unreviewed model recommendation, not a project policy or product requirement. Before user-facing integration, Shane should review the wording and evidence policy.

## Acceptance status and limits

This run meets the narrow live-adapter probe condition: a real difference received an accepted, cited explanation, and an unsupported provenance answer was rejected. This is **not** independent cross-review, broad model-quality evidence, semantic entailment validation in code, or product integration. It is a two-question experiment on one real PyPI case. The M1 real npm lifecycle-manifest fixture still depends on Shane's pinned npm artifact/source evidence. Organizer confirmation remains required before hosted P04 demo use.

The immediate prior prompt experiment (`product-qwen-setuptools-live-v13.*`) added a generic restriction on naming assurance levels but rejected both responses; it is retained as a failed prompt iteration. The active prompt is v6, used by the passing v12 probe.
