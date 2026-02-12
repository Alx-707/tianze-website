# Code Review Checklist (Project-Specific)

> FradSer `review:hierarchical` agents should reference this checklist.
> Complements generic review with project-specific verification.

## Mandatory Verification Commands

### Middleware & Security Headers

```bash
ls -la middleware.ts src/middleware.ts 2>/dev/null
grep -rn "Content-Security-Policy" next.config.* src/ middleware.* 2>/dev/null
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

### Production Build

```bash
pnpm build
grep -r "unpkg.com\|cdn.jsdelivr" .next/ 2>/dev/null | grep -v ".map"
```

### Quality Gates

```bash
pnpm type-check
pnpm lint:check
pnpm test
```

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
