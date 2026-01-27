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
const { mockUseTranslations, mockUseIntersectionObserver } = vi.hoisted(() => ({
  mockUseTranslations: vi.fn(),
  mockUseIntersectionObserver: vi.fn(),
}));

// Mock外部依赖
vi.mock("next-intl", () => ({
  useTranslations: mockUseTranslations,
}));

vi.mock("@/hooks/use-intersection-observer", () => ({
  useIntersectionObserver: mockUseIntersectionObserver,
}));

// Mock Lucide React图标
vi.mock("lucide-react", () => ({
  ArrowRight: ({ className }: { className?: string }) => (
    <span className={className} data-testid="arrow-right-icon">
      →
    </span>
  ),
  BookOpen: ({ className }: { className?: string }) => (
    <span className={className} data-testid="book-open-icon">
      📖
    </span>
  ),
  Download: ({ className }: { className?: string }) => (
    <span className={className} data-testid="download-icon">
      ⬇️
    </span>
  ),
  ExternalLink: ({ className }: { className?: string }) => (
    <span className={className} data-testid="external-link-icon">
      🔗
    </span>
  ),
  FileText: ({ className }: { className?: string }) => (
    <span className={className} data-testid="file-text-icon">
      📄
    </span>
  ),
  Github: ({ className }: { className?: string }) => (
    <span className={className} data-testid="github-icon">
      🐙
    </span>
  ),
  MessageCircle: ({ className }: { className?: string }) => (
    <span className={className} data-testid="message-circle-icon">
      💬
    </span>
  ),
  Phone: ({ className }: { className?: string }) => (
    <span className={className} data-testid="phone-icon">
      📞
    </span>
  ),
  Star: ({ className }: { className?: string }) => (
    <span className={className} data-testid="star-icon">
      ⭐
    </span>
  ),
}));

describe("CallToAction Component - Basic Tests", () => {
  // 默认翻译Mock
  const defaultTranslations = {
    badge: "Open Source",
    title: "Ready to Get Started?",
    subtitle:
      "Join thousands of developers building amazing projects with our tools.",
    "github.primary.text": "View on GitHub",
    "github.primary.description": "Explore the source code",
    "github.secondary.text": "Star on GitHub",
    "github.secondary.description": "Show your support",
    "docs.text": "Documentation",
    "docs.description": "Learn how to use our tools",
    "community.text": "Join Community",
    "community.description": "Connect with other developers",
    "discussions.text": "Discussions",
    "discussions.description": "Ask questions and share ideas",
    "issues.text": "Report Issues",
    "issues.description": "Help us improve",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认的翻译Mock
    const mockT = vi.fn(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );
    mockUseTranslations.mockReturnValue(mockT);

    // 设置默认的Intersection Observer Mock
    mockUseIntersectionObserver.mockReturnValue({
      ref: vi.fn(),
      isVisible: true,
    });
  });

  describe("基础渲染", () => {
    it("应该正确渲染CTA组件", () => {
      render(<CallToAction />);

      // 验证主要元素存在
      expect(screen.getByText("Ready to Get Started?")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Join thousands of developers building amazing projects with our tools.",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Open Source")).toBeInTheDocument();
    });

    it("应该渲染所有行动按钮", () => {
      render(<CallToAction />);

      // 验证主要GitHub按钮
      expect(
        screen.getByRole("link", { name: /primary\.github/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /primary\.demo/i }),
      ).toBeInTheDocument();

      // 验证文档和社区链接
      expect(
        screen.getByRole("link", { name: /buttons\.getStarted/i }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("link", { name: /buttons\.learnMore/i }),
      ).toHaveLength(2);

      // 验证GitHub相关链接
      expect(
        screen.getByRole("link", { name: /community\.discussions/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /community\.issues/i }),
      ).toBeInTheDocument();
    });

    it("应该渲染正确的结构元素", () => {
      render(<CallToAction />);

      // 验证section元素存在
      const section = document.querySelector("section");
      expect(section).toBeInTheDocument();

      // 验证标题层次结构
      const title = screen.getByRole("heading", { level: 2 });
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent("Ready to Get Started?");
    });
  });

  describe("链接地址验证", () => {
    it("主要联系按钮应该有正确的链接", () => {
      render(<CallToAction />);

      const contactLink = screen.getByRole("link", {
        name: /primary\.github/i,
      });
      expect(contactLink).toHaveAttribute("href", "/contact");
      // Internal link, no target="_blank"
      expect(contactLink).not.toHaveAttribute("target", "_blank");
    });

    it("主要行动按钮应该有正确的链接", () => {
      render(<CallToAction />);

      const contactLink = screen.getByRole("link", {
        name: /buttons\.getStarted/i,
      });
      // Action cards now use internal links
      expect(contactLink).toHaveAttribute("href", "/contact");
      expect(contactLink).not.toHaveAttribute("target", "_blank");
    });

    it("文档链接应该有正确的地址", () => {
      render(<CallToAction />);

      // Now there are multiple learnMore links (action cards)
      const learnMoreLinks = screen.getAllByRole("link", {
        name: /buttons\.learnMore.*→/i,
      });
      // Verify we have two learnMore links (products and support)
      expect(learnMoreLinks).toHaveLength(2);
      // Check that the expected hrefs are present
      const hrefs = learnMoreLinks.map((link) => link.getAttribute("href"));
      expect(hrefs).toContain("/products");
      expect(hrefs).toContain("/support");
    });

    it("社区链接应该有正确的地址", () => {
      render(<CallToAction />);

      const communityLink = screen.getByRole("link", {
        name: /community\.discussions/i,
      });
      expect(communityLink).toHaveAttribute(
        "href",
        "https://wa.me/8618000000000",
      );
    });

    it("Discussions链接应该有正确的地址", () => {
      render(<CallToAction />);

      const discussionsLink = screen.getByRole("link", {
        name: /discussions/i,
      });
      expect(discussionsLink).toHaveAttribute(
        "href",
        "https://wa.me/8618000000000",
      );
      expect(discussionsLink).toHaveAttribute("target", "_blank");
    });

    it("Issues链接应该有正确的地址", () => {
      render(<CallToAction />);

      const issuesLink = screen.getByRole("link", { name: /issues/i });
      expect(issuesLink).toHaveAttribute("href", "mailto:sales@tianzepipe.com");
      expect(issuesLink).toHaveAttribute("target", "_blank");
    });
  });

  describe("图标渲染", () => {
    it("应该渲染所有必要的图标", () => {
      render(<CallToAction />);

      // Primary button now uses Phone icon (also used in action card)
      const phoneIcons = screen.getAllByTestId("phone-icon");
      expect(phoneIcons.length).toBeGreaterThanOrEqual(1);

      // Action card icons - CTABannerBlock uses Phone, FileText, and MessageCircle
      expect(screen.getByTestId("file-text-icon")).toBeInTheDocument();
      const messageCircleIcons = screen.getAllByTestId("message-circle-icon");
      expect(messageCircleIcons.length).toBeGreaterThan(0);

      // Star icon is no longer used in badge
      expect(screen.queryByTestId("star-icon")).not.toBeInTheDocument();

      const externalLinkIcons = screen.getAllByTestId("external-link-icon");
      expect(externalLinkIcons.length).toBeGreaterThan(0);

      // 箭头图标 - 有多个箭头图标 (action cards use arrows for internal links)
      const arrowIcons = screen.getAllByTestId("arrow-right-icon");
      expect(arrowIcons.length).toBeGreaterThanOrEqual(1);
    });

    it("图标应该有正确的测试ID", () => {
      render(<CallToAction />);

      // 验证每个图标都有正确的测试ID
      const phoneIcons = screen.getAllByTestId("phone-icon");
      phoneIcons.forEach((icon) => {
        expect(icon).toBeInTheDocument();
      });

      const arrowIcons = screen.getAllByTestId("arrow-right-icon");
      arrowIcons.forEach((icon) => {
        expect(icon).toBeInTheDocument();
      });
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
      expect(mockT).toHaveBeenCalledWith("title");
      expect(mockT).toHaveBeenCalledWith("subtitle");
      expect(mockT).toHaveBeenCalledWith("badge");
    });

    it("应该处理缺失的翻译", () => {
      const mockT = vi.fn((key: string) => key); // 返回键本身，模拟缺失翻译
      mockUseTranslations.mockReturnValue(mockT);

      render(<CallToAction />);

      // 组件应该仍然渲染，即使翻译缺失
      expect(screen.getByText("title")).toBeInTheDocument();
      expect(screen.getByText("subtitle")).toBeInTheDocument();
    });
  });

  describe("条件渲染", () => {
    it("应该在有翻译时渲染内容", () => {
      render(<CallToAction />);

      expect(screen.getByText("Ready to Get Started?")).toBeInTheDocument();
      expect(screen.getByText("Open Source")).toBeInTheDocument();
    });

    it("应该处理空翻译值", () => {
      const mockT = vi.fn((key: string) => {
        if (key === "badge") return "";
        return (
          defaultTranslations[key as keyof typeof defaultTranslations] || key
        );
      });
      mockUseTranslations.mockReturnValue(mockT);

      render(<CallToAction />);

      // 主要内容应该仍然存在
      expect(screen.getByText("Ready to Get Started?")).toBeInTheDocument();
    });
  });
});
