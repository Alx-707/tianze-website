# Tianze Homepage V5 — Final

> **Status:** 定稿
> **Based on:** V4.1 + 用户评审优化
> **Date:** 2026-02-05

---

## 结构概览（8 区块）

| # | 区块 | 心理学作用 | 背景 |
|---|------|-----------|------|
| 1 | Hero | Attention — 5秒建立差异化 + 引导探索 | Light + factory |
| 2 | Full Chain Tech | Interest — 展示技术链路核心优势 | Dark |
| 3 | 产品线 | Interest — 展示产品广度 | Light |
| 4 | 免费样品CTA | Commitment — 低门槛小承诺 | Primary |
| 5 | 6场景案例 | Desire — 想象应用场景 | Light gray |
| 6 | 品质承诺 | Trust — 消除品质顾虑 | Light |
| 7 | 认证+Logo | Trust — 第三方背书 | White |
| 8 | Final CTA | Action — 多层次转化出口 | Dark |

---

## Section 1: Hero

### Trust Badge
**「Factory Direct · Full-Chain Control」**

> *优化 #1: 强调工厂直销和全链路控制，避免与 Headline 重复*

### Headline
**PVC Conduit Bends. Machine Makers. Pipe Experts.**

### Subheadline
24/7 automated production. 100% virgin material.

> *优化 #2: 强调生产能力和原料品质*

### Single CTA
**See How We Build ↓**

### Social Proof Line
Exporting to 20+ countries · ISO 9001:2015 Certified

> *优化 #3 & #4: 统一使用 20+ countries，与 PROJECT-BRIEF 一致*

### Visual Design: Three-Image Stacking

**布局结构（不对称图片集群）：**

```
┌─────────────────────────────────────────────────────┐
│  [Small Float]                                       │
│  ┌─────────┐                                        │
│  │ Bend    │                                        │
│  │ Detail  │  ┌─────────────────────────────────┐   │
│  └─────────┘  │                                 │   │
│               │      Main Image                 │   │
│               │      (Bending Machine)          │   │
│               │      85% width × 75% height     │   │
│  ┌────────────┤                                 │   │
│  │ Secondary  │                                 │   │
│  │ Production │─────────────────────────────────┘   │
│  │ Line       │                                     │
│  │ 50%×40%    │                                     │
│  └────────────┘                                     │
└─────────────────────────────────────────────────────┘
```

**图片配置：**
| 位置 | 尺寸 | 内容 | 作用 |
|------|------|------|------|
| 主图 | 85% width × 75% height | 弯管机设备 | 核心差异化展示 |
| 副图 | 50% width × 40% height | 生产线全景 | 规模感 |
| 小图 | 浮动小方块 | 弯管近景细节 | 产品质量细节 |

### Design Requirements

- 背景：浅色工厂风格，非暗色
- 三图叠放：不对称布局，主图占主导
- Trust Badge 作为小徽章放在 Headline 上方
- 单一 CTA 按钮，带向下箭头引导滚动
- 移动端：三图堆叠为垂直布局

---

## Section 2: Full Chain Technology

### Section Header
**Five Steps. All In-House.**

> *优化 #5: 简洁设置 5 步流程，避免与 Trust Badge 重复 "Full-Chain Control / Factory Direct"*

### Process Flow (技术链路图标条)

```
[R&D Icon] ──→ [Machine Icon] ──→ [Mold Icon] ──→ [Production Icon] ──→ [QC Icon]
 Bending Machine    Equipment        Mold           Conduit            Quality
 R&D               Manufacturing    Fabrication    Production         Control
```

### Supporting Copy
We design and build our own bending machines. That's how we guarantee ±0.3mm tolerances.

### Stats Row
| Metric | Value |
|--------|-------|
| Patented Bending Technology | ✓ |
| Vertical Integration | 5 Steps |
| In-House Molds | ✓ |

> *优化 #10: "200+ Patents" 改为 "Patented Bending Technology"（更可验证）*

### Design Requirements

- 深色背景（与 Final CTA 呼应）
- 图标流程横向排列，箭头连接
- 图标风格：线条 + 工业感
- 流程条下方配简短说明文字

---

## Section 3: Product Lines

### Section Header
**Four Product Lines. One Factory.**

### Subheader
16mm to 168mm diameter. Custom OD, wall thickness, and length — all available.

### Card 01: Standard Conduit Bends
**Tag:** `In-House Mold`

**Title:** Standard PVC Conduit Bends

**Specs:**
- 90° / 45° / Custom angles
- Schedule 40 & Schedule 80
- ASTM, UL651, AS/NZS compliant

**CTA:** View Specifications →

---

### Card 02: Bell End Fittings
**Tag:** `Push-Fit Design`

> *优化 #6: 差异化标签，突出产品特点*

**Title:** Bell End & Expansion Joints

**Specs:**
- Double-socket design
- Faster field installation
- No couplings needed

**CTA:** View Specifications →

---

### Card 03: Flared Fittings — AU Standard
**Tag:** `AS/NZS Compliant`

> *优化 #6: 差异化标签，突出合规性*

**Title:** Flared Fittings — AU Standard

**Specs:**
- AS/NZS 2053 compliant
- Reduces cable abrasion
- Smooth internal surface

**CTA:** View Specifications →

---

### Card 04: Custom & OEM Projects
**Tag:** `Low MOQ`

> *优化 #6: 差异化标签，吸引定制需求客户*

**Title:** Custom & OEM Projects

**Specs:**
- Custom angles, OD, wall thickness
- Private labeling & packaging
- Prototype to mass production

**CTA:** Start Your Project →

> *优化: CTA 从通用 "View Specifications" 改为行动导向*

### Design Requirements

- 大号编号标签 (01, 02, 03, 04)
- 每张卡片角落有差异化标签
- 2×2 网格布局（桌面），单列（移动端）
- 卡片包含产品图片

---

## Section 4: Free Sample CTA

### Headline
**Test Before You Commit.**

### Body
Verify the quality yourself. Ships within 3 days — you only pay freight.

> *优化 #13: 合并信息，更简洁有力*

### CTA Button
**Request Free Samples**

### Design Requirements

- 全宽区块，Primary 色背景
- 居中文字，单一突出 CTA（浅色按钮在深色背景上）
- 保持紧凑，单行感

---

## Section 5: Application Scenarios (6 场景)

### Section Header
**Where Our Conduits Work**

### Layout
**2 行 × 3 列网格布局**

---

### Row 1

#### Scenario 1: Underground Pre-Burial
**Image:** PVC conduit bends in trench installation
**Title:** Underground Pre-Burial
**Description:** Pre-bent conduits for direct burial. Consistent bend radius. No cracking under soil pressure.
**Testimonial:** "The bends arrived ready to install. Saved us 2 days on site." — *Project Manager, Infrastructure Contractor, UAE*

> *优化 #7: 增加行业/公司类型*

#### Scenario 2: Double-Socket Connections
**Image:** Bell end fittings being assembled
**Title:** Double-Socket Connections
**Description:** Push-fit connection. 30% faster installation. No separate couplings needed.
**Testimonial:** "Our crews love these. No glue on one end, done." — *Electrical Contractor, Commercial Builder, Texas*

> *优化 #7: 增加行业/公司类型*

#### Scenario 3: Australian Flared Fittings
**Image:** AS/NZS compliant flared fittings
**Title:** Australian Standard Fittings
**Description:** Flared entry reduces cable wear. Required for Australian commercial projects.
**Testimonial:** "Finally found a supplier who understands AU standards." — *Procurement Lead, Electrical Wholesaler, Sydney*

> *优化 #7: 增加行业/公司类型*

---

### Row 2

#### Scenario 4: Hospital Pneumatic Systems
**Image:** PETG tubing in hospital setting
**Title:** Hospital Pneumatic Systems
**Description:** High-clarity PETG tubes for pneumatic delivery. Leak-proof joints. Silent operation.
**Testimonial:** "Zero leaks in 18 months. That's the standard we need." — *Facilities Director, Regional Hospital Network*

> *优化 #7: 增加公司类型*

#### Scenario 5: Municipal Large-Diameter
**Image:** Large-bore conduits at infrastructure site
**Title:** Municipal Infrastructure
**Description:** Up to 168mm diameter. Underground cable protection for municipal power and telecom.
**Testimonial:** "Big pipes, tight tolerances. They delivered." — *City Engineer, Public Works Department, Southeast Asia*

> *优化 #7: 增加部门类型*

#### Scenario 6: Data Center & Commercial Electrical
**Image:** Conduit installation in data center
**Title:** Data Center & Commercial Electrical
**Description:** Complete conduit solutions for high-density electrical systems. All standard certifications.
**Testimonial:** "Consistent quality across 3 data center projects. That's why we keep ordering." — *Project Director, Data Center Contractor, UAE*

> *优化 #8: 从通用 "Commercial Building" 改为高价值场景 "Data Center"*

### Design Requirements

- 2×3 网格布局（桌面），2 列或单列（移动端）
- 每个场景卡片包含：图片 + 标题 + 描述 + 证言
- 证言使用引号，斜体归属
- 浅灰色背景，卡片为白色

---

## Section 6: Service Commitments

### Section Header
**Our Commitments. In Writing.**

### Commitment Grid (承诺式短句)

| Icon | Commitment | Description |
|------|------------|-------------|
| Clock (线条图标) | **48-hour drawings** | Technical drawings delivered in 2 business days. |
| FileCheck (线条图标) | **Batch traceability** | Every shipment tracked. Full documentation included. |
| Package (线条图标) | **Export-ready packaging** | Palletized, labeled, container-optimized. |
| User (线条图标) | **Dedicated support** | One point of contact from quote to delivery. |
| Layers (线条图标) | **Flexible MOQ** | Low minimums for first orders. Scale up when ready. |

### Closing Statement
**Your specs. Our commitment. Delivered.**

### Design Requirements

- 图标 + 文字网格布局（2-3 列）
- 图标风格：线条，工业感（使用 Lucide 或 Heroicons）
- 收尾金句居中加粗
- 浅色背景，干净布局

---

## Section 7: Certifications & Partners (紧凑区块)

### Section Header
**Certified. Trusted. Worldwide.**

### Certification Badges Row
ISO 9001:2015 · UL651 · CE · AS/NZS 2053

### Logo Wall
**Subheader:** Trusted by contractors and distributors across 6 continents

> *优化 #3: 从 "50+ countries" 改为 "6 continents"，避免重复*

[客户 Logo / 认证徽章占位符]

### Design Requirements

- 紧凑区块，不占用过多垂直空间
- 白色背景
- 认证徽章横向排列
- Logo 墙灰度显示，悬停时全彩
- 可考虑合并为单行或两行

---

## Section 8: Final CTA

### Headline
**Let's Build Something.**

> *优化 #11: 从被动的 "Ready to Talk?" 改为更有行动感的 Headline*

### Subheadline
Get a quote, book a technical consultation, or just ask a question. We respond within 24 hours.

### Primary CTA
**Get Factory-Direct Quote**

### Secondary CTA
**Book Technical Consultation**

> *优化 #12: 删除 Tertiary CTA（邮件订阅），聚焦询盘转化*

### Trust Line
24-hour response guaranteed · Factory direct · 20+ countries served

> *优化 #3 & #4: 这是 "20+ countries" 第二次（也是最后一次）出现*

### FAQ Link
Have questions? [See FAQs →]

### Design Requirements

- 深色背景（与 Section 2 呼应）
- 双 CTA 选项，层级清晰
- 底部信任图标/文字

---

## Meta Content

### Page Title (SEO)
PVC Conduit Bends & Fittings Manufacturer | Factory Direct | Tianze

### Meta Description
PVC conduit bends, bell end fittings, and custom solutions from the factory that builds bending machines. 16-168mm range. ISO 9001 certified. Get a factory-direct quote.

> *优化 (Phase 3.3 SEO): 添加 CTA "Get a factory-direct quote" 替代 "Ships to 20+ countries"*

---

## V4.1 → V5 变更摘要

| # | 优化项 | V4.1 | V5 | 优先级 |
|---|--------|------|----| ------|
| 1 | Trust Badge | 15 Years in Bending Equipment | Factory Direct · Full-Chain Control | 高 |
| 2 | Hero Headline | Built by the Engineers... | Machine Makers. Pipe Experts. | 高 |
| 3 | Hero Subheadline | others can't match | 24/7 automated production. 100% virgin material. | 高 |
| 4 | 国家数 | 50+ / 100+ (不准确) | 20+ (实际数据) | 高 |
| 5 | Section 2 Header | No Middlemen. No Guesswork. | Full-Chain Control. Factory-Direct Precision. | 中 |
| 6 | Product Card Tags | 全部 In-House Mold | 差异化：In-House Mold / Push-Fit / AS/NZS / Low MOQ | 中 |
| 7 | Testimonials | 模糊归属 | 增加行业/公司类型 | 中 |
| 8 | Scenario 6 | Commercial Building | Data Center & Commercial Electrical | 中 |
| 9 | Icons | Emoji | 线条图标描述 | 低 |
| 10 | 专利声明 | 200+ Patents | Patented Bending Technology | 低 |
| 11 | Final CTA Headline | Ready to Talk? | Let's Build Something. | 低 |
| 12 | Tertiary CTA | 邮件订阅 | 删除 | 低 |
| 13 | Sample CTA Body | 两句话 | 合并为一句 | 低 |
| 14 | S2 Header 去重 | Full-Chain Control. Factory-Direct Precision. | Five Steps. All In-House. | 高 |
| 15 | S2 Stats 去重 | Production Lines 24/7 | Vertical Integration 5 Steps | 中 |
| 16 | S3 Trust Tag 去重 | ISO 9001:2015 Certified | 移除（S1/S7 已覆盖） | 低 |
| 17 | S3 Card04 去重 | Low MOQ / 48-hour drawing | Custom angles, OD / Private labeling / Prototype to mass | 中 |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| V1 | 2026-02-03 | 初始版本 |
| V2 | 2026-02-03 | 三轮分析优化 |
| V3 | 2026-02-04 | SEO + 内容策略整合 |
| V4 | 2026-02-04 | 结构精简至6区块 |
| V4.1 | 2026-02-04 | 8区块重平衡 + Hero单CTA |
| **V5** | **2026-02-05** | **13项微调优化（数据一致性、文案措辞、标签差异化）** |
