# Lane 00 - Baseline / Runtime Truth

Run id: `2026-04-29-full-repo-audit`

## Verdict

Baseline is usable for a read-only audit. Local code, local build, Cloudflare/OpenNext bundle, unit tests, release smoke, security scans, i18n checks, and architecture guardrails are mostly green.

The important exception is SEO E2E on `/en/contact`: a targeted Chromium run reproduced duplicate canonical and hreflang tags.

## Preflight

| Item | Result |
| --- | --- |
| Target base | `origin/main` |
| `origin/main` | `0bf6db0b5345c02aaa3d5c3c23f7fccd0c666a78` |
| `HEAD` | `0bf6db0b5345c02aaa3d5c3c23f7fccd0c666a78` |
| Worktree | clean before report writing |
| Node | `v24.15.0` |
| pnpm | `10.13.1` |
| Audit config validation | passed |
| Business-code diff before audit | none |

## Commands run in this lane

| Command | Result | Notes |
| --- | --- | --- |
| `git rev-parse origin/main` | passed | matched `HEAD` |
| `git rev-parse HEAD` | passed | matched `origin/main` |
| `git status --short --branch` | passed | clean before report writing |
| `node -v` | passed | `v24.15.0` |
| `pnpm -v` | passed | `10.13.1` |
| `pnpm type-check` | passed | TypeScript clean |
| `pnpm lint:check` | passed | ESLint clean; eslint-disable check clean |
| `pnpm test` | passed | 324 files / 4307 tests passed |
| `pnpm build` | passed with warning | Next.js build passed; middleware convention warning remains |
| `CF_APPLY_GENERATED_PATCH=true pnpm build:cf` | passed with warning | OpenNext Cloudflare build complete; same middleware warning |
| `pnpm truth:check` | passed | 8 page routes, 5 API routes, 149 scripts; links resolve |
| `pnpm unused:check` | passed | no blocking output |
| `pnpm dep:check` | passed | no dependency violations |
| `pnpm arch:conformance` | passed | total violations 0 |
| `pnpm quality:gate:fast` | passed | Code Quality and Security passed; fast mode skipped coverage/performance |
| `CI=1 pnpm test:release-smoke` | passed | 45 Chromium smoke tests passed |
| `CI=1 pnpm exec playwright test tests/e2e/seo-validation.spec.ts --project=chromium --grep "Contact"` | failed | 3 passed, 2 failed due duplicate SEO links |

## Runtime proof boundary

Confirmed locally:

- Next.js production build.
- OpenNext Cloudflare bundle generation.
- Local Next server behavior under Playwright.
- Local Chromium smoke flows.
- Local Lighthouse results for `/en` and `/zh`.

Not confirmed in this run:

- Cloudflare preview page behavior.
- Cloudflare deployed production behavior.
- Google Search Console / URL Inspection / CrUX field data.
- Resend and Airtable real delivery state.

Those require credentials or external dashboards and are marked as blocked where relevant.

## Evidence artifacts

- `evidence/00-baseline-runtime/quality-gate-fast-1777481549643.json`
- `evidence/00-baseline-runtime/release-smoke-playwright-results.json`

