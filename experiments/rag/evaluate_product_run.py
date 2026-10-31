#!/usr/bin/env python3
"""Score a product-adapter run against the real-case oracle after inference."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def read_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("run", type=Path)
    parser.add_argument("--corpus", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()

    # This script runs only after the model run has completed. The inference
    # runner itself never loads the oracle.
    oracle = {row["query_id"]: row for row in read_jsonl(args.corpus / "oracle/judgments.jsonl")}
    run = {row["query_id"]: row for row in read_jsonl(args.run)}
    if set(run) != set(oracle):
        raise SystemExit(f"run/oracle query mismatch: run={sorted(run)}, oracle={sorted(oracle)}")

    rows = []
    citations_seen = 0
    citations_valid = 0
    recall_total = precision_total = reciprocal_rank_total = 0.0
    raw_abstention_correct = safe_gate_correct = model_calls = 0

    for query_id, expected in oracle.items():
        prediction = run[query_id]
        retrieved = prediction.get("retrieved_evidence_ids", [])
        relevant = set(expected["relevant_evidence_ids"])
        retrieved_relevant = [evidence_id for evidence_id in retrieved if evidence_id in relevant]
        recall = len(relevant.intersection(retrieved)) / len(relevant) if relevant else 1.0
        precision = len(retrieved_relevant) / len(retrieved) if retrieved else 0.0
        reciprocal_rank = next((1.0 / rank for rank, evidence_id in enumerate(retrieved, 1) if evidence_id in relevant), 0.0)
        recall_total += recall
        precision_total += precision
        reciprocal_rank_total += reciprocal_rank

        state = prediction.get("ai_state", {}).get("status", "missing")
        inference = prediction.get("inference", {})
        model_was_called = inference.get("servedModel") is not None
        expected_abstain = bool(expected["abstention_expected"])
        model_abstained = state == "abstained"
        safely_gated = state in {"abstained", "rejected"}
        if model_was_called:
            model_calls += 1
            raw_abstention_correct += model_abstained == expected_abstain
            safe_gate_correct += (safely_gated if expected_abstain else state == "available")

        cited = [evidence_id for item in prediction.get("interpretations", []) for evidence_id in item.get("evidenceIds", [])]
        citations_seen += len(cited)
        citations_valid += sum(evidence_id in retrieved for evidence_id in cited)
        rows.append({
            "query_id": query_id,
            "relevant_evidence_count": len(relevant),
            "retrieved_evidence_count": len(retrieved),
            "recall_at_5": round(recall, 6),
            "precision_at_5": round(precision, 6),
            "reciprocal_rank": round(reciprocal_rank, 6),
            "ai_status": state,
            "expected_abstain": expected_abstain,
            "model_abstained": model_abstained,
            "safe_gate_satisfied": safely_gated if expected_abstain else state == "available",
            "model_called": model_was_called,
            "model_requested": inference.get("requestedModel"),
            "model_served": inference.get("servedModel"),
            "citation_ids": cited,
            "citation_ids_valid_in_retrieved_context": all(item in retrieved for item in cited),
        })

    count = len(rows)
    result = {
        "run_file": str(args.run),
        "corpus": str(args.corpus),
        "query_count": count,
        "recall_at_5": round(recall_total / count, 6),
        "precision_at_5": round(precision_total / count, 6),
        "mrr_at_5": round(reciprocal_rank_total / count, 6),
        "citation_id_validity": round(citations_valid / citations_seen, 6) if citations_seen else None,
        "citation_ids_checked": citations_seen,
        "model_calls": model_calls,
        "raw_model_abstention_accuracy": round(raw_abstention_correct / model_calls, 6) if model_calls else None,
        "safe_gate_accuracy": round(safe_gate_correct / model_calls, 6) if model_calls else None,
        "note": "A rejected non-abstaining response counts as a safe gate outcome but not as a model abstention. Citation-ID validity does not assess claim entailment.",
        "queries": rows,
    }
    rendered = json.dumps(result, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered)
    print(rendered, end="")


if __name__ == "__main__":
    main()
