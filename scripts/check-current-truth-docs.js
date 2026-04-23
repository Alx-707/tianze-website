#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const CHECKS = [
  {
    file: "docs/guides/CANONICAL-TRUTH-REGISTRY.md",
    required: [
      "src/config/single-site-page-expression.ts",
      "src/config/single-site-seo.ts",
      "messages/en.json",
      "messages/zh.json",
      "Contact page Server Action",
    ],
    forbidden: [
      "Canonical site registry:",
      "Canonical site definitions:",
      "Canonical site-specific overlay sources:",
    ],
  },
  {
    file: "docs/guides/template-usage.md",
    required: [
      "src/config/single-site-page-expression.ts",
      "src/config/single-site-seo.ts",
    ],
  },
  {
    file: "docs/guides/content-asset-inventory.md",
    required: [
      "src/config/single-site-page-expression.ts",
      "src/config/single-site-seo.ts",
      "messages/en.json",
      "messages/zh.json",
      "tooling artifact",
    ],
  },
  {
    file: "docs/guides/DERIVATIVE-PROJECT-REPLACEMENT-CHECKLIST.md",
    required: [
      "src/config/single-site-page-expression.ts",
      "src/config/single-site-seo.ts",
      "Do not replace first",
      "Minimum proof after replacement",
    ],
  },
  {
    file: "docs/guides/LOCALE-RUNTIME-CONTRACT.md",
    forbidden: ["Server runtime may then merge site-specific overlays"],
  },
  {
    file: "docs/guides/TRANSLATION-QUARTET-CONTRACT.md",
    forbidden: ["Site-specific runtime overlays:"],
  },
  {
    file: "docs/guides/TIER-A-OWNER-MAP.md",
    forbidden: ["src/sites/message-overrides.ts", "src/sites/**/messages/**"],
  },
  {
    file: "docs/guides/RELEASE-PROOF-RUNBOOK.md",
    required: [
      "src/config/single-site-page-expression.ts",
      "src/config/single-site-seo.ts",
      "dirty worktree",
      "targeted proof",
      "clean branch",
    ],
    forbidden: ["`src/sites/**` or `src/sites/**/messages/**`"],
  },
  {
    file: "docs/guides/QUALITY-PROOF-LEVELS.md",
    required: [
      "src/config/single-site-page-expression.ts",
      "src/config/single-site-seo.ts",
      "dirty worktree",
      "targeted proof",
      "clean branch",
    ],
    forbidden: ["src/sites/**", "site-specific message overlays"],
  },
  {
    file: "docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md",
    forbidden: ["src/sites/message-overrides.ts", "src/sites/**/messages/**"],
  },
  {
    file: "docs/guides/frontend-llm-workflow.md",
    forbidden: [
      "先看 `src/sites/**`",
      "src/sites/** 和 `src/constants/product-catalog.ts`",
    ],
  },
  {
    file: "docs/guides/AI-CODING-DETECTION-RUNBOOK.md",
    forbidden: [
      "当前站点身份真相源已经进入 `src/sites/**`",
      "先改 `src/sites/**`",
    ],
  },
  {
    file: ".claude/rules/content.md",
    required: [
      "src/config/single-site-page-expression.ts",
      "src/config/single-site-seo.ts",
      "implementation detail",
    ],
  },
];

function readFile(rootDir, relPath) {
  const fullPath = path.join(rootDir, relPath);
  return fs.readFileSync(fullPath, "utf8");
}

function collectCurrentTruthDocFindings(rootDir = ROOT) {
  const failures = [];

  for (const check of CHECKS) {
    const fullPath = path.join(rootDir, check.file);
    if (!fs.existsSync(fullPath)) {
      failures.push({
        file: check.file,
        error: `missing required current-truth file "${check.file}"`,
      });
      continue;
    }

    const content = readFile(rootDir, check.file);
    for (const pattern of check.forbidden ?? []) {
      if (content.includes(pattern)) {
        failures.push({
          file: check.file,
          error: `forbidden current-truth pattern "${pattern}"`,
        });
      }
    }

    for (const pattern of check.required ?? []) {
      if (!content.includes(pattern)) {
        failures.push({
          file: check.file,
          error: `missing current-truth pattern "${pattern}"`,
        });
      }
    }
  }

  return failures;
}

function main() {
  const failures = collectCurrentTruthDocFindings();

  if (failures.length === 0) {
    console.log("current-truth-docs: passed");
    return;
  }

  console.error("current-truth-docs: failed");
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.error}`);
  }
  process.exit(1);
}

module.exports = {
  CHECKS,
  collectCurrentTruthDocFindings,
};

if (require.main === module) {
  main();
}
