# Derivative Project Replacement Checklist

## Purpose

This file defines the default replacement order when this repository is used as
the baseline for a future similar project.

It is not a multi-site runtime document.
It is a **single-site derivative-project checklist**.

Use it to answer:

- what should be replaced first
- what should stay fixed initially
- which proof commands must remain green after replacement

## One-line rule

Future derivative projects should replace **site identity inputs and page
expression inputs first**, while keeping the current runtime, Cloudflare, i18n,
security, and proof baseline intact.

## Replace first

These are the intended first-wave replacement surfaces:

### 1. Site identity inputs

Replace in:

- `src/config/single-site.ts`
- `src/config/single-site-product-catalog.ts`
- `src/config/single-site-seo.ts`

Includes:

- brand name
- company facts
- contact details
- social links
- default SEO values
- product catalog / market structure
- navigation / footer inputs
- public sitemap / robots defaults

### 2. Page expression inputs

Replace in:

- `src/config/single-site-page-expression.ts`

Includes:

- homepage section ordering and grouping
- homepage CTA targets
- homepage proof/trust item ordering
- contact FAQ item selection
- contact fallback copy
- about FAQ item selection
- about stats item ordering
- product hub grouping / specialty market split
- default equipment-card expression inputs
- capability/OEM CTA targets

Stop line:

- do not move `MERGED_MESSAGES` into the replacement layer
- do not treat `SPECS_BY_MARKET` as a first-wave authoring seam
- do not keep pulling heading-prefix constants, slugify/parsers, or JSON-LD literals into `src/config/single-site-page-expression.ts`

### 3. Content and message assets

Replace in:

- `messages/{locale}/{critical,deferred}.json`
- `content/pages/**`
- `content/posts/**`

Use this for:

- site-specific prose
- CTAs
- FAQ wording
- legal/about copy
- content-driven SEO wording

### 4. Static public assets

Replace in:

- `public/**`

Use this for:

- logos
- social images
- product illustrations/photos
- brand-specific downloadables

## Do not replace first

These areas are part of the baseline and should stay fixed unless there is a
validated project-specific reason:

- `src/middleware.ts`
- `src/lib/load-messages.ts`
- `src/i18n/**` runtime semantics
- contact / inquiry / subscribe protection chain
- page-local implementation constants such as `MERGED_MESSAGES` and `SPECS_BY_MARKET`
- Turnstile / rate limit / idempotency
- `open-next.config.ts`
- `wrangler.jsonc`
- Cloudflare build / preview / deploy proof model
- `scripts/release-proof.sh`
- quality-gate / truth-check / translation validation scripts

## Before changing baseline logic

Only move beyond the replacement surfaces above if the derivative project has a
clear validated need for one of these:

- different runtime/platform constraints
- different abuse-protection requirements
- different form processing contract
- different deployment proof requirements
- genuinely different information architecture, not just different branding

## Minimum proof after replacement

For a normal derivative-project first pass, keep these green:

```bash
pnpm review:docs-truth
pnpm review:cf:official-compare
pnpm review:derivative-readiness
pnpm truth:check
pnpm review:translation-quartet
pnpm review:translate-compat
pnpm clean:next-artifacts
pnpm build
```

If the replacement touches metadata, site identity, runtime-facing content, or
Cloudflare-sensitive paths, also run:

```bash
pnpm build:cf
```

## Anti-patterns

Do not do these during first-wave derivative work:

- scatter brand/contact/SEO defaults across pages
- invent a second truth layer in wrappers
- introduce `src/sites/**` or per-site runtime overlays without an explicit
  structural decision
- weaken proof because the new project is "just a template fork"
- change security/platform behavior before identity and expression replacement is
  exhausted
