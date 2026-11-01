"""Observe evidence-record versus cited-member navigation in the real product PTY."""
from pty_session import Session, ROOT
import pty_session
import json
import os
import pathlib
import tempfile

REPOSITORY = ROOT
BASE = pathlib.Path(os.environ.get('HEURISKO_TUI_RECEIPTS', str(ROOT / '.heurisko' / 'tui-evidence-mode')))
BASE.mkdir(parents=True, exist_ok=True)
CAPTURE = pathlib.Path(tempfile.mkdtemp(prefix='evidence-mode-', dir=BASE))
# Keep UI preferences for this regression separate from every existing user profile.
WORKSPACE = CAPTURE / 'workspace'
WORKSPACE.mkdir()
(WORKSPACE / 'packages').symlink_to(REPOSITORY / 'packages', target_is_directory=True)
pty_session.ROOT = WORKSPACE
checks = []
sessions = []

def expect(session, text):
    session.wait(text)
    checks.append({'check': text, 'size': [session.cols, session.rows], 'passed': True})

try:
    for columns, rows in [(160, 40), (84, 26)]:
        session = Session(columns, rows, [
            'tui', str(REPOSITORY / 'examples/part4/user-failures/reproduction.report.json'),
            '--store', str(REPOSITORY / 'examples/part4/user-failures/reproduction-store'),
        ])
        sessions.append(session)
        expect(session, 'HISTORICAL')
        session.send('x', .3)
        session.send('3', .3)
        session.send('m', .3)
        session.send('e', .4)
        expect(session, 'Raw citation / artifact')
        expect(session, 'RAW utf8: [532, 621) / recorded [532, 621)')
        session.scroll_to('Evidence-record digest:')
        expect(session, 'Evidence-record digest:')
        session.scroll_to('Displayed content ref:')
        expect(session, 'Displayed content ref:')
        session.send('b', .3)
        session.send('r', .4)
        expect(session, 'Raw evidence record / record bytes')
        expect(session, 'RETAINED EVIDENCE RECORD')
        expect(session, 'RAW utf8: [0, 3426) / recorded [0, 3426)')
        session.capture(CAPTURE / f'record-{columns}')
        session.send('\x1b', .3)
        session.send('e', .4)
        expect(session, 'Raw citation / artifact')
        expect(session, 'RAW utf8: [532, 621) / recorded [532, 621)')
        assert 'heurisko-raw-diff-v1' not in session.frame(), session.frame()
        checks.append({'check': 'New citation resolves member bytes after record-mode Back', 'size': [columns, rows], 'passed': True})
        session.capture(CAPTURE / f'citation-return-{columns}')
        session.quit()
finally:
    for session in sessions:
        if not session.closed:
            session.capture(CAPTURE / 'failure')
            session.cleanup_readonly()
    (CAPTURE / 'validation.json').write_text(json.dumps({
        'scope': 'Actual product PTY over unchanged retained report; isolated UI-state directory',
        'checks': checks,
        'count': len(checks),
    }, indent=2) + '\n')
print(json.dumps({'passed': len(checks), 'receipt': str(CAPTURE)}))
