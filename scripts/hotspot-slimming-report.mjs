#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_INPUT_PATH = "reports/quality/hotspots.json";
const STRUCTURAL_INPUT_PATH = "reports/architecture/structural-hotspots-latest.json";
const REGISTER_PATH = "docs/quality/hotspot-slimming-register.md";
const MAX_CANDIDATES = 5;
const CRITICAL_SOURCE_PREFIXES = [
  "src/app/",
  "src/components/",
  "src/config/",
  "src/constants/",
  "src/emails/",
  "src/hooks/",
  "src/i18n/",
  "src/lib/",
  "src/services/",
  "src/templates/",
  "src/types/",
  "scripts/",
];
const TEST_PATH_PATTERNS = [
  "/__tests__/",
  ".test.",
  ".spec.",
];

function isObjectRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

function isCriticalSourcePath(filePath) {
  return (
    CRITICAL_SOURCE_PREFIXES.some((prefix) => filePath.startsWith(prefix)) &&
    !TEST_PATH_PATTERNS.some((pattern) => filePath.includes(pattern))
  );
}

function assertNumber(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Malformed hotspot input: ${label} must be a non-negative number`);
  }

  return value;
}

function assertString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Malformed hotspot input: ${label} must be a non-empty string`);
  }

  return value;
}

function getFlatRows(input) {
  if (Array.isArray(input)) {
    return input;
  }

  if (isObjectRecord(input) && Array.isArray(input.rows)) {
    return input.rows;
  }

  if (isObjectRecord(input) && Array.isArray(input.hotspots)) {
    return input.hotspots;
  }

  return null;
}

function normalizeFlatRow(row, index) {
  if (!isObjectRecord(row)) {
    throw new Error(`Malformed hotspot input: row ${index + 1} must be an object`);
  }

  const file = normalizePath(assertString(row.file, `row ${index + 1} file`));
  return {
    file,
    lines: assertNumber(row.lines, `row ${index + 1} (${file}) lines`),
    metricLabel: "Complexity metric",
    metricSource: "flat input complexity",
    metricValue: assertNumber(
      row.complexity,
      `row ${index + 1} (${file}) complexity`,
    ),
  };
}

function normalizeStructuralRow(row, index, lineCounter) {
  if (!isObjectRecord(row)) {
    throw new Error(
      `Malformed hotspot input: summary.hotspots[${index}] must be an object`,
    );
  }

  const file = normalizePath(
    assertString(row.file, `summary.hotspots[${index}].file`),
  );

  if (!isCriticalSourcePath(file)) {
    return null;
  }

  const lines = lineCounter(file);

  if (lines === null) {
    return null;
  }

  return {
    file,
    lines: assertNumber(lines, `summary.hotspots[${index}] (${file}) lines`),
    metricLabel: "Change touches",
    metricSource: "summary.hotspots[].commits",
    metricValue: assertNumber(
      row.commits,
      `summary.hotspots[${index}] (${file}) commits`,
    ),
  };
}

function normalizeRowForRanking(row, index) {
  if (!isObjectRecord(row)) {
    throw new Error(`Malformed hotspot input: row ${index + 1} must be an object`);
  }

  const file = normalizePath(assertString(row.file, `row ${index + 1} file`));

  if (!isCriticalSourcePath(file)) {
    return null;
  }

  const metricValue =
    typeof row.metricValue === "number" ? row.metricValue : row.complexity;
  const metricLabel =
    typeof row.metricLabel === "string" ? row.metricLabel : "Complexity metric";
  const metricSource =
    typeof row.metricSource === "string"
      ? row.metricSource
      : "flat input complexity";

  return {
    file,
    lines: assertNumber(row.lines, `row ${index + 1} (${file}) lines`),
    metricLabel,
    metricSource,
    metricValue: assertNumber(
      metricValue,
      `row ${index + 1} (${file}) metric`,
    ),
  };
}

function compareCandidates(left, right) {
  return (
    right.score - left.score ||
    right.metricValue - left.metricValue ||
    right.lines - left.lines ||
    left.file.localeCompare(right.file)
  );
}

function countPhysicalLines(source) {
  if (source.length === 0) {
    return 0;
  }

  const normalized = source.replace(/\r\n/gu, "\n").replace(/\r/gu, "\n");
  const withoutTrailingNewline = normalized.endsWith("\n")
    ? normalized.slice(0, -1)
    : normalized;

  return withoutTrailingNewline.split("\n").length;
}

function readJsonFile(inputPath) {
  try {
    return JSON.parse(readFileSync(inputPath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read hotspot input ${inputPath}: ${message}`, {
      cause: error,
    });
  }
}

function countFileLines(file, rootDir) {
  const filePath = path.resolve(rootDir, file);

  if (!existsSync(filePath)) {
    return null;
  }

  return countPhysicalLines(readFileSync(filePath, "utf8"));
}

function chooseDefaultInput(rootDir) {
  const qualityInput = path.resolve(rootDir, DEFAULT_INPUT_PATH);

  if (existsSync(qualityInput)) {
    return qualityInput;
  }

  const structuralInput = path.resolve(rootDir, STRUCTURAL_INPUT_PATH);

  if (existsSync(structuralInput)) {
    return structuralInput;
  }

  throw new Error(
    `No hotspot input found. Expected ${DEFAULT_INPUT_PATH}, or pass an input path after running pnpm arch:hotspots.`,
  );
}

function getDisplayPath(filePath, rootDir) {
  const relativePath = normalizePath(path.relative(rootDir, filePath));

  return relativePath.startsWith("..") ? normalizePath(filePath) : relativePath;
}

function getMetricHeader(candidates) {
  const labels = new Set(candidates.map((candidate) => candidate.metricLabel));

  if (labels.size === 1) {
    return candidates[0]?.metricLabel ?? "Metric";
  }

  return "Metric";
}

function getMetricNotes(candidates) {
  const sources = new Map();

  for (const candidate of candidates) {
    sources.set(candidate.metricLabel, candidate.metricSource);
  }

  return [...sources.entries()].sort(([left], [right]) =>
    left.localeCompare(right),
  );
}

function getSlimmingPlan(candidate) {
  return `Characterize current behavior first, then extract one small seam around ${candidate.file}.`;
}

export function normalizeHotspotInput(input, options = {}) {
  const lineCounter = options.lineCounter ?? ((file) => countFileLines(file, process.cwd()));

  if (isObjectRecord(input) && Array.isArray(input.summary?.hotspots)) {
    return input.summary.hotspots
      .map((row, index) => normalizeStructuralRow(row, index, lineCounter))
      .filter(Boolean);
  }

  const flatRows = getFlatRows(input);

  if (flatRows) {
    return flatRows.map(normalizeFlatRow);
  }

  throw new Error(
    "Malformed hotspot input: expected flat rows, { rows: [] }, { hotspots: [] }, or { summary: { hotspots: [] } }",
  );
}

export function rankHotspotCandidates(rows) {
  if (!Array.isArray(rows)) {
    throw new Error("Malformed hotspot input: rankHotspotCandidates expects an array");
  }

  return rows
    .map(normalizeRowForRanking)
    .filter(Boolean)
    .map((row) => ({
      ...row,
      score: row.metricValue * row.lines,
    }))
    .sort(compareCandidates)
    .slice(0, MAX_CANDIDATES);
}

export function renderHotspotRegister(candidates, options = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const inputPath = options.inputPath ?? "not provided";
  const skippedMissingFiles = options.skippedMissingFiles ?? [];
  const metricHeader = getMetricHeader(candidates);
  const lines = [
    "# Hotspot Slimming Register",
    "",
    "This is a candidate register, not permission to refactor immediately.",
    "",
    "## Source",
    "",
    `- Generated at: ${generatedAt}`,
    `- Input: \`${inputPath}\``,
    "- Ranking formula: metric value x real file lines",
    "- Top candidates: 5",
    `- Current-tree filter: skipped ${skippedMissingFiles.length} structural hotspot paths that no longer exist in this checkout.`,
    "",
    "## Non-negotiable rule",
    "",
    "> No behavior change is allowed without a failing characterization test.",
    "",
    "Use each row as a slimming plan: prove current behavior first, make one small extraction, then rerun the narrow proof before touching the next seam.",
    "",
    "## Candidates",
    "",
    `| Rank | File | ${metricHeader} | Lines | Score | Slimming plan |`,
    "|---:|---|---:|---:|---:|---|",
  ];

  candidates.forEach((candidate, index) => {
    lines.push(
      `| ${index + 1} | \`${candidate.file}\` | ${candidate.metricValue} | ${candidate.lines} | ${candidate.score} | ${getSlimmingPlan(candidate)} |`,
    );
  });

  lines.push("");
  lines.push("## Metric notes");
  lines.push("");

  for (const [label, source] of getMetricNotes(candidates)) {
    lines.push(`- ${label}: sourced from \`${source}\`.`);
  }

  lines.push(
    "- Change touches are commit touch counts, not cyclomatic complexity or proof of bad code.",
  );
  lines.push(
    "- Lines are real file line counts for structural-hotspots input; flat input may provide lines for future complexity tooling tests.",
  );
  lines.push(
    "- Structural history can contain deleted or renamed files; those paths are excluded because this register is for current files only.",
  );
  lines.push(
    "- Score is only a prioritization aid. Final work order still needs characterization-test coverage and owner judgment.",
  );
  lines.push("");
  lines.push("## Working sequence");
  lines.push("");
  lines.push("1. Pick one candidate and write a failing characterization test for the behavior that must not change.");
  lines.push("2. Extract one small helper, adapter, or presenter seam.");
  lines.push("3. Rerun the focused test and the smallest relevant quality check.");
  lines.push("4. Stop if the proof is unclear; do not batch-refactor the whole file.");

  return `${lines.join("\n")}\n`;
}

function runCli() {
  try {
    const rootDir = process.cwd();
    const skippedMissingFiles = [];
    const inputPath = process.argv[2]
      ? path.resolve(rootDir, process.argv[2])
      : chooseDefaultInput(rootDir);
    const input = readJsonFile(inputPath);
    const rows = normalizeHotspotInput(input, {
      lineCounter: (file) => {
        const lines = countFileLines(file, rootDir);

        if (lines === null) {
          skippedMissingFiles.push(file);
        }

        return lines;
      },
    });
    const candidates = rankHotspotCandidates(rows);

    if (candidates.length === 0) {
      throw new Error(
        "No hotspot candidates found after filtering to critical source/script prefixes.",
      );
    }

    const outputPath = path.resolve(rootDir, REGISTER_PATH);
    const markdown = renderHotspotRegister(candidates, {
      inputPath: getDisplayPath(inputPath, rootDir),
      skippedMissingFiles,
    });

    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, markdown, "utf8");

    console.log(`Hotspot slimming register written: ${REGISTER_PATH}`);
    console.log(`Input: ${getDisplayPath(inputPath, rootDir)}`);
    console.log(`Candidates: ${candidates.length}`);

    if (skippedMissingFiles.length > 0) {
      console.warn(
        `Skipped missing historical paths: ${skippedMissingFiles.length}`,
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`hotspot-slimming-report failed: ${message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCli();
}
