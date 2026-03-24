# Product Data i18n Design

> Date: 2026-03-24
> Status: Approved
> Scope: product-catalog, product-specs (5 markets), equipment-specs, bending-machines page

## Goal

Convert all user-facing hardcoded English strings in product data files to bilingual (en/zh) translations via next-intl, so Chinese site visitors see Chinese product descriptions, spec labels, and equipment info.

## Approach: Slug-Convention Key Derivation (Approach B)

Data files (`product-catalog.ts`, `product-specs/*.ts`, `equipment-specs.ts`) keep their current structure unchanged. English values remain as dev-readable references and fallback. Components derive translation keys from slugs at render time.

## Translation Key Convention

All keys live under the existing `catalog` namespace in `messages/{locale}/critical.json`.

```
catalog.
  markets.{marketSlug}.
    label                              -- "UL / ASTM Series" / "UL / ASTM 系列"
    description                        -- Market description text

  families.{marketSlug}.{familySlug}.
    label                              -- "Conduit Sweeps & Elbows" / "导管弯头"
    description                        -- Family description text

  specs.{marketSlug}.
    technical.{key}                    -- Technical property values
    trade.{key}                        -- Trade info values (moq, leadTime, etc.)
    families.{familySlug}.
      highlights.{index}              -- "UL 651 Certified" / "UL 651 认证"
      groups.{index}.label            -- "Schedule 40" / "轻型" / "重型"

  specTable.                           -- (already exists) Column header translations

  equipment.{equipmentSlug}.
    name                               -- "Full-Automatic PVC Pipe Bending Machine" / "全自动 PVC 弯管机"
    params.{key}                       -- Parameter display names ("pipeDiameter" -> "管径")
    highlights.{index}                 -- "CNC Control System" / "CNC 控制系统"
```

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
| technical property keys | "material" | "材质" |
| technical property values | "Smooth interior, reduces wire pulling friction" | "内壁光滑，降低穿线摩擦" |
| trade values | "15-20 days" | "15-20 天" |
| equipment name | "Full-Automatic PVC Pipe Bending Machine" | "全自动 PVC 弯管机" |
| equipment param keys | "pipeDiameter" | "管径" |
| equipment highlights | "CNC Control System" | "CNC 控制系统" |

### NOT translated (rendered directly from data)

| Field | Reason |
|-------|--------|
| market.standardLabel | International standard codes ("UL 651 / ASTM D1785") |
| certifications array | International certification names |
| spec table row values | Numeric data ("16mm", "90°", "1.2mm") |
| equipment param values | Numeric specs ("DN25-DN160mm", "380V/50Hz") |
| slugs, standardIds, sizeSystem | Structural/routing data |

### Special case: groupLabel

- Descriptive labels translate: "Heavy Duty" -> "重型", "Tipo Ligero" -> "轻型"
- Universal grade codes stay: "Schedule 40" stays "Schedule 40" in both locales
- Numeric labels stay: "110mm OD" stays "110mm OD"

## Component Changes

### Files to modify

| File | Change |
|------|--------|
| `src/app/[locale]/products/[market]/page.tsx` | Market label/description via `t()`, technical/trade values via `t()` |
| `src/app/[locale]/products/page.tsx` | Market card labels/descriptions via `t()` |
| `src/app/[locale]/capabilities/bending-machines/page.tsx` | Remove `formatParamKey()`, use `t()` for equipment name/params/highlights |
| `src/components/products/family-section.tsx` | Highlights and groupLabel via `t()` |
| `src/components/products/product-specs.tsx` | Technical property keys/values via `t()` |
| `src/components/products/market-series-card.tsx` | Market card label/description via `t()` |

### Pattern: Component receives `t` function + slug, derives keys

```typescript
// Market label
t(`markets.${market.slug}.label`)

// Family highlight
t(`specs.${marketSlug}.families.${familySlug}.highlights.${index}`)

// Equipment param name
t(`equipment.${machine.slug}.params.${key}`)

// Group label
t(`specs.${marketSlug}.families.${familySlug}.groups.${groupIndex}.label`)
```

### Files NOT modified

- `src/constants/product-catalog.ts` — structure unchanged
- `src/constants/product-specs/*.ts` — structure unchanged
- `src/constants/product-specs/types.ts` — interfaces unchanged
- `src/constants/equipment-specs.ts` — structure unchanged

## Translation File Changes

### Location

`messages/{en,zh}/critical.json` — product pages are SEO-critical, must be in above-the-fold bundle.

### Estimated new keys

~185 new keys per locale (370 total), extending the existing ~60 `catalog.*` keys.

| Block | Keys per locale |
|-------|----------------|
| `catalog.markets.*` | ~10 |
| `catalog.families.*` | ~30 |
| `catalog.specs.*.technical.*` | ~30 |
| `catalog.specs.*.trade.*` | ~25 |
| `catalog.specs.*.families.*.highlights.*` | ~45 |
| `catalog.specs.*.families.*.groups.*.label` | ~25 |
| `catalog.equipment.*` | ~20 |

### Existing keys to keep

- `catalog.specTable.*` — column header translations (Size, Angle, etc.), already works
- `catalog.market.technical.title` etc. — section title translations, already works
- `catalog.highlights.*` — **remove** (North America-only hardcoded highlights, replaced by per-family slug-based keys)

## Testing Strategy

- Existing product page tests update to verify translated output
- Add test: each slug-derived key exists in both en and zh translation files
- Add test: key count matches data count (e.g., 3 highlights in data = 3 highlight keys)
- Run `pnpm i18n:full` to validate translation completeness

## Risks

- **Large translation key count**: ~185 new keys is significant but manageable within critical.json
- **Key drift**: If product data adds a new highlight or market, translation must be added too. Mitigated by the key-count test.
- **Fallback display**: If a zh key is missing, next-intl falls back to the key path string (ugly). Mitigated by i18n validation tooling.

## Out of Scope

- PDF download links (Phase 3+)
- Certification logo images (Phase 2 batch 2)
- WhatsApp CTA (Phase 2 batch 2)
- New pages (certifications, downloads, applications)
- `read-and-hash-body.ts` type safety (tech debt)
- OEM page test pattern (tech debt)
