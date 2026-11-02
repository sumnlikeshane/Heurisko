#!/usr/bin/env python3
"""Portable source-bound closure checks. Native admission is mandatory by default.

Run from an extracted supported source package after pinned dependency setup.
Fresh destinations only; failures retained and independent checks continue.
"""
import argparse,datetime,hashlib,json,os,pathlib,platform,resource,shutil,subprocess,sys,time
ROOT=pathlib.Path(__file__).resolve().parents[1]
def local_docker_command(system=None,home=None):
 system=system or platform.system();home=home or pathlib.Path.home()
 if system not in ('Linux','Darwin'):raise ValueError('PARSER_PLATFORM_UNSUPPORTED')
 socket=str(pathlib.Path(home)/'.docker/run/docker.sock') if system=='Darwin' else '/var/run/docker.sock'
 return ['docker','--host','unix://'+socket,'info','--format','{{json .}}']
def native_admitted(system,machine,node,engine):
 return system=='Linux' and machine=='x86_64' and node.get('platform')=='linux' and node.get('arch')=='x64' and engine.get('OSType')=='linux' and engine.get('Architecture') in ('x86_64','amd64') and 'Docker Desktop' not in engine.get('OperatingSystem','')
def tools_pinned(node,pnpm,python,runner_version):
 return node.get('node')=='v22.23.4' and pnpm=='10.14.0' and python.startswith('Python 3.13.') and runner_version[:2]==(3,13)
def digest(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('out',type=pathlib.Path);p.add_argument('--manifest',required=True,type=pathlib.Path);p.add_argument('--local',action='store_true',help='Explicit non-native preparation rehearsal; never native acceptance');args=p.parse_args();out=args.out.resolve();out.mkdir(exist_ok=False,parents=False)
 def observe(cmd,env=None):
  try:r=subprocess.run(cmd,cwd=ROOT,env=env,capture_output=True,text=True,timeout=15);return {'command':cmd,'exit':r.returncode,'stdout':r.stdout.strip(),'stderr':r.stderr.strip()}
  except (OSError,subprocess.TimeoutExpired) as e:return {'command':cmd,'exit':None,'error':type(e).__name__}
 manifest=json.loads(args.manifest.read_text());bad=[n for n,h in manifest['files'].items() if not (ROOT/n).is_file() or digest(ROOT/n)!=h]
 # Match parser-runtime.localDockerArgs exactly. Ambient Docker hosts/contexts
 # must not admit a remote engine while the actual checks use the local socket.
 docker_env={k:os.environ[k] for k in ('PATH','HOME') if k in os.environ};docker_env['LANG']='C'
 guards={'uname':observe(['uname','-a']),'node':observe(['node','-p',"JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,openssl:process.versions.openssl})"]),'pnpm':observe(['pnpm','--version']),'python':observe([str(ROOT/'.venv/bin/python'),'--version']),'docker':observe(local_docker_command(),docker_env)}
 try:n=json.loads(guards['node']['stdout']);d=json.loads(guards['docker']['stdout'])
 except (ValueError,KeyError):n={};d={}
 native=all(guards[k].get('exit')==0 for k in ('uname','node','docker')) and native_admitted(platform.system(),platform.machine(),n,d)
 pinned=all(guards[k].get('exit')==0 for k in ('node','pnpm','python')) and tools_pinned(n,guards['pnpm'].get('stdout',''),guards['python'].get('stdout',''),sys.version_info)
 admission={'version':'heurisko-native-closure-admission-v1','capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'mode':'local-rehearsal' if args.local else 'native-required','nativeHostAndEngine':native,'pinnedTools':pinned,'manifestSha256':digest(args.manifest),'sourceMismatches':bad,'guards':guards,'hostResources':{'cpus':os.cpu_count(),'disk':shutil.disk_usage(ROOT)._asdict(),'platform':platform.platform()},'boundary':'Host uname, host Node x64 and engine x86_64 required together. Container platform alone or emulation is not native proof.'}
 (out/'admission.json').write_text(json.dumps(admission,indent=2)+'\n')
 if bad or not pinned or (not native and not args.local):
  (out/'summary.json').write_text(json.dumps({'passed':False,'status':'not_admitted','reason':'SOURCE_MISMATCH' if bad else 'PINNED_RUNTIME_UNAVAILABLE' if not pinned else 'NATIVE_LINUX_AMD64_UNAVAILABLE','checksExecuted':0,'nativeAccepted':False},indent=2)+'\n');return 2
 commands=[('typecheck',['pnpm','run','typecheck']),('contracts',['pnpm','run','test:contracts']),('scanner-tests',['node','--test','scripts/tests/credential-scan.test.mjs']),('core',['node','--test','--test-concurrency=1',*[str(p.relative_to(ROOT)) for p in sorted((ROOT/'packages/core/tests').glob('*.test.mjs'))]]),('parser-boundary',['node','scripts/check-parser-boundary.mjs',str(out/'parser-boundary.json')]),('production-worker',['node','scripts/test-phase2-trust.mjs',str(out/'production-worker')]),('real-application',['node','scripts/verify-phase2-integration.mjs',str(out/'real-application'),'--source-unavailable']),('controlled-generate',['node','scripts/generate-controlled-signatures.mjs',str(out/'controlled-fixtures')]),('controlled-prepare',['node','scripts/prepare-controlled-runtime.mjs',str(out/'controlled-fixtures'),str(out/'controlled-runtime')]),('controlled-worker',['node','scripts/test-controlled-signatures.mjs',str(out/'controlled-fixtures'),str(out/'controlled-runtime'),str(out/'controlled-worker')]),('controlled-application',['node','scripts/verify-controlled-integration.mjs',str(out/'controlled-fixtures'),str(out/'controlled-runtime'),str(out/'controlled-application')]),('readers-tui',['node','--test','integration/part4/tests/readiness.test.mjs',*[str(p.relative_to(ROOT)) for p in sorted((ROOT/'packages/tui/tests').glob('*.test.mjs'))]]),('web',['pnpm','--filter','@heurisko/web','test']),('historical-s3',['node','scripts/verify-s3-capture.mjs','examples/s3/current','--historical']),('historical-audit',['node','scripts/verify-s3-capture.mjs','examples/audit-fixes/current','--historical']),('historical-handoff',['node','scripts/verify-s3-capture.mjs','examples/handoff/current','--historical']),('source-integrity',[sys.executable,'scripts/verify-source-package.py',str(args.manifest)])]
 commands.insert(0,('runner-guards',[sys.executable,'scripts/tests/test_closure_native.py']))
 rows=[];env={**os.environ,'PATH':str(ROOT/'.venv/bin')+os.pathsep+os.environ['PATH']}
 build_dependent={'core','parser-boundary','production-worker','real-application','controlled-prepare','controlled-worker','controlled-application','readers-tui','web','historical-s3','historical-audit','historical-handoff'}
 for name,cmd in commands:
  prerequisites=(['typecheck'] if name in build_dependent else [])+(['controlled-generate'] if name.startswith('controlled-') and name!='controlled-generate' else [])+(['controlled-prepare'] if name in {'controlled-worker','controlled-application'} else [])
  blocked=[x for x in prerequisites if any(r['name']==x and r['exit']!=0 for r in rows)]
  if blocked:
   rows.append({'name':name,'command':cmd,'exit':None,'error':'DEPENDENCY_FAILED','blockedBy':blocked,'executed':False});(out/'commands.json').write_text(json.dumps(rows,indent=2)+'\n');print(name,'BLOCKED',','.join(blocked),flush=True);continue
  before=resource.getrusage(resource.RUSAGE_CHILDREN);start=time.monotonic()
  with (out/(name+'.stdout.log')).open('xb') as stdout,(out/(name+'.stderr.log')).open('xb') as stderr:
   try:r=subprocess.run(['/usr/bin/time','-v',*cmd] if platform.system()=='Linux' else cmd,cwd=ROOT,env=env,stdout=stdout,stderr=stderr,timeout=3600);code=r.returncode;reason=None
   except (OSError,subprocess.TimeoutExpired) as e:code=None;reason=type(e).__name__
  after=resource.getrusage(resource.RUSAGE_CHILDREN);row={'name':name,'command':cmd,'executed':True,'exit':code,'error':reason,'seconds':round(time.monotonic()-start,3),'resource':{'userSeconds':after.ru_utime-before.ru_utime,'systemSeconds':after.ru_stime-before.ru_stime,'maxRss':after.ru_maxrss,'scope':'Cumulative child high-water RSS, Linux KiB/macOS bytes; command-specific Linux time -v also retained. Not Docker container peak.'}};rows.append(row);(out/'commands.json').write_text(json.dumps(rows,indent=2)+'\n');print(name,code,flush=True)
 changed=[n for n,h in manifest['files'].items() if not (ROOT/n).is_file() or digest(ROOT/n)!=h]
 summary={'passed':all(r['exit']==0 for r in rows) and not changed,'nativeAccepted':native and not args.local and all(r['exit']==0 for r in rows) and not changed,'mode':admission['mode'],'checksExecuted':sum(r.get('executed',True) for r in rows),'checksBlocked':sum(not r.get('executed',True) for r in rows),'sourceChanged':changed,'failures':[r['name'] for r in rows if r['exit']!=0],'limitations':['No CI head/deployment/publication or GUI/AT claim.','Current draft.2 admits dsse/0.0.1 only. Legacy/controlled formats and population accuracy remain distinct from current production coverage.']};(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');return 0 if summary['passed'] else 1
if __name__=='__main__':raise SystemExit(main())
