import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import type { ArtifactInput, EvidenceBundle, AnalysisResults, InvestigationReport, AnalysisOptions } from '@heurisko/contracts';

const root = fileURLToPath(new URL('../../../', import.meta.url));
export type ContractKind = 'ArtifactInput'|'AnalysisOptions'|'EvidenceBundle'|'AnalysisResults'|'InvestigationReport'|'WatchState'|'Job';
export interface ValidationContext { signal?: AbortSignal; pythonExecutable?: string }
export class BoundaryError extends Error {
  constructor(public readonly code: 'CONTRACT_INVALID'|'VALIDATOR_UNAVAILABLE'|'VALIDATION_LIMIT'|'CANCELLED') { super(code); }
}
export async function validateContract(kind: ContractKind, value: unknown, context: ValidationContext = {}, bundle?: EvidenceBundle): Promise<void> {
  return runValidator({kind, value, bundle}, context);
}
async function runValidator(request: unknown, context: ValidationContext): Promise<void> {
  if (context.signal?.aborted) throw new BoundaryError('CANCELLED');
  const data = JSON.stringify(request);
  if (Buffer.byteLength(data) > 8 * 1024 * 1024) throw new BoundaryError('VALIDATION_LIMIT');
  await new Promise<void>((accept, reject) => {
    const child = execFile(context.pythonExecutable ?? resolve(root, '.venv/bin/python'), ['-I', resolve(root, 'packages/contracts/runtime/validate.py')], {
      timeout: 10_000, maxBuffer: 4096, signal: context.signal,
      env: { PATH: '/usr/bin:/bin', LANG: 'C.UTF-8' }, windowsHide: true,
    }, (error, stdout) => {
      if (context.signal?.aborted) return reject(new BoundaryError('CANCELLED'));
      if (stdout.trim() === '{"valid":false,"code":"CONTRACT_INVALID"}') return reject(new BoundaryError('CONTRACT_INVALID'));
      if (error || stdout.trim() !== '{"valid":true}') return reject(new BoundaryError('VALIDATOR_UNAVAILABLE'));
      accept();
    });
    child.stdin?.on('error', () => { /* exit callback handles failed startup/EPIPE */ });
    child.stdin?.end(data);
  });
}
export async function validateProducedBundle(value: unknown, context?: ValidationContext): Promise<EvidenceBundle> {
  const snapshot = structuredClone(value);
  await validateContract('EvidenceBundle', snapshot, context); return snapshot as EvidenceBundle;
}
export async function validateConsumedAnalysis(value: unknown, bundle: EvidenceBundle, context?: ValidationContext): Promise<AnalysisResults> {
  const snapshot = structuredClone(value);
  await validateContract('AnalysisResults', snapshot, context, bundle); return snapshot as AnalysisResults;
}
export async function validateReport(value: unknown, context?: ValidationContext): Promise<InvestigationReport> {
  const snapshot = structuredClone(value);
  await validateContract('InvestigationReport', snapshot, context); return snapshot as InvestigationReport;
}
export async function validateInput(value: unknown, context?: ValidationContext): Promise<ArtifactInput> {
  const snapshot = structuredClone(value);
  await validateContract('ArtifactInput', snapshot, context); return snapshot as ArtifactInput;
}
export async function validateOptions(value: unknown, context?: ValidationContext): Promise<AnalysisOptions> {
  const snapshot = structuredClone(value);
  await validateContract('AnalysisOptions', snapshot, context); return snapshot as AnalysisOptions;
}
// Persistence and import must pass these gates; no store or viewer exists in S1.
export async function encodeReport(value: unknown, context?: ValidationContext): Promise<string> {
  const snapshot = await validateReport(value, context); return JSON.stringify(snapshot);
}
export async function decodeReport(bytes: string, context?: ValidationContext): Promise<InvestigationReport> {
  if (Buffer.byteLength(bytes) > 8 * 1024 * 1024) throw new BoundaryError('VALIDATION_LIMIT');
  // Validate the original encoding before JSON.parse can hide duplicate keys or
  // round unsafe integers. Python accepts only the shared safe-number domain.
  await runValidator({kind:'InvestigationReport', rawValue:bytes}, context ?? {});
  return JSON.parse(bytes) as InvestigationReport;
}
export async function decodeBundle(bytes:string,context?:ValidationContext):Promise<EvidenceBundle> {
  if(Buffer.byteLength(bytes)>8*1024*1024)throw new BoundaryError('VALIDATION_LIMIT');
  await runValidator({kind:'EvidenceBundle',rawValue:bytes},context??{});
  return JSON.parse(bytes) as EvidenceBundle;
}
