import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import runtimeEnv from "../lib/runtime-env.js";

const DEFAULT_BASE_URL =
  runtimeEnv.readEnvString("CLOUDFLARE_PREVIEW_BASE_URL") ||
  "http://127.0.0.1:8787";
const DEFAULT_OUTPUT =
  "reports/cloudflare-preview/preview-smoke-diagnostics.json";
const BODY_SNIPPET_LENGTH = 500;
export const DEFAULT_PREVIEW_DIAGNOSTIC_ROUTES = [
  "/",
  "/en",
  "/zh",
  "/en/contact",
  "/zh/contact",
  "/fr/products/eu/fittings",
  "/api/health",
];
const LOCAL_PREVIEW_HOSTS = new Set(["127.0.0.1", "localhost", "::1"]);

export function createBodySnippet(bodyText) {
  return bodyText.slice(0, BODY_SNIPPET_LENGTH);
}

export function buildPreviewDiagnosticReport(input) {
  return {
    tool: "preview-smoke-diagnostics",
    checkedAt: input.checkedAt,
    baseUrl: input.baseUrl,
    routes: input.routes,
  };
}

export function classifyPreviewDiagnosticReport(report) {
  const failedRoutes = report.routes
    .filter((route) => !route.ok)
    .map((route) => route.pathname);

  return {
    ok: failedRoutes.length === 0,
    failedRoutes,
  };
}

function assertLocalBaseUrl(baseUrl) {
  const url = new URL(baseUrl);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(
      `Unsupported preview diagnostics protocol: ${url.protocol}`,
    );
  }
  if (!LOCAL_PREVIEW_HOSTS.has(url.hostname)) {
    throw new Error(
      "Cloudflare preview diagnostics only supports local base URLs",
    );
  }
}

export function parsePreviewDiagnosticArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    output: DEFAULT_OUTPUT,
  };

  function readFlagValue(index, flag) {
    if (index + 1 >= argv.length || argv[index + 1].startsWith("--")) {
      throw new Error(`Missing value for ${flag}`);
    }
    return argv[index + 1];
  }

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      continue;
    }

    if (arg === "--base-url") {
      args.baseUrl = readFlagValue(index, "--base-url");
      index += 1;
      continue;
    }

    if (arg === "--output") {
      args.output = readFlagValue(index, "--output");
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  assertLocalBaseUrl(args.baseUrl);

  return args;
}

function getRouteFailureKind(status) {
  if (status < 200 || status >= 300) {
    return status >= 500 ? "server-error" : "http-status";
  }

  return null;
}

export async function probePreviewRoute({
  baseUrl,
  pathname,
  fetchImpl = fetch,
}) {
  const startedAt = performance.now();

  try {
    const response = await fetchImpl(new URL(pathname, baseUrl), {
      redirect: "manual",
      headers: {
        "user-agent": "cloudflare-preview-diagnostics",
      },
      signal: AbortSignal.timeout(30000),
    });
    const bodyText = await response.text();
    const durationMs = Math.round(performance.now() - startedAt);
    const failureKind = getRouteFailureKind(response.status);

    return {
      pathname,
      status: response.status,
      ok: failureKind === null,
      ...(failureKind ? { failureKind } : {}),
      durationMs,
      bodySnippet: createBodySnippet(bodyText),
    };
  } catch (error) {
    const durationMs = Math.round(performance.now() - startedAt);
    const message = error instanceof Error ? error.message : String(error);

    return {
      pathname,
      status: null,
      ok: false,
      failureKind: "fetch-error",
      durationMs,
      bodySnippet: createBodySnippet(message),
    };
  }
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const args = parsePreviewDiagnosticArgs(process.argv);
  const routes = [];

  for (const pathname of DEFAULT_PREVIEW_DIAGNOSTIC_ROUTES) {
    routes.push(await probePreviewRoute({ baseUrl: args.baseUrl, pathname }));
  }

  const report = buildPreviewDiagnosticReport({
    checkedAt: new Date().toISOString(),
    baseUrl: args.baseUrl,
    routes,
  });
  await writeJson(args.output, report);

  const classification = classifyPreviewDiagnosticReport(report);
  if (!classification.ok) {
    console.error(
      `[preview-smoke-diagnostics] failed routes: ${classification.failedRoutes.join(", ")}`,
    );
    process.exit(1);
  }

  console.log("[preview-smoke-diagnostics] all routes returned 2xx");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error("[preview-smoke-diagnostics] unexpected error:", error);
    process.exit(1);
  });
}
