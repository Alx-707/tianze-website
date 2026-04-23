# Task 001: Replay 防护修正 — 测试 (Red)

**depends-on:** —

## Description

为 `submittedAt` 时间戳校验添加边界测试，覆盖 NaN 绕过和缺失兜底两条攻击路径。测试在当前实现下应**失败**（Red）。

## Execution Context

**Task Number**: 001 of 027
**Phase**: A（安全快赢）
**Prerequisites**: 无

## 审查证据

- `src/app/actions.ts:151`：`submittedAt` 缺失时用 `new Date().toISOString()` 兜底，等于"帮攻击者补字段"
- `src/app/api/contact/contact-api-validation.ts:72`：`new Date(invalid).getTime()` 返回 NaN，NaN 与任何数比较均为 false，时间窗口校验被绕过
- `src/app/actions.ts:86`：同样的 NaN 绕过路径

## BDD Scenarios

### Scenario 1: 拒绝缺失 submittedAt 的提交
```gherkin
Scenario: 拒绝缺失 submittedAt 的表单提交
  Given 一个表单提交请求
  When submittedAt 字段缺失
  Then 返回 400/422 错误，errorCode 表示 submittedAt 必填
  And 不执行任何后续处理（Turnstile 验证、邮件发送等）
```

### Scenario 2: 拒绝不可解析的 submittedAt
```gherkin
Scenario: 拒绝不可解析的 submittedAt
  Given 一个表单提交请求
  When submittedAt 为 "not-a-date" 或 "undefined" 或空字符串
  Then 返回 400/422 错误
  And Date.parse(submittedAt) 不产生 NaN 被静默放行的情况
```

### Scenario 3: 拒绝过期的 submittedAt（replay 窗口外）
```gherkin
Scenario: 拒绝超出时间窗口的 submittedAt
  Given 一个表单提交请求
  When submittedAt 为 24 小时前的有效时间戳
  Then 返回错误，表示提交已过期
```

### Scenario 4: 接受有效的 submittedAt
```gherkin
Scenario: 接受窗口内的有效 submittedAt
  Given 一个表单提交请求
  When submittedAt 为 5 分钟前的有效 ISO 时间戳
  Then 时间戳校验通过，继续后续流程
```

## Files to Modify/Create

- Modify: `src/app/api/contact/__tests__/contact-api-validation.test.ts`（或创建）
- Modify: `src/app/__tests__/actions.test.ts`（若存在）

## Steps

### Step 1: 定位现有测试

查找 `contact-api-validation` 和 `actions` 相关测试文件，了解现有 submittedAt 校验的测试覆盖。

### Step 2: 添加 Scenario 1-4 对应的测试用例

为 Server Action（`src/app/actions.ts`）和 API Route（`src/app/api/contact/contact-api-validation.ts`）两条路径都添加测试：
- Scenario 1: 不传 submittedAt → 期望拒绝（当前实现会兜底为 now，测试应 **失败**）
- Scenario 2: 传 `"garbage"` / `""` / `"undefined"` → 期望拒绝（当前 NaN 绕过，测试应 **失败**）
- Scenario 3: 传 24h 前时间 → 期望拒绝
- Scenario 4: 传 5min 前有效时间 → 期望通过

### Step 3: 运行测试确认 Red 状态

确认 Scenario 1、2 失败；Scenario 3、4 的当前行为需要验证。

## Verification Commands

```bash
pnpm vitest run src/app/api/contact/__tests__/ --reporter=verbose
pnpm vitest run src/app/__tests__/ --reporter=verbose
```

## Success Criteria

- Scenario 1、2 测试失败（Red）— 证明当前实现存在 NaN/缺失兜底漏洞
- Scenario 3、4 行为已确认
- 无 TypeScript 类型错误

## Commit

```
test(security): add submittedAt validation bypass scenarios
```
