# Lane 04 - SEO / Content / Conversion

## 1. Scope

Lane 04 reviewed the current `origin/main` clean baseline for local SEO implementation, buyer-facing content, and inquiry conversion.

Included:

- metadata, sitemap, robots, canonical, hreflang
- structured data
- product content and multilingual content
- page titles and public copy consistency
- inquiry CTA and contact path
- buyer trust assets, company intro, certificates, factory / quality proof

Not included:

- final repo verdict
- business-code fixes
- build / Cloudflare build / deploy
- Google dashboard facts without credentials

Local implementation answer:

- Google can likely understand the main local page structure from the current implementation: sitemap, robots, canonical, hreflang, metadata, and JSON-LD are present and targeted SEO tests passed.
- This does **not** prove Google has crawled, indexed, ranked, or reported those URLs. All Google-side facts are blocked without credentials or external data.

Google-data lane: Blocked / Credentials unavailable

Required SEO data separation:

| Data source | Status | Blocker / evidence |
| --- | --- | --- |
| PageSpeed Lighthouse lab data | Blocked | `perf:lighthouse` exists, but Lane 04 was prohibited from `pnpm build`; no already-running production server was provided. Running LHCI would require a built app / start server path outside this lane's safe proof boundary. |
| CrUX field data | Blocked | No CrUX API/browser field dataset credential or export was provided. |
| Search Console data | Blocked | No Google Search Console access was provided. |
| URL Inspection data | Blocked | No Google URL Inspection API/dashboard access was provided. |

## 2. Fresh Evidence Collected

| Evidence ID | Type | Exact reference | Result | Notes |
| --- | --- | --- | --- | --- |
| E-L04-001 | command | `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/targeted-seo-vitest.txt` | 6 SEO-related test files passed, 64 tests passed | Confirms current sitemap, robots, metadata, and layout structured-data tests pass locally. |
| E-L04-002 | file | `src/app/sitemap.ts:38-45`, `src/app/sitemap.ts:82-93`, `src/app/sitemap.ts:104-117` | Sitemap generates locale URLs with language alternates for static and product market pages | Local implementation proof only, not Google crawl proof. |
| E-L04-003 | file | `src/lib/seo-metadata.ts:55-79`, `src/lib/seo-metadata.ts:215-241` | Page-aware canonical, hreflang, and OG URL are derived from actual route path | Good local SEO foundation. |
| E-L04-004 | file | `src/app/robots.ts:12-22`, `src/config/single-site-seo.ts:65-69` | Robots allows `/`, disallows API, `_next`, and error-test, and points to sitemap | Good local crawl-policy implementation. |
| E-L04-005 | file | `src/app/[locale]/products/[market]/page.tsx:302-317`, `src/app/[locale]/products/[market]/page.tsx:343-361`, `src/app/[locale]/products/[market]/page.tsx:455` | Product market pages emit ProductGroup, breadcrumb, and optional FAQ JSON-LD | Local structured-data proof only. |
| E-L04-006 | file | `src/config/single-site.ts:49-52`, `src/app/[locale]/contact/page.tsx:96-120`, `content/pages/en/terms.mdx:288` | Public contact surfaces use `+86-518-0000-0000` | Placeholder-looking phone is buyer-facing. |
| E-L04-007 | command | `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/public-asset-existence.txt` | `public/certs/iso9001.pdf` is missing | Config declares `/certs/iso9001.pdf`, but public asset is absent. |
| E-L04-008 | file | `public/images/products/sample-product.svg:31-36`, `src/constants/product-specs/north-america.ts:73`, `src/constants/product-specs/north-america.ts:114`, `src/constants/product-specs/australia-new-zealand.ts:70`, `src/constants/product-specs/australia-new-zealand.ts:107`, `src/constants/product-specs/australia-new-zealand.ts:144`, `src/constants/product-specs/mexico.ts:65`, `src/constants/product-specs/mexico.ts:98`, `src/constants/product-specs/europe.ts:72`, `src/constants/product-specs/europe.ts:118`, `src/constants/product-specs/pneumatic-tube-systems.ts:71` | Many product families use the sample placeholder image | The SVG itself tells maintainers to replace it with a real product photo. |
| E-L04-009 | file | `messages/en/critical.json:297`, `content/pages/en/product-market.mdx:48-52`, `src/config/single-site-product-catalog.ts:20-23`, `src/constants/product-specs/australia-new-zealand.ts:11-14` | Public copy alternates between `AS/NZS 61386` and `AS/NZS 2053` | Standards wording is inconsistent on buyer-facing pages. |
| E-L04-010 | file | `src/app/[locale]/products/[market]/page.tsx:502-507`, `src/components/products/product-actions.tsx:121-207`, `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/conversion-trust-static-scan.txt` | Market pages use one generic bottom CTA to `/contact`; product inquiry drawer exists but is not wired into live product pages | Conversion issue, not a broken inquiry path. |

## 3. Commands Run

| Command | Result | Classification |
| --- | --- | --- |
| `pwd && git status --short && git rev-parse HEAD && git rev-parse origin/main` | passed | required |
| `sed -n '1,220p' docs/audits/full-project-health-v1/execution-package/README.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/execution-package/00-preflight-contract.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/execution-package/01-report-contract.md` | passed | required |
| `sed -n '1,240p' docs/audits/full-project-health-v1/execution-package/04-stop-lines.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/execution-package/03-worker-prompts/_lane-report-template.md` | passed | required |
| `sed -n '1,320p' docs/audits/full-project-health-v1/execution-package/03-worker-prompts/lane-04-seo-content-conversion.md` | passed | required |
| `sed -n '1,260p' docs/audits/full-project-health-v1/evidence/preflight.md` | passed | required |
| `sed -n '1,220p' docs/audits/full-project-health-v1/execution-package/06-self-review-checklist.md` | passed | diagnostic |
| `rg --files -g 'src/**' -g 'content/**' -g 'messages/**' -g 'public/**' -g 'next.config.*' -g 'middleware.*' -g 'app/**'` | passed | diagnostic |
| `rg -n "metadata|generateMetadata|sitemap|robots|canonical|alternates|hreflang|jsonLd|structured|schema.org|Organization|Product|Breadcrumb|WebSite|title|description|openGraph|twitter" src content messages public next.config.*` | passed | diagnostic |
| `rg -n "inquiry|quote|contact|CTA|certificate|certification|factory|quality|workshop|trust|ASTM|UL|ISO|buyer|export|sample|MOQ|lead|whatsapp|email|phone" src content messages public` | passed | diagnostic |
| `pnpm exec vitest run src/app/__tests__/sitemap.test.ts src/app/__tests__/robots.test.ts src/lib/__tests__/seo-metadata.test.ts src/config/__tests__/single-site-seo.test.ts 'src/app/[locale]/__tests__/layout-metadata.test.ts' 'src/app/[locale]/__tests__/layout-structured-data.test.ts' --reporter=basic` | failed | diagnostic |
| `pnpm exec vitest run src/app/__tests__/sitemap.test.ts src/app/__tests__/robots.test.ts src/lib/__tests__/seo-metadata.test.ts src/config/__tests__/single-site-seo.test.ts 'src/app/[locale]/__tests__/layout-metadata.test.ts' 'src/app/[locale]/__tests__/layout-structured-data.test.ts'` | passed | diagnostic |
| `rg -n "lighthouse|pagespeed|CrUX|Search Console|URL Inspection|lhci|google" package.json docs/audits/full-project-health-v1/evidence/preflight.md .github src` | passed | diagnostic |
| `pnpm run | rg -n "lighthouse|lhci|pagespeed|crux|search|inspection|seo"` | passed | diagnostic |
| `test -e public/certs/iso9001.pdf` | failed | diagnostic |
| `rg --files public | rg 'cert|iso|logo|og-image|sample-product|pvc-conduit|petg|bending-machine'` | passed | diagnostic |

The failed `--reporter=basic` command failed because Vitest 4 tried to load `basic` as a custom reporter module. The same targeted test set passed with the default reporter.

## 4. Findings

### FPH-L04-001: Buyer-facing contact phone is still placeholder-like

- Severity: P1
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: conversion
- Source lane: 04-seo-content-conversion
- Evidence:
  - type: file
    reference: `src/config/single-site.ts:49-52`
    summary: Canonical contact config sets phone to `+86-518-0000-0000`.
  - type: file
    reference: `src/app/[locale]/contact/page.tsx:96-120`
    summary: Contact page renders `siteFacts.contact.email` and `siteFacts.contact.phone` into the buyer-facing contact methods card.
  - type: file
    reference: `content/pages/en/terms.mdx:288`
    summary: Terms page also publishes the same phone number.
- Business impact: A real overseas buyer may see a fake-looking phone number at the exact moment they are deciding whether Tianze is real. That directly hurts trust and can lose inquiries.
- Root cause: Launch-facing business facts are centralized, but the validation only catches bracket-style placeholders. A numeric placeholder such as `0000-0000` passes as if it were real.
- Recommended fix: Replace the phone number with a verified sales number, or remove phone from public contact surfaces until the owner confirms it. Add a simple launch check for `0000`, `example`, placeholder phone patterns, and missing contact facts.
- Verification needed: Re-run a static placeholder scan and visit `/en/contact` plus `/en/terms` to confirm the displayed phone is real or absent by design.
- Suggested Linus Gate: Needs proof

### FPH-L04-002: ISO certificate is claimed with a file path, but the public PDF does not exist

- Severity: P1
- Evidence level: Confirmed by execution
- Confidence: high
- Domain: conversion
- Source lane: 04-seo-content-conversion
- Evidence:
  - type: file
    reference: `src/config/single-site.ts:109-114`
    summary: Site facts declare ISO 9001 certificate number `240021Q09730R0S` and file path `/certs/iso9001.pdf`.
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/public-asset-existence.txt`
    summary: `test -e public/certs/iso9001.pdf` returned `missing`.
  - type: file
    reference: `messages/en/critical.json:287-303`
    summary: Homepage quality copy displays ISO 9001 certification and says documentation, QC records, and project references are available during RFQ review.
- Business impact: The site asks buyers to trust a certificate claim but cannot provide the declared certificate file. For B2B procurement, this creates a credibility gap before inquiry.
- Root cause: Business proof data was modeled ahead of actual proof assets. The config carries a future file path without an asset-existence gate.
- Recommended fix: Either add the real certificate PDF and link it intentionally, or remove the file path and keep the copy request-based until documentation is approved for public download. Add an asset-existence check for every public proof file in `siteFacts`.
- Verification needed: Confirm `public/certs/iso9001.pdf` exists and is referenced from a buyer-facing page, or confirm there is no dead public certificate path after copy/config cleanup.
- Suggested Linus Gate: Needs proof

### FPH-L04-003: Product pages still depend on sample placeholder images for many live product families

- Severity: P1
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: conversion
- Source lane: 04-seo-content-conversion
- Evidence:
  - type: file
    reference: `public/images/products/sample-product.svg:31-36`
    summary: The SVG renders `Sample Product` and `Replace this image with your real product photo`.
  - type: file
    reference: `src/constants/product-specs/north-america.ts:73`, `src/constants/product-specs/north-america.ts:114`, `src/constants/product-specs/australia-new-zealand.ts:70`, `src/constants/product-specs/australia-new-zealand.ts:107`, `src/constants/product-specs/australia-new-zealand.ts:144`, `src/constants/product-specs/mexico.ts:65`, `src/constants/product-specs/mexico.ts:98`, `src/constants/product-specs/europe.ts:72`, `src/constants/product-specs/europe.ts:118`, `src/constants/product-specs/pneumatic-tube-systems.ts:71`
    summary: Multiple product families use `/images/products/sample-product.svg` as their live image.
  - type: file
    reference: `src/components/products/family-section.tsx:22-36`
    summary: Market product pages render the first configured image for each family.
- Business impact: Buyers cannot visually verify many products. For export B2B, photos are not decoration; they are basic trust and specification evidence.
- Root cause: Placeholder media was allowed to remain in the live product spec source without a launch gate.
- Recommended fix: Replace sample images with real product photos or product-specific technical illustrations. If photos are not ready, reduce the affected product cards instead of showing obvious placeholders.
- Verification needed: Static scan should return zero live references to `sample-product.svg` from product spec files; product pages should show product-specific media.
- Suggested Linus Gate: Needs proof

### FPH-L04-004: AS/NZS standard wording is inconsistent across public copy and product data

- Severity: P1
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: seo
- Source lane: 04-seo-content-conversion
- Evidence:
  - type: file
    reference: `messages/en/critical.json:297`
    summary: Homepage quality section labels AS/NZS as `AS/NZS 61386`.
  - type: file
    reference: `content/pages/en/product-market.mdx:48-52`
    summary: Product FAQ asks about `AS/NZS 61386` and describes it as IEC-style.
  - type: file
    reference: `src/config/single-site-product-catalog.ts:20-23`
    summary: Canonical product catalog defines Australia/New Zealand market as `AS/NZS 2053`.
  - type: file
    reference: `src/constants/product-specs/australia-new-zealand.ts:11-14`
    summary: Product specs also use `AS/NZS 2053` and list it as certification.
- Business impact: Standards inconsistencies confuse buyers and search engines. A procurement buyer checking compliance may read the homepage/FAQ and the product page as different claims.
- Root cause: Compliance copy lives in several places: homepage translations, MDX FAQ, product catalog, and typed specs. There is no single public standards vocabulary.
- Recommended fix: Pick one approved standards source for market labels and compliance wording, then generate or validate homepage copy, FAQ, and product specs against it.
- Verification needed: Re-run `rg -n "AS/NZS" src content messages` and confirm only approved wording remains in buyer-facing copy.
- Suggested Linus Gate: Simplify

### FPH-L04-005: Product-market pages have a generic contact CTA, not a product-specific inquiry path

- Severity: P2
- Evidence level: Confirmed by static evidence
- Confidence: high
- Domain: conversion
- Source lane: 04-seo-content-conversion
- Evidence:
  - type: file
    reference: `src/app/[locale]/products/[market]/page.tsx:502-507`
    summary: Market pages render one bottom CTA and send users to `SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION.marketLanding.ctaHref`.
  - type: file
    reference: `src/config/single-site-page-expression.ts:125-127`
    summary: The market landing CTA target is `/contact`.
  - type: file
    reference: `src/components/products/product-actions.tsx:121-207`
    summary: A product-specific quote drawer exists, but it is not used by live product market pages.
  - type: command
    reference: `docs/audits/full-project-health-v1/evidence/04-seo-content-conversion/conversion-trust-static-scan.txt`
    summary: Static scan found `ProductActions` usage in tests/component definitions, not live product page rendering.
- Business impact: The inquiry path still works, but it makes interested buyers leave the product context and retype what they want. That adds friction and weakens quote quality.
- Root cause: Product-specific inquiry UI was built as an isolated component but not integrated into the actual product-market page flow.
- Recommended fix: Add product/family-level inquiry entry points that prefill product family, market, and standard, or deliberately delete unused product-specific inquiry components if the business wants one generic contact form only.
- Verification needed: Visit a product market page and confirm each family has a clear quote action that preserves product context, or confirm unused inquiry components are removed.
- Suggested Linus Gate: Simplify

## 5. Blocked / Not Proven

| Claim | Blocker | Needed proof | Suggested classification |
| --- | --- | --- | --- |
| Google has indexed the important pages | No Search Console / URL Inspection access | Search Console indexing coverage or URL Inspection output for key URLs | Blocked |
| Google ranks the important pages for target buyer queries | No Search Console performance data | Search Console query / page performance export | Blocked |
| PageSpeed Lighthouse lab scores for current baseline | No safe built production server for this lane; `pnpm build` prohibited | Orchestrator-provided Lighthouse artifact, or Lane 00-owned built server plus LHCI run | Blocked |
| CrUX field performance for the domain | No CrUX data source / API result provided | CrUX API or PageSpeed field-data output for the origin/URLs | Blocked |
| URL-specific Google crawl/index state | No URL Inspection credential or export | URL Inspection results for `/en`, `/en/products`, `/en/contact`, and product market URLs | Blocked |
| `seo-technical`, `seo-page`, `seo-google` skill outputs | These skills are not available in the current skill list | Install/enable those skills or provide equivalent outputs | Blocked |
| Real inquiry delivery to email/CRM | Would require external service credentials and safe mutation boundary | Non-production Resend/Airtable proof owned by security/runtime lane | Blocked |

## 6. Handoff to Orchestrator

| Finding ID | Handoff action | Reason |
| --- | --- | --- |
| FPH-L04-001 | merge | High-confidence buyer trust issue; challenge only if owner confirms the phone number is intentionally masked before launch. |
| FPH-L04-002 | merge | Certificate proof gap is fresh and executable; dedupe with any security/trust finding about missing public assets. |
| FPH-L04-003 | merge | Direct product conversion blocker; dedupe with UI lane if they also report placeholder media. |
| FPH-L04-004 | merge | Clear SEO/content consistency issue; challenge exact approved standard wording with business owner. |
| FPH-L04-005 | keep | Medium-priority conversion friction; should not block basic launch if generic contact form is accepted. |

Suggested orchestrator challenges:

1. Decide whether `AS/NZS 61386` is an actual approved claim or a copy mistake; if unsure, treat `AS/NZS 2053` from product catalog/specs as the current repo truth until business proof says otherwise.
2. Decide whether the site may publicly expose certificate PDFs. If not, remove dead file-path claims rather than adding fake proof.
3. Decide whether product-specific inquiry is part of launch scope. If yes, wire it into the real pages; if no, delete the unused drawer/forms later to reduce dead conversion code.

## 7. Process Notes

- No business code, content, config, dependency, workflow, or public asset was intentionally modified.
- Wrote only Lane 04 report and Lane 04 evidence artifacts.
- Did not run `pnpm build`, `pnpm build:cf`, deploy commands, or production-mutating commands.
- Targeted Vitest run produced the repository's normal `reports/test-results.json` side effect, but `git status` did not show it as a tracked or untracked change.
- External Google data is explicitly blocked; this report does not claim indexing, ranking, Search Console, CrUX, or URL Inspection facts.
