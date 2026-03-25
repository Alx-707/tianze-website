# Distributed FAQ + Core Numbers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace template FAQ page with contextual FAQ sections distributed across 5 pages; unify hardcoded company numbers via `siteFacts`.

**Architecture:** A reusable `FaqSection` Server Component wraps Radix `Accordion` (Client) with `shadow-card` styling and `SectionHead`. FAQ data lives in a shared `faq` namespace in `messages/{locale}/deferred.json`. Each page passes item keys relevant to its context. Old `/faq` route is deleted.

**Tech Stack:** Next.js 16 (App Router, Cache Components), React 19, next-intl 4.8, Radix Accordion, Tailwind CSS 4

**User Requirements:** Buyers need FAQ answers in context (on the page where the question arises), not on a separate FAQ page. 20 PVC conduit-specific Q&As distributed across contact, about, products, OEM, and bending machines pages.

**Design Decisions:** Distributed FAQ over standalone page (user feedback during brainstorming). Shadow-card accordion per PAGE-PATTERNS.md. Shared `faq` i18n namespace for cross-page reuse (diverges from HANDOFF's per-page `namespace` prop — simplified to single namespace since all items live in one pool and pages just select which keys to display; payload impact is negligible because the entire `deferred.json` bundle loads regardless of which page the user visits). "Years in business" uses stable "Established {year}" display, not dynamic year computation, to avoid cache staleness.

**Codex Review:** Round 1 scored 5/10, NEEDS_REVISION. 8 of 13 issues accepted and fixed in this revision. See `docs/superpowers/reviews/2026-03-25-distributed-faq-and-core-numbers-review.md`.

**BDD Specs Reference:** `docs/specs/batch3-faq-numbers/bdd-specs.md`

**Design Handoff:** `docs/design/faq/HANDOFF.md`

**Constraints:** TypeScript strict, no `any`. i18n required for all user text. Function ≤120 lines. `shadow-card` system (not `border`). Server Components first.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `messages/en/deferred.json` | Modify | Add `faq` namespace with 20 Q&A items (en) |
| `messages/zh/deferred.json` | Modify | Add `faq` namespace with 20 Q&A items (zh) |
| `src/components/sections/faq-section.tsx` | **Create** | Reusable FaqSection Server Component |
| `src/components/sections/faq-accordion.tsx` | **Create** | Client accordion wrapper with chevron |
| `src/components/sections/__tests__/faq-section.test.tsx` | **Create** | FaqSection unit tests |
| `src/app/[locale]/contact/page.tsx` | Modify | Add FaqSection + FAQ Schema |
| `src/app/[locale]/about/page.tsx` | Modify | Add FaqSection + FAQ Schema |
| `src/app/[locale]/products/[market]/page.tsx` | Modify | Add FaqSection + FAQ Schema |
| `src/app/[locale]/oem-custom-manufacturing/page.tsx` | Modify | Add FaqSection |
| `src/app/[locale]/capabilities/bending-machines/page.tsx` | Modify | Add FaqSection |
| `src/app/[locale]/faq/page.tsx` | **Delete** | Old standalone FAQ page |
| `src/app/[locale]/faq/__tests__/page.test.tsx` | **Delete** | Old FAQ tests |
| `src/app/[locale]/faq/__tests__/page-async.test.tsx` | **Delete** | Old FAQ tests |
| `content/pages/en/faq.mdx` | **Delete** | Old FAQ MDX content |
| `content/pages/zh/faq.mdx` | **Delete** | Old FAQ MDX content |
| `src/app/sitemap.ts` | Modify | Remove `/faq` entry |
| `src/config/paths/paths-config.ts` | Modify | Remove `faq` path config |
| `src/config/paths/utils.ts` | Modify | Remove `"/faq"` from `PATHNAMES` constant |
| `messages/en/critical.json` | Modify | Remove FAQ nav links, fix hardcoded numbers |
| `messages/zh/critical.json` | Modify | Same |

---

## Task 1: Add FAQ Translation Keys

**Files:**
- Modify: `messages/en/deferred.json`
- Modify: `messages/zh/deferred.json`

**BDD:** Supports scenarios 2.1, 2.2, 3.1, 3.2, 4.1, 4.2, 5.1, 5.2

- [ ] **Step 1: Extend `faq` namespace in `messages/en/deferred.json` (backward-compatible)**

**IMPORTANT:** Do NOT remove the existing keys (pageTitle, categories, noResults, searchPlaceholder, contactCta) yet — the old `/faq` route still reads them. Add the new `sectionTitle` and `items` keys alongside the old ones. The old keys will be removed in Task 7 when the route is deleted. Extract all 20 Q&A items from `docs/content/faq/v1-final.md`.

Key structure:
```json
"faq": {
  "sectionTitle": "Frequently Asked Questions",
  "items": {
    "moq": {
      "question": "What is the minimum order quantity (MOQ)?",
      "answer": "Our MOQ is typically 500 to 1,000 pieces, depending on the specific pipe type and size. Standard conduit bends in common sizes (20mm, 25mm, 32mm) have lower MOQs, while larger or custom-specification items may require higher minimums.\n\nFor first-time buyers, we offer flexible trial order arrangements. Contact our sales team to discuss quantities that work for your project requirements."
    },
    "leadTime": { "question": "...", "answer": "..." },
    "payment": { "question": "...", "answer": "..." },
    "samples": { "question": "...", "answer": "..." },
    "oem": { "question": "...", "answer": "..." },
    "certifications": { "question": "...", "answer": "..." },
    "standardsDifference": { "question": "...", "answer": "..." },
    "verifyCerts": { "question": "...", "answer": "..." },
    "sch40vs80": { "question": "...", "answer": "..." },
    "conduitSize": { "question": "...", "answer": "..." },
    "bendingRadius": { "question": "...", "answer": "..." },
    "strengthGrades": { "question": "...", "answer": "..." },
    "lszh": { "question": "...", "answer": "..." },
    "directBurial": { "question": "...", "answer": "..." },
    "indoorOutdoor": { "question": "...", "answer": "..." },
    "solarDataCenter": { "question": "...", "answer": "..." },
    "corrosion": { "question": "...", "answer": "..." },
    "manufacturer": { "question": "...", "answer": "..." },
    "factoryVisit": { "question": "...", "answer": "..." },
    "exportExperience": { "question": "...", "answer": "..." }
  }
}
```

All answer text comes from `docs/content/faq/v1-final.md`. Use `\n\n` for paragraph breaks within answers.

- [ ] **Step 2: Add same structure to `messages/zh/deferred.json`**

Extract Chinese content from `docs/content/faq/v1-zh-final.md`. Same keys, Chinese values.

- [ ] **Step 3: Run i18n validation**

Run: `pnpm i18n:full`
Expected: PASS — both locales have matching keys

- [ ] **Step 4: Commit**

```bash
git add messages/en/deferred.json messages/zh/deferred.json
git commit -m "feat(i18n): add distributed faq translation keys (en + zh, 20 items)"
```

---

## Task 2: Create FaqSection Component (Red → Green)

**Files:**
- Create: `src/components/sections/__tests__/faq-section.test.tsx`
- Create: `src/components/sections/faq-section.tsx`

**BDD:** Scenarios 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.2

- [ ] **Step 1: Write failing tests**

```typescript
// src/components/sections/__tests__/faq-section.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next-intl
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() =>
    Promise.resolve((key: string) => {
      const translations: Record<string, string> = {
        sectionTitle: "Frequently Asked Questions",
        "items.moq.question": "What is the minimum order quantity (MOQ)?",
        "items.moq.answer": "Our MOQ is typically 500 to 1,000 pieces.",
        "items.leadTime.question": "What is the lead time?",
        "items.leadTime.answer": "15 to 30 days.",
      };
      return translations[key] ?? key;
    }),
  ),
}));

// Mock structured data
vi.mock("@/lib/structured-data", () => ({
  generateFAQSchema: vi.fn(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [],
  })),
}));

vi.mock("@/components/seo", () => ({
  JsonLdScript: ({ data }: { data: unknown }) => (
    <script
      data-testid="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  ),
}));

describe("Feature: FaqSection Reusable Component", () => {
  // Helper to render async Server Component
  async function renderFaqSection(props?: Partial<{ items: string[]; title: string; locale: "en" | "zh" }>) {
    const { FaqSection } = await import("@/components/sections/faq-section");
    const element = await FaqSection({
      items: props?.items ?? ["moq", "leadTime"],
      title: props?.title ?? "Frequently Asked Questions",
      locale: props?.locale ?? "en",
    });
    return render(element);
  }

  describe("Scenario 1.1: renders title via SectionHead", () => {
    it("displays the section title", async () => {
      await renderFaqSection();
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Frequently Asked Questions",
      );
    });

    it("has a section-divider border at the top", async () => {
      const { container } = await renderFaqSection();
      const section = container.querySelector("section");
      expect(section?.className).toContain("section-divider");
    });
  });

  describe("Scenario 1.2: renders accordion items from translation keys", () => {
    it("renders the correct number of accordion items", async () => {
      await renderFaqSection({ items: ["moq", "leadTime"] });
      const triggers = screen.getAllByRole("button");
      expect(triggers).toHaveLength(2);
    });

    it("displays question text for each item", async () => {
      await renderFaqSection({ items: ["moq"] });
      expect(
        screen.getByText("What is the minimum order quantity (MOQ)?"),
      ).toBeInTheDocument();
    });
  });

  describe("Scenario 1.3: Buyer expands a question", () => {
    it("expands answer when question is clicked", async () => {
      await renderFaqSection({ items: ["moq"] });
      const trigger = screen.getByText("What is the minimum order quantity (MOQ)?");
      await userEvent.click(trigger);
      expect(screen.getByText(/500 to 1,000 pieces/)).toBeVisible();
    });
  });

  describe("Scenario 1.4: Multiple questions open simultaneously", () => {
    it("keeps both questions expanded", async () => {
      await renderFaqSection({ items: ["moq", "leadTime"] });
      await userEvent.click(screen.getByText("What is the minimum order quantity (MOQ)?"));
      await userEvent.click(screen.getByText("What is the lead time?"));
      expect(screen.getByText(/500 to 1,000 pieces/)).toBeVisible();
      expect(screen.getByText(/15 to 30 days/)).toBeVisible();
    });
  });

  describe("Scenario 1.5: Keyboard navigation", () => {
    it("toggles accordion with Enter key", async () => {
      await renderFaqSection({ items: ["moq"] });
      const trigger = screen.getByText("What is the minimum order quantity (MOQ)?");
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      expect(screen.getByText(/500 to 1,000 pieces/)).toBeVisible();
    });
  });

  describe("Scenario 1.6: generates FAQ Schema", () => {
    it("renders JSON-LD script with FAQPage schema", async () => {
      await renderFaqSection();
      const script = screen.getByTestId("faq-schema");
      expect(script).toBeInTheDocument();
      const data = JSON.parse(script.innerHTML);
      expect(data["@type"]).toBe("FAQPage");
    });
  });

  describe("Scenario 5.1/5.2: i18n locale rendering", () => {
    it("renders content from translation keys (locale-agnostic at component level)", async () => {
      // FaqSection calls getTranslations("faq") which is locale-aware via next-intl.
      // The mock returns English. A separate test with zh mock would verify Chinese.
      await renderFaqSection({ items: ["moq"] });
      expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
      expect(screen.getByText("What is the minimum order quantity (MOQ)?")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/sections/__tests__/faq-section.test.tsx`
Expected: FAIL — `faq-section` module not found

- [ ] **Step 3: Write FaqSection component**

```typescript
// src/components/sections/faq-section.tsx
import { getTranslations } from "next-intl/server";
import { SectionHead } from "@/components/ui/section-head";
import { JsonLdScript } from "@/components/seo";
import { generateFAQSchema } from "@/lib/structured-data";
import type { Locale } from "@/types/content.types";
import { FaqAccordion } from "@/components/sections/faq-accordion";

interface FaqSectionProps {
  /** FAQ item keys from the shared faq.items namespace */
  items: string[];
  /** Override section title (default: faq.sectionTitle) */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Locale for schema generation — typed as Locale ("en" | "zh") */
  locale: Locale;
}

export async function FaqSection({
  items,
  title,
  subtitle,
  locale,
}: FaqSectionProps) {
  const t = await getTranslations("faq");

  const faqData = items.map((key) => ({
    key,
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`),
  }));

  const faqSchema = generateFAQSchema(
    faqData.map(({ question, answer }) => ({ question, answer })),
    locale,
  );

  return (
    <>
      <JsonLdScript data={faqSchema} />
      <section className="section-divider py-14 md:py-[72px]">
        <div className="mx-auto max-w-[1080px] px-6">
          <SectionHead title={title ?? t("sectionTitle")} subtitle={subtitle} />
          <FaqAccordion items={faqData} />
        </div>
      </section>
    </>
  );
}
```

Create the Client accordion wrapper:

```typescript
// src/components/sections/faq-accordion.tsx
"use client";

import { ChevronDownIcon } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface FaqAccordionProps {
  items: Array<{
    key: string;
    question: string;
    answer: string;
  }>;
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  return (
    <Accordion
      type="multiple"
      className="divide-y-0 rounded-lg border-0 bg-card shadow-card"
    >
      {items.map((item) => (
        <AccordionItem key={item.key} value={item.key} className="border-b-0 border-t border-border first:border-t-0">
          <AccordionTrigger className="group min-h-[44px] px-6 text-[15px] font-medium">
            {item.question}
            <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </AccordionTrigger>
          <AccordionContent className="px-6">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
              {item.answer}
            </p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

**Notes (Codex review fixes):**
- `min-h-[44px]` is mobile-first (not `sm:min-h-[44px]`) — 44px touch target on all screens
- `ChevronDownIcon` with `group-data-[state=open]:rotate-180` satisfies BDD 1.3 chevron rotation
- The existing `AccordionTrigger` in `src/components/ui/accordion.tsx` does NOT include a built-in chevron — it must be added here
- Current FAQ content is prose-only; table rendering support is deferred to a future batch

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/components/sections/__tests__/faq-section.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/faq-section.tsx src/components/sections/faq-accordion.tsx src/components/sections/__tests__/faq-section.test.tsx
git commit -m "feat: add reusable FaqSection component with schema generation"
```

---

## Task 3: Integrate FaqSection into Contact Page

**Files:**
- Modify: `src/app/[locale]/contact/page.tsx`

**BDD:** Scenarios 2.1, 2.2

- [ ] **Step 1: Write failing test**

**Test file:** `src/app/[locale]/contact/__tests__/page.test.tsx` (existing test file — add new describe block)

Use the project's async Server Component rendering pattern (same as `hero-section.test.tsx`):

```typescript
// Add to existing contact page test file
describe("Contact page FAQ integration", () => {
  async function renderContactPage() {
    const { default: ContactPage } = await import("@/app/[locale]/contact/page");
    const element = await ContactPage({ params: Promise.resolve({ locale: "en" }) });
    return render(await Promise.resolve(element));
  }

  it("renders FAQ section with ordering questions (BDD 2.1)", async () => {
    await renderContactPage();
    expect(screen.getByText(/minimum order quantity/i)).toBeInTheDocument();
  });

  it("MOQ answer contains real business data (BDD 2.2)", async () => {
    await renderContactPage();
    await userEvent.click(screen.getByText(/minimum order quantity/i));
    expect(screen.getByText(/500/)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Expected: FAIL — FaqSection not yet imported in contact page

- [ ] **Step 3: Add FaqSection to contact page**

In `src/app/[locale]/contact/page.tsx`, import `FaqSection` and add it before the closing `</main>` or before the footer area:

```typescript
import { FaqSection } from "@/components/sections/faq-section";

// Inside the page component, after the contact form/info section:
<FaqSection
  locale={locale}
  items={["moq", "leadTime", "payment", "samples", "oem"]}
/>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/app/[locale]/contact/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/contact/page.tsx
git commit -m "feat(contact): add ordering faq section (5 questions)"
```

---

## Task 4: Integrate FaqSection into About Page

**Files:**
- Modify: `src/app/[locale]/about/page.tsx`

**BDD:** Scenarios 3.1, 3.2

- [ ] **Step 1: Write failing test**

**Test file:** `src/app/[locale]/about/__tests__/page.test.tsx` (existing or create)

```typescript
describe("About page FAQ integration", () => {
  async function renderAboutPage() {
    const { default: AboutPage } = await import("@/app/[locale]/about/page");
    const element = await AboutPage({ params: Promise.resolve({ locale: "en" }) });
    return render(await Promise.resolve(element));
  }

  it("renders FAQ with factory qualification questions (BDD 3.1)", async () => {
    await renderAboutPage();
    expect(screen.getByText(/manufacturer.*trading company/i)).toBeInTheDocument();
  });

  it("manufacturer answer mentions bending machine (BDD 3.2)", async () => {
    await renderAboutPage();
    await userEvent.click(screen.getByText(/manufacturer.*trading company/i));
    expect(screen.getByText(/bending machine/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Add FaqSection to about page**

```typescript
import { FaqSection } from "@/components/sections/faq-section";

// After stats/timeline sections, before FinalCTA or footer:
<FaqSection
  locale={locale}
  items={["manufacturer", "factoryVisit", "exportExperience", "certifications", "verifyCerts"]}
/>
```

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/about/page.tsx
git commit -m "feat(about): add factory qualification faq section (5 questions)"
```

---

## Task 5: Integrate FaqSection into Product Pages

**Files:**
- Modify: `src/app/[locale]/products/[market]/page.tsx`

**BDD:** Scenarios 4.1, 4.2

- [ ] **Step 1: Write failing test**

**Test file:** `src/app/[locale]/products/[market]/__tests__/page.test.tsx` (existing or create)

```typescript
describe("Product page FAQ integration", () => {
  async function renderProductPage() {
    const { default: ProductPage } = await import("@/app/[locale]/products/[market]/page");
    const element = await ProductPage({ params: Promise.resolve({ locale: "en", market: "north-america" }) });
    return render(await Promise.resolve(element));
  }

  it("renders FAQ with technical questions (BDD 4.1)", async () => {
    await renderProductPage();
    expect(screen.getByText(/schedule 40.*schedule 80/i)).toBeInTheDocument();
  });

  it("Sch 40/80 answer explains wall thickness (BDD 4.2)", async () => {
    await renderProductPage();
    await userEvent.click(screen.getByText(/schedule 40.*schedule 80/i));
    expect(screen.getByText(/wall thickness/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

- [ ] **Step 3: Add FaqSection to product page**

```typescript
import { FaqSection } from "@/components/sections/faq-section";

// After TrustSignalsSection or product specs, before FinalCTA:
<FaqSection
  locale={locale}
  items={["sch40vs80", "conduitSize", "bendingRadius", "strengthGrades", "lszh", "standardsDifference", "directBurial", "indoorOutdoor", "solarDataCenter", "corrosion"]}
/>
```

All 5 market pages share the same technical + installation FAQ. Market-specific FAQ deferred.

**Coverage note (Codex review fix):** Added 4 installation-related items (directBurial, indoorOutdoor, solarDataCenter, corrosion) that were previously unassigned to any page. All 20 FAQ items now appear on at least one page.

- [ ] **Step 4: Run test to verify it passes**

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/products/[market]/page.tsx
git commit -m "feat(products): add technical faq section to market pages (6 questions)"
```

---

## Task 6: Integrate FaqSection into OEM + Bending Machines Pages

**Files:**
- Modify: `src/app/[locale]/oem-custom-manufacturing/page.tsx`
- Modify: `src/app/[locale]/capabilities/bending-machines/page.tsx`

**BDD:** Integration coverage — verify each page renders its FAQ section.

- [ ] **Step 1: Write failing integration tests**

**Test files:**
- `src/app/[locale]/oem-custom-manufacturing/__tests__/page.test.tsx` (existing or create)
- `src/app/[locale]/capabilities/bending-machines/__tests__/page.test.tsx` (existing or create)

Same rendering pattern as contact/about pages: import page → pass `{ params: Promise.resolve({ locale: "en" }) }` → assert FAQ content.

Assert OEM page renders FAQ with "Can you do OEM or custom labeling?" and bending machines page renders FAQ with "What is the minimum bending radius?"

- [ ] **Step 2: Add FaqSection to OEM page**

```typescript
<FaqSection locale={locale} items={["oem", "samples"]} />
```

- [ ] **Step 3: Add FaqSection to Bending Machines page**

```typescript
<FaqSection locale={locale} items={["bendingRadius", "manufacturer"]} />
```

- [ ] **Step 4: Run tests for both pages**

Run: `pnpm vitest run src/app/[locale]/oem-custom-manufacturing/ src/app/[locale]/capabilities/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/oem-custom-manufacturing/page.tsx src/app/[locale]/capabilities/bending-machines/page.tsx
git commit -m "feat(oem,bending): add contextual faq sections"
```

---

## Task 7: Remove Old `/faq` Route + Cleanup

**Files:**
- Delete: `src/app/[locale]/faq/` (entire directory)
- Delete: `content/pages/en/faq.mdx`
- Delete: `content/pages/zh/faq.mdx`
- Modify: `src/app/sitemap.ts`
- Modify: `src/config/paths/paths-config.ts`
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`

**BDD:** Scenarios 6.1, 6.2, 6.3

Follow the Route Deletion Checklist from `.claude/rules/architecture.md`. **ALL items are mandatory:**

| Location | What to check |
|----------|--------------|
| `src/app/sitemap.ts` | Remove `/faq` URL generation |
| `src/config/paths/paths-config.ts` | Remove `faq` from `DYNAMIC_PATHS_CONFIG` |
| `src/config/paths/types.ts` | Remove from `DynamicPageType` union if present |
| `src/config/paths/utils.ts` | Remove `"/faq"` from `PATHNAMES` |
| `src/lib/i18n/route-parsing.ts` | Remove from `DYNAMIC_ROUTE_PATTERNS` if present |
| `messages/*/critical.json` | Remove FAQ nav links from header/footer |
| `src/constants/` | Remove any route helpers referencing `/faq` |
| Navigation components | Remove any hardcoded FAQ links |
| Test files | Remove/update tests referencing the route |

**301 redirect**: Deferred. Old `/faq` will return 404. Can add redirect in a future batch if analytics show traffic.

- [ ] **Step 0: Remove old faq keys from deferred.json**

Now that the route is being deleted, remove the backward-compatible old keys (pageTitle, categories, noResults, searchPlaceholder, contactCta) from `messages/en/deferred.json` and `messages/zh/deferred.json`. The new `sectionTitle` and `items` keys stay.

- [ ] **Step 1: Write failing tests for cleanup**

```typescript
// Scenario 6.3: sitemap does not contain /faq
it("sitemap excludes /faq", async () => {
  // Import sitemap function
  // Generate sitemap
  // Assert: no URL contains "/faq"
});

// Scenario 6.1: old /faq route returns 404
// After deleting the route directory, navigating to /faq should 404.
// This is verified by: the route directory no longer exists, so Next.js
// returns 404 automatically. No redirect is implemented in this batch
// (optional per spec — deferred).

// Scenario 6.2: no navigation links to /faq
// Use grep: grep -rn '"/faq"' src/components/layout/ messages/
```

- [ ] **Step 2: Delete the FAQ route directory**

```bash
rm -rf src/app/[locale]/faq/
```

- [ ] **Step 3: Delete old FAQ MDX content**

```bash
rm content/pages/en/faq.mdx content/pages/zh/faq.mdx
```

- [ ] **Step 4: Remove `/faq` from sitemap**

In `src/app/sitemap.ts`, remove the `/faq` entry from the static pages array.

- [ ] **Step 5: Remove `faq` from paths config**

In `src/config/paths/paths-config.ts`, remove:
```typescript
faq: Object.freeze({
  en: "/faq",
  zh: "/faq",
}),
```

Also check and remove from `src/config/paths/types.ts` if `faq` is in any type union.

- [ ] **Step 5b: Remove `"/faq"` from `src/config/paths/utils.ts`**

Remove the `"/faq": "/faq"` entry from the `PATHNAMES` constant. Check `src/lib/i18n/route-parsing.ts` for any `DYNAMIC_ROUTE_PATTERNS` referencing faq.

- [ ] **Step 6: Remove FAQ nav links from translation files**

In `messages/en/critical.json` and `messages/zh/critical.json`:
- Remove `"faq": "FAQ"` from navigation entries (header nav, footer links)
- Search for any other references to the FAQ page

- [ ] **Step 7: Check for any remaining references**

```bash
grep -rn '"/faq"' src/ messages/ --include="*.ts" --include="*.tsx" --include="*.json"
grep -rn "faq" src/lib/i18n/route-parsing.ts
```

Fix any remaining references found.

- [ ] **Step 8: Run tests to verify cleanup is complete**

Run: `pnpm vitest run`
Run: `pnpm type-check`
Expected: PASS — no broken imports or dead references

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor: remove standalone /faq route, distribute to contextual sections"
```

---

## Task 8: Core Numbers Unification (A-1)

**Files:**
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`
- Modify: `messages/en/deferred.json` (if hardcoded numbers found)
- Modify: `messages/zh/deferred.json` (if hardcoded numbers found)
- Modify: Various `src/` files (if hardcoded numbers found)

**BDD:** Scenarios 7.1, 7.2, 7.3, 7.4

- [ ] **Step 1: Audit — scan for hardcoded company numbers**

```bash
grep -rn "2018" src/ messages/ --include="*.ts" --include="*.tsx" --include="*.json" | grep -v node_modules | grep -v ".next" | grep -v "site-facts"
grep -rn '"20+"' src/ messages/ --include="*.ts" --include="*.tsx" --include="*.json"
grep -rn '"60+"' src/ messages/ --include="*.ts" --include="*.tsx" --include="*.json"
grep -rn '"20 "' messages/ --include="*.json"
```

Record every location found.

- [ ] **Step 2: Write failing tests for ICU interpolation and component rendering**

```typescript
// Test 1: Translation strings have ICU placeholders
it("translation strings use ICU placeholders for company numbers", () => {
  // Read critical.json
  // Assert: strings mentioning country count use {countries} not literal "20"
  // Assert: strings mentioning year use {established} not literal "2018"
});

// Test 2: Homepage renders siteFacts values (BDD 7.1)
it("homepage trust elements display country count from siteFacts", async () => {
  // Render homepage or relevant section
  // Assert: rendered text contains siteFacts.stats.exportCountries value
  // Assert: "+" suffix comes from template (e.g., "20+" not just "20")
});

// Test 3: About page renders siteFacts values (BDD 7.2)
it("about page stats show established year from siteFacts", async () => {
  // Render about page stats section
  // Assert: "Established {year}" matches siteFacts.company.established
  // NOTE: Use stable "Established {year}" display, NOT dynamic year computation
});
```

**Test files:**
- Homepage numbers: `src/components/sections/__tests__/hero-section.test.tsx` (existing — add assertions for siteFacts)
- About page stats: `src/app/[locale]/about/__tests__/page.test.tsx` (existing or create)

Render the actual components (HeroSection for homepage, AboutPage for about) and assert displayed values match `siteFacts`. "Years in business" uses stable "Established {year}" display to avoid cache staleness.

- [ ] **Step 3: Replace hardcoded numbers in translation files with ICU placeholders**

Example replacements in `messages/en/critical.json`:
```json
// Before:
"proof": "Exporting to 20+ countries"
// After:
"proof": "Exporting to {countries}+ countries"
```

Same pattern for `messages/zh/critical.json`.

The `+` stays in the template. Components pass: `t('proof', { countries: siteFacts.stats.exportCountries })`.

- [ ] **Step 4: Update components to pass siteFacts values to translations**

For each component that renders company numbers, ensure it imports `siteFacts` and passes values:

```typescript
import { siteFacts } from "@/config/site-facts";

// In the render:
t("proof", { countries: siteFacts.stats.exportCountries })
```

- [ ] **Step 5: Add MDX sync comments**

Add to the top of all MDX files found during audit that contain company numbers (at minimum `content/pages/{en,zh}/about.mdx`):

```markdown
<!-- Company numbers must match src/config/site-facts.ts: established=2018, exportCountries=20, employees=60 -->
```

- [ ] **Step 6: Re-run audit to verify no hardcoded numbers remain**

```bash
grep -rn "2018" src/ --include="*.ts" --include="*.tsx" | grep -v site-facts | grep -v test | grep -v ".next"
```

Expected: No results (or only in site-facts.ts and test files)

- [ ] **Step 7: Run full verification**

Run: `pnpm type-check && pnpm vitest run && pnpm build`
Expected: All PASS

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: unify company numbers via siteFacts ICU interpolation"
```

---

## Task 9: Final Verification + Component Registry

**Files:**
- Modify: `docs/component-registry.md`

- [ ] **Step 1: Run full local CI**

Run: `pnpm ci:local:quick`
Expected: All checks PASS

- [ ] **Step 2: Verify FAQ Schema on dev server**

Start dev server, visit each page with FAQ section. Check:
- Browser DevTools → Elements → search for `application/ld+json`
- Verify FAQPage schema contains correct questions
- Test both /en and /zh locales

- [ ] **Step 3: Update component registry**

Add to `docs/component-registry.md`:

```markdown
| FaqSection | `src/components/sections/faq-section.tsx` | Contextual FAQ accordion (Server Component) |
| FaqAccordion | `src/components/sections/faq-accordion.tsx` | Client accordion wrapper for FAQ items |
```

- [ ] **Step 4: Final commit**

```bash
git add docs/component-registry.md
git commit -m "docs: register FaqSection and FaqAccordion components"
```

---

## Execution Order Summary

```
Task 1: Translation keys (data layer)     — no dependencies, keeps old keys for backward compat
Task 2: FaqSection component (Red→Green)   — depends on Task 1
Task 3: Contact page integration           — depends on Task 2
Task 4: About page integration             — depends on Task 2
Task 5: Product pages integration          — depends on Task 2
Task 6: OEM + Bending pages integration    — depends on Task 2
Task 7: Remove old /faq route + cleanup    — after Tasks 3-6 (deletes old keys + route)
Task 8: Core numbers unification           — after Task 7 (both touch critical.json)
Task 9: Final verification                 — after all tasks
```

Tasks 3, 4, 5, 6 are independent and can be parallelized.
Task 7 must complete before Task 8 to avoid merge conflicts in `messages/*/critical.json`.

## 20-Item Coverage Map

All 20 FAQ items assigned to at least one page:

| Key | Contact | About | Products | OEM | Bending |
|-----|---------|-------|----------|-----|---------|
| moq | x | | | | |
| leadTime | x | | | | |
| payment | x | | | | |
| samples | x | | | x | |
| oem | x | | | x | |
| certifications | | x | | | |
| standardsDifference | | | x | | |
| verifyCerts | | x | | | |
| sch40vs80 | | | x | | |
| conduitSize | | | x | | |
| bendingRadius | | | x | | x |
| strengthGrades | | | x | | |
| lszh | | | x | | |
| directBurial | | | x | | |
| indoorOutdoor | | | x | | |
| solarDataCenter | | | x | | |
| corrosion | | | x | | |
| manufacturer | | x | | | x |
| factoryVisit | | x | | | |
| exportExperience | | x | | | |
