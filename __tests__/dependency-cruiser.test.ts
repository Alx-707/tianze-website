import { describe, expect, it } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const depCruiserConfig = require("../.dependency-cruiser.js");

describe("dependency-cruiser configuration", () => {
  describe("configuration structure", () => {
    it("should have a forbidden array", () => {
      expect(depCruiserConfig).toHaveProperty("forbidden");
      expect(Array.isArray(depCruiserConfig.forbidden)).toBe(true);
    });

    it("should have an options object", () => {
      expect(depCruiserConfig).toHaveProperty("options");
      expect(typeof depCruiserConfig.options).toBe("object");
    });

    it("should have tsConfig in options", () => {
      expect(depCruiserConfig.options).toHaveProperty("tsConfig");
      expect(depCruiserConfig.options.tsConfig).toHaveProperty("fileName");
    });

    it("should have doNotFollow configuration", () => {
      expect(depCruiserConfig.options).toHaveProperty("doNotFollow");
      expect(depCruiserConfig.options.doNotFollow).toHaveProperty("path");
    });

    it("should have exclude configuration", () => {
      expect(depCruiserConfig.options).toHaveProperty("exclude");
      expect(depCruiserConfig.options.exclude).toHaveProperty("path");
    });

    it("should have reporterOptions for visualization", () => {
      expect(depCruiserConfig.options).toHaveProperty("reporterOptions");
      expect(depCruiserConfig.options.reporterOptions).toHaveProperty("dot");
    });
  });

  describe("layer boundary rules", () => {
    it("should enforce lib independence from components/app", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-lib-to-components-or-app"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/lib/");
      expect(rule.to.path).toBe("^src/(app|components)/");
    });

    it("should prevent components from depending on app", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-components-to-app"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/components/");
      expect(rule.to.path).toBe("^src/app/");
    });

    it("should prevent non-test imports from API routes", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-non-test-imports-api-routes"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/");
      expect(rule.from.pathNot).toContain("spec");
      expect(rule.from.pathNot).toContain("test");
      expect(rule.to.path).toBe("^src/app/api/");
    });
  });

  describe("circular dependency rules", () => {
    it("should forbid circular dependencies", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-circular"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.to.circular).toBe(true);
    });
  });

  describe("orphan detection rules", () => {
    it("should warn about orphan files", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-orphans"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("warn");
      expect(rule.from.orphan).toBe(true);
    });

    it("should exclude test files from orphan detection", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-orphans"
      );
      expect(rule.from.pathNot).toContain("spec");
      expect(rule.from.pathNot).toContain("test");
      expect(rule.from.pathNot).toContain("d\\.ts"); // Escaped for regex
    });

    it("should exclude Next.js page files from orphan detection", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-orphans"
      );
      expect(rule.from.pathNot).toContain("page\\.tsx");
      expect(rule.from.pathNot).toContain("route\\.(ts|tsx)");
    });

    it("should exclude type definition files from orphan detection", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-orphans"
      );
      expect(rule.from.pathNot).toContain("^src/types/");
      expect(rule.from.pathNot).toContain("-types\\.(ts|tsx)");
    });
  });

  describe("feature isolation rules", () => {
    it("should enforce feature isolation", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "feature-isolation"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/features/[^/]+");
    });

    it("should allow features to depend on shared modules", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "feature-isolation"
      );
      expect(rule.to.pathNot).toContain("shared");
      expect(rule.to.pathNot).toContain("lib");
      expect(rule.to.pathNot).toContain("components");
    });
  });

  describe("internal module protection rules", () => {
    it("should prevent external access to internal modules", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-external-to-internal"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.pathNot).toBe("^src/");
      expect(rule.to.path).toBe("^src/lib/internal");
    });
  });

  describe("test isolation rules", () => {
    it("should prevent production code from importing test files", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-test-imports-in-production"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.pathNot).toContain("spec");
      expect(rule.from.pathNot).toContain("test");
      expect(rule.to.path).toContain("spec");
      expect(rule.to.path).toContain("test");
    });

    it("should prevent production code from importing dev dependencies", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) =>
          r.name === "no-dev-dependencies-in-production"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/");
      expect(rule.from.pathNot).toContain("spec");
      expect(rule.from.pathNot).toContain("test");
      expect(rule.to.dependencyTypes).toContain("npm-dev");
    });
  });

  describe("domain boundary rules", () => {
    it("should enforce web-vitals domain boundaries (error severity)", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) =>
          r.name === "no-cross-domain-direct-access:web-vitals"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/lib/web-vitals/");
    });

    it("should prevent web-vitals from depending on other lib domains", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) =>
          r.name === "no-cross-domain-direct-access:web-vitals"
      );
      expect(rule.to.path).toContain("security");
      expect(rule.to.path).toContain("i18n");
      expect(rule.to.path).toContain("whatsapp");
      expect(rule.to.path).toContain("airtable");
    });

    it("should allow web-vitals to import types and constants", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) =>
          r.name === "no-cross-domain-direct-access:web-vitals"
      );
      expect(rule.to.pathNot).toContain("types\\.(ts|tsx)");
      expect(rule.to.pathNot).toContain("constants\\.(ts|tsx)");
      expect(rule.to.pathNot).toContain("index\\.(ts|tsx)");
    });

    it("should prevent web-vitals from depending on UI/Page layers", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "web-vitals-no-ui-deps"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/lib/web-vitals/");
      expect(rule.to.path).toBe("^src/(app|components)/");
    });

    it("should warn about i18n domain dependencies", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "i18n-no-ui-deps"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("warn");
      expect(rule.from.path).toBe("^src/lib/i18n");
      expect(rule.to.path).toBe("^src/(app|components)/");
    });

    it("should enforce domain boundaries for web-vitals", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "enforce-domain-boundaries"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/lib/web-vitals/");
      expect(rule.to.path).toBe("^src/lib/(?!web-vitals/)[^/]+/");
    });

    it("should allow web-vitals to import security object-guards", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "enforce-domain-boundaries"
      );
      expect(rule.to.pathNot).toContain(
        "^src/lib/security/object-guards.ts$"
      );
    });

    it("should warn about i18n domain boundaries", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "i18n-domain-boundaries"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("warn");
      expect(rule.from.path).toBe("^src/lib/i18n/");
    });
  });

  describe("import path rules", () => {
    it("should forbid relative cross-layer imports", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-relative-cross-layer-imports"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("error");
      expect(rule.from.path).toBe("^src/");
      expect(rule.to.path).toBe("\\.\\./");
    });

    it("should allow relative imports in test files", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-relative-cross-layer-imports"
      );
      expect(rule.to.pathNot).toContain("spec");
      expect(rule.to.pathNot).toContain("test");
    });
  });

  describe("barrel export rules", () => {
    it("should warn about barrel export dependencies", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-barrel-export-dependencies"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("warn");
      expect(rule.to.path).toBe("index\\.(ts|js)$");
    });

    it("should exempt app and components from barrel export rule", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-barrel-export-dependencies"
      );
      expect(rule.from.pathNot).toContain("^src/(app|components|scripts)/");
    });

    it("should allow specific barrel exports for common aggregation", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-barrel-export-dependencies"
      );
      expect(rule.to.pathNot).toContain("^src/constants/index");
      expect(rule.to.pathNot).toContain("^src/types/index");
      expect(rule.to.pathNot).toContain("^src/lib/web-vitals/index");
    });
  });

  describe("rule completeness", () => {
    it("should have all rules with unique names", () => {
      const names = depCruiserConfig.forbidden.map(
        (r: { name: string }) => r.name
      );
      const uniqueNames = new Set(names);
      expect(names.length).toBe(uniqueNames.size);
    });

    it("should have comments for all rules", () => {
      depCruiserConfig.forbidden.forEach(
        (rule: { name: string; comment?: string }) => {
          expect(rule.comment).toBeDefined();
          expect(rule.comment.length).toBeGreaterThan(0);
        }
      );
    });

    it("should have severity for all rules", () => {
      depCruiserConfig.forbidden.forEach(
        (rule: { name: string; severity?: string }) => {
          expect(rule.severity).toBeDefined();
          expect(["error", "warn"]).toContain(rule.severity);
        }
      );
    });

    it("should have from and to for all rules", () => {
      depCruiserConfig.forbidden.forEach(
        (rule: { name: string; from?: object; to?: object }) => {
          expect(rule.from).toBeDefined();
          expect(rule.to).toBeDefined();
          expect(typeof rule.from).toBe("object");
          expect(typeof rule.to).toBe("object");
        }
      );
    });
  });

  describe("critical architectural boundaries", () => {
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
      it(`should have critical rule: ${ruleName}`, () => {
        const rule = depCruiserConfig.forbidden.find(
          (r: { name: string }) => r.name === ruleName
        );
        expect(rule).toBeDefined();
      });
    });

    it("should mark critical architectural rules as errors", () => {
      const errorRules = depCruiserConfig.forbidden.filter(
        (r: { severity: string; name: string }) =>
          r.severity === "error" &&
          (r.name.includes("lib-to-components") ||
            r.name.includes("components-to-app") ||
            r.name.includes("domain-boundaries") ||
            r.name.includes("web-vitals-no-ui"))
      );
      expect(errorRules.length).toBeGreaterThan(0);
    });
  });

  describe("configuration options validation", () => {
    it("should enable tsPreCompilationDeps for TypeScript support", () => {
      expect(depCruiserConfig.options.tsPreCompilationDeps).toBe(true);
    });

    it("should not preserve symlinks", () => {
      expect(depCruiserConfig.options.preserveSymlinks).toBe(false);
    });

    it("should exclude test files from dependency analysis", () => {
      expect(depCruiserConfig.options.exclude.path).toContain("spec");
      expect(depCruiserConfig.options.exclude.path).toContain("test");
      expect(depCruiserConfig.options.exclude.path).toContain(
        "node_modules"
      );
    });

    it("should not follow test files in dependency graph", () => {
      expect(depCruiserConfig.options.doNotFollow.path).toContain("spec");
      expect(depCruiserConfig.options.doNotFollow.path).toContain("test");
      expect(depCruiserConfig.options.doNotFollow.path).toContain(
        "node_modules"
      );
    });
  });

  describe("visualization configuration", () => {
    it("should configure dot reporter for graph visualization", () => {
      expect(depCruiserConfig.options.reporterOptions.dot).toBeDefined();
      expect(
        depCruiserConfig.options.reporterOptions.dot.theme
      ).toBeDefined();
    });

    it("should have color-coded module visualization", () => {
      const modules =
        depCruiserConfig.options.reporterOptions.dot.theme.modules;
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
    });

    it("should visualize src/app as red", () => {
      const modules =
        depCruiserConfig.options.reporterOptions.dot.theme.modules;
      const appModule = modules.find(
        (m: { criteria: { source: string } }) => m.criteria.source === "^src/app"
      );
      expect(appModule).toBeDefined();
      expect(appModule.attributes.fillcolor).toBe("#ffcccc");
    });

    it("should visualize src/components as green", () => {
      const modules =
        depCruiserConfig.options.reporterOptions.dot.theme.modules;
      const componentsModule = modules.find(
        (m: { criteria: { source: string } }) =>
          m.criteria.source === "^src/components"
      );
      expect(componentsModule).toBeDefined();
      expect(componentsModule.attributes.fillcolor).toBe("#ccffcc");
    });

    it("should visualize src/lib as blue", () => {
      const modules =
        depCruiserConfig.options.reporterOptions.dot.theme.modules;
      const libModule = modules.find(
        (m: { criteria: { source: string } }) => m.criteria.source === "^src/lib"
      );
      expect(libModule).toBeDefined();
      expect(libModule.attributes.fillcolor).toBe("#ccccff");
    });

    it("should visualize src/features as yellow", () => {
      const modules =
        depCruiserConfig.options.reporterOptions.dot.theme.modules;
      const featuresModule = modules.find(
        (m: { criteria: { source: string } }) =>
          m.criteria.source === "^src/features"
      );
      expect(featuresModule).toBeDefined();
      expect(featuresModule.attributes.fillcolor).toBe("#ffffcc");
    });
  });

  describe("regression prevention", () => {
    it("should prevent reintroduction of lib → components dependency", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-lib-to-components-or-app"
      );
      // Rule exists and documents the layer boundary requirement
      expect(rule.comment).toContain("lib");
      expect(rule.comment).toContain("UI");
    });

    it("should have sufficient rules to prevent major architectural regressions", () => {
      // At minimum, should have rules for:
      // - Layer boundaries (3 rules)
      // - Circular dependencies (1 rule)
      // - Domain boundaries (5+ rules)
      // - Test isolation (2 rules)
      expect(depCruiserConfig.forbidden.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("should handle paths with special regex characters", () => {
      const orphanRule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-orphans"
      );
      // Should escape special regex chars like . in .d.ts
      expect(orphanRule.from.pathNot).toContain("d\\.ts");
    });

    it("should support multiple path patterns in rules", () => {
      const webVitalsRule = depCruiserConfig.forbidden.find(
        (r: { name: string }) =>
          r.name === "no-cross-domain-direct-access:web-vitals"
      );
      // Should use array or pipe-separated patterns for multiple paths
      expect(
        typeof webVitalsRule.to.path === "string" ||
          Array.isArray(webVitalsRule.to.path)
      ).toBe(true);
    });

    it("should handle optional pathNot exclusions", () => {
      const rules = depCruiserConfig.forbidden.filter(
        (r: { to?: { pathNot?: string } }) => r.to?.pathNot
      );
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  describe("security and stability rules", () => {
    it("should prevent circular dependencies that could cause runtime issues", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-circular"
      );
      expect(rule.comment).toContain("循环依赖");
      expect(rule.comment).toContain("架构问题");
    });

    it("should enforce strict separation of test and production code", () => {
      const testImportRule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-test-imports-in-production"
      );
      const devDepRule = depCruiserConfig.forbidden.find(
        (r: { name: string }) =>
          r.name === "no-dev-dependencies-in-production"
      );
      expect(testImportRule).toBeDefined();
      expect(devDepRule).toBeDefined();
    });
  });

  describe("maintainability rules", () => {
    it("should detect potentially orphaned files to reduce dead code", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-orphans"
      );
      expect(rule).toBeDefined();
      expect(rule.severity).toBe("warn"); // Warn, not error, due to false positives
    });

    it("should have reasonable pathNot exemptions for orphan detection", () => {
      const rule = depCruiserConfig.forbidden.find(
        (r: { name: string }) => r.name === "no-orphans"
      );
      // Should exempt files that are legitimately not directly imported
      expect(rule.from.pathNot).toContain("page\\.tsx");
      expect(rule.from.pathNot).toContain("route\\.(ts|tsx)");
      expect(rule.from.pathNot).toContain("config");
    });
  });
});