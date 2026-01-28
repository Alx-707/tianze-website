"use client";

/**
 * Theme Switcher Highlight Component
 * Manufacturing-First Design v2.1: Mechanical precision easing (no spring/bounce)
 */
export function ThemeSwitcherHighlight() {
  return (
    <div
      className="absolute inset-0 rounded-full bg-muted transition-all duration-150"
      style={{
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    />
  );
}
