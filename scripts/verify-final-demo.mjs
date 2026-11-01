// Read-only retained-case verification; never acquires or executes analyzed code.
import * as fs from 'node:fs/promises';
import { resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { openObservation } from '../apps/web/dist/observation.js';
import { exportObservation, importObservation } from '../apps/web/dist/transport.js';
import { exitCode } from '../packages/core/dist/index.js';

const root=resolve(import.meta.dirname,'..');
const manifestPath='examples/final-hour/20261101-053912/demo-manifest.json';
const destination=process.argv[2];
if(!destination)throw Error('FRESH_DESTINATION_REQUIRED');
const out=resolve(destination);
await fs.mkdir(out,{mode:0o700});
const hash=bytes=>'sha256:'+createHash('sha256').update(bytes).digest('hex');
const manifest=JSON.parse(await fs.readFile(join(root,manifestPath),'utf8'));
const codePaths=['packages/cli/dist/index.js','packages/core/dist/engine.js','packages/core/dist/adapter.js','packages/core/dist/validation.js','packages/contracts/schema/contracts.schema.json','packages/contracts/runtime/validate.py','packages/contracts/runtime/semantics.py','integration/part4/dist/report-reader.js','apps/web/dist/observation.js','apps/web/dist/transport.js','apps/web/tooling/strict-json.ts','scripts/verify-final-demo.mjs',manifestPath];
async function identity(){const files={};for(const p of codePaths)files[p]=hash(await fs.readFile(join(root,p)));return files;}
const before=await identity(),cases=[];
for(const item of manifest.cases){
 const reportPath=join(root,item.report),store=join(root,item.store);
 const original=await fs.readFile(reportPath);
 assert.equal(hash(original),item.reportContentRef,'Pinned retained report changed');
 const observation=await openObservation(reportPath,store),r=observation.reader.report;
 assert.equal(r.reportId,item.reportId);assert.equal(exitCode(r),item.expectedExit);
 assert.equal(r.bundle.artifact.origin,item.origin);
 assert.equal(r.bundle.artifact.observedSha256,item.artifactSha256);
 const refs=new Set();let retainedRecords=0,bytes=0;
 for(const e of r.bundle.evidence){
  if(e.contentState!=='retained')continue;
  retainedRecords++;
  assert.match(e.contentRef??'',/^sha256:[a-f0-9]{64}$/);assert.equal(e.contentRef,e.contentSha256);
  const path=join(store,'blobs',e.contentRef.slice(7));
  const stat=await fs.lstat(path);assert.equal(stat.isFile(),true);assert.equal(stat.isSymbolicLink(),false);
  const raw=await fs.readFile(path);assert.equal(hash(raw),e.contentRef);
  if(e.locator.endByte!==undefined)assert.ok(e.locator.endByte<=raw.length);
  if(!refs.has(e.contentRef)){refs.add(e.contentRef);bytes+=raw.length;}
 }
 const portablePath=join(out,item.id);
 const transport=await exportObservation(observation,portablePath);
 const reopened=await importObservation(portablePath);
 assert.deepEqual(reopened.raw,original);assert.deepEqual(reopened.reader.report,r);
 const cli=spawnSync(process.execPath,[join(root,'packages/cli/dist/index.js'),'inspect',join(portablePath,'report.json'),'--store',portablePath,'--json'],{encoding:'utf8',maxBuffer:16*1024*1024,timeout:120000});
 assert.equal(cli.error,undefined);assert.equal(cli.status,item.expectedExit,cli.stderr);assert.equal(cli.stderr,'');assert.deepEqual(JSON.parse(cli.stdout),r);
 const cliSummary=spawnSync(process.execPath,[join(root,'packages/cli/dist/index.js'),'inspect',join(portablePath,'report.json'),'--store',portablePath],{encoding:'utf8',maxBuffer:1024*1024,timeout:120000});
 const tui=spawnSync(process.execPath,[join(root,'packages/cli/dist/index.js'),'tui',join(portablePath,'report.json'),'--store',portablePath,'--no-color'],{encoding:'utf8',maxBuffer:1024*1024,timeout:120000});
 assert.equal(cliSummary.status,item.expectedExit);assert.equal(tui.status,item.expectedExit);assert.equal(tui.stderr,'');assert.equal(tui.stdout,cliSummary.stdout);
 await fs.writeFile(join(out,item.id+'.cli-summary.txt'),cliSummary.stdout,{flag:'wx',mode:0o600});
 let exactMutation;
 if(item.id==='inert-local-mutation'){
  const evidence=r.bundle.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='scripts.postinstall');assert.ok(evidence);
  const a=await reopened.reader.readCitation(evidence.evidenceId,'artifact');const s=await reopened.reader.readCitation(evidence.evidenceId,'source');
  assert.equal(a.kind,'content');assert.equal(Buffer.from(a.bytesBase64,'base64').toString(),'"HEURISKO_INERT_TEST_ONLY"');assert.equal(s.reason,'SIDE_NOT_RECORDED');
  exactMutation={evidenceId:evidence.evidenceId,artifactRange:a.recordedRange,artifactContent:'"HEURISKO_INERT_TEST_ONLY"',sourceReason:s.reason};
 }
 assert.deepEqual(await fs.readFile(reportPath),original,'Original report bytes changed');
 cases.push({id:item.id,label:item.label,report:item.report,store:item.store,reportId:r.reportId,reportContentRef:hash(original),artifactSha256:r.bundle.artifact.observedSha256,capturedAt:r.bundle.artifact.captureTime,createdAt:r.createdAt,outcomes:r.outcomes,findings:r.analysis.findings.length,changes:r.bundle.changes.length,retainedRecords,uniqueRetainedBlobs:refs.size,retainedBytes:bytes,verifiedRetainedBlobs:true,cliJSONEqual:true,cliSummaryEqualsNonTTY:true,exit:cli.status,portable:{path:relative(root,portablePath),originalReportBytesEqual:true,included:transport.blobs.filter(b=>b.status==='included').length,omitted:transport.blobs.filter(b=>b.status==='omitted').length,partial:transport.partial},...(exactMutation?{exactMutation}:{})});
}
assert.deepEqual(await identity(),before,'Build/source changed during verification');
const result={version:'heurisko-final-hour-demo-verification-v1',generatedAt:new Date().toISOString(),node:process.version,scope:'Retained original-byte, full retained-blob, CLI/non-TTY and portable parity; not native GUI acceptance or fresh acquisition.',networkAcquisition:false,targetExecution:false,productModelExecution:false,productModuleAdopted:false,cases,code:before};
await fs.writeFile(join(out,'verification.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({cases:cases.length,allRetainedBlobsVerified:true,originalBytesUnchanged:true,cliAndNonTTYParity:true,portableReopenParity:true,receipt:relative(root,join(out,'verification.json'))}));
