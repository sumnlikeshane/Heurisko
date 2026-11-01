import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { observationFromBytes, type Observation } from './observation.js';
import { publicHostedOrigin } from './service.js';

export function hostedSettings(env: NodeJS.ProcessEnv) {
    if (env.HEURISKO_WEB_MODE === undefined || env.HEURISKO_WEB_MODE === 'local') return undefined;
    if (env.HEURISKO_WEB_MODE !== 'public-readonly') throw Error('WEB_MODE_INVALID');
    const origin = publicHostedOrigin(env.RENDER_EXTERNAL_URL ?? '');
    if (!/^[1-9][0-9]{0,4}$/.test(env.PORT ?? '') || Number(env.PORT) > 65535) throw Error('HOSTED_PORT_INVALID');
    return { origin, port: Number(env.PORT) };
}

// Only these reviewed, committed public captures can be served anonymously.
// No command-line report/store path or browser upload can extend this catalog.
export const publicSamples = Object.freeze([
    { report: 'examples/final-hour/20261101-053912/integrated-55240e9/report.json', store: 'examples/final-hour/20261101-053912/integrated-55240e9/store', digest: 'c06db35768713d8c3b8dc4fc205a02c96e16af39d62dbe607f2c453373cc7f71' },
    { report: 'examples/handoff/current/B2.report.json', store: 'examples/handoff/current/store', digest: '1f09dd8942fa3b379d0dc3cf462772e8c3eedd616597c59f3ccc58176b6d6e1e' },
    { report: 'examples/handoff/current/B3.report.json', store: 'examples/handoff/current/store', digest: '66ea87bddf0319c4ccf8cc0d1e7be0f330eb17dc4fe4531775392692d9799757' },
]);
export async function openPublicSamples(root = resolve(fileURLToPath(new URL('../../../', import.meta.url)))): Promise<Observation[]> {
    const observations: Observation[] = [];
    for (const sample of publicSamples) {
        const path = join(root, sample.report), raw = await readFile(path);
        if (createHash('sha256').update(raw).digest('hex') !== sample.digest) throw Error('PUBLIC_SAMPLE_HASH_MISMATCH');
        observations.push(await observationFromBytes(raw, join(root, sample.store)));
    }
    return observations;
}
