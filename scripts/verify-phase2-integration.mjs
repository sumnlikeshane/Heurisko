import {CURRENT_TRUST_PROFILE} from '../packages/core/dist/trust-profiles.js';
import {reportItems} from '../packages/tui/dist/model.js';
// Replay retained original npm/network bodies through producer and evaluator.
// Generated reports come only from investigate(), never assembled outcome objects.
import fs from 'node:fs/promises';import {resolve,join} from 'node:path';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {investigate,EvidenceStore,sha256,encodeReport,exitCode} from '../packages/core/dist/index.js';
import {loadTrustCatalog} from '../packages/core/dist/trust.js';import {ReportReader} from '../integration/part4/dist/report-reader.js';import {openObservation} from '../apps/web/dist/observation.js';
const [outArg]=process.argv.slice(2),sourceUnavailable=process.argv.includes('--source-unavailable');if(!outArg)throw Error('NEW output directory required');const out=resolve(outArg);await fs.mkdir(out,{recursive:false});
const p=resolve('examples/production-phase2/2026-11-02-implementation-02'),dir=join(p,'npm-fixtures/rollup-4.52.4'),metadata=await fs.readFile(join(dir,'metadata.json')),meta=JSON.parse(metadata),attestations=await fs.readFile(join(dir,'attestations.json')),archive=await fs.readFile(join(dir,'artifact.tgz')),source=sourceUnavailable?null:await fs.readFile(join(dir,'source.tgz'));
const expect={package:'rollup',version:'4.52.4',repositoryUrl:'https://github.com/rollup/rollup',fullSourceCommit:'cd81da74af1d11fda0ee1752cc26f6dc8217e9ca',packageSubdirectory:'',workflowPath:'.github/workflows/build-and-tests.yml',workflowRef:'refs/tags/v4.52.4',signerSAN:'https://github.com/rollup/rollup/.github/workflows/build-and-tests.yml@refs/tags/v4.52.4',builderId:'https://github.com/actions/runner/github-hosted',buildType:'https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1'};
assert.equal(meta.gitHead,expect.fullSourceCommit,'fixture expectations must match the independently retained release metadata');
const policy={profile:CURRENT_TRUST_PROFILE,provenance:'required',expect};
const catalog={version:'heurisko-trust-catalog-v1',snapshot:JSON.parse(await fs.readFile(process.env.HEURISKO_TEST_TRUST_SNAPSHOT??join(p,'authenticated-snapshot.json'))),policies:{'rollup-exact-fixture':policy,'rollup-wrong-builder-fixture':{...policy,expect:{...expect,builderId:'https://unexpected.invalid'}}}};
await fs.writeFile(join(out,'test-trust-catalog.json'),JSON.stringify(catalog,null,2)+'\n',{flag:'wx'});
const dl=(url,bytes)=>({bytes,capture:{version:'heurisko-download-v1',requestedUrl:url,finalUrl:url,captureTime:'2026-11-02T07:30:00.000Z',sha256:sha256(bytes),size:bytes.length,hops:[{url,status:200,headers:{}}]}});
const fetchData=async url=>{
 if(url==='https://registry.npmjs.org/rollup/4.52.4')return dl(url,metadata);
 if(url===meta.dist.tarball)return dl(url,archive);
 if(url===meta.dist.attestations.url)return dl(url,attestations);
 if(url==='https://codeload.github.com/rollup/rollup/tar.gz/'+meta.gitHead){if(sourceUnavailable)throw Error('FIXTURE_SOURCE_UNAVAILABLE');return dl(url,source);}
 throw Error('FIXTURE_DESTINATION_NOT_CAPTURED');
};
const results=[];
for(const [id,ref,expectedProvenance,expectedPolicy]of [['exact','rollup-exact-fixture','verified_policy','pass'],['wrong-builder','rollup-wrong-builder-fixture','verified_cryptographic_only','violation'],['unknown','constructor','unresolved','indeterminate'],['crypto-only',null,'verified_cryptographic_only','not_evaluated'],['oversized','rollup-exact-fixture','unresolved','indeterminate']]) {
 const dest=join(out,id);await fs.mkdir(dest);const store=new EvidenceStore(join(dest,'store')),options={enableAI:false,analysisProfile:'raw-static-s3-v1',...(ref?{trustPolicyRef:ref}:{})};
 const caseFetch=async(url,options)=>{if(id==='oversized'&&url===meta.dist.attestations.url)return dl(url,Buffer.from(JSON.stringify({...JSON.parse(attestations),padding:'INERT_PADDING_'.repeat(15000)})));return fetchData(url,options);};
 const report=await investigate({ecosystem:'npm',packageName:'rollup',version:'4.52.4',analysisOptions:options},options,{store,trustCatalog:catalog,fetchData:caseFetch});
 const bytes=Buffer.from(await encodeReport(report)),file=join(dest,'report.json');await fs.writeFile(file,bytes,{flag:'wx'});
 const reader=await ReportReader.openFile(file,store.root),web=await openObservation(file,store.root);assert.deepEqual(reader.report,web.reader.report);assert.deepEqual(web.raw,bytes);const tui=reportItems(reader,0,0);for(const [key,value]of Object.entries(report.outcomes))assert.ok(tui[0].lines.includes(`${key}: ${value}`));
 const cli=spawnSync(process.execPath,['packages/cli/dist/index.js','inspect',file,'--store',store.root,'--json'],{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(cli.status,exitCode(report));assert.deepEqual(JSON.parse(cli.stdout),report);
 const decisionEvidence=report.bundle.evidence.find(e=>e.locator.metadataKey==='offline-verification-decision'),decision=JSON.parse((await store.get(decisionEvidence.contentRef)).toString());
 const verified=['exact','wrong-builder','crypto-only'].includes(id);
 const pass=Boolean(report.outcomes.provenancePolicy===expectedProvenance&&report.outcomes.policyResult===expectedPolicy&&(!verified||(decision.profile===CURRENT_TRUST_PROFILE&&Array.isArray(decision.results)&&decision.results.length>0&&decision.results.every(r=>r.crypto===true)))&&(expectedPolicy!=='violation'||cli.status===1)&&(!sourceUnavailable||(report.outcomes.analysisCompleteness==='incomplete'&&report.outcomes.correspondence!=='exact'&&report.bundle.coverage.complete===false&&!report.bundle.evidence.some(e=>e.kind==='source_member'||e.locator.metadataKey==='raw-source-bytes'))));
 await fs.writeFile(join(dest,'cli.stdout.json'),cli.stdout,{flag:'wx'});await fs.writeFile(join(dest,'cli.stderr.log'),cli.stderr,{flag:'wx'});
 results.push({id,pass,profile:decision.profile??null,decisionReason:decision.reason,expectedProvenance,expectedPolicy,reportSha256:sha256(bytes),outcomes:report.outcomes,cliExit:cli.status});console.log(id,pass,JSON.stringify(report.outcomes));
}
await fs.writeFile(join(out,'summary.json'),JSON.stringify({profile:CURRENT_TRUST_PROFILE,results,passed:results.every(r=>r.pass),sourceUnavailableFixture:sourceUnavailable,limitations:['An explicitly source-unavailable replay retains missing raw source/completeness; signed expected-source claims never become raw byte correspondence.','Original retained HTTP bodies replayed through actual acquisition/producer/parser/evaluator; not a fresh network observation.','The repository-root Rollup policy is an explicit fixture; source identity expectation is cross-checked against original exact release metadata and commit capture.','CLI inspect reads actual evaluator output and does not reconstruct policy decisions.']},null,2)+'\n',{flag:'wx'});if(!results.every(r=>r.pass))process.exitCode=1;
