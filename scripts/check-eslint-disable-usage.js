#!/usr/bin/env node

/**
 * ESLint disable usage guard
 *
 * 目标：让“eslint-disable”变成可审计的例外，而不是噪音门禁。
 *
 * 规则（默认）：
 * - 所有 eslint-disable 必须指定 rule 名称（禁止裸 disable）
 * - 生产代码必须带理由（`-- reason`）
 * - 测试代码允许缺少理由（但仍要求指定 rule 名称）
 *
 * 推荐格式：
 * - `// eslint-disable-next-line <rule> -- <reason>`
 * - `/* eslint-disable <rule> -- <reason> *\/`
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO_ROOT = process.cwd();

function getRepoFiles() {
  try {
    const output = execSync("git ls-files", {
      encoding: "utf8",
      cwd: REPO_ROOT,
      stdio: ["ignore", "pipe", "ignore"],
    });
    return output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("[eslint-disable-check] Failed to list git files:", error);
    process.exit(1);
  }
}

function isSourceFile(filePath) {
  if (
    !(
      filePath.startsWith("src/") ||
      filePath.startsWith("tests/") ||
      filePath.startsWith("scripts/")
    )
  ) {
    return false;
  }

  const ext = path.extname(filePath);
  return [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext);
}

function isTestFile(filePath) {
  if (filePath.startsWith("tests/")) return true;
  if (filePath.startsWith("src/test/")) return true;
  if (filePath.includes("/__tests__/")) return true;
  if (/\.(test|spec)\.(ts|tsx|js|jsx)$/.test(filePath)) return true;

  // test-only typing/constants (kept under src/ for convenience)
  if (filePath.startsWith("src/types/test-")) return true;
  if (filePath.startsWith("src/constants/test-")) return true;

  return false;
}

function isValidRuleName(rule) {
  // Examples:
  // - no-console
  // - max-lines-per-function
  // - security/detect-object-injection
  // - @typescript-eslint/no-explicit-any
  return /^[@\w/-]+$/.test(rule);
}

function stripTrailingCommentEnd(text) {
  return text.replace(/\*\/\s*\}?$/, "").trim();
}

function parseDisableDirective(line, directive) {
  const idx = line.indexOf(directive);
  if (idx === -1) return null;

  const rawRest = stripTrailingCommentEnd(line.slice(idx + directive.length));
  const rest = rawRest.trim();

  const reasonIdx = rest.indexOf("--");
  const rulesText = (reasonIdx === -1 ? rest : rest.slice(0, reasonIdx)).trim();
  const reason = (reasonIdx === -1 ? "" : rest.slice(reasonIdx + 2)).trim();

  const rules = rulesText
    .split(",")
    .map((r) => r.trim())
    .filter(Boolean);

  return { rules, reason };
}

function analyzeFile(filePath) {
  const absolute = path.join(REPO_ROOT, filePath);
  let content = "";
  try {
    content = fs.readFileSync(absolute, "utf8");
  } catch (error) {
    // Worktree may be dirty; skip missing files instead of crashing.
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
  const lines = content.split("\n");

  const findings = [];
  const testFile = isTestFile(filePath);

  function extractDirectiveText(trimmed) {
    if (trimmed.startsWith("//")) return trimmed.slice(2).trim();
    if (trimmed.startsWith("/*")) return trimmed.slice(2).trim();
    if (trimmed.startsWith("*")) return trimmed.slice(1).trim();

    const jsxBlockIdx = trimmed.indexOf("{/*");
    if (jsxBlockIdx !== -1) {
      return trimmed.slice(jsxBlockIdx + 3).trim();
    }

    return null;
  }

  for (let i = 0; i < lines.length; i += 1) {
    const rawLine = lines[i] ?? "";
    if (!rawLine.includes("eslint-disable")) continue;
    if (rawLine.includes("eslint-enable")) continue;

    const trimmed = rawLine.trim();
    const directiveText = extractDirectiveText(trimmed);
    if (!directiveText || !directiveText.startsWith("eslint-disable")) {
      continue;
    }

    const directive = directiveText.includes("eslint-disable-next-line")
      ? "eslint-disable-next-line"
      : directiveText.includes("eslint-disable-line")
        ? "eslint-disable-line"
        : "eslint-disable";

    const parsed = parseDisableDirective(directiveText, directive);
    if (!parsed) continue;

    const { rules, reason } = parsed;
    const requireReason = !testFile;

    const violations = [];

    if (rules.length === 0) {
      violations.push("missing rule names");
    } else {
      const invalidRules = rules.filter((r) => !isValidRuleName(r));
      if (invalidRules.length > 0) {
        violations.push(`invalid rule name(s): ${invalidRules.join(", ")}`);
      }
    }

    if (requireReason && reason.length === 0) {
      violations.push("missing reason (use `-- reason`)");
    }

    if (violations.length > 0) {
      findings.push({
        filePath,
        line: i + 1,
        directive,
        content: trimmed,
        violations,
      });
    }
  }

  return findings;
}

function main() {
  const files = getRepoFiles().filter(isSourceFile);

  const allFindings = [];
  for (const file of files) {
    allFindings.push(...analyzeFile(file));
  }

  if (allFindings.length === 0) {
    console.log("[eslint-disable-check] OK (no violations)");
    return;
  }

  console.log(`[eslint-disable-check] Violations: ${allFindings.length}\n`);

  for (const finding of allFindings) {
    console.log(
      `- ${finding.filePath}:${finding.line} ${finding.directive}: ${finding.violations.join(
        "; ",
      )}`,
    );
    console.log(`  ${finding.content}`);
  }

  process.exit(1);
}

if (require.main === module) {
  main();
}
