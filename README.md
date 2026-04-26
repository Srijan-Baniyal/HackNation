# Serving a Nation

A healthcare desert and specialty-gap intelligence platform for India. The application maps healthcare facility deserts, exposes critical shortage metrics, and enables natural-language queries over a graph-backed dataset — with an optional Graph RAG pipeline powered by Neo4j and Databricks.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages and Routes](#pages-and-routes)
- [Key Components](#key-components)
- [Data Architecture](#data-architecture)
- [Graph RAG Pipeline](#graph-rag-pipeline)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Development Scripts](#development-scripts)
- [Quality Tooling](#quality-tooling)
- [Agent and Skill Setup](#agent-and-skill-setup)
- [Discovery and MCP APIs](#discovery-and-mcp-apis)
- [Deployment](#deployment)

---

## Overview

**Serving a Nation** is a React Server Component–first dashboard and marketing site that visualises India's healthcare access gap. It ships with:

- A seeded in-memory dataset of healthcare facilities for consistent, fast rendering.
- An optional live path through Neo4j (graph store) and Databricks (vector search + embeddings) for Graph RAG queries.
- A MapLibre map of healthcare deserts and facility coverage.
- Natural-language query (NLQ) UI with structured filters over the facility dataset.
- A discovery layer (`/.well-known/*` endpoints) that exposes the app's API catalog and agent tools to external clients and AI agents.

---

## Features

| Area | Details |
|---|---|
| Landing page | Animated hero, real-time metrics panel, feature grid, contextual navigation to the dashboard |
| Dashboard overview | KPI strip with shortage indicators, workspace cards for quick navigation |
| Interactive map | MapLibre GL map overlaying facility locations, coverage gaps, and crisis zones |
| NLQ interface | Natural-language query bar with structured filters; renders facility results in a table |
| Graph RAG panel | Server-driven pipeline stage viewer and graph canvas; falls back to local data when Neo4j / Databricks are not configured |
| Architecture explorer | `/about` page with interactive flow diagrams of the query pipeline and system architecture |
| OG images | Dynamic Open Graph cards via `@vercel/og` |
| Agent / MCP discovery | `/.well-known/` endpoints exposing the API catalog, MCP server card, agent skills, and OAuth metadata stubs |
| In-browser MCP | `WebMCP` component registers navigation tools when `navigator.modelContext` is present |
| Dark / light mode | System-aware theme via `next-themes` |

---

## Tech Stack

| Category | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Package Manager | Bun |
| Styling | Tailwind CSS 4 via PostCSS |
| Component Primitives | shadcn (`components.json`, Radix-style) |
| Icons | Phosphor Icons, Lucide |
| Maps | MapLibre GL |
| Charts | Recharts |
| Flow / Diagrams | @xyflow/react |
| Motion | Motion (Framer successor), GSAP |
| Video (explainer) | Remotion (`@remotion/player`) |
| PDF / Export | `@react-pdf/renderer`, `xlsx` |
| Graph database | Neo4j (via `neo4j-driver`) |
| Vector search | Databricks (HTTP API) |
| OG images | `@vercel/og` |
| Theme | `next-themes` |
| Type checking | TypeScript 6 |
| Linting / formatting | Biome + Ultracite |
| React compiler | `babel-plugin-react-compiler` (enabled in `next.config.ts`) |

---

## Project Structure

```
san/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout (theme provider, navigation, footer)
│   ├── globals.css             # Global CSS custom properties and base styles
│   ├── scrollbar.css           # Scrollbar overrides
│   ├── sitemap.ts              # Programmatic sitemap
│   ├── about/
│   │   └── page.tsx            # Architecture explainer
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard shell (sidebar, header, theme toggle)
│   │   ├── page.tsx            # Dashboard overview (KPI strip, workspace cards)
│   │   ├── map/
│   │   │   └── page.tsx        # Interactive MapLibre map
│   │   └── query/
│   │       └── page.tsx        # NLQ bar, filters, facility table, Graph RAG panel
│   └── api/
│       ├── og/route.tsx        # Dynamic OG image generation
│       ├── home-md/route.ts    # Markdown representation of the landing page
│       └── discovery/
│           ├── api-catalog/    # Lists available API endpoints
│           ├── agent-skills/   # Declares agent-callable skills
│           ├── mcp-server-card/
│           ├── oauth-authorization-server/
│           └── oauth-protected-resource/
├── components/
│   ├── site-navigation.tsx     # Top navigation bar
│   ├── metrics-panel.tsx       # Homepage stats panel
│   ├── feature-grid.tsx        # Feature highlight grid
│   ├── theme-toggle.tsx        # Light / dark toggle
│   ├── web-mcp.tsx             # In-browser MCP tool registration
│   ├── home/
│   │   ├── animated-hero.tsx   # Landing hero with motion
│   │   └── reveal-section.tsx  # Scroll-reveal wrapper
│   ├── about/
│   │   ├── architecture-flow.tsx
│   │   └── query-flow.tsx
│   ├── dashboard/
│   │   ├── crisis-map.tsx      # MapLibre map component
│   │   ├── graph-canvas.tsx    # Graph visualisation canvas
│   │   ├── graph-rag-explainer.tsx  # Remotion-powered RAG explainer
│   │   ├── graph-rag-panel.tsx # Server-driven RAG result panel
│   │   ├── incidents-table.tsx # Facility results table
│   │   ├── kpi-strip.tsx       # KPI metrics row
│   │   ├── nlq-bar.tsx         # Natural-language query bar (client)
│   │   └── pipeline-stages.tsx # Graph RAG pipeline visualisation
│   └── ui/                     # shadcn primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── navigation-menu.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── table.tsx
│       └── tooltip.tsx
├── lib/
│   ├── crisis/
│   │   ├── data.ts             # Cached RSC data layer (wraps seed data)
│   │   └── seed.ts             # In-memory seeded facility dataset
│   ├── graph-rag/
│   │   ├── actions.ts          # Server action: Graph RAG or local fallback
│   │   ├── databricks.ts       # Databricks vector search client
│   │   ├── neo4j.ts            # Neo4j driver and session helpers
│   │   └── seed.ts             # One-off graph seeding script
│   ├── metrics.ts              # Site-wide metrics helpers
│   ├── reports-trust.ts        # Report data helpers
│   └── site-url.ts             # Canonical URL resolution
├── Provider/
│   └── ThemeProvider.tsx       # next-themes wrapper
├── hooks/
│   └── use-mobile.ts           # Responsive breakpoint hook
├── public/
│   ├── robots.txt
│   └── sitemap.xml
├── proxy.ts                    # Accept: text/markdown → /api/home-md proxy helper
├── next.config.ts              # Next.js config (React compiler, rewrites, headers)
├── postcss.config.mjs          # Tailwind v4 PostCSS plugin
├── biome.json                  # Biome linter / formatter config
├── tsconfig.json               # TypeScript config (@/* path alias)
├── components.json             # shadcn config
├── AGENTS.md                   # Agent quality contract and skill routing rules
└── skills-lock.json            # Pinned agent skill metadata
```

---

## Pages and Routes

### `/` — Landing

The marketing landing page. Renders an `AnimatedHero` with motion, an `OperationsBrief` (cached RSC snapshot of seeded data), a `MetricsPanel` with national shortage stats, and a `FeatureGrid` highlighting dashboard capabilities.

### `/about` — Architecture Explainer

An interactive explainer of the platform's architecture. Includes `ArchitectureFlow` and `QueryFlow` diagrams built with `@xyflow/react`, showing how user queries move through the NLQ → Graph RAG → Neo4j + Databricks → response pipeline.

### `/dashboard` — Overview

The dashboard home with a `KpiStrip` of critical shortage indicators and workspace cards linking to the map and query tools.

### `/dashboard/query` — NLQ Query

A `NlqBar` (client component) accepts natural-language input and structured filters. Results are rendered in an `IncidentsTable` (facility list). The `GraphRAGPanel` server component runs the Graph RAG action and displays pipeline stages and a graph canvas.

### `/dashboard/map` — Interactive Map

A full-viewport `CrisisMap` built on MapLibre GL. Plots facility locations and healthcare desert polygons from the filtered crisis dataset.

### `/api/og` — Open Graph Images

Dynamic OG image generation with `@vercel/og`. Produces branded cards for social sharing.

### `/api/home-md` — Markdown Landing

Returns a Markdown representation of the landing page. Consumed by the `proxy.ts` helper for clients that send `Accept: text/markdown`.

### `/.well-known/*` — Discovery

Rewritten by `next.config.ts` to `app/api/discovery/*`:

| Path | Purpose |
|---|---|
| `/.well-known/api-catalog` | Lists available API endpoints |
| `/.well-known/agent-skills` | Declares callable agent skills |
| `/.well-known/mcp-server-card` | MCP server metadata |
| `/.well-known/oauth-authorization-server` | OAuth metadata stub |
| `/.well-known/oauth-protected-resource` | OAuth resource stub |

---

## Key Components

### `components/web-mcp.tsx`

Registers in-browser MCP tools (navigation, page context) on `navigator.modelContext` when present. Enables external AI agents to control and navigate the app without a dedicated server.

### `components/dashboard/graph-rag-panel.tsx`

Server component that invokes the `executeGraphRAGAction` server action, then renders `PipelineStages` (showing each pipeline step's status and timing) and `GraphCanvas` (a live node-edge visualisation of the graph result).

### `components/dashboard/crisis-map.tsx`

Client component wrapping MapLibre GL. Accepts GeoJSON facility features and renders them as interactive map markers, with popup details on click.

### `components/dashboard/nlq-bar.tsx`

Client component with a command-style input for natural-language queries. Manages structured filter state (state, district, speciality, capacity) alongside the freeform query.

### `components/home/animated-hero.tsx`

Motion-driven hero section. Uses `motion` for enter animations and GSAP for scroll-linked effects.

---

## Data Architecture

Most UI in the dashboard and landing page is backed by **seeded in-memory data** in `lib/crisis/seed.ts`. This is fetched through `lib/crisis/data.ts` which uses Next.js `use cache` and `cacheTag` for RSC-level caching — meaning facility lists and metrics are derived from a stable seed, not per-request database reads.

This design makes the app fully functional without live database credentials and keeps renders fast.

```
UI (RSC)
  └── lib/crisis/data.ts    ← cached accessor
        └── lib/crisis/seed.ts  ← seeded facility objects
```

For Graph RAG queries specifically, the server action in `lib/graph-rag/actions.ts` runs a **health check** against Neo4j and Databricks at invocation time. If both pass, it runs the full pipeline. If either is unavailable, it falls back to a `executeLocalFallback` that returns equivalent responses from the seed data.

---

## Graph RAG Pipeline

The Graph RAG path is the core ML-backed feature. When Neo4j and Databricks are configured and healthy:

1. **Embed query** — the user's natural-language query is sent to a Databricks embedding endpoint.
2. **Vector search** — the embedding is used to retrieve semantically similar nodes from the Databricks vector search index.
3. **Graph traversal** — Neo4j is queried for neighbourhood context around the retrieved nodes.
4. **Response generation** — the graph context and vector results are composed into a structured response.
5. **Pipeline stages** — each stage's timing and status is surfaced in the `PipelineStages` component.

When Neo4j or Databricks is unavailable, `executeLocalFallback` uses the seeded data to construct a consistent response so the UI never breaks.

The graph can be seeded from scratch using `lib/graph-rag/seed.ts` (run once).

---

## Environment Variables

Create a `.env` file at the project root. None of these are required for the app to run — the local fallback handles unavailable services gracefully.

```bash
# Neo4j (Graph RAG live path)
NEO4J_URI=neo4j+s://<your-instance>.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=<your-password>

# Databricks (vector search + embeddings)
DATABRICKS_HOST=https://<your-workspace>.azuredatabricks.net
DATABRICKS_TOKEN=<your-personal-access-token>
DATABRICKS_VS_ENDPOINT=<serving-endpoint-name>       # defaults to san-vector-search
DATABRICKS_VS_INDEX=<catalog.schema.index-name>      # e.g. workspace.default.san_healthcare_deserts

# Canonical site URL (optional — auto-detected on Vercel)
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

`NEXT_PUBLIC_SITE_URL` is resolved in `lib/site-url.ts` using this priority order:
1. `NEXT_PUBLIC_SITE_URL`
2. `VERCEL_PROJECT_PRODUCTION_URL`
3. `VERCEL_URL`
4. A hardcoded default

> **Important:** Never commit `.env` to version control. If secrets have been exposed, rotate your Neo4j and Databricks credentials immediately.

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) >= 1.0
- Node.js >= 20 (used by Next.js internals)

### Install and run

```bash
# Install dependencies
bun install

# Start the development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs fully without any environment variables — all dashboard views, the map, and the landing page use seeded data. To enable the live Graph RAG path, add the Neo4j and Databricks variables to `.env`.

### Seed the graph (optional)

If you have Neo4j and Databricks configured and want to populate the graph store:

```bash
bun run lib/graph-rag/seed.ts
```

This is a one-off operation. After seeding, the live Graph RAG path will use the populated data.

---

## Development Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Start the dev server with HMR |
| `build` | `next build` | Production build |
| `start` | `next start` | Run the production build locally |
| `lint` | `biome check` | Lint the codebase |
| `format` | `biome format --write` | Format all files |
| `check` | `ultracite check` | Full quality check (lint + types) |
| `fix` | `ultracite fix` | Auto-fix lint and formatting issues |

---

## Quality Tooling

This project uses [Ultracite](https://github.com/haydenbleasel/ultracite) on top of [Biome](https://biomejs.dev) for formatting and linting. The config lives in `biome.json` and extends `ultracite/biome/core` and `ultracite/biome/next`.

**Check for issues:**

```bash
bun x ultracite check
```

**Auto-fix formatting and lint violations:**

```bash
bun x ultracite fix
```

Run `bun x ultracite check` before every merge. Most formatting issues are fixed automatically by `ultracite fix`.

The React Compiler (`babel-plugin-react-compiler`) is enabled in `next.config.ts` with `cacheComponents: true`, providing automatic memoisation across the component tree.

---

## Agent and Skill Setup

Agent behaviour is defined in `AGENTS.md`. Skills are installed under `.agents/skills/` and `.claude/skills/`.

### Active skills

| Skill | Purpose |
|---|---|
| `vercel-react-best-practices` | RSC-first performance and React/Next implementation guardrails |
| `frontend-design` | Distinctive UI/UX and production-grade visual quality |
| `vercel-react-view-transitions` | Native-feeling route and element transitions via the View Transition API |
| `find-skills` | Discover additional capabilities when needed |

### Architecture rules for agents

- Keep components as **Server Components by default**.
- Add `'use client'` only for interactive islands (map, NLQ bar, theme toggle, motion).
- Prefer `Suspense` streaming over blocking full-page renders.
- Follow semantic HTML and ARIA accessibility best practices.
- Validate all changes with `bun x ultracite check` before finishing a task.
- Consult `node_modules/next/dist/docs/` for current Next.js API behaviour — this version may differ from training data.

---

## Discovery and MCP APIs

The app exposes a discovery layer at `/.well-known/*` for external AI agents and MCP-compatible clients. These routes are rewritten in `next.config.ts` and defined under `app/api/discovery/`.

The `components/web-mcp.tsx` component registers in-browser navigation tools on `navigator.modelContext` when a compatible AI agent is running alongside the browser, enabling agents to navigate pages programmatically.

The `proxy.ts` module exports a helper that rewrites requests with `Accept: text/markdown` to `/api/home-md`, serving a Markdown representation of the landing page. Wire it into `middleware.ts` to activate it.

---

## Deployment

The app is designed to deploy on **Vercel** (or any Node host running `next start`). No `vercel.json` configuration is required.

For production:

```bash
bun run build
bun run start
```

Set the environment variables listed in [Environment Variables](#environment-variables) in your deployment environment. `NEXT_PUBLIC_SITE_URL` is optional — on Vercel it auto-detects the canonical URL from `VERCEL_PROJECT_PRODUCTION_URL`.

`public/robots.txt` and `public/sitemap.xml` are served as static assets. `app/sitemap.ts` generates a programmatic sitemap for `/`, `/dashboard`, `/dashboard/query`, and `/dashboard/map`.
