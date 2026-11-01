import type { AIState, AnalysisOptions, AnalysisResults, EvidenceBundle, Finding, StageStatus } from '@heurisko/contracts';
import { validateInterpretationDraft, type InterpretationDraft } from './interpretation.js';
import type { ResolvedEvidenceContent } from './index.js';
import { packageInterpretationPrompt, INTERPRETATION_PROMPT_VERSION } from './prompt.js';
import { retrieveEvidence, type EvidenceExcerpt } from './retrieval.js';

export const OPENROUTER_ANSWER_MODEL = 'qwen/qwen3-coder-next';
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export interface OpenRouterInferenceOptions {
  /** Must be set by an explicit caller flag; it defaults to false. */
  enabled?: boolean;
  apiKey?: string;
  timeoutMs?: number;
  maxTokens?: number;
  maxEvidenceItems?: number;
  maxPayloadChars?: number;
  attempts?: number;
  fetchImpl?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
  resolvedContent?: readonly ResolvedEvidenceContent[];
}

export interface OpenRouterInferenceMetadata {
  status: 'not_called' | 'completed' | 'failed' | 'rejected' | 'abstained';
  provider: 'openrouter';
  requestedModel: string;
  servedModel?: string;
  responseId?: string;
  finishReason?: string;
  latencyMs?: number;
  attempts?: number;
  promptTokens?: number;
  completionTokens?: number;
  costUsd?: number;
  error?: string;
}

export interface OpenRouterAnalysisResult {
  analysis: AnalysisResults;
  inference: OpenRouterInferenceMetadata;
  retrieval: ReturnType<typeof retrieveEvidence>;
}

const DRAFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['findingIds', 'evidenceIds', 'hypothesis', 'reasoningSummary', 'alternatives', 'missingEvidence', 'nextActions', 'abstentionReason'],
  properties: {
    findingIds: { type: 'array', items: { type: 'string' } },
    evidenceIds: { type: 'array', items: { type: 'string' } },
    hypothesis: { type: 'string' },
    reasoningSummary: { type: 'string' },
    alternatives: { type: 'array', items: { type: 'string' } },
    missingEvidence: { type: 'array', items: { type: 'string' } },
    nextActions: { type: 'array', items: { type: 'string' } },
    abstentionReason: { type: 'string' },
  },
};

const defaultSleep = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object';
const validCost = (value: unknown): number | undefined => typeof value === 'number' && Number.isFinite(value) ? value : undefined;

function stageWithResult(base: AnalysisResults, state: AIState, error?: { code: string; message: string }): AnalysisResults {
  const stages = base.stages.map((stage) => {
    if (stage.stage !== 'ai') return stage;
    const status: StageStatus = state.status === 'disabled' ? 'skipped'
      : state.status === 'available' || state.status === 'abstained' ? 'complete' : 'incomplete';
    return {
      ...stage,
      status,
      errors: error ? [{ stage: 'ai' as const, code: error.code, message: error.message, affectedScope: 'AI interpretations', retryable: false }] : [],
    };
  });
  return {
    ...base,
    aiState: state,
    stages,
    limitations: [
      ...base.limitations,
      'AI interpretation validation checks schema and evidence references; it does not establish claim entailment. Human review is required.',
    ],
  };
}

async function requestCompletion(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  options: Required<Pick<OpenRouterInferenceOptions, 'apiKey' | 'timeoutMs' | 'maxTokens' | 'attempts'>> & Pick<OpenRouterInferenceOptions, 'fetchImpl' | 'sleep'>,
): Promise<{ content: string; metadata: OpenRouterInferenceMetadata }> {
  const fetcher = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? defaultSleep;
  const started = Date.now();
  let lastError = 'unknown provider failure';

  for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    try {
      const response = await fetcher(ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/sumnlikeshane/Heurisko',
          'X-Title': 'Heurisko',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: OPENROUTER_ANSWER_MODEL,
          messages,
          temperature: 0.2,
          max_tokens: options.maxTokens,
          response_format: { type: 'json_object' },
          stream: false,
        }),
      });
      clearTimeout(timer);
      if (!response.ok) {
        const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
        lastError = `OpenRouter request failed with HTTP ${response.status}`;
        if (!retryable || attempt === options.attempts) throw new Error(lastError);
        const retryHeader = response.headers.get('retry-after');
        const retrySeconds = retryHeader ? Number(retryHeader) : NaN;
        const delay = Number.isFinite(retrySeconds) ? Math.max(0, Math.min(30_000, retrySeconds * 1000)) : Math.min(8_000, 500 * (2 ** (attempt - 1)));
        await sleep(delay);
        continue;
      }

      const envelope: unknown = await response.json();
      if (!isRecord(envelope) || !Array.isArray(envelope.choices) || !isRecord(envelope.choices[0])) {
        throw new Error('OpenRouter response did not contain choices[0].');
      }
      const choice = envelope.choices[0];
      const message = isRecord(choice.message) ? choice.message : undefined;
      if (!message || typeof message.content !== 'string') throw new Error('OpenRouter response did not contain message.content.');
      const usage = isRecord(envelope.usage) ? envelope.usage : {};
      return {
        content: message.content,
        metadata: {
          status: 'completed',
          provider: 'openrouter',
          requestedModel: OPENROUTER_ANSWER_MODEL,
          servedModel: typeof envelope.model === 'string' ? envelope.model : undefined,
          responseId: typeof envelope.id === 'string' ? envelope.id : undefined,
          finishReason: typeof choice.finish_reason === 'string' ? choice.finish_reason : undefined,
          latencyMs: Date.now() - started,
          attempts: attempt,
          promptTokens: typeof usage.prompt_tokens === 'number' ? usage.prompt_tokens : undefined,
          completionTokens: typeof usage.completion_tokens === 'number' ? usage.completion_tokens : undefined,
          costUsd: validCost(usage.cost),
        },
      };
    } catch (error) {
      clearTimeout(timer);
      lastError = error instanceof Error && error.name === 'AbortError'
        ? `OpenRouter request timed out after ${options.timeoutMs}ms`
        : error instanceof Error ? error.message : 'OpenRouter request failed';
      if (attempt === options.attempts || /^OpenRouter request failed with HTTP (?!408|429|5\d\d)/.test(lastError)) break;
      await sleep(Math.min(8_000, 500 * (2 ** (attempt - 1))));
    }
  }

  throw new Error(lastError);
}

function isProvenanceQuestion(query: string): boolean {
  const mainClause = query.trim().split(/[,.!?;]/, 1)[0] ?? '';
  const asksDirectlyForProvenance = /^(?:does|is|can|was|were|has|have|whether|verify|prove|confirm)\b/i.test(mainClause);
  const namesProvenance = /\b(provenance|attestation|attested|cryptographic(?:ally)?|exact source commit|built from commit|source revision)\b/i.test(mainClause);
  return asksDirectlyForProvenance && namesProvenance;
}

/**
 * Run the selected hosted model only when both the report option and explicit
 * runtime flag enable it. Deterministic findings survive every inference error.
 */
export async function analyzeEvidenceWithOpenRouter(
  bundle: Readonly<EvidenceBundle>,
  analysisOptions: AnalysisOptions,
  query: string,
  excerpts: readonly EvidenceExcerpt[],
  options: OpenRouterInferenceOptions = {},
): Promise<OpenRouterAnalysisResult> {
  const base = await import('./index.js').then(({ analyzeEvidence }) =>
    analyzeEvidence(bundle, { ...analysisOptions, enableAI: false }, options.resolvedContent));
  const emptyRetrieval = { method: 'lexical-v0' as const, selected: [], skipped: [], limitations: [] };
  const noCall = (status: AIState['status'], reason: string, code?: string): OpenRouterAnalysisResult => ({
    analysis: stageWithResult(base, { status, reason, validation: status === 'rejected' ? 'rejected' : 'not_run' }, code ? { code, message: reason } : undefined),
    inference: { status: 'not_called', provider: 'openrouter', requestedModel: OPENROUTER_ANSWER_MODEL, error: reason },
    retrieval: emptyRetrieval,
  });

  if (!analysisOptions.enableAI || options.enabled !== true) return noCall('disabled', 'Hosted inference is disabled; no model request was made.');
  if (!bundle.input.analysisOptions.enableAI) return noCall('disabled', 'The investigation bundle does not enable AI; no model request was made.');
  if (!options.apiKey?.trim()) return noCall('unavailable', 'OPENROUTER_API_KEY was not supplied to the enabled adapter.', 'OPENROUTER_KEY_MISSING');
  if (!query.trim()) return noCall('rejected', 'An investigation question is required.', 'AI_QUERY_MISSING');

  const retrieval = retrieveEvidence(bundle, query, excerpts, { maxResults: options.maxEvidenceItems ?? 6 });
  if (retrieval.selected.length === 0) {
    return {
      analysis: stageWithResult(base, { status: 'abstained', reason: 'No retained matching evidence was selected; the model was not called.', validation: 'not_run' }),
      inference: { status: 'not_called', provider: 'openrouter', requestedModel: OPENROUTER_ANSWER_MODEL },
      retrieval,
    };
  }

  let run: Awaited<ReturnType<typeof requestCompletion>>;
  try {
    const retrievedIds = new Set(retrieval.selected.map((item) => item.evidenceId));
    const promptFindings = base.findings
      .map((finding) => ({ ...finding, evidenceIds: finding.evidenceIds.filter((id) => retrievedIds.has(id)) }))
      .filter((finding) => finding.evidenceIds.length > 0);
    const prompt = packageInterpretationPrompt(promptFindings, retrieval.selected, {
      maxEvidenceItems: options.maxEvidenceItems ?? 6,
      maxPayloadChars: options.maxPayloadChars ?? 24_000,
      question: query,
    });
    const schemaText = JSON.stringify(DRAFT_SCHEMA);
    run = await requestCompletion([
      { role: 'system', content: `${prompt.systemInstruction} Return a JSON object that exactly matches this schema: ${schemaText}` },
      { role: 'user', content: prompt.userPayload },
    ], {
      apiKey: options.apiKey,
      timeoutMs: options.timeoutMs ?? 90_000,
      maxTokens: options.maxTokens ?? 1_024,
      attempts: options.attempts ?? 3,
      fetchImpl: options.fetchImpl,
      sleep: options.sleep,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OpenRouter inference failed.';
    return {
      analysis: stageWithResult(base, { status: 'unavailable', reason: message, validation: 'not_run' }, { code: 'OPENROUTER_UNAVAILABLE', message }),
      inference: { status: 'failed', provider: 'openrouter', requestedModel: OPENROUTER_ANSWER_MODEL, error: message },
      retrieval,
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(run.content);
  } catch {
    const reason = 'Model response was not valid JSON; no interpretation was accepted.';
    return {
      analysis: stageWithResult(base, { status: 'rejected', modelId: run.metadata.servedModel ?? OPENROUTER_ANSWER_MODEL, reason, validation: 'rejected' }, { code: 'AI_INVALID_JSON', message: reason }),
      inference: { ...run.metadata, status: 'rejected', error: reason },
      retrieval,
    };
  }

  const findings: readonly Finding[] = base.findings;
  const metadata = {
    interpretationId: `ai_${(run.metadata.responseId ?? 'openrouter-response').toLowerCase().replace(/[^a-z0-9_-]/g, '_')}`,
    modelId: run.metadata.servedModel ?? OPENROUTER_ANSWER_MODEL,
    runtimeId: 'openrouter-chat-completions',
    promptVersion: INTERPRETATION_PROMPT_VERSION,
  };
  const validation = validateInterpretationDraft(raw, bundle, retrieval.selected, findings, metadata);
  if (validation.status === 'rejected') {
    const reason = validation.reason;
    return {
      analysis: stageWithResult(base, { status: 'rejected', modelId: metadata.modelId, reason, validation: 'rejected' }, { code: `AI_${validation.code.toUpperCase()}`, message: reason }),
      inference: { ...run.metadata, status: 'rejected', error: reason },
      retrieval,
    };
  }

  const draft = raw as InterpretationDraft;
  const retrievedIds = new Set(retrieval.selected.map((item) => item.evidenceId));
  const unverifiedGeneratedChange = findings.some((finding) =>
    finding.ruleId === 'heurisko.change.generated-candidate-unverified'
  );
  const verifiedBuildEvidence = bundle.evidence.some((item) =>
    item.kind === 'build_record' && item.verification === 'verified'
  );
  if (unverifiedGeneratedChange && !verifiedBuildEvidence && !isProvenanceQuestion(query)) {
    const explanationSentences = `${draft.hypothesis}. ${draft.reasoningSummary}`.split(/[.!?]+/);
    const overclaim = explanationSentences.find((sentence) =>
      /\b(?:generated|built|inserted|created|added|produced)\b.{0,100}\b(?:during|at|by|from)\b/i.test(sentence)
      && !/\b(?:may|might|could|possible|possibly|likely|probably|hypothesis|not established|not confirmed|unverified|unproven|uncertain|appears)\b/i.test(sentence)
    );
    if (overclaim) {
      const reason = 'The answer states an unverified generated/build origin as fact; phrase it as a hypothesis unless the bundle contains verified build evidence.';
      return {
        analysis: stageWithResult(base, { status: 'rejected', modelId: metadata.modelId, reason, validation: 'rejected' }, { code: 'AI_UNVERIFIED_GENERATION_CLAIM', message: reason }),
        inference: { ...run.metadata, status: 'rejected', error: reason },
        retrieval,
      };
    }
  }
  const globalCitationIds = new Set(draft.evidenceIds);
  const uncitedAlternative = draft.alternatives.find((alternative) => {
    const citedIds = [...alternative.matchAll(/\bev_[a-f0-9]{24}\b/g)].map(([id]) => id);
    return citedIds.length === 0 || citedIds.some((id) => !retrievedIds.has(id as `ev_${string}`) || !globalCitationIds.has(id as `ev_${string}`));
  });
  if (uncitedAlternative) {
    const reason = 'An alternative lacked a citation to retrieved evidence; the interpretation was rejected.';
    return {
      analysis: stageWithResult(base, { status: 'rejected', modelId: metadata.modelId, reason, validation: 'rejected' }, { code: 'AI_ALTERNATIVE_UNCITED', message: reason }),
      inference: { ...run.metadata, status: 'rejected', error: reason },
      retrieval,
    };
  }
  const verifiedProvenance = bundle.provenance.status === 'verified_policy' || bundle.provenance.status === 'verified_cryptographic_only';
  if (isProvenanceQuestion(query) && !verifiedProvenance
    && (draft.evidenceIds.length > 0 || !draft.abstentionReason.trim())) {
    const reason = 'The question requests a provenance conclusion, but the bundle has no verified artifact-to-source binding; the non-abstaining model response was rejected.';
    return {
      analysis: stageWithResult(base, { status: 'rejected', modelId: metadata.modelId, reason, validation: 'rejected' }, { code: 'AI_PROVENANCE_ABSTENTION_REQUIRED', message: reason }),
      inference: { ...run.metadata, status: 'rejected', error: reason },
      retrieval,
    };
  }

  const isAbstention = draft.evidenceIds.length === 0 && draft.abstentionReason.trim().length > 0;
  return {
    analysis: {
      ...stageWithResult(base, {
        status: isAbstention ? 'abstained' : 'available',
        modelId: metadata.modelId,
        validation: 'passed',
        ...(isAbstention ? { reason: draft.abstentionReason } : {}),
      }),
      interpretations: [validation.interpretation],
    },
    inference: { ...run.metadata, status: isAbstention ? 'abstained' : 'completed' },
    retrieval,
  };
}
