import sys,os,pathlib,runpy,json,shutil
repo=pathlib.Path(os.environ['HEURISKO_AUDIT_REPOSITORY']).resolve()
workspace=repo/'.heurisko/parts456-audit-20261101/pty'/os.environ.get('HEURISKO_PTY_WORKSPACE','workspace-v2')
workspace.mkdir(parents=True,exist_ok=True)
for name in ['packages','node_modules']:
 p=workspace/name
 if not p.exists():p.symlink_to(repo/name,target_is_directory=True)
for relative in ['examples/handoff','examples/s2','examples/s3','examples/part4/current']:
 p=workspace/relative;p.parent.mkdir(parents=True,exist_ok=True)
 if not p.exists():shutil.copytree(repo/relative,p)
p=workspace/'examples/part4/user-failures';p.mkdir(parents=True,exist_ok=True)
for source in (repo/'examples/part4/user-failures').iterdir():
 q=p/source.name
 if not q.exists():
  if source.is_dir():shutil.copytree(source,q)
  else:shutil.copy2(source,q)
p=workspace/'.heurisko';p.mkdir(exist_ok=True)
q=p/'manual-part4-test'
if not q.exists():shutil.copytree(repo/'.heurisko/manual-part4-test',q)
(workspace/'integration/part4/receipts/user-failures').mkdir(parents=True,exist_ok=True)
(workspace/'.heurisko-tui-state').mkdir(exist_ok=True)
sys.path.insert(0,str(repo/'packages/tui/tests'))
import pty_session
pty_session.ROOT=workspace
os.chdir(workspace)
script=sys.argv[1]
if script=='--setup':sys.exit(0)
runpy.run_path(str(repo/'packages/tui/tests'/script),run_name='__main__')
