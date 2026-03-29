#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const TARGET_DIRECTORIES = [
  "src/lib/lead-pipeline/",
  "src/lib/security/",
  "src/lib/form-schema/",
];
const REPORT_PATH = path.join(
  process.cwd(),
  "reports",
  "mutation",
  "mutation-report.json",
);

function runGit(args) {
  return execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trim();
}

function getChangedFiles() {
  const output = runGit(["diff", "origin/main...HEAD", "--name-only"]);
  if (!output) return [];

  return output
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file) => !file.includes("/__tests__/"));
}

function getTouchedTargetDirectories(changedFiles) {
  return TARGET_DIRECTORIES.filter((directory) =>
    changedFiles.some((file) => file.startsWith(directory)),
  );
}

function getMergeBaseTimestampMs() {
  const mergeBase = runGit(["merge-base", "HEAD", "origin/main"]);
  const timestamp = runGit(["show", "-s", "--format=%ct", mergeBase]);
  return Number.parseInt(timestamp, 10) * 1000;
}

function loadMutationReport() {
  if (!fs.existsSync(REPORT_PATH)) {
    throw new Error(
      "缺少 reports/mutation/mutation-report.json，请先运行 pnpm test:mutation:lead",
    );
  }

  const raw = fs.readFileSync(REPORT_PATH, "utf8");
  return JSON.parse(raw);
}

function isReportFreshEnough(reportPath, branchStartMs) {
  return fs.statSync(reportPath).mtimeMs > branchStartMs;
}

function normalizeMutateScopes(report) {
  const mutate = report?.config?.mutate;
  return Array.isArray(mutate)
    ? mutate.filter((value) => typeof value === "string")
    : [];
}

function isDirectoryCovered(directory, mutateScopes) {
  return mutateScopes.some((scope) => scope.startsWith(directory));
}

function main() {
  const changedFiles = getChangedFiles();
  const touchedDirectories = getTouchedTargetDirectories(changedFiles);

  if (touchedDirectories.length === 0) {
    console.log(
      "✅ 未检测到 lead/security/form-schema 变更，跳过变异测试新鲜度检查",
    );
    return;
  }

  const branchStartMs = getMergeBaseTimestampMs();
  const report = loadMutationReport();

  if (!isReportFreshEnough(REPORT_PATH, branchStartMs)) {
    throw new Error(
      "变异测试报告早于当前分支起点，请重新运行 pnpm test:mutation:lead",
    );
  }

  const mutateScopes = normalizeMutateScopes(report);
  const uncoveredDirectories = touchedDirectories.filter(
    (directory) => !isDirectoryCovered(directory, mutateScopes),
  );

  if (uncoveredDirectories.length > 0) {
    throw new Error(
      [
        "变异测试报告 scope 不覆盖本次改动。",
        `命中目录: ${touchedDirectories.join(", ")}`,
        `报告 mutate scope: ${mutateScopes.join(", ") || "(empty)"}`,
        `未覆盖目录: ${uncoveredDirectories.join(", ")}`,
        "请运行 pnpm test:mutation:lead 并更新 reports/mutation/mutation-report.json",
      ].join("\n"),
    );
  }

  console.log(
    `✅ 变异测试报告有效，覆盖目录: ${touchedDirectories.join(", ")}`,
  );
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`❌ ${message}`);
  process.exit(1);
}
