from pathlib import Path
import urllib.request,json,hashlib
base=Path('examples/production-phase1/2026-11-01-completion-01/rights')
urls={'emscripten-3.1.28-LICENSE':'https://raw.githubusercontent.com/emscripten-core/emscripten/3.1.28/LICENSE','node-22.23.4-LICENSE':'https://raw.githubusercontent.com/nodejs/node/v22.23.4/LICENSE','python-3.13.2-LICENSE':'https://raw.githubusercontent.com/python/cpython/v3.13.2/LICENSE','python-3.13.18-LICENSE':'https://raw.githubusercontent.com/python/cpython/v3.13.18/LICENSE'}
results=[]
for name,url in urls.items():
 try:
  with urllib.request.urlopen(url,timeout=30) as r:b=r.read(2*1024*1024)
  (base/name).write_bytes(b);results.append({'file':name,'url':url,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
 except Exception as e:results.append({'file':name,'url':url,'error':str(e)})
(base/'runtime-retrieval.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results))
