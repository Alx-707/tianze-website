import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetTranslations = vi.fn();

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
  routing: { locales: ["en", "zh"], defaultLocale: "en" },
}));

vi.mock("@/app/[locale]/generate-static-params", () => ({
  generateLocaleStaticParams: () => [{ locale: "en" }, { locale: "zh" }],
}));

vi.mock("@/components/sections/faq-section", () => ({
  FaqSection: () => <section data-testid="faq-section">FAQ</section>,
}));

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

describe("Feature: OEM Custom Manufacturing Page", () => {
  beforeEach(() => {
    vi.resetModules();
    mockGetTranslations.mockReset();
    mockGetTranslations.mockResolvedValue((key: string) => key);
  });

  async function renderPage(locale = "en") {
    const { default: Page } = await import("../page");
    const page = await Page({
      params: Promise.resolve({ locale }),
    });
    return render(page);
  }

  it("renders the hero section with title", async () => {
    await renderPage();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("hero.title");
  });

  it("renders 4 service scope modules", async () => {
    await renderPage();
    expect(screen.getByText("scope.customSizes.title")).toBeInTheDocument();
    expect(screen.getByText("scope.privateLabel.title")).toBeInTheDocument();
    expect(screen.getByText("scope.moldDevelopment.title")).toBeInTheDocument();
    expect(
      screen.getByText("scope.qualityAssurance.title"),
    ).toBeInTheDocument();
  });

  it("renders 5 process steps", async () => {
    await renderPage();
    expect(screen.getByText("process.step1.title")).toBeInTheDocument();
    expect(screen.getByText("process.step2.title")).toBeInTheDocument();
    expect(screen.getByText("process.step3.title")).toBeInTheDocument();
    expect(screen.getByText("process.step4.title")).toBeInTheDocument();
    expect(screen.getByText("process.step5.title")).toBeInTheDocument();
  });

  it("renders supported standards section", async () => {
    await renderPage();
    expect(screen.getByText("standards.title")).toBeInTheDocument();
  });

  it("renders FAQ section", async () => {
    await renderPage();
    expect(screen.getByTestId("faq-section")).toBeInTheDocument();
  });

  it("CTA links to /contact", async () => {
    await renderPage();
    const ctaLink = screen.getByRole("link", { name: /cta\.button/i });
    expect(ctaLink).toHaveAttribute("href", "/contact");
  });

  it("renders in Chinese locale", async () => {
    await renderPage("zh");
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("is an async server component", async () => {
    const mod = await import("../page");
    const result = mod.default({
      params: Promise.resolve({ locale: "en" }),
    });
    expect(result).toBeInstanceOf(Promise);
  });

  describe("generateMetadata", () => {
    it("returns metadata with correct title from oem namespace", async () => {
      const { generateMetadata } = await import("../page");
      const metadata = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(metadata).toMatchObject({
        title: "meta.title",
        description: "meta.description",
      });
    });

    it("passes locale to getTranslations", async () => {
      const { generateMetadata } = await import("../page");
      await generateMetadata({
        params: Promise.resolve({ locale: "zh" }),
      });
      expect(mockGetTranslations).toHaveBeenCalledWith({
        locale: "zh",
        namespace: "oem",
      });
    });
  });
});
