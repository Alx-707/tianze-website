import type { PropsWithChildren } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactPage, { generateMetadata } from "@/app/[locale]/contact/page";

const {
  mockGenerateMetadataForPath,
  mockGetContactCopy,
  mockGetMessages,
  mockGetPageBySlug,
  mockSetRequestLocale,
} = vi.hoisted(() => ({
  mockGenerateMetadataForPath: vi.fn(),
  mockGetContactCopy: vi.fn(),
  mockGetMessages: vi.fn(),
  mockGetPageBySlug: vi.fn(),
  mockSetRequestLocale: vi.fn(),
}));

const contactPage = {
  metadata: {
    title: "Contact Us",
    description: "Get in touch with Tianze Pipe.",
    slug: "contact",
    publishedAt: "2024-01-01",
    seo: {
      title: "Contact Tianze Pipe | Get a Quote",
      description: "Contact our sales team within 24 hours.",
    },
    faq: [
      {
        id: "moq",
        question: "What is your MOQ?",
        answer: "MOQ depends on SKU.",
      },
    ],
  },
  content: "## Get in Touch\n\nMDX contact body.",
  slug: "contact",
  filePath: "content/pages/en/contact.mdx",
};

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

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: PropsWithChildren) => (
    <div data-testid="intl-provider">{children}</div>
  ),
}));

vi.mock("next-intl/server", () => ({
  getMessages: mockGetMessages,
  setRequestLocale: mockSetRequestLocale,
}));

vi.mock("@/components/contact/contact-form", () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>,
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

vi.mock("@/lib/content", () => ({
  getPageBySlug: mockGetPageBySlug,
}));

vi.mock("@/lib/content/render-legal-content", () => ({
  renderLegalContent: (content: string) => (
    <div data-testid="mdx-body">{content}</div>
  ),
}));

vi.mock("@/lib/contact/getContactCopy", () => ({
  getContactCopy: mockGetContactCopy,
}));

vi.mock("@/lib/seo-metadata", () => ({
  generateMetadataForPath: mockGenerateMetadataForPath,
}));

describe("ContactPage MDX migration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPageBySlug.mockResolvedValue(contactPage);
    mockGetMessages.mockResolvedValue({ contact: {}, apiErrors: {} });
    mockGetContactCopy.mockResolvedValue(contactCopy);
    mockGenerateMetadataForPath.mockReturnValue({
      title: "Contact Tianze Pipe | Get a Quote",
      description: "Contact our sales team within 24 hours.",
      other: {},
    });
  });

  it("renders hero and body from MDX while keeping the form provider", async () => {
    const page = await ContactPage({
      params: Promise.resolve({ locale: "en" }),
    });

    render(page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Contact Us",
    );
    expect(screen.getByTestId("mdx-body")).toHaveTextContent(
      "MDX contact body.",
    );
    expect(screen.getByTestId("intl-provider")).toBeInTheDocument();
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("renders FAQ from MDX frontmatter", async () => {
    const page = await ContactPage({
      params: Promise.resolve({ locale: "en" }),
    });

    render(page);

    expect(screen.getByTestId("faq-section")).toHaveTextContent(
      "What is your MOQ?",
    );
  });

  it("uses MDX metadata for SEO", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en" }),
    });

    expect(mockGetPageBySlug).toHaveBeenCalledWith("contact", "en");
    expect(mockGenerateMetadataForPath).toHaveBeenCalledWith({
      locale: "en",
      pageType: "contact",
      path: "/contact",
      config: {
        title: "Contact Tianze Pipe | Get a Quote",
        description: "Contact our sales team within 24 hours.",
      },
    });
    expect(metadata).toMatchObject({
      title: "Contact Tianze Pipe | Get a Quote",
      description: "Contact our sales team within 24 hours.",
      other: { google: "notranslate" },
    });
  });
});
