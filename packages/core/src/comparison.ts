import {manifestFields,textOrNull} from './json-values.js';
export {manifestFields,textOrNull} from './json-values.js';
import type { EvidenceBundle, EvidenceRecord, EvidenceId, FileChange } from '@heurisko/contracts';
import type { ArchiveInventory, ArchiveMember } from './archive.js';
import { EvidenceStore } from './storage.js';
import { canonicalId, canonicalJSON, evidenceId, sha256, sourceIdentity } from './identity.js';
import { byteRelationship, localMapReference, sourceMapData, RELATIONSHIP_MEMBER_LIMIT, RELATIONSHIP_VERSION } from './relationships.js';

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
export async function rawCompare(bundle:EvidenceBundle,store:EvidenceStore,artifact:LogicalMember[],source:LogicalMember[],scopeComplete:boolean,absenceLimitation='Missing member cannot establish absence in an incomplete inventory.',signal?:AbortSignal):Promise<void> {
  // Compare emits many small immutable records. Buffer at most 1 MiB between
  // locked, exactly charged batches instead of traversing the entire store per
  // delta. Pending prefix records are flushed even when comparison fails.
  const owner=store,pending=new Map<string,Buffer>();let pendingBytes=0,flushFailed=false;
  const flush=async()=>{
    if(!pending.size)return;
    try{await owner.putBatch(pendingBytes,async put=>{for(const bytes of pending.values())await put(bytes);});}
    catch(error){flushFailed=true;throw error;}
    pending.clear();pendingBytes=0;
  };
  store=new EvidenceStore(owner.root,owner.limits);
  store.put=async value=>{
    const bytes=Buffer.from(value),ref=sha256(bytes);if(pending.has(ref))return ref;
    if(pendingBytes+bytes.length>1024*1024)await flush();
    if(bytes.length>1024*1024)return owner.put(bytes);
    pending.set(ref,bytes);pendingBytes+=bytes.length;return ref;
  };
  store.get=async(ref,limit=128*1024*1024)=>{const bytes=pending.get(ref);if(!bytes)return owner.get(ref,limit);if(bytes.length>limit)throw Error('FILE_LIMIT_OR_TYPE');return Buffer.from(bytes);};
  try {
  const am=new Map(artifact.map(m=>[m.relativePath,m])),sm=new Map(source.map(m=>[m.relativePath,m]));
  const unsupportedManifest=(a:LogicalMember|undefined,s:LogicalMember|undefined,reason:string)=>{
    bundle.coverage.complete=false;bundle.coverage.limitations.push(reason+'; full manifest bytes and raw delta retained.');
    for(const [side,m]of [['artifact',a],['source',s]] as const)if(m){bundle.coverage.unsupportedBytes+=m.member.size;bundle.coverage.analyzedBytes-=m.member.size;bundle.coverage.omissions.push({side,path:m.member.path,kind:'unsupported',stage:'compare',reason,bytes:m.member.size,evidenceIds:[m.evidenceId]});}
  };
  for(const path of [...new Set([...am.keys(),...sm.keys()])].sort()) {
    if(signal?.aborted){bundle.coverage.complete=false;bundle.coverage.limitations.push('Comparison cancelled; remaining retained paths are unassessed.');break;}
    const a=am.get(path),s=sm.get(path);const equal=!!a&&!!s&&a.member.sha256===s.member.sha256;
    const status=equal?'identical':a&&s?'modified':scopeComplete?a?'added':'removed':'unresolved';
    const ids=[...(a?[a.evidenceId]:[]),...(s?[s.evidenceId]:[])];
    const change:FileChange={changeId:canonicalId('chg_',{artifact:bundle.artifact.observedSha256,source:bundle.sourceCandidates.map(sourceIdentity),path}),status,rawEquality:equal?'equal':a&&s?'different':scopeComplete?'different':'unknown',explanationStrength:equal?'exact':'unexplained',evidenceIds:ids,notes:!scopeComplete&&(!a||!s)?[absenceLimitation]:[]};
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
      if(a&&s&&ab.length<=RELATIONSHIP_MEMBER_LIMIT&&sb.length<=RELATIONSHIP_MEMBER_LIMIT) {
        const rule=byteRelationship(sb,ab);
        if(rule) {
          const relation=await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'both',locator:{path,metadataKey:'static-relationship'},observationMethod:RELATIONSHIP_VERSION,limitations:['Full raw residual retained. This byte/value relationship establishes neither program equivalence nor build reproduction.']},{version:RELATIONSHIP_VERSION,rule,sourceEvidenceId:s.evidenceId,artifactEvidenceId:a.evidenceId,sourceRef:s.member.contentRef,artifactRef:a.member.contentRef});
          change.evidenceIds.push(relation.evidenceId);
        }
      }
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
  // A retained source-map reference plus exact embedded source text is a clue
  // with mechanically checked cross-side support, not proof of emitted code.
  // Bound scanning/counts; do not fetch map paths or run build/configuration code.
  let inspected=0,total=0,relations=0;
  for(const a of artifact) {
    if(signal?.aborted)break;
    if(inspected++>=128||relations>=32)break;
    if(a.member.size>RELATIONSHIP_MEMBER_LIMIT||total+a.member.size>1024*1024)continue;
    const output=await store.get(a.member.contentRef!);total+=output.length;
    const name=localMapReference(output);if(!name)continue;
    const mapPath=a.relativePath.slice(0,a.relativePath.lastIndexOf('/')+1)+name;
    const map=am.get(mapPath);if(!map||map.member.size>RELATIONSHIP_MEMBER_LIMIT||total+map.member.size>1024*1024)continue;
    const bytes=await store.get(map.member.contentRef!);total+=bytes.length;
    const data=sourceMapData(bytes);if(!data)continue;
    const matches=[];
    for(let i=0;i<data.sourcesContent.length;i++) {
      const content=data.sourcesContent[i]!;if(Buffer.byteLength(content)>RELATIONSHIP_MEMBER_LIMIT)continue;
      const digest=sha256(content),candidates=source.filter(s=>s.member.sha256===digest);
      if(candidates.length===1)matches.push({index:i,sourceEvidenceId:candidates[0]!.evidenceId,sourceRef:digest});
    }
    if(!matches.length)continue;
    const change=bundle.changes.find(c=>c.artifactPath===a.member.path&&c.status!=='identical');if(!change)continue;
    const relation=await retainJSONEvidence(bundle,store,{kind:'analysis_note',side:'both',locator:{path:a.relativePath,metadataKey:'static-relationship'},observationMethod:RELATIONSHIP_VERSION,limitations:['Only the local final reference and matching embedded source text are checked; mappings/emitted behavior/build recipe are unverified. All raw residuals remain visible.']},{version:RELATIONSHIP_VERSION,rule:'sourcemap-retained-source',artifactEvidenceId:a.evidenceId,artifactRef:a.member.contentRef,mapEvidenceId:map.evidenceId,mapRef:map.member.contentRef,matches,totalSources:data.sources.length});
    change.evidenceIds.push(relation.evidenceId,map.evidenceId,...matches.map(m=>m.sourceEvidenceId));
    change.evidenceIds=[...new Set(change.evidenceIds)];relations++;
  }
  bundle.coverage.limitations.push('Static relationship scope: at most 128 artifact members, 1 MiB candidate reads, 32 source-map relationships and 256 KiB per member. Unsupported/unexamined transformations remain raw residuals; byte inventory coverage is not explanation coverage.');
  bundle.coverage.comparedFiles=bundle.changes.length;
  } finally { if(!flushFailed)await flush(); }
}
