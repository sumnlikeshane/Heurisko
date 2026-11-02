#!/usr/bin/env python3
"""Fresh complete supported source/test/docs package; originals and history untouched.

Includes required historical test inputs under their matching notices. Excludes
external event documents, images and installed/binary runtimes; no Git history.
"""
import hashlib,json,pathlib,subprocess,sys,tarfile,stat,os
root=pathlib.Path(__file__).resolve().parents[1];out=pathlib.Path(sys.argv[1]).resolve()
if out.is_relative_to(root) and not out.is_relative_to(root/'.heurisko'):raise ValueError('Use private .heurisko or external fresh output; no self-including evidence')
out.parent.mkdir(parents=True,exist_ok=True);out.mkdir(exist_ok=False)
paths=set(subprocess.check_output(['git','ls-files','-co','--exclude-standard','-z'],cwd=root).decode().split('\0'))-{''}
# These exact corpora support current core, CLI, shared-reader/TUI/web and
# historical parity tests. Each includes original notices and immutable blobs.
corpora=['examples/s2/current/','examples/s3/current/','examples/handoff/current/','examples/audit-fixes/current/','examples/p04/','examples/part4/user-failures/','examples/final-hour/20261101-053912/integrated-55240e9/']
real='examples/production-phase2/2026-11-02-local-01/q4-review02/'
implementation='examples/production-phase2/2026-11-02-implementation-02/'
controlled='examples/production-phase2/2026-11-02-closure-implementation-01/controlled-fixtures-02/'
strict_controlled='examples/production-phase2/2026-11-02-closure-implementation-01/controlled-fixtures-03-strict-conflict/'
required_prefixes=corpora+['experiments/rag/datasets/real/setuptools-60.0.0/',controlled,strict_controlled,real+'real-npm/']
required_files={'examples/production-phase2/2026-11-02-closure-implementation-01/controlled-fixtures-02-generator.mjs',real+'verify-4.1.2.tgz',real+'core-4.0.1.tgz',implementation+'authenticated-snapshot.json',implementation+'trust-bootstrap/historical-timestamp.json',*[implementation+'npm-fixtures/rollup-4.52.4/'+n for n in ('metadata.json','attestations.json','artifact.tgz')]}
source_roots={'apps','packages','integration','scripts','docs','.github'}
root_files={'.dockerignore','.gitattributes','.gitignore','.nvmrc','AGENTS.md','Dockerfile','Dockerfile.render','HACKATHON.md','HEURISKO_COMPLETE_GUIDE.md','LICENSE','NOTICE','PRODUCTION_MASTER_ROADMAP.md','README.md','SECURITY.md','SOURCE_FIXTURE_NOTICES.txt','SOURCE_PACKAGE.md','THIRD_PARTY_NOTICES.txt','package.json','pnpm-lock.yaml','pnpm-workspace.yaml','render.yaml','requirements-contracts.txt'}
blocked_extensions={'.pdf','.docx','.wasm','.node','.png','.jpg','.jpeg','.gif','.ttf','.woff','.woff2','.dylib','.so','.exe'}
files={};excluded=[];reasons={}
def hashfile(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
for name in sorted(paths):
 p=root/name;parts=p.parts;reason=None
 try:info=p.lstat()
 except FileNotFoundError:excluded.append({'path':name,'reason':'MISSING_CANDIDATE','sha256':None});continue
 required=name in required_files or any(name.startswith(prefix) for prefix in required_prefixes)
 source=name.split('/')[0] in source_roots or name in root_files
 if p.is_symlink() or not stat.S_ISREG(info.st_mode):reason='NONREGULAR_NOT_FOLLOWED'
 elif any(x in pathlib.PurePosixPath(name).parts for x in ['node_modules','.venv','dist','__pycache__']):reason='INSTALLED_OR_GENERATED_RUNTIME'
 elif name.startswith('docs/Governing/'):reason='EXTERNAL_EVENT_ATTACHMENT_NOT_SELECTED'
 elif p.suffix.lower() in blocked_extensions:reason='UNSELECTED_IMAGE_OR_BINARY'
 elif not (source or required):reason='HISTORICAL_OR_OTHER_EVIDENCE_NOT_NEEDED_FOR_SUPPORTED_TESTS'
 elif not required and p.suffix.lower() in {'.tgz','.gz','.zip','.tar','.bin','.patch'}:reason='UNSELECTED_ARCHIVE_OR_PATCH'
 if reason:
  excluded.append({'path':name,'reason':reason,'sha256':hashfile(p) if stat.S_ISREG(info.st_mode) else hashlib.sha256(os.readlink(p).encode()).hexdigest() if p.is_symlink() else None,'hashBasis':'regular-file-bytes' if stat.S_ISREG(info.st_mode) else 'symlink-target-text-no-follow' if p.is_symlink() else 'nonregular-no-readable-bytes'});reasons[reason]=reasons.get(reason,0)+1
 else:files[name]=hashfile(p)
# Never accidentally export known compiled/installed blobs with source claims.
assert all(not n.startswith('docs/Governing/') and pathlib.Path(n).suffix.lower() not in blocked_extensions for n in files)
for n in ['LICENSE','NOTICE','THIRD_PARTY_NOTICES.txt','SOURCE_PACKAGE.md','SOURCE_FIXTURE_NOTICES.txt','docs/production-phase1/source-fixture-rights.json','packages/core/VERIFIER_THIRD_PARTY_NOTICES.txt','packages/contracts/tests/fixtures/F0/report.json','scripts/run-closure-validation.py',controlled+'manifest.json',strict_controlled+'manifest.json',*required_files]:assert n in files,n
manifest={'version':'heurisko-source-selection-v2','scope':'Complete supported local source, tests and authored documentation with specified immutable replay corpora. No Git history, installed dependencies, external event documents, binary runtime or image distribution.','head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip(),'indexSha256':hashlib.sha256(subprocess.check_output(['git','ls-files','--stage','-z'],cwd=root)).hexdigest(),'files':files,'excluded':excluded,'exclusionCounts':reasons,'fixtureRights':'docs/production-phase1/source-fixture-rights.json','supportedChecks':['Pinned frozen install; typecheck/build; contracts; serial full core; real parser boundary; reader/TUI model; web tests; historical s3/audit/handoff replay; controlled signed worker/application; original production worker matrix; inactive development offline tests/intake'],'limits':['Historical documentation links to excluded receipts/attachments explicitly resolve via exclusion ledger, not fabricated files.','No binaries/images are redistributed; actual local setup acquires pinned dependencies and runtimes under their own notices/obligations.','Native Linux new-worker acceptance and real npm dsse 0.0.2 coverage require actual evidence; packaging does not supply it.']}
encoded=(json.dumps(manifest,indent=2)+'\n').encode();(out/'manifest.json').write_bytes(encoded)
with tarfile.open(out/'source.tar.gz','w:gz',format=tarfile.PAX_FORMAT) as archive:
 for name in files:archive.add(root/name,arcname='heurisko-source/'+name,recursive=False)
 import io
 info=tarfile.TarInfo('heurisko-source/SOURCE_SELECTION.json');info.size=len(encoded);info.mode=0o644;archive.addfile(info,io.BytesIO(encoded))
with tarfile.open(out/'source.tar.gz','r:gz') as archive:
 assert {m.name.removeprefix('heurisko-source/') for m in archive.getmembers()}==set(files)|{'SOURCE_SELECTION.json'}
 for m in archive.getmembers():
  expected=hashlib.sha256(encoded).hexdigest() if m.name.endswith('/SOURCE_SELECTION.json') else files[m.name.removeprefix('heurisko-source/')]
  assert hashlib.sha256(archive.extractfile(m).read()).hexdigest()==expected
(out/'validation.json').write_text(json.dumps({'archiveSha256':hashfile(out/'source.tar.gz'),'manifestSha256':hashlib.sha256(encoded).hexdigest(),'selectedFiles':len(files),'excludedFiles':len(excluded),'originalsModified':False,'verification':'Every included file rehashed from created source archive; exact hashed exclusion ledger retained.'},indent=2)+'\n')
print(json.dumps({'selected':len(files),'excluded':len(excluded),'output':str(out)}))
