import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
test('delivered browser JavaScript carries complete notices for bundled React, ReactDOM and Scheduler', async () => {
  const bundle = await readFile(new URL('../dist/assets/app.js', import.meta.url), 'utf8');
  const standalone = await readFile(new URL('../dist/assets/third-party-notices.txt', import.meta.url), 'utf8');
  const reactDOM = require.resolve('react-dom/package.json');
  const scheduler = createRequire(reactDOM).resolve('scheduler/package.json');
  for (const manifest of [require.resolve('react/package.json'), reactDOM, scheduler]) {
    const license = (await readFile(join(dirname(manifest), 'LICENSE'), 'utf8')).trim();
    assert.match(license, /Permission is hereby granted/);
    assert.ok(bundle.includes(license), `${manifest}: missing complete permission notice in delivered bundle`);
    assert.ok(standalone.includes(license), `${manifest}: missing standalone notice`);
  }
});
