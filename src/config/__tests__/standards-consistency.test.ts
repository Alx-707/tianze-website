/* eslint-disable security/detect-non-literal-fs-filename -- This test intentionally scans fixed project source paths for public wording drift. */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const PRODUCTION_ROOTS = ["messages", "content", "src"] as const;
const SOURCE_EXTENSIONS = new Set([
  ".cjs",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
]);
const NON_PRODUCTION_DIRECTORIES = new Set([
  "__mocks__",
  "__tests__",
  "test",
  "testing",
]);
const NON_PRODUCTION_FILE_PATTERNS = [
  /\.d\.ts$/,
  /\.spec\.[cm]?[jt]sx?$/,
  /\.test\.[cm]?[jt]sx?$/,
];
const BANNED_AU_NZ_STANDARD = ["AS/NZS", "61386"].join(" ");

type SourceFile = {
  absolutePath: string;
  relativePath: string;
};

const isProductionSourcePath = (relativePath: string) => {
  const pathSegments = relativePath.split(path.sep);

  if (pathSegments.some((segment) => NON_PRODUCTION_DIRECTORIES.has(segment))) {
    return false;
  }

  return !NON_PRODUCTION_FILE_PATTERNS.some((pattern) =>
    pattern.test(relativePath),
  );
};

const collectProductionSourceFiles = (directory: string): SourceFile[] => {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    const relativePath = path.relative(process.cwd(), absolutePath);

    if (!isProductionSourcePath(relativePath)) {
      return [];
    }

    if (entry.isDirectory()) {
      return collectProductionSourceFiles(absolutePath);
    }

    if (!entry.isFile() || !SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      return [];
    }

    return [{ absolutePath, relativePath }];
  });
};

const readProjectFile = (relativePath: string) =>
  readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("AS/NZS public standard wording", () => {
  it("does not publish the AU/NZ market under the wrong standard number", () => {
    const offendingFiles = PRODUCTION_ROOTS.flatMap((root) =>
      collectProductionSourceFiles(path.join(process.cwd(), root)),
    )
      .filter(({ absolutePath }) =>
        readFileSync(absolutePath, "utf8").includes(BANNED_AU_NZ_STANDARD),
      )
      .map(({ relativePath }) => relativePath);

    expect(offendingFiles).toEqual([]);
  });

  it("keeps AU/NZ and IEC wording as separate public standards", () => {
    const enCriticalMessages = readProjectFile("messages/en/critical.json");
    const zhCriticalMessages = readProjectFile("messages/zh/critical.json");
    const auNzSpecs = readProjectFile(
      "src/constants/product-specs/australia-new-zealand.ts",
    );
    const europeSpecs = readProjectFile(
      "src/constants/product-specs/europe.ts",
    );

    expect(enCriticalMessages).toContain("AS/NZS 2053");
    expect(enCriticalMessages).toContain("IEC 61386");
    expect(zhCriticalMessages).toContain("AS/NZS 2053");
    expect(zhCriticalMessages).toContain("IEC 61386");
    expect(auNzSpecs).toContain("AS/NZS 2053");
    expect(europeSpecs).toContain("IEC 61386");
  });
});
