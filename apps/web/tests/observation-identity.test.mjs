import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from '@heurisko/core';
import { observationFromBytes } from '../dist/observation.js';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const corpus = process.env.HEURISKO_WEB_TEST_CORPUS ?? repo;
const reportPath = join(corpus, 'examples/handoff/current/B1.report.json');
const store = join(corpus, 'examples/handoff/current/store');

test('observation admission snapshots bytes before asynchronous validation', async () => {
    const input = await readFile(reportPath), expected = Buffer.from(input);
    const pending = observationFromBytes(input, store);
    input.fill(0);
    const observation = await pending;
    assert.deepEqual(observation.raw, expected);
    assert.equal(sha256(observation.raw), observation.reader.reportContentRef);
    assert.deepEqual(JSON.parse(observation.raw), observation.reader.report);
});

test('exposed observation bytes cannot mutate admitted report downloads', async () => {
    const input = await readFile(reportPath), expected = Buffer.from(input);
    const observation = await observationFromBytes(input, store);
    input.fill(0);
    const exposed = observation.raw;
    exposed.fill(0);
    assert.notDeepEqual(exposed, expected);
    assert.deepEqual(observation.raw, expected);
    assert.notEqual(observation.raw, observation.raw);
    assert.equal(sha256(observation.raw), observation.reader.reportContentRef);
    assert.deepEqual(JSON.parse(observation.raw), observation.reader.report);
});
