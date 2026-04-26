"use client";

import "@xyflow/react/dist/base.css";
import {
  Background,
  BackgroundVariant,
  type Edge,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
} from "@xyflow/react";
import { useMemo } from "react";

interface QueryNodeData {
  label: string;
  sublabel: string;
  variant: "input" | "process" | "db" | "output";
  [key: string]: unknown;
}

function nodeBg(variant: QueryNodeData["variant"]) {
  if (variant === "output") {
    return "var(--primary)";
  }
  if (variant === "db") {
    return "var(--muted)";
  }
  return "var(--card)";
}

function QueryNode({ data, isConnectable }: NodeProps) {
  const d = data as QueryNodeData;
  const isOutput = d.variant === "output";

  return (
    <div
      style={{
        background: nodeBg(d.variant),
        border: `1px solid ${isOutput ? "transparent" : "var(--border)"}`,
        boxShadow: isOutput ? "0 0 0 1px var(--primary)" : undefined,
        color: isOutput
          ? "var(--primary-foreground)"
          : "var(--card-foreground)",
        padding: "10px 14px",
        minWidth: "148px",
        borderRadius: 0,
      }}
    >
      <Handle
        isConnectable={isConnectable}
        position={Position.Left}
        style={{ background: "var(--border)", border: "none", borderRadius: 0 }}
        type="target"
      />
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          lineHeight: 1.2,
        }}
      >
        {d.label}
      </p>
      <p
        style={{
          fontSize: "10px",
          opacity: 0.65,
          marginTop: "4px",
          letterSpacing: "0.03em",
          lineHeight: 1.3,
        }}
      >
        {d.sublabel}
      </p>
      <Handle
        isConnectable={isConnectable}
        position={Position.Right}
        style={{ background: "var(--border)", border: "none", borderRadius: 0 }}
        type="source"
      />
    </div>
  );
}

const nodeTypes = { query: QueryNode };

const NODES: Node[] = [
  {
    id: "input",
    type: "query",
    position: { x: 0, y: 170 },
    data: {
      label: "User Query",
      sublabel: "Natural language question",
      variant: "input",
    },
  },
  {
    id: "parser",
    type: "query",
    position: { x: 210, y: 170 },
    data: {
      label: "Intent Parser",
      sublabel: "Entity extraction & intent classification",
      variant: "process",
    },
  },
  {
    id: "cypher",
    type: "query",
    position: { x: 440, y: 60 },
    data: {
      label: "Cypher Generator",
      sublabel: "Translates intent to graph query",
      variant: "process",
    },
  },
  {
    id: "semantic",
    type: "query",
    position: { x: 440, y: 280 },
    data: {
      label: "Semantic Query",
      sublabel: "Vector similarity search",
      variant: "process",
    },
  },
  {
    id: "neo4j",
    type: "query",
    position: { x: 670, y: 60 },
    data: {
      label: "Neo4j",
      sublabel: "Knowledge graph traversal",
      variant: "db",
    },
  },
  {
    id: "databricks",
    type: "query",
    position: { x: 670, y: 280 },
    data: {
      label: "Databricks",
      sublabel: "Embedding vector lookup",
      variant: "db",
    },
  },
  {
    id: "fusion",
    type: "query",
    position: { x: 900, y: 170 },
    data: {
      label: "Result Fusion",
      sublabel: "Rerank, deduplicate, cite",
      variant: "process",
    },
  },
  {
    id: "response",
    type: "query",
    position: { x: 1110, y: 170 },
    data: {
      label: "Evidence Response",
      sublabel: "Cited answer with graph context",
      variant: "output",
    },
  },
];

const EDGES: Edge[] = [
  {
    id: "input-parser",
    source: "input",
    target: "parser",
    style: { stroke: "var(--border)", strokeWidth: 1.5 },
    animated: true,
  },
  {
    id: "parser-cypher",
    source: "parser",
    target: "cypher",
    type: "smoothstep",
    style: { stroke: "var(--primary)", strokeWidth: 1.5, opacity: 0.8 },
  },
  {
    id: "parser-semantic",
    source: "parser",
    target: "semantic",
    type: "smoothstep",
    style: { stroke: "var(--chart-2)", strokeWidth: 1.5, opacity: 0.8 },
  },
  {
    id: "cypher-neo4j",
    source: "cypher",
    target: "neo4j",
    style: { stroke: "var(--primary)", strokeWidth: 1.5, opacity: 0.8 },
    animated: true,
  },
  {
    id: "semantic-databricks",
    source: "semantic",
    target: "databricks",
    style: { stroke: "var(--chart-2)", strokeWidth: 1.5, opacity: 0.8 },
    animated: true,
  },
  {
    id: "neo4j-fusion",
    source: "neo4j",
    target: "fusion",
    type: "smoothstep",
    style: { stroke: "var(--primary)", strokeWidth: 1.5, opacity: 0.8 },
  },
  {
    id: "databricks-fusion",
    source: "databricks",
    target: "fusion",
    type: "smoothstep",
    style: { stroke: "var(--chart-2)", strokeWidth: 1.5, opacity: 0.8 },
  },
  {
    id: "fusion-response",
    source: "fusion",
    target: "response",
    style: { stroke: "var(--primary)", strokeWidth: 2 },
    animated: true,
  },
];

export function QueryFlow() {
  const nodes = useMemo(() => NODES, []);
  const edges = useMemo(() => EDGES, []);

  return (
    <div
      className="border border-border"
      style={{ height: 430, background: "var(--background)" }}
    >
      <ReactFlow
        edges={edges}
        edgesFocusable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodes={nodes}
        nodesConnectable={false}
        nodesDraggable={false}
        nodeTypes={nodeTypes}
        panOnDrag
        style={{ background: "var(--background)" }}
        zoomOnScroll
      >
        <Background
          color="var(--border)"
          gap={28}
          size={1}
          variant={BackgroundVariant.Dots}
        />
      </ReactFlow>
    </div>
  );
}
