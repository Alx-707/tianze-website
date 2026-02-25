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

- Modify: `src/lib/content-parser.ts` — 同步 → 异步 I/O
- Modify: `src/lib/content-query.ts` — 调用方适配（如需 await）
- Modify: `src/lib/__tests__/content-parser.test.ts` — 更新现有同步测试为 async/await
- Possibly modify: `src/lib/content/blog.ts`、`src/lib/content-query.ts` 等调用链上游文件

## Steps

### Step 1: 重构 `parseContentFile` 为 async

将函数签名改为 `async function parseContentFile<T>(...): Promise<ParsedContent<T>>`：
- `fs.existsSync(path)` → `await fs.promises.access(path).then(() => true).catch(() => false)` 或等效
- `fs.readFileSync(path, "utf-8")` → `await fs.promises.readFile(path, "utf-8")`

### Step 2: 重构 `getContentFiles` 为 async

将函数签名改为 `async function getContentFiles(...): Promise<string[]>`：
- `fs.existsSync(dir)` → 异步检查
- `fs.readdirSync(dir)` → `await fs.promises.readdir(dir)`

### Step 3: 更新调用链

追踪所有调用 `parseContentFile` 和 `getContentFiles` 的文件，添加 `await`。关键调用方：
- `src/lib/content-query.ts` 中的 `getAllPosts`、`getPostBySlug` 等函数需要变为 async
- `src/lib/content/blog.ts` 中的 `getAllPostsCached` 已经是 async（使用 `"use cache"`），内部调用添加 `await` 即可

### Step 4: 更新现有测试

现有同步测试需要改为 `async/await` 形式，mock 从 `fs.readFileSync` 改为 `fs.promises.readFile`。

### Step 5: 运行全量测试

确认所有测试（新增 + 现有）通过。

## Verification Commands

```bash
# 确认无同步 fs 调用残留
grep -n "existsSync\|readFileSync\|readdirSync" src/lib/content-parser.ts
# 预期：零匹配

# 运行 content 相关测试
pnpm vitest run src/lib/__tests__/content-parser.test.ts
pnpm vitest run src/lib/__tests__/content-query.test.ts
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
