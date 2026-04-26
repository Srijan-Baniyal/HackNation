"use server";

import { checkDatabricksConnection } from "@/lib/graph-rag/databricks";
import { checkNeo4jConnection } from "@/lib/graph-rag/neo4j";
import {
  executeGraphRAG,
  executeLocalFallback,
} from "@/lib/graph-rag/pipeline";
import type { GraphRAGResult } from "@/lib/graph-rag/types";

export interface GraphRAGActionResult {
  data: GraphRAGResult | null;
  error: string | null;
  mode: "graph-rag" | "local-fallback";
}

export async function runGraphRAGQuery(
  formData: FormData
): Promise<GraphRAGActionResult> {
  const rawQuery = formData.get("q");
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

  if (query.length === 0) {
    return {
      data: null,
      error: "Please enter a query.",
      mode: "local-fallback",
    };
  }

  // Check if external services are configured
  const hasNeo4j = Boolean(process.env.NEO4J_URI);
  const hasDatabricks = Boolean(
    process.env.DATABRICKS_HOST && process.env.DATABRICKS_TOKEN
  );

  if (hasNeo4j && hasDatabricks) {
    // Try full Graph RAG pipeline
    try {
      const [neo4jOk, databricksOk] = await Promise.all([
        checkNeo4jConnection(),
        checkDatabricksConnection(),
      ]);

      if (neo4jOk && databricksOk) {
        const data = await executeGraphRAG(query);
        return { data, error: null, mode: "graph-rag" };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Graph RAG pipeline error:", message);
    }
  }

  // Fallback to local seed data
  try {
    const data = await executeLocalFallback(query);
    return { data, error: null, mode: "local-fallback" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Query failed";
    return { data: null, error: message, mode: "local-fallback" };
  }
}
