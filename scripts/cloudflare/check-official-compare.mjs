#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const checks = [
  {
    file: "open-next.config.ts",
    label: "OpenNext config stays anchored to the official Cloudflare adapter",
    requiredSnippets: [
      "defineCloudflareConfig",
      "r2IncrementalCache",
      "doQueue",
      "d1NextTagCache",
    ],
  },
  {
    file: "wrangler.jsonc",
    label: "Wrangler config keeps the official Cloudflare baseline bindings",
    requiredSnippets: [
      '".open-next/worker.js"',
      '"ASSETS"',
      '"WORKER_SELF_REFERENCE"',
      '"NEXT_INC_CACHE_R2_BUCKET"',
      '"NEXT_TAG_CACHE_D1"',
      '"NEXT_CACHE_DO_QUEUE"',
    ],
  },
];

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function getDeclaredSplitRoutes() {
  const configSource = read("open-next.config.ts");
  const matches = configSource.match(/"app\/api\/[^"]+\/route"/g) ?? [];
  return matches.map((value) => value.slice(1, -1));
}

const failures = [];

for (const check of checks) {
  const content = read(check.file);
  const missing = check.requiredSnippets.filter(
    (snippet) => !content.includes(snippet),
  );

  if (missing.length > 0) {
    failures.push({
      file: check.file,
      label: check.label,
      missing,
    });
  }
}

for (const route of getDeclaredSplitRoutes()) {
  const sourcePath = path.join(ROOT, "src", `${route}.ts`);
  if (!fs.existsSync(sourcePath)) {
    failures.push({
      file: "open-next.config.ts",
      label: "split function route must resolve to a real source file",
      missing: [route],
    });
  }
}

if (failures.length > 0) {
  console.error("cf-official-compare: failed");
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.label}`);
    for (const snippet of failure.missing) {
      console.error(`  - missing snippet: ${snippet}`);
    }
  }
  process.exit(1);
}

console.log("cf-official-compare: passed");
console.log(
  "Verified official Cloudflare baseline primitives against open-next.config.ts and wrangler.jsonc.",
);
