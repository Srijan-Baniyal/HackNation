import { ImageResponse } from "next/og";

const size = {
  width: 1200,
  height: 630,
} as const;

const title = "Healthcare Desert Intelligence";
const subtitle =
  "Graph RAG operations center for specialty gap detection, map-led response, and auditable health evidence exports.";

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
          "radial-gradient(circle at 84% 4%, #2d4f5f 0%, rgba(45,79,95,0) 38%), radial-gradient(circle at 14% 92%, #4f6f5a 0%, rgba(79,111,90,0) 36%), linear-gradient(130deg, #0b1117 0%, #101923 54%, #0e151f 100%)",
        color: "#e8eef5",
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
            "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          opacity: 0.12,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "0",
          display: "flex",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.5)",
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
              background: "#8ff0b8",
              boxShadow: "0 0 22px rgba(143,240,184,0.8)",
            }}
          />
          <div
            style={{
              display: "flex",
              padding: "10px 14px",
              border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(7,12,17,0.58)",
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
              color: "rgba(232,238,245,0.8)",
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
                color: "rgba(232,238,245,0.76)",
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
              border: "1px solid rgba(143,240,184,0.34)",
              background: "rgba(3,8,8,0.5)",
              color: "#8ff0b8",
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
