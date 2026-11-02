import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {loadTrustCatalog} from '../dist/trust.js';
const expect={package:'inert',version:'1.0.0',repositoryUrl:'https://github.com/example/inert',fullSourceCommit:'1'.repeat(40),packageSubdirectory:'',workflowPath:'.github/workflows/release.yml',workflowRef:'refs/heads/main',signerSAN:'https://github.com/example/inert/.github/workflows/release.yml@refs/heads/main',builderId:'https://github.com/actions/runner/github-hosted',buildType:'https://slsa-framework.github.io/github-actions-buildtypes/workflow/v1'};
for(const profile of ['npm-gha-slsa-v1-draft.1','npm-gha-slsa-v1-draft.2','unadmitted-profile'])test('host catalog preserves exact selected profile: '+profile,async t=>{
 const dir=await fs.mkdtemp(join(tmpdir(),'heurisko-trust-profile-'));t.after(()=>fs.rm(dir,{recursive:true,force:true}));const file=join(dir,'catalog.json');const catalog={version:'heurisko-trust-catalog-v1',snapshot:{version:'authored-not-verified-by-catalog-loader'},policies:{selected:{profile,provenance:'required',expect}}};await fs.writeFile(file,JSON.stringify(catalog));
 if(profile==='unadmitted-profile')await assert.rejects(loadTrustCatalog(file),/TRUST_POLICY_INVALID/);else assert.deepEqual(await loadTrustCatalog(file),catalog);
});
