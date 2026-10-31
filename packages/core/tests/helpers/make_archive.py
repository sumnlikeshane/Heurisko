"""Authored harmless archive fixtures and local inert mutations, never executed."""
import io,json,sys,tarfile,gzip
request=json.load(sys.stdin)
output=io.BytesIO()
with tarfile.open(fileobj=output,mode='w',format=tarfile.PAX_FORMAT) as tar:
    for entry in request['entries']:
        member=tarfile.TarInfo(entry['path']);member.mode=entry.get('mode',0o644);member.mtime=entry.get('mtime',0)
        data=entry.get('text','').encode('utf8') if 'hex' not in entry else bytes.fromhex(entry['hex'])
        kind=entry.get('type','file')
        if kind=='symlink':member.type=tarfile.SYMTYPE;member.linkname=entry.get('target','../outside')
        elif kind=='hardlink':member.type=tarfile.LNKTYPE;member.linkname=entry.get('target','../outside')
        elif kind=='fifo':member.type=tarfile.FIFOTYPE
        elif kind=='device':member.type=tarfile.CHRTYPE
        elif kind=='directory':member.type=tarfile.DIRTYPE
        else:member.size=entry.get('declaredSize',len(data))
        tar.addfile(member,io.BytesIO(data) if member.isfile() else None)
raw=output.getvalue()
if request.get('gzip',True):raw=gzip.compress(raw,mtime=request.get('gzipMtime',0))
sys.stdout.buffer.write(raw)
