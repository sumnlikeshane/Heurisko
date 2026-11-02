"""Actual PTY finding/value/citation journeys over fresh Phase 2 reports."""
from pty_session import Session, ROOT
import pty_session
import json
import os
from pathlib import Path
import sys
import tempfile

repository=ROOT
inputs=Path(sys.argv[1]).resolve()
capture=Path(tempfile.mkdtemp(prefix='phase2-findings-',dir=os.environ['HEURISKO_TUI_RECEIPTS']))
workspace=capture/'workspace';workspace.mkdir();(workspace/'packages').symlink_to(repository/'packages',target_is_directory=True)
pty_session.ROOT=workspace
checks=[]
for case,query,expected in [
    # The renderer deliberately places label/value on separate wrapped rows.
    ('mutation-lifecycle-remove','lifecycle',['/scripts/postinstall is removed','artifact. Source:','Severity:','informational','Review priority:','low']),
    ('mutation-entrypoint','entrypoint',['Source: "index.js"','artifact: "alternate.js"','Evidence confidence:','high']),
]:
    session=Session(160,44,['tui',str(inputs/case/'report.json'),'--store',str(inputs/case/'store')])
    try:
        session.wait('HISTORICAL');session.send('2',.2);session.send('/',.1);session.send(query+'\r',.3);session.send('\r',.3)
        for text in expected:
            session.scroll_to(text);checks.append({'case':case,'check':text,'passed':True})
        session.capture(capture/(case+'-finding'))
        session.send('e',.4);session.wait('Raw citation / artifact');session.capture(capture/(case+'-artifact'))
        checks.append({'case':case,'check':'Actual artifact citation opens','passed':True})
        if case=='mutation-entrypoint':
            session.wait('alternate.js');checks.append({'case':case,'check':'Exact artifact value in cited member bytes','passed':True})
        session.send('s',.4)
        if case=='mutation-entrypoint':
            session.wait('index.js');checks.append({'case':case,'check':'Exact source value in cited member bytes','passed':True})
        else:
            session.wait('HEURISKO_INERT_TEST_ONLY');checks.append({'case':case,'check':'Exact removed command retained on source side','passed':True})
        session.capture(capture/(case+'-source'));session.send('\x1b',.3)
        session.quit()
    finally:
        if not session.closed:session.capture(capture/(case+'-failure'));session.cleanup_readonly()
        (capture/'validation.json').write_text(json.dumps({'scope':'Fresh Phase 2 reports; actual 160×44 PTY, isolated UI state; no GUI/AT or independent claim acceptance','checks':checks},indent=2)+'\n')
print(json.dumps({'passed':len(checks),'receipt':str(capture)}))
