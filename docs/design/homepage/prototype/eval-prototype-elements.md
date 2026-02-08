# 设计原型评估：区块级元素审计

> 审计范围：仅视觉处理（排版、色彩、间距、细节、创意），不评估功能完整性、响应式、CTA 策略。

## 最佳区块一览

| 区块 | 最佳视觉处理 | 关键原因 |
|------|:---:|------|
| Hero | v3 "The Forge" | Archivo Black 全宽大标题 + 标题与正文分离的双栏布局，创造了所有原型中最强的视觉锚点和信息层级 |
| 技术链 | v3 "The Forge" | `[02]` 方括号编号 + `accent-left` 红色左边框引用处理 + grid-paper 网格纸纹理，工程制图美学完整统一 |
| 产品线 | v3 "The Forge" | 1px gap 无缝网格 + hover 底部红线扫过动画（`width: 0 → 100%`），卡片系统最克制也最精致 |
| 样品 CTA | v3 "The Forge" | Archivo Black 标题 + 描述文字并排的 baseline 对齐布局，上下 border 框定，信息密度高而不拥挤 |
| 应用场景 | Stitch A | 真实摄影图片 + 3 列带标签覆盖层的网格，是唯一用实际工业场景照片建立视觉可信度的原型 |
| 服务承诺 | v1 "Navy+Amber" | 5 列 1px-gap 网格 + 线框图标 + hover 变色反馈，在紧凑空间内建立了最完整的视觉节奏 |
| 认证 | v3 "The Forge" | 左标题右徽章的水平分割布局，徽章用 0 圆角矩形 + mono 字体，信息架构最清晰最紧凑 |
| 终 CTA | v3 "The Forge" | Archivo Black 全大写标题 + 底部红色径向光晕 + mono 字体信任行，气势与精密感的结合最完整 |

## 逐区块详细分析

---

### 1. Hero

**最佳**: v3 "The Forge"

**原因**: v3 采用 Archivo Black 字体在 `clamp(42px, 6vw, 72px)` 尺度下全宽铺开标题，`line-height: 0.95` 让字行紧密咬合，`text-transform: uppercase` 进一步强化了工业重量感。标题独占全宽后，正文和图片分入下方双栏（`hero-grid`），实现了「标题统领全局 → 内容展开细节」的两级信息架构。信任徽章使用 24px 横线分隔符（`.sep`）取代圆点分隔，更贴合工程制图语言。右上角 `-45deg` 斜纹纹理（`repeating-linear-gradient`）在不喧宾夺主的前提下增加了表面质感。

**局部亮点**:
- **v3** — 顶部 3px 固定红色 `brand-bar` 贯穿全页，在零导航状态下建立了品牌存在感，这个元素成本极低但辨识度极高
- **v3** — 标题中 `Machine Makers.` 使用 `var(--ember)` 红色高亮，在单色背景下精确制造了一个视觉焦点，不需要渐变或阴影
- **v2 "Twitter Blue"** — Hero 右上方 `radial-gradient(ellipse, rgba(29,155,240,0.04))` 蓝色光晕，在纯白背景上制造了微妙的深度暗示，比纯平背景更有空间感
- **v2** — 浮动图片上的蓝色描边光环（`.hero-img-float::after` 使用 `border: 2px solid var(--blue); opacity: 0.3`），给小图片增加了品牌色关联而不显得突兀
- **v1 "Navy+Amber"** — `hero-badge` 使用深色底 + amber 色标签文字 + 中间圆点分隔的组合，徽章本身就是一个完整的微型设计系统
- **Stitch A** — 唯一有完整导航栏的原型，Hero 区右侧放置了真实工厂/产品图片，在所有原型中照片的使用最成熟、最有说服力
- **Stitch B** — Hero 使用了工业起重机/设备的实际摄影作为右侧视觉，深色背景（接近 v3 调性）配合红色点缀色，在工业质感的照片应用上是最大胆的尝试

---

### 2. 技术链（Full Chain Technology）

**最佳**: v3 "The Forge"

**原因**: v3 的技术区块完成度最高，体现在三个层面。第一，section header 采用 `[02]` 方括号编号 + 标题的水平 flex baseline 对齐，而非垂直堆叠，节省垂直空间的同时增加了技术文档感。第二，process-strip 使用 5 列 CSS grid + 0 圆角方形图标盒（`process-icon-box`），hover 时 border 变红 + 图标变红的双重反馈，图标默认灰色（`var(--graphite)`）不参与强调色争夺。第三，关键差异化文案使用 `accent-left`（3px 红色左边框 + 16px 左内距），视觉上把「我们自己造弯管机」这一核心卖点从普通段落中拉出来，形成独立引用块。背景使用 `grid-paper` 网格纸纹理（40px 间距，0.018 透明度），呼应工程制图主题。

**局部亮点**:
- **v3** — `accent-left` 红色左边框引用样式，3px 宽度 + padding-left 16px，用最少的元素让关键卖点段落获得了独立视觉权重，这种处理方式值得直接沿用
- **v3** — `grid-paper` 纹理使用 `mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)` 做了椭圆形衰减遮罩，纹理只在区块中心可见，向边缘自然淡出
- **v2** — process-timeline 连接线使用 `linear-gradient(90deg, var(--border) 0%, var(--blue) 50%, var(--border) 100%)` 渐变，中间蓝色最亮向两端淡出，暗示流程的方向性和重心
- **v2** — 图标容器 hover 时同时出现 `box-shadow: 0 0 0 4px rgba(29,155,240,0.08)` 外圈光环，比单纯的 border 变色多一层深度反馈
- **v1** — process-flow 使用 flex 布局 + 显式 `chevron-right` 箭头图标作为步骤间分隔符，比隐式连线更直观地传达流程方向
- **Stitch A** — 技术区块使用白底 + 右侧显示 `0.05mm`（或类似精度数据）和 `24/7` 大数字，把关键指标提到与标题同层级，数据本身成为视觉元素
- **Stitch B** — 整个技术区块使用深黑背景，流程步骤图标在暗色上使用白色/红色描边，工业车间的沉浸感最强

---

### 3. 产品线（Product Lines）

**最佳**: v3 "The Forge"

**原因**: v3 的产品网格使用了 `gap: 1px; background: var(--border)` 的无缝网格技术——卡片之间只有 1px 分隔线而非空白间距，4 张卡片在视觉上形成一个完整的矩形面板而非 4 个独立浮岛。卡片本身零圆角，hover 时底部出现从左到右扫过的 2px 红线动画（`width: 0 → 100%`，0.3s 过渡），这是所有原型中最精致的 hover 微交互。产品编号使用 `[01]` 方括号 mono 格式而非大号数字，不与标题争夺视觉权重。产品标签（tag）默认灰色边框，hover 时边框和文字同时变红，与卡片底部红线动画形成呼应。spec 列表项前的标记使用 `6px x 1px` 红色短横线而非圆点，与整体直线/锐角美学一致。

**局部亮点**:
- **v3** — 产品卡片底部红线扫动动画：`::after` 伪元素从 `width: 0` 过渡到 `width: 100%`，transition 0.3s，这是整套原型中最有记忆点的微交互
- **v3** — spec 列表项标记使用 `6px x 1px` 红色短横线（`width: 6px; height: 1px; background: var(--ember)`），在零圆角体系中比圆点更自洽
- **v1** — 产品编号使用 42px mono 超大字号 + `var(--light-gray)` 极浅色，作为卡片的装饰性背景元素，不干扰阅读但增加了图形层次
- **v2** — 产品卡片 hover 时 `transform: translateY(-2px)` 上浮效果 + `box-shadow: 0 4px 16px rgba(29,155,240,0.08)` 品牌色阴影，反馈感最温和舒适
- **v2** — 产品标签使用 `border-radius: var(--r-full)` 药丸形状 + `var(--blue-light)` 浅蓝背景，与 v3 的直线风格截然不同但同样系统化
- **Stitch A** — 产品卡片使用了真实产品照片（弯管、接头、喇叭口等），是唯一让买家能直观看到实物的原型

---

### 4. 样品 CTA（Free Sample）

**最佳**: v3 "The Forge"

**原因**: v3 的样品 CTA 区块使用了一种独特的「技术文档条」布局：标题 (`Archivo Black, uppercase`) 和描述文字通过 `flex align-items: baseline` 在同一基线水平排列，右侧是按钮。整个区块不使用背景色填充，而是用 `border-top + border-bottom` 双线框定，在纸白背景上形成一条「水平带」。标题的 `clamp(20px, 2.5vw, 28px)` 尺寸和 `white-space: nowrap` 保证标题不换行，与描述文字的尺寸差形成层级。这种处理比全色块背景更轻、更有呼吸感，同时通过双边框保持了区块独立性。

**局部亮点**:
- **v3** — 标题和描述文字 baseline 对齐的横向布局，信息密度高但不拥挤，这种「技术规格条」的排版方式非常适合制造业语境
- **v1** — 全宽 amber 背景 + 40px 间距网格纹理叠加（`rgba(255,255,255,0.06)` 白色线条），纹理在暖色背景上的效果是所有原型中最出彩的
- **v2** — 全宽 `var(--blue)` 蓝色背景 + 左上角 135 度白色渐变光泽（`linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)`），给平色块增加了金属质感
- **Stitch A** — 样品 CTA 使用蓝色背景横条，右侧有明确的「Request Free Samples」白色按钮，整体与页面蓝色主题协调
- **Stitch B** — 样品 CTA 使用红色/品牌色作为全宽背景横条，视觉冲击力强，在深色页面中形成强烈对比

---

### 5. 应用场景（Application Scenarios）

**最佳**: Stitch A

**原因**: Stitch A 是唯一在应用场景区块中使用了真实工业摄影照片的原型。3 列卡片各展示了真实的工业场景——地下管道施工、商业建筑电气布线、可再生能源基础设施——每张图片上叠加了半透明标签。这种处理方式让买家能直接联想到自己的使用场景，比 placeholder 图标或纯色块有质的飞跃。照片的色调处理偏暗调工业风，与 PVC 管件制造商的品牌调性高度匹配。

**局部亮点**:
- **Stitch A** — 场景卡片使用真实摄影 + 半透明文字叠加层，是所有原型中唯一用实际照片建立场景可信度的
- **Stitch B** — 应用场景区块标题为「Engineered for Critical Environments」，用了 2x3 网格展示 6 个场景（Hospitality & Health, Data Centers, Industrial Facilities 等），每个场景有独立照片，照片上使用全宽文字标签覆盖层，暗调处理统一了视觉调性
- **v1** — 场景卡片包含 `scenario-testimonial` 引用块，使用 `border-left: 3px solid var(--amber)` 左边框 + `var(--off-white)` 浅底色背景，引用块的视觉处理是所有 HTML 原型中最完整的
- **v2** — 引用块使用 `var(--blue-50)` 极浅蓝底色 + 3px 蓝色左边框 + 8px 圆角，配色比 v1 的 amber 更柔和
- **v3** — 引用块改用 `border-top: 1px` 顶部分割线取代左边框，cite 使用 mono 字体 10px 极小尺寸 + 0.02em 字间距，工程备注感最强

---

### 6. 服务承诺（Service Commitments）

**最佳**: v1 "Navy+Amber"

**原因**: v1 的 commitments-grid 使用了 `grid-template-columns: repeat(5, 1fr); gap: 1px; background: var(--border)` 的 1px 间隔线网格，5 个承诺项在一个完整的矩形容器内等距排列。图标使用 44x44px 线框容器（`border: 1.5px solid var(--border); border-radius: 4px`），hover 时边框变为 amber 色。整个网格有 `border: 1px solid var(--border); border-radius: 4px` 外框和 `overflow: hidden`，形成一个完整的面板。下方的 closing 语句「Your specs. Our commitment. Delivered.」使用 20px 700 weight 居中排版，作为整个区块的收尾句。这套处理在信息密度和视觉节奏上达到了最佳平衡。

**局部亮点**:
- **v1** — 5 列 1px-gap 网格的整体面板感，所有 5 项承诺被视觉上「焊接」成一个整体，比独立卡片更有制造业的严谨感
- **v3** — 承诺卡片 hover 时切换到 `var(--ember-light)` 浅红背景 + 图标颜色从灰到红的过渡，红色只在交互时出现，平时保持灰度克制
- **v2** — 图标容器使用 `var(--blue-light)` 浅蓝填充背景 + 12px 圆角，图标始终为蓝色，视觉上最活泼最有科技感
- **Stitch A** — 承诺区使用了 5 个图标 + 文字的横向排列，排版最简洁，图标使用圆形边框处理

---

### 7. 认证（Certifications）

**最佳**: v3 "The Forge"

**原因**: v3 将认证区块分为左右两部分的水平布局（`certs-inner: flex, space-between`），左侧是标题 + 副标题，右侧是 4 个认证徽章水平排列。徽章使用零圆角矩形 + mono 字体 12px + 绿色盾牌图标，hover 时 border 变为 `var(--success)` 绿色。这种水平分割布局比 v1/v2 的居中堆叠更紧凑、更有效率感。Logo 墙独立成一个 section，使用 80x32px 的极小占位符 + 9px 字号 + 50% 不透明度，视觉上几乎是暗示性的而非展示性的，让客户 logo 成为一种「低调证明」而非「大声宣告」。

**局部亮点**:
- **v3** — 认证徽章的零圆角处理，在整套零圆角设计体系中是最自洽的；logo 占位符 80x32px 的极致紧凑尺寸表达了「不需要大声说」的自信
- **v2** — 认证徽章使用 `border-radius: var(--r-full)` 药丸形状，hover 时背景渐变到 `var(--blue-50)` 浅蓝，交互反馈最友好
- **v1** — 认证徽章使用 `border-radius: 4px` 微圆角 + 绿色盾牌图标，与 amber 主色形成的绿色点缀是页面上唯一的第三色
- **Stitch A** — 认证行使用简洁的文字标签横向排列（ISO 9001, UL Listed, CE Mark, AS/NZS 2053, ROHS），在页面最底部作为信任锚点
- **Stitch B** — 认证信息集成在最终 CTA 区块底部，用极简的单行排列，与 CTA 合并后减少了页面总区块数

---

### 8. 终 CTA（Final Call-to-Action）

**最佳**: v3 "The Forge"

**原因**: v3 的终 CTA 区块将 Archivo Black 字体在 `clamp(36px, 5vw, 56px)` 尺度下以全大写形式输出「LET'S BUILD SOMETHING.」，`line-height: 1` 让字行贴合，标题中使用 `<br>` 在「Build」后换行制造了视觉节奏。背景 `var(--ink)` (#0A0A0A) 是所有原型中最深的黑色。底部使用 `radial-gradient(ellipse, rgba(214,48,49,0.06))` 红色径向光晕，从底部中心向上弥散，暗示「熔炉」意象。trust-line 使用 mono 字体 12px + 红色图标，信息行的「24-hour response / Factory direct / 20+ countries」精简到最短形式，没有多余的词。整体在气势感和精密感之间取得了最佳平衡。

**局部亮点**:
- **v3** — `#0A0A0A` 纯黑背景 + 底部红色径向光晕，在所有暗色终 CTA 中最有戏剧性深度
- **v3** — trust-line 使用 mono 字体 12px + 0.02em 字间距，把信任信息处理成类似工程标注的形态
- **v2** — 终 CTA 顶部使用 `radial-gradient(ellipse, rgba(29,155,240,0.08))` 蓝色光晕从顶部照下，与 v3 的底部红色光晕形成有趣对比
- **v2** — 标题使用 Outfit 字体 800 weight + `letter-spacing: -0.03em` 紧缩字距，在不使用 display 字体的情况下仍然有足够的标题重量感
- **v1** — `border-top: 1px solid var(--border-dark)` 分隔线上方的 trust-line 使用 amber 色图标 + slate 色文字，amber 在深色背景上的识别度比蓝色或红色都强
- **Stitch A** — 终 CTA 标题「Ready to Scale?」比其他原型的通用文案更有业务针对性；使用蓝色主按钮 + 白色辅助按钮的双 CTA 布局最清晰
- **Stitch B** — 终 CTA 标题「Ready to Optimize Your Tech Chain?」直指技术链差异化优势，文案角度最精准

---

## Cherry-Pick 清单

以下是从所有原型中提取的最佳视觉元素，按优先级排列：

### 排版系统
| 元素 | 来源 | 描述 |
|------|------|------|
| Display 字体 | v3 | Archivo Black, uppercase, `line-height: 0.95`, `letter-spacing: -0.03em` — 用于 Hero 和终 CTA 标题 |
| Body 字体 | v3 | Manrope 800 weight — 用于 section 标题，比 IBM Plex Sans 更现代 |
| Mono 字体 | 全部通用 | JetBrains Mono — 用于编号、规格数据、标签，五个原型一致选择 |
| 方括号编号 | v3 | `[01]` `[02]` 格式取代纯数字，增加工程文档感 |

### 色彩与纹理
| 元素 | 来源 | 描述 |
|------|------|------|
| 品牌红色条 | v3 | 顶部 3px 固定红色 `brand-bar`，零成本品牌辨识度 |
| 网格纸纹理 | v3 | `grid-paper` 40px 间距 + 椭圆形 mask-image 衰减，用于技术相关区块 |
| 径向光晕 | v3 + v2 | 底部红色光晕（v3 终 CTA）或顶部蓝色光晕（v2 终 CTA），增加暗色区块深度 |
| 斜纹纹理 | v3 | Hero 右侧 `-45deg repeating-linear-gradient`，极低透明度表面质感 |
| Amber 网格纹理 | v1 | 样品 CTA amber 背景上叠加 40px 白色网格线，暖色 + 纹理的结合效果 |

### 微交互
| 元素 | 来源 | 描述 |
|------|------|------|
| 底部红线扫动 | v3 | 产品卡片 `::after` 伪元素 `width: 0 → 100%`, 0.3s — 最有记忆点的 hover 效果 |
| 蓝色外圈光环 | v2 | 流程图标 hover 时 `box-shadow: 0 0 0 4px rgba(29,155,240,0.08)` — 比单色 border 多一层 |
| 卡片上浮 | v2 | `translateY(-2px)` + 品牌色阴影 — 最自然的卡片 hover 反馈 |
| 图标双态变色 | v3 | 图标默认灰色，hover 时切换到红色，红色只在交互时出现 |

### 布局模式
| 元素 | 来源 | 描述 |
|------|------|------|
| 全宽标题 + 双栏内容 | v3 | Hero 标题独占全宽，子内容（文字 + 图片）在下方分栏，两级信息架构 |
| Baseline 横向排布 | v3 | 样品 CTA 标题和描述文字同行 baseline 对齐，紧凑高效 |
| 左右水平分割 | v3 | 认证区块左标题右徽章，比居中堆叠更高效 |
| 1px-gap 无缝网格 | v3 + v1 | 产品卡片/服务承诺使用 `gap: 1px; background: border-color`，面板感强于独立卡片 |
| accent-left 引用块 | v3 | `border-left: 3px solid red + padding-left: 16px`，用于拉出关键卖点段落 |

### 分隔与节奏
| 元素 | 来源 | 描述 |
|------|------|------|
| 标尺线 | v3 | `.ruler` 分隔线两端带 7px 短竖标记，模拟工程标尺 |
| 渐隐分隔线 | v2 | `.section-line` 使用 `linear-gradient(90deg, transparent → border → transparent)`，比硬线更柔和 |
| 双 border 框定 | v3 | 样品 CTA 使用 `border-top + border-bottom` 取代背景色，轻量区块分隔 |

### 照片与实拍
| 元素 | 来源 | 描述 |
|------|------|------|
| 工业场景实拍 | Stitch A | 应用场景卡片使用真实工业照片 + 半透明标签覆盖，建立场景可信度 |
| 产品实拍 | Stitch A | 产品卡片使用真实产品照片（弯管、接头等），买家可直接识别产品形态 |
| 暗调工业摄影 | Stitch B | 所有图片统一暗调处理，与深色 UI 配色一体化，工业氛围最浓 |
| Hero 工厂实拍 | Stitch A | Hero 区右侧使用工厂/设备实拍，比 placeholder 有质的飞跃 |

---

## 综合评价

v3 "The Forge" 在**视觉设计系统的完整度**上遥遥领先——零圆角、Archivo Black display 字体、单色+红色点缀、工程制图纹理、标尺分隔线这些元素形成了一套高度自洽的视觉语言。它在 8 个区块中赢得了 6 个「最佳视觉处理」。

两个 Stitch 原型的核心优势不在设计系统，而在**照片应用**——它们是唯一使用真实工业摄影的原型，这在最终实现中不可替代。

v2 "Twitter Blue" 的**微交互系统**（光环、上浮、蓝色光晕）最成熟友好，适合作为交互层的参考。

v1 "Navy+Amber" 的**信息密度处理**（5 列承诺网格、徽章系统、social proof）最均衡，适合作为内容布局的参考。

**推荐最终版本策略**：以 v3 的设计系统为骨架，cherry-pick v2 的微交互、v1 的信息密度技巧，用 Stitch A/B 级别的实拍摄影替换所有 placeholder。
