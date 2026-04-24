import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AboutPage, { generateMetadata, generateStaticParams } from "../page";

const {
  mockGenerateLocaleStaticParams,
  mockGenerateMetadataForPath,
  mockGetPageBySlug,
  mockSetRequestLocale,
} = vi.hoisted(() => ({
  mockGenerateLocaleStaticParams: vi.fn(),
  mockGenerateMetadataForPath: vi.fn(),
  mockGetPageBySlug: vi.fn(),
  mockSetRequestLocale: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof React>("react");

  return {
    ...actual,
    Suspense: ({ fallback }: { fallback: React.ReactNode }) => <>{fallback}</>,
  };
});

vi.mock("next-intl/server", () => ({
  setRequestLocale: mockSetRequestLocale,
}));

vi.mock("@/app/[locale]/generate-static-params", () => ({
  generateLocaleStaticParams: mockGenerateLocaleStaticParams,
}));

vi.mock("@/components/content/about-page-shell", () => ({
  AboutPageShell: () => <main data-testid="about-shell" />,
}));

vi.mock("@/lib/content", () => ({
  getPageBySlug: mockGetPageBySlug,
}));

vi.mock("@/lib/seo-metadata", () => ({
  generateMetadataForPath: mockGenerateMetadataForPath,
}));

describe("AboutPage", () => {
  const page = {
    metadata: {
      title: "About Tianze Pipe",
      description: "MDX fallback description",
      slug: "about",
      publishedAt: "2024-01-10",
      seo: {
        title: "About Tianze Pipe SEO",
        description: "MDX SEO description",
        ogImage: "/images/about-og.jpg",
      },
      heroTitle: "About Tianze Pipe",
      heroSubtitle: "Pipe Bending Experts",
      heroDescription: "Factory-owned production and export support.",
      faq: [
        {
          id: "manufacturer",
          question: "Are you a manufacturer?",
          answer: "{companyName} is a direct manufacturer.",
        },
      ],
    },
    content: "## Who We Are\n\nMDX body content.",
    slug: "about",
    filePath: "content/pages/en/about.mdx",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateLocaleStaticParams.mockReturnValue([
      { locale: "en" },
      { locale: "zh" },
    ]);
    mockGenerateMetadataForPath.mockReturnValue({
      title: "About Tianze Pipe SEO",
      description: "MDX SEO description",
    });
    mockGetPageBySlug.mockResolvedValue(page);
  });

  it("returns locale static params", () => {
    expect(generateStaticParams()).toEqual([
      { locale: "en" },
      { locale: "zh" },
    ]);
    expect(mockGenerateLocaleStaticParams).toHaveBeenCalledTimes(1);
  });

  it("builds metadata from MDX page metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(mockGetPageBySlug).toHaveBeenCalledWith("about", "en");
    expect(mockGenerateMetadataForPath).toHaveBeenCalledWith({
      locale: "en",
      pageType: "about",
      path: "/about",
      config: {
        title: "About Tianze Pipe SEO",
        description: "MDX SEO description",
        image: "/images/about-og.jpg",
      },
    });
    expect(metadata).toEqual({
      title: "About Tianze Pipe SEO",
      description: "MDX SEO description",
    });
  });

  it("falls back to base MDX title and description when SEO fields are absent", async () => {
    mockGetPageBySlug.mockResolvedValueOnce({
      ...page,
      metadata: {
        ...page.metadata,
        seo: {},
      },
    });

    await generateMetadata({ params: Promise.resolve({ locale: "zh" }) });

    expect(mockGenerateMetadataForPath).toHaveBeenCalledWith({
      locale: "zh",
      pageType: "about",
      path: "/about",
      config: {
        title: "About Tianze Pipe",
        description: "MDX fallback description",
      },
    });
  });

  it("renders the loading shell while the MDX-backed page content resolves", async () => {
    const element = await AboutPage({
      params: Promise.resolve({ locale: "en" }),
    });

    const { container } = render(element);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(
      0,
    );
  });

  it("propagates params errors", async () => {
    await expect(
      AboutPage({ params: Promise.reject(new Error("Params error")) }),
    ).rejects.toThrow("Params error");
  });
});
