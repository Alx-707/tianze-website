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
| `critters` | 上游转向 `beasties`，但它属于 Next/OpenNext 支撑依赖 | 单独验证 `beasties` 替换对 `pnpm build` / `pnpm build:cf` 的影响 |
| `@types/node` | 项目 runtime 支持范围是 `>=20.19 <23`，Node 25 types 不匹配 | 只有当 runtime baseline 扩到 Node 25 时再升 |
| `typescript` | 6.x 是 compiler major | 单独跑 type/build/Cloudflare build lane |
| `eslint` / `@eslint/js` | ESLint 10 是 lint major，可能改变 flat config 和规则输出 | 单独 lint-tooling lane，跑 `pnpm lint:check` 和质量脚本 |
| `eslint-plugin-security` | 安全规则 major 可能带来大量误报 | 单独和 Semgrep / lint 一起验证 |
| `eslint-plugin-react-you-might-not-need-an-effect` | 仍是 `0.x`，minor 可能改变规则行为 | 单独验证 lint 输出 |

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

### React Email 6

`react-email` 6 迁移不是单纯改版本号。当前仓库采用：

- `react-email 6.0.5` 作为邮件组件和 render 的统一入口
- `@react-email/ui 6.0.5` 支撑本地 email preview
- 移除已 deprecated 的 `@react-email/components` 和 `@react-email/preview-server`
- 保留 `@react-email/render 2.0.8` 作为 `resend` peer dependency 的显式依赖
- `pnpm.overrides["@react-email/ui>next"] = "$next"`，避免预览工具链带入旧 Next patch
- `react-email 6.0.5` 当前会经由 `glob` 带入 vulnerable `brace-expansion 5.0.4`，因此用 `pnpm.overrides["brace-expansion@>=5.0.0 <5.0.5"] = "5.0.5"` 固定到 patched patch

验证重点：

- 管理员通知、客户确认、产品询盘三类模板都能 HTML render
- 三类模板都能 plain text render
- `email:dev` 能启动 React Email 6 preview
- Resend 发送路径继续生成 plain text 内容
- `pnpm deps:check` 不再出现 React Email 5 hold 项

### prettier-plugin-tailwindcss 0.8

`prettier-plugin-tailwindcss` 仍在 `0.x`，因此 minor 升级按独立 formatting lane 处理。
本次 `0.7.2 -> 0.8.0` 没有触发全仓格式化 churn。

验证重点：

- `pnpm format:check` 通过
- 不和业务代码或其它依赖升级混在同一个提交里

### tech check

`pnpm tech:check` 的目标是指出真正需要处理的问题。
当前策略是：

- 有可行动升级：`needs_update` 非空，命令失败
- 只有已确认 hold：`held_updates` 非空但 `needs_update` 为空，命令通过
- 有安全漏洞：不能 hold，必须失败
