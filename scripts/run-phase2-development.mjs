// Development observations only. Public package data is never installed,
// imported or executed. Local archive origin cannot inherit registry success.
import fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {EvidenceStore,investigate,encodeReport,sha256,exitCode} from '../packages/core/dist/index.js';
import {ReportReader} from '../integration/part4/dist/report-reader.js';
import {openObservation} from '../apps/web/dist/observation.js';
import {spawnSync} from 'node:child_process';
assert.equal(process.version,'v22.23.4');
const [inputArg,outArg]=process.argv.slice(2);if(!outArg)throw Error('captured inputs and NEW output required');
const input=resolve(inputArg),out=resolve(outArg);await fs.mkdir(out,{recursive:false});
const captures=JSON.parse(await fs.readFile(join(input,'captures.json'),'utf8'));
const sources=JSON.parse(await fs.readFile(join(input,'source-captures','captures.json'),'utf8'));
const options={enableAI:false,analysisProfile:'raw-static-s3-v1'},results=[];
for(const c of captures.cases) {
 const source=sources.find(s=>s.caseId===c.caseId),dest=join(out,c.caseId);await fs.mkdir(dest);
 const metadata=JSON.parse(await fs.readFile(join(input,c.artifact.split('/')[0],'metadata.json'),'utf8'));
 const store=new EvidenceStore(join(dest,'store'));
 const settings={ecosystem:'local',artifactPath:join(input,c.artifact),artifactFilename:metadata.name.split('/').at(-1)+'-'+metadata.version+'.tgz',packageName:metadata.name,version:metadata.version,analysisOptions:options};
 let sourceArchivePath;
 if(source.path) {
  const slug=source.url.split('https://codeload.github.com/')[1].split('/tar.gz/')[0];
  settings.sourceOverride={repo:'https://github.com/'+slug,commit:source.commitClaim,subdirectory:metadata.repository?.directory??''};
  sourceArchivePath=join(input,'source-captures',source.path);
 }
 const started=Date.now(),report=await investigate(settings,options,{store,sourceArchivePath,fetchData:async()=>{throw Error('DEVELOPMENT_NETWORK_NOT_ADMITTED');}});
 const raw=Buffer.from(await encodeReport(report)),file=join(dest,'report.json');await fs.writeFile(file,raw,{flag:'wx'});
 const reader=await ReportReader.openFile(file,store.root),web=await openObservation(file,store.root);
 assert.deepEqual(reader.report,web.reader.report);assert.deepEqual(web.raw,raw);
 const cli=spawnSync(process.execPath,['packages/cli/dist/index.js','inspect',file,'--store',store.root,'--json'],{encoding:'utf8',maxBuffer:16*1024*1024});
 assert.equal(cli.status,exitCode(report),cli.stderr);assert.deepEqual(JSON.parse(cli.stdout),report);
 const reads=[];
 for(const e of report.bundle.evidence.filter(e=>e.kind==='manifest_delta'))for(const side of ['source','artifact']) {
  const a=await reader.readCitation(e.evidenceId,side),b=await web.reader.readCitation(e.evidenceId,side);assert.deepEqual(a,b);
  reads.push({evidenceId:e.evidenceId,side,kind:a.kind,...(a.kind==='content'?{range:a.recordedRange,bytes:Buffer.from(a.bytesBase64,'base64').length}:{reason:a.reason})});
 }
 const notices=[];
 for(const e of report.bundle.evidence.filter(e=>e.kind==='source_member'&&/(?:^|\/)(?:licen[cs]e|notice|copying)(?:\.[^/]*)?$/i.test(e.locator.path))) {
  const bytes=await store.get(e.contentRef),path=join(dest,'source-notices',e.locator.path);await fs.mkdir(resolve(path,'..'),{recursive:true});await fs.writeFile(path,bytes,{flag:'wx'});notices.push({path:e.locator.path,sha256:sha256(bytes)});
 }
 results.push({id:c.caseId,family:c.family,split:'development',labelAuthority:'unlabeled public release; no independent human label or quality metric',reportSha256:sha256(raw),reportId:report.reportId,configuration:report.analysisConfigFingerprint,artifactSha256:report.bundle.artifact.observedSha256,sourceArchiveSha256:source.sha256??null,outcomes:report.outcomes,findings:report.analysis.findings.length,coverage:report.bundle.coverage,sourceNotices:notices,citations:reads,seconds:(Date.now()-started)/1000});
 await fs.writeFile(join(out,'observations.json'),JSON.stringify({cases:results,limitations:['Development only; 12 provisional upstream families, no held-out selection or grading.','Local origin preserves exact downloaded bytes but does not inherit registry integrity/provenance.','Registry/gitHead claims and HTTPS source snapshots are not independent source labels.','Parser/API/CLI/reader checks do not establish GUI/AT or independent claim acceptance.']},null,2)+'\n');
 console.log(c.caseId,exitCode(report),report.analysis.findings.length);
}
