# Task 004: Content parser 异步 I/O — 添加测试

**depends-on:** —

## Description

为 `content-parser.ts` 的核心函数（`parseContentFile`、`getContentFiles`）编写异步版本的接口测试。这些测试定义了异步 API 的期望行为，在当前同步实现下应**失败**（Red），为 Task 005 的重构提供验证基础。

## Execution Context

**Task Number**: 004 of 009
**Phase**: B（代码清理）
**Severity**: 低-中
**Prerequisites**: 无

## BDD Scenarios

### Scenario 1: parseContentFile 返回 Promise
- Given: 一个有效的 MDX 文件路径
- When: 调用 `parseContentFile(filePath, type)`
- Then: 返回值为 Promise，resolve 后包含 `{ slug, metadata, content, filePath }`

### Scenario 2: parseContentFile 文件不存在时 reject
- Given: 一个不存在的文件路径
- When: 调用 `parseContentFile(nonExistentPath, type)`
- Then: Promise reject 并抛出 `ContentError`（code: `FILE_NOT_FOUND`）

### Scenario 3: getContentFiles 返回 Promise
- Given: 一个包含 MDX 文件的目录
- When: 调用 `getContentFiles(contentDir, locale)`
- Then: 返回值为 Promise，resolve 后为文件路径数组

### Scenario 4: getContentFiles 目录不存在时返回空数组
- Given: 一个不存在的目录
- When: 调用 `getContentFiles(nonExistentDir)`
- Then: Promise resolve 为空数组 `[]`

## Files to Modify/Create

- Modify: `src/lib/__tests__/content-parser.test.ts` — 添加异步 API 测试用例

## Steps

### Step 1: 阅读现有测试

阅读 `src/lib/__tests__/content-parser.test.ts` 了解现有 mock 模式（`fs` 模块 mock、测试 fixture 等）。

### Step 2: 添加异步 API 测试

在现有测试文件中新增 describe 块，为异步版本编写 Scenario 1-4 的测试。测试应验证返回值是 Promise（使用 `expect(result).toBeInstanceOf(Promise)` 或 `await` 语法）。

注意：由于当前函数是同步的，如果测试直接调用当前函数会通过（同步值也能 await）。测试的关键是验证**函数内部不使用同步 fs API**。可以通过在测试中 mock `fs.readFileSync` 使其抛出错误，同时 mock `fs.promises.readFile` 返回正确结果，来验证函数使用了异步 API。

### Step 3: 运行测试确认 Red 状态

执行测试，确认新增用例失败（因为当前实现使用同步 API）。

## Verification Commands

```bash
# 运行 content-parser 测试
pnpm vitest run src/lib/__tests__/content-parser.test.ts --reporter=verbose

# 确认新测试存在
grep -c "async" src/lib/__tests__/content-parser.test.ts
```

## Success Criteria

- 新增 4 个测试用例覆盖 Scenario 1-4
- 新增测试失败（Red）— 证明当前实现使用同步 API
- 现有测试不受影响
- 无 TypeScript 类型错误

## Commit

```
test(content): add async API contract tests for content parser
```
