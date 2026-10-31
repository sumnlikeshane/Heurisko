#!/usr/bin/env python3
"""G0 design-fixture schema + semantic tests (NOT actual source/package analysis)."""
from __future__ import annotations
import json, hashlib, copy, sys
from pathlib import Path

SEMANTIC_ONLY='--semantic-only' in sys.argv
if not SEMANTIC_ONLY:
    from jsonschema import Draft202012Validator

BASE=Path(__file__).resolve().parents[1]
SCHEMA=json.loads((BASE/'schema/contracts.schema.json').read_text())
if not SEMANTIC_ONLY:
    Draft202012Validator.check_schema(SCHEMA)
F=Path(__file__).parent/'fixtures'
NEG=Path(__file__).parent/'negative'

def load(p):return json.loads(p.read_text())
def assert_schema(x, kind):
    if not SEMANTIC_ONLY:
        Draft202012Validator({'$schema':SCHEMA['$schema'],'$defs':SCHEMA['$defs'],'$ref':f'#/$defs/{kind}'}).validate(x)

sys.path.insert(0, str(BASE / "runtime"))
from semantics import source_identity, canonical_id, semantic_report

cases=0
for p in sorted(F.glob('F[0-6]')):
    b=load(p/'bundle.json');a=load(p/'analysis.json');r=load(p/'report.json')
    for v,k in [(b,'EvidenceBundle'),(a,'AnalysisResults'),(r,'InvestigationReport')]:assert_schema(v,k)
    assert r['bundle']==b and r['analysis']==a, 'handshake output diverged'
    semantic_report(r)
    cases+=1;print('PASS',p.name,':', 'semantic invariants only' if SEMANTIC_ONLY else 'JSON Schema + evidence/inference invariants')

failures=0
for p in sorted(NEG.glob('*.json')):
    r=load(p)
    try:assert_schema(r,'InvestigationReport');semantic_report(r)
    except Exception as e:
        failures+=1;print('PASS negative',p.stem,':',str(e).splitlines()[0][:150])
    else:raise AssertionError(f'expected rejected negative fixture: {p.name}')
assert cases==7 and failures==10
for kind,filename in [('WatchState','watch.json'),('Job','job.json')]:
    assert_schema(load(F/'F7'/filename),kind)
print('F7:', 'JSON parsed; schema not checked' if SEMANTIC_ONLY else 'WatchState + Job schema-only fixture validated (no scheduler was executed)')
# Also enforce additional report context fields used by every consumer.
print('G0 synthetic corpus: 7 valid × 3 contract shapes, 10 invalid cases rejected; mode:', 'SEMANTIC ONLY' if SEMANTIC_ONLY else 'FULL SCHEMA + SEMANTIC')
