# Batch 2: Trust Enhancement + CTA Optimization — Design Spec

> Date: 2026-03-25
> Status: Approved
> Scope: H-1, H-2, M-7, C-1 (C-3 already satisfied by existing InquiryDrawer)

---

## Context

Batch 1 (product data i18n) made the Chinese site functional. Batch 2 strengthens trust signals and inquiry conversion — the two things B2B buyers evaluate before submitting an inquiry.

Source: `docs/research/competitor-synthesis-and-action-plan.md` (4-competitor analysis)

### Data Corrections (H-2) — Already Applied

| Field | Before | After | Files |
|-------|--------|-------|-------|
| Founded year | 2006 | 2018 | messages/{en,zh}/{critical}.json, messages/{en,zh}.json |
| Export countries | 100+ | 20+ | site-facts.ts, messages/*, PROJECT-BRIEF.md, product-marketing-context.md |
| clientsServed | 500 | removed (unconfirmed) | site-facts.ts |

---

## H-1: Hero Positioning Statement

### Problem

Current title "PVC Conduit Bends & Fittings. Factory Direct." is generic — any conduit manufacturer could say this. Tianze's core differentiator (bending machine manufacturer) is buried in the subtitle.

### Design

Update hero copy to lead with the differentiator:

**English:**

| Element | Current | New |
|---------|---------|-----|
| Eyebrow | ISO 9001 Certified Manufacturer | ISO 9001 Certified · Est. 2018 |
| Title | PVC Conduit Bends & Fittings. Factory Direct. | We Build the Machines That Make the Pipes. |
| Subtitle | From the manufacturer that designs and builds its own bending machines. Full vertical integration from equipment R&D to finished product. | PVC conduit bends & fittings, factory direct from a bending equipment manufacturer. Full vertical integration from R&D to finished product. |

**Chinese:**

| Element | Current | New |
|---------|---------|-----|
| Eyebrow | ISO 9001 认证制造商 | ISO 9001 认证 · 始于 2018 |
| Title | PVC电工套管弯头及配件 工厂直供 | 造设备的人，做管件。 |
| Subtitle | 来自自主设计和制造弯管机的工厂。从设备研发到成品管件的完整垂直整合。 | PVC电工套管弯头及配件，从弯管设备研发到成品管件的垂直整合制造商。 |

**Unchanged:** CTA buttons, proof strip values (already corrected in H-2).

### Rationale

- Title instantly separates Tianze from every competitor — no other conduit seller can claim "we build the machines"
- Product info (PVC conduit bends & fittings) moves to subtitle — still visible, just not leading
- Chinese title uses natural rhythm ("造设备的人，做管件。") rather than literal translation
- Eyebrow gains Est. 2018 for additional trust signal (redundant with proof strip, intentional for scan-ability)

### Files Changed

- `messages/en/critical.json` — `home.hero.*`
- `messages/zh/critical.json` — `home.hero.*`
- `messages/en.json` — same keys (legacy flat file)
- `messages/zh.json` — same keys (legacy flat file)

---

## M-7: Certification Display — Two-Tier Model

### Problem

Current QualitySection displays 4 cert badges: ISO 9001:2015, UL651/SCH40-80, AS/NZS 2053, ASTM Standards. Only ISO 9001 is actually certified. The others are standards Tianze's products comply with, but listing them as "certifications" risks credibility damage with informed B2B buyers.

### Design

Split into two visual tiers:

**Tier 1 — Certifications (verified, with certificate)**

| Name | Detail |
|------|--------|
| ISO 9001:2015 | Certificate #240021Q09730R0S, valid through 2027-03 |

Display: Prominent badge with checkmark icon, certificate number visible.

**Tier 2 — Standards Compliance (products tested/designed to these standards)**

| Standard | Market | Status |
|----------|--------|--------|
| ASTM D1785 / UL 651 | North America | Compliant |
| AS/NZS 61386 | Australia/NZ | Applying |
| IEC 61386 | Europe/Global | Compliant |
| NOM-001-SEDE | Mexico | Compliant |

Display: Text labels with a different visual treatment (lighter weight, no checkmark icon). AS/NZS 61386 gets an "Applying" badge to be transparent.

**Section heading change:**
- Current: cert badges are a flat row under "Our Commitments"
- New: Add a sub-heading "Certifications & Standards" above the two tiers

**Logo wall placeholder:** Keep as-is (will be populated when partner logos are available).

### Translation Keys

Replace `home.quality.cert1-cert4` with structured keys:

```
home.quality.certifications.title        → "Certifications & Standards"
home.quality.certifications.certified    → "Certified"
home.quality.certifications.compliant    → "Compliant"
home.quality.certifications.applying     → "Applying"
home.quality.certifications.iso9001      → "ISO 9001:2015"
home.quality.certifications.iso9001Num   → "240021Q09730R0S"
home.quality.standards.astm             → "ASTM D1785 / UL 651"
home.quality.standards.asnzs            → "AS/NZS 61386"
home.quality.standards.iec              → "IEC 61386"
home.quality.standards.nom              → "NOM-001-SEDE"
```

### Files Changed

- `src/components/sections/quality-section.tsx` — Replace flat cert badge row with two-tier layout
- `messages/en/critical.json` — Replace `home.quality.cert1-4` with structured certification keys
- `messages/zh/critical.json` — Same
- `messages/en.json`, `messages/zh.json` — Same (legacy)

---

## C-1: Contact Page WhatsApp Entry

### Problem

Contact page shows email + phone but no WhatsApp. B2B export buyers (especially in emerging markets) prefer WhatsApp for initial contact. The global floating WhatsApp button exists but is lazy-loaded (30s delay on homepage, 5s on other pages) and easy to miss.

### Design

Add a WhatsApp contact card to the contact page, at the same visual level as email and phone:

**Location:** Inside the existing contact info Card (right column), as a third contact method row below phone.

**Structure:**
```
[WhatsApp icon]  WhatsApp
                 +XX-XXX-XXXX-XXXX (or "Coming soon" if number not configured)
                 [Chat Now →] button (links to wa.me/{number})
```

**Behavior:**
- Number comes from `siteFacts.contact.whatsapp` (which sources from `SITE_CONFIG.contact.whatsappNumber`)
- If number is the placeholder (`+86-518-0000-0000`), show the row but with "Coming soon" instead of the number, and disable the CTA button
- When real number is configured via `NEXT_PUBLIC_WHATSAPP_NUMBER` env var, it works automatically

**Translation keys:**
```
underConstruction.pages.contact.whatsappLabel  → "WhatsApp"
underConstruction.pages.contact.chatNow        → "Chat Now"
underConstruction.pages.contact.comingSoon      → "Coming Soon"
```

**Important:** `src/lib/contact/getContactCopy.ts` must be updated to expose the new WhatsApp keys in its returned `copy` object, since the contact page consumes translations through this helper, not directly from `t()`.

### Files Changed

- `src/app/[locale]/contact/page.tsx` — Add WhatsApp row in contact info Card
- `src/lib/contact/getContactCopy.ts` — Add WhatsApp fields to copy object
- `messages/en/critical.json` — Add contact WhatsApp keys
- `messages/zh/critical.json` — Same
- `messages/en.json`, `messages/zh.json` — Same (legacy)

---

## C-3: Product Page → Contact Pre-fill

### Status: No Action Needed

Product pages already have `ProductActions` → `InquiryDrawer` which opens a right-side drawer with product name and slug pre-filled. This satisfies the original requirement of reducing buyer friction when inquiring about a specific product.

---

## Out of Scope

- WhatsApp number configuration (pending from owner)
- Logo wall population (pending partner logos)
- New `/certifications` page (Batch 3)
- Hero visual/image changes (right column is still placeholder grid)

---

## Implementation Notes

- All changes are translation file updates + minor component modifications
- No new pages, no new routes, no new dependencies
- QualitySection cert display refactor is the most complex change (layout restructure)
- All other changes are translation key updates
- Dev server verification required after implementation (standard practice from Batch 1)
