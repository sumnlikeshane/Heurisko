import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeEvidence, type ResolvedEvidenceContent } from '@heurisko/intelligence';
import type { EvidenceBundle, AnalysisOptions } from '@heurisko/contracts';
import type { AnalysisModule } from './adapter.js';
import { boundedFile, EvidenceStore, StorageError } from './storage.js';
import { canonicalJSON, sha256 } from './identity.js';

const MAX_DELTA_RECORDS = 128;
const MAX_DELTA_BYTES = 1024 * 1024;
const MAX_DELTA_RECORD_BYTES = 16 * 1024;

async function javascriptFiles(root: string): Promise<string[]> {
  const found: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error('INTELLIGENCE_MODULE_UNSAFE_ENTRY');
      if (entry.isDirectory()) await visit(path);
      else if (entry.isFile() && entry.name.endsWith('.js')) found.push(path);
    }
  };
  await visit(root);
  return found.sort();
}

async function moduleIdentity(): Promise<{ version: string; implementationSha256: `sha256:${string}` }> {
  const entry = fileURLToPath(import.meta.resolve('@heurisko/intelligence'));
  const packageRoot = resolve(dirname(entry), '..');
  const metadata = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8')) as { version?: unknown };
  if (typeof metadata.version !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(metadata.version)) {
    throw new Error('INTELLIGENCE_PACKAGE_VERSION_INVALID');
  }
  const files = await javascriptFiles(join(packageRoot, 'dist'));
  if (!files.length) throw new Error('INTELLIGENCE_MODULE_BUILD_MISSING');
  let total = 0;
  const digests: Array<{ path: string; sha256: string }> = [];
  for (const path of files) {
    const bytes = await boundedFile(path, 512 * 1024);
    total += bytes.length;
    if (total > 4 * 1024 * 1024) throw new Error('INTELLIGENCE_MODULE_SIZE_LIMIT');
    digests.push({ path: relative(packageRoot, path).split('\\').join('/'), sha256: sha256(bytes) });
  }
  const wrapper = await boundedFile(fileURLToPath(import.meta.url), 128 * 1024);
  digests.push({ path: 'core-intelligence-wrapper.js', sha256: sha256(wrapper) });
  return { version: metadata.version, implementationSha256: sha256(canonicalJSON(digests)) };
}

async function resolveManifestDeltas(
  bundle: Readonly<EvidenceBundle>,
  store: EvidenceStore,
  signal?: AbortSignal,
): Promise<{ content: ResolvedEvidenceContent[]; limitations: string[] }> {
  const records = bundle.evidence.filter((record) => record.kind === 'manifest_delta');
  const content: ResolvedEvidenceContent[] = [];
  const limitations: string[] = [];
  let total = 0;
  let attempted = 0;
  for (const record of records) {
    if (signal?.aborted) {
      limitations.push('Manifest delta resolution stopped after cancellation was requested.');
      break;
    }
    if (attempted >= MAX_DELTA_RECORDS) {
      limitations.push('Manifest delta resolution stopped at the 128 record cap.');
      break;
    }
    attempted += 1;
    if (record.contentState !== 'retained' || !record.contentRef) {
      limitations.push(`Manifest delta ${record.evidenceId} has no retained content reference.`);
      continue;
    }
    const remaining = MAX_DELTA_BYTES - total;
    if (remaining <= 0) {
      limitations.push('Manifest delta resolution stopped at the 1 MiB total byte cap.');
      break;
    }
    try {
      const bytes = await store.get(record.contentRef, Math.min(MAX_DELTA_RECORD_BYTES, remaining));
      total += bytes.length;
      content.push({ evidenceId: record.evidenceId, contentRef: record.contentRef, text: bytes.toString('utf8') });
    } catch (error) {
      const code = error instanceof StorageError ? error.code : 'READ_FAILED';
      limitations.push(`Manifest delta ${record.evidenceId} could not be read within the configured byte bounds and hash-verified (${code}).`);
    }
  }
  return { content, limitations };
}

export async function createIntelligenceModule(store: EvidenceStore, signal?: AbortSignal): Promise<AnalysisModule> {
  const identity = await moduleIdentity();
  return Object.freeze({
    moduleId: '@heurisko/intelligence',
    moduleVersion: identity.version,
    implementationSha256: identity.implementationSha256,
    configurationSha256: sha256(canonicalJSON({
      module: '@heurisko/intelligence',
      rules: ['manifest-lifecycle-script-change', 'manifest-script-change', 'manifest-entrypoint-change', 'generated-candidate', 'python-startup-hook', 'unresolved-difference'],
      version: 'm1',
      resolver: { records: MAX_DELTA_RECORDS, recordBytes: MAX_DELTA_RECORD_BYTES, totalBytes: MAX_DELTA_BYTES },
    })),
    analyzeEvidence: async (bundle: Readonly<EvidenceBundle>, options: AnalysisOptions) => {
      const resolved = await resolveManifestDeltas(bundle, store, signal);
      const result = await analyzeEvidence(bundle, options, resolved.content);
      if (!resolved.limitations.length) return result;
      const stage = result.stages.find((item) => item.stage === 'heuristics');
      if (stage) {
        stage.status = 'incomplete';
        stage.errors.push({
          stage: 'heuristics', code: 'EVIDENCE_RESOLUTION_INCOMPLETE',
          message: 'Some retained manifest delta evidence could not be resolved within the configured bounds.',
          affectedScope: 'manifest delta interpretation', retryable: false,
        });
      }
      return { ...result, limitations: [...result.limitations, ...resolved.limitations] };
    },
  });
}
