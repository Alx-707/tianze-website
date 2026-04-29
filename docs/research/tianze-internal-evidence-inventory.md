# Tianze Internal Evidence Inventory

> Last updated: 2026-04-29
> Purpose: identify what Tianze can prove now, what is only claimed in text, and what must be supplied before final design/copy.
> Scope: internal repo evidence plus current known business-asset gaps.

## Summary

External research has already shown what buyers expect. The main blocker is now internal proof.

Current verdict:

> Tianze has enough internal context for page structure and `shape`, but not enough hard evidence to freeze final public copy, trust visuals, or certification-heavy design.

## Evidence status legend

| Status | Meaning |
| --- | --- |
| Confirmed in repo | Present in current source/config/docs. Still may need public asset form. |
| Partial | Some text exists, but proof is missing or not public-ready. |
| Missing | Not found in current repo/public assets. |
| Risk | Current copy may overstate what available proof supports. |

## 1. Company identity and operating facts

| Evidence item | Status | Current repo/source | Supports pages/claims | Gap / action |
| --- | --- | --- | --- | --- |
| Company English name | Confirmed in repo | `src/config/single-site.ts`, `docs/project-context.md` | About, footer, contact, structured identity | Keep as current source. |
| Brand name | Confirmed in repo | `src/config/single-site.ts`, `PRODUCT.md` | Global identity | Keep as current source. |
| Location/address | Confirmed in repo | `src/config/single-site.ts`, `docs/cwf/context/company/company-facts.yaml` | About, contact, factory trust | Verify exact English address before public expansion. |
| Established/operation year | Confirmed in repo | `src/config/single-site.ts` says 2018 | About, hero proof strip | Safe if owner confirms. |
| Employee count | Confirmed in repo | `src/config/single-site.ts` says 60 | About stats | Use carefully; avoid "team strength" overclaim. |
| Factory area | Confirmed in repo | `src/config/single-site.ts` says 100 acres | About/manufacturing | Needs photo/proof before leading visually. |
| Export countries | Conflict | Current config says 20; older `proof-points.md` says 107 | Homepage stats, About trust | Use 20/20+ until 107 is verified. |
| Phone number | Risk | `src/config/single-site.ts` uses `+86-518-0000-0000` | Contact | Looks placeholder. Verify before public trust design. |
| Social links | Risk | `src/config/single-site.ts` includes X/LinkedIn URLs | Footer/social proof | Verify accounts exist and are appropriate. |

## 2. Certifications and compliance proof

| Evidence item | Status | Current repo/source | Supports claims | Gap / action |
| --- | --- | --- | --- | --- |
| ISO 9001:2015 certificate number | Confirmed in repo | `src/config/single-site.ts`, messages, CWF docs: `240021Q09730R0S` | Quality management system | Need certificate scan/PDF and registrar/scope if used as downloadable proof. |
| ISO 9001 certificate file | Missing | No public certificate PDF/image found in `public/` during scan | Certificate download/trust block | Add PDF/image or keep "available during RFQ review." |
| UL 651 proof | Missing/risk | Text/config references UL 651; no certificate/report found | North America product claims | Do not say "UL certified" until product-specific proof is supplied. |
| ASTM D1785 proof | Missing/risk | Text/config references ASTM D1785; no report/document found | North America product claims | Use standard-context wording unless reports/spec sheets exist. |
| AS/NZS 2053 proof | Missing/risk | Text/config references AS/NZS 2053; no certificate/report found | AU/NZ page | Avoid "AS/NZS certified" unless proof is supplied. |
| NOM proof | Missing/risk | Text/config references NOM-001-SEDE; no report found | Mexico page | Treat as follow-up evidence gap. |
| IEC 61386 proof | Missing/risk | Text/config references IEC 61386; no report found | Europe page | Treat as follow-up evidence gap. |
| CE/LSZH proof | Missing | Mentioned as external research gap, not found in repo | EU/LSZH pages | Do not add unless supplied. |

## 3. Product taxonomy and specs

| Evidence item | Status | Current repo/source | Supports pages/claims | Gap / action |
| --- | --- | --- | --- | --- |
| Market/product families | Confirmed in repo | `src/config/single-site-product-catalog.ts` | Products overview, market pages | Good enough for IA. |
| North America product scope | Partial | UL/ASTM Series, sweeps/elbows, couplings, pipes | Product routing | Needs actual spec tables and certificate scope. |
| AU/NZ product scope | Partial | AS/NZS series, bends, bellmouths, couplings, pipes | AU/NZ page | Needs size tables and AS/NZS proof. |
| Mexico product scope | Partial | NOM series, bends, couplings, pipes | Mexico page | Needs evidence. External research also marked NOM as follow-up. |
| Europe product scope | Partial | IEC series, bends, couplings, pipes | Europe page | Needs evidence. External research marked IEC/LSZH as follow-up. |
| PETG product scope | Partial | PETG tubes and fittings | PETG page | Needs OD/ID, wall thickness, length, radius, transparency and packing proof. |
| Product spec tables | Partial | `src/constants/product-specs/*` exists | Product pages | Review if values are business-verified and can be public. |
| Product drawings/CAD | Missing | Not found | Downloads, engineer trust | Add later if available. |
| Catalog/datasheet PDFs | Missing | Not found in `public/` | Download center, product pages | Critical design blocker for mature B2B proof. |

## 4. Factory, process, QC, and packaging assets

| Evidence item | Status | Current repo/source | Supports pages/claims | Gap / action |
| --- | --- | --- | --- | --- |
| Factory exterior photo | Missing | Not found as current public asset | About/manufacturing proof | Needed before strong factory visuals. |
| Workshop photos | Missing | Not found | Factory-direct, manufacturing control | Needed. |
| Production line photos | Missing | Public has SVG illustrations only | Manufacturing proof | Real photos needed. |
| Forming/expander/mold visuals | Partial | `public/images/hero/*.svg` illustration assets | Conceptual process section | Not proof. Need real photo/video. |
| QC lab/photo | Missing | Not found | Stable quality, inspection | Needed before QC-heavy trust block. |
| QC checklist | Missing | Not found as public doc | Quality process | Create or collect. |
| Packaging photos/spec | Missing | Not found | Export-ready packaging, private label | Needed before packaging claim. |
| Container/loading proof | Missing | Not found | Export readiness | Nice-to-have for distributor/importer trust. |

## 5. Commercial policy evidence

| Evidence item | Status | Current repo/source | Supports pages/claims | Gap / action |
| --- | --- | --- | --- | --- |
| Sample policy | Missing | CWF docs mention sample ideas, but no current confirmed table | CTA, FAQ, product pages | Owner/sales confirmation needed. |
| MOQ policy | Missing | FAQ gaps list MOQ as missing | Product/OEM pages | Define by product family and standard vs custom. |
| Lead time | Missing | FAQ gaps list lead time as missing | Inquiry page, FAQ | Define standard/custom lead time range. |
| Payment terms | Missing | FAQ gaps list payment terms as missing | FAQ/contact | Define allowed public wording. |
| Private label policy | Partial | OEM mentions exist in copy/docs | OEM page | Need packaging/artwork/MOQ rules. |
| Drawing/sample review process | Partial | `SINGLE_SITE_OEM_PAGE_EXPRESSION` has process count/scope keys | OEM page | Needs actual step details and owner approval. |
| Attachment upload | Unknown | Form system exists, but not reviewed in this inventory | RFQ/contact | Verify implementation before designing upload-dependent workflow. |

## 6. PETG pneumatic tube evidence

| Evidence item | Status | Current repo/source | Supports pages/claims | Gap / action |
| --- | --- | --- | --- | --- |
| PETG product image | Partial | `public/images/products/petg-pneumatic-tube.svg` | PETG page | SVG is not enough for proof. Need product photo/sample. |
| OD/ID/wall thickness | Missing/partial | Needs review in product specs constants | PETG spec table | Confirm with actual product data. |
| Bend radius | Missing/partial | Needs review in product specs constants | PETG product page | Confirm actual range. |
| Transparency proof | Missing | No photo/video found | PETG visual proof | Need photo/video/demo. |
| Sealing/system fit proof | Missing | No integrator fit validation found | Avoid leak-proof/system claim | Keep system-level claims cautious. |
| Packaging protection | Missing | No scratch/deformation packing proof | Export packaging | Needed for PETG credibility. |

## 7. Case studies and testimonials

| Evidence item | Status | Current repo/source | Supports pages/claims | Gap / action |
| --- | --- | --- | --- | --- |
| Named customer cases | Missing/risk | Older `proof-points.md` mentions hospitals and domestic brands, but permission/status unclear | Case studies, logo wall | Do not use named clients without permission. |
| Anonymous application examples | Partial | CWF examples exist | About/OEM/PETG pages | Can be rewritten as anonymized examples if owner confirms. |
| Customer testimonials | Missing/risk | Older quotes exist but unverified | Social proof | Avoid until approved. |
| Reference client logos | Missing | Not found | Logo wall | Do not create fake/unsupported logo walls. |

## 8. Current public copy risks to review later

This inventory does not change code, but it flags content that should be reviewed before final design/copy freeze:

- Current messages/config contain some "certified" wording for UL/AS/NZS/IEC/NOM style claims.
- Current product descriptions may imply compliance/certification more strongly than available proof supports.
- Placeholder phone/social values may weaken contact trust if shown prominently.
- SVG product/factory visuals should not be treated as real evidence.

Suggested review query:

```bash
rg -n "Certified|certified|Compliant|compliant|UL 651|AS/NZS|NOM|IEC 61386|ASTM|meet|符合|认证" src messages content
```

## 9. Priority proof requests for owner/business side

### P0: blocks public trust claims

1. ISO 9001 certificate scan/PDF.
2. Product-specific standard/certification inventory:
   - product
   - standard
   - certified/tested/made-to-standard/unverified
   - certificate/report file
   - validity/scope
3. Current product size/spec tables for top product families.
4. Real factory/workshop/production/QC photos.
5. Sample/MOQ/lead time policy.

### P1: unlocks better page design

1. Product photos for PVC bends, sweeps, couplings, conduit pipes, PETG tubes.
2. Packaging photos and export packing specs.
3. PETG OD/ID/wall thickness/length/bend radius/transparency proof.
4. OEM/custom process details and examples.
5. Product catalog or datasheet PDFs.

### P2: strengthens conversion but not required for first shape

1. Factory video.
2. Case studies or anonymized application examples.
3. Testimonials with permission.
4. CAD/drawing downloads.
5. Third-party inspection acceptance statement.

## 10. Page readiness

| Page/workstream | Readiness | Why |
| --- | --- | --- |
| Homepage hero + trust evidence shape | Ready with caveats | IA and content logic are clear, but real proof assets are missing. Shape should include evidence placeholders. |
| Products overview shape | Ready | Product taxonomy exists. Needs spec depth later. |
| Market/category page shape | Partially ready | IA exists, but certificate/standard proof is missing. |
| Product detail shape | Partially ready | Need verified dimensions/specs and download assets. |
| OEM/custom page shape | Partially ready | Process can be designed, but proof/examples are missing. |
| PETG page shape | Partially ready | Needs PETG specs and visual proof. |
| Final visual system | Not ready | Needs pilot pages and real assets before freezing. |

## 11. Next action

Recommended next action:

1. Update `docs/impeccable/research-brief.md` and `docs/impeccable/claim-evidence-matrix.md` from this inventory.
2. Run `shape` for homepage hero + trust evidence section.
3. During shape, mark every proof-dependent module as:
   - ready now
   - needs asset
   - must use cautious wording
