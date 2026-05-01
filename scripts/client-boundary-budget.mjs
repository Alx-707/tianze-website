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
const DIRECTIVE_LINE_PATTERN =
  /^(?:"(?<double>(?:[^"\\]|\\.)*)"|'(?<single>(?:[^'\\]|\\.)*)')\s*;?\s*(?:(?:\/\/.*))?$/u;

function normalizePath(filePath) {
  return filePath.split("\\").join("/");
}

function getDirectiveLiteral(line) {
  const match = DIRECTIVE_LINE_PATTERN.exec(line.trim());

  if (!match?.groups) {
    return null;
  }

  return match.groups.double ?? match.groups.single ?? null;
}

function isDirectiveLine(line, directive) {
  return getDirectiveLiteral(line) === directive;
}

function isBlankOrCommentLine(line) {
  const trimmed = line.trim();

  return trimmed === "" || trimmed.startsWith("//");
}

function isAnyDirectiveLine(line) {
  return getDirectiveLiteral(line) !== null;
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

function isObjectRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findDuplicateAllowedFiles(allowedFiles) {
  const seenFiles = new Set();
  const duplicateFiles = new Set();

  for (const filePath of allowedFiles.map(normalizePath)) {
    if (seenFiles.has(filePath)) {
      duplicateFiles.add(filePath);
      continue;
    }

    seenFiles.add(filePath);
  }

  return [...duplicateFiles].sort();
}

export function validateClientBoundaryBudget(budget) {
  if (!isObjectRecord(budget)) {
    return ["budget must be an object"];
  }

  const errors = [];

  if (
    !Number.isInteger(budget.maxClientBoundaryFiles) ||
    budget.maxClientBoundaryFiles < 0
  ) {
    errors.push("maxClientBoundaryFiles must be a non-negative integer");
  }

  if (
    !Array.isArray(budget.allowedFiles) ||
    !budget.allowedFiles.every((filePath) => typeof filePath === "string")
  ) {
    errors.push("allowedFiles must be a string[]");
    return errors;
  }

  const duplicateFiles = findDuplicateAllowedFiles(budget.allowedFiles);

  if (duplicateFiles.length > 0) {
    errors.push(
      `allowedFiles contains duplicate entries: ${duplicateFiles.join(", ")}`,
    );
  }

  return errors;
}

export function compareClientBoundaryBudget({ budget, currentFiles }) {
  const normalizedCurrentFiles = currentFiles.map(normalizePath).sort();
  const budgetErrors = validateClientBoundaryBudget(budget);

  if (budgetErrors.length > 0) {
    return {
      ok: false,
      budgetErrors,
      excessFiles: [],
      count: normalizedCurrentFiles.length,
      maxClientBoundaryFiles: null,
    };
  }

  const allowedFiles = new Set(budget.allowedFiles.map(normalizePath));
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

function getAllowedFilesForReport(budget) {
  if (!isObjectRecord(budget) || !Array.isArray(budget.allowedFiles)) {
    return [];
  }

  return budget.allowedFiles
    .filter((filePath) => typeof filePath === "string")
    .map(normalizePath)
    .sort();
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
    allowedFiles: getAllowedFilesForReport(budget),
  };

  await writeReport(report);

  if (result.ok) {
    console.log(
      `review:client-boundary passed (${result.count}/${result.maxClientBoundaryFiles})`,
    );
    return;
  }

  if (result.budgetErrors?.length > 0) {
    console.error("review:client-boundary failed: invalid budget");

    for (const budgetError of result.budgetErrors) {
      console.error(`- ${budgetError}`);
    }

    process.exit(1);
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
