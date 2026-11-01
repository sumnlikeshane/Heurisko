from pathlib import Path
import urllib.request,json,hashlib
out=Path('examples/production-phase1/2026-11-01-completion-01/rights')
urls={
'go1.23.12-LICENSE':'https://raw.githubusercontent.com/golang/go/go1.23.12/LICENSE',
'x-sys-LICENSE':'https://raw.githubusercontent.com/golang/sys/c0bba94af5f8/LICENSE',
'yoga-contents.json':'https://api.github.com/repos/facebook/yoga/contents/.github/workflows?ref=v3.2.1',
'yoga-binary-header.txt':'https://raw.githubusercontent.com/facebook/yoga/v3.2.1/javascript/binaries/yoga-wasm-base64-esm.js',
'emscripten-LICENSE':'https://raw.githubusercontent.com/emscripten-core/emscripten/3.1.61/LICENSE',
}
r=[]
for file,url in urls.items():
 try:
  with urllib.request.urlopen(url,timeout=30) as response:b=response.read(2*1024*1024)
  (out/file).write_bytes(b);r.append({'file':file,'url':url,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
 except Exception as e:r.append({'url':url,'error':str(e)})
(out/'retrieval-additional.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
