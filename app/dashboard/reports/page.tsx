import Link from "next/link";
import { IncidentsTable } from "@/app/dashboard/_components/incidents-table";
import { KpiStrip } from "@/app/dashboard/_components/kpi-strip";
import { NlqBar } from "@/app/dashboard/_components/nlq-bar";
import { filterIncidents } from "@/app/lib/crisis/data";
import { computeMetrics } from "@/app/lib/crisis/metrics";
import { parseFiltersFromSearchParams } from "@/app/lib/crisis/query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function DashboardReportsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseFiltersFromSearchParams(searchParams);
  const incidents = await filterIncidents(filters);
  const metrics = computeMetrics(incidents);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === null) {
      continue;
    }
    params.set(key, String(value));
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Trust reports</CardTitle>
          <CardDescription>
            Generate auditable snapshots from the same filtered dataset used by
            the map and query views.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <NlqBar />
          <Separator />
          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href={`/api/reports/trust?format=pdf&${params.toString()}`}>
                Download PDF
              </Link>
            </Button>
            <Button asChild className="rounded-full" variant="outline">
              <Link
                href={`/api/reports/trust?format=xlsx&${params.toString()}`}
              >
                Download Excel
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <KpiStrip metrics={metrics} />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            This preview shows the incident subset that will be exported.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncidentsTable incidents={incidents} />
        </CardContent>
      </Card>
    </div>
  );
}
