# Tianze Claim-Evidence Matrix

> Last updated: 2026-04-29
> Status: design and content guardrail, synthesized from external research plus current Tianze repo facts.
> Source packet: private external design-input research packet, kept outside this repo.
> Sharing: internal-only until proof gaps and source references are converted into a public-safe brief.

## How to use this file

This file decides which claims can be used in Tianze pages, which claims need careful wording, and which claims should not lead the website until proof assets exist.

Use this before:

- homepage hero copy
- product page copy
- OEM/custom page copy
- About/manufacturing proof blocks
- inquiry form helper copy
- design work that visually emphasizes a claim

Status definitions:

| Status | Meaning |
| --- | --- |
| Ready to use | Can appear on the website if paired with basic evidence. |
| Use with careful wording | Can appear, but must be bounded and not sound absolute. |
| Needs proof before using | Do not use as a headline, hero claim, or major trust claim until proof is available. |
| Do not use yet | Do not use publicly unless the project owner supplies specific proof. |

## External proof patterns used

The external research found three different proof patterns:

1. China/export-oriented competitors such as Ctube and Ledes use standards, factory proof, quote/sample CTAs, and FAQ blocks to push inquiries.
2. Mature brands such as CANTEX, Charlotte Pipe, Vinidex, GF, JM Eagle, Dura, and Spears rely heavily on spec tables, submittals, catalog PDFs, standards pages, FAQ, and technical downloads.
3. Distributor pages such as Grainger, Zoro, McMaster, Ferguson, Rexel, SupplyHouse, and Lowe's show procurement reality: item number, manufacturer part number, trade size, material, schedule, documents, stock/availability, related products, reviews, and Q&A.

The design implication is simple:

> Tianze should not only say "factory" or "quality"; it must make procurement evidence easy to inspect.

## Current Tianze evidence reality

Based on current repo inspection:

| Evidence area | Current repo state | Design consequence |
| --- | --- | --- |
| Company identity | Present in `src/config/single-site.ts` and docs. | Safe to use as factual company context. |
| ISO 9001 | Certificate number exists in config and messages. A public scan/PDF was not found in `public/`. | Can mention ISO carefully, but strong certificate/download module needs the scan/PDF. |
| Export countries | Current config says `20`; older docs mention `107`. | Use 20/20+ unless 107 is verified and deliberately promoted. |
| Product taxonomy | Current config has markets and families for North America, AU/NZ, Mexico, Europe, PETG. | Safe to use as page IA input. |
| Product standards | Current copy/config uses UL 651, ASTM D1785, AS/NZS 2053, NOM-001-SEDE, IEC 61386. | Must distinguish made-to-standard, standard-oriented, compliant, listed, certified. |
| Product images | Mostly SVG placeholders and representative graphics in `public/images/products/`. | Do not design proof-heavy product sections around final photography yet. |
| Factory/QC/packing photos | Not found as public final assets. | Do not visually lead with "real factory proof" until assets are supplied. Use process diagrams/placeholders instead. |
| Spec PDFs/catalog/downloads | Not found as current public PDF assets. | Download center can be designed as a required module, but content remains blocked. |
| PETG tolerance/system fit proof | Not found as structured proof. | PETG copy must avoid system-level sealing/uptime guarantees. |
| MOQ/sample/lead time policy | Not found as confirmed policy. | Use RFQ-confirmation wording until business rules are supplied. |

## Matrix

| Claim | Status | Buyer question behind it | Evidence required | Common external proof pattern | Risk if unsupported | Recommended Tianze expression |
| --- | --- | --- | --- | --- | --- | --- |
| PVC electrical conduit fittings supplier | Ready to use | "Do you sell the product category I need?" | Product family list and route. | Competitors and distributors organize by fittings, bends, couplings, conduit pipe. | Low if taxonomy is clear. | "PVC conduit fittings, bends, couplings, connectors, and conduit pipe systems for overseas B2B projects." |
| PETG pneumatic transfer tubes | Ready to use | "Do you supply the tube component I need?" | PETG product family, size range, material notes. | Petro, Böhmtec, TransLogic show tube/system component language. | Medium if system fit is overclaimed. | "PETG pneumatic transfer tubes for hospital, laboratory, and logistics system integrators." |
| Factory-direct manufacturer | Needs proof before using | "Are you a real factory or a trading intermediary?" | Factory photos, production process, equipment, address, license, production workflow. | Ctube/Ledes show factory photos and production proof; mature suppliers show company contact and technical docs. | Buyer may treat Tianze as a trading-company wrapper. | Until assets exist: "factory-backed supply and manufacturing support." After proof: "factory-direct manufacturing from Tianze production lines." |
| Not a trading company | Needs proof before using | "Can you control production and quality?" | Same as above, plus QC/process evidence. | Ledes FAQ answers manufacturer/trading directly; Petro emphasizes own manufacturing facility. | Negative wording increases suspicion if proof is thin. | Avoid as headline. Prefer: "Production, sampling, and QC are handled through a controlled manufacturing workflow." |
| In-house forming capability | Needs proof before using | "Can you make bends/sweeps/custom shapes yourself?" | Forming machine photos/video, capability range, angle/radius table, sample cases, tolerance. | Böhmtec gives diameter/radius/part info; competitors mention custom but often thinly. | Attracts drawings Tianze may not be ready to qualify. | "In-house forming support for standard conduit bends and selected custom radius requests, subject to drawing review." |
| Mold development/custom tooling | Needs proof before using | "Can you create a new connector/fitting for my product line?" | Mold photos, tooling process, lead time, tooling cost policy, sample approval flow. | Petro frames customization as engineering service with quote consultation. | Buyer asks for cost/time/tolerance and Tianze cannot answer. | "Custom tooling is reviewed case by case based on drawing, sample, quantity, and tolerance requirement." |
| OEM/private label support | Use with careful wording | "Can you produce under my packaging/brand?" | Packaging examples, marking/printing, artwork workflow, MOQ and packing specs. | Ctube/Ledes mention OEM, color, printing and sample. | Can create low-quality private-label inquiries. | "OEM/private label packaging is available after artwork, packing spec, product scope, and MOQ confirmation." |
| Stable quality | Needs proof before using | "Will every batch fit and perform consistently?" | QC checklist, dimension inspection, material checks, batch records, test equipment photos. | Mature brands use submittals, standards, material classification, markings and documents. | "Stable quality" becomes empty marketing. | "Quality is controlled through material checks, forming/extrusion inspection, dimensional checks, and packing inspection." |
| ISO 9001 certified | Use with careful wording | "Is there a quality management certificate?" | Certificate scan/PDF, certificate number, validity, scope, registrar. | Competitors show certificates/logos; better sites make documents available. | If buyer asks for certificate copy and Tianze cannot provide it, trust drops. | "ISO 9001:2015 quality management certificate #240021Q09730R0S. Certificate copy available during RFQ review." Add download only after PDF exists. |
| UL 651 / ASTM / AS/NZS / IEC / NOM certified | Do not use yet | "Which exact products are listed/certified?" | Product-specific certificate, listing, report, validity, scope. | CANTEX, Vinidex, Charlotte, Spears, GF show standards and documents by product/system. | Highest risk. Certification overclaim can kill inquiries. | Do not write broad "certified" unless certificate exists. Use "standard-oriented product scope" or "documentation available where applicable." |
| Standard compliance/manufactured to standard | Use with careful wording | "Can this product match my market requirement?" | Standard-to-product mapping, datasheet, test report where available. | CANTEX FAQ and PDFs; Vinidex standards/downloads; distributor documents. | "Compliant" can be read as certified. | "Products can be supplied for specified standard contexts such as UL 651, ASTM, AS/NZS, NOM, or IEC, subject to confirmed product scope and documentation." |
| Schedule 40/80 product availability | Ready to use if product list is accurate | "Can I source the wall thickness/duty level I need?" | Product family list and spec table. | CANTEX, Charlotte, distributors all lead with Schedule 40/80. | Confusion if spec tables are missing. | "Schedule 40 and Schedule 80 options are available for relevant North American PVC conduit product families." |
| AU/NZ AS/NZS 2053 series | Use with careful wording | "Do you support the Australian/New Zealand conduit standard context?" | Product mapping, AS/NZS document scope, size tables. | Vinidex uses AS/NZS 2053 pages, certification/downloads. | AU/NZ buyers expect documentation. | "AS/NZS 2053-oriented product series for AU/NZ project discussions. Confirm required certificate/document scope during RFQ." |
| Mexico NOM series | Use with careful wording | "Can this fit Mexico market requirements?" | NOM-specific product proof and datasheet. | Research marked Mexico/NOM as follow-up gap. | Thin evidence. | "NOM-oriented conduit product discussions available, subject to project and documentation requirements." |
| Europe IEC series | Use with careful wording | "Can this fit European project requirements?" | IEC product proof, LSZH if claimed, datasheet. | Mature suppliers use detailed documents. Research says IEC/LSZH needs follow-up. | EU standards and terminology may be overgeneralized. | "IEC 61386-oriented product discussions available after confirming application, duty class, and required documentation." |
| Fast sample | Needs proof before using | "Can I test before ordering?" | Product-level sample policy, fee, freight rule, lead time. | Ledes/Ctube use sample FAQs; buyers ask sample/MOQ. | Sales cannot meet expectation. | "Sample availability depends on product size, stock status, customization, and destination. Send size and quantity for confirmation." |
| Flexible MOQ | Needs proof before using | "Can I start with a manageable order?" | MOQ by product family and custom/standard split. | Export competitors often mention MOQ. | Attracts small buyers or creates negotiation friction. | "MOQ varies by product family, size, packaging, and customization level." |
| Export-ready packaging | Needs proof before using | "Will products arrive undamaged and labelled correctly?" | Packing photos, carton/bundle/pallet specs, label examples, loading photos. | Distributors list packaging/quantity; research shows packaging specs matter. | Packaging surprises are a common procurement concern. | "Export packaging can be specified by bundle, carton, pallet, label, and private-label requirements." |
| PETG transparency | Needs proof before using | "Can I see blockages and movement?" | Product photo/video, material clarity proof, sample. | Petro emphasizes visibility; clear tubing supports inspection. | Visual claim with no image is weak. | "Transparent PETG tube options support visual inspection in applicable pneumatic transfer systems." |
| PETG sealing/leak-proof system | Do not use yet | "Will the pneumatic system seal and stay reliable?" | System-level fit validation, carrier/seal interface, test data, integrator reference. | TransLogic/Pevco discuss seals, air leaks, carriers, downtime at system level. | Tube supplier should not guarantee whole-system performance. | "Final sealing and system performance should be validated with the pneumatic system integrator." |
| Technical support/drawing review | Use with careful wording | "Can you review my drawing or project requirement?" | Named technical process, upload flow, expected response, engineering contact if available. | GF and Petro offer contact/consultation; distributors structure fields. | If only sales support exists, "engineering support" may overpromise. | "Send drawings, target standard, quantity, destination, and application conditions for review before quotation." |
| Reliable delivery | Needs proof before using | "Can you ship on time?" | Lead time range, production schedule, historical data, packing/export workflow. | Mature suppliers show stock/availability; export competitors use delivery claims. | Delivery claim without data is fragile. | "Lead time depends on size, tooling, quantity, and documentation requirements. We confirm schedule after spec review." |
| Cost advantage | Use with careful wording | "Is factory-direct sourcing economically useful?" | Factory-direct logic, container/MOQ/packing efficiency, not lowest-price promise. | Export competitors mention factory-direct savings. | Cheapness undermines trust. | "Factory-backed supply can help improve sourcing efficiency and cost control when specification and quantity are clear." |
| Long-term cooperation | Needs proof before using | "Can you support repeat supply?" | Repeat customers, case studies, annual volume, cooperation examples. | Petro uses testimonials; competitors use customer reviews. | Fake-looking testimonials hurt trust. | "Designed for sample-to-bulk cooperation with importers, distributors, and OEM buyers." |

## Claims safe as neutral page labels

These can be used without heavy proof if they stay descriptive:

- PVC conduit fittings
- PVC conduit bends / sweeps
- PVC couplings / connectors / adapters
- PVC conduit pipes
- PETG pneumatic transfer tubes
- OEM / custom manufacturing inquiry
- Request quote
- Request sample
- Send drawing
- Download catalog, only if a catalog exists

## Claims that should not lead the homepage yet

- UL certified manufacturer
- AS/NZS certified manufacturer
- IEC certified manufacturer
- NOM compliant products, unless product proof exists
- No. 1, leading, top manufacturer
- Not a trading company
- Guaranteed fit with pneumatic tube systems
- Leak-proof pneumatic tube
- Fastest sample
- Lowest cost
- World-class quality
- Trusted by global brands without named and approved evidence

## Minimum proof pack before final public copy

Priority 1:

- Product list by market/standard.
- Certificate/test report inventory with exact product scope.
- ISO 9001 certificate scan/PDF.
- Factory photos: exterior, workshop, production line.
- Dimension tables for PVC fittings and PETG tubes.
- Product catalog PDF or product family datasheets.
- RFQ/spec form fields.

Priority 2:

- Sample policy and MOQ table.
- Packaging photos and export packing specs.
- QC checklist.
- OEM/custom process graphic with real steps.
- PETG OD/ID, wall thickness, length, radius and packing notes.

Priority 3:

- Factory video.
- Third-party inspection acceptance statement.
- Downloadable submittal templates.
- Public-safe case notes or anonymized application examples.
- Customer references/testimonials with permission.

## Immediate copy risk found in current repo

Current translation/config content contains some phrases such as "UL 651 Certified", "AS/NZS 2053 Certified", "IEC 61386 Certified", and broader "Products meet ASTM, UL651, AS/NZS..." style statements.

This matrix does not change code. It records the content risk:

- If certificates are real and scoped, attach proof and keep specific wording.
- If not, downgrade to "standard-oriented", "manufactured to specified requirements", "documentation available where applicable", or route through RFQ confirmation.
