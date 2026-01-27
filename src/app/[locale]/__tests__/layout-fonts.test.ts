import { describe, expect, it } from "vitest";
import { ibmPlexSans, getFontClassNames } from "@/app/[locale]/layout-fonts";

// 使用全局 setup 中的 next/font/google mock（src/test/setup.ts）
// 该全局 mock 提供 variable/className/style，避免 ESM 目录导入问题
//
// Twitter theme migration 更新说明：
// - 从 IBM Plex Sans 迁移至 Open Sans
// - Open Sans 更适合现代 Web 界面，提升可读性
// - getFontClassNames() 返回 ibmPlexSans.variable（保持向后兼容的导出名称）

describe("Layout Fonts Configuration", () => {
  describe("ibmPlexSans字体配置", () => {
    it("应该正确配置Open Sans字体", () => {
      expect(ibmPlexSans).toBeDefined();
      expect(ibmPlexSans.variable).toBe("--font-open-sans");
    });

    it("应该包含正确的字体配置选项", () => {
      // 验证字体配置对象的结构
      expect(ibmPlexSans).toHaveProperty("variable");
      expect(ibmPlexSans).toHaveProperty("className");
      expect(ibmPlexSans).toHaveProperty("style");
    });

    it("应该设置正确的CSS变量名", () => {
      expect(ibmPlexSans.variable).toBe("--font-open-sans");
    });
  });

  describe("getFontClassNames函数 (Twitter theme)", () => {
    it("应该只返回 Open Sans 变量", () => {
      const classNames = getFontClassNames();

      expect(typeof classNames).toBe("string");
      expect(classNames).toContain("--font-open-sans");
      // 不包含其他字体变量
      expect(classNames).not.toContain("--font-geist");
    });

    it("应该只包含一个字体变量", () => {
      const classNames = getFontClassNames();

      // Twitter theme: 只有 Open Sans
      expect(classNames).toBe(ibmPlexSans.variable);
    });

    // 中文字体子集由 head.tsx 注入，不再通过 next/font 变量控制

    it("应该返回一致的结果", () => {
      const classNames1 = getFontClassNames();
      const classNames2 = getFontClassNames();

      expect(classNames1).toBe(classNames2);
    });

    it("应该返回非空字符串", () => {
      const classNames = getFontClassNames();

      expect(classNames).toBeTruthy();
      expect(classNames.length).toBeGreaterThan(0);
    });
  });

  describe("字体变量一致性", () => {
    it("字体变量应该遵循CSS自定义属性命名规范", () => {
      expect(ibmPlexSans.variable).toMatch(/^--font-/);
    });

    it("getFontClassNames应该包含ibmPlexSans变量", () => {
      const classNames = getFontClassNames();

      expect(classNames).toContain(ibmPlexSans.variable);
      // 中文字体变量不再出现在类名中
    });
  });

  describe("字体对象属性验证", () => {
    it("ibmPlexSans应该包含必要的Next.js字体属性", () => {
      // 验证Next.js字体对象的基本结构
      expect(ibmPlexSans).toHaveProperty("className");
      expect(ibmPlexSans).toHaveProperty("style");
      expect(typeof ibmPlexSans.className).toBe("string");
      expect(typeof ibmPlexSans.style).toBe("object");
    });

    it("字体样式对象应该包含fontFamily属性", () => {
      expect(ibmPlexSans.style).toHaveProperty("fontFamily");
      expect(typeof ibmPlexSans.style.fontFamily).toBe("string");
    });
  });

  describe("边界条件测试", () => {
    it("字体变量名不应该为空", () => {
      expect(ibmPlexSans.variable.length).toBeGreaterThan(0);
    });

    it("字体类名不应该为空", () => {
      expect(ibmPlexSans.className.length).toBeGreaterThan(0);
    });

    it("getFontClassNames返回值不应该包含多余的空格", () => {
      const classNames = getFontClassNames();

      // 不应该以空格开头或结尾
      expect(classNames).not.toMatch(/^\s/);
      expect(classNames).not.toMatch(/\s$/);

      // 不应该包含连续的空格
      expect(classNames).not.toMatch(/\s{2,}/);
    });
  });
});
