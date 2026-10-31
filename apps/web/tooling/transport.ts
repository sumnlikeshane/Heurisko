import * as fs from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve, join, parse } from 'node:path';
import { createHash } from 'node:crypto';
import { boundedFile, sha256 } from '@heurisko/core';
import {transportJSON} from './strict-json.js';
import { openObservation, type Observation, readerLimits } from '../server/observation.js';
const format = 'heurisko-web-export-v1', digest = /^sha256:[a-f0-9]{64}$/;
const aggregateLimit = 64 * 1024 * 1024;
let transportBusy = false;
function check(signal: AbortSignal) { if (signal.aborted)
    throw Error('TRANSPORT_CANCELLED'); }
async function exclusive<T>(work: () => Promise<T>): Promise<T> { if (transportBusy)
    throw Error('TRANSPORT_BUSY'); transportBusy = true; try {
    return await work();
}
finally {
    transportBusy = false;
} }
export interface Manifest {
    format: typeof format;
    reportId: string;
    schemaVersion: string;
    reportContentRef: string;
    reportBytes: number;
    exportedAt: string;
    notices: string[];
    blobs: ({
        contentRef: string;
        status: 'included';
        bytes: number;
    } | {
        contentRef: string;
        status: 'omitted';
        reason: string;
    })[];
    partial: boolean;
}
async function plainDirectories(path: string) { const target = resolve(path); let p = parse(target).root; for (const part of target.slice(p.length).split('/').filter(Boolean)) {
    p = join(p, part);
    const stat = await fs.lstat(p);
    if (!stat.isDirectory() || stat.isSymbolicLink())
        throw Error('UNSAFE_DIRECTORY');
} }
async function performExport(observation: Observation, destination: string, signal: AbortSignal, notices: string[] = ['Third-party package and source bytes retain their upstream rights. Consult retained LICENSE/NOTICE evidence before redistribution.']): Promise<Manifest> {
    check(signal);
    const destinationRoot = resolve(destination);
    await plainDirectories(resolve(destinationRoot, '..'));
    await fs.mkdir(destinationRoot, { mode: 0o700 });
    await fs.mkdir(join(destinationRoot, 'blobs'), { mode: 0o700 });
    const r = observation.reader.report, refs = [...new Set(r.bundle.evidence.flatMap(e => e.contentRef ? [e.contentRef] : []))].sort();
    const blobs: Manifest['blobs'] = [];
    let total = 0;
    for (const contentRef of refs) {
        check(signal);
        const candidates = r.bundle.evidence.filter(e => e.contentRef === contentRef && e.contentState === 'retained').sort((a, b) => Number(a.locator.startByte !== undefined) - Number(b.locator.startByte !== undefined));
        let bytes: Buffer | undefined, reason = 'UNAVAILABLE';
        for (const e of candidates) {
            const first = await observation.reader.readEvidence(e.evidenceId, { length: readerLimits.pageBytes, signal });
            if (first.kind !== 'content') {
                reason = first.reason;
                continue;
            }
            if (first.recordedRange.startByte !== 0 || first.recordedRange.endByte !== first.totalBytes) {
                reason = 'SCOPED_RECORD_ONLY';
                continue;
            }
            if (total + first.totalBytes > aggregateLimit) {
                reason = 'EXPORT_TOTAL_LIMIT';
                break;
            }
            const chunks = [Buffer.from(first.bytesBase64, 'base64')];
            let offset = chunks[0]!.length;
            while (offset < first.totalBytes) {
                const page = await observation.reader.readEvidence(e.evidenceId, { offset, length: readerLimits.pageBytes, signal });
                if (page.kind !== 'content' || page.displayedRange.startByte !== offset) {
                    reason = page.kind === 'metadata_only' ? page.reason : 'INVALID_RANGE';
                    break;
                }
                const chunk = Buffer.from(page.bytesBase64, 'base64');
                if (!chunk.length) {
                    reason = 'INVALID_RANGE';
                    break;
                }
                chunks.push(chunk);
                offset += chunk.length;
            }
            if (offset === first.totalBytes) {
                bytes = Buffer.concat(chunks);
                break;
            }
        }
        if (bytes && sha256(bytes) === contentRef) {
            await fs.writeFile(join(destinationRoot, 'blobs', contentRef.slice(7)), bytes, { flag: 'wx', mode: 0o600 });
            total += bytes.length;
            blobs.push({ contentRef, status: 'included', bytes: bytes.length });
        }
        else
            blobs.push({ contentRef, status: 'omitted', reason: bytes ? 'HASH_MISMATCH' : reason });
    }
    const manifest: Manifest = { format, reportId: r.reportId, schemaVersion: r.schemaVersion, reportContentRef: observation.reader.reportContentRef, reportBytes: observation.raw.length, exportedAt: new Date().toISOString(), notices, blobs, partial: blobs.some(b => b.status === 'omitted') };
    await fs.writeFile(join(destinationRoot, 'report.json'), observation.raw, { flag: 'wx', mode: 0o600 });
    await fs.writeFile(join(destinationRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    return manifest;
}
function exactKeys(value: Record<string, unknown>, keys: string[]) { return Object.keys(value).sort().join(',') === keys.sort().join(','); }
async function verifyBlob(root: string, ref: string, expected: number, signal: AbortSignal) {
    check(signal);
    const file = await fs.open(join(root, 'blobs', ref.slice(7)), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
        const stat = await file.stat();
        if (!stat.isFile() || stat.size !== expected)
            throw Error('BLOB_SIZE_MISMATCH');
        let size = 0;
        const hash = createHash('sha256');
        for await (const chunk of file.createReadStream({ autoClose: false, highWaterMark: 65536, signal })) {
            size += chunk.length;
            if (size > expected)
                throw Error('BLOB_SIZE_MISMATCH');
            hash.update(chunk);
        }
        if (size !== expected || 'sha256:' + hash.digest('hex') !== ref)
            throw Error('BLOB_HASH_MISMATCH');
    }
    finally {
        await file.close();
    }
}
async function performImport(directory: string, signal: AbortSignal): Promise<Observation> {
    check(signal);
    const root = resolve(directory);
    await plainDirectories(join(root, 'blobs'));
    let m: any;
    try {
        m = transportJSON(await boundedFile(join(root, 'manifest.json'), 2 * 1024 * 1024));
    }
    catch {
        throw Error('MANIFEST_INVALID');
    }
    if (!m || !exactKeys(m, ['format', 'reportId', 'schemaVersion', 'reportContentRef', 'reportBytes', 'exportedAt', 'notices', 'blobs', 'partial']) || m.format !== format || !digest.test(m.reportContentRef) || !Number.isSafeInteger(m.reportBytes) || m.reportBytes < 1 || m.reportBytes > readerLimits.reportBytes || typeof m.reportId !== 'string' || m.schemaVersion !== '0.1.0' || typeof m.exportedAt !== 'string' || !Number.isFinite(Date.parse(m.exportedAt)) || !Array.isArray(m.notices) || m.notices.length > 32 || m.notices.some((n: unknown) => typeof n !== 'string' || n.length > 4096) || !Array.isArray(m.blobs) || m.blobs.length > 20000 || typeof m.partial !== 'boolean')
        throw Error('MANIFEST_INVALID');
    const observation = await openObservation(join(root, 'report.json'), root, signal), r = observation.reader.report;
    if (observation.raw.length !== m.reportBytes || observation.reader.reportContentRef !== m.reportContentRef || r.reportId !== m.reportId || r.schemaVersion !== m.schemaVersion)
        throw Error('REPORT_BINDING_MISMATCH');
    const refs = new Set(r.bundle.evidence.flatMap(e => e.contentRef ? [e.contentRef] : [])), seen = new Set();
    let total = 0, included = 0, omitted = 0;
    for (const b of m.blobs) {
        check(signal);
        if (!b || !digest.test(b.contentRef) || !refs.has(b.contentRef) || seen.has(b.contentRef))
            throw Error('MANIFEST_INVALID');
        seen.add(b.contentRef);
        if (b.status === 'included') {
            if (!exactKeys(b, ['contentRef', 'status', 'bytes']) || !Number.isSafeInteger(b.bytes) || b.bytes < 0 || b.bytes > readerLimits.blobBytes)
                throw Error('MANIFEST_INVALID');
            total += b.bytes;
            if (total > aggregateLimit)
                throw Error('IMPORT_TOTAL_LIMIT');
            await verifyBlob(root, b.contentRef, b.bytes, signal);
            included++;
        }
        else if (b.status === 'omitted') {
            if (!exactKeys(b, ['contentRef', 'status', 'reason']) || typeof b.reason !== 'string' || !/^[A-Z_]{1,64}$/.test(b.reason))
                throw Error('MANIFEST_INVALID');
            try {
                await fs.lstat(join(root, 'blobs', b.contentRef.slice(7)));
                throw Error('OMITTED_BLOB_PRESENT');
            }
            catch (e) {
                if ((e as NodeJS.ErrnoException).code !== 'ENOENT')
                    throw e;
            }
            omitted++;
        }
        else
            throw Error('MANIFEST_INVALID');
    }
    if (seen.size !== refs.size || m.partial !== (omitted > 0))
        throw Error('MANIFEST_INVALID');
    observation.transport = { format, exportedAt: m.exportedAt, included, omitted, notices: m.notices, omissions: m.blobs.filter((b: any) => b.status === 'omitted').map((b: any) => ({ contentRef: b.contentRef, reason: b.reason })) };
    return observation;
}
export function exportObservation(observation: Observation, destination: string, notices?: string[], signal = AbortSignal.timeout(120000)) { return exclusive(() => performExport(observation, destination, signal, notices)); }
export function importObservation(directory: string, signal = AbortSignal.timeout(120000)) { return exclusive(() => performImport(directory, signal)); }
