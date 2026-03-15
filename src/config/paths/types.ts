/**
 * 路径配置相关类型定义
 */

import type { Locale } from "@/i18n/routing-config";

export type { Locale };

// 路径映射接口定义
export interface LocalizedPath {
  [locale: string]: string;
}

// 页面类型定义 (静态路由)
export type PageType =
  | "home"
  | "about"
  | "contact"
  | "blog"
  | "products"
  | "faq"
  | "privacy"
  | "terms";

// 动态路由类型定义
export type DynamicPageType = "blogDetail" | "productDetail";

// 动态路由路径模式
export interface DynamicRoutePattern {
  pattern: string;
  paramName: string;
}
