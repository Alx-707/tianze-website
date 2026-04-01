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
pnpm release:verify
grep -r "unpkg.com\|cdn.jsdelivr" .next/ 2>/dev/null | grep -v ".map"
```

Notes:
- Run `pnpm build` and `pnpm build:cf` serially, never in parallel.
- `pnpm build:cf` is the current canonical Cloudflare build path and now runs through the repo's Webpack wrapper.
- If the diff touches Cloudflare build tooling, OpenNext integration, or Wrangler-specific aliases, also run `pnpm build:cf:turbo` as a comparison check.
- If the diff touches Next/OpenNext/Wrangler/Cloudflare proof scripts, `pnpm release:verify` is part of the expected review evidence, not an optional extra.

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

## AI Smell Review (Required)

Canonical source:
- [`ai-smells.md`](/Users/Data/Warehouse/Pipe/tianze-website/.claude/rules/ai-smells.md)

审查 AI 生成或 AI 主导修改的代码时，以下问题必须逐条回答：

1. 是否新增了 `TEST_MODE` / `PLAYWRIGHT_TEST` / `NEXT_PUBLIC_TEST_MODE` /
   `SKIP_ENV_VALIDATION` / `ALLOW_MEMORY_*` 等测试专用分支？

2. 关键 smoke / E2E 在运行时错误下是否会 `skip`，而不是 `fail`？

3. 名称带 `integration` / `contract` / `protection` 的测试，是否把
   rate limit、Turnstile、validation、pipeline 等核心链路几乎全 mock 掉了？

4. 是否新增了 warning-only / bypass / degraded override / runtime skip，
   导致“绿色结果”不再等于原本承诺的证明强度？

5. 关键页面测试是否已经变成“假舞台”：
   同时 mock `Suspense`、翻译、loader、表单、schema、内容源，
   却仍把自己当页面主证明？

6. 是否把 `src/test/**`、`src/testing/**`、`src/constants/test-*`、
   测试消息或测试工具引进了生产代码？

7. 是否在 live 页面留下 placeholder 资源、明显占位块、或 `Coming Soon`
   这类未收口设计？

8. 是否新增了只 log 不改变语义的静默故障，尤其落在安全、限流、幂等、
   去重、反滥用链路？

9. 这次改动是否要求同步更新行为合同、runbook、或 proof 文档？
   如果真实证明边界变了，文档不能继续假装没变。

默认严重度：

- 关键路径上的测试分叉、skip、fail-open、warning/bypass 放行：默认 `High`
- 关键页面主证明依赖假舞台测试：默认 `High`
- 生产代码引入测试资产：默认 `High`
- 线上 placeholder 设计：默认 `Medium`，主转化页可升 `High`
- 真相源失真：默认 `Medium | DOC`

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
