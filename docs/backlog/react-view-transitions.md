# React View Transitions

Source: https://skills.sh/vercel-labs/agent-skills/vercel-react-view-transitions

## What

Vercel 官方 agent skill，教 AI 用浏览器原生 `document.startViewTransition` API 实现页面/状态切换动画。React 19 提供 `<ViewTransition>` 组件，声明式控制动画触发和样式。

核心能力：
- **共享元素变形**：列表缩略图 → 详情大图的连续动画
- **Suspense 揭示**：骨架屏到真实内容的平滑过渡
- **列表重排**：筛选/排序时 item 位移动画
- **出入场动画**：面板/模态框的出现和消失
- **路由切换过渡**：页面间的方向性滑动

浏览器不支持时自动跳过，零降级成本。

## Why (for Tianze)

| 场景 | 效果 |
|------|------|
| 产品列表 → 产品详情 | 图片共享元素变形，传达"深入了解"的空间感 |
| Suspense 加载态 | 骨架屏到内容的平滑过渡，体感更快 |
| 语言切换 | 内容淡入淡出，避免硬闪 |
| 产品筛选/排序 | 列表 item 重排动画，保持视觉连续 |

与项目设计原则一致：克制、精确、功能驱动。skill 默认推荐 `default="none"` 按需开启，符合"restraint signals confidence"。

## Prerequisites

- Next.js 16 已内置 React canary，`<ViewTransition>` 开箱可用
- 需在 `next.config.ts` 开启 `experimental.viewTransition`
- CSS 动画 recipe 需加入 `globals.css`
- 需添加 `prefers-reduced-motion` 无障碍样式

## When to Adopt

**Ring 4（交互增强阶段）**——核心页面内容和产品体系稳定后。

Install command:
```bash
npx skills add https://github.com/vercel-labs/agent-skills --skill vercel-react-view-transitions
```

## Notes

- `router.back()` 和浏览器后退按钮不触发 View Transitions（popstate 同步，与 startViewTransition 不兼容），需用 `router.push()` 替代
- Radix UI 组件若用 `next/dynamic` + `ssr: false`，需测试与 ViewTransition 的交互
- 项目动效上限 300ms（MOTION-PRINCIPLES.md），需确保 CSS recipe 的 duration 对齐
