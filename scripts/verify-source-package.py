#!/usr/bin/env python3
"""Verify an exact source package without Git, with explicit omitted-link coverage."""
import hashlib,importlib.util,json,pathlib,sys
from urllib.parse import urlsplit,unquote
root=pathlib.Path(__file__).resolve().parents[1];manifest=json.loads(pathlib.Path(sys.argv[1]).read_text());files=manifest['files'];excluded={e['path']:e['reason'] for e in manifest['excluded']};errors=[];omitted=[]
def digest(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
for n,h in files.items():
 p=root/n
 if p.is_symlink() or not p.is_file() or digest(p)!=h:errors.append({'path':n,'reason':'SOURCE_HASH_MISMATCH'})
spec=importlib.util.spec_from_file_location('docs',root/'scripts/check-docs.py');docs=importlib.util.module_from_spec(spec);spec.loader.exec_module(docs)
for n in files:
 if not n.endswith('.md'):continue
 source=root/n
 for target in docs.destinations(source.read_text()):
  parsed=urlsplit(target)
  if parsed.scheme or parsed.netloc or target.startswith(('/', 'mailto:')):continue
  path=(source.parent/unquote(parsed.path)).resolve() if parsed.path else source
  if not path.is_relative_to(root):errors.append({'path':n,'target':target,'reason':'OUTSIDE_SOURCE'});continue
  relative=path.relative_to(root).as_posix()
  present=relative in files or any(x.startswith(relative+'/') for x in files)
  if not present:
   if (n,target) in docs.UPSTREAM_OMISSIONS:omitted.append({'source':n,'target':target,'reason':'EXACT_UPSTREAM_INTAKE_OMISSION'});continue
   reason=excluded.get(relative) or ('EXCLUDED_DIRECTORY' if any(x.startswith(relative+'/') for x in excluded) else None)
   if reason:omitted.append({'source':n,'target':target,'reason':reason});continue
   errors.append({'path':n,'target':target,'reason':'UNRECORDED_MISSING_LINK'});continue
  if parsed.fragment and path.suffix=='.md' and unquote(parsed.fragment) not in docs.anchors(path.read_text()):errors.append({'path':n,'target':target,'reason':'MISSING_ANCHOR'})
rights=json.loads((root/manifest['fixtureRights']).read_text())
for group in rights['groups']:
 for notice in group['notices']:
  if files.get(notice['path'])!=notice['sha256']:errors.append({'path':notice['path'],'reason':'NOTICE_HASH_MISMATCH'})
research=0
for line in (root/'docs/Heurisko_Research/SHA256SUMS.txt').read_text().splitlines():
 h,n=line.split(maxsplit=1);p=root/'docs/Heurisko_Research'/n.strip().lstrip('*');research+=1
 if digest(p)!=h:errors.append({'path':str(p),'reason':'RESEARCH_HASH_MISMATCH'})
print(json.dumps({'version':'heurisko-source-package-verification-v1','passed':not errors,'selectedFiles':len(files),'researchHashes':research,'noticeGroups':len(rights['groups']),'errors':errors,'omittedLinks':omitted,'scope':'All selected hashes/notices and local Markdown navigation; explicitly excluded historical links counted as omissions, never fabricated passes.'},indent=2));raise SystemExit(1 if errors else 0)
