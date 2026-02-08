# Stitch Prompt: Homepage V4.1

> Generate ONE refined version based on V4 feedback
> Date: 2026-02-04

---

## Project Context

**Company:** Tianze (天泽管业) — PVC conduit fittings manufacturer
**Core Differentiation:** We build bending machines, so we understand bends. Full-chain control from equipment design to finished product.
**Target Audience:** Overseas B2B buyers (contractors, distributors, OEM clients)
**Conversion Goal:** Quote requests + Free sample applications

---

## Design System (REQUIRED)

### Color Palette

| Role | OKLCH Value | Hex Fallback | Usage |
|------|-------------|--------------|-------|
| **Primary** | `oklch(0.45 0.090 230)` | `#3d618a` | Buttons, links, accents |
| **Primary Hover** | `oklch(0.37 0.070 230)` | `#2d4a6a` | Button hover states |
| **Background** | `oklch(0.99 0.005 230)` | `#f8f9fb` | Page background (blue-tinted white) |
| **Foreground** | `oklch(0.15 0.030 230)` | `#1a2332` | Primary text |
| **Muted** | `oklch(0.50 0.040 230)` | `#64748b` | Secondary text |
| **Card** | `oklch(1 0 0)` | `#ffffff` | Card backgrounds |
| **Border** | `oklch(0.90 0.015 230)` | `#e2e8f0` | Borders, dividers |
| **Dark Section** | `oklch(0.20 0.030 230)` | `#1a2636` | Dark backgrounds (Section 2 & 8) |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| **Display/H1** | Space Grotesk | 700 | 48-64px |
| **H2** | Space Grotesk | 600 | 32-40px |
| **H3** | Space Grotesk | 600 | 24-28px |
| **Body** | Space Grotesk | 400 | 16-18px |
| **Small/Labels** | Space Grotesk | 500 | 12-14px, uppercase tracking-wide |

### Border Radius (Micro Precision)

| Element | Radius |
|---------|--------|
| Buttons | 4-6px |
| Cards | 8px |
| Badges/Tags | 4px |
| Large containers | 12px |

### Shadows (Slate-Toned)

```css
--shadow-sm: 0 1px 2px 0 rgb(15 23 42 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(15 23 42 / 0.08), 0 2px 4px -2px rgb(15 23 42 / 0.06);
--shadow-lg: 0 10px 15px -3px rgb(15 23 42 / 0.08), 0 4px 6px -4px rgb(15 23 42 / 0.04);
```

---

## Page Structure (8 Sections)

### Visual Rhythm
```
Section 1: Hero ─────────────── Light background + factory imagery
Section 2: Full Chain Tech ──── Dark background (Primary-900)
Section 3: Products ─────────── Light background
Section 4: Sample CTA ───────── Primary color block
Section 5: Scenarios ────────── Light gray background
Section 6: Quality ──────────── Light background
Section 7: Certifications ───── White background (compact)
Section 8: Final CTA ────────── Dark background (matching Section 2)
```

---

## Section 1: Hero

### Content

**Trust Badge:** 「15 Years in Bending Equipment」

**Headline:**
PVC Conduit Bends. Built by the Engineers Who Build the Machines.

**Subheadline:**
From equipment design to finished product — every step under one roof.

**Single CTA:** See How We Build ↓

**Social Proof Line:** Exporting to 50+ countries · ISO 9001:2015 Certified

### Visual Design: Three-Image Stacking

**CRITICAL: Asymmetric Image Cluster Layout**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────┐                                                    │
│  │ SMALL   │                                                    │
│  │ Float   │  ┌─────────────────────────────────────────────┐   │
│  │ Detail  │  │                                             │   │
│  └─────────┘  │           MAIN IMAGE                        │   │
│               │           Bending Machine                   │   │
│               │           85% width × 75% height            │   │
│               │                                             │   │
│  ┌────────────┤                                             │   │
│  │ SECONDARY  │                                             │   │
│  │ Production │─────────────────────────────────────────────┘   │
│  │ Line       │                                                 │
│  │ 50%×40%    │                                                 │
│  └────────────┘                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Image Configuration:**
| Position | Size | Content | Purpose |
|----------|------|---------|---------|
| Main | 85% width × 75% height | Bending machine equipment | Core differentiation |
| Secondary | 50% width × 40% height, bottom-left overlap | Production line panorama | Scale impression |
| Small Float | Small square, top-left | Bend close-up detail | Product quality |

### Design Requirements

- **Background:** Light with subtle factory/industrial atmosphere (NOT dark)
- **Three-image stacking:** Asymmetric cluster, main image dominant
- **Trust Badge:** Small pill/tag above headline
- **CTA:** Single button with down arrow, guides scrolling exploration
- **NO Process Bar in Hero** — moved to Section 2
- **Mobile:** Images stack vertically

---

## Section 2: Full Chain Technology

### Content

**Section Header:** Full-Chain Control. No Middlemen. No Guesswork.

**Process Flow (Icon Bar):**
```
[Blueprint Icon] ──→ [Machine Icon] ──→ [Mold Icon] ──→ [Product Icon]
 Machine Design      Manufacturing      Mold Making     Conduit Production
```

**Supporting Copy:**
We design the bending machines. We build the molds. We produce the conduits. This is how we guarantee consistency others can't match.

**Stats Row (optional):**
- 200+ Equipment Patents
- 24/7 Production Lines
- 50+ Export Countries

### Design Requirements

- **Background:** Dark (Primary-900 or `#1a2636`)
- Horizontal icon flow with connecting arrows
- Icons: Line-style, industrial feel
- Process bar has caption text below each icon
- Stats row as supplementary (optional)
- Text: Light/white on dark background

---

## Section 3: Product Lines

### Content

**Header:** Four Product Lines. One Factory.

**Subheader:** 16mm to 168mm diameter. Custom OD, wall thickness, and length available.

**Trust Tag:** 「Exported to 50+ Countries」

### Product Cards (4 cards, numbered 01-04)

**Card 01: Standard Conduit Bends**
- Tag: `In-House Mold`
- Specs: 90°/45°/Custom angles · Schedule 40 & 80 · ASTM, UL651, AS/NZS
- CTA: View Specifications →

**Card 02: Bell End Fittings**
- Tag: `In-House Mold`
- Specs: Double-socket design · Faster installation · No couplings needed
- CTA: View Specifications →

**Card 03: Flared Fittings — AU Standard**
- Tag: `In-House Mold`
- Specs: AS/NZS 2053 compliant · Reduces cable abrasion · Smooth internal surface
- CTA: View Specifications →

**Card 04: Custom & OEM Projects**
- Tag: `In-House Mold`
- Specs: Low MOQ prototypes · 48-hour drawings · Private labeling
- CTA: Discuss Your Project →

### Design Requirements

- Large numbered labels (01, 02, 03, 04) for each card
- Each card has corner tag "In-House Mold"
- Cards should show product images
- Grid layout: 2×2 on desktop, single column on mobile
- Light background

---

## Section 4: Free Sample CTA

### Content

**Headline:** Test Before You Commit.

**Body:** Request free samples and verify the quality yourself. No obligation. No pressure.

**CTA Button:** Request Free Samples

**Supporting Text:** Ships within 3 business days · You only pay freight

### Design Requirements

- Full-width section with Primary color background (`#3d618a`)
- Centered text, single prominent CTA button (white/light button on primary bg)
- Keep it compact, single-line feel

---

## Section 5: Application Scenarios (6 Cards, 2×3 Grid)

### Content

**Section Header:** Where Our Conduits Work

### Scenario Grid (2 rows × 3 columns)

**Row 1:**

| Scenario 1 | Scenario 2 | Scenario 3 |
|------------|------------|------------|
| **Underground Pre-Burial** | **Double-Socket Connections** | **Australian Standard Fittings** |
| Pre-bent conduits for direct burial. Consistent bend radius. No cracking. | Push-fit connection. 30% faster installation. No separate couplings. | Flared entry reduces cable wear. Required for AU commercial projects. |
| "Saved us 2 days on site." — *PM, Middle East* | "No glue on one end, done." — *Contractor, Texas* | "Finally found a supplier who understands AU standards." — *Sydney* |

**Row 2:**

| Scenario 4 | Scenario 5 | Scenario 6 |
|------------|------------|------------|
| **Hospital Pneumatic Systems** | **Municipal Infrastructure** | **Commercial Building Projects** |
| High-clarity PETG tubes. Leak-proof joints. Silent operation. | Up to 168mm diameter. Underground cable protection for power & telecom. | Complete conduit solutions for commercial electrical systems. |
| "Zero leaks in 18 months." — *Facilities Director* | "Big pipes, tight tolerances." — *City Engineer, SEA* | "Consistent quality across 3 projects." — *Director, UAE* |

### Design Requirements

- **Grid:** 2 rows × 3 columns (desktop), 2 columns or single (mobile)
- Each card: Image + Title + Description + Testimonial
- Testimonials: Quotation marks, italicized attribution
- Background: Light gray (`#f1f5f9`)
- Cards: White with subtle shadow

---

## Section 6: Quality Commitments

### Content

**Section Header:** Our Commitments. In Writing.

**Trust Badge:** 「200+ Patents in Bending Technology」

### Commitment Grid (5 items)

| Icon | Title | Description |
|------|-------|-------------|
| Target/Precision | ±0.3mm tolerance | Precision you can measure |
| No-Recycle | 100% virgin material | No recycled resin. Ever. |
| Gear/Machine | 24-hour production lines | Machines run. Deadlines met. |
| Ruler | 16–168mm diameter range | OD, wall thickness, length — all customizable |
| Clock | 24-hour response | 48-hour drawings. We move when you need us. |

**Closing Statement:**
**We build bending machines. That's why we understand bends.**

### Design Requirements

- Icon + text grid layout (2-3 columns on desktop)
- Icons: Line-style, industrial feel
- Closing statement: Bold, centered
- Light background, clean layout

---

## Section 7: Certifications & Partners (Compact)

### Content

**Section Header:** Certified. Trusted. Worldwide.

**Certification Badges:**
ISO 9001:2015 · UL651 · CE · AS/NZS 2053

**Logo Wall Subheader:** Trusted by contractors and distributors in 50+ countries

[Client logos / Certification badges placeholder]

### Design Requirements

- **COMPACT section** — minimal vertical space
- White background
- Certification badges: Horizontal row
- Logo wall: Grayscale, hover to full color
- Can be single row or two rows max

---

## Section 8: Final CTA

### Content

**Headline:** Ready to Talk?

**Subheadline:** Get a quote, book a technical consultation, or just ask a question. We respond within 24 hours.

**Primary CTA:** Get Factory-Direct Quote

**Secondary CTA:** Book Technical Consultation

**Tertiary CTA:** Subscribe for product updates [Email input]

**Trust Line:** 📞 24-hour response guaranteed · 🏭 Factory direct · 🌍 50+ countries served

**FAQ Link:** Have questions? See FAQs →

### Design Requirements

- Dark background (matching Section 2)
- Multiple CTA options with clear hierarchy
- Email subscription as inline form
- Trust icons/text at bottom

---

## Key Changes from V4

| Aspect | V4 | V4.1 |
|--------|----|----|
| Sections | 6 | 8 |
| Hero CTA | Dual (Quote + Samples) | Single (See How We Build) |
| Hero Background | Dark | Light + factory |
| Hero Visual | Process Bar embedded | Three-image stacking |
| Process Bar | In Hero | Independent Section 2 |
| Scenarios | 5 mixed layout | 6 in 2×3 grid |
| Logo Wall | Embedded in scenarios | Independent Section 7 |
| Info Density | Front-heavy | Balanced |

---

## Anti-Patterns (DO NOT USE)

- ❌ Pure white (#fff) backgrounds — use blue-tinted white `#f8f9fb`
- ❌ Generic tech blue — use Industrial Steel Blue (hue 230)
- ❌ Inter or default system fonts — use Space Grotesk
- ❌ Large border radius (16px+) — use micro precision (4-8px)
- ❌ Gray shadows — use slate-toned shadows
- ❌ Stock photos of handshakes or generic factories
- ❌ Floating 3D mockups or abstract illustrations
- ❌ Words: revolutionary, cutting-edge, seamless, leverage, empower
- ❌ Dark Hero background — use light factory-style
- ❌ Dual CTAs in Hero — single exploration CTA only

---

## Output Specifications

- **Device:** Desktop-first
- **Width:** 1440px viewport
- **Format:** Full landing page screenshot + HTML/CSS code
- **Versions:** 1 (Refined based on V4 feedback)

---

## File Naming

```
homepage-v4.1/
├── screenshot/landing-page.png
└── code/index.html
```
