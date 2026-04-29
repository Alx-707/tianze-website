# Design Input Source Map

> Last updated: 2026-04-29
> Purpose: classify existing Tianze docs before design work, so design agents do not treat historical notes, raw research, and current truth as the same thing.
> Sharing: internal-only unless source references and proof gaps are converted into a public-safe brief.

This file answers one question:

> Which existing documents can be trusted directly for design decisions, which documents are useful but need cleaning, and which documents should only be treated as history/reference?

It is an input map, not a design spec. The design-ready synthesis lives in:

- `docs/impeccable/research-brief.md`

## Category 1: current usable truth

Use these as the first layer for design, page structure, copy priority, and workflow decisions.

| File | Role | How to use |
| --- | --- | --- |
| `PRODUCT.md` | Skill-facing business context | Start here for buyer personas, north star, positioning, conversion model, and current persona constraint. |
| `DESIGN.md` | Provisional design operating model | Use as current design boundary, but do not treat it as final brand identity. |
| `docs/project-context.md` | Project/business summary | Use for plain-language company, product, customer, and content-gap context. |
| `docs/strategy/current-strategy-summary.md` | Current strategy compression | Use for page priority, content order, trust system, CTA hierarchy, and current URL structure. |
| `docs/design-truth.md` | Confirmed design truth | Use when deciding whether a design choice conflicts with current direction. |
| `docs/impeccable/design-workflow.md` | Design workflow | Use for Gate 0, Page job contract, inquiry contribution modes, and feedback loop behavior. |
| `docs/impeccable/research-brief.md` | Design input brief | Use before `shape`, visual exploration, or page redesign. |
| `docs/impeccable/claim-evidence-matrix.md` | Claim guardrail | Use before writing or visually emphasizing trust/certification/factory/OEM claims. |
| `docs/research/tianze-internal-evidence-inventory.md` | Internal proof inventory | Use to decide which modules are ready, blocked, or require cautious wording. |
| `docs/impeccable/system/PAGE-PATTERNS.md` | Current page structure pattern | Use for implementation rhythm after a page brief is approved. |
| `docs/impeccable/system/GRID-SYSTEM.md` | Current grid convention | Use for layout consistency, not for deciding content strategy. |
| `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md` | Current token reference | Use as production baseline; not final brand proof. |
| `docs/impeccable/system/MOTION-PRINCIPLES.md` | Current motion boundary | Use after information architecture is clear. |
| `src/config/single-site.ts` | Live fact/config source | Use to verify public company facts before repeating numbers in design docs or pages. |

### Current truth rules

- Qualified inquiry conversion is the north star.
- Content must follow buyer decision order, not company self-introduction order.
- Product and manufacturing claims need nearby evidence.
- Current tokens are a baseline/control panel, not a final visual identity.
- `src/config/single-site.ts` currently beats older CWF files for live company numbers.
- `docs/guides/` and `docs/technical/` remain technical truth sources, but they are not design-input sources unless a design decision touches proof, release, routing, or deployment behavior.

## Category 2: useful input, but clean before use

These files contain valuable material, but they mix older assumptions, partial research, or unverified content. Do not feed them raw into design agents.

| File or folder | Useful content | Cleaning needed before design use |
| --- | --- | --- |
| `docs/research/competitor-synthesis-and-action-plan.md` | Competitor-inspired action items by page | Some route/status assumptions are old; convert into page-module patterns, not task backlog. |
| `docs/research/product-catalog-hierarchy-research.md` | Strong product IA research across 11 companies | Keep product-structure insights; re-check current route decisions before applying. |
| `docs/research/market/pvc-conduit-market-analysis-2025.md` | Market context and category growth | Useful for strategy context, weak for page design; avoid turning TAM claims into homepage copy. |
| `docs/cwf/context/project-brief.md` | Historical business and product context | Marked historical; use only after checking against `src/config/single-site.ts` and current strategy. |
| `docs/cwf/context/proof-points.md` | Trust素材, cases, promises, claims | High value but contains conflicts, especially export-country count and proof strength. Must verify before public use. |
| `docs/cwf/context/company/company-facts.yaml` | Structured company facts | Audit-only; current live facts are in `src/config/single-site.ts`. |
| `docs/cwf/context/company/products.yaml` | Product/category vocabulary | Useful for product language; current public site does not expose equipment as a standalone product line. |
| `docs/cwf/context/company/customers.md` | Customer segments and application scenarios | Useful for persona thinking; needs alignment with current no-variant persona rule. |
| `docs/cwf/context/company/value-copy.md` | Value propositions and terminology | Useful for message directions; avoid using old equipment-as-product positioning. |
| `docs/cwf/context/company/content-gaps.md` | Missing assets and content | Very useful before design; update after assets are obtained. |
| `docs/cwf/faq/v1-final.md` and `docs/cwf/faq/v1-zh-final.md` | FAQ drafts | Useful objection material; verify against current product/legal truth before publishing. |
| `docs/cwf/homepage/v5-final.md` | Older homepage copy direction | Useful for historical intent only; do not treat as final homepage structure. |
| `docs/impeccable/products/CATALOG-STRUCTURE.md` | Product catalog design snapshot | Useful product IA memory; file itself says it is superseded for routing/page ownership. |
| `docs/impeccable/external/vercel-design-system/` | Vercel-inspired layout/style reference | Use only for order, grid discipline, spacing, restraint; do not import SaaS/developer-tool identity. |
| `docs/impeccable/homepage/prototype/` | Older prototypes | Use as design history; do not treat as current source of truth. |
| Private external design-input research packet | External design-input research packet | Already synthesized into `research-brief.md` and `claim-evidence-matrix.md`; keep as evidence source and raw backup outside public docs. |

### Cleaning rules

- Extract stable decision logic, not raw copy.
- Convert "competitor did X" into "buyer question requires Y", otherwise it becomes copying.
- Downgrade unsupported claims to safer wording.
- Separate design implications from content gaps.
- Do not use old page status tables as current implementation truth without checking live routes.

## Category 3: historical/reference only

These may explain how the project got here, but they should not drive the next design workflow directly.

| File or folder | Why not direct design input |
| --- | --- |
| `docs/audits/` | Technical and SEO evidence snapshots; useful for proof history, not page design input. |
| `docs/superpowers/plans/` | Execution plans from previous workstreams; mostly historical. |
| `docs/superpowers/prompts/` | Handoff/audit prompts; not current design truth. |
| `docs/superpowers/current/` | Current/near-current execution notes, but not design source unless specifically related to business assets. |
| `docs/development/` | Templates/archive material; implementation reference only. |
| `docs/technical/` | Technical architecture, deployment, cache, dependency notes; not design input except when design affects runtime or route truth. |
| `docs/guides/` | Governance and proof rules; use for proof boundaries, not visual/content direction. |
| `docs/specs/behavioral-contracts.md` | Behavior contracts; not design content unless a page flow needs behavior clarification. |
| `docs/impeccable/system/COMPONENT-INVENTORY.md` | Component inventory; useful after page structure exists, not before. |
| `docs/impeccable/system/sitemap.md` | Sitemap reference; verify against current routes before using. |

## Known conflicts and cautions

| Topic | Conflict or caution | Current handling |
| --- | --- | --- |
| Export countries | Older `proof-points.md` says 107; current config says 20. | Use 20/20+ unless the 107 figure is verified and deliberately promoted. |
| Equipment/bending machines | Older docs treat equipment as stronger standalone direction. | Current public site should treat manufacturing capability as trust evidence, not an independent sellable product line. |
| Certification wording | Docs mention UL/ASTM/AS/NZS capability, but not every product has completed certification. | Use compliance-capability wording unless formal certificates/reports are available. |
| Case studies/testimonials | Older proof material contains useful examples but may not be public-approved. | Do not lead with named customers/logos until permission and assets are confirmed. |
| Current tokens | Existing tokens are stable implementation baseline. | Do not freeze them as final design identity before key page pilots. |

## How this map should be used

1. Start with Category 1.
2. Pull support from Category 2 only after cleaning conflicts.
3. Use Category 3 only for historical explanation or implementation proof boundaries.
4. Feed the cleaned synthesis, not the raw docs, into `impeccable`, `shape`, Claude, or image generation.
