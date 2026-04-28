import { existsSync, readFileSync } from "node:fs";
import { parse } from "@babel/parser";
import { describe, expect, it } from "vitest";

const CRITICAL_CACHE_POLICY_FILES = [
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
  "src/lib/actions/contact.ts": () =>
    readFileSync("src/lib/actions/contact.ts", "utf8"),
  "src/app/api/inquiry/route.ts": () =>
    readFileSync("src/app/api/inquiry/route.ts", "utf8"),
  "src/app/api/subscribe/route.ts": () =>
    readFileSync("src/app/api/subscribe/route.ts", "utf8"),
  "src/app/api/health/route.ts": () =>
    readFileSync("src/app/api/health/route.ts", "utf8"),
} satisfies Record<(typeof CRITICAL_CACHE_POLICY_FILES)[number], () => string>;

const CONTACT_PAGE_FILE = "src/app/[locale]/contact/page.tsx";
const CONTACT_PAGE_DATA_FILE = "src/app/[locale]/contact/contact-page-data.ts";
const PRODUCT_MARKET_SOURCE_FILES = [
  "src/app/[locale]/products/[market]/page.tsx",
  "src/app/[locale]/products/[market]/market-jsonld.ts",
  "src/app/[locale]/products/[market]/market-page-data.ts",
  "src/app/[locale]/products/[market]/market-page-sections.tsx",
  "src/app/[locale]/products/[market]/market-spec-presenter.ts",
] as const;

function readProductMarketSource(filePath: string) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- architecture test checks repo-local allowlisted files
  if (!existsSync(filePath)) {
    return null;
  }

  return {
    filePath,
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- architecture test checks repo-local allowlisted files
    source: readFileSync(filePath, "utf8"),
  };
}

function readProductMarketSources() {
  return PRODUCT_MARKET_SOURCE_FILES.map(readProductMarketSource).filter(
    (item) => item !== null,
  );
}

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

  it("keeps product market route sources free of shared FAQ and cache workarounds", () => {
    for (const { filePath, source } of readProductMarketSources()) {
      expect(source, filePath).not.toContain('getPageBySlug("product-market"');
      expect(source, filePath).not.toContain("getProductMarketFaqItems");
      expect(source, filePath).not.toContain(
        "@/components/sections/faq-section",
      );
      expect(source, filePath).not.toContain("generateFaqSchemaFromItems");
      expect(source, filePath).not.toContain('from "next/cache"');
      expect(source, filePath).not.toContain("cacheLife(");
      expect(source, filePath).not.toContain("cacheTag(");
      expect(source, filePath).not.toContain("revalidateTag(");
      expect(source, filePath).not.toContain("revalidatePath(");
    }
  });
});
