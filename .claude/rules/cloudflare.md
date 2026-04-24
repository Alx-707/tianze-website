---
paths:
  - "src/middleware.ts"
  - "open-next.config.ts"
  - "wrangler.jsonc"
  - "scripts/cloudflare/**"
  - "src/app/**/actions.ts"
  - "src/lib/security/**"
---

# Cloudflare Deployment Constraints

> Most rules in this file are **repo-specific operational constraints** for the current Next.js + OpenNext + Cloudflare stack. Keep Next.js / Cloudflare official APIs aligned, but do not mistake these repo runbooks for generic platform rules.

## Build Chain

### Never parallel-run `pnpm build` and `pnpm build:cf`

Both write to `.next`. Parallel execution produces false failures.

```bash
# ✅ Sequential
pnpm clean:next-artifacts && pnpm build
pnpm build:cf

# ❌ Parallel — .next corruption
pnpm build & pnpm build:cf
```

If `Maximum call stack size exceeded` appears, first check for stale `.next` / `.open-next` / `.wrangler/tmp` artifacts before suspecting business code regression.

### Build pass ≠ page proof

`pnpm build:cf` passing does not prove Cloudflare pages work. Always run smoke separately:

```bash
pnpm build:cf
pnpm preview:cf          # local page verification
pnpm smoke:cf:preview    # automated page smoke
```

### OpenNext minify stays off

In `open-next.config.ts`, keep `minify: false` for split functions and default worker. Re-enabling requires full smoke pass (`build:cf` + `preview:cf` + `smoke:cf:deploy`).

## Runtime Entry

### middleware.ts is the Cloudflare-compatible entry

`src/proxy.ts` passes `next build` but blocks `pnpm build:cf`. All locale redirect, CSP nonce, and security header changes go in `src/middleware.ts`.

### matcher must be static literals

```typescript
// ❌ Turbopack error: "matcher need to be static strings"
export const config = { matcher: buildMatcherArray() };

// ✅ Static string literals only
export const config = { matcher: ['/((?!_next|api).*)'] };
```

## Server Actions on Cloudflare

### Client IP: use middleware-derived internal header

Server Actions only have `headers()`, not `NextRequest`. Direct `cf-connecting-ip` / `x-forwarded-for` loses trusted-source context.

```typescript
// ❌ Server Action trusting raw proxy headers
const ip = headers().get('cf-connecting-ip');

// ✅ Middleware derives and sets internal header
// middleware.ts: request.headers.set('x-internal-client-ip', derivedIP)
// Server Action reads internal header only
const ip = headers().get('x-internal-client-ip');
```

When changing Contact/inquiry client identity chain, verify middleware internal header is maintained. Run:
```bash
pnpm exec vitest run src/lib/security/__tests__/client-ip.test.ts src/app/__tests__/actions.test.ts
pnpm build && pnpm build:cf
```

## Cache Components on Cloudflare

### No `use cache` / `cacheLife` on conversion pages

Cloudflare runtime has `setTimeout()` and Cache Components boundary issues. Contact/inquiry/subscribe pages must not use `use cache` or `cacheLife` on data-fetching functions.

### Runtime message JSON bypasses `unstable_cache`

Do not wrap runtime i18n JSON module imports in `unstable_cache` on Cloudflare. Wrangler/Miniflare can revalidate those cached loaders across request contexts and fail with “Cannot perform I/O on behalf of a different request.” Use direct module imports for Cloudflare runtime; keep `unstable_cache` only for non-CI, non-build, non-Cloudflare runtime paths.

### Loading.tsx for conversion pages

Route-level `loading.tsx` controls no-JS / slow-streaming first paint. For contact/inquiry/subscribe, either provide meaningful content or omit `loading.tsx` entirely — empty skeletons break SSR content contracts.

## Issue Classification

When Cloudflare-related failures occur, classify before debugging:

| Category | Example | Where to look |
|----------|---------|---------------|
| Platform entry | Wrangler/Miniflare startup crash | Local runtime, not business code |
| Generated artifact | `middleware-manifest.json` dynamic require | `scripts/cloudflare/patch-*.mjs` |
| Runtime regression | Page 500 after Next.js upgrade | `pnpm smoke:cf:preview` |
| Deployed behavior | API health fails post-deploy | `pnpm smoke:cf:deploy` |

Reference: `docs/guides/CLOUDFLARE-ISSUE-TAXONOMY.md`
