# 信息架构

> Ring 2 | 已确认（2026-03-30）

## 一句话结论

当前公开站先收口产品市场页，保留 `/oem-custom-manufacturing/` 作为独立 OEM 转化页。
不要把未来产品树目标误写成当前已上线 URL。

## 当前结构存在的问题

当前站点里几条线仍然是分散的：

- `/products/`
- `/oem-custom-manufacturing/`

这会带来几个问题：

- 买家不容易理解 Tianze 到底卖什么
- PETG、定制和标准市场产品没有统一层级

## 当前公开站结构

```text
/
├── /products/
│   ├── /products/north-america/
│   ├── /products/australia-new-zealand/
│   ├── /products/mexico/
│   ├── /products/europe/
│   └── /products/pneumatic-tube-systems/
├── /oem-custom-manufacturing/
├── /about/
├── /contact/
├── /privacy/
└── /terms/
```

未来如果把 OEM 移入 `/products/`，必须作为单独 IA migration 处理，不能在文档里提前混用两套路径。

## 结构原则

### 1. 所有 sellable line 进入统一产品树

- PVC conduit products by market standard
- PETG pneumatic tube systems
- OEM / custom manufacturing

都属于产品/制造能力叙事，但当前 URL 仍以已上线结构为准。

### 2. 首页负责分流，不负责展开所有细节

首页要做的事情是：

- 让买家 10 秒内知道 Tianze 的 3 类入口
- 把人送到正确的产品树入口

### 3. URL 结构要反映认知结构

产品树既是导航结构，也是 SEO 结构。  
路径应该帮助人理解层级，而不是制造混乱。

## 当前执行规则

- 讨论路径时，分清 `Current path` 和 `Target path`
- 新增市场页或新业务线，不能只改一处，要同步 IA、内容、SEO 和代码
- 任何把 OEM 路径改入 `/products/` 的动作，都要被当成结构性变更处理
