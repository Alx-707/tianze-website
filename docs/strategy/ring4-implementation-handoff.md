# Ring 4 Implementation Handoff — Tianze Website

> Cross-ring control document | Status: Approved handoff snapshot (2026-03-30)
> Purpose: convert Ring 1-3 strategy into one execution-ready map for `/cwf` -> `/dwf` -> brainstorming -> BDD -> TDD.

## 1. Source of Truth Hierarchy

Use these documents in this order when a decision conflicts:

| Priority | Topic | Source of truth |
|----------|-------|-----------------|
| 1 | URL structure, page ownership, route migration | `docs/strategy/ring2/07-information-architecture.md` |
| 2 | Page purpose, stage-based content scope, priority | `docs/strategy/ring2/08-content-strategy.md` |
| 3 | What exists today vs what is missing | `docs/strategy/ring2/12-content-inventory.md` |
| 4 | SEO targeting, topic clusters, search intent | `docs/strategy/ring2/10-seo-ia.md` |
| 5 | Multilingual scope and glossary | `docs/strategy/ring2/09-multilingual-architecture.md` |
| 6 | Legal/compliance requirements | `docs/strategy/ring2/11-legal-compliance-audit.md` |
| 7 | Trust signal hierarchy | `docs/strategy/ring3/01-trust-building-system.md` |
| 8 | Copy direction and page-level messaging | `docs/strategy/ring3/02-copywriting-strategy.md` |
| 9 | CTA flows and conversion rules | `docs/strategy/ring3/03-conversion-path-design.md` |
| 10 | Inquiry form behavior | `docs/strategy/ring3/04-inquiry-form-design.md` |
| 11 | Visual direction | `docs/strategy/ring3/05-page-visual-design-direction.md` |
| 12 | Asset requirements | `docs/strategy/ring3/06-asset-processing-strategy.md` |

## 2. Path Terminology Rule

- `Current path` means the path that exists in the codebase today.
- `Target path` means the approved Ring 4 destination path.
- During implementation docs and tickets, always write both when migration is involved.

Examples:

| Current path | Target path |
|--------------|-------------|
| `/products/[market]` | `/products/pipes/[market]` |
| `/products/pneumatic-tube-systems` | `/products/pipes/pneumatic-tubes/` |
| `/capabilities/bending-machines` | `/products/equipment/bending-machines/` |
| `/oem-custom-manufacturing` | `/products/custom-manufacturing/` |

## 3. Approved Market Slug Set for the Current Wave

Strategic market priority and current route slugs are related but not identical.

Approved current-wave slug set:

- `/products/pipes/north-america/`
- `/products/pipes/australia-new-zealand/`
- `/products/pipes/mexico/`
- `/products/pipes/europe/`
- `/products/pipes/pneumatic-tubes/`

Rule:

- Do not introduce `/products/pipes/southeast-asia/` unless IA, SEO IA, content inventory, redirects, and code are all updated together.

## 4. Recommended Ring 4 Build Order

### Phase A — Structural migration

1. Restructure `/products/` into a real 3-line hub.
2. Create `/products/pipes/`.
3. Create `/products/equipment/`.
4. Migrate legacy paths to target `/products/` paths.
5. Add 301 redirects and update navigation, sitemap, and internal links.

### Phase B — Shared trust and conversion foundation

1. Update homepage to route clearly into the 3 business lines.
2. Apply Ring 3 CTA logic and 2-click rule.
3. Implement the universal 4-field inquiry form with product-interest context.
4. Remove template leftovers such as `welcome.mdx`.

### Phase C — Line-by-line page execution

1. Pipes overview and market pages.
2. PETG page rewrite for the integrator persona.
3. Equipment overview and bending machines page reframe.
4. Custom manufacturing page enrichment.

### Phase D — Supporting content and SEO

1. FAQ page and FAQ distribution logic.
2. First wave of real blog articles from the SEO clusters.
3. Certification, QC, shipping/trade terms, and reference content.

## 5. Owner-Dependent Blockers

These items should not be silently improvised in implementation:

| Needed from owner | Blocks |
|-------------------|--------|
| ISO certificate scan and certification status details | About/certifications trust layer |
| Real factory and machine photos | Homepage, About, Equipment credibility |
| PETG test data | PETG page technical credibility |
| Real machine specs | Equipment page depth and shortlist viability |
| QC / defect handling process | QA content and OEM trust layer |
| MOQ / payment / transit / trade terms | Trade-terms content and OEM scaling content |
| After-sales support details | Equipment decision-stage content |
| Mold ownership / NDA / IP policy | OEM decision-stage content |

## 6. Exit Criteria for Ring 4

Ring 4 is not done until all of the following are true:

1. No primary navigation points to legacy `/capabilities/` or `/oem-custom-manufacturing` paths.
2. Redirects exist for every migrated public path.
3. Homepage, products hub, pipes overview, equipment overview, and custom manufacturing pages all align with Ring 2/3 strategy.
4. No template placeholder content remains live.
5. Inquiry path from every key page reaches the form in 2 clicks or fewer.
6. Source-of-truth docs are still internally consistent after implementation.

## 7. What Ring 5 Will Measure Later

Implementation should preserve the ability to measure:

- CTA click-through by page and line
- Sample vs quote inquiry entry points
- Product-interest selection in the form
- Blog to product-page assisted journeys
- Certification-content engagement
- Route performance after URL migration
