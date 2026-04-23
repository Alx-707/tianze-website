# Methodology Framework Phase 1: Foundation (Ring 1-2) Execution Plan

> **For agentic workers:** This is a methodology execution plan, not a code implementation plan. Each task produces a strategy document, not source code. Owner confirmation gates are mandatory -- do not proceed past a gate without explicit approval.
>
> **Tool glossary** (these are installed Claude Code superpowers skills, not external tools):
> - `dispatching-parallel-agents`: Skill that launches multiple independent subagents in parallel, each with its own context. Used when 2+ tasks have no shared state.
> - `brainstorming`: Skill for collaborative design exploration before implementation. Produces design specs through iterative Q&A.
> - `do-digger`: Subagent for deep web research. Executes multi-phase research with source verification.
> - `content-strategy`: Skill with built-in content strategy methodology (topic clusters, editorial calendars, content audits).

**Goal:** Execute Ring 1 (Core Layer) and Ring 2 (Structure Layer) of the methodology-driven framework, producing all foundational strategy documents that Ring 3 (Expression) depends on.

**Approach:** Research-draft-confirm cycle per stage. Independent stages run in parallel via subagents. Owner provides business truth input at confirmation gates. All deliverables saved to `docs/strategy/`.

**Spec reference:** `docs/superpowers/archive/specs/2026-03-29-methodology-driven-framework-design.md`

**Key context files:**
- `.claude/product-marketing-context.md` -- existing product/audience/voice definitions
- `docs/impeccable/system/sitemap.md` -- current site structure
- `docs/impeccable/products/CATALOG-STRUCTURE.md` -- product catalog structure
- `CLAUDE.md` -- project constraints and design context

---

## Pre-Task: Owner Input Collection

**Before any task begins**, collect these inputs from the owner in a single conversation. Tasks 1 and 2 both need owner input before they can truly start.

- [ ] **Collect competitor information** (needed by Task 2):
  - Which competitors do buyers mention during negotiations?
  - Any specific competitor websites you've seen?
  - Which Alibaba stores are your main competitors?

- [ ] **Confirm business goal priorities** (needed by Task 1):
  - Is inquiry form submission the #1 goal, or is there something else?
  - Which metric matters most to you personally?

Once collected, Task 1 and Task 2 can proceed in parallel.

---

## Deliverable Map

All documents produced by this plan:

```
docs/strategy/
  ring1/
    01-business-goals.md           -- Task 1
    02-competitive-analysis.md     -- Task 2
    03-brand-positioning.md        -- Task 3
    04-personas/                   -- Task 4
      pvc-distributor.md
      pvc-contractor.md
      petg-integrator.md
      equipment-manufacturer.md
      oem-buyer.md
    05-value-propositions.md       -- Task 5
  ring2/
    06-buyer-question-chains/      -- Task 6
      pvc-conduit.md
      petg-pneumatic.md
      equipment.md
      custom-molds.md
    07-information-architecture.md -- Task 7
    08-content-strategy.md         -- Task 8
    09-multilingual-architecture.md -- Task 9
    10-seo-ia.md                   -- Task 10
    11-legal-compliance-audit.md   -- Task 11
    12-content-inventory.md        -- Task 12
```

---

## Parallel Execution Map

```
Pre-Task: Owner input collection (competitor names, goal confirmation)
  |
Phase 1a (parallel, after pre-task):
  Task 1: Business Goals         ──┐
  Task 2: Competitive Analysis   ──┼── both independent, run in parallel
                                   │
Phase 1b (sequential, needs 1+2):  │
  Task 3: Brand Positioning      <─┘
  Task 4: User Personas          <── needs 3
  Task 5: Value Propositions     <── needs 3+4

  ======= OWNER GATE 1 =======
  Owner confirms Ring 1 outputs before Ring 2 begins

Phase 2a (sequential):
  Task 6: Buyer Question Chains  <── needs 4 (4 sub-lines, can be parallel)
  Task 7: Information Architecture <── needs 6

Phase 2b (parallel, needs 7+8):
  Task 8: Content Strategy       <── needs 6+7
  Task 9: Multilingual Architecture <── needs 8
  Task 10: SEO IA                <── needs 8 (parallel with 9)
  Task 11: Legal/Compliance      <── needs 7 (parallel with 9,10)
  Task 12: Content Inventory     <── needs 7+8 (parallel with 9,10,11)

  ======= OWNER GATE 2 =======
  Owner confirms Ring 2 outputs before Phase 2 (Ring 3) begins
```

---

## Task 1: Business Goal Definition

**Deliverable:** `docs/strategy/ring1/01-business-goals.md`
**Methodology:** Conversion Goal Framework
**Skill:** None (direct analysis)
**Depends on:** Pre-Task owner input
**Parallel with:** Task 2

- [ ] **Step 1: Review existing goal definitions**

Read `product-marketing-context.md` Section "Goals" and `CLAUDE.md` Section "Project > Goal". Extract current goal statements and identify gaps.

- [ ] **Step 2: Draft conversion goal hierarchy**

Produce document with:
- Primary conversion: inquiry form submission (quote request, sample request, technical consultation)
- Secondary conversion: spec sheet download, certification status view, WhatsApp contact
- Micro-conversion: product page depth >2, return visit within 7 days, time on product page >60s
- Goal-to-page mapping table (which pages serve which goals)
- Measurable success metrics per goal

- [ ] **Step 3: Owner confirmation**

Present goal hierarchy in business language. Ask:
- Does this match your actual business priorities?
- Are there goals missing?

- [ ] **Step 4: Finalize and save**

Save confirmed document to `docs/strategy/ring1/01-business-goals.md`.

---

## Task 2: Competitive Analysis

**Deliverable:** `docs/strategy/ring1/02-competitive-analysis.md`
**Methodology:** Competition Matrix + Alternative Analysis
**Skill:** `do-digger` (standard mode) for web research
**Depends on:** Pre-Task owner input (competitor names)
**Parallel with:** Task 1

- [ ] **Step 1: Research competitor websites**

Use `do-digger` to audit 5-8 competitor websites (names from Pre-Task):
- Site structure (what pages exist, how products are organized)
- Trust signals (certifications displayed, factory photos, customer logos)
- Conversion paths (how many clicks to inquiry, what CTA types)
- Content depth (specs detail level, case studies, blog presence)
- Positioning claims (how they describe themselves)

- [ ] **Step 2: Build competitive landscape matrix**

Create matrix comparing:
- Tianze vs Trading companies vs Small factories vs Large manufacturers
- Dimensions: price, quality, customization, certifications, technical support, MOQ flexibility

- [ ] **Step 3: Identify differentiation opportunities**

Based on competitor audit:
- What do competitors NOT say that Tianze can?
- Where are competitor websites weakest?
- What trust signals do competitors use that Tianze lacks?

- [ ] **Step 4: Owner confirmation**

Present competitive landscape. Ask:
- Is this map accurate to your experience?
- Any competitors missing?
- Do the differentiation opportunities feel real?

- [ ] **Step 5: Finalize and save**

Save to `docs/strategy/ring1/02-competitive-analysis.md`.

---

## Task 3: Brand Positioning

**Deliverable:** `docs/strategy/ring1/03-brand-positioning.md`
**Methodology:** Positioning Theory + B2B Differentiation Strategy
**Skill:** None (synthesis of Task 1+2 outputs + existing context)
**Depends on:** Task 1 (goals), Task 2 (competitive landscape)

- [ ] **Step 1: Synthesize inputs**

Read:
- Task 1 output (business goals)
- Task 2 output (competitive landscape)
- `product-marketing-context.md` (existing differentiation, brand voice)
- Owner's business truths from brainstorming session (win/loss reasons, certification strategy)

- [ ] **Step 2: Draft positioning statement**

Produce:
- Company-level positioning statement (one sentence)
- Per-line positioning angles:
  - PVC conduit: standards-compliant, factory-direct, margin-friendly
  - PETG pneumatic: high-transparency, leak-proof, stable supply to major integrators
  - Equipment: technical monopoly, upstream manufacturer credibility
  - Custom molds: flexible MOQ, in-house mold development
- Differentiation matrix (Tianze vs each competitor type)
- Certification positioning: specific wording options for "technology meets standards, certification in progress"

- [ ] **Step 3: Owner confirmation**

Present positioning. Ask:
- Does this sound like us?
- Would you be comfortable saying this to a buyer face-to-face?
- Does the certification wording feel honest?

- [ ] **Step 4: Finalize and save**

Save to `docs/strategy/ring1/03-brand-positioning.md`.

---

## Task 4: User Personas

**Deliverable:** `docs/strategy/ring1/04-personas/` (one file per persona)
**Methodology:** Jobs-to-be-Done + Buyer Persona
**Skill:** None (direct analysis using Ring 1 inputs)
**Depends on:** Task 3 (positioning)

- [ ] **Step 1: Draft persona cards**

Create 5 persona cards based on business line taxonomy:
1. **PVC Distributor** -- local chain store owner importing PVC conduit
2. **PVC Contractor** -- project engineer specifying conduit for commercial builds
3. **PETG Integrator** -- hospital/lab system integrator needing pneumatic tubes
4. **Equipment Manufacturer** -- PVC pipe factory expanding to bends
5. **OEM Buyer** -- company needing private-label production

Each card includes:
- Role and company context
- Job to be done (specific, not generic)
- Decision chain (who else is involved, what triggers search)
- Information needs at each stage (awareness / comparison / decision)
- Top 3 concerns and objections
- Preferred communication style
- How they'd describe what they're looking for (in their words)

- [ ] **Step 2: Cross-reference with product-marketing-context.md**

Reconcile new personas with existing persona table in `product-marketing-context.md`. Note where they align and where the new version adds depth.

- [ ] **Step 3: Owner confirmation**

Present personas. Ask per persona:
- Does this feel like a real person you've dealt with?
- Anything missing that you encounter in conversations?
- Is the "job to be done" right?

- [ ] **Step 4: Finalize and save**

Save each persona to its own file in `docs/strategy/ring1/04-personas/`.

---

## Task 5: Value Propositions

**Deliverable:** `docs/strategy/ring1/05-value-propositions.md`
**Methodology:** Value Proposition Canvas (Strategyzer)
**Skill:** None (synthesis of Ring 1 outputs)
**Depends on:** Task 3 (positioning), Task 4 (personas)

- [ ] **Step 1: Map per-persona value canvas**

For each persona:
- Customer jobs (functional, social, emotional)
- Pains (barriers, risks, negative outcomes)
- Gains (desired outcomes, benefits, expectations)
- Tianze's pain relievers (how we address each pain)
- Tianze's gain creators (how we deliver each gain)
- Fit score (how well our offering matches their needs)

- [ ] **Step 2: Produce value proposition statements**

- One company-level statement (for homepage hero)
- One per business line (for line landing pages)
- Each statement follows format: "For [persona] who [job], Tianze provides [solution] that [key differentiator], unlike [alternatives] which [limitation]."

- [ ] **Step 3: Owner confirmation**

Present value propositions. Ask:
- Is the company-level statement something you'd put on a billboard?
- Does each line's proposition feel accurate to what actually closes deals?

- [ ] **Step 4: Finalize and save**

Save to `docs/strategy/ring1/05-value-propositions.md`.

---

## === OWNER GATE 1 ===

**Pause here.** Present Ring 1 summary to owner:

| Document | Core output |
|----------|-------------|
| Business goals | Conversion hierarchy + metrics |
| Competitive analysis | Landscape matrix + differentiation opportunities |
| Brand positioning | Positioning statements + certification wording |
| Personas | 5 persona cards with decision chains |
| Value propositions | Company-level + per-line statements |

Ask: "Ring 1 is the foundation. Everything in Ring 2 builds on these. Before continuing, are you confident these documents reflect your business reality?"

**Do not proceed to Task 6 until owner confirms.**

---

## Task 6: Buyer Question Chains

**Deliverable:** `docs/strategy/ring2/06-buyer-question-chains/` (one file per sub-line)
**Methodology:** Buyer Question Chain + Cognitive Stage Model
**Skill:** `dispatching-parallel-agents` (4 independent chains in parallel)
**Depends on:** Task 4 (personas)

- [ ] **Step 1: Draft question chains per sub-line**

Dispatch 4 parallel agents. Each produces a question chain for its sub-line:

**Chain format:**
```
Stage 1 (Awareness): Questions the buyer has when first encountering Tianze
  Q1: ...
  Q2: ...
  Content needed: ...

Stage 2 (Comparison): Questions when evaluating Tianze against alternatives
  Q1: ...
  Q2: ...
  Content needed: ...

Stage 3 (Decision): Questions when ready to act but still hesitant
  Q1: ...
  Q2: ...
  Content needed: ...
```

**Sub-line specific question seeds** (starting points, not exhaustive):
- **PVC conduit**: certifications -> standards compliance -> price -> MOQ -> shipping -> lead time
- **PETG pneumatic**: transparency/seal quality -> custom specs -> integration compatibility -> supply stability -> references from other integrators
- **Equipment (bending machines)**: technical capabilities -> ROI calculation -> market scarcity -> installation support -> spare parts
- **Custom molds**: mold development capability -> MOQ flexibility -> turnaround time -> brand references -> IP protection

- [ ] **Step 2: Map questions to existing pages**

For each question, identify:
- Which existing page answers it (if any)
- How well it's currently answered (fully / partially / not at all)
- Where the answer should live in the site structure

- [ ] **Step 3: Owner confirmation**

Present chains. Ask per sub-line:
- Does this sequence match how real conversations go?
- Any questions missing that buyers always ask?

- [ ] **Step 4: Finalize and save**

Save to `docs/strategy/ring2/06-buyer-question-chains/{pvc-conduit,petg-pneumatic,equipment,custom-molds}.md`.

---

## Task 7: Information Architecture

**Deliverable:** `docs/strategy/ring2/07-information-architecture.md`
**Methodology:** IA Faceted Classification + Task-Oriented Navigation
**Skill:** None (structural design using Task 6 outputs)
**Depends on:** Task 6 (question chains)

- [ ] **Step 1: Audit current site structure**

Read current sitemap (`docs/impeccable/system/sitemap.md`) and actual page files at `src/app/[locale]/`. Map:
- Current URL structure vs three-line taxonomy
- Gap: bending machines at `/capabilities/bending-machines/` but owner confirmed this is a sellable product line
- Gap: PETG pneumatic tubes have no dedicated sub-section under `/products/`
- Existing pages that serve multiple lines (homepage, about, contact)
- Current OEM path: `/oem-custom-manufacturing/` (existing, implemented)

- [ ] **Step 2: Draft revised site structure**

Proposed structure (all paths are proposals -- existing paths noted for migration planning):

```
/ (homepage -- company narrative -> 3 lines)
/products/
  /products/pvc-conduit/           -- PVC conduit overview
  /products/pvc-conduit/[market]/  -- per-market specs (existing pattern, keep)
  /products/pneumatic-tubes/       -- PETG pneumatic tubes (NEW)
/equipment/
  /equipment/bending-machines/     -- bending machines as product
                                      (MIGRATE from /capabilities/bending-machines/)
/oem-custom-manufacturing/         -- OEM / custom molds (EXISTING, keep current path)
/about/                            -- (EXISTING, keep)
/contact/                          -- (EXISTING, keep)
/blog/                             -- (EXISTING, keep)
/faq/                              -- (EXISTING, keep)
```

For each path change, document:
- Current path -> proposed path
- Redirect needed (301)
- Internal links to update
- Route config changes (`src/config/paths/paths-config.ts`)

- [ ] **Step 3: Design navigation scheme**

- Main nav: Products | Equipment | Custom | About | Contact (CTA)
- Products sub-nav: PVC Conduit | Pneumatic Tubes
- Shared trust assets: about page, certifications section, factory photos -- accessible from all lines
- Cross-guidance decision: based on owner input (do lines need to link to each other?)

- [ ] **Step 4: Owner confirmation**

Present revised structure. Ask:
- Does the navigation make sense from a buyer's perspective?
- Is the bending machine move from `/capabilities/` to `/equipment/` correct?
- Keep `/oem-custom-manufacturing/` as-is or rename?
- Do you need cross-links between lines?

- [ ] **Step 5: Finalize and save**

Save to `docs/strategy/ring2/07-information-architecture.md`.

Note: Task 7 does NOT produce a content inventory. It produces a structural IA with migration notes. The comprehensive content inventory is Task 12's sole responsibility.

---

## Task 8: Content Strategy

**Deliverable:** `docs/strategy/ring2/08-content-strategy.md`
**Methodology:** Content Strategy Quadrants (Halvorson) + Decision Stage Matching
**Skill:** `content-strategy` skill
**Depends on:** Task 6 (question chains), Task 7 (IA)

- [ ] **Step 1: Map content to decision stages**

Using question chains (Task 6) and IA (Task 7):
- Which pages address which decision stage per sub-line (PVC, PETG, equipment, molds)
- Where are content gaps (stage has questions but no page answers them)
- Content priority matrix: page x sub-line x decision stage

- [ ] **Step 2: Define content depth per page type**

- Homepage: company-level, all 3 stages briefly, primarily routing to 3 lines
- Product overview pages: Stage 1-2 (awareness + comparison)
- Product detail pages: Stage 2-3 (comparison + decision)
- PETG dedicated page: Stage 1-3 (smaller audience needs full journey on fewer pages)
- Equipment page: Stage 2-3 (buyers arrive with clear intent)
- About page: Stage 2-3 (trust building, shared across all lines)
- Contact page: Stage 3 (decision support + conversion)
- Blog: Stage 1 (awareness, SEO entry points)
- FAQ: Stage 2-3 (objection handling)

- [ ] **Step 3: Define content types and formats**

Per page, specify:
- What information goes in which module
- Which modules are shared across pages (trust bar, CTA block)
- What new content needs to be created vs what exists

- [ ] **Step 4: Owner confirmation**

Present content priority matrix. Ask:
- Does the gap list feel right?
- Any content you know buyers need that's not captured here?

- [ ] **Step 5: Finalize and save**

Save to `docs/strategy/ring2/08-content-strategy.md`.

---

## Tasks 9-12 (Parallel Block)

Tasks 9, 10, 11, and 12 are independent of each other. Run them simultaneously after Task 8 completes. Use `dispatching-parallel-agents` skill or execute sequentially if preferred.

---

### Task 9: Multilingual Content Architecture

**Deliverable:** `docs/strategy/ring2/09-multilingual-architecture.md`
**Depends on:** Task 8

- [ ] **Step 1: Ask owner about Chinese content purpose**

Does Chinese content serve:
A. Domestic Chinese buyers
B. Overseas Chinese-speaking buyers
C. Both
D. Primarily SEO (Chinese-language search)

- [ ] **Step 2: Define content layering**

- Shared content (translated identically): product specs, certifications, factory info
- Market-specific content (en only): Australian standard details, North American code references
- Market-specific content (zh only): domestic certifications, RMB pricing (if applicable)
- Translation scope per page: full / partial / en-only

- [ ] **Step 3: Produce translation glossary**

Technical terms with established translations vs terms needing new translation decisions. Reference `product-marketing-context.md` glossary as starting point.

- [ ] **Step 4: Finalize and save**

Save to `docs/strategy/ring2/09-multilingual-architecture.md`.

---

### Task 10: SEO Information Architecture

**Deliverable:** `docs/strategy/ring2/10-seo-ia.md`
**Skill:** `do-digger` (for keyword research per market)
**Depends on:** Task 8

- [ ] **Step 1: Research keyword opportunities**

Research per market and sub-line:
- Australia: PVC conduit + AS/NZS standards keywords
- North America: PVC conduit + ASTM/UL651 keywords
- Southeast Asia: PVC conduit + regional standard keywords
- Cross-market: bending machine keywords, OEM/custom manufacturing keywords
- PETG/pneumatic tube keywords (niche, likely low volume but high intent)

- [ ] **Step 2: Design topic clusters**

- Pillar pages: product overview pages (one per business line)
- Cluster pages: per-market spec pages, application guides, comparison guides
- Blog articles: technical how-tos, standard compliance guides, application case studies

- [ ] **Step 3: Match search intent per page**

For each page in the IA (Task 7), assign:
- Target keywords (primary + secondary)
- Search intent type (informational / commercial / transactional)
- Content format recommendation

- [ ] **Step 4: Finalize and save**

Save to `docs/strategy/ring2/10-seo-ia.md`.

---

### Task 11: Legal/Compliance Audit

**Deliverable:** `docs/strategy/ring2/11-legal-compliance-audit.md`
**Depends on:** Task 7

- [ ] **Step 1: Audit existing legal pages**

Read actual page files:
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`

Check:
- Privacy policy completeness (GDPR, CCPA if targeting NA/AU)
- Terms of service adequacy for B2B export context
- Cookie consent implementation status

- [ ] **Step 2: Identify gaps**

- Cookie consent banner needed? (depends on target market regulations)
- Export compliance statements needed?
- Certification disclaimer language (for "in progress" certifications)

- [ ] **Step 3: Produce gap list with priority**

Save to `docs/strategy/ring2/11-legal-compliance-audit.md`.

---

### Task 12: Content Inventory & Gap Analysis

**Deliverable:** `docs/strategy/ring2/12-content-inventory.md`
**Depends on:** Task 7 (IA), Task 8 (content strategy)

This is the **single authoritative content inventory**. Task 7 produces the structural IA; this task audits every page and asset against that structure.

- [ ] **Step 1: Inventory all existing content**

For every page and content asset in the project (scan `src/app/[locale]/`):
- URL path (current, real path -- not proposed)
- Current status (implemented / placeholder / missing)
- Business sub-line served (PVC / PETG / equipment / molds / shared)
- Decision stage addressed
- Content quality (complete / partial / needs rewrite)
- Assets needed (photos, specs, downloads)

- [ ] **Step 2: Gap analysis**

Cross-reference inventory with:
- Task 7 IA (are all planned pages accounted for? which are new?)
- Task 8 content strategy (are all content needs met? which stages have gaps?)
- Asset availability (owner confirmed 7 types available, need enhancement)

- [ ] **Step 3: Produce prioritized action list**

For each gap:
- What needs to be created/updated
- What inputs are needed (owner-provided vs Claude-produced)
- Priority (P0/P1/P2)
- Dependency on asset processing (photos, specs)

- [ ] **Step 4: Finalize and save**

Save to `docs/strategy/ring2/12-content-inventory.md`.

---

## === OWNER GATE 2 ===

**Pause here.** Present Ring 2 summary to owner:

| Document | Core output |
|----------|-------------|
| Buyer question chains | 4 chains (PVC conduit, PETG pneumatic, equipment, molds) with stage mapping |
| Information architecture | Revised sitemap, navigation scheme, URL migration plan |
| Content strategy | Content priority matrix, gap list, depth-per-page specs |
| Multilingual architecture | Content layering, translation scope, glossary |
| SEO IA | Keyword opportunities, topic clusters, intent mapping |
| Legal/compliance | Gap list with priorities |
| Content inventory | Full inventory + prioritized action list |

Ask: "Ring 2 defines what the website contains and how it's organized. Ring 3 (Expression -- design, copy, conversion) builds directly on these documents. Before continuing to Phase 2, does this structure feel right?"

**Do not proceed to Phase 2 (Ring 3) until owner confirms.**

---

## Completion Checklist

Before declaring Phase 1 complete:

- [ ] All 12 documents saved to `docs/strategy/`
- [ ] Owner Gate 1 passed (Ring 1 confirmed)
- [ ] Owner Gate 2 passed (Ring 2 confirmed)
- [ ] `product-marketing-context.md` updated if any Ring 1 findings contradict it
- [ ] Assumptions collected: all "assumptions to verify" from each task are compiled
- [ ] Phase 2 plan prerequisites identified: list what Ring 3 needs from these documents
