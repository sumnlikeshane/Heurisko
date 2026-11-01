// Explicit development probe of a separately reviewed module; never a product loader.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {EvidenceStore,investigate,sha256,canonicalJSON,boundedFile,encodeReport,writeImmutable,runAnalysis,engineCodeIdentity} from '../packages/core/dist/index.js';
const [moduleArg,workflowArg]=process.argv.slice(2);
if(!moduleArg||!workflowArg)throw Error('EXPLICIT_REVIEWED_MODULE_AND_WORKFLOW_REQUIRED');
const team=resolve(moduleArg),workflow=JSON.parse(await fs.readFile(resolve(workflowArg),'utf8'));
const expected='e8b8116f9960527d0a82e066059d7792c405defe';
const head=execFileSync('git',['-C',team,'rev-parse','HEAD'],{encoding:'utf8'}).trim();if(head!==expected)throw Error('REVIEWED_MODULE_HEAD_CHANGED');
const moduleRoot=join(team,'packages/intelligence'),files={};
for(const dir of ['src','dist'])for(const entry of (await fs.readdir(join(moduleRoot,dir))).sort()){
 if(!/\.(?:ts|js)$/.test(entry))continue;
 const name=dir+'/'+entry,bytes=await boundedFile(join(moduleRoot,name),256*1024);files[name]=sha256(bytes);
 if(dir==='src'&&!entry.endsWith('.d.ts')){
  const tracked=execFileSync('git',['-C',team,'show',expected+':packages/intelligence/'+name],{maxBuffer:256*1024});
  if(sha256(tracked)!==files[name])throw Error('REVIEWED_MODULE_SOURCE_CHANGED');
 }
}
files['package.json']=sha256(await boundedFile(join(moduleRoot,'package.json'),16384));
// Source/exports were statically reviewed: importing declares functions only. No provider adapter is called.
const imported=await import(pathToFileURL(join(moduleRoot,'dist/index.js')).href);
const options={enableAI:false,analysisProfile:'part4-explicit-e8b8116-validation-only-v1'};
const identity={moduleId:'@heurisko/intelligence',moduleVersion:'0.1.0',implementationSha256:sha256(canonicalJSON(files)),configurationSha256:sha256(canonicalJSON({options,resolvedContent:'not supplied'}))};
const module={...identity,analyzeEvidence:imported.analyzeEvidence},out=resolve('examples/part4/user-failures'),checks=[];
for(const item of workflow.reports){
 const raw=await fs.readFile(resolve(item.path));if(sha256(raw)!==item.contentRef)throw Error('WORKFLOW_REPORT_CHANGED');
 const report=JSON.parse(raw),before=canonicalJSON(report.bundle),analysis=await runAnalysis(report.bundle,options,module);
 if(canonicalJSON(report.bundle)!==before)throw Error('BUNDLE_MUTATED');
 const lifecycle=analysis.findings.filter(f=>f.ruleId==='heurisko.manifest.lifecycle-script-change');
 if(lifecycle.length!==(item.name==='local-inert-mutation'?1:0))throw Error('LIFECYCLE_CONTROL_FAILED');
 await writeImmutable(join(out,item.name+'.e8b8116.analysis.json'),Buffer.from(JSON.stringify(analysis,null,2)+'\n'));
 checks.push({name:item.name,inputContentRef:item.contentRef,inputUnchanged:true,findings:analysis.findings.length,lifecycleFindings:lifecycle.length,ai:analysis.aiState.status});
}
const local=workflow.reports.find(r=>r.name==='local-inert-mutation');if(!local)throw Error('LOCAL_WORKFLOW_REQUIRED');
const prior=JSON.parse(await fs.readFile(resolve(local.path))),candidate=prior.bundle.sourceCandidates.find(c=>c.sourceSnapshotSha256),storeRoot=resolve(local.store);
const input={ecosystem:'local',artifactPath:join(storeRoot,'blobs',prior.bundle.artifact.observedSha256.slice(7)),artifactFilename:prior.bundle.artifact.artifactFilename,packageName:'picocolors',version:'1.1.1',sourceOverride:{repo:candidate.repositoryUrl,commit:candidate.commit,subdirectory:candidate.subdirectory??''},analysisOptions:options};
const store=new EvidenceStore(join(out,'module-validation-store'));
const report=await investigate(input,options,{store,sourceArchivePath:join(storeRoot,'blobs',candidate.sourceSnapshotSha256.slice(7)),module});
const bytes=Buffer.from(await encodeReport(report));await writeImmutable(join(out,'local-e8b8116-validation.report.json'),bytes);
const receipt={scope:'Explicit isolated-team module validation, not product acceptance/adoption',moduleHead:head,identity,files,checks,reportId:report.reportId,reportContentRef:sha256(bytes),engine:await engineCodeIdentity(),productModuleAdopted:false,modelExecution:false,targetExecution:false,remaining:['M1 falsely says old/new command values are not retained; producer and reader prove exact retained values.','Final finding-quality/module adoption and joint G3 require coordinated acceptance.','Hosted OpenRouter integration/organizer approval is outside this probe.']};
await writeImmutable(join(out,'module-validation.json'),Buffer.from(JSON.stringify(receipt,null,2)+'\n'));console.log(JSON.stringify(receipt));
