# Task 023: 性能修复

**depends-on:** Task 015

## Description

修复两个已确认的性能问题：Buffer polyfill 被带进 client bundle（通过 product-gallery 导入 blur-placeholder）；首页 sections 全标 `"use client"` 但大部分不需要。

## Execution Context

**Task Number**: 023 of 027
**Phase**: F（契约 + 性能 + 清理）
**Prerequisites**: Task 015（emails 迁移后 import 路径可能变化）

## 审查证据

- `src/lib/image/blur-placeholder.ts:41`：使用 `Buffer.from(...).toString("base64")`
- `src/components/products/product-gallery.tsx:1`：`"use client"` + 从 `@/lib/image` 导入
- Buffer polyfill 约 5-8KB gzipped 进入 client bundle
- `src/components/sections/hero-section.tsx:1`：`"use client"` — 首页 sections 全标客户端

## BDD Scenarios

### Scenario 1: Buffer 不在 client bundle
```gherkin
Scenario: blur-placeholder 的 Buffer 调用不进入 client bundle
  Given product-gallery 是客户端组件
  When 构建生产包
  Then client bundle 中不包含 Buffer polyfill
  And blur placeholder 在 server 端预计算后传给 client
```

### Scenario 2: Server Component 默认
```gherkin
Scenario: 无交互的 section 组件是 Server Component
  Given 首页 section 组件
  When 组件不包含 useState/useEffect/事件处理
  Then 组件不标记 "use client"
  And 只有包含动画/交互的子组件保留 "use client"（islands 模式）
```

## Files to Modify

- `src/lib/image/blur-placeholder.ts` — 确保只在 server 端调用（不被 client component 直接导入）
- `src/components/products/product-gallery.tsx` — blur data 通过 props 从 server 传入，而非 client 端计算
- `src/components/sections/hero-section.tsx` — 评估是否可以改为 Server Component + client islands

## Steps

### Step 1: Buffer 问题修复

将 blur-placeholder 的调用从 client component 移到 server 端：
- 方案 A: 在 page.tsx（Server Component）中预计算 blur data，通过 props 传给 product-gallery
- 方案 B: 将 blur-placeholder 标记为 server-only（`import "server-only"`），确保不被 client 导入

### Step 2: RSC/CSR 边界评估

检查 `src/components/sections/` 下所有 `"use client"` 组件，评估哪些可以改为 Server Component：
- 如果只使用 `useTranslations`：next-intl 在 Server Component 中也支持（用 `getTranslations`）
- 如果使用 `AnimatedCounter` 等动画组件：保留 client，但将静态内容部分提取为 Server Component

### Step 3: 验证 bundle 大小

```bash
ANALYZE=true pnpm build
# 检查 client bundle 中是否还有 Buffer polyfill
```

## Verification Commands

```bash
pnpm build
pnpm type-check
pnpm test
```

## Success Criteria

- Client bundle 不包含 Buffer polyfill
- 至少部分首页 sections 改为 Server Component
- 构建成功
- Lighthouse 性能分数不下降

## Commit

```
perf: remove Buffer from client bundle, convert sections to RSC
```
