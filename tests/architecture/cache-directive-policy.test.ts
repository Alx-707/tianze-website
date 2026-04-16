import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";
import { describe, expect, it } from "vitest";

const CRITICAL_CACHE_POLICY_FILES = [
  "src/app/[locale]/contact/page.tsx",
  "src/lib/actions/contact.ts",
  "src/app/api/contact/route.ts",
  "src/app/api/inquiry/route.ts",
  "src/app/api/subscribe/route.ts",
  "src/app/api/health/route.ts",
] as const;

const BANNED_NEXT_CACHE_IMPORTS = new Set([
  "unstable_cache",
  "cacheLife",
  "cacheTag",
]);

function readCriticalFileSource(
  filePath: (typeof CRITICAL_CACHE_POLICY_FILES)[number],
) {
  switch (filePath) {
    case "src/app/[locale]/contact/page.tsx":
      return readFileSync("src/app/[locale]/contact/page.tsx", "utf8");
    case "src/lib/actions/contact.ts":
      return readFileSync("src/lib/actions/contact.ts", "utf8");
    case "src/app/api/contact/route.ts":
      return readFileSync("src/app/api/contact/route.ts", "utf8");
    case "src/app/api/inquiry/route.ts":
      return readFileSync("src/app/api/inquiry/route.ts", "utf8");
    case "src/app/api/subscribe/route.ts":
      return readFileSync("src/app/api/subscribe/route.ts", "utf8");
    case "src/app/api/health/route.ts":
      return readFileSync("src/app/api/health/route.ts", "utf8");
    default:
      throw new Error(`Unhandled critical cache policy file: ${filePath}`);
  }
}

function parseModule(filePath: (typeof CRITICAL_CACHE_POLICY_FILES)[number]) {
  return parse(readCriticalFileSource(filePath), {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
}

describe("cache directive policy", () => {
  it("keeps critical routes and actions free of top-level use cache directives", () => {
    for (const filePath of CRITICAL_CACHE_POLICY_FILES) {
      const ast = parseModule(filePath);
      const directives = ast.program.directives.map(
        (directive) => directive.value.value,
      );

      expect(
        directives,
        `${filePath} should not declare use cache`,
      ).not.toContain("use cache");
    }
  });

  it("does not import cache-component helpers into critical routes and actions", () => {
    for (const filePath of CRITICAL_CACHE_POLICY_FILES) {
      const ast = parseModule(filePath);
      const bannedImports = ast.program.body
        .filter((node) => node.type === "ImportDeclaration")
        .filter((node) => node.source.value === "next/cache")
        .flatMap((node) =>
          node.specifiers
            .filter((specifier) => specifier.type === "ImportSpecifier")
            .map((specifier) => specifier.imported.name)
            .filter((name) => BANNED_NEXT_CACHE_IMPORTS.has(name)),
        );

      expect(
        bannedImports,
        `${filePath} should not import cache-component helpers from next/cache`,
      ).toEqual([]);
    }
  });
});
