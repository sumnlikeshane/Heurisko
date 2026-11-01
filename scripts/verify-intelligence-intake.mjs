import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifest = JSON.parse(await readFile(new URL('../docs/production-phase1/intelligence-intake-manifest.json', import.meta.url), 'utf8'));
assert.equal(manifest.version, 'heurisko-phase1-intake-v1');
assert.equal(manifest.sourceCommit, '55240e99409ad44cbd6a978f40873ef410cb1861');
assert.equal(manifest.files.length, 33);
const root = resolve(import.meta.dirname, '..');
const seen = new Set();
for (const item of manifest.files) {
  assert.match(item.path, /^(?:packages\/intelligence\/|experiments\/rag\/datasets\/real\/setuptools-60\.0\.0\/)[A-Za-z0-9_./-]+$/);
  assert.equal(item.path.split('/').includes('..'), false);
  assert.equal(seen.has(item.path), false);
  seen.add(item.path);
  const bytes = await readFile(resolve(root, item.path));
  assert.equal(bytes.length, item.bytes, item.path);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256, item.path);
}
process.stdout.write(`Verified ${manifest.files.length} selected AI intake files against the recorded source-byte manifest.\n`);
