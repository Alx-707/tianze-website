# 文案资料库

> 天泽管业营销文案的单一事实来源
> 按页面组织，保留完整版本迭代历史

---

## 目录结构

```
copywriter/
├── README.md                    # 本文件
│
├── homepage/                    # 首页
│   ├── v1-initial.md           # V1 初始版本（已归档）
│   ├── v2-optimized.md         # V2 优化版本（当前使用）
│   └── analysis/               # 分析报告
│       ├── copy-editing.md     # 文案质量分析
│       ├── cro-analysis.md     # 转化率优化分析
│       └── psychology.md       # 营销心理学分析
│
├── products/                    # 产品页（待创建）
│   ├── v1-xxx.md
│   └── analysis/
│
├── about/                       # 关于页（待创建）
│   ├── v1-xxx.md
│   └── analysis/
│
├── contact/                     # 联系页（待创建）
│   ├── v1-xxx.md
│   └── analysis/
│
└── shared/                      # 共享素材
    └── proof-points.md         # 数据、证言、案例素材库
```

---

## 版本命名规范

| 版本 | 命名格式 | 说明 |
|------|---------|------|
| 初始版本 | `v1-initial.md` | 基于 product-marketing-context 的首版 |
| 优化版本 | `v2-optimized.md` | 经分析后的优化版本 |
| 后续迭代 | `v3-[重点].md` | 命名说明优化重点，如 `v3-ab-test-winner.md` |

**规则：**
- 每个版本都保留，不删除旧版本
- 在文件头部标注状态：`当前使用` / `已归档` / `测试中`
- 重大改动需附带分析报告

---

## 页面状态总览

| 页面 | 当前版本 | 状态 | 最后更新 |
|------|---------|------|---------|
| 首页 (homepage) | v3-seo-content-optimized.md | ✅ 当前使用 | 2026-02-04 |
| 产品页 (products) | — | 📝 待创建 | — |
| 关于页 (about) | — | 📝 待创建 | — |
| 联系页 (contact) | — | 📝 待创建 | — |

---

## 工作流程

### 新页面文案创建

```
1. 读取 .claude/product-marketing-context.md
2. 使用 copywriting skill 撰写初稿 → v1-initial.md
3. 使用三个分析 skill 审查：
   - copy-editing（文案质量）
   - page-cro（转化率）
   - marketing-psychology（心理学）
4. 整合分析结果 → v2-optimized.md
5. 将文案输入 Stitch 生成设计
```

### 文案迭代

```
1. 基于 A/B 测试结果 / 用户反馈 / 业务变更
2. 创建新版本文件（不覆盖旧版本）
3. 更新页面状态总览
4. 如有重大改动，补充分析报告
```

---

## 相关文档

| 文档 | 路径 | 用途 |
|------|------|------|
| 产品营销上下文 | `.claude/product-marketing-context.md` | 文案撰写的基础信息源 |
| 企业信息 | `docs/corporate-Info/` | 公司数据、产品信息 |
| 工作流说明 | `docs/workflow/` | Stitch 设计流程、文案流程 |

---

## 共享素材

`shared/proof-points.md` 包含可复用的信任素材：

- **公司数据**：出口国家、交货率、复购率等
- **认证资质**：ISO、ASTM、UL651 等
- **客户案例**：医院、商业建筑、OEM 三大场景
- **客户证言**：可引用的评价
- **差异化卖点**：核心定位、对比表
- **承诺/保证**：样品政策、质量保证等

各页面文案可直接引用这些素材，保持一致性。
