import {
  ArrowRightIcon,
  FileTextIcon,
  MapPinAreaIcon,
  PlugsConnectedIcon,
  TerminalWindowIcon,
} from "@phosphor-icons/react/dist/ssr";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { filterFacilities } from "@/lib/crisis/data";
import { computeMetrics } from "@/lib/crisis/metrics";
import type { DesertFilters } from "@/lib/crisis/types";

const allFilters: DesertFilters = {
  category: null,
  confidence: null,
  district: null,
  facilityType: null,
  q: null,
  severity: null,
  sinceDays: null,
  state: null,
};

const workspaceCards = [
  {
    href: "/dashboard/query",
    title: "Query the health graph",
    description:
      "Convert plain-language questions into Cypher + vector search. Identify specialty deserts with citations.",
    icon: TerminalWindowIcon,
  },
  {
    href: "/dashboard/map",
    title: "Read the desert map",
    description:
      "Inspect healthcare gap density and facility distribution across India with MapLibre.",
    icon: MapPinAreaIcon,
  },
  {
    href: "/dashboard/reports",
    title: "Package evidence",
    description:
      "Compose auditable server snapshots from the active healthcare dataset.",
    icon: FileTextIcon,
  },
] as const;

export default async function DashboardOverviewPage() {
  "use cache";
  cacheLife("hours");
  cacheTag("dashboard-overview");

  const facilities = await filterFacilities(allFilters);
  const metrics = computeMetrics(facilities);
  const newestFacility = facilities.toSorted(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  )[0];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Healthcare intelligence</Badge>
              <Badge variant="muted">Cache Components</Badge>
            </div>
            <CardTitle className="mt-4 max-w-3xl font-display text-4xl leading-tight">
              Identify specialty deserts, map gaps, coordinate response.
            </CardTitle>
            <CardDescription className="max-w-2xl">
              The overview is rendered from the same server data layer that
              powers query, map, reports, and partner integrations. Powered by
              Graph RAG with Neo4j + Databricks.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard/query">
                Run a query <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/map">Open desert map</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest signal</CardTitle>
            <CardDescription>
              Most recently updated facility in the healthcare dataset.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {newestFacility ? (
              <>
                <div>
                  <p className="font-medium leading-tight">
                    {newestFacility.title}
                  </p>
                  <p className="mt-2 text-muted-foreground text-sm">
                    {newestFacility.district}, {newestFacility.state}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="capitalize" variant="secondary">
                    {newestFacility.gapSeverity}
                  </Badge>
                  <Badge className="capitalize" variant="outline">
                    {newestFacility.confidence.replace("-", " ")}
                  </Badge>
                  <Badge className="capitalize" variant="muted">
                    {newestFacility.category.replace("-", " ")}
                  </Badge>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                No facilities are available.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <KpiStrip metrics={metrics} />

      <section className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Top states</CardTitle>
            <CardDescription>
              Highest facility concentration across the dataset.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {metrics.topStates.map((item) => (
              <div className="grid gap-2" key={item.state}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{item.state}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${Math.max(
                        10,
                        (item.count / metrics.facilityCount) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operational workspaces</CardTitle>
            <CardDescription>
              Every workspace reads from server-side filters and shared metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {workspaceCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  className="group border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40"
                  href={card.href}
                  key={card.href}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Icon
                      aria-hidden="true"
                      className="text-primary"
                      size={23}
                    />
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="text-muted-foreground transition-transform group-hover:translate-x-1"
                      size={17}
                    />
                  </div>
                  <Separator className="my-4" />
                  <p className="font-medium">{card.title}</p>
                  <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                    {card.description}
                  </p>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
