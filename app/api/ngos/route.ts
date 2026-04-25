import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ngos = [
  {
    id: "ngo_001",
    name: "Relief Bridge Network",
    focus: ["health", "shelter"],
    region: "South Asia",
    contact: "ops@reliefbridge.example",
  },
  {
    id: "ngo_002",
    name: "Coastal Resilience Initiative",
    focus: ["water", "hygiene"],
    region: "East Africa",
    contact: "coord@coastalresilience.example",
  },
];

export function GET() {
  return NextResponse.json(
    {
      ngos,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}
