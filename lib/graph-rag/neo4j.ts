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

/**
 * Generate a Cypher query from a natural language question
 * about healthcare deserts in India.
 */
export function generateCypherFromQuery(query: string): string {
  const q = query.toLowerCase();

  // Detect specialty
  const specialties: Record<string, string> = {
    oncology: "oncology",
    cancer: "oncology",
    dialysis: "dialysis",
    kidney: "dialysis",
    renal: "dialysis",
    trauma: "emergency-trauma",
    emergency: "emergency-trauma",
    cardiology: "cardiology",
    cardiac: "cardiology",
    heart: "cardiology",
    maternity: "maternity",
    maternal: "maternity",
    pediatric: "pediatrics",
    child: "pediatrics",
    "mental health": "mental-health",
    psychiatry: "mental-health",
    orthopedic: "orthopedics",
    fracture: "orthopedics",
    neurology: "neurology",
    brain: "neurology",
    surgery: "surgery",
    radiology: "radiology",
    imaging: "radiology",
    neonatal: "neonatal",
    icu: "intensive-care",
  };

  let detectedSpecialty: string | null = null;
  for (const [keyword, specialty] of Object.entries(specialties)) {
    if (q.includes(keyword)) {
      detectedSpecialty = specialty;
      break;
    }
  }

  // Detect state
  const statePatterns = [
    "rajasthan",
    "bihar",
    "assam",
    "kerala",
    "karnataka",
    "maharashtra",
    "tamil nadu",
    "uttar pradesh",
    "madhya pradesh",
    "gujarat",
    "chhattisgarh",
    "jharkhand",
    "odisha",
    "punjab",
    "himachal pradesh",
    "manipur",
    "telangana",
    "west bengal",
    "ladakh",
    "uttarakhand",
    "goa",
    "sikkim",
    "mizoram",
    "tripura",
    "meghalaya",
    "arunachal pradesh",
    "nagaland",
    "haryana",
    "delhi",
    "jammu",
    "kashmir",
  ];
  let detectedState: string | null = null;
  for (const state of statePatterns) {
    if (q.includes(state)) {
      detectedState = state
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      break;
    }
  }

  // Detect severity
  const wantsCritical = q.includes("critical") || q.includes("severe");
  const wantsDesert = q.includes("desert") || q.includes("gap");

  // Build Cypher
  if (detectedSpecialty && detectedState) {
    return `MATCH (f:Facility)-[:LOCATED_IN]->(d:District)-[:PART_OF]->(s:State {name: "${detectedState}"})
WHERE f.category = "${detectedSpecialty}"${wantsCritical ? '\nAND f.gapSeverity IN ["critical", "severe"]' : ""}
OPTIONAL MATCH (f)-[:OFFERS]->(sp:Specialty)
RETURN f, d, s, sp
ORDER BY f.gapSeverity DESC, f.affectedPopulation DESC`;
  }

  if (wantsDesert && detectedState) {
    return `MATCH (d:District)-[r:DESERT_FOR]->(sp:Specialty)
WHERE d.state = "${detectedState}"
RETURN d, sp, r.gap_score AS gapScore
ORDER BY r.gap_score DESC`;
  }

  if (detectedSpecialty) {
    return `MATCH (f:Facility)-[:OFFERS]->(sp:Specialty {name: "${detectedSpecialty}"})
MATCH (f)-[:LOCATED_IN]->(d:District)-[:PART_OF]->(s:State)
${wantsCritical ? 'WHERE f.gapSeverity IN ["critical", "severe"]\n' : ""}RETURN f, d, s, sp
ORDER BY f.gapSeverity DESC, f.affectedPopulation DESC
LIMIT 10`;
  }

  if (detectedState) {
    return `MATCH (f:Facility)-[:LOCATED_IN]->(d:District)-[:PART_OF]->(s:State {name: "${detectedState}"})
OPTIONAL MATCH (f)-[:OFFERS]->(sp:Specialty)
RETURN f, d, s, sp
ORDER BY f.gapSeverity DESC
LIMIT 10`;
  }

  // Generic query
  return `MATCH (f:Facility)-[:LOCATED_IN]->(d:District)-[:PART_OF]->(s:State)
${wantsCritical ? 'WHERE f.gapSeverity IN ["critical", "severe"]\n' : ""}OPTIONAL MATCH (f)-[:OFFERS]->(sp:Specialty)
RETURN f, d, s, sp
ORDER BY f.gapSeverity DESC, f.affectedPopulation DESC
LIMIT 10`;
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
