# Task 002: Replay 防护修正 — 实现 (Green)

**depends-on:** Task 001

## Description

修复 `submittedAt` 校验的两条绕过路径：NaN 静默放行和缺失时 now 兜底。使 Task 001 的失败测试全部通过。

## Execution Context

**Task Number**: 002 of 027
**Phase**: A（安全快赢）
**Prerequisites**: Task 001 测试已写好且处于 Red 状态

## 审查证据

- `src/app/actions.ts:151`：`getFormDataString(formData, "submittedAt") || new Date().toISOString()` — 删除 `|| new Date()...` 兜底
- `src/app/api/contact/contact-api-validation.ts:72`：`new Date(formData.submittedAt)` — 缺少 `Number.isFinite()` 检查
- `src/app/actions.ts:86`：同路径

## BDD Scenarios

（与 Task 001 相同，此处为 Green 实现）

### Scenario 1: 拒绝缺失 submittedAt 的提交
```gherkin
Scenario: 拒绝缺失 submittedAt 的表单提交
  Given 一个表单提交请求
  When submittedAt 字段缺失
  Then 返回 400/422 错误
```

### Scenario 2: 拒绝不可解析的 submittedAt
```gherkin
Scenario: 拒绝不可解析的 submittedAt
  Given 一个表单提交请求
  When submittedAt 为 "not-a-date" 或空字符串
  Then 返回 400/422 错误
```

## Files to Modify

- `src/app/actions.ts` — 删除 submittedAt 的 `|| new Date().toISOString()` 兜底；submittedAt 缺失时直接返回错误
- `src/app/api/contact/contact-api-validation.ts` — 添加 `Date.parse()` + `Number.isFinite()` 校验；不合法直接返回 400/422

## Steps

### Step 1: 修复 Server Action 路径

在 `src/app/actions.ts` 中：
- 删除 `submittedAt` 的 `|| new Date().toISOString()` 兜底
- 如果 `submittedAt` 缺失或 `Date.parse(submittedAt)` 不是有限数，返回明确错误

### Step 2: 修复 API Route 路径

在 `src/app/api/contact/contact-api-validation.ts` 中：
- 在时间窗口比较前添加 `Number.isFinite(Date.parse(submittedAt))` 检查
- NaN 直接返回 400/422，不进入后续比较

### Step 3: 确保前端提交真实 submittedAt

确认前端表单组件已经提交 submittedAt 字段（不是修复前端，只是确认行为不变）。

## Verification Commands

```bash
pnpm vitest run src/app/api/contact/__tests__/ --reporter=verbose
pnpm vitest run src/app/__tests__/ --reporter=verbose
pnpm type-check
```

## Success Criteria

- Task 001 所有测试通过（Green）
- 无 TypeScript 类型错误
- 现有联系表单相关测试不回归

## Commit

```
fix(security): reject invalid/missing submittedAt in replay protection
```
