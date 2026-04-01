# Browser Translation Compatibility

## Purpose

This guide defines the guarded surfaces and checks that keep browser translation tools from breaking critical UI flows.

This guide reflects the combined hardening delivered across the follow-up stages on the same branch, not just the initial round 1 surface list.

## Protected Surfaces

### Page-level protection

- `src/app/[locale]/contact/page.tsx`
- `src/app/[locale]/products/[market]/page.tsx`

These pages are intentionally marked as non-translatable because they contain high-value conversion and inquiry flows.

### Component-level protection

- `src/components/language-toggle.tsx`
- `src/components/layout/mobile-navigation.tsx`
- `src/components/products/inquiry-drawer.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/header-client.tsx`
- `src/components/layout/vercel-navigation.tsx`
- `src/components/blocks/tech/tech-tabs-block.tsx`
- `src/components/sections/final-cta.tsx`
- `src/components/sections/sample-cta.tsx`

These components now carry explicit `translate="no"` and `notranslate` protections on critical labels and controls.

### Limited FAQ protection

- `src/components/sections/faq-accordion.tsx`

Only FAQ question labels are guarded to stabilize the accordion controls. FAQ answer body content remains translatable.

### Stable state surfaces

- `src/components/forms/contact-form-container.tsx`
- `src/components/products/product-inquiry-form.tsx`
- `src/components/blog/blog-newsletter.tsx`

These components must keep success, error, and submit-label content inside stable wrappers instead of direct bare-string state switches.

## Allowed Machine Translation Areas

- Blog article body content
- General static content pages
- Non-critical reading-oriented sections that are not part of language switching, form submission, or inquiry flows

Do not expand page-level `notranslate` outside critical surfaces without a concrete failure case.

## Commands

- Focused regression tests:
  - `pnpm test:translate-compat`
- Full translation-compat review:
  - `pnpm review:translate-compat`

`pnpm review:translate-compat` runs both the focused test suite and the static protection check in `scripts/check-translate-compat.js`.

## Shared Implementation Rules

- Do not render bare conditional strings directly inside critical UI containers.
- Keep button icons and button labels in separate stable wrappers.
- Keep success and error messages in stable containers with preserved semantics.
- Keep language labels, CTA labels, and inquiry metadata behind explicit translation guards.
- If a surface is already in the protected list, do not remove its `data-testid`, `translate="no"`, or `notranslate` markers without replacing them with an equivalent verified guard.

## Adding A New LTR Language

When adding a new left-to-right language, run this checklist:

1. Run `pnpm test:translate-compat`.
2. Run `pnpm review:translate-compat`.
3. Check navigation labels for wrapping or overflow.
4. Check CTA labels for truncation or broken alignment.
5. Check contact, inquiry, and newsletter form states in the new language.
6. Confirm protected regions still keep their translation guards after any copy changes.
7. Confirm the new language does not push critical controls into unstable layouts.

This workflow should be enough for new LTR languages. It should not require a new hardening pass unless the UI structure changes.

## RTL Boundary

Right-to-left languages are out of scope for the current compatibility hardening.

If RTL support is added later, open a separate implementation plan that covers:

- `dir="rtl"` handling
- reversed navigation and form layouts
- icon direction and animation direction
- spacing, alignment, and overflow changes

Do not treat RTL as a small extension of the current LTR guardrail set.
