# Full Project Health Audit v2 - Evidence Log

Run id: `2026-04-29-full-repo-audit`

## Preflight evidence

- `origin/main`: `0bf6db0b5345c02aaa3d5c3c23f7fccd0c666a78`
- `HEAD`: `0bf6db0b5345c02aaa3d5c3c23f7fccd0c666a78`
- Initial audit worktree: clean.
- Node: `v24.15.0`
- pnpm: `10.13.1`
- Audit config validator: passed.

## Command evidence

| Command | Result | Important output |
| --- | --- | --- |
| `pnpm type-check` | passed | no TypeScript errors |
| `pnpm lint:check` | passed | eslint-disable check OK |
| `pnpm test` | passed | 324 files / 4307 tests |
| `pnpm build` | passed with warning | Next build passed; middleware convention deprecated |
| `CF_APPLY_GENERATED_PATCH=true pnpm build:cf` | passed with warning | OpenNext build complete |
| `pnpm truth:check` | passed | all links resolve; no orphaned files |
| `pnpm unused:check` | passed | no blocking output |
| `pnpm dep:check` | passed | no dependency violations |
| `pnpm security:semgrep` | passed | 0 error, 0 warning findings |
| `pnpm security:audit` | passed | no known vulnerabilities |
| `pnpm quality:gate:fast` | passed | Code Quality and Security passed |
| `pnpm review:translation-quartet` | passed | 1187 keys each locale; shape check 6/6 |
| `pnpm review:translate-compat` | passed | 13 files / 176 tests |
| `pnpm review:architecture-truth` | passed | config, legacy, boundary, contract, env, template checks passed |
| `pnpm arch:metrics` | passed | Export * 1; TypeScript 0; ESLint 0; files 615 |
| `pnpm arch:hotspots` | passed | 205 commits analyzed; 1130 files touched |
| `pnpm validate:config` | passed | production config validation passed despite buyer-facing placeholders still being present |
| `CI=1 pnpm test:release-smoke` | passed | 45 passed |
| `CI=1 pnpm exec playwright test tests/e2e/seo-validation.spec.ts --project=chromium --grep "Contact"` | failed | 2 failed due duplicate SEO links |
| `pnpm review:mutation:critical` | failed | missing `scripts/review-mutation-critical.js` |

## Tier-A/B/C line review evidence

| Check | Result | Important output |
| --- | --- | --- |
| `rg -n "<main\\b" src/app src/components --glob '!**/__tests__/**'` | 11 runtime declarations | layout owns `<main id="main-content">`; contact/products/product-market/about/legal/OEM/fallback shells also render `<main>` |
| `rg -n "getByRole\\(\"main\"\\)|getByRole\\('main'\\)|toHaveCount\\(1\\).*main|main.*toHaveCount\\(1\\)" src tests --glob '*.{ts,tsx}'` | existence-only tests found | tests assert `main` exists; no current test asserts exactly one composed main landmark |
| `rg -n "\\+86-518-0000-0000" src/config content/pages messages src/lib/__tests__ --glob '!src/lib/content-manifest.generated.ts'` | placeholder phone found | public config, generated messages, Terms content, and structured-data tests still contain the fake phone |
| `rg -n "/images/products/sample-product\\.svg|Sample Product|Replace this image" src/constants/product-specs public/images/products --glob '!**/__tests__/**'` | placeholder product asset found | 10 product-family image slots point to the sample product SVG; the SVG contains public replacement text |
| package script missing-file scan | one missing script | only `review:mutation:critical -> scripts/review-mutation-critical.js` was found missing among simple script-file references |

## Runtime probes

Manual DOM probe under E2E-like `pnpm start` environment:

| Path | Observed canonical/hreflang state |
| --- | --- |
| `/en` | one localhost canonical set |
| `/en/about` | one production canonical set |
| `/en/products` | one localhost canonical set |
| `/en/products/north-america` | one localhost canonical set |
| `/en/contact` | two sets: localhost and production |

Initial HTML for `/en/contact` via `curl` showed only the localhost set. Browser DOM after runtime execution showed the duplicate set, matching a metadata streaming/runtime update issue.

## Generated/copy evidence

- `evidence/00-baseline-runtime/quality-gate-fast-1777481549643.json`
- `evidence/00-baseline-runtime/release-smoke-playwright-results.json`
- `evidence/01-architecture-coupling/dependency-conformance-1777481527662.md`
- `evidence/01-architecture-coupling/metrics-1777481590975.md`
- `evidence/01-architecture-coupling/structural-hotspots-1777481591995.md`
- `evidence/02-security-trust-boundary/semgrep-error-1777481534019.json`
- `evidence/02-security-trust-boundary/semgrep-warning-1777481534019.json`
- `evidence/03-ui-performance-accessibility/lighthouse-en-run1.json`
- `evidence/03-ui-performance-accessibility/lighthouse-zh-run1.json`
- `evidence/04-seo-content-conversion/i18n-shape-report.json`

## Blocked evidence

- Cloudflare preview and deployed smoke: blocked by credential/deploy context.
- Google Search Console / URL Inspection / CrUX: blocked by external credentials/data.
- Resend and Airtable delivery proof: blocked by external service credentials/dashboard access.
