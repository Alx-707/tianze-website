# Task 024: 路径安全 + MDX + P2 清理

**depends-on:** —

## Description

收尾修复：路径遍历防御改用 `path.relative` 模式、MDX 链接添加协议白名单、清理自造 glob matcher 和误导性注释。

## Execution Context

**Task Number**: 024 of 027
**Phase**: F（契约 + 性能 + 清理）
**Prerequisites**: 无

## 审查证据

- `src/lib/content-utils.ts:127`：`startsWith(resolvedBaseDir)` 有前缀混淆边缘（`/a/b` 误匹配 `/a/b-other`），虽当前调用路径不可触达但应加固
- `mdx-components.tsx:35`：`<a href={href}>` 无协议白名单，MDX 内容当前为开发者控制
- `scripts/quality-gate.js:111`：自造 glob matcher
- `messages/en/critical.json:2`：误导性注释（"ONLY USED FOR VITEST MOCKS" 但实际是运行时文件）

## BDD Scenarios

### Scenario 1: 路径遍历防御（path.relative 模式）
```gherkin
Scenario: 同前缀 sibling 目录不通过路径校验
  Given allowedBaseDir="/app/content"
  When filePath 解析为 "/app/content-evil/hack.mdx"
  Then 校验失败（path.relative 结果以 ".." 开头）
```

### Scenario 2: MDX 链接协议白名单
```gherkin
Scenario: MDX 中只允许安全协议的链接
  Given MDX 内容中包含链接
  When href 使用 https:// 或 mailto: 或相对路径
  Then 链接正常渲染
  When href 使用 javascript: 或 data:
  Then 链接被过滤（href 设为 "#" 或不渲染）
```

## Files to Modify

- `src/lib/content-utils.ts` — 路径校验改为 `path.relative` 模式
- `mdx-components.tsx` — 添加协议白名单
- `scripts/quality-gate.js` — 替换自造 glob matcher 为 `picomatch` 或 `minimatch`
- `messages/en/critical.json` — 修正误导性注释

## Steps

### Step 1: 路径遍历防御

将 `content-utils.ts:127` 的 `startsWith` 检查改为：
```typescript
const relative = path.relative(resolvedBaseDir, resolvedPath);
if (relative.startsWith('..') || path.isAbsolute(relative)) {
  throw new ContentError(...);
}
```

添加单测覆盖 `../dir-evil` 同前缀 sibling 目录的 case。

### Step 2: MDX 协议白名单

在 `mdx-components.tsx` 的 `a` 组件中添加：
```typescript
const SAFE_PROTOCOLS = ['https:', 'http:', 'mailto:', 'tel:'];
const isSafe = !href || href.startsWith('/') || href.startsWith('#') ||
  SAFE_PROTOCOLS.some(p => href.startsWith(p));
```

### Step 3: 替换自造 glob matcher

将 `quality-gate.js:111` 的自造匹配逻辑替换为 `picomatch`（已被 Tailwind/ESLint 间接依赖，无新增包大小）。

### Step 4: 修正注释

移除 `messages/en/critical.json:2` 的 "ONLY USED FOR VITEST MOCKS" 注释。

## Verification Commands

```bash
pnpm vitest run src/lib/__tests__/content-utils.test.ts --reporter=verbose
pnpm type-check
pnpm test
```

## Success Criteria

- 路径遍历防御使用 `path.relative` 模式
- MDX 链接有协议白名单
- 自造 glob matcher 被替换
- 误导性注释已修正
- 所有测试通过

## Commit

```
fix: path traversal defense, mdx protocol allowlist, cleanup
```
