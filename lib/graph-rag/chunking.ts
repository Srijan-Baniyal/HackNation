import type { HealthcareFacility } from "@/lib/crisis/types";

/**
 * Chunk types let the retriever weight evidence by what kind of
 * statement it represents. Identity statements answer "what is this",
 * narrative chunks answer "what is happening", capacity chunks answer
 * "how big is the gap", and gap chunks describe the desert itself.
 */
export type ChunkKind =
  | "identity"
  | "narrative"
  | "location"
  | "capacity"
  | "gap"
  | "evidence";

export interface FacilityChunk {
  /** Hoisted facets so we can short-circuit filters before scoring */
  facets: {
    state: string;
    district: string;
    category: HealthcareFacility["category"];
    severity: HealthcareFacility["gapSeverity"];
    confidence: HealthcareFacility["confidence"];
    facilityType: HealthcareFacility["facilityType"];
  };
  /** Source facility id */
  facilityId: string;
  /** Stable id: facility id + chunk kind */
  id: string;
  /** What kind of statement this chunk represents */
  kind: ChunkKind;
  /** Pre-tokenised lowercased terms used for BM25 */
  terms: string[];
  /** The text the retriever scores against */
  text: string;
  /** Field weight applied during retrieval (higher == more diagnostic) */
  weight: number;
}

const TOKEN_RE = /[a-z0-9][a-z0-9-]*/g;

/** Standard English stopwords plus domain-noise tokens. */
const STOP_WORDS = new Set<string>([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "of",
  "for",
  "to",
  "in",
  "on",
  "at",
  "by",
  "with",
  "from",
  "as",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "this",
  "that",
  "these",
  "those",
  "it",
  "its",
  "no",
  "not",
  "any",
  "all",
  "into",
  "across",
  "across",
  "than",
  "then",
  "also",
  "their",
  "they",
  "them",
  "there",
  "here",
  "such",
  "have",
  "has",
  "had",
  "due",
  "per",
  "via",
  "off",
  "out",
  "over",
  "under",
  "near",
]);

/** A tiny domain synonym table so common terms boost the right chunk. */
const SYNONYMS: Record<string, string[]> = {
  cancer: ["oncology", "tumor", "chemotherapy", "radiotherapy"],
  oncology: ["cancer", "chemotherapy", "radiotherapy", "tumor"],
  kidney: ["dialysis", "renal", "ckd", "nephrology"],
  renal: ["dialysis", "kidney", "ckd", "nephrology"],
  dialysis: ["kidney", "renal", "ckd", "hemodialysis", "nephrology"],
  trauma: ["emergency", "accident", "icu", "casualty"],
  emergency: ["trauma", "icu", "accident", "casualty"],
  cardiac: ["cardiology", "heart", "cath", "coronary"],
  heart: ["cardiology", "cardiac", "coronary", "angiography"],
  maternal: ["maternity", "obstetric", "delivery", "neonatal"],
  maternity: ["maternal", "obstetric", "delivery", "labour"],
  child: ["pediatrics", "pediatric", "neonatal", "infant", "nicu"],
  pediatric: ["child", "neonatal", "nicu", "infant"],
  psychiatry: ["mental", "psychological", "counseling", "psychiatric"],
  mental: ["psychiatry", "psychiatric", "psychological", "counseling"],
  fracture: ["orthopedic", "bone", "ortho", "spine"],
  orthopedic: ["fracture", "bone", "ortho", "spine"],
  brain: ["neurology", "neurological", "neuro", "stroke"],
  imaging: ["radiology", "scan", "ct", "mri", "petct"],
  desert: ["gap", "shortage", "underserved", "unserved", "lack"],
  gap: ["desert", "shortage", "underserved", "lack"],
  govt: ["government", "official", "public", "ministry"],
  rural: ["village", "countryside", "remote", "tribal"],
  remote: ["rural", "tribal", "interior", "isolated"],
};

/** Lowercase + tokenise + drop stopwords + expand synonyms. */
export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(TOKEN_RE);
  if (!matches) {
    return [];
  }
  const out: string[] = [];
  for (const token of matches) {
    if (token.length < 2 || STOP_WORDS.has(token)) {
      continue;
    }
    out.push(token);
    const expansions = SYNONYMS[token];
    if (expansions) {
      for (const ex of expansions) {
        out.push(ex);
      }
    }
  }
  return out;
}

const SEVERITY_PHRASE: Record<HealthcareFacility["gapSeverity"], string> = {
  critical: "critical desert with no viable specialist coverage",
  severe: "severe shortage with overwhelming wait times",
  moderate: "moderate gap with constrained access",
  none: "adequate coverage with stable specialist supply",
};

const CONFIDENCE_PHRASE: Record<HealthcareFacility["confidence"], string> = {
  "govt-verified": "verified against government infrastructure data",
  "survey-reported": "reported through household and field surveys",
  "crowd-sourced": "crowd-sourced through community health workers",
  estimated: "estimated from indirect indicators",
};

const FACILITY_PHRASE: Record<HealthcareFacility["facilityType"], string> = {
  "tertiary-hospital": "tertiary referral hospital",
  "district-hospital": "district hospital",
  chc: "community health center",
  phc: "primary health center",
  "private-hospital": "private hospital",
  "specialty-center": "specialty center",
};

/**
 * Produce semantic chunks per facility. Multiple chunks per record
 * dramatically improves recall — a query about "rural dialysis" can
 * match a capacity chunk even if the title chunk does not contain it.
 */
export function chunkFacility(facility: HealthcareFacility): FacilityChunk[] {
  const facets = {
    state: facility.state,
    district: facility.district,
    category: facility.category,
    severity: facility.gapSeverity,
    confidence: facility.confidence,
    facilityType: facility.facilityType,
  } as const;

  const make = (
    kind: ChunkKind,
    text: string,
    weight: number
  ): FacilityChunk => ({
    id: `${facility.id}::${kind}`,
    facilityId: facility.id,
    kind,
    text,
    terms: tokenize(text),
    weight,
    facets,
  });

  const identityText = `${facility.title} — ${FACILITY_PHRASE[facility.facilityType]} serving ${facility.district}, ${facility.state}. Specialty focus: ${facility.category.replace("-", " ")}.`;

  const narrativeText = facility.summary;

  const locationText = `Located in ${facility.district} district of ${facility.state}, India (lat ${facility.lat.toFixed(2)}, lon ${facility.lon.toFixed(2)}). Catchment population ${formatPop(facility.affectedPopulation)}.`;

  const capacityText = `${formatBeds(facility.beds)} bed capacity with ${facility.specialists} resident specialists for ${facility.category.replace("-", " ")}.`;

  const gapText = `Gap signal: ${SEVERITY_PHRASE[facility.gapSeverity]} for ${facility.category.replace("-", " ")} across ${facility.district}. Estimated population at risk: ${formatPop(facility.affectedPopulation)}.`;

  const evidenceText = `Evidence: ${CONFIDENCE_PHRASE[facility.confidence]} (source: ${facility.source}).`;

  return [
    make("identity", identityText, 1.15),
    make("narrative", narrativeText, 1.0),
    make("location", locationText, 0.85),
    make("capacity", capacityText, 0.9),
    make("gap", gapText, 1.25),
    make("evidence", evidenceText, 0.7),
  ];
}

function formatBeds(beds: number) {
  if (beds === 0) {
    return "no inpatient";
  }
  return new Intl.NumberFormat("en-IN").format(beds);
}

function formatPop(pop: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(pop);
}
