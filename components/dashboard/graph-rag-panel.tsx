"use client";

import {
  ArrowRight,
  CircleNotch,
  Graph,
  Lightning,
  ListChecks,
  MagnifyingGlass,
  Path,
  Sparkle,
  Terminal,
  TreeStructure,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";
import { GraphCanvas } from "@/components/dashboard/graph-canvas";
import { GraphRAGExplainer } from "@/components/dashboard/graph-rag-explainer";
import { PipelineStages } from "@/components/dashboard/pipeline-stages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  type GraphRAGActionResult,
  runGraphRAGQuery,
} from "@/lib/graph-rag/actions";

const initialState: GraphRAGActionResult = {
  data: null,
  error: null,
  mode: "local-fallback",
};

const SUGGESTIONS = [
  "Oncology deserts in Rajasthan",
  "Critical dialysis gaps in Bihar",
  "Maternity coverage in Assam",
  "Rural mental health in Karnataka",
] as const;

// biome-ignore lint/suspicious/useAwait: useActionState requires async action
async function formAction(
  _prev: GraphRAGActionResult,
  formData: FormData
): Promise<GraphRAGActionResult> {
  return runGraphRAGQuery(formData);
}

function badgeVariantForLabel(label: string) {
  if (label === "Facility") {
    return "secondary" as const;
  }
  if (label === "District" || label === "State") {
    return "outline" as const;
  }
  if (label === "Specialty") {
    return "default" as const;
  }
  return "muted" as const;
}

function priorityVariant(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return "default" as const;
  }
  if (priority === "medium") {
    return "secondary" as const;
  }
  return "muted" as const;
}

function prioritySurfaceClass(priority: "high" | "medium" | "low") {
  if (priority === "high") {
    return "border-primary/35 bg-primary/8";
  }
  if (priority === "medium") {
    return "border-border bg-muted/20";
  }
  return "border-border/70 bg-background";
}

export function GraphRAGPanel() {
  const [resetKey, setResetKey] = useState(0);
  return (
    <GraphRAGPanelInner
      key={resetKey}
      onClear={() => setResetKey((k) => k + 1)}
    />
  );
}

function GraphRAGPanelInner({ onClear }: { onClear: () => void }) {
  const [state, dispatch, isPending] = useActionState(formAction, initialState);
  const [draftQuery, setDraftQuery] = useState("");

  return (
    <div className="grid gap-6">
      <Card className="border-border/70 bg-linear-to-b from-muted/35 to-background">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-md border border-border/70 bg-background/70 text-primary shadow-sm">
                <Graph aria-hidden={true} size={18} />
              </span>
              <div>
                <CardTitle>Graph RAG query</CardTitle>
                <CardDescription className="hidden sm:block">
                  Plain-language input → structured chunks → BM25 retrieval →
                  MMR rerank → graph traversal → cited answer.
                </CardDescription>
              </div>
            </div>
            <Badge
              className="hidden rounded-full sm:inline-flex"
              variant="muted"
            >
              <Sparkle aria-hidden={true} size={12} /> Hybrid retrieval
            </Badge>
          </div>
          <CardDescription className="sm:hidden">
            Plain-language input → typed chunks → BM25 retrieval → MMR rerank →
            graph traversal → cited answer.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form
            action={dispatch}
            className="flex flex-col gap-2 sm:flex-row sm:items-stretch"
          >
            <Input
              aria-label="Healthcare desert query"
              className="h-11 flex-1 rounded-lg border-border/70 bg-background/80 sm:h-10"
              disabled={isPending}
              name="q"
              onChange={(e) => setDraftQuery(e.target.value)}
              placeholder='Try "oncology deserts in Rajasthan"'
              type="text"
              value={draftQuery}
            />
            <div className="flex gap-2">
              <Button
                className="h-11 flex-1 rounded-lg sm:h-10 sm:flex-none"
                disabled={isPending}
                type="submit"
              >
                {isPending ? (
                  <CircleNotch
                    aria-hidden={true}
                    className="animate-spin"
                    size={16}
                  />
                ) : (
                  <MagnifyingGlass aria-hidden={true} size={16} />
                )}
                Search
              </Button>
              {state.data || state.error ? (
                <Button
                  className="h-11 rounded-lg sm:h-10"
                  disabled={isPending}
                  onClick={onClear}
                  type="button"
                  variant="outline"
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </form>

          <div className="flex flex-wrap gap-1.5">
            <span className="hidden text-muted-foreground text-xs uppercase tracking-wider sm:inline-flex sm:items-center">
              Try:
            </span>
            {SUGGESTIONS.map((suggestion) => (
              <button
                className="rounded-full border border-border/70 bg-muted/25 px-3 py-1 text-[11px] text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                key={suggestion}
                onClick={() => setDraftQuery(suggestion)}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {state.data || state.error ? null : (
        <Card className="border-border/70">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How the pipeline works</CardTitle>
            <CardDescription>
              A loop you can watch: parse → chunk → embed → retrieve → rerank →
              graph → compose.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GraphRAGExplainer />
          </CardContent>
        </Card>
      )}

      {state.error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{state.error}</p>
          </CardContent>
        </Card>
      ) : null}

      <AnimatePresence mode="wait">
        {state.data ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4"
            exit={{ opacity: 0, y: -8 }}
            initial={{ opacity: 0, y: 10 }}
            key={state.data.query + state.data.confidence}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <ResultHeader
              confidence={state.data.confidence}
              corpusSize={state.data.corpusSize}
              facets={state.data.facets}
              mode={state.mode}
              queryTerms={state.data.queryTerms}
            />

            <Card className="border-border/70">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pipeline trace</CardTitle>
                <CardDescription>
                  Server-side timing per stage. Tap a card to inspect what each
                  step did.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PipelineStages stages={state.data.stages} />
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
              <AnswerCard answer={state.data.answer} />
              <GraphContextCard context={state.data.graphContext} />
            </div>

            {state.data.reasoning.length > 0 ? (
              <ReasoningCard steps={state.data.reasoning} />
            ) : null}

            {state.data.recommendations.length > 0 ? (
              <RecommendationsCard items={state.data.recommendations} />
            ) : null}

            {state.data.generatedCypher ? (
              <CypherCard cypher={state.data.generatedCypher} />
            ) : null}

            <VectorMatchesCard
              matches={state.data.vectorMatches}
              terms={state.data.queryTerms}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface ResultHeaderProps {
  confidence: number;
  corpusSize: number;
  facets: Record<string, string | null>;
  mode: GraphRAGActionResult["mode"];
  queryTerms: string[];
}

function ResultHeader({
  mode,
  confidence,
  corpusSize,
  facets,
  queryTerms,
}: ResultHeaderProps) {
  const detectedFacets = Object.entries(facets).filter(([, value]) => value);

  return (
    <Card className="border-border/70 bg-linear-to-b from-muted/30 to-background">
      <CardContent className="grid gap-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className="rounded-full"
            variant={mode === "graph-rag" ? "secondary" : "muted"}
          >
            <Lightning aria-hidden={true} size={12} />
            {mode === "graph-rag" ? "Neo4j + Databricks" : "Local fallback"}
          </Badge>
          <Badge className="rounded-full" variant="outline">
            Confidence {(confidence * 100).toFixed(0)}%
          </Badge>
          <Badge className="rounded-full" variant="outline">
            {corpusSize} chunks indexed
          </Badge>
          <Badge className="rounded-full" variant="outline">
            {queryTerms.length} query term{queryTerms.length === 1 ? "" : "s"}
          </Badge>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${Math.max(8, Math.min(confidence * 100, 100))}%`,
            }}
          />
        </div>

        {detectedFacets.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              Detected facets:
            </span>
            {detectedFacets.map(([key, value]) => (
              <Badge className="rounded-full" key={key} variant="muted">
                {key}: {value}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AnswerCard({ answer }: { answer: string }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Path aria-hidden={true} className="text-primary" size={18} />
          <CardTitle className="text-base">Composed answer</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/70 bg-muted/15 p-4 sm:p-5">
          <div className="prose prose-sm max-w-none text-foreground">
            {answer.split("\n").map((line, index) => {
              const key = `${index}-${line.slice(0, 40)}-${line.length}`;
              if (line.startsWith("**") && line.includes("**:")) {
                const [label, ...rest] = line.split("**:");
                const cleanLabel = label.replace(/\*\*/g, "");
                return (
                  <p className="mt-2 text-sm leading-relaxed" key={key}>
                    <strong>{cleanLabel}:</strong>
                    {rest.join("**:")}
                  </p>
                );
              }
              if (line.startsWith("> ")) {
                return (
                  <blockquote
                    className="border-primary/40 border-l-2 pl-3 text-muted-foreground text-sm italic"
                    key={key}
                  >
                    {line.slice(2)}
                  </blockquote>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <p className="mt-1 pl-4 text-sm" key={key}>
                    • {line.slice(2)}
                  </p>
                );
              }
              if (line.trim() === "") {
                return <div className="h-2" key={key} />;
              }
              return (
                <p className="mt-1 text-sm" key={key}>
                  {line}
                </p>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GraphContextCard({
  context,
}: {
  context: { nodes: { id: string }[]; relationships: { type: string }[] };
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TreeStructure
            aria-hidden={true}
            className="text-primary"
            size={18}
          />
          <CardTitle className="text-base">
            Graph context ({context.nodes.length} nodes,{" "}
            {context.relationships.length} edges)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <GraphCanvas
          context={
            context as unknown as Parameters<typeof GraphCanvas>[0]["context"]
          }
          delayMs={150}
        />
        {context.relationships.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {[...new Set(context.relationships.map((r) => r.type))].map(
              (type) => {
                const count = context.relationships.filter(
                  (r) => r.type === type
                ).length;
                return (
                  <Badge className="rounded-full" key={type} variant="outline">
                    {type} <ArrowRight aria-hidden={true} size={11} /> ×{count}
                  </Badge>
                );
              }
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReasoningCard({
  steps,
}: {
  steps: { text: string; citationId?: string }[];
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ListChecks aria-hidden={true} className="text-primary" size={18} />
          <CardTitle className="text-base">How the agent reasoned</CardTitle>
        </div>
        <CardDescription>
          Each step is auditable — the agent points at the chunk or facility it
          relied on.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2.5">
          {steps.map((step, index) => (
            <motion.li
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3 rounded-lg border border-border/70 bg-muted/15 p-3.5"
              initial={{ opacity: 0, x: -8 }}
              key={`${step.text.slice(0, 48)}::${step.citationId ?? "no-cite"}`}
              transition={{
                delay: index * 0.07,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border bg-background font-medium text-[11px]">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm leading-relaxed">{step.text}</p>
                {step.citationId ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    cite: {step.citationId}
                  </p>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

function RecommendationsCard({
  items,
}: {
  items: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    facilityId?: string;
  }[];
}) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkle aria-hidden={true} className="text-primary" size={18} />
          <CardTitle className="text-base">Recommended next moves</CardTitle>
        </div>
        <CardDescription>
          Heuristic actions derived from the strongest desert signals.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={`grid gap-2 rounded-lg border p-4 ${prioritySurfaceClass(item.priority)}`}
            initial={{ opacity: 0, y: 8 }}
            key={item.title}
            transition={{
              delay: index * 0.08,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Badge
              className="w-fit rounded-full capitalize"
              variant={priorityVariant(item.priority)}
            >
              {item.priority} priority
            </Badge>
            <p className="font-medium text-sm leading-tight">{item.title}</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {item.description}
            </p>
            {item.facilityId ? (
              <p className="mt-auto pt-2 text-[10px] text-muted-foreground">
                ref: {item.facilityId}
              </p>
            ) : null}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}

function CypherCard({ cypher }: { cypher: string }) {
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Terminal aria-hidden={true} className="text-primary" size={18} />
          <CardTitle className="text-base">Generated Cypher</CardTitle>
        </div>
        <CardDescription>
          The query the agent would execute against the knowledge graph.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-lg border border-border/70 bg-muted/25 p-3 font-mono text-[11px] leading-relaxed sm:p-4 sm:text-xs">
          <code>{cypher}</code>
        </pre>
      </CardContent>
    </Card>
  );
}

function VectorMatchesCard({
  matches,
  terms,
}: {
  matches: {
    id: string;
    title: string;
    score: number;
    state: string;
    district: string;
    category: string;
    chunkKind?: string;
    scoreBreakdown?: { bm25: number; facetBoost: number; weight: number };
  }[];
  terms: string[];
}) {
  if (matches.length === 0) {
    return null;
  }
  return (
    <Card className="border-border/70">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <MagnifyingGlass
            aria-hidden={true}
            className="text-primary"
            size={18}
          />
          <CardTitle className="text-base">
            Top matches ({matches.length})
          </CardTitle>
        </div>
        <CardDescription>
          Each match cites the chunk that triggered it — narrative, gap signal,
          location, or capacity.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2.5">
        {matches.map((match, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-2 rounded-lg border border-border/70 bg-muted/20 p-3.5 sm:grid-cols-[auto_1fr_auto] sm:items-center"
            initial={{ opacity: 0, y: 6 }}
            key={match.id}
            transition={{
              delay: index * 0.05,
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-primary/10 font-bold text-primary text-xs">
              {(match.score * 100).toFixed(0)}%
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm leading-tight">{match.title}</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {match.district}, {match.state}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge className="rounded-full capitalize" variant="outline">
                  {match.category.replace("-", " ")}
                </Badge>
                {match.chunkKind ? (
                  <Badge className="rounded-full" variant="muted">
                    chunk · {match.chunkKind}
                  </Badge>
                ) : null}
                {match.scoreBreakdown ? (
                  <Badge className="rounded-full" variant="muted">
                    bm25 {match.scoreBreakdown.bm25.toFixed(2)} × boost{" "}
                    {match.scoreBreakdown.facetBoost.toFixed(2)}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="hidden text-right text-[10px] text-muted-foreground sm:block">
              <p>id</p>
              <p className="font-mono">{match.id}</p>
            </div>
          </motion.div>
        ))}
        {terms.length > 0 ? (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Searched terms (post-expansion): {terms.slice(0, 12).join(", ")}
            {terms.length > 12 ? "…" : ""}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function _badgeForLabel(label: string) {
  return badgeVariantForLabel(label);
}
