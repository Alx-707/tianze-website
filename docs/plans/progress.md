# Motion Polish - Progress Log

## 2026-02-08 Session Start
- 任务: 动效打磨 (Vercel 对比后改进)
- 模式: 挂机
- 分支: feat/homepage-redesign-v6

## Task 1: Tune scroll-reveal CSS tokens ✅
- `--scroll-reveal-distance: 20px` → `12px`
- 减少快速滚动时的跳动感

## Task 2+3: AnimatedCounter integration ✅
- 发现已有 `animated-counter.tsx` 组件，删除了重复创建的 `count-up.tsx`
- ProofBar: `20+` 和 `2006` 使用 AnimatedCounter (1200ms, easeOut, triggerOnVisible)
- `16-168` 和 `24/7` 保持静态（范围/比率不适合 countUp）
- 修复测试：countUp 项用 aria-label 验证

## Task 4: Grid integration ✅ (已在之前 PR 完成)
- GridFrame + HeroGuideOverlay 已在 page.tsx / hero-section.tsx 中

## Task 5: Section rhythm variation ✅
- Products 卡片: `direction="scale"` (替代默认 "up")
- Scenarios 卡片: `staggerInterval={120}` (替代默认 80ms)
- 增强 section 间的节奏差异化

## Task 6: Nav link transition speed ✅
- `vercel-navigation.tsx`: `duration-150` → `duration-100` (两处)
- 导航级反馈更"瞬时"

## Task 7: Full verification ✅
- type-check: PASS
- lint (modified files): PASS (0 errors)
- tests: 343 files, 5636 tests, all pass
- build: SUCCESS

## 自主决策
| 决策 | 理由 | Task |
|------|------|------|
| 删除 count-up.tsx，使用已有 animated-counter | 避免重复造轮子 | 2 |
| 只对 20+ 和 2006 做 countUp | 16-168/24/7 是范围/比率，递增无意义 | 3 |
| 跳过 Task 4 | GridFrame/HeroGuideOverlay 已在 page.tsx 中 | 4 |
