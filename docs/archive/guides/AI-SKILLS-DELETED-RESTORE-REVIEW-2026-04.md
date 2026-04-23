# AI Skills Deleted Restore Review 2026-04

## 一句话结论

`tianze-website` 已删除的 skills 里，**不是没有价值**，而是大多数和现有 48 个 active skills 已经重合。  
所以这份审计现在的核心标准不是“看起来有用”，而是：

> **只有当 deleted skill 对当前主线有高价值，且现有 active skills 没有直接覆盖时，才值得恢复。**

截至当前 follow-up，这一批里已经恢复到 active set 的是：

- `analytics-tracking`
- `form-cro`
- `shadcn`
- `next-cache-components`
- `positioning-messaging`

已经恢复后又再次退出 active set 的是：

- `visual-verdict`（已验证场景偏“页面复刻 / 截图对齐 / 视觉判分”，与当前真实 workflow 不匹配）

按这个更严格的标准，当前我只建议把以下 4 个列为 **高信心恢复候选**：

- `analytics-tracking`
- `form-cro`
- `shadcn`
- `next-cache-components`

其余 deleted skills 里，确实还有一批“有价值”，但更多属于：

- 可以被现有 active skills 组合覆盖
- 或者只适合专项任务时临时恢复
- 或者和当前 repo 主线仍然不够贴

本轮审计边界：

- 已审 `skills/*` 删除归档中的 **63 个 unique user skills**
- 已审旧 `/.codex/skills/*` 删除归档中的 **24 个 unique Codex skills**
- 不再重复审那些来自 `.bob/.continue/.vibe/...` 的 wrapper duplicate，因为它们本质只是同内容多副本

项目判断依据不是“技能名字好不好”，而是当前仓库的真实主线：

- B2B 官网 / 询盘转化
- Next.js 16 + Cache Components
- multilingual SEO
- shadcn/ui + design-heavy UI
- contact / inquiry / subscribe 的质量、防回归与 proof
- Cloudflare / performance / technical health

---

## 0. 恢复门槛

一个 deleted skill 只有同时满足下面三条，才进入 `恢复`：

1. **主线相关性高**  
   直接作用于当前 repo 的询盘转化、技术 SEO、UI proof、Next 16 / shadcn 栈，或者安全关键链路。

2. **和现有 active skills 重合度低**  
   不能只是“比现有 skill 更泛”或“换个名字再来一套”。

3. **不能轻易被现有 1-2 个 active skills 组合替代**  
   如果现在的 active set 已经能覆盖 80% 场景，就不应该为了“可能有帮助”再加一个常驻 skill。

---

## 1. 高信心恢复候选

这 5 个是当前我认为恢复理由足够硬的。

| Skill | 重合对象 | 重合度 | 强恢复理由 |
| --- | --- | --- | --- |
| `analytics-tracking` | `audit`, `seo-*` 只覆盖结果审计，不覆盖 GA4 / events / conversions / attribution 配置 | 低 | 当前项目的转化主线不只是“页面好不好”，还要知道 CTA / inquiry / submit 到底怎么追踪。active set 里没有一个专门做 tracking schema、events、conversion attribution 的技能。 |
| `form-cro` | `copywriting`, `audit`, `customer-research` | 中低 | 当前最关键转化点就是 contact / inquiry forms。现有 skill 会碰文案、体验、研究，但没有一个专门盯 form friction、fields、completion rate、abandonment、non-signup form conversion。 |
| `shadcn` | `react-components`, design / impeccable 主链 | 低 | 现有 active 里没有一个专门处理 shadcn registry、`components.json`、preset、组件查找/修复/组合的技能。仓库技术栈本身就在用 shadcn/ui，这不是泛 UI 技能能替代的。 |
| `next-cache-components` | `nextjs-ssr`, `basic-setup` | 低 | 仓库明确处在 Next.js 16 + Cache Components 线上。现有 active 没有一个专门盯 `use cache`、`cacheLife`、`cacheTag`、`updateTag`、PPR 的技能，这个是明确的版本/架构缺口。 |

---

## 2. 按需恢复，不建议默认常驻

这些 skills 不是没价值，而是**恢复理由还不够硬**，主要问题是和现有 active set 重合明显。

### 2.1 overlap 中高，但任务触发时可恢复

- `page-cro` —— 和 `copywriting`、`content-strategy`、`audit` 有重合，但如果后面你明确要做首页/产品页/落地页的 conversion sprint，它还是值得恢复。
- `schema-markup` —— 明显和现有 `seo-schema` 重合。除非你觉得当前 `seo-schema` 不够用，否则不建议先恢复它。
- `web-performance-optimization` —— 和 `optimize`、`audit`、`seo-technical` 重合太多；更适合出现明确 performance sprint 再恢复。
- `audit-website` —— 和 `audit`、`seo-audit-global`、`seo-technical` 重合明显；如果你需要更偏 crawler / CLI 扫描入口时再恢复。
- `seo-audit` —— 和现有整套 `seo-*` 主链高度重合，默认不恢复；除非你想要一个更泛化总入口。
- `security-review` —— 与 `review-swarm`、`ai-smell-audit` 存在重合，但如果你想保留一个更聚焦的 security-only review 入口，它是可以恢复的。
- `localization-strategy` —— 与 `seo-hreflang` 和现有 multilingual SEO 链路有重合；如果后面要做国际化增长层的策略设计，再恢复更合适。
- `content-quality-auditor` —— 对 EEAT / helpful content 有价值，但和 `content-strategy`、`copy-editing`、`seo-content` 已有一定重合。
- `positioning-messaging` —— 与 `copywriting`、`product-marketing-context` 重合不低，但在做品牌定位、价值主张重写时可恢复。
- `next-upgrade` —— 与 `nextjs-ssr` / repo docs 有部分重合；真正进入升级窗口时再恢复。
- `vercel-react-best-practices` —— 和 `optimize` / `nextjs-ssr` 有交叉；如果做 React/Next 性能专项治理时可恢复。

### 2.2 更偏策略/专项，不建议默认常驻，但并非完全无用

- `brand-identity` —— 对品牌系统有帮助，但当前已有一整套 design / impeccable 主链，不必默认常驻。
- `brand-voice` —— 对站点文案一致性有帮助，但更适合作为 messaging 专项时启用。
- `competitive-intelligence-analyst` —— 对竞品理解有帮助，但更偏阶段性研究，不是高频执行链。
- `competitor-alternatives` —— 适合做 comparison / alternatives 页面时恢复，不建议平时常驻。
- `content-quality-auditor` —— EEAT / content quality 很相关，但属于专项审计，不是默认每天会触发的能力。
- `customer-feedback-analyzer` —— 如果后面真的形成用户反馈输入面，可以恢复；当前证据不够强。
- `customer-journey-map` —— 对梳理漏斗有价值，但更像阶段性策略建模。
- `design-system-starter` —— 仓库已有稳定 UI / design token 主线，这个更适合体系重构时恢复。
- `emilkowal-animations` —— 对动画质量有帮助，但属于 UI polish 阶段的专项技能。
- `geo-content-optimizer` —— 如果你后续更重视 AI citation / GEO，这个值得恢复；现在还不是第一优先级。
- `inbound-lead-qualifier` —— 如果以后接 CRM / lead routing 才更有价值；当前项目未到这个阶段。
- `knowledge-base-builder` —— 更适合 support / self-serve 内容体系，不是官网主线。
- `landing-page-design` —— 适合专题页、大改版或 campaign 页时恢复。
- `launch-strategy` —— 适合产品发布 / 大版本上线，不是当前常驻需求。
- `next-best-practices` —— 技术上相关，但更像“参考库”，按需恢复即可。
- `next-upgrade` —— 当你真要做 Next 升级时很有价值；平时不用常驻。
- `positioning-messaging` —— 对 B2B 官网价值不低，但属于战略层文案工作，不必日常常驻。
- `pricing-strategy` —— 如果以后做价格页 / MOQ / quote framing，可以恢复；现在不是主线。
- `programmatic-seo` —— 若后续要跑模板化目录页或区域页，这个才有价值；当前先按需。
- `seo-audit` —— 和当前 SEO 主线相关，但已有更细分的 SEO skills；建议按需恢复，不急着常驻。
- `style-extractor` —— 适合从参考站提炼 style guide，做 redesign 时可恢复。
- `tailwind-v4-shadcn` —— 技术栈相关，但和 `shadcn`、现有 design skills 有重叠，按需即可。
- `tailwindcss-animations` —— 纯动画层工具，按需恢复。
- `ui-design-system` —— 更适合体系建设期，不是当前主线常驻项。
- `ui-ux-pro-max` —— 过宽，和现有 design 主链重叠过大，若恢复也应按专项使用。
- `web-design-guidelines` —— 适合做 UI audit 时恢复，但与现有 design / audit skills 重叠较多。

### 2.3 old Codex operator / workflow：只在明确 workflow 需要时恢复

- `ask-claude` —— 如果你想保留“本地 CLI 提问并落 artifact”的接力工作流，可以恢复。
- `ask-gemini` —— 同上，适合多模型交叉验证时恢复。
- `code-review` —— 如果你想保留比 `review-swarm` 更轻量的单技能 review 流程，可以恢复。
- `web-clone` —— 做竞品页面仿制、结构拆解、视觉+功能对比时有价值，但不需要常驻。

---

## 3. 建议继续归档

这些 skills 不是完全没用，而是 **和当前项目主线不够贴**，或者已有更直接的替代。

### 3.1 user skills：继续归档

- `ab-test-setup` —— 项目还没到高频实验体系阶段，常驻收益低。
- `actionbook` —— 太偏通用浏览器 automation playbook，不如保留更明确的专项 skills。
- `actionbook-scraper` —— 同上，偏工具链，不是项目核心能力。
- `agent-browser` —— 泛化浏览器 automation，和当前实际工作流贴合度不够高。
- `case-study-writing` —— 内容方向太偏，不是当前官网主线。
- `ci-cd-pipeline-patterns` —— 仓库已有自己的 CI / gate 规则体系，不必单独常驻。
- `conducting-user-interviews` —— 当前不是高频用户研究驱动阶段。
- `debugging` —— 过于泛化，且已经有更系统的 debugging / repo rules。
- `deep-research` —— 过于泛化，不像 repo-specific skill。
- `email-composer` —— 对项目主线帮助弱。
- `email-sequence` —— 暂未形成 email growth 主线。
- `enterprise-sales` —— 偏销售组织，而非当前官网工程主线。
- `find-skills` —— 现在你已经在做 skills 收敛，不需要再保留一个“找 skill”的 skill。
- `founder-sales` —— 对当前 repo 主线帮助弱。
- `git-commit-helper` —— 过泛，且日常可直接处理。
- `git-master` —— 过泛，且容易和现有操作习惯冲突。
- `infographic` —— 内容形式太窄，不适合作为常驻项目 skill。
- `linkedin-authority-builder` —— 更适合 founder content / 社媒增长，不是当前官网主线。
- `market-researcher` —— 泛研究能力，不应占用常驻位。
- `marketing-ideas` —— 太宽、太泛。
- `marketing-psychology` —— 太抽象，不如在具体任务里直接分析。
- `paid-ads` —— 当前 repo 不是投放执行面。
- `qa-test-planner` —— 仓库已有很强的测试 / quality gate 体系，这个恢复优先级低。
- `social-content` —— 社媒内容不是仓库主线。
- `technical-writer` —— 太泛。
- `vercel-composition-patterns` —— 当前部署主线不在 Vercel，这个贴合度明显偏低。
- `writing-product-descriptions` —— 更像电商 listing skill，不是当前官网主线。

### 3.2 old Codex skills：继续归档

- `ai-smell-audit` —— 已经在当前 active skills 中，不需要从 deleted set 恢复。
- `autopilot` —— 太强侵入、太宽，不适合现在的 skills 收敛方向。
- `cancel` —— 明显是 OMX/模式控制配套，不值得单独恢复。
- `configure-notifications` —— 偏工具链控制，不是项目核心。
- `deep-interview` —— 更像交互流程模板，不是 repo-specific capability。
- `doctor` —— 只适合 oh-my-codex 安装排障。
- `help` —— 插件帮助项，不是项目 skill。
- `hud` —— OMX HUD 配置项，不是项目 skill。
- `note` —— 偏记事流，不是 repo-specific skill。
- `omx-setup` —— 明显是工具初始化 skill。
- `plan` —— 过于泛化，当前已有足够的 planning 能力，不必作为项目 skill 常驻。
- `ralph` —— 重度 OMX workflow，不适合当前轻量收敛方向。
- `ralplan` —— 同上。
- `skill` —— 管理 local skills 的工具 skill，不是项目能力。
- `team` —— tmux-based 多 agent orchestration，当前不应常驻到项目 skill 面。
- `trace` —— 更像 workflow observability，不是 repo-specific project capability。
- `ultrawork` —— 偏高吞吐 orchestration，不适合当前 skills 收敛目标。
- `worker` —— 同上。

---

## 4. 推荐恢复顺序

如果你要继续恢复，我建议按这个更收紧的顺序：

### 第一批：强恢复理由成立

1. `analytics-tracking`
2. `form-cro`
3. `shadcn`
4. `next-cache-components`

### 第二批：有明确专项任务时再恢复

6. `page-cro`
7. `security-review`
8. `localization-strategy`
9. `content-quality-auditor`
10. `positioning-messaging`
11. `next-upgrade`

---

## 5. 我的最终判断

如果只看 `tianze-website`，**最值得恢复的 deleted skills 不是一大堆 marketing / sales / generic audit skills**，而是：

- conversion instrumentation
- form conversion
- shadcn / Next 16 stack fit
- visual QA proof

也就是：**更偏“站点质量与转化”这一侧，而不是“泛营销点子库”这一侧。**
