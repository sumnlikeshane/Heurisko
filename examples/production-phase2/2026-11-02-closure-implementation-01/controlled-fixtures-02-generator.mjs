// Version 1 fixture construction only. No private key is serialized or retained.
// Uses pinned Node crypto for signing, DER framing here is not a verifier.
import {generateKeyPairSync,sign,createHash,X509Certificate} from 'node:crypto';
import fs from 'node:fs/promises';import {resolve,join} from 'node:path';import {fileURLToPath} from 'node:url';
const b64=b=>Buffer.from(b).toString('base64'),sha=b=>createHash('sha256').update(b).digest(),hex=b=>sha(b).toString('hex');
const bytes=(...v)=>Buffer.concat(v.map(x=>Buffer.isBuffer(x)?x:Buffer.from(x)));
const uint=(v,n)=>{const b=Buffer.alloc(n);b.writeUIntBE(v,0,n);return b;};
const der=(tag,...v)=>{const b=bytes(...v),len=b.length<128?Buffer.from([b.length]):bytes([0x80+(b.length>255?2:1)],uint(b.length,b.length>255?2:1));return bytes([tag],len,b);};
const seq=(...v)=>der(0x30,...v),utf=s=>der(12,Buffer.from(s));
const integer=n=>{let h=n.toString(16);if(h.length%2)h='0'+h;let b=Buffer.from(h,'hex');if(b[0]&128)b=bytes([0],b);return der(2,b);};
const oid=s=>{const parts=s.split('.').map(Number),out=[40*parts[0]+parts[1]];for(let n of parts.slice(2)){const a=[n&127];while(n>>=7)a.unshift((n&127)|128);out.push(...a);}return der(6,out);};
const ext=(id,value,critical=false)=>seq(oid(id),...(critical?[der(1,[255])]:[]),der(4,value));
const key=()=>generateKeyPairSync('ec',{namedCurve:'prime256v1'}),spki=k=>k.publicKey.export({format:'der',type:'spki'}),sig=(k,data)=>sign('sha256',data,k.privateKey);
const algorithm=seq(oid('1.2.840.10045.4.3.2')),name=s=>seq(der(0x31,seq(oid('2.5.4.3'),utf(s)))),time=s=>der(23,Buffer.from(s.slice(2)));
const issuer=name('Heurisko controlled TEST ONLY CA v1'),subject=name('Heurisko controlled TEST ONLY signer v1');
export async function generate(out) {
 if(process.version!=='v22.23.4')throw Error('Pinned Node 22.23.4 required');await fs.mkdir(out,{recursive:false});
 const ca=key(),leaf=key(),ct=key(),log=key();let serial=1;
 const cert=(pub,sub,extensions)=>{const tbs=seq(der(0xa0,der(2,[2])),integer(serial++),algorithm,issuer,seq(time('20260101000000Z'),time('20300101000000Z')),sub,spki(pub),der(0xa3,seq(...extensions)));return {tbs,der:seq(tbs,algorithm,der(3,bytes([0],sig(ca,tbs))))};};
 const rootCert=cert(ca,issuer,[ext('2.5.29.19',seq(der(1,[255])),true),ext('2.5.29.15',der(3,[1,6]),true)]).der;
 const expect={package:'heurisko-controlled-fixture',version:'1.0.0',repositoryUrl:'https://github.com/heurisko-controlled/test-only',fullSourceCommit:'1'.repeat(40),packageSubdirectory:'',workflowPath:'.github/workflows/controlled.yml',workflowRef:'refs/heads/test-only',signerSAN:'https://github.com/heurisko-controlled/test-only/.github/workflows/controlled.yml@refs/heads/test-only',builderId:'https://github.com/actions/runner/github-hosted',buildType:'https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1'};
 const stamp=Math.floor(Date.now()/1000),stampMs=Buffer.alloc(8);stampMs.writeBigUInt64BE(BigInt(stamp)*1000n);
 function leafCert(overrides={}) {
  const e={...expect,...overrides};const exts=[ext('2.5.29.19',seq(),true),ext('2.5.29.15',der(3,[7,128]),true),ext('2.5.29.37',seq(oid('1.3.6.1.5.5.7.3.3'))),ext('2.5.29.17',seq(der(0x86,Buffer.from(e.signerSAN))))];
  for(const [suffix,value] of [['8',overrides.issuer??'https://token.actions.githubusercontent.com'],['11','github-hosted'],['12',e.repositoryUrl],['13',e.fullSourceCommit],['14',e.workflowRef]])exts.push(ext('1.3.6.1.4.1.57264.1.'+suffix,utf(value)));
  // Freeze serial before producing the pre-certificate and final certificate.
  const index=serial,pre=cert(leaf,subject,exts);serial=index;
  const preCert=bytes(sha(spki(ca)),uint(pre.tbs.length,3),pre.tbs),data=bytes([0,0],stampMs,[0,1],preCert,[0,0]),signature=sig(ct,data);
  const sct=bytes([0],sha(spki(ct)),stampMs,[0,0,4,3],uint(signature.length,2),signature),list=bytes(uint(sct.length+2,2),uint(sct.length,2),sct);
  return cert(leaf,subject,[...exts,ext('1.3.6.1.4.1.11129.2.4.2',der(4,list))]).der;
 }
 const signerCert=leafCert(),wrongCert=leafCert({signerSAN:'https://controlled.invalid/wrong-signer'}),wrongIssuerCert=leafCert({issuer:'https://controlled.invalid/issuer'});
 for(const certBytes of [rootCert,signerCert,wrongCert,wrongIssuerCert]){const x=new X509Certificate(certBytes);if(!x.verify(ca.publicKey)||Date.parse(x.validFrom)!==Date.parse('2026-01-01T00:00:00Z')||Date.parse(x.validTo)!==Date.parse('2030-01-01T00:00:00Z'))throw Error('CONSTRUCTED_CERTIFICATE_INVALID');}
 const authority=(k,url)=>({baseUrl:url,hashAlgorithm:'SHA2_256',publicKey:{rawBytes:b64(spki(k)),keyDetails:'PKIX_ECDSA_P256_SHA_256',validFor:{start:'2026-01-01T00:00:00Z',end:'2030-01-01T00:00:00Z'}},logId:{keyId:b64(sha(spki(k)))}});
 const trustedRoot={mediaType:'application/vnd.dev.sigstore.trustedroot+json;version=0.1',certificateAuthorities:[{subject:{organization:'Heurisko TEST ONLY',commonName:'Heurisko controlled TEST ONLY CA v1'},uri:'https://controlled.invalid/ca',certChain:{certificates:[{rawBytes:b64(rootCert)}]},validFor:{start:'2026-01-01T00:00:00Z',end:'2030-01-01T00:00:00Z'}}],tlogs:[authority(log,'https://controlled.invalid/rekor')],ctlogs:[authority(ct,'https://controlled.invalid/ct')],timestampAuthorities:[]};
 // Role-separated ephemeral Ed25519 TUF signing keys. Canonical JSON follows
 // TUF's sorted-key construction; signatures verified by admitted tuf-js.
 const canonical=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(canonical).join(',')+']':'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
 const tufKeys=Object.fromEntries(['root','timestamp','snapshot','targets'].map(role=>{const pair=generateKeyPairSync('ed25519'),raw=pair.publicKey.export({format:'der',type:'spki'}).subarray(-32).toString('hex'),pub={keytype:'ed25519',scheme:'ed25519',keyval:{public:raw}};return [role,{pair,pub,id:hex(Buffer.from(canonical(pub)))}];}));
 const signed=(role,data)=>({signed:data,signatures:[{keyid:tufKeys[role].id,sig:sign(null,Buffer.from(canonical(data)),tufKeys[role].pair.privateKey).toString('hex')}]});
 const expiry='2030-01-01T00:00:00Z',base=(_type,version)=>({_type,spec_version:'1.0.31',version,expires:expiry});
 const bootstrap=signed('root',{...base('root',15),consistent_snapshot:true,keys:Object.fromEntries(Object.values(tufKeys).map(k=>[k.id,k.pub])),roles:Object.fromEntries(Object.entries(tufKeys).map(([role,k])=>[role,{keyids:[k.id],threshold:1}]))});
 const rawRoot=Buffer.from(JSON.stringify(trustedRoot));
 const targets=signed('targets',{...base('targets',1),targets:{'trusted_root.json':{length:rawRoot.length,hashes:{sha256:hex(rawRoot)}}}});
 const linked=value=>{const b=Buffer.from(JSON.stringify(value));return {version:value.signed.version,length:b.length,hashes:{sha256:hex(b)}};};
 const snap=signed('snapshot',{...base('snapshot',1),meta:{'targets.json':linked(targets)}}),timestamp=signed('timestamp',{...base('timestamp',1),meta:{'snapshot.json':linked(snap)}});
 const snapshot={version:'heurisko-tuf-snapshot-v1',capturedAt:new Date().toISOString(),rotations:[],timestamp:b64(JSON.stringify(timestamp)),snapshot:b64(JSON.stringify(snap)),targets:b64(JSON.stringify(targets)),trustedRoot:b64(rawRoot),minimumVersions:{root:15,timestamp:1,snapshot:1,targets:1}};
 const expired=structuredClone(snapshot);expired.timestamp=b64(JSON.stringify(signed('timestamp',{...timestamp.signed,expires:'2020-01-01T00:00:00Z'})));
 // Inert authored tar streams; no scripts or executable target code.
 function archive(prefix){const entries={'package.json':JSON.stringify({name:expect.package,version:expect.version,license:'Apache-2.0',repository:expect.repositoryUrl,main:'index.js'}),'index.js':'// inert controlled fixture, never executed\n','LICENSE':null};return entries;}
 // Tar construction uses the same ordinary static format as controlled core tests.
 const {gzipSync}=await import('node:zlib');
 function tar(prefix){const chunks=[];for(const [n,t]of Object.entries({...archive(prefix),LICENSE:awaitLicense})){const data=Buffer.from(t),header=Buffer.alloc(512);header.write(prefix+'/'+n);header.write('0000644\0',100);header.write('0000000\0',108);header.write('0000000\0',116);header.write(data.length.toString(8).padStart(11,'0')+'\0',124);header.write('00000000000\0',136);header.fill(32,148,156);header[156]=48;header.write('ustar\0',257);header.write('00',263);header.write([...header].reduce((a,b)=>a+b,0).toString(8).padStart(6,'0')+'\0 ',148);chunks.push(header,data,Buffer.alloc((512-data.length%512)%512));}return gzipSync(bytes(...chunks,Buffer.alloc(1024)));}
 const awaitLicense=await fs.readFile('LICENSE','utf8'),artifact=tar('package'),source=tar('controlled-source');
 const digests=Object.fromEntries(['sha256','sha512'].map(a=>[a,createHash(a).update(artifact).digest('hex')]));
 const statement=()=>({_type:'https://in-toto.io/Statement/v1',subject:[{name:'pkg:npm/'+expect.package+'@'+expect.version,digest:digests}],predicateType:'https://slsa.dev/provenance/v1',predicate:{buildDefinition:{buildType:expect.buildType,externalParameters:{workflow:{repository:expect.repositoryUrl,path:expect.workflowPath,ref:expect.workflowRef}},resolvedDependencies:[{uri:'git+'+expect.repositoryUrl+'@'+expect.workflowRef,digest:{gitCommit:expect.fullSourceCommit}}]},runDetails:{builder:{id:expect.builderId}}}});
 function bundle(s,version='0.0.1',certificate=signerCert) {
  const payload=Buffer.from(JSON.stringify(s)),type='application/vnd.in-toto+json',pae=bytes(Buffer.from(`DSSEv1 ${type.length} ${type} ${payload.length} `),payload),signature=sig(leaf,pae);
  const body=version==='0.0.1'?{kind:'dsse',apiVersion:version,spec:{signatures:[{signature:b64(signature),verifier:b64(certificate)}],payloadHash:{algorithm:'sha256',value:hex(payload)}}}:{kind:'dsse',apiVersion:version,spec:{dsseV002:{signatures:[{content:b64(signature),verifier:{x509Certificate:{rawBytes:b64(certificate)},keyDetails:'PKIX_ECDSA_P256_SHA_256'}}],payloadHash:{algorithm:'SHA2_256',digest:b64(sha(payload))}}}};
  const bodyBytes=Buffer.from(canonical(body)),hash=sha(bytes([0],bodyBytes)),note=`controlled.invalid/rekor\n1\n${b64(hash)}\n`,checkpoint=note+'\n— controlled.invalid/rekor '+b64(bytes(sha(spki(log)).subarray(0,4),sig(log,Buffer.from(note))))+'\n';
  const set=Buffer.from(canonical({body:b64(bodyBytes),integratedTime:stamp,logIndex:0,logID:hex(spki(log))}));
  return {mediaType:'application/vnd.dev.sigstore.bundle.v0.3+json',dsseEnvelope:{payloadType:type,payload:b64(payload),signatures:[{keyid:'',sig:b64(signature)}]},verificationMaterial:{certificate:{rawBytes:b64(certificate)},tlogEntries:[{logIndex:'0',logId:{keyId:b64(sha(spki(log)))},kindVersion:{kind:'dsse',version},integratedTime:String(stamp),canonicalizedBody:b64(bodyBytes),inclusionPromise:{signedEntryTimestamp:b64(sig(log,set))},inclusionProof:{logIndex:'0',rootHash:b64(hash),treeSize:'1',hashes:[],checkpoint:{envelope:checkpoint}}}]}};
 }
 const cases=[];const add=(id,bundles,expected,extra={})=>cases.push({id,expected,...extra,material:{attestations:bundles.map(b=>({predicateType:'https://slsa.dev/provenance/v1',bundle:b}))}});
 const positive={status:'verified_policy',policyResult:'pass',artifactBinding:'matched'};
 for(const version of ['0.0.1','0.0.2']) {
  const v=version.replaceAll('.','-');add('positive-'+v,[bundle(statement(),version)],positive);
  for(const [id,mutate,certificate]of [
   ['wrong-signer',s=>s,wrongCert],['wrong-issuer',s=>s,wrongIssuerCert],
   ['wrong-builder',s=>{s.predicate.runDetails.builder.id='https://controlled.invalid/builder';return s;}],
   ['wrong-workflow',s=>{s.predicate.buildDefinition.externalParameters.workflow.path='wrong.yml';return s;}],
   ['wrong-source',s=>{s.predicate.buildDefinition.resolvedDependencies[0].digest.gitCommit='2'.repeat(40);return s;}],
  ])add(id+'-'+v,[bundle(mutate(statement()),version,certificate)],{status:'verified_cryptographic_only',policyResult:'violation',artifactBinding:'matched'},{cryptoRequired:true});
  for(const what of ['name','digest']){const s=statement();if(what==='name')s.subject[0].name='pkg:npm/another@1.0.0';else s.subject[0].digest={sha256:'0'.repeat(64)};add('wrong-subject-'+what+'-'+v,[bundle(s,version)],{status:'invalid',policyResult:'violation',artifactBinding:'mismatched'},{cryptoRequired:true});}
  const second=statement();second.predicate.runDetails.metadata={invocationId:'controlled-distinct-assertion'};
  add('conflict-'+v,[bundle(statement(),version),bundle(second,version)],{status:'unresolved',policyResult:'indeterminate',reason:'ASSERTIONS_CONFLICT'},{cryptoRequired:true});
  const malformed=bundle(statement(),version);malformed.dsseEnvelope.signatures[0].sig=b64(Buffer.from('invalid'));
  add('bad-signature-'+v,[malformed],{status:'invalid',policyResult:'violation'});
  const unknown=bundle(statement(),version);unknown.verificationMaterial.tlogEntries[0].kindVersion.version='999';add('unsupported-'+v,[unknown],{status:'unresolved',policyResult:'indeterminate'});
  add('positive-after-'+v,[bundle(statement(),version)],positive);
 }
 const policy={profile:'npm-gha-slsa-v1-draft.1',provenance:'required',expect};
 await fs.writeFile(join(out,'artifact.tgz'),artifact,{flag:'wx'});await fs.writeFile(join(out,'source.tgz'),source,{flag:'wx'});
 for(const [n,v]of Object.entries({'bootstrap.json':bootstrap,'snapshot.json':snapshot,'expired-snapshot.json':expired,'trusted-root.json':trustedRoot,'cases.json':cases,'policy.json':policy,'digests.json':digests}))await fs.writeFile(join(out,n),JSON.stringify(v,null,2)+'\n',{flag:'wx'});
 const files={};for(const n of await fs.readdir(out))files[n]=hex(await fs.readFile(join(out,n)));
 const manifest={version:'heurisko-controlled-signatures-v1',revision:2,certificateEncoding:'Minimal positive DER INTEGER serials and RFC5280 UTCTime through 2049; construction self-checks Node X509 signatures and validity dates.',origin:'Authored inert controlled fixtures; TEST ONLY anchors; not npm publisher evidence.',node:process.version,openssl:process.versions.openssl,generatorSha256:hex(await fs.readFile(fileURLToPath(import.meta.url))),lockSha256:hex(await fs.readFile('pnpm-lock.yaml')),createdAt:new Date().toISOString(),keys:'Ephemeral P-256 leaf/CA/CT/Rekor and Ed25519 per TUF role, never serialized; only public certificates/anchors retained.',rights:'Original Heurisko fixture construction and inert bytes under repository Apache-2.0; no third-party package code included. Verifier dependencies retain their separate notices.',files,cases:cases.map(({id,expected,cryptoRequired})=>({id,expected,cryptoRequired:cryptoRequired??false})),limitations:['One-leaf valid Merkle tree; larger-tree cryptographic negatives retain genuine npm lane.','Controlled keys do not establish third-party issuer/publisher identity or real npm dsse 0.0.2 usage.']};
 await fs.writeFile(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({output:out,cases:cases.length}));
}
if(process.argv[1]&&import.meta.url===new URL('file:'+resolve(process.argv[1])).href)await generate(resolve(process.argv[2]));
