import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {compiledClosure,checkModelOffAnalysis} from '../check-final-module-intake.mjs';
import {canonicalJSON,decodeReportBytes,runAnalysis} from '../../packages/core/dist/index.js';

async function fixture(t,entry='export const analyzeEvidence=()=>{};') {
  const root=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-intake-test-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));
  await fs.mkdir(join(root,'src'));await fs.mkdir(join(root,'dist'));
  await fs.writeFile(join(root,'package.json'),JSON.stringify({name:'@heurisko/intelligence',version:'0.1.0',type:'module',exports:{'.':'./dist/index.js'}}));
  await fs.writeFile(join(root,'tsconfig.json'),'{}');await fs.writeFile(join(root,'src/index.ts'),'export const marker=1;');await fs.writeFile(join(root,'dist/index.js'),entry);return root;
}
test('closure records nested imports, literal dynamic imports and all config/source bytes',async t=>{
  const root=await fixture(t,"export {x} from './nested/one.js'; const again=()=>import('./nested/one.js');");
  await fs.mkdir(join(root,'dist/nested'));await fs.writeFile(join(root,'dist/nested/one.js'),'export const x=1;');
  const first=await compiledClosure(root);assert.equal(first.imports.length,2);assert.ok(first.files['dist/nested/one.js']);assert.ok(first.files['src/index.ts']);
  await fs.writeFile(join(root,'dist/nested/one.js'),'export const x=2;');const second=await compiledClosure(root);assert.notEqual(first.files['dist/nested/one.js'],second.files['dist/nested/one.js']);
});
test('closure rejects external imports, computed dynamic imports, escape and indirect code',async t=>{
  const root=await fixture(t);
  for(const code of ["import 'node:fs';","const p='./x.js';import(p);","export {x} from '../../outside.js';","const f=new Function('return 1');","process.getBuiltinModule('fs');","require('./index.js');"]){await fs.writeFile(join(root,'dist/index.js'),code);await assert.rejects(compiledClosure(root),/MODULE_(EXTERNAL_IMPORT|DYNAMIC_IMPORT|IMPORT_ESCAPE|INDIRECT_CODE)_REJECTED/);}
});
test('closure rejects absent graph nodes and symlinked additions',async t=>{
  const root=await fixture(t,"export {x} from './missing.js';");await assert.rejects(compiledClosure(root),/MODULE_IMPORT_NOT_IN_CLOSURE/);
  await fs.writeFile(join(root,'dist/index.js'),'export const x=1;');await fs.symlink(join(root,'src/index.ts'),join(root,'dist/linked.js'));await assert.rejects(compiledClosure(root),/MODULE_LINK_REJECTED/);
});
const report=await decodeReportBytes(await fs.readFile(resolve('examples/part4/user-failures/local-inert-mutation.report.json')));
const saved=JSON.parse(await fs.readFile(resolve('examples/part4/user-failures/local-inert-mutation.e8b8116.analysis.json'),'utf8'));
const identity={moduleId:'@heurisko/test-only',moduleVersion:'0.0.0',implementationSha256:'sha256:'+'1'.repeat(64),configurationSha256:'sha256:'+'2'.repeat(64)};
const options={enableAI:false,analysisProfile:'final-intake-negative-tests'};
test('model-off contract checks real module output and rejects invented citation IDs',async()=>{
  assert.equal((await checkModelOffAnalysis(report.bundle,saved)).lifecycleFindings,1);
  const bad=structuredClone(saved);bad.findings[0].evidenceIds=['ev_'+'f'.repeat(24)];await assert.rejects(checkModelOffAnalysis(report.bundle,bad),/CONTRACT_INVALID/);
});
test('model-off contract rejects enabled AI state',async()=>{
  const bad=structuredClone(saved);bad.aiState={status:'unavailable',validation:'not_run'};await assert.rejects(checkModelOffAnalysis(report.bundle,bad),/MODEL_OFF_CONTRACT_FAILED/);
});
test('adapter contains module failure and immutable input mutation',async()=>{
  const before=canonicalJSON(report.bundle);
  await assert.rejects(runAnalysis(report.bundle,options,{...identity,analyzeEvidence:async()=>{throw Error('authored failure');}}),/ANALYSIS_MODULE_FAILED/);
  await assert.rejects(runAnalysis(report.bundle,options,{...identity,analyzeEvidence:async bundle=>{bundle.artifact.artifactFilename='mutated';return saved;}}),/ANALYSIS_MODULE_FAILED/);
  assert.equal(canonicalJSON(report.bundle),before);
});
test('adapter rejects malformed output and preserves returned snapshot after module mutation',async()=>{
  await assert.rejects(runAnalysis(report.bundle,options,{...identity,analyzeEvidence:async()=>({})}),/CONTRACT_INVALID/);
  const returned=structuredClone(saved),out=await runAnalysis(report.bundle,options,{...identity,analyzeEvidence:async()=>returned}),before=canonicalJSON(out);
  returned.findings[0].title='changed after return';assert.equal(canonicalJSON(out),before);
});
test('adapter cancellation fails before invoking module',async()=>{
  const controller=new AbortController();controller.abort();let called=false;
  await assert.rejects(runAnalysis(report.bundle,options,{...identity,analyzeEvidence:async()=>{called=true;return saved;}},{signal:controller.signal}),/CANCELLED/);assert.equal(called,false);
});
