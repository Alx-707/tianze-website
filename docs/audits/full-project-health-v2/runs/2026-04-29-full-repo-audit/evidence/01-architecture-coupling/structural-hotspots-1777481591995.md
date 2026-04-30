# Structural Hotspots Report

- Window: last 180 days
- Commits analyzed: 205
- Unique files touched: 1130

## Top File Hotspots

| Rank | File | Commit Touches |
|---|---|---:|
| 1 | `package.json` | 66 |
| 2 | `messages/en/critical.json` | 25 |
| 3 | `messages/zh/critical.json` | 25 |
| 4 | `messages/en.json` | 23 |
| 5 | `messages/zh.json` | 23 |
| 6 | `src/app/[locale]/contact/page.tsx` | 20 |
| 7 | `src/app/[locale]/products/[market]/page.tsx` | 20 |
| 8 | `.github/workflows/ci.yml` | 19 |
| 9 | `src/app/[locale]/layout.tsx` | 17 |
| 10 | `scripts/quality-gate.js` | 16 |
| 11 | `src/app/api/subscribe/route.ts` | 16 |
| 12 | `messages/en/deferred.json` | 15 |
| 13 | `messages/zh/deferred.json` | 15 |
| 14 | `src/app/api/contact/route.ts` | 15 |
| 15 | `src/app/api/inquiry/route.ts` | 15 |
| 16 | `src/app/globals.css` | 15 |
| 17 | `src/app/[locale]/contact/__tests__/page.test.tsx` | 14 |
| 18 | `src/app/api/contact/__tests__/route.test.ts` | 14 |
| 19 | `src/lib/idempotency.ts` | 14 |
| 20 | `next.config.ts` | 13 |
| 21 | `src/app/[locale]/products/page.tsx` | 13 |
| 22 | `src/lib/security/client-ip.ts` | 13 |
| 23 | `src/app/__tests__/actions.test.ts` | 12 |
| 24 | `src/components/layout/mobile-navigation.tsx` | 12 |
| 25 | `src/components/sections/final-cta.tsx` | 12 |

## Top Directory Hotspots

| Rank | Directory | Touches |
|---|---|---:|
| 1 | `src/components` | 1021 |
| 2 | `src/lib` | 873 |
| 3 | `src/app` | 652 |
| 4 | `src/config` | 144 |
| 5 | `src/types` | 121 |
| 6 | `src/constants` | 100 |
| 7 | `package.json` | 66 |
| 8 | `scripts/cloudflare` | 62 |
| 9 | `src/test` | 50 |
| 10 | `.github/workflows` | 43 |
| 11 | `messages/en` | 40 |
| 12 | `messages/zh` | 40 |
| 13 | `src/hooks` | 26 |
| 14 | `src/i18n` | 25 |
| 15 | `src/sites` | 25 |

## Logical Coupling Pairs

| Rank | File A | File B | Co-Changes | Support | Jaccard |
|---|---|---|---:|---:|---:|
| 1 | `messages/en/critical.json` | `messages/zh/critical.json` | 25 | 1 | 1 |
| 2 | `messages/en.json` | `messages/zh.json` | 23 | 1 | 1 |
| 3 | `messages/en.json` | `messages/en/critical.json` | 21 | 0.913 | 0.778 |
| 4 | `messages/en.json` | `messages/zh/critical.json` | 21 | 0.913 | 0.778 |
| 5 | `messages/en/critical.json` | `messages/zh.json` | 21 | 0.913 | 0.778 |
| 6 | `messages/zh.json` | `messages/zh/critical.json` | 21 | 0.913 | 0.778 |
| 7 | `messages/en/deferred.json` | `messages/zh/deferred.json` | 15 | 1 | 1 |
| 8 | `src/app/api/inquiry/route.ts` | `src/app/api/subscribe/route.ts` | 15 | 1 | 0.938 |
| 9 | `messages/en/critical.json` | `messages/en/deferred.json` | 12 | 0.8 | 0.429 |
| 10 | `messages/en/critical.json` | `messages/zh/deferred.json` | 12 | 0.8 | 0.429 |
| 11 | `messages/en/deferred.json` | `messages/zh/critical.json` | 12 | 0.8 | 0.429 |
| 12 | `messages/zh/critical.json` | `messages/zh/deferred.json` | 12 | 0.8 | 0.429 |
| 13 | `src/app/api/contact/route.ts` | `src/app/api/inquiry/route.ts` | 12 | 0.8 | 0.667 |
| 14 | `src/app/api/contact/route.ts` | `src/app/api/subscribe/route.ts` | 12 | 0.8 | 0.632 |
| 15 | `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx` | `src/app/[locale]/products/[market]/page.tsx` | 11 | 1 | 0.55 |
| 16 | `messages/en.json` | `messages/en/deferred.json` | 11 | 0.733 | 0.407 |
| 17 | `messages/en.json` | `messages/zh/deferred.json` | 11 | 0.733 | 0.407 |
| 18 | `messages/en/deferred.json` | `messages/zh.json` | 11 | 0.733 | 0.407 |
| 19 | `messages/zh.json` | `messages/zh/deferred.json` | 11 | 0.733 | 0.407 |
| 20 | `package.json` | `scripts/quality-gate.js` | 11 | 0.688 | 0.155 |
| 21 | `package.json` | `scripts/ci-local.sh` | 10 | 1 | 0.152 |
| 22 | `src/components/sections/final-cta.tsx` | `src/components/sections/sample-cta.tsx` | 10 | 1 | 0.833 |
| 23 | `src/components/sections/quality-section.tsx` | `src/components/sections/scenarios-section.tsx` | 10 | 0.909 | 0.769 |
| 24 | `src/components/sections/final-cta.tsx` | `src/components/sections/hero-section.tsx` | 10 | 0.833 | 0.714 |
| 25 | `src/app/[locale]/products/[market]/page.tsx` | `src/app/[locale]/products/page.tsx` | 10 | 0.769 | 0.435 |

## Interpretation Notes

- High file-touch count suggests frequent change, not necessarily poor quality by itself.
- Coupling pairs indicate files that often move together in the same commit history window.
- Use this artifact together with architecture rules and runtime critical-path analysis.
