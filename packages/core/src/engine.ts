import type { AnalysisOptions, ArtifactInput, InvestigationReport, Outcomes } from '@heurisko/contracts';
import { collectEvidence, type ProducerContext } from './producer.js';
import { EvidenceStore } from './storage.js';
import { runAnalysis, analysisModuleIdentity, emitProgress, type AnalysisModule } from './adapter.js';
import { canonicalJSON, configurationFingerprint, reportId, sha256, sourceIdentity, type AnalysisConfiguration } from './identity.js';
import { safetyProfile } from './safety.js';
import { validateOptions, validateReport } from './validation.js';
import { retainJSONEvidence } from './comparison.js';
import { boundedFile } from './storage.js';
import { fileURLToPath } from 'node:url';
import { loadConfiguredAnalysisModule } from './reviewed-module.js';

export interface InvestigationContext extends ProducerContext { module?:AnalysisModule; analysisModuleSelector?:string }
export async function engineCodeIdentity() {
  const codeDigests:Record<string,string>={};
  for(const name of ['engine','producer','comparison','archive','network','storage','parser-runtime','parser-job','adapter','identity','validation','safety','npm','sources','provenance','intelligence-boundary','reviewed-module'])codeDigests[name]=sha256(await boundedFile(fileURLToPath(new URL(`./${name}.js`,import.meta.url)),256*1024));
  for(const [name,path]of [['parserWorker','../runtime/archive_worker.py'],['contractSchema','../../contracts/schema/contracts.schema.json'],['contractValidator','../../contracts/runtime/validate.py'],['contractSemantics','../../contracts/runtime/semantics.py']] as const)codeDigests[name]=sha256(await boundedFile(fileURLToPath(new URL(path,import.meta.url)),256*1024));
  return {engine:'shane-audit-v1;'+sha256(canonicalJSON(codeDigests)),codeDigests};
}
export function exitCode(report?:Pick<InvestigationReport,'outcomes'>):0|1|2|3 {
  if(!report)return 3;
  if(report.outcomes.policyResult==='violation')return 1;
  if(report.outcomes.analysisCompleteness!=='complete' || report.outcomes.policyResult==='indeterminate')return 2;
  return 0;
}
export async function investigate(input:ArtifactInput,options:AnalysisOptions,context:InvestigationContext={}):Promise<InvestigationReport> {
  input=structuredClone(input);
  const store=context.store??new EvidenceStore();
  // Trusted explicit injection overrides host configuration. Unknown host
  // selectors fail before acquisition and can never come from target metadata.
  const module=context.module?Object.freeze({...context.module}):await loadConfiguredAnalysisModule({store,signal:context.signal,selector:context.analysisModuleSelector});
  const moduleIdentity=module?analysisModuleIdentity(module):null;
  const settings=await validateOptions(options,context);
  const bundle=await collectEvidence({...input,analysisOptions:settings},{...context,store});
  const {engine,codeDigests}=await engineCodeIdentity();
  const config:AnalysisConfiguration={version:'heurisko-config-v3',analysisModule:moduleIdentity,evidenceSnapshotSha256:sha256(canonicalJSON(bundle.evidence.filter(e=>e.locator.metadataKey==='acquisition-context').map(e=>({kind:e.kind,locator:e.locator,digest:e.contentSha256})))),subject:{ecosystem:input.ecosystem,origin:bundle.artifact.origin,packageName:bundle.artifact.packageName??null,version:bundle.artifact.version??null,artifactFilename:bundle.artifact.artifactFilename,registryUrl:input.ecosystem==='npm'?'https://registry.npmjs.org':null},artifactSha256:bundle.artifact.observedSha256,sources:bundle.sourceCandidates.map(sourceIdentity),versions:{engine,rules:moduleIdentity?`${moduleIdentity.moduleId}@${moduleIdentity.moduleVersion}`:'unavailable',tools:`node-${process.versions.node};host-${process.platform}-${process.arch};${safetyProfile.parser.image};worker-${codeDigests.parserWorker}`,policy:settings.trustPolicyRef??'none',normalizers:'none',verifier:'none',trustRoot:'none'},options:settings,safetyProfileSha256:sha256(canonicalJSON(safetyProfile)),interpretationConfigSha256:moduleIdentity?.interpretationConfigSha256??null};
  await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'both',locator:{metadataKey:'analysis-configuration'},observationMethod:'heurisko-config-v3',limitations:[]},config);
  let analysis;
  const validationContext={...context,signal:undefined};
  if(context.signal?.aborted) {
    analysis=await runAnalysis(bundle,settings,undefined,validationContext);
    analysis.limitations.push('Investigation cancelled; retained partial evidence only.');
  } else {
    try {analysis=await runAnalysis(bundle,settings,module,context);}
    catch(e) {
      analysis=await runAnalysis(bundle,settings,undefined,{...validationContext,onProgress:undefined});
      analysis.stages[0]!.errors=[{stage:'heuristics',code:e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'ANALYSIS_FAILED',message:'Analysis module failed; deterministic evidence retained',affectedScope:'analysis',retryable:false}];
      for(const stage of analysis.stages)emitProgress(context,stage);
    }
  }
  if(!analysis.stages.some(s=>s.stage==='ai'))analysis.stages.push({stage:'ai',status:'skipped',errors:[]});
  const incomplete=!bundle.coverage.complete || analysis.stages.find(s=>s.stage==='heuristics')?.status!=='complete' || [...bundle.stages,...analysis.stages].some(s=>['failed','incomplete','not_started','running'].includes(s.status));
  const outcomes:Outcomes={artifactIntegrity:bundle.artifact.integrity.status,sourceAssociation:bundle.sourceCandidates.some(c=>c.association==='ambiguous')?'ambiguous':bundle.sourceCandidates.some(c=>c.association==='user_supplied')?'user_supplied':bundle.sourceCandidates.some(c=>c.commit)?'publisher_asserted':'unavailable',provenancePolicy:bundle.provenance.status,
    correspondence:bundle.artifact.integrity.status==='mismatched'?'not_assessed':bundle.sourceCandidates.some(c=>c.association==='ambiguous')?'unresolved':bundle.coverage.complete&&bundle.changes.length>0&&bundle.changes.every(c=>c.status==='identical')?'exact':bundle.changes.length?'unresolved':'not_assessed',analysisCompleteness:incomplete?'incomplete':'complete',policyResult:settings.trustPolicyRef?'indeterminate':'not_evaluated'};
  // Policy implementations are not supplied in S2. Priority/severity never invent
  // a violation, and a named but unevaluated policy never earns pass.
  // G0's report field is bare 64-hex; internal digest APIs retain sha256:.
  const fingerprint=configurationFingerprint(config).slice(7);
  const report:InvestigationReport={schemaVersion:'0.1.0',reportId:reportId(bundle,fingerprint),createdAt:new Date().toISOString().replace(/\.\d{3}Z$/,'Z'),bundle,analysis,outcomes,analysisConfigFingerprint:fingerprint,fixtureKind:'real_generated'};
  const persistStage={stage:'persist' as const,status:'complete' as const,errors:[]};bundle.stages.push(persistStage);
  emitProgress(context,{stage:'persist',status:'running'});
  try {await validateReport(report,validationContext);await store.verifyEvidence(report);}
  catch(error){emitProgress(context,{stage:'persist',status:'failed'});throw error;}
  try {await store.saveReport(report,validationContext);emitProgress(context,{stage:'persist',status:'complete'});}
  catch(error) {
    const code=error instanceof Error&&/^[A-Z_]+$/.test(error.message)?error.message:'REPORT_PERSIST_FAILED';
    if(code.includes('COLLISION')||code.includes('HASH_MISMATCH'))throw error;
    bundle.stages[bundle.stages.length-1]={stage:'persist',status:'incomplete',errors:[{stage:'persist',code,message:'Report persistence failed; usable report returned with retained raw evidence',affectedScope:'report persistence',retryable:true}]};
    outcomes.analysisCompleteness='incomplete';report.analysis.limitations.push('Report could not be committed to the local run index. Save the returned JSON for recovery.');
    await validateReport(report,validationContext);emitProgress(context,bundle.stages[bundle.stages.length-1]!);
  }
  return report;
}
