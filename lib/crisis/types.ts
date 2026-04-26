export type GapSeverity = "none" | "moderate" | "severe" | "critical";

export type Specialty =
  | "oncology"
  | "dialysis"
  | "emergency-trauma"
  | "cardiology"
  | "maternity"
  | "pediatrics"
  | "mental-health"
  | "orthopedics"
  | "general";

export type DataConfidence =
  | "govt-verified"
  | "survey-reported"
  | "crowd-sourced"
  | "estimated";

export type FacilityType =
  | "tertiary-hospital"
  | "district-hospital"
  | "chc"
  | "phc"
  | "private-hospital"
  | "specialty-center";

export interface HealthcareFacility {
  affectedPopulation: number;
  beds: number;
  category: Specialty;
  confidence: DataConfidence;
  country: string;
  district: string;
  facilityType: FacilityType;
  gapSeverity: GapSeverity;
  id: string;
  lat: number;
  lon: number;
  occurredAt: string;
  source: string;
  specialists: number;
  state: string;
  summary: string;
  title: string;
  updatedAt: string;
}

export interface DesertFilters {
  category: Specialty | null;
  confidence: DataConfidence | null;
  district: string | null;
  facilityType: FacilityType | null;
  q: string | null;
  severity: GapSeverity | null;
  sinceDays: number | null;
  state: string | null;
}

export interface DesertMetrics {
  affectedTotal: number;
  byCategory: Array<{ category: Specialty; count: number }>;
  byConfidence: Array<{ confidence: DataConfidence; count: number }>;
  criticalDeserts: number;
  facilityCount: number;
  topStates: Array<{ state: string; count: number }>;
  verifiedShare: number;
}
