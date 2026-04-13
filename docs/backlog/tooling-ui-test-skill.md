# Backlog: Browserbase ui-test Skill

**记录日期**: 2026-04-05
**来源**: https://skills.sh/browserbase/skills/ui-test
**状态**: ⬚ 待安装，时机：站点功能趋于稳定、上线前探索性验收阶段

---

## 是什么

由 Browserbase 提供的**对抗性 UI 测试 Skill**。核心理念是"主动找 bug，而不是确认功能正常"。

由主 Agent 规划测试策略，派生多个子 Agent 并行在真实浏览器中执行，分三轮：

1. 功能验证
2. 对抗性输入（边界条件、异常数据）
3. 覆盖盲区补充

三种模式：

| 模式 | 适用场景 |
|------|---------|
| **Diff 驱动** | 只测 git 改动部分，适合 PR 前快速验证 |
| **探索模式** | 无目标四处点击，找意外 bug |
| **并行模式** | 多浏览器同时跑独立测试组 |

---

## 对本项目的价值

现有 Playwright E2E 是脚本化回归保护，ui-test 是补充——**不需要写测试脚本，Agent 自主探索**。

最有用的场景：

- **联系表单 / 询盘表单上线前**：对抗性输入（空字段、超长文本、特殊字符、重复提交）
- **多语言切换验证**：中英文路由切换时的边界行为
- **新页面上线前探索**：不写脚本，快速发现意外交互问题
- **重构后快速验证**：Diff 模式只跑改动部分，效率高

---

## 安装方法（备查）

### 1. 安装依赖

```bash
npm install -g @browserbasehq/browse-cli
```

### 2. 配置权限（避免每步都要确认）

在 `.claude/settings.json` 中添加：

```json
{
  "allow": [
    "Bash(browse:*)",
    "Bash(BROWSE_SESSION=*)"
  ]
}
```

### 3. 截图目录

```bash
mkdir -p .context/ui-test-screenshots
```

### 4. 使用方式

在 Claude Code 中直接调用 `/ui-test`，或通过 Skill 工具。

支持两种浏览器模式：
- `browse env local`：本地隔离浏览器，测 localhost
- `browse env remote`：同步 Cookie，测已部署站点（需登录态场景）

---

## 启动条件

- [ ] 站点核心功能（产品页、联系表单）开发完成
- [ ] `pnpm build:cf` 构建稳定
- [ ] 有真实可访问的 Preview 或 Production URL
