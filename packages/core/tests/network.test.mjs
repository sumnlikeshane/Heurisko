import test from 'node:test';
import assert from 'node:assert/strict';
import dns from 'node:dns/promises';
import https from 'node:https';
import { syncBuiltinESMExports } from 'node:module';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { downloadBytes } from '../dist/network.js';

// Trusted transport doubles exercise request policy without contacting targets.
function transport(t,responses,resolutions){
 const requests=[],lookups=[];let index=0,lookupIndex=0;
 t.mock.method(dns,'lookup',async(host,options)=>{
  lookups.push({host,options});const value=resolutions?.[lookupIndex++]??[{address:'8.8.8.8',family:4}];if(value instanceof Error)throw value;return value;
 });
 t.mock.method(https,'request',(url,options,callback)=>{
  requests.push({url:url.href,options});const item=responses[index++]??{status:200,body:'abc'};
  const req=new EventEmitter();req.setTimeout=(ms,fn)=>{req.idleTimeoutMs=ms;return req;};req.destroy=()=>{req.emit('error',new Error('synthetic transport failure'));return req;};
  req.end=()=>{setImmediate(()=>{
   options.lookup(url.hostname,{all:true},(error,addresses)=>{assert.equal(error,null);assert.deepEqual(addresses,[{address:'8.8.8.8',family:4}]);});
   if(item.error){req.emit('error',new Error('synthetic TLS failure'));return;}
   const res=new PassThrough();res.statusCode=item.status??200;res.headers=item.headers??{};callback(res);
   if(!res.destroyed)res.end(item.body??'abc');
  });return req;};return req;
 });
 syncBuiltinESMExports();
 t.after(()=>{t.mock.restoreAll();syncBuiltinESMExports();});
 return {requests,lookups};
}
function noProxies(t){
 const saved={};for(const key of Object.keys(process.env))if(/^(https?_proxy|all_proxy)$/i.test(key)){saved[key]=process.env[key];delete process.env[key];}
 t.after(()=>{for(const key of Object.keys(process.env))if(/^(https?_proxy|all_proxy)$/i.test(key))delete process.env[key];Object.assign(process.env,saved);});
}
test('pins validated DNS address while preserving TLS hostname and captures only selected response headers',async t=>{
 noProxies(t);const x=transport(t,[{body:'abc',headers:{'content-length':'3','content-type':'text/plain','set-cookie':'must-not-retain','authorization':'must-not-retain'}}]);
 const result=await downloadBytes('https://registry.npmjs.org/fixture',{maxBytes:10});assert.equal(result.bytes.toString(),'abc');assert.equal(result.capture.sha256,'sha256:ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
 assert.equal(x.requests[0].options.agent,false);assert.equal(x.requests[0].options.servername,'registry.npmjs.org');assert.equal(x.requests[0].options.headers['Accept-Encoding'],'identity');assert.equal(x.requests[0].options.maxHeaderSize,16384);assert.equal(x.lookups[0].options.all,true);
 assert.deepEqual(result.capture.hops[0].headers,{'content-type':'text/plain','content-length':'3'});
});
test('rejects mixed public/private DNS answers before creating a socket',async t=>{
 noProxies(t);const x=transport(t,[],[[{address:'8.8.8.8',family:4},{address:'127.0.0.1',family:4}]]);
 await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture'),/DNS_ADDRESS_REJECTED/);assert.equal(x.requests.length,0);
});
test('redirect revalidates DNS and refuses rebinding before another connection',async t=>{
 noProxies(t);const x=transport(t,[{status:302,headers:{location:'/redirected'}}],[[{address:'8.8.8.8',family:4}],[{address:'169.254.169.254',family:4}]]);
 await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture'),/DNS_ADDRESS_REJECTED/);assert.equal(x.requests.length,1);assert.equal(x.lookups.length,2);
});
test('cross-host redirects cannot leave the HTTPS allowlist',async t=>{
 noProxies(t);const x=transport(t,[{status:302,headers:{location:'https://evil.example/collect'}}]);await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture'),/URL_REJECTED/);assert.equal(x.requests.length,1);
});
test('redirect count, actual streamed size, advertised size and response encodings are bounded',async t=>{
 noProxies(t);
 {const x=transport(t,Array.from({length:4},()=>({status:302,headers:{location:'/again'}})));await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture'),/REDIRECT_LIMIT/);assert.equal(x.requests.length,4);t.mock.restoreAll();syncBuiltinESMExports();}
 for(const response of [{body:'a'.repeat(101)},{headers:{'content-length':'101'}},{headers:{'content-length':'garbage'}},{headers:{'content-encoding':'gzip'}}]){
  transport(t,[response]);await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture',{maxBytes:100}),/DOWNLOAD_SIZE_LIMIT|HTTP_ENCODING_REJECTED/);t.mock.restoreAll();syncBuiltinESMExports();
 }
});
test('TLS/HTTP failure, pre-cancel and ambient proxies fail closed without a fallback',async t=>{
 noProxies(t);
 transport(t,[{error:true}]);await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture'),/DOWNLOAD_FAILED/);t.mock.restoreAll();syncBuiltinESMExports();
 transport(t,[{status:404}]);await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture'),/HTTP_STATUS_REJECTED/);t.mock.restoreAll();syncBuiltinESMExports();
 const c=new AbortController();c.abort();await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture',{signal:c.signal}),/CANCELLED/);
 process.env.HTTPS_PROXY='http://proxy.invalid';await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture'),/PROXY_ENVIRONMENT_REJECTED/);delete process.env.HTTPS_PROXY;
});

test('acquisition-specific host scopes reject redirects to another globally allowlisted service before a second request',async t=>{
 noProxies(t);const x=transport(t,[{status:302,headers:{location:'https://api.github.com/x'}}]);await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture',{allowedHosts:['registry.npmjs.org']}),/REDIRECT_HOST_REJECTED/);assert.equal(x.requests.length,1);assert.equal(x.lookups.length,1);
});
test('in-flight cancellation aborts a pinned network request without fallback',async t=>{
 noProxies(t);const c=new AbortController();let requested=false;
 t.mock.method(dns,'lookup',async()=>[{address:'8.8.8.8',family:4}]);
 t.mock.method(https,'request',(_url,opts)=>{requested=true;const r=new EventEmitter();r.setTimeout=()=>r;r.end=()=>{opts.signal.addEventListener('abort',()=>r.emit('error',new Error('cancelled')),{once:true});setImmediate(()=>c.abort());};return r;});syncBuiltinESMExports();t.after(()=>{t.mock.restoreAll();syncBuiltinESMExports();});
 await assert.rejects(downloadBytes('https://registry.npmjs.org/fixture',{signal:c.signal}),/DOWNLOAD_TIMEOUT_OR_CANCELLED/);assert.equal(requested,true);
});
