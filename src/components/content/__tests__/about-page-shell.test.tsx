import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AboutPageShell } from "../about-page-shell";
import type { PageMetadata } from "@/types/content.types";

vi.mock("@/components/mdx/mdx-content", () => ({
  MDXContent: (props: { slug: string }) => (
    <div data-testid="mdx-content">{props.slug}</div>
  ),
}));

vi.mock("@/components/seo", () => ({
  JsonLdScript: ({ data }: { data: unknown }) => (
    <script
      data-testid="about-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  ),
}));

vi.mock("@/components/sections/faq-section", () => ({
  FaqSection: ({ faqItems }: { faqItems: unknown[] }) => (
    <div data-testid="faq-section">FAQ ({faqItems.length})</div>
  ),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

const baseMetadata: PageMetadata = {
  title: "About Tianze Pipe",
  description: "Leading PVC conduit manufacturer",
  slug: "about",
  publishedAt: "2024-01-01",
  heroTitle: "Our Story",
  heroSubtitle: "Pipe Bending Experts",
  heroDescription: "Factory-owned production since 2018.",
  aboutSections: {
    valuesTitle: "Manufacturing Excellence",
    values: {
      quality: {
        title: "Precision Engineering",
        description: "Consistent production control.",
      },
      innovation: {
        title: "In-House R&D",
        description: "Factory-owned process development.",
      },
      service: {
        title: "Technical Support",
        description: "Buyer support from sample to export.",
      },
      integrity: {
        title: "Certified Quality",
        description: "Traceable batches and standards matching.",
      },
    },
    statLabels: {
      yearsExperience: "Years Experience",
      countriesServed: "Export Countries",
      happyClients: "Team Members",
      productsDelivered: "Factory Area (Acres)",
    },
    cta: {
      title: "Partner With Pipe Bending Experts",
      description: "Discuss your project with our team.",
      button: "Request Quote",
    },
  },
  faq: [
    {
      id: "manufacturer",
      question: "Are you a manufacturer?",
      answer: "{companyName} is a direct manufacturer.",
    },
  ],
};

describe("AboutPageShell", () => {
  it("renders hero section with metadata", () => {
    render(
      <AboutPageShell
        metadata={baseMetadata}
        content="## Body"
        locale="en"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Our Story" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pipe Bending Experts")).toBeInTheDocument();
    expect(
      screen.getByText("Factory-owned production since 2018."),
    ).toBeInTheDocument();
  });

  it("renders value cards and stat items", () => {
    render(
      <AboutPageShell
        metadata={baseMetadata}
        content="## Body"
        locale="en"
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Manufacturing Excellence" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Precision Engineering")).toBeInTheDocument();
  });

  it("renders FAQ section when faq items present", () => {
    render(
      <AboutPageShell
        metadata={baseMetadata}
        content="## Body"
        locale="en"
      />,
    );

    expect(screen.getByTestId("faq-section")).toBeInTheDocument();
  });

  it("omits FAQ section when faq is empty", () => {
    const noFaqMetadata = { ...baseMetadata, faq: [] };
    render(
      <AboutPageShell
        metadata={noFaqMetadata}
        content="## Body"
        locale="en"
      />,
    );

    expect(screen.queryByTestId("faq-section")).not.toBeInTheDocument();
  });

  it("omits MDX article when content is empty", () => {
    render(
      <AboutPageShell metadata={baseMetadata} content="  " locale="en" />,
    );

    expect(screen.queryByTestId("mdx-content")).not.toBeInTheDocument();
  });

  it("renders CTA with link to contact page", () => {
    render(
      <AboutPageShell
        metadata={baseMetadata}
        content="## Body"
        locale="en"
      />,
    );

    const ctaLink = screen.getByRole("link", { name: /request quote/i });
    expect(ctaLink).toHaveAttribute("href", "/contact");
  });

  it("falls back to title when heroTitle is absent", () => {
    const { heroTitle: _ht, heroSubtitle: _hs, heroDescription: _hd, ...rest } =
      baseMetadata;
    const noHeroMetadata: PageMetadata = rest;
    render(
      <AboutPageShell
        metadata={noHeroMetadata}
        content="## Body"
        locale="en"
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "About Tianze Pipe",
      }),
    ).toBeInTheDocument();
  });

  it("renders structured data script", () => {
    render(
      <AboutPageShell
        metadata={baseMetadata}
        content="## Body"
        locale="en"
      />,
    );

    const script = screen.getByTestId("about-schema");
    const data = JSON.parse(script.innerHTML);
    expect(data["@type"]).toBe("AboutPage");
    expect(data.name).toBe("About Tianze Pipe");
  });
});
