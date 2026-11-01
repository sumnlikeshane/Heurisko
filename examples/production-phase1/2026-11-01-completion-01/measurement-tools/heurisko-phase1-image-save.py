from pathlib import Path
import subprocess,gzip,time,json,hashlib
receipt=Path('examples/production-phase1/2026-11-01-completion-01');out=Path('.heurisko/phase1-distribution-01/hosted-image.tar.gz');start=time.monotonic();expanded=0
with out.open('xb') as raw:
 with gzip.GzipFile(filename='',mode='wb',fileobj=raw,mtime=0) as zipped:
  p=subprocess.Popen(['docker','save','heurisko-phase1-completion-01:local'],stdout=subprocess.PIPE)
  while b:=p.stdout.read(1024*1024):expanded+=len(b);zipped.write(b)
  if p.wait()!=0:raise RuntimeError('docker save failed')
result={'image':'heurisko-phase1-completion-01:local','scope':'Local image save, compressed by host Python; no registry push or native Linux parser claim.','localArchive':str(out),'dockerSaveTarBytes':expanded,'compressedArchiveBytes':out.stat().st_size,'seconds':time.monotonic()-start,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(receipt/'image-archive.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
