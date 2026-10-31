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
BUNDLE_SCHEMA = {
    "$schema": SCHEMA["$schema"],
    "$defs": SCHEMA["$defs"],
    "$ref": "#/$defs/EvidenceBundle",
}

result = subprocess.run(
    ["node", str(ROOT / "packages/intelligence/tests/handshake.mjs")],
    cwd=ROOT,
    check=True,
    capture_output=True,
    text=True,
)
cases = json.loads(result.stdout)
assert [case["id"] for case in cases] == [
    *(f"F{i}" for i in range(7)),
    "M1_ADDED_TEST_SCRIPT",
    "M1_CHANGED_ENTRYPOINT",
    "M1_GENERATED_VERIFIED",
    "M1_UNCITED_CHANGE",
    "M1_CONTRADICTORY_EQUALITY",
]
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
bundle_validator = Draft202012Validator(BUNDLE_SCHEMA)
for case in cases:
    bundle = case["bundle"]
    analysis = case["analysis"]
    report = case.get("report")
    validator.validate(analysis)
    bundle_validator.validate(bundle)
    if report is not None:
        report_validator.validate(report)
        assert report["bundle"] == bundle and report["analysis"] == analysis

    evidence_ids = {entry["evidenceId"] for entry in bundle["evidence"]}
    for item in analysis["findings"] + analysis["interpretations"]:
        assert set(item["evidenceIds"]).issubset(evidence_ids), f"{case['id']}: unknown evidence reference"

    if bundle["fixtureKind"] == "synthetic_contract":
        for finding in analysis["findings"]:
            assert any("synthetic contract fixture, not a real package observation" in item for item in finding["limitations"]), case["id"]

    if bundle["input"]["analysisOptions"]["enableAI"]:
        assert analysis["aiState"]["status"] == "unavailable"
        assert analysis["aiState"]["validation"] == "not_run"
        assert any(error["code"] == "AI_ADAPTER_NOT_IMPLEMENTED" for stage in analysis["stages"] for error in stage["errors"])
    else:
        assert analysis["aiState"] == {"status": "disabled", "validation": "not_run"}

    assert analysis["interpretations"] == []
    assert analysis["limitations"][:len(bundle["limitations"])] == bundle["limitations"]
    assert next(stage for stage in analysis["stages"] if stage["stage"] == "heuristics")["status"] == "complete"

    if case["id"] == "F1":
        lifecycle = [finding for finding in analysis["findings"] if finding["ruleId"] == "heurisko.manifest.lifecycle-script-change"]
        assert lifecycle and "scripts.postinstall" in lifecycle[0]["observation"]
        assert lifecycle[0]["evidenceIds"] == ["ev_3a974c4a4c967cd1b13b3fee"]
    elif case["id"] == "F2":
        generated = [finding for finding in analysis["findings"] if finding["ruleId"] == "heurisko.change.generated-candidate-unverified"]
        assert generated and generated[0]["explanationStrength"] == "hypothesis"
    elif case["id"] == "F4":
        omitted = [finding for finding in analysis["findings"] if finding["ruleId"] == "heurisko.change.unresolved-difference"]
        assert omitted and omitted[0]["title"] == "Changed artifact member was not fully analyzed"
        assert omitted[0]["evidenceIds"] == ["ev_8b657440e1053afa2cb81186"]
    elif case["id"] == "M1_ADDED_TEST_SCRIPT":
        script = [finding for finding in analysis["findings"] if finding["ruleId"] == "heurisko.manifest.script-change"]
        assert script and "scripts.test is reported as added" in script[0]["observation"]
        assert script[0]["severity"] == "informational"
    elif case["id"] == "M1_CHANGED_ENTRYPOINT":
        entrypoint = [finding for finding in analysis["findings"] if finding["ruleId"] == "heurisko.manifest.entrypoint-change"]
        assert entrypoint and entrypoint[0]["evidenceIds"] == [case["bundle"]["changes"][0]["evidenceIds"][0]]
        assert "Manifest key exports" in entrypoint[0]["observation"]
    elif case["id"] == "M1_GENERATED_VERIFIED":
        generated = [finding for finding in analysis["findings"] if finding["ruleId"] == "heurisko.change.generated-candidate-reproduced"]
        assert generated and generated[0]["explanationStrength"] == "reproduced"
        assert set(generated[0]["evidenceIds"]) == set(case["bundle"]["changes"][0]["evidenceIds"])
        assert "does not establish that the source or output is benign" in generated[0]["whyItMatters"]
    elif case["id"] == "M1_UNCITED_CHANGE":
        assert analysis["findings"] == []
        assert any("have no evidence IDs" in item for item in analysis["limitations"])
    elif case["id"] == "M1_CONTRADICTORY_EQUALITY":
        assert analysis["findings"] == []
        assert any("reporting raw equality" in item for item in analysis["limitations"])
    elif case["id"] == "F0" or case["id"] == "F6":
        assert analysis["findings"] == []

print("PASS synthetic M1 evaluation: lifecycle and entrypoint deltas, generated evidence, omissions, and contradictory or uncited records are checked against the shared schemas")
