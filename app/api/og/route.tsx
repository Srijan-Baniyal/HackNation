import { ImageResponse } from "next/og";

const size = {
  width: 1200,
  height: 630,
} as const;

const title = "Healthcare Desert Intelligence";
const subtitle =
  "Graph RAG operations center for specialty gap detection, map-led response, and auditable health evidence exports.";
const palette = {
  background: "#2f3131",
  card: "#313434",
  border: "#505353",
  primary: "#d4905f",
  text: "#f2efe8",
  muted: "#cbc6b7",
  accent: "#3a3d3d",
} as const;

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "58px",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 88% 8%, rgba(212,144,95,0.22) 0%, rgba(212,144,95,0) 42%), radial-gradient(circle at 12% 92%, rgba(110,120,118,0.32) 0%, rgba(110,120,118,0) 44%), linear-gradient(145deg, #282b2b 0%, #2f3131 55%, #2a2c2c 100%)",
        color: palette.text,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          display: "flex",
          backgroundImage:
            "linear-gradient(rgba(242,239,232,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(242,239,232,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.18,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "0",
          display: "flex",
          border: `1px solid ${palette.border}`,
          boxShadow:
            "inset 0 0 0 1px rgba(0,0,0,0.35), inset 0 -80px 120px rgba(0,0,0,0.18)",
        }}
      />

      <div
        style={{
          zIndex: 1,
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "999px",
              background: palette.primary,
              boxShadow: "0 0 18px rgba(212,144,95,0.65)",
            }}
          />
          <div
            style={{
              display: "flex",
              padding: "10px 14px",
              border: `1px solid ${palette.border}`,
              background: "rgba(45,47,47,0.78)",
              letterSpacing: "0.11em",
              fontSize: "20px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            Graph RAG Command Center
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "860px",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: "82px",
              lineHeight: 1.03,
              letterSpacing: "-0.04em",
              fontWeight: 800,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "31px",
              lineHeight: 1.32,
              color: palette.muted,
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                fontSize: "21px",
                color: palette.muted,
                textTransform: "uppercase",
                letterSpacing: "0.09em",
              }}
            >
              India healthcare intelligence
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 600,
              }}
            >
              Neo4j + Databricks Vector Search
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 16px",
              border: `1px solid ${palette.border}`,
              background: palette.accent,
              color: palette.primary,
              fontSize: "20px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Live Signal
          </div>
        </div>
      </div>
    </div>,
    size
  );
}
