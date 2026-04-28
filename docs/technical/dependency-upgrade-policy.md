# Dependency Upgrade Policy

这份文档记录**当前技术栈升级时哪些能升、哪些不能顺手升**。
目标不是阻止升级，而是避免每次看到 `pnpm outdated` 都重新靠记忆判断。

## 当前原则

1. 安全补丁优先；如果 `pnpm audit --prod --audit-level moderate` 报漏洞，不能用 hold 掩盖。
2. patch / minor 可以进入同一条小升级线，但必须跑对应证明。
3. major 升级、`0.x` minor 升级、编译器/格式化/部署工具升级要拆成独立 lane。
4. 生产运行链和 Cloudflare 构建链优先于“npm latest 好看”。
5. `pnpm tech:check` 会把已确认的 hold 项列成 `held_updates`，但不再把它们当成失败项；真正未处理的升级仍会出现在 `needs_update` 并阻塞。

## 当前 hold 清单

| Package | Current reason | Safe next step |
| --- | --- | --- |
| `@react-email/components` | npm 标记 deprecated，但当前邮件模板仍在 React Email 5 线内 | 跟 `react-email` 6 迁移一起处理 |
| `@react-email/preview-server` | dev-only 预览工具，和 React Email 5 当前链路绑定 | 跟 `react-email` 6 迁移一起处理 |
| `react-email` | 6.x 是 major，不是补丁升级 | 单独开邮件工具迁移 lane，验证模板 render 和 `email:dev` |
| `critters` | 上游转向 `beasties`，但它属于 Next/OpenNext 支撑依赖 | 单独验证 `beasties` 替换对 `pnpm build` / `pnpm build:cf` 的影响 |
| `@types/node` | 项目 runtime 支持范围是 `>=20.19 <23`，Node 25 types 不匹配 | 只有当 runtime baseline 扩到 Node 25 时再升 |
| `typescript` | 6.x 是 compiler major | 单独跑 type/build/Cloudflare build lane |
| `eslint` / `@eslint/js` | ESLint 10 是 lint major，可能改变 flat config 和规则输出 | 单独 lint-tooling lane，跑 `pnpm lint:check` 和质量脚本 |
| `eslint-plugin-security` | 安全规则 major 可能带来大量误报 | 单独和 Semgrep / lint 一起验证 |
| `eslint-plugin-react-you-might-not-need-an-effect` | 仍是 `0.x`，minor 可能改变规则行为 | 单独验证 lint 输出 |
| `prettier-plugin-tailwindcss` | 仍是 `0.x`，minor 可能带来格式化 churn | 单独 formatting lane，跑 `pnpm format:check` |

## 这次升级经验

### react-grab

`react-grab` 不是简单改版本号：旧 companion `@react-grab/claude-code` 已经不适合继续作为当前入口。当前仓库改为：

- `react-grab 0.1.32`
- `@react-grab/mcp 0.1.32`
- 本地 helper 使用 `@react-grab/mcp/server` 的 `startMcpServer()`
- 浏览器侧 CDN bridge 使用 `@react-grab/mcp@0.1.32/dist/client.global.js`

验证重点：

- helper 能 import 到 `startMcpServer`
- `src/app/[locale]/layout.tsx` 只在 development 且未禁用 dev tools 时加载这些脚本
- paired test 断言具体 CDN URL，而不是只数 `<Script>` 个数

### tech check

`pnpm tech:check` 的目标是指出真正需要处理的问题。
当前策略是：

- 有可行动升级：`needs_update` 非空，命令失败
- 只有已确认 hold：`held_updates` 非空但 `needs_update` 为空，命令通过
- 有安全漏洞：不能 hold，必须失败
