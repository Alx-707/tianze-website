import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STATIC_THEME_COLORS } from "../static-theme-colors";

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;
const BRIDGE_SOURCE = readFileSync("src/config/static-theme-colors.ts", "utf8");

describe("static theme colors", () => {
  it("exposes email-safe sRGB values for non-CSS surfaces", () => {
    expect(Object.keys(STATIC_THEME_COLORS).sort()).toEqual([
      "background",
      "border",
      "contentBackground",
      "error",
      "footerSelectionBackground",
      "footerSelectionForeground",
      "headerText",
      "muted",
      "primary",
      "primaryHover",
      "success",
      "successLight",
      "text",
      "textLight",
      "warning",
      "warningLight",
    ]);
  });

  it("keeps every exported value as a full hex color", () => {
    for (const [name, value] of Object.entries(STATIC_THEME_COLORS)) {
      expect(value, name).toMatch(HEX_COLOR_PATTERN);
    }
  });

  it("documents the bridge boundary instead of pretending to be brand truth", () => {
    expect(BRIDGE_SOURCE).toContain("sRGB bridge for src/app/globals.css");
    expect(BRIDGE_SOURCE).toContain("non-CSS surfaces only");
    expect(BRIDGE_SOURCE).toContain("not the brand truth source");
  });
});
