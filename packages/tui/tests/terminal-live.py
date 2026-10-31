"""Actual TUI review/snapshot/progress/hot-cancel flow with the existing restricted core."""
from pty_session import Session,ROOT
import os,time,json,uuid,hashlib,pathlib,subprocess
base=ROOT/'integration/part4/receipts/visual-rework';cap=base/('live-'+str(len(list(base.glob('live-*')))+1));cap.mkdir(parents=True)
store=ROOT/'.heurisko'/('tui-visual-live-'+str(uuid.uuid4()));source_input=ROOT/'examples/s2/current/inputs/picocolors-1.1.1.local-inert-mutation.tgz';input_copy=store.parent/(store.name+'-input.tgz');input_copy.write_bytes(source_input.read_bytes());digest='sha256:'+hashlib.sha256(input_copy.read_bytes()).hexdigest()
s=Session(160,40,['--store',str(store),'--no-color']);receipt={'scope':'Actual product keyboard and restricted core; retained inert local bytes, no target code/model/network','passed':False}
try:
 s.wait('HEURISKO');s.send('\r');s.wait('Package name');s.send('\x14');s.wait('[ Local archive ]');s.send(str(input_copy.relative_to(ROOT)));s.send('\t');s.send('https://github.com/alexeyraspopov/picocolors');s.send('\t');s.send('6f0a4638348ed20633d623ee973f9c9a96f65104');s.send('\t');s.send('\t');s.send('examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz');s.send('\r',.025);s.capture(cap/'retaining-target');s.wait('Review exact target');s.wait('Start investigation');s.capture(cap/'review');input_copy.write_bytes(b'AUTHORED_INERT_CHANGE_AFTER_REVIEW');s.send('\r',.025);s.wait('Live investigation');s.wait('indeterminate');s.capture(cap/'live-progress');first=[l for l in s.frame().splitlines() if 'indeterminate' in l];s.read(.3);second=[l for l in s.frame().splitlines() if 'indeterminate' in l];s.capture(cap/'live-progress-next');s.resize(120,35);s.wait('indeterminate');s.capture(cap/'live-medium');s.resize(84,26);s.wait('indeterminate');s.capture(cap/'live-narrow');s.send('\t');s.wait('diagnostics');s.capture(cap/'live-narrow-diagnostics');s.resize(55,14);s.wait('Terminal too small');s.capture(cap/'live-short');s.resize(160,40);s.wait('indeterminate');s.send('\x03',.025)
 deadline=time.monotonic()+80;exit_status=None
 while time.monotonic()<deadline:
  pid,status=os.waitpid(s.pid,os.WNOHANG)
  if pid:exit_status=os.waitstatus_to_exitcode(status);s.closed=True;break
  s.read(.1)
 assert exit_status is not None,'Preserve pending process/store; no forced parser teardown'
 assert b'indeterminate' in s.raw and b'Cancellation requested' in s.raw,'Actual progress and cancel request must be visible'
 label=hashlib.sha256(str(store).encode()).hexdigest();host='unix://'+str(pathlib.Path.home()/'.docker/run/docker.sock');query=subprocess.run(['docker','--host',host,'ps','-a','--filter','label=heurisko.store='+label,'--format','{{.ID}}'],capture_output=True,text=True,timeout=10);assert query.returncode==0 and not query.stdout.strip(),query.stderr
 assert not (store/'.parser-lock').exists() and not (store/'.write-lock').exists();assert not list((store/'scratch').glob('parser-*'))
 runs=list((store/'runs').glob('*/*.json'));assert runs,'Expected usable retained canceled report';run=json.loads(runs[0].read_text());report=json.loads((store/'blobs'/run['reportContentRef'][7:]).read_text());assert report['bundle']['artifact']['observedSha256']==digest
 receipt.update(passed=True,exitCode=exit_status,progressVisible=True,progressMode='indeterminate: engine did not supply a unit total',animationObserved=bool(first and second and first!=second),stageFactsVisible=True,liveResizeBands=[160,120,84,55,160],narrowDiagnosticsAccessible=True,cancelRequestVisible=True,engineSettlementObserved=True,exactStoreLabelHasNoContainers=True,locksAbsent=True,spoolEmpty=True,reviewedSnapshotUsedAfterOriginalChanged=True,reportId=report['reportId'],storeRetained=True,sourceAndModelExecution=False)
 s.capture(cap/'settled')
except BaseException:
 s.capture(cap/'failure')
 if not s.closed:s.send('\x03',.1)
 raise
finally:
 (cap/'validation.json').write_text(json.dumps(receipt,indent=2)+'\n')
 if s.closed:os.close(s.fd)
print(json.dumps(receipt))
