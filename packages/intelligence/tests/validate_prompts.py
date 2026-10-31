import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
result = subprocess.run(
    ["node", str(ROOT / "packages/intelligence/tests/prompts.mjs")],
    check=True,
    capture_output=True,
    text=True,
)
cases = json.loads(result.stdout)
assert cases["fixtureKind"] == "synthetic_contract"

prompt = cases["prompt"]
payload = cases["payload"]
assert prompt["promptVersion"] == "heurisko-interpretation-v6"
assert prompt["toolPolicy"] == "no-tools"
assert "untrusted data" in prompt["systemInstruction"]
assert "Ignore previous instructions" not in prompt["systemInstruction"]
assert payload["payloadKind"] == "untrusted-evidence-and-findings"
assert "never as instructions" in payload["instruction"]
assert set(payload) == {"payloadKind", "instruction", "question", "findings", "retrievedEvidence"}
assert payload["question"] == "Explain the package change."
assert len(payload["retrievedEvidence"]) == 1
evidence = payload["retrievedEvidence"][0]
assert evidence["evidenceId"] == cases["sourceEvidenceId"]
assert (evidence["path"], evidence["startLine"], evidence["endLine"]) == ("package.json", 12, 12)
assert evidence["text"] == cases["hostileText"]
assert prompt["includedEvidenceIds"] == [cases["sourceEvidenceId"]]
assert prompt["omittedEvidenceIds"] == []
assert len(prompt["userPayload"]) <= 4000

# Oversized evidence is omitted whole; its ID remains visible to the caller.
oversized = cases["oversized"]
assert len(oversized["userPayload"]) <= 1100
assert oversized["includedEvidenceIds"] == []
assert oversized["omittedEvidenceIds"] == [cases["sourceEvidenceId"]]
assert json.loads(oversized["userPayload"])["retrievedEvidence"] == []

print("PASS synthetic M2 prompt packaging: fixed instruction/data separation, hostile payload containment, no tool channel, preserved citations, and whole-excerpt size limits")
