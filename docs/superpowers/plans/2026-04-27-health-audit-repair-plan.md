# Full Project Health Audit Repair Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the actionable findings from Full Project Health Audit v1 without touching the explicitly parked owner-data items or the middleware/proxy migration.

**Architecture:** Repair in evidence order: deployed Cloudflare runtime blocker first, then buyer-trust data contradictions, then tests that are giving false confidence, then small dependency/security hygiene. Each task has its own focused verification so a failed late task does not hide the state of earlier fixes.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript 5.9, next-intl 4.8, Vitest, Playwright, axe-core, Wrangler/OpenNext Cloudflare preview.

---

## Operating rules for this repair wave

- Start from `origin/main` plus the audit documents and this plan.
- Keep changes small and reviewable. Do not rewrite broad architecture while closing a narrow finding.
- Do not permanently delete files. If a future step removes assets or generated files, move them to Trash or stop and ask.
- Do not run `pnpm build` and `pnpm build:cf` in parallel. They both write `.next`.
- Deployed Cloudflare proof is separate from local preview proof. A local green check does not close `FPH-000`.
- Preview deployment commands use the env file that contains Cloudflare credentials:
  - `<redacted-main-repo-env-file>`
- Current preview smoke target:
  - `<redacted-workers-dev-gateway-url>`
- Preview can prove pages and API shape. It cannot prove final lead delivery if Resend, Airtable, or Turnstile secrets are absent.

## Findings map

| Finding | Priority | Plan status |
| --- | --- | --- |
| FPH-000 contact pages 500 on Cloudflare preview | P1 | Task 1 |
| FPH-001 placeholder phone | P1 | Parked-ready card A |
| FPH-002 ISO PDF path missing | P1 | Task 2 |
| FPH-003 sample product images | P1 | Parked-ready card B |
| FPH-004 AS/NZS wording conflict | P1 | Task 3 |
| FPH-005 inquiry tests mock real validation | P1 | Task 4 |
| FPH-006 product market route too broad | P2 | Follow-up architecture plan |
| FPH-007 locale truth split | P2 | Follow-up architecture plan |
| FPH-008 contact copy legacy fallback | P2 | Task 7 |
| FPH-009 route truth duplicated | P2 | Follow-up architecture plan |
| FPH-010 subscribe validation weaker | P2 | Task 5 |
| FPH-011 accessibility false-green | P2 | Task 6 |
| FPH-012 knip entries too broad | P2 | Task 9 |
| FPH-013 mutation guard suggests missing script | P2 | Task 8 |
| FPH-014 touch target density | P2 | Follow-up UI plan |
| FPH-015 generic product CTA | P2 | Follow-up conversion plan |
| FPH-016 inline script CSP proof gap | P2 | Follow-up CSP proof plan |
| FPH-017 middleware deprecation | P3 | Parked-ready card C |
| FPH-018 unused cache tag families | P3 | Follow-up architecture plan |
| FPH-019 barrel import | P3 | Task 10 |
| FPH-020 CSP report log fields | P3 | Task 11 |
| FPH-021 hero animation proof gap | P3 | Follow-up performance plan |
| FPH-022 UI primitive tests over-expanded | P3 | Follow-up test cleanup plan |

## Task 0: Safety preflight before implementation

**Files:**
- Read: `docs/audits/full-project-health-v1/02-findings.json`
- Read: `docs/audits/full-project-health-v1/00-final-report.md`
- Read: `package.json`

- [ ] **Step 1: Confirm findings JSON still parses**

Run:

```bash
jq empty docs/audits/full-project-health-v1/02-findings.json
```

Expected: exit code `0`.

- [ ] **Step 2: Confirm no accidental business-code edits exist before repair**

Run:

```bash
git diff --name-only origin/main...HEAD | rg -v '^(docs/audits/full-project-health-v1/|docs/superpowers/plans/)'
```

Expected: no output.

- [ ] **Step 3: Confirm scripts referenced by this plan exist**

Run:

```bash
jq -r '.scripts | keys[]' package.json | rg '^(build|build:cf|content:manifest|dep:check|lint:check|smoke:cf:deploy|test|test:lead-family|test:mutation|test:mutation:lead|test:mutation:security|type-check|unused:check|unused:production|validate:translations)$'
```

Expected: the listed scripts are printed. If a script is missing, adjust only the command in this plan before editing code.

## Task 1: FPH-000 - isolate the contact route under a page-level Suspense boundary

**Files:**
- Modify: `src/app/[locale]/contact/page.tsx`
- Modify: `src/app/[locale]/contact/__tests__/page.test.tsx`
- Evidence after deployment: `docs/audits/full-project-health-v1/evidence/contact-preview-500-debug/`

- [ ] **Step 1: Write the failing page-level Suspense test**

In `src/app/[locale]/contact/__tests__/page.test.tsx`, replace the current `react` mock with a mock that exposes the fallback while still rendering children:

```tsx
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof React>("react");

  return {
    ...actual,
    Suspense: ({
      children,
      fallback,
    }: {
      children: React.ReactNode;
      fallback?: React.ReactNode;
    }) => (
      <section data-testid="suspense-boundary">
        {fallback ? (
          <div data-testid="suspense-fallback">{fallback}</div>
        ) : null}
        {children}
      </section>
    ),
  };
});
```

Then add this test inside `describe("ContactPage MDX migration", ...)`:

```tsx
it("wraps the whole contact body in a Suspense fallback for Cloudflare prerender isolation", async () => {
  const page = await ContactPage({
    params: Promise.resolve({ locale: "en" }),
  });

  await renderAsyncPage(page as React.JSX.Element);

  expect(screen.getByTestId("contact-page-fallback")).toBeInTheDocument();
  expect(screen.getByTestId("contact-page-content")).toBeInTheDocument();
  expect(screen.getByTestId("contact-form")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test and confirm it fails for the expected reason**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/contact/__tests__/page.test.tsx'
```

Expected: FAIL because `contact-page-fallback` does not exist.

- [ ] **Step 3: Add a static page fallback and async child boundary**

In `src/app/[locale]/contact/page.tsx`, add these helpers above `ContactContentBody`:

```tsx
function ContactPageFallback({ locale }: { locale: Locale }) {
  const page = getStaticContactPage(locale);
  const messages = getStaticMessages(locale);

  return (
    <main
      aria-busy="true"
      className="notranslate min-h-[80vh] px-4 py-16"
      data-testid="contact-page-fallback"
      translate="no"
    >
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-heading mb-4">{page.metadata.title}</h1>
          {page.metadata.description ? (
            <p className="text-body mx-auto max-w-2xl text-muted-foreground">
              {page.metadata.description}
            </p>
          ) : null}
        </header>
        <ContactFormStaticFallback messages={messages} />
      </div>
    </main>
  );
}

async function ContactContent({ locale }: { locale: Locale }) {
  return <ContactContentBody locale={locale} />;
}
```

Then replace the default export body with:

```tsx
export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ContactPageFallback locale={typedLocale} />}>
      <ContactContent locale={typedLocale} />
    </Suspense>
  );
}
```

- [ ] **Step 4: Run the targeted contact page test**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/contact/__tests__/page.test.tsx'
```

Expected: PASS.

- [ ] **Step 5: Run local build checks before Cloudflare deploy**

Run:

```bash
pnpm type-check
pnpm build
```

Expected: both PASS.

- [ ] **Step 6: Build and deploy Cloudflare preview**

Run `pnpm build:cf` only after `pnpm build` finishes:

```bash
pnpm build:cf
node scripts/cloudflare/deploy-phase6.mjs --env preview --env-file <redacted-main-repo-env-file>
```

Expected: Cloudflare preview deploy succeeds for the gateway and web worker.

- [ ] **Step 7: Prove the deployed preview contact pages are no longer 500**

Run:

```bash
pnpm smoke:cf:deploy -- --base-url <redacted-workers-dev-gateway-url>
curl -I <redacted-workers-dev-gateway-url>/en/contact
curl -I <redacted-workers-dev-gateway-url>/zh/contact
```

Expected:
- smoke exits `0`;
- both contact URLs return `HTTP/2 200` or `HTTP/3 200`;
- no buyer-facing 500 page.

- [ ] **Step 8: Tail the web worker for the contact repro**

Run this in a separate terminal, trigger `/en/contact` and `/zh/contact`, then stop tailing:

```bash
pnpm exec wrangler tail <redacted-web-preview-worker> --format=json --env-file <redacted-main-repo-env-file>
```

Expected:
- no `blocking-route` exception for `/[locale]/contact`;
- no `Uncached data was accessed outside of <Suspense>` for the contact requests.

- [ ] **Step 9: Commit the runtime blocker fix**

Run:

```bash
git add 'src/app/[locale]/contact/page.tsx' 'src/app/[locale]/contact/__tests__/page.test.tsx'
git commit -m "fix: isolate contact route suspense boundary"
```

Expected: one commit containing only contact route and test changes.

## Task 2: FPH-002 - remove the missing ISO PDF link and add certification file proof

**Files:**
- Modify: `src/config/single-site.ts`
- Modify: `src/config/__tests__/site-facts.test.ts`
- Test: `src/components/sections/__tests__/quality-section.test.tsx`

- [ ] **Step 1: Add a failing test for declared certification files**

In `src/config/__tests__/site-facts.test.ts`, add imports:

```ts
import { existsSync } from "node:fs";
import { join } from "node:path";
```

Then add this test:

```ts
it("does not declare missing public certification files", () => {
  const declaredFiles = siteFacts.certifications
    .map((certification) => certification.file)
    .filter((file): file is string => typeof file === "string");

  for (const file of declaredFiles) {
    expect(existsSync(join(process.cwd(), "public", file))).toBe(true);
  }
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
pnpm exec vitest run src/config/__tests__/site-facts.test.ts
```

Expected: FAIL because `public/certs/iso9001.pdf` does not exist.

- [ ] **Step 3: Remove only the dead public file reference**

In `src/config/single-site.ts`, change the ISO certification object from:

```ts
{
  name: "ISO 9001:2015",
  certificateNumber: "240021Q09730R0S",
  file: "/certs/iso9001.pdf",
  validUntil: "2027-03",
}
```

to:

```ts
{
  name: "ISO 9001:2015",
  certificateNumber: "240021Q09730R0S",
  validUntil: "2027-03",
}
```

- [ ] **Step 4: Run targeted trust tests**

Run:

```bash
pnpm exec vitest run src/config/__tests__/site-facts.test.ts src/components/sections/__tests__/quality-section.test.tsx
```

Expected: PASS. The site still displays ISO name and number, but no declared missing PDF remains.

- [ ] **Step 5: Commit the trust data fix**

Run:

```bash
git add src/config/single-site.ts src/config/__tests__/site-facts.test.ts
git commit -m "fix: remove missing iso certificate file link"
```

Expected: one commit containing only ISO fact and proof changes.

## Task 3: FPH-004 - make AS/NZS wording consistent

**Files:**
- Modify: `messages/en/critical.json`
- Modify: `messages/zh/critical.json`
- Modify: `messages/en.json`
- Modify: `messages/zh.json`
- Modify: `content/pages/en/product-market.mdx`
- Modify: `content/pages/zh/product-market.mdx`
- Regenerate if needed: `src/lib/content-manifest.generated.ts`
- Create: `src/config/__tests__/standards-consistency.test.ts`

- [ ] **Step 1: Add a failing consistency test**

Create `src/config/__tests__/standards-consistency.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sourceFiles = [
  "messages/en/critical.json",
  "messages/zh/critical.json",
  "messages/en.json",
  "messages/zh.json",
  "content/pages/en/product-market.mdx",
  "content/pages/zh/product-market.mdx",
] as const;

describe("AS/NZS public standard wording", () => {
  it("does not label the AU/NZ market as AS/NZS 61386", () => {
    for (const file of sourceFiles) {
      const content = readFileSync(join(process.cwd(), file), "utf8");
      expect(content, file).not.toContain("AS/NZS 61386");
    }
  });

  it("keeps AU/NZ and IEC wording as separate public standards", () => {
    const enProductMarket = readFileSync(
      join(process.cwd(), "content/pages/en/product-market.mdx"),
      "utf8",
    );

    expect(enProductMarket).toContain("AS/NZS 2053");
    expect(enProductMarket).toContain("IEC 61386");
  });
});
```

- [ ] **Step 2: Run the consistency test and confirm it fails**

Run:

```bash
pnpm exec vitest run src/config/__tests__/standards-consistency.test.ts
```

Expected: FAIL because current copy contains `AS/NZS 61386`.

- [ ] **Step 3: Update homepage quality standard labels**

In `messages/en/critical.json` and `messages/en.json`, replace:

```json
"asnzs": "AS/NZS 61386"
```

with:

```json
"asnzs": "AS/NZS 2053"
```

In `messages/zh/critical.json` and `messages/zh.json`, make the same replacement:

```json
"asnzs": "AS/NZS 2053"
```

- [ ] **Step 4: Update product-market FAQ wording**

In `content/pages/en/product-market.mdx`, replace the FAQ question and answer lines:

```md
question: 'What is the difference between UL 651, IEC 61386, and AS/NZS 61386?'
answer: |
  These are regional standard families with different testing and classification rules.

  North American standards commonly classify by Schedule 40 or Schedule 80 wall thickness. IEC-based standards classify by mechanical strength. AS/NZS uses IEC-style requirements with local additions for Australia and New Zealand.
```

with:

```md
question: 'What is the difference between UL 651, IEC 61386, and AS/NZS 2053?'
answer: |
  These are regional standard families with different testing and classification rules.

  North American standards commonly classify by Schedule 40 or Schedule 80 wall thickness. IEC 61386 classifies conduit by mechanical strength. AS/NZS 2053 is the Australia/New Zealand conduit system standard used for that market.
```

In `content/pages/zh/product-market.mdx`, replace the corresponding Chinese question and answer with:

```md
question: 'UL 651、IEC 61386 和 AS/NZS 2053 有什么区别？'
answer: |
  它们是不同区域常用的标准体系，测试和分类方式不同。

  北美标准通常按 Schedule 40 或 Schedule 80 壁厚分类。IEC 61386 按机械强度分类。AS/NZS 2053 是澳大利亚和新西兰市场常用的电工套管系统标准。
```

- [ ] **Step 5: Regenerate content manifest**

Run:

```bash
pnpm content:manifest
```

Expected: `src/lib/content-manifest.generated.ts` reflects the edited MDX FAQ wording.

- [ ] **Step 6: Run translation and consistency checks**

Run:

```bash
pnpm exec vitest run src/config/__tests__/standards-consistency.test.ts src/constants/product-specs/__tests__/australia-new-zealand.test.ts
pnpm validate:translations
pnpm test:translate-compat
```

Expected: all PASS; `rg -n "AS/NZS 61386" src content messages` prints no current production-source hits.

- [ ] **Step 7: Commit the standards wording fix**

Run:

```bash
git add messages/en/critical.json messages/zh/critical.json messages/en.json messages/zh.json content/pages/en/product-market.mdx content/pages/zh/product-market.mdx src/lib/content-manifest.generated.ts src/config/__tests__/standards-consistency.test.ts
git commit -m "fix: align asnzs public standard wording"
```

Expected: one commit containing only AS/NZS wording and test changes.

## Task 4: FPH-005 - make inquiry route tests use the real schema

**Files:**
- Modify: `src/app/api/inquiry/__tests__/route.test.ts`
- Modify: `src/app/api/inquiry/__tests__/inquiry-integration.test.ts`

- [ ] **Step 1: Remove the schema mock**

In both inquiry test files, remove this mock block:

```ts
vi.mock("@/lib/lead-pipeline/lead-schema", () => ({
  LEAD_TYPES: {
    PRODUCT: "PRODUCT",
    CONTACT: "CONTACT",
  },
  productLeadSchema: {
    safeParse: vi.fn((input: Record<string, unknown>) => ({
      success: true,
      data: {
        ...input,
        type: "PRODUCT",
      },
    })),
  },
}));
```

Keep `vi.unmock("zod")`.

- [ ] **Step 2: Update the lead-pipeline mock to use real lowercase lead type values**

In both inquiry test files, replace the mocked `LEAD_TYPES` values with:

```ts
LEAD_TYPES: {
  PRODUCT: "product",
  CONTACT: "contact",
},
```

- [ ] **Step 3: Add invalid-input tests in `route.test.ts`**

Inside `describe("POST", ...)`, add:

```ts
it("should reject invalid email before turnstile and lead processing", async () => {
  const request = createInquiryRequest(
    JSON.stringify({ ...validInquiryData, email: "not-an-email" }),
  );

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data.success).toBe(false);
  expect(data.errorCode).toBe(API_ERROR_CODES.INQUIRY_VALIDATION_FAILED);
  expect(verifyTurnstileDetailed).not.toHaveBeenCalled();
  expect(processLead).not.toHaveBeenCalled();
});

it("should reject a missing product identity before lead processing", async () => {
  const request = createInquiryRequest(
    JSON.stringify({
      ...validInquiryData,
      productSlug: "",
      productName: "",
    }),
  );

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data.errorCode).toBe(API_ERROR_CODES.INQUIRY_VALIDATION_FAILED);
  expect(processLead).not.toHaveBeenCalled();
});

it("should reject a non-positive numeric quantity", async () => {
  const request = createInquiryRequest(
    JSON.stringify({ ...validInquiryData, quantity: "0" }),
  );

  const response = await POST(request);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data.errorCode).toBe(API_ERROR_CODES.INQUIRY_VALIDATION_FAILED);
  expect(processLead).not.toHaveBeenCalled();
});
```

- [ ] **Step 4: Update valid-path assertions to expect lowercase product type**

Where tests assert `processLead` payload type, use:

```ts
expect(processLead).toHaveBeenCalledWith(
  expect.objectContaining({
    type: "product",
    email: "bob@example.com",
  }),
  expect.objectContaining({
    requestId: expect.any(String),
  }),
);
```

- [ ] **Step 5: Run targeted inquiry tests**

Run:

```bash
pnpm exec vitest run src/app/api/inquiry/__tests__/route.test.ts src/app/api/inquiry/__tests__/inquiry-integration.test.ts
```

Expected: PASS. Invalid data is rejected by real `productLeadSchema` before Turnstile and before `processLead`.

- [ ] **Step 6: Run lead-family regression tests**

Run:

```bash
pnpm test:lead-family
```

Expected: PASS.

- [ ] **Step 7: Commit the inquiry test repair**

Run:

```bash
git add src/app/api/inquiry/__tests__/route.test.ts src/app/api/inquiry/__tests__/inquiry-integration.test.ts
git commit -m "test: use real inquiry validation schema"
```

Expected: one commit containing only inquiry test changes.

## Task 5: FPH-010 - validate subscribe email before Turnstile and add route tests

**Files:**
- Modify: `src/app/api/subscribe/route.ts`
- Create: `src/app/api/subscribe/__tests__/route.test.ts`

- [ ] **Step 1: Create route tests for validation order**

Create `src/app/api/subscribe/__tests__/route.test.ts`:

```ts
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { processLead } from "@/lib/lead-pipeline";
import { verifyTurnstileDetailed } from "@/lib/turnstile";
import { POST } from "../route";

vi.unmock("zod");

vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
  sanitizeEmail: (email: string | undefined | null) =>
    email ? "[REDACTED_EMAIL]" : "[NO_EMAIL]",
}));

vi.mock("@/lib/security/distributed-rate-limit", () => ({
  checkDistributedRateLimit: vi.fn(async () => ({
    allowed: true,
    remaining: 5,
    resetTime: Date.now() + 60000,
    retryAfter: null,
  })),
  createRateLimitHeaders: vi.fn(() => new Headers()),
}));

vi.mock("@/lib/turnstile", () => ({
  verifyTurnstileDetailed: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock("@/lib/lead-pipeline", () => ({
  processLead: vi.fn(() =>
    Promise.resolve({
      success: true,
      partialSuccess: false,
      emailSent: true,
      recordCreated: true,
      referenceId: "sub-ref-001",
    }),
  ),
}));

vi.mock("@/lib/api/cors-utils", () => ({
  applyCorsHeaders: vi.fn(
    ({ response }: { response: Response; request: NextRequest }) => response,
  ),
  createCorsPreflightResponse: vi.fn(
    () => new (require("next/server").NextResponse)(null, { status: 200 }),
  ),
}));

function createSubscribeRequest(
  body: unknown,
  headers: Record<string, string> = {},
): NextRequest {
  return new NextRequest("http://localhost:3000/api/subscribe", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": `sub-key-${Date.now()}-${Math.random()}`,
      ...headers,
    },
  });
}

describe("/api/subscribe route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid JSON before Turnstile", async () => {
    const response = await POST(createSubscribeRequest("{bad json"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errorCode).toBe(API_ERROR_CODES.INVALID_JSON_BODY);
    expect(verifyTurnstileDetailed).not.toHaveBeenCalled();
    expect(processLead).not.toHaveBeenCalled();
  });

  it("requires idempotency key", async () => {
    const response = await POST(
      new NextRequest("http://localhost:3000/api/subscribe", {
        method: "POST",
        body: JSON.stringify({
          email: "buyer@example.com",
          turnstileToken: "token",
        }),
        headers: { "Content-Type": "application/json" },
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errorCode).toBe(API_ERROR_CODES.IDEMPOTENCY_KEY_REQUIRED);
  });

  it("rejects missing email before Turnstile", async () => {
    const response = await POST(
      createSubscribeRequest({ turnstileToken: "token" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errorCode).toBe(API_ERROR_CODES.SUBSCRIBE_VALIDATION_EMAIL_REQUIRED);
    expect(verifyTurnstileDetailed).not.toHaveBeenCalled();
    expect(processLead).not.toHaveBeenCalled();
  });

  it("rejects invalid email before Turnstile", async () => {
    const response = await POST(
      createSubscribeRequest({
        email: "not-an-email",
        turnstileToken: "token",
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errorCode).toBe(API_ERROR_CODES.SUBSCRIBE_VALIDATION_EMAIL_INVALID);
    expect(verifyTurnstileDetailed).not.toHaveBeenCalled();
    expect(processLead).not.toHaveBeenCalled();
  });

  it("requires Turnstile after email validation passes", async () => {
    const response = await POST(
      createSubscribeRequest({ email: "buyer@example.com" }),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.errorCode).toBe(API_ERROR_CODES.SUBSCRIBE_SECURITY_REQUIRED);
    expect(processLead).not.toHaveBeenCalled();
  });

  it("processes a valid subscription with lowercase newsletter type", async () => {
    const response = await POST(
      createSubscribeRequest({
        email: "buyer@example.com",
        turnstileToken: "token",
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(processLead).toHaveBeenCalledWith(
      {
        type: "newsletter",
        email: "buyer@example.com",
      },
      expect.objectContaining({
        requestId: expect.any(String),
      }),
    );
  });
});
```

- [ ] **Step 2: Run subscribe test and confirm invalid email currently fails the expected assertion**

Run:

```bash
pnpm exec vitest run src/app/api/subscribe/__tests__/route.test.ts
```

Expected: FAIL because invalid email is not rejected before Turnstile.

- [ ] **Step 3: Import newsletter schema in the subscribe route**

In `src/app/api/subscribe/route.ts`, replace:

```ts
import { LEAD_TYPES } from "@/lib/lead-pipeline/lead-schema";
```

with:

```ts
import {
  LEAD_TYPES,
  newsletterLeadSchema,
} from "@/lib/lead-pipeline/lead-schema";
```

- [ ] **Step 4: Validate newsletter lead before Turnstile**

In `handlePost`, after the missing-email guard and before `validateLeadTurnstileToken`, insert:

```ts
        const parsedLead = newsletterLeadSchema.safeParse({
          type: LEAD_TYPES.NEWSLETTER,
          email,
        });

        if (!parsedLead.success) {
          return createApiErrorResponse(
            API_ERROR_CODES.SUBSCRIBE_VALIDATION_EMAIL_INVALID,
            HTTP_BAD_REQUEST,
          );
        }
```

Then replace the existing `leadInput` block:

```ts
        const leadInput = {
          type: LEAD_TYPES.NEWSLETTER,
          email,
        };
```

with:

```ts
        const leadInput = parsedLead.data;
```

- [ ] **Step 5: Run subscribe and lead-family tests**

Run:

```bash
pnpm exec vitest run src/app/api/subscribe/__tests__/route.test.ts
pnpm test:lead-family
```

Expected: PASS. Invalid email stops before Turnstile; valid email passes lowercase `newsletter` to `processLead`.

- [ ] **Step 6: Commit the subscribe validation fix**

Run:

```bash
git add src/app/api/subscribe/route.ts src/app/api/subscribe/__tests__/route.test.ts
git commit -m "fix: validate subscribe email before turnstile"
```

Expected: one commit containing subscribe route and tests.

## Task 6: FPH-011 - make accessibility checks fail when axe finds violations

**Files:**
- Modify: `tests/e2e/helpers/axe.ts`
- Modify: `tests/e2e/contact-form-smoke.spec.ts`

- [ ] **Step 1: Make `checkA11y` assert violations**

Replace `checkA11y` in `tests/e2e/helpers/axe.ts` with:

```ts
export async function checkA11y(
  page: Page,
  _context?: unknown,
  options?: AxeCheckOptions,
): Promise<void> {
  const builder = new AxeBuilder({ page });
  const results = await builder.analyze();
  const includedImpacts = options?.includedImpacts;
  const violations = includedImpacts
    ? results.violations.filter((violation) =>
        includedImpacts.includes(violation.impact ?? ""),
      )
    : results.violations;

  if (violations.length > 0) {
    const summary = violations
      .map(
        (violation) =>
          `${violation.id} (${violation.impact ?? "unknown"}): ${violation.nodes.length} node(s)`,
      )
      .join("\n");

    throw new Error(`axe accessibility violations found:\n${summary}`);
  }
}
```

- [ ] **Step 2: Replace the tautological ARIA assertion**

In `tests/e2e/contact-form-smoke.spec.ts`, replace:

```ts
      const emailInput = page.locator('input[name="email"]');
      const hasAriaDescribedBy =
        await emailInput.getAttribute("aria-describedby");

      // 至少应该有 aria-describedby 或其他 ARIA 属性
      expect(hasAriaDescribedBy !== null || true).toBeTruthy();
```

with:

```ts
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.locator('input[name="email"]')).toHaveAttribute(
        "type",
        "email",
      );
```

- [ ] **Step 3: Run the E2E subset**

Run:

```bash
CI=1 pnpm exec playwright test tests/e2e/contact-form-smoke.spec.ts tests/e2e/homepage.spec.ts tests/e2e/navigation.spec.ts --project=chromium
```

Expected: PASS, or a real accessibility violation list that must be handled before this task is closed.

- [ ] **Step 4: Commit the accessibility proof fix**

Run:

```bash
git add tests/e2e/helpers/axe.ts tests/e2e/contact-form-smoke.spec.ts
git commit -m "test: fail accessibility checks on axe violations"
```

Expected: one commit containing only E2E proof changes.

## Task 7: FPH-008 - remove production fallback to legacy underConstruction contact copy

**Files:**
- Modify: `src/lib/contact/getContactCopy.ts`
- Modify: `src/lib/__tests__/contact-get-contact-copy.test.ts`
- Test: `src/app/[locale]/contact/__tests__/page.test.tsx`

- [ ] **Step 1: Replace compatibility fallback test with an explicit no-legacy test**

In `src/lib/__tests__/contact-get-contact-copy.test.ts`, change `defaultMessages` so it uses the top-level `contact` namespace:

```ts
  const defaultMessages = {
    contact: {
      title: defaultTranslations.title,
      description: defaultTranslations.description,
      panel: {
        contactTitle: defaultTranslations["panel.contactTitle"],
        email: defaultTranslations["panel.email"],
        phone: defaultTranslations["panel.phone"],
        hoursTitle: defaultTranslations["panel.hoursTitle"],
        weekdays: defaultTranslations["panel.weekdays"],
        saturday: defaultTranslations["panel.saturday"],
        sunday: defaultTranslations["panel.sunday"],
        closed: defaultTranslations["panel.closed"],
        responseTitle: defaultTranslations["panel.responseTitle"],
        responseTimeLabel: defaultTranslations["panel.responseTimeLabel"],
        responseTimeValue: defaultTranslations["panel.responseTimeValue"],
        bestForLabel: defaultTranslations["panel.bestForLabel"],
        bestForValue: defaultTranslations["panel.bestForValue"],
        prepareLabel: defaultTranslations["panel.prepareLabel"],
        prepareValue: defaultTranslations["panel.prepareValue"],
      },
    },
  };
```

Replace the current legacy fallback test with:

```ts
  it("does not read the legacy underConstruction contact namespace in production copy", () => {
    const copy = getContactCopyFromMessages({
      underConstruction: {
        pages: {
          contact: {
            title: "Legacy contact",
            description: "Legacy description",
            panel: {
              contactTitle: "Legacy methods",
            },
          },
        },
      },
    });

    expect(copy.header.title).toBe("Contact Us");
    expect(copy.header.description).toContain("Get in touch");
    expect(copy.panel.contact.title).toBe("Contact Methods");
    expect(mockLoggerWarn).toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
pnpm exec vitest run src/lib/__tests__/contact-get-contact-copy.test.ts
```

Expected: FAIL because the production helper still reads `underConstruction.pages.contact`.

- [ ] **Step 3: Remove the legacy root from production code**

In `src/lib/contact/getContactCopy.ts`, replace:

```ts
const CONTACT_MESSAGE_ROOTS = [
  ["contact"],
  ["underConstruction", "pages", "contact"],
] as const;
```

with:

```ts
const CONTACT_MESSAGE_ROOT = ["contact"] as const;
```

Then replace `readContactMessage` with:

```ts
function readContactMessage(messages: MessageRecord, key: string) {
  return readMessageAtPath(messages, [
    ...CONTACT_MESSAGE_ROOT,
    ...key.split("."),
  ]);
}
```

Update the comment above `getContactCopy` to:

```ts
/**
 * Server-side helper to build a structured copy model for the contact page.
 *
 * Depends only on the explicit `locale` parameter and the top-level `contact.*`
 * message namespace.
 */
```

- [ ] **Step 4: Run contact copy and page tests**

Run:

```bash
pnpm exec vitest run src/lib/__tests__/contact-get-contact-copy.test.ts 'src/app/[locale]/contact/__tests__/page.test.tsx'
pnpm review:legacy-markers
pnpm validate:translations
```

Expected: PASS, with no production fallback to `underConstruction.pages.contact`.

- [ ] **Step 5: Commit the legacy fallback removal**

Run:

```bash
git add src/lib/contact/getContactCopy.ts src/lib/__tests__/contact-get-contact-copy.test.ts
git commit -m "fix: remove legacy contact copy fallback"
```

Expected: one commit containing contact copy helper and tests.

## Task 8: FPH-013 - make the combined mutation recommendation runnable

**Files:**
- Modify: `scripts/check-mutation-required.js`
- Modify: `tests/unit/scripts/check-mutation-required.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Add a test that suggested commands exist**

In `tests/unit/scripts/check-mutation-required.test.ts`, add imports:

```ts
import { readFileSync } from "node:fs";
```

Then add this `describe` block:

```ts
describe("getSuggestedMutationCommand", () => {
  const packageScripts = JSON.parse(
    readFileSync("package.json", "utf8"),
  ).scripts as Record<string, string>;

  it("only suggests package scripts that exist", () => {
    const scenarios = [
      ["src/lib/lead-pipeline/"],
      ["src/lib/security/"],
      ["src/lib/lead-pipeline/", "src/lib/security/"],
      ["src/lib/form-schema/"],
    ];

    for (const touchedDirectories of scenarios) {
      const command =
        mutationCheck.getSuggestedMutationCommand(touchedDirectories);
      const scriptNames = command
        .split(" && ")
        .map((part: string) => part.replace(/^pnpm /u, ""));

      for (const scriptName of scriptNames) {
        expect(packageScripts, command).toHaveProperty(scriptName);
      }
    }
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/check-mutation-required.test.ts
```

Expected before repair: FAIL because `test:mutation:lead-security` is not in `package.json`.

- [ ] **Step 3: Add a real combined mutation script**

In `package.json`, add:

```json
"test:mutation:lead-security": "stryker run --mutate 'src/lib/lead-pipeline/**/*.ts,src/lib/security/**/*.ts'"
```

Use one comma-separated `--mutate` value. Stryker's CLI help defines `--mutate` as a comma-separated list; do not repeat `--mutate` twice.

- [ ] **Step 4: Keep the combined recommendation**

In `scripts/check-mutation-required.js`, keep:

```js
  if (touchesLead && touchesSecurity) {
    return "pnpm test:mutation:lead-security";
  }
```

- [ ] **Step 5: Keep the existing expected error string and prove the script exists**

In `tests/unit/scripts/check-mutation-required.test.ts`, keep:

```ts
"请运行 pnpm test:mutation:lead-security 并更新 reports/mutation/mutation-report.json",
```

Also assert that `package.json` contains the script and that the script uses one comma-separated mutate list:

```ts
expect(packageJson.scripts["test:mutation:lead-security"]).toBe(
  "stryker run --mutate 'src/lib/lead-pipeline/**/*.ts,src/lib/security/**/*.ts'",
);
```

- [ ] **Step 6: Run mutation guard tests**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/check-mutation-required.test.ts
node scripts/check-mutation-required.js
```

Expected:
- Vitest PASS;
- Node script either prints a valid skip/pass message or asks for existing mutation scripts only.

- [ ] **Step 7: Commit the mutation guard fix**

Run:

```bash
git add package.json scripts/check-mutation-required.js tests/unit/scripts/check-mutation-required.test.ts
git commit -m "fix: add combined mutation guard script"
```

Expected: one commit containing script and test changes.

## Task 9: FPH-012 - make unused-code checks stricter without deleting files

**Files:**
- Modify: `knip.jsonc`

- [ ] **Step 1: Tighten knip entry points**

In `knip.jsonc`, remove these broad entries:

```jsonc
"src/components/**/*.{ts,tsx}",
"src/lib/**/*.{ts,tsx}",
```

Keep the route/config/scripts/tests entries already present.

- [ ] **Step 2: Preserve intentional templates as ignored files**

In the `ignore` array, add:

```jsonc
"src/components/blocks/_templates/**",
```

- [ ] **Step 3: Run unused-code checks**

Run:

```bash
pnpm unused:check
pnpm unused:production
```

Expected:
- PASS means the stricter check found no new reachable dead code.
- If new unused files surface, do not remove them in this task. Record the file list and create a separate Trash-first cleanup task.

- [ ] **Step 4: Commit the knip config fix**

Run:

```bash
git add knip.jsonc
git commit -m "chore: tighten unused code entrypoints"
```

Expected: one commit containing only `knip.jsonc`.

## Task 10: FPH-019 - replace one production barrel import with a direct import

**Files:**
- Modify: `src/lib/utm.ts`

- [ ] **Step 1: Replace the barrel import**

In `src/lib/utm.ts`, replace:

```ts
import { loadConsent } from "@/lib/cookie-consent";
```

with:

```ts
import { loadConsent } from "@/lib/cookie-consent/storage";
```

- [ ] **Step 2: Run dependency and targeted tests**

Run:

```bash
pnpm dep:check
pnpm exec vitest run src/lib/__tests__ src/components/cookie-consent/__tests__
```

Expected: PASS. If the second command reports that a path has no tests, run `rg -n "utm|cookie-consent" src tests` and use the existing matching Vitest files.

- [ ] **Step 3: Commit the direct import fix**

Run:

```bash
git add src/lib/utm.ts
git commit -m "fix: import cookie consent storage directly"
```

Expected: one commit containing only `src/lib/utm.ts`.

## Task 11: FPH-020 - bound attacker-controlled CSP report log fields

**Files:**
- Modify: `src/app/api/csp-report/route.ts`
- Modify: `src/app/api/csp-report/__tests__/route.test.ts`

- [ ] **Step 1: Add a test for bounded text fields**

In `src/app/api/csp-report/__tests__/route.test.ts`, add this test inside `POST /api/csp-report`:

```ts
    it("bounds attacker-controlled text fields before logging", async () => {
      const longValue = `script-src\n${"x".repeat(600)}`;
      const request = new NextRequest("http://localhost:3000/api/csp-report", {
        method: "POST",
        body: JSON.stringify({
          "csp-report": {
            ...validCSPReport["csp-report"],
            "violated-directive": longValue,
            "effective-directive": longValue,
            "original-policy": longValue,
            disposition: longValue,
          },
        }),
        headers: {
          "content-type": "application/csp-report",
        },
      });

      const response = await callPOST(request);

      expect(response.status).toBe(200);
      expect(console.warn).toHaveBeenCalledWith(
        "CSP Violation Report",
        expect.objectContaining({
          violatedDirective: expect.not.stringContaining("\n"),
          effectiveDirective: expect.not.stringContaining("\n"),
          originalPolicy: expect.not.stringContaining("\n"),
          disposition: expect.not.stringContaining("\n"),
        }),
      );

      const logged = vi.mocked(console.warn).mock.calls.find(
        (call) => call[0] === "CSP Violation Report",
      )?.[1] as Record<string, string>;

      expect(logged.violatedDirective.length).toBeLessThanOrEqual(200);
      expect(logged.effectiveDirective.length).toBeLessThanOrEqual(200);
      expect(logged.originalPolicy.length).toBeLessThanOrEqual(500);
      expect(logged.disposition.length).toBeLessThanOrEqual(200);
    });
```

- [ ] **Step 2: Run the CSP test and confirm it fails**

Run:

```bash
pnpm exec vitest run src/app/api/csp-report/__tests__/route.test.ts
```

Expected: FAIL because those fields are not bounded before logging.

- [ ] **Step 3: Add bounded log text helpers**

In `src/app/api/csp-report/route.ts`, add constants below `MAX_SCRIPT_SAMPLE_LENGTH`:

```ts
const MAX_CSP_LOG_FIELD_LENGTH = 200;
const MAX_CSP_POLICY_LOG_LENGTH = 500;
```

Add this helper below `sanitizeScriptSample`:

```ts
function sanitizeLoggedText(
  value: string | undefined,
  maxLength = MAX_CSP_LOG_FIELD_LENGTH,
): string | undefined {
  if (!value) return undefined;
  return value.replace(/[\r\n\t]+/gu, " ").slice(0, maxLength);
}
```

- [ ] **Step 4: Use bounded helpers in violation data**

In `buildViolationData`, replace:

```ts
  violatedDirective: cspReport["violated-directive"],
  effectiveDirective: cspReport["effective-directive"],
  originalPolicy: cspReport["original-policy"],
```

with:

```ts
  violatedDirective: sanitizeLoggedText(cspReport["violated-directive"]),
  effectiveDirective: sanitizeLoggedText(cspReport["effective-directive"]),
  originalPolicy: sanitizeLoggedText(
    cspReport["original-policy"],
    MAX_CSP_POLICY_LOG_LENGTH,
  ),
```

Replace:

```ts
  disposition: cspReport.disposition,
  userAgent: request.headers.get("user-agent"),
```

with:

```ts
  disposition: sanitizeLoggedText(cspReport.disposition),
  userAgent: sanitizeLoggedText(request.headers.get("user-agent") ?? undefined),
```

- [ ] **Step 5: Run CSP tests**

Run:

```bash
pnpm exec vitest run src/app/api/csp-report/__tests__/route.test.ts src/app/api/csp-report/__tests__/route-post-security.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the CSP log hardening**

Run:

```bash
git add src/app/api/csp-report/route.ts src/app/api/csp-report/__tests__/route.test.ts
git commit -m "fix: bound csp report log fields"
```

Expected: one commit containing only CSP report endpoint and tests.

## Final verification after Tasks 1-11

- [ ] **Step 1: Run fast local proof**

Run:

```bash
pnpm lint:check
pnpm type-check
pnpm test
pnpm build
```

Expected: all PASS.

- [ ] **Step 2: Run Cloudflare build after normal build completes**

Run:

```bash
pnpm build:cf
```

Expected: PASS.

- [ ] **Step 3: Deploy and smoke Cloudflare preview**

Run:

```bash
node scripts/cloudflare/deploy-phase6.mjs --env preview --env-file <redacted-main-repo-env-file>
pnpm smoke:cf:deploy -- --base-url <redacted-workers-dev-gateway-url>
curl -I <redacted-workers-dev-gateway-url>/en/contact
curl -I <redacted-workers-dev-gateway-url>/zh/contact
```

Expected:
- deploy succeeds;
- smoke exits `0`;
- `/en/contact` and `/zh/contact` return 200;
- lead delivery remains unclaimed until real service secrets are available.

- [ ] **Step 4: Re-run findings closure scan**

Run:

```bash
rg -n "AS/NZS 61386|/certs/iso9001.pdf|test:mutation:lead-security|underConstruction.*contact|src/components/\\*\\*/\\*\\.\\{ts,tsx\\}|src/lib/\\*\\*/\\*\\.\\{ts,tsx\\}" src content messages scripts tests knip.jsonc
```

Expected: no production-source hits for closed findings. Archived content under `content/_archive/` can be listed separately and must not be used as closure evidence.

## Parked-ready card A: FPH-001 phone number

**Reason parked:** Owner has not provided the real public phone number or confirmed that phone should be hidden.

**When data arrives, modify:**
- `src/config/single-site.ts`
- `content/pages/en/terms.mdx`
- `content/pages/zh/terms.mdx` if the same phone is published there
- Any tests that validate placeholder scans

**Exact update path if a real phone is provided:**

```ts
const contact = {
  phone: "+86-518-REAL-NUMBER",
  email: "sales@tianze-pipe.com",
} as const;
```

Then run:

```bash
rg -n "\\+86-518-0000-0000|0000-0000|placeholder-like" src content messages
pnpm validate:translations
pnpm build
```

Expected: no buyer-facing placeholder phone remains.

**Exact update path if phone should be hidden:** remove phone rendering from contact cards and legal copy, then add tests that assert contact pages still show email and response expectations. Do not hide phone silently without owner confirmation.

## Parked-ready card B: FPH-003 product sample images

**Reason parked:** Real product images or an owner-approved no-photo presentation strategy has not been provided.

**When assets arrive, modify:**
- `public/images/products/*`
- `src/constants/product-specs/australia-new-zealand.ts`
- `src/constants/product-specs/europe.ts`
- `src/constants/product-specs/mexico.ts`
- `src/constants/product-specs/north-america.ts`
- `src/constants/product-specs/pneumatic-tube-systems.ts`
- Product specs tests under `src/constants/product-specs/__tests__/`

**Exact proof command before editing:**

```bash
rg -n "/images/products/sample-product.svg" src/constants/product-specs src/config content
```

**Exact verification after editing:**

```bash
rg -n "/images/products/sample-product.svg" src/constants/product-specs src/config content
find public/images/products -maxdepth 1 -type f | sort
pnpm exec vitest run src/constants/product-specs/__tests__
pnpm build
```

Expected:
- no live product spec references `/images/products/sample-product.svg`;
- every referenced product image exists under `public/images/products`;
- product pages still build.

## Parked-ready card C: FPH-017 middleware deprecation

**Reason parked:** Next.js middleware deprecation is real, but this repo's Cloudflare proof chain still depends on `src/middleware.ts`. Blindly migrating to proxy can break deployed preview evidence.

**Do not do now:**
- Do not rename `src/middleware.ts` to `src/proxy.ts`.
- Do not remove Cloudflare middleware behavior without deployed preview proof.
- Do not mix this migration with the contact 500 fix.

**When migration proof is intentionally scheduled, required preflight:**

```bash
rg -n "middleware|proxy" src .claude next.config.ts open-next.config.ts wrangler.jsonc
pnpm build
pnpm build:cf
node scripts/cloudflare/deploy-phase6.mjs --env preview --env-file <redacted-main-repo-env-file>
pnpm smoke:cf:deploy -- --base-url <redacted-workers-dev-gateway-url>
```

Expected before migration starts:
- current middleware behavior is documented;
- redirect, locale, security header, and Cloudflare IP behavior have passing tests;
- deployed preview smoke is green from the current baseline.

## Follow-up plans to split after this wave

These are real findings, but they are larger design changes and should not be mixed into the runtime/test-proof repair wave:

1. `FPH-006`, `FPH-007`, `FPH-009`, `FPH-018`: architecture truth-source simplification plan.
2. `FPH-014`, `FPH-015`, `FPH-021`: buyer-facing UI, CTA, and performance proof plan.
3. `FPH-016`: CSP inline script runtime proof plan; first prove which inline scripts are required by Next/OpenNext, then simplify policy.
4. `FPH-022`: test portfolio cleanup plan; delete or simplify low-value primitive tests only after buyer-flow coverage is protected.
