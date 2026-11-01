// Explicit host configuration for one reviewed deterministic team module.
// Artifact data, source files, report metadata and HTTP inputs select no code.
import type { AnalysisResults, AnalysisOptions, EvidenceBundle } from '@heurisko/contracts';
import { fileURLToPath } from 'node:url';
import { boundedFile, type EvidenceStore } from './storage.js';
import { canonicalJSON, sha256 } from './identity.js';
import type { AnalysisModule } from './adapter.js';
import { createIntelligenceBoundary, INTELLIGENCE_BOUNDARY_VERSION, INTELLIGENCE_BOUNDARY_LIMITS } from './intelligence-boundary.js';

export const REVIEWED_INTELLIGENCE_SELECTOR='55240e9';
export const REVIEWED_INTELLIGENCE_COMMIT='55240e99409ad44cbd6a978f40873ef410cb1861';
export const REVIEWED_INTELLIGENCE_LOADER_VERSION='heurisko-reviewed-module-loader-v2';

export function configuredAnalysisSelection(value:string|undefined=process.env.HEURISKO_ANALYSIS_MODULE):typeof REVIEWED_INTELLIGENCE_SELECTOR|undefined {
  if(value==='off')return undefined;
  if(value===undefined||value==='')return REVIEWED_INTELLIGENCE_SELECTOR;
  if(value!==REVIEWED_INTELLIGENCE_SELECTOR)throw Error('ANALYSIS_MODULE_SELECTOR_REJECTED');
  return REVIEWED_INTELLIGENCE_SELECTOR;
}
interface LoadSettings {store:EvidenceStore;signal?:AbortSignal;selector?:string;deadlineAt?:number}
let loadedImplementationSha256:string|undefined;
export async function loadConfiguredAnalysisModule(settings:LoadSettings):Promise<AnalysisModule|undefined> {
  if(!configuredAnalysisSelection(settings.selector))return undefined;
  if(settings.signal?.aborted)throw Error('CANCELLED');
  const files:Record<string,string>={};
  const paths:ReadonlyArray<readonly[string,string,number]>=[
    ['reviewedCompiled','../../intelligence-reviewed/dist/index.js',256*1024],
    ['reviewedDeclarations','../../intelligence-reviewed/dist/index.d.ts',128*1024],
    ['reviewedSource','../../intelligence-reviewed/src/index.ts',256*1024],
    ['upstreamSource','../../intelligence-reviewed/provenance/upstream-index.ts',256*1024],
    ['admission','../../intelligence-reviewed/admission.json',128*1024],
    ['reviewedPackage','../../intelligence-reviewed/package.json',128*1024],
    ['reviewedTypeScriptConfig','../../intelligence-reviewed/tsconfig.json',128*1024],
    ['boundary','./intelligence-boundary.js',256*1024],
    ['loader','./reviewed-module.js',128*1024],
    ['adapter','./adapter.js',128*1024],
    ['storage','./storage.js',256*1024],
    ['validation','./validation.js',128*1024],
    ['rootLock','../../../pnpm-lock.yaml',2*1024*1024],
    ['contractSchema','../../contracts/schema/contracts.schema.json',256*1024],
    ['contractValidator','../../contracts/runtime/validate.py',256*1024],
    ['contractSemantics','../../contracts/runtime/semantics.py',256*1024],
  ];
  let admission:any;
  for(const [name,path,limit]of paths){const bytes=await boundedFile(fileURLToPath(new URL(path,import.meta.url)),limit);files[name]=sha256(bytes);if(name==='admission')admission=JSON.parse(bytes.toString('utf8'));if(settings.signal?.aborted)throw Error('CANCELLED');}
  if(admission?.version!=='heurisko-reviewed-intelligence-admission-v1'||admission.upstream?.commit!==REVIEWED_INTELLIGENCE_COMMIT||admission.upstream?.sourceSha256!==files.upstreamSource||admission.derived?.sourceSha256!==files.reviewedSource||admission.derived?.compiledSha256!==files.reviewedCompiled||admission.derived?.declarationsSha256!==files.reviewedDeclarations)throw Error('REVIEWED_MODULE_ADMISSION_MISMATCH');
  const identity={moduleId:'@heurisko/intelligence-reviewed',moduleVersion:'0.1.0-55240e9',implementationSha256:sha256(canonicalJSON({version:REVIEWED_INTELLIGENCE_LOADER_VERSION,files})),configurationSha256:sha256(canonicalJSON({selector:REVIEWED_INTELLIGENCE_SELECTOR,hostSelection:{default:'55240e9',disabled:'off'},upstreamCommit:REVIEWED_INTELLIGENCE_COMMIT,boundaryVersion:INTELLIGENCE_BOUNDARY_VERSION,limits:INTELLIGENCE_BOUNDARY_LIMITS,selection:'retained versioned manifest-delta records and their admitted linked manifest members only',model:'not integrated',providers:'not adopted'}))};
  // ESM import caching cannot relabel already loaded code as newly changed
  // bytes. A configured process must restart after its executable/config changes.
  if(loadedImplementationSha256&&loadedImplementationSha256!==identity.implementationSha256)throw Error('REVIEWED_MODULE_RUNTIME_CHANGED');
  const imported=await import('@heurisko/intelligence-reviewed');
  if(typeof imported.analyzeEvidence!=='function')throw Error('REVIEWED_MODULE_EXPORT_MISSING');
  // Import yields to the event loop. A concurrent build/edit cannot replace the
  // bytes after identity capture and be presented as the reviewed executable.
  for(const [name,path,limit]of paths){if(sha256(await boundedFile(fileURLToPath(new URL(path,import.meta.url)),limit))!==files[name])throw Error('REVIEWED_MODULE_RUNTIME_CHANGED');if(settings.signal?.aborted)throw Error('CANCELLED');}
  loadedImplementationSha256=identity.implementationSha256;
  const analyzeEvidence=imported.analyzeEvidence as (bundle:Readonly<EvidenceBundle>,options:AnalysisOptions,resolvedContent?:readonly {evidenceId:`ev_${string}`;contentRef:string;text:string}[])=>Promise<AnalysisResults>;
  return createIntelligenceBoundary({identity,store:settings.store,analyzeEvidence,signal:settings.signal,deadlineAt:settings.deadlineAt});
}
