import { retrieveEvidence, validateRetrievedCitations } from '../dist/index.js';
import { createSyntheticEvidence } from './synthetic-evidence.mjs';

const { bundle, manifest, source, excerpts } = createSyntheticEvidence();

const retrieval = retrieveEvidence(bundle, 'postinstall install lifecycle command', excerpts, { maxResults: 1 });
const validCitation = validateRetrievedCitations(bundle, retrieval.selected, [manifest.evidenceId]);
const unknownCitation = validateRetrievedCitations(bundle, retrieval.selected, ['ev_000000000000000000000000']);
const unselectedCitation = validateRetrievedCitations(bundle, retrieval.selected, [source.evidenceId]);
const noMatch = retrieveEvidence(bundle, 'astronomy telescope nebula', excerpts, { maxResults: 2 });

process.stdout.write(JSON.stringify({
  fixtureKind: bundle.fixtureKind,
  bundle,
  manifestEvidenceId: manifest.evidenceId,
  artifactEvidenceId: bundle.evidence.find((item) => item.kind === 'artifact_member').evidenceId,
  sourceEvidenceId: source.evidenceId,
  retrieval,
  validCitation,
  unknownCitation,
  unselectedCitation,
  noMatch,
}));
