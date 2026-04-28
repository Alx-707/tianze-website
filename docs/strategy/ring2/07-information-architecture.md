# 信息架构

> Ring 2 | 已确认（2026-03-30）

## 一句话结论

所有可售业务应该收口到 `/products/` 下面，形成统一产品树。  
不要再把产品、能力、定制拆成三套平行入口。

## 当前结构存在的问题

当前站点里几条线是分散的：

- `/products/`
- `/oem-custom-manufacturing/`

这会带来几个问题：

- 买家不容易理解 Tianze 到底卖什么
- PETG、定制和标准市场产品没有统一层级

## 当前批准的目标结构

```text
/
├── /products/
│   ├── /products/pipes/
│   │   ├── /products/pipes/north-america/
│   │   ├── /products/pipes/australia-new-zealand/
│   │   ├── /products/pipes/mexico/
│   │   ├── /products/pipes/europe/
│   │   └── /products/pipes/pneumatic-tubes/
│   └── /products/custom-manufacturing/
├── /about/
├── /contact/
├── /blog/
├── /faq/
├── /privacy/
└── /terms/
```

## 结构原则

### 1. 所有 sellable line 进入统一产品树

- Pipes
- Equipment
- Custom manufacturing

都属于产品层，而不是分散在不同语义目录里。

### 2. 首页负责分流，不负责展开所有细节

首页要做的事情是：

- 让买家 10 秒内知道 Tianze 的 3 条业务线
- 把人送到正确的产品树入口

### 3. URL 结构要反映认知结构

产品树既是导航结构，也是 SEO 结构。  
路径应该帮助人理解层级，而不是制造混乱。

## 当前执行规则

- 讨论路径时，分清 `Current path` 和 `Target path`
- 新增市场页或新业务线，不能只改一处，要同步 IA、内容、SEO 和代码
- 任何会打乱 `/products/` 统一树的改动，都要被当成结构性变更处理
