# Single-Site Baseline + Reference Adoption Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current repository into a production-grade single-site baseline that selectively absorbs high-value reference-repo practices and is easier to reuse for future similar projects, without introducing a multi-site runtime or shared-base architecture now.

**Architecture:** Execute in five waves: recover canonical truth, consolidate single-site identity inputs, extract page-level expression seams, formalize content/SEO/message assets, and extend proof so template-readiness is enforced without weakening current Cloudflare/security/runtime guarantees.

**Tech Stack:** Next.js 16 App Router, next-intl, Cloudflare/OpenNext, Vitest, Playwright, repo governance docs and quality gates.

---

## Program framing

This is a **program plan**, not a fake one-shot implementation plan for the whole repo. The work spans multiple subsystems, so execution should happen in five child waves, in order. Each wave must land in a working state before the next one starts.

### Success criteria for the whole program

- Current-reality docs and rules stop claiming `src/sites/**` or per-site runtime overlays are active today.
- `src/config/single-site*.ts` becomes the undisputed authoring surface for site identity truth.
- Homepage/contact/products/about stop hiding site-specific facts directly in page code where a future derivative project would have to dig them out.
- Content, messages, and SEO defaults are treated as explicit template assets with documented ownership.
- Existing proof remains strict: no weakening of i18n runtime semantics, Cloudflare build/proof, abuse protection, or release gates.

---

### Task 1: Canonical truth recovery and stale future-structure cleanup

**Files:**
- Modify: `docs/guides/CANONICAL-TRUTH-REGISTRY.md`
- Modify: `docs/guides/LOCALE-RUNTIME-CONTRACT.md`
- Modify: `docs/guides/QUALITY-PROOF-LEVELS.md`
- Modify: `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- Modify: `docs/guides/TIER-A-OWNER-MAP.md`
- Modify: `docs/guides/TRANSLATION-QUARTET-CONTRACT.md`
- Modify: `docs/guides/frontend-llm-workflow.md`
- Modify: `docs/guides/AI-CODING-DETECTION-RUNBOOK.md`
- Modify: `docs/guides/template-usage.md`
- Modify: `docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md`
- Modify: matching `.claude/rules/*.md` files that still describe `src/sites/**` as current

- [ ] **Step 1: Audit every “current truth” claim that still references `src/sites/**`**

Run:

```bash
rg -n "src/sites/|site overlay|message-overrides|site-specific overlay|NEXT_PUBLIC_SITE_KEY" docs/guides .claude/rules src
```

Expected:
- A finite list of stale docs/rules is identified.
- Each hit is classified as one of:
  - `stale-current-claim`
  - `future-only-reference`
  - `still-valid second-site seam`

- [ ] **Step 2: Rewrite canonical docs so current reality is single-site and future seams are explicit**

Required edits:
- `CANONICAL-TRUTH-REGISTRY.md` must describe `src/config/single-site.ts` and `src/config/single-site-product-catalog.ts` as the active canonical authoring layer.
- `LOCALE-RUNTIME-CONTRACT.md`, `TRANSLATION-QUARTET-CONTRACT.md`, and `TIER-A-OWNER-MAP.md` must stop implying that runtime overlays under `src/sites/**` currently exist.
- `RELEASE-PROOF-RUNBOOK.md` and `QUALITY-PROOF-LEVELS.md` must continue to mention `build:site:equipment` only as a future/template seam or secondary proof lane, not as evidence of a current multi-site runtime.

- [ ] **Step 3: Rewrite non-canonical guides so they point back to canonical docs instead of redefining truth**

Required edits:
- `frontend-llm-workflow.md`, `AI-CODING-DETECTION-RUNBOOK.md`, `template-usage.md`, and `STRUCTURAL-CHANGE-CLUSTERS.md` must align with current code reality.
- Future multi-site or overlay ideas may remain, but must be labeled as planned/future-only.

- [ ] **Step 4: Add a repeatable drift check for “fake current structure” claims**

Implementation choice:
- Extend an existing lightweight governance check (preferred) or add one small dedicated docs-truth audit script.
- The check should fail when a current-policy doc claims `src/sites/**` is active runtime truth unless the line explicitly marks it as future/planned/historical.

- [ ] **Step 5: Verify docs truth recovery**

Run:

```bash
rg -n "src/sites/|site overlay|message-overrides|site-specific overlay" docs/guides .claude/rules
```

Expected:
- Remaining hits are either clearly future-only, historical, or intentionally scoped to seam planning.
- No canonical/current-policy doc silently presents `src/sites/**` as active runtime truth.

---

### Task 2: Single-site identity contract consolidation

**Files:**
- Modify: `src/config/single-site.ts`
- Modify: `src/config/site-types.ts`
- Modify: `src/config/single-site-product-catalog.ts`
- Modify: `src/config/paths/site-config.ts`
- Modify: `src/config/site-facts.ts`
- Modify: `src/constants/product-catalog.ts`
- Modify: `src/config/footer-links.ts`
- Modify: `src/lib/navigation.ts`
- Test: `src/config/__tests__/site-facts.test.ts`
- Test: `src/config/paths/__tests__/site-config.test.ts`
- Test: `src/constants/__tests__/product-catalog.test.ts`
- Test: `src/config/__tests__/footer-links.test.ts`

- [ ] **Step 1: Freeze the authoring contract for site identity**

The authoring surface must be explicitly limited to:
- site config
- site facts
- product catalog
- navigation/footer inputs
- template-facing metadata defaults

Decision:
- Wrappers remain, but they must only forward and derive; they must not invent or override Tianze-specific truth.

- [ ] **Step 2: Remove or document hidden business truth from wrapper modules**

For each wrapper module, decide one of:
- `pure forwarder`
- `derived helper`
- `needs to be collapsed back into single-site source`

Any Tianze-only literal found in wrappers should be moved back to `single-site.ts` or `single-site-product-catalog.ts`.

- [ ] **Step 3: Define the “future derivative project replacement surface” in code comments and docs**

Document that future similar projects are expected to replace:
- brand/company/contact/social facts
- default SEO inputs
- product/market structure
- navigation/footer inputs

Document that future projects are **not** expected to replace:
- runtime entry strategy
- Cloudflare proof model
- core abuse-protection chain
- i18n runtime loader semantics

- [ ] **Step 4: Strengthen tests that wrappers still track the single-site source**

Tests should prove:
- wrappers reference the canonical single-site exports
- market lookups/navigation/footer consumers still align with single-site truth
- no wrapper has started diverging into a second truth layer

- [ ] **Step 5: Verify identity contract stability**

Run:

```bash
pnpm exec vitest run src/config/__tests__/site-facts.test.ts src/config/paths/__tests__/site-config.test.ts src/constants/__tests__/product-catalog.test.ts src/config/__tests__/footer-links.test.ts
pnpm truth:check
```

Expected:
- Wrappers and canonical single-site truth stay aligned.
- No site-identity regression is introduced.

---

### Task 3: Page-level expression seam extraction

**Files:**
- Modify: `src/app/[locale]/page.tsx`
- Modify: `src/app/[locale]/contact/page.tsx`
- Modify: `src/app/[locale]/contact/contact-page-shell.tsx`
- Modify: `src/app/[locale]/products/page.tsx`
- Modify: `src/app/[locale]/products/[market]/page.tsx`
- Modify: `src/app/[locale]/about/page.tsx`
- Modify: key section components consumed by those pages
- Test: existing page-level Vitest suites for home/contact/products/about

- [ ] **Step 1: Inventory page-level literals and hidden site truth**

For each of the core pages above, classify page-local facts into:
- site identity truth
- page expression/default copy
- real runtime logic

Only the first two categories should move. Runtime logic stays put.

- [ ] **Step 2: Extract replaceable expression seams**

Create or extend stable inputs for:
- homepage section ordering/default section set
- primary CTA wording/labels where tied to site identity
- contact page panel/hero/fallback display copy
- product hub/market landing intro expression
- about-page high-level identity expression

Do **not** turn these pages into a generic site-builder. Keep one clear default path for Tianze.

- [ ] **Step 3: Keep hard runtime and protection logic in place**

Explicitly avoid touching:
- `src/middleware.ts`
- Server Action / API anti-abuse chain
- Turnstile verification contracts
- idempotency/rate-limit/security mechanics

- [ ] **Step 4: Add/adjust page tests so template seams are proven**

Tests should prove:
- page rendering still works through the new inputs
- metadata and visible copy reflect the intended source
- future derivative-project replacement would touch input seams, not page internals

- [ ] **Step 5: Verify page seam extraction**

Run the smallest relevant suites, then elevate as needed:

```bash
pnpm review:translate-compat
pnpm exec vitest run src/app/[locale]/contact/__tests__/page.test.tsx src/app/[locale]/products/__tests__/page.test.tsx src/app/[locale]/about/__tests__/page.test.tsx
```

If homepage or shared section composition changed materially, also run:

```bash
pnpm review:homepage-sections
```

---

### Task 4: Content / message / SEO asset governance

**Files:**
- Modify: `docs/guides/content-asset-inventory.md`
- Modify: `docs/guides/site-difference-candidate-list.md`
- Modify: `docs/guides/LONG-TERM-OPTIMIZATION-PROGRAM-2026-04.md`
- Modify: `messages/{en,zh}/{critical,deferred}.json` only where asset boundaries need cleanup
- Modify: content pages or metadata helpers only when boundary cleanup requires it
- Test: translation and metadata-related suites already in repo

- [ ] **Step 1: Formalize three asset classes**

The plan must leave the repo with an explicit model for:
- site identity assets
- content/message assets
- SEO/structured-data assets

Each class must identify:
- canonical authoring location
- who consumes it
- what future derivative projects are expected to replace

- [ ] **Step 2: Remove “messages are just translation files” ambiguity**

Clarify that:
- messages are runtime-facing business assets
- flat locale files remain tooling/test shape only
- per-site overlays are not current runtime reality

- [ ] **Step 3: Keep metadata/JSON-LD/sitemap on unified outputs**

Continue the direction already started:
- metadata helpers stay centralized
- JSON-LD uses a single safe output path
- sitemap/robots derive from canonical site inputs, not page-local literals

- [ ] **Step 4: Document the derivative-project replacement checklist**

Write a short, concrete checklist for future similar-project forks:
- what to replace first
- what should almost never be replaced initially
- which proof commands must stay green after replacement

- [ ] **Step 5: Verify asset governance**

Run:

```bash
pnpm review:translation-quartet
pnpm validate:translations
pnpm exec vitest run src/lib/__tests__/seo-metadata.test.ts src/app/__tests__/sitemap.test.ts
```

Expected:
- Asset classification changes do not break runtime translation or metadata behavior.

---

### Task 5: Template-readiness proof without lowering the baseline

**Files:**
- Modify: `docs/guides/QUALITY-PROOF-LEVELS.md`
- Modify: `docs/guides/RELEASE-PROOF-RUNBOOK.md`
- Modify: `docs/guides/TIER-A-OWNER-MAP.md`
- Modify: `docs/guides/LONG-TERM-OPTIMIZATION-PROGRAM-2026-04.md`
- Modify or add: one lightweight governance/proof helper if needed

- [ ] **Step 1: Define “template-ready” as an extra proof dimension, not a weaker mode**

Template-ready should mean:
- identity and expression seams are explicit
- docs and code agree on current truth
- future derivative projects can replace the intended inputs without touching hard runtime chains

It must **not** mean:
- easier build path
- weaker Cloudflare proof
- weaker security/anti-abuse posture

- [ ] **Step 2: Add template-readiness acceptance checks**

The proof layer should guard against:
- new site-specific literals spreading into wrappers/pages unexpectedly
- docs reintroducing fake current multi-site claims
- replacement-surface drift between docs and code

- [ ] **Step 3: Define the derivative-project rehearsal**

The program ends with one dry derivative-project drill:
- simulate replacing site identity inputs and one page-expression seam
- prove homepage/contact/products/about + metadata/sitemap still align
- prove current baseline proof commands still hold

- [ ] **Step 4: Verify the final first-wave bundle**

Run serially:

```bash
pnpm truth:check
pnpm review:translation-quartet
pnpm review:translate-compat
pnpm clean:next-artifacts
pnpm build
```

If identity/metadata/platform-sensitive files changed, also run:

```bash
pnpm build:cf
```

Expected:
- The repo remains a strict single-site production baseline.
- First-wave template-readiness work is proven without downgrading runtime/platform confidence.

---

## Assumptions

- Current business reality remains a single active site.
- Future similar projects are expected to diverge mainly at the identity layer and page-expression layer, not at runtime/protection/platform layers.
- `src/sites/**` and per-site runtime overlays are future-only concepts, not current code reality.
- `NEXT_PUBLIC_SITE_KEY` and `build:site:equipment` are treated as future seams / pilot scaffolding, not as evidence of an active multi-site architecture.
