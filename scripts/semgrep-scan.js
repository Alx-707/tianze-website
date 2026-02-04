#!/usr/bin/env node

/**
 * Semgrep 扫描（与 CI 行为对齐）
 *
 * - ERROR: 阻断（exit code = 1），输出 JSON
 * - WARNING: 仅记录（不阻断），输出 JSON
 *
 * 输出：
 * - reports/semgrep-error-<timestamp>.json + reports/semgrep-error-latest.json
 * - reports/semgrep-warning-<timestamp>.json + reports/semgrep-warning-latest.json
 */

const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

function pickPython() {
  const fromEnv = process.env.SEMGREP_PYTHON;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  // Prefer python.org installers on macOS to avoid Homebrew PEP-668 restrictions.
  const candidates = [
    "/Library/Frameworks/Python.framework/Versions/3.12/bin/python3",
    "/Library/Frameworks/Python.framework/Versions/3.11/bin/python3",
    "/Library/Frameworks/Python.framework/Versions/3.10/bin/python3",
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return "python3";
}

const PYTHON = pickPython();

function run(cmd, args, options = {}) {
  return spawnSync(cmd, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
}

function findSemgrep() {
  const fromEnv = process.env.SEMGREP_BIN;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;

  const home = process.env.HOME || "";
  const candidates = [
    path.join(home, ".local", "bin", "semgrep"),
    "/Library/Frameworks/Python.framework/Versions/3.12/bin/semgrep",
    "/Library/Frameworks/Python.framework/Versions/3.11/bin/semgrep",
    "/Library/Frameworks/Python.framework/Versions/3.10/bin/semgrep",
    "/usr/local/bin/semgrep",
    "/opt/homebrew/bin/semgrep",
    "/usr/bin/semgrep",
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  const which = run("bash", ["-lc", "command -v semgrep || true"]);
  const found = (which.stdout || "").trim();
  return found || null;
}

function ensureSemgrep() {
  const existing = findSemgrep();
  if (existing) return existing;

  const install = run(PYTHON, ["-m", "pip", "install", "--user", "semgrep<2"]);
  if (install.status !== 0) {
    throw new Error(
      `Semgrep install failed: ${(install.stderr || install.stdout || "").trim()}`,
    );
  }

  const installed = findSemgrep();
  if (!installed) {
    throw new Error("Semgrep not found after installation");
  }

  const versionCheck = run(installed, ["--version"]);
  if (versionCheck.status !== 0) {
    throw new Error(
      `Semgrep not runnable after installation: ${(versionCheck.stderr || versionCheck.stdout || "").trim()}`,
    );
  }

  return installed;
}

function safeParseJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeLatestCopy(srcPath, latestPath) {
  try {
    fs.copyFileSync(srcPath, latestPath);
  } catch {
    // best-effort
  }
}

function countFindings(reportJson) {
  const results = Array.isArray(reportJson?.results) ? reportJson.results : [];
  return results.length;
}

function scan({ semgrepPath, severity, outputPath }) {
  const args = [
    "scan",
    "--config",
    "semgrep.yml",
    "--severity",
    severity,
    "--json",
    "--output",
    outputPath,
    "src/",
  ];

  // 注意：这里不使用 --error，由我们自己根据结果决定退出码（便于统一解析）
  return run(semgrepPath, args);
}

function main() {
  const reportDir = path.join(process.cwd(), "reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const semgrepPath = ensureSemgrep();
  const ts = Date.now();

  const errorReportPath = path.join(reportDir, `semgrep-error-${ts}.json`);
  const warningReportPath = path.join(reportDir, `semgrep-warning-${ts}.json`);

  const errorRun = scan({
    semgrepPath,
    severity: "ERROR",
    outputPath: errorReportPath,
  });
  const errorJson = safeParseJsonFile(errorReportPath);
  const errorCount = countFindings(errorJson);
  writeLatestCopy(
    errorReportPath,
    path.join(reportDir, "semgrep-error-latest.json"),
  );

  const warningRun = scan({
    semgrepPath,
    severity: "WARNING",
    outputPath: warningReportPath,
  });
  const warningJson = safeParseJsonFile(warningReportPath);
  const warningCount = countFindings(warningJson);
  writeLatestCopy(
    warningReportPath,
    path.join(reportDir, "semgrep-warning-latest.json"),
  );

  console.log(
    `Semgrep ERROR findings: ${errorCount} (${path.relative(process.cwd(), errorReportPath)})`,
  );
  if ((errorRun.error || errorRun.status !== 0) && errorCount === 0) {
    console.log(
      `Semgrep ERROR scan failed (exit=${String(errorRun.status)}): ${String(
        errorRun.error?.message ||
          (errorRun.stderr || errorRun.stdout || "").trim(),
      ).slice(0, 300)}`,
    );
  }

  console.log(
    `Semgrep WARNING findings: ${warningCount} (${path.relative(process.cwd(), warningReportPath)})`,
  );
  if ((warningRun.error || warningRun.status !== 0) && warningCount === 0) {
    console.log(
      `Semgrep WARNING scan failed (ignored; scan may be incomplete): ${String(
        warningRun.error?.message ||
          (warningRun.stderr || warningRun.stdout || "").trim(),
      ).slice(0, 300)}`,
    );
  }

  // 阻断策略：ERROR 级 findings > 0
  if (errorCount > 0) process.exit(1);

  // 如果 semgrep 执行失败且没有任何可解析结果，也按失败退出
  if ((errorRun.error || errorRun.status !== 0) && errorCount === 0)
    process.exit(2);

  process.exit(0);
}

try {
  main();
} catch (error) {
  console.error(`Semgrep scan failed: ${error.message}`);
  process.exit(2);
}
