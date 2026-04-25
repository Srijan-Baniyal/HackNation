import { cache } from "react";

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

const wait = async (delay: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, delay);
  });

export const getStudioStats = cache(async (): Promise<Stat[]> => {
  await wait(120);

  return [
    {
      label: "Largest Contentful Paint",
      value: "1.1s",
      detail:
        "Optimized streaming shell keeps first meaningful paint near instant.",
    },
    {
      label: "Bundle Reduction",
      value: "-34%",
      detail: "RSC-first architecture ships less JavaScript by default.",
    },
    {
      label: "Accessibility",
      value: "99/100",
      detail: "Semantics-first components and contrast-safe palette by design.",
    },
  ];
});

export const getStudioFeatures = cache(async (): Promise<Feature[]> => {
  await wait(180);

  return [
    {
      title: "Server-first architecture",
      description:
        "Data, composition, and rendering stay on the server by default to minimize hydration costs.",
      badge: "RSC",
    },
    {
      title: "Streaming-friendly layout",
      description:
        "Suspense boundaries let the shell appear immediately while rich sections stream progressively.",
      badge: "PPR-ready",
    },
    {
      title: "Deliberate visual identity",
      description:
        "A distinctive editorial aesthetic gives the site character while preserving clarity and focus.",
      badge: "Design",
    },
    {
      title: "Quality guardrails",
      description:
        "Agent instructions, skill triggers, and linting standards are codified for consistent output quality.",
      badge: "Agentic",
    },
  ];
});
