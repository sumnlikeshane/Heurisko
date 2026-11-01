import test from 'node:test';
import assert from 'node:assert/strict';
import {progressMeasure} from '../dist/components/Progress.js';
import {decodeUIState,encodeUIState,initialLocation,initialFilters} from '../dist/state/persistence.js';
import {editText} from '../dist/state/text-entry.js';
import {overviewReport} from '../dist/view-model.js';
import {ReportReader} from '../../../integration/part4/dist/report-reader.js';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../../..');
test('a process has no percentage without an actual valid unit denominator',()=>{
 for(const [done,total]of [[undefined,undefined],[2,undefined],[0,0],[5,4],[-1,10],[NaN,10],[3,Infinity],[1.2,10],[1,Number.MAX_SAFE_INTEGER+1]])assert.equal(progressMeasure(done,total).kind,'indeterminate');
 assert.deepEqual(progressMeasure(3,4),{kind:'measured',completed:3,total:4,fraction:.75});assert.equal(progressMeasure(4,4).fraction,1);
});
test('v1 navigation migrates without report changes and v2 preserves distinct section/pane/source positions',()=>{
 const old={version:1,location:{...initialLocation(),scrolls:undefined,section:1,index:7,scroll:5,focus:1,query:'lifecycle',detail:true}};
 const migrated=decodeUIState(JSON.stringify(old));assert.equal(migrated.version,2);assert.equal(migrated.location.detail,false);assert.equal(migrated.location.query,'lifecycle');assert.equal(migrated.location.scrolls[1],5);
 const state={version:2,location:{...initialLocation(),section:3,subtab:1,selectedId:'provenance',scrolls:[0,5,9]},sections:{'1':{...initialLocation(),section:1,index:7,selectedId:'finding-real-id',query:'lifecycle',scrolls:[0,8,2]},'3:0':{...initialLocation(),section:3,subtab:0,index:2}},filters:initialFilters(),tree:false,collapsed:['directory:package/dist'],diff:'side',overviewFinding:2};
 assert.deepEqual(decodeUIState(encodeUIState(state)),state);
 for(const broken of [{...state,location:{...state.location,scrolls:[0,-1,0]}},{...state,sections:{'../../bad':initialLocation()}},{...state,version:3}])assert.throws(()=>decodeUIState(JSON.stringify(broken)));
});
test('large single-grapheme or control-character paste stays bounded before segmentation',()=>{
 const value='a';assert.equal(editText(value,1,'\u0301'.repeat(100000),{},240).overflow,true);
 assert.equal(editText('',0,'\x1b'.repeat(10000),{},240).overflow,true);
 assert.equal(editText('',0,'qHI/?',{}).value,'qHI/?');
});
test('dashboard retains independent actual outcomes and honest processing counts without invented file pairs',async()=>{
 const reader=await ReportReader.openFile(resolve(root,'examples/handoff/current/B1.report.json'),resolve(root,'examples/handoff/current/store'));
 const view=overviewReport(reader);assert.deepEqual(view.outcomes,reader.report.outcomes);assert.equal(view.findingsEvaluated,false);assert.equal(view.comparedFiles,reader.report.bundle.coverage.comparedFiles);assert.equal(view.sourceFiles,reader.report.bundle.coverage.sourceFiles);assert.equal(view.findings.length,0);assert.ok(view.omissions.some(s=>s.includes('not evaluated')));
});

test('raw display alignment is bounded, window-relative and never changes evidence records',async()=>{
 const {rawDiffLines}=await import('../dist/diff-view.js');
 const content=text=>({kind:'content',encoding:'utf8',inertText:text,displayedRange:{startByte:500,endByte:500+text.length},recordedRange:{startByte:500,endByte:500+text.length},truncated:false});
 const source=content('same\nold\nsame'),artifact=content('same\nnew\nsame'),before=JSON.stringify([source,artifact]);
 const lines=rawDiffLines(source,artifact,100,true,0);assert.ok(lines.some(l=>l.left?.includes('old')));assert.ok(lines.some(l=>l.right?.includes('new')));assert.ok(lines.some(l=>l.text.includes('window-relative')));assert.equal(JSON.stringify([source,artifact]),before);
 const big=rawDiffLines(content('a\n'.repeat(1000)),content('b\n'.repeat(1000)),70,false,0);assert.ok(big.length<410);assert.ok(big.some(l=>l.text.includes('bounded to 200')));
 const missing=rawDiffLines({kind:'metadata_only',reason:'MISSING_BLOB'},artifact,100,true,0);assert.ok(missing.some(l=>l.text.includes('No aligned comparison')));assert.ok(!missing.some(l=>l.left!==undefined));
});
