import { getSiteUrl } from "@/lib/site-url";

export function GET() {
  const siteUrl = getSiteUrl();

  const index = {
    $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
    skills: [
      {
        name: "healthcare-query",
        type: "skill-md",
        description:
          "Navigate the Serving a Nation platform and retrieve healthcare desert intelligence data for India via WebMCP tools.",
        url: `${siteUrl}/.well-known/agent-skills/healthcare-query/SKILL.md`,
        digest:
          "sha256:63daf449a5aec77b9b7894a5f76884e1c58fc44a9c6250ae8de4871e4a74e87d",
      },
    ],
  };

  return Response.json(index, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
