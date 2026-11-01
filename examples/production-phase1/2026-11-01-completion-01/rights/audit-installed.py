from pathlib import Path
import json,hashlib,shutil,importlib.metadata,re
root=Path.cwd(); out=root/'examples/production-phase1/2026-11-01-completion-01/rights'
notice=out/'installed-notices';notice.mkdir(exist_ok=False)
items=json.loads((root/'docs/production-phase1/npm-licenses.json').read_text())['items'];wanted={(x['name'],x['version']) for x in items}
found={}
for p in (root/'node_modules/.pnpm').glob('*/node_modules/**/package.json'):
 if len(p.relative_to(root/'node_modules/.pnpm').parts)>5:continue
 try:data=json.loads(p.read_text())
 except (OSError,ValueError):continue
 key=(data.get('name'),data.get('version'))
 if key not in wanted or key in found:continue
 files=[]; embedded=[]
 for f in p.parent.rglob('*'):
  if not f.is_file() or f.is_symlink() or 'node_modules' in f.relative_to(p.parent).parts:continue
  rel=f.relative_to(p.parent)
  if any(word in f.name.lower() for word in ['license','licence','notice','copying','copyright']):
   b=f.read_bytes();target=notice/(key[0].replace('/','__')+'@'+key[1])/rel;target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b)
   files.append({'path':str(rel),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
  elif f.suffix in ['.js','.ts','.h','.cpp','.c'] and f.stat().st_size<2*1024*1024:
   b=f.read_bytes();lines=b.decode('utf8','replace').splitlines()
   comments=[s.strip()[:240] for s in lines[:40] if re.search('copyright|licens',s,re.I)]
   if comments:embedded.append({'path':str(rel),'sha256':hashlib.sha256(b).hexdigest(),'header':comments})
 found[key]={'name':key[0],'version':key[1],'licenseDeclaration':data.get('license'),'noticeFiles':files,'sourceHeaders':embedded}
assert set(found)==wanted,(wanted-set(found))
py=[]
for name in ['jsonschema','attrs','jsonschema-specifications','referencing','rpds-py','pip']:
 d=importlib.metadata.distribution(name); records=[]
 for f in d.files or []:
  if any(word in f.name.lower() for word in ['license','licence','copying','notice','copyright']):
   b=d.locate_file(f).read_bytes();target=notice/('python-'+name+'@'+d.version)/str(f);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(b);records.append({'path':str(f),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)})
 py.append({'name':name,'version':d.version,'notices':records})
fixtures=[]
for p in list((root/'examples').rglob('*LICENSE*'))+list((root/'experiments').rglob('LICENSE')):
 b=p.read_bytes();fixtures.append({'path':str(p.relative_to(root)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'title':b.decode('utf8','replace').splitlines()[:3]})
# Static Go build-info marker observation only. Never executes this binary here.
binary=next((root/'node_modules/.pnpm').glob('@esbuild+darwin-arm64@*/node_modules/@esbuild/darwin-arm64/bin/esbuild'))
b=binary.read_bytes();go=sorted(set(x.decode() for x in re.findall(rb'go1\.\d+\.\d+',b)))
result={'scope':'Full installed npm package rights filenames and source headers; pinned validator license files; retained fixture notices. Headers are evidence, not complete bundled-code clearance.','npm':list(sorted(found.values(),key=lambda x:x['name'])),'python':py,'fixtures':fixtures,'esbuildBinary':{'path':str(binary.relative_to(root)),'sha256':hashlib.sha256(b).hexdigest(),'goVersionMarkers':go,'xSysMarker':b'golang.org/x/sys' in b},'excluded':['No organizer permission inferred','No global npm/pnpm/base-image clearance inferred','No generated WASM dependency clearance inferred']}
(out/'installed-review.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'npm':len(found),'python':len(py),'fixtureNotices':len(fixtures),'goMarkers':go}))
