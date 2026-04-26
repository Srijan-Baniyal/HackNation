import { getSiteUrl } from "@/lib/site-url";

export const runtime = "edge";

export function GET() {
  const siteUrl = getSiteUrl();

  const catalog = {
    linkset: [
      {
        anchor: `${siteUrl}/`,
        "service-doc": [
          {
            href: `${siteUrl}/dashboard`,
            type: "text/html",
            title: "Healthcare Desert Intelligence — Dashboard",
          },
        ],
        describedby: [
          {
            href: `${siteUrl}/.well-known/agent-skills/index.json`,
            type: "application/json",
            title: "Agent Skills Index",
          },
        ],
      },
      {
        anchor: `${siteUrl}/api/og`,
        "service-desc": [
          {
            href: `${siteUrl}/api/og`,
            type: "image/png",
            title: "Open Graph Image API",
          },
        ],
      },
    ],
  };

  return Response.json(catalog, {
    headers: {
      "Content-Type": "application/linkset+json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
