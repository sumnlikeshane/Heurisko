"""Bounded virtual tar inventory. Never extract names, import target code, or run hooks.

Only content hashes name spool files. The parent owns and removes the private spool.
JSONL is flushed after each completed member so interruption preserves known scope.
"""
import sys, os, json, hashlib, tarfile, gzip, resource, unicodedata, platform, base64

class Refused(Exception): pass
def refuse(code): raise Refused(code)
limits=json.loads(sys.argv[3])
resource.setrlimit(resource.RLIMIT_CPU,(limits['cpuSeconds'],limits['cpuSeconds']))
resource.setrlimit(resource.RLIMIT_AS,(limits['memoryBytes'],limits['memoryBytes']))
resource.setrlimit(resource.RLIMIT_FSIZE,(limits['expandedBytes'],limits['expandedBytes']))
resource.setrlimit(resource.RLIMIT_NOFILE,(32,32))
resource.setrlimit(resource.RLIMIT_CORE,(0,0))
os.umask(0o077)
root=sys.argv[2]
journal=open(os.path.join(root,'journal.jsonl'),'x',encoding='utf8')
journal_bytes=0
def emit(record):
    global journal_bytes
    encoded=json.dumps(record,ensure_ascii=True,separators=(',',':'))+'\n'
    if record['kind']=='member' and journal_bytes+len(encoded)>4*1024*1024-8192: refuse('ARCHIVE_INVENTORY_LIMIT')
    journal.write(encoded); journal.flush(); journal_bytes+=len(encoded)
def canonical_name(name,isdir):
    try: encoded=name.encode('utf8','strict')
    except UnicodeError: refuse('ARCHIVE_NAME_ENCODING')
    if len(encoded)>limits['pathBytes'] or len(name.split('/'))>limits['pathDepth']: refuse('ARCHIVE_PATH_LIMIT')
    if isdir and name.endswith('/'): name=name[:-1]
    if not name or name.startswith('/') or '\\' in name or ':' in name: refuse('ARCHIVE_UNSAFE_PATH')
    if any(part in ('','.','..') or part.endswith((' ','.')) for part in name.split('/')): refuse('ARCHIVE_UNSAFE_PATH')
    if any(ord(c)<32 or ord(c)==127 or unicodedata.category(c) in ('Cf','Cs') for c in name): refuse('ARCHIVE_AMBIGUOUS_NAME')
    if any(part.split('.')[0].casefold() in {'con','prn','aux','nul',*[f'com{i}' for i in range(1,10)],*[f'lpt{i}' for i in range(1,10)]} for part in name.split('/')): refuse('ARCHIVE_AMBIGUOUS_NAME')
    return name

class Bounded:
    def __init__(self,stream): self.stream=stream; self.count=0; self.tail=b''
    def read(self,n=-1):
        n=min(n if n>=0 else 65536,65536)
        chunk=self.stream.read(n); self.count+=len(chunk); self.tail=(self.tail+chunk)[-1024:]
        if self.count>limits['expandedBytes']: refuse('ARCHIVE_EXPANSION_LIMIT')
        return chunk

seen={}; prefixes={}; completed=0; known_bytes=0; current_entry=None
try:
    def cgroup(name):
        with open('/sys/fs/cgroup/'+name) as f: return f.read().strip()
    with open('/proc/self/status') as f:
        status=dict(line.split(':',1) for line in f if ':' in line)
    with open('/proc/mounts') as f:
        mounts=[line.split() for line in f]
    readonly=lambda path:any(row[1]==path and 'ro' in row[3].split(',') for row in mounts)
    network_up=[]
    for device in os.listdir('/sys/class/net'):
        flag_path='/sys/class/net/'+device+'/flags'
        if os.path.isfile(flag_path):
            with open(flag_path) as f:
                if int(f.read().strip(),16)&1: network_up.append(device)
    boundary=dict(python=platform.python_version(),platform=sys.platform,machine=platform.machine(),memoryBytes=int(cgroup('memory.max')),swapBytes=int(cgroup('memory.swap.max')),pids=int(cgroup('pids.max')),cpuSeconds=resource.getrlimit(resource.RLIMIT_CPU)[0],addressSpaceBytes=resource.getrlimit(resource.RLIMIT_AS)[0],rootReadOnly=readonly('/'),inputReadOnly=readonly('/input.tar'),workerReadOnly=readonly('/worker.py'),capabilities=status['CapEff'].strip(),noNewPrivileges=status['NoNewPrivs'].strip(),networkDevices=sorted(os.listdir('/sys/class/net')),networkUpDevices=sorted(network_up),dockerSocketPresent=os.path.exists('/var/run/docker.sock'))
    emit(dict(kind='runtime',**boundary))
    if not (boundary['python']=='3.13.18' and boundary['platform']=='linux' and boundary['memoryBytes']==limits['memoryBytes'] and boundary['addressSpaceBytes']==limits['memoryBytes'] and boundary['swapBytes']==0 and boundary['pids']==16 and boundary['rootReadOnly'] and boundary['inputReadOnly'] and boundary['workerReadOnly'] and int(boundary['capabilities'],16)==0 and boundary['noNewPrivileges']=='1' and boundary['networkUpDevices']==['lo'] and not boundary['dockerSocketPresent']): refuse('PARSER_BOUNDARY_UNAVAILABLE')
    raw=open(sys.argv[1],'rb')
    magic=raw.read(2); raw.seek(0)
    stream=gzip.GzipFile(fileobj=raw,mode='rb') if magic==b'\x1f\x8b' else raw
    bounded=Bounded(stream)
    # stdlib handles bounded PAX/GNU extension records. Final names are validated;
    # sparse/link/special entries are refused before extractfile is ever called.
    # Preserve opaque (including BSD xattr) metadata without interpreting it.
    # Every final pathname still must encode as strict UTF-8 in canonical_name.
    archive=tarfile.open(fileobj=bounded,mode='r|',encoding='utf-8',errors='surrogateescape',stream=True)
    for member in archive:
        current_entry=member
        if len(seen)>=limits['entries']: refuse('ARCHIVE_ENTRY_LIMIT')
        if member.sparse is not None or member.type not in (tarfile.REGTYPE,tarfile.AREGTYPE,tarfile.DIRTYPE): refuse('ARCHIVE_UNSUPPORTED_ENTRY')
        if member.size<0 or member.size>limits['memberBytes']: refuse('ARCHIVE_MEMBER_LIMIT')
        name=canonical_name(member.name,member.isdir()); folded=unicodedata.normalize('NFC',name).casefold()
        if folded in seen: refuse('ARCHIVE_DUPLICATE_OR_CASE_COLLISION')
        for i in range(1,len(name.split('/'))):
            original_parent='/'.join(name.split('/')[:i])
            parent=unicodedata.normalize('NFC',original_parent).casefold()
            if parent in prefixes and prefixes[parent]!=original_parent: refuse('ARCHIVE_DIRECTORY_CASE_COLLISION')
            prefixes[parent]=original_parent
            if parent in seen and seen[parent]=='file': refuse('ARCHIVE_FILE_DIRECTORY_COLLISION')
        if folded in prefixes and prefixes[folded]!=name: refuse('ARCHIVE_DIRECTORY_CASE_COLLISION')
        if member.isdir(): prefixes[folded]=name
        if member.isfile() and any(p.startswith(folded+'/') for p in seen): refuse('ARCHIVE_FILE_DIRECTORY_COLLISION')
        seen[folded]='directory' if member.isdir() else 'file'
        record=dict(originalName=member.name,path=name,type=seen[folded],mode=member.mode,uid=member.uid,gid=member.gid,mtime=str(member.mtime),size=member.size,pax=member.pax_headers)
        if member.isdir():
            if member.size: refuse('ARCHIVE_DIRECTORY_PAYLOAD')
        else:
            data=archive.extractfile(member); digest=hashlib.sha256(); actual=0
            # index is generated by this worker, never an archive-controlled name.
            spool=os.path.join(root,str(len(seen))+'.member')
            with open(spool,'xb') as output:
                while True:
                    chunk=data.read(65536)
                    if not chunk: break
                    actual+=len(chunk); known_bytes+=len(chunk)
                    if actual>limits['memberBytes'] or known_bytes>limits['expandedBytes']: refuse('ARCHIVE_EXPANSION_LIMIT')
                    output.write(chunk); digest.update(chunk)
            if actual!=member.size: refuse('ARCHIVE_TRUNCATED')
            record['sha256']='sha256:'+digest.hexdigest(); record['spool']=os.path.basename(spool)
            completed+=1
        emit(dict(kind='member',**record))
        current_entry=None
    # Drain validates gzip CRC/length and bounds all trailing expansion, even after
    # tarfile stops. Reject concatenated/hidden nonzero content after tar's EOF.
    # tarfile buffers ahead; inspect its unread buffer as well as the raw stream.
    buffered=archive.fileobj.buf
    if any(buffered): refuse('ARCHIVE_TRAILING_CONTENT')
    while True:
        chunk=bounded.read(65536)
        if not chunk: break
        if any(chunk): refuse('ARCHIVE_TRAILING_CONTENT')
    if bounded.count%512 or len(bounded.tail)<1024 or any(bounded.tail): refuse('ARCHIVE_TRUNCATED')
    emit(dict(kind='result',complete=True,code='OK',knownFiles=completed,knownBytes=known_bytes,expandedStreamBytes=bounded.count,remainingScope='none'))
except BaseException as error:
    code=str(error) if isinstance(error,Refused) else 'ARCHIVE_CORRUPT_OR_RESOURCE_FAILURE'
    rejected=None
    if current_entry is not None:
        # Inert diagnostic only. The full original header remains in the archive;
        # a bounded prefix and digest cannot control any filesystem path.
        raw_name=current_entry.name.encode('utf8','surrogatepass')
        rejected=dict(originalNamePrefix=current_entry.name[:256],nameCharacters=len(current_entry.name),nameSha256='sha256:'+hashlib.sha256(raw_name).hexdigest(),nameDigestEncoding='utf8-surrogatepass',nameTruncated=len(current_entry.name)>256,typeBase64=base64.b64encode(current_entry.type).decode(),linkNamePrefix=current_entry.linkname[:256],linkNameTruncated=len(current_entry.linkname)>256,sizeText=str(current_entry.size))
    emit(dict(kind='result',complete=False,code=code,knownFiles=completed,knownBytes=known_bytes,remainingScope='unknown',rejectedEntry=rejected))
    sys.exit(1)
finally:
    journal.close()
