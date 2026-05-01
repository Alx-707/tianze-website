import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_OUTPUT = "reports/deploy/preview-observability-summary.json";
const DEFAULT_PROBES = ["/api/health"];
const REQUEST_TIMEOUT_MS = 30000;
const OK_STATUS_MIN = 200;
const OK_STATUS_MAX_EXCLUSIVE = 400;
const REQUIRED_HEADERS = ["x-request-id", "x-observability-surface"];
const EXPECTED_OBSERVABILITY_SURFACE = "cache-health";

export function summarizeHeaders(headers) {
  const normalizedHeaders = normalizeHeaders(headers);
  const requestId = normalizedHeaders["x-request-id"] ?? "";
  const surface = normalizedHeaders["x-observability-surface"] ?? "";
  const missing = [];

  if (!requestId) {
    missing.push("x-request-id");
  }

  if (!surface) {
    missing.push("x-observability-surface");
  } else if (surface !== EXPECTED_OBSERVABILITY_SURFACE) {
    missing.push(
      `x-observability-surface=${EXPECTED_OBSERVABILITY_SURFACE}`,
    );
  }

  return {
    requestId,
    surface,
    ok: missing.length === 0,
    missing,
  };
}

export function buildObservabilityReport({ baseUrl, checkedAt, probes }) {
  return {
    tool: "preview-observability-summary",
    baseUrl,
    checkedAt,
    ok: probes.every(
      (probe) =>
        probe.ok &&
        probe.status >= OK_STATUS_MIN &&
        probe.status < OK_STATUS_MAX_EXCLUSIVE,
    ),
    probes,
  };
}

export function parsePreviewObservabilityArgs(argv) {
  const args = {
    baseUrl: "",
    output: DEFAULT_OUTPUT,
    headerName: "",
    headerValue: "",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (arg === "--base-url" && index + 1 < argv.length) {
      args.baseUrl = argv[++index];
      continue;
    }

    if (arg === "--output" && index + 1 < argv.length) {
      args.output = argv[++index];
      continue;
    }

    if (arg === "--header-name" && index + 1 < argv.length) {
      args.headerName = argv[++index];
      continue;
    }

    if (arg === "--header-value" && index + 1 < argv.length) {
      args.headerValue = argv[++index];
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

export function buildHeaders({ headerName = "", headerValue = "" } = {}) {
  const entries = [["user-agent", "preview-observability-summary"]];

  if (headerName && headerValue) {
    entries.push([headerName, headerValue]);
  }

  return Object.fromEntries(entries);
}

export function buildProbeUrl({ baseUrl, pathname }) {
  return new URL(pathname, baseUrl);
}

function normalizeHeaders(headers) {
  const normalizedHeaders = {};
  const entries =
    headers && typeof headers.entries === "function"
      ? headers.entries()
      : Object.entries(headers ?? {});

  for (const [name, value] of entries) {
    normalizedHeaders[String(name).toLowerCase()] =
      value == null ? "" : String(value).trim();
  }

  return normalizedHeaders;
}

async function probe(baseUrl, pathname, headers) {
  try {
    const response = await fetch(buildProbeUrl({ baseUrl, pathname }), {
      headers,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    return {
      pathname,
      status: response.status,
      ...summarizeHeaders(response.headers),
    };
  } catch {
    return {
      pathname,
      status: 0,
      requestId: "",
      surface: "",
      ok: false,
      missing: [...REQUIRED_HEADERS],
    };
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const args = parsePreviewObservabilityArgs(process.argv);
  const headers = buildHeaders(args);
  const probes = [];

  for (const pathname of DEFAULT_PROBES) {
    probes.push(await probe(args.baseUrl, pathname, headers));
  }

  const report = buildObservabilityReport({
    baseUrl: args.baseUrl,
    checkedAt: new Date().toISOString(),
    probes,
  });

  await writeJson(args.output, report);

  if (!report.ok) {
    console.error("[preview-observability] missing required signals");
    process.exit(1);
  }

  console.log(`[preview-observability] Report written to ${args.output}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[preview-observability] unexpected error:", error);
    process.exit(1);
  });
}
