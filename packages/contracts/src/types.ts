// HEURISKO shared G0 contract v0.1.0 — accepted under agreement E09; PR merge pending.
// The JSON Schema in ../schema is the canonical runtime shape.
export type SHA256 = `sha256:${string}`;
export type EvidenceId = `ev_${string}`;
export type ReportId = `report_${string}`;
export type ISODateUTC = string;
export type Stage = 'resolve_artifact'|'acquire'|'source'|'provenance'|'inventory'|'compare'|'build'|'heuristics'|'ai'|'persist';
export type StageStatus = 'not_started'|'running'|'complete'|'incomplete'|'skipped'|'failed';
export type Severity = 'high'|'medium'|'low'|'informational'|'undetermined';
export type Confidence = 'high'|'limited'|'unresolved';
export type ExplanationStrength = 'exact'|'reproduced'|'supported_unreproduced'|'hypothesis'|'unexplained'|'not_assessed';
export interface SourceOverride { repo: string; commit: string; subdirectory?: string }
export interface AnalysisOptions { enableAI: boolean; analysisProfile: string; trustPolicyRef?: string; resourcePolicyRef?: string }
export type ArtifactInput = { analysisOptions: AnalysisOptions; artifactFilename?: string; sourceOverride?: SourceOverride } & ({ ecosystem:'npm'; packageName:string; version:string } | { ecosystem:'local'; artifactPath:string; packageName?:string; version?:string });
export type IntegrityCheck =
  | { algorithm:'sha512'|'sha256'; expectedValue:string; status:'matched'|'mismatched' }
  | { algorithm:'sha512'|'sha256'|'none'; expectedValue?:string; status:'not_checked'|'not_available' };
export interface ArtifactIdentity { origin:'registry'|'local'; artifactFilename:string; observedSha256:SHA256; captureTime:ISODateUTC; integrity:IntegrityCheck; packageName?:string; version?:string; metadataEvidenceId?:EvidenceId }
export interface SourceCandidate { repositoryUrl:string; commit?:string; subdirectory?:string; buildContextSha256?:SHA256; sourceSnapshotSha256?:SHA256; association:'publisher_asserted'|'corroborated'|'user_supplied'|'ambiguous'|'unavailable'; evidenceIds:EvidenceId[]; conflicts:string[] }
export interface Locator {path?:string; metadataKey?:string; startLine?:number; endLine?:number; startByte?:number; endByte?:number}
export interface EvidenceRecord { evidenceId:EvidenceId; kind:'artifact_member'|'source_member'|'raw_diff'|'manifest_delta'|'source_claim'|'registry_metadata'|'provenance'|'build_record'|'analysis_note'; side:'artifact'|'source'|'both'|'external'; locator:Locator; contentSha256?:SHA256; observationMethod:string; contentState:'retained'|'not_exported'|'unavailable'; contentRef?:string; verification?:'verified'|'unverified'|'not_checked'; limitations:string[] }
export interface FileChange { changeId:string; status:'identical'|'added'|'removed'|'modified'|'generated_candidate'|'unresolved'; sourcePath?:string; artifactPath?:string; rawEquality:'equal'|'different'|'unknown'; explanationStrength:ExplanationStrength; evidenceIds:EvidenceId[]; notes:string[] }
export interface StageError {stage:Stage; code:string; message:string; affectedScope:string; retryable:boolean}
export interface StageRecord {stage:Stage; status:StageStatus; errors:StageError[]}
export interface CoverageOmission { side:'artifact'|'source'; path:string; kind:'skipped'|'unsupported'; stage:Stage; reason:string; bytes:number; evidenceIds:[EvidenceId,...EvidenceId[]] }
export interface Coverage {sourceFiles:number; artifactFiles:number; comparedFiles:number; analyzedBytes:number; skippedBytes:number; unsupportedBytes:number; omissions:CoverageOmission[]; complete:boolean; limitations:string[] }
export type ProvenanceState = (
  | { status:'verified_policy'; artifactBinding:'matched'; policyRef:string; evidenceIds:[EvidenceId,...EvidenceId[]] }
  | { status:'verified_cryptographic_only'; artifactBinding:'matched'; policyRef?:string; evidenceIds:[EvidenceId,...EvidenceId[]] }
  | { status:'not_checked'|'absent'|'invalid'|'unresolved'; artifactBinding:'matched'|'mismatched'|'not_checked'|'not_available'; policyRef?:string; evidenceIds:EvidenceId[] }
) & { limitations:string[] };
export interface EvidenceBundle {schemaVersion:'0.1.0'; input:ArtifactInput; artifact:ArtifactIdentity; sourceCandidates:SourceCandidate[]; provenance:ProvenanceState; evidence:EvidenceRecord[]; changes:FileChange[]; stages:StageRecord[]; coverage:Coverage; limitations:string[]; fixtureKind:'synthetic_contract'|'real_generated'}
export interface Finding {findingId:string; title:string; observation:string; whyItMatters:string; evidenceIds:EvidenceId[]; severity:Severity; reviewPriority:Severity; evidenceConfidence:Confidence; explanationStrength:ExplanationStrength; limitations:string[]; nextActions:string[]; ruleId:string; ruleVersion:string }
export interface AIState {status:'disabled'|'available'|'unavailable'|'failed'|'rejected'|'abstained'; modelId?:string; reason?:string; validation:'not_run'|'passed'|'rejected'}
export interface AIInterpretation {interpretationId:string; findingIds:string[]; evidenceIds:EvidenceId[]; hypothesis:string; reasoningSummary:string; alternatives:string[]; missingEvidence:string[]; nextActions:string[]; abstentionReason:string; modelId:string; runtimeId:string; promptVersion:string; validation:'passed'}
export interface AnalysisResults {schemaVersion:'0.1.0'; findings:Finding[]; aiState:AIState; interpretations:AIInterpretation[]; stages:StageRecord[]; limitations:string[]}
export interface Outcomes { artifactIntegrity:'matched'|'mismatched'|'not_checked'|'not_available'; sourceAssociation:'corroborated'|'publisher_asserted'|'user_supplied'|'ambiguous'|'unavailable'; provenancePolicy:'verified_policy'|'verified_cryptographic_only'|'invalid'|'absent'|'not_checked'|'unresolved'; correspondence:'exact'|'reproduced'|'partially_explained'|'unresolved'|'not_assessed'; analysisCompleteness:'complete'|'incomplete'|'failed'; policyResult:'pass'|'violation'|'indeterminate'|'not_evaluated'}
export interface InvestigationReport {schemaVersion:'0.1.0'; reportId:ReportId; createdAt:ISODateUTC; bundle:EvidenceBundle; analysis:AnalysisResults; outcomes:Outcomes; analysisConfigFingerprint:string; fixtureKind:'synthetic_contract'|'real_generated'}
export interface WatchState {watchId:string;ecosystem:'npm';packageName:string;releasePolicy:'stable'|'include_prerelease';cursor?:string;schedulerStatus:'running'|'stopped'|'unconfigured'|'stale'|'failed';lastAttemptAt?:ISODateUTC;lastSuccessAt?:ISODateUTC;seenArtifactDigests:SHA256[]}
export interface Job {jobId:string;watchId:string;artifactDigest:SHA256;analysisConfigFingerprint:string;dedupeKey:string;status:'queued'|'running'|'failed'|'completed';attempts:number;error?:string}
export type CollectEvidence = (input:ArtifactInput) => Promise<EvidenceBundle>;
export type AnalyzeEvidence = (bundle:Readonly<EvidenceBundle>, options:AnalysisOptions) => Promise<AnalysisResults>;
export type Investigate = (input:ArtifactInput, options:AnalysisOptions) => Promise<InvestigationReport>;
