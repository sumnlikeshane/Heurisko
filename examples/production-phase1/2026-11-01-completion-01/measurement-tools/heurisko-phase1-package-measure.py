from pathlib import Path
import subprocess,hashlib,json,tarfile,time,os
root=Path.cwd();receipt=root/'examples/production-phase1/2026-11-01-completion-01';scratch=root/'.heurisko/phase1-distribution-01';scratch.mkdir(exist_ok=False)
names=subprocess.check_output(['git','ls-files','--cached','--others','--exclude-standard','-z']).decode().split('\0')
files=[]
start=time.monotonic()
with tarfile.open(scratch/'source-candidate.tar.gz','w:gz',compresslevel=6) as tar:
 for name in sorted(set(names)):
  p=root/name
  if not p.is_file() or p.is_symlink():continue
  b=p.read_bytes();files.append({'path':name,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()});tar.add(p,arcname=name,recursive=False)
archive=scratch/'source-candidate.tar.gz'
result={'scope':'Local quarantine source-checkout candidate: present tracked/candidate regular files including dirty overlays, rights-unresolved organizer files and retained evidence; excludes ignored dependencies/builds/Git state. Not cleared for redistribution.','files':len(files),'expandedRegularBytes':sum(x['bytes'] for x in files),'compressedBytes':archive.stat().st_size,'sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'seconds':time.monotonic()-start,'localArchive':str(archive.relative_to(root)),'members':files,'builtDirectories':[],'cases':[]}
for p in sorted(root.glob('packages/*/dist'))+list(root.glob('apps/web/dist')):
 regular=[f for f in p.rglob('*') if f.is_file() and not f.is_symlink()];result['builtDirectories'].append({'path':str(p.relative_to(root)),'files':len(regular),'bytes':sum(f.stat().st_size for f in regular)})
for p in sorted((receipt/'foundation').glob('*/report.json')):
 d=json.loads(p.read_text());store=p.parent/'store';blobs=[f for f in (store/'blobs').iterdir() if f.is_file()];result['cases'].append({'id':p.parent.name,'reportBytes':p.stat().st_size,'storeBlobFiles':len(blobs),'storeBlobBytes':sum(f.stat().st_size for f in blobs),'archiveBytes':[(f.name,f.stat().st_size) for f in (receipt/'foundation'/(p.parent.name+'-inputs')).glob('*.tgz')],'rawCoverageComplete':d['bundle']['coverage']['complete']})
(receipt/'distribution.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k not in ['members','cases']}))
