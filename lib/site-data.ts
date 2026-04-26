import { cacheLife, cacheTag } from "next/cache";
import { filterFacilities } from "@/lib/crisis/data";
import { computeMetrics } from "@/lib/crisis/metrics";
import type { DesertFilters, DesertMetrics } from "@/lib/crisis/types";

interface Stat {
  detail: string;
  label: string;
  value: string;
}

interface Feature {
  badge: string;
  description: string;
  title: string;
}

interface HomeOperationsSnapshot {
  metrics: DesertMetrics;
  newestFacility: {
    affectedPopulation: number;
    category: string;
    confidence: string;
    district: string;
    gapSeverity: string;
    state: string;
    title: string;
  } | null;
}

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

export async function getStudioStats(): Promise<Stat[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("studio-stats");

  const facilities = await filterFacilities(allFilters);
  const metrics = computeMetrics(facilities);

  return [
    {
      label: "Active Facilities",
      value: new Intl.NumberFormat(undefined).format(metrics.facilityCount),
      detail:
        "Server-rendered healthcare facility intelligence from the shared data layer.",
    },
    {
      label: "Population Affected",
      value: new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(metrics.affectedTotal),
      detail: "Aggregated in RSC before any dashboard JavaScript is shipped.",
    },
    {
      label: "Govt Verified",
      value: new Intl.NumberFormat(undefined, {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(metrics.verifiedShare),
      detail:
        "Data confidence scoring computed once and reused across server routes.",
    },
  ];
}

// biome-ignore lint/suspicious/useAwait: use cache requires async
export async function getStudioFeatures(): Promise<Feature[]> {
  "use cache";
  cacheLife("max");
  cacheTag("studio-features");

  return [
    {
      title: "Healthcare desert detection",
      description:
        "Graph RAG identifies specialty deserts by combining vector similarity search with knowledge graph traversal across India's healthcare facilities.",
      badge: "Graph RAG",
    },
    {
      title: "Natural-language intelligence",
      description:
        "Operators type intent in plain language, get auto-generated Cypher queries, multi-attribute filters, and citation-rich answers.",
      badge: "Query",
    },
    {
      title: "Evidence-grade reporting",
      description:
        "PDF and Excel exports use the same server-side filters and metrics that power the dashboard preview.",
      badge: "Reports",
    },
    {
      title: "NGO partner coordination",
      description:
        "Partner records covering oncology, trauma, and mental health surfaces mirror dashboard behavior without route handlers.",
      badge: "RSC",
    },
  ];
}

export async function getHomeOperationsSnapshot(): Promise<HomeOperationsSnapshot> {
  "use cache";
  cacheLife("hours");
  cacheTag("home-snapshot");

  const facilities = await filterFacilities(allFilters);
  const metrics = computeMetrics(facilities);
  const sorted = facilities.toSorted(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
  );
  const newest = sorted.at(0);

  return {
    metrics,
    newestFacility: newest
      ? {
          affectedPopulation: newest.affectedPopulation,
          category: newest.category,
          confidence: newest.confidence,
          district: newest.district,
          gapSeverity: newest.gapSeverity,
          state: newest.state,
          title: newest.title,
        }
      : null,
  };
}
