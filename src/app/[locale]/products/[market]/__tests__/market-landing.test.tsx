import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockNotFound = vi.fn();
const mockGetTranslations = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: () => {
    mockNotFound();
    throw new Error("NEXT_NOT_FOUND");
  },
}));

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
  routing: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },
}));

vi.mock("@/config/paths", () => ({
  SITE_CONFIG: {
    name: "Tianze Pipe",
    baseUrl: "https://www.tianze-pipe.com",
    seo: {
      defaultTitle: "Tianze Pipe",
      defaultDescription: "PVC conduit fittings manufacturer",
      keywords: ["PVC conduit fittings"],
    },
  },
  LOCALES_CONFIG: {
    locales: ["en", "zh"],
    defaultLocale: "en",
  },
  PATHS_CONFIG: {
    pages: {
      products: "/products",
    },
  },
  getLocalizedPath: (pageType: string) =>
    pageType === "products" ? "/products" : "/",
}));

vi.mock("@/components/products/catalog-breadcrumb", () => ({
  CatalogBreadcrumb: () => <nav aria-label="breadcrumb">Breadcrumb</nav>,
}));

vi.mock("@/components/products/family-section", () => ({
  FamilySection: ({
    family,
    familyLabel,
  }: {
    family: { slug: string; label: string };
    familyLabel: string;
  }) => <div data-testid={`family-${family.slug}`}>{familyLabel}</div>,
}));

vi.mock("@/components/products/sticky-family-nav", () => ({
  StickyFamilyNav: () => <nav data-testid="sticky-nav">nav</nav>,
}));

vi.mock("@/components/sections/faq-section", () => ({
  FaqSection: () => <section data-testid="faq-section">FAQ</section>,
}));

vi.mock("@/components/products/product-specs", () => ({
  ProductSpecs: ({ title }: { title?: string }) => (
    <div data-testid="product-specs">{title}</div>
  ),
  ProductCertifications: ({ title }: { title?: string }) => (
    <div data-testid="product-certifications">{title}</div>
  ),
  ProductTradeInfo: ({ title }: { title?: string }) => (
    <div data-testid="product-trade-info">{title}</div>
  ),
}));

const MOCK_TRANSLATIONS: Record<string, string> = {
  "markets.north-america.label": "UL / ASTM Series",
  "markets.north-america.description":
    "PVC conduit fittings engineered to UL 651 and ASTM D1785 standards for North American applications.",
  "markets.australia-new-zealand.label": "AS/NZS 2053 Series",
  "markets.australia-new-zealand.description":
    "PVC conduit fittings complying with AS/NZS 2053 standards for Australian and New Zealand markets.",
  "markets.mexico.label": "NOM Series",
  "markets.mexico.description":
    "PVC conduit fittings meeting Mexico NOM standards for electrical conduit systems.",
  "markets.europe.label": "IEC Series",
  "markets.europe.description":
    "PVC conduit fittings complying with IEC 61084 standards for European markets.",
  "markets.pneumatic-tube-systems.label": "PETG Pneumatic Tubes",
  "markets.pneumatic-tube-systems.description":
    "High-performance PETG tubes designed for pneumatic conveying systems.",
  "market.technical.title": "Technical Properties",
  "market.certifications.title": "Certifications & Compliance",
  "market.trade.title": "Trade Information",
  "market.trade.moq": "Minimum Order",
  "market.trade.leadTime": "Lead Time",
  "market.trade.supplyCapacity": "Supply Capacity",
  "market.trade.packaging": "Packaging",
  "market.trade.portOfLoading": "Port of Loading",
  "market.cta.heading": "Need {marketLabel} conduit fittings?",
  "market.cta.description":
    "Request a quote or ask about specifications, MOQ, and lead times.",
  "market.cta.button": "Request a Quote",
};

describe("Market Landing Page", () => {
  beforeEach(() => {
    vi.resetModules();
    mockNotFound.mockClear();
    mockGetTranslations.mockReset();
    mockGetTranslations.mockResolvedValue(
      (key: string, params?: Record<string, string>) => {
        let value = MOCK_TRANSLATIONS[key] ?? key;
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            value = value.replace(`{${k}}`, v);
          }
        }
        return value;
      },
    );
  });

  async function renderPage(market: string, locale = "en") {
    const { default: MarketPage } = await import("../page");
    const page = await MarketPage({
      params: Promise.resolve({ locale, market }),
    });
    return render(page);
  }

  async function generatePageMetadata(market: string, locale = "en") {
    const { generateMetadata } = await import("../page");
    return generateMetadata({
      params: Promise.resolve({ locale, market }),
    });
  }

  describe("Scenario 1.1: Page renders with title and standard label", () => {
    it("renders the market title as h1 and standard label badge", async () => {
      await renderPage("north-america");

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("UL / ASTM Series");
      expect(screen.getByText("UL 651 / ASTM D1785")).toBeInTheDocument();
    });

    it("renders the market description", async () => {
      await renderPage("north-america");

      expect(
        screen.getByText(/PVC conduit fittings engineered to UL 651/),
      ).toBeInTheDocument();
    });

    it("renders the protected page content wrapper", async () => {
      await renderPage("north-america");

      const pageContent = screen.getByTestId("market-page-content");
      expect(pageContent).toHaveClass("notranslate");
      expect(pageContent).toHaveAttribute("translate", "no");
    });
  });

  describe("metadata", () => {
    it("uses central path-aware metadata with x-default alternates", async () => {
      const metadata = await generatePageMetadata("north-america");

      expect(metadata).toMatchObject({
        title: "UL / ASTM Series | Tianze Pipe",
        description:
          "PVC conduit fittings engineered to UL 651 and ASTM D1785 standards for North American applications.",
        alternates: {
          canonical: "https://www.tianze-pipe.com/en/products/north-america",
          languages: {
            en: "https://www.tianze-pipe.com/en/products/north-america",
            zh: "https://www.tianze-pipe.com/zh/products/north-america",
            "x-default":
              "https://www.tianze-pipe.com/en/products/north-america",
          },
        },
      });
    });
  });

  describe("Scenario 1.2: Family sections rendered", () => {
    it("renders 3 family sections for north-america", async () => {
      await renderPage("north-america");

      expect(
        screen.getByTestId("family-conduit-sweeps-elbows"),
      ).toBeInTheDocument();
      expect(screen.getByTestId("family-couplings")).toBeInTheDocument();
      expect(screen.getByTestId("family-conduit-pipes")).toBeInTheDocument();
    });

    it("renders sticky family nav", async () => {
      await renderPage("north-america");
      expect(screen.getByTestId("sticky-nav")).toBeInTheDocument();
    });
  });

  describe("Scenario 1.6: Trust signals are present", () => {
    it("renders technical specs section for market with spec data", async () => {
      await renderPage("north-america");
      expect(screen.getByTestId("product-specs")).toHaveTextContent(
        "Technical Properties",
      );
    });

    it("renders certifications section for market with spec data", async () => {
      await renderPage("north-america");
      expect(screen.getByTestId("product-certifications")).toHaveTextContent(
        "Certifications & Compliance",
      );
    });

    it("renders trade info section for market with spec data", async () => {
      await renderPage("north-america");
      expect(screen.getByTestId("product-trade-info")).toHaveTextContent(
        "Trade Information",
      );
    });

    it("renders trust signals for mexico market", async () => {
      await renderPage("mexico");

      expect(screen.getByTestId("product-specs")).toBeInTheDocument();
      expect(screen.getByTestId("product-certifications")).toBeInTheDocument();
      expect(screen.getByTestId("product-trade-info")).toBeInTheDocument();
    });
  });

  describe("Scenario 1.7: CTA links to /contact", () => {
    it("renders CTA section with link to /contact", async () => {
      await renderPage("north-america");

      const ctaLink = screen.getByRole("link", { name: /request a quote/i });
      expect(ctaLink).toHaveAttribute("href", "/contact");
    });

    it("renders CTA heading with market label", async () => {
      await renderPage("north-america");

      expect(
        screen.getByText("Need UL / ASTM Series conduit fittings?"),
      ).toBeInTheDocument();
    });
  });

  describe("Scenario 1.10: Invalid market slug calls notFound", () => {
    it("calls notFound for invalid market slug", async () => {
      await expect(renderPage("invalid-market")).rejects.toThrow(
        "NEXT_NOT_FOUND",
      );
      expect(mockNotFound).toHaveBeenCalled();
    });
  });

  describe("Breadcrumb", () => {
    it("renders breadcrumb navigation", async () => {
      await renderPage("north-america");
      expect(screen.getByLabelText("breadcrumb")).toBeInTheDocument();
    });
  });

  describe("Scenario: AU/NZ market renders with spec data", () => {
    it("renders family sections for AU/NZ", async () => {
      await renderPage("australia-new-zealand");

      expect(screen.getByTestId("family-conduit-bends")).toBeInTheDocument();
      expect(screen.getByTestId("family-bellmouths")).toBeInTheDocument();
    });

    it("renders trust signals for AU/NZ", async () => {
      await renderPage("australia-new-zealand");

      expect(screen.getByTestId("product-specs")).toBeInTheDocument();
      expect(screen.getByTestId("product-certifications")).toBeInTheDocument();
      expect(screen.getByTestId("product-trade-info")).toBeInTheDocument();
    });

    it("renders sticky family navigation when spec data exists", async () => {
      await renderPage("australia-new-zealand");

      expect(screen.getByTestId("sticky-nav")).toBeInTheDocument();
    });
  });
});
