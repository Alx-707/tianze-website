---
name: Tianze Website
description: Provisional design operating model for a B2B manufacturing website focused on qualified inquiry conversion.
status: provisional
colors:
  background: "#fafafa"
  foreground: "#36424a"
  card: "#ffffff"
  primary-steel-blue: "#004d9e"
  primary-steel-blue-dark: "#003b7a"
  primary-steel-blue-light: "#e8f0fe"
  muted-surface: "#f0f1f3"
  muted-text: "#5f6b73"
  border: "#e2e5e9"
  divider: "#ebebeb"
  success: "#0f7b5f"
  warning: "#d97706"
  error: "#dc2626"
  footer-bg: "#2c353b"
typography:
  display:
    fontFamily: "Figtree, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "36px mobile, 48px desktop"
    fontWeight: 800
    lineHeight: "1.1 mobile, 1.0 desktop"
    letterSpacing: "-0.03em mobile, -0.05em desktop"
  headline:
    fontFamily: "Figtree, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Figtree, Source Han Sans SC, Noto Sans SC, PingFang SC, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  unit: "4px"
  container-max: "1080px"
  container-padding: "24px"
  section-y-mobile: "56px"
  section-y-desktop: "72px"
components:
  button-primary:
    backgroundColor: "{colors.primary-steel-blue}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "height 38px, horizontal 20px"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "height 38px, horizontal 20px"
  card-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "24px"
  section-container:
    width: "{spacing.container-max}"
    padding: "{spacing.container-padding}"
---

# Design System: Tianze Website

## 1. Overview

**Creative North Star: "Industrial Procurement Clarity."**

This is a provisional design operating model, not the final visual identity. It gives agents enough boundary to design consistently while leaving room for visual exploration and later refinement.

Tianze should feel like a credible manufacturer that helps overseas buyers make procurement decisions. The design direction is: Vercel's order, grid discipline, spacing, and restraint, combined with manufacturing evidence, product specificity, and industrial credibility. It should not inherit Vercel's SaaS or developer-tool identity.

Current implementation tokens in `src/app/globals.css` are the production baseline. They are not automatically the final brand truth. Use them as the current control panel, then validate visual direction through key pages before freezing a long-term design system.

**Stable principles:**

- Inquiry conversion is the north star.
- Buyer decision clarity matters more than decoration.
- Product specs, manufacturing process, and quality evidence must stay close to claims.
- Industrial credibility beats visual spectacle.
- Vercel-inspired grid and restraint are methods, not identity.

**Not final yet:**

- Final brand color confidence beyond current steel blue baseline.
- Final product photography and hero visual language.
- Final amount of decorative grid usage across non-home pages.
- Final shadow and radius personality after pilot pages.
- Final motion language beyond restrained utility motion.

## 2. Colors

The current palette is a restrained steel-blue and neutral system. It is suitable as a baseline, but should be tested against manufacturing photography and product pages before being treated as final.
The stable design decision is the role-based color architecture, not the exact current blue value. Current color values are provisional and may change after pilot-page validation.

### Primary

- **Industrial Steel Blue** (`#004d9e`): Current primary action, link, and brand accent color. Use for main CTAs and important navigational emphasis.
- **Deep Factory Blue** (`#003b7a`): Hover and stronger action state. Use sparingly to avoid a heavy SaaS feel.
- **Pale Technical Blue** (`#e8f0fe`): Soft surface for low-intensity emphasis, icon backgrounds, and procurement cues.

### Neutral

- **Clean Factory Background** (`#fafafa`): Current page background. It should feel clean and technical, not pure white showroom gloss.
- **Industrial Text Gray** (`#36424a`): Primary text color.
- **Muted Specification Gray** (`#5f6b73`): Secondary copy, metadata, and supporting explanation.
- **Soft Divider Gray** (`#e2e5e9`, `#ebebeb`): Borders, section dividers, and structural grid lines.
- **Controlled White Surface** (`#ffffff`): Cards and elevated content surfaces.

### Status

- **Success Green** (`#0f7b5f`): Completion and confirmation states.
- **Warning Amber** (`#d97706`): Caution states.
- **Error Red** (`#dc2626`): Validation and destructive states.

### Named Rules

**The Evidence First Color Rule.** Use color to clarify action, status, or hierarchy. Do not use color as filler decoration.

**The Low Chroma Rule.** Manufacturing pages should stay restrained. Large saturated surfaces need a strong business reason.

## 3. Typography

**Display Font:** Figtree with system fallbacks.
**Body Font:** Figtree with Chinese fallbacks: Source Han Sans SC, Noto Sans SC, PingFang SC.
**Label / Mono Font:** JetBrains Mono or system monospace for standards, dimensions, SKUs, and technical codes.

**Character:** Typography should feel precise, clean, and easy to scan. It should support procurement reading patterns: headings for quick judgment, tables for specs, and short paragraphs for proof.

### Hierarchy

- **Display** (800, 36px mobile / 48px desktop, tight line-height): Page H1 only. Use for decisive positioning, not vague slogans.
- **Headline** (700, 32px, 1.2 line-height): Section headings.
- **Title** (600 to 700, 18px to 24px): Cards, product groups, and evidence blocks.
- **Body** (400, 16px, relaxed line-height): Explanatory copy. Keep paragraphs short and scannable.
- **Label** (600, 13px, uppercase optional): Eyebrows, specs, tags, and category labels.
- **Mono** (medium weight where needed): Standards, dimensions, tolerances, and technical references.

### Named Rules

**The No Empty Slogan Rule.** If a headline claims quality, precision, stability, or capability, nearby content must provide proof.

## 4. Elevation

The current system is mostly flat with light border-shadow elevation. This fits Tianze if it is used to structure information, not to make surfaces float like consumer cards.

### Shadow Vocabulary

- **Shadow Border** (`0 0 0 1px rgba(0, 0, 0, 0.08)`): Lightweight card boundary and Vercel-style precision.
- **Card Shadow** (`1px ring + subtle 1px and 4px layers`): Default interactive cards where a plain border feels too flat.
- **Card Hover Shadow** (`1px ring + 2px and 8px layers`): Hover feedback for clickable product or evidence cards.
- **Primary Active Ring** (`0 0 0 1px #004d9e, 0 0 0 4px rgba(0, 77, 158, 0.12)`): Strong interactive emphasis, use only when clickability needs to be obvious.

### Named Rules

**The Flat By Default Rule.** Surfaces are flat unless elevation helps separate information or signal interaction.

## 5. Components

### Buttons

- **Shape:** 6px radius for primary and secondary buttons. Pill shapes are allowed only for compact tags or very specific navigation chips.
- **Primary:** Steel blue background with white text. Use for quote, inquiry, sample, and technical discussion actions.
- **Secondary:** White or light surface with border or shadow treatment. Use for catalog, specs, and lower-commitment actions.
- **On dark:** White button on blue or dark surfaces for final CTAs.
- **Hover / Focus:** Quick color or shadow transition, usually 150ms to 200ms. Focus must remain visible.

### Cards / Containers

- **Corner Style:** 8px default radius, 12px max for larger surfaces unless a pilot page proves otherwise.
- **Background:** White cards on clean factory background.
- **Shadow Strategy:** Prefer shadow-border or subtle card shadows. Avoid heavy floating depth.
- **Border:** Use for forms, dividers, and dense grid structures. For standalone marketing cards, current pattern prefers shadow-card.
- **Internal Padding:** 24px default, adjusted down on mobile.

### Product Evidence Blocks

- Lead with product type, standard, dimension, application, or capability.
- Keep specs near the product visual.
- Use tables, short lists, and technical labels instead of long promotional paragraphs.
- Do not hide MOQ, samples, packaging, standards, or customization pathways if they matter to the buyer.

### Inputs / Fields

- **Style:** 40px baseline height, 8px radius, white or transparent background depending on section context.
- **Focus:** Steel-blue focus ring or border. The state must be visible and accessible.
- **Error / Disabled:** Error red plus text explanation. Disabled state should not rely on color alone.

### Navigation

- Use restrained typography and obvious product paths.
- The primary CTA should remain easy to find.
- Dropdown or mobile transitions must clarify hierarchy without feeling animated for show.

### Grid / Page Structure

- Standard content width is 1080px with 24px horizontal padding.
- Decorative grid is strongest on homepage and selected trust/capability pages.
- Do not force the grid onto contact, privacy, terms, or other utility pages where it adds noise.

### Motion

- Motion is a support layer. It should clarify state changes, hierarchy, or feedback.
- Prefer transform and opacity.
- Respect reduced motion.
- Keep most interaction motion under 300ms.
- Do not add heavy animation runtime unless there is a clear conversion or comprehension reason.

## 6. Do's and Don'ts

### Do:

- **Do** design around qualified inquiry conversion, not visual novelty.
- **Do** place product specs, standards, process evidence, and CTA paths close to related claims.
- **Do** use Vercel-like spacing, grid discipline, and restraint as craft references.
- **Do** keep the current tokens as implementation baseline until pilot pages prove a stronger direction.
- **Do** make distributor, contractor, OEM, and integrator concerns visible through content priority and evidence order.
- **Do** use real material cues: PVC fittings, PETG tubes, clean production benches, inspection tools, export packaging, and factory capability.

### Don't:

- **Don't** treat current tokens as final visual identity without pilot-page validation.
- **Don't** make the site look like a generic SaaS template, AI landing page, or developer-tool homepage.
- **Don't** use large decorative gradients, heavy glow, glassmorphism, or over-rounded surfaces as default.
- **Don't** use motion as spectacle. If it does not clarify state or hierarchy, remove it.
- **Don't** use fake certificates, fake logos, unreadable decorative text, or unsupported manufacturing claims.
- **Don't** split pages into persona-specific variants yet. Use primary and secondary persona priority inside one balanced page.
