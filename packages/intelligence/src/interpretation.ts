import type {
  AIInterpretation,
  EvidenceBundle,
  EvidenceId,
  Finding,
} from '@heurisko/contracts';
import type { RetrievedEvidence } from './retrieval.js';
import { validateRetrievedCitations } from './retrieval.js';

export interface InterpretationDraft {
  findingIds: string[];
  evidenceIds: EvidenceId[];
  hypothesis: string;
  reasoningSummary: string;
  alternatives: string[];
  missingEvidence: string[];
  nextActions: string[];
  abstentionReason: string;
}

export interface InterpretationMetadata {
  interpretationId: string;
  modelId: string;
  runtimeId: string;
  promptVersion: string;
}

export type InterpretationRejectionCode =
  | 'invalid_shape'
  | 'invalid_metadata'
  | 'duplicate_reference'
  | 'unknown_finding_id'
  | 'unknown_evidence_id'
  | 'evidence_not_retrieved'
  | 'finding_evidence_mismatch'
  | 'citation_required';

export type InterpretationValidation =
  | { status: 'accepted'; interpretation: AIInterpretation }
  | { status: 'rejected'; code: InterpretationRejectionCode; reason: string };

const DRAFT_KEYS = [
  'findingIds',
  'evidenceIds',
  'hypothesis',
  'reasoningSummary',
  'alternatives',
  'missingEvidence',
  'nextActions',
  'abstentionReason',
].sort();

const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0);

const isEvidenceIdArray = (value: unknown): value is EvidenceId[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string' && /^ev_[a-f0-9]{24}$/.test(item));

const reject = (code: InterpretationRejectionCode, reason: string): InterpretationValidation => ({
  status: 'rejected',
  code,
  reason,
});

/**
 * Validate a model-produced draft against known findings and retrieved evidence,
 * then stamp runtime metadata supplied by the caller. `validation: passed` means
 * only shape/reference checks passed; it is not a factual-entailment verdict.
 */
export function validateInterpretationDraft(
  raw: unknown,
  bundle: Readonly<EvidenceBundle>,
  retrieved: readonly RetrievedEvidence[],
  findings: readonly Finding[],
  metadata: InterpretationMetadata,
): InterpretationValidation {
  if (!isObject(raw) || JSON.stringify(Object.keys(raw).sort()) !== JSON.stringify(DRAFT_KEYS)) {
    return reject('invalid_shape', 'Draft must contain exactly the supported interpretation fields.');
  }
  if (!isStringArray(raw.findingIds)
    || !isEvidenceIdArray(raw.evidenceIds)
    || typeof raw.hypothesis !== 'string' || raw.hypothesis.trim().length === 0
    || typeof raw.reasoningSummary !== 'string' || raw.reasoningSummary.trim().length === 0
    || !isStringArray(raw.alternatives)
    || !isStringArray(raw.missingEvidence)
    || !isStringArray(raw.nextActions)
    || typeof raw.abstentionReason !== 'string') {
    return reject('invalid_shape', 'One or more draft fields have an invalid type or empty required text.');
  }
  if (typeof metadata.interpretationId !== 'string'
    || typeof metadata.modelId !== 'string'
    || typeof metadata.runtimeId !== 'string'
    || typeof metadata.promptVersion !== 'string'
    || !/^ai_[a-z0-9_-]+$/.test(metadata.interpretationId)
    || !metadata.modelId.trim() || !metadata.runtimeId.trim() || !metadata.promptVersion.trim()) {
    return reject('invalid_metadata', 'Interpretation identity and runtime metadata must be supplied by the caller.');
  }

  if (new Set(raw.findingIds).size !== raw.findingIds.length
    || new Set(raw.evidenceIds).size !== raw.evidenceIds.length) {
    return reject('duplicate_reference', 'Duplicate finding or evidence IDs are not accepted.');
  }

  const findingsById = new Map(findings.map((finding) => [finding.findingId, finding]));
  if (raw.findingIds.some((id) => !findingsById.has(id))) {
    return reject('unknown_finding_id', 'Draft cites a finding that is absent from the deterministic analysis.');
  }

  const citationCheck = validateRetrievedCitations(bundle, retrieved, raw.evidenceIds);
  if (citationCheck.unknownEvidenceIds.length > 0) {
    return reject('unknown_evidence_id', 'Draft cites an evidence ID absent from the supplied bundle.');
  }
  if (citationCheck.evidenceNotRetrieved.length > 0) {
    return reject('evidence_not_retrieved', 'Draft cites evidence that was not included in the model context.');
  }

  if (raw.evidenceIds.length > 0) {
    const evidenceIds = new Set(raw.evidenceIds);
    for (const findingId of raw.findingIds) {
      const finding = findingsById.get(findingId)!;
      if (!finding.evidenceIds.some((id) => evidenceIds.has(id))) {
        return reject('finding_evidence_mismatch', `Citations do not include evidence attached to finding ${findingId}.`);
      }
    }
  } else if (!raw.abstentionReason.trim()) {
    return reject('citation_required', 'A non-abstaining interpretation must cite at least one retrieved evidence ID.');
  }

  const interpretation: AIInterpretation = {
    interpretationId: metadata.interpretationId,
    findingIds: raw.findingIds,
    evidenceIds: raw.evidenceIds,
    hypothesis: raw.hypothesis,
    reasoningSummary: raw.reasoningSummary,
    alternatives: raw.alternatives,
    missingEvidence: raw.missingEvidence,
    nextActions: raw.nextActions,
    abstentionReason: raw.abstentionReason,
    modelId: metadata.modelId,
    runtimeId: metadata.runtimeId,
    promptVersion: metadata.promptVersion,
    validation: 'passed',
  };
  return { status: 'accepted', interpretation };
}
