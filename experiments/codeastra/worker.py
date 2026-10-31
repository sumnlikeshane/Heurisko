#!/usr/bin/env python3
"""Local, stdin/stdout JSONL worker for CodeAstra-500M.

The worker does not download model files and never executes supplied source.
It requires caller-pinned model/runtime revisions and file digests.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import re
import subprocess
import sys
from pathlib import Path
from typing import Any

MAX_LINE_BYTES = 32_768
MAX_CODE_CHARS = 24_000
MAX_CONTEXT_TOKENS = 2_048
LANGUAGES = {
    "c": "C",
    "cpp": "C++",
    "python": "Python",
    "java": "Java",
    "javascript": "JavaScript",
    "php": "PHP",
    "go": "Go",
    "ruby": "Ruby",
    "swift": "Swift",
    "kotlin": "Kotlin",
    "csharp": "C#",
    "fortran": "Fortran",
}
SYSTEM_PROMPT = (
    'SYSTEM: You are a source-code security auditor. Given a code snippet, decide '
    'whether it contains a security vulnerability and reply with one JSON object: '
    '{"vulnerable": bool, "cwe": str, "cwe_name": str, "owasp": str}. '
    'Use "none" for safe code.'
)
USER_PROMPT = "USER: Audit the code below for security vulnerabilities."
VERDICT_PREFIX = '{"vulnerable":'
MAX_COMPLETION_TOKENS = 96
CODEASTRA_THRESHOLD = 0.3346
PROMPT_VERSION = "codeastra-paired-triage-v1"
CODEASTRA_REVISION = "5ac95ba77cec1795afb25ae62a4b65201944844a"
CODEASTRA_WEIGHTS_SHA256 = "fc66914223a717973b0ce6e2132235897fb9fc32ff9ccd3d4c69197bcea1cdcd"
HOBBYLM_REVISION = "817878f52bf054a4d9aabfdd5360341dd7ce3fa6"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def require_sha(value: str, label: str, length: int = 64) -> str:
    if len(value) != length or any(char not in "0123456789abcdefABCDEF" for char in value):
        raise ValueError(f"{label} must be a {length}-character hexadecimal digest.")
    return value.lower()


def build_prompt(code: str, language: str) -> str:
    # Keep the exact training layout documented by the model author.
    return (
        f"{SYSTEM_PROMPT}\n{USER_PROMPT}\nLanguage: {language}\n\n"
        f"```{language.lower()}\n{code}\n```\nASSISTANT:\n"
    )


def parse_verdict(completion: str) -> dict[str, Any]:
    """Parse exactly one model JSON object; reject incomplete or malformed output."""
    candidate = completion.lstrip()
    if not candidate.startswith("{"):
        raise ValueError("model completion contains no JSON object")
    try:
        verdict, end = json.JSONDecoder().raw_decode(candidate)
    except json.JSONDecodeError as error:
        raise ValueError(f"model completion contains malformed JSON: {error.msg}") from error
    if not isinstance(verdict, dict):
        raise ValueError("model verdict must be a JSON object")
    if set(verdict) != {"vulnerable", "cwe", "cwe_name", "owasp"}:
        raise ValueError("model verdict must contain exactly vulnerable, cwe, cwe_name, and owasp")
    trailing = candidate[end:].strip()
    if trailing not in ("", "<|endoftext|>"):
        raise ValueError("model completion contains text after the JSON verdict")
    if type(verdict.get("vulnerable")) is not bool:
        raise ValueError("model verdict must contain a boolean vulnerable field")
    for key in ("cwe", "cwe_name", "owasp"):
        if not isinstance(verdict.get(key), str) or not verdict[key].strip():
            raise ValueError(f"model verdict must contain a non-empty string {key} field")
    if len(verdict["cwe"]) > 64 or len(verdict["cwe_name"]) > 512 or len(verdict["owasp"]) > 128:
        raise ValueError("model verdict field exceeds the allowed length")
    if not re.fullmatch(r"(?:CWE-\d+|none|unknown)", verdict["cwe"], flags=re.IGNORECASE):
        raise ValueError("model verdict cwe must be a CWE identifier, none, or unknown")
    return verdict


def load_runtime(args: argparse.Namespace) -> tuple[Any, Any, Any, Any, str]:
    # Import only after argument validation; no network or dynamic module loading.
    runtime_root = Path(__file__).resolve().parent / ".runtime" / "hobbylm"
    if not runtime_root.is_dir():
        raise FileNotFoundError(f"pinned HobbyLM checkout is missing: {runtime_root}")
    source_revision = subprocess.run(
        ["git", "-C", str(runtime_root), "rev-parse", "HEAD"],
        check=True,
        capture_output=True,
        text=True,
        timeout=5,
    ).stdout.strip().lower()
    if source_revision != HOBBYLM_REVISION or args.runtime_revision.lower() != HOBBYLM_REVISION:
        raise ValueError("HobbyLM source checkout is not at the pinned revision")
    dirty_source = subprocess.run(
        ["git", "-C", str(runtime_root), "status", "--porcelain"],
        check=True,
        capture_output=True,
        text=True,
        timeout=5,
    ).stdout
    if dirty_source:
        raise ValueError("HobbyLM runtime source checkout has uncommitted modifications")
    sys.path.insert(0, str(runtime_root))
    os.environ.setdefault(
        "TIKTOKEN_CACHE_DIR",
        str(Path(__file__).resolve().parent / ".runtime" / "tiktoken-cache"),
    )

    import torch
    import tiktoken
    from safetensors.torch import load_file
    from hobbylm.config import ModelConfig
    from hobbylm.model import MoETransformer
    from hobbylm.generate import generate

    config_path = args.model_dir / "config.json"
    weights_path = args.model_dir / "model.safetensors"
    if not config_path.is_file() or not weights_path.is_file():
        raise FileNotFoundError("model directory must contain config.json and model.safetensors")
    if args.model_revision.lower() != CODEASTRA_REVISION:
        raise ValueError("CodeAstra model revision is not the pinned revision")
    if args.weights_sha256.lower() != CODEASTRA_WEIGHTS_SHA256:
        raise ValueError("CodeAstra weights SHA-256 is not the published pinned digest")
    if sha256_file(config_path) != require_sha(args.config_sha256, "config SHA-256"):
        raise ValueError("config.json SHA-256 does not match the pinned value")
    if sha256_file(weights_path) != require_sha(args.weights_sha256, "weights SHA-256"):
        raise ValueError("model.safetensors SHA-256 does not match the pinned value")
    revision = require_sha(args.model_revision, "model revision", 40)
    runtime_revision = require_sha(args.runtime_revision, "HobbyLM runtime revision", 40)

    config_data = json.loads(config_path.read_text(encoding="utf-8"))
    config_data.pop("preset", None)
    config = ModelConfig(**config_data)
    config.expert_backend = "bmm"  # CPU path for laptop memory limits.
    model = MoETransformer(config).cpu().eval()
    model.load_state_dict(load_file(str(weights_path), device="cpu"))
    encoder = tiktoken.get_encoding("gpt2")
    true_tokens = encoder.encode_ordinary(" true")
    false_tokens = encoder.encode_ordinary(" false")
    if len(true_tokens) != 1 or len(false_tokens) != 1:
        raise RuntimeError("GPT-2 tokenizer does not represent the verdict labels as single tokens")
    runtime_id = (
        f"hobbylm-reference@{runtime_revision};python={platform.python_version()};"
        f"torch={torch.__version__};device=cpu"
    )
    return torch, encoder, model, generate, runtime_id


def score_request(
    request: Any,
    runtime: tuple[Any, ...],
    *,
    include_explanation: bool = True,
    debug_completion: bool = False,
) -> dict[str, Any]:
    if not isinstance(request, dict) or set(request) != {"id", "code", "language"}:
        raise ValueError("request must contain exactly id, code, and language")
    request_id = request["id"]
    code = request["code"]
    language = request["language"]
    if not isinstance(request_id, str) or not request_id or len(request_id) > 128:
        raise ValueError("id must be a non-empty string of at most 128 characters")
    if not isinstance(code, str) or not code.strip() or len(code) > MAX_CODE_CHARS:
        raise ValueError(f"code must be non-empty and at most {MAX_CODE_CHARS} characters")
    if not isinstance(language, str) or language.lower() not in LANGUAGES:
        raise ValueError("language is unsupported by the CodeAstra prompt")

    torch, encoder, model, generate, runtime_id = runtime
    language_label = LANGUAGES[language.lower()]
    prompt = build_prompt(code, language_label)
    verdict_prompt = prompt + VERDICT_PREFIX
    prompt_ids = encoder.encode_ordinary(prompt)
    verdict_prefix_ids = encoder.encode_ordinary(verdict_prompt)
    true_ids = encoder.encode_ordinary(verdict_prompt + " true")
    false_ids = encoder.encode_ordinary(verdict_prompt + " false")
    if len(true_ids) != len(verdict_prefix_ids) + 1 or len(false_ids) != len(verdict_prefix_ids) + 1:
        raise RuntimeError("verdict prefix tokenization is not compatible with next-token scoring")
    if true_ids[:-1] != verdict_prefix_ids or false_ids[:-1] != verdict_prefix_ids:
        raise RuntimeError("verdict label tokenization changed the shared prefix")
    if len(verdict_prefix_ids) > MAX_CONTEXT_TOKENS or len(prompt_ids) + MAX_COMPLETION_TOKENS > MAX_CONTEXT_TOKENS:
        raise ValueError(f"prompt/completion exceeds CodeAstra's {MAX_CONTEXT_TOKENS}-token context")
    verdict_ids = torch.tensor([verdict_prefix_ids], dtype=torch.long)
    with torch.no_grad():
        logits, _ = model(verdict_ids)
    pair_logits = logits[0, -1, [true_ids[-1], false_ids[-1]]].float()
    probability = torch.softmax(pair_logits, dim=-1)[0].item()

    # The probability is the calibrated classifier signal. JSON labels are
    # generated separately and retained as a model-reported CWE hypothesis.
    verdict = {"cwe": "unknown", "cwe_name": "unknown", "owasp": "unknown"}
    generated_label_disagrees = False
    explanation_status = "not_requested"
    if include_explanation:
        ids = torch.tensor([prompt_ids], dtype=torch.long)
        with torch.no_grad():
            output = generate(
                model,
                ids,
                max_new_tokens=MAX_COMPLETION_TOKENS,
                temperature=0.0,
                top_k=0,
                device=torch.device("cpu"),
                repetition_penalty=1.0,
                no_repeat_ngram_size=0,
            )
        generated = encoder.decode(output[0][len(prompt_ids):].tolist())
        try:
            verdict = parse_verdict(generated)
            explanation_status = "valid_json"
        except ValueError as error:
            explanation_status = "malformed_json"
            if debug_completion:
                print(f"invalid CodeAstra completion ({error}): {generated[:500]!r}", file=sys.stderr)
        if explanation_status == "valid_json":
            generated_label_disagrees = verdict["vulnerable"] != (probability >= CODEASTRA_THRESHOLD)

    return {
        "id": request_id,
        "vulnerableProbability": probability,
        "cwe": str(verdict.get("cwe", "unknown")),
        "cweName": str(verdict.get("cwe_name", "unknown")),
        "owasp": str(verdict.get("owasp", "unknown")),
        "inputTokens": len(verdict_prefix_ids),
        "generatedVulnerable": verdict.get("vulnerable"),
        "generatedLabelDisagrees": generated_label_disagrees,
        "structuredOutputStatus": explanation_status,
        "promptVersion": PROMPT_VERSION,
        "runtimeId": runtime_id,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--model-revision", required=True)
    parser.add_argument("--weights-sha256", required=True)
    parser.add_argument("--config-sha256", required=True)
    parser.add_argument("--runtime-revision", required=True)
    parser.add_argument("--debug-completion", action="store_true", help="write up to 500 generated characters to stderr when JSON parsing fails")
    args = parser.parse_args()

    try:
        runtime = load_runtime(args)
    except Exception as error:
        print(f"CodeAstra worker startup failed: {error}", file=sys.stderr)
        return 2

    while True:
        raw_line = sys.stdin.buffer.readline(MAX_LINE_BYTES + 1)
        if not raw_line:
            break
        try:
            if len(raw_line) > MAX_LINE_BYTES:
                while raw_line and not raw_line.endswith(b"\n"):
                    raw_line = sys.stdin.buffer.readline(MAX_LINE_BYTES + 1)
                raise ValueError(f"input line exceeds {MAX_LINE_BYTES} bytes")
            request = json.loads(raw_line)
            result = score_request(request, runtime, debug_completion=args.debug_completion)
            sys.stdout.write(json.dumps(result, separators=(",", ":"), ensure_ascii=True) + "\n")
            sys.stdout.flush()
        except Exception as error:
            request_id = request.get("id") if isinstance(locals().get("request"), dict) else None
            sys.stdout.write(json.dumps({"id": request_id, "error": str(error)}, separators=(",", ":")) + "\n")
            sys.stdout.flush()
        finally:
            request = None
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
