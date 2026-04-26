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
  /** Which chunk produced this match (e.g. "gap" or "narrative"). */
  chunkKind?: string;
  country: string;
  district: string;
  id: string;
  score: number;
  /** Per-stage decomposition of the match score. */
  scoreBreakdown?: {
    bm25: number;
    facetBoost: number;
    weight: number;
  };
  state: string;
  summary: string;
  title: string;
}

export type PipelineStageName =
  | "parse"
  | "chunk"
  | "embed"
  | "retrieve"
  | "rerank"
  | "graph"
  | "compose";

export interface PipelineStage {
  detail: string;
  /** Approximate ms cost of the stage on the server. */
  durationMs: number;
  label: string;
  /** Auxiliary data the UI can render, e.g. token counts, hit counts. */
  meta: Record<string, string | number>;
  name: PipelineStageName;
}

export interface ReasoningStep {
  /** Optional facility id this step cites for traceability. */
  citationId?: string;
  /** Human-readable narrative line. */
  text: string;
}

export interface RecommendedAction {
  description: string;
  facilityId?: string;
  priority: "high" | "medium" | "low";
  title: string;
}

export interface GraphRAGResult {
  answer: string;
  confidence: number;
  /** Total chunks indexed (visible in pipeline summary). */
  corpusSize: number;
  /** Detected facets from the natural language input. */
  facets: {
    state: string | null;
    district: string | null;
    category: string | null;
    severity: string | null;
    confidence: string | null;
    facilityType: string | null;
  };
  generatedCypher: string | null;
  graphContext: GraphContext;
  query: string;
  /** Tokens the retrieval engine searched for. */
  queryTerms: string[];
  /** Structured reasoning chain — each step references evidence. */
  reasoning: ReasoningStep[];
  /** Recommended next actions derived from gap signals. */
  recommendations: RecommendedAction[];
  /** Stage-by-stage trace of what the pipeline did. */
  stages: PipelineStage[];
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
