# Structured Data / JSON-LD

## Canonical builder rule

All schema objects are built in `src/lib/structured-data-generators.ts`.

Pages and component shells may render `<JsonLdScript>`, but they must not hand-roll objects with `"@context": "https://schema.org"` inline. This keeps escaping, schema shape, and ownership reviewable in one place.

## Injection points

- Layout level (`src/app/[locale]/layout.tsx`): site-wide identity only, currently Organization and WebSite.
- Page level: page-specific schemas such as FAQPage, Article, ProductGroup, AboutPage, WebPage, ItemList, and BreadcrumbList.
- Component shell level: allowed only when the shell is the page-level rendering owner, and the schema still comes from `structured-data-generators.ts`.

## FAQ schema

FAQ content comes from page-owned MDX frontmatter whenever the page has an MDX source. Convert FAQ items to JSON-LD with `generateFaqSchemaFromItems()` from `src/lib/content/mdx-faq.ts`.

Do not add a second FAQ schema helper for the same item shape.
