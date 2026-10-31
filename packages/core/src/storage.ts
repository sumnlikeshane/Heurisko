import { constants } from 'node:fs';
import * as fs from 'node:fs/promises';
import { dirname, join, resolve, parse } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { InvestigationReport } from '@heurisko/contracts';
import { canonicalJSON, sha256, sourceIdentity } from './identity.js';
import { decodeReport, encodeReport, type ValidationContext } from './validation.js';
import { safetyProfile } from './safety.js';

export class StorageError extends Error { constructor(public readonly code:string) { super(code); } }
export const digestPattern = /^sha256:[a-f0-9]{64}$/;
export async function privateDirectory(path:string):Promise<void> {
  const target=resolve(path); let current=parse(target).root;
  for (const part of target.slice(current.length).split('/').filter(Boolean)) {
    current=join(current,part);
    try { await fs.mkdir(current,{mode:0o700}); } catch(e) { if ((e as NodeJS.ErrnoException).code!=='EEXIST') throw e; }
    const info=await fs.lstat(current);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new StorageError('UNSAFE_STORAGE_DIRECTORY');
  }
}
export async function boundedFile(path:string,limit:number):Promise<Buffer> {
  const handle=await fs.open(path,constants.O_RDONLY|constants.O_NOFOLLOW);
  try {
    const stat=await handle.stat(); if (!stat.isFile() || stat.size>limit) throw new StorageError('FILE_LIMIT_OR_TYPE');
    const chunks:Buffer[]=[]; let total=0;
    for await (const chunk of handle.createReadStream({autoClose:false})) { total+=chunk.length; if(total>limit) throw new StorageError('FILE_LIMIT_OR_TYPE'); chunks.push(chunk); }
    return Buffer.concat(chunks,total);
  } finally { await handle.close(); }
}
async function syncDirectory(path:string) { const h=await fs.open(path,constants.O_RDONLY); try { await h.sync(); } finally { await h.close(); } }
// Link publishes a fully written, fsynced inode without replacing existing bytes.
export async function writeImmutable(path:string,bytes:Uint8Array):Promise<void> {
  bytes=Buffer.from(bytes);
  await privateDirectory(dirname(path)); const temporary=join(dirname(path),`.pending-${randomUUID()}`);
  const h=await fs.open(temporary,'wx',0o600);
  try {
    await h.writeFile(bytes); await h.sync(); await h.close();
    try { await fs.link(temporary,path); }
    catch(e) {
      if ((e as NodeJS.ErrnoException).code!=='EEXIST') throw e;
      const prior=await boundedFile(path,bytes.byteLength);
      if (!prior.equals(Buffer.from(bytes))) throw new StorageError('IMMUTABLE_COLLISION');
    }
    await syncDirectory(dirname(path));
  } finally { await h.close().catch(()=>{}); await fs.unlink(temporary).catch(()=>{}); }
}
export interface StoreLimits { capBytes:number; reserveBytes:number }
export class EvidenceStore {
  readonly root:string;
  constructor(root=resolve(safetyProfile.storage.relativeRoot),readonly limits:StoreLimits=safetyProfile.storage) { this.root=resolve(root); }
  async initialize() { await privateDirectory(this.root); for(const d of ['blobs','runs','identities','scratch','state']) await privateDirectory(join(this.root,d)); }
  blobPath(ref:string):string { if(!digestPattern.test(ref)) throw new StorageError('INVALID_CONTENT_REF'); return join(this.root,'blobs',ref.slice(7)); }
  async get(ref:string,limit=128*1024*1024):Promise<Buffer> {
    await this.initialize(); const bytes=await boundedFile(this.blobPath(ref),limit);
    if(sha256(bytes)!==ref) throw new StorageError('BLOB_HASH_MISMATCH'); return bytes;
  }
  private async usage(path=this.root):Promise<number> {
    let bytes=0;
    for(const item of await fs.readdir(path,{withFileTypes:true})) {
      const p=join(path,item.name); const s=await fs.lstat(p);
      if(s.isSymbolicLink() || (!s.isDirectory()&&!s.isFile())) throw new StorageError('UNSAFE_STORAGE_ENTRY');
      bytes+=s.isDirectory()?await this.usage(p):s.size;
      if(bytes>this.limits.capBytes) throw new StorageError('STORE_CAP');
    } return bytes;
  }
  async assertCapacity(bytes:number):Promise<void> {
    const used=await this.usage(); const disk=await fs.statfs(this.root,{bigint:true});
    if(used+bytes>this.limits.capBytes) throw new StorageError('STORE_CAP');
    if(disk.bavail*disk.bsize<BigInt(bytes+this.limits.reserveBytes)) throw new StorageError('STORE_DISK_RESERVE');
  }
  async exclusive<T>(work:()=>Promise<T>):Promise<T> {
    await this.initialize(); const lock=join(this.root,'.write-lock');
    // A crash leaves a fail-closed lock. Recovery is explicit, never a guessed stale lease.
    try { await fs.mkdir(lock,{mode:0o700}); } catch { throw new StorageError('STORE_BUSY_RECOVERY_REQUIRED'); }
    try { return await work(); } finally { await fs.rmdir(lock); }
  }
  async put(bytes:Uint8Array):Promise<`sha256:${string}`> {
    bytes=Buffer.from(bytes);
    const ref=sha256(bytes); await this.initialize();
    return this.exclusive(async()=>{
      try { const prior=await this.get(ref); if(!prior.equals(Buffer.from(bytes))) throw new StorageError('IMMUTABLE_COLLISION'); return ref; }
      catch(e) { if((e as NodeJS.ErrnoException).code!=='ENOENT') throw e; }
      await this.assertCapacity(bytes.byteLength); await writeImmutable(this.blobPath(ref),bytes); return ref;
    });
  }
  async putJSON(value:unknown) { return this.put(Buffer.from(canonicalJSON(value))); }
  async saveReport(report:InvestigationReport,context:ValidationContext={}):Promise<string> {
    report=structuredClone(report);
    const bytes=Buffer.from(await encodeReport(report,context));
    // G0's short IDs are reference labels. Full identity payloads guard collisions.
    const identity=Buffer.from(canonicalJSON({artifact:report.bundle.artifact.observedSha256,source:report.bundle.sourceCandidates.map(sourceIdentity),config:report.analysisConfigFingerprint}));
    const ref=await this.put(bytes);
    await this.exclusive(async()=>{
      await this.assertCapacity(identity.length+512);
      await writeImmutable(join(this.root,'identities',report.reportId+'.json'),identity);
      const run=Buffer.from(canonicalJSON({version:'heurisko-run-v1',reportId:report.reportId,reportContentRef:ref,createdAt:report.createdAt}));
      await writeImmutable(join(this.root,'runs',report.reportId,ref.slice(7)+'.json'),run);
    }); return ref;
  }
  async loadReport(ref:string,context:ValidationContext={}):Promise<InvestigationReport> {
    return decodeReport((await this.get(ref,8*1024*1024)).toString('utf8'),context);
  }
  async verifyEvidence(report:InvestigationReport):Promise<void> {
    report=structuredClone(report);
    for(const e of report.bundle.evidence) if(e.contentState==='retained') {
      if(!e.contentRef || e.contentRef!==e.contentSha256) throw new StorageError('INVALID_CONTENT_REF');
      const bytes=await this.get(e.contentRef);
      if(e.locator.endByte!==undefined && e.locator.endByte>bytes.length) throw new StorageError('INVALID_EVIDENCE_SPAN');
    }
  }
}
