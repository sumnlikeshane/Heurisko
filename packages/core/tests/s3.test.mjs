import {removeSettledTestStore} from './helpers/recovery.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { execFileSync,spawnSync } from 'node:child_process';
import { join,resolve } from 'node:path';
import { tmpdir } from 'node:os';
import {createHash} from 'node:crypto';
import { npmCoordinates,npmIntegrity,metadataJSON,registryDataURL,githubRepository,resolveSources,collectUnverifiedProvenance,DownloadError,EvidenceStore,investigate,sha256,validateReport,exitCode,decodeReport,configurationFingerprint,deterministicReportDigest } from '../dist/index.js';
const root=resolve(import.meta.dirname,'../../..');
const commit='6f0a4638348ed20633d623ee973f9c9a96f65104',other='0e15315eafbbb813a91bad34496418846981c1b1';
const repo='https://github.com/alexeyraspopov/picocolors';
const options={enableAI:false,analysisProfile:'authored-s3-boundary-tests'};
const sri=(bytes,algorithm='sha512')=>algorithm+'-'+createHash(algorithm).update(bytes).digest('base64');
const download=(url,data)=>{const bytes=Buffer.isBuffer(data)?data:Buffer.from(typeof data==='string'?data:JSON.stringify(data));return {bytes,capture:{version:'heurisko-download-v1',requestedUrl:url,finalUrl:url,captureTime:'2026-11-01T00:00:00.000Z',sha256:sha256(bytes),size:bytes.length,hops:[{url,status:200,headers:{}}]}};};
const offline=async()=>{throw new DownloadError('HTTP_STATUS_REJECTED');};
const archive=entries=>execFileSync(join(root,'.venv/bin/python'),['-I',join(root,'packages/core/tests/helpers/make_archive.py')],{input:JSON.stringify({entries}),maxBuffer:32*1024*1024});
const metadata={name:'picocolors',version:'1.1.1',repository:{type:'git',url:repo},gitHead:commit};

test('exact npm coordinates include scoped names and reject ranges, aliases, URLs and ambiguous spelling',()=>{
 assert.equal(npmCoordinates('@scope/name','1.2.3-rc.1+build.4'),'https://registry.npmjs.org/%40scope%2Fname/1.2.3-rc.1%2Bbuild.4');
 assert.equal(npmCoordinates('picocolors','1.1.1'),'https://registry.npmjs.org/picocolors/1.1.1');
 for(const version of ['latest','^1.0.0','1','v1.0.0','01.0.0','1.0.0-01','1.0.0/x','1.0.0\n'])assert.throws(()=>npmCoordinates('valid',version));
 for(const name of ['../x','Name','@scope/name/extra','@scope','https://example.com','a%2fb','a\u001b'])assert.throws(()=>npmCoordinates(name,'1.0.0'));
});
test('registry data URLs reject credentials, queries, IPs, private endpoints and other allowlisted services',()=>{
 for(const url of ['https://api.github.com/x','https://codeload.github.com/x','https://registry.npmjs.org/a?q=1','https://a:b@registry.npmjs.org/x','https://127.0.0.1/x','http://registry.npmjs.org/a'])assert.throws(()=>registryDataURL(url));
});
test('known-answer SRI binds the actual archive bytes and records independent SHA-256 and SHA-512',()=>{
 const bytes=Buffer.from('abc');for(const algorithm of ['sha256','sha512']){const r=npmIntegrity(bytes,sri(bytes,algorithm));assert.equal(r.check.status,'matched');assert.equal(r.check.algorithm,algorithm);assert.equal(r.observed.sha256,'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');assert.equal(npmIntegrity(Buffer.from('changed'),sri(bytes,algorithm)).check.status,'mismatched');}
});
test('SRI selects strongest supported algorithm and never downgrades malformed or unsupported tokens',()=>{
 const b=Buffer.from('abc'),wrong=sri(Buffer.from('wrong'));
 assert.equal(npmIntegrity(b,sri(b,'sha256')+' '+wrong).check.status,'mismatched');
 assert.equal(npmIntegrity(b,wrong+' '+sri(b)).check.status,'matched');
 for(const value of [undefined,'','sha1-xxx','sha512-abc',sri(b)+' sha999-xyz',sri(b)+'?option',sri(b).replace(/=$/,''),Array(17).fill(sri(b)).join(' ')])assert.equal(npmIntegrity(b,value).check.status,'not_available');
});
test('untrusted metadata rejects duplicate keys, invalid UTF-8 and structural limits',()=>{
 for(const bytes of [Buffer.from('{"name":"a","name":"b"}'),Buffer.from([0xff]),Buffer.from('{"x":'+ '['.repeat(35)+'0'+']'.repeat(35)+'}'),Buffer.alloc(256*1024+1)])assert.throws(()=>metadataJSON(bytes));
});
test('GitHub repository normalization is inert and preserves validated monorepo directories',()=>{
 for(const url of [repo+'.git','git+https://github.com/alexeyraspopov/picocolors.git','git+ssh://git@github.com/alexeyraspopov/picocolors.git','git@github.com:alexeyraspopov/picocolors.git'])assert.equal(githubRepository(url).repo,repo);
 assert.equal(githubRepository({url:repo,directory:'packages/pkg'}).subdirectory,'packages/pkg');
 for(const value of [{url:repo,directory:'../escape'},{url:repo,directory:5},'https://user@github.com/a/b','https://github.com/a/b/tree/main','git+ssh://evil.example/a/b'])assert.throws(()=>githubRepository(value));
});
test('matching metadata/manifest/lightweight tags remain publisher assertions with separate captured claims',async()=>{
 const r=await resolveSources(metadata,{...metadata},undefined,'1.1.1',undefined,async url=>download(url,{object:{type:'commit',sha:commit}}));
 assert.equal(r.ambiguous,false);assert.equal(r.selected.commit,commit);assert.equal(r.candidates.length,1);assert.equal(r.candidates[0].association,'publisher_asserted');assert.deepEqual(r.claims.map(c=>c.kind),['registry','artifact-manifest','version-tag','version-tag']);
});
test('annotated tags are peeled to a full commit with bounded requests; tag equality never verifies provenance',async()=>{
 let calls=0;const r=await resolveSources(metadata,undefined,undefined,'1.1.1',undefined,async url=>{calls++;return download(url,{object:{type:url.includes('/git/tags/')?'commit':'tag',sha:url.includes('/git/tags/')?commit:other}});});
 assert.equal(calls,4);assert.ok(r.claims.filter(c=>c.kind==='version-tag').every(c=>c.commit===commit));assert.equal(r.candidates[0].association,'publisher_asserted');
 const cyclic=await resolveSources(metadata,undefined,undefined,'1.1.1',undefined,async url=>download(url,{object:{type:'tag',sha:other}}));assert.ok(cyclic.claims.some(c=>c.failure==='SOURCE_TAG_OBJECT_REJECTED'));
});
test('moved/wrong version tag retains both full commits and forces ambiguity',async()=>{
 const r=await resolveSources(metadata,undefined,undefined,'1.1.1',undefined,async url=>download(url,{object:{type:'commit',sha:other}}));assert.equal(r.ambiguous,true);assert.equal(r.candidates.length,2);assert.ok(r.candidates.every(c=>c.association==='ambiguous'&&c.conflicts.length));assert.equal(r.selected.commit,commit);
});
test('wrong repository/commit/subtree override is retained beside publisher claims, never silently superseding them',async()=>{
 for(const override of [{repo,commit:other},{repo:'https://github.com/gvergnaud/ts-pattern',commit},{repo,commit,subdirectory:'wrong'}]){const r=await resolveSources({...metadata,repository:{url:repo,directory:''}},metadata,override,'1.1.1',undefined,offline);assert.equal(r.ambiguous,true);assert.deepEqual(r.selected,{subdirectory:'',...override});assert.ok(r.candidates.length>=2);}
});
test('missing tags/source remain explicit and no default-branch URL is requested',async()=>{
 const calls=[];const r=await resolveSources({...metadata,gitHead:undefined},undefined,undefined,'1.1.1',undefined,async url=>{calls.push(url);throw new DownloadError('HTTP_STATUS_REJECTED',{requestedUrl:url,captureTime:'2026-11-01T00:00:00Z',hops:[{url,status:404,headers:{}}]});});
 assert.equal(r.selected,undefined);assert.ok(r.claims.filter(c=>c.kind==='version-tag').every(c=>c.failure&&c.failedCapture.hops[0].status===404));assert.equal(calls.length,2);assert.ok(calls.every(u=>u.includes('/git/ref/tags/')));
});
test('manifest directory can fill omitted registry directory without treating omission as an explicit root',async()=>{
 const r=await resolveSources(metadata,{repository:{url:repo,directory:'packages/pkg'}},undefined,'1.1.1',undefined,offline);assert.equal(r.selected.subdirectory,'packages/pkg');assert.equal(r.ambiguous,false);
});
test('tag discovery cancellation is bounded and preserves the full registry candidate',async()=>{
 const c=new AbortController();c.abort();const r=await resolveSources(metadata,undefined,undefined,'1.1.1',c.signal,async()=>assert.fail('no request after cancellation'));assert.equal(r.selected.commit,commit);assert.ok(r.limitations.includes('SOURCE_TAG_DISCOVERY_CANCELLED'));
});
for(const scenario of ['invalid-signature','publish-only','wrong-subject','unexpected-signer','policy-rejected','forged-verified'])test(`unavailable verifier treats ${scenario} material as inert unverified bytes (adapter failure fixture)`,async()=>{
 const raw={scenario,status:'verified_policy',artifactBinding:'matched',subject:{sha256:'0'.repeat(64)},predicateType:'https://example.invalid/publish',signer:'unexpected'};
 const result=await collectUnverifiedProvenance({url:'https://registry.npmjs.org/-/npm/v1/attestations/fixture@1.0.0'},undefined,async url=>download(url,raw));assert.equal(result.state.status,'not_checked');assert.equal(result.state.artifactBinding,'not_checked');assert.equal(result.record.verifier,null);assert.deepEqual(JSON.parse(result.material),raw);
});
test('unadvertised provenance is not a cryptographically established absence; invalid URL and offline failure remain not checked',async()=>{
 const absent=await collectUnverifiedProvenance(undefined,undefined,async()=>assert.fail('no request'));assert.equal(absent.state.status,'not_checked');
 for(const url of ['https://registry.npmjs.org/wrong','https://api.github.com/x']){const r=await collectUnverifiedProvenance({url},undefined,async()=>assert.fail('no unsafe request'));assert.equal(r.state.status,'not_checked');assert.ok(r.record.reason.endsWith('REJECTED'));}
 const r=await collectUnverifiedProvenance({url:'https://registry.npmjs.org/-/npm/v1/attestations/x'},undefined,offline);assert.equal(r.state.status,'not_checked');assert.equal(r.record.reason,'HTTP_STATUS_REJECTED');
});
async function npmCase(t,config={}) {
 const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-s3-authored-'));t.after(()=>removeSettledTestStore(dir));const store=new EvidenceStore(join(dir,'store'));
 const name=config.scoped?'@fixture/name':'picocolors',version='1.1.1';
 const m={...metadata,name,version,...(config.manifest??{})};const manifestText=JSON.stringify(m);
 const artifact=archive([{path:'package/package.json',text:manifestText},{path:'package/index.js',text:'// inert authored fixture\n'}]);
 const sourceManifest=JSON.stringify({...m,...(config.sourceManifest??{})});
 const source=archive([{path:'root/package.json',text:sourceManifest},{path:'root/index.js',text:'// inert authored fixture\n'},...(config.sourceEntries??[])]);
 const meta={...metadata,name,version,dist:{tarball:`https://registry.npmjs.org/${name}/-/name-1.1.1.tgz`,integrity:sri(config.mismatch?Buffer.from('wrong'):artifact)},...(config.metadata??{})};
 if(config.noIntegrity)delete meta.dist.integrity;
 const calls=[];const fetchData=async(url,opts)=>{calls.push({url,opts});if(opts?.signal?.aborted)throw new DownloadError('CANCELLED');if(url===npmCoordinates(name,version))return download(url,meta);if(url===meta.dist.tarball)return download(url,artifact);if(url.includes('/git/ref/')){if(config.tagConflict)return download(url,{object:{type:'commit',sha:other}});throw new DownloadError('HTTP_STATUS_REJECTED');}if(url.startsWith('https://codeload.github.com/')){if(config.noSource)throw new DownloadError('DOWNLOAD_FAILED');return download(url,source);}throw new Error('UNEXPECTED_FIXTURE_URL');};
 const input={ecosystem:'npm',packageName:name,version,analysisOptions:options,...(config.override?{sourceOverride:config.override}:{})};
 const report=await investigate(input,options,{store,fetchData,...(config.analysisModuleSelector?{analysisModuleSelector:config.analysisModuleSelector}:{})});return {dir,store,report,calls,artifact,source,input,fetchData};
}
test('explicit raw scoped npm fixture traverses actual safe producer/store/validator and cannot imply safety',async t=>{
 const {report,store,calls,artifact}=await npmCase(t,{scoped:true,analysisModuleSelector:'off'});await validateReport(report);await store.verifyEvidence(report);assert.equal(report.bundle.artifact.origin,'registry');assert.equal(report.bundle.artifact.observedSha256,sha256(artifact));assert.equal(report.outcomes.artifactIntegrity,'matched');assert.equal(report.outcomes.sourceAssociation,'publisher_asserted');assert.equal(report.outcomes.provenancePolicy,'not_checked');assert.equal(report.outcomes.correspondence,'exact');assert.equal(exitCode(report),2);assert.ok(calls[0].url.includes('%40fixture%2Fname'));assert.equal(report.analysis.findings.length,0);assert.ok(report.bundle.artifact.metadataEvidenceId);assert.equal(report.analysis.stages.find(s=>s.stage==='heuristics').errors[0].code,'ANALYSIS_MODULE_UNAVAILABLE');
});
test('advertised archive mismatch retains failed acquisition bytes, suppresses comparison and never fetches source',async t=>{
 const {report,store,calls,artifact}=await npmCase(t,{mismatch:true});assert.equal(report.outcomes.artifactIntegrity,'mismatched');assert.equal(report.outcomes.correspondence,'not_assessed');assert.equal(report.outcomes.analysisCompleteness,'incomplete');assert.deepEqual(report.bundle.changes,[]);assert.ok(report.bundle.stages.some(s=>s.stage==='acquire'&&s.status==='failed'));assert.ok(!calls.some(c=>c.url.startsWith('https://codeload')));assert.deepEqual(await store.get(report.bundle.artifact.observedSha256),artifact);
});
test('wrong source manifest subject cannot turn matching version metadata into source correspondence',async t=>{
 const {report}=await npmCase(t,{sourceManifest:{name:'wrong-name'}});assert.equal(report.outcomes.sourceAssociation,'ambiguous');assert.equal(report.outcomes.correspondence,'unresolved');assert.equal(report.bundle.coverage.complete,false);assert.ok(report.bundle.sourceCandidates.some(c=>c.conflicts.includes('SOURCE_PACKAGE_SUBJECT_MISMATCH')));
});
test('complete inventories with ambiguous version labels keep one-sided records unresolved with the actual reason',async t=>{
 const {report}=await npmCase(t,{sourceManifest:{version:'1.1.0'},sourceEntries:[{path:'root/source-only.txt',text:'// inert source-only probe\n'}]});
 assert.equal(report.bundle.coverage.complete,true);
 for(const stage of ['inventory','compare'])assert.equal(report.bundle.stages.find(s=>s.stage===stage).status,'complete');
 assert.equal(report.outcomes.sourceAssociation,'ambiguous');assert.equal(report.outcomes.correspondence,'unresolved');
 const one=report.bundle.changes.find(c=>c.sourcePath==='root/source-only.txt');
 assert.equal(one.status,'unresolved');assert.equal(one.rawEquality,'unknown');
 assert.match(one.notes.join('\n'),/Inventories complete; source association is ambiguous/);
 assert.ok(!report.bundle.changes.some(c=>c.notes.some(n=>n.includes('incomplete inventory'))));
});
test('wrong or missing subtree retains broad build context and unknown correspondence',async t=>{
 const {report}=await npmCase(t,{override:{repo,commit,subdirectory:'missing'},metadata:{repository:{url:repo,directory:''}}});assert.equal(report.bundle.coverage.complete,false);assert.ok(report.bundle.coverage.skippedBytes>0);assert.equal(report.outcomes.sourceAssociation,'ambiguous');assert.ok(report.bundle.sourceCandidates.find(c=>c.subdirectory==='missing').sourceSnapshotSha256);
});
test('offline source failure yields valid retained report with unknown absence and no clean result',async t=>{
 const {report}=await npmCase(t,{noSource:true});assert.equal(report.outcomes.analysisCompleteness,'incomplete');assert.equal(report.bundle.coverage.complete,false);assert.ok(report.bundle.changes.every(c=>c.status==='unresolved'));assert.ok(report.bundle.stages.some(s=>s.stage==='source'&&s.errors.some(e=>e.code==='DOWNLOAD_FAILED')));
});
test('conflicting tag candidates cannot earn exact correspondence even if selected member bytes match',async t=>{
 const {report}=await npmCase(t,{tagConflict:true});assert.equal(report.outcomes.sourceAssociation,'ambiguous');assert.equal(report.outcomes.correspondence,'unresolved');assert.equal(report.bundle.sourceCandidates.length,2);assert.ok(report.bundle.sourceCandidates.every(c=>c.evidenceIds.length));
});
for(const gap of [{path:'root/.gitmodules',text:'[submodule "missing"]\n path = missing\n'},{path:'root/asset',text:'version https://git-lfs.github.com/spec/v1\noid sha256:'+'0'.repeat(64)+'\nsize 100\n'}])test('submodule/LFS archive gaps stay explicit without fetching external objects: '+gap.path,async t=>{
 const {report,calls}=await npmCase(t,{sourceEntries:[gap]});assert.equal(report.bundle.coverage.complete,false);assert.ok(report.bundle.stages.find(s=>s.stage==='source').errors[0].code.startsWith('SOURCE_'));assert.ok(calls.every(c=>!c.url.includes('/missing')&&!c.url.includes('git-lfs')));
});
test('retained exact metadata and source context bind report identity; later metadata changes create new evaluation',async t=>{
 const x=await npmCase(t);const first=x.report;const again=await investigate(x.input,options,{store:x.store,fetchData:x.fetchData});assert.equal(first.reportId,again.reportId);
 const changedFetch=async(url,opts)=>{const r=await x.fetchData(url,opts);if(url===npmCoordinates('picocolors','1.1.1'))return download(url,{...JSON.parse(r.bytes),description:'changed captured metadata'});return r;};
 const changed=await investigate(x.input,options,{store:x.store,fetchData:changedFetch});assert.notEqual(first.reportId,changed.reportId);assert.notEqual(first.analysisConfigFingerprint,changed.analysisConfigFingerprint);
});
test('CLI rejects npm aliases, mixed local/npm inputs and source replay without network',()=>{
 for(const args of [['analyze','npm:picocolors@latest'],['analyze','npm:@scope/name@1.0.0','--artifact','x'],['analyze','npm:picocolors@1.1.1','--source-archive','x']]){const r=spawnSync(process.execPath,[join(root,'packages/cli/dist/index.js'),...args],{encoding:'utf8'});assert.equal(r.status,3);assert.equal(r.stdout,'');}
});

test('valid monorepo subtree retains package evidence and accounts for broader build context',async t=>{
 const repository={url:repo,directory:'packages/pkg'};
 const m={...metadata,repository};
 const {report}=await npmCase(t,{metadata:{repository},manifest:{repository},sourceManifest:{name:'workspace'},sourceEntries:[{path:'root/packages/pkg/package.json',text:JSON.stringify(m)},{path:'root/packages/pkg/index.js',text:'// inert authored fixture\n'},{path:'root/pnpm-lock.yaml',text:'# inert build context\n'}]});
 const candidate=report.bundle.sourceCandidates.find(c=>c.commit===commit);assert.equal(candidate.subdirectory,'packages/pkg');assert.ok(candidate.sourceSnapshotSha256&&candidate.buildContextSha256);assert.equal(report.outcomes.sourceAssociation,'publisher_asserted');assert.ok(report.bundle.changes.every(c=>c.sourcePath?.startsWith('root/packages/pkg/')));assert.ok(report.bundle.coverage.omissions.some(o=>o.path==='root/pnpm-lock.yaml'&&o.reason.includes('build context')));assert.ok(report.bundle.coverage.skippedBytes>0);
});
test('npm metadata subject mismatch preserves raw bytes and failure receipt without creating a misleading artifact',async t=>{
 const dir=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-s3-failure-'));t.after(()=>removeSettledTestStore(dir));const store=new EvidenceStore(join(dir,'store'));
 const raw=Buffer.from(JSON.stringify({...metadata,name:'wrong-subject'}));let error;
 try{await investigate({ecosystem:'npm',packageName:'picocolors',version:'1.1.1',analysisOptions:options},options,{store,fetchData:async url=>download(url,raw)});}catch(e){error=e;}
 assert.equal(error.message,'NPM_METADATA_SUBJECT_MISMATCH');assert.deepEqual(await store.get(sha256(raw)),raw);const receipt=JSON.parse(await store.get(error.cause.retainedFailureRef));assert.equal(receipt.code,'NPM_METADATA_SUBJECT_MISMATCH');assert.equal(receipt.metadataRef,sha256(raw));
});
test('unsupported source entry diagnostic is retained inertly with unknown remaining scope',async t=>{
 const {report,store}=await npmCase(t,{sourceEntries:[{path:'root/rejected-link',type:'symlink',target:'../../inert'}]});
 const inventory=report.bundle.evidence.find(e=>e.side==='source'&&e.locator.metadataKey==='archive-inventory');const raw=JSON.parse(await store.get(inventory.contentRef));assert.equal(raw.complete,false);assert.equal(raw.remainingScope,'unknown');assert.equal(raw.rejectedEntry.originalNamePrefix,'root/rejected-link');assert.equal(raw.rejectedEntry.linkNamePrefix,'../../inert');assert.equal(report.bundle.coverage.complete,false);
});

test('missing npm SRI stays materially incomplete while raw observations remain available',async t=>{
 const {report}=await npmCase(t,{noIntegrity:true});assert.equal(report.outcomes.artifactIntegrity,'not_available');assert.equal(report.outcomes.analysisCompleteness,'incomplete');assert.equal(report.bundle.stages.find(s=>s.stage==='acquire').status,'incomplete');assert.ok(report.bundle.evidence.some(e=>e.kind==='artifact_member'));
});

test('observed API rate limit retains retry metadata and stops remaining tag requests',async()=>{
 let calls=0;const r=await resolveSources(metadata,undefined,undefined,'1.1.1',undefined,async url=>{calls++;throw new DownloadError('HTTP_STATUS_REJECTED',{requestedUrl:url,captureTime:'2026-11-01T00:00:00Z',hops:[{url,status:403,headers:{'x-ratelimit-remaining':'0','x-ratelimit-reset':'1793460000'}}]});});assert.equal(calls,1);assert.ok(r.claims.some(c=>c.failure==='SOURCE_TAG_RATE_LIMITED'));assert.ok(r.claims.some(c=>c.failure==='SOURCE_TAG_DISCOVERY_SKIPPED_RATE_LIMIT'));assert.equal(r.selected.commit,commit);
});

test('fresh observation timestamps preserve report/change IDs and deterministic equivalence while full observations differ',async t=>{
 const x=await npmCase(t);const first=x.report;
 const later=await investigate(x.input,options,{store:x.store,fetchData:async(url,opts)=>{const r=await x.fetchData(url,opts);return {...r,capture:{...r.capture,captureTime:'2026-11-01T00:01:00.000Z'}};}});
 assert.equal(first.reportId,later.reportId);assert.deepEqual(first.bundle.changes.map(c=>c.changeId),later.bundle.changes.map(c=>c.changeId));assert.equal(deterministicReportDigest(first),deterministicReportDigest(later));assert.notEqual(sha256(JSON.stringify(first)),sha256(JSON.stringify(later)));assert.ok(later.bundle.evidence.some(e=>e.observationMethod==='volatile-acquisition-observation-v1'));
});
