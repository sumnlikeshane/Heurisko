import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {findingPage,emptyFindingsView,pathGroups,evidenceLabel,browseFiles,emptyFileView} from '../dist/report-view.js';
const base=JSON.parse(await readFile(new URL('../../../examples/handoff/current/B2.report.json',import.meta.url)));
test('finding pagination reaches every retained finding including records beyond the old 100-match ceiling',()=>{
 const report=structuredClone(base);report.analysis.findings=Array.from({length:157},(_,i)=>({findingId:`finding_${i}`,title:`Finding ${i}`,ruleId:'bounded',severity:i%2?'medium':'high',reviewPriority:'low',evidenceConfidence:'limited'}));
 const reached=[];
 for(let page=0;page<6;page++){const result=findingPage(report,{...emptyFindingsView,page});assert.ok(result.items.length<=30);reached.push(...result.items.map(f=>f.findingId));}
 assert.equal(new Set(reached).size,157);assert.ok(reached.includes('finding_156'));
 const last=findingPage(report,{...emptyFindingsView,page:99});assert.equal(last.page,5);assert.equal(last.items.length,7);
 const filtered=findingPage(report,{filter:'Finding 156',page:0,selected:'finding_2'});assert.equal(filtered.records.length,1);assert.equal(filtered.selected,undefined);
});
test('virtual directory navigation includes only real retained path descendants and permits parent traversal',()=>{
 const paths=['package/a.js','package/lib/x.js','package/lib/y.js','source/src/main.ts','root.txt'];
 assert.deepEqual(pathGroups(paths,''),[{path:'package/',count:3},{path:'source/',count:1}]);
 assert.deepEqual(pathGroups(paths,'package/'),[{path:'package/lib/',count:2}]);assert.deepEqual(pathGroups(paths,'package/lib/'),[]);
 assert.deepEqual(pathGroups(paths,'missing/'),[]);
});
test('evidence labels distinguish side, path, manifest field and real half-open byte ranges',()=>{
 const sample={kind:'manifest_delta',side:'both',locator:{path:'package/package.json',metadataKey:'scripts.install',startByte:5,endByte:12}};
 assert.equal(evidenceLabel(sample),'both · package/package.json · manifest delta · field scripts.install · bytes [5, 12)');
 assert.match(evidenceLabel({...sample,side:'source',locator:{metadataKey:'version'}}),/^source · version/);
 assert.ok(!evidenceLabel({...sample,locator:{path:'x'}}).includes('bytes'));
});
test('member filters keep omissions reachable and distinguish retained, absent and unsupported states',()=>{
 const report=structuredClone(base);report.bundle.coverage.omissions.push({path:'package/unsupported.bin',side:'artifact',kind:'unsupported',stage:'inventory',reason:'BOUNDARY_TEST',bytes:3,evidenceIds:['ev_boundary']});
 const all=browseFiles(report,emptyFileView),unsupported=browseFiles(report,{...emptyFileView,memberState:'unsupported',side:'artifact',prefix:'package/'});
 assert.ok(all.some(e=>e.key==='omission-'+(report.bundle.coverage.omissions.length-1)));
 assert.ok(unsupported.some(e=>e.path==='package/unsupported.bin'));assert.ok(unsupported.every(e=>e.state==='unsupported'&&e.side==='artifact'));
});

test('auxiliary evidence paging restores by observation handle and never merges equal report IDs',async()=>{
 const React=await import('react'),{renderToStaticMarkup}=await import('react-dom/server'),{EvidenceDetail,ReportMemoryProvider}=await import('../dist/render-check.js');
 const report=structuredClone(base),ids=Array.from({length:25},(_,i)=>`ev_memory_${i}`),focus={evidenceId:'ev_memory_parent',kind:'analysis_note',side:'external',locator:{metadataKey:'boundary'},contentState:'unavailable',observationMethod:'synthetic boundary',limitations:[]};
 report.bundle.evidence=[focus,...ids.map((id,i)=>({evidenceId:id,kind:'artifact_member',side:'artifact',locator:{path:`package/member-${i}.txt`},contentState:'unavailable',observationMethod:'synthetic boundary',limitations:[]}))];
 report.bundle.changes=[{changeId:'boundary_change',status:'unresolved',rawEquality:'unknown',explanationStrength:'not_assessed',evidenceIds:[focus.evidenceId,...ids],notes:[]}];
 const first='first-observation:evidence:'+focus.evidenceId,second='second-observation:evidence:'+focus.evidenceId,pages=new Map([[first+':evidence:'+ids.join(','),1]]);
 function render(identity){return renderToStaticMarkup(React.createElement(ReportMemoryProvider,{identity,pages},React.createElement(EvidenceDetail,{handle:'a'.repeat(32),evidence:focus,r:report,onOpen(){},onClose(){},windows:{offsets:{},move(){}},views:new Map()})));}
 const restored=render(first),independent=render(second);assert.match(restored,/member-24.txt/);assert.ok(!restored.includes('member-0.txt'));assert.match(independent,/member-0.txt/);assert.ok(!independent.includes('member-24.txt'));
 assert.equal(report.reportId,base.reportId);assert.match(restored,/21–25/);assert.match(independent,/1–20/);
});

// A manifest path alone cannot distinguish independently recorded field deltas.
test('manifest evidence labels retain both the path and recorded field',async()=>{
 const manifestReport=JSON.parse(await readFile(new URL('../../../examples/handoff/current/B1.report.json',import.meta.url)));
 const e=manifestReport.bundle.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.path&&e.locator.metadataKey);
 assert.ok(e);const label=evidenceLabel(e);assert.ok(label.includes(e.locator.path));assert.ok(label.includes('field '+e.locator.metadataKey));
});

// Explicit synthetic presentation boundary: shared record references are retained;
// this does not represent an engine run or an analysis-module integration.
test('all related changes and stage errors remain reachable through bounded remembered pages',async()=>{
 const React=await import('react'),{renderToStaticMarkup}=await import('react-dom/server'),{Findings,Coverage,ReportMemoryProvider}=await import('../dist/render-check.js');
 const report=structuredClone(base),evidenceId=report.bundle.evidence[0].evidenceId;
 report.fixtureKind=report.bundle.fixtureKind='synthetic_contract';
 report.analysis.findings=[{findingId:'boundary-finding',title:'Synthetic pagination boundary',observation:'Synthetic retained references',whyItMatters:'Presentation only',evidenceIds:[evidenceId],severity:'undetermined',reviewPriority:'low',evidenceConfidence:'unresolved',explanationStrength:'not_assessed',limitations:[],nextActions:[],ruleId:'boundary',ruleVersion:'1'}];
 report.bundle.changes=Array.from({length:53},(_,i)=>({changeId:'boundary-'+i,status:'unresolved',artifactPath:`boundary/file-${i}.txt`,rawEquality:'unknown',explanationStrength:'not_assessed',evidenceIds:[evidenceId],notes:[]}));
 report.bundle.stages=[{stage:'source',status:'incomplete',errors:Array.from({length:53},(_,i)=>({stage:'source',code:'BOUNDARY_'+i,message:'Synthetic stage error '+i,affectedScope:'boundary',retryable:false}))}];report.analysis.stages=[];
 const related=new Set(),errors=new Set();
 for(let page=0;page<3;page++){
  const findingIdentity='boundary:Findings',coverageIdentity='boundary:Coverage',pages=new Map([[findingIdentity+':finding-related:boundary-finding',page],[coverageIdentity+':stage-errors:0:source',page]]);
  const a=renderToStaticMarkup(React.createElement(ReportMemoryProvider,{identity:findingIdentity,pages},React.createElement(Findings,{r:report,view:{filter:'',page:0,selected:'boundary-finding'},onOpen(){},onChange(){}})));
  const b=renderToStaticMarkup(React.createElement(ReportMemoryProvider,{identity:coverageIdentity,pages},React.createElement(Coverage,{r:report,onOpen(){}})));
  const changeIds=[...a.matchAll(/boundary\/file-(\d+)\.txt/g)].map(m=>m[1]),errorIds=[...b.matchAll(/<h3>BOUNDARY_(\d+)<\/h3>/g)].map(m=>m[1]);
  assert.ok(changeIds.length<=20);assert.ok(errorIds.length<=20);changeIds.forEach(id=>related.add(id));errorIds.forEach(id=>errors.add(id));
 }
 assert.equal(related.size,53);assert.equal(errors.size,53);assert.ok(related.has('52'));assert.ok(errors.has('52'));
});

test('selected omissions retain their stage and byte count and recorded request options stay inspectable',async()=>{
 const React=await import('react'),{renderToStaticMarkup}=await import('react-dom/server'),{Files,Overview}=await import('../dist/render-check.js');
 const report=structuredClone(base);report.bundle.coverage.omissions=[{path:'boundary/unsupported.bin',side:'artifact',kind:'unsupported',stage:'inventory',reason:'Synthetic omitted content',bytes:987,evidenceIds:[report.bundle.evidence[0].evidenceId]}];
 const view={...emptyFileView,mode:'members',memberSelected:'omission-0',filter:'inventory'};
 const record=browseFiles(report,view).find(e=>e.key==='omission-0');assert.equal(record.stage,'inventory');assert.equal(record.bytes,987);
 const html=renderToStaticMarkup(React.createElement(Files,{r:report,view,setView(){},onOpen(){},filter:view.filter,setFilter(){},status:'all',setStatus(){},selected:'',setSelected(){},page:0,setPage(){}}));
 assert.match(html,/<dt>Recorded stage<\/dt><dd>inventory<\/dd>/);assert.match(html,/<dt>Omitted bytes<\/dt><dd>987<\/dd>/);
 report.bundle.input.analysisOptions={enableAI:true,analysisProfile:'boundary-profile',trustPolicyRef:'boundary-trust-policy',resourcePolicyRef:'boundary-resource-policy'};
 const overview=renderToStaticMarkup(React.createElement(Overview,{loaded:{report,reportContentRef:'sha256:'+'a'.repeat(64),facts:{findingsEvaluation:'not_evaluated_or_partial'},transport:null},onOpen(){},onSection(){}}));
 for(const value of ['Recorded investigation inputs and requested options','boundary-profile','boundary-trust-policy','boundary-resource-policy','Exact original input record'])assert.ok(overview.includes(value),value);
 assert.match(overview,/<dt>AI request<\/dt><dd>Requested<\/dd>/);assert.ok(overview.includes('AI state: '+report.analysis.aiState.status));
});

// Explicit repository-root selection and absent metadata carry different meanings.
test('source subtree renders repository root distinctly from unrecorded metadata',async()=>{
 const React=await import('react'),{renderToStaticMarkup}=await import('react-dom/server'),{Sources}=await import('../dist/render-check.js');
 const report=JSON.parse(await readFile(new URL('../../../examples/handoff/current/B1.report.json',import.meta.url)));
 assert.ok(report.bundle.sourceCandidates.some(c=>c.subdirectory===''));
 const render=()=>renderToStaticMarkup(React.createElement(Sources,{r:report,onOpen(){}}));
 assert.match(render(),/<dt>Package subtree<\/dt><dd><code>\(repository root\)<\/code><\/dd>/);
 for(const candidate of report.bundle.sourceCandidates)delete candidate.subdirectory;
 const missing=render();assert.match(missing,/<dt>Package subtree<\/dt><dd><code>not recorded<\/code><\/dd>/);
 assert.ok(!missing.includes('(repository root)'));
});
