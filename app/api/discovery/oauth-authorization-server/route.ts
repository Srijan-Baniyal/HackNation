import { getSiteUrl } from "@/lib/site-url";

export function GET() {
  const siteUrl = getSiteUrl();

  const metadata = {
    issuer: siteUrl,
    authorization_endpoint: `${siteUrl}/auth/authorize`,
    token_endpoint: `${siteUrl}/auth/token`,
    jwks_uri: `${siteUrl}/.well-known/jwks.json`,
    registration_endpoint: `${siteUrl}/auth/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "client_credentials"],
    token_endpoint_auth_methods_supported: ["none", "client_secret_basic"],
    scopes_supported: [
      "openid",
      "read:facilities",
      "read:analytics",
      "read:reports",
    ],
    code_challenge_methods_supported: ["S256"],
    service_documentation: `${siteUrl}/about`,
  };

  return Response.json(metadata, {
    headers: {
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
