# Template Usage Guide

> Historical / optional guide:
> the current repository is **Tianze Website**, not a generic starter template.
> Use this document only when deliberately adapting the codebase structure for another project.
> For current repository truth, use:
> - [`CANONICAL-TRUTH-REGISTRY.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/CANONICAL-TRUTH-REGISTRY.md)
> - [`POLICY-SOURCE-OF-TRUTH.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/POLICY-SOURCE-OF-TRUTH.md)

This document explains how to adapt the codebase patterns for a future derivative project.

## Quick Start

```bash
# 1. Clone the template
git clone <repo> client-project-name
cd client-project-name

# 2. Update business data
# Edit src/sites/<site-key>.ts as the primary site identity source

# 3. Update translations
# Edit shared messages in messages/* only when every site should inherit them
# Edit src/sites/<site-key>/messages/* for site-specific copy

# 4. Run development server
pnpm install
pnpm dev
```

## Key Configuration Files

### 1. Site Configuration (`src/sites/<site-key>.ts`)

Primary source of truth for brand, SEO, contact, social links, and site-level facts:

```typescript
export const SITE_CONFIG = {
  baseUrl: 'https://your-domain.com',
  name: 'Your Company Name',
  description: 'Your company description',
  seo: {
    titleTemplate: '%s | Your Company',
    defaultTitle: 'Your Company',
    defaultDescription: 'Your default SEO description',
    keywords: ['keyword-1', 'keyword-2'],
  },
  social: {
    twitter: 'https://x.com/your-company',
    linkedin: 'https://linkedin.com/company/your-company',
    github: 'https://github.com/your-company',
  },
  contact: {
    phone: '+86-xxx-xxxx-xxxx',
    email: 'sales@client.com',
  },
} as const;
```

### 2. Compatibility Wrappers (`src/config/site-facts.ts`, `src/config/paths/site-config.ts`)

These wrappers point to the active site, but they are not the place to define new canonical brand truth:

```typescript
export const siteFacts: SiteFacts = {
  company: {
    name: 'Client Company Name',
    established: 2010,
    location: { country: 'China', city: 'Shenzhen' },
  },
  contact: {
    phone: '+86-xxx-xxxx-xxxx',
    email: 'sales@client.com',
  },
  certifications: [
    { name: 'ISO 9001', file: '/certs/iso9001.pdf' },
  ],
  stats: {
    exportCountries: 50,
    clientsServed: 500,
  },
  social: {
    linkedin: 'https://linkedin.com/company/client',
  },
};
```

Prefer updating `src/sites/<site-key>.ts` first. Treat wrappers as consumption surfaces, not authoring surfaces.

### 3. Translation Files (`messages/[locale]/`)

Shared user-facing text that every site can inherit:

```
messages/
├── en/
│   ├── critical.json    # Above-fold content
│   └── deferred.json    # Below-fold content
└── zh/
    ├── critical.json
    └── deferred.json
```

For site-specific copy, use:

```
src/sites/<site-key>/messages/
├── en/
│   ├── critical.json
│   └── deferred.json
└── zh/
    ├── critical.json
    └── deferred.json
```

## Creating New Block Components

### Step 1: Copy the Template

```bash
cp src/components/blocks/_templates/BLOCK_TEMPLATE.tsx \
   src/components/blocks/[category]/[name]-block.tsx
```

### Step 2: Update the Component

1. Rename the component function and interface
2. Change the default `i18nNamespace`
3. Add your content structure

### Step 3: Required Patterns

All blocks must use these primitives:

```tsx
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { siteFacts } from '@/config/site-facts';

export function MyBlock({ i18nNamespace = 'myBlock' }) {
  const t = useTranslations(i18nNamespace);

  return (
    <Section spacing="xl" background="default">
      <Container size="xl">
        {/* Your content */}
      </Container>
    </Section>
  );
}
```

### Section Variants

| Spacing | Class | Use Case |
|---------|-------|----------|
| `none` | - | No vertical padding |
| `sm` | `py-8` | Compact sections |
| `md` | `py-12` | Standard sections |
| `lg` | `py-16` | Featured sections |
| `xl` | `py-20` | Hero/CTA sections |

| Background | Effect |
|------------|--------|
| `default` | Transparent |
| `muted` | Semi-transparent muted |
| `gradient` | Gradient background |

### Container Variants

| Size | Max Width | Use Case |
|------|-----------|----------|
| `sm` | 640px | Narrow content |
| `md` | 768px | Medium content |
| `lg` | 1024px | Standard pages |
| `xl` | 1280px | Wide layouts |
| `2xl` | 1536px | Full-width |

## i18n Integration

### Using Site Facts in Translations

Interpolate business data into translated strings:

```json
{
  "hero": {
    "subtitle": "Trusted by {clientsServed}+ clients across {exportCountries} countries"
  }
}
```

```tsx
<p>{t('hero.subtitle', {
  clientsServed: siteFacts.stats.clientsServed,
  exportCountries: siteFacts.stats.exportCountries,
})}</p>
```

### Adding New Translation Keys

1. Add keys to both `en` and `zh` files
2. Run `pnpm run scan:translations` to verify
3. No missing keys = ready to merge

## Quality Gates

Before committing, run:

```bash
pnpm type-check    # TypeScript validation
pnpm lint:check    # ESLint
pnpm test          # Unit tests
pnpm build         # Production build
```

Or run a wider local gate:

```bash
pnpm ci:local:quick
pnpm build:cf
```

## Directory Structure

```
src/components/blocks/
├── _templates/
│   └── BLOCK_TEMPLATE.tsx   # Copy this to create new blocks
├── hero/
│   └── hero-split-block.tsx
├── features/
│   └── features-grid-block.tsx
├── tech/
│   └── tech-tabs-block.tsx
└── cta/
    └── cta-banner-block.tsx
```
