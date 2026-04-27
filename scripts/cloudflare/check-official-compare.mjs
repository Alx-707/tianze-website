#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PHASE6_CONFIG_DIR = path.join(ROOT, ".open-next", "wrangler", "phase6");
const REQUIRE_GENERATED_CONFIG = process.argv.includes("--require-generated");
const generatedConfigForbiddenSnippets = [
  '"WORKER_SELF_REFERENCE"',
  '"NEXT_INC_CACHE_R2_BUCKET"',
  '"NEXT_TAG_CACHE_D1"',
  '"NEXT_CACHE_DO_QUEUE"',
  '"durable_objects"',
  '"r2_buckets"',
  '"d1_databases"',
  '"migrations"',
];

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
      { match: "apiOps", type: "quoted" },
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
      '"migrations"',
    ],
  },
];

const packageJson = JSON.parse(read("package.json"));
const scripts = packageJson.scripts ?? {};

const deployScriptChecks = [
  {
    name: "deploy:cf",
    expected: "pnpm deploy:cf:phase6:production",
    mode: "startsWith",
  },
  {
    name: "deploy:cf:preview",
    expected: "pnpm deploy:cf:phase6:preview",
    mode: "startsWith",
  },
  {
    name: "deploy:cf:dry-run",
    expected: "pnpm deploy:cf:phase6:dry-run",
    mode: "startsWith",
  },
  {
    name: "preview:cf:wrangler",
    expected: "legacy-entrypoint-guard.mjs",
    mode: "includes",
  },
];

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function normalizeForbiddenCheck(snippet) {
  if (typeof snippet === "string") {
    return { match: snippet, type: "substring" };
  }

  return snippet;
}

function hasForbiddenContent(content, snippet) {
  const check = normalizeForbiddenCheck(snippet);

  if (check.type === "quoted") {
    return (
      content.includes(`"${check.match}"`) ||
      content.includes(`'${check.match}'`)
    );
  }

  if (check.type === "regex") {
    return check.match.test(content);
  }

  return content.includes(check.match);
}

function findForbiddenSnippets(content, snippets) {
  return snippets.filter((snippet) => hasForbiddenContent(content, snippet));
}

function formatForbiddenSnippet(snippet) {
  const check = normalizeForbiddenCheck(snippet);
  return check.type === "regex" ? check.match.toString() : check.match;
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
  const forbidden = findForbiddenSnippets(content, check.forbiddenSnippets);

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

if (fs.existsSync(PHASE6_CONFIG_DIR)) {
  const phase6ConfigFiles = fs
    .readdirSync(PHASE6_CONFIG_DIR)
    .filter((fileName) => fileName.endsWith(".jsonc"));

  for (const fileName of phase6ConfigFiles) {
    const relPath = path.join(".open-next", "wrangler", "phase6", fileName);
    const content = read(relPath);
    const forbidden = findForbiddenSnippets(
      content,
      generatedConfigForbiddenSnippets,
    );

    if (forbidden.length > 0) {
      failures.push({
        file: relPath,
        label:
          "phase6 generated deploy config must not reintroduce runtime cache bindings",
        missing: [],
        forbidden,
      });
    }
  }
} else if (REQUIRE_GENERATED_CONFIG) {
  failures.push({
    file: path.relative(ROOT, PHASE6_CONFIG_DIR),
    label: "phase6 generated deploy config must exist for strict compare",
    missing: ["run pnpm build:cf:phase6 before strict compare"],
    forbidden: [],
  });
} else {
  console.warn(
    "cf-official-compare: phase6 generated config absent; run with --require-generated after pnpm build:cf:phase6 for deploy-artifact proof.",
  );
}

for (const check of deployScriptChecks) {
  const script = scripts[check.name];
  const matches =
    typeof script === "string" &&
    (check.mode === "startsWith"
      ? script.startsWith(check.expected)
      : script.includes(check.expected));

  if (!matches) {
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
      console.error(
        `  - forbidden snippet still present: ${formatForbiddenSnippet(snippet)}`,
      );
    }
  }
  process.exit(1);
}

console.log("cf-official-compare: passed");
console.log(
  "Verified static-generation Cloudflare baseline against open-next.config.ts and wrangler.jsonc.",
);
