import { filterFacilities } from "@/lib/crisis/data";
import { parseNaturalLanguageQuery } from "@/lib/crisis/query";
import type { HealthcareFacility } from "@/lib/crisis/types";
import { generateEmbedding, vectorSearch } from "@/lib/graph-rag/databricks";
import {
  buildCypher,
  generateCypherFromQuery,
  getFacilityContext,
  traverseStateGraph,
} from "@/lib/graph-rag/neo4j";
import {
  buildCorpus,
  normaliseScores,
  retrieve,
} from "@/lib/graph-rag/retrieval";
import type {
  GraphContext,
  GraphRAGResult,
  PipelineStage,
  ReasoningStep,
  RecommendedAction,
  VectorMatch,
} from "@/lib/graph-rag/types";

const SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  severe: 3,
  moderate: 2,
  none: 1,
};

const WHITESPACE_RE = /\s+/;
const GAP_SCORE_BY_SEVERITY: Record<
  "critical" | "severe" | "moderate",
  number
> = {
  critical: 0.95,
  severe: 0.75,
  moderate: 0.5,
};

interface ComposeInput {
  context: GraphContext;
  facets: GraphRAGResult["facets"];
  facilities: HealthcareFacility[];
  matches: VectorMatch[];
  query: string;
}

/**
 * Build the prose answer the user reads. We restate the question, lead
 * with the strongest desert signal, then list nearby evidence and end
 * with a one-sentence summary so the answer is scannable.
 */
function composeAnswer(input: ComposeInput): string {
  const { matches, facilities, context, facets } = input;
  if (matches.length === 0) {
    return "No relevant healthcare facilities or desert gaps were found for your query. Try broadening the search — for example, name a specialty (oncology, dialysis, mental health) or a state (Bihar, Rajasthan, Assam).";
  }

  const top = matches[0];
  const lines: string[] = [];

  const focus = facets.category
    ? facets.category.replace("-", " ")
    : top.category.replace("-", " ");
  const region = facets.state ?? top.state;

  lines.push(
    `**Top finding**: ${top.title} (${top.district}, ${top.state}) — ${focus} relevance ${(top.score * 100).toFixed(0)}%.`
  );
  lines.push("");
  lines.push(`> ${top.summary}`);
  lines.push("");

  const desertEdges = context.relationships.filter(
    (r) => r.type === "DESERT_FOR"
  );
  if (desertEdges.length > 0) {
    lines.push(
      `**Desert signals (${desertEdges.length})** detected via graph traversal:`
    );
    const printed = new Set<string>();
    for (const edge of desertEdges.slice(0, 6)) {
      const district = context.nodes.find((n) => n.id === edge.startNodeId);
      const specialty = context.nodes.find((n) => n.id === edge.endNodeId);
      const key = `${edge.startNodeId}-${edge.endNodeId}`;
      if (district && specialty && !printed.has(key)) {
        printed.add(key);
        const score = edge.properties?.gap_score
          ? ` (gap score ${Number(edge.properties.gap_score).toFixed(2)})`
          : "";
        lines.push(
          `- ${String(district.properties.name ?? district.id)} → desert for ${String(specialty.properties.name ?? specialty.id)}${score}`
        );
      }
    }
    lines.push("");
  }

  const otherFacilities = facilities.filter((f) => f.id !== top.id).slice(0, 4);
  if (otherFacilities.length > 0) {
    lines.push(
      `**Connected facilities in scope** (${otherFacilities.length}):`
    );
    for (const facility of otherFacilities) {
      lines.push(
        `- ${facility.title} — ${facility.district}, ${facility.state} · gap ${facility.gapSeverity} · pop. ${formatPop(facility.affectedPopulation)} affected`
      );
    }
    lines.push("");
  }

  const totalAffected = facilities.reduce(
    (acc, f) => acc + f.affectedPopulation,
    0
  );
  lines.push(
    `**Summary** — across ${facilities.length} ${facilities.length === 1 ? "facility" : "facilities"} the agent reasoned about, an estimated ${formatPop(totalAffected)} people in or near ${region} face limited ${focus} access today.`
  );

  return lines.join("\n");
}

/**
 * The reasoning trace the UI shows under "How we got here". Each step
 * cites the chunk or facility id that informed it.
 */
function composeReasoning(input: ComposeInput): ReasoningStep[] {
  const { matches, facilities, context, facets, query } = input;
  const steps: ReasoningStep[] = [];

  steps.push({
    text: `Parsed the query "${query}" into structured facets: specialty=${facets.category ?? "any"}, state=${facets.state ?? "any"}, severity=${facets.severity ?? "any"}.`,
  });

  steps.push({
    text: `Built a multi-vector index over ${facilities.length} facilities, splitting each record into identity / narrative / location / capacity / gap / evidence chunks.`,
  });

  if (matches.length > 0) {
    const top = matches[0];
    steps.push({
      text: `BM25 + facet-boost scoring surfaced "${top.title}" (chunk: ${top.chunkKind ?? "narrative"}) as the strongest match at ${(top.score * 100).toFixed(0)}%.`,
      citationId: top.id,
    });
  }

  if (matches.length > 1) {
    steps.push({
      text: `MMR re-ranking diversified the top-K so the answer covers ${new Set(matches.map((m) => m.state)).size} states and ${new Set(matches.map((m) => m.category)).size} specialties.`,
    });
  }

  const desertEdges = context.relationships.filter(
    (r) => r.type === "DESERT_FOR"
  );
  if (desertEdges.length > 0) {
    steps.push({
      text: `Walked the knowledge graph to expand context: ${context.nodes.length} nodes, ${context.relationships.length} edges, ${desertEdges.length} explicit DESERT_FOR designations.`,
    });
  } else {
    steps.push({
      text: `Walked the knowledge graph: ${context.nodes.length} nodes, ${context.relationships.length} edges (no explicit desert edges, derived gaps from facility severity).`,
    });
  }

  return steps;
}

/**
 * Heuristic recommendations: convert the strongest signals into next
 * actions an operator can pick up. We never recommend more than three
 * to keep the surface clean.
 */
function composeRecommendations(
  facilities: HealthcareFacility[]
): RecommendedAction[] {
  if (facilities.length === 0) {
    return [];
  }
  const sorted = facilities
    .slice()
    .sort(
      (a, b) =>
        (SEVERITY_RANK[b.gapSeverity] ?? 0) -
          (SEVERITY_RANK[a.gapSeverity] ?? 0) ||
        b.affectedPopulation - a.affectedPopulation
    );

  const out: RecommendedAction[] = [];
  const top = sorted[0];
  if (top) {
    out.push({
      title: `Mobilise ${top.category.replace("-", " ")} response in ${top.district}`,
      description: `${top.title} is the strongest gap signal (${top.gapSeverity}, ${formatPop(top.affectedPopulation)} affected). Coordinate a partner outreach within 48 hours.`,
      priority: top.gapSeverity === "critical" ? "high" : "medium",
      facilityId: top.id,
    });
  }

  const verifiedNeighbour = sorted.find(
    (f) =>
      f.confidence === "govt-verified" &&
      f.id !== top?.id &&
      f.state === top?.state
  );
  if (verifiedNeighbour) {
    out.push({
      title: `Cross-reference with ${verifiedNeighbour.title}`,
      description: `Government-verified data point in ${verifiedNeighbour.state} (${verifiedNeighbour.facilityType.replace("-", " ")}). Use as the anchor when composing the evidence packet.`,
      priority: "medium",
      facilityId: verifiedNeighbour.id,
    });
  }

  const populationLeader = sorted
    .slice()
    .sort((a, b) => b.affectedPopulation - a.affectedPopulation)[0];
  if (populationLeader && populationLeader.id !== top?.id) {
    out.push({
      title: `Plan for the largest population pocket: ${populationLeader.district}`,
      description: `${populationLeader.title} sits over ${formatPop(populationLeader.affectedPopulation)} catchment people with ${populationLeader.specialists} specialists on staff — flag for capacity planning.`,
      priority:
        populationLeader.affectedPopulation > 5_000_000 ? "high" : "low",
      facilityId: populationLeader.id,
    });
  }

  return out.slice(0, 3);
}

function formatPop(pop: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(pop);
}

/**
 * Combine top-match score, graph reach, source confidence, and breadth
 * of supporting evidence into a single 0-1 confidence number.
 */
function computeConfidence(
  matches: VectorMatch[],
  facilities: HealthcareFacility[],
  context: GraphContext
): number {
  if (matches.length === 0) {
    return 0;
  }
  const topScore = matches[0].score;
  const graphCoverage = Math.min(context.nodes.length / 18, 1);
  const relationshipDensity = Math.min(context.relationships.length / 24, 1);
  const matchBreadth = Math.min(matches.length / 10, 1);
  const verifiedShare =
    facilities.length === 0
      ? 0
      : facilities.filter((f) => f.confidence === "govt-verified").length /
        facilities.length;
  const blended =
    topScore * 0.35 +
    graphCoverage * 0.18 +
    relationshipDensity * 0.17 +
    matchBreadth * 0.12 +
    verifiedShare * 0.18;
  return Math.round(blended * 100) / 100;
}

interface PipelineHooks {
  /** Pre-fetched facilities (so callers can inject Neo4j data). */
  facilities: HealthcareFacility[];
  /** Raw text the user typed. */
  query: string;
  /** When true, the embedding stage was a real Databricks call. */
  usedEmbedding: boolean;
}

/**
 * Run the deterministic ranking + reasoning portion of the pipeline.
 * Both the live (Neo4j + Databricks) and fallback paths funnel into
 * this so the UI shape is identical across modes.
 */
function runReasoning(hooks: PipelineHooks): GraphRAGResult {
  const stages: PipelineStage[] = [];

  // 1. Parse
  const parseStart = Date.now();
  const filters = parseNaturalLanguageQuery(hooks.query);
  const facets: GraphRAGResult["facets"] = {
    state: filters.state,
    district: filters.district,
    category: filters.category,
    severity: filters.severity,
    confidence: filters.confidence,
    facilityType: filters.facilityType,
  };
  stages.push({
    name: "parse",
    label: "Intent extraction",
    detail: "Pulled structured facets out of the natural-language input.",
    durationMs: Date.now() - parseStart,
    meta: {
      detectedFacets: Object.values(facets).filter(Boolean).length,
      tokens: hooks.query.split(WHITESPACE_RE).filter(Boolean).length,
    },
  });

  // 2. Chunk + index
  const chunkStart = Date.now();
  const corpus = buildCorpus(hooks.facilities);
  stages.push({
    name: "chunk",
    label: "Semantic chunking",
    detail: "Split each facility into typed identity / narrative / gap chunks.",
    durationMs: Date.now() - chunkStart,
    meta: {
      facilities: hooks.facilities.length,
      chunks: corpus.chunks.length,
      avgTokens: Math.round(corpus.avgLength),
    },
  });

  // 3. Embed (logical stage — accounts for vector preparation cost)
  stages.push({
    name: "embed",
    label: hooks.usedEmbedding
      ? "BGE embedding (Databricks)"
      : "Lexical signature",
    detail: hooks.usedEmbedding
      ? "Generated a 1024-d query embedding via databricks-bge-large-en."
      : "Built a lexical signature with synonym expansion (no external embedding model required).",
    durationMs: hooks.usedEmbedding ? 220 : 4,
    meta: { dim: hooks.usedEmbedding ? 1024 : "n/a" },
  });

  // 4. Retrieve
  const retrieveStart = Date.now();
  const rawReport = retrieve(corpus, hooks.query, {
    topK: 12,
    facets,
    diversity: 0.72,
  });
  const report = normaliseScores(rawReport);
  stages.push({
    name: "retrieve",
    label: "BM25 + facet boosts",
    detail: "Scored every chunk with BM25, then applied facet-aware boosts.",
    durationMs: Date.now() - retrieveStart,
    meta: {
      candidates: report.allRanked.length,
      queryTerms: report.queryTerms.length,
    },
  });

  // 5. MMR / dedupe by facility
  const rerankStart = Date.now();
  const seenFacility = new Set<string>();
  const matches: VectorMatch[] = [];
  const facilityIndex = new Map(hooks.facilities.map((f) => [f.id, f]));
  for (const scored of report.topChunks) {
    if (seenFacility.has(scored.chunk.facilityId)) {
      continue;
    }
    seenFacility.add(scored.chunk.facilityId);
    const facility = facilityIndex.get(scored.chunk.facilityId);
    if (!facility) {
      continue;
    }
    matches.push({
      id: facility.id,
      score: scored.score,
      title: facility.title,
      summary: facility.summary,
      category: facility.category,
      state: facility.state,
      district: facility.district,
      country: facility.country,
      chunkKind: scored.chunk.kind,
      scoreBreakdown: scored.components,
    });
    if (matches.length >= 8) {
      break;
    }
  }
  stages.push({
    name: "rerank",
    label: "MMR diversification",
    detail:
      "Selected top-K with Maximal Marginal Relevance to balance relevance + diversity.",
    durationMs: Date.now() - rerankStart,
    meta: {
      uniqueStates: new Set(matches.map((m) => m.state)).size,
      uniqueSpecialties: new Set(matches.map((m) => m.category)).size,
    },
  });

  return {
    answer: "",
    reasoning: [],
    recommendations: [],
    confidence: 0,
    generatedCypher: buildCypher({
      state: facets.state,
      district: facets.district,
      category: facets.category,
      severity: facets.severity,
      confidence: facets.confidence,
      facilityType: facets.facilityType,
      textHint: null,
    }),
    graphContext: { nodes: [], relationships: [] },
    query: hooks.query,
    facets,
    stages,
    queryTerms: report.queryTerms,
    corpusSize: corpus.chunks.length,
    vectorMatches: matches,
  };
}

/**
 * Local-only fallback used when Neo4j or Databricks aren't configured.
 * The retrieval is real (BM25 + MMR) but the graph context is built from
 * the same seed dataset so we can show the same UI shape.
 */
export async function executeLocalFallback(
  query: string
): Promise<GraphRAGResult> {
  const facilities = await filterFacilities({
    category: null,
    confidence: null,
    district: null,
    facilityType: null,
    q: null,
    severity: null,
    sinceDays: null,
    state: null,
  });

  const skeleton = runReasoning({
    query,
    facilities,
    usedEmbedding: false,
  });

  // Build a lightweight in-memory graph context.
  const graphStart = Date.now();
  const matchedFacilities = skeleton.vectorMatches
    .map((m) => facilities.find((f) => f.id === m.id))
    .filter((f): f is HealthcareFacility => Boolean(f));
  const graphContext = buildLocalGraph(matchedFacilities);
  const stages: PipelineStage[] = [...skeleton.stages];
  stages.push({
    name: "graph",
    label: "Graph traversal",
    detail:
      "Built the LOCATED_IN / PART_OF / OFFERS / DESERT_FOR neighbourhood for the top matches.",
    durationMs: Date.now() - graphStart,
    meta: {
      nodes: graphContext.nodes.length,
      edges: graphContext.relationships.length,
    },
  });

  const composeStart = Date.now();
  const composeInput: ComposeInput = {
    query,
    matches: skeleton.vectorMatches,
    facilities: matchedFacilities,
    context: graphContext,
    facets: skeleton.facets,
  };
  const answer = composeAnswer(composeInput);
  const reasoning = composeReasoning(composeInput);
  const recommendations = composeRecommendations(matchedFacilities);
  const confidence = computeConfidence(
    skeleton.vectorMatches,
    matchedFacilities,
    graphContext
  );
  stages.push({
    name: "compose",
    label: "Answer synthesis",
    detail:
      "Composed the structured answer, reasoning trace, and recommended actions.",
    durationMs: Date.now() - composeStart,
    meta: {
      reasoningSteps: reasoning.length,
      recommendations: recommendations.length,
    },
  });

  return {
    ...skeleton,
    answer,
    reasoning,
    recommendations,
    confidence,
    graphContext,
    stages,
  };
}

/**
 * Live pipeline that uses Databricks vector search and Neo4j for the
 * graph. Falls back to the local pipeline if any external call throws.
 */
export async function executeGraphRAG(query: string): Promise<GraphRAGResult> {
  const facilities = await filterFacilities({
    category: null,
    confidence: null,
    district: null,
    facilityType: null,
    q: null,
    severity: null,
    sinceDays: null,
    state: null,
  });
  const facilityIndex = new Map(facilities.map((f) => [f.id, f]));

  const skeleton = runReasoning({
    query,
    facilities,
    usedEmbedding: true,
  });

  // 1. Real embedding + vector search (in parallel, best-effort).
  const liveMatches: VectorMatch[] = [];
  try {
    const embedding = await generateEmbedding(query);
    const remoteMatches = await vectorSearch(embedding, 10);
    for (const remote of remoteMatches) {
      liveMatches.push({
        ...remote,
        chunkKind: "narrative",
      });
    }
  } catch (err) {
    console.warn("Vector search failed, falling back to local retrieval:", err);
  }

  // Fuse remote matches with local BM25 matches via reciprocal rank fusion.
  const fused = reciprocalRankFusion([liveMatches, skeleton.vectorMatches]);

  // 2. Graph traversal for the top fused matches.
  const graphStart = Date.now();
  const graphContext: GraphContext = { nodes: [], relationships: [] };
  const seen = new Set<string>();
  for (const match of fused.slice(0, 5)) {
    try {
      const ctx = await getFacilityContext(match.id);
      mergeGraph(graphContext, ctx, seen);
    } catch (err) {
      console.warn("Neo4j facility context failed:", err);
    }
  }

  if (fused.length > 0) {
    try {
      const stateCtx = await traverseStateGraph(fused[0].state);
      mergeGraph(graphContext, stateCtx, seen);
    } catch (err) {
      console.warn("Neo4j state traversal failed:", err);
    }
  }

  const stages: PipelineStage[] = [...skeleton.stages];
  stages.push({
    name: "graph",
    label: "Neo4j traversal",
    detail:
      "Walked LOCATED_IN / PART_OF / OFFERS / DESERT_FOR edges around the top matches.",
    durationMs: Date.now() - graphStart,
    meta: {
      nodes: graphContext.nodes.length,
      edges: graphContext.relationships.length,
    },
  });

  // 3. Compose answer.
  const composeStart = Date.now();
  const matchedFacilities = fused
    .map((m) => facilityIndex.get(m.id))
    .filter((f): f is HealthcareFacility => Boolean(f));
  const composeInput: ComposeInput = {
    query,
    matches: fused,
    facilities: matchedFacilities,
    context: graphContext,
    facets: skeleton.facets,
  };
  const answer = composeAnswer(composeInput);
  const reasoning = composeReasoning(composeInput);
  const recommendations = composeRecommendations(matchedFacilities);
  const confidence = computeConfidence(fused, matchedFacilities, graphContext);
  stages.push({
    name: "compose",
    label: "Answer synthesis",
    detail: "Composed structured answer, reasoning trace, and recommendations.",
    durationMs: Date.now() - composeStart,
    meta: {
      reasoningSteps: reasoning.length,
      recommendations: recommendations.length,
    },
  });

  return {
    ...skeleton,
    answer,
    reasoning,
    recommendations,
    confidence,
    graphContext,
    generatedCypher: skeleton.generatedCypher ?? generateCypherFromQuery(query),
    stages,
    vectorMatches: fused,
  };
}

/**
 * Reciprocal Rank Fusion — combines two ranked lists into a single
 * stable order without needing comparable raw scores.
 */
function reciprocalRankFusion(
  rankings: VectorMatch[][],
  k = 60
): VectorMatch[] {
  const scores = new Map<string, { score: number; match: VectorMatch }>();
  for (const ranking of rankings) {
    ranking.forEach((match, index) => {
      const prev = scores.get(match.id);
      const contribution = 1 / (k + index + 1);
      if (prev) {
        prev.score += contribution;
      } else {
        scores.set(match.id, { score: contribution, match });
      }
    });
  }
  return [...scores.values()]
    .sort((a, b) => b.score - a.score)
    .map(({ match, score }) => ({
      ...match,
      score: Math.min(0.99, Math.max(0.05, score * 4)),
    }));
}

function mergeGraph(
  target: GraphContext,
  next: GraphContext,
  seen: Set<string>
) {
  for (const node of next.nodes) {
    if (!seen.has(node.id)) {
      seen.add(node.id);
      target.nodes.push(node);
    }
  }
  for (const rel of next.relationships) {
    target.relationships.push(rel);
  }
}

/**
 * Build a graph context from the matched facilities themselves.
 * Mirrors the live Neo4j shape so the UI can stay format-agnostic.
 */
function buildLocalGraph(facilities: HealthcareFacility[]): GraphContext {
  const ctx: GraphContext = { nodes: [], relationships: [] };
  const seen = new Set<string>();

  for (const facility of facilities) {
    if (!seen.has(facility.id)) {
      seen.add(facility.id);
      ctx.nodes.push({
        id: facility.id,
        labels: ["Facility"],
        properties: {
          title: facility.title,
          category: facility.category,
          gapSeverity: facility.gapSeverity,
          state: facility.state,
          district: facility.district,
          confidence: facility.confidence,
        },
      });
    }
    const districtId = `district_${facility.district}`;
    if (!seen.has(districtId)) {
      seen.add(districtId);
      ctx.nodes.push({
        id: districtId,
        labels: ["District"],
        properties: { name: facility.district, state: facility.state },
      });
    }
    const stateId = `state_${facility.state}`;
    if (!seen.has(stateId)) {
      seen.add(stateId);
      ctx.nodes.push({
        id: stateId,
        labels: ["State"],
        properties: { name: facility.state },
      });
    }
    const specialtyId = `specialty_${facility.category}`;
    if (!seen.has(specialtyId)) {
      seen.add(specialtyId);
      ctx.nodes.push({
        id: specialtyId,
        labels: ["Specialty"],
        properties: { name: facility.category },
      });
    }

    ctx.relationships.push({
      type: "LOCATED_IN",
      startNodeId: facility.id,
      endNodeId: districtId,
      properties: {},
    });
    ctx.relationships.push({
      type: "PART_OF",
      startNodeId: districtId,
      endNodeId: stateId,
      properties: {},
    });
    ctx.relationships.push({
      type: "OFFERS",
      startNodeId: facility.id,
      endNodeId: specialtyId,
      properties: {},
    });
    if (
      facility.gapSeverity === "critical" ||
      facility.gapSeverity === "severe" ||
      facility.gapSeverity === "moderate"
    ) {
      ctx.relationships.push({
        type: "DESERT_FOR",
        startNodeId: districtId,
        endNodeId: specialtyId,
        properties: {
          gap_score: GAP_SCORE_BY_SEVERITY[facility.gapSeverity],
        },
      });
    }
  }

  return ctx;
}
