import { request } from 'node:https';
import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { safetyProfile } from './safety.js';
import { sha256 } from './identity.js';

export class DownloadError extends Error { constructor(public readonly code:string,public readonly responseCapture?:{requestedUrl:string;captureTime:string;hops:DownloadCapture['hops']}) { super(code); } }
const blocked4=new BlockList();
for(const [address,prefix] of [['0.0.0.0',8],['10.0.0.0',8],['100.64.0.0',10],['127.0.0.0',8],['169.254.0.0',16],['172.16.0.0',12],['192.0.0.0',24],['192.0.2.0',24],['192.88.99.0',24],['192.168.0.0',16],['198.18.0.0',15],['198.51.100.0',24],['203.0.113.0',24],['224.0.0.0',3]] as const)blocked4.addSubnet(address,prefix,'ipv4');
const global6=new BlockList(); global6.addSubnet('2000::',3,'ipv6');
const blocked6=new BlockList(); for(const [address,prefix] of [['2001::',23],['2001:db8::',32],['2002::',16],['3fff::',20]] as const)blocked6.addSubnet(address,prefix,'ipv6');
export function publicAddress(address:string):boolean {
  if(address.includes('%'))return false;
  const family=isIP(address);
  if(family===4)return !blocked4.check(address,'ipv4');
  return family===6 && !address.includes('.') && global6.check(address,'ipv6') && !blocked6.check(address,'ipv6');
}
export function allowedURL(value:string):URL {
  let url:URL; try{url=new URL(value);}catch{throw new DownloadError('URL_REJECTED');}
  if(url.protocol!=='https:' || url.username || url.password || url.hash || (url.port && url.port!=='443') || isIP(url.hostname) || !safetyProfile.network.hosts.includes(url.hostname as never))throw new DownloadError('URL_REJECTED');
  return url;
}
export interface DownloadCapture { version:'heurisko-download-v1'; requestedUrl:string; finalUrl:string; captureTime:string; sha256:`sha256:${string}`; size:number; hops:Array<{url:string;status:number;headers:Record<string,string>}> }
export interface Download {bytes:Buffer;capture:DownloadCapture}
export async function downloadBytes(value:string,options:{signal?:AbortSignal;maxBytes?:number;allowedHosts?:readonly string[]}={}):Promise<Download> {
  if(Object.keys(process.env).some(k=>/^(https?_proxy|all_proxy)$/i.test(k) && process.env[k]))throw new DownloadError('PROXY_ENVIRONMENT_REJECTED');
  const limit=Math.min(options.maxBytes??safetyProfile.archive.compressedBytes,safetyProfile.archive.compressedBytes);
  const hops:DownloadCapture['hops']=[];
  let url=allowedURL(value);
  const scopeHost=(u:URL)=>{if(options.allowedHosts&&!options.allowedHosts.includes(u.hostname))throw new DownloadError('REDIRECT_HOST_REJECTED');};
  scopeHost(url);
  for(let redirect=0;redirect<=safetyProfile.network.redirects;redirect++) {
    const deadline=AbortSignal.timeout(safetyProfile.network.timeoutMs);
    const signal=options.signal?AbortSignal.any([options.signal,deadline]):deadline;
    if(signal.aborted)throw new DownloadError('CANCELLED');
    const addresses=await Promise.race([lookup(url.hostname,{all:true,verbatim:true}),new Promise<never>((_,reject)=>signal.addEventListener('abort',()=>reject(new DownloadError('DOWNLOAD_TIMEOUT_OR_CANCELLED')),{once:true}))]);
    if(signal.aborted || !addresses.length || addresses.some(a=>!publicAddress(a.address)))throw new DownloadError('DNS_ADDRESS_REJECTED');
    const address=addresses.find(a=>a.family===4)??addresses[0]!;
    const response=await new Promise<{bytes?:Buffer;location?:string}>((accept,reject)=>{
      let settled=false;
      const fail=(code:string)=>{if(!settled){settled=true;reject(new DownloadError(code,{requestedUrl:value,captureTime:new Date().toISOString(),hops:structuredClone(hops)}));}};
      // URL hostname remains TLS servername/Host. Lookup returns only the validated
      // address, disabling ambient proxy/agent sockets and a second DNS resolution.
      const req=request(url,{method:'GET',agent:false,signal,servername:url.hostname,headers:{'User-Agent':'Heurisko/0.1.0 static-evidence','Accept-Encoding':'identity'},maxHeaderSize:16384,
        lookup:((_hostname:unknown,lookupOptions:{all?:boolean},callback:Function)=>lookupOptions.all?callback(null,[address]):callback(null,address.address,address.family)) as never},res=>{
        const headers:Record<string,string>={};
        for(const name of ['content-type','content-length','etag','last-modified','location','content-encoding','retry-after','x-ratelimit-remaining','x-ratelimit-reset']){const v=res.headers[name]; if(typeof v==='string')headers[name]=v;}
        const status=res.statusCode??0; hops.push({url:url.href,status,headers});
        if([301,302,303,307,308].includes(status)) {
          const location=res.headers.location;res.destroy();
          if(!location)return fail('REDIRECT_LOCATION_MISSING');
          settled=true;accept({location});return;
        }
        if(status!==200){res.destroy();return fail('HTTP_STATUS_REJECTED');}
        if(res.headers['content-encoding'] && res.headers['content-encoding']!=='identity'){res.destroy();return fail('HTTP_ENCODING_REJECTED');}
        const size=res.headers['content-length'];
        if(size && (!/^\d+$/.test(size) || Number(size)>limit)){res.destroy();return fail('DOWNLOAD_SIZE_LIMIT');}
        let total=0;const chunks:Buffer[]=[];
        res.on('data',(chunk:Buffer)=>{total+=chunk.length;if(total>limit){res.destroy();fail('DOWNLOAD_SIZE_LIMIT');}else chunks.push(chunk);});
        res.on('end',()=>{if(!settled){settled=true;accept({bytes:Buffer.concat(chunks,total)});}});
        res.on('aborted',()=>fail('DOWNLOAD_TRUNCATED'));res.on('error',()=>fail('DOWNLOAD_FAILED'));
      });
      req.setTimeout(safetyProfile.network.idleTimeoutMs,()=>req.destroy(new Error('IDLE_TIMEOUT')));
      req.on('error',()=>fail(signal.aborted?'DOWNLOAD_TIMEOUT_OR_CANCELLED':'DOWNLOAD_FAILED'));req.end();
    });
    if(response.bytes)return {bytes:response.bytes,capture:{version:'heurisko-download-v1',requestedUrl:allowedURL(value).href,finalUrl:url.href,captureTime:new Date().toISOString(),sha256:sha256(response.bytes),size:response.bytes.length,hops}};
    if(redirect===safetyProfile.network.redirects)throw new DownloadError('REDIRECT_LIMIT');
    url=allowedURL(new URL(response.location!,url).href);scopeHost(url);
  }
  throw new DownloadError('REDIRECT_LIMIT');
}
export function pinnedSourceURL(repo:string,commit:string):string {
  if(!/^[a-f0-9]{40}$/.test(commit))throw new DownloadError('SOURCE_FULL_COMMIT_REQUIRED');
  const match=/^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/.exec(repo);
  if(!match || [match[1],match[2]].some(x=>x==='.'||x==='..'))throw new DownloadError('SOURCE_REPOSITORY_REJECTED');
  return `https://codeload.github.com/${match[1]}/${match[2]}/tar.gz/${commit}`;
}
