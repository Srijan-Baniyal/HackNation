/**
 * Graph RAG Seed Script — Healthcare Desert Intelligence
 *
 * Populates Neo4j with healthcare facility graph data and
 * Databricks Vector Search with facility embeddings.
 *
 * Usage:
 *   bun run lib/graph-rag/seed.ts
 *
 * Prerequisites:
 *   - NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD set in .env
 *   - DATABRICKS_HOST, DATABRICKS_TOKEN, DATABRICKS_VS_ENDPOINT,
 *     DATABRICKS_VS_INDEX set in .env
 */

import neo4j from "neo4j-driver";
import { seedFacilities } from "@/lib/crisis/seed";

async function seedNeo4j() {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!(uri && user && password)) {
    console.warn("⚠ Neo4j credentials not configured. Skipping Neo4j seeding.");
    return;
  }

  console.log("🔌 Connecting to Neo4j...");
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
  const session = driver.session();

  try {
    // Clear existing data
    console.log("🧹 Clearing existing graph data...");
    await session.run("MATCH (n) DETACH DELETE n");

    // Create constraints
    console.log("📐 Creating constraints...");
    await session.run(
      "CREATE CONSTRAINT IF NOT EXISTS FOR (f:Facility) REQUIRE f.id IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT IF NOT EXISTS FOR (d:District) REQUIRE d.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT IF NOT EXISTS FOR (s:State) REQUIRE s.name IS UNIQUE"
    );
    await session.run(
      "CREATE CONSTRAINT IF NOT EXISTS FOR (sp:Specialty) REQUIRE sp.name IS UNIQUE"
    );

    // Seed facilities
    console.log(`📦 Seeding ${seedFacilities.length} facilities...`);
    for (const facility of seedFacilities) {
      await session.run(
        `
        MERGE (f:Facility {id: $id})
        SET f.title = $title,
            f.summary = $summary,
            f.category = $category,
            f.gapSeverity = $gapSeverity,
            f.confidence = $confidence,
            f.source = $source,
            f.country = $country,
            f.state = $state,
            f.district = $district,
            f.facilityType = $facilityType,
            f.beds = $beds,
            f.specialists = $specialists,
            f.lat = $lat,
            f.lon = $lon,
            f.occurredAt = $occurredAt,
            f.updatedAt = $updatedAt,
            f.affectedPopulation = $affectedPopulation

        MERGE (d:District {name: $district})
        SET d.state = $state

        MERGE (s:State {name: $state})
        SET s.country = $country

        MERGE (sp:Specialty {name: $category})

        MERGE (f)-[:LOCATED_IN]->(d)
        MERGE (d)-[:PART_OF]->(s)
        MERGE (f)-[:OFFERS]->(sp)
        `,
        facility
      );

      // Create DESERT_FOR relationships for critical/severe gaps
      if (
        facility.gapSeverity === "critical" ||
        facility.gapSeverity === "severe"
      ) {
        await session.run(
          `
          MATCH (d:District {name: $district})
          MATCH (sp:Specialty {name: $category})
          MERGE (d)-[r:DESERT_FOR]->(sp)
          SET r.gap_score = $gapScore,
              r.population_per_facility = $popPerFacility
          `,
          {
            district: facility.district,
            category: facility.category,
            gapScore: facility.gapSeverity === "critical" ? 0.95 : 0.7,
            popPerFacility: Math.round(
              facility.affectedPopulation / Math.max(facility.specialists, 1)
            ),
          }
        );
      }
    }

    // Create cross-specialty relationships for facilities in same district
    console.log("🔗 Creating cross-reference relationships...");
    await session.run(`
      MATCH (a:Facility)-[:LOCATED_IN]->(d:District)<-[:LOCATED_IN]-(b:Facility)
      WHERE a.id < b.id
      MERGE (a)-[:SAME_DISTRICT]->(b)
    `);

    // Create same-specialty relationships
    await session.run(`
      MATCH (a:Facility)-[:OFFERS]->(sp:Specialty)<-[:OFFERS]-(b:Facility)
      WHERE a.id < b.id
      MERGE (a)-[:SAME_SPECIALTY]->(b)
    `);

    console.log("✅ Neo4j seeding complete!");
  } finally {
    await session.close();
    await driver.close();
  }
}

const TRAILING_SLASH_RE = /\/$/;

async function runSql(
  host: string,
  token: string,
  warehouseId: string,
  statement: string
) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  let res = await fetch(`${host}/api/2.0/sql/statements`, {
    method: "POST",
    headers,
    body: JSON.stringify({ warehouse_id: warehouseId, statement }),
  });
  let data = await res.json();
  const statementId = data.statement_id;

  while (data.status?.state === "PENDING" || data.status?.state === "RUNNING") {
    await new Promise((r) => setTimeout(r, 2000));
    res = await fetch(`${host}/api/2.0/sql/statements/${statementId}`, {
      headers,
    });
    data = await res.json();
  }
  if (data.status?.state !== "SUCCEEDED") {
    throw new Error(`SQL failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function seedDatabricksVectorSearch() {
  const host = process.env.DATABRICKS_HOST?.replace(/\/$/, "");
  const token = process.env.DATABRICKS_TOKEN;
  const indexName = process.env.DATABRICKS_VS_INDEX;

  if (!(host && token && indexName)) {
    console.log(
      "Databricks Vector Search credentials missing. Skipping Databricks seeding."
    );
    return;
  }

  console.log("\n🔌 Checking Databricks environment...");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const resW = await fetch(`${host}/api/2.0/sql/warehouses`, { headers });
  if (!resW.ok) {
    throw new Error(`Failed to list warehouses: ${await resW.text()}`);
  }
  const dataW = await resW.json();
  const warehouseId = dataW.warehouses?.[0]?.id;
  if (!warehouseId) {
    throw new Error("No Databricks SQL warehouse found.");
  }

  const tableName = "workspace.default.san_healthcare_source";

  console.log(`📦 Dropping and recreating table ${tableName}...`);
  await runSql(host, token, warehouseId, `DROP TABLE IF EXISTS ${tableName}`);
  await runSql(
    host,
    token,
    warehouseId,
    `CREATE TABLE ${tableName} (id STRING, title STRING, summary STRING, category STRING, state STRING, district STRING) TBLPROPERTIES (delta.enableChangeDataFeed = true)`
  );

  console.log("📤 Inserting seed data into Delta table...");
  const values = seedFacilities
    .map(
      (f) =>
        `('${f.id}', '${f.title.replace(/'/g, "''")}', '${f.summary.replace(
          /'/g,
          "''"
        )}', '${f.category}', '${f.state}', '${f.district}')`
    )
    .join(",\n");
  await runSql(
    host,
    token,
    warehouseId,
    `INSERT INTO ${tableName} VALUES ${values}`
  );

  console.log(`📐 Creating/Syncing Delta Sync Vector Index ${indexName}...`);
  const resIndex = await fetch(`${host}/api/2.0/vector-search/indexes`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: indexName,
      endpoint_name: "search",
      primary_key: "id",
      index_type: "DELTA_SYNC",
      delta_sync_index_spec: {
        source_table: tableName,
        embedding_source_columns: [
          {
            name: "summary",
            embedding_model_endpoint_name: "databricks-bge-large-en",
          },
        ],
        pipeline_type: "TRIGGERED",
      },
    }),
  });

  if (resIndex.ok) {
    console.log("  Index created successfully!");
  } else {
    const error = await resIndex.text();
    if (error.includes("ALREADY_EXISTS")) {
      console.log("  Index already exists. Triggering sync...");
      const syncRes = await fetch(
        `${host}/api/2.0/vector-search/indexes/${indexName}/sync`,
        { method: "POST", headers }
      );
      if (!syncRes.ok) {
        console.error("  Sync failed:", await syncRes.text());
      }
    } else {
      throw new Error(`Index creation failed: ${error}`);
    }
  }

  console.log("✅ Databricks Vector Search seeding complete!");
}

async function main() {
  console.log("🚀 Starting Healthcare Desert Graph RAG seed process...\n");

  await seedNeo4j();
  console.log("");
  await seedDatabricksVectorSearch();

  console.log("\n🎉 All done! Healthcare Desert Graph RAG is ready.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
