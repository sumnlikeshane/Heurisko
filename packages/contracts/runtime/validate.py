"""One-request JSON bridge. No archive parsing, fetching, or package execution."""
import json
import sys
from pathlib import Path
from importlib.metadata import version
from jsonschema import Draft202012Validator
sys.path.insert(0, str(Path(__file__).resolve().parent))
from semantics import canonical_id, semantic_report

MAX_BYTES = 8 * 1024 * 1024
SCHEMA = json.loads((Path(__file__).resolve().parents[1] / 'schema/contracts.schema.json').read_text())
KINDS = {'ArtifactInput', 'AnalysisOptions', 'EvidenceBundle', 'AnalysisResults', 'InvestigationReport', 'WatchState', 'Job'}

def shape(value, kind):
    if kind not in KINDS:
        raise ValueError('unsupported contract kind')
    Draft202012Validator({'$schema': SCHEMA['$schema'], '$defs': SCHEMA['$defs'], '$ref': '#/$defs/' + kind}).validate(value)

def envelope(bundle, analysis):
    from semantics import source_identity
    config = 'boundary-validation-only'
    return dict(schemaVersion='0.1.0', reportId=canonical_id('report_', dict(artifact=bundle['artifact']['observedSha256'], source=[source_identity(c) for c in bundle['sourceCandidates']], config=config)), createdAt=bundle['artifact']['captureTime'], bundle=bundle, analysis=analysis, analysisConfigFingerprint=config, fixtureKind=bundle['fixtureKind'], outcomes=dict(artifactIntegrity=bundle['artifact']['integrity']['status'], sourceAssociation='ambiguous' if any(c['association']=='ambiguous' for c in bundle['sourceCandidates']) else 'unavailable', provenancePolicy=bundle['provenance']['status'], correspondence='not_assessed', analysisCompleteness='incomplete', policyResult='indeterminate'))

def validate(kind, value, bundle=None):
    shape(value, kind)
    if kind == 'InvestigationReport':
        semantic_report(value)
        if any(s['stage'] != 'ai' and s['status'] in ('failed', 'incomplete', 'running', 'not_started') for s in value['analysis']['stages']):
            assert value['outcomes']['analysisCompleteness'] != 'complete', 'incomplete analysis concealed'
    elif kind == 'EvidenceBundle':
        empty = dict(schemaVersion='0.1.0', findings=[], interpretations=[], stages=[], limitations=[], aiState=dict(status='disabled', validation='not_run'))
        semantic_report(envelope(value, empty))
    elif kind == 'AnalysisResults':
        assert bundle is not None, 'consumer validation requires its original bundle'
        validate('EvidenceBundle', bundle)
        semantic_report(envelope(bundle, value))
    b = value if kind == 'EvidenceBundle' else value.get('bundle') if kind == 'InvestigationReport' else bundle
    if b:
        ids = {e['evidenceId'] for e in b['evidence']}
        assert set(b['provenance']['evidenceIds']).issubset(ids), 'unknown provenance evidence'
        if b['artifact'].get('metadataEvidenceId'):
            assert b['artifact']['metadataEvidenceId'] in ids, 'unknown artifact metadata evidence'
    return True

def no_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('duplicate JSON object key')
        result[key] = value
    return result

def parse(raw):
    return json.loads(raw, object_pairs_hook=no_duplicates, parse_constant=lambda _: (_ for _ in ()).throw(ValueError('non-finite JSON number')))

def bounded_values(value, depth=0):
    if depth > 100:
        raise ValueError('JSON nesting limit')
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if not isinstance(value, int) or abs(value) > 9007199254740991:
            raise ValueError('requires safe integer')
    if isinstance(value, dict):
        for item in value.values(): bounded_values(item, depth + 1)
    if isinstance(value, list):
        for item in value: bounded_values(item, depth + 1)

if __name__ == '__main__':
    try:
        assert version('jsonschema') == '4.26.0', 'requires pinned jsonschema 4.26.0'
        raw = sys.stdin.buffer.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise ValueError('validation input limit exceeded')
        request = parse(raw)
        value = parse(request['rawValue']) if 'rawValue' in request else request['value']
        bounded_values(value)
        if request.get('bundle') is not None: bounded_values(request['bundle'])
        validate(request['kind'], value, request.get('bundle'))
        print('{"valid":true}')
    except Exception:
        # Do not echo attacker-controlled validation values, paths or control bytes.
        print('{"valid":false,"code":"CONTRACT_INVALID"}')
        sys.exit(1)
