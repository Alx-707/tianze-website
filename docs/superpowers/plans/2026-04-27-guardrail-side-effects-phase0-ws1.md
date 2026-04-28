# Guardrail Side Effects Phase 0 + WS1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 先把会奖励坏结构的质量规则改成正确口径，再修复 `/products/[market]` 市场产品页，让它回到“B2B 产品 family 转化页”，而不是继续被行数、复杂度、翻译保护和缓存合同牵着走。

**Architecture:** Phase 0 先改规则解释、证明边界和 WS1 会碰到的旧合同；WS1 再按真实边界拆市场页。市场页只做 server-rendered 产品 family 展示、规格/信任信息、结构化数据和 Contact handoff；Contact 页只展示经过校验的 query context，不改表单 payload、lead pipeline、`/api/inquiry` 或 Turnstile。

**Tech Stack:** Next.js 16.2 App Router · React 19.2 · TypeScript 5.9 · next-intl 4.8 · Vitest · ESLint flat config · Superpowers workflow

---

## Execution Policy

- 这是执行计划，不是代码实现。未获用户批准前，不进入业务代码修改。
- 不使用 `.context` 作为正式计划路径；正式计划只保存在 `docs/superpowers/plans/`。
- 不默认提交 commit。每个任务的 checkpoint 只要求工作区可审查；如用户明确要求再提交。
- 不提交“只有失败测试”的中间状态。TDD 里可以先跑红，但红灯只作为本地证据记录，不能当可交付 checkpoint。
- 不永久删除文件。

## Scope Contract

本计划覆盖：

- Phase 0：规则口径调整、证明边界说明、guardrail 副作用登记、WS1 必要的翻译/缓存/source-contract 调整。
- WS1：`/products/[market]` 市场产品页修复。
- Contact 页面：只做安全 query context 展示。

本计划不覆盖：

- Contact static/fallback adapter 全量重构。
- 整站 translation guardrail 叶子级收窄。
- `src/lib/env.ts` 内部分层拆分。
- Semgrep object-injection 规则全量重写。
- `ZERO` / `ONE` / `COUNT_TWO` 全量清理。
- `/api/inquiry` 删除、恢复或改主路径。
- Contact 表单 payload / lead schema / CRM / email payload 增加产品 context。

## File Structure

### Phase 0

- Modify: `.claude/rules/code-quality.md`
  - 把 numeric limits 从“机械门槛”改成“触发人工边界审查的信号”。

- Create: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`
  - 登记已确认的规则副作用、证据、处理工作流和延期项。

- Modify: `docs/guides/PROOF-BOUNDARY-MAP.md`
  - 区分 source-contract test 和 behavior proof。

- Modify: `docs/specs/behavioral-contracts.md`
  - 更新 BC-009：市场页产品 family 询盘主路径是 Contact handoff，不是 drawer。

- Modify: `scripts/check-translate-compat.js`
  - 针对市场页移除 whole-page `notranslate` 保护要求，避免 WS1 为了旧规则回退坏结构。

- Modify: `tests/unit/scripts/check-translate-compat.test.ts`
  - 证明市场页不再属于 whole-page translation protected surface；其他保护面不放松。

- Modify: `tests/architecture/cache-directive-policy.test.ts`
  - 移除 product-market FAQ cache helper 的旧形状要求，改成扫描整个 market route-owned source set，禁止市场页及其新模块读取 shared FAQ/FAQ JSON-LD/cache workaround。

### WS1

- Create: `src/lib/contact/product-family-context.ts`
  - 构造 Contact handoff href，解析并校验 query context。

- Create: `src/lib/contact/__tests__/product-family-context.test.ts`
  - 覆盖 valid、invalid、wrong intent、raw query 不渲染。

- Create: `src/components/contact/product-family-context-notice.tsx`
  - Contact 页表单上方展示已校验的 market/family 标签。

- Modify: `messages/en/deferred.json`
- Modify: `messages/zh/deferred.json`
  - 增加 Contact context notice 文案。

- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`
  - 增加 family 级 CTA 文案。

- Modify: `src/app/[locale]/contact/page.tsx`
  - 接收 `searchParams`，解析 context，渲染 notice，不写入 form payload。

- Modify: `src/app/[locale]/contact/__tests__/page.test.tsx`
  - 增加 Contact context 展示和无效 query 忽略测试。

- Modify: `src/components/products/family-section.tsx`
  - 增加可选 server-rendered inquiry CTA slot。

- Modify: `src/components/products/__tests__/family-section.test.tsx`
  - 覆盖 CTA slot 行为。

- Create: `src/app/[locale]/products/[market]/market-page-data.ts`
  - 市场、family、spec lookup。

- Create: `src/app/[locale]/products/[market]/market-spec-presenter.ts`
  - spec/trust signal 翻译和展示模型。

- Create: `src/app/[locale]/products/[market]/market-jsonld.ts`
  - ProductGroup + breadcrumb JSON-LD；不包含 FAQ schema。

- Create: `src/app/[locale]/products/[market]/market-page-sections.tsx`
  - Hero、family sections、trust signals、bottom CTA。

- Modify: `src/app/[locale]/products/[market]/page.tsx`
  - 收缩为 route orchestration，移除 FAQ/MDX/cache workaround/whole-page notranslate。

- Modify: `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`
  - 覆盖 family CTA handoff、FAQ 移除、旧 notranslate 合同移除。

- Modify: `src/app/[locale]/products/__tests__/interactive-islands-usage.test.ts`
  - 保留禁止产品 route 直接 import inquiry client islands 的合同。

---

## Task 1: Recalibrate Numeric Rule Language

**Files:**
- Modify: `.claude/rules/code-quality.md`

- [ ] **Step 1: Add numeric limits interpretation**

Add this section immediately after the complexity limits table:

```markdown
### How to interpret numeric limits

These limits are quality thresholds, not mechanical rewrite targets.

If a file or function crosses a threshold, first identify the real boundary:

- route orchestration
- data/model preparation
- presenter/formatting logic
- platform adapter
- security/input boundary
- reusable UI component

Do not split code only to make the numbers pass. Same-file helper piles, object-parameter bags, and generic numeric constants are not valid fixes.

Invalid fix examples:

- extracting local functions with comments like `keep Page under 120 lines`
- replacing 8 unrelated parameters with one `{ ...locals }` object bag
- replacing `0`, `1`, or `2` with generic `ZERO`, `ONE`, or `COUNT_TWO`

Valid fix examples:

- moving JSON-LD assembly into a page-owned structured-data module
- moving platform workarounds behind an adapter
- moving spec translation into a presenter module
- keeping a justified exception when splitting would harm readability
```

- [ ] **Step 2: Replace Magic Numbers section**

Replace the current bare-number examples with this policy:

```markdown
## Magic Numbers

Named constants are required for business quantities and operational thresholds:

- HTTP status codes
- timeouts / retry delays
- cache TTLs
- rate limits
- byte sizes / upload limits
- security token lengths
- business limits and thresholds

Named constants are not required for low-level language/UI idioms where the literal is clearer:

- array indexes such as `[0]` or regex capture group `[1]`
- `slice(..., -1)`
- SVG attributes such as `strokeWidth={2}`
- alpha defaults such as `alpha: 1`
- grid counts and simple layout counts
- test fixture values

Do not introduce generic numeric aliases such as `ZERO`, `ONE`, or `COUNT_TWO` in new production code unless they carry real domain meaning. Prefer direct literals for simple language idioms and named constants for business meaning.
```

- [ ] **Step 3: Verify rule text**

Run:

```bash
rg -n "quality thresholds|mechanical rewrite|object-parameter bags|generic numeric constants|Magic Numbers|COUNT_TWO" .claude/rules/code-quality.md
```

Expected:

- The new policy is present.
- No wording encourages splitting only to satisfy numbers.

---

## Task 2: Register Guardrail Side Effects and Proof Boundaries

**Files:**
- Create: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`
- Modify: `docs/guides/PROOF-BOUNDARY-MAP.md`
- Modify: `docs/specs/behavioral-contracts.md`

- [ ] **Step 1: Create side-effect register**

Create `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`:

```markdown
# Guardrail Side Effects Register

This document tracks places where a quality rule started rewarding bad structure. A green guardrail is not enough if the code got harder to read, harder to test, or less faithful to the business flow.

## Classification

| Class | Meaning | CI behavior |
|-------|---------|-------------|
| Hard fail | Runtime, security, privacy, deployment, or user-visible correctness | Fail |
| Architecture contract | Protects an explicit source boundary and states what it proves | Fail when boundary is broken |
| Heuristic / smell | Numeric limits, complexity, params, magic numbers, broad pattern scans | Flag for review; do not force cosmetic rewrites |

## Confirmed side effects

| Area | Triggering rule | Evidence | Bad incentive | Treatment |
|------|-----------------|----------|---------------|-----------|
| Market product page | max-lines-per-function / file size / cache source contract / translation markers | `src/app/[locale]/products/[market]/page.tsx` contains helper pile and `keep MarketPage under 120 lines`; it also reads `product-market` FAQ and wraps whole page in `notranslate` | Template-like route file, mixed FAQ/cache/JSON-LD/render concerns, no family-level conversion CTA | WS1 |
| Contact page | static content/cache source contract | `src/app/[locale]/contact/page.tsx` imports generated manifest and has a hand-written fallback form | Adapter concern is embedded in page | WS2 |
| Translation protection | translate-compat marker scan | `scripts/check-translate-compat.js` requires whole-page markers for market/contact pages | Encourages broad `notranslate` wrappers instead of targeted protection | WS1 market carve-out, WS3 full narrowing |
| Env contract | file-size pressure and public import stability | `src/lib/env.ts` exceeds 500 lines while `@/lib/env` external contract is valuable | Internal implementation remains over-concentrated | WS4 |
| Semgrep dynamic property scan | broad object-injection pattern | `src/lib/security/object-guards.ts` wrappers exist mainly to satisfy scanner shape | Security-looking wrappers can outlive real production value | WS5 |
| Magic numbers | broad no-magic-numbers interpretation | generic constants such as `ZERO`, `ONE`, `COUNT_TWO` appear in production | Reads worse than direct literals for language/UI idioms | WS5 |
| Source-shape tests | architecture proof treated as behavior proof | tests assert imports/source strings but not always user-visible behavior | Green tests can overstate confidence | Phase 0 proof boundary map |

## Current task objective

Phase 0 recalibrates rules so WS1 does not keep chasing the old incentives. WS1 then repairs the market page around the real buyer flow:

server-rendered family CTA -> i18n Link Contact href object -> runtime localized Contact URL -> validated Contact context notice.

Proof boundary: unit tests prove the internal `Link` href object and validated Contact context. The actual `/en/contact?...` or `/zh/contact?...` browser href is a routing/runtime proof and must not be claimed unless a browser or integration smoke verifies it.
```

- [ ] **Step 2: Add proof classification**

In `docs/guides/PROOF-BOUNDARY-MAP.md`, add this section after `How to state proof accurately`:

```markdown
## Source contracts vs behavior proof

Some tests intentionally inspect source shape. Treat these as architecture/source-contract tests.

Source-contract tests can prove:

- a forbidden import is absent
- a platform API is not used
- an agreed adapter boundary is still in place
- a proof command is wired into the expected script

Source-contract tests do not prove:

- the user-visible page behavior is correct
- conversion flows are usable
- copy is accurate
- runtime deployment behavior works

When a source-contract test protects a boundary, pair it with behavior-level proof if the boundary affects a user-visible flow.
```

- [ ] **Step 3: Replace BC-009**

In `docs/specs/behavioral-contracts.md`, replace the current BC-009 block with:

```markdown
#### BC-009: Product family inquiry handoff opens Contact with context

On any `/products/[market]` page, each rendered product family has a server-rendered inquiry link. The route builds an i18n `Link` href object for Contact with selected market and family context preserved through validated query parameters. At runtime, next-intl localizes that internal href to the active locale path.

The current critical market-page path is Contact handoff, not an in-page drawer. `/api/inquiry` remains covered by API-level tests for the legacy/future product inquiry path, but it is not the required market-page user flow for this contract.

| Field | Value |
|-------|-------|
| Priority | Critical |
| Test Type | Unit + Source Contract |
| Test File | `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`, `src/app/[locale]/contact/__tests__/page.test.tsx`, `src/app/[locale]/products/__tests__/interactive-islands-usage.test.ts` |
| Status | Planned |

Notes: The handoff must pass only internal slugs in the URL. Contact must validate `intent`, `market`, and `family` before displaying labels. Invalid query values are ignored and are never rendered directly.

Proof boundary: component/unit tests prove the internal href object and Contact validation. A claim that the rendered browser URL is `/en/contact?...` or `/zh/contact?...` requires browser or integration smoke evidence.
```

- [ ] **Step 4: Update critical gap line**

Replace the old BC-009 gap line with:

```markdown
- **BC-009** (Planned): Product family Contact handoff needs implementation and tests.
```

- [ ] **Step 5: Verify docs**

Run:

```bash
rg -n "Guardrail Side Effects|Source contracts vs behavior proof|BC-009|Contact handoff|Product inquiry drawer" docs/guides/GUARDRAIL-SIDE-EFFECTS.md docs/guides/PROOF-BOUNDARY-MAP.md docs/specs/behavioral-contracts.md
```

Expected:

- The register and proof boundary text are present.
- BC-009 no longer describes drawer as the market-page critical path.

---

## Task 3: Recalibrate WS1 Source Contracts Before Refactor

**Files:**
- Modify: `scripts/check-translate-compat.js`
- Modify: `tests/unit/scripts/check-translate-compat.test.ts`
- Modify: `tests/architecture/cache-directive-policy.test.ts`

- [ ] **Step 1: Remove market page from whole-page translation protected surfaces**

In `scripts/check-translate-compat.js`, remove this entry from `PROTECTED_SURFACE_RULES`:

```js
{
  file: "src/app/[locale]/products/[market]/page.tsx",
  markers: ["market-page-content", "notranslate", 'translate="no"'],
},
```

Do not remove the Contact page entry in this task. Contact translation narrowing belongs to WS2/WS3.

- [ ] **Step 2: Update translate-compat tests**

In `tests/unit/scripts/check-translate-compat.test.ts`, replace the protected-page assertion with:

```ts
it("risk-scans only pages that still have targeted translation protection contracts", () => {
  expect(RISK_SCAN_FILES).toEqual(
    expect.arrayContaining(["src/app/[locale]/contact/page.tsx"]),
  );
  expect(RISK_SCAN_FILES).not.toEqual(
    expect.arrayContaining(["src/app/[locale]/products/[market]/page.tsx"]),
  );
});
```

Keep the test that checks `mobile-navigation-interactive.tsx` remains tracked.

- [ ] **Step 3: Update product market cache/source contract**

In `tests/architecture/cache-directive-policy.test.ts`, add `existsSync` to the `node:fs` import and define a route-owned source set:

```ts
import { existsSync, readFileSync } from "node:fs";

const PRODUCT_MARKET_SOURCE_FILES = [
  "src/app/[locale]/products/[market]/page.tsx",
  "src/app/[locale]/products/[market]/market-jsonld.ts",
  "src/app/[locale]/products/[market]/market-page-data.ts",
  "src/app/[locale]/products/[market]/market-page-sections.tsx",
  "src/app/[locale]/products/[market]/market-spec-presenter.ts",
] as const;

function readProductMarketSources() {
  return PRODUCT_MARKET_SOURCE_FILES.filter((filePath) =>
    existsSync(filePath),
  ).map((filePath) => ({
    filePath,
    source: readFileSync(filePath, "utf8"),
  }));
}
```

Then replace the product-market FAQ cache helper test with:

```ts
it("keeps product market route sources free of shared FAQ and cache workarounds", () => {
  for (const { filePath, source } of readProductMarketSources()) {
    expect(source, filePath).not.toContain('getPageBySlug("product-market"');
    expect(source, filePath).not.toContain("getProductMarketFaqItems");
    expect(source, filePath).not.toContain("@/components/sections/faq-section");
    expect(source, filePath).not.toContain("generateFaqSchemaFromItems");
    expect(source, filePath).not.toContain('from "next/cache"');
    expect(source, filePath).not.toContain("cacheLife(");
    expect(source, filePath).not.toContain("cacheTag(");
    expect(source, filePath).not.toContain("revalidateTag(");
    expect(source, filePath).not.toContain("revalidatePath(");
  }
});
```

- [ ] **Step 4: Run source-contract tests and record expected red**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/check-translate-compat.test.ts tests/architecture/cache-directive-policy.test.ts
```

Expected:

- translate-compat unit test passes after the script/test update.
- cache policy test fails until WS1 removes market-page FAQ/cache reads.
- Do not commit this red state.

---

## Task 4: Write WS1 Behavior Tests First

**Files:**
- Modify: `src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx`
- Modify: `src/app/[locale]/contact/__tests__/page.test.tsx`
- Modify: `src/components/products/__tests__/family-section.test.tsx`
- Create: `src/lib/contact/__tests__/product-family-context.test.ts`

- [ ] **Step 1: Make market test Link mock support object hrefs**

In `market-landing.test.tsx`, replace the `@/i18n/routing` mock `Link` prop type and render with:

```tsx
type MockHref =
  | string
  | {
      pathname: string;
      query?: Record<string, string>;
    };

function stringifyMockHref(href: MockHref) {
  if (typeof href === "string") {
    return href;
  }

  const query = href.query ? `?${new URLSearchParams(href.query)}` : "";
  return `${href.pathname}${query}`;
}

Link: ({
  href,
  children,
  className,
}: {
  href: MockHref;
  children: React.ReactNode;
  className?: string;
}) => (
  <a href={stringifyMockHref(href)} className={className}>
    {children}
  </a>
),
```

- [ ] **Step 2: Update FamilySection market mock**

Replace the `FamilySection` mock with:

```tsx
vi.mock("@/components/products/family-section", () => ({
  FamilySection: ({
    family,
    familyLabel,
    inquiry,
  }: {
    family: { slug: string; label: string };
    familyLabel: string;
    inquiry?: { href: MockHref; label: string };
  }) => (
    <section data-testid={`family-${family.slug}`}>
      <h2>{familyLabel}</h2>
      {inquiry ? <a href={stringifyMockHref(inquiry.href)}>{inquiry.label}</a> : null}
    </section>
  ),
}));
```

- [ ] **Step 3: Add market CTA translation fixture**

Add to `MOCK_TRANSLATIONS`:

```ts
"market.familyInquiry.cta": "Request quote for {familyLabel}",
"families.north-america.conduit-sweeps-elbows.label":
  "Conduit Sweeps & Elbows",
"families.north-america.conduit-sweeps-elbows.description":
  "PVC conduit sweeps and elbows in standard angles.",
```

- [ ] **Step 4: Replace old market notranslate contract**

Remove the test named `renders the protected page content wrapper`.

These market unit tests prove the internal href object passed to `next-intl` `Link`. They do not prove the final browser-rendered locale prefix.

Add:

```tsx
it("renders server links from each family to Contact with context", async () => {
  await renderPage("north-america");

  const sweepsLink = screen.getByRole("link", {
    name: /request quote for conduit sweeps & elbows/i,
  });

  expect(sweepsLink).toHaveAttribute("href", expect.stringContaining("/contact"));
  expect(sweepsLink).toHaveAttribute(
    "href",
    expect.stringContaining("intent=product-family"),
  );
  expect(sweepsLink).toHaveAttribute(
    "href",
    expect.stringContaining("market=north-america"),
  );
  expect(sweepsLink).toHaveAttribute(
    "href",
    expect.stringContaining("family=conduit-sweeps-elbows"),
  );
});

it("does not render shared FAQ on market landing pages", async () => {
  await renderPage("north-america");

  expect(screen.queryByTestId("faq-section")).not.toBeInTheDocument();
});
```

When reporting this test, phrase the proof as "internal Contact href object includes context", not "localized browser URL is proven".

- [ ] **Step 5: Add Contact context page tests**

In `src/app/[locale]/contact/__tests__/page.test.tsx`, add:

```tsx
it("renders validated product family context from Contact query params", async () => {
  const page = await ContactPage({
    params: Promise.resolve({ locale: "en" }),
    searchParams: Promise.resolve({
      intent: "product-family",
      market: "north-america",
      family: "couplings",
    }),
  });

  await renderAsyncPage(page as React.JSX.Element);

  expect(screen.getByText("You are asking about:")).toBeInTheDocument();
  expect(screen.getByText(/UL \/ ASTM Series/)).toBeInTheDocument();
  expect(screen.getByText(/Couplings/)).toBeInTheDocument();
});

it("ignores invalid product family context without rendering raw query text", async () => {
  const page = await ContactPage({
    params: Promise.resolve({ locale: "en" }),
    searchParams: Promise.resolve({
      intent: "product-family",
      market: "north-america",
      family: "<script>alert(1)</script>",
    }),
  });

  await renderAsyncPage(page as React.JSX.Element);

  expect(screen.queryByText("You are asking about:")).not.toBeInTheDocument();
  expect(screen.queryByText("<script>alert(1)</script>")).not.toBeInTheDocument();
  expect(screen.getByTestId("contact-form")).toBeInTheDocument();
});
```

Add a DOM-structure test so the notice does not become a third grid child:

```tsx
it("keeps the product family notice in the same left column as the form", async () => {
  const page = await ContactPage({
    params: Promise.resolve({ locale: "en" }),
    searchParams: Promise.resolve({
      intent: "product-family",
      market: "north-america",
      family: "couplings",
    }),
  });

  await renderAsyncPage(page as React.JSX.Element);

  const formColumn = screen.getByTestId("contact-form-column");
  expect(formColumn).toContainElement(
    screen.getByTestId("product-family-context-notice"),
  );
  expect(formColumn).toContainElement(screen.getByTestId("contact-form"));
});
```

- [ ] **Step 6: Add contact context helper unit test**

Create `src/lib/contact/__tests__/product-family-context.test.ts` with tests for:

```ts
buildProductFamilyContactHref({
  marketSlug: "north-america",
  familySlug: "couplings",
});
```

Expected href object:

```ts
{
  pathname: "/contact",
  query: {
    intent: "product-family",
    market: "north-america",
    family: "couplings",
  },
}
```

Also assert:

- valid context resolves `marketLabel: "UL / ASTM Series"` and `familyLabel: "Couplings"`;
- invalid family slug returns `null`;
- wrong intent returns `null`.

- [ ] **Step 7: Add FamilySection CTA test**

In `src/components/products/__tests__/family-section.test.tsx`, mock `@/i18n/routing`:

```tsx
vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string | { pathname: string; query?: Record<string, string> };
    children: React.ReactNode;
    className?: string;
  }) => {
    const resolvedHref =
      typeof href === "string"
        ? href
        : `${href.pathname}?${new URLSearchParams(href.query)}`;

    return (
      <a href={resolvedHref} className={className}>
        {children}
      </a>
    );
  },
}));
```

Add:

```tsx
it("renders an optional inquiry CTA", async () => {
  const FamilySection = await importComponent();
  render(
    <FamilySection
      family={mockFamily}
      specs={mockSpecs}
      familyLabel="Conduit Sweeps & Elbows"
      familyDescription="PVC conduit sweeps and elbows in standard angles."
      inquiry={{
        href: {
          pathname: "/contact",
          query: {
            intent: "product-family",
            market: "north-america",
            family: "conduit-sweeps-elbows",
          },
        },
        label: "Request quote for Conduit Sweeps & Elbows",
      }}
    />,
  );

  expect(
    screen.getByRole("link", {
      name: "Request quote for Conduit Sweeps & Elbows",
    }),
  ).toHaveAttribute(
    "href",
    "/contact?intent=product-family&market=north-america&family=conduit-sweeps-elbows",
  );
});
```

- [ ] **Step 8: Run targeted red tests**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' 'src/app/[locale]/contact/__tests__/page.test.tsx' src/components/products/__tests__/family-section.test.tsx src/lib/contact/__tests__/product-family-context.test.ts tests/architecture/cache-directive-policy.test.ts
```

Expected:

- Fails for missing context helper, missing Contact notice, missing family CTA, and old market FAQ/cache behavior.
- Do not commit this red state.

---

## Task 5: Implement Safe Product Family Contact Context

**Files:**
- Create: `src/lib/contact/product-family-context.ts`

- [ ] **Step 1: Add implementation**

Create:

```ts
import { SINGLE_SITE_HOME_LINK_TARGETS } from "@/config/single-site-page-expression";
import {
  isValidMarketFamilyCombo,
  isValidMarketSlug,
} from "@/constants/product-catalog";
import type { LinkHref } from "@/lib/i18n/route-parsing";
import { readMessagePath } from "@/lib/i18n/read-message-path";

export const PRODUCT_FAMILY_CONTACT_INTENT = "product-family" as const;

type SearchParamValue = string | string[] | undefined;

export interface ProductFamilyContactContext {
  intent: typeof PRODUCT_FAMILY_CONTACT_INTENT;
  marketSlug: string;
  familySlug: string;
  marketLabel: string;
  familyLabel: string;
}

function firstParam(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function buildProductFamilyContactHref({
  marketSlug,
  familySlug,
}: {
  marketSlug: string;
  familySlug: string;
}): LinkHref {
  return {
    pathname: SINGLE_SITE_HOME_LINK_TARGETS.contact,
    query: {
      intent: PRODUCT_FAMILY_CONTACT_INTENT,
      market: marketSlug,
      family: familySlug,
    },
  };
}

export function parseProductFamilyContactContext({
  searchParams,
  messages,
}: {
  searchParams: Record<string, SearchParamValue>;
  messages: Record<string, unknown>;
}): ProductFamilyContactContext | null {
  const intent = firstParam(searchParams.intent);
  const marketSlug = firstParam(searchParams.market);
  const familySlug = firstParam(searchParams.family);

  if (
    intent !== PRODUCT_FAMILY_CONTACT_INTENT ||
    !marketSlug ||
    !familySlug ||
    !isValidMarketSlug(marketSlug) ||
    !isValidMarketFamilyCombo(marketSlug, familySlug)
  ) {
    return null;
  }

  return {
    intent,
    marketSlug,
    familySlug,
    marketLabel: readMessagePath(
      messages,
      ["catalog", "markets", marketSlug, "label"],
      marketSlug,
    ),
    familyLabel: readMessagePath(
      messages,
      ["catalog", "families", marketSlug, familySlug, "label"],
      familySlug,
    ),
  };
}
```

- [ ] **Step 2: Run helper test**

Run:

```bash
pnpm exec vitest run src/lib/contact/__tests__/product-family-context.test.ts
```

Expected: PASS.

---

## Task 6: Add Contact Context Notice and Wire Contact Page

**Files:**
- Create: `src/components/contact/product-family-context-notice.tsx`
- Modify: `messages/en/deferred.json`
- Modify: `messages/zh/deferred.json`
- Modify: `src/app/[locale]/contact/page.tsx`

- [ ] **Step 1: Add localized notice copy**

Add under `contact` in `messages/en/deferred.json`:

```json
"context": {
  "productFamilyLabel": "You are asking about:"
}
```

Add under `contact` in `messages/zh/deferred.json`:

```json
"context": {
  "productFamilyLabel": "你正在咨询："
}
```

- [ ] **Step 2: Add notice component**

Create:

```tsx
import type { ProductFamilyContactContext } from "@/lib/contact/product-family-context";

export function ProductFamilyContextNotice({
  context,
  label,
}: {
  context: ProductFamilyContactContext | null;
  label: string;
}) {
  if (context === null) {
    return null;
  }

  return (
    <div
      className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4"
      data-testid="product-family-context-notice"
    >
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        <span translate="no">{context.marketLabel}</span>
        {" / "}
        <span translate="no">{context.familyLabel}</span>
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Wire Contact page props**

In `src/app/[locale]/contact/page.tsx`:

```ts
interface ContactPageProps {
  params: Promise<LocaleParam>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}
```

Import:

```ts
import { ProductFamilyContextNotice } from "@/components/contact/product-family-context-notice";
import { parseProductFamilyContactContext } from "@/lib/contact/product-family-context";
```

Change `ContactContentBody` to accept `searchParams` and parse context after `const messages = getStaticMessages(locale);`.

Do not insert the notice as a direct child of the two-column grid. Wrap the form side in a left-column container:

```tsx
<div className="grid gap-8 md:grid-cols-2">
  <div className="space-y-6" data-testid="contact-form-column">
    <ProductFamilyContextNotice
      context={productFamilyContext}
      label={productFamilyContextLabel}
    />

    <Suspense fallback={<ContactFormStaticFallback messages={messages} />}>
      <ContactForm />
    </Suspense>
  </div>

  <div className="space-y-6">
    <ContactMethodsCard copy={copy.panel.contact} />
    <ResponseExpectationsCard
      responseCopy={copy.panel.response}
      hoursCopy={copy.panel.hours}
    />
  </div>
</div>
```

The default export must await `searchParams` and pass `{}` when missing:

```tsx
export default async function ContactPage({
  params,
  searchParams,
}: ContactPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  setRequestLocale(locale);

  return (
    <ContactContentBody
      locale={locale as Locale}
      searchParams={resolvedSearchParams}
    />
  );
}
```

- [ ] **Step 4: Run Contact tests and i18n validation**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/contact/__tests__/page.test.tsx' src/lib/contact/__tests__/product-family-context.test.ts
pnpm i18n:validate:code
```

Expected: PASS.

---

## Task 7: Add Family Inquiry CTA Slot

**Files:**
- Modify: `src/components/products/family-section.tsx`
- Modify: `src/components/products/__tests__/family-section.test.tsx`

- [ ] **Step 1: Extend FamilySection props**

Import:

```ts
import { Link } from "@/i18n/routing";
import type { LinkHref } from "@/lib/i18n/route-parsing";
```

Add to `FamilySectionProps`:

```ts
inquiry?: {
  href: LinkHref;
  label: string;
};
```

Destructure `inquiry`.

- [ ] **Step 2: Render CTA after highlights**

Add after the highlights list:

```tsx
{inquiry ? (
  <Link
    href={inquiry.href}
    className="inline-flex w-fit items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
  >
    {inquiry.label}
  </Link>
) : null}
```

Do not import `ProductActions`, `InquiryDrawer`, or `ProductInquiryForm`.

- [ ] **Step 3: Run component test**

Run:

```bash
pnpm exec vitest run src/components/products/__tests__/family-section.test.tsx
```

Expected: PASS.

---

## Task 8: Split Market Page by Real Boundaries

**Files:**
- Create: `src/app/[locale]/products/[market]/market-page-data.ts`
- Create: `src/app/[locale]/products/[market]/market-spec-presenter.ts`
- Create: `src/app/[locale]/products/[market]/market-jsonld.ts`
- Create: `src/app/[locale]/products/[market]/market-page-sections.tsx`
- Modify: `src/app/[locale]/products/[market]/page.tsx`
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`

- [ ] **Step 1: Add family CTA translations**

Under `catalog.market`, add:

```json
"familyInquiry": {
  "cta": "Request quote for {familyLabel}"
}
```

Chinese:

```json
"familyInquiry": {
  "cta": "咨询 {familyLabel}"
}
```

- [ ] **Step 2: Create data module**

`market-page-data.ts` owns only market/family/spec lookup. Move the existing `SPECS_BY_MARKET` mapping there and export:

```ts
export interface MarketPageData {
  market: NonNullable<ReturnType<typeof getMarketBySlug>>;
  families: readonly ProductFamilyDefinition[];
  marketSpecs: MarketSpecs | undefined;
  familySpecsMap: Map<string, MarketSpecs["families"][number]>;
}

export function getMarketPageData(marketSlug: string): MarketPageData;
```

`getMarketPageData` must throw only if called with an unknown slug. The route still calls `notFound()` before this function.

- [ ] **Step 3: Create spec presenter module**

Move the existing spec translation helpers out of `page.tsx` without changing their behavior:

- `translateSpecColumns`
- `translateSpecRows`
- `translateTechnicalSpecs`
- `buildTrustSignalsSectionProps`

Export these public functions:

```ts
export interface MarketTrustSignalsViewModel {
  translatedTechnical: Record<string, string>;
  certifications: string[];
  translatedTrade: {
    moq: string;
    leadTime: string;
    supplyCapacity: string;
    packaging: string;
    portOfLoading: string;
  };
  technicalTitle: string;
  certificationsTitle: string;
  tradeTitle: string;
  tradeLabels: {
    moq: string;
    leadTime: string;
    supplyCapacity: string;
    packaging: string;
    portOfLoading: string;
  };
}

export function buildTrustSignalsViewModel(
  marketSpecs: MarketSpecs,
  marketSlug: string,
  t: (key: string) => string,
): MarketTrustSignalsViewModel;

export function buildTranslatedFamilySpecs(input: {
  specs: MarketSpecs["families"][number];
  marketSlug: string;
  familySlug: string;
  t: (key: string) => string;
}): MarketSpecs["families"][number];
```

Use the existing `getColumnTranslationKey`, `getGroupLabelTranslationKey`, and `getRowValueTranslationKey` helpers. Do not introduce object bags that just mirror route locals.

- [ ] **Step 4: Create JSON-LD module**

`market-jsonld.ts` exports:

```ts
export interface MarketPageJsonLdLabels {
  marketDescription: string;
  marketLabel: string;
}

export async function buildMarketPageJsonLdData({
  data,
  labels,
  marketUrl,
  t,
}: {
  data: Pick<MarketPageData, "families" | "familySpecsMap" | "market">;
  labels: MarketPageJsonLdLabels;
  marketUrl: string;
  t: (key: string) => string;
}): Promise<unknown[]>;
```

This grouped input is allowed because it is a real JSON-LD boundary: `data` is catalog/spec state, `labels` is translated copy, `marketUrl` is canonical URL context, and `t` is the translator. Do not pass a flat bag of route locals into this function.

It must return only:

- ProductGroup schema from `generateProductGroupData`;
- breadcrumb schema from `buildCatalogBreadcrumbJsonLd`.

It must not import `FaqItem`, `generateFaqSchemaFromItems`, `getPageBySlug`, or `next/cache`.

- [ ] **Step 5: Create page sections module**

`market-page-sections.tsx` exports:

- `MarketHero`
- `TrustSignalsSection`
- `CtaSection`
- `FamilySections`

`FamilySections` must call `FamilySection` with:

```tsx
inquiry={{
  href: buildProductFamilyContactHref({
    marketSlug,
    familySlug: family.slug,
  }),
  label: t("market.familyInquiry.cta", { familyLabel }),
}}
```

- [ ] **Step 6: Rewrite route orchestration**

`page.tsx` should keep:

- `generateStaticParams`
- `generateMetadata`
- default `MarketPage`

Remove from `page.tsx`:

- `cacheLife` / `next/cache`
- `getPageBySlug`
- `extractFaqFromMetadata`
- `generateFaqSchemaFromItems`
- `FaqSection`
- `FaqItem`
- `getProductMarketFaqItems`
- `buildProductGroupSchema`
- `buildMarketPageJsonLdData` local helper
- `renderFamilySections`
- `translateSpecColumns`
- `translateSpecRows`
- `translateTechnicalSpecs`
- the comment `keep MarketPage under 120 lines`
- whole-page `notranslate` and `translate="no"` on the market page `<main>`

The default export should read in this order:

1. resolve params;
2. `setRequestLocale(locale)`;
3. validate market slug and `notFound()`;
4. `getMarketPageData(marketSlug)`;
5. load `catalog` translations;
6. build labels/descriptions/market URL;
7. build JSON-LD;
8. render breadcrumb, hero, family nav, family sections, trust signals, bottom CTA.

- [ ] **Step 7: Run market tests**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' src/components/products/__tests__/family-section.test.tsx tests/architecture/cache-directive-policy.test.ts
```

Expected: PASS.

---

## Task 9: Verify Source Contracts and Client-Island Boundary

**Files:**
- Verify: `src/app/[locale]/products/__tests__/interactive-islands-usage.test.ts`
- Verify: `tests/architecture/cache-directive-policy.test.ts`
- Verify: `scripts/check-translate-compat.js`

- [ ] **Step 1: Product routes must not import inquiry client islands**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/products/__tests__/interactive-islands-usage.test.ts'
```

Expected:

- PASS.
- Product route files do not import `ProductActions`, `InquiryDrawer`, or `ProductInquiryForm`.

- [ ] **Step 2: Market page must not use shared FAQ/cache workaround**

Run:

```bash
pnpm exec vitest run tests/architecture/cache-directive-policy.test.ts
```

Expected:

- PASS.
- Market page source has no shared FAQ read, FAQ JSON-LD, `cacheTag`, `revalidateTag`, or `revalidatePath`.

- [ ] **Step 3: Translation guardrail must reflect the new market-page scope**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/check-translate-compat.test.ts
pnpm review:translate-compat
```

Expected:

- PASS after market page is removed from whole-page protected surfaces.
- If another protected surface fails, stop and investigate. Do not re-add whole-page market `notranslate`.

- [ ] **Step 4: Record localized URL proof boundary**

Check `src/i18n/routing-config.ts` keeps:

```ts
localePrefix: "always",
```

This source fact supports the design assumption that `Link` localizes internal hrefs, but it is not the same as browser proof. If no browser or integration smoke is run, the final report must say:

```txt
Verified: market family CTA builds the internal Contact href object with product-family context.
Not verified in this pass: browser-rendered href includes /en or /zh locale prefix.
```

---

## Task 10: Final Phase 0 + WS1 Verification

**Files:**
- Verify only.

- [ ] **Step 1: Run targeted behavior/source tests**

```bash
pnpm exec vitest run 'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' 'src/app/[locale]/contact/__tests__/page.test.tsx' src/lib/contact/__tests__/product-family-context.test.ts src/components/products/__tests__/family-section.test.tsx 'src/app/[locale]/products/__tests__/interactive-islands-usage.test.ts' tests/architecture/cache-directive-policy.test.ts tests/unit/scripts/check-translate-compat.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run project truth and i18n checks**

```bash
pnpm truth:check
pnpm i18n:validate:code
pnpm review:translate-compat
```

Expected: PASS.

- [ ] **Step 3: Run targeted lint**

```bash
pnpm exec eslint 'src/app/[locale]/products/[market]/page.tsx' 'src/app/[locale]/products/[market]/market-page-data.ts' 'src/app/[locale]/products/[market]/market-spec-presenter.ts' 'src/app/[locale]/products/[market]/market-jsonld.ts' 'src/app/[locale]/products/[market]/market-page-sections.tsx' 'src/components/products/family-section.tsx' 'src/app/[locale]/contact/page.tsx' 'src/lib/contact/product-family-context.ts' 'src/components/contact/product-family-context-notice.tsx' scripts/check-translate-compat.js --config eslint.config.mjs --max-warnings 0
```

Expected: PASS.

- [ ] **Step 4: Run TypeScript**

```bash
pnpm type-check
```

Expected: PASS.

- [ ] **Step 5: Run Next build because cache/static behavior changed**

```bash
pnpm build
```

Expected: PASS.

- [ ] **Step 6: Run Cloudflare build serially if local build passes**

```bash
pnpm build:cf
```

Expected:

- PASS.
- Never run `pnpm build` and `pnpm build:cf` in parallel because they write to the same `.next` directory.

---

## Stop Lines

Stop and ask before doing any of these:

- Reintroducing whole-page `notranslate` on the market page just to satisfy old tests.
- Adding `ProductActions`, `InquiryDrawer`, or `ProductInquiryForm` to product routes.
- Changing `/api/inquiry`.
- Extending Contact form payload, lead schema, email payload, CRM payload, or idempotency schema for product context.
- Introducing localStorage/sessionStorage handoff.
- Rendering raw query params directly.
- Turning WS1 into Contact fallback refactor.
- Turning WS1 into env split.
- Turning WS1 into Semgrep/no-magic-numbers cleanup.
- Permanently deleting files.

## Deferred Work After WS1

- WS2: Contact static/fallback adapter and shared field-contract repair.
- WS3: Full translation guardrail narrowing from whole-page protection to targeted leaf protection.
- WS4: `@/lib/env` internal split while preserving external import contract.
- WS5: Semgrep object-injection rule narrowing and generic numeric constant cleanup.

## Plan Self-Review

- **Spec coverage:** Covers rule adjustment, side-effect register, proof boundary clarification, WS1 market page repair, Contact context display, translation/cache source-contract updates, and verification.
- **No placeholder scan:** No `TBD`, `TODO`, `implement later`, or incomplete task owner remains.
- **Type consistency:** Contact href uses existing `LinkHref`; Contact parser uses existing catalog validators and message reader.
- **Scope control:** Contact payload context, full translation narrowing, env split, Semgrep cleanup, and numeric constant cleanup are explicitly deferred.
- **Risk handling:** The plan fixes the market-page translation guardrail before removing the wrapper, so WS1 does not need to reintroduce a bad `notranslate` workaround.
