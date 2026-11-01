import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeEvidence, retrieveEvidence } from '../dist/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const caseRoot = resolve(here, '../../../experiments/rag/datasets/real/setuptools-60.0.0');
const manifest = JSON.parse(readFileSync(resolve(caseRoot, 'manifest.json'), 'utf8'));
const documents = readFileSync(resolve(caseRoot, 'documents.jsonl'), 'utf8')
  .split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const sha256 = (value) => `sha256:${createHash('sha256').update(value).digest('hex')}`;
const getDocument = (path) => {
  const found = documents.find((item) => item.path === path);
  if (!found) throw new Error(`real setuptools case missing evidence: ${path}`);
  if (sha256(found.content) !== found.content_sha256) throw new Error(`excerpt digest mismatch: ${path}`);
  return found;
};
const artifactPath = resolve(caseRoot, manifest.artifact.filename);
const wheelDigest = sha256(readFileSync(artifactPath));
const sourceDigest = sha256(readFileSync(resolve(caseRoot, manifest.source_distribution.filename)));
if (wheelDigest !== manifest.artifact.sha256) throw new Error('wheel digest differs from the pinned manifest');
if (sourceDigest !== manifest.source_distribution.sha256) throw new Error('sdist digest differs from the pinned manifest');

const selected = [
  getDocument('distutils-precedence.pth'),
  getDocument('setup.py'),
  getDocument('_distutils_hack/__init__.py'),
  getDocument('CHANGES.rst'),
  getDocument('wheel vs sdist inventory'),
];
const evidence = selected.map((document) => {
  const kind = document.kind === 'inventory_diff' ? 'raw_diff'
    : document.kind === 'artifact_member' ? 'artifact_member'
      : document.kind === 'release_notes' ? 'source_member' : 'source_member';
  const side = kind === 'artifact_member' ? 'artifact'
    : kind === 'raw_diff' ? 'both' : 'source';
  return {
    evidenceId: document.evidence_id,
    kind,
    side,
    locator: { path: document.path, startLine: document.start_line, endLine: document.end_line },
    contentSha256: document.content_sha256,
    observationMethod: 'Curated public excerpt; excerpt SHA-256 checked by this test harness.',
    contentState: 'retained',
    contentRef: `dataset://${manifest.dataset_id}/${document.evidence_id}`,
    verification: 'verified',
    limitations: ['Excerpt digest verification does not establish artifact-to-source provenance.'],
  };
});
const evidenceIds = evidence.map((item) => item.evidenceId);
const hook = selected[0];
const content = selected.map((document) => ({
  evidenceId: document.evidence_id,
  contentRef: `dataset://${manifest.dataset_id}/${document.evidence_id}`,
  text: document.content,
}));
const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
const bundle = {
  schemaVersion: '0.1.0',
  input: {
    ecosystem: 'local',
    artifactPath,
    packageName: manifest.package.name,
    version: manifest.package.version,
    artifactFilename: manifest.artifact.filename,
    analysisOptions: { enableAI: false, analysisProfile: 'm1-real-evidence' },
  },
  artifact: {
    origin: 'local',
    artifactFilename: manifest.artifact.filename,
    observedSha256: wheelDigest,
    captureTime: now,
    integrity: { algorithm: 'sha256', expectedValue: manifest.artifact.sha256, status: 'matched' },
    packageName: manifest.package.name,
    version: manifest.package.version,
  },
  sourceCandidates: [{
    repositoryUrl: manifest.source_candidate.repository,
    commit: manifest.source_candidate.commit,
    association: 'publisher_asserted',
    evidenceIds: selected.filter((item) => item.kind !== 'artifact_member' && item.kind !== 'inventory_diff').map((item) => item.evidence_id),
    conflicts: [],
  }],
  provenance: {
    status: 'not_checked',
    artifactBinding: 'not_checked',
    evidenceIds: [],
    limitations: ['No independently verified attestation binding this wheel digest to the source commit is included.'],
  },
  evidence,
  changes: [{
    changeId: 'chg_setuptools_wheel_startup_hook',
    status: 'generated_candidate',
    artifactPath: hook.path,
    rawEquality: 'different',
    explanationStrength: 'hypothesis',
    evidenceIds,
    notes: ['Static wheel/sdist inventory identifies a wheel-only .pth hook; no build was executed.'],
  }],
  stages: [
    { stage: 'resolve_artifact', status: 'complete', errors: [] },
    { stage: 'acquire', status: 'complete', errors: [] },
    { stage: 'source', status: 'complete', errors: [] },
    { stage: 'provenance', status: 'skipped', errors: [] },
    { stage: 'inventory', status: 'complete', errors: [] },
    { stage: 'compare', status: 'complete', errors: [] },
    { stage: 'build', status: 'skipped', errors: [] },
    { stage: 'heuristics', status: 'complete', errors: [] },
    { stage: 'ai', status: 'skipped', errors: [] },
    { stage: 'persist', status: 'skipped', errors: [] },
  ],
  coverage: {
    sourceFiles: 2,
    artifactFiles: 1,
    comparedFiles: 1,
    analyzedBytes: selected.reduce((total, item) => total + Buffer.byteLength(item.content), 0),
    skippedBytes: 0,
    unsupportedBytes: 0,
    omissions: [],
    complete: false,
    limitations: ['This Malhar-owned rule probe uses a bounded selected excerpt set, not a complete package investigation.'],
  },
  limitations: ['This real evidence probe validates interpretation rules only; it is not a product collector or complete package report.'],
  fixtureKind: 'real_generated',
};

const analysis = await analyzeEvidence(bundle, bundle.input.analysisOptions, content);
const queries = readFileSync(resolve(caseRoot, 'queries.jsonl'), 'utf8')
  .split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const retrievalProbes = queries.map((item) => ({
  queryId: item.query_id,
  result: retrieveEvidence(bundle, item.query, content, { maxResults: 5 }),
}));
const generated = analysis.findings.find((finding) => finding.ruleId === 'heurisko.change.generated-candidate-unverified');
const startupHook = analysis.findings.find((finding) => finding.ruleId === 'heurisko.artifact.python-startup-hook');
if (!generated) throw new Error('unverified generated candidate was not retained as a finding');
if (!startupHook) throw new Error('executable .pth content was not detected');
if (/\b(?:is|was|appears|considered) malicious\b|\b(?:safe|benign)\b/i.test(`${startupHook.title} ${startupHook.whyItMatters}`)) {
  throw new Error('deterministic finding made an unsupported safety or intent verdict');
}
if (analysis.aiState.status !== 'disabled' || analysis.interpretations.length !== 0) {
  throw new Error('M1 real evidence check must not invoke model inference');
}
if (!startupHook.evidenceIds.includes(hook.evidence_id)
  || !startupHook.evidenceIds.every((id) => evidenceIds.includes(id))) {
  throw new Error('startup-hook finding lost or invented evidence references');
}

process.stdout.write(JSON.stringify({ bundle, analysis, excerpts: content, retrievalProbes, sourceDigests: { wheelDigest, sourceDigest } }));
