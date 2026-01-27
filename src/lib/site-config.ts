/**
 * 网站配置常量
 * 集中管理所有硬编码的数值和配置
 */

import { SITE_CONFIG } from "@/config/paths/site-config";

// 项目统计数据
export const PROJECT_STATS = {
  // 业务统计
  business: {
    exportCountries: 100,
    employees: 60,
    onTimeDelivery: "98%",
    yearsExperience: 6,
  },

  // 产品指标
  products: {
    certifications: ["ISO 9001", "ASTM", "UL651"],
    productLines: 3,
    customMolds: "500+",
  },

  // 社区数据（保留用于其他用途）
  community: {
    initialLikeCount: 42,
  },
} as const;

// 项目链接
export const PROJECT_LINKS = {
  github: SITE_CONFIG.social.github,
  documentation: "/docs",
  demo: "/demo",
  discussions: `${SITE_CONFIG.social.github}/discussions`,
} as const;

// 技术架构配置
export const TECH_ARCHITECTURE = {
  equipment: {
    title: "Bending Equipment",
    description: "Semi-auto and full-auto PVC pipe bending machines",
    color: "blue",
  },
  conduit: {
    title: "PVC Conduit System",
    description: "Schedule 40/80 conduits, bends, and fittings",
    color: "green",
  },
  pneumatic: {
    title: "Pneumatic Tubes",
    description: "PETG/PMMA/PVC tubes for hospital logistics",
    color: "purple",
  },
} as const;

// 响应式断点配置
export const RESPONSIVE_BREAKPOINTS = {
  mobile: {
    title: "Mobile First",
    description: "移动端优先的响应式设计",
    icon: "User",
  },
  tablet: {
    title: "Tablet Optimized",
    description: "平板设备优化体验",
    icon: "Mail",
  },
  desktop: {
    title: "Desktop Enhanced",
    description: "桌面端增强功能",
    icon: "Settings",
  },
} as const;

// 主题配置
export const THEME_CONFIG = {
  colors: {
    primary: "hsl(var(--primary))",
    secondary: "hsl(var(--secondary))",
    muted: "hsl(var(--muted))",
    accent: "hsl(var(--accent))",
  },
  typography: {
    weights: ["bold", "medium", "normal", "muted"],
  },
} as const;

// 动画配置
export const ANIMATION_CONFIG = {
  intersection: {
    threshold: 0.2,
    triggerOnce: true,
  },
  transitions: {
    duration: 700,
    easing: "ease-out",
  },
} as const;
