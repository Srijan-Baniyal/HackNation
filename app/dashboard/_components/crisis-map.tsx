"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useMemo, useRef } from "react";
import type { GeoJSONPointFeatureCollection } from "@/app/lib/crisis/geojson";

const defaultStyleUrl = "https://demotiles.maplibre.org/style.json";

export function CrisisMap({
  data,
  styleUrl = defaultStyleUrl,
}: {
  data: GeoJSONPointFeatureCollection;
  styleUrl?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const bounds = useMemo(() => {
    const coords = data.features.map((feature) => feature.geometry.coordinates);
    if (coords.length === 0) {
      return null;
    }
    let minLon = coords[0][0];
    let maxLon = coords[0][0];
    let minLat = coords[0][1];
    let maxLat = coords[0][1];
    for (const [lon, lat] of coords) {
      minLon = Math.min(minLon, lon);
      maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
    return { minLon, minLat, maxLon, maxLat };
  }, [data]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    if (mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [78.9629, 20.5937],
      zoom: 2,
      attributionControl: true,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));

    map.on("load", () => {
      map.addSource("incidents", {
        type: "geojson",
        data,
      });

      map.addLayer({
        id: "incidents-heat",
        type: "heatmap",
        source: "incidents",
        paint: {
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            0.7,
            7,
            1.6,
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 9, 7, 40],
          "heatmap-opacity": 0.85,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.2,
            "rgba(161, 95, 251, 0.35)",
            0.4,
            "rgba(130, 96, 255, 0.55)",
            0.6,
            "rgba(252, 192, 106, 0.7)",
            0.85,
            "rgba(235, 75, 90, 0.9)",
          ],
        },
      });

      map.addLayer({
        id: "incidents-points",
        type: "circle",
        source: "incidents",
        minzoom: 5,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 3, 10, 7],
          "circle-color": "rgba(17, 19, 32, 0.9)",
          "circle-stroke-color": "rgba(255,255,255,0.75)",
          "circle-stroke-width": 1,
          "circle-opacity": 0.85,
        },
      });

      if (bounds) {
        map.fitBounds(
          [
            [bounds.minLon, bounds.minLat],
            [bounds.maxLon, bounds.maxLat],
          ],
          { padding: 60, duration: 600 }
        );
      }
    });

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [bounds, data, styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const source = map.getSource("incidents") as
      | maplibregl.GeoJSONSource
      | undefined;
    source?.setData(data);
  }, [data]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/20">
      <div className="h-[560px] w-full" ref={containerRef} />
    </div>
  );
}
