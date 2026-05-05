# Middleware to Proxy Cloudflare Proof Plan

Run id: `2026-04-29-full-repo-audit`

Status: parked. Do not execute as part of the launch-blocker repair wave.

## Current decision

Next.js 官方方向是从 `middleware` 迁移到 `proxy`，但本仓库当前不能直接迁移。

This is not a disagreement with Next.js docs. It is a repo-specific Cloudflare/OpenNext compatibility proof gap.

## Evidence

Official Next.js local docs:

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
- The docs say the `middleware` file convention is deprecated and renamed to `proxy`.

Repo-specific constraints:

- `.claude/rules/cloudflare.md:80-82` says `src/middleware.ts` is the Cloudflare-compatible entry and `src/proxy.ts` previously blocked `pnpm build:cf`.
- `src/proxy.ts` does not currently exist.
- `src/middleware.ts` currently owns:
  - locale redirect
  - locale cookie
  - CSP nonce/security headers
  - `/api/health` short-circuit
  - trusted client IP internal header
- `docs/guides/QUALITY-PROOF-LEVELS.md:197-200` says the current Cloudflare compatibility chain still prefers `src/middleware.ts`.
- `docs/technical/deployment-notes.md:150-156` says current runtime entry remains `src/middleware.ts`.
- The historical 2026-04-27 repair plan explicitly parked middleware deprecation
  and said not to rename now. That plan has been removed from the live docs tree;
  use git history or the Trash archive if exact historical wording is needed.

## Proof branch shape

Create a separate branch only for this migration proof. Do not mix with:

- Contact SEO repair
- placeholder content cleanup
- mutation script repair
- server-only hardening

## Required checks

Preflight:

```bash
git status --short --branch
rg -n "middleware|proxy" src .claude next.config.ts open-next.config.ts wrangler.jsonc docs package.json
sed -n '1,180p' node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md
```

Local framework build:

```bash
pnpm build
```

Cloudflare/OpenNext build:

```bash
pnpm build:cf
```

Local Cloudflare runtime proof:

```bash
pnpm preview:cf
pnpm smoke:cf:preview
```

Targeted behavior proof:

```bash
pnpm exec vitest run src/__tests__/middleware-locale-cookie.test.ts src/lib/security/__tests__/client-ip.test.ts src/app/__tests__/actions.test.ts
```

Manual HTTP checks to record:

- `/` redirects or resolves with expected locale behavior.
- `/en` and `/zh` preserve locale behavior.
- invalid locale prefix behavior still works.
- `/api/health` still returns expected health response.
- CSP/security headers still exist.
- `x-middleware-set-cookie` does not leak.
- trusted internal client IP header path still works for server actions.

## Pass condition

Migration can be considered safe only if:

1. Next build recognizes the new proxy entry.
2. OpenNext Cloudflare build succeeds.
3. Cloudflare preview starts.
4. Smoke passes.
5. locale/security/header/IP behaviors match current `src/middleware.ts`.
6. The Cloudflare rule file is updated after proof, not before.

## Fail condition

If `pnpm build` passes but `pnpm build:cf` fails, keep `src/middleware.ts` and record the exact OpenNext failure as the current adapter blocker.

If preview starts but page/header behavior changes, keep `src/middleware.ts` and classify the migration as behavior-incompatible until a smaller fix is designed.
