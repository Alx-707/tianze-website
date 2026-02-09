# Stitch Prompt: Homepage V4

> Generate TWO versions: Standard (conservative) and Bold (dramatic)
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
| **Background** | `oklch(0.99 0.005 230)` | `#f8f9fb` | Page background (blue-tinted white, NOT pure white) |
| **Foreground** | `oklch(0.15 0.030 230)` | `#1a2332` | Primary text |
| **Muted** | `oklch(0.50 0.040 230)` | `#64748b` | Secondary text |
| **Card** | `oklch(1 0 0)` | `#ffffff` | Card backgrounds |
| **Border** | `oklch(0.90 0.015 230)` | `#e2e8f0` | Borders, dividers |

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

## Page Structure (6 Sections)

### Visual Rhythm
```
Section 1: Hero ────────── Dark background (Primary-900 or dark gradient)
Section 2: Products ────── Light background (Background color)
Section 3: Sample CTA ──── Primary color block (Primary-600)
Section 4: Cases ───────── Alternating light/subtle gray
Section 5: Quality ─────── Light background
Section 6: Final CTA ───── Dark background (matching Hero)
```

---

## Section 1: Hero

### Content

**Headline:**
PVC Conduit Bends. Built by the Engineers Who Build the Machines.

**Subheadline:**
We design bending machines. We build the molds. We produce the conduits. From equipment to finished product — every step under one roof.

**Process Bar (Icon Flow):**
```
[Blueprint Icon] → [Machine Icon] → [Mold Icon] → [Product Icon]
Machine Design    Manufacturing    Mold Making    Conduit Production
```
Caption: "Full-chain control. No middlemen. No guesswork."

**Trust Badge:** 「15 Years in Bending Equipment」

**Primary CTA:** Get Factory-Direct Quote (Primary button)

**Secondary CTA:** Request Free Samples (Outline/Ghost button)

**Social Proof Line:** Exporting to 50+ countries · ISO 9001:2015 Certified

### Design Requirements

- Dark hero background with subtle grid/blueprint pattern
- Process bar should be horizontal icon flow with arrows connecting steps
- Trust badge as small pill/tag near headline
- CTAs side by side on desktop, stacked on mobile
- Hero image: Show bending machine or factory equipment (real industrial, not stock)

---

## Section 2: Product Lines

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
- Cards should show product images (conduit bends, fittings)
- Grid layout: 2x2 on desktop, single column on mobile

---

## Section 3: Free Sample CTA

### Content

**Headline:** Test Before You Commit.

**Body:** Request free samples and verify the quality yourself. No obligation. No pressure.

**CTA Button:** Request Free Samples

**Supporting Text:** Ships within 3 business days · You only pay freight

### Design Requirements

- Full-width section with Primary color background
- Centered text, single prominent CTA button (white/light button on primary bg)
- Keep it compact, single-line feel

---

## Section 4: Application Cases + Testimonials

### Content

**Section Header:** Where Our Conduits Work

### 5 Case Cards

**Case 1: Underground Pre-Burial**
- Scene: PVC conduit bends for underground electrical installation
- Description: Pre-bent conduits for direct burial. Consistent bend radius. No cracking under soil pressure.
- Testimonial: "The bends arrived ready to install. Saved us 2 days on site." — Project Manager, Middle East Infrastructure Co.

**Case 2: Double-Socket Connections**
- Scene: Bell end fittings for faster conduit assembly
- Description: Double-socket design eliminates separate couplings. Push-fit connection. 30% faster installation.
- Testimonial: "Our crews love these. No glue on one end, done." — Electrical Contractor, Texas

**Case 3: Australian Flared Fittings**
- Scene: AS/NZS compliant flared fittings for cable protection
- Description: Flared entry reduces cable wear during pull-through. Required for Australian commercial projects.
- Testimonial: "Finally found a supplier who understands AU standards." — Procurement Lead, Sydney

**Case 4: Hospital Pneumatic Systems**
- Scene: PETG tubing for medical logistics
- Description: High-clarity PETG tubes for pneumatic delivery systems. Leak-proof joints. Silent operation.
- Testimonial: "Zero leaks in 18 months. That's the standard we need." — Facilities Director, Regional Hospital

**Case 5: Municipal Large-Diameter**
- Scene: Large-bore conduits for city infrastructure
- Description: Up to 168mm diameter. Underground cable protection for municipal power and telecom.
- Testimonial: "Big pipes, tight tolerances. They delivered." — City Engineer, Southeast Asia

### Logo Wall

**Header:** Trusted by contractors and distributors in 50+ countries

(Placeholder for client/certification logos: ISO, UL, CE, AS/NZS badges)

### Design Requirements

- Case cards with scene image, description, and testimonial quote
- Testimonials with quotation marks, italicized attribution
- Alternating layout (image left/right) or card grid
- Logo wall at bottom with grayscale logos, hover to full color

---

## Section 5: Quality Commitments

### Content

**Section Header:** Our Commitments. In Writing.

**Trust Badge:** 「200+ Patents in Bending Technology」

### Commitment Grid (5 items with icons)

| Icon | Title | Description |
|------|-------|-------------|
| Target/Precision | ±0.3mm tolerance | Precision you can measure |
| Recycle-off | 100% virgin material | No recycled resin. Ever. |
| Gear/Machine | 24-hour production lines | Machines run. Deadlines met. |
| Ruler | 16–168mm diameter range | OD, wall thickness, length — all customizable |
| Clock | 24-hour response. 48-hour drawings. | We move when you need us. |

**Closing Statement:**
**We build bending machines. That's why we understand bends.**

### Design Requirements

- Icon + text grid layout (2-3 columns on desktop)
- Icons should be line-style, industrial feel
- Closing statement as bold, centered text
- Light background, clean layout

---

## Section 6: Final CTA

### Content

**Headline:** Ready to Talk?

**Subheadline:** Get a quote, book a technical consultation, or just ask a question. We respond within 24 hours.

**Primary CTA:** Get Factory-Direct Quote

**Secondary CTA:** Book Technical Consultation

**Tertiary CTA:** Subscribe for product updates [Email input]

**Trust Line:** 📞 24-hour response guaranteed · 🏭 Factory direct · 🌍 50+ countries served

**FAQ Link:** Have questions? See FAQs →

### Design Requirements

- Dark background matching Hero
- Multiple CTA options with clear hierarchy
- Email subscription as inline form
- Trust icons/text at bottom

---

## Version Requirements

### Version A: Standard (Conservative)

**Style Direction:**
- Clean, professional, organized
- Predictable layout patterns
- Moderate whitespace
- Subtle shadows and borders
- Safe typography hierarchy
- Trust-focused, corporate feel

**Reference:** Traditional B2B manufacturing website, Linear.app's clean structure

### Version B: Creative Freedom

**Style Direction:**
Let Stitch freely interpret the design. No visual constraints.

**Requirements:**
- Keep the 6-section content structure exactly as specified
- Use all the copy/text provided above
- Apply the color palette (Steel Blue primary)
- Everything else: typography, layout, spacing, visual hierarchy — complete creative freedom

**Goal:** Surprise us. Show what's possible when an AI designer has no constraints.

---

## Anti-Patterns (DO NOT USE)

- ❌ Pure white (#fff) backgrounds — use blue-tinted white
- ❌ Generic tech blue — use Industrial Steel Blue (hue 230)
- ❌ Inter or default system fonts — use Space Grotesk
- ❌ Large border radius (16px+) — use micro precision (4-8px)
- ❌ Gray shadows — use slate-toned shadows
- ❌ Stock photos of handshakes or generic factories
- ❌ Floating 3D mockups or abstract illustrations
- ❌ Words: revolutionary, cutting-edge, seamless, leverage, empower

---

## Output Specifications

- **Device:** Desktop-first
- **Width:** 1440px viewport
- **Format:** Full landing page screenshot + HTML/CSS code
- **Versions:** 2 (Standard + Bold)

---

## File Naming

```
version-a-standard/
├── screenshot/landing-page.png
└── code/index.html

version-b-bold/
├── screenshot/landing-page.png
└── code/index.html
```
