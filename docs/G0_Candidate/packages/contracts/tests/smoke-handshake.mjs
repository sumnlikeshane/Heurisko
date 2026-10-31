// G0 interface wiring only: stub collectors/analyzers return declared fixture records.
// NOT a real package parser, heuristic engine, AI model, or production validator.
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'fixtures');
const read=(name,type)=>JSON.parse(readFileSync(resolve(root,name,`${type}.json`),'utf8'));
const snapshot=v=>JSON.stringify(v);
const stubCollect=async(name)=>read(name,'bundle');
const stubAnalyze=async(name,bundle,options)=>{
  assert.equal(options.enableAI,name==='F5');
  const original=snapshot(bundle);
  const analysis=read(name,'analysis');
  assert.equal(original,snapshot(bundle),'analyzer mutated verified input');
  return analysis;
};
const merge=(bundle,analysis,expected)=>({
  schemaVersion:'0.1.0',reportId:expected.reportId,createdAt:expected.createdAt,
  bundle,analysis,outcomes:expected.outcomes,
  analysisConfigFingerprint:expected.analysisConfigFingerprint,fixtureKind:'synthetic_contract'
});
for(let i=0;i<7;i++){
  const id=`F${i}`;
  const expected=read(id,'report');
  const bundle=await stubCollect(id);
  const analysis=await stubAnalyze(id,bundle,bundle.input.analysisOptions);
  const report=merge(bundle,analysis,expected);
  assert.deepEqual(report,expected);
  if(id==='F1')assert.ok(report.analysis.findings[0].evidenceIds.length>0);
  if(id==='F3')assert.equal(report.outcomes.sourceAssociation,'ambiguous');
  if(id==='F4')assert.ok(report.bundle.coverage.unsupportedBytes>0);
  if(id==='F5')assert.equal(report.analysis.aiState.status,'rejected');
  if(id==='F6')assert.equal(report.outcomes.artifactIntegrity,'mismatched');
  console.log('PASS',id,'stubbed collectEvidence → analyzeEvidence → InvestigationReport');
}
console.log('Note: these are synthetic interface fixtures, NOT real engine output.');
