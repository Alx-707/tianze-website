import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../..");

function readRepoFile(relativePath: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- repo contract test reads known files under the local repo root
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

describe("proof lane contract", () => {
  it("keeps the lightweight review lanes wired into ci-local and release proof", () => {
    const packageJson = readRepoFile("package.json");
    const ciLocalScript = readRepoFile("scripts/ci-local.sh");
    const releaseProofScript = readRepoFile("scripts/release-proof.sh");

    expect(packageJson).toContain('"review:docs-truth"');
    expect(packageJson).toContain('"review:cf:official-compare"');
    expect(packageJson).toContain('"review:derivative-readiness"');

    expect(ciLocalScript).toContain("pnpm review:docs-truth");
    expect(ciLocalScript).toContain("pnpm review:derivative-readiness");
    expect(ciLocalScript).toContain("pnpm review:cf:official-compare");
    expect(
      ciLocalScript.indexOf("pnpm review:cf:official-compare"),
    ).toBeLessThan(ciLocalScript.indexOf("# 构建检查"));

    expect(releaseProofScript).toContain("pnpm review:docs-truth");
    expect(releaseProofScript).toContain("pnpm review:cf:official-compare");
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
});
