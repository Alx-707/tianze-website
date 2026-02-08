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
