import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const LEAD_FAMILY_TEST_FILES = [
  "tests/integration/api/lead-family-contract.test.ts",
  "tests/integration/api/lead-family-protection.test.ts",
  "src/app/api/inquiry/__tests__/route.test.ts",
  "tests/integration/api/subscribe.test.ts",
] as const;

function readRepoFile(relativePath: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- test reads fixed repo fixture files by relative path
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

describe("proof lane contract", () => {
  it("keeps the lightweight review lanes wired into ci-local and release proof", () => {
    const packageJson = readRepoFile("package.json");
    const ciLocalScript = readRepoFile("scripts/ci-local.sh");
    const releaseProofScript = readRepoFile("scripts/release-proof.sh");

    expect(packageJson).toContain('"review:docs-truth"');
    expect(packageJson).toContain('"review:cf:official-compare"');
    expect(packageJson).toContain('"review:cf:official-compare:generated"');
    expect(packageJson).toContain('"review:cf:official-compare:source"');
    expect(packageJson).toContain('"review:derivative-readiness"');

    expect(ciLocalScript).toContain("pnpm review:docs-truth");
    expect(ciLocalScript).toContain("pnpm review:derivative-readiness");
    expect(ciLocalScript).toContain("pnpm review:cf:official-compare:source");
    expect(
      ciLocalScript.indexOf("pnpm review:cf:official-compare:source"),
    ).toBeLessThan(ciLocalScript.indexOf("# 构建检查"));

    expect(releaseProofScript).toContain("pnpm review:docs-truth");
    expect(releaseProofScript).toContain(
      "pnpm review:cf:official-compare:source",
    );
    expect(releaseProofScript).toContain(
      "pnpm review:cf:official-compare:generated",
    );
    expect(
      releaseProofScript.indexOf("pnpm review:cf:official-compare:source"),
    ).toBeLessThan(releaseProofScript.indexOf("pnpm deploy:cf:phase6:dry-run"));
    expect(
      releaseProofScript.indexOf("pnpm review:cf:official-compare:generated"),
    ).toBeGreaterThan(
      releaseProofScript.indexOf("pnpm deploy:cf:phase6:dry-run"),
    );
    expect(releaseProofScript).toContain("pnpm review:derivative-readiness");
  });

  it("documents dirty-worktree targeted proof separately from clean-branch full proof", () => {
    const qualityProofLevels = readRepoFile(
      "docs/guides/QUALITY-PROOF-LEVELS.md",
    );
    const releaseProofRunbook = readRepoFile(
      "docs/guides/RELEASE-PROOF-RUNBOOK.md",
    );

    expect(qualityProofLevels).toContain("dirty worktree");
    expect(qualityProofLevels).toContain("targeted proof");
    expect(qualityProofLevels).toContain("clean branch");

    expect(releaseProofRunbook).toContain("dirty worktree");
    expect(releaseProofRunbook).toContain("targeted proof");
    expect(releaseProofRunbook).toContain("clean branch");
    expect(releaseProofRunbook).toContain("ci:local:quick");
  });

  it("keeps the lead-family proof lane aligned with route-level replay coverage", () => {
    const packageJson = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>;
    };
    const leadFamilyScript = packageJson.scripts["test:lead-family"];

    expect(leadFamilyScript).toBeTruthy();
    for (const testFile of LEAD_FAMILY_TEST_FILES) {
      expect(leadFamilyScript).toContain(testFile);
    }
  });

  it("does not imply deployed GET smoke proves real lead submission", () => {
    const releaseProofScript = readRepoFile("scripts/release-proof.sh");
    const releaseProofRunbook = readRepoFile(
      "docs/guides/RELEASE-PROOF-RUNBOOK.md",
    );

    expect(releaseProofScript).toContain("test:e2e:post-deploy");
    expect(releaseProofScript).toContain("Airtable");
    expect(releaseProofScript).toContain("manual launch gate");
    expect(releaseProofRunbook).toContain("test:e2e:post-deploy");
    expect(releaseProofRunbook).toContain("manual launch gate");
  });

  it("keeps Playwright config loadable by external proof tools", () => {
    const playwrightConfig = readRepoFile("playwright.config.ts");
    const globalSetup = readRepoFile("tests/e2e/global-setup.ts");

    expect(playwrightConfig).not.toMatch(/from\s+['"]@\//);
    expect(globalSetup).not.toMatch(/from\s+['"]@\//);
  });

  it("keeps local contact E2E titles scoped to test-mode behavior", () => {
    const contactSmoke = readRepoFile("tests/e2e/contact-form-smoke.spec.ts");

    expect(contactSmoke).toContain("Contact Form Smoke Tests - Test Mode");
    expect(contactSmoke).toContain(
      'test.describe("Contact Form - Test-Mode Smoke"',
    );
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

  it("keeps review:mutation:critical pointed at an existing script", () => {
    const packageJson = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>;
    };
    const command = packageJson.scripts["review:mutation:critical"];

    expect(command).toBe("node scripts/review-mutation-critical.js");
    expect(() =>
      readRepoFile("scripts/review-mutation-critical.js"),
    ).not.toThrow();
  });

  it("keeps CSP paid-traffic decision memo explicit about no immediate rewrite", () => {
    const cspMemo = readRepoFile("docs/technical/csp-paid-traffic-decision.md");

    expect(cspMemo).toContain("No immediate CSP policy rewrite");
    expect(cspMemo).toContain("script-src-elem 'unsafe-inline'");
    expect(cspMemo).toContain("pnpm security:csp:check");
    expect(cspMemo).toContain("paid traffic");
    expect(cspMemo).toContain("Cache Components");
  });
});
