/**
 * @vitest-environment jsdom
 */

/**
 * Contact Page Rendering - Advanced Tests
 *
 * 高级渲染测试，专注于复杂场景：
 * - 高级布局样式
 * - 复杂响应式设计
 * - 特殊图标测试
 * 基础功能测试请参考 page-rendering-basic-core.test.tsx
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
describe("Contact Page Rendering - Advanced Tests", () => {
  const mockParams = { locale: "en" };

  // 默认Mock返回值
  const defaultTranslations = {
    title: "Contact Us",
    description: "Get in touch with our team",
    "panel.contactTitle": "Contact Methods",
    "panel.email": "Email",
    "panel.phone": "Phone",
    "panel.hoursTitle": "Business Hours",
    "panel.weekdays": "Mon - Fri",
    "panel.saturday": "Saturday",
    "panel.sunday": "Sunday",
    "panel.closed": "Closed",
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );

    // Reset Suspense mock state
  });

  describe("高级时间格式测试", () => {
    it("应该渲染营业时间信息", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证营业时间
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

      // 验证页面标题
      const titleElement = screen.getByRole("heading", { level: 1 });
      expect(titleElement).toHaveTextContent("Contact Us");
    });
  });

  describe("高级图标容器样式测试", () => {
    it("应该有正确的图标容器样式", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 找到图标容器（包含SVG的div）
      const emailText = screen.getByText("Email");
      const emailRow = emailText.closest(".flex.items-center.space-x-3");
      const iconContainer = emailRow?.querySelector(".bg-primary\\/10");
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass(
        "bg-primary/10",
        "flex",
        "h-10",
        "w-10",
        "items-center",
        "justify-center",
        "rounded-lg",
      );
    });

    it("应该渲染所有必要的图标", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      const { container } = await renderAsyncPage(ContactPageComponent);

      // 验证图标数量
      const svgElements = container.querySelectorAll("svg");
      expect(svgElements.length).toBeGreaterThanOrEqual(2); // 至少邮箱和电话图标
    });
  });

  describe("高级响应式设计测试", () => {
    it("应该有响应式文本大小", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证响应式文本
      const descriptionElement = screen.getByText("Get in touch with our team");
      expect(descriptionElement).toHaveClass("text-xl");
    });
  });
});
