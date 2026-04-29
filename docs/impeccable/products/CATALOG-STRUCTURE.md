# Product Catalog Structure

> Finalized: 2026-03-20
> Decision basis: 4-source cross-validated research + business logic review
> Historical snapshot only. For current execution, this file is superseded by:
> - `docs/strategy/current-strategy-summary.md`
> - `docs/strategy/ring4-implementation-handoff.md`
>
> Important: this file still reflects the older decision that bending machines lived under `/capabilities/` and OEM lived outside `/products/`. Do not use it as the current source of truth for routing or page ownership.

## Navigation Labels

```
Products
├── UL / ASTM Series
├── AS/NZS 2053 Series
├── NOM Series
├── IEC Series
└── PETG Pneumatic Tubes
```

## URL Structure

```
/products/
  /north-america/                    ← UL / ASTM Series
    /conduit-sweeps-elbows/
    /couplings/
    /conduit-pipes/
  /australia-new-zealand/            ← AS/NZS 2053 Series
    /conduit-bends/
    /bellmouths/
    /couplings/
    /conduit-pipes/
  /mexico/                           ← NOM Series
    /conduit-bends/
    /couplings/
    /conduit-pipes/
  /europe/                           ← IEC Series
    /conduit-bends/
    /couplings/
    /conduit-pipes/
  /pneumatic-tube-systems/           ← PETG Pneumatic Tubes
    /petg-tubes/
    /fittings/

/oem-custom-manufacturing/           ← Independent service page
/capabilities/bending-machines/      ← Manufacturing capability showcase
```

## Key Decisions

### 1. Standard-first classification
- Tianze's core customers are distributors/importers who procure by compliance standard
- Different standards = different physical products (OD, wall thickness, end types differ)
- No duplicate content risk — products under each standard are genuinely different

### 2. Navigation: standard name + "Series" suffix
- Labels: `UL / ASTM Series`, `AS/NZS 2053 Series`, etc.
- Standard name first (professional buyers recognize instantly)
- URL uses market-region slugs for stability and future-proofing

### 3. Market-specific terminology per section
| Market | Bend terminology | Size system | Unique products |
|--------|-----------------|-------------|-----------------|
| North America (UL/ASTM) | sweeps, elbows | inch | — |
| Australia/NZ (AS/NZS) | bends, bellmouths | mm | bellmouths, flared |
| Mexico (NOM) | bends | mm | — |
| Europe (IEC) | bends | mm | — |

### 4. Product families (L2 pages)
Each standard series contains product family pages:
- **Conduit Bends** (core product)
- **Couplings & Connectors** (double-bell, flared connectors)
- **Conduit Pipes** (straight pipes)

### 5. Variants as attributes, not pages
Angle, size, wall thickness, end type (plain/bell), color, schedule/duty → spec table + filters on family page. No sub-pages.

### 6. Separated from product catalog
- **Bending machines** → `/capabilities/bending-machines/` (trust signal, not sellable SKU)
- **OEM/Custom** → `/oem-custom-manufacturing/` (service page, not product category)
- **PETG pneumatic tubes** → independent business line under `/products/pneumatic-tube-systems/`

## Page Count Summary
- 4 standard series landing pages
- ~14 product family pages (3-4 per standard)
- 2 pneumatic system pages
- 1 OEM service page
- 1 capabilities page
- **Total: ~22 pages**

## Research Sources
- `docs/research/product-catalog-hierarchy-research.md` (em-digger, 11 enterprises)
- Codex research (inline, strongest decision influence)
- ChatGPT Deep Research (private source archive)
- Gemini research (inline)
- AI Studio research (inline)
