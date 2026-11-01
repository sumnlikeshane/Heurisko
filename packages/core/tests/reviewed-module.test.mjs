import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {EvidenceStore,configuredAnalysisSelection,loadConfiguredAnalysisModule,investigate,REVIEWED_INTELLIGENCE_COMMIT,REVIEWED_INTELLIGENCE_SELECTOR} from '../dist/index.js';

async function selected(value,work){const prior=process.env.HEURISKO_ANALYSIS_MODULE;try{if(value===undefined)delete process.env.HEURISKO_ANALYSIS_MODULE;else process.env.HEURISKO_ANALYSIS_MODULE=value;return await work();}finally{if(prior===undefined)delete process.env.HEURISKO_ANALYSIS_MODULE;else process.env.HEURISKO_ANALYSIS_MODULE=prior;}}
async function emptyStore(t){const root=await fs.mkdtemp(join(await fs.realpath(tmpdir()),'heurisko-module-selector-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));return new EvidenceStore(join(root,'store'));}
test('host selector defaults to the reviewed identifier and explicit off is unavailable',async t=>{
  assert.equal(REVIEWED_INTELLIGENCE_SELECTOR,'55240e9');assert.match(REVIEWED_INTELLIGENCE_COMMIT,/^55240e9[a-f0-9]{33}$/);
  const store=await emptyStore(t);
  for(const value of [undefined,''])await selected(value,async()=>{assert.equal(configuredAnalysisSelection(),'55240e9');assert.equal((await loadConfiguredAnalysisModule({store})).moduleVersion,'0.1.0-55240e9');});
  await selected('off',async()=>{assert.equal(configuredAnalysisSelection(),undefined);assert.equal(await loadConfiguredAnalysisModule({store}),undefined);});
  for(const value of ['55240e9 ','55240e9\n','latest','../../module.js','e8b8116'])assert.throws(()=>configuredAnalysisSelection(value),/ANALYSIS_MODULE_SELECTOR_REJECTED/);
  await assert.rejects(fs.stat(store.root),{code:'ENOENT'});
});
test('unknown host selector rejects before acquisition or store creation',async t=>{
  const store=await emptyStore(t),options={enableAI:false,analysisProfile:'reviewed-selector-test'};let calls=0;
  await selected('not-admitted',()=>assert.rejects(investigate({ecosystem:'npm',packageName:'picocolors',version:'1.1.1',analysisOptions:options},options,{store,fetchData:async()=>{calls++;throw Error('FETCH_SHOULD_NOT_RUN');}}),/ANALYSIS_MODULE_SELECTOR_REJECTED/));
  assert.equal(calls,0);await assert.rejects(fs.stat(store.root),{code:'ENOENT'});
});
test('explicit trusted injection takes precedence over an unknown host selector',async t=>{
  const store=await emptyStore(t),options={enableAI:false,analysisProfile:'reviewed-selector-test'};let calls=0;
  await selected('not-admitted',()=>assert.rejects(investigate({ecosystem:'npm',packageName:'picocolors',version:'1.1.1',analysisOptions:options},options,{store,module:{analyzeEvidence:async()=>{calls++;}},fetchData:async()=>{throw Error('FETCH_SHOULD_NOT_RUN');}}),/ANALYSIS_MODULE_IDENTITY_REQUIRED/));assert.equal(calls,0);
});
test('configured module has bounded bridge and identities without creating evidence state',async t=>{
  const store=await emptyStore(t);
  const module=await selected('55240e9',()=>loadConfiguredAnalysisModule({store}));
  assert.equal(module.moduleId,'@heurisko/intelligence-reviewed');assert.equal(module.moduleVersion,'0.1.0-55240e9');assert.match(module.implementationSha256,/^sha256:[a-f0-9]{64}$/);assert.match(module.configurationSha256,/^sha256:[a-f0-9]{64}$/);assert.ok(Object.isFrozen(module));
  await assert.rejects(fs.stat(store.root),{code:'ENOENT'});
  const controller=new AbortController();controller.abort();await selected('55240e9',()=>assert.rejects(loadConfiguredAnalysisModule({store,signal:controller.signal}),/CANCELLED/));
});
