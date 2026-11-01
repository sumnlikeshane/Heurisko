"""Real Part 4 user failures and full product workflows; no target/model execution."""
from pty_session import Session,ROOT,NODE
import pathlib,json,time,hashlib,os,subprocess,uuid
MODE=os.environ.get('HEURISKO_WORKFLOW_MODE','all')
BASE=ROOT/'integration/part4/receipts/user-failures'
CAP=BASE/('workflows-'+str(max([int(p.name.split('-')[-1]) for p in BASE.glob('workflows-*') if p.is_dir()]+[0])+1));CAP.mkdir(parents=True)
OUT=ROOT/'examples/part4/user-failures';OUT.mkdir(parents=True,exist_ok=True)
STORE=OUT/('store-'+str(uuid.uuid4()));STORE.mkdir()
ORIGINAL=ROOT/'.heurisko/manual-part4-test/blobs/dd4fb19136fa91ca1581336c6fbc22b864b86e413eaa9978ece3ee0f08c52a3b'
NEW='7249f8c5d4825550f70bc1ea98652639933d3bbd'
checks=[];sessions=[];reports=[]
def expect(s,text):
 end=time.monotonic()+15
 while ' '.join(text.split()) not in ' '.join(s.frame().replace('│',' ').split()) and time.monotonic()<end:s.read(.1)
 assert ' '.join(text.split()) in ' '.join(s.frame().replace('│',' ').split()),repr(text)+' missing\n'+s.frame()
 checks.append({'check':text,'size':[s.cols,s.rows],'passed':True})
def scroll(s,text):
 s.read(.4)
 for _ in range(100):
  if ' '.join(text.split()) in ' '.join(s.frame().replace('│',' ').split()):return
  s.send('j',.18)
 s.wait(text,.3)
def check(v,name):
 assert v,name
 checks.append({'check':name,'passed':True})
def new(c=160,r=40,p=ORIGINAL,store=ROOT/'.heurisko/manual-part4-test'):
 s=Session(c,r,['tui',str(p),'--store',str(store)]);sessions.append(s);expect(s,'HISTORICAL');s.send('x',.4);return s
def origin(p):
 r=json.loads(p.read_bytes());ref=hashlib.sha256(p.read_bytes()).hexdigest();state=ROOT/'.heurisko-tui-state'/(r['reportId']+'-'+ref+'.json')
 location=json.loads(state.read_text())['location']
 if location['section']==3 and location['subtab']==0:location.setdefault('selectedId','candidate-'+str(location['index']))
 return location
def settle(s,seconds=100):
 end=time.monotonic()+seconds
 while time.monotonic()<end:
  if 'Investigation settled.' in s.frame():return
  if 'cleanup acknowledgment not observable' in s.frame() or 'Start failed:' in s.frame():raise AssertionError(s.frame())
  s.read(.15)
 raise AssertionError('engine did not settle within workflow bound\n'+s.frame())
def save_report(name):
 runs=sorted(STORE.glob('runs/*/*.json'),key=lambda p:p.stat().st_mtime)
 run=json.loads(runs[-1].read_text());blob=STORE/'blobs'/run['reportContentRef'][7:];raw=blob.read_bytes();r=json.loads(raw);p=OUT/(name+'.report.json')
 # Each script invocation has its own attempt names; preserve earlier captures.
 if p.exists():p=OUT/(name+'-'+STORE.name[6:]+'.report.json')
 p.write_bytes(raw);reports.append({'name':name,'path':str(p.relative_to(ROOT)),'store':str(STORE.relative_to(ROOT)),'reportId':r['reportId'],'contentRef':run['reportContentRef'],'outcomes':r['outcomes'],'sourceCandidates':r['bundle']['sourceCandidates']});return p,r
try:
 # All three user-observed screens, actual original report, in every requested width band.
 for c,r in ([(160,40),(140,35),(120,35),(100,28),(84,26),(60,20)] if MODE!='live' else []):
  s=new(c,r);s.send('2',.4);expect(s,'Malhar analysis module not supplied');s.capture(CAP/f'findings-{c}');scroll(s,'Artifact acquisition:');scroll(s,'AI:');scroll(s,'enabling AI');check(True,'unavailable explanation and successes reachable at '+str(c))
  s.send('3',.4);expect(s,'Artifact root/');s.capture(CAP/f'directories-{c}');s.send('m',.4);expect(s,'modified / different');s.send('\r',.5);expect(s,'RAW CHANGED SPANS');expect(s,'SOURCE: raw utf8');s.capture(CAP/f'difference-{c}');s.send('d',.3);expect(s,'RAW CHANGED SPANS');s.send('e',.4);expect(s,'Evidence');expect(s,'RAW utf8:');s.capture(CAP/f'raw-{c}');s.send('\x1b',.4);expect(s,'RAW CHANGED SPANS');s.send('\x1b',.6);expect(s,'Flat /')
  # Search directly finds actual paired manifest; directory view remains separate.
  s.send('/',.3);expect(s,'Filter:');s.send('package.json',.4);expect(s,'Filter: package.json');s.send('\r',.4);s.send('\r',.6);expect(s,'RAW CHANGED SPANS');s.capture(CAP/f'manifest-diff-{c}');s.send('\x1b',.3)
  s.send('4',.4);s.send('\r',.4);expect(s,'Source >');expect(s,'Association ambiguous');scroll(s,'artifact 1.1.1; selected source 1.1.0');s.capture(CAP/f'source-conclusion-{c}');scroll(s,'(repository root)');scroll(s,'New investigation with this target:');s.capture(CAP/f'source-action-{c}')
  s.read(1);before=origin(ORIGINAL);s.send('e',.5);expect(s,'Evidence');expect(s,'RAW utf8:');scroll(s,'"1.1.1"');s.send('s',.5);scroll(s,'"1.1.0"');s.capture(CAP/f'source-version-bytes-{c}');s.send('\x1b',.4);expect(s,'Source >');s.read(1);after=origin(ORIGINAL);checks.append({'check':'source Back state oracle','before':before,'after':after,'size':[c,r]});check(all(before.get(k)==after.get(k) for k in ['section','selectedId','focus','scroll','scrolls','query','pan','citation']),'exact source inspection Back '+str(c));s.send('\x1b',.3)
  s.send('v',.3);expect(s,'[Provenance]');s.send('v',.3);expect(s,'[Build]');s.send('v',.3);expect(s,'[Candidates]');s.capture(CAP/f'source-return-{c}')
  s.resize(55,14);expect(s,'Terminal too small');s.resize(c,r);expect(s,'[Candidates]');s.quit()
 if MODE!='screens':
  # Source action -> edit different immutable target -> Review -> real fresh npm -> persisted report.
  s=new(160,40,ORIGINAL,STORE);s.send('4',.4);s.send('n',.4);expect(s,'Package name');s.send('\t');s.send('\t');s.send('\t');expect(s,'Full commit  [editing]');s.send('\x15');s.send(NEW);s.send('\r',.4);expect(s,'Review exact target');expect(s,'Start investigation');s.capture(CAP/'npm-review');s.send('\r',.05);expect(s,'Live investigation');s.capture(CAP/'npm-progress');settle(s);s.capture(CAP/'npm-complete');p,r=save_report('npm-release-candidate');check(r['outcomes']['artifactIntegrity']=='matched','fresh npm integrity matched');check(r['analysis']['aiState']['status']=='disabled','fresh npm AI disabled');check(r['analysis']['stages'][0]['errors'][0]['code']=='ANALYSIS_MODULE_UNAVAILABLE','fresh product keeps missing deterministic module explicit');check(any(c['commit']==NEW and c.get('sourceSnapshotSha256') for c in r['bundle']['sourceCandidates']),'release candidate actually acquired');check(r['outcomes']['sourceAssociation']=='ambiguous','registry gitHead conflict retained');s.send('2',.4);expect(s,'Malhar analysis module not supplied');s.send('3',.4);s.send('m',.4);s.send('\r',.4);expect(s,'RAW CHANGED SPANS');s.capture(CAP/'fresh-npm-diff');s.send('\x1b');s.send('4',.4);s.send('n',.3);expect(s,'Package name');s.send('\x1b',.3);expect(s,'[Candidates]');s.send('I',.5);expect(s,'Investigations');s.send('\r',.5);expect(s,'HISTORICAL');s.capture(CAP/'history-reopen');s.quit()
  # Retained local mutation, new product run, same separately acquired source bytes.
  source=next(c for c in r['bundle']['sourceCandidates'] if c['commit']==NEW)['sourceSnapshotSha256'];source_path=STORE/'blobs'/source[7:]
  s=Session(120,35,['--store',str(STORE)]);sessions.append(s);expect(s,'HEURISKO');s.send('\r',.3);s.send('\x14');expect(s,'[ Local archive ]');s.send('examples/s2/current/inputs/picocolors-1.1.1.local-inert-mutation.tgz');s.send('\t');s.send('https://github.com/alexeyraspopov/picocolors');s.send('\t');s.send(NEW);s.send('\t');s.send('\t');s.send(str(source_path.relative_to(ROOT)));s.send('\r',.3);expect(s,'Review exact target');expect(s,'Local snapshot retained');s.capture(CAP/'local-review');s.send('\r',.05);expect(s,'Live investigation');settle(s);s.capture(CAP/'local-complete');lp,lr=save_report('local-inert-mutation');check(lr['bundle']['artifact']['origin']=='local','mutation remains local input');check(lr['outcomes']['artifactIntegrity']=='not_checked','mutation inherits no registry match');s.send('3',.4);s.send('/',.3);expect(s,'Filter:');s.send('package.json',.4);expect(s,'Filter: package.json');s.send('\r',.4);s.send('\r',.6);expect(s,'RAW CHANGED SPANS');scroll(s,'HEURISKO_INERT_TEST_ONLY');s.capture(CAP/'local-mutation-difference');s.send('e',.5);scroll(s,'HEURISKO_INERT_TEST_ONLY');s.capture(CAP/'local-mutation-raw');s.quit()
 # Actual stored report with missing evidence directory never invents version values or text.
 s=new(100,28,ORIGINAL,CAP/'missing-store');s.send('4',.3);s.send('\r',.3);scroll(s,'Claim bytes unavailable:');s.capture(CAP/'source-missing-evidence');s.send('e',.4);scroll(s,'METADATA ONLY: MISSING_BLOB');s.capture(CAP/'raw-missing-evidence');s.quit()
 for pth in [ORIGINAL]+([p,lp] if MODE!='screens' else []):
  cp=subprocess.run([NODE,'packages/cli/dist/index.js','tui',str(pth),'--store',str(STORE if pth!=ORIGINAL else ROOT/'.heurisko/manual-part4-test')],capture_output=True,text=True,timeout=20)
  check(cp.returncode==2 and '\x1b' not in cp.stdout,'non-TTY report summary exit 2 / no control stream '+pth.name)
 check(hashlib.sha256(ORIGINAL.read_bytes()).hexdigest()==ORIGINAL.name,'original reproduction bytes unchanged')
except BaseException:
 for s in sessions:
  if not s.closed:s.capture(CAP/'failure')
 raise
finally:
 for s in sessions:
  if not s.closed:
   if 'Live investigation' in s.frame():
    s.send('\x03',.1);deadline=time.monotonic()+80
    while time.monotonic()<deadline:
     pid,status=os.waitpid(s.pid,os.WNOHANG)
     if pid:s.closed=True;os.close(s.fd);break
     s.read(.1)
    if not s.closed:raise AssertionError('Pending engine owner preserved; inspect retained store before recovery')
   else:s.cleanup_readonly()
 (CAP/'validation.json').write_text(json.dumps({'checks':checks,'count':len(checks),'reports':reports,'store':str(STORE.relative_to(ROOT)),'noTargetOrModelExecution':True},indent=2)+'\n')
print(json.dumps({'passed':len(checks),'receipt':str(CAP.relative_to(ROOT)),'store':str(STORE.relative_to(ROOT))}))
