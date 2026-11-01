// Convenience checks only. Server/core own authoritative parsing and network policy.
export type DraftRequest = { kind: 'npm' | 'local'; enableAI: boolean; target?: string; source?: string; commit?: string; subdirectory?: string; policy?: string; name?: string; version?: string; artifact?: File; sourceArchive?: File };
export type InvestigationFields = { target: string; name: string; version: string; source: string; commit: string; subdirectory: string; policy: string; enableAI: boolean };
// Every mode owns its values. This projection never admits bytes and cannot
// reinterpret a preserved local File as an npm input when switching modes.
export function draftRequest(kind: 'npm' | 'local', fields: InvestigationFields, files: { artifact?: File; sourceArchive?: File } = {}): DraftRequest {
 const draft: DraftRequest = { kind, enableAI: fields.enableAI };
 for (const key of ['source','commit','subdirectory','policy',...(kind === 'npm' ? ['target'] : ['name','version'])] as const) {
  const value = fields[key as keyof InvestigationFields];
  if (typeof value === 'string' && value.trim()) (draft as unknown as Record<string,unknown>)[key] = value.trim();
 }
 if (kind === 'local') { if (files.artifact) draft.artifact = files.artifact; if (files.sourceArchive) draft.sourceArchive = files.sourceArchive; }
 return draft;
}
export type InputIssue = { field: string; message: string };
export function validateDraft(d: DraftRequest): InputIssue[] {
 const errors: InputIssue[] = [], add=(field:string,message:string)=>errors.push({field,message});
 for(const key of ['target','source','commit','subdirectory','policy','name','version'] as const) {const v=d[key];if(v&&(v.length>1024||/[\x00-\x1f\x7f]/.test(v)))add(key,'Use at most 1024 characters without control characters.');}
 if(d.kind==='npm') {
  const m=/^npm:(.+)@([^@]+)$/.exec(d.target??'');
  if(!m) add('target','Use npm:NAME@EXACT_VERSION, including npm:@scope/name@1.2.3.');
  else { if(m[1]!.length>214||!/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(m[1]!))add('target','Use a valid public npm package name.');
   const v=m[2]!,part='(?:0|[1-9][0-9]*)';
   if(v.length>128||!new RegExp(`^${part}\\.${part}\\.${part}(?:-[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`).test(v)||v.split('+')[0]!.split('-').slice(1).join('-').split('.').some(x=>/^0[0-9]+$/.test(x)))add('target','Use a canonical exact version, without ranges, tags or aliases.');
  }
  if(d.artifact||d.sourceArchive||d.name||d.version)add('target','npm cannot use local archives or local labels.');
 } else if(!d.artifact?.size)add('artifact','Select a nonempty artifact archive.');
 if(!!d.source!==!!d.commit)add(d.source?'commit':'source','Provide the GitHub source URL and full commit together.');
 if(d.commit&&!/^[a-f0-9]{40}$/.test(d.commit))add('commit','Use the full 40 lowercase hex commit.');
 if(d.source) { const m=/^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/.exec(d.source);if(!m||[m[1],m[2]].some(x=>x==='.'||x==='..'))add('source','Use https://github.com/OWNER/REPO without credentials, query or fragment.'); }
 if(d.subdirectory&&(!d.source||!d.commit))add('subdirectory','A subtree requires a source URL/full commit pair.');
 if(d.sourceArchive&&(!d.source||!d.commit))add('sourceArchive','A source replay requires a source URL/full commit pair.');
 if(d.subdirectory&&(new TextEncoder().encode(d.subdirectory).length>1024||d.subdirectory.split('/').length>32||d.subdirectory.split('/').some(x=>!x||x==='.'||x==='..'||/[\\:\x00-\x1f\x7f]/.test(x))))add('subdirectory','Use a relative slash-separated subtree without empty, dot or parent components.');
 for(const key of ['artifact','sourceArchive'] as const) {const f=d[key];if(!f)continue;if(!f.size||f.size>32*1024*1024)add(key,'Select a nonempty archive of at most 32 MiB.');if(f.name.length>128||/[\/\\:\x00-\x1f\x7f]/.test(f.name)||f.name==='.'||f.name==='..')add(key,'Rename the selected file without separators or control characters (128 characters maximum).');}
 return errors;
}
export const errorHelp = (code: string) => /SESSION_DENIED|ORIGIN|HOST|SERVICE_UNAVAILABLE|TIMEOUT/.test(code) ? 'Restore the private launch session or check the running reader, then refresh status. Do not resubmit an uncertain start.' : /BUSY/.test(code) ? 'Wait for the current operation or job to settle, then review explicitly.' : /LIMIT|RESERVE|CAPACITY/.test(code) ? 'Use a smaller supported input or inspect workspace capacity. No files are automatically deleted.' : /NOT_FOUND|READ_FAILED|MISSING_BLOB/.test(code) ? 'The handle or retained bytes are unavailable in this process/store. Reopen the original portable file, or use the matching report/store at reader startup.' : /PORTABLE_INVALID/.test(code) ? 'Choose a valid .heurisko.json portable export, or switch to Report JSON for an original report. A standalone EvidenceBundle is not a report.' : /HASH|MANIFEST|BINDING/.test(code) ? 'The saved bytes or report binding failed verification. Choose the original unmodified export; do not edit its digests or bypass validation.' : /PORTABLE|ENCODING|SCHEMA|VALIDAT|REPORT/.test(code) ? 'Choose the original report JSON or matching portable export and its correct open method. A standalone EvidenceBundle cannot be opened as a report.' : 'Check the selected input, paired source revision and current setup. Failed operations are never retried automatically.';
