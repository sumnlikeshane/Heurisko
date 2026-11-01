import { retrieveEvidence } from '../dist/index.js';
import { analyzeEvidence, validateInterpretationDraft } from '../dist/index.js';
import { createSyntheticEvidence } from './synthetic-evidence.mjs';

const { bundle, manifest, artifact, source, excerpts } = createSyntheticEvidence();
const analysis = await analyzeEvidence(bundle, { ...bundle.input.analysisOptions, enableAI: false });
const finding = analysis.findings[0];
const retrieved = retrieveEvidence(bundle, 'postinstall install lifecycle command', excerpts, { maxResults: 1 }).selected;
const metadata = {
  interpretationId: 'ai_synthetic_validation_case',
  modelId: 'synthetic-fixture-test',
  runtimeId: 'test-harness',
  promptVersion: 'synthetic-test-v0',
};

const supported = {
  findingIds: [finding.findingId],
  evidenceIds: [manifest.evidenceId],
  hypothesis: 'The manifest records a changed postinstall entry. The supplied excerpt does not establish the command behavior or intent.',
  reasoningSummary: 'The cited evidence is the package manifest delta for scripts.postinstall.',
  alternatives: ['The change may have a benign or consequential purpose; the supplied evidence does not distinguish them.'],
  missingEvidence: ['The prior value and the behavior of any referenced file are not established by this excerpt.'],
  nextActions: ['Review the complete old and new manifest values without executing the package.'],
  abstentionReason: '',
};

const unsupportedClaim = {
  ...supported,
  hypothesis: 'The postinstall hook steals credentials and sends them to a remote server.',
  reasoningSummary: 'The hook changed.',
};

const abstention = {
  findingIds: [finding.findingId],
  evidenceIds: [],
  hypothesis: 'The effect of the changed hook cannot be determined from the supplied evidence.',
  reasoningSummary: 'The prior command value and related file behavior are not available.',
  alternatives: [],
  missingEvidence: ['The prior command value and relevant file contents.'],
  nextActions: ['Obtain those records before explaining the change.'],
  abstentionReason: 'There is not enough retained evidence to explain what the hook does.',
};

const validate = (draft, selected = retrieved, context = metadata) =>
  validateInterpretationDraft(draft, bundle, selected, analysis.findings, context);

const extraField = { ...supported, tools: ['not an allowed field'] };
const unknownEvidence = { ...supported, evidenceIds: ['ev_999999999999999999999999'] };
const unselectedEvidence = { ...supported, evidenceIds: [source.evidenceId] };
const unknownFinding = { ...supported, findingIds: ['find_not_in_analysis'] };
const uncitedNonAbstention = { ...supported, evidenceIds: [], abstentionReason: '' };
const mismatchedFindingEvidence = { ...supported, evidenceIds: [artifact.evidenceId] };

const correctedExcerpts = excerpts.map((excerpt) => excerpt.evidenceId === artifact.evidenceId
  ? { ...excerpt, contentRef: artifact.contentRef }
  : excerpt);
const retrievalWithOtherEvidence = retrieveEvidence(
  bundle,
  'package exports greeting synthetic postinstall',
  correctedExcerpts,
  { maxResults: 5 },
).selected;

process.stdout.write(JSON.stringify({
  fixtureKind: bundle.fixtureKind,
  bundle,
  acceptedSupported: validate(supported),
  acceptedUnsupportedClaim: validate(unsupportedClaim),
  acceptedAbstention: validate(abstention),
  rejectedExtraField: validate(extraField),
  rejectedUnknownEvidence: validate(unknownEvidence),
  rejectedUnselectedEvidence: validate(unselectedEvidence),
  rejectedUnknownFinding: validate(unknownFinding),
  rejectedUncitedNonAbstention: validate(uncitedNonAbstention),
  rejectedMismatchedFindingEvidence: validate(mismatchedFindingEvidence, retrievalWithOtherEvidence),
  rejectedMissingMetadata: validate(supported, retrieved, { ...metadata, modelId: '' }),
  retrievedEvidenceIds: retrieved.map((item) => item.evidenceId),
}));
