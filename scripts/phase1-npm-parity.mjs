import assert from 'node:assert/strict';

// Sequential public acquisitions can retain different rate-limit counters.
// This projection is only for cross-observation parity. Original reports,
// evidence IDs, content hashes and stored bytes are never changed.
export function comparableNpmCitation(evidence, bytes) {
  if (evidence.kind !== 'source_claim' || evidence.side !== 'external' ||
      evidence.observationMethod !== 'separate-source-claim-v1' ||
      !/^source-claim-\d+-version-tag$/.test(evidence.locator.metadataKey ?? '')) {
    return {exact: evidence};
  }
  const claim = JSON.parse(bytes.toString('utf8'));
  assert.equal(claim.kind, 'version-tag');
  const captures = [...(claim.captures ?? []).map(item => item.capture), claim.failedCapture].filter(Boolean);
  for (const capture of captures) for (const hop of capture.hops ?? []) {
    for (const key of ['x-ratelimit-remaining', 'x-ratelimit-reset']) {
      if (Object.hasOwn(hop.headers ?? {}, key)) {
        assert.match(hop.headers[key], /^\d+$/);
        hop.headers[key] = '<observed numeric rate-limit header>';
      }
    }
  }
  const {evidenceId, contentRef, contentSha256, ...descriptor} = evidence;
  return {descriptor, claim};
}

export async function comparableNpmFindings(report, store) {
  const evidence = new Map(report.bundle.evidence.map(item => [item.evidenceId, item]));
  return Promise.all(report.analysis.findings.map(async finding => {
    const {findingId, evidenceIds, ...facts} = finding;
    const citations = await Promise.all(evidenceIds.map(async id => {
      const item = evidence.get(id);
      assert.ok(item, 'Finding citation must resolve within its own observation');
      const bytes = item.contentRef ? await store.get(item.contentRef) : Buffer.alloc(0);
      return comparableNpmCitation(item, bytes);
    }));
    citations.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    return {facts, citations};
  }));
}
