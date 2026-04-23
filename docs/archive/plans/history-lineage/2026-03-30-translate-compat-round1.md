# Browser Translation Compatibility Round 1

## Scope Frozen On Branch

- Branch: `feat/translate-compat-hardening`
- Delivery model: one branch, one PR

## In Scope

- Contact page and contact form
- Products market page
- Inquiry drawer and product inquiry form
- Blog newsletter component
- Language toggle
- Mobile navigation language controls

## Explicitly Out Of Scope

- Blog article body translation behavior
- General static content pages
- RTL language support
- Site-wide page-level `notranslate`

## Round 1 Deliverables

- Page-level translation protection for Contact and Products market pages
- Component-level translation protection for language and inquiry controls
- Stable status, error, and submit-button structure for the three target forms
- Focused regression tests for protection attributes and stable containers

## Later-Stage Note

- Shared navigation, CTA, and other follow-up protections were added in later stages on the same branch.
- The current source of truth for the combined protected surface list is `docs/guides/BROWSER-TRANSLATION-COMPATIBILITY.md`.
