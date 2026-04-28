# CLAUDE.md

## Project

**Tianze** - PVC conduit fittings manufacturer.

**Goal**: Inquiry conversion + product showcase for overseas distributors, helping them evaluate suppliers during product selection.

Production project, solo development.

## Communication

The owner is non-technical. Communicate in business language, not technical jargon.

## Stack

Next.js 16.2.3 (App Router, Cache Components) + React 19.2.5 + TypeScript 5.9.3 + Tailwind CSS 4.2.2 + next-intl 4.9.1

## Structure

```
src/
- app/[locale]/       # Localized App Router pages
- app/api/            # Route handlers for inquiry, subscribe, Turnstile, CSP report, and health
- components/         # UI components, sections, forms, product blocks, layout, and shared UI
- config/             # Runtime and project configuration
- constants/          # Shared constants and product specs
- emails/             # Email templates and email-related code
- hooks/              # React hooks
- i18n/               # next-intl configuration
- lib/                # Utilities, integrations, security, cache, content, forms, and lead pipeline
- services/           # Service-layer modules
- styles/             # Shared styles
- templates/          # Reusable templates
- test/, testing/     # Test fixtures, setup helpers, and test utilities
- types/              # TypeScript definitions

content/
- pages/en/           # English content pages
- pages/zh/           # Chinese content pages
- config/             # Content configuration
- _archive/           # Archived content

messages/
- en/                 # English translation JSON
- zh/                 # Chinese translation JSON
```

## Reference Sources

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data may be outdated; the installed package docs are the source of truth.

<!-- END:nextjs-agent-rules -->

For other dependency-specific work, prefer Context7 for current API guidance. If Context7 is unavailable, use official docs or version-locked local docs.

Verify dependency APIs from current docs before editing.

## Commands

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm type-check   # TypeScript
pnpm lint:check   # ESLint
pnpm test         # Vitest
pnpm ci:local     # Full CI
pnpm build:cf     # Cloudflare/OpenNext build
pnpm tech:check   # Stack-wide dependency/config/build check
```

`pnpm build` and `pnpm build:cf` write to the same `.next` directory - never run them in parallel.

Use the smallest validation that proves the change:
- Type-only changes: `pnpm type-check`
- Lint-sensitive edits: `pnpm lint:check`
- Unit-tested logic: `pnpm test`
- Next.js/runtime changes: `pnpm build`
- Cloudflare/OpenNext changes: run `pnpm build` before `pnpm build:cf`
- Broad or release-facing changes: `pnpm ci:local`

## Constraints

1. **TypeScript strict** - No `any`, default `interface` for object shapes
2. **Server Components first** - `"use client"` only for interactivity
3. **i18n required** - All user-facing text via translation keys
4. **Git** - GitHub Flow: `main` is the only long-lived branch; feature branches merge through pull requests.

## Rule Loading

Claude Code uses `.claude/rules/` as the project rule layer. Rule files include `paths:` metadata for path-based loading.

When a task crosses rule boundaries or path-based loading may not cover the full context, read the matching rule file explicitly:

- General TypeScript style: `coding-standards.md` + `code-quality.md`
- Next.js architecture and repo pitfalls: `conventions.md`
- Cloudflare/OpenNext runtime or build behavior: `cloudflare.md`
- i18n or locale routing: `i18n.md`
- API routes, validation, CSP, or security: `security.md`
- UI components, Tailwind, or shadcn/ui: `ui.md`
- Content source, MDX, or page copy: `content.md`
- Tests, mocks, Vitest, or Playwright: `testing.md`
- Structured data / JSON-LD: `structured-data.md`
