"""Real retained-local engine run must adopt an independent observation UI profile."""
from pty_session import Session, ROOT
import pty_session
import hashlib
import json
import os
import pathlib
import tempfile
import time

REPOSITORY = ROOT
BASE = pathlib.Path(os.environ.get('HEURISKO_TUI_RECEIPTS', str(ROOT / '.heurisko/tui-report-adoption')))
BASE.mkdir(parents=True, exist_ok=True)
CAPTURE = pathlib.Path(tempfile.mkdtemp(prefix='report-adoption-', dir=BASE))
WORKSPACE = CAPTURE / 'workspace'
WORKSPACE.mkdir()
(WORKSPACE / 'packages').symlink_to(REPOSITORY / 'packages', target_is_directory=True)
pty_session.ROOT = WORKSPACE
report_path = REPOSITORY / 'examples/part4/current/local-m1.report.json'
raw = report_path.read_bytes()
report = json.loads(raw)
old_profile = WORKSPACE / '.heurisko-tui-state' / (report['reportId'] + '-' + hashlib.sha256(raw).hexdigest() + '.json')
store = WORKSPACE / 'store'
checks = []
session = Session(160, 40, ['tui', str(report_path), '--store', str(store)])

def expect(text):
    session.wait(text)
    checks.append({'check': text, 'passed': True})

try:
    expect('HISTORICAL')
    session.send('2', .3)
    session.send('/', .2)
    session.send('lifecycle', .3)
    session.send('\r', .3)
    session.send('c', .3)
    expect('confidence: high')
    session.send('\r', .3)
    expect('Observation:')
    session.send('g', .3)
    expect('Files')
    session.send('d', .3)
    session.read(.6)
    before = old_profile.read_bytes()
    assert json.loads(before)['filters']['confidence'] == 'high'
    session.capture(CAPTURE / 'old-observation')
    session.send('H', .3)
    session.send('n', .3)
    session.send('\x14', .3)
    expect('[ Local archive ]')
    fields = [
        str(REPOSITORY / 'examples/s2/current/inputs/picocolors-1.1.1.local-inert-mutation.tgz'),
        'https://github.com/alexeyraspopov/picocolors',
        '6f0a4638348ed20633d623ee973f9c9a96f65104',
        '',
        str(REPOSITORY / 'examples/s2/current/inputs/picocolors-source-6f0a4638348ed20633d623ee973f9c9a96f65104.tar.gz'),
    ]
    for value in fields:
        session.send(value, .1)
        session.send('\t', .1)
    session.send('\t', .1)
    session.send('\r', .2)
    expect('Review exact target')
    session.send('\r', .05)
    deadline = time.monotonic() + 90
    while 'Investigation settled.' not in session.frame() and time.monotonic() < deadline:
        if 'Start failed:' in session.frame():
            raise AssertionError(session.frame())
        session.read(.2)
    expect('Investigation settled.')
    run = json.loads(next((store / 'runs').glob('*/*.json')).read_text())
    profile = WORKSPACE / '.heurisko-tui-state' / (run['reportId'] + '-' + run['reportContentRef'][7:] + '.json')
    session.send('2', .4)
    expect('Malhar analysis module not supplied')
    session.read(.6)
    state = json.loads(profile.read_text())
    assert state['filters'] == {'priority': 'all', 'severity': 'all', 'confidence': 'all', 'rule': 'all'}, state
    assert state['location']['query'] == '' and state['tree'] is True and state['diff'] == 'auto', state
    assert all(value['query'] == '' for value in state['sections'].values()), state
    checks.append({'check': 'New engine observation has independent filters, section queries and file preferences', 'passed': True})
    session.capture(CAPTURE / 'new-observation')
    session.send('3', .3)
    session.send('\x1b', .3)
    expect('ESTABLISHED OBSERVATION')
    checks.append({'check': 'New Files Back has no previous finding origin', 'passed': True})
    assert old_profile.read_bytes() == before, 'Original observation UI profile changed while investigating a new target'
    checks.append({'check': 'Original observation UI profile preserved byte-for-byte', 'passed': True})
    session.send('H', .3)
    session.send('o', .3)
    session.send(str(report_path), .2)
    session.send('\r', .3)
    expect('HISTORICAL')
    expect('Flat /')
    session.send('2', .3)
    expect('confidence: high')
    expect('Filter: lifecycle')
    checks.append({'check': 'Explicit Open restores only the selected old observation profile', 'passed': True})
    session.quit()
finally:
    if not session.closed:
        session.capture(CAPTURE / 'failure')
        # A live owner must settle cancellation; never forcibly kill a parser owner.
        if 'Live investigation' in session.frame() or 'Stopping investigation' in session.frame():
            session.send('\x03', .1)
            deadline = time.monotonic() + 80
            while time.monotonic() < deadline:
                pid, status = os.waitpid(session.pid, os.WNOHANG)
                if pid:
                    session.closed = True
                    os.close(session.fd)
                    break
                session.read(.1)
            if not session.closed:
                raise AssertionError('Preserve pending engine owner and store for explicit recovery')
        else:
            session.cleanup_readonly()
    (CAPTURE / 'validation.json').write_text(json.dumps({'scope': 'Actual local engine, unchanged retained inert inputs, no model or target execution', 'checks': checks, 'count': len(checks)}, indent=2) + '\n')
print(json.dumps({'passed': len(checks), 'receipt': str(CAPTURE)}))
