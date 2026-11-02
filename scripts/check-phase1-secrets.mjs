// Common-format scan only. Values never enter findings, errors or receipts.
import { execFileSync } from 'node:child_process';
import { constants } from 'node:fs';
import { open, lstat } from 'node:fs/promises';
import { basename, extname, resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const extensions = new Set(['.md','.json','.jsonl','.ts','.tsx','.js','.mjs','.cjs','.py','.log','.env','.yaml','.yml','.txt','.toml','.ini','.cfg','.sh']);
// Only the minimum accepting prefix is needed: unbounded tails never need to
// be buffered. Longest recognized match is 41 ASCII bytes, below the overlap.
export const formats = [
 ['OpenRouter key', /sk-or-v1-[A-Za-z0-9]{20}/],
 ['AWS access key ID', /AKIA[0-9A-Z]{16}/],
 ['GitHub token', /gh[pousr]_[A-Za-z0-9]{30}/],
 ['GitHub fine-grained token', /github_pat_[A-Za-z0-9_]{30}/],
 ['private key block', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
];
export const defaults = Object.freeze({ chunkBytes:65536, overlapBytes:64, maxFileBytes:256*1024*1024, maxTotalBytes:4*1024*1024*1024, maxFiles:100000, maxMs:120000 });
export function supported(name) {return extensions.has(extname(name)) || basename(name).startsWith('.env') || ['Dockerfile','Dockerfile.render','.npmrc','.pnpmfile.cjs','.gitignore','.dockerignore'].includes(basename(name));}
const identity = s => [s.dev,s.ino,s.size,s.mtimeNs,s.ctimeNs].join(':');
export async function scanFiles(root,names,{limits={},expectedHashes,afterChunk,clock=()=>performance.now()}={}) {
 const caps={...defaults,...limits};
 if(Object.values(caps).some(n=>!Number.isSafeInteger(n)||n<=0)||caps.overlapBytes<64||caps.chunkBytes<128||caps.chunkBytes>65536||caps.overlapBytes!==64)throw Error('INVALID_SCAN_LIMITS');
 const start=clock(),coverage={candidates:names.length,checked:0,bytes:0,excludedType:0,byExtension:{}},matches=[],failures=[],exclusions=[];
 const fail=(path,reason)=>failures.push({path,reason});
 const buffer=Buffer.alloc(caps.chunkBytes);let budget=false;
 for(const [index,name] of names.entries()) {
  if(index>=caps.maxFiles||clock()-start>caps.maxMs){fail(name,index>=caps.maxFiles?'FILE_COUNT_LIMIT':'TIME_LIMIT');budget=true;break;}
  if(!name||name.includes('\0')||resolve(root,name)===resolve(root)||relative(resolve(root),resolve(root,name)).split(sep).includes('..')){fail(name,'PATH_REJECTED');continue;}
  if(!supported(name)){coverage.excludedType++;exclusions.push({path:name,reason:'UNSUPPORTED_TYPE'});continue;}
  let file;
  try {
   // Refuse symlink ancestors as well as a final symlink. No private path may be
   // reached by a candidate redirect. Final open also uses kernel O_NOFOLLOW.
   let cursor=resolve(root);for(const part of relative(cursor,resolve(root,name)).split(sep)){cursor=resolve(cursor,part);if((await lstat(cursor)).isSymbolicLink())throw Error('NONREGULAR');}
   const before=await lstat(resolve(root,name),{bigint:true});if(!before.isFile())throw Error('NONREGULAR');
   if(before.size>BigInt(caps.maxFileBytes))throw Error('FILE_BYTE_LIMIT');
   file=await open(resolve(root,name),constants.O_RDONLY|constants.O_NOFOLLOW|constants.O_NONBLOCK);
   if(identity(await file.stat({bigint:true}))!==identity(before))throw Error('CHANGED_DURING_READ');
   const hash=createHash('sha256'),found=new Set();let tail=Buffer.alloc(0),bytes=0;
   for(;;) {
    if(clock()-start>caps.maxMs)throw Error('TIME_LIMIT');
    if(BigInt(bytes)===before.size)break;
    // Never read beyond a configured budget. Final identity/length checks
    // detect growth without requiring an unbudgeted EOF probe.
    const allowance=Math.min(buffer.length,Number(before.size)-bytes,caps.maxFileBytes-bytes,caps.maxTotalBytes-coverage.bytes);
    if(allowance<=0)throw Error('TOTAL_BYTE_LIMIT');
    const {bytesRead}=await file.read(buffer,0,allowance,null);if(!bytesRead)break;
    bytes+=bytesRead;coverage.bytes+=bytesRead;if(bytes>caps.maxFileBytes)throw Error('FILE_BYTE_LIMIT');
    const chunk=buffer.subarray(0,bytesRead);hash.update(chunk);
    const window=Buffer.concat([tail,chunk]);const text=window.toString('latin1');
    for(const [label,pattern] of formats)if(pattern.test(text))found.add(label);
    tail=Buffer.from(window.subarray(Math.max(0,window.length-caps.overlapBytes)));
    await afterChunk?.({name,bytes});
   }
   const after=await file.stat({bigint:true}),pathAfter=await lstat(resolve(root,name),{bigint:true});
   if(identity(before)!==identity(after)||identity(before)!==identity(pathAfter)||BigInt(bytes)!==before.size)throw Error('CHANGED_DURING_READ');
   if(expectedHashes&&hash.digest('hex')!==expectedHashes[name])throw Error('HASH_MISMATCH');
   coverage.checked++;const ext=extname(name)||'(configuration)';coverage.byExtension[ext]=(coverage.byExtension[ext]??0)+1;
   for(const format of found)matches.push({path:name,format});
  } catch(error) {
   // Never emit error.message: OS errors can contain untrusted text/values.
   const reasons=new Set(['NONREGULAR','FILE_BYTE_LIMIT','TOTAL_BYTE_LIMIT','TIME_LIMIT','CHANGED_DURING_READ','HASH_MISMATCH']);
   const reason=reasons.has(error.message)?error.message:['ENOENT','ELOOP'].includes(error.code)?'MISSING_OR_REDIRECTED':'READ_FAILED';fail(name,reason);
   if(['TOTAL_BYTE_LIMIT','TIME_LIMIT'].includes(reason)){budget=true;break;}
  } finally {await file?.close();}
 }
 const incomplete=failures.length>0;
 return {version:'heurisko-common-credential-scan-v2',scope:'Present nonignored Git candidate text only; unknown formats, unsupported types, ignored/private files and Git history outside coverage.',status:incomplete?'incomplete':matches.length?'findings':'complete',exitCode:incomplete?2:matches.length?1:0,limits:caps,coverage:{...coverage,unprocessed:budget?names.length-coverage.checked-coverage.excludedType-failures.length:0},matches,failures,exclusions,durationMs:Math.round(clock()-start)};
}
export function gitCandidates(root) {
 const names=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,maxBuffer:32*1024*1024}).toString().split('\0').filter(Boolean))].sort();
 // --no-index excludes ignored paths even if historically tracked.
 let ignored='';try{ignored=execFileSync('git',['check-ignore','--no-index','-z','--stdin'],{cwd:root,input:names.join('\0')+'\0',maxBuffer:32*1024*1024}).toString();}catch(e){if(e.status!==1)throw Error('GIT_IGNORE_CHECK_FAILED');}
 const excluded=new Set(ignored.split('\0').filter(Boolean));return {names:names.filter(n=>!excluded.has(n)),ignored:excluded.size};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
 try {
  const root=process.cwd(),candidates=gitCandidates(root);let names=candidates.names,expectedHashes,manifestSha256;
  if(process.argv[2]) {
   if(process.argv[2]!=='--manifest'||process.argv.length!==4)throw Error('USAGE');
   const f=await open(process.argv[3],constants.O_RDONLY|constants.O_NOFOLLOW);let bytes;try{if((await f.stat()).size>32*1024*1024)throw Error('MANIFEST_LIMIT');bytes=await f.readFile();}finally{await f.close();}
   expectedHashes=JSON.parse(bytes).files;names=Object.keys(expectedHashes).sort();const available=new Set(candidates.names);if(names.some(n=>!available.has(n)))throw Error('MANIFEST_NOT_CURRENT_GIT_CANDIDATES');manifestSha256=createHash('sha256').update(bytes).digest('hex');
  }
  const result=await scanFiles(root,names,{expectedHashes});result.ignoredCandidates=candidates.ignored;if(manifestSha256)result.manifestSha256=manifestSha256;
  console.log(JSON.stringify(result,null,2));process.exitCode=result.exitCode;
 }catch {console.log(JSON.stringify({status:'incomplete',reason:'SCAN_SETUP_FAILED',exitCode:2}));process.exitCode=2;}
}
