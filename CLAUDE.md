# CLAUDE.md

## Project

**Tianze (天泽管业)** — PVC conduit fittings manufacturer based in Lianyungang, Jiangsu. Exports to 100+ countries.

**Goal**: Inquiry conversion + product showcase for overseas buyers selecting suppliers.

**Differentiation**: Upstream bending machine manufacturer — technically solid pipe technology expert, not just a trader.

Production project, solo development.

## Stack

Next.js 16 (App Router, Cache Components) + React 19 + TypeScript 5 + Tailwind CSS 4 + next-intl

## Structure

```
src/
├── app/[locale]/     # Pages (async Server Components)
├── components/       # UI (shadcn/ui based)
├── lib/              # Utilities, services
├── i18n/             # next-intl config
└── types/            # TypeScript definitions
content/              # MDX content
messages/[locale]/    # i18n JSON
```

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm type-check   # TypeScript
pnpm lint         # ESLint
pnpm test         # Vitest
pnpm ci:local     # Full CI
```

## Constraints

1. **TypeScript strict** — No `any`, prefer `interface`
2. **Server Components first** — `"use client"` only for interactivity
3. **i18n required** — All user-facing text via translation keys
4. **Git** — Never commit on `main`; create feature branch first

## Language

- Tools/models: English
- User output: Chinese

## Rules

Detailed rules in `.claude/rules/` — read when relevant:

- `architecture.md` — Cache Components, async APIs
- `coding-standards.md` — Naming, imports
- `quality-gates.md` — CI, complexity limits
- `security.md` — CSP, validation
- `debugging.md` — Troubleshooting
