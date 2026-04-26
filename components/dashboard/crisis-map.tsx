"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl, { type Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef } from "react";
import type { GeoJSONPointFeatureCollection } from "@/lib/crisis/geojson";

const defaultStyleUrl = "https://demotiles.maplibre.org/style.json";

/** India bounding box — restricts map panning to the subcontinent */
const INDIA_BOUNDS: maplibregl.LngLatBoundsLike = [
  [68.1, 6.5],
  [97.4, 37.1],
];

const INDIA_CENTER: [number, number] = [82.5, 22.5];

export function CrisisMap({
  data,
  styleUrl = defaultStyleUrl,
}: {
  data: GeoJSONPointFeatureCollection;
  styleUrl?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

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
      center: INDIA_CENTER,
      zoom: 4.2,
      maxBounds: INDIA_BOUNDS,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }));

    map.on("load", () => {
      map.addSource("facilities", {
        type: "geojson",
        data,
      });

      // Desert gap heatmap — higher weight = more critical desert
      map.addLayer({
        id: "desert-heat",
        type: "heatmap",
        source: "facilities",
        paint: {
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            3,
            0.7,
            8,
            1.6,
          ],
          "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 3, 15, 8, 45],
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

      // Facility points — visible on zoom
      map.addLayer({
        id: "facility-points",
        type: "circle",
        source: "facilities",
        minzoom: 5,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 5, 4, 10, 9],
          "circle-color": [
            "match",
            ["get", "gapSeverity"],
            "critical",
            "rgba(235, 75, 90, 0.9)",
            "severe",
            "rgba(252, 192, 106, 0.9)",
            "moderate",
            "rgba(130, 96, 255, 0.8)",
            "rgba(100, 200, 130, 0.7)",
          ],
          "circle-stroke-color": "rgba(255,255,255,0.75)",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.9,
        },
      });

      // Specialty labels on deep zoom
      map.addLayer({
        id: "facility-labels",
        type: "symbol",
        source: "facilities",
        minzoom: 7,
        layout: {
          "text-field": ["get", "title"],
          "text-size": 11,
          "text-offset": [0, 1.5],
          "text-anchor": "top",
          "text-max-width": 12,
        },
        paint: {
          "text-color": "rgba(255,255,255,0.85)",
          "text-halo-color": "rgba(0,0,0,0.6)",
          "text-halo-width": 1,
        },
      });

      // Popup on click
      map.on("click", "facility-points", (e) => {
        const feature = e.features?.[0];
        if (!feature || feature.geometry.type !== "Point") {
          return;
        }

        const props = feature.properties;
        const coordinates = feature.geometry.coordinates.slice() as [
          number,
          number,
        ];

        const severityColorMap: Record<string, string> = {
          critical: "#eb4b5a",
          severe: "#fcc06a",
          moderate: "#8260ff",
        };
        const gapColor =
          severityColorMap[String(props.gapSeverity)] ?? "#8260ff";

        const html = `
          <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace; font-size: 12px; max-width: 260px; line-height: 1.45; color: #111827;">
            <strong style="font-size: 13px;">${props.title}</strong>
            <br/><span style="opacity: 0.7;">${props.district}, ${props.state}</span>
            <hr style="border-color: #e5e7eb; margin: 6px 0;"/>
            <span>Specialty: <strong>${String(props.category).replace("-", " ")}</strong></span>
            <br/><span>Gap: <strong style="color: ${gapColor}">${props.gapSeverity}</strong></span>
            <br/><span>Beds: ${props.beds} · Specialists: ${props.specialists}</span>
            <br/><span>Pop. affected: ${new Intl.NumberFormat().format(Number(props.affectedPopulation))}</span>
          </div>
        `;

        new maplibregl.Popup({
          className: "crisis-map-popup",
          maxWidth: "280px",
        })
          .setLngLat(coordinates)
          .setHTML(html)
          .addTo(map);
      });

      map.on("mouseenter", "facility-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "facility-points", () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [data, styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }
    const source = map.getSource("facilities") as
      | maplibregl.GeoJSONSource
      | undefined;
    source?.setData(data);
  }, [data]);

  return (
    <div className="relative overflow-hidden border border-border/60 bg-muted/20">
      <style global jsx>{`
        .crisis-map-popup .maplibregl-popup-content {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 10px;
          box-shadow: 0 10px 28px rgba(2, 6, 23, 0.18);
          color: hsl(var(--foreground));
          padding: 12px;
        }

        .crisis-map-popup .maplibregl-popup-tip {
          border-top-color: hsl(var(--background));
        }

        .crisis-map-popup .maplibregl-popup-close-button {
          color: hsl(var(--muted-foreground));
          font-size: 18px;
          line-height: 1;
        }
      `}</style>
      <div className="h-[560px] w-full" ref={containerRef} />
      {/* Map legend */}
      <div className="absolute right-3 bottom-3 border border-border bg-background/90 p-3 backdrop-blur">
        <p className="mb-2 font-medium text-xs uppercase">Desert severity</p>
        <div className="grid gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-3 bg-[rgba(235,75,90,0.9)]" />
            Critical
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 bg-[rgba(252,192,106,0.9)]" />
            Severe
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 bg-[rgba(130,96,255,0.8)]" />
            Moderate
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 bg-[rgba(100,200,130,0.7)]" />
            None
          </div>
        </div>
      </div>
    </div>
  );
}
