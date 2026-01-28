# Debugging & Troubleshooting

## Build Errors

### "Module not found"
1. Check import path (`@/` alias vs relative)
2. Verify file extension in `next.config.ts` pageExtensions
3. Run `pnpm type-check` for TypeScript resolution issues

### Hydration Mismatch
See `architecture.md` → Hydration Risk Checklist

Common causes:
- Browser APIs in SSR (`window`, `localStorage`)
- Date/time rendering without client-side `useEffect`
- Radix UI + `dynamic()` without `ssr: false`

### Cache Components Errors
- `headers()`/`cookies()` in `"use cache"` → Move to Suspense boundary
- Missing `setRequestLocale()` → Add in page/layout before any hooks

## Runtime Errors

### API Route 500
1. Check server logs: `pnpm dev` terminal output
2. Validate request body with Zod schema
3. Verify env vars: `src/env.ts` validation

### i18n "Missing message"
1. Run `pnpm validate:translations`
2. Check namespace in `messages/[locale]/`
3. Verify key path in `getTranslations()` call

## Performance Issues

### Slow Build
```bash
ANALYZE=true pnpm build  # Bundle analyzer
```

### Slow Dev Server
- Turbopack: `pnpm dev` (default)
- Webpack fallback: `pnpm dev:webpack`

## Useful Commands

| Issue | Command |
|-------|---------|
| Type errors | `pnpm type-check` |
| Lint issues | `pnpm lint:fix` |
| i18n validation | `pnpm i18n:full` |
| Full CI locally | `pnpm ci:local` |
| Bundle analysis | `ANALYZE=true pnpm build` |

## Logging

Use `src/lib/logger.ts` for structured logs:

```typescript
import { logger } from '@/lib/logger';

logger.error('API failed', { endpoint, statusCode, userId });
logger.warn('Rate limit approaching', { remaining, ip });
```

**Allowed in production**: `logger.error()`, `logger.warn()`
**Dev only**: `logger.info()`, `logger.debug()`
