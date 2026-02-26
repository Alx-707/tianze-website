# Task 009: Schema builder 类型优化消除双重断言

**depends-on:** —

## Description

优化 `createContactFormSchemaFromConfig` 的类型签名，使 `safeParse().data` 的推断类型与 `ContactFormWithToken` 匹配，从而消除 `contact-api-validation.ts:69` 处的 `as unknown as ContactFormWithToken` 双重断言。

## Execution Context

**Task Number**: 009 of 009
**Phase**: C（增强改进）
**Severity**: 低
**Prerequisites**: 无

## BDD Scenarios

### Scenario 1: 编译时类型安全
- Given: `createContactFormSchemaFromConfig` 返回精确类型的 schema
- When: 对 `safeParse().data` 进行操作
- Then: TypeScript 无需断言即可推断出 `ContactFormWithToken` 类型字段

### Scenario 2: 运行时行为不变
- Given: Schema 类型签名已优化
- When: 执行现有表单验证测试
- Then: 所有测试通过，验证行为完全不变

## Files to Modify/Create

- Modify: `src/config/contact-form-config.ts` — `createContactFormSchemaFromConfig` 的类型签名
- Modify: `src/app/api/contact/contact-api-validation.ts` — 移除双重断言
- Possibly modify: `src/types/` 下的相关类型定义

## Steps

### Step 1: 分析类型丢失根因

当前 `createContactFormSchemaFromConfig` 在第 336 行使用 `Record<string, z.ZodTypeAny>` 作为 reduce 的初始类型，导致 `z.object(shape)` 的推断类型为 `z.ZodObject<Record<string, z.ZodTypeAny>>`。`safeParse().data` 因此变为 `{ [x: string]: any }`。

### Step 2: 方案选择

有两种可行方案：

**方案 A（泛型参数）**：给 `createContactFormSchemaFromConfig` 添加泛型参数，使返回类型为 `z.ZodObject<{ [K in keyof T]: z.ZodTypeAny }>`，调用时传入 `ContactFormWithToken` 的 key 映射。

**方案 B（类型断言下沉）**：在 `createContactFormSchemaFromConfig` 内部将最终 `z.object(shape)` 的结果断言为具体类型，使调用方无需断言。将单点断言从使用侧移到定义侧，并在函数 JSDoc 中说明原因。

选择标准：方案 A 更严格但修改面更大；方案 B 更简单但仍有断言。根据改动量和风险，推荐**方案 B**（断言下沉到定义侧），因为 config-driven schema 的动态特性本质上需要类型桥接。

### Step 3: 实施选定方案

按选定方案修改代码，确保 `contact-api-validation.ts:69` 处的 `as unknown as ContactFormWithToken` 被移除或简化。

### Step 4: 验证

运行 type-check 确认类型正确，运行 test 确认行为不变。

## Verification Commands

```bash
# 确认双重断言已移除
grep -n "as unknown as" src/app/api/contact/contact-api-validation.ts
# 预期：零匹配（或减少）

# TypeScript（最关键的验证）
pnpm type-check

# 全量测试
pnpm test
```

## Success Criteria

- `contact-api-validation.ts` 中不再有 `as unknown as ContactFormWithToken`
- 类型断言（如采用方案 B）集中在 schema 定义处，附有 JSDoc 说明
- `pnpm type-check` 零错误
- `pnpm test` 全部通过
- 运行时行为完全不变

## Commit

```
refactor(forms): eliminate double type assertion in contact form validation

- Move type bridge to schema builder definition site
- Remove `as unknown as ContactFormWithToken` from validation callsite
```
