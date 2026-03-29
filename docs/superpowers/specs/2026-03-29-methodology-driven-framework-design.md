# Methodology-Driven Website Construction Framework

> Design spec for a systematic, methodology-backed approach to building B2B industrial/manufacturing/trade websites.
> First instance: Tianze Pipe (tianze-website). Framework is reusable for same-category projects.

**Date**: 2026-03-29
**Status**: Design approved, pending spec review
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

## 3. Ring 1: Core Layer

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
- Pipe line: Local distributors (with chain stores/websites), project contractors
- Equipment line: PVC pipe manufacturers who need bending capability

**Win reasons**:
- Pipes: quality + price + margin space
- Bending machines: near-zero market alternatives + technical superiority

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

**Product lines**: Pipes and bending equipment are parallel, equal weight on website

### Workbook: Brand Positioning

```
Stage: Brand Positioning

Methodology: Positioning Theory + B2B Differentiation Strategy

Prerequisites:
  - Clear target customer definition [done]
  - Competitor positioning in front of same customers [needs research]

Input (owner provides):
  - Real win/loss reasons [done]
  - Customer's own words for "why Tianze" [done]
  - Actual scope of certification gaps [done]

Execution (Claude does):
  - Produce positioning statement based on methodology
  - Produce differentiation matrix
  - Produce certification gap positioning strategy

Confirmation (owner judges):
  - Does the positioning statement match your business instinct?
  - Does the differentiation capture the real core?

Deliverable:
  - Brand positioning document (referenced by rings 2-3)

Capability compensation:
  - Claude's weakness: no firsthand knowledge of competitive landscape
  - Compensation: owner provides competitor info + research skill supplements

Assumptions to verify post-launch:
  - "End distributors convert better on website than trading companies"
  - "Transparent certification disclosure does not scare off buyers"
```

### Workbook: User Personas & Decision Chain

```
Stage: User Personas & Decision Chain

Methodology: Jobs-to-be-Done + Buyer Persona

Prerequisites:
  - Business goal defined [done]
  - Real customer data available [done -- from owner's experience]

Input (owner provides):
  - Typical buyer profile per product line [done]
  - Stage at which buyers typically inquire [done -- already have some understanding]
  - Differences between pipe buyers and equipment buyers [done -- confirmed different]

Execution (Claude does):
  - Build detailed persona cards for each buyer type
  - Map decision chain per persona (awareness -> consideration -> decision)
  - Identify information needs at each stage

Confirmation (owner judges):
  - Do these personas feel like real people you've dealt with?

Deliverable:
  - Persona cards (pipe line: 2-3 personas, equipment line: 1-2 personas)
  - Decision chain maps per persona
```

### Workbook: Value Proposition

```
Stage: Value Proposition

Methodology: Value Proposition Canvas (Strategyzer)

Prerequisites:
  - Personas defined [this ring's output]
  - Competitive landscape understood [needs research]

Input (owner provides):
  - What customers gain from choosing Tianze vs alternatives [done]
  - What pains customers have with current suppliers [done]

Execution (Claude does):
  - Map customer jobs, pains, gains per persona
  - Map Tianze's pain relievers and gain creators
  - Produce fit analysis and value proposition statement

Deliverable:
  - Value Proposition Canvas per product line
  - One-sentence value proposition (for homepage hero)
```

---

## 4. Ring 2: Structure Layer

### Stages

| Stage | Methodology | Maturity |
|-------|-------------|----------|
| Information architecture | IA classic (Rosenfeld & Morville) + faceted classification | High |
| Content strategy | Content strategy quadrants (Halvorson) + decision stage matching | High |
| Page planning & cognitive path | AIDA / question chain / cognitive load theory | High |
| SEO information architecture | Topic cluster model + search intent matching | High |
| Multilingual content architecture | i18n content layering strategy | Medium |

### Tianze context

**Existing assets**:
- Sitemap defined (9 pages + blog)
- Page pattern spec (PAGE-PATTERNS.md)
- Product catalog structure (CATALOG-STRUCTURE.md)
- CRO evaluation across 5 prototypes
- Homepage AIDA flow validated (v3 "The Forge" and Stitch A scored highest)

**Key decision**: Homepage uses company-level narrative leading into both product lines, not product-first approach. Rationale: core differentiator (upstream equipment manufacturer) is a company-level story.

**Buyer stage**: Buyers arrive with some existing understanding -- content should prioritize comparison/decision stage over awareness/education.

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
  - Whether pipe buyer vs equipment buyer question chains differ [done -- confirmed different]
  - At what stage buyers typically inquire [done -- already have some understanding]

Execution (Claude does):
  - Draw buyer question chain for pipe line and equipment line separately
  - Map existing page content to 3-layer model
  - Identify content gaps (which layer is missing information)
  - Produce content priority ranking per page

Confirmation (owner judges):
  - Does the question chain order match your real buyer communication experience?
  - Are the content gaps consistent with your impression?

Deliverables:
  - Buyer question chain documents (one per product line)
  - Page content priority matrix
  - Content gap list (with required assets marked)

Capability compensation:
  - Claude's weakness: doesn't know at which exact stage buyers send inquiries
  - Compensation: owner judges based on Alibaba inquiry experience +
    post-launch GA4 landing page data validates

Assumptions to verify post-launch:
  - "Pipe buyers look at certifications before price"
  - "Equipment buyers enter website with clear intent"
```

### Workbook: Information Architecture -- Dual Product Line

```
Stage: Information Architecture -- Dual Product Line Parallel Structure

Methodology: IA faceted classification + task-oriented navigation

Prerequisites:
  - Two product lines parallel, different customers [confirmed]
  - Each line's buyer question chain drawn [this ring's output]

Input (owner provides):
  - Whether pipe and equipment buyers overlap in the same company [to be confirmed]
  - Whether cross-guidance needed (pipe viewer -> equipment, vice versa) [to be confirmed]

Execution (Claude does):
  - Design dual-line parallel navigation structure
  - Plan independent content depth layering per line
  - Ensure both lines share brand trust assets (about page, certifications, factory capability)

Deliverables:
  - Updated sitemap (dual-line structure)
  - Navigation scheme (main nav + per-line sub-nav)
```

### Workbook: SEO Information Architecture

```
Stage: SEO Information Architecture

Methodology: Topic Cluster Model + Search Intent Matching

Prerequisites:
  - Page planning completed [this ring's output]
  - Target markets prioritized [done: Australia, North America, Southeast Asia]

Input (owner provides):
  - Alibaba backend hot search term data (if available)

Execution (Claude does):
  - Research keyword opportunities for both product lines
  - Design topic clusters (pillar pages + sub-pages + blog articles)
  - Match search intent to each page
  - Plan Schema structured data

Deliverables:
  - Keyword strategy document
  - Topic cluster map
  - Per-page SEO metadata template
```

---

## 5. Ring 3: Expression Layer

### Stages

| Stage | Methodology | Maturity |
|-------|-------------|----------|
| Visual design system | Design principles + industrial visual language | High (system exists) |
| Page visual design | Visual hierarchy theory + attention path design | High |
| Copywriting strategy | Conversion copy frameworks (PAS/AIDA/BAB) + B2B principles | High |
| Copywriting execution | Verifiable info > self-assessment + results-first | High |
| Conversion path design | CRO methodology (funnel + friction elimination + trust ladder) | High |
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
  - Confirm core selling point ranking per product line
  - Confirm certification expression comfort boundary (how far can we go)

Execution (Claude does -- via /cwf workflow):
  - Produce copy framework per page (heading hierarchy + module copy)
  - Adapt copy tone separately for pipe line and equipment line
  - Certification expression proposal (2-3 specific wording options)
  - All copy follows "verifiable > self-assessment" principle

Confirmation (owner judges):
  - Does the copy read like "something our company would say"?
  - Does the certification expression feel honest without being weak?

Deliverables:
  - Per-page copy documents (Chinese + English)
  - Copy style guide (for future content reuse)

Capability compensation:
  - Claude's weakness: lacks industrial sector language intuition
  - Compensation: reference Swagelok etc. benchmark copy patterns +
    owner calibrates "does this sound credible in the industry"
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
  - Define processing standards per asset type (background, lighting, framing)
  - Determine balance: professional enhancement vs factory-authentic feel
  - Create processing brief for each asset type

Confirmation (owner judges):
  - Do processed samples feel right for the brand?

Deliverables:
  - Asset processing guidelines document
  - Sample processed images for approval before batch processing
```

---

## 6. Ring 4: Implementation Layer

### Stages

| Stage | Methodology | Maturity |
|-------|-------------|----------|
| Frontend development | BDD -> TDD, Server Components First | High (fully established) |
| SEO technical implementation | Technical SEO checklist + structured data + topic clusters | High |
| SEO content implementation | Search intent matching + keyword strategy + GEO optimization | High |
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

**Primary gaps**: SEO keyword strategy and asset processing pipeline.

### Workbook: SEO Content Strategy

```
Stage: SEO Content Strategy

Methodology: Topic Cluster + Search Intent Matching + GEO Optimization

Prerequisites:
  - Ring 2 page planning confirmed
  - Ring 3 copy strategy confirmed
  - Target markets prioritized [done: Australia, North America, Southeast Asia]

Input (owner provides):
  - Alibaba backend hot search data (if available)

Execution (Claude does):
  - Research keyword opportunities for both product lines
  - Design topic clusters (pillar page + child pages + blog articles)
  - Match search intent per page with target keywords
  - Schema structured data plan

Deliverables:
  - Keyword strategy document
  - Topic cluster map
  - Per-page SEO metadata template
```

### Frontend Development (existing methodology -- interface only)

```
Stage: Frontend Development

Methodology: brainstorming -> BDD spec -> writing-plans -> TDD -> /review -> /pr

Interface with this framework:
  - Input: Ring 3 deliverables (design mockups + copy documents)
  - /dwf produces designs -> brainstorming converts to requirements
  - /cwf produces copy -> directly fills into pages
  - Development process fully driven by existing workflow, no additional methodology needed

No workbook needed -- reuse existing workflow.
```

---

## 7. Ring 5: Operations Layer

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

Assumption checklist (collected from all rings):
  - "End distributors convert better on website than trading companies"
  - "Transparent certification disclosure does not scare off buyers"
  - "Pipe buyers look at certifications before price"
  - "Equipment buyers enter website with clear intent"
  - "Homepage company narrative -> product line routing" path is effective

Execution (Claude does):
  - Define verification metric and data source per assumption
  - Deploy corresponding GA4 event tracking
  - Periodic analysis report (monthly)
  - Propose iteration suggestions based on data

Confirmation (owner judges):
  - Does data align with your business sense?
  - Are iteration suggestions worth the investment?

Deliverables:
  - Assumption verification tracking table
  - Monthly data brief (business language, not technical report)
  - Iteration priority ranking
```

### Workbook: Inquiry Quality Analysis

```
Stage: Inquiry Quality Analysis

Methodology: Inquiry Scoring Model + Source Attribution

Execution (Claude does):
  - Build inquiry scoring criteria (target customer match + need clarity)
  - Track inquiry sources (Google organic / Google Ads / Alibaba overflow / direct / referral)
  - Analyze which pages and content drive high-quality inquiries

Confirmation (owner judges):
  - Does inquiry scoring criteria match your business judgment?
  - Feed follow-up results back to refine scoring model

Deliverables:
  - Inquiry scoring template
  - Channel effectiveness comparison (website vs Alibaba)
```

---

## 8. Execution Sequence

### Phase 1: Foundation (Rings 1-2)

Using `dispatching-parallel-agents` for methodology research across domains, followed by owner business truth input.

| Step | Ring | Stage | Depends on | Skill/workflow |
|------|------|-------|------------|----------------|
| 1.1 | 1 | Brand positioning | -- | brainstorming |
| 1.2 | 1 | User personas | 1.1 | brainstorming |
| 1.3 | 1 | Value proposition | 1.1, 1.2 | brainstorming |
| 1.4 | 2 | Buyer question chains (x2) | 1.2 | parallel-agents |
| 1.5 | 2 | Information architecture | 1.4 | brainstorming |
| 1.6 | 2 | Content strategy | 1.4, 1.5 | content-strategy skill |
| 1.7 | 2 | SEO IA | 1.6 | parallel-agents research |

### Phase 2: Expression (Ring 3)

Methodology-driven design and copy production.

| Step | Ring | Stage | Depends on | Skill/workflow |
|------|------|-------|------------|----------------|
| 2.1 | 3 | Trust building system | Phase 1 | brainstorming |
| 2.2 | 3 | Copywriting strategy | Phase 1, 2.1 | /cwf |
| 2.3 | 3 | Conversion path design | 2.1, 2.2 | page-cro skill |
| 2.4 | 3 | Page visual design | 2.2, 2.3 | /dwf |
| 2.5 | 3 | Asset processing | Phase 1 | parallel with 2.1-2.4 |

### Phase 3: Implementation (Ring 4)

Existing development workflow takes over.

| Step | Ring | Stage | Depends on | Skill/workflow |
|------|------|-------|------------|----------------|
| 3.1 | 4 | SEO keyword strategy | 1.7 | parallel-agents research |
| 3.2 | 4 | Page development | Phase 2 | brainstorming -> BDD -> TDD |
| 3.3 | 4 | SEO implementation | 3.1, 3.2 | schema-markup skill |
| 3.4 | 4 | Performance optimization | 3.2 | Lighthouse CI |
| 3.5 | 4 | Deployment verification | 3.2-3.4 | Cloudflare layered verification |

### Phase 4: Operations (Ring 5)

Post-launch, ongoing.

| Step | Ring | Stage | Depends on | Skill/workflow |
|------|------|-------|------------|----------------|
| 4.1 | 5 | GA4 + event tracking setup | 3.5 (launch) | analytics-tracking skill |
| 4.2 | 5 | Assumption verification | 4.1 + 30 days data | monthly analysis |
| 4.3 | 5 | Inquiry quality analysis | live inquiries | ongoing |
| 4.4 | 5 | Content iteration | 4.2, 4.3 | data-driven prioritization |

---

## 9. Workbook Unit Template

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
  - [what to evaluate, in business language]

Deliverables:
  - [concrete outputs that feed into subsequent stages]

Capability compensation:
  - Claude's weakness: [honest assessment]
  - Compensation: [how to mitigate]

Assumptions to verify post-launch:
  - [hypotheses that cannot be confirmed until real data exists]
```

---

## 10. Case Study Phase (Final Step)

After rings 1-3 produce their deliverables, before ring 4 implementation:

**Benchmark analysis** using `dispatching-parallel-agents`:

| Reference type | Examples | Purpose |
|---------------|----------|---------|
| Same-industry | Swagelok, Georg Fischer, Aliaxis | B2B industrial site structure, trust signals, content depth |
| Cross-industry excellence | Linear, Vercel | Modern digital craft, visual precision, interaction quality |
| Direct competitors | Top Alibaba PVC conduit suppliers with independent sites | Identify gaps and differentiation opportunities |

Case studies are used to **calibrate and supplement**, not to copy. Specific calibration targets:
- Copy tone benchmark (how do top industrial sites express certification, capability, differentiation?)
- Trust signal deployment patterns (where do they place what?)
- Conversion path patterns (how many clicks to inquiry?)
- Visual quality bar (what level of polish is table-stakes in the industry?)

---

## 11. Framework Reusability

This framework is designed for B2B industrial/manufacturing/trade websites. To reuse for a new project:

1. **Ring 1**: Replace business truths (personas, value proposition, competitive landscape)
2. **Ring 2**: Rebuild question chains and IA for new product/industry
3. **Ring 3**: Adapt expression to new brand personality and trust situation
4. **Ring 4**: Reuse technical methodology as-is (BDD/TDD, SEO, performance)
5. **Ring 5**: Reuse operations methodology, replace assumption checklist

The concentric ring structure, workbook template, and capability compensation model remain constant across projects.
