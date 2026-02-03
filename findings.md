# Findings & Decisions

## Requirements

从代码审查确定的 5 项重构任务（优先级排序）：

1. **验证器工厂函数** — `firstName/lastName` 95% 重复代码
2. **API routes 统一** — 采用 `withRateLimit` HOF + HTTP 常量
3. **language-toggle 提取** — 路由解析逻辑移至 lib
4. **processLead 拆分** — 消除 `eslint-disable complexity`
5. **cookie-banner 状态** — 整合 useState (最低优先级)

## Research Findings

### 验证器重复分析

`src/lib/form-schema/contact-field-validators.ts`:

```typescript
// firstName (L14-32) 和 lastName (L34-52) 几乎一致
// 唯一差异：错误消息中的 "First name" vs "Last name"
// 代码重复率：~95%

// 工厂函数模式：
const createNameValidator = (fieldLabel: string) => ({ field }) => {
  const { NAME_MIN_LENGTH, NAME_MAX_LENGTH } = CONTACT_FORM_VALIDATION_CONSTANTS;
  const schema = z.string()
    .min(NAME_MIN_LENGTH, `${fieldLabel} must be at least ${NAME_MIN_LENGTH} characters`)
    .max(NAME_MAX_LENGTH, `${fieldLabel} must be less than ${NAME_MAX_LENGTH} characters`)
    .regex(/^[a-zA-Z\s\u4e00-\u9fff]+$/, `${fieldLabel} can only contain letters and spaces`);
  return applyOptionality(schema, field);
};

export const firstName = createNameValidator("First name");
export const lastName = createNameValidator("Last name");
```

### API Routes 现状

| Route | withRateLimit | HTTP 常量 | 需修改 |
|-------|--------------|-----------|--------|
| `/api/contact` | ❌ 手动实现 | 魔法数字 429/500 | ✅ |
| `/api/inquiry` | ❌ 手动实现 | 本地常量 400/429/500 | ✅ |
| `/api/subscribe` | ❌ 手动实现 | 混合使用 | ✅ |
| 其他 routes | 待审计 | 待审计 | TBD |

### 现有抽象

- `withRateLimit` HOF: `src/lib/api/with-rate-limit.ts` — 完整实现，消除 10-15 行样板
- `safeParseJson`: `src/lib/api/safe-parse-json.ts` — 已被使用
- `HTTP_BAD_REQUEST_CONST`: `src/constants/magic-numbers.ts` — 已存在

### 缺失常量

`magic-numbers.ts` 缺少：
- `HTTP_TOO_MANY_REQUESTS = 429`
- `HTTP_INTERNAL_ERROR = 500`

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| 工厂函数命名 `createNameValidator` | 清晰表达创建 validator 的意图 |
| 保持 `fieldLabel` 参数 | 允许自定义错误消息前缀 |
| 扩展 `magic-numbers.ts` | 不新建文件，保持单一入口 |
| 使用 `withRateLimit` 包装整个 handler | 最小改动，最大收益 |

## Issues Encountered

| Issue | Resolution |
|-------|------------|
| 暂无 | |

## Resources

- `src/lib/api/with-rate-limit.ts` — withRateLimit HOF 实现
- `src/lib/form-schema/contact-field-validators.ts` — 验证器目标文件
- `src/constants/magic-numbers.ts` — HTTP 常量聚合文件
- `src/lib/lead-pipeline/process-lead.ts` — 编排函数（有 eslint-disable）

## Visual/Browser Findings

N/A — 纯代码重构任务
