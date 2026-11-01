import { createHash, timingSafeEqual } from 'node:crypto';
import type { IntegrityCheck } from '@heurisko/contracts';
import { downloadBytes, allowedURL, type Download } from './network.js';
import { manifestFields } from './comparison.js';
import { safetyProfile } from './safety.js';
import { EvidenceStore } from './storage.js';

export type FetchData = typeof downloadBytes;
export const publicRegistry='https://registry.npmjs.org';
export function npmCoordinates(name:string,version:string):string {
  if(/[\x00-\x20\x7f]/.test(name)||name.length>214 || !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name))throw new Error('NPM_NAME_REJECTED');
  const part='(?:0|[1-9][0-9]*)';
  if(/[\x00-\x20\x7f]/.test(version)||version.length>128 || !new RegExp(`^${part}\\.${part}\\.${part}(?:-[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?(?:\\+[0-9A-Za-z-]+(?:\\.[0-9A-Za-z-]+)*)?$`).test(version))throw new Error('NPM_EXACT_VERSION_REQUIRED');
  if(version.split('+')[0]!.split('-').slice(1).join('-').split('.').some(x=>/^0[0-9]+$/.test(x)))throw new Error('NPM_EXACT_VERSION_REQUIRED');
  return `${publicRegistry}/${encodeURIComponent(name)}/${encodeURIComponent(version)}`;
}
export function metadataJSON(bytes:Buffer):Record<string,any> {
  // The existing strict scanner rejects duplicate keys/encoding/deep or oversized
  // JSON before ordinary data decoding. No target configuration is imported.
  manifestFields(bytes);return JSON.parse(bytes.toString('utf8'));
}
export function registryDataURL(value:unknown):URL {
  if(typeof value!=='string')throw new Error('REGISTRY_URL_REJECTED');
  const url=allowedURL(value);
  if(url.hostname!=='registry.npmjs.org'||url.search)throw new Error('REGISTRY_URL_REJECTED');
  return url;
}
export interface IntegrityReceipt {version:'heurisko-npm-integrity-v1';advertised:unknown;observed:{sha256:string;sha512:string};check:IntegrityCheck;limitation?:string}
export function npmIntegrity(bytes:Buffer,advertised:unknown):IntegrityReceipt {
  const observed={sha256:createHash('sha256').update(bytes).digest('hex'),sha512:createHash('sha512').update(bytes).digest('hex')};
  const unavailable=(limitation:string):IntegrityReceipt=>({version:'heurisko-npm-integrity-v1',advertised:advertised??null,observed,check:{algorithm:'none',status:'not_available'},limitation});
  if(typeof advertised!=='string'||!advertised.trim())return unavailable('No supported advertised SRI; legacy SHA-1 is retained in metadata but not accepted.');
  const tokens=advertised.trim().split(/\s+/);
  // Strict subset of SRI: supported SHA-512/SHA-256 with canonical padded base64;
  // malformed/unknown stronger tokens never silently fall back to a weaker hash.
  if(tokens.length>16)return unavailable('SRI token limit exceeded.');
  const parsed=tokens.map(t=>/^(sha512|sha256)-([A-Za-z0-9+/]+={0,2})$/.exec(t));
  if(parsed.some(p=>!p))return unavailable('Unsupported or malformed SRI token; no downgrade.');
  for(const p of parsed){const b=Buffer.from(p![2]!,'base64');if(b.toString('base64')!==p![2]||b.length!==(p![1]==='sha512'?64:32))return unavailable('Noncanonical SRI digest.');}
  const algorithm=tokens.some(t=>t.startsWith('sha512-'))?'sha512':'sha256';
  const expected=parsed.filter(p=>p![1]===algorithm).map(p=>p![2]!);
  const actual=Buffer.from(observed[algorithm],'hex');
  const matched=expected.some(e=>timingSafeEqual(actual,Buffer.from(e,'base64')));
  return {version:'heurisko-npm-integrity-v1',advertised,observed,check:{algorithm,expectedValue:expected.join(' '),status:matched?'matched':'mismatched'}};
}
export interface NpmAcquisition {metadata:Record<string,any>;metadataDownload:Download;artifactDownload:Download;filename:string;tarballURL:string;integrity:IntegrityReceipt}
export async function acquireNpm(name:string,version:string,store:EvidenceStore,signal?:AbortSignal,fetchData:FetchData=downloadBytes):Promise<NpmAcquisition> {
  const url=npmCoordinates(name,version);
  // Save failures by digest even when no artifact exists to support a report.
  let metadataDownload:Download|undefined;
  try {
    metadataDownload=await fetchData(url,{signal,maxBytes:safetyProfile.network.metadataParseBytes,allowedHosts:['registry.npmjs.org']});await store.put(metadataDownload.bytes);
    const metadata=metadataJSON(metadataDownload.bytes);
    if(metadata.name!==name||metadata.version!==version)throw new Error('NPM_METADATA_SUBJECT_MISMATCH');
    const tarballURL=registryDataURL(metadata.dist?.tarball).href;
    const filename=decodeURIComponent(new URL(tarballURL).pathname.split('/').at(-1)!);
    if(!/^[A-Za-z0-9_.-]+\.tgz$/.test(filename)||filename.length>255)throw new Error('NPM_FILENAME_REJECTED');
    const artifactDownload=await fetchData(tarballURL,{signal,allowedHosts:['registry.npmjs.org']});await store.put(artifactDownload.bytes);
    if(new URL(artifactDownload.capture.finalUrl).hostname!=='registry.npmjs.org')throw new Error('REGISTRY_REDIRECT_REJECTED');
    return {metadata,metadataDownload,artifactDownload,filename,tarballURL,integrity:npmIntegrity(artifactDownload.bytes,metadata.dist?.integrity)};
  } catch(error) {
    const code=error instanceof Error&&/^[A-Z_]+$/.test(error.message)?error.message:'NPM_ACQUISITION_FAILED';
    const receipt=await store.putJSON({version:'heurisko-npm-acquisition-failure-v1',url,code,metadataRef:metadataDownload?.capture.sha256??null,captureTime:new Date().toISOString()});
    throw new Error(code,{cause:{retainedFailureRef:receipt}});
  }
}
