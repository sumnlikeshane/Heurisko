// Early, model-off handshake against an explicit trusted team-module location.
// No package-supplied imports, installation, model calls or external messages.
import * as fs from 'node:fs/promises';
import { resolve,join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { EvidenceStore,decodeBundle,boundedFile,runAnalysis,writeImmutable,sha256,canonicalJSON } from '../packages/core/dist/index.js';
const [bundleFile,storeRoot,receiptFile,explicitTeamModuleRoot]=process.argv.slice(2);
if(!bundleFile||!storeRoot||!receiptFile)throw new Error('EXPECTED_BUNDLE_STORE_RECEIPT');
const bytes=await boundedFile(resolve(bundleFile),8*1024*1024);const bundle=await decodeBundle(bytes.toString('utf8'));const store=new EvidenceStore(resolve(storeRoot));
for(const e of bundle.evidence)if(e.contentState==='retained')await store.get(e.contentRef);
const packageRoot=resolve(explicitTeamModuleRoot??'packages/intelligence');let modulePackage;
try{modulePackage=JSON.parse(await fs.readFile(join(packageRoot,'package.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
const options={enableAI:false,analysisProfile:bundle.input.analysisOptions.analysisProfile};
let result;
if(!modulePackage){
 const unavailable=await runAnalysis(bundle,options);
 result={version:'heurisko-early-handshake-v1',checkedAt:new Date().toISOString(),bundleContentRef:sha256(bytes),producerValidation:'passed',retainedEvidenceVerified:bundle.evidence.filter(e=>e.contentState==='retained').length,expectedPackage:'@heurisko/intelligence',expectedExport:'analyzeEvidence',status:'unavailable',code:'MODULE_NOT_FOUND',actualModuleVersion:null,consumerCalled:false,modelCalled:false,actualConsumerOutput:null,adapterUnavailableOutput:unavailable,contentAccessContract:'sha256:<64 lowercase hex> only; EvidenceStore.get(ref) verifies raw bytes and rejects arbitrary paths. The confirmed M0/M1 consumer currently needs no resolver.',coordination:'Product workspace module absent. A separately reviewed team module can be supplied explicitly. No external message sent.'};
}else{
 if(modulePackage.name!=='@heurisko/intelligence'||typeof modulePackage.version!=='string')throw new Error('TEAM_MODULE_IDENTITY_INVALID');
 const module=await import(pathToFileURL(join(packageRoot,'dist/index.js')).href);
 if(typeof module.analyzeEvidence!=='function')throw new Error('TEAM_EXPORT_MISSING');
 const before=sha256(JSON.stringify(bundle));
 const files={};
 async function digestDirectory(directory,prefix='dist') {
  for(const entry of (await fs.readdir(directory,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
   const path=join(directory,entry.name),key=prefix+'/'+entry.name;
   if(entry.isSymbolicLink())throw new Error('TEAM_MODULE_LINK_REJECTED');
   if(entry.isDirectory())await digestDirectory(path,key);
   else if(entry.isFile()){if(Object.keys(files).length>=128)throw new Error('TEAM_MODULE_FILE_LIMIT');files[key]=sha256(await boundedFile(path,2*1024*1024));}
   else throw new Error('TEAM_MODULE_ENTRY_REJECTED');
  }
 }
 await digestDirectory(join(packageRoot,'dist'));
 files['package.json']=sha256(await boundedFile(join(packageRoot,'package.json'),128*1024));
 files['workspace-pnpm-lock.yaml']=sha256(await boundedFile(resolve('pnpm-lock.yaml'),2*1024*1024));
 const identity={implementationSha256:sha256(canonicalJSON(files)),configurationSha256:sha256(canonicalJSON(options))};
 const analysis=await runAnalysis(bundle,options,{moduleId:modulePackage.name,moduleVersion:modulePackage.version,...identity,analyzeEvidence:module.analyzeEvidence});
 result={version:'heurisko-early-handshake-v2',checkedAt:new Date().toISOString(),bundleContentRef:sha256(bytes),producerValidation:'passed',retainedEvidenceVerified:bundle.evidence.filter(e=>e.contentState==='retained').length,status:'consumer-returned-validated-output',actualModuleVersion:modulePackage.version,moduleIdentity:identity,implementationFiles:files,sourceSha256:sha256(await boundedFile(join(packageRoot,'src/index.ts'),128*1024)),compiledSha256:sha256(await boundedFile(join(packageRoot,'dist/index.js'),128*1024)),inputUnchanged:before===sha256(JSON.stringify(bundle)),consumerCalled:true,enableAI:false,modelExecution:'none in reviewed M0/M1 source',actualConsumerOutput:analysis,coordination:'Explicit reviewed team source, isolated from the product workspace; no resolver invoked, no external message sent.'};
}
await writeImmutable(resolve(receiptFile),Buffer.from(JSON.stringify(result,null,2)+'\n'));console.log(JSON.stringify({status:result.status,consumerCalled:result.consumerCalled,bundleContentRef:result.bundleContentRef,receiptFile}));
