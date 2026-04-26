import {
  ArrowRight,
  Broadcast,
  Database,
  FileText,
  MapPinArea,
  ShieldCheck,
  Siren,
} from "@phosphor-icons/react/dist/ssr";
import { cacheLife } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import FeatureGrid from "@/components/feature-grid";
import { AnimatedHero } from "@/components/home/animated-hero";
import { RevealSection } from "@/components/home/reveal-section";
import MetricsPanel from "@/components/metrics-panel";
import { SiteNavigation } from "@/components/site-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getHomeOperationsSnapshot } from "@/lib/site-data";

const number = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);

async function OperationsBrief() {
  "use cache";
  cacheLife("hours");

  const snapshot = await getHomeOperationsSnapshot();
  const topState = snapshot.metrics.topStates.at(0);
  const topCategory = snapshot.metrics.byCategory.at(0);

  return (
    <Card className="overflow-hidden border-border bg-card shadow-lg">
      <CardHeader className="border-b bg-muted/30 pb-4">
        <div className="flex items-center justify-between gap-3">
          <Badge variant="secondary">Live RSC snapshot</Badge>
          <span className="grid size-10 place-items-center border border-border bg-muted text-primary">
            <Broadcast aria-hidden="true" size={21} />
          </span>
        </div>
        <CardTitle className="font-display text-3xl leading-tight">
          National health intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-border bg-muted/30 p-4">
            <p className="text-muted-foreground text-xs uppercase">Top state</p>
            <p className="mt-3 font-display text-3xl">
              {topState?.state ?? "None"}
            </p>
            <p className="text-muted-foreground text-xs">
              {topState ? `${topState.count} facilities` : "No data"}
            </p>
          </div>
          <div className="border border-border bg-muted/30 p-4">
            <p className="text-muted-foreground text-xs uppercase">
              Lead specialty gap
            </p>
            <p className="mt-3 font-display text-3xl capitalize">
              {topCategory?.category?.replace("-", " ") ?? "None"}
            </p>
            <p className="text-muted-foreground text-xs">
              {topCategory ? `${topCategory.count} facilities` : "No data"}
            </p>
          </div>
        </div>

        <div className="relative min-h-48 overflow-hidden border border-border bg-muted/20">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(90deg,var(--border)_1px,transparent_1px),linear-gradient(180deg,var(--border)_1px,transparent_1px)] bg-size-[36px_36px] opacity-30"
          />
          <div className="status-pulse absolute top-7 left-[18%] size-3 bg-primary shadow-[0_0_0_8px_var(--accent)]" />
          <div className="status-pulse absolute top-[46%] right-[22%] size-3 bg-chart-2 shadow-[0_0_0_8px_var(--muted)] delay-2" />
          <div className="status-pulse absolute right-[34%] bottom-9 size-2 bg-chart-1 shadow-[0_0_0_7px_var(--muted)] delay-3" />
          <div className="relative flex h-full min-h-48 flex-col justify-end p-4">
            <p className="w-fit bg-background px-2 py-1 text-muted-foreground text-xs uppercase ring-1 ring-border">
              Desert concentration preview
            </p>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground text-xs uppercase">
            Latest facility signal
          </p>
          {snapshot.newestFacility ? (
            <div className="mt-3 grid gap-3">
              <p className="font-medium leading-tight">
                {snapshot.newestFacility.title}
              </p>
              <p className="text-muted-foreground text-sm">
                {snapshot.newestFacility.district},{" "}
                {snapshot.newestFacility.state} /{" "}
                {number(snapshot.newestFacility.affectedPopulation)} affected
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="capitalize" variant="secondary">
                  {snapshot.newestFacility.gapSeverity}
                </Badge>
                <Badge className="capitalize" variant="outline">
                  {snapshot.newestFacility.confidence.replace("-", " ")}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-muted-foreground text-sm">
              No facilities available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  return (
    <div className="relative isolate flex flex-1 overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-4 sm:gap-7 sm:px-8 sm:py-5 lg:px-10">
        <SiteNavigation />

        <RevealSection
          className="grid min-h-[calc(100svh-9rem)] gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.72fr)] lg:items-stretch lg:gap-7"
          index={0}
        >
          <div className="flex flex-col justify-between gap-7 border border-border bg-card p-5 sm:p-8 lg:p-10">
            <div className="grid gap-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Graph RAG intelligence</Badge>
                <Badge variant="outline">India healthcare</Badge>
              </div>

              <AnimatedHero
                eyebrow="Specialty desert detection"
                subhead="A hardened operations platform for healthcare desert detection, specialty gap mapping, evidence exports, and NGO coordination — powered by Graph RAG with Neo4j + Databricks vector search."
                title="Find the healthcare desert before it claims lives."
              />

              <div className="flex flex-wrap gap-3">
                <Button asChild className="h-11 px-5 sm:h-12">
                  <Link href="/dashboard">
                    Enter command center <ArrowRight aria-hidden={true} />
                  </Link>
                </Button>
                <Button asChild className="h-11 px-5 sm:h-12" variant="outline">
                  <Link href="/dashboard/map">
                    <MapPinArea aria-hidden={true} /> View desert map
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 border-border border-t pt-5 sm:grid-cols-3">
              {[
                ["Specialties", "Desert detection"],
                ["Evidence", "Govt-verified data"],
                ["Exports", "PDF and Excel"],
              ].map(([label, detail]) => (
                <div className="flex items-center gap-3" key={label}>
                  <span className="grid size-9 place-items-center border border-border bg-muted text-primary">
                    <Siren aria-hidden={true} size={18} />
                  </span>
                  <span>
                    <span className="block font-medium text-sm">{label}</span>
                    <span className="block text-muted-foreground text-xs">
                      {detail}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Suspense
            fallback={<Card className="min-h-[28rem] animate-pulse bg-muted" />}
          >
            <OperationsBrief />
          </Suspense>
        </RevealSection>

        <RevealSection index={1}>
          <Suspense
            fallback={
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-36 animate-pulse bg-muted sm:h-40" />
                <div className="h-36 animate-pulse bg-muted sm:h-40" />
                <div className="h-36 animate-pulse bg-muted sm:h-40" />
              </div>
            }
          >
            <MetricsPanel />
          </Suspense>
        </RevealSection>

        <RevealSection
          className="grid gap-6 border border-border bg-card p-5 sm:p-7"
          index={2}
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <p className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
                Dashboard surfaces
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
                One health dataset, four operational views.
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="grid size-11 place-items-center border border-border bg-muted text-primary sm:size-12">
                <Database aria-hidden={true} size={22} />
              </div>
              <div className="grid size-11 place-items-center border border-border bg-muted text-primary sm:size-12">
                <FileText aria-hidden={true} size={22} />
              </div>
              <div className="grid size-11 place-items-center border border-border bg-muted text-primary sm:size-12">
                <ShieldCheck aria-hidden={true} size={22} />
              </div>
            </div>
          </div>
          <Separator />
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-36 animate-pulse bg-muted sm:h-40" />
                <div className="h-36 animate-pulse bg-muted sm:h-40" />
              </div>
            }
          >
            <FeatureGrid />
          </Suspense>
        </RevealSection>
      </main>
      <div
        aria-hidden={true}
        className="grid-pattern pointer-events-none absolute inset-0 -z-10 opacity-15"
      />
    </div>
  );
}
