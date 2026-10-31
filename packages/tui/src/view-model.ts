// Read-only renderer projections. No facts, IDs, outcomes or report bytes are rewritten.
import type {InvestigationReport,Finding,Outcomes,SourceCandidate,AIState} from '@heurisko/contracts';
import {reportFacts,type ReportReader,type Immutable} from '../../../integration/part4/dist/report-reader.js';
import type {Tone} from './tokens.js';
export type OverviewReport={name:string;version:string;filename:string;reportId:string;artifactDigest:string;capturedAt:string;takeaway:string;outcomes:Readonly<Outcomes>;source:readonly Immutable<SourceCandidate>[];findings:readonly Immutable<Finding>[];ai:Readonly<AIState>;comparedFiles:number;sourceFiles:number;artifactFiles:number;unknownRemainingScope:boolean;findingsEvaluated:boolean;omissions:string[];nextActions:string[]};
const rank=['high','medium','low','informational','undetermined'];
export function overviewReport(reader:ReportReader):OverviewReport {
 const r=reader.report,b=r.bundle,f=reportFacts(reader),findings=[...r.analysis.findings].sort((x,y)=>rank.indexOf(x.reviewPriority)-rank.indexOf(y.reviewPriority)||x.findingId.localeCompare(y.findingId));
 const gaps=[...b.coverage.omissions.slice(0,1).map(o=>`${o.kind}: ${o.path} — ${o.reason}`),...b.coverage.limitations.slice(0,1)];
 if(!f.examinedScopeFindingCount&&f.findingsEvaluation==='not_evaluated_or_partial')gaps.push('Findings not evaluated for a complete examined scope.');
 const omitted=Math.max(0,b.coverage.omissions.length-1)+Math.max(0,b.coverage.limitations.length-1);
 if(omitted)gaps.push(`${omitted} further recorded scope limitations in Coverage.`);
 if(!gaps.length)gaps.push('No raw coverage omission recorded; check each analysis stage.');
 return {name:b.artifact.packageName??b.artifact.artifactFilename,version:b.artifact.version??'version not recorded',filename:b.artifact.artifactFilename,reportId:r.reportId,artifactDigest:b.artifact.observedSha256,capturedAt:b.artifact.captureTime,outcomes:r.outcomes,source:b.sourceCandidates,findings,ai:r.analysis.aiState,comparedFiles:b.coverage.comparedFiles,sourceFiles:b.coverage.sourceFiles,artifactFiles:b.coverage.artifactFiles,unknownRemainingScope:!b.coverage.complete,findingsEvaluated:f.findingsEvaluation==='recorded_for_examined_scope',omissions:gaps,nextActions:findings[0]?.nextActions.length?[...findings[0].nextActions]:['Inspect raw file changes, source claims and coverage before drawing a conclusion.'],takeaway:r.outcomes.artifactIntegrity==='mismatched'?'The recorded artifact digest differs from the expected digest. Review acquisition evidence.':b.changes.some(c=>c.rawEquality==='different')?'Source and artifact differences are recorded. Review their evidence and the unresolved scope.':'Review the recorded correspondence and coverage. Matching bytes do not establish package safety.'};
}
export type RecentReport={id:string;ref:string;label:string;status:string;capturedAt?:string;createdAt?:string;source?:string;ai?:string;tone?:Tone;preview:string;validated:boolean};
export function recentReport(reader:ReportReader):RecentReport {
 const r=reader.report,a=r.bundle.artifact;
 const conflict=r.bundle.sourceCandidates.some(c=>c.conflicts.length>0);
 return {id:r.reportId,ref:reader.reportContentRef,label:(a.packageName??a.artifactFilename)+(a.version?'@'+a.version:''),status:conflict?'Source conflict':r.outcomes.analysisCompleteness==='complete'?'Complete scope':'Incomplete',capturedAt:a.captureTime,createdAt:r.createdAt,source:r.outcomes.sourceAssociation,ai:r.analysis.aiState.status,tone:conflict||r.outcomes.analysisCompleteness!=='complete'?'warning':'muted',preview:r.analysis.findings[0]?.observation??(r.analysis.stages.some(s=>s.stage==='heuristics'&&s.status==='complete')?'No findings recorded in examined scope.':'Findings not evaluated; inspect raw evidence and coverage.'),validated:true};
}
