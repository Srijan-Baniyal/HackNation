# San Studio

This is a Next.js 16 + React 19 project configured for:

- **RSC-first architecture** for speed and lower client JavaScript.
- **Quality-first agent setup** through curated skills and strict coding rules.
- **High-end frontend design execution** without sacrificing accessibility or maintainability.

## Getting Started

Install dependencies and start the development server:

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Quality Tooling

Run quality checks before merging:

```bash
bun x ultracite check
```

Auto-fix formatting/lint issues:

```bash
bun x ultracite fix
```

## Agent + Skill Setup

The agent behavior is defined in `AGENTS.md` and uses installed skills from `.agents/skills/`.

### Active skills

- `vercel-react-best-practices` - performance and React/Next implementation guardrails
- `frontend-design` - distinctive UI/UX and production-grade visual quality
- `vercel-react-view-transitions` - native-feeling route and element transitions
- `find-skills` - discover additional capabilities when needed

### Setup standards

- Keep components as **Server Components by default**.
- Add `'use client'` only for interactive islands.
- Prefer streamed sections (`Suspense`) over blocking full-page rendering.
- Follow semantic HTML and accessibility best practices.
- Update docs/rules whenever setup behavior changes.

## Project Structure

- `app/` - App Router pages and components
- `app/lib/` - server-side data utilities
- `AGENTS.md` - quality contract and skill routing rules
- `skills-lock.json` - pinned skill metadata

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router docs](https://nextjs.org/docs/app)
- [React Server Components](https://react.dev/reference/rsc/server-components)
