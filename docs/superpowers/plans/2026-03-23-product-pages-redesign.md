# Product Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the two-level product catalog (overview + market page) with spec-table-driven content for North America, update homepage product section, and add full i18n support.

**Architecture:** L0 overview page routes to L1 market pages. Each market page renders all product families as sections (image + spec matrix + shared trust signals). Data lives in TypeScript constants under `src/constants/product-specs/`. The `[family]` sub-route is removed.

**Tech Stack:** Next.js 16 (App Router, Server Components), TypeScript strict, Vitest + Testing Library, next-intl (en/zh), Tailwind CSS v4, shadcn/ui

**Spec doc:** `docs/superpowers/specs/2026-03-23-product-pages-design.md`
**BDD specs:** `docs/specs/product-pages/bdd-specs.md`

---

## File Structure

### New files

| File | Responsibility |
|------|---------------|
| `src/constants/product-specs/types.ts` | TypeScript interfaces for spec data |
| `src/constants/product-specs/north-america.ts` | North America spec data (all 3 families) |
| `src/constants/product-specs/__tests__/north-america.test.ts` | Data completeness tests |
| `src/components/products/spec-table.tsx` | Spec matrix table with grouped rows |
| `src/components/products/__tests__/spec-table.test.tsx` | SpecTable tests |
| `src/components/products/family-section.tsx` | Family section container (image + overview + spec table) |
| `src/components/products/__tests__/family-section.test.tsx` | FamilySection tests |
| `src/components/products/sticky-family-nav.tsx` | Sticky anchor nav (client component) |
| `src/components/products/__tests__/sticky-family-nav.test.tsx` | StickyFamilyNav tests |

### Modified files

| File | Changes |
|------|---------|
| `src/app/[locale]/products/page.tsx` | Redesign: two sections (market cards + specialty) |
| `src/app/[locale]/products/[market]/page.tsx` | Full rewrite: family sections + shared trust + CTA |
| `src/components/products/market-series-card.tsx` | Add placeholder image, visual upgrade |
| `src/components/products/catalog-breadcrumb.tsx` | Remove family-level support |
| `src/components/products/index.ts` | Update exports (add new, remove FamilyCard) |
| `src/components/sections/products-section.tsx` | Update card content for new catalog structure |
| `messages/en/critical.json` | Add product page translation keys |
| `messages/zh/critical.json` | Add Chinese translations |
| `src/constants/product-catalog.ts` | Add i18n key references to market/family definitions |

### Deleted files

| File | Reason |
|------|--------|
| `src/app/[locale]/products/[market]/[family]/page.tsx` | Route eliminated |
| `src/components/products/family-card.tsx` | No longer needed |
| `src/components/products/__tests__/family-card.test.tsx` | Tests for deleted component |

---

## Task 1: Spec Data Types

**BDD:** Scenario 6.2 (Spec data types enforce completeness)
**Files:**
- Create: `src/constants/product-specs/types.ts`
- Test: `src/constants/product-specs/__tests__/types.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/constants/product-specs/__tests__/types.test.ts
import { describe, expect, it } from "vitest";
import type {
  MarketSpecs,
  FamilySpecs,
  SpecGroup,
} from "../types";

describe("Feature: Specification Data Architecture", () => {
  describe("Scenario: Spec data types enforce completeness", () => {
    it("MarketSpecs requires technical, certifications, trade, and families", () => {
      const specs: MarketSpecs = {
        technical: { material: "PVC" },
        certifications: ["UL 651"],
        trade: {
          moq: "500 pcs",
          leadTime: "15-20 days",
          supplyCapacity: "50,000 pcs/month",
          packaging: "Carton",
          portOfLoading: "Lianyungang",
        },
        families: [],
      };
      expect(specs.technical).toBeDefined();
      expect(specs.certifications).toBeDefined();
      expect(specs.trade).toBeDefined();
      expect(specs.families).toBeDefined();
    });

    it("FamilySpecs requires slug, images, highlights, and specGroups", () => {
      const family: FamilySpecs = {
        slug: "conduit-sweeps-elbows",
        images: ["/images/products/placeholder.svg"],
        highlights: ["highlight1", "highlight2", "highlight3"],
        specGroups: [],
      };
      expect(family.slug).toBe("conduit-sweeps-elbows");
      expect(family.images.length).toBeGreaterThan(0);
      expect(family.highlights).toHaveLength(3);
    });

    it("SpecGroup requires groupLabel, columns, and rows", () => {
      const group: SpecGroup = {
        groupLabel: "Schedule 40",
        columns: ["Size", "Angle", "Wall", "End Type"],
        rows: [['1/2"', "90°", '0.060"', "Bell End"]],
      };
      expect(group.columns).toHaveLength(4);
      expect(group.rows[0]).toHaveLength(4);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/constants/product-specs/__tests__/types.test.ts`
Expected: FAIL — cannot resolve `../types`

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/constants/product-specs/types.ts
export interface SpecGroup {
  /** Group label, e.g. "Schedule 40" */
  groupLabel: string;
  /** Column headers, e.g. ["Size", "Angle", "Wall", "End Type"] */
  columns: string[];
  /** Data rows — each row is an array of string values matching columns */
  rows: string[][];
}

export interface FamilySpecs {
  /** Must match a slug in product-catalog.ts families */
  slug: string;
  /** Product image paths (placeholder or real) */
  images: string[];
  /** Exactly 3 key selling point i18n keys */
  highlights: string[];
  /** Spec rows grouped by category (e.g. Schedule, Duty) */
  specGroups: SpecGroup[];
}

export interface TradeInfo {
  moq: string;
  leadTime: string;
  supplyCapacity: string;
  packaging: string;
  portOfLoading: string;
}

export interface MarketSpecs {
  /** Shared material/physical properties (key-value) */
  technical: Record<string, string>;
  /** Standard/certification names */
  certifications: string[];
  /** Trade terms */
  trade: TradeInfo;
  /** Per-family spec data */
  families: FamilySpecs[];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/constants/product-specs/__tests__/types.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/constants/product-specs/types.ts src/constants/product-specs/__tests__/types.test.ts
git commit -m "feat(products): add spec data type definitions"
```

---

## Task 2: North America Spec Data

**BDD:** Scenario 6.1 (North America spec data is available)
**Files:**
- Create: `src/constants/product-specs/north-america.ts`
- Modify test: `src/constants/product-specs/__tests__/north-america.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// src/constants/product-specs/__tests__/north-america.test.ts
import { describe, expect, it } from "vitest";
import { NORTH_AMERICA_SPECS } from "../north-america";
import type { MarketSpecs } from "../types";

describe("Feature: Specification Data Architecture", () => {
  describe("Scenario: North America spec data is available", () => {
    it("exports a valid MarketSpecs object", () => {
      const specs: MarketSpecs = NORTH_AMERICA_SPECS;
      expect(specs).toBeDefined();
    });

    it("includes technical properties", () => {
      expect(NORTH_AMERICA_SPECS.technical).toHaveProperty("material");
      expect(NORTH_AMERICA_SPECS.technical).toHaveProperty("temperatureRange");
    });

    it("includes certifications", () => {
      expect(NORTH_AMERICA_SPECS.certifications).toContain("UL 651");
      expect(NORTH_AMERICA_SPECS.certifications).toContain("ASTM D1785");
    });

    it("includes trade information", () => {
      expect(NORTH_AMERICA_SPECS.trade.moq).toBeDefined();
      expect(NORTH_AMERICA_SPECS.trade.leadTime).toBeDefined();
      expect(NORTH_AMERICA_SPECS.trade.portOfLoading).toBeDefined();
    });

    it("includes spec groups for all 3 families", () => {
      expect(NORTH_AMERICA_SPECS.families).toHaveLength(3);
      const slugs = NORTH_AMERICA_SPECS.families.map((f) => f.slug);
      expect(slugs).toContain("conduit-sweeps-elbows");
      expect(slugs).toContain("couplings");
      expect(slugs).toContain("conduit-pipes");
    });

    it("sweeps family has Schedule 40 and Schedule 80 groups", () => {
      const sweeps = NORTH_AMERICA_SPECS.families.find(
        (f) => f.slug === "conduit-sweeps-elbows",
      )!;
      const groupLabels = sweeps.specGroups.map((g) => g.groupLabel);
      expect(groupLabels).toContain("Schedule 40");
      expect(groupLabels).toContain("Schedule 80");
    });

    it("each family has exactly 3 highlights", () => {
      for (const family of NORTH_AMERICA_SPECS.families) {
        expect(family.highlights).toHaveLength(3);
      }
    });

    it("spec group rows match column count", () => {
      for (const family of NORTH_AMERICA_SPECS.families) {
        for (const group of family.specGroups) {
          for (const row of group.rows) {
            expect(row).toHaveLength(group.columns.length);
          }
        }
      }
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/constants/product-specs/__tests__/north-america.test.ts`
Expected: FAIL — cannot resolve `../north-america`

- [ ] **Step 3: Write minimal implementation**

Create `src/constants/product-specs/north-america.ts` with full North America spec data. Data sourced from:
- `products.yaml` (sizes, angles, standards)
- Archived MDX files (detailed specs)
- `proof-points.md` (trade info)
- Industry standard references (ASTM D1785 typical values for placeholders)

The file exports `NORTH_AMERICA_SPECS` satisfying the `MarketSpecs` interface with:
- `technical`: material, surface, UV resistance, temperature range, lifespan
- `certifications`: ["UL 651", "ASTM D1785", "ISO 9001:2015"]
- `trade`: MOQ 500 pcs, lead time 15-20 days, port Lianyungang, etc.
- `families`: 3 entries (conduit-sweeps-elbows, couplings, conduit-pipes)
  - Each with Schedule 40 + Schedule 80 spec groups
  - Sweeps: Size, Angle, Wall Thickness, End Type, Radius
  - Couplings: Size, Type, Wall Thickness, End Type
  - Pipes: Size, Length, Wall Thickness, Schedule

Spec data values use inch system. Populate typical UL 651 sizes: 1/2", 3/4", 1", 1-1/4", 1-1/2", 2", 2-1/2", 3", 4".

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/constants/product-specs/__tests__/north-america.test.ts`
Expected: PASS (all 8 assertions)

- [ ] **Step 5: Commit**

```bash
git add src/constants/product-specs/north-america.ts src/constants/product-specs/__tests__/north-america.test.ts
git commit -m "feat(products): add north america spec data"
```

---

## Task 3: i18n Translation Keys

**BDD:** Scenarios 5.1, 5.2, 5.3 (translated framework text)
**Files:**
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`
- Test: verify via `pnpm i18n:full` (no separate test file — translation validation is an existing script)

- [ ] **Step 1: Add English translation keys**

Add to `messages/en/critical.json` under a new `catalog` namespace:

```json
{
  "catalog": {
    "breadcrumb": {
      "products": "Products"
    },
    "overview": {
      "title": "Products",
      "description": "PVC conduit fittings and pipes manufactured to international standards. Select your market to view products by compliance standard.",
      "byStandard": "By Market Standard",
      "specialty": "Specialty & Equipment"
    },
    "market": {
      "familyNav": {
        "jumpTo": "Jump to"
      },
      "technical": {
        "title": "Technical Properties"
      },
      "certifications": {
        "title": "Certifications & Compliance"
      },
      "trade": {
        "title": "Trade Information",
        "moq": "Minimum Order",
        "leadTime": "Lead Time",
        "supplyCapacity": "Supply Capacity",
        "packaging": "Packaging",
        "portOfLoading": "Port of Loading"
      },
      "cta": {
        "heading": "Need {marketLabel} conduit fittings?",
        "description": "Request a quote or ask about specifications, MOQ, and lead times.",
        "button": "Request a Quote"
      }
    },
    "specTable": {
      "size": "Size",
      "angle": "Angle",
      "wallThickness": "Wall Thickness",
      "endType": "End Type",
      "radius": "Radius",
      "type": "Type",
      "length": "Length",
      "schedule": "Schedule"
    },
    "familyCount": "{count} product families",
    "highlights": {
      "ul651Certified": "UL 651 Certified",
      "virginPvc": "100% Virgin PVC",
      "customAngles": "45°/90°/Custom Angles",
      "doubleBell": "Double-Bell Design",
      "secureJoints": "Secure Conduit Joints",
      "multiSize": "Multi-Size Range",
      "sch40Sch80": "Schedule 40 & 80",
      "standardLengths": "Standard Lengths",
      "straightRuns": "Straight Conduit Runs"
    }
  }
}
```

- [ ] **Step 2: Add Chinese translation keys**

Add matching keys to `messages/zh/critical.json` with Chinese values.

- [ ] **Step 3: Validate translations**

Run: `pnpm i18n:full`
Expected: PASS — no missing keys

- [ ] **Step 4: Commit**

```bash
git add messages/en/critical.json messages/zh/critical.json
git commit -m "feat(i18n): add product catalog translation keys"
```

---

## Task 4: Remove [family] Route & Update Breadcrumb

**BDD:** Scenarios 4.1, 4.2, 1.9 (family URLs gone, breadcrumb two-level)
**Files:**
- Delete: `src/app/[locale]/products/[market]/[family]/page.tsx`
- Delete: `src/components/products/family-card.tsx`
- Delete: `src/components/products/__tests__/family-card.test.tsx`
- Modify: `src/components/products/catalog-breadcrumb.tsx`
- Modify: `src/components/products/__tests__/catalog-breadcrumb.test.tsx`
- Modify: `src/components/products/index.ts`

- [ ] **Step 1: Update breadcrumb tests for two-level hierarchy**

Read existing `catalog-breadcrumb.test.tsx` first. Then update:
- Remove any tests for family-level breadcrumb
- Add/update test: market-level breadcrumb shows "Products > Market Label"
- Add test: root breadcrumb shows "Products" without link

```typescript
// Update in catalog-breadcrumb.test.tsx
it("shows two-level breadcrumb on market page", async () => {
  await renderAsyncComponent(
    CatalogBreadcrumb({ market: mockMarket }),
  );
  const productsLink = screen.getByRole("link", { name: /products/i });
  expect(productsLink).toHaveAttribute("href", "/products");
  expect(screen.getByText(mockMarket.label)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/components/products/__tests__/catalog-breadcrumb.test.tsx`
Expected: Some tests FAIL (family-related tests reference removed props)

- [ ] **Step 3: Update breadcrumb component**

Read existing `catalog-breadcrumb.tsx`. Remove the `family` prop and family-level breadcrumb rendering. Keep only root and market levels. Update JSON-LD `buildJsonLd` to exclude family.

- [ ] **Step 4: Delete family route and FamilyCard**

```bash
rm src/app/[locale]/products/[market]/[family]/page.tsx
rm src/components/products/family-card.tsx
rm src/components/products/__tests__/family-card.test.tsx
```

- [ ] **Step 5: Update barrel export**

In `src/components/products/index.ts`, remove the `FamilyCard` export. Add placeholder comments for new components (will be added in later tasks).

- [ ] **Step 6: Run all product tests to verify pass**

Run: `pnpm vitest run src/components/products/`
Expected: PASS (no references to deleted files)

- [ ] **Step 7: Run type-check**

Run: `pnpm type-check`
Expected: PASS (no broken imports)

- [ ] **Step 8: Commit**

```bash
git add -A src/app/[locale]/products/[market]/[family] src/components/products/
git commit -m "refactor(products): remove family route, simplify breadcrumb to two levels"
```

---

## Task 5: SpecTable Component

**BDD:** Scenario 1.4 (buyer reads specification matrix)
**Files:**
- Create: `src/components/products/spec-table.tsx`
- Create: `src/components/products/__tests__/spec-table.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/products/__tests__/spec-table.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecTable } from "../spec-table";
import type { SpecGroup } from "@/constants/product-specs/types";

const mockGroups: SpecGroup[] = [
  {
    groupLabel: "Schedule 40",
    columns: ["Size", "Angle", "Wall", "End Type"],
    rows: [
      ['1/2"', "90°", '0.060"', "Bell End"],
      ['3/4"', "90°", '0.060"', "Plain End"],
    ],
  },
  {
    groupLabel: "Schedule 80",
    columns: ["Size", "Angle", "Wall", "End Type"],
    rows: [['1/2"', "90°", '0.084"', "Bell End"]],
  },
];

describe("Feature: Market Page — Spec Matrix", () => {
  describe("Scenario: Buyer reads specification matrix for a product family", () => {
    it("renders group labels as subheadings", () => {
      render(<SpecTable specGroups={mockGroups} />);
      expect(screen.getByText("Schedule 40")).toBeInTheDocument();
      expect(screen.getByText("Schedule 80")).toBeInTheDocument();
    });

    it("renders column headers in table head", () => {
      render(<SpecTable specGroups={mockGroups} />);
      const headers = screen.getAllByRole("columnheader");
      expect(headers.map((h) => h.textContent)).toEqual(
        expect.arrayContaining(["Size", "Angle", "Wall", "End Type"]),
      );
    });

    it("renders data rows with correct values", () => {
      render(<SpecTable specGroups={mockGroups} />);
      expect(screen.getByText('1/2"')).toBeInTheDocument();
      expect(screen.getByText("90°")).toBeInTheDocument();
      expect(screen.getByText("Bell End")).toBeInTheDocument();
    });

    it("uses semantic table elements", () => {
      const { container } = render(<SpecTable specGroups={mockGroups} />);
      expect(container.querySelector("table")).toBeInTheDocument();
      expect(container.querySelector("thead")).toBeInTheDocument();
      expect(container.querySelector("tbody")).toBeInTheDocument();
    });

    it("wraps table in horizontally scrollable container", () => {
      const { container } = render(<SpecTable specGroups={mockGroups} />);
      const wrapper = container.querySelector("[class*='overflow']");
      expect(wrapper).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/products/__tests__/spec-table.test.tsx`
Expected: FAIL — cannot resolve `../spec-table`

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/components/products/spec-table.tsx
import type { SpecGroup } from "@/constants/product-specs/types";
import { cn } from "@/lib/utils";

export interface SpecTableProps {
  specGroups: SpecGroup[];
  className?: string;
}

export function SpecTable({ specGroups, className }: SpecTableProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {specGroups.map((group) => (
        <div key={group.groupLabel}>
          <h4 className="mb-3 font-mono text-sm font-semibold text-muted-foreground">
            {group.groupLabel}
          </h4>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {group.columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-medium text-muted-foreground"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="border-b border-border last:border-0 even:bg-muted/30"
                  >
                    {row.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className="px-4 py-2.5 font-mono text-foreground"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/products/__tests__/spec-table.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/products/spec-table.tsx src/components/products/__tests__/spec-table.test.tsx
git commit -m "feat(products): add spec-table component for spec matrix display"
```

---

## Task 6: FamilySection Component

**BDD:** Scenarios 1.2, 1.5 (buyer sees product families with image area and spec table)
**Files:**
- Create: `src/components/products/family-section.tsx`
- Create: `src/components/products/__tests__/family-section.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/products/__tests__/family-section.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FamilySection } from "../family-section";
import type { FamilySpecs } from "@/constants/product-specs/types";
import type { ProductFamilyDefinition } from "@/constants/product-catalog";

const mockFamily: ProductFamilyDefinition = {
  slug: "conduit-sweeps-elbows",
  label: "Conduit Sweeps & Elbows",
  description: "PVC conduit sweeps and elbows in standard angles.",
  marketSlug: "north-america",
};

const mockSpecs: FamilySpecs = {
  slug: "conduit-sweeps-elbows",
  images: ["/images/products/placeholder-sweep.svg"],
  highlights: ["UL 651 Certified", "100% Virgin PVC", "45°/90°/Custom"],
  specGroups: [
    {
      groupLabel: "Schedule 40",
      columns: ["Size", "Angle"],
      rows: [['1/2"', "90°"]],
    },
  ],
};

describe("Feature: Market Page — Product Families", () => {
  describe("Scenario: Buyer sees all product families on one page", () => {
    it("renders the family name as a heading", () => {
      render(<FamilySection family={mockFamily} specs={mockSpecs} />);
      expect(
        screen.getByRole("heading", { name: /conduit sweeps/i }),
      ).toBeInTheDocument();
    });

    it("renders the family description", () => {
      render(<FamilySection family={mockFamily} specs={mockSpecs} />);
      expect(screen.getByText(/standard angles/i)).toBeInTheDocument();
    });

    it("renders an image area with placeholder", () => {
      render(<FamilySection family={mockFamily} specs={mockSpecs} />);
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", expect.stringContaining("Sweeps"));
    });

    it("renders 3 key highlights", () => {
      render(<FamilySection family={mockFamily} specs={mockSpecs} />);
      expect(screen.getByText("UL 651 Certified")).toBeInTheDocument();
      expect(screen.getByText("100% Virgin PVC")).toBeInTheDocument();
    });

    it("renders the spec table", () => {
      render(<FamilySection family={mockFamily} specs={mockSpecs} />);
      expect(screen.getByText("Schedule 40")).toBeInTheDocument();
      expect(screen.getByText('1/2"')).toBeInTheDocument();
    });

    it("has an anchor id matching the family slug", () => {
      const { container } = render(
        <FamilySection family={mockFamily} specs={mockSpecs} />,
      );
      const section = container.querySelector("#conduit-sweeps-elbows");
      expect(section).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/products/__tests__/family-section.test.tsx`
Expected: FAIL — cannot resolve `../family-section`

- [ ] **Step 3: Write minimal implementation**

`FamilySection` is a Server Component that renders:
- `<section id={family.slug}>` for anchor linking
- Left/right split on desktop: image area (using `next/image`) + overview (title, description, highlights)
- Below: `<SpecTable>` component
- Responsive: vertical stack on mobile

Props: `{ family: ProductFamilyDefinition; specs: FamilySpecs }`

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/products/__tests__/family-section.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/products/family-section.tsx src/components/products/__tests__/family-section.test.tsx
git commit -m "feat(products): add family-section component with image area and spec table"
```

---

## Task 7: StickyFamilyNav Component

**BDD:** Scenario 1.3 (buyer jumps between families using sticky navigation)
**Files:**
- Create: `src/components/products/sticky-family-nav.tsx`
- Create: `src/components/products/__tests__/sticky-family-nav.test.tsx`

- [ ] **Step 1: Write the failing test**

```typescript
// src/components/products/__tests__/sticky-family-nav.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StickyFamilyNav } from "../sticky-family-nav";

const mockFamilies = [
  { slug: "conduit-sweeps-elbows", label: "Conduit Sweeps & Elbows" },
  { slug: "couplings", label: "Couplings" },
  { slug: "conduit-pipes", label: "Conduit Pipes" },
];

describe("Feature: Market Page — Sticky Navigation", () => {
  describe("Scenario: Buyer jumps between product families", () => {
    it("renders a nav link for each family", () => {
      render(<StickyFamilyNav families={mockFamilies} />);
      expect(screen.getByText("Conduit Sweeps & Elbows")).toBeInTheDocument();
      expect(screen.getByText("Couplings")).toBeInTheDocument();
      expect(screen.getByText("Conduit Pipes")).toBeInTheDocument();
    });

    it("each link points to the correct anchor", () => {
      render(<StickyFamilyNav families={mockFamilies} />);
      const sweepsLink = screen.getByText("Conduit Sweeps & Elbows").closest("a");
      expect(sweepsLink).toHaveAttribute("href", "#conduit-sweeps-elbows");
      const couplingsLink = screen.getByText("Couplings").closest("a");
      expect(couplingsLink).toHaveAttribute("href", "#couplings");
    });

    it("renders as a nav element for accessibility", () => {
      render(<StickyFamilyNav families={mockFamilies} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/components/products/__tests__/sticky-family-nav.test.tsx`
Expected: FAIL — cannot resolve `../sticky-family-nav`

- [ ] **Step 3: Write minimal implementation**

`StickyFamilyNav` is a **client component** (`"use client"`):
- Renders a `<nav>` with anchor links for each family
- Uses `sticky top-[var(--nav-height)]` for sticky positioning below the site header
- Horizontal scroll on mobile, inline flex on desktop
- Highlight active section (optional, via IntersectionObserver — can be deferred)

Props: `{ families: { slug: string; label: string }[] }`

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/components/products/__tests__/sticky-family-nav.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/products/sticky-family-nav.tsx src/components/products/__tests__/sticky-family-nav.test.tsx
git commit -m "feat(products): add sticky-family-nav component for anchor navigation"
```

---

## Task 8: L1 Market Page — Full Implementation

**BDD:** Scenarios 1.1, 1.6, 1.7, 1.8, 1.10 (market page rendering, trust, CTA, mobile, 404)
**Files:**
- Modify: `src/app/[locale]/products/[market]/page.tsx`
- Create or modify: `src/app/[locale]/products/[market]/__tests__/page.test.tsx`

- [ ] **Step 1: Write the failing tests**

Test file covers:
- Scenario 1.1: Page renders with title, standard label, description
- Scenario 1.6: Trust signals (technical properties, certifications, trade info)
- Scenario 1.7: CTA links to /contact
- Scenario 1.10: Invalid market slug triggers notFound

Key test patterns:
```typescript
// Use renderAsyncComponent for Server Components
async function renderAsyncComponent(component: Promise<JSX.Element> | JSX.Element) {
  const resolved = await Promise.resolve(component);
  return render(resolved);
}

describe("Scenario: Buyer navigates to a market page", () => {
  it("displays market title and standard label", async () => {
    await renderAsyncComponent(
      MarketPage({ params: Promise.resolve({ locale: "en", market: "north-america" }) }),
    );
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });
});

describe("Scenario: Invalid market slug returns not found", () => {
  it("calls notFound for invalid slug", async () => {
    const { notFound } = await import("next/navigation");
    await renderAsyncComponent(
      MarketPage({ params: Promise.resolve({ locale: "en", market: "invalid" }) }),
    ).catch(() => {});
    expect(notFound).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/app/[locale]/products/[market]/__tests__/page.test.tsx`
Expected: FAIL — old page structure doesn't match new assertions

- [ ] **Step 3: Rewrite market page**

Full rewrite of `src/app/[locale]/products/[market]/page.tsx`:
- Import specs from `@/constants/product-specs/north-america` (with a helper to select by market slug)
- Render: breadcrumb → header → sticky nav → family sections → technical → certifications → trade → CTA
- Use `getTranslations("catalog")` for framework text
- Use existing components: `CatalogBreadcrumb`, `ProductSpecs`, `ProductCertifications`, `ProductTradeInfo`
- Use new components: `StickyFamilyNav`, `FamilySection`
- Keep `generateStaticParams` and `generateMetadata`

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/app/[locale]/products/[market]/`
Expected: PASS

- [ ] **Step 5: Run type-check and lint**

Run: `pnpm type-check && pnpm lint:check`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/products/[market]/
git commit -m "feat(products): implement market page with family sections and spec tables"
```

---

## Task 9: MarketSeriesCard Visual Upgrade

**BDD:** Scenario 2.1 (buyer sees market cards with images)
**Files:**
- Modify: `src/components/products/market-series-card.tsx`
- Modify: `src/components/products/__tests__/market-series-card.test.tsx`

- [ ] **Step 1: Write failing test for upgraded card**

```typescript
// Add to market-series-card.test.tsx
it("renders a placeholder image", () => {
  render(<MarketSeriesCard market={mockMarket} familyCount={3} />);
  const img = screen.getByRole("img");
  expect(img).toHaveAttribute("alt", expect.stringContaining(mockMarket.label));
});

it("displays family count with translation key", () => {
  render(<MarketSeriesCard market={mockMarket} familyCount={3} />);
  expect(screen.getByText(/3/)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run to verify fails**

Run: `pnpm vitest run src/components/products/__tests__/market-series-card.test.tsx`
Expected: FAIL — no img element currently rendered

- [ ] **Step 3: Upgrade component**

Read existing `market-series-card.tsx`. Add:
- Placeholder image using `next/image` at top of card
- Keep existing structure (standard tag, title, description, family count)
- Slightly enhanced visual styling

- [ ] **Step 4: Run to verify passes**

Run: `pnpm vitest run src/components/products/__tests__/market-series-card.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/products/market-series-card.tsx src/components/products/__tests__/market-series-card.test.tsx
git commit -m "feat(products): upgrade market-series-card with placeholder image"
```

---

## Task 10: L0 Product Overview Page Redesign

**BDD:** Scenarios 2.1, 2.2, 2.3, 2.4, 2.5 (overview page with sections)
**Files:**
- Modify: `src/app/[locale]/products/page.tsx`
- Create or modify: `src/app/[locale]/products/__tests__/page.test.tsx`

- [ ] **Step 1: Write failing tests**

```typescript
describe("Feature: Product Overview Page", () => {
  describe("Scenario: Buyer sees PVC fittings by market standard", () => {
    it("renders a 'By Market Standard' section", async () => {
      await renderAsyncComponent(ProductsPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText(/by market standard/i)).toBeInTheDocument();
    });

    it("renders cards for all 4 PVC markets", async () => {
      await renderAsyncComponent(ProductsPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText(/UL/)).toBeInTheDocument();
      expect(screen.getByText(/AS\/NZS/)).toBeInTheDocument();
    });
  });

  describe("Scenario: Buyer sees specialty and equipment products", () => {
    it("renders a 'Specialty & Equipment' section", async () => {
      await renderAsyncComponent(ProductsPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText(/specialty/i)).toBeInTheDocument();
    });

    it("renders PETG and Bending Machines cards", async () => {
      await renderAsyncComponent(ProductsPage({ params: Promise.resolve({ locale: "en" }) }));
      expect(screen.getByText(/PETG/i)).toBeInTheDocument();
      expect(screen.getByText(/bending machines/i)).toBeInTheDocument();
    });
  });

  describe("Scenario: Equipment card links to placeholder", () => {
    it("bending machines card links to /contact", async () => {
      await renderAsyncComponent(ProductsPage({ params: Promise.resolve({ locale: "en" }) }));
      const machinesLink = screen.getByText(/bending machines/i).closest("a");
      expect(machinesLink).toHaveAttribute("href", expect.stringContaining("/contact"));
    });
  });
});
```

- [ ] **Step 2: Run to verify fails**

Run: `pnpm vitest run src/app/[locale]/products/__tests__/page.test.tsx`
Expected: FAIL — current page doesn't have sections

- [ ] **Step 3: Rewrite overview page**

Rewrite `src/app/[locale]/products/page.tsx`:
- Section 1: "By Market Standard" — 4 PVC market cards (filter out pneumatic-tube-systems)
- Section 2: "Specialty & Equipment" — PETG card + Bending Machines card
- Use `getTranslations("catalog")` for section titles
- PETG card links to `/products/pneumatic-tube-systems`
- Bending Machines card links to `/contact` (placeholder)

- [ ] **Step 4: Run to verify passes**

Run: `pnpm vitest run src/app/[locale]/products/__tests__/page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/products/
git commit -m "feat(products): redesign overview page with market and specialty sections"
```

---

## Task 11: Homepage Product Section Update

**BDD:** Scenarios 3.1, 3.2, 3.3, 3.4 (homepage cards match new structure)
**Files:**
- Modify: `src/components/sections/products-section.tsx`
- Modify: `src/components/sections/__tests__/products-section.test.tsx`
- Modify: `messages/en/critical.json` (home.products keys)
- Modify: `messages/zh/critical.json`

- [ ] **Step 1: Write failing tests**

```typescript
describe("Feature: Homepage Product Section — Updated Content", () => {
  describe("Scenario: Homepage shows four product category cards", () => {
    it("renders PVC Conduit Fittings card", async () => {
      await renderAsyncComponent(ProductsSection());
      expect(screen.getByText("home.products.item1.title")).toBeInTheDocument();
    });
  });

  describe("Scenario: Each card links to the correct destination", () => {
    it("first card links to /products", async () => {
      await renderAsyncComponent(ProductsSection());
      // Translation mock returns keys as values
      // Verify the link key points to /products
      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveAttribute("href", expect.stringContaining("/products"));
    });
  });

  describe("Scenario: Section header has View All Products action", () => {
    it("renders a link to /products", async () => {
      await renderAsyncComponent(ProductsSection());
      const viewAllLink = screen.getByRole("link", { name: /products/i });
      expect(viewAllLink).toHaveAttribute("href", "/products");
    });
  });
});
```

- [ ] **Step 2: Run to verify current behavior differs**

Run: `pnpm vitest run src/components/sections/__tests__/products-section.test.tsx`

- [ ] **Step 3: Update translation keys and component**

Update `messages/en/critical.json` `home.products` section:
- item1: PVC Conduit Fittings → link `/products`
- item2: PETG Pneumatic Tubes → link `/products/pneumatic-tube-systems`
- item3: Bending Machines → link `/contact`
- item4: OEM & Custom Manufacturing → link `/contact`

Update tags, titles, specs text, and standard labels. Update Chinese translations to match.

The `ProductsSection` component structure likely needs minimal code changes — it reads from translations dynamically.

- [ ] **Step 4: Run to verify passes**

Run: `pnpm vitest run src/components/sections/__tests__/products-section.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/ messages/
git commit -m "feat(home): update product section to match new catalog structure"
```

---

## Task 12: Update Barrel Exports & Final Integration

**BDD:** Cross-cutting (all features working together)
**Files:**
- Modify: `src/components/products/index.ts`
- Run: full test suite + type-check + lint + build

- [ ] **Step 1: Update barrel exports**

Add new component exports to `src/components/products/index.ts`:
- `SpecTable`
- `FamilySection`
- `StickyFamilyNav`

Remove:
- `FamilyCard` (already deleted in Task 4)

- [ ] **Step 2: Run full test suite**

Run: `pnpm vitest run`
Expected: PASS (all tests including new ones)

- [ ] **Step 3: Run type-check and lint**

Run: `pnpm type-check && pnpm lint:check`
Expected: PASS — zero errors, zero warnings

- [ ] **Step 4: Run production build**

Run: `pnpm build`
Expected: PASS — all pages generate successfully

- [ ] **Step 5: Visual verification**

Run: `pnpm dev`
Manually verify:
- `/en/products` — two sections, cards with images, correct links
- `/en/products/north-america` — all 3 families, spec tables, sticky nav, trust signals, CTA
- `/zh/products` and `/zh/products/north-america` — Chinese translations
- `/en/products/north-america/conduit-sweeps-elbows` — returns 404
- Homepage products section — 4 updated cards with correct links
- Mobile viewport — responsive layout, scrollable tables

- [ ] **Step 6: Commit**

```bash
git add src/components/products/index.ts
git commit -m "chore(products): update barrel exports for new catalog components"
```

---

## Task-to-BDD Scenario Traceability

| BDD Scenario | Task |
|-------------|------|
| 1.1 Buyer navigates to market page | Task 8 |
| 1.2 Buyer sees all families on one page | Task 6, 8 |
| 1.3 Buyer jumps between families | Task 7 |
| 1.4 Buyer reads spec matrix | Task 5 |
| 1.5 Buyer views product images | Task 6 |
| 1.6 Buyer sees trust signals | Task 8 |
| 1.7 Buyer reaches CTA naturally | Task 8 |
| 1.8 Buyer views on mobile | Task 5, 6, 8 |
| 1.9 Breadcrumb two-level | Task 4 |
| 1.10 Invalid market slug | Task 8 |
| 2.1 PVC fittings by market | Task 9, 10 |
| 2.2 Specialty and equipment | Task 10 |
| 2.3 Navigate to market | Task 10 |
| 2.4 Equipment links placeholder | Task 10 |
| 2.5 Breadcrumb root | Task 10 |
| 3.1 Four product cards | Task 11 |
| 3.2 PVC card reflects standards | Task 11 |
| 3.3 Correct link destinations | Task 11 |
| 3.4 View All Products action | Task 11 |
| 4.1 Family URLs gone | Task 4 |
| 4.2 Catalog still defines families | Task 4 |
| 5.1 Market page Chinese | Task 3, 8 |
| 5.2 Overview page Chinese | Task 3, 10 |
| 5.3 Homepage Chinese | Task 3, 11 |
| 6.1 North America data available | Task 2 |
| 6.2 Types enforce completeness | Task 1 |
