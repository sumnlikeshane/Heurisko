import test from 'node:test';
import assert from 'node:assert/strict';

test('a lost successful start response body reports unknown acknowledgment and never resubmits', async t => {
  const originals = { fetch: globalThis.fetch, window: globalThis.window, CustomEvent: globalThis.CustomEvent }, events = [], calls = [];
  t.after(() => { for (const [key, value] of Object.entries(originals)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  globalThis.window = { addEventListener() {}, dispatchEvent: event => events.push(event) };
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 202, json: async () => { throw new TypeError('private host details must not leak'); } }; };
  const { post } = await import('../dist/api.js?lost-mutation-body');
  await assert.rejects(post('investigations', { kind: 'npm', target: 'npm:picocolors@1.1.1', enableAI: false }), /^Error: LOCAL_SERVICE_UNAVAILABLE$/);
  assert.equal(calls.length, 1); assert.equal(calls[0].init.method, 'POST'); assert.equal(events.at(-1).detail, 'disconnected');
  await new Promise(resolve => setTimeout(resolve, 25)); assert.equal(calls.length, 1);
  globalThis.fetch = async () => ({ ok: false, status: 400, json: async () => ({ error: 'INVOCATION_INVALID' }) });
  await assert.rejects(post('investigations', {}), /^Error: INVOCATION_INVALID$/);
});

test('an upload body acknowledgment failure never uploads again or requests an investigation', async t => {
  const originals = { fetch: globalThis.fetch, window: globalThis.window, CustomEvent: globalThis.CustomEvent }, calls = [];
  t.after(() => { for (const [key, value] of Object.entries(originals)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  globalThis.window = { addEventListener() {}, dispatchEvent() {} };
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 201, json: async () => { throw new SyntaxError('truncated response'); } }; };
  const { upload } = await import('../dist/api.js?lost-upload-body');
  await assert.rejects(upload('artifact', new File(['public inert bytes'], 'public.tgz')), /^Error: LOCAL_SERVICE_UNAVAILABLE$/);
  assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/uploads/artifact');
  await new Promise(resolve => setTimeout(resolve, 25)); assert.equal(calls.length, 1);
});
