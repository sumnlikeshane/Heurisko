import { safetyProfile } from './safety.js';
import type { ProvenanceState } from '@heurisko/contracts';
import { downloadBytes, type Download } from './network.js';
import { registryDataURL, type FetchData } from './npm.js';
export interface UnverifiedProvenance {state:ProvenanceState;record:{version:'heurisko-provenance-boundary-v1';verifier:null;trustRoot:null;expectedPolicy:null;advertised:unknown;reason:string;capture?:Download['capture']};material?:Buffer}
// No caller-supplied assertion, parsed JSON, registry signature or predicate can
// become verified here. A future verifier needs admission and real subject tests.
export async function collectUnverifiedProvenance(advertised:unknown,signal?:AbortSignal,fetchData:FetchData=downloadBytes):Promise<UnverifiedProvenance> {
  let material:Buffer|undefined,capture:Download['capture']|undefined;
  let reason=advertised?'VERIFIER_UNAVAILABLE':'NO_ATTESTATION_ADVERTISED_VERIFIER_UNAVAILABLE';
  if(advertised)try {
    const url=registryDataURL((advertised as {url?:unknown}).url);
    if(!url.pathname.startsWith('/-/npm/v1/attestations/'))throw new Error('ATTESTATION_URL_REJECTED');
    const result=await fetchData(url.href,{signal,maxBytes:safetyProfile.network.metadataParseBytes,allowedHosts:['registry.npmjs.org']});
    if(new URL(result.capture.finalUrl).hostname!=='registry.npmjs.org')throw new Error('REGISTRY_REDIRECT_REJECTED');
    material=result.bytes;capture=result.capture;
  }catch(error){reason=error instanceof Error&&/^[A-Z_]+$/.test(error.message)?error.message:'ATTESTATION_ACQUISITION_FAILED';}
  return {state:{status:'not_checked',artifactBinding:'not_checked',evidenceIds:[],limitations:['No admitted operational verifier, trusted root or expected signer/issuer/source/builder policy. Retrieved material is unverified; no cryptographic or publish/build assertion is accepted.',reason]},record:{version:'heurisko-provenance-boundary-v1',verifier:null,trustRoot:null,expectedPolicy:null,advertised:advertised??null,reason,...(capture?{capture}:{})},...(material?{material}:{})};
}
