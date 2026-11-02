import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {comparableNpmCitation, comparableNpmFindings} from '../phase1-npm-parity.mjs';

function fixture(change = () => {}) {
  const claim = {kind:'version-tag',repositoryUrl:'https://github.com/example/package',tag:'v1.0.0',commit:'a'.repeat(40),subdirectory:'',captures:[{capture:{requestedUrl:'https://api.github.com/repos/example/package/git/ref/tags/v1.0.0',sha256:'sha256:'+'b'.repeat(64),hops:[{url:'https://api.github.com/repos/example/package/git/ref/tags/v1.0.0',status:200,headers:{etag:'exact-body','x-ratelimit-remaining':'58','x-ratelimit-reset':'1793648049'}}]},evidenceId:'ev_body'}]};
  change(claim);
  const bytes = Buffer.from(JSON.stringify(claim)), hash = 'sha256:'+createHash('sha256').update(bytes).digest('hex');
  const evidence = {evidenceId:'ev_'+hash.slice(7,31),kind:'source_claim',side:'external',locator:{metadataKey:'source-claim-3-version-tag'},observationMethod:'separate-source-claim-v1',verification:'not_checked',contentState:'retained',contentRef:hash,contentSha256:hash,limitations:['Unverified candidate claim; tag observations are time-bound.']};
  return {bytes,evidence,project:()=>comparableNpmCitation(evidence,bytes)};
}

test('observed rate-limit changes permit parity while original citation identities/bytes stay distinct',()=>{
  const a=fixture(), b=fixture(c=>{c.captures[0].capture.hops[0].headers['x-ratelimit-remaining']='55';c.captures[0].capture.hops[0].headers['x-ratelimit-reset']='1793649000';});
  assert.notEqual(a.evidence.contentRef,b.evidence.contentRef);
  assert.deepEqual(a.project(),b.project());
  assert.equal(JSON.parse(a.bytes).captures[0].capture.hops[0].headers['x-ratelimit-remaining'],'58');
});

test('changed source, body, transport, missing header, trust descriptor or non-tag evidence cannot acquire parity',()=>{
  const a=fixture();
  for(const mutate of [c=>c.commit='c'.repeat(40),c=>c.repositoryUrl='https://github.com/other/package',c=>c.captures[0].capture.sha256='sha256:'+'c'.repeat(64),c=>c.captures[0].capture.hops[0].status=404,c=>c.captures[0].capture.hops[0].headers.etag='changed',c=>delete c.captures[0].capture.hops[0].headers['x-ratelimit-reset']])assert.notDeepEqual(a.project(),fixture(mutate).project());
  const b=fixture();b.evidence.verification='verified';assert.notDeepEqual(a.project(),b.project());
  const c=fixture();c.evidence.kind='registry_metadata';assert.deepEqual(c.project(),{exact:c.evidence});
  assert.throws(()=>fixture(c=>c.captures[0].capture.hops[0].headers['x-ratelimit-reset']='unknown').project());
});

test('failed tag captures compare status and failure while retaining numeric rate-header presence',()=>{
  const failed=c=>{c.failure='SOURCE_TAG_NOT_FOUND';c.failedCapture={requestedUrl:c.captures[0].capture.requestedUrl,hops:[{status:404,headers:{'x-ratelimit-remaining':'56'}}]};c.captures=[];};
  const a=fixture(failed),b=fixture(c=>{failed(c);c.failedCapture.hops[0].headers['x-ratelimit-remaining']='53';});
  assert.deepEqual(a.project(),b.project());
  assert.notDeepEqual(a.project(),fixture(c=>{failed(c);c.failure='SOURCE_TAG_RATE_LIMITED';}).project());
});

test('finding facts and every cited observation must still match; unresolved references fail',async()=>{
  const a=fixture(),b=fixture(c=>c.captures[0].capture.hops[0].headers['x-ratelimit-remaining']='55');
  const report=f=>({bundle:{evidence:[f.evidence]},analysis:{findings:[{findingId:'find_'+f.evidence.evidenceId,evidenceIds:[f.evidence.evidenceId],ruleId:'heurisko.source.candidate-scope',observation:'Exact candidate facts',severity:'informational'}]}});
  const ra=report(a),rb=report(b),store=f=>({get:async ref=>{assert.equal(ref,f.evidence.contentRef);return f.bytes;}});
  assert.deepEqual(await comparableNpmFindings(ra,store(a)),await comparableNpmFindings(rb,store(b)));
  rb.analysis.findings[0].severity='medium';assert.notDeepEqual(await comparableNpmFindings(ra,store(a)),await comparableNpmFindings(rb,store(b)));
  ra.analysis.findings[0].evidenceIds=['ev_missing'];await assert.rejects(comparableNpmFindings(ra,store(a)),/citation must resolve/);
});
