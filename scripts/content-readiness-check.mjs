import { glob } from "glob";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const LIVE_EXACT_FILES = new Set(["src/config/single-site.ts"]);
const EXCLUDED_EXACT_FILES = new Set(["src/config/public-trust.ts"]);
const EXCLUDED_PREFIXES = [
  "content/_archive/",
  "docs/",
  "reports/",
  "node_modules/",
  ".next/",
  ".open-next/",
];
const EXCLUDED_PATH_PATTERNS = [
  /\/__tests__\//,
  /\.test\.[cm]?[jt]sx?$/,
  /\.spec\.[cm]?[jt]sx?$/,
  /\/__mocks__\//,
];
const LIVE_GLOBS = [
  "content/pages/**/*",
  "messages/**/*",
  "public/images/**/*.svg",
  ...LIVE_EXACT_FILES,
];
const READINESS_PATTERNS = [
  { label: "fake phone", pattern: /\+86-518-0000-0000/i },
  {
    label: "sample product replacement instruction",
    pattern: /Replace this image/i,
  },
  { label: "sample product label", pattern: /Sample Product/i },
  { label: "missing translation marker", pattern: /MISSING_MESSAGE/i },
];

function normalizePath(path) {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

function isExcludedPath(path) {
  return (
    EXCLUDED_EXACT_FILES.has(path) ||
    EXCLUDED_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    EXCLUDED_PATH_PATTERNS.some((pattern) => pattern.test(path))
  );
}

function isLiveInputPath(path) {
  return (
    path.startsWith("content/pages/") ||
    path.startsWith("messages/") ||
    (path.startsWith("public/images/") && path.endsWith(".svg")) ||
    LIVE_EXACT_FILES.has(path)
  );
}

export function shouldScanLivePath(path) {
  const normalizedPath = normalizePath(path);

  return isLiveInputPath(normalizedPath) && !isExcludedPath(normalizedPath);
}

export function checkContentReadiness(files) {
  const findings = [];

  for (const file of files) {
    const path = normalizePath(file.path);
    if (!shouldScanLivePath(path)) {
      continue;
    }

    for (const { label, pattern } of READINESS_PATTERNS) {
      const match = file.text.match(pattern);
      if (match) {
        findings.push({ path, label, match: match[0] });
      }
    }
  }

  return { ok: findings.length === 0, findings };
}

export async function readLiveFiles() {
  const globbedPaths = await glob(LIVE_GLOBS, { nodir: true });
  const uniquePaths = [...new Set(globbedPaths.map(normalizePath))]
    .filter(shouldScanLivePath)
    .sort();
  const files = [];

  for (const path of uniquePaths) {
    files.push({ path, text: await readFile(path, "utf8") });
  }

  return files;
}

async function main() {
  const result = checkContentReadiness(await readLiveFiles());
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[content-readiness] unexpected error:", error);
    process.exit(1);
  });
}
