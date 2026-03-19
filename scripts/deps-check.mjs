import { spawnSync } from "node:child_process";

const checks = [
  ["outdated", ["outdated", "--long"]],
  ["audit", ["audit", "--prod", "--audit-level", "moderate"]],
];

let exitCode = 0;

for (const [label, args] of checks) {
  console.log(`\n=== pnpm ${label} ===`);
  const result = spawnSync("pnpm", args, {
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    exitCode = 1;
    continue;
  }

  if (result.signal) {
    console.error(`pnpm ${label} terminated by signal ${result.signal}`);
    exitCode = 1;
    continue;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    exitCode = Math.max(exitCode, result.status);
  }
}

process.exit(exitCode);
