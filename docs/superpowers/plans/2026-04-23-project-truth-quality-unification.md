# Project-Wide Truth & Quality Unification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify all page content, FAQ, SEO metadata, and equipment specs under a four-layer rule system so that (a) editing any page's content requires touching one file, and (b) cloning this site for a new brand has a precise, ordered replacement path.

**Architecture:** Four canonical layers — Layer 1 (company identity in `single-site.ts`), Layer 2 (page assembly switches in `single-site-page-expression.ts`), Layer 3 (page content in MDX files under `content/pages/`), Layer 4 (UI chrome in `messages/` translation JSON). Each content field has exactly one authoring source. Runtime-derived outputs (TOC from headings, JSON-LD from frontmatter) are not duplication. The shared FAQ pool is decomposed into per-page MDX frontmatter. Equipment spec highlights become locale-aware. `seo.pages.*` translation keys are eliminated in favor of MDX frontmatter ownership.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5.9 strict, next-intl 4.8, Tailwind CSS 4.2, MDX content pipeline, Vitest, Cloudflare Pages (OpenNext adapter).

**Absorbs:** `docs/superpowers/plans/2026-04-23-content-truth-legal-about.md` (the existing legal+about plan is fully superseded by this document).

---

## Execution order

Three series, with Series 1 split into sequential batches:

```
Series 1 Batch A (rules + legal)  ──→  Series 1 Batch B (FAQ + about + contact)  ──→  Series 1 Batch C (equipment + SEO ownership + cleanup)
                                   │                                                │
                                   └── Series 2a (Tasks 19-21) after Batch A        └── Series 2b (Tasks 22-24) after Batch B
                                   
Series 3 (proof integrity) — independent, can run any time
```

**Batch A freezes the contracts that B and C depend on. Do not skip ahead.**

**Series 2 split:** Tasks 19-21 (product metadata, product schema, OG images) only need Batch A contracts. Tasks 22-24 (page-specific schema, sitemap lastmod) depend on pages having completed their MDX migration in Batch B.

---

## File structure

### Create

| File | Responsibility |
|------|---------------|
| `src/lib/content/legal-page.ts` | Typed legal page loader wrapping `getPageBySlug`, heading extraction, TOC builder |
| `src/components/content/legal-page-shell.tsx` | Shared legal page rendering shell (header, dates, TOC, article, JSON-LD) |
| `src/components/content/about-page-shell.tsx` | About page MDX rendering shell (hero, body, conditionally mounts FAQ/CTA/stats from Layer 1+2) |
| `src/lib/content/mdx-faq.ts` | FAQ extraction from MDX frontmatter + JSON-LD generation + Layer 1 interpolation |
| `content/pages/en/contact.mdx` | Contact page MDX content (hero copy, guidance, response expectations, FAQ) |
| `content/pages/zh/contact.mdx` | Contact page MDX content (Chinese) |
| `content/pages/en/oem-custom-manufacturing.mdx` | OEM page MDX content (FAQ) |
| `content/pages/zh/oem-custom-manufacturing.mdx` | OEM page MDX content (Chinese) |
| `content/pages/en/bending-machines.mdx` | Bending machines page MDX content (FAQ) |
| `content/pages/zh/bending-machines.mdx` | Bending machines page MDX content (Chinese) |

### Modify

| File | What changes |
|------|-------------|
| `.claude/rules/content.md` | Rewrite to four-layer rule system |
| `src/types/content.types.ts` | Add `LegalPageMetadata`, `FaqItem` type, extend `PageMetadata` with optional `faq` |
| `src/app/[locale]/privacy/page.tsx` | Thin wrapper using legal shell; delete inline `renderPrivacyContent()` |
| `src/app/[locale]/terms/page.tsx` | Thin wrapper using legal shell; remove `SINGLE_SITE_TERMS_SECTION_KEYS` dependency |
| `src/app/[locale]/about/page.tsx` | MDX-first via about shell; delete translation-driven content rendering |
| `src/app/[locale]/contact/page.tsx` | MDX-first for hero/FAQ; remove `MERGED_MESSAGES`, `SINGLE_SITE_CONTACT_PAGE_FALLBACK` |
| `src/app/[locale]/oem-custom-manufacturing/page.tsx` | FAQ from MDX frontmatter instead of translation pool |
| `src/app/[locale]/capabilities/bending-machines/page.tsx` | FAQ from MDX frontmatter; locale-aware equipment highlights |
| `src/config/single-site-page-expression.ts` | Remove `SECTION_KEYS`, `CONTACT_PAGE_FALLBACK`; keep switches + pointers only |
| `src/constants/equipment-specs.ts` | Highlights become `Record<Locale, string[]>` instead of `string[]` |
| `src/lib/seo-metadata.ts` | Remove `seo.pages.*` lookup; accept MDX frontmatter as primary source |
| `src/app/sitemap.ts` | Content-driven `lastmod` from MDX `updatedAt` |
| `src/config/single-site-seo.ts` | Remove `SINGLE_SITE_STATIC_PAGE_LASTMOD` (replaced by content-driven dates) |
| `src/components/sections/faq-section.tsx` | Accept `FaqItem[]` directly (not just key strings) |
| `content/pages/en/about.mdx` | Activate with hero, narrative, FAQ frontmatter |
| `content/pages/zh/about.mdx` | Activate with hero, narrative, FAQ frontmatter |
| `messages/en/critical.json` | Delete `seo.pages.*` |
| `messages/zh/critical.json` | Delete `seo.pages.*` |
| `messages/en/deferred.json` | Delete shared `faq.items.*`, dead `about.*` keys |
| `messages/zh/deferred.json` | Delete shared `faq.items.*`, dead `about.*` keys |
| `src/app/[locale]/products/[market]/page.tsx` | Adopt `generateMetadataForPath` instead of hand-rolled alternates |
| `src/lib/structured-data-generators.ts` | Add `generateProductGroupData` for market pages |
| `docs/guides/CANONICAL-TRUTH-REGISTRY.md` | Update to reflect four-layer model |
| `docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md` | Full 8-step replacement runbook |

### Tests to update or add

| Test file | Scope |
|-----------|-------|
| `src/lib/content/__tests__/legal-page.test.ts` | Legal loader, heading extraction, TOC |
| `src/lib/content/__tests__/mdx-faq.test.ts` | FAQ extraction, interpolation, schema |
| `src/components/content/__tests__/legal-page-shell.test.tsx` | Shell rendering |
| `src/app/[locale]/privacy/__tests__/page.test.tsx` | Updated privacy page |
| `src/app/[locale]/privacy/__tests__/page-async.test.tsx` | Updated privacy page |
| `src/app/[locale]/terms/__tests__/page.test.tsx` | Updated terms page |
| `src/app/[locale]/terms/__tests__/page-async.test.tsx` | Updated terms page |
| `src/app/[locale]/about/__tests__/page.test.tsx` | MDX-first about page |
| `src/app/[locale]/contact/__tests__/page.test.tsx` | MDX-first contact page |

---

## Series 1, Batch A: Rules + Legal Pages

> Freezes the four-layer contracts. Must complete before Batch B.

### Task 1: Write the unified four-layer rule document

**Files:**
- Modify: `.claude/rules/content.md`
- Modify: `docs/guides/CANONICAL-TRUTH-REGISTRY.md`

- [ ] **Step 1: Rewrite `.claude/rules/content.md`**

Replace the entire file with the four-layer rule system. The new content must cover:

```markdown
# Content Architecture — Four-Layer Rule

Every content field has exactly one canonical authoring source. Runtime-derived outputs (TOC from headings, JSON-LD from frontmatter, metadata composed from multiple layers) are not authoring duplication.

## Layer 1: Company Identity — single-site.ts

Company name, address, contact, established year, employee count, certifications, export countries, social links. First file to replace for a new brand.

## Layer 2: Page Expression — single-site-page-expression.ts

Structural switches and pointers only. "About page shows FAQ = yes" belongs here. FAQ content does not. Second file to replace.

## Layer 3: Page Content — content/pages/{locale}/*.mdx

All substantive page content: prose, hero copy, FAQ Q&A (in frontmatter), page-level metadata (title, SEO description, dates). If it must be rewritten when changing brands, it belongs here. Third set to replace.

**Exception:** Structured card data (equipment specs, product catalog) stays in typed config with i18n.

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
```

- [ ] **Step 2: Run grep to verify no conflicting rule documents exist**

Run: `rg -l "MDX-first\|content.*truth\|four.layer\|canonical.*source" .claude/rules/ docs/guides/ --glob '*.md'`

Expected: Only the files we just modified appear. No contradicting documents.

- [ ] **Step 3: Update `docs/guides/CANONICAL-TRUTH-REGISTRY.md`**

Update to reflect the four-layer model with explicit per-page ownership. Every page should have a row showing which layer owns each content surface.

- [ ] **Step 4: Commit**

```bash
git add .claude/rules/content.md docs/guides/CANONICAL-TRUTH-REGISTRY.md
git commit -m "$(cat <<'EOF'
docs: establish four-layer content rule system

Rewrites content rules to define canonical authoring sources across
four layers (identity, expression, content, chrome). Eliminates
ambiguity about where page content, FAQ, and SEO metadata belong.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Define typed content contracts (frontmatter schemas + FAQ type)

**Files:**
- Modify: `src/types/content.types.ts`

- [ ] **Step 1: Write failing test for new types**

Create `src/types/__tests__/content-types.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import type {
  FaqItem,
  LegalPageMetadata,
  PageMetadata,
} from "@/types/content.types";

describe("content type contracts", () => {
  it("LegalPageMetadata requires legal layout and showToc", () => {
    const meta: LegalPageMetadata = {
      title: "Privacy Policy",
      slug: "privacy",
      publishedAt: "2024-01-01",
      layout: "legal",
      showToc: true,
      lastReviewed: "2024-04-01",
    };
    expect(meta.layout).toBe("legal");
    expect(meta.showToc).toBe(true);
  });

  it("FaqItem has stable id, question, answer", () => {
    const item: FaqItem = {
      id: "what-is-moq",
      question: "What is the MOQ?",
      answer: "Our MOQ is 500 pieces per SKU.",
    };
    expect(item.id).toBe("what-is-moq");
    expect(item.question).toBeTruthy();
    expect(item.answer).toBeTruthy();
  });

  it("PageMetadata accepts optional faq array", () => {
    const meta: PageMetadata = {
      title: "About",
      slug: "about",
      publishedAt: "2024-01-10",
      faq: [
        {
          id: "test",
          question: "Q?",
          answer: "A.",
        },
      ],
    };
    expect(meta.faq).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/types/__tests__/content-types.test.ts`

Expected: FAIL — `FaqItem` and `LegalPageMetadata` do not exist yet.

- [ ] **Step 3: Add types to `src/types/content.types.ts`**

After the existing `PageMetadata` interface (line 44), add:

```typescript
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface LegalPageMetadata extends PageMetadata {
  layout: "legal";
  showToc: true;
  lastReviewed: string;
}
```

Modify existing `PageMetadata` to accept optional `faq`:

```typescript
export interface PageMetadata extends ContentMetadata {
  layout?: "default" | "landing" | "docs" | "legal";
  showToc?: boolean;
  lastReviewed?: string;
  faq?: FaqItem[];
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/types/__tests__/content-types.test.ts`

Expected: PASS

- [ ] **Step 5: Run type-check to confirm no regressions**

Run: `pnpm type-check`

Expected: Zero errors.

- [ ] **Step 6: Commit**

```bash
git add src/types/content.types.ts src/types/__tests__/content-types.test.ts
git commit -m "$(cat <<'EOF'
feat: add FaqItem, LegalPageMetadata types and extend PageMetadata

Defines typed contracts for the four-layer content model: stable FAQ
IDs, legal page metadata, and optional faq/hero fields on PageMetadata.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Create shared legal page loader and shell

**Files:**
- Create: `src/lib/content/legal-page.ts`
- Create: `src/components/content/legal-page-shell.tsx`
- Test: `src/lib/content/__tests__/legal-page.test.ts`

- [ ] **Step 1: Write failing test for legal page loader**

Create `src/lib/content/__tests__/legal-page.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/content", () => ({
  getPageBySlug: vi.fn().mockResolvedValue({
    metadata: {
      title: "Privacy Policy",
      slug: "privacy",
      publishedAt: "2024-01-01",
      updatedAt: "2024-04-01",
      lastReviewed: "2024-04-01",
      layout: "legal",
      showToc: true,
      seo: {
        title: "Privacy Policy | Data Protection",
        description: "Our privacy policy.",
      },
    },
    content:
      "## Introduction\n\nWe care about your privacy.\n\n## Information We Collect\n\nWe collect the following.\n\n### Personal Data\n\nName, email.",
    slug: "privacy",
    filePath: "content/pages/en/privacy.mdx",
  }),
}));

import { extractHeadingsFromContent, loadLegalPage } from "../legal-page";

describe("loadLegalPage", () => {
  it("loads and narrows to LegalPageMetadata", async () => {
    const result = await loadLegalPage("privacy", "en");
    expect(result.metadata.title).toBe("Privacy Policy");
    expect(result.metadata.lastReviewed).toBe("2024-04-01");
  });
});

describe("extractHeadingsFromContent", () => {
  it("extracts H2 and H3 headings with slugified IDs", () => {
    const content =
      "## Introduction\n\nText.\n\n## Information We Collect\n\n### Personal Data\n\nMore text.";
    const headings = extractHeadingsFromContent(content);

    expect(headings).toEqual([
      { level: 2, text: "Introduction", id: "introduction" },
      {
        level: 2,
        text: "Information We Collect",
        id: "information-we-collect",
      },
      { level: 3, text: "Personal Data", id: "personal-data" },
    ]);
  });

  it("uses explicit anchor ID when present via {#id} syntax", () => {
    const content =
      "## Introduction {#intro}\n\n## How We Use Your Data {#data-use}\n\n### Cookies {#cookies-policy}";
    const headings = extractHeadingsFromContent(content);

    expect(headings).toEqual([
      { level: 2, text: "Introduction", id: "intro" },
      { level: 2, text: "How We Use Your Data", id: "data-use" },
      { level: 3, text: "Cookies", id: "cookies-policy" },
    ]);
  });

  it("explicit ID remains stable when heading text changes", () => {
    const v1 = extractHeadingsFromContent("## Information Collection {#info-collect}");
    const v2 = extractHeadingsFromContent("## What Information We Collect {#info-collect}");

    expect(v1[0].id).toBe("info-collect");
    expect(v2[0].id).toBe("info-collect");
    expect(v1[0].id).toBe(v2[0].id);
  });

  it("returns empty array for content with no headings", () => {
    expect(extractHeadingsFromContent("Just a paragraph.")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/content/__tests__/legal-page.test.ts`

Expected: FAIL — `loadLegalPage` and `extractHeadingsFromContent` do not exist.

- [ ] **Step 3: Implement `src/lib/content/legal-page.ts`**

```typescript
import type { Locale } from "@/types/content.types";
import type { LegalPageMetadata } from "@/types/content.types";
import { getPageBySlug } from "@/lib/content";
import { slugifyHeading } from "@/lib/content/render-legal-content";

interface HeadingItem {
  level: 2 | 3;
  text: string;
  id: string;
}

const H2_PREFIX = "## ";
const H3_PREFIX = "### ";
const EXPLICIT_ID_PATTERN = /\s*\{#([a-z0-9-]+)\}\s*$/;

function parseHeading(raw: string): { text: string; id: string } {
  const match = EXPLICIT_ID_PATTERN.exec(raw);
  if (match) {
    return { text: raw.slice(0, match.index).trim(), id: match[1] };
  }
  return { text: raw, id: slugifyHeading(raw) };
}

export function extractHeadingsFromContent(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith(H3_PREFIX)) {
      const { text, id } = parseHeading(trimmed.slice(H3_PREFIX.length).trim());
      headings.push({ level: 3, text, id });
    } else if (trimmed.startsWith(H2_PREFIX)) {
      const { text, id } = parseHeading(trimmed.slice(H2_PREFIX.length).trim());
      headings.push({ level: 2, text, id });
    }
  }

  return headings;
}

interface LegalPageData {
  metadata: LegalPageMetadata;
  content: string;
  headings: HeadingItem[];
}

export async function loadLegalPage(
  slug: string,
  locale: string,
): Promise<LegalPageData> {
  const page = await getPageBySlug(slug, locale as Locale);

  const metadata: LegalPageMetadata = {
    ...page.metadata,
    layout: "legal",
    showToc: true,
    lastReviewed:
      page.metadata.lastReviewed ?? page.metadata.updatedAt ?? page.metadata.publishedAt,
  };

  const headings = extractHeadingsFromContent(page.content);

  return { metadata, content: page.content, headings };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/content/__tests__/legal-page.test.ts`

Expected: PASS

- [ ] **Step 5: Implement `src/components/content/legal-page-shell.tsx`**

```tsx
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { JsonLdScript } from "@/components/seo";
import { renderLegalContent } from "@/lib/content/render-legal-content";
import type { LegalPageMetadata } from "@/types/content.types";

interface HeadingItem {
  level: 2 | 3;
  text: string;
  id: string;
}

interface LegalPageShellProps {
  metadata: LegalPageMetadata;
  content: string;
  headings: HeadingItem[];
  locale: string;
  schemaType: "PrivacyPolicy" | "WebPage";
}

export async function LegalPageShell({
  metadata,
  content,
  headings,
  locale,
  schemaType,
}: LegalPageShellProps): Promise<ReactNode> {
  const t = await getTranslations({ locale, namespace: "legal" });

  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    inLanguage: locale,
    name: metadata.seo?.title ?? metadata.title,
    description: metadata.seo?.description ?? metadata.description,
    datePublished: metadata.publishedAt,
    dateModified: metadata.updatedAt ?? metadata.lastReviewed ?? metadata.publishedAt,
  } as const;

  const tocHeadings = headings.filter((h) => h.level === 2);
  const hasToc = tocHeadings.length > 0;

  return (
    <>
      <JsonLdScript data={schema} />

      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="mb-6 md:mb-8">
          <h1 className="text-heading mb-4">{metadata.title}</h1>
          {metadata.description && (
            <p className="text-body max-w-2xl text-muted-foreground">
              {metadata.description}
            </p>
          )}
        </header>

        <section className="mb-8 flex flex-wrap gap-4 text-xs text-muted-foreground sm:text-sm">
          {metadata.publishedAt !== undefined && (
            <div>
              <span className="font-medium">{t("effectiveDate")}:</span>{" "}
              <span>{metadata.publishedAt}</span>
            </div>
          )}
          {metadata.updatedAt !== undefined && (
            <div>
              <span className="font-medium">{t("lastUpdated")}:</span>{" "}
              <span>{metadata.updatedAt}</span>
            </div>
          )}
        </section>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]">
          <article className="min-w-0">
            {renderLegalContent(content)}
          </article>

          {hasToc && (
            <aside className="order-first rounded-lg border bg-muted/40 p-4 text-sm lg:order-none">
              <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {t("tableOfContents")}
              </h2>
              <nav aria-label={t("tableOfContents")}>
                <ol className="space-y-2">
                  {tocHeadings.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className="inline-flex text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}
```

Note: This shell uses `t("legal.effectiveDate")` etc. — translation keys will need a `legal` namespace added to messages. Add to `messages/en/deferred.json` and `messages/zh/deferred.json`:

```json
"legal": {
  "effectiveDate": "Effective Date",
  "lastUpdated": "Last Updated",
  "tableOfContents": "Table of Contents"
}
```

For Chinese:
```json
"legal": {
  "effectiveDate": "生效日期",
  "lastUpdated": "最后更新",
  "tableOfContents": "目录"
}
```

- [ ] **Step 6: Update `renderLegalContent` to support explicit anchor IDs**

Modify `src/lib/content/render-legal-content.tsx` — the heading rendering logic must parse `{#id}` syntax and output the explicit ID instead of slugifying text:

```typescript
const EXPLICIT_ID_PATTERN = /\s*\{#([a-z0-9-]+)\}\s*$/;

function parseHeadingId(text: string): { displayText: string; id: string } {
  const match = EXPLICIT_ID_PATTERN.exec(text);
  if (match) {
    return { displayText: text.slice(0, match.index).trim(), id: match[1] };
  }
  return { displayText: text, id: slugifyHeading(text) };
}
```

Update the H2/H3 rendering branches in `renderLegalContent` to use `parseHeadingId`:

```typescript
if (trimmed.startsWith("## ")) {
  const raw = trimmed.slice(H2_PREFIX_LENGTH).trim();
  const { displayText, id } = parseHeadingId(raw);
  elements.push(
    <h2 key={`h2-${id || index}`} id={id || undefined} className="...">
      {displayText}
    </h2>,
  );
}
```

This ensures:
- MDX headings with `{#stable-id}` produce stable anchors
- Heading text can change without breaking deep links
- Tests verify anchor IDs, not heading text (per spec heading stability contract)

- [ ] **Step 7: Run type-check**

Run: `pnpm type-check`

Expected: Zero errors.

- [ ] **Step 8: Commit**

```bash
git add src/lib/content/legal-page.ts src/lib/content/render-legal-content.tsx src/components/content/legal-page-shell.tsx src/lib/content/__tests__/legal-page.test.ts messages/en/deferred.json messages/zh/deferred.json
git commit -m "$(cat <<'EOF'
feat: add shared legal page loader/shell with explicit anchor ID support

Centralizes legal page loading (heading extraction with {#id} support,
TOC, metadata narrowing) and rendering. Both legal pages will use this
shell. Heading stability contract: explicit IDs survive text changes.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Migrate privacy page to shared legal shell

**Files:**
- Modify: `src/app/[locale]/privacy/page.tsx`
- Test: `src/app/[locale]/privacy/__tests__/page.test.tsx`
- Test: `src/app/[locale]/privacy/__tests__/page-async.test.tsx`

- [ ] **Step 1: Rewrite `src/app/[locale]/privacy/page.tsx`**

Replace the entire page with a thin wrapper:

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { generateMetadataForPath, type Locale } from "@/lib/seo-metadata";
import { loadLegalPage } from "@/lib/content/legal-page";
import { LegalPageShell } from "@/components/content/legal-page-shell";
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from "@/app/[locale]/generate-static-params";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface PrivacyPageProps {
  params: Promise<LocaleParam>;
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { metadata } = await loadLegalPage("privacy", locale);

  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "privacy",
    path: "/privacy",
    config: {
      title: metadata.seo?.title ?? metadata.title,
      description: metadata.seo?.description ?? metadata.description,
    },
  });
}

function PrivacyLoadingSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 md:mb-8">
        <div className="mb-4 h-9 w-48 animate-pulse rounded bg-muted" />
        <div className="h-5 w-96 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    </main>
  );
}

async function PrivacyContent({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const { metadata, content, headings } = await loadLegalPage("privacy", locale);

  return (
    <LegalPageShell
      metadata={metadata}
      content={content}
      headings={headings}
      locale={locale}
      schemaType="PrivacyPolicy"
    />
  );
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={<PrivacyLoadingSkeleton />}>
      <PrivacyContent locale={locale} />
    </Suspense>
  );
}
```

Key removals:
- Delete inline `renderPrivacyContent()` function (was at lines 132-252)
- Delete `extractHeadings()` and `buildTocItems()` local functions
- Delete import of `SINGLE_SITE_PRIVACY_SECTION_KEYS`
- Delete imports of `getTranslations` (metadata now comes from MDX frontmatter)

- [ ] **Step 2: Add explicit anchor IDs to privacy MDX headings**

In `content/pages/en/privacy.mdx` and `content/pages/zh/privacy.mdx`, add `{#stable-id}` to every `##` heading. These IDs are the heading stability contract — the heading text can change without breaking deep links or TOC anchors.

Example — transform existing headings:

```markdown
## Introduction {#introduction}
## Information We Collect {#info-collect}
## How We Use Your Information {#how-we-use}
## Information Sharing and Disclosure {#sharing}
## Data Security {#security}
## Data Retention {#retention}
## Your Rights and Choices {#your-rights}
## Children's Privacy {#children}
## Changes to This Policy {#changes}
## Contact Us {#contact}
```

Rules:
- IDs are kebab-case, short, stable across locales
- English and Chinese MDX files use the **same IDs** (different heading text, same anchors)
- IDs should match the intent of the current `SINGLE_SITE_PRIVACY_SECTION_KEYS` values where possible for backwards compatibility of any existing deep links

Do the same for `content/pages/en/terms.mdx` and `content/pages/zh/terms.mdx`:

```markdown
## Introduction {#introduction}
## Acceptance of Terms {#acceptance}
## Services Description {#services}
## Orders and Contracts {#orders}
## Payment Terms {#payment}
## Shipping and Delivery {#shipping}
## Warranty {#warranty}
## Limitation of Liability {#liability}
## Intellectual Property {#ip}
## Confidentiality {#confidentiality}
## Termination {#termination}
## Governing Law {#governing-law}
## Dispute Resolution {#disputes}
## Contact Us {#contact}
```

- [ ] **Step 3: Update existing tests if they reference removed functions**

Read current tests:

Run: `pnpm exec vitest run src/app/[locale]/privacy/__tests__/ --reporter=verbose`

If tests reference `renderPrivacyContent`, `SINGLE_SITE_PRIVACY_SECTION_KEYS`, or translation-based title/description, update them to reflect the new MDX-first approach:
- Title comes from MDX frontmatter, not `t("pageTitle")`
- TOC comes from headings, not section keys
- Content renders via shared `renderLegalContent`, not inline function

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run src/app/[locale]/privacy/__tests__/`

Expected: All tests pass.

- [ ] **Step 4: Run type-check and lint**

Run: `pnpm type-check && pnpm lint:check`

Expected: Zero errors, zero warnings.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/privacy/page.tsx src/app/[locale]/privacy/__tests__/
git commit -m "$(cat <<'EOF'
refactor: migrate privacy page to shared legal shell

Privacy page now uses the centralized legal page loader and shell.
Metadata reads from MDX frontmatter. TOC derives from document
headings. Inline renderPrivacyContent() is deleted.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Migrate terms page to shared legal shell

**Files:**
- Modify: `src/app/[locale]/terms/page.tsx`
- Test: `src/app/[locale]/terms/__tests__/page.test.tsx`
- Test: `src/app/[locale]/terms/__tests__/page-async.test.tsx`

- [ ] **Step 1: Rewrite `src/app/[locale]/terms/page.tsx`**

Same pattern as privacy page — thin wrapper:

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { generateMetadataForPath, type Locale } from "@/lib/seo-metadata";
import { loadLegalPage } from "@/lib/content/legal-page";
import { LegalPageShell } from "@/components/content/legal-page-shell";
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from "@/app/[locale]/generate-static-params";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface TermsPageProps {
  params: Promise<LocaleParam>;
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { metadata } = await loadLegalPage("terms", locale);

  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "terms",
    path: "/terms",
    config: {
      title: metadata.seo?.title ?? metadata.title,
      description: metadata.seo?.description ?? metadata.description,
    },
  });
}

function TermsLoadingSkeleton() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mb-6 md:mb-8">
        <div className="mb-4 h-9 w-48 animate-pulse rounded bg-muted" />
        <div className="h-5 w-96 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-4 w-full animate-pulse rounded bg-muted" />
        ))}
      </div>
    </main>
  );
}

async function TermsContent({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const { metadata, content, headings } = await loadLegalPage("terms", locale);

  return (
    <LegalPageShell
      metadata={metadata}
      content={content}
      headings={headings}
      locale={locale}
      schemaType="WebPage"
    />
  );
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;

  return (
    <Suspense fallback={<TermsLoadingSkeleton />}>
      <TermsContent locale={locale} />
    </Suspense>
  );
}
```

Key removals:
- Delete `extractHeadings()` and `buildTocItems()` local functions
- Delete import of `SINGLE_SITE_TERMS_SECTION_KEYS`
- Delete import of `renderLegalContent` and `slugifyHeading` (shell handles this)

- [ ] **Step 2: Update tests**

Run: `pnpm exec vitest run src/app/[locale]/terms/__tests__/ --reporter=verbose`

Update tests that reference `SINGLE_SITE_TERMS_SECTION_KEYS` or translation-based metadata.

- [ ] **Step 3: Run tests**

Run: `pnpm exec vitest run src/app/[locale]/terms/__tests__/`

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/terms/page.tsx src/app/[locale]/terms/__tests__/
git commit -m "$(cat <<'EOF'
refactor: migrate terms page to shared legal shell

Terms page now uses the same legal page loader and shell as privacy.
Both legal pages share one rendering pipeline. TOC derives from
document headings instead of parallel config arrays.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Clean up legal page artifacts and validate Batch A

**Files:**
- Modify: `src/config/single-site-page-expression.ts`
- Modify: `messages/en/critical.json` (remove legal page title/description from `seo.pages`)
- Modify: `messages/zh/critical.json` (same)

- [ ] **Step 1: Remove section key arrays from page expression**

In `src/config/single-site-page-expression.ts`, delete:

- `SINGLE_SITE_PRIVACY_SECTION_KEYS` (lines 66-77)
- `SINGLE_SITE_TERMS_SECTION_KEYS` (lines 79-94)

Verify no remaining imports:

Run: `rg "SINGLE_SITE_PRIVACY_SECTION_KEYS\|SINGLE_SITE_TERMS_SECTION_KEYS" src/`

Expected: Zero results (both legal pages now use heading-derived TOC).

- [ ] **Step 2: Verify no privacy/terms translation keys are still read for metadata**

Run: `rg "namespace.*privacy\|namespace.*terms" src/app/ --glob '*.tsx'`

Expected: No results in the legal page files (metadata now comes from MDX frontmatter). Other files referencing these namespaces (if any) should be using them for Layer 4 UI labels only.

- [ ] **Step 3: Run full Batch A validation**

Run:

```bash
pnpm exec vitest run src/app/[locale]/privacy/__tests__/ src/app/[locale]/terms/__tests__/ src/lib/content/__tests__/legal-page.test.ts src/types/__tests__/content-types.test.ts
pnpm type-check
pnpm lint:check
pnpm build
```

Expected: All tests pass, type-check clean, lint clean, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/config/single-site-page-expression.ts
git commit -m "$(cat <<'EOF'
refactor: remove legal page section key arrays

SINGLE_SITE_PRIVACY_SECTION_KEYS and SINGLE_SITE_TERMS_SECTION_KEYS
are no longer needed — both legal pages derive TOC from MDX headings.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Series 1, Batch B: FAQ Decomposition + About + Contact

> Requires Batch A contracts to be frozen.

### Task 7: Create FAQ MDX extraction infrastructure

**Naming conventions frozen in this task (apply to all subsequent FAQ work):**

- **FAQ IDs:** kebab-case always (`factory-visit`, not `factoryVisit`). Current translation keys are camelCase — they are migration sources, not final IDs.
- **Interpolation placeholders:** `{companyName}`, `{exportCountries}`, `{established}`, `{employees}`. These match the keys in the interpolation map below. Do NOT use the old `{countries}` shorthand — it conflicts with the existing `FaqSection` ICU values, but the new MDX-sourced path uses its own interpolation map with explicit names.

**Files:**
- Create: `src/lib/content/mdx-faq.ts`
- Test: `src/lib/content/__tests__/mdx-faq.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/content/__tests__/mdx-faq.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import {
  extractFaqFromMetadata,
  interpolateFaqAnswer,
  generateFaqSchemaFromItems,
} from "../mdx-faq";
import type { FaqItem } from "@/types/content.types";

const MOCK_FACTS = {
  companyName: "Tianze Pipe",
  exportCountries: 20,
  established: 2018,
};

describe("extractFaqFromMetadata", () => {
  it("returns empty array when no faq field", () => {
    expect(extractFaqFromMetadata({})).toEqual([]);
  });

  it("extracts valid FaqItem array", () => {
    const metadata = {
      faq: [
        { id: "moq", question: "What is MOQ?", answer: "500 pieces." },
        { id: "lead-time", question: "Lead time?", answer: "15-20 days." },
      ],
    };
    const result = extractFaqFromMetadata(metadata);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("moq");
  });
});

describe("interpolateFaqAnswer", () => {
  it("replaces {companyName} with fact value", () => {
    const result = interpolateFaqAnswer(
      "{companyName} has been in business since {established}.",
      MOCK_FACTS,
    );
    expect(result).toBe("Tianze Pipe has been in business since 2018.");
  });

  it("leaves unknown placeholders intact", () => {
    const result = interpolateFaqAnswer("Contact {unknownField}.", MOCK_FACTS);
    expect(result).toBe("Contact {unknownField}.");
  });
});

describe("generateFaqSchemaFromItems", () => {
  it("produces valid FAQPage JSON-LD", () => {
    const items: FaqItem[] = [
      { id: "q1", question: "Q1?", answer: "A1." },
    ];
    const schema = generateFaqSchemaFromItems(items, "en");
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity).toHaveLength(1);
    expect(schema.mainEntity[0]["@type"]).toBe("Question");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run src/lib/content/__tests__/mdx-faq.test.ts`

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `src/lib/content/mdx-faq.ts`**

```typescript
import type { FaqItem } from "@/types/content.types";

export function extractFaqFromMetadata(
  metadata: Record<string, unknown>,
): FaqItem[] {
  const faq = metadata.faq;
  if (!Array.isArray(faq)) return [];

  return faq.filter(
    (item): item is FaqItem =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as FaqItem).id === "string" &&
      typeof (item as FaqItem).question === "string" &&
      typeof (item as FaqItem).answer === "string",
  );
}

export function interpolateFaqAnswer(
  answer: string,
  facts: Record<string, string | number>,
): string {
  return answer.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = facts[key];
    return value !== undefined ? String(value) : match;
  });
}

interface FaqSchemaQuestion {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

interface FaqSchema {
  "@context": string;
  "@type": "FAQPage";
  inLanguage: string;
  mainEntity: FaqSchemaQuestion[];
}

export function generateFaqSchemaFromItems(
  items: FaqItem[],
  locale: string,
): FaqSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      "@type": "Question" as const,
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: item.answer,
      },
    })),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run src/lib/content/__tests__/mdx-faq.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/mdx-faq.ts src/lib/content/__tests__/mdx-faq.test.ts
git commit -m "$(cat <<'EOF'
feat: add FAQ extraction from MDX frontmatter

Provides extractFaqFromMetadata, interpolateFaqAnswer, and
generateFaqSchemaFromItems — the bridge between MDX frontmatter FAQ
arrays and the existing FaqSection rendering + JSON-LD generation.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Extend FaqSection to accept FaqItem[] directly

**Files:**
- Modify: `src/components/sections/faq-section.tsx`
- Test: `src/components/sections/__tests__/faq-section.test.tsx`

- [ ] **Step 1: Add overloaded props to FaqSection**

Currently `FaqSection` accepts `items: string[]` (translation keys). Add a second mode that accepts `FaqItem[]` directly. Modify `src/components/sections/faq-section.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { JsonLdScript } from "@/components/seo";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { SectionHead } from "@/components/ui/section-head";
import { generateFAQSchema } from "@/lib/structured-data";
import { generateFaqSchemaFromItems } from "@/lib/content/mdx-faq";
import { siteFacts } from "@/config/site-facts";
import type { FaqItem, Locale } from "@/types/content.types";

const FAQ_ICU_VALUES = {
  established: siteFacts.company.established,
  countries: siteFacts.stats.exportCountries,
  employees: siteFacts.company.employees,
};

interface FaqSectionKeyProps {
  items: string[];
  faqItems?: never;
  title?: string;
  subtitle?: string;
  locale: Locale;
}

interface FaqSectionDirectProps {
  items?: never;
  faqItems: FaqItem[];
  title?: string;
  subtitle?: string;
  locale: Locale;
}

type FaqSectionProps = FaqSectionKeyProps | FaqSectionDirectProps;

export async function FaqSection(props: FaqSectionProps) {
  const { title, subtitle, locale } = props;
  const t = await getTranslations("faq");

  let faqData: Array<{ key: string; question: string; answer: string }>;
  let schemaData: Record<string, unknown>;

  if ("faqItems" in props && props.faqItems) {
    faqData = props.faqItems.map((item) => ({
      key: item.id,
      question: item.question,
      answer: item.answer,
    }));
    schemaData = generateFaqSchemaFromItems(props.faqItems, locale);
  } else {
    const keys = props.items ?? [];
    faqData = keys.map((key) => ({
      key,
      question: t(`items.${key}.question`, FAQ_ICU_VALUES),
      answer: t(`items.${key}.answer`, FAQ_ICU_VALUES),
    }));
    schemaData = generateFAQSchema(
      faqData.map(({ question, answer }) => ({ question, answer })),
      locale,
    );
  }

  return (
    <>
      <JsonLdScript data={schemaData} />
      <section className="section-divider py-14 md:py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <SectionHead
            title={title ?? t("sectionTitle")}
            {...(subtitle ? { subtitle } : {})}
          />
          <FaqAccordion
            items={faqData.map(({ key, question, answer }) => ({
              key,
              question,
              answer,
            }))}
          />
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Update tests**

Run: `pnpm exec vitest run src/components/sections/__tests__/faq-section.test.tsx --reporter=verbose`

Ensure existing tests still pass with the `items: string[]` path. Add a test for the `faqItems: FaqItem[]` path if the test file is straightforward to extend.

- [ ] **Step 3: Run type-check**

Run: `pnpm type-check`

Expected: Zero errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/faq-section.tsx src/components/sections/__tests__/
git commit -m "$(cat <<'EOF'
feat: FaqSection accepts FaqItem[] directly for MDX-sourced FAQ

Adds a second mode to FaqSection: pass faqItems (FaqItem[]) directly
instead of translation keys. Existing string-key mode is preserved
for pages that haven't migrated yet.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Migrate About page to MDX-first

**Files:**
- Modify: `content/pages/en/about.mdx`
- Modify: `content/pages/zh/about.mdx`
- Create: `src/components/content/about-page-shell.tsx`
- Modify: `src/app/[locale]/about/page.tsx`
- Test: `src/app/[locale]/about/__tests__/page.test.tsx`

- [ ] **Step 1: Update `content/pages/en/about.mdx` with FAQ frontmatter and hero fields**

The existing about.mdx already has good content (113 lines). Update its frontmatter to add FAQ and hero fields. The FAQ items come from the current `SINGLE_SITE_ABOUT_FAQ_ITEMS` which references these keys in `deferred.json`: `manufacturer`, `factoryVisit`, `exportExperience`, `certifications`, `verifyCerts`.

Extract the current English FAQ Q&A text from `messages/en/deferred.json` (under `faq.items.manufacturer`, etc.) and place them into frontmatter:

```yaml
---
locale: 'en'
title: 'About Tianze Pipe'
description: 'Learn how Tianze combines bending equipment know-how, conduit production, and OEM flexibility for global B2B buyers.'
slug: 'about'
publishedAt: '2024-01-10'
updatedAt: '2026-04-01'
author: 'Tianze Pipe Team'
layout: 'default'
showToc: true
lastReviewed: '2026-04-01'
draft: false
heroTitle: 'About Tianze Pipe'
heroSubtitle: 'Pipe Bending Experts'
heroDescription: 'We combine bending equipment know-how, conduit production, and OEM flexibility — serving global B2B buyers from our Lianyungang factory.'
seo:
  title: 'About Tianze Pipe'
  description: 'Tianze Pipe is a manufacturer of PVC conduit systems, PETG pneumatic tubes, and pipe processing equipment with in-house bending capability.'
  keywords:
    ['Tianze Pipe', 'PVC conduit manufacturer', 'pipe bending machine', 'PETG pneumatic tube']
  ogImage: '/images/about-og.jpg'
faq:
  - id: manufacturer
    question: "Are you a manufacturer or trading company?"
    answer: "{companyName} is a direct manufacturer established in {established}. We operate our own factory in Lianyungang, Jiangsu Province, with full control over production quality and timelines."
  - id: factory-visit
    question: "Can I visit your factory?"
    answer: "Yes, we welcome factory visits. We can arrange a guided tour of our production facilities, quality testing lab, and warehouse. Contact us to schedule a visit."
  - id: export-experience
    question: "What is your export experience?"
    answer: "We export to {exportCountries}+ countries across Southeast Asia, the Middle East, Africa, South America, and Oceania. Our team handles international logistics, documentation, and customs requirements."
  - id: certifications
    question: "What certifications do your products have?"
    answer: "Our products comply with international standards including AS/NZS 2053, ASTM D1785, IEC 61386, and NOM. We maintain ISO 9001:2015 quality management certification."
  - id: verify-certs
    question: "How can I verify your certifications?"
    answer: "We provide official certification documents upon request. You can also verify our ISO certification through our registrar. Contact our sales team for documentation."
---
```

Keep the existing MDX body content (Who We Are, What We Make, etc.) intact.

- [ ] **Step 2: Update `content/pages/zh/about.mdx` with equivalent Chinese FAQ frontmatter**

Extract Chinese FAQ text from `messages/zh/deferred.json` and add to the Chinese about.mdx frontmatter with the same FAQ IDs.

- [ ] **Step 3: Create `src/components/content/about-page-shell.tsx`**

```tsx
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { JsonLdScript } from "@/components/seo";
import { FaqSection } from "@/components/sections/faq-section";
import { siteFacts } from "@/config/site-facts";
import { interpolateFaqAnswer } from "@/lib/content/mdx-faq";
import { renderLegalContent } from "@/lib/content/render-legal-content";
import {
  SINGLE_SITE_ABOUT_PAGE_EXPRESSION,
  SINGLE_SITE_ABOUT_STATS_ITEMS,
} from "@/config/single-site-page-expression";
import type { FaqItem, PageMetadata } from "@/types/content.types";

const LAYER1_FACTS: Record<string, string | number> = {
  companyName: siteFacts.company.name,
  established: siteFacts.company.established,
  exportCountries: siteFacts.stats.exportCountries,
  employees: siteFacts.company.employees,
};

interface AboutPageShellProps {
  metadata: PageMetadata;
  content: string;
  locale: string;
}

export async function AboutPageShell({
  metadata,
  content,
  locale,
}: AboutPageShellProps): Promise<ReactNode> {
  const t = await getTranslations({ locale, namespace: "about" });

  const faqItems: FaqItem[] = (metadata.faq ?? []).map((item) => ({
    ...item,
    answer: interpolateFaqAnswer(item.answer, LAYER1_FACTS),
  }));

  const hasFaq = faqItems.length > 0;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Hero — from MDX frontmatter */}
      <header className="mb-12 md:mb-16">
        <h1 className="text-heading mb-4">
          {metadata.heroTitle ?? metadata.title}
        </h1>
        {metadata.heroSubtitle && (
          <p className="text-lg font-medium text-primary">
            {metadata.heroSubtitle}
          </p>
        )}
        {metadata.heroDescription && (
          <p className="text-body mt-4 max-w-2xl text-muted-foreground">
            {metadata.heroDescription}
          </p>
        )}
      </header>

      {/* MDX body — company story, what we make, etc. */}
      {/* Implementor: check if src/components/mdx/mdx-content.tsx exists.
          If yes, use it for richer rendering. If no, use renderLegalContent
          as a temporary measure and note it for follow-up. */}
      <article className="prose max-w-none">
        {renderLegalContent(content)}
      </article>

      {/* Stats — from Layer 1 (siteFacts) + Layer 2 (expression) */}
      {/* Implementor: copy the stats grid JSX from the CURRENT
          src/app/[locale]/about/page.tsx. It reads:
          - SINGLE_SITE_ABOUT_STATS_ITEMS for layout config
          - siteFacts.company.established, siteFacts.stats.exportCountries,
            siteFacts.company.employees, siteFacts.stats.factoryArea for values
          - t("stats.yearsExperience"), t("stats.countriesServed"), etc. for labels
          Do NOT redesign the stats section — preserve existing visual output. */
      {SINGLE_SITE_ABOUT_STATS_ITEMS.length > 0 && (
        <section className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {SINGLE_SITE_ABOUT_STATS_ITEMS.map((item) => (
            <div key={item.key} className="text-center">
              <div className="text-3xl font-bold text-primary">
                {item.key === "years"
                  ? new Date().getFullYear() - siteFacts.company.established
                  : item.key === "countries"
                    ? siteFacts.stats.exportCountries
                    : item.key === "team"
                      ? siteFacts.company.employees
                      : item.key === "factory"
                        ? siteFacts.stats.factoryArea
                        : ""}
                {item.suffix ?? "+"}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {t(`stats.${item.labelKey}`)}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* FAQ — from MDX frontmatter */}
      {hasFaq && (
        <FaqSection faqItems={faqItems} locale={locale as "en" | "zh"} />
      )}

      {/* CTA — from Layer 2 (expression) */}
      {SINGLE_SITE_ABOUT_PAGE_EXPRESSION.ctaHref && (
        <section className="mt-16 text-center">
          <Link
            href={SINGLE_SITE_ABOUT_PAGE_EXPRESSION.ctaHref}
            className="inline-flex items-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            {t("cta.button")}
          </Link>
        </section>
      )}
    </main>
  );
}
```

**Implementation notes for the About page shell:**

1. **Stats section:** Copy the current stats rendering JSX from `src/app/[locale]/about/page.tsx` into the shell. It reads `SINGLE_SITE_ABOUT_STATS_ITEMS` for layout, `siteFacts` for values, and `t("stats.*")` for labels. Do not redesign — preserve the existing visual output.

2. **Value cards:** Copy the current value cards rendering from the existing about page. It reads `SINGLE_SITE_ABOUT_VALUE_ITEM_KEYS` and `t("values.*")` for labels. These are Layer 2 + Layer 4 — correct ownership.

3. **MDX body rendering:** Do NOT use `renderLegalContent` for the About page. That renderer only handles legal markdown (headings, paragraphs, lists, tables). The About page MDX has richer content (images, sections). Use `renderLegalContent` only as a temporary measure if the existing MDX content is simple enough. If richer rendering is needed, use the existing MDX content pipeline (check for `src/components/mdx/mdx-content.tsx` or similar). The implementor must verify which renderer suits the actual About MDX content.

4. **CTA:** Copy from current about page. Reads `SINGLE_SITE_ABOUT_PAGE_EXPRESSION.ctaHref` (Layer 2) and `t("cta.button")` (Layer 4).

- [ ] **Step 4: Rewrite `src/app/[locale]/about/page.tsx` as thin wrapper**

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { generateMetadataForPath, type Locale } from "@/lib/seo-metadata";
import { getPageBySlug } from "@/lib/content";
import { AboutPageShell } from "@/components/content/about-page-shell";
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from "@/app/[locale]/generate-static-params";

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

interface AboutPageProps {
  params: Promise<LocaleParam>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug("about", locale as Locale);

  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "about",
    path: "/about",
    config: {
      title: page.metadata.seo?.title ?? page.metadata.title,
      description: page.metadata.seo?.description ?? page.metadata.description,
      image: page.metadata.seo?.ogImage,
    },
  });
}

async function AboutContent({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const page = await getPageBySlug("about", locale as Locale);

  return (
    <AboutPageShell
      metadata={page.metadata}
      content={page.content}
      locale={locale}
    />
  );
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  return (
    <Suspense
      fallback={
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-4 h-9 w-64 animate-pulse rounded bg-muted" />
          <div className="space-y-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="h-4 w-full animate-pulse rounded bg-muted"
              />
            ))}
          </div>
        </main>
      }
    >
      <AboutContent locale={locale} />
    </Suspense>
  );
}
```

Note: The About page shell must choose the right content renderer for the MDX body. See implementation notes above Step 4 for guidance. Do not blindly use `renderLegalContent` — it is too limited for About page content.

- [ ] **Step 5: Update about page tests**

Run: `pnpm exec vitest run src/app/[locale]/about/__tests__/ --reporter=verbose`

Update tests to reflect:
- Content now comes from MDX, not translation keys
- FAQ comes from MDX frontmatter, not shared pool
- Hero comes from MDX frontmatter fields
- Stats still come from siteFacts
- CTA still comes from page expression

- [ ] **Step 6: Run validation**

Run: `pnpm type-check && pnpm exec vitest run src/app/[locale]/about/__tests__/`

Expected: All pass.

- [ ] **Step 7: Commit**

```bash
git add content/pages/en/about.mdx content/pages/zh/about.mdx src/components/content/about-page-shell.tsx src/app/[locale]/about/
git commit -m "$(cat <<'EOF'
feat: migrate About page to MDX-first with controlled shell

About page now reads hero copy, narrative, and FAQ from MDX content.
Stats read from Layer 1 (siteFacts), assembly switches from Layer 2
(page expression). Dead translation keys will be cleaned up next.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Create Contact page MDX and migrate

**Files:**
- Create: `content/pages/en/contact.mdx`
- Create: `content/pages/zh/contact.mdx`
- Modify: `src/app/[locale]/contact/page.tsx`
- Modify: `src/app/[locale]/contact/contact-page-shell.tsx` (if it exists — check before modifying)
- Test: `src/app/[locale]/contact/__tests__/page.test.tsx`
- Test: `src/app/[locale]/contact/__tests__/contact-page-shell.test.tsx`
- Test: `src/app/[locale]/contact/__tests__/page-i18n-basic.test.tsx`
- Test: `src/app/[locale]/contact/__tests__/page-i18n.test.tsx`
- Test: `src/app/[locale]/contact/__tests__/page-rendering-basic-core.test.tsx`
- Test: `src/app/[locale]/contact/__tests__/page-rendering-basic.test.tsx`
- Test: `src/app/[locale]/contact/__tests__/page-rendering.test.tsx`
- Test: `src/app/__tests__/contact-integration.test.ts`

**Contact page is the most complex migration** — it has `MERGED_MESSAGES`, `NextIntlClientProvider`, `ContactFormFallback`, `getContactCopy`, and 8+ test files. Read the current implementation fully before modifying.

- [ ] **Step 1: Create `content/pages/en/contact.mdx`**

Extract contact page hero copy, response expectations, and FAQ from current translation JSON. The FAQ items come from `SINGLE_SITE_CONTACT_FAQ_ITEMS`: `moq`, `leadTime`, `payment`, `samples`, `oem`.

```yaml
---
locale: 'en'
title: 'Contact Us'
description: 'Get in touch with Tianze Pipe for product inquiries, OEM requests, or technical support.'
slug: 'contact'
publishedAt: '2024-01-01'
updatedAt: '2026-04-01'
lastReviewed: '2026-04-01'
draft: false
seo:
  title: 'Contact Tianze Pipe | Get a Quote'
  description: 'Contact our sales team for PVC conduit fittings inquiries, OEM manufacturing requests, or technical support. Quick response within 24 hours.'
faq:
  - id: moq
    question: "What is your minimum order quantity (MOQ)?"
    answer: "Our standard MOQ is 500 pieces per SKU for stock items. For custom/OEM orders, MOQ may vary — contact us for specific requirements."
  - id: lead-time
    question: "What is your typical lead time?"
    answer: "Standard products: 15-20 working days. Custom/OEM orders: 25-35 working days depending on specifications and quantity."
  - id: payment
    question: "What payment terms do you accept?"
    answer: "We accept T/T (30% deposit, 70% before shipment), L/C at sight, and Western Union for sample orders."
  - id: samples
    question: "Can I get product samples?"
    answer: "Yes, we provide free samples for standard products (buyer pays shipping). Custom samples may have a small tooling fee."
  - id: oem
    question: "Do you offer OEM/ODM services?"
    answer: "Yes, we provide full OEM/ODM services including custom colors, sizes, packaging, and branding. Minimum order quantities apply."
---

## Get in Touch

Have questions about our PVC conduit fittings or bending machines? Our international sales team responds within 24 business hours.

## Response Expectations

- **Email inquiries**: Response within 24 hours on business days
- **Quote requests**: Detailed quotation within 48 hours
- **Technical questions**: Our engineering team will respond within 2 business days
- **Sample requests**: Confirmation and shipping details within 3 business days
```

- [ ] **Step 2: Create `content/pages/zh/contact.mdx`**

Same structure with Chinese content. Extract from `messages/zh/deferred.json` and `messages/zh/critical.json`.

- [ ] **Step 3: Modify `src/app/[locale]/contact/page.tsx`**

**Target structure of the new contact page:**

```tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/types/content.types";
import { getPageBySlug } from "@/lib/content";
import { extractFaqFromMetadata, interpolateFaqAnswer } from "@/lib/content/mdx-faq";
import { generateMetadataForPath, type Locale as SeoLocale } from "@/lib/seo-metadata";
import { renderLegalContent } from "@/lib/content/render-legal-content";
import { JsonLdScript } from "@/components/seo";
import { ContactForm } from "@/components/contact/contact-form";
import { FaqSection } from "@/components/sections/faq-section";
import { siteFacts } from "@/config/site-facts";
import { generateFaqSchemaFromItems } from "@/lib/content/mdx-faq";
import { pickMessages } from "@/lib/i18n/client-messages";
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from "@/app/[locale]/generate-static-params";

// Layer 1 facts for FAQ interpolation
const LAYER1_FACTS: Record<string, string | number> = {
  companyName: siteFacts.company.name,
  established: siteFacts.company.established,
  exportCountries: siteFacts.stats.exportCountries,
  employees: siteFacts.company.employees,
};

export async function generateMetadata({ params }: { params: Promise<LocaleParam> }): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPageBySlug("contact", locale as Locale);

  return generateMetadataForPath({
    locale: locale as SeoLocale,
    pageType: "contact",
    path: "/contact",
    config: {
      title: page.metadata.seo?.title ?? page.metadata.title,
      description: page.metadata.seo?.description ?? page.metadata.description,
    },
  });
}

async function ContactContent({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const page = await getPageBySlug("contact", locale as Locale);
  const messages = await getMessages({ locale });

  // FAQ from MDX frontmatter
  const rawFaq = extractFaqFromMetadata(page.metadata as Record<string, unknown>);
  const faqItems = rawFaq.map((item) => ({
    ...item,
    answer: interpolateFaqAnswer(item.answer, LAYER1_FACTS),
  }));

  // Form still needs NextIntlClientProvider for client-side labels (Layer 4)
  const contactMessages = pickMessages(messages, ["contact", "common"]);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Hero — from MDX */}
      <header className="mb-12">
        <h1 className="text-heading mb-4">{page.metadata.title}</h1>
        {page.metadata.description && (
          <p className="text-body max-w-2xl text-muted-foreground">
            {page.metadata.description}
          </p>
        )}
      </header>

      {/* MDX body — response expectations, guidance copy */}
      <article className="prose mb-12 max-w-none">
        {renderLegalContent(page.content)}
      </article>

      {/* Contact methods — from Layer 1 (siteFacts) */}
      {/* Preserve current contact methods / business hours card rendering */}
      {/* These read from siteFacts, labels from Layer 4 */}

      {/* Form — client component with Layer 4 labels */}
      <NextIntlClientProvider locale={locale} messages={contactMessages}>
        <Suspense fallback={/* skeleton */}>
          <ContactForm />
        </Suspense>
      </NextIntlClientProvider>

      {/* FAQ — from MDX frontmatter */}
      {faqItems.length > 0 && (
        <FaqSection faqItems={faqItems} locale={locale as "en" | "zh"} />
      )}
    </main>
  );
}
```

**What to DELETE:**
- `MERGED_MESSAGES` const and `getMessagesForLocale()` helper (module-scope JSON imports)
- Import of `SINGLE_SITE_CONTACT_FAQ_ITEMS` from page expression
- Import of `getContactPageFallbackCopy` / `ContactPageHeader` / `ContactFormFallback` from contact-page-shell
- Any inline hero copy that was read from translations

**What to KEEP:**
- `NextIntlClientProvider` for the contact form (it's a client component needing Layer 4 labels)
- `ContactForm` component import and rendering
- Contact methods card (reading from `siteFacts` Layer 1 + Layer 4 labels)
- Business hours card (same pattern)
- Suspense boundary for the form
- `pickMessages` for selectively passing messages to the client provider

**What CHANGES source:**
- Hero copy: translations → MDX body
- FAQ: shared pool keys → MDX frontmatter `faqItems`
- Page metadata: `t("pageTitle")` → MDX frontmatter `page.metadata.seo?.title`

- [ ] **Step 4: Run ALL contact tests**

Run: `pnpm exec vitest run src/app/[locale]/contact/__tests__/ src/app/__tests__/contact-integration.test.ts --reporter=verbose`

These tests currently assume translation-driven content and `MERGED_MESSAGES`. Update each:
- `contact-page-shell.test.tsx` — may need to be deleted if the shell is removed
- `page-i18n*.test.tsx` — update for MDX-sourced content
- `page-rendering*.test.tsx` — update mock content source
- `contact-integration.test.ts` — update integration expectations

- [ ] **Step 5: Run type-check**

Run: `pnpm type-check`

Expected: Zero errors.

- [ ] **Step 6: Commit**

```bash
git add content/pages/en/contact.mdx content/pages/zh/contact.mdx src/app/[locale]/contact/
git commit -m "$(cat <<'EOF'
feat: migrate Contact page hero and FAQ to MDX

Contact page hero copy, response expectations, and FAQ now live in
MDX files. Form labels stay in translation JSON (Layer 4 UI chrome).
MERGED_MESSAGES pattern and config fallback copy removed.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Decompose FAQ for OEM and Bending Machines pages

**Files:**
- Create: `content/pages/en/oem-custom-manufacturing.mdx`
- Create: `content/pages/zh/oem-custom-manufacturing.mdx`
- Create: `content/pages/en/bending-machines.mdx`
- Create: `content/pages/zh/bending-machines.mdx`
- Modify: `src/app/[locale]/oem-custom-manufacturing/page.tsx`
- Modify: `src/app/[locale]/capabilities/bending-machines/page.tsx`
- Test: `src/app/[locale]/oem-custom-manufacturing/__tests__/page.test.tsx`
- Test: `src/app/[locale]/capabilities/bending-machines/__tests__/page.test.tsx`

- [ ] **Step 1: Create OEM page MDX files**

Extract FAQ from `SINGLE_SITE_OEM_PAGE_EXPRESSION.faqItems` which references keys: items in the OEM FAQ set from translation JSON.

`content/pages/en/oem-custom-manufacturing.mdx`:

```yaml
---
locale: 'en'
title: 'OEM Custom Manufacturing'
description: 'Custom PVC conduit fittings manufacturing — your brand, your specs, our factory.'
slug: 'oem-custom-manufacturing'
publishedAt: '2024-06-01'
updatedAt: '2026-04-01'
lastReviewed: '2026-04-01'
draft: false
seo:
  title: 'OEM Custom PVC Conduit Manufacturing | Tianze Pipe'
  description: 'Full OEM/ODM services for PVC conduit fittings. Custom colors, sizes, packaging, and branding from our ISO-certified factory.'
faq:
  - id: oem-moq
    question: "What is the MOQ for OEM orders?"
    answer: "OEM orders typically require a minimum of 1,000 pieces per SKU. For new molds, higher quantities may be required to offset tooling costs."
  - id: oem-lead-time
    question: "How long does an OEM order take?"
    answer: "First order with new molds: 35-45 days. Repeat orders: 20-25 days. Rush orders may be available — contact us for details."
  - id: oem-branding
    question: "Can you put our brand on the products?"
    answer: "Yes, we offer full branding services including custom printing, embossing, packaging design, and labeling to your specifications."
  - id: oem-standards
    question: "Which international standards can you manufacture to?"
    answer: "We manufacture to AS/NZS 2053, ASTM D1785, IEC 61386, NOM, and other regional standards. We can also work with your custom specifications."
  - id: oem-quality
    question: "How do you ensure quality for OEM orders?"
    answer: "We maintain ISO 9001:2015 certification. Every OEM order goes through our standard QC process including raw material testing, in-process inspection, and final inspection with photo documentation."
---
```

Create equivalent Chinese version at `content/pages/zh/oem-custom-manufacturing.mdx`.

- [ ] **Step 2: Create Bending Machines page MDX files**

Extract FAQ from `SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.faqItems`.

`content/pages/en/bending-machines.mdx`:

```yaml
---
locale: 'en'
title: 'PVC Pipe Bending Machines'
description: 'Full-auto and semi-auto PVC pipe bending machines designed and manufactured in-house.'
slug: 'bending-machines'
publishedAt: '2026-03-23'
updatedAt: '2026-04-01'
lastReviewed: '2026-04-01'
draft: false
seo:
  title: 'PVC Pipe Bending Machines | Tianze Equipment'
  description: 'Industrial PVC pipe bending machines — full-auto CNC and semi-auto models. Designed and manufactured by Tianze for conduit fitting production.'
faq:
  - id: bending-capacity
    question: "What pipe sizes can your bending machines handle?"
    answer: "Our full-auto machine handles DN25-DN160mm. The semi-auto model covers DN20-DN110mm. Custom size ranges can be configured."
  - id: bending-automation
    question: "What is the difference between full-auto and semi-auto?"
    answer: "Full-auto features CNC control with automatic feeding and multi-station design — ideal for high-volume production. Semi-auto requires manual loading but offers lower investment for smaller operations."
  - id: bending-support
    question: "Do you provide installation and training?"
    answer: "Yes, we provide on-site installation, operator training, and ongoing technical support. Remote diagnostics are available for the full-auto model."
  - id: bending-spare-parts
    question: "How do I get spare parts?"
    answer: "We maintain a spare parts inventory for all our machine models. Standard parts ship within 3-5 days. We also offer annual maintenance contracts."
---
```

Create equivalent Chinese version.

- [ ] **Step 3: Update OEM page to use MDX FAQ**

In `src/app/[locale]/oem-custom-manufacturing/page.tsx`:
- Load page with `getPageBySlug("oem-custom-manufacturing", locale)`
- Extract FAQ from frontmatter using `extractFaqFromMetadata`
- Interpolate with Layer 1 facts
- Pass `faqItems` to `FaqSection` instead of translation keys
- Read metadata (title, description) from MDX frontmatter

- [ ] **Step 4: Update Bending Machines page to use MDX FAQ**

In `src/app/[locale]/capabilities/bending-machines/page.tsx`:
- Same pattern as OEM
- Load page with `getPageBySlug("bending-machines", locale)`
- FAQ from MDX frontmatter

- [ ] **Step 5: Run tests and type-check**

Run:

```bash
pnpm type-check
pnpm exec vitest run --reporter=verbose
```

Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add content/pages/ src/app/[locale]/oem-custom-manufacturing/ src/app/[locale]/capabilities/bending-machines/
git commit -m "$(cat <<'EOF'
feat: decompose FAQ to per-page MDX for OEM and bending machines

OEM and bending machines pages now own their FAQ content in MDX
frontmatter. No more shared FAQ pool dependency for these pages.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Clean up dead translation keys and FAQ pool

**Files:**
- Modify: `messages/en/deferred.json`
- Modify: `messages/zh/deferred.json`
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`
- Modify: `src/config/single-site-page-expression.ts`

- [ ] **Step 1: Identify dead translation keys**

Run:

```bash
rg "faq\.items\." src/app/ src/components/ src/lib/ --glob '*.tsx' --glob '*.ts' | grep -v '__tests__' | grep -v 'node_modules'
```

After Batch B migrations, the shared `faq.items.*` keys should have zero runtime consumers. Verify this.

Also check for dead about page keys:

```bash
rg "about\.(hero|mission|values|stats|cta)\." src/app/ src/components/ --glob '*.tsx' | grep -v '__tests__'
```

- [ ] **Step 2: Delete ONLY migrated FAQ keys from translation files (two-stage deletion)**

**CRITICAL: Do NOT delete the entire `faq.items` object.** Product market pages still consume shared FAQ keys via `SINGLE_SITE_MARKET_FAQ_ITEMS` + `FaqSection` string-key mode.

In `messages/en/deferred.json` and `messages/zh/deferred.json`, delete only the FAQ keys that were migrated to per-page MDX in Tasks 9-11:

**Keys to delete** (migrated to about/contact/oem/bending-machines MDX):
- `faq.items.manufacturer`
- `faq.items.factoryVisit`
- `faq.items.exportExperience`
- `faq.items.certifications`
- `faq.items.verifyCerts`
- `faq.items.moq`
- `faq.items.leadTime`
- `faq.items.payment`
- `faq.items.samples`
- `faq.items.oem`

**Keys to KEEP** (still consumed by product market pages via `SINGLE_SITE_MARKET_FAQ_ITEMS`):
- `faq.items.sch40vs80`
- `faq.items.conduitSize`
- `faq.items.bendingRadius`
- `faq.items.strengthGrades`
- and any other keys referenced by `SINGLE_SITE_MARKET_FAQ_ITEMS`

Keep `faq.sectionTitle` (Layer 4 UI label).

Verify which keys to keep:

```bash
rg "SINGLE_SITE_MARKET_FAQ_ITEMS" src/config/single-site-page-expression.ts
```

Cross-reference the item list against `faq.items.*` keys. Any key still in that array stays.

- [ ] **Step 3: Delete dead About translation keys**

In `messages/en/deferred.json` and `messages/zh/deferred.json`, delete: `about.hero.*`, `about.mission.*`, `about.values.*`, `about.stats.*`, `about.cta.*`. Keep only shell-level labels that are still consumed at runtime.

- [ ] **Step 4: Remove migrated FAQ item arrays from page expression**

In `src/config/single-site-page-expression.ts`, remove:
- `SINGLE_SITE_CONTACT_FAQ_ITEMS` (lines 58-64)
- `SINGLE_SITE_ABOUT_FAQ_ITEMS` (lines 136-142)
- `SINGLE_SITE_CONTACT_PAGE_FALLBACK` and `getSingleSiteContactPageFallbackCopy` (lines 96-134, 278-280)
- FAQ item arrays from `SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION.faqItems` and `SINGLE_SITE_OEM_PAGE_EXPRESSION.faqItems`

**Keep intact:**
- `SINGLE_SITE_MARKET_FAQ_ITEMS` — product market pages still use the shared pool
- All page expression switches (ctaHref, stats items, etc.) — these are Layer 2 controls

**Future migration note:** When product market pages migrate to per-page MDX FAQ, delete `SINGLE_SITE_MARKET_FAQ_ITEMS` and the remaining `faq.items.*` translation keys. This is out of scope for this plan.

- [ ] **Step 5: Verify no dangling references for deleted items**

Run:

```bash
rg "SINGLE_SITE_CONTACT_FAQ_ITEMS\|SINGLE_SITE_ABOUT_FAQ_ITEMS\|SINGLE_SITE_CONTACT_PAGE_FALLBACK\|getSingleSiteContactPageFallbackCopy" src/
```

Expected: Zero results.

Also verify market pages still work:

```bash
rg "SINGLE_SITE_MARKET_FAQ_ITEMS" src/
```

Expected: Still referenced by product market page and page expression config.

- [ ] **Step 6: Run full validation**

Run:

```bash
pnpm type-check
pnpm lint:check
pnpm exec vitest run
pnpm build
```

Expected: All pass.

- [ ] **Step 7: Commit**

```bash
git add messages/ src/config/single-site-page-expression.ts
git commit -m "$(cat <<'EOF'
refactor: delete migrated FAQ keys and dead About translation keys

Migrated FAQ keys removed from shared pool (about/contact/oem/bending
pages now own their FAQ in MDX). Market page FAQ keys preserved —
they still use the shared pool. Dead About translation keys removed.
Contact page fallback copy and FAQ key arrays removed from config.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: Batch B validation

**Files:**
- No new files; verification only.

- [ ] **Step 1: Run focused tests**

Run:

```bash
pnpm exec vitest run \
  src/app/[locale]/about/__tests__/ \
  src/app/[locale]/contact/__tests__/ \
  src/app/[locale]/oem-custom-manufacturing/__tests__/ \
  src/app/[locale]/capabilities/bending-machines/__tests__/ \
  src/app/__tests__/contact-integration.test.ts \
  src/lib/content/__tests__/mdx-faq.test.ts \
  src/components/sections/__tests__/faq-section.test.tsx
```

Expected: All pass.

- [ ] **Step 2: FAQ locale parity validation**

Add a test to `src/lib/content/__tests__/mdx-faq.test.ts` that validates locale parity:

```typescript
import { getPageBySlug } from "@/lib/content";
import { extractFaqFromMetadata } from "../mdx-faq";

describe("FAQ locale parity", () => {
  const FAQ_PAGES = ["about", "contact", "oem-custom-manufacturing", "bending-machines"];

  for (const slug of FAQ_PAGES) {
    it(`${slug} has same FAQ IDs in en and zh`, async () => {
      const enPage = await getPageBySlug(slug, "en");
      const zhPage = await getPageBySlug(slug, "zh");

      const enIds = extractFaqFromMetadata(enPage.metadata as Record<string, unknown>)
        .map((item) => item.id);
      const zhIds = extractFaqFromMetadata(zhPage.metadata as Record<string, unknown>)
        .map((item) => item.id);

      expect(enIds).toEqual(zhIds);
      expect(enIds.length).toBeGreaterThan(0);
    });
  }
});
```

Run: `pnpm exec vitest run src/lib/content/__tests__/mdx-faq.test.ts`

Expected: All pages have identical FAQ IDs across locales. If any ID differs, fix the MDX file before proceeding.

Also do a quick shell check as a sanity check:

```bash
for page in about contact oem-custom-manufacturing bending-machines; do
  echo "=== $page ==="
  for locale in en zh; do
    echo "  $locale:"
    grep -A1 "id:" "content/pages/$locale/$page.mdx" 2>/dev/null | grep "id:" | sed 's/.*id: /    /'
  done
done
```

- [ ] **Step 3: Run project-wide validation**

Run:

```bash
pnpm type-check
pnpm lint:check
pnpm exec vitest run
pnpm build
```

Expected: All pass. Zero type errors, zero lint warnings, all tests green, build succeeds.

- [ ] **Step 3: Commit (if any test fixes were needed)**

Only commit if adjustments were needed.

---

## Series 1, Batch C: Equipment + SEO Ownership + Cleanup + Derivative Docs

### Task 14: Equipment spec i18n for highlights

**Files:**
- Modify: `src/constants/equipment-specs.ts`
- Modify: `src/app/[locale]/capabilities/bending-machines/page.tsx`

- [ ] **Step 1: Change highlights type to locale-aware**

In `src/constants/equipment-specs.ts`, change the `EquipmentSpec` interface:

```typescript
import type { Locale } from "@/types/content.types";

export interface EquipmentSpec {
  slug: string;
  name: string;
  params: Record<string, string>;
  highlights: Record<Locale, string[]>;
  image: string;
}
```

Update both specs:

```typescript
export const EQUIPMENT_SPECS = [
  {
    slug: "full-auto-bending-machine",
    name: "Full-Auto PVC Pipe Bending Machine",
    params: {
      pipeDiameter: "DN25-DN160mm",
      bendingAngles: "15°-180° (Programmable)",
      heatingZones: "4-8 zones",
      powerSupply: "380V/50Hz 3-Phase",
      productionSpeed: "150-200 pcs/hour",
      machineWeight: "~1200kg",
      controlSystem: "PLC + HMI Touch Screen",
    },
    highlights: {
      en: [
        "CNC Control System",
        "Automatic Feeding",
        "Multi-Station Design",
        "Remote Diagnostics",
      ],
      zh: [
        "CNC 控制系统",
        "自动送料",
        "多工位设计",
        "远程诊断",
      ],
    },
    image: "/images/products/full-auto-bending-machine.svg",
  },
  {
    slug: "semi-auto-bending-machine",
    name: "Semi-Auto PVC Pipe Bending Machine",
    params: {
      pipeDiameter: "DN20-DN110mm",
      bendingAngles: "45°, 90°, Custom",
      heatingMethod: "Infrared / Electric",
      powerSupply: "380V/50Hz 3-Phase",
      productionSpeed: "60-80 pcs/hour",
      machineWeight: "~500kg",
    },
    highlights: {
      en: [
        "Precision Temperature Control",
        "Adjustable Bending Angles",
        "Quick-Swap Mold System",
        "Safety Features",
      ],
      zh: [
        "精密温控",
        "可调弯管角度",
        "快换模具系统",
        "安全防护功能",
      ],
    },
    image: "/images/products/semi-auto-bending-machine.svg",
  },
] as const satisfies readonly EquipmentSpec[];
```

- [ ] **Step 2: Update consumers to pass locale**

In `src/app/[locale]/capabilities/bending-machines/page.tsx`, where highlights are rendered, change from `spec.highlights` to `spec.highlights[locale as Locale]`:

Find the highlight rendering and update to use the locale-keyed array.

- [ ] **Step 3: Run type-check and tests**

Run: `pnpm type-check && pnpm exec vitest run`

Expected: All pass. If any test renders equipment highlights, update the mock to use the new `Record<Locale, string[]>` shape.

- [ ] **Step 4: Commit**

```bash
git add src/constants/equipment-specs.ts src/app/[locale]/capabilities/bending-machines/
git commit -m "$(cat <<'EOF'
feat: make equipment spec highlights locale-aware

Highlights are now Record<Locale, string[]> instead of string[],
enabling Chinese translations for bending machine feature cards.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: SEO field ownership enforcement — delete `seo.pages.*` and fix fallback owner

**Prerequisite:** All pages that previously relied on `seo.pages.*` for their title/description must have completed their MDX migration (Batch A legal pages + Batch B about/contact/oem/bending). This task is in Batch C specifically because of this dependency. Before starting, verify:

```bash
rg "generateMetadataForPath" src/app/ --glob '*.tsx' -l
```

Every page listed must be providing its own `config.title` and `config.description` from MDX frontmatter or page-specific sources. If any page still relies on translation-based SEO, migrate it first.

**Files:**
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`
- Modify: `src/lib/seo-metadata.ts`
- Modify: `src/config/single-site.ts` (if needed to ensure `SITE_CONFIG.seo` has all fallback fields)
- Test: `src/lib/__tests__/seo-metadata.test.ts`

- [ ] **Step 1: Delete entire `seo` key from translation JSON**

**CRITICAL design decision:** The spec defines the SEO fallback chain as:

```
MDX frontmatter (Layer 3)  →  SITE_CONFIG in single-site.ts (Layer 1)
```

Translation JSON (Layer 4) must NOT be a fallback source for SEO metadata. This means we delete the **entire** `seo` object from translation files — not just `seo.pages`, but also the root `seo.title`, `seo.description`, `seo.siteName`, `seo.keywords`.

In `messages/en/critical.json`, delete the entire `seo` key (lines ~694-721).
In `messages/zh/critical.json`, delete the entire `seo` key.

These values already exist in `SITE_CONFIG` at `src/config/single-site.ts` (lines 62-67):
- `SITE_CONFIG.seo.defaultTitle` → replaces `seo.title`
- `SITE_CONFIG.seo.defaultDescription` → replaces `seo.description`
- `SITE_CONFIG.name` → replaces `seo.siteName`
- `SITE_CONFIG.seo.keywords` → replaces `seo.keywords`

- [ ] **Step 2: Rewrite `src/lib/seo-metadata.ts` to use SITE_CONFIG as sole fallback**

Remove all translation-based SEO lookups:
- Delete `SEO_TRANSLATIONS` const (was reading from critical.json)
- Delete `SEOMessages` interface
- Delete `SEOPagesTranslations` type
- Delete `getPageDataByType()`, `getPageTranslation()`, `getTranslationsForLocale()`
- Delete `pickTranslatedField()` with its translation lookup chain

Simplify `generateLocalizedMetadata` to use SITE_CONFIG directly:

```typescript
export function generateLocalizedMetadata(
  locale: Locale,
  pageType: PageType,
  config: SEOConfig = {},
): Metadata {
  const safeLocale = resolveLocale(locale);

  const title = config.title
    ? interpolateSeoString(config.title)
    : SITE_CONFIG.seo.defaultTitle;
  const description = config.description
    ? interpolateSeoString(config.description)
    : SITE_CONFIG.seo.defaultDescription;
  const siteName = SITE_CONFIG.name;

  const metadata: Metadata = {
    title,
    description,
    keywords: config.keywords ?? SITE_CONFIG.seo.keywords,
    openGraph: {
      title,
      description,
      siteName,
      locale: safeLocale,
      type: (config.type === "product" ? "website" : config.type) || "website",
      images: config.image ? [{ url: config.image }] : undefined,
      publishedTime: config.publishedTime,
      modifiedTime: config.modifiedTime,
      authors: config.authors,
      section: config.section,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: config.image ? [config.image] : undefined,
    },
    alternates: {
      canonical: generateCanonicalURL(pageType, safeLocale),
      languages: generateLanguageAlternates(pageType),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -ONE,
        "max-image-preview": "large",
        "max-snippet": -ONE,
      },
    },
    verification: {
      google: getRuntimeEnvString("GOOGLE_SITE_VERIFICATION"),
      yandex: getRuntimeEnvString("YANDEX_VERIFICATION"),
    },
  };

  return metadata;
}
```

Also simplify `createPageSEOConfig` — the base keywords per page type can stay (they are structural, not content), but they should not come from translations.

- [ ] **Step 3: Update `src/lib/__tests__/seo-metadata.test.ts`**

This test file currently assumes `seo.pages.*` exists and tests translation-based lookups. Rewrite affected tests to verify:

- `config.title` (from MDX frontmatter) is used when provided
- `SITE_CONFIG.seo.defaultTitle` is used as fallback when no config.title
- No translation JSON is read for SEO purposes

Run: `pnpm exec vitest run src/lib/__tests__/seo-metadata.test.ts --reporter=verbose`

Identify all failing tests and update them.

- [ ] **Step 4: Build page-level SEO coverage checklist**

Do NOT rely solely on `rg "generateMetadataForPath"` — some pages (like current product market pages) build metadata manually. Build a complete checklist:

| Page | Provides own title/description? | Source |
|------|-------------------------------|--------|
| Home | Check | ? |
| About | Yes | MDX frontmatter (Task 9) |
| Contact | Yes | MDX frontmatter (Task 10) |
| Privacy | Yes | MDX frontmatter (Task 4) |
| Terms | Yes | MDX frontmatter (Task 5) |
| Blog listing | Check | Translation or hardcoded? |
| Blog post | Check | Post frontmatter? |
| Products listing | Check | Translation? |
| Product market | Yes (Task 19) | Translation catalog labels |
| OEM | Check | MDX frontmatter (Task 11) |
| Bending machines | Check | MDX frontmatter (Task 11) |

For any page that does NOT provide its own title/description, it will now get `SITE_CONFIG.seo.defaultTitle` — which may be wrong. Fix these before proceeding.

- [ ] **Step 5: Run validation**

Run:

```bash
pnpm type-check
pnpm lint:check
pnpm exec vitest run src/lib/__tests__/seo-metadata.test.ts
pnpm build
```

Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add messages/ src/lib/seo-metadata.ts src/lib/__tests__/seo-metadata.test.ts
git commit -m "$(cat <<'EOF'
refactor: eliminate all SEO translation keys, fallback to SITE_CONFIG

SEO metadata ownership is now: MDX frontmatter (Layer 3) with
SITE_CONFIG (Layer 1) as sole fallback. Translation JSON no longer
participates in SEO metadata at any level.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Translation file critical/deferred cleanup documentation

**Files:**
- Modify: `.claude/rules/i18n.md`

- [ ] **Step 1: Add critical/deferred split guideline to i18n rules**

Append to `.claude/rules/i18n.md`:

```markdown
## Critical vs Deferred Translation Split

- `critical.json`: Text visible on first screen without scrolling or interaction
- `deferred.json`: Text that appears after scroll or interaction

This is an optimization guideline, not a hard boundary. If post-migration volume is
small enough that the split adds more complexity than value, consolidate.

After content truth unification, translation files contain only Layer 4 UI chrome —
not page content, not FAQ, not SEO metadata.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/rules/i18n.md
git commit -m "$(cat <<'EOF'
docs: document critical/deferred translation split guideline

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Derivative project replacement runbook

**Files:**
- Modify: `docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md`

- [ ] **Step 1: Rewrite with the full 8-step runbook from the design spec**

```markdown
# Derivative Project Replacement Checklist

## Replacement order (do not reorder)

### Step 1: Brand Identity — `single-site.ts`
Company name, address, contact, established year, employee count, certifications,
export countries, social media links, SEO defaults.

### Step 2: Product Catalog — `single-site-product-catalog.ts`
Markets, families, product structure.

### Step 3: Page Assembly — `single-site-page-expression.ts`
Page switches (show FAQ, show stats), CTA targets, section ordering.

### Step 4: Page Content — `content/pages/**`
All page narrative, FAQ Q&A, hero copy, legal text. One MDX file per page per locale.

### Step 5: Crawl Strategy — `single-site-seo.ts`
Sitemap priorities, change frequencies, robots rules.

### Step 6: Brand Assets — `public/images/**`
OG images, certificates, product photos, hero images.

### Step 7: Review UI Chrome — `messages/{locale}/`
Usually no change needed. Adjust only for UI voice/tone.

### Step 8: Run Verification Chain

```bash
pnpm ci:local
pnpm build:cf
pnpm review:docs-truth
pnpm review:derivative-readiness
pnpm review:translation-quartet
```

Steps 1-6 are replacement. Step 7 is review. Step 8 is proof. Do not skip or reorder.

## What NOT to replace first

- Legal/About shell runtime mechanics
- i18n loader semantics
- Cloudflare proof model
- Security/abuse-protection chain
- Shared UI components
```

- [ ] **Step 2: Commit**

```bash
git add docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md
git commit -m "$(cat <<'EOF'
docs: write full derivative project replacement runbook

Eight-step ordered replacement path covering identity, catalog,
expression, content, SEO, assets, UI chrome review, and verification.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: Full Batch C and Series 1 validation

**Files:**
- No new files; verification only.

- [ ] **Step 1: Run full test suite**

Run: `pnpm exec vitest run`

Expected: All tests pass.

- [ ] **Step 2: Run type-check and lint**

Run: `pnpm type-check && pnpm lint:check`

Expected: Zero errors, zero warnings.

- [ ] **Step 3: Run production build**

Run: `pnpm build`

Expected: Build succeeds.

- [ ] **Step 4: Run Cloudflare build**

Run: `pnpm build:cf`

Expected: Build succeeds.

- [ ] **Step 5: Run governance proofs**

Run:

```bash
pnpm review:docs-truth
pnpm review:translation-quartet
```

Expected: All green.

- [ ] **Step 6: Commit any fixes**

Only if validation revealed issues.

---

## Series 2: SEO Completeness Closure

> Can start after Series 1 Batch A completes.

### Task 19: Product market pages adopt central metadata helper

**Files:**
- Modify: `src/app/[locale]/products/[market]/page.tsx`

- [ ] **Step 1: Replace hand-rolled metadata with `generateMetadataForPath`**

Current code (lines 68-100) builds `alternates`, `canonical`, and `openGraph` manually. Replace with:

```typescript
export async function generateMetadata({
  params,
}: MarketPageProps): Promise<Metadata> {
  const { locale, market: marketSlug } = await params;
  const market = getMarketBySlug(marketSlug);

  if (!market) return {};

  const t = await getTranslations({ locale, namespace: "catalog" });
  const marketLabel = t(`markets.${marketSlug}.label`);
  const marketDescription = t(`markets.${marketSlug}.description`);

  return generateMetadataForPath({
    locale: locale as Locale,
    pageType: "products",
    path: `/products/${market.slug}`,
    config: {
      title: `${marketLabel} | ${SITE_CONFIG.name}`,
      description: marketDescription,
    },
  });
}
```

This ensures `x-default` is included in alternates (the central helper adds it), canonical is correctly built, and the pattern matches other pages.

- [ ] **Step 2: Run type-check and build**

Run: `pnpm type-check && pnpm build`

Expected: All pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/products/[market]/page.tsx
git commit -m "$(cat <<'EOF'
refactor: product market pages use central metadata helper

Replaces hand-rolled alternates/canonical with generateMetadataForPath,
ensuring x-default hreflang and consistent SEO pattern across all pages.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: Add Product/ProductGroup structured data to market pages

**Files:**
- Modify: `src/lib/structured-data-generators.ts`
- Modify: `src/app/[locale]/products/[market]/page.tsx`

- [ ] **Step 1: Add `generateProductGroupData` to structured-data-generators**

```typescript
interface ProductGroupInput {
  name: string;
  description: string;
  url: string;
  brand: string;
  products: Array<{
    name: string;
    description?: string;
    image?: string;
    url?: string;
  }>;
}

export function generateProductGroupData(
  data: ProductGroupInput,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ProductGroup",
    name: data.name,
    description: data.description,
    url: data.url,
    brand: {
      "@type": "Brand",
      name: data.brand,
    },
    hasVariant: data.products.map((product) => ({
      "@type": "Product",
      name: product.name,
      ...(product.description ? { description: product.description } : {}),
      ...(product.image ? { image: product.image } : {}),
      ...(product.url ? { url: product.url } : {}),
    })),
  };
}
```

- [ ] **Step 2: Wire into product market page**

In `src/app/[locale]/products/[market]/page.tsx`, add JSON-LD:

```tsx
import { JsonLdScript } from "@/components/seo";
import { generateProductGroupData } from "@/lib/structured-data-generators";

// Inside the page component, after getting market + families:
const productGroupSchema = generateProductGroupData({
  name: marketLabel,
  description: marketDescription,
  url: `${SITE_CONFIG.baseUrl}/${locale}/products/${market.slug}`,
  brand: SITE_CONFIG.name,
  products: families.map((family) => ({
    name: t(`families.${family.slug}.label`),
    description: t(`families.${family.slug}.description`),
    image: family.image ? `${SITE_CONFIG.baseUrl}${family.image}` : undefined,
  })),
});

// In JSX:
<JsonLdScript data={productGroupSchema} />
```

- [ ] **Step 3: Run build and verify**

Run: `pnpm type-check && pnpm build`

Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add src/lib/structured-data-generators.ts src/app/[locale]/products/[market]/page.tsx
git commit -m "$(cat <<'EOF'
feat: add ProductGroup structured data to market pages

Product market pages now emit ProductGroup JSON-LD with brand and
product variant listings — high-value SEO for commercial pages.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 21: Fix missing blog OG image and define social image strategy

**Files:**
- Create or copy: `public/images/blog/welcome-og.jpg`
- Verify: all pages have working social image paths

- [ ] **Step 1: Fix the missing blog OG image**

The blog post `content/posts/en/welcome.mdx` and `content/posts/zh/welcome.mdx` reference `/images/blog/welcome-og.jpg` but only `/images/blog/welcome-cover.jpg` exists.

Option A: Copy `welcome-cover.jpg` to `welcome-og.jpg` (if dimensions are suitable for OG — 1200×630px).

Option B: Update the blog post frontmatter `ogImage` to point to `welcome-cover.jpg`.

Option C: Update to point to the central fallback `/images/og-image.jpg`.

The implementor should check `welcome-cover.jpg` dimensions. If it's a suitable OG image, use Option A. Otherwise use Option C.

- [ ] **Step 2: Verify all public pages have a working OG image path**

Run:

```bash
rg "ogImage\|og-image\|og_image" content/ src/app/ --glob '*.mdx' --glob '*.tsx' --glob '*.ts'
```

Check that every referenced image file exists in `public/images/`.

Central fallback: `/images/og-image.jpg` — verified to exist.

- [ ] **Step 3: Commit**

```bash
git add public/images/ content/posts/
git commit -m "$(cat <<'EOF'
fix: resolve missing blog OG image reference

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: Legal/About/Capability schema coverage

**Files:**
- Modify: `src/components/content/legal-page-shell.tsx` (terms schema type)
- Modify: `src/components/content/about-page-shell.tsx` (add AboutPage schema)
- Modify: `src/app/[locale]/oem-custom-manufacturing/page.tsx` (add schema)
- Modify: `src/app/[locale]/capabilities/bending-machines/page.tsx` (add schema)

- [ ] **Step 1: Terms page — upgrade to legal-specific schema**

The legal page shell already accepts `schemaType` — terms page passes `"WebPage"`. The design spec asks to upgrade terms to match privacy's `"PrivacyPolicy"` equivalent. There's no standard Schema.org "TermsOfService" type, but we can use `"WebPage"` with `additionalType: "https://schema.org/TermsOfService"`.

Update the legal shell to accept an optional `additionalType`:

```typescript
interface LegalPageShellProps {
  metadata: LegalPageMetadata;
  content: string;
  headings: HeadingItem[];
  locale: string;
  schemaType: "PrivacyPolicy" | "WebPage";
  schemaAdditionalType?: string;
}
```

In the schema object:

```typescript
const schema = {
  "@context": "https://schema.org",
  "@type": schemaType,
  ...(schemaAdditionalType ? { additionalType: schemaAdditionalType } : {}),
  // ... rest
};
```

Terms page passes `schemaAdditionalType: "https://schema.org/TermsOfService"`.

- [ ] **Step 2: About page — add Organization + AboutPage schema**

In `about-page-shell.tsx`, add JSON-LD:

```typescript
const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: metadata.title,
  description: metadata.description,
  inLanguage: locale,
  mainEntity: {
    "@type": "Organization",
    name: siteFacts.company.name,
    foundingDate: String(siteFacts.company.established),
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: siteFacts.company.employees,
    },
  },
};
```

- [ ] **Step 3: OEM page — add WebPage + service schema**

Add to OEM page:

```typescript
const oemSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: t("meta.title"),
  description: t("meta.description"),
  inLanguage: locale,
  specialty: "OEM Custom Manufacturing",
};
```

- [ ] **Step 4: Bending Machines page — add Product schema for equipment**

```typescript
const equipmentSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "PVC Pipe Bending Machines",
  itemListElement: EQUIPMENT_SPECS.map((spec, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Product",
      name: spec.name,
      description: spec.highlights[locale as Locale].join(", "),
    },
  })),
};
```

- [ ] **Step 5: Run build and verify**

Run: `pnpm type-check && pnpm build`

Expected: All pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/content/ src/app/[locale]/oem-custom-manufacturing/ src/app/[locale]/capabilities/bending-machines/ src/app/[locale]/terms/
git commit -m "$(cat <<'EOF'
feat: add page-specific structured data to terms, about, OEM, bending machines

Terms gets TermsOfService additionalType. About gets AboutPage +
Organization. OEM gets specialty WebPage. Bending machines gets
Product ItemList for equipment specs.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 23: Sitemap content-driven lastmod dates

**Files:**
- Modify: `src/app/sitemap.ts`
- Modify: `src/config/single-site-seo.ts`
- Create: `src/lib/content/page-dates.ts`
- Test: `src/app/__tests__/sitemap.test.ts`

**Design decision:** Lastmod dates come from different truth sources depending on page type:

| Page type | Truth source | Rationale |
|-----------|-------------|-----------|
| MDX content pages (about, contact, privacy, terms, oem, bending-machines) | MDX `updatedAt` across locales (max) | Content-driven |
| Blog listing (`/blog`) | Most recent blog post `updatedAt` | Listing freshness = newest child |
| Products listing (`/products`) | Kept in `single-site-seo.ts` sidecar | No single content source — changes when catalog changes |
| Home page (`""`) | Kept in `single-site-seo.ts` sidecar | No MDX source; changes based on business decisions |
| Blog detail posts | Post `updatedAt` from frontmatter | Already content-driven in current sitemap |
| Product market pages | Kept in sidecar or derived from catalog config date | No MDX source |

- [ ] **Step 1: Create page date resolver with type-aware logic**

Create `src/lib/content/page-dates.ts`:

```typescript
import type { Locale } from "@/types/content.types";
import { getPageBySlug } from "@/lib/content";
import { routing } from "@/i18n/routing";

const MDX_PAGE_SLUGS: Record<string, string> = {
  "/about": "about",
  "/contact": "contact",
  "/privacy": "privacy",
  "/terms": "terms",
  "/capabilities/bending-machines": "bending-machines",
  "/oem-custom-manufacturing": "oem-custom-manufacturing",
};

export function isMdxDrivenPage(path: string): boolean {
  return path in MDX_PAGE_SLUGS;
}

export async function getMdxPageLastModified(path: string): Promise<Date> {
  const slug = MDX_PAGE_SLUGS[path];
  if (!slug) {
    throw new Error(`No MDX slug mapping for path: ${path}`);
  }

  let latest = new Date(0);

  for (const locale of routing.locales) {
    try {
      const page = await getPageBySlug(slug, locale as Locale);
      const dateStr = page.metadata.updatedAt ?? page.metadata.publishedAt;
      const date = new Date(dateStr);
      if (date > latest) {
        latest = date;
      }
    } catch {
      // Page may not exist for this locale yet
    }
  }

  if (latest.getTime() === 0) {
    throw new Error(`No content found for slug: ${slug}`);
  }

  return latest;
}
```

Key differences from the original:
- No `home`, `/products`, `/blog` in the slug map — they are NOT MDX-driven
- Throws instead of silently returning `new Date()` — if content is expected but missing, that's a build error, not a silent fallback
- `isMdxDrivenPage()` lets the sitemap decide which path to take

- [ ] **Step 2: Refactor `SINGLE_SITE_STATIC_PAGE_LASTMOD` to only cover non-MDX pages**

In `src/config/single-site-seo.ts`, keep `SINGLE_SITE_STATIC_PAGE_LASTMOD` but remove entries for MDX-driven pages:

```typescript
export const SINGLE_SITE_STATIC_PAGE_LASTMOD = {
  "": "2024-12-01T00:00:00Z",
  "/products": "2024-11-01T00:00:00Z",
  "/blog": "2024-11-01T00:00:00Z",
} as const satisfies Record<string, string>;
```

The MDX-driven pages (`/about`, `/contact`, `/privacy`, `/terms`, `/capabilities/bending-machines`, `/oem-custom-manufacturing`) are removed — their dates now come from content.

Add a comment explaining the split.

- [ ] **Step 3: Update sitemap to use hybrid lastmod strategy**

In `src/app/sitemap.ts`, update `generateStaticPageEntries` to be async and use the hybrid approach:

```typescript
import { isMdxDrivenPage, getMdxPageLastModified } from "@/lib/content/page-dates";

async function generateStaticPageEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const page of SINGLE_SITE_PUBLIC_STATIC_PAGES) {
      const config = getPageConfig(page);
      const url = `${BASE_URL}/${locale}${page}`;
      const alternates = buildAlternateLanguages(page);

      const lastModified = isMdxDrivenPage(page)
        ? await getMdxPageLastModified(page)
        : getStaticPageLastModified(page, STATIC_PAGE_LASTMOD);

      entries.push(
        createSitemapEntry({ url, lastModified, config, alternates }),
      );
    }
  }

  return entries;
}
```

- [ ] **Step 4: Fix product catalog entries — replace `new Date()` with sidecar date**

Current `generateCatalogEntries()` uses `const now = new Date()` for all product market pages. This is the exact problem the spec calls out. Fix by adding product market pages to the sidecar config:

In `src/config/single-site-seo.ts`, add entries for product market pages:

```typescript
export const SINGLE_SITE_STATIC_PAGE_LASTMOD = {
  "": "2024-12-01T00:00:00Z",
  "/products": "2024-11-01T00:00:00Z",
  "/blog": "2024-11-01T00:00:00Z",
  "/products/north-america": "2024-11-01T00:00:00Z",
  "/products/australia-new-zealand": "2024-11-01T00:00:00Z",
  "/products/mexico": "2024-11-01T00:00:00Z",
  "/products/europe": "2024-11-01T00:00:00Z",
  "/products/pneumatic-tube-systems": "2024-11-01T00:00:00Z",
} as const satisfies Record<string, string>;
```

Then update `generateCatalogEntries()` to use the sidecar instead of `new Date()`:

```typescript
function generateCatalogEntries(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const marketConfig = getPageConfig("productMarket");

  for (const market of PRODUCT_CATALOG.markets) {
    const path = `/products/${market.slug}`;
    const lastModified = getStaticPageLastModified(path, STATIC_PAGE_LASTMOD);

    for (const locale of routing.locales) {
      entries.push(
        createSitemapEntry({
          url: `${BASE_URL}/${locale}${path}`,
          lastModified,
          config: marketConfig,
          alternates: buildAlternateLanguages(path),
        }),
      );
    }
  }

  return entries;
}
```

This is not ideal (still manually maintained dates), but it's correct per the spec — product market pages have no MDX source, so sidecar config is the documented truth source. Update these dates whenever the product catalog changes.

- [ ] **Step 5: Update blog listing lastmod**

For the `/blog` sidecar entry, derive lastmod from the most recent blog post's `updatedAt`:

```typescript
// In the main sitemap() function, after fetching blog entries:
const blogEntries = await generateBlogEntries();
// Update /blog listing entry's lastModified to match newest post
```

If this adds too much complexity, keep `/blog` in the sidecar config for now.

- [ ] **Step 6: Update `src/app/__tests__/sitemap.test.ts`**

This test currently mocks `getStaticPageLastModified` and the old lastmod config. Update to:
- Mock `getMdxPageLastModified` for MDX-driven pages
- Keep static fallback for non-MDX pages and product market pages
- Verify MDX pages get content-driven dates
- Verify non-MDX pages get sidecar dates
- Verify product market pages use sidecar dates (not `new Date()`)

- [ ] **Step 7: Verify sitemap coverage**

Run: `pnpm build` then check the generated sitemap output.

Verify:
- All product market pages from `PRODUCT_CATALOG.markets` appear
- Blog detail pages include proper alternates with `x-default`
- No page uses `new Date()` as lastmod
- No orphan URLs

- [ ] **Step 8: Run build and verify lastmod**

Run:

```bash
pnpm build
```

Inspect the generated sitemap to verify lastmod dates come from MDX content, not hardcoded timestamps.

- [ ] **Step 7: Commit**

```bash
git add src/lib/content/page-dates.ts src/app/sitemap.ts src/config/single-site-seo.ts
git commit -m "$(cat <<'EOF'
feat: sitemap lastmod from content-driven dates

Replaces hardcoded SINGLE_SITE_STATIC_PAGE_LASTMOD with dates read
from MDX updatedAt across locales. Sitemap now reflects actual
content freshness.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 24: Series 2 final validation

**Files:**
- No new files; verification only.

- [ ] **Step 1: Run full test suite**

Run: `pnpm exec vitest run`

Expected: All pass.

- [ ] **Step 2: Run build chain**

Run:

```bash
pnpm type-check
pnpm lint:check
pnpm build
pnpm build:cf
```

Expected: All pass.

- [ ] **Step 3: Spot-check structured data in build output**

After build, inspect a product market page, about page, and terms page in the build output to verify JSON-LD scripts are present.

- [ ] **Step 4: Commit any fixes**

Only if validation revealed issues.

---

## Series 3: Proof Integrity

> Independent of Series 1 and 2. Can run in parallel or after. Does not modify the same files.

### Task 25: Test lane audit and proof boundary documentation

**Files:**
- Create: `docs/guides/PROOF-BOUNDARY-MAP.md`

- [ ] **Step 1: Audit what each test/proof command actually proves**

Run each command and document what it proves vs what people might assume:

| Command | Actually proves | Does NOT prove |
|---------|----------------|----------------|
| `pnpm test` (vitest) | Unit/integration test assertions pass | Runtime behavior, visual rendering, Cloudflare compat |
| `pnpm type-check` | TypeScript types are consistent | Runtime correctness, content correctness |
| `pnpm lint:check` | Code style rules pass | Logical correctness |
| `pnpm build` | Next.js production build succeeds | Cloudflare deployment works |
| `pnpm build:cf` | OpenNext/Cloudflare adapter build succeeds | Actual deployment, edge runtime behavior |
| `pnpm review:translation-quartet` | Translation key parity | Translation quality/accuracy |
| `pnpm review:docs-truth` | Docs reference existing files/exports | Docs are comprehensive or current |

- [ ] **Step 2: Write `docs/guides/PROOF-BOUNDARY-MAP.md`**

```markdown
# Proof Boundary Map

What each proof command actually validates and where the boundary lies.

## Local proof (developer machine)

| Command | Proves | Boundary |
|---------|--------|----------|
| `pnpm test` | Test assertions | Not runtime behavior |
| `pnpm type-check` | Type consistency | Not runtime correctness |
| `pnpm lint:check` | Style rules | Not logic |
| `pnpm build` | Next.js build | Not Cloudflare |
| `pnpm build:cf` | Cloudflare adapter build | Not actual deployment |

## CI proof (GitHub Actions)

Same commands in a clean environment. Proves reproducibility.
Does not prove Cloudflare edge runtime behavior.

## Deployment proof (Cloudflare Pages)

Only a successful deployment + smoke test proves the site works.
Build success ≠ deployment success.

## The confidence gap

Test suites can go green while proving something narrower than assumed.
A test that mocks the content loader proves the mock, not the content.
A build that succeeds with stale MDX proves the build, not the content.

When claiming "this works," be specific about which proof level you mean.
```

- [ ] **Step 3: Commit**

```bash
git add docs/guides/PROOF-BOUNDARY-MAP.md
git commit -m "$(cat <<'EOF'
docs: add proof boundary map

Documents what each test/build command actually proves vs what might
be assumed. Identifies the confidence gap between local proof and
deployment proof.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Final: Mark the old plan as superseded

### Task 26: Archive the old plan

**Files:**
- Modify: `docs/superpowers/plans/2026-04-23-content-truth-legal-about.md`

- [ ] **Step 1: Add superseded notice to old plan**

Prepend to the file:

```markdown
> **⚠️ SUPERSEDED** — This plan has been absorbed into the project-wide truth & quality unification plan at `docs/superpowers/plans/2026-04-23-project-truth-quality-unification.md`. Do not execute this plan independently.

---

```

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-04-23-content-truth-legal-about.md
git commit -m "$(cat <<'EOF'
docs: mark old legal+about plan as superseded

Absorbed into the project-wide truth & quality unification plan.

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Decision summary

### Content truth changes
- Legal pages: unified through one shared shell, metadata from MDX frontmatter, TOC from headings
- About page: MDX-first with controlled shell for FAQ/CTA/stats
- Contact page: hero/FAQ to MDX, form labels stay in translation JSON
- OEM and bending machine pages: structured-card exception; MDX owns FAQ/SEO metadata, while scope cards, process steps, standards, and CTA copy stay in translation namespaces
- FAQ: per-page MDX frontmatter, no shared pool
- Equipment: highlights become `Record<Locale, string[]>`
- SEO: `seo.pages.*` eliminated, MDX frontmatter owns page metadata

### SEO completeness
- Product pages: central metadata helper + ProductGroup structured data
- Missing OG image: fixed
- Schema coverage: all public pages have appropriate structured data
- Sitemap: content-driven lastmod dates

### Proof integrity
- Documented what each proof command actually proves
- Identified the confidence gap between local and deployment proof

### What was NOT changed
- Home page, nav, footer, product catalog structure, product detail pages, error pages, shared components
- `single-site*.ts` config structure (already clean)
- Security contracts
- Multi-language expansion beyond en/zh

### Known debt
- About page values/stats/CTA copy currently lives in `SINGLE_SITE_ABOUT_SHELL_COPY`; under the strict four-layer rule it should move to Layer 3 content later. This follow-up migration is out of scope for this plan.
