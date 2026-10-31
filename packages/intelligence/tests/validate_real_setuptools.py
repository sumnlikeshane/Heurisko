#!/usr/bin/env python3
"""Exercise M1 deterministic analysis against the pinned public setuptools case."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[3]
SCHEMA = json.loads((ROOT / "packages/contracts/schema/contracts.schema.json").read_text())


def ref_schema(name: str) -> dict:
    return {"$schema": SCHEMA["$schema"], "$defs": SCHEMA["$defs"], "$ref": f"#/$defs/{name}"}


result = subprocess.run(
    ["node", str(ROOT / "packages/intelligence/tests/real-setuptools.mjs")],
    cwd=ROOT,
    check=True,
    capture_output=True,
    text=True,
)
case = json.loads(result.stdout)
Draft202012Validator(ref_schema("EvidenceBundle")).validate(case["bundle"])
Draft202012Validator(ref_schema("AnalysisResults")).validate(case["analysis"])

oracle = {
    row["query_id"]: row
    for row in map(json.loads, (ROOT / "experiments/rag/datasets/real/setuptools-60.0.0/oracle/judgments.jsonl").read_text().splitlines())
}
for probe in case["retrievalProbes"]:
    selected_ids = [item["evidenceId"] for item in probe["result"]["selected"]]
    relevant_ids = set(oracle[probe["queryId"]]["relevant_evidence_ids"])
    assert relevant_ids.issubset(selected_ids), f"{probe['queryId']}: relevant evidence omitted by bounded retrieval"

findings = case["analysis"]["findings"]
generated = next(item for item in findings if item["ruleId"] == "heurisko.change.generated-candidate-unverified")
hook = next(item for item in findings if item["ruleId"] == "heurisko.artifact.python-startup-hook")
assert generated["explanationStrength"] == "hypothesis"
assert "unverified" in generated["title"].lower()
assert "remains a hypothesis" in generated["whyItMatters"]
assert hook["evidenceIds"] == [
    "ev_0af170efa4b01ea3bcc51c54",
    "ev_2c623c2ce90a481e378d7a27",
    "ev_538c8c1b965709b1507b36f9",
    "ev_d7853a3156a8d2146e64cd2e",
]
assert hook["explanationStrength"] == "supported_unreproduced"
assert hook["severity"] == "low"
assert case["analysis"]["aiState"] == {"status": "disabled", "validation": "not_run"}
assert case["analysis"]["interpretations"] == []
assert case["bundle"]["coverage"]["complete"] is False
print("PASS real M1/M2 evidence: pinned setuptools wheel-only .pth remains visible and untrusted; bounded retrieval returns all manually labeled relevant excerpts at k=5")
