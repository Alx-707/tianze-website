# Structural Hotspots Report

- Window: last 180 days
- Commits analyzed: 167
- Unique files touched: 1096

## Top File Hotspots

| Rank | File | Commit Touches |
|---|---|---:|
| 1 | `package.json` | 47 |
| 2 | `messages/en/critical.json` | 22 |
| 3 | `messages/zh/critical.json` | 22 |
| 4 | `messages/en.json` | 20 |
| 5 | `messages/zh.json` | 20 |
| 6 | `src/app/[locale]/contact/page.tsx` | 18 |
| 7 | `src/app/[locale]/products/[market]/page.tsx` | 17 |
| 8 | `src/app/[locale]/layout.tsx` | 15 |
| 9 | `src/app/api/contact/route.ts` | 15 |
| 10 | `src/app/api/inquiry/route.ts` | 15 |
| 11 | `src/app/api/subscribe/route.ts` | 15 |
| 12 | `src/app/api/contact/__tests__/route.test.ts` | 14 |
| 13 | `src/app/globals.css` | 14 |
| 14 | `src/lib/idempotency.ts` | 14 |
| 15 | `scripts/quality-gate.js` | 13 |
| 16 | `src/lib/security/client-ip.ts` | 13 |
| 17 | `.github/workflows/ci.yml` | 12 |
| 18 | `messages/en/deferred.json` | 12 |
| 19 | `messages/zh/deferred.json` | 12 |
| 20 | `next.config.ts` | 12 |
| 21 | `src/app/__tests__/actions.test.ts` | 12 |
| 22 | `src/app/[locale]/products/page.tsx` | 12 |
| 23 | `src/lib/actions/contact.ts` | 12 |
| 24 | `src/lib/load-messages.ts` | 12 |
| 25 | `src/app/[locale]/contact/__tests__/page.test.tsx` | 11 |

## Top Directory Hotspots

| Rank | Directory | Touches |
|---|---|---:|
| 1 | `src/components` | 940 |
| 2 | `src/lib` | 809 |
| 3 | `src/app` | 602 |
| 4 | `src/types` | 121 |
| 5 | `src/config` | 115 |
| 6 | `src/constants` | 92 |
| 7 | `scripts/cloudflare` | 61 |
| 8 | `src/test` | 48 |
| 9 | `package.json` | 47 |
| 10 | `messages/en` | 34 |
| 11 | `messages/zh` | 34 |
| 12 | `.github/workflows` | 31 |
| 13 | `src/sites` | 25 |
| 14 | `src/hooks` | 24 |
| 15 | `messages/en.json` | 20 |

## Logical Coupling Pairs

| Rank | File A | File B | Co-Changes | Support | Jaccard |
|---|---|---|---:|---:|---:|
| 1 | `messages/en/critical.json` | `messages/zh/critical.json` | 22 | 1 | 1 |
| 2 | `messages/en.json` | `messages/zh.json` | 20 | 1 | 1 |
| 3 | `messages/en.json` | `messages/en/critical.json` | 18 | 0.9 | 0.75 |
| 4 | `messages/en.json` | `messages/zh/critical.json` | 18 | 0.9 | 0.75 |
| 5 | `messages/en/critical.json` | `messages/zh.json` | 18 | 0.9 | 0.75 |
| 6 | `messages/zh.json` | `messages/zh/critical.json` | 18 | 0.9 | 0.75 |
| 7 | `src/app/api/inquiry/route.ts` | `src/app/api/subscribe/route.ts` | 15 | 1 | 1 |
| 8 | `messages/en/deferred.json` | `messages/zh/deferred.json` | 12 | 1 | 1 |
| 9 | `src/app/api/contact/route.ts` | `src/app/api/inquiry/route.ts` | 12 | 0.8 | 0.667 |
| 10 | `src/app/api/contact/route.ts` | `src/app/api/subscribe/route.ts` | 12 | 0.8 | 0.667 |
| 11 | `src/components/sections/final-cta.tsx` | `src/components/sections/hero-section.tsx` | 10 | 0.909 | 0.833 |
| 12 | `package.json` | `scripts/ci-local.sh` | 9 | 1 | 0.191 |
| 13 | `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx` | `src/app/[locale]/products/[market]/page.tsx` | 9 | 1 | 0.529 |
| 14 | `src/components/sections/final-cta.tsx` | `src/components/sections/sample-cta.tsx` | 9 | 1 | 0.818 |
| 15 | `package.json` | `src/lib/env.ts` | 9 | 0.9 | 0.188 |
| 16 | `scripts/cloudflare/build-phase6-workers.mjs` | `scripts/cloudflare/deploy-phase6.mjs` | 9 | 0.9 | 0.818 |
| 17 | `src/app/api/contact/__tests__/contact-api-validation.test.ts` | `src/app/api/contact/route.ts` | 9 | 0.9 | 0.563 |
| 18 | `src/app/api/contact/__tests__/route-post.test.ts` | `src/app/api/contact/__tests__/route.test.ts` | 9 | 0.9 | 0.6 |
| 19 | `src/components/sections/quality-section.tsx` | `src/components/sections/scenarios-section.tsx` | 9 | 0.9 | 0.75 |
| 20 | `src/lib/idempotency.ts` | `src/lib/security/distributed-rate-limit.ts` | 9 | 0.9 | 0.6 |
| 21 | `messages/en/critical.json` | `messages/en/deferred.json` | 9 | 0.75 | 0.36 |
| 22 | `messages/en/critical.json` | `messages/zh/deferred.json` | 9 | 0.75 | 0.36 |
| 23 | `messages/en/deferred.json` | `messages/zh/critical.json` | 9 | 0.75 | 0.36 |
| 24 | `messages/zh/critical.json` | `messages/zh/deferred.json` | 9 | 0.75 | 0.36 |
| 25 | `next.config.ts` | `package.json` | 9 | 0.75 | 0.18 |

## Interpretation Notes

- High file-touch count suggests frequent change, not necessarily poor quality by itself.
- Coupling pairs indicate files that often move together in the same commit history window.
- Use this artifact together with architecture rules and runtime critical-path analysis.
