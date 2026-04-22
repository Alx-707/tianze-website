import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  CHECKS,
  collectCurrentTruthDocFindings,
} from "../../../scripts/check-current-truth-docs.js";

function createTempRepo(files: Record<string, string>) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "current-truth-docs-"));

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = path.join(tempDir, relativePath);
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test fixture path is created inside the mkdtemp sandbox
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- test fixture path is created inside the mkdtemp sandbox
    fs.writeFileSync(fullPath, content);
  }

  return tempDir;
}

function createValidFiles() {
  const files: Record<string, string> = {};

  for (const check of CHECKS) {
    files[check.file] = [...(check.required ?? []), "safe baseline text"].join(
      "\n",
    );
  }

  return files;
}

describe("current-truth docs guard", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("passes when required current-truth markers are present", () => {
    const repoDir = createTempRepo(createValidFiles());
    tempDirs.push(repoDir);

    expect(collectCurrentTruthDocFindings(repoDir)).toEqual([]);
  });

  it("flags missing required markers and forbidden stale markers", () => {
    const files = createValidFiles();
    files["docs/guides/CANONICAL-TRUTH-REGISTRY.md"] =
      "src/config/single-site-page-expression.ts";
    files["docs/guides/LOCALE-RUNTIME-CONTRACT.md"] =
      "Server runtime may then merge site-specific overlays";

    const repoDir = createTempRepo(files);
    tempDirs.push(repoDir);

    const findings = collectCurrentTruthDocFindings(repoDir);

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: "docs/guides/CANONICAL-TRUTH-REGISTRY.md",
          error:
            'missing current-truth pattern "src/config/single-site-seo.ts"',
        }),
        expect.objectContaining({
          file: "docs/guides/LOCALE-RUNTIME-CONTRACT.md",
          error:
            'forbidden current-truth pattern "Server runtime may then merge site-specific overlays"',
        }),
      ]),
    );
  });
});
