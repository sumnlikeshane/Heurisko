import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {EvidenceStore,rawCompare,retainEvidence,loadConfiguredAnalysisModule,sha256,createIntelligenceBoundary} from '../dist/index.js';
import {byteRelationship,localMapReference,sourceMapData} from '../dist/relationships.js';
const options={enableAI:false,analysisProfile:'phase2-development-conformance'};
const seed=JSON.parse(await readFile(new URL('../../../examples/p04/local-mutation/bundle.json',import.meta.url),'utf8'));
async function fixture(t,source,artifact,{scope=true}={}) {
  const root=await mkdtemp(join(await realpath(tmpdir()),'heurisko-p2-rule-'));t.after(()=>rm(root,{recursive:true,force:true}));
  const store=new EvidenceStore(root),bundle=structuredClone(seed);
  bundle.fixtureKind='synthetic_contract';bundle.evidence=[];bundle.changes=[];bundle.sourceCandidates=[];
  bundle.coverage={sourceFiles:Object.keys(source).length,artifactFiles:Object.keys(artifact).length,comparedFiles:0,analyzedBytes:0,skippedBytes:0,unsupportedBytes:0,omissions:[],complete:scope,limitations:[]};
  const members=async(files,side)=>{
    const result=[];
    for(const [path,value]of Object.entries(files)) {
      const bytes=Buffer.isBuffer(value)?value:Buffer.from(typeof value==='string'?value:JSON.stringify(value));
      const e=await retainEvidence(bundle,store,{kind:side+'_member',side,locator:{path:side+'/'+path,startByte:0,endByte:bytes.length},observationMethod:'raw-member-sha256-v1',limitations:[]},bytes);
      bundle.coverage.analyzedBytes+=bytes.length;
      result.push({relativePath:path,evidenceId:e.evidenceId,member:{path:side+'/'+path,type:'file',size:bytes.length,sha256:sha256(bytes),contentRef:e.contentRef,mode:420,uid:0,gid:0,mtime:0,pax:{}}});
    }return result;
  };
  const sm=await members(source,'source'),am=await members(artifact,'artifact');await rawCompare(bundle,store,am,sm,scope);
  const analyze=async(selector)=>{const module=await loadConfiguredAnalysisModule({store,selector});return module.analyzeEvidence(bundle,options);};
  return {root,store,bundle,analyze};
}
const scripts=value=>({'package.json':{name:'inert-original-development',scripts:value}});
const event=r=>r.findings.filter(f=>f.ruleId.startsWith('heurisko.manifest.'));

for(const key of ['preinstall','install','postinstall','prepare'])for(const direction of ['add','change','remove'])test(`Q1 actual loader: ${key} ${direction}`,async t=>{
  const from=direction==='add'?{}:{[key]:'HEURISKO_INERT_SOURCE'};
  const to=direction==='remove'?{}:{[key]:'HEURISKO_INERT_ARTIFACT'};
  const f=await fixture(t,scripts(from),scripts(to)),before=JSON.stringify(f.bundle),a=await f.analyze(),findings=event(a);
  assert.equal(findings.length,1);assert.match(findings[0].observation,new RegExp(direction==='add'?'added':direction==='remove'?'removed':'changed from source'));
  assert.equal(findings[0].severity,direction==='remove'?'informational':'medium');assert.equal(findings[0].reviewPriority,direction==='remove'?'low':'medium');
  assert.equal(findings[0].evidenceConfidence,'high');assert.deepEqual(await f.analyze(),a);assert.equal(JSON.stringify(f.bundle),before);assert.equal(a.aiState.status,'disabled');
  assert.ok(a.findings.some(f=>f.ruleId==='heurisko.change.unresolved-difference'));
});
test('Q1 legacy selector preserves the reproduced upstream removal defect under its old rule identity',async t=>{
  const f=await fixture(t,scripts({postinstall:'INERT'}),scripts({}));
  assert.equal(event(await f.analyze('55240e9'))[0].severity,'medium');assert.equal(event(await f.analyze())[0].severity,'informational');
});
test('Q1 parent scripts removal, mixed edits and ordinary command metadata retain separate events/residuals',async t=>{
  const f=await fixture(t,{'package.json':{scripts:{postinstall:'INERT',test:'INERT_TEST'},other:1}},{'package.json':{other:2}});
  const a=await f.analyze();assert.equal(event(a).length,2);assert.ok(event(a).every(f=>f.severity==='informational'&&f.reviewPriority==='low'));assert.ok(a.findings.some(f=>f.ruleId==='heurisko.change.unresolved-difference'));
});
for(const value of [null,false,[],{},42,''])test(`Q1 unsupported command ${JSON.stringify(value)} cannot infer a lifecycle action`,async t=>{
  const f=await fixture(t,scripts({}),scripts({postinstall:value})),a=await f.analyze(),e=event(a)[0];assert.equal(e.severity,'undetermined');assert.equal(e.reviewPriority,'low');assert.equal(e.evidenceConfidence,'limited');assert.match(e.observation,/unresolved/);assert.equal(a.stages[0].status,'incomplete');
});
test('Q1 unchanged fields produce no event',async t=>{const f=await fixture(t,scripts({prepare:'INERT'}),scripts({prepare:'INERT'}));assert.equal(event(await f.analyze()).length,0);});
test('Q1 scripts arrays cannot impersonate a supported script object',async t=>{
  const f=await fixture(t,scripts([]),scripts(['INERT'])),a=await f.analyze();assert.equal(event(a)[0].evidenceConfidence,'limited');assert.equal(a.stages[0].status,'incomplete');assert.ok(a.limitations.some(s=>s.includes('SCRIPT_PARENT_UNSUPPORTED')));
});

for(const key of ['main','module','types','typings','exports','bin','browser'])test(`Q2 actual loader ${key}: direction, retained values and exact original spans`,async t=>{
  for(const [from,to]of [[{[key]:'é.js'},{[key]:'changed.js'}],[{}, {[key]:null}],[{[key]:false},{}]]) {
    const f=await fixture(t,{'package.json':from},{'package.json':to}),a=await f.analyze(),events=event(a);assert.equal(events.length,1);assert.equal(events[0].evidenceConfidence,'high');assert.doesNotMatch(events[0].limitations.join(' '),/not available in this evidence/);
    const delta=f.bundle.evidence.find(e=>events[0].evidenceIds.includes(e.evidenceId));const data=JSON.parse((await f.store.get(delta.contentRef)).toString());
    for(const side of ['source','artifact'])if(data[side]) {
      const bytes=await f.store.get(data[side+'ContentRef']);assert.deepEqual(JSON.parse(bytes.subarray(data[side].startByte,data[side].endByte).toString()),data[side].value);
    }
    assert.match(events[0].observation,/Source: .*artifact:/);assert.doesNotMatch(events[0].observation,/\\u001b(?!\\)/);
  }
});
test('Q2 nested conditions, arrays, slash/tilde/dot keys, false and controls: one outermost event with bounded summary',async t=>{
  const from={exports:{'./a~b.c':{import:['é.js',false],require:null}},browser:{'./a.js':false}};
  const to={exports:{'./a~b.c':{import:['\u001b[31m.js','x'.repeat(400)],require:''}},browser:{'./a.js':'b.js'}};
  const f=await fixture(t,{'package.json':from},{'package.json':to}),events=event(await f.analyze());assert.equal(events.length,2);assert.ok(events.some(f=>f.observation.includes('summary truncated')));assert.ok(events.every(f=>!f.observation.includes('\u001b')));
});
test('Q2 missing/corrupt/not-exported delta and malformed member never gain exact values',async t=>{
  for(const mode of ['missing','corrupt','not-exported','span','pointer']) {
    const f=await fixture(t,{'package.json':{main:'a'}},{'package.json':{main:'b'}}),e=f.bundle.evidence.find(e=>e.kind==='manifest_delta');
    if(mode==='not-exported')e.contentState='not_exported';
    else if(mode==='missing')e.contentRef=e.contentSha256='sha256:'+'a'.repeat(64);
    else {
      const d=JSON.parse((await f.store.get(e.contentRef)).toString());if(mode==='span')d.artifact.endByte++;if(mode==='pointer')d.pointer='/exports';
      const ref=await f.store.put(mode==='corrupt'?Buffer.from('broken'):Buffer.from(JSON.stringify(d)));e.contentRef=e.contentSha256=ref;
    }
    const a=await f.analyze();assert.equal(event(a)[0].severity,'undetermined');assert.equal(event(a)[0].evidenceConfidence,'limited');assert.match(event(a)[0].observation,/unresolved/);assert.equal(a.stages[0].status,'incomplete');
  }
});
test('Q2 whole manifest addition/removal abstains: absent-member proof is unsupported by this adapter',async t=>{
  for(const [from,to]of [[{}, {'package.json':{main:'x'}}],[{'package.json':{main:'x'}},{}]]) {
    const f=await fixture(t,from,to),a=await f.analyze();assert.equal(event(a)[0].evidenceConfidence,'limited');assert.ok(a.limitations.some(s=>s.includes('MEMBER_ABSENCE_UNPROVEN')));
  }
});
test('Q2 punctuation cannot impersonate nested pointers',async t=>{
  const f=await fixture(t,{'package.json':{'exports.foo':'a',exports:{foo:'a'}}},{'package.json':{'exports.foo':'evil',exports:{foo:'b'}}});
  const a=await f.analyze();assert.equal(event(a).length,1);assert.match(event(a)[0].observation,/\/exports /);
  const e=f.bundle.evidence.find(e=>e.locator.metadataKey==='exports.foo');assert.ok(e); // Genuine nested pointer only.
  const other=f.bundle.evidence.find(e=>e.locator.metadataKey==='/exports.foo');assert.ok(other);
});
test('Q2 conditional export property order is an observable retained change',async t=>{
  const f=await fixture(t,{'package.json':{exports:{'.':{import:'./module.js',default:'./fallback.js'}}}},{'package.json':{exports:{'.':{default:'./fallback.js',import:'./module.js'}}}});
  const a=await f.analyze(),e=event(a)[0];assert.equal(event(a).length,1);assert.equal(e.evidenceConfidence,'high');assert.match(e.observation,/changed from source to artifact/);assert.equal(a.stages[0].status,'complete');
  assert.ok(!a.findings.some(f=>f.ruleId==='heurisko.change.static-relationship'));
});
test('Q2 forged property order in the delta cannot change the cited source value',async t=>{
  const f=await fixture(t,{'package.json':{exports:{import:'./a.js',default:'./b.js'}}},{'package.json':{exports:{import:'./c.js',default:'./b.js'}}});
  const e=f.bundle.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='exports');
  const delta=JSON.parse((await f.store.get(e.contentRef)).toString());delta.source.value={default:'./b.js',import:'./a.js'};e.contentRef=e.contentSha256=await f.store.put(Buffer.from(JSON.stringify(delta)));
  const a=await f.analyze();assert.equal(event(a)[0].evidenceConfidence,'limited');assert.ok(a.limitations.some(s=>s.includes('DELTA_MEMBER_VALUE_MISMATCH')));
});
test('Q3 formatting/CRLF relationships retain full raw residual and do not upgrade correspondence',async t=>{
  for(const [from,to]of [['a\r\nb\r\n','a\nb\n'],['{"a":1,"b":2}','{ "a":1, "b":2 }']]) {
    const f=await fixture(t,{'file.json':from},{'file.json':to}),a=await f.analyze();assert.ok(a.findings.some(f=>f.ruleId==='heurisko.change.static-relationship'));assert.ok(a.findings.some(f=>f.ruleId==='heurisko.change.unresolved-difference'));assert.equal(f.bundle.changes[0].rawEquality,'different');assert.equal(f.bundle.changes[0].explanationStrength,'unexplained');
  }
  assert.equal(byteRelationship(Buffer.from('{"a":1,"a":2}'),Buffer.from('{"a":2}')),undefined);
  assert.equal(byteRelationship(Buffer.from('let a=1;'),Buffer.from('let a = 1;')),undefined);
  assert.equal(byteRelationship(Buffer.from('{"import":"a","default":"b"}'),Buffer.from('{"default":"b","import":"a"}')),undefined);
  assert.equal(byteRelationship(Buffer.from([255]),Buffer.from('x')),undefined);
});
test('Q3 source-map cross-side matches explain only retained source text, not emitted bytes',async t=>{
  const source='export const inert=1;\n',output='/* arbitrary extra inert bytes */\n//# sourceMappingURL=out.js.map\n';
  const f=await fixture(t,{'src.js':source},{'out.js':output,'out.js.map':{version:3,sources:['../src.js','unknown'],sourcesContent:[source,'unmatched'],mappings:'AAAA'}}),a=await f.analyze();
  const relation=a.findings.find(f=>f.ruleId==='heurisko.change.static-relationship');assert.ok(relation);assert.match(relation.observation,/1 of 2/);assert.ok(a.findings.some(f=>f.ruleId==='heurisko.change.unresolved-difference'));assert.ok(f.bundle.changes.every(c=>c.status!=='generated_candidate'));
  const note=f.bundle.evidence.find(e=>e.observationMethod==='heurisko-static-relationship-v1');const d=JSON.parse((await f.store.get(note.contentRef)).toString());d.matches[0].index=1;note.contentRef=note.contentSha256=await f.store.put(Buffer.from(JSON.stringify(d)));
  const rejected=await f.analyze();assert.ok(!rejected.findings.some(f=>f.ruleId==='heurisko.change.static-relationship'));assert.equal(rejected.stages[0].status,'incomplete');
  assert.equal(localMapReference(Buffer.from('//# sourceMappingURL=https://example.com/a.map')),undefined);assert.equal(sourceMapData(Buffer.from('{"version":3,"sources":["a"],"sourcesContent":[null]}')),undefined);
  assert.equal(sourceMapData(Buffer.from('{"version":3,"sources":["a"],"sourcesContent":["\\ud800"]}')),undefined);
});
test('Q3 misleading generated names/build clues and unknown absence stay unresolved',async t=>{
  const f=await fixture(t,{'src.js':'x'}, {'dist/app.min.js':'/* generated */ arbitrary','build.config.js':'NEVER_EXECUTE()'},{scope:false}),a=await f.analyze();assert.ok(!a.findings.some(f=>f.ruleId==='heurisko.change.static-relationship'));assert.ok(f.bundle.changes.every(c=>c.status==='unresolved'&&c.rawEquality==='unknown'));
});
test('Q3 absent optional source digest cannot establish non-acquisition',async t=>{
  const f=await fixture(t,{'index.js':'inert'},{'index.js':'inert'});
  const source=f.bundle.evidence.find(e=>e.kind==='source_member');
  f.bundle.sourceCandidates.push({repositoryUrl:'https://github.com/example/original',commit:'a'.repeat(40),subdirectory:'',association:'user_supplied',evidenceIds:[source.evidenceId],conflicts:[]});
  const a=await f.analyze(),finding=a.findings.find(f=>f.ruleId==='heurisko.source.candidate-scope');assert.ok(finding);
  assert.doesNotMatch(finding.observation,/not acquired/);assert.match(finding.observation,/archive digest not recorded/);
  assert.equal(finding.evidenceConfidence,'limited');
});
