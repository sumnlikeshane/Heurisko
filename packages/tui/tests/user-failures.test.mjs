import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {readFile,mkdtemp,mkdir,copyFile,rm,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {ReportReader} from '../../../integration/part4/dist/report-reader.js';
import {sourceDetails,scopeExplanation,findingsAvailability,rootLabel} from '../dist/investigation-summary.js';
import {reportItems,fileTree,defaultCollapsed} from '../dist/model.js';
const base=resolve(import.meta.dirname,'../../../examples/part4/user-failures');
const open=store=>ReportReader.openFile(resolve(base,'reproduction.report.json'),store??resolve(base,'reproduction-store'));
test('the exact user report explains missing deterministic analysis, successes and ambiguity independently of AI',async()=>{
 const reader=await open(),before=JSON.stringify(reader.report);
 assert.equal(reader.reportContentRef,'sha256:dd4fb19136fa91ca1581336c6fbc22b864b86e413eaa9978ece3ee0f08c52a3b');
 const text=findingsAvailability(reader).join('\n');
 for(const value of ['Malhar analysis module not supplied','integrity matched','2 modified / 5 identical / 12 unresolved','AI: disabled','enabling AI does not supply it'])assert.ok(text.includes(value));
 assert.match(scopeExplanation(reader).join('\n'),/Historical wording caveat/);
 assert.equal(JSON.stringify(reader.report),before);
});
test('source explanation resolves exact bound version values, compared candidate, basis, rate limits and root',async()=>{
 const reader=await open(),details=await sourceDetails(reader),text=details[0].lines.join('\n');
 for(const value of ['Association ambiguous','Selected comparison target:','user-override, registry','artifact 1.1.1; selected source 1.1.0','SOURCE_VERSION_LABEL_DIFFERS','SOURCE_TAG_RATE_LIMITED','not evidence that the tag is absent','(repository root)','New investigation with this target:','Provenance: not_checked; build stage skipped'])assert.ok(text.includes(value),value);
 const id=details[0].refs[0];assert.equal(reader.evidence(id).locator.metadataKey,'version');
 const source=await reader.readCitation(id,'source'),artifact=await reader.readCitation(id,'artifact');
 assert.equal(Buffer.from(source.bytesBase64,'base64').toString(),'"1.1.0"');assert.equal(Buffer.from(artifact.bytesBase64,'base64').toString(),'"1.1.1"');
 assert.equal(rootLabel(''),'(repository root)');assert.equal(rootLabel(undefined),'Not recorded');assert.equal(rootLabel('npm/esbuild'),'npm/esbuild');
});
test('missing evidence cannot supply a displayed version comparison or claim of compared selection',async()=>{
 const reader=await open(resolve(base,'absent-for-render-test')),details=await sourceDetails(reader),text=details[0].lines.join('\n');
 assert.ok(!text.includes('artifact 1.1.1; selected source 1.1.0'));assert.ok(!text.includes('Selected comparison target:'));assert.match(text,/MISSING_BLOB/);
});
test('a partially missing source claim remains explicit alongside readable selection and full immutable identity',async()=>{
 const reader=await open(),store=await realpath(await mkdtemp(resolve(tmpdir(),'heurisko-source-summary-')));
 try{
  await mkdir(resolve(store,'blobs'));
  const claims=reader.report.bundle.evidence.filter(e=>e.kind==='source_claim');
  const missing=claims.find(e=>e.evidenceId===reader.report.bundle.sourceCandidates[0].evidenceIds[0]);
  for(const e of claims)if(e!==missing&&e.contentRef)await copyFile(resolve(base,'reproduction-store/blobs',e.contentRef.slice(7)),resolve(store,'blobs',e.contentRef.slice(7)));
  const partial=await open(store),text=(await sourceDetails(partial))[0].lines.join('\n');
  assert.match(text,/Selected comparison target:/);
  assert.ok(text.includes(reader.report.bundle.sourceCandidates[0].commit));
  assert.ok(text.includes(`Claim bytes unavailable: ${missing.evidenceId} / MISSING_BLOB`));
  assert.match(text,/Version check: manifest values unavailable/);
  assert.ok(!text.includes('artifact 1.1.1; selected source 1.1.0'));
 }finally{await rm(store,{recursive:true,force:true});}
});
test('an omitted optional snapshot digest does not erase recorded source members or comparison',async()=>{
 const reader=await ReportReader.openFile(resolve(base,'../../../packages/contracts/tests/fixtures/F0/report.json'),resolve(base,'absent-contract-fixture-store'));
 assert.equal(reader.report.bundle.sourceCandidates[0].sourceSnapshotSha256,undefined);
 assert.ok(reader.report.bundle.evidence.some(e=>e.kind==='source_member'));
 assert.ok(reader.report.bundle.changes.some(c=>c.sourcePath&&c.artifactPath));
 const text=(await sourceDetails(reader))[0].lines.join('\n');
 assert.match(text,/Source snapshot digest is not recorded/);
 assert.ok(!text.includes('Source files were not acquired'));
 assert.ok(!text.includes('no file comparison was possible'));
});
test('a synthetic invalid or unavailable version read cannot create replacement-decoded labels or fall back to another manifest',async()=>{
 const reader=await open(),before=JSON.stringify(reader.report);
 const id=reader.report.bundle.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='version').evidenceId;
 const source=await reader.readCitation(id,'source');assert.equal(source.kind,'content');
 for(const [reason,read]of [
  ['NON_UTF8',{...source,encoding:'base64',bytesBase64:Buffer.from([0x22,0xc3,0x22]).toString('base64'),inertText:undefined}],
  ['INVALID_VERSION_VALUE',{...source,encoding:'utf8',bytesBase64:Buffer.from([0x22,0xc3,0x22]).toString('base64'),inertText:undefined}],
  ['MISSING_BLOB',{kind:'metadata_only',reason:'MISSING_BLOB',evidence:reader.evidence(id)}],
 ]){
  const boundary={report:reader.report,readEvidence:(...args)=>reader.readEvidence(...args),readCitation:(...args)=>args[0]===id&&args[1]==='source'?Promise.resolve(read):reader.readCitation(...args)};
  const details=(await sourceDetails(boundary))[0],text=details.lines.join('\n');
  assert.match(text,/Version citation unavailable:/);assert.ok(text.includes(reason));
  assert.ok(!text.includes('artifact: READ_LIMIT'));
  assert.ok(!text.includes('Version labels:'));assert.ok(!text.includes('\ufffd'));
  assert.equal(details.refs[0],id);
 }
 assert.equal(JSON.stringify(reader.report),before);
});
test('directories are labeled navigation, file statuses and full paths survive, byte-delta citation precedes metadata delta',async()=>{
 const reader=await open(),items=reportItems(reader,2,0),tree=fileTree(items,defaultCollapsed(reader));
 assert.ok(tree.some(i=>i.label.includes('Artifact root/')));assert.ok(tree.some(i=>i.label.includes('Source root/')));
 assert.ok(tree.some(i=>i.status==='modified'));assert.ok(tree.some(i=>i.directory&&i.lines.some(l=>l.includes('no file comparison is implied'))));
 for(const c of reader.report.bundle.changes){const item=items.find(i=>i.id===c.changeId);assert.ok(item.lines.some(l=>l.includes(c.artifactPath??c.sourcePath)));if(c.status==='modified')assert.equal(reader.evidence(item.refs[0]).observationMethod,'common-prefix-suffix-byte-span-v1');}
});
