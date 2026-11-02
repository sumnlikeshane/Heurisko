#!/usr/bin/env python3
"""Explicit bounded public Sigstore capture; authentication is a separate offline step."""
import datetime, hashlib, json, pathlib, re, sys, urllib.error, urllib.request
root=pathlib.Path(__file__).resolve().parents[1]
out=pathlib.Path(sys.argv[1]).resolve();out.mkdir(exist_ok=False)
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args):raise RuntimeError('TRUST_REDIRECT_REJECTED')
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect())
def pairs(items):
 value={}
 for k,v in items:
  if k in value:raise ValueError('DUPLICATE_KEY')
  value[k]=v
 return value
def parsed(data):
 value=json.loads(data,object_pairs_hook=pairs)
 def check(v,depth=0):
  if depth>32:raise ValueError('DEPTH_LIMIT')
  if isinstance(v,dict):
   for x in v.values():check(x,depth+1)
  elif isinstance(v,list):
   for x in v:check(x,depth+1)
 check(value);return value
def get(name):
 if not re.fullmatch(r'(?:[0-9]+\.(?:root|snapshot|targets)\.json|timestamp\.json|targets/[a-f0-9]{64}\.trusted_root\.json)',name):raise ValueError('TRUST_PATH_REJECTED')
 with opener.open('https://tuf-repo-cdn.sigstore.dev/'+name,timeout=20) as response:data=response.read(262145)
 if len(data)>262144:raise ValueError('TRUST_SIZE_LIMIT')
 (out/name).parent.mkdir(exist_ok=True,parents=True)
 with (out/name).open('xb') as stream:stream.write(data)
 return parsed(data)
def version(n):
 if type(n) is not int or not 1<=n<=1000000000:raise ValueError('VERSION_LIMIT')
 return n
anchor=parsed((root/'packages/core/runtime/trust-bootstrap.json').read_bytes());last=version(anchor['signed']['version'])
for n in range(last+1,last+33):
 try:get(str(n)+'.root.json');last=n
 except urllib.error.HTTPError as error:
  if error.code==404:break
  raise
else:raise ValueError('ROOT_ROTATION_LIMIT')
stamp=get('timestamp.json');sv=version(stamp['signed']['meta']['snapshot.json']['version']);snapshot=get(str(sv)+'.snapshot.json');tv=version(snapshot['signed']['meta']['targets.json']['version']);targets=get(str(tv)+'.targets.json');h=targets['signed']['targets']['trusted_root.json']['hashes']['sha256'];get('targets/'+h+'.trusted_root.json')
(out/'capture.json').write_text(json.dumps({'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootVersion':last,'snapshotVersion':sv,'targetsVersion':tv,'timestampVersion':stamp['signed']['version'],'authentication':'NOT_YET_AUTHENTICATED; run prepare-trust-snapshot.mjs offline','files':{str(f.relative_to(out)):hashlib.sha256(f.read_bytes()).hexdigest() for f in out.rglob('*') if f.is_file()}},indent=2)+'\n')
print(str(out))
