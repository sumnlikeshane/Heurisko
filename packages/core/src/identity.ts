import { createHash } from 'node:crypto';
import type { EvidenceBundle, EvidenceRecord, SourceCandidate, ReportId, EvidenceId, AnalysisOptions } from '@heurisko/contracts';

// Python json.dumps(sort_keys=True, separators=(',', ':'), ensure_ascii=True).
// Restrict numbers to safe integers: floats have no shared Python/JS spelling.
export function canonicalJSON(value: unknown): string {
  const quote = (s: string): string => JSON.stringify(s).replace(/[\u007f-\uffff]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
  const compare = (a: string, b: string): number => {
    const x = Array.from(a, c => c.codePointAt(0)!); const y = Array.from(b, c => c.codePointAt(0)!);
    for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i]! - y[i]!;
    return x.length - y.length;
  };
  const visit = (v: unknown): string => {
    if (v === null) return 'null';
    if (typeof v === 'string') return quote(v);
    if (typeof v === 'boolean') return String(v);
    if (typeof v === 'number' && Number.isSafeInteger(v) && !Object.is(v, -0)) return String(v);
    if (Array.isArray(v)) return '[' + Array.from(v, visit).join(',') + ']';
    if (typeof v === 'object' && v && Object.getPrototypeOf(v) === Object.prototype) return '{' + Object.keys(v).sort(compare).map(k => quote(k) + ':' + visit((v as Record<string, unknown>)[k])).join(',') + '}';
    throw new TypeError('Canonical JSON requires plain JSON values and safe integers');
  };
  return visit(value);
}
export const sha256 = (bytes: string | Uint8Array): `sha256:${string}` => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
export const canonicalId = (prefix: string, value: unknown): string => prefix + sha256(canonicalJSON(value)).slice(7, 31);
export const sourceIdentity = (c: SourceCandidate) => ({repo:c.repositoryUrl, commit:c.commit ?? '', subdirectory:c.subdirectory ?? '', sourceSnapshotSha256:c.sourceSnapshotSha256 ?? '', buildContextSha256:c.buildContextSha256 ?? ''});
// Producers order before generating any IDs; validators preserve received G0 order.
export const orderCandidates = (candidates: readonly SourceCandidate[]): SourceCandidate[] => [...candidates].sort((a,b) => {
  const x = canonicalJSON(sourceIdentity(a)); const y = canonicalJSON(sourceIdentity(b));
  return x < y ? -1 : x > y ? 1 : canonicalJSON(a) < canonicalJSON(b) ? -1 : canonicalJSON(a) > canonicalJSON(b) ? 1 : 0;
});
export function reportId(bundle: EvidenceBundle, config: string): ReportId {
  return canonicalId('report_', {artifact:bundle.artifact.observedSha256, source:bundle.sourceCandidates.map(sourceIdentity), config}) as ReportId;
}
export function evidenceId(bundle: EvidenceBundle, e: Omit<EvidenceRecord, 'evidenceId'>): EvidenceId {
  const l = e.locator;
  return canonicalId('ev_', {artifact:bundle.artifact.observedSha256, source:bundle.sourceCandidates.map(sourceIdentity), kind:e.kind, side:e.side, path:l.path ?? '', metadataKey:l.metadataKey ?? '', contentDigest:e.contentSha256 ?? '', ...Object.fromEntries(['startLine','endLine','startByte','endByte'].filter(k=>k in l).map(k=>[k,l[k as keyof typeof l]]))}) as EvidenceId;
}
export interface AnalysisConfiguration {
  version: 'heurisko-config-v1'|'heurisko-config-v2'|'heurisko-config-v3';
  analysisModule?:ReturnType<typeof import('./adapter.js').analysisModuleIdentity>|null;
  evidenceSnapshotSha256?: `sha256:${string}`;
  subject: { ecosystem:'npm'|'local'; origin:'registry'|'local'; packageName:string|null; version:string|null; artifactFilename:string; registryUrl:string|null };
  artifactSha256: `sha256:${string}`;
  sources: ReturnType<typeof sourceIdentity>[];
  versions: { engine:string; rules:string; tools:string; policy:string; normalizers:string; verifier:string; trustRoot:string };
  options: AnalysisOptions;
  safetyProfileSha256: `sha256:${string}`;
  // Digest of retained exact model/recipe/input-selection settings; no model prose.
  interpretationConfigSha256: `sha256:${string}` | null;
}
export function configurationFingerprint(config: AnalysisConfiguration): `sha256:${string}` {
  if (!['heurisko-config-v1','heurisko-config-v2','heurisko-config-v3'].includes(config.version) || !config.subject || !config.versions || !config.options || !Array.isArray(config.sources)) throw new TypeError('Invalid configuration ledger');
  if(config.version==='heurisko-config-v3'&&config.analysisModule===undefined)throw new TypeError('Analysis module identity required');
  for (const digest of [...(config.evidenceSnapshotSha256 ? [config.evidenceSnapshotSha256] : []), config.artifactSha256, config.safetyProfileSha256, ...(config.interpretationConfigSha256 ? [config.interpretationConfigSha256] : [])]) if (!/^sha256:[a-f0-9]{64}$/.test(digest)) throw new TypeError('Invalid configuration digest');
  const sources = [...config.sources].sort((a,b)=>canonicalJSON(a)<canonicalJSON(b)?-1:canonicalJSON(a)>canonicalJSON(b)?1:0);
  return sha256(canonicalJSON({...config, sources}));
}
// This projection is scoped to deterministic equivalence, never storage bytes.
// Full reports (including every observation time/AI outcome) stay immutable.
export function deterministicReportDigest(report: import('@heurisko/contracts').InvestigationReport): `sha256:${string}` {
  const {createdAt, analysis, bundle, ...rest} = report;
  const {captureTime, ...artifact} = bundle.artifact;
  const volatileEvidence=new Set(bundle.evidence.filter(e=>e.observationMethod==='volatile-acquisition-observation-v1').map(e=>e.evidenceId));
  // An analysis that explicitly cites an observation keeps that observation as a
  // relevant fact. Unreferenced transport-time records alone are volatile.
  const referenced=new Set([...analysis.findings,...bundle.changes,...bundle.sourceCandidates,bundle.provenance].flatMap(x=>x.evidenceIds));
  const evidence=bundle.evidence.filter(e=>!volatileEvidence.has(e.evidenceId)||referenced.has(e.evidenceId));
  const {aiState, interpretations, stages, ...deterministicAnalysis} = analysis;
  return sha256(canonicalJSON({...rest, bundle:{...bundle, artifact, evidence, stages:bundle.stages.filter(s=>s.stage!=='ai')}, analysis:{...deterministicAnalysis, stages:stages.filter(s=>s.stage!=='ai')}}));
}
