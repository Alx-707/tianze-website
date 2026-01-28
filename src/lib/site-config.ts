/**
 * Site configuration constants for Tianze website
 */

import { SITE_CONFIG } from "@/config/paths/site-config";

export const PROJECT_STATS = {
  business: {
    exportCountries: 100,
    employees: 60,
    onTimeDelivery: "98%",
    yearsExperience: 6,
  },
  products: {
    certifications: ["ISO 9001", "ASTM", "UL651"],
    productLines: 3,
    customMolds: "500+",
  },
  community: {
    initialLikeCount: 42,
  },
} as const;

export const PROJECT_LINKS = {
  github: SITE_CONFIG.social.github,
  documentation: "/docs",
  demo: "/demo",
  discussions: `${SITE_CONFIG.social.github}/discussions`,
} as const;

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
