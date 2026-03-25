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

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

vi.mock("@/components/sections/faq-section", () => ({
  FaqSection: () => <section data-testid="faq-section">FAQ</section>,
}));

describe("Feature: Bending Machines Capability Page", () => {
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

  it("renders value proposition cards", async () => {
    await renderPage();
    expect(screen.getByText("why.card1.title")).toBeInTheDocument();
    expect(screen.getByText("why.card2.title")).toBeInTheDocument();
    expect(screen.getByText("why.card3.title")).toBeInTheDocument();
  });

  it("renders specs for both machines", async () => {
    await renderPage();
    expect(
      screen.getByText("equipment.full-auto-bending-machine.name"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("equipment.semi-auto-bending-machine.name"),
    ).toBeInTheDocument();
  });

  it("renders production capability numbers", async () => {
    await renderPage();
    expect(
      screen.getByText("capability.monthlyCapacity.value"),
    ).toBeInTheDocument();
    expect(screen.getByText("capability.countries.value")).toBeInTheDocument();
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
});
