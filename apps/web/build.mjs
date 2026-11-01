import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
execFileSync(process.execPath,[fileURLToPath(new URL('../../node_modules/typescript/bin/tsc',import.meta.url)),'-p','../../integration/part4/tsconfig.json'],{stdio:'inherit'});
import {mkdir,copyFile,writeFile,readFile} from 'node:fs/promises';
await mkdir('dist/assets',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,outdir:'dist/assets',entryNames:'app',format:'esm',platform:'browser',target:'es2022',jsx:'automatic',minify:true,metafile:true,define:{'process.env.NODE_ENV':'"production"'}}).then(async r=>{
  if(Object.keys(r.metafile.inputs).some(x=>/packages\/core|integration\/part4|node:/.test(x)))throw Error('NODE_CODE_IN_BROWSER');
  await writeFile('dist/browser-inputs.json',JSON.stringify(Object.keys(r.metafile.inputs),null,2));
});
await copyFile('src/style.css','dist/assets/app.css');
await copyFile('src/index.html','dist/index.html');
await build({entryPoints:['server/main.ts','server/service.ts','server/observation.ts','tooling/export.ts','tooling/transport.ts','server/workspace.ts','tooling/portable.ts','src/render-check.tsx','src/navigation.ts','src/api.ts','src/link.tsx'],bundle:true,outdir:'dist',entryNames:'[name]',format:'esm',platform:'node',target:'node22',packages:'external',external:['../../../integration/part4/dist/report-reader.js'],sourcemap:false});

// Deterministic, admitted page manifest; canonical references remain complete.
await build({entryPoints:['src/doc-model.ts','src/input-review.ts','src/report-view.ts'],bundle:true,outdir:'dist',format:'esm',platform:'node',packages:'external'});
const {docPages, headings} = await import('./dist/doc-model.js?build=' + Date.now());
const cli = await readFile('../../docs/CLI Reference.md','utf8');
const readme = await readFile('../../README.md','utf8');
const begin = readme.indexOf('## Installation and execution');
if (begin < 0) throw Error('SETUP_SECTION_MISSING');
const end = readme.indexOf('\n## ', begin + 4);
const setup = readme.slice(begin,end < 0 ? undefined : end);
const sources = {cli,setup:'# Installation and execution\n\n'+setup,browser:await readFile('content/browser.md','utf8'),'reference/browser':await readFile('README.md','utf8')};
const section = (names) => cli.split(/(?=^## )/m).filter(s=>names.some(n=>s.startsWith('## '+n+'\n'))).join('\n');
const docs = await Promise.all(docPages.map(async ([id,group,title]) => {
 let markdown = sources[id], source = id === 'cli' ? 'docs/CLI Reference.md' : id === 'setup' ? 'README.md#installation-and-execution' : id === 'browser' ? 'apps/web/content/browser.md' : 'apps/web/README.md';
 if(id === 'cli/analyze') markdown = '# Analyze\n\n' + section(['Analyze inputs and constraints','All current options','Exact npm and source override examples','Local archive and source replay']) + '\n[Output and exits](/docs/cli#output-exits-and-ci) · [Inspect](/docs/cli/inspect)';
 if(id === 'cli/inspect') markdown = '# Inspect\n\n' + section(['Inspect reports and evidence','Output, exits and CI']) + '\n[All options](/docs/cli#all-current-options) · [Troubleshooting](/docs/troubleshooting/errors)';
 if (id.startsWith('cli/')) source = 'docs/CLI Reference.md';
 if (!markdown) { source = 'apps/web/content/' + id.replaceAll('/','-') + '.md'; markdown = await readFile('content/' + id.replaceAll('/','-') + '.md','utf8'); }
 return {id,group,title,source,markdown};
}));
// Guides stay navigable as repository Markdown. Resolve only explicitly admitted
// document sources to runtime routes; unmatched repository references remain inert.
for (const page of docs.filter(d=>d.source.startsWith('apps/web/content/'))) {
 page.markdown = page.markdown.replace(/\]\(([^)]+)\)/g,(whole,target)=>{
  if(/^(?:https:|#|\/)/.test(target))return whole;
  const [path,anchor]=target.split('#');
  let resolved;try{resolved=resolve('../..',dirname(page.source),decodeURIComponent(path));}catch{return whole;}
  let linked=docs.find(d=>resolve('../..',d.source.split('#')[0])===resolved);
  if(resolved===resolve('../../docs/CLI Reference.md'))linked=docs.find(d=>d.id===(anchor==='analyze-inputs-and-constraints'?'cli/analyze':anchor==='inspect-reports-and-evidence'?'cli/inspect':'cli'));
  return linked?'](/docs/'+linked.id+(anchor?'#'+anchor:'')+')':whole;
 });
}
// Every link we declare as app navigation must have a real admitted destination/anchor.
const {uiPath} = await import('./dist/navigation.js?build=' + Date.now());
for (const page of docs) for (const m of page.markdown.matchAll(/\[[^\]]+\]\((\/[^)]+)\)/g)) {
 const [path,anchor] = m[1].split('#'); if(!uiPath(path)) throw Error('DOC_ROUTE_MISSING:' + m[1]);
 if(anchor && path.startsWith('/docs/')) { const dest=docs.find(d=>'/docs/'+d.id===path); if(!dest || !headings(dest.markdown).some(h=>h.id===anchor)) throw Error('DOC_ANCHOR_MISSING:' + m[1]); }
}
await writeFile('dist/cli-docs.json', JSON.stringify(docs));
