# Full Project Health Audit v1 - Quality Map

## Overall map

| Zone | Verdict | Why |
| --- | --- | --- |
| Local build/test baseline | Green | type-check, lint, unit tests, Next build, Cloudflare/OpenNext build all passed |
| Public buyer trust | Yellow/Red | phone and product images still need owner assets; ISO link and AS/NZS wording were repaired |
| Inquiry proof chain | Yellow | route tests now use the real schema, but external Resend/Airtable/Turnstile delivery still needs staging credentials |
| Security boundary | Yellow | no P0/P1, subscribe route order was repaired; CSP proof still needs runtime follow-up |
| Architecture/change cost | Yellow | product market, locale, route truth, and cache abstractions raise edit cost |
| UI/accessibility | Yellow | mobile tap density remains follow-up; false-green browser a11y checks were tightened |
| SEO implementation | Yellow/Green | local metadata/sitemap/robots tests pass, but Google-side facts are blocked |
| Dead-code / AI smell | Yellow | broad Knip entries, fake-green assertions, over-expanded primitive tests |
| Deployment truth | Yellow/Green | preview deploy and route smoke now pass; production domain and external lead delivery remain unproved |

## P0/P1 map

| Severity | Count | IDs |
| --- | ---: | --- |
| P0 | 0 | n/a |
| P1 | 6 | FPH-000, FPH-001, FPH-002, FPH-003, FPH-004, FPH-005 |
| P2 | 11 | FPH-006 through FPH-016 |
| P3 | 6 | FPH-017 through FPH-022 |

## Root-cause clusters

### Cluster 0 - Preview runtime has a real lead-page blocker

Findings:

- FPH-000 Cloudflare preview contact 500

Repair style: **Needs proof first**. This was repaired after the baseline audit; deployed preview smoke now requires both `/en/contact` and `/zh/contact` to return 200.

### Cluster A - Buyer trust assets are modeled before proof exists

Findings:

- FPH-001 phone placeholder
- FPH-002 missing ISO PDF
- FPH-003 sample product images
- FPH-004 AS/NZS wording conflict

Repair style: **Needs proof first, then delete/simplify**. Do not patch with more copy. Either provide real proof or remove the public claim.

### Cluster B - Proof chain looks green but does not prove what it says

Findings:

- FPH-005 mocked inquiry schema
- FPH-011 baseline false-green accessibility checks (repair wave tightened helper)
- FPH-012 broad Knip entries
- FPH-013 baseline missing mutation script recommendation (repair wave added script)

Repair style: **Delete fake assertions, simplify proof scripts**. Green checks that do not prove behavior are worse than no checks.

### Cluster C - Route/product/i18n truth sources are duplicated

Findings:

- FPH-006 product market route over-responsibility
- FPH-007 locale/message split
- FPH-008 contact fallback
- FPH-009 route/path/sitemap duplication
- FPH-019 barrel warning

Repair style: **Simplify or delete stale compatibility**. Keep one source of truth per business concept.

### Cluster D - Security is mostly structured, but subscribe/CSP need proof tightening

Findings:

- FPH-010 subscribe validation/test gap
- FPH-016 CSP unsafe-inline proof gap
- FPH-020 CSP report logging hardening

Repair style: **Simplify trust boundary, then prove with targeted tests**.

### Cluster E - UI polish exists, but runtime UX proof is incomplete

Findings:

- FPH-014 mobile touch density
- FPH-015 generic product CTA
- FPH-021 hero animation proof gap
- FPH-022 UI primitive test over-expansion

Repair style: **Move proof budget from primitives to buyer flows**.

## Linus Gate map

| Gate | Findings | Meaning |
| --- | --- | --- |
| Keep | FPH-021 | Do not touch unless runtime performance data proves harm |
| Simplify | FPH-006, FPH-007, FPH-009, FPH-010, FPH-012, FPH-014, FPH-015, FPH-019, FPH-020 | Reduce duplicated truth or make proof match real behavior |
| Delete | FPH-008, FPH-018, FPH-022 | Remove compatibility/future abstractions rather than patching them |
| Keep after repair | FPH-004, FPH-005, FPH-011, FPH-013 | Baseline issue was real; repair wave changed proof/content and should now be preserved |
| Needs proof | FPH-000, FPH-001, FPH-002, FPH-003, FPH-016, FPH-017 | Do not guess; provide real business/runtime proof or remove claim |

## Change-cost map

| Area | Cost | Evidence |
| --- | --- | --- |
| Product market pages | High | one route owns spec registry, metadata, JSON-LD, render, CTA |
| Locale and messages | High | en/zh maps repeated across routing, path config, loader, contact page |
| Contact/inquiry flows | High | forms, messages, server action/API, lead pipeline, Turnstile, external services |
| SEO route config | Medium/High | route paths repeated across path config, sitemap, pathnames, CTA literals |
| Security proof | Medium | contact/inquiry stronger than subscribe; live services blocked |
| UI proof | Medium | component tests pass, but browser a11y checks do not assert |
| Cache tags | Low/Medium | unused future abstraction, currently no launch-breaking behavior |

## Recommended fixed workflow after this audit

1. Add a launch-content gate for phone placeholders, missing proof assets, sample images, and standards vocabulary.
2. Add product inquiry route tests with real schema validation.
3. Add subscribe route security tests.
4. Keep Playwright axe helper failing on violations, including selector-scoped checks.
5. Add strict production reachability mode for Knip.
6. Add CSP proof step after build, not inside a lane that cannot build.
7. Add deployed preview smoke and web-worker tail proof for `/en/contact` and `/zh/contact`.
8. Keep `pnpm build` and `pnpm build:cf` serial.
