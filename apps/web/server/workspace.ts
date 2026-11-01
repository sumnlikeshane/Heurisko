// Privileged local boundary: only opaque upload IDs and fixed server-owned storage.
// Never receives a shell command, a host path, a parser recipe or an engine module.
import * as fs from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import type { AnalysisOptions, ArtifactInput } from '@heurisko/contracts';
import { EvidenceStore, encodeReport, exitCode, investigate, npmCoordinates, pinnedSourceURL, privateDirectory, safeSubdirectory, sha256, type StageProgress } from '@heurisko/core';
import { observationFromBytes, type Observation } from './observation.js';
import { transportJSON } from '../tooling/strict-json.js';
import { exportPortable, importPortable } from '../tooling/portable.js';
export const webLimits = Object.freeze({ jobs: 16, uploads: 32, admittedBytes: 256 * 1024 * 1024, archiveBytes: 32 * 1024 * 1024, portableBytes: 100 * 1024 * 1024, reportBytes: 8 * 1024 * 1024, jobMs: 300000 });
const id = () => randomBytes(16).toString('hex');
export function errorCode(e: unknown) { return e instanceof Error && /^[A-Z][A-Z0-9_]{0,80}$/.test(e.message) ? e.message : 'LOCAL_OPERATION_FAILED'; }
function object(value: unknown, keys: string[]): asserts value is Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !keys.includes(k))) throw Error('INVALID_INPUT');
}
function text(value: unknown, limit = 1024): string | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== 'string' || !value.length || value.length > limit || /[\x00-\x1f\x7f]/.test(value)) throw Error('INVALID_INPUT');
    return value;
}
export interface JobSnapshot {
    id: string; phase: 'running' | 'cancel_requested' | 'settled_report' | 'settled_error';
    startedAt: string; settledAt?: string; cancellationRequested: boolean; cleanup: 'not_observable';
    request?: { kind: 'npm'|'local'; target?: string; artifact?: {filename:string;bytes:number;sha256:string}; sourceArchive?: {filename:string;bytes:number;sha256:string}; name?:string; version?:string; source?:string; commit?:string; subdirectory?:string; enableAI:boolean; policy?:string; analysisProfile:string };
    events: (StageProgress & { sequence: number })[]; omittedEvents: number;
    observation?: string; exitCode?: number; error?: string; retainedFailureRef?: string;
}
export class WebWorkspace {
    readonly store: EvidenceStore;
    private capacity: EvidenceStore;
    private uploads = new Map<string, { path: string; kind: string; filename: string; bytes:number; sha256:string }>();
    private jobs = new Map<string, { snapshot: JobSnapshot; controller: AbortController; done: Promise<void> }>();
    private admittedBytes = 0;
    private operations = 0;
    private closing = false;
    constructor(readonly root = resolve('.heurisko/web-workspace'), private engine: typeof investigate = investigate) { this.store = new EvidenceStore(join(root, 'store')); this.capacity = new EvidenceStore(root); }
    async initialize() { await privateDirectory(this.root); await privateDirectory(join(this.root, 'uploads')); await privateDirectory(join(this.root, 'imports')); await privateDirectory(join(this.root, 'exports')); }
    async exclusive<T>(work: () => Promise<T>): Promise<T> {
        if (this.closing) throw Error('SERVICE_STOPPING');
        if (this.operations) throw Error('LOCAL_OPERATION_BUSY');
        this.operations++;
        try { return await work(); } finally { this.operations--; }
    }
    uploadLimit(kind: string) { if (kind === 'artifact' || kind === 'source') return webLimits.archiveBytes; if (kind === 'report') return webLimits.reportBytes; if (kind === 'portable') return webLimits.portableBytes; throw Error('UPLOAD_KIND_INVALID'); }
    async upload(kind: string, filename: string, bytes: Buffer) {
        const limit = this.uploadLimit(kind);
        if (!filename || filename.length > 128 || /[\/\\:\x00-\x1f\x7f]/.test(filename) || filename === '.' || filename === '..') throw Error('UPLOAD_NAME_INVALID');
        if (!bytes.length || bytes.length > limit) throw Error('UPLOAD_LIMIT');
        if (this.uploads.size >= webLimits.uploads || this.admittedBytes + bytes.length > webLimits.admittedBytes) throw Error('SESSION_UPLOAD_LIMIT');
        const admitted = Buffer.from(bytes), size = admitted.length, digest = sha256(admitted);
        await this.initialize();
        await this.capacity.assertCapacity(size);
        const disk = await fs.statfs(this.root, { bigint: true });
        if (disk.bavail * disk.bsize < BigInt(size * 2 + 64 * 1024 * 1024)) throw Error('STORE_DISK_RESERVE');
        const handle = id(), path = join(this.root, 'uploads', handle);
        await fs.writeFile(path, admitted, { flag: 'wx', mode: 0o600 });
        this.uploads.set(handle, { path, kind, filename, bytes:size, sha256:digest }); this.admittedBytes += size;
        return { upload: handle, bytes: size, sha256: digest, kind };
    }
    private uploaded(value: unknown, kind: string) {
        const handle = text(value, 32), upload = handle ? this.uploads.get(handle) : undefined;
        if (!upload || upload.kind !== kind) throw Error('UPLOAD_NOT_FOUND');
        return upload;
    }
    prepare(value: unknown) {
        object(value, ['kind', 'target', 'artifact', 'sourceArchive', 'name', 'version', 'source', 'commit', 'subdirectory', 'enableAI', 'policy']);
        if (typeof value.enableAI !== 'boolean') throw Error('INVALID_INPUT');
        const policy = text(value.policy), source = text(value.source), commit = text(value.commit), subdirectory = text(value.subdirectory);
        if (!!source !== !!commit || !source && (subdirectory || value.sourceArchive)) throw Error('INVOCATION_INVALID');
        if (source) { pinnedSourceURL(source, commit!); safeSubdirectory(subdirectory ?? ''); }
        const options: AnalysisOptions = { enableAI: value.enableAI, analysisProfile: 'raw-static-s3-v1', ...(policy ? { trustPolicyRef: policy } : {}) };
        const override = source ? { sourceOverride: { repo: source, commit: commit!, ...(subdirectory ? { subdirectory } : {}) } } : {};
        let input: ArtifactInput, sourceArchivePath: string | undefined;
        if (value.kind === 'npm') {
            if (['artifact', 'sourceArchive', 'name', 'version'].some(k => value[k] !== undefined)) throw Error('INVOCATION_INVALID');
            const target = text(value.target), match = /^npm:(.+)@([^@]+)$/.exec(target ?? '');
            if (!match) throw Error('INVOCATION_INVALID');
            npmCoordinates(match[1]!, match[2]!);
            input = { ecosystem: 'npm', packageName: match[1]!, version: match[2]!, analysisOptions: options, ...override };
        } else if (value.kind === 'local') {
            if (value.target !== undefined) throw Error('INVOCATION_INVALID');
            const artifact = this.uploaded(value.artifact, 'artifact'), name = text(value.name), version = text(value.version);
            if (value.sourceArchive) sourceArchivePath = this.uploaded(value.sourceArchive, 'source').path;
            input = { ecosystem: 'local', artifactPath: artifact.path, artifactFilename: artifact.filename, ...(name ? { packageName: name } : {}), ...(version ? { version } : {}), analysisOptions: options, ...override };
        } else throw Error('INVOCATION_INVALID');
        return { input, options, sourceArchivePath };
    }
    start(value: unknown, admit: (observation: Observation) => void) {
        if (this.closing) throw Error('SERVICE_STOPPING');
        if ([...this.jobs.values()].some(j => !j.snapshot.phase.startsWith('settled'))) throw Error('INVESTIGATION_BUSY');
        if (this.jobs.size >= webLimits.jobs) throw Error('SESSION_JOB_LIMIT');
        const { input, options, sourceArchivePath } = this.prepare(value), handle = id(), controller = new AbortController();
        const record = value as Record<string,unknown>;
        const uploadSummary = (key:string,kind:string) => { const {filename,bytes,sha256}=this.uploaded(record[key],kind);return {filename,bytes,sha256}; };
        const request: NonNullable<JobSnapshot['request']> = {kind:input.ecosystem,enableAI:options.enableAI,analysisProfile:options.analysisProfile,
            ...(input.ecosystem==='npm'?{target:`npm:${input.packageName}@${input.version}`}:{artifact:uploadSummary('artifact','artifact'),...(input.packageName?{name:input.packageName}:{}),...(input.version?{version:input.version}:{})}),
            ...(sourceArchivePath?{sourceArchive:uploadSummary('sourceArchive','source')}:{}),
            ...(input.sourceOverride?{source:input.sourceOverride.repo,commit:input.sourceOverride.commit,subdirectory:input.sourceOverride.subdirectory}:{}),...(options.trustPolicyRef?{policy:options.trustPolicyRef}:{})};
        const snapshot: JobSnapshot = { id: handle, phase: 'running', startedAt: new Date().toISOString(), cancellationRequested: false, cleanup: 'not_observable', request, events: [], omittedEvents: 0 };
        let sequence = 0;
        const timer = setTimeout(() => this.cancel(handle), webLimits.jobMs);
        // Hold admission until the real engine settles, including cancellation/cleanup windows.
        const done = Promise.resolve().then(async () => {
            try {
                const report = await this.engine(input, options, { store: this.store, sourceArchivePath, signal: controller.signal, onProgress: event => {
                    snapshot.events.push({ ...event, sequence: ++sequence });
                    if (snapshot.events.length > 128) { snapshot.events.shift(); snapshot.omittedEvents++; }
                } });
                const raw = Buffer.from(await encodeReport(report));
                const observation = await observationFromBytes(raw, this.store.root);
                admit(observation); snapshot.observation = observation.handle; snapshot.exitCode = exitCode(report); snapshot.phase = 'settled_report';
            } catch (error) {
                snapshot.phase = 'settled_error'; snapshot.exitCode = 3; snapshot.error = errorCode(error);
                const cause = error instanceof Error ? error.cause as { retainedFailureRef?: unknown } | undefined : undefined;
                if (typeof cause?.retainedFailureRef === 'string' && /^sha256:[a-f0-9]{64}$/.test(cause.retainedFailureRef)) snapshot.retainedFailureRef = cause.retainedFailureRef;
            } finally { snapshot.settledAt = new Date().toISOString(); clearTimeout(timer); }
        });
        this.jobs.set(handle, { snapshot, controller, done });
        return structuredClone(snapshot);
    }
    listJobs() { return [...this.jobs.values()].map(j => structuredClone(j.snapshot)); }
    job(handle: string) { const j = this.jobs.get(handle); if (!j) throw Error('JOB_NOT_FOUND'); return structuredClone(j.snapshot); }
    cancel(handle: string) { const j = this.jobs.get(handle); if (!j) throw Error('JOB_NOT_FOUND'); if (!j.snapshot.phase.startsWith('settled')) { j.snapshot.cancellationRequested = true; j.snapshot.phase = 'cancel_requested'; j.controller.abort(); } return this.job(handle); }
    async reopen(value: unknown): Promise<Observation> {
        object(value, ['upload', 'digest']);
        if (!!value.upload === !!value.digest) throw Error('INVALID_INPUT');
        if (value.digest) {
            const digest = text(value.digest);
            if (!/^sha256:[a-f0-9]{64}$/.test(digest ?? '')) throw Error('INVALID_CONTENT_REF');
            const raw = await this.store.get(digest!, webLimits.reportBytes);
            return observationFromBytes(raw, this.store.root);
        }
        const upload = this.uploaded(value.upload, this.uploads.get(String(value.upload))?.kind ?? '');
        if (upload.kind === 'portable') {
            const bytes = await fs.readFile(upload.path);
            // Decoded imports cannot exceed the remaining session admission budget.
            await this.capacity.assertCapacity(Math.min(webLimits.admittedBytes - this.admittedBytes, 74 * 1024 * 1024));
            const imported = await importPortable(bytes, join(this.root, 'imports'), webLimits.admittedBytes - this.admittedBytes);
            this.admittedBytes += imported.bytes;
            return imported.observation;
        }
        if (upload.kind !== 'report') throw Error('UPLOAD_KIND_INVALID');
        const raw = await fs.readFile(upload.path);
        // Report-only reopen is intentionally metadata-capable; missing evidence is not fabricated.
        return observationFromBytes(raw, this.store.root);
    }
    async portable(observation: Observation) { await this.initialize(); await this.capacity.assertCapacity(74 * 1024 * 1024); return exportPortable(observation, join(this.root, 'exports')); }
    async close() { this.closing = true; for (const [handle] of this.jobs) this.cancel(handle); await Promise.allSettled([...this.jobs.values()].map(j => j.done)); }
}
export function requestJSON(bytes: Buffer) { return transportJSON(bytes); }
