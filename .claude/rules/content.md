---
paths:
  - "content/**/*.mdx"
  - "src/constants/product-specs/**"
  - "src/constants/product-catalog.ts"
---

# Content System

The project uses two content strategies, chosen by content type:

| Strategy | Used for | Why |
|----------|----------|-----|
| **MDX** (`content/`) | Narrative content: blog posts, about, FAQ, legal pages | Free-form rich text, loose structure |
| **TypeScript constants** (`src/constants/`) | Product catalog: specs, markets, families | Structured data needing type safety + programmatic consumption |

**Decision rule**: If content is tabular/structured and consumed by multiple components → TypeScript. If content is narrative/editorial → MDX.

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

## TypeScript Product Catalog (`src/constants/`)

### Structure

```
src/constants/
├── product-catalog.ts              # Markets + families — single source of truth
├── product-standards.ts            # Certification standard IDs
└── product-specs/
    ├── types.ts                    # MarketSpecs, FamilySpecs, SpecGroup interfaces
    ├── north-america.ts            # Per-market spec data
    └── __tests__/
```

### Why not MDX for products

- Spec data (pipe sizes, wall thickness, schedules) is **tabular** — consumed by `SpecTable`, `StickyFamilyNav`, `FamilySection` components
- `product-catalog.ts` is queried by sitemap, breadcrumbs, static params, navigation — needs programmatic access
- Type safety catches data errors at compile time (missing fields, wrong slugs)
- Owner edits through Claude, so MDX's "non-technical-friendly" editing advantage doesn't apply

### Adding a new market's spec data

1. Create `src/constants/product-specs/{market-slug}.ts` following `north-america.ts` pattern
2. Export a `satisfies MarketSpecs` object
3. Register in `SPECS_BY_MARKET` in `src/app/[locale]/products/[market]/page.tsx`

### Key types

- `MarketSpecs` — technical props + certifications + trade terms + per-family specs
- `FamilySpecs` — images + highlights + spec groups (column/row tables)
- `MarketDefinition` / `ProductFamilyDefinition` — catalog structure in `product-catalog.ts`
