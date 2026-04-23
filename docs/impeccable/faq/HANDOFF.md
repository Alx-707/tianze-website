# FaqSection Component — Development Handoff

> Historical handoff for the earlier distributed-FAQ implementation pass.
> Current strategy source of truth is now:
> - `docs/strategy/ring2/07-information-architecture.md`
> - `docs/strategy/ring2/08-content-strategy.md`
> - `docs/strategy/ring2/12-content-inventory.md`
>
> Important: this file's earlier "remove standalone /faq" decision is not the current source of truth. Ring 2 currently reserves `/faq/` as a planned page in the approved strategy set.

## Design Overview
- **Component**: Reusable `FaqSection` — embeds contextual FAQ into any page
- **Prototype**: `docs/impeccable/faq/prototype/v2/index.html`
- **Iterations**: v1 (standalone page, rejected) → v2 (distributed component, approved)
- **Design system**: Strict token match to `src/app/globals.css`

## Design System Reference
- Production tokens: `src/app/globals.css` (authoritative)
- Token spec: `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`
- Page patterns: `docs/impeccable/system/PAGE-PATTERNS.md`

## Component Specification

### Props Interface

```typescript
interface FaqSectionProps {
  namespace: string;       // Translation namespace (e.g., "contact.faq")
  title: string;           // Section title via SectionHead
  subtitle?: string;       // Optional subtitle
  items: string[];         // FAQ item keys within the namespace
}
```

### Token Map

| Element | Token / Class |
|---------|---------------|
| Section | `py-14 md:py-[72px]` + `section-divider` (border-top) |
| Container | Inherits page `mx-auto max-w-[1080px] px-6` |
| Title | `SectionHead` component (32px bold, -0.02em tracking) |
| Accordion container | `shadow-card` (`rounded-lg` + card shadow from globals.css) |
| Item separator | `border-t border-border` (first-child: none) |
| Question text | `text-[15px] font-medium` desktop, `text-sm` mobile |
| Answer text | `text-sm leading-relaxed text-muted-foreground` |
| Chevron | 20x20, `text-muted-foreground`, rotate 180deg on open |
| Mono text | `font-mono text-[13px]` for standards/specs |
| Tables | Wrapped in `overflow-x-auto` container |
| Touch targets | Min 44px height on mobile (min-h-[44px]) |

### Accordion Behavior

- Use existing `src/components/ui/accordion.tsx` (Radix, `"use client"`)
- Mode: `type="multiple"` (multi-expand)
- Radix provides: `aria-expanded`, `aria-controls`, `role="region"`, keyboard nav
- Animation: `max-height` transition or Radix built-in content animation

### FAQ Schema Generation

Each page generates its own `FAQPage` JSON-LD:

```typescript
const faqSchema = generateFAQSchema(
  items.map(key => ({
    question: t(`faq.items.${key}.question`),
    answer: t(`faq.items.${key}.answer`),
  })),
  locale,
);
```

Use existing `src/lib/structured-data.ts` → `generateFAQSchema()`.

## Content Source

FAQ content in `messages/{locale}/deferred.json` under each page's namespace:

```json
{
  "contact": {
    "faq": {
      "title": "Frequently Asked Questions",
      "subtitle": "Common questions about ordering, payment, and samples.",
      "items": {
        "moq": {
          "question": "What is the minimum order quantity (MOQ)?",
          "answer": "Our MOQ is typically 500 to 1,000 pieces..."
        }
      }
    }
  }
}
```

Full content source: `docs/cwf/faq/v1-final.md` (en) and `docs/cwf/faq/v1-zh-final.md` (zh).

## Page Integration Map

| Page | Namespace | Items | Position |
|------|-----------|-------|----------|
| `/contact` | `contact.faq` | moq, leadTime, payment, samples, oem | Before footer |
| `/about` | `about.faq` | manufacturer, factory, exporting, certifications, verify | Before FinalCTA |
| `/products/[market]` | `products.faq` | sch40vs80, conduitSize, bendingRadius, strengthGrades, lszh, standards | Before FinalCTA |
| `/oem-custom-manufacturing` | `oem.faq` | oem, samples | Before FinalCTA |
| `/capabilities/bending-machines` | `bendingMachines.faq` | bendingRadius, manufacturer | Before FinalCTA |

## Route Cleanup

Remove standalone `/faq`:
- Delete: `src/app/[locale]/faq/` (page + tests)
- Delete: `content/pages/{en,zh}/faq.mdx`
- Clean: sitemap, paths config, navigation links
- Optional: 301 redirect `/faq` → `/contact`

## Technical Notes

- `FaqSection` is a **Server Component** — only the inner Accordion is a Client boundary
- No `next/dynamic` needed — `accordion.tsx` is already `"use client"`
- No GridFrame — component inserts into existing page layouts
- Answer content: plain text for v1. Rich formatting (tables, lists) can be added via markdown-in-translation or dedicated answer components if needed later
- Tables in prototype use HTML; in production, consider whether to encode table data in translation keys or use a separate data source

## Audit Summary (v2)

Prototype addresses all Critical/High items from v1 audit:
- ARIA: `aria-controls` + `role="region"` + `aria-labelledby`
- Focus: `focus-visible` on all interactive elements
- Mobile: 44px touch targets, scrollable tables
- Tokens: shadow-card matches globals.css values
- Landmark: FAQ section within `<main>`
