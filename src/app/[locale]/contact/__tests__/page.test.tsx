import React from "react";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContactPage, { generateMetadata } from "@/app/[locale]/contact/page";
import { renderAsyncPage } from "@/testing/render-async-page";

const mockGetTranslations = vi.hoisted(() => vi.fn());

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof React>("react");
  return {
    ...actual,
    Suspense: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock("next-intl/server", () => ({
  getTranslations: mockGetTranslations,
  setRequestLocale: vi.fn(),
}));

vi.mock("next/server", () => ({
  connection: vi.fn(() => Promise.resolve()),
}));

vi.mock("next/cache", () => ({
  cacheLife: () => {
    // no-op in tests
  },
}));

vi.mock("@/components/contact/contact-form", () => ({
  ContactForm: () => <div data-testid="contact-form">Contact Form</div>,
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
    ...props
  }: React.PropsWithChildren<{
    className?: string;
    [key: string]: unknown;
  }>) => (
    <div data-testid="card" className={className} {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@/lib/contact/getContactCopy", () => ({
  getContactCopy: () =>
    Promise.resolve({
      header: {
        title: "Contact Us",
        description:
          "Get in touch with our team for inquiries, support, or partnership opportunities.",
      },
      panel: {
        contact: {
          title: "Contact Methods",
          emailLabel: "Email",
          phoneLabel: "Phone",
        },
        hours: {
          title: "Business Hours",
          weekdaysLabel: "Mon - Fri",
          saturdayLabel: "Saturday",
          sundayLabel: "Sunday",
          closedLabel: "Closed",
        },
        response: {
          title: "What to expect",
          responseTimeLabel: "Typical response",
          responseTimeValue: "Within 24 business hours",
          bestForLabel: "Best for",
          bestForValue:
            "RFQs, product specs, MOQ, samples, and lead-time questions",
          prepareLabel: "Helpful details",
          prepareValue:
            "Share product type, size/standard, quantity, destination market, and timeline",
        },
      },
    }),
}));

vi.mock("@/lib/load-messages", () => ({
  loadCriticalMessages: () => Promise.resolve({}),
  loadDeferredMessages: () => Promise.resolve({}),
}));

vi.mock("@/lib/i18n/client-messages", () => ({
  pickMessages: () => ({}),
}));

vi.mock("@/config/site-facts", () => ({
  siteFacts: {
    company: {
      established: 2018,
      employees: 60,
    },
    stats: {
      exportCountries: 100,
    },
    contact: {
      email: "hello@example.com",
      phone: "+1-555-0123",
      businessHours: { weekdays: "9:00 - 18:00", saturday: "10:00 - 16:00" },
    },
  },
}));

vi.mock("@/config/paths/site-config", () => ({
  SITE_CONFIG: {
    name: "Tianze",
    url: "https://tianze.com",
    seo: { keywords: [] },
  },
}));

vi.mock("@/lib/seo-metadata", () => ({
  generateMetadataForPath: ({
    config,
  }: {
    config: { title: string; description: string };
  }) => ({
    title: config.title,
    description: config.description,
  }),
}));

vi.mock("@/components/sections/faq-accordion", () => ({
  FaqAccordion: ({
    items,
  }: {
    items: Array<{ key: string; question: string; answer: string }>;
  }) => (
    <section data-testid="faq-accordion">
      {items.map((item) => (
        <div key={item.key} data-testid={`faq-item-${item.key}`}>
          {item.question}
        </div>
      ))}
    </section>
  ),
}));

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/app/[locale]/generate-static-params", () => ({
  generateLocaleStaticParams: () => [{ locale: "en" }, { locale: "zh" }],
}));

describe("ContactPage", () => {
  const defaultTranslations = {
    title: "Contact Us",
    description:
      "Get in touch with our team for inquiries, support, or partnership opportunities.",
  } as const;

  const mockParams = { locale: "en" };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTranslations.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );
  });

  it("renders the current contact page truth", async () => {
    const page = await ContactPage({ params: Promise.resolve(mockParams) });
    await renderAsyncPage(page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Contact Us",
    );
    expect(
      screen.getByText(
        "Get in touch with our team for inquiries, support, or partnership opportunities.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
    expect(screen.getAllByTestId("card")).toHaveLength(2);
    expect(screen.getByTestId("faq-accordion")).toBeInTheDocument();
    expect(screen.getByText("Contact Methods")).toBeInTheDocument();
    expect(screen.getByText("Business Hours")).toBeInTheDocument();
  });

  it("generates stable metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve(mockParams),
    });

    expect(metadata).toHaveProperty("title", "Contact Us");
    expect(metadata).toHaveProperty(
      "description",
      "Get in touch with our team for inquiries, support, or partnership opportunities.",
    );
    expect(metadata).toHaveProperty("other.google", "notranslate");
  });

  it("keeps rendering when translation loading fails inside content", async () => {
    mockGetTranslations.mockRejectedValue(new Error("Translation error"));

    const page = await ContactPage({ params: Promise.resolve(mockParams) });

    await expect(renderAsyncPage(page)).resolves.toBeDefined();
  });

  it("still rejects when params resolution itself fails", async () => {
    const invalidParams = Promise.reject(new Error("Params error"));

    await expect(ContactPage({ params: invalidParams })).rejects.toThrow(
      "Params error",
    );
  });
});
