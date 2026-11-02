import {readFile} from 'node:fs/promises';
import {build} from '../apps/web/node_modules/esbuild/lib/main.js';
await build({entryPoints:['packages/core/runtime/verifier-worker.ts'],outfile:'packages/core/dist/verifier-worker.cjs',bundle:true,platform:'node',target:'node22',format:'cjs',legalComments:'eof',footer:{js:'/*!\n'+(await readFile('packages/core/VERIFIER_THIRD_PARTY_NOTICES.txt','utf8')).replaceAll('*/','* /')+'\n*/'}});
