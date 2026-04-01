# Quality Gates & CI/CD

## Current Canonical Rule

For proof semantics, use:
- [`docs/guides/QUALITY-PROOF-LEVELS.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/QUALITY-PROOF-LEVELS.md)
- [`docs/guides/RELEASE-PROOF-RUNBOOK.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/RELEASE-PROOF-RUNBOOK.md)
- [`docs/guides/POLICY-SOURCE-OF-TRUTH.md`](/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/POLICY-SOURCE-OF-TRUTH.md)

That file is the single current definition for:
- `fast gate`
- `local-full proof`
- `ci-proof`
- `release-proof`

Do not infer those meanings from comments spread across scripts or workflows.
This file is a reviewer-facing summary, not the final source of truth when canonical files disagree.

## Complexity Limits

All limits are **function-level** (cyclomatic complexity measured per function).

| File Type | max-lines | max-lines-per-function | complexity | max-depth | max-params |
|-----------|-----------|------------------------|------------|-----------|------------|
| **Production** | 500 | 120 | 15 | 3 | 3 |
| **Config** | 800 | 250 | 18 | - | - |
| **Test** | 800 | 700 | 20 | - | 8 |

### Additional Limits

| Rule | Production | Test |
|------|------------|------|
| `max-nested-callbacks` | 2 | 6 |
| `max-statements` | 20 | 50 |

### Exemptions
- Config files: `*.config.{js,ts,mjs}`
- Dev tools: `src/components/dev-tools/**`, `src/app/**/dev-tools/**`

## Magic Numbers

No bare numbers allowed. Use constants from `src/constants/`.

**ESLint allowlist**: see `no-magic-numbers.ignore` in `eslint.config.mjs` (the list has been expanded significantly; the config file is the source of truth)

Constants organization:
- `src/constants/performance-constants.ts` — Performance thresholds
- `src/constants/time.ts` — Time values

## Performance Monitoring (Lighthouse CI)

Next.js 16 removed build-time size metrics in favor of runtime performance measurement via Lighthouse.

**Configuration**: `lighthouserc.js`
**Canonical threshold source**: `lighthouserc.js`

| Metric | Current Target | Final Goal |
|--------|----------------|------------|
| Performance Score | ≥ 0.85 | ≥ 0.90 |
| total-byte-weight | ≤ 490KB | ≤ 450KB |
| bootup-time | ≤ 4000ms | ≤ 3000ms |
| unused-javascript | ≤ 150KB | ≤ 100KB |

```bash
pnpm perf:lighthouse  # Run Lighthouse CI locally
```

## CI/CD Pipeline

```bash
pnpm ci:local  # One-command local CI
```

Flow: type-check → lint → format → test → security → build → lighthouse

## Lint Scope Integrity

- ESLint / local CI must target project code, not repo-local workspace noise
- Repo-local agent/tooling directories (for example `.agent/`, `.agents/`, `.continue/`, `.factory/`, `.kiro/`, `skills/`) must stay outside lint gates unless intentionally brought under project governance
- If `lint:check` fails on local workspace assets rather than project code, fix scope before trusting the gate result

## AI Smell Hard Gates

- Production code must not import `src/test/**`, `src/testing/**`, or `src/constants/test-*`
  - Enforced structurally by `dependency-cruiser`
- Production quality gates must fail on obvious live placeholder artifacts in `src/app`, `src/components`, or production constants
  - Enforced by `scripts/quality-gate.js`
- `release-proof` must not run with `VALIDATE_CONFIG_SKIP_RUNTIME`, `ALLOW_MEMORY_RATE_LIMIT`, or `ALLOW_MEMORY_IDEMPOTENCY`
  - Enforced by `scripts/release-proof.sh`
- Preview-only degraded modes are not release proof
  - They may exist for preview/debug workflows, but must stay out of final proof claims

## Dependency Upgrade Gate

When upgrading `next` / `react` / `typescript` or dependencies with security alerts, run validation:
- Rules: `/.claude/rules/dependency-upgrade.md`
- Minimum validation: `pnpm ci:local:quick` + `pnpm build`

## Zero Tolerance

- TypeScript: Zero errors
- ESLint: Zero warnings
- Build: No errors
- Lighthouse: Meet all thresholds

## Test Coverage

**Current enforcement source**: `scripts/quality-gate.js`

The table below is roadmap context only. When this summary and `scripts/quality-gate.js` differ, `scripts/quality-gate.js` wins.

**Roadmap Context**:

| Phase | Target | Timeline |
|-------|--------|----------|
| Phase 1 | ≥65% | Baseline |
| Phase 2 | ≥75% | +3 months |
| Phase 3 | ≥80% | +6 months |

**Current Status**: run `pnpm test:coverage` to inspect the latest live numbers

| Module Type | Target | Enforcement |
|-------------|--------|-------------|
| Global | ≥65% | Blocking |
| Core Business | 90-92% | Blocking |
| Security | 90-92% | Blocking |
| Utils | 92-95% | Blocking |
| Performance/i18n | 85-88% | Blocking |
| UI Components | ≥70% | Blocking |

**Incremental Coverage (tiered)**: New/changed code uses two thresholds:
- **≥70%**: Blocking (hard gate) — ensures new code is better than the 65% baseline
- **≥90%**: Warning (soft gate) — encourages high standards without blocking large refactoring PRs

## Performance Budget (Core Web Vitals)

Lighthouse CI enforces progressive thresholds:

| Metric | Current CI Threshold | Good Target |
|--------|---------------------|-------------|
| LCP | ≤ 4500ms | < 2500ms |
| TBT (replaces FID) | ≤ 250ms | < 100ms |
| CLS | ≤ 0.15 | < 0.1 |
| FCP | ≤ 2000ms | < 1800ms |

**Note**: CI thresholds are relaxed for cold-start variance. Production targets align with Google's "Good" CWV standards.

## Failure Policy

- Any gate failure stops pipeline immediately
- Must fix before proceeding

### Bypass Policy

**`RUN_FAST_PUSH=1` (only for `/pr` preflight dedupe)**: when `/pr` has already run `pnpm ci:local:quick` as preflight, use `RUN_FAST_PUSH=1` during push to skip checks that have already been validated in lefthook pre-push (`build-check`, `quality-gate`, `arch-check`, `security-check`). `translation-check` still runs (~2s).

Rule: `RUN_FAST_PUSH=1` must **never** skip checks that have not already been run. Use it only when preflight has passed in the same `/pr` session.

**Emergency bypass**: none. All checks must pass before push. If preflight fails and self-heal cannot fix it, stop the workflow and report back to the user.

## Security Gate Clarification

- Dependency vulnerabilities: `pnpm audit --prod` (blocking).
- Code-level security: Semgrep `ERROR` rules (blocking; PRs use baseline mode to detect only newly introduced findings).
- `scripts/quality-gate.js --mode=ci` does not re-run Semgrep by default because CI already runs it in a dedicated `security` job; local `quality:gate` still includes Semgrep(ERROR) counts to keep feedback closed-loop.

## ESLint Disable Usage

When using `eslint-disable`:
1. Must include specific rule name
2. Must include justification comment
3. Prefer line-level over block-level disables
