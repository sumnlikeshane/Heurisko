// Retained public B1 observation, no fresh acquisition or inference.
export const retainedExample = {
  "reportContentRef": "sha256:2ddd237e2aba592d6901317a935d38495e0d58f7b207200f369a85a8855ba4da",
  "artifact": {
    "origin": "registry",
    "artifactFilename": "picocolors-1.1.1.tgz",
    "observedSha256": "sha256:d3aedb2807967b7eb37fd11b03b7e3701e725af79c650d0812ff7213f8f882d9",
    "captureTime": "2026-10-31T19:00:21Z",
    "integrity": {
      "algorithm": "sha512",
      "expectedValue": "xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "status": "matched"
    },
    "packageName": "picocolors",
    "version": "1.1.1",
    "metadataEvidenceId": "ev_7a90e64a072096f956233446"
  },
  "outcomes": {
    "artifactIntegrity": "matched",
    "sourceAssociation": "ambiguous",
    "provenancePolicy": "not_checked",
    "correspondence": "unresolved",
    "analysisCompleteness": "incomplete",
    "policyResult": "indeterminate"
  },
  "source": "examples/handoff/current/B1.report.json"
} as const;
