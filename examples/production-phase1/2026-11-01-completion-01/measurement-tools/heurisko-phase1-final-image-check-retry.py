from pathlib import Path
import subprocess,json,hashlib,http.client,time,uuid
base=Path('examples/production-phase1/2026-11-01-completion-01');tag='heurisko-phase1-completion-01-notices-preserved:local'
image=json.loads(subprocess.check_output(['docker','image','inspect',tag]));(base/'image-preserved-notices-retry.json').write_text(json.dumps(image,indent=2)+'\n')
program="""from pathlib import Path
import json,hashlib
r=Path('/app');names=['THIRD_PARTY_NOTICES.txt','apps/web/THIRD_PARTY_NOTICES.txt','apps/web/dist/assets/app.js','apps/web/dist/assets/third-party-notices.txt']
notices=(r/names[1]).read_text();assert notices in (r/names[2]).read_text();assert 'esbuild 0.25.12' in notices;assert '@types/react' in notices
print(json.dumps({'noticeInDeliveredJavaScript':True,'originalBuildAndTypeNoticesPreserved':True,'files':[dict(path=n,bytes=(r/n).stat().st_size,sha256=hashlib.sha256((r/n).read_bytes()).hexdigest()) for n in names]}))
"""
p=subprocess.run(['docker','run','--rm','-i','--read-only','--network','none','--platform','linux/amd64','--entrypoint','/app/.venv/bin/python',tag,'-I','-'],input=program.encode(),capture_output=True);assert p.returncode==0,p.stderr.decode();facts=json.loads(p.stdout)
for x in facts['files']:assert hashlib.sha256(Path(x['path']).read_bytes()).hexdigest()==x['sha256']
name='heurisko-phase1-image-probe-'+str(uuid.uuid4());cid=subprocess.check_output(['docker','run','-d','--read-only','--platform','linux/amd64','--name',name,'-p','127.0.0.1:43220:10000','-e','RENDER_EXTERNAL_URL=https://heurisko.onrender.com',tag]).decode().strip();responses=[]
try:
 deadline=time.monotonic()+30
 while True:
  try:
   c=http.client.HTTPConnection('127.0.0.1',43220,timeout=2);c.request('GET','/healthz',headers={'Host':'heurisko.onrender.com'});r=c.getresponse();body=r.read();status=r.status;c.close()
   if status==200:break
  except (OSError,http.client.HTTPException):pass
  if time.monotonic()>deadline:raise RuntimeError('Image health unavailable')
  time.sleep(.2)
 responses.append({'method':'GET','path':'/healthz','status':status,'body':body.decode()});assert json.loads(body)['mode']=='public-readonly'
 c=http.client.HTTPConnection('127.0.0.1',43220,timeout=5);c.request('GET','/assets/app.js',headers={'Host':'heurisko.onrender.com'});r=c.getresponse();b=r.read();assert r.status==200;assert hashlib.sha256(b).hexdigest()==next(x['sha256'] for x in facts['files'] if x['path'].endswith('/app.js'));c.close();responses.append({'method':'GET','path':'/assets/app.js','status':200,'sha256':hashlib.sha256(b).hexdigest(),'fullNoticeIncluded':True})
 c=http.client.HTTPConnection('127.0.0.1',43220,timeout=5);c.request('POST','/api/investigations',body=b'{"inert":"blocked before parsing"}',headers={'Host':'heurisko.onrender.com','Origin':'https://heurisko.onrender.com','Content-Type':'application/json'});r=c.getresponse();b=r.read();assert r.status==405,(r.status,b);assert b'HOSTED_READ_ONLY' in b;c.close();responses.append({'method':'POST','path':'/api/investigations','status':405,'body':b.decode()})
finally:
 (base/'image-probe-retry-logs.txt').write_bytes(subprocess.check_output(['docker','logs',cid],stderr=subprocess.STDOUT))
 (base/'image-probe-retry-id.json').write_text(json.dumps({'name':name,'exactContainerId':cid})+'\n')
 subprocess.run(['docker','stop',cid],check=True,stdout=subprocess.DEVNULL)
 subprocess.run(['docker','rm',cid],check=True,stdout=subprocess.DEVNULL)
 absent=subprocess.check_output(['docker','container','ls','--all','--quiet','--no-trunc','--filter','id='+cid]).decode().strip();assert not absent
facts.update({'imageId':image[0]['Id'],'dockerReportedSize':image[0]['Size'],'scope':'Local hosted-image validation under emulation, no native parser proof or external deployment','responses':responses,'exactProbeContainerId':cid,'exactRemovalConfirmed':True})
(base/'image-preserved-notice-check.json').write_text(json.dumps(facts,indent=2)+'\n');print(json.dumps(facts))
