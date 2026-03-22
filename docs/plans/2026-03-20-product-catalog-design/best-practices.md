# Best Practices: Product Catalog Page Structure

## Next.js 16 / App Router

- All pages are async Server Components using `getTranslations` from next-intl
- `generateStaticParams` on every dynamic route for full SSG
- `notFound()` for invalid param combinations (defense-in-depth)
- Props use `params: Promise<{...}>` per Next.js 16 async convention

## Routing

- Dynamic segments `[market]` and `[family]` validated against catalog config
- No collision with existing `[slug]` route — enforced by non-overlapping generateStaticParams
- URL slugs are English-only, locale-independent (consistent with project convention)

## Component Architecture

- Server Components first — no "use client" on catalog pages
- Shadow-card system from `globals.css` for cards (consistent with homepage)
- Reuse existing `SectionHead` component for page headers
- Breadcrumb wraps existing shadcn/ui Breadcrumb components

## SEO

- Each page generates metadata via `generateMetadataForPath`
- BreadcrumbList JSON-LD on every page
- URL contains keywords: market slug + family slug
- Standard labels in page titles for standard-term search capture

## i18n

- Page titles use `getTranslations` — translation keys added per page
- URL path segments stay English across locales (project convention)
- Catalog config labels are English defaults; i18n keys replace them in rendering
- Market-specific terminology (sweep vs bend) handled naturally by per-market family labels

## Performance

- Config constants are compile-time — zero runtime fetch
- All pages fully static (no dynamic data in skeleton phase)
- Existing cache layer untouched — ready for content integration later

## Testing

- BDD specs cover: navigation flow, 404 handling, locale support, static generation, breadcrumbs
- Unit tests for catalog config helpers (isValidMarketSlug, isValidMarketFamilyCombo, etc.)
- Integration tests for page rendering with mocked translations

## Security

- No user input in catalog routes — all params validated against static config
- No API endpoints added
- No form submissions on catalog pages (inquiry CTA links to existing /contact)

## Accessibility

- Semantic heading hierarchy (h1 per page, h2 per card)
- Breadcrumb uses `nav` landmark with `aria-label`
- Cards have clear link text (not "Read more")
- Focus indicators on all interactive elements (consistent with homepage fixes)
