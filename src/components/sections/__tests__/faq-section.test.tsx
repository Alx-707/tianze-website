import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// Override global next-intl/server mock with FAQ-specific translations
vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(() =>
    Promise.resolve((key: string) => {
      const translations: Record<string, string> = {
        sectionTitle: "Frequently Asked Questions",
        "items.moq.question": "What is the minimum order quantity (MOQ)?",
        "items.moq.answer": "Our MOQ is typically 500 to 1,000 pieces.",
        "items.leadTime.question": "What is the lead time?",
        "items.leadTime.answer": "15 to 30 days.",
      };
      return translations[key] ?? key;
    }),
  ),
  setRequestLocale: vi.fn(),
}));

// Mock structured data
vi.mock("@/lib/structured-data", () => ({
  generateFAQSchema: vi.fn(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [],
  })),
}));

vi.mock("@/components/seo", () => ({
  JsonLdScript: ({ data }: { data: unknown }) =>
    React.createElement("script", {
      "data-testid": "faq-schema",
      type: "application/ld+json",
      dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
    }),
}));

describe("Feature: FaqSection Reusable Component", () => {
  async function renderFaqSection(
    props?: Partial<{ items: string[]; title: string; locale: "en" | "zh" }>,
  ) {
    const { FaqSection } = await import("@/components/sections/faq-section");
    const element = await FaqSection({
      items: props?.items ?? ["moq", "leadTime"],
      title: props?.title ?? "Frequently Asked Questions",
      locale: props?.locale ?? "en",
    });
    return render(element);
  }

  describe("Scenario 1.1: renders title via SectionHead", () => {
    it("displays the section title", async () => {
      await renderFaqSection();
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Frequently Asked Questions",
      );
    });

    it("has a section-divider border at the top", async () => {
      const { container } = await renderFaqSection();
      const section = container.querySelector("section");
      expect(section?.className).toContain("section-divider");
    });
  });

  describe("Scenario 1.2: renders accordion items from translation keys", () => {
    it("renders the correct number of accordion items", async () => {
      await renderFaqSection({ items: ["moq", "leadTime"] });
      const triggers = screen.getAllByRole("button");
      expect(triggers).toHaveLength(2);
    });

    it("displays question text for each item", async () => {
      await renderFaqSection({ items: ["moq"] });
      expect(
        screen.getByText("What is the minimum order quantity (MOQ)?"),
      ).toBeInTheDocument();
    });
  });

  describe("Scenario 1.3: Buyer expands a question", () => {
    it("expands answer when question is clicked", async () => {
      await renderFaqSection({ items: ["moq"] });
      const trigger = screen.getByText(
        "What is the minimum order quantity (MOQ)?",
      );
      await userEvent.click(trigger);
      expect(screen.getByText(/500 to 1,000 pieces/)).toBeVisible();
    });
  });

  describe("Scenario 1.4: Multiple questions open simultaneously", () => {
    it("keeps both questions expanded", async () => {
      await renderFaqSection({ items: ["moq", "leadTime"] });
      await userEvent.click(
        screen.getByText("What is the minimum order quantity (MOQ)?"),
      );
      await userEvent.click(screen.getByText("What is the lead time?"));
      expect(screen.getByText(/500 to 1,000 pieces/)).toBeVisible();
      expect(screen.getByText(/15 to 30 days/)).toBeVisible();
    });
  });

  describe("Scenario 1.5: Keyboard navigation", () => {
    it("toggles accordion with Enter key", async () => {
      await renderFaqSection({ items: ["moq"] });
      const trigger = screen.getByText(
        "What is the minimum order quantity (MOQ)?",
      );
      trigger.focus();
      await userEvent.keyboard("{Enter}");
      expect(screen.getByText(/500 to 1,000 pieces/)).toBeVisible();
    });
  });

  describe("Scenario 1.6: generates FAQ Schema", () => {
    it("renders JSON-LD script with FAQPage schema", async () => {
      await renderFaqSection();
      const script = screen.getByTestId("faq-schema");
      expect(script).toBeInTheDocument();
      const data = JSON.parse(script.innerHTML);
      expect(data["@type"]).toBe("FAQPage");
    });
  });

  describe("Scenario 5.1/5.2: i18n locale rendering", () => {
    it("renders content from translation keys (locale-agnostic at component level)", async () => {
      await renderFaqSection({ items: ["moq"] });
      expect(
        screen.getByText("Frequently Asked Questions"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("What is the minimum order quantity (MOQ)?"),
      ).toBeInTheDocument();
    });
  });
});
