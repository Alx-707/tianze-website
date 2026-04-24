# Content Architecture — Four-Layer Rule

Every content field has exactly one canonical authoring source. Runtime-derived outputs (TOC from headings, JSON-LD from frontmatter, metadata composed from multiple layers) are not authoring duplication.

## Layer 1: Company Identity — single-site.ts

Company name, address, contact, established year, employee count, certifications, export countries, social links. First file to replace for a new brand.

## Layer 2: Page Expression — src/config/single-site-page-expression.ts

Structural switches and pointers only. "About page shows FAQ = yes" belongs here. FAQ content does not. Second file to replace.

`src/config/single-site-seo.ts` owns crawl/indexing policy such as sitemap priorities and robots rules. It is not page prose.

## Layer 3: Page Content — content/pages/{locale}/*.mdx

All substantive page content: prose, hero copy, FAQ Q&A (in frontmatter), page-level metadata (title, SEO description, dates). If it must be rewritten when changing brands, it belongs here. Third set to replace.

**Exception:** Structured card data (equipment specs, product catalog, OEM scope/process cards, bending machine specification/process cards) stays in typed config with i18n.
OEM and bending machine pages are mixed structured pages: MDX owns FAQ and SEO metadata, while card grids, process steps, standards, and CTA modules remain in their translation namespaces.

**FAQ rule:** Each page owns its FAQ in its own MDX frontmatter. No shared FAQ pool.

## Layer 4: UI Chrome — messages/{locale}/*.json

Cross-page reusable interface text only: nav items, button labels, form labels, generic indicators. If it survives a brand change unchanged, it belongs here.

## SEO Metadata Ownership

| Field | Owner | Fallback |
|-------|-------|----------|
| title | MDX frontmatter (L3) | single-site.ts (L1) |
| description | MDX frontmatter (L3) | single-site.ts (L1) |
| keywords | Page shell / SEO helper | single-site.ts |
| openGraph image | Page-specific or central | /images/og-image.jpg |
| canonical/alternates | Route-level URL generator | — |
| structured data | Page shell + generators | Layout-level Organization + WebSite |
| sitemap lastmod | MDX updatedAt (most recent across locales) | — |

seo.pages.* translation keys are eliminated. Page SEO reads from MDX frontmatter.

## Boundary Quick Reference

| Content | Layer | Rationale |
|---------|-------|-----------|
| Page title | 3 — MDX frontmatter | Changes with brand |
| "Table of Contents" label | 4 — Translation | Cross-page UI |
| FAQ questions and answers | 3 — MDX frontmatter | Changes with brand |
| "Show FAQ section" toggle | 2 — Page expression | Structural switch |
| Company email | 1 — Identity | Site-wide fact |
| "Submit Inquiry" button | 4 — Translation | Generic UI |
| Equipment spec highlights | Structured config + i18n | Card data, not prose |

## MDX Directory Structure

content/
├── pages/{locale}/*.mdx    — One file per page per locale
└── posts/{locale}/*.mdx    — Blog posts

## Frontmatter Schema

All pages: locale, title, slug, description, publishedAt, updatedAt, lastReviewed, draft, seo (title, description, keywords, ogImage).

Legal pages add: layout: 'legal', showToc: true.

Pages with FAQ add: faq[] array with { id, question, answer } items.

About page adds: heroTitle, heroSubtitle, heroDescription.

## Non-Authoring Context

Generated or planning-only context under `docs/cwf/context/**` is an implementation detail. It can help explain or audit work, but it must not become a content authoring source.
