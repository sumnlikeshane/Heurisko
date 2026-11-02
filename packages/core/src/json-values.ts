import { TextDecoder } from 'node:util';
export const textOrNull=(bytes:Uint8Array):string|null=>{try {if(bytes.includes(0))return null;return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{return null;}};

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
