// Authored synthetic rendering-only fixtures; never accepted as real producer evidence.
import * as fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {sha256,evidenceId,encodeReport,EvidenceStore} from '../../core/dist/index.js';
const root=resolve('.heurisko/part4-ui-fixtures'),store=new EvidenceStore(join(root,'store'));await store.initialize();
for(const status of ['failed','rejected','abstained','unavailable','disabled']){
 const r=JSON.parse(await fs.readFile('packages/contracts/tests/fixtures/F0/report.json','utf8'));
 r.fixtureKind=r.bundle.fixtureKind='synthetic_contract';r.bundle.evidence=[];r.bundle.changes=[];r.bundle.sourceCandidates.forEach(c=>c.evidenceIds=[]);delete r.bundle.artifact.metadataEvidenceId;r.bundle.provenance.evidenceIds=[];r.bundle.coverage.omissions=[];
 r.analysis.findings=[];r.analysis.interpretations=[];r.analysis.stages=[{stage:'heuristics',status:'failed',errors:[{stage:'heuristics',code:'AUTHORED_RENDER_TEST',message:'Synthetic stage failure',affectedScope:'rendering test',retryable:false}]}];
 r.analysis.aiState={status,reason:'SYNTHETIC rendering state; no model executed',validation:status==='rejected'?'rejected':'not_run'};r.outcomes.analysisCompleteness='incomplete';r.outcomes.correspondence='not_assessed';r.bundle.coverage.complete=false;
 const bytes=status==='disabled'?Buffer.from([0,1,255,27]):Buffer.from('INERT\x1b]52;c;PAYLOAD\x07\x1b[2J\u202eTEST\n'+('long'.repeat(5000)));const ref=await store.put(bytes);
 const e={kind:'artifact_member',side:'artifact',locator:{path:'package/unsafe\x1b[2J\u202e.txt'},observationMethod:'authored-rendering-test',contentState:'retained',contentRef:ref,contentSha256:ref,limitations:['SYNTHETIC rendering fixture'],evidenceId:''};e.evidenceId=evidenceId(r.bundle,e);r.bundle.evidence.push(e);
 r.bundle.changes.push({changeId:'chg_authored-rendering',artifactPath:e.locator.path,status:'added',rawEquality:'different',explanationStrength:'unexplained',notes:['SYNTHETIC rendering fixture'],evidenceIds:[e.evidenceId]});
 await fs.writeFile(join(root,'draft.json'),JSON.stringify(r));await fs.writeFile(join(root,status+'.report.json'),await encodeReport(r));
}
console.log('Prepared five explicitly synthetic UI states, no model or engine invoked.');
