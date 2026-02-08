# Homepage Redesign v6 — Design Findings

> 设计发散阶段已在之前的会话中完成。此文件记录关键设计决策。

## 设计方向
- **视觉风格**: Swagelok info architecture + Vercel design craft
- **主色**: #004D9E (工业蓝)
- **字体**: Figtree (主) + JetBrains Mono (等宽)
- **圆角**: 8px 基础 (vs 旧 20px Twitter rounded)

## 完整设计规范
- `docs/S/tokens.md` — 色彩、字体、间距、阴影、交互状态
- `docs/S/grid.md` — Vercel CSS Grid 装饰系统规范
- `docs/S/components.md` — 16 个组件映射表

## 原型
- `docs/design/homepage/prototype/v6-swagelok-vercel/index.html`

## 关键设计决策
1. Grid 线条是布局系统本身，非装饰覆盖层
2. 三层灰度系统: grid(0.05) / divider(0.08) / crosshair(0.66)
3. Crosshair 仅 2-3 个，非对称放置
4. Container: 1080px (align Vercel), 旧代码 1140px
5. 暗色模式：暂不支持（删除 .dark 主题）
6. 资产：占位处理，后续替换
