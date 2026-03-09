# middleware / proxy 兼容记录

## 状态：临时回退到 `middleware`

- 首次迁移时间：2026-03-09
- 回退时间：2026-03-09
- 执行波次：Round 4 / Wave D
- 当前结论：
  - 主线 Next.js 方案已验证，`src/proxy.ts` 在 `pnpm build` 下工作正常。
  - 但为了兼容当前 `@opennextjs/cloudflare@1.16.5`，运行时入口已临时回退为 `src/middleware.ts`。
  - 该迁移债仍保留，后续待 Cloudflare/OpenNext 支持稳定后再重新迁回 `proxy.ts`。

## 当前保留的 Wave D 收益

### 1. locale 路由边界收敛

- root path locale redirect 仍收敛在单一运行时入口中，当前入口为 `src/middleware.ts`
- 页面层补丁 `src/app/page.tsx` 已删除

### 2. document shell 收敛

- `src/app/[locale]/layout.tsx` 已升为真正的 root layout
- `html[lang]` 由服务端首包直接输出
- 客户端补丁 `src/components/i18n/lang-updater.tsx` 已删除

### 3. 客户端语言来源收敛

- `src/components/language-toggle.tsx` 已改为从 locale context 读取当前语言
- `src/components/layout/mobile-navigation.tsx` 已改为从 locale context 读取当前语言

## 验证结果

- `pnpm build`：通过（会重新出现 Next.js 的 `middleware` 弃用告警，这是当前接受的临时技术债）
- `pnpm build:cf`：通过
- 定向 Vitest：通过
  - `src/__tests__/middleware-locale-cookie.test.ts`
  - `tests/unit/middleware.test.ts`

## 后续约束

- 当前修改 locale redirect / CSP nonce / 安全头部时，应以 `src/middleware.ts` 为准。
- 不要重新引入页面层 root redirect 补丁。
- 不要重新用客户端组件补写 `document.documentElement.lang`。
- 如果未来重新迁移到 `src/proxy.ts`：
  - `export const config.matcher` 必须保持静态字面量，不能引用常量或动态拼装值。
  - 必须同时验证 `pnpm build` 和 `pnpm build:cf`。

## 关联文档

- `docs/code-review/issues.md`
- `docs/code-review/notes.md`
- `docs/code-review/round4-execution-summary.md`
