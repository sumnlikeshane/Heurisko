"""Strict parsing and validation for evidence-bound answer model output."""

from __future__ import annotations

import json
from typing import Any


class InvalidAnswer(ValueError):
    """A model response that cannot satisfy the versioned answer contract."""

    def __init__(self, message: str, raw_output: str):
        super().__init__(message)
        self.raw_output = raw_output


REQUIRED_KEYS = {
    "summary",
    "claims",
    "alternatives",
    "missing_evidence",
    "next_action",
    "abstained",
}


def _unique_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON object key: {key}")
        result[key] = value
    return result


def parse_answer(raw_output: str, retrieved_evidence_ids: set[str]) -> dict[str, Any]:
    try:
        answer = json.loads(raw_output, object_pairs_hook=_unique_object)
    except json.JSONDecodeError as exc:
        raise InvalidAnswer(f"invalid JSON: {exc.msg}", raw_output) from exc
    except ValueError as exc:
        raise InvalidAnswer(str(exc), raw_output) from exc
    if not isinstance(answer, dict):
        raise InvalidAnswer("answer must be a JSON object", raw_output)

    missing = sorted(REQUIRED_KEYS - set(answer))
    extra = sorted(set(answer) - REQUIRED_KEYS)
    if missing or extra:
        problems = []
        if missing:
            problems.append(f"missing required fields: {', '.join(missing)}")
        if extra:
            problems.append(f"unexpected fields: {', '.join(extra)}")
        raise InvalidAnswer("; ".join(problems), raw_output)
    if not isinstance(answer["summary"], str):
        raise InvalidAnswer("summary must be a string", raw_output)
    if not isinstance(answer["next_action"], str):
        raise InvalidAnswer("next_action must be a string", raw_output)
    if not isinstance(answer["abstained"], bool):
        raise InvalidAnswer("abstained must be a boolean", raw_output)
    for field, maximum in (("alternatives", 2), ("missing_evidence", 2)):
        value = answer[field]
        if not isinstance(value, list) or len(value) > maximum or not all(isinstance(item, str) for item in value):
            raise InvalidAnswer(f"{field} must be an array of at most {maximum} strings", raw_output)

    claims = answer["claims"]
    if not isinstance(claims, list) or len(claims) > 4:
        raise InvalidAnswer("claims must be an array of at most four objects", raw_output)
    for index, claim in enumerate(claims):
        if not isinstance(claim, dict) or set(claim) != {"text", "evidence_ids"}:
            raise InvalidAnswer(f"claims[{index}] must contain only text and evidence_ids", raw_output)
        if not isinstance(claim["text"], str):
            raise InvalidAnswer(f"claims[{index}].text must be a string", raw_output)
        evidence_ids = claim["evidence_ids"]
        if not isinstance(evidence_ids, list) or not all(isinstance(item, str) for item in evidence_ids):
            raise InvalidAnswer(f"claims[{index}].evidence_ids must be an array of strings", raw_output)
        if len(evidence_ids) != len(set(evidence_ids)):
            raise InvalidAnswer(f"claims[{index}].evidence_ids contains duplicates", raw_output)
        unknown = sorted(set(evidence_ids) - retrieved_evidence_ids)
        if unknown:
            raise InvalidAnswer(f"claims[{index}] cites IDs outside retrieved context: {', '.join(unknown)}", raw_output)
        if not evidence_ids and "evidence" not in claim["text"].lower() and "missing" not in claim["text"].lower():
            raise InvalidAnswer(f"claims[{index}] has no evidence IDs and does not describe an evidence gap", raw_output)
    return answer


def candidate_citations(raw_output: str) -> list[str]:
    """Extract citation IDs from parseable JSON even if other schema fields fail.

    This is only for the evaluator's citation-reference checks. It never turns
    an invalid answer into an accepted answer or repairs its contract fields.
    """
    try:
        value = json.loads(raw_output)
    except (json.JSONDecodeError, TypeError):
        return []
    if not isinstance(value, dict) or not isinstance(value.get("claims"), list):
        return []
    citations = {
        evidence_id
        for claim in value["claims"]
        if isinstance(claim, dict) and isinstance(claim.get("evidence_ids"), list)
        for evidence_id in claim["evidence_ids"]
        if isinstance(evidence_id, str)
    }
    return sorted(citations)
