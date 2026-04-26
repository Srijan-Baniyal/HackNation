"use client";

import gsap from "gsap";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { GraphContext, GraphNode } from "@/lib/graph-rag/types";

interface GraphCanvasProps {
  context: GraphContext;
  /** When > 0, the edges animate in once this many ms after mount. */
  delayMs?: number;
}

interface PositionedNode extends GraphNode {
  ring: number;
  x: number;
  y: number;
}

const RING_FOR_LABEL: Record<string, number> = {
  Facility: 0,
  District: 1,
  Specialty: 2,
  State: 3,
};

const COLOR_FOR_LABEL: Record<string, string> = {
  Facility: "var(--color-primary)",
  District: "var(--color-chart-2)",
  Specialty: "var(--color-chart-1)",
  State: "var(--color-chart-5)",
};

const RADII = [0, 78, 138, 200];
const FACILITY_CLUSTER_RADIUS = 42;

/**
 * Polar layout — facilities cluster at the centre, districts on the
 * inner ring, specialties on the next, states on the outer one. We pick
 * angles deterministically per node id so the layout is stable across
 * renders.
 */
function layout(context: GraphContext, viewSize: number): PositionedNode[] {
  const cx = viewSize / 2;
  const cy = viewSize / 2;

  const buckets = new Map<number, GraphNode[]>();
  for (const node of context.nodes) {
    const ring = RING_FOR_LABEL[node.labels[0]] ?? 1;
    const arr = buckets.get(ring) ?? [];
    arr.push(node);
    buckets.set(ring, arr);
  }

  const out: PositionedNode[] = [];
  for (const [ring, nodes] of buckets.entries()) {
    const radius =
      ring === 0 && nodes.length > 1
        ? FACILITY_CLUSTER_RADIUS
        : (RADII[ring] ?? 200);
    nodes.forEach((node, index) => {
      if (ring === 0 && nodes.length === 1) {
        out.push({ ...node, x: cx, y: cy, ring });
        return;
      }
      const offset = ring * 0.4 + (ring === 0 ? Math.PI / 8 : 0);
      const theta = (index / nodes.length) * Math.PI * 2 + offset;
      out.push({
        ...node,
        x: cx + Math.cos(theta) * radius,
        y: cy + Math.sin(theta) * radius,
        ring,
      });
    });
  }
  return out;
}

export function GraphCanvas({ context, delayMs = 0 }: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const viewSize = 460;
  const positioned = useMemo(() => layout(context, viewSize), [context]);
  const edgeKeys = useMemo(() => {
    const counts = new Map<string, number>();
    return context.relationships.map((rel) => {
      const base = `${rel.startNodeId}->${rel.endNodeId}::${rel.type}`;
      const seen = counts.get(base) ?? 0;
      counts.set(base, seen + 1);
      return `${base}::${seen}`;
    });
  }, [context.relationships]);
  const nodeMap = useMemo(
    () => new Map(positioned.map((n) => [n.id, n])),
    [positioned]
  );
  const adjacency = useMemo(() => {
    const graph = new Map<string, Set<string>>();
    for (const rel of context.relationships) {
      const startSet = graph.get(rel.startNodeId) ?? new Set<string>();
      startSet.add(rel.endNodeId);
      graph.set(rel.startNodeId, startSet);
      const endSet = graph.get(rel.endNodeId) ?? new Set<string>();
      endSet.add(rel.startNodeId);
      graph.set(rel.endNodeId, endSet);
    }
    return graph;
  }, [context.relationships]);
  const center = viewSize / 2;

  // Animate the edges in with GSAP — strokeDashoffset effect for the
  // "lines drawing themselves" feel.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) {
      return;
    }
    const lines = svg.querySelectorAll<SVGLineElement>("line[data-edge]");
    if (lines.length === 0) {
      return;
    }
    const tween = gsap.fromTo(
      lines,
      { strokeDashoffset: 220, opacity: 0 },
      {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.7,
        delay: delayMs / 1000,
        stagger: 0.025,
        ease: "power2.out",
      }
    );
    return () => {
      tween.kill();
    };
  }, [delayMs]);

  if (context.nodes.length === 0) {
    return (
      <div className="grid h-48 place-items-center border border-border border-dashed bg-muted/10">
        <p className="text-muted-foreground text-xs">
          No graph context yet — run a query to see the knowledge graph.
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border/70 bg-linear-to-br from-muted/50 via-background to-background shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <svg
        aria-label="Graph context visualisation"
        className="h-full w-full"
        ref={svgRef}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
      >
        <title>Knowledge graph context</title>
        <defs>
          {Object.entries(COLOR_FOR_LABEL).map(([label, color]) => (
            <radialGradient
              cx="50%"
              cy="50%"
              id={`glow-${label}`}
              key={label}
              r="50%"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.55} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </radialGradient>
          ))}
        </defs>

        {/* Concentric ring guides */}
        {RADII.slice(1).map((r) => (
          <circle
            cx={viewSize / 2}
            cy={viewSize / 2}
            fill="none"
            key={r}
            opacity={0.25}
            r={r}
            stroke="var(--color-border)"
            strokeDasharray="2 4"
          />
        ))}

        {/* Edges */}
        {context.relationships.map((rel, relIndex) => {
          const start = nodeMap.get(rel.startNodeId);
          const end = nodeMap.get(rel.endNodeId);
          if (!(start && end)) {
            return null;
          }
          const isConnectedToHover =
            !hoveredNodeId ||
            rel.startNodeId === hoveredNodeId ||
            rel.endNodeId === hoveredNodeId ||
            adjacency.get(hoveredNodeId)?.has(rel.startNodeId) ||
            adjacency.get(hoveredNodeId)?.has(rel.endNodeId);
          const isDesert = rel.type === "DESERT_FOR";
          let edgeOpacity = 0.12;
          if (isConnectedToHover && isDesert) {
            edgeOpacity = 0.9;
          } else if (isConnectedToHover) {
            edgeOpacity = 0.5;
          } else if (isDesert) {
            edgeOpacity = 0.25;
          }
          return (
            <line
              data-edge
              key={edgeKeys[relIndex]}
              opacity={edgeOpacity}
              stroke={
                isDesert
                  ? "var(--color-destructive, #eb4b5a)"
                  : "var(--color-foreground)"
              }
              strokeDasharray={isDesert ? "0" : "4 4"}
              strokeWidth={isDesert ? 1.6 : 0.9}
              x1={start.x}
              x2={end.x}
              y1={start.y}
              y2={end.y}
            />
          );
        })}

        {/* Node halos */}
        {positioned.map((node) => {
          const isConnectedToHover =
            !hoveredNodeId ||
            node.id === hoveredNodeId ||
            adjacency.get(hoveredNodeId)?.has(node.id);
          return (
            <circle
              cx={node.x}
              cy={node.y}
              fill={`url(#glow-${node.labels[0]})`}
              key={`halo-${node.id}`}
              opacity={isConnectedToHover ? 1 : 0.22}
              r={node.ring === 0 ? 38 : 28}
            />
          );
        })}

        {/* Node circles */}
        {positioned.map((node, index) => {
          const color = COLOR_FOR_LABEL[node.labels[0]] ?? "var(--color-muted)";
          const radius = node.ring === 0 ? 12 : 7;
          const name = String(
            node.properties.title ?? node.properties.name ?? node.id
          );
          const isConnectedToHover =
            !hoveredNodeId ||
            node.id === hoveredNodeId ||
            adjacency.get(hoveredNodeId)?.has(node.id);
          const dx = node.x - center;
          const dy = node.y - center;
          const norm = Math.hypot(dx, dy) || 1;
          const labelOffset = node.ring === 0 ? 20 : 14;
          const labelX = node.x + (dx / norm) * labelOffset;
          const labelY = node.y + (dy / norm) * labelOffset + 3;
          const textAnchor = dx >= 0 ? "start" : "end";
          return (
            <motion.g
              animate={{ scale: 1, opacity: 1 }}
              initial={{ scale: 0, opacity: 0 }}
              key={node.id}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              transition={{
                delay: 0.1 + index * 0.025,
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1],
              }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                fill={color}
                opacity={isConnectedToHover ? 1 : 0.3}
                r={hoveredNodeId === node.id ? radius + 1.5 : radius}
                stroke="var(--color-background)"
                strokeWidth={1.5}
              />
              <text
                fill="var(--color-foreground)"
                fontSize={node.ring === 0 ? 10 : 8.5}
                opacity={isConnectedToHover ? 0.92 : 0.35}
                paintOrder="stroke"
                stroke="var(--color-background)"
                strokeWidth={2.25}
                textAnchor={textAnchor}
                x={labelX}
                y={labelY}
              >
                {name.length > 20 ? `${name.slice(0, 18)}…` : name}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute right-2 bottom-2 grid gap-1 rounded-md border border-border/70 bg-background/80 p-2 text-[10px] backdrop-blur sm:right-3 sm:bottom-3 sm:p-2.5">
        {Object.entries(COLOR_FOR_LABEL).map(([label, color]) => (
          <div className="flex items-center gap-2" key={label}>
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="uppercase tracking-[0.14em]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
