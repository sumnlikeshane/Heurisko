// Bounded public-data capture through the production engine. No target package,
// build, model or verifier code is imported or executed.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {EvidenceStore,investigate,sha256,writeImmutable,encodeReport,exitCode,decodeReport} from '../packages/core/dist/index.js';
import {retainedS3Fetch} from './retained-s3-fetch.mjs';
const base=resolve(process.argv[2]??'.heurisko/s3-capture');
const replayBase=process.argv[3]==='--replay'?resolve(process.argv[4]):undefined;
await fs.mkdir(base,{recursive:true});const store=new EvidenceStore(join(base,'store'));
const options={enableAI:false,analysisProfile:'raw-static-s3-v1',trustPolicyRef:'s3-unconfigured-provenance-policy'};
const cases=[];
for(const [id,name,version] of [['B1','picocolors','1.1.1'],['B2','ts-pattern','5.9.0'],['B3','zod','4.6.7'],['B3R','@vue/shared','3.5.22']]) {
 process.stderr.write(`${id} ${name}@${version}\n`);
 const sourceOverride=id==='B3R'?{repo:'https://github.com/vuejs/core',commit:'5a8aa0b2ba575e098cbb63b396e9bcb751eb3a0f',subdirectory:'packages/shared'}:undefined;
 const report=await investigate({ecosystem:'npm',packageName:name,version,analysisOptions:options,...(sourceOverride?{sourceOverride}:{})},options,{store,...(replayBase?{fetchData:await retainedS3Fetch(replayBase,id)}:{}),onProgress:e=>process.stderr.write(`${id} ${e.stage}: ${e.status}\n`)});
 if(replayBase) {
  const original=JSON.parse(await fs.readFile(join(replayBase,`${id}.report.json`),'utf8'));
  assert.deepEqual(report.outcomes,original.outcomes,'Offline replay must preserve observed outcomes');
  assert.deepEqual(report.bundle.coverage,original.bundle.coverage,'Offline replay must preserve known/unknown scope');
  assert.deepEqual(report.bundle.changes,original.bundle.changes,'Offline replay must preserve raw changes');
  assert.notEqual(report.reportId,original.reportId,'Repaired engine must have a new identity');
 }
 const reportBytes=Buffer.from(await encodeReport(report));const reportFile=`${id}.report.json`,bundleFile=`${id}.bundle.json`;
 await writeImmutable(join(base,reportFile),reportBytes);await writeImmutable(join(base,bundleFile),Buffer.from(JSON.stringify(report.bundle)));
 const b=report.bundle;await store.verifyEvidence(report);assert.deepEqual(await decodeReport(reportBytes.toString()),report);
 const metadata=JSON.parse((await store.get(b.evidence.find(e=>e.kind==='registry_metadata').contentRef)).toString());
 const artifactBytes=await store.get(b.artifact.observedSha256);
 const observedSha512=createHash('sha512').update(artifactBytes).digest('base64');
 assert.equal(metadata.name,name);assert.equal(metadata.version,version);assert.equal(metadata.dist.integrity,'sha512-'+observedSha512);assert.equal(b.artifact.integrity.status,'matched');
 const original=await fs.readFile(join(base,reportFile));assert.equal(sha256(original),sha256(reportBytes));
 const sourceClaims=b.evidence.filter(e=>e.kind==='source_claim');
 const selectedRecord=b.evidence.find(e=>e.locator.metadataKey==='source-selection');
 const selected=JSON.parse((await store.get(selectedRecord.contentRef)).toString());
 const handoff=b.evidence.filter(e=>e.kind==='source_member'&&(/(?:^|\/)(?:package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml|(?:tsup|rollup|vite|tsdown|tsconfig|babel)[^/]*|LICENSE[^/]*|NOTICE[^/]*|[^/]+\.map)$/.test(e.locator.path)||e.locator.path.includes('/.github/workflows/'))).map(e=>({path:e.locator.path,evidenceId:e.evidenceId,contentRef:e.contentRef}));
 const artifactMaps=b.evidence.filter(e=>e.kind==='artifact_member'&&e.locator.path.endsWith('.map')).map(e=>({path:e.locator.path,evidenceId:e.evidenceId,contentRef:e.contentRef}));
 const license=b.evidence.find(e=>e.kind==='artifact_member'&&/^package\/LICENSE(?:\.md|\.txt)?$/i.test(e.locator.path));
 if(license)await writeImmutable(join(base,`${id}-LICENSE.txt`),await store.get(license.contentRef));
 const record={caseId:id,role:id==='B3'?'provisional-monorepo-blocked-source':id==='B3R'?'replacement-monorepo-candidate':'provisional-corpus',...(id==='B3R'?{sourceOverrideObservation:{releasePage:'https://github.com/vuejs/core/releases/tag/v3.5.22',observedCommitLink:'https://github.com/vuejs/core/commit/5a8aa0b2ba575e098cbb63b396e9bcb751eb3a0f',method:'Official GitHub release webpage via web retrieval; cached two days at observation. Direct commit page retrieval failed. API ref requests returned HTTP 403. Explicit corpus-author candidate override; no fresh tag or cryptographic verification.'},replacementReason:'The provisional zod@4.6.7 immutable source snapshot is rejected for an unsupported archive entry; retain it as U2 uncertainty and validate this scoped monorepo candidate instead.'}:{}),name,version,fixtureKind:replayBase?'genuine-public-release-replay':'genuine-public-release-capture',acquisitionMode:replayBase?'offline retained public bytes/observations; no freshness check':'fresh bounded acquisition',registry:'https://registry.npmjs.org',artifactFilename:b.artifact.artifactFilename,artifactURL:metadata.dist.tarball,captureTime:b.artifact.captureTime,expectedIntegrity:metadata.dist.integrity,observedSha256:b.artifact.observedSha256,observedSha512:'sha512-'+observedSha512,metadataRef:b.evidence.find(e=>e.kind==='registry_metadata').contentRef,sourceCandidates:b.sourceCandidates,selectedSource:selected,provenance:b.provenance,reportId:report.reportId,reportFile,bundleFile,reportContentRef:sha256(reportBytes),analysisConfigFingerprint:report.analysisConfigFingerprint,outcomes:report.outcomes,rawCoverage:b.coverage,evidenceCount:b.evidence.length,exitCode:exitCode(report),license:{advertised:metadata.license??null,retainedArtifactLicense:license?`${id}-LICENSE.txt`:null},malharHandoff:{sourceClaims:sourceClaims.map(e=>e.evidenceId),buildContextEvidence:handoff,artifactSourceMaps:artifactMaps,interpretationOwner:'Malhar; no generated-output explanation or model result supplied by this capture',delivery:'Prepared locally; no external message sent'},independentChecks:{artifactSHA512AgainstRawRegistryMetadata:'passed',rawEvidenceHashes:'passed',reportSchemaSemanticsAndReopen:'passed'},limitations:b.limitations};
 await writeImmutable(join(base,`${id}.manifest.json`),Buffer.from(JSON.stringify(record,null,2)+'\n'));cases.push(record);
 console.log(JSON.stringify({id,reportId:record.reportId,outcomes:record.outcomes,files:[b.coverage.artifactFiles,b.coverage.sourceFiles],evidenceCount:b.evidence.length,selected:selected.selected,license:record.license}));
}
await writeImmutable(join(base,'corpus-manifest.json'),Buffer.from(JSON.stringify({version:'heurisko-s3-corpus-v1',capturedAt:new Date().toISOString(),cases:cases.map(c=>({caseId:c.caseId,manifest:`${c.caseId}.manifest.json`,reportId:c.reportId,reportContentRef:c.reportContentRef})),acquisitionMode:replayBase?'offline retained observation replay':'fresh bounded acquisition',scope:'Static acquisition/integrity/source-candidate/raw evidence only. No broad correctness, benignness, cryptographic provenance, interpretation/model or complete P04 claim.'},null,2)+'\n'));
