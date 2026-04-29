---
name: Tianze Website
register: brand
status: provisional
last_updated: 2026-04-29
---

# Tianze Product Context

## Status

This file is the project-level business context for design and implementation agents.
It is intentionally practical: it tells agents what the website must accomplish before they make page, visual, copy, motion, or component decisions.

Status: provisional, but business direction is stable enough to guide design work.

## Product

Tianze is a B2B manufacturer of PVC electrical conduit fittings and PETG pneumatic transfer tubes. The website serves overseas buyers who need to evaluate whether Tianze is a reliable factory partner, not casual visitors browsing a brand story.

Core offer:

- PVC conduit fittings for building electrical and infrastructure projects.
- PETG pneumatic tubes for hospital, laboratory, and logistics transfer systems.
- OEM and custom manufacturing supported by in-house forming, mold development, production, and quality control.

## North Star

The website exists to produce qualified overseas inquiries.

A qualified inquiry means the buyer can tell Tianze what they need, why they need it, and how to continue the commercial conversation. Design quality is judged by whether it helps buyers understand product fit, supplier credibility, customization ability, and next action.

## Buyer Personas

| Persona | Primary concerns | Design implication |
| --- | --- | --- |
| Distributor / importer | MOQ, pricing tiers, packaging, repeat supply, export reliability | Make product range, sample path, packaging, and quote CTAs easy to scan. |
| Engineering contractor | Standards, specification match, installation fit, acceptance risk | Surface specs, standards, dimensions, applications, and compliance language early. |
| Brand / OEM procurement | Customization, molds, private label, long-term cooperation | Show in-house capability, process control, sampling, confidentiality, and production proof. |
| Medical / pneumatic system integrator | PETG clarity, sealing, system fit, custom size, stable supply | Keep technical fit and application proof close to product evidence. |

Current constraint: do not create separate persona-specific page variants yet. Use persona awareness to decide priority, order, and fallback content inside one balanced page.

## Buyer Decision Path

Most buyers arrive with risk in mind. The design should follow this chain:

1. Is this a real and credible supplier?
2. Do the products match my market, standard, and project?
3. Does the factory control manufacturing quality?
4. Can it support customization or OEM needs?
5. Are delivery, packaging, sample, and communication risks acceptable?
6. Is it worth sending an inquiry?

## Conversion Model

Primary conversion:

- Submit inquiry form.
- Request quote.
- Request sample.
- Start technical or WhatsApp conversation where available.

CTA commitment levels:

- Low commitment: view catalog, check specs, download datasheet, view certification status.
- Medium commitment: request sample, ask technical question.
- High commitment: request quote, submit custom requirement, book technical discussion.

Default inquiry form fields:

1. Name
2. Email
3. Product interest
4. Message

Product interest should be prefilled from page context where possible.

## Positioning

Tianze should not look or sound like a generic trading company. The strongest differentiation is manufacturing control:

- In-house forming capability.
- Mold development.
- Production and quality control in one chain.
- Custom and OEM response.
- Factory-direct supply.

External expression should follow this order:

1. Buyer result: precision, stability, standard fit, factory-direct response.
2. Reason: in-house process, molds, production control.
3. Evidence: specs, tolerances, process, QC, samples, real factory assets.

## Brand Voice

Tone:

- Professional
- Practical
- Technical but understandable
- Direct
- Evidence-led

Avoid:

- Empty superlatives such as "industry-leading" without proof.
- Cheap-price positioning.
- Overpromising certification or brand authority that content cannot prove.
- Decorative marketing language that hides specifications.

## Trust Evidence

Preferred proof types:

- Product specifications and standards.
- Manufacturing process and in-house capability.
- Mold, sampling, and custom workflow.
- Quality inspection, batch traceability, and certifications.
- Export packaging, delivery expectations, and sample handling.
- Customer and application evidence where content is available.

Do not rely on excessive badges or vague trust claims when process proof can be shown.

## Design Implications

Design must help buyers make procurement judgments quickly:

- Prioritize clarity over decoration.
- Put specs and evidence near claims.
- Use visuals to support product and manufacturing credibility.
- Keep CTAs visible, specific, and low-friction.
- Do not make the site feel like a generic SaaS landing page.
- Do not make the site feel like an Alibaba product listing page.

## Source Documents

Current supporting context:

- `docs/strategy/current-strategy-summary.md`
- `docs/design-truth.md`
- `docs/impeccable/design-workflow.md`
- `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`
- `docs/impeccable/system/PAGE-PATTERNS.md`
- `docs/impeccable/system/MOTION-PRINCIPLES.md`
- `.claude/product-marketing-context.md`
