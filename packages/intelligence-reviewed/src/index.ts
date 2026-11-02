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

interface ManifestDeltaV1 {
  version: 'heurisko-manifest-delta-v1';
  pointer: string;
  source: { value: unknown } | null;
  artifact: { value: unknown } | null;
}

const resolveManifestDelta = (value: string | undefined): ManifestDeltaV1 | undefined => {
  if (!value || value.length > 16_384) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return undefined;
    const delta = parsed as Partial<ManifestDeltaV1>;
    if (delta.version !== 'heurisko-manifest-delta-v1' || typeof delta.pointer !== 'string') return undefined;
    const sideHasValue = (side: unknown): side is { value: unknown } | null =>
      side === null || (typeof side === 'object' && side !== null && 'value' in side);
    if (!sideHasValue(delta.source) || !sideHasValue(delta.artifact)) return undefined;
    return delta as ManifestDeltaV1;
  } catch {
    return undefined;
  }
};

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
    ruleVersion: '0.2.0-p2-static-v1',
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
    // Interpret one outermost entrypoint value per changed root. Parent/leaf
    // records remain retained, but cannot inflate the event count.
    const pointer = (key: string): string => key.startsWith('/') ? key : '/' + key.split('.').join('/');
    const selected = manifestDeltas.filter(delta => {
      const path = pointer(delta.locator.metadataKey!);
      const parts = path.slice(1).split('/').map(s => s.replace(/~1/g, '/').replace(/~0/g, '~'));
      if (parts[0] === 'scripts') return parts.length === 2;
      if (!ENTRYPOINT_KEYS.has(parts[0]!)) return false;
      return !manifestDeltas.some(parent => {
        const other = pointer(parent.locator.metadataKey!);
        return other !== path && path.startsWith(other + '/');
      });
    });
    for (const delta of selected) {
      const key = delta.locator.metadataKey!;
      const path = pointer(key);
      const scriptName = path.startsWith('/scripts/') ? path.slice(9).replace(/~1/g, '/').replace(/~0/g, '~') : undefined;
      const isScript = scriptName !== undefined;
      const isLifecycle = isScript && LIFECYCLE_SCRIPTS.has(scriptName);
      const value = resolveManifestDelta(contentById.get(delta.evidenceId));
      const commandsSupported = !isScript || !!value && [value.source, value.artifact].every(side => side === null || typeof side.value === 'string' && side.value.trim().length > 0);
      const resolved = !!value && commandsSupported;
      const removed = resolved && value.artifact === null;
      const direction = !resolved ? 'has a producer-recorded difference; exact old/new values and direction remain unresolved'
        : value.source === null ? 'is added to the artifact'
        : removed ? 'is removed from the artifact' : 'is changed from source to artifact';
      const summarize = (side: {value: unknown} | null): string => {
        if (side === null) return 'absent (validated in the retained manifest)';
        const text = JSON.stringify(side.value).replace(/[\u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
        return text.length > 240 ? text.slice(0, 240) + '… [summary truncated; inspect full cited value]' : text;
      };
      const reasons = [
        'Only retained metadata is compared; no referenced file, command, resolver, build or package was executed.',
        ...(resolved ? ['Direction and values are bound to the original manifest members and exact value byte spans.'] : ['Consumer content is missing, unsupported or unresolved; this does not assert that producer values are absent.']),
        ...(isScript && !commandsSupported ? ['Empty or nonstring script values are unsupported as commands; no lifecycle action is inferred.'] : []),
        ...(!isScript ? ['Entrypoint objects/arrays/conditions are inert metadata; Node resolution, target-member presence and executable behavior are not established.'] : []),
      ];
      if (!commandsSupported) limitations.push(`Unsupported script command at ${path}; exact command interpretation remains incomplete.`);
      findings.push(makeFinding(change.changeId, [delta.evidenceId], {
        ruleId: isScript ? isLifecycle ? 'heurisko.manifest.lifecycle-script-change' : 'heurisko.manifest.script-change' : 'heurisko.manifest.entrypoint-change',
        title: isScript ? isLifecycle ? 'Package lifecycle script entry changed' : 'Package script entry changed' : 'Package entrypoint metadata changed',
        observation: `Manifest pointer ${path} ${direction}.${resolved ? ` Source: ${summarize(value.source)}; artifact: ${summarize(value.artifact)}.` : ''}`,
        whyItMatters: isLifecycle
          ? scriptName === 'prepare' ? 'prepare has development, packing and some installation contexts distinct from install hooks; command metadata alone establishes no behavior or intent.'
            : removed ? 'A removed lifecycle entry is not an added installation action; review any other retained changes independently.'
              : 'Install lifecycle entries can affect package-manager installation behavior; inspect the retained command without executing it. No intent is inferred.'
          : isScript ? 'This is explicit command metadata; a script change alone does not establish automatic execution or intent.'
            : 'Entrypoint metadata can change consumer selection; this static observation does not establish resolution, execution, safety or intent.',
        severity: !resolved ? 'undetermined' : isScript ? isLifecycle && !removed ? 'medium' : 'informational' : 'low',
        reviewPriority: resolved && isLifecycle && !removed ? 'medium' : 'low',
        evidenceConfidence: resolved ? 'high' : 'limited',
        explanationStrength: resolved ? 'exact' : 'unexplained',
        limitations: findingLimitations(bundle, reasons),
        nextActions: ['Inspect both exact cited value spans and the retained raw file difference; do not install or execute the package.'],
      }));
    }

    // Every raw difference stays visible even when selected manifest fields are
    // interpreted. Recognized fields never suppress unrelated/residual edits.
    for (const note of evidence.filter(item => item.kind === 'analysis_note' && item.observationMethod === 'heurisko-static-relationship-v1')) {
      const text = contentById.get(note.evidenceId);if (!text) continue;
      let relation: {rule?: string;matches?: unknown[];totalSources?: number};
      try {relation=JSON.parse(text);}catch {continue;}
      const wording = relation.rule === 'crlf-only'
        ? 'The retained source and artifact text differ only in CRLF versus LF byte sequences.'
        : relation.rule === 'strict-json-formatting'
          ? 'The retained source and artifact are strict JSON objects with equal parsed values in the same parsed property order; formatting differs.'
          : relation.rule === 'sourcemap-retained-source'
            ? `A final local source-map reference resolves to a retained map; ${relation.matches?.length} of ${relation.totalSources} embedded source entries exactly match retained source-member bytes.` : undefined;
      if (!wording) continue;
      findings.push(makeFinding(change.changeId, [note.evidenceId, ...evidence.filter(e=>e.kind==='source_member'||e.kind==='artifact_member').map(e=>e.evidenceId)], {
        ruleId: 'heurisko.change.static-relationship', title: 'Bounded static relationship observed', observation: wording,
        whyItMatters: 'This mechanically checked relationship can guide review; it does not prove emitted behavior, semantic equivalence, generation, provenance, reproduction or safety.',
        severity: 'informational', reviewPriority: 'low', evidenceConfidence: 'high', explanationStrength: 'supported_unreproduced',
        limitations: findingLimitations(bundle, ['All original member bytes and raw enclosing changed spans remain residual evidence.', 'Only the named byte/value/source-text relationship is checked. Source-map mappings, build configuration, source selection and remaining bytes are unverified.']),
        nextActions: ['Inspect the relationship record and all raw residuals, including unmatched source-map entries and emitted bytes.'],
      }));
    }
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
  for (const [index,candidate] of [...bundle.sourceCandidates].sort((a,b)=>{const x=JSON.stringify([a.repositoryUrl,a.commit,a.subdirectory]),y=JSON.stringify([b.repositoryUrl,b.commit,b.subdirectory]);return x<y?-1:x>y?1:0;}).entries()) {
    const ids=candidate.evidenceIds.filter(id=>evidenceIds.has(id));if (!ids.length) continue;
    findings.push(makeFinding(`source_${index}_${candidate.commit ?? 'unpinned'}`, ids, {
      ruleId:'heurisko.source.candidate-scope',title:'Source candidate and comparison scope',
      observation:`Candidate ${JSON.stringify(candidate.repositoryUrl)} at ${candidate.commit ?? 'unresolved commit'}, subtree ${JSON.stringify(candidate.subdirectory ?? '(not recorded)')}: ${candidate.sourceSnapshotSha256 ? `acquired archive ${candidate.sourceSnapshotSha256}; build context ${candidate.buildContextSha256 ?? 'not recorded'}` : 'archive digest not recorded; inspect retained acquisition evidence'}. Association: ${candidate.association}. Conflicts: ${JSON.stringify([...candidate.conflicts].sort())}.`,
      whyItMatters:'Comparison covers the recorded selected source scope. Metadata agreement and byte comparison do not authenticate source association or remove conflicts; missing optional metadata does not establish non-acquisition.',
      severity:'informational',reviewPriority:'low',evidenceConfidence:'limited',explanationStrength:'not_assessed',
      limitations:findingLimitations(bundle,['Claims and captures are immutable observations, not cryptographic Git/tag/provenance verification. Byte inventory scope and explanation coverage are separate.']),
      nextActions:['Inspect every candidate claim/capture and the selected package subtree; retain conflicts and omitted broader context.'],
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
  if (deterministic.limitations.some(text => text.startsWith('Unsupported script command'))) {
    stages[0]!.status = 'incomplete';
    stages[0]!.errors.push({stage:'heuristics',code:'SCRIPT_COMMAND_UNSUPPORTED',message:'Empty or nonstring script commands remain unresolved.',affectedScope:'manifest scripts',retryable:false});
  }
  return {
    schemaVersion: '0.1.0',
    findings: deterministic.findings,
    aiState,
    interpretations: [],
    stages,
    limitations: [...bundle.limitations, ...INTELLIGENCE_LIMITATIONS, ...deterministic.limitations],
  };
}

