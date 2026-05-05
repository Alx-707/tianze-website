import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_OUTPUT = "reports/deploy/staging-lead-canary.json";
const DRY_RUN_REASON =
  "dry-run generates and records the intended product inquiry payload shape without submitting data";
const NON_STAGING_URL_REASON =
  "Refusing to submit staging canary to a non-staging URL; use localhost, 127.0.0.1, *.vercel.app, or a preview/staging host";
const INQUIRY_SUCCESS_REASON = "staging canary accepted by inquiry API";
const INQUIRY_FAILURE_REASON =
  "inquiry API did not report success for staging canary";
const RESPONSE_BODY_SNIPPET_LENGTH = 500;
const PROOF_BOUNDARY =
  "staging-non-production; not production deployed lead proof";

export function parseLeadCanaryArgs(argv) {
  const args = {
    baseUrl: "",
    mode: "dry-run",
    output: DEFAULT_OUTPUT,
    reference: "",
    turnstileToken: "",
    idempotencyKey: "",
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
    if (arg === "--mode" && index + 1 < argv.length) {
      args.mode = argv[++index];
      continue;
    }
    if (arg === "--output" && index + 1 < argv.length) {
      args.output = argv[++index];
      continue;
    }
    if (arg === "--reference" && index + 1 < argv.length) {
      args.reference = argv[++index];
      continue;
    }
    if (arg === "--turnstile-token" && index + 1 < argv.length) {
      args.turnstileToken = argv[++index];
      continue;
    }
    if (arg === "--idempotency-key" && index + 1 < argv.length) {
      args.idempotencyKey = argv[++index];
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!["dry-run", "submit", "strict"].includes(args.mode)) {
    throw new Error(`Invalid --mode: ${args.mode}`);
  }

  return args;
}

export function classifyCanaryMode({
  baseUrl,
  mode,
  turnstileToken,
  idempotencyKey,
}) {
  if (mode !== "dry-run" && (!turnstileToken || !idempotencyKey)) {
    return {
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason:
        "submit mode requires --turnstile-token and --idempotency-key for the current /api/inquiry contract",
    };
  }

  if (!baseUrl && mode === "strict") {
    return {
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason: "Missing --base-url for strict staging canary",
    };
  }

  if (!baseUrl) {
    return {
      shouldSubmit: false,
      ok: true,
      status: "skipped",
      reason: DRY_RUN_REASON,
    };
  }

  if (mode === "dry-run") {
    return {
      shouldSubmit: false,
      ok: true,
      status: "skipped",
      reason: DRY_RUN_REASON,
    };
  }

  if (!isAllowedStagingBaseUrl(baseUrl)) {
    return {
      shouldSubmit: false,
      ok: false,
      status: "failed",
      reason: NON_STAGING_URL_REASON,
    };
  }

  return {
    shouldSubmit: true,
    ok: true,
    status: "pending",
    reason: "ready to submit staging canary",
  };
}

export function buildCanaryPayload({ reference, turnstileToken }) {
  const marker = reference || "manual";
  return {
    fullName: "Staging Canary",
    email: "staging-canary@example.invalid",
    company: "Tianze Preview Proof",
    productSlug: "pvc-conduit-fittings",
    productName: "PVC Conduit Fittings",
    quantity: "1 carton",
    requirements: `[staging-canary ${marker}] This is an automated non-production lead proof.`,
    marketingConsent: false,
    turnstileToken,
  };
}

export function buildLeadCanaryReport(input) {
  return {
    tool: "staging-lead-canary",
    checkedAt: input.checkedAt,
    baseUrl: input.baseUrl,
    mode: input.mode,
    reference: input.reference,
    status: input.status,
    ok: input.ok,
    reason: input.reason,
    responseStatus: input.responseStatus,
    responseBodySnippet: input.responseBodySnippet,
    proofBoundary: PROOF_BOUNDARY,
  };
}

export function classifyInquiryResponse(status, bodyText) {
  let parsedBody;
  try {
    parsedBody = JSON.parse(bodyText);
  } catch {
    return {
      responseStatus: status,
      responseBodySnippet: bodyText.slice(0, RESPONSE_BODY_SNIPPET_LENGTH),
      ok: false,
      reason: "inquiry API returned non-JSON response for staging canary",
    };
  }

  const ok = status >= 200 && status < 300 && parsedBody?.success === true;
  return {
    responseStatus: status,
    responseBodySnippet: bodyText.slice(0, RESPONSE_BODY_SNIPPET_LENGTH),
    ok,
    reason: ok ? INQUIRY_SUCCESS_REASON : INQUIRY_FAILURE_REASON,
  };
}

function isAllowedStagingBaseUrl(baseUrl) {
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app") ||
    hostname.includes("preview") ||
    hostname.includes("staging")
  );
}

async function submitLead({ baseUrl, payload, idempotencyKey }) {
  const response = await fetch(new URL("/api/inquiry", baseUrl), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "user-agent": "staging-lead-canary",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  });
  const bodyText = await response.text();

  return classifyInquiryResponse(response.status, bodyText);
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const args = parseLeadCanaryArgs(process.argv);
  const checkedAt = new Date().toISOString();
  const classification = classifyCanaryMode(args);

  let report;
  if (!classification.shouldSubmit) {
    report = buildLeadCanaryReport({
      checkedAt,
      baseUrl: args.baseUrl,
      mode: args.mode,
      reference: args.reference,
      status: classification.status,
      ok: classification.ok,
      reason: classification.reason,
      responseStatus: null,
      responseBodySnippet: "",
    });
  } else {
    const result = await submitLead({
      baseUrl: args.baseUrl,
      payload: buildCanaryPayload({
        reference: args.reference,
        turnstileToken: args.turnstileToken,
      }),
      idempotencyKey: args.idempotencyKey,
    });
    report = buildLeadCanaryReport({
      checkedAt,
      baseUrl: args.baseUrl,
      mode: args.mode,
      reference: args.reference,
      status: result.ok ? "submitted" : "failed",
      ok: result.ok,
      reason: result.reason,
      responseStatus: result.responseStatus,
      responseBodySnippet: result.responseBodySnippet,
    });
  }

  await writeJson(args.output, report);

  if (!report.ok) {
    console.error(`[staging-lead-canary] ${report.reason}`);
    process.exit(1);
  }

  console.log(`[staging-lead-canary] ${report.status}: ${report.reason}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error("[staging-lead-canary] unexpected error:", error);
    process.exit(1);
  });
}
