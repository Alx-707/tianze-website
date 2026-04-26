# Wave 1 release blockers status

Date: 2026-04-26
Branch: `wave1-release-blockers`

This file is the reviewer-facing status surface for Wave 1. The earlier empty
`BLOCKED` commits remain in history, but they are not enough context on their
own. Use this document to see what is actually waiting on business input.

## Engineering work completed

- React Server Components security patch and dependency override landed.
- SEO cleanup landed:
  - removed fake `SearchAction`
  - removed developer-stack keywords
  - removed GitHub as a Tianze business social channel
- Sitemap behavior now fails loud instead of silently using `new Date()`.
- Static page `lastmod` values were refreshed to 2026-04-26.
- Brand asset paths are centralized in site facts.
- Mobile navigation has a server-rendered fallback.
- Blog routes are offline until the content library is ready.
- Attribution storage is gated behind marketing consent.
- UTM values allow normal buyer campaign punctuation while still rejecting
  dangerous characters.
- Semgrep object-injection findings are resolved.
- CSP no longer depends on a drifting inline script hash allowlist. The policy
  keeps `script-src` strict and uses explicit `script-src-elem` handling for
  prerendered Next.js inline script elements.

## Known technical debt

### CSP: `script-src-elem 'unsafe-inline'` is an architecture trade-off

`script-src` is strict (self + nonce only). However, `script-src-elem` allows
`'unsafe-inline'` because Next.js App Router prerendered and RSC-streamed inline
`<script>` elements cannot reliably receive a per-request nonce. This is a known
Next.js limitation — static/cached HTML is generated at build time, before any
request nonce exists.

**What this means:** An attacker who can inject a `<script>` tag into the HTML
response could execute it. The practical risk is low because:
- The site has no user-generated content surfaces (no comments, no rich-text input)
- All form submissions go through server actions, not client-side rendering
- CSP report-uri is active and would surface violations

**Previous approach:** A 136-entry SHA-256 hash allowlist. This was unmaintainable
— every content, navigation, or JSON-LD change drifted the hashes.

**Future options (Wave 2+):**
1. Accept current trade-off, keep monitoring via CSP reports
2. Restrict `'unsafe-inline'` to only prerendered routes (if Next.js adds per-route CSP)
3. Move to full dynamic rendering with nonce on all pages (sacrifices PPR/static performance)

**Decision needed by:** Before scaling to paid traffic (Google Ads). Not blocking
for the current pre-launch engineering work.

### Logo uses `<img>` instead of `next/image`

`src/components/layout/logo.tsx` uses a native `<img>` tag to avoid pulling the
`next/image` runtime into the shared layout chunk. This is intentional for now
because the logo file does not yet exist (business asset blocked). Once the real
logo is delivered, re-evaluate whether `next/image` is appropriate for a small
static SVG in the critical layout path.

## Business-blocked tasks

| Task | Status | Needed input | Engineering action after input arrives |
| --- | --- | --- | --- |
| 8 - logo replacement | Blocked | Final Tianze SVG logo and raster fallback | Replace placeholder logo files and rerun visual/build checks |
| 9 - ISO 9001 PDF | Blocked | Real ISO 9001 certificate scan/PDF | Add certificate asset and link it from trust/legal surfaces |
| 10 - hero images | Blocked | Three real factory/product photos | Replace placeholder hero imagery and rerun image/performance checks |
| 11 - real phone | Blocked | Confirmed E.164 phone number | Update site config, footer/contact copy, and schema contact fields |
| 12 - privacy rewrite | Blocked | Business-approved privacy policy draft | Replace MDX body while keeping validated metadata/frontmatter |
| 13 - standards downgrade | Blocked | Confirmed standards with proof material | Remove or downgrade any standard claim without evidence |

## Current release meaning

This branch is technically green for the implemented Wave 1 work, but it is not
ready for public launch while the six business-blocked tasks above remain open.
The gap is not a code gap; it is missing real company assets, legal wording, and
proof for public claims.

## Reviewer notes

- Do not infer blocked-task details from empty commits alone.
- Use squash merge for the final Wave 1 merge so the earlier empty `BLOCKED`
  marker commits do not enter `main` as standalone history.
- Do not merge this branch as a final launch branch until the business-blocked
  inputs are delivered or the public-launch scope is explicitly reduced.
- If any blocked input arrives, handle it as a normal code/content change with a
  real diff and fresh verification; do not add more marker-only commits.
