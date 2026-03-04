# Task 014: 抽取共享逻辑出 API 路由层

**depends-on:** —

## Description

将被多个消费者（Server Actions、API Routes、测试）复用的逻辑从 `src/app/api/**` 抽到 `src/lib/**`。当前 `src/app/actions.ts:26-27` 直接从 `src/app/api/contact/` 导入，形成"API 路由 = 共享库"的反模式。

## Execution Context

**Task Number**: 014 of 027
**Phase**: D（边界重构）
**Prerequisites**: 无（建议在 Phase A-C 完成后执行，避免合并冲突）

## 审查证据

- `src/app/actions.ts:26`：`import { verifyTurnstile } from "@/app/api/contact/contact-api-utils"`
- `src/app/actions.ts:27`：`import { processFormSubmission } from "@/app/api/contact/contact-api-utils"`
- `src/app/api/inquiry/route.ts:20`：`import { verifyTurnstile } from "@/app/api/contact/contact-api-utils"`

## BDD Scenarios

### Scenario 1: 共享逻辑不在 API 路由层
```gherkin
Scenario: 可复用逻辑位于 src/lib
  Given 代码库中的 Turnstile 验证、表单处理等可复用逻辑
  When 检查这些模块的文件路径
  Then 它们位于 src/lib/**（而非 src/app/api/**）
  And src/app/api/** 中的路由只做请求处理编排，不导出可复用函数
```

### Scenario 2: 非测试代码不 import API 路由
```gherkin
Scenario: 非测试代码不从 src/app/api 导入
  Given 代码库中的所有 TypeScript 文件
  When 检查 import 语句
  Then 除测试文件外，没有文件从 src/app/api/** 导入
```

## Files to Modify

- **移动**: `src/app/api/contact/contact-api-utils.ts` 中的共享函数 → `src/lib/turnstile.ts` + `src/lib/form-processing.ts`（或合适的模块名）
- **更新**: `src/app/actions.ts`、`src/app/api/contact/route.ts`、`src/app/api/inquiry/route.ts` 等 — 更新 import 路径
- **保留**: `src/app/api/contact/contact-api-utils.ts` 如果还有路由专用逻辑，否则删除

## Steps

### Step 1: 分析 contact-api-utils 的导出

列出 `contact-api-utils.ts` 的所有导出函数，识别哪些被多个消费者使用（需要抽出）、哪些只被 route.ts 使用（可留在原位）。

### Step 2: 创建 lib 模块

将可复用函数移到 `src/lib/` 下合适的模块。保持函数签名不变，只改文件位置。

### Step 3: 批量更新 import

用 IDE 全局替换或 codemod 更新所有 import 路径。

### Step 4: 验证无遗漏

```bash
grep -rn "from.*@/app/api" src/ --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v ".test."
```
应返回空（测试文件除外）。

## Verification Commands

```bash
pnpm type-check
pnpm test
pnpm build
# 验证无非测试代码 import API 路由
grep -rn "from.*@/app/api" src/ --include="*.ts" --include="*.tsx" | grep -v "__tests__" | grep -v ".test." | wc -l
# 应输出 0
```

## Success Criteria

- 共享逻辑已迁移到 `src/lib/`
- 非测试代码不从 `src/app/api/` 导入
- 所有测试通过
- 构建成功

## Commit

```
refactor: extract shared logic from api routes to src/lib
```
