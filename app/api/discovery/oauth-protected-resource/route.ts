import { getSiteUrl } from "@/lib/site-url";

export function GET() {
  const siteUrl = getSiteUrl();

  const metadata = {
    resource: siteUrl,
    authorization_servers: [siteUrl],
    scopes_supported: ["read:facilities", "read:analytics", "read:reports"],
    bearer_methods_supported: ["header"],
    resource_documentation: `${siteUrl}/about`,
    resource_signing_alg_values_supported: ["RS256"],
  };

  return Response.json(metadata, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
