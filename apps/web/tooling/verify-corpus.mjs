// Generate a fresh actual portability/CLI parity receipt. No network or analyzer.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {openObservation} from '../dist/observation.js';
import {exportObservation,importObservation} from '../dist/transport.js';
const root=resolve(import.meta.dirname,'../../..'),destination=resolve(process.argv[2]??'');
if(!process.argv[2])throw Error('FRESH_DESTINATION_REQUIRED');
await fs.mkdir(destination,{mode:0o700});
const digest=b=>'sha256:'+createHash('sha256').update(b).digest('hex');
const cases=[];
for(const [name,report,store] of [
 ['B1','examples/handoff/current/B1.report.json','examples/handoff/current/store'],
 ['B2','examples/handoff/current/B2.report.json','examples/handoff/current/store'],
 ['B3R','examples/handoff/current/B3R.report.json','examples/handoff/current/store'],
 ['local-mutation','examples/s2/current/outputs/synthetic-local-mutation.report.json','examples/s2/current/store']
]){
 const observation=await openObservation(join(root,report),join(root,store));
 const manifest=await exportObservation(observation,join(destination,name));
 const reopened=await importObservation(join(destination,name));
 assert.deepEqual(reopened.raw,observation.raw);assert.deepEqual(reopened.reader.report,observation.reader.report);
 const cli=spawnSync(process.execPath,[join(root,'packages/cli/dist/index.js'),'inspect',join(root,report),'--store',join(root,store),'--json'],{encoding:'utf8',maxBuffer:16*1024*1024});
 assert.equal(cli.status,2);assert.deepEqual(JSON.parse(cli.stdout),observation.reader.report);
 let mutationSpan;
 if(name==='local-mutation'){
  const a=await reopened.reader.readCitation('ev_8e5679afc3b6d3667eb09413','artifact'),s=await reopened.reader.readCitation('ev_8e5679afc3b6d3667eb09413','source');
  assert.equal(a.kind,'content');assert.equal(Buffer.from(a.bytesBase64,'base64').toString(),'"HEURISKO_INERT_TEST_ONLY"');assert.equal(s.reason,'SIDE_NOT_RECORDED');
  mutationSpan={evidenceId:'ev_8e5679afc3b6d3667eb09413',artifactRange:a.recordedRange,artifactPageSha256:digest(Buffer.from(a.bytesBase64,'base64')),sourceReason:s.reason};
 }
 const r=observation.reader.report;
 cases.push({name,originalReport:report,reportId:r.reportId,reportContentRef:observation.reader.reportContentRef,artifactDigest:r.bundle.artifact.observedSha256,captureTime:r.bundle.artifact.captureTime,createdAt:r.createdAt,outcomes:r.outcomes,changes:r.bundle.changes.length,findings:r.analysis.findings.length,evidence:r.bundle.evidence.length,cliExit:cli.status,originalBytesUnchanged:true,reopenedReportEqual:true,manifest:`${name}/manifest.json`,included:manifest.blobs.filter(b=>b.status==='included').length,omitted:manifest.blobs.filter(b=>b.status==='omitted').length,partial:manifest.partial,...(mutationSpan?{mutationSpan}:{})});
}
const files=['pnpm-lock.yaml','apps/web/package.json','apps/web/build.mjs','integration/part4/src/report-reader.ts','packages/core/src/validation.ts','packages/contracts/schema/contracts.schema.json'];
async function add(dir){for(const e of await fs.readdir(join(root,dir),{withFileTypes:true})){const p=dir+'/'+e.name;if(e.isDirectory())await add(p);else files.push(p);}}
for(const dir of ['apps/web/src','apps/web/server','apps/web/tooling','apps/web/tests'])await add(dir);
const code={};for(const p of files)code[p]=digest(await fs.readFile(join(root,p)));
const receipt={version:'heurisko-web-portability-check-v1',generatedAt:new Date().toISOString(),foundation:'81346271f5a3789b4b43fd8f379014656011823d',activeBase:'0e2be5a',historical:true,networkAcquisition:false,targetExecution:false,productModels:[],codingAssistance:'Codex',node:process.version,cases,code};
await fs.writeFile(join(destination,'verification.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx',mode:0o600});
console.log(JSON.stringify({cases:cases.length,partial:cases.some(c=>c.partial),unchangedReports:true,cliParity:true}));
