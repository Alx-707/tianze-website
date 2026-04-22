import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";
import { describe, expect, it } from "vitest";

const CRITICAL_CACHE_POLICY_FILES = [
  "src/app/[locale]/contact/page.tsx",
  "src/lib/actions/contact.ts",
  "src/app/api/inquiry/route.ts",
  "src/app/api/subscribe/route.ts",
  "src/app/api/health/route.ts",
] as const;

const BANNED_NEXT_CACHE_IMPORTS = new Set<string>([
  "unstable_cache",
  "cacheLife",
  "cacheTag",
]);

const CRITICAL_CACHE_POLICY_SOURCE_READERS = {
  "src/app/[locale]/contact/page.tsx": () =>
    readFileSync("src/app/[locale]/contact/page.tsx", "utf8"),
  "src/lib/actions/contact.ts": () =>
    readFileSync("src/lib/actions/contact.ts", "utf8"),
  "src/app/api/inquiry/route.ts": () =>
    readFileSync("src/app/api/inquiry/route.ts", "utf8"),
  "src/app/api/subscribe/route.ts": () =>
    readFileSync("src/app/api/subscribe/route.ts", "utf8"),
  "src/app/api/health/route.ts": () =>
    readFileSync("src/app/api/health/route.ts", "utf8"),
} satisfies Record<(typeof CRITICAL_CACHE_POLICY_FILES)[number], () => string>;

type AstRecord = Record<string, unknown>;

function isAstRecord(value: unknown): value is AstRecord {
  return typeof value === "object" && value !== null;
}

function readStringProperty(record: AstRecord, key: string) {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function readNumberProperty(record: AstRecord, key: string) {
  const value = record[key];
  return typeof value === "number" ? value : undefined;
}

function readDirectiveValue(node: AstRecord) {
  const value = node.value;

  if (!isAstRecord(value)) {
    return undefined;
  }

  return readStringProperty(value, "value");
}

function readDirectiveLine(node: AstRecord) {
  const loc = node.loc;

  if (!isAstRecord(loc)) {
    return undefined;
  }

  const start = loc.start;

  if (!isAstRecord(start)) {
    return undefined;
  }

  return readNumberProperty(start, "line");
}

function readCriticalFileSource(
  filePath: (typeof CRITICAL_CACHE_POLICY_FILES)[number],
) {
  return CRITICAL_CACHE_POLICY_SOURCE_READERS[filePath]();
}

function parseModule(filePath: (typeof CRITICAL_CACHE_POLICY_FILES)[number]) {
  return parse(readCriticalFileSource(filePath), {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });
}

function collectUseCacheDirectives(
  node: unknown,
  directiveLocations: string[],
) {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectUseCacheDirectives(child, directiveLocations);
    }

    return;
  }

  if (!isAstRecord(node)) {
    return;
  }

  if (
    readStringProperty(node, "type") === "Directive" &&
    readDirectiveValue(node) === "use cache"
  ) {
    const line = readDirectiveLine(node);
    directiveLocations.push(
      line === undefined ? "unknown line" : `line ${line}`,
    );
  }

  for (const child of Object.values(node)) {
    collectUseCacheDirectives(child, directiveLocations);
  }
}

function findUseCacheDirectives(
  filePath: (typeof CRITICAL_CACHE_POLICY_FILES)[number],
) {
  const ast = parseModule(filePath);
  const directiveLocations: string[] = [];

  collectUseCacheDirectives(ast.program, directiveLocations);

  return directiveLocations;
}

function findBannedNextCacheImports(
  filePath: (typeof CRITICAL_CACHE_POLICY_FILES)[number],
) {
  const ast = parseModule(filePath);
  const bannedImports: string[] = [];

  for (const node of ast.program.body) {
    if (
      node.type !== "ImportDeclaration" ||
      node.source.value !== "next/cache"
    ) {
      continue;
    }

    for (const specifier of node.specifiers) {
      if (specifier.type !== "ImportSpecifier") {
        continue;
      }

      const importedName =
        specifier.imported.type === "Identifier"
          ? specifier.imported.name
          : specifier.imported.value;

      if (BANNED_NEXT_CACHE_IMPORTS.has(importedName)) {
        bannedImports.push(importedName);
      }
    }
  }

  return bannedImports;
}

describe("cache directive policy", () => {
  it("keeps critical routes and actions free of use cache directives", () => {
    for (const filePath of CRITICAL_CACHE_POLICY_FILES) {
      expect(
        findUseCacheDirectives(filePath),
        `${filePath} should not declare use cache`,
      ).toEqual([]);
    }
  });

  it("does not import cache-component helpers into critical routes and actions", () => {
    for (const filePath of CRITICAL_CACHE_POLICY_FILES) {
      expect(
        findBannedNextCacheImports(filePath),
        `${filePath} should not import cache-component helpers from next/cache`,
      ).toEqual([]);
    }
  });
});
