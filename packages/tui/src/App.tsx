import React,{useEffect,useRef,useState} from 'react';
import {Box,useApp,useStdout} from 'ink';
import * as fs from 'node:fs/promises';
import {basename,join,resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {EvidenceStore,boundedFile,sha256,validateInput,encodeReport,privateDirectory,npmCoordinates,pinnedSourceURL,safeSubdirectory} from '@heurisko/core';
import type {ArtifactInput,InvestigationReport} from '@heurisko/contracts';
import {ReportReader,stages,type EvidenceRead} from '../../../integration/part4/dist/report-reader.js';
import {startInvestigation,type TaskSnapshot} from '../../../integration/part4/dist/investigation-task.js';
import {Panel,Row} from './components/Panel.js';
import {Shell,shellBodyHeight} from './components/Shell.js';
import {DocumentPane,documentLines,type Line} from './components/DocumentPane.js';
import {ProgressBar} from './components/Progress.js';
import {Home} from './screens/Home.js';
import {Overview,overviewGeometry,overviewLines} from './screens/Overview.js';
import {TargetForm,TargetReview} from './screens/TargetForm.js';
import {Workspace,structuredLines} from './screens/Workspace.js';
import {Live,currentStageIndex} from './screens/Live.js';
import {overviewReport,recentReport,type RecentReport} from './view-model.js';
import {NavigationTabs} from './components/NavigationTabs.js';
import {useTerminalInput} from './terminal/use-terminal-input.js';
import {layout} from './terminal/layout.js';
import {safeText,wrap,fit} from './terminal/safe-text.js';
import {editText,graphemes} from './state/text-entry.js';
import {color,type Theme} from './tokens.js';
import {rawDiffLines} from './diff-view.js';
import {reportItems,fileTree,defaultCollapsed,sections,type Item} from './model.js';
import {initialLocation as initial,initialFilters,locationKey,decodeUIState,encodeUIState,type Location} from './state/persistence.js';
const fields=['Package name','Exact version','Archive path','Source repository','Full commit','Subdirectory','Source archive (optional)'];
const options={enableAI:false,analysisProfile:'raw-static-s4-v1'};
const help=[
 'Keyboard: arrows / j k select or scroll. Tab / Shift+Tab changes pane focus.',
 'Enter inspects full width. e opens citation; g follows a related file; s changes evidence side.',
 'Esc returns to exact selection/filter/focus/scroll. q quits application.',
 '1–6 sections; [ ] cycle sections. H Home; I reports; M monitoring.',
 '/ filters current list; Ctrl+U clears entry. Text entry owns ordinary shortcuts.',
 'Ctrl+P searchable supported actions; ? help. x resets per-report UI state.',
 'Findings: a priority, z severity, c confidence, t rule cycles independent filters.',
 'Finding detail: PageDown / PageUp jumps between named document sections.',
 'Files: v tree/flat; d raw unified/side-by-side; Left/Right pan.',
 'Evidence: Tab next citation; s side; p next 4096-byte page; b previous page.',
 'Source: v Candidates/Provenance/Build; n new review with selected target.',
 'Home: Enter new, o open report path. Local source archive is optional replay.',
 'Live: q / Esc / Ctrl+C requests cancel; wait for engine settlement.',
 'Detach/retry/live evidence feed unavailable. Uncertain parser cleanup retains locks.',
 'Copy policy: full values are inert text for manual selection; no OSC52/clipboard writes.',
 'Export, monitoring and current AI inference unavailable in this Part 4 interface.',
];
export function App({storeRoot,reader:provided,theme}:{storeRoot:string;reader?:ReportReader;theme:Theme}) {
 const {exit}=useApp(),{stdout}=useStdout();
 const [size,setSize]=useState({columns:stdout.columns??80,rows:stdout.rows??24});
 const [reader,setReader]=useState(provided),[route,setRoute]=useState(provided?'report':'home');
 const [loc,setLoc]=useState<Location>(initial),[trail,setTrail]=useState<Location[]>([]);
 const sectionLocations=useRef(new Map<string,Location>()),sectionTrails=useRef(new Map<string,Location[]>());
 const reportOrigin=useRef<'home'|'recent'>('home');
 const newOrigin=useRef<{route:string;location:Location;trail:Location[]}|undefined>(undefined);
 const relatedOrigin=useRef<{location:Location;trail:Location[]}|undefined>(undefined);
 const modalReturn=useRef<{entry:string;cursor:number}|undefined>(undefined);
 const [overviewFinding,setOverviewFinding]=useState(0);
 const [helpScroll,setHelpScroll]=useState(0);
 const [modal,setModal]=useState<'help'|'palette'|'identity'|'actions'|null>(null),[filtering,setFiltering]=useState(false);
 const [values,setValues]=useState(['','','','','','','']),[local,setLocal]=useState(false),[field,setField]=useState(0),[cursor,setCursor]=useState(0);
 const [homeFocus,setHomeFocus]=useState(0),[attentionIndex,setAttentionIndex]=useState(0),[homeQuery,setHomeQuery]=useState('');
 const [navMode,setNavMode]=useState<'content'|'global'|'sections'>('content'),[navSelected,setNavSelected]=useState(0);
 const [example,setExample]=useState(0),[operation,setOperation]=useState('Working'),[liveStarted,setLiveStarted]=useState(Date.now()),[liveSelected,setLiveSelected]=useState<number>();
 const [indexProgress,setIndexProgress]=useState<{completed:number;total:number}>();
 const [readingBusy,setReadingBusy]=useState(false);
 const readAbort=useRef<AbortController|undefined>(undefined),operationAbort=useRef(false);
 const [entry,setEntry]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const [reviewOriginal,setReviewOriginal]=useState(''),[reviewSource,setReviewSource]=useState<{path:string;ref:string}>();
 const [request,setRequest]=useState<ArtifactInput>(),[reviewHash,setReviewHash]=useState<string>();
 const [recent,setRecent]=useState<RecentReport[]>([]),[recentIndex,setRecentIndex]=useState(0);
 const [snapshot,setSnapshot]=useState<Readonly<TaskSnapshot>>(),[evidence,setEvidence]=useState<EvidenceRead>();
 const [citation,setCitation]=useState(0),[side,setSide]=useState<'artifact'|'source'>('artifact'),[page,setPage]=useState(0),[rawMode,setRawMode]=useState(false);
 const [previewRead,setPreviewRead]=useState<EvidenceRead>();
 const [diffRead,setDiffRead]=useState<{source:EvidenceRead;artifact:EvidenceRead}>();
 const [collapsed,setCollapsed]=useState<Set<string>>(new Set());
 const [findingFilters,setFindingFilters]=useState(initialFilters);
 const [tree,setTree]=useState(true),[diff,setDiff]=useState<'auto'|'unified'|'side'>('auto');
 const task=useRef<ReturnType<typeof startInvestigation>|undefined>(undefined),quitting=useRef(false),reading=useRef(0);
 const context=useRef({route,busy});context.current={route,busy};
 const saved=useRef<string>(''),inputEpoch=useRef(0);
 const l=layout(size.columns,size.rows),width=Math.max(1,size.columns-4),height=shellBodyHeight(size.rows,size.columns,!!reader&&['report','evidence'].includes(route));
 const homeRecords=recent.filter(r=>(r.label+' '+r.status).toLowerCase().includes(homeQuery.toLowerCase()));
 const attention=recent.filter(r=>r.validated&&r.status!=='Complete scope');
 const overview=reader?overviewReport(reader):undefined;
 const projected=reader?reportItems(reader,loc.section,loc.subtab):[];
 const filtered=loc.section===1&&reader?projected.filter(item=>{const f=reader.report.analysis.findings.find(f=>f.findingId===item.id)!;return (findingFilters.priority==='all'||f.reviewPriority===findingFilters.priority)&&(findingFilters.severity==='all'||f.severity===findingFilters.severity)&&(findingFilters.confidence==='all'||f.evidenceConfidence===findingFilters.confidence)&&(findingFilters.rule==='all'||f.ruleId===findingFilters.rule);}):projected;
 const flatItems=filtered.filter(i=>safeText(i.label+' '+i.id+' '+(i.meta??'')).toLowerCase().includes(loc.query.toLowerCase()));
 const items=loc.section===2&&tree?fileTree(flatItems,collapsed):flatItems;
 const sectionTitle=loc.section===3?'Source / '+['Candidates','Provenance','Build'][loc.subtab]:sections[loc.section]??'Overview';
 const byId=loc.selectedId?items.findIndex(i=>i.id===loc.selectedId):-1;
 const selectedIndex=byId>=0?byId:Math.max(0,Math.min(loc.index,items.length-1));
 const selected=items[selectedIndex];
 const refs=selected?.refs??[];
 useEffect(()=>{let alive=true;setDiffRead(undefined);if(!reader||loc.section!==2||!selected)return;
  const record=selected.refs.find(id=>reader.evidence(id)?.kind==='raw_diff');if(!record)return;
  void Promise.all([reader.readCitation(record,'source',{length:4096}),reader.readCitation(record,'artifact',{length:4096})]).then(([source,artifact])=>{if(alive)setDiffRead({source,artifact});});return()=>{alive=false;};
 },[reader,loc.section,selected?.id]);
 useEffect(()=>{const controller=new AbortController();let alive=true;setPreviewRead(undefined);const id=refs[citation%Math.max(1,refs.length)];
  if(reader&&route==='report'&&loc.section!==0&&l.band==='wide'&&id)void reader.readCitation(id,reader.evidence(id)?.side==='both'?'artifact':undefined,{length:4096,signal:controller.signal}).then(value=>{if(alive)setPreviewRead(value);});
  return()=>{alive=false;controller.abort();};
 },[reader,route,loc.section,selected?.id,citation,l.band]);
 function patch(p:Partial<Location>){setLoc(s=>{
  const next={...s,...p};if(p.detail&&selected)next.selectedId=selected.id;if(p.index!==undefined)next.selectedId=items[p.index]?.id;if(p.query!==undefined)delete next.selectedId;
  if(p.scroll!==undefined){const slots=[...s.scrolls] as [number,number,number];slots[Math.min(2,p.focus??s.focus)]=p.scroll;next.scrolls=slots;}
  if(p.focus!==undefined&&p.scroll===undefined)next.scroll=s.scrolls[Math.min(2,p.focus)]??0;
  return next;
 });}
 function remember(){sectionTrails.current.set(locationKey(loc),trail);sectionLocations.current.set(locationKey(loc),{...loc,selectedId:selected?.id});sectionLocations.current.set(String(loc.section),{...loc,selectedId:selected?.id});}
 function sourceTab(next:number){remember();const value=sectionLocations.current.get('3:'+next)??{...initial(),section:3,subtab:next};setLoc(value);setTrail(sectionTrails.current.get(locationKey(value))??[]);sectionLocations.current.set('3',value);setCitation(value.citation);setNotice('');}

 function switchSection(section:number){setNotice('');remember();const next=sectionLocations.current.get(String(section))??{...initial(),section};setLoc(next);setTrail(sectionTrails.current.get(locationKey(next))??[]);setEvidence(undefined);setCitation(next.citation);}
 function interrupt(){if(task.current){quitting.current=true;task.current.cancel();setNotice('Cancellation requested; waiting for engine settlement. Cleanup is not yet acknowledged.');}else if(context.current.busy){operationAbort.current=true;setNotice('Cancellation requested; finishing bounded local operation.');}else exit();}
 useEffect(()=>{const resize=()=>setSize({columns:stdout.columns??80,rows:stdout.rows??24});stdout.on('resize',resize);process.on('heurisko-interrupt',interrupt);return()=>{stdout.off('resize',resize);process.off('heurisko-interrupt',interrupt);};},[stdout]);
 useEffect(()=>{if(!['home','recent'].includes(route)){setIndexProgress(undefined);return;}let alive=true;(async()=>{
  const result:RecentReport[]=[];
  try{const directory=await fs.opendir(join(storeRoot,'runs'));for await(const report of directory){
   if(result.length>=100)break;if(!report.isDirectory()||!/^report_[a-f0-9]+$/.test(report.name))continue;
   const observations=await fs.opendir(join(storeRoot,'runs',report.name));for await(const item of observations){
    if(result.length>=100)break;if(!item.isFile()||!/^([a-f0-9]{64})\.json$/.test(item.name))continue;
    result.push({id:report.name,ref:'sha256:'+item.name.slice(0,-5),label:'Report '+report.name.slice(7,19),status:'Reading',preview:'Loading retained observation metadata.',validated:false});
   }
  }}catch{/* absent index stays empty; opening an explicit report is still available */}
  if(!alive)return;setRecent([...result]);setIndexProgress(result.length?{completed:0,total:result.length}:undefined);
  const store=new EvidenceStore(storeRoot);for(let i=0;i<result.length&&alive;i++){
   try{const observed=await ReportReader.openFile(store.blobPath(result[i]!.ref),storeRoot);if(observed.reportContentRef!==result[i]!.ref)throw Error('BLOB_HASH_MISMATCH');result[i]=recentReport(observed);}
   catch{result[i]={...result[i]!,status:'Unreadable',preview:'Report metadata could not be validated. Open to inspect the error.'};}
   if(alive){setRecent([...result].sort((a,b)=>(b.createdAt??'').localeCompare(a.createdAt??'')));setIndexProgress({completed:i+1,total:result.length});}
  }
  if(alive)setIndexProgress(undefined);
 })();return()=>{alive=false;};},[storeRoot,reader,route]);
 // UI state is separate from immutable reports and bound to both ID and observation digest.
 const uiPath=reader?join(resolve('.heurisko-tui-state'),reader.report.reportId+'-'+reader.reportContentRef.slice(7)+'.json'):undefined;
 useEffect(()=>{if(!uiPath)return;let alive=true;const epoch=inputEpoch.current;saved.current='loading';(async()=>{
  try{const data=decodeUIState((await boundedFile(uiPath,128*1024)).toString('utf8'));
   if(alive&&inputEpoch.current===epoch){setLoc(data.location);setCitation(data.location.citation);sectionLocations.current=new Map(Object.entries(data.sections));setFindingFilters(data.filters);setTree(data.tree);setCollapsed(new Set(data.collapsed));setDiff(data.diff);setOverviewFinding(data.overviewFinding);}
  }catch(e){if(alive&&inputEpoch.current===epoch){setCollapsed(reader?defaultCollapsed(reader):new Set());if((e as NodeJS.ErrnoException).code!=='ENOENT')setNotice('UI state unavailable or corrupt; reset to defaults. Report unchanged.');}}
  finally{if(alive)saved.current=uiPath;}
 })();return()=>{alive=false;};},[uiPath]);
 useEffect(()=>{if(!uiPath||saved.current!==uiPath||!['report','evidence'].includes(route))return;const timer=setTimeout(()=>{
  const temporary=uiPath+'.pending-'+randomUUID();void privateDirectory(resolve('.heurisko-tui-state')).then(()=>fs.writeFile(temporary,encodeUIState({version:2,location:{...(route==='evidence'?(trail.at(-1)??loc):loc),detail:false},sections:Object.fromEntries(sectionLocations.current),filters:findingFilters,tree,collapsed:[...collapsed].filter(p=>p.length<=1024).slice(-64),diff,overviewFinding}),{mode:0o600,flag:'wx'})).then(()=>fs.rename(temporary,uiPath)).catch(()=>setNotice('UI state could not be saved; report unchanged.')).finally(()=>fs.unlink(temporary).catch(()=>{}));
 },150);return()=>clearTimeout(timer);},[uiPath,loc,route,trail,findingFilters,tree,collapsed,diff,overviewFinding]);
 function beginBusy(label:string){operationAbort.current=false;setOperation(label);setBusy(true);}
 async function open(target:string){beginBusy('Opening saved report');setNotice('Opening and validating retained report…');try{
  const next=await ReportReader.openFile(target.startsWith('sha256:')?new EvidenceStore(storeRoot).blobPath(target):resolve(target),storeRoot);if(target.startsWith('sha256:')&&next.reportContentRef!==target)throw Error('BLOB_HASH_MISMATCH');
  if(operationAbort.current)throw Error('OPERATION_CANCELLED');reportOrigin.current=route==='recent'?'recent':'home';setReader(next);sectionLocations.current.clear();sectionTrails.current.clear();setFindingFilters(initialFilters());setLoc(initial());setTrail([]);setEvidence(undefined);setRoute('report');setNotice('');
 }catch(e){setNotice('Open failed: '+errorCode(e));}finally{setBusy(false);}}
 function newForm(){newOrigin.current={route,location:loc,trail};setNavMode('content');setRoute('new');setLocal(false);setField(0);setCursor(graphemes(values[0]!).length);setNotice('');}
 async function review(){beginBusy('Validating and retaining target');try{
  const source=values[3]?{sourceOverride:{repo:values[3]!,commit:values[4]!,...(values[5]?{subdirectory:values[5]}:{})}}:{};
  if(local&&!values[3])throw Error('LOCAL_SOURCE_REQUIRED');
  const input:ArtifactInput=local?{ecosystem:'local',artifactPath:resolve(values[2]!),analysisOptions:options,...source}:{ecosystem:'npm',packageName:values[0]!,version:values[1]!,analysisOptions:options,...source};
  if(input.ecosystem==='npm')npmCoordinates(input.packageName,input.version);if(input.sourceOverride){pinnedSourceURL(input.sourceOverride.repo,input.sourceOverride.commit);safeSubdirectory(input.sourceOverride.subdirectory??'');}
  let validated=await validateInput(input);let localRef:string|undefined;let sourceSnapshot:{path:string;ref:string}|undefined;
  if(validated.ecosystem==='local'){
   const store=new EvidenceStore(storeRoot),original=validated.artifactPath;localRef=await store.put(await boundedFile(original,32*1024*1024));
   validated={...validated,artifactPath:store.blobPath(localRef),artifactFilename:basename(original)};
   setReviewOriginal(original);
   if(values[6]){const ref=await store.put(await boundedFile(resolve(values[6]!),32*1024*1024));sourceSnapshot={path:store.blobPath(ref),ref};}
  }
  if(operationAbort.current)throw Error('OPERATION_CANCELLED');setReviewSource(sourceSnapshot);setReviewHash(localRef);setRequest(validated);patch({scroll:0});setRoute('review');setNotice('');
 }catch(e){setNotice('Target validation failed: '+errorCode(e));}finally{setBusy(false);}}
 async function start(){if(!request||task.current||busy)return;beginBusy('Verifying reviewed bytes');try{
  if(request.ecosystem==='local'&&sha256(await boundedFile(request.artifactPath,32*1024*1024))!==reviewHash)throw Error('REVIEWED_ARCHIVE_CHANGED');
  if(reviewSource&&sha256(await boundedFile(reviewSource.path,32*1024*1024))!==reviewSource.ref)throw Error('REVIEWED_SOURCE_CHANGED');
  if(operationAbort.current)throw Error('OPERATION_CANCELLED');setLoc(initial());setLiveStarted(Date.now());setLiveSelected(undefined);
  const running=startInvestigation(request,options,{context:{store:new EvidenceStore(storeRoot),...(local&&reviewSource?{sourceArchivePath:reviewSource.path}:{})}});task.current=running;setRoute('live');setNotice('');
  const unsub=running.subscribe(s=>setSnapshot(s));const result=await running.result;unsub();task.current=undefined;
  process.exitCode=result.exitCode;
  if(result.kind==='report'){setReader(await ReportReader.fromReport(structuredClone(result.report) as InvestigationReport,storeRoot));setLoc(initial());setRoute('report');setNotice(result.cancellationRequested?'Cancellation requested; engine settled with retained report. Cleanup acknowledgment is not observable.':'Investigation settled.');}
  else{setRoute('home');setNotice(`${result.code}; cleanup acknowledgment not observable. Check retained parser records before reuse/removal.`);}
  if(quitting.current){process.exitCode=result.kind==='report'?result.exitCode:3;exit();}
 }catch(e){setNotice('Start failed: '+errorCode(e));}finally{setBusy(false);}}
 async function readCitation(offset=page,requestedSide=side,raw=rawMode){if(!reader||!refs.length)return;const token=++reading.current;readAbort.current?.abort();const controller=new AbortController();readAbort.current=controller;setReadingBusy(true);
  const id=refs[citation%refs.length]!;setEvidence(undefined);setNotice('Reading bounded, hash-checked evidence…');
  const data=raw?await reader.readEvidence(id,{offset:offset*4096,length:4096,signal:controller.signal}):await reader.readCitation(id,reader.evidence(id)?.side==='both'?requestedSide:undefined,{offset:offset*4096,length:4096,signal:controller.signal});
  if(token===reading.current){setEvidence(data);setReadingBusy(false);setNotice('');}}
 function cite(){if(!refs.length){setNotice('No recorded evidence references for this selection.');return;}setTrail(s=>[...s,loc]);patch({detail:true,scroll:0});setRoute('evidence');setPage(0);void readCitation(0);}
 const palette=['Home','New investigation','Open report','Recent reports','Monitoring unavailable',...sections.map(s=>'Section '+s),'Export unavailable','AI runtime unavailable'];
 const choices=palette.filter(s=>s.toLowerCase().includes(entry.toLowerCase()));
 useTerminalInput((input,key)=>{
  inputEpoch.current++;
  if(key.ctrl&&input==='c'){interrupt();return;}
  if(busy&&route!=='live')return;
  if(route==='live'){if(input==='q'||key.escape)interrupt();else if(key.tab)patch({focus:loc.focus===0?1:0});else if(key.downArrow||input==='j'){if(loc.focus===0)setLiveSelected(i=>Math.min(9,(i??currentStageIndex(snapshot))+1));else patch({scroll:loc.scroll+1});}else if(key.upArrow||input==='k'){if(loc.focus===0)setLiveSelected(i=>Math.max(0,(i??currentStageIndex(snapshot))-1));else patch({scroll:Math.max(0,loc.scroll-1)});}return;}
  if(modal){if(key.escape){setModal(null);if(modalReturn.current){setEntry(modalReturn.current.entry);setCursor(modalReturn.current.cursor);modalReturn.current=undefined;}return;}if(modal==='help'||modal==='identity'||modal==='actions'){if(input==='q'){exit();return;}if(key.downArrow||input==='j')setHelpScroll(s=>s+1);if(key.upArrow||input==='k')setHelpScroll(s=>Math.max(0,s-1));return;}
   if(key.return){const action=choices[recentIndex%Math.max(1,choices.length)];setModal(null);if(action&&(['Home','New investigation','Open report','Recent reports'].includes(action)||action.startsWith('Section ')))setNavMode('content');if(modalReturn.current){setEntry(modalReturn.current.entry);setCursor(modalReturn.current.cursor);modalReturn.current=undefined;}if(action==='Home')setRoute('home');else if(action==='New investigation')newForm();else if(action==='Open report'){setRoute('open');setEntry('');setCursor(0);}else if(action==='Recent reports')setRoute('recent');else if(action?.startsWith('Section ')){if(reader){setRoute('report');switchSection(sections.indexOf(action.slice(8) as typeof sections[number]));}else setNotice('Open a report first.');}else setNotice(action??'No supported action');return;}
   if(key.downArrow){setRecentIndex(i=>i+1);return;}if(key.upArrow){setRecentIndex(i=>Math.max(0,i-1));return;}
   const edit=editText(entry,cursor,input,key);setEntry(edit.value);setCursor(edit.cursor);return;
  }
  if(key.ctrl&&input==='p'){modalReturn.current={entry,cursor};setEntry('');setCursor(0);setRecentIndex(0);setModal('palette');return;}
  if(route==='new'){
   if(key.escape){const origin=newOrigin.current;if(origin?.route==='report'){setLoc(origin.location);setTrail(origin.trail);setRoute('report');}else setRoute('home');return;}
   if(key.tab){const controls=[-1,...(local?[2,3,4,5,6]:[0,1,3,4,5]),8,7];const at=controls.indexOf(field);const next=controls[(at+(key.shift?-1:1)+controls.length)%controls.length]!;setField(next);setCursor(next>=0&&next<7?graphemes(values[next]!).length:0);return;}
   if((key.ctrl&&input==='t')||(field===-1&&(key.leftArrow||key.rightArrow))){setLocal(v=>!v);if(field!==-1){setField(local?0:2);setCursor(graphemes(values[local?0:2]!).length);}return;}
   if(field===-1){if(key.return){setField(local?2:0);setCursor(graphemes(values[local?2:0]!).length);}return;}
   if(field===8){if(key.upArrow||key.leftArrow||input==='k')setExample(i=>(i+2)%3);else if(key.downArrow||key.rightArrow||input==='j')setExample(i=>(i+1)%3);else if(key.return){const source='examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz';setLocal(example!==2);setValues(example===2?['picocolors','1.1.1','','','','','']:['','','examples/s2/current/inputs/'+(example===0?'picocolors-1.1.1.local-inert-mutation.tgz':'picocolors-1.1.1.tgz'),'https://github.com/alexeyraspopov/picocolors','6f0a4638348ed20633d623ee973f9c9a96f65104','',source]);setField(example===2?0:2);setCursor(0);setNotice(example===0?'Local inert mutation target loaded; no investigation has run.':'Target loaded; review before Start.');}return;}
   if(key.return){void review();return;}
   if(field===7)return;
   const edit=editText(values[field]!,cursor,input,key,1024);setValues(s=>s.map((v,i)=>i===field?edit.value:v));setCursor(edit.cursor);return;
  }
  if(route==='open'){
   if(key.escape){setRoute('home');return;}if(key.return){void open(entry);return;}
   const edit=editText(entry,cursor,input,key,1024);setEntry(edit.value);setCursor(edit.cursor);return;
  }
  if(filtering){if(key.return||key.escape){setFiltering(false);return;}const owner=route==='home'||route==='recent';const edit=editText(owner?homeQuery:loc.query,cursor,input,key);if(owner){setHomeQuery(edit.value);setRecentIndex(0);}else patch({query:edit.value,index:0});setCursor(edit.cursor);return;}
  if(navMode!=='content'){
   if(input==='q'){exit();return;}
   if(key.escape){setNavMode('content');return;}
   if(key.tab){if(navMode==='sections'){if(key.shift){setNavMode('global');setNavSelected(1);}else{setNavMode('content');patch({focus:0});}}else if(route==='report'){if(key.shift){setNavMode('content');patch({focus:loc.section===0?3:refs.length?2:1});}else setNavMode('sections');}else{setNavMode('content');if(route==='home')setHomeFocus(key.shift?3:0);}return;}
   if(key.leftArrow||key.rightArrow){if(navMode==='global')setNavSelected(n=>(n+(key.rightArrow?1:2))%3);else switchSection((loc.section+(key.rightArrow?1:5))%6);return;}
   if(key.return){if(navMode==='global'){setRoute(navSelected===0?'home':navSelected===1?'recent':'monitor');setHomeFocus(navSelected===1?1:0);}setNavMode('content');return;}
  }
  if(input==='q'){exit();return;}
  if(input==='?'){setModal('help');setHelpScroll(0);return;}
  if(input==='H'){setNavMode('content');setRoute('home');return;}if(input==='I'){setNavMode('content');setRoute('recent');setHomeFocus(1);return;}if(input==='M'){setNavMode('content');setRoute('monitor');return;}
  if(input==='i'&&reader){setHelpScroll(0);setModal('identity');return;}
  if(route==='review'){if(key.escape)setRoute('new');else if(key.return)void start();else if(key.downArrow||input==='j')patch({scroll:loc.scroll+1});else if(key.upArrow||input==='k')patch({scroll:Math.max(0,loc.scroll-1)});return;}
  if(route==='evidence'){
   if(key.escape){reading.current++;readAbort.current?.abort();setReadingBusy(false);setRoute('report');setLoc(trail.at(-1)??initial());setTrail(s=>s.slice(0,-1));setEvidence(undefined);setNotice('');return;}
   if(key.tab){setCitation(c=>(c+1)%Math.max(1,refs.length));setPage(0);return;}
   if(input==='s'){const next=side==='artifact'?'source':'artifact';setSide(next);setPage(0);void readCitation(0,next);return;}
   if(input==='r'){setRawMode(x=>!x);setPage(0);void readCitation(0,side,!rawMode);return;}
   if(input==='p'||input==='b'){const next=Math.max(0,page+(input==='p'?1:-1));setPage(next);patch({scroll:0});void readCitation(next);return;}
   if(key.downArrow||input==='j')patch({scroll:loc.scroll+1});if(key.upArrow||input==='k')patch({scroll:Math.max(0,loc.scroll-1)});return;
  }
  if(route==='home'||route==='recent'){
   if(input==='o'){setRoute('open');setEntry('');setCursor(0);return;}
   if(input==='n'){newForm();return;}
   if(input==='/'){setFiltering(true);setCursor(graphemes(homeQuery).length);return;}
   if(key.tab){if(route==='recent'){if(key.shift)setNavMode('global');return;}if(homeFocus===0&&key.shift||homeFocus===3&&!key.shift){setNavMode('global');setNavSelected(0);}else setHomeFocus(i=>(i+(key.shift?3:1))%4);return;}
   if(route==='home'&&homeFocus===0&&(key.downArrow||key.upArrow||input==='j'||input==='k')){if(key.downArrow||input==='j')setHomeFocus(1);else{setNavMode('global');setNavSelected(0);}return;}
   const collection=route==='home'&&homeFocus===2?attention:homeRecords;
   if(key.downArrow||input==='j'){if(route==='home'&&homeFocus===2)setAttentionIndex(i=>Math.max(0,Math.min(collection.length-1,i+1)));else setRecentIndex(i=>Math.max(0,Math.min(collection.length-1,i+1)));return;}
   if(key.upArrow||input==='k'){if(route==='home'&&homeFocus===2)setAttentionIndex(i=>Math.max(0,i-1));else setRecentIndex(i=>Math.max(0,i-1));return;}
   if(key.return){if(route==='home'&&homeFocus===0)newForm();else if(route==='home'&&homeFocus===3)setRoute('monitor');else{const item=collection[route==='home'&&homeFocus===2?attentionIndex:recentIndex];if(item)void open(item.ref);}return;}
   if(key.escape)setRoute('home');return;
  }
  if(route==='monitor'){if(key.escape)setRoute('home');return;}
  if(!reader)return;
  if(input==='x'){sectionLocations.current.clear();sectionTrails.current.clear();setFindingFilters(initialFilters());setTree(true);setCollapsed(defaultCollapsed(reader));setDiff('auto');setOverviewFinding(0);setCitation(0);setNavMode('content');relatedOrigin.current=undefined;setLoc(initial());if(uiPath)void fs.unlink(uiPath).catch(()=>{});setNotice('Per-report UI state reset; report unchanged.');return;}
  if(/^[1-6]$/.test(input)){setNavMode('content');switchSection(Number(input)-1);return;}
  if(input==='['||input===']'){setNavMode('content');switchSection((loc.section+(input==='['?5:1))%6);return;}
  if(input==='/'){setFiltering(true);setCursor(graphemes(loc.query).length);return;}
  if(key.escape){if(!loc.detail&&loc.section===2&&relatedOrigin.current){const origin=relatedOrigin.current;relatedOrigin.current=undefined;setLoc(origin.location);setTrail(origin.trail);return;}if(loc.detail){setLoc(trail.at(-1)??{...loc,detail:false,scroll:0});setTrail(s=>s.slice(0,-1));}else if(loc.section!==0)switchSection(0);else setRoute(reportOrigin.current);return;}
  if(loc.section===1&&['a','z','c','t'].includes(input)){const kind=({a:'priority',z:'severity',c:'confidence',t:'rule'} as const)[input as 'a'|'z'|'c'|'t'];const values=kind==='confidence'?['all','high','limited','unresolved']:kind==='rule'?['all',...new Set(reader.report.analysis.findings.map(f=>f.ruleId))]:['all','high','medium','low','informational','undetermined'];setFindingFilters(s=>({...s,[kind]:values[(values.indexOf(s[kind])+1)%values.length]!}));patch({index:0});return;}
  if(loc.section===0&&!loc.detail){
   if(key.tab){if(loc.focus===0&&key.shift)setNavMode('sections');else if(loc.focus===3&&!key.shift){setNavMode('global');setNavSelected(1);}else{const focus=(loc.focus+(key.shift?3:1))%4;if(overview&&overviewGeometry(size.columns,height,{findingSelected:overviewFinding},overview).linear){const lines=overviewLines(overview,width-4,overviewFinding),anchors=['INDEPENDENT OUTCOMES','PRIORITY FINDINGS','COVERAGE & UNKNOWNS','NEXT ACTIONS'];patch({focus,scroll:Math.max(0,Math.min(lines.length-(height-2),lines.findIndex(l=>l.text===anchors[focus])))});}else patch({focus});}return;}
   if(key.downArrow||input==='j'){if(overview&&overviewGeometry(size.columns,height,{findingSelected:overviewFinding},overview).linear)patch({scroll:loc.scroll+1});else if(loc.focus===1&&overview?.findings.length)setOverviewFinding(i=>Math.min(overview.findings.length-1,i+1));else patch({scroll:loc.scroll+1});return;}
   if(key.upArrow||input==='k'){if(overview&&overviewGeometry(size.columns,height,{findingSelected:overviewFinding},overview).linear)patch({scroll:Math.max(0,loc.scroll-1)});else if(loc.focus===1)setOverviewFinding(i=>Math.max(0,i-1));else patch({scroll:Math.max(0,loc.scroll-1)});return;}
   if(key.return){if(loc.focus===0)switchSection(3);else if(loc.focus===1){const finding=overview?.findings[overviewFinding];switchSection(finding?1:5);if(finding){const list=reportItems(reader,1,0);setLoc({...initial(),section:1,index:Math.max(0,list.findIndex(f=>f.id===finding.findingId)),selectedId:finding.findingId});}}else if(loc.focus===2)switchSection(5);else{setModal('actions');setHelpScroll(0);}return;}
  }
  if(loc.section===1&&loc.detail&&(key.pageDown||key.pageUp)&&selected){
   const lines=documentLines(structuredLines(selected.lines),width-4),anchors=lines.flatMap((line,index)=>line.bold&&line.text.endsWith(':')?[{index,name:line.text.slice(0,-1)}]:[]);
   const next=key.pageDown?anchors.find(a=>a.index>loc.scroll):[...anchors].reverse().find(a=>a.index<loc.scroll);
   if(next){patch({scroll:next.index});setNotice('Finding section: '+next.name);}return;
  }
  if(input==='g'&&loc.section!==2){const change=reader.report.bundle.changes.find(c=>c.evidenceIds.some(id=>refs.includes(id)));if(!change){setNotice('No related file change recorded for this selection.');return;}relatedOrigin.current={location:loc,trail};remember();const fileItems=reportItems(reader,2,0),fileIndex=fileItems.findIndex(i=>i.id===change.changeId);setTree(false);setLoc({...initial(),section:2,index:Math.max(0,fileIndex),selectedId:change.changeId});setTrail([]);setCitation(0);return;}
  if(input==='e'){cite();return;}
  if(key.tab){const count=refs.length?3:2;if(loc.focus===0&&key.shift){setNavMode('sections');return;}patch({focus:(loc.focus+(key.shift?count-1:1))%count});return;}
  if(input==='v'){if(loc.section===3)sourceTab((loc.subtab+1)%3);if(loc.section===2)setTree(s=>!s);return;}
  if(input==='d'&&loc.section===2){setDiff(s=>s==='side'?'unified':'side');setNotice('Diff mode '+(diff==='side'?'unified':'side-by-side')+'; raw evidence remains available with e.');return;}
  if(input==='n'&&loc.section===3&&loc.subtab===0){const candidate=reader.report.bundle.sourceCandidates[Number(selected?.id.split('-')[1])];if(!candidate?.commit){setNotice('No immutable commit recorded for this candidate.');return;}
   const b=reader.report.bundle.input;if(b.ecosystem==='local'){setNotice('Historical local path cannot be replayed implicitly; select retained archive bytes in a new investigation.');newForm();setValues(['','','',candidate.repositoryUrl,candidate.commit,candidate.subdirectory??'','']);setLocal(true);setField(2);return;}
   newOrigin.current={route,location:loc,trail};setLocal(false);setValues([b.packageName,b.version,'',candidate.repositoryUrl,candidate.commit,candidate.subdirectory??'','']);setRoute('new');setField(0);setNotice('New target draft; review and Start create a new report.');return;
  }
  if(key.leftArrow||key.rightArrow){patch({pan:Math.max(0,loc.pan+(key.rightArrow?8:-8))});return;}
  if(key.downArrow||input==='j'){
   if(loc.detail||loc.focus===1||loc.focus===2&&input==='j')patch({scroll:loc.scroll+1});else if(loc.focus===2)setCitation(c=>(c+1)%Math.max(1,refs.length));else patch({index:Math.max(0,Math.min(items.length-1,selectedIndex+1)),scroll:0});return;
  }
  if(key.upArrow||input==='k'){
   if(loc.detail||loc.focus===1||loc.focus===2&&input==='k')patch({scroll:Math.max(0,loc.scroll-1)});else if(loc.focus===2)setCitation(c=>Math.max(0,c-1));else patch({index:Math.max(0,selectedIndex-1),scroll:0});return;
  }
  if(key.return){if(selected?.directory){const id=selected.id;setCollapsed(s=>{const next=new Set(s);if(next.has(id))next.delete(id);else next.add(id);return next;});}else if(loc.focus===2||loc.detail){cite();}else{setTrail(s=>[...s,loc]);patch({detail:true,scroll:0});}return;}
 });
 useEffect(()=>{setLoc(s=>s.citation===citation?s:{...s,citation});if(route==='evidence')void readCitation(0);},[citation]);
 function doc(title:string,lines:readonly (Line|string)[],w=width,h=height,scroll=loc.scroll,focused=true){return <DocumentPane title={title} lines={lines} width={w} height={h} scroll={scroll} focused={focused} theme={theme}/>;}
 const evidenceLines=(read:EvidenceRead|undefined,id:string):Line[]=>{
  const e=reader?.evidence(id);const content=read?.kind==='content'?read.encoding==='utf8'?(read.inertText??'').split('\n'):[`BASE64 bytes: ${read.bytesBase64}`]:[];
  return [{text:id,tone:'accent',bold:true},{text:`${e?.side.toUpperCase()??'UNKNOWN'} / ${e?.locator.path??e?.locator.metadataKey??'Location not recorded'}`},
   ...(read?.kind==='content'?[{text:`RAW ${read.encoding}: [${read.displayedRange.startByte}, ${read.displayedRange.endByte}) / recorded [${read.recordedRange.startByte}, ${read.recordedRange.endByte})`,tone:'accent' as const},{text:`Window truncated: ${read.truncated} / total blob ${read.totalBytes} bytes`,tone:'muted' as const}]:read?.kind==='metadata_only'?[{text:'METADATA ONLY: '+read.reason,tone:'warning' as const}]:[{text:'Reading bounded, hash-checked bytes…',tone:'muted' as const}]),
   {text:''},...content.map(text=>({text})),{text:''},{text:'Method: '+(e?.observationMethod??'Unknown'),tone:'muted'},
   {text:'Availability: '+(e?.contentState??'Unknown'),tone:'muted'},{text:'Verification: '+(e?.verification??'Not recorded'),tone:'muted'},
   {text:'Content digest: '+(e?.contentSha256??'Unknown'),tone:'muted'},...(read?.kind==='content'?[{text:'Member: '+(read.member?.evidenceId??id),tone:'muted' as const},{text:'Content ref: '+read.contentRef,tone:'muted' as const}]:[]),
   ...(e?.limitations??[]).map(text=>({text:'Limitation: '+text,tone:'warning' as const}))];
 };
 let body:React.ReactNode;
 if(modal==='help')body=doc('Keyboard / '+(route==='report'?sections[loc.section]:route),help,width,height,helpScroll);
 else if(modal==='actions'&&overview)body=doc('Report next actions',overview.nextActions.map((text,i)=>`${i+1}. ${text}`),width,height,helpScroll);
 else if(modal==='identity'&&reader)body=doc('Investigation identity',[
  `Report: ${reader.report.reportId}`,`Observation: ${reader.reportContentRef}`,`Subject: ${reader.report.bundle.artifact.packageName??reader.report.bundle.artifact.artifactFilename}`,`Version: ${reader.report.bundle.artifact.version??'Not recorded'}`,`Origin: ${reader.report.bundle.artifact.origin}`,`Filename: ${reader.report.bundle.artifact.artifactFilename}`,`SHA-256: ${reader.report.bundle.artifact.observedSha256}`,`Captured: ${reader.report.bundle.artifact.captureTime}`,`Created: ${reader.report.createdAt}`,`Configuration: ${reader.report.analysisConfigFingerprint}`,
  ...reader.report.bundle.sourceCandidates.flatMap((c,i)=>[`Candidate ${i+1}: ${c.repositoryUrl}`,`Commit: ${c.commit??'Unknown'}`,`Subdirectory: ${c.subdirectory??'(root)'}`,`Association: ${c.association}`]),'Historical — checks have not refreshed.',
 ],width,height,helpScroll);
 else if(modal==='palette')body=<Box width={width} height={height} justifyContent="center" alignItems="flex-start" paddingTop={1}>{doc('Actions / '+entry,choices.map((s,i)=>({text:(i===recentIndex%Math.max(1,choices.length)?'> ':'  ')+s,tone:i===recentIndex%Math.max(1,choices.length)?'accent':'foreground'})),Math.min(width,80),Math.min(height-1,choices.length+4),0)}</Box>;
 else if(busy&&route!=='live')body=<Box width={width} height={height} justifyContent="center" alignItems="flex-start" paddingTop={Math.max(0,Math.floor(height*.25))}><Panel title={operation} width={Math.min(width,86)} height={7} focused theme={theme}><Row width={Math.min(width,86)-4} theme={theme}>{operation}</Row><Box height={1}/><ProgressBar width={Math.min(width,86)-4} theme={theme} label="Working"/><Row width={Math.min(width,86)-4} theme={theme} tone="muted">{operationAbort.current?'Cancellation requested; awaiting local operation.':'Wait for the operation to finish. Ctrl+C requests cancellation.'}</Row></Panel></Box>;
 else if(route==='new')body=<TargetForm columns={size.columns} height={height} theme={theme} local={local} values={values} field={field} cursor={cursor} error={notice.startsWith('Target validation failed')?notice:undefined} example={example}/>;
 else if(route==='review')body=<TargetReview columns={size.columns} height={height} theme={theme} scroll={loc.scroll} lines={[
  request?.ecosystem==='npm'?`Package       ${request.packageName}`:`Archive       ${reviewOriginal||request?.artifactPath||''}`,
  ...(request?.ecosystem==='npm'?[`Version       ${request.version}`]:[]),
  '! Source selection is a comparison target; release binding is not proven.',
  `Source        ${request?.sourceOverride?.repo??'Unknown until source resolution'}`,
  `Commit        ${request?.sourceOverride?.commit??'Unknown'}`,
  `Subdirectory  ${request?.sourceOverride?.subdirectory??'(root)'}`,
  `SHA-256       ${reviewHash??'Unknown until exact-version acquisition'}`,
  ...(reviewHash?['Local snapshot retained; Start uses the reviewed bytes.']:[]),
  ...(reviewSource?[`Source bytes  ${reviewSource.ref} / user asserted`]:[]),
  'AI            Disabled / current inference runtime unavailable',
  `Configuration ${options.analysisProfile}`,
  'Provenance    Not checked / no configured verifier',
 ]}/>;
 else if(route==='open')body=<Box width={width} height={height} justifyContent="center" alignItems="flex-start" paddingTop={1}>{doc('Open saved report',[{text:'Report file or full sha256: observation reference',bold:true},{text:''},{text:entry.slice(0,cursor)+'|'+entry.slice(cursor),tone:'accent'},{text:''},{text:'Enter validates and opens; Esc returns.'},{text:'Missing evidence remains inspectable as metadata.'}],Math.min(width,92),10,0)}</Box>;
 else if(route==='live')body=<Live columns={size.columns} height={height} theme={theme} snapshot={snapshot} selected={liveSelected} focus={loc.focus} scroll={loc.scroll} started={liveStarted}/>;
 else if(route==='monitor')body=<Box width={width} height={height} flexDirection="column"><Row width={width} theme={theme} bold>Monitoring</Row><Row width={width} theme={theme} tone="muted">Selected-package release monitoring / runtime not configured</Row>{doc('Runner & freshness',['Runner: Not configured','Last attempted fetch: Not recorded','Last successful fetch: Not recorded','Last completed analysis: Not recorded','Freshness: Unknown','No watch, schedule, baseline or release history is available.','Monitoring remains unavailable; historical report review is available through Investigations.'],width,height-2,0)}</Box>;
 else if(route==='home')body=<Home columns={size.columns} height={height} theme={theme} active={navMode==='content'} focus={homeFocus} index={recentIndex} attentionIndex={attentionIndex} records={homeRecords} query={homeQuery} loading={indexProgress}/>;
 else if(route==='recent')body=doc('Investigations',[
  ...(homeQuery?['Filter: '+homeQuery,'']:[]),...homeRecords.map((r,i)=>({text:(i===recentIndex?'> ':'  ')+r.label+' / '+r.status,bold:i===recentIndex,tone:i===recentIndex?'accent' as const:'foreground' as const})),
  ...(!homeRecords.length?['No indexed reports in this store. o opens an explicit report.']:['',homeRecords[recentIndex]?.preview??'']),
 ],width,height,Math.max(0,recentIndex-height+6));
 else if(route==='evidence')body=<Box width={width} height={height} flexDirection="column"><Row width={width} theme={theme} bold>Evidence</Row><Row width={width} theme={theme} tone="accent">{`${sections[loc.section]} > ${refs[citation%Math.max(1,refs.length)]??'Unknown'} / Esc restores position`}</Row>{readingBusy?<ProgressBar width={width} theme={theme} label="Reading evidence"/>:null}{doc('Raw citation / '+side,evidenceLines(evidence,refs[citation%Math.max(1,refs.length)]??''),width,height-(readingBusy?3:2),loc.scroll)}</Box>;
 else if(reader&&overview){
  if(loc.section===0&&!loc.detail)body=<Overview columns={size.columns} height={height} state={{focus:navMode==='content'?loc.focus:-1,findingSelected:overviewFinding,overviewScroll:loc.scroll}} scenario={overview} theme={theme}/>;
  else{
   const empty=loc.query||loc.section===1&&Object.values(findingFilters).some(v=>v!=='all')?'No records match this filter. / then Ctrl+U clears it.':loc.section===1?(overview.findingsEvaluated?'No findings recorded within the examined scope.':'Findings not evaluated / analysis unavailable. Review Coverage.'):'No records in this scope. Review stage availability and coverage.';
   let detailLines=structuredLines(selected?.lines??[empty]);
   if(loc.section===2&&diffRead){
    const available=loc.detail||l.band==='narrow'?width-4:width-Math.max(26,Math.floor(width*.24))-5;
    const sideBySide=diff==='side'||diff==='auto'&&available>=86;
    detailLines=[...detailLines,{text:''},...rawDiffLines(diffRead.source,diffRead.artifact,available,sideBySide,loc.pan)];
   }
   const id=refs[citation%Math.max(1,refs.length)],e=id?reader.evidence(id):undefined;
   const support:Line[]=[{text:'Citations / Up–Down selects',tone:'muted'},...refs.map((ref,i)=>({text:(i===citation%refs.length?'> ':'  ')+ref,tone:i===citation%refs.length?'accent' as const:'muted' as const})),{text:''},...(id?evidenceLines(previewRead,id):[{text:'No supporting records attached.',tone:'warning' as const}])];
   const title=sections[loc.section]??'Overview',subtitle=loc.section===3?['[Candidates]  Provenance  Build','Candidates  [Provenance]  Build','Candidates  Provenance  [Build]'][loc.subtab]!:loc.section===2?`${tree?'Tree':'Flat list'} / raw ${diff} byte windows / Left–Right pan`:loc.section===1?Object.entries(findingFilters).map(([k,v])=>k+': '+v).join(' / '):loc.section===4?'Recorded interpretation / separate from deterministic observations':'Recorded scope / stage outcomes / unresolved work';
   body=<Workspace columns={size.columns} height={height} theme={theme} title={title} subtitle={subtitle} active={navMode==='content'} items={items} index={selectedIndex} focus={loc.focus} scroll={loc.scroll} scrolls={loc.scrolls} detail={loc.detail} query={loc.query} refs={refs} citation={citation} detailLines={detailLines} supportLines={support}/>;
  }
 }
 const typing=route==='new'&&field>=0&&field<7||route==='open'||filtering||modal==='palette';
 let contextLabel=modal==='help'?'Keyboard help':modal==='identity'?'Investigation identity':modal==='palette'?'Actions':modal==='actions'?'Report next actions':route==='new'?'New investigation / '+(local?'Local archive':'npm'):route==='report'?sections[loc.section]??'Overview':route==='recent'?'Saved observations':route==='home'?['New investigation','Recent investigations','Needs attention','Monitoring'][homeFocus]!:route;
 let hints=typing?['Type to edit','Tab next','Ctrl+T type','Enter review','Esc back']:route==='live'?['Up/Down stages','Tab details','Ctrl+C cancel']:route==='evidence'?['j/k scroll','Tab citation','s side','p/b page','Esc return']:route==='new'?field===-1?['Left/Right input','Tab fields','Enter edit','Esc back']:field===8?['Arrows example','Enter load','Tab next','Esc back']:['Enter review','Shift+Tab back','Esc cancel']:route==='review'?['Enter Start','j/k scroll','Esc edit']:modal?['j/k scroll','Esc back']:route==='home'?homeFocus===0?['Enter new','Tab panels','o open','? help']:['j/k select','Enter open','Tab panels','/ filter']:route==='report'&&loc.section===0?['Tab focus','Enter inspect','1-6 sections','i identity','? help']:['j/k move','Enter inspect','e evidence','Tab panes','/ filter','? help'];
 if(route==='report'&&loc.section===1&&loc.detail&&!modal)hints=['j/k scroll','PgUp/PgDn sections','e evidence','Esc return'];
 if(busy&&route!=='live')hints=['Ctrl+C cancel','Waiting for operation'];
 if(route==='live')hints.push('q cancel');
 if(navMode!=='content'&&!modal)hints=['Left/Right choose','Enter open','Tab content','Esc back'];
 const conflict=route==='report'&&(loc.section===0||loc.section===3)&&reader?.report.bundle.sourceCandidates.some(c=>c.conflicts.length);
 const footer=filtering?'Filter: '+(route==='home'||route==='recent'?homeQuery:loc.query)+'_':notice||(conflict?'SOURCE CONFLICT / inspect source claims':'');
 return <Shell columns={size.columns} rows={size.rows} theme={theme} route={route} reader={reader} section={loc.section} navFocus={navMode==='global'&&!modal} navSelected={navSelected} sectionFocus={navMode==='sections'&&!modal} context={contextLabel} hints={hints} notice={footer} allowQuit={!typing&&!busy&&route!=='live'}>
 {l.usable?body:doc('Terminal too small',['Resize to at least 60 columns × 20 rows. Context retained.','q quits; an active job cancels and waits for settlement.'],width,height,0)}
 </Shell>;
}
function errorCode(e:unknown){return e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'READ_OR_VALIDATION_FAILED';}
