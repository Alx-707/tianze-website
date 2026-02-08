# Design System Extraction & Comparison

> **Prototypes analyzed**: 5 homepage variants for Tianze (PVC conduit fittings manufacturer)
> **Date**: 2026-02-06
> **Brand essence**: Industrial precision, engineering depth, vertical integration. "The people who build machines build the pipes."

---

## Quick Comparison Matrix

| Token | v1 Navy+Amber | v2 Twitter Blue | v3 The Forge | Stitch A Clean Precision | Stitch B Dark Forge |
|-------|---|---|---|---|---|
| **Primary Color** | `#0F172A` navy | `#1d9bf0` blue | `#0A0A0A` ink black | `#1d9bf0` blue (est.) | `#D63031` red (est.) |
| **Accent/CTA** | `#D97706` amber | `#1d9bf0` blue | `#D63031` ember red | `#1d9bf0` blue (est.) | `#D63031` red (est.) |
| **Background** | `#F8FAFC` off-white | `#FFFFFF` white | `#F5F3F0` warm paper | `#FFFFFF` white (est.) | `#0A0A0A` / `#1A1A1A` dark (est.) |
| **Heading Font** | IBM Plex Sans 700 | Outfit 800 | Archivo Black 900 | Sans-serif ~700 (est.) | Archivo Black or similar (est.) |
| **Body Font** | IBM Plex Sans 400 | Outfit 400 | Manrope 400 | Sans-serif ~400 (est.) | Sans-serif ~400 (est.) |
| **Mono Font** | JetBrains Mono | JetBrains Mono | JetBrains Mono | Mono present (est.) | Mono present (est.) |
| **Border Radius** | 2-4px (sharp) | 8-20px (rounded) | 0px (zero) | 8-12px (rounded, est.) | 0px (zero, est.) |
| **Theme** | Light + dark sections | Light dominant | Warm neutral + dark CTA | Light dominant | Dark dominant |
| **CTA Shape** | Sharp rectangle | Full pill (9999px) | Sharp rectangle (0px) | Pill (est.) | Sharp rectangle (est.) |
| **Container** | 1200px | 1080px | 1080px | ~1080px (est.) | ~1080px (est.) |
| **Section Padding** | clamp(64-120px) | 80px | 80px | ~80px (est.) | ~80px (est.) |
| **Grid Gap** | 20px | 20px | 1px (borderless) | ~20px (est.) | 1px seamless (est.) |
| **Icon Source** | Lucide (line) | Lucide (line) | Lucide (line) | Lucide (line, est.) | Lucide (line, est.) |
| **Brand Bar** | None | None | 3px red fixed top | Navigation bar (est.) | 3px red top bar (est.) |

---

## Per-Prototype Design System

---

### v1 "Navy+Amber"

#### Colors

| Role | Hex | Notes |
|------|-----|-------|
| Primary (Navy) | `#0F172A` | Deep, authoritative slate-navy |
| Navy Light | `#1E293B` | Dark section surface color |
| Navy Mid | `#334155` | Dark borders, secondary panels |
| Amber (CTA) | `#D97706` | Primary action color |
| Amber Hover | `#B45309` | Darkened hover state |
| Amber Bright | `#F59E0B` | Accent on dark backgrounds |
| Amber Glow | `rgba(217,119,6,0.12)` | Tag backgrounds |
| Off-White (BG) | `#F8FAFC` | Main page background |
| Light Gray | `#F1F5F9` | Alternate section BG |
| Border | `#E2E8F0` | Card/divider borders |
| Text | `#020617` | Heading text |
| Text Muted | `#64748B` | Secondary/caption text |
| Success | `#059669` | Certification badge icon |

**Theme**: Mixed light/dark alternation. Light hero, dark tech section, light products, amber CTA band, light scenarios, white commitments, dark final CTA.

#### Typography

| Token | Value |
|-------|-------|
| Heading Font | `'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif` |
| Mono Font | `'JetBrains Mono', 'SF Mono', Consolas, monospace` |
| H1 Size | `clamp(36px, 5vw, 56px)` |
| H1 Weight | 700 |
| H1 Line Height | 1.1 |
| H1 Letter Spacing | -0.03em |
| H2 Size | `clamp(32px, 4vw, 48px)` (dark), `clamp(28px, 3.5vw, 42px)` (light) |
| H2 Weight | 700 |
| H2 Letter Spacing | -0.02em |
| Body Size | 16-18px |
| Body Line Height | 1.6 |
| Label Size | 11px mono, weight 600, spacing 0.12em, uppercase |
| Card Title | 20px, weight 600 |

#### Spacing & Layout

| Token | Value |
|-------|-------|
| Max Width | 1200px |
| Container Padding | `clamp(20px, 4vw, 80px)` |
| Section Padding | `clamp(64px, 8vw, 120px)` vertical |
| Hero Grid | 2-column, 64px gap |
| Product Grid | 2-column, 20px gap |
| Scenario Grid | 3-column, 20px gap |
| Commitment Grid | 5-column, 1px gap (border-separated) |
| Card Padding | 32px |
| Density | Moderate |

#### Visual Effects

| Token | Value |
|-------|-------|
| Shadow SM | `0 1px 2px rgba(15,23,42,0.06)` |
| Shadow MD | `0 4px 6px rgba(15,23,42,0.08)` |
| Shadow LG | `0 10px 15px rgba(15,23,42,0.10)` |
| Border Radius Sharp | 2px (buttons) |
| Border Radius Base | 4px (cards) |
| Border Radius Soft | 6px |
| Grid Texture | 32-48px grid lines at 2-3% opacity on dark sections |
| Card Hover | Border changes to amber + amber shadow glow |
| Scroll Reveal | translateY(24px), 0.5s ease-out, staggered 0.1s |
| Transitions | 0.2s ease-out (no bounce) |
| Reduced Motion | Fully respected |

#### Iconography

- **Source**: Lucide (line icons)
- **Style**: Consistent line weight, 14-28px sizing
- **Color**: Amber on dark, amber/graphite on light

#### Brand Alignment Assessment

- **Industrial precision**: Strong. Sharp 2-4px radii evoke CNC-machined edges. Grid textures on dark backgrounds suggest engineering precision.
- **Machine maker identity**: Good. The dark navy sections with grid textures feel like a technical blueprint. Monospace labels for process steps reinforce engineering identity.
- **Alibaba differentiation**: Moderate. The design is significantly more polished than typical supplier pages, but the amber accent is somewhat common in B2B industrial sites.
- **B2B trustworthiness**: Strong. Dark/light alternation creates visual authority. The restraint in color palette (only navy + amber) signals professionalism.

#### Standout Design Choices

- The amber glow tag background (`rgba(217,119,6,0.12)`) is an effective subtle brand accent without overwhelming
- Clamp-based responsive typography and padding gives smooth scaling
- The 1px-gap commitment grid creates a clean data-table feel
- Grid texture overlay on dark sections is a distinctive engineering motif
- 3-image asymmetric hero layout with floating amber accent square is distinctive

---

### v2 "Twitter Blue"

#### Colors

| Role | Hex | Notes |
|------|-----|-------|
| Primary Blue | `#1d9bf0` | Twitter/X brand blue |
| Blue Hover | `#1a8cd8` | Darkened hover |
| Blue Light | `#e8f5fd` | Badge backgrounds, icon containers |
| Blue 50 | `#f0f9ff` | Stat hover background |
| Blue 900 | `#0c4a6e` | Deep blue (unused in page) |
| White | `#FFFFFF` | Main background |
| Gray 50 | `#f7f9f9` | Alternate section BG |
| Gray 100 | `#eff3f4` | Image placeholder, borders |
| Gray 200 | `#e1e8ed` | Stronger borders |
| Gray 400 | `#9aa5ad` | Placeholder icons |
| Gray 500 | `#6e7781` | Muted text |
| Gray 600 | `#536471` | Secondary text |
| Gray 900 | `#0f1419` | Primary text, dark section BG |
| Success | `#00ba7c` | Certification icons |

**Theme**: Light dominant with single dark final CTA section. Clean, airy, SaaS-influenced.

#### Typography

| Token | Value |
|-------|-------|
| Heading Font | `'Outfit', -apple-system, BlinkMacSystemFont, sans-serif` |
| Mono Font | `'JetBrains Mono', 'SF Mono', Consolas, monospace` |
| H1 Size | `clamp(36px, 4.5vw, 52px)` |
| H1 Weight | 800 |
| H1 Line Height | 1.08 |
| H1 Letter Spacing | -0.03em |
| H2 Size | `clamp(28px, 3.5vw, 40px)` |
| H2 Weight | 700 |
| H2 Letter Spacing | -0.025em |
| Body Size | 16-18px |
| Body Line Height | 1.6 |
| Label Size | 12px mono, weight 500, spacing 0.08em, uppercase |
| Card Title | 18px, weight 600 |

#### Spacing & Layout

| Token | Value |
|-------|-------|
| Max Width | 1080px |
| Narrow Width | 860px |
| Container Padding | 24px (down to 16px mobile) |
| Section Padding | 80px (var(--s-20)) vertical |
| Hero Padding | 96px top, 80px bottom |
| Grid System | 8px base grid |
| Product Grid | 2-column, 20px gap |
| Scenario Grid | 3-column, 20px gap |
| Commitment Grid | 5-column, 20px gap (cards, not border-separated) |
| Card Padding | 24px |
| Density | Sparse/moderate -- more whitespace than v1 |

#### Visual Effects

| Token | Value |
|-------|-------|
| Shadow XS | `0 1px 2px rgba(0,0,0,0.04)` |
| Shadow SM | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` |
| Shadow MD | `0 4px 12px rgba(0,0,0,0.06)` |
| Shadow LG | `0 8px 24px rgba(0,0,0,0.08)` |
| Border Radius SM | 8px |
| Border Radius MD | 12px |
| Border Radius LG | 16px (cards, stats, scenarios) |
| Border Radius XL | 20px (hero image main) |
| Border Radius Full | 9999px (buttons, badges, cert badges) |
| Section Divider | Gradient fade line (`transparent -> border -> transparent`) |
| Blue Glow | Radial gradient behind hero images (4% opacity) |
| Card Hover | Blue border + blue shadow + translateY(-2px) lift |
| Process Timeline | Gradient connecting line behind steps |
| Scroll Reveal | translateY(20px), 0.6s cubic-bezier(0.25,0.1,0.25,1), staggered 0.08s |
| Transition Easing | `cubic-bezier(0.25, 0.1, 0.25, 1)` |
| Blue Float Accent | Blue ring (30% opacity) around hero float image |

#### Iconography

- **Source**: Lucide (line icons)
- **Style**: Line icons with blue tint, 15-28px sizing
- **Placeholder Icons**: Added contextual icons (cog, factory, scan-eye) to image placeholders

#### Brand Alignment Assessment

- **Industrial precision**: Weak. The rounded corners (8-20px), pill-shaped buttons, and light palette read as SaaS/consumer tech, not manufacturing.
- **Machine maker identity**: Weak. Despite the same content, the visual language says "cloud platform" not "factory floor." The blue accent feels tech-forward, not industrial.
- **Alibaba differentiation**: Strong (different direction). This is clearly not an Alibaba page -- but it is also not clearly a manufacturer page. It could be any SaaS product.
- **B2B trustworthiness**: Moderate. Clean and professional, but lacks the industrial weight that signals manufacturing expertise.

#### Standout Design Choices

- The gradient-fade section dividers (`transparent -> border -> transparent`) are an elegant way to separate sections without hard lines
- Blue glow radial gradient behind hero images adds subtle depth
- The 8px spacing grid is systematically applied and consistent
- Process timeline with gradient connecting line is visually clear
- Card lift on hover (`translateY(-2px)`) adds satisfying interactivity
- The Outfit font at weight 800 has strong character while remaining readable

---

### v3 "The Forge"

#### Colors

| Role | Hex | Notes |
|------|-----|-------|
| Ink (Primary) | `#0A0A0A` | Near-black, dominant authority color |
| Charcoal | `#1A1A1A` | Dark section BG |
| Graphite | `#4A4A4A` | Body text secondary |
| Steel | `#7A7A7A` | Muted text, labels |
| Ash | `#B5B5B5` | Very muted decorative elements |
| Smoke | `#E8E6E3` | Surface BG, image placeholders |
| Paper | `#F5F3F0` | Main background (warm off-white) |
| White | `#FFFFFF` | Card surfaces |
| Ember (Accent) | `#D63031` | Single vivid red accent |
| Ember Dark | `#B71C1C` | Hover state |
| Ember Light | `#FDF0F0` | Hover backgrounds |
| Border | `#D8D4CE` | Card/section borders |
| Border Light | `#E8E6E3` | Lighter internal borders |
| Success | `#2D7D46` | Certification checkmarks |

**Theme**: Warm monochrome (grayscale with warm paper tones) + single red accent. The most distinctive palette of all five.

#### Typography

| Token | Value |
|-------|-------|
| Display Font | `'Archivo Black', 'Impact', sans-serif` |
| Body Font | `'Manrope', -apple-system, BlinkMacSystemFont, sans-serif` |
| Mono Font | `'JetBrains Mono', 'SF Mono', Consolas, monospace` |
| H1 Size | `clamp(42px, 6vw, 72px)` -- LARGEST of all prototypes |
| H1 Weight | 900 (Archivo Black is inherently heavy) |
| H1 Line Height | 0.95 -- TIGHTEST of all prototypes |
| H1 Letter Spacing | -0.03em |
| H1 Transform | uppercase |
| H2 Size | `clamp(28px, 3.5vw, 40px)` |
| H2 Weight | 800 (Manrope) |
| H2 Letter Spacing | -0.03em |
| Body Size | 15-17px |
| Body Line Height | 1.6-1.7 |
| Label Size | 11px mono, weight 500, spacing 0.12em, uppercase |
| Section Numbers | `[02]` bracket-wrapped, mono, 11px |
| Button Text | 14px, weight 700, uppercase, 0.02em tracking |

**Three-font strategy**: Display (Archivo Black) for impact, body (Manrope) for readability, mono (JetBrains) for specs. This is the only prototype using a dedicated display typeface.

#### Spacing & Layout

| Token | Value |
|-------|-------|
| Max Width | 1080px |
| Narrow Width | 860px |
| Container Padding | 24px (down to 16px mobile) |
| Section Padding | 80px (var(--s-20)) vertical |
| Hero Padding | 96px + 3px (brand bar offset) top, 80px bottom |
| Grid System | 8px base grid |
| Product Grid | 2-column, **1px gap** with border-as-grid (no card gaps) |
| Scenario Grid | 3-column, **1px gap** border-as-grid |
| Commitment Grid | 5-column, **1px gap** border-as-grid |
| Card Padding | 24px |
| Density | Dense -- 1px grid gaps eliminate whitespace between cards |

#### Visual Effects

| Token | Value |
|-------|-------|
| Brand Bar | 3px fixed red line at very top of viewport |
| Border Radius | **0px everywhere** -- zero radius on all elements |
| Radius XS | 2px (reserved but barely used) |
| Shadows | None on cards -- uses border and background shifts instead |
| Grid Paper | 40px graph-paper grid at 1.8% opacity, radial mask |
| Diagonal Texture | Repeating -45deg lines on hero (0.8% opacity) |
| Ruler Dividers | 1px horizontal line with 7px measurement tick marks at edges |
| Card Hover (Products) | Bottom-border red line animation (width: 0 -> 100%) |
| Card Hover (General) | Background shifts to paper/ember-light |
| Accent-Left | 3px red left border on key copy blocks |
| Hero Badge | Dashes (`---`) between terms instead of dots |
| Scroll Reveal | translateY(16px) -- subtler than others, 0.5s |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` -- mechanical, no bounce |
| Product Spec Bullets | 6px red horizontal dashes, not dots |

#### Iconography

- **Source**: Lucide (line icons)
- **Style**: Line icons, monochrome (graphite) that turn red on hover
- **Sizing**: 14-24px, slightly smaller than other prototypes
- **Icon containers**: No border-radius, no colored backgrounds -- raw square boxes with 1px border

#### Brand Alignment Assessment

- **Industrial precision**: Excellent. Zero border-radius, graph-paper backgrounds, ruler dividers, monochrome palette with single accent -- this screams precision manufacturing and engineering drawings.
- **Machine maker identity**: Excellent. The Archivo Black headlines in uppercase feel like stamped metal. The 3px brand bar at top is like a laser alignment mark. The product grid with 1px gaps resembles a technical specification sheet.
- **Alibaba differentiation**: Excellent. Nothing about this design resembles a typical supplier marketplace. It is completely unique in the B2B manufacturing space.
- **B2B trustworthiness**: Strong. The restraint (single accent color, monochrome base) signals confidence. The warm paper background avoids cold sterility while maintaining professionalism.

#### Standout Design Choices

- **Zero border-radius everywhere** is a bold choice that perfectly matches "CNC precision" brand positioning
- **3px fixed red brand bar** at viewport top is a distinctive, memorable brand element
- **Ruler dividers** with measurement tick marks are a genius detail -- they reference engineering rulers/calipers
- **1px grid gaps** creating border-separated cards instead of spaced cards evokes a spec sheet or data table
- **Warm paper background** (`#F5F3F0`) instead of cold white/gray brings warmth to an otherwise austere design
- **Product card hover animation** (bottom-border slides in from left) is a machined-edge metaphor
- **[02] bracket-wrapped section numbers** reference technical documentation format
- **Archivo Black + Manrope** is an excellent pairing: industrial display + humanist body
- **Graph paper texture** with radial mask subtly reinforces the engineering drawing motif
- **Red accent-left borders** on key copy blocks create a visual "highlight marker" effect
- **6px red dash** bullet points (instead of dots) reference engineering measurement marks

---

### Stitch A "Clean Precision"

> Values estimated from PNG screenshot analysis. Marked with (est.).

#### Colors (estimated)

| Role | Hex (est.) | Notes |
|------|-----------|-------|
| Primary Blue | `#1d9bf0` (est.) | Bright blue, similar to v2 |
| White BG | `#FFFFFF` (est.) | Clean white main background |
| Gray Surface | `#F7F8FA` (est.) | Alternate section backgrounds |
| Dark Section | `#0F1419` (est.) | Navigation bar, final CTA section |
| Text Primary | `#0F1419` (est.) | Dark near-black text |
| Text Secondary | `#536471` (est.) | Gray secondary text |
| Blue Light | `#E8F5FD` (est.) | Icon container backgrounds |
| Border | `#E1E8ED` (est.) | Card borders |
| CTA Blue | `#1d9bf0` (est.) | Primary buttons |
| Success/Green | `#00BA7C` (est.) | Certification badges |

**Theme**: Light dominant. Very clean, professional white-and-blue. Similar color strategy to v2 but with more structured layout and real product images.

#### Typography (estimated)

| Token | Value (est.) |
|-------|-------------|
| Heading Font | Sans-serif, geometric (~Outfit or Inter), weight ~700 |
| Body Font | Same sans-serif, weight ~400 |
| Mono Font | Monospace present for specs and labels |
| H1 Size | ~48-52px (est.) |
| H1 Weight | ~700-800 (est.) |
| H1 Line Height | ~1.1 (est.) |
| H2 Size | ~32-36px (est.) |
| Body Size | ~16px (est.) |
| Label Size | ~12px mono uppercase (est.) |

#### Spacing & Layout (estimated)

| Token | Value (est.) |
|-------|-------------|
| Max Width | ~1080px (est.) |
| Section Padding | ~80px vertical (est.) |
| Product Grid | 4-column (est.) -- more columns than HTML prototypes |
| Scenario Grid | 3-column with actual photos (est.) |
| Commitment Grid | 5-column (est.) |
| Card Padding | ~24px (est.) |
| Card Border Radius | ~8-12px (est.) |
| Density | Moderate -- good whitespace |

#### Visual Effects (estimated)

| Token | Notes |
|-------|-------|
| Navigation | Top navigation bar with logo, text links, and blue CTA button |
| Hero Layout | Left text, right multi-image stack (similar to HTML prototypes) |
| Product Images | **Real product photos** (orange PVC bends, fittings) visible |
| Scenario Images | **Real project photos** (construction, infrastructure) |
| Card Borders | Light 1px borders, likely blue on hover |
| Button Shape | Pill/rounded (est. 9999px or ~24px radius) |
| Shadows | Subtle, similar to v2 |
| Blue CTA Band | Full-width blue section for sample CTA (similar to v2) |
| Cert Badges | Inline badges with checkmark icons |

#### Iconography

- **Source**: Lucide or similar line icons (est.)
- **Style**: Line icons in blue tint within light blue circular/rounded containers
- **Navigation**: Logo mark visible at top-left

#### Brand Alignment Assessment

- **Industrial precision**: Moderate. The real product photos help, but rounded corners and blue palette still lean SaaS.
- **Machine maker identity**: Moderate. Actual factory and product imagery helps communicate manufacturing, but the design framework feels generic tech.
- **Alibaba differentiation**: Strong. Professional enough to stand apart, but the generic blue-and-white framework is common among modern B2B sites.
- **B2B trustworthiness**: Strong. Clean, organized, with certifications prominently displayed. Real product photos add credibility.

#### Standout Design Choices

- **Real product photography** (orange PVC bends, factory shots) -- this is the first prototype to show actual imagery rather than placeholders, which makes a significant difference in perceived credibility
- **4-column product grid** provides better at-a-glance comparison than the 2-column layout in HTML prototypes
- **Statistics prominently placed** (0.05mm, 24/7) near the hero create immediate credibility
- **Navigation bar** is fully designed (the HTML prototypes all skip navigation)

---

### Stitch B "Dark Forge"

> Values estimated from PNG screenshot analysis. Marked with (est.).

#### Colors (estimated)

| Role | Hex (est.) | Notes |
|------|-----------|-------|
| Ink/Black | `#0A0A0A` (est.) | Primary background color |
| Dark Surface | `#1A1A1A` (est.) | Card/section surfaces |
| Red Accent | `#D63031` (est.) | Accent color, CTA buttons, brand bar |
| White | `#FFFFFF` (est.) | Text on dark, some card surfaces |
| Gray Text | `#999999` (est.) | Secondary text on dark |
| Dark Gray | `#333333` (est.) | Borders, secondary surfaces |
| Red Light | `#FDF0F0` (est.) | Possible hover states |

**Theme**: Dark dominant. This is a dark-mode-first design with high-contrast red accents. Shares DNA with v3 but pushes the darkness further.

#### Typography (estimated)

| Token | Value (est.) |
|-------|-------------|
| Display Font | Heavy condensed sans-serif (~Archivo Black), weight 900 |
| Body Font | Clean sans-serif (~Manrope or Inter), weight 400 |
| Mono Font | Monospace present for specs |
| H1 Size | ~60-72px (est.) -- very large display text |
| H1 Weight | 900 (est.) |
| H1 Transform | Mixed case with italic "Machine Makers" |
| H2 Size | ~32-40px (est.) |
| Body Size | ~15-16px (est.) |

#### Spacing & Layout (estimated)

| Token | Value (est.) |
|-------|-------------|
| Max Width | ~1080px (est.) |
| Section Padding | ~80px vertical (est.) |
| Product Grid | 4-column (est.) -- product cards in row |
| Scenario Grid | 3-column then 2-column mixed (est.) |
| Card Padding | ~20-24px (est.) |
| Card Border Radius | ~0px (est.) -- sharp edges throughout |
| Density | Dense -- minimal spacing between elements |

#### Visual Effects (estimated)

| Token | Notes |
|-------|-------|
| Brand Bar | Thin red line at top (matching v3) |
| Navigation | Dark nav with red accent logo text ("TIANZE ELECTRIC") |
| Hero Image | Large industrial crane/machinery photo as hero visual |
| Background | Predominantly dark (#0A0A0A) |
| Red CTA Band | Full-width red/dark section for sample CTA |
| Product Photos | **Real product photos** in circular/framed containers on dark cards |
| Scenario Photos | **Real industrial photos** (data centers, infrastructure, commercial towers) |
| Card Style | Dark surface cards with subtle borders, no rounded corners |
| Grid Pattern | Subtle grid texture on dark backgrounds (est.) |
| Button Style | Sharp rectangle, red fill or red outline |

#### Iconography (estimated)

- **Source**: Line icons (Lucide or similar)
- **Style**: White/gray line icons on dark backgrounds
- **Icon containers**: Square boxes with border, dark fill
- **Logo**: "TIANZE ELECTRIC" in red accent text

#### Brand Alignment Assessment

- **Industrial precision**: Excellent. Dark backgrounds + zero radius + red accents create a powerful industrial aesthetic. The crane hero image immediately signals manufacturing capability.
- **Machine maker identity**: Excellent. This is unmistakably a manufacturer's website. The dark palette with red accent references heavy industrial branding (think Hilti, Milwaukee Tools). The crane imagery in the hero drives home machine-making capability.
- **Alibaba differentiation**: Excellent. This looks nothing like any supplier marketplace. It has a premium, branded feel that positions Tianze as an industry leader, not just another supplier.
- **B2B trustworthiness**: Strong. Dark premium aesthetic signals confidence and investment. Real industrial photography reinforces authenticity. The overall feeling is "we are serious operators."

#### Standout Design Choices

- **Dark-mode-first approach** is rare in B2B manufacturing and immediately differentiating
- **Crane/machinery hero image** is the strongest hero visual across all prototypes -- it literally shows "we build machines"
- **Red on black** creates maximum contrast and energy, referencing industrial warning/precision colors
- **Real industrial scenario photos** (data centers, commercial towers, infrastructure) shown in dark-framed grid
- **Red CTA band** with dark background stands out without being garish
- **"Evaluate Our Build Quality First-Hand"** as CTA section title is strong copy paired with the red accent
- **Compact product cards** with circular product images on dark backgrounds feel like a technical catalog

---

## Cross-Prototype Analysis

### Color Strategy Comparison

| Prototype | Strategy | Industrial Feel (1-5) | Trust Signal (1-5) |
|-----------|----------|----------------------|-------------------|
| v1 Navy+Amber | Navy authority + amber action | 4 | 4.5 |
| v2 Twitter Blue | Bright blue optimism | 2 | 3.5 |
| v3 The Forge | Monochrome + red precision | 5 | 4.5 |
| Stitch A | Blue + white clean | 2.5 | 4 |
| Stitch B | Dark + red power | 5 | 4.5 |

**Analysis**: The monochrome/red family (v3, Stitch B) most effectively communicates industrial precision. Navy+amber (v1) is a solid middle ground. The blue-based approaches (v2, Stitch A) read as tech/SaaS despite identical content.

The warm paper background in v3 (`#F5F3F0`) is a subtle but important differentiator from cold whites -- it suggests real materials rather than digital abstraction.

### Typography Comparison

| Prototype | Heading Character | Technical Authority (1-5) | Readability (1-5) |
|-----------|------------------|--------------------------|-------------------|
| v1 IBM Plex Sans | Professional, engineering heritage | 4 | 4.5 |
| v2 Outfit | Modern, geometric, friendly | 2.5 | 4.5 |
| v3 Archivo Black + Manrope | Powerful, stamped-metal impact | 5 | 4 |
| Stitch A | Clean, neutral | 3 | 4.5 |
| Stitch B | Heavy display (similar to v3) | 5 | 4 |

**Analysis**: v3's three-font strategy (Archivo Black / Manrope / JetBrains Mono) achieves the best balance of impact and usability. Archivo Black in uppercase at 72px with 0.95 line-height is attention-commanding. IBM Plex Sans (v1) has genuine engineering heritage but is subtler. Outfit (v2) is the weakest fit for manufacturing.

### Visual Density Comparison

| Prototype | Card Gap Strategy | Information Density | B2B Appropriateness (1-5) |
|-----------|------------------|-------------------|--------------------------|
| v1 | 20px gaps | Moderate | 4 |
| v2 | 20px gaps + more padding | Sparse | 3 |
| v3 | 1px border-grid | Dense | 5 |
| Stitch A | ~20px gaps | Moderate | 4 |
| Stitch B | Minimal gaps | Dense | 4.5 |

**Analysis**: v3's 1px-gap border-grid approach creates the densest information presentation, which is appropriate for B2B buyers who want to scan specifications quickly. v2's generous whitespace feels more consumer/SaaS-oriented. The ideal is probably between v1's moderate density and v3's maximum density.

### Brand Differentiation Ranking

**From most to least differentiated from generic supplier sites:**

1. **v3 "The Forge"** (Score: 9.5/10) -- Zero-radius, warm monochrome, red accent, ruler dividers, graph paper textures, bracket section numbers. Every design token is intentional and brand-specific. This is unmistakably a precision manufacturer's site.

2. **Stitch B "Dark Forge"** (Score: 9/10) -- Dark-mode-first with red accent, real industrial photography (crane hero), sharp edges. Shares v3's DNA but with the added power of actual imagery. The dark palette is extremely rare in this market segment.

3. **v1 "Navy+Amber"** (Score: 7/10) -- Competent and professional. The navy/amber palette and sharp radii signal manufacturing, and the grid textures are a nice touch. However, the palette is more commonly seen in B2B sites.

4. **Stitch A "Clean Precision"** (Score: 5.5/10) -- Clean and professional but could be any modern B2B tech company. The real product photos are its strongest differentiator. Without them, it would be generic.

5. **v2 "Twitter Blue"** (Score: 4/10) -- Despite strong execution quality, this reads as a SaaS platform. The pill buttons, rounded corners, bright blue, and generous whitespace are the opposite of industrial precision.

---

## Recommended Design Token Set

Based on the analysis above, cherry-picking the strongest tokens from each prototype to propose an ideal design system for Tianze:

### Colors (from v3 + v1)

```css
:root {
  /* Base -- v3 warm monochrome */
  --ink: #0A0A0A;
  --charcoal: #1A1A1A;
  --graphite: #4A4A4A;
  --steel: #7A7A7A;
  --ash: #B5B5B5;
  --smoke: #E8E6E3;
  --paper: #F5F3F0;         /* v3's warm paper -- KEY DIFFERENTIATOR */
  --white: #FFFFFF;

  /* Accent -- v3 ember red */
  --ember: #D63031;
  --ember-dark: #B71C1C;
  --ember-light: #FDF0F0;

  /* Dark sections -- blend v1 navy depth + v3 ink weight */
  --dark-bg: #0F172A;       /* v1's navy for dark sections (warmer than pure black) */
  --dark-surface: #1E293B;  /* v1's navy-light */
  --dark-border: #334155;   /* v1's navy-mid */

  /* Semantic */
  --border: #D8D4CE;        /* v3's warm border */
  --border-light: #E8E6E3;  /* v3 */
  --success: #2D7D46;       /* v3's muted green */
}
```

**Rationale**: v3's warm monochrome + red creates the most distinctive and industrially-authentic palette. Using v1's navy for dark sections (instead of pure black) adds depth and warmth to those areas.

### Typography (from v3)

```css
:root {
  --font-display: 'Archivo Black', 'Impact', sans-serif;  /* v3 -- hero headlines only */
  --font-sans: 'Manrope', -apple-system, sans-serif;      /* v3 -- body + H2-H4 */
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;    /* all prototypes agree */
}
```

| Token | Size | Weight | Source |
|-------|------|--------|--------|
| Display (H1) | `clamp(42px, 6vw, 72px)` | 900 (Archivo Black) | v3 |
| H2 | `clamp(28px, 3.5vw, 40px)` | 800 (Manrope) | v3 |
| H3 | 18-20px | 700 (Manrope) | v1/v3 |
| Body | 16-17px | 400 (Manrope) | v3 |
| Label | 11px, mono, 600, 0.12em, uppercase | | v1/v3 |
| Spec Data | 14px, mono, tabular-nums | | all |

**Rationale**: Three-font strategy gives maximum flexibility. Archivo Black for first-impression impact, Manrope for warm readability, JetBrains Mono for technical credibility.

### Border Radius (from v3)

```css
:root {
  --r-none: 0px;   /* DEFAULT -- cards, buttons, images, everything */
  --r-xs: 2px;     /* Reserved for rare soft exceptions */
}
```

**Rationale**: Zero radius is the strongest brand signal across all prototypes. It communicates CNC-precision machining and differentiates from every SaaS and marketplace competitor.

### Spacing (from v3, system from v2)

```css
:root {
  /* 8px grid (from v2/v3) */
  --s-1: 4px;   --s-2: 8px;   --s-3: 12px;  --s-4: 16px;
  --s-5: 20px;  --s-6: 24px;  --s-8: 32px;  --s-10: 40px;
  --s-12: 48px; --s-16: 64px; --s-20: 80px; --s-24: 96px;

  /* Layout */
  --container: 1080px;            /* v2/v3 -- slightly tighter than v1's 1200px */
  --container-narrow: 860px;      /* v2/v3 */
  --container-px: 24px;           /* v2/v3 */
  --section-py: var(--s-20);      /* 80px */
}
```

### Shadows (from v1, simplified)

```css
:root {
  --shadow-sm: 0 1px 2px rgba(15,23,42,0.06);   /* v1 */
  --shadow-md: 0 4px 6px rgba(15,23,42,0.08);    /* v1 */
  --shadow-lg: 0 10px 15px rgba(15,23,42,0.10);  /* v1 */
}
```

**Rationale**: v1's navy-tinted shadows are warmer than v2's neutral black shadows. v3 avoids shadows entirely (using borders instead), which is valid but shadows add useful depth for hero images.

### Signature Effects (from v3 + v1)

| Effect | Source | Value |
|--------|--------|-------|
| Brand Bar | v3 | 3px fixed red line at top |
| Ruler Dividers | v3 | 1px line with 7px tick marks at edges |
| Grid Paper Texture | v3 | 40px grid, 1.8% opacity, radial mask |
| Grid Texture (dark) | v1 | 32px grid, 2-3% opacity on dark sections |
| Accent-Left Border | v3 | 3px red left border on key copy blocks |
| Product Hover | v3 | Bottom-border slides in (width: 0 -> 100%) |
| Card Grid | v3 | 1px gap border-grid (no spacing between cards) |
| Section Numbers | v3 | `[02]` bracket-wrapped monospace |
| Spec Bullets | v3 | 6px red horizontal dashes |

### Buttons (from v3)

```css
.btn {
  padding: 14px 28px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border-radius: 0px;             /* v3 zero radius */
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary {
  background: var(--ember);       /* Red CTA */
  color: var(--white);
}
```

### Animation (from v3 + v1)

| Type | Duration | Easing |
|------|----------|--------|
| Color/border transitions | 200ms | `cubic-bezier(0.16, 1, 0.3, 1)` (v3) |
| Scroll reveal | 500ms | Same easing, translateY(16px) |
| Reveal stagger | 60ms per step | v3 |

**Forbidden**: bounce, spring, overshoot, scale transforms, opacity pulses.

### Recommended from Stitch Prototypes

| Element | Source | Recommendation |
|---------|--------|---------------|
| Real product photography | Stitch A, B | Prioritize actual factory/product images over placeholders |
| Navigation bar | Stitch A, B | Both show full navigation; HTML prototypes skip this |
| Crane/machinery hero | Stitch B | Use machine-building imagery as hero visual |
| 4-column product grid | Stitch A, B | Consider wider product grid for quick scanning |
| Industrial scenario photos | Stitch B | Dark-framed industrial photos reinforce capability |

---

## Summary Verdict

**The Forge (v3) provides the strongest design foundation** for Tianze's brand. Its zero-radius philosophy, warm monochrome palette, and industrial details (ruler dividers, graph paper, bracket numbering) create a visual language that is immediately recognizable and perfectly aligned with the "machine makers build the pipes" brand essence.

**Stitch B validates the dark direction** with real imagery, proving that v3's tokens translate powerfully when combined with actual industrial photography.

The recommended token set combines v3's distinctive visual identity with v1's warm navy for dark sections, v2's systematic spacing grid, and Stitch B's imagery strategy. The result should be a website that a B2B buyer immediately recognizes as a serious manufacturer -- not a trader, not a SaaS company, not another Alibaba listing.
