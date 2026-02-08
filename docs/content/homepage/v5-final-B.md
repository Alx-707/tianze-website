# Tianze Homepage V5-B — Design Input

> **Status:** 设计输入文档
> **Based on:** V5-final 文案 + 设计方向讨论
> **Date:** 2026-02-06

---

## 设计方向

### 配色：使用项目现有 Twitter Blue 体系

**来源**: `src/app/globals.css`

核心色值：

| 角色 | Token | 值 |
|------|-------|----|
| Primary | `--primary` | `oklch(0.672 0.161 245)` (Twitter Blue) |
| Background | `--background` | `oklch(1 0 0)` (纯白) |
| Foreground | `--foreground` | `oklch(0.188 0.013 248)` |
| Card | `--card` | `oklch(0.978 0.001 197)` |
| Border | `--border` | `oklch(0.932 0.012 232)` |
| Muted | `--muted` | `oklch(0.922 0.001 286)` |
| Secondary | `--secondary` | `oklch(0.188 0.013 248)` |
| Destructive | `--destructive` | `oklch(0.619 0.238 26)` |
| Success | `--success` | `oklch(0.69 0.155 160)` |

**设计理由**: 社交媒体用户基数最大，Twitter Style 的审美接受度最广。蓝色传递信任感，纯白背景干净不分散注意力。工业品牌可以通过内容（产品图、技术参数、认证徽章）传递专业感，不依赖视觉风格本身。

### 背景策略：以浅色为主，设计师自由发挥

**不采用** v5-final 中的深浅交替节奏。倾向全浅色底，但不做硬性规定 — 设计师可根据视觉需要自行决定区块背景处理方式（微妙灰度差、细线分隔、局部着色等均可）。

### 圆角 / 阴影 / 字体：允许微调

当前 globals.css 定义：
- 圆角：20px base（`--radius: 1.3rem`）
- 阴影：几乎为零（opacity 0）
- 字体：Open Sans

设计师可在 Twitter Style 基础上做合理微调（如适当缩小圆角、为卡片加轻阴影、技术参数用 monospace 字体），只要整体保持干净扁平的基调。

### 图标

使用 Lucide 线条图标，不使用 emoji。

### 布局骨架：采纳 Vercel 布局规范

**来源**: `docs/vercel-design-system/`

| 规范 | 值 | 说明 |
|------|-----|------|
| 内容容器 | `max-width: 1080px` | 标准页面宽度，居中 |
| 窄容器 | `max-width: 860px` | 文章/表单 |
| 容器边距 | `24px`（移动端 `16px`） | 小屏保护 |
| 间距基准 | 8px 网格 | 所有间距为 8 的倍数 |
| 响应式断点 | 640 / 768 / 1024 / 1150 / 1400px | 1150px 为导航切换点 |
| 装饰网格线 | `rgba(0,0,0,0.05)` | 可局部使用，暗示精密感 |

Hero 等需要视觉冲击的区块可突破 1080px 容器。

### 设计自由度原则

**内容元素是约束，布局方式不约束。**

各 Section 定义了「需要呈现什么」（文案、图片、图标、数据），不规定「怎么摆」。设计师对布局、排列、间距、视觉节奏拥有完全自由。

---

## 结构概览（8 区块）

| # | 区块 | 心理学作用 |
|---|------|-----------|
| 1 | Hero | Attention — 5秒建立差异化 + 引导探索 |
| 2 | Full Chain Tech | Interest — 展示技术链路核心优势 |
| 3 | 产品线 | Interest — 展示产品广度 |
| 4 | 免费样品CTA | Commitment — 低门槛小承诺 |
| 5 | 6场景案例 | Desire — 想象应用场景 |
| 6 | 服务承诺 | Trust — 消除品质顾虑 |
| 7 | 认证+Logo | Trust — 第三方背书 |
| 8 | Final CTA | Action — 多层次转化出口 |

---

## Section 1: Hero

### Trust Badge
**「Factory Direct · Full-Chain Control」**

### Headline
**PVC Conduit Bends. Machine Makers. Pipe Experts.**

### Subheadline
24/7 automated production. 100% virgin material.

### Single CTA
**See How We Build ↓**

### Social Proof Line
Exporting to 20+ countries · ISO 9001:2015 Certified

### Visual: 三张图片

| 图片 | 内容 | 作用 |
|------|------|------|
| 主图 | 弯管机设备 | 核心差异化展示 |
| 副图 | 生产线全景 | 规模感 |
| 小图 | 弯管近景细节 | 产品质量细节 |

三图需同时呈现，布局方式不限。

---

## Section 2: Full Chain Technology

### Section Header
**Five Steps. All In-House.**

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

### Card 02: Bell End Fittings
**Tag:** `Push-Fit Design`
**Title:** Bell End & Expansion Joints
**Specs:**
- Double-socket design
- Faster field installation
- No couplings needed

**CTA:** View Specifications →

### Card 03: Flared Fittings — AU Standard
**Tag:** `AS/NZS Compliant`
**Title:** Flared Fittings — AU Standard
**Specs:**
- AS/NZS 2053 compliant
- Reduces cable abrasion
- Smooth internal surface

**CTA:** View Specifications →

### Card 04: Custom & OEM Projects
**Tag:** `Low MOQ`
**Title:** Custom & OEM Projects
**Specs:**
- Custom angles, OD, wall thickness
- Private labeling & packaging
- Prototype to mass production

**CTA:** Start Your Project →

---

## Section 4: Free Sample CTA

### Headline
**Test Before You Commit.**

### Body
Verify the quality yourself. Ships within 3 days — you only pay freight.

### CTA Button
**Request Free Samples**

---

## Section 5: Application Scenarios (6 场景)

### Section Header
**Where Our Conduits Work**

### Row 1

#### Scenario 1: Underground Pre-Burial
**Image:** PVC conduit bends in trench installation
**Title:** Underground Pre-Burial
**Description:** Pre-bent conduits for direct burial. Consistent bend radius. No cracking under soil pressure.
**Testimonial:** "The bends arrived ready to install. Saved us 2 days on site." — *Project Manager, Infrastructure Contractor, UAE*

#### Scenario 2: Double-Socket Connections
**Image:** Bell end fittings being assembled
**Title:** Double-Socket Connections
**Description:** Push-fit connection. 30% faster installation. No separate couplings needed.
**Testimonial:** "Our crews love these. No glue on one end, done." — *Electrical Contractor, Commercial Builder, Texas*

#### Scenario 3: Australian Flared Fittings
**Image:** AS/NZS compliant flared fittings
**Title:** Australian Standard Fittings
**Description:** Flared entry reduces cable wear. Required for Australian commercial projects.
**Testimonial:** "Finally found a supplier who understands AU standards." — *Procurement Lead, Electrical Wholesaler, Sydney*

### Row 2

#### Scenario 4: Hospital Pneumatic Systems
**Image:** PETG tubing in hospital setting
**Title:** Hospital Pneumatic Systems
**Description:** High-clarity PETG tubes for pneumatic delivery. Leak-proof joints. Silent operation.
**Testimonial:** "Zero leaks in 18 months. That's the standard we need." — *Facilities Director, Regional Hospital Network*

#### Scenario 5: Municipal Large-Diameter
**Image:** Large-bore conduits at infrastructure site
**Title:** Municipal Infrastructure
**Description:** Up to 168mm diameter. Underground cable protection for municipal power and telecom.
**Testimonial:** "Big pipes, tight tolerances. They delivered." — *City Engineer, Public Works Department, Southeast Asia*

#### Scenario 6: Data Center & Commercial Electrical
**Image:** Conduit installation in data center
**Title:** Data Center & Commercial Electrical
**Description:** Complete conduit solutions for high-density electrical systems. All standard certifications.
**Testimonial:** "Consistent quality across 3 data center projects. That's why we keep ordering." — *Project Director, Data Center Contractor, UAE*

---

## Section 6: Service Commitments

### Section Header
**Our Commitments. In Writing.**

### Commitment Grid

| Icon | Commitment | Description |
|------|------------|-------------|
| Clock | **48-hour drawings** | Technical drawings delivered in 2 business days. |
| FileCheck | **Batch traceability** | Every shipment tracked. Full documentation included. |
| Package | **Export-ready packaging** | Palletized, labeled, container-optimized. |
| User | **Dedicated support** | One point of contact from quote to delivery. |
| Layers | **Flexible MOQ** | Low minimums for first orders. Scale up when ready. |

### Closing Statement
**Your specs. Our commitment. Delivered.**

---

## Section 7: Certifications & Partners (紧凑区块)

### Section Header
**Certified. Trusted. Worldwide.**

### Certification Badges Row
ISO 9001:2015 · UL651 · CE · AS/NZS 2053

### Logo Wall
**Subheader:** Trusted by contractors and distributors across 6 continents

[客户 Logo / 认证徽章占位符]

---

## Section 8: Final CTA

### Headline
**Let's Build Something.**

### Subheadline
Get a quote, book a technical consultation, or just ask a question. We respond within 24 hours.

### Primary CTA
**Get Factory-Direct Quote**

### Secondary CTA
**Book Technical Consultation**

### Trust Line
24-hour response guaranteed · Factory direct · 20+ countries served

### FAQ Link
Have questions? [See FAQs →]

---

## Meta Content

### Page Title (SEO)
PVC Conduit Bends & Fittings Manufacturer | Factory Direct | Tianze

### Meta Description
PVC conduit bends, bell end fittings, and custom solutions from the factory that builds bending machines. 16-168mm range. ISO 9001 certified. Get a factory-direct quote.

---

## 信息职责分工

确保各区块不重复（已在 V5 中去重）：

| 区块 | 信息职责 |
|------|----------|
| S1 Hero | 核心身份 + 生产能力（24/7, 100% virgin material） |
| S2 技术链 | 5 步垂直整合流程（±0.3mm, 专利弯管技术） |
| S3 产品线 | 产品广度 + 定制**能力**（Custom angles, OD, 包装） |
| S4 样品CTA | 低门槛承诺（免费样品, 3天发货） |
| S5 场景 | 应用想象 + 社会证明（6 场景 + 证言） |
| S6 服务承诺 | 服务**交付方式**（48小时图纸, 批次追溯, 出口包装） |
| S7 认证 | 所有认证集中展示（ISO, UL, CE, AS/NZS） |
| S8 终CTA | 多层次转化出口 |
