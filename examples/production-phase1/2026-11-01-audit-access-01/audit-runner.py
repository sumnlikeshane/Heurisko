import datetime, hashlib, importlib.util, json, os, pathlib, platform, subprocess, time
root=pathlib.Path('/Users/sumnlikehsane/Desktop/Shane/Projects/Heurisko')
out=root/'examples/production-phase1/2026-11-01-audit-access-01'
out.mkdir(exist_ok=False)
spec=importlib.util.spec_from_file_location('phasechecks',root/'scripts/phase1-checks.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
(out/'source-before.json').write_text(json.dumps(mod.snapshot(),indent=2)+'\n')
env=dict(os.environ);env['PATH']='/private/tmp/heurisko-phase1-audit-20261101-tools/bin:'+str(root/'.venv/bin')+':'+env['PATH']
checks=[('docker-access',['docker','info','--format','{{.OSType}} {{.Architecture}}']),('core',['node','--test','--test-concurrency=1',*[str(p.relative_to(root)) for p in sorted((root/'packages/core/tests').glob('*.test.mjs'))]]),('web',['pnpm','--filter','@heurisko/web','test'])]
result={'started':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Fresh local audit checks; no platform, human, rights or remote CI acceptance inferred.','host':{'system':platform.system(),'release':platform.release(),'machine':platform.machine()},'checks':[]}
for name,argv in checks:
 started=time.monotonic()
 with (out/(name+'.stdout.log')).open('xb') as stdout,(out/(name+'.stderr.log')).open('xb') as stderr:
  done=subprocess.run(argv,cwd=root,env=env,stdout=stdout,stderr=stderr)
 entry={'name':name,'argv':argv,'exit':done.returncode,'seconds':round(time.monotonic()-started,3)};result['checks'].append(entry)
 (out/'validation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(entry),flush=True)
(out/'source-after.json').write_text(json.dumps(mod.snapshot(),indent=2)+'\n')
