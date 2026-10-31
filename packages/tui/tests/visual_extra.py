"""Real source/related-file/error/state/large-report tasks beyond the primary visual matrix."""
from pty_session import Session,ROOT
import json,hashlib,time
BASE=ROOT/'integration/part4/receipts/visual-rework';CAP=BASE/('extra-'+str(len(list(BASE.glob('extra-*')))+1));CAP.mkdir(parents=True)
sessions=[];checks=[]
def expect(s,text):s.wait(text);checks.append({'check':text,'passed':True})
def new(c,r,args,**kw):s=Session(c,r,args,**kw);sessions.append(s);expect(s,'HEURISKO');return s
try:
 path=ROOT/'examples/handoff/current/B1.report.json';before=path.read_bytes();s=new(140,40,['tui',str(path),'--store','examples/handoff/current/store','--palette']);expect(s,'HISTORICAL');s.send('x');expect(s,'Source conflict');s.send('4');expect(s,'[Candidates]');s.send('v');expect(s,'[Provenance]');s.send('v');expect(s,'[Build]');s.send('v');expect(s,'[Candidates]');s.capture(CAP/'source-subtabs-140');s.send('n');expect(s,'New investigation');s.send('\r');expect(s,'Review exact target');s.capture(CAP/'alternative-source-review');s.send('\x1b');s.send('\x1b');expect(s,'[Candidates]');assert path.read_bytes()==before;s.quit()
 s=new(160,40,['tui','examples/part4/current/local-m1.report.json','--store','examples/part4/current/store']);expect(s,'HISTORICAL');s.send('x');s.send('3');expect(s,'package/');assert 'Supporting evidence' not in s.frame();checks.append({'check':'Files keeps revision-7 two-pane wide geometry','passed':True});s.send('\r');s.send('\r');s.send('v');s.send('/');s.send('package.json');s.send('\r');s.send('\r');s.scroll_to('RAW CHANGED SPANS');s.scroll_to('Viewer line alignment');s.capture(CAP/'raw-diff-160');s.send('d');s.send('\x1b[C');s.send('\x1b');s.send('4');s.send('/');s.send('Candidate');s.send('\r');s.send('\t');s.send('j');s.send('v');expect(s,'[Provenance]');assert 'Filter: Candidate' not in s.frame();s.send('v');s.send('v');expect(s,'Filter: Candidate');s.send('\x1b[Z');s.send('\x1b[Z');s.send('\x1b[C');s.send('\r');s.capture(CAP/'global-navigation-focus');s.send('H');s.send('o');s.send('/does/not/exist');s.send('\r');expect(s,'Open failed');s.capture(CAP/'open-error');s.send('\x1b');s.quit()
 s=new(120,35,['tui','examples/handoff/current/B3.report.json','--store','examples/handoff/current/store']);expect(s,'HISTORICAL');s.send('x');s.send('3');s.send('v');expect(s,'Files');s.capture(CAP/'large-real-files');s.send('6');expect(s,'Measured coverage and stages');s.send('\r');s.scroll_to('Unsupported bytes');s.capture(CAP/'large-real-coverage');s.quit()
 # Corrupt this explicitly synthetic observation's own UI record; report bytes stay unchanged.
 path=ROOT/'.heurisko/part4-ui-fixtures/failed.report.json';raw=path.read_bytes();r=json.loads(raw);state=ROOT/'.heurisko-tui-state'/(r['reportId']+'-'+hashlib.sha256(raw).hexdigest()+'.json');state.write_text('{authored corrupt UI state')
 s=new(120,35,['tui',str(path),'--store','.heurisko/part4-ui-fixtures/store']);expect(s,'UI state unavailable or corrupt');s.send('x');expect(s,'UI state reset');s.capture(CAP/'state-reset');s.quit();assert path.read_bytes()==raw
 # Retained example is a visible target-loader action, followed by an independent Review/Start.
 s=new(100,26,[]);s.send('\r');expect(s,'Package name');
 for _ in range(5):s.send('\t')
 expect(s,'Load retained example');s.send('\r');expect(s,'[ Local archive ]');expect(s,'Archive path');s.capture(CAP/'loaded-local-target');s.send('\x1b');s.quit()
except BaseException:
 for s in sessions:
  if not s.closed:s.capture(CAP/'failure')
 raise
finally:
 for s in sessions:s.cleanup_readonly()
 (CAP/'validation.json').write_text(json.dumps({'scope':'actual product keyboard; source metadata, navigation, raw bytes, safe errors, state reset','checks':checks,'count':len(checks)},indent=2)+'\n')
print(json.dumps({'passed':len(checks),'receipt':str(CAP.relative_to(ROOT))}))
