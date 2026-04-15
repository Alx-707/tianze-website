import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "@/types/i18n";
import { getContactCopy } from "@/lib/contact/getContactCopy";

// Hoisted mock for getTranslationsCached so that module imports pick it up.
const { mockGetTranslationsCached } = vi.hoisted(() => ({
  mockGetTranslationsCached: vi.fn(),
}));

vi.mock("@/lib/i18n/server/getTranslationsCached", () => ({
  getTranslationsCached: mockGetTranslationsCached,
}));

describe("getContactCopy", () => {
  const defaultTranslations = {
    title: "Contact Us",
    description: "Get in touch with our team",
    "panel.contactTitle": "Contact Methods",
    "panel.email": "Email",
    "panel.phone": "Phone",
    "panel.hoursTitle": "Business Hours",
    "panel.weekdays": "Mon - Fri",
    "panel.saturday": "Saturday",
    "panel.sunday": "Sunday",
    "panel.closed": "Closed",
    "panel.responseTitle": "What to expect",
    "panel.responseTimeLabel": "Typical response",
    "panel.responseTimeValue": "Within 24 business hours",
    "panel.bestForLabel": "Best for",
    "panel.bestForValue":
      "RFQs, product specs, MOQ, samples, and lead-time questions",
    "panel.prepareLabel": "Helpful details",
    "panel.prepareValue":
      "Share product type, size/standard, quantity, destination market, and timeline",
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetTranslationsCached.mockResolvedValue(
      (key: string) =>
        defaultTranslations[key as keyof typeof defaultTranslations] || key,
    );
  });

  it("builds a structured copy model for the given locale", async () => {
    const locale: Locale = "en";

    const copy = await getContactCopy(locale);

    expect(mockGetTranslationsCached).toHaveBeenCalledWith({
      locale,
      namespace: "underConstruction.pages.contact",
    });

    expect(copy.header.title).toBe("Contact Us");
    expect(copy.header.description).toBe("Get in touch with our team");

    expect(copy.panel.contact.title).toBe("Contact Methods");
    expect(copy.panel.contact.emailLabel).toBe("Email");
    expect(copy.panel.contact.phoneLabel).toBe("Phone");

    expect(copy.panel.hours.title).toBe("Business Hours");
    expect(copy.panel.hours.weekdaysLabel).toBe("Mon - Fri");
    expect(copy.panel.hours.saturdayLabel).toBe("Saturday");
    expect(copy.panel.hours.sundayLabel).toBe("Sunday");
    expect(copy.panel.hours.closedLabel).toBe("Closed");
    expect(copy.panel.response.title).toBe("What to expect");
    expect(copy.panel.response.responseTimeValue).toBe(
      "Within 24 business hours",
    );
    expect(copy.panel.response.bestForLabel).toBe("Best for");
    expect(copy.panel.response.prepareLabel).toBe("Helpful details");
  });

  it("propagates missing translation keys as-is from the translation function", async () => {
    mockGetTranslationsCached.mockResolvedValue(
      (key: string) => `missing.${key}`,
    );

    const copy = await getContactCopy("en" as Locale);

    expect(copy.header.title).toBe("missing.title");
    expect(copy.header.description).toBe("missing.description");
    expect(copy.panel.hours.closedLabel).toBe("missing.panel.closed");
  });
});
