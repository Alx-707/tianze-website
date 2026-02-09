# Interaction Animations - Findings

## Audit Summary
- 首页只有入场动画层（ScrollReveal + Hero stagger）
- 缺少交互反馈层（hover lift, active press, internal reactions）
- 5 个组件需要增强：ProductCard, ScenarioCard, ResourceCard, Button, QualityCommitment
- 所有改动仅限 Tailwind class 添加，无 JS 逻辑变更

## Design Decision
- 2px lift (`-translate-y-0.5`) for cards — B2B 克制
- `active:scale-[0.98]` for buttons — tactile press feedback
- `group-hover:translate-x-1` for arrows — directional affordance
- `group-hover:scale-[1.02]` for scenario images — subtle zoom
- `hover:bg-[var(--primary-50)]` for commitment cards — consistent pattern
