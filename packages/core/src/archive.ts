import * as fs from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { EvidenceStore, boundedFile, StorageError, writeImmutable } from './storage.js';
import { sha256 } from './identity.js';
import { safetyProfile } from './safety.js';
import type { ValidationContext } from './validation.js';
import { parserContainerArguments } from './parser-runtime.js';
import { runParserJob, type ParserJobDriver } from './parser-job.js';

export interface ArchiveMember { originalName:string; path:string; type:'file'|'directory'; mode:number; uid:number; gid:number; mtime:string; size:number; pax:Record<string,string>; sha256?:`sha256:${string}`; contentRef?:string }
export interface ArchiveInventory { version:'heurisko-inventory-v1'; archiveRef:string; members:ArchiveMember[]; complete:boolean; code:string; remainingScope:'unknown'|'none'; knownFiles:number; knownBytes:number; runtime?:Record<string,unknown>; rejectedEntry?:Record<string,unknown>|null }
export interface ParserLimits { compressedBytes:number; expandedBytes:number; memberBytes:number; entries:number; pathBytes:number; pathDepth:number; cpuSeconds:number; memoryBytes:number; wallMs:number }
const defaults:ParserLimits={...safetyProfile.archive,...safetyProfile.parser};
let active=0; const queue:Array<()=>void>=[];
async function slot(signal?:AbortSignal) {
  if(signal?.aborted) throw new StorageError('CANCELLED');
  if(active) {
    if(queue.length>=safetyProfile.parser.queueDepth) throw new StorageError('PARSER_QUEUE_FULL');
    await new Promise<void>((accept,reject)=>{
      const ready=()=>{signal?.removeEventListener('abort',cancel); accept();};
      const cancel=()=>{const i=queue.indexOf(ready); if(i>=0)queue.splice(i,1); reject(new StorageError('CANCELLED'));};
      queue.push(ready); signal?.addEventListener('abort',cancel,{once:true});
    });
  } else active++;
}
function release(){ const next=queue.shift(); if(next) next(); else active--; }
export interface ArchiveContext extends ValidationContext { parserJobDriver?:ParserJobDriver }
export async function inventoryArchive(store:EvidenceStore,archiveRef:string,context:ArchiveContext={},limits:ParserLimits=defaults):Promise<ArchiveInventory> {
  await slot(context.signal);
  let scratch:string|undefined;
  let parserLock=false;
  let writeLock=false;
  let cleanupConfirmed=true;
  try {
    // Read/hash before opening the worker; immutable local archive bytes are retained.
    await store.get(archiveRef,limits.compressedBytes);
    // Hold the same cross-process write lock while the worker consumes its disk
    // reservation. CAS imports begin only after all worker writes have stopped.
    try{await fs.mkdir(join(store.root,'.write-lock'),{mode:0o700});writeLock=true;}catch{throw new StorageError('STORE_BUSY_RECOVERY_REQUIRED');}
    await store.assertCapacity(limits.expandedBytes+limits.compressedBytes+4*1024*1024);
    try {await fs.mkdir(join(store.root,'.parser-lock'),{mode:0o700});parserLock=true;}catch{throw new StorageError('PARSER_BUSY_RECOVERY_REQUIRED');}
    scratch=await fs.mkdtemp(join(store.root,'scratch','parser-')); await fs.chmod(scratch,0o700);
    const output=join(scratch,'output');await fs.mkdir(output,{mode:0o777});await fs.chmod(output,0o777);
    const root=fileURLToPath(new URL('../../../',import.meta.url));
    const worker=join(scratch,'worker.py'),input=join(scratch,'input.tar');
    await fs.copyFile(resolve(root,'packages/core/runtime/archive_worker.py'),worker);await fs.chmod(worker,0o444);
    await fs.copyFile(store.blobPath(archiveRef),input);await fs.chmod(input,0o444);
    const name='heurisko-parser-'+randomUUID();
    await writeImmutable(join(scratch,'job.json'),Buffer.from(JSON.stringify({version:'heurisko-parser-job-v1',name,storeLabel:sha256(store.root).slice(7),creation:'request-may-be-pending',createdAt:new Date().toISOString()})));
    cleanupConfirmed=false;
    const job=await runParserJob(parserContainerArguments({worker,input,output},limits,name,sha256(store.root).slice(7)),name,limits.wallMs,context.signal,context.parserJobDriver);
    cleanupConfirmed=job.cleanupConfirmed;
    const resultCode=job.code;
    await writeImmutable(join(scratch,'outcome.json'),Buffer.from(JSON.stringify({version:'heurisko-parser-job-outcome-v1',...job})));
    if(!cleanupConfirmed)throw new StorageError('PARSER_CLEANUP_UNCONFIRMED');
    const inventory:ArchiveInventory={version:'heurisko-inventory-v1',archiveRef,members:[],complete:false,code:resultCode,remainingScope:'unknown',knownFiles:0,knownBytes:0};
    let journal='';
    try { journal=(await boundedFile(join(output,'journal.jsonl'),4*1024*1024)).toString('utf8'); }
    catch(e) { if((e as NodeJS.ErrnoException).code!=='ENOENT') inventory.code='PARSER_JOURNAL_LIMIT'; }
    await fs.rmdir(join(store.root,'.write-lock'));writeLock=false;
    for(const line of journal.split('\n').filter(Boolean)) {
      let record; try { record=JSON.parse(line); } catch { break; }
      if(record.kind==='runtime'){const {kind,...runtime}=record;inventory.runtime=runtime;continue;}
      if(record.kind==='result') { if(['PARSER_INTERRUPTED','PARSER_RUNTIME_OR_INPUT_FAILURE'].includes(resultCode))Object.assign(inventory,{complete:record.complete,code:record.code,remainingScope:record.remainingScope,...(record.rejectedEntry?{rejectedEntry:record.rejectedEntry}:{})}); continue; }
      if(record.kind!=='member') continue;
      const {kind,spool,...member}=record;
      if(member.type==='file') {
        if(!/^\d+\.member$/.test(spool)) throw new StorageError('PARSER_INVALID_SPOOL');
        const bytes=await boundedFile(join(output,spool),limits.memberBytes);
        if(sha256(bytes)!==member.sha256 || bytes.length!==member.size) throw new StorageError('PARSER_MEMBER_MISMATCH');
        member.contentRef=await store.put(bytes); inventory.knownFiles++;inventory.knownBytes+=bytes.length;
      }
      inventory.members.push(member);
    }
    return inventory;
  } finally {
    // Failed daemon cleanup never broadens access or reuses a potentially live
    // job root. Keep its bounded spool/locks for explicit operator recovery.
    if(cleanupConfirmed){if(scratch)await fs.rm(scratch,{recursive:true,force:true});if(parserLock)await fs.rmdir(join(store.root,'.parser-lock'));if(writeLock)await fs.rmdir(join(store.root,'.write-lock'));}
    release();
  }
}
