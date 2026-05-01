import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const DEFAULT_ARTIFACT_PATH = "reports/cloudflare-proxy/proof-artifact.json";
const REQUIRED_STEP_NAMES = [
  "next-build",
  "cloudflare-build",
  "cf-preview-smoke",
  "cf-preview-smoke-strict",
];
const REQUIRED_STEP_NAME_SET = new Set(REQUIRED_STEP_NAMES);
const NEXT_BUILD_STEP_NAMES = new Set(["next-build", "cloudflare-build"]);
const PROXY_PROOF_SUBJECT = "src/proxy.ts";
const MIDDLEWARE_ENTRY_PATH = "src/middleware.ts";

/**
 * @typedef {{ name: string; exitCode: number; logPath: string }} ProxyProofStep
 * @typedef {{
 *   subject: string;
 *   steps: ProxyProofStep[];
 *   artifactBlockers: string[];
 * }} ProxyProofArtifact
 * @typedef {{ proxyExists: boolean; middlewareExists: boolean }} ProofFileState
 */

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** @returns {{ step: ProxyProofStep | null; blockers: string[] }} */
function validateStep(step, index) {
  const blockers = [];

  if (!isObject(step)) {
    return {
      step: null,
      blockers: [`artifact.steps[${index}] must be an object`],
    };
  }

  if (typeof step.name !== "string") {
    blockers.push(`artifact.steps[${index}].name must be a string`);
  }

  if (typeof step.exitCode !== "number") {
    blockers.push(`artifact.steps[${index}].exitCode must be a number`);
  }

  if (typeof step.logPath !== "string") {
    blockers.push(`artifact.steps[${index}].logPath must be a string`);
  }

  if (blockers.length > 0) {
    return { step: null, blockers };
  }

  return {
    step: {
      name: step.name,
      exitCode: step.exitCode,
      logPath: step.logPath,
    },
    blockers: [],
  };
}

/** @returns {ProxyProofArtifact} */
export function readProxyProofArtifact(rawJson) {
  let parsed;
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      subject: "",
      steps: [],
      artifactBlockers: [`artifact JSON is invalid: ${message}`],
    };
  }

  if (!isObject(parsed)) {
    return {
      subject: "",
      steps: [],
      artifactBlockers: ["artifact must be an object"],
    };
  }

  const artifactBlockers = [];

  if (typeof parsed.subject !== "string") {
    artifactBlockers.push("artifact.subject must be a string");
  }

  if (!Array.isArray(parsed.steps)) {
    artifactBlockers.push("artifact.steps must be an array");

    return {
      subject: typeof parsed.subject === "string" ? parsed.subject : "",
      steps: [],
      artifactBlockers,
    };
  }

  const validatedSteps = parsed.steps.map(validateStep);

  return {
    subject: typeof parsed.subject === "string" ? parsed.subject : "",
    steps: validatedSteps
      .map((result) => result.step)
      .filter((step) => step !== null),
    artifactBlockers: [
      ...artifactBlockers,
      ...validatedSteps.flatMap((result) => result.blockers),
    ],
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

export function classifyFileState({ subject, proxyExists, middlewareExists }) {
  const blockers = [];

  if (subject !== PROXY_PROOF_SUBJECT) {
    blockers.push(
      `proof subject must be "${PROXY_PROOF_SUBJECT}", got "${String(subject)}"`,
    );
  }

  if (!proxyExists) {
    blockers.push(`${PROXY_PROOF_SUBJECT} is missing in the proof worktree`);
  }

  if (middlewareExists) {
    blockers.push(
      `${MIDDLEWARE_ENTRY_PATH} is still present in the proof worktree`,
    );
  }

  return { blockers };
}

function classifyProofSteps(steps) {
  const blockers = [];
  const stepCounts = new Map();

  for (const step of steps) {
    stepCounts.set(step.name, (stepCounts.get(step.name) ?? 0) + 1);

    if (!REQUIRED_STEP_NAME_SET.has(step.name)) {
      blockers.push(`unknown proof step: ${step.name}`);
    }
  }

  for (const requiredStepName of REQUIRED_STEP_NAMES) {
    if (!stepCounts.has(requiredStepName)) {
      blockers.push(`missing required proof step: ${requiredStepName}`);
    }
  }

  for (const [stepName, count] of stepCounts.entries()) {
    if (count > 1) {
      blockers.push(`duplicate proof step: ${stepName}`);
    }
  }

  return blockers;
}

/**
 * @param {{
 *   subject: string;
 *   steps: ProxyProofStep[];
 *   warnings: string[];
 *   fileState?: ProofFileState;
 *   artifactBlockers?: string[];
 * }} proof
 */
export function classifyProxyProof({
  subject,
  steps,
  warnings,
  fileState,
  artifactBlockers = [],
}) {
  const proofSteps = Array.isArray(steps) ? steps : [];
  const commandBlockers = proofSteps
    .filter((step) => step.exitCode !== 0)
    .map((step) => `${step.name} failed with exit code ${step.exitCode}`);
  const fileStateBlockers = fileState
    ? classifyFileState({ subject, ...fileState }).blockers
    : ["proof worktree file state was not checked"];
  const blockers = [
    ...artifactBlockers,
    ...fileStateBlockers,
    ...classifyProofSteps(proofSteps),
    ...commandBlockers,
  ];

  return {
    ok: blockers.length === 0,
    recommendation:
      blockers.length === 0 ? "proxy-compatible" : "keep-middleware",
    blockers,
    warnings,
  };
}

async function pathExists(path) {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

async function readProofFileState() {
  const [proxyExists, middlewareExists] = await Promise.all([
    pathExists(PROXY_PROOF_SUBJECT),
    pathExists(MIDDLEWARE_ENTRY_PATH),
  ]);

  return { proxyExists, middlewareExists };
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
    fileState: await readProofFileState(),
    warnings: parseBuildWarnings(logText),
  });

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.log(
      JSON.stringify(
        {
          ok: false,
          recommendation: "keep-middleware",
          blockers: [`proxy proof check failed: ${message}`],
          warnings: [],
        },
        null,
        2,
      ),
    );
    process.exit(1);
  });
}
