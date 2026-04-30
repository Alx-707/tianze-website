# Design Truth

这份文档只记录当前项目已经确认的设计真相。  
它不是设计过程稿，也不是 prototype 仓库。

## 当前设计定位

Tianze 的设计方向是：

- **B2B 制造业**
- **专业可信**
- **现代克制**
- **工业感而不是消费级花哨**

默认避免两种偏差：

1. 过度 SaaS 模板感
2. 典型 AI 视觉套板感

## 当前品牌表达

当前默认品牌气质：

- 可靠
- 精准
- 克制
- 有制造能力背书

设计上要让人感觉：

- 这是工厂和制造能力驱动的网站
- 不是纯贸易展示页
- 不是追求炫技的 demo

## 当前视觉基线

当前视觉基线是实现起点，不是最终设计规范。
现有 token、圆角、阴影、网格和 Vercel 借鉴方式可以继续作为当前控制面板，但不能在未经关键页面试跑前被视为最终品牌身份。

### 色彩

- Current truth: Tianze uses a replaceable role-based color system. The current steel-blue candidate is not final brand identity. Agents should preserve the role system and avoid writing raw color values into production components.
- 主方向：Industrial Steel Blue
- 背景：偏干净、轻工业感、中性底色
- 强调色使用要克制，不做大片花哨渐变

### 字体

- 当前主字体基线：Figtree + 中英文混排回退策略
- 排版优先清晰、稳定、可读，不追求设计噱头

### 形状与阴影

- 基础圆角偏克制，8px 左右是当前常用基线
- 阴影偏轻，不做浮夸悬浮感

## 当前交互与动效原则

- 动画服务于理解，不服务于表演
- 默认使用 restraint + speed + purposeful motion
- 交互动效通常应保持在 300ms 内
- 能不动就不动；需要动时，优先 transform + opacity

## 当前页面设计判断

- 首页需要同时承担品牌建立、差异化表达和询盘引导
- 产品相关页面应优先强调规格、能力、应用和信任信号
- Contact 等关键转化页面不应为了“设计感”牺牲清晰度

## 当前不采用的方向

- 过度圆润、过度发光、过度渐变的 SaaS 视觉
- 把首页做成重特效实验场
- 为了炫设计而削弱制造业可信度的表达

## 真相来源

当前设计真相主要来自：

- `src/app/globals.css`
- `docs/impeccable/system/COLOR-SYSTEM.md`
- `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`
- `docs/impeccable/system/MOTION-PRINCIPLES.md`

如果工作盘里的原型与这里冲突，以这份文档和生产实现为准。

根目录 `PRODUCT.md` 和 `DESIGN.md` 是当前给设计类 skills 读取的操作上下文。
其中 `DESIGN.md` 明确标记为 provisional；只有经过页面试跑验证的规则，才应该从 provisional 升级为稳定设计真相。
