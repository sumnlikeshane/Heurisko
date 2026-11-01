from pathlib import Path
import json,hashlib
records=[]
for site in [Path('/usr/local/lib/python3.13/site-packages'),Path('/app/.venv/lib/python3.13/site-packages')]:
 for vendor in sorted(site.glob('pip/_vendor/vendor.txt')):
  data=vendor.read_bytes();rights=[]
  for p in vendor.parent.rglob('*'):
   if p.is_file() and any(word in p.name.lower() for word in ['license','licence','copying','notice','copyright']):
    b=p.read_bytes();rights.append({'path':str(p.relative_to(site)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
  piplicenses=[]
  for p in site.glob('pip-*.dist-info/LICENSE*'):
   b=p.read_bytes();piplicenses.append({'path':str(p.relative_to(site)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
  records.append({'site':str(site),'vendorManifest':data.decode(),'vendorManifestSha256':hashlib.sha256(data).hexdigest(),'vendoredRightsFiles':rights,'pipOwnLicenseFiles':piplicenses,'limit':'Vendor names/versions are inventory, not a grant. Full third-party notices not found by this filename scan require source-level notice evidence before redistributing the bundled installer.'})
print(json.dumps({'scope':'Final validation-image Python installer bundled source, global and venv; read-only filename/manifest review','installers':records},indent=2))
