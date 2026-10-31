// A browser-downloadable envelope around the existing verified directory transport.
// Names are derived from full digests, never from uploaded filesystem paths.
import * as fs from 'node:fs/promises';
import { join } from 'node:path';
import { boundedFile, sha256 } from '@heurisko/core';
import { exportObservation, importObservation } from './transport.js';
import { transportJSON } from './strict-json.js';
import type { Observation } from '../server/observation.js';
const format = 'heurisko-web-portable-v1';
function base64(value: unknown, limit: number): Buffer {
    if (typeof value !== 'string' || value.length > Math.ceil(limit / 3) * 4 || /[^A-Za-z0-9+/=]/.test(value)) throw Error('PORTABLE_INVALID');
    const bytes = Buffer.from(value, 'base64');
    if (bytes.length > limit || bytes.toString('base64') !== value) throw Error('PORTABLE_INVALID');
    return bytes;
}
export async function exportPortable(observation: Observation, parent: string): Promise<Buffer> {
    const staging = await fs.mkdtemp(join(parent, 'export-')), destination = join(staging, 'observation');
    try {
        const manifest = await exportObservation(observation, destination), blobs = [];
        for (const entry of manifest.blobs) if (entry.status === 'included') blobs.push({ contentRef: entry.contentRef, bytesBase64: (await boundedFile(join(destination, 'blobs', entry.contentRef.slice(7)), 32 * 1024 * 1024)).toString('base64') });
        return Buffer.from(JSON.stringify({ format, manifest, reportBase64: observation.raw.toString('base64'), blobs }));
    } finally { await fs.rm(staging, { recursive: true, force: true }); }
}
export async function importPortable(bytes: Buffer, parent: string, budget: number): Promise<{ observation: Observation; bytes: number }> {
    if (bytes.length > 100 * 1024 * 1024) throw Error('PORTABLE_LIMIT');
    const value = transportJSON(bytes, 100 * 1024 * 1024) as any;
    if (!value || Object.keys(value).sort().join(',') !== 'blobs,format,manifest,reportBase64' || value.format !== format || !Array.isArray(value.blobs) || value.blobs.length > 20000 || !value.manifest) throw Error('PORTABLE_INVALID');
    const report = base64(value.reportBase64, 8 * 1024 * 1024), blobs: { contentRef: string; bytes: Buffer }[] = [], seen = new Set<string>();
    let total = report.length;
    for (const b of value.blobs) {
        if (!b || Object.keys(b).sort().join(',') !== 'bytesBase64,contentRef' || typeof b.contentRef !== 'string' || !/^sha256:[a-f0-9]{64}$/.test(b.contentRef) || seen.has(b.contentRef)) throw Error('PORTABLE_INVALID');
        const content = base64(b.bytesBase64, 32 * 1024 * 1024);
        seen.add(b.contentRef); total += content.length;
        if (total > 72 * 1024 * 1024 || total > budget) throw Error('SESSION_UPLOAD_LIMIT');
        if (sha256(content) !== b.contentRef) throw Error('BLOB_HASH_MISMATCH');
        blobs.push({ contentRef: b.contentRef, bytes: content });
    }
    const manifest = Buffer.from(JSON.stringify(value.manifest));
    total += manifest.length;
    if (total > budget || manifest.length > 2 * 1024 * 1024) throw Error('SESSION_UPLOAD_LIMIT');
    const root = await fs.mkdtemp(join(parent, 'portable-'));
    // Failed imports remain private bounded diagnostic material; no arbitrary cleanup of job roots.
    await fs.mkdir(join(root, 'blobs'), { mode: 0o700 });
    await fs.writeFile(join(root, 'manifest.json'), manifest, { flag: 'wx', mode: 0o600 });
    await fs.writeFile(join(root, 'report.json'), report, { flag: 'wx', mode: 0o600 });
    for (const b of blobs) await fs.writeFile(join(root, 'blobs', b.contentRef.slice(7)), b.bytes, { flag: 'wx', mode: 0o600 });
    try { return { observation: await importObservation(root), bytes: total }; }
    catch (error) { await fs.rm(root, { recursive: true, force: true }); throw error; }
}
