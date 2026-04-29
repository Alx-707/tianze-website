# 实施交接总图

> Ring 4 | 当前策略层到实现层的交接面

## 目的

这份文档的作用不是重新讲一遍战略，  
而是把策略摘要压成一份实现层可直接接的地图。

## 当前引用优先级

当实现判断冲突时，先看 `current-strategy-summary.md`，再按下面顺序拆判断：

1. 信息架构
2. 内容策略
3. 内容盘点
4. SEO 信息架构
5. 多语言策略
6. 法务缺口
7. 信任系统
8. 文案策略
9. 转化路径
10. 表单设计
11. 视觉方向
12. 资产处理

## 当前实施重点

### Phase A：结构迁移

- 把产品树收口
- 统一 `/products/` 层级
- 清掉旧路径遗留

### Phase B：信任与转化基础

- 首页分流
- CTA 体系
- 统一 inquiry 表单

### Phase C：业务线逐页推进

- PVC conduit products by market
- PETG pneumatic tube systems
- OEM / custom manufacturing
- Internal process and tooling proof

### Phase D：支撑层补齐

- 内容
- SEO
- 法务
- 下载资产

## 当前硬规则

- 实现层不能跳过上游结构判断直接凭感觉改
- 路径改动必须和 IA、内容、SEO 一起看
- 文案、视觉、CTA 都要回到 `current-strategy-summary.md` 的约束里
