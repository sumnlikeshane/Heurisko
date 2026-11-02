#!/usr/bin/env python3
"""Reproduce development source captures with fixed hosts and no redirects.

Prior captures remain immutable. This fresh receipt binds HTTP capture time and
full bytes; a publisher gitHead/HTTPS URL remains an unverified source claim.
"""
import datetime
import hashlib
import json
from pathlib import Path
import re
import sys
import urllib.request

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs):raise ValueError('SOURCE_REDIRECT_REJECTED')

def main():
    assert sys.version_info[:2]==(3,13)
    root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(exist_ok=False)
    opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect)
    prior=json.loads((root/'source-captures/captures.json').read_text())
    results=[]
    for case in json.loads((root/'captures.json').read_text())['cases']:
        metadata=json.loads((root/Path(case['artifact']).parent/'metadata.json').read_text())
        repo=metadata.get('repository');repo=repo.get('url') if isinstance(repo,dict) else repo
        commit=metadata.get('gitHead')
        slug=re.search(r'github\.com[:/]([A-Za-z0-9_-][A-Za-z0-9_.-]*)/([A-Za-z0-9_-][A-Za-z0-9_.-]+?)(?:\.git)?$',repo or '')
        entry={'caseId':case['caseId'],'family':case['family'],'repositoryClaim':repo,'commitClaim':commit}
        if not slug or not re.fullmatch('[a-f0-9]{40}',commit or ''):
            entry['omission']='No supported immutable commit claim; no branch/tag guess.'
        else:
            url=f'https://codeload.github.com/{slug[1]}/{slug[2]}/tar.gz/{commit}'
            with opener.open(url,timeout=30) as response:
                assert response.url==url
                data=response.read(8*1024*1024+1)
                if len(data)>8*1024*1024:raise ValueError('SOURCE_SIZE_LIMIT')
                headers={k:response.headers[k] for k in ['Content-Type','Content-Length','ETag','Last-Modified'] if k in response.headers}
            digest=hashlib.sha256(data).hexdigest()
            old=next(p for p in prior if p['caseId']==case['caseId'])
            filename=case['caseId']+'.source.tgz';(out/filename).write_bytes(data)
            entry.update(url=url,capturedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),headers=headers,sha256=digest,bytes=len(data),path=filename,matchesPriorBytes=digest==old['sha256'],binding='publisher claim + HTTPS commit URL only; no Git-object/release/provenance verification')
        results.append(entry)
        (out/'captures.json').write_text(json.dumps({'version':'heurisko-p2-bounded-source-captures-v1','network':'HTTPS codeload.github.com only, no redirects or proxy environment, 30 s and 8 MiB per response','cases':results},indent=2)+'\n')
    conflicts=[c['caseId'] for c in results if c.get('matchesPriorBytes') is False]
    print(json.dumps({'captures':sum('path' in c for c in results),'omissions':sum('omission' in c for c in results),'conflicts':conflicts}))
    if conflicts:raise SystemExit(1)

if __name__=='__main__':main()
