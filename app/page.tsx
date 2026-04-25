import Link from "next/link";
import { Suspense } from "react";
import FeatureGrid from "@/app/components/feature-grid";
import MetricsPanel from "@/app/components/metrics-panel";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="relative isolate flex flex-1 overflow-x-hidden">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:px-10 lg:px-12">
        <section className="rounded-[2rem] border border-white/20 bg-[radial-gradient(circle_at_15%_20%,rgba(252,192,106,0.55),transparent_42%),radial-gradient(circle_at_84%_26%,rgba(139,111,255,0.35),transparent_45%),linear-gradient(135deg,#111320,#1e1f37_45%,#111320)] p-8 shadow-[0_45px_90px_-50px_rgba(9,9,26,0.95)] sm:p-12">
          <p className="text-sm text-white/70 uppercase tracking-[0.3em]">
            Serving a Nation
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl text-white leading-tight sm:text-6xl">
            A crisis intelligence dashboard for faster, safer humanitarian
            response.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/85 leading-relaxed sm:text-lg">
            Explore live incident signals, heatmap hotspots, trust reporting,
            and NGO-ready APIs from a single, server-first interface.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              asChild
              className="rounded-full bg-white px-5 py-6 text-black"
            >
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button
              asChild
              className="rounded-full border border-white/30 bg-transparent px-5 py-6 text-white hover:bg-white/10"
              variant="outline"
            >
              <Link href="/dashboard/map">View crisis map</Link>
            </Button>
          </div>
        </section>

        <Suspense
          fallback={
            <section className="rounded-3xl border border-white/15 bg-white/5 p-6 text-sm text-white/75 backdrop-blur-sm">
              Preparing response snapshot...
            </section>
          }
        >
          <MetricsPanel />
        </Suspense>

        <section className="grid gap-6 rounded-[2rem] border border-black/10 bg-[#f5f3ef] p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-black/60 text-sm uppercase tracking-[0.22em]">
              Dashboard surfaces
            </p>
            <h2 className="mt-3 font-display text-3xl text-black sm:text-4xl">
              Natural-language filters, heatmap exploration, trust exports, and
              NGO integration.
            </h2>
          </div>
          <Suspense
            fallback={
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="h-36 animate-pulse rounded-3xl bg-black/5" />
                <div className="h-36 animate-pulse rounded-3xl bg-black/5" />
              </div>
            }
          >
            <FeatureGrid />
          </Suspense>
        </section>
      </main>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(255,176,107,0.2),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(130,96,255,0.18),transparent_26%),linear-gradient(180deg,#0b0d14_0%,#111527_48%,#0e1018_100%)]"
      />
    </div>
  );
}
