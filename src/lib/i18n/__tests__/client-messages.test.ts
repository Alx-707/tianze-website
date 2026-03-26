import { describe, expect, it } from "vitest";
import {
  getClientMessageNamespaces,
  pickMessages,
  pickClientMessages,
} from "@/lib/i18n/client-messages";

describe("client message scoping", () => {
  it("keeps only namespaces needed by client islands", () => {
    const scoped = pickClientMessages({
      home: { hero: "server-only" },
      faq: { sectionTitle: "server-only" },
      language: { selectLanguage: "Select Language" },
      navigation: { home: "Home" },
      cookie: { title: "Cookies" },
      common: { close: "Close" },
    });

    expect(scoped).toEqual({
      language: { selectLanguage: "Select Language" },
      navigation: { home: "Home" },
      cookie: { title: "Cookies" },
      common: { close: "Close" },
    });
  });

  it("tracks the intended namespace allowlist", () => {
    expect(getClientMessageNamespaces()).toEqual([
      "accessibility",
      "common",
      "cookie",
      "errors",
      "language",
      "navigation",
      "seo",
    ]);
  });

  it("can scope a page-specific subset when needed", () => {
    const scoped = pickMessages(
      {
        contact: { form: { title: "Contact" } },
        apiErrors: { UNKNOWN_ERROR: "Unknown" },
        home: { hero: "Server only" },
      },
      ["contact", "apiErrors"],
    );

    expect(scoped).toEqual({
      contact: { form: { title: "Contact" } },
      apiErrors: { UNKNOWN_ERROR: "Unknown" },
    });
  });
});
