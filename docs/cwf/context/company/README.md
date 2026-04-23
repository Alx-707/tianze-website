# 公司资料索引

> 目的：作为 Tianze 公司信息的单一来源索引。  
> 使用者：给做页面设计、内容生成、页面实现的 AI 或人工协作者快速找资料。

## 文件索引

| 文件 | 格式 | 主要内容 | 什么时候看 |
|------|------|----------|------------|
| `company-facts.yaml` | YAML | 公司名称、地点、认证、规模等结构化事实 | 任何页面需要公司事实时 |
| `products.yaml` | YAML | 产品目录、规格、分类、标准 | 产品页、导航、产品结构判断 |
| `value-copy.md` | Markdown | 价值主张、差异化、营销表达 | 首页、About、落地页 |
| `customers.md` | Markdown | 买家画像、应用场景、痛点 | Solutions、受众定位、内容判断 |
| `content-gaps.md` | Markdown | 还缺什么内容、哪些点还没补齐 | 做页面前先扫缺口 |

## 快速定位

```yaml
# 公司名
company-facts.yaml -> identity.name_en

# 主产品
products.yaml -> categories.[category].items

# 核心价值主张
value-copy.md -> Value Propositions

# 目标客户
customers.md -> Customer Segments

# 当前缺口
content-gaps.md -> Status tables
```

## 默认使用顺序

1. 做页面前，先看 `content-gaps.md`
2. 需要硬事实，查 `company-facts.yaml`
3. 需要产品结构，查 `products.yaml`
4. 需要文案方向，查 `value-copy.md`
5. 需要买家视角，查 `customers.md`

## 数据原则

1. 一个事实尽量只在一个地方维护
2. 可结构化的信息优先放 YAML
3. 不知道的内容要明确标缺，不要靠猜
4. 中英文信息按实际需要保留

## 维护规则

更新公司资料时：

1. 先改对应的 YAML / Markdown 文件
2. 如果新增了资料类型，再回头补这份 README
3. 如果补齐了旧缺口，记得同步更新 `content-gaps.md`
