import type { HealthcareFacility } from "@/lib/crisis/types";

export interface GeoJSONPointFeatureCollection {
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: {
      id: string;
      category: string;
      gapSeverity: string;
      confidence: string;
      weight: number;
      title: string;
      state: string;
      district: string;
      beds: number;
      specialists: number;
      facilityType: string;
      affectedPopulation: number;
    };
  }>;
  type: "FeatureCollection";
}

const severityWeight = (severity: HealthcareFacility["gapSeverity"]) => {
  switch (severity) {
    case "critical":
      return 1.0;
    case "severe":
      return 0.8;
    case "moderate":
      return 0.55;
    case "none":
      return 0.15;
    default:
      return 0.3;
  }
};

export const facilitiesToGeoJSON = (
  facilities: HealthcareFacility[]
): GeoJSONPointFeatureCollection => ({
  type: "FeatureCollection",
  features: facilities.map((facility) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [facility.lon, facility.lat] },
    properties: {
      id: facility.id,
      category: facility.category,
      gapSeverity: facility.gapSeverity,
      confidence: facility.confidence,
      weight: severityWeight(facility.gapSeverity),
      title: facility.title,
      state: facility.state,
      district: facility.district,
      beds: facility.beds,
      specialists: facility.specialists,
      facilityType: facility.facilityType,
      affectedPopulation: facility.affectedPopulation,
    },
  })),
});
