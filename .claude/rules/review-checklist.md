# Code Review Checklist (Project-Specific)

> FradSer `review:hierarchical` agents should reference this checklist.
> Complements generic review with project-specific verification.

## Mandatory Verification Commands

### Middleware & Security Headers

> The project currently uses `src/middleware.ts`. This is required for compatibility with the current Cloudflare/OpenNext build chain; `next-intl` still runs through `createMiddleware(routing)`. Compatibility record: `docs/known-issues/middleware-to-proxy-migration.md`.

```bash
ls -la middleware.ts src/middleware.ts proxy.ts src/proxy.ts 2>/dev/null
grep -rn "Content-Security-Policy" next.config.* src/ middleware.* proxy.* 2>/dev/null
curl -sI http://localhost:3000/ | grep -iE "content-security-policy|strict-transport|x-frame-options"
```

### API Route Authentication

```bash
find src/app/api -name "route.ts" -type f 2>/dev/null
grep -rn "authorization\|Bearer\|x-api-key\|validateApiKey\|getServerSession\|auth(" src/app/api/ 2>/dev/null
grep -rn "rateLimit\|checkDistributedRateLimit\|429" src/app/api/ 2>/dev/null
```

For each public write endpoint, must verify:
- `Authenticated + Rate Limited` OR document why exempted
- If request body is JSON: verify shared size-limited parsing path (for example `safeParseJson`) or document equivalent protection
- If endpoint creates side effects and CORS exposes `Idempotency-Key`: verify both server and client actually implement the idempotency contract

### Production Build

```bash
pnpm build
pnpm build:cf
grep -r "unpkg.com\|cdn.jsdelivr" .next/ 2>/dev/null | grep -v ".map"
```

### Quality Gates

```bash
pnpm type-check
pnpm lint:check
pnpm test
```

### Tier A Impact Review

```bash
pnpm review:tier-a:staged
pnpm review:clusters:staged
```

Use `pnpm review:tier-a:staged` when the staged diff touches Tier A paths and you want the owner/proof guidance first.
Use `pnpm review:clusters:staged` when you want the staged diff to scan all matching structural clusters and run the matching cluster reviews automatically.
Use `pnpm review:cluster <name> --staged` when you already know a single cluster is in scope and want to run only that cluster's review.

Default flow for staged diffs:
1. Run `pnpm review:tier-a:staged` if any Tier A path is touched.
2. Run `pnpm review:clusters:staged` for structural cluster coverage.
3. Drop to `pnpm review:cluster <name> --staged` only when the scope is already known and you want a single-cluster check.

If Tier A paths are matched:
- use [`docs/guides/TIER-A-OWNER-MAP.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TIER-A-OWNER-MAP.md)
- use [`docs/guides/QUALITY-PROOF-LEVELS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- use [`docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md)
- do not treat fast local gates as sufficient proof

If the impacted cluster is the lead API family:

```bash
pnpm review:lead-family
```

Also use:
- [`docs/guides/LEAD-API-FAMILY-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/LEAD-API-FAMILY-CONTRACT.md)

If the impacted cluster is the translation quartet:

```bash
pnpm review:translation-quartet
```

Also use:
- [`docs/guides/TRANSLATION-QUARTET-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/TRANSLATION-QUARTET-CONTRACT.md)

If the impacted cluster is the homepage section cluster:

```bash
pnpm review:homepage-sections
```

Also use:
- [`docs/guides/HOMEPAGE-SECTION-CLUSTER-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/HOMEPAGE-SECTION-CLUSTER-CONTRACT.md)

If the impacted cluster is the locale runtime surface:

```bash
pnpm review:locale-runtime
```

Also use:
- [`docs/guides/LOCALE-RUNTIME-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/LOCALE-RUNTIME-CONTRACT.md)

If the impacted cluster is cache invalidation + health:

```bash
pnpm review:cache-health
```

Also use:
- [`docs/guides/CACHE-HEALTH-CONTRACT.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CACHE-HEALTH-CONTRACT.md)

## Severity Rules

- Findings must be tagged: `PROD` / `DEV` / `CI` / `DOC`
- DEV-only issues: Maximum `Low` severity
- Unverified conclusions cannot be rated `Critical` or `High`
- "Possibly" or "theoretically" cannot escalate to Critical/High

## Next.js 16 Specific Checks

### Cache + Dynamic Data Conflict
If same data path uses `cookies()/headers()` AND `"use cache"` → `High | PROD` (cross-user data leak)

### `"use client"` Bundle Bloat
Layout/root components with `"use client"` but no interactivity → `Medium | PROD`

### `next/script` + CSP Nonce
Production scripts needing nonce but no middleware nonce injection → `High | PROD`

## Authentication Patterns

```typescript
checkDistributedRateLimit(clientIP, 'endpoint-name')
verifyTurnstileDetailed(token, clientIP)
validateApiKey(request)
```

## i18n Check

```bash
grep -rn "All systems normal\|Loading\|Error\|Success" src/app/ src/components/ --include="*.tsx" 2>/dev/null
```

Hardcoded user-facing strings should use translation keys.

Also verify:
- runtime code does not fall back to `messages/{locale}.json`
- `src/lib/load-messages.ts` and `src/i18n/request.ts` use the same split runtime source semantics
