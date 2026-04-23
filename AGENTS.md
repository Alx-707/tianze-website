# AGENTS.md

> Cross-tool agent instructions. Codex, Copilot, Gemini, and other AI code tools: read this file.

## Project

**Tianze (天泽管业)** — PVC conduit fittings manufacturer, Lianyungang, Jiangsu. Exports to 20+ countries.

Goal: Inquiry conversion + product showcase for overseas B2B buyers.

Stack: Next.js 16.2 (App Router, Cache Components) + React 19.2 + TypeScript 5.9 + Tailwind CSS 4.2 + next-intl 4.8

## Coding Constraints

All coding constraints live in `CLAUDE.md` and `.claude/rules/`. Follow them as-is:

| File | Scope |
|------|-------|
| `CLAUDE.md` | Project overview, stack, structure, commands, design context |
| `.claude/rules/cloudflare.md` | Build chain, middleware entry, Server Action IP, Cache Components |
| `.claude/rules/coding-standards.md` | TypeScript strict, naming, imports, logging |
| `.claude/rules/code-quality.md` | Complexity limits, magic numbers, ESLint |
| `.claude/rules/conventions.md` | Hydration pitfalls, use-client boundary, route deletion |
| `.claude/rules/content.md` | MDX vs TypeScript content strategy |
| `.claude/rules/i18n.md` | next-intl, Cache Components compatibility |
| `.claude/rules/security.md` | API route skeleton, rate limit, CSP, validation |
| `.claude/rules/testing.md` | Vitest/Playwright, mock system, BDD |
| `.claude/rules/ui.md` | Component reuse, Tailwind v4, design tokens, shadcn/ui |

## Next.js API Reference

Version-locked Next.js docs live in `.next-docs/`. The index is at the bottom of `CLAUDE.md`. Consult before writing Next.js code — training data may be outdated.

## Communication

Owner is non-technical. All reporting uses business language.

- Describe **what changed and what effect it has**, not which files were modified
- Use analogies, not jargon. First occurrence of a technical term gets a plain-language gloss
- Structure updates as: conclusion, practical impact, remaining risk, next step
- Do not default-assume the reader knows Next.js, Cloudflare, RSC, or build tooling terms

## Build Validation

```bash
pnpm ci:local          # Full local CI
pnpm build             # Standard build
pnpm build:cf          # Cloudflare build (run AFTER pnpm build, never in parallel)
pnpm type-check        # TypeScript
pnpm lint:check        # ESLint
pnpm test              # Vitest
```

`pnpm build` and `pnpm build:cf` write to the same `.next` directory — never run them in parallel.
