# Findings

## Session: 2026-02-03

### 两份审查报告对比

| 发现类型 | Codex 审查 | 我的审查 |
|---------|-----------|---------|
| 测试基础设施 | P0: vitest retry/ui/listen patch | 未发现 |
| API 错误协议 | P1: 3 种错误语言 | 未发现 |
| MDX 静默错误 | 未发现 | P1-1 |
| Webhook 验证 | 未发现 | P1-2 |
| 假异步代码 | P2: Promise.resolve 伪装 | 未发现 |
| processLead | P3.4: 应该修复 | P2-2: 可接受 |

### 关键洞察

1. **Codex 视角更宏观**: 发现基础设施和协议级问题
2. **我的视角更细节**: 发现代码路径和边界情况
3. **processLead 争议**: 需要决定是否重构

### 决策记录

- **processLead**: 采用 Codex 建议，表驱动替换 if/else
  - 理由：消除 `hasEmailOperation` 这种特殊 flag

- **WhatsApp @ts-nocheck**: 安全移除
  - 理由：ESLint 已禁用 no-unused-vars，@ts-nocheck 冗余

### TDD 验收标准

| Task | 验收测试 |
|------|---------|
| P0.1 vitest 清理 | `pnpm test` 无 UI server 启动日志，无 retry |
| P1 API 协议 | 所有 API 返回 `{ success, errorCode }` 格式 |
| P2.1 Logger | 测试输出无 info/debug 级别日志 |
| P2.2 asChild | 测试无 React warning |
| P3.3 WhatsApp i18n | 所有文案使用 translation keys |

---

*Update after ANY discovery*
