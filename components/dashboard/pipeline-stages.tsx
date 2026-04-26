"use client";

import {
  ArrowsClockwise,
  Brain,
  Database,
  Funnel,
  Lightning,
  Sparkle,
  TreeStructure,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import type { PipelineStage, PipelineStageName } from "@/lib/graph-rag/types";

const STAGE_ICONS: Record<
  PipelineStageName,
  ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>
> = {
  parse: Funnel,
  chunk: Sparkle,
  embed: Brain,
  retrieve: Database,
  rerank: ArrowsClockwise,
  graph: TreeStructure,
  compose: Lightning,
};

interface PipelineStagesProps {
  stages: PipelineStage[];
}

export function PipelineStages({ stages }: PipelineStagesProps) {
  if (stages.length === 0) {
    return null;
  }
  const totalMs = stages.reduce((acc, s) => acc + s.durationMs, 0);

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
          Pipeline trace
        </p>
        <Badge variant="muted">{totalMs}ms total</Badge>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stages.map((stage, index) => {
          const Icon = STAGE_ICONS[stage.name];
          const sharePct = totalMs > 0 ? (stage.durationMs / totalMs) * 100 : 0;
          return (
            <motion.li
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-col gap-2 border border-border bg-muted/20 p-3"
              initial={{ opacity: 0, y: 8 }}
              key={stage.name}
              transition={{
                delay: index * 0.06,
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center border border-border bg-background text-primary">
                  <Icon aria-hidden={true} size={15} />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-xs uppercase tracking-wider">
                    {stage.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {stage.durationMs}ms
                  </p>
                </div>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {stage.detail}
              </p>
              <div className="mt-1 grid gap-1.5">
                <div className="h-1 overflow-hidden bg-muted">
                  <motion.div
                    animate={{ width: `${Math.max(4, sharePct)}%` }}
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    transition={{
                      delay: 0.3 + index * 0.05,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                  />
                </div>
                {Object.keys(stage.meta).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(stage.meta).map(([key, value]) => (
                      <Badge
                        className="font-normal text-[10px] uppercase tracking-wider"
                        key={key}
                        variant="outline"
                      >
                        {key}: {String(value)}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
