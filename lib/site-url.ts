const FALLBACK_SITE_URL = "https://hacking-nation.vercel.app";

const ensureProtocol = (value: string) =>
  value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;

export const getSiteUrl = () => {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    FALLBACK_SITE_URL;

  return new URL(ensureProtocol(raw)).toString().replace(/\/$/, "");
};
