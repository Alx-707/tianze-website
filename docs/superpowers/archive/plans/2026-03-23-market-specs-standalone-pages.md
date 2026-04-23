# Market Specs + Standalone Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fill spec data for 4 remaining markets and create 2 standalone pages (bending machines + OEM), so every product page has full content and the site's core differentiator is visible.

**Architecture:** TypeScript constant files for structured spec data (per-market), Server Components + i18n keys for standalone pages. No MDX. All existing page logic handles spec presence/absence — registration in `SPECS_BY_MARKET` is the activation switch.

**Tech Stack:** Next.js 16 (App Router, async Server Components), TypeScript 5.9, next-intl 4.8, Tailwind CSS 4.2, Vitest

**Spec:** `docs/superpowers/archive/specs/2026-03-23-market-specs-standalone-pages-design.md`
**BDD:** `docs/specs/market-specs-standalone-pages/bdd-specs.md`

---

## File Map

### Phase 1: Market Spec Data

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/constants/product-standards.ts` | Add `nom`, `iec`, `petg` IDs |
| Modify | `src/constants/product-catalog.ts` | Fill empty `standardIds` for Mexico, Europe, Pneumatic |
| Create | `src/constants/product-specs/australia-new-zealand.ts` | AU/NZ spec data |
| Create | `src/constants/product-specs/mexico.ts` | Mexico spec data |
| Create | `src/constants/product-specs/europe.ts` | Europe spec data |
| Create | `src/constants/product-specs/pneumatic-tube-systems.ts` | Pneumatic spec data |
| Modify | `src/app/[locale]/products/[market]/page.tsx:25-28` | Register 4 markets in `SPECS_BY_MARKET` |
| Modify | `src/constants/product-specs/types.ts:15` | Fix JSDoc: remove "Exactly 3" and "i18n keys" |
| Create | `src/constants/product-specs/__tests__/australia-new-zealand.test.ts` | Tests |
| Create | `src/constants/product-specs/__tests__/mexico.test.ts` | Tests |
| Create | `src/constants/product-specs/__tests__/europe.test.ts` | Tests |
| Create | `src/constants/product-specs/__tests__/pneumatic-tube-systems.test.ts` | Tests |
| Modify | `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx:174-184,220-242` | Update test — Mexico now has specs |
| Modify | `src/app/__tests__/sitemap.test.ts:50-62,90-101` | Add new pages to mock + assertions |

### Phase 2a: Bending Machines Page

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/constants/equipment-specs.ts` | Equipment data + types |
| Create | `src/app/[locale]/capabilities/bending-machines/page.tsx` | Page component |
| Modify | `src/config/paths/types.ts:22` | Add `"bendingMachines"` to `PageType` |
| Modify | `src/config/paths/paths-config.ts:53-55 (insert before line 56 `satisfies` closing)` | Add `bendingMachines` path |
| Modify | `src/app/sitemap.ts:17-26,44-54,63-79` | Add to STATIC_PAGES, PAGE_CONFIG_MAP, STATIC_PAGE_LASTMOD |
| Modify | `src/app/[locale]/products/page.tsx:97-98` | Change bending machines card href from `/contact` to `/capabilities/bending-machines` |
| Modify | `messages/en/critical.json:209` | Update `home.products.item3.link` |
| Modify | `messages/zh/critical.json` | Same update for zh |
| Modify | `messages/en/deferred.json` | Add `capabilities` namespace |
| Modify | `messages/zh/deferred.json` | Add `capabilities` namespace |
| Create | `src/constants/__tests__/equipment-specs.test.ts` | Equipment specs tests |
| Create | `src/app/[locale]/capabilities/bending-machines/__tests__/page.test.tsx` | Page tests |

### Phase 2b: OEM Page

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/app/[locale]/oem-custom-manufacturing/page.tsx` | Page component |
| Modify | `src/config/paths/types.ts:22` | Add `"oem"` to `PageType` (done with bendingMachines) |
| Modify | `src/config/paths/paths-config.ts` | Add `oem` path |
| Modify | `src/app/sitemap.ts` | Add to STATIC_PAGES, PAGE_CONFIG_MAP, STATIC_PAGE_LASTMOD |
| Modify | `messages/en/critical.json:218` | Update `home.products.item4.link` |
| Modify | `messages/zh/critical.json` | Same update for zh |
| Modify | `messages/en/deferred.json` | Add `oem` namespace |
| Modify | `messages/zh/deferred.json` | Add `oem` namespace |
| Create | `src/app/[locale]/oem-custom-manufacturing/__tests__/page.test.tsx` | Page tests |

---

## Task 1: Product Standards + Catalog Config Updates

**BDD:** "Product standards include all market-specific IDs"

**Files:**
- Modify: `src/constants/product-standards.ts`
- Modify: `src/constants/product-catalog.ts:86,96,106`
- Modify: `src/constants/product-specs/types.ts:15`

- [ ] **Step 1: Add new standard IDs to product-standards.ts**

After `as_nzs`:

```typescript
  nom: {
    label: "NOM",
  },
  iec: {
    label: "IEC",
  },
  petg: {
    label: "PETG",
  },
```

- [ ] **Step 2: Fill empty standardIds in product-catalog.ts**

Mexico (line ~86): `standardIds: ["nom"]`
Europe (line ~96): `standardIds: ["iec"]`
Pneumatic (line ~106): `standardIds: ["petg"]`

- [ ] **Step 3: Fix FamilySpecs JSDoc in types.ts**

Line 15 — change:
```typescript
  /** Exactly 3 key selling point i18n keys */
```
to:
```typescript
  /** Key selling points (raw English strings) */
```

- [ ] **Step 4: Run type-check**

Run: `pnpm type-check`
Expected: PASS (ProductStandardId union now includes `nom | iec | petg`)

- [ ] **Step 5: Commit**

```bash
git add src/constants/product-standards.ts src/constants/product-catalog.ts src/constants/product-specs/types.ts
git commit -m "feat(catalog): add nom, iec, petg standards and fill empty standardIds"
```

---

## Task 2: AU/NZ Spec Data (Red + Green)

**BDD:** "AU/NZ market page shows spec tables with metric sizes", "AU/NZ market shows bellmouths family"

**Files:**
- Create: `src/constants/product-specs/__tests__/australia-new-zealand.test.ts`
- Create: `src/constants/product-specs/australia-new-zealand.ts`

- [ ] **Step 1: Write failing test**

Create `src/constants/product-specs/__tests__/australia-new-zealand.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { AUSTRALIA_NZ_SPECS } from "../australia-new-zealand";
import type { MarketSpecs } from "../types";

describe("Feature: AU/NZ Spec Data", () => {
  it("exports a valid MarketSpecs object", () => {
    const specs: MarketSpecs = AUSTRALIA_NZ_SPECS;
    expect(specs).toBeDefined();
  });

  it("includes AS/NZS 2053 certification", () => {
    expect(AUSTRALIA_NZ_SPECS.certifications).toContain("AS/NZS 2053");
  });

  it("uses metric sizes in spec tables", () => {
    const firstFamily = AUSTRALIA_NZ_SPECS.families[0]!;
    const firstRow = firstFamily.specGroups[0]!.rows[0]!;
    // Metric sizes contain "mm"
    expect(firstRow[0]).toMatch(/mm/);
  });

  it("has Medium Duty and Heavy Duty groups", () => {
    const bends = AUSTRALIA_NZ_SPECS.families.find(
      (f) => f.slug === "conduit-bends",
    )!;
    const labels = bends.specGroups.map((g) => g.groupLabel);
    expect(labels).toContain("Medium Duty");
    expect(labels).toContain("Heavy Duty");
  });

  it("includes bellmouths family (unique to AU/NZ)", () => {
    const slugs = AUSTRALIA_NZ_SPECS.families.map((f) => f.slug);
    expect(slugs).toContain("bellmouths");
  });

  it("bellmouths family includes 'Flared Entry Protection' highlight", () => {
    const bellmouths = AUSTRALIA_NZ_SPECS.families.find(
      (f) => f.slug === "bellmouths",
    )!;
    expect(bellmouths.highlights).toContain("Flared Entry Protection");
  });

  it("includes all 4 families matching product-catalog.ts", () => {
    expect(AUSTRALIA_NZ_SPECS.families).toHaveLength(4);
    const slugs = AUSTRALIA_NZ_SPECS.families.map((f) => f.slug);
    expect(slugs).toContain("conduit-bends");
    expect(slugs).toContain("bellmouths");
    expect(slugs).toContain("couplings");
    expect(slugs).toContain("conduit-pipes");
  });

  it("spec group rows match column count", () => {
    for (const family of AUSTRALIA_NZ_SPECS.families) {
      for (const group of family.specGroups) {
        for (const row of group.rows) {
          expect(row).toHaveLength(group.columns.length);
        }
      }
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/constants/product-specs/__tests__/australia-new-zealand.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Create australia-new-zealand.ts**

Create `src/constants/product-specs/australia-new-zealand.ts` following the `north-america.ts` pattern. Key differences:
- All sizes in mm (16mm, 20mm, 25mm, 32mm, 40mm, 50mm, 63mm)
- Groups: "Medium Duty" / "Heavy Duty" (not Schedule 40/80)
- Certifications: `["AS/NZS 2053", "ISO 9001:2015"]`
- 4 families: conduit-bends, bellmouths, couplings, conduit-pipes
- Bellmouths family: columns `["Size", "Type", "End Type"]`
- Trade MOQ: "500 pcs"

Reference AS/NZS 2053 for typical wall thicknesses per duty rating.

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run src/constants/product-specs/__tests__/australia-new-zealand.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/constants/product-specs/australia-new-zealand.ts src/constants/product-specs/__tests__/australia-new-zealand.test.ts
git commit -m "feat(specs): add AU/NZ spec data with AS/NZS 2053 medium/heavy duty"
```

---

## Task 3: Mexico Spec Data (Red + Green)

**BDD:** "Mexico market page shows spec tables with local grouping"

**Files:**
- Create: `src/constants/product-specs/__tests__/mexico.test.ts`
- Create: `src/constants/product-specs/mexico.ts`

- [ ] **Step 1: Write failing test**

Create `src/constants/product-specs/__tests__/mexico.test.ts` — same pattern as AU/NZ test but verify:
- Certifications contain "NOM-001-SEDE"
- Groups: "Tipo Ligero" / "Tipo Pesado"
- 3 families: conduit-bends, couplings, conduit-pipes
- Metric sizes (mm)
- Row/column count match

- [ ] **Step 2: Run test — expected FAIL**

- [ ] **Step 3: Create mexico.ts**

Metric sizes, NOM-001-SEDE standard, Tipo Ligero/Tipo Pesado grouping.
3 families. Trade MOQ: "500 pcs".

- [ ] **Step 4: Run test — expected PASS**

- [ ] **Step 5: Commit**

```bash
git add src/constants/product-specs/mexico.ts src/constants/product-specs/__tests__/mexico.test.ts
git commit -m "feat(specs): add Mexico spec data with NOM-001-SEDE tipo ligero/pesado"
```

---

## Task 4: Europe Spec Data (Red + Green)

**BDD:** "Europe market page shows spec tables with three duty ratings"

**Files:**
- Create: `src/constants/product-specs/__tests__/europe.test.ts`
- Create: `src/constants/product-specs/europe.ts`

- [ ] **Step 1: Write failing test**

Verify:
- Certifications contain "IEC 61386"
- Groups: "Light", "Medium", "Heavy"
- 3 families: conduit-bends, couplings, conduit-pipes
- Metric sizes
- Row/column count match

- [ ] **Step 2: Run test — expected FAIL**

- [ ] **Step 3: Create europe.ts**

Metric sizes, IEC 61386 standard, Light/Medium/Heavy grouping.
3 families. Trade MOQ: "500 pcs".

- [ ] **Step 4: Run test — expected PASS**

- [ ] **Step 5: Commit**

```bash
git add src/constants/product-specs/europe.ts src/constants/product-specs/__tests__/europe.test.ts
git commit -m "feat(specs): add Europe spec data with IEC 61386 three duty ratings"
```

---

## Task 5: Pneumatic Tube Systems Spec Data (Red + Green)

**BDD:** "Pneumatic tube systems page shows PETG specs grouped by outer diameter"

**Files:**
- Create: `src/constants/product-specs/__tests__/pneumatic-tube-systems.test.ts`
- Create: `src/constants/product-specs/pneumatic-tube-systems.ts`

- [ ] **Step 1: Write failing test**

Verify:
- No traditional certifications (empty array or PETG-specific)
- Groups by OD: "110mm OD" / "160mm OD" (or similar)
- 2 families: petg-tubes, fittings
- Trade MOQ in meters: `expect(PNEUMATIC_SPECS.trade.moq).toMatch(/meter/i)`
- Row/column count match
- Fittings family exists (includes diverters in highlights or spec rows)

- [ ] **Step 2: Run test — expected FAIL**

- [ ] **Step 3: Create pneumatic-tube-systems.ts**

PETG material properties (transparency, temperature range, working pressure).
petg-tubes family: columns `["Outer Diameter", "Wall Thickness", "Length", "Bend Radius"]`
fittings family: columns `["Type", "Size", "Connection", "Material"]` — includes diverters, connectors, bends.
Trade MOQ: "100 meters", leadTime: "20-30 days".

Reference archived MDX (`content/_archive/products/en/petg-pneumatic-tube.mdx`) for spec values.

- [ ] **Step 4: Run test — expected PASS**

- [ ] **Step 5: Commit**

```bash
git add src/constants/product-specs/pneumatic-tube-systems.ts src/constants/product-specs/__tests__/pneumatic-tube-systems.test.ts
git commit -m "feat(specs): add pneumatic tube systems PETG spec data"
```

---

## Task 6: Register All Markets in SPECS_BY_MARKET + Update Tests

**BDD:** "'Specs coming soon' message no longer appears on any market page", "Each market page shows trust signals"

**Files:**
- Modify: `src/app/[locale]/products/[market]/page.tsx:10-11,25-28`
- Modify: `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx:174-184,220-242`

- [ ] **Step 1: Add imports and register in SPECS_BY_MARKET**

In `src/app/[locale]/products/[market]/page.tsx`, add imports after line 10:

```typescript
import { AUSTRALIA_NZ_SPECS } from "@/constants/product-specs/australia-new-zealand";
import { MEXICO_SPECS } from "@/constants/product-specs/mexico";
import { EUROPE_SPECS } from "@/constants/product-specs/europe";
import { PNEUMATIC_SPECS } from "@/constants/product-specs/pneumatic-tube-systems";
```

Update `SPECS_BY_MARKET` (lines 25-28):

```typescript
const SPECS_BY_MARKET: Record<string, MarketSpecs> = {
  "north-america": NORTH_AMERICA_SPECS,
  "australia-new-zealand": AUSTRALIA_NZ_SPECS,
  "mexico": MEXICO_SPECS,
  "europe": EUROPE_SPECS,
  "pneumatic-tube-systems": PNEUMATIC_SPECS,
};
```

- [ ] **Step 2: Update market-landing test — Mexico now has specs**

In `market-landing.test.tsx`, the test at line 174 ("does not render trust signals for market without spec data") uses Mexico. Since Mexico now has specs, this test must change.

**Option**: Remove this specific negative test (all markets now have specs) OR change it to test a truly invalid market. Since `notFound()` handles invalid markets (tested at line 204), remove the Mexico-specific negative case and update the "Market without spec data" describe block (lines 220-242):

Replace the entire "Market without spec data" describe block (lines 220-242) with tests verifying AU/NZ now renders families and sticky nav:

```typescript
describe("Scenario: AU/NZ market renders with spec data", () => {
  it("renders family sections for AU/NZ", async () => {
    await renderPage("australia-new-zealand");

    expect(
      screen.getByTestId("family-conduit-bends"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("family-bellmouths"),
    ).toBeInTheDocument();
  });

  it("renders trust signals for AU/NZ", async () => {
    await renderPage("australia-new-zealand");

    expect(screen.getByTestId("product-specs")).toBeInTheDocument();
    expect(screen.getByTestId("product-certifications")).toBeInTheDocument();
    expect(screen.getByTestId("product-trade-info")).toBeInTheDocument();
  });

  it("renders sticky family navigation when spec data exists", async () => {
    await renderPage("australia-new-zealand");

    expect(screen.getByTestId("sticky-nav")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `pnpm vitest run src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`
Expected: PASS

- [ ] **Step 4: Run type-check and full test suite**

Run: `pnpm type-check && pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/products/[market]/page.tsx src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx
git commit -m "feat(catalog): register all 5 markets in SPECS_BY_MARKET"
```

---

## Task 7: Equipment Specs Data (Red + Green)

**BDD:** "Buyer views full-auto machine specifications", "Buyer views semi-auto machine specifications"

**Files:**
- Create: `src/constants/__tests__/equipment-specs.test.ts`
- Create: `src/constants/equipment-specs.ts`

- [ ] **Step 1: Write failing test**

Create `src/constants/__tests__/equipment-specs.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import {
  EQUIPMENT_SPECS,
  getEquipmentBySlug,
  type EquipmentSpec,
} from "../equipment-specs";

describe("Feature: Equipment Specs", () => {
  it("exports an array with 2 machines", () => {
    expect(EQUIPMENT_SPECS).toHaveLength(2);
  });

  it("includes full-auto bending machine", () => {
    const fullAuto = getEquipmentBySlug("full-auto-bending-machine");
    expect(fullAuto).toBeDefined();
    expect(fullAuto!.params).toHaveProperty("pipeDiameter");
    expect(fullAuto!.params).toHaveProperty("productionSpeed");
  });

  it("includes semi-auto bending machine", () => {
    const semiAuto = getEquipmentBySlug("semi-auto-bending-machine");
    expect(semiAuto).toBeDefined();
    expect(semiAuto!.params).toHaveProperty("pipeDiameter");
    expect(semiAuto!.params).toHaveProperty("productionSpeed");
  });

  it("full-auto has larger diameter range than semi-auto", () => {
    const fullAuto = getEquipmentBySlug("full-auto-bending-machine")!;
    const semiAuto = getEquipmentBySlug("semi-auto-bending-machine")!;
    // Full-auto: DN25-DN160mm, Semi-auto: DN20-DN110mm
    expect(fullAuto.params.pipeDiameter).toMatch(/160/);
    expect(semiAuto.params.pipeDiameter).toMatch(/110/);
  });

  it("each machine has highlights", () => {
    for (const machine of EQUIPMENT_SPECS) {
      expect(machine.highlights.length).toBeGreaterThan(0);
    }
  });

  it("satisfies EquipmentSpec interface", () => {
    const machine: EquipmentSpec = EQUIPMENT_SPECS[0]!;
    expect(machine.slug).toBeDefined();
    expect(machine.name).toBeDefined();
    expect(machine.params).toBeDefined();
    expect(machine.highlights).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test — expected FAIL**

- [ ] **Step 3: Create equipment-specs.ts**

Create `src/constants/equipment-specs.ts`:

```typescript
export interface EquipmentSpec {
  slug: string;
  name: string;
  /** Key-value specification pairs */
  params: Record<string, string>;
  /** Key selling points (raw English strings) */
  highlights: string[];
  /** Placeholder image path */
  image: string;
}

export const EQUIPMENT_SPECS = [
  {
    slug: "full-auto-bending-machine",
    name: "Full-Automatic PVC Pipe Bending Machine",
    params: {
      pipeDiameter: "DN25-DN160mm",
      bendingAngles: "15°-180° (Programmable)",
      heatingZones: "4-8 zones",
      powerSupply: "380V/50Hz 3-Phase",
      productionSpeed: "150-200 pcs/hour",
      machineWeight: "~1200kg",
      controlSystem: "PLC + HMI Touch Screen",
    },
    highlights: [
      "CNC Control System",
      "Automatic Feeding",
      "Multi-Station Design",
      "Remote Diagnostics",
    ],
    image: "/images/products/placeholder-conduit.svg",
  },
  {
    slug: "semi-auto-bending-machine",
    name: "Semi-Automatic PVC Pipe Bending Machine",
    params: {
      pipeDiameter: "DN20-DN110mm",
      bendingAngles: "45°, 90°, Custom",
      heatingMethod: "Infrared / Electric",
      powerSupply: "380V/50Hz 3-Phase",
      productionSpeed: "60-80 pcs/hour",
      machineWeight: "~500kg",
    },
    highlights: [
      "Precision Temperature Control",
      "Adjustable Bending Angles",
      "Quick-Swap Mold System",
      "Safety Features",
    ],
    image: "/images/products/placeholder-conduit.svg",
  },
] satisfies readonly EquipmentSpec[];

export function getEquipmentBySlug(
  slug: string,
): EquipmentSpec | undefined {
  return EQUIPMENT_SPECS.find((e) => e.slug === slug);
}
```

- [ ] **Step 4: Run test — expected PASS**

- [ ] **Step 5: Commit**

```bash
git add src/constants/equipment-specs.ts src/constants/__tests__/equipment-specs.test.ts
git commit -m "feat: add equipment-specs.ts for bending machines"
```

---

## Task 8: Infrastructure — Route Config + Sitemap

**BDD:** "Route config includes new pages", "New standalone pages appear in sitemap"

**Files:**
- Modify: `src/config/paths/types.ts:22`
- Modify: `src/config/paths/paths-config.ts:53-68`
- Modify: `src/app/sitemap.ts:17-26,44-54,63-79`

- [ ] **Step 1: Add PageType entries**

In `src/config/paths/types.ts`, update `PageType` union (line 15-23):

```typescript
export type PageType =
  | "home"
  | "about"
  | "contact"
  | "blog"
  | "products"
  | "faq"
  | "privacy"
  | "terms"
  | "bendingMachines"
  | "oem";
```

- [ ] **Step 2: Add PATHS_CONFIG entries**

In `src/config/paths/paths-config.ts`, after `terms`:

```typescript
  bendingMachines: Object.freeze({
    en: "/capabilities/bending-machines",
    zh: "/capabilities/bending-machines",
  }),

  oem: Object.freeze({
    en: "/oem-custom-manufacturing",
    zh: "/oem-custom-manufacturing",
  }),
```

- [ ] **Step 3: Update sitemap.ts**

Add to `STATIC_PAGES` array:
```typescript
  "/capabilities/bending-machines",
  "/oem-custom-manufacturing",
```

Add to `PAGE_CONFIG_MAP`:
```typescript
  ["/capabilities/bending-machines", { changeFrequency: "monthly", priority: 0.8 }],
  ["/oem-custom-manufacturing", { changeFrequency: "monthly", priority: 0.8 }],
```

Add to `STATIC_PAGE_LASTMOD`:
```typescript
  ["/capabilities/bending-machines", new Date("2026-03-23T00:00:00Z")],
  ["/oem-custom-manufacturing", new Date("2026-03-23T00:00:00Z")],
```

- [ ] **Step 4: Run type-check**

Run: `pnpm type-check`
Expected: PASS

- [ ] **Step 5: Update sitemap test**

In `src/app/__tests__/sitemap.test.ts`:

Add to the `getStaticPageLastModified` mock dates map (line ~51-60):
```typescript
"/capabilities/bending-machines": new Date("2026-03-23T00:00:00Z"),
"/oem-custom-manufacturing": new Date("2026-03-23T00:00:00Z"),
```

Add to the "should include static pages" test (line ~90-101):
```typescript
expect(urls).toContain("https://example.com/en/capabilities/bending-machines");
expect(urls).toContain("https://example.com/en/oem-custom-manufacturing");
```

Add a new test:
```typescript
it("should include standalone pages with correct config", async () => {
  const result = await sitemap();
  const bendingMachines = result.find(
    (entry) => entry.url === "https://example.com/en/capabilities/bending-machines",
  );
  expect(bendingMachines).toBeDefined();
  expect(bendingMachines?.priority).toBe(0.8);
  expect(bendingMachines?.changeFrequency).toBe("monthly");

  const oem = result.find(
    (entry) => entry.url === "https://example.com/en/oem-custom-manufacturing",
  );
  expect(oem).toBeDefined();
  expect(oem?.priority).toBe(0.8);
  expect(oem?.changeFrequency).toBe("monthly");
});
```

- [ ] **Step 6: Run sitemap tests**

Run: `pnpm vitest run src/app/__tests__/sitemap.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/config/paths/types.ts src/config/paths/paths-config.ts src/app/sitemap.ts src/app/__tests__/sitemap.test.ts
git commit -m "feat: add route config and sitemap entries for bending machines + OEM"
```

---

## Task 9: Bending Machines i18n + Page (Red + Green)

**BDD:** "Buyer views the bending machines page", "Buyer navigates to contact from bending machines page", "Buyer sees production capability numbers"

**Files:**
- Modify: `messages/en/deferred.json` — add `capabilities` namespace
- Modify: `messages/zh/deferred.json` — add `capabilities` namespace
- Create: `src/app/[locale]/capabilities/bending-machines/__tests__/page.test.tsx`
- Create: `src/app/[locale]/capabilities/bending-machines/page.tsx`

- [ ] **Step 1: Add i18n namespace to deferred.json (en)**

Add to `messages/en/deferred.json`:

```json
"capabilities": {
  "meta": {
    "title": "PVC Conduit Bending Machines | Tianze",
    "description": "Self-developed full-auto and semi-auto PVC conduit bending machines. The core manufacturing technology behind our fittings."
  },
  "hero": {
    "title": "PVC Conduit Bending Machines",
    "subtitle": "Self-developed. In-house manufactured. The technology behind our fittings."
  },
  "why": {
    "title": "Why It Matters",
    "card1": { "title": "We Make the Machines", "desc": "As an upstream bending machine manufacturer, we control the core technology that shapes every fitting." },
    "card2": { "title": "Precision Control", "desc": "CNC-controlled bending ensures consistent angles, wall thickness, and finish across every production run." },
    "card3": { "title": "Custom Capability", "desc": "In-house mold development means we can produce non-standard sizes, angles, and specifications to your requirements." }
  },
  "machines": {
    "title": "Machine Lineup"
  },
  "capability": {
    "title": "Production Capability",
    "monthlyCapacity": { "value": "50,000+", "label": "Fittings per Month" },
    "countries": { "value": "20+", "label": "Countries Served" },
    "experience": { "value": "10+", "label": "Years of Experience" }
  },
  "cta": {
    "heading": "Interested in our bending technology?",
    "description": "Whether you need OEM manufacturing or want to discuss custom specifications, we're ready to help.",
    "button": "Contact Us"
  }
}
```

- [ ] **Step 2: Add i18n namespace to deferred.json (zh)**

Same structure with Chinese translations.

- [ ] **Step 3: Write failing page test**

Create `src/app/[locale]/capabilities/bending-machines/__tests__/page.test.tsx`:

```typescript
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetTranslations = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  routing: { locales: ["en", "zh"], defaultLocale: "en" },
}));

vi.mock("@/app/[locale]/generate-static-params", () => ({
  generateLocaleStaticParams: () => [{ locale: "en" }, { locale: "zh" }],
}));

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe("Feature: Bending Machines Capability Page", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetTranslations.mockReset();
    mockGetTranslations.mockResolvedValue(
      (key: string) => key,
    );
  });

  async function renderPage(locale = "en") {
    const { default: Page } = await import("../page");
    const page = await Page({
      params: Promise.resolve({ locale }),
    });
    return render(page);
  }

  it("renders the hero section with title", async () => {
    await renderPage();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("hero.title");
  });

  it("renders value proposition cards", async () => {
    await renderPage();
    expect(screen.getByText("why.card1.title")).toBeInTheDocument();
    expect(screen.getByText("why.card2.title")).toBeInTheDocument();
    expect(screen.getByText("why.card3.title")).toBeInTheDocument();
  });

  it("renders specs for both machines", async () => {
    await renderPage();
    // Machine names come from equipment-specs.ts, not i18n
    expect(screen.getByText(/Full-Automatic/)).toBeInTheDocument();
    expect(screen.getByText(/Semi-Automatic/)).toBeInTheDocument();
  });

  it("renders production capability numbers", async () => {
    await renderPage();
    expect(screen.getByText("capability.monthlyCapacity.value")).toBeInTheDocument();
    expect(screen.getByText("capability.countries.value")).toBeInTheDocument();
  });

  it("CTA links to /contact", async () => {
    await renderPage();
    const ctaLink = screen.getByRole("link", { name: /cta\.button/i });
    expect(ctaLink).toHaveAttribute("href", "/contact");
  });

  it("renders in Chinese locale", async () => {
    await renderPage("zh");
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("is an async server component", () => {
    const mod = require("../page");
    const result = mod.default({ params: Promise.resolve({ locale: "en" }) });
    expect(result).toBeInstanceOf(Promise);
  });
});
```

- [ ] **Step 4: Run test — expected FAIL**

- [ ] **Step 5: Create bending machines page**

Create `src/app/[locale]/capabilities/bending-machines/page.tsx`:

- Import `generateLocaleStaticParams`, `getTranslations`, `setRequestLocale`
- Import `EQUIPMENT_SPECS` from `@/constants/equipment-specs`
- Import `Link` from `@/i18n/routing`
- Export `generateStaticParams()` and `generateMetadata()`
- Page structure: Hero → WhyItMatters → MachineLineup → ProductionCapability → CTA
- Extract sub-sections as local functions to stay under 120 lines
- Use `getTranslations({ locale, namespace: "capabilities" })`

- [ ] **Step 6: Run test — expected PASS**

- [ ] **Step 7: Run full type-check + lint**

Run: `pnpm type-check && pnpm lint:check`

- [ ] **Step 8: Commit**

```bash
git add src/app/[locale]/capabilities/ messages/en/deferred.json messages/zh/deferred.json
git commit -m "feat: add bending machines capability page"
```

---

## Task 10: Update Bending Machines Links (Products Overview + Homepage)

**BDD:** "Bending machines page is accessible from products overview", "Bending machines page is accessible from homepage"

**Files:**
- Modify: `src/app/[locale]/products/page.tsx:97-98`
- Modify: `messages/en/critical.json:209`
- Modify: `messages/zh/critical.json` (same line)
- Modify: `src/app/[locale]/products/__tests__/products-page.test.tsx:123-133`

- [ ] **Step 1: Update products overview page**

In `src/app/[locale]/products/page.tsx`, change the bending machines card `<Link>` (line ~98):

From: `href="/contact"`
To: `href="/capabilities/bending-machines"`

- [ ] **Step 2: Update homepage i18n links**

In `messages/en/critical.json`, change `home.products.item3.link`:
From: `"/contact"`
To: `"/capabilities/bending-machines"`

Same change in `messages/zh/critical.json`.

- [ ] **Step 3: Update products-page test**

In `products-page.test.tsx`, update test "equipment card links to /contact" (line 123):

Change expected href from `"/contact"` to `"/capabilities/bending-machines"`.
Update test description to: `"equipment card links to /capabilities/bending-machines"`.

- [ ] **Step 4: Run tests**

Run: `pnpm vitest run src/app/[locale]/products/__tests__/products-page.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/products/page.tsx src/app/[locale]/products/__tests__/products-page.test.tsx messages/en/critical.json messages/zh/critical.json
git commit -m "feat: update bending machines links from /contact to /capabilities/bending-machines"
```

---

## Task 11: OEM i18n + Page (Red + Green)

**BDD:** "Buyer views the OEM service page", "Buyer views the OEM collaboration process", "Buyer sees supported standards for OEM", "Buyer navigates to contact from OEM page"

**Files:**
- Modify: `messages/en/deferred.json` — add `oem` namespace
- Modify: `messages/zh/deferred.json` — add `oem` namespace
- Create: `src/app/[locale]/oem-custom-manufacturing/__tests__/page.test.tsx`
- Create: `src/app/[locale]/oem-custom-manufacturing/page.tsx`

- [ ] **Step 1: Add i18n namespace (en)**

Add to `messages/en/deferred.json`:

```json
"oem": {
  "meta": {
    "title": "OEM & Custom Manufacturing | Tianze",
    "description": "Custom PVC conduit fittings manufacturing — your specifications, our production capability. From prototype to mass production."
  },
  "hero": {
    "title": "OEM & Custom Manufacturing",
    "subtitle": "Your specifications. Our production capability."
  },
  "scope": {
    "title": "Service Scope",
    "customSizes": { "title": "Custom Sizes", "desc": "Non-standard diameters, angles, and wall thicknesses to your exact specifications." },
    "privateLabel": { "title": "Private Label", "desc": "Your brand, your packaging. Complete branded product solutions." },
    "moldDevelopment": { "title": "Mold Development", "desc": "In-house mold design and manufacturing for any fitting geometry." },
    "qualityAssurance": { "title": "Quality Assurance", "desc": "Full inspection with optional third-party certification to your required standards." }
  },
  "process": {
    "title": "How We Work Together",
    "step1": { "title": "Inquiry", "desc": "Share your specifications and requirements", "timeline": "Day 1" },
    "step2": { "title": "Sample", "desc": "We produce samples for your approval", "timeline": "7-15 days" },
    "step3": { "title": "Mold & Tooling", "desc": "Custom mold development if needed", "timeline": "15-30 days" },
    "step4": { "title": "Trial Run", "desc": "Small batch production for final validation", "timeline": "7-10 days" },
    "step5": { "title": "Mass Production", "desc": "Full-scale production and quality-controlled delivery", "timeline": "15-20 days" }
  },
  "standards": {
    "title": "Supported Standards",
    "desc": "We manufacture to all major international conduit standards — and custom specifications.",
    "custom": "Custom standards also supported"
  },
  "cta": {
    "heading": "Start Your OEM Project",
    "description": "Tell us your specifications. We'll provide a detailed proposal with timeline and pricing.",
    "button": "Get Started"
  }
}
```

- [ ] **Step 2: Add i18n namespace (zh)**

Same structure with Chinese translations.

- [ ] **Step 3: Write failing page test**

Create `src/app/[locale]/oem-custom-manufacturing/__tests__/page.test.tsx`:

```typescript
import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetTranslations = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  routing: { locales: ["en", "zh"], defaultLocale: "en" },
}));

vi.mock("@/app/[locale]/generate-static-params", () => ({
  generateLocaleStaticParams: () => [{ locale: "en" }, { locale: "zh" }],
}));

describe("Feature: OEM Custom Manufacturing Page", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetTranslations.mockReset();
    mockGetTranslations.mockResolvedValue(
      (key: string) => key,
    );
  });

  async function renderPage(locale = "en") {
    const { default: Page } = await import("../page");
    const page = await Page({
      params: Promise.resolve({ locale }),
    });
    return render(page);
  }

  it("renders the hero section with title", async () => {
    await renderPage();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("hero.title");
  });

  it("renders 4 service scope modules", async () => {
    await renderPage();
    expect(screen.getByText("scope.customSizes.title")).toBeInTheDocument();
    expect(screen.getByText("scope.privateLabel.title")).toBeInTheDocument();
    expect(screen.getByText("scope.moldDevelopment.title")).toBeInTheDocument();
    expect(screen.getByText("scope.qualityAssurance.title")).toBeInTheDocument();
  });

  it("renders 5 process steps", async () => {
    await renderPage();
    expect(screen.getByText("process.step1.title")).toBeInTheDocument();
    expect(screen.getByText("process.step2.title")).toBeInTheDocument();
    expect(screen.getByText("process.step3.title")).toBeInTheDocument();
    expect(screen.getByText("process.step4.title")).toBeInTheDocument();
    expect(screen.getByText("process.step5.title")).toBeInTheDocument();
  });

  it("renders supported standards section", async () => {
    await renderPage();
    expect(screen.getByText("standards.title")).toBeInTheDocument();
  });

  it("CTA links to /contact", async () => {
    await renderPage();
    const ctaLink = screen.getByRole("link", { name: /cta\.button/i });
    expect(ctaLink).toHaveAttribute("href", "/contact");
  });

  it("renders in Chinese locale", async () => {
    await renderPage("zh");
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("is an async server component", () => {
    const mod = require("../page");
    const result = mod.default({ params: Promise.resolve({ locale: "en" }) });
    expect(result).toBeInstanceOf(Promise);
  });
});
```

- [ ] **Step 4: Run test — expected FAIL**

- [ ] **Step 5: Create OEM page**

Create `src/app/[locale]/oem-custom-manufacturing/page.tsx`:

- Import `generateLocaleStaticParams`, `getTranslations`, `setRequestLocale`
- Import `Link` from `@/i18n/routing`
- Export `generateStaticParams()` and `generateMetadata()`
- Sections: Hero → ServiceScope → ProcessFlow → SupportedStandards → CTA
- Process flow uses numbered circles + connecting lines (reference homepage `chain-section.tsx` pattern)
- Extract sub-sections as local functions
- Use `getTranslations({ locale, namespace: "oem" })`

- [ ] **Step 6: Run test — expected PASS**

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale]/oem-custom-manufacturing/ messages/en/deferred.json messages/zh/deferred.json
git commit -m "feat: add OEM custom manufacturing page"
```

---

## Task 12: Update OEM Homepage Link

**BDD:** "OEM page is accessible from homepage"

**Files:**
- Modify: `messages/en/critical.json:218`
- Modify: `messages/zh/critical.json` (same)

- [ ] **Step 1: Update homepage i18n links**

In `messages/en/critical.json`, change `home.products.item4.link`:
From: `"/contact"`
To: `"/oem-custom-manufacturing"`

Same in `messages/zh/critical.json`.

- [ ] **Step 2: Run i18n validation**

Run: `pnpm i18n:full`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add messages/
git commit -m "feat: update OEM homepage link to /oem-custom-manufacturing"
```

---

## Task 13: Integration Validation

**BDD:** All acceptance criteria

**Files:** None (validation only)

- [ ] **Step 1: Type check**

Run: `pnpm type-check`
Expected: PASS with zero errors

- [ ] **Step 2: Lint**

Run: `pnpm lint:check`
Expected: PASS with zero warnings

- [ ] **Step 3: Full test suite**

Run: `pnpm test`
Expected: All tests pass

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: Successful build

- [ ] **Step 5: i18n validation**

Run: `pnpm i18n:full`
Expected: All translations valid, flat files in sync

- [ ] **Step 6: Manual spot check (dev server)**

Run: `pnpm dev`
Visit:
- `/en/products/australia-new-zealand` — spec tables visible, no "coming soon"
- `/en/products/mexico` — spec tables with Tipo Ligero/Pesado
- `/en/products/europe` — spec tables with Light/Medium/Heavy
- `/en/products/pneumatic-tube-systems` — PETG spec tables
- `/en/capabilities/bending-machines` — full page with machine specs
- `/en/oem-custom-manufacturing` — full page with process flow
- `/en/products` — bending machines card links to `/capabilities/bending-machines`

- [ ] **Step 7: Commit any final fixes, then done**

---

## Dependency Chain

```
Task 1 (standards + catalog config)
  ↓
Tasks 2-5 (4 spec data files — parallel)  +  Task 7 (equipment-specs — parallel)  +  Task 8 (route config + sitemap — parallel)
  ↓                                            ↓                                       ↓
Task 6 (register SPECS_BY_MARKET)              Tasks 9-10 (bending machines page)      Tasks 11-12 (OEM page)
  ↓                                            ↓                                       ↓
  └──────────────────────────────────────────→ Task 13 (integration validation) ←──────┘
```

**Parallelization opportunities:**
- Tasks 2-5 are independent of each other
- Task 7 (equipment-specs) has no dependency on Tasks 2-6 — can run in parallel with Tasks 2-5
- Task 8 (route config) has no dependency on Tasks 2-7 — can run in parallel with Tasks 2-5
- Tasks 9-10 depend on Task 7 + Task 8
- Tasks 11-12 depend on Task 8
- Task 6 depends on Tasks 2-5
- Task 13 depends on all preceding tasks
