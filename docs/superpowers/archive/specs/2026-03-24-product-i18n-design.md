# Product Data i18n Design

> Date: 2026-03-24
> Status: Approved
> Scope: product-catalog, product-specs (5 markets), bending-machines page equipment data

## Goal

Convert all user-facing hardcoded English strings in product data files to bilingual (en/zh) translations via next-intl, so Chinese site visitors see Chinese product descriptions, spec labels, and equipment info.

## Approach: Slug-Convention Key Derivation (Approach B)

Data files (`product-catalog.ts`, `product-specs/*.ts`, `equipment-specs.ts`) keep their current structure unchanged. English values remain as dev-readable references and fallback. Components derive translation keys from slugs at render time.

## Namespace Ownership

| Namespace | Location | Owner |
|-----------|----------|-------|
| `catalog.*` | `critical.json` | Product catalog + market pages (this work) |
| `capabilities.*` | `deferred.json` | Bending machines page (already exists, page-level text) |

Equipment data translations go into `capabilities.*` (NOT `catalog.*`) because:
- The bending machines page already uses `capabilities` namespace for all its text
- `equipment-specs.ts` is consumed exclusively by the bending machines page
- Placing equipment keys in `catalog` would create a split truth source for one page

## Translation Key Convention

### Product catalog keys (`catalog` in `critical.json`)

```
catalog.
  markets.{marketSlug}.
    label                              -- "UL / ASTM Series" / "UL / ASTM 系列"
    description                        -- Market description text

  families.{marketSlug}.{familySlug}.
    label                              -- "Conduit Sweeps & Elbows" / "导管弯头"
    description                        -- Family description text

  technicalLabels.{key}                -- Shared technical property labels
                                       -- "material" -> "Material" / "材质"
                                       -- "uvResistance" -> "UV Resistance" / "抗紫外线"

  specs.{marketSlug}.
    technical.{key}                    -- Technical property VALUES (market-specific)
    trade.{key}                        -- Trade info values (moq, leadTime, etc.)
    families.{familySlug}.
      highlights.{index}              -- "UL 651 Certified" / "UL 651 认证"
      groups.{index}.label            -- "Schedule 40" / "轻型" / "重型"
      groups.{index}.rows.{rowIdx}.{colIdx}
                                       -- Translatable row cell values only
                                       -- e.g. "Bell End" -> "承口", "Plain End" -> "平口"
                                       -- Numeric cells ("16mm", "90°") are NOT included

  specTable.{key}                      -- Column header translations (Size, Angle, etc.)
                                       -- NOT wired to components yet; this work adds wiring
                                       -- Missing columns to add: bendRadius, connection, duty,
                                       --   material, outerDiameter

  rowValues.{key}                      -- Shared translations for recurring row cell text
                                       -- "bellEnd" -> "Bell End" / "承口"
                                       -- "plainEnd" -> "Plain End" / "平口"
                                       -- "standardCoupling" -> "Standard Coupling" / "标准接头"
                                       -- etc.
```

### Equipment keys (`capabilities` in `deferred.json`)

```
capabilities.
  equipment.{equipmentSlug}.
    name                               -- "Full-Automatic PVC Pipe Bending Machine" / "全自动 PVC 弯管机"
    params.{key}                       -- Parameter display LABELS ("pipeDiameter" -> "管径")
    highlights.{index}                 -- "CNC Control System" / "CNC 控制系统"
```

Note: equipment param VALUES (e.g., "DN25-DN160mm") are numeric specs and rendered directly from data, not translated.

## Translation Boundary

### Translated (different per locale)

| Field | Example en | Example zh |
|-------|-----------|-----------|
| market.label | "UL / ASTM Series" | "UL / ASTM 系列" |
| market.description | "PVC conduit fittings engineered to..." | "符合 UL 651 和 ASTM D1785 标准的..." |
| family.label | "Conduit Sweeps & Elbows" | "导管弯头" |
| family.description | "PVC conduit sweeps and elbows in..." | "标准角度 PVC 导管弯头..." |
| highlights | "Double-Bell Design" | "双承口设计" |
| groupLabel | "Heavy Duty" | "重型" |
| groupLabel (universal) | "Schedule 40" | "Schedule 40" |
| technical property labels | "material" | "材质" |
| technical property values | "Smooth interior, reduces wire pulling friction" | "内壁光滑，降低穿线摩擦" |
| trade values | "15-20 days" | "15-20 天" |
| spec table column headers | "Wall Thickness" | "壁厚" |
| **spec table row text values** | "Bell End" / "Plain End" / "Standard Coupling" | "承口" / "平口" / "标准接头" |
| equipment name | "Full-Automatic PVC Pipe Bending Machine" | "全自动 PVC 弯管机" |
| equipment param labels | "pipeDiameter" | "管径" |
| equipment highlights | "CNC Control System" | "CNC 控制系统" |

### NOT translated (rendered directly from data)

| Field | Reason |
|-------|--------|
| market.standardLabel | International standard codes ("UL 651 / ASTM D1785") |
| certifications array | International certification names |
| spec table row NUMERIC values | Pure numbers/units ("16mm", "90°", "1.2mm", "3m", "10 ft") |
| equipment param values | Numeric specs ("DN25-DN160mm", "380V/50Hz") |
| slugs, standardIds, sizeSystem | Structural/routing data |

### Spec table row values: translate vs. not

Row cells contain a mix of numeric and text values. The rule:

| Cell content | Translate? | Example |
|-------------|-----------|---------|
| Dimensions/angles | No | "16mm", "90°", "1.2mm", "3m", "10 ft", "4D", "R650" |
| End types | Yes | "Bell End" -> "承口", "Plain End" -> "平口" |
| Product types | Yes | "Standard Coupling" -> "标准接头", "Expansion Coupling" -> "膨胀接头" |
| Duty labels in rows | Yes | "Medium Duty" -> "中型" |
| Connection types | Yes | "Push-fit" -> "推入式", "Flange" -> "法兰" |
| Component names | Yes | "Connector" -> "连接器", "Y-Diverter" -> "Y型分流器", "Access Panel" -> "检修口" |
| Material in rows | Yes | "PETG" -> "PETG" (stays same, but keyed for consistency) |
| Custom/variable | Yes | "Custom" -> "定制" |

Implementation strategy for row values: use a shared `catalog.rowValues.*` lookup. At render time, attempt to match cell text against known translatable values; if no match found, render the raw cell (it's numeric).

```typescript
// Pseudocode for row cell rendering
function renderCell(cell: string, t: TranslationFunction): string {
  const key = cellToKey(cell); // "Bell End" -> "bellEnd"
  return t.has(`rowValues.${key}`) ? t(`rowValues.${key}`) : cell;
}
```

### Special case: groupLabel

- Descriptive labels translate: "Heavy Duty" -> "重型", "Tipo Ligero" -> "轻型"
- Universal grade codes stay: "Schedule 40" stays "Schedule 40" in both locales
- Numeric labels stay: "110mm OD" stays "110mm OD"

## Component Changes

### Context propagation

Several components currently lack the context (marketSlug, familySlug) needed to derive translation keys. The changes below specify how context flows in:

| Component | Current props | Added context | How |
|-----------|--------------|---------------|-----|
| `FamilySection` | `family`, `specs` | `marketSlug`, `t` | Parent (`MarketPage`) passes `marketSlug` and pre-scoped `t` as new props |
| `SpecTable` | `specGroups` | `marketSlug`, `familySlug`, `t` | Parent (`FamilySection`) passes through from its own new props |
| `ProductSpecs` | `specs: Record<string, string>`, `title` | `marketSlug`, `t` | Parent (`TrustSignalsSection` in market page) passes `marketSlug` and `t` |

Alternative considered: passing only `t` and having components call `t()` with full paths. Rejected because it couples component internals to the full key hierarchy. Better: parent constructs the key prefix, component appends the local part.

### Files to modify

| File | Change |
|------|--------|
| `src/app/[locale]/products/[market]/page.tsx` | Market label/description via `t()` in both page body AND `generateMetadata`; pass `marketSlug` + `t` to child components; StickyFamilyNav label pass-through |
| `src/app/[locale]/products/page.tsx` | Market card labels/descriptions via `t()` |
| `src/app/[locale]/capabilities/bending-machines/page.tsx` | Remove `formatParamKey()`, use `t()` under `capabilities.equipment.*` for name/params/highlights |
| `src/components/products/family-section.tsx` | Accept `marketSlug` + `t` props; highlights and groupLabel via `t()`; pass context to SpecTable |
| `src/components/products/product-specs.tsx` | Accept `marketSlug` + `t` props; technical property labels via `t(technicalLabels.{key})`, values via `t(specs.{market}.technical.{key})` |
| `src/components/products/spec-table.tsx` | Accept `marketSlug` + `familySlug` + `t` props; column headers via `t(specTable.{key})`, row cells via `rowValues.*` lookup |
| `src/components/products/market-series-card.tsx` | Market card label/description via `t()` |
| `src/components/products/catalog-breadcrumb.tsx` | Market label in breadcrumb text AND JSON-LD structured data via `t()` |

### Pattern examples

```typescript
// Market label (in page or card)
t(`markets.${market.slug}.label`)

// Family highlight (in FamilySection, receiving marketSlug)
t(`specs.${marketSlug}.families.${family.slug}.highlights.${index}`)

// Technical property label (shared across markets)
t(`technicalLabels.${key}`)

// Technical property value (market-specific, in ProductSpecs)
t(`specs.${marketSlug}.technical.${key}`)

// Spec table column header (in SpecTable)
t(`specTable.${columnToKey(col)}`)

// Spec table row cell (in SpecTable, with fallback)
t.has(`rowValues.${cellToKey(cell)}`) ? t(`rowValues.${cellToKey(cell)}`) : cell

// Group label (in SpecTable, receiving marketSlug + familySlug)
t(`specs.${marketSlug}.families.${familySlug}.groups.${groupIndex}.label`)

// Equipment param label (in bending-machines page, under capabilities namespace)
tCap(`equipment.${machine.slug}.params.${key}`)
```

### Column header key mapping

Spec table columns in the data use display strings ("Wall Thickness"). Components will normalize these to camelCase keys for translation lookup:

```typescript
// "Wall Thickness" -> "wallThickness" -> t("specTable.wallThickness")
function columnToKey(col: string): string {
  return col.replace(/\s+(.)/g, (_, c) => c.toUpperCase())
            .replace(/^(.)/, (c) => c.toLowerCase());
}
```

Existing `specTable` keys: size, angle, wallThickness, endType, radius, type, length, schedule.
New keys to add: bendRadius, connection, duty, material, outerDiameter.

### Row cell key mapping

```typescript
// "Bell End" -> "bellEnd"
// "Standard Coupling" -> "standardCoupling"
// "Push-fit" -> "pushFit"
function cellToKey(cell: string): string {
  return cell.replace(/[-/]/g, ' ')
             .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
             .replace(/^(.)/, (c) => c.toLowerCase());
}
```

Estimated unique translatable row values across all 5 markets: ~25 distinct strings.

### Files NOT modified

- `src/constants/product-catalog.ts` — structure unchanged
- `src/constants/product-specs/*.ts` — structure unchanged
- `src/constants/product-specs/types.ts` — interfaces unchanged
- `src/constants/equipment-specs.ts` — structure unchanged

## Translation File Changes

### Location

| Keys | File | Reason |
|------|------|--------|
| `catalog.*` | `critical.json` | Product pages are SEO-critical, must be in above-the-fold bundle |
| `capabilities.equipment.*` | `deferred.json` | Bending machines page already uses `capabilities` in deferred |

### Estimated new keys

| Block | Location | Keys per locale |
|-------|----------|----------------|
| `catalog.markets.*` | critical | 10 |
| `catalog.families.*` | critical | 30 |
| `catalog.technicalLabels.*` | critical | 12 |
| `catalog.specs.*.technical.*` (values) | critical | 31 |
| `catalog.specs.*.trade.*` | critical | 25 |
| `catalog.specs.*.families.*.highlights.*` | critical | 45 |
| `catalog.specs.*.families.*.groups.*.label` | critical | 33 |
| `catalog.specTable.*` (new columns) | critical | 5 |
| `catalog.rowValues.*` | critical | ~25 |
| `capabilities.equipment.*` | deferred | 23 |
| **Total new** | | **~239** |

Post-migration `critical.json` total: ~920 keys (704 existing + ~216 new catalog keys).
Post-migration `deferred.json` total: existing + 23 new capabilities.equipment keys.

### Existing keys

- `catalog.specTable.*` — keep and extend with 5 missing column keys; wire to components
- `catalog.market.technical.title` etc. — section title translations, keep as-is
- `catalog.highlights.*` — **remove** (North America-only hardcoded highlights, replaced by per-family slug-based keys)

## Testing Strategy

- Existing product page tests update to verify translated output
- Add test: each slug-derived key exists in both en and zh translation files
- Add test: key count matches data count (e.g., 3 highlights in data = 3 highlight keys in translations)
- Add test: every `technicalLabels.*` key covers every unique technical property key across all markets
- Add test: every unique translatable row cell value has a corresponding `rowValues.*` key
- Run `pnpm i18n:full` to validate translation completeness
- Verify `generateMetadata` outputs locale-correct title/description for both en and zh

## Risks

- **Key count**: ~239 new keys is significant but manageable; critical.json grows from ~704 to ~920 keys (~40KB to ~49KB estimated)
- **Key drift**: If product data adds a new highlight, market, or row value text, translation must be added too. Mitigated by key-count parity tests and row-value coverage test.
- **Row value coverage**: New text row values (e.g., a new end type) could slip through without a translation. The `rowValues` fallback renders the English original, and the parity test catches it.
- **Nesting depth**: Deepest path is 8 levels. next-intl has no hard limit; mitigated by i18n validation tooling.
- **Fallback display**: If a zh key is missing, next-intl shows the key path string. Mitigated by `pnpm i18n:full` validation and parity tests.

## Out of Scope

- PDF download links (Phase 3+)
- Certification logo images (Phase 2 batch 2)
- WhatsApp CTA (Phase 2 batch 2)
- New pages (certifications, downloads, applications)
- `read-and-hash-body.ts` type safety (tech debt)
- OEM page test pattern (tech debt)
