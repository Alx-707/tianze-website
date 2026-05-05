# Full Project Health Audit v2 - Final Report

Run id: `2026-04-29-full-repo-audit`

> Current-truth note (2026-05-05): This historical audit remains useful as
> evidence, but several findings have been superseded. In particular,
> idempotency wait now has a bounded timeout, pending logo assets use text
> fallback instead of rendering a broken header image, and test-file counts must
> include co-located `src/**/__tests__` files rather than only root `tests/`.

## One-line verdict

The repo is engineering-healthy, but not launch-clean yet. I would not call it ready for broad public launch until the two P1 issues are fixed: Contact SEO duplicate tags and public placeholder trust assets.

## Executive summary

What is good:

- Local build passes.
- Cloudflare/OpenNext build passes.
- Unit test base is large and green: 324 files / 4307 tests.
- Release smoke passes: 45 Chromium tests.
- TypeScript, ESLint, dependency conformance, static truth, unused check, Semgrep, and dependency audit pass.
- Local Lighthouse lab scores for `/en` and `/zh` are strong.

What blocks a clean launch-quality verdict:

1. `/en/contact` can render duplicate canonical/hreflang links under the production-start E2E environment. That is the contact/conversion page, so it matters more than a random page.
2. Public buyer-facing content still includes placeholder phone/product/trust assets. A buyer can see fake-looking contact and sample-product material.

What is not proven:

- Cloudflare preview/deployed page behavior.
- Google Search Console / URL Inspection / CrUX.
- Real Resend/Airtable delivery.

## Severity summary

| Severity | Count | Meaning in this run |
| --- | ---: | --- |
| P0 | 0 | No confirmed build/deploy/security/data-integrity emergency |
| P1 | 2 | Must fix before broad public launch |
| P2 | 6 | Schedule cleanup; affects maintainability, proof quality, future upgrade cost, or release-proof coverage |
| P3 | 0 | No separate low-priority finding promoted |

## Findings

### P1 - Contact SEO duplicate tags

`/en/contact` fails targeted SEO E2E because two canonical links and two hreflang sets exist at runtime:

- `http://localhost:3000/en/contact`
- `https://tianze-pipe.com/en/contact`

This is likely caused by mixed build-time and runtime base URL ownership plus dynamic/streamed metadata on the Contact page. The fix should be a small SEO/runtime-env contract repair, not a test relaxation.

### P1 - Public placeholders still visible

The site still has:

- placeholder phone `+86-518-0000-0000`;
- brand asset TODOs;
- product-family specs pointing to `sample-product.svg`;
- an SVG that literally says "Sample Product" and "Replace this image with your real product photo".

This is a buyer-trust problem. Green CI does not make placeholder public content acceptable for launch.

### P2 - `middleware` to `proxy` framework drift

Next.js 16.2.4 build warns that `middleware` is deprecated and should become `proxy`. However the repo Cloudflare rule says `src/proxy.ts` previously passed `next build` but blocked `pnpm build:cf`.

Do not rename casually. This needs a dedicated Cloudflare proof lane.

### P2 - Audit adapter stale

`docs/audits/full-project-health-v2/project-profile.md` says TypeScript 5.9, next-intl 4.8, and `.next-docs/`. Current repo evidence says TypeScript 6.0.3, next-intl 4.11.0, and Next docs under `node_modules/next/dist/docs/`.

This can mislead future audit runs.

### P2 - Critical mutation review script is broken

`package.json` exposes `review:mutation:critical`, but it points to a missing `scripts/review-mutation-critical.js`.

Normal tests pass, but this advertised proof lane is dead.

### P2 - Server-only boundary is inconsistent

The repo security rule says sensitive server files should add `import "server-only"`. Only `/api/inquiry` currently does so among the checked sensitive route/pipeline files.

API routes are server-bound by framework behavior, so this is not an immediate exploit finding. It is a maintainability/security-boundary hardening issue.

### P2 - Multiple/nested main landmarks

`src/app/[locale]/layout.tsx` already wraps every localized page in `<main id="main-content">`, but multiple pages and content shells also render their own `<main>` elements. Static scan finds 11 runtime `<main>` declarations outside tests.

This is not a launch-blocking visual failure, but it is a real accessibility/HTML semantics issue. Current tests only prove that a main landmark exists; they do not prove each composed page has exactly one main landmark.

### P2 - Production config validation misses public placeholders

`pnpm validate:config` currently passes while `+86-518-0000-0000`, `/images/products/sample-product.svg`, and public SVG text like "Sample Product" remain in buyer-facing surfaces.

The validator mostly catches runtime/env issues and bracket-style placeholders. It does not yet act as a public-launch content guard, so it can be green while buyer-trust placeholders still block launch readiness.

## Overall quality score

Engineering health: 82/100.

Code quality stability: 76/100.

Launch readiness: 70/100.

Reason: the platform and test base are solid, but launch readiness is pulled down by buyer-visible placeholders and Contact SEO duplication.

## Recommended repair order

1. Fix Contact SEO base URL ownership and metadata duplication. Verify with the failing targeted E2E and then full SEO E2E.
2. Replace or intentionally suppress all public placeholders before public launch. Verify via product pages, contact page, terms/contact copy, and generated messages.
3. Add or tighten a public-launch placeholder guard so the current placeholder state cannot pass as production-ready.
4. Clean up the one-main-landmark ownership model and add a regression check.
5. Update the v2 audit adapter so future audits do not start from stale stack facts.
6. Repair or remove `review:mutation:critical`.
7. Add `import "server-only"` consistently to sensitive server files where it is meaningful.
8. Run a dedicated `middleware` -> `proxy` Cloudflare proof lane only after the above launch blockers are clean.

## Merge / launch recommendation

For normal development: safe to continue on this base.

For public launch: no-go until the two P1 findings are resolved and re-verified.
