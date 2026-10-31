// Explicit offline replay of retained public transport observations. No network.
import * as fs from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {EvidenceStore,DownloadError,sha256} from '../packages/core/dist/index.js';
export async function retainedS3Fetch(base,caseId) {
  base=resolve(base);const store=new EvidenceStore(join(base,'store'));
  const r=JSON.parse(await fs.readFile(join(base,caseId+'.report.json'),'utf8'));
  const records=new Map(),failures=new Map();
  const read=async e=>JSON.parse(await store.get(e.contentRef));
  async function add(capture) {
    const bytes=await store.get(capture.sha256);
    if(sha256(bytes)!==capture.sha256)throw Error('REPLAY_HASH_MISMATCH');
    records.set(capture.requestedUrl,{bytes,capture});
  }
  for(const e of r.bundle.evidence) {
    if(e.locator.metadataKey==='npm-acquisition') {const d=await read(e);await add(d.metadataCapture);await add(d.artifactCapture);}
    else if(e.locator.metadataKey==='source-capture-observation'||e.locator.metadataKey==='provenance-capture-observation'||/^source-claim-\d+-observation-\d+$/.test(e.locator.metadataKey??'')) {
      const capture=await read(e);if(capture.sha256)await add(capture);
    } else if(/^source-claim-\d+-failure-observation$/.test(e.locator.metadataKey??'')) {
      const d=await read(e);failures.set(d.requestedUrl,d);
    }
  }
  return async(url,options={})=>{
    if(options.signal?.aborted)throw new DownloadError('CANCELLED');
    if(records.has(url)){const d=records.get(url);return {bytes:Buffer.from(d.bytes),capture:structuredClone(d.capture)};}
    if(failures.has(url))throw new DownloadError('HTTP_STATUS_REJECTED',structuredClone(failures.get(url)));
    throw new DownloadError('REPLAY_URL_NOT_RETAINED');
  };
}
