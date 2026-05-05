# CSP Paid-Traffic Decision Memo

**Status:** No immediate CSP policy rewrite
**Decision trigger:** Before scaling paid traffic

## Current policy

`script-src` stays nonce-scoped and must not include `'unsafe-inline'`.
`script-src-elem` explicitly includes `'unsafe-inline'` because the current
Next.js App Router + Cache Components output can include framework inline script
elements that do not reliably receive a request nonce.

## Why not rewrite now

The site is not formally launching paid traffic now. A broad CSP rewrite would
risk breaking hydration or static rendering while solving a risk that is already
partly mitigated by the current site shape:

- no user-generated HTML surface;
- lead inputs are processed server-side;
- CSP reports are routed through `/api/csp-report`;
- `pnpm security:csp:check` verifies the runtime script shape.

## Options before paid traffic

1. Keep the current trade-off and monitor CSP reports.
2. Restrict the exception if Next.js provides a route-level static/dynamic CSP
   path that keeps Cache Components intact.
3. Move affected routes to dynamic rendering with nonce coverage after measuring
   performance and SEO impact.

## Required proof before any future change

Run these commands serially:

```bash
pnpm clean:next-artifacts
pnpm build
pnpm security:csp:check
pnpm test:release-smoke
```

If the change touches Cloudflare behavior, add:

```bash
pnpm build:cf
pnpm smoke:cf:preview
```

Any future PR that removes `script-src-elem 'unsafe-inline'` must prove that
runtime HTML no longer contains unnonced executable inline script elements, or
that those elements receive a CSP nonce.
