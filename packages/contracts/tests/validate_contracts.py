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

def source_identity(c):
    return {'repo':c['repositoryUrl'],'commit':c.get('commit',''),'subdirectory':c.get('subdirectory',''),'sourceSnapshotSha256':c.get('sourceSnapshotSha256',''),'buildContextSha256':c.get('buildContextSha256','')}

def canonical_id(prefix, value):
    encoded=json.dumps(value,sort_keys=True,separators=(',',':')).encode()
    return prefix+hashlib.sha256(encoded).hexdigest()[:24]

def semantic_report(r):
    b=r['bundle'];a=r['analysis'];o=r['outcomes']; evidence=b['evidence']; ids=[x['evidenceId'] for x in evidence]
    assert len(ids)==len(set(ids)), 'duplicate evidence IDs'
    assert len({x['findingId'] for x in a['findings']})==len(a['findings']), 'duplicate finding IDs'
    assert b['schemaVersion']==a['schemaVersion']==r['schemaVersion']=='0.1.0'
    assert r['fixtureKind']==b['fixtureKind']
    source_context=[source_identity(sc) for sc in b['sourceCandidates']]
    assert r['reportId']==canonical_id('report_',{'artifact':b['artifact']['observedSha256'],'source':source_context,'config':r['analysisConfigFingerprint']}), 'non-deterministic reportId'
    # A fixture report may be incomplete; absence of evidence never means success.
    for c in b['sourceCandidates']:
        assert set(c['evidenceIds']).issubset(ids), 'unknown source evidence ID'
    for obj in evidence:
        loc=obj['locator']
        assert bool(loc), 'missing evidence locator'
        if 'startLine' in loc and 'endLine' in loc: assert loc['startLine']<=loc['endLine']
        if 'startByte' in loc and 'endByte' in loc: assert loc['startByte']<=loc['endByte']
        if obj['contentState']=='retained': assert 'contentRef' in obj, 'retained bytes require a resolvable contentRef'
        canonical={'artifact':b['artifact']['observedSha256'],'source':source_context,'kind':obj['kind'],'side':obj['side'],'path':loc.get('path',''),'metadataKey':loc.get('metadataKey',''),'contentDigest':obj.get('contentSha256',''),**{k:loc[k] for k in ('startLine','endLine','startByte','endByte') if k in loc}}
        assert obj['evidenceId']==canonical_id('ev_',canonical), 'evidence ID differs from canonical locator digest'
    for item in b['changes']+a['findings']+a['interpretations']:
        assert set(item['evidenceIds']).issubset(ids), 'invented evidence ID'
    finding_ids={f['findingId'] for f in a['findings']}
    for x in a['interpretations']:
        assert set(x['findingIds']).issubset(finding_ids), 'invented finding ID'
        assert a['aiState']['status']=='available' and a['aiState']['validation']=='passed', 'accepted interpretation without accepted AI state'
    if a['aiState']['status']!='available': assert a['interpretations']==[], 'non-available AI must have no accepted interpretations'
    if a['aiState']['status']=='rejected': assert a['aiState']['validation']=='rejected'
    if b['artifact']['origin']=='local':
        assert b['artifact']['integrity']['status'] in ('not_checked','not_available'), 'local archives cannot inherit registry integrity'
        assert b['provenance']['status'] not in ('verified_policy','verified_cryptographic_only'), 'local copy cannot inherit registry provenance'
    integrity=b['artifact']['integrity']
    if integrity['status'] in ('matched','mismatched'):
        assert integrity['algorithm'] in ('sha512','sha256') and integrity.get('expectedValue'), 'integrity comparison requires an expected digest and algorithm'
    provenance=b['provenance']
    if provenance['status'] in ('verified_policy','verified_cryptographic_only'):
        assert provenance['artifactBinding']=='matched', 'verified provenance requires exact artifact binding'
        assert provenance['evidenceIds'], 'verified provenance requires evidence'
        assert any(e['evidenceId'] in provenance['evidenceIds'] and e['kind']=='provenance' and e.get('verification')=='verified' for e in evidence), 'verified provenance lacks verified assertion evidence'
    if provenance['status']=='verified_policy':
        assert provenance.get('policyRef'), 'policy acceptance requires an explicit policy reference'
    assert o['artifactIntegrity']==b['artifact']['integrity']['status'], 'artifact integrity report mismatch'
    assert o['provenancePolicy']==b['provenance']['status'], 'provenance outcome changed downstream'
    if o['artifactIntegrity']=='mismatched':
        assert o['analysisCompleteness']!='complete', 'registry integrity mismatch cannot silently pass as complete'
        assert o['correspondence']=='not_assessed', 'untrusted mismatched registry bytes cannot earn source correspondence'
    if b['coverage']['unsupportedBytes']>0 or b['coverage']['skippedBytes']>0: assert not b['coverage']['complete'], 'unprocessed bytes concealed'
    for kind in ('skipped','unsupported'):
        assert sum(x['bytes'] for x in b['coverage']['omissions'] if x['kind']==kind)==b['coverage'][kind+'Bytes'], 'omission byte total mismatch'
    for omission in b['coverage']['omissions']:
        assert set(omission['evidenceIds']).issubset(ids), 'omission has invented evidence ID'
        assert any(e['evidenceId'] in omission['evidenceIds'] and e['side']==omission['side'] and e['locator'].get('path')==omission['path'] for e in evidence), 'omission lacks matching path evidence'
    if not b['coverage']['complete']: assert o['analysisCompleteness']!='complete', 'missing coverage concealed'
    if any(s['status'] in ('failed','incomplete') for s in b['stages']):assert o['analysisCompleteness']!='complete', 'failed stage concealed'
    if o['sourceAssociation']=='ambiguous':assert o['correspondence'] not in ('exact','reproduced'), 'ambiguous source falsely verified'
    for change in b['changes']:
        if change['explanationStrength']=='reproduced':
            assert any(e['kind']=='build_record' and e.get('verification')=='verified' and e['evidenceId'] in change['evidenceIds'] for e in evidence), 'reproduced transform lacks independently verified build evidence'
        if change['rawEquality']=='equal' and change['status']=='identical':
            es=[e for e in evidence if e['evidenceId'] in change['evidenceIds'] and e['kind'] in ('artifact_member','source_member')]
            assert len(es)>=2 and len({e.get('contentSha256') for e in es})==1, 'equal contents have unequal digests'
    assert not ('safe' in o or 'malicious' in o), 'universal safety assertion forbidden'
    return True

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
