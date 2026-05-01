import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DEFAULT_ARTIFACT_PATH = "reports/cloudflare-proxy/proof-artifact.json";
const NEXT_BUILD_STEP_NAMES = new Set(["next-build", "cloudflare-build"]);

export function readProxyProofArtifact(rawJson) {
  const parsed = JSON.parse(rawJson);
  return {
    subject: parsed.subject,
    steps: parsed.steps,
  };
}

export function parseBuildWarnings(logText) {
  const warnings = [];
  const middlewareDeprecatedPattern =
    /middleware file convention is deprecated|middleware.*deprecated.*proxy|please use proxy/i;

  if (middlewareDeprecatedPattern.test(logText)) {
    warnings.push("middleware-deprecated");
  }

  return warnings;
}

export function classifyProxyProof({ subject: _subject, steps, warnings }) {
  const blockers = steps
    .filter((step) => step.exitCode !== 0)
    .map((step) => `${step.name} failed with exit code ${step.exitCode}`);

  return {
    ok: blockers.length === 0,
    recommendation:
      blockers.length === 0 ? "proxy-compatible" : "keep-middleware",
    blockers,
    warnings,
  };
}

async function readStepLog(step) {
  if (!NEXT_BUILD_STEP_NAMES.has(step.name)) {
    return "";
  }

  return readFile(step.logPath, "utf8").catch(() => "");
}

async function main() {
  const artifactPath = process.argv[2] ?? DEFAULT_ARTIFACT_PATH;
  const artifact = readProxyProofArtifact(await readFile(artifactPath, "utf8"));
  const logText = (await Promise.all(artifact.steps.map(readStepLog))).join(
    "\n",
  );
  const result = classifyProxyProof({
    ...artifact,
    warnings: parseBuildWarnings(logText),
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[proxy-proof-check] unexpected error:", error);
    process.exit(1);
  });
}
