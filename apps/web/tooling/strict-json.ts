// Transport-only decoder: reject duplicate keys and unsafe numbers before JSON.parse
// can erase them. G0 reports still go through the unchanged Python validator.
export function transportJSON(bytes:Buffer,maxBytes=2*1024*1024):unknown {
 if(bytes.length>maxBytes)throw Error('MANIFEST_SIZE_LIMIT');
 const text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);let i=0,nodes=0;
 const fail=():never=>{throw Error('MANIFEST_JSON_INVALID');};
 const ws=()=>{while(i<text.length&&/[\t\r\n ]/.test(text[i]!))i++;};
 const string=():string=>{
  if(text[i++]!=='"')return fail();const start=i-1;
  while(i<text.length){const c=text[i++];if(c==='\\'){i++;continue;}if(c==='"')return JSON.parse(text.slice(start,i)) as string;}
  return fail();
 };
 const value=(depth:number):unknown=>{
  if(depth>16||++nodes>100000)return fail();ws();const c=text[i];
  if(c==='{'){
   i++;ws();const result:Record<string,unknown>=Object.create(null),seen=new Set<string>();
   if(text[i]==='}'){i++;return result;}
   for(;;){ws();const key=string();if(seen.has(key))return fail();seen.add(key);ws();if(text[i++]!==':')return fail();result[key]=value(depth+1);ws();const next=text[i++];if(next==='}')return result;if(next!==',')return fail();}
  }
  if(c==='['){i++;ws();const result:unknown[]=[];if(text[i]===']'){i++;return result;}for(;;){if(result.length>=20000)return fail();result.push(value(depth+1));ws();const next=text[i++];if(next===']')return result;if(next!==',')return fail();}}
  if(c==='"')return string();
  const token=/^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/.exec(text.slice(i));if(!token)return fail();i+=token[0].length;
  const decoded:unknown=JSON.parse(token[0]);if(typeof decoded==='number'&&!Number.isSafeInteger(decoded))return fail();return decoded;
 };
 const result=value(0);ws();if(i!==text.length)return fail();return result;
}
