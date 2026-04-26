# Technical Debt Registry

Active technical debt items with context, risk assessment, and decision triggers.

---

## TD-001: CSP `script-src-elem 'unsafe-inline'`

**Introduced:** Wave 1 (2026-04-26)
**Severity:** Medium — mitigated by strict `script-src` + nonce + no user-generated content

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

**Options:**
1. Accept current trade-off, keep monitoring via CSP reports
2. Restrict `'unsafe-inline'` to only prerendered routes (if Next.js adds per-route CSP)
3. Move to full dynamic rendering with nonce on all pages (sacrifices PPR/static performance)

**Decision trigger:** Before scaling to paid traffic (Google Ads).

---

## TD-002: Logo uses `<img>` instead of `next/image`

**Introduced:** Wave 1 (2026-04-26)
**Severity:** Low — intentional for now, revisit when logo file exists

`src/components/layout/logo.tsx` uses a native `<img>` tag to avoid pulling the
`next/image` runtime into the shared layout chunk. The logo file does not yet
exist (business asset blocked). Once the real logo is delivered, re-evaluate
whether `next/image` is appropriate for a small static SVG in the critical layout
path.

**Decision trigger:** When Task 8 (logo replacement) is executed.
