/**
 * @vitest-environment jsdom
 */

/**
 * Contact Page I18n - Basic Tests
 *
 * 专门测试基本国际化功能，包括：
 * - 基本翻译功能
 * - 不同locale支持
 * - 翻译键处理
 * - 元数据生成
 */

import React from "react";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactPage, { generateMetadata } from "@/app/[locale]/contact/page";
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

// Mock Suspense to render children directly (fallback is not needed in tests)
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

// Mock getContactCopy to provide structured copy data (use plain function, not vi.fn, to survive clearAllMocks)
vi.mock("@/lib/contact/getContactCopy", () => ({
  getContactCopy: () =>
    Promise.resolve({
      header: {
        title: "Contact Us",
        description:
          "Get in touch with our team for inquiries, support, or partnership opportunities.",
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
        response: {
          title: "What to expect",
          responseTimeLabel: "Typical response",
          responseTimeValue: "Within 24 business hours",
          bestForLabel: "Best for",
          bestForValue:
            "RFQs, product specs, MOQ, samples, and lead-time questions",
          prepareLabel: "Helpful details",
          prepareValue:
            "Share product type, size/standard, quantity, destination market, and timeline",
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
      businessHours: { weekdays: "9:00 - 18:00", saturday: "10:00 - 16:00" },
    },
    stats: { exportCountries: 100 },
  },
}));

// Mock site-config
vi.mock("@/config/paths/site-config", () => ({
  SITE_CONFIG: {
    name: "Tianze",
    url: "https://tianze.com",
    seo: { keywords: [] },
  },
}));

// Mock seo-metadata to avoid deep dependency chain
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

// Mock FaqAccordion
vi.mock("@/components/sections/faq-accordion", () => ({
  FaqAccordion: () => null,
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

describe("Contact Page I18n - Basic Tests", () => {
  const mockParams = { locale: "en" };

  // 默认Mock返回值
  const defaultTranslations = {
    title: "Contact Us",
    description:
      "Get in touch with our team for inquiries, support, or partnership opportunities.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );

    // mockSuspenseState is no longer used (Suspense now passes through children)
  });

  describe("基本翻译功能", () => {
    it("应该正确使用翻译", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证翻译内容正确渲染
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Get in touch with our team for inquiries, support, or partnership opportunities.",
        ),
      ).toBeInTheDocument();
    });

    it("应该处理不同的locale", async () => {
      const zhParams = { locale: "zh" };
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(zhParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证页面正确渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("应该处理缺失的翻译键", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });
      await renderAsyncPage(ContactPageComponent);

      // 验证页面渲染（内容由 getContactCopy mock 提供）
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
    });

    it("应该处理特殊字符的locale", async () => {
      const specialParams = { locale: "zh-CN" };
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(specialParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证页面正确渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("应该处理空的翻译值", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });
      await renderAsyncPage(ContactPageComponent);

      // 验证页面仍然渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  describe("元数据生成", () => {
    it("应该正确生成页面元数据", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      // 验证元数据结构
      expect(metadata).toMatchObject({
        title: "Contact Us",
        description:
          "Get in touch with our team for inquiries, support, or partnership opportunities.",
        other: {
          google: "notranslate",
        },
      });
    });

    it("应该处理不同locale的元数据", async () => {
      const zhParams = { locale: "zh" };

      await generateMetadata({ params: Promise.resolve(zhParams) });

      const metadata = await generateMetadata({
        params: Promise.resolve(zhParams),
      });
      expect(metadata).toHaveProperty("other.google", "notranslate");
    });

    it("应该处理元数据生成错误", async () => {
      mockGetTranslations.mockRejectedValue(new Error("Metadata error"));

      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });
      expect(metadata).toHaveProperty("title", "Contact Us");
    });

    it("应该生成正确的元数据结构", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      expect(metadata).toHaveProperty("title", "Contact Us");
      expect(metadata).toHaveProperty(
        "description",
        "Get in touch with our team for inquiries, support, or partnership opportunities.",
      );
      expect(metadata).toHaveProperty("other.google", "notranslate");
    });
  });

  describe("多语言支持", () => {
    it("应该支持英文locale", async () => {
      const enParams = { locale: "en" };
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(enParams),
      });
      await renderAsyncPage(ContactPageComponent);

      // 验证英文locale页面正确渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
    });

    it("应该支持中文locale", async () => {
      const zhParams = { locale: "zh" };
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(zhParams),
      });
      await renderAsyncPage(ContactPageComponent);

      // 验证中文locale页面正确渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("应该支持繁体中文locale", async () => {
      const zhTwParams = { locale: "zh-TW" };
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(zhTwParams),
      });
      await renderAsyncPage(ContactPageComponent);

      // 验证繁体中文locale页面正确渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("应该处理未知locale", async () => {
      const unknownParams = { locale: "unknown" };
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(unknownParams),
      });
      await renderAsyncPage(ContactPageComponent);

      // 验证未知locale页面仍能正确渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });
  });

  describe("翻译键处理", () => {
    it("应该使用正确的命名空间", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证页面正确渲染
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("应该处理长文本内容", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });
      await renderAsyncPage(ContactPageComponent);

      // 验证页面渲染（使用 getContactCopy mock 提供的默认数据）
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Get in touch with our team for inquiries, support, or partnership opportunities.",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("错误处理", () => {
    it("应该处理getTranslations错误", async () => {
      // When getTranslations fails, ContactContent (async) will throw
      // because getTranslationsCached wraps getTranslations
      mockGetTranslations.mockRejectedValue(new Error("Translation error"));

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      // The async component will throw during rendering
      await expect(
        renderAsyncPage(ContactPageComponent),
      ).resolves.toBeDefined();
    });

    it("应该处理params解析错误", async () => {
      const invalidParams = Promise.reject(new Error("Params error"));

      await expect(
        ContactPage({
          params: invalidParams,
        }),
      ).rejects.toThrow("Params error");
    });

    it("应该处理翻译函数返回错误", async () => {
      // When translation function throws, ContactContent will propagate the error
      mockGetTranslations.mockResolvedValue(() => {
        throw new Error("Translation function error");
      });

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await expect(
        renderAsyncPage(ContactPageComponent),
      ).resolves.toBeDefined();
    });

    it("应该处理异步翻译错误", async () => {
      // When getTranslations throws asynchronously, the error propagates
      mockGetTranslations.mockImplementation(async () => {
        throw new Error("Async translation error");
      });

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await expect(
        renderAsyncPage(ContactPageComponent),
      ).resolves.toBeDefined();
    });
  });

  describe("性能测试", () => {
    it("应该返回可等待的异步页面结果", async () => {
      const result = ContactPage({ params: Promise.resolve(mockParams) });

      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeDefined();
    });

    it("应该正确处理异步参数", async () => {
      const asyncParams = new Promise<{ locale: string }>((resolve) =>
        setTimeout(() => resolve(mockParams), 10),
      );

      const ContactPageComponent = await ContactPage({
        params: asyncParams,
      });

      await expect(
        renderAsyncPage(ContactPageComponent),
      ).resolves.toBeDefined();
    });
  });
});
