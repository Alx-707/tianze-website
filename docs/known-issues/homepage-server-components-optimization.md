# 首页 Section Server Components 优化

## 现状

`src/components/sections/` 下 9 个首页 section 全部使用 `"use client"`：

- hero-section.tsx
- chain-section.tsx
- products-section.tsx
- resources-section.tsx
- sample-cta.tsx
- scenarios-section.tsx
- quality-section.tsx
- final-cta.tsx
- site-footer.tsx

## 根因

所有 section 依赖以下 client-side 组件/hook：

| 依赖 | 来源 | 用途 |
|------|------|------|
| `ScrollReveal` | `@/components/ui/scroll-reveal` | IntersectionObserver 滚动动画 |
| `Link` | `@/i18n/routing` | next-intl locale-aware 路由 |
| `useTranslations` | `next-intl` | 客户端翻译 hook |

要实现 Server Components first，每个 section 需拆分为：
- Server wrapper：负责数据获取、静态内容
- Client presentation：负责交互、动画

涉及 9 × 2 = 18 个文件的架构变更。

## 影响评估

**当前影响：低**

- 这些 section 无数据获取逻辑，Server Component 的核心价值（零 client JS、服务端 fetch）用不上
- Lighthouse CI 性能指标达标，`unused-javascript` 在阈值内（≤150KB）
- 首页仍在迭代（v6 redesign），结构不稳定

## 触发优化的条件

| 条件 | 说明 |
|------|------|
| 首页设计定稿 | section 结构稳定后拆分，避免返工 |
| `unused-javascript` 超 150KB | 有量化证据证明 client bundle 需瘦身 |
| section 需要服务端数据 | 如产品列表从 CMS 拉取，Server Component 价值显现 |
| ScrollReveal 重构 | 消除主要 client boundary 根因，拆分成本下降 |

## 来源

Codex 代码审查 Issue #6（2026-02-08），验收时降级为后续优化项。
