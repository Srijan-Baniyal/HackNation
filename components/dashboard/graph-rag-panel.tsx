"use client";

import {
  ArrowRight,
  CircleNotch,
  Graph,
  Lightning,
  MagnifyingGlass,
  Terminal,
  TreeStructure,
} from "@phosphor-icons/react";
import { useActionState, useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  type GraphRAGActionResult,
  runGraphRAGQuery,
} from "@/lib/graph-rag/actions";

const initialState: GraphRAGActionResult = {
  data: null,
  error: null,
  mode: "local-fallback",
};

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

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Graph aria-hidden="true" className="text-primary" size={22} />
            <CardTitle>Graph RAG query</CardTitle>
          </div>
          <CardDescription>
            Ask about healthcare deserts across India. The system generates
            Cypher queries, runs vector similarity search, and traverses the
            knowledge graph for connected context with citations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={dispatch} className="flex gap-2">
            <Input
              aria-label="Healthcare desert query"
              className="flex-1"
              disabled={isPending}
              name="q"
              placeholder="e.g. Oncology deserts in Rajasthan or dialysis gaps in Bihar"
              type="text"
            />
            <Button disabled={isPending} type="submit">
              {isPending ? (
                <CircleNotch
                  aria-hidden="true"
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <MagnifyingGlass aria-hidden="true" size={18} />
              )}
              Search
            </Button>
            {state.data || state.error ? (
              <Button
                disabled={isPending}
                onClick={onClear}
                type="button"
                variant="outline"
              >
                Clear
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {state.error ? (
        <Card className="border-destructive/50">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">{state.error}</p>
          </CardContent>
        </Card>
      ) : null}

      {state.data ? (
        <>
          {/* Mode badge */}
          <div className="flex items-center gap-2">
            <Badge variant={state.mode === "graph-rag" ? "secondary" : "muted"}>
              <Lightning aria-hidden="true" size={14} />
              {state.mode === "graph-rag"
                ? "Neo4j + Databricks"
                : "Local fallback"}
            </Badge>
            <Badge variant="outline">
              Confidence: {(state.data.confidence * 100).toFixed(0)}%
            </Badge>
          </div>

          {/* Generated Cypher */}
          {state.data.generatedCypher ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Terminal
                    aria-hidden="true"
                    className="text-primary"
                    size={18}
                  />
                  <CardTitle className="text-base">Generated Cypher</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto border border-border bg-muted/30 p-4 font-mono text-xs leading-relaxed">
                  <code>{state.data.generatedCypher}</code>
                </pre>
              </CardContent>
            </Card>
          ) : null}

          {/* Answer */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Composed answer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground">
                {state.data.answer.split("\n").map((line, index) => {
                  const key = `${index}-${line.slice(0, 40)}-${line.length}`;
                  if (line.startsWith("**") && line.includes("**:")) {
                    const [label, ...rest] = line.split("**:");
                    const cleanLabel = label.replace(/\*\*/g, "");
                    return (
                      <p className="mt-2" key={key}>
                        <strong>{cleanLabel}:</strong>
                        {rest.join("**:")}
                      </p>
                    );
                  }
                  if (line.startsWith("> ")) {
                    return (
                      <blockquote
                        className="border-primary/30 border-l-2 pl-3 text-muted-foreground italic"
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
            </CardContent>
          </Card>

          {/* Vector Matches */}
          {state.data.vectorMatches.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MagnifyingGlass
                    aria-hidden="true"
                    className="text-primary"
                    size={18}
                  />
                  <CardTitle className="text-base">
                    Vector matches ({state.data.vectorMatches.length})
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3">
                {state.data.vectorMatches.map((match) => (
                  <div
                    className="flex items-start gap-3 border border-border bg-muted/20 p-3"
                    key={match.id}
                  >
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center bg-primary/10 font-bold text-primary text-xs">
                      {(match.score * 100).toFixed(0)}%
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm leading-tight">
                        {match.title}
                      </p>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {match.district}, {match.state}
                      </p>
                      <div className="mt-2 flex gap-1">
                        <Badge className="capitalize" variant="outline">
                          {match.category.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {/* Graph Context */}
          {state.data.graphContext.nodes.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TreeStructure
                    aria-hidden="true"
                    className="text-primary"
                    size={18}
                  />
                  <CardTitle className="text-base">
                    Graph context ({state.data.graphContext.nodes.length} nodes,{" "}
                    {state.data.graphContext.relationships.length} edges)
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {state.data.graphContext.nodes.slice(0, 12).map((node) => {
                    const label = node.labels[0] ?? "Node";
                    const name = String(
                      node.properties.title ?? node.properties.name ?? node.id
                    );
                    return (
                      <div
                        className="flex items-center gap-2 border border-border bg-muted/10 p-2 text-sm"
                        key={node.id}
                      >
                        <Badge
                          className="shrink-0 capitalize"
                          variant={badgeVariantForLabel(label)}
                        >
                          {label}
                        </Badge>
                        <span className="truncate">{name}</span>
                      </div>
                    );
                  })}
                </div>
                {state.data.graphContext.relationships.length > 0 ? (
                  <>
                    <Separator className="my-3" />
                    <div className="grid gap-1">
                      <p className="text-muted-foreground text-xs uppercase">
                        Relationships
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ...new Set(
                            state.data.graphContext.relationships.map(
                              (r) => r.type
                            )
                          ),
                        ].map((type) => {
                          const count =
                            state.data?.graphContext.relationships.filter(
                              (r) => r.type === type
                            ).length;
                          return (
                            <Badge key={type} variant="outline">
                              {type} <ArrowRight aria-hidden="true" size={12} />{" "}
                              ×{count}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
