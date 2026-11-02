import { TextDecoder } from 'node:util';
import { canonicalJSON } from './identity.js';
import { manifestFields } from './comparison.js';

export const RELATIONSHIP_VERSION='heurisko-static-relationship-v1';
export const RELATIONSHIP_MEMBER_LIMIT=256*1024;
export function strictText(bytes:Buffer):string|undefined {
  if(bytes.length>RELATIONSHIP_MEMBER_LIMIT||bytes.includes(0))return undefined;
  try {const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);return text.startsWith('\ufeff')?undefined:text;}catch{return undefined;}
}
// These are bounded byte/value relationships, never semantic equivalence or
// generation/reproduction claims. Every original byte delta remains retained.
export function byteRelationship(source:Buffer,artifact:Buffer):'crlf-only'|'strict-json-formatting'|undefined {
  const s=strictText(source),a=strictText(artifact);if(s===undefined||a===undefined||s===a)return undefined;
  if(s.replace(/\r\n/g,'\n')===a.replace(/\r\n/g,'\n'))return 'crlf-only';
  try {
    const sv=manifestFields(source).get('')!.value,av=manifestFields(artifact).get('')!.value;
    canonicalJSON(sv);canonicalJSON(av);
    // Object order can matter to a configuration consumer (notably exports).
    // Do not explain reordered parsed properties as formatting.
    if(JSON.stringify(sv)===JSON.stringify(av))return 'strict-json-formatting';
  }catch { /* Unsupported/ambiguous JSON remains a raw residual. */ }
  return undefined;
}

export function sourceMapData(bytes:Buffer):{sources:string[];sourcesContent:string[]}|undefined {
  if(strictText(bytes)===undefined)return undefined;
  try {
    const value=manifestFields(bytes).get('')!.value as Record<string,unknown>;
    if(value.version!==3||!Array.isArray(value.sources)||!Array.isArray(value.sourcesContent)||value.sources.length===0||value.sources.length>128||value.sources.length!==value.sourcesContent.length)return undefined;
    if(!value.sources.every(s=>typeof s==='string')||!value.sourcesContent.every(s=>typeof s==='string'&&Buffer.from(s).toString('utf8')===s))return undefined;
    return {sources:value.sources as string[],sourcesContent:value.sourcesContent as string[]};
  }catch{return undefined;}
}
export function localMapReference(bytes:Buffer):string|undefined {
  const text=strictText(bytes);if(text===undefined)return undefined;
  // Only a final, local basename is admitted. No URLs, data URLs, traversal,
  // sourceRoot resolution, evaluation, external reads or sourcemap execution.
  return /(?:^|\n)\/\/# sourceMappingURL=([A-Za-z0-9_-][A-Za-z0-9_.-]*\.map)[\t ]*(?:\r?\n)?$/.exec(text)?.[1];
}
