#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports", "architecture");

const CHECKS = [
  {
    file: "docs/plans/current-repo-structural-audit-score.md",
    pattern: "Superseded by",
    label: "baseline score marked as superseded",
  },
  {
    file: "docs/plans/2026-03-23-structural-governance-followup.md",
    pattern: "Supplemental implementation record",
    label: "governance follow-up marked as supplemental",
  },
  {
    file: "docs/guides/POLICY-SOURCE-OF-TRUTH.md",
    pattern: "Canonical Current Sources",
    label: "policy source-of-truth index exists",
  },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  ensureDir(REPORT_DIR);

  const findings = [];

  for (const check of CHECKS) {
    const fullPath = path.join(ROOT, check.file);
    if (!fs.existsSync(fullPath)) {
      findings.push({ ...check, status: "missing" });
      continue;
    }
    const content = fs.readFileSync(fullPath, "utf8");
    findings.push({
      ...check,
      status: content.includes(check.pattern) ? "ok" : "missing_marker",
    });
  }

  const failed = findings.filter((item) => item.status !== "ok");
  const report = {
    generatedAt: new Date().toISOString(),
    failedCount: failed.length,
    findings,
  };

  const ts = Date.now();
  const jsonPath = path.join(REPORT_DIR, `archive-hygiene-audit-${ts}.json`);
  const mdPath = path.join(REPORT_DIR, `archive-hygiene-audit-${ts}.md`);
  const latestJson = path.join(REPORT_DIR, "archive-hygiene-audit-latest.json");
  const latestMd = path.join(REPORT_DIR, "archive-hygiene-audit-latest.md");

  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(
    mdPath,
    `# Archive Hygiene Audit\n\n- Generated at: ${report.generatedAt}\n- Failed checks: ${report.failedCount}\n\n${findings
      .map((item) => `- [${item.status}] ${item.label} (${item.file})`)
      .join("\n")}\n`,
  );
  fs.copyFileSync(jsonPath, latestJson);
  fs.copyFileSync(mdPath, latestMd);

  console.log(
    `Archive hygiene audit written: ${path.relative(ROOT, jsonPath)}`,
  );
  console.log(`Failed checks: ${report.failedCount}`);

  if (failed.length > 0) process.exit(1);
}

main();
