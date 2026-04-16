import { URL } from "node:url";
import runtimeEnv from "../lib/runtime-env.js";

const DEFAULT_BASE_URL =
  runtimeEnv.readEnvString("DEPLOY_SMOKE_BASE_URL") || "";
const REQUEST_TIMEOUT_MS = 30000;
const REQUEST_RETRIES = 2;

function parseArgs(argv) {
  const args = {
    baseUrl: DEFAULT_BASE_URL,
    headerName: runtimeEnv.readEnvString("DEPLOY_SMOKE_HEADER_NAME") || "",
    headerValue: runtimeEnv.readEnvString("DEPLOY_SMOKE_HEADER_VALUE") || "",
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--") {
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

function buildHeaders(headerName, headerValue) {
  const headers = {
    "user-agent": "post-deploy-smoke",
  };

  if (headerName && headerValue) {
    headers[headerName] = headerValue;
  }

  return headers;
}

async function request(baseUrl, pathname, headers) {
  const url = new URL(pathname, baseUrl);

  let lastError;

  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      return {
        pathname,
        status: response.status,
        location: response.headers.get("location"),
        body: await response.text(),
      };
    } catch (error) {
      lastError = error;
      if (!isRetriableFetchError(error) || attempt === REQUEST_RETRIES) {
        throw error;
      }
    }
  }

  throw lastError;
}

function isRetriableFetchError(error) {
  return (
    error instanceof Error &&
    "cause" in error &&
    typeof error.cause === "object" &&
    error.cause !== null &&
    "code" in error.cause &&
    error.cause.code === "UND_ERR_CONNECT_TIMEOUT"
  );
}

function assert(condition, message, failures) {
  if (!condition) {
    failures.push(message);
  }
}

async function main() {
  const { baseUrl, headerName, headerValue } = parseArgs(process.argv);
  const headers = buildHeaders(headerName, headerValue);
  const failures = [];

  console.log(`[post-deploy-smoke] Probing ${baseUrl}`);

  const rootResponse = await request(baseUrl, "/", headers);
  const invalidLocaleResponse = await request(
    baseUrl,
    "/invalid/contact",
    headers,
  );
  const pages = await Promise.all([
    request(baseUrl, "/en", headers),
    request(baseUrl, "/zh", headers),
    request(baseUrl, "/api/health", headers),
    request(baseUrl, "/en/contact", headers),
    request(baseUrl, "/zh/contact", headers),
  ]);

  assert(
    [200, 307, 308].includes(rootResponse.status),
    `Expected / to return 200/307/308, got ${rootResponse.status}`,
    failures,
  );

  if ([307, 308].includes(rootResponse.status)) {
    assert(
      rootResponse.location === "/en",
      `Expected / redirect location to be /en, got ${rootResponse.location ?? "(missing)"}`,
      failures,
    );
  }

  assert(
    [307, 308].includes(invalidLocaleResponse.status),
    `Expected /invalid/contact to redirect, got ${invalidLocaleResponse.status}`,
    failures,
  );
  assert(
    invalidLocaleResponse.location === "/en/contact",
    `Expected /invalid/contact redirect location to be /en/contact, got ${invalidLocaleResponse.location ?? "(missing)"}`,
    failures,
  );

  for (const response of pages) {
    assert(
      response.status === 200,
      `Expected ${response.pathname} to return 200, got ${response.status}`,
      failures,
    );
  }

  if (failures.length > 0) {
    console.error("[post-deploy-smoke] Failures detected:");
    for (const failure of failures) {
      console.error(`  - ${failure}`);
    }
    process.exit(1);
  }

  console.log("[post-deploy-smoke] All checks passed");
}

main().catch((error) => {
  console.error("[post-deploy-smoke] Unexpected error:", error);
  process.exit(1);
});
