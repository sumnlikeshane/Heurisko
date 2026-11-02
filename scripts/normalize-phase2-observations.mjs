// Project immutable report facts into grading units, never derive golden labels.
// Human atomic-claim/explanation/escalation reviews remain required separately.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {resolve,dirname} from 'node:path';
import {EvidenceStore,manifestFields,sha256,canonicalJSON} from '../packages/core/dist/index.js';
import {ReportReader} from '../integration/part4/dist/report-reader.js';
assert.equal(process.version,'v22.23.4');
const [manifestArg,outArg]=process.argv.slice(2);if(!outArg)throw Error('host-owned report manifest and NEW output required');
const path=resolve(manifestArg),manifest=JSON.parse(await fs.readFile(path,'utf8')),cases=[];
let freeze;
if(manifest.cases.some(c=>c.split==='held-out')) {
 if(!manifest.freeze||!manifest.labels)throw Error('HELD_OUT_CUSTODY_AND_FREEZE_REQUIRED');
 freeze=JSON.parse(await fs.readFile(resolve(dirname(path),manifest.freeze),'utf8'));
 const bytes=await fs.readFile(resolve(dirname(path),manifest.labels)),labels=JSON.parse(bytes.toString('utf8'));
 if(freeze.labelsSha256!==sha256(bytes).slice(7)||!freeze.independentCustodian||!freeze.frozenBeforeOutputs||!labels.reviewers?.length||labels.reviewers.some(r=>r.kind!=='human'||!r.independentOfDetectorAuthorship))throw Error('INDEPENDENT_LABEL_FREEZE_REQUIRED');
}
const identities=new Map();
const rules=new Map([['heurisko.manifest.lifecycle-script-change','Q1.lifecycle'],['heurisko.manifest.script-change','Q1.script'],['heurisko.manifest.entrypoint-change','Q2.entrypoint']]);
for(const entry of manifest.cases) {
 if(!['development','held-out'].includes(entry.split))throw Error('SPLIT_REQUIRED');
 const file=resolve(dirname(path),entry.report),store=new EvidenceStore(resolve(dirname(path),entry.store));
 const reader=await ReportReader.openFile(file,store.root),report=reader.report;
 const acquired=[...new Set(report.bundle.sourceCandidates.map(c=>c.sourceSnapshotSha256).filter(Boolean))];
 const sourceSha256=acquired.length===1?acquired[0]:null;
 const json=async e=>{
  if(e?.contentState!=='retained'||e.contentRef!==e.contentSha256)throw Error('CONTENT_NOT_ADMITTED');
  return manifestFields(await store.get(e.contentRef,256*1024)).get('').value;
 };
 const configRecord=report.bundle.evidence.find(e=>e.kind==='analysis_note'&&e.locator.metadataKey==='analysis-configuration');
 const config=await json(configRecord),identity={
  codeSha256:sha256(canonicalJSON({engine:config.versions.engine,module:config.analysisModule})).slice(7),
  configurationSha256:sha256(canonicalJSON({moduleConfiguration:config.analysisModule?.configurationSha256??null,options:config.options,versions:config.versions,safetyProfileSha256:config.safetyProfileSha256})).slice(7),
 };
 if(entry.split==='held-out'&&(freeze.codeSha256!==identity.codeSha256||freeze.configurationSha256!==identity.configurationSha256))throw Error('FROZEN_CODE_CONFIGURATION_MISMATCH');
 identities.set(JSON.stringify(identity),identity);
 const events=[],explanationCandidates=[];
 for(const finding of report.analysis.findings) {
  const ruleClass=rules.get(finding.ruleId);
  if(ruleClass) {
   const deltas=finding.evidenceIds.map(id=>reader.evidence(id)).filter(e=>e?.kind==='manifest_delta');
   if(deltas.length!==1)throw Error('EVENT_UNIT_AMBIGUOUS');
   const delta=deltas[0];let data,reason;
   try {data=await json(delta);}catch(e){reason=e.code??e.message;}
   const unresolved=!!reason||data?.version!=='heurisko-manifest-delta-v1'||finding.evidenceConfidence!=='high'||finding.explanationStrength!=='exact';
   const pointer=data?.version==='heurisko-manifest-delta-v1'?data.pointer:delta.locator.metadataKey?.startsWith('/')?delta.locator.metadataKey:'/'+delta.locator.metadataKey.split('.').join('/');
   events.push({artifactSha256:report.bundle.artifact.observedSha256,sourceSha256,pointer,ruleClass,
    direction:unresolved?'unresolved':data.source===null?'add':data.artifact===null?'remove':'change',
    severity:finding.severity,priority:finding.reviewPriority,unresolved,reason:reason??(unresolved?'RECORDED_UNRESOLVED':'RESOLVED'),findingId:finding.findingId,evidenceIds:finding.evidenceIds,observation:finding.observation});
  }
  if(finding.ruleId==='heurisko.change.static-relationship')explanationCandidates.push({id:finding.findingId,evidenceIds:finding.evidenceIds,observation:finding.observation,explanationStrength:finding.explanationStrength});
 }
 cases.push({id:entry.id,reportSha256:reader.reportContentRef,reportId:report.reportId,analysisConfigFingerprint:report.analysisConfigFingerprint,...identity,events,explanationCandidates,
  policyDecisions:[{artifactSha256:report.bundle.artifact.observedSha256,policyId:report.bundle.input.analysisOptions.trustPolicyRef??'none',result:report.outcomes.policyResult}],
  factualClaimCount:report.analysis.findings.length,claimUnitsAreProvisional:true,claimCandidates:report.analysis.findings.map(f=>({id:f.findingId,observation:f.observation,evidenceIds:f.evidenceIds})),claimReviews:[],explanationReviews:[],humanReviewComplete:false,
  unresolved:report.outcomes.analysisCompleteness!=='complete'||report.outcomes.sourceAssociation==='ambiguous',abstentionReasons:report.analysis.stages.flatMap(s=>s.errors.map(e=>e.code)),rawCoverage:report.bundle.coverage,criticalFailures:[],
  reviewLimit:'One provisional claim unit per finding; a human must split atomic claims and review support, explanations, escalation and critical boundaries before acceptance. Empty review arrays mean unreviewed, not zero errors.'});
}
if(identities.size!==1)throw Error('MIXED_DETECTOR_IDENTITIES');
const identity=[...identities.values()][0];
await fs.writeFile(resolve(outArg),JSON.stringify({version:'heurisko-p2-observations-v2',authority:'immutable report normalization, no golden labels or independent output review',...identity,manifestSha256:sha256(await fs.readFile(path)),cases,mandatoryConformanceComplete:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({cases:cases.length,events:cases.reduce((n,c)=>n+c.events.length,0),identity}));
