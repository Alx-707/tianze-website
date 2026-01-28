/**
 * CallToAction Component - Basic Tests
 *
 * 测试基础功能：
 * - 基础渲染测试
 * - 链接地址验证
 * - 图标渲染测试
 */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CallToAction } from "@/components/home/call-to-action";

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockUseTranslations } = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(),
}));

// Mock外部依赖
vi.mock("next-intl", () => ({
  useTranslations: mockUseTranslations,
}));

// Mock Lucide React图标
vi.mock("lucide-react", () => ({
  ArrowRight: ({ className }: { className?: string }) => (
    <span className={className} data-testid="arrow-right-icon">
      →
    </span>
  ),
}));

describe("CallToAction Component - Basic Tests", () => {
  // 默认翻译Mock
  const defaultTranslations = {
    message: "Contact us for samples or technical support",
    button: "Get Quote",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认的翻译Mock
    const mockT = vi.fn(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );
    mockUseTranslations.mockReturnValue(mockT);
  });

  describe("基础渲染", () => {
    it("应该正确渲染CTA组件", () => {
      render(<CallToAction />);

      // 验证主要元素存在
      expect(
        screen.getByText("Contact us for samples or technical support"),
      ).toBeInTheDocument();
      expect(screen.getByText("Get Quote")).toBeInTheDocument();
    });

    it("应该渲染正确的结构元素", () => {
      render(<CallToAction />);

      // 验证section元素存在
      const section = document.querySelector("section");
      expect(section).toBeInTheDocument();

      // 验证gradient背景类
      expect(section).toHaveClass("bg-gradient-to-r");
      expect(section).toHaveClass("from-primary");
    });

    it("应该渲染CTA按钮", () => {
      render(<CallToAction />);

      const ctaButton = screen.getByRole("link", { name: /Get Quote/i });
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute("href", "/contact");
    });
  });

  describe("链接地址验证", () => {
    it("CTA按钮应该链接到联系页面", () => {
      render(<CallToAction />);

      const contactLink = screen.getByRole("link", { name: /Get Quote/i });
      expect(contactLink).toHaveAttribute("href", "/contact");
      // Internal link, no target="_blank"
      expect(contactLink).not.toHaveAttribute("target", "_blank");
    });
  });

  describe("图标渲染", () => {
    it("应该渲染箭头图标", () => {
      render(<CallToAction />);

      const arrowIcon = screen.getByTestId("arrow-right-icon");
      expect(arrowIcon).toBeInTheDocument();
    });
  });

  describe("翻译集成", () => {
    it("应该调用正确的翻译命名空间", () => {
      render(<CallToAction />);

      expect(mockUseTranslations).toHaveBeenCalledWith("home.cta");
    });

    it("应该调用所有必要的翻译键", () => {
      const mockT = vi.fn(
        (key: string) =>
          defaultTranslations[key as keyof typeof defaultTranslations] || key,
      );
      mockUseTranslations.mockReturnValue(mockT);

      render(<CallToAction />);

      // 验证主要翻译键被调用
      expect(mockT).toHaveBeenCalledWith("message");
      expect(mockT).toHaveBeenCalledWith("button");
    });

    it("应该处理缺失的翻译", () => {
      const mockT = vi.fn((key: string) => key); // 返回键本身，模拟缺失翻译
      mockUseTranslations.mockReturnValue(mockT);

      render(<CallToAction />);

      // 组件应该仍然渲染，即使翻译缺失
      expect(screen.getByText("message")).toBeInTheDocument();
      expect(screen.getByText("button")).toBeInTheDocument();
    });
  });

  describe("自定义属性", () => {
    it("应该接受自定义className", () => {
      render(<CallToAction className="custom-class" />);

      const section = document.querySelector("section");
      expect(section).toHaveClass("custom-class");
    });

    it("应该接受自定义i18nNamespace", () => {
      render(<CallToAction i18nNamespace="custom.namespace" />);

      expect(mockUseTranslations).toHaveBeenCalledWith("custom.namespace");
    });
  });
});
