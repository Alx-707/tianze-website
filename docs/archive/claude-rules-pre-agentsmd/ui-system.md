---
paths:
  - "src/components/**/*.tsx"
---

# UI Design System

## Component Library

- **Base**: shadcn/ui (Radix UI + Tailwind CSS)
- **Location**: `src/components/ui/`
- **Add component**: `pnpm dlx shadcn@latest add <component>`

## Font Optimization

**IMPORTANT**: Use `next/font/local` for self-hosted fonts, must set `display: 'swap'`.

```typescript
import localFont from 'next/font/local'

const myFont = localFont({
  src: './my-font.woff2',
  display: 'swap',           // Required: prevents FOIT
  variable: '--font-my-font', // Tailwind integration
})

// layout.tsx
<html className={myFont.variable}>
```

### Tailwind v4 Font Integration

Map CSS variables in `globals.css`:

```css
@theme inline {
  --font-sans: var(--font-my-font);
}
```

### Multiple Weights

```typescript
const roboto = localFont({
  src: [
    { path: './Roboto-Regular.woff2', weight: '400', style: 'normal' },
    { path: './Roboto-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-roboto',
})
```

## Styling Rules

### Tailwind CSS v4

- Config in `src/app/globals.css` via `@theme inline` (no `tailwind.config.ts`)
- Use `cn()` to merge conditional classes

### The `cn()` Utility

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
cn("px-4", "px-6")                         // → "px-6"
cn("bg-red-500", isActive && "bg-blue-500")
cn({ "opacity-50": isDisabled })
```

### Dynamic Class Names Forbidden

**IMPORTANT**: Never build class names dynamically — Tailwind will purge them:

```typescript
// ❌ Gets purged
<span className={`bg-${color}-100`} />

// ✅ Use literal mapping
const colors = {
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
} as const;
<span className={colors[status]} />

// ✅ For truly dynamic values, use inline styles
<button style={{ backgroundColor: dynamicColor }} className="rounded-md px-3" />
```

## Responsive Design

Mobile-first. Breakpoints (rem-based):

| Prefix | Min-width | Pixels |
|--------|-----------|--------|
| `sm` | 40rem | 640px |
| `md` | 48rem | 768px |
| `lg` | 64rem | 1024px |
| `xl` | 80rem | 1280px |
| `2xl` | 96rem | 1536px |

Range variant: `md:max-xl:flex`

## Accessibility

- Keyboard accessible interactive elements
- Semantic HTML
- Color contrast ≥ 4.5:1
- Forms: `label` + `aria-invalid` + `aria-describedby`

## Icons

Use Lucide React: `import { ChevronRight } from 'lucide-react'`

## SEO & Metadata

| Feature | Key Points |
|---------|------------|
| `generateMetadata` | `params` must be `await`ed |
| OG Image | `opengraph-image.tsx`, `params` + `id` awaited |
| JSON-LD | Use `src/lib/structured-data.ts` |

## Image Optimization

**Must use `next/image`**, native `<img>` forbidden.

### fill Requires sizes

**IMPORTANT**: `fill` without `sizes` downloads largest image:

```typescript
// ❌ Bad: fill without sizes
<Image src="/hero.png" alt="Hero" fill />

// ✅ Good: specify sizes
<Image src="/hero.png" alt="Hero" fill sizes="100vw" />
<Image src="/card.png" alt="Card" fill sizes="(max-width: 768px) 100vw, 33vw" />
```

### Key Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `priority` | Preload LCP images | Hero image |
| `placeholder="blur"` | Prevent layout shift | Auto-generated for local images |
| `sizes` | Responsive images | Required for `fill` |

### Remote Images

Remote domains must be configured in `next.config.ts` `images.remotePatterns`.

### Project Images

- Storage: `public/images/`
- Reference: `/images/blog/cover.jpg` (absolute path)
- Blur utility: `getBlurPlaceholder()` from `@/lib/image`
