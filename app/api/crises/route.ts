import { NextResponse } from "next/server";
import { filterIncidents } from "@/app/lib/crisis/data";
import { computeMetrics } from "@/app/lib/crisis/metrics";
import { parseFiltersFromSearchParams } from "@/app/lib/crisis/query";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseFiltersFromSearchParams(
    Object.fromEntries(url.searchParams.entries())
  );
  const incidents = await filterIncidents(filters);
  const metrics = computeMetrics(incidents);

  return NextResponse.json(
    {
      filters,
      metrics,
      incidents,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}
