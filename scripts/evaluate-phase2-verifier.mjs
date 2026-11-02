// Isolated tool evaluation only. Not imported by the engine and never grants
// production provenance/policy outcomes. Run with pinned Node and a bounded
// parent process. Fixture roots are test inputs, not admitted production roots.
import fs from 'node:fs/promises';
import {createRequire,syncBuiltinESMExports} from 'node:module';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {manifestFields} from '../packages/core/dist/comparison.js';
const [isolatedArg,evidenceArg,outArg]=process.argv.slice(2);
if(!outArg)throw Error('isolated tools, retained evidence and NEW output required');
assert.equal(process.version,'v22.23.4');
const isolated=resolve(isolatedArg),evidence=resolve(evidenceArg),out=resolve(outArg);
const require=createRequire(join(isolated,'package.json'));
let networkAttempts=0;
const deny=()=>{networkAttempts++;throw Error('EVALUATION_NETWORK_DENIED');};
for(const [name,methods]of [['node:http',['request','get']],['node:https',['request','get']],['node:net',['connect','createConnection']],['node:tls',['connect']],['node:dns',['lookup','resolve','resolve4','resolve6']]])for(const method of methods)require(name)[method]=deny;
globalThis.fetch=deny;syncBuiltinESMExports();
const {Verifier,toTrustMaterial,toSignedEntity}=require('@sigstore/verify');
const {bundleFromJSON}=require('@sigstore/bundle');
const {crypto}=require('@sigstore/core');
const {PublicKeyDetails,TrustedRoot}=require('@sigstore/protobuf-specs');
const fixtureRequire=createRequire(join(isolated,'fixtures','package.json'));
const fixtures=fixtureRequire('./bundles.cjs'),{trustedRoot}=fixtureRequire('./trust.cjs');
const publicKey=crypto.createPublicKey(fixtures.PUBLIC_KEY);
const keys={'9a76331edc1cfd3933040996615b1c06adbe6f9b4f11df4106dcceb66e3bdb1b':{rawBytes:publicKey.export({type:'spki',format:'der'}),keyDetails:PublicKeyDetails.PKIX_ECDSA_P256_SHA_256,validFor:{start:new Date(0)}}};
const trust=toTrustMaterial(trustedRoot,keys),verifier=new Verifier(trust,{ctlogThreshold:1,tlogThreshold:1,timestampThreshold:1});
const researchedRoot=TrustedRoot.fromJSON(JSON.parse(await fs.readFile(join(evidence,'root-research','trusted_root.json'),'utf8')));
const realVerifier=new Verifier(toTrustMaterial(researchedRoot),{ctlogThreshold:1,tlogThreshold:1,timestampThreshold:1});
const results=[];
function check(id,expected,work){let returned=false,error;const start=performance.now();try{work();returned=true;}catch(e){error={code:e.code??e.name,message:e.message};}const pass=returned===expected;results.push({id,expectedReturned:expected,returned,pass,error,ms:performance.now()-start});}
const verify=(bundle,artifact,policy)=>verifier.verify(toSignedEntity(bundleFromJSON(bundle),artifact),policy);
const mutateBase64=text=>{const b=Buffer.from(text,'base64');b[0]^=1;return b.toString('base64');};
for(const [name,bundle,artifact]of [
 ['upstream-message',fixtures.V1.MESSAGE_SIGNATURE.WITH_SIGNING_CERT,fixtures.ARTIFACT],
 ['upstream-dsse',fixtures.V1.DSSE.WITH_SIGNING_CERT.TLOG_DSSE,undefined],
 ['upstream-rekor-v2',fixtures.V3.DSSE.WITH_SIGNING_CERT.TLOG_DSSEV002,undefined],
]) {
 check(name+'-positive',true,()=>verify(bundle,artifact));
 const bad=structuredClone(bundle);
 if(bad.dsseEnvelope)bad.dsseEnvelope.signatures[0].sig=mutateBase64(bad.dsseEnvelope.signatures[0].sig);
 else bad.messageSignature.signature=mutateBase64(bad.messageSignature.signature);
 check(name+'-signature-mutation',false,()=>verify(bad,artifact));
}
check('message-wrong-artifact',false,()=>verify(fixtures.V1.MESSAGE_SIGNATURE.WITH_SIGNING_CERT,Buffer.from('hello, world?')));
const exact=value=>new RegExp('^'+value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$');
function subject(bundle,artifact,name,version){
 const envelope=bundle.dsseEnvelope;if(!envelope)throw Error('DSSE_REQUIRED');
 if(envelope.payloadType!=='application/vnd.in-toto+json')throw Error('PAYLOAD_TYPE_UNSUPPORTED');
 const statement=manifestFields(Buffer.from(envelope.payload,'base64')).get('').value;
 if(statement._type!=='https://in-toto.io/Statement/v1'||statement.predicateType!=='https://slsa.dev/provenance/v1')throw Error('BUILD_ASSERTION_REQUIRED');
 const expectedName='pkg:npm/'+name.replace('@','%40')+'@'+version;
 const subjects=statement.subject.filter(s=>s.name===expectedName);
 if(subjects.length!==1)throw Error('SUBJECT_NAME_MISMATCH');
 const digests=subjects[0].digest,algorithms=Object.keys(digests);
 if(!algorithms.length||algorithms.some(a=>!['sha256','sha512'].includes(a)))throw Error('SUBJECT_DIGEST_UNSUPPORTED');
 for(const algorithm of algorithms)if(createHash(algorithm).update(artifact).digest('hex')!==digests[algorithm])throw Error('SUBJECT_DIGEST_MISMATCH');
 return statement;
}
function strictCheckpointShape(bundle) {
 for(const entry of bundle.verificationMaterial.tlogEntries??[]) {
  const envelope=entry.inclusionProof?.checkpoint?.envelope;
  // The library verifies signed checkpoint content but tolerates additional
  // unsigned trailing lines. The proposed application profile rejects those.
  if(typeof envelope!=='string'||!/^([^\r\n]+)\n[0-9]+\n[A-Za-z0-9+/]+={0,2}\n\n(?:— [^\s]+ [A-Za-z0-9+/]+={0,2}\n)+$/.test(envelope))throw Error('CHECKPOINT_SHAPE_UNSUPPORTED');
 }
}
for(const [folder,name,version,archive]of [['verify','@sigstore/verify','4.1.2','verify-4.1.2.tgz'],['core','@sigstore/core','4.0.1','core-4.0.1.tgz']]) {
 const captured=JSON.parse(await fs.readFile(join(evidence,'real-npm',folder,'attestations.json'),'utf8'));
 const bundle=captured.attestations.find(a=>a.predicateType==='https://slsa.dev/provenance/v1').bundle;
 const artifact=await fs.readFile(join(evidence,archive));
 const policy={subjectAlternativeName:exact('https://github.com/sigstore/sigstore-js/.github/workflows/release.yml@refs/heads/main'),extensions:{issuer:'https://token.actions.githubusercontent.com'}};
 const run=(b=bundle,a=artifact,p=policy,n=name,v=version)=>{strictCheckpointShape(b);realVerifier.verify(toSignedEntity(bundleFromJSON(b)),p);return subject(b,a,n,v);};
 check(folder+'-real-positive',true,()=>run());
 check(folder+'-wrong-package-valid-signature',false,()=>run(bundle,artifact,policy,'@sigstore/other'));
 check(folder+'-wrong-version-valid-signature',false,()=>run(bundle,artifact,policy,name,'0.0.0'));
 const altered=Buffer.from(artifact);altered[altered.length-1]^=1;
 check(folder+'-artifact-mutation',false,()=>run(bundle,altered));
 check(folder+'-unexpected-signer',false,()=>run(bundle,artifact,{...policy,subjectAlternativeName:exact('https://github.com/untrusted/workflow')}));
 check(folder+'-unexpected-issuer',false,()=>run(bundle,artifact,{...policy,extensions:{issuer:'https://issuer.invalid'}}));
 check(folder+'-missing-oid',false,()=>run(bundle,artifact,{...policy,oids:[{oid:{id:[1,2,3,4,56789]},value:Buffer.from('unexpected')}]}));
 for(const mutation of ['payload','payloadType','signature','duplicate-log','missing-log','malformed-cert','unknown-version','missing-checkpoint','forged-checkpoint','checkpoint-unsigned-suffix','forged-time','missing-signed-time','unknown-log-version','forged-log-body']) {
  const b=structuredClone(bundle);
  if(mutation==='payload')b.dsseEnvelope.payload=mutateBase64(b.dsseEnvelope.payload);
  if(mutation==='payloadType')b.dsseEnvelope.payloadType='application/changed';
  if(mutation==='signature')b.dsseEnvelope.signatures[0].sig=mutateBase64(b.dsseEnvelope.signatures[0].sig);
  if(mutation==='duplicate-log')b.verificationMaterial.tlogEntries.push(structuredClone(b.verificationMaterial.tlogEntries[0]));
  if(mutation==='missing-log')b.verificationMaterial.tlogEntries=[];
  if(mutation==='malformed-cert')b.verificationMaterial.certificate.rawBytes='broken';
  if(mutation==='unknown-version')b.mediaType='application/vnd.dev.sigstore.bundle.v99+json';
  if(mutation==='missing-checkpoint')delete b.verificationMaterial.tlogEntries[0].inclusionProof.checkpoint;
  if(mutation==='forged-checkpoint')b.verificationMaterial.tlogEntries[0].inclusionProof.checkpoint.envelope='forged'+b.verificationMaterial.tlogEntries[0].inclusionProof.checkpoint.envelope;
  if(mutation==='checkpoint-unsigned-suffix')b.verificationMaterial.tlogEntries[0].inclusionProof.checkpoint.envelope+='tampered';
  if(mutation==='forged-time')b.verificationMaterial.tlogEntries[0].integratedTime='1';
  if(mutation==='missing-signed-time')delete b.verificationMaterial.tlogEntries[0].inclusionPromise;
  if(mutation==='unknown-log-version')b.verificationMaterial.tlogEntries[0].kindVersion.version='999';
  if(mutation==='forged-log-body')b.verificationMaterial.tlogEntries[0].canonicalizedBody=mutateBase64(b.verificationMaterial.tlogEntries[0].canonicalizedBody);
  check(folder+'-'+mutation,false,()=>run(b));
 }
 check(folder+'-untrusted-roots',false,()=>new Verifier(toTrustMaterial({...trustedRoot,certificateAuthorities:[],tlogs:[],ctlogs:[]})).verify(toSignedEntity(bundleFromJSON(bundle))));
 const expired=structuredClone(researchedRoot);for(const ca of expired.certificateAuthorities)ca.validFor={start:new Date(0),end:new Date(1)};
 check(folder+'-expired-root-authority',false,()=>new Verifier(toTrustMaterial(expired)).verify(toSignedEntity(bundleFromJSON(bundle))));
 for(const field of ['ctlogThreshold','tlogThreshold','timestampThreshold'])check(folder+'-'+field+'-enforced',false,()=>new Verifier(toTrustMaterial(researchedRoot),{[field]:99}).verify(toSignedEntity(bundleFromJSON(bundle))));
 const publish=captured.attestations.find(a=>a.predicateType!=='https://slsa.dev/provenance/v1').bundle;
 check(folder+'-publish-only-not-build',false,()=>subject(publish,artifact,name,version));
 // Independent field expectations belong to application policy, not the
 // cryptographic library. Exercise a valid signature beside each mismatch.
 let statement;try {statement=run();}catch(e){results.push({id:folder+'-dependent-policy-probes',pass:false,blockedBy:e.code??e.message});continue;}
 const expected=JSON.parse(await fs.readFile(join(evidence,'real-npm',folder,'metadata.json'),'utf8'));
 for(const [label,accept]of [['repository',p=>p.buildDefinition.externalParameters.workflow.repository==='https://github.com/other/repo'],['commit',p=>p.buildDefinition.resolvedDependencies[0].digest.gitCommit==='0'.repeat(40)],['workflow',p=>p.buildDefinition.externalParameters.workflow.path==='.github/workflows/other.yml'],['builder',p=>p.runDetails.builder.id==='https://builder.invalid'],['build-type',p=>p.buildDefinition.buildType==='unsupported']])check(folder+'-valid-crypto-wrong-'+label,false,()=>{run();if(!accept(statement.predicate))throw Error('EVALUATION_EXPECTATION_MISMATCH');});
 check(folder+'-metadata-commit-agreement',true,()=>assert.equal(statement.predicate.buildDefinition.resolvedDependencies[0].digest.gitCommit,expected.gitHead));
}
check('bounded-json-size',false,()=>manifestFields(Buffer.alloc(256*1024+1,32)));
check('bounded-json-depth',false,()=>manifestFields(Buffer.from('{"nested":'.repeat(34)+'0'+'}'.repeat(34))));
check('duplicate-json-key',false,()=>manifestFields(Buffer.from('{"subject":[],"subject":[]}')));
assert.equal(networkAttempts,0);
const result={node:process.version,platform:process.platform,arch:process.arch,candidate:'@sigstore/verify@4.1.2',networkAttempts,results,passed:results.every(r=>r.pass),resourceUsage:process.resourceUsage(),limitations:['Isolated development tool evaluation, not production admission or independent trust review.','Upstream fixture roots are caller-supplied evaluation inputs, not authenticated production bootstrap.','Two real npm positives are from one upstream project/provider; not population accuracy or independent labels.','Field policy mismatch probes are an evaluation harness, not a production policy evaluator.','No target package or build code executed; verifier tool and inspected upstream fixture modules only.','Linux/resource/cancellation/root-freshness and full mandatory admission matrix still require review.']};
await fs.writeFile(out,JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({passed:result.passed,checks:results.length,networkAttempts}));
if(!result.passed)process.exitCode=1;
