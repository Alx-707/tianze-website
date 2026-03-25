# Batch 3: FAQ Redesign + Core Numbers Unification

> **For agentic workers:** This is a design specification. Use superpowers:writing-plans to create the implementation plan.

**Goal:** Replace template placeholder FAQ with PVC conduit-specific content + redesigned layout aligned to homepage design tokens; unify hardcoded company numbers site-wide via `siteFacts`.

**Scope reduction:** Certifications standalone page (`/certifications`) deferred — only 1 cert (ISO 9001) currently held. Will revisit when AS/NZS 61386 is approved. Homepage QualitySection (Batch 2) already displays certification info.

---

## Feature 1: FAQ Page Redesign

### Problem

Current FAQ page (`/faq`) has two issues:

1. **Content**: Template boilerplate mentioning CE, API, ASME, RoHS — none relevant to PVC conduit fittings. Zero value to buyers.
2. **Layout**: Deviates from homepage design tokens on every dimension (container, spacing, typography, card system, CTA pattern).

### Content Structure

5 categories, ~20 questions. Content to be authored via `/cwf` workflow before implementation.

#### Category 1: Ordering & Purchasing (5 questions)

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | What is the minimum order quantity (MOQ)? | 500-1000 pcs depending on pipe type; trial orders negotiable |
| 2 | What is the lead time for standard orders? | 15-30 days depending on quantity and customization |
| 3 | What payment terms do you accept? | T/T 30% deposit + 70% before shipment; L/C for large orders |
| 4 | Do you offer free samples? | Yes for standard products, freight paid by buyer |
| 5 | Can you do OEM / custom labeling? | Custom color, printing, packaging available; MOQ may apply |

#### Category 2: Certifications & Standards (3 questions)

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | What certifications do your products hold? | ISO 9001:2015 certified (#240021Q09730R0S); products tested to ASTM D1785, IEC 61386, AS/NZS 61386 (applying), NOM-001-SEDE |
| 2 | What is the difference between UL, IEC, and AS/NZS standards? | Market-specific: UL 651 for North America, IEC 61386 for Europe/Asia, AS/NZS 61386 for Australia/NZ. Explain key differences in testing requirements |
| 3 | How can I verify your certifications? | ISO cert number provided, explain how to verify via certification body website |

#### Category 3: Technical Selection (5 questions)

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | What is the difference between Schedule 40 and Schedule 80? | Wall thickness, pressure rating, application scenarios. Sch 80 for exposed/high-impact, Sch 40 for standard concealed |
| 2 | How do I choose the right conduit size? | Based on wire fill capacity, NEC/local code requirements. Reference sizing chart |
| 3 | What is the minimum bending radius for PVC conduit? | Depends on conduit size, per NFPA 70 / NEC Table 344.24. Tianze's bending machines ensure precision bends |
| 4 | What are the mechanical strength grades (heavy/medium/light)? | IEC 61386 classification: heavy (750N), medium (320N), light (320N at reduced). Application-based selection |
| 5 | What is LSZH and when is it needed? | Low Smoke Zero Halogen — required in enclosed public spaces, transit systems, data centers |

#### Category 4: Installation & Application (4 questions)

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | Can PVC conduit be direct-buried or encased in concrete? | Yes, Schedule 80 rated for direct burial per NEC. Explain concrete encasement requirements |
| 2 | What is the difference between indoor and outdoor installation? | UV resistance, sunlight exposure ratings, conduit body requirements for outdoor |
| 3 | Is your conduit suitable for solar/data center projects? | Yes, explain relevant specs for each scenario |
| 4 | How does PVC conduit perform in corrosive environments? | Inherent chemical resistance of PVC, no galvanic corrosion, ideal for industrial/coastal |

#### Category 5: Factory & Supplier Qualifications (3 questions)

| # | Question | Answer Key Points |
|---|----------|-------------------|
| 1 | Are you a manufacturer or trading company? | Direct manufacturer — we build our own bending machines, then use them to make conduit fittings. Full vertical integration from R&D to finished product |
| 2 | Where is your factory? Can I visit? | Lianyungang, Jiangsu, China. Factory visits welcome, video tours available |
| 3 | How long have you been exporting? | Est. 2018, exporting to 20+ countries. Reference siteFacts for exact numbers |

### Layout Design

#### Current Issues (vs PAGE-PATTERNS.md)

| Element | Current | Required |
|---------|---------|----------|
| Container | `container mx-auto px-4` | `mx-auto max-w-[1080px] px-6` |
| Section spacing | `py-8 md:py-12` | `py-14 md:py-[72px]` |
| H1 | `text-heading` (utility class) | Precise params: `text-[36px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[48px] md:leading-[1.0] md:tracking-[-0.05em]` |
| Section titles | Plain `<h2>` | `SectionHead` component |
| Q&A cards | Native `<details>` + `border bg-card` | `shadow-card` system |
| Bottom CTA | `border bg-muted/40` box | Full-width dark CTA pattern |
| GridFrame | N/A | Not used (content page) |

#### New Page Structure

```
Hero Section
  Eyebrow: "PVC Conduit FAQ" (text-[13px] font-semibold uppercase tracking-[0.04em] text-primary)
  H1: Precise typography params (36/48px extrabold)
  Description: text-lg text-muted-foreground

Category Index (static anchor navigation)
  5 category labels as inline links (<nav> with <a href="#section-id">)
  Renders as a static anchor list — NO sticky behavior in this iteration
  (If /dwf explicitly designs sticky nav, implement as a separate Client Component)

Section x5 (one per category, section-divider between)
  SectionHead (category title)
  Q&A group: one shadow-card container per category
    Individual accordion items inside — NO per-item shadow hover states
    Only the open/close interaction (chevron rotation, content expand)
    Question: font-medium, chevron icon for expand/collapse
    Answer: text-sm leading-relaxed text-muted-foreground

FAQ CTA Section (full-width dark, local to FAQ page)
  bg-primary py-14 md:py-[72px]
  "Still Have Questions?" + Contact button (on-dark variant)
  NOTE: Do NOT reuse the shared FinalCTA component (src/components/sections/final-cta.tsx)
  — it is homepage-specific (uses HomepageTrustStrip, HOMEPAGE_SECTION_LINKS).
  Create a local FAQ CTA section or a generic reusable CTA component.
```

#### Design Token Constraints for /dwf

These are non-negotiable constraints that the `/dwf` HTML prototype must follow:

- Container: `mx-auto max-w-[1080px] px-6`
- Section rhythm: `py-14 md:py-[72px]`
- Card system: `shadow-card` for category containers (not `border`). Individual accordion items inside do NOT have shadow hover — only open/close interaction.
- Typography: PAGE-PATTERNS.md ladder (H1/H2/H3/body/mono)
- Button variants: `default` for primary CTA, `on-dark` / `ghost-dark` for dark CTA section
- Colors: design tokens from `globals.css` only, no hardcoded hex
- Responsive: mobile single-column, sm/md/lg breakpoints per PAGE-PATTERNS.md
- No GridFrame (content page per PAGE-PATTERNS.md section 12)

### Technical Implementation Notes

- **Content source**: MDX files (`content/pages/{en,zh}/faq.mdx`) — rewritten by `/cwf`
- **Parser**: Existing `parseFaqContent()` retained (parses `##` as category, `###` as question)
- **FAQ Schema**: `generateFAQSchema()` retained for SEO structured data
- **i18n**: Page-level copy (title, description, CTA, category labels) via translation keys in `messages/{locale}/deferred.json` under existing `faq` namespace. Q&A content lives in MDX (inherently locale-split).
- **Accordion component**: Use existing `src/components/ui/accordion.tsx` (Radix-based, already `"use client"`). It can be imported directly — no `next/dynamic` or `ssr: false` wrapper needed since it's already a Client Component.
- **Accessibility**: Radix Accordion provides keyboard navigation out of the box (Enter/Space to toggle, arrow keys between items). Verify during testing.
- **Loading skeleton**: `FaqLoadingSkeleton` must also be updated to match the new layout structure.

### i18n Key Schema

The `faq` namespace in `messages/{locale}/deferred.json` will be updated to:

```json
{
  "faq": {
    "pageTitle": "Frequently Asked Questions",
    "pageDescription": "...",
    "categories": {
      "ordering": "Ordering & Purchasing",
      "certifications": "Certifications & Standards",
      "technical": "Technical Selection",
      "installation": "Installation & Application",
      "factory": "Factory & Supplier Qualifications"
    },
    "noResults": "No questions found matching your search.",
    "contactCta": {
      "title": "Still Have Questions?",
      "description": "...",
      "button": "Contact Us"
    }
  }
}
```

Note: Old category keys (`ordering`, `payment`, `logistics`, `quality`) will be replaced with new ones matching the 5 PVC-specific categories. The `searchPlaceholder` key is removed (no search feature in current scope).

### Execution Sequence

1. `/cwf` — Author FAQ content (en + zh MDX files)
2. `/dwf` — Design HTML prototype for FAQ page layout (with token constraints above)
3. `writing-plans` — Implementation plan (component refactor + content swap)
4. TDD — Build and test
5. `/pr` — Submit

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

### Feature 1: FAQ Redesign

| File | Action |
|------|--------|
| `content/pages/en/faq.mdx` | Complete rewrite (by `/cwf`) |
| `content/pages/zh/faq.mdx` | Complete rewrite (by `/cwf`) |
| `src/app/[locale]/faq/page.tsx` | Layout refactor to match PAGE-PATTERNS.md |
| `src/app/[locale]/faq/__tests__/page.test.tsx` | Rewrite assertions to match new layout structure |
| `src/app/[locale]/faq/__tests__/page-async.test.tsx` | Update if affected by layout changes |
| `messages/en/deferred.json` | Update `faq` namespace (categories, contactCta) |
| `messages/zh/deferred.json` | Same |

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
- Product-page embedded FAQ (deferred until product page i18n complete)
- Blog content (separate batch)
- About page layout redesign (separate task, tracked in PAGE-PATTERNS.md gap table)
- FAQ search feature (removed — 20 questions across 5 categories is navigable without search)

## Dependencies

- `/cwf` must complete FAQ content before `/dwf` and implementation
- `/dwf` must complete FAQ layout prototype before implementation
- Core numbers (A-1) has no dependencies, can be implemented independently

## Success Criteria

1. FAQ page displays 20 PVC conduit-specific Q&As in 5 categories
2. FAQ page layout passes PAGE-PATTERNS.md checklist (container, spacing, typography, cards, CTA)
3. FAQ Schema structured data preserved (verify in Google Rich Results Test)
4. No hardcoded company numbers remain in `src/` or `messages/` — all reference `siteFacts`
5. Both en and zh FAQ content complete and accurate
6. `pnpm ci:local:quick` passes
