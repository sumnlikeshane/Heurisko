#!/usr/bin/env node
/** Explicit live integration probe for Malhar's product inference adapter. */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyzeEvidenceWithOpenRouter } from '../../packages/intelligence/dist/index.js';

if (process.env.HEURISKO_ENABLE_OPENROUTER !== '1') {
  throw new Error('Set HEURISKO_ENABLE_OPENROUTER=1 to explicitly allow hosted test inference.');
}
if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is not available in the process environment.');

const root = resolve(import.meta.dirname, '../..');
const dataset = resolve(root, 'experiments/rag/datasets/real/setuptools-60.0.0');
const outputPath = resolve(root, process.argv[2] ?? 'experiments/rag/runs/product-qwen-setuptools-live-v2.jsonl');
if (existsSync(outputPath)) throw new Error(`Refusing to overwrite ${outputPath}`);
const base = JSON.parse(execFileSync(process.execPath, [resolve(root, 'packages/intelligence/tests/real-setuptools.mjs')], { encoding: 'utf8' }));
const queries = readFileSync(resolve(dataset, 'queries.jsonl'), 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
const bundle = structuredClone(base.bundle);
bundle.input.analysisOptions.enableAI = true;
const analysisOptions = { ...bundle.input.analysisOptions, enableAI: true };

const rows = [];
for (const item of queries) {
  const result = await analyzeEvidenceWithOpenRouter(
    bundle,
    analysisOptions,
    item.query,
    base.excerpts,
    {
      enabled: true,
      apiKey: process.env.OPENROUTER_API_KEY,
      maxTokens: 1024,
      maxEvidenceItems: 5,
      resolvedContent: base.excerpts,
    },
  );
  rows.push({
    query_id: item.query_id,
    retrieved_evidence_ids: result.retrieval.selected.map((evidence) => evidence.evidenceId),
    findings: result.analysis.findings,
    ai_state: result.analysis.aiState,
    interpretations: result.analysis.interpretations,
    inference: result.inference,
  });
}

writeFileSync(outputPath, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`, { flag: 'wx' });
process.stdout.write(`Wrote product-adapter inference probe: ${outputPath}\n`);
