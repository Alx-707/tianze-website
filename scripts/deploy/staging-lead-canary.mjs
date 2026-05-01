import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_OUTPUT = "reports/deploy/staging-lead-canary.json";

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
      reason: "Missing --base-url; dry-run mode does not submit data",
    };
  }

  if (mode === "dry-run") {
    return {
      shouldSubmit: false,
      ok: true,
      status: "skipped",
      reason: "dry-run mode does not submit data",
    };
  }

  return {
    shouldSubmit: true,
    ok: true,
    status: "pending",
    reason: "ready to submit staging canary",
  };
}

export function buildCanaryPayload({ reference, checkedAt, turnstileToken }) {
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
    checkedAt,
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
  };
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

  return {
    responseStatus: response.status,
    responseBodySnippet: (await response.text()).slice(0, 500),
    ok: response.status >= 200 && response.status < 300,
  };
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
        checkedAt,
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
      reason: result.ok
        ? "staging canary accepted by inquiry API"
        : "inquiry API rejected staging canary",
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[staging-lead-canary] unexpected error:", error);
    process.exit(1);
  });
}
