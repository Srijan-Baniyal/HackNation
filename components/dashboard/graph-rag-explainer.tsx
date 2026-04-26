"use client";

import { Player } from "@remotion/player";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const STAGES = [
  { label: "PARSE", detail: "extract facets" },
  { label: "CHUNK", detail: "6 typed chunks / facility" },
  { label: "EMBED", detail: "BGE 1024-d / lexical" },
  { label: "RETRIEVE", detail: "BM25 + boost" },
  { label: "RERANK", detail: "MMR diversification" },
  { label: "GRAPH", detail: "Neo4j traversal" },
  { label: "COMPOSE", detail: "answer + reasoning" },
] as const;

function PipelineFrame() {
  const frame = useCurrentFrame();
  const { width, fps, durationInFrames } = useVideoConfig();

  const cycleProgress = (frame % durationInFrames) / durationInFrames;
  const activeIndex = Math.min(
    STAGES.length - 1,
    Math.floor(cycleProgress * STAGES.length)
  );

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(225,150,90,0.18), rgba(20,18,16,0.92))",
        color: "white",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      }}
    >
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          padding: 40,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            width: "100%",
          }}
        >
          <div
            style={{
              fontSize: 14,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            Graph RAG Pipeline
          </div>
          <div
            style={{
              fontSize: Math.min(56, width * 0.07),
              fontWeight: 700,
              letterSpacing: -1,
              textAlign: "center",
              lineHeight: 1.05,
              maxWidth: width * 0.85,
            }}
          >
            From plain question to evidence-grade answer
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: Math.max(8, width * 0.012),
              marginTop: 24,
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: width * 0.9,
            }}
          >
            {STAGES.map((stage, index) => {
              const stageStart = (index / STAGES.length) * durationInFrames;
              const animation = spring({
                frame: frame - stageStart,
                fps,
                config: { damping: 12, stiffness: 220, mass: 0.6 },
              });
              const isActive = index === activeIndex;
              const opacity = interpolate(animation, [0, 1], [0.35, 1]);
              const scale = interpolate(animation, [0, 1], [0.85, 1]);
              return (
                <div
                  key={stage.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${scale})`,
                      opacity,
                      padding: "10px 16px",
                      border: isActive
                        ? "1.5px solid rgba(255,210,140,0.95)"
                        : "1px solid rgba(255,255,255,0.18)",
                      background: isActive
                        ? "rgba(225,150,90,0.18)"
                        : "rgba(255,255,255,0.05)",
                      color: isActive
                        ? "rgba(255,220,170,1)"
                        : "rgba(255,255,255,0.92)",
                      fontSize: 13,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stage.label}
                  </div>
                  {index < STAGES.length - 1 ? (
                    <span
                      style={{
                        fontSize: 14,
                        opacity: interpolate(animation, [0, 1], [0.2, 0.55]),
                      }}
                    >
                      →
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 24,
              fontSize: 18,
              letterSpacing: 0.3,
              opacity: 0.86,
              textAlign: "center",
              minHeight: 28,
            }}
          >
            {STAGES[activeIndex].detail}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function GraphRAGExplainer() {
  return (
    <div className="relative aspect-16/7 w-full overflow-hidden border border-border bg-card sm:aspect-16/6">
      <Player
        autoPlay
        component={PipelineFrame}
        compositionHeight={540}
        compositionWidth={1280}
        controls={false}
        durationInFrames={210}
        fps={30}
        loop
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
