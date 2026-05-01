#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { glob } from "glob";

const BUDGET_PATH = "docs/quality/client-boundary-budget.json";
const REPORT_PATH = "reports/quality/client-boundary-budget.json";
const SOURCE_GLOB = "src/**/*.{ts,tsx}";
const EXCLUDE_GLOBS = [
  "src/**/*.test.ts",
  "src/**/*.test.tsx",
  "src/**/*.spec.ts",
  "src/**/*.spec.tsx",
  "src/**/__tests__/**",
  "src/test/**",
  "src/testing/**",
];

function normalizePath(filePath) {
  return filePath.split("\\").join("/");
}

function isDirectiveLine(line, directive) {
  const trimmed = line.trim();

  return (
    trimmed === `"${directive}"` ||
    trimmed === `"${directive}";` ||
    trimmed === `'${directive}'` ||
    trimmed === `'${directive}';`
  );
}

function isBlankOrCommentLine(line) {
  const trimmed = line.trim();

  return trimmed === "" || trimmed.startsWith("//");
}

function isAnyDirectiveLine(line) {
  return /^["'][^"']+["'];?$/u.test(line.trim());
}

function stripLeadingBlockComments(line, state) {
  let currentLine = line.trimStart();

  while (currentLine.startsWith("/*")) {
    const commentEnd = currentLine.indexOf("*/");

    if (commentEnd === -1) {
      state.isInsideBlockComment = true;
      return "";
    }

    currentLine = currentLine.slice(commentEnd + 2).trimStart();
  }

  return currentLine;
}

function hasTopLevelUseClientDirective(source) {
  const state = { isInsideBlockComment: false };

  for (const line of source.split(/\r?\n/u)) {
    let currentLine = line;

    if (state.isInsideBlockComment) {
      const commentEnd = currentLine.indexOf("*/");

      if (commentEnd === -1) {
        continue;
      }

      state.isInsideBlockComment = false;
      currentLine = currentLine.slice(commentEnd + 2);
    }

    currentLine = stripLeadingBlockComments(currentLine, state);

    if (state.isInsideBlockComment || isBlankOrCommentLine(currentLine)) {
      continue;
    }

    if (isDirectiveLine(currentLine, "use client")) {
      return true;
    }

    if (!isAnyDirectiveLine(currentLine)) {
      return false;
    }
  }

  return false;
}

export function findClientBoundaryFiles(files) {
  return files
    .filter((file) => hasTopLevelUseClientDirective(file.source))
    .map((file) => normalizePath(file.path))
    .sort();
}

export function compareClientBoundaryBudget({ budget, currentFiles }) {
  const allowedFiles = new Set(budget.allowedFiles);
  const normalizedCurrentFiles = currentFiles.map(normalizePath).sort();
  const excessFiles = normalizedCurrentFiles.filter(
    (filePath) => !allowedFiles.has(filePath),
  );
  const count = normalizedCurrentFiles.length;
  const maxClientBoundaryFiles = budget.maxClientBoundaryFiles;

  return {
    ok: excessFiles.length === 0 && count <= maxClientBoundaryFiles,
    excessFiles,
    count,
    maxClientBoundaryFiles,
  };
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function scanSourceFiles() {
  const paths = await glob(SOURCE_GLOB, {
    ignore: EXCLUDE_GLOBS,
    nodir: true,
  });
  const files = await Promise.all(
    paths.map(async (path) => ({
      path: normalizePath(path),
      source: await readFile(path, "utf8"),
    })),
  );

  return findClientBoundaryFiles(files);
}

async function writeReport(payload) {
  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

async function main() {
  const budget = await readJson(BUDGET_PATH);
  const currentFiles = await scanSourceFiles();
  const result = compareClientBoundaryBudget({ budget, currentFiles });
  const report = {
    createdAt: new Date().toISOString(),
    budgetPath: BUDGET_PATH,
    ...result,
    currentFiles,
    allowedFiles: [...budget.allowedFiles].sort(),
  };

  await writeReport(report);

  if (result.ok) {
    console.log(
      `review:client-boundary passed (${result.count}/${result.maxClientBoundaryFiles})`,
    );
    return;
  }

  console.error(
    `review:client-boundary failed (${result.count}/${result.maxClientBoundaryFiles})`,
  );

  if (result.excessFiles.length > 0) {
    console.error("Excess client boundary files:");
    for (const filePath of result.excessFiles) {
      console.error(`- ${filePath}`);
    }
  }

  process.exit(1);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
