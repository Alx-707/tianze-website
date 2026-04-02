/**
 * @vitest-environment jsdom
 */

/**
 * Contact Page Rendering - Core Basic Tests
 *
 * 核心基础渲染测试，专注于最重要的渲染功能：
 * - 基础渲染测试
 * - 核心组件结构
 * - 基本布局验证
 */

import React from "react";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactPage from "@/app/[locale]/contact/page";
import { renderAsyncPage } from "@/testing/render-async-page";

// Mock next-intl
const { mockGetTranslations, mockSuspenseState: _mockSuspenseState } =
  vi.hoisted(() => {
    const mockGetTranslations = vi.fn();
    return {
      mockGetTranslations,
      mockSuspenseState: {
        locale: "en",
        translations: {} as Record<string, string>,
      },
    };
  });

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof React>("react");
  return {
    ...actual,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: vi.fn(),
}));

vi.mock("next/server", () => ({
  connection: vi.fn(() => Promise.resolve()),
}));

// 在测试环境中将 cacheLife 处理为 no-op，避免依赖 Next.js cacheComponents 运行时配置
vi.mock("next/cache", () => ({
  cacheLife: () => {
    // no-op in tests; real cache behavior is validated via Next.js build/e2e
  },
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    alt: string;
  }) => <img src={src} alt={alt} {...props} />,
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  Mail: () => <svg data-testid="mail-icon" />,
  Phone: () => <svg data-testid="phone-icon" />,
  MapPin: () => <svg data-testid="map-pin-icon" />,
  MessageCircle: () => <svg data-testid="message-circle-icon" />,
}));

// Mock Zod
vi.mock("zod", () => ({
  z: {
    object: vi.fn(() => ({
      parse: vi.fn(),
      safeParse: vi.fn(() => ({ success: true, data: {} })),
    })),
    string: vi.fn(() => ({
      min: vi.fn(() => ({ email: vi.fn() })),
      email: vi.fn(),
    })),
  },
}));

// Mock components
vi.mock("@/components/layout/header", () => ({
  Header: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header">{children}</div>
  ),
}));

vi.mock("@/components/contact/contact-form", () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
}));

// Mock getContactCopy to provide structured copy data (plain functions survive clearAllMocks)
vi.mock("@/lib/contact/getContactCopy", () => ({
  getContactCopy: () =>
    Promise.resolve({
      header: {
        title: "Contact Us",
        description: "Get in touch with our team",
      },
      panel: {
        contact: {
          title: "Contact Methods",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
        hours: {
          title: "Business Hours",
          weekdaysLabel: "Mon - Fri",
          saturdayLabel: "Saturday",
          sundayLabel: "Sunday",
          closedLabel: "Closed",
        },
        whatsapp: {
          label: "WhatsApp",
          chatNow: "Chat Now",
          comingSoon: "Coming Soon",
        },
      },
    }),
}));

// Mock load-messages
vi.mock("@/lib/load-messages", () => ({
  loadCriticalMessages: () => Promise.resolve({}),
  loadDeferredMessages: () => Promise.resolve({}),
}));

// Mock client-messages
vi.mock("@/lib/i18n/client-messages", () => ({
  pickMessages: () => ({}),
}));

// Mock site-facts
vi.mock("@/config/site-facts", () => ({
  siteFacts: {
    company: {
      name: "Tianze",
      established: 2018,
      employees: 60,
      location: { country: "China", city: "Lianyungang" },
    },
    contact: {
      email: "hello@example.com",
      phone: "+1-555-0123",
      whatsapp: undefined,
      businessHours: { weekdays: "9:00 - 18:00", saturday: "10:00 - 16:00" },
    },
    stats: { exportCountries: 100 },
  },
}));

// Mock site-config
vi.mock("@/config/paths/site-config", () => ({
  isWhatsAppConfigured: () => false,
  SITE_CONFIG: {
    name: "Tianze",
    url: "https://tianze.com",
    seo: { keywords: [] },
  },
}));

// Mock seo-metadata
vi.mock("@/lib/seo-metadata", () => ({
  generateMetadataForPath: ({
    config,
  }: {
    config: { title: string; description: string };
  }) => ({
    title: config.title,
    description: config.description,
  }),
}));

// Mock FaqSection
vi.mock("@/components/sections/faq-section", () => ({
  FaqSection: () => null,
}));

// Mock NextIntlClientProvider
vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock generate-static-params
vi.mock("@/app/[locale]/generate-static-params", () => ({
  generateLocaleStaticParams: () => [{ locale: "en" }, { locale: "zh" }],
}));
describe("Contact Page Rendering - Core Basic Tests", () => {
  const mockParams = { locale: "en" };

  // 默认Mock返回值
  const defaultTranslations: Record<string, string> = {
    title: "Contact Us",
    description: "Get in touch with our team",
    email: "Email",
    phone: "Phone",
    address: "Address",
    hours: "Business Hours",
    "hours.weekdays": "Monday - Friday: 9:00 AM - 6:00 PM",
    "hours.weekend": "Saturday - Sunday: Closed",
    // New panel translations used by the page
    "panel.contactTitle": "Contact Methods",
    "panel.email": "Email",
    "panel.phone": "Phone",
    "panel.hoursTitle": "Business Hours",
    "panel.weekdays": "Mon - Fri",
    "panel.saturday": "Saturday",
    "panel.sunday": "Sunday",
    "panel.closed": "Closed",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue((key: string) => {
      return defaultTranslations[key] || key; // key 来自测试数据，安全
    });

    // Reset Suspense mock state
  });

  describe("核心基础渲染测试", () => {
    it("应该正确渲染页面的基本结构", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      expect(screen.getByText("Contact Us")).toBeInTheDocument();
      expect(
        screen.getByText("Get in touch with our team"),
      ).toBeInTheDocument();
    });

    it("应该渲染联系表单", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    });

    it("应该渲染联系信息卡片", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Phone")).toBeInTheDocument();
      expect(screen.getByText("hello@example.com")).toBeInTheDocument();
      expect(screen.getByText("+1-555-0123")).toBeInTheDocument();
    });

    it("应该渲染营业时间信息", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      expect(screen.getByText("Business Hours")).toBeInTheDocument();
      expect(screen.getByText("Mon - Fri")).toBeInTheDocument();
      expect(screen.getByText("9:00 - 18:00")).toBeInTheDocument();
      expect(screen.getByText("Saturday")).toBeInTheDocument();
      expect(screen.getByText("10:00 - 16:00")).toBeInTheDocument();
      expect(screen.getByText("Sunday")).toBeInTheDocument();
      expect(screen.getByText("Closed")).toBeInTheDocument();
    });

    it("应该有正确的页面标题", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveTextContent("Contact Us");
    });
  });

  describe("核心组件结构测试", () => {
    it("应该有正确的页面布局", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      const container = screen.getByRole("heading", { level: 1 });
      expect(container).toBeInTheDocument();
    });

    it("应该有响应式网格布局", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 网格布局在内层div上，不是main元素上
      const pageContainer = screen
        .getByRole("heading", { level: 1 })
        .closest("div")?.parentElement?.parentElement;
      const gridContainer = pageContainer?.querySelector(".grid");
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass("grid", "gap-8", "md:grid-cols-2");
    });

    it("应该渲染SVG图标", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 直接查询SVG元素
      const { container } = {
        container: screen.getByRole("heading", { level: 1 }).closest("div")
          ?.parentElement?.parentElement?.parentElement,
      };
      const svgElements = container?.querySelectorAll("svg") ?? [];
      expect(svgElements.length).toBeGreaterThanOrEqual(2); // 至少有邮箱和电话图标
    });

    it("应该有正确的标题容器样式", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      const title = screen.getByRole("heading", { level: 1 });
      expect(title).toHaveClass(
        "text-4xl",
        "font-bold",
        "tracking-tight",
        "md:text-5xl",
      );
    });
  });

  describe("核心布局样式测试", () => {
    it("应该有正确的联系信息布局", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 找到包含邮箱文本的父级div（有flex类的那个）
      const emailText = screen.getByText("Email");
      const contactInfo = emailText.closest(".flex.items-center.space-x-3");
      expect(contactInfo).toBeInTheDocument();
      expect(contactInfo).toHaveClass("flex", "items-center", "space-x-3");
    });

    it("应该有正确的营业时间布局", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      const hoursSection = screen.getByText("Business Hours").closest("div");
      expect(hoursSection).toBeInTheDocument();
    });

    it("应该有正确的卡片数量", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      const cards = screen.getAllByTestId("card");
      expect(cards.length).toBe(2); // 联系方式卡片 + 营业时间卡片
    });
  });

  describe("核心SVG图标测试", () => {
    it("应该渲染邮箱SVG图标", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 检查邮箱图标的SVG路径
      const pageContainer = screen.getByText("Contact Us").closest("div")
        ?.parentElement?.parentElement?.parentElement;
      const mailIconPath = pageContainer?.querySelector(
        'path[d*="M3 8l7.89 4.26a2 2 0 002.22 0L21 8"]',
      );
      expect(mailIconPath).toBeInTheDocument();
    });

    it("应该渲染电话SVG图标", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 检查电话图标的SVG路径
      const pageContainer2 = screen.getByText("Contact Us").closest("div")
        ?.parentElement?.parentElement?.parentElement;
      const phoneIconPath = pageContainer2?.querySelector(
        'path[d*="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684"]',
      );
      expect(phoneIconPath).toBeInTheDocument();
    });

    it("应该渲染所有必要的图标", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 检查所有SVG元素
      const { container } = {
        container: screen.getByRole("heading", { level: 1 }).closest("div")
          ?.parentElement?.parentElement?.parentElement,
      };
      const svgElements = container?.querySelectorAll("svg") ?? [];
      expect(svgElements.length).toBeGreaterThanOrEqual(2); // 至少邮箱和电话图标
    });
  });

  describe("核心响应式设计测试", () => {
    it("应该有响应式网格类", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 网格类在内层div上
      const pageContainer = screen
        .getByRole("heading", { level: 1 })
        .closest("div")?.parentElement?.parentElement;
      const gridContainer = pageContainer?.querySelector(".grid");
      expect(gridContainer).toHaveClass("grid", "gap-8", "md:grid-cols-2");
    });

    it("应该有响应式间距", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      const container2 = screen
        .getByRole("heading", { level: 1 })
        .closest("div")?.parentElement?.parentElement;
      expect(container2).toHaveClass("px-4", "py-16");
    });
  });

  describe("边缘情况测试", () => {
    it("应该处理空翻译", async () => {
      mockGetTranslations.mockResolvedValue(() => "");

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 页面应该仍然渲染，即使翻译为空
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("应该处理无效的locale参数", async () => {
      const invalidParams = { locale: "invalid" };

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(invalidParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 页面应该仍然渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });
});
