// Phase 1 baseline only: authored inert archives, CLI compatibility and replay.
// A fresh output is mandatory. No target code or provider is executed.
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { platform } from 'node:os';
import { sha256, decodeReportBytes, EvidenceStore, exitCode } from '../packages/core/dist/index.js';
import { ReportReader } from '../integration/part4/dist/report-reader.js';
import { openObservation } from '../apps/web/dist/observation.js';
const root = resolve(import.meta.dirname, '..');
const out = resolve(process.argv[2] ?? '');
const retained = process.argv[3] ? resolve(process.argv[3]) : undefined;
if (!process.argv[2]) throw Error('Fresh output directory required');
assert.equal(process.version, 'v22.23.4');
await fs.mkdir(out, { recursive: false });
const repo = 'https://github.com/alexeyraspopov/picocolors', commit = '6f0a4638348ed20633d623ee973f9c9a96f65104';
const manifest = { name: 'phase1-authored', version: '1.0.0', scripts: {}, main: 'index.js' };
const base = [{ path: 'package.json', text: JSON.stringify(manifest) }, { path: 'index.js', text: '// authored inert baseline\nexport const value = 1;\n' }];
const changedManifest = value => [{path:'package.json', text:JSON.stringify(value)}, base[1]];
// Construction labels declared and written before analysis; no detector-derived labels.
const cases = [
 {id:'benign-identical', class:'benign', truth:'Identical member bytes; no change to explain.', source:base, artifact:base},
 {id:'benign-format', class:'benign', truth:'Only authored whitespace differs; no behavior claim is inferred by analyzer.', source:base, artifact:[base[0],{...base[1],text:'// authored inert baseline\nexport const value=1;\n'}]},
 {id:'benign-generated', class:'benign', truth:'Authored generated equivalent constant; generation is construction knowledge, not runtime verification.', source:base, artifact:[base[0],{...base[1],text:'/* generated inert fixture */ export const value=1;\n'}]},
 {id:'mutation-lifecycle-add', class:'mutated', truth:'Adds /scripts/postinstall with inert unexecuted marker.', source:base, artifact:changedManifest({...manifest,scripts:{postinstall:'HEURISKO_INERT_TEST_ONLY'}})},
 {id:'mutation-lifecycle-remove', class:'mutated', truth:'Removes source /scripts/postinstall. Removal is not malicious intent.', source:changedManifest({...manifest,scripts:{postinstall:'HEURISKO_INERT_TEST_ONLY'}}), artifact:base},
 {id:'mutation-entrypoint', class:'mutated', truth:'Changes /main value to inert alternate path.', source:base, artifact:changedManifest({...manifest,main:'alternate.js'})},
 {id:'uncertain-link', class:'uncertain', truth:'Unsupported symlink makes coverage incomplete; no clean absence claim.', source:base, artifact:[...base,{path:'unknown',type:'symlink',target:'index.js'}]},
 {id:'uncertain-manifest', class:'uncertain', truth:'Duplicate manifest key prevents reliable metadata interpretation.', source:base, artifact:[{path:'package.json',text:'{"name":"phase1-authored","main":"a","main":"b"}'},base[1]]},
];
if (!retained) await fs.writeFile(join(out,'labels.json'),JSON.stringify({labelMethod:'Construction truth declared before analysis, independent of detector output; authored by implementing agent, no independent human sign-off.',license:'Apache-2.0 original inert fixtures',cases},null,2)+'\n',{flag:'wx'});
function cli(args, env={}, measured=false) {
 const argv = [process.execPath, join(root,'packages/cli/dist/index.js'), ...args];
 return spawnSync(measured?'/usr/bin/time':argv.shift(),measured?[platform()==='darwin'?'-l':'-v',...argv]:argv,{cwd:root,env:{...process.env,...env},encoding:'utf8',maxBuffer:16*1024*1024,timeout:180000});
}
async function parity(path, store, expected, missingStore=false) {
 const raw=await fs.readFile(path), report=await decodeReportBytes(raw);
 const reader=await ReportReader.openFile(path,store), web=await openObservation(path,store);
 const inspected=cli(['inspect',path,'--store',store,'--json']);
 assert.equal(inspected.status,missingStore?3:exitCode(report),inspected.stderr);
 if (!missingStore) assert.deepEqual(JSON.parse(inspected.stdout),report); else assert.equal(inspected.stdout,''); assert.deepEqual(reader.report,report); assert.deepEqual(web.reader.report,report);
 assert.equal(reader.reportContentRef,sha256(raw)); assert.deepEqual(web.raw,raw);
 if(expected) await new EvidenceStore(store).verifyEvidence(report);
 const citations=[...new Set(report.analysis.findings.flatMap(f=>f.evidenceIds))];
 const reads=[];
 for(const id of citations) {
  const a=await reader.readEvidence(id),b=await web.reader.readEvidence(id); assert.deepEqual(a,b);
  reads.push({id,kind:a.kind,...(a.kind==='content'?{ref:a.contentRef,range:a.recordedRange,displayed:a.displayedRange,bytes:Buffer.from(a.bytesBase64,'base64').length}:{reason:a.reason})});
 }
 const tui=cli(['tui',path,'--store',store,'--no-color']);assert.equal(tui.status,exitCode(report));assert.ok(!tui.stdout.includes('\x1b'));
 return {reportId:report.reportId,reportSha256:sha256(raw),reportBytes:raw.length,outcomes:report.outcomes,ai:report.analysis.aiState,findings:report.analysis.findings.length,conflicts:report.bundle.sourceCandidates.flatMap(c=>c.conflicts??[]),coverage:report.bundle.coverage,cliInspectExit:inspected.status,cliTuiExit:tui.status,citations:reads};
}
async function run(id,artifact,source,extra=[],env={}) {
 const dest=join(out,id);await fs.mkdir(dest);
 const args=['analyze','--artifact',artifact,'--source',repo,'--commit',commit,'--source-archive',source,'--store',join(dest,'store'),'--report',join(dest,'report.json'),'--json',...extra];
 const start=Date.now(),p=cli(args,env,true);
 await fs.writeFile(join(dest,'stderr.log'),p.stderr??'');await fs.writeFile(join(dest,'stdout.json'),p.stdout??'');
 const report=JSON.parse(p.stdout);assert.equal(p.status,exitCode(report),p.stderr);
 const verified=await parity(join(dest,'report.json'),join(dest,'store'),true);
 return {...verified,id,command:args,env,seconds:(Date.now()-start)/1000};
}
const results=[];
if (retained) results.push(...JSON.parse(await fs.readFile(join(retained,'corpus-results.json'),'utf8')));
else for(const c of cases) {
 const inputs=join(out,c.id+'-inputs');await fs.mkdir(inputs);
 for(const side of ['source','artifact']) {
  const bytes=execFileSync(join(root,'.venv/bin/python'),['-I',join(root,'packages/core/tests/helpers/make_archive.py')],{input:JSON.stringify({entries:c[side].map(e=>({...e,path:(side==='source'?'source-root/':'package/')+e.path}))})});
  await fs.writeFile(join(inputs,side+'.tgz'),bytes,{flag:'wx'});
 }
 const result=await run(c.id,join(inputs,'artifact.tgz'),join(inputs,'source.tgz'));
 results.push({...result,class:c.class});
 await fs.writeFile(join(out,'corpus-results.json'),JSON.stringify(results,null,2)+'\n');
}
if (!retained) {
const input=join(out,'mutation-lifecycle-add-inputs');
const noAI=await run('explicit-no-ai',join(input,'artifact.tgz'),join(input,'source.tgz'),['--no-ai']);
const defaultResult=results.find(c=>c.id==='mutation-lifecycle-add');
assert.equal(defaultResult.reportId,noAI.reportId);assert.deepEqual(defaultResult.outcomes,noAI.outcomes);
const load=async id=>JSON.parse(await fs.readFile(join(out,id,'report.json'),'utf8'));
assert.deepEqual((await load(defaultResult.id)).analysis.findings,(await load(noAI.id)).analysis.findings);
const raw=await run('raw-only',join(input,'artifact.tgz'),join(input,'source.tgz'),[],{HEURISKO_ANALYSIS_MODULE:'off'});
assert.equal(raw.cliInspectExit,2);assert.equal(raw.findings,0);assert.equal(raw.outcomes.analysisCompleteness,'incomplete');assert.notEqual(raw.reportId,noAI.reportId);
const policy=await run('requested-policy',join(input,'artifact.tgz'),join(input,'source.tgz'),['--policy','phase1-unimplemented']);assert.equal(policy.outcomes.policyResult,'indeterminate');assert.equal(policy.cliInspectExit,2);
const errors=[];
for(const [id,args,env] of [
 ['bad-option',['analyze','--unknown'],{}],['range',['analyze','npm:picocolors@latest'],{}],['source-pair',['analyze','--artifact',join(input,'artifact.tgz'),'--source',repo],{}],['unknown-module',['analyze','--artifact',join(input,'artifact.tgz')],{HEURISKO_ANALYSIS_MODULE:'unadmitted'}],['missing-report',['inspect',join(out,'absent.json'),'--json'],{}]
]) {const p=cli(args,env);assert.equal(p.status,3);assert.equal(p.stdout,'');errors.push({id,args,exit:p.status,stderr:p.stderr});}
await fs.writeFile(join(out,'compatibility.json'),JSON.stringify({default:defaultResult,explicitNoAI:noAI,raw,policy,errors,exitOne:'Covered by contracts only; no current concrete policy evaluator can produce a genuine violation.'},null,2)+'\n');
} else { await fs.copyFile(join(retained,'compatibility.json'),join(out,'compatibility.json')); await fs.writeFile(join(out,'retained-input.json'),JSON.stringify({path:retained,reason:'Reuse completed corpus/default/raw/policy cases; original failed only at absent-store strict inspect expectation.'},null,2)+'\n'); }
const historical=[];
for(const [file,store] of [
 ['examples/handoff/current/B1.report.json','examples/handoff/current/store'],
 ['examples/handoff/current/B3R.report.json','examples/handoff/current/store'],
 ['examples/part4/current/local-m1.report.json','examples/part4/current/store'],
 ['examples/production-phase1/2026-11-01/after/default.report.json','examples/production-phase1/2026-11-01/after/store']
]) historical.push({file,...await parity(join(root,file),join(root,store),false)});
const missing=await parity(join(root,'examples/part4/current/local-m1.report.json'),join(out,'absent-store'),false,true);
assert.ok(missing.citations.some(c=>c.reason==='MISSING_BLOB'));assert.ok(historical.some(c=>c.conflicts.length));
await fs.writeFile(join(out,'historical.json'),JSON.stringify({cases:historical,missing},null,2)+'\n');
const summary={cases:results.length,benign:results.filter(c=>c.class==='benign').length,benignWithFindings:results.filter(c=>c.class==='benign'&&c.findings>0).length,mutated:results.filter(c=>c.class==='mutated').length,mutatedWithFindings:results.filter(c=>c.class==='mutated'&&c.findings>0).length,uncertain:results.filter(c=>c.class==='uncertain').length,uncertainIncomplete:results.filter(c=>c.class==='uncertain'&&c.outcomes.analysisCompleteness!=='complete').length,completeRawCoverage:results.filter(c=>c.coverage.complete).length,completeAnalysis:results.filter(c=>c.outcomes.analysisCompleteness==='complete').length,limitations:['Small transparent construction corpus, not held out or representative malware prevalence.','Any finding is counted as a triage alarm; findings are not maliciousness verdicts.','No independent human label/claim acceptance; no precision/recall or safety threshold claimed.','No model inference; AI-disabled is not model abstention.']};
await fs.writeFile(join(out,'summary.json'),JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
