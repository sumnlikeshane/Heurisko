import type { AnalysisResults, AnalyzeEvidence, EvidenceBundle, AnalysisOptions, Stage, StageStatus, StageError, SHA256 } from '@heurisko/contracts';
import { validateProducedBundle, validateConsumedAnalysis, validateOptions, type ValidationContext } from './validation.js';
import { safetyProfile } from './safety.js';
export interface StageProgress { stage:Stage; status:StageStatus; completedUnits?:number; totalUnits?:number; errors?:ReadonlyArray<StageError> }
export interface RunContext extends ValidationContext { onProgress?: (event: Readonly<StageProgress>) => void }
export interface AnalysisModule {
  moduleId:string; moduleVersion:string;
  // Trusted integration supplies the reviewed executable closure and rule settings.
  implementationSha256:SHA256; configurationSha256:SHA256;
  interpretationConfigSha256?:SHA256;
  analyzeEvidence:AnalyzeEvidence;
}
export function analysisModuleIdentity(module:AnalysisModule) {
  if(!module || typeof module.analyzeEvidence!=='function' ||
    ![module.moduleId,module.moduleVersion].every(x=>typeof x==='string'&&x.length>0&&x.length<=128&&!/[\x00-\x20\x7f]/.test(x)) ||
    ![module.implementationSha256,module.configurationSha256,...(module.interpretationConfigSha256===undefined?[]:[module.interpretationConfigSha256])].every(x=>typeof x==='string'&&/^sha256:[a-f0-9]{64}$/.test(x)))throw new Error('ANALYSIS_MODULE_IDENTITY_REQUIRED');
  return Object.freeze({moduleId:module.moduleId,moduleVersion:module.moduleVersion,implementationSha256:module.implementationSha256,configurationSha256:module.configurationSha256,interpretationConfigSha256:module.interpretationConfigSha256??null});
}
export function emitProgress(context:RunContext,event:StageProgress):void {
  try { context.onProgress?.(freeze(structuredClone(event))); } catch { /* observer only */ }
}
export class AnalysisAdapterError extends Error {
  constructor(public readonly code:'CANCELLED'|'ANALYSIS_TIMEOUT'|'ANALYSIS_MODULE_FAILED') { super(code); }
}
function freeze<T>(v:T): Readonly<T> {
  if (v && typeof v === 'object') { for (const item of Object.values(v)) freeze(item); Object.freeze(v); }
  return v;
}
export async function runAnalysis(bundle: EvidenceBundle, options: AnalysisOptions, module?: AnalysisModule, context: RunContext = {}): Promise<AnalysisResults> {
  // Snapshot before the first await so callers cannot change facts during validation.
  const input = structuredClone(bundle); const settings = structuredClone(options);
  module=module?Object.freeze({...module}):undefined;
  if(module)analysisModuleIdentity(module);
  await validateProducedBundle(input, context); await validateOptions(settings, context);
  emitProgress(context,{stage:'heuristics', status:'running'});
  let result: unknown;
  if (!module) {
    result = {schemaVersion:'0.1.0', findings:[], interpretations:[], aiState:{status:settings.enableAI ? 'unavailable' : 'disabled', validation:'not_run', reason:'Analysis module unavailable'}, stages:[{stage:'heuristics',status:'incomplete',errors:[{stage:'heuristics',code:'ANALYSIS_MODULE_UNAVAILABLE',message:'Malhar analysis module not supplied',affectedScope:'deterministic analysis',retryable:false}]}], limitations:['Deterministic analysis unavailable; no policy pass may be inferred.']};
  } else {
    const signal = context.signal;
    if (signal?.aborted) throw new AnalysisAdapterError('CANCELLED');
    let cancel: (()=>void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const aborted = new Promise<never>((_,reject) => {
      cancel = ()=>reject(new AnalysisAdapterError('CANCELLED'));
      signal?.addEventListener('abort', cancel, {once:true});
      timer = setTimeout(()=>reject(new AnalysisAdapterError('ANALYSIS_TIMEOUT')), safetyProfile.analysis.timeoutMs);
    });
    try { result = await Promise.race([module.analyzeEvidence(freeze(input), freeze(settings)), aborted]); }
    catch (error) { throw error instanceof AnalysisAdapterError ? error : new AnalysisAdapterError('ANALYSIS_MODULE_FAILED'); }
    finally { if (cancel) signal?.removeEventListener('abort', cancel); if (timer) clearTimeout(timer); }
  }
  // In-process module is trusted team code. Race cancellation stops waiting;
  // it cannot kill hostile or synchronous module code. No such code is loaded here.
  const output = structuredClone(result);
  const validated = await validateConsumedAnalysis(output, input, context);
  for(const stage of validated.stages)emitProgress(context,stage);
  if(!validated.stages.some(s=>s.stage==='ai'))emitProgress(context,{stage:'ai',status:'skipped'});
  return validated;
}
