# Content Strategy — Tianze Website

> Ring 2, Task 8 | Status: Confirmed by owner (2026-03-30)
> Inputs: Task 6 (question chains), Task 7 (information architecture)

## Content Principle

Every page answers buyer questions in the order buyers actually think them. Content is organized by **decision stage**, not by what the company wants to say.

Buyer stage at arrival: **already have some understanding** (owner confirmed). Content should prioritize comparison/decision stages over basic awareness.

## Content-to-Decision-Stage Mapping

### Homepage `/`

| Stage | Content | Priority |
|-------|---------|----------|
| Awareness | Company positioning: "We make the machines that make the pipes" | P0 |
| Awareness | Three business lines with clear entry points | P0 |
| Comparison | Key differentiators (equipment manufacturer, factory-direct, standards-compliant) | P0 |
| Decision | Trust signals: ISO cert, export data, factory scale | P1 |
| Decision | Primary CTA: Get Quote / Request Samples | P0 |

**Role**: Route buyers to the right business line in < 10 seconds. Build enough trust to continue browsing.

### Products Hub `/products/`

| Stage | Content | Priority |
|-------|---------|----------|
| Awareness | Three-line overview with visual distinction | P0 |
| Comparison | Quick comparison of what each line offers | P1 |

**Role**: Wayfinding page. Buyer picks their line and goes deeper.

### Pipes Overview `/products/pipes/`

| Stage | Content | Priority |
|-------|---------|----------|
| Awareness | Product range overview (PVC conduit + PETG) | P0 |
| Comparison | Market-by-market standards coverage | P0 |
| Comparison | "Why factory-direct" value summary | P1 |
| Decision | CTA: View specs by market / Request samples | P0 |

### PVC Conduit by Market `/products/pipes/[market]/`

| Stage | Content | Priority |
|-------|---------|----------|
| Comparison | Standards compliance table (AS/NZS, ASTM, etc.) | P0 |
| Comparison | Product specs: dimensions, tolerances, materials | P0 |
| Comparison | Certification status (existing + in progress) | P0 |
| Decision | Downloadable spec sheet / catalog PDF | P1 |
| Decision | Free sample CTA | P0 |
| Decision | Price guidance (not exact, but "factory-direct, inquiry for quote") | P1 |

**Content gap (from question chain)**: Test reports, tolerance data, shipping/MOQ info currently missing or thin.

### PETG Pneumatic Tubes `/products/pipes/pneumatic-tubes/` (NEW)

| Stage | Content | Priority |
|-------|---------|----------|
| Awareness | What PETG pneumatic tubes are, applications (hospital/lab) | P0 |
| Comparison | Technical specs: transparency, burst pressure, seal quality | P0 |
| Comparison | Custom spec range (diameters, wall thickness, lengths) | P0 |
| Comparison | Batch consistency evidence | P1 |
| Decision | Supply stability track record | P1 |
| Decision | CTA: Request technical consultation / samples | P0 |

**Content gap**: This page does not exist yet. Entire content needs creation.

### Equipment Overview `/products/equipment/` (NEW)

| Stage | Content | Priority |
|-------|---------|----------|
| Awareness | What bending machines do, who they're for | P0 |
| Comparison | Machine evolution narrative (Gen 1 → Gen 2 → Gen 3) | P1 |
| Decision | CTA: Request specs / Book consultation | P0 |

### Bending Machines `/products/equipment/bending-machines/`

| Stage | Content | Priority |
|-------|---------|----------|
| Awareness | Product overview, diameter range, production capability | P0 |
| Comparison | Technical specs (once owner provides) | P0 |
| Comparison | Hot-bending vs injection molding cost comparison | P1 |
| Comparison | "We use our own machines" self-validation narrative | P0 |
| Decision | ROI guidance content | P1 |
| Decision | Installation, training, spare parts support info | P1 |
| Decision | CTA: Request detailed specs / Book technical consultation | P0 |

**Content gap**: 19 buyer questions, 0 currently answered. Biggest gap in the entire site. Depends on owner providing machine specs.

### Custom Manufacturing `/products/custom-manufacturing/`

| Stage | Content | Priority |
|-------|---------|----------|
| Awareness | OEM/custom capability overview | P0 |
| Comparison | Mold development process (from drawing to sample) | P0 |
| Comparison | MOQ and scaling path (small trial → volume production) | P1 |
| Decision | Quality control for custom runs | P1 |
| Decision | CTA: Submit custom inquiry with drawings | P0 |

**Content gap**: Currently thin. Needs mold development process detail, MOQ policy, QC documentation specifics.
**Deferred**: IP protection / NDA content (owner decision to defer).

### About `/about/`

| Stage | Content | Priority |
|-------|---------|----------|
| Comparison | Company story: equipment manufacturer → pipe fittings | P0 |
| Comparison | Factory scale, team, export history | P0 |
| Decision | Certifications (existing + in progress, Option A wording) | P0 |
| Decision | Factory visit invitation | P1 |

**Role**: Shared trust asset for all business lines. Second most important conversion-supporting page.

### Contact `/contact/`

| Stage | Content | Priority |
|-------|---------|----------|
| Decision | Inquiry form (routed by business line) | P0 |
| Decision | Email as primary channel, WhatsApp as secondary | P0 |
| Decision | Response time commitment (< 24 hours) | P1 |
| Decision | Office location + factory address | P1 |

### Blog `/blog/`

| Stage | Content | Priority |
|-------|---------|----------|
| Awareness | SEO entry point articles | P2 |

**Content types** (aligned with SEO topic clusters from Task 10):
- Technical how-tos: "How to select PVC conduit by standard"
- Standards guides: "Understanding AS/NZS 2053 for PVC conduit"
- Application case studies: industry applications
- Machine technology articles: bending vs injection molding

### FAQ `/faq/`

| Stage | Content | Priority |
|-------|---------|----------|
| Comparison | Cross-line FAQ addressing top buyer questions | P1 |
| Decision | Objection handling (certifications, quality, lead time) | P1 |

Source: aggregate top questions from all 4 question chains.

## Content Priority Summary

| Priority | Pages | Status |
|----------|-------|--------|
| **P0 — Must have for launch** | Homepage, Products hub, Pipes overview, PVC by market (existing, needs enrichment), PETG (new), Bending machines (new content), Custom (enrich), About (enrich), Contact (form routing) | Mixed |
| **P1 — Should have** | Equipment overview, FAQ, Blog (initial 5-10 articles), spec sheet downloads, ROI content for equipment | Mostly new |
| **P2 — Nice to have** | Additional blog articles, case studies, video content | Future |

## Content Types Across Pages

| Content type | Where it appears | Shared or unique |
|-------------|-----------------|-----------------|
| Trust bar (ISO + export data + factory scale) | All product pages, homepage | Shared component |
| CTA block (inquiry / sample / consultation) | All pages | Shared component, copy varies by line |
| Standards comparison table | PVC market pages | Unique per market |
| Technical spec table | PVC, PETG, equipment pages | Unique per product |
| Certification status section | About, product pages | Shared content, referenced from multiple pages |
| Free sample offer | Pipe product pages, homepage | Shared CTA |
| Factory visit invitation | About, contact, equipment | Shared content |
| Machine evolution narrative | Equipment page, about page | Shared content |

## Content Dependency on Assets

| Content need | Asset required | Available? |
|-------------|---------------|-----------|
| Product photos | Product images (7 types) | Yes, needs enhancement |
| Factory photos | Factory/workshop images | Yes, needs enhancement |
| Technical specs (PVC) | Product spec data | Yes (in constants) |
| Technical specs (equipment) | Bending machine parameters | Not yet — owner will provide later |
| Certification scans | ISO certificate, in-progress certs | Yes |
| Test reports | Lab test data for PVC/PETG | To be confirmed |
| Spec sheet PDFs | Formatted product data sheets | Need to create |

---

**Owner confirmed (2026-03-30):**
1. P0/P1/P2 priority confirmed. P0 items are pre-launch finishing work.
2. No content emphasis issues flagged.
3. Equipment specs to be provided later (not blocking current phase, blocks Ring 3 equipment page content).
