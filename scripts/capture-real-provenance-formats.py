#!/usr/bin/env python3
"""Bounded read-only npm format sampling; never installs or executes artifacts."""
import datetime,hashlib,json,pathlib,sys,urllib.request,urllib.parse
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs):raise ValueError('REDIRECT_REJECTED')
out=pathlib.Path(sys.argv[1]);out.mkdir(exist_ok=False)
assert sys.version_info[:2]==(3,13)
opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect)
def get(url,limit):
 p=urllib.parse.urlsplit(url)
 if p.scheme!='https' or p.hostname!='registry.npmjs.org' or p.port or p.username or p.password:raise ValueError('HOST_REJECTED')
 with opener.open(url,timeout=20) as r:
  data=r.read(limit+1)
  if len(data)>limit:raise ValueError('SIZE_LIMIT')
  return data
rows=[]
for name in ['@sigstore/verify','@sigstore/core','sigstore','rollup','vite','@npmcli/arborist','npm','@actions/core']:
 row={'package':name}
 try:
  meta=get('https://registry.npmjs.org/'+urllib.parse.quote(name,safe='')+'/latest',1024*1024);m=json.loads(meta);d=out/name.replace('/','__');d.mkdir();(d/'metadata.json').write_bytes(meta);row.update(version=m['version'],metadataSha256=hashlib.sha256(meta).hexdigest())
  url=m.get('dist',{}).get('attestations',{}).get('url')
  if not url:row['status']='no-advertised-attestation'
  else:
   raw=get(url,256*1024);(d/'attestations.json').write_bytes(raw);a=json.loads(raw);formats=[]
   for at in a.get('attestations',[]):
    for log in at.get('bundle',{}).get('verificationMaterial',{}).get('tlogEntries',[]):formats.append(log.get('kindVersion'))
   row.update(status='captured',attestationsSha256=hashlib.sha256(raw).hexdigest(),formats=formats,url=url)
   # Retain a bounded exact pair only for the still-missing admitted format.
   if any(f=={'kind':'dsse','version':'0.0.2'} for f in formats):
    artifact=get(m['dist']['tarball'],8*1024*1024);(d/'artifact.tgz').write_bytes(artifact);row['artifactSha256']=hashlib.sha256(artifact).hexdigest()
 except Exception as e:row.update(status='unavailable',reason=type(e).__name__)
 rows.append(row);(out/'capture.json').write_text(json.dumps({'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'network':'registry.npmjs.org HTTPS only; no redirects, 20s, 1MiB metadata/256KiB envelopes/8MiB artifact; eight selected releases','cases':rows,'limitations':'Sampling does not establish universal absence or crypto verification. No substituted or fabricated publisher claim.'},indent=2)+'\n')
print(json.dumps(rows))
