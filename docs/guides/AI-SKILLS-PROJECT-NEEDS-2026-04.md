# AI Skills Project Needs 2026-04

## 一句话结论

这个项目现在已经明确收口成：

1. `./.claude/skills` = 唯一真实项目 skills 来源  
2. `./.codex/skills` = 对 `.claude/skills` 的 mirror  
3. 其他所有历史 wrapper / compatibility roots 已退出 active path  
4. 后续只讨论 **哪些 skill 继续留在 `.claude/skills`**，不再讨论“保留在哪个 wrapper root”

## 1. 项目默认采用什么规范

- `./.claude/skills` = 唯一真实项目 skills 来源
- `./.codex/skills` = mirror layer，不做独立 user 演化
- 任何新 skill 只允许先落到 `./.claude/skills`
- `./skills` 与所有其他 agent-specific `*/skills` roots 都已退出 active path

## 2. 应该继续保留的 Claude 项目 skills

### A. 设计 / Impeccable 主链

- `adapt`
- `animate`
- `audit`
- `bolder`
- `clarify`
- `colorize`
- `critique`
- `delight`
- `distill`
- `impeccable`
- `layout`
- `optimize`
- `overdrive`
- `polish`
- `quieter`
- `shape`
- `typeset`

结论：

- **继续保留在 `./.claude/skills`**

### D. 审查 / 代码风格辅助

- `Linus`
- `review-swarm`
- `ai-slop-cleaner`

结论：

- **继续保留在 `./.claude/skills`**
- `Codex` 侧只做 mirror，不再保留独立副本

### B. 内容 / SEO / 页面策略主链

- `content-strategy`
- `copy-editing`
- `copywriting`
- `product-marketing-context`
- `seo-audit-global`
- `seo-cluster`
- `seo-content`
- `seo-drift`
- `seo-google`
- `seo-hreflang`
- `seo-images`
- `seo-page`
- `seo-plan`
- `seo-schema`
- `seo-sitemap`
- `seo-technical`

结论：

- **继续保留在 `./.claude/skills`**

### C. 项目专项

- `analytics-tracking`
- `basic-setup`
- `customer-research`
- `form-cro`
- `multiple-widgets`
- `next-cache-components`
- `nextjs-ssr`
- `positioning-messaging`
- `shadcn`
- `token-lifecycle`
- `widget-customization`

结论：

- **继续保留在 `./.claude/skills`**

## 3. Codex 项目层的当前口径

`./.codex/skills` 现在不再保留独立项目 skills。  
它只保留：

- `.system`
- 指向 `./.claude/skills` 的 mirror symlink

也就是说，未来如果某个项目 skill 还想保留，就必须先证明它值得留在 `./.claude/skills`。

## 4. 本轮已迁入 `.claude/skills` 的高价值项目 skill

这些 skill 当前主要停留在 `./skills` / `./.agents` / `./.agent` 兼容层，但和项目真实工作流绑定度高：

- `health`
- `design-md`
- `enhance-prompt`
- `react-components`
- `stitch-loop`
- `analytics-tracking`
- `form-cro`
- `shadcn`
- `next-cache-components`
- `positioning-messaging`

结论：

- **已迁入 `./.claude/skills`**
- `./.agents/skills` 现保留 symlink，继续作为 compatibility layer
- 原因不是“名字好看”，而是它们都更接近本仓库的设计 / AI 协作 / 组件产物链

补充：

- 本轮同时把 `.agents/skills` 中 24 个完全一致的重复目录改成了指向 `.claude/skills` 的 symlink
- 这样 `.agents` 的角色更清楚：**桥接层**，而不是继续做第三份内容真相源

## 5. 本轮不直接迁移，但需要继续审计的 wrapper skills

这些 skill 对项目有潜在价值，但目前不应该直接默认常驻：

- `audit-website`
- `brand-identity`
- `brand-voice`
- `competitor-alternatives`
- `content-quality-auditor`
- `customer-feedback-analyzer`
- `customer-journey-map`
- `design-system-starter`
- `emilkowal-animations`
- `geo-content-optimizer`
- `inbound-lead-qualifier`
- `knowledge-base-builder`
- `landing-page-design`
- `launch-strategy`
- `localization-strategy`
- `next-best-practices`
- `next-upgrade`
- `page-cro`
- `pricing-strategy`
- `programmatic-seo`
- `schema-markup`
- `seo-audit`
- `style-extractor`
- `tailwind-v4-shadcn`
- `tailwindcss-animations`
- `ui-design-system`
- `vercel-composition-patterns`
- `vercel-react-best-practices`
- `web-design-guidelines`
- `web-performance-optimization`

结论：

- **先标记 `待补证` 或 `兼容层临时保留`**
- 不默认迁进 `./.claude/skills`
- 等真实使用频次和项目任务链证据更清楚后再定

当前需要单独盯住的漂移项：

- `content-strategy`
- `copy-editing`

这两项同时存在于 `.claude/skills` 与 `.agents/skills`，但内容不完全一致，所以本轮没有直接强制收口。

## 6. 低优先级或更适合归档的 wrapper skills

- `ab-test-setup`
- `actionbook`
- `actionbook-scraper`
- `agent-browser`
- `case-study-writing`
- `ci-cd-pipeline-patterns`
- `conducting-user-interviews`
- `deep-research`
- `email-composer`
- `email-sequence`
- `enterprise-sales`
- `find-skills`
- `founder-sales`
- `git-commit-helper`
- `git-master`
- `infographic`
- `linkedin-authority-builder`
- `market-researcher`
- `marketing-ideas`
- `marketing-psychology`
- `paid-ads`
- `qa-test-planner`
- `social-content`
- `technical-writer`
- `writing-product-descriptions`

结论：

- **默认作为 `归档/移除` 候选**
- 如果以后确实要恢复，按单个 skill 重审，不再整体打包常驻

## 7. 需要持续盯住的双轨技能

- `ai-smell-audit`

结论：

- 当前可以 **双轨保留（同义）**
- 但以后要继续审计 Claude / Codex 两份内容是否开始漂移

## 8. 下一步顺序

1. 保持 `./.claude/skills` 和 `./.codex/skills` 双轨规则不再漂移
2. 先处理 `.agents` 中剩余的漂移项与 agents-only 清单
3. 对 `待补证` 清单做 usage-based 取舍
4. 再开始真正清退 `./.agents/.agent/.adal/.bob/skills`
