#!/usr/bin/env node

/**
 * Static Truth Check (Layer 2)
 *
 * Validates that all Link hrefs, CTA buttons, and form actions in the codebase
 * point to real routes. Catches disconnected UI elements that pass type-check
 * and lint but would fail for users.
 *
 * Runs in <5 seconds. No browser, no build required.
 *
 * Usage: node scripts/static-truth-check.js [--json] [--ci]
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "src");
const APP_DIR = path.join(SRC, "app");
const LOCALE_DIR = path.join(APP_DIR, "[locale]");

// ---------------------------------------------------------------------------
// 1. Discover routes
// ---------------------------------------------------------------------------

function discoverPageRoutes() {
  const routes = new Set();

  function walk(dir, routePath) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        // Skip test/internal dirs
        if (entry.name.startsWith("__") || entry.name.startsWith(".")) continue;
        walk(path.join(dir, entry.name), `${routePath}/${entry.name}`);
      } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
        routes.add(routePath || "/");
      }
    }
  }

  walk(LOCALE_DIR, "");
  return routes;
}

function discoverApiRoutes() {
  const routes = new Set();
  const apiDir = path.join(APP_DIR, "api");

  function walk(dir, routePath) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith("__")) continue;
        walk(path.join(dir, entry.name), `${routePath}/${entry.name}`);
      } else if (entry.name === "route.ts" || entry.name === "route.js") {
        routes.add(`/api${routePath}`);
      }
    }
  }

  walk(apiDir, "");
  return routes;
}

// ---------------------------------------------------------------------------
// 2. Scan source files for Link hrefs and form actions
// ---------------------------------------------------------------------------

function getAllTsxFiles(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;

  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === "__tests__" ||
          entry.name === ".next"
        )
          continue;
        walk(full);
      } else if (
        /\.(tsx?|jsx?)$/.test(entry.name) &&
        !entry.name.endsWith(".test.ts") &&
        !entry.name.endsWith(".test.tsx") &&
        !entry.name.endsWith(".spec.ts")
      ) {
        files.push(full);
      }
    }
  }

  walk(dir);
  return files;
}

function extractLinkTargets(filePath, content) {
  const targets = [];
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Match href="..." or href={'...'} or href={`/...`}
    const hrefPatterns = [
      /href=["'](\/([\w\-\/\[\]]+)?)["']/g,
      /href=\{["'`](\/([\w\-\/\[\]]+)?)["'`]\}/g,
    ];

    for (const pattern of hrefPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const href = match[1];
        // Skip anchors, external links, dynamic expressions
        if (href.startsWith("/#") || href === "/") continue;
        if (href.includes("${")) continue; // template literal with expression

        targets.push({
          file: path.relative(ROOT, filePath),
          line: lineNum,
          href,
          type: "link",
        });
      }
    }

    // Match form action="/api/..."
    const actionPattern = /action=["'](\/(api\/[\w\-\/]+))["']/g;
    let actionMatch;
    while ((actionMatch = actionPattern.exec(line)) !== null) {
      targets.push({
        file: path.relative(ROOT, filePath),
        line: lineNum,
        href: actionMatch[1],
        type: "form-action",
      });
    }

    // Match fetch("/api/...") or POST to /api/
    const fetchPattern = /["'`](\/api\/[\w\-\/]+)["'`]/g;
    let fetchMatch;
    while ((fetchMatch = fetchPattern.exec(line)) !== null) {
      targets.push({
        file: path.relative(ROOT, filePath),
        line: lineNum,
        href: fetchMatch[1],
        type: "api-call",
      });
    }
  }

  return targets;
}

// ---------------------------------------------------------------------------
// 3. Check for orphaned files in route directories
// ---------------------------------------------------------------------------

function findOrphanedRouteFiles() {
  const orphans = [];

  function checkDir(dir, routePath) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name.startsWith("__") || entry.name.startsWith(".")) continue;
        checkDir(path.join(dir, entry.name), `${routePath}/${entry.name}`);
        continue;
      }

      // Skip standard Next.js files
      const standardFiles = [
        "page.tsx",
        "page.ts",
        "layout.tsx",
        "layout.ts",
        "loading.tsx",
        "error.tsx",
        "not-found.tsx",
        "template.tsx",
        "head.tsx",
        "generate-static-params.ts",
      ];
      if (standardFiles.includes(entry.name)) continue;
      if (entry.name.startsWith(".")) continue;
      if (!entry.name.endsWith(".tsx") && !entry.name.endsWith(".ts")) continue;

      // This is a non-standard .tsx/.ts file in a route directory
      // Check if it's imported by the page or layout
      const fullPath = path.join(dir, entry.name);
      const relPath = path.relative(ROOT, fullPath);
      const moduleName = entry.name.replace(/\.(tsx?|jsx?)$/, "");

      // Read sibling page.tsx / layout.tsx to check imports
      let isImported = false;
      for (const sibling of [
        "page.tsx",
        "layout.tsx",
        "page.ts",
        "layout.ts",
      ]) {
        const siblingPath = path.join(dir, sibling);
        if (fs.existsSync(siblingPath)) {
          const siblingContent = fs.readFileSync(siblingPath, "utf-8");
          if (siblingContent.includes(moduleName)) {
            isImported = true;
            break;
          }
        }
      }

      // Also check if imported by any file in the same directory
      if (!isImported) {
        for (const otherEntry of entries) {
          if (otherEntry.name === entry.name || otherEntry.isDirectory())
            continue;
          if (
            !otherEntry.name.endsWith(".tsx") &&
            !otherEntry.name.endsWith(".ts")
          )
            continue;
          const otherPath = path.join(dir, otherEntry.name);
          const otherContent = fs.readFileSync(otherPath, "utf-8");
          if (otherContent.includes(moduleName)) {
            isImported = true;
            break;
          }
        }
      }

      if (!isImported) {
        orphans.push({
          file: relPath,
          route: routePath || "/",
          reason:
            "Not imported by page.tsx, layout.tsx, or any sibling in this route directory",
        });
      }
    }
  }

  checkDir(LOCALE_DIR, "");
  return orphans;
}

// ---------------------------------------------------------------------------
// 4. Validate
// ---------------------------------------------------------------------------

function normalizeRoute(href) {
  // Strip locale prefix: /en/products -> /products
  const withoutLocale = href
    .replace(/^\/(en|zh)\//, "/")
    .replace(/^\/(en|zh)$/, "/");
  // Strip trailing slash
  return withoutLocale.replace(/\/$/, "") || "/";
}

function routeMatches(href, pageRoutes) {
  const normalized = normalizeRoute(href);

  // Direct match
  if (pageRoutes.has(normalized)) return true;

  // Dynamic route match: /products/north-america -> /products/[market]
  const segments = normalized.split("/").filter(Boolean);
  for (const route of pageRoutes) {
    const routeSegments = route.split("/").filter(Boolean);
    if (routeSegments.length !== segments.length) continue;

    let matches = true;
    for (let i = 0; i < routeSegments.length; i++) {
      if (routeSegments[i].startsWith("[") && routeSegments[i].endsWith("]")) {
        continue; // dynamic segment matches anything
      }
      if (routeSegments[i] !== segments[i]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }

  return false;
}

function apiRouteMatches(href, apiRoutes) {
  if (apiRoutes.has(href)) return true;

  // Check dynamic segments
  const segments = href.split("/").filter(Boolean);
  for (const route of apiRoutes) {
    const routeSegments = route.split("/").filter(Boolean);
    if (routeSegments.length !== segments.length) continue;

    let matches = true;
    for (let i = 0; i < routeSegments.length; i++) {
      if (routeSegments[i].startsWith("[") && routeSegments[i].endsWith("]"))
        continue;
      if (routeSegments[i] !== segments[i]) {
        matches = false;
        break;
      }
    }
    if (matches) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// 5. Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const jsonMode = args.includes("--json");
  const ciMode = args.includes("--ci");

  const startTime = Date.now();

  // Discover routes
  const pageRoutes = discoverPageRoutes();
  const apiRoutes = discoverApiRoutes();

  if (!jsonMode) {
    console.log(`\nStatic Truth Check`);
    console.log(`${"=".repeat(50)}`);
    console.log(`Page routes found: ${pageRoutes.size}`);
    console.log(`API routes found:  ${apiRoutes.size}`);
  }

  // Scan source files
  const srcFiles = getAllTsxFiles(SRC);
  const allTargets = [];

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const targets = extractLinkTargets(file, content);
    allTargets.push(...targets);
  }

  // Validate link targets
  const errors = [];
  const seenHrefs = new Set();

  for (const target of allTargets) {
    const key = `${target.href}:${target.type}`;
    if (seenHrefs.has(key)) continue; // dedup repeated hrefs

    if (target.href.startsWith("/api/")) {
      if (!apiRouteMatches(target.href, apiRoutes)) {
        errors.push({
          ...target,
          error: `API route "${target.href}" does not exist`,
        });
      }
    } else {
      if (!routeMatches(target.href, pageRoutes)) {
        errors.push({
          ...target,
          error: `Page route "${target.href}" does not exist`,
        });
      }
    }
    seenHrefs.add(key);
  }

  // Check orphaned files
  const orphans = findOrphanedRouteFiles();

  // Deduplicate errors by href (keep first occurrence)
  const uniqueErrors = [];
  const seenErrors = new Set();
  for (const err of errors) {
    if (!seenErrors.has(err.href)) {
      uniqueErrors.push(err);
      seenErrors.add(err.href);
    }
  }

  const elapsed = Date.now() - startTime;

  if (jsonMode) {
    console.log(
      JSON.stringify(
        {
          elapsed_ms: elapsed,
          page_routes: [...pageRoutes],
          api_routes: [...apiRoutes],
          links_scanned: seenHrefs.size,
          broken_links: uniqueErrors,
          orphaned_files: orphans,
          pass: uniqueErrors.length === 0 && orphans.length === 0,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(`Links scanned:     ${seenHrefs.size}`);
    console.log();

    if (uniqueErrors.length > 0) {
      console.log(`BROKEN LINKS (${uniqueErrors.length}):`);
      for (const err of uniqueErrors) {
        console.log(`  ${err.file}:${err.line} — ${err.error} [${err.type}]`);
      }
      console.log();
    }

    if (orphans.length > 0) {
      console.log(`ORPHANED FILES (${orphans.length}):`);
      for (const orphan of orphans) {
        console.log(`  ${orphan.file} — ${orphan.reason}`);
      }
      console.log();
    }

    if (uniqueErrors.length === 0 && orphans.length === 0) {
      console.log("All links resolve. No orphaned files.");
    }

    console.log(`\nCompleted in ${elapsed}ms`);
  }

  if (ciMode && (uniqueErrors.length > 0 || orphans.length > 0)) {
    process.exit(1);
  }
}

main();
