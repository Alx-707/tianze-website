# Dependency Cruiser Configuration Tests

This directory contains comprehensive tests for the `.dependency-cruiser.js` configuration file, which enforces architectural boundaries and dependency rules in the codebase.

## Test Files

### `dependency-cruiser.test.ts`
Vitest-based test suite for the dependency-cruiser configuration. This is the primary test file that will be run as part of the standard test suite.

### `dependency-cruiser-validation.js`
Standalone Node.js validation script that can be run independently without any test framework dependencies. Useful for quick validation or CI environments.

## Running the Tests

### With Vitest (recommended)
```bash
pnpm test __tests__/dependency-cruiser.test.ts
```

### Standalone validation
```bash
node __tests__/dependency-cruiser-validation.js
```

### With dependency-cruiser itself
```bash
pnpm dep:check
# or
pnpm arch:check
```

## What's Being Tested

The test suite validates that the dependency-cruiser configuration correctly enforces:

### 1. Layer Boundary Rules
- **lib → components/app**: Prevents `src/lib/` from depending on `src/components/` or `src/app/`
- **components → app**: Prevents `src/components/` from depending on `src/app/`
- **API route isolation**: Prevents non-test code from directly importing API routes

### 2. Circular Dependency Prevention
- Detects and prevents circular dependencies that could cause runtime issues

### 3. Orphan Detection
- Warns about potentially unused files (with smart exemptions for legitimate cases)
- Excludes test files, Next.js pages, routes, type definitions, and config files

### 4. Feature Isolation
- Ensures features don't directly depend on other features
- Allows shared dependencies through common modules

### 5. Internal Module Protection
- Prevents external code from accessing internal lib modules

### 6. Test Isolation
- Prevents production code from importing test files
- Prevents production code from importing dev dependencies

### 7. Domain Boundary Enforcement
- **web-vitals domain**: Enforces strict isolation from other lib domains and UI layers
- **i18n domain**: Warns about cross-domain dependencies
- Allows type and constant imports across domains

### 8. Import Path Rules
- Forbids relative cross-layer imports (must use `@/` alias)
- Warns about barrel export dependencies (with sensible exemptions)

### 9. Configuration Options
- TypeScript pre-compilation support
- Correct exclusion patterns for test files and node_modules
- Visualization configuration for dependency graphs

## Test Coverage

The test suite includes **45 comprehensive tests** covering:
- ✓ Configuration structure validation
- ✓ All critical architectural boundary rules
- ✓ Domain boundary enforcement
- ✓ Test and production code separation
- ✓ Import path conventions
- ✓ Orphan detection with proper exemptions
- ✓ Visualization configuration
- ✓ Regression prevention
- ✓ Security and stability rules
- ✓ Edge cases and boundary conditions

## Architecture Decisions

The `.dependency-cruiser.js` configuration implements the architecture described in:
- `docs/plans/2026-03-03-security-architecture-remediation/task-016-dependency-cruiser-rules.md`

Key decisions:
1. **Error vs Warn**: Critical architectural boundaries use `error` severity, while guidance rules use `warn`
2. **Smart Exemptions**: Test files, Next.js framework files, and type definitions are properly exempted from orphan detection
3. **Domain Isolation**: web-vitals and i18n domains have explicit boundary rules to prevent tight coupling
4. **Visualization**: Color-coded graph visualization (red=app, green=components, blue=lib, yellow=features)

## Adding New Rules

When adding new dependency rules to `.dependency-cruiser.js`:

1. Add the rule to the `forbidden` array with:
   - Unique `name`
   - Clear `comment` explaining the rule
   - Appropriate `severity` (`error` or `warn`)
   - Proper `from` and `to` path patterns

2. Add corresponding tests to `dependency-cruiser.test.ts`:
   ```typescript
   it("should enforce your-new-rule", () => {
     const rule = depCruiserConfig.forbidden.find(
       (r: { name: string }) => r.name === "your-rule-name"
     );
     expect(rule).toBeDefined();
     expect(rule.severity).toBe("error");
     // ... additional assertions
   });
   ```

3. Run the tests to verify:
   ```bash
   node __tests__/dependency-cruiser-validation.js
   ```

## Maintenance

These tests serve as:
- **Documentation**: Explicit specification of architectural rules
- **Regression Prevention**: Ensures rules aren't accidentally removed or weakened
- **Validation**: Confirms configuration is well-formed and complete
- **Guidance**: Shows examples of how to test configuration files

Last updated: 2026-03-04