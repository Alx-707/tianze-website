# middleware.ts → proxy.ts 迁移待办

## 状态：待迁移

**优先级**：中
**阻塞因素**：next-intl 尚未支持 `createProxy`
**创建时间**：2026-01-27

---

## 背景

### 为什么 Next.js 16 重命名 middleware → proxy

Next.js 16 将 `middleware.ts` 重命名为 `proxy.ts`，原因：

1. **明确定位**：proxy 用于网络边界操作（rewrites/redirects/headers），不用于认证
2. **语义清晰**：避免与 Express.js middleware 概念混淆
3. **架构指导**：引导开发者将认证逻辑放到 Layout / Route Handler / DAL
4. **运行时变更**：proxy 强制使用 Node.js 运行时，不支持 Edge

> **历史背景**：此重命名部分源于 2025 年 3 月发现的 CVE-2025-29927 漏洞（middleware 认证绕过）。该漏洞已在 15.2.3+ 修复，当前项目版本（16.1.5）不受影响。重命名是架构层面的改进，非安全补丁。

---

## 当前项目状态

### middleware.ts 用途（符合最佳实践）

```typescript
// middleware.ts 当前功能
1. Locale 检测与重定向（next-intl createMiddleware）
2. 安全头注入（CSP nonce）
3. ❌ 无认证逻辑（正确）
```

### 依赖关系

| 依赖 | 当前用法 | proxy 支持 |
|------|----------|------------|
| next-intl | `createMiddleware(routing)` | ⏳ 待支持 |
| next/server | `NextRequest`, `NextResponse` | ✅ 兼容 |

---

## 迁移计划

### 前置条件

- [ ] next-intl 发布 `createProxy` 或等效 API
- [ ] 或 Next.js 宣布移除 middleware.ts 的具体版本

### 迁移步骤

```bash
# 1. 运行官方 codemod
npx @next/codemod@canary middleware-to-proxy .

# 2. 手动更新（如 codemod 未覆盖）
# - 文件重命名：middleware.ts → proxy.ts
# - 函数重命名：middleware() → proxy()
# - 配置重命名：config → proxyConfig (如有)
# - 配置项重命名：skipMiddlewareUrlNormalize → skipProxyUrlNormalize

# 3. 更新 next-intl 调用（待其支持）
# - createMiddleware → createProxy (假设命名)

# 4. 验证
pnpm build
pnpm test:e2e
```

### 验证清单

- [ ] Locale 检测正常（/en, /zh 路由）
- [ ] CSP nonce 正确注入（检查响应头）
- [ ] 无控制台 deprecation 警告
- [ ] E2E 测试通过

---

## 技术细节

### proxy.ts vs middleware.ts

| 方面 | middleware.ts | proxy.ts |
|------|---------------|----------|
| 状态 | ⚠️ Deprecated | ✅ 推荐 |
| 运行时 | Edge / Node | Node only |
| 导出函数 | `middleware()` | `proxy()` |
| 配置导出 | `config` | `proxyConfig` |
| API | 相同 | 相同 |

### proxy 的正确用途

| 用途 | 是否适合 | 替代方案 |
|------|----------|----------|
| Redirects / Rewrites | ✅ | — |
| Headers / Cookies 设置 | ✅ | — |
| Locale 检测 | ✅ | — |
| 认证 / 授权 | ❌ | Layout + Route Handler + DAL |
| 复杂业务逻辑 | ❌ | Server Components / Actions |

### 认证最佳实践（Next.js 16+）

```typescript
// ❌ 错误：在 proxy/middleware 中做认证
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token');
  if (!token) return NextResponse.redirect('/login');
}

// ✅ 正确：Data Access Layer (DAL) 模式
// src/lib/dal.ts
export async function verifySession() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

// src/app/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await verifySession(); // 每个需要认证的页面调用
  return <Dashboard user={session.user} />;
}
```

---

## 参考资料

- [Next.js Upgrading to v16](https://nextjs.org/docs/app/guides/upgrading/version-16) — 官方迁移指南
- [Next.js proxy.ts Docs](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) — proxy API 文档
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) — 认证最佳实践
- [GitHub Discussion #84842](https://github.com/vercel/next.js/discussions/84842) — 社区讨论

---

## 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-01-27 | 创建文档，记录调研结果 |
