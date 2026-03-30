# Content Inventory & Gap Analysis — Tianze Website

> Ring 2, Task 12 | Status: Confirmed by owner (2026-03-30), codebase snapshot audited the same day
> Inputs: Task 6 (buyer question chains x4), Task 7 (information architecture), Task 8 (content strategy)
> Method: Cross-referenced proposed IA against actual codebase (`src/app/[locale]/`), product constants, MDX content, and sitemap
> Reading rule: `Current URL` = today's implemented code path. `Proposed URL` = approved target path for Ring 4 migration.

---

## 1. Full Inventory Table

### Legend

| Column | Values |
|--------|--------|
| Status | **Implemented** = page file exists with real content / **Placeholder** = page file exists but content is template, dummy, or minimal / **Missing** = no page file |
| Business Line | Pipes / Equipment / Custom / Shared |
| Decision Stage | Awareness / Comparison / Decision |
| Content Quality | **Complete** = answers buyer questions for this stage / **Partial** = some content, significant gaps / **Needs Rewrite** = content exists but is wrong audience or template leftover / **Empty** = no meaningful content |

### 1A. Currently Implemented Pages

| # | Current URL | Proposed URL (from IA) | Status | Business Line | Stage | Content Quality | Key Assets Needed |
|---|-------------|----------------------|--------|--------------|-------|----------------|-------------------|
| 1 | `/` | `/` | Implemented | Shared | Awareness | **Partial** | Real factory photos (currently placeholder SVGs), video of production line |
| 2 | `/products/` | `/products/` (restructured as 3-line hub) | Implemented | Shared | Awareness | **Partial** | Currently PVC-centric; needs 3-line hub restructure. Equipment card links to old `/capabilities/` path. Uses placeholder SVG image |
| 3 | `/products/north-america` | `/products/pipes/north-america` | Implemented | Pipes | Comparison | **Partial** | Product photos per family (using placeholder SVGs). Missing: tolerance data, test reports, container loading charts |
| 4 | `/products/australia-new-zealand` | `/products/pipes/australia-new-zealand` | Implemented | Pipes | Comparison | **Partial** | Same gaps as #3 |
| 5 | `/products/mexico` | `/products/pipes/mexico` | Implemented | Pipes | Comparison | **Partial** | Same gaps as #3 |
| 6 | `/products/europe` | `/products/pipes/europe` | Implemented | Pipes | Comparison | **Partial** | Same gaps as #3 |
| 7 | `/products/pneumatic-tube-systems` | `/products/pipes/pneumatic-tubes/` | Implemented | Pipes (PETG) | Comparison | **Partial** | Exists as a market page in product catalog, but content is generic. Missing: transparency specs, burst pressure data, seal test data, hospital application context. Needs full rewrite to speak to Dr. Chen persona |
| 8 | `/capabilities/bending-machines` | `/products/equipment/bending-machines/` | Implemented | Equipment | Awareness | **Partial** | Machine specs exist in `equipment-specs.ts` but are generic/placeholder-level. Uses placeholder SVG images. Missing: production process video, ROI content, capacity tables by diameter, after-sales info, self-validated narrative |
| 9 | `/oem-custom-manufacturing` | `/products/custom-manufacturing/` | Implemented | Custom | Awareness | **Partial** | Has process flow, scope cards, standards list. Missing: MOQ policy detail, IP/NDA section, mold cost/ownership info, case studies, QC documentation detail, packaging specs |
| 10 | `/about` | `/about/` | Implemented | Shared | Comparison | **Partial** | Has hero, mission, values, stats, FAQ, CTA. Missing: factory photos, certifications with downloads, machine evolution narrative, specific export market evidence |
| 11 | `/contact` | `/contact/` | Implemented | Shared | Decision | **Partial** | Has contact form, email/phone/WhatsApp, business hours, FAQ (MOQ, lead time, payment, samples, OEM). Missing: business-line routing on form, response time commitment, factory address with map, factory visit invitation CTA |
| 12 | `/blog` | `/blog/` | Implemented | Shared | Awareness | **Needs Rewrite** | Blog listing page works. Only 1 post exists: `welcome.mdx` — a template leftover about "B2B Web Template", not Tianze content. Zero real blog articles |
| 13 | `/blog/welcome` | `/blog/[slug]` | Implemented | Shared | Awareness | **Needs Rewrite** | Template leftover. Must be deleted or replaced with real Tianze content |
| 14 | `/privacy` | `/privacy/` | Implemented | Shared | — | **Partial** | Legal page exists via MDX (`content/pages/en/privacy.mdx`). Needs review for Tianze-specific accuracy |
| 15 | `/terms` | `/terms/` | Implemented | Shared | — | **Partial** | Legal page exists via MDX (`content/pages/en/terms.mdx`). Needs review for Tianze-specific accuracy |

### 1B. Proposed New Pages (from IA, not yet implemented)

| # | Proposed URL | Status | Business Line | Stage | Content Quality | Key Assets Needed |
|---|-------------|--------|--------------|-------|----------------|-------------------|
| 16 | `/products/pipes/` | **Missing** | Pipes | Awareness | Empty | PVC + PETG overview content, product range photos, market standards comparison visual |
| 17 | `/products/equipment/` | **Missing** | Equipment | Awareness | Empty | Equipment overview content, machine evolution narrative (Gen 1-3), bending machine photo |
| 18 | `/faq/` | **Missing** | Shared | Comparison | Empty | Cross-line FAQ aggregation from all 4 question chains. Note: FAQ sections exist as inline components on About, Contact, Product, OEM pages — but no standalone `/faq/` page exists. Referenced in sitemap concept but no `page.tsx` file found |

### 1C. Pages NOT in IA but May Be Needed (from question chain analysis)

| # | Potential Page/Section | Business Line | Stage | Rationale | Priority |
|---|----------------------|--------------|-------|-----------|----------|
| 19 | Certifications / Standards section (on About or standalone) | Shared | Comparison | PVC Q5, Q9 — "Show me certificates / test reports." Biggest Stage 2 blocker. Currently no downloadable certs anywhere | P0 |
| 20 | Trade Terms / Shipping info section | Pipes | Decision | PVC Q6, Q8, Q13 — pricing guidance, MOQ, container loading, shipping terms. Currently not answered anywhere | P1 |
| 21 | Quality Assurance section | Shared | Decision | PVC Q14, PETG Q9, OEM D3/D4 — QC process, defect handling, batch consistency. Three question chains identify this gap | P1 |
| 22 | Case Studies / References | Shared | Decision | PVC Q17, PETG Q8, Equipment Q18, OEM C5 — four chains ask for references. Zero exist | P2 |

---

## 2. Gap Analysis

### 2A. IA Coverage Check

Cross-referencing the proposed IA (Task 7) against actual implementation:

| IA Node | Implementation Status | Gap |
|---------|---------------------|-----|
| `/` Homepage | Exists | Content gap: 3-line hub routing not yet reflected in hero/sections |
| `/products/` 3-line hub | Exists but wrong structure | **Major gap**: currently PVC-centric, not a 3-line hub. Equipment card links to old path |
| `/products/pipes/` overview | **Does not exist** | New page needed |
| `/products/pipes/[market]/` | Exists at wrong path (`/products/[market]/`) | Needs URL migration + 301 redirects |
| `/products/pipes/pneumatic-tubes/` | Exists at wrong path (`/products/pneumatic-tube-systems`) | Needs URL migration. Content needs total rewrite for Dr. Chen persona |
| `/products/equipment/` overview | **Does not exist** | New page needed |
| `/products/equipment/bending-machines/` | Exists at wrong path (`/capabilities/bending-machines/`) | Needs URL migration + 301 redirect |
| `/products/custom-manufacturing/` | Exists at wrong path (`/oem-custom-manufacturing/`) | Needs URL migration + 301 redirect |
| `/about/` | Exists | Content enrichment needed (certs, factory photos) |
| `/contact/` | Exists | Content enrichment needed (form routing, visit CTA) |
| `/blog/` | Exists | Needs real content (currently template leftovers) |
| `/blog/[slug]` | Exists | Needs real articles |
| `/faq/` | **Does not exist** | New page needed (currently FAQ is inline on other pages) |
| `/privacy/` | Exists | Minor review needed |
| `/terms/` | Exists | Minor review needed |

**Summary**: 3 pages need creation, 4 pages need URL migration, all existing pages need content enrichment.

### 2B. Content Strategy (P0) Coverage Check

Cross-referencing content strategy P0 items (Task 8) against current content:

| P0 Content Need | Current State | Gap Severity |
|----------------|---------------|-------------|
| Homepage: "We make the machines" positioning | ChainSection exists but narrative could be stronger | **Low** — refinement, not rebuild |
| Homepage: Three business line entry points | ProductsSection exists but is PVC-focused | **Medium** — needs redesign for 3-line wayfinding |
| Homepage: Key differentiators | ChainSection, QualitySection exist | **Low** — content exists, needs tightening |
| Homepage: Primary CTA | SampleCTA, FinalCTA exist | **OK** |
| Products hub: 3-line overview | Currently PVC-only structure | **High** — fundamental restructure needed |
| Pipes overview | Page does not exist | **High** — new page |
| PVC by market: Standards compliance table | Exists (product specs components) | **Low** — data exists, needs tolerance enrichment |
| PVC by market: Product specs | Exists in constants | **Low** — data coverage varies by market |
| PVC by market: Certification status | Exists (ProductCertifications component) | **Medium** — honest positioning per Option A not yet applied |
| PVC by market: Free sample CTA | CtaSection exists on market pages | **OK** |
| PETG: What pneumatic tubes are | Page exists but generic product catalog format | **High** — total content rewrite for hospital/lab context |
| PETG: Technical specs | PNEUMATIC_SPECS exists in constants | **Medium** — has basic specs, missing transparency/pressure/seal data |
| PETG: Custom spec range | Not on current page | **High** — not addressed |
| PETG: CTA | Generic CTA exists | **Low** — needs persona-specific copy |
| Equipment: Product overview | Page exists but framed as "capability" | **Medium** — needs reframe as sellable product |
| Equipment: "We use our own machines" narrative | Not present | **High** — core differentiator completely absent |
| Equipment: CTA | Exists | **Low** — copy may need adjustment for capital equipment inquiry |
| Custom: OEM capability overview | Exists (scope cards) | **Low** — adequate for awareness |
| Custom: Mold development process | Process flow exists with timelines | **Low** — adequate, could add depth |
| About: Company story | Hero, mission sections exist | **Medium** — "equipment manufacturer -> pipes" narrative unclear |
| About: Factory scale | Stats section exists | **Low** — numbers shown |
| About: Certifications | FAQ mentions certs, no downloads | **High** — downloadable cert documents needed |
| Contact: Inquiry form | ContactForm exists | **Medium** — no business-line routing |
| Contact: Email as primary | Shown | **OK** |

### 2C. Question Chain Coverage Check

Total buyer questions identified across all 4 chains: **17 (PVC) + 9 (PETG) + 19 (Equipment) + 21 (OEM) = 66 questions**

| Coverage Level | PVC | PETG | Equipment | OEM | Total |
|----------------|-----|------|-----------|-----|-------|
| Well answered | 1 | 0 | 0 | 0 | **1** (1.5%) |
| Partially answered | 11 | 2 | 1 | 11 | **25** (37.9%) |
| Not answered at all | 5 | 7 | 18 | 10 | **40** (60.6%) |

**Worst-served business line: Equipment** — 0/19 questions answered. The existing bending machines page has basic machine specs (from `equipment-specs.ts`) and 3 "why it matters" cards, but answers zero buyer questions from the equipment question chain. No ROI content, no comparison to injection molding, no after-sales info, no self-validated narrative, no video, no installation requirements.

**Second-worst: PETG** — 7/9 questions unanswered. The pneumatic tube systems market page renders product specs from constants, but uses the generic PVC product page template. It does not speak to the integrator persona (Dr. Chen), does not address hospital applications, and is missing all critical technical test data (transparency, burst pressure, seal integrity).

**Highest-impact unanswered questions across all chains**:

| Question | Chain | Why Critical |
|----------|-------|-------------|
| "Show me the certificates / test reports" | PVC Q5, Q9 | Blocks Stage 2 for distributors and contractors |
| "What's your best price for a container?" | PVC Q6 | Mark cannot do landed-cost math |
| "Quality claims process?" | PVC Q14, PETG Q9, OEM D3/D4 | Final-gate blocker for 3 out of 4 buyer types |
| All 19 equipment questions | Equipment Q1-Q19 | Entire business line invisible to buyers |
| PETG technical data package | PETG Q2-Q6 | Integrators cannot shortlist without test data |
| IP protection / NDA | OEM D1, D2 | Deal-breaker for OEM buyers — completely missing |
| MOQ flexibility / scaling | OEM C4, D8 | Not explicitly answered anywhere |

---

## 3. Prioritized Action List

### P0 — Pre-Launch (Must Complete Before Site Goes Live)

| # | Action | Type | Page | Inputs Needed | Blocking Dependency |
|---|--------|------|------|---------------|-------------------|
| P0-1 | **Restructure `/products/` as 3-line hub** | Content rewrite | `/products/` | Three business line descriptions, visual hierarchy | None — Claude can draft copy from existing strategy docs |
| P0-2 | **Create `/products/pipes/` overview** | New page | `/products/pipes/` | PVC + PETG range overview, market standards summary | None — data exists in `product-catalog.ts` and question chains |
| P0-3 | **Migrate PVC market pages to `/products/pipes/[market]/`** | URL migration | All 4 market pages + pneumatic | Technical: route config, sitemap, redirects, internal links | P0-1 and P0-2 (new parent pages must exist first) |
| P0-4 | **Migrate `/capabilities/bending-machines/` to `/products/equipment/bending-machines/`** | URL migration | Bending machines page | Technical: route config, sitemap, redirects | P0-6 (equipment overview should exist first) |
| P0-5 | **Migrate `/oem-custom-manufacturing/` to `/products/custom-manufacturing/`** | URL migration | OEM page | Technical: route config, sitemap, redirects | P0-1 (products hub restructure) |
| P0-6 | **Create `/products/equipment/` overview** | New page | `/products/equipment/` | Equipment overview text, machine evolution narrative | **Owner**: confirm machine generation story (Gen 1/2/3 details) |
| P0-7 | **Add certifications section to About page** | Content addition | `/about/` | **Owner**: provide ISO 9001 certificate scan (PDF), list any in-progress certifications | **Blocked on owner providing cert documents** |
| P0-8 | **Rewrite PETG pneumatic page for integrator persona** | Content rewrite | `/products/pipes/pneumatic-tubes/` | **Owner**: provide PETG technical test data (transparency %, burst pressure, seal test) | **Blocked on owner providing test data** |
| P0-9 | **Enrich bending machines page with self-validated narrative** | Content addition | `/products/equipment/bending-machines/` | Production line photos showing machines in use, narrative text | **Owner**: provide factory photos of machines running in production |
| P0-10 | **Add honest certification positioning (Option A) to PVC market pages** | Content update | All 4 PVC market pages | Certification status per market, "engineered to standard, certification in progress" wording | None — strategy already defines Option A wording |
| P0-11 | **Homepage: add 3-business-line entry points** | Content update | `/` | Visual design for 3-line routing section | P0-1 (products hub must be restructured to receive traffic) |
| P0-12 | **Delete or replace `welcome.mdx` blog post** | Content cleanup | `/blog/welcome` | Either write first real Tianze blog post or remove the file | None |
| P0-13 | **Update navigation to new URL structure** | Technical | Header, footer, all internal links | New nav scheme from IA Task 7 | P0-3, P0-4, P0-5 (all migrations complete) |
| P0-14 | **Add 301 redirects for all migrated paths** | Technical | `middleware.ts` or `next.config.ts` redirects | Redirect map from IA Task 7 | P0-3, P0-4, P0-5 |

### P1 — Post-Launch Priority (First 30 Days)

| # | Action | Type | Page | Inputs Needed | Blocking Dependency |
|---|--------|------|------|---------------|-------------------|
| P1-1 | **Add trade terms / shipping info section** | Content addition | Contact page or new section on product pages | **Owner**: confirm MOQ policy, FOB port, container loading quantities, typical transit times, payment terms (T/T, L/C, deposit structure) | **Blocked on owner providing commercial terms** |
| P1-2 | **Add quality assurance content** | Content addition | About page or dedicated section | **Owner**: describe QC process (incoming inspection, in-process, final), defect handling policy, replacement timeline | **Blocked on owner providing QC details** |
| P1-3 | **Enrich equipment page with full technical specs** | Content update | `/products/equipment/bending-machines/` | **Owner**: provide real machine specifications (beyond current placeholder data in `equipment-specs.ts`) — actual dimensions, weight, power consumption, PLC brand, capacity by diameter | **Blocked on owner providing machine specs** |
| P1-4 | **Add ROI / cost comparison content for equipment** | Content addition | `/products/equipment/bending-machines/` or blog | Bending vs injection molding cost framework, payback period guidance | **Owner**: confirm cost ranges and savings claims |
| P1-5 | **Add after-sales support info for equipment** | Content addition | `/products/equipment/bending-machines/` | Installation process, training scope, spare parts policy, warranty terms | **Owner**: provide after-sales service details |
| P1-6 | **Add IP protection / NDA section to OEM page** | Content addition | `/products/custom-manufacturing/` | NDA availability statement, mold ownership policy | **Owner**: confirm IP protection policies |
| P1-7 | **Add MOQ flexibility / scaling path to OEM page** | Content update | `/products/custom-manufacturing/` | Trial order minimums, graduated volume path | **Owner**: confirm MOQ policy for custom orders |
| P1-8 | **Create `/faq/` standalone page** | New page | `/faq/` | Aggregate top questions from all 4 question chains | None — source material exists in question chain docs |
| P1-9 | **Expand mold development detail on OEM page** | Content update | `/products/custom-manufacturing/` | Accepted file formats, tolerance range, revision policy, cost structure | **Owner**: confirm mold development process details |
| P1-10 | **Add factory visit invitation CTA** | Content addition | About, Contact, Equipment, OEM pages | Visit logistics (nearest airport, hotel recs, scheduling process) | **Owner**: confirm willingness and logistics for factory visits |
| P1-11 | **Enrich PVC market pages with tolerance data** | Content update | All 4 PVC market pages | Full dimensional specs per product: OD, ID, wall thickness tolerances (plus/minus) | **Owner**: provide tolerance data or confirm existing constants accuracy |
| P1-12 | **Add downloadable spec sheet PDFs** | Asset creation | PVC market pages, equipment page | Formatted product data sheets in PDF | Depends on P1-11 (tolerance data must be confirmed first) |
| P1-13 | **Write first 5 real blog articles** | Content creation | `/blog/` | SEO topic clusters from Ring 2 Task 10 | None — Claude can draft; owner reviews |
| P1-14 | **Add contact form business-line routing** | Technical + content | `/contact/` | Subject/product line dropdown or routing logic | P0-1 (3-line structure established) |
| P1-15 | **Replace all placeholder SVG images with real product photos** | Asset replacement | All product pages, equipment page | **Owner**: provide product photographs (7 product types) and machine photographs | **Blocked on owner providing photos** |

### P2 — Future (Post-Launch Optimization)

| # | Action | Type | Page | Inputs Needed |
|---|--------|------|------|---------------|
| P2-1 | Create anonymized case studies (2-3) | Content creation | Blog or dedicated section | **Owner**: identify reference projects with permission |
| P2-2 | Add production process video (bending machines) | Media asset | Equipment page, About page | **Owner**: produce or commission factory video |
| P2-3 | Add machine evolution timeline (Gen 1-2-3) | Content addition | Equipment page, About page | **Owner**: provide history and details of machine iterations |
| P2-4 | Create interactive ROI calculator for equipment | Feature development | Equipment page | Cost model inputs from P1-4 |
| P2-5 | Add lead time / logistics detail section | Content addition | Contact or trade terms section | **Owner**: confirm stock vs production lead times, transit times by market |
| P2-6 | Expand blog to 10+ articles (SEO topic clusters) | Content creation | `/blog/` | Ongoing content calendar |
| P2-7 | Add video content to product pages | Media asset | All product pages | **Owner**: produce product/process videos |
| P2-8 | Customer testimonials or reference quotes | Content addition | Homepage, About | **Owner**: collect customer permissions |
| P2-9 | Review and update privacy/terms for Tianze accuracy | Content review | `/privacy/`, `/terms/` | Legal review |

---

## 4. Owner Input Dependency Summary

The following items are **blocked until the owner provides specific information or assets**. Claude can draft everything else.

| Input Needed | Blocks | Priority |
|-------------|--------|----------|
| ISO 9001 certificate scan (PDF) | P0-7 (certifications section) | P0 |
| Factory photos (production line, machines in operation) | P0-9 (self-validated narrative), P1-15 (image replacement) | P0 |
| PETG technical test data (transparency %, burst pressure, seal integrity) | P0-8 (PETG page rewrite) | P0 |
| Machine evolution narrative details (Gen 1/2/3) | P0-6 (equipment overview) | P0 |
| Real bending machine specifications (beyond placeholder data) | P1-3 (equipment spec enrichment) | P1 |
| Commercial terms (MOQ, payment, container loading, transit times) | P1-1 (trade terms), P1-7 (OEM MOQ) | P1 |
| QC process and defect handling policy | P1-2 (quality assurance content) | P1 |
| After-sales service details (installation, training, warranty, spare parts) | P1-5 (equipment after-sales) | P1 |
| IP protection policies (NDA, mold ownership) | P1-6 (OEM IP section) | P1 |
| Mold development process details (formats, tolerance, cost, revision policy) | P1-9 (OEM mold detail) | P1 |
| Product photographs (7 product types) | P1-15 (image replacement) | P1 |
| Reference project permissions | P2-1 (case studies) | P2 |
| Factory/production video | P2-2 (video content) | P2 |

**Items Claude can produce without owner input**: all URL migrations (P0-3/4/5), navigation restructure (P0-13), redirect setup (P0-14), products hub restructure (P0-1), pipes overview (P0-2), certification positioning copy (P0-10), homepage 3-line routing (P0-11), blog cleanup (P0-12), FAQ page (P1-8), blog articles (P1-13), form routing (P1-14).

---

## 5. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Owner-dependent P0 items delay launch | High — 4 of 14 P0 items need owner input | Medium | Prioritize non-blocked P0 items first; request owner materials early |
| URL migration breaks existing Google-indexed pages | Medium — current site not yet live, but internal links break | Low (if done carefully) | Comprehensive 301 redirect map; grep all internal links before migration |
| Equipment page launches with placeholder specs | High — capital equipment buyers need real data to shortlist | High | Gate equipment page launch on owner providing machine specs; use "coming soon" section if needed |
| PETG page launches without technical test data | High — integrators cannot shortlist without pressure/seal data | High | Same gating approach; a page with "request technical data sheet" CTA is better than a page with wrong data |
| Blog launches with template leftover content | Low — damages credibility if buyer sees it | High (currently live in codebase) | Delete `welcome.mdx` immediately as part of P0-12 |

---

## 6. Scorecard Summary

| Metric | Current | After P0 | After P1 |
|--------|---------|----------|----------|
| Pages in proposed IA | 15 types | 15 | 15 |
| Pages implemented | 12 | 15 | 15 |
| Pages at correct URL | 8 | 15 | 15 |
| Buyer questions answered (well or partially) | 26/66 (39%) | ~38/66 (58%) | ~52/66 (79%) |
| Business lines with dedicated content | 1 of 3 (PVC only) | 3 of 3 | 3 of 3 |
| Placeholder images remaining | ~8 | ~8 (needs owner photos) | ~2 (if owner provides photos) |
| Blog articles (real content) | 0 | 1-2 | 5-10 |
| Downloadable assets (PDFs, certs) | 0 | 1 (ISO cert) | 3-5 |
