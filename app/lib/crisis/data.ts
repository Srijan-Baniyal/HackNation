import { cache } from "react";
import { seedIncidents } from "@/app/lib/crisis/seed";
import type { CrisisFilters, CrisisIncident } from "@/app/lib/crisis/types";

const dayMs = 86_400_000;

const matchesText = (incident: CrisisIncident, q: string) => {
  const needle = q.toLowerCase();
  return (
    incident.title.toLowerCase().includes(needle) ||
    incident.summary.toLowerCase().includes(needle) ||
    incident.region.toLowerCase().includes(needle) ||
    incident.country.toLowerCase().includes(needle) ||
    incident.source.toLowerCase().includes(needle)
  );
};

const withinDays = (incident: CrisisIncident, sinceDays: number) => {
  const cutoff = Date.now() - sinceDays * dayMs;
  const time = Date.parse(incident.occurredAt);
  return Number.isFinite(time) && time >= cutoff;
};

export const listIncidents = cache(
  async (): Promise<CrisisIncident[]> => seedIncidents
);

export const filterIncidents = cache(
  async (filters: CrisisFilters): Promise<CrisisIncident[]> => {
    const incidents = await listIncidents();
    const hasCategory = Boolean(filters.category);
    const hasSeverity = Boolean(filters.severity);
    const hasTrust = Boolean(filters.trust);
    const hasCountry = Boolean(filters.country);
    const hasRegion = Boolean(filters.region);
    const hasSinceDays = typeof filters.sinceDays === "number";
    const hasQ = Boolean(filters.q);

    return incidents.filter((incident) => {
      const matchesCategory =
        !hasCategory || incident.category === filters.category;
      const matchesSeverity =
        !hasSeverity || incident.severity === filters.severity;
      const matchesTrust = !hasTrust || incident.trust === filters.trust;
      const matchesCountry =
        !hasCountry || incident.country === filters.country;
      const matchesRegion = !hasRegion || incident.region === filters.region;
      const matchesWindow =
        !hasSinceDays || withinDays(incident, filters.sinceDays as number);
      const matchesQuery = !hasQ || matchesText(incident, filters.q as string);

      return (
        matchesCategory &&
        matchesSeverity &&
        matchesTrust &&
        matchesCountry &&
        matchesRegion &&
        matchesWindow &&
        matchesQuery
      );
    });
  }
);
