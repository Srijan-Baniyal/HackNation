import { IncidentsTable } from "@/app/dashboard/_components/incidents-table";
import { KpiStrip } from "@/app/dashboard/_components/kpi-strip";
import { NlqBar } from "@/app/dashboard/_components/nlq-bar";
import { filterIncidents } from "@/app/lib/crisis/data";
import { computeMetrics } from "@/app/lib/crisis/metrics";
import { parseFiltersFromSearchParams } from "@/app/lib/crisis/query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardQueryPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseFiltersFromSearchParams(searchParams);
  const incidents = await filterIncidents(filters);
  const metrics = computeMetrics(incidents);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Natural language query</CardTitle>
          <CardDescription>
            Type what you need. The system extracts structured filters and
            renders the same view you can request via the NGO API.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <NlqBar />
        </CardContent>
      </Card>

      <KpiStrip metrics={metrics} />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Incident feed</CardTitle>
          <CardDescription>
            Showing {incidents.length} incidents matched by the current query
            filters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <IncidentsTable incidents={incidents} />
        </CardContent>
      </Card>
    </div>
  );
}
