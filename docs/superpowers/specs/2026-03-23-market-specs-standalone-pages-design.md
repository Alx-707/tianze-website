# Design: Market Spec Data + Standalone Pages

> Status: Approved
> Date: 2026-03-23
> Scope: Phase 1 (4 market spec data + page adjustments) + Phase 2 (bending machines + OEM pages)

## 1. Context

PR #40 created the product catalog route structure (`/products/[market]/[family]`) with North America as the only market with spec data. PR #41 added North America Phase 1 spec tables.

Currently:
- AU/NZ, Mexico, Europe, Pneumatic Tube Systems show "specs coming soon"
- `/capabilities/bending-machines` and `/oem-custom-manufacturing` don't exist (bending machines card links to `/contact`)

## 2. Goals

1. Fill spec data for all 4 remaining markets so every market page shows full content
2. Adapt page rendering for market-specific differences (metric sizes, duty ratings vs schedules)
3. Create two standalone pages: bending machines (core differentiator) and OEM service
4. Update products overview page to link bending machines card to real page

## 3. Non-Goals

- Real product photography (placeholder images continue)
- Navigation menu changes (new pages reachable via product overview cards + CTAs)
- MDX content for standalone pages (Server Component + i18n keys)

## 4. Design Decisions

### 4.1 Content Strategy

- **Market spec data** → TypeScript constants (structured, type-safe, programmatically consumed)
- **Standalone pages** → Server Components + i18n keys (marketing landing pages needing precise layout control)
- **Neither** uses MDX — MDX remains for narrative content (blog, about, FAQ, legal)

Rationale documented in `.claude/rules/content.md` and `.claude/rules/architecture.md`.

### 4.2 Equipment specs separate from product specs

Bending machine parameters live in `src/constants/equipment-specs.ts`, NOT in `product-specs/`.

Reason: machines are manufacturing equipment (capability showcase), not products sold to buyers. Different audience, different data shape, different page context.

### 4.3 Standalone pages outside product-catalog.ts

OEM and bending machines are NOT markets or product families. They don't belong in the catalog config. They get independent routes and their own i18n namespaces.

---

## 5. Phase 1: Market Spec Data + Page Adjustments

### 5.1 New spec data files

| File | Standard | Size System | Group By | Families |
|------|----------|-------------|----------|----------|
| `product-specs/australia-new-zealand.ts` | AS/NZS 2053 | mm | Medium Duty / Heavy Duty | conduit-bends, bellmouths, couplings, conduit-pipes |
| `product-specs/mexico.ts` | NOM-001-SEDE | mm | Tipo Ligero / Tipo Pesado | conduit-bends, couplings, conduit-pipes |
| `product-specs/europe.ts` | IEC 61386 | mm | Light / Medium / Heavy | conduit-bends, couplings, conduit-pipes |
| `product-specs/pneumatic-tube-systems.ts` | PETG | mm | By OD (110mm / 160mm) | petg-tubes, fittings |

Each file exports a `satisfies MarketSpecs` object following the `north-america.ts` pattern.

Data is draft based on industry standards — owner will provide real data later for replacement.

### 5.2 Key differences from North America

| Dimension | North America | AU/NZ | Mexico | Europe | Pneumatic |
|-----------|--------------|-------|--------|--------|-----------|
| Size system | Imperial (1/2", 3/4") | Metric (16mm, 20mm) | Metric | Metric | Metric (OD) |
| Grouping | Schedule 40/80 | Medium/Heavy Duty | Tipo Ligero/Pesado | Light/Medium/Heavy | By OD |
| Unique products | — | Bellmouths | — | — | PETG tubes, fittings (incl. diverters) |
| Certifications | UL 651, ASTM D1785 | AS/NZS 2053 | NOM-001-SEDE | IEC 61386 | — |
| Trade terms | 500 pcs MOQ | 500 pcs MOQ | 500 pcs MOQ | 500 pcs MOQ | 100 meters MOQ |

### 5.3 SPECS_BY_MARKET registration

In `src/app/[locale]/products/[market]/page.tsx`:

```typescript
const SPECS_BY_MARKET: Record<string, MarketSpecs> = {
  "north-america": NORTH_AMERICA_SPECS,
  "australia-new-zealand": AUSTRALIA_NZ_SPECS,
  "mexico": MEXICO_SPECS,
  "europe": EUROPE_SPECS,
  "pneumatic-tube-systems": PNEUMATIC_SPECS,
};
```

Page logic already handles the presence/absence of specs — registration alone switches from "coming soon" to full display.

### 5.4 product-standards.ts additions

New standard IDs (short display-friendly labels; full standard names already exist in `product-catalog.ts` `standardLabel` fields):

```typescript
nom: { label: "NOM" },
iec: { label: "IEC" },
petg: { label: "PETG" },
```

Update `product-catalog.ts` to fill currently-empty `standardIds`:
- Mexico: `["nom"]`
- Europe: `["iec"]`
- Pneumatic: `["petg"]`

### 5.5 Highlights: raw strings (matching existing pattern)

The existing `north-america.ts` stores highlights as **raw English strings** directly in the spec data (e.g., `"UL 651 Certified"`). `FamilySection` renders them with `<span>{highlight}</span>` — no `t()` translation lookup.

The orphaned `catalog.highlights` i18n keys in `critical.json` are unused by any component.

**Decision**: New markets follow the same pattern — raw English strings in spec data files. This is consistent with North America and avoids a `FamilySection` refactor.

**Future task (deferred)**: Migrate all highlights to i18n keys. This requires refactoring `FamilySection` to accept key names and call `t("catalog.highlights." + key)`. Not in scope for this phase.

New highlight strings per market:

**AU/NZ**: "AS/NZS 2053 Certified", "Medium & Heavy Duty", "Bell End Fittings", "Flared Entry Protection", "Metric Sizes"
**Mexico**: "NOM Compliant", "Metric Sizes", "Light & Heavy Duty"
**Europe**: "IEC 61386 Certified", "Three Duty Ratings", "Metric Sizes"
**Pneumatic**: "Crystal Clear PETG", "Silent Operation", "Leak-Proof Joints", "Impact Resistant", "Hospital Grade"

### 5.6 Trade terms per market

Each market's `trade` object is independent. Pneumatic tubes use meters-based MOQ and longer lead times. All others share similar structure but values may differ.

---

## 6. Phase 2: Standalone Pages

### 6.1 Route structure

| Page | Route | Type | Purpose |
|------|-------|------|---------|
| Bending Machines | `/capabilities/bending-machines` | Static page | Core differentiator: "we make the machines" |
| OEM Service | `/oem-custom-manufacturing` | Static page | Service landing: "your specs, our production" |

Neither route is part of `product-catalog.ts`.

### 6.2 Bending Machines page

**Route**: `src/app/[locale]/capabilities/bending-machines/page.tsx`

**Sections** (top to bottom):

1. **Hero** — Title + subtitle + placeholder image
   - "PVC Conduit Bending Machines"
   - "Self-developed. In-house manufactured. The technology behind our fittings."

2. **Why It Matters** — 3 value proposition cards
   - "We Make the Machines" — upstream manufacturer vs trader
   - "Precision Control" — CNC ensures product consistency
   - "Custom Capability" — adjustable molds and angles per customer need

3. **Machine Lineup** — 2 machines with spec tables
   - Full-Auto: DN25-DN160mm, 150-200 pcs/hr, PLC+HMI, 380V 3-phase, ~1200kg
   - Semi-Auto: DN20-DN110mm, 60-80 pcs/hr, digital temp control, 380V 3-phase, ~500kg
   - Each rendered as card with image placeholder + key-value spec table + highlights

4. **Production Capability** — Key numbers in monospace large font
   - Monthly capacity, countries served, years of experience
   - Engineering data aesthetic (monospace + grid)

5. **CTA** — "Interested in our bending technology or OEM partnership?" → /contact

**Data**: `src/constants/equipment-specs.ts`

```typescript
interface EquipmentSpec {
  slug: string;
  name: string;
  params: Record<string, string>;  // key-value spec pairs
  highlights: string[];             // i18n keys
}
```

**i18n namespace**: `capabilities` (new, in `deferred.json`)

**Page conventions**: Must export `generateStaticParams()` and call `setRequestLocale(locale)` before any hooks/translations, following existing page patterns.

### 6.3 OEM Service page

**Route**: `src/app/[locale]/oem-custom-manufacturing/page.tsx`

**Sections** (top to bottom):

1. **Hero** — Title + subtitle
   - "OEM & Custom Manufacturing"
   - "Your specifications. Our production capability."

2. **Service Scope** — 4 capability modules
   - Custom Sizes — non-standard diameters/angles/thickness
   - Private Label — branded packaging and marking
   - Mold Development — in-house mold design capability
   - Quality Assurance — full inspection + third-party certification

3. **Process Flow** — 5-step collaboration process
   - Inquiry → Sample → Mold/Tooling → Trial Run → Mass Production
   - Each step with approximate timeline
   - Visual: numbered circles with connecting lines (similar to homepage chain-section pattern)

4. **Supported Standards** — Reuse market standard labels
   - UL/ASTM, AS/NZS, NOM, IEC + "custom standards supported"

5. **CTA** — "Start Your OEM Project" → /contact

**Data**: Pure i18n keys. Process steps as inline const array in component.

**i18n namespace**: `oem` (new, in `deferred.json`)

**Page conventions**: Must export `generateStaticParams()` and call `setRequestLocale(locale)` before any hooks/translations.

### 6.4 Infrastructure changes

| Location | Change |
|----------|--------|
| `src/config/paths/types.ts` | Add `"bendingMachines"` and `"oem"` to `PageType` union |
| `src/config/paths/paths-config.ts` | Add: `bendingMachines: { en: "/capabilities/bending-machines", zh: "/capabilities/bending-machines" }` and `oem: { en: "/oem-custom-manufacturing", zh: "/oem-custom-manufacturing" }` |
| `src/app/sitemap.ts` `STATIC_PAGES` | Add `/capabilities/bending-machines` and `/oem-custom-manufacturing` |
| `src/app/sitemap.ts` `PAGE_CONFIG_MAP` | Add entries: priority 0.8, changeFrequency monthly |
| `src/app/sitemap.ts` `STATIC_PAGE_LASTMOD` | Add entries with current date |
| `src/app/[locale]/products/page.tsx` | Update bending machines card: `/contact` → `/capabilities/bending-machines` |
| Homepage i18n links | Update `home.products.item3.link` → `/capabilities/bending-machines` and `home.products.item4.link` → `/oem-custom-manufacturing` (en + zh) |
| `messages/en/deferred.json` | Add `capabilities` and `oem` namespaces (not critical — these are secondary landing pages) |
| `messages/zh/deferred.json` | Add `capabilities` and `oem` namespaces |
| `src/lib/i18n/route-parsing.ts` | No change needed (both routes are static, not dynamic) |

### 6.5 Components

Both pages use Server Components with no client-side interactivity needed.

Reusable patterns from existing codebase:
- CTA section pattern (from market page `CtaSection`)
- Card layout (from shadcn Card components)
- Monospace spec display (from `SpecTable` aesthetic)
- Process flow (from homepage `chain-section` numbered circles pattern)

No new shared components created — page-local extracted functions to stay under 120-line limit.

---

## 7. Execution Order

```
Phase 1: Market spec data (4 files + registrations + i18n)
  1a. product-standards.ts — add nom, iec, petg
  1b. product-catalog.ts — fill empty standardIds
  1c. australia-new-zealand.ts spec data
  1d. mexico.ts spec data
  1e. europe.ts spec data
  1f. pneumatic-tube-systems.ts spec data
  1g. Register all in SPECS_BY_MARKET
  1h. i18n keys for new highlights (en + zh)
  1i. Tests for new spec files

Phase 2a: Bending Machines page
  2a-1. equipment-specs.ts + types
  2a-2. i18n namespace: capabilities (en + zh, in deferred.json)
  2a-3. Page component + route (with generateStaticParams + setRequestLocale)
  2a-4. Sitemap / paths-config / types updates (PageType: "bendingMachines")
  2a-5. Update products overview bending machines card link
  2a-6. Update homepage i18n link: home.products.item3.link → /capabilities/bending-machines
  2a-7. Tests

Phase 2b: OEM Service page
  2b-1. i18n namespace: oem (en + zh, in deferred.json)
  2b-2. Page component + route (with generateStaticParams + setRequestLocale)
  2b-3. Sitemap / paths-config / types updates (PageType: "oem")
  2b-4. Update homepage i18n link: home.products.item4.link → /oem-custom-manufacturing
  2b-5. Tests
```

## 8. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Draft spec data inaccurate | Buyer confusion | Mark as "typical values"; owner verifies before launch |
| New routes break existing tests | CI failure | Run full test suite after each phase |
| i18n key explosion | Maintenance burden | Organize by namespace; reuse shared keys where semantically identical |
| Bending machines page too thin without real photos | Unprofessional | Clean SVG placeholders + strong spec data + engineering aesthetic |

## 9. Design Principles Applied

1. **Substance over decoration** — Spec tables and capability data are the heroes
2. **Precision communicates quality** — Monospace specs, clean grids, engineering data sheet feel
3. **Engineering as identity** — Machine specs presented like engineering documentation
4. **Restraint signals confidence** — Single CTA per page, no popups, no floating buttons
5. **Function drives form** — Every section serves inquiry conversion or capability understanding
