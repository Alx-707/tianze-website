# Medusa.js 调研报告：B2C Headless E-commerce Backend

**调研日期**: 2026-02-08
**模式**: Standard
**置信度**: 0.88
**搜索轮次**: 12
**Hop 深度**: 2

---

## 执行摘要

Medusa.js 是当前最活跃的开源 headless 电商平台（GitHub 32,000 stars），基于 Node.js/TypeScript 构建。v2.0 采用模块化架构（17 个独立 Commerce Modules），适合中小团队自建电商系统。主要优势：开发者友好、零 GMV 抽成、可深度定制；主要挑战：v2 迁移复杂、大数据集性能问题、文档存在缺失。

---

## 1. 当前版本与架构

### 1.1 版本状态

- **最新版本**: v2.13.1（2026 年 1 月 25 日发布）
- **开发状态**: 活跃维护中，9,653 次提交，144 个 releases
- **GitHub 统计**: 32,000 stars | 4,000 forks | 73 open issues | 70 PRs
- **社区规模**: Discord 14,192 成员，npm 包持续更新

**来源**: [GitHub - medusajs/medusa](https://github.com/medusajs/medusa)

### 1.2 v2.0 架构特性

#### 四层技术栈

Medusa 应用采用四层架构：

1. **API Routes** - 基于 Express.js 的 HTTP 层
2. **Workflows** - 业务逻辑编排
3. **Modules** - 领域资源管理（17 个独立模块）
4. **Data Store** - PostgreSQL 数据库

**来源**: [Medusa Architecture Documentation](https://docs.medusajs.com/learn/introduction/architecture)

#### 模块化系统

**核心概念**:
- 每个模块可独立采用或替换
- 模块间通过 Link Modules 建立关联
- 去除了跨模块的数据库外键依赖（解耦设计）
- 模块可打包为 plugins（包含 API routes、workflows、customizations）

**来源**: [3.3. Modules - Medusa Documentation](https://docs.medusajs.com/learn/fundamentals/modules)

#### 完整模块列表（17+2）

**核心 Commerce Modules**:
1. API Key Module
2. Auth Module
3. Cart Module
4. Currency Module
5. Customer Module
6. Fulfillment Module
7. Inventory Module
8. Order Module
9. Payment Module
10. Pricing Module
11. Product Module
12. Promotion Module
13. Region Module
14. Sales Channel Module
15. Stock Location Module
16. Store Module
17. Tax Module

**额外模块**:
- Translation Module（Beta）
- User Module

**来源**: [Commerce Modules - Medusa Documentation](https://docs.medusajs.com/resources/commerce-modules)

#### 项目结构（Monorepo 友好）

```
src/
├── modules/       # 自定义模块（业务逻辑）
├── workflows/     # 自定义流程编排
├── links/         # 模块间关联定义
└── api/           # 自定义 API routes
```

**来源**: [Modules Directory Structure](https://docs.medusajs.com/learn/fundamentals/modules/modules-directory-structure)

---

## 2. Next.js 集成

### 2.1 官方支持状态

- **Next.js 15**: ✅ 官方支持（带 App Router）
- **Next.js 16**: ⚠️ 文档未明确提及（截至 2026 年 2 月）

[⚠️ 建议实测验证 Next.js 16 兼容性]

### 2.2 快速开始

```bash
npx create-medusa-app@latest --with-nextjs-starter
```

**来源**: [Medusa Next.js Starter Template](https://next.medusajs.com/us)

### 2.3 Starter 特性

- ✅ 预集成 Stripe 和 PayPal 支付
- ✅ 支持 Meilisearch / Algolia 搜索
- ✅ 持久化购物车（存储于数据库）
- ✅ App Router 支持
- ❌ **缺少**: Next.js 数据 revalidation 指导（需自定义方案）

**来源**: [GitHub - medusajs/nextjs-starter-medusa](https://github.com/medusajs/nextjs-starter-medusa)

### 2.4 Storefront API 类型

#### REST API（主要）

- **基础路径**: `/store`
- **JS SDK**: `@medusajs/js-sdk`（支持 Next.js/React/Vue/Angular）
- **认证方式**: JWT token（默认）或 Session-based

**来源**: [Medusa Store API Reference](https://docs.medusajs.com/api/store)

#### GraphQL（社区插件）

- ❌ 官方不提供 GraphQL API
- ✅ 第三方封装可用：[medusajs-graphql](https://github.com/callmekatootie/medusajs-graphql)
- ⚠️ Admin API 支持取决于社区需求

**来源**: [GitHub - callmekatootie/medusajs-graphql](https://github.com/callmekatootie/medusajs-graphql)

---

## 3. 核心电商功能（Out of Box）

### 3.1 产品管理

- ✅ 无限 variants（SKU 级别管理）
- ✅ Variant 独立定价、库存
- ✅ 唯一标识符（SKU/EAN/UPC/Barcode）
- ✅ 跨模块关联（Pricing/Inventory/Sales Channel）

**来源**: [Product and Variant Management](https://deepwiki.com/medusajs/medusa/4.2-product-module)

### 3.2 库存管理

- ✅ Multi-warehouse 库存跟踪
- ✅ 可配置 `manage_inventory` 开关
- ✅ Backorder 支持
- ✅ 下单时自动校验库存
- ✅ 订单生命周期自动更新库存

**来源**: [Inventory Module](https://docs.medusajs.com/v1/modules/multiwarehouse/inventory-module)

### 3.3 购物车 + 结账

**Cart Module 核心功能**:
- ✅ Line items 管理（商品/数量/variant）
- ✅ Shipping methods 关联
- ✅ Promotions/Discounts 自动计算
- ✅ Tax lines 应用
- ✅ 多 Sales Channel/Region/Customer 范围绑定

**Checkout Flow**:
- ✅ 多步骤流程（shipping、payment、tax）
- ✅ 支持第三方集成
- ✅ Express Checkout 模式

**来源**: [Cart Module - Medusa Documentation](https://docs.medusajs.com/resources/commerce-modules/cart)

### 3.4 支付集成

#### 官方支持

| 支付渠道 | 安装包 | 默认集成 |
|----------|--------|----------|
| Stripe | `@medusajs/payment-stripe` | ✅ 预装 |
| PayPal | Stripe Payment Element 封装 | ✅ 支持 |

**Stripe 配置要求**:
```bash
STRIPE_API_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_KEY=pk_...
```

**监听事件**:
- `payment_intent.amount_capturable_updated`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.partially_funded`

**来源**: [Stripe Module Provider - Medusa Documentation](https://docs.medusajs.com/v1/plugins/payment/stripe)

### 3.5 物流 / Fulfillment

**官方 / 社区插件**:
- ✅ **Manual Fulfillment**（内置）
- ✅ **ShipStation** 官方集成
- ✅ **Shippo** 社区插件（[macder/medusa-fulfillment-shippo](https://github.com/macder/medusa-fulfillment-shippo)）

**自定义集成**:
- 可创建 Fulfillment Module Provider 对接任意物流商

**来源**: [Fulfillment Module - Medusa.js](https://medusajs.com/fulfillment-module/)

### 3.6 用户账号 + 认证

#### 认证方式

| 方式 | 适用场景 | Token 存储 |
|------|----------|------------|
| JWT Token（默认） | Jamstack/移动应用 | localStorage |
| Session-based | 传统 SSR webshop | Cookie |
| API Token | Server-to-server | 手动管理 |

**配置切换**:
```typescript
auth.type: 'jwt' | 'session'
```

**SDK 自动处理**:
- Token/Cookie 自动存储
- 请求头自动注入

**来源**: [Authentication in JS SDK - Medusa Documentation](https://docs.medusajs.com/resources/js-sdk/auth/overview)

### 3.7 多货币 + 国际化

#### 多货币

- ✅ 按 currency 和 region 设置价格
- ✅ 一个 region 一个货币，多个 region 可用同一货币
- ✅ Tax-inclusive pricing（含税价显示）
- ✅ 根据用户 region 自动匹配最佳价格

**来源**: [Regions and Currencies](https://docs.medusajs.com/v1/modules/regions-and-currencies/overview)

#### 国际化（i18n）

- ✅ **Admin UI**: 支持 20+ 语言（EN/FR/DE/ES/IT/PL/JP/CN 等）
- ✅ **Storefront**: 需集成第三方 CMS（如 Contentful/Strapi）
- ✅ Translation Module（Beta）：实体 + 字段翻译

**来源**: [Multi-language support](https://medusajs.com/blog/announcing-multi-language-support/)

### 3.8 税费计算

- ✅ 基于 region 的税率配置
- ✅ Tax-inclusive pricing 反算税额
- ✅ 自动应用 tax lines 到 cart line items
- ⚠️ **性能问题**: 200+ 产品时打开税率页面耗时 10-15 分钟（已知问题）

**来源**: [Regions and Currencies | Medusa](https://docs.medusajs.com/v1/modules/regions-and-currencies/overview)

### 3.9 优惠 / 促销

**Promotion Module 功能**:
- ✅ Coupon codes
- ✅ Fixed / Percentage 折扣
- ✅ 应用范围：商品 / 物流 / 整单
- ✅ Buy X Get Y 促销
- ✅ 客户分组专属优惠
- ✅ 使用次数限制
- ✅ Campaign 批量管理（起止时间 + 预算）

**来源**: [Promotion Module - Medusa Documentation](https://docs.medusajs.com/resources/commerce-modules/promotion)

---

## 4. 自建部署要求

### 4.1 基础架构

| 组件 | 要求 | 备注 |
|------|------|------|
| **Node.js** | ≥ 16 | 运行时 |
| **PostgreSQL** | ≥ 9.6 | 主数据库 |
| **Redis** | ≥ 5 | Session + Queue + Cache |
| **RAM** | ≥ 2GB | 生产环境最低要求 |
| **CPU** | ≥ 2 Cores | 推荐（部分平台要求） |

**来源**: [9.3. Medusa Deployment Overview](https://docs.medusajs.com/learn/deployment)

### 4.2 部署模式

#### 双实例架构

```
Instance 1: Server Mode   → API + Admin Dashboard
Instance 2: Worker Mode   → Background Jobs + Subscribers
```

**来源**: [Deployment Overview](https://docs.medusajs.com/v1/deployments)

### 4.3 平台选择

#### Railway（推荐）

- ✅ Managed PostgreSQL + Redis
- ✅ 自动配置 `DATABASE_URL` 和 `REDIS_URL`
- ⚠️ 需删除 Dockerfile（避免冲突）
- 💰 有免费额度（适合开发）

**来源**: [Deploy Your Medusa Backend to Railway](https://docs.medusajs.com/v1/deployments/server/deploying-on-railway)

#### Vercel

- ✅ **Admin**: 可托管（静态前端）
- ⚠️ **Backend**: 不支持（需 Node.js 长连接）
- 📜 免费计划仅限非商业项目

**来源**: [Cloud vs Self-Hosting - Medusa Cloud Documentation](https://docs.medusajs.com/cloud/comparison)

#### 其他选项

- AWS / DigitalOcean / Railway / Coolify
- Docker 部署（需自定义 Dockerfile）

### 4.4 文件存储

**S3 集成**（官方插件）:

```bash
# v2
npm install @medusajs/file-s3
```

**支持的服务**:
- Amazon S3
- MinIO
- DigitalOcean Spaces

**配置项**:
- `s3_url`: `https://<BUCKET>.s3.<REGION>.amazonaws.com`
- `bucket` / `region` / `access_key_id` / `secret_access_key`

**来源**: [S3 File Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/file/s3)

---

## 5. 社区与生态

### 5.1 增长数据

| 指标 | 数值 | 备注 |
|------|------|------|
| GitHub Stars | 32,000 | 月增长 33.4%（2025 数据） |
| Discord 成员 | 14,192 | 从 1,300（2022）增至 14K+ |
| 语言支持 | 20+ | Admin UI 多语言 |
| Plugin 生态 | 活跃 | 社区贡献持续增长 |

**里程碑**:
- 10K stars 用时 9 个月（2022）
- 15K stars 用时 1 年（2023）
- 当前 32K stars（"GitHub 最受欢迎电商项目"）

**来源**: [GitHub - medusajs/medusa](https://github.com/medusajs/medusa)

### 5.2 生态亮点

**官方资源**:
- B2B Starter（企业级模板）
- 丰富的插件库（Analytics/PDF/Custom Attributes）

**社区贡献**:
- Multi-vendor Marketplace 开源模板（140 stars）
- Awesome Medusa 资源合集（583 stars）

**来源**: [Medusa Community update](https://medusajs.com/blog/community-sep25/)

---

## 6. 竞品对比

### 6.1 技术栈对比

| 平台 | 语言 | 适合团队 | 学习曲线 |
|------|------|----------|----------|
| **Medusa** | Node.js/TypeScript | JS 团队 | 较低 |
| **Saleor** | Python | Python 团队 | 中等 |
| **Vendure** | TypeScript (NestJS) | TS 纯净主义者 | 中等 |
| **Commerce.js** | API-first | 任意前端 | 低 |

**来源**: [Who Wins Where? Saleor vs MedusaJS vs Vendure](https://www.linearloop.io/blog/medusa-js-vs-saleor-vs-vendure)

### 6.2 中小团队推荐

#### Medusa 优势

- ✅ 最轻量级（Node.js）
- ✅ 零 GMV 抽成（$29/月起）
- ✅ 最强开发者社区（32K stars > Saleor 22K）
- ✅ Admin UI 体验最佳

#### Vendure 优势

- ✅ TypeScript end-to-end
- ✅ 开箱即用功能多（适合快速上线）
- ❌ Admin UI 和 Storefront 较弱

#### Saleor 定位

- 面向中大型企业（Mid-market）
- $159/月起 + GMV 抽成
- Python 技术栈

**来源**: [Saleor vs Medusa: Comparing the Leading Open-Source Commerce Engines](https://www.netguru.com/blog/saleor-vs-medusa)

### 6.3 关键结论

**3-5 人小团队首选**: **Medusa**（JS 生态 + 低成本 + 灵活性）

---

## 7. 已知痛点与陷阱

### 7.1 v1 → v2 迁移

#### 核心挑战

- ❌ **完全重写**: 架构和 API 全面 breaking
- ⚠️ 升级指南延迟 2 个月（v2.0 发布后）
- ⚠️ 数据迁移复杂（orders/customers 保留需自行处理）

**来源**: [Guide - Migration from v1 to v2x](https://github.com/medusajs/medusa/discussions/9196)

#### 近期问题（2025 年）

- 插件 migrations 生成错误
- `path argument must be of type string` 运行时错误
- Zod 依赖变更导致 breaking（虽大部分项目不受影响）

**来源**: [Bug: Can't generate migrations in plugin](https://github.com/medusajs/medusa/issues/11425)

### 7.2 性能瓶颈

#### 大数据集问题

**实测案例**（400+ 产品）:
- 产品搜索变慢
- 20+ variants 的产品编辑价格时明显卡顿
- Price lists + Tax regions 应用延迟
- **严重问题**: 200+ 产品时税率页面加载 10-15 分钟

**根因**: 微服务架构带来的复杂性

**来源**: [Performance Bottlenecks with Large Product Data](https://github.com/medusajs/medusa/issues/12287)

#### 缓存策略缺失

- ❌ 官方未提供 Next.js revalidation 指导
- 需开发者自行实现 `no-store` 或自定义方案

**来源**: [Proper data revalidation in Medusa with Next.js](https://github.com/medusajs/medusa/issues/11679)

### 7.3 文档质量

**问题**:
- ✅ 文档存在但不够全面
- ⚠️ 部分场景需依赖社区论坛
- ⚠️ 对新手缺乏清晰指引
- ❌ 无集成测试方案

**来源**: [Disadvantages of Medusa.js](https://kvytechnology.com/blog/software/disadvantages-of-medusa-js/)

### 7.4 技术门槛

**限制**:
- ❌ 非技术团队不适用（不像 Shopify 自动优化）
- ⚠️ 需深入理解架构才能用好
- ⚠️ 性能优化依赖开发者手动调优

---

## 8. 信息缺口与未验证事项

### 8.1 待验证（建议实测）

1. ✅ **Next.js 16 兼容性**（文档未明确）
2. ✅ **400+ 产品性能**（是否有官方优化方案）
3. ✅ **中文本地化完整性**（Admin + Storefront）
4. ✅ **实际部署成本**（Railway/AWS 真实账单）

### 8.2 缺失信息

- ❌ npm 包周下载量（npmjs.com 403 错误）
- ⚠️ v2.13+ 版本完整 changelog
- ⚠️ Production 性能 benchmark（官方未提供）

---

## 9. 来源分级汇总

### Tier 1 - 官方权威

- [Medusa Documentation](https://docs.medusajs.com/)
- [GitHub - medusajs/medusa](https://github.com/medusajs/medusa)
- [Medusa v2.0 Release](https://medusajs.com/blog/v2-release/)
- [Medusa Store API Reference](https://docs.medusajs.com/api/store)
- [Medusa Changelog](https://medusajs.com/changelog/)

### Tier 2 - 官方集成 / 指南

- [Next.js Starter Storefront](https://docs.medusajs.com/resources/nextjs-starter)
- [Stripe Module Provider](https://docs.medusajs.com/v1/plugins/payment/stripe)
- [S3 File Module Provider](https://docs.medusajs.com/resources/infrastructure-modules/file/s3)
- [Deployment Overview](https://docs.medusajs.com/learn/deployment)
- [Commerce Modules Documentation](https://docs.medusajs.com/resources/commerce-modules)

### Tier 3 - 社区 / 第三方分析

- [Rigby Blog - Exploring Medusa 2.0](https://www.rigbyjs.com/blog/medusa-modules)
- [LinearLoop - Medusa vs Saleor vs Vendure](https://www.linearloop.io/blog/medusa-js-vs-saleor-vs-vendure)
- [Netguru - Saleor vs Medusa](https://www.netguru.com/blog/saleor-vs-medusa)
- [KVY Technology - Disadvantages of Medusa.js](https://kvytechnology.com/blog/software/disadvantages-of-medusa-js/)

### Tier 4 - GitHub Issues（已知问题）

- [Performance Bottlenecks - Issue #12287](https://github.com/medusajs/medusa/issues/12287)
- [v1→v2 Migration Discussion #9196](https://github.com/medusajs/medusa/discussions/9196)
- [Plugin Migration Issue #13046](https://github.com/medusajs/medusa/issues/13046)

---

## 附录：技术决策参考

### 适合 Medusa 的场景

✅ 中小团队（3-5 人）+ JS/TS 技术栈
✅ 需要深度定制（产品逻辑 / UI / 流程）
✅ 预算有限（零 GMV 抽成）
✅ 愿意投入开发资源

### 不适合的场景

❌ 非技术团队（缺乏开发能力）
❌ 需要开箱即用（不想定制）
❌ 超大数据集（500+ 产品需评估性能）
❌ Python 技术栈（推荐 Saleor）

---

**报告结束**
