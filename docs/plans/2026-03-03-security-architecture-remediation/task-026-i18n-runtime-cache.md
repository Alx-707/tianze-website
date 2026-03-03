# Task 026: i18n 运行时缓存/失效策略

**depends-on:** Task 017

## Description

Task 017 解决了"文件层面的真相源"，但未覆盖运行时缓存错位问题：`load-messages.ts` 中 `unstable_cache` 外层包裹的 `fetchWithFallback` 内部又带 `fetch(..., { cache: "force-cache", next: { revalidate } })`，形成双层缓存。`revalidateTag` 只失效 `unstable_cache` 层，内层 `fetch` cache 不穿透，导致"翻译改了但线上不生效/偶发旧文案"。

## Execution Context

**Task Number**: 026 of 027
**Phase**: E（真相源收敛）
**Prerequisites**: Task 017（i18n canonical 格式统一）

## 审查证据

- `src/lib/load-messages.ts:95-106`：外层 `unstable_cache` 带 `tags: [i18nTags.critical(locale), i18nTags.all()]`
- `src/lib/load-messages.ts:76-78`：内层 `fetchWithFallback` 使用 `fetch(url, { cache: "force-cache", next: { revalidate } })`——这是第二层独立缓存
- `src/lib/cache/invalidate.ts:67-71`：`invalidateI18n.critical(locale)` 调用 `revalidateTag(i18nTags.critical(locale))`，只失效 `unstable_cache` 层
- **双层缓存问题**：`unstable_cache` 失效后重新执行 `loadCore` → `fetchWithFallback`，但 `fetch` 的 `force-cache` 可能返回旧数据

## BDD Scenarios

### Scenario 1: 翻译更新后线上立即生效
```gherkin
Scenario: revalidateTag 后翻译内容更新
  Given 翻译文件已更新并部署
  When 调用 invalidateI18n.critical("en")（即 revalidateTag("i18n:critical:en")）
  Then 下一次页面请求使用新翻译
  And 不出现"部分请求用新翻译、部分用旧翻译"的状态
```

### Scenario 2: 缓存层不重叠
```gherkin
Scenario: 翻译加载只有一层缓存
  Given load-messages 函数
  When 检查缓存机制
  Then 只有一层缓存（"use cache" 或 fetch cache，不同时存在）
  And revalidateTag 能完整失效该层
```

## Files to Modify

- `src/lib/load-messages.ts` — 确认/修复缓存层结构
- `src/lib/cache/invalidate.ts` — 确认 tag 穿透到所有缓存层

## Steps

### Step 1: 审计 load-messages 的缓存层

确认 `load-messages.ts` 中的缓存层级：已知外层 `unstable_cache`（L95-106）+ 内层 `fetch(..., { cache: "force-cache" })`（L76-78）。绘制缓存层级图，标注各层的 tag/revalidate 配置。

### Step 2: 合并或穿透缓存层

两种修复方案：
- **方案 A**: 合并为一层缓存（推荐，最简），移除多余的缓存层
- **方案 B**: 给内层 `fetch` 也加 `tags`，确保 `revalidateTag` 穿透

### Step 3: 添加验证测试

验证 revalidateTag 后下一次读取返回新数据。

## Verification Commands

```bash
pnpm vitest run src/lib/__tests__/load-messages.test.ts --reporter=verbose
pnpm type-check
pnpm build
```

## Success Criteria

- load-messages 只有一层有效缓存
- revalidateTag 能完整失效翻译缓存
- 测试验证失效后读取新数据

## Commit

```
fix(i18n): consolidate runtime cache layers for reliable invalidation
```
