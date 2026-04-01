# Multilingual Content Architecture -- Tianze Website

> Ring 2, Task 9 | Status: Confirmed by owner (2026-03-30)
> Inputs: Task 7 (information architecture), Task 8 (content strategy), Task 3 (brand positioning), routing config

## Chinese Content Purpose: Domestic Buyers (Confirmed 2026-03-30)

Owner confirmed: Chinese content serves **domestic Chinese buyers** (Purpose B).

**Implications**:
- Chinese version is NOT a mirror of English -- it may need different value propositions, domestic pricing context, GB standard emphasis
- Baidu SEO becomes relevant for the Chinese version
- The two language versions will diverge in content focus:
  - English: export buyers, international standards (AS/NZS, ASTM, UL), factory-direct pricing
  - Chinese: domestic buyers, national standards (GB), domestic competitive positioning
- This divergence is a **Phase 2+ concern** -- current Phase 1 focuses on the English site for export markets. Chinese content strategy to be developed separately when domestic market work begins.

---

## 1. Content Layering Strategy

### Principle

Not all content should be translated identically. Content falls into three layers based on how language-specific it is.

### Layer 1: Fully Shared (translate identically)

This is the core content that both language versions need with equivalent meaning and completeness.

| Content category | Examples | Rationale |
|-----------------|---------|-----------|
| Company positioning & story | "We make the machines that make the pipes", factory history | Brand identity is language-independent |
| Product specifications | Dimensions, tolerances, material grades, size tables | Technical data is universal |
| Certifications & standards | ISO 9001, compliance status (AS/NZS, ASTM, UL, IEC, NOM) | Buyers verify the same certs regardless of language |
| Factory capability data | Production capacity, equipment list, employee count | Trust signals apply to all buyers |
| Contact information | Email, WhatsApp, address, business hours | Functional content |
| Legal pages | Privacy policy, terms of service | Legal compliance |
| Trade information | MOQ, lead time, packaging, port of loading | Shared commercial terms |
| CTA copy | "Get a Quote", "Request Samples" | Conversion-critical |

### Layer 2: Market-Specific (English-only unless demand emerges)

This content is inherently tied to a specific market's regulatory or commercial context. Translation only needed if Chinese-speaking buyers in those markets are a significant segment.

| Content category | Language treatment | Rationale |
|-----------------|-------------------|-----------|
| Australian standard details (AS/NZS 2053) | English primary; translate if AU Chinese buyer segment confirmed | Australia is #1 target market, most buyers operate in English |
| North American standard details (UL 651, ASTM) | English primary; translate if needed | NA market operates in English |
| European standard details (IEC 61386) | English primary | European buyers generally operate in English |
| Mexican standard details (NOM-001-SEDE) | English primary; Spanish would be a future consideration, not Chinese | Mexico market speaks Spanish, not Chinese |
| SEO blog articles targeting specific market keywords | English only for now | Blog is an SEO play; each article targets a specific language's search intent |

**Decision rule**: If analytics later shows significant `/zh/` traffic on market-specific pages, translate those pages. Do not pre-translate speculatively.

### Layer 3: Language-Exclusive Content

Content that only makes sense in one language.

| Content | Language | Rationale |
|---------|----------|-----------|
| GB/T standard references (if added later) | Chinese only | Only relevant to domestic market; only needed if Purpose B is activated |
| Domestic certification details (CCC, etc.) | Chinese only | Same as above |
| English SEO blog content | English only | Written for English keyword clusters (Task 10) |
| Chinese SEO blog content (if ever created) | Chinese only | Would target different keyword intent on Baidu |

---

## 2. Translation Scope per Page

Based on the proposed IA (Task 7), here is the translation scope for each page.

### Legend

- **Full**: Both languages get complete, equivalent content
- **Partial**: Core content translated; market-specific detail sections remain English-only
- **En-only**: Page exists only in English (no `/zh/` route)

### Page-by-Page Scope

| Page | URL | Translation scope | Notes |
|------|-----|-------------------|-------|
| **Homepage** | `/` | Full | Both versions must convey the full value proposition |
| **Products overview** | `/products/` | Full | Hub page; three business lines need Chinese labels and descriptions |
| **Pipes overview** | `/products/pipes/` | Full | Category navigation page |
| **PVC by market: Australia** | `/products/pipes/australia-new-zealand/` | Partial | Product specs tables: translate. Standard-specific regulatory text: English primary, translate headers/labels |
| **PVC by market: North America** | `/products/pipes/north-america/` | Partial | Same as Australia |
| **PVC by market: Mexico** | `/products/pipes/mexico/` | Partial | Same pattern |
| **PVC by market: Europe** | `/products/pipes/europe/` | Partial | Same pattern |
| **PETG Pneumatic Tubes** | `/products/pipes/pneumatic-tubes/` | Full | PETG buyers include Chinese-speaking hospital integrators |
| **Equipment overview** | `/products/equipment/` | Full | Equipment buyers may be Chinese-speaking manufacturers |
| **Bending Machines** | `/products/equipment/bending-machines/` | Full | Same rationale; domestic manufacturers are potential buyers |
| **Custom Manufacturing** | `/products/custom-manufacturing/` | Full | OEM buyers include Chinese-speaking companies |
| **About** | `/about/` | Full | Trust page; essential in both languages |
| **Contact** | `/contact/` | Full | Conversion page; both languages must work |
| **Blog listing** | `/blog/` | Full (listing UI) | The listing page itself is translated; individual posts may be single-language |
| **Blog posts** | `/blog/[slug]/` | Per-post decision | Technical posts: English. Company news: both. Decision per article at creation time |
| **FAQ** | `/faq/` | Full | Objection-handling content should be in both languages |
| **Privacy** | `/privacy/` | Full | Legal requirement |
| **Terms** | `/terms/` | Full | Legal requirement |

### Current Implementation Status

The site already has `messages/en/` and `messages/zh/` with critical and deferred JSON files. Both contain full translations for all current UI strings including the product catalog, spec tables, trade info, and all homepage sections. The translation infrastructure is functional.

What is missing is not the translation mechanism but a strategic decision about which content to invest translation effort into as new pages are built.

---

## 3. Translation Glossary

### Usage

This glossary is the canonical reference for translating Tianze product and manufacturing terminology. When writing Chinese content, use these terms consistently. When reviewing translations, verify against this glossary.

Organized by domain. English term listed first, then the established Chinese equivalent.

### 3.1 Company & Brand

| English | Chinese | Notes |
|---------|---------|-------|
| Tianze Pipe Industry | 天泽管业 | Official company name |
| Lianyungang | 连云港 | City name |
| Jiangsu | 江苏 | Province name |
| "We make the machines that make the pipes" | 造设备的人，做管件 | Core positioning statement (confirmed in zh translations) |
| Full chain control | 全链路可控 | Key differentiator phrase |
| Factory direct | 工厂直供 | Pricing positioning |
| Equipment manufacturer | 设备制造商 | Company identity |
| Vertical integration | 垂直整合 | Manufacturing capability descriptor |

### 3.2 PVC Conduit Terms

| English | Chinese | Notes |
|---------|---------|-------|
| PVC conduit | PVC电工套管 | General product category |
| PVC conduit fittings | PVC电工套管配件 | Product category (fittings subset) |
| Conduit bend | 电工弯管 | Bent pipe fitting |
| Conduit sweep | 电工弯管 | Same as bend in Chinese; English distinguishes sweep (long radius) from elbow (short radius) |
| Conduit elbow | 弯头 | Short-radius bend |
| Coupling | 接头 | Pipe connector |
| Bellmouth | 喇叭口接头 | Flared termination fitting (AU market term) |
| Conduit pipe | 电工直管 | Straight conduit pipe |
| Bell end | 喇叭口 / 承口 | Socket end of a pipe |
| Plain end | 直口 | Non-socketed pipe end |
| Double socket pipe | 双承口连接管 | Pipe with sockets on both ends |
| Expansion coupling | 伸缩接头 | Allows thermal expansion |
| End type | 端口类型 | Spec table column |
| Wall thickness | 壁厚 | Spec table column |
| Bend radius | 弯曲半径 | Spec table column |
| Outer diameter (OD) | 外径 | Spec table column |
| Rigid PVC | 硬质PVC | Material descriptor |
| UPVC (Unplasticized PVC) | UPVC / 硬聚氯乙烯 | Material grade |
| Virgin PVC | 全新PVC / 全新料PVC | 100% new material, not recycled |
| Self-extinguishing | 自熄 | Fire rating property |
| Flame retardant | 阻燃 | Fire rating property |
| UV stabilized | 紫外线稳定 | Outdoor suitability |
| Wire pulling friction | 拉线摩擦 | Interior surface quality context |

### 3.3 Standards & Certifications

| English | Chinese | Notes |
|---------|---------|-------|
| Schedule 40 | Schedule 40 | Keep English; universally recognized in trade |
| Schedule 80 | Schedule 80 | Keep English |
| Medium duty | 中型 | AS/NZS rating |
| Heavy duty | 重型 | AS/NZS rating |
| Light duty | 轻型 | IEC/NOM rating |
| AS/NZS 2053 | AS/NZS 2053 | Keep alphanumeric code |
| UL 651 | UL 651 | Keep alphanumeric code |
| ASTM D1785 | ASTM D1785 | Keep alphanumeric code |
| IEC 61386 | IEC 61386 | Keep alphanumeric code |
| NOM-001-SEDE | NOM-001-SEDE | Keep alphanumeric code |
| ISO 9001:2015 | ISO 9001:2015 | Keep alphanumeric code |
| GB/T (Guobiao) | GB/T（国标） | National standard of China |
| Certified | 已认证 | Certification status |
| Compliant | 符合标准 | Standards compliance status |
| Applying | 申请中 | Certification in progress |
| Standards compliance | 标准合规 | General term |
| Fire rating | 阻燃等级 | Safety classification |

### 3.4 PETG Pneumatic Tube Terms

| English | Chinese | Notes |
|---------|---------|-------|
| PETG | PETG | Keep acronym; universally used |
| Pneumatic tube system | 气动物流管系统 | Full system name |
| Pneumatic tube | 气动物流管 / 气动管 | Individual tube |
| Hospital logistics | 医院物流 | Primary application |
| Automated material transport | 自动物料运输 | Application description |
| Carrier | 运输车 / 载体 | The capsule that travels through the tube |
| Transparency | 透明度 | Key PETG property |
| Crystal clear | 透明 | Marketing descriptor |
| Burst pressure | 爆破压力 | Test specification |
| Max working pressure | 最大工作压力 | Operating specification |
| Seal quality | 密封性 | Joint quality descriptor |
| Leak-proof | 防漏 | Joint quality descriptor |
| Silent operation | 静音操作 | Noise property |
| Impact resistance | 抗冲击性 | Durability property |
| Food-grade | 食品级 | Material certification option |
| Push-fit | 快速接头 | Connection type |
| Flange | 法兰 | Connection type |
| Y-Diverter | Y型分支 | Fitting type |
| Access panel | 接线盒 | Maintenance fitting |

### 3.5 Bending Machine Terms

| English | Chinese | Notes |
|---------|---------|-------|
| Bending machine | 弯管机 | Core product |
| Pipe bending machine | 弯管机 | Same term in Chinese |
| PVC bending machine | PVC弯管机 | Material-specific |
| Expanding machine | 扩管机 | Related equipment |
| Full-auto (fully automatic) | 全自动 | Machine type |
| Semi-auto (semi-automatic) | 半自动 | Machine type |
| Hot bending | 热弯 | Tianze's process |
| Cold bending | 冷弯 | Alternative process |
| Injection molding | 注塑成型 | Competing process for fittings |
| Temperature control | 温度控制 | Machine capability |
| Production speed | 产速 / 生产速度 | e.g., 150-200 pcs/hour |
| Pipe diameter range | 管径范围 | Machine spec |
| DN (nominal diameter) | DN（公称直径） | Size designation |
| Mold | 模具 | Tooling |
| Mold fabrication / development | 模具开发 / 模具制造 | Service capability |
| Calibration | 校准 | Machine setup |
| Gen 1 / Gen 2 / Gen 3 | 第一代 / 第二代 / 第三代 | Machine evolution narrative |
| Patented technology | 专利技术 | IP descriptor |

### 3.6 OEM / Manufacturing Terms

| English | Chinese | Notes |
|---------|---------|-------|
| OEM (Original Equipment Manufacturer) | OEM / 代工生产 | Keep OEM in both; explain in Chinese if needed |
| ODM (Original Design Manufacturer) | ODM / 原始设计制造 | Less common for Tianze |
| Custom manufacturing | 定制生产 | Service name |
| Custom mold | 定制模具 | Capability |
| Private labeling | 贴牌 / 私标 | OEM service |
| MOQ (Minimum Order Quantity) | MOQ / 最小起订量 | Keep MOQ acronym; gloss in Chinese |
| Lead time | 交货周期 / 交期 | Production timeline |
| Prototype / Sample | 打样 / 样品 | Pre-production |
| Mass production | 量产 | Full-scale production |
| Batch traceability | 批次可追溯 | QC feature |
| Quality control (QC) | 质量控制 / 质检 | Process |
| Supply capacity | 供应能力 | Trade spec |
| On-time delivery rate | 准时交货率 | Performance metric |
| Port of loading | 装运港 | Shipping term |
| Export standard packaging | 出口标准包装 | Packaging spec |

### 3.7 Trade & Commercial Terms

| English | Chinese | Notes |
|---------|---------|-------|
| Inquiry | 询盘 | Sales term |
| Quotation / Quote | 报价 | Sales term |
| Factory visit | 工厂参观 / 验厂 | Trust mechanism |
| Free sample | 免费样品 | Conversion offer |
| Technical consultation | 技术咨询 | Service |
| Cost-effective | 性价比高 | Preferred over "cheap" (便宜) |
| Distributor | 经销商 / 批发商 | Buyer type |
| Importer | 进口商 | Buyer type |
| Contractor | 承包商 | Buyer type |
| System integrator | 系统集成商 | Buyer type (PETG context) |

### Words to Avoid

| Do NOT use | Use instead | Rationale |
|-----------|-------------|-----------|
| Trader / 贸易商 | Manufacturer / 制造商 | Tianze positions as manufacturer |
| Middleman / 中间商 | Factory direct / 工厂直供 | Same rationale |
| Cheap / 便宜 | Cost-effective / 性价比高 | Brand positioning is quality, not cheapest price |

---

## 4. Market-Specific Content Plan

### The Challenge

Tianze sells PVC conduit fittings into multiple markets, each with different compliance standards. The product *shape* (a 90-degree bend) may be similar across markets, but the standard, size system, wall thickness grades, and terminology differ.

### Strategy: Standard-Segmented Product Pages

This is already reflected in the IA (Task 7): `/products/pipes/[market]/`. Each market page is a standalone content unit.

| Market | Standard | Size system | Terminology | Priority |
|--------|----------|-------------|-------------|----------|
| Australia / NZ | AS/NZS 2053 | mm (metric) | Medium/Heavy duty, bellmouth, conduit bends | P0 (top target market) |
| North America | UL 651 / ASTM D1785 | inch (imperial) | Schedule 40/80, sweeps, elbows | P0 |
| Mexico | NOM-001-SEDE | mm (metric) | Tipo Ligero/Pesado | P1 |
| Europe | IEC 61386 | mm (metric) | Light/Medium/Heavy | P1 |

### What Differs Between Market Pages

| Content element | Shared or market-specific |
|----------------|--------------------------|
| Product photos | Shared (same physical product, different label) |
| Material properties (PVC type, UV, fire rating) | Shared |
| Size/dimension tables | Market-specific (different sizes, different units) |
| Wall thickness grades | Market-specific (Schedule 40/80 vs Medium/Heavy) |
| Standard compliance claims | Market-specific |
| Certification status | Market-specific (e.g., AS/NZS cert in progress, UL cert in progress) |
| Trade terms (MOQ, lead time) | Shared |
| CTA (inquiry form) | Shared component, market label injected |

### Content Reuse Architecture

```
Shared content layer (all markets)
├── Material: 100% Virgin PVC (UPVC)
├── UV resistance, fire rating, temperature range
├── Factory capability (supply capacity, on-time delivery)
├── Trade terms (MOQ, lead time, packaging, port)
└── CTA block (parameterized by market label)

Market-specific content layer
├── Standard name and compliance statement
├── Product spec tables (sizes, wall thickness, angles)
├── Certification status for that market's standard
└── Market-specific regulatory notes (if any)
```

This maps directly to the existing implementation: shared technical and trade data live at the market level in the i18n JSON, while family-specific spec tables are nested under each market.

### PETG: Not Market-Segmented

PETG pneumatic tubes are sold to hospital system integrators globally. There is no market-by-standard segmentation. PETG gets a single product page (`/products/pipes/pneumatic-tubes/`) with full bilingual content.

### Equipment: Not Market-Segmented

Bending machines are sold globally to pipe manufacturers. No market segmentation needed. Single page with full bilingual content.

### Future: Adding a New Market

When a new target market is added (e.g., Southeast Asia / BS standard, Middle East, South America):

1. Add market definition to `product-catalog.ts`
2. Add standard to `product-standards.ts`
3. Add product specs to `product-specs/[market].ts`
4. Add i18n strings to both `messages/en/` and `messages/zh/` (following partial translation scope -- spec tables yes, regulatory detail English-first)
5. The page route is auto-generated from the catalog config

No structural changes needed. The architecture scales by adding data, not code.

---

## 5. Translation Workflow (Future)

This section is intentionally brief. Translation workflow does not need to be solved until content volume increases.

### Current State

- UI strings: maintained in `messages/en/` and `messages/zh/` JSON files
- MDX content (blog, pages): separate files per locale in `content/{type}/{locale}/`
- Product data: TypeScript constants (language-neutral) + i18n JSON labels

### Principles for Future Scaling

1. **English is the source of truth.** Write in English first, translate to Chinese. Never the reverse.
2. **Technical terms use the glossary above.** Do not invent new translations for established terms.
3. **Product spec numbers are never translated** -- they are language-neutral data.
4. **Blog posts are per-language decisions.** A technical SEO article targeting "PVC conduit bend AS/NZS 2053" may never need a Chinese version. A company milestone article may get both.
5. **Translation review by owner.** Owner (native Chinese speaker, domain expert) should review Chinese content for accuracy, not just grammatical correctness.

---

## 6. Implementation Notes for Developers

### hreflang

Already configured via `alternateLinks: true` in routing config. Every page that exists in both locales automatically gets `<link rel="alternate" hreflang="en" />` and `<link rel="alternate" hreflang="zh" />`.

For en-only pages (if any are created), do not generate a `/zh/` route. The hreflang should reflect only available locales.

### Locale prefix

Current config: `localePrefix: "always"`. This means `/en/products/` and `/zh/products/` -- no unprefixed URLs. This is correct for an international site where neither language should be treated as "default" in URLs.

### Fallback behavior

`next-intl` is configured with locale detection and a cookie for persistence. If a Chinese-speaking buyer visits without a locale prefix, they should be detected and redirected to `/zh/`. This is already handled by the middleware.

### Translation key organization

Current structure:
- `messages/en/critical.json` / `messages/zh/critical.json` -- Above-the-fold and navigation strings
- `messages/en/deferred.json` / `messages/zh/deferred.json` -- Below-the-fold content

This split supports performance (critical strings load first). Maintain this split as new content is added.

---

## Summary

| Decision | Status |
|----------|--------|
| Chinese content purpose | **OPEN -- needs owner decision** |
| Content layering (3 layers) | Defined |
| Translation scope per page | Defined (Full / Partial / En-only) |
| Translation glossary | Comprehensive, 7 domains, 100+ terms |
| Market-specific content architecture | Defined, leverages existing catalog structure |
| Translation workflow | Deferred until content volume increases |

**Next step**: Owner to confirm the purpose of Chinese content (Section 0). This decision affects whether the Chinese version is a full mirror, a minimal signal, or a divergent domestic strategy.
