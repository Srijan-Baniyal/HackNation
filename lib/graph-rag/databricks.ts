import type { VectorMatch, VectorSearchResponse } from "@/lib/graph-rag/types";

const TRAILING_SLASH_RE = /\/$/;

const getDatabricksHost = () => {
  const host = process.env.DATABRICKS_HOST;
  if (!host) {
    throw new Error("DATABRICKS_HOST environment variable is not set.");
  }
  return host.replace(TRAILING_SLASH_RE, "");
};

const getDatabricksToken = () => {
  const token = process.env.DATABRICKS_TOKEN;
  if (!token) {
    throw new Error("DATABRICKS_TOKEN environment variable is not set.");
  }
  return token;
};

const getIndexName = () => {
  const index = process.env.DATABRICKS_VS_INDEX;
  if (!index) {
    throw new Error("DATABRICKS_VS_INDEX environment variable is not set.");
  }
  return index;
};

/**
 * Generate an embedding vector for a text query using
 * Databricks Foundation Model serving.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const host = getDatabricksHost();
  const token = getDatabricksToken();

  const response = await fetch(
    `${host}/serving-endpoints/databricks-bge-large-en/invocations`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: [text],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Databricks embedding request failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

/**
 * Search the Databricks Vector Search index for semantically
 * similar crisis incidents.
 */
export async function vectorSearch(
  queryEmbedding: number[],
  topK = 5
): Promise<VectorMatch[]> {
  const host = getDatabricksHost();
  const token = getDatabricksToken();
  const indexName = getIndexName();

  const response = await fetch(
    `${host}/api/2.0/vector-search/indexes/${indexName}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query_vector: queryEmbedding,
        columns: ["id", "title", "summary", "category", "state", "district"],
        num_results: topK,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Databricks vector search failed (${response.status}): ${errorText}`
    );
  }

  const data: VectorSearchResponse = await response.json();

  const columns = data.manifest.columns.map((c) => c.name);
  const idIdx = columns.indexOf("id");
  const titleIdx = columns.indexOf("title");
  const summaryIdx = columns.indexOf("summary");
  const categoryIdx = columns.indexOf("category");
  const stateIdx = columns.indexOf("state");
  const districtIdx = columns.indexOf("district");
  const scoreIdx = columns.indexOf("score");

  return data.result.data_array.map((row) => ({
    id: String(row[idIdx]),
    score: Number(row[scoreIdx] ?? 0),
    title: String(row[titleIdx] ?? ""),
    summary: String(row[summaryIdx] ?? ""),
    category: String(row[categoryIdx] ?? ""),
    state: String(row[stateIdx] ?? ""),
    district: String(row[districtIdx] ?? ""),
    country: "India",
  }));
}

/**
 * Check if the Databricks Vector Search endpoint is reachable.
 */
export async function checkDatabricksConnection(): Promise<boolean> {
  try {
    const host = getDatabricksHost();
    const token = getDatabricksToken();
    const endpoint = process.env.DATABRICKS_VS_ENDPOINT ?? "san-vector-search";

    const response = await fetch(
      `${host}/api/2.0/vector-search/endpoints/${endpoint}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}
