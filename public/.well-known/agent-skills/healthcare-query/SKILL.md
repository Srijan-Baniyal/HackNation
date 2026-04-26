# Serving a Nation — Healthcare Query Skill

Interact with India's healthcare desert intelligence platform to discover specialty gaps, view facility data, and navigate the analytics interface.

## Overview

This skill exposes the key actions of the **Serving a Nation** platform to AI agents via the WebMCP API (`navigator.modelContext`). The platform covers healthcare facility data, specialty desert detection, and evidence-grade reporting across all Indian states.

## Available Tools

### `navigate`

Navigate to a specific section of the platform.

**Input schema:**

```json
{
  "type": "object",
  "properties": {
    "page": {
      "type": "string",
      "enum": ["home", "dashboard", "map", "query"],
      "description": "The destination section: home (landing), dashboard (analytics), map (geospatial facility view), query (Graph RAG natural language interface)"
    }
  },
  "required": ["page"]
}
```

**Returns:** `{ "success": true, "navigatedTo": "<page>" }`

### `get-site-info`

Retrieve structured metadata about the platform's capabilities, sections, and data coverage.

**Input schema:**

```json
{ "type": "object", "properties": {} }
```

**Returns:**

```json
{
  "name": "Serving a Nation",
  "description": "Healthcare desert intelligence platform for India",
  "capabilities": ["facility mapping", "specialty gap detection", "Graph RAG queries", "evidence reports"],
  "sections": {
    "dashboard": "/dashboard",
    "map": "/dashboard/map",
    "query": "/dashboard/query"
  }
}
```

## Data Coverage

Government-verified facility data across all Indian states and union territories. Specialty gap analysis covers cardiology, oncology, neurology, obstetrics, paediatrics, and 12+ additional specialties. Knowledge graph powered by Neo4j; semantic search by Databricks vector search.

## Integration Notes

- Tools are registered via `navigator.modelContext.registerTool()` on page load
- Unregistered automatically when the page unloads via `AbortController`
- No authentication required for navigation and metadata tools
