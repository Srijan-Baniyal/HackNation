import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardOverviewPage() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Operational</Badge>
              <Badge variant="muted">Seed data</Badge>
            </div>
            <CardTitle className="mt-3">
              Monitor incidents, verify trust, and coordinate response.
            </CardTitle>
            <CardDescription className="max-w-2xl">
              Use natural language to filter incident feeds, visualize hotspots
              on the crisis map, and export trust reports for governance and
              funding partners.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild className="rounded-full">
              <Link href="/dashboard/query">
                Run a query <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild className="rounded-full" variant="outline">
              <Link href="/dashboard/map">Open crisis map</Link>
            </Button>
            <Button asChild className="rounded-full" variant="secondary">
              <Link href="/dashboard/reports">Generate trust report</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Quick links</CardTitle>
            <CardDescription>Jump to the surface you need.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link
              className="rounded-xl border border-border/60 bg-card px-4 py-3 font-medium text-sm hover:bg-muted/30"
              href="/dashboard/map"
            >
              Crisis Map (Heatmap)
            </Link>
            <Link
              className="rounded-xl border border-border/60 bg-card px-4 py-3 font-medium text-sm hover:bg-muted/30"
              href="/dashboard/query"
            >
              Natural Language Query
            </Link>
            <Link
              className="rounded-xl border border-border/60 bg-card px-4 py-3 font-medium text-sm hover:bg-muted/30"
              href="/dashboard/reports"
            >
              Trust Reports (PDF/Excel)
            </Link>
            <Link
              className="rounded-xl border border-border/60 bg-card px-4 py-3 font-medium text-sm hover:bg-muted/30"
              href="/dashboard/api"
            >
              NGO API (REST)
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active incidents</CardDescription>
            <CardTitle>Seeded feed</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm leading-relaxed">
            This build ships with seeded incidents so the full UI works
            end-to-end. Next we’ll wire these same filters into a real API and
            live data pipeline.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Trust scoring</CardDescription>
            <CardTitle>Auditable</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm leading-relaxed">
            Exports include inputs, aggregations, and a traceable snapshot of
            the incident subset used for the report.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Integration</CardDescription>
            <CardTitle>NGO-ready</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm leading-relaxed">
            REST endpoints mirror the dashboard filters so partner systems can
            request the same views programmatically.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
