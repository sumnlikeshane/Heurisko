import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeEvidence } from '../dist/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(here, '../../contracts/tests/fixtures');
const cases = [];

for (let index = 0; index <= 6; index += 1) {
  const id = `F${index}`;
  const bundle = JSON.parse(readFileSync(resolve(fixtureRoot, id, 'bundle.json'), 'utf8'));
  const expectedReport = JSON.parse(readFileSync(resolve(fixtureRoot, id, 'report.json'), 'utf8'));
  const before = JSON.stringify(bundle);
  const analysis = await analyzeEvidence(bundle, bundle.input.analysisOptions);

  if (JSON.stringify(bundle) !== before) throw new Error(`${id}: input bundle was mutated`);
  const report = { ...expectedReport, bundle, analysis };
  cases.push({ id, bundle, analysis, report });
}

process.stdout.write(JSON.stringify(cases));
