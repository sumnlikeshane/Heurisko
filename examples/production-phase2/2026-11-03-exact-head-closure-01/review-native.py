import pathlib,sys,json,hashlib,zipfile,subprocess,re,datetime
archive=pathlib.Path(sys.argv[1]);expected_zip=sys.argv[2];head=sys.argv[3];out=pathlib.Path(sys.argv[4]);sha=lambda b:hashlib.sha256(b).hexdigest()
assert sha(archive.read_bytes())==expected_zip
with zipfile.ZipFile(archive) as z:
 members={n:{'sha256':sha(z.read(n)),'bytes':len(z.read(n))} for n in z.namelist()}
 read=lambda n:json.loads(z.read(n));root='closure-native/';admission=read(root+'admission.json');summary=read(root+'summary.json');manifest=read('closure-source/manifest.json');commands=read(root+'commands.json')
 assert admission['mode']=='native-required' and admission['nativeHostAndEngine'] and admission['pinnedTools'] and not admission['sourceMismatches']
 assert manifest['head']==head and sha(z.read('closure-source/manifest.json'))==admission['manifestSha256']
 assert summary['passed'] and summary['nativeAccepted'] and not summary['sourceChanged'] and not summary['failures'] and summary['checksExecuted']==18 and summary['checksBlocked']==0
 assert len(commands)==18 and all(c['exit']==0 and c['executed'] for c in commands)
 node=json.loads(admission['guards']['node']['stdout']);engine=json.loads(admission['guards']['docker']['stdout']);assert node=={'node':'v22.23.4','platform':'linux','arch':'x64','openssl':node['openssl']};assert engine['OSType']=='linux' and engine['Architecture']=='x86_64' and 'Docker Desktop' not in engine['OperatingSystem']
 # Verify every selected byte against immutable Git blobs, not the modified worktree.
 proc=subprocess.Popen(['git','cat-file','--batch'],stdin=subprocess.PIPE,stdout=subprocess.PIPE);mismatches=[]
 for name,expected in manifest['files'].items():
  assert '\n' not in name and '\r' not in name
  proc.stdin.write((head+':'+name+'\n').encode());proc.stdin.flush();header=proc.stdout.readline().decode().split();assert len(header)==3 and header[1]=='blob',(name,header)
  data=proc.stdout.read(int(header[2]));assert proc.stdout.read(1)==b'\n'
  if sha(data)!=expected:mismatches.append(name)
 proc.stdin.close();assert proc.wait()==0;assert not mismatches,mismatches
 identity=read(root+'controlled-runtime/CONTROLLED-TEST-ONLY.json');expected_worker='9e13daace8ae961d9ed60d63dfe3cedc48364d44ac56ccdacec3868a375d00e1';assert identity['productionWorkerSha256']==expected_worker
 for field,name in [('testWorkerSha256','packages/core/dist/verifier-worker.cjs'),('testBootstrapSha256','packages/core/runtime/trust-bootstrap.json'),('hostEvaluatorSha256','packages/core/dist/trust.js')]:assert sha(z.read(root+'controlled-runtime/'+name))==identity[field]
 assert manifest['files']['packages/core/runtime/verifier-worker.ts']==identity['evaluatorSourceSha256'];assert manifest['files']['packages/core/runtime/trust-bootstrap.json']==identity['productionBootstrapSha256']
 fixtures=read(root+'controlled-fixtures/manifest.json');assert sha(z.read(root+'controlled-fixtures/manifest.json'))==identity['fixtureManifestSha256']
 for name,h in fixtures['files'].items():assert sha(z.read(root+'controlled-fixtures/'+name))==h
 worker=read(root+'production-worker/summary.json');controlled=read(root+'controlled-worker/summary.json');application=read(root+'controlled-application/summary.json');real=read(root+'real-application/summary.json');parser=read(root+'parser-boundary.json')
 assert worker['passed'] and worker['checks']==82 and not worker['failures'] and worker['platform']=='linux' and worker['arch']=='x64'
 assert controlled['passed'] and controlled['checks']==61 and controlled['productionRejectsControlled'] and not controlled['matrixOnly'] and not controlled['failures']
 assert application['passed'] and application['checks']==24 and application['actualCliExits']==[0,1,2,3] and application['attemptedCases']==application['plannedCases']==23 and application['errors']==0
 for directory in ['production-worker','controlled-worker']:
  rows=[read(n) for n in z.namelist() if n.startswith(root+directory+'/') and n.endswith('.json') and not n.endswith('/summary.json')]
  for row in rows:
   assert row['pass'],row.get('id')
   ident=row['identity'];assert ident['cleanup'] in ['confirmed_absent','not_started']
   if ident.get('creationAcknowledged'):
    assert re.fullmatch('[a-f0-9]{64}',ident['containerId']);assert ident['cleanup']=='confirmed_absent';assert ident['controls'][-1]['operation']=='container' and ident['controls'][-1]['exitCode']==0
   if directory=='production-worker' and ident['cleanup']!='not_started':assert ident['workerSha256']=='sha256:'+expected_worker
   if ident['cleanup']=='not_started':assert row['id'] in ['input-size','input-limit'] and row['result']['reason']=='VERIFIER_INPUT_LIMIT'
 assert parser['passed'] and len(parser['results'])==2 and all(x['cleanupConfirmed'] for x in parser['results'])
 assert real['passed'] and real['sourceUnavailableFixture'] and len(real['results'])==5
 for lane,rows in [('controlled-application',application['results']),('real-application',real['results'])]:
  for row in rows:
   assert row['pass'];name=root+lane+'/'+row['id']+'/report.json'
   data=z.read(name);report=json.loads(data);assert 'sha256:'+sha(data)==row['reportSha256'];assert report['outcomes']==row['outcomes']
   if lane=='real-application':
    assert report['outcomes']['analysisCompleteness']=='incomplete' and report['outcomes']['correspondence'] not in ['exact','reproduced'];assert report['bundle']['coverage']['complete'] is False;assert not any(e['kind']=='source_member' or e['locator'].get('metadataKey')=='raw-source-bytes' for e in report['bundle']['evidence']);assert not any(c.get('sourceSnapshotSha256') for c in report['bundle']['sourceCandidates'])
    inventory_evidence=next(e for e in report['bundle']['evidence'] if e.get('side')=='source' and e['locator'].get('metadataKey')=='archive-inventory');inventory=read(root+lane+'/'+row['id']+'/store/blobs/'+inventory_evidence['contentRef'].removeprefix('sha256:'));assert inventory['members']==[] and inventory['knownFiles']==inventory['knownBytes']==0 and inventory['complete'] is False
 counts={}
 for name in ['core','readers-tui','web','scanner-tests']:
  log=z.read(root+name+'.stdout.log').decode();counts[name]={k:int(v) for k,v in re.findall(r'^# (tests|pass|fail|skipped) (\d+)$',log,re.M)};assert counts[name]['tests']==counts[name]['pass'] and counts[name]['fail']==counts[name]['skipped']==0
 result={'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sourceCommit':head,'artifact':archive.name,'artifactSha256':expected_zip,'artifactMembers':len(members),'sourceManifestSha256':admission['manifestSha256'],'selectedGitBlobsVerified':len(manifest['files']),'sourceMismatches':mismatches,'all18CommandsPassed':True,'nativeAccepted':True,'sourceUnchanged':True,'hostNode':node,'hostKernel':admission['guards']['uname']['stdout'],'python':admission['guards']['python']['stdout'],'pnpm':admission['guards']['pnpm']['stdout'],'docker':{k:engine[k] for k in ['OSType','Architecture','OperatingSystem','ServerVersion','NCPU','MemTotal']},'counts':counts,'productionWorkerChecks':worker['checks'],'controlledWorkerChecks':controlled['checks'],'controlledApplicationChecks':application['checks'],'genuineApplicationCases':len(real['results']),'controlledCliExits':application['actualCliExits'],'productionWorkerSha256':expected_worker,'controlledRuntimeIdentity':identity,'checks':'ZIP digest; all selected Git blobs; admission and unchanged-source receipts; every command; fixture and compiled-runtime hashes; all per-case worker cleanup; report byte hashes/outcomes; source-unavailable omissions; actual suite counts.','limitations':['Conformance and retained public fixtures, not independent held-out population accuracy.','Original Mac Docker failures remain retained; native passing evidence does not prove arbitrary host/VM latency eliminated.','CLI/shared reader/TUI model/web parity is not new GUI/AT acceptance.']}
 (out/'native-review-02.json').write_text(json.dumps(result,indent=2)+'\n');member_text=json.dumps(members,indent=2)+'\n'
 if (out/'native-artifact-members.json').exists():assert (out/'native-artifact-members.json').read_text()==member_text
 else:(out/'native-artifact-members.json').write_text(member_text);print(json.dumps(result,indent=2))
