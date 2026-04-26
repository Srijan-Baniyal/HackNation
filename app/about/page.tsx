import {
  ArrowRight,
  BookOpen,
  BracketsCurly,
  ChartBar,
  GlobeHemisphereEast,
  Graph,
  Link as LinkIcon,
  MapPinArea,
  Shield,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { ArchitectureFlow } from "@/components/about/architecture-flow";
import { QueryFlow } from "@/components/about/query-flow";
import { RevealSection } from "@/components/home/reveal-section";
import { SiteNavigation } from "@/components/site-navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how Serving a Nation uses Graph RAG, Neo4j, and Databricks to map India's healthcare specialty deserts and power evidence-grade public health intelligence.",
  alternates: { canonical: "/about" },
};

const techStack = [
  {
    icon: Graph,
    name: "Neo4j",
    role: "Knowledge Graph",
    description:
      "Stores facilities, specialties, districts, and states as a property graph. Cypher queries traverse relationships to surface multi-hop specialty desert patterns that SQL cannot express.",
    badge: "Graph DB",
  },
  {
    icon: Sparkle,
    name: "Databricks",
    role: "Vector Search Index",
    description:
      "Embeds healthcare documents and facility narratives into dense vectors. Semantic similarity lookup lets operators find thematically adjacent gaps even without exact keyword matches.",
    badge: "ML Platform",
  },
  {
    icon: BracketsCurly,
    name: "Next.js 16",
    role: "React Server Components",
    description:
      "Data composition happens on the server — only map interactions and query inputs hydrate. Cache Components persist expensive graph queries across deployments.",
    badge: "RSC-first",
  },
  {
    icon: ChartBar,
    name: "Graph RAG",
    role: "Retrieval-Augmented Generation",
    description:
      "Fuses structured Cypher graph traversal with unstructured vector retrieval into a single ranked result set, adding provenance citations from both sources.",
    badge: "AI Pipeline",
  },
  {
    icon: MapPinArea,
    name: "MapLibre GL",
    role: "Geospatial Engine",
    description:
      "Renders live facility density heatmaps, desert boundaries, and state-level gap overlays with sub-second tile updates from the server data layer.",
    badge: "Maps",
  },
  {
    icon: Shield,
    name: "Evidence Exports",
    role: "PDF + Excel",
    description:
      "Generates auditable, timestamped evidence packages from active server filters — designed for NGO grant applications and government coordination submissions.",
    badge: "Reporting",
  },
] as const;

const agentEndpoints = [
  {
    path: "/.well-known/api-catalog",
    label: "API Catalog",
    description: "RFC 9727 linkset of all platform APIs",
    rel: "api-catalog",
  },
  {
    path: "/.well-known/agent-skills/index.json",
    label: "Agent Skills",
    description: "Skill discovery index for AI agents",
    rel: "describedby",
  },
  {
    path: "/.well-known/mcp/server-card.json",
    label: "MCP Server Card",
    description: "SEP-1649 server capability declaration",
    rel: "service-desc",
  },
  {
    path: "/.well-known/oauth-authorization-server",
    label: "OAuth Discovery",
    description: "RFC 8414 authorization server metadata",
    rel: "oauth",
  },
  {
    path: "/.well-known/oauth-protected-resource",
    label: "Protected Resource",
    description: "RFC 9728 resource authentication metadata",
    rel: "oauth",
  },
] as const;

export default function AboutPage() {
  const siteUrl = getSiteUrl();

  return (
    <div className="relative isolate flex flex-1 flex-col overflow-x-hidden bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-4 sm:px-8 sm:py-5 lg:px-10">
        <SiteNavigation />

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <RevealSection
          className="border border-border bg-card p-6 sm:p-10 lg:p-14"
          index={0}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Open intelligence</Badge>
            <Badge variant="outline">India healthcare</Badge>
          </div>

          <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[0.93] sm:text-6xl md:text-7xl">
            Built to find the desert before it claims lives.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-muted-foreground leading-7 sm:text-lg sm:leading-8">
            Serving a Nation is a Graph RAG operations platform that maps
            healthcare specialty deserts across India — where critical care is
            absent, under-resourced, or unreachable by population. It combines a
            Neo4j knowledge graph, Databricks vector search, and evidence-grade
            reporting into a unified intelligence layer for NGOs, researchers,
            and public health coordinators.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="h-11 px-5 sm:h-12">
              <Link href="/dashboard">
                Open dashboard <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild className="h-11 px-5 sm:h-12" variant="outline">
              <Link href="/dashboard/query">
                <BracketsCurly aria-hidden /> Try a query
              </Link>
            </Button>
          </div>
        </RevealSection>

        {/* ── Stats bar ─────────────────────────────────────────────── */}
        <RevealSection index={1}>
          <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
            {[
              ["15+", "Specialty types tracked"],
              ["28+", "States & UTs covered"],
              ["Neo4j + Databricks", "Dual retrieval engine"],
              ["RSC-first", "Server-composed UI"],
            ].map(([stat, label]) => (
              <div className="bg-card p-5 sm:p-6" key={label}>
                <p className="font-display text-3xl sm:text-4xl">{stat}</p>
                <p className="mt-2 text-muted-foreground text-xs uppercase tracking-wide">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </RevealSection>

        {/* ── Architecture diagram ───────────────────────────────────── */}
        <RevealSection className="grid gap-5" id="architecture" index={2}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
                System architecture
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
                From raw records to real-time intelligence.
              </h2>
            </div>
            <Badge className="hidden shrink-0 sm:flex" variant="outline">
              Drag to explore
            </Badge>
          </div>

          <ArchitectureFlow />

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
            <span className="flex items-center gap-2">
              <span className="inline-block h-px w-6 bg-primary opacity-70" />
              Core data path
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-px w-6 border-border border-t border-dashed" />
              Ingestion path
            </span>
          </div>
        </RevealSection>

        <Separator />

        {/* ── Query pipeline diagram ─────────────────────────────────── */}
        <RevealSection className="grid gap-5" id="query-pipeline" index={3}>
          <div>
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Query pipeline
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
              How a question becomes evidence.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground text-sm leading-relaxed">
              A plain-language question is parsed for entities and intent, split
              into a Cypher graph query and a semantic vector query, executed
              against Neo4j and Databricks in parallel, then fused into a
              ranked, cited evidence response.
            </p>
          </div>

          <QueryFlow />

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-xs">
            <span className="flex items-center gap-2">
              <span className="inline-block h-px w-6 bg-primary opacity-80" />
              Graph path (Neo4j)
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-px w-6 bg-chart-2 opacity-80" />
              Semantic path (Databricks)
            </span>
          </div>
        </RevealSection>

        <Separator />

        {/* ── Tech stack ────────────────────────────────────────────── */}
        <RevealSection className="grid gap-5" id="tech" index={4}>
          <div>
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Technology
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
              The stack behind the signal.
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {techStack.map((tech) => {
              const Icon = tech.icon;
              return (
                <Card
                  className="group transition-colors hover:bg-muted/30"
                  key={tech.name}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <span className="grid size-10 place-items-center border border-border bg-muted text-primary">
                        <Icon aria-hidden size={20} />
                      </span>
                      <Badge variant="outline">{tech.badge}</Badge>
                    </div>
                    <CardTitle className="mt-4">
                      {tech.name}
                      <span className="ml-2 font-normal text-muted-foreground text-sm">
                        {tech.role}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {tech.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </RevealSection>

        <Separator />

        {/* ── Agent-ready section ────────────────────────────────────── */}
        <RevealSection className="grid gap-5" id="agent-ready" index={5}>
          <div>
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Agent-ready
            </p>
            <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
              Built for machines too.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground text-sm leading-relaxed">
              The platform publishes structured discovery metadata so AI agents
              can find, understand, and authenticate with its APIs without
              manual configuration.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agentEndpoints.map((ep) => (
              <a
                className="group flex flex-col gap-2 border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                href={`${siteUrl}${ep.path}`}
                key={ep.path}
                rel="noopener noreferrer"
                target="_blank"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-8 place-items-center border border-border bg-muted text-primary">
                    <LinkIcon aria-hidden size={15} />
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                    size={14}
                  />
                </div>
                <p className="font-medium text-sm">{ep.label}</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {ep.description}
                </p>
                <code className="mt-1 truncate text-muted-foreground text-xs opacity-60">
                  {ep.path}
                </code>
              </a>
            ))}
          </div>
        </RevealSection>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <RevealSection
          className="flex flex-col items-start gap-5 border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          index={6}
        >
          <div className="max-w-xl">
            <div className="flex items-center gap-2">
              <GlobeHemisphereEast
                aria-hidden
                className="text-primary"
                size={20}
              />
              <span className="font-medium text-sm">
                Serving a Nation — Healthcare Desert Intelligence
              </span>
            </div>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Explore the live dashboard, run natural language queries against
              the Graph RAG engine, or view the geospatial desert map.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/dashboard">
                Open dashboard <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/map">
                <MapPinArea aria-hidden /> Desert map
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/query">
                <BookOpen aria-hidden /> Docs
              </Link>
            </Button>
          </div>
        </RevealSection>
      </main>

      <div
        aria-hidden
        className="grid-pattern pointer-events-none absolute inset-0 -z-10 opacity-15"
      />
    </div>
  );
}
