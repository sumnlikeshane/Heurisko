import type {
  AIState,
  AnalysisOptions,
  AnalysisResults,
  EvidenceBundle,
  StageRecord,
} from '@heurisko/contracts';

const M0_LIMITATIONS = [
  'M0 adapter only establishes the shared EvidenceBundle to AnalysisResults boundary; deterministic analysis rules are not implemented yet.',
  'No evidence is retrieved or chunked in M0. Evidence IDs and locations remain owned by the supplied bundle.',
  'No package acquisition, provenance verification, cryptographic trust decision, or product model inference is performed by this component.',
] as const;

/**
 * Consumes Shane's immutable evidence bundle and returns the shared report shape.
 * M0 intentionally emits no findings until evidence-backed deterministic rules
 * are implemented. It never acquires artifacts or evaluates trust itself.
 */
export async function analyzeEvidence(
  bundle: Readonly<EvidenceBundle>,
  options: AnalysisOptions,
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
      status: 'skipped',
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

  return {
    schemaVersion: '0.1.0',
    findings: [],
    aiState,
    interpretations: [],
    stages,
    limitations: [...bundle.limitations, ...M0_LIMITATIONS],
  };
}

export type { AnalyzeEvidence } from '@heurisko/contracts';
