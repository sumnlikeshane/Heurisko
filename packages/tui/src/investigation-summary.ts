// Read-only explanations. Only hash-checked retained records supply claim values.
import {metadataJSON} from '@heurisko/core';
import type {ReportReader} from '../../../integration/part4/dist/report-reader.js';
export type SourceDetails={lines:string[];refs:string[]};
export const rootLabel=(path:string|undefined)=>path===undefined?'Not recorded':path||'(repository root)';
const conflictLabel=(value:string)=>({
 SOURCE_CLAIMS_CONFLICT:'Repository, commit, or package-directory claims disagree.',
 SOURCE_VERSION_LABEL_DIFFERS:'The package and source manifests report different versions.',
}[value]??value.replaceAll('_',' ').toLowerCase()+'.');
const failureLabel=(value:string)=>({
 SOURCE_TAG_RATE_LIMITED:'The hosting service limited a version-tag lookup.',
 SOURCE_TAG_DISCOVERY_SKIPPED_RATE_LIMIT:'Another version-tag lookup was skipped after rate limiting.',
}[value]??value.replaceAll('_',' ').toLowerCase()+'.');
export function changeCounts(reader:ReportReader):string {
 const c=reader.report.bundle.changes;
 const extra=['added','removed','generated_candidate'].flatMap(status=>{const n=c.filter(x=>x.status===status).length;return n?[`${n} ${status}`]:[];});
 return `${c.filter(x=>x.status==='modified').length} modified / ${c.filter(x=>x.status==='identical').length} identical / ${c.filter(x=>x.status==='unresolved').length} unresolved${extra.length?' / '+extra.join(' / '):''} (${c.length} change records)`;
}
export function findingsAvailability(reader:ReportReader):string[]{
 const r=reader.report,h=r.analysis.stages.find(s=>s.stage==='heuristics');
 return [h?.errors.some(e=>e.code==='ANALYSIS_MODULE_UNAVAILABLE')?'Deterministic findings unavailable — Malhar analysis module not supplied.':`Deterministic findings not fully evaluated — heuristics ${h?.status??'not recorded'}.`,
  ...(h?.errors.flatMap(e=>[`${e.code}: ${e.message}`])??[]),
  `Artifact acquisition: ${r.bundle.stages.find(s=>s.stage==='acquire')?.status??'not recorded'}; integrity ${r.outcomes.artifactIntegrity}.`,
  `Inventory: ${r.bundle.stages.find(s=>s.stage==='inventory')?.status??'not recorded'}; raw comparison ${r.bundle.stages.find(s=>s.stage==='compare')?.status??'not recorded'}.`,
  changeCounts(reader),`Source association: ${r.outcomes.sourceAssociation}.`,
  `AI: ${r.analysis.aiState.status}. Deterministic analysis is a separate module; enabling AI does not supply it.`,
  'Next action: 3 Files, then m next modified file; 4 Source explains association; 6 Coverage has stage diagnostics.',
  'No clean-result or policy pass may be inferred.'];
}
export function scopeExplanation(reader:ReportReader):string[]{
 const b=reader.report.bundle;
 return b.coverage.complete&&b.sourceCandidates.some(c=>c.association==='ambiguous')&&b.changes.some(c=>c.status==='unresolved')?[
  'Raw inventory complete; source association remains ambiguous. One-sided records stay unresolved; release-relative absence is not established.',
  ...(b.changes.some(c=>c.notes.includes('Missing member cannot establish absence in an incomplete inventory.'))?['Historical wording caveat: stored notes say incomplete inventory. Both raw inventories/stages are complete here; the producer also used that message when ambiguous source association blocked absence conclusions. Original notes are preserved below.']:[]),
 ]:[];
}
export async function sourceDetails(reader:ReportReader):Promise<SourceDetails[]> {
 const b=reader.report.bundle,records=b.evidence.filter(e=>e.kind==='source_claim');
 // Each record is bounded; no URL/locator is used for filesystem or network access.
 const values=await Promise.all(records.slice(0,64).map(async e=>{
  const read=await reader.readEvidence(e.evidenceId,{length:16384});
  if(read.kind!=='content'||read.truncated)return {e,reason:read.kind==='metadata_only'?read.reason:'READ_LIMIT'};
  try{return {e,data:metadataJSON(Buffer.from(read.bytesBase64,'base64'))};}catch{return {e,reason:'INVALID_RECORD'};}
 }));
 const selection=values.find(x=>x.data?.version==='heurisko-source-resolution-v1');
 const explicit=values.find(x=>x.data?.version==='heurisko-source-claim-v1');
 const target=selection?.data?.selected??(explicit?.data?{repo:explicit.data.repo,commit:explicit.data.commit,subdirectory:explicit.data.subdirectory}:undefined);
 const version=b.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='version');
 let labels:string|undefined;let labelRefs:string[]=[];let labelFailure:string|undefined;
 if(version){
  labelRefs=[version.evidenceId];
  const [s,a]=await Promise.all([reader.readCitation(version.evidenceId,'source'),reader.readCitation(version.evidenceId,'artifact')]);
  if(s.kind==='content'&&a.kind==='content'&&!s.truncated&&!a.truncated){
   if(s.encoding!=='utf8'||a.encoding!=='utf8')labelFailure='NON_UTF8';
   else try{const decoder=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true});const sv=JSON.parse(decoder.decode(Buffer.from(s.bytesBase64,'base64'))),av=JSON.parse(decoder.decode(Buffer.from(a.bytesBase64,'base64')));if(typeof sv==='string'&&typeof av==='string'){labels=`Version labels: artifact ${av}; selected source ${sv}. Evidence ${version.evidenceId} (e opens exact values; s switches side).`;labelRefs=[version.evidenceId];}else labelFailure='INVALID_VERSION_VALUE';}catch{labelFailure='INVALID_VERSION_VALUE';}
  }else labelFailure=([['source',s],['artifact',a]] as const).flatMap(([side,read])=>read.kind==='metadata_only'?[`${side}: ${read.reason}`]:read.truncated?[`${side}: READ_LIMIT`]:[]).join('; ');
 }
 if(!labels&&!version){
  const pair=b.changes.find(c=>c.artifactPath?.split('/').at(-1)==='package.json'&&c.sourcePath?.split('/').at(-1)==='package.json');
  const members=pair?.evidenceIds.map(id=>reader.evidence(id));
  const s=members?.find(e=>e?.kind==='source_member'),a=members?.find(e=>e?.kind==='artifact_member');
  if(s&&a){const reads=await Promise.all([reader.readEvidence(s.evidenceId,{length:16384}),reader.readEvidence(a.evidenceId,{length:16384})]);
   if(reads.every(r=>r.kind==='content'&&!r.truncated))try{
    const [sv,av]=reads.map(r=>r.kind==='content'?metadataJSON(Buffer.from(r.bytesBase64,'base64')).version:undefined);
    if(typeof sv==='string'&&typeof av==='string'){labels=`Version labels: artifact ${av}; selected source ${sv}. These labels do not establish provenance.`;labelRefs=[a.evidenceId,s.evidenceId];}
   }catch{/* unreadable manifests remain unknown */}
  }
 }
 return b.sourceCandidates.map(c=>{
  const compared=!!target&&target.repo===c.repositoryUrl&&target.commit===c.commit&&(target.subdirectory??'')===(c.subdirectory??'');
  const claims=values.filter(x=>c.evidenceIds.includes(x.e.evidenceId)&&x.data?.kind);
  const unavailable=values.filter(x=>c.evidenceIds.includes(x.e.evidenceId)&&x.reason);
  const failures=[...new Set(claims.map(x=>x.data?.failure).filter((v):v is string=>typeof v==='string'))];
  const lines=[
   `Association ${c.association}: ${c.association==='ambiguous'?'Conflicting claims; release source is unconfirmed.':'Recorded source association; see its evidence and independent provenance status.'}`,
   ...(compared?[`Selected comparison target: ${target.repo} / ${target.commit??'Commit unknown'} / ${rootLabel(target.subdirectory)}. Retained selection record ${selection?.e.evidenceId??explicit?.e.evidenceId}.`,labels??'Version check: manifest values unavailable.',...(labelFailure?[`Version citation unavailable: ${version?.evidenceId} / ${labelFailure}. No version label is inferred from another manifest.`]:[])]:[]),
   ...(claims.length?[`Recorded claim basis: ${[...new Set(claims.map(x=>x.data!.kind))].join(', ')}. These claims do not independently verify release correspondence.`]:[]),
   ...c.conflicts.map(code=>`${code}: ${conflictLabel(code)}`),
   ...(c.sourceSnapshotSha256?[]:['Source snapshot digest is not recorded for this candidate. Inspect source-member records and stage coverage for acquired/comparable scope.']),
   `Package integrity: ${b.artifact.integrity.status}; origin ${b.artifact.origin}. This does not verify the source.`,
   `Provenance: ${b.provenance.status}; build stage ${b.stages.find(s=>s.stage==='build')?.status??'not recorded'}.`,
   ...(failures.length?[`Tag lookup limited: ${failures.map(code=>`${code}: ${failureLabel(code)}`).join(' ')} This is not evidence that the tag is absent.`]:[]),
   ...unavailable.map(x=>`Claim bytes unavailable: ${x.e.evidenceId} / ${x.reason}. Claim values and selection basis are not inferred from missing bytes.`),
   ...(records.length>64?[`${records.length-64} further source claim records were not read by this bounded summary; inspect their evidence separately.`]:[]),
   c.conflicts.length?'Next: press e to inspect the conflicting evidence.':'Next: press e to inspect the source claims.',
   `Repository: ${c.repositoryUrl}`,`Commit: ${c.commit??'Not recorded'}`,`Subdirectory: ${rootLabel(c.subdirectory)}`,
   'New investigation with this target: n opens a separate draft; the historical report is unchanged.',
  ];
  return {lines,refs:[...new Set([...(compared?labelRefs:[]),...c.evidenceIds])]};
 });
}
