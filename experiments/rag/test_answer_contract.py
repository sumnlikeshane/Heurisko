from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from answer_contract import InvalidAnswer, candidate_citations, parse_answer
from evaluate import score_case


def answer(**updates):
    value = {
        "summary": "The evidence shows a file difference.",
        "claims": [{"text": "The wheel contains the file.", "evidence_ids": ["ev-a"]}],
        "alternatives": [],
        "missing_evidence": [],
        "next_action": "Review the immutable source.",
        "abstained": False,
    }
    value.update(updates)
    return json.dumps(value)


class AnswerContractTests(unittest.TestCase):
    def test_accepts_well_formed_answer_with_retrieved_citation(self):
        parsed = parse_answer(answer(), {"ev-a"})
        self.assertIs(parsed["abstained"], False)

    def test_rejects_invalid_json(self):
        with self.assertRaisesRegex(InvalidAnswer, "invalid JSON"):
            parse_answer("{bad", {"ev-a"})

    def test_rejects_misspelled_abstention_field_without_repair(self):
        malformed = json.loads(answer())
        malformed.pop("abstained")
        malformed["abstended"] = False
        raw = json.dumps(malformed)
        with self.assertRaisesRegex(InvalidAnswer, "missing required fields: abstained"):
            parse_answer(raw, {"ev-a"})

    def test_rejects_non_boolean_abstention(self):
        with self.assertRaisesRegex(InvalidAnswer, "abstained must be a boolean"):
            parse_answer(answer(abstained=None), {"ev-a"})

    def test_rejects_duplicate_json_keys(self):
        raw = '{"summary":"x","summary":"y"}'
        with self.assertRaisesRegex(InvalidAnswer, "duplicate JSON object key: summary"):
            parse_answer(raw, set())

    def test_candidate_citations_survive_other_schema_errors(self):
        raw = answer(abstended=False)
        self.assertEqual(candidate_citations(raw), ["ev-a"])

    def test_rejects_citation_outside_retrieved_context(self):
        with self.assertRaisesRegex(InvalidAnswer, "outside retrieved context"):
            parse_answer(answer(claims=[{"text": "Claim.", "evidence_ids": ["ev-b"]}]), {"ev-a"})

    def test_evaluator_scores_retrieval_even_when_answer_contract_failed(self):
        scored = score_case(
            "q-1",
            {
                "retrieved_evidence_ids": ["ev-a"],
                "cited_evidence_ids": [],
                "abstained": None,
                "answer_valid": False,
                "answer_error": "missing required fields: abstained",
            },
            {"relevant_evidence_ids": ["ev-a"], "abstention_expected": True},
            {"ev-a"},
            1,
        )
        self.assertEqual(scored["recall_at_k"], 1.0)
        self.assertFalse(scored["answer_valid"])
        self.assertFalse(scored["abstention_correct"])
        self.assertIsNone(scored["actual_abstention"])


if __name__ == "__main__":
    unittest.main()
