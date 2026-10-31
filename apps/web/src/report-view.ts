import type { InvestigationReport } from '@heurisko/contracts';
export type FileView = { filter:string;status:string;selected:string;page:number;mode:'changes'|'members';side:string;prefix:string;memberPage:number };
export const emptyFileView: FileView = {filter:'',status:'all',selected:'',page:0,mode:'changes',side:'all',prefix:'',memberPage:0};
export function fileRecords(r: InvestigationReport) {
 return [
  ...r.bundle.evidence.filter(e=>e.kind==='artifact_member'||e.kind==='source_member').map(e=>({key:e.evidenceId,path:e.locator.path??'(path not recorded)',side:e.side,state:e.contentState,kind:'member',reason:e.limitations.join(' '),evidenceIds:[e.evidenceId] as string[]})),
  ...r.bundle.coverage.omissions.map((o,i)=>({key:'omission-'+i,path:o.path,side:o.side,state:o.kind,kind:'coverage omission',reason:o.reason,evidenceIds:o.evidenceIds as string[]}))
 ];
}
export function browseFiles(r: InvestigationReport, view: FileView) {
 const query=view.filter.toLowerCase();
 return fileRecords(r).filter(e=>(view.side==='all'||e.side===view.side)&&e.path.startsWith(view.prefix)&&[e.path,e.reason,e.state].join(' ').toLowerCase().includes(query)).sort((a,b)=>a.path.localeCompare(b.path)||a.key.localeCompare(b.key));
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
