import type {
  DataConfidence,
  DesertMetrics,
  HealthcareFacility,
} from "@/lib/crisis/types";

export const computeMetrics = (
  facilities: HealthcareFacility[]
): DesertMetrics => {
  const facilityCount = facilities.length;
  const affectedTotal = facilities.reduce(
    (total, f) => total + f.affectedPopulation,
    0
  );
  const criticalDeserts = facilities.filter(
    (f) => f.gapSeverity === "critical"
  ).length;

  const verifiedCount = facilities.filter(
    (f) => f.confidence === "govt-verified"
  ).length;
  const verifiedShare = facilityCount === 0 ? 0 : verifiedCount / facilityCount;

  const stateCounts = new Map<string, number>();
  const categoryCounts = new Map<HealthcareFacility["category"], number>();
  const confidenceCounts = new Map<DataConfidence, number>();

  for (const facility of facilities) {
    stateCounts.set(facility.state, (stateCounts.get(facility.state) ?? 0) + 1);
    categoryCounts.set(
      facility.category,
      (categoryCounts.get(facility.category) ?? 0) + 1
    );
    confidenceCounts.set(
      facility.confidence,
      (confidenceCounts.get(facility.confidence) ?? 0) + 1
    );
  }

  const topStates = [...stateCounts.entries()]
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const byCategory = [...categoryCounts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const byConfidence = [...confidenceCounts.entries()]
    .map(([confidence, count]) => ({ confidence, count }))
    .sort((a, b) => b.count - a.count);

  return {
    facilityCount,
    affectedTotal,
    criticalDeserts,
    verifiedShare,
    topStates,
    byCategory,
    byConfidence,
  };
};
