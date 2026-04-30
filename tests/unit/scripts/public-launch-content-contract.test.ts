import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../../..");
const LIVE_TEXT_PATHS = [
  "content/pages/en/terms.mdx",
  "content/pages/zh/terms.mdx",
  "messages/en.json",
  "messages/zh.json",
  "messages/en/critical.json",
  "messages/zh/critical.json",
  "messages/en/deferred.json",
  "messages/zh/deferred.json",
] as const;

function readRepoFile(relativePath: string): string {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed repo-owned contract fixtures
  return fs.readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

describe("public launch content contract", () => {
  it("keeps fake phone numbers out of buyer-facing text sources", () => {
    for (const relativePath of LIVE_TEXT_PATHS) {
      const source = readRepoFile(relativePath);

      expect(source, relativePath).not.toContain("+86-518-0000-0000");
      expect(source, relativePath).not.toContain("0000-0000");
    }
  });
});
