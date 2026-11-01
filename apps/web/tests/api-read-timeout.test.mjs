import test from 'node:test';
import assert from 'node:assert/strict';

async function harness(t, name) {
  const originals = { fetch: globalThis.fetch, window: globalThis.window, CustomEvent: globalThis.CustomEvent }, events = [];
  t.after(() => { for (const [key, value] of Object.entries(originals)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } });
  globalThis.CustomEvent = class { constructor(type, options) { this.type = type; this.detail = options.detail; } };
  globalThis.window = { addEventListener() {}, dispatchEvent: event => events.push(event) };
  return { api: (await import('../dist/api.js?' + name)).api, events };
}
function aborted(signal) { return new Promise((_resolve, reject) => { if (signal.aborted) reject(signal.reason); else signal.addEventListener('abort', () => reject(signal.reason), { once: true }); }); }

test('a read deadline aborts the pending response exactly once, without announcing a service disconnect or retrying', async t => {
  const { api, events } = await harness(t, 'read-deadline'), calls = [];
  globalThis.fetch = async (url, init) => { calls.push({ url, init }); return aborted(init.signal); };
  await assert.rejects(api('investigations', undefined, 10), /^Error: READ_TIMEOUT$/);
  assert.equal(calls.length, 1); assert.equal(calls[0].init.signal.aborted, true); assert.deepEqual(events, []);
  await new Promise(resolve => setTimeout(resolve, 20)); assert.equal(calls.length, 1);
});

test('caller cancellation preserves its original reason instead of becoming a timeout', async t => {
  const { api, events } = await harness(t, 'caller-abort'), controller = new AbortController(), reason = Error('CALLER_CANCELLED');
  globalThis.fetch = async (_url, init) => aborted(init.signal);
  const pending = api('observations', controller.signal, 200);
  controller.abort(reason);
  await assert.rejects(pending, error => error === reason); assert.deepEqual(events, []);
});

test('the read deadline also bounds response body consumption after successful headers', async t => {
  const { api, events } = await harness(t, 'body-deadline'); let count = 0;
  globalThis.fetch = async (_url, init) => { count++; return { ok: true, json: () => aborted(init.signal) }; };
  await assert.rejects(api('observations', undefined, 10), /^Error: READ_TIMEOUT$/);
  assert.equal(count, 1); assert.deepEqual(events, []);
});
