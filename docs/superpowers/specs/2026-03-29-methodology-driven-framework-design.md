# Methodology-Driven Website Construction Framework

> Design spec for a systematic, methodology-backed approach to building B2B industrial/manufacturing/trade websites.
> First instance: Tianze Pipe (tianze-website). Framework is reusable for same-category projects.

**Date**: 2026-03-29
**Status**: Design approved, spec review v2
**Scope**: Full-chain methodology framework (strategy to post-launch operations)

---

## 1. Problem Statement

### What we're solving

Tianze has strong products (quality validated by market, bending machines near-monopoly) but near-zero marketing capability. The website needs to reach ideal end customers (distributors, contractors, manufacturers) directly, bypassing trading companies.

Building each page ad-hoc produces inconsistent quality. A methodology-driven framework ensures every stage has a proven approach, explicit prerequisites, and clear accountability.

### Success criteria

- Every stage of website construction has an identified methodology with documented prerequisites
- Each methodology is adapted to B2B industrial/manufacturing/trade context (not generic SaaS)
- The framework is executable: each stage specifies inputs, execution, confirmation, and deliverables
- Assumptions that cannot be validated pre-launch are explicitly tracked for post-launch data verification

---

## 2. Framework Architecture: Concentric Rings

The framework uses a 5-ring concentric model where each ring depends on the inner ring's outputs.

```
Ring 5: Operations Layer     (post-launch optimization)
Ring 4: Implementation Layer (development, SEO, performance)
Ring 3: Expression Layer     (visual design, copywriting, conversion, trust)
Ring 2: Structure Layer      (information architecture, content strategy, page planning)
Ring 1: Core Layer           (business strategy, brand positioning, user personas)
```

### Why concentric rings

- **Dependency is explicit**: each ring's methodology prerequisites are the inner ring's deliverables
- **Participation gradient**: inner rings need more business owner input, outer rings are more execution-driven
- **Feedback loops have a path**: outer ring discoveries can feed back to inner ring corrections
- **Reusable**: same structure applies to any B2B industrial site; only ring contents differ

### Owner participation model

| Ring | Layer | Owner involvement |
|------|-------|-------------------|
| 1 | Core | **High** -- business decisions, market knowledge |
| 2 | Structure | **Medium** -- confirm question chains and page logic |
| 3 | Expression | **Medium** -- calibrate tone and honesty boundaries |
| 4 | Implementation | **Low** -- confirm market priorities |
| 5 | Operations | **Medium** -- feed back business-side observations |

---

## 3. Business Line Taxonomy

Tianze has **three independent business lines**, confirmed by owner:

```
Tianze Pipe (company level)
|
+-- Pipes (管道)
|   +-- PVC Conduit Fittings - Australian Standard (AS/NZS)
|   +-- PVC Conduit Fittings - North American Standard (ASTM/UL651)
|   +-- PVC Conduit Fittings - Southeast Asian Standards
|   +-- PETG Pneumatic Tubes (气动物流管)
|
+-- Equipment (设备)
|   +-- Bending Machines (弯管机)
|
+-- Custom Molds (定制模具)
    +-- OEM / Custom Manufacturing
```

### Buyer profiles per line

| Line | Primary buyer | Decision drivers |
|------|--------------|-----------------|
| Pipes - PVC conduit | Local distributors (chain stores), project contractors | Standards compliance, price, certifications, shipping |
| Pipes - PETG pneumatic | Hospital/lab system integrators | Transparency, seal quality, custom specs |
| Equipment | PVC pipe manufacturers expanding to bends | ROI, technical capability, market scarcity |
| Custom molds | OEM customers needing private-label production | Mold development capability, MOQ flexibility, brand references |

### Existing project structure alignment

| Business line | Current URL path | Status | Note |
|--------------|-----------------|--------|------|
| PVC conduit | `/products`, `/products/[market]` | Implemented (North America first) | Aligns with taxonomy |
| PETG pneumatic | Under `/products` | Partially implemented | Needs dedicated sub-section |
| Bending machines | `/capabilities/bending-machines/` | Implemented | Current path frames as "capability" not "product" -- **needs reconciliation**: owner confirmed this is a sellable product line, not just a trust signal |
| Custom molds | `/oem-custom-manufacturing/` | Implemented | Aligns with taxonomy |

**Action**: Ring 2 IA workbook must reconcile bending machine URL structure with its status as an independent sellable product line.

---

## 4. Ring 1: Core Layer

### Stages

| Stage | Methodology | Maturity |
|-------|-------------|----------|
| Business goal definition | Conversion Goal Framework | High |
| Brand positioning | Positioning Theory (Ries/Trout) + B2B differentiation | High |
| User personas & decision chain | Jobs-to-be-Done + Buyer Persona | High |
| Competitive analysis | Competition matrix + alternative analysis | Medium |
| Value proposition | Value Proposition Canvas (Strategyzer) | High |

### Tianze context (validated business truths)

**Target customers (ideal, not current)**:
- PVC conduit: Local distributors (with chain stores/websites), project contractors
- PETG pneumatic: Hospital/lab system integrators
- Equipment: PVC pipe manufacturers who need bending capability
- Custom molds: OEM customers needing private-label production

**Win reasons**:
- Pipes: quality + price + margin space
- Bending machines: near-zero market alternatives + technical superiority
- Custom molds: in-house mold development, low MOQ

**Loss reasons**:
- Missing certifications (industry door-opener)
- Insufficient understanding of customer needs

**Acquisition channels**:
- Current (trading companies): 1688, Alibaba International
- Ideal: Google organic/ads, referrals from existing customers

**Top buyer questions**: Certifications, price, shipping methods

**Certification positioning strategy**:
- Technology meets all certification standards
- Australian certification in progress
- Other regions planned or available for cooperative application
- Positioning: "We meet the standards. Certification is underway." -- honest, not evasive

**Priority markets**: Australia > North America > Southeast Asia
- Note: North America implementation is most advanced (PR #41 completed). Australia is the strategic priority. These are different -- "build next" vs "already built."

### Workbook: Business Goal Definition

```
Stage: Business Goal Definition

Methodology: Conversion Goal Framework
  - Primary conversion: inquiry submission (quote request, sample request, technical consultation)
  - Secondary conversion: spec sheet download, certification status view
  - Micro-conversion: page depth, time on product pages, return visits

Prerequisites:
  - Business owner available to confirm goals [done]

Input (owner provides):
  - Primary business goal for the website [done: high-quality inquiry generation]
  - Conversion action definition [done: inquiry form + WhatsApp]
  - How to distinguish high-quality from low-quality inquiries [done: target customer match + need clarity]

Execution (Claude does):
  - Define conversion goal hierarchy (primary / secondary / micro)
  - Define measurable success metrics per goal
  - Map each goal to specific page types

Confirmation (owner judges):
  - Does the goal hierarchy reflect your actual business priorities?
  - Are the metrics something you can observe in practice?

Deliverables:
  - Conversion goal document with metrics
  - Goal-to-page mapping table

Capability compensation:
  - Claude's weakness: cannot judge which inquiry types convert to actual orders
  - Compensation: owner provides feedback loop post-launch (which inquiries became deals)

Assumptions to verify post-launch:
  - "Inquiry form submissions have higher close rate than WhatsApp contacts"
  - "Spec sheet downloads indicate serious buyer intent"
```

### Workbook: Brand Positioning

```
Stage: Brand Positioning

Methodology: Positioning Theory + B2B Differentiation Strategy

Prerequisites:
  - Clear target customer definition [done]
  - Competitor positioning in front of same customers [needs competitive analysis -- see below]

Input (owner provides):
  - Real win/loss reasons [done]
  - Customer's own words for "why Tianze" [done]
  - Actual scope of certification gaps [done]

Execution (Claude does):
  - Produce positioning statement based on methodology
  - Produce differentiation matrix (Tianze vs trading companies vs small factories vs large manufacturers)
  - Produce certification gap positioning strategy
  - Produce positioning per business line (pipes vs equipment vs custom molds may need different angles)

Confirmation (owner judges):
  - Does the positioning statement match your business instinct?
  - Does the differentiation capture the real core?
  - Does the per-line positioning feel accurate?

Deliverables:
  - Brand positioning document (referenced by rings 2-3)
  - Per-line positioning statements

Capability compensation:
  - Claude's weakness: no firsthand knowledge of competitive landscape
  - Compensation: owner provides competitor info + do-digger research skill supplements

Assumptions to verify post-launch:
  - "End distributors convert better on website than trading companies"
  - "Transparent certification disclosure does not scare off buyers"
```

### Workbook: User Personas & Decision Chain

```
Stage: User Personas & Decision Chain

Methodology: Jobs-to-be-Done + Buyer Persona

Prerequisites:
  - Business goal defined [this ring's output]
  - Real customer data available [done -- from owner's experience]

Input (owner provides):
  - Typical buyer profile per business line [done]
  - Stage at which buyers typically inquire [done -- already have some understanding]
  - Differences between pipe/equipment/mold buyer question chains [done -- confirmed different]

Execution (Claude does):
  - Build detailed persona cards for each buyer type
  - Map decision chain per persona (awareness -> consideration -> decision)
  - Identify information needs at each stage
  - Cross-reference with product-marketing-context.md personas and reconcile

Confirmation (owner judges):
  - Do these personas feel like real people you've dealt with?
  - Is anything missing that you encounter in actual buyer conversations?

Deliverables:
  - Persona cards per line:
    - PVC conduit: distributor persona, contractor persona
    - PETG pneumatic: system integrator persona
    - Equipment: pipe manufacturer persona
    - Custom molds: OEM buyer persona
  - Decision chain maps per persona

Capability compensation:
  - Claude's weakness: cannot distinguish between what buyers say they want and what actually drives their decision
  - Compensation: owner's experience with real deal patterns + post-launch inquiry content analysis

Assumptions to verify post-launch:
  - "Persona segmentation matches actual inquiry distribution"
  - "Decision chain stages match actual page visit sequences (observable via GA4 flow)"
```

### Workbook: Competitive Analysis

```
Stage: Competitive Analysis

Methodology: Competition Matrix + Alternative Analysis

Prerequisites:
  - Target customers defined [this ring's output]
  - Business lines defined [done -- Section 3]

Input (owner provides):
  - Names of known competitors (domestic manufacturers with export sites)
  - Which competitors buyers mention during negotiations
  - Where Tianze wins vs loses against specific competitors

Execution (Claude does -- via do-digger research skill):
  - Audit competitor websites (structure, content, trust signals, conversion paths)
  - Map competitor positioning matrix (price vs quality vs customization vs certifications)
  - Identify competitive gaps Tianze can exploit
  - Identify competitive strengths Tianze must defend

Confirmation (owner judges):
  - Is the competitive landscape map accurate to your experience?
  - Are there competitors missing from the analysis?

Deliverables:
  - Competitive landscape matrix
  - Competitor website audit summary (structure, strengths, weaknesses)
  - Differentiation opportunity map

Capability compensation:
  - Claude's weakness: can only see what's publicly visible on competitor websites
  - Compensation: owner provides deal-level competitive intelligence (who loses to whom, and why)

Assumptions to verify post-launch:
  - "Tianze's differentiation (equipment manufacturer background) is not claimed by competitors"
```

### Workbook: Value Proposition

```
Stage: Value Proposition

Methodology: Value Proposition Canvas (Strategyzer)

Prerequisites:
  - Personas defined [this ring's output]
  - Competitive landscape understood [this ring's output -- competitive analysis]

Input (owner provides):
  - What customers gain from choosing Tianze vs alternatives [done]
  - What pains customers have with current suppliers [done]

Execution (Claude does):
  - Map customer jobs, pains, gains per persona
  - Map Tianze's pain relievers and gain creators
  - Produce fit analysis and value proposition statement per business line
  - Produce unified company-level value proposition (for homepage hero)

Confirmation (owner judges):
  - Does the value proposition feel like the real reason customers choose you?
  - Is the company-level statement something you'd be proud to put on a billboard?

Deliverables:
  - Value Proposition Canvas per business line
  - One-sentence company-level value proposition (for homepage hero)
  - Per-line value proposition statements

Capability compensation:
  - Claude's weakness: may over-intellectualize value proposition; real B2B decisions often come down to simpler factors
  - Compensation: owner gut-checks against "what actually closes deals"

Assumptions to verify post-launch:
  - "Company-level value proposition resonates more than product-line-level propositions"
```

---

## 5. Ring 2: Structure Layer

### Stages

| Stage | Methodology | Maturity |
|-------|-------------|----------|
| Information architecture | IA classic (Rosenfeld & Morville) + faceted classification | High |
| Content strategy | Content strategy quadrants (Halvorson) + decision stage matching | High |
| Page planning & cognitive path | AIDA / question chain / cognitive load theory | High |
| SEO information architecture | Topic cluster model + search intent matching | High |
| Multilingual content architecture | i18n content layering strategy | Medium |
| Legal/compliance content | Privacy, terms, export compliance, cookie consent | High |
| Content inventory & gap analysis | Existing content audit + gap identification | High |

### Tianze context

**Existing assets**:
- Sitemap defined (9 pages + blog)
- Page pattern spec (PAGE-PATTERNS.md)
- Product catalog structure (CATALOG-STRUCTURE.md)
- CRO evaluation across 5 prototypes
- Homepage AIDA flow validated (v3 "The Forge" and Stitch A scored highest)

**Key decision**: Homepage uses company-level narrative leading into three business lines, not product-first approach. Rationale: core differentiator (upstream equipment manufacturer) is a company-level story that serves all three lines.

**Buyer stage**: Buyers arrive with some existing understanding -- content should prioritize comparison/decision stage over awareness/education. Exception: some Google top-of-funnel traffic may be awareness-stage.

### Workbook: Content Strategy -- Decision Stage Matching

```
Stage: Content Strategy -- Decision Stage Matching

Methodology: Buyer question chain + 3-layer cognitive model
  - Layer 1 (Awareness): What is this, what's it for
  - Layer 2 (Comparison): How is it different from alternatives
  - Layer 3 (Decision): Why trust, how to start

Prerequisites:
  - Ring 1 personas and value proposition defined
  - Buyer real high-frequency questions collected [done: certifications -> price -> shipping]

Input (owner provides):
  - Confirm that question chains differ across business lines [done]
  - At what stage buyers typically inquire [done -- already have some understanding]

Execution (Claude does):
  - Draw buyer question chain for each business line separately
  - Map existing page content to 3-layer model
  - Identify content gaps (which layer is missing information)
  - Produce content priority ranking per page

Confirmation (owner judges):
  - Does the question chain order match your real buyer communication experience?
  - Are the content gaps consistent with your impression?

Deliverables:
  - Buyer question chain documents (one per business line)
  - Page content priority matrix
  - Content gap list (with required assets marked)

Capability compensation:
  - Claude's weakness: doesn't know at which exact stage buyers send inquiries
  - Compensation: owner judges based on Alibaba inquiry experience +
    post-launch GA4 landing page data validates

Assumptions to verify post-launch:
  - "Pipe buyers look at certifications before price"
  - "Equipment buyers enter website with clear intent"
  - "Some Google traffic arrives at awareness stage, requiring different content depth than direct/referral traffic"
```

### Workbook: Information Architecture -- Three Business Lines

```
Stage: Information Architecture -- Three Business Lines

Methodology: IA faceted classification + task-oriented navigation

Prerequisites:
  - Three business lines defined [done -- Section 3]
  - Each line's buyer question chain drawn [this ring's output]

Input (owner provides):
  - Whether any buyer types overlap across lines (e.g., a distributor buying both pipes and molds) [to be confirmed]
  - Whether cross-guidance needed between lines [to be confirmed]

Execution (Claude does):
  - Design three-line navigation structure
  - Reconcile bending machine URL path (/capabilities/ -> /equipment/ or /products/equipment/)
  - Plan independent content depth layering per line
  - Ensure all lines share brand trust assets (about page, certifications, factory capability)
  - Produce content inventory audit: what exists, what needs updating, what needs creating

Confirmation (owner judges):
  - Does the navigation make sense from a buyer's perspective?
  - Is the bending machine repositioning (from capability to product) correct?

Deliverables:
  - Updated sitemap (three-line structure)
  - Navigation scheme (main nav + per-line sub-nav)
  - Content inventory and gap audit
  - URL restructuring plan (if bending machine path changes)

Capability compensation:
  - Claude's weakness: IA decisions are hard to validate without real user behavior data
  - Compensation: benchmark against competitor site structures + post-launch navigation flow analysis

Assumptions to verify post-launch:
  - "Three-line parallel structure does not confuse buyers who come for one specific product"
  - "Buyers do not need cross-guidance between lines (pipe buyer doesn't care about equipment)"
```

### Workbook: SEO Information Architecture

```
Stage: SEO Information Architecture

Methodology: Topic Cluster Model + Search Intent Matching

Prerequisites:
  - Page planning completed [this ring's output]
  - Target markets prioritized [done: Australia > North America > Southeast Asia]

Input (owner provides):
  - Alibaba backend hot search term data (if available)

Execution (Claude does):
  - Research keyword opportunities per business line and market
  - Design topic clusters (pillar pages + sub-pages + blog articles)
  - Match search intent to each page
  - Define which pages target which markets

Deliverables:
  - Keyword opportunity research (strategic -- what to target)
  - Topic cluster map (which pages support which clusters)
  - Search intent classification per page

Note: Technical SEO implementation (Schema markup, metadata templates, sitemap config)
is Ring 4's responsibility. This stage produces the strategic plan; Ring 4 implements it.

Capability compensation:
  - Claude's weakness: keyword research tools are limited without paid SEO tool access
  - Compensation: do-digger research + Alibaba data from owner + Google Search Console data post-launch

Assumptions to verify post-launch:
  - "Topic cluster structure improves ranking for target keywords"
  - "Blog content drives meaningful organic traffic in B2B industrial niche"
```

### Workbook: Multilingual Content Architecture

```
Stage: Multilingual Content Architecture

Methodology: i18n Content Layering Strategy

Prerequisites:
  - Content strategy defined [this ring's output]
  - Target markets prioritized [done]

Input (owner provides):
  - Which content truly needs localization vs translation
  - Whether Chinese content serves domestic customers or overseas Chinese-speaking buyers

Execution (Claude does):
  - Define content layering: shared content (both languages) vs market-specific content
  - Determine translation scope per page (full translation vs partial)
  - Define glossary for consistent technical term translation
  - Plan market-specific content (e.g., Australian standard details only for en, not zh)

Confirmation (owner judges):
  - Does the translation priority match business value?

Deliverables:
  - Multilingual content matrix (page x language x scope)
  - Translation glossary (technical terms)
  - Market-specific content plan

Capability compensation:
  - Claude's weakness: may not know which B2B industrial terms have established translations vs need new coinage
  - Compensation: owner reviews technical term translations + reference competitor multilingual sites
```

### Workbook: Legal/Compliance Content

```
Stage: Legal/Compliance Content Planning

Methodology: B2B export website compliance checklist

Prerequisites:
  - Target markets defined [done: Australia, North America, Southeast Asia]

Execution (Claude does):
  - Audit existing legal pages (privacy, terms -- both exist)
  - Identify gaps: cookie consent (GDPR if EU traffic), export compliance statements
  - Plan trust-relevant compliance content (certifications page, standards compliance page)

Deliverables:
  - Legal content gap list
  - Compliance content plan (what needs creating/updating)
```

---

## 6. Ring 3: Expression Layer

### Stages

| Stage | Methodology | Maturity |
|-------|-------------|----------|
| Visual design system | Design principles + industrial visual language | High (system exists) |
| Page visual design | Visual hierarchy theory + attention path design | High |
| Copywriting strategy | Conversion copy frameworks (PAS/AIDA/BAB) + B2B principles | High |
| Copywriting execution | Verifiable info > self-assessment + results-first | High |
| Conversion path design | CRO methodology (funnel + friction elimination + trust ladder) | High |
| Inquiry form design | Form optimization methodology + lead qualification | High |
| Trust building system | Trust signal hierarchy (Social Proof Hierarchy) | High |
| Asset processing strategy | Product photography + industrial visual standards | Medium |

### Tianze context

**Existing assets**:
- Complete design system (tokens, grid, motion, page patterns)
- Brand personality defined: Precise. Substantial. Trustworthy.
- Multiple homepage prototypes evaluated with CRO scores
- Brand voice defined in product-marketing-context.md
- `/cwf` (copywriting workflow) and `/dwf` (design workflow) ready

### Workbook: Copywriting Strategy -- B2B Industrial Conversion Copy

```
Stage: Copywriting Strategy -- B2B Industrial Conversion Copy

Methodology:
  - PAS (Problem-Agitate-Solve) for pain-point-driven pages
  - "Verifiable information replaces self-assessment" principle
  - "Results before process" principle
  - B2B copy golden rule: use buyer language, not seller language

Prerequisites:
  - Ring 1 brand voice defined [done]
  - Ring 2 buyer question chain drawn [this framework's output]
  - Buyer actual vocabulary collected [done -- product-marketing-context.md]

Input (owner provides):
  - Confirm core selling point ranking per business line
  - Confirm certification expression comfort boundary (how far can we go)

Execution (Claude does -- via /cwf workflow):
  - Produce copy framework per page (heading hierarchy + module copy)
  - Adapt copy tone for each business line:
    - Pipes: standards/specs/value language
    - Equipment: ROI/capability/scarcity language
    - Custom molds: flexibility/partnership language
  - Certification expression proposal (2-3 specific wording options)
  - All copy follows "verifiable > self-assessment" principle

Confirmation (owner judges):
  - Does the copy read like "something our company would say"?
  - Does the certification expression feel honest without being weak?
  - Does each business line's copy tone feel distinct but on-brand?

Deliverables:
  - Per-page copy documents (Chinese + English)
  - Copy style guide (for future content reuse)

Capability compensation:
  - Claude's weakness: lacks industrial sector language intuition
  - Compensation: reference Swagelok etc. benchmark copy patterns +
    owner calibrates "does this sound credible in the industry"

Assumptions to verify post-launch:
  - "Verifiable claims convert better than aspirational statements"
  - "Per-line tone differences don't fragment the brand experience"
```

### Workbook: Page Visual Design

```
Stage: Page Visual Design

Methodology: Visual hierarchy theory + attention path design
  - First glance (0-3s): page subject clear
  - Scan (3-10s): know what to do next
  - Engage (10-30s): find relevant detail
  - Act: CTA naturally follows comprehension

Prerequisites:
  - Ring 2 page planning and content priority defined
  - Ring 3 copy framework defined
  - Design system exists [done]

Execution (Claude does -- via /dwf workflow):
  - Design attention path per page type
  - Apply visual hierarchy to content priority (from Ring 2)
  - Ensure design system consistency across all pages
  - Produce page-by-page design specs

Confirmation (owner judges):
  - Within 3 seconds of seeing the page, is the subject clear?
  - Does the page feel trustworthy and professional?
  - Can you find the "next step" action without hunting?

Deliverables:
  - Per-page visual design specs (for development)
  - Attention path diagrams

Capability compensation:
  - Claude's weakness: aesthetic judgment limited to principles; cannot "feel" visual impact like a human
  - Compensation: owner gut-check + benchmark comparison against reference sites (Swagelok, Linear)
```

### Workbook: Trust Building System -- Certification Adaptation

```
Stage: Trust Building System -- Certification Special Case Adaptation

Methodology: Trust Signal Hierarchy
  - Level 1: Third-party certifications (strongest, but Tianze partially missing)
  - Level 2: Verifiable facts (factory scale, export data, equipment photos)
  - Level 3: Customer testimonials
  - Level 4: Process transparency (production process visible, QC standards public)
  - Level 5: Commitment mechanisms (free samples, factory visit welcome)

Tianze adaptation strategy:
  Certification gap compensated by Level 2-5 trust signals.

  Core logic:
  - "Technology meets standards" proven by verifiable facts (test data, standards comparison table)
  - "Certification in progress" shown through transparent timeline
  - "Cooperative application" backed by commitment mechanism

  Specific approach:
  - Display existing certifications (ISO 9001) + in-progress certifications (Australian standard)
  - Use technical parameters to prove "standards-compliant" (test data, standards comparison)
  - Provide factory visit invitation, sample trials to reduce perceived risk
  - No evasion, no exaggeration -- let facts enable buyer's own judgment

Deliverables:
  - Trust signal deployment plan (which signal on which page)
  - Certification expression template (reusable across product pages, about page, homepage)

Capability compensation:
  - Claude's weakness: cannot gauge how much weight real buyers give to each trust signal type
  - Compensation: owner's deal experience (what tips buyers over the edge) + post-launch inquiry correlation

Assumptions to verify post-launch:
  - "Transparent certification timeline does not reduce inquiry rate"
  - "Level 2-5 signals adequately compensate for Level 1 gaps"
```

### Workbook: Conversion Path Design

```
Stage: Conversion Path Design

Methodology: CRO Funnel + Friction Elimination + Multi-tier CTA

Tianze adaptation:
  Buyers have some existing understanding (Ring 2 confirmed),
  so conversion paths should be short, not long.

  CTA tiers:
  - Low barrier: Download spec sheet / View certification status
  - Medium barrier: Request free samples (existing "ships in 3 days" promise)
  - High barrier: Submit inquiry / Book technical consultation

  Rules:
  - Every page has at least one medium/high-barrier CTA
  - Inquiry form reachable within 2 clicks from any page
  - CTA copy uses result language, not action language
    ("Get Your Custom Quote" not "Submit Form")

Deliverables:
  - CTA deployment matrix (page x CTA tier)
  - Conversion path flowchart

Capability compensation:
  - Claude's weakness: CTA wording effectiveness requires real conversion data to validate
  - Compensation: A/B test CTA variants post-launch (or qualitative if traffic too low)

Assumptions to verify post-launch:
  - "2-click-to-inquiry rule improves conversion vs current path length"
  - "Free sample CTA is a more effective entry point than direct inquiry"
```

### Workbook: Inquiry Form Design

```
Stage: Inquiry Form Design

Methodology: Form Optimization + Lead Qualification

Prerequisites:
  - Ring 1 personas defined (determines what information to capture)
  - Ring 2 content strategy defined (determines form context)
  - Conversion path design defined (determines where forms appear)

Input (owner provides):
  - What information do you need to qualify an inquiry? (product type, quantity, market, timeline?)
  - What information do you need to prepare a quote?
  - Is WhatsApp or email your preferred first-response channel?

Execution (Claude does):
  - Design form fields per context:
    - Quick inquiry (product page): minimal fields -- name, email, product interest, message
    - Detailed quote request (contact page): more fields -- company, market, quantity, timeline
    - Sample request: shipping address + product selection
  - Plan form routing by business line (pipe inquiries vs equipment inquiries)
  - Design auto-reply and follow-up workflow

Confirmation (owner judges):
  - Would this form capture what you need to start a conversation?
  - Is the field count acceptable (not too many, not too few)?

Deliverables:
  - Form specification per context (fields, validation, routing)
  - Auto-reply template
  - Lead qualification criteria

Capability compensation:
  - Claude's weakness: doesn't know which form fields correlate with serious vs casual inquiries
  - Compensation: owner's experience + post-launch analysis of form completion vs deal conversion

Assumptions to verify post-launch:
  - "Shorter forms get more submissions without reducing inquiry quality"
  - "Business-line routing improves response time and relevance"
```

### Workbook: Asset Processing Strategy

```
Stage: Asset Processing Strategy

Methodology: Industrial product photography standards + brand visual consistency

Prerequisites:
  - Design system tokens defined [done]
  - Brand aesthetic direction defined [done: Industrial Steel Blue + Vercel craft]

Input (owner provides):
  - Raw assets (7 types, all basically available, need enhancement)

Execution (Claude does):
  - Define processing standards per asset type:
    - Product photos: consistent background (white or light gray), proper lighting, multiple angles
    - Factory photos: authentic feel with professional color grading aligned to brand palette
    - Certificate scans: clean, high-resolution, consistently framed
    - Equipment photos: in-context (on factory floor) + isolated (product shots)
  - Determine balance: professional enhancement vs factory-authentic feel
  - Create processing brief for each asset type

Confirmation (owner judges):
  - Do sample processed images look like "our factory, but polished"?
  - Is the product detail clear enough for a buyer evaluating specs?
  - Does the overall visual quality match reference sites (Swagelok level)?

Deliverables:
  - Asset processing guidelines document
  - Sample processed images for approval before batch processing

Capability compensation:
  - Claude's weakness: limited ability to execute image processing (can specify, not perform)
  - Compensation: processing brief as input for image editing tools or contractors
```

---

## 7. Ring 4: Implementation Layer

### Stages

| Stage | Methodology | Maturity |
|-------|-------------|----------|
| Frontend development | BDD -> TDD, Server Components First | High (fully established) |
| SEO technical implementation | Technical SEO checklist + structured data | High |
| Performance optimization | Core Web Vitals + Lighthouse budget | High (gates exist) |
| i18n implementation | next-intl multilingual layering | High (system exists) |
| Deployment & verification | Cloudflare layered verification strategy | High (strategy exists) |

### Tianze context

This ring has the most mature methodology in the project:
- BDD/TDD full workflow + behavioral contracts
- 4-layer quality defense system
- Lighthouse performance budget
- Cloudflare deployment + layered verification
- i18n translation system + validation scripts
- Static truth checks + mutation testing

**Primary gap**: Asset processing pipeline (from raw photos to web-ready images).

### Workbook: SEO Technical Implementation

```
Stage: SEO Technical Implementation

Methodology: Technical SEO Checklist + Schema Structured Data

Prerequisites:
  - Ring 2 SEO IA strategy defined (keywords, topic clusters, intent mapping)
  - Ring 3 copy defined (provides content for meta descriptions)

Execution (Claude does):
  - Implement Schema markup per page type (Organization, Product, FAQ, BreadcrumbList)
  - Generate SEO metadata templates based on Ring 2 keyword strategy
  - Configure sitemap generation for three-line structure
  - Implement hreflang tags per i18n architecture

Deliverables:
  - Schema implementation per page type
  - SEO metadata for all pages
  - Technical SEO audit checklist (crawlability, indexability, speed)
```

### Frontend Development (existing methodology -- interface only)

```
Stage: Frontend Development

Methodology: brainstorming -> BDD spec -> writing-plans -> TDD -> /review -> /pr

Interface with this framework:
  - Input: Ring 3 deliverables (design specs + copy documents)
  - /dwf produces designs -> brainstorming converts to requirements
  - /cwf produces copy -> directly fills into pages
  - Development process fully driven by existing workflow, no additional methodology needed

No workbook needed -- reuse existing workflow.
```

---

## 8. Ring 5: Operations Layer

### Stages

| Stage | Methodology | Maturity |
|-------|-------------|----------|
| Data analytics | GA4 + conversion funnel analysis + heatmaps | High |
| Hypothesis verification | A/B testing + data-driven iteration | High (but low-traffic adaptation needed) |
| Content iteration | Content performance matrix (traffic x conversion rate) | Medium |
| SEO continuous optimization | Rank monitoring + content update strategy + backlink building | High |
| Inquiry quality analysis | Inquiry scoring + source attribution + follow-up loop | Medium |

### Tianze adaptation

| Adaptation | Rationale |
|------------|-----------|
| B2B industrial site traffic is normally low | Cannot use SaaS-style A/B testing. With hundreds to low thousands monthly visits, qualitative analysis (inquiry content, heatmaps, session recordings) is more practical than statistical testing |
| Inquiry quality over quantity | 1 precise inquiry > 10 junk inquiries. Metric focus: inquiry-to-quote conversion rate, not just visit-to-inquiry rate |
| Website + Alibaba dual channel | Same buyer may check Alibaba then Google, or reverse. Need cross-channel attribution thinking |
| Pre-launch assumption checklist | Must systematically verify assumptions from rings 1-4, not wait for data to emerge |

### Workbook: Hypothesis Verification & Data-Driven Iteration

```
Stage: Hypothesis Verification & Data-Driven Iteration

Methodology: Assumption list -> data collection -> verify/falsify -> iterate

Prerequisites:
  - GA4 + event tracking deployed
  - Rings 1-4 "assumptions to verify" compiled into checklist

Consolidated assumption checklist (collected from all rings):

  Ring 1:
  - "End distributors convert better on website than trading companies"
  - "Transparent certification disclosure does not scare off buyers"
  - "Tianze's differentiation (equipment manufacturer) is not claimed by competitors"
  - "Company-level value proposition resonates more than product-line-level"
  - "Persona segmentation matches actual inquiry distribution"
  - "Inquiry form submissions have higher close rate than WhatsApp contacts"
  - "Spec sheet downloads indicate serious buyer intent"
  - "Decision chain stages match actual page visit sequences (observable via GA4 flow)"

  Ring 2:
  - "Pipe buyers look at certifications before price"
  - "Equipment buyers enter website with clear intent"
  - "Some Google traffic arrives at awareness stage (different from direct/referral)"
  - "Three-line parallel structure does not confuse single-product buyers"
  - "Buyers do not need cross-guidance between business lines"
  - "Topic cluster structure improves ranking for target keywords"
  - "Blog content drives meaningful organic traffic in B2B industrial niche"

  Ring 3:
  - "Verifiable claims convert better than aspirational statements"
  - "Per-line tone differences don't fragment the brand experience"
  - "Transparent certification timeline does not reduce inquiry rate"
  - "Level 2-5 trust signals adequately compensate for Level 1 gaps"
  - "2-click-to-inquiry rule improves conversion vs current path length"
  - "Free sample CTA is more effective entry point than direct inquiry"
  - "Shorter forms get more submissions without reducing quality"
  - "Business-line routing improves response time and relevance"

Execution (Claude does):
  - Define verification metric and data source per assumption
  - Deploy corresponding GA4 event tracking
  - Periodic analysis report (monthly)
  - Propose iteration suggestions based on data

Confirmation (owner judges):
  - Does data align with your business sense?
  - Are iteration suggestions worth the investment?

Deliverables:
  - Assumption verification tracking table (with metric, data source, verification timeline per assumption)
  - Monthly data brief (business language, not technical report)
  - Iteration priority ranking
```

### Workbook: Inquiry Quality Analysis

```
Stage: Inquiry Quality Analysis

Methodology: Inquiry Scoring Model + Source Attribution

Prerequisites:
  - Inquiry form deployed with business-line routing [Ring 3/4 output]
  - GA4 source tracking configured [this ring's output]

Execution (Claude does):
  - Build inquiry scoring criteria (target customer match + need clarity + market fit)
  - Track inquiry sources (Google organic / Google Ads / Alibaba overflow / direct / referral)
  - Analyze which pages and content drive high-quality inquiries
  - Correlate inquiry quality with landing page and navigation path

Confirmation (owner judges):
  - Does inquiry scoring criteria match your business judgment?
  - Feed follow-up results back to refine scoring model

Deliverables:
  - Inquiry scoring template
  - Channel effectiveness comparison (website vs Alibaba)
  - Page-to-inquiry quality correlation report

Capability compensation:
  - Claude's weakness: cannot see what happens after inquiry (deal negotiation, conversion, repeat orders)
  - Compensation: owner feeds back deal outcomes quarterly to refine the scoring model
```

---

## 9. Execution Sequence

### Phase 1: Foundation (Rings 1-2)

Using `dispatching-parallel-agents` for methodology research across domains, followed by owner business truth input.

| Step | Ring | Stage | Depends on | Skill/workflow |
|------|------|-------|------------|----------------|
| 1.1 | 1 | Business goal definition | -- | brainstorming |
| 1.2 | 1 | Competitive analysis | -- | do-digger research |
| 1.3 | 1 | Brand positioning | 1.1, 1.2 | brainstorming |
| 1.4 | 1 | User personas | 1.3 | brainstorming |
| 1.5 | 1 | Value proposition | 1.3, 1.4 | brainstorming |
| 1.6 | 2 | Buyer question chains (x3 lines) | 1.4 | parallel-agents |
| 1.7 | 2 | Information architecture | 1.6 | brainstorming |
| 1.8 | 2 | Content strategy | 1.6, 1.7 | content-strategy skill |
| 1.9 | 2 | Multilingual content architecture | 1.8 | brainstorming |
| 1.10 | 2 | SEO IA | 1.8 | parallel-agents research |
| 1.11 | 2 | Legal/compliance audit | 1.7 | checklist |
| 1.12 | 2 | Content inventory & gap analysis | 1.7, 1.8 | parallel with 1.9-1.11 |

### Phase 2: Expression (Ring 3)

Methodology-driven design and copy production.

| Step | Ring | Stage | Depends on | Skill/workflow |
|------|------|-------|------------|----------------|
| 2.1 | 3 | Trust building system | Phase 1 | brainstorming |
| 2.2 | 3 | Copywriting strategy | Phase 1, 2.1 | /cwf |
| 2.3 | 3 | Conversion path design | 2.1, 2.2 | page-cro skill |
| 2.4 | 3 | Inquiry form design | 2.3 | form-cro skill |
| 2.5 | 3 | Page visual design | 2.2, 2.3 | /dwf |
| 2.6 | 3 | Asset processing | Phase 1 | parallel with 2.1-2.5 |

**Case study phase**: After 2.2 (copy) and before 2.5 (visual design), run benchmark analysis.

### Phase 3: Implementation (Ring 4)

Existing development workflow takes over.

| Step | Ring | Stage | Depends on | Skill/workflow |
|------|------|-------|------------|----------------|
| 3.1 | 4 | SEO technical implementation | 1.10, 2.2 | schema-markup skill |
| 3.2 | 4 | Page development | Phase 2 | brainstorming -> BDD -> TDD |
| 3.3 | 4 | Performance optimization | 3.2 | Lighthouse CI |
| 3.4 | 4 | Deployment verification | 3.2, 3.3 | Cloudflare layered verification |

### Phase 4: Operations (Ring 5)

Post-launch, ongoing.

| Step | Ring | Stage | Depends on | Skill/workflow |
|------|------|-------|------------|----------------|
| 4.1 | 5 | GA4 + event tracking setup | 3.4 (launch) | analytics-tracking skill |
| 4.2 | 5 | Assumption verification | 4.1 + 30 days data | monthly analysis |
| 4.3 | 5 | Inquiry quality analysis | live inquiries | ongoing |
| 4.4 | 5 | Content iteration | 4.2, 4.3 | data-driven prioritization |

---

## 10. Workbook Unit Template

Every stage in this framework uses this standard structure:

```
Stage: [name]

Methodology: [named methodology + brief description]

Prerequisites:
  - [what must be true/done before this stage can execute]

Input (owner provides):
  - [business truths, decisions, confirmations needed]

Execution (Claude does):
  - [specific actions taken using the methodology]

Confirmation (owner judges):
  - [what to evaluate, in business language -- be specific about what to look for]

Deliverables:
  - [concrete outputs that feed into subsequent stages]

Capability compensation:
  - Claude's weakness: [honest assessment]
  - Compensation: [how to mitigate]

Assumptions to verify post-launch:
  - [hypotheses that cannot be confirmed until real data exists]
```

---

## 11. Case Study Phase

After Ring 3 produces copy strategy (step 2.2), before page visual design (step 2.5):

**Benchmark analysis** using `dispatching-parallel-agents`:

| Reference type | Examples | Purpose |
|---------------|----------|---------|
| Same-industry | Swagelok, Georg Fischer, Aliaxis | B2B industrial site structure, trust signals, content depth |
| Cross-industry excellence | Linear, Vercel | Modern digital craft, visual precision, interaction quality |
| Direct competitors | Top PVC conduit suppliers with independent sites | Identify gaps and differentiation opportunities |

Case studies are used to **calibrate and supplement**, not to copy. Specific calibration targets:
- Copy tone benchmark (how do top industrial sites express certification, capability, differentiation?)
- Trust signal deployment patterns (where do they place what?)
- Conversion path patterns (how many clicks to inquiry?)
- Visual quality bar (what level of polish is table-stakes in the industry?)

---

## 12. Framework Reusability

This framework is designed for B2B industrial/manufacturing/trade websites. To reuse for a new project:

1. **Section 3**: Replace business line taxonomy
2. **Ring 1**: Replace business truths (personas, value proposition, competitive landscape)
3. **Ring 2**: Rebuild question chains and IA for new product/industry
4. **Ring 3**: Adapt expression to new brand personality and trust situation
5. **Ring 4**: Reuse technical methodology as-is (BDD/TDD, SEO, performance)
6. **Ring 5**: Reuse operations methodology, replace assumption checklist

The concentric ring structure, workbook template, and capability compensation model remain constant across projects.
