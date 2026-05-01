import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_OUTPUT = "reports/deploy/preview-proof.json";
const DEFAULT_PAGES = [
  "/en",
  "/zh",
  "/en/contact",
  "/zh/contact",
  "/en/products",
  "/en/products/north-america",
  "/en/about",
];
const REQUIRED_HREFLANGS = ["en", "zh", "x-default"];
const TRUST_PLACEHOLDER_PATTERNS = [
  {
    label: "Fake phone number",
    value: "+86-518-0000-0000",
    pattern: /\+86-518-0000-0000/i,
  },
  {
    label: "Sample product copy",
    value: "Sample Product",
    pattern: /Sample Product/i,
  },
  {
    label: "Replacement image instruction",
    value: "Replace this image",
    pattern: /Replace this image/i,
  },
  {
    label: "Default logo asset",
    value: "/images/logo.svg",
    pattern: /\/images\/logo\.svg/i,
  },
];
const CTA_TEXT_PATTERN =
  /(?:contact|inquiry|quote|request|联系|询盘|报价|咨询)/i;
const USAGE_ERROR_MESSAGES = new Set([
  "Missing required --base-url",
  "Both --header-name and --header-value must be provided together",
]);

export function parsePreviewProofArgs(argv) {
  const args = {
    baseUrl: "",
    headerName: "",
    headerValue: "",
    output: DEFAULT_OUTPUT,
    strict: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--") {
      continue;
    }

    if (arg === "--strict") {
      args.strict = true;
      continue;
    }

    if (arg === "--base-url" && i + 1 < argv.length) {
      args.baseUrl = argv[++i];
      continue;
    }

    if (arg === "--header-name" && i + 1 < argv.length) {
      args.headerName = argv[++i];
      continue;
    }

    if (arg === "--header-value" && i + 1 < argv.length) {
      args.headerValue = argv[++i];
      continue;
    }

    if (arg === "--output" && i + 1 < argv.length) {
      args.output = argv[++i];
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.baseUrl) {
    throw new Error("Missing required --base-url");
  }

  if (Boolean(args.headerName) !== Boolean(args.headerValue)) {
    throw new Error(
      "Both --header-name and --header-value must be provided together",
    );
  }

  return args;
}

export function assertPageContract({
  pathname,
  html,
  status,
  finalUrl,
  strict = false,
}) {
  const failures = [];
  const warnings = [];

  addFailureIf(
    status !== 200,
    `Expected ${pathname} to return 200, got ${status}`,
    failures,
  );
  addFailureIf(
    finalUrl.toLowerCase().includes("localhost"),
    `Expected final URL to not contain localhost, got ${finalUrl}`,
    failures,
  );
  assertCount(
    html,
    /<link\b[^>]*\brel=["']canonical["'][^>]*>/gi,
    1,
    "canonical link",
    failures,
  );
  assertCount(html, /<h1\b[^>]*>/gi, 1, "h1", failures);
  assertCount(html, /<main\b[^>]*>/gi, 1, "main", failures);
  assertJsonLdGraph(html, failures);
  assertHreflangLinks(html, failures);
  assertContactCta(html, failures);
  assertTrustPlaceholders(html, strict, failures, warnings);

  return {
    pathname,
    status,
    finalUrl,
    ok: failures.length === 0,
    failures,
    warnings,
  };
}

export function buildPreviewProofReport({ baseUrl, checkedAt, pages }) {
  const failureCount = pages.reduce(
    (count, page) => count + page.failures.length,
    0,
  );
  const warningCount = pages.reduce(
    (count, page) => count + page.warnings.length,
    0,
  );

  return {
    tool: "preview-proof",
    baseUrl,
    checkedAt,
    ok: failureCount === 0,
    totals: {
      pages: pages.length,
      failures: failureCount,
      warnings: warningCount,
    },
    pages,
  };
}

export function buildFetchFailurePageResult({ baseUrl, pathname, error }) {
  return {
    pathname,
    status: 0,
    finalUrl: new URL(pathname, baseUrl).toString(),
    ok: false,
    failures: [`Fetch failed for ${pathname}: ${getErrorMessage(error)}`],
    warnings: [],
  };
}

export function formatCliError(error) {
  return `[preview-proof] ${getErrorMessage(error)}`;
}

export function isUsageError(error) {
  return error instanceof Error && USAGE_ERROR_MESSAGES.has(error.message);
}

function addFailureIf(condition, message, failures) {
  if (condition) {
    failures.push(message);
  }
}

function assertCount(html, pattern, expected, label, failures) {
  const count = countMatches(html, pattern);
  addFailureIf(
    count !== expected,
    `Expected exactly one ${label}, found ${count}`,
    failures,
  );
}

function assertJsonLdGraph(html, failures) {
  const blocks = matchAll(
    html,
    /<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  addFailureIf(
    blocks.length !== 1,
    `Expected exactly one JSON-LD script, found ${blocks.length}`,
    failures,
  );

  if (blocks.length !== 1) {
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(stripHtmlComments(blocks[0][1]).trim());
  } catch {
    failures.push("Expected JSON-LD script to contain valid JSON");
    return;
  }

  addFailureIf(
    !Array.isArray(parsed?.["@graph"]),
    "Expected JSON-LD script to contain @graph array",
    failures,
  );
}

function assertHreflangLinks(html, failures) {
  for (const hreflang of REQUIRED_HREFLANGS) {
    const count = countMatches(
      html,
      new RegExp(
        `<link\\b(?=[^>]*\\brel=["']alternate["'])(?=[^>]*\\bhreflang=["']${escapeRegExp(
          hreflang,
        )}["'])[^>]*>`,
        "gi",
      ),
    );
    addFailureIf(
      count !== 1,
      `Expected hreflang "${hreflang}" exactly once, found ${count}`,
      failures,
    );
  }
}

function assertContactCta(html, failures) {
  const hasContactCta =
    hasHrefCta(html) ||
    hasTextCtaElement(html, "a") ||
    hasTextCtaElement(html, "button");

  addFailureIf(
    !hasContactCta,
    "Expected contact, inquiry, or mailto CTA",
    failures,
  );
}

function hasHrefCta(html) {
  return matchAll(html, /href=["']([^"']+)["']/gi).some((match) => {
    const href = match[1].trim().toLowerCase();
    return (
      href === "/en/contact" ||
      href === "/zh/contact" ||
      href.startsWith("mailto:")
    );
  });
}

function hasTextCtaElement(html, tagName) {
  return matchAll(
    html,
    new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi"),
  ).some((match) => CTA_TEXT_PATTERN.test(stripTags(match[1])));
}

function assertTrustPlaceholders(html, strict, failures, warnings) {
  const matchedPlaceholders = TRUST_PLACEHOLDER_PATTERNS.filter((placeholder) =>
    placeholder.pattern.test(html),
  );

  for (const placeholder of matchedPlaceholders) {
    const message = `Public trust placeholder detected: ${placeholder.label} (${placeholder.value})`;
    if (strict) {
      failures.push(message);
    } else {
      warnings.push(message);
    }
  }
}

function countMatches(text, pattern) {
  return matchAll(text, pattern).length;
}

function matchAll(text, pattern) {
  return [...text.matchAll(pattern)];
}

function stripHtmlComments(value) {
  return value.replaceAll(/<!--|-->/g, "");
}

function stripTags(value) {
  return value.replaceAll(/<[^>]*>/g, " ");
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

function escapeRegExp(value) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildHeaders(headerName, headerValue) {
  const headers = {
    "user-agent": "preview-proof",
  };

  if (headerName && headerValue) {
    headers[headerName] = headerValue;
  }

  return headers;
}

async function checkPage(baseUrl, pathname, headers, strict) {
  try {
    const url = new URL(pathname, baseUrl);
    const response = await fetch(url, {
      headers,
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });
    const html = await response.text();

    return assertPageContract({
      pathname,
      html,
      status: response.status,
      finalUrl: response.url,
      strict,
    });
  } catch (error) {
    return buildFetchFailurePageResult({ baseUrl, pathname, error });
  }
}

async function writeReport(output, report) {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
}

async function main() {
  const { baseUrl, headerName, headerValue, output, strict } =
    parsePreviewProofArgs(process.argv);
  const headers = buildHeaders(headerName, headerValue);
  const pages = [];

  for (const pathname of DEFAULT_PAGES) {
    pages.push(await checkPage(baseUrl, pathname, headers, strict));
  }

  const report = buildPreviewProofReport({
    baseUrl,
    checkedAt: new Date().toISOString(),
    pages,
  });

  await writeReport(output, report);

  if (!report.ok) {
    console.error(`[preview-proof] Failures detected. Report: ${output}`);
    process.exit(1);
  }

  console.log(`[preview-proof] Report written to ${output}`);
}

const isCliEntry = process.argv[1] === fileURLToPath(import.meta.url);

if (isCliEntry) {
  main().catch((error) => {
    if (isUsageError(error)) {
      console.error(formatCliError(error));
      process.exit(1);
    }

    console.error(formatCliError(error));
    process.exit(1);
  });
}
