#!/usr/bin/env python3
"""Capture selected public development inputs, never install or execute them.

Rights declarations are provisional until retained notices are inspected through
the admitted parser. No held-out labels or held-out families are created here.
"""
import base64
import datetime
import hashlib
import json
from pathlib import Path
import sys
import urllib.parse
import urllib.request

SELECTION = [
    ('picocolors', '1.1.1'), ('kleur', '4.1.5'), ('ms', '2.1.3'),
    ('is-number', '7.0.0'), ('ansi-regex', '6.2.2'),
    ('escape-string-regexp', '5.0.0'), ('fast-deep-equal', '3.1.3'),
    ('balanced-match', '2.0.0'), ('concat-map', '0.0.1'),
    ('minimist', '1.2.8'), ('wrappy', '1.0.2'), ('once', '1.4.0'),
]

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise ValueError('redirect not admitted by this capture tool')

def capture(url, limit):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != 'https' or parsed.hostname != 'registry.npmjs.org' or parsed.username or parsed.password or parsed.port:
        raise ValueError('registry-only capture')
    with urllib.request.build_opener(NoRedirect).open(url, timeout=30) as response:
        data = response.read(limit + 1)
        if len(data) > limit:
            raise ValueError('capture limit')
        return data

def main():
    out = Path(sys.argv[1]);out.mkdir(exist_ok=False, parents=True)
    cases = []
    for name, version in SELECTION:
        dest = out / name;dest.mkdir()
        url = f'https://registry.npmjs.org/{name}/{version}'
        metadata = capture(url, 1024 * 1024)
        (dest / 'metadata.json').write_bytes(metadata)
        value = json.loads(metadata)
        if value.get('license') not in ('MIT', 'ISC', 'Apache-2.0'):
            raise ValueError(f'rights review required for {name}')
        archive = capture(value['dist']['tarball'], 8 * 1024 * 1024)
        integrity = value['dist'].get('integrity')
        if integrity and integrity.startswith('sha512-'):
            assert integrity == 'sha512-' + base64.b64encode(hashlib.sha512(archive).digest()).decode()
        else:
            assert hashlib.sha1(archive).hexdigest() == value['dist']['shasum']
        (dest / 'artifact.tgz').write_bytes(archive)
        cases.append({'caseId': f'{name}-{version}', 'family': f'upstream:{name}',
                      'split': 'development', 'origin': url,
                      'artifactURL': value['dist']['tarball'], 'capturedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                      'artifactSha256': hashlib.sha256(archive).hexdigest(),
                      'metadataSha256': hashlib.sha256(metadata).hexdigest(),
                      'version': version, 'commitClaim': value.get('gitHead'),
                      'repositoryClaim': value.get('repository'), 'declaredLicense': value['license'],
                      'retention': 'provisional development capture; admitted-parser notice review required',
                      'labelAuthority': 'unlabeled; no independent human determination',
                      'artifact': f'{name}/artifact.tgz'})
        (out / 'captures.json').write_text(json.dumps({'version': 'heurisko-p2-data-v1', 'cases': cases,
          'familyReview': 'provisional upstream-project groups; merge forks/monorepos/shared build templates before freeze',
          'heldOut': 'none: independent custodian/families/labels still required'}, indent=2) + '\n')
    print(json.dumps({'captures': len(cases), 'split': 'development', 'heldOut': 0}))

if __name__ == '__main__':
    main()
