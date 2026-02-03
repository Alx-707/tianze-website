---
name: verification-first
description: 强制验证优先的代码生成，无法验证则拒绝生成
triggers:
  - 实现
  - 添加
  - 修改
  - 重构
  - 修复
---

# Verification-First 工作流

> "Giving the AI a way to verify its own work improves the quality of the final result by 2-3x." — Boris Cherny

## 触发条件

任何代码生成/修改请求。

## Step 1: 确定验证方式

在写任何代码前，必须确定验证方式：

| 任务类型 | 验证方式 | 命令 |
|---------|---------|------|
| 函数/工具类 | 单元测试 | `pnpm test --related` |
| API 端点 | 集成测试 | `pnpm test` + curl |
| 用户流程 | E2E 测试 | `pnpm test:e2e` |
| 类型定义 | 类型检查 | `pnpm type-check` |
| 性能优化 | Lighthouse | `pnpm perf:lighthouse` |
| UI 变更 | 视觉回归 | `pnpm test:visual` |

**无法确定时询问**：
> "这个功能如何验证？1) 单元测试 2) E2E 测试 3) 类型检查 4) 手动验证"

**无法验证 → 拒绝生成**，引导用户先设计验证方式。

## Step 2: 建立基线

运行现有验证确认当前状态：

```bash
pnpm type-check
pnpm test --related
```

记录当前状态（通过/失败/跳过数量）。

## Step 3: 测试先行

1. 先写失败的测试（描述期望行为）
2. 运行确认测试失败
3. 再实现功能

## Step 4: 验证循环

实现后运行验证：

```
验证通过？
  ├─ 是 → 继续下一步
  └─ 否 → 分析失败原因 → 修复 → 重新验证（最多 3 次）
```

**3 次迭代仍失败** → 停止，报告问题，请求人工介入。

## Step 5: 完成确认

所有验证通过后才声称完成：

```bash
pnpm type-check && pnpm test --related && echo "✅ 验证通过"
```

## 禁止行为

- ❌ 声称"应该可以工作"但未运行验证
- ❌ 跳过测试直接实现
- ❌ 验证失败后声称完成
- ❌ 无法验证时仍然生成代码

## 使用示例

```
用户：实现产品筛选功能

Agent：
1. [确定验证] 这是组件功能，使用单元测试验证
2. [基线] 运行 pnpm test --related... 当前 0 个相关测试
3. [测试先行] 编写 ProductFilter.test.tsx
4. [验证] 运行测试... 失败（预期）
5. [实现] 编写 ProductFilter 组件
6. [验证] 运行测试... 通过 ✅
7. [验证] pnpm type-check... 通过 ✅
8. 完成
```
