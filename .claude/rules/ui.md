---
paths:
  - "src/components/**/*.tsx"
  - "src/app/**/page.tsx"
  - "src/components/sections/**"
---

# UI Coding Constraints

## Before Creating Components

Check `src/components/` subdirectories (`ui/`, `blocks/`, `sections/`, `forms/`, `products/`, `layout/`, `contact/`, `trust/`) for existing components before creating new ones.

## Design Tokens

Design values (spacing, color, typography) live in `src/app/globals.css` and design system docs — not in component code.

```typescript
// ❌ Hardcoded values
<div className="text-[#004d9e]" style={{ maxWidth: '1080px' }} />

// ✅ Design tokens from globals.css
<div className="text-primary" style={{ maxWidth: 'var(--container-max)' }} />
```

Design system references:
- Production truth: `src/app/globals.css`
- Page patterns: `docs/impeccable/system/PAGE-PATTERNS.md`
- Design tokens: `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`

## Component Library

- **Base**: shadcn/ui (Radix UI + Tailwind CSS) at `src/components/ui/`
- **Add**: `pnpm dlx shadcn@latest add <component>`
- **Icons**: Lucide React — `import { ChevronRight } from 'lucide-react'`

## Tailwind CSS v4

Config via `@theme inline` in `globals.css` (no `tailwind.config.ts`).

### `cn()` for conditional classes

```typescript
import { cn } from '@/lib/utils';
cn("px-4", "px-6")                          // → "px-6" (merge)
cn("bg-red-500", isActive && "bg-blue-500") // conditional
```

### Dynamic class names forbidden

Tailwind only detects complete class names it can statically see in source files. Do not build utility names by string interpolation:

```typescript
// ❌ Gets purged — Tailwind can't see the full class name
<span className={`bg-${color}-100`} />

// ✅ Literal mapping
const colors = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
} as const;
<span className={colors[status]} />

// ✅ Truly dynamic → inline style
<button style={{ backgroundColor: dynamicColor }} className="rounded-md px-3" />
```

## Image

Default to `next/image` for user-facing app images. Native `<img>` is only acceptable when optimization is intentionally skipped or unsupported, and the reason should be obvious in code. For API details (fill, sizes, preload/priority, placeholder), see `.next-docs/` image docs.

## Font & Metadata

For `next/font` and `generateMetadata` usage, see `.next-docs/` — font and metadata docs are version-locked there.
