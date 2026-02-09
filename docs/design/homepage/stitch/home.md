# 首页 (Home)

> 路径: `/`
> 对应组件: `src/app/[locale]/page.tsx`
> 内容来源: `messages/[locale]/critical.json` → `home.*`

---

## 页面目标

**主要目标**: 3秒内传达"设备+管件一体化制造商"的核心定位

**次要目标**:
- 建立专业可信的第一印象
- 引导访客进入产品页或联系页

**成功指标**:
- 跳出率 < 50%
- 平均停留时间 > 1分钟
- 点击"获取报价"或"产品"比例 > 15%

---

## 页面结构

```
┌─────────────────────────────────────┐
│  Hero                               │  ← LCP 关键
├─────────────────────────────────────┤
│  Products Overview                  │
├─────────────────────────────────────┤
│  Manufacturing Capability           │
├─────────────────────────────────────┤
│  CTA                                │
└─────────────────────────────────────┘
```

---

## 区块详情

### 区块 1: Hero

**目标**: 3秒内传达核心定位，建立专业第一印象

#### 内容

| 元素 | 中文 | 英文 |
|------|------|------|
| Badge | 关于我们 → | About Us → |
| Title L1 | 设备 + 管件 | Equipment + Fittings |
| Title L2 | 一体化制造商 | Integrated Manufacturer |
| Subtitle | 自研弯管设备，自产精密管件。从设备到成品，全链路可控。 | Self-developed bending machines, self-produced precision fittings. From equipment to finished products, full chain control. |
| Scroll CTA | 了解更多 | Learn More |

**统计数据**:

| 指标 | 中文 | 英文 |
|------|------|------|
| 1 | 工厂直供 | Factory Direct |
| 2 | 100% 新料 | 100% Virgin Material |
| 3 | 全自动生产 | Fully Automated |
| 4 | 60% 复购率 | 60% Repurchase Rate |

#### 素材

| 图片 | 描述 | 路径 | 状态 |
|------|------|------|------|
| 弯管机 | 自研弯管设备，体现技术实力 | `/images/hero/bending-machine.svg` | ✅ SVG 占位 |
| 扩管机 | 扩管设备 | `/images/hero/expander.svg` | ✅ SVG 占位 |
| 生产线 | 自动化产线 | `/images/hero/production-line.svg` | ✅ SVG 占位 |

> ⚠️ **缺失**: 真实设备照片（当前为 SVG 插画占位）

#### 布局偏好

- **倾向**: 左右分栏（文字左，设备图右）— 突出设备差异化
- **备选**: 居中堆叠（当前实现）
- **视觉重点**: 设备图片要突出，传达"我们造设备"

#### 交互

| 元素 | 行为 |
|------|------|
| Badge | 点击跳转 `/about` |
| Scroll CTA | 平滑滚动到 `#products` |
| 图片轮播 | 自动播放 + 手动切换 |

#### 响应式

| 断点 | 变化 |
|------|------|
| Desktop | 左右分栏可选，图片较大 |
| Mobile | 居中堆叠，图片缩小，统计栏 2x2 网格 |

---

### 区块 2: Products Overview

**目标**: 展示四大产品线，引导进入产品详情

#### 内容

| 产品 | 标题 (中) | 标题 (英) | 特性1 | 特性2 | 特性3 |
|------|-----------|-----------|-------|-------|-------|
| 弯管设备 | 弯管设备 | Bending Machines | 自主设计研发制造 | 半自动/全自动 | 服务国内一线品牌 |
| PVC弯管 | PVC弯管 | PVC Conduits | 符合国际标准 | 喇叭口/双承口 | UL651/AS/NZS/GB |
| 气动物流管 | 气动物流管 | Pneumatic Tubes | 高透明静音防漏 | PVC/PMMA/PETG | 医院/实验室/工业 |
| 定制方案 | 定制方案 | Custom Solutions | 低MOQ快速打样 | 非标规格/OEM | 澳标/美标/国标 |

#### 素材

| 图片 | 描述 | 路径 | 状态 |
|------|------|------|------|
| 弯管机图 | 产品类别封面 | [待定] | ❌ 缺失 |
| PVC弯管图 | 产品类别封面 | [待定] | ❌ 缺失 |
| 气动管图 | 产品类别封面 | [待定] | ❌ 缺失 |
| 定制图 | 产品类别封面 | [待定] | ❌ 缺失 |

#### 布局偏好

- **倾向**: 4列网格（Desktop），2列（Tablet），1列（Mobile）
- **视觉重点**: 每个卡片有清晰的产品图和特性列表

---

### 区块 3: Manufacturing Capability (Overview)

**目标**: 传达制造能力和差异化优势

#### 内容

| 能力 | 标题 (中) | 标题 (英) | 描述 |
|------|-----------|-----------|------|
| 弯管系统 | 弯管系统 | Pipe Bending Systems | 半自动/全自动弯管机，精密控制 |
| 质量认证 | 质量认证 | Quality Certified | ISO 9001:2015 认证 |
| 全球出口 | 全球出口 | Global Export | 服务 100+ 国家 |
| 定制方案 | 定制方案 | Custom Solutions | 从标准到全定制 |
| 标准合规 | 标准合规 | Standards Compliance | ASTM, UL651, AS/NZS, GB |
| 快速交付 | 快速交付 | Fast Turnaround | 快速打样，准时交货 |

**核心能力亮点**:
- 自主模具研发
- 可扩展生产线
- 低 MOQ 支持
- 98% 准时交货
- ISO 9001 认证
- OEM/ODM 服务

#### 布局偏好

- **倾向**: 特性网格 + 亮点标签

---

### 区块 4: CTA

**目标**: 转化引导

#### 内容

| 元素 | 中文 | 英文 |
|------|------|------|
| Message | 联系我们，获取样品或技术支持 | Contact us for samples or technical support |
| Button | 获取报价 | Get Quote |

#### 布局偏好

- **倾向**: 简洁横条，强对比背景

---

## 缺失信息汇总

| 类别 | 缺失项 | 优先级 | 影响 |
|------|--------|--------|------|
| **素材** | 真实设备照片（弯管机/扩管机） | 高 | Hero 视觉冲击力 |
| **素材** | 产品类别封面图 | 高 | Products Overview 区块 |
| **素材** | 工厂/车间照片 | 中 | 可用于 Overview 区块背景 |
| **数据** | 具体复购率数据来源 | 低 | 统计栏可信度 |

---

## Stitch 生成记录（执行后填写）

### 生成历史

| 版本 | 日期 | Prompt 要点 | 结果 | 采用 |
|------|------|-------------|------|------|
| - | - | - | - | - |

### 最终产物

- Prompt: `docs/design/stitch/home-prompt.md`
- 截图: `docs/design/stitch/home-final.png`
- HTML: `docs/design/stitch/home-final.html`

### 代码落地

- 变更文件: `src/components/blocks/hero/hero-split-block.tsx`
- 变更清单: `docs/design/stitch/home-changes.md`
