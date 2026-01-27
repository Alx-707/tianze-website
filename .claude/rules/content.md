---
paths:
  - "content/**/*.mdx"
---

# MDX Content System

## Directory Structure

```
content/
├── config/content.json    # Global settings
├── posts/{locale}/*.mdx   # Blog posts
├── pages/{locale}/*.mdx   # Static pages
└── products/{locale}/*.mdx # Products (B2B)
```

**Rule**: Every file must exist in both `en/` and `zh/` with **identical `slug`**.

## Frontmatter

### Required Fields (All Types)

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

### Products (B2B)

| Field | Purpose |
|-------|---------|
| `coverImage`, `images[]` | Gallery |
| `category`, `tags` | Classification |
| `moq` | Minimum Order Quantity |
| `leadTime` | Production/shipping time |
| `supplyCapacity` | Monthly capacity |
| `certifications[]` | CE, ISO, etc. |
| `specs` | Technical specifications (key-value) |
| `relatedProducts[]` | Other product slugs |

## Creating Content

1. Create `content/{type}/en/my-slug.mdx`
2. Create `content/{type}/zh/my-slug.mdx` (same slug)
3. Set `draft: true` for WIP content

## Querying

```typescript
import { getAllPosts, getPostBySlug } from '@/lib/content-query/queries';

const posts = getAllPosts('en');
const post = getPostBySlug('my-post', 'en'); // slug first, then locale
```

## Images

- Store: `public/images/`
- Reference: `/images/blog/cover.jpg` (absolute path)

## Validation

Frontmatter validated at build time via `src/types/content.ts`.
