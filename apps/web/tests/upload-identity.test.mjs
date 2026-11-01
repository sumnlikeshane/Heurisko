import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { sha256 } from '@heurisko/core';
import { WebWorkspace } from '../dist/workspace.js';

async function sandbox(t) {
    const root = await fs.mkdtemp(join(await fs.realpath(tmpdir()), 'heurisko-upload-identity-'));
    t.after(() => fs.rm(root, { recursive: true, force: true }));
    return root;
}

test('upload snapshots selected bytes before asynchronous initialization', async t => {
    const root = await sandbox(t), workspace = new WebWorkspace(root);
    const input = Buffer.from('authored inert upload bytes'), expected = Buffer.from(input);
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const initialize = workspace.initialize.bind(workspace);
    workspace.initialize = async () => { await gate; await initialize(); };
    const pending = workspace.upload('artifact', 'inert.tgz', input);
    input.fill(0);
    release();
    const uploaded = await pending, disk = await fs.readFile(join(root, 'uploads', uploaded.upload));
    assert.deepEqual(disk, expected);
    assert.equal(uploaded.bytes, expected.length);
    assert.equal(uploaded.sha256, sha256(expected));
    assert.equal(uploaded.sha256, sha256(disk));
});

test('upload summary remains bound to disk when caller mutates after write completion', async t => {
    const root = await sandbox(t);
    // Isolate the built-in instrumentation in a child; no other test can observe it.
    const script = `
        import fs from 'node:fs/promises';
        import {syncBuiltinESMExports} from 'node:module';
        import {join,sep} from 'node:path';
        import {WebWorkspace} from ${JSON.stringify(new URL('../dist/workspace.js', import.meta.url).href)};
        import {sha256} from ${JSON.stringify(new URL('../../../packages/core/dist/index.js', import.meta.url).href)};
        const root=process.argv[1],input=Buffer.from('authored inert upload bytes');
        const expected=Buffer.from(input),writeFile=fs.writeFile;
        let mutated=false;
        try {
            fs.writeFile=async (...args)=>{
                await writeFile(...args);
                if(String(args[0]).startsWith(join(root,'uploads')+sep)){
                    input.fill(0);mutated=true;
                }
            };
            syncBuiltinESMExports();
            const uploaded=await new WebWorkspace(root).upload('artifact','inert.tgz',input);
            const disk=await fs.readFile(join(root,'uploads',uploaded.upload));
            console.log(JSON.stringify({mutated,originalSha256:sha256(expected),diskSha256:sha256(disk),summarySha256:uploaded.sha256,keepsOriginal:disk.equals(expected)}));
        } finally {
            fs.writeFile=writeFile;syncBuiltinESMExports();
        }
    `;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', script, root], { encoding: 'utf8', timeout: 10000, maxBuffer: 65536 });
    assert.equal(result.error, undefined);
    assert.equal(result.status, 0, result.stderr);
    const check = JSON.parse(result.stdout);
    assert.equal(check.mutated, true, 'The mutation must occur in the post-write interval');
    assert.equal(check.keepsOriginal, true);
    assert.equal(check.diskSha256, check.originalSha256);
    assert.equal(check.summarySha256, check.diskSha256);
});
