/**
 * Direct invocation test for TermsContent async component.
 *
 * Covers line 146: `const page = await getPageBySlug("terms", locale as Locale)`
 * by calling TermsPage without mocking Suspense, allowing React to invoke
 * the inner TermsContent async function.
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

vi.mock("@/lib/content/render-legal-content", () => ({
  renderLegalContent: vi.fn(() =>
    React.createElement("div", { "data-testid": "legal-content" }, "Content"),
  ),
  slugifyHeading: vi.fn((text: string) =>
    text.toLowerCase().replace(/\s+/g, "-"),
  ),
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
    title: "Terms of Service",
    description: "Terms description",
  })),
}));

describe("TermsContent async invocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPageBySlug.mockResolvedValue({
      content: "## Introduction\nWelcome.\n## Acceptance\nBy using...",
      metadata: {
        publishedAt: "2024-01-01",
        updatedAt: "2024-06-01",
      },
    });

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        ({
          pageTitle: "Terms of Service",
          pageDescription: "Terms description",
          effectiveDate: "Effective Date",
          lastUpdated: "Last Updated",
          tableOfContents: "TOC",
          "sections.introduction": "Introduction",
          "sections.acceptance": "Acceptance",
          "sections.services": "Services",
          "sections.orders": "Orders",
          "sections.payment": "Payment",
          "sections.shipping": "Shipping",
          "sections.warranty": "Warranty",
          "sections.liability": "Liability",
          "sections.ip": "IP",
          "sections.confidentiality": "Confidentiality",
          "sections.termination": "Termination",
          "sections.governing": "Governing",
          "sections.disputes": "Disputes",
          "sections.contact": "Contact",
        })[key] ?? key,
    );
  });

  it("should call getPageBySlug with await in TermsContent", async () => {
    // Dynamically import to avoid Suspense mock conflicts with the other test file
    const { default: TermsPage } = await import("@/app/[locale]/terms/page");

    // Render the page - Suspense will try to resolve TermsContent
    const pageElement = await TermsPage({
      params: Promise.resolve({ locale: "en" }),
    });

    await act(async () => {
      render(pageElement);
    });

    // Verify getPageBySlug was called (proves TermsContent executed)
    expect(mockGetPageBySlug).toHaveBeenCalledWith("terms", "en");
  });
});
