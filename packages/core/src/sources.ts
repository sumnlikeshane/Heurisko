import { safetyProfile } from './safety.js';
import type { SourceCandidate, SourceOverride } from '@heurisko/contracts';
import { pinnedSourceURL, downloadBytes, type Download, DownloadError } from './network.js';
import { metadataJSON, type FetchData } from './npm.js';
import { orderCandidates } from './identity.js';

export function safeSubdirectory(path:string):string {
  if(path==='')return '';
  if(Buffer.byteLength(path)>1024||path.split('/').length>32||path.split('/').some(x=>!x||x==='.'||x==='..'||/[\\:\x00-\x1f\x7f]/.test(x)))throw new Error('SOURCE_SUBDIRECTORY_REJECTED');
  return path;
}
export function githubRepository(value:unknown):{repo:string;subdirectory:string} {
  const object=typeof value==='object'&&value!==null?value as Record<string,unknown>:undefined;
  const supplied=object?object.url:value;
  if(typeof supplied!=='string')throw new Error('SOURCE_REPOSITORY_MISSING');
  let url:string=supplied;
  if(/[\x00-\x20\x7f]/.test(url))throw new Error('SOURCE_REPOSITORY_REJECTED');
  if(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(url))url='https://github.com/'+url;
  url=url.replace(/^git\+https:\/\//,'https://').replace(/^git\+ssh:\/\/git@github\.com\//,'https://github.com/').replace(/^git:\/\/github\.com\//,'https://github.com/').replace(/^git@github\.com:/,'https://github.com/');
  const m=/^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/.exec(url as string);
  if(!m)throw new Error('SOURCE_REPOSITORY_REJECTED');
  const repo=`https://github.com/${m[1]}/${m[2]}`;pinnedSourceURL(repo,'0'.repeat(40));
  if(object?.directory!==undefined&&typeof object.directory!=='string')throw new Error('SOURCE_SUBDIRECTORY_REJECTED');
  return {repo,subdirectory:safeSubdirectory(object?.directory as string??'')};
}
export interface SourceClaim {kind:'registry'|'artifact-manifest'|'user-override'|'version-tag';repositoryUrl?:string;commit?:string;subdirectory?:string;tag?:string;failure?:string;captures?:Download[];failedCapture?:unknown;raw?:unknown}
export interface SourceResolution {version:'heurisko-source-resolution-v1';candidates:SourceCandidate[];claims:SourceClaim[];selected?:SourceOverride;limitations:string[];ambiguous:boolean}
const code=(e:unknown)=>e instanceof Error&&/^[A-Z_]+$/.test(e.message)?e.message:'SOURCE_CLAIM_FAILED';
export async function resolveSources(metadata:Record<string,any>|undefined,manifest:Record<string,any>|undefined,override:SourceOverride|undefined,version:string|undefined,signal?:AbortSignal,fetchData:FetchData=downloadBytes):Promise<SourceResolution> {
  const claims:SourceClaim[]=[];const limitations:string[]=[];
  if(override){pinnedSourceURL(override.repo,override.commit);safeSubdirectory(override.subdirectory??'');claims.push({kind:'user-override',repositoryUrl:githubRepository(override.repo).repo,commit:override.commit,subdirectory:override.subdirectory??''});}
  for(const [kind,m]of [['registry',metadata],['artifact-manifest',manifest]] as const)if(m) {
    const claim:SourceClaim={kind,raw:{repository:m.repository??null,gitHead:m.gitHead??null,name:m.name??null,version:m.version??null}};
    try {const r=githubRepository(m.repository);Object.assign(claim,{repositoryUrl:r.repo,...(typeof m.repository==='object'&&m.repository?.directory!==undefined?{subdirectory:r.subdirectory}:{})});
      if(typeof m.gitHead==='string'&&/^[a-f0-9]{40}$/.test(m.gitHead))claim.commit=m.gitHead;
      else if(m.gitHead!==undefined)claim.failure='SOURCE_FULL_COMMIT_REQUIRED';
    }catch(e){claim.failure=code(e);}claims.push(claim);
  }
  // Absent directory metadata is not an explicit repository-root claim. Carry
  // an explicit same-repository package directory from manifest/user context.
  for(const c of claims)if(c.repositoryUrl&&c.subdirectory===undefined)c.subdirectory=claims.find(x=>x.repositoryUrl===c.repositoryUrl&&x.subdirectory!==undefined)?.subdirectory??'';
  // Local inputs never initiate metadata/tag discovery. npm tag observations are
  // captured separately and pinned before archive access, with bounded peeling.
  if(metadata&&version) {
    const repositories=[...new Set(claims.filter(c=>c.repositoryUrl).map(c=>c.repositoryUrl!))].slice(0,safetyProfile.source.tagRepositories);
    let tagRateLimited=false;
    for(const repo of repositories)for(const tag of safetyProfile.source.tagPrefixes.map(prefix=>prefix+version)) {
      if(signal?.aborted){limitations.push('SOURCE_TAG_DISCOVERY_CANCELLED');break;}
      const claim:SourceClaim={kind:'version-tag',repositoryUrl:repo,tag,captures:[],subdirectory:claims.find(c=>c.repositoryUrl===repo&&c.kind==='registry')?.subdirectory??''};
      if(tagRateLimited){claim.failure='SOURCE_TAG_DISCOVERY_SKIPPED_RATE_LIMIT';claims.push(claim);continue;}
      try {
        const slug=repo.slice('https://github.com/'.length);
        let result=await fetchData(`https://api.github.com/repos/${slug}/git/ref/tags/${encodeURIComponent(tag)}`,{signal,maxBytes:safetyProfile.network.metadataParseBytes,allowedHosts:['api.github.com']});claim.captures!.push(result);
        let object=metadataJSON(result.bytes).object;
        const seen=new Set<string>();
        for(let depth=0;object?.type==='tag'&&depth<safetyProfile.source.tagPeelLimit;depth++) {
          if(!/^[a-f0-9]{40}$/.test(object.sha)||seen.has(object.sha))throw new Error('SOURCE_TAG_OBJECT_REJECTED');seen.add(object.sha);
          result=await fetchData(`https://api.github.com/repos/${slug}/git/tags/${object.sha}`,{signal,maxBytes:safetyProfile.network.metadataParseBytes,allowedHosts:['api.github.com']});claim.captures!.push(result);object=metadataJSON(result.bytes).object;
        }
        if(object?.type!=='commit'||!/^[a-f0-9]{40}$/.test(object.sha))throw new Error('SOURCE_TAG_COMMIT_UNRESOLVED');claim.commit=object.sha;
      }catch(e){claim.failure=code(e);if(e instanceof DownloadError&&e.responseCapture){claim.failedCapture=e.responseCapture;const response=e.responseCapture.hops.at(-1);if(response?.status===404)claim.failure='SOURCE_TAG_NOT_FOUND';if(response?.status===429||(response?.status===403&&response.headers['x-ratelimit-remaining']==='0')){claim.failure='SOURCE_TAG_RATE_LIMITED';tagRateLimited=true;}}}claims.push(claim);
    }
  }
  const identities=new Map<string,SourceCandidate>();
  for(const c of claims)if(c.repositoryUrl) {
    if(!c.commit&&claims.some(x=>x.repositoryUrl===c.repositoryUrl&&x.commit&&(x.subdirectory??'')===(c.subdirectory??'')))continue;
    const identity={repositoryUrl:c.repositoryUrl,...(c.commit?{commit:c.commit}:{}),subdirectory:c.subdirectory??''};
    const key=JSON.stringify(identity);
    const previous=identities.get(key);
    if(!previous)identities.set(key,{...identity,association:c.kind==='user-override'?'user_supplied':c.commit?'publisher_asserted':'unavailable',evidenceIds:[],conflicts:[]});
    else if(c.kind==='user-override')previous.association='user_supplied';
  }
  const pinned=claims.filter(c=>c.repositoryUrl&&c.commit);
  const selectedClaim=claims.find(c=>c.kind==='user-override')??claims.find(c=>c.kind==='registry'&&c.commit)??pinned[0];
  const selected=selectedClaim?.repositoryUrl&&selectedClaim.commit?{repo:selectedClaim.repositoryUrl,commit:selectedClaim.commit,subdirectory:selectedClaim.subdirectory??''}:undefined;
  const ambiguous=!!selected&&claims.some(c=>c.repositoryUrl&&(c.repositoryUrl!==selected.repo||(c.commit&&c.commit!==selected.commit)||(c.kind!=='version-tag'&&(c.subdirectory??'')!==(selected.subdirectory??''))));
  const candidates=orderCandidates([...identities.values()]);
  if(ambiguous)for(const c of candidates){c.association='ambiguous';c.conflicts.push('SOURCE_CLAIMS_CONFLICT: retained repository/commit/subdirectory claims disagree.');}
  for(const c of claims)if(c.failure)limitations.push(`${c.kind}${c.tag?':'+c.tag:''}: ${c.failure}`);
  limitations.push('Metadata/gitHead/tag/manifest agreement is publisher-linked candidate evidence, not proof of artifact-to-source binding.','GitHub immutable archive URL is transport context; no Git object reconstruction, signed-tag validation, submodule or LFS acquisition.');
  return {version:'heurisko-source-resolution-v1',candidates,claims,...(selected?{selected}:{}),limitations,ambiguous};
}
