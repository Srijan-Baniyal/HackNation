import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://servinganation.org";

const routes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/dashboard", changeFrequency: "daily", priority: 0.9 },
  { path: "/dashboard/query", changeFrequency: "daily", priority: 0.9 },
  { path: "/dashboard/map", changeFrequency: "daily", priority: 0.85 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
