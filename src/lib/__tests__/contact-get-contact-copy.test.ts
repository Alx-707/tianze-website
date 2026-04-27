import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "@/types/i18n";
import {
  getContactCopy,
  getContactCopyFromMessages,
} from "@/lib/contact/getContactCopy";

const { mockLoadCompleteMessages, mockLoggerWarn } = vi.hoisted(() => ({
  mockLoadCompleteMessages: vi.fn(),
  mockLoggerWarn: vi.fn(),
}));

vi.mock("@/lib/load-messages", () => ({
  loadCompleteMessages: mockLoadCompleteMessages,
}));

vi.mock("@/lib/logger", () => ({
  logger: {
    warn: mockLoggerWarn,
  },
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

  const defaultMessages = {
    underConstruction: {
      pages: {
        contact: {
          title: defaultTranslations.title,
          description: defaultTranslations.description,
          panel: {
            contactTitle: defaultTranslations["panel.contactTitle"],
            email: defaultTranslations["panel.email"],
            phone: defaultTranslations["panel.phone"],
            hoursTitle: defaultTranslations["panel.hoursTitle"],
            weekdays: defaultTranslations["panel.weekdays"],
            saturday: defaultTranslations["panel.saturday"],
            sunday: defaultTranslations["panel.sunday"],
            closed: defaultTranslations["panel.closed"],
            responseTitle: defaultTranslations["panel.responseTitle"],
            responseTimeLabel: defaultTranslations["panel.responseTimeLabel"],
            responseTimeValue: defaultTranslations["panel.responseTimeValue"],
            bestForLabel: defaultTranslations["panel.bestForLabel"],
            bestForValue: defaultTranslations["panel.bestForValue"],
            prepareLabel: defaultTranslations["panel.prepareLabel"],
            prepareValue: defaultTranslations["panel.prepareValue"],
          },
        },
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoadCompleteMessages.mockResolvedValue(defaultMessages);
  });

  it("builds a structured copy model for the given locale", async () => {
    const locale: Locale = "en";

    const copy = await getContactCopy(locale);

    expect(mockLoadCompleteMessages).toHaveBeenCalledWith(locale);

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

  it("falls back to user-readable copy when static messages miss keys", () => {
    const copy = getContactCopyFromMessages({});

    expect(copy.header.title).toBe("Contact Us");
    expect(copy.header.description).toContain("Get in touch");
    expect(copy.panel.hours.closedLabel).toBe("Closed");
    expect(mockLoggerWarn).toHaveBeenCalled();
  });
});
