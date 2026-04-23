# AI Skills Inventory 2026-04

## 一句话结论

截至 2026-04-21 最新收口后，`/Users/Data/Warehouse/Pipe/tianze-website` 已不再是“多套 roots 并存”。  
当前 active 结构只剩：

- `./.claude/skills` = 唯一真实项目 skills 来源
- `./.codex/skills` = mirror layer（53 个指向 `.claude/skills` 的 symlink + `.system`）

此前的 `./skills`、`./.agents/.agent/.adal/.bob/skills` 以及其他 agent-specific `*/skills` roots 都已移到 Trash，退出 active path。

## 1. 当前 inventory

| Root | Entry | Valid skill | Symlink | 角色 |
| --- | ---: | ---: | ---: | --- |
| `./.claude/skills` | 53 | 53 | 0 | 唯一真实项目 skills 来源 |
| `./.codex/skills` | 54 | 53 | 53 | Codex mirror + `.system` |

补充事实：

- `./.claude/skills` 当前全部是 **真实目录**，没有 symlink、broken link 或杂项文件。
- `./.codex/skills` 当前只保留：
  - `.system`
  - 53 个指向 `./.claude/skills` 的 mirror symlink
- 本轮额外恢复到项目层：
  - `Linus`
  - `review-swarm`
  - `ai-slop-cleaner`
  - `analytics-tracking`
  - `form-cro`
  - `shadcn`
  - `next-cache-components`
  - `positioning-messaging`
- 清退产物统一移到：
  - `/Users/Data/.Trash/skills-claude-only-20260421-152435`
  - `/Users/Data/.Trash/skills-followup-20260421-155347`

## 2. 正式规范

### Claude 单一真相源

- `./.claude/skills`：唯一真实项目 skills 来源
- `./.codex/skills`：只做 mirror，不做独立演化
- 不再接受 `./skills` 或任何其他 agent-specific `*/skills` root 重新进入 active path

## 3. 当前 runtime 实际面

### Claude 项目 runtime 已在用的能力族

1. **设计 / Impeccable 家族**
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

2. **内容 / SEO / 页面策略**
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

3. **项目专项**
  - `basic-setup`
  - `analytics-tracking`
  - `customer-research`
  - `design-md`
  - `enhance-prompt`
  - `form-cro`
  - `multiple-widgets`
  - `next-cache-components`
  - `nextjs-ssr`
  - `positioning-messaging`
  - `react-components`
  - `shadcn`
  - `stitch-loop`
  - `token-lifecycle`
  - `widget-customization`

### Codex 项目 runtime 已在用的能力族

`Codex` 当前不再保留独立项目 skills；它只保留：

- `.system`
- 指向 `./.claude/skills` 的 mirror skills
- `worker`

### 双轨共存

- `ai-smell-audit`
  - 当前同时存在于 `./.claude/skills` 与 `./.codex/skills`
  - 语义接近，允许继续双轨保留
  - 后续如果内容继续漂移，要重新审计“同名需同义”

## 4. 现在的重点不是“全删”，而是“先把职责说清楚”

### 应该继续保留在 `.claude/skills`

- 当前已经在 `.claude/skills` 里的 40 个 runtime skills
- 以及本轮已经从 wrapper 层迁入的 5 个高价值项目 skill
- 以及审计后确认确实属于 Claude 项目工作流的新增 / 迁入项

### 应该继续保留在 `.codex/skills`

- 当前 Codex / OMX 操作层 25 个 runtime skills
- 以及后续确认为 Codex 专属的工作流 skill

### 应该逐步退出

- `./skills` 里的 legacy duplicate
- `./.agents/skills`
- `./.agent/skills`
- `./.adal/skills`
- `./.bob/skills`

## 5. 本轮产物

这份 inventory 负责说清楚 **结构和角色**。  
逐 skill 的具体 verdict 见：

- `/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/AI-SKILLS-AUDIT-MATRIX-2026-04.md`
- `/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/AI-SKILLS-AGENTS-ONE-BY-ONE-2026-04.md`

项目真正需要的 skills 范围与优先级，见：

- `/Users/Data/Warehouse/Pipe/tianze-website/docs/guides/AI-SKILLS-PROJECT-NEEDS-2026-04.md`
