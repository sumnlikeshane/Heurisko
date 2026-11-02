"""Real PTY: typed policy -> immutable review -> actual engine -> saved outcomes."""
from pty_session import Session, ROOT
import pty_session
from pathlib import Path
import os, sys, json, hashlib, time, signal
repository=ROOT
catalog_path=Path(os.environ.get('HEURISKO_TRUST_CONFIG',''))
if not catalog_path.is_file():
 raise RuntimeError('HEURISKO_TRUST_CONFIG must name the retained is-number fixture catalog')
catalog_bytes=catalog_path.read_bytes();catalog=json.loads(catalog_bytes)
optional=catalog.get('policies',{}).get('optional',{})
if optional.get('provenance')!='optional' or optional.get('expect',{}).get('package')!='is-number' or optional.get('expect',{}).get('version')!='7.0.0':
 raise RuntimeError('The optional policy must belong to the is-number 7.0.0 fixture')
out=Path(sys.argv[1]).resolve();out.mkdir(exist_ok=False)
(out/'environment.json').write_text(json.dumps({'python':sys.version,'interpreter':sys.executable,'catalogSha256':hashlib.sha256(catalog_bytes).hexdigest(),'node':pty_session.NODE},indent=2)+'\n')
workspace=out/'workspace';workspace.mkdir();(workspace/'packages').symlink_to(repository/'packages',target_is_directory=True)
pty_session.ROOT=workspace
store=workspace/'store';session=Session(160,44,['--store',str(store)])
live=False;settled=False;checks=[]
try:
 session.wait('New investigation');session.read(.7);session.send('?');session.wait('Keyboard help');session.send('\x1b');session.send('\r');session.wait('Package name')
 session.send('is-number');session.send('\t');session.send('7.0.0')
 for _ in range(4):session.send('\t',.2)
 session.wait('Requested policy (optional)  [editing]')
 session.send('optionalq');session.wait('optionalq');session.send('\x7f');session.wait('optional')
 checks.append('Policy field owns ordinary q input; backspace edits without quitting')
 session.send('\r');session.wait('Review exact target');session.scroll_to('Policy key');session.wait('optional');session.capture(out/'review-wide')
 checks.append('Review shows the exact requested key before Start')
 session.resize(90,30);session.scroll_to('Policy key');session.wait('optional');session.capture(out/'review-narrow')
 checks.append('90-column review keeps the selected policy inspectable')
 session.send('\x1b');session.wait('Requested policy (optional)');session.wait('optional');session.resize(160,44);session.send('\r');session.wait('Review exact target');session.send('\r');live=True
 session.wait('Investigation settled.',seconds=90);settled=True;session.capture(out/'settled')
 checks.append('Actual shared engine settles the requested optional policy')
 code=session.quit();assert code==0,code
 runs=list((store/'runs').glob('*/*.json'));assert len(runs)==1
 record=json.loads(runs[0].read_bytes());ref=record['reportContentRef'];assert ref.startswith('sha256:') and len(ref)==71
 raw=(store/'blobs'/ref[7:]).read_bytes();assert 'sha256:'+hashlib.sha256(raw).hexdigest()==ref
 report=json.loads(raw);assert report['bundle']['input']['analysisOptions']['trustPolicyRef']=='optional';assert report['outcomes']['policyResult']=='pass';assert report['outcomes']['provenancePolicy']=='absent';assert report['outcomes']['analysisCompleteness']=='complete'
 checks.append('Saved original report preserves requested key, absent provenance, policy pass and genuine exit 0')
 (out/'validation.json').write_text(json.dumps({'passed':True,'checks':checks,'exit':code,'reportContentRef':ref,'outcomes':report['outcomes'],'columns':[160,90],'rows':[44,30],'scope':'Actual PTY new investigation with public npm is-number 7.0.0, trusted fixture catalog and real evaluator. No independent human or browser/AT claim.'},indent=2)+'\n')
 print(json.dumps({'passed':True,'checks':len(checks),'exit':code}))
except BaseException as error:
 session.capture(out/'failure');(out/'failure.json').write_text(json.dumps({'passed':False,'error':str(error),'liveStarted':live,'settled':settled},indent=2)+'\n');raise
finally:
 if not session.closed:
  if not live or settled:session.cleanup_readonly()
  else:
   session.send('\x03');end=time.monotonic()+60
   while time.monotonic()<end:
    pid,status=os.waitpid(session.pid,os.WNOHANG)
    if pid:session.closed=True;os.close(session.fd);break
    session.read(.1)
   if not session.closed:(out/'unsettled-process.json').write_text(json.dumps({'pid':session.pid,'resolution':'Cancellation requested; preserve process/store/locks pending exact settlement. No forced kill or guessed recovery.'})+'\n')
