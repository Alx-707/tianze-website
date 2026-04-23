# Task 005: Content parser 异步 I/O — 重构实现

**depends-on:** Task 004

## Description

将 `content-parser.ts` 中的同步 I/O（`existsSync`、`readFileSync`、`readdirSync`）替换为异步等效（`fs.promises.access`、`fs.promises.readFile`、`fs.promises.readdir`）。同步更新所有调用方以适配 async 接口。

## Execution Context

**Task Number**: 005 of 009
**Phase**: B（代码清理）
**Severity**: 低-中
**Prerequisites**: Task 004 的异步 API 测试已就位

## BDD Scenarios

与 Task 004 相同的 Scenario 1-4，此任务目标是使**全部测试通过**（Green）。

## Files to Modify/Create

**核心变更（content-parser 层）：**
- Modify: `src/lib/content-parser.ts` — 同步 → 异步 I/O
- Modify: `src/lib/__tests__/content-parser.test.ts` — 更新现有同步测试为 async/await

**直接调用方（content-query 层）：**
- Modify: `src/lib/content-query/queries.ts` — `getAllPosts`/`getAllPages`/`getContentBySlug`/`getPostBySlug`/`getPageBySlug` 全部改为 async
- Modify: `src/lib/content-query/stats.ts` — `getContentStats` 中调用 `getAllPosts`/`getAllPages` 需 await
- Modify: `src/lib/content-query/__tests__/queries.test.ts` — 测试适配 async
- Modify: `src/lib/content-query/__tests__/stats.test.ts` — 测试适配 async
- Modify: `src/lib/content-query/__tests__/filters.test.ts` — 如依赖 queries 则适配
- Modify: `src/lib/content-query/__tests__/sorting.test.ts` — 如依赖 queries 则适配
- Modify: `src/lib/content.ts` — barrel re-export（类型签名自动跟随，需确认无问题）

**上游消费层：**
- Modify: `src/lib/content/blog.ts` — `getAllPostsCached`/`getPostBySlugCached` 内部调用添加 await（已是 async）
- Modify: `src/lib/content/products-source.ts` — `getAllProductFiles` 及 `getProductFilesInLocale` 改为 async
- Modify: `src/lib/content/products.ts` — 5 个 cached 函数内部调用添加 await（函数本身已是 async，仅需在第 81/137/156/175/195 行加 await）
- Modify: `src/lib/__tests__/content-blog-wrapper.test.ts` — 测试适配
- Modify: `src/app/[locale]/privacy/page.tsx` — `getPageBySlug` 调用添加 await
- Modify: `src/app/[locale]/terms/page.tsx` — 同上
- Modify: `src/app/[locale]/faq/page.tsx` — 同上
- Modify: `src/app/sitemap.ts` — 如调用 content-query 函数需适配

## Steps

### Step 1: 重构 `parseContentFile` 为 async

将函数签名改为 `async function parseContentFile<T>(...): Promise<ParsedContent<T>>`：
- `fs.existsSync(path)` → `await fs.promises.access(path).then(() => true).catch(() => false)` 或等效
- `fs.readFileSync(path, "utf-8")` → `await fs.promises.readFile(path, "utf-8")`

### Step 2: 重构 `getContentFiles` 为 async

将函数签名改为 `async function getContentFiles(...): Promise<string[]>`：
- `fs.existsSync(dir)` → 异步检查
- `fs.readdirSync(dir)` → `await fs.promises.readdir(dir)`

### Step 3: 更新 content-query 层

`src/lib/content-query/queries.ts` 中所有函数改为 async：
- `getAllPosts` → `async getAllPosts` — 内部 `getContentFiles` 和 `parseContentFile` 调用添加 await
- `getAllPages` → `async getAllPages`
- `getContentBySlug` → `async getContentBySlug`
- `getPostBySlug` → `async getPostBySlug`
- `getPageBySlug` → `async getPageBySlug`

`src/lib/content-query/stats.ts` 中 `getContentStats` 改为 async（调用 `getAllPosts`/`getAllPages`）。

### Step 4: 更新 content 消费层

- `src/lib/content/products-source.ts` — `getAllProductFiles` 改为 async（第 39 行调用 `parseContentFile`）
- `src/lib/content/products.ts` — 5 个 cached 函数（`getAllProductsCached`/`getProductBySlugCached`/`getProductCategoriesCached`/`getProductStandardsCached`/`getFeaturedProductsCached`）内部调用 products-source 的函数前添加 await（函数本身已是 async，无需改签名）
- `src/lib/content/blog.ts` — 内部调用添加 await（函数本身已是 async）
- `src/app/[locale]/privacy/page.tsx:269` — `getPageBySlug("privacy", locale)` 改为 `await getPageBySlug(...)`
- `src/app/[locale]/terms/page.tsx:146` — 同上
- `src/app/[locale]/faq/page.tsx:147` — 同上
- `src/app/sitemap.ts` — 检查并适配

### Step 5: 更新 barrel export

`src/lib/content.ts` re-export 的函数签名会自动跟随源文件变更，但需确认 TypeScript 类型推断正确。

### Step 6: 更新现有测试

以下测试文件需要改为 `async/await` 形式：
- `src/lib/__tests__/content-parser.test.ts` — mock 从 `fs.readFileSync` 改为 `fs.promises.readFile`
- `src/lib/content-query/__tests__/queries.test.ts` — 所有 query 调用添加 await
- `src/lib/content-query/__tests__/stats.test.ts` — stats 调用添加 await
- `src/lib/content-query/__tests__/filters.test.ts` — 如需适配
- `src/lib/content-query/__tests__/sorting.test.ts` — 如需适配
- `src/lib/__tests__/content-blog-wrapper.test.ts`
- 页面测试（privacy/terms/faq 对应的 `__tests__/page.test.tsx`）

### Step 7: 运行全量测试

确认所有测试（新增 + 现有）通过。

## Verification Commands

```bash
# 确认无同步 fs 调用残留
grep -n "existsSync\|readFileSync\|readdirSync" src/lib/content-parser.ts
# 预期：零匹配

# 运行 content 相关测试
pnpm vitest run src/lib/__tests__/content-parser.test.ts
pnpm vitest run src/lib/content-query/__tests__/queries.test.ts
pnpm vitest run src/lib/content-query/__tests__/stats.test.ts
pnpm vitest run src/lib/content-query/__tests__/filters.test.ts
pnpm vitest run src/lib/content-query/__tests__/sorting.test.ts
pnpm vitest run src/lib/__tests__/content-blog-wrapper.test.ts

# TypeScript + Lint + 全量测试
pnpm type-check
pnpm lint:check
pnpm test

# 生产构建
pnpm build
```

## Success Criteria

- `content-parser.ts` 中无 `existsSync`、`readFileSync`、`readdirSync` 调用
- 所有函数签名正确返回 Promise
- Task 004 的 4 个新增测试全部通过（Green）
- 所有现有测试通过（无回归）
- `pnpm type-check` 零错误
- `pnpm build` 成功

## Commit

```
refactor(content): migrate content parser to async file I/O

- Replace existsSync/readFileSync/readdirSync with fs.promises equivalents
- Update content-query and blog wrapper call chains to async/await
- Eliminates event loop blocking on cache miss / cold start
```
