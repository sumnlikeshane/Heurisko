import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { draftRequest, validateDraft, errorHelp } from '../dist/input-review.js';
import { Investigation, OpenEvidence, RequestReview, JobDetail } from '../dist/render-check.js';

const fields = { target: ' npm:@vue/shared@3.5.22 ', name: ' Local label ', version: ' 1.2.3 ', source: '', commit: '', subdirectory: '', policy: '', enableAI: true };
const render = (Component, props = {}) => renderToStaticMarkup(React.createElement(Component, props));

test('mode projection preserves selected File identity and excludes inactive mode semantics without mutation', () => {
  const artifact = new File(['public inert archive'], 'public.tgz'), sourceArchive = new File(['public inert source'], 'source.tar.gz');
  const localFields = { ...fields, source: 'https://github.com/a/b', commit: 'a'.repeat(40), enableAI: false };
  const local = draftRequest('local', localFields, { artifact, sourceArchive });
  assert.equal(local.artifact, artifact); assert.equal(local.sourceArchive, sourceArchive);
  assert.equal(local.name, 'Local label'); assert.equal(local.enableAI, false); assert.equal(local.target, undefined);
  assert.deepEqual(validateDraft(local), []);
  const npm = draftRequest('npm', fields, { artifact, sourceArchive });
  assert.deepEqual(npm, { kind: 'npm', target: 'npm:@vue/shared@3.5.22', enableAI: true });
  assert.equal(local.artifact, artifact); assert.equal(localFields.name, ' Local label ');
  assert.equal(draftRequest('local', localFields, { artifact, sourceArchive }).artifact, artifact);
});

test('empty targets and missing source pair/replay associate issues with the useful correction field', () => {
  assert.ok(validateDraft(draftRequest('npm', { ...fields, target: '' })).some(issue => issue.field === 'target'));
  const local = draftRequest('local', { ...fields, target: '', source: 'https://github.com/a/b' }, { artifact: new File(['inert'], 'public.tgz'), sourceArchive: new File(['inert'], 'source.tgz') });
  const issues = validateDraft(local);
  assert.ok(issues.some(issue => issue.field === 'commit'));
  assert.ok(issues.some(issue => issue.field === 'sourceArchive'));
});

test('first entry requires explicit example selection and the review exposes labels before technical details', () => {
  const html = render(Investigation, { onStart() {} });
  assert.match(html, /Use public example: picocolors@1.1.1/);
  assert.match(html, /id="investigate-target"[^>]*value=""/);
  assert.ok(!html.includes('type="checkbox"'));
  assert.match(html, /Default matches the CLI request/);
  const review = render(RequestReview, { draft: draftRequest('npm', fields) });
  assert.ok(review.indexOf('Exact release') < review.indexOf('Technical request details'));
  assert.match(review, /product model unavailable/);
});

test('job states distinguish report availability, cancellation request and no-report failure', () => {
  const base = { id: 'a'.repeat(32), startedAt: '2026-11-01T01:00:00Z', cleanup: 'not_observable', omittedEvents: 0, events: [], request: { kind: 'npm', target: 'npm:picocolors@1.1.1', enableAI: false, analysisProfile: 'raw-static-s3-v1' } };
  const cancelled = render(JobDetail, { job: { ...base, phase: 'cancel_requested', cancellationRequested: true }, error: '', onCancel() {} });
  assert.match(cancelled, /Cancellation requested/); assert.ok(!cancelled.includes('Open report and evidence'));
  const report = render(JobDetail, { job: { ...base, phase: 'settled_report', cancellationRequested: false, observation: 'b'.repeat(32), exitCode: 2, settledAt: '2026-11-01T01:00:10Z' }, error: '', onCancel() {} });
  assert.match(report, /Report ready/); assert.match(report, /Open report and evidence/); assert.match(report, /incomplete or a requested policy is indeterminate/); assert.ok(!report.includes('Request cancellation</button>'));
  const failed = render(JobDetail, { job: { ...base, phase: 'settled_error', cancellationRequested: false, error: 'CONTROLLED_NO_REPORT', exitCode: 3 }, error: '', onCancel() {} });
  assert.match(failed, /Stopped without a report/); assert.match(failed, /Review preserved draft/); assert.ok(!failed.includes('Open report and evidence'));
});

test('open methods explain report-only missing bytes and format-specific recovery without admitting host paths', () => {
  const html = render(OpenEvidence, { onOpen() {} });
  for (const value of ['Portable evidence file', 'Original report JSON', 'Report-content reference', 'missing blobs remain unavailable', 'fixed workspace store']) assert.ok(html.includes(value), value);
  assert.ok(!html.includes('name="path"'));
  assert.match(errorHelp('PORTABLE_INVALID'), /switch to Report JSON/);
  assert.match(errorHelp('BLOB_HASH_MISMATCH'), /failed verification/);
  assert.match(errorHelp('JOB_NOT_FOUND'), /Reopen the original portable file/);
});
