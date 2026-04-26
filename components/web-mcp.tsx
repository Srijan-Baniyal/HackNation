"use client";

import { useEffect } from "react";

interface McpTool {
  description: string;
  execute: (params: unknown) => Promise<unknown>;
  inputSchema: Record<string, unknown>;
  name: string;
}

interface ModelContext {
  registerTool: (tool: McpTool, options: { signal: AbortSignal }) => void;
}

declare global {
  interface Navigator {
    modelContext?: ModelContext;
  }
}

export function WebMCP() {
  useEffect(() => {
    if (!navigator.modelContext) {
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;
    const mc = navigator.modelContext;

    mc.registerTool(
      {
        name: "navigate",
        description:
          "Navigate to a section of the Serving a Nation healthcare intelligence platform",
        inputSchema: {
          type: "object",
          properties: {
            page: {
              type: "string",
              enum: ["home", "dashboard", "map", "query"],
              description:
                "Destination: home (landing page), dashboard (analytics), map (geospatial facility view), query (Graph RAG natural language interface)",
            },
          },
          required: ["page"],
        },
        execute: (params: unknown) => {
          const { page } = params as { page: string };
          const routes: Record<string, string> = {
            home: "/",
            dashboard: "/dashboard",
            map: "/dashboard/map",
            query: "/dashboard/query",
          };
          const path = routes[page] ?? "/";
          window.location.href = path;
          return Promise.resolve({ success: true, navigatedTo: page });
        },
      },
      { signal }
    );

    mc.registerTool(
      {
        name: "get-site-info",
        description:
          "Get structured metadata about the Serving a Nation platform: capabilities, sections, and data coverage",
        inputSchema: {
          type: "object",
          properties: {},
        },
        execute: async () => ({
          name: "Serving a Nation",
          description:
            "Healthcare desert intelligence platform for India — Graph RAG powered by Neo4j and Databricks",
          capabilities: [
            "facility mapping",
            "specialty gap detection",
            "Graph RAG queries",
            "evidence-grade PDF/Excel reports",
          ],
          sections: {
            home: "/",
            dashboard: "/dashboard",
            map: "/dashboard/map",
            query: "/dashboard/query",
          },
          dataCoverage: {
            geography: "All Indian states and union territories",
            specialties: [
              "cardiology",
              "oncology",
              "neurology",
              "obstetrics",
              "paediatrics",
              "and 12+ more",
            ],
          },
        }),
      },
      { signal }
    );

    return () => {
      controller.abort();
    };
  }, []);

  return null;
}
