import type {ReportReader} from '../../../integration/part4/dist/report-reader.js';
import {reportFacts} from '../../../integration/part4/dist/report-reader.js';
import {rootLabel,scopeExplanation,type SourceDetails} from './investigation-summary.js';
export type Item={id:string;label:string;lines:string[];refs:readonly string[];path?:string;meta?:string;directory?:boolean;depth?:number;status?:string;root?:boolean};
export const sections=['Overview','Findings','Files','Source','AI','Coverage'] as const;
const severity=['high','medium','low','informational','undetermined'];
export function reportItems(reader:ReportReader,section:number,subtab:number,source?:SourceDetails[]):Item[] {
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
 if(section===2)return b.changes.map(x=>{
  const byteDelta=x.evidenceIds.find(id=>reader.evidence(id)?.observationMethod==='common-prefix-suffix-byte-span-v1');
  const refs=[...new Set([...(byteDelta?[byteDelta]:[]),...x.evidenceIds])];
  return {id:x.changeId,path:x.artifactPath??x.sourcePath,label:x.artifactPath?'Artifact / '+(x.artifactPath.includes('/')?x.artifactPath.split('/').slice(1).join('/'):x.artifactPath):x.sourcePath?'Source / '+(x.sourcePath.includes('/')?x.sourcePath.split('/').slice(1).join('/'):x.sourcePath):x.changeId,status:x.status,meta:`${x.status} / ${x.rawEquality}`,refs,lines:[
   `File: ${x.status} / raw bytes ${x.rawEquality}`,
   ...(x.sourcePath&&x.artifactPath?['Pairing: recorded source and artifact members for this change.']:['Pairing: '+(x.sourcePath?'Source member only':'Artifact member only')+'; '+(x.status==='unresolved'?'other-side absence is not established.':'recorded one-sided comparison.')]),
   ...scopeExplanation(reader),
   `Artifact path: ${x.artifactPath??'No member recorded — not inferred empty'}`,`Source path: ${x.sourcePath??'No member recorded — not inferred empty'}`,
   'Raw difference follows; Enter full inspection, e exact bytes, s switches side in Evidence.',
   `Explanation strength: ${x.explanationStrength}`,`Change: ${x.changeId}`,...x.notes.map(note=>'Stored note: '+note),
   'Normalized view unavailable — no transform was performed.',
  ]};
 });
 if(section===3){
  if(subtab===0)return b.sourceCandidates.map((x,i)=>({id:`candidate-${i}`,label:`Candidate ${i+1} / ${x.commit?.slice(0,12)??'Commit unknown'}`,meta:x.association,refs:source?.[i]?.refs??x.evidenceIds,lines:source?.[i]?.lines??[`Association: ${x.association}`,x.association==='ambiguous'?'Source identity is conflicting; this is not a verified release baseline.':'Candidate source; release binding not proven.','Reading hash-checked candidate basis and manifest values…',`Repository: ${x.repositoryUrl}`,`Commit: ${x.commit??'Unknown'}`,`Subdirectory: ${rootLabel(x.subdirectory)}`,...x.conflicts.map(c=>`SOURCE CONFLICT: ${c}`),'New investigation with this target: n opens a separate draft.']}));
  if(subtab===1)return [{id:'provenance',label:'Provenance',meta:b.provenance.status,refs:b.provenance.evidenceIds,lines:[`Cryptographic verification: ${['verified_policy','verified_cryptographic_only'].includes(b.provenance.status)?'Verified':b.provenance.status.replaceAll('_',' ')}`,`Policy acceptance: ${b.provenance.status==='verified_policy'?'Verified for '+b.provenance.policyRef:'Not established'}`,`Reported status: ${b.provenance.status}`,`Artifact binding: ${b.provenance.artifactBinding}`,`Policy: ${b.provenance.policyRef??'Not configured'}`,...b.provenance.limitations,'Cryptographic validity and policy acceptance are separate.']}];
  return [{id:'build-state',label:'Build context',meta:b.stages.find(s=>s.stage==='build')?.status??'not recorded',refs:[],lines:[`Build stage: ${b.stages.find(s=>s.stage==='build')?.status??'not recorded'}`,'Reproduction: No build is executed by this TUI. Inspect recorded evidence for any historical result.','Recipe clues and source maps do not establish build reproduction.']},...b.evidence.filter(x=>x.kind==='build_record').map(x=>({id:x.evidenceId,label:x.locator.path??x.locator.metadataKey??x.evidenceId,refs:[x.evidenceId],lines:[`Method: ${x.observationMethod}`,'Static build clue; reproduction unavailable.',...x.limitations]}))];
 }
 if(section===4)return [{id:'ai-state',label:`AI ${a.aiState.status}`,meta:'Recorded report state',refs:[],lines:[`AI state: ${a.aiState.status}`,`Reason: ${a.aiState.reason??'Not recorded'}`,`Model: ${a.aiState.modelId??'Not configured'}`,`Validation: ${a.aiState.validation}`,'Current inference runtime unavailable; deterministic evidence remains accessible.','Validation does not establish factual truth.']},...a.interpretations.map(x=>({id:x.interpretationId,label:x.hypothesis,refs:x.evidenceIds,lines:[`INTERPRETATION / HYPOTHESIS: ${x.hypothesis}`,x.reasoningSummary,...x.alternatives.map(s=>`Alternative: ${s}`),...x.missingEvidence.map(s=>`Missing: ${s}`),...x.nextActions.map(s=>`Next action: ${s}`),`Model ${x.modelId}; runtime ${x.runtimeId}; prompt ${x.promptVersion}`]}))];
 return [{id:'coverage',label:'Measured coverage and stages',refs:[],lines:[...Object.entries(b.coverage).filter(([k,v])=>typeof v==='number'||typeof v==='boolean').map(([k,v])=>`${({sourceFiles:'Source files recorded',artifactFiles:'Artifact files recorded',comparedFiles:'Compared change records',analyzedBytes:'Analyzed bytes recorded',skippedBytes:'Skipped bytes',unsupportedBytes:'Unsupported bytes',complete:'Raw scope complete'} as Record<string,string>)[k]??k}: ${v}`),'These are recorded scope counts; universal coverage denominator: Unknown.',...scopeExplanation(reader),...b.coverage.limitations]},...[...b.stages,...a.stages].map((s,i)=>({id:`stage-${i}-${s.stage}`,label:s.stage.replaceAll('_',' '),meta:s.status,refs:[],lines:[`Stage: ${s.stage}`,`Status: ${s.status}`,...s.errors.flatMap(e=>[`Diagnostic: ${e.code}`,`Reason: ${e.message}`,`Scope: ${e.affectedScope}`,`Retryable: ${e.retryable}`])]})),...b.coverage.omissions.map((x,i)=>({id:`omission-${i}`,label:`${x.kind} ${x.path}`,refs:x.evidenceIds,lines:[`${x.side}: ${x.path}`,`${x.stage}: ${x.reason}`,`Bytes: ${x.bytes}`]}))];
}

// Report paths remain inert data; this tree never traverses the filesystem.
export function fileTree(items:Item[],collapsed:ReadonlySet<string>):Item[] {
 const rows:Item[]=[],dirs=new Set<string>();
 for(const item of [...items].sort((a,b)=>(a.path??a.id).localeCompare(b.path??b.id))){
  const segments=(item.path??item.id).split('/');let prefix='',hidden=false;
  for(let i=0;i<segments.length-1;i++){
   prefix+=(i?'/':'')+segments[i];const id='directory:'+prefix;
   if(!dirs.has(id)&&!hidden){
    const children=items.filter(x=>x.path?.startsWith(prefix+'/')),modified=children.filter(x=>x.status==='modified').length;
    const sourceOnly=children.every(x=>x.lines.some(l=>l.startsWith('Pairing: Source member only')));
    const name=i===0?(sourceOnly?'Source root':'Artifact root'):segments[i];
    rows.push({id,label:'  '.repeat(i)+(collapsed.has(id)?'[+] ':'[-] ')+name+'/',meta:`${children.length} records / ${modified} modified`,path:prefix,directory:true,root:i===0,depth:i,
     lines:['Directory: '+prefix,`${children.length} descendant change records; ${modified} modified.`, 'Enter expands/collapses. m jumps directly to the next modified file.', 'Directory selection shows navigation metadata; no file comparison is implied.'],refs:[]});dirs.add(id);
   }
   if(collapsed.has(id))hidden=true;
  }
  if(!hidden)rows.push({...item,depth:segments.length-1,label:'  '.repeat(Math.min(segments.length-1,4))+segments.at(-1)});
 }
 return rows;
}

export function defaultCollapsed(_reader:ReportReader):Set<string>{return new Set();}
