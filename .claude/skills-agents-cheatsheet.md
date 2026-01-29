# Skills & Agents 速查表

## Skills（主动调用 /name）

### 设计
| 名称 | 作用 | 时机 |
|------|------|------|
| `/frontend-design` | 高质量前端界面 | 写页面/组件 |
| `/landing-page-designer` | 落地页设计 | 营销页面 |
| `/layout-designer` | 页面布局/网格 | 布局设计 |
| `/design-system-starter` | 设计系统创建 | 初始化设计规范 |
| `/ui-design-system` | 设计 token/文档 | 维护视觉一致性 |
| `/web-component-design` | 组件模式 | 组件库设计 |
| `/web-design-guidelines` | UI 规范审查 | 审查 UI 代码 |

### 文案/营销
| 名称 | 作用 | 时机 |
|------|------|------|
| `/copywriting` | 营销文案 | 写/改页面文案 |
| `/landing-page-copywriter` | 落地页文案 | PAS/AIDA 框架 |
| `/page-cro` | 转化率优化 | 页面不转化时 |
| `/product-marketing-context` | 产品定位文档 | 建立营销上下文 |

### Next.js / React
| 名称 | 作用 | 时机 |
|------|------|------|
| `/next-best-practices` | Next.js 最佳实践 | 写 Next 代码前 |
| `/next-cache-components` | Cache Components | PPR/use cache |
| `/next-upgrade` | 升级 Next.js 16 | 版本升级 |
| `/vercel-react-best-practices` | React 性能优化 | 性能调优 |
| `/vercel-composition-patterns` | 组件组合模式 | 重构组件 API |

### Tailwind / 样式
| 名称 | 作用 | 时机 |
|------|------|------|
| `/tailwind-v4-shadcn` | Tailwind v4 + shadcn | 初始化/修复样式 |
| `/tailwindcss-animations` | 动画/过渡 | 加动画效果 |

### 文档处理
| 名称 | 作用 | 时机 |
|------|------|------|
| `/pdf` | PDF 读写/处理 | 操作 PDF |
| `/docx` | Word 文档 | 操作 docx |
| `/pptx` | PPT 演示文稿 | 操作 pptx |
| `/xlsx` | Excel 表格 | 操作 xlsx |

### 工作流/规划
| 名称 | 作用 | 时机 |
|------|------|------|
| `/brainstorm` | 需求探索 | 任何创作前必用 |
| `/planning-with-files:plan` | 文件式规划 | 复杂多步任务 |
| `/superpowers:writing-plans` | 写实现计划 | 有需求要规划 |
| `/superpowers:executing-plans` | 执行计划 | 有计划要执行 |
| `/superpowers:dispatching-parallel-agents` | 并行任务分发 | 2+独立任务 |

### 代码审查/提交
| 名称 | 作用 | 时机 |
|------|------|------|
| `/pr` | 创建 PR | 准备提 PR |
| `/pr-review-toolkit:review-pr` | 综合 PR 审查 | 审查 PR |
| `/superpowers:requesting-code-review` | 请求审查 | 完成功能后 |
| `/superpowers:verification-before-completion` | 完成前验证 | 声称完成前必用 |

### 调试/测试
| 名称 | 作用 | 时机 |
|------|------|------|
| `/superpowers:systematic-debugging` | 系统化调试 | 遇到 bug 时 |
| `/superpowers:test-driven-development` | TDD | 写功能前 |

### Git
| 名称 | 作用 | 时机 |
|------|------|------|
| `/superpowers:using-git-worktrees` | Git worktree | 隔离开发 |
| `/superpowers:finishing-a-development-branch` | 完成分支 | 实现完成后 |

### 其他
| 名称 | 作用 | 时机 |
|------|------|------|
| `/find-skills` | 查找可用 skill | 不知道用什么 |
| `/superpowers:writing-skills` | 写新 skill | 创建/编辑 skill |

---

## Agents（Task 工具自动调用）

### 系统内置
| 类型 | 作用 | 自动触发场景 |
|------|------|--------------|
| `Explore` | 代码库探索 | 搜索代码/理解结构 |
| `Plan` | 架构规划 | 设计实现方案 |
| `general-purpose` | 通用任务 | 复杂多步骤 |
| `claude-code-guide` | Claude Code 帮助 | 问 Claude Code 功能 |

### PR Review Toolkit
| 类型 | 作用 | 时机 |
|------|------|------|
| `code-reviewer` | 规范/风格检查 | PR 审查 |
| `code-simplifier` | 代码简化 | 重构 |
| `comment-analyzer` | 注释准确性 | 审查文档注释 |
| `pr-test-analyzer` | 测试覆盖 | PR 测试审查 |
| `silent-failure-hunter` | 静默失败检测 | 错误处理审查 |
| `type-design-analyzer` | 类型设计 | 新增类型时 |

### 项目自定义（.claude/agents/）
| 类型 | 作用 | 时机 |
|------|------|------|
| `code-reviewer-frontier-v2` | 生产安全审查 | API/安全变更 |
| `frontend-security-coder-frontier` | XSS/CSP 落地 | 安全头/脚本变更 |
| `performance-engineer-frontier` | 性能工程 | Lighthouse 回归 |
| `threat-modeler-frontier` | 威胁建模 | 新增写操作 API |

---

## 高频场景速查

| 我要做什么 | 用什么 |
|------------|--------|
| 写新页面/组件 | `/brainstorm` → `/frontend-design` |
| 落地页 | `/landing-page-designer` + `/landing-page-copywriter` |
| 调 bug | `/superpowers:systematic-debugging` |
| 写功能 | `/superpowers:test-driven-development` |
| 改 Next.js 代码 | `/next-best-practices` |
| 升级 Next.js | `/next-upgrade` |
| 样式问题 | `/tailwind-v4-shadcn` |
| 提 PR | `/superpowers:verification-before-completion` → `/pr` |
| 不知道用啥 | `/find-skills` |
