# Project Style Guide

## TypeScript

- Strict mode enabled. Never use `any` type.
- Prefer `interface` over `type` for object shapes.
- Use `satisfies` for type-safe object literals.
- Avoid `enum`, use `const` objects instead.
- `exactOptionalPropertyTypes` is enabled — never assign `undefined` to optional properties; use conditional spread instead.

## React & Next.js

- **Next.js 16** with App Router and Cache Components (`cacheComponents: true`).
- **Server Components first** — only add `"use client"` directive when the component requires interactivity (event handlers, hooks, browser APIs).
- Push client boundaries as low as possible in the component tree.
- Page props: `params` is `Promise<{ locale: string }>` and must be awaited.

### Cache Components Rules

- `setRequestLocale(locale)` must be called in every `[locale]/layout.tsx` and `[locale]/page.tsx` before any hooks.
- `"use cache"` segments must NOT call request-dependent APIs: `getTranslations()` without explicit locale, `getLocale()`, `cookies()`, `headers()`.
- Safe pattern inside `"use cache"`: `getTranslations({ locale, namespace })` with explicit locale parameter.

## Internationalization

- All user-facing text must use next-intl translation keys (`getTranslations` in Server Components, `useTranslations` in Client Components).
- No hardcoded user-facing strings in source code.

## Security

- All API write endpoints (POST/PUT/PATCH/DELETE) must have rate limiting and authentication.
- All user input must be validated with Zod schemas.
- Never use unfiltered `dangerouslySetInnerHTML` — must sanitize with DOMPurify.
- URLs must validate protocol (only `https://`, `http://`, `/`).
- Add `import "server-only"` at top of sensitive server-only files.

## Complexity Limits

- Function: max 120 lines.
- File: max 500 lines.
- No magic numbers — use named constants from `src/constants/`.

## Images

- Must use `next/image` component. Native `<img>` tags are forbidden.
- `fill` prop requires a `sizes` attribute — without it, the browser downloads the largest image variant.

## Testing

- Tests must be behavior-driven: verify what the user can do (navigation targets, form submissions), not just element presence.
- Link tests must verify `href` resolves to a known route.
- No presence-only assertions (e.g., `toBeInTheDocument()`) without also checking behavior.

## Logging

- No `console.log` in production code. Only `console.error` and `console.warn` are allowed.
- Use the project's structured logger (`src/lib/logger.ts`) for application logging.
