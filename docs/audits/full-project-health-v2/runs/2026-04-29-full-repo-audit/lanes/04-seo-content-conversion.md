# Lane 04 - SEO / Content / Conversion

## Verdict

This is the highest-risk lane.

Local i18n and page metadata implementation are mostly in good shape, but two buyer-facing launch issues remain:

1. `/en/contact` can render duplicate canonical and hreflang tags under the current E2E production-start environment.
2. Public content still contains placeholder phone and product/trust assets.

These are not "code cannot run" issues. They are "do not call this fully ready for public launch" issues.

## Commands and runtime evidence

| Command | Result |
| --- | --- |
| `pnpm review:translation-quartet` | passed; split translation shape valid |
| `pnpm review:translate-compat` | passed; 13 files / 176 tests passed |
| `CI=1 pnpm exec playwright test tests/e2e/seo-validation.spec.ts --project=chromium --grep "Contact"` | failed; duplicate canonical/hreflang on Contact |
| Manual Playwright DOM probe under E2E-like env | confirmed `/en/contact` has 2 canonical and 2 sets of alternates |

## Contact SEO duplication evidence

The targeted E2E run failed:

- `locator('link[rel="canonical"]') resolved to 2 elements`
- first canonical: `http://localhost:3000/en/contact`
- second canonical: `https://tianze-pipe.com/en/contact`
- `link[rel="alternate"][hreflang="en"]` also resolved to 2 elements with the same localhost/production split.

Manual DOM probe under E2E-like `pnpm start` env showed:

- `/en`, `/en/products`, `/en/products/north-america`: one local canonical set.
- `/en/about`: one production canonical set.
- `/en/contact`: one local canonical set plus one production canonical set.

The static artifact `.next/server/app/en/contact.html` contains the localhost canonical set, while runtime metadata can add the production canonical set. This matches the Next.js 16 docs behavior that dynamic pages can stream metadata separately.

## Placeholder launch content evidence

Confirmed placeholders:

- `src/config/single-site.ts:50-52` uses `+86-518-0000-0000`.
- `src/config/single-site.ts:129-140` labels brand asset paths as intentional placeholders.
- `public/images/products/sample-product.svg:31-35` says "Sample Product" and "Replace this image with your real product photo".
- Product specs reference `sample-product.svg` in 10 product-family image slots.

## Findings owned by this lane

- `FPH-001`: Contact page has duplicate SEO canonical/hreflang links under E2E production-start env.
- `FPH-002`: Public buyer-facing content still contains placeholder contact and product/trust assets.

## Blocked proof

Not proven:

- Google Search Console coverage.
- URL Inspection status.
- CrUX field performance.
- Rich-result eligibility in Google-side tooling.

## Evidence artifacts

- `evidence/04-seo-content-conversion/i18n-shape-report.json`

