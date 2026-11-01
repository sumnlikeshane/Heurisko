#!/usr/bin/env python3
"""Validate OpenRouter adapter success, abstention, rejection and outage states."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[3]
SCHEMA = json.loads((ROOT / "packages/contracts/schema/contracts.schema.json").read_text())
ANALYSIS_SCHEMA = {
    "$schema": SCHEMA["$schema"],
    "$defs": SCHEMA["$defs"],
    "$ref": "#/$defs/AnalysisResults",
}
result = subprocess.run(
    ["node", str(ROOT / "packages/intelligence/tests/inference.mjs")],
    cwd=ROOT,
    check=True,
    capture_output=True,
    text=True,
)
output = json.loads(result.stdout)
validator = Draft202012Validator(ANALYSIS_SCHEMA)
for analysis in output["analyses"]:
    validator.validate(analysis)
assert output["disabled"]["status"] == "disabled"
assert output["accepted"]["status"] == "available"
assert output["mixedAbstention"]["status"] == "rejected"
assert output["invalidReference"]["status"] == "rejected"
assert output["uncitedAlternative"]["status"] == "rejected"
assert output["explicitAbstention"]["status"] == "abstained"
assert output["provenanceGuard"]["status"] == "rejected"
assert output["unsupportedGeneration"]["status"] == "rejected"
assert output["retryAttempts"] == 2
print("PASS M2 OpenRouter adapter: explicit opt-in, evidence-reference rejection, provenance abstention guard, retries, secret-safe metadata, and contract-valid result states")
