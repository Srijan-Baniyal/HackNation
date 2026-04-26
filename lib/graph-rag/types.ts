export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
}

export interface GraphRelationship {
  endNodeId: string;
  properties: Record<string, unknown>;
  startNodeId: string;
  type: string;
}

export interface GraphContext {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface VectorMatch {
  category: string;
  country: string;
  district: string;
  id: string;
  score: number;
  state: string;
  summary: string;
  title: string;
}

export interface GraphRAGResult {
  answer: string;
  confidence: number;
  generatedCypher: string | null;
  graphContext: GraphContext;
  query: string;
  vectorMatches: VectorMatch[];
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
    index: number;
  }>;
}

export interface VectorSearchResponse {
  manifest: {
    column_count: number;
    columns: Array<{ name: string }>;
  };
  next_page_token: string | null;
  result: {
    data_array: Array<Array<string | number>>;
    row_count: number;
  };
}
