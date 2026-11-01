import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(here, '../../contracts/tests/fixtures');

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

function sourceIdentity(candidate) {
  return {
    repo: candidate.repositoryUrl,
    commit: candidate.commit ?? '',
    subdirectory: candidate.subdirectory ?? '',
    sourceSnapshotSha256: candidate.sourceSnapshotSha256 ?? '',
    buildContextSha256: candidate.buildContextSha256 ?? '',
  };
}

function refreshEvidenceId(bundle, evidence) {
  const locator = evidence.locator;
  const canonical = {
    artifact: bundle.artifact.observedSha256,
    source: bundle.sourceCandidates.map(sourceIdentity),
    kind: evidence.kind,
    side: evidence.side,
    path: locator.path ?? '',
    metadataKey: locator.metadataKey ?? '',
    contentDigest: evidence.contentSha256 ?? '',
    ...Object.fromEntries(['startLine', 'endLine', 'startByte', 'endByte']
      .filter((key) => locator[key] !== undefined)
      .map((key) => [key, locator[key]])),
  };
  return `ev_${createHash('sha256').update(stableJson(canonical)).digest('hex').slice(0, 24)}`;
}

function replaceReference(bundle, previousId, nextId) {
  for (const change of bundle.changes) {
    change.evidenceIds = change.evidenceIds.map((id) => id === previousId ? nextId : id);
  }
  for (const candidate of bundle.sourceCandidates) {
    candidate.evidenceIds = candidate.evidenceIds.map((id) => id === previousId ? nextId : id);
  }
  bundle.provenance.evidenceIds = bundle.provenance.evidenceIds.map((id) => id === previousId ? nextId : id);
  for (const omission of bundle.coverage.omissions) {
    omission.evidenceIds = omission.evidenceIds.map((id) => id === previousId ? nextId : id);
  }
  if (bundle.artifact.metadataEvidenceId === previousId) bundle.artifact.metadataEvidenceId = nextId;
}

export function createSyntheticEvidence({ manifestText = '{"scripts":{"postinstall":"SYNTHETIC_TEST_MARKER"}}' } = {}) {
  const bundle = JSON.parse(readFileSync(resolve(fixtureRoot, 'F1', 'bundle.json'), 'utf8'));
  const manifest = bundle.evidence.find((item) => item.kind === 'manifest_delta');
  const artifact = bundle.evidence.find((item) => item.kind === 'artifact_member');
  const source = bundle.evidence.find((item) => item.kind === 'source_member');
  const artifactText = "export const greeting = 'synthetic';\nexport default greeting;";

  for (const [record, contentRef, text, startLine, endLine] of [
    [manifest, 'synthetic://m2/package.json#postinstall', manifestText, 12, 12],
    [artifact, 'synthetic://m2/package/index.js', artifactText, 1, 2],
  ]) {
    const previousId = record.evidenceId;
    record.contentState = 'retained';
    record.contentRef = contentRef;
    record.contentSha256 = `sha256:${createHash('sha256').update(text).digest('hex')}`;
    record.locator.startLine = startLine;
    record.locator.endLine = endLine;
    record.evidenceId = refreshEvidenceId(bundle, record);
    replaceReference(bundle, previousId, record.evidenceId);
  }

  const excerpts = [
    { evidenceId: manifest.evidenceId, contentRef: manifest.contentRef, text: manifestText },
    { evidenceId: artifact.evidenceId, contentRef: 'synthetic://m2/wrong-content-ref', text: artifactText },
    { evidenceId: source.evidenceId, contentRef: 'synthetic://m2/source', text: 'install lifecycle setup script' },
    { evidenceId: 'ev_000000000000000000000000', contentRef: 'synthetic://m2/unknown', text: 'install lifecycle setup script' },
  ];

  return { bundle, manifest, artifact, source, excerpts };
}
