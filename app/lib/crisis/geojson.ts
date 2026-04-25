import type { CrisisIncident } from "@/app/lib/crisis/types";

export interface GeoJSONPointFeatureCollection {
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: {
      id: string;
      category: string;
      severity: string;
      trust: string;
      weight: number;
      title: string;
      country: string;
      region: string;
      occurredAt: string;
      affectedEstimate: number;
    };
  }>;
  type: "FeatureCollection";
}

const severityWeight = (severity: CrisisIncident["severity"]) => {
  switch (severity) {
    case "critical":
      return 1.0;
    case "high":
      return 0.8;
    case "medium":
      return 0.55;
    case "low":
      return 0.3;
    default:
      return 0.3;
  }
};

export const incidentsToGeoJSON = (
  incidents: CrisisIncident[]
): GeoJSONPointFeatureCollection => ({
  type: "FeatureCollection",
  features: incidents.map((incident) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [incident.lon, incident.lat] },
    properties: {
      id: incident.id,
      category: incident.category,
      severity: incident.severity,
      trust: incident.trust,
      weight: severityWeight(incident.severity),
      title: incident.title,
      country: incident.country,
      region: incident.region,
      occurredAt: incident.occurredAt,
      affectedEstimate: incident.affectedEstimate,
    },
  })),
});
