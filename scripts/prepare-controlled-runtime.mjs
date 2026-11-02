// Isolated TEST ONLY runtime copy. Production files and anchors are never edited.
import fs from 'node:fs/promises';import {resolve,join,relative} from 'node:path';import {createHash} from 'node:crypto';import {build} from '../apps/web/node_modules/esbuild/lib/main.js';
const [fixtureArg,outArg]=process.argv.slice(2);if(!fixtureArg||!outArg)throw Error('fixture directory and NEW runtime directory required');
const root=process.cwd(),fixture=resolve(fixtureArg),out=resolve(outArg);await fs.mkdir(out,{recursive:false});
const dirs=['packages/contracts','packages/core','packages/intelligence-reviewed','packages/cli','packages/tui','integration/part4','apps/web'];
for(const dir of dirs) {
 const dest=join(out,dir);await fs.mkdir(dest,{recursive:true});
 for(const n of ['package.json','dist','runtime','src','schema','admission.json','provenance','tsconfig.json'])try{await fs.cp(join(root,dir,n),join(dest,n),{recursive:true,dereference:false,errorOnExist:true});}catch(e){if(e.code!=='ENOENT')throw e;}
}
// Rebind only internal workspace links; exact external dependencies remain the
// original admitted installed bytes, not fixture-selected modules.
for(const dir of dirs) {
 const src=join(root,dir,'node_modules'),dest=join(out,dir,'node_modules');await fs.mkdir(dest,{recursive:true});
 async function links(src,dest){for(const entry of await fs.readdir(src,{withFileTypes:true})){if(entry.name==='.bin')continue;const p=join(src,entry.name),d=join(dest,entry.name);if(entry.isDirectory()&&entry.name.startsWith('@')){await fs.mkdir(d,{recursive:true});await links(p,d);}else {const real=await fs.realpath(p);const internal=dirs.some(x=>real===join(root,x));await fs.symlink(internal?join(out,relative(root,real)):real,d);}}}
 try{await links(src,dest);}catch(e){if(e.code!=='ENOENT')throw e;}
}
for(const n of ['package.json','pnpm-lock.yaml'])await fs.copyFile(join(root,n),join(out,n));
await fs.symlink(join(root,'.venv'),join(out,'.venv'));
await fs.copyFile(join(fixture,'bootstrap.json'),join(out,'packages/core/runtime/trust-bootstrap.json'));
await build({entryPoints:[join(root,'packages/core/runtime/verifier-worker.ts')],outfile:join(out,'packages/core/dist/verifier-worker.cjs'),bundle:true,platform:'node',target:'node22',format:'cjs',legalComments:'eof',plugins:[{name:'fixed-controlled-bootstrap',setup(b){b.onLoad({filter:/\/runtime\/trust-bootstrap\.json$/},async()=>({contents:await fs.readFile(join(fixture,'bootstrap.json'),'utf8'),loader:'json'}));}}],footer:{js:'/*!\n'+(await fs.readFile('packages/core/VERIFIER_THIRD_PARTY_NOTICES.txt','utf8')).replaceAll('*/','* /')+'\n*/'}});
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
await fs.writeFile(join(out,'CONTROLLED-TEST-ONLY.json'),JSON.stringify({version:'heurisko-controlled-runtime-v1',productionRoot:root,fixtureManifestSha256:await hash(join(fixture,'manifest.json')),testBootstrapSha256:await hash(join(fixture,'bootstrap.json')),productionBootstrapSha256:await hash('packages/core/runtime/trust-bootstrap.json'),productionWorkerSha256:await hash('packages/core/dist/verifier-worker.cjs'),testWorkerSha256:await hash(join(out,'packages/core/dist/verifier-worker.cjs')),evaluatorSourceSha256:await hash('packages/core/runtime/verifier-worker.ts'),hostEvaluatorSha256:await hash('packages/core/dist/trust.js'),boundary:'Same evaluator source and restricted Docker launcher; separate fixed-anchor build only. No production env/request anchor selection.'},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({runtime:out}));
