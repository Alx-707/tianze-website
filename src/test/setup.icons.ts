import React from "react";
import { vi } from "vitest";

// Mock lucide-react icons - 返回真正的React元素而不是字符串
// Browser Mode（BROWSER_TEST=true）下跳过此 Mock，避免 v4 Browser 手动 mock 解析冲突
if (process.env.BROWSER_TEST !== "true") {
  vi.mock("lucide-react", () => {
    // 在 factory 内定义 MockIcon，避免 Vitest v4 hoist 导致的未定义错误
    const MockIcon = ({ className, ...props }: any) =>
      React.createElement("svg", {
        className: className || "",
        "data-testid": "mock-icon",
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        ...props,
      });

    // Keep this list minimal: only icons used in this repo.
    // Update it when a new icon import appears.
    const iconNames = [
      "ArrowLeft",
      "ArrowRight",
      "BadgeCheck",
      "Calendar",
      "Check",
      "CheckCircle",
      "CheckIcon",
      "ChevronDown",
      "ChevronDownIcon",
      "ChevronRightIcon",
      "CircleIcon",
      "Clock",
      "Code",
      "Crosshair",
      "Download",
      "ExternalLink",
      "Factory",
      "Globe",
      "HeadphonesIcon",
      "Heart",
      "Loader2",
      "Mail",
      "Menu",
      "MessageCircle",
      "MessageSquare",
      "Monitor",
      "Moon",
      "Package",
      "Palette",
      "Quote",
      "Rocket",
      "Send",
      "Settings",
      "Share2",
      "Shield",
      "Star",
      "Sun",
      "Tag",
      "User",
      "Wrench",
      "X",
      "XCircle",
      "XIcon",
      "Zap",
    ] as const;

    const exports: Record<string, unknown> = {
      __esModule: true,
      default: MockIcon,
    };

    for (const iconName of iconNames) {
      exports[iconName] = MockIcon;
    }

    return exports;
  });
}
