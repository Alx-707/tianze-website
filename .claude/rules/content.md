---
paths:
  - "content/**/*.mdx"
  - "src/constants/product-specs/**"
  - "src/constants/product-catalog.ts"
  - "src/sites/**"
---

# Content System

The project uses two content strategies, chosen by content type:

| Strategy | Used for | Why |
|----------|----------|-----|
| **MDX** (`content/`) | Narrative content: blog posts, FAQ, legal pages, supporting draft assets for routes like About | Free-form rich text, loose structure |
| **Site-layer TypeScript data** (`src/sites/**` + compatibility wrappers) | Product catalog, site identity, site-specific copy overlays | Structured data needing type safety + site-aware ownership |

**Decision rule**: If content is tabular/structured and consumed by multiple components → TypeScript. If content is narrative/editorial → MDX.

**Current exception**: `/about` runtime truth is the route component in `src/app/[locale]/about/page.tsx`, not direct MDX rendering. Treat `content/pages/*/about.mdx` as supporting draft assets unless the route is explicitly migrated.

---

## MDX Content (`content/`)

### Directory Structure

```
content/
├── config/content.json    # Global settings
├── posts/{locale}/*.mdx   # Blog posts
├── pages/{locale}/*.mdx   # Static pages (about, FAQ, privacy, terms)
└── _archive/products/     # Archived — replaced by TypeScript catalog
```

**Rule**: Every file must exist in both `en/` and `zh/` with **identical `slug`**.

### Frontmatter — Required Fields (All Types)

| Field | Type | Notes |
|-------|------|-------|
| `locale` | `'en' \| 'zh'` | Must match directory |
| `title` | string | |
| `slug` | string | URL path, identical across locales |
| `description` | string | |
| `publishedAt` | `YYYY-MM-DD` | |

### Posts Additional

| Field | Required | Notes |
|-------|----------|-------|
| `author` | ✅ | |
| `featured` | - | Homepage display |
| `draft` | - | Hide from production |
| `tags`, `categories` | - | |
| `seo.title`, `seo.description` | - | Override defaults |

### Creating Content

1. Create `content/{type}/en/my-slug.mdx`
2. Create `content/{type}/zh/my-slug.mdx` (same slug)
3. Set `draft: true` for WIP content

### Querying

```typescript
import { getAllPosts, getPostBySlug } from '@/lib/content-query/queries';

const posts = getAllPosts('en');
const post = getPostBySlug('my-post', 'en'); // slug first, then locale
```

### Images

- Store: `public/images/`
- Reference: `/images/blog/cover.jpg` (absolute path)

### Validation

Frontmatter validated at build time via `src/types/content.types.ts`.

---

## TypeScript Product Catalog (`src/sites/**` + wrappers)

### Structure

```
src/config/
├── single-site.ts                  # Site identity: brand, runtime toggles, feature flags
├── single-site-product-catalog.ts  # Markets + families — canonical product catalog truth
├── single-site-page-expression.ts  # Reusable page-expression inputs
├── single-site-seo.ts              # Sitemap / robots / public static page SEO defaults
├── site-facts.ts                   # Contact info, addresses, locale list
└── site-types.ts                   # Shared site type definitions

src/constants/
├── product-catalog.ts              # Compatibility wrapper to active site catalog
├── product-standards.ts            # Certification standard IDs
└── product-specs/
    ├── types.ts                    # MarketSpecs, FamilySpecs, SpecGroup interfaces
    ├── north-america.ts            # Per-market spec data
    └── __tests__/
```

### Why not MDX for products

- Spec data (pipe sizes, wall thickness, schedules) is **tabular** — consumed by `SpecTable`, `StickyFamilyNav`, `FamilySection` components
- `src/config/single-site*.ts` now owns the active single-site identity and catalog truth; `src/constants/product-catalog.ts` is a compatibility wrapper, not the place to invent new canonical market structure
- `product-catalog.ts` is still queried by sitemap, breadcrumbs, static params, navigation — needs programmatic access
- Type safety catches data errors at compile time (missing fields, wrong slugs)
- Owner edits through Claude, so MDX's "non-technical-friendly" editing advantage doesn't apply

### Adding a new market's spec data

1. Create `src/constants/product-specs/{market-slug}.ts` following `north-america.ts` pattern
2. Export a `satisfies MarketSpecs` object
3. Register in `SPECS_BY_MARKET` in `src/app/[locale]/products/[market]/page.tsx`

`SPECS_BY_MARKET` is an implementation detail in the route layer, not a canonical authoring surface like `src/config/single-site-page-expression.ts` or `src/config/single-site-seo.ts`.

### Key types

- `MarketSpecs` — technical props + certifications + trade terms + per-family specs
- `FamilySpecs` — images + highlights + spec groups (column/row tables)
- `MarketDefinition` / `ProductFamilyDefinition` — catalog structure in `product-catalog.ts`
