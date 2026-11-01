from pathlib import Path
import urllib.request,json,hashlib
base=Path('examples/production-phase1/2026-11-01-completion-01/rights')
base.mkdir(exist_ok=False)
urls={
'yoga-LICENSE':'https://raw.githubusercontent.com/facebook/yoga/v3.2.1/LICENSE',
'yoga-package.json':'https://raw.githubusercontent.com/facebook/yoga/v3.2.1/javascript/package.json',
'yoga-emscripten-version':'https://raw.githubusercontent.com/facebook/yoga/v3.2.1/.github/workflows/build-js.yml',
'esbuild-LICENSE.md':'https://raw.githubusercontent.com/evanw/esbuild/v0.25.12/LICENSE.md',
'esbuild-go.mod':'https://raw.githubusercontent.com/evanw/esbuild/v0.25.12/go.mod',
'go-LICENSE':'https://raw.githubusercontent.com/golang/go/go1.25.4/LICENSE',
}
results=[]
for name,url in urls.items():
 try:
  with urllib.request.urlopen(url,timeout=30) as r:data=r.read(2*1024*1024)
  (base/name).write_bytes(data)
  results.append({'file':name,'url':url,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
 except Exception as e:results.append({'file':name,'url':url,'error':str(e)})
(base/'retrieval.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
