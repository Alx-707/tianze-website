# Motion Enhancement v2 - Progress Log

## 2026-02-08 Session Start
- 任务: 更有感知的动画方案
- 模式: 挂机
- 分支: feat/homepage-animations
- 基于: 前一轮 motion polish (commit 635d5ef)

## 问题诊断
1. ScrollReveal 硬编码 `translate-y-5` (20px) + `duration-[600ms]`，CSS 变量未消费
2. Hero stagger `slideUp` 只有 8px translateY，500ms，太微弱
3. 动画一次性完成后无持续视觉反馈
4. 整体缺乏"有感知"的动效层次

## 方案设计
### 原则
- 增大位移距离，让动画可被感知
- 使用 spring easing 增加弹性感
- Hero 入场要有戏剧性（更大位移 + blur → clear）
- ScrollReveal 消费 CSS 变量，统一调参入口
- 保持 prefers-reduced-motion 尊重

## 执行记录

### Task 1-3: 增强动画 + 重写 ScrollReveal + 更新 CSS 变量
- ScrollReveal: 从 Tailwind 硬编码类改为 inline style + CSS var()
- slideUp/slideDown: 8px → 24px translateY
- scaleIn: 0.95 → 0.9
- Hero stagger: 500ms ease-out → 700ms spring, 80ms → 100ms 间隔
- CSS 变量: distance 12→24px, duration 600→700ms, stagger 80→100ms
- 状态: completed ✅

### Task 4: 修复测试
- scroll-reveal.test.tsx: 从 class 断言改为 inline style 断言
- 5636 测试全通过
- 状态: completed ✅

### Task 5: 视觉验证
- 运行时确认: distance=24px, duration=.7s, easing=spring
- 14 个 ScrollReveal 元素使用 inline style
- Hero stagger 可视感知明显增强
- GIF 导出: motion-v2-scroll-reveal.gif
- 状态: completed ✅

## CI 循环

### 推送 #1
- Commit: 815fb32
- 分支: feat/homepage-animations
- Pre-push hooks: 7/7 通过 (arch-check, build-check, e2e-layout, perf, quality-gate, security, translation)
- CI Run: #21794431197
- 结果: **全绿 ✅**
  - 基础检查 ✅
  - E2E测试 ✅
  - 安全检查 ✅
  - 翻译质量检查 ✅
  - 单元测试 ✅
  - 性能检查 ✅
  - 架构检查 ✅
  - CI汇总 ✅
