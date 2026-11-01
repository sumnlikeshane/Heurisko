import json
import subprocess
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[3]
SCHEMA = json.loads((ROOT / "packages/contracts/schema/contracts.schema.json").read_text())
result = subprocess.run(
    ["node", str(ROOT / "packages/intelligence/tests/interpretations.mjs")],
    check=True,
    capture_output=True,
    text=True,
)
cases = json.loads(result.stdout)
assert cases["fixtureKind"] == "synthetic_contract"
schema = {"$schema": SCHEMA["$schema"], "$defs": SCHEMA["$defs"], "$ref": "#/$defs/AIInterpretation"}
validator = Draft202012Validator(schema)

for key in ("acceptedSupported", "acceptedUnsupportedClaim", "acceptedAbstention"):
    result = cases[key]
    assert result["status"] == "accepted", f"{key}: {result}"
    validator.validate(result["interpretation"])

assert cases["acceptedSupported"]["interpretation"]["validation"] == "passed"
assert cases["acceptedAbstention"]["interpretation"]["evidenceIds"] == []
assert cases["acceptedAbstention"]["interpretation"]["abstentionReason"]

expected_rejections = {
    "rejectedExtraField": "invalid_shape",
    "rejectedUnknownEvidence": "unknown_evidence_id",
    "rejectedUnselectedEvidence": "evidence_not_retrieved",
    "rejectedUnknownFinding": "unknown_finding_id",
    "rejectedUncitedNonAbstention": "citation_required",
    "rejectedMismatchedFindingEvidence": "finding_evidence_mismatch",
    "rejectedMissingMetadata": "invalid_metadata",
}
for key, code in expected_rejections.items():
    result = cases[key]
    assert result["status"] == "rejected" and result["code"] == code, f"{key}: {result}"

# Structural/reference validation deliberately does not claim entailment.
assert cases["acceptedUnsupportedClaim"]["interpretation"]["hypothesis"].startswith("The postinstall hook steals credentials")
print("PASS synthetic M2 interpretation checks: strict shape, known finding/retrieved evidence, citation alignment, and explicit abstention; entailment remains a separate judge step")
