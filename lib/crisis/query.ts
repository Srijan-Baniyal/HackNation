import type {
  DataConfidence,
  DesertFilters,
  GapSeverity,
  Specialty,
} from "@/lib/crisis/types";

const relativeDaysRegex = /(?:last|past)\s+(\d{1,3})\s+(?:day|days|d)\b/i;

const specialtyKeywords: [Specialty, string[]][] = [
  ["oncology", ["oncology", "cancer", "tumor", "chemotherapy", "radiotherapy"]],
  ["dialysis", ["dialysis", "kidney", "renal", "ckd", "hemodialysis"]],
  [
    "emergency-trauma",
    ["trauma", "emergency", "accident", "icu", "critical care"],
  ],
  ["cardiology", ["cardiology", "cardiac", "heart", "cath lab", "angioplasty"]],
  ["maternity", ["maternity", "maternal", "obstetric", "delivery", "neonatal"]],
  [
    "pediatrics",
    ["pediatric", "child", "neonatal", "nicu", "infant", "children"],
  ],
  [
    "mental-health",
    ["mental health", "psychiatry", "psychiatric", "counseling", "psychology"],
  ],
  [
    "orthopedics",
    ["orthopedic", "fracture", "bone", "joint", "spine", "musculoskeletal"],
  ],
  ["general", ["general", "primary"]],
];

const severityKeywords: [GapSeverity, string[]][] = [
  ["critical", ["critical", "severe desert", "no access", "zero coverage"]],
  ["severe", ["severe", "major gap", "dangerous", "inadequate"]],
  ["moderate", ["moderate", "partial", "limited"]],
  ["none", ["adequate", "sufficient", "covered"]],
];

const confidenceKeywords: [DataConfidence, string[]][] = [
  ["govt-verified", ["verified", "government", "official", "nhm"]],
  ["survey-reported", ["survey", "nfhs", "census"]],
  ["crowd-sourced", ["crowd", "community", "reported"]],
  ["estimated", ["estimated", "projected", "modeled"]],
];

const indiaStates = [
  "andhra pradesh",
  "arunachal pradesh",
  "assam",
  "bihar",
  "chhattisgarh",
  "goa",
  "gujarat",
  "haryana",
  "himachal pradesh",
  "jharkhand",
  "karnataka",
  "kerala",
  "madhya pradesh",
  "maharashtra",
  "manipur",
  "meghalaya",
  "mizoram",
  "nagaland",
  "odisha",
  "punjab",
  "rajasthan",
  "sikkim",
  "tamil nadu",
  "telangana",
  "tripura",
  "uttar pradesh",
  "uttarakhand",
  "west bengal",
  "ladakh",
  "jammu and kashmir",
  "delhi",
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

const inferState = (query: string): string | null => {
  const q = query.toLowerCase();
  for (const state of indiaStates) {
    if (q.includes(state)) {
      // Capitalize each word
      return state
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }
  }
  return null;
};

export const parseNaturalLanguageQuery = (raw: string): DesertFilters => {
  const trimmed = raw.trim();

  return {
    q: trimmed.length > 0 ? trimmed : null,
    category: inferFromKeywords(trimmed, specialtyKeywords),
    severity: inferFromKeywords(trimmed, severityKeywords),
    confidence: inferFromKeywords(trimmed, confidenceKeywords),
    state: inferState(trimmed),
    district: null,
    facilityType: null,
    sinceDays: daysMatch(trimmed),
  };
};

export const parseFiltersFromSearchParams = (
  searchParams: Record<string, string | string[] | undefined>
): DesertFilters => {
  const get = (key: string) => {
    const value = searchParams[key];
    return typeof value === "string" ? value : undefined;
  };

  const sinceDaysRaw = get("sinceDays");
  const sinceDays =
    sinceDaysRaw && Number.isFinite(Number(sinceDaysRaw))
      ? Number(sinceDaysRaw)
      : null;

  const category = get("category") as Specialty | undefined;
  const severity = get("severity") as GapSeverity | undefined;
  const confidence = get("confidence") as DataConfidence | undefined;

  return {
    q: get("q") ?? null,
    category: category ?? null,
    severity: severity ?? null,
    confidence: confidence ?? null,
    state: get("state") ?? null,
    district: get("district") ?? null,
    facilityType: null,
    sinceDays,
  };
};

export const filtersToSearchParams = (
  filters: DesertFilters
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
  if (filters.confidence) {
    params.set("confidence", filters.confidence);
  }
  if (filters.state) {
    params.set("state", filters.state);
  }
  if (filters.district) {
    params.set("district", filters.district);
  }
  if (typeof filters.sinceDays === "number") {
    params.set("sinceDays", String(filters.sinceDays));
  }
  return params;
};
