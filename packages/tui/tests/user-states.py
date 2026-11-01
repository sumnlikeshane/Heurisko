"""Unavailable AI/error/binary evidence and current explicit M1 citation acceptance."""
from pty_session import Session,ROOT
import pathlib,json,time,hashlib,sys
BASE=ROOT/'integration/part4/receipts/user-failures';CAP=BASE/('states-'+str(max([int(p.name.split('-')[-1]) for p in BASE.glob('states-*') if p.is_dir()]+[0])+1));CAP.mkdir()
checks=[];sessions=[]
def expect(s,text):
 end=time.monotonic()+12
 while ' '.join(text.split()) not in ' '.join(s.frame().replace('│',' ').split()) and time.monotonic()<end:s.read(.1)
 assert ' '.join(text.split()) in ' '.join(s.frame().replace('│',' ').split()),text+'\n'+s.frame()
 checks.append({'check':text,'size':[s.cols,s.rows],'passed':True})
def scroll(s,text):
 s.read(.3)
 for _ in range(120):
  if ' '.join(text.split()) in ' '.join(s.frame().replace('│',' ').split()):return
  s.send('j',.12)
 raise AssertionError(text+'\n'+s.frame())
def new(c,r,p,store):
 s=Session(c,r,['tui',p,'--store',store]);sessions.append(s);expect(s,'HISTORICAL');s.send('x',.3);return s
def state(path):
 p=ROOT/path;r=json.loads(p.read_bytes());return json.loads((ROOT/'.heurisko-tui-state'/(r['reportId']+'-'+hashlib.sha256(p.read_bytes()).hexdigest()+'.json')).read_text())['location']
def scroll_state(s,p,value):
 end=time.monotonic()+10
 while time.monotonic()<end:
  current=state(p)
  if current['scroll']==value:return current
  s.read(.1)
 raise AssertionError('Expected persisted inspection scroll '+str(value)+'; '+str(state(p)))
try:
 for status in ['disabled','unavailable','failed','rejected','abstained']:
  s=new(120,35,'.heurisko/part4-ui-fixtures/'+status+'.report.json','.heurisko/part4-ui-fixtures/store');expect(s,'SYNTHETIC');s.send('5',.3);s.send('\r',.3);expect(s,'AI state:');scroll(s,status);s.capture(CAP/('ai-'+status));s.send('\x1b',.3);s.send('3',.3);s.send('v',.3);s.send('e',.4);expect(s,'RAW base64:' if status=='disabled' else 'RAW utf8:')
  if status!='disabled':scroll(s,'\\u001b');assert b'\x1b]52;' not in s.raw and '\u202e'.encode() not in s.raw
  s.capture(CAP/('inert-bytes-'+status));s.quit()
 # Current engine-bound report is an explicit validation injection, never default product adoption.
 p='examples/part4/user-failures/local-e8b8116-validation.report.json';store='examples/part4/user-failures/module-validation-store'
 for c,r in [(160,40),(120,35),(84,26),(60,20)]:
  s=new(c,r,p,store);s.send('2',.3);s.send('/',.3);expect(s,'Filter:');s.send('lifecycle',.3);s.send('\r',.3);expect(s,'Package lifecycle');s.send('\r',.4);expect(s,'Findings >');expect(s,'Observation:');s.send('j',.2);before=scroll_state(s,p,1);s.send('e',.4);expect(s,'RAW utf8:');scroll(s,'HEURISKO_INERT_TEST_ONLY');s.capture(CAP/f'current-module-citation-{c}');s.resize(55,14);expect(s,'Terminal too small');s.resize(c,r);s.send('\x1b',.4);expect(s,'Findings >');s.read(1);after=state(p);checks.append({'check':'finding Back state oracle','before':before,'after':after,'size':[c,r]});assert all(before.get(k)==after.get(k) for k in ['section','selectedId','focus','scroll','scrolls','query','pan','citation']);checks.append({'check':'current-module exact evidence Back at '+str(c),'passed':True});s.capture(CAP/f'current-module-return-{c}');s.quit()
 s=Session(100,28,[]);sessions.append(s);expect(s,'HEURISKO');s.send('o');s.send('/does/not/exist');s.send('\r',.3);expect(s,'Open failed:');s.capture(CAP/'open-error');s.send('\x1b');s.quit()
finally:
 for s in sessions:
  if not s.closed:s.capture(CAP/'failure');s.cleanup_readonly()
 (CAP/'validation.json').write_text(json.dumps({'scope':'actual PTY; synthetic AI/binary states labeled; current explicit model-off module validation report','checks':checks,'count':len(checks)},indent=2)+'\n')
print(json.dumps({'passed':len(checks),'receipt':str(CAP.relative_to(ROOT))}))
