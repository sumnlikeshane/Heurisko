#!/usr/bin/env python3
"""Validate actual M0 adapter outputs against the shared G0 schema."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[3]
CONTRACTS = ROOT / "packages/contracts"
LABELS = json.loads((ROOT / "packages/intelligence/tests/fixtures/m0-case-labels.json").read_text())
SCHEMA = json.loads((CONTRACTS / "schema/contracts.schema.json").read_text())
ANALYSIS_SCHEMA = {
    "$schema": SCHEMA["$schema"],
    "$defs": SCHEMA["$defs"],
    "$ref": "#/$defs/AnalysisResults",
}
REPORT_SCHEMA = {
    "$schema": SCHEMA["$schema"],
    "$defs": SCHEMA["$defs"],
    "$ref": "#/$defs/InvestigationReport",
}

result = subprocess.run(
    ["node", str(ROOT / "packages/intelligence/tests/handshake.mjs")],
    cwd=ROOT,
    check=True,
    capture_output=True,
    text=True,
)
cases = json.loads(result.stdout)
assert [case["id"] for case in cases] == [f"F{i}" for i in range(7)]
assert LABELS["fixtureKind"] == "synthetic_contract"
assert {case["id"] for case in LABELS["cases"]} == {
    "benign-exact-match",
    "benign-generated-output",
    "introduced-install-hook",
    "unexpected-opaque-executable-candidate",
    "ambiguous-source",
    "missing-source-and-incomplete-evidence",
    "hostile-package-comment",
}
for case in LABELS["cases"]:
    fixture = case.get("contractFixture")
    if fixture:
        assert (ROOT / fixture / "bundle.json").is_file(), f"missing labeled fixture {fixture}"
hostile_case = next(case for case in LABELS["cases"] if case["id"] == "hostile-package-comment")
assert "Ignore prior analysis rules" in hostile_case["content"]
assert "no tools, commands, or model are invoked" in hostile_case["limit"]

validator = Draft202012Validator(ANALYSIS_SCHEMA)
report_validator = Draft202012Validator(REPORT_SCHEMA)
for case in cases:
    bundle = case["bundle"]
    analysis = case["analysis"]
    report = case["report"]
    validator.validate(analysis)
    report_validator.validate(report)
    assert report["bundle"] == bundle and report["analysis"] == analysis

    evidence_ids = {entry["evidenceId"] for entry in bundle["evidence"]}
    for item in analysis["findings"] + analysis["interpretations"]:
        assert set(item["evidenceIds"]).issubset(evidence_ids), f"{case['id']}: unknown evidence reference"

    if bundle["input"]["analysisOptions"]["enableAI"]:
        assert analysis["aiState"]["status"] == "unavailable"
        assert analysis["aiState"]["validation"] == "not_run"
        assert any(error["code"] == "AI_ADAPTER_NOT_IMPLEMENTED" for stage in analysis["stages"] for error in stage["errors"])
    else:
        assert analysis["aiState"] == {"status": "disabled", "validation": "not_run"}

    assert analysis["findings"] == []
    assert analysis["interpretations"] == []
    assert analysis["limitations"][:len(bundle["limitations"])] == bundle["limitations"]

print("PASS M0 analyzeEvidence handshake: F0–F6 outputs satisfy AnalysisResults and InvestigationReport schemas")
