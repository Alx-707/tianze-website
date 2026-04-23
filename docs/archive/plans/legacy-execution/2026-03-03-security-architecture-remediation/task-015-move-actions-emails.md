# Task 015: 迁移 actions + emails 到正确层

**depends-on:** Task 014

## Description

修复两个依赖方向违规：
1. `src/lib/resend-core.tsx` 依赖 `src/components/emails` — lib 反向依赖 components
2. `src/components/forms/contact-form-container.tsx` 依赖 `src/app/actions` — components 反向依赖 app

## Execution Context

**Task Number**: 015 of 027
**Phase**: D（边界重构）
**Prerequisites**: Task 014（共享逻辑已抽出 API 路由层）

## 审查证据

- `src/lib/resend-core.tsx:15-19`：从 `@/components/emails` 导入邮件模板
- `src/components/forms/contact-form-container.tsx:25`：从 `@/app/actions` 导入 `contactFormAction`

## BDD Scenarios

### Scenario 1: lib 不依赖 components
```gherkin
Scenario: src/lib 不从 src/components 导入
  Given 代码库中 src/lib 下的所有文件
  When 检查 import 语句
  Then 没有文件从 src/components/** 导入
```

### Scenario 2: components 不依赖 app
```gherkin
Scenario: src/components 不从 src/app 导入
  Given 代码库中 src/components 下的所有文件
  When 检查 import 语句
  Then 没有文件从 src/app/** 导入
```

## Files to Modify

**邮件模板迁移：**
- **移动**: `src/components/emails/**` → `src/emails/**` 或 `src/lib/emails/**`
- **更新**: `src/lib/resend-core.tsx` — import 路径指向新位置

**Server Actions 迁移：**
- **移动**: `src/app/actions.ts` → `src/lib/actions/contact.ts`（或 `src/server/actions/contact.ts`）
- **更新**: `src/components/forms/contact-form-container.tsx` — import 路径指向新位置
- **更新**: `src/app/[locale]/*/page.tsx` 等引用 actions 的页面

## Steps

### Step 1: 迁移邮件模板

将 `src/components/emails/` 整体移到 `src/emails/`（与 `src/components` 平级，因为邮件模板不是 UI 组件）。更新所有 import。

### Step 2: 迁移 Server Actions

将 `src/app/actions.ts` 移到 `src/lib/actions/contact.ts`。Next.js Server Actions 可以定义在任何 `"use server"` 文件中，不要求在 `src/app` 下。更新所有 import。

### Step 3: 验证依赖方向

```bash
# lib 不依赖 components
grep -rn "from.*@/components" src/lib/ --include="*.ts" --include="*.tsx" | wc -l
# components 不依赖 app
grep -rn "from.*@/app" src/components/ --include="*.ts" --include="*.tsx" | wc -l
```
两个命令应输出 0。

## Verification Commands

```bash
pnpm type-check
pnpm test
pnpm build
```

## Success Criteria

- `src/lib` 无 `@/components` 导入
- `src/components` 无 `@/app` 导入
- 邮件模板位于 `src/emails/` 或 `src/lib/emails/`
- Server Actions 位于 `src/lib/actions/`
- 所有测试通过
- 构建成功

## Commit

```
refactor: move email templates and server actions to correct layers
```
