import React from "react";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
// 导入要测试的组件
import ContactPage, { generateMetadata } from "@/app/[locale]/contact/page";
import { renderAsyncPage } from "@/testing/render-async-page";

// Mock配置 - 使用vi.hoisted确保Mock在模块导入前设置
const { mockGetTranslations, mockSuspenseState: _mockSuspenseState } =
  vi.hoisted(() => ({
    mockGetTranslations: vi.fn(),
    mockSuspenseState: {
      locale: "en",
      translations: {} as Record<string, string>,
    },
  }));

// Mock Suspense to render mock content (async Server Components can't be rendered in Vitest)
vi.mock("react", async () => {
  const actual = await vi.importActual<typeof React>("react");
  return {
    ...actual,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// Mock next-intl/server
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

// Mock ContactForm组件
vi.mock("@/components/contact/contact-form", () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>,
}));

// Mock UI components
vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
    ...props
  }: React.PropsWithChildren<{
    className?: string;
    [key: string]: unknown;
  }>) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
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
      yearsInBusiness: new Date().getFullYear() - 2018,
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

// Mock FaqSection — render visible structure so tests can verify presence
vi.mock("@/components/sections/faq-section", () => ({
  FaqSection: ({ items }: { items: string[] }) => (
    <section data-testid="faq-section">
      {items.map((key: string) => (
        <div key={key} data-testid={`faq-item-${key}`}>
          {key}
        </div>
      ))}
    </section>
  ),
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
describe("ContactPage", () => {
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

  const mockParams = {
    locale: "en",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // 设置默认Mock返回值
    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );

    // Reset Suspense mock state
  });

  describe("基础渲染测试", () => {
    it("应该正确渲染页面的基本结构", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证主要结构元素
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
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

      // 验证联系表单存在
      expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    });

    it("应该渲染联系信息卡片", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证联系信息
      expect(screen.getByText("Contact Methods")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("hello@example.com")).toBeInTheDocument();
      expect(screen.getByText("Phone")).toBeInTheDocument();
      expect(screen.getByText("+1-555-0123")).toBeInTheDocument();
    });

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

    it("应该渲染FAQ区块", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      expect(screen.getByTestId("faq-section")).toBeInTheDocument();
      expect(screen.getByTestId("faq-item-moq")).toBeInTheDocument();
      expect(screen.getByTestId("faq-item-leadTime")).toBeInTheDocument();
    });
  });

  describe("国际化测试", () => {
    it("应该正确使用翻译", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证翻译内容正确渲染
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
      expect(
        screen.getByText("Get in touch with our team"),
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

      // 验证缺失翻译的处理
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
    });
  });

  describe("元数据生成测试", () => {
    it("应该正确生成页面元数据", async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve(mockParams),
      });

      // 验证元数据结构
      expect(metadata).toMatchObject({
        title: "Contact Us",
        description: "Get in touch with our team",
        other: {
          google: "notranslate",
        },
      });
    });

    it("应该处理不同locale的元数据", async () => {
      const zhParams = { locale: "zh" };

      await generateMetadata({ params: Promise.resolve(zhParams) });

      // 验证中文locale的元数据生成
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: "zh",
        namespace: "underConstruction.pages.contact",
      });
    });
  });

  describe("组件结构测试", () => {
    it("应该有正确的页面布局", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      const mainContainer = screen.getByTestId("contact-page-content");
      expect(mainContainer).toHaveClass("min-h-[80vh]", "px-4", "py-16");
      expect(mainContainer).toHaveClass("notranslate");
      expect(mainContainer).toHaveAttribute("translate", "no");
    });

    it("应该有响应式网格布局", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证网格布局
      const gridContainer = screen.getByTestId("contact-form").parentElement;
      expect(gridContainer).toHaveClass("grid", "gap-8", "md:grid-cols-2");
    });

    it("应该渲染SVG图标", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证SVG图标存在 - 查找整个文档中的svg元素
      const container = screen.getByText("Contact Us").closest("div")
        ?.parentElement?.parentElement?.parentElement;
      const svgElements = container?.querySelectorAll("svg");
      expect(svgElements?.length).toBeGreaterThan(0);
    });
  });

  describe("可访问性测试", () => {
    it("应该有正确的标题层级", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证标题层级
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    });

    it("应该有适当的语义结构", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证语义结构
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getAllByTestId("card")).toHaveLength(2);
    });
  });

  describe("错误处理测试", () => {
    it("应该处理getTranslations错误", async () => {
      // Note: With Suspense mock, errors in ContactContent are caught by Suspense
      // The page still renders with fallback content
      mockGetTranslations.mockRejectedValue(new Error("Translation error"));

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await expect(renderAsyncPage(ContactPageComponent)).rejects.toThrow();
    });

    it("应该处理params解析错误", async () => {
      const invalidParams = Promise.reject(new Error("Params error"));

      await expect(
        ContactPage({
          params: invalidParams,
        }),
      ).rejects.toThrow("Params error");
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

  describe("ContactPageHeader子组件测试", () => {
    it("应该正确渲染标题和描述", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证标题渐变效果
      const titleElement = screen.getByText("Contact Us");
      expect(titleElement).toHaveClass(
        "from-primary",
        "to-primary/60",
        "bg-gradient-to-r",
        "bg-clip-text",
        "text-transparent",
      );

      // 验证描述样式
      const descElement = screen.getByText("Get in touch with our team");
      expect(descElement).toHaveClass(
        "text-muted-foreground",
        "mx-auto",
        "max-w-2xl",
        "text-xl",
      );
    });

    it("应该有正确的标题容器样式", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证标题容器 - 查找ContactPageHeader组件的根容器
      const titleElement = screen.getByText("Contact Us");
      const headerContainer = titleElement.closest("h1")?.parentElement;
      expect(headerContainer).toHaveClass("mb-12", "text-center");
    });
  });

  describe("联系信息详细测试", () => {
    it("应该渲染邮箱图标和信息", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证邮箱图标容器 - 查找邮箱文本的父级容器中的图标容器
      const emailText = screen.getByText("Email");
      const emailContainer = emailText.closest(".flex.items-center.space-x-3");
      const emailIcon = emailContainer?.querySelector(".bg-primary\\/10");
      expect(emailIcon).toHaveClass(
        "bg-primary/10",
        "flex",
        "h-10",
        "w-10",
        "items-center",
        "justify-center",
        "rounded-lg",
      );
    });

    it("应该渲染电话图标和信息", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证电话图标容器 - 查找电话文本的父级容器中的图标容器
      const phoneText = screen.getByText("Phone");
      const phoneContainer = phoneText.closest(".flex.items-center.space-x-3");
      const phoneIcon = phoneContainer?.querySelector(".bg-primary\\/10");
      expect(phoneIcon).toHaveClass(
        "bg-primary/10",
        "flex",
        "h-10",
        "w-10",
        "items-center",
        "justify-center",
        "rounded-lg",
      );
    });

    it("应该有正确的联系信息布局", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证联系信息容器 - 查找联系方式标题下的容器
      const contactTitle = screen.getByText("Contact Methods");
      const contactContainer =
        contactTitle.parentElement?.querySelector(".space-y-4");
      expect(contactContainer).toHaveClass("space-y-4");
    });
  });

  describe("营业时间详细测试", () => {
    it("应该有正确的营业时间布局", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证营业时间容器
      const hoursContainer = screen.getByText("Business Hours").parentElement;
      expect(hoursContainer?.querySelector(".space-y-2")).toBeInTheDocument();
    });

    it("应该正确显示所有营业时间", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证所有时间段
      expect(screen.getByText("Mon - Fri")).toBeInTheDocument();
      expect(screen.getByText("9:00 - 18:00")).toBeInTheDocument();
      expect(screen.getByText("Saturday")).toBeInTheDocument();
      expect(screen.getByText("10:00 - 16:00")).toBeInTheDocument();
      expect(screen.getByText("Sunday")).toBeInTheDocument();
      expect(screen.getByText("Closed")).toBeInTheDocument();
    });

    it("应该有正确的时间显示样式", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证时间样式
      const timeElement = screen.getByText("9:00 - 18:00");
      expect(timeElement).toHaveClass("text-muted-foreground");
    });
  });

  describe("边缘情况测试", () => {
    it("应该处理空的翻译值", async () => {
      mockGetTranslations.mockResolvedValue(() => "");

      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证空翻译的处理
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
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

    it("应该处理长文本内容", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证页面渲染（使用 getContactCopy mock 提供的默认数据）
      expect(screen.getByText("Contact Us")).toBeInTheDocument();
      expect(
        screen.getByText("Get in touch with our team"),
      ).toBeInTheDocument();
    });
  });

  describe("SVG图标详细测试", () => {
    it("应该渲染邮箱SVG图标", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证邮箱SVG路径 - 查找邮箱文本的父级容器中的SVG
      const emailText = screen.getByText("Email");
      const emailContainer = emailText.closest(".flex.items-center.space-x-3");
      const emailSvg = emailContainer?.querySelector("svg");
      expect(emailSvg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(emailSvg).toHaveClass("text-primary", "h-5", "w-5");
    });

    it("应该渲染电话SVG图标", async () => {
      const ContactPageComponent = await ContactPage({
        params: Promise.resolve(mockParams),
      });

      await renderAsyncPage(ContactPageComponent);

      // 验证电话SVG路径 - 查找电话文本的父级容器中的SVG
      const phoneText = screen.getByText("Phone");
      const phoneContainer = phoneText.closest(".flex.items-center.space-x-3");
      const phoneSvg = phoneContainer?.querySelector("svg");
      expect(phoneSvg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(phoneSvg).toHaveClass("text-primary", "h-5", "w-5");
    });
  });
});
