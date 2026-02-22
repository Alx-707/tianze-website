import { spawnSync } from "node:child_process";
import { access } from "node:fs/promises";
import path from "node:path";

const ROOT_DIR = process.cwd();
const CONFIG_DIR = path.join(ROOT_DIR, ".open-next", "wrangler", "phase6");

const deploymentOrder = [
  "web.jsonc",
  "api-lead.jsonc",
  "api-ops.jsonc",
  "api-whatsapp.jsonc",
  "gateway.jsonc",
];

// --- CLI argument parsing ---

const VALID_ENVS = new Set(["preview", "production"]);
const VALID_CONFIGS = new Set(deploymentOrder);

function parseArgs(argv) {
  const args = { env: null, only: null, dryRun: false };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--env" && i + 1 < argv.length) {
      args.env = argv[++i];
    } else if (arg === "--only" && i + 1 < argv.length) {
      args.only = argv[++i];
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else {
      console.error(`[phase6] unknown argument: ${arg}`);
      printUsage();
      process.exit(1);
    }
  }

  return args;
}

function printUsage() {
  console.error(
    "Usage: node deploy-phase6.mjs --env <preview|production> [--only <config>] [--dry-run]",
  );
}

const args = parseArgs(process.argv);

if (!args.env) {
  console.error(
    "[phase6] --env is required (no default to prevent wrong-env deploy)",
  );
  printUsage();
  process.exit(1);
}

if (!VALID_ENVS.has(args.env)) {
  console.error(
    `[phase6] invalid env "${args.env}", expected: preview | production`,
  );
  process.exit(1);
}

if (args.only) {
  // Allow both "gateway" and "gateway.jsonc"
  const normalized = args.only.endsWith(".jsonc")
    ? args.only
    : `${args.only}.jsonc`;
  if (!VALID_CONFIGS.has(normalized)) {
    console.error(`[phase6] invalid --only target "${args.only}"`);
    console.error(`[phase6] valid targets: ${[...VALID_CONFIGS].join(", ")}`);
    process.exit(1);
  }
  args.only = normalized;
}

const targetEnv = args.env;
const configsToDeployList = args.only ? [args.only] : deploymentOrder;

// --- Preflight checks ---

function checkAuth() {
  console.log("[phase6] preflight: checking wrangler authentication...");
  const result = spawnSync("pnpm", ["exec", "wrangler", "whoami"], {
    cwd: ROOT_DIR,
    stdio: "pipe",
    encoding: "utf8",
  });

  if (result.status !== 0) {
    console.error("[phase6] wrangler is not authenticated.");
    console.error(
      "[phase6] set CLOUDFLARE_API_TOKEN or run: pnpm exec wrangler login",
    );
    process.exit(1);
  }

  // Print account info for audit trail
  const output = (result.stdout ?? "").trim();
  const accountLine = output
    .split("\n")
    .find((line) => line.includes("Account ID"));
  if (accountLine) {
    console.log(`[phase6] ${accountLine.trim()}`);
  }
}

function printWranglerVersion() {
  const result = spawnSync("pnpm", ["exec", "wrangler", "--version"], {
    cwd: ROOT_DIR,
    stdio: "pipe",
    encoding: "utf8",
  });
  const version = (result.stdout ?? "").trim().split("\n")[0];
  console.log(`[phase6] wrangler version: ${version}`);
}

async function ensureConfigs() {
  for (const file of configsToDeployList) {
    const fullPath = path.join(CONFIG_DIR, file);
    try {
      await access(fullPath);
    } catch {
      console.error(
        `[phase6] missing config: ${path.relative(ROOT_DIR, fullPath)}`,
      );
      console.error("[phase6] run `pnpm build:cf:phase6` first.");
      process.exit(1);
    }
  }
}

// --- Deployment ---

function runDeploy(configFile) {
  const fullPath = path.join(CONFIG_DIR, configFile);
  const commandArgs = [
    "exec",
    "wrangler",
    "deploy",
    "--config",
    fullPath,
    "--env",
    targetEnv,
  ];
  const printable = `pnpm exec wrangler deploy --config ${path.relative(ROOT_DIR, fullPath)} --env ${targetEnv}`;

  if (args.dryRun) {
    console.log(`[phase6][dry-run] ${printable}`);
    return;
  }

  console.log(`[phase6] deploying ${configFile} (${targetEnv})`);
  const result = spawnSync("pnpm", commandArgs, {
    cwd: ROOT_DIR,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(`[phase6] deployment failed for ${configFile}`);
    process.exit(result.status ?? 1);
  }
}

// --- Main ---

if (!args.dryRun) {
  checkAuth();
}
printWranglerVersion();
await ensureConfigs();

console.log(
  `[phase6] deploying ${configsToDeployList.length} worker(s) to ${targetEnv}`,
);

for (const file of configsToDeployList) {
  runDeploy(file);
}

if (args.dryRun) {
  console.log("[phase6] dry-run complete");
} else {
  console.log("[phase6] deployment complete");
}
