# Motion Design Principles

> Source: [12 Principles of Animation for UI](https://www.userinterface.wiki/12-principles-of-animation)
> Adapted for Tianze homepage / Vercel-style industrial site context.

## Core Philosophy

> "The best animation is that which goes unnoticed" — 专业工具场景下，动画服务于功能而非表演。

Tianze 是 B2B 工业制造网站，动画策略偏向 **restraint + speed + purposeful motion**（Emil Kowalski / Linear 路线），而非消费类产品的 playful 风格。

---

## 12 Principles → UI 应用

### 1. Squash & Stretch — 弹性与重量感

- 传达元素的材质属性（轻/重/弹性）
- UI 场景：按钮 press 时微缩（scale 0.97），释放回弹
- **克制**：工业网站不宜夸张变形，保持微妙

### 2. Anticipation — 预备动作

- 为即将发生的动作提供视觉预告
- UI 场景：pull-to-refresh 下拉暗示、hover 时的轻微位移预示可点击
- **原则**：仅用于有意义的交互时刻，过度使用会显得迟钝

### 3. Staging — 舞台焦点

- 一次只引导一个焦点
- UI 场景：模态弹出时背景暗化、卡片展开时周围元素退后
- **首页应用**：section 滚动进入时依次引导视线，避免同时出现多个动画

### 4. Straight Ahead vs Pose to Pose — 关键帧策略

- Web 动画典型使用 **pose-to-pose**：定义起点/终点关键帧，浏览器插值
- 关注关键姿态（初始态、结束态），不必纠结每一帧
- 无必要的地方跳过动画

### 5. Follow Through & Overlapping Action — 跟随与错开

- 元素在不同时间到达终态，模拟自然物理
- UI 场景：列表项 stagger 进入、卡片内的标题/描述/按钮依次出现
- **注意**：stagger delay 总量控制在 200-400ms 内，过长会显慢
- Spring 动画的 overshoot-and-settle 比 easing curve 更自然

### 6. Slow In & Slow Out — 缓动曲线

- **entrance（进入）**: `ease-out` — 快速到达，柔和着陆
- **exit（退出）**: `ease-in` — 柔和离开，快速消失
- **on-screen movement（画面内移动）**: `ease-in-out` — 两端缓
- 永远不用 `linear`（除了持续旋转的 loading spinner）

### 7. Arcs — 弧线运动

- 曲线路径比直线更有机自然
- UI 场景：Dynamic Island 风格的形变、FAB 展开路径
- **首页**：适用于 hero moment，工具型界面用直线即可

### 8. Secondary Action — 辅助动作

- 增强主要动作反馈的小装饰
- UI 场景：提交成功后的微闪烁、按钮点击后的涟漪
- **原则**：辅助动作不能抢主角

### 9. Timing — 时间节奏

| 场景 | Duration | 说明 |
|------|----------|------|
| Tooltip/Hover 反馈 | 100-150ms | 即时感 |
| 按钮状态变化 | 150-200ms | 快速响应 |
| 面板/卡片展开 | 200-300ms | 流畅但不拖沓 |
| 页面级转场 | 300-500ms | 需要理由 |
| Drawer/Modal | ~500ms | 有重量感 |

**核心规则**：UI 交互动画 **< 300ms**，超过需要正当理由。

### 10. Exaggeration — 夸张

- 超越物理准确性以增强清晰度
- UI 场景：错误通知的 shake、onboarding 的活泼引导
- **B2B 工业站**：几乎不用，保持专业克制

### 11. Solid Drawing — 立体感

- 通过一致的 3D 透视维持可信的体量感
- CSS `perspective` 属性创造深度
- 保持缩放/倾斜的一致性，避免扁平翻转

### 12. Appeal — 吸引力

- 综合原则——精心制作区分"被喜欢"和"被忍受"的软件
- 好动画是 invisible 的，但创造强烈的情感共鸣
- **首页目标**：专业、可信、精致——不是"酷"

---

## Tianze 首页动画策略

### 适用的原则（重点）

| 原则 | 首页场景 |
|------|---------|
| Staging | Section 滚动进入时引导焦点 |
| Timing | 所有交互 < 300ms |
| Slow In & Slow Out | entrance ease-out / exit ease-in |
| Follow Through | Hero 内元素 stagger 进入 |
| Secondary Action | CTA hover 微反馈 |

### 克制使用的原则

| 原则 | 原因 |
|------|------|
| Squash & Stretch | B2B 工业站不宜卡通 |
| Exaggeration | 保持专业 |
| Arcs | 仅 hero moment |

### 技术约束

- 仅动画 `transform` + `opacity`（GPU 加速）
- 尊重 `prefers-reduced-motion`（必须）
- 定义统一的 timing scale，全站复用
- 定义统一的 easing tokens，避免每个组件自定义

---

## 参考工具链

| 层次 | 工具 | 用途 |
|------|------|------|
| 设计原则 | 本文档 | 决策"加不加动画、什么类型" |
| 工程规则 | `emilkowal-animations` skill | 具体参数、性能、可中断性 |
| 审计框架 | `design-motion-principles` skill | 系统性审计现有 UI 的 motion gap |
| 实现参考 | `tailwindcss-animations` skill | Tailwind CSS 动画 utilities |
