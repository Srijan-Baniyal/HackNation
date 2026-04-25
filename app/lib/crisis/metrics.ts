import type {
  CrisisIncident,
  CrisisMetrics,
  TrustSignal,
} from "@/app/lib/crisis/types";

export const computeMetrics = (incidents: CrisisIncident[]): CrisisMetrics => {
  const incidentCount = incidents.length;
  const affectedTotal = incidents.reduce(
    (total, incident) => total + incident.affectedEstimate,
    0
  );
  const criticalCount = incidents.filter(
    (incident) => incident.severity === "critical"
  ).length;

  const verifiedCount = incidents.filter(
    (incident) => incident.trust === "verified"
  ).length;
  const verifiedShare = incidentCount === 0 ? 0 : verifiedCount / incidentCount;

  const regionCounts = new Map<string, number>();
  const categoryCounts = new Map<CrisisIncident["category"], number>();
  const trustCounts = new Map<TrustSignal, number>();

  for (const incident of incidents) {
    regionCounts.set(
      incident.region,
      (regionCounts.get(incident.region) ?? 0) + 1
    );
    categoryCounts.set(
      incident.category,
      (categoryCounts.get(incident.category) ?? 0) + 1
    );
    trustCounts.set(incident.trust, (trustCounts.get(incident.trust) ?? 0) + 1);
  }

  const topRegions = [...regionCounts.entries()]
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const byCategory = [...categoryCounts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const byTrust = [...trustCounts.entries()]
    .map(([trust, count]) => ({ trust, count }))
    .sort((a, b) => b.count - a.count);

  return {
    incidentCount,
    affectedTotal,
    criticalCount,
    verifiedShare,
    topRegions,
    byCategory,
    byTrust,
  };
};
