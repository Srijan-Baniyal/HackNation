import neo4j, { type Driver, type Session } from "neo4j-driver";
import type {
  GraphContext,
  GraphNode,
  GraphRelationship,
} from "@/lib/graph-rag/types";

let driver: Driver | null = null;

function getDriver(): Driver {
  if (!driver) {
    const uri = process.env.NEO4J_URI;
    const user = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    if (!(uri && user && password)) {
      throw new Error(
        "Neo4j environment variables are not configured. Set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD."
      );
    }

    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  }
  return driver;
}

function getSession(): Session {
  return getDriver().session();
}

/**
 * Find a facility by ID and return its connected subgraph
 * (district, state, specialties, related facilities in same district).
 */
export async function getFacilityContext(
  facilityId: string
): Promise<GraphContext> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (f:Facility {id: $id})
      OPTIONAL MATCH (f)-[r1:LOCATED_IN]->(d:District)
      OPTIONAL MATCH (d)-[r2:PART_OF]->(s:State)
      OPTIONAL MATCH (f)-[r3:OFFERS]->(sp:Specialty)
      OPTIONAL MATCH (d)-[r4:DESERT_FOR]->(dsp:Specialty)
      OPTIONAL MATCH (d)<-[:LOCATED_IN]-(related:Facility)
      WHERE related.id <> $id
      RETURN f, d, s, sp, dsp,
             collect(DISTINCT related) AS relatedFacilities,
             collect(DISTINCT r1) AS districtRels,
             collect(DISTINCT r3) AS specialtyRels,
             collect(DISTINCT r4) AS desertRels
      LIMIT 1
      `,
      { id: facilityId }
    );

    const nodes: GraphNode[] = [];
    const relationships: GraphRelationship[] = [];

    for (const record of result.records) {
      const facility = record.get("f");
      if (facility) {
        nodes.push({
          id: facility.properties.id as string,
          labels: ["Facility"],
          properties: facility.properties as Record<string, unknown>,
        });
      }

      const district = record.get("d");
      if (district) {
        nodes.push({
          id: `district_${district.properties.name}`,
          labels: ["District"],
          properties: district.properties as Record<string, unknown>,
        });
        relationships.push({
          type: "LOCATED_IN",
          startNodeId: facilityId,
          endNodeId: `district_${district.properties.name}`,
          properties: {},
        });
      }

      const state = record.get("s");
      if (state && district) {
        nodes.push({
          id: `state_${state.properties.name}`,
          labels: ["State"],
          properties: state.properties as Record<string, unknown>,
        });
        relationships.push({
          type: "PART_OF",
          startNodeId: `district_${district.properties.name}`,
          endNodeId: `state_${state.properties.name}`,
          properties: {},
        });
      }

      const specialty = record.get("sp");
      if (specialty) {
        nodes.push({
          id: `specialty_${specialty.properties.name}`,
          labels: ["Specialty"],
          properties: specialty.properties as Record<string, unknown>,
        });
        relationships.push({
          type: "OFFERS",
          startNodeId: facilityId,
          endNodeId: `specialty_${specialty.properties.name}`,
          properties: {},
        });
      }

      const desertSpecialty = record.get("dsp");
      if (desertSpecialty && district) {
        const spId = `specialty_${desertSpecialty.properties.name}`;
        if (!nodes.some((n) => n.id === spId)) {
          nodes.push({
            id: spId,
            labels: ["Specialty"],
            properties: desertSpecialty.properties as Record<string, unknown>,
          });
        }
        relationships.push({
          type: "DESERT_FOR",
          startNodeId: `district_${district.properties.name}`,
          endNodeId: spId,
          properties: {},
        });
      }

      const related = record.get("relatedFacilities") as Array<{
        properties: Record<string, unknown>;
      }>;
      if (related) {
        for (const rel of related.slice(0, 5)) {
          const relId = rel.properties.id as string;
          nodes.push({
            id: relId,
            labels: ["Facility"],
            properties: rel.properties,
          });
          relationships.push({
            type: "SAME_DISTRICT",
            startNodeId: facilityId,
            endNodeId: relId,
            properties: {},
          });
        }
      }
    }

    return { nodes, relationships };
  } finally {
    await session.close();
  }
}

/**
 * Find facilities and deserts in a given state and return the subgraph.
 */
export async function traverseStateGraph(state: string): Promise<GraphContext> {
  const session = getSession();

  try {
    const result = await session.run(
      `
      MATCH (f:Facility)-[:LOCATED_IN]->(d:District)-[:PART_OF]->(s:State {name: $state})
      OPTIONAL MATCH (f)-[:OFFERS]->(sp:Specialty)
      OPTIONAL MATCH (d)-[:DESERT_FOR]->(dsp:Specialty)
      RETURN f, d, s, sp, dsp
      ORDER BY f.gapSeverity DESC
      LIMIT 15
      `,
      { state }
    );

    const nodes: GraphNode[] = [];
    const relationships: GraphRelationship[] = [];
    const seenIds = new Set<string>();

    for (const record of result.records) {
      const facility = record.get("f");
      const dist = record.get("d");
      const st = record.get("s");
      const spec = record.get("sp");
      const dspec = record.get("dsp");

      if (facility && !seenIds.has(facility.properties.id as string)) {
        seenIds.add(facility.properties.id as string);
        nodes.push({
          id: facility.properties.id as string,
          labels: ["Facility"],
          properties: facility.properties as Record<string, unknown>,
        });
      }

      if (dist && !seenIds.has(`district_${dist.properties.name}`)) {
        seenIds.add(`district_${dist.properties.name}`);
        nodes.push({
          id: `district_${dist.properties.name}`,
          labels: ["District"],
          properties: dist.properties as Record<string, unknown>,
        });
      }

      if (st && !seenIds.has(`state_${st.properties.name}`)) {
        seenIds.add(`state_${st.properties.name}`);
        nodes.push({
          id: `state_${st.properties.name}`,
          labels: ["State"],
          properties: st.properties as Record<string, unknown>,
        });
      }

      if (spec && !seenIds.has(`specialty_${spec.properties.name}`)) {
        seenIds.add(`specialty_${spec.properties.name}`);
        nodes.push({
          id: `specialty_${spec.properties.name}`,
          labels: ["Specialty"],
          properties: spec.properties as Record<string, unknown>,
        });
      }

      if (dspec && !seenIds.has(`specialty_${dspec.properties.name}`)) {
        seenIds.add(`specialty_${dspec.properties.name}`);
        nodes.push({
          id: `specialty_${dspec.properties.name}`,
          labels: ["Specialty"],
          properties: dspec.properties as Record<string, unknown>,
        });
      }

      if (facility && dist) {
        relationships.push({
          type: "LOCATED_IN",
          startNodeId: facility.properties.id as string,
          endNodeId: `district_${dist.properties.name}`,
          properties: {},
        });
      }

      if (dist && st) {
        relationships.push({
          type: "PART_OF",
          startNodeId: `district_${dist.properties.name}`,
          endNodeId: `state_${st.properties.name}`,
          properties: {},
        });
      }

      if (facility && spec) {
        relationships.push({
          type: "OFFERS",
          startNodeId: facility.properties.id as string,
          endNodeId: `specialty_${spec.properties.name}`,
          properties: {},
        });
      }

      if (dist && dspec) {
        relationships.push({
          type: "DESERT_FOR",
          startNodeId: `district_${dist.properties.name}`,
          endNodeId: `specialty_${dspec.properties.name}`,
          properties: {},
        });
      }
    }

    return { nodes, relationships };
  } finally {
    await session.close();
  }
}

export interface CypherFacets {
  category: string | null;
  confidence: string | null;
  district: string | null;
  facilityType: string | null;
  severity: string | null;
  state: string | null;
  /** Free-form keyword (e.g. "rural") that should hit summary text. */
  textHint?: string | null;
}

/**
 * Compose a Cypher query from already-parsed facets. The query is
 * intentionally readable so the operator can audit what the agent ran.
 *
 * The result chains: Facility -[LOCATED_IN]-> District -[PART_OF]-> State
 * and exposes desert + specialty edges for downstream reasoning.
 */
export function buildCypher(facets: CypherFacets): string {
  const lines: string[] = [];
  const params: string[] = [];

  lines.push(
    "MATCH (f:Facility)-[:LOCATED_IN]->(d:District)-[:PART_OF]->(s:State)"
  );

  if (facets.state) {
    params.push(`s.name = "${escapeQuotes(facets.state)}"`);
  }
  if (facets.district) {
    params.push(`d.name = "${escapeQuotes(facets.district)}"`);
  }
  if (facets.category) {
    params.push(`f.category = "${escapeQuotes(facets.category)}"`);
  }
  if (facets.severity) {
    params.push(`f.gapSeverity = "${escapeQuotes(facets.severity)}"`);
  } else {
    params.push('f.gapSeverity IN ["critical", "severe", "moderate"]');
  }
  if (facets.confidence) {
    params.push(`f.confidence = "${escapeQuotes(facets.confidence)}"`);
  }
  if (facets.facilityType) {
    params.push(`f.facilityType = "${escapeQuotes(facets.facilityType)}"`);
  }
  if (facets.textHint) {
    params.push(
      `(toLower(f.summary) CONTAINS "${escapeQuotes(facets.textHint.toLowerCase())}" OR toLower(f.title) CONTAINS "${escapeQuotes(facets.textHint.toLowerCase())}")`
    );
  }

  if (params.length > 0) {
    lines.push(`WHERE ${params.join("\n  AND ")}`);
  }

  lines.push("OPTIONAL MATCH (f)-[:OFFERS]->(sp:Specialty)");
  lines.push("OPTIONAL MATCH (d)-[desert:DESERT_FOR]->(dsp:Specialty)");
  lines.push("WITH f, d, s, sp, desert, dsp, CASE f.gapSeverity");
  lines.push("  WHEN 'critical' THEN 4");
  lines.push("  WHEN 'severe'   THEN 3");
  lines.push("  WHEN 'moderate' THEN 2");
  lines.push("  ELSE 1 END AS severityRank");
  lines.push("RETURN f, d, s, sp, desert, dsp, severityRank");
  lines.push("ORDER BY severityRank DESC, f.affectedPopulation DESC");
  lines.push("LIMIT 25");

  return lines.join("\n");
}

const QUOTE_RE = /"/g;
const escapeQuotes = (value: string) => value.replace(QUOTE_RE, '\\"');

/**
 * Light-weight detector kept for callers that only have raw text.
 * Pulls out a state and a category and delegates to {@link buildCypher}.
 */
export function generateCypherFromQuery(query: string): string {
  const q = query.toLowerCase();

  const specialties: [string, string][] = [
    ["cancer", "oncology"],
    ["oncology", "oncology"],
    ["chemo", "oncology"],
    ["dialysis", "dialysis"],
    ["kidney", "dialysis"],
    ["renal", "dialysis"],
    ["trauma", "emergency-trauma"],
    ["emergency", "emergency-trauma"],
    ["accident", "emergency-trauma"],
    ["cardio", "cardiology"],
    ["heart", "cardiology"],
    ["maternity", "maternity"],
    ["maternal", "maternity"],
    ["delivery", "maternity"],
    ["pediatric", "pediatrics"],
    ["child", "pediatrics"],
    ["neonatal", "pediatrics"],
    ["mental", "mental-health"],
    ["psychiatr", "mental-health"],
    ["orthopedic", "orthopedics"],
    ["fracture", "orthopedics"],
  ];
  let category: string | null = null;
  for (const [needle, value] of specialties) {
    if (q.includes(needle)) {
      category = value;
      break;
    }
  }

  const stateNames = [
    "andhra pradesh",
    "arunachal pradesh",
    "assam",
    "bihar",
    "chhattisgarh",
    "goa",
    "gujarat",
    "haryana",
    "himachal pradesh",
    "jharkhand",
    "karnataka",
    "kerala",
    "ladakh",
    "madhya pradesh",
    "maharashtra",
    "manipur",
    "meghalaya",
    "mizoram",
    "nagaland",
    "odisha",
    "punjab",
    "rajasthan",
    "sikkim",
    "tamil nadu",
    "telangana",
    "tripura",
    "uttarakhand",
    "uttar pradesh",
    "west bengal",
    "delhi",
  ];
  let state: string | null = null;
  for (const candidate of stateNames) {
    if (q.includes(candidate)) {
      state = candidate
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      break;
    }
  }

  let severity: string | null = null;
  if (q.includes("critical") || q.includes("no access")) {
    severity = "critical";
  } else if (q.includes("severe")) {
    severity = "severe";
  } else if (q.includes("moderate")) {
    severity = "moderate";
  }

  let confidence: string | null = null;
  if (q.includes("verified") || q.includes("government")) {
    confidence = "govt-verified";
  } else if (q.includes("survey") || q.includes("nfhs")) {
    confidence = "survey-reported";
  }

  return buildCypher({
    state,
    district: null,
    category,
    severity,
    confidence,
    facilityType: null,
    textHint: null,
  });
}

/**
 * Check if the Neo4j connection is available.
 */
export async function checkNeo4jConnection(): Promise<boolean> {
  try {
    const session = getSession();
    await session.run("RETURN 1");
    await session.close();
    return true;
  } catch {
    return false;
  }
}
