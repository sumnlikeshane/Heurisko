import json
import hashlib
import subprocess
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[3]
SCHEMA = json.loads((ROOT / "packages/contracts/schema/contracts.schema.json").read_text())
result = subprocess.run(
    ["node", str(ROOT / "packages/intelligence/tests/retrieval.mjs")],
    check=True,
    capture_output=True,
    text=True,
)
evaluation = json.loads(result.stdout)
assert evaluation["fixtureKind"] == "synthetic_contract"
bundle = evaluation["bundle"]
bundle_schema = {"$schema": SCHEMA["$schema"], "$defs": SCHEMA["$defs"], "$ref": "#/$defs/EvidenceBundle"}
Draft202012Validator(bundle_schema).validate(bundle)

source_context = [
    {
        "repo": candidate["repositoryUrl"],
        "commit": candidate.get("commit", ""),
        "subdirectory": candidate.get("subdirectory", ""),
        "sourceSnapshotSha256": candidate.get("sourceSnapshotSha256", ""),
        "buildContextSha256": candidate.get("buildContextSha256", ""),
    }
    for candidate in bundle["sourceCandidates"]
]
for record in bundle["evidence"]:
    locator = record["locator"]
    canonical = {
        "artifact": bundle["artifact"]["observedSha256"],
        "source": source_context,
        "kind": record["kind"],
        "side": record["side"],
        "path": locator.get("path", ""),
        "metadataKey": locator.get("metadataKey", ""),
        "contentDigest": record.get("contentSha256", ""),
        **{key: locator[key] for key in ("startLine", "endLine", "startByte", "endByte") if key in locator},
    }
    evidence_id = "ev_" + hashlib.sha256(json.dumps(canonical, sort_keys=True, separators=(",", ":")).encode()).hexdigest()[:24]
    assert record["evidenceId"] == evidence_id, "synthetic retrieval fixture changed a locator/digest without refreshing its evidence ID"

retrieval = evaluation["retrieval"]
assert retrieval["method"] == "lexical-v0"
assert len(retrieval["selected"]) == 1
selected = retrieval["selected"][0]
assert selected["evidenceId"] == evaluation["manifestEvidenceId"]
assert (selected["path"], selected["startLine"], selected["endLine"]) == ("package.json", 12, 12)
assert "SYNTHETIC_TEST_MARKER" in selected["text"]
assert selected["score"] > 0

skipped = {item["evidenceId"]: item["reason"] for item in retrieval["skipped"]}
assert "not retained and addressable" in skipped[evaluation["sourceEvidenceId"]]
assert "does not match" in skipped[evaluation["artifactEvidenceId"]]
assert "absent from this bundle" in skipped["ev_000000000000000000000000"]

assert evaluation["validCitation"]["valid"] is True
assert evaluation["unknownCitation"]["valid"] is False
assert evaluation["unknownCitation"]["unknownEvidenceIds"] == ["ev_000000000000000000000000"]
assert evaluation["unselectedCitation"]["valid"] is False
assert evaluation["unselectedCitation"]["evidenceNotRetrieved"] == ["ev_f90bd8f69e9fd9c6abe99c39"]

assert evaluation["noMatch"]["selected"] == []
assert any("not evidence that no relevant content exists" in item for item in evaluation["noMatch"]["limitations"])
print("PASS synthetic M2 retrieval: retained-content filter, lexical ranking, exact evidence locators, and citation membership checks")
