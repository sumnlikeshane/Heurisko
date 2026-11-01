import type {
  AIInterpretation,
  AIState,
  AnalysisOptions,
  AnalysisResults,
  EvidenceBundle,
  EvidenceId,
  Finding,
  StageRecord,
} from '@heurisko/contracts';
import type { ResolvedEvidenceContent } from './index.js';
import { analyzeEvidence } from './index.js';

export const CODEASTRA_MODEL_ID = 'rootxhacker/codeastra-500M';
export const CODEASTRA_THRESHOLD = 0.3346;
export const CODEASTRA_PROMPT_VERSION = 'codeastra-paired-triage-v1';
const MAX_SNIPPET_CHARS = 24_000;
const SOURCE_LANGUAGES = new Set([
  'c', 'cpp', 'python', 'java', 'javascript', 'php', 'go', 'ruby', 'swift', 'kotlin', 'csharp', 'fortran',
]);
const LANGUAGE_BY_SUFFIX: Record<string, string> = {
  '.c': 'c', '.h': 'c', '.cc': 'cpp', '.cpp': 'cpp', '.cxx': 'cpp', '.hpp': 'cpp', '.hh': 'cpp',
  '.py': 'python', '.java': 'java', '.js': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript',
  '.php': 'php', '.go': 'go', '.rb': 'ruby', '.swift': 'swift', '.kt': 'kotlin', '.kts': 'kotlin',
  '.cs': 'csharp', '.f': 'fortran', '.f90': 'fortran', '.f95': 'fortran',
};

/**
 * A bounded, function-level excerpt selected by the evidence-store caller.
 * The caller must resolve it from a retained contentRef and preserve the exact
 * evidence ID and line range; this module never reads paths or contentRefs.
 */
export interface CodeAstraSnippet {
  changeId: string;
  evidenceId: EvidenceId;
  contentRef: string;
  side: 'artifact' | 'source';
  path: string;
  language: string;
  startLine: number;
  endLine: number;
  code: string;
}

export interface CodeAstraPrediction {
  vulnerableProbability: number;
  cwe: string;
  cweName: string;
  owasp: string;
  inputTokens: number;
  structuredOutputStatus?: 'valid_json' | 'malformed_json' | 'not_requested';
  generatedVulnerable?: boolean;
  generatedLabelDisagrees?: boolean;
}

/** Implement this interface with a local CodeAstra runtime; there is no hosted fallback. */
export interface CodeAstraLocalScorer {
  identity: {
    modelRevision: string;
    weightsSha256: string;
    runtimeId: string;
  };
  score(snippet: CodeAstraSnippet): Promise<CodeAstraPrediction>;
}

export interface CodeAstraOptions {
  /** Explicit local opt-in. Defaults to false. */
  enabled?: boolean;
  resolvedContent?: readonly ResolvedEvidenceContent[];
  snippets?: readonly CodeAstraSnippet[];
  scorer?: CodeAstraLocalScorer;
  /** Preserve an earlier analysis result if the caller is composing adapters. */
  baseAnalysis?: AnalysisResults;
}

export interface CodeAstraAnalysisResult {
  analysis: AnalysisResults;
  status: 'not_called' | 'completed' | 'failed' | 'abstained';
  scoredPairs: number;
  skippedChanges: number;
  errors: string[];
}

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const validIdentity = (scorer: CodeAstraLocalScorer): boolean =>
  /^[a-f0-9]{40}$/i.test(scorer.identity.modelRevision)
  && /^[a-f0-9]{64}$/i.test(scorer.identity.weightsSha256)
  && scorer.identity.runtimeId.trim().length > 0;

const validPrediction = (value: unknown): value is CodeAstraPrediction => {
  if (!record(value)) return false;
  return typeof value.vulnerableProbability === 'number'
    && Number.isFinite(value.vulnerableProbability)
    && value.vulnerableProbability >= 0
    && value.vulnerableProbability <= 1
    && typeof value.cwe === 'string'
    && typeof value.cweName === 'string'
    && typeof value.owasp === 'string'
    && typeof value.inputTokens === 'number'
    && Number.isInteger(value.inputTokens)
    && value.inputTokens >= 0
    && value.inputTokens <= 2048
    && (value.structuredOutputStatus === undefined
      || ['valid_json', 'malformed_json', 'not_requested'].includes(String(value.structuredOutputStatus)))
    && (value.generatedVulnerable === undefined || typeof value.generatedVulnerable === 'boolean')
    && (value.generatedLabelDisagrees === undefined || typeof value.generatedLabelDisagrees === 'boolean');
};

function validateSnippets(
  bundle: Readonly<EvidenceBundle>,
  snippets: readonly CodeAstraSnippet[],
  resolvedContent: readonly ResolvedEvidenceContent[],
): { accepted: CodeAstraSnippet[]; skipped: number } {
  const changes = new Map(bundle.changes.map((change) => [change.changeId, change]));
  const evidence = new Map(bundle.evidence.map((item) => [item.evidenceId, item]));
  const contentById = new Map<EvidenceId, string>();
  const recordsById = new Map(bundle.evidence.map((item) => [item.evidenceId, item]));
  for (const content of resolvedContent) {
    const item = recordsById.get(content.evidenceId);
    if (!item || item.contentState !== 'retained' || !item.contentRef || item.contentRef !== content.contentRef || contentById.has(content.evidenceId)) continue;
    contentById.set(content.evidenceId, content.text);
  }
  const accepted: CodeAstraSnippet[] = [];
  const seen = new Set<string>();
  let skipped = 0;

  for (const snippet of snippets) {
    const change = changes.get(snippet.changeId);
    const item = evidence.get(snippet.evidenceId);
    const retainedText = contentById.get(snippet.evidenceId);
    const expectedPath = snippet.side === 'artifact' ? change?.artifactPath : change?.sourcePath;
    const key = `${snippet.changeId}:${snippet.side}`;
    const sourceLinesMatch = retainedText !== undefined && (() => {
      const lines = retainedText.split(/\r?\n/);
      const contentStartLine = item?.locator.startLine ?? 1;
      const start = snippet.startLine - contentStartLine;
      const end = snippet.endLine - contentStartLine;
      return start >= 0 && end < lines.length && lines.slice(start, end + 1).join('\n') === snippet.code.replace(/\r\n/g, '\n');
    })();
    const valid = change !== undefined
      && change.status !== 'identical'
      && change.rawEquality !== 'equal'
      && item !== undefined
      && item.contentState === 'retained'
      && item.contentRef === snippet.contentRef
      && retainedText !== undefined
      && item.side === snippet.side
      && (item.kind === 'artifact_member' || item.kind === 'source_member')
      && item.locator.path === snippet.path
      && expectedPath === snippet.path
      && LANGUAGE_BY_SUFFIX[Object.keys(LANGUAGE_BY_SUFFIX).find((suffix) => snippet.path.toLowerCase().endsWith(suffix)) ?? ''] === snippet.language.toLowerCase()
      && Number.isInteger(snippet.startLine)
      && Number.isInteger(snippet.endLine)
      && snippet.startLine >= 1
      && snippet.endLine >= snippet.startLine
      && (item.locator.startLine === undefined || snippet.startLine >= item.locator.startLine)
      && (item.locator.endLine === undefined || snippet.endLine <= item.locator.endLine)
      && SOURCE_LANGUAGES.has(snippet.language.toLowerCase())
      && snippet.code.trim().length > 0
      && snippet.code.length <= MAX_SNIPPET_CHARS
      && sourceLinesMatch
      && !seen.has(key);

    if (!valid) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    accepted.push({ ...snippet, language: snippet.language.toLowerCase() });
  }
  return { accepted, skipped };
}

const interpretationId = (changeId: string): string => {
  const safe = changeId.toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 80);
  return `ai_codeastra_${safe}`;
};

function pairInterpretation(
  bundle: Readonly<EvidenceBundle>,
  findings: readonly Finding[],
  source: CodeAstraSnippet,
  artifact: CodeAstraSnippet,
  sourceResult: CodeAstraPrediction,
  artifactResult: CodeAstraPrediction,
  scorer: CodeAstraLocalScorer,
): AIInterpretation | undefined {
  if (source.language !== artifact.language) return undefined;
  const sourceFlag = sourceResult.vulnerableProbability >= CODEASTRA_THRESHOLD;
  const artifactFlag = artifactResult.vulnerableProbability >= CODEASTRA_THRESHOLD;
  const probabilityDelta = artifactResult.vulnerableProbability - sourceResult.vulnerableProbability;
  // Keep a result when a side crosses the published triage threshold or the
  // model scores the artifact materially higher. Equal low scores do not imply safety.
  if (!sourceFlag && !artifactFlag && probabilityDelta < 0.15) return undefined;

  const evidenceIds = [...new Set([source.evidenceId, artifact.evidenceId])].sort();
  const findingIds = findings
    .filter((finding) => finding.evidenceIds.some((id) => evidenceIds.includes(id)))
    .map((finding) => finding.findingId);
  if (findingIds.length === 0) return undefined;

  const change = bundle.changes.find((item) => item.changeId === source.changeId)!;
  const sourceLabel = sourceFlag ? 'above' : 'below';
  const artifactLabel = artifactFlag ? 'above' : 'below';
  const direction = probabilityDelta >= 0 ? 'higher' : 'lower';
  const hypothesis = sourceFlag !== artifactFlag
    ? `CodeAstra flags the ${sourceFlag ? 'source' : 'artifact'} excerpt at the configured vulnerability-triage threshold while the paired ${sourceFlag ? 'artifact' : 'source'} excerpt is below it.`
    : sourceFlag
      ? 'CodeAstra flags both paired excerpts for human security review; this is not evidence that the package is malicious or that either excerpt is exploitable.'
      : 'CodeAstra assigns the artifact excerpt a materially higher vulnerability-triage probability than the paired source excerpt; investigate the code change.';
  const summary = [
    `CodeAstra-500M local function-level triage; threshold=${CODEASTRA_THRESHOLD}.`,
    `Source ${source.path}:${source.startLine}-${source.endLine}: p=${sourceResult.vulnerableProbability.toFixed(4)} (${sourceLabel} threshold), threshold verdict=${sourceFlag ? 'vulnerable-triage' : 'below-threshold'}, generated verdict=${sourceResult.generatedVulnerable === undefined ? 'unavailable' : sourceResult.generatedVulnerable ? 'vulnerable' : 'not-vulnerable'}, ${sourceResult.cwe}; CWE name=${sourceResult.cweName}; OWASP=${sourceResult.owasp}; tokens=${sourceResult.inputTokens}; structured output=${sourceResult.structuredOutputStatus ?? 'unknown'}${sourceResult.generatedLabelDisagrees ? '; generated verdict disagrees with configured threshold' : ''}.`,
    `Artifact ${artifact.path}:${artifact.startLine}-${artifact.endLine}: p=${artifactResult.vulnerableProbability.toFixed(4)} (${artifactLabel} threshold), threshold verdict=${artifactFlag ? 'vulnerable-triage' : 'below-threshold'}, generated verdict=${artifactResult.generatedVulnerable === undefined ? 'unavailable' : artifactResult.generatedVulnerable ? 'vulnerable' : 'not-vulnerable'}, ${artifactResult.cwe}; CWE name=${artifactResult.cweName}; OWASP=${artifactResult.owasp}; tokens=${artifactResult.inputTokens}; structured output=${artifactResult.structuredOutputStatus ?? 'unknown'}${artifactResult.generatedLabelDisagrees ? '; generated verdict disagrees with configured threshold' : ''}.`,
    `Artifact minus source probability=${probabilityDelta.toFixed(4)} (${direction} on artifact side).`,
  ].join(' ');

  return {
    interpretationId: interpretationId(change.changeId),
    findingIds,
    evidenceIds,
    hypothesis,
    reasoningSummary: summary,
    alternatives: [
      'The score may reflect dataset or language-distribution patterns rather than a vulnerability in this package.',
      'A function-level classifier can miss or misclassify behavior that depends on callers, data flow, configuration, or runtime context.',
    ],
    missingEvidence: [
      'No independent exploitability analysis, interprocedural data-flow analysis, or human review was performed.',
      ...(bundle.fixtureKind === 'synthetic_contract' ? ['This input is a synthetic contract fixture, not a real package observation.'] : []),
    ],
    nextActions: ['Review both cited code ranges and verify any suspected flaw with an independent static-analysis or human code-review method.'],
    abstentionReason: '',
    modelId: CODEASTRA_MODEL_ID,
    runtimeId: `${scorer.identity.runtimeId};revision=${scorer.identity.modelRevision};weights_sha256=${scorer.identity.weightsSha256}`,
    promptVersion: CODEASTRA_PROMPT_VERSION,
    validation: 'passed',
  };
}

function withStage(
  base: AnalysisResults,
  state: AIState,
  status: StageRecord['status'],
  errors: string[],
  interpretations: AIInterpretation[],
  limitations: string[],
): AnalysisResults {
  const allInterpretations = [...base.interpretations, ...interpretations];
  const modelIds = new Set([
    ...allInterpretations.map((item) => item.modelId),
    ...(base.aiState.modelId ? [base.aiState.modelId] : []),
    ...(state.modelId ? [state.modelId] : []),
  ]);
  const priorSuccess = base.aiState.status === 'available' || base.interpretations.length > 0;
  const currentSuccess = state.status === 'available';
  const combinedState: AIState = {
    status: priorSuccess || currentSuccess ? 'available' : state.status,
    modelId: modelIds.size === 1 ? [...modelIds][0] : undefined,
    reason: [base.aiState.reason, state.reason].filter((item): item is string => Boolean(item)).join(' ' ) || undefined,
    validation: base.aiState.validation === 'passed' || state.validation === 'passed' ? 'passed' : state.validation,
  };
  const aiStage: StageRecord = {
    stage: 'ai',
    status,
    errors: errors.map((message) => ({
      stage: 'ai',
      code: 'CODEASTRA_INFERENCE_FAILED',
      message,
      affectedScope: 'CodeAstra paired code triage',
      retryable: false,
    })),
  };
  const otherStages = base.stages.filter((stage) => stage.stage !== 'ai');
  return {
    ...base,
    aiState: combinedState,
    interpretations: allInterpretations,
    stages: [...otherStages, aiStage],
    limitations: [
      ...base.limitations,
      'CodeAstra output is a local model hypothesis, not a vulnerability finding, severity decision, integrity verdict, or provenance result.',
      'The published benchmark is a model-card result; this package has not independently established CodeAstra accuracy on its supported package corpus.',
      ...limitations,
    ],
  };
}

/**
 * Add paired local vulnerability-triage interpretations to an existing report.
 * Only caller-selected function excerpts backed by retained artifact/source
 * evidence are scored. No package text is executed and no hosted fallback exists.
 */
export async function analyzeCodeAstraEvidence(
  bundle: Readonly<EvidenceBundle>,
  analysisOptions: AnalysisOptions,
  options: CodeAstraOptions = {},
): Promise<CodeAstraAnalysisResult> {
  const base = options.baseAnalysis ?? await analyzeEvidence(
    bundle,
    { ...analysisOptions, enableAI: false },
    options.resolvedContent,
  );
  const noCalls = (status: CodeAstraAnalysisResult['status'], reason: string): CodeAstraAnalysisResult => ({
    analysis: withStage(
      base,
      { status: status === 'abstained' ? 'abstained' : 'disabled', reason, validation: 'not_run' },
      status === 'abstained' ? 'complete' : 'skipped',
      [],
      [],
      [reason],
    ),
    status,
    scoredPairs: 0,
    skippedChanges: 0,
    errors: [],
  });

  if (!analysisOptions.enableAI || bundle.input.analysisOptions.enableAI !== true) {
    return noCalls('not_called', 'The report does not enable AI; CodeAstra did not run.');
  }
  if (options.enabled !== true) return noCalls('not_called', 'Local CodeAstra inference is disabled; no model was loaded or called.');
  if (!options.scorer || !validIdentity(options.scorer)) {
    const reason = 'A local CodeAstra scorer with pinned 40-character model revision, weights SHA-256, and runtime identity is required.';
    return {
      analysis: withStage(base, { status: 'unavailable', reason, validation: 'not_run' }, 'incomplete', [reason], [], []),
      status: 'failed',
      scoredPairs: 0,
      skippedChanges: 0,
      errors: [reason],
    };
  }

  const validated = validateSnippets(bundle, options.snippets ?? [], options.resolvedContent ?? []);
  const byChange = new Map<string, { source?: CodeAstraSnippet; artifact?: CodeAstraSnippet }>();
  for (const snippet of validated.accepted) {
    const pair = byChange.get(snippet.changeId) ?? {};
    pair[snippet.side] = snippet;
    byChange.set(snippet.changeId, pair);
  }

  const interpretations: AIInterpretation[] = [];
  const errors: string[] = [];
  let skippedChanges = validated.skipped;
  let scoredPairs = 0;
  for (const [changeId, pair] of byChange) {
    if (!pair.source || !pair.artifact || pair.source.language !== pair.artifact.language) {
      skippedChanges += 1;
      continue;
    }
    try {
      const [sourceRaw, artifactRaw] = await Promise.all([
        options.scorer.score(pair.source),
        options.scorer.score(pair.artifact),
      ]);
      if (!validPrediction(sourceRaw) || !validPrediction(artifactRaw)) {
        throw new Error('The local runtime returned an invalid probability, label, or token count.');
      }
      scoredPairs += 1;
      const interpretation = pairInterpretation(
        bundle,
        base.findings,
        pair.source,
        pair.artifact,
        sourceRaw,
        artifactRaw,
        options.scorer,
      );
      if (interpretation) interpretations.push(interpretation);
      else skippedChanges += 1;
    } catch (error) {
      skippedChanges += 1;
      errors.push(`Change ${changeId}: ${error instanceof Error ? error.message : 'local inference failed.'}`);
    }
  }

  if (scoredPairs === 0 && errors.length > 0) {
    const reason = errors.join(' ');
    return {
      analysis: withStage(base, { status: 'failed', modelId: CODEASTRA_MODEL_ID, reason, validation: 'not_run' }, 'incomplete', errors, [], []),
      status: 'failed',
      scoredPairs,
      skippedChanges,
      errors,
    };
  }
  if (scoredPairs === 0) {
    const reason = 'No paired, retained, caller-selected function excerpts were eligible for CodeAstra.';
    return {
      analysis: withStage(base, { status: 'abstained', modelId: CODEASTRA_MODEL_ID, reason, validation: 'not_run' }, 'complete', [], [], [reason]),
      status: 'abstained',
      scoredPairs,
      skippedChanges,
      errors,
    };
  }

  const partialReason = errors.length > 0 ? `${errors.length} CodeAstra pair(s) could not be scored.` : undefined;
  return {
    analysis: withStage(
      base,
      { status: 'available', modelId: CODEASTRA_MODEL_ID, reason: partialReason, validation: 'passed' },
      errors.length > 0 ? 'incomplete' : 'complete',
      errors,
      interpretations,
      [
        'A score below the configured triage threshold does not establish that code is safe.',
        'Only caller-selected function excerpts were scored; unselected and unsupported files are outside this model result.',
      ],
    ),
    status: 'completed',
    scoredPairs,
    skippedChanges,
    errors,
  };
}
