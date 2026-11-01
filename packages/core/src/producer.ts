import { basename } from 'node:path';
import type { ArtifactInput, EvidenceBundle, EvidenceId, Stage, StageRecord } from '@heurisko/contracts';
import { EvidenceStore, boundedFile } from './storage.js';
import { inventoryArchive, type ArchiveInventory } from './archive.js';
import { downloadBytes, pinnedSourceURL, DownloadError } from './network.js';
import { canonicalJSON, sha256, orderCandidates } from './identity.js';
import { memberEvidence, rawCompare, retainJSONEvidence, type LogicalMember } from './comparison.js';
import { safetyProfile } from './safety.js';
import { validateInput, validateProducedBundle } from './validation.js';
import { emitProgress, type RunContext } from './adapter.js';
import { acquireNpm, metadataJSON, type FetchData, type NpmAcquisition } from './npm.js';
import { resolveSources, safeSubdirectory, type SourceResolution } from './sources.js';
import { collectUnverifiedProvenance } from './provenance.js';
export { safeSubdirectory } from './sources.js';

export interface ProducerContext extends RunContext { store?:EvidenceStore; sourceArchivePath?:string; fetchData?:FetchData }
const failedInventory=(ref:string,code:string):ArchiveInventory=>({version:'heurisko-inventory-v1',archiveRef:ref,members:[],complete:false,code,remainingScope:'unknown',knownFiles:0,knownBytes:0});
const stage=(name:Stage,status:StageRecord['status'],code?:string):StageRecord=>({stage:name,status,errors:code?[{stage:name,code,message:code,affectedScope:name,retryable:false}]:[]});
// Capture time belongs to a separate retained observation. Stable claim records
// retain transport/hash/header facts without making time part of comparison IDs.
function stableCapture(value:unknown):unknown {
  if(!value||typeof value!=='object')return value;
  const {captureTime,...facts}=value as Record<string,unknown>;return facts;
}
function commonRoot(inventory:ArchiveInventory):string {
  const roots=new Set(inventory.members.map(m=>m.path.split('/')[0]!));
  if(roots.size!==1)return '';
  const root=[...roots][0]!;
  return inventory.members.some(m=>m.type==='file'&&m.path===root)?'':root;
}
export async function collectEvidence(input:ArtifactInput,context:ProducerContext={}):Promise<EvidenceBundle> {
  const settings=structuredClone(input);await validateInput(settings,context);
  if(settings.ecosystem==='npm'&&context.sourceArchivePath&&!settings.sourceOverride)throw new Error('LOCAL_SOURCE_REPLAY_REQUIRES_OVERRIDE');
  const store=context.store??new EvidenceStore();await store.initialize();
  const notify=(name:Stage,status:StageRecord['status'])=>emitProgress(context,{stage:name,status});
  const fetchData=context.fetchData??downloadBytes;
  notify('resolve_artifact','running');
  let npm:NpmAcquisition|undefined;
  notify('acquire','running');
  let bytes:Buffer;
  try {
    if(settings.ecosystem==='npm')npm=await acquireNpm(settings.packageName,settings.version,store,context.signal,fetchData);
    notify('resolve_artifact','complete');
    bytes=npm?.artifactDownload.bytes??await boundedFile((settings as Extract<ArtifactInput,{ecosystem:'local'}>).artifactPath,safetyProfile.archive.compressedBytes);
  }catch(error){notify('resolve_artifact','failed');notify('acquire','failed');throw error;}
  const artifactRef=await store.put(bytes);const capturedAt=(npm?.artifactDownload.capture.captureTime??new Date().toISOString()).replace(/\.\d{3}Z$/,'Z');
  const filename=npm?.filename??settings.artifactFilename??basename((settings as Extract<ArtifactInput,{ecosystem:'local'}>).artifactPath);
  const retainedInput:ArtifactInput=settings.ecosystem==='local'?{...settings,artifactPath:'retained:'+artifactRef,artifactFilename:filename}:{...settings,artifactFilename:filename};
  const integrity=npm?.integrity.check??{algorithm:'none' as const,status:'not_checked' as const};
  const mismatch=integrity.status==='mismatched';
  const integrityUnavailable=!!npm&&integrity.status!=='matched'&&!mismatch;
  notify('acquire',mismatch?'failed':integrityUnavailable?'incomplete':'complete');
  const parse=async(ref:string)=>{try{return await inventoryArchive(store,ref,context);}catch(e){return failedInventory(ref,e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'PARSER_FAILED');}};
  notify('inventory','running');
  const ai=await parse(artifactRef);
  let manifest:Record<string,any>|undefined,manifestError:string|undefined;
  if(npm) {
    const member=ai.members.find(m=>m.type==='file'&&m.path==='package/package.json');
    try {if(!member)throw new Error('ARTIFACT_MANIFEST_MISSING');manifest=metadataJSON(await store.get(member.contentRef!));
      if(manifest.name!==settings.packageName||manifest.version!==settings.version)manifestError='ARTIFACT_MANIFEST_SUBJECT_MISMATCH';
    }catch(e){manifestError=e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'ARTIFACT_MANIFEST_UNAVAILABLE';}
  }
  notify('source','running');
  const resolution:SourceResolution=npm&&!mismatch?await resolveSources(npm.metadata,manifest,settings.sourceOverride,settings.version,context.signal,fetchData):{version:'heurisko-source-resolution-v1',candidates:settings.sourceOverride?[{repositoryUrl:settings.sourceOverride.repo,commit:settings.sourceOverride.commit,subdirectory:settings.sourceOverride.subdirectory??'',association:'user_supplied',evidenceIds:[],conflicts:[]}]:[],claims:[],...(settings.sourceOverride?{selected:settings.sourceOverride}:{}),limitations:[],ambiguous:false};
  let sourceRef:`sha256:${string}`|undefined,sourceCapture:unknown,sourceError:string|undefined;
  const override=resolution.selected;
  if(override&&!mismatch&&!context.signal?.aborted) {
    safeSubdirectory(override.subdirectory??'');
    const sourceUrl=pinnedSourceURL(override.repo,override.commit);
    try {
      if(context.sourceArchivePath) {
        const source=await boundedFile(context.sourceArchivePath,safetyProfile.archive.compressedBytes);
        sourceRef=await store.put(source);sourceCapture={version:'heurisko-source-capture-v1',origin:'local-source-override',sourceArchiveRef:sourceRef,requestedUrl:sourceUrl,commitBinding:'user-asserted-not-verified'};
      } else {
        const source=await fetchData(sourceUrl,{signal:context.signal,allowedHosts:['codeload.github.com']});sourceRef=await store.put(source.bytes);sourceCapture={...source.capture,origin:'immutable-https-source-candidate',commitBinding:'transport-url-not-git-object-verification'};
      }
    }catch(e){sourceError=e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'SOURCE_ACQUISITION_FAILED';if(e instanceof DownloadError&&e.responseCapture)sourceCapture={version:'heurisko-source-failure-v1',...e.responseCapture};}
  }else sourceError=mismatch?'ARTIFACT_INTEGRITY_MISMATCH':context.signal?.aborted?'CANCELLED':npm?'SOURCE_CANDIDATE_UNAVAILABLE':'SOURCE_OVERRIDE_MISSING';
  let si=failedInventory(sourceRef??'',sourceError??'SOURCE_UNAVAILABLE');
  if(sourceRef)si=await parse(sourceRef);
  const sourcePrefix=[commonRoot(si),override?.subdirectory??''].filter(Boolean).join('/');
  const artifactPrefix=ai.members.some(m=>m.type==='file')&&ai.members.filter(m=>m.type==='file').every(m=>m.path.startsWith('package/'))?'package':'';
  const contextDigest=sha256(canonicalJSON(si.members.map(({contentRef,...m})=>m)));
  const sourcePresent=si.members.some(m=>m.type==='file'&&(!sourcePrefix||m.path.startsWith(sourcePrefix+'/')));
  let sourceManifestError:string|undefined,sourceVersionConflict=false;
  if(npm&&sourcePresent) {
    const member=si.members.find(m=>m.type==='file'&&m.path===[sourcePrefix,'package.json'].filter(Boolean).join('/'));
    try {if(!member)throw new Error('SOURCE_PACKAGE_MANIFEST_MISSING');const m=metadataJSON(await store.get(member.contentRef!));if(m.name!==settings.packageName)sourceManifestError='SOURCE_PACKAGE_SUBJECT_MISMATCH';else if(m.version!==settings.version)sourceVersionConflict=true;}
    catch(e){sourceManifestError=e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'SOURCE_MANIFEST_UNAVAILABLE';}
  }
  const sourceGaps:string[]=[];
  for(const member of si.members)if(member.type==='file') {
    if(member.path.split('/').at(-1)==='.gitmodules'&&member.size>0)sourceGaps.push('SOURCE_SUBMODULES_NOT_MATERIALIZED');
    if(member.size<=1024&&(await store.get(member.contentRef!)).subarray(0,128).toString('utf8').startsWith('version https://git-lfs.github.com/spec/v1\n'))sourceGaps.push('SOURCE_LFS_OBJECT_NOT_MATERIALIZED');
  }
  if(sourceGaps.length)sourceError=sourceGaps[0];
  const sourceReady=!!override&&!!sourceRef&&si.complete&&sourcePresent&&!manifestError&&!sourceManifestError&&!sourceGaps.length;
  for(const c of resolution.candidates)if(sourceRef&&c.repositoryUrl===override?.repo&&c.commit===override.commit&&(c.subdirectory??'')===(override.subdirectory??'')){c.sourceSnapshotSha256=sourceRef;c.buildContextSha256=contextDigest;}
  if(manifestError||sourceManifestError||sourceVersionConflict){resolution.ambiguous=true;for(const c of resolution.candidates){c.association='ambiguous';c.conflicts.push(manifestError??sourceManifestError??'SOURCE_VERSION_LABEL_DIFFERS');}}
  resolution.candidates=orderCandidates(resolution.candidates);
  notify('provenance','running');
  const provenance=npm&&!context.signal?.aborted?await collectUnverifiedProvenance(npm.metadata.dist?.attestations,context.signal,fetchData):undefined;
  const scopeComplete=ai.complete&&sourceReady;
  const bundle:EvidenceBundle={schemaVersion:'0.1.0',fixtureKind:'real_generated',input:retainedInput,artifact:{origin:npm?'registry':'local',artifactFilename:filename,observedSha256:artifactRef,captureTime:capturedAt,integrity,...(settings.packageName?{packageName:settings.packageName}:{}),...(settings.version?{version:settings.version}:{})},
    sourceCandidates:resolution.candidates,
    provenance:provenance?.state??{status:'not_checked',artifactBinding:'not_checked',evidenceIds:[],limitations:[npm?'Provenance acquisition not attempted after cancellation; no verifier integrated.':'Local archive does not inherit registry integrity or provenance; no verifier integrated.']},evidence:[],changes:[],stages:[stage('resolve_artifact','complete'),stage('acquire',mismatch?'failed':integrityUnavailable?'incomplete':'complete',mismatch?'ARTIFACT_INTEGRITY_MISMATCH':integrityUnavailable?'ARTIFACT_INTEGRITY_UNAVAILABLE':undefined),stage('source',sourceReady?'complete':'incomplete',sourceReady?undefined:sourceError??manifestError??sourceManifestError??(!si.complete?si.code:'SOURCE_SUBTREE_MISSING')),stage('provenance','skipped'),stage('inventory',scopeComplete?'complete':'incomplete',scopeComplete?undefined:'INVENTORY_INCOMPLETE'),stage('build','skipped')],
    coverage:{artifactFiles:ai.knownFiles,sourceFiles:si.knownFiles,comparedFiles:0,analyzedBytes:ai.knownBytes+si.knownBytes,skippedBytes:0,unsupportedBytes:0,omissions:[],complete:scopeComplete,limitations:scopeComplete?[]:[!ai.complete||!si.complete?'File/byte totals are known observed members only; remaining archive scope is unknown on failure.':'Inventories retained; selected source/package context is unavailable or conflicting.']},
    limitations:['Static raw comparison only; generated/build/security interpretation is unavailable without Malhar analysis.',npm?'Registry/manifest/tag source claims are candidates, not proof of release correspondence.':'Source override is user supplied; full commit URL is a comparison target, not proof of release correspondence.','No submodule or LFS materialization, target scripts, rebuild, provenance or model execution.']};
  for(const record of bundle.stages.filter(s=>['source','provenance','build'].includes(s.stage)))emitProgress(context,record);
  await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'artifact',locator:{metadataKey:'raw-artifact-archive'},observationMethod:npm?'npm-archive-capture-v1':'local-archive-capture-v1',limitations:[]},{version:'heurisko-archive-descriptor-v1',origin:npm?'registry':'local-input',filename,archiveRef:artifactRef,size:bytes.length});
  if(npm) {
    const meta=await retainEvidenceRecord('registry_metadata','external','exact-npm-version-metadata','bounded-exact-npm-metadata-v1',npm.metadataDownload.bytes);
    bundle.artifact.metadataEvidenceId=meta.evidenceId;
    await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'artifact',locator:{metadataKey:'npm-acquisition'},observationMethod:'volatile-acquisition-observation-v1',limitations:npm.integrity.limitation?[npm.integrity.limitation]:[]},{version:'heurisko-npm-acquisition-v1',registry:'https://registry.npmjs.org',metadataCapture:npm.metadataDownload.capture,artifactCapture:npm.artifactDownload.capture,tarballURL:npm.tarballURL,filename,integrity:npm.integrity});
    for(let i=0;i<resolution.claims.length;i++) {
      const claim=resolution.claims[i]!;const {captures,failedCapture,...facts}=claim;const data={...facts,...(failedCapture?{failedCapture:stableCapture(failedCapture)}:{})};
      if(failedCapture)await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'external',locator:{metadataKey:`source-claim-${i}-failure-observation`},observationMethod:'volatile-acquisition-observation-v1',limitations:['HTTP observation time retained separately from stable source claim.']},failedCapture);
      const captureRecords=[];
      for(let j=0;j<(captures??[]).length;j++){const r=captures![j]!;const e=await retainEvidenceRecord('source_claim','external',`source-claim-${i}-capture-${j}`,'github-tag-observation-v1',r.bytes);await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'external',locator:{metadataKey:`source-claim-${i}-observation-${j}`},observationMethod:'volatile-acquisition-observation-v1',limitations:['Run observation; excluded only from deterministic equivalence, preserved in full report.']},r.capture);captureRecords.push({capture:stableCapture(r.capture),evidenceId:e.evidenceId});}
      const e=await retainJSONEvidence(bundle,store,{kind:'source_claim',side:'external',locator:{metadataKey:`source-claim-${i}-${claim.kind}`},observationMethod:'separate-source-claim-v1',verification:'not_checked',limitations:['Unverified candidate claim; tag observations are time-bound.']},{...data,captures:captureRecords});
      for(const c of bundle.sourceCandidates)if(c.repositoryUrl===claim.repositoryUrl&&(!claim.commit||c.commit===claim.commit))c.evidenceIds.push(e.evidenceId);
    }
    const selection=await retainJSONEvidence(bundle,store,{kind:'source_claim',side:'source',locator:{metadataKey:'source-selection'},observationMethod:'source-candidates-v1',verification:'not_checked',limitations:resolution.limitations},{version:resolution.version,selected:override??null,ambiguous:resolution.ambiguous,sourceCapture:stableCapture(sourceCapture)??null,failure:sourceError??manifestError??sourceManifestError??null});
    for(const c of bundle.sourceCandidates)c.evidenceIds.push(selection.evidenceId);
    if(provenance) {
      const e=await retainJSONEvidence(bundle,store,{kind:'provenance',side:'external',locator:{metadataKey:'provenance-boundary'},observationMethod:'unavailable-verifier-boundary-v1',verification:'not_checked',limitations:provenance.state.limitations},{...provenance.record,...(provenance.record.capture?{capture:stableCapture(provenance.record.capture)}:{})});bundle.provenance.evidenceIds.push(e.evidenceId);
      if(provenance.record.capture)await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'external',locator:{metadataKey:'provenance-capture-observation'},observationMethod:'volatile-acquisition-observation-v1',limitations:['Unverified transport observation; retained separately from stable boundary facts.']},provenance.record.capture);
      if(provenance.material){const raw=await retainEvidenceRecord('provenance','external','raw-unverified-attestation','bounded-unverified-attestation-capture-v1',provenance.material);bundle.provenance.evidenceIds.push(raw.evidenceId);}
    }
    await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'both',locator:{metadataKey:'acquisition-context'},observationMethod:'acquisition-config-v1',limitations:[]},{version:'heurisko-acquisition-config-v1',metadataSha256:npm.metadataDownload.capture.sha256,integrity:npm.integrity.check,claims:resolution.claims.map(({captures,failedCapture,...claim})=>({...claim,failedResponse:failedCapture?{hops:(failedCapture as {hops:unknown}).hops}:null,captures:(captures??[]).map(c=>c.capture.sha256)})),sourceFailure:sourceError??null,provenance:{reason:provenance?.record.reason??'CANCELLED',materialSha256:provenance?.material?sha256(provenance.material):null}});
    if(resolution.candidates.length>1)bundle.limitations.push('Only the selected repository/commit archive is acquired; other repository/commit claims remain unacquired unless separately investigated.');
    bundle.limitations.push(...resolution.limitations,...new Set(sourceGaps),...(sourceVersionConflict?['Source manifest version label differs from the registry subject; raw inventory remains usable but release association is ambiguous.']:[]));
  }
  async function retainEvidenceRecord(kind:import('@heurisko/contracts').EvidenceRecord['kind'],side:import('@heurisko/contracts').EvidenceRecord['side'],metadataKey:string,observationMethod:string,data:Buffer){const {retainEvidence}=await import('./comparison.js');return retainEvidence(bundle,store,{kind,side,locator:{metadataKey},observationMethod,verification:'not_checked',limitations:[]},data);}
  if(sourceCapture)await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'source',locator:{metadataKey:'source-capture-observation'},observationMethod:'volatile-acquisition-observation-v1',limitations:['Original source capture time/transport observation retained; not release-binding proof.']},sourceCapture);
  // Archive content itself is directly resolvable, not just a descriptor.
  const {retainEvidence}=await import('./comparison.js');
  await retainEvidence(bundle,store,{kind:'analysis_note',side:'artifact',locator:{metadataKey:'raw-artifact-bytes'},observationMethod:'raw-archive-sha256-v1',limitations:[]},bytes);
  if(sourceRef)await retainEvidence(bundle,store,{kind:'analysis_note',side:'source',locator:{metadataKey:'raw-source-bytes'},observationMethod:'raw-source-archive-sha256-v1',limitations:[]},await store.get(sourceRef));
  const inventoryRecords=[];
  for(const [side,inventory]of [['artifact',ai],['source',si]] as const) {
    const e=await retainJSONEvidence(bundle,store,{kind:'analysis_note',side,locator:{metadataKey:'archive-inventory'},observationMethod:'bounded-tar-virtual-inventory-v1',limitations:inventory.complete?[]:[inventory.code,'Remaining scope unknown; no invented file/byte denominator.']},inventory);
    inventoryRecords.push(e);
  }
  if(override) {
    const claim=await retainJSONEvidence(bundle,store,{kind:'source_claim',side:'source',locator:{metadataKey:npm?'selected-source-candidate':'explicit-source-override'},observationMethod:npm&&!settings.sourceOverride?'publisher-linked-pinned-source-v1':'user-supplied-pinned-source-v1',verification:'not_checked',limitations:['No cryptographic artifact-to-commit binding established.']},{version:'heurisko-source-claim-v1',...override,sourcePrefix,sourceCapture:stableCapture(sourceCapture)??null,failure:sourceError??null});
    for(const c of bundle.sourceCandidates)if(c.repositoryUrl===override.repo&&c.commit===override.commit&&(c.subdirectory??'')===(override.subdirectory??''))c.evidenceIds.push(claim.evidenceId,inventoryRecords[1]!.evidenceId);
  }
  const artifact=await memberEvidence(bundle,store,ai,'artifact',artifactPrefix),source=await memberEvidence(bundle,store,si,'source',sourcePrefix);
  // Retained broader context outside the selected subtree remains in coverage.
  if(sourcePrefix) {
    const included=new Set(source.map(m=>m.member.path));
    for(const e of bundle.evidence.filter(e=>e.kind==='source_member'&&!included.has(e.locator.path!))) {
      const n=e.locator.endByte??0;bundle.coverage.skippedBytes+=n;bundle.coverage.analyzedBytes-=n;
      bundle.coverage.omissions.push({side:'source',path:e.locator.path!,kind:'skipped',stage:'compare',reason:'Outside explicitly selected package subtree; bytes retained as build context.',bytes:n,evidenceIds:[e.evidenceId]});
    }
    if(bundle.coverage.omissions.length)bundle.coverage.complete=false;
  }
  emitProgress(context,bundle.stages.find(s=>s.stage==='inventory')!);notify('compare','running');
  if(!mismatch)await rawCompare(bundle,store,artifact,source,scopeComplete&&!resolution.ambiguous,scopeComplete&&resolution.ambiguous?'Inventories complete; source association is ambiguous. One-sided records remain unresolved; release-relative absence is not established.':undefined);
  else {bundle.coverage.complete=false;bundle.coverage.limitations.push('Registry digest mismatch: raw bytes retained; correspondence not assessed.');}
  bundle.stages.push(stage('compare',scopeComplete&&bundle.coverage.complete?'complete':'incomplete',scopeComplete&&bundle.coverage.complete?undefined:'COMPARISON_SCOPE_INCOMPLETE'));
  await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'both',locator:{metadataKey:'path-mapping-and-scope'},observationMethod:'explicit-prefix-view-v1',limitations:['Only archive root/package-subtree prefixes are mapped; original paths and bytes remain unchanged.']},{version:'heurisko-path-map-v1',artifactPrefix,sourcePrefix,sourceSubtree:override?.subdirectory??'',complete:scopeComplete});
  notify('compare',scopeComplete&&bundle.coverage.complete?'complete':'incomplete');
  // A cancelled parser still yields validated, retained partial evidence. No more
  // network/parser work is started after cancellation; validation is trusted code.
  try {return await validateProducedBundle(bundle,{...context,signal:undefined});}
  catch(error) {const retainedBundleRef=await store.putJSON(bundle);throw new Error('PRODUCER_CONTRACT_INVALID',{cause:{retainedBundleRef,error}});}
}
