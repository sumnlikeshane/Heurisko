#!/usr/bin/env python3
"""Run a declared local check list into a NEW receipt directory, retaining failures.

No publication or target execution. Uses the caller's pinned PATH. Resource data
is the command process tree observed by time(1), not Docker worker peak memory.
"""
import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import platform
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]

def snapshot():
    names = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=ROOT).decode().split('\0')
    files = []
    for name in sorted(set(names)):
        p = ROOT / name
        if not p.is_file() or p.is_symlink() or name.startswith(('examples/', 'experiments/')):
            continue
        data = p.read_bytes()
        files.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    encoded = json.dumps(files, sort_keys=True, separators=(',', ':')).encode()
    return {'gitHead': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip(), 'scope': 'present Git tracked/candidate files except examples and experiments; no ignored builds/dependencies', 'sha256': hashlib.sha256(encoded).hexdigest(), 'files': files}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('spec', type=Path)
    parser.add_argument('out', type=Path)
    args = parser.parse_args()
    spec = json.loads(args.spec.read_text())
    args.out.mkdir(parents=True, exist_ok=False)
    (args.out / 'source-before.json').write_text(json.dumps(snapshot(), indent=2) + '\n')
    result = {'host': {'system': platform.system(), 'release': platform.release(), 'machine': platform.machine()}, 'started': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'checks': []}
    for item in spec:
        name, command = item['name'], item['argv']
        if not name.replace('-', '').replace('_', '').isalnum():
            raise ValueError('invalid check name')
        env = {**os.environ, **item.get('env', {})}
        started = time.monotonic()
        with (args.out / (name + '.stdout.log')).open('xb') as stdout, (args.out / (name + '.stderr.log')).open('xb') as stderr:
            measured = ['/usr/bin/time', '-l' if platform.system() == 'Darwin' else '-v', *command]
            completed = subprocess.run(measured, cwd=ROOT, env=env, stdout=stdout, stderr=stderr)
        entry = {**item, 'exit': completed.returncode, 'seconds': round(time.monotonic() - started, 3)}
        result['checks'].append(entry)
        (args.out / 'validation.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(entry), flush=True)
    (args.out / 'source-after.json').write_text(json.dumps(snapshot(), indent=2) + '\n')
    raise SystemExit(int(any(c['exit'] not in c.get('acceptedExits', [0]) for c in result['checks'])))

if __name__ == '__main__':
    main()
