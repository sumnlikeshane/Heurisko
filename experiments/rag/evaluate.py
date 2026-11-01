#!/usr/bin/env python3
"""Score RAG retrieval references and basic output-contract behavior.

This evaluator does not judge whether a cited passage semantically supports a
claim. That requires reviewed entailment judgments. It uses only Python's
standard library and does not call a model or access the network.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from answer_contract import candidate_citations


HERE = Path(__file__).resolve().parent


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{line_number}: invalid JSON: {exc.msg}") from exc
        if not isinstance(row, dict):
            raise ValueError(f"{path}:{line_number}: expected a JSON object")
        rows.append(row)
    return rows


def unique_index(rows: list[dict[str, Any]], key: str, label: str) -> dict[str, dict[str, Any]]:
    result: dict[str, dict[str, Any]] = {}
    for row in rows:
        value = row.get(key)
        if not isinstance(value, str) or not value:
            raise ValueError(f"{label}: each record needs a non-empty {key}")
        if value in result:
            raise ValueError(f"{label}: duplicate {key} {value!r}")
        result[value] = row
    return result


def mean(values: list[float]) -> float | None:
    return sum(values) / len(values) if values else None


def score_case(
    query_id: str,
    prediction: dict[str, Any],
    judgment: dict[str, Any],
    case_evidence_ids: set[str],
    k: int,
) -> dict[str, Any]:
    retrieved = prediction.get("retrieved_evidence_ids", [])
    cited = prediction.get("cited_evidence_ids", [])
    if not isinstance(retrieved, list) or not all(isinstance(item, str) for item in retrieved):
        raise ValueError(f"{query_id}: retrieved_evidence_ids must be a list of strings")
    if not isinstance(cited, list) or not all(isinstance(item, str) for item in cited):
        raise ValueError(f"{query_id}: cited_evidence_ids must be a list of strings")
    if len(retrieved) != len(set(retrieved)):
        raise ValueError(f"{query_id}: retrieved_evidence_ids contains duplicates")
    if len(cited) != len(set(cited)):
        raise ValueError(f"{query_id}: cited_evidence_ids contains duplicates")
    if not cited and isinstance(prediction.get("raw_model_output"), str):
        cited = candidate_citations(prediction["raw_model_output"])

    relevant = judgment.get("relevant_evidence_ids")
    if not isinstance(relevant, list) or not relevant or not all(isinstance(item, str) for item in relevant):
        raise ValueError(f"{query_id}: judgment needs non-empty relevant_evidence_ids")

    top_k = retrieved[:k]
    relevant_set = set(relevant)
    hits = [item for item in top_k if item in relevant_set]
    first_rank = next((rank for rank, item in enumerate(top_k, 1) if item in relevant_set), None)

    expected_abstention = judgment.get("abstention_expected")
    if not isinstance(expected_abstention, bool):
        raise ValueError(f"{query_id}: expected abstained value must be a boolean")
    actual_abstention = prediction.get("abstained")
    answer_valid = prediction.get("answer_valid", True)
    if not isinstance(answer_valid, bool):
        answer_valid = False
    answer_valid = answer_valid and isinstance(actual_abstention, bool)

    invalid_retrieval = sorted(set(retrieved) - case_evidence_ids)
    invalid_citations = sorted(set(cited) - case_evidence_ids)
    citations_outside_context = sorted(set(cited) - set(retrieved))
    invalid_citation_set = set(invalid_citations) | set(citations_outside_context)
    citation_validity = (
        (len(cited) - len(invalid_citation_set)) / len(cited) if cited else None
    )
    return {
        "query_id": query_id,
        "recall_at_k": len(set(hits)) / len(relevant_set),
        "precision_at_k": len(set(hits)) / k,
        "reciprocal_rank": 1 / first_rank if first_rank else 0.0,
        "relevant_retrieved": hits,
        "answer_valid": answer_valid,
        "answer_error": prediction.get("answer_error"),
        "abstention_correct": answer_valid and expected_abstention == actual_abstention,
        "expected_abstention": expected_abstention,
        "actual_abstention": actual_abstention,
        "retrieval_ids_outside_case": invalid_retrieval,
        "invalid_citation_ids": invalid_citations,
        "citation_ids_outside_retrieved_context": citations_outside_context,
        "citation_count": len(cited),
        "citation_validity": citation_validity,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("predictions", type=Path, help="JSONL model/retrieval output")
    parser.add_argument("--corpus", type=Path, default=HERE, help="corpus directory with documents, queries, and oracle")
    parser.add_argument("--k", type=int, default=5, help="cutoff for ranking metrics (default: 5)")
    args = parser.parse_args()
    if args.k < 1:
        parser.error("--k must be at least 1")

    try:
        documents = unique_index(read_jsonl(args.corpus / "documents.jsonl"), "evidence_id", "documents")
        queries = unique_index(read_jsonl(args.corpus / "queries.jsonl"), "query_id", "queries")
        judgments = unique_index(read_jsonl(args.corpus / "oracle" / "judgments.jsonl"), "query_id", "judgments")
        predictions = unique_index(read_jsonl(args.predictions), "query_id", "predictions")

        if set(queries) != set(judgments):
            raise ValueError("query IDs and judgment IDs do not match")
        if set(predictions) != set(queries):
            missing = sorted(set(queries) - set(predictions))
            extra = sorted(set(predictions) - set(queries))
            raise ValueError(f"prediction/query IDs differ; missing={missing}, extra={extra}")

        cases = []
        for query_id in sorted(queries):
            case_id = queries[query_id].get("case_id")
            if not isinstance(case_id, str) or not case_id:
                raise ValueError(f"{query_id}: query needs a case_id")
            case_evidence_ids = {
                evidence_id
                for evidence_id, document in documents.items()
                if document.get("case_id") == case_id
            }
            if not case_evidence_ids:
                raise ValueError(f"{query_id}: no evidence documents for case {case_id!r}")
            relevant = judgments[query_id].get("relevant_evidence_ids")
            if not isinstance(relevant, list) or not set(relevant) <= case_evidence_ids:
                raise ValueError(f"{query_id}: judgment references evidence outside its case")
            cases.append(score_case(
                query_id,
                predictions[query_id],
                judgments[query_id],
                case_evidence_ids,
                args.k,
            ))
        result = {
            "schema": "heurisko-rag-evaluation/v0.1",
            "k": args.k,
            "query_count": len(cases),
            "mean_recall_at_k": mean([case["recall_at_k"] for case in cases]),
            "mean_precision_at_k": mean([case["precision_at_k"] for case in cases]),
            "mean_reciprocal_rank": mean([case["reciprocal_rank"] for case in cases]),
            "abstention_accuracy": mean([float(case["abstention_correct"]) for case in cases]),
            "citation_validity": mean([
                case["citation_validity"] for case in cases if case["citation_validity"] is not None
            ]),
            "citation_count": sum(case["citation_count"] for case in cases),
            "invalid_answer_count": sum(not case["answer_valid"] for case in cases),
            "retrieval_ids_outside_case_count": sum(len(case["retrieval_ids_outside_case"]) for case in cases),
            "invalid_citation_count": sum(len(case["invalid_citation_ids"]) for case in cases),
            "citation_outside_context_count": sum(
                len(case["citation_ids_outside_retrieved_context"]) for case in cases
            ),
            "cases": cases,
            "corpus": str(args.corpus),
            "limitations": [
                "Citation ID validity is not semantic entailment.",
                "Retrieval ranking metrics do not assess whether an answer is useful or correct.",
                "Must-conclude and must-not-conclude rubrics require human review.",
                "This small corpus does not support broad model-quality claims.",
            ],
        }
        print(json.dumps(result, ensure_ascii=False, indent=2, allow_nan=False))
        return 0
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"evaluate.py: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
