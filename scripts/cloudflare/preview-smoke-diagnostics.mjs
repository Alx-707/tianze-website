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
const ROUTES = ["/", "/en", "/zh", "/en/contact", "/zh/contact", "/api/health"];

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

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    output: DEFAULT_OUTPUT,
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

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function probeRoute(baseUrl, pathname) {
  const startedAt = performance.now();

  try {
    const response = await fetch(new URL(pathname, baseUrl), {
      redirect: "manual",
      headers: {
        "user-agent": "cloudflare-preview-diagnostics",
      },
      signal: AbortSignal.timeout(30000),
    });
    const bodyText = await response.text();
    const durationMs = Math.round(performance.now() - startedAt);

    return {
      pathname,
      status: response.status,
      ok: response.status >= 200 && response.status < 500,
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
  const args = parseArgs(process.argv);
  const routes = [];

  for (const pathname of ROUTES) {
    routes.push(await probeRoute(args.baseUrl, pathname));
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

  console.log("[preview-smoke-diagnostics] all routes returned <500");
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
