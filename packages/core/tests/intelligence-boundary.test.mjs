import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import {createIntelligenceBoundary,INTELLIGENCE_BOUNDARY_LIMITS} from '../dist/intelligence-boundary.js';
import {EvidenceStore} from '../dist/storage.js';
import {sha256} from '../dist/identity.js';
import {manifestFields} from '../dist/comparison.js';
import {runAnalysis} from '../dist/adapter.js';

const fixtureRoot=resolve(import.meta.dirname,'../../../examples/p04/local-mutation');
const baseline=JSON.parse(await readFile(join(fixtureRoot,'bundle.json'),'utf8'));
const retained=new EvidenceStore(join(fixtureRoot,'store'));
const identity={moduleId:'@heurisko/reviewed-boundary-test',moduleVersion:'0.1.0',implementationSha256:'sha256:'+'a'.repeat(64),configurationSha256:'sha256:'+'b'.repeat(64)};
const options={enableAI:false,analysisProfile:'boundary-test'};
const targetId=baseline.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='scripts.postinstall').evidenceId;
const result=(ids=[])=>({schemaVersion:'0.1.0',findings:ids.map(id=>({findingId:'find_boundary_'+id,title:'Script entry changed',observation:'Manifest key scripts.postinstall is reported as added to the artifact.',whyItMatters:'Inspect the retained command without executing it.',evidenceIds:[id],severity:'medium',reviewPriority:'medium',evidenceConfidence:'high',explanationStrength:'exact',limitations:[],nextActions:['Review evidence'],ruleId:'heurisko.manifest.lifecycle-script-change',ruleVersion:'0.1.0'})),interpretations:[],aiState:{status:'disabled',validation:'not_run'},stages:[{stage:'heuristics',status:'complete',errors:[]}],limitations:[]});
async function fixture(){
 const bundle=structuredClone(baseline),overlay=new Map(),calls=[];
 // Focus adversarial probes on one actual retained lifecycle delta; other raw
 // records remain intact. These mutated bundles are explicitly synthetic probes.
 const change=bundle.changes.find(c=>c.evidenceIds.includes(targetId));
 change.evidenceIds=change.evidenceIds.filter(id=>!bundle.evidence.some(e=>e.evidenceId===id&&e.kind==='manifest_delta'&&e.locator.metadataKey?.startsWith('scripts.')&&id!==targetId));
 const evidence=bundle.evidence.find(e=>e.evidenceId===targetId);
 let delta=JSON.parse((await retained.get(evidence.contentRef)).toString('utf8'));
 const store={get:async(ref,limit)=>{calls.push({ref,limit});if(overlay.has(ref)){const bytes=overlay.get(ref);if(bytes.length>limit)throw Error('FILE_LIMIT_OR_TYPE');if(sha256(bytes)!==ref)throw Error('BLOB_HASH_MISMATCH');return Buffer.from(bytes);}return retained.get(ref,limit);}};
 const setDelta=bytes=>{bytes=bytes??Buffer.from(JSON.stringify(delta));const ref=sha256(bytes);overlay.set(ref,bytes);evidence.contentRef=ref;evidence.contentSha256=ref;};
 const setMember=(which,bytes)=>{const old=delta[which+'ContentRef'],member=bundle.evidence.find(e=>change.evidenceIds.includes(e.evidenceId)&&e.kind===which+'_member'&&e.contentRef===old);assert.ok(member);const ref=sha256(bytes);overlay.set(ref,bytes);member.contentRef=ref;member.contentSha256=ref;member.locator.endByte=bytes.length;delta[which+'ContentRef']=ref;setDelta();return member;};
 return {bundle,overlay,calls,store,change,evidence,delta,setDelta,setMember};
}
const incomplete=(r,reason)=>{const s=r.stages.find(s=>s.stage==='heuristics');assert.equal(s.status,'incomplete');assert.ok(s.errors.some(e=>e.code==='INTELLIGENCE_CONTENT_UNRESOLVED'&&e.message.includes(reason)),JSON.stringify(s));assert.ok(r.limitations.some(x=>x.includes(reason)));};

test('actual canonical local fixture resolves hash-bound lifecycle addition and removal without changing evidence',async()=>{
 const before=JSON.stringify(baseline);let supplied;
 const module=createIntelligenceBoundary({identity,store:retained,analyzeEvidence:async(bundle,settings,content)=>{supplied=content;assert.ok(Object.isFrozen(bundle)&&Object.isFrozen(bundle.changes)&&Object.isFrozen(settings)&&Object.isFrozen(content)&&Object.isFrozen(content[0]));assert.throws(()=>content.push({}),TypeError);return result();}});
 const out=await module.analyzeEvidence(baseline,options);assert.equal(out.stages[0].status,'complete');assert.equal(supplied.length,2);
 const added=JSON.parse(supplied.find(c=>c.evidenceId===targetId).text);assert.equal(added.source,null);assert.equal(added.artifact.value,'HEURISKO_INERT_TEST_ONLY');
 assert.ok(supplied.some(c=>{const d=JSON.parse(c.text);return d.pointer==='/scripts/test'&&d.source?.value==='node tests/test.js'&&d.artifact===null;}));
 for(const c of supplied)assert.equal(sha256(c.text),c.contentRef);assert.equal(JSON.stringify(baseline),before);
});

test('the reviewed 55240e9 deterministic consumer accepts the real retained addition through the G0 adapter',async()=>{
 const {analyzeEvidence}=await import('../../intelligence-reviewed/dist/index.js');
 const before=JSON.stringify(baseline);
 const module=createIntelligenceBoundary({identity,store:retained,analyzeEvidence});
 const analysis=await runAnalysis(baseline,options,module);
 const finding=analysis.findings.find(f=>f.ruleId==='heurisko.manifest.lifecycle-script-change'&&f.evidenceIds.includes(targetId));
 assert.ok(finding);assert.match(finding.observation,/added to the artifact/);assert.equal(finding.evidenceConfidence,'high');
 assert.equal(analysis.stages.find(s=>s.stage==='heuristics').status,'complete');assert.equal(analysis.aiState.status,'disabled');
 assert.equal(JSON.stringify(baseline),before);
});

test('actual EvidenceStore missing and corrupt delta bytes remain unresolved without supplying content',async t=>{
 const root=await mkdtemp(join(await import('node:fs/promises').then(m=>m.realpath(tmpdir())),'heurisko-boundary-'));t.after(()=>rm(root,{recursive:true,force:true}));const missing=new EvidenceStore(root);await missing.initialize();
 for(const which of ['delta','source'])for(const corrupt of [false,true]){
  const f=await fixture(),broken=which==='delta'?f.evidence.contentRef:f.delta.sourceContentRef;if(corrupt)await writeFile(missing.blobPath(broken),'different bytes');let content;
  const module=createIntelligenceBoundary({identity,store:{get:(ref,limit)=>ref===broken?missing.get(ref,limit):retained.get(ref,limit)},analyzeEvidence:async(_b,_o,c)=>{content=c;return result([targetId]);}});
  const r=await module.analyzeEvidence(f.bundle,options);assert.deepEqual(content,[]);incomplete(r,corrupt?'BLOB_HASH_MISMATCH':'CONTENT_READ_FAILED');
  assert.match(r.findings[0].observation,/direction remain unresolved/);assert.equal(r.findings[0].evidenceConfidence,'limited');assert.equal(r.findings[0].explanationStrength,'unexplained');assert.equal(r.findings[0].severity,'medium');
 }
});

test('foreign pointer, forged member link, span mismatch and false absence cannot establish script direction',async()=>{
 for(const [name,alter,reason]of [
  ['pointer',async f=>{f.delta.pointer='/scripts/preinstall';f.setDelta();},'DELTA_POINTER_OR_VERSION_MISMATCH'],
  ['foreign link',async f=>{f.delta.artifactContentRef=f.delta.sourceContentRef;f.setDelta();},'MEMBER_BINDING_MISMATCH'],
  ['span',async f=>{f.delta.artifact.endByte--;f.setDelta();},'DELTA_MEMBER_VALUE_MISMATCH'],
  ['value',async f=>{f.delta.artifact.value='FORGED_LITERAL';f.setDelta();},'DELTA_MEMBER_VALUE_MISMATCH'],
  ['false absence',async f=>{const original=JSON.parse((await retained.get(f.delta.sourceContentRef)).toString('utf8'));original.scripts.postinstall='source command';f.setMember('source',Buffer.from(JSON.stringify(original)));},'DELTA_ABSENCE_MISMATCH'],
  ['null file',async f=>{f.delta.sourceContentRef=null;f.setDelta();},'MEMBER_ABSENCE_UNPROVEN'],
 ]){
  const f=await fixture();await alter(f);let supplied;
  const r=await createIntelligenceBoundary({identity,store:f.store,analyzeEvidence:async(_b,_o,c)=>{supplied=c;return result([targetId]);}}).analyzeEvidence(f.bundle,options);
  assert.deepEqual(supplied,[],name);incomplete(r,reason);assert.match(r.findings[0].observation,/direction remain unresolved/,name);
 }
});

test('duplicate-key JSON and invalid UTF8 are rejected for deltas and linked original manifests',async()=>{
 for(const [kind,bytes,reason]of [
  ['delta',Buffer.from('{"version":"heurisko-manifest-delta-v1","version":"heurisko-manifest-delta-v1"}'),'MANIFEST_DUPLICATE_KEY'],
  ['delta',Buffer.from([0x7b,0x22,0xc3,0x22,0x3a,0x31,0x7d]),'CONTENT_ENCODING_INVALID'],
  ['source',Buffer.from('{"scripts":{},"scripts":{}}'),'MANIFEST_DUPLICATE_KEY'],
  ['source',Buffer.from([0x7b,0x22,0xc3,0x22,0x3a,0x31,0x7d]),'CONTENT_ENCODING_INVALID'],
  ['source',Buffer.from('\ufeff{"scripts":{}}'),'CONTENT_BOM_UNSUPPORTED'],
 ]){
  const f=await fixture();if(kind==='delta')f.setDelta(bytes);else f.setMember(kind,bytes);let supplied;
  const r=await createIntelligenceBoundary({identity,store:f.store,analyzeEvidence:async(_b,_o,c)=>{supplied=c;return result();}}).analyzeEvidence(f.bundle,options);
  assert.deepEqual(supplied,[]);incomplete(r,reason);
 }
});

test('both-null and canonically equal-value pseudo-deltas are rejected before any member resolution',async()=>{
 for(const equal of [false,true]){const f=await fixture();if(equal)f.delta.source=structuredClone(f.delta.artifact);else f.delta.artifact=null;f.setDelta();let supplied;
  const r=await createIntelligenceBoundary({identity,store:f.store,analyzeEvidence:async(_b,_o,c)=>{supplied=c;return result();}}).analyzeEvidence(f.bundle,options);assert.deepEqual(supplied,[]);incomplete(r,'DELTA_VALUES_UNCHANGED');assert.equal(f.calls.length,1);
 }
});

test('a delta referenced by another change is unresolved even when its content hash exists in the store',async()=>{
 const f=await fixture();f.bundle.changes.push({...structuredClone(f.change),changeId:'chg_foreign',sourcePath:'other/package.json'});let supplied;
 const r=await createIntelligenceBoundary({identity,store:f.store,analyzeEvidence:async(_b,_o,c)=>{supplied=c;return result();}}).analyzeEvidence(f.bundle,options);assert.deepEqual(supplied,[]);incomplete(r,'DELTA_CHANGE_BINDING_AMBIGUOUS');assert.equal(f.calls.length,0);
});

test('individual delta/member byte bounds are enforced without passing oversized text to intelligence',async()=>{
 for(const which of ['delta','source']){const f=await fixture();if(which==='delta')f.setDelta(Buffer.alloc(INTELLIGENCE_BOUNDARY_LIMITS.deltaBytes+1,32));else f.setMember('source',Buffer.alloc(INTELLIGENCE_BOUNDARY_LIMITS.memberBytes+1,32));let supplied;
  const r=await createIntelligenceBoundary({identity,store:f.store,analyzeEvidence:async(_b,_o,c)=>{supplied=c;return result();}}).analyzeEvidence(f.bundle,options);assert.deepEqual(supplied,[]);incomplete(r,'FILE_LIMIT_OR_TYPE');assert.ok(f.calls.every(c=>c.limit<=INTELLIGENCE_BOUNDARY_LIMITS.memberBytes));assert.equal(f.calls[0].limit,INTELLIGENCE_BOUNDARY_LIMITS.deltaBytes);
 }
});

test('record count and total read budgets remain bounded even when every content read fails after consuming its allowance',async()=>{
 const f=await fixture();const target=f.evidence;f.change.evidenceIds=f.change.evidenceIds.filter(id=>id!==targetId);
 for(let n=0;n<129;n++){const e={...structuredClone(target),evidenceId:'ev_probe_'+n};f.bundle.evidence.push(e);f.change.evidenceIds.push(e.evidenceId);}
 let calls=0,budget=0,supplied;const store={get:async(_ref,limit)=>{calls++;budget+=limit;throw Error('BLOB_HASH_MISMATCH');}};
 const r=await createIntelligenceBoundary({identity,store,analyzeEvidence:async(_b,_o,c)=>{supplied=c;return result(['ev_probe_128']);}}).analyzeEvidence(f.bundle,options);
 assert.deepEqual(supplied,[]);assert.equal(calls,64);assert.equal(budget,INTELLIGENCE_BOUNDARY_LIMITS.totalBytes);incomplete(r,'CONTENT_TOTAL_LIMIT');incomplete(r,'CONTENT_RECORD_COUNT_LIMIT');assert.match(r.findings[0].observation,/direction remain unresolved/);
 let accepted;
 const bounded=await createIntelligenceBoundary({identity,store:f.store,analyzeEvidence:async(_b,_o,c)=>{accepted=c;return result(['ev_probe_128']);}}).analyzeEvidence(f.bundle,options);
 assert.equal(accepted.length,128);assert.equal(f.calls.length,3);incomplete(bounded,'CONTENT_RECORD_COUNT_LIMIT');
});

test('pre-cancel, cancellation during a read, and an expired deadline never call the intelligence function',async()=>{
 const f=await fixture();let calls=0,reads=0;const c=new AbortController();c.abort();
 await assert.rejects(createIntelligenceBoundary({identity,store:{get:async()=>{reads++;return Buffer.alloc(0);}},signal:c.signal,analyzeEvidence:async()=>{calls++;return result();}}).analyzeEvidence(f.bundle,options),e=>e.code==='CANCELLED');assert.equal(reads,0);
 await assert.rejects(createIntelligenceBoundary({identity,store:f.store,deadlineAt:Date.now()-1,analyzeEvidence:async()=>{calls++;return result();}}).analyzeEvidence(f.bundle,options),e=>e.code==='ANALYSIS_TIMEOUT');
 const during=new AbortController();let ready,release;const waiting=new Promise(r=>ready=r),gate=new Promise(r=>release=r);
 const pending=createIntelligenceBoundary({identity,store:{get:async(ref,limit)=>{ready();await gate;return retained.get(ref,limit);}},signal:during.signal,analyzeEvidence:async()=>{calls++;return result();}}).analyzeEvidence(f.bundle,options);
 await waiting;during.abort();release();await assert.rejects(pending,e=>e.code==='CANCELLED');assert.equal(calls,0);
 let lateReads=0;
 await assert.rejects(createIntelligenceBoundary({identity,deadlineAt:Date.now()+50,store:{get:async(ref,limit)=>{lateReads++;await new Promise(r=>setTimeout(r,80));return retained.get(ref,limit);}},analyzeEvidence:async()=>{calls++;return result();}}).analyzeEvidence(f.bundle,options),e=>e.code==='ANALYSIS_TIMEOUT');assert.equal(lateReads,1);assert.equal(calls,0);
});

test('caller mutation during a delayed read cannot replace the bundle, options or resolved retained bytes',async()=>{
 const f=await fixture(),settings={...options};let ready,release,seen;const waiting=new Promise(r=>ready=r),gate=new Promise(r=>release=r);let once=true;
 const pending=createIntelligenceBoundary({identity,store:{get:async(ref,limit)=>{if(once){once=false;ready();await gate;}return f.store.get(ref,limit);}},analyzeEvidence:async(b,o,c)=>{seen={b,o,c};return result();}}).analyzeEvidence(f.bundle,settings);
 await waiting;f.bundle.changes=[];settings.enableAI=true;release();await pending;assert.ok(seen.b.changes.length);assert.equal(seen.o.enableAI,false);assert.equal(JSON.parse(seen.c[0].text).artifact.value,'HEURISKO_INERT_TEST_ONLY');
});

test('exact member spans in the canonical fixture are independently reproducible by the strict scanner',async()=>{
 const f=await fixture();const fields=manifestFields(await retained.get(f.delta.artifactContentRef));assert.deepEqual(fields.get('/scripts/postinstall'),f.delta.artifact);assert.equal(manifestFields(await retained.get(f.delta.sourceContentRef)).has('/scripts/postinstall'),false);
});
