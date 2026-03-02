# Quality Gates & CI/CD

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

**ESLint allowlist**: `0, 1, -1, 100, 200, 201, 400, 401, 403, 404, 500, 502, 503, 24, 60, 1000`

Constants organization:
- `src/constants/performance.ts` — Performance thresholds
- `src/constants/time.ts` — Time values

## Performance Monitoring (Lighthouse CI)

Next.js 16 removed build-time size metrics in favor of runtime performance measurement via Lighthouse.

**Configuration**: `lighthouserc.js`

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

**Progressive Roadmap** (aligned with `.augment/rules`):

| Phase | Target | Timeline |
|-------|--------|----------|
| Phase 1 (Current) | ≥65% | Baseline |
| Phase 2 | ≥75% | +3 months |
| Phase 3 | ≥80% | +6 months |

**Current Status**: ~72% (exceeds Phase 1 target)

| Module Type | Target | Enforcement |
|-------------|--------|-------------|
| Global | ≥65% | Blocking |
| Core Business | 90-92% | Blocking |
| Security | 90-92% | Blocking |
| Utils | 92-95% | Blocking |
| Performance/i18n | 85-88% | Blocking |
| UI Components | ≥70% | Blocking |

**Incremental Coverage**: New/changed code must achieve ≥90% coverage.

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

**`RUN_FAST_PUSH=1`（/pr 去重专用）**：当 `/pr` 已运行 `pnpm ci:local:quick` 作为 preflight，推送时用 `RUN_FAST_PUSH=1` 跳过 lefthook pre-push 中已验证的检查（build-check, quality-gate, arch-check, security-check）。`translation-check` 仍然运行（~2s）。

规则：`RUN_FAST_PUSH=1` 必须**绝不**跳过尚未运行的检查。仅在同一 `/pr` 会话中 preflight 已通过时使用。

**紧急绕过**：不存在。所有检查必须通过才能推送。如果 preflight 失败且 self-heal 无法修复，流程中止，报告给用户。

## Security Gate Clarification

- 依赖漏洞：`pnpm audit --prod`（阻断）。
- 代码级安全：Semgrep 的 `ERROR` 级规则（阻断，PR 使用 baseline 仅检测新增问题）。
- `scripts/quality-gate.js --mode=ci` 默认不重复执行 Semgrep（CI 已在独立 `security` job 运行）；本地 `quality:gate` 会纳入 Semgrep(ERROR) 统计以保持反馈闭环。

## ESLint Disable Usage

When using `eslint-disable`:
1. Must include specific rule name
2. Must include justification comment
3. Prefer line-level over block-level disables
