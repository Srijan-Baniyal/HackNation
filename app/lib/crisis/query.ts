import type {
  CrisisCategory,
  CrisisFilters,
  CrisisSeverity,
  TrustSignal,
} from "@/app/lib/crisis/types";

const relativeDaysRegex = /(?:last|past)\s+(\d{1,3})\s+(?:day|days|d)\b/i;

const categoryKeywords: [CrisisCategory, string[]][] = [
  ["flood", ["flood", "flooding", "river", "overflow", "inundation"]],
  ["earthquake", ["earthquake", "seismic", "aftershock", "quake"]],
  [
    "conflict",
    ["conflict", "clashes", "violence", "hostilities", "insecurity"],
  ],
  ["wildfire", ["wildfire", "fire", "smoke", "burning"]],
  ["epidemic", ["epidemic", "cholera", "outbreak", "disease", "infection"]],
  ["storm", ["storm", "cyclone", "hurricane", "typhoon", "landfall"]],
  ["drought", ["drought", "water stress", "food insecurity", "dry spell"]],
  ["landslide", ["landslide", "mudslide", "slope failure", "rockfall"]],
];

const severityKeywords: [CrisisSeverity, string[]][] = [
  ["critical", ["critical", "catastrophic", "severe", "emergency"]],
  ["high", ["high", "major", "dangerous"]],
  ["medium", ["medium", "moderate"]],
  ["low", ["low", "minor"]],
];

const trustKeywords: [TrustSignal, string[]][] = [
  ["verified", ["verified", "confirmed"]],
  ["disputed", ["disputed", "contested"]],
  ["unverified", ["unverified", "uncertain"]],
  ["reported", ["reported", "field report", "bulletin"]],
];

const daysMatch = (value: string): number | null => {
  const match = relativeDaysRegex.exec(value);
  if (!match) {
    return null;
  }
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const inferFromKeywords = <T extends string>(
  query: string,
  options: [T, string[]][]
): T | null => {
  const q = query.toLowerCase();
  for (const [value, words] of options) {
    if (words.some((word) => q.includes(word))) {
      return value;
    }
  }
  return null;
};

export const parseNaturalLanguageQuery = (raw: string): CrisisFilters => {
  const trimmed = raw.trim();

  return {
    q: trimmed.length > 0 ? trimmed : null,
    category: inferFromKeywords(trimmed, categoryKeywords),
    severity: inferFromKeywords(trimmed, severityKeywords),
    trust: inferFromKeywords(trimmed, trustKeywords),
    country: null,
    region: null,
    sinceDays: daysMatch(trimmed),
  };
};

export const parseFiltersFromSearchParams = (
  searchParams: Record<string, string | string[] | undefined>
): CrisisFilters => {
  const get = (key: string) => {
    const value = searchParams[key];
    return typeof value === "string" ? value : undefined;
  };

  const sinceDaysRaw = get("sinceDays");
  const sinceDays =
    sinceDaysRaw && Number.isFinite(Number(sinceDaysRaw))
      ? Number(sinceDaysRaw)
      : null;

  const category = get("category") as CrisisCategory | undefined;
  const severity = get("severity") as CrisisSeverity | undefined;
  const trust = get("trust") as TrustSignal | undefined;

  return {
    q: get("q") ?? null,
    category: category ?? null,
    severity: severity ?? null,
    trust: trust ?? null,
    country: get("country") ?? null,
    region: get("region") ?? null,
    sinceDays,
  };
};

export const filtersToSearchParams = (
  filters: CrisisFilters
): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.q) {
    params.set("q", filters.q);
  }
  if (filters.category) {
    params.set("category", filters.category);
  }
  if (filters.severity) {
    params.set("severity", filters.severity);
  }
  if (filters.trust) {
    params.set("trust", filters.trust);
  }
  if (filters.country) {
    params.set("country", filters.country);
  }
  if (filters.region) {
    params.set("region", filters.region);
  }
  if (typeof filters.sinceDays === "number") {
    params.set("sinceDays", String(filters.sinceDays));
  }
  return params;
};
