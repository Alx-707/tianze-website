# Batch 3: Distributed FAQ + Core Numbers Unification

> **For agentic workers:** This is a design specification. Use superpowers:writing-plans to create the implementation plan.

**Goal:** Replace template placeholder FAQ with PVC conduit-specific content distributed across relevant pages (not a standalone FAQ page); unify hardcoded company numbers site-wide via `siteFacts`.

**Scope reduction:** Certifications standalone page (`/certifications`) deferred — only 1 cert (ISO 9001) currently held. Homepage QualitySection (Batch 2) already displays certification info.

**Design pivot (v2):** Original spec designed a standalone `/faq` page. User feedback: buyers don't visit a separate FAQ page — questions should appear where they arise. Pivoted to distributed FAQ: each page gets contextual Q&As relevant to that page's content.

---

## Feature 1: Distributed FAQ Sections

### Problem

Current FAQ page (`/faq`) has two issues:

1. **Content**: Template boilerplate mentioning CE, API, ASME, RoHS — none relevant to PVC conduit fittings.
2. **Delivery**: A standalone FAQ page is the wrong UX for B2B buyers. Buyers researching products need technical answers on the product page. Buyers ready to order need process answers on the contact page. A centralized FAQ hub forces unnecessary navigation.

### Solution: Contextual FAQ Sections

A reusable `FaqSection` component that can be embedded in any page's bottom area (before FinalCTA). Each page receives only the questions relevant to its context.

### FAQ Distribution Map

#### Contact Page `/contact` — 5 questions (Ordering & Purchasing)

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | What is the minimum order quantity (MOQ)? | 500-1000 pcs depending on pipe type; trial orders negotiable |
| 2 | What is the lead time for standard orders? | 15-30 days depending on quantity and customization |
| 3 | What payment terms do you accept? | T/T 30% deposit + 70% before shipment; L/C for large orders |
| 4 | Do you offer free samples? | Yes for standard products, freight paid by buyer |
| 5 | Can you do OEM / custom labeling? | Custom color, printing, packaging available; MOQ may apply |

#### About Page `/about` — 5 questions (Factory Qualifications + Certifications)

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | Are you a manufacturer or trading company? | Direct manufacturer — bending machine maker turned conduit producer |
| 2 | Where is your factory? Can I visit? | Lianyungang, Jiangsu. Visits welcome, video tours available |
| 3 | How long have you been exporting? | Since 2018, 20+ countries |
| 4 | What certifications do your products hold? | ISO 9001 certified + 4 standards compliance |
| 5 | How can I verify your certifications? | Certificate number, PDF, third-party audit |

#### Product Pages `/products/[market]` — 6 questions (Technical + Standards)

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | What is the difference between Schedule 40 and Schedule 80? | Wall thickness, use cases |
| 2 | How do I choose the right conduit size? | Wire fill capacity, NEC guidelines |
| 3 | What is the minimum bending radius for PVC conduit? | Size-dependent, NEC Table 344.24 |
| 4 | What are the mechanical strength grades (heavy/medium/light)? | IEC 61386 classification |
| 5 | What is LSZH and when is it needed? | Low Smoke Zero Halogen, required scenarios |
| 6 | What is the difference between UL 651, IEC 61386, and AS/NZS 61386? | Regional standard comparison |

Note: Product pages have 5 market variants. All share the same technical FAQ. Market-specific questions (e.g., "Does your conduit meet NEC code?") are deferred to a future batch when product page i18n is complete.

#### OEM Page `/oem-custom-manufacturing` — 2 questions

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | Can you do OEM / custom labeling? | (reuse from contact FAQ) |
| 2 | Do you offer free samples? | (reuse from contact FAQ) |

#### Bending Machines Page `/capabilities/bending-machines` — 2 questions

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | What is the minimum bending radius for PVC conduit? | (reuse from product FAQ) |
| 2 | Are you a manufacturer or trading company? | (reuse from about FAQ) |

### Reusable FaqSection Component

#### Component API

```tsx
interface FaqSectionProps {
  /** Translation namespace containing the FAQ items */
  namespace: string;
  /** Section title — rendered via SectionHead */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** FAQ item keys within the namespace */
  items: string[];
}

// Usage example:
<FaqSection
  namespace="contact.faq"
  title={t("faq.title")}
  items={["moq", "leadTime", "payment", "samples", "oem"]}
/>
```

#### Visual Structure

```
section-divider
Section (py-14 md:py-[72px])
  SectionHead (title: "Frequently Asked Questions" or localized variant)
  Accordion group (shadow-card container, multi-expand)
    Accordion item (question → answer, chevron toggle)
    Accordion item ...
```

#### Design Token Constraints

- Section inherits page container (`mx-auto max-w-[1080px] px-6`)
- Section spacing: `py-14 md:py-[72px]` with `section-divider` border-top
- Accordion container: `shadow-card` system (not `border`)
- Individual items: NO per-item shadow hover — only open/close interaction
- Question text: `text-[15px] font-medium` on desktop, `text-sm` on mobile
- Answer text: `text-sm leading-relaxed text-muted-foreground`
- Tables inside answers: wrapped in `overflow-x: auto` for mobile
- Specs/standards in answers: `font-mono text-[13px]`
- Chevron: 20x20, `text-muted-foreground`, rotates 180deg on open
- No GridFrame (component is inserted into existing page layouts)

#### Accessibility

- Uses existing `src/components/ui/accordion.tsx` (Radix-based, `"use client"`)
- Radix Accordion provides: keyboard nav (Enter/Space toggle, arrow keys), `aria-expanded`, `aria-controls`, `role="region"`
- Multi-expand mode (`type="multiple"` in Radix Accordion)

### Data Source: Translation Keys

FAQ content lives in translation files, NOT in MDX. This allows:
- Reuse of the same Q&A across multiple pages
- Dynamic rendering without MDX parsing
- FAQ Schema generation from structured data

#### i18n Key Structure

Each page's FAQ lives under `{page}.faq` in `messages/{locale}/deferred.json`:

```json
{
  "contact": {
    "faq": {
      "title": "Frequently Asked Questions",
      "items": {
        "moq": {
          "question": "What is the minimum order quantity (MOQ)?",
          "answer": "Our MOQ is typically 500 to 1,000 pieces..."
        },
        "leadTime": {
          "question": "What is the lead time for standard orders?",
          "answer": "Standard orders ship within 15 to 30 days..."
        }
      }
    }
  },
  "about": {
    "faq": {
      "title": "Common Questions",
      "items": {
        "manufacturer": {
          "question": "Are you a manufacturer or trading company?",
          "answer": "We are a direct manufacturer..."
        }
      }
    }
  }
}
```

Shared questions (e.g., OEM FAQ reuses contact FAQ keys) reference the same translation path. Implementation detail: either duplicate the keys or use a shared `faq` namespace with page-level item lists.

#### FAQ Schema (SEO)

Each page generates its own `FAQPage` JSON-LD schema from its FAQ items:

```tsx
const faqSchema = generateFAQSchema(
  items.map(key => ({
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`),
  })),
  locale,
);
```

This distributes FAQ rich results across multiple pages instead of concentrating on one — better for SEO since each page targets different keyword clusters.

### Route Cleanup: Remove `/faq`

The standalone FAQ page and its assets are removed:

| Action | Target |
|--------|--------|
| Delete route | `src/app/[locale]/faq/page.tsx` |
| Delete tests | `src/app/[locale]/faq/__tests__/page.test.tsx`, `page-async.test.tsx` |
| Delete content | `content/pages/en/faq.mdx`, `content/pages/zh/faq.mdx` |
| Clean sitemap | Remove FAQ from `src/app/sitemap.ts` |
| Clean paths config | Remove FAQ from `src/config/paths/paths-config.ts` |
| Clean navigation | Remove FAQ links from header/footer navigation |
| Clean i18n | Remove old `faq` namespace from `messages/{locale}/deferred.json` |
| Add redirect | Optional: 301 redirect `/faq` → `/contact` (most relevant landing) |

### Content Source

FAQ content authored via `/cwf` workflow: `docs/content/faq/v1-final.md` (en) and `docs/content/faq/v1-zh-final.md` (zh). These files contain all 20 questions with full answers. During implementation, content is extracted into translation key structure described above.

### Execution Sequence

1. `/dwf` — Design `FaqSection` component prototype (with token constraints above)
2. `writing-plans` — Implementation plan (component + 5 page integrations + route cleanup)
3. TDD — Build and test
4. `/pr` — Submit

---

## Feature 2: Core Numbers Unification (A-1)

### Problem

Company numbers (founding year, export countries, employees, etc.) may be hardcoded in multiple locations across the codebase, risking inconsistency. `siteFacts` exists and is partially used, but full adoption hasn't been verified.

### Data Source of Truth

`src/config/site-facts.ts` — already contains:

```typescript
company.established: 2018
company.employees: 60
stats.exportCountries: 20
contact.*: from SITE_CONFIG
certifications: [{ name: "ISO 9001:2015", certificateNumber: "240021Q09730R0S", ... }]
```

### Audit Scope

Start with a grep scan to locate all hardcoded instances:

```bash
grep -rn "2018\|\"20+\"\|\"20\"\|\"60+\"\|\"60\"" src/ messages/ --include="*.ts" --include="*.tsx" --include="*.json"
```

Then verify each location:

| Location | What to Check |
|----------|---------------|
| `src/app/[locale]/about/page.tsx` | Already uses `siteFacts` — verify no fallback literals remain |
| `src/components/sections/*.tsx` | Homepage sections — check for hardcoded numbers |
| `src/components/blocks/**/*.tsx` | Block templates — check for hardcoded numbers |
| `messages/en/critical.json` | Translation strings containing literal numbers (e.g., "20+ countries") |
| `messages/zh/critical.json` | Same check for Chinese translations |
| `messages/en/deferred.json` | Same check |
| `messages/zh/deferred.json` | Same check |
| `content/pages/*/about.mdx` | MDX content with company numbers |
| `src/config/site-facts.ts` | Verify all values are current and consistent |

### Fix Strategy

1. **TSX components**: Replace hardcoded numbers with `siteFacts.*` imports
2. **Translation files**: Use ICU message format interpolation. The `+` suffix belongs in the message template, not the data value:
   ```json
   "subtitle": "Exporting to {countries}+ countries since {year}"
   ```
   Components pass values: `t('subtitle', { countries: siteFacts.stats.exportCountries, year: siteFacts.company.established })`

   Important: `siteFacts.stats.exportCountries` is `20` (bare number). The `+` is part of the message string, not the data. Do NOT concatenate `+` in both template and data.
3. **MDX content**: MDX files cannot dynamically inject values. Numbers in MDX are manually maintained — add a comment at the top of relevant MDX files noting they must be kept in sync with `siteFacts`.

### Validation

After fixes:
- `pnpm type-check` — no type errors
- `pnpm test` — existing tests pass
- `pnpm build` — successful build
- Re-run the grep scan to verify no remaining hardcoded instances in `src/` and `messages/`

### Execution Sequence

This is a code-only task (no `/cwf` or `/dwf` needed):
1. `writing-plans` — Implementation plan with audit + fix tasks
2. TDD — Test that components use `siteFacts` correctly
3. Part of same PR as Feature 1

---

## Files Changed (Expected)

### Feature 1: Distributed FAQ

| File | Action |
|------|--------|
| `src/components/sections/faq-section.tsx` | **New** — Reusable FaqSection component |
| `src/components/sections/__tests__/faq-section.test.tsx` | **New** — Component tests |
| `src/app/[locale]/contact/page.tsx` | Add FaqSection with ordering questions |
| `src/app/[locale]/about/page.tsx` | Add FaqSection with factory/cert questions |
| `src/app/[locale]/products/[market]/page.tsx` | Add FaqSection with technical questions |
| `src/app/[locale]/oem-custom-manufacturing/page.tsx` | Add FaqSection with OEM questions |
| `src/app/[locale]/capabilities/bending-machines/page.tsx` | Add FaqSection with relevant questions |
| `messages/en/deferred.json` | Add FAQ items under each page's namespace |
| `messages/zh/deferred.json` | Same |
| `src/app/[locale]/faq/page.tsx` | **Delete** |
| `src/app/[locale]/faq/__tests__/*.tsx` | **Delete** |
| `content/pages/en/faq.mdx` | **Delete** |
| `content/pages/zh/faq.mdx` | **Delete** |
| `src/app/sitemap.ts` | Remove `/faq` route |
| `src/config/paths/paths-config.ts` | Remove FAQ from config |
| Navigation components | Remove FAQ links |

### Feature 2: Core Numbers

| File | Action |
|------|--------|
| `messages/en/critical.json` | Replace literal numbers with ICU placeholders |
| `messages/zh/critical.json` | Same |
| `messages/en/deferred.json` | Replace literal numbers with ICU placeholders (if found) |
| `messages/zh/deferred.json` | Same |
| `src/components/sections/*.tsx` | Replace hardcoded numbers with `siteFacts` refs (if any found) |
| `src/app/[locale]/about/page.tsx` | Verify/fix remaining hardcoded numbers |
| Various test files | Update tests if component APIs change |

---

## Out of Scope

- Certifications standalone page (deferred until AS/NZS 61386 approved)
- Market-specific product FAQ (e.g., "Does your conduit meet NEC code?") — deferred until product page i18n complete
- Blog content (separate batch)
- About/Contact page full layout redesign to PAGE-PATTERNS.md (tracked separately)
- Rich answer formatting in FAQ (tables, lists inside answers) — first version uses plain text answers; rich formatting added if needed later

## Dependencies

- `/cwf` FAQ content already complete (docs/content/faq/v1-final.md + v1-zh-final.md)
- `/dwf` must complete FaqSection component prototype before implementation
- Core numbers (A-1) has no dependencies, can be implemented independently

## Success Criteria

1. 5 pages display contextual FAQ sections with relevant questions
2. FaqSection component follows PAGE-PATTERNS.md token system (shadow-card, SectionHead, spacing)
3. Each page generates its own FAQPage Schema structured data
4. Standalone `/faq` route removed, no dead links remain
5. No hardcoded company numbers remain in `src/` or `messages/` — all reference `siteFacts`
6. Both en and zh FAQ content complete and accurate
7. `pnpm ci:local:quick` passes
