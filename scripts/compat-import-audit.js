#!/usr/bin/env node

/**
 * Compatibility Import Audit
 *
 * Purpose:
 * - inventory the current dependency surface on the site runtime skeleton
 * - prevent new drift while the single-site cutover is in progress
 * - support a later strict mode that proves skeleton removal is safe
 *
 * Default mode fails only when NEW unexpected consumers appear.
 * Strict mode fails when ANY tracked consumer remains.
 *
 * Usage:
 *   node scripts/compat-import-audit.js
 *   node scripts/compat-import-audit.js --strict-empty
 *   node scripts/compat-import-audit.js --json
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["src", "tests", ".github/workflows"];
const SCAN_FILES = [
  "package.json",
  "AGENTS.md",
  "README.md",
  "docs/guides/AI-CODING-DETECTION-RUNBOOK.md",
  "docs/guides/CANONICAL-TRUTH-REGISTRY.md",
  "docs/guides/LOCALE-RUNTIME-CONTRACT.md",
  "docs/guides/QUALITY-PROOF-LEVELS.md",
  "docs/guides/RELEASE-PROOF-RUNBOOK.md",
  "docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md",
  "docs/guides/TIER-A-OWNER-MAP.md",
  "docs/guides/TRANSLATION-QUARTET-CONTRACT.md",
  "docs/guides/frontend-llm-workflow.md",
  "docs/guides/template-usage.md",
];

const SITE_PATTERNS = [
  /from\s+["']@\/sites(?:\/[^"']*)?["']/,
  /import\s*\([^)]*["']@\/sites(?:\/[^"']*)?["'][^)]*\)/,
  /\bcurrentSiteKey\b/,
  /\bcurrentSite\b/,
  /build:site:equipment/,
  /start:site:equipment/,
  /build:cf:site:equipment/,
  /site-pilot-proof/,
  /tianze-equipment/,
  /src\/sites\/\*\*/,
  /src\/sites\//,
];

const BASELINE_ALLOWLIST = new Set([
  ".github/workflows/ci.yml",
  "AGENTS.md",
  "docs/guides/AI-CODING-DETECTION-RUNBOOK.md",
  "docs/guides/CANONICAL-TRUTH-REGISTRY.md",
  "docs/guides/LOCALE-RUNTIME-CONTRACT.md",
  "docs/guides/QUALITY-PROOF-LEVELS.md",
  "docs/guides/RELEASE-PROOF-RUNBOOK.md",
  "docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md",
  "docs/guides/TIER-A-OWNER-MAP.md",
  "docs/guides/TRANSLATION-QUARTET-CONTRACT.md",
  "docs/guides/frontend-llm-workflow.md",
  "docs/guides/template-usage.md",
  "package.json",
  "src/app/[locale]/contact/__tests__/contact-page-shell.test.tsx",
  "src/app/[locale]/contact/contact-page-shell.tsx",
  "src/app/[locale]/contact/page.tsx",
  "src/config/footer-links.ts",
  "src/config/paths/site-config.ts",
  "src/config/site-facts.ts",
  "src/constants/__tests__/product-catalog.test.ts",
  "src/constants/product-catalog.ts",
  "src/lib/__tests__/contact-get-contact-copy.test.ts",
  "src/lib/__tests__/load-messages.fallback.test.ts",
  "src/lib/contact/getContactCopy.ts",
  "src/lib/load-messages.ts",
  "src/lib/navigation.ts",
  "src/lib/seo-metadata.ts",
  "src/sites/__tests__/index.test.ts",
  "src/sites/__tests__/message-overrides.test.ts",
  "src/sites/base-url.ts",
  "src/sites/index.ts",
  "src/sites/message-overrides.ts",
  "src/sites/tianze-equipment.ts",
  "src/sites/tianze.ts",
  "src/sites/tianze/product-catalog.ts",
  "src/sites/types.ts",
  "tests/e2e/contact-form-smoke.spec.ts",
]);

const CATEGORY_ORDER = [
  "runtime-skeleton",
  "runtime-consumer",
  "tests",
  "build-ci",
  "docs-governance",
  "other",
];

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function walk(dirPath, files) {
  if (!fs.existsSync(dirPath)) return;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (
      ["node_modules", ".git", ".next", "coverage", "reports"].includes(
        entry.name,
      )
    ) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (!/\.(ts|tsx|js|mjs|md|json|yml|yaml)$/.test(entry.name)) continue;
    files.push(fullPath);
  }
}

function gatherFiles() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    walk(path.join(ROOT, dir), files);
  }
  for (const file of SCAN_FILES) {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) files.push(fullPath);
  }
  return files;
}

function getCategory(relativePath) {
  if (relativePath.startsWith("src/sites/")) return "runtime-skeleton";
  if (
    relativePath.startsWith("src/") &&
    !relativePath.includes("__tests__") &&
    !relativePath.endsWith(".test.ts") &&
    !relativePath.endsWith(".test.tsx")
  ) {
    return "runtime-consumer";
  }
  if (
    relativePath.startsWith("tests/") ||
    relativePath.includes("__tests__") ||
    relativePath.endsWith(".test.ts") ||
    relativePath.endsWith(".test.tsx")
  ) {
    return "tests";
  }
  if (relativePath === "package.json" || relativePath.startsWith(".github/")) {
    return "build-ci";
  }
  if (
    relativePath === "AGENTS.md" ||
    relativePath === "README.md" ||
    relativePath.startsWith("docs/") ||
    relativePath.startsWith(".claude/rules/")
  ) {
    return "docs-governance";
  }
  return "other";
}

function collectMatches(content) {
  const lines = content.split("\n");
  const matches = [];
  lines.forEach((line, index) => {
    if (SITE_PATTERNS.some((pattern) => pattern.test(line))) {
      matches.push({ line: index + 1, text: line.trim() });
    }
  });
  return matches;
}

function auditConsumers() {
  const results = [];
  for (const fullPath of gatherFiles()) {
    const relativePath = toPosix(path.relative(ROOT, fullPath));
    const content = fs.readFileSync(fullPath, "utf8");
    const matches = collectMatches(content);
    if (matches.length === 0) continue;
    results.push({
      file: relativePath,
      category: getCategory(relativePath),
      matches,
      allowed: BASELINE_ALLOWLIST.has(relativePath),
    });
  }

  results.sort((a, b) => {
    const categoryDiff =
      CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (categoryDiff !== 0) return categoryDiff;
    return a.file.localeCompare(b.file);
  });
  return results;
}

function printHuman(results, strictMode) {
  const groups = new Map();
  for (const result of results) {
    const items = groups.get(result.category) ?? [];
    items.push(result);
    groups.set(result.category, items);
  }

  console.log("Compatibility Import Audit\n");
  console.log(
    strictMode
      ? "Mode: strict-empty (fails while any tracked site-runtime consumer remains)\n"
      : "Mode: baseline-guard (fails only on unexpected new consumers)\n",
  );

  for (const category of CATEGORY_ORDER) {
    const items = groups.get(category);
    if (!items || items.length === 0) continue;
    console.log(`${category} (${items.length})`);
    for (const item of items) {
      const status = item.allowed ? "baseline" : "NEW";
      console.log(`  - [${status}] ${item.file}`);
      for (const match of item.matches.slice(0, 3)) {
        console.log(`      L${match.line}: ${match.text}`);
      }
      if (item.matches.length > 3) {
        console.log(`      … ${item.matches.length - 3} more match(es)`);
      }
    }
    console.log("");
  }
}

function main() {
  const strictMode = hasFlag("--strict-empty");
  const jsonMode = hasFlag("--json");
  const results = auditConsumers();
  const unexpected = results.filter((result) => !result.allowed);

  if (jsonMode) {
    process.stdout.write(
      JSON.stringify(
        {
          mode: strictMode ? "strict-empty" : "baseline-guard",
          total: results.length,
          unexpected: unexpected.map((result) => result.file),
          results,
        },
        null,
        2,
      ),
    );
  } else {
    printHuman(results, strictMode);
  }

  if (strictMode && results.length > 0) {
    console.error(
      `compat-import-audit failed: ${results.length} tracked site-runtime consumer(s) still remain.`,
    );
    process.exit(1);
  }

  if (!strictMode && unexpected.length > 0) {
    console.error(
      `compat-import-audit failed: ${unexpected.length} unexpected new consumer(s) were added to the site-runtime dependency surface.`,
    );
    process.exit(1);
  }

  console.log(
    strictMode
      ? "compat-import-audit strict check passed"
      : "compat-import-audit baseline guard passed",
  );
}

main();
