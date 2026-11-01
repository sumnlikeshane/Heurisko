"""Production keyboard tasks plus revision-7 layout invariants on actual PTY cells."""
import pathlib,json,time,hashlib,sys
from pty_session import Session,ROOT
BASE=ROOT/'integration/part4/receipts/visual-rework';CAP=BASE/('attempt-'+str(len(list(BASE.glob('attempt-*')))+1));CAP.mkdir(parents=True)
checks=[];sessions=[]
def check(condition,name,session=None):
 if not condition:
  if session:session.capture(CAP/'failure')
  raise AssertionError(name+('\n'+session.frame() if session else ''))
 checks.append({'check':name,'passed':True,'size':[session.cols,session.rows] if session else None})
def expect(s,text):s.wait(text);check(True,text,s)
def submit_filter(s,query):
 expect(s,'Filter: '+query);s.send('\r');deadline=time.monotonic()+8
 while 'Filter: '+query+'_' in s.frame() and time.monotonic()<deadline:s.read(.1)
 check('Filter: '+query+'_' not in s.frame(),'Rendered '+query+' filter submits before navigation',s)
def create(c=160,r=40,args=None,color=False):
 s=Session(c,r,args or [],color);sessions.append(s);expect(s,'HEURISKO');return s
def report(c=160,r=40,kind='real',store=None):
 target='examples/part4/current/local-m1.report.json' if kind=='real' else '.heurisko/part4-ui-fixtures/'+kind+'.report.json'
 s=create(c,r,['tui',target,'--store',store or ('examples/part4/current/store' if kind=='real' else '.heurisko/part4-ui-fixtures/store')]);expect(s,'HISTORICAL');s.send('x',.3);expect(s,'Per-report UI state reset');return s
def profile():
 p=ROOT/'examples/part4/current/local-m1.report.json';r=json.loads(p.read_bytes());q=ROOT/'.heurisko-tui-state'/(r['reportId']+'-'+hashlib.sha256(p.read_bytes()).hexdigest()+'.json');return json.loads(q.read_text())
try:
 s=create(args=['--store','examples/part4/current/store'],color=True);expect(s,'Recent investigations');expect(s,'Needs attention');expect(s,'Monitoring');expect(s,'picocolors');check('HEURISKO /' not in s.frame(),'debug header removed',s);s.capture(CAP/'home-populated-160');s.send('\r');expect(s,'Package name  [editing]');expect(s,'[ npm ]');expect(s,'Local archive');check(next(l for l in s.frame().splitlines() if 'New investigation' in l).index('New investigation')>25,'centered reference form at 160 columns',s);check('q quit' not in s.frame(),'typing footer does not advertise q as quit',s);s.send('qHI?1/');expect(s,'qHI?1/');s.send('\x10');expect(s,'Actions');s.send('\x1b');expect(s,'qHI?1/');s.send('\x15');s.send('picocolors');s.send('\t');s.send('1.1.1');s.capture(CAP/'new-npm-160');s.send('\r');expect(s,'Review exact target');expect(s,'Start investigation');expect(s,'Unknown until exact-version acquisition');s.capture(CAP/'review-npm-160');s.send('\x1b');s.send('\x1b');check(s.quit()==0,'q quits Home',s)
 # Input control is focusable independently of its typing fields.
 s=create(84,26);s.send('\r');expect(s,'Package name');s.send('\x1b[Z');s.send('\x1b[C');expect(s,'[ Local archive ]');s.send('\t');expect(s,'Archive path  [editing]');s.capture(CAP/'local-selector-84');s.send('\x1b');s.quit()
 for c,r in [(160,40),(140,40),(120,35),(100,26),(84,26),(60,20)]:
  s=report(c,r);expect(s,'Independent outcomes' if c>=120 else 'Overview');check('No universal safety verdict' not in s.frame(),'dashboard replaces generic data wall',s);s.capture(CAP/f'overview-{c}');
  if c>=120:
   for text in ['ESTABLISHED OBSERVATION','Priority findings','Coverage & unknowns','Report next action']:expect(s,text)
  s.send('2');expect(s,'priority: all');s.send('/');expect(s,'Filter:');s.send('lifecycle');submit_filter(s,'lifecycle');expect(s,'Package lifecycle');s.send('\r');expect(s,'Observation:');s.send('j');s.send('j');s.capture(CAP/f'finding-detail-{c}');s.read(.3);before=profile()['location'];s.send('e');expect(s,'Evidence');s.scroll_to('RAW utf8:');check(True,'raw citation address accessible',s);s.scroll_to('HEURISKO_INERT_TEST_ONLY');check(True,'actual inert citation bytes visible',s);s.capture(CAP/f'citation-{c}');s.send('\x1b');expect(s,'Package lifecycle script entry changed');s.read(.3);after=profile()['location'];keys=['section','selectedId','focus','scroll','scrolls','query','pan'];check(all(before.get(k)==after.get(k) for k in keys),'exact finding/filter/pane/scroll restoration',s);s.send('\x1b');s.capture(CAP/f'findings-{c}');s.send('4');expect(s,'Candidates');s.send('v');expect(s,'[Provenance]');s.send('v');expect(s,'[Build]');s.send('5');expect(s,'AI disabled');s.send('6');expect(s,'Scope' if c<80 else 'Coverage');s.capture(CAP/f'coverage-{c}');check(s.quit()==0,'q exits saved complete-scope report',s)
 s=report();s.send('2');expect(s,'priority: all');s.send('/');expect(s,'Filter:');s.send('lifecycle');submit_filter(s,'lifecycle');s.send('\r');s.send('g');expect(s,'Files');s.send('\x1b');expect(s,'Observation');s.send('e');s.scroll_to('HEURISKO_INERT_TEST_ONLY');s.resize(120,35);s.scroll_to('HEURISKO_INERT_TEST_ONLY');s.resize(84,26);s.scroll_to('HEURISKO_INERT_TEST_ONLY');s.resize(55,14);expect(s,'Terminal too small');s.resize(160,40);s.send('\x1b');expect(s,'Observation');s.capture(CAP/'resize-related-return');s.quit()
 # Selection changes, raw diff, source subtab state, focus bars and saved profile.
 s=report();s.send('3');s.send('v');s.send('/');s.send('package.json');submit_filter(s,'package.json');s.send('\r');s.scroll_to('RAW CHANGED SPANS');expect(s,'Viewer line alignment v1');s.send('d');s.capture(CAP/'files-diff-160');s.send('\x1b');s.send('4');s.send('v');s.send('j');s.send('v');s.send('v');s.send('v');expect(s,'[Provenance]');s.send('\x1b[Z');s.send('\x1b[C');s.send('\r');expect(s,'AI');s.send('?');expect(s,'Keyboard');s.send('\x1b');s.send('M');expect(s,'Not configured');expect(s,'Unknown');s.capture(CAP/'monitoring-unavailable');s.quit()
 s=report(120,35,store='integration/part4/receipts/visual-rework/nonexistent-store');s.send('2');s.send('\r');s.send('e');s.scroll_to('METADATA ONLY: MISSING_BLOB');check(True,'historical missing bytes stay metadata-only',s);s.capture(CAP/'missing-bytes');s.send('\x1b');s.quit()
 # Each synthetic state is explicitly labeled; these are renderer failures, not live inference.
 for status in ['disabled','unavailable','failed','rejected','abstained']:
  s=report(120,35,status);expect(s,'SYNTHETIC');s.send('5');s.send('\r');expect(s,'AI state:');s.scroll_to(status);s.send('\x1b');s.send('3');s.send('v');s.send('e');s.scroll_to('RAW base64:' if status=='disabled' else 'RAW utf8:');s.scroll_to('\\u001b');check(b'\x1b]52;' not in s.raw and '\u202e'.encode() not in s.raw,'OSC/ANSI/bidi remains inert',s);s.capture(CAP/('synthetic-'+status));s.send('\x1b');s.quit()
 # Reopening a reader observes report bytes, not a view-local recomputed report.
 raw=(ROOT/'examples/part4/current/local-m1.report.json').read_bytes();check(hashlib.sha256(raw).hexdigest()=='f0c624713467072d1f5b2bf5d521fecfa2748593f6b203936f6532ba98c24df3','original report bytes preserved')
except BaseException:
 for s in sessions:
  if not s.closed:s.capture(CAP/'failure')
 raise
finally:
 for s in sessions:s.cleanup_readonly()
 (CAP/'validation.json').write_text(json.dumps({'scope':'actual product PTY and reference composition checks; no model; macOS arm64','checks':checks,'count':len(checks)},indent=2)+'\n')
print(json.dumps({'passed':len(checks),'receipt':str(CAP.relative_to(ROOT))}))
