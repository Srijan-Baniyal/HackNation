import { getSiteUrl } from "@/lib/site-url";

export const runtime = "edge";

export function GET() {
  const siteUrl = getSiteUrl();

  const markdown = `# Serving a Nation — Healthcare Desert Intelligence

> Graph RAG operations center for specialty gap detection, map-led response, and auditable health evidence exports.

## Overview

**Serving a Nation** is an AI-powered healthcare intelligence platform that identifies healthcare specialty deserts across India. It combines Graph RAG (powered by Neo4j and Databricks vector search) with facility mapping, desert detection algorithms, and evidence-grade reporting for NGOs, researchers, and public health coordinators.

## Capabilities

- **Specialty Desert Detection** — Identify regions where critical medical specialties are absent or severely under-resourced
- **Facility Mapping** — Interactive map of healthcare facilities across Indian states and districts
- **Graph RAG Queries** — Natural language queries over a knowledge graph of facilities, specialties, and population data
- **Evidence Reports** — Export PDF and Excel evidence packages for use in government coordination and grant applications
- **Live National Signal** — Real-time snapshot of top-burden states and lead specialty gaps

## Navigation

| Section | URL | Description |
|---------|-----|-------------|
| Home | ${siteUrl}/ | Platform overview and live operations brief |
| Dashboard | ${siteUrl}/dashboard | Analytics command center |
| Desert Map | ${siteUrl}/dashboard/map | Interactive geospatial facility and desert map |
| Query Interface | ${siteUrl}/dashboard/query | Natural language Graph RAG query interface |

## Technology Stack

- **Knowledge Graph**: Neo4j (graph database for facility, specialty, and population relationships)
- **Vector Search**: Databricks (semantic search over healthcare documents and evidence)
- **Rendering**: Next.js 16 with React Server Components
- **Mapping**: MapLibre GL

## Agent Integration

- API Catalog: ${siteUrl}/.well-known/api-catalog
- Agent Skills: ${siteUrl}/.well-known/agent-skills/index.json
- MCP Server: ${siteUrl}/.well-known/mcp/server-card.json

## Data Coverage

Government-verified facility data across all Indian states and union territories. Specialty gap analysis covers cardiology, oncology, neurology, obstetrics, paediatrics, and 12+ additional specialties.

---

*Platform by Serving a Nation. Data sourced from public health registries and NGO field reports.*
`;

  const encoder = new TextEncoder();
  const byteLength = encoder.encode(markdown).length;
  // Rough token estimate: ~4 bytes per token for English prose
  const tokenEstimate = Math.ceil(byteLength / 4);

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "x-markdown-tokens": String(tokenEstimate),
    },
  });
}
