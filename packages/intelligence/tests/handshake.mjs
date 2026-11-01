import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { analyzeEvidence } from '../dist/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(here, '../../contracts/tests/fixtures');
const cases = [];

const stableJson = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
};

function refreshEvidenceId(bundle, evidence) {
  const source = bundle.sourceCandidates.map((candidate) => ({
    repo: candidate.repositoryUrl,
    commit: candidate.commit ?? '',
    subdirectory: candidate.subdirectory ?? '',
    sourceSnapshotSha256: candidate.sourceSnapshotSha256 ?? '',
    buildContextSha256: candidate.buildContextSha256 ?? '',
  }));
  const locator = evidence.locator;
  const canonical = {
    artifact: bundle.artifact.observedSha256,
    source,
    kind: evidence.kind,
    side: evidence.side,
    path: locator.path ?? '',
    metadataKey: locator.metadataKey ?? '',
    contentDigest: evidence.contentSha256 ?? '',
  };
  evidence.evidenceId = `ev_${createHash('sha256').update(stableJson(canonical)).digest('hex').slice(0, 24)}`;
}

for (let index = 0; index <= 6; index += 1) {
  const id = `F${index}`;
  const bundle = JSON.parse(readFileSync(resolve(fixtureRoot, id, 'bundle.json'), 'utf8'));
  const expectedReport = JSON.parse(readFileSync(resolve(fixtureRoot, id, 'report.json'), 'utf8'));
  const before = JSON.stringify(bundle);
  const analysis = await analyzeEvidence(bundle, bundle.input.analysisOptions);

  if (JSON.stringify(bundle) !== before) throw new Error(`${id}: input bundle was mutated`);
  const report = { ...expectedReport, bundle, analysis };
  cases.push({ id, bundle, analysis, report });
}

// A small labeled rule probe: add package.json scripts.test to the F1 contract case.
// It is an interface test fixture, not a real package example or training datum.
const base = JSON.parse(readFileSync(resolve(fixtureRoot, 'F1', 'bundle.json'), 'utf8'));
const probe = structuredClone(base);
const change = probe.changes[0];
const delta = probe.evidence.find((item) => item.kind === 'manifest_delta');
change.changeId = 'chg_m1_added_test_script';
change.status = 'added';
change.sourcePath = undefined;
change.artifactPath = 'package.json';
change.notes = ['M1 synthetic contract probe: scripts.test is added to the artifact.'];
change.evidenceIds = [delta.evidenceId];
delta.side = 'artifact';
delta.locator.metadataKey = 'scripts.test';
refreshEvidenceId(probe, delta);
change.evidenceIds = [delta.evidenceId];
const probeAnalysis = await analyzeEvidence(probe, { ...probe.input.analysisOptions, enableAI: false });
cases.push({ id: 'M1_ADDED_TEST_SCRIPT', bundle: probe, analysis: probeAnalysis });

for (const [id, sourceValue, artifactValue, expectedDirection] of [
  ['M1_RETAINED_SCRIPT_ADDED', null, { value: 'node install.js' }, 'is reported as added to the artifact'],
  ['M1_RETAINED_SCRIPT_REMOVED', { value: 'node install.js' }, null, 'is reported as removed from the artifact'],
]) {
  const retainedProbe = structuredClone(probe);
  retainedProbe.changes[0].status = artifactValue === null ? 'removed' : 'added';
  const retainedDelta = retainedProbe.evidence.find((item) => item.kind === 'manifest_delta');
  retainedDelta.locator.metadataKey = 'scripts.postinstall';
  retainedDelta.contentState = 'retained';
  retainedDelta.contentRef = `synthetic://m1/${id}`;
  const retainedText = JSON.stringify({
    version: 'heurisko-manifest-delta-v1',
    pointer: '/scripts/postinstall',
    source: sourceValue,
    artifact: artifactValue,
  });
  const retainedAnalysis = await analyzeEvidence(
    retainedProbe,
    { ...retainedProbe.input.analysisOptions, enableAI: false },
    [{ evidenceId: retainedDelta.evidenceId, contentRef: retainedDelta.contentRef, text: retainedText }],
  );
  cases.push({ id, bundle: retainedProbe, analysis: retainedAnalysis, expectedDirection });
}

const entrypointProbe = structuredClone(probe);
const entrypointChange = entrypointProbe.changes[0];
const entrypointDelta = entrypointProbe.evidence.find((item) => item.kind === 'manifest_delta');
entrypointChange.changeId = 'chg_m1_changed_entrypoint';
entrypointChange.status = 'modified';
entrypointDelta.locator.metadataKey = 'exports';
refreshEvidenceId(entrypointProbe, entrypointDelta);
entrypointChange.evidenceIds = [entrypointDelta.evidenceId];
const entrypointAnalysis = await analyzeEvidence(entrypointProbe, { ...entrypointProbe.input.analysisOptions, enableAI: false });
cases.push({ id: 'M1_CHANGED_ENTRYPOINT', bundle: entrypointProbe, analysis: entrypointAnalysis });

const generatedProbe = JSON.parse(readFileSync(resolve(fixtureRoot, 'F2', 'bundle.json'), 'utf8'));
generatedProbe.changes[0].explanationStrength = 'reproduced';
const buildRecord = generatedProbe.evidence.find((item) => item.kind === 'build_record');
buildRecord.verification = 'verified';
const generatedAnalysis = await analyzeEvidence(generatedProbe, { ...generatedProbe.input.analysisOptions, enableAI: false });
cases.push({ id: 'M1_GENERATED_VERIFIED', bundle: generatedProbe, analysis: generatedAnalysis });

const uncitedProbe = structuredClone(probe);
uncitedProbe.changes[0].changeId = 'chg_m1_uncited_change';
uncitedProbe.changes[0].evidenceIds = [];
const uncitedAnalysis = await analyzeEvidence(uncitedProbe, { ...uncitedProbe.input.analysisOptions, enableAI: false });
cases.push({ id: 'M1_UNCITED_CHANGE', bundle: uncitedProbe, analysis: uncitedAnalysis });

const contradictoryProbe = structuredClone(probe);
contradictoryProbe.changes[0].changeId = 'chg_m1_contradictory_equality';
contradictoryProbe.changes[0].rawEquality = 'equal';
const contradictoryAnalysis = await analyzeEvidence(contradictoryProbe, { ...contradictoryProbe.input.analysisOptions, enableAI: false });
cases.push({ id: 'M1_CONTRADICTORY_EQUALITY', bundle: contradictoryProbe, analysis: contradictoryAnalysis });

process.stdout.write(JSON.stringify(cases));
