import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_PATH = "reports/cloudflare-proxy/proof-artifact.json";
const REPORT_DIR = dirname(OUTPUT_PATH);

const COMMANDS = [
  { name: "next-build", command: "pnpm", args: ["build"] },
  { name: "cloudflare-build", command: "pnpm", args: ["build:cf"] },
  { name: "cf-preview-smoke", command: "pnpm", args: ["smoke:cf:preview"] },
  {
    name: "cf-preview-smoke-strict",
    command: "pnpm",
    args: ["smoke:cf:preview:strict"],
  },
];

async function runCommand(step) {
  await mkdir(REPORT_DIR, { recursive: true });
  const logPath = `${REPORT_DIR}/${step.name}.log`;

  return new Promise((resolve) => {
    let settled = false;
    const child = spawn(step.command, step.args, {
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
      process.stderr.write(chunk);
    });

    const settle = async (exitCode, extraOutput = "") => {
      if (settled) {
        return;
      }

      settled = true;
      output += extraOutput;
      await writeFile(logPath, output);
      resolve({
        name: step.name,
        exitCode,
        logPath,
      });
    };

    child.on("error", (error) => {
      output += `${error.stack ?? error.message}\n`;
      void settle(1);
    });

    child.on("close", (code) => {
      void settle(code ?? 1);
    });
  });
}

async function main() {
  const steps = [];

  for (const command of COMMANDS) {
    const result = await runCommand(command);
    steps.push(result);
    if (result.exitCode !== 0) {
      break;
    }
  }

  const artifact = {
    subject: "src/proxy.ts",
    checkedAt: new Date().toISOString(),
    steps,
  };

  await mkdir(REPORT_DIR, { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(artifact, null, 2)}\n`);

  if (steps.some((step) => step.exitCode !== 0)) {
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("[run-proxy-proof] unexpected error:", error);
    process.exit(1);
  });
}
