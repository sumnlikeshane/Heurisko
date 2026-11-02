import importlib.util
from pathlib import Path
import unittest

spec=importlib.util.spec_from_file_location('grader',Path(__file__).with_name('grade-phase2.py'))
grader=importlib.util.module_from_spec(spec);spec.loader.exec_module(grader)

class GradingTests(unittest.TestCase):
    def case(self):
        return {'id':'original-construction','split':'development','family':'original-fixture-family','primaryCategory':'inert-mutated',
                'events':[{'artifactSha256':'a','sourceSha256':'s','pointer':'/scripts/postinstall','ruleClass':'Q1','direction':'remove','severity':'informational','priority':'low'}]}
    def test_absence_and_abstention_count_as_misses(self):
        case=self.case()
        for events in [[],[{**case['events'][0],'unresolved':True,'reason':'CONTENT_MISSING'}]]:
            result=grader.grade({'cases':[case]},{'cases':[{'id':case['id'],'events':events}]})
            self.assertEqual(result['events']['Q1']['fn'],1);self.assertEqual(result['events']['Q1']['unconditionalRecall'],0)
            self.assertIsNone(result['events']['Q1']['precision']);self.assertIsNone(result['acceptance'])
    def test_wrong_severity_is_separate_from_event_detection(self):
        case=self.case();result=grader.grade({'cases':[case]},{'cases':[{'id':case['id'],'events':[{**case['events'][0],'severity':'medium'}]}]})
        self.assertEqual(result['events']['Q1']['tp'],1);self.assertEqual(result['events']['Q1']['severityAgreement'],0)
        self.assertEqual(result['events']['Q1']['directionAccuracy'],1)
    def test_duplicates_cannot_inflate_true_positives(self):
        case=self.case()
        with self.assertRaisesRegex(ValueError,'duplicate'):
            grader.grade({'cases':[case]},{'cases':[{'id':case['id'],'events':case['events']*2}]})
    def test_family_and_shared_template_leakage_rejected(self):
        first=self.case();second={**first,'id':'other','split':'held-out'}
        with self.assertRaisesRegex(ValueError,'family leakage'):grader.validate({'cases':[first,second]},{'cases':[]})
        second['family']='other';first['relatedGroups']=['common-template'];second['relatedGroups']=['common-template']
        with self.assertRaisesRegex(ValueError,'group leaks'):grader.validate({'cases':[first,second]},{'cases':[]})
    def test_agent_labels_cannot_satisfy_held_out_gate(self):
        with self.assertRaisesRegex(ValueError,'independent human'):
            grader.validate({'cases':[self.case()],'reviewers':[{'kind':'implementing-agent','independentOfDetectorAuthorship':False}]},{'cases':[]},True)
    def test_cluster_interval_is_reproducible_and_claim_resolution_is_not_support(self):
        case=self.case();out={'cases':[{'id':case['id'],'events':case['events'],'factualClaimCount':1,'claimReviews':[{'citationResolved':True,'supported':False}]}]}
        a=grader.grade({'cases':[case]},out);self.assertEqual(a,grader.grade({'cases':[case]},out));self.assertEqual(a['citations']['resolved'],1);self.assertEqual(a['citations']['supported'],0)
    def test_file_explanation_and_policy_units_do_not_hide_misses_or_unsupported_pass(self):
        case=self.case();case['explanations']=[{'id':'file-pair-1'},{'id':'file-pair-2'}]
        case['policyDecisions']=[{'artifactSha256':'a','policyId':'required-v1','result':'violation'}]
        out={'id':case['id'],'explanationReviews':[{'id':'file-pair-1','supported':True}], 'policyDecisions':[{'artifactSha256':'a','policyId':'required-v1','result':'pass'}]}
        result=grader.grade({'cases':[case]},{'cases':[out]})
        self.assertEqual(result['explanations']['tp'],1);self.assertEqual(result['explanations']['fn'],1)
        self.assertEqual(result['policyDecisions']['fn'],1);self.assertEqual(result['criticalFailures']['unsupportedPolicyPass'],1)
        out['explanationReviews']*=2
        with self.assertRaisesRegex(ValueError,'duplicate'):grader.grade({'cases':[case]},{'cases':[out]})

if __name__=='__main__':unittest.main()
