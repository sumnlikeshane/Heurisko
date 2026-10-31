import { TextDecoder } from 'node:util';
import type { EvidenceBundle, EvidenceRecord, EvidenceId, FileChange } from '@heurisko/contracts';
import type { ArchiveInventory, ArchiveMember } from './archive.js';
import { EvidenceStore } from './storage.js';
import { canonicalId, canonicalJSON, evidenceId, sha256, sourceIdentity } from './identity.js';

export const textOrNull=(bytes:Uint8Array):string|null=>{try {if(bytes.includes(0))return null;return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{return null;}};
export function terminalText(value:string):string {
  return value.replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060-\u206f\ufeff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
}
export interface LogicalMember { member:ArchiveMember; relativePath:string; evidenceId:EvidenceId }
export async function retainEvidence(bundle:EvidenceBundle,store:EvidenceStore,record:Omit<EvidenceRecord,'evidenceId'|'contentState'|'contentRef'|'contentSha256'>,bytes:Uint8Array):Promise<EvidenceRecord> {
  const ref=await store.put(bytes);
  const e:EvidenceRecord={...record,contentSha256:ref,contentRef:ref,contentState:'retained',evidenceId:'' as EvidenceId};e.evidenceId=evidenceId(bundle,e);
  const prior=bundle.evidence.find(x=>x.evidenceId===e.evidenceId);
  if(prior && canonicalJSON(prior)!==canonicalJSON(e))throw new Error('EVIDENCE_ID_COLLISION');
  if(!prior)bundle.evidence.push(e);return e;
}
export async function retainJSONEvidence(bundle:EvidenceBundle,store:EvidenceStore,record:Parameters<typeof retainEvidence>[2],value:unknown) {
  return retainEvidence(bundle,store,record,Buffer.from(JSON.stringify(value)));
}
export async function memberEvidence(bundle:EvidenceBundle,store:EvidenceStore,inventory:ArchiveInventory,side:'artifact'|'source',prefix:string):Promise<LogicalMember[]> {
  const result:LogicalMember[]=[];
  for(const member of inventory.members) if(member.type==='file') {
    const bytes=await store.get(member.contentRef!);
    const e=await retainEvidence(bundle,store,{kind:side==='artifact'?'artifact_member':'source_member',side,locator:{path:member.path,startByte:0,endByte:member.size},observationMethod:'raw-member-sha256-v1',limitations:[]},bytes);
    const relativePath=prefix && member.path.startsWith(prefix+'/')?member.path.slice(prefix.length+1):!prefix?member.path:null;
    if(relativePath!==null)result.push({member,relativePath,evidenceId:e.evidenceId});
  }
  return result;
}
// Strict bounded JSON scanner keeps exact value byte spans and rejects duplicate
// keys. It never loads package configuration as code. Deltas are observations.
export function manifestFields(bytes:Buffer):Map<string,{value:unknown;startByte:number;endByte:number}> {
  if(bytes.length>256*1024)throw new Error('MANIFEST_SIZE_LIMIT');
  const text=textOrNull(bytes);if(text===null)throw new Error('MANIFEST_ENCODING');
  let i=0;const fields=new Map<string,{value:unknown;startByte:number;endByte:number}>();
  const ws=()=>{while(/[\t\r\n ]/.test(text[i]??'!'))i++;};
  const string=():string=>{const start=i++;while(i<text.length){if(text[i]==='\\'){i+=2;continue;}if(text[i++]==='"')return JSON.parse(text.slice(start,i));}throw new Error('MANIFEST_JSON');};
  const value=(path:string,depth:number):void=>{
    if(depth>32 || fields.size>=2048)throw new Error('MANIFEST_STRUCTURE_LIMIT');
    ws();const start=i;
    if(text[i]==='{') {i++;ws();const seen=new Set<string>();if(text[i]!=='}')for(;;){ws();if(text[i]!=='"')throw new Error('MANIFEST_JSON');const key=string();if(seen.has(key))throw new Error('MANIFEST_DUPLICATE_KEY');seen.add(key);ws();if(text[i++]!==':')throw new Error('MANIFEST_JSON');value(path+'/'+key.replace(/~/g,'~0').replace(/\//g,'~1'),depth+1);ws();if(text[i]!==',')break;i++;}if(text[i++]!=='}')throw new Error('MANIFEST_JSON');}
    else if(text[i]==='['){i++;ws();let n=0;if(text[i]!==']')for(;;){value(path+'/'+n++,depth+1);ws();if(text[i]!==',')break;i++;}if(text[i++]!==']')throw new Error('MANIFEST_JSON');}
    else if(text[i]==='"')string();
    else {const m=/^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(text.slice(i));if(!m)throw new Error('MANIFEST_JSON');i+=m[0].length;}
    if(i>text.length)throw new Error('MANIFEST_JSON');
    fields.set(path,{value:JSON.parse(text.slice(start,i)),startByte:Buffer.byteLength(text.slice(0,start)),endByte:Buffer.byteLength(text.slice(0,i))});
  };
  value('',0);ws();if(i!==text.length || !text.startsWith('{',text.search(/\S/)))throw new Error('MANIFEST_JSON');return fields;
}
export async function rawCompare(bundle:EvidenceBundle,store:EvidenceStore,artifact:LogicalMember[],source:LogicalMember[],scopeComplete:boolean):Promise<void> {
  const am=new Map(artifact.map(m=>[m.relativePath,m])),sm=new Map(source.map(m=>[m.relativePath,m]));
  const unsupportedManifest=(a:LogicalMember|undefined,s:LogicalMember|undefined,reason:string)=>{
    bundle.coverage.complete=false;bundle.coverage.limitations.push(reason+'; full manifest bytes and raw delta retained.');
    for(const [side,m]of [['artifact',a],['source',s]] as const)if(m){bundle.coverage.unsupportedBytes+=m.member.size;bundle.coverage.analyzedBytes-=m.member.size;bundle.coverage.omissions.push({side,path:m.member.path,kind:'unsupported',stage:'compare',reason,bytes:m.member.size,evidenceIds:[m.evidenceId]});}
  };
  for(const path of [...new Set([...am.keys(),...sm.keys()])].sort()) {
    const a=am.get(path),s=sm.get(path);const equal=!!a&&!!s&&a.member.sha256===s.member.sha256;
    const status=equal?'identical':a&&s?'modified':scopeComplete?a?'added':'removed':'unresolved';
    const ids=[...(a?[a.evidenceId]:[]),...(s?[s.evidenceId]:[])];
    const change:FileChange={changeId:canonicalId('chg_',{artifact:bundle.artifact.observedSha256,source:bundle.sourceCandidates.map(sourceIdentity),path}),status,rawEquality:equal?'equal':a&&s?'different':scopeComplete?'different':'unknown',explanationStrength:equal?'exact':'unexplained',evidenceIds:ids,notes:scopeComplete?[]:['Missing member cannot establish absence in an incomplete inventory.']};
    if(a)change.artifactPath=a.member.path;if(s)change.sourcePath=s.member.path;
    if(a&&s) {
      const metadata=(m:LogicalMember)=>({mode:m.member.mode,uid:m.member.uid,gid:m.member.gid,mtime:m.member.mtime,pax:m.member.pax});
      const from=metadata(s),to=metadata(a);
      if(canonicalJSON(from)!==canonicalJSON(to)) {
        const delta=await retainJSONEvidence(bundle,store,{kind:'raw_diff',side:'both',locator:{path,metadataKey:'archive-member-metadata'},observationMethod:'raw-tar-member-metadata-v1',limitations:['Metadata difference is an observation; risk interpretation is unavailable.']},{version:'heurisko-member-metadata-delta-v1',source:{path:s.member.path,...from},artifact:{path:a.member.path,...to}});
        change.evidenceIds.push(delta.evidenceId);change.notes.push('Archive metadata differs; inspect the retained metadata delta. rawEquality describes content bytes only.');
      }
    }
    if(!equal) {
      const ab=a?await store.get(a.member.contentRef!):Buffer.alloc(0),sb=s?await store.get(s.member.contentRef!):Buffer.alloc(0);
      let start=0;while(start<Math.min(ab.length,sb.length)&&ab[start]===sb[start])start++;
      let suffix=0;while(suffix<Math.min(ab.length,sb.length)-start&&ab[ab.length-1-suffix]===sb[sb.length-1-suffix])suffix++;
      const side=(bytes:Buffer,m:LogicalMember|undefined)=>({path:m?.member.path??null,contentRef:m?.member.contentRef??null,size:bytes.length,changedSpan:{startByte:start,endByte:bytes.length-suffix},excerptBase64:bytes.subarray(start,Math.min(bytes.length-suffix,start+2048)).toString('base64'),excerptTruncated:bytes.length-suffix-start>2048});
      const e=await retainJSONEvidence(bundle,store,{kind:'raw_diff',side:'both',locator:{path,metadataKey:'raw-byte-delta'},observationMethod:'common-prefix-suffix-byte-span-v1',limitations:['One enclosing changed byte span, not semantic equivalence; full member bytes retained.']},{version:'heurisko-raw-diff-v1',kind:textOrNull(ab)!==null&&textOrNull(sb)!==null?'utf8':'binary',source:side(sb,s),artifact:side(ab,a),absenceEstablished:scopeComplete});
      change.evidenceIds.push(e.evidenceId);
      if(path==='package.json') {
        try {
          const af:ReturnType<typeof manifestFields>=a?manifestFields(ab):new Map(),sf:ReturnType<typeof manifestFields>=s?manifestFields(sb):new Map();let count=0;
          for(const key of [...new Set([...af.keys(),...sf.keys()])].sort()) {
            if(key==='' || JSON.stringify(af.get(key)?.value)===JSON.stringify(sf.get(key)?.value))continue;
            if(count++>=128){change.notes.push('Manifest field delta limit 128 reached; full bytes and raw delta retained.');unsupportedManifest(a,s,'MANIFEST_FIELD_DELTA_LIMIT');break;}
            // G0/Malhar use dotted simple manifest keys. The retained record
            // always carries the exact RFC 6901 pointer, including ambiguous keys.
            const segments=key.slice(1).split('/').map(s=>s.replace(/~1/g,'/').replace(/~0/g,'~'));
            const metadataKey=segments.every(s=>/^[A-Za-z_$][A-Za-z0-9_$-]*$/.test(s))?segments.join('.'):key;
            const delta=await retainJSONEvidence(bundle,store,{kind:'manifest_delta',side:'both',locator:{path,metadataKey},observationMethod:'strict-json-value-byte-spans-v1',limitations:[]},{version:'heurisko-manifest-delta-v1',pointer:key,source:sf.get(key)??null,artifact:af.get(key)??null,sourceContentRef:s?.member.contentRef??null,artifactContentRef:a?.member.contentRef??null});
            change.evidenceIds.push(delta.evidenceId);
          }
        } catch(error) {
          if(!(error instanceof Error) || !/^MANIFEST_[A-Z_]+$/.test(error.message))throw error;
          change.notes.push(error.message);unsupportedManifest(a,s,error.message);
        }
      }
    }
    bundle.changes.push(change);
  }
  bundle.coverage.comparedFiles=bundle.changes.length;
}
