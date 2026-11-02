// Isolated development prototype only; not a production worker admission.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import assert from 'node:assert/strict';
assert.equal(process.version,'v22.23.4');
const [toolArg,evidenceArg,outArg]=process.argv.slice(2);if(!outArg)throw Error('isolated tools, evidence and NEW output directory required');
const tools=resolve(toolArg),evidence=resolve(evidenceArg),out=resolve(outArg);await fs.mkdir(out,{recursive:false});
const denied=join(out,'outside-worker-read-scope.txt');await fs.writeFile(denied,'INERT_PERMISSION_PROBE\n',{flag:'wx'});
const worker=String.raw`
const fs=require('node:fs'),{createRequire}=require('node:module');
const [tools,evidence,mode,denied]=process.argv.slice(1);
const r=createRequire(tools+'/package.json');
let blockedCalls=0;const deny=()=>{blockedCalls++;throw Error('EVALUATION_NETWORK_DENIED');};
for(const [name,methods]of [['node:http',['get','request']],['node:https',['get','request']],['node:net',['connect','createConnection']],['node:tls',['connect']],['node:dns',['lookup','resolve','resolve4','resolve6']]])for(const key of methods)r(name)[key]=deny;
globalThis.fetch=deny;
const {Verifier,toTrustMaterial,toSignedEntity}=r('@sigstore/verify'),{bundleFromJSON}=r('@sigstore/bundle'),{TrustedRoot}=r('@sigstore/protobuf-specs');
const root=TrustedRoot.fromJSON(JSON.parse(fs.readFileSync(evidence+'/root-research/trusted_root.json','utf8')));
const bundle=JSON.parse(fs.readFileSync(evidence+'/real-npm/verify/attestations.json','utf8')).attestations.find(a=>a.predicateType==='https://slsa.dev/provenance/v1').bundle;
const verifier=new Verifier(toTrustMaterial(root),{ctlogThreshold:1,tlogThreshold:1,timestampThreshold:1}),entity=toSignedEntity(bundleFromJSON(bundle));
verifier.verify(entity); // Real positive beside every adverse/protocol probe.
let fileDenied=false,childDenied=false;
try{fs.readFileSync(denied);}catch(e){fileDenied=e.code==='ERR_ACCESS_DENIED';}
try{r('node:child_process').execFileSync(process.execPath,['-e','process.exit(0)']);}catch(e){childDenied=e.code==='ERR_ACCESS_DENIED';}
if(!fileDenied||!childDenied)throw Error('WORKER_PERMISSION_PROBE_FAILED');
if(blockedCalls)throw Error('CANDIDATE_ATTEMPTED_NETWORK');
if(mode==='malformed'){
 const b=structuredClone(bundle);b.verificationMaterial.certificate.rawBytes=Buffer.alloc(128*1024,0x30).toString('base64');
 let rejected=false;try{verifier.verify(toSignedEntity(bundleFromJSON(b)));}catch(e){rejected=true;}
 if(!rejected)throw Error('MALFORMED_CERTIFICATE_ACCEPTED');
}
process.stdout.write(JSON.stringify({mode,positive:true,fileDenied,childDenied,candidateNetworkCalls:blockedCalls,resourceUsage:process.resourceUsage()})+'\nREADY\n');
if(mode==='busy')for(;;)verifier.verify(entity);
`;
await fs.writeFile(join(out,'worker-used.cjs'),worker,{flag:'wx'});
const results=[];
for(const mode of ['positive','malformed','timeout','cancel']) {
 const started=Date.now();let timer,cancelTimer,forceTimer,killedAt,stdout='',stderr='',overflow=false;
 const child=spawn(process.execPath,['--max-old-space-size=128','--stack-size=512','--experimental-permission',`--allow-fs-read=${tools}`,`--allow-fs-read=${evidence}`,'-e',worker,tools,evidence,['timeout','cancel'].includes(mode)?'busy':mode,denied],{env:{PATH:dirname(process.execPath),LANG:'C',TZ:'UTC'},stdio:['ignore','pipe','pipe']});
 const terminate=()=>{if(killedAt===undefined){killedAt=Date.now();child.kill('SIGTERM');forceTimer=setTimeout(()=>child.kill('SIGKILL'),2000);}};
 timer=setTimeout(terminate,mode==='timeout'?500:5000);
 child.stdout.on('data',data=>{
  stdout+=data.toString();if(stdout.length>128*1024){overflow=true;terminate();}
  if(mode==='cancel'&&stdout.includes('READY')&&!cancelTimer)cancelTimer=setTimeout(terminate,100);
 });
 child.stderr.on('data',data=>{stderr+=data.toString();if(stderr.length>128*1024){overflow=true;terminate();}});
 const settled=await new Promise((accept,reject)=>{child.once('error',reject);child.once('close',(code,signal)=>accept({code,signal}));});
 clearTimeout(timer);clearTimeout(cancelTimer);clearTimeout(forceTimer);
 await fs.writeFile(join(out,mode+'.stdout.log'),stdout,{flag:'wx'});await fs.writeFile(join(out,mode+'.stderr.log'),stderr,{flag:'wx'});
 const result={mode,...settled,pid:child.pid,ms:Date.now()-started,terminationRequested:killedAt!==undefined,settlementAfterRequestMs:killedAt===undefined?null:Date.now()-killedAt,overflow,ready:stdout.includes('READY')};
 result.pass=!overflow&&result.ready&&(mode==='timeout'||mode==='cancel'?result.signal==='SIGTERM'&&result.settlementAfterRequestMs<2000:result.code===0);
 results.push(result);
}
const result={node:process.version,platform:process.platform,arch:process.arch,results,passed:results.every(r=>r.pass),limits:{jsHeapMiB:128,stackKiB:512,parentWallMs:5000,timeoutProbeMs:500,stdoutStderrBytesEach:128*1024},limitations:['Development worker prototype only, no production integration/admission.','Node permissions and JS heap cap are not OS memory/network containment; native allocations and unknown native-library behavior need independent boundary review.','Read scope is isolated verifier-tool and public fixture directories; child-process permission denied. No target package or build executed.','Busy probe repeatedly verifies a real positive; parent cancellation/timeout confirms exact child exit rather than an in-process promise timeout.','No native Linux, root bootstrap/freshness/rollback or complete mandatory admission matrix claimed.']};
await fs.writeFile(join(out,'validation.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({passed:result.passed,probes:results.length}));if(!result.passed)process.exitCode=1;
