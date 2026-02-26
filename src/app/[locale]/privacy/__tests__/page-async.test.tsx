/**
 * Direct invocation test for PrivacyContent async component.
 *
 * Covers line 269: `const page = await getPageBySlug("privacy", locale as Locale)`
 * by rendering without mocking Suspense, allowing React to invoke PrivacyContent.
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
    title: "Privacy Policy",
    description: "Privacy description",
  })),
}));

vi.mock("@/lib/content/render-legal-content", () => ({
  renderLegalContent: vi.fn(() =>
    React.createElement("div", { "data-testid": "legal-content" }, "Content"),
  ),
  slugifyHeading: vi.fn((text: string) =>
    text.toLowerCase().replace(/\s+/g, "-"),
  ),
}));

describe("PrivacyContent async invocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetPageBySlug.mockResolvedValue({
      content:
        "## Information We Collect\nWe collect data.\n## How We Use\nWe use data.",
      metadata: {
        slug: "privacy",
        title: "Privacy Policy",
        publishedAt: "2024-01-01",
        updatedAt: "2024-02-01",
      },
    });

    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        ({
          pageTitle: "Privacy Policy",
          pageDescription: "How we handle your data",
          effectiveDate: "Effective Date",
          lastUpdated: "Last Updated",
          tableOfContents: "TOC",
          "sections.informationCollected": "Information We Collect",
          "sections.howWeUse": "How We Use",
        })[key] ?? key,
    );
  });

  it("should call getPageBySlug with await in PrivacyContent", async () => {
    const { default: PrivacyPage } =
      await import("@/app/[locale]/privacy/page");

    const pageElement = await PrivacyPage({
      params: Promise.resolve({ locale: "en" }),
    });

    await act(async () => {
      render(pageElement);
    });

    expect(mockGetPageBySlug).toHaveBeenCalledWith("privacy", "en");
  });
});
