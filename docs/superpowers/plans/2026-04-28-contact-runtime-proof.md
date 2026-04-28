# Product Family Contact Runtime Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove that product family inquiry links on `/en/products/north-america` and `/zh/products/north-america` render real localized Contact URLs in a browser and land on Contact with validated product-family context.

**Architecture:** This is a proof-only PR first: add one focused Playwright smoke test around the existing product-market-to-Contact handoff, then update proof-boundary documentation. Do not restructure product pages, Contact, routing, locale config, CSP, or cache tags in this PR. If the browser smoke fails, capture the failing runtime evidence and switch to systematic debugging before touching production code.

**Tech Stack:** Next.js 16.2.3 App Router, next-intl localized `Link`, React 19.2.5, TypeScript 5.9.3, Playwright 1.59, Vitest.

---

## Scope

### In scope

- Add a browser-level Playwright smoke test for:
  - `/en/products/north-america` -> `/en/contact?intent=product-family&market=north-america&family=conduit-sweeps-elbows`
  - `/zh/products/north-america` -> `/zh/contact?intent=product-family&market=north-america&family=conduit-sweeps-elbows`
- Verify the clicked Contact page displays `data-testid="product-family-context-notice"` with localized market and family labels.
- Update proof-boundary docs so they say exactly what is now proven.
- Update the behavior contract for `BC-009`.

### Out of scope

- No `FPH-006`, `FPH-007`, `FPH-009`, `FPH-016`, or `FPH-018` code changes.
- No CSP changes.
- No cache-tag cleanup.
- No product-market architecture split.
- No locale truth-source refactor.
- No route registry refactor.
- No Cloudflare deployed proof claim unless a separate deployed smoke is actually run and recorded.

## Acceptance criteria

### English handoff

Given a buyer opens `/en/products/north-america`  
When they inspect the "Request quote for Conduit Sweeps & Elbows" link  
Then the rendered browser `href` is `/en/contact?intent=product-family&market=north-america&family=conduit-sweeps-elbows`  
When they click the link  
Then the browser lands on `/en/contact?...` and the Contact page shows:

- `You are asking about:`
- `UL / ASTM Series`
- `Conduit Sweeps & Elbows`

### Chinese handoff

Given a buyer opens `/zh/products/north-america`  
When they inspect the `咨询 电工弯管与弯头` link  
Then the rendered browser `href` is `/zh/contact?intent=product-family&market=north-america&family=conduit-sweeps-elbows`  
When they click the link  
Then the browser lands on `/zh/contact?...` and the Contact page shows:

- `你正在咨询：`
- `UL / ASTM系列`
- `电工弯管与弯头`

## File map

- Create: `tests/e2e/product-family-contact-handoff.spec.ts`
  - One focused Playwright spec for localized browser href and clicked Contact context.
- Modify: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`
  - Replace the old proof-boundary sentence with a narrower current-state statement.
- Modify: `docs/specs/behavioral-contracts.md`
  - Add the new E2E spec to `BC-009`, mark this contract covered by local browser runtime proof, and remove it from the critical gap list.

No production source file should change in the expected path.

---

## Task 0: Safety and context preflight

**Files:**
- Read: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`
- Read: `docs/specs/behavioral-contracts.md`
- Read: `tests/e2e/contact-form-smoke.spec.ts`
- Read: `playwright.config.ts`
- Read: `node_modules/next/dist/docs/01-app/01-getting-started/04-linking-and-navigating.md`

- [ ] **Step 1: Confirm clean starting point**

Run:

```bash
git status --porcelain=v1
git rev-parse HEAD origin/main
git diff --stat origin/main...HEAD
```

Expected:

- `git status --porcelain=v1` prints either no tracked edits or only this plan file before implementation starts.
- `HEAD` and `origin/main` are both `aee2ea910f81af167f86c7fccf3b02a6abc94b27` if this branch has not moved since planning.
- `git diff --stat origin/main...HEAD` prints either no diff or only `docs/superpowers/plans/2026-04-28-contact-runtime-proof.md` before implementation.

- [ ] **Step 2: Confirm existing proof boundary is still the same**

Run:

```bash
rg -n "Proof boundary|BC-009|product-family-context-notice|Request quote for|咨询 电工弯管与弯头" docs/guides/GUARDRAIL-SIDE-EFFECTS.md docs/specs/behavioral-contracts.md messages src tests/e2e
```

Expected:

- `docs/guides/GUARDRAIL-SIDE-EFFECTS.md` still says actual `/en/contact?...` or `/zh/contact?...` browser href must not be claimed without browser/integration smoke.
- `docs/specs/behavioral-contracts.md` still marks `BC-009` as `Partial`.
- No existing `tests/e2e/*` file already proves this exact product-family Contact handoff.

- [ ] **Step 3: Confirm Playwright command surface**

Run:

```bash
jq -r '.scripts | to_entries[] | select(.key|test("e2e|release-smoke")) | "\(.key)=\(.value)"' package.json
```

Expected includes:

```txt
test:e2e=playwright test
test:release-smoke=CI=1 pnpm exec playwright test tests/e2e/no-js-html-contract.spec.ts tests/e2e/navigation.spec.ts tests/e2e/contact-form-smoke.spec.ts --project=chromium
```

---

## Task 1: Add focused browser smoke proof

**Files:**
- Create: `tests/e2e/product-family-contact-handoff.spec.ts`

- [ ] **Step 1: Create the Playwright spec**

Create `tests/e2e/product-family-contact-handoff.spec.ts` with exactly this content:

```ts
import { expect, test, type Page } from "@playwright/test";
import { waitForLoadWithFallback } from "./test-environment-setup";

const PRODUCT_FAMILY_INTENT = "product-family";
const MARKET_SLUG = "north-america";
const FAMILY_SLUG = "conduit-sweeps-elbows";
const LOAD_TIMEOUT_MS = 10_000;
const FALLBACK_DELAY_MS = 500;

test.describe.configure({ mode: "serial" });

const localeCases = [
  {
    locale: "en",
    productPath: "/en/products/north-america",
    contactPath: "/en/contact",
    inquiryLabel: "Request quote for Conduit Sweeps & Elbows",
    contextLabel: "You are asking about:",
    marketLabel: "UL / ASTM Series",
    familyLabel: "Conduit Sweeps & Elbows",
  },
  {
    locale: "zh",
    productPath: "/zh/products/north-america",
    contactPath: "/zh/contact",
    inquiryLabel: "咨询 电工弯管与弯头",
    contextLabel: "你正在咨询：",
    marketLabel: "UL / ASTM系列",
    familyLabel: "电工弯管与弯头",
  },
] as const;

function parseRenderedHref(page: Page, href: string): URL {
  return new URL(href, page.url());
}

function expectProductFamilyContactUrl(url: URL, pathname: string): void {
  expect(url.pathname).toBe(pathname);
  expect(url.searchParams.get("intent")).toBe(PRODUCT_FAMILY_INTENT);
  expect(url.searchParams.get("market")).toBe(MARKET_SLUG);
  expect(url.searchParams.get("family")).toBe(FAMILY_SLUG);
}

for (const localeCase of localeCases) {
  test.describe(`product family Contact handoff (${localeCase.locale})`, () => {
    test("renders a localized Contact href and opens Contact with context", async ({
      page,
    }) => {
      await page.goto(localeCase.productPath, {
        waitUntil: "domcontentloaded",
      });

      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      const inquiryLink = page.getByRole("link", {
        name: localeCase.inquiryLabel,
        exact: true,
      });
      await expect(inquiryLink).toBeVisible();

      const renderedHref = await inquiryLink.getAttribute("href");
      if (renderedHref === null) {
        throw new Error(
          `Missing product family inquiry href for ${localeCase.productPath}`,
        );
      }

      expectProductFamilyContactUrl(
        parseRenderedHref(page, renderedHref),
        localeCase.contactPath,
      );

      await Promise.all([
        page.waitForURL(
          (url) => {
            return (
              url.pathname === localeCase.contactPath &&
              url.searchParams.get("intent") === PRODUCT_FAMILY_INTENT &&
              url.searchParams.get("market") === MARKET_SLUG &&
              url.searchParams.get("family") === FAMILY_SLUG
            );
          },
          { waitUntil: "domcontentloaded" },
        ),
        inquiryLink.click(),
      ]);

      await waitForLoadWithFallback(page, {
        context: `${localeCase.locale} product family Contact handoff`,
        loadTimeout: LOAD_TIMEOUT_MS,
        fallbackDelay: FALLBACK_DELAY_MS,
      });

      const notice = page.getByTestId("product-family-context-notice");
      await expect(notice).toBeVisible();
      await expect(notice).toContainText(localeCase.contextLabel);
      await expect(notice).toContainText(localeCase.marketLabel);
      await expect(notice).toContainText(localeCase.familyLabel);
    });
  });
}
```

- [ ] **Step 2: Run only the new browser smoke**

Run:

```bash
pnpm exec playwright test tests/e2e/product-family-contact-handoff.spec.ts --project=chromium
```

Expected:

- Playwright starts the local production server through `playwright.config.ts`.
- Two tests run.
- Both tests pass.

If either test fails, do not broaden the PR. Capture the failing rendered `href`, final URL, and missing DOM assertion from the Playwright output, then switch to `superpowers:systematic-debugging` before editing production code.

- [ ] **Step 3: Confirm the new test is the only new proof file**

Run:

```bash
git diff -- tests/e2e/product-family-contact-handoff.spec.ts
```

Expected:

- Diff only contains the new focused E2E spec.
- No production source file has changed.

---

## Task 2: Run focused existing regression tests

**Files:**
- Test: `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`
- Test: `src/components/products/__tests__/family-section.test.tsx`
- Test: `src/lib/contact/__tests__/product-family-context.test.ts`
- Test: `src/app/[locale]/contact/__tests__/page.test.tsx`

- [ ] **Step 1: Run existing unit/source-contract coverage around the same flow**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' src/components/products/__tests__/family-section.test.tsx src/lib/contact/__tests__/product-family-context.test.ts 'src/app/[locale]/contact/__tests__/page.test.tsx'
```

Expected:

- All listed suites pass.
- This proves the new browser smoke did not replace the lower-level source/validation contracts.

---

## Task 3: Update proof-boundary documentation

**Files:**
- Modify: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`

- [ ] **Step 1: Replace the final proof-boundary paragraph**

In `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`, replace the current final paragraph:

```md
Proof boundary: unit/source-contract tests prove the internal `Link` href object, validated Contact context, module ownership, guardrail rule behavior, and scanner fixtures. The actual `/en/contact?...` or `/zh/contact?...` browser href is a routing/runtime proof and must not be claimed unless a browser or integration smoke verifies it.
```

with:

```md
Proof boundary: unit/source-contract tests prove the internal `Link` href object, validated Contact context, module ownership, guardrail rule behavior, and scanner fixtures. `tests/e2e/product-family-contact-handoff.spec.ts` proves local browser runtime for the North America product-family handoff: the rendered links are `/en/contact?...` and `/zh/contact?...`, and clicking them opens Contact with the validated context notice. This is local Next browser smoke proof, not Cloudflare deployed proof.
```

- [ ] **Step 2: Confirm the doc does not overclaim deployment proof**

Run:

```bash
rg -n "Cloudflare deployed proof|local Next browser smoke proof|product-family-contact-handoff|/en/contact\\?\\.\\.\\.|/zh/contact\\?\\.\\.\\." docs/guides/GUARDRAIL-SIDE-EFFECTS.md
```

Expected:

- The new paragraph references `tests/e2e/product-family-contact-handoff.spec.ts`.
- The paragraph explicitly says it is not Cloudflare deployed proof.

---

## Task 4: Update the behavior contract for BC-009

**Files:**
- Modify: `docs/specs/behavioral-contracts.md`

- [ ] **Step 1: Replace the BC-009 test metadata and proof note**

In `docs/specs/behavioral-contracts.md`, replace the `BC-009` table and notes:

```md
| Field | Value |
|-------|-------|
| Priority | Critical |
| Test Type | Unit + Source Contract |
| Test File | `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`, `src/app/[locale]/contact/__tests__/page.test.tsx`, `src/app/[locale]/products/__tests__/interactive-islands-usage.test.ts` |
| Status | Partial |

Notes: The handoff must pass only internal slugs in the URL. Contact must validate `intent`, `market`, and `family` before displaying labels. Invalid query values are ignored and are never rendered directly.

Proof boundary: component/unit tests prove the internal href object and Contact validation. A claim that the rendered browser URL is `/en/contact?...` or `/zh/contact?...` requires browser or integration smoke evidence.
```

with:

```md
| Field | Value |
|-------|-------|
| Priority | Critical |
| Test Type | E2E + Unit + Source Contract |
| Test File | `tests/e2e/product-family-contact-handoff.spec.ts`, `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`, `src/app/[locale]/contact/__tests__/page.test.tsx`, `src/app/[locale]/products/__tests__/interactive-islands-usage.test.ts` |
| Status | Covered |

Notes: The handoff must pass only internal slugs in the URL. Contact must validate `intent`, `market`, and `family` before displaying labels. Invalid query values are ignored and are never rendered directly.

Proof boundary: component/unit tests prove the internal href object and Contact validation. `tests/e2e/product-family-contact-handoff.spec.ts` proves local browser runtime renders `/en/contact?...` and `/zh/contact?...` URLs for the North America product family handoff and that clicking the links displays the validated Contact context notice. This is local browser/runtime proof, not Cloudflare deployed proof.
```

- [ ] **Step 2: Remove BC-009 from the critical gap list**

In the `Critical gaps (no or partial coverage on Critical contracts)` section, remove this bullet:

```md
- **BC-009** (Partial): Product family Contact handoff has source and unit proof for internal href construction plus Contact query validation; localized browser URL smoke remains the unproven boundary.
```

Do not remove any other bullet.

- [ ] **Step 3: Confirm BC-009 is now covered and absent from gap list**

Run:

```bash
rg -n "BC-009|product-family-contact-handoff|localized browser URL smoke remains" docs/specs/behavioral-contracts.md
```

Expected:

- `BC-009` still exists.
- The `BC-009` table includes `tests/e2e/product-family-contact-handoff.spec.ts`.
- `Status` for `BC-009` is `Covered`.
- The phrase `localized browser URL smoke remains` no longer appears.

---

## Task 5: Final verification

**Files:**
- Test: `tests/e2e/product-family-contact-handoff.spec.ts`
- Test: existing Vitest files listed in Task 2
- Check: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`
- Check: `docs/specs/behavioral-contracts.md`

- [ ] **Step 1: Run the new E2E smoke again**

Run:

```bash
pnpm exec playwright test tests/e2e/product-family-contact-handoff.spec.ts --project=chromium
```

Expected:

- 2 passed.

- [ ] **Step 2: Run focused lower-level tests again**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' src/components/products/__tests__/family-section.test.tsx src/lib/contact/__tests__/product-family-context.test.ts 'src/app/[locale]/contact/__tests__/page.test.tsx'
```

Expected:

- All targeted suites pass.

- [ ] **Step 3: Run type-check**

Run:

```bash
pnpm type-check
```

Expected:

- TypeScript exits 0.

- [ ] **Step 4: Run lint check**

Run:

```bash
pnpm lint:check
```

Expected:

- ESLint exits 0.

- [ ] **Step 5: Confirm final diff is scoped**

Run:

```bash
git diff --stat origin/main...HEAD
git diff --name-only origin/main...HEAD
```

Expected file list:

```txt
docs/superpowers/plans/2026-04-28-contact-runtime-proof.md
docs/guides/GUARDRAIL-SIDE-EFFECTS.md
docs/specs/behavioral-contracts.md
tests/e2e/product-family-contact-handoff.spec.ts
```

If production source files appear, stop and explain why they were necessary before continuing.

---

## Commit plan

Make one small commit after all verification passes:

```bash
git add docs/superpowers/plans/2026-04-28-contact-runtime-proof.md docs/guides/GUARDRAIL-SIDE-EFFECTS.md docs/specs/behavioral-contracts.md tests/e2e/product-family-contact-handoff.spec.ts
git commit -m "test: prove product family contact handoff"
```

Do not commit if the Playwright smoke is failing.

---

## Follow-up plan boundary

After this PR is complete, create a separate plan for health-audit follow-up:

- `FPH-006`: re-baseline product market route after PR #97 before deciding whether it is still open.
- `FPH-007`: identify canonical locale truth and adapters without breaking next-intl literal config.
- `FPH-009`: define route truth source and invariant tests before refactoring route literals.
- `FPH-018`: verify cache tag production consumers before cleanup.
- `FPH-016`: separate CSP inline script inventory/proof plan only; do not mix with route/locale/cache truth-source work.

Do not begin these in the contact runtime proof PR.

## Self-review checklist

- Spec coverage:
  - Runtime href proof for English: Task 1.
  - Runtime href proof for Chinese: Task 1.
  - Click-through Contact context proof: Task 1.
  - Guardrail proof-boundary update: Task 3.
  - Behavioral contract update: Task 4.
  - Validation commands: Task 5.
- Placeholder scan:
  - No unresolved placeholder markers.
  - Failure branch has a stop line: use systematic debugging before production edits.
- Type consistency:
  - `PRODUCT_FAMILY_INTENT`, `MARKET_SLUG`, and `FAMILY_SLUG` are shared constants in the test file.
  - Locale case property names match their usage in the test body.
  - Expected test file path is consistent across docs and commands.
