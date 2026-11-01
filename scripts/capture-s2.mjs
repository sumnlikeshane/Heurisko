// Explicit S2 case capture, not an npm/source resolver. All URLs and the observed
// full commit are reviewed constants. Registry trust/provenance stays unchecked.
import * as fs from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { downloadBytes, EvidenceStore, writeImmutable, sha256, canonicalJSON, inventoryArchive } from '../packages/core/dist/index.js';
const destination=resolve(process.argv[2]??'.heurisko/s2-capture');
const commit='6f0a4638348ed20633d623ee973f9c9a96f65104';
const repo='https://github.com/alexeyraspopov/picocolors';
await fs.mkdir(destination,{recursive:true});await fs.mkdir(join(destination,'inputs'),{recursive:true});await fs.mkdir(join(destination,'outputs'),{recursive:true});
const captures=[];
for(const [filename,url,maxBytes] of [
 ['picocolors-1.1.1.metadata.json','https://registry.npmjs.org/picocolors/1.1.1',4*1024*1024],
 ['picocolors-1.1.1.tgz','https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz',32*1024*1024],
 ['picocolors-source-'+commit+'.tar.gz',`https://codeload.github.com/alexeyraspopov/picocolors/tar.gz/${commit}`,32*1024*1024]
]){
 const downloaded=await downloadBytes(url,{maxBytes});await writeImmutable(join(destination,'inputs',filename),downloaded.bytes);captures.push({filename,...downloaded.capture});
}
const metadata=JSON.parse(await fs.readFile(join(destination,'inputs','picocolors-1.1.1.metadata.json'),'utf8'));
if(metadata.name!=='picocolors'||metadata.version!=='1.1.1'||metadata.gitHead!==commit)throw new Error('CAPTURE_COORDINATE_CONFLICT');
const artifact=join(destination,'inputs','picocolors-1.1.1.tgz');
const source=join(destination,'inputs','picocolors-source-'+commit+'.tar.gz');
// Harmless authored copy. No lifecycle command is executed. Mutation oracles live
// in this capture manifest and are never passed to the analyzer.
const store=new EvidenceStore(join(destination,'store'));
const baselineInventory=await inventoryArchive(store,await store.put(await fs.readFile(artifact)));
if(!baselineInventory.complete)throw new Error('CAPTURE_BASELINE_INVENTORY_INCOMPLETE');
const authoredEntries=[];
for(const member of baselineInventory.members){
 if(member.type!=='file')throw new Error('CAPTURE_REQUIRES_REVIEWED_REGULAR_MEMBERS');
 let bytes=await store.get(member.contentRef);
 if(member.path==='package/package.json'){
  const manifest=JSON.parse(bytes);manifest.scripts??={};manifest.scripts.postinstall='HEURISKO_INERT_TEST_ONLY';bytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
 }
 authoredEntries.push({path:member.path,mode:member.mode,mtime:Number.parseInt(member.mtime,10),hex:bytes.toString('hex')});
}
authoredEntries.push({path:'package/heurisko-inert-marker.js',text:'// HEURISKO_INERT_TEST_MARKER: synthetic local mutation; no executable behavior.\n'});
// The host only writes an authored tar from bounded, already-inventoried bytes;
// it never parses the target tar or runs its package metadata.
const mutation=execFileSync(resolve('.venv/bin/python'),['-I','packages/core/tests/helpers/make_archive.py'],{input:JSON.stringify({entries:authoredEntries,gzipMtime:0}),maxBuffer:32*1024*1024});
const mutated=join(destination,'inputs','picocolors-1.1.1.local-inert-mutation.tgz');await writeImmutable(mutated,mutation);
const reports=[];
for(const [label,file]of [['release-local-input',artifact],['synthetic-local-mutation',mutated]]){
 const reportPath=join(destination,'outputs',label+'.report.json'),bundlePath=join(destination,'outputs',label+'.bundle.json');
 const args=['packages/cli/dist/index.js','analyze','--artifact',file,'--name','picocolors','--version','1.1.1','--source',repo,'--commit',commit,'--source-archive',source,'--store',join(destination,'store'),'--no-ai','--policy','s2-requested-analysis','--json','--report',reportPath,'--bundle',bundlePath];
 const r=spawnSync(process.execPath,args,{encoding:'utf8',maxBuffer:8*1024*1024});await writeImmutable(join(destination,'outputs',label+'.stderr.txt'),Buffer.from(r.stderr));
 if(r.status!==2)throw new Error('CAPTURE_ANALYZE_FAILED: '+r.stderr);const report=JSON.parse(r.stdout);
 reports.push({label,reportFile:'outputs/'+label+'.report.json',bundleFile:'outputs/'+label+'.bundle.json',reportId:report.reportId,reportContentRef:sha256(Buffer.from(await fs.readFile(reportPath))),artifactSha256:report.bundle.artifact.observedSha256,configurationFingerprint:report.analysisConfigFingerprint,exitCode:r.status,changes:report.bundle.changes.map(c=>({status:c.status,artifactPath:c.artifactPath??null,sourcePath:c.sourcePath??null})),outcomes:report.outcomes});
}
for(const r of reports)await store.verifyEvidence(await store.loadReport(r.reportContentRef));
await writeImmutable(join(destination,'capture-manifest.json'),Buffer.from(JSON.stringify({version:'heurisko-s2-case-v1',capturedAt:new Date().toISOString(),publicRelease:'picocolors@1.1.1',source:{repo,commit,subdirectory:'',binding:'explicit comparison target; metadata gitHead retained as an unverified claim'},captures,reports,mutationOracle:{synthetic:true,localOnly:true,changes:['package/package.json adds scripts.postinstall with inert literal HEURISKO_INERT_TEST_ONLY','package/heurisko-inert-marker.js adds a comment only'],executed:false},malharHandshake:{status:'not-injected-in-CLI',expectedPackage:'@heurisko/intelligence',expectedExport:'analyzeEvidence',actualVersion:null,reason:'Capture tests the explicit missing-module path. Separate reviewed consumer checks use check-malhar-handshake.mjs; no external message sent'},rights:{packageLicense:'ISC; retain package/LICENSE',sourceLicense:'ISC; retain source LICENSE; no upstream code executed'},limitations:['Local captured bytes do not inherit registry integrity/provenance.','No source identity verification, heuristics, model, rebuild, monitor, TUI or browser.']},null,2)+'\n'));
console.log(JSON.stringify({destination, reports:reports.map(r=>({label:r.label,reportId:r.reportId,artifactSha256:r.artifactSha256,exitCode:r.exitCode}))},null,2));
