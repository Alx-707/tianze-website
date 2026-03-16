# Wave 2 Review Findings

Scope so far:
- `src/middleware.ts`
- `src/app/[locale]/layout.tsx`
- `src/lib/load-messages.ts`
- `src/i18n/request.ts`
- `src/lib/i18n-performance.ts`

Status:
- kickoff pass completed
- first candidate promoted into official ledger as `CR-056`
- `CR-056` repaired and verified
- second candidate promoted into official ledger as `CR-057`
- `CR-057` repaired and verified
- third candidate promoted into official ledger as `CR-058`
- `CR-058` repaired and verified
- dead test-only i18n entrypoints cleaned up as `CR-059` follow-up cleanup
- locale parsing split-truth issue repaired as `CR-060`
- request metadata cleanup completed as `CR-061`
- structured-data locale type split-truth issue repaired as `CR-062`
- load-messages locale type split-truth issue repaired as `CR-063`
- shared locale type split-truth issue repaired as `CR-064`
- Wave 2 is not yet complete

## Candidate Findings

### C1. `src/i18n/request.ts` still derives `cacheUsed` from an obsolete translation cache seam
- Dimension:
  - ownership / single source of truth
  - abnormal-path semantics
- Evidence:
  - `src/i18n/request.ts:52-63` computes `cacheUsed` by reading `TranslationCache.getInstance().get("messages-${locale}-critical")`
  - `src/i18n/request.ts:148-156` loads runtime messages through `loadCompleteMessages(locale)`, not through `getCachedMessages()`
  - `src/lib/i18n-performance.ts:111-140` is the only production writer for that `messages-${locale}-critical` cache key, and it represents a separate fetch-based performance helper path rather than the canonical runtime message loader
- Risk:
  - `metadata.cacheUsed` and cache-hit metrics in `request.ts` no longer reflect the actual runtime loading path
  - this keeps request-time i18n behavior coupled to a secondary cache implementation that is no longer the runtime truth source
- Next verification step:
  - issue promoted to `CR-056`
  - repaired by removing the stale `TranslationCache` inference from `src/i18n/request.ts`

### C2. `src/lib/i18n-performance.ts` 的 fetch-based translation helper 生产引用面已极薄，却仍以“runtime helper”姿态存在
- Dimension:
  - migration / compatibility
  - ownership / single source of truth
- Evidence:
  - repository-wide reference search shows `getCachedMessages` / `getCachedTranslations` / `preloadTranslations` now mainly appear in tests and in `src/i18n/request.ts`’s old seam that was just removed in CR-056
  - source comment in `src/lib/i18n-performance.ts` still claims the module is used by a client component `translation-preloader.tsx`, but that component is not present in current production code
  - current remaining production imports are metric-only (`I18nPerformanceMonitor` in `request.ts`, `structured-data.ts`, `structured-data-helpers.ts`), not the fetch-based message helper path itself
- Risk:
  - the repository still presents a second translation-loading helper stack that looks production-relevant, even though the canonical runtime path is now split-source `load-messages.ts`
  - future maintainers can be misled into extending or trusting the fetch-based helper as if it were part of the active runtime chain
- Next verification step:
  - issue promoted to `CR-057`
  - repaired by splitting the fetch-based helper path into `src/lib/i18n-message-cache.ts`

### C3. `src/middleware.ts` 的显式 locale early return 旁路了 canonical `next-intl` 路径，只是为了补 cookie
- Dimension:
  - migration / compatibility
  - ownership / single source of truth
- Evidence:
  - explicit locale requests previously went through `tryHandleExplicitLocalizedRequest()` which returned `NextResponse.next()` before invoking `intlMiddleware`
  - the shared post-`intlMiddleware` branch already contained the same cookie-sync behavior for `locale && existingLocale !== locale`
- Risk:
  - the runtime entry path stayed split across two branches that handled the same explicit-locale scenario
  - future locale/runtime changes could be fixed in one branch and missed in the other
- Next verification step:
  - issue promoted to `CR-058`
  - repaired by removing the redundant early return and keeping `next-intl` as the canonical path
