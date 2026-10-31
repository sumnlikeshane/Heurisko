#!/usr/bin/env python3
"""Evaluate CodeAstra on externally supplied vulnerable/fixed function pairs.

Input Parquet or JSONL rows use the public dataset's `code`, `code_fixed`,
`language`, `cwe_id`, and `is_vulnerable` fields. Use only its held-out test split.
The script does not train, modify, or upload model/data artifacts.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import random
import sys
from pathlib import Path
from typing import Any

from worker import load_runtime, score_request


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file:
        for chunk in iter(lambda: file.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def select_pairs(path: Path, limit: int, seed: int) -> list[dict[str, Any]]:
    rng = random.Random(seed)
    selected: list[dict[str, Any]] = []
    seen = 0
    if path.suffix == ".parquet":
        try:
            import pyarrow.parquet as parquet
        except ImportError as error:
            raise RuntimeError("reading Parquet requires the pinned optional pyarrow dependency") from error
        rows = parquet.read_table(path, columns=["code", "code_fixed", "language", "cwe_id", "is_vulnerable"]).to_pylist()
        iterable = enumerate((json.dumps(row) for row in rows), start=1)
    else:
        file = path.open(encoding="utf-8")
        iterable = enumerate(file, start=1)
    try:
        for line_number, line in iterable:
            try:
                row = json.loads(line)
            except json.JSONDecodeError as error:
                raise ValueError(f"invalid JSON on dataset line {line_number}: {error}") from error
            if not isinstance(row, dict):
                continue
            vulnerable_code = row.get("vulnerable_code", row.get("code"))
            fixed_code = row.get("fixed_code", row.get("code_fixed"))
            language = row.get("language")
            cwe_id = row.get("cwe_id")
            if row.get("is_vulnerable") is not True:
                continue
            if any(not isinstance(value, str) or not value.strip() for value in (vulnerable_code, fixed_code, language, cwe_id)):
                continue
            pair_id = row.get("pair_id")
            if not isinstance(pair_id, str) or not pair_id.strip():
                pair_id = hashlib.sha256(f"{vulnerable_code}\0{fixed_code}".encode()).hexdigest()[:24]
            candidate = {
                "pair_id": pair_id,
                "vulnerable_code": vulnerable_code,
                "fixed_code": fixed_code,
                "language": language,
                "cwe_id": cwe_id,
            }
            seen += 1
            if len(selected) < limit:
                selected.append(candidate)
            else:
                index = rng.randrange(seen)
                if index < limit:
                    selected[index] = candidate
    finally:
        if path.suffix != ".parquet":
            file.close()
    return selected


def prediction(runtime: tuple[Any, ...], pair_id: str, side: str, code: str, language: str) -> float:
    result = score_request(
        {"id": f"{pair_id}:{side}", "code": code, "language": language},
        runtime,
        include_explanation=False,
    )
    return float(result["vulnerableProbability"])


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset-file", type=Path, required=True, help="pinned Parquet test split or normalized JSONL export")
    parser.add_argument("--dataset-revision", required=True, help="40-character immutable source dataset revision")
    parser.add_argument("--dataset-file-sha256", required=True)
    parser.add_argument("--split", choices=("test",), required=True)
    parser.add_argument("--max-pairs", type=int, default=100)
    parser.add_argument("--seed", type=int, default=4107)
    parser.add_argument("--model-dir", type=Path, required=True)
    parser.add_argument("--model-revision", required=True)
    parser.add_argument("--weights-sha256", required=True)
    parser.add_argument("--config-sha256", required=True)
    parser.add_argument("--runtime-revision", required=True)
    parser.add_argument("--threshold", type=float, default=0.3346)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    if args.split != "test":
        raise ValueError("evaluation is restricted to the dataset's held-out test split")
    if not 1 <= args.max_pairs <= 5_000:
        raise ValueError("max-pairs must be between 1 and 5000")
    if not 0 < args.threshold < 1:
        raise ValueError("threshold must be between 0 and 1")
    if len(args.dataset_revision) != 40 or any(c not in "0123456789abcdefABCDEF" for c in args.dataset_revision):
        raise ValueError("dataset revision must be a 40-character hex commit")
    if sha256_file(args.dataset_file) != args.dataset_file_sha256.lower():
        raise ValueError("dataset file SHA-256 does not match the pinned value")

    pairs = select_pairs(args.dataset_file, args.max_pairs, args.seed)
    if not pairs:
        raise ValueError("no paired vulnerable/fixed rows were found")
    runtime = load_runtime(args)
    results: list[dict[str, Any]] = []
    for pair in pairs:
        try:
            vulnerable_probability = prediction(runtime, pair["pair_id"], "vulnerable", pair["vulnerable_code"], pair["language"])
            fixed_probability = prediction(runtime, pair["pair_id"], "fixed", pair["fixed_code"], pair["language"])
            results.append({
                "pair_id": pair["pair_id"],
                "cwe_id": pair["cwe_id"],
                "language": pair["language"],
                "vulnerable_probability": vulnerable_probability,
                "fixed_probability": fixed_probability,
                "vulnerable_flag": vulnerable_probability >= args.threshold,
                "fixed_flag": fixed_probability >= args.threshold,
                "pair_correct": vulnerable_probability >= args.threshold and fixed_probability < args.threshold,
                "within_pair_rank_correct": vulnerable_probability > fixed_probability,
            })
        except Exception as error:
            results.append({"pair_id": pair["pair_id"], "error": str(error)})

    scored = [row for row in results if "error" not in row]
    denominator = len(scored)
    if denominator == 0:
        raise ValueError("all selected pairs failed inference")
    vulnerable_flags = sum(bool(row["vulnerable_flag"]) for row in scored)
    fixed_flags = sum(bool(row["fixed_flag"]) for row in scored)
    report = {
        "schema_version": "heurisko-codeastra-paired-evaluation-v1",
        "dataset": {
            "repo": "ayshajavd/code-security-vulnerability-dataset",
            "revision": args.dataset_revision.lower(),
            "file_sha256": args.dataset_file_sha256.lower(),
            "split": args.split,
            "selection_seed": args.seed,
            "selected_pairs": len(pairs),
        },
        "model": {
            "id": "rootxhacker/codeastra-500M",
            "revision": args.model_revision.lower(),
            "weights_sha256": args.weights_sha256.lower(),
            "config_sha256": args.config_sha256.lower(),
            "runtime_revision": args.runtime_revision.lower(),
            "threshold": args.threshold,
            "scoring_mode": "documented_next_token_probability_only",
            "prompt_version": "codeastra-paired-triage-v1",
        },
        "metrics": {
            "scored_pairs": denominator,
            "failed_pairs": len(results) - denominator,
            "paired_correct_rate": sum(bool(row["pair_correct"]) for row in scored) / denominator,
            "vulnerable_detection_rate": vulnerable_flags / denominator,
            "patched_specificity": 1 - fixed_flags / denominator,
            "within_pair_ranking_accuracy": sum(bool(row["within_pair_rank_correct"]) for row in scored) / denominator,
            "both_flagged_rate": sum(bool(row["vulnerable_flag"] and row["fixed_flag"]) for row in scored) / denominator,
            "both_cleared_rate": sum(bool(not row["vulnerable_flag"] and not row["fixed_flag"]) for row in scored) / denominator,
            "reversed_pair_rate": sum(bool(not row["vulnerable_flag"] and row["fixed_flag"]) for row in scored) / denominator,
        },
        "results": results,
        "limitations": [
            "These are function-level vulnerability-pair results, not package integrity, exploitability, or provenance validation.",
            "This dataset family contributed to CodeAstra training; the held-out test split is required, and results do not establish performance on unrelated packages.",
            "A model-card benchmark is not independent reproduction; report the selected-pair denominator and failures with every metric.",
        ],
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report["metrics"], sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:
        print(f"CodeAstra evaluation failed: {error}", file=sys.stderr)
        raise SystemExit(2)
