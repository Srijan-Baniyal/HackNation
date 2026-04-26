import type { HealthcareFacility } from "@/lib/crisis/types";
import {
  chunkFacility,
  type FacilityChunk,
  tokenize,
} from "@/lib/graph-rag/chunking";

export interface ScoredChunk {
  chunk: FacilityChunk;
  /** Per-stage scores so the UI can show why something matched. */
  components: {
    bm25: number;
    facetBoost: number;
    weight: number;
  };
  /** Final fused score after lexical + facet boosts. */
  score: number;
}

export interface RetrievalReport {
  /** All chunks ranked (used for analytics, capped to a sane number). */
  allRanked: ScoredChunk[];
  /** Total chunks indexed for this corpus. */
  corpusSize: number;
  /** Tokens the query expanded into (visible in the UI). */
  queryTerms: string[];
  /** Top fused chunks (already MMR-diversified). */
  topChunks: ScoredChunk[];
  /** Unique facilities that survived MMR diversification. */
  uniqueFacilities: number;
}

/**
 * Build a chunked corpus + inverted index over facilities. The index is
 * pure data; callers are free to memoise it across requests.
 */
export interface ChunkedCorpus {
  /** mean token length across the corpus */
  avgLength: number;
  chunks: FacilityChunk[];
  /** term -> number of chunks containing it (document frequency) */
  docFreq: Map<string, number>;
  /** length (in tokens) of every chunk */
  lengths: number[];
  /** chunkIndex -> term -> count */
  termFreq: Map<number, Map<string, number>>;
}

export function buildCorpus(facilities: HealthcareFacility[]): ChunkedCorpus {
  const chunks: FacilityChunk[] = [];
  for (const facility of facilities) {
    for (const chunk of chunkFacility(facility)) {
      chunks.push(chunk);
    }
  }

  const termFreq = new Map<number, Map<string, number>>();
  const docFreq = new Map<string, number>();
  const lengths: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < chunks.length; i++) {
    const tokens = chunks[i].terms;
    const freq = new Map<string, number>();
    for (const token of tokens) {
      freq.set(token, (freq.get(token) ?? 0) + 1);
    }
    termFreq.set(i, freq);
    lengths.push(tokens.length);
    totalLength += tokens.length;
    for (const term of freq.keys()) {
      docFreq.set(term, (docFreq.get(term) ?? 0) + 1);
    }
  }

  return {
    chunks,
    termFreq,
    docFreq,
    lengths,
    avgLength: chunks.length === 0 ? 0 : totalLength / chunks.length,
  };
}

/** BM25 hyper-parameters. k1 controls term frequency saturation, b is length normalisation. */
const BM25_K1 = 1.5;
const BM25_B = 0.75;

function bm25Score(
  corpus: ChunkedCorpus,
  chunkIdx: number,
  queryTerms: string[]
): number {
  const tf = corpus.termFreq.get(chunkIdx);
  if (!tf) {
    return 0;
  }
  const length = corpus.lengths[chunkIdx];
  const totalDocs = corpus.chunks.length;
  let score = 0;
  const seen = new Set<string>();
  for (const term of queryTerms) {
    if (seen.has(term)) {
      continue;
    }
    seen.add(term);
    const df = corpus.docFreq.get(term);
    if (!df) {
      continue;
    }
    const termCount = tf.get(term) ?? 0;
    if (termCount === 0) {
      continue;
    }
    const idf = Math.log(1 + (totalDocs - df + 0.5) / (df + 0.5));
    const norm = 1 - BM25_B + (BM25_B * length) / (corpus.avgLength || 1);
    const tfWeight = (termCount * (BM25_K1 + 1)) / (termCount + BM25_K1 * norm);
    score += idf * tfWeight;
  }
  return score;
}

export interface QueryFacets {
  category?: string | null;
  confidence?: string | null;
  district?: string | null;
  facilityType?: string | null;
  severity?: string | null;
  state?: string | null;
}

/**
 * Soft facet boosts: matching facets multiply the score, missing facets
 * leave it untouched. We never hard-filter so a query like "kidney rural"
 * still surfaces the right candidates even if we didn't infer a state.
 */
function facetBoost(chunk: FacilityChunk, facets: QueryFacets): number {
  let boost = 1;
  if (facets.state && chunk.facets.state === facets.state) {
    boost *= 1.5;
  }
  if (facets.district && chunk.facets.district === facets.district) {
    boost *= 1.4;
  }
  if (facets.category && chunk.facets.category === facets.category) {
    boost *= 1.6;
  }
  if (facets.severity && chunk.facets.severity === facets.severity) {
    boost *= 1.35;
  }
  if (facets.confidence && chunk.facets.confidence === facets.confidence) {
    boost *= 1.2;
  }
  if (
    facets.facilityType &&
    chunk.facets.facilityType === facets.facilityType
  ) {
    boost *= 1.2;
  }
  return boost;
}

/** Cosine similarity on sparse term frequency vectors (used by MMR). */
function chunkCosine(a: FacilityChunk, b: FacilityChunk): number {
  if (a.id === b.id) {
    return 1;
  }
  if (a.facilityId === b.facilityId) {
    return 0.85;
  }
  const counts = new Map<string, number>();
  for (const term of a.terms) {
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }
  let dot = 0;
  let normA = 0;
  for (const value of counts.values()) {
    normA += value * value;
  }
  const countsB = new Map<string, number>();
  for (const term of b.terms) {
    countsB.set(term, (countsB.get(term) ?? 0) + 1);
  }
  let normB = 0;
  for (const [term, value] of countsB.entries()) {
    normB += value * value;
    const aValue = counts.get(term);
    if (aValue) {
      dot += aValue * value;
    }
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / Math.sqrt(normA * normB);
}

/**
 * Maximal Marginal Relevance — pick chunks that are both relevant and
 * different from already-selected chunks. Lambda=0.7 leans towards
 * relevance while still rewarding diversity.
 */
function mmrSelect(
  ranked: ScoredChunk[],
  topK: number,
  lambda = 0.7
): ScoredChunk[] {
  if (ranked.length <= topK) {
    return ranked;
  }
  const selected: ScoredChunk[] = [];
  const remaining = [...ranked];
  if (remaining[0]) {
    selected.push(remaining.shift() as ScoredChunk);
  }
  while (selected.length < topK && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const candidate = remaining[i];
      let maxSim = 0;
      for (const chosen of selected) {
        const sim = chunkCosine(candidate.chunk, chosen.chunk);
        if (sim > maxSim) {
          maxSim = sim;
        }
      }
      const score = lambda * candidate.score - (1 - lambda) * maxSim;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    selected.push(remaining.splice(bestIdx, 1)[0]);
  }
  return selected;
}

export interface RetrieveOptions {
  /** lambda for MMR diversification (0=pure diversity, 1=pure relevance) */
  diversity?: number;
  facets?: QueryFacets;
  topK?: number;
}

/**
 * Run the full hybrid retrieval pipeline:
 * 1. Tokenise + expand the query
 * 2. Score every chunk with BM25 across the corpus
 * 3. Multiply by facet boosts (soft filters) and chunk weights
 * 4. Apply MMR for diverse top-K
 */
export function retrieve(
  corpus: ChunkedCorpus,
  query: string,
  options: RetrieveOptions = {}
): RetrievalReport {
  const queryTerms = tokenize(query);
  const facets = options.facets ?? {};

  const scored: ScoredChunk[] = [];
  for (let i = 0; i < corpus.chunks.length; i++) {
    const chunk = corpus.chunks[i];
    const bm25 = bm25Score(corpus, i, queryTerms);
    const boost = facetBoost(chunk, facets);
    const fused = bm25 === 0 ? 0.001 * boost : bm25 * chunk.weight * boost;
    if (fused <= 0) {
      continue;
    }
    scored.push({
      chunk,
      score: fused,
      components: {
        bm25,
        facetBoost: boost,
        weight: chunk.weight,
      },
    });
  }

  scored.sort((a, b) => b.score - a.score);
  const topK = options.topK ?? 12;
  const lambda = options.diversity ?? 0.72;
  const diversified = mmrSelect(scored, topK, lambda);
  const uniqueFacilities = new Set(diversified.map((s) => s.chunk.facilityId))
    .size;

  return {
    corpusSize: corpus.chunks.length,
    uniqueFacilities,
    topChunks: diversified,
    allRanked: scored.slice(0, Math.min(40, scored.length)),
    queryTerms,
  };
}

/**
 * Normalise raw BM25 scores into a 0-1 confidence so the UI can render
 * them as probabilities without seeing huge raw numbers.
 */
export function normaliseScores(report: RetrievalReport): RetrievalReport {
  if (report.topChunks.length === 0) {
    return report;
  }
  const max = report.topChunks[0].score || 1;
  const normalise = (s: ScoredChunk) => ({
    ...s,
    score: Math.min(0.99, Math.max(0.05, s.score / max)),
  });
  return {
    ...report,
    topChunks: report.topChunks.map(normalise),
    allRanked: report.allRanked.map(normalise),
  };
}
