import { getSiteUrl } from "@/lib/site-url";

export function GET() {
  const siteUrl = getSiteUrl();

  const serverCard = {
    schema_version: "1.0",
    serverInfo: {
      name: "Serving a Nation — Healthcare Desert Intelligence",
      version: "1.0.0",
      description:
        "Graph RAG operations center for specialty gap detection, facility mapping, and evidence-grade health reporting across India.",
    },
    endpoint: `${siteUrl}/api/mcp`,
    transport: "streamable-http",
    capabilities: {
      tools: {
        available: true,
        items: [
          {
            name: "navigate",
            description:
              "Navigate to a section of the platform (home, dashboard, map, query)",
          },
          {
            name: "get-site-info",
            description:
              "Retrieve structured metadata about the platform capabilities and data coverage",
          },
        ],
      },
      resources: {
        available: false,
      },
      prompts: {
        available: false,
      },
    },
    contact: {
      url: siteUrl,
    },
  };

  return Response.json(serverCard, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
