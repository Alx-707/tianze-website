# AI Smell Proof Health Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 2026-05-03 `ai-smell-audit full` 中 proof health 相关的可工程落地问题，让测试名、CI 名、Knip 输出和 proof 文档都不再夸大证明范围。

**Architecture:** 采用 proof-contract-first 的小修法：先用 `tests/unit/scripts/proof-lane-contract.test.ts` 锁住不应回退的 proof 口径，再做最小代码/文档改动。业务素材与旧兼容入口不在本轮处理。

**Tech Stack:** Next.js 16.2.4, Playwright 1.59.1, Vitest 4.1.5, Knip 6.7.0, GitHub Actions, Markdown proof docs.

---

## File Map

- Modify: `tests/unit/scripts/proof-lane-contract.test.ts`
  - 增加 source-contract，防止 Playwright config / global setup 再用外部 loader 不能解析的 `@/` alias。
  - 增加 source-contract，防止 local contact E2E 标题继续声称“成功提交表单”。
  - 增加 source-contract，防止 CI lead-family step 退回过强命名。
  - 增加 source-contract，锁住 `pnpm test:e2e` 的 local/test-mode proof boundary。
- Modify: `playwright.config.ts`
  - 把 `@/test/e2e-target` 改成外部 Node loader 可解析的相对导入。
- Modify: `tests/e2e/global-setup.ts`
  - 把 `@/test/e2e-target` 改成 Playwright runner 可直接解析的相对导入。
- Modify: `tests/e2e/contact-form-smoke.spec.ts`
  - 改第 9 组分组名和两个 test-mode 用例标题，使其描述真实行为。
- Modify: `.github/workflows/ci.yml`
  - 改 lead-family step 名称。
- Modify: `docs/guides/PROOF-BOUNDARY-MAP.md`
  - 补 `pnpm test:e2e` 和 `pnpm review:lead-family` proof boundary。

## Task 1: Add proof-lane regression contracts

**Files:**
- Modify: `tests/unit/scripts/proof-lane-contract.test.ts`

- [ ] **Step 1: Add failing source-contract tests**

Append these tests inside the existing `describe("proof lane contract", () => { ... })` block, before the final mutation script test:

```typescript
  it("keeps Playwright config loadable by external proof tools", () => {
    const playwrightConfig = readRepoFile("playwright.config.ts");
    const globalSetup = readRepoFile("tests/e2e/global-setup.ts");

    expect(playwrightConfig).not.toMatch(/from\s+['"]@\//);
    expect(globalSetup).not.toMatch(/from\s+['"]@\//);
  });

  it("keeps local contact E2E titles scoped to test-mode behavior", () => {
    const contactSmoke = readRepoFile("tests/e2e/contact-form-smoke.spec.ts");

    expect(contactSmoke).toContain("Contact Form Smoke Tests - Test Mode");
    expect(contactSmoke).toContain('test.describe("Contact Form - Test-Mode Smoke"');
    expect(contactSmoke).not.toContain("表单提交验证");
    expect(contactSmoke).toContain("提交前就绪验证");
    expect(contactSmoke).not.toContain("应该能够成功提交表单");
    expect(contactSmoke).toContain("完整填写英文表单后提交按钮可见");
    expect(contactSmoke).toContain("完整填写中文表单后提交按钮可见");
  });

  it("labels lead-family CI proof as local rather than deployed proof", () => {
    const ciWorkflow = readRepoFile(".github/workflows/ci.yml");
    const proofBoundaryMap = readRepoFile("docs/guides/PROOF-BOUNDARY-MAP.md");

    expect(ciWorkflow).toContain("Lead API Local Contract/Protection Review");
    expect(ciWorkflow).not.toContain("Lead API Family Contract Review");
    expect(proofBoundaryMap).toContain("pnpm review:lead-family");
    expect(proofBoundaryMap).toContain("local contract/protection");
    expect(proofBoundaryMap).toContain("deployed lead submission");
  });

  it("documents local E2E as test-mode proof, not deployed lead proof", () => {
    const proofBoundaryMap = readRepoFile("docs/guides/PROOF-BOUNDARY-MAP.md");

    expect(proofBoundaryMap).toContain("pnpm test:e2e");
    expect(proofBoundaryMap).toContain("local/test-mode");
    expect(proofBoundaryMap).toContain("production Turnstile");
    expect(proofBoundaryMap).toContain("Airtable/Resend");
    expect(proofBoundaryMap).toContain("production buyer inquiry success");
  });
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/proof-lane-contract.test.ts
```

Expected:

- FAIL before implementation.
- Failures should mention at least the old Playwright alias, old contact E2E title, or old CI step name.

Do not edit implementation files until this RED result is observed.

## Task 2: Fix Knip / Playwright config loading

**Files:**
- Modify: `playwright.config.ts`
- Modify: `tests/e2e/global-setup.ts`

- [ ] **Step 1: Replace the root config alias import**

Use an alias-free relative import from the root Playwright config:

```typescript
import {
  isLocalE2ETarget,
  normalizeE2ETarget,
  selectExplicitE2ETarget,
} from "./src/test/e2e-target";
```

Rationale: this root config is loaded by Playwright and Knip through external Node loaders. Those loaders do not reliably apply the repo's `@/` TypeScript path alias.

- [ ] **Step 2: Replace the global setup alias import**

Use an alias-free relative import from the E2E global setup:

```typescript
import {
  isLocalE2ETarget,
  selectExplicitE2ETarget,
} from "../../src/test/e2e-target";
```

Rationale: `globalSetup` is loaded by the Playwright runner during real E2E execution, so it needs the same alias-free import boundary as the root config.

- [ ] **Step 3: Verify GREEN for the source-contract slice**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/proof-lane-contract.test.ts
```

Expected:

- The Playwright config contract should pass.
- Other newly added contracts may still fail until later tasks.

- [ ] **Step 4: Verify the original Knip symptom is gone**

Run:

```bash
pnpm unused:check
```

Expected:

- Exit code 0.
- Output does not contain `Error loading playwright.config.ts`.
- Output does not contain any loader-class error.
- If loader errors disappear but Knip reports real unused files/dependencies, stop and record them as a new finding instead of expanding this proof-health repair scope.

## Task 3: Fix local contact E2E proof wording

**Files:**
- Modify: `tests/e2e/contact-form-smoke.spec.ts`

- [ ] **Step 1: Rename the local smoke group**

Use the narrower group title:

```typescript
  test.describe("9. 提交前就绪验证", () => {
```

- [ ] **Step 2: Rename the English local smoke test**

Use the narrower English test title:

```typescript
    test("完整填写英文表单后提交按钮可见", async ({ page }) => {
```

- [ ] **Step 3: Rename the Chinese local smoke test**

Use the narrower Chinese test title:

```typescript
    test("完整填写中文表单后提交按钮可见", async ({ page }) => {
```

- [ ] **Step 4: Verify the proof-lane contract**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/proof-lane-contract.test.ts
```

Expected:

- The local contact E2E title contract should pass.
- Lead-family CI proof contract may still fail until Task 4.

## Task 4: Fix lead-family CI and proof boundary wording

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `docs/guides/PROOF-BOUNDARY-MAP.md`

- [ ] **Step 1: Rename the CI step**

In `.github/workflows/ci.yml`, change:

```yaml
      - name: Lead API Family Contract Review
        run: pnpm review:lead-family
```

To:

```yaml
      - name: Lead API Local Contract/Protection Review
        run: pnpm review:lead-family
```

- [ ] **Step 2: Add proof boundary rows**

In `docs/guides/PROOF-BOUNDARY-MAP.md`, under `## Local proof on a developer machine`, add rows for:

```markdown
| `pnpm test:e2e` | Playwright local/test-mode browser checks pass against the configured local or explicit target. In the default local path this proves page structure, routing, and smoke-level interactions under test-mode settings. | Deployed site health, production Turnstile behavior, real Airtable/Resend side effects, or production buyer inquiry success. |
| `pnpm review:lead-family` | Lead-family local contract/protection tests pass for response shape, validation/protection behavior, and route-level replay coverage encoded in the local suites. | A deployed lead submission, real external service delivery, production credentials, or a full end-to-end buyer inquiry canary. |
```

- [ ] **Step 3: Verify the proof-lane contract**

Run:

```bash
pnpm exec vitest run tests/unit/scripts/proof-lane-contract.test.ts
```

Expected:

- All proof-lane contract tests pass.

## Task 5: Final targeted verification

**Files:**
- No new edits unless a verification failure points to this task's own changes.

- [ ] **Step 1: Run unused-code proof**

Run:

```bash
pnpm unused:check
```

Expected:

- Exit code 0.
- No `Error loading playwright.config.ts`.
- No loader-class error.
- If real unused findings appear after loader repair, record them and stop expanding scope.

- [ ] **Step 2: Run test type-check**

Run:

```bash
pnpm type-check:tests
```

Expected:

- Exit code 0.

- [ ] **Step 3: Run lint if touched files require formatting/lint confidence**

Run:

```bash
pnpm lint:check
```

Expected:

- Exit code 0.
- Zero warnings.

- [ ] **Step 4: Inspect final diff**

Run:

```bash
git diff -- tests/unit/scripts/proof-lane-contract.test.ts playwright.config.ts tests/e2e/global-setup.ts tests/e2e/contact-form-smoke.spec.ts .github/workflows/ci.yml docs/guides/PROOF-BOUNDARY-MAP.md
git status --short
```

Expected:

- Diff only contains the proof-health repair scope.
- No generated artifacts or unrelated file changes are staged.

## Self-Review Checklist

- Spec coverage: Tasks 1-5 cover `F-S30-001`, `F-S28-001`, `F-S25-001`, and `F-S27-001`.
- Non-goals preserved: no business asset fabrication, no `src/app/actions.ts` deletion, no deploy, no production external service write.
- False proof control: local E2E remains documented as test-mode; deployed lead proof remains assigned to post-deploy canary.
- Stop line: if `pnpm unused:check` still prints any Playwright config loader error after Task 2, stop and re-run root-cause investigation before trying additional fixes.
- Stop line: if `pnpm unused:check` starts reporting real unused files/dependencies after loader repair, record a new finding and do not clean unrelated unused code in this plan.
