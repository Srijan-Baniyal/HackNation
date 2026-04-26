import { generateEmbedding, vectorSearch } from "@/lib/graph-rag/databricks";
import {
  generateCypherFromQuery,
  getFacilityContext,
  traverseStateGraph,
} from "@/lib/graph-rag/neo4j";
import type {
  GraphContext,
  GraphRAGResult,
  VectorMatch,
} from "@/lib/graph-rag/types";

/**
 * Compose a structured answer with citations from vector matches
 * and graph context for healthcare desert analysis.
 */
function composeAnswer(
  _query: string,
  matches: VectorMatch[],
  context: GraphContext
): string {
  if (matches.length === 0) {
    return "No relevant healthcare facilities or desert gaps were found for your query. Try broadening your search — for example, search by specialty (oncology, dialysis) or state name.";
  }

  const topMatch = matches[0];
  const stateNodes = context.nodes.filter((n) => n.labels.includes("State"));
  const specialtyNodes = context.nodes.filter((n) =>
    n.labels.includes("Specialty")
  );
  const districtNodes = context.nodes.filter((n) =>
    n.labels.includes("District")
  );
  const relatedFacilities = context.nodes.filter(
    (n) => n.labels.includes("Facility") && n.id !== topMatch.id
  );

  const lines: string[] = [];

  lines.push(
    `**Top match**: ${topMatch.title} (${topMatch.district}, ${topMatch.state}) — relevance ${(topMatch.score * 100).toFixed(1)}%`
  );
  lines.push("");
  lines.push(`> ${topMatch.summary}`);
  lines.push("");

  if (stateNodes.length > 0) {
    const stateNames = stateNodes.map((n) => String(n.properties.name ?? n.id));
    lines.push(`**Connected states**: ${stateNames.join(", ")}`);
  }

  if (districtNodes.length > 0) {
    const districtNames = districtNodes.map((n) =>
      String(n.properties.name ?? n.id)
    );
    lines.push(`**Districts in scope**: ${districtNames.join(", ")}`);
  }

  if (specialtyNodes.length > 0) {
    const specialtyNames = specialtyNodes.map((n) =>
      String(n.properties.name ?? n.id)
    );
    lines.push(`**Specialties identified**: ${specialtyNames.join(", ")}`);
  }

  // Desert relationships as citations
  const desertRels = context.relationships.filter(
    (r) => r.type === "DESERT_FOR"
  );
  if (desertRels.length > 0) {
    lines.push("");
    lines.push(`**Desert designations** (${desertRels.length} found):`);
    for (const rel of desertRels.slice(0, 5)) {
      const distNode = context.nodes.find((n) => n.id === rel.startNodeId);
      const specNode = context.nodes.find((n) => n.id === rel.endNodeId);
      if (distNode && specNode) {
        lines.push(
          `- ${String(distNode.properties.name ?? distNode.id)} → desert for ${String(specNode.properties.name ?? specNode.id)}`
        );
      }
    }
  }

  if (relatedFacilities.length > 0) {
    lines.push("");
    lines.push(
      `**${relatedFacilities.length} nearby facilit${relatedFacilities.length === 1 ? "y" : "ies"}** found in the same region:`
    );
    for (const facility of relatedFacilities.slice(0, 3)) {
      const title = String(facility.properties.title ?? "Untitled");
      const severity = String(facility.properties.gapSeverity ?? "unknown");
      lines.push(`- ${title} (gap: ${severity})`);
    }
  }

  if (matches.length > 1) {
    lines.push("");
    lines.push("**Other relevant facilities**:");
    for (const match of matches.slice(1, 4)) {
      lines.push(
        `- ${match.title} (${match.state}) — ${(match.score * 100).toFixed(1)}%`
      );
    }
  }

  return lines.join("\n");
}

/**
 * Compute a confidence score based on vector similarity and graph coverage.
 */
function computeConfidence(
  matches: VectorMatch[],
  context: GraphContext
): number {
  if (matches.length === 0) {
    return 0;
  }

  // Weight top match score higher, but factor in graph depth (number of edges) and breadth
  const topScore = matches[0].score;
  const graphCoverage = Math.min(context.nodes.length / 15, 1);
  const relationshipDensity = Math.min(context.relationships.length / 20, 1);
  const matchBreadth = Math.min(matches.length / 10, 1);

  return (
    Math.round(
      (topScore * 0.45 +
        graphCoverage * 0.25 +
        relationshipDensity * 0.2 +
        matchBreadth * 0.1) *
        100
    ) / 100
  );
}

/**
 * Execute the full Graph RAG pipeline:
 * 1. Generate Cypher from natural language
 * 2. Generate embedding for the query
 * 3. Vector search for semantically similar facilities
 * 4. Traverse Neo4j graph for connected context
 * 5. Compose a structured answer with citations
 */
export async function executeGraphRAG(query: string): Promise<GraphRAGResult> {
  // Step 1: Generate Cypher
  const generatedCypher = generateCypherFromQuery(query);

  // Step 2: Generate embedding
  const embedding = await generateEmbedding(query);

  // Step 3: Vector search - increased limit for better recall
  const vectorMatches = await vectorSearch(embedding, 10);

  // Step 4: Graph traversal for top matches - expanded to top 5
  const graphContexts = await Promise.all(
    vectorMatches.slice(0, 5).map((match) => getFacilityContext(match.id))
  );

  // Merge graph contexts
  const mergedContext: GraphContext = {
    nodes: [],
    relationships: [],
  };
  const seenNodeIds = new Set<string>();
  for (const ctx of graphContexts) {
    for (const node of ctx.nodes) {
      if (!seenNodeIds.has(node.id)) {
        seenNodeIds.add(node.id);
        mergedContext.nodes.push(node);
      }
    }
    mergedContext.relationships.push(...ctx.relationships);
  }

  // Also try state-based traversal for the top match
  if (vectorMatches.length > 0) {
    const stateContext = await traverseStateGraph(vectorMatches[0].state);
    for (const node of stateContext.nodes) {
      if (!seenNodeIds.has(node.id)) {
        seenNodeIds.add(node.id);
        mergedContext.nodes.push(node);
      }
    }
    mergedContext.relationships.push(...stateContext.relationships);
  }

  // Step 5: Compose answer
  const answer = composeAnswer(query, vectorMatches, mergedContext);
  const confidence = computeConfidence(vectorMatches, mergedContext);

  return {
    answer,
    confidence,
    generatedCypher,
    graphContext: mergedContext,
    query,
    vectorMatches,
  };
}

/**
 * Fallback pipeline using local seed data when external services
 * (Neo4j / Databricks) are not configured.
 */
export async function executeLocalFallback(
  query: string
): Promise<GraphRAGResult> {
  const { filterFacilities } = await import("@/lib/crisis/data");
  const { parseNaturalLanguageQuery } = await import("@/lib/crisis/query");

  const filters = parseNaturalLanguageQuery(query);
  const facilities = await filterFacilities(filters);

  const generatedCypher = generateCypherFromQuery(query);

  const vectorMatches: VectorMatch[] = facilities
    .slice(0, 10)
    .map((fac, i) => ({
      id: fac.id,
      score: Math.max(0.96 - i * 0.08, 0.4),
      title: fac.title,
      summary: fac.summary,
      category: fac.category,
      state: fac.state,
      district: fac.district,
      country: fac.country,
    }));

  const graphContext: GraphContext = {
    nodes: facilities.slice(0, 10).map((fac) => ({
      id: fac.id,
      labels: ["Facility"],
      properties: {
        title: fac.title,
        category: fac.category,
        gapSeverity: fac.gapSeverity,
        state: fac.state,
        district: fac.district,
        confidence: fac.confidence,
      },
    })),
    relationships: [],
  };

  // Add state, district, and specialty nodes
  const states = new Set(facilities.map((f) => f.state));
  const districts = new Set(facilities.map((f) => f.district));
  const categories = new Set(facilities.map((f) => f.category));

  for (const state of states) {
    graphContext.nodes.push({
      id: `state_${state}`,
      labels: ["State"],
      properties: { name: state },
    });
  }
  for (const district of districts) {
    graphContext.nodes.push({
      id: `district_${district}`,
      labels: ["District"],
      properties: { name: district },
    });
  }
  for (const category of categories) {
    graphContext.nodes.push({
      id: `specialty_${category}`,
      labels: ["Specialty"],
      properties: { name: category },
    });
  }

  // Connect facilities to districts, states, and specialties
  for (const fac of facilities.slice(0, 10)) {
    graphContext.relationships.push({
      type: "LOCATED_IN",
      startNodeId: fac.id,
      endNodeId: `district_${fac.district}`,
      properties: {},
    });
    graphContext.relationships.push({
      type: "PART_OF",
      startNodeId: `district_${fac.district}`,
      endNodeId: `state_${fac.state}`,
      properties: {},
    });
    graphContext.relationships.push({
      type: "OFFERS",
      startNodeId: fac.id,
      endNodeId: `specialty_${fac.category}`,
      properties: {},
    });
    // Mark critical/severe/moderate gaps as desert relationships with scaled scores
    if (["critical", "severe", "moderate"].includes(fac.gapSeverity)) {
      graphContext.relationships.push({
        type: "DESERT_FOR",
        startNodeId: `district_${fac.district}`,
        endNodeId: `specialty_${fac.category}`,
        properties: {
          gap_score:
            fac.gapSeverity === "critical"
              ? 0.95
              : fac.gapSeverity === "severe"
                ? 0.75
                : 0.5,
        },
      });
    }
  }

  const answer = composeAnswer(query, vectorMatches, graphContext);
  const confidence = computeConfidence(vectorMatches, graphContext);

  return {
    answer,
    confidence,
    generatedCypher,
    graphContext,
    query,
    vectorMatches,
  };
}
