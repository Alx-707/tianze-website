/**
 * Direct invocation test for FaqContent async component.
 *
 * Covers line 147: `const page = await getPageBySlug("faq", locale as Locale)`
 * by rendering without mocking Suspense, allowing React to invoke FaqContent.
 */
import React from "react";
import { render, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetTranslations, mockGetPageBySlug } = vi.hoisted(() => ({
  mockGetTranslations: vi.fn(),
  mockGetPageBySlug: vi.fn(),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: vi.fn(),
}));

vi.mock("@/lib/content", () => ({
  getPageBySlug: mockGetPageBySlug,
}));

vi.mock("@/lib/structured-data", () => ({
  generateFAQSchema: vi.fn(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [],
  })),
}));

vi.mock("@/components/seo", () => ({
  JsonLdScript: vi.fn(({ data }: { data: Record<string, unknown> }) =>
    React.createElement("script", {
      type: "application/ld+json",
      dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
    }),
  ),
}));

vi.mock("@/app/[locale]/generate-static-params", () => ({
  generateLocaleStaticParams: () => [{ locale: "en" }, { locale: "zh" }],
}));

vi.mock("@/lib/seo-metadata", () => ({
  generateMetadataForPath: vi.fn(() => ({
    title: "FAQ",
    description: "FAQ description",
  })),
}));

describe("FaqContent async invocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPageBySlug.mockResolvedValue({
      content:
        "## Ordering\n### How to order?\nContact us.\n## Shipping\n### Options?\nSea or air.",
      metadata: { slug: "faq", title: "FAQ" },
    });

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        ({
          pageTitle: "FAQ",
          pageDescription: "Frequently asked questions",
          noResults: "No results",
          "contactCta.title": "Still have questions?",
          "contactCta.description": "Contact us",
          "contactCta.button": "Contact",
        })[key] ?? key,
    );
  });

  it("should call getPageBySlug with await in FaqContent", async () => {
    const { default: FaqPage } = await import("@/app/[locale]/faq/page");

    const pageElement = await FaqPage({
      params: Promise.resolve({ locale: "en" }),
    });

    await act(async () => {
      render(pageElement);
    });

    expect(mockGetPageBySlug).toHaveBeenCalledWith("faq", "en");
  });
});
