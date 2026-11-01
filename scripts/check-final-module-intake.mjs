// Explicit trusted-team intake only. This is not a product module resolver.
import * as fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {dirname,join,relative,resolve,sep} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import ts from '../node_modules/typescript/lib/typescript.js';
import {EvidenceStore,boundedFile,canonicalJSON,decodeReportBytes,runAnalysis,sha256,validateConsumedAnalysis,writeImmutable} from '../packages/core/dist/index.js';
import {ReportReader} from '../integration/part4/dist/report-reader.js';

const repository=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const limits={files:128,fileBytes:2*1024*1024,totalBytes:8*1024*1024};
const fail=code=>{throw Error(code);};
const inside=(root,path)=>path===root||path.startsWith(root+sep);

// Hash every supplied compiled/config/source byte, then audit the emitted ESM
// import graph with the existing TypeScript parser. No regexp guesses at imports.
export async function compiledClosure(packageRoot) {
  packageRoot=resolve(packageRoot);const files={},texts=new Map();let total=0;
  const rootInfo=await fs.lstat(packageRoot);if(!rootInfo.isDirectory()||rootInfo.isSymbolicLink())fail('MODULE_DIRECTORY_REJECTED');
  async function walk(dir,prefix) {
    const info=await fs.lstat(dir);if(!info.isDirectory()||info.isSymbolicLink())fail('MODULE_DIRECTORY_REJECTED');
    for(const item of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
      const path=join(dir,item.name),key=prefix+'/'+item.name;
      if(item.isSymbolicLink())fail('MODULE_LINK_REJECTED');
      if(item.isDirectory())await walk(path,key);
      else if(item.isFile()) {
        if(Object.keys(files).length>=limits.files)fail('MODULE_FILE_LIMIT');
        const bytes=await boundedFile(path,limits.fileBytes);total+=bytes.length;if(total>limits.totalBytes)fail('MODULE_BYTE_LIMIT');
        files[key]=sha256(bytes);if(key.startsWith('dist/')&&key.endsWith('.js'))texts.set(key,bytes.toString('utf8'));
      } else fail('MODULE_ENTRY_REJECTED');
    }
  }
  await walk(join(packageRoot,'dist'),'dist');await walk(join(packageRoot,'src'),'src');
  for(const name of ['package.json','tsconfig.json'])files[name]=sha256(await boundedFile(join(packageRoot,name),128*1024));
  const pkg=JSON.parse(await boundedFile(join(packageRoot,'package.json'),128*1024));
  if(pkg.name!=='@heurisko/intelligence'||typeof pkg.version!=='string'||pkg.type!=='module'||(pkg.exports?.['.']??pkg.exports)!=='./dist/index.js')fail('MODULE_PACKAGE_IDENTITY_REJECTED');
  if(!texts.has('dist/index.js'))fail('MODULE_ENTRY_MISSING');
  const imports=[];
  for(const [name,text]of texts) {
    const ast=ts.createSourceFile(name,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
    if(ast.parseDiagnostics.length)fail('MODULE_JS_PARSE_FAILED');
    const record=specifier=>{
      if(!ts.isStringLiteralLike(specifier))fail('MODULE_DYNAMIC_IMPORT_REJECTED');
      const value=specifier.text;
      if(!value.startsWith('./')&&!value.startsWith('../'))fail('MODULE_EXTERNAL_IMPORT_REJECTED');
      const target=resolve(packageRoot,dirname(name),value);
      if(!inside(join(packageRoot,'dist'),target))fail('MODULE_IMPORT_ESCAPE_REJECTED');
      const targetName=relative(packageRoot,target).split(sep).join('/');
      if(!texts.has(targetName))fail('MODULE_IMPORT_NOT_IN_CLOSURE');
      imports.push({from:name,to:targetName});
    };
    const visit=node=>{
      if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier)record(node.moduleSpecifier);
      if(ts.isCallExpression(node)) {
        if(node.expression.kind===ts.SyntaxKind.ImportKeyword){if(node.arguments.length!==1)fail('MODULE_DYNAMIC_IMPORT_REJECTED');record(node.arguments[0]);}
        if(ts.isIdentifier(node.expression)&&['require','eval','Function'].includes(node.expression.text))fail('MODULE_INDIRECT_CODE_REJECTED');
        if(ts.isPropertyAccessExpression(node.expression)&&['getBuiltinModule','createRequire'].includes(node.expression.name.text))fail('MODULE_INDIRECT_CODE_REJECTED');
      }
      if(ts.isNewExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='Function')fail('MODULE_INDIRECT_CODE_REJECTED');
      ts.forEachChild(node,visit);
    };visit(ast);
  }
  return {package:{name:pkg.name,version:pkg.version},files,imports,totalBytes:total};
}

export async function reviewedIdentity(packageRoot,expectedCommit,options) {
  if(!/^[a-f0-9]{40}$/.test(expectedCommit))fail('EXPECTED_FULL_REVIEWED_COMMIT_REQUIRED');
  const git=(...args)=>execFileSync('git',['-C',packageRoot,...args],{maxBuffer:2*1024*1024,encoding:'utf8'}).trim();
  if(git('rev-parse','HEAD')!==expectedCommit)fail('REVIEWED_MODULE_HEAD_CHANGED');
  const top=git('rev-parse','--show-toplevel'),prefix=relative(top,packageRoot).split(sep).join('/');
  const closure=await compiledClosure(packageRoot);
  for(const [name,digest]of Object.entries(closure.files))if(!name.startsWith('dist/')) {
    const tracked=execFileSync('git',['-C',top,'show',expectedCommit+':'+prefix+'/'+name],{maxBuffer:limits.fileBytes});
    if(sha256(tracked)!==digest)fail('REVIEWED_MODULE_SOURCE_CHANGED');
  }
  const locks={};
  for(const [label,path]of [['team',join(top,'pnpm-lock.yaml')],['product',join(repository,'pnpm-lock.yaml')]])locks[label]=sha256(await boundedFile(path,2*1024*1024));
  const configuration={options,resolvedContent:'not supplied',export:'analyzeEvidence',providerInvocation:'prohibited'};
  const identity={moduleId:closure.package.name,moduleVersion:closure.package.version,implementationSha256:sha256(canonicalJSON({files:closure.files,locks})),configurationSha256:sha256(canonicalJSON(configuration))};
  return {head:expectedCommit,...closure,locks,configuration,identity,compiledSourceBinding:'compiled bytes identified; this check does not prove the compiler produced them from the reviewed source'};
}

export async function checkModelOffAnalysis(bundle,analysis) {
  await validateConsumedAnalysis(analysis,bundle);
  if(analysis.aiState.status!=='disabled'||analysis.interpretations.length)fail('MODEL_OFF_CONTRACT_FAILED');
  return {findings:analysis.findings.length,lifecycleFindings:analysis.findings.filter(f=>f.ruleId==='heurisko.manifest.lifecycle-script-change').length};
}

export async function verifyIntake({packageRoot,expectedCommit,reportFile,storeRoot}) {
  packageRoot=resolve(packageRoot);reportFile=resolve(reportFile);storeRoot=resolve(storeRoot);
  const options={enableAI:false,analysisProfile:'final-hour-explicit-team-intake-v1'};
  const module=await reviewedIdentity(packageRoot,expectedCommit,options);
  const bytes=await boundedFile(reportFile,8*1024*1024),report=await decodeReportBytes(bytes),before=canonicalJSON(report.bundle);
  const store=new EvidenceStore(storeRoot),reader=await ReportReader.openBytes(bytes,storeRoot);
  await store.verifyEvidence(report);
  const snapshot={};
  for(const e of report.bundle.evidence)if(e.contentState==='retained')snapshot[e.contentRef]=sha256(await store.get(e.contentRef));
  const originalFetch=globalThis.fetch;let fetchAttempts=0;
  // Prevent accidental use of the provider's global-fetch path in this trusted
  // model-off probe. This is a guard, not a hostile-code sandbox.
  globalThis.fetch=async()=>{fetchAttempts++;fail('PROVIDER_OR_NETWORK_CALL_PROHIBITED');};
  let analysis;
  try {
    const imported=await import(pathToFileURL(join(packageRoot,'dist/index.js')).href);
    if(typeof imported.analyzeEvidence!=='function')fail('TEAM_EXPORT_MISSING');
    const supplied={...module.identity,analyzeEvidence:imported.analyzeEvidence};
    analysis=await runAnalysis(report.bundle,options,supplied);
    await checkModelOffAnalysis(report.bundle,analysis);
    const second=await runAnalysis(report.bundle,options,supplied);
    if(canonicalJSON(second)!==canonicalJSON(analysis))fail('MODEL_OFF_NONDETERMINISTIC_OUTPUT');
  } finally {globalThis.fetch=originalFetch;}
  if(fetchAttempts)fail('PROVIDER_OR_NETWORK_ATTEMPTED');
  if(canonicalJSON(report.bundle)!==before||sha256(await boundedFile(reportFile,8*1024*1024))!==sha256(bytes))fail('INPUT_MUTATED');
  for(const [ref,digest]of Object.entries(snapshot))if(sha256(await store.get(ref))!==digest)fail('EVIDENCE_MUTATED');
  const after=await reviewedIdentity(packageRoot,expectedCommit,options);
  if(canonicalJSON(after)!==canonicalJSON(module))fail('MODULE_CHANGED_DURING_INTAKE');
  const citations=[];
  for(const id of [...new Set(analysis.findings.flatMap(f=>f.evidenceIds))].sort()) {
    const e=reader.evidence(id);if(!e)fail('UNKNOWN_CITATION');
    const record=await reader.readEvidence(id,{length:4096});
    if(record.kind==='metadata_only'&&['UNKNOWN_EVIDENCE','INVALID_REF','MISSING_BLOB','HASH_MISMATCH','READ_FAILED','INVALID_RANGE'].includes(record.reason))fail('CITATION_RECORD_INVALID');
    const sides={};
    for(const side of ['artifact','source']) {
      if(!['raw_diff','manifest_delta'].includes(e.kind))continue;
      const span=await reader.readCitation(id,side,{length:4096});
      if(span.kind==='metadata_only'&&['UNKNOWN_EVIDENCE','INVALID_REF','MISSING_BLOB','HASH_MISMATCH','READ_FAILED','INVALID_RANGE','INVALID_RECORD','UNBOUND_MEMBER'].includes(span.reason))fail('CITATION_RANGE_INVALID');
      sides[side]=span.kind==='content'?{status:'resolved',contentRef:span.contentRef,recordedRange:span.recordedRange,memberEvidenceId:span.member?.evidenceId}:{status:'unresolved',reason:span.reason};
    }
    citations.push({evidenceId:id,record:record.kind==='content'?'hash-verified':record.reason,...(Object.keys(sides).length?{sides}:{})});
  }
  const validationFiles={};
  for(const name of ['packages/core/dist/adapter.js','packages/core/dist/validation.js','packages/contracts/schema/contracts.schema.json','packages/contracts/runtime/validate.py','packages/contracts/runtime/semantics.py','integration/part4/dist/report-reader.js','node_modules/typescript/lib/typescript.js'])validationFiles[name]=sha256(await boundedFile(join(repository,name),16*1024*1024));
  return {receipt:{version:'heurisko-final-module-intake-v1',checkedAt:new Date().toISOString(),status:'model-off-intake-passed',module,input:{reportContentRef:sha256(bytes),reportId:report.reportId,artifactCaptureTime:report.bundle.artifact.captureTime,retainedEvidence:Object.keys(snapshot).length,inputUnchanged:true,evidenceUnchanged:true},output:{sha256:sha256(canonicalJSON(analysis)),...(await checkModelOffAnalysis(report.bundle,analysis)),deterministicRepeat:true,aiState:analysis.aiState},citations,guards:{fetchAttempts,providerInvocation:false,targetExecution:false},runtime:{node:process.versions.node,typescript:ts.version},validationFiles,productModuleAdopted:false,limitations:['Trusted reviewed-team code only; this process is not an isolation boundary.','No provider/model invocation, quality acceptance, provenance verification or product integration.','Unknown/unsupported citation sides remain explicitly unresolved.','Reviewed M1 still incorrectly says retained command values are unavailable.']},analysis};
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [packageRoot,expectedCommit,reportFile,storeRoot,receiptFile]=process.argv.slice(2);
  if(!packageRoot||!expectedCommit||!reportFile||!storeRoot||!receiptFile||process.argv.length!==7)throw Error('EXPECTED_EXPLICIT_MODULE_COMMIT_REPORT_STORE_RECEIPT');
  const {receipt,analysis}=await verifyIntake({packageRoot,expectedCommit,reportFile,storeRoot});
  await writeImmutable(resolve(receiptFile)+'.analysis.json',Buffer.from(JSON.stringify(analysis,null,2)+'\n'));
  await writeImmutable(resolve(receiptFile),Buffer.from(JSON.stringify(receipt,null,2)+'\n'));
  console.log(JSON.stringify({status:receipt.status,moduleHead:receipt.module.head,input:receipt.input.reportContentRef,output:receipt.output}));
}
