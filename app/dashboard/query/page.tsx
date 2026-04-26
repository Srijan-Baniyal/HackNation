import { Suspense } from "react";
import { GraphRAGPanel } from "@/components/dashboard/graph-rag-panel";
import { FacilitiesTable } from "@/components/dashboard/incidents-table";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { NlqBar } from "@/components/dashboard/nlq-bar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { filterFacilities } from "@/lib/crisis/data";
import { computeMetrics } from "@/lib/crisis/metrics";
import { parseFiltersFromSearchParams } from "@/lib/crisis/query";

async function QueryResults({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const filters = parseFiltersFromSearchParams(resolvedSearchParams);
  const facilities = await filterFacilities(filters);
  const metrics = computeMetrics(facilities);

  return (
    <>
      <section className="grid gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Structured filters</Badge>
          <Badge variant="muted">Multi-attribute search</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Natural language query</CardTitle>
            <CardDescription>
              Type what you need. The system extracts structured filters across
              specialty, state, gap severity, and data confidence — rendering
              the same server-side view used by reports, map, and partners.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5">
            <NlqBar
              actionPath="/dashboard/query"
              defaultValue={filters.q ?? ""}
            />
          </CardContent>
        </Card>
      </section>

      <KpiStrip metrics={metrics} />

      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Facility feed</CardTitle>
          <CardDescription>
            Showing {facilities.length} facilities matched by the current query
            filters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FacilitiesTable facilities={facilities} />
        </CardContent>
      </Card>
    </>
  );
}

export default function DashboardQueryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="grid gap-6">
      {/* Graph RAG Section */}
      <section className="grid gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Graph RAG</Badge>
          <Badge variant="outline">Neo4j + Databricks</Badge>
        </div>
        <GraphRAGPanel />
      </section>

      <Separator />

      {/* Structured Filters Section — needs Suspense for searchParams */}
      <Suspense
        fallback={
          <div className="grid gap-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        }
      >
        <QueryResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
