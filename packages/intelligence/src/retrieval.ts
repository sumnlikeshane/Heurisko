import type { EvidenceBundle, EvidenceId, EvidenceRecord } from '@heurisko/contracts';

/**
 * A bounded excerpt already resolved by the evidence store. This module never
 * opens contentRef values or accesses the filesystem. Its locator comes from
 * the corresponding evidence record and remains attached to the excerpt.
 */
export interface EvidenceExcerpt {
  evidenceId: EvidenceId;
  contentRef: string;
  text: string;
}

export interface RetrievedEvidence {
  evidenceId: EvidenceId;
  kind: EvidenceRecord['kind'];
  side: EvidenceRecord['side'];
  path: string;
  startLine: number;
  endLine: number;
  text: string;
  score: number;
}

export interface RetrievalResult {
  method: 'lexical-v0';
  selected: RetrievedEvidence[];
  skipped: Array<{ evidenceId: EvidenceId; reason: string }>;
  limitations: string[];
}

export interface RetrievalOptions {
  maxResults: number;
}

const tokenize = (value: string): string[] =>
  value.toLocaleLowerCase('en-US').match(/[a-z0-9_]+/g) ?? [];

// Small, explicit vocabulary bridges for common package-investigation terms.
// This remains lexical retrieval: expansions do not assert that records entail
// the query, and citations still point to the original evidence record.
const QUERY_EXPANSIONS: Readonly<Record<string, readonly string[]>> = {
  startup: ['import', 'meta_path', 'add_shim', 'pth'],
  hook: ['import', 'add_shim', 'pth'],
  wheel: ['artifact', 'distribution'],
  cryptographically: ['digest', 'signature', 'attestation'],
  cryptographic: ['digest', 'signature', 'attestation'],
  provenance: ['digest', 'signature', 'attestation', 'source'],
  commit: ['source', 'revision'],
};

/**
 * Rank caller-resolved, bounded excerpts using deterministic lexical relevance.
 * Only excerpts whose evidence record is retained, addressable, and has an
 * exact path/line locator can be selected. No replacement evidence IDs are
 * minted. This is a retrieval baseline, not a semantic or factuality judge.
 */
export function retrieveEvidence(
  bundle: Readonly<EvidenceBundle>,
  query: string,
  excerpts: readonly EvidenceExcerpt[],
  options: RetrievalOptions,
): RetrievalResult {
  if (!Number.isInteger(options.maxResults) || options.maxResults < 1) {
    throw new RangeError('maxResults must be a positive integer');
  }

  const limitations: string[] = [];
  const skipped: RetrievalResult['skipped'] = [];
  const records = new Map(bundle.evidence.map((record) => [record.evidenceId, record]));
  const seen = new Set<EvidenceId>();
  const eligible: Array<{ record: EvidenceRecord; text: string; terms: string[] }> = [];

  for (const excerpt of excerpts) {
    const record = records.get(excerpt.evidenceId);
    if (!record) {
      skipped.push({ evidenceId: excerpt.evidenceId, reason: 'Evidence ID is absent from this bundle.' });
      continue;
    }
    if (seen.has(excerpt.evidenceId)) {
      skipped.push({ evidenceId: excerpt.evidenceId, reason: 'Duplicate excerpt for one evidence record was ignored.' });
      continue;
    }
    seen.add(excerpt.evidenceId);
    if (record.contentState !== 'retained' || !record.contentRef) {
      skipped.push({ evidenceId: excerpt.evidenceId, reason: 'Evidence content is not retained and addressable.' });
      continue;
    }
    if (excerpt.contentRef !== record.contentRef) {
      skipped.push({ evidenceId: excerpt.evidenceId, reason: 'Resolved excerpt does not match the evidence record content reference.' });
      continue;
    }
    if (!record.locator.path || !record.locator.startLine || !record.locator.endLine
      || record.locator.startLine < 1 || record.locator.endLine < record.locator.startLine) {
      skipped.push({ evidenceId: excerpt.evidenceId, reason: 'Evidence record has no exact valid path and line range.' });
      continue;
    }
    const terms = [
      ...tokenize(excerpt.text),
      ...tokenize(record.locator.path),
      ...tokenize(record.kind),
      ...tokenize(record.side),
      ...(record.side === 'artifact' ? ['artifact', 'distribution', 'wheel'] : []),
      ...(record.side === 'source' ? ['source', 'source_revision', 'commit'] : []),
    ];
    if (terms.length === 0) {
      skipped.push({ evidenceId: excerpt.evidenceId, reason: 'Resolved excerpt contains no searchable text.' });
      continue;
    }
    eligible.push({ record, text: excerpt.text, terms });
  }

  const baseQueryTerms = tokenize(query);
  const queryTerms = [...new Set(baseQueryTerms.flatMap((term) => [term, ...(QUERY_EXPANSIONS[term] ?? [])]))];
  if (queryTerms.length === 0) {
    limitations.push('Retrieval query contains no searchable terms; no excerpts were selected.');
    return { method: 'lexical-v0', selected: [], skipped, limitations };
  }

  const documentFrequency = new Map(queryTerms.map((term) => [
    term,
    eligible.reduce((count, item) => count + (item.terms.includes(term) ? 1 : 0), 0),
  ]));
  const ranked = eligible
    .map(({ record, text, terms }) => {
      const frequencies = new Map<string, number>();
      for (const term of terms) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
      const score = queryTerms.reduce((total, term) => {
        const frequency = frequencies.get(term) ?? 0;
        if (!frequency) return total;
        const df = documentFrequency.get(term) ?? 0;
        const idf = Math.log(1 + (eligible.length - df + 0.5) / (df + 0.5));
        return total + idf * ((frequency * 2.2) / (frequency + 1.2));
      }, 0);
      return { record, text, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.record.evidenceId.localeCompare(right.record.evidenceId));

  const selected = ranked.slice(0, options.maxResults).map(({ record, text, score }) => ({
    evidenceId: record.evidenceId,
    kind: record.kind,
    side: record.side,
    path: record.locator.path!,
    startLine: record.locator.startLine!,
    endLine: record.locator.endLine!,
    text,
    score,
  }));

  const unrepresented = bundle.evidence.filter((record) =>
    record.contentState !== 'retained' || !record.contentRef || !seen.has(record.evidenceId)
  );
  if (unrepresented.length > 0) {
    limitations.push(`${unrepresented.length} evidence record(s) were unavailable to retrieval because content was not retained or no excerpt was supplied.`);
  }
  if (ranked.length > selected.length) {
    limitations.push(`${ranked.length - selected.length} relevant excerpt(s) were omitted by the maxResults limit.`);
  }
  if (selected.length === 0) {
    limitations.push('No supplied retained excerpt matched the query; this is not evidence that no relevant content exists.');
  }

  return { method: 'lexical-v0', selected, skipped, limitations };
}

export interface CitationCheck {
  valid: boolean;
  unknownEvidenceIds: EvidenceId[];
  evidenceNotRetrieved: EvidenceId[];
}

/** Check reference membership only; it does not establish claim entailment. */
export function validateRetrievedCitations(
  bundle: Readonly<EvidenceBundle>,
  retrieved: readonly RetrievedEvidence[],
  citedEvidenceIds: readonly EvidenceId[],
): CitationCheck {
  const known = new Set(bundle.evidence.map((record) => record.evidenceId));
  const selected = new Set(retrieved.map((item) => item.evidenceId));
  const unique = [...new Set(citedEvidenceIds)];
  const unknownEvidenceIds = unique.filter((id) => !known.has(id));
  const evidenceNotRetrieved = unique.filter((id) => known.has(id) && !selected.has(id));
  return {
    valid: unique.length > 0 && unknownEvidenceIds.length === 0 && evidenceNotRetrieved.length === 0,
    unknownEvidenceIds,
    evidenceNotRetrieved,
  };
}
