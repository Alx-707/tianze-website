# Architecture Guide

## Next.js 16 App Router

### Cache Components Mode

Project has `cacheComponents: true` enabled (`next.config.ts`).

- Pages are cacheable by default
- Use `cacheLife()` for duration: `'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max'`

**Optional Cache APIs** (not yet used): `cacheTag()`, `revalidateTag()`, `updateTag()`

### Cache Components Constraints

**IMPORTANT**: `headers()`, `cookies()`, `searchParams` **cannot** be accessed inside `"use cache"` functions.

```typescript
// ❌ Error: runtime API in cached segment
async function getCachedData() {
  'use cache';
  const h = await headers(); // Will throw!
}

// ✅ Correct: separate cached and dynamic parts
<Suspense fallback={<Loading />}>
  <DynamicComponent /> {/* headers/cookies allowed here */}
</Suspense>
```

**PPR / dynamicIO**: Not enabled. See `docs/known-issue/nextjs-i18n-future-upgrade-checklist.md`.

### Async Request APIs (Breaking Change)

Next.js 16 removed sync compatibility layer. These APIs **must be awaited**:

| API | Usage |
|-----|-------|
| `params` | `const { slug } = await params` |
| `searchParams` | `const { query } = await searchParams` |
| `cookies()` | `await cookies()` |
| `headers()` | `await headers()` |

**Client Components**: Use React 19 `use()` hook to unwrap Promises.

### Page Props Pattern

```typescript
interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

## Routing & Layout

- **Locale-based**: `/[locale]/page-name` (en, zh)
- **Root layout**: Minimal wrapper
- **Locale layout**: Fonts, metadata, providers
- **Rule**: Push Client boundaries as low as possible in component tree

## Server vs Client Components

| Server (default) | Client (`"use client"`) |
|------------------|-------------------------|
| Data fetching, SEO | Interactivity, hooks, browser APIs |
| async/await | useState, useEffect |
| Direct API/DB access | onClick, onChange |

### Data Serialization (RSC Boundaries)

Server → Client props must be JSON-serializable.

| ❌ Non-serializable | ✅ Fix |
|---------------------|--------|
| Functions | Define in Client or use Server Action |
| Date objects | `.toISOString()` |
| Map / Set | `Object.fromEntries()` / `Array.from()` |
| Class instances | Convert to plain object |

```typescript
// ❌ Bad: Date object
<ClientCard createdAt={post.createdAt} />

// ✅ Good: ISO string
<ClientCard createdAt={post.createdAt.toISOString()} />
```

## Data Fetching

| Scenario | Solution |
|----------|----------|
| Server Component read | Direct fetch / database call |
| Client Component mutation | Server Action |
| Client Component read | Pass from Server Component |
| External API / webhooks | Route Handler |

**Avoid Waterfall**: Use `Promise.all()` or `<Suspense>` for parallel loading.

**Project data**: Cached functions in `src/lib/content/` (e.g., `getAllProductsCached()`)

## Dynamic Import + Radix UI

**IMPORTANT**: Radix UI + `next/dynamic` **must** use `ssr: false` to prevent hydration mismatch:

```typescript
// ✅ Correct
const Tabs = dynamic(() => import('./tabs'), { ssr: false });

// ❌ Will cause hydration mismatch
const Tabs = dynamic(() => import('./tabs'));
```

Applies to: Tabs, Dialog, Accordion, Select, DropdownMenu, Popover.

For LCP-critical content, avoid `dynamic` and use direct import.

## Hydration Risk Checklist

Error signal: "Hydration failed because the initial UI does not match"

| Cause | Fix |
|-------|-----|
| Browser APIs (window, localStorage) | Client Component + `useEffect` mounted check |
| Date/Time rendering | Use `useEffect` in Client Component |
| Random values / dynamic IDs | Use `useId()` hook |
| Invalid HTML nesting (div inside p) | Fix DOM structure |
| Third-party scripts modifying DOM | `next/script` + `afterInteractive` |
| Radix UI + dynamic | `ssr: false` (see above) |

```typescript
// ❌ Bad: Browser API
<div>{window.innerWidth}</div>

// ✅ Good: mounted check
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
return mounted ? <div>{window.innerWidth}</div> : null
```

## Middleware / Proxy

Project uses `middleware.ts`:
- ✅ Locale detection and redirect (next-intl)
- ✅ Security headers injection (CSP nonce)
- ❌ **No authentication**

**Proxy migration**: See `docs/known-issue/middleware-to-proxy-migration.md`

## Key Files

| File | Purpose |
|------|---------|
| `src/i18n/request.ts` | Translation loading |
| `src/i18n/routing.ts` | Locale config |
