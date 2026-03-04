#!/usr/bin/env node

/**
 * Validation script for .dependency-cruiser.js configuration
 * This script performs comprehensive validation of the dependency-cruiser rules
 * to ensure architectural boundaries are correctly enforced.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const depCruiserConfig = require("../.dependency-cruiser.js");

let passCount = 0;
let failCount = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`✓ ${description}`);
    passCount++;
  } catch (error) {
    console.log(`✗ ${description}`);
    console.log(`  Error: ${error.message}`);
    failCount++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error("Expected value to be defined");
      }
    },
    toHaveProperty(prop) {
      if (!(prop in actual)) {
        throw new Error(`Expected object to have property ${prop}`);
      }
    },
    toContain(item) {
      if (!actual.includes(item)) {
        throw new Error(`Expected array to contain ${item}`);
      }
    },
    toBeGreaterThan(n) {
      if (actual <= n) {
        throw new Error(`Expected ${actual} to be greater than ${n}`);
      }
    },
    toBeGreaterThanOrEqual(n) {
      if (actual < n) {
        throw new Error(`Expected ${actual} to be >= ${n}`);
      }
    },
  };
}

console.log("Running dependency-cruiser configuration tests...\n");

// Configuration structure tests
test("should have a forbidden array", () => {
  expect(depCruiserConfig).toHaveProperty("forbidden");
  expect(Array.isArray(depCruiserConfig.forbidden)).toBe(true);
});

test("should have an options object", () => {
  expect(depCruiserConfig).toHaveProperty("options");
  expect(typeof depCruiserConfig.options).toBe("object");
});

test("should have tsConfig in options", () => {
  expect(depCruiserConfig.options).toHaveProperty("tsConfig");
  expect(depCruiserConfig.options.tsConfig).toHaveProperty("fileName");
});

// Layer boundary rules tests
test("should enforce lib independence from components/app", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-lib-to-components-or-app"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/lib/");
  expect(rule.to.path).toBe("^src/(app|components)/");
});

test("should prevent components from depending on app", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-components-to-app"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/components/");
  expect(rule.to.path).toBe("^src/app/");
});

test("should prevent non-test imports from API routes", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-non-test-imports-api-routes"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/");
  expect(rule.from.pathNot).toContain("spec");
  expect(rule.from.pathNot).toContain("test");
  expect(rule.to.path).toBe("^src/app/api/");
});

// Circular dependency rules tests
test("should forbid circular dependencies", () => {
  const rule = depCruiserConfig.forbidden.find((r) => r.name === "no-circular");
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.to.circular).toBe(true);
});

// Orphan detection tests
test("should warn about orphan files", () => {
  const rule = depCruiserConfig.forbidden.find((r) => r.name === "no-orphans");
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("warn");
  expect(rule.from.orphan).toBe(true);
});

test("should exclude test files from orphan detection", () => {
  const rule = depCruiserConfig.forbidden.find((r) => r.name === "no-orphans");
  expect(rule.from.pathNot).toContain("spec");
  expect(rule.from.pathNot).toContain("test");
  expect(rule.from.pathNot).toContain("d\\.ts"); // Escaped for regex
});

test("should exclude Next.js page files from orphan detection", () => {
  const rule = depCruiserConfig.forbidden.find((r) => r.name === "no-orphans");
  expect(rule.from.pathNot).toContain("page\\.tsx");
  expect(rule.from.pathNot).toContain("route\\.(ts|tsx)");
});

// Feature isolation tests
test("should enforce feature isolation", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "feature-isolation"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/features/[^/]+");
});

// Internal module protection tests
test("should prevent external access to internal modules", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-external-to-internal"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.pathNot).toBe("^src/");
  expect(rule.to.path).toBe("^src/lib/internal");
});

// Test isolation tests
test("should prevent production code from importing test files", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-test-imports-in-production"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.pathNot).toContain("spec");
  expect(rule.from.pathNot).toContain("test");
  expect(rule.to.path).toContain("spec");
  expect(rule.to.path).toContain("test");
});

test("should prevent production code from importing dev dependencies", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-dev-dependencies-in-production"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/");
  expect(rule.from.pathNot).toContain("spec");
  expect(rule.from.pathNot).toContain("test");
  expect(rule.to.dependencyTypes).toContain("npm-dev");
});

// Domain boundary tests
test("should enforce web-vitals domain boundaries (error severity)", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-cross-domain-direct-access:web-vitals"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/lib/web-vitals/");
});

test("should prevent web-vitals from depending on other lib domains", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-cross-domain-direct-access:web-vitals"
  );
  expect(rule.to.path).toContain("security");
  expect(rule.to.path).toContain("i18n");
  expect(rule.to.path).toContain("whatsapp");
  expect(rule.to.path).toContain("airtable");
});

test("should prevent web-vitals from depending on UI/Page layers", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "web-vitals-no-ui-deps"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/lib/web-vitals/");
  expect(rule.to.path).toBe("^src/(app|components)/");
});

test("should warn about i18n domain dependencies", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "i18n-no-ui-deps"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("warn");
  expect(rule.from.path).toBe("^src/lib/i18n");
  expect(rule.to.path).toBe("^src/(app|components)/");
});

test("should enforce domain boundaries for web-vitals", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "enforce-domain-boundaries"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/lib/web-vitals/");
  expect(rule.to.path).toBe("^src/lib/(?!web-vitals/)[^/]+/");
});

// Import path tests
test("should forbid relative cross-layer imports", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-relative-cross-layer-imports"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("error");
  expect(rule.from.path).toBe("^src/");
  expect(rule.to.path).toBe("\\.\\./");
});

// Barrel export tests
test("should warn about barrel export dependencies", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-barrel-export-dependencies"
  );
  expect(rule).toBeDefined();
  expect(rule.severity).toBe("warn");
  expect(rule.to.path).toBe("index\\.(ts|js)$");
});

// Rule completeness tests
test("should have all rules with unique names", () => {
  const names = depCruiserConfig.forbidden.map((r) => r.name);
  const uniqueNames = new Set(names);
  expect(names.length).toBe(uniqueNames.size);
});

test("should have comments for all rules", () => {
  depCruiserConfig.forbidden.forEach((rule) => {
    expect(rule.comment).toBeDefined();
    expect(rule.comment.length).toBeGreaterThan(0);
  });
});

test("should have severity for all rules", () => {
  depCruiserConfig.forbidden.forEach((rule) => {
    expect(rule.severity).toBeDefined();
    if (!["error", "warn"].includes(rule.severity)) {
      throw new Error(`Invalid severity: ${rule.severity}`);
    }
  });
});

test("should have from and to for all rules", () => {
  depCruiserConfig.forbidden.forEach((rule) => {
    expect(rule.from).toBeDefined();
    expect(rule.to).toBeDefined();
    expect(typeof rule.from).toBe("object");
    expect(typeof rule.to).toBe("object");
  });
});

// Critical architectural boundaries tests
const criticalRules = [
  "no-lib-to-components-or-app",
  "no-components-to-app",
  "no-non-test-imports-api-routes",
  "no-circular",
  "web-vitals-no-ui-deps",
  "enforce-domain-boundaries",
  "no-dev-dependencies-in-production",
];

criticalRules.forEach((ruleName) => {
  test(`should have critical rule: ${ruleName}`, () => {
    const rule = depCruiserConfig.forbidden.find((r) => r.name === ruleName);
    expect(rule).toBeDefined();
  });
});

test("should mark critical architectural rules as errors", () => {
  const errorRules = depCruiserConfig.forbidden.filter(
    (r) =>
      r.severity === "error" &&
      (r.name.includes("lib-to-components") ||
        r.name.includes("components-to-app") ||
        r.name.includes("domain-boundaries") ||
        r.name.includes("web-vitals-no-ui"))
  );
  expect(errorRules.length).toBeGreaterThan(0);
});

// Configuration options tests
test("should enable tsPreCompilationDeps for TypeScript support", () => {
  expect(depCruiserConfig.options.tsPreCompilationDeps).toBe(true);
});

test("should not preserve symlinks", () => {
  expect(depCruiserConfig.options.preserveSymlinks).toBe(false);
});

test("should exclude test files from dependency analysis", () => {
  expect(depCruiserConfig.options.exclude.path).toContain("spec");
  expect(depCruiserConfig.options.exclude.path).toContain("test");
  expect(depCruiserConfig.options.exclude.path).toContain("node_modules");
});

// Visualization configuration tests
test("should configure dot reporter for graph visualization", () => {
  expect(depCruiserConfig.options.reporterOptions.dot).toBeDefined();
  expect(depCruiserConfig.options.reporterOptions.dot.theme).toBeDefined();
});

test("should have color-coded module visualization", () => {
  const modules = depCruiserConfig.options.reporterOptions.dot.theme.modules;
  expect(Array.isArray(modules)).toBe(true);
  expect(modules.length).toBeGreaterThan(0);
});

test("should visualize src/app as red", () => {
  const modules = depCruiserConfig.options.reporterOptions.dot.theme.modules;
  const appModule = modules.find((m) => m.criteria.source === "^src/app");
  expect(appModule).toBeDefined();
  expect(appModule.attributes.fillcolor).toBe("#ffcccc");
});

test("should visualize src/components as green", () => {
  const modules = depCruiserConfig.options.reporterOptions.dot.theme.modules;
  const componentsModule = modules.find(
    (m) => m.criteria.source === "^src/components"
  );
  expect(componentsModule).toBeDefined();
  expect(componentsModule.attributes.fillcolor).toBe("#ccffcc");
});

test("should visualize src/lib as blue", () => {
  const modules = depCruiserConfig.options.reporterOptions.dot.theme.modules;
  const libModule = modules.find((m) => m.criteria.source === "^src/lib");
  expect(libModule).toBeDefined();
  expect(libModule.attributes.fillcolor).toBe("#ccccff");
});

// Regression prevention tests
test("should prevent reintroduction of lib → components dependency", () => {
  const rule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-lib-to-components-or-app"
  );
  // Rule exists and documents the layer boundary requirement
  expect(rule.comment).toContain("lib");
  expect(rule.comment).toContain("UI");
});

test("should have sufficient rules to prevent major architectural regressions", () => {
  expect(depCruiserConfig.forbidden.length).toBeGreaterThanOrEqual(10);
});

// Security and stability tests
test("should prevent circular dependencies that could cause runtime issues", () => {
  const rule = depCruiserConfig.forbidden.find((r) => r.name === "no-circular");
  expect(rule.comment).toContain("循环依赖");
});

test("should enforce strict separation of test and production code", () => {
  const testImportRule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-test-imports-in-production"
  );
  const devDepRule = depCruiserConfig.forbidden.find(
    (r) => r.name === "no-dev-dependencies-in-production"
  );
  expect(testImportRule).toBeDefined();
  expect(devDepRule).toBeDefined();
});

// Summary
console.log("\n" + "=".repeat(50));
console.log(`Tests passed: ${passCount}`);
console.log(`Tests failed: ${failCount}`);
console.log(`Total tests: ${passCount + failCount}`);
console.log("=".repeat(50));

process.exit(failCount > 0 ? 1 : 0);