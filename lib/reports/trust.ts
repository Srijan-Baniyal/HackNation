import { cacheLife, cacheTag } from "next/cache";
import { filterFacilities } from "@/lib/crisis/data";
import { computeMetrics } from "@/lib/crisis/metrics";
import type { DesertFilters, HealthcareFacility } from "@/lib/crisis/types";

export interface PartnerRecord {
  contact: string;
  focus: string[];
  id: string;
  name: string;
  region: string;
}

export interface TrustReportSnapshot {
  facilities: HealthcareFacility[];
  generatedAt: string;
  metrics: ReturnType<typeof computeMetrics>;
  packageId: string;
  partnerRecords: PartnerRecord[];
}

const partnerRecords: PartnerRecord[] = [
  {
    id: "ngo_001",
    name: "Rural Health Mission Alliance",
    focus: ["oncology", "dialysis", "primary care"],
    region: "North India",
    contact: "ops@ruralhealthalliance.example",
  },
  {
    id: "ngo_002",
    name: "Tribal Healthcare Initiative",
    focus: ["emergency-trauma", "maternity", "pediatrics"],
    region: "Central & Northeast India",
    contact: "coord@tribalhealthcare.example",
  },
  {
    id: "ngo_003",
    name: "Mental Health Access Network",
    focus: ["mental-health", "counseling"],
    region: "Pan-India",
    contact: "outreach@mhanetwork.example",
  },
];

const toPackageId = (filters: DesertFilters) => {
  const basis = JSON.stringify(filters);
  let hash = 0;

  for (const char of basis) {
    hash = (hash * 31 + char.charCodeAt(0)) % 4_294_967_296;
  }

  return `SAN-${hash.toString(16).padStart(8, "0").toUpperCase()}`;
};

// biome-ignore lint/suspicious/useAwait: use cache requires async
export async function listPartnerRecords(): Promise<PartnerRecord[]> {
  "use cache";
  cacheLife("max");
  cacheTag("partners");
  return partnerRecords;
}

export async function getTrustReportSnapshot(
  filters: DesertFilters
): Promise<TrustReportSnapshot> {
  "use cache";
  cacheLife("hours");
  cacheTag("trust-report");

  const [facilities, partners] = await Promise.all([
    filterFacilities(filters),
    listPartnerRecords(),
  ]);
  const metrics = computeMetrics(facilities);
  const generatedAt = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return {
    generatedAt,
    facilities,
    metrics,
    packageId: toPackageId(filters),
    partnerRecords: partners,
  };
}
