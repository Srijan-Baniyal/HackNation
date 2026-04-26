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

interface FlowNodeData {
  label: string;
  sublabel: string;
  variant: "source" | "core" | "surface";
  [key: string]: unknown;
}

function FlowNode({ data, isConnectable }: NodeProps) {
  const d = data as FlowNodeData;
  const isCore = d.variant === "core";
  const isSource = d.variant === "source";

  return (
    <div
      style={{
        background: isCore ? "var(--primary)" : "var(--card)",
        border: `1px solid ${isCore ? "transparent" : "var(--border)"}`,
        boxShadow: isCore ? "0 0 0 1px var(--primary)" : undefined,
        color: isCore ? "var(--primary-foreground)" : "var(--card-foreground)",
        padding: "10px 14px",
        minWidth: "160px",
        borderRadius: 0,
        opacity: isSource ? 0.72 : 1,
      }}
    >
      <Handle
        isConnectable={isConnectable}
        position={Position.Top}
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
        position={Position.Bottom}
        style={{ background: "var(--border)", border: "none", borderRadius: 0 }}
        type="source"
      />
    </div>
  );
}

const nodeTypes = { flow: FlowNode };

const NODES: Node[] = [
  {
    id: "gov",
    type: "flow",
    position: { x: 0, y: 0 },
    data: {
      label: "Government Records",
      sublabel: "Ministry of Health & Family Welfare",
      variant: "source",
    },
  },
  {
    id: "ngo",
    type: "flow",
    position: { x: 220, y: 0 },
    data: {
      label: "NGO Field Reports",
      sublabel: "Partner organisation data",
      variant: "source",
    },
  },
  {
    id: "survey",
    type: "flow",
    position: { x: 440, y: 0 },
    data: {
      label: "Facility Surveys",
      sublabel: "District-level census data",
      variant: "source",
    },
  },
  {
    id: "ingest",
    type: "flow",
    position: { x: 175, y: 130 },
    data: {
      label: "Ingestion Pipeline",
      sublabel: "Validation, normalisation, enrichment",
      variant: "surface",
    },
  },
  {
    id: "neo4j",
    type: "flow",
    position: { x: 40, y: 265 },
    data: {
      label: "Neo4j",
      sublabel: "Knowledge graph — facilities, specialties, districts",
      variant: "core",
    },
  },
  {
    id: "databricks",
    type: "flow",
    position: { x: 380, y: 265 },
    data: {
      label: "Databricks",
      sublabel: "Vector search index — semantic similarity",
      variant: "core",
    },
  },
  {
    id: "rag",
    type: "flow",
    position: { x: 175, y: 400 },
    data: {
      label: "Graph RAG Engine",
      sublabel: "Cypher generation + semantic fusion + evidence ranking",
      variant: "core",
    },
  },
  {
    id: "dashboard",
    type: "flow",
    position: { x: 0, y: 530 },
    data: {
      label: "Dashboard",
      sublabel: "Analytics overview",
      variant: "surface",
    },
  },
  {
    id: "map",
    type: "flow",
    position: { x: 160, y: 530 },
    data: {
      label: "Desert Map",
      sublabel: "Geospatial view",
      variant: "surface",
    },
  },
  {
    id: "query",
    type: "flow",
    position: { x: 320, y: 530 },
    data: {
      label: "NLQ Interface",
      sublabel: "Natural language queries",
      variant: "surface",
    },
  },
  {
    id: "reports",
    type: "flow",
    position: { x: 480, y: 530 },
    data: {
      label: "Evidence Reports",
      sublabel: "PDF + Excel exports",
      variant: "surface",
    },
  },
];

const EDGES: Edge[] = [
  {
    id: "gov-ingest",
    source: "gov",
    target: "ingest",
    type: "smoothstep",
    style: { stroke: "var(--border)", strokeWidth: 1 },
  },
  {
    id: "ngo-ingest",
    source: "ngo",
    target: "ingest",
    type: "smoothstep",
    style: { stroke: "var(--border)", strokeWidth: 1 },
  },
  {
    id: "survey-ingest",
    source: "survey",
    target: "ingest",
    type: "smoothstep",
    style: { stroke: "var(--border)", strokeWidth: 1 },
  },
  {
    id: "ingest-neo4j",
    source: "ingest",
    target: "neo4j",
    type: "smoothstep",
    style: { stroke: "var(--primary)", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "ingest-databricks",
    source: "ingest",
    target: "databricks",
    type: "smoothstep",
    style: { stroke: "var(--primary)", strokeWidth: 1.5, opacity: 0.7 },
  },
  {
    id: "neo4j-rag",
    source: "neo4j",
    target: "rag",
    type: "smoothstep",
    style: { stroke: "var(--primary)", strokeWidth: 2, opacity: 0.9 },
    animated: true,
  },
  {
    id: "databricks-rag",
    source: "databricks",
    target: "rag",
    type: "smoothstep",
    style: { stroke: "var(--primary)", strokeWidth: 2, opacity: 0.9 },
    animated: true,
  },
  {
    id: "rag-dashboard",
    source: "rag",
    target: "dashboard",
    type: "smoothstep",
    style: { stroke: "var(--border)", strokeWidth: 1 },
  },
  {
    id: "rag-map",
    source: "rag",
    target: "map",
    type: "smoothstep",
    style: { stroke: "var(--border)", strokeWidth: 1 },
  },
  {
    id: "rag-query",
    source: "rag",
    target: "query",
    type: "smoothstep",
    style: { stroke: "var(--border)", strokeWidth: 1 },
  },
  {
    id: "rag-reports",
    source: "rag",
    target: "reports",
    type: "smoothstep",
    style: { stroke: "var(--border)", strokeWidth: 1 },
  },
];

export function ArchitectureFlow() {
  const nodes = useMemo(() => NODES, []);
  const edges = useMemo(() => EDGES, []);

  return (
    <div
      className="border border-border"
      style={{ height: 650, background: "var(--background)" }}
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
