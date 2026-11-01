import hashlib, json, tarfile, zipfile
from pathlib import Path

root = Path('/data')
digest = lambda b: 'sha256:' + hashlib.sha256(b).hexdigest()
manifest = json.loads((root / 'manifest.json').read_text())
documents = [json.loads(line) for line in (root / 'documents.jsonl').read_text().splitlines()]
for key in ['artifact', 'source_distribution']:
    entry = manifest[key]
    data = (root / entry['filename']).read_bytes()
    assert len(data) == entry['size_bytes'] and digest(data) == entry['sha256']
with zipfile.ZipFile(root / manifest['artifact']['filename']) as wheel, tarfile.open(root / manifest['source_distribution']['filename']) as sdist:
    assert len(wheel.infolist()) < 10000 and len(sdist.getmembers()) < 10000
    assert sum(i.file_size for i in wheel.infolist()) < 64 * 1024 * 1024
    assert sum(i.size for i in sdist.getmembers()) < 64 * 1024 * 1024
    prefix = 'setuptools-60.0.0/'
    checks = []
    for doc in documents:
        assert digest(doc['content'].encode()) == doc['content_sha256']
        if doc['kind'] == 'inventory_diff':
            assert 'distutils-precedence.pth' in wheel.namelist()
            assert not any(i.name.endswith('/distutils-precedence.pth') for i in sdist.getmembers())
            continue
        if doc['kind'] == 'artifact_member':
            raw = wheel.read(doc['path'])
        else:
            entry = sdist.getmember(prefix + doc['path'])
            assert entry.isfile() and entry.size < 2 * 1024 * 1024
            raw = sdist.extractfile(entry).read()
            local = root / 'source' / doc['path']
            if local.exists():
                assert local.read_bytes() == raw
        lines = raw.decode().splitlines()
        excerpt = '\n'.join(lines[doc['start_line']-1:doc['end_line']])
        assert excerpt == doc['content'], doc['path']
        checks.append({'evidenceId': doc['evidence_id'], 'path': doc['path'], 'startLine': doc['start_line'], 'endLine': doc['end_line'], 'memberSha256': digest(raw), 'excerptSha256': digest(excerpt.encode()), 'status': 'matched-to-retained-archive'})
    print(json.dumps({'status': 'passed', 'scope': 'static archive/excerpt verification; no imports, installation, hook execution, rebuild or live model', 'checks': checks}, indent=2))
