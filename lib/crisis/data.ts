import { cacheLife, cacheTag } from "next/cache";
import { seedFacilities } from "@/lib/crisis/seed";
import type { DesertFilters, HealthcareFacility } from "@/lib/crisis/types";

const dayMs = 86_400_000;

const matchesText = (facility: HealthcareFacility, q: string) => {
  const needle = q.toLowerCase();
  return (
    facility.title.toLowerCase().includes(needle) ||
    facility.summary.toLowerCase().includes(needle) ||
    facility.state.toLowerCase().includes(needle) ||
    facility.district.toLowerCase().includes(needle) ||
    facility.source.toLowerCase().includes(needle) ||
    facility.category.toLowerCase().includes(needle)
  );
};

const withinDays = (facility: HealthcareFacility, sinceDays: number) => {
  const cutoff = Date.now() - sinceDays * dayMs;
  const time = Date.parse(facility.updatedAt);
  return Number.isFinite(time) && time >= cutoff;
};

// biome-ignore lint/suspicious/useAwait: use cache requires async
export async function listFacilities(): Promise<HealthcareFacility[]> {
  "use cache";
  cacheLife("max");
  cacheTag("facilities");
  return seedFacilities;
}

export async function filterFacilities(
  filters: DesertFilters
): Promise<HealthcareFacility[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("facilities");

  const facilities = await listFacilities();
  const hasCategory = Boolean(filters.category);
  const hasSeverity = Boolean(filters.severity);
  const hasConfidence = Boolean(filters.confidence);
  const hasState = Boolean(filters.state);
  const hasDistrict = Boolean(filters.district);
  const hasFacilityType = Boolean(filters.facilityType);
  const hasSinceDays = typeof filters.sinceDays === "number";
  const hasQ = Boolean(filters.q);

  return facilities.filter((facility) => {
    const matchesCategory =
      !hasCategory || facility.category === filters.category;
    const matchesSeverity =
      !hasSeverity || facility.gapSeverity === filters.severity;
    const matchesConfidence =
      !hasConfidence || facility.confidence === filters.confidence;
    const matchesState = !hasState || facility.state === filters.state;
    const matchesDistrict =
      !hasDistrict || facility.district === filters.district;
    const matchesFacilityType =
      !hasFacilityType || facility.facilityType === filters.facilityType;
    const matchesWindow =
      !hasSinceDays || withinDays(facility, filters.sinceDays as number);
    const matchesQuery = !hasQ || matchesText(facility, filters.q as string);

    return (
      matchesCategory &&
      matchesSeverity &&
      matchesConfidence &&
      matchesState &&
      matchesDistrict &&
      matchesFacilityType &&
      matchesWindow &&
      matchesQuery
    );
  });
}
