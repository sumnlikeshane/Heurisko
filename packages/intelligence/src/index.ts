import type {
  AIState,
  AnalysisOptions,
  AnalysisResults,
  EvidenceId,
  EvidenceBundle,
  Finding,
  StageRecord,
} from '@heurisko/contracts';

const INTELLIGENCE_LIMITATIONS = [
  'No evidence is retrieved or chunked by the intelligence component; evidence IDs and locations remain owned by the supplied bundle.',
  'Caller-resolved text supplied for deterministic content checks is not independently read or hash-verified by this component.',
  'No package acquisition, provenance verification, cryptographic trust decision, or product model inference is performed by this component.',
] as const;

export interface ResolvedEvidenceContent {
  evidenceId: EvidenceId;
  contentRef: string;
  text: string;
}

const LIFECYCLE_SCRIPTS = new Set(['preinstall', 'install', 'postinstall', 'prepare']);
const ENTRYPOINT_KEYS = new Set(['main', 'module', 'types', 'typings', 'exports', 'bin', 'browser']);

const changed = (bundle: Readonly<EvidenceBundle>) => {
  const knownEvidence = new Set(bundle.evidence.map(({ evidenceId }) => evidenceId));
  return bundle.changes
    .filter((change) => change.status !== 'identical' && change.rawEquality !== 'equal')
    .map((change) => ({
      change,
      evidence: change.evidenceIds
        .filter((id): id is EvidenceId => knownEvidence.has(id))
        .map((id) => bundle.evidence.find((item) => item.evidenceId === id)!)
        .filter(Boolean),
    }))
    .filter(({ evidence }) => evidence.length > 0);
};

const findingId = (
  ruleId: string,
  changeId: string,
  evidenceIds: EvidenceId[],
): string => {
  const stableRule = ruleId.replace(/[^a-z0-9_-]/g, '_');
  const evidenceSuffix = [...evidenceIds].sort()[0]?.slice(3, 11) ?? 'no_evidence';
  return `find_${stableRule}_${changeId}_${evidenceSuffix}`;
};

const makeFinding = (
  changeId: string,
  evidenceIds: EvidenceId[],
  fields: Omit<Finding, 'findingId' | 'evidenceIds' | 'ruleVersion'> & { ruleId: string },
): Finding => {
  const references = [...new Set(evidenceIds)].sort();
  return {
    findingId: findingId(fields.ruleId, changeId, references),
    ruleVersion: '0.1.0',
    evidenceIds: references,
    ...fields,
  };
};

const findingLimitations = (bundle: Readonly<EvidenceBundle>, limitations: string[]): string[] =>
  bundle.fixtureKind === 'synthetic_contract'
    ? [...limitations, 'This finding is derived from a synthetic contract fixture, not a real package observation.']
    : limitations;

function collectDeterministicFindings(
  bundle: Readonly<EvidenceBundle>,
  resolvedContent: readonly ResolvedEvidenceContent[],
): { findings: Finding[]; limitations: string[] } {
  const findings: Finding[] = [];
  const limitations: string[] = [];
  const evidenceIds = new Set(bundle.evidence.map(({ evidenceId }) => evidenceId));
  const recordsById = new Map(bundle.evidence.map((record) => [record.evidenceId, record]));
  const contentById = new Map<EvidenceId, string>();
  const seenContent = new Set<EvidenceId>();
  for (const content of resolvedContent) {
    const record = recordsById.get(content.evidenceId);
    if (!record || seenContent.has(content.evidenceId)) continue;
    seenContent.add(content.evidenceId);
    if (record.contentState !== 'retained' || !record.contentRef || content.contentRef !== record.contentRef) continue;
    contentById.set(content.evidenceId, content.text);
  }
  if (resolvedContent.length > contentById.size) {
    limitations.push('Some supplied text was not used because its evidence ID or retained content reference was absent, duplicated, or mismatched.');
  }
  const unreferencedChanges = bundle.changes.filter((change) =>
    change.status !== 'identical' && change.evidenceIds.length === 0
  );
  if (unreferencedChanges.length > 0) {
    limitations.push(`${unreferencedChanges.length} changed file record(s) have no evidence IDs; no finding was generated for those records.`);
  }
  if (bundle.changes.some((change) => change.status !== 'identical' && change.rawEquality === 'equal')) {
    limitations.push('One or more change records are marked changed while reporting raw equality; those contradictory records were not interpreted as findings.');
  }

  for (const { change, evidence } of changed(bundle)) {
    const manifestDeltas = evidence.filter((item) => item.kind === 'manifest_delta' && item.locator.metadataKey);
    let classifiedManifest = false;

    for (const delta of manifestDeltas) {
      const key = delta.locator.metadataKey!;
      if (!key.startsWith('scripts.')) continue;

      classifiedManifest = true;
      const scriptName = key.slice('scripts.'.length);
      const isLifecycle = LIFECYCLE_SCRIPTS.has(scriptName);
      const isOnlyTestOrDev = ['test', 'pretest', 'posttest', 'lint', 'format'].includes(scriptName);
      const hasRetainedValue = delta.contentState === 'retained' && delta.contentRef !== undefined;
      const direction = change.status === 'added'
        ? 'is reported as added to the artifact'
        : change.status === 'removed'
          ? 'is reported as removed from the artifact'
          : 'is reported as changed';
      const limitations = [
        'The evidence identifies the changed manifest key but does not retain the old and new command values.',
      ];

      findings.push(makeFinding(change.changeId, [delta.evidenceId], {
        ruleId: isLifecycle ? 'heurisko.manifest.lifecycle-script-change' : 'heurisko.manifest.script-change',
        title: isLifecycle ? 'Package lifecycle script entry changed' : 'Package script entry changed',
        observation: `Manifest key ${key} ${direction}.`,
        whyItMatters: isLifecycle
          ? 'Lifecycle entries can affect package-manager installation behavior; inspect the exact command and its source before deciding what it does. This observation does not establish malicious intent.'
          : isOnlyTestOrDev
            ? 'This script is an explicit package command and may be run by maintainers or CI; the key change alone does not establish what it executes.'
            : 'A package script entry changed; inspect the command and its callers before deciding what behavior it enables.',
        severity: isLifecycle && change.status !== 'removed' ? 'medium' : 'informational',
        reviewPriority: isLifecycle && change.status !== 'removed' ? 'medium' : 'low',
        evidenceConfidence: hasRetainedValue ? 'high' : 'limited',
        explanationStrength: 'exact',
        limitations: findingLimitations(bundle, limitations),
        nextActions: hasRetainedValue
          ? ['Review the retained old and new script values and their referenced files; do not execute them on the host.']
          : ['Retrieve or inspect the exact old and new manifest values in the evidence collector; do not install or execute the package.'],
      }));
    }

    for (const delta of manifestDeltas) {
      const key = delta.locator.metadataKey!;
      if (!ENTRYPOINT_KEYS.has(key) && !['exports.', 'bin.', 'browser.'].some((prefix) => key.startsWith(prefix))) continue;

      classifiedManifest = true;
      findings.push(makeFinding(change.changeId, [delta.evidenceId], {
        ruleId: 'heurisko.manifest.entrypoint-change',
        title: 'Package entrypoint metadata changed',
        observation: `Manifest key ${key} is reported as changed.`,
        whyItMatters: 'Entrypoint changes affect which files consumers load or execute; the key-level delta does not prove the selected file is unsafe.',
        severity: 'low',
        reviewPriority: 'low',
        evidenceConfidence: delta.contentState === 'retained' ? 'high' : 'limited',
        explanationStrength: 'exact',
        limitations: findingLimitations(bundle, ['Old and new manifest values are not available in this evidence record.']),
        nextActions: ['Compare the exact old and new values and confirm the referenced artifact path exists.'],
      }));
    }

    if (classifiedManifest) continue;

    if (change.status === 'generated_candidate') {
      const buildEvidence = evidence.filter((item) => item.kind === 'build_record');
      // Keep the raw artifact/source references beside the build record so a
      // generated-file explanation never hides the difference it is meant to explain.
      const ids = evidence.map((item) => item.evidenceId);
      const reproduced = change.explanationStrength === 'reproduced'
        && buildEvidence.some((item) => item.verification === 'verified');
      findings.push(makeFinding(change.changeId, ids, {
        ruleId: reproduced ? 'heurisko.change.generated-candidate-reproduced' : 'heurisko.change.generated-candidate-unverified',
        title: reproduced ? 'Generated transformation has reproduced build evidence' : 'Generated-output candidate remains unverified',
        observation: `${change.artifactPath ?? change.sourcePath ?? 'A file change'} is labeled a generated candidate by the evidence bundle.`,
        whyItMatters: reproduced
          ? 'The bundle records a verified build reproduction for this transformation; that explains correspondence but does not establish that the source or output is benign.'
          : 'A build-related clue may explain a difference, but without independent reproduction the relationship remains a hypothesis.',
        severity: 'informational',
        reviewPriority: 'low',
        evidenceConfidence: reproduced ? 'high' : buildEvidence.length > 0 ? 'limited' : 'unresolved',
        explanationStrength: reproduced ? 'reproduced' : change.explanationStrength === 'hypothesis' ? 'hypothesis' : 'not_assessed',
        limitations: findingLimitations(bundle, reproduced
          ? ['Reproduced output is correspondence evidence, not a safety or source-benignness result.']
          : ['No independent rebuild result confirms this transformation. A generated-looking path or build setting is not proof.']),
        nextActions: reproduced
          ? ['Review the preserved raw difference and evaluate the source behavior separately.']
          : ['Keep the raw difference visible and compare it with a controlled, policy-approved rebuild when available.'],
      }));

      const startupHooks = evidence.filter((item) => {
        if (item.kind !== 'artifact_member' || item.side !== 'artifact' || !item.locator.path?.endsWith('.pth')) return false;
        const text = contentById.get(item.evidenceId);
        return text !== undefined && /(?:^|[;\n])\s*(?:import\s+[A-Za-z_]|from\s+[A-Za-z_][\w.]*\s+import\b|__import__\s*\()/m.test(text);
      });
      for (const hook of startupHooks) {
        const hookText = contentById.get(hook.evidenceId)!;
        const linkedSourceEvidence = evidence.filter((item) =>
          item.kind === 'source_member' && item.side === 'source' && contentById.has(item.evidenceId)
        );
        const sourceExplainsHook = linkedSourceEvidence.some((item) =>
          contentById.get(item.evidenceId)!.includes('__import__')
          && (contentById.get(item.evidenceId)!.includes('add_shim') || contentById.get(item.evidenceId)!.includes('sys.meta_path'))
        );
        const hookIds = [hook.evidenceId, ...linkedSourceEvidence.map((item) => item.evidenceId)];
        findings.push(makeFinding(change.changeId, hookIds, {
          ruleId: 'heurisko.artifact.python-startup-hook',
          title: 'Python startup hook contains executable import code',
          observation: `${hook.locator.path} contains import-time code${hookText.includes('__import__') ? ' using __import__' : ''}.`,
          whyItMatters: sourceExplainsHook
            ? 'The retained source excerpt contains the same guarded import and shim call. This is behavior-bearing startup code that merits review; the evidence describes compatibility behavior and does not establish malicious intent or exact build provenance.'
            : 'Import-bearing .pth content can affect interpreter startup behavior. Inspect its exact condition and source correspondence; this static observation does not establish malicious intent.',
          severity: 'low',
          reviewPriority: 'medium',
          evidenceConfidence: sourceExplainsHook ? 'high' : 'limited',
          explanationStrength: sourceExplainsHook ? 'supported_unreproduced' : 'hypothesis',
          limitations: findingLimitations(bundle, [
            'Text was supplied by the caller and was not independently hash-verified by the intelligence component.',
            'No package or startup hook was executed, and no independent rebuild verified how this file entered the wheel.',
            ...(sourceExplainsHook ? ['Matching source text explains the behavior but does not verify the wheel-to-commit provenance binding.'] : []),
          ]),
          nextActions: ['Review the exact startup condition and corresponding immutable source; keep the raw wheel-only difference visible.'],
        }));
      }
      continue;
    }

    const ids = evidence.map((item) => item.evidenceId);
    const path = change.artifactPath ?? change.sourcePath ?? 'Unspecified path';
    const omission = bundle.coverage.omissions.find((item) =>
      item.path === change.artifactPath && item.evidenceIds.some((id) => ids.includes(id))
    );
    findings.push(makeFinding(change.changeId, ids, {
      ruleId: 'heurisko.change.unresolved-difference',
      title: omission ? 'Changed artifact member was not fully analyzed' : 'File change remains unexplained',
      observation: `${path} is ${change.status === 'unresolved' ? 'unresolved' : `reported as ${change.status}`}; raw equality is ${change.rawEquality}.`,
      whyItMatters: omission
        ? 'The artifact member has an explicit coverage omission, so its behavior and correspondence remain unknown.'
        : 'The bundle reports a difference without a supported transformation explanation; review is needed to resolve its significance.',
      severity: 'undetermined',
      reviewPriority: 'low',
      evidenceConfidence: omission || change.rawEquality === 'unknown' ? 'unresolved' : 'limited',
      explanationStrength: change.explanationStrength,
      limitations: findingLimitations(bundle, [
        ...(omission ? [omission.reason] : []),
        'This rule reports the evidence bundle state; it does not infer executable behavior or malicious intent from a filename.',
      ]),
      nextActions: ['Inspect the cited artifact/source evidence and retain any unsupported bytes as unresolved.'],
    }));
  }
  // A malformed reference must not be converted into an uncited finding.
  if (bundle.changes.some((change) => change.evidenceIds.some((id) => !evidenceIds.has(id)))) {
    limitations.push('One or more change records reference evidence IDs absent from this bundle; those references were not used to generate findings.');
  }
  return { findings, limitations };
}

/**
 * Consumes Shane's immutable evidence bundle and returns the shared report shape.
 * M1 deterministic rules only describe evidence-backed changes. The component
 * never acquires artifacts, evaluates trust, or infers malicious intent.
 */
export async function analyzeEvidence(
  bundle: Readonly<EvidenceBundle>,
  options: AnalysisOptions,
  resolvedContent: readonly ResolvedEvidenceContent[] = [],
): Promise<AnalysisResults> {
  const aiState: AIState = options.enableAI
    ? {
        status: 'unavailable',
        reason: 'The product model adapter is not implemented.',
        validation: 'not_run',
      }
    : {
        status: 'disabled',
        validation: 'not_run',
      };

  const stages: StageRecord[] = [
    {
      stage: 'heuristics',
      status: 'complete',
      errors: [],
    },
    {
      stage: 'ai',
      status: options.enableAI ? 'incomplete' : 'skipped',
      errors: options.enableAI
        ? [
            {
              stage: 'ai',
              code: 'AI_ADAPTER_NOT_IMPLEMENTED',
              message: 'AI was requested, but no product model adapter is connected.',
              affectedScope: 'AI interpretations',
              retryable: false,
            },
          ]
        : [],
    },
  ];

  const deterministic = collectDeterministicFindings(bundle, resolvedContent);
  return {
    schemaVersion: '0.1.0',
    findings: deterministic.findings,
    aiState,
    interpretations: [],
    stages,
    limitations: [...bundle.limitations, ...INTELLIGENCE_LIMITATIONS, ...deterministic.limitations],
  };
}

export type { AnalyzeEvidence } from '@heurisko/contracts';
export { retrieveEvidence, validateRetrievedCitations } from './retrieval.js';
export type { CitationCheck, EvidenceExcerpt, RetrievedEvidence, RetrievalOptions, RetrievalResult } from './retrieval.js';
export { validateInterpretationDraft } from './interpretation.js';
export type { InterpretationDraft, InterpretationMetadata, InterpretationRejectionCode, InterpretationValidation } from './interpretation.js';
export { INTERPRETATION_PROMPT_VERSION, INTERPRETATION_SYSTEM_INSTRUCTION, packageInterpretationPrompt } from './prompt.js';
export type { InterpretationPromptOptions, InterpretationPromptPackage } from './prompt.js';
export { analyzeEvidenceWithOpenRouter, OPENROUTER_ANSWER_MODEL } from './openrouter.js';
export type { OpenRouterAnalysisResult, OpenRouterInferenceMetadata, OpenRouterInferenceOptions } from './openrouter.js';
