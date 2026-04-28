import React from "react";
import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setRequestLocale } from "next-intl/server";
import ContactPage, { generateMetadata } from "@/app/[locale]/contact/page";
import { renderAsyncPage } from "@/testing/render-async-page";

const { mockGetContactCopyFromMessages } = vi.hoisted(() => ({
  mockGetContactCopyFromMessages: vi.fn(),
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof React>("react");

  return {
    ...actual,
    Suspense: ({
      children,
      fallback,
    }: {
      children: React.ReactNode;
      fallback?: React.ReactNode;
    }) => (
      <section data-testid="suspense-boundary">
        {fallback ? (
          <div data-testid="suspense-fallback">{fallback}</div>
        ) : null}
        {children}
      </section>
    ),
  };
});

const contactCopy = {
  header: {
    title: "Legacy Contact",
    description: "Legacy description",
  },
  panel: {
    contact: {
      title: "Contact Methods",
      emailLabel: "Email",
      phoneLabel: "Phone",
    },
    response: {
      title: "Response Time",
      responseTimeLabel: "Response",
      responseTimeValue: "Within 24 hours",
      bestForLabel: "Best for",
      bestForValue: "Quotes",
      prepareLabel: "Prepare",
      prepareValue: "Product specs",
    },
    hours: {
      title: "Business Hours",
      weekdaysLabel: "Weekdays",
      saturdayLabel: "Saturday",
      sundayLabel: "Sunday",
      closedLabel: "Closed",
    },
  },
};

vi.mock("@/components/contact/contact-form", () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>,
}));

vi.mock("@/components/contact/contact-form-island", () => ({
  ContactFormIsland: ({ fallback }: { fallback: React.ReactNode }) => (
    <section data-testid="contact-form-island">
      {fallback}
      <div data-testid="contact-form">Contact Form</div>
    </section>
  ),
}));

vi.mock("@/components/sections/faq-section", () => ({
  FaqSection: ({
    faqItems,
  }: {
    faqItems: Array<{ id: string; question: string }>;
  }) => (
    <section data-testid="faq-section">
      {faqItems.map((item) => (
        <div key={item.id}>{item.question}</div>
      ))}
    </section>
  ),
}));

vi.mock("@/lib/content/render-legal-content", () => ({
  renderLegalContent: (content: string) => (
    <div data-testid="mdx-body">{content}</div>
  ),
}));

vi.mock("@/lib/contact/getContactCopy", () => ({
  getContactCopyFromMessages: mockGetContactCopyFromMessages,
}));

describe("ContactPage MDX migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetContactCopyFromMessages.mockReturnValue(contactCopy);
  });

  it("renders hero and body from MDX while keeping the form", async () => {
    const page = await ContactPage({
      params: Promise.resolve({ locale: "en" }),
    });

    await renderAsyncPage(page as React.JSX.Element);

    const content = await screen.findByTestId("contact-page-content");

    expect(
      within(content).getByRole("heading", { level: 1 }),
    ).toHaveTextContent("Contact Us");
    expect(screen.getByTestId("mdx-body")).toBeInTheDocument();
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("wraps the whole contact body in a Suspense fallback for Cloudflare prerender isolation", async () => {
    const page = await ContactPage({
      params: Promise.resolve({ locale: "en" }),
    });

    await renderAsyncPage(page as React.JSX.Element);

    expect(screen.getByTestId("contact-page-fallback")).toBeInTheDocument();
    expect(screen.getByTestId("contact-page-content")).toBeInTheDocument();
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("sets the request locale in the page entry before rendering contact content", async () => {
    await ContactPage({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(vi.mocked(setRequestLocale)).toHaveBeenCalledWith("en");
  });

  it("renders localized contact panel copy from the top-level contact namespace", async () => {
    const actualContactCopy = await vi.importActual<
      typeof import("@/lib/contact/getContactCopy")
    >("@/lib/contact/getContactCopy");
    mockGetContactCopyFromMessages.mockImplementation(
      actualContactCopy.getContactCopyFromMessages,
    );

    const page = await ContactPage({
      params: Promise.resolve({ locale: "zh" }),
    });

    await renderAsyncPage(page as React.JSX.Element);

    expect(
      screen.getByRole("heading", { name: "联系方式" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "联系后会发生什么" }),
    ).toBeInTheDocument();
    expect(screen.getByText("工作日 24 小时内")).toBeInTheDocument();
    expect(screen.getByText("建议提供")).toBeInTheDocument();
  });

  it("renders FAQ from MDX frontmatter", async () => {
    const page = await ContactPage({
      params: Promise.resolve({ locale: "en" }),
    });

    await renderAsyncPage(page as React.JSX.Element);

    expect(await screen.findByTestId("faq-section")).toHaveTextContent(
      "What is your minimum order quantity",
    );
  });

  it("builds contact metadata from the static content manifest", async () => {
    const enMetadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });
    const zhMetadata = await generateMetadata({
      params: Promise.resolve({ locale: "zh" }),
    });

    expect(enMetadata.title).toBe("Contact Tianze Pipe | Get a Quote");
    expect(enMetadata.description).toBe(
      "Contact our sales team for PVC conduit fittings inquiries, OEM manufacturing requests, or technical support. Quick response within 24 hours.",
    );
    expect(zhMetadata.title).toBe("联系 Tianze Pipe | 获取报价");
    expect(zhMetadata.description).toBe(
      "联系天泽销售团队，咨询 PVC 电工套管配件、OEM 定制制造或技术支持。通常 24 小时内响应。",
    );
  });
});
