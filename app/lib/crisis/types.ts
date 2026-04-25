export type CrisisSeverity = "low" | "medium" | "high" | "critical";

export type CrisisCategory =
  | "flood"
  | "earthquake"
  | "conflict"
  | "wildfire"
  | "epidemic"
  | "storm"
  | "drought"
  | "landslide";

export type TrustSignal = "verified" | "reported" | "unverified" | "disputed";

export interface CrisisIncident {
  affectedEstimate: number;
  category: CrisisCategory;
  country: string;
  id: string;
  lat: number;
  lon: number;
  occurredAt: string;
  region: string;
  severity: CrisisSeverity;
  source: string;
  summary: string;
  title: string;
  trust: TrustSignal;
  updatedAt: string;
}

export interface CrisisFilters {
  category: CrisisCategory | null;
  country: string | null;
  q: string | null;
  region: string | null;
  severity: CrisisSeverity | null;
  sinceDays: number | null;
  trust: TrustSignal | null;
}

export interface CrisisMetrics {
  affectedTotal: number;
  byCategory: Array<{ category: CrisisCategory; count: number }>;
  byTrust: Array<{ trust: TrustSignal; count: number }>;
  criticalCount: number;
  incidentCount: number;
  topRegions: Array<{ region: string; count: number }>;
  verifiedShare: number;
}
