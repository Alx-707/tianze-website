# Tianze Design Input Brief

> Last updated: 2026-04-29
> Status: design-ready synthesis from existing docs plus external research packet. Internal Tianze proof assets are still incomplete.
> Use this before running `shape`, `impeccable`, visual exploration, or page redesign work.
> Sharing: internal-only until proof gaps and source references are converted into a public-safe brief.

## 1. BLUF

Tianze design should not start from moodboards or final design tokens. It should start from a procurement question:

> What must an overseas buyer see, understand, and trust before sending a qualified inquiry?

Existing docs and the external research packet now give enough evidence to move from broad research into page shaping. Tianze is a B2B manufacturer/exporter of PVC conduit fittings, PVC conduit systems, PETG pneumatic tubes, and OEM/custom manufacturing support. The website exists to produce qualified overseas inquiries.

The next design work should use the current design system as a baseline, not as a final identity. Page structure and visual treatment should be tested on key pages first:

1. Homepage hero + trust evidence section
2. Product/category or product detail page
3. OEM / Custom manufacturing page

Only after these pilots prove the direction should `DESIGN.md` and token boundaries be upgraded from provisional to stable.

The immediate blocker is no longer external research. It is internal proof:

- certificate files and scope
- product dimension tables
- factory/QC/packing photos
- PETG tolerances and fit evidence
- sample/MOQ/lead time policy
- catalog/datasheet/submittal files

## 2. Source basis

This brief is synthesized from the current docs map:

- `PRODUCT.md`
- `DESIGN.md`
- `docs/project-context.md`
- `docs/strategy/current-strategy-summary.md`
- `docs/design-truth.md`
- `docs/impeccable/design-workflow.md`
- `docs/research/product-catalog-hierarchy-research.md`
- `docs/research/competitor-synthesis-and-action-plan.md`
- `docs/cwf/context/company/*`
- `src/config/single-site.ts`
- Private external research packet: `competitor-content-audit.md`
- Private external research packet: `buyer-voice-research.md`
- Private external research packet: `claim-evidence-matrix.md`
- Private external research packet: `design-input-brief.md`

For source classification, see:

- `docs/research/design-input-source-map.md`
- `docs/research/tianze-internal-evidence-inventory.md`
- `docs/impeccable/claim-evidence-matrix.md`

## 2.1 External research absorbed on 2026-04-29

External research covered 22 competitor, benchmark, distributor, forum, review, and pneumatic tube sources. Evidence was saved in the private source archive:

- `markdown/`
- `raw/`

Key source patterns:

1. China/export PVC conduit competitors use standard-led categories, RFQ/sample CTAs, certification blocks, factory proof, and FAQ.
2. Mature manufacturers prioritize specs, standards, submittal PDFs, catalog downloads, FAQ, and technical resources.
3. Distributor pages reveal procurement fields: item number, manufacturer part number, trade size, schedule, material, documents, availability, related/substitute products, reviews, and Q&A.
4. Buyer voice shows PVC conduit objections around direct burial, sunlight/UV, Schedule 40 vs 80, fit/joining, non-listed pipe, and inspection/code risk.
5. PETG/pneumatic tube evidence points to OD/ID, wall thickness, transparency, bend/radius, seal interface, blockage visibility, carrier/system fit, downtime, and maintenance.

Research limitations:

- Reddit detail pages/API were blocked; the buyer-voice report uses snippets for Reddit and marks confidence lower.
- YouTube comments were not reliably captured.
- Mexico/NOM, EU/IEC/LSZH, and deeper PETG integrator procurement voice remain follow-up topics, not current blockers.

## 3. Current design problem

The project has enough internal and external design input to start shaping key pages, but not enough internal proof assets to freeze final public copy or final visual system.

Current assets support:

- Buyer decision path
- Persona awareness
- Inquiry contribution modes
- Product IA direction
- Manufacturing trust direction
- Provisional visual baseline

Current assets still do not fully support:

- Final hero visual language
- Final product photography language
- Final brand color confidence
- Public-ready case studies and testimonials
- Formal proof for all compliance/certification claims
- Final downloadable catalog/datasheet system
- Strong Reddit/forum evidence for every submarket

## 4. Buyer decision path

Design should follow the procurement risk-reduction chain:

```text
1. Is this a real supplier?
2. Does it make the product category I need?
3. Do the specs, standards, and applications match my market?
4. Does the factory control manufacturing quality?
5. Can it support custom/OEM needs if required?
6. Are MOQ, samples, packaging, delivery, and communication risks acceptable?
7. Is it worth sending an inquiry?
```

This order matters more than visual novelty.

## 5. Buyer personas and current constraint

Current constraint: do not create separate persona-specific page variants yet. Use persona awareness to prioritize content inside one balanced page.

| Persona | Main concern | Design/content implication |
| --- | --- | --- |
| Distributor / importer | MOQ, pricing tiers, packaging, repeat supply, export reliability | Make product range, quote/sample path, packaging, and supply stability easy to scan. |
| Engineering contractor | Standards, specification match, installation fit, acceptance risk | Surface standards, dimensions, applications, and technical compatibility early. |
| Brand / OEM procurement | Customization, molds, private label, long-term cooperation | Show process, tooling, sampling, confidentiality, and factory control. |
| Medical / pneumatic system integrator | PETG clarity, sealing, fit, custom size, stable supply | Keep technical fit, application context, and tube evidence close to product claims. |

Persona fields should still appear in every Page job contract:

```text
主目标买家：
次目标买家：
内容平衡策略：
```

## 6. Page job contract recommendations

Every page or major module should start with this contract:

```text
页面目的：
询盘贡献模式：直接转化 / 信任铺垫 / 答疑除障 / 入口分发
主目标买家：
次目标买家：
内容平衡策略：
用户核心疑问：
必须出现的证据：
主 CTA：
次 CTA：
失败时的退路：
不该出现的干扰：
```

### Inquiry contribution by page

| Page | Contribution mode | Main job |
| --- | --- | --- |
| Homepage | Trust paving + entry distribution | Establish first trust, clarify product lanes, route buyers to products/OEM/contact. |
| Products overview | Entry distribution | Help buyers choose by market/standard/product family without feeling lost. |
| Market/category page | Objection removal + direct conversion | Confirm standard fit, product range, typical specs, sample/quote path. |
| Product detail page | Objection removal + direct conversion | Let buyer confirm spec, material, standard, application, and inquiry context. |
| OEM / Custom | Direct conversion + trust paving | Prove tooling, sampling, process control, MOQ/custom response, and confidentiality. |
| About / Manufacturing | Trust paving | Prove Tianze is a real factory-backed supplier, not only a trading shell. |
| Contact / Inquiry | Direct conversion | Reduce form friction and make next response expectations clear. |
| FAQ / Downloads | Objection removal | Answer MOQ, lead time, sample, standards, packaging, and document needs. |

## 7. Page-by-page content modules

### Homepage

Primary buyer question:

> Is this a credible factory-backed supplier worth exploring?

Recommended modules:

1. Hero with product scope + manufacturing control, not empty slogan.
2. Three entry paths:
   - PVC electrical conduit fittings
   - PETG pneumatic tube systems
   - OEM / custom manufacturing
3. Market/standard chips:
   - UL 651 / ASTM
   - AS/NZS
   - IEC
   - NOM
   - Schedule 40 / 80
4. Compact trust line using verified facts only.
5. Product/market routing section.
6. Manufacturing evidence section: forming, molds, production, QC.
7. Standards and compliance context, carefully worded.
8. Low-friction CTA: request quote, ask for sample, download catalog, send drawing.

Avoid:

- Hero built around fake metrics or unsupported global claims.
- Overly abstract SaaS-style gradient hero.
- Treating manufacturing process as decorative background only.

### Products overview

Primary buyer question:

> Where do I find the product line that matches my market or standard?

Recommended modules:

1. Market/standard entry cards.
2. Product family overview:
   - conduit bends / sweeps
   - couplings / connectors / adapters
   - conduit pipes
   - PETG pneumatic transfer tubes
3. Buying filters:
   - product type
   - standard/market
   - material
   - schedule/duty
   - size range
4. Short explanation of standards and market fit.
5. Link to sample/quote path.
6. Download/catalog placeholder only if real assets exist.

Design implication:

- Use clear routing and comparison, not visual card noise.

### Market/category pages

Primary buyer question:

> Does this product family fit my market, standard, and project?

Recommended modules:

1. Market/standard hero.
2. Applicable products.
3. Spec table or spec-group summaries.
4. Application scenarios.
5. Compliance/certification wording.
6. Sample and quote CTA.
7. Product-level FAQ.
8. RFQ checklist:
   - size
   - standard
   - quantity
   - certificate/document requirement
   - destination country

Design implication:

- Tables and technical labels are not secondary. They are trust-building content.

### Product detail pages

Primary buyer question:

> Can I use this product in my project, and what should I ask for?

Recommended modules:

1. Product title with standard/application context.
2. Product image or technical visual.
3. Key specs near the image.
4. Material, dimensions, end type, angle, color, packaging where relevant.
5. Standards and documents:
   - certificate, if real
   - datasheet
   - catalog
   - submittal
6. Application notes:
   - direct burial
   - sunlight/UV
   - concrete encasement
   - expansion/support
7. Related products or compatible fittings.
8. FAQ: sample, MOQ, custom color/printing, compatible conduit.
9. Inquiry form/CTA prefilled with product context.

Design implication:

- Product pages should feel like procurement support, not a brochure or marketplace listing.

PETG product detail variant:

- Add OD/ID, wall thickness, length, transparency, surface finish, bend compatibility, carrier/system fit checklist, and packing protection against scratches/deformation.
- Do not claim whole-system sealing or uptime. Final sealing/system performance should be validated with the integrator.

### OEM / Custom manufacturing page

Primary buyer question:

> Can Tianze actually handle custom requirements without creating risk?

Recommended modules:

1. What can be customized.
2. Drawing/sample-to-production process.
3. Mold/tooling capability.
4. Sampling process and expected discussion points.
5. QC and confirmation steps.
6. MOQ/confidentiality/communication expectations.
7. Required buyer inputs:
   - drawing/photo
   - target standard
   - quantity
   - tolerance
   - destination country
   - packaging/private label requirement
8. Custom inquiry CTA.

Design implication:

- Process diagrams and step structure are more valuable than decorative factory claims.

### About / Manufacturing page

Primary buyer question:

> Is this a real, stable, credible supplier?

Recommended modules:

1. Factory-backed positioning.
2. Company facts from current config.
3. Manufacturing chain: forming, molds, extrusion/production, QC.
4. ISO certificate and carefully worded standards context.
5. Export and cooperation context.
6. Content gaps should not be hidden by design.

Design implication:

- Real assets matter. If photos are missing, use structured process evidence instead of fake stock-feeling visuals.

### Contact / Inquiry page

Primary buyer question:

> Can I send a requirement quickly and expect a useful response?

Recommended modules:

1. Minimal inquiry form.
2. Product interest prefill where possible.
3. Clear "what to include" helper text.
4. Alternate contact methods if verified.
5. Expected response timing if true.
6. Trust fallback: sample, quote, technical question.

Design implication:

- Contact is not where to show off. Reduce anxiety and friction.

## 8. Claim-evidence handling

This is the most important design guardrail.

| Claim | Status | Required evidence | Recommended expression |
| --- | --- | --- | --- |
| Factory-direct manufacturer | Use with care | Factory facts, process, photos/assets where available | "Factory-backed PVC conduit fittings and PETG tube manufacturing support." |
| Not a pure trading company | Use with care | Manufacturing process and capability proof | Prefer positive wording: "in-house forming, tooling, and production control." |
| In-house forming capability | Ready as direction, needs assets | Process description, equipment/process photos, QC notes | Use as manufacturing evidence, not as product category. |
| Mold development / custom tooling | Use with care | Custom process, sample workflow, case or photo proof | "Custom tooling and sampling discussion available for suitable projects." |
| OEM/private label support | Use with care | MOQ, process, packaging/private-label constraints | Explain process and inquiry path; avoid overpromising. |
| Stable quality | Needs proof | QC process, inspection photos, standards, batch checks | Use process proof instead of vague "high quality." |
| Standard compliance | Use with careful wording | Product-specific reports/certificates | Say "standard-oriented production / compliance support" unless formal proof exists. |
| UL/ASTM/AS/NZS/IEC capability | Needs proof before strong claim | Formal reports, certificates, product mapping | Avoid implying all products are certified. |
| Fast sample / flexible MOQ | Needs business confirmation | Actual policy by product line | Keep as inquiry discussion unless policy is confirmed. |
| Export-ready packaging | Needs assets | Packaging photos, specs, loading info | Add once packaging details are real. |
| PETG transparency/sealing/system fit | Needs product proof | Photos, material specs, application proof | Good candidate for future visual proof. |
| Reliable delivery | Needs data | On-time data and scope | Avoid unqualified percentages unless current source verifies them. |
| Cost advantage | Use carefully | RFQ/comparison evidence | Do not lead with cheapness; frame as factory-direct efficiency. |

For the full matrix, use:

- `docs/impeccable/claim-evidence-matrix.md`

## 9. Current content gaps that block final design

High-priority gaps:

- Factory exterior/workshop/production line photos
- Product images with consistent quality
- QC/inspection photos
- UL/ASTM/AS/NZS test reports or certificate scans where claims depend on them
- Product spec sheet PDFs or downloadable catalogs
- Packaging and container/loading proof
- Product-level FAQ answers: MOQ, lead time, samples, packaging, standards
- Public-safe case studies or anonymized application examples
- PETG tube visual proof: transparency, bend, sealing, application context
- Product-specific standard/certification truth table:
  - product
  - standard
  - certified / tested / made-to-standard / unverified
  - document file
  - validity/scope

Design consequence:

- Do not compensate for missing evidence with decorative visuals.
- If evidence is missing, design should create clear placeholders and ask for content, not hide the gap.

## 10. Visual direction implied by the evidence

The content points toward:

- precise
- restrained
- procurement-friendly
- evidence-led
- industrial but clean
- factory-backed, not marketplace-like

Use Vercel influence as method:

- grid discipline
- whitespace control
- clear hierarchy
- restrained interaction

Do not import Vercel identity:

- no developer-tool feel
- no generic SaaS hero
- no decorative gradient-as-brand
- no fake metrics rhythm

The strongest visual proof should eventually come from:

- real product details
- technical tables
- process diagrams
- factory/process images
- QC and packaging evidence

## 11. What not to do next

- Do not freeze final design tokens now.
- Do not generate more moodboards before external buyer/competitor evidence is added.
- Do not create persona-specific page variants yet.
- Do not treat old CWF proof points as public truth without verification.
- Do not lead with certification claims until product-specific evidence is clear.
- Do not redesign pages only because they feel visually plain; first check if the page lacks evidence.

## 12. Recommended next workflow

### Step A: fill external evidence gaps

External research has been completed in the private external design-input research packet.

Do not continue broad research by default. Further research should be page-triggered:

1. Mexico/NOM only when shaping Mexico page.
2. EU/IEC/LSZH only when shaping Europe page.
3. Reddit/API or YouTube only when a page needs more buyer language.
4. PETG integrator research only when shaping PETG page.

### Step B: fill internal evidence gaps

Use:

- `docs/research/tianze-internal-evidence-inventory.md`

Priority internal proof requests:

1. ISO 9001 scan/PDF.
2. Product-specific standard/certification inventory.
3. Product size/spec tables.
4. Factory/workshop/production/QC photos.
5. Sample/MOQ/lead time policy.
6. Catalog/datasheet PDFs.

### Step C: run `shape` on one pilot page

Best first pilot:

```text
Homepage hero + trust evidence section
```

Reason:

- It tests whether Tianze feels like a credible manufacturer instead of a SaaS template or Alibaba listing.
- It forces the project to decide what proof can be shown above the fold.
- It gives a real basis for later token/design-system stabilization.

### Step D: only then refine visual system

After pilot pages, update `DESIGN.md` from provisional to stronger boundaries:

- color usage
- typography hierarchy
- product/spec modules
- card and table styles
- trust evidence modules
- CTA and inquiry modules
- motion boundaries

## 13. Readiness verdict

Current state:

> Ready for page shaping with proof placeholders, not ready for final copy or design-system freeze.

Safe to do now:

- Page job contracts
- Information architecture
- Homepage/product/OEM pilot structure
- Content-gap-driven design planning
- Homepage hero + trust evidence `shape`

Not safe to finalize yet:

- Final visual identity
- Final hero image language
- Final brand color system
- Strong public certification claims
- Case-study/testimonial sections using unsupported content
