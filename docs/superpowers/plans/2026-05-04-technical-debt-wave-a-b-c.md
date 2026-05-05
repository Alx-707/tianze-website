# Technical Debt Waves A/B/C Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the six approved non-launch engineering follow-ups: lead partial-success recovery, staging lead canary boundary, product/spec parity, product sitemap freshness, local Cloudflare preview diagnostics, and CSP paid-traffic decision prep.

**Architecture:** Implement three independently reviewable waves. Wave A adds an owner-recovery signal for partial contact leads and makes staging canary artifacts self-describing as non-production proof. Wave B adds explicit product truth guard helpers and removes silent product sitemap fallback. Wave C adds local Cloudflare preview diagnostics plus a CSP decision memo without changing production CSP policy.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Vitest 4, Node 24 scripts, OpenNext Cloudflare, existing `pnpm` proof commands.

---

## Source spec

Approved design:

- `docs/superpowers/specs/2026-05-04-technical-debt-wave-a-b-c-design.md`

## Safety boundaries

- Do not run production deploy commands.
- Do not submit a production lead canary.
- Do not clean Cloudflare Durable Objects.
- Do not replace logo, phone, privacy, ISO, or hero image business assets.
- Do not remove `script-src-elem 'unsafe-inline'` in this wave.
- Do not run `pnpm build`, `pnpm build:cf`, `pnpm preview:cf`, or deploy commands in parallel.

## File map

### Wave A - Lead reliability

- Create: `src/lib/lead-pipeline/partial-success-recovery.ts`
  - Owns the owner-facing partial-success recovery event.
- Create: `src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts`
  - Unit tests for sanitized recovery event payloads.
- Modify: `src/lib/lead-pipeline/process-lead.ts`
  - Calls the recovery event when `recordPipelineObservability()` returns `partialSuccess: true`.
- Modify: `src/lib/lead-pipeline/__tests__/process-lead-observability.test.ts`
  - Verifies the recovery event is called for both partial-success directions and not called for full success.
- Modify: `scripts/deploy/staging-lead-canary.mjs`
  - Adds a report-level proof boundary field.
- Modify: `tests/unit/scripts/staging-lead-canary.test.ts`
  - Verifies staging canary reports state their non-production boundary.
- Modify: `docs/guides/STAGING-LEAD-CANARY.md`
  - Documents the report boundary field.

### Wave B - Product truth guards

- Create: `src/constants/product-specs/market-spec-parity.ts`
  - Generates and formats catalog/spec parity reports.
- Create: `src/constants/product-specs/__tests__/market-spec-parity.test.ts`
  - Unit tests live and simulated parity behavior.
- Modify: `src/constants/product-specs/__tests__/market-spec-registry.test.ts`
  - Uses the parity helper rather than ad hoc equality.
- Modify: `src/config/single-site-seo.ts`
  - Exports product sitemap freshness source and removes silent product-market fallback.
- Modify: `src/config/__tests__/single-site-seo.test.ts`
  - Verifies market lastmod values come from `MarketSpecs.updatedAt`.

### Wave C - Proof gap and CSP decision prep

- Create: `scripts/cloudflare/preview-smoke-diagnostics.mjs`
  - Serial local preview probe that writes route/status/body snippets to JSON.
- Create: `tests/unit/scripts/preview-smoke-diagnostics.test.ts`
  - Unit tests for diagnostic report building.
- Modify: `package.json`
  - Adds `diagnose:cf:preview`.
- Modify: `docs/technical/technical-debt.md`
  - Adds the diagnostic command and current TD-004 handling boundary.
- Create: `docs/technical/csp-paid-traffic-decision.md`
  - CSP paid-traffic decision memo.
- Modify: `tests/unit/scripts/proof-lane-contract.test.ts`
  - Source-contract test ensuring the CSP memo stays present and does not recommend an immediate rewrite.

---

## Task 1: Add partial-success recovery event module

**Files:**
- Create: `src/lib/lead-pipeline/partial-success-recovery.ts`
- Create: `src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts`

- [ ] **Step 1: Write the failing unit test**

Create `src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CONTACT_SUBJECTS, LEAD_TYPES } from "../lead-schema";

const mockLoggerError = vi.hoisted(() => vi.fn());

vi.mock("@/lib/logger", () => ({
  logger: {
    error: mockLoggerError,
  },
  sanitizeEmail: (email: string | undefined | null) =>
    email ? "[REDACTED_EMAIL]" : "[NO_EMAIL]",
}));

describe("recordPartialSuccessRecovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("emits an owner recovery event when email succeeds but CRM fails", async () => {
    const { recordPartialSuccessRecovery } = await import(
      "../partial-success-recovery"
    );

    recordPartialSuccessRecovery({
      lead: {
        type: LEAD_TYPES.CONTACT,
        fullName: "John Doe",
        email: "john@example.com",
        subject: CONTACT_SUBJECTS.PRODUCT_INQUIRY,
        message: "This is a test message with enough characters.",
        turnstileToken: "valid-token",
      },
      referenceId: "CON-123",
      emailSent: true,
      recordCreated: false,
      requestId: "req-email-only",
    });

    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead partial success requires owner follow-up",
      {
        type: LEAD_TYPES.CONTACT,
        referenceId: "CON-123",
        email: "[REDACTED_EMAIL]",
        emailSent: true,
        recordCreated: false,
        recoveryReason: "crm_record_missing",
        requestId: "req-email-only",
      },
    );
  });

  it("emits an owner recovery event when CRM succeeds but email fails", async () => {
    const { recordPartialSuccessRecovery } = await import(
      "../partial-success-recovery"
    );

    recordPartialSuccessRecovery({
      lead: {
        type: LEAD_TYPES.CONTACT,
        fullName: "Jane Doe",
        email: "jane@example.com",
        subject: CONTACT_SUBJECTS.OTHER,
        message: "This is another test message with enough characters.",
        turnstileToken: "valid-token",
      },
      referenceId: "CON-456",
      emailSent: false,
      recordCreated: true,
    });

    expect(mockLoggerError).toHaveBeenCalledWith(
      "Lead partial success requires owner follow-up",
      {
        type: LEAD_TYPES.CONTACT,
        referenceId: "CON-456",
        email: "[REDACTED_EMAIL]",
        emailSent: false,
        recordCreated: true,
        recoveryReason: "email_delivery_missing",
      },
    );
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts
```

Expected: FAIL because `../partial-success-recovery` does not exist.

- [ ] **Step 3: Implement the recovery event module**

Create `src/lib/lead-pipeline/partial-success-recovery.ts`:

```ts
import type { LeadInput } from "@/lib/lead-pipeline/lead-schema";
import { logger, sanitizeEmail } from "@/lib/logger";

export type PartialSuccessRecoveryReason =
  | "crm_record_missing"
  | "email_delivery_missing"
  | "mixed_partial_success";

export interface PartialSuccessRecoveryEvent {
  lead: LeadInput;
  referenceId: string;
  emailSent: boolean;
  recordCreated: boolean;
  requestId?: string | undefined;
}

function getRecoveryReason(
  emailSent: boolean,
  recordCreated: boolean,
): PartialSuccessRecoveryReason {
  if (emailSent && !recordCreated) {
    return "crm_record_missing";
  }
  if (!emailSent && recordCreated) {
    return "email_delivery_missing";
  }
  return "mixed_partial_success";
}

export function recordPartialSuccessRecovery(
  event: PartialSuccessRecoveryEvent,
): void {
  logger.error("Lead partial success requires owner follow-up", {
    type: event.lead.type,
    referenceId: event.referenceId,
    email: sanitizeEmail(event.lead.email),
    emailSent: event.emailSent,
    recordCreated: event.recordCreated,
    recoveryReason: getRecoveryReason(event.emailSent, event.recordCreated),
    ...(event.requestId ? { requestId: event.requestId } : {}),
  });
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run:

```bash
pnpm exec vitest run src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add src/lib/lead-pipeline/partial-success-recovery.ts src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts
git commit -m "feat(lead): add partial success recovery event"
```

---

## Task 2: Wire partial-success recovery into lead processing

**Files:**
- Modify: `src/lib/lead-pipeline/process-lead.ts`
- Modify: `src/lib/lead-pipeline/__tests__/process-lead-observability.test.ts`

- [ ] **Step 1: Add failing process-level assertions**

Modify `src/lib/lead-pipeline/__tests__/process-lead-observability.test.ts`.

Add hoisted mock near the existing hoisted mocks:

```ts
const mockRecordPartialSuccessRecovery = vi.hoisted(() => vi.fn());
```

Add this mock below the existing `pipeline-observability` mock:

```ts
vi.mock("@/lib/lead-pipeline/partial-success-recovery", () => ({
  recordPartialSuccessRecovery: mockRecordPartialSuccessRecovery,
}));
```

In `beforeEach`, `vi.clearAllMocks()` already resets it.

Add these tests inside `describe("processLead observability contracts", () => { ... })`:

```ts
  it("records owner recovery when partial success is email-only", async () => {
    const emailResult = {
      success: true as const,
      id: "email-123",
      latencyMs: 10,
    };
    const crmResult = {
      success: false as const,
      error: new Error("CRM failed"),
      latencyMs: 20,
    };
    mockProcessContactLead.mockResolvedValue({ emailResult, crmResult });
    mockRecordPipelineObservability.mockReturnValue({
      success: false,
      partialSuccess: true,
    });

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-email-only",
    });

    expect(result.partialSuccess).toBe(true);
    expect(mockRecordPartialSuccessRecovery).toHaveBeenCalledWith(
      expect.objectContaining({
        lead: expect.objectContaining({ email: "john@example.com" }),
        referenceId: expect.stringMatching(/^CON-/),
        emailSent: true,
        recordCreated: false,
        requestId: "req-email-only",
      }),
    );
  });

  it("records owner recovery when partial success is CRM-only", async () => {
    const emailResult = {
      success: false as const,
      error: new Error("Email failed"),
      latencyMs: 10,
    };
    const crmResult = {
      success: true as const,
      id: "record-123",
      latencyMs: 20,
    };
    mockProcessContactLead.mockResolvedValue({ emailResult, crmResult });
    mockRecordPipelineObservability.mockReturnValue({
      success: false,
      partialSuccess: true,
    });

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-crm-only",
    });

    expect(result.partialSuccess).toBe(true);
    expect(mockRecordPartialSuccessRecovery).toHaveBeenCalledWith(
      expect.objectContaining({
        referenceId: expect.stringMatching(/^CON-/),
        emailSent: false,
        recordCreated: true,
        requestId: "req-crm-only",
      }),
    );
  });

  it("does not record owner recovery for complete success", async () => {
    const emailResult = {
      success: true as const,
      id: "email-123",
      latencyMs: 10,
    };
    const crmResult = {
      success: true as const,
      id: "record-123",
      latencyMs: 20,
    };
    mockProcessContactLead.mockResolvedValue({ emailResult, crmResult });
    mockRecordPipelineObservability.mockReturnValue({
      success: true,
      partialSuccess: false,
    });

    const result = await processLead(VALID_CONTACT_LEAD, {
      requestId: "req-success",
    });

    expect(result.success).toBe(true);
    expect(mockRecordPartialSuccessRecovery).not.toHaveBeenCalled();
  });
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run src/lib/lead-pipeline/__tests__/process-lead-observability.test.ts
```

Expected: FAIL because `recordPartialSuccessRecovery()` is not called yet.

- [ ] **Step 3: Wire recovery event in `process-lead.ts`**

In `src/lib/lead-pipeline/process-lead.ts`, add the import:

```ts
import { recordPartialSuccessRecovery } from "@/lib/lead-pipeline/partial-success-recovery";
```

Inside `processLead()`, after:

```ts
    const outcome = recordPipelineObservability({
      lead,
      referenceId,
      emailResult,
      crmResult,
      hasEmailOperation,
      totalLatencyMs,
      ...withRequestId(requestId),
    });
```

add:

```ts
    if (outcome.partialSuccess) {
      recordPartialSuccessRecovery({
        lead,
        referenceId,
        emailSent: emailResult.success,
        recordCreated: crmResult.success,
        ...withRequestId(requestId),
      });
    }
```

- [ ] **Step 4: Run targeted tests and verify GREEN**

Run:

```bash
pnpm exec vitest run src/lib/lead-pipeline/__tests__/process-lead-observability.test.ts src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run broader lead-family proof**

Run:

```bash
pnpm review:lead-family
```

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/lib/lead-pipeline/process-lead.ts src/lib/lead-pipeline/__tests__/process-lead-observability.test.ts
git commit -m "fix(lead): record partial success owner recovery"
```

---

## Task 3: Make staging canary reports self-describe proof boundary

**Files:**
- Modify: `scripts/deploy/staging-lead-canary.mjs`
- Modify: `tests/unit/scripts/staging-lead-canary.test.ts`
- Modify: `docs/guides/STAGING-LEAD-CANARY.md`

- [ ] **Step 1: Write failing report-boundary test**

In `tests/unit/scripts/staging-lead-canary.test.ts`, update the `"builds stable report"` expectation to include `proofBoundary`.

Replace the final `toEqual` object in that test with:

```ts
    ).toEqual({
      tool: "staging-lead-canary",
      checkedAt: "2026-05-01T00:00:00.000Z",
      baseUrl: "https://example-preview.vercel.app",
      mode: "dry-run",
      reference: "pr-123",
      status: "skipped",
      ok: true,
      reason: "dry run",
      responseStatus: null,
      responseBodySnippet: "",
      proofBoundary:
        "staging-non-production; not production deployed lead proof",
    });
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/staging-lead-canary.test.ts
```

Expected: FAIL because `proofBoundary` is missing from `buildLeadCanaryReport()`.

- [ ] **Step 3: Implement report boundary field**

In `scripts/deploy/staging-lead-canary.mjs`, add near the constants:

```js
const PROOF_BOUNDARY =
  "staging-non-production; not production deployed lead proof";
```

Update `buildLeadCanaryReport(input)` to return:

```js
export function buildLeadCanaryReport(input) {
  return {
    tool: "staging-lead-canary",
    checkedAt: input.checkedAt,
    baseUrl: input.baseUrl,
    mode: input.mode,
    reference: input.reference,
    status: input.status,
    ok: input.ok,
    reason: input.reason,
    responseStatus: input.responseStatus,
    responseBodySnippet: input.responseBodySnippet,
    proofBoundary: PROOF_BOUNDARY,
  };
}
```

- [ ] **Step 4: Update docs**

In `docs/guides/STAGING-LEAD-CANARY.md`, under `## Report`, update the field list to include:

```md
- `proofBoundary`: always `staging-non-production; not production deployed lead proof`
```

Add this sentence after the list:

```md
Any report without this boundary field must be treated as incomplete proof evidence.
```

- [ ] **Step 5: Run targeted canary proof**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/staging-lead-canary.test.ts
pnpm proof:lead-canary:staging -- --mode dry-run
```

Expected: both commands exit 0. The generated report contains `proofBoundary`.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add scripts/deploy/staging-lead-canary.mjs tests/unit/scripts/staging-lead-canary.test.ts docs/guides/STAGING-LEAD-CANARY.md
git commit -m "docs(proof): mark staging lead canary boundary"
```

Do not commit `reports/deploy/staging-lead-canary.json`; `reports/` is an ignored diagnostic-output directory. The generated report is runtime proof for the local session, not a source artifact.

---

## Task 4: Add product catalog/spec parity helper

**Files:**
- Create: `src/constants/product-specs/market-spec-parity.ts`
- Create: `src/constants/product-specs/__tests__/market-spec-parity.test.ts`
- Modify: `src/constants/product-specs/__tests__/market-spec-registry.test.ts`

- [ ] **Step 1: Write failing parity helper tests**

Create `src/constants/product-specs/__tests__/market-spec-parity.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  assertMarketSpecParity,
  createMarketSpecParityReport,
  formatMarketSpecParityError,
} from "../market-spec-parity";

describe("market spec parity", () => {
  it("reports no live parity drift", () => {
    expect(createMarketSpecParityReport()).toEqual({
      missingSpecFamilies: [],
      orphanSpecFamilies: [],
    });
    expect(() => assertMarketSpecParity()).not.toThrow();
  });

  it("names missing spec families clearly", () => {
    const report = createMarketSpecParityReport({
      catalogFamiliesByMarket: {
        "north-america": ["couplings", "missing-family"],
      },
      specFamiliesByMarket: {
        "north-america": ["couplings"],
      },
    });

    expect(report.missingSpecFamilies).toEqual([
      { marketSlug: "north-america", familySlug: "missing-family" },
    ]);
    expect(formatMarketSpecParityError(report)).toContain(
      "missing spec: north-america/missing-family",
    );
  });

  it("names orphan spec families clearly", () => {
    const report = createMarketSpecParityReport({
      catalogFamiliesByMarket: {
        europe: ["couplings"],
      },
      specFamiliesByMarket: {
        europe: ["couplings", "orphan-family"],
      },
    });

    expect(report.orphanSpecFamilies).toEqual([
      { marketSlug: "europe", familySlug: "orphan-family" },
    ]);
    expect(formatMarketSpecParityError(report)).toContain(
      "orphan spec: europe/orphan-family",
    );
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run src/constants/product-specs/__tests__/market-spec-parity.test.ts
```

Expected: FAIL because `../market-spec-parity` does not exist.

- [ ] **Step 3: Implement parity helper**

Create `src/constants/product-specs/market-spec-parity.ts`:

```ts
import {
  getAllMarketSlugs,
  getFamiliesForMarket,
} from "@/constants/product-catalog";
import {
  getMarketSpecEntries,
  getMarketSpecsBySlug,
} from "@/constants/product-specs/market-spec-registry";

export interface MarketFamilyParityIssue {
  marketSlug: string;
  familySlug: string;
}

export interface MarketSpecParityReport {
  missingSpecFamilies: MarketFamilyParityIssue[];
  orphanSpecFamilies: MarketFamilyParityIssue[];
}

export interface MarketSpecParityInput {
  catalogFamiliesByMarket: Record<string, readonly string[]>;
  specFamiliesByMarket: Record<string, readonly string[]>;
}

function uniqueSorted(values: readonly string[]): string[] {
  return Array.from(new Set(values)).sort();
}

function createLiveParityInput(): MarketSpecParityInput {
  const catalogFamiliesByMarket = Object.fromEntries(
    getAllMarketSlugs().map((marketSlug) => [
      marketSlug,
      uniqueSorted(getFamiliesForMarket(marketSlug).map((family) => family.slug)),
    ]),
  );

  const specFamiliesByMarket = Object.fromEntries(
    getMarketSpecEntries().map(([marketSlug, specs]) => [
      marketSlug,
      uniqueSorted(specs.families.map((family) => family.slug)),
    ]),
  );

  return { catalogFamiliesByMarket, specFamiliesByMarket };
}

export function createMarketSpecParityReport(
  input: MarketSpecParityInput = createLiveParityInput(),
): MarketSpecParityReport {
  const marketSlugs = uniqueSorted([
    ...Object.keys(input.catalogFamiliesByMarket),
    ...Object.keys(input.specFamiliesByMarket),
  ]);
  const missingSpecFamilies: MarketFamilyParityIssue[] = [];
  const orphanSpecFamilies: MarketFamilyParityIssue[] = [];

  for (const marketSlug of marketSlugs) {
    const catalogFamilies = new Set(
      input.catalogFamiliesByMarket[marketSlug] ?? [],
    );
    const specFamilies = new Set(input.specFamiliesByMarket[marketSlug] ?? []);

    for (const familySlug of catalogFamilies) {
      if (!specFamilies.has(familySlug)) {
        missingSpecFamilies.push({ marketSlug, familySlug });
      }
    }

    for (const familySlug of specFamilies) {
      if (!catalogFamilies.has(familySlug)) {
        orphanSpecFamilies.push({ marketSlug, familySlug });
      }
    }
  }

  return { missingSpecFamilies, orphanSpecFamilies };
}

export function formatMarketSpecParityError(
  report: MarketSpecParityReport,
): string {
  const lines = [
    ...report.missingSpecFamilies.map(
      (issue) => `missing spec: ${issue.marketSlug}/${issue.familySlug}`,
    ),
    ...report.orphanSpecFamilies.map(
      (issue) => `orphan spec: ${issue.marketSlug}/${issue.familySlug}`,
    ),
  ];

  return lines.join("\n");
}

export function assertMarketSpecParity(): void {
  const report = createMarketSpecParityReport();
  if (
    report.missingSpecFamilies.length > 0 ||
    report.orphanSpecFamilies.length > 0
  ) {
    throw new Error(formatMarketSpecParityError(report));
  }

  for (const marketSlug of getAllMarketSlugs()) {
    const specs = getMarketSpecsBySlug(marketSlug);
    if (!specs) {
      throw new Error(`missing market specs: ${marketSlug}`);
    }
  }
}
```

- [ ] **Step 4: Wire existing registry test to helper**

In `src/constants/product-specs/__tests__/market-spec-registry.test.ts`, add import:

```ts
import { assertMarketSpecParity } from "@/constants/product-specs/market-spec-parity";
```

Replace the current `keeps catalog family slugs aligned with market spec families per market` test body with:

```ts
    expect(() => assertMarketSpecParity()).not.toThrow();
```

- [ ] **Step 5: Run targeted product-spec tests**

Run:

```bash
pnpm exec vitest run src/constants/product-specs/__tests__/market-spec-parity.test.ts src/constants/product-specs/__tests__/market-spec-registry.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 4**

Run:

```bash
git add src/constants/product-specs/market-spec-parity.ts src/constants/product-specs/__tests__/market-spec-parity.test.ts src/constants/product-specs/__tests__/market-spec-registry.test.ts
git commit -m "test(product): guard market spec parity"
```

---

## Task 5: Make product sitemap freshness source explicit and required

**Files:**
- Modify: `src/config/single-site-seo.ts`
- Modify: `src/config/__tests__/single-site-seo.test.ts`

- [ ] **Step 1: Write failing source-contract assertions**

In `src/config/__tests__/single-site-seo.test.ts`, update the import from `@/config/single-site-seo` to include:

```ts
  SINGLE_SITE_PRODUCT_MARKET_LASTMOD_SOURCE,
```

Add this test:

```ts
  it("declares product market sitemap freshness as market specs updatedAt", () => {
    expect(SINGLE_SITE_PRODUCT_MARKET_LASTMOD_SOURCE).toBe(
      "market-specs.updatedAt",
    );

    for (const marketSlug of getAllMarketSlugs()) {
      const specs = getMarketSpecsBySlug(marketSlug);

      expect(specs?.updatedAt, `${marketSlug} updatedAt`).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
      );
      expect(
        SINGLE_SITE_STATIC_PAGE_LASTMOD[getProductMarketPath(marketSlug)],
        `${marketSlug} lastmod`,
      ).toBe(specs?.updatedAt);
    }
  });
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run src/config/__tests__/single-site-seo.test.ts
```

Expected: FAIL because `SINGLE_SITE_PRODUCT_MARKET_LASTMOD_SOURCE` is not exported.

- [ ] **Step 3: Implement explicit source and required market updatedAt**

In `src/config/single-site-seo.ts`, add after `SINGLE_SITE_STATIC_LASTMOD_ISO`:

```ts
export const SINGLE_SITE_PRODUCT_MARKET_LASTMOD_SOURCE =
  "market-specs.updatedAt" as const;
```

Replace `SINGLE_SITE_PRODUCT_MARKET_LASTMOD` with:

```ts
function getRequiredProductMarketUpdatedAt(marketSlug: string): string {
  const updatedAt = getMarketSpecsBySlug(marketSlug)?.updatedAt;
  if (!updatedAt) {
    throw new Error(`Missing product market sitemap updatedAt: ${marketSlug}`);
  }

  const timestamp = new Date(updatedAt).getTime();
  if (Number.isNaN(timestamp)) {
    throw new Error(`Invalid product market sitemap updatedAt: ${marketSlug}`);
  }

  return updatedAt;
}

const SINGLE_SITE_PRODUCT_MARKET_LASTMOD: Record<string, string> =
  Object.fromEntries(
    getAllMarketSlugs().map((marketSlug) => [
      getProductMarketPath(marketSlug),
      getRequiredProductMarketUpdatedAt(marketSlug),
    ]),
  );
```

- [ ] **Step 4: Run targeted sitemap tests**

Run:

```bash
pnpm exec vitest run src/config/__tests__/single-site-seo.test.ts src/lib/__tests__/sitemap-utils.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 5**

Run:

```bash
git add src/config/single-site-seo.ts src/config/__tests__/single-site-seo.test.ts
git commit -m "fix(seo): require product sitemap freshness source"
```

---

## Task 6: Add local Cloudflare preview diagnostic artifact script

**Files:**
- Create: `scripts/cloudflare/preview-smoke-diagnostics.mjs`
- Create: `tests/unit/scripts/preview-smoke-diagnostics.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write failing diagnostics tests**

Create `tests/unit/scripts/preview-smoke-diagnostics.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  buildPreviewDiagnosticReport,
  classifyPreviewDiagnosticReport,
  createBodySnippet,
} from "../../../scripts/cloudflare/preview-smoke-diagnostics.mjs";

describe("preview-smoke-diagnostics", () => {
  it("truncates route body snippets", () => {
    expect(createBodySnippet("x".repeat(620))).toHaveLength(500);
  });

  it("classifies a clean report as passing", () => {
    const report = buildPreviewDiagnosticReport({
      baseUrl: "http://127.0.0.1:8787",
      checkedAt: "2026-05-04T00:00:00.000Z",
      routes: [
        {
          pathname: "/en",
          status: 200,
          ok: true,
          durationMs: 10,
          bodySnippet: "<html>",
        },
      ],
    });

    expect(classifyPreviewDiagnosticReport(report)).toEqual({
      ok: true,
      failedRoutes: [],
    });
  });

  it("classifies 500 and worker-hung body as failed route evidence", () => {
    const report = buildPreviewDiagnosticReport({
      baseUrl: "http://127.0.0.1:8787",
      checkedAt: "2026-05-04T00:00:00.000Z",
      routes: [
        {
          pathname: "/en",
          status: 500,
          ok: false,
          durationMs: 10,
          bodySnippet:
            "The Workers runtime canceled this request because it detected that your Worker's code had hung",
        },
      ],
    });

    expect(classifyPreviewDiagnosticReport(report)).toEqual({
      ok: false,
      failedRoutes: ["/en"],
    });
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/preview-smoke-diagnostics.test.ts
```

Expected: FAIL because `scripts/cloudflare/preview-smoke-diagnostics.mjs` does not exist.

- [ ] **Step 3: Implement diagnostics script**

Create `scripts/cloudflare/preview-smoke-diagnostics.mjs`:

```js
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import runtimeEnv from "../lib/runtime-env.js";

const DEFAULT_BASE_URL =
  runtimeEnv.readEnvString("CLOUDFLARE_PREVIEW_BASE_URL") ||
  "http://127.0.0.1:8787";
const DEFAULT_OUTPUT = "reports/cloudflare-preview/preview-smoke-diagnostics.json";
const BODY_SNIPPET_LENGTH = 500;
const ROUTES = ["/", "/en", "/zh", "/en/contact", "/zh/contact", "/api/health"];

export function createBodySnippet(bodyText) {
  return bodyText.slice(0, BODY_SNIPPET_LENGTH);
}

export function buildPreviewDiagnosticReport(input) {
  return {
    tool: "preview-smoke-diagnostics",
    checkedAt: input.checkedAt,
    baseUrl: input.baseUrl,
    routes: input.routes,
  };
}

export function classifyPreviewDiagnosticReport(report) {
  const failedRoutes = report.routes
    .filter((route) => !route.ok)
    .map((route) => route.pathname);

  return {
    ok: failedRoutes.length === 0,
    failedRoutes,
  };
}

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    output: DEFAULT_OUTPUT,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--") {
      continue;
    }
    if (arg === "--base-url" && index + 1 < argv.length) {
      args.baseUrl = argv[++index];
      continue;
    }
    if (arg === "--output" && index + 1 < argv.length) {
      args.output = argv[++index];
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function probeRoute(baseUrl, pathname) {
  const startedAt = performance.now();
  try {
    const response = await fetch(new URL(pathname, baseUrl), {
      redirect: "manual",
      headers: {
        "user-agent": "cloudflare-preview-diagnostics",
      },
      signal: AbortSignal.timeout(30000),
    });
    const bodyText = await response.text();
    const durationMs = Math.round(performance.now() - startedAt);

    return {
      pathname,
      status: response.status,
      ok: response.status >= 200 && response.status < 500,
      durationMs,
      bodySnippet: createBodySnippet(bodyText),
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    return {
      pathname,
      status: null,
      ok: false,
      durationMs,
      bodySnippet: error instanceof Error ? error.message : String(error),
    };
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const args = parseArgs(process.argv);
  const routes = [];

  for (const pathname of ROUTES) {
    routes.push(await probeRoute(args.baseUrl, pathname));
  }

  const report = buildPreviewDiagnosticReport({
    checkedAt: new Date().toISOString(),
    baseUrl: args.baseUrl,
    routes,
  });
  await writeJson(args.output, report);

  const classification = classifyPreviewDiagnosticReport(report);
  if (!classification.ok) {
    console.error(
      `[preview-smoke-diagnostics] failed routes: ${classification.failedRoutes.join(", ")}`,
    );
    process.exit(1);
  }

  console.log("[preview-smoke-diagnostics] all routes returned <500");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error("[preview-smoke-diagnostics] unexpected error:", error);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Add package script**

In `package.json`, add near `smoke:cf:preview`:

```json
"diagnose:cf:preview": "node scripts/cloudflare/preview-smoke-diagnostics.mjs",
```

- [ ] **Step 5: Run diagnostics tests**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/preview-smoke-diagnostics.test.ts
node scripts/cloudflare/preview-smoke-diagnostics.mjs --base-url http://127.0.0.1:1 --output reports/cloudflare-preview/preview-smoke-diagnostics-test.json
```

Expected: Vitest passes. The second command exits non-zero because port `1` is not serving, but it writes a JSON report; verify the report exists:

```bash
test -f reports/cloudflare-preview/preview-smoke-diagnostics-test.json
```

- [ ] **Step 6: Commit Task 6**

Run:

```bash
git add scripts/cloudflare/preview-smoke-diagnostics.mjs tests/unit/scripts/preview-smoke-diagnostics.test.ts package.json
git commit -m "chore(cf): add preview smoke diagnostics"
```

Do not commit `reports/cloudflare-preview/preview-smoke-diagnostics-test.json`; it proves the script writes an artifact, but `reports/` is ignored by design.

---

## Task 7: Reproduce TD-004 with fresh local evidence

**Files:**
- Modify: `docs/technical/technical-debt.md`

- [ ] **Step 1: Build and start local Cloudflare preview serially**

Run in one terminal:

```bash
pnpm preview:cf
```

Expected: preview server starts and keeps running on `http://127.0.0.1:8787`.

- [ ] **Step 2: Run smoke and diagnostics from a second terminal**

Run:

```bash
pnpm smoke:cf:preview
pnpm diagnose:cf:preview
```

Expected:

- If both pass, TD-004 no longer reproduces.
- If either fails, `reports/cloudflare-preview/preview-smoke-diagnostics.json` records exact route evidence.

- [ ] **Step 3: Stop the preview server**

Stop the `pnpm preview:cf` terminal with `Ctrl+C`.

- [ ] **Step 4: Update TD-004 with the fresh result**

In `docs/technical/technical-debt.md`, under TD-004, add this subsection:

```md
### 2026-05-04 fresh diagnostic lane

Use this local-only diagnostic command while `pnpm preview:cf` is running:

```bash
pnpm diagnose:cf:preview
```

It writes:

```text
reports/cloudflare-preview/preview-smoke-diagnostics.json
```

This artifact records route status, request duration, and a bounded response-body
snippet for `/`, `/en`, `/zh`, `/en/contact`, `/zh/contact`, and `/api/health`.
It is diagnostic evidence only. It does not mutate Cloudflare state and does not
replace deployed preview smoke when a real deployed preview URL exists.
```

If the fresh reproduction still fails, append:

```md
Fresh status on 2026-05-04: still reproduces locally. Keep TD-004 open and use
the diagnostic artifact to separate route/runtime failure from smoke-script
assertion failure.
```

If it no longer reproduces, append:

```md
Fresh status on 2026-05-04: no longer reproduced in local preview. Keep the
diagnostic command available for future regressions and close TD-004 only after
the result is repeated on a clean branch.
```

- [ ] **Step 5: Commit Task 7**

Run:

```bash
git add docs/technical/technical-debt.md
git commit -m "docs(cf): record preview smoke diagnostic lane"
```

Do not commit `reports/cloudflare-preview/preview-smoke-diagnostics.json`; summarize its decisive route/status evidence in `docs/technical/technical-debt.md` instead.

---

## Task 8: Add CSP paid-traffic decision memo

**Files:**
- Create: `docs/technical/csp-paid-traffic-decision.md`
- Modify: `tests/unit/scripts/proof-lane-contract.test.ts`

- [ ] **Step 1: Add failing source-contract test**

In `tests/unit/scripts/proof-lane-contract.test.ts`, add this test inside `describe("proof lane contract", () => { ... })`:

```ts
  it("keeps CSP paid-traffic decision memo explicit about no immediate rewrite", () => {
    const cspMemo = readRepoFile("docs/technical/csp-paid-traffic-decision.md");

    expect(cspMemo).toContain("No immediate CSP policy rewrite");
    expect(cspMemo).toContain("script-src-elem 'unsafe-inline'");
    expect(cspMemo).toContain("pnpm security:csp:check");
    expect(cspMemo).toContain("paid traffic");
    expect(cspMemo).toContain("Cache Components");
  });
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/proof-lane-contract.test.ts
```

Expected: FAIL because `docs/technical/csp-paid-traffic-decision.md` does not exist.

- [ ] **Step 3: Create the memo**

Create `docs/technical/csp-paid-traffic-decision.md`:

```md
# CSP Paid-Traffic Decision Memo

**Status:** No immediate CSP policy rewrite
**Decision trigger:** Before scaling paid traffic

## Current policy

`script-src` stays nonce-scoped and must not include `'unsafe-inline'`.
`script-src-elem` explicitly includes `'unsafe-inline'` because the current
Next.js App Router + Cache Components output can include framework inline script
elements that do not reliably receive a request nonce.

## Why not rewrite now

The site is not formally launching paid traffic now. A broad CSP rewrite would
risk breaking hydration or static rendering while solving a risk that is already
partly mitigated by the current site shape:

- no user-generated HTML surface;
- lead inputs are processed server-side;
- CSP reports are routed through `/api/csp-report`;
- `pnpm security:csp:check` verifies the runtime script shape.

## Options before paid traffic

1. Keep the current trade-off and monitor CSP reports.
2. Restrict the exception if Next.js provides a route-level static/dynamic CSP
   path that keeps Cache Components intact.
3. Move affected routes to dynamic rendering with nonce coverage after measuring
   performance and SEO impact.

## Required proof before any future change

Run these commands serially:

```bash
pnpm clean:next-artifacts
pnpm build
pnpm security:csp:check
pnpm test:release-smoke
```

If the change touches Cloudflare behavior, add:

```bash
pnpm build:cf
pnpm smoke:cf:preview
```

Any future PR that removes `script-src-elem 'unsafe-inline'` must prove that
runtime HTML no longer contains unnonced executable inline script elements, or
that those elements receive a CSP nonce.
```

- [ ] **Step 4: Run memo contract and CSP checker**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/proof-lane-contract.test.ts
```

Expected: PASS.

Always rebuild before the CSP check in this task so the memo is verified against fresh local output:

```bash
pnpm clean:next-artifacts && pnpm build
pnpm security:csp:check
```

Expected: PASS.

- [ ] **Step 5: Commit Task 8**

Run:

```bash
git add docs/technical/csp-paid-traffic-decision.md tests/unit/scripts/proof-lane-contract.test.ts
git commit -m "docs(security): add csp paid traffic decision memo"
```

---

## Task 9: Run wave-level verification

**Files:**
- No source changes unless verification exposes a concrete issue.

- [ ] **Step 1: Run Wave A verification**

Run:

```bash
pnpm exec vitest run src/lib/lead-pipeline/__tests__/partial-success-recovery.test.ts src/lib/lead-pipeline/__tests__/process-lead-observability.test.ts tests/unit/scripts/staging-lead-canary.test.ts
pnpm review:lead-family
```

Expected: PASS.

- [ ] **Step 2: Run Wave B verification**

Run:

```bash
pnpm exec vitest run src/constants/product-specs/__tests__/market-spec-parity.test.ts src/constants/product-specs/__tests__/market-spec-registry.test.ts src/config/__tests__/single-site-seo.test.ts src/lib/__tests__/sitemap-utils.test.ts
```

Expected: PASS.

- [ ] **Step 3: Run Wave C verification**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/preview-smoke-diagnostics.test.ts tests/unit/scripts/proof-lane-contract.test.ts
```

Expected: PASS.

Run CSP check with a fresh build:

```bash
pnpm clean:next-artifacts && pnpm build
pnpm security:csp:check
```

Expected: PASS.

- [ ] **Step 4: Run static checks**

Run:

```bash
pnpm type-check
pnpm lint:check
pnpm format:check
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 5: Commit any verification-driven doc updates**

If Task 9 changed documentation, commit only source documentation:

```bash
git add docs
git commit -m "docs: record technical debt wave verification"
```

If Task 9 produced only files under `reports/`, do not commit them. If Task 9 produced no source file changes, skip this commit.

---

## Task 10: Final read-only adversarial review

**Files:**
- No edits during this task.

- [ ] **Step 1: Review the full branch diff**

Run:

```bash
git diff --stat main...HEAD
git diff --name-status main...HEAD
git diff --check
```

Expected:

- only Wave A/B/C files are present;
- no production deploy config was changed;
- no business asset placeholders were replaced;
- no whitespace errors.

- [ ] **Step 2: Check production-safety boundaries**

Run:

```bash
git diff main...HEAD -- package.json docs scripts src tests | rg -n "deploy:cf:phase6:production|production lead|wrangler delete|deleted_classes|Durable Object|script-src-elem|unsafe-inline|tianze-pipe.com"
```

Expected:

- production deploy strings appear only in existing docs or explicit non-goal / refusal contexts;
- `script-src-elem 'unsafe-inline'` remains documented as current policy;
- no destructive Cloudflare cleanup path is introduced.

- [ ] **Step 3: Check proof overclaiming**

Run:

```bash
rg -n "end-to-end lead proof|production proof|release-proven|everything works|deployed lead" docs scripts tests src
```

Expected:

- staging canary is not described as production proof;
- local Cloudflare diagnostics are described as diagnostic/local proof only;
- CSP memo does not claim the policy is fully resolved.

- [ ] **Step 4: Record final local status**

Run:

```bash
git status --short --branch
git log --oneline main..HEAD
```

Expected:

- worktree is clean;
- commits are task-scoped and readable.

---

## Task 11: Finish branch

**Files:**
- No source changes in this task.

- [ ] **Step 1: Invoke finishing workflow**

Use `superpowers:verification-before-completion`, then `superpowers:finishing-a-development-branch`.

- [ ] **Step 2: Present integration options**

Because this branch was created in an isolated worktree, use the standard branch finish options:

```text
1. Push and create a Pull Request
2. Keep the branch as-is
3. Discard this work
```

Do not merge directly unless the user explicitly requests local merge.

---

## Self-review checklist

- Spec coverage:
  - Wave A partial-success recovery: Tasks 1-2.
  - Wave A staging canary boundary: Task 3.
  - Wave B product/spec parity: Task 4.
  - Wave B sitemap freshness: Task 5.
  - Wave C TD-004 diagnostics: Tasks 6-7.
  - Wave C CSP decision prep: Task 8.
  - Final verification and adversarial review: Tasks 9-10.
- Placeholder scan: no deferred implementation placeholders are used.
- Production safety: no production deploy, production canary, or destructive Cloudflare cleanup commands are part of implementation.
- Type consistency:
  - `recordPartialSuccessRecovery()` accepts `lead`, `referenceId`, `emailSent`, `recordCreated`, and optional `requestId`.
  - staging canary report field is `proofBoundary`.
  - product parity report fields are `missingSpecFamilies` and `orphanSpecFamilies`.
  - CSP memo path is `docs/technical/csp-paid-traffic-decision.md`.
