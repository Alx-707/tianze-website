# 竞品调研综合分析 + 全站行动规划

> 调研时间：2026-03-24
> 调研对象：Ledes / Ctube / Anita / Goody
> 说明：单体竞品分析已退出主树，这份文档是当前保留的竞品总结层。

---

## 一、天泽现有页面清单

| 页面 | 路径 | 当前状态 |
|------|------|---------|
| 首页 | `/` | 已重构完成 |
| 产品总览 | `/products` | 已完成，5 个市场卡片 |
| 市场详情页 x5 | `/products/[market]` | Phase 1 完成，i18n 待做 |
| 弯管机能力页 | `/capabilities/bending-machines` | 已完成，i18n 待做 |
| OEM 定制页 | `/oem-custom-manufacturing` | 已完成 |
| 关于我们 | `/about` | 已完成 |
| 联系我们 | `/contact` | 已完成，含表单 |
| FAQ | `/faq` | 已完成，MDX 驱动 |
| 博客 | `/blog` + `/blog/[slug]` | 框架完成，内容少（1篇） |
| 隐私 / 条款 | `/privacy` `/terms` | 已完成 |

---

## 二、按页面整合竞品启发

### 2.1 首页

**竞品做法**：
- Ledes：认证定位 "China's 1st UL & CSA" 贯穿首屏标题和描述
- Ctube：首屏有 Get Quote + WhatsApp 双 CTA，核心数字（15年/80+国家/5000+ SKU）首屏可见
- Goody："中国 PVC 电气管道发明者"定位在首页强调

**天泽行动项**：
- [ ] **H-1** 首页 Hero 区强化差异化定位 — "弯管机制造商"或等价的一句话定位，要像 Ledes 一样让人一眼记住
- [ ] **H-2** 核心数字信任条 — 出口国家数、成立年份、产能等数字在首页首屏可见（目前 ProofLine 有，确认数据是否完整准确）
- [ ] **H-3** 首页 CTA 增加 WhatsApp 入口 — Ctube 的三层 CTA（Get Quote + WhatsApp + Email）转化效率高于单一按钮

---

### 2.2 产品总览页 (`/products`)

**竞品做法**：
- Ctube：Mega Menu 按认证标准分（UL / CSA / AS-NZS / IEC），每个系列独立 URL，对 SEO 价值极大
- Ledes：同样按标准分系列，URL 含完整关键词（`/conduit-ul-pipes/`）
- Anita：按产品类型分（PVC Conduit / EMT Fittings / Boxes），再按子类型细分

**天泽行动项**：
- [ ] **P-1** 产品总览页增加按认证标准的导航入口 — 当前按"市场地区"分（北美/澳新/...），可增加按"认证标准"的视角（UL 651 / AS/NZS 2053 / IEC 61386），两种入口指向同一套市场页面，但给 SEO 和买家多一个发现路径

---

### 2.3 市场详情页 (`/products/[market]`) — Phase 2 核心

**竞品做法**：
- 4 家竞品的规格表都不完整：Ledes 无完整表、Ctube 用图片、Anita 几乎没有、Goody 纯文字
- Ctube 产品页有 PDF 目录下载链接
- Ledes 产品页有用户评价（WooCommerce 评论）
- Anita 认证信息展示最规范（独立页，含编号 + 核验链接）

**天泽行动项**：

#### i18n 化（优先级最高）
- [ ] **M-1** `product-catalog.ts` 的 label / description → 翻译 key（A 类硬编码）
- [ ] **M-2** 5 个 `product-specs/*.ts` 的 highlights / groupLabel / columns / technical / trade → 翻译 key（B 类硬编码，~243 处）
- [ ] **M-3** 补齐 `messages/en/` 和 `messages/zh/` 对应翻译条目
- [ ] **M-4** 页面 Metadata（title / description）使用翻译 key

#### 产品页信息增强
- [ ] **M-5** 规格表保持 HTML 表格格式（已是，确认不退化）— 这是对所有竞品的降维优势
- [ ] **M-6** 每个市场页底部增加"相关产品"推荐 — 同系列配套管件交叉引导
- [ ] **M-7** 认证信息区增加认证 Logo 图标展示 — 学 Anita 的可视化做法
- [ ] **M-8** 预留 PDF 下载入口（规格表 PDF、认证证书）— 学 Ledes/Ctube，当有 PDF 资产后启用

---

### 2.4 弯管机能力页 (`/capabilities/bending-machines`)

**竞品做法**：
- 4 家竞品没有任何类似页面 — 这是天泽的独特资产，无人可抄
- Ledes/Ctube 的内容营销策略说明：技术差异化故事对 SEO 和信任建立价值巨大

**天泽行动项**：
- [ ] **B-1** `formatParamKey` 改用翻译 key — 当前把 camelCase 转英文标题，中文站看到的是英文参数名（PR #43 延后项 #8）
- [ ] **B-2** 设备参数国际化 — 设备名称、highlights 等也需要中文翻译
- [ ] **B-3** 考虑增加"为什么自制弯管机很重要"的技术叙事段 — 把差异化定位从口号变成可信的技术解释

---

### 2.5 关于我们 (`/about`)

**竞品做法**：
- Ctube：About 页有 Facilities Tour 子页，工厂设备图片
- Goody：展示多个生产基地（湖北/重庆/佛山/甘肃/北京），数字量化（5000+ SKU、多基地）
- Ledes：量化数据全站复用（500+人、107,639 ft²、14年、80+国家）
- Anita：展会参展照片（Canton Fair、IBS）

**天泽行动项**：
- [ ] **A-1** 核心数字固化并全站复用 — 成立年份、出口国家数、月产能、工厂面积等，在 About + 首页 + 产品页统一引用（建议放入 `src/config/site-facts.ts` 或已有的类似文件）
- [ ] **A-2** 工厂/生产线板块 — 如果有工厂照片/视频，增加生产能力展示区（4 家竞品中只有 Ctube 做了工厂参观页，天泽有机会做得更好）
- [ ] **A-3** 时间线叙事 — Goody 的"1979年发明者"叙事虽然执行差，但方向对。天泽可以讲"从弯管机制造到管件出口"的技术演进故事
- [ ] **A-4** 展会/客户拜访照片区 — 学 Anita，如果有参展/客户拜访照片可以展示

---

### 2.6 OEM 定制页 (`/oem-custom-manufacturing`)

**竞品做法**：
- Ctube：有 OEM/ODM 服务页，强调可按客户标准定制
- Ledes：无独立 OEM 页，但在产品页描述中提到 custom size/color
- Anita：无独立 OEM 页

**天泽行动项**：
- [ ] **O-1** OEM 页已有，确认 i18n 完整性 — 检查是否有硬编码英文
- [ ] **O-2** 增加"已服务的定制案例"板块 — 如果有，用匿名/脱敏方式展示（"某北美分销商定制 X 规格管件"）

---

### 2.7 联系页 (`/contact`)

**竞品做法**：
- Ctube：Get Quote + WhatsApp + Email 三层并联，首屏可见
- Ledes：邮件 + 电话 + WhatsApp，但入口不清晰
- Anita：底部联系表单 + Email + Phone，WhatsApp 不明显

**天泽行动项**：
- [ ] **C-1** 联系页增加 WhatsApp 一键聊天按钮 — B2B 外贸买家习惯用 WhatsApp
- [ ] **C-2** 考虑全站悬浮 WhatsApp 按钮 — Ctube/Ledes 都有，降低询盘门槛
- [ ] **C-3** 联系表单预填产品信息 — 从产品页 CTA 跳转时带上产品名/市场，减少买家填写量

---

### 2.8 FAQ 页 (`/faq`)

**竞品做法**：
- Ledes：独立 FAQ 页，折叠面板格式
- Ctube：FAQ 散布在各产品页底部
- 天泽已有：MDX 驱动 + FAQ Schema（结构化数据），已领先

**天泽行动项**：
- [ ] **F-1** FAQ 内容扩充 — 参考 Ledes/Ctube 的常见问题方向：
  - 采购流程类：MOQ、交期、样品、付款方式
  - 认证类：你们有哪些认证？UL/AS-NZS 区别？
  - 技术类：Schedule 40 vs 80 区别？如何选管径？
  - 定制类：可以定制颜色/印字吗？OEM 流程？
- [ ] **F-2** 产品页内嵌产品级 FAQ — 每个市场页底部放 2-3 个该市场特有的问题

---

### 2.9 博客 (`/blog`)

**竞品做法**：
- Ledes：**最强**，持续产出，类型丰富（Top 10 Manufacturers / Installation Guide / Sizing 101 / 竞品对比 / 市场排名）
- Ctube：持续产出，质量中等（How to Distinguish Manufacturers from Trading Companies 等）
- Anita：SEO 填充型，价值低（PVC conduit pipe for residential wiring 等泛内容）
- Goody：几乎没有

**天泽行动项**：
- [ ] **BL-1** 制定内容日历 — 天泽有"弯管机制造商"独特角度，内容方向：
  - **技术权威类**：PVC 导管弯曲半径计算、不同标准之间的区别（UL vs IEC vs AS/NZS）
  - **采购指南类**：如何选择 PVC 管件供应商、Schedule 40 vs Schedule 80 选型指南
  - **行业洞察类**：各市场 PVC 导管法规变化、新兴市场机会
  - **制造技术类**：弯管机如何影响管件质量（独家角度，竞品无法复制）
- [ ] **BL-2** 优先写 2-3 篇高价值文章 — 从 Ledes 的热门内容方向取灵感，但用天泽的技术深度做差异化

---

### 2.10 新增页面建议（竞品启发的缺失页面）

#### 认证展示页 `/certifications`（优先级：高）
- **来源**：Anita 的独立认证页做得最好（12 项认证 + 编号 + 核验链接）
- **内容**：天泽持有的所有认证，含证书编号、有效期、核验链接、证书 PDF 下载
- **价值**：海外买家筛选供应商的第一道门槛，4 家竞品中只有 Anita 做了独立页

#### 技术下载中心 `/downloads`（优先级：中）
- **来源**：Ledes 的 `/downloads/` + `/technical-resources/` 是其信任建立的高价值资产
- **内容**：产品规格 PDF、认证证书、安装指南、公司介绍册
- **前提**：需要先有 PDF 资产（可从现有规格数据生成 PDF）
- **价值**：对做材料清单（BOM）的专业买家是实用工具

#### 应用场景页 `/solutions` 或 `/applications`（优先级：中）
- **来源**：Ctube 有 Solutions 页，Anita 用 `/application/` 建了 30-50 个长尾落地页
- **内容**：按应用场景组织（住宅布线 / 商业建筑 / 工业项目 / 太阳能项目 / 数据中心）
- **价值**：捕获场景型搜索查询（"PVC conduit for data center"），SEO 长尾价值大

#### 工厂参观页 `/factory` 或 `/facilities`（优先级：中低，取决于素材）
- **来源**：Ctube 有 Facilities Tour 页，Goody 有生产基地展示
- **内容**：工厂照片/视频、生产设备、质检流程、弯管机生产线
- **前提**：需要真实工厂影像素材
- **价值**：4 家竞品中只有 Ctube 做了，且没有视频。天泽若有工厂视频 = 独家差异化

---

## 三、执行优先级排序

基于"业务可见性 x 实施难度"排列：

### 第一批：i18n 化 + 快速增强（1 个 PR）

对业务影响最大——让中文站从"废页"变成"可用"。

| 编号 | 任务 | 涉及文件 |
|------|------|---------|
| M-1 | product-catalog.ts label/description → i18n key | `product-catalog.ts` + messages |
| M-2 | 5 个 product-specs 的 highlights/groupLabel/columns/technical/trade → i18n key | `product-specs/*.ts` + messages |
| M-3 | 补齐中英文翻译条目 | `messages/en/` `messages/zh/` |
| M-4 | 页面 Metadata i18n | `products/[market]/page.tsx` |
| B-1 | bending-machines formatParamKey → i18n key | `bending-machines/page.tsx` |
| B-2 | 弯管机设备参数中文翻译 | `equipment-specs.ts` + messages |

### 第二批：信任增强 + CTA 优化（1 个 PR）

提升询盘转化率。

| 编号 | 任务 |
|------|------|
| H-1 | 首页定位语强化 |
| H-2 | 核心数字信任条确认/完善 |
| H-3 | WhatsApp CTA 入口（首页 + 联系页 + 全站悬浮） |
| C-1 | 联系页 WhatsApp 按钮 |
| C-3 | 产品页 → 联系表单预填产品信息 |
| M-7 | 认证 Logo 可视化展示 |

### 第三批：内容资产建设（持续）

建立长期 SEO 和信任资产。

| 编号 | 任务 |
|------|------|
| 认证页 | 新建 `/certifications` 页面 |
| F-1 | FAQ 内容扩充 |
| BL-1 | 内容日历制定 |
| BL-2 | 首批 2-3 篇博客文章 |
| A-1 | 核心数字全站统一 |

### 第四批：高级功能（按需）

取决于素材和业务节奏。

| 编号 | 任务 |
|------|------|
| 下载中心 | 新建 `/downloads` 页面（需 PDF 资产） |
| 应用场景 | 新建 `/solutions` 或 `/applications` |
| 工厂参观 | 新建 `/factory` 页面（需影像素材） |
| M-8 | 产品页 PDF 下载入口 |
| O-2 | OEM 定制案例展示 |

### 技术债（穿插处理）

| 编号 | 任务 |
|------|------|
| PR#43-10 | `read-and-hash-body.ts` 泛型 T 类型安全 |
| PR#43-11 | OEM 页面测试 Server Component 调用模式 |

---

## 四、与竞品的差异化战略总结

天泽独立站的竞争策略不是"做得和竞品一样好"，而是在 3 个维度形成不可复制的差异：

1. **技术叙事差异化**："我们制造弯管机，然后用它造管件"——没有竞品能讲这个故事
2. **数据精度差异化**：完整的 HTML 规格表 > 竞品的图片/缺失/文字描述
3. **架构品质差异化**：Next.js 定制设计 + 真正的多语言路由 > WordPress 模板 + 伪多语言

在此基础上，借鉴竞品验证过的最佳实践（按标准分产品系列、三层 CTA、认证独立页、技术下载中心、内容营销）来补齐功能完整度。
