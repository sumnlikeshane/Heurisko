#!/usr/bin/env python3
"""Reproducible P2-EVAL grading of frozen, independently reviewed observations.

Inputs are explicit human labels plus normalized detector observations. This
does not infer intent or citation entailment. Human claim reviews supply support
judgments. Development mode never grants independent/held-out acceptance.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import random
import statistics

CATEGORIES = ('benign-authored', 'benign-generated', 'inert-mutated', 'ambiguous-incomplete')

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def ratio(n, d):
    return n / d if d else None

def event_key(event):
    return tuple(event[k] for k in ('artifactSha256', 'sourceSha256', 'pointer', 'ruleClass'))

def unique(items, key):
    mapped = {}
    for item in items:
        k = key(item)
        if k in mapped:
            raise ValueError(f'duplicate grading unit: {k}')
        mapped[k] = item
    return mapped

def validate(labels, observations, held_out=False):
    cases = unique(labels['cases'], lambda c: c['id'])
    outputs = unique(observations['cases'], lambda c: c['id'])
    if set(outputs) - set(cases):
        raise ValueError('unlabeled output cases')
    families = defaultdict(set)
    for c in cases.values():
        if c['primaryCategory'] not in CATEGORIES:
            raise ValueError('unknown primary category')
        families[c['family']].add(c['split'])
    if any(len(splits) > 1 for splits in families.values()):
        raise ValueError('family leakage across splits')
    groups = defaultdict(set)
    for c in cases.values():
        for group in c.get('relatedGroups', []):
            groups[group].add(c['split'])
    if any(len(splits) > 1 for splits in groups.values()):
        raise ValueError('related project/template group leaks across splits')
    if held_out:
        reviewers = labels['reviewers']
        if not reviewers or any(r['kind'] != 'human' or not r['independentOfDetectorAuthorship'] for r in reviewers):
            raise ValueError('independent human labels required')
        if labels.get('version')!='heurisko-p2-labels-v1' or observations.get('version')!='heurisko-p2-observations-v2':
            raise ValueError('supported frozen evaluation formats required')
        reviewer_ids = {r['id'] for r in reviewers}
        held = [c for c in cases.values() if c['split'] == 'held-out' and not c.get('excluded')]
        dev = [c for c in cases.values() if c['split'] == 'development' and not c.get('excluded')]
        if len({c['family'] for c in dev}) < 12 or len({c['family'] for c in held}) < 24 or len(held) < 120:
            raise ValueError('P2-EVAL family/report minima unmet')
        for category in CATEGORIES:
            subset = [c for c in held if c['primaryCategory'] == category]
            if len(subset) < 30 or len({c['family'] for c in subset}) < 6:
                raise ValueError('P2-EVAL category minima unmet')
        labeled_directions=Counter((e['ruleClass'],e['direction']) for c in held for e in c.get('events',[]))
        if any(labeled_directions[(rule,direction)]<10 for rule in ('Q1.lifecycle','Q1.script','Q2.entrypoint') for direction in ('add','change','remove')):
            raise ValueError('P2-EVAL labeled direction minima unmet before grading')
        for c in held:
            if not c.get('reviewerIds') or not set(c['reviewerIds']) <= reviewer_ids or not c.get('labeledBeforeOutputs'):
                raise ValueError('missing blind human label provenance')
            if c.get('consequentialTrustOrBuild') and len(set(c['reviewerIds'])) < 2:
                raise ValueError('second independent reviewer required')
            if not c.get('rightsAccepted') or not c.get('immutableEvidenceHashes'):
                raise ValueError('rights/evidence entry gate unmet')
            out=outputs.get(c['id'])
            if out and (not out.get('humanReviewComplete') or out.get('reviewerId') not in reviewer_ids or 'humanReviewedFalseEscalation' not in out or 'factualClaimCount' not in out or 'criticalFailures' not in out):
                raise ValueError('independent output/claim/escalation review required')
            if out and out.get('claimUnitsAreProvisional'):
                raise ValueError('atomic factual claims require independent enumeration/review')
            if out and any(r.get('reviewerId') not in reviewer_ids for r in out.get('explanationReviews', [])):
                raise ValueError('independent explanation review required')
    return cases, outputs

def grade(labels, observations, held_out=False):
    cases, outputs = validate(labels, observations, held_out)
    classes = defaultdict(Counter);categories = defaultdict(Counter);families = defaultdict(Counter)
    citations = Counter();explanations = Counter();uncertainty = Counter();critical = Counter();policy = Counter();policy_matrix = Counter()
    directions = defaultdict(Counter);reasons = Counter();subgroups = Counter()
    split='held-out' if held_out else 'development'
    selected = [c for c in cases.values() if c['split'] == split and not c.get('excluded')]
    for case in selected:
        out = outputs.get(case['id'], {})
        cat, family = categories[case['primaryCategory']], families[case['family']]
        cat['reports'] += 1;family['reports'] += 1
        for tag in case.get('secondaryTags', []):subgroups[tag] += 1
        if not out:cat['missingOutputs'] += 1
        expected = unique(case.get('events', []), event_key)
        actual = unique(out.get('events', []), event_key)
        cat['expectedEvents']+=len(expected);cat['observedEvents']+=len(actual)
        for key, event in expected.items():
            cls = classes[event['ruleClass']];cls['eligible'] += 1
            directions[event['ruleClass']][event['direction']] += 1
            observed = actual.get(key)
            if not observed or observed.get('unresolved'):
                cls['fn'] += 1;cls['abstained'] += int(bool(observed));family['misses'] += 1
            else:
                cls['tp'] += 1
                for field in ('direction', 'severity', 'priority'):
                    cls[field + 'Correct'] += int(observed[field] == event[field])
            family['eligible'] += 1
        for key, event in actual.items():
            if key not in expected and not event.get('unresolved'):
                classes[event['ruleClass']]['fp'] += 1
            if event.get('reason'):reasons[event['reason']] += 1
        cat['falseEscalations'] += int(out.get('humanReviewedFalseEscalation', False))
        cat['escalationUnreviewed'] += int('humanReviewedFalseEscalation' not in out)
        cat['unresolvedOutputs'] += int(out.get('unresolved', False))
        for review in out.get('claimReviews', []):
            citations['claims'] += 1
            cat['claims'] += 1;family['claims'] += 1
            citations['resolved'] += int(review['citationResolved'])
            citations['supported'] += int(review['supported'])
            cat['resolvedCitations'] += int(review['citationResolved']);cat['supportedClaims'] += int(review['supported'])
            if held_out and (review.get('reviewerId') not in {r['id'] for r in labels['reviewers']}):
                raise ValueError('claim support lacks independent review')
        citations['unreviewedClaims'] += max(0, out.get('factualClaimCount', 0) - len(out.get('claimReviews', [])))
        if case.get('independentlyExplainableGenerated'):
            explanations['eligible'] += 1
            explanations['explained'] += int(out.get('supportedExplanation', False))
        expected_explanations=unique(case.get('explanations', []),lambda e:e['id'])
        actual_explanations=unique(out.get('explanationReviews', []),lambda e:e['id'])
        for key, explanation in actual_explanations.items():
            explanations['tp' if key in expected_explanations and explanation['supported'] else 'fp'] += 1
        explanations['fileUnitsEligible'] += len(expected_explanations)
        explanations['fn'] += sum(1 for key in expected_explanations if key not in actual_explanations or not actual_explanations[key]['supported'])
        expected_policy=unique(case.get('policyDecisions', []),lambda p:(p['artifactSha256'],p['policyId']))
        actual_policy=unique(out.get('policyDecisions', []),lambda p:(p['artifactSha256'],p['policyId']))
        for key, expected_decision in expected_policy.items():
            actual_decision=actual_policy.get(key,{}).get('result','missing')
            policy['eligible'] += 1;policy_matrix[(expected_decision['result'],actual_decision)] += 1
            if actual_decision==expected_decision['result']:policy['tp'] += 1
            else:
                policy['fn'] += 1;policy['fp'] += int(actual_decision not in ('missing','indeterminate','not_evaluated'))
                if actual_decision=='pass':critical['unsupportedPolicyPass'] += 1
        policy['fp'] += sum(1 for key in actual_policy if key not in expected_policy)
        if case.get('mustRemainUnresolved'):
            uncertainty['required'] += 1;uncertainty['preserved'] += int(out.get('unresolved', False))
        for flag in out.get('criticalFailures', []):critical[flag] += 1
    metrics = {}
    for name, c in sorted(classes.items()):
        metrics[name] = {**c, 'precision':ratio(c['tp'], c['tp']+c['fp']), 'unconditionalRecall':ratio(c['tp'],c['eligible']),
                         'directionAccuracy':ratio(c['directionCorrect'],c['tp']), 'severityAgreement':ratio(c['severityCorrect'],c['tp']),
                         'priorityAgreement':ratio(c['priorityCorrect'],c['tp']), 'directions':dict(directions[name])}
    # Fixed-seed family bootstrap: interval describes these clusters only.
    eligible = [v for v in families.values() if v['eligible']]
    rng = random.Random(20261102);samples=[]
    if len(eligible)>=2:
        for _ in range(2000):
            sample = rng.choices(eligible,k=len(eligible))
            samples.append(statistics.mean(1-f['misses']/f['eligible'] for f in sample))
        samples.sort()
    gates = []
    if held_out:
        gates.append(all(c['id'] in outputs for c in selected))
        for rule in sorted(set(('Q1.lifecycle','Q1.script','Q2.entrypoint')) | set(classes)):
            m=metrics.get(rule,{})
            gates.append(bool(m) and all(m.get(k) is not None and m[k]>=v for k,v in [('precision',.95),('unconditionalRecall',.95),('directionAccuracy',1),('severityAgreement',.95),('priorityAgreement',.95)]) and all(directions[rule][d]>=10 for d in ('add','change','remove')))
        gates.extend([not critical, citations['claims']>0, citations['unreviewedClaims']==0, citations['resolved']==citations['claims'], citations['supported']==citations['claims'],
                      explanations['tp']+explanations['fp']>0, (ratio(explanations['tp'],explanations['tp']+explanations['fp']) or 0)>=.95,
                      (ratio(explanations['explained'],explanations['eligible']) or 0)>=.70,uncertainty['required']>0,uncertainty['preserved']==uncertainty['required']])
        for category in ('benign-authored','benign-generated'):
            c=categories[category];gates.append((ratio(c['falseEscalations'],c['reports']) or 0)<=.05)
        # These receipts cannot stand in for mandatory verifier/compatibility fixtures.
        gates.append(observations.get('mandatoryConformanceComplete') is True)
    return {'authority':'independent held-out grading' if held_out else 'development only; labels may be implementing-agent constructions',
            'acceptance':all(gates) if held_out else None,'reportCount':len(selected),'events':metrics,'exclusivePrimaryCategories':dict(categories),
            'overlappingSubgroups':dict(subgroups),'families':dict(families),'familyWeightedRecall':statistics.mean(1-f['misses']/f['eligible'] for f in eligible) if eligible else None,
            'familyClusterBootstrap95': [samples[49],samples[1949]] if samples else None,
            'familyBootstrapEligibleClusters':len(eligible),
            'reviewCoverage':{'humanReviewedReports':sum(bool(outputs.get(c['id'],{}).get('humanReviewComplete')) for c in selected),'unreviewedReports':sum(not outputs.get(c['id'],{}).get('humanReviewComplete',False) for c in selected),'provisionalClaimUnitReports':sum(bool(outputs.get(c['id'],{}).get('claimUnitsAreProvisional')) for c in selected)},
            'citations':dict(citations),'explanations':dict(explanations),'uncertainty':dict(uncertainty),'criticalFailures':dict(critical),'abstentionReasons':dict(reasons),
            'policyDecisions':{**policy,'precision':ratio(policy['tp'],policy['tp']+policy['fp']),'unconditionalRecall':ratio(policy['tp'],policy['eligible']),'matrix':[{'expected':k[0],'actual':k[1],'count':v} for k,v in sorted(policy_matrix.items())]},
            'exclusions':[{'id':c['id'],'reason':c.get('exclusionReason','unspecified')} for c in cases.values() if c['split']==split and c.get('excluded')],
            'limitations':['No malware/population accuracy inference.','Citation entailment and false escalation are human judgments, not inferred from resolution.','Zero denominators are N/A; missing/abstained supported events count as misses.','Independent grading does not grant phase acceptance or Q4 admission.']}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('labels',type=Path);parser.add_argument('observations',type=Path);parser.add_argument('out',type=Path)
    parser.add_argument('--held-out',action='store_true');parser.add_argument('--freeze',type=Path)
    args=parser.parse_args()
    if args.held_out:
        if not args.freeze:raise ValueError('freeze receipt required before held-out grading')
        freeze=json.loads(args.freeze.read_text())
        if freeze['labelsSha256']!=digest(args.labels) or not freeze.get('independentCustodian') or not freeze.get('codeSha256') or not freeze.get('configurationSha256') or not freeze.get('frozenBeforeOutputs'):
            raise ValueError('freeze identity/provenance gate unmet')
        observations=json.loads(args.observations.read_text())
        if observations.get('codeSha256')!=freeze['codeSha256'] or observations.get('configurationSha256')!=freeze['configurationSha256']:
            raise ValueError('graded outputs do not match frozen code/configuration')
        # Input/reviewer/minimum gates precede grading; a blocked gate is not
        # a detector grading attempt. Once eligible, preserve the one attempt.
        validate(json.loads(args.labels.read_text()),observations,True)
        with args.freeze.with_suffix('.grading-attempt.json').open('x') as stream:
            json.dump({'labelsSha256':digest(args.labels),'observationsSha256':digest(args.observations),'graderSha256':digest(__file__),'output':str(args.out)},stream,indent=2)
    result=grade(json.loads(args.labels.read_text()),json.loads(args.observations.read_text()),args.held_out)
    result['inputs']={'labelsSha256':digest(args.labels),'observationsSha256':digest(args.observations),'graderSha256':digest(__file__)}
    with args.out.open('x') as stream:json.dump(result,stream,indent=2);stream.write('\n')
    print(json.dumps({'acceptance':result['acceptance'],'reports':result['reportCount']}))

if __name__=='__main__':main()
