# Locale Runtime Contract

## Scope
This contract covers the runtime locale path:
- `src/middleware.ts`
- `src/i18n/request.ts`
- `src/lib/load-messages.ts`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/head.tsx`

## Purpose
These files collectively define:
- locale routing and redirect behavior
- SSR locale semantics
- runtime message loading
- root layout locale correctness
- nonce/header propagation at the runtime entry layer

They should be reviewed as one structural surface, not as isolated files.

## Shared Runtime Rules

### 1. Runtime Message Source
- Server runtime must load from split message files under `messages/{locale}/`.
- Flat locale files may exist for compatibility/tooling, but runtime must not depend on them as a fallback truth source.

### 2. HTML Locale Semantics
- Root layout must emit the correct server-rendered `<html lang={locale}>`.
- Client-side patching of `document.documentElement.lang` is not an acceptable substitute.

### 3. Locale Redirect and Cookie Semantics
- Invalid locale prefix handling must remain server-side.
- `NEXT_LOCALE` persistence must remain explicit and secure.

### 4. Runtime Proof
- Changes in this cluster should use at least Tier A proof.
- Build/build:cf parity matters for this cluster.

## Review Command

```bash
pnpm review:locale-runtime
```

## Regression Coverage
- [`tests/unit/middleware.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/tests/unit/middleware.test.ts)
- [`src/__tests__/middleware-locale-cookie.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/__tests__/middleware-locale-cookie.test.ts)
- [`src/i18n/__tests__/request.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/i18n/__tests__/request.test.ts)
- [`src/lib/__tests__/load-messages.fallback.test.ts`](/Users/Data/Warehouse/Pipe/tianze-website/src/lib/__tests__/load-messages.fallback.test.ts)
