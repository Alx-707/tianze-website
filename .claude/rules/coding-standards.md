# Coding Standards

## TypeScript

### Strict Mode
- `strict: true`, `noImplicitAny: true`
- **No `any`** (tests have limited exceptions)
- Prefer `interface` over `type`
- Use `satisfies` for type-safe object literals
- Avoid `enum`, use `const` objects

### exactOptionalPropertyTypes

Cannot pass explicit `undefined` to optional properties:

```typescript
// ❌ Error
const config: Config = { name: 'test', description: undefined };

// ✅ Correct: conditional spread
const config: Config = { name: 'test', ...(desc ? { description: desc } : {}) };
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | `use` prefix | `useBreakpoint.ts` |
| Utilities | camelCase | `formatPrice.ts` |
| Constants | SCREAMING_SNAKE | `MAX_ITEMS` |
| Directories | kebab-case | `user-profile/` |
| Booleans | `is/has/can/should` | `isLoading` |
| Event handlers | `handle` prefix | `handleSubmit` |

## Imports

### Path Aliases
Always use `@/` alias. No deep relative imports.

### Import Order (Prettier enforced)

Configured in `.prettierrc.json` via `@ianvs/prettier-plugin-sort-imports`:

1. `react`, `react/*`
2. `next`, `next/*`
3. Third-party modules
4. `@/types/*`
5. `@/lib/*`
6. `@/components/*`
7. `@/app/*`
8. Other `@/*` aliases
9. Relative imports (`./`, `../`)

## Constants

- No magic numbers
- Organize by domain in `src/constants/`
- Use `as const`
- User-facing text must use i18n keys

## Logging

- **No `console.log` in production**
- Only `console.error`, `console.warn` allowed
- Use `src/lib/logger.ts` for structured logging

## Testing (BDD)

### Behavior-Driven Development

项目采用 BDD 全流程：Discovery → Formulation → Automation。

- **Discovery**: 通过 `brainstorming` 澄清需求
- **Formulation**: 输出 `bdd-specs.md`（Given/When/Then 场景）
- **Automation**: Red-Green-Refactor（TDD 循环）

### 测试编写原则

Write tests from the user's perspective, not the implementation's perspective. Describe **what the user does and sees**, not what the component renders internally.

```typescript
// ❌ Implementation-focused: verifies existence
it("renders primary and secondary CTA buttons", () => {
  expect(screen.getByText("Get Quote")).toBeInTheDocument();
});

// ✅ Behavior-focused: verifies what the user can do
it("navigates to contact page when user clicks primary CTA", () => {
  const link = screen.getByText("Get Quote").closest("a");
  expect(link).toHaveAttribute("href", "/contact");
});
```

Rules:
- **No production code without a failing test first** (Iron Law)
- Interactive elements (Button, Link, Form) must verify **behavior** (navigation target, submission), not just presence
- Link tests must verify `href` resolves to a known route
- Test descriptions use "user does X → Y happens" language
- 每个 BDD scenario 对应 2 个 task：Red（写失败测试）+ Green（最小实现）

### [2026-02-08] Origin — Codex review found 4 functional bugs (dead CTA buttons, broken links) that existing presence-only tests failed to catch.

## Git Commits

Conventional Commits format:

```
<type>[optional scope]: <description>    (≤50 chars, lowercase, imperative)

- Bullet point 1                         (body required, ≤72 chars/line)
- Bullet point 2

Co-Authored-By: <Model Name> <noreply@anthropic.com>   (footer required)
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `build`, `ci`, `style`

Breaking changes: add `!` before `:` (e.g., `feat(api)!: migrate to oauth`)

## Git Branching (GitFlow)

- **`main`**: 生产发布分支
- **`develop`**: 开发主分支（所有 feature 合并到这里）
- **`feature/*`**: 功能分支 → merge 到 `develop`
- **`hotfix/*`**: 紧急修复 → merge 到 `main` + `develop`
- **`release/*`**: 发布准备 → merge 到 `main` + `develop`

使用 `gitflow:start-feature` / `gitflow:finish-feature` 管理分支生命周期。
