import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeEvidenceWithOpenRouter, OPENROUTER_ANSWER_MODEL } from '../dist/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(here, '../../contracts/tests/fixtures');
const baseBundle = JSON.parse(readFileSync(resolve(fixtureRoot, 'F1/bundle.json'), 'utf8'));
const manifestEvidence = baseBundle.evidence.find((item) => item.kind === 'manifest_delta');
const nonRetrievedEvidenceId = baseBundle.evidence.find((item) => item.evidenceId !== manifestEvidence.evidenceId).evidenceId;
baseBundle.changes[0].evidenceIds.push(nonRetrievedEvidenceId);
manifestEvidence.contentState = 'retained';
manifestEvidence.contentRef = 'fixture://m2/package.json';
manifestEvidence.locator.path = 'package.json';
manifestEvidence.locator.startLine = 4;
manifestEvidence.locator.endLine = 4;
baseBundle.input.analysisOptions.enableAI = true;
const analysisOptions = { ...baseBundle.input.analysisOptions, enableAI: true };
const excerpts = [{
  evidenceId: manifestEvidence.evidenceId,
  contentRef: manifestEvidence.contentRef,
  text: '"scripts": {"postinstall": "node install.js"}',
}];

const baseDraft = {
  findingIds: [],
  evidenceIds: [manifestEvidence.evidenceId],
  hypothesis: 'The package adds a postinstall command.',
  reasoningSummary: `The manifest change is recorded at ${manifestEvidence.evidenceId}.`,
  alternatives: [],
  missingEvidence: [],
  nextActions: ['Review the referenced script without executing it.'],
  abstentionReason: '',
};

function fakeFetch(content, { status = 200, model = OPENROUTER_ANSWER_MODEL, finishReason = 'stop', usage = {} } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init, body: JSON.parse(init.body) });
    if (status !== 200) return new Response('provider error', { status, headers: { 'retry-after': '0' } });
    return new Response(JSON.stringify({
      id: 'gen-test-1',
      model,
      choices: [{ message: { content }, finish_reason: finishReason }],
      usage,
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  return { fetchImpl, calls };
}

const disabledFetch = fakeFetch(JSON.stringify(baseDraft));
const disabled = await analyzeEvidenceWithOpenRouter(
  baseBundle,
  { ...analysisOptions, enableAI: false },
  'What changed?',
  excerpts,
  { apiKey: 'test-secret', fetchImpl: disabledFetch.fetchImpl },
);
assert.equal(disabled.inference.status, 'not_called');
assert.equal(disabledFetch.calls.length, 0);
assert.equal(disabled.analysis.aiState.status, 'disabled');

// Bind to the deterministic finding ID produced for this fixture, not a model-created ID.
const promptOnlyFetch = fakeFetch(JSON.stringify(baseDraft));
const first = await analyzeEvidenceWithOpenRouter(baseBundle, analysisOptions, 'Explain the postinstall change.', excerpts, {
  enabled: true,
  apiKey: 'test-secret',
  fetchImpl: promptOnlyFetch.fetchImpl,
  sleep: async () => {},
});
assert.equal(first.analysis.findings.length, 1);
assert.equal(first.analysis.aiState.status, 'available');
assert.equal(first.analysis.interpretations.length, 1);
assert.equal(first.analysis.interpretations[0].evidenceIds[0], manifestEvidence.evidenceId);
assert.equal(promptOnlyFetch.calls[0].body.model, OPENROUTER_ANSWER_MODEL);
assert.deepEqual(promptOnlyFetch.calls[0].body.response_format, { type: 'json_object' });
assert.equal('tools' in promptOnlyFetch.calls[0].body, false);
assert.match(promptOnlyFetch.calls[0].body.messages[1].content, /Explain the postinstall change/);
const sentPayload = JSON.parse(promptOnlyFetch.calls[0].body.messages[1].content);
const sentEvidenceIds = new Set(sentPayload.retrievedEvidence.map((item) => item.evidenceId));
assert.equal(sentEvidenceIds.has(nonRetrievedEvidenceId), false);
assert.ok(sentPayload.findings.every((finding) => finding.evidenceIds.every((id) => sentEvidenceIds.has(id))));
assert.doesNotMatch(JSON.stringify(first.inference), /test-secret/);

const foundId = first.analysis.findings[0].findingId;
const validDraft = { ...baseDraft, findingIds: [foundId] };
const validFetch = fakeFetch(JSON.stringify(validDraft), { usage: { prompt_tokens: 10, completion_tokens: 20, cost: 0.0001 } });
const valid = await analyzeEvidenceWithOpenRouter(baseBundle, analysisOptions, 'Explain the postinstall change.', excerpts, {
  enabled: true, apiKey: 'test-secret', fetchImpl: validFetch.fetchImpl,
});
assert.equal(valid.analysis.aiState.status, 'available');
assert.equal(valid.inference.costUsd, 0.0001);
assert.equal(valid.inference.servedModel, OPENROUTER_ANSWER_MODEL);

const mixedAbstentionFetch = fakeFetch(JSON.stringify({ ...validDraft, abstentionReason: 'Provenance is unverified.' }));
const mixedAbstention = await analyzeEvidenceWithOpenRouter(baseBundle, analysisOptions, 'Explain the postinstall change.', excerpts, {
  enabled: true, apiKey: 'test-secret', fetchImpl: mixedAbstentionFetch.fetchImpl,
});
assert.equal(mixedAbstention.analysis.aiState.status, 'rejected');
assert.match(mixedAbstention.analysis.aiState.reason, /full-abstention reason/);

const badReference = { ...validDraft, evidenceIds: ['ev_000000000000000000000000'] };
const invalidFetch = fakeFetch(JSON.stringify(badReference));
const invalid = await analyzeEvidenceWithOpenRouter(baseBundle, analysisOptions, 'Explain the postinstall change.', excerpts, {
  enabled: true, apiKey: 'test-secret', fetchImpl: invalidFetch.fetchImpl,
});
assert.equal(invalid.analysis.aiState.status, 'rejected');
assert.equal(invalid.analysis.interpretations.length, 0);
assert.equal(invalid.analysis.findings.length, 1);

const unreferencedAlternative = { ...validDraft, alternatives: ['The command may have been injected after the build.'] };
const alternativeFetch = fakeFetch(JSON.stringify(unreferencedAlternative));
const rejectedAlternative = await analyzeEvidenceWithOpenRouter(baseBundle, analysisOptions, 'Explain the postinstall change.', excerpts, {
  enabled: true, apiKey: 'test-secret', fetchImpl: alternativeFetch.fetchImpl,
});
assert.equal(rejectedAlternative.analysis.aiState.status, 'rejected');
assert.equal(rejectedAlternative.analysis.aiState.reason, 'An alternative lacked a citation to retrieved evidence; the interpretation was rejected.');

const abstainDraft = {
  ...baseDraft,
  findingIds: [],
  evidenceIds: [],
  hypothesis: 'The requested provenance conclusion is not established.',
  reasoningSummary: 'No digest-bound provenance record was supplied.',
  abstentionReason: 'The bundle has no verified artifact-to-source binding.',
};
const provenanceBundle = structuredClone(baseBundle);
provenanceBundle.provenance.status = 'not_checked';
provenanceBundle.provenance.artifactBinding = 'not_checked';
const abstainFetch = fakeFetch(JSON.stringify(abstainDraft));
const abstained = await analyzeEvidenceWithOpenRouter(
  provenanceBundle, analysisOptions, 'Does the evidence cryptographically prove this exact source commit for the postinstall change?', excerpts,
  { enabled: true, apiKey: 'test-secret', fetchImpl: abstainFetch.fetchImpl },
);
assert.equal(abstained.analysis.aiState.status, 'abstained');
assert.equal(abstained.analysis.interpretations.length, 1);

const nonAbstainFetch = fakeFetch(JSON.stringify(validDraft));
const rejectedProvenance = await analyzeEvidenceWithOpenRouter(
  provenanceBundle, analysisOptions, 'Does the evidence cryptographically prove this exact source commit for the postinstall change?', excerpts,
  { enabled: true, apiKey: 'test-secret', fetchImpl: nonAbstainFetch.fetchImpl },
);
assert.equal(rejectedProvenance.analysis.aiState.status, 'rejected');
assert.equal(rejectedProvenance.analysis.aiState.reason.includes('no verified artifact-to-source binding'), true);
assert.equal(rejectedProvenance.analysis.interpretations.length, 0);

const behaviorQuestion = 'Explain the postinstall wheel-only hook difference and what it does at startup, including what the evidence does not prove about build provenance.';
const behaviorFetch = fakeFetch(JSON.stringify(validDraft));
const behaviorWithProvenanceCaveat = await analyzeEvidenceWithOpenRouter(
  baseBundle, analysisOptions, behaviorQuestion, excerpts,
  { enabled: true, apiKey: 'test-secret', fetchImpl: behaviorFetch.fetchImpl },
);
assert.equal(behaviorWithProvenanceCaveat.analysis.aiState.status, 'available');

const realCase = JSON.parse(execFileSync(process.execPath, [resolve(here, 'real-setuptools.mjs')], { encoding: 'utf8' }));
const realBundle = structuredClone(realCase.bundle);
realBundle.input.analysisOptions.enableAI = true;
const realOptions = { ...realBundle.input.analysisOptions, enableAI: true };
const realEvidenceIds = realCase.retrievalProbes[0].result.selected.map((item) => item.evidenceId);
const realFindings = realCase.analysis.findings.map((item) => item.findingId);
const realDraft = {
  ...baseDraft,
  findingIds: realFindings,
  evidenceIds: realEvidenceIds,
  hypothesis: 'The wheel-only hook could have been generated during wheel build, but the available records do not establish that pathway.',
  reasoningSummary: `The inventory marks the file as wheel-only [${realEvidenceIds[0]}]. The source contains a matching template [${realEvidenceIds[1]}].`,
};
const definiteGeneration = fakeFetch(JSON.stringify({
  ...realDraft,
  hypothesis: 'The wheel-only hook was generated during wheel build.',
  reasoningSummary: `The source template confirms it was created during packaging [${realEvidenceIds[1]}].`,
}));
const rejectedGeneration = await analyzeEvidenceWithOpenRouter(realBundle, realOptions,
  'Explain the wheel-only hook difference and its limits.', realCase.excerpts,
  { enabled: true, apiKey: 'test-secret', fetchImpl: definiteGeneration.fetchImpl, resolvedContent: realCase.excerpts });
assert.equal(rejectedGeneration.analysis.aiState.status, 'rejected');
assert.match(rejectedGeneration.analysis.aiState.reason, /unverified generated\/build origin as fact/);

const hedgedGeneration = fakeFetch(JSON.stringify(realDraft));
const acceptedGeneration = await analyzeEvidenceWithOpenRouter(realBundle, realOptions,
  'Explain the wheel-only hook difference and its limits.', realCase.excerpts,
  { enabled: true, apiKey: 'test-secret', fetchImpl: hedgedGeneration.fetchImpl, resolvedContent: realCase.excerpts });
assert.equal(acceptedGeneration.analysis.aiState.status, 'available');

const retryCalls = [];
const retryFetch = async (url, init) => {
  retryCalls.push({ url, init });
  if (retryCalls.length === 1) return new Response('rate limited', { status: 429, headers: { 'retry-after': '0' } });
  return new Response(JSON.stringify({
    id: 'gen-retry-1', model: OPENROUTER_ANSWER_MODEL,
    choices: [{ message: { content: JSON.stringify(validDraft) }, finish_reason: 'stop' }],
  }), { status: 200 });
};
const retried = await analyzeEvidenceWithOpenRouter(baseBundle, analysisOptions, 'Explain the postinstall change.', excerpts, {
  enabled: true,
  apiKey: 'test-secret',
  attempts: 2,
  fetchImpl: retryFetch,
  sleep: async () => {},
});
assert.equal(retried.analysis.aiState.status, 'available');
assert.equal(retried.inference.attempts, 2);
assert.equal(retryCalls.length, 2);

process.stdout.write(JSON.stringify({
  analyses: [disabled.analysis, first.analysis, valid.analysis, mixedAbstention.analysis, invalid.analysis, rejectedAlternative.analysis, abstained.analysis, rejectedProvenance.analysis, behaviorWithProvenanceCaveat.analysis, rejectedGeneration.analysis, acceptedGeneration.analysis, retried.analysis],
  disabled: disabled.analysis.aiState,
  accepted: valid.analysis.aiState,
  mixedAbstention: mixedAbstention.analysis.aiState,
  unsupportedGeneration: rejectedGeneration.analysis.aiState,
  invalidReference: invalid.analysis.aiState,
  uncitedAlternative: rejectedAlternative.analysis.aiState,
  explicitAbstention: abstained.analysis.aiState,
  provenanceGuard: rejectedProvenance.analysis.aiState,
  retryAttempts: retried.inference.attempts,
}));
