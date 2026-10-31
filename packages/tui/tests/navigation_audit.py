"""Reference focus anchors, source/reader origins, responsive panes and profile persistence."""
from pty_session import Session,ROOT
import json,hashlib,time
base=ROOT/'integration/part4/receipts/visual-rework';cap=base/('navigation-'+str(len(list(base.glob('navigation-*')))+1));cap.mkdir(parents=True);checks=[];sessions=[]
def expect(s,text):s.wait(text);checks.append({'check':text,'passed':True})
def new(c,r):
 s=Session(c,r,['tui','examples/part4/current/local-m1.report.json','--store','examples/part4/current/store']);sessions.append(s);expect(s,'HISTORICAL');s.send('x');return s
try:
 s=new(84,26);s.send('\t');expect(s,'PRIORITY FINDINGS');s.send('\t');expect(s,'COVERAGE & UNKNOWNS');s.send('\t');expect(s,'NEXT ACTIONS');s.send('\r');expect(s,'Report next actions');s.send('\x1b');s.send('1');s.send('x');s.send('\r');expect(s,'[Candidates]');s.send('1');s.send('\t');s.send('\r');expect(s,'Observation & assessment' if s.cols>=100 else 'Findings');s.capture(cap/'overview-focus-anchors-84');s.quit()
 s=new(160,40);s.send('2');s.send('/');s.send('lifecycle');s.send('\r');s.send('\t');s.send('j');s.send('\t');expect(s,'Supporting evidence');s.send('j');s.capture(cap/'support-pane-wide');s.resize(120,35);expect(s,'Supporting evidence');s.capture(cap/'support-pane-medium');s.resize(84,26);expect(s,'Supporting evidence');s.capture(cap/'support-pane-narrow');s.send('\x1b[Z');expect(s,'Observation & assessment');s.send('\x1b[Z');s.send('\x1b[Z');s.send('\x1b[C');s.send('\r');s.capture(cap/'section-navigation');s.send('2');s.send('c');expect(s,'confidence: high');s.send('\x1b[C');s.read(.4);s.quit()
 # Observation-keyed preferences survive reopening and are resettable, without changing the report.
 s=Session(120,35,['tui','examples/part4/current/local-m1.report.json','--store','examples/part4/current/store']);sessions.append(s);expect(s,'HISTORICAL');expect(s,'confidence: high');expect(s,'Filter: lifecycle');s.send('x');s.send('3');expect(s,'[+] package/');s.capture(cap/'default-collapsed-tree');s.send('\r');expect(s,'[-] package/');s.capture(cap/'expanded-tree');s.quit()
 # Named finding anchors use actual wrapped document offsets at both viewport widths.
 for cols,rows in [(160,40),(84,26)]:
  anchor=new(cols,rows);anchor.send('2');anchor.send('\r');expect(anchor,'Observation:');anchor.send('\x1b[6~');expect(anchor,'Finding section: Significance');expect(anchor,'Significance:');anchor.send('\x1b[5~');expect(anchor,'Finding section: Observation');expect(anchor,'Observation:');anchor.capture(cap/('finding-anchors-'+str(cols)));anchor.quit()
 s=Session(120,35,['--store','examples/part4/current/store']);sessions.append(s);expect(s,'Recent investigations');s.send('\x1b[B');s.send('\r');expect(s,'HISTORICAL');s.send('H');s.send('\x1b[Z');s.send('\x1b[Z');s.send('\x1b[C');s.send('\r');expect(s,'Investigations');s.capture(cap/'home-global-navigation');s.send('\r');expect(s,'HISTORICAL');s.send('1');s.send('\x1b');expect(s,'Saved observations');s.capture(cap/'recent-exact-back-origin');s.send('H');s.quit()
except BaseException:
 for s in sessions:
  if not s.closed:s.capture(cap/'failure')
 raise
finally:
 for s in sessions:s.cleanup_readonly()
 (cap/'validation.json').write_text(json.dumps({'checks':checks,'count':len(checks)},indent=2)+'\n')
print(json.dumps({'passed':len(checks),'receipt':str(cap.relative_to(ROOT))}))
