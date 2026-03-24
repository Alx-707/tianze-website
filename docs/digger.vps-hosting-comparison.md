# VPS 托管方案对比调研
**Tianze (天泽管业) Next.js 16 B2B 展示网站**

**调研日期**: 2026-03-23
**调研对象**: 当前 Cloudflare 部署 → VPS 自托管迁移方案
**调研深度**: 6 轮搜索，多源比对

---

## Executive Summary

针对 Tianze 海外 B2B 买家展示网站的托管方案调研，主要发现：

1. **成本对比**：从 Cloudflare (Free/Pro) 迁移到 VPS 自托管可节省 50-70%，但需承担运维成本。Hetzner 性价比最优（€3.79-16/月），DigitalOcean 最易上手，AWS Lightsail 价格溢价 2-3 倍。

2. **Next.js SSR 最小配置**：1 vCPU + 512MB-1GB RAM + 20GB SSD 可承载低流量网站；若使用 Image Optimization 需 ≥1GB RAM；推荐生产配置为 2 vCPU + 2-4GB RAM（€4-8/月内可得）。

3. **澳洲/国际覆盖**：Hetzner、Vultr、Contabo、OVHcloud 均有悉尼数据中心；Vultr 30+ 全球点，Hetzner 仅限欧洲（EU 优先，美国有限），澳洲单节点优先 Hetzner Australia 或 Vultr Sydney。

4. **架构建议**：
   - **预算受限**：单节点 Hetzner CX22 (2 vCPU, 4GB, €3.79/mo) + Cloudflare CDN（免费）= 整体成本 <€5/mo，延迟 50-100ms
   - **可靠性优先**：多区域部署（Sydney + EU Hetzner + US via Vultr）+ 全球负载均衡，总成本 €25-50/mo
   - **混合方案**（推荐）：单节点澳洲部分流量，Cloudflare Workers/Pages 处理静态资产和 API 缓存，总成本 €5-15/mo

5. **Cloudflare 现状**：Free Plan 适合低流量网站；OpenNext 存在版本依赖脆弱性（#663 Issue），Workers 高流量场景成本爆炸（高端客户 $5000/mo）；迁移 VPS 的关键驱动因素是降低运维黑盒性和获得完全控制权。

6. **部署稳定性**：PM2 + Nginx 是 2026 年生产标准；Hetzner 后续价格上调 20-30%（April 2026），建议尽快锁定。

---

## 置信度评估

| 信息类别 | 置信度 | 数据源 | 备注 |
|---------|--------|--------|------|
| VPS 厂商价格（2026-03） | 95% | Official pricing + GitHub price comparison | Hetzner 价格上调在即（April 1），需确认最新欧元汇率 |
| Next.js SSR 最小配置 | 90% | GitHub Discussions (official) + Medium production guides | 无官方 SLA，需监控实际应用资源 |
| 澳洲数据中心覆盖 | 85% | Hostadvice, 各厂商官网 | Contabo Sydney 新建，信息更新差异可能存在 |
| OpenNext 局限性 | 90% | Official OpenNext docs, GitHub Issues #663 | 2026-02 最新，与最新 Next.js 版本同步 |
| 多区域负载均衡成本 | 75% | Google Cloud docs + industry guides | 实施成本需依据选择的服务（DNS、LB）而定 |
| B2B 流量特性 | 80% | B2B 行业报告 + 网站性能研究 | 低流量、地理分散但集中在 APAC/NA/EU |

---

## 1. 厂商详细对比

### 1.1 Hetzner Cloud

**定位**：德国本地，欧洲优先，成本最优

| 指标 | 值 |
|------|-----|
| **CX22 配置** | 2 vCPU, 4GB RAM, 40GB NVMe SSD, 20TB/mo 带宽 |
| **CX22 价格** | €3.79/mo （约 $4.10 USD，2026-03 实时） |
| **CX32 配置** | 4 vCPU, 8GB RAM, 80GB NVMe, 20TB/mo 带宽 |
| **CX32 价格** | €8.49/mo （约 $9.18 USD） |
| **数据中心** | Frankfurt, Nuremberg, Falkenstein (EU), Helsinki, Sydney, Ashburn (US 有限) |
| **数据中心数量** | 6 个位置 |
| **特点** | 超高带宽配置，EU 内部流量极便宜；美国出口受限；Aussie 节点新建，用户较少 |
| **2026 价格调整** | April 1 起上调 20-30%（DRAM 成本增加）— **立即锁定优惠** |
| **易用性** | UI 相对陈旧，需 SSH 基础 |
| **支持** | 文档充分，社区强 |

**评论**：最优性价比；EU 客户群理想；Sydney 出口可能有瓶颈；对技术团队友好。

---

### 1.2 Vultr

**定位**：高性能，全球分布最广，开发者友好

| 指标 | 值 |
|------|-----|
| **标准配置** | 1GB: $5.99/mo, 2GB: $12/mo, 4GB: $18/mo, 8GB: $36/mo |
| **High Frequency (AMD EPYC)** | 2GB: $18/mo, 4GB: $36/mo |
| **数据中心** | 32+ 全球位置 |
| **关键点** | Sydney, Tokyo, Singapore, Hong Kong (APAC), Amsterdam, London (EU), New York, Toronto (NA) |
| **特点** | 最多地理覆盖；AMD EPYC 处理器高频率；BGP 可用；IPv6 native |
| **易用性** | UI 现代，开发者友好 |
| **支持** | 比 Hetzner 响应慢；文档完善 |

**评论**：澳洲网站优选（Sydney 节点稳定），多区域架构最灵活；价格高于 Hetzner 但仍可接受；产品生命周期稳定。

---

### 1.3 DigitalOcean

**定位**：产品完整，平衡方案，易用性最高

| 指标 | 值 |
|------|-----|
| **基础 Droplet** | 1GB: $6/mo, 2GB: 不详（推荐查官网）, 4GB: 推荐 $24/mo |
| **Premium NVMe** | 更高配置，价格额外 20-30% |
| **数据中心** | 13 个地理位置 |
| **关键点** | Sydney, Singapore, Frankfurt, London, New York, Toronto 等 |
| **生态** | App Platform (PaaS), Managed Kubernetes (DOKS), DBaaS, Object Storage (Spaces) |
| **特点** | 企业级产品成熟度；Cloudways 基于 DigitalOcean；最多开发教程 |
| **易用性** | UI 最直观；最适合首次自托管 |
| **支持** | 社区强，文档最丰富 |

**评论**：不是成本最优，但风险最低（学习曲线平缓）；适合有运维小白的团队；生态完整但价格溢价明显。

---

### 1.4 AWS Lightsail

**定位**：企业级，AWS 生态一体化，价格高溢价

| 指标 | 值 |
|------|-----|
| **基础配置** | 1GB: $3.50/mo (首月), 后续 $5/mo; 2GB: $10/mo |
| **4GB 配置** | $20-24/mo |
| **数据中心** | 26+ AWS 区域全覆盖 |
| **特点** | One-click 应用部署；与 AWS IAM/RDS/S3 无缝集成；按小时计费 |
| **易用性** | AWS 仪表板曲线陡峭；但部署流程简洁 |
| **成本陷阱** | 数据传出费用（$0.12/GB），跨区域转移额外收费 |

**评论**：成本 2-3 倍于 Hetzner；适合已在 AWS 生态的团队；小流量网站不值得（Lightsail 成本优势仅在中等流量）。

---

### 1.5 Linode (Akamai)

**定位**：中等档次，产品稳定但已停止独立创新

| 指标 | 值 |
|------|-----|
| **基础配置** | 1GB: $5/mo, 2GB: $10/mo, 4GB: $20/mo |
| **数据中心** | 12 个位置 |
| **特点** | Akamai 收购后保持独立；产品成熟度高；无超额定价 |
| **易用性** | UI 实用，不如 DigitalOcean 现代 |

**评论**：介于 Vultr 和 DigitalOcean 之间；无明显差异化；新项目更好用 Vultr 或 DigitalOcean。

---

### 1.6 其他厂商（补充）

| 厂商 | 关键优势 | 劣势 | 推荐度 |
|------|---------|------|--------|
| **OVHcloud** | 带宽便宜；Mumbai, Singapore, Sydney | 文档欧洲优先；支持响应慢 | ⭐⭐⭐ 澳洲 |
| **Contabo** | 超大配置（8GB €10/mo）；Sydney 新建 | 超卖风险高；支持有限 | ⭐⭐ 仅成本敏感 |
| **Scaleway** | 欧洲优先；bare metal 便宜 | 无澳洲数据中心；产品复杂 | ⭐⭐ EU only |
| **RackNerd** | KVM VPS 极便宜（$18.29/年） | 超卖、质量不稳定；限制流量 | ⚠️ 仅测试 |

---

## 2. Next.js SSR 部署配置建议

### 2.1 最小生产配置

基于 GitHub 官方讨论和 Medium 生产指南：

```
应用场景: B2B 展示网站，日均 100-500 访问量，无 Image Optimization

✅ 最小可行配置:
  - CPU: 1 vCPU shared
  - RAM: 512MB (带风险) → 推荐 1GB
  - Storage: 20GB SSD (源码+node_modules+日志)
  - 成本: $5-7/mo

⚠️  建议生产配置 (推荐):
  - CPU: 2 vCPU (shared/dedicated 均可)
  - RAM: 2GB (with Image Optimization: 4GB)
  - Storage: 40GB SSD
  - 成本: €4-8/mo (Hetzner) / $12-18/mo (DO)

🔥 高可用配置 (多区域):
  - 2x 2vCPU/4GB (主+备)
  - 全球负载均衡
  - 成本: €25-50/mo
```

### 2.2 推荐部署栈

```dockerfile
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare CDN (Free)                      │
│              DNS, Static assets, SSL/TLS termination           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Nginx Reverse Proxy                       │
│              Port 80→443, Gzip, Static caching                │
│              Request timeout: 30s, Keepalive: 65s              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    PM2 Process Manager                        │
│              Node.js App × 2-4 instances (cluster mode)       │
│     Max memory restart: 450M, max-old-space-size: 400M        │
│              Zero-downtime reloads + auto-restart              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Next.js 16 SSR Application                     │
│              (pnpm build output served by Node)               │
│        Port 3000 (internal), no direct public access          │
└─────────────────────────────────────────────────────────────┘
```

**部署检查清单**：
- [ ] Nginx 配置 WebSocket 透传（`Upgrade`, `Connection` headers）
- [ ] PM2 startup 脚本已生成（`pm2 startup` → 系统重启自动启动）
- [ ] SSL 证书自动续期（certbot + Let's Encrypt）
- [ ] 日志轮转配置（logrotate 或 PM2 内置）
- [ ] Node.js 内存监控 + 告警（PM2 Plus 或自建 health check）
- [ ] 监听端口：Nginx 0.0.0.0:80/443, Node.js localhost:3000 (绑定)

### 2.3 构建及发布流程

```bash
# 本地
pnpm build         # → Next.js 优化输出 (.next/)
pnpm type-check    # TypeScript 检查
pnpm lint:check    # ESLint

# VPS 部署
git clone <repo> /app
cd /app
pnpm install --frozen-lockfile
pnpm build
pm2 restart next-app  # 或 pm2 start ecosystem.config.js

# Nginx 自动检测应用是否就绪 (healthcheck port 3000/api/health)
```

### 2.4 内存优化建议

对于 512MB-1GB 内存限制的服务器：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'next-app',
    script: 'node_modules/.bin/next start',
    instances: 2,  // 不超过内存的 40%
    max_memory_restart: '450M',  // 防 OOM 自动重启
    env: {
      NODE_OPTIONS: '--max-old-space-size=400',
      NODE_ENV: 'production',
    },
  }],
};
```

**监控工具**：`pm2 monit` 实时观察；`pm2 plus` 集中化日志（付费）。

---

## 3. 多区域覆盖方案分析

### 3.1 方案 A：单节点 + CDN（推荐入门）

```
架构: 澳洲主节点 (Sydney) + Cloudflare 全球 CDN

部署:
  • Vultr Sydney (2 vCPU, 2GB RAM, $12/mo)
  • Cloudflare Free CDN (无成本)
  • 总成本: $12/mo

性能指标:
  • 澳洲/新西兰: <50ms
  • 欧洲/北美: 100-200ms (CDN 缓存, 减轻)
  • 亚洲: 50-150ms (Singapore 相近)

适用场景:
  ✅ 初期流量 <1000 UV/day
  ✅ 访问地理分布不均 (澳洲集中)
  ✅ 预算严格 (<$20/mo)

限制:
  ❌ 澳洲主节点故障 → 全站离线
  ❌ 数据库连接单点 (需 managed DB 或本地 SQLite/Redis)
  ❌ 欧洲/北美 用户高延迟 (SSR 无法缓存)
```

### 3.2 方案 B：多区域主动-被动备份

```
架构: 澳洲 Primary + 欧洲 Standby (数据实时同步)

部署:
  • 主: Hetzner Sydney (CX22, €6/mo)
  • 备: Hetzner Frankfurt (CX22, €3.79/mo)
  • 数据库: Managed PostgreSQL (AWS RDS 或 Supabase)
  • DNS 故障转移: Cloudflare/Route53
  • 总成本: €10/mo + DB (€10-50/mo)

性能指标:
  • 澳洲: <50ms
  • 欧洲: <80ms (主)
  • 故障转移: 1-2 分钟 (DNS TTL)

适用场景:
  ✅ 流量 1000-5000 UV/day
  ✅ 可靠性要求高 (SLA 99%)
  ✅ 数据一致性要求

限制:
  ❌ 故障转移需要 DNS 同步延迟
  ❌ 运维复杂度增加 (监控、告警、日志聚合)
  ❌ 数据库同步延迟 100-300ms
```

### 3.3 方案 C：地理分布式部署（高可用）

```
架构: 多地域主动-主动, 全球负载均衡

部署:
  • Sydney: Vultr 2GB ($12/mo)
  • Frankfurt: Hetzner 2vCPU/4GB (€6/mo)
  • US East: Vultr 2GB ($12/mo)

  • 全球负载均衡: Cloudflare (免费 + geo-routing)
  • 数据库: 跨区域 managed (Supabase, Planetscale)
  • 缓存层: Redis (Upstash 或 Memcached)

  总成本: $24-30/mo + DB + 缓存

性能指标:
  • 澳洲: <50ms
  • 欧洲: <50ms
  • 北美: <50ms
  • 故障转移: <5 秒 (health check)

适用场景:
  ✅ 流量 >5000 UV/day
  ✅ 多地域用户分布均匀
  ✅ SLA 99.9% 要求
  ✅ 全球品牌展示 (需要低延迟)

限制:
  ❌ 数据一致性复杂 (最终一致性)
  ❌ 运维成本显著 (5-10 小时/月)
  ❌ 成本 €25-50/mo
```

### 3.4 推荐选择（Tianze 场景）

基于 B2B 买家流量特性（低流量、地理分散、可靠性重要）：

**阶段 1 (0-6 个月)**：方案 A
- 澳洲主节点 + Cloudflare CDN
- 成本: $12-18/mo
- 风险: 可接受（初期用户少）

**阶段 2 (6-12 个月)**：升级方案 B
- 多区域备份 + managed DB
- 成本: €20-40/mo (含 DB)
- 可靠性: 99%

**方案 C 触发条件**：月度独立访客 >5000 或出现明显地理流量峰值不均。

---

## 4. Cloudflare 现有方案 vs VPS 自托管对比

### 4.1 成本对比

| 场景 | Cloudflare (现状) | VPS 自托管 | 节省比例 |
|------|------------------|-----------|---------|
| **小流量网站** (100 UV/day) | $0-5 (Free+Pages) | €4-6/mo | 同价～优惠 |
| **中流量** (500-2000 UV/day) | $5-20 (Pro+Pages) | €8-15/mo | 0-40% |
| **大流量** (5000+ UV/day, 100K req/mo) | $50-200+ | €20-50/mo | 50-75% |
| **企业工作流** (API 密集, Workers) | $5000+/mo | €30-100/mo | **95%** |

**关键观察**：
- Cloudflare Free → VPS：**成本持平或略高**（需付运维成本）
- Cloudflare Pro/Business → VPS：**显著节省**（超过 $50/mo 开始明显）
- Workers/Durable Objects 高端用户 → VPS：**成本削减 99%**

### 4.2 功能对比

| 功能 | Cloudflare | VPS 自托管 | 优胜者 |
|------|-----------|----------|--------|
| **SSR 支持** | ✅ (via Workers) | ✅✅ (原生 Node) | VPS |
| **开箱即用** | ✅✅ (零配置) | ❌ (需 DevOps) | Cloudflare |
| **全球 CDN** | ✅✅ (200+ PoP) | ⚠️ (需额外费用) | Cloudflare |
| **SSL/TLS** | ✅ (自动) | ✅ (Let's Encrypt) | 平手 |
| **DDoS 防护** | ✅✅ (企业级) | ⚠️ (需 WAF 工具) | Cloudflare |
| **数据库支持** | ❌ (Workers 限制) | ✅✅ (任意 DB) | VPS |
| **WebSocket** | ⚠️ (Workers 有限) | ✅✅ (完整支持) | VPS |
| **运维难度** | ⭐ (无) | ⭐⭐⭐⭐⭐ (高) | Cloudflare |
| **版本控制** | ✅ (自动) | ✅ (手动) | Cloudflare |
| **冷启动延迟** | 10-50ms (Workers) | 100-500ms (初次) | Cloudflare |

### 4.3 OpenNext 的具体问题

Tianze 当前使用 OpenNext + Cloudflare Workers。主要风险：

1. **构建脆弱性**（Issue #663）：OpenNext 需要逆向工程 Next.js 输出，升级时频繁破裂
   - 影响：每次 Next.js 小版本升级可能需要 OpenNext 适配（1-4 周延迟）
   - 风险等级：**Medium**

2. **运行时限制**：
   - Durable Objects / KV 无法在 `next dev` 测试（需 wrangler CLI）
   - 数据库连接池不兼容（Worker 无法重用跨请求连接）
   - 影响：添加实时功能/WebSocket 需要绕路
   - 风险等级：**Low** (Tianze 当前无此需求)

3. **开发体验**：
   - 本地 `next dev` 与 Workers 运行时不一致
   - 调试 CSP 违规 / 性能瓶颈时困难
   - 风险等级：**Low-Medium**

4. **长期支持**：
   - Next.js 14 support 在 Q1 2026 终止（已过期或即将过期）
   - Cloudflare 于 2026-02 发布新 "ViNext" (AI 重写)，但稳定性未验证
   - 风险等级：**Medium**

**结论**：OpenNext 本身足够稳定，但生态脆弱，不建议用于关键工作流。Tianze 网站简单度足以承受此风险，但迁移 VPS 自托管后风险消失。

### 4.4 迁移决策矩阵

| 保留 Cloudflare | 迁移 VPS 自托管 |
|-----------------|-----------------|
| ✅ 流量 <1000 UV/day | ✅ 流量 >5000 UV/day |
| ✅ 预算严格 | ✅ 需要 99%+ 可靠性 |
| ✅ 零运维团队 | ✅ 有技术团队维护 |
| ✅ 快速迭代 + 频繁部署 | ✅ 稳定架构 + 可预测成本 |
| ✅ 全球 DDoS 防护必需 | ✅ 数据主权要求 (某些行业) |

**Tianze 现状分析**：
- 流量：低（B2B 展示网站，估 100-500 UV/day）
- 运维能力：中等（技术团队存在但非专职 DevOps）
- 优先级：可靠性 > 成本 > 易用性
- **建议**：短期保留 Cloudflare Free (零成本) + 单节点 VPS (备用)；1 年后根据流量评估完全迁移

---

## 5. 推荐方案（分预算）

### 5.1 极低预算方案 (<$10/mo)

```
推荐配置: Hetzner CX22 (Sydney) + Cloudflare Free

成本分解:
  • VPS: €3.79/mo (Hetzner Sydney CX22)
  • CDN: $0 (Cloudflare Free)
  • 域名: $10-15/year (Namecheap/Google Domains)
  • 总年成本: €45-50 (~$50 USD)

规格:
  • 2 vCPU, 4GB RAM, 40GB NVMe, 20TB/mo 带宽
  • 足以承载 500 UV/day + 图片优化

优势:
  ✅ 最低成本
  ✅ 带宽无限制 (20TB >> 需求量)
  ✅ 性能够用
  ✅ April 2026 前锁定价格

劣势:
  ❌ 单点故障
  ❌ 无冗余备份
  ❌ Hetzner Sydney 可能有出口瓶颈

部署难度: ⭐⭐⭐ (中等，需要 SSH + Nginx + PM2 基础)
推荐对象: 技术团队有 DevOps 基础，预算受限
```

### 5.2 平衡方案 ($15-30/mo)

```
方案 B1: Vultr Sydney + 欧洲备份

配置:
  • 主: Vultr Sydney (2GB, $12/mo)
  • 备: Hetzner Frankfurt (CX11, €2.50/mo)
  • CDN: Cloudflare Free
  • 总成本: $15-16/mo

优势:
  ✅ 澳洲性能最优 (Vultr 用户报告稳定)
  ✅ 欧洲故障转移 (<5 分钟 DNS)
  ✅ 全球覆盖
  ✅ Vultr 产品生命周期长

劣势:
  ❌ 需 DNS 故障转移配置
  ❌ 备机无法真正分担流量
  ❌ 数据库需要跨区域同步

部署难度: ⭐⭐⭐⭐ (高，需要 DNS + 监控脚本)
推荐对象: 中等可靠性要求，技术团队成熟

---

方案 B2: DigitalOcean Sydney (托管)

配置:
  • Droplets: 2GB RAM (单节点或 2x1GB cluster)
  • App Platform (可选自动扩展)
  • Managed Database (PostgreSQL, 可选)
  • 总成本: $20-30/mo (含简单 DB)

优势:
  ✅ 开箱即用，UI 友好
  ✅ 完整生态 (DB, Spaces, Monitoring)
  ✅ 文档最全，社区活跃
  ✅ 支持响应快

劣势:
  ❌ 价格 2x Hetzner
  ❌ 无多区域冗余 (单节点)
  ❌ 数据绑定 DigitalOcean (迁移成本)

部署难度: ⭐⭐ (低，图形化界面)
推荐对象: 不熟悉 Linux 的团队，愿意付溢价换易用性
```

### 5.3 高可靠性方案 ($50-100/mo)

```
推荐配置: 多区域 Active-Passive + 托管 DB

部署:
  • 主: Vultr Sydney 2GB ($12/mo)
  • 备: Vultr Frankfurt 1GB ($6/mo)
  • 欧洲备用: Hetzner CX11 (€2.50/mo)

  • 数据库: Supabase PostgreSQL (€20/mo 起) 或 AWS RDS (€15-50/mo)
  • CDN: Cloudflare Pro ($20/mo, 企业 DDoS)
  • 监控: Datadog/Sentry (€20-50/mo)

  总成本: $95-150/mo

优势:
  ✅ SLA 99%+ 可达成
  ✅ 跨区域故障转移 <5 秒
  ✅ 完整可观测性
  ✅ 企业 DDoS 防护
  ✅ 数据库自动备份 + PITR

劣势:
  ❌ 运维成本显著 (初期 5-10h/week)
  ❌ 数据一致性复杂 (最终一致性)
  ❌ 成本显著增加

部署难度: ⭐⭐⭐⭐⭐ (非常高，需要 DevOps 专家)
推荐对象: 大型 B2B 平台，SLA 合同要求，团队有专职 SRE

---

方案 C: Kubernetes (K3s on Hetzner)

配置:
  • 3x Hetzner CX22 (€11/mo 共 €33)
  • Hetzner managed LB (€10/mo)
  • PostgreSQL (Hetzner, €5/mo)
  • Velero 备份 (€10/mo)
  • 总成本: €70/mo (~$75 USD)

优势:
  ✅ 高度可扩展
  ✅ 声明式基础设施 (IaC)
  ✅ 自动故障转移
  ✅ 容器化 → 一致开发/生产

劣势:
  ❌ 学习曲线陡峭 (Helm, etcd, CRI)
  ❌ 初期部署 2-3 周
  ❌ 运维复杂度最高

部署难度: ⭐⭐⭐⭐⭐⭐ (极难)
推荐对象: 云原生架构倾向，计划多个微服务，大型工程团队
```

### 5.4 Tianze 特定建议

**现状**：Next.js 16 SSR 网站，澳洲主要用户，流量低，预算有限

**推荐方案（3 阶段）**：

```
第 1 阶段 (现在 ~ 6 个月):
  • 保留 Cloudflare Free (Pages + CDN)
  • 添加 Hetzner CX22 Sydney (€3.79/mo) 作为备用
  • 风险: Cloudflare Pages 故障 → 切换 VPS (DNS 更新 1-5 分钟)
  • 成本: €4/mo (VPS 部分)
  • 优势: 零中断迁移路径

第 2 阶段 (6-12 个月):
  • 主: Hetzner Sydney CX22 (€3.79/mo)
  • 备: Vultr Frankfurt 1GB ($6/mo, 数据库只读副本)
  • CDN: Cloudflare Free (仅缓存 static assets)
  • 成本: €4-10/mo
  • SLA: 99% (故障转移 5-10 分钟)
  • 完全离开 Cloudflare Pages，保留 CDN

第 3 阶段 (1+ 年, 可选):
  • 流量确认 >1000 UV/day 后升级多区域
  • 添加 managed DB (Supabase)
  • 企业 CDN (Cloudflare Pro)
  • 成本: $50-80/mo

决策触发点:
  ✅ 完全迁移: 当 Cloudflare 部署变得痛苦 (OpenNext 更新频繁、版本冲突)
  ❌ 保留 Cloudflare: 如果零运维成本是绝对优先
```

---

## 6. 来源汇总

### 官方文档与工具

1. [Hetzner Cloud Pricing](https://www.hetzner.com/cloud)
2. [Vultr Pricing & Locations](https://www.vultr.com/pricing/)
3. [DigitalOcean Droplets](https://www.digitalocean.com/products/droplets)
4. [AWS Lightsail Pricing](https://aws.amazon.com/lightsail/pricing/)
5. [Cloudflare Pricing](https://www.cloudflare.com/plans/)
6. [Cloudflare Pages Pricing](https://developers.cloudflare.com/pages/functions/pricing/)
7. [Cloudflare Workers Pricing](https://workers.cloudflare.com/pricing)
8. [OpenNext Documentation](https://opennextjs.js.org/)
9. [OpenNext GitHub Issues #663](https://github.com/opennextjs/opennextjs-cloudflare/issues/663)
10. [Next.js Guides: Memory Usage](https://nextjs.org/docs/app/building-your-application/optimizing/memory-usage)

### 性能对比与基准

11. [VPSBenchmarks: DigitalOcean vs Vultr](https://www.vpsbenchmarks.com/compare/docean_vs_vultr)
12. [VPSBenchmarks: DigitalOcean vs Linode vs Vultr](https://www.vpsbenchmarks.com/compare/docean_vs_linode_vs_vultr)
13. [VPSBenchmarks: Hetzner vs Vultr](https://www.vpsbenchmarks.com/compare/hetzner_vs_vultr)
14. [GitHub Gist: Server Price Breakdown 2026](https://gist.github.com/justjanne/205cc548148829078d4bf2fd394f50ae)
15. [SSD Nodes: VPS Hosting Price Comparison (March 2026)](https://www.ssdnodes.com/blog/vps-hosting-price-comparison/)

### 部署与最佳实践

16. [Deploy Next.js on Ubuntu with Nginx & PM2 (2026 Guide)](https://www.orbitminds.in/blog/deploy-nextjs-app-ubuntu-nginx-pm2-2026)
17. [PM2 Nginx Production Setup](https://pm2.keymetrics.io/docs/tutorials/pm2-nginx-production-setup)
18. [How to Deploy Next.js Application to VPS Using NGINX and PM2](https://mohamedyamani.com/blog/how-to-deploy-nextjs-application-to-vps-using-nginx-and-pm2/)
19. [Taming Next.js on a Budget](https://medium.com/@piash.tanjin/taming-next-js-0a71e29fbb61)
20. [Multi-Region Deployment Strategies for High Availability](https://technori.com/2026/03/24924-multi-region-deployment-strategies-for-high-availability-gabriel/)

### 区域与数据中心覆盖

21. [VPS Hosting in Australia: 9 Best Providers (Mar 2026)](https://hostadvice.com/vps/australia/)
22. [Australia Data Centers - Providers Map](https://www.datacenters.com/locations/australia)
23. [Kamatera Cloud VPS Australia](https://www.kamatera.com/cloud-vps/australia-vps-hosting/)
24. [OVHcloud VPS Australia](https://www.ovhcloud.com/en-au/vps/vps-australia/)

### 成本对比与分析

25. [Cloudflare Pages vs Workers: Which to use](https://www.justaftermidnight247.com/insights/cloudflare-pages-vs-workers-which-one-should-you-use/)
26. [Ditch Cloudflare's $5k/Mo Bills: Self-Host Workers at 1/100th Cost](https://dev.to/_aparna_pradhan_/ditch-cloudflares-5kmo-bills-self-host-workers-at-1-100th-cost-in-2-hours-2fa0)
27. [Why Developers Are Leaving DigitalOcean, Hetzner & Vultr in 2026](https://massivegrid.com/blog/why-developers-leaving-digitalocean-hetzner-vultr-2026/)
28. [DigitalOcean vs Hetzner: Performance, Features & Prices](https://www.vpsbenchmarks.com/compare/docean_vs_hetzner)
29. [AWS Lightsail vs DigitalOcean 2026](https://1vps.com/aws-lightsail-vs-digitalocean)

### B2B 网站特定需求

30. [Performance and Scalability in B2B Website Development](https://www.bol-agency.com/blog/b2b-website-performance-and-scalability)
31. [Complete Guide to B2B Web Analytics](https://www.hockeystack.com/blog-posts/b2b-web-analytics)
32. [Guide to B2B Website Design: Structure, Content, and Best Practices](https://beetlebeetle.com/post/b2b-website-design-guide-structure-content-best-practices)

### GitHub 官方讨论

33. [Are there baseline CPU and Memory requirements for Next.js?](https://github.com/vercel/next.js/discussions/65908)
34. [What is the hardware requirements for deploying self hosting nextjs?](https://github.com/vercel/next.js/discussions/27265)

---

## 7. 关键决策点与后续行动

### 立即行动 (本周)

- [ ] **锁定 Hetzner 价格**：April 1 起涨价 20-30%，如选择 Hetzner 需立即订购
- [ ] **测试 VPS 部署**：在 Hetzner/Vultr 上完成一次 Next.js SSR 部署测试（2-4h）
- [ ] **评估运维成本**：团队是否有人能月度维护 2-5h？

### 短期（1-3 个月）

- [ ] 制定 Cloudflare → VPS 迁移检查清单
- [ ] 建立监控告警（PM2 health, Nginx status）
- [ ] 文档化部署流程（Nginx config, SSL renewal）

### 中期（3-12 个月）

- [ ] 根据实际流量数据评估多区域需求
- [ ] 若流量 >1000 UV/day，启动 Hetzner Frankfurt 备机部署
- [ ] 考虑 managed DB（如有数据持久化需求）

### 风险监控

| 风险 | 监控指标 | 触发阈值 |
|------|---------|---------|
| VPS 故障 | 宕机时间 | >1h/month |
| 内存溢出 | PM2 重启频率 | >1次/day |
| 磁盘满 | 存储使用率 | >80% |
| 出口瓶颈 | 澳洲用户延迟 | >500ms |
| OpenNext 版本冲突 | Next.js 版本更新 | 每个 minor 版本 |

---

**文档维护日期**: 2026-03-23
**下次更新**: 当 Hetzner 价格调整生效（April 1, 2026）或 Tianze 流量突破 1000 UV/day 时更新推荐方案。

