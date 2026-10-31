// Read-only verification of actual retained S3 output. This does not execute
// package/build/model code or use the network.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {EvidenceStore,decodeReport,decodeBundle,canonicalJSON,sha256,writeImmutable,exitCode,engineCodeIdentity} from '../packages/core/dist/index.js';
const historical=process.argv.includes('--historical');
const receiptArgument=process.argv[3]&&!process.argv[3].startsWith('--')?process.argv[3]:undefined;
const base=resolve(process.argv[2]??'examples/s3/current');const store=new EvidenceStore(join(base,'store'));
const corpus=JSON.parse(await fs.readFile(join(base,'corpus-manifest.json'),'utf8'));
const current=await engineCodeIdentity(),digests=current.codeDigests,currentEngine=current.engine;
const historicalReceipt=historical?JSON.parse(await fs.readFile(join(base,'verification.json'),'utf8')):undefined;
const engine=historicalReceipt?.engine??currentEngine;const results=[];let references=0,diffSpans=0,manifestSpans=0;
for(const item of corpus.cases){
 const m=JSON.parse(await fs.readFile(join(base,item.manifest),'utf8'));const raw=await fs.readFile(join(base,m.reportFile));assert.equal(sha256(raw),m.reportContentRef);assert.equal(m.reportContentRef,item.reportContentRef);
 const r=await decodeReport(raw.toString());assert.deepEqual(await store.loadReport(m.reportContentRef),r);await store.verifyEvidence(r);const b=r.bundle;assert.deepEqual(await decodeBundle(await fs.readFile(join(base,m.bundleFile),'utf8')),b);assert.equal(r.reportId,m.reportId);assert.equal(r.analysisConfigFingerprint,m.analysisConfigFingerprint);
 const metadata=JSON.parse(await store.get(m.metadataRef));const artifact=await store.get(m.observedSha256);const integrity='sha512-'+createHash('sha512').update(artifact).digest('base64');assert.equal(metadata.dist.integrity,integrity);assert.equal(m.expectedIntegrity,integrity);assert.equal(b.artifact.integrity.status,'matched');assert.equal(metadata.name,m.name);assert.equal(metadata.version,m.version);assert.equal(b.artifact.origin,'registry');assert.equal(b.provenance.status,'not_checked');assert.equal(b.provenance.artifactBinding,'not_checked');assert.equal(exitCode(r),2);assert.equal(r.analysis.findings.length,0);assert.equal(r.analysis.interpretations.length,0);
 const config=JSON.parse(await store.get(b.evidence.find(e=>e.locator.metadataKey==='analysis-configuration').contentRef));assert.ok((historical?['heurisko-config-v2','heurisko-config-v3']:['heurisko-config-v3']).includes(config.version));assert.equal(config.versions.engine,engine);assert.equal(config.versions.verifier,'none');assert.equal(config.versions.trustRoot,'none');
 const pathMap=JSON.parse(await store.get(b.evidence.find(e=>e.locator.metadataKey==='path-mapping-and-scope').contentRef));assert.equal(pathMap.sourceSubtree,m.selectedSource.selected?.subdirectory??'');
 for(const candidate of b.sourceCandidates)if(candidate.sourceSnapshotSha256)assert.equal(sha256(await store.get(candidate.sourceSnapshotSha256)),candidate.sourceSnapshotSha256);
 for(const e of b.evidence){
  const content=await store.get(e.contentRef);references++;
  if(['artifact_member','source_member'].includes(e.kind)){assert.equal(sha256(content),e.contentSha256);assert.equal(e.locator.endByte,content.length);}
  if(e.kind==='raw_diff'){
   const d=JSON.parse(content);if(d.version!=='heurisko-raw-diff-v1')continue;
   for(const side of ['source','artifact']){const part=d[side];if(!part.contentRef)continue;const bytes=await store.get(part.contentRef);const span=part.changedSpan;assert.ok(span.startByte>=0&&span.startByte<=span.endByte&&span.endByte<=bytes.length);assert.equal(bytes.subarray(span.startByte,Math.min(span.endByte,span.startByte+2048)).toString('base64'),part.excerptBase64);diffSpans++;}
  } else if(e.kind==='manifest_delta') {
   const d=JSON.parse(content);for(const side of ['source','artifact'])if(d[side]){const bytes=await store.get(d[side+'ContentRef']);assert.deepEqual(JSON.parse(bytes.subarray(d[side].startByte,d[side].endByte)),d[side].value);manifestSpans++;}
  }
 }
 if(m.license.retainedArtifactLicense){const license=b.evidence.find(e=>e.kind==='artifact_member'&&/^package\/LICENSE(?:\.md|\.txt)?$/i.test(e.locator.path));assert.deepEqual(await fs.readFile(join(base,m.license.retainedArtifactLicense)),await store.get(license.contentRef));}
 for(const entry of [...m.malharHandoff.buildContextEvidence,...m.malharHandoff.artifactSourceMaps]){const e=b.evidence.find(e=>e.evidenceId===entry.evidenceId);assert.equal(e.contentRef,entry.contentRef);assert.equal(e.locator.path,entry.path);}
 if(m.caseId==='B1'){assert.equal(r.outcomes.sourceAssociation,'ambiguous');assert.ok(b.sourceCandidates.some(c=>c.conflicts.includes('SOURCE_VERSION_LABEL_DIFFERS')));}
 if(m.caseId==='B2'){assert.equal(r.outcomes.sourceAssociation,'publisher_asserted');assert.ok(m.malharHandoff.artifactSourceMaps.length>0);}
 if(m.caseId==='B3'){assert.equal(b.coverage.complete,false);const inv=JSON.parse(await store.get(b.evidence.find(e=>e.side==='source'&&e.locator.metadataKey==='archive-inventory').contentRef));assert.equal(inv.code,'ARCHIVE_UNSUPPORTED_ENTRY');assert.equal(inv.remainingScope,'unknown');assert.ok(inv.rejectedEntry);}
 if(m.caseId==='B3R'){assert.equal(r.outcomes.sourceAssociation,'user_supplied');assert.equal(pathMap.sourceSubtree,'packages/shared');assert.ok(b.coverage.skippedBytes>0);assert.ok(b.coverage.omissions.length>0);}
 results.push({caseId:m.caseId,reportId:r.reportId,reportContentRef:m.reportContentRef,configurationFingerprint:r.analysisConfigFingerprint,evidenceCount:b.evidence.length,exitCode:exitCode(r),outcomes:r.outcomes});
}
const result={version:'heurisko-s3-verification-v1',checkedAt:new Date().toISOString(),validationScope:historical?'Historical retained evidence/receipts; no current-code binding claimed.':'Current code and retained evidence',engine,codeDigests:historicalReceipt?.codeDigests??digests,results,retainedEvidenceReferencesVerified:references,rawDiffSideSpansVerified:diffSpans,manifestValueSpansVerified:manifestSpans,scope:'Hash/schema/reference/span/current-code/corpus handoff checks only. No Malhar quality, cryptographic verification, model, rebuild or complete P04 claim.'};
if(receiptArgument)await writeImmutable(resolve(receiptArgument),Buffer.from(JSON.stringify(result,null,2)+'\n'));
console.log(JSON.stringify(result,null,2));
