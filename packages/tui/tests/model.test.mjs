import test from 'node:test';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {readFile} from 'node:fs/promises';
import {ReportReader} from '../../../integration/part4/dist/report-reader.js';
import {reportItems} from '../dist/model.js';
import {safeText,fit,wrap} from '../dist/terminal/safe-text.js';
import {editText} from '../dist/state/text-entry.js';
const root=resolve(import.meta.dirname,'../../..');
test('actual historical facts preserve all six outcomes, unknown counts and source conflicts',async()=>{
 const r=await ReportReader.openFile(resolve(root,'examples/handoff/current/B1.report.json'),resolve(root,'examples/handoff/current/store'));
 const before=JSON.stringify(r.report),overview=reportItems(r,0,0)[0].lines.join('\n');
 for(const [k,v]of Object.entries(r.report.outcomes))assert.ok(overview.includes(`${k}: ${v}`));
 assert.match(overview,/examined-scope count: Unknown/);assert.match(overview,/SOURCE CONFLICT/);
 assert.equal(reportItems(r,1,0).length,0);assert.ok(reportItems(r,2,0).length);
 assert.match(reportItems(r,3,1)[0].lines.join('\n'),/not_checked/);
 assert.match(reportItems(r,4,0)[0].lines.join('\n'),/runtime unavailable/);
 assert.equal(JSON.stringify(r.report),before);
});
test('terminal rendering escapes OSC ANSI bidi and keeps grapheme bounds',()=>{
 const unsafe='\x1b]52;c;payload\x07\x1b[2J\u202efile';
 const text=safeText(unsafe);assert.ok(!/[\x00-\x1f\x7f-\x9f\u202e]/.test(text));assert.match(text,/\\u001b/);
 assert.equal(fit('界'.repeat(1000),20).length>0,true);assert.ok(wrap('界'.repeat(1000),20).length>1);
 for(const key of ['q','H','I','M','1','/','?'])assert.equal(editText('',0,key,{}).value,key);
});
test('real mutation file links retain original IDs and exact reader raw range',async()=>{
 const r=await ReportReader.openFile(resolve(root,'examples/s3/current/local-mutation-replay.report.json'),resolve(root,'examples/s3/current/store'));
 const changes=reportItems(r,2,0),e=r.report.bundle.evidence.find(e=>e.kind==='manifest_delta'&&e.locator.metadataKey==='scripts.postinstall');
 assert.ok(changes.some(c=>c.refs.includes(e.evidenceId)));
 const span=await r.readCitation(e.evidenceId,'artifact');assert.equal(span.kind,'content');assert.match(Buffer.from(span.bytesBase64,'base64').toString(),/inert|HEURISKO/i);
});
