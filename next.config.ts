import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,

  async headers() {
    const linkValues = [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</.well-known/agent-skills/index.json>; rel="describedby"; type="application/json"',
      '</.well-known/mcp/server-card.json>; rel="describedby"; title="MCP Server Card"',
    ].join(", ");

    return [
      {
        source: "/",
        headers: [{ key: "Link", value: linkValues }],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/.well-known/api-catalog",
        destination: "/api/discovery/api-catalog",
      },
      {
        source: "/.well-known/mcp/server-card.json",
        destination: "/api/discovery/mcp-server-card",
      },
      {
        source: "/.well-known/agent-skills/index.json",
        destination: "/api/discovery/agent-skills",
      },
      {
        source: "/.well-known/oauth-authorization-server",
        destination: "/api/discovery/oauth-authorization-server",
      },
      {
        source: "/.well-known/oauth-protected-resource",
        destination: "/api/discovery/oauth-protected-resource",
      },
    ];
  },
};

export default nextConfig;
