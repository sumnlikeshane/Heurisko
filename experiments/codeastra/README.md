# CodeAstra-500M local triage

CodeAstra adds one narrow local signal to Heurisko: compare the first-pass
vulnerability probability for a changed function in the published artifact
and its corresponding pinned source. The result is a human-review hypothesis
linked to the existing change finding and evidence IDs. It cannot change
package identity, source association, provenance, deterministic severity,
completeness, or CLI exit behavior.

## Why this is relevant to P04

The wheel-vs-source and wheel-to-commit questions remain answered by
deterministic comparison and evidence-backed RAG. CodeAstra does not prove that
a wheel came from a commit. It supports a distinct question:

> Does the distributed version of this changed function receive a different
> local vulnerability-triage signal from the corresponding source version?

Both sides use the same language label and model prompt. The stage reports the
two probabilities, the threshold verdicts, generated JSON verdict/CWE labels
when valid, and any disagreement between generated output and the configured
threshold. It cites the already-retained artifact and source evidence. A
score below `0.3346` is not a clean bill of health.

This distinction has practical value for suspicious code deltas: a reviewer
can see whether the package-only or source-only code also changes the model's
local vulnerability signal, then inspect the exact cited ranges. It is a
second-pass prioritization hint, not a finding or exploitability proof. The
model card reports only 27.40% paired vulnerable/patched correctness and says
the training mix is 92% C; use the local measurements below and do not claim
the model-card scores as Heurisko results. [CodeAstra model card](https://huggingface.co/rootxhacker/codeastra-500M)

## Local model and runtime

`model-lock.json` pins CodeAstra revision `5ac95ba77cec1795afb25ae62a4b65201944844a`,
the `model.safetensors` SHA-256, and the config SHA-256. The F32 checkpoint is
2,157,604,328 bytes (about 2.01 GiB). It is intentionally ignored by Git and
must not be committed. The `worker.py` checks both file hashes and the HobbyLM
source checkout revision before loading weights.

The CodeAstra weights are Apache-2.0 according to the [model card](https://huggingface.co/rootxhacker/codeastra-500M).
The [HobbyLM base-model card](https://huggingface.co/rootxhacker/HobbyLM-Base)
also declares Apache-2.0, but the pinned HobbyLM Git checkout contains no
license file. That checkout is local-only under `.runtime/`; its source must
not be vendored or redistributed until its code license is clarified. The
project's local Python dependency pins are experiments, not an approved
product dependency lock. Model and dataset terms remain separate from
Heurisko's Apache-2.0 license.

The local environment used here is Python 3.13.2 on macOS arm64, CPU-only,
with direct dependency versions pinned in `requirements.txt`. The model card's
fast probability method uses one forward pass. The optional generated JSON
explanation is much slower in this PyTorch reference implementation; run it
only for the small number of report-worthy pairs, not every changed function.
The upstream model card's optimized latency claim uses its Rust runtime and
does not describe this Python CPU path.

### Install and run locally

The model and source checkout are deliberately not fetched by the worker. On
an approved developer machine, create the isolated runtime and fetch only the
pinned public assets:

```sh
python3 -m venv .venv-codeastra
.venv-codeastra/bin/python -m pip install -r experiments/codeastra/requirements.txt
git clone https://github.com/harishsg993010/HobbyLM experiments/codeastra/.runtime/hobbylm
git -C experiments/codeastra/.runtime/hobbylm checkout --detach 817878f52bf054a4d9aabfdd5360341dd7ce3fa6
mkdir -p models/codeastra-500M
curl --fail --location --output models/codeastra-500M/config.json https://huggingface.co/rootxhacker/codeastra-500M/resolve/5ac95ba77cec1795afb25ae62a4b65201944844a/config.json
curl --fail --location --output models/codeastra-500M/model.safetensors https://huggingface.co/rootxhacker/codeastra-500M/resolve/5ac95ba77cec1795afb25ae62a4b65201944844a/model.safetensors
```

The first GPT-2 tokenizer initialization may fetch its upstream vocabulary
files into the ignored `.runtime/tiktoken-cache`. The worker uses the
model-card prompt format, validates generated output as strict JSON, and
preserves a valid probability result when JSON generation fails. Source code
is passed as JSON data; it is never executed, and the model has no tools or
execution authority.

The worker expects one JSON object per input line with exactly `id`, `code`,
and `language`. Run it using the immutable values in `model-lock.json`:

```sh
OMP_NUM_THREADS=4 MKL_NUM_THREADS=4 .venv-codeastra/bin/python experiments/codeastra/worker.py \
  --model-dir models/codeastra-500M \
  --model-revision 5ac95ba77cec1795afb25ae62a4b65201944844a \
  --weights-sha256 fc66914223a717973b0ce6e2132235897fb9fc32ff9ccd3d4c69197bcea1cdcd \
  --config-sha256 aaf2bace7b4f3339b811cecdcfac86e40c7fd41d468bb9cb40cf43866e57b6a3 \
  --runtime-revision 817878f52bf054a4d9aabfdd5360341dd7ce3fa6
```

The Python worker is not yet wired into an end-user CLI/TUI or a persistent
process manager. `packages/intelligence/src/codeastra.ts` exposes the report
adapter; an embedding application still needs to implement its scorer
interface and lifecycle.

## Paired evaluation

The evaluation uses only the public dataset's held-out `test` Parquet split.
Its dataset family contributed to CodeAstra training, so this is held-out
within the training source, not an independent test corpus. Download the
immutable file into the ignored dataset directory:

```sh
mkdir -p experiments/codeastra/.datasets
curl --fail --location --output experiments/codeastra/.datasets/test-00000-of-00001.parquet https://huggingface.co/datasets/ayshajavd/code-security-vulnerability-dataset/resolve/9b2f327f6b8bfab9a81411b6e582dd7119c18542/data/test-00000-of-00001.parquet
```

Reproduce the recorded fixed-seed sample:

```sh
OMP_NUM_THREADS=4 MKL_NUM_THREADS=4 .venv-codeastra/bin/python experiments/codeastra/evaluate_pairs.py \
  --dataset-file experiments/codeastra/.datasets/test-00000-of-00001.parquet \
  --dataset-revision 9b2f327f6b8bfab9a81411b6e582dd7119c18542 \
  --dataset-file-sha256 f16650e9ccfa2aeb2858136b055d899d4059b435b88a76c16573fb88f175fae4 \
  --split test --max-pairs 50 --seed 4107 \
  --model-dir models/codeastra-500M \
  --model-revision 5ac95ba77cec1795afb25ae62a4b65201944844a \
  --weights-sha256 fc66914223a717973b0ce6e2132235897fb9fc32ff9ccd3d4c69197bcea1cdcd \
  --config-sha256 aaf2bace7b4f3339b811cecdcfac86e40c7fd41d468bb9cb40cf43866e57b6a3 \
  --runtime-revision 817878f52bf054a4d9aabfdd5360341dd7ce3fa6 \
  --threshold 0.3346 --output experiments/codeastra/.datasets/evaluation.json
```

Recorded run: 50 reservoir-selected vulnerable/fixed pairs, seed `4107`; 44
pairs scored and 6 failed because the language was unsupported or the prompt
exceeded the 2,048-token context. On the 44 scored pairs, 13.6% were both
flagged correctly (vulnerable side above threshold and fixed side below),
93.2% of vulnerable sides were flagged, patched specificity was 20.5%, and
within-pair ranking accuracy was 68.2%. In 79.5% of scored pairs both sides
were flagged. See the per-pair artifact at
[`results/paired-test-sample-50.json`](results/paired-test-sample-50.json).

The ranking result is close to the model card's reported 69.46%, while the
fixed-threshold behavior is materially worse than its reported 27.40% paired
correctness. Treat that mismatch as unresolved calibration/prompt work. The
model must not be used as a gate or described with the upstream metrics until
the original helper's exact token/prompt behavior is reconciled and a larger
reproduction is completed. The evaluation is about function-level paired
triage, not package integrity, exploitability, provenance, or Heurisko's
overall detection accuracy. [Dataset card](https://huggingface.co/datasets/ayshajavd/code-security-vulnerability-dataset)

## Integration limits and follow-up

- Unsupported, oversized, non-function, or unpaired changes remain outside
  the model result and must remain visible as omitted scope.
- CWE/OWASP output is a model-reported hypothesis; valid JSON and a real
  citation do not prove factual support.
- The report schema has one aggregate `aiState`; a future multi-model CLI
  integration must reconcile per-model state and failures with Shane.
- Shane's independent cross-review is required before CLI/report presentation.
- The worker's Python startup/inference time and peak memory were not profiled
  as a benchmark. The local sample completed on the team's 8 GB Apple Silicon
  development device, but full JSON generation was substantially slower than
  probability-only scoring.
