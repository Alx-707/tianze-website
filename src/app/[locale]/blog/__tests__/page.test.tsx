import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mockTranslations = {
  title: "Blog",
  eyebrow: "Buyer resources",
  description:
    "Practical notes for distributors and project buyers evaluating PVC conduit fittings, PETG pneumatic tubes, and factory partners.",
  intro:
    "Use these notes to prepare clearer specifications and shorten supplier evaluation.",
  topicsTitle: "Topics we are preparing",
  contactCta: "Ask us a product question",
  "topics.standards.label": "Standards",
  "topics.standards.title": "PVC conduit fitting standards by market",
  "topics.standards.description":
    "How UL / ASTM, AS/NZS, NOM, and IEC expectations affect product selection.",
  "topics.inquiry.label": "Inquiry prep",
  "topics.inquiry.title": "What to prepare before requesting a quote",
  "topics.inquiry.description":
    "Diameter, bend radius, wall thickness, certification, packaging, and sample expectations.",
  "topics.pneumatic.label": "PETG tubes",
  "topics.pneumatic.title": "PETG pneumatic tube selection notes",
  "topics.pneumatic.description":
    "Basic selection points for hospital logistics pneumatic tube projects.",
} as const;

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(
    async () => (key: string) =>
      mockTranslations[key as keyof typeof mockTranslations] || key,
  ),
  setRequestLocale: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  routing: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },
}));

vi.mock("@/lib/seo-metadata", () => ({
  generateMetadataForPath: vi.fn(async () => ({
    title: "Blog",
    description: "Blog page",
  })),
}));

vi.mock("@/components/seo", () => ({
  JsonLdGraphScript: () => <script type="application/ld+json" />,
  JsonLdScript: () => <script type="application/ld+json" />,
}));

describe("Blog Page", () => {
  it("renders the restored blog listing page with prepared topic cards", async () => {
    const { default: BlogPage } = await import("../page");
    const page = await BlogPage({
      params: Promise.resolve({ locale: "en" }),
    });
    render(page);

    expect(
      screen.getByRole("heading", { level: 1, name: "Blog" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Topics we are preparing")).toBeInTheDocument();
    expect(
      screen.getByText("PVC conduit fitting standards by market"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("What to prepare before requesting a quote"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("PETG pneumatic tube selection notes"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Ask us a product question" }),
    ).toHaveAttribute("href", "/contact");
  });
});
