#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const checks = [
  {
    file: "open-next.config.ts",
    label:
      "OpenNext config stays anchored to the Cloudflare adapter and lead split",
    requiredSnippets: [
      "defineCloudflareConfig",
      '"app/api/inquiry/route"',
      '"app/api/subscribe/route"',
      '"app/api/verify-turnstile/route"',
      '"app/api/health/route"',
    ],
    forbiddenSnippets: [
      "r2IncrementalCache",
      "doQueue",
      "d1NextTagCache",
      "apiOps",
      "/api/cache/invalidate",
    ],
  },
  {
    file: "wrangler.jsonc",
    label: "Wrangler config keeps the static-generation Cloudflare baseline",
    requiredSnippets: ['".open-next/worker.js"', '"ASSETS"'],
    forbiddenSnippets: [
      '"WORKER_SELF_REFERENCE"',
      '"NEXT_INC_CACHE_R2_BUCKET"',
      '"NEXT_TAG_CACHE_D1"',
      '"NEXT_CACHE_DO_QUEUE"',
      '"durable_objects"',
      '"r2_buckets"',
      '"d1_databases"',
    ],
  },
];

const packageJson = JSON.parse(read("package.json"));
const scripts = packageJson.scripts ?? {};

const deployScriptChecks = [
  {
    name: "deploy:cf",
    expected: "pnpm deploy:cf:phase6:production",
  },
  {
    name: "deploy:cf:preview",
    expected: "pnpm deploy:cf:phase6:preview",
  },
  {
    name: "deploy:cf:dry-run",
    expected: "pnpm deploy:cf:phase6:dry-run",
  },
  {
    name: "preview:cf:wrangler",
    expected: "legacy-entrypoint-guard.mjs",
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
  const forbidden = check.forbiddenSnippets.filter((snippet) =>
    content.includes(snippet),
  );

  if (missing.length > 0 || forbidden.length > 0) {
    failures.push({
      file: check.file,
      label: check.label,
      missing,
      forbidden,
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
      forbidden: [],
    });
  }
}

for (const check of deployScriptChecks) {
  const script = scripts[check.name];
  if (typeof script !== "string" || !script.includes(check.expected)) {
    failures.push({
      file: "package.json",
      label: "legacy Cloudflare deploy entrypoints must not bypass phase6",
      missing: [`${check.name}: ${check.expected}`],
      forbidden: [],
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
    for (const snippet of failure.forbidden) {
      console.error(`  - forbidden snippet still present: ${snippet}`);
    }
  }
  process.exit(1);
}

console.log("cf-official-compare: passed");
console.log(
  "Verified static-generation Cloudflare baseline against open-next.config.ts and wrangler.jsonc.",
);
