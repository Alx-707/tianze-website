# Task 007: phase6 路由表单源生成

**depends-on:** —

## Description

将 phase6 gateway worker 的路由规则从"双写"改为从 `API_ROUTE_BINDING_RULES` 单一真相源生成。当前的 `routeRules` match 函数被序列化为字符串后脱离了原始定义，改一处漏一处会直接分流错。

## Execution Context

**Task Number**: 007 of 027
**Phase**: B（Cloudflare 环境稳定性）
**Prerequisites**: 无（可与 Task 006 并行）

## 审查证据

- `scripts/cloudflare/build-phase6-workers.mjs:28-50`：`API_ROUTE_BINDING_RULES` 定义
- `scripts/cloudflare/build-phase6-workers.mjs:230-252`：`routeRules` 在生成的 gateway worker 中重新硬编码
- `scripts/cloudflare/build-phase6-workers.mjs:254`：resolver 用索引拼字符串

## BDD Scenarios

### Scenario 1: 路由规则从单一源生成
```gherkin
Scenario: gateway worker 路由规则从 API_ROUTE_BINDING_RULES 生成
  Given build-phase6-workers.mjs 中定义了 API_ROUTE_BINDING_RULES
  When 执行 phase6 构建脚本
  Then 生成的 gateway worker 中的路由匹配逻辑与 API_ROUTE_BINDING_RULES 完全一致
  And 不存在独立维护的第二份路由规则
```

### Scenario 2: 新增路由只需改一处
```gherkin
Scenario: 添加新 API 路由绑定规则
  Given 在 API_ROUTE_BINDING_RULES 中添加一条新规则
  When 重新生成 gateway worker
  Then 新规则自动出现在生成的 resolver 中
  And 无需手动同步其他位置
```

## Files to Modify

- `scripts/cloudflare/build-phase6-workers.mjs` — 重构 `createGatewayWorkerSource()` 使其从 `API_ROUTE_BINDING_RULES` 动态生成 `routeRules` 和 resolver

## Steps

### Step 1: 分析当前生成逻辑

理解 `createGatewayWorkerSource()` 如何使用 `API_ROUTE_BINDING_RULES` 和 `routeRules`，确认 match 函数的模式（路径前缀匹配 / 精确匹配）。

### Step 2: 改为数据驱动

将 `API_ROUTE_BINDING_RULES` 中的 `match` 改为数据化表示（如 `{ type: "prefix", pattern: "/api/contact" }`），在生成的 gateway worker 中用通用 matcher 函数匹配。

或者更简单：保持 `API_ROUTE_BINDING_RULES` 结构不变，但在 `createGatewayWorkerSource()` 中**从** `API_ROUTE_BINDING_RULES` **循环生成** routeRules 数组和 resolver if-else 链，而不是手写第二份。

### Step 3: 添加最小测试

创建 `scripts/cloudflare/__tests__/build-phase6-workers.test.mjs`，验证：
- 生成的 gateway worker source 包含所有 `API_ROUTE_BINDING_RULES` 中的路由
- 添加/删除一条规则后，生成结果自动跟随变化

## Verification Commands

```bash
node scripts/cloudflare/build-phase6-workers.mjs --dry-run 2>/dev/null || echo "需要检查脚本是否支持 dry-run"
pnpm type-check
```

## Success Criteria

- `routeRules` 和 resolver 从 `API_ROUTE_BINDING_RULES` 单一源生成
- 不存在需要手动同步的第二份路由定义
- 最小测试覆盖路由分发
- 构建脚本运行正常

## Commit

```
refactor(deploy): generate phase6 route rules from single source
```
