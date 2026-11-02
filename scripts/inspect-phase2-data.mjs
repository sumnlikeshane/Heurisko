// Lawful development-entry review through the admitted parser only.
import fs from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
import {EvidenceStore,inventoryArchive,sha256} from '../packages/core/dist/index.js';
assert.equal(process.version,'v22.23.4');
const [inputArg,outArg]=process.argv.slice(2);if(!outArg)throw Error('capture directory and NEW review directory required');
const input=resolve(inputArg),out=resolve(outArg);await fs.mkdir(out,{recursive:false});
const captures=JSON.parse(await fs.readFile(join(input,'captures.json'),'utf8'));
const store=new EvidenceStore(join(out,'store'));await store.initialize();const results=[];
for(const c of captures.cases) {
 const bytes=await fs.readFile(join(input,c.artifact));assert.equal(sha256(bytes),'sha256:'+c.artifactSha256);
 const ref=await store.put(bytes),inventory=await inventoryArchive(store,ref);
 await fs.writeFile(join(out,c.caseId+'.inventory.json'),JSON.stringify(inventory,null,2)+'\n',{flag:'wx'});
 const rights=[];
 for(const member of inventory.members.filter(m=>m.type==='file'&&/(?:^|\/)(?:licen[cs]e|copying|notice)(?:\.[^/]*)?$/i.test(m.path))) {
  const raw=await store.get(member.contentRef),dest=join(out,'notices',c.caseId,member.path);await fs.mkdir(resolve(dest,'..'),{recursive:true});await fs.writeFile(dest,raw,{flag:'wx'});
  rights.push({path:member.path,sha256:sha256(raw),bytes:raw.length,retained:dest.slice(out.length+1)});
 }
 results.push({caseId:c.caseId,family:c.family,artifactSha256:c.artifactSha256,complete:inventory.complete,code:inventory.code,knownFiles:inventory.knownFiles,knownBytes:inventory.knownBytes,declaredLicense:c.declaredLicense,rights,entryReview:inventory.complete&&rights.length?'notices retained; development review available':'excluded pending rights/parser resolution'});
 await fs.writeFile(join(out,'review.json'),JSON.stringify({results,limitations:['No independent labels or held-out grading.','License declarations and original notice retention are evidence, not a legal opinion.','No target install/import/execution; admitted Docker parser inventories archive bytes.']},null,2)+'\n');
 console.log(c.caseId,inventory.complete,rights.length);
}
