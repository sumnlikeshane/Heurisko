import type {ReportReader} from '../../../integration/part4/dist/report-reader.js';
import {reportFacts} from '../../../integration/part4/dist/report-reader.js';
export type Item={id:string;label:string;lines:string[];refs:readonly string[];path?:string;meta?:string;directory?:boolean;depth?:number};
export const sections=['Overview','Findings','Files','Source','AI','Coverage'] as const;
const severity=['high','medium','low','informational','undetermined'];
export function reportItems(reader:ReportReader,section:number,subtab:number):Item[] {
 const r=reader.report,b=r.bundle,a=r.analysis,f=reportFacts(reader);
 if(section===0)return [{id:r.reportId,label:'Identity and outcomes',refs:b.artifact.metadataEvidenceId?[b.artifact.metadataEvidenceId]:[],lines:[
  b.changes.some(x=>x.rawEquality==='different')?'Differences recorded; inspect raw evidence.':'Inspect recorded correspondence and coverage.',
  `Report ${r.reportId}`,`Content ${reader.reportContentRef}`,`Artifact ${b.artifact.artifactFilename}`,`SHA-256 ${b.artifact.observedSha256}`,`Captured ${b.artifact.captureTime}`,`Created ${r.createdAt}`,`Configuration ${r.analysisConfigFingerprint}`,
  ...Object.entries(r.outcomes).map(([k,v])=>`${k}: ${v}`),
  ...(f.hasRecordedSourceConflicts?['SOURCE CONFLICT — inspect candidate claims in Source.']:[]),
  `Findings evaluation: ${f.findingsEvaluation}; examined-scope count: ${f.examinedScopeFindingCount??'Unknown'}`,
  `Recorded findings: ${f.recordedFindingCount} (not a safety assessment)`,
  `AI: ${a.aiState.status}; ${a.aiState.reason??'No runtime configured'}`,
  ...b.limitations,...a.limitations,'Next action: inspect Files, source claims and coverage limitations.',
 ]}];
 if(section===1)return [...a.findings].sort((x,y)=>severity.indexOf(x.reviewPriority)-severity.indexOf(y.reviewPriority)||x.findingId.localeCompare(y.findingId)).map(x=>({id:x.findingId,label:x.title,meta:`${x.reviewPriority} priority / ${x.evidenceConfidence} confidence`,refs:[...new Set([...x.evidenceIds,...a.interpretations.filter(i=>i.findingIds.includes(x.findingId)).flatMap(i=>i.evidenceIds)])],lines:[`Observation: ${x.observation}`,`Significance: ${x.whyItMatters}`,`Severity: ${x.severity}`,`Review priority: ${x.reviewPriority}`,`Evidence confidence: ${x.evidenceConfidence}`,`Explanation strength: ${x.explanationStrength}`,...x.evidenceIds.map(id=>`Evidence: ${id}`),...x.limitations.map(s=>`Limitation: ${s}`),...x.nextActions.map(s=>`Next action: ${s}`),`Rule: ${x.ruleId}@${x.ruleVersion}`,`Finding ID: ${x.findingId}`,...a.interpretations.filter(i=>i.findingIds.includes(x.findingId)).flatMap(i=>[`AI hypothesis: ${i.hypothesis}`,`AI reasoning: ${i.reasoningSummary}`,...i.evidenceIds.map(id=>`AI evidence: ${id}`),...i.alternatives.map(v=>`Alternative: ${v}`),...i.missingEvidence.map(v=>`Missing: ${v}`)])]}));
 if(section===2)return b.changes.map(x=>({id:x.changeId,path:x.artifactPath??x.sourcePath,label:x.artifactPath??x.sourcePath??x.changeId,meta:x.status,refs:x.evidenceIds,lines:[`Change ${x.changeId}`,`Artifact path: ${x.artifactPath??'Not recorded'}`,`Source path: ${x.sourcePath??'Not recorded'}`,`Status: ${x.status}`,`Raw equality: ${x.rawEquality}`,`Explanation strength: ${x.explanationStrength}`,...x.notes,'Raw evidence: e opens exact recorded byte spans; s changes side.', 'Normalized view unavailable — no transform was performed.']}));
 if(section===3){
  if(subtab===0)return b.sourceCandidates.map((x,i)=>({id:`candidate-${i}`,label:`Candidate ${i+1} / ${x.commit?.slice(0,12)??'Commit unknown'}`,meta:x.association,refs:x.evidenceIds,lines:[`Repository: ${x.repositoryUrl}`,`Commit: ${x.commit??'Unknown'}`,`Subdirectory: ${x.subdirectory??'(root)'}`,`Association: ${x.association}`,`Snapshot: ${x.sourceSnapshotSha256??'Unknown'}`,`Build context: ${x.buildContextSha256??'Unknown'}`,...x.conflicts.map(c=>`SOURCE CONFLICT: ${c}`),x.commit?'New investigation with this target: n opens a separate review; this report stays immutable.':'New investigation with this target: unavailable — no immutable commit recorded.']}));
  if(subtab===1)return [{id:'provenance',label:'Provenance',meta:b.provenance.status,refs:b.provenance.evidenceIds,lines:[`Cryptographic verification: ${['verified_policy','verified_cryptographic_only'].includes(b.provenance.status)?'Verified':b.provenance.status.replaceAll('_',' ')}`,`Policy acceptance: ${b.provenance.status==='verified_policy'?'Verified for '+b.provenance.policyRef:'Not established'}`,`Reported status: ${b.provenance.status}`,`Artifact binding: ${b.provenance.artifactBinding}`,`Policy: ${b.provenance.policyRef??'Not configured'}`,...b.provenance.limitations,'Cryptographic validity and policy acceptance are separate.']}];
  return [{id:'build-state',label:'Build context',meta:b.stages.find(s=>s.stage==='build')?.status??'not recorded',refs:[],lines:[`Build stage: ${b.stages.find(s=>s.stage==='build')?.status??'not recorded'}`,'Reproduction: No build is executed by this TUI. Inspect recorded evidence for any historical result.','Recipe clues and source maps do not establish build reproduction.']},...b.evidence.filter(x=>x.kind==='build_record').map(x=>({id:x.evidenceId,label:x.locator.path??x.locator.metadataKey??x.evidenceId,refs:[x.evidenceId],lines:[`Method: ${x.observationMethod}`,'Static build clue; reproduction unavailable.',...x.limitations]}))];
 }
 if(section===4)return [{id:'ai-state',label:`AI ${a.aiState.status}`,meta:'Recorded report state',refs:[],lines:[`AI state: ${a.aiState.status}`,`Reason: ${a.aiState.reason??'Not recorded'}`,`Model: ${a.aiState.modelId??'Not configured'}`,`Validation: ${a.aiState.validation}`,'Current inference runtime unavailable; deterministic evidence remains accessible.','Validation does not establish factual truth.']},...a.interpretations.map(x=>({id:x.interpretationId,label:x.hypothesis,refs:x.evidenceIds,lines:[`INTERPRETATION / HYPOTHESIS: ${x.hypothesis}`,x.reasoningSummary,...x.alternatives.map(s=>`Alternative: ${s}`),...x.missingEvidence.map(s=>`Missing: ${s}`),...x.nextActions.map(s=>`Next action: ${s}`),`Model ${x.modelId}; runtime ${x.runtimeId}; prompt ${x.promptVersion}`]}))];
 return [{id:'coverage',label:'Measured coverage and stages',refs:[],lines:[...Object.entries(b.coverage).filter(([k,v])=>typeof v==='number'||typeof v==='boolean').map(([k,v])=>`${({sourceFiles:'Source files recorded',artifactFiles:'Artifact files recorded',comparedFiles:'Compared change records',analyzedBytes:'Analyzed bytes recorded',skippedBytes:'Skipped bytes',unsupportedBytes:'Unsupported bytes',complete:'Raw scope complete'} as Record<string,string>)[k]??k}: ${v}`),'These are recorded scope counts; universal coverage denominator: Unknown.',...b.coverage.limitations]},...[...b.stages,...a.stages].map((s,i)=>({id:`stage-${i}-${s.stage}`,label:s.stage.replaceAll('_',' '),meta:s.status,refs:[],lines:[`Stage: ${s.stage}`,`Status: ${s.status}`,...s.errors.flatMap(e=>[`Diagnostic: ${e.code}`,`Reason: ${e.message}`,`Scope: ${e.affectedScope}`,`Retryable: ${e.retryable}`])]})),...b.coverage.omissions.map((x,i)=>({id:`omission-${i}`,label:`${x.kind} ${x.path}`,refs:x.evidenceIds,lines:[`${x.side}: ${x.path}`,`${x.stage}: ${x.reason}`,`Bytes: ${x.bytes}`]}))];
}

// Report paths remain inert data; this tree never traverses the filesystem.
export function fileTree(items:Item[],collapsed:ReadonlySet<string>):Item[] {
 const rows:Item[]=[],dirs=new Set<string>();
 for(const item of [...items].sort((a,b)=>(a.path??a.id).localeCompare(b.path??b.id))){
  const segments=(item.path??item.id).split('/');let prefix='',hidden=false;
  for(let i=0;i<segments.length-1;i++){
   prefix+=(i?'/':'')+segments[i];const id='directory:'+prefix;
   if(!dirs.has(id)&&!hidden){rows.push({id,label:'  '.repeat(i)+(collapsed.has(id)?'[+] ':'[-] ')+segments[i]+'/',path:prefix,directory:true,depth:i,lines:['Directory: '+prefix,'Enter expands/collapses; no filesystem access.'],refs:[]});dirs.add(id);}
   if(collapsed.has(id))hidden=true;
  }
  if(!hidden)rows.push({...item,depth:segments.length-1,label:'  '.repeat(segments.length-1)+segments.at(-1)});
 }
 return rows;
}

export function defaultCollapsed(reader:ReportReader):Set<string>{
 return new Set(reader.report.bundle.changes.flatMap(c=>{const path=c.artifactPath??c.sourcePath;return path?.includes('/')?['directory:'+path.split('/')[0]]:[];}));
}
