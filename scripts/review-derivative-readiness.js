#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const REQUIRED_FILES = [
  "src/config/single-site.ts",
  "src/config/single-site-product-catalog.ts",
  "src/config/single-site-page-expression.ts",
  "src/config/single-site-seo.ts",
  "docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md",
  ".claude/rules/content.md",
];

const CONTENT_CHECKS = [
  {
    file: "src/config/single-site-page-expression.ts",
    label: "homepage/page-expression seam exists",
    snippets: [
      "SINGLE_SITE_HOME_GRID_SECTION_ORDER",
      "SINGLE_SITE_HOME_LINK_TARGETS",
      "SINGLE_SITE_HOME_HERO_PROOF_ITEMS",
      "SINGLE_SITE_HOME_FINAL_TRUST_ITEMS",
      "SINGLE_SITE_HOME_SCENARIO_ITEMS",
      "SINGLE_SITE_HOME_QUALITY_COMMITMENT_ITEMS",
      "SINGLE_SITE_PRODUCTS_PAGE_EXPRESSION",
      "SINGLE_SITE_BENDING_MACHINES_PAGE_EXPRESSION",
      "SINGLE_SITE_OEM_PAGE_EXPRESSION",
      "SINGLE_SITE_ABOUT_STATS_ITEMS",
      "SINGLE_SITE_ABOUT_SHELL_COPY",
    ],
  },
  {
    file: "src/config/single-site-seo.ts",
    label: "single-site SEO authoring seam exists",
    snippets: [
      "SINGLE_SITE_PUBLIC_STATIC_PAGES",
      "SINGLE_SITE_SITEMAP_PAGE_CONFIG",
      "SINGLE_SITE_ROBOTS_DISALLOW_PATHS",
    ],
  },
  {
    file: "docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md",
    label:
      "derivative checklist defines replacement-first and keep-fixed areas",
    snippets: [
      "Replacement order",
      "Do not replace first",
      "Minimum proof after replacement",
    ],
  },
  {
    file: "package.json",
    label: "package scripts expose derivative-support review lanes",
    snippets: [
      '"review:docs-truth"',
      '"review:cf:official-compare"',
      '"review:derivative-readiness"',
    ],
  },
];

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

const failures = [];

for (const relPath of REQUIRED_FILES) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`missing required file: ${relPath}`);
  }
}

for (const check of CONTENT_CHECKS) {
  const content = readFile(check.file);
  for (const snippet of check.snippets) {
    if (!content.includes(snippet)) {
      failures.push(
        `${check.file}: missing ${check.label} snippet "${snippet}"`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error("derivative-readiness: failed");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("derivative-readiness: passed");
console.log(
  "Verified the baseline replacement surfaces, supporting docs, and review lanes for future derivative-project work.",
);
