# AGENTS.md

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

## Rule Routing

`AGENTS.md` is the cross-tool entry point. Do not assume non-Claude tools understand `.claude/rules/` frontmatter or path triggers.

Before editing, use this routing table and read only the matching files under `.claude/rules/`:

| Task touches | Read |
|-------------|------|
| Next.js routing, layouts, metadata, images, fonts, caching, Server Components | `conventions.md` + `node_modules/next/dist/docs/` |
| Cloudflare/OpenNext build, preview, deploy, middleware/proxy, runtime behavior | `cloudflare.md` |
| TypeScript style, imports, naming, logging | `coding-standards.md` |
| Magic numbers, ESLint disables, complexity, import boundaries | `code-quality.md` |
| i18n, translations, locale routing, message loading | `i18n.md` |
| API routes, forms, validation, rate limits, CSP, sensitive server code | `security.md` |
| UI components, Tailwind, shadcn/ui, `next/image`, `next/font` | `ui.md` |
| MDX, page content, content ownership, frontmatter | `content.md` |
| Tests, mocks, Vitest, Playwright, coverage gates | `testing.md` |
| JSON-LD, schema.org, structured data builders | `structured-data.md` |
