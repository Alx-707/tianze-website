# Guardrail Side Effects WS2-WS5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining guardrail side-effect repairs so Phase 0, WS1, WS2, WS3, WS4, and WS5 can ship as one coherent PR about fixing quality-rule incentives.

**Architecture:** Keep the PR theme narrow: rules are recalibrated first, then the code is repaired along real boundaries. WS2 repairs Contact page boundaries without touching lead submission contracts. WS3 narrows translation protection from broad wrappers to leaf-level text protection. WS4 splits `@/lib/env` internally while preserving the public import contract. WS5 converts Semgrep and no-magic-number side effects from cosmetic compliance into precise source contracts and small code cleanups.

**Tech Stack:** Next.js 16.2 App Router, React 19.2, TypeScript 5.9, next-intl 4.8, Vitest, ESLint flat config, Semgrep, Superpowers workflow.

---

## Execution Policy

- This plan extends the already completed Phase 0 + WS1 work in the same branch and eventual PR.
- Do not commit unless the user explicitly asks. Treat task boundaries as review checkpoints.
- Do not use `.context` for formal artifacts.
- Do not permanently delete files. If a file must be removed, stop and ask first.
- Do not run `pnpm build` and `pnpm build:cf` in parallel because both write `.next`.
- Do not change `/api/inquiry`, Contact form payload, lead schema, email payload, CRM payload, or idempotency schema.
- Do not reintroduce whole-page `notranslate` on `/products/[market]` or Contact.
- Do not use source-shape tests as behavior proof. Source contracts must state what they prove and what they do not prove.

## Scope Contract

This plan covers:

- WS2: Contact static/fallback adapter and page boundary repair.
- WS3: Translation guardrail narrowing from broad wrappers to targeted leaf protection.
- WS4: Internal env split while preserving `@/lib/env` as the single public app import.
- WS5: Semgrep object-injection rule narrowing, removal of unused security-wrapper pile, and generic numeric constant cleanup.
- Final PR-level documentation and verification.

This plan does not cover:

- New Contact lead fields.
- New CRM/email payload fields.
- New product drawer behavior.
- Broad redesign of Contact copy or layout.
- Full conversion of all tests away from numeric constants.
- Replacing Semgrep with another scanner.
- Real browser smoke unless the user requests it during execution.

## File Structure

### WS2 Contact boundary repair

- Modify: `src/app/[locale]/contact/page.tsx`
  - Keep route orchestration, metadata, locale setup, Suspense wiring.
  - Remove generated manifest/message loading and fallback form implementation from the route file.
- Create: `src/app/[locale]/contact/contact-page-data.ts`
  - Own `getStaticContactPage`, `getStaticMessages`, FAQ extraction, Contact copy, and FAQ schema data preparation.
- Create: `src/app/[locale]/contact/contact-form-static-fallback.tsx`
  - Own the disabled static fallback form used as Suspense fallback.
- Create: `src/app/[locale]/contact/contact-page-sections.tsx`
  - Own Contact methods card, response expectations card, FAQ section, and Contact form column wrapper.
- Modify: `src/app/[locale]/contact/__tests__/page.test.tsx`
  - Keep existing behavior tests, move metadata `notranslate` proof into `generateMetadata()` assertions, and avoid pretending route tests render Suspense fallback.
- Create: `src/app/[locale]/contact/__tests__/contact-form-static-fallback.test.tsx`
  - Directly render the static fallback adapter and prove disabled fallback behavior plus leaf-level translation guards.
- Create: `tests/architecture/contact-page-boundary.test.ts`
  - Assert the route file no longer imports `CONTENT_MANIFEST`, message JSON files, `mergeObjects`, or implements the static fallback form.
  - Assert `contact-page-sections.tsx` owns Suspense fallback wiring and `contact-form-static-fallback.tsx` owns fallback markup.
- Modify: `tests/architecture/cache-directive-policy.test.ts`
  - Update the Contact static-content contract so the route no longer owns manifest loading; `contact-page-data.ts` owns static manifest loading.

### WS3 translation guardrail narrowing

- Modify: `scripts/check-translate-compat.js`
  - Rename broad `PROTECTED_SURFACE_RULES` concept to leaf-level translation contracts.
  - Remove requirements for broad `notranslate` class markers.
  - Upgrade marker scanning from whole-file token presence to AST-level leaf binding: a protected `data-testid` leaf must itself carry `translate="no"`.
  - Keep risk scanning for protected files where text can still be browser-translated.
- Modify: `tests/unit/scripts/check-translate-compat.test.ts`
  - Add tests proving container-level `notranslate` is no longer required.
  - Add tests proving leaf-level `translate="no"` remains required.
- Modify: `src/app/[locale]/contact/page.tsx`
  - Remove page-level `google: "notranslate"`, `className="notranslate ..."`, and `translate="no"` from the Contact page shell.
- Modify: `src/app/[locale]/contact/contact-form-static-fallback.tsx`
  - Protect only fallback label/button text leaves with `translate="no"`.
- Modify: `src/components/layout/header.tsx`
  - Remove broad container `notranslate`/`translate="no"` from nav wrappers.
  - Keep label spans protected.
- Modify: `src/components/layout/vercel-navigation.tsx`
  - Remove broad container `notranslate`/`translate="no"` from navigation wrappers.
  - Keep trigger/link label spans protected.
- Modify: `src/components/layout/mobile-navigation-interactive.tsx`
  - Remove broad language-switcher container protection.
  - Keep language labels protected.
- Modify: `src/components/products/inquiry-drawer.tsx`
  - Remove broad product header protection.
  - Keep product title and SKU leaves protected.
- Modify: `src/components/sections/final-cta.tsx`
  - Remove broad link-level protection.
  - Keep CTA label spans protected.
- Modify: `src/components/sections/sample-cta.tsx`
  - Remove broad link-level protection.
  - Keep CTA label span protected.
- Modify affected tests under:
  - `src/app/[locale]/contact/__tests__/page.test.tsx`
  - `src/components/layout/__tests__/header.test.tsx`
  - `tests/integration/components/header.test.tsx`
  - `src/components/layout/__tests__/mobile-navigation.test.tsx`
  - `src/components/layout/__tests__/vercel-navigation.test.tsx`
  - `src/components/products/__tests__/inquiry-drawer.test.tsx`
  - `src/components/sections/__tests__/final-cta.test.tsx`
  - `src/components/sections/__tests__/sample-cta.test.tsx`

### WS4 env internal split

- Modify: `src/lib/env.ts`
  - Keep public exports: `env`, `getEnvVar`, `getRuntimeEnvString`, `getRuntimeEnvBoolean`, `getRuntimeEnvNumber`, `getRuntimeNodeEnv`, `getRuntimeAppEnv`, `isRuntimeDevelopment`, `isRuntimeProduction`, `isRuntimeTest`, `isRuntimeCi`, `isRuntimePlaywright`, `isRuntimeProductionBuildPhase`, `isRuntimeCloudflare`, `isSecureAppEnv`, `requireEnvVar`, `envUtils`.
  - Import schema and runtime mapping from new internal modules.
- Create: `src/lib/env-schemas.ts`
  - Own `serverEnvSchema` and `clientEnvSchema`.
- Create: `src/lib/env-runtime.ts`
  - Own `runtimeEnv`.
  - Own raw env helpers: `readRawEnvValue()` and `shouldSkipEnvValidation()`.
  - Keep raw `process.env.*` reads in this file only; `src/lib/env.ts` must not contain raw `process.env`.
- Create: `tests/architecture/env-boundary.test.ts`
  - Assert `src/lib/env.ts` remains a public facade.
  - Assert raw runtime mapping and raw helper reads moved out of `src/lib/env.ts`.
  - Assert app code still imports from `@/lib/env`, not the internal modules.
- Modify existing env guardrail scripts only if they flag the new internal modules:
  - `scripts/review-server-env-boundaries.js`
  - `scripts/review-env-boundaries.js`

### WS5 Semgrep and numeric cleanup

- Modify: `semgrep.yml`
  - Change broad `object-injection-sink-dynamic-property` from blocking ERROR to heuristic WARNING.
  - Add a narrower ERROR rule for untrusted request/query/body keys used in object writes.
- Create: `tests/semgrep/rules/object-injection-untrusted-key-write.yaml`
  - Fixture rule for the new narrower ERROR contract.
- Create: `tests/semgrep/targets/object-injection-untrusted-key-write.ts`
  - Semgrep test target with `ruleid` and `ok` cases.
- Modify: `scripts/semgrep-test-rules.js`
  - Add the new object-injection fixture to the rule test suite.
- Modify: `src/lib/security/object-guards.ts`
  - Keep `hasOwn` because it is used by `src/lib/merge-objects.ts`.
  - Remove unused generic wrapper exports that only existed to satisfy scanner shape.
- Modify: `src/lib/security/__tests__/object-guards.test.ts`
  - Keep tests for `hasOwn`.
  - Remove tests for unused wrapper exports.
- Modify: numeric constant callsites where generic constants reduce readability:
  - `src/app/[locale]/contact/page.tsx`
  - `src/services/url-generator.ts`
  - `src/i18n/request.ts`
  - `src/hooks/use-keyboard-navigation.ts`
  - `src/hooks/use-intersection-observer.ts`
  - `src/components/error-boundary.tsx`
  - `src/components/ui/scroll-reveal.tsx`
  - `src/components/ui/animated-counter.tsx`
  - `src/components/ui/animated-counter-helpers.tsx`
  - `src/lib/lead-pipeline/utils.ts`
  - `src/lib/accessibility-utils.ts`
- Modify: `src/constants/index.ts`
  - Stop advertising `ZERO` and `ONE` in the public constants facade comment block.
  - Keep exports temporarily if tests or legacy modules still import them during this PR.
- Create: `tests/architecture/generic-numeric-constants.test.ts`
  - Prevent new production imports of `ZERO` and `ONE` from `@/constants`.
  - Prevent `COUNT_TWO` in the listed TSX files. If `2` has local domain meaning, use a local domain-named constant assigned from literal `2`, not global `COUNT_TWO`.

### Documentation and final proof

- Modify: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`
  - Update Treatment column to mark WS2-WS5 as repaired when each workstream passes.
- Modify: `docs/guides/PROOF-BOUNDARY-MAP.md`
  - Add source contract proof boundaries for Contact boundary, translation leaf protection, env facade, Semgrep fixture rules, and numeric constant architecture tests.
- Modify: `docs/specs/behavioral-contracts.md`
  - Only update if WS2/WS3 changes observable Contact behavior wording.

---

## Task 1: Add WS2 Contact Boundary Red Tests

**Files:**
- Modify: `src/app/[locale]/contact/__tests__/page.test.tsx`
- Create: `src/app/[locale]/contact/__tests__/contact-form-static-fallback.test.tsx`
- Create: `tests/architecture/contact-page-boundary.test.ts`
- Modify: `tests/architecture/cache-directive-policy.test.ts`

- [ ] **Step 1: Add focused Contact fallback adapter test**

Create `src/app/[locale]/contact/__tests__/contact-form-static-fallback.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactFormStaticFallback } from "@/app/[locale]/contact/contact-form-static-fallback";

const messages = {
  contact: {
    form: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      company: "Company Name",
      message: "Message",
      acceptPrivacy: "I agree to the privacy policy",
      submit: "Submit",
    },
  },
};

describe("ContactFormStaticFallback", () => {
  it("renders a disabled static form while the streamed Contact form loads", () => {
    render(<ContactFormStaticFallback messages={messages} />);

    const form = document.querySelector('[data-contact-form-fallback="static"]');

    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute("aria-busy", "true");
    expect(screen.getByLabelText("First Name")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });

  it("protects fallback labels and submit copy at the leaf level", () => {
    render(<ContactFormStaticFallback messages={messages} />);

    const firstNameLabel = screen.getByText("First Name");
    const submitLabel = screen.getByText("Submit");

    expect(firstNameLabel).toHaveAttribute("translate", "no");
    expect(submitLabel).toHaveAttribute("translate", "no");
  });
});
```

This test is the actual fallback behavior proof. Route-level tests do not prove fallback rendering because the current Contact page test file mocks `Suspense` to render children directly.

- [ ] **Step 2: Create Contact route and adapter source-boundary test**

Create `tests/architecture/contact-page-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const CONTACT_ROUTE = "src/app/[locale]/contact/page.tsx";
const CONTACT_SECTIONS = "src/app/[locale]/contact/contact-page-sections.tsx";
const CONTACT_FALLBACK =
  "src/app/[locale]/contact/contact-form-static-fallback.tsx";

function read(repoPath: string) {
  return readFileSync(repoPath, "utf8");
}

describe("Contact page source boundaries", () => {
  it("keeps generated content and message loading out of the route file", () => {
    const source = read(CONTACT_ROUTE);

    expect(source).not.toContain("CONTENT_MANIFEST");
    expect(source).not.toContain("@messages/en/critical.json");
    expect(source).not.toContain("@messages/en/deferred.json");
    expect(source).not.toContain("@messages/zh/critical.json");
    expect(source).not.toContain("@messages/zh/deferred.json");
    expect(source).not.toContain("mergeObjects");
  });

  it("keeps the route focused on Contact orchestration", () => {
    const source = read(CONTACT_ROUTE);

    expect(source).toContain("ContactFormWithFallback");
    expect(source).toContain("./contact-page-sections");
    expect(source).not.toContain("ContactFormStaticFallback");
    expect(source).not.toContain("contact-form-static-fallback");
    expect(source).not.toContain('data-contact-form-fallback="static"');
  });

  it("keeps Suspense fallback wiring in the page sections module", () => {
    const source = read(CONTACT_SECTIONS);

    expect(source).toContain("ContactFormStaticFallback");
    expect(source).toContain("./contact-form-static-fallback");
    expect(source).toContain(
      "fallback={<ContactFormStaticFallback messages={messages} />}",
    );
  });

  it("keeps fallback form markup inside the fallback adapter", () => {
    const source = read(CONTACT_FALLBACK);

    expect(source).toContain('data-contact-form-fallback="static"');
    expect(source).toContain('aria-busy="true"');
    expect(source).toContain('translate="no"');
  });
});
```

- [ ] **Step 3: Update Contact cache/source contract red test**

In `tests/architecture/cache-directive-policy.test.ts`, add:

```ts
const CONTACT_PAGE_FILE = "src/app/[locale]/contact/page.tsx";
const CONTACT_PAGE_DATA_FILE = "src/app/[locale]/contact/contact-page-data.ts";
```

Then replace the Contact static-content test with:

```ts
it("keeps contact static content loading in the page data module without runtime cache invalidation", () => {
  const routeSource = readFileSync(CONTACT_PAGE_FILE, "utf8");
  const dataSource = readFileSync(CONTACT_PAGE_DATA_FILE, "utf8");

  expect(routeSource).not.toContain("CONTENT_MANIFEST");
  expect(dataSource).toContain(
    'import { CONTENT_MANIFEST } from "@/lib/content-manifest.generated"',
  );

  for (const source of [routeSource, dataSource]) {
    expect(source).not.toContain('"use cache"');
    expect(source).not.toContain("'use cache'");
    expect(source).not.toContain('from "next/cache"');
    expect(source).not.toContain("cacheTag(");
    expect(source).not.toContain("revalidateTag(");
    expect(source).not.toContain("revalidatePath(");
  }
});
```

- [ ] **Step 4: Run WS2 red tests**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/contact/__tests__/page.test.tsx' 'src/app/[locale]/contact/__tests__/contact-form-static-fallback.test.tsx' tests/architecture/contact-page-boundary.test.ts tests/architecture/cache-directive-policy.test.ts
```

Expected:

- Existing Contact behavior tests pass.
- New fallback adapter test fails because `contact-form-static-fallback.tsx` does not exist yet.
- Contact boundary/cache source tests fail because the route still owns manifest/message loading and fallback form markup.

---

## Task 2: Implement WS2 Contact Boundary Repair

**Files:**
- Create: `src/app/[locale]/contact/contact-page-data.ts`
- Create: `src/app/[locale]/contact/contact-form-static-fallback.tsx`
- Create: `src/app/[locale]/contact/contact-page-sections.tsx`
- Modify: `src/app/[locale]/contact/page.tsx`
- Test: `src/app/[locale]/contact/__tests__/page.test.tsx`
- Test: `src/app/[locale]/contact/__tests__/contact-form-static-fallback.test.tsx`
- Test: `tests/architecture/contact-page-boundary.test.ts`
- Test: `tests/architecture/cache-directive-policy.test.ts`

- [ ] **Step 1: Create Contact page data module**

Create `src/app/[locale]/contact/contact-page-data.ts`:

```ts
import {
  LAYER1_FACTS,
  extractFaqFromMetadata,
  generateFaqSchemaFromItems,
  interpolateFaqAnswer,
} from "@/lib/content/mdx-faq";
import { getContactCopyFromMessages } from "@/lib/contact/getContactCopy";
import { CONTENT_MANIFEST } from "@/lib/content-manifest.generated";
import { readMessagePath } from "@/lib/i18n/read-message-path";
import { mergeObjects } from "@/lib/merge-objects";
import type { FaqItem, Locale, Page } from "@/types/content.types";
import enCriticalMessages from "@messages/en/critical.json";
import enDeferredMessages from "@messages/en/deferred.json";
import zhCriticalMessages from "@messages/zh/critical.json";
import zhDeferredMessages from "@messages/zh/deferred.json";

const STATIC_MESSAGES_BY_LOCALE: Record<Locale, Record<string, unknown>> = {
  en: mergeObjects(
    enCriticalMessages as Record<string, unknown>,
    enDeferredMessages as Record<string, unknown>,
  ) as Record<string, unknown>,
  zh: mergeObjects(
    zhCriticalMessages as Record<string, unknown>,
    zhDeferredMessages as Record<string, unknown>,
  ) as Record<string, unknown>,
};

export interface ContactPageData {
  page: Page;
  messages: Record<string, unknown>;
  copy: ReturnType<typeof getContactCopyFromMessages>;
  faqItems: FaqItem[];
  faqSectionTitle: string;
  faqSchema: ReturnType<typeof generateFaqSchemaFromItems> | null;
}

export function getStaticMessages(locale: Locale): Record<string, unknown> {
  return STATIC_MESSAGES_BY_LOCALE[locale];
}

export function getStaticContactPage(locale: Locale): Page {
  const entry = CONTENT_MANIFEST.byKey[`pages/${locale}/contact`];

  if (entry === undefined) {
    throw new Error(`Static contact page not found for locale: ${locale}`);
  }

  return {
    slug: entry.slug,
    filePath: entry.filePath,
    metadata: entry.metadata,
    content: entry.content,
  } as unknown as Page;
}

export function getContactPageData(locale: Locale): ContactPageData {
  const page = getStaticContactPage(locale);
  const messages = getStaticMessages(locale);
  const copy = getContactCopyFromMessages(messages);
  const faqItems: FaqItem[] = extractFaqFromMetadata(page.metadata).map(
    (item) => ({
      ...item,
      answer: interpolateFaqAnswer(item.answer, LAYER1_FACTS),
    }),
  );
  const faqSectionTitle = readMessagePath(
    messages,
    ["faq", "sectionTitle"],
    "FAQ",
  );
  const faqSchema =
    faqItems.length > 0 ? generateFaqSchemaFromItems(faqItems, locale) : null;

  return {
    page,
    messages,
    copy,
    faqItems,
    faqSectionTitle,
    faqSchema,
  };
}
```

- [ ] **Step 2: Create Contact static fallback adapter**

Create `src/app/[locale]/contact/contact-form-static-fallback.tsx`:

```tsx
import { Card } from "@/components/ui/card";
import { readMessagePath } from "@/lib/i18n/read-message-path";

function pickContactFormCopy(
  messages: Record<string, unknown>,
  key: string,
  fallback: string,
) {
  return readMessagePath(messages, ["contact", "form", key], fallback);
}

export function ContactFormStaticFallback({
  messages,
}: {
  messages: Record<string, unknown>;
}) {
  const pick = (key: string, fallback: string) =>
    pickContactFormCopy(messages, key, fallback);

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <form
        aria-busy="true"
        className="space-y-6 p-6"
        data-contact-form-fallback="static"
        noValidate
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm" htmlFor="firstName">
              <span translate="no">{pick("firstName", "First Name")}</span>
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              disabled
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="lastName">
              <span translate="no">{pick("lastName", "Last Name")}</span>
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              disabled
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="email">
              <span translate="no">{pick("email", "Email")}</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              disabled
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm" htmlFor="company">
              <span translate="no">{pick("company", "Company Name")}</span>
            </label>
            <input
              id="company"
              name="company"
              type="text"
              disabled
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm" htmlFor="message">
            <span translate="no">{pick("message", "Message")}</span>
          </label>
          <textarea
            id="message"
            name="message"
            disabled
            required
            rows={4}
            className="flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="acceptPrivacy"
            name="acceptPrivacy"
            type="checkbox"
            disabled
            required
            className="h-4 w-4 rounded border border-input"
          />
          <label className="text-sm" htmlFor="acceptPrivacy">
            <span translate="no">
              {pick("acceptPrivacy", "I agree to the privacy policy")}
            </span>
          </label>
        </div>
        <button
          aria-disabled="true"
          className="inline-flex h-10 w-full items-center justify-center rounded-[6px] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground opacity-60"
          disabled
          type="submit"
        >
          <span translate="no">{pick("submit", "Submit")}</span>
        </button>
      </form>
    </Card>
  );
}
```

- [ ] **Step 3: Create Contact sections module**

Create `src/app/[locale]/contact/contact-page-sections.tsx`:

```tsx
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { ProductFamilyContextNotice } from "@/components/contact/product-family-context-notice";
import { FaqAccordion } from "@/components/sections/faq-accordion";
import { Card } from "@/components/ui/card";
import { SectionHead } from "@/components/ui/section-head";
import { siteFacts } from "@/config/site-facts";
import { parseProductFamilyContactContext } from "@/lib/contact/product-family-context";
import { readMessagePath } from "@/lib/i18n/read-message-path";
import type { FaqItem } from "@/types/content.types";
import { ContactFormStaticFallback } from "./contact-form-static-fallback";
import type { ContactPageData } from "./contact-page-data";

export type ContactSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function ContactMethodsCard({
  copy,
}: {
  copy: ContactPageData["copy"]["panel"]["contact"];
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-xl font-semibold">{copy.title}</h3>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div>
            <p className="font-medium">{copy.emailLabel}</p>
            <p className="text-muted-foreground">{siteFacts.contact.email}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div>
            <p className="font-medium">{copy.phoneLabel}</p>
            <p className="text-muted-foreground">{siteFacts.contact.phone}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ResponseExpectationsCard({
  responseCopy,
  hoursCopy,
}: {
  responseCopy: ContactPageData["copy"]["panel"]["response"];
  hoursCopy: ContactPageData["copy"]["panel"]["hours"];
}) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 text-xl font-semibold">{responseCopy.title}</h3>
      <dl className="space-y-4 text-sm">
        <div className="space-y-1">
          <dt className="font-medium">{responseCopy.responseTimeLabel}</dt>
          <dd className="text-muted-foreground">
            {responseCopy.responseTimeValue}
          </dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium">{responseCopy.bestForLabel}</dt>
          <dd className="text-muted-foreground">{responseCopy.bestForValue}</dd>
        </div>
        <div className="space-y-1">
          <dt className="font-medium">{responseCopy.prepareLabel}</dt>
          <dd className="text-muted-foreground">{responseCopy.prepareValue}</dd>
        </div>
      </dl>

      <div className="mt-6 border-t pt-6">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {hoursCopy.title}
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span>{hoursCopy.weekdaysLabel}</span>
            <span className="text-muted-foreground">
              {siteFacts.contact.businessHours?.weekdays}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>{hoursCopy.saturdayLabel}</span>
            <span className="text-muted-foreground">
              {siteFacts.contact.businessHours?.saturday}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>{hoursCopy.sundayLabel}</span>
            <span className="text-muted-foreground">
              {hoursCopy.closedLabel}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ContactFaqSection({
  faqItems,
  title,
}: {
  faqItems: FaqItem[];
  title: string;
}) {
  const accordionItems = faqItems.map((item) => ({
    key: item.id,
    question: item.question,
    answer: item.answer,
  }));

  return (
    <section
      className="section-divider py-14 md:py-[72px]"
      data-testid="faq-section"
    >
      <div className="mx-auto max-w-[1080px] px-6">
        <SectionHead title={title} />
        <FaqAccordion items={accordionItems} />
      </div>
    </section>
  );
}

async function ContactFormColumn({
  searchParams,
  messages,
}: {
  searchParams: Promise<ContactSearchParams>;
  messages: Record<string, unknown>;
}) {
  const resolvedSearchParams = await searchParams;
  const productFamilyContext = parseProductFamilyContactContext({
    searchParams: resolvedSearchParams,
    messages,
  });
  const productFamilyContextLabel = readMessagePath(
    messages,
    ["contact", "context", "productFamilyLabel"],
    "You are asking about:",
  );

  return (
    <div className="space-y-6" data-testid="contact-form-column">
      <ProductFamilyContextNotice
        context={productFamilyContext}
        label={productFamilyContextLabel}
      />
      <ContactForm />
    </div>
  );
}

export function ContactFormWithFallback({
  searchParams,
  messages,
}: {
  searchParams: Promise<ContactSearchParams>;
  messages: Record<string, unknown>;
}) {
  return (
    <Suspense fallback={<ContactFormStaticFallback messages={messages} />}>
      <ContactFormColumn searchParams={searchParams} messages={messages} />
    </Suspense>
  );
}
```

- [ ] **Step 4: Rewrite Contact route as orchestration**

In `src/app/[locale]/contact/page.tsx`, keep only route orchestration imports and use:

```tsx
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { JsonLdGraphScript } from "@/components/seo";
import {
  generateLocaleStaticParams,
  type LocaleParam,
} from "@/app/[locale]/generate-static-params";
import { renderLegalContent } from "@/lib/content/render-legal-content";
import { generateMetadataForPath } from "@/lib/seo-metadata";
import { getLocalizedPath } from "@/config/paths";
import type { Locale } from "@/types/content.types";
import {
  ContactFaqSection,
  ContactFormWithFallback,
  ContactMethodsCard,
  ResponseExpectationsCard,
  type ContactSearchParams,
} from "./contact-page-sections";
import { getContactPageData, getStaticContactPage } from "./contact-page-data";
```

The exported functions should become:

```tsx
interface ContactPageProps {
  params: Promise<LocaleParam>;
  searchParams?: Promise<ContactSearchParams>;
}

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export async function generateMetadata({
  params,
}: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const typedLocale = locale as Locale;
  const page = getStaticContactPage(typedLocale);
  const description =
    page.metadata.seo?.description ?? page.metadata.description;

  return generateMetadataForPath({
    locale: typedLocale,
    pageType: "contact",
    path: getLocalizedPath("contact", typedLocale),
    config: {
      title: page.metadata.seo?.title ?? page.metadata.title,
      ...(description ? { description } : {}),
    },
  });
}

function ContactContentBody({
  locale,
  searchParams,
}: {
  locale: Locale;
  searchParams: Promise<ContactSearchParams>;
}) {
  const { page, messages, copy, faqItems, faqSectionTitle, faqSchema } =
    getContactPageData(locale);

  return (
    <main className="min-h-[80vh] px-4 py-16" data-testid="contact-page-content">
      <JsonLdGraphScript locale={locale} data={faqSchema ? [faqSchema] : []} />
      <div className="mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <h1 className="text-heading mb-4">{page.metadata.title}</h1>
          {page.metadata.description ? (
            <p className="text-body mx-auto max-w-2xl text-muted-foreground">
              {page.metadata.description}
            </p>
          ) : null}
        </header>

        <article className="prose mb-12 max-w-none">
          {renderLegalContent(page.content)}
        </article>

        <div className="grid gap-8 md:grid-cols-2">
          <ContactFormWithFallback
            searchParams={searchParams}
            messages={messages}
          />

          <div className="space-y-6">
            <ContactMethodsCard copy={copy.panel.contact} />
            <ResponseExpectationsCard
              responseCopy={copy.panel.response}
              hoursCopy={copy.panel.hours}
            />
          </div>
        </div>
      </div>

      {faqItems.length > 0 ? (
        <ContactFaqSection faqItems={faqItems} title={faqSectionTitle} />
      ) : null}
    </main>
  );
}

export default async function ContactPage({
  params,
  searchParams,
}: ContactPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <ContactContentBody
      locale={locale as Locale}
      searchParams={searchParams ?? Promise.resolve({})}
    />
  );
}
```

- [ ] **Step 5: Run WS2 tests**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/contact/__tests__/page.test.tsx' 'src/app/[locale]/contact/__tests__/contact-form-static-fallback.test.tsx' tests/architecture/contact-page-boundary.test.ts tests/architecture/cache-directive-policy.test.ts
```

Expected:

- All Contact behavior tests pass.
- Static fallback adapter tests pass.
- Contact source-boundary tests pass.
- Contact cache/source contract passes.

---

## Task 3: Add WS3 Translation Narrowing Red Tests

**Files:**
- Modify: `tests/unit/scripts/check-translate-compat.test.ts`
- Modify: affected component tests listed in WS3 file structure

- [ ] **Step 1: Add script-level leaf-protection passing test**

In `tests/unit/scripts/check-translate-compat.test.ts`, add a marker scanning case:

```ts
it("does not require broad container notranslate when leaf labels are protected", () => {
  const missing = collectMissingMarkersFromSource(
    `
      export function Example() {
        return (
          <nav data-testid="header-desktop-nav">
            <span data-testid="header-nav-label-products" translate="no">
              Products
            </span>
          </nav>
        );
      }
    `,
    "src/components/layout/header.tsx",
    ["header-nav-label-", 'translate="no"'],
  );

  expect(missing).toEqual([]);
});
```

- [ ] **Step 2: Add script-level missing-leaf test**

Add:

```ts
it("does not let an unrelated translate guard satisfy a protected leaf label", () => {
  const missing = collectMissingMarkersFromSource(
    `
      export function Example() {
        return (
          <nav data-testid="header-desktop-nav">
            <span data-testid="header-nav-label-products">Products</span>
            <span translate="no">Other protected copy</span>
          </nav>
        );
      }
    `,
    "src/components/layout/header.tsx",
    ["header-nav-label-", 'translate="no"'],
  );

  expect(missing).toEqual([
    expect.objectContaining({ marker: 'translate="no"' }),
  ]);
});
```

This test must fail against the current token-only scanner. It should pass only after the script binds `translate="no"` to the matching protected leaf element.

- [ ] **Step 3: Add Contact page no-whole-page protection test**

In `src/app/[locale]/contact/__tests__/page.test.tsx`, add:

```ts
it("does not protect the entire Contact page from browser translation", async () => {
  const page = await ContactPage({
    params: Promise.resolve({ locale: "en" }),
  });

  await renderAsyncPage(page as React.JSX.Element);
  const shell = screen.getByTestId("contact-page-content");

  expect(shell).not.toHaveClass("notranslate");
  expect(shell).not.toHaveAttribute("translate", "no");
});
```

Then extend the existing `generateMetadata()` test in the same file:

```ts
expect(enMetadata.other).not.toMatchObject({ google: "notranslate" });
expect(zhMetadata.other).not.toMatchObject({ google: "notranslate" });
```

Do not use `container.querySelector('meta[name="google"]')` as metadata proof. `generateMetadata()` output is not rendered into the Testing Library page body container.

- [ ] **Step 4: Update component tests to expect leaf-only protection**

For each affected test, replace assertions that parent containers have `notranslate` with assertions that label spans have `translate="no"` and parent containers do not have broad protection:

```ts
expect(parentElement).not.toHaveClass("notranslate");
expect(parentElement).not.toHaveAttribute("translate", "no");
expect(labelElement).toHaveAttribute("translate", "no");
```

Apply this pattern to:

- `src/components/layout/__tests__/header.test.tsx`
- `tests/integration/components/header.test.tsx`
- `src/components/layout/__tests__/mobile-navigation.test.tsx`
- `src/components/layout/__tests__/vercel-navigation.test.tsx`
- `src/components/products/__tests__/inquiry-drawer.test.tsx`
- `src/components/sections/__tests__/final-cta.test.tsx`
- `src/components/sections/__tests__/sample-cta.test.tsx`

- [ ] **Step 5: Run WS3 red tests**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/check-translate-compat.test.ts 'src/app/[locale]/contact/__tests__/page.test.tsx' src/components/layout/__tests__/header.test.tsx tests/integration/components/header.test.tsx src/components/layout/__tests__/mobile-navigation.test.tsx src/components/layout/__tests__/vercel-navigation.test.tsx src/components/products/__tests__/inquiry-drawer.test.tsx src/components/sections/__tests__/final-cta.test.tsx src/components/sections/__tests__/sample-cta.test.tsx
```

Expected:

- Tests that still expect old broad wrappers fail.
- New Contact no-whole-page test fails until the page shell is narrowed.

---

## Task 4: Implement WS3 Translation Guardrail Narrowing

**Files:**
- Modify: `scripts/check-translate-compat.js`
- Modify: `tests/unit/scripts/check-translate-compat.test.ts`
- Modify: `src/app/[locale]/contact/page.tsx`
- Modify: components listed in WS3 file structure
- Modify: affected component tests listed in WS3 file structure

- [ ] **Step 1: Narrow translate-compat marker contracts and bind markers to leaves**

In `scripts/check-translate-compat.js`, update each rule so markers describe leaf protection, not broad wrappers.

Replace the Contact rule:

```js
{
  file: "src/app/[locale]/contact/page.tsx",
  markers: ["contact-page-content", "notranslate", 'translate="no"'],
},
```

with rules for the actual leaf-protected components:

```js
{
  file: "src/components/contact/product-family-context-notice.tsx",
  markers: ["product-family-context-notice", 'translate="no"'],
},
{
  file: "src/app/[locale]/contact/contact-form-static-fallback.tsx",
  markers: ["data-contact-form-fallback", 'translate="no"'],
},
```

For layout and CTA rules, remove `"notranslate"` from required markers and keep the data-testid prefix plus `'translate="no"'`.

Also update `collectMissingMarkersFromSource()` so it is no longer a whole-file token-presence check for leaf contracts:

- Find JSX elements whose `data-testid` literal or static template prefix matches the protected marker, such as `header-nav-label-`.
- For each matched JSX element, require `translate="no"` on that same JSX opening element.
- Keep exact-file markers such as `data-contact-form-fallback` as normal presence checks when the marker is not a leaf `data-testid` prefix.
- Keep the old `markerMatchesToken()` helper only for non-leaf markers.

The key negative case must fail:

```tsx
<span data-testid="header-nav-label-products">Products</span>
<span translate="no">Other protected copy</span>
```

The key positive case must pass:

```tsx
<span data-testid="header-nav-label-products" translate="no">Products</span>
```

This is still a source contract, not browser proof. It proves the guarded JSX leaf has a translation guard; it does not prove every browser translation extension behaves correctly.

- [ ] **Step 2: Rename the internal rule list for clarity**

Rename:

```js
const PROTECTED_SURFACE_RULES = [
```

to:

```js
const TRANSLATION_LEAF_RULES = [
```

Update downstream references:

```js
const RISK_SCAN_FILES = TRANSLATION_LEAF_RULES.map((rule) => rule.file).filter(
  (file) => file.endsWith(".tsx"),
);
```

Export names at the bottom must still include `RISK_SCAN_FILES`, `collectMissingMarkersFromSource`, and `collectRiskFindingsFromSource`.

- [ ] **Step 3: Remove Contact page-level translation protection**

In `src/app/[locale]/contact/page.tsx`:

- Remove the `other.google = "notranslate"` metadata override.
- Change the shell from:

```tsx
<main
  className="notranslate min-h-[80vh] px-4 py-16"
  data-testid="contact-page-content"
  translate="no"
>
```

to:

```tsx
<main className="min-h-[80vh] px-4 py-16" data-testid="contact-page-content">
```

- [ ] **Step 4: Remove broad wrappers in components**

Make these exact shape changes:

- `src/components/layout/header.tsx`
  - `className="header-nav-center notranslate"` becomes `className="header-nav-center"`.
  - Remove `translate="no"` from the nav wrapper.
  - Header CTA link keeps a child label span with `translate="no"` but the link itself loses `className="notranslate"` and `translate="no"`.
- `src/components/layout/vercel-navigation.tsx`
  - Remove `notranslate` class and wrapper-level `translate="no"` from the navigation root.
  - Keep trigger/link label spans with `translate="no"`.
- `src/components/layout/mobile-navigation-interactive.tsx`
  - Remove `className="notranslate ..."` and wrapper-level `translate="no"` from `mobile-language-switcher`.
  - Keep language label leaves with `translate="no"`.
- `src/components/products/inquiry-drawer.tsx`
  - Remove `notranslate` class and wrapper-level `translate="no"` from `inquiry-drawer-product-header`.
  - Keep product title and SKU leaves with `translate="no"`.
- `src/components/sections/final-cta.tsx`
  - Remove link-level `className="notranslate"` and `translate="no"`.
  - Keep `final-cta-primary-label` and `final-cta-secondary-label` spans with `translate="no"`.
- `src/components/sections/sample-cta.tsx`
  - Remove link-level `className="notranslate"` and `translate="no"`.
  - Keep `sample-cta-label` span with `translate="no"`.

- [ ] **Step 5: Run translation verification**

Run:

```bash
pnpm review:translate-compat
```

Expected:

- Translate compatibility tests pass.
- `scripts/check-translate-compat.js` passes.
- No test requires broad page or container `notranslate`.

---

## Task 5: Add WS4 Env Boundary Red Tests

**Files:**
- Create: `tests/architecture/env-boundary.test.ts`

- [ ] **Step 1: Create env source-boundary test**

Create `tests/architecture/env-boundary.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ENV_FACADE = "src/lib/env.ts";
const ENV_SCHEMA = "src/lib/env-schemas.ts";
const ENV_RUNTIME = "src/lib/env-runtime.ts";
const INTERNAL_ENV_IMPORT_PATTERN =
  /from\s+["']@\/lib\/env-(?:schemas|runtime)["']|from\s+["']\.\/env-(?:schemas|runtime)["']/;

function read(path: string) {
  return readFileSync(path, "utf8");
}

function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      return collectSourceFiles(fullPath);
    }

    return fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")
      ? [fullPath]
      : [];
  });
}

describe("@/lib/env public facade", () => {
  it("keeps schema and runtime mapping out of the public facade", () => {
    const source = read(ENV_FACADE);

    expect(source).toContain("createEnv");
    expect(source).toContain("serverEnvSchema");
    expect(source).toContain("clientEnvSchema");
    expect(source).toContain("runtimeEnv");
    expect(source).toContain("readRawEnvValue");
    expect(source).toContain("shouldSkipEnvValidation");
    expect(source).not.toContain("DATABASE_URL: z.string()");
    expect(source).not.toContain("DATABASE_URL: process.env.DATABASE_URL");
    expect(source).not.toContain("process.env.");
  });

  it("keeps raw process.env reads inside the internal runtime module", () => {
    const source = read(ENV_RUNTIME);

    expect(source).toContain("export const runtimeEnv");
    expect(source).toContain("export function readRawEnvValue");
    expect(source).toContain("export function shouldSkipEnvValidation");
    expect(source).toContain("DATABASE_URL: process.env.DATABASE_URL");
    expect(source).toContain(
      "NEXT_PUBLIC_DEPLOYMENT_PLATFORM: process.env.NEXT_PUBLIC_DEPLOYMENT_PLATFORM",
    );
  });

  it("keeps zod schemas inside the internal schema module", () => {
    const source = read(ENV_SCHEMA);

    expect(source).toContain("export const serverEnvSchema");
    expect(source).toContain("export const clientEnvSchema");
    expect(source).toContain("DATABASE_URL: z.string().url().optional()");
    expect(source).toContain(
      'NEXT_PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000")',
    );
  });

  it("prevents app code from importing env internal modules directly", () => {
    const sourceFiles = collectSourceFiles(join(ROOT, "src")).filter(
      (filePath) =>
        !filePath.endsWith("src/lib/env.ts") &&
        !filePath.endsWith("src/lib/env-schemas.ts") &&
        !filePath.endsWith("src/lib/env-runtime.ts"),
    );

    for (const filePath of sourceFiles) {
      const source = read(filePath);

      expect(source, filePath).not.toMatch(INTERNAL_ENV_IMPORT_PATTERN);
    }
  });
});
```

- [ ] **Step 2: Run WS4 red test**

Run:

```bash
pnpm exec vitest run tests/architecture/env-boundary.test.ts
```

Expected:

- Test fails because `src/lib/env-schemas.ts` and `src/lib/env-runtime.ts` do not exist yet, and `src/lib/env.ts` still owns schema/runtime/raw-env concerns.

---

## Task 6: Implement WS4 Env Internal Split

**Files:**
- Create: `src/lib/env-schemas.ts`
- Create: `src/lib/env-runtime.ts`
- Modify: `src/lib/env.ts`
- Test: `tests/architecture/env-boundary.test.ts`

- [ ] **Step 1: Move schemas into `src/lib/env-schemas.ts`**

Create `src/lib/env-schemas.ts` by mechanically extracting the current server and client schema objects from `src/lib/env.ts`.

The resulting file must import `z` from `zod`, export `serverEnvSchema`, and export `clientEnvSchema`. The extraction rule is strict: preserve every existing environment variable name, Zod default, enum, coercion, optional marker, and transform. The only intended source change is moving those two object literals out of `src/lib/env.ts`.

- [ ] **Step 2: Move runtime mapping into `src/lib/env-runtime.ts`**

Create `src/lib/env-runtime.ts` by mechanically extracting the current `runtimeEnv` object from `src/lib/env.ts`, and by moving the remaining raw env helper reads into this internal module.

The resulting file must export:

```ts
export const runtimeEnv = {
  // mechanically extracted current runtimeEnv mapping
};

export function readRawEnvValue(key: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined;
  }

  return process.env[key];
}

export function shouldSkipEnvValidation(): boolean {
  return readRawEnvValue("SKIP_ENV_VALIDATION") === "true";
}
```

The extraction rule is strict: preserve every current `process.env.*` read and every environment variable key. After this step, `src/lib/env.ts` must not contain raw `process.env.`.

- [ ] **Step 3: Rebuild public facade**

In `src/lib/env.ts`, replace inline schema and runtime objects with imports:

```ts
import { createEnv } from "@t3-oss/env-nextjs";
import { clientEnvSchema, serverEnvSchema } from "./env-schemas";
import {
  readRawEnvValue,
  runtimeEnv,
  shouldSkipEnvValidation,
} from "./env-runtime";

export const env = createEnv({
  server: serverEnvSchema,
  client: clientEnvSchema,
  runtimeEnv,
  skipValidation: shouldSkipEnvValidation(),
  emptyStringAsUndefined: true,
});
```

Update the existing `readProcessEnvValue()` helper in `src/lib/env.ts` to delegate to the internal raw env helper:

```ts
function readProcessEnvValue(key: keyof typeof env): string | undefined {
  return readRawEnvValue(key);
}
```

Keep the rest of the public helper functions below this block unchanged unless TypeScript requires a type-only adjustment.

- [ ] **Step 4: Run env boundary checks**

Run:

```bash
pnpm exec vitest run tests/architecture/env-boundary.test.ts
pnpm review:env-boundaries
pnpm review:server-env-boundaries
pnpm type-check
```

Expected:

- Env architecture test passes.
- Env boundary scripts pass.
- TypeScript passes.

If `review:server-env-boundaries` flags `src/lib/env-runtime.ts`, update its allowlist to treat `src/lib/env-runtime.ts` as part of the env boundary, not app code.

---

## Task 7: Add WS5 Semgrep Rule Tests

**Files:**
- Create: `tests/semgrep/rules/object-injection-untrusted-key-write.yaml`
- Create: `tests/semgrep/targets/object-injection-untrusted-key-write.ts`
- Modify: `scripts/semgrep-test-rules.js`

- [ ] **Step 1: Add fixture rule**

Create `tests/semgrep/rules/object-injection-untrusted-key-write.yaml`:

```yaml
rules:
  - id: object-injection-untrusted-key-write
    patterns:
      - pattern-either:
          - pattern: |
              const $KEY = $REQ.nextUrl.searchParams.get($NAME)
              ...
              $OBJ[$KEY] = $VALUE
          - pattern: |
              const $BODY = await $REQ.json()
              ...
              $OBJ[$BODY[$KEY]] = $VALUE
          - pattern: |
              const $BODY = await $REQ.json()
              ...
              $OBJ[$BODY.$FIELD] = $VALUE
          - pattern: |
              const $KEY = $URL.searchParams.get($NAME)
              ...
              $OBJ[$KEY] = $VALUE
    message: "Untrusted request/query/body key used as an object write key"
    languages: [typescript, javascript]
    severity: ERROR
    paths:
      include:
        - "src/app/api/**/*.ts"
        - "tests/semgrep/targets/**/*.ts"
      exclude:
        - "**/__tests__/**"
        - "**/*.test.*"
        - "**/*.spec.*"
```

- [ ] **Step 2: Add Semgrep target**

Create `tests/semgrep/targets/object-injection-untrusted-key-write.ts`:

```ts
export async function unsafeSearchParamWrite(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("field");
  const output: Record<string, string> = {};

  if (key) {
    // ruleid: object-injection-untrusted-key-write
    output[key] = "value";
  }

  return output;
}

export async function unsafeJsonBodyWrite(req: Request) {
  const body = await req.json();
  const output: Record<string, string> = {};

  // ruleid: object-injection-untrusted-key-write
  output[body.field] = "value";

  return output;
}

export function safeLiteralWrite() {
  const output: Record<string, string> = {};

  // ok: object-injection-untrusted-key-write
  output.status = "ok";

  return output;
}

export function safeAllowlistedWrite(field: "name" | "email") {
  const output: Record<"name" | "email", string> = {
    name: "",
    email: "",
  };

  // ok: object-injection-untrusted-key-write
  output[field] = "value";

  return output;
}
```

- [ ] **Step 3: Register fixture in Semgrep test runner**

In `scripts/semgrep-test-rules.js`, add:

```js
{
  ruleId: "object-injection-untrusted-key-write",
  config: "tests/semgrep/rules/object-injection-untrusted-key-write.yaml",
  target: "tests/semgrep/targets/object-injection-untrusted-key-write.ts",
  expectedFindings: 2,
},
```

to `FILE_CONTRACT_FIXTURES`.

- [ ] **Step 4: Run Semgrep red/fixture test**

Run:

```bash
pnpm security:semgrep:test-rules
```

Expected:

- The new fixture passes if the test rule matches exactly two unsafe cases: the search-param key write and the `body.field` key write.
- If Semgrep `--test` reports annotation mismatch, adjust the fixture rule before touching production `semgrep.yml`.

---

## Task 8: Implement WS5 Semgrep Narrowing and Security Wrapper Cleanup

**Files:**
- Modify: `semgrep.yml`
- Modify: `src/lib/security/object-guards.ts`
- Modify: `src/lib/security/__tests__/object-guards.test.ts`
- Test: `scripts/semgrep-test-rules.js`

- [ ] **Step 1: Add production Semgrep ERROR rule**

In `semgrep.yml`, add the same `object-injection-untrusted-key-write` rule from the fixture under `rules:`.

- [ ] **Step 2: Downgrade broad dynamic property rule**

In `semgrep.yml`, change:

```yaml
  - id: object-injection-sink-dynamic-property
    ...
    severity: ERROR
```

to:

```yaml
  - id: object-injection-sink-dynamic-property
    ...
    severity: WARNING
```

Update its message to:

```yaml
    message: '检测到动态属性访问：这是启发式风险信号；只有未校验请求/query/body key 写入对象时才应作为阻断级问题'
```

- [ ] **Step 3: Prove unused object guard wrappers before deleting them**

Run:

```bash
rg -n "safe(Get|Set|Delete|Keys|Values|Entries|Merge|DeepGet)|createSafeProxy|createWhitelistAccessor|SafeAccess|validateObjectStructure" src tests --glob '!src/lib/security/object-guards.ts' --glob '!src/lib/security/__tests__/object-guards.test.ts'
```

Expected:

- No output.

If this command finds production references outside `object-guards.ts` and its self-test, stop and revise the cleanup scope instead of deleting exported APIs blindly.

- [ ] **Step 4: Simplify object guards to used API**

Replace `src/lib/security/object-guards.ts` with:

```ts
/**
 * Object ownership helpers.
 *
 * Keep this module small: it is a real boundary used by mergeObjects, not a
 * pile of wrapper APIs created only to satisfy static analysis shape.
 */
export const hasOwn = <T extends object>(
  obj: T,
  key: PropertyKey,
): key is keyof T => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
```

- [ ] **Step 5: Replace object guard tests with ownership tests**

Replace `src/lib/security/__tests__/object-guards.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { hasOwn } from "@/lib/security/object-guards";

describe("hasOwn", () => {
  it("returns true for own properties", () => {
    const obj = { name: "test", value: 42 };

    expect(hasOwn(obj, "name")).toBe(true);
    expect(hasOwn(obj, "value")).toBe(true);
  });

  it("returns false for missing properties", () => {
    const obj = { name: "test" };

    expect(hasOwn(obj, "missing")).toBe(false);
  });

  it("does not treat inherited properties as own properties", () => {
    const parent = { inherited: "value" };
    const child = Object.create(parent) as { own: string; inherited: string };
    child.own = "own";

    expect(hasOwn(child, "own")).toBe(true);
    expect(hasOwn(child, "inherited")).toBe(false);
  });

  it("supports symbol keys", () => {
    const key = Symbol("visible");
    const obj = { [key]: true };

    expect(hasOwn(obj, key)).toBe(true);
  });
});
```

- [ ] **Step 6: Run Semgrep/security verification**

Run:

```bash
pnpm exec vitest run src/lib/security/__tests__/object-guards.test.ts
pnpm security:semgrep:test-rules
pnpm security:semgrep
```

Expected:

- Object guard tests pass.
- Semgrep fixture tests pass.
- Production Semgrep scan exits successfully or reports only non-blocking WARNING findings generated by the broad heuristic rule.

---

## Task 9: Add WS5 Generic Numeric Constant Source Contract

**Files:**
- Create: `tests/architecture/generic-numeric-constants.test.ts`

- [ ] **Step 1: Create numeric constant architecture test**

Create `tests/architecture/generic-numeric-constants.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const PRODUCTION_FILES_TO_CHECK = [
  "src/app/[locale]/contact/page.tsx",
  "src/services/url-generator.ts",
  "src/i18n/request.ts",
  "src/hooks/use-keyboard-navigation.ts",
  "src/hooks/use-intersection-observer.ts",
  "src/components/error-boundary.tsx",
  "src/components/ui/scroll-reveal.tsx",
  "src/components/ui/animated-counter.tsx",
  "src/components/ui/animated-counter-helpers.tsx",
  "src/lib/lead-pipeline/utils.ts",
  "src/lib/accessibility-utils.ts",
];

function read(repoPath: string) {
  return readFileSync(join(ROOT, repoPath), "utf8");
}

describe("generic numeric constants", () => {
  it("does not import ZERO or ONE in cleaned production files", () => {
    for (const file of PRODUCTION_FILES_TO_CHECK) {
      const source = read(file);

      expect(source, file).not.toMatch(
        /import\s+\{[^}]*\b(?:ZERO|ONE)\b[^}]*\}\s+from\s+["']@\/constants["']/,
      );
    }
  });

  it("does not use global COUNT_TWO in cleaned TSX files", () => {
    const uiFiles = PRODUCTION_FILES_TO_CHECK.filter((file) =>
      file.endsWith(".tsx"),
    );

    for (const file of uiFiles) {
      const source = read(file);

      expect(source, file).not.toContain("COUNT_TWO");
    }
  });
});
```

- [ ] **Step 2: Run numeric red test**

Run:

```bash
pnpm exec vitest run tests/architecture/generic-numeric-constants.test.ts
```

Expected:

- Test fails on current generic constant imports and `COUNT_TWO` UI usage.

---

## Task 10: Implement WS5 Numeric Constant Cleanup

**Files:**
- Modify: files listed in `PRODUCTION_FILES_TO_CHECK`
- Modify: `src/constants/index.ts`
- Test: `tests/architecture/generic-numeric-constants.test.ts`

- [ ] **Step 1: Replace simple `ZERO` and `ONE` idioms**

In the files listed by `PRODUCTION_FILES_TO_CHECK`, replace generic constants with direct literals when the new Phase 0 rule says the literal is clearer:

```ts
path.split("?")[ZERO]
```

becomes:

```ts
path.split("?")[0]
```

```ts
localeMatch[ONE]
```

becomes:

```ts
localeMatch[1]
```

```ts
elements.length - ONE
```

becomes:

```ts
elements.length - 1
```

```ts
if (index >= ZERO)
```

becomes:

```ts
if (index >= 0)
```

- [ ] **Step 2: Replace global `COUNT_TWO` in listed TSX files**

In the listed TSX files, do not use global `COUNT_TWO`. Replace simple UI literals directly:

```tsx
strokeWidth={COUNT_TWO}
```

with:

```tsx
strokeWidth={2}
```

When `2` carries local domain meaning, keep the local domain-named property or constant and assign it from literal `2`:

```ts
const EASING_CONSTANTS = {
  OFFSET: -2,
  DIVISOR: 2,
} as const;
```

Keep named constants only where the name carries domain meaning, such as `HEX_CHARS_PER_BYTE`, `MIN_OKLCH_PARTS`, or rate-limit thresholds. Do not keep the global `COUNT_TWO` alias in the listed TSX files.

- [ ] **Step 3: Clean imports**

Remove unused imports from `@/constants` in each modified file. If a file no longer needs any constants, remove the whole import.

- [ ] **Step 4: De-emphasize generic constants in facade comment**

In `src/constants/index.ts`, change:

```ts
// 魔法数字常量 - Facade聚合入口
```

to:

```ts
// Legacy compatibility constants. Do not introduce ZERO/ONE in new production code.
```

Do not remove `ZERO` or `ONE` exports in this PR unless `rg -n "\b(ZERO|ONE)\b" src tests scripts` proves no remaining consumers.

- [ ] **Step 5: Run numeric verification**

Run:

```bash
pnpm exec vitest run tests/architecture/generic-numeric-constants.test.ts
pnpm exec eslint 'src/app/[locale]/contact/page.tsx' src/services/url-generator.ts src/i18n/request.ts src/hooks/use-keyboard-navigation.ts src/hooks/use-intersection-observer.ts src/components/error-boundary.tsx src/components/ui/scroll-reveal.tsx src/components/ui/animated-counter.tsx src/components/ui/animated-counter-helpers.tsx src/lib/lead-pipeline/utils.ts src/lib/accessibility-utils.ts src/constants/index.ts --config eslint.config.mjs --max-warnings 0
```

Expected:

- Numeric source contract passes.
- ESLint passes for cleaned files.

---

## Task 11: Update Guardrail Documentation for WS2-WS5

**Files:**
- Modify: `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`
- Modify: `docs/guides/PROOF-BOUNDARY-MAP.md`

- [ ] **Step 1: Update side-effect register treatment statuses**

In `docs/guides/GUARDRAIL-SIDE-EFFECTS.md`, update the Treatment column after each workstream is green:

```markdown
| Contact page | static content/cache source contract | `src/app/[locale]/contact/page.tsx` used to import generated manifest and own the fallback form | Adapter concern was embedded in page | WS2 repaired: route orchestration, data module, fallback adapter |
| Translation protection | translate-compat marker scan | broad `notranslate` wrappers used to satisfy marker checks | Encouraged broad browser-translation blocking | WS3 repaired: leaf-level protection contracts |
| Env contract | file-size pressure and public import stability | `src/lib/env.ts` used to own schema, runtime mapping, and accessors | Internal implementation remained over-concentrated | WS4 repaired: public facade plus internal schema/runtime modules |
| Semgrep dynamic property scan | broad object-injection pattern | `src/lib/security/object-guards.ts` wrapper pile existed mainly for scanner shape | Security-looking wrappers could outlive real production value | WS5 repaired: broad heuristic downgraded, untrusted-key write rule added |
| Magic numbers | broad no-magic-numbers interpretation | generic constants such as `ZERO`, `ONE`, `COUNT_TWO` appeared in production | Read worse than direct literals for language/UI idioms | WS5 repaired for scoped production files; legacy exports kept for compatibility |
```

- [ ] **Step 2: Update proof boundary map**

In `docs/guides/PROOF-BOUNDARY-MAP.md`, add:

```markdown
## Guardrail side-effect proof boundaries

| Proof | What it proves | What it does not prove |
|-------|----------------|------------------------|
| `tests/architecture/contact-page-boundary.test.ts` | Contact route file no longer owns generated content/message loading or fallback form markup; section/fallback modules own those route-local responsibilities. | The Contact page looks correct in a browser. |
| `src/app/[locale]/contact/__tests__/contact-form-static-fallback.test.tsx` | The static fallback adapter renders disabled fields and leaf-level translation guards. | Suspense fallback timing in a real browser. |
| `pnpm review:translate-compat` | Protected text leaves still carry translation guards bound to matching JSX leaves, and broad wrappers are no longer required by the script. | Browser translation behavior in every extension or browser locale. |
| `tests/architecture/env-boundary.test.ts` | `@/lib/env` remains the public facade while schema/runtime/raw-env internals are split. | Production environment variables are configured correctly. |
| `pnpm security:semgrep:test-rules` | Semgrep fixture rules match the intended source patterns. | Semgrep has complete data-flow understanding of every runtime input. |
| `tests/architecture/generic-numeric-constants.test.ts` | Scoped production files no longer import generic `ZERO`/`ONE`, and listed TSX files do not use global `COUNT_TWO`. | Every numeric literal in the repo has perfect domain naming. |
```

- [ ] **Step 3: Verify docs**

Run:

```bash
pnpm truth:check
```

Expected:

- Static truth check passes.

---

## Task 12: Final PR-Level Verification

**Files:**
- No new implementation files.

- [ ] **Step 1: Run targeted WS2-WS5 tests**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/contact/__tests__/page.test.tsx' 'src/app/[locale]/contact/__tests__/contact-form-static-fallback.test.tsx' tests/architecture/contact-page-boundary.test.ts tests/architecture/cache-directive-policy.test.ts tests/unit/scripts/check-translate-compat.test.ts tests/architecture/env-boundary.test.ts src/lib/security/__tests__/object-guards.test.ts tests/architecture/generic-numeric-constants.test.ts
```

Expected:

- All listed tests pass.

- [ ] **Step 2: Run translation and env guardrails**

Run:

```bash
pnpm review:translate-compat
pnpm review:env-boundaries
pnpm review:server-env-boundaries
pnpm review:scripts-env
```

Expected:

- All guardrails pass.

- [ ] **Step 3: Run Semgrep verification**

Run:

```bash
pnpm security:semgrep:test-rules
pnpm security:semgrep
```

Expected:

- Rule fixtures pass.
- Production Semgrep scan completes successfully.
- Broad object-injection dynamic property findings are WARNING-level heuristic findings, not ERROR blockers.

- [ ] **Step 4: Run lint and type-check**

Run:

```bash
pnpm exec eslint 'src/app/[locale]/contact/page.tsx' 'src/app/[locale]/contact/contact-page-data.ts' 'src/app/[locale]/contact/contact-form-static-fallback.tsx' 'src/app/[locale]/contact/contact-page-sections.tsx' 'src/components/layout/header.tsx' 'src/components/layout/vercel-navigation.tsx' 'src/components/layout/mobile-navigation-interactive.tsx' 'src/components/products/inquiry-drawer.tsx' 'src/components/sections/final-cta.tsx' 'src/components/sections/sample-cta.tsx' 'src/lib/env.ts' 'src/lib/env-schemas.ts' 'src/lib/env-runtime.ts' 'src/lib/security/object-guards.ts' 'src/constants/index.ts' 'scripts/check-translate-compat.js' 'scripts/semgrep-test-rules.js' --config eslint.config.mjs --max-warnings 0
pnpm type-check
```

Expected:

- ESLint exits 0.
- TypeScript exits 0.

- [ ] **Step 5: Run build checks serially**

Run:

```bash
pnpm build
pnpm build:cf
```

Expected:

- `pnpm build` passes.
- `pnpm build:cf` passes.
- If `build:cf` moves `.next` or `.open-next` into `.trash-next-artifacts`, treat that as expected local artifact cleanup.

- [ ] **Step 6: Re-run Phase 0 + WS1 focused tests after WS2-WS5**

Run:

```bash
pnpm exec vitest run 'src/app/[locale]/products/[market]/__tests__/market-landing.test.tsx' 'src/app/[locale]/products/__tests__/interactive-islands-usage.test.ts' tests/architecture/cache-directive-policy.test.ts src/lib/contact/__tests__/product-family-context.test.ts src/components/products/__tests__/family-section.test.tsx
```

Expected:

- Phase 0 + WS1 guardrails still pass after WS2-WS5.

- [ ] **Step 7: Final status check**

Run:

```bash
git status --short
git diff --stat
```

Expected:

- Worktree contains Phase 0 + WS1 + WS2-WS5 changes only.
- No generated artifacts outside intended tracked source/doc/test files are staged or accidentally included.

---

## Stop Lines

Stop and ask before doing any of these:

- Changing Contact form submission payload.
- Changing `/api/inquiry`.
- Adding product context to lead schema, email payload, CRM payload, or idempotency key.
- Reintroducing broad whole-page `notranslate`.
- Removing `@/lib/env` public import contract.
- Removing `ZERO` or `ONE` exports from constants before proving all consumers are gone.
- Treating Semgrep warnings as security fixes without fixture proof.
- Deleting files permanently.

## Plan Self-Review

- **Spec coverage:** Covers WS2 Contact boundary, WS3 translation narrowing, WS4 env internal split, WS5 Semgrep/numeric cleanup, docs, and final PR verification.
- **No placeholder scan:** No unresolved `TBD`, `TODO`, or "implement later" entries remain; Semgrep `...` patterns are intentional Semgrep syntax, not plan placeholders.
- **Type consistency:** Contact search params type is owned by `contact-page-sections.tsx`; env public exports remain in `src/lib/env.ts`; Semgrep fixture names match script registration; numeric contract file list matches cleanup files.
- **Scope control:** Lead pipeline, Contact payload, CRM/email, product drawer, and broad redesign are explicitly out of scope.
- **PR coherence:** The plan keeps Phase 0 + WS1 + WS2-WS5 as one story: quality guardrails should protect real boundaries instead of rewarding cosmetic structure.
