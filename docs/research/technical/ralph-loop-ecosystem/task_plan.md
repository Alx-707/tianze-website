# Task Plan: Bash Ralph Loop 生态调研

## Goal
搜索 GitHub 上所有主要的基于 Bash 的 Ralph Loop / Claude Code 自主开发循环项目，对比分析设计理念、功能差异、优劣势，形成完整调研报告。

## Current Phase
Phase 1

## Phases

### Phase 1: 项目搜集
- [ ] GitHub 搜索 ralph loop 相关项目
- [ ] GitHub 搜索 claude code autonomous loop 项目
- [ ] GitHub 搜索 claude code bash loop / automation 项目
- [ ] 记录所有发现的项目到 findings.md
- **Status:** in_progress

### Phase 2: 逐项目深度分析
- [ ] 逐个抓取项目 README / 核心代码
- [ ] 提取每个项目的核心架构、功能特性、设计哲学
- [ ] 记录到 findings.md
- **Status:** pending

### Phase 3: 对比分析
- [ ] 横向对比功能矩阵
- [ ] 分析各自的设计取舍
- [ ] 评估优劣势
- **Status:** pending

### Phase 4: 报告撰写
- [ ] 综合 findings 撰写最终调研报告
- [ ] 包含功能对比表、推荐建议
- **Status:** pending

## Key Questions
1. 除了 frankbria/ralph-claude-code，还有哪些有影响力的 Bash 实现？
2. 各项目在退出检测、错误恢复、会话管理上有何差异？
3. 纯 Bash 实现 vs 其他语言实现，真正的优劣在哪？
4. "真正的自动化"这个论调是否成立？

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 聚焦 Bash 实现 | 用户明确要求分析 Bash 实现的 ralph loop |
| 包含非 Bash 实现作对照 | 需要对照才能评估 Bash 方案的真正优劣 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|

## Notes
- 前次会话已完成 frankbria/ralph-claude-code 的初步解读
- 用户关注的核心论点：Bash 实现才是"真正的自动化"
