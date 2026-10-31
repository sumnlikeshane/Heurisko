"""Observe actual product output in private PTYs. No reconstructed screenshots."""
import os,sys,pty,fcntl,termios,struct,select,time,signal,json,pathlib,re
sys.dont_write_bytecode=True
import pyte
ROOT=pathlib.Path(__file__).resolve().parents[3]
NODE=os.environ.get('HEURISKO_TEST_NODE',str(ROOT/'.tooling/node-v22.23.4/node-v22.23.4-darwin-arm64/bin/node'))
class Session:
 def __init__(self,cols,rows,args=(),color=False):
  self.cols,self.rows=cols,rows;self.closed=False;self.raw=bytearray();self.omitted=0;self.pid,self.fd=pty.fork()
  if self.pid==0:
   os.chdir(ROOT);fcntl.ioctl(0,termios.TIOCSWINSZ,struct.pack('HHHH',rows,cols,0,0))
   env={**os.environ,'TERM':'xterm-256color'};env.pop('CI',None);env.pop('FORCE_COLOR',None)
   if color or '--palette' in args:env.pop('NO_COLOR',None);env['FORCE_COLOR']='1' if '--palette' in args else '3';env['COLORTERM']='truecolor'
   else:env['NO_COLOR']='1'
   os.execve(NODE,[NODE,'packages/cli/dist/index.js',*args],env)
  os.set_blocking(self.fd,False);self.screen=pyte.Screen(cols,rows);self.stream=pyte.ByteStream(self.screen);self.read(.5)
 def read(self,duration=.15):
  end=time.monotonic()+duration
  while time.monotonic()<end:
   ready,_,_=select.select([self.fd],[],[],max(0,end-time.monotonic()))
   if ready:
    try:data=os.read(self.fd,262144)
    except OSError:break
    if not data:break
    self.raw.extend(data);self.stream.feed(data)
    if len(self.raw)>8*1024*1024:self.omitted+=len(self.raw)-8*1024*1024;del self.raw[:-8*1024*1024]
 def send(self,data,duration=.15):
  if isinstance(data,str):data=data.encode()
  pending=memoryview(data);end=time.monotonic()+5
  while pending:
   if time.monotonic()>end:raise TimeoutError('bounded PTY input write')
   ready,writable,_=select.select([self.fd],[self.fd],[],.05)
   if ready:self.read(.005)
   if writable:
    try:count=os.write(self.fd,pending[:1024]);pending=pending[count:]
    except BlockingIOError:pass
  self.read(duration)
 def frame(self):return '\n'.join(self.screen.display)
 def wait(self,text,seconds=8):
  end=time.monotonic()+seconds
  while text not in self.frame() and time.monotonic()<end:self.read(.1)
  assert text in self.frame(),repr(text)+' missing\n'+self.frame()
 def scroll_to(self,text,max_keys=60):
  for _ in range(max_keys):
   if text in self.frame():return
   self.send(b'j',.035)
  self.wait(text,.2)
 def resize(self,cols,rows):
  self.cols,self.rows=cols,rows;self.screen.resize(rows,cols);fcntl.ioctl(self.fd,termios.TIOCSWINSZ,struct.pack('HHHH',rows,cols,0,0));os.kill(self.pid,signal.SIGWINCH);self.read(.3)
 def capture(self,base):
  base=pathlib.Path(base);base.parent.mkdir(parents=True,exist_ok=True)
  def clean(b):
   b=b.replace(str(ROOT).encode(),b'<workspace>');return re.sub(rb'/(?:Users|private/var)/[^\s\x1b|]*',b'<local-path>',b)
  base.with_suffix('.txt').write_bytes(clean(self.frame().encode())+b'\n');base.with_suffix('.ansi').write_bytes(clean(bytes(self.raw)))
 def quit(self):
  if self.closed:return None
  self.send(b'q');end=time.monotonic()+4
  while time.monotonic()<end:
   pid,status=os.waitpid(self.pid,os.WNOHANG)
   if pid:self.closed=True;os.close(self.fd);return os.waitstatus_to_exitcode(status)
   self.read(.1)
  raise AssertionError('q did not quit application')
 def cleanup_readonly(self):
  if self.closed:return
  os.kill(self.pid,signal.SIGTERM);self.read(.3);pid,status=os.waitpid(self.pid,os.WNOHANG)
  if not pid:os.kill(self.pid,signal.SIGKILL);os.waitpid(self.pid,0)
  os.close(self.fd);self.closed=True
