// Explicit development handoff validation. Reviewed local M1; no product module loader.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {EvidenceStore,investigate,sha256,canonicalJSON,boundedFile,encodeReport,writeImmutable,engineCodeIdentity} from '../packages/core/dist/index.js';
const destination=resolve(process.argv[2]??'examples/part4/current');
const team=resolve('.heurisko/malhar-review/m0-plus-m1/packages/intelligence');
const original=JSON.parse(await fs.readFile('examples/handoff/current/m1-B1-handshake.json','utf8'));
for(const [file,expected]of [['src/index.ts',original.sourceSha256],['dist/index.js',original.compiledSha256]])if(sha256(await boundedFile(join(team,file),128*1024))!==expected)throw Error('REVIEWED_M1_CHANGED');
const module=await import(pathToFileURL(join(team,'dist/index.js')).href),files={};
for(const name of ['dist/index.js','dist/index.d.ts','package.json'])files[name]=sha256(await boundedFile(join(team,name),2*1024*1024));
const options={enableAI:false,analysisProfile:'reviewed-m1-part4-local-validation-v1'};
const identity={moduleId:'@heurisko/intelligence',moduleVersion:'0.1.0',implementationSha256:sha256(canonicalJSON(files)),configurationSha256:sha256(canonicalJSON(options))};
const input={ecosystem:'local',artifactPath:resolve('examples/s2/current/inputs/picocolors-1.1.1.local-inert-mutation.tgz'),packageName:'picocolors',version:'1.1.1',sourceOverride:{repo:'https://github.com/alexeyraspopov/picocolors',commit:'6f0a4638348ed20633d623ee973f9c9a96f65104'},analysisOptions:options};
const store=new EvidenceStore(join(destination,'store'));
const report=await investigate(input,options,{store,sourceArchivePath:resolve('examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz'),module:{...identity,analyzeEvidence:module.analyzeEvidence}});
const bytes=Buffer.from(await encodeReport(report));await writeImmutable(join(destination,'local-m1.report.json'),bytes);
await writeImmutable(join(destination,'validation-source.json'),Buffer.from(JSON.stringify({version:1,observedAt:new Date().toISOString(),kind:'actual local synthetic mutation replay with reviewed M1; no model',reportId:report.reportId,reportContentRef:sha256(bytes),findings:report.analysis.findings.length,identity,files,engine:await engineCodeIdentity(),productModuleAdopted:false,modelExecution:false},null,2)+'\n'));
console.log(JSON.stringify({reportId:report.reportId,findings:report.analysis.findings.length,contentRef:sha256(bytes)}));
