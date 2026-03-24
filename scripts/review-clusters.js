#!/usr/bin/env node

const { execSync } = require("child_process");

const CLUSTERS = [
  {
    name: "Translation critical quartet",
    recommendedReview: "Inspect all four translation runtime bundles together",
    files: [
      "messages/en.json",
      "messages/zh.json",
      "messages/en/critical.json",
      "messages/zh/critical.json",
    ],
  },
  {
    name: "Lead API family",
    recommendedReview:
      "Inspect sibling routes for contract/validation/rate-limit drift",
    files: [
      "src/app/api/contact/route.ts",
      "src/app/api/inquiry/route.ts",
      "src/app/api/subscribe/route.ts",
    ],
  },
  {
    name: "Homepage section cluster",
    recommendedReview:
      "Inspect adjacent homepage sections for rhythm/proof/CTA drift",
    files: [
      "src/components/sections/hero-section.tsx",
      "src/components/sections/products-section.tsx",
      "src/components/sections/final-cta.tsx",
      "src/components/sections/sample-cta.tsx",
      "src/components/sections/resources-section.tsx",
      "src/components/sections/scenarios-section.tsx",
    ],
  },
];

function normalize(file) {
  return file.trim().replace(/^\.\//, "");
}

function parseInputFiles() {
  const args = process.argv.slice(2);
  const staged = args.includes("--staged");
  const files = args.filter((arg) => !arg.startsWith("--")).map(normalize);
  return { staged, files };
}

function collectChangedFiles(mode) {
  const command =
    mode === "staged"
      ? "git diff --cached --name-only --diff-filter=ACMRD"
      : "git diff --name-only HEAD";
  const files = execSync(command, { encoding: "utf8" })
    .split("\n")
    .map(normalize)
    .filter(Boolean);
  // In clean CI checkouts git diff HEAD returns nothing;
  // fall back to comparing against the merge-base with main.
  if (files.length === 0 && mode !== "staged") {
    try {
      const base = execSync("git merge-base HEAD origin/main", {
        encoding: "utf8",
      }).trim();
      return execSync(`git diff --name-only ${base}`, { encoding: "utf8" })
        .split("\n")
        .map(normalize)
        .filter(Boolean);
    } catch {
      return files;
    }
  }
  return files;
}

function main() {
  const { staged, files } = parseInputFiles();
  const targets =
    files.length > 0 ? files : collectChangedFiles(staged ? "staged" : "head");

  if (targets.length === 0) {
    console.log("No changed files detected.");
    process.exit(0);
  }

  console.log("Structural change cluster scan");
  console.log("=============================");

  let hitCount = 0;
  for (const cluster of CLUSTERS) {
    const matched = cluster.files.filter((file) => targets.includes(file));
    if (matched.length === 0) continue;
    hitCount += 1;
    console.log(`Cluster: ${cluster.name}`);
    console.log(`Recommended review: ${cluster.recommendedReview}`);
    console.log("Matched files:");
    for (const file of matched) {
      console.log(`- ${file}`);
    }
    console.log("Related cluster files:");
    for (const file of cluster.files) {
      if (!matched.includes(file)) console.log(`- ${file}`);
    }
    console.log("");
  }

  if (hitCount === 0) {
    console.log("No known structural clusters matched.");
  } else {
    console.log("Reference doc: docs/guides/STRUCTURAL-CHANGE-CLUSTERS.md");
  }
}

main();
