import type { InvestigationReport } from '@heurisko/contracts';
export type FileView = { filter:string;status:string;selected:string;page:number;mode:'changes'|'members';side:string;prefix:string;memberPage:number;memberSelected?:string;memberState?:string };
export const emptyFileView: FileView = {filter:'',status:'all',selected:'',page:0,mode:'changes',side:'all',prefix:'',memberPage:0,memberSelected:'',memberState:'all'};
export type FindingsView = { filter:string;page:number;selected:string };
export const emptyFindingsView: FindingsView = {filter:'',page:0,selected:''};
export type CoverageView = {filter:string;page:number};
export const emptyCoverageView: CoverageView = {filter:'',page:0};
export function findingPage(r:InvestigationReport,view:FindingsView,pageSize=30){
 const query=view.filter.toLowerCase(),records=r.analysis.findings.filter(f=>[f.findingId,f.title,f.ruleId,f.severity,f.reviewPriority,f.evidenceConfidence].join(' ').toLowerCase().includes(query));
 const page=Math.max(0,Math.min(view.page,Math.max(0,Math.ceil(records.length/pageSize)-1)));
 const items=records.slice(page*pageSize,(page+1)*pageSize);
 // A filtered-out selection is not replaced by an unrelated finding.
 const selected=view.selected?records.find(f=>f.findingId===view.selected):items[0];
 return {records,page,items,selected};
}
export function fileRecords(r: InvestigationReport) {
 return [
  ...r.bundle.evidence.filter(e=>e.kind==='artifact_member'||e.kind==='source_member').map(e=>({key:e.evidenceId,path:e.locator.path??'(path not recorded)',side:e.side,state:e.contentState,kind:'member',reason:e.limitations.join(' '),evidenceIds:[e.evidenceId] as string[],stage:undefined,bytes:undefined})),
  ...r.bundle.coverage.omissions.map((o,i)=>({key:'omission-'+i,path:o.path,side:o.side,state:o.kind,kind:'coverage omission',reason:o.reason,evidenceIds:o.evidenceIds as string[],stage:o.stage,bytes:o.bytes}))
 ];
}
export function browseFiles(r: InvestigationReport, view: FileView) {
 const query=view.filter.toLowerCase();
 return fileRecords(r).filter(e=>(view.side==='all'||e.side===view.side)&&(!view.memberState||view.memberState==='all'||e.state===view.memberState)&&e.path.startsWith(view.prefix)&&[e.path,e.reason,e.state,e.stage,e.bytes].join(' ').toLowerCase().includes(query)).sort((a,b)=>a.path.localeCompare(b.path)||a.key.localeCompare(b.key));
}
// Direct child directories are virtual presentation groups over retained paths.
// They do not add file/evidence records or establish source correspondence.
export function pathGroups(paths:readonly string[],prefix:string){
 const groups=new Map<string,number>();
 for(const path of paths){if(!path.startsWith(prefix))continue;const rest=path.slice(prefix.length),slash=rest.indexOf('/');if(slash<0)continue;const child=prefix+rest.slice(0,slash+1);groups.set(child,(groups.get(child)??0)+1);}
 return [...groups].map(([path,count])=>({path,count})).sort((a,b)=>a.path.localeCompare(b.path));
}
export function evidenceLabel(e:InvestigationReport['bundle']['evidence'][number]){
 const l=e.locator,range=typeof l.startByte==='number'&&typeof l.endByte==='number'?` · bytes [${l.startByte}, ${l.endByte})`:'';
 return `${e.side} · ${l.path??l.metadataKey??e.kind.replaceAll('_',' ')} · ${e.kind.replaceAll('_',' ')}${l.path && l.metadataKey ? ' · field ' + l.metadataKey : ''}${range}`;
}
export function readingGuide(r: InvestigationReport) {
 return [
  {section:'Source' as const,text:`Source association: ${r.outcomes.sourceAssociation}; ${r.bundle.sourceCandidates.length} retained candidates. Inspect commits, subtrees and conflicts; ordering is not proof.`},
  {section:'Coverage' as const,text:`Analysis completeness: ${r.outcomes.analysisCompleteness}. Coverage records ${r.bundle.coverage.omissions.length} omissions. Inspect stage facts and errors before interpreting findings.`},
  {section:'Files' as const,text:`Correspondence: ${r.outcomes.correspondence}; ${r.bundle.changes.length} recorded file relationships. Follow actual evidence bytes; generated candidates are not explained builds.`},
  {section:'AI' as const,text:`AI: ${r.analysis.aiState.status}. Policy: ${r.outcomes.policyResult}; provenance: ${r.outcomes.provenancePolicy}. These recorded outcomes are independent; no safety conclusion is inferred.`}
 ];
}
// Hidden details and disabled/outside controls must never enter the modal tab ring.
export function modalFocusables(root: HTMLElement): HTMLElement[] {
 return Array.from(root.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')).filter(el=>{
  if(el.closest('[hidden],[inert]') || !el.getClientRects().length)return false;
  let parent=el.parentElement;
  while(parent&&parent!==root){if(parent.tagName==='DETAILS'&&!parent.hasAttribute('open')&&el!==parent.querySelector(':scope > summary'))return false;parent=parent.parentElement;}
  return true;
 });
}
