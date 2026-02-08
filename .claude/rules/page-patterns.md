---
paths:
  - "src/app/**/page.tsx"
  - "src/components/sections/**"
---

# Page Design Patterns

When creating or modifying pages and section components, follow the Page Pattern Reference:

**Reference:** `docs/design/system/PAGE-PATTERNS.md`

## Quick Constraints

- **Container**: `mx-auto max-w-[1080px] px-6` — never use `container` class or other max-width values
- **Section spacing**: `py-14 md:py-[72px]` — consistent across all sections
- **H1 typography**: `text-[36px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[48px] md:leading-[1.0] md:tracking-[-0.05em]`
- **H2**: Use `SectionHead` component — never write raw h2 with custom styles
- **Cards**: Use `shadow-card` system — never use `border border-border` for card edges
- **Dividers**: Use `section-divider` class between sections
- **CTA buttons on dark bg**: Use `variant="on-dark"` / `variant="ghost-dark"`

Read the full reference before implementing any page.
