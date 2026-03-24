#!/usr/bin/env node

const { execSync } = require("child_process");

const CLUSTERS = {
  "translation-quartet": {
    label: "translation quartet",
    pattern:
      /^(messages\/en\.json|messages\/zh\.json|messages\/en\/critical\.json|messages\/zh\/critical\.json)$/,
    command: "pnpm review:translation-quartet",
  },
  "lead-family": {
    label: "lead API family",
    pattern: /^src\/app\/api\/(contact|inquiry|subscribe)\//,
    command: "pnpm review:lead-family",
  },
  "homepage-sections": {
    label: "homepage sections cluster",
    pattern:
      /^src\/components\/sections\/(hero-section|products-section|final-cta|sample-cta|resources-section|scenarios-section)\.tsx$/,
    command: "pnpm review:homepage-sections",
  },
  "locale-runtime": {
    label: "locale runtime surface",
    pattern:
      /^(src\/middleware\.ts|src\/i18n\/|src\/lib\/load-messages\.ts|src\/app\/\[locale\]\/layout\.tsx|src\/app\/\[locale\]\/head\.tsx|src\/app\/global-error\.tsx)$/,
    command: "pnpm review:locale-runtime",
  },
  "cache-health": {
    label: "cache invalidation + health signals",
    pattern:
      /^(src\/app\/api\/cache\/invalidate\/|src\/lib\/cache\/|src\/app\/api\/health\/route\.ts)$/,
    command: "pnpm review:cache-health",
  },
};

function getStagedFiles() {
  return execSync("git diff --cached --name-only --diff-filter=ACM", {
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function main() {
  const [clusterName, mode] = process.argv.slice(2);

  if (!clusterName || !CLUSTERS[clusterName]) {
    console.error(
      `Unknown cluster. Expected one of: ${Object.keys(CLUSTERS).join(", ")}`,
    );
    process.exit(1);
  }

  const cluster = CLUSTERS[clusterName];
  const stagedOnly = mode === "--staged";

  if (stagedOnly) {
    const files = getStagedFiles();
    const matched = files.filter((file) => cluster.pattern.test(file));
    if (matched.length === 0) {
      console.log(
        `Skipping ${cluster.label} review (no matching staged changes)`,
      );
      process.exit(0);
    }
  }

  console.log(`Running ${cluster.label} review...`);
  execSync(cluster.command, { stdio: "inherit" });
}

main();
